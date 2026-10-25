import { useState, useEffect, useCallback, useMemo } from 'react';
import { SkinDefinition, UpgradeRound, InventoryItem } from '../types';
import { SKINS_DATA, SKINS_MAP } from '../data/skinsData';
import { soundManager } from '../utils/soundManager';
import { calculateUpgradeRoll, calculateWinChance, generateRandomSeed, sha256 } from '../utils/provablyFair';
import { loadFairState, saveFairState, StoredFairState, saveRoundHistory, loadRoundHistory } from '../utils/storage';
import { useUserStore } from './useUserStore';
import confetti from 'canvas-confetti';

export function useUpgradeStore() {
  const { profile, deductScrap, removeInventoryItems, addSkin, recordRoundResult } = useUserStore();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [scrapSlider, setScrapSlider] = useState<number>(0);
  const [targetSkin, setTargetSkin] = useState<SkinDefinition | null>(() => SKINS_DATA[0] || null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [lastRoundResult, setLastRoundResult] = useState<UpgradeRound | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [roundHistory, setRoundHistory] = useState<UpgradeRound[]>([]);
  const [fairState, setFairState] = useState<StoredFairState | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [wheelOutcome, setWheelOutcome] = useState<'idle' | 'win' | 'lose' | 'golden_win'>('idle');
  const [outcomeSkin, setOutcomeSkin] = useState<SkinDefinition | null>(null);

  // Initialize Fair State & History
  useEffect(() => {
    loadFairState().then(setFairState);
    setRoundHistory(loadRoundHistory());
  }, []);

  // Filter selected items that exist in user inventory
  const selectedInventoryItems = useMemo(() => {
    const invMap = new Map<string, InventoryItem>();
    profile.inventory.forEach((item) => invMap.set(item.instanceId, item));
    return selectedItemIds
      .map((id) => invMap.get(id))
      .filter((item): item is InventoryItem => item !== undefined);
  }, [selectedItemIds, profile.inventory]);

  // Total value of selected items
  const itemsValue = useMemo(() => {
    return selectedInventoryItems.reduce((sum, item) => {
      const skin = SKINS_MAP[item.skinId];
      return sum + (skin ? skin.price : 0);
    }, 0);
  }, [selectedInventoryItems]);

  // Total input value
  const totalInputValue = useMemo(() => {
    return Number((itemsValue + scrapSlider).toFixed(2));
  }, [itemsValue, scrapSlider]);

  // Target skin value
  const targetValue = useMemo(() => {
    return targetSkin ? targetSkin.price : 0;
  }, [targetSkin]);

  // Win probability
  const winProbability = useMemo(() => {
    return calculateWinChance(totalInputValue, targetValue);
  }, [totalInputValue, targetValue]);

  // Safety rating
  const safetyStatus = useMemo(() => {
    if (winProbability >= 75) return { label: 'ОЧЕНЬ БЕЗОПАСНО', color: 'text-success-green', bg: 'bg-green-500/10' };
    if (winProbability >= 50) return { label: 'БЕЗОПАСНО', color: 'text-warning-orange', bg: 'bg-orange-500/10' };
    return { label: 'РИСКОВАННО', color: 'text-primary-red', bg: 'bg-red-500/10' };
  }, [winProbability]);

  // Max scrap allowed on slider is current user balance
  const maxAllowedScrap = profile.balance;

  // Toggle selection of inventory item (up to 8)
  const toggleSelectItem = useCallback((instanceId: string) => {
    if (isSpinning) return;
    setSelectedItemIds((prev) => {
      if (prev.includes(instanceId)) {
        return prev.filter((id) => id !== instanceId);
      }
      if (prev.length >= 8) {
        soundManager.play('codelock_error');
        setStatusMessage('Максимум 8 предметов в одной ставке');
        return prev;
      }
      soundManager.play('item_select');
      return [...prev, instanceId];
    });
  }, [isSpinning]);

  const removeSelectedItem = useCallback((instanceId: string) => {
    if (isSpinning) return;
    setSelectedItemIds((prev) => prev.filter((id) => id !== instanceId));
  }, [isSpinning]);

  const clearSelectedItems = useCallback(() => {
    if (isSpinning) return;
    setSelectedItemIds([]);
    setScrapSlider(0);
  }, [isSpinning]);

  const handleSetScrapSlider = useCallback((val: number) => {
    if (isSpinning) return;
    const clamped = Math.max(0, Math.min(val, profile.balance));
    setScrapSlider(Number(clamped.toFixed(2)));
  }, [isSpinning, profile.balance]);

  // Smart multipliers: X2, X4, X8
  const applyMultiplier = useCallback((mult: 2 | 4 | 8) => {
    if (isSpinning) return;
    const currentInput = totalInputValue > 0 ? totalInputValue : (profile.balance > 0 ? profile.balance : 5);
    const needed = currentInput * mult;

    // Find closest skin in catalog
    let best = SKINS_DATA[0];
    let minDiff = Infinity;
    SKINS_DATA.forEach((skin) => {
      const diff = Math.abs(skin.price - needed);
      if (diff < minDiff) {
        minDiff = diff;
        best = skin;
      }
    });

    setTargetSkin(best);
    soundManager.play('item_select');
  }, [isSpinning, totalInputValue, profile.balance]);

  /**
   * Set Custom Chance %:
   * mode:
   *  - 'skin': selects a skin from catalog matching (input * 95) / chance
   *  - 'slider': if target skin is selected, sets scrap slider to (target * chance) / 95 - itemsValue
   *  - 'auto': chooses best approach
   */
  const applyTargetChance = useCallback((
    chancePercent: number,
    mode: 'auto' | 'skin' | 'slider' = 'auto'
  ) => {
    if (isSpinning) return;
    const clampedChance = Math.min(95.00, Math.max(1.00, chancePercent));

    if (mode === 'slider' && targetSkin) {
      // Calculate required total input: V_needed = (V_target * P) / 95
      const totalNeeded = (targetSkin.price * clampedChance) / 95;
      const scrapNeeded = Math.max(0, totalNeeded - itemsValue);
      const clampedScrap = Math.min(profile.balance, Number(scrapNeeded.toFixed(2)));
      setScrapSlider(clampedScrap);
      soundManager.play('item_select');
      return;
    }

    if (mode === 'skin' || !targetSkin || mode === 'auto') {
      const currentInput = totalInputValue > 0 ? totalInputValue : (profile.balance > 0 ? Math.min(profile.balance, 5) : 5);
      // P = (V_input / V_target) * 95 => V_target = (V_input * 95) / P
      const neededTarget = (currentInput * 95) / clampedChance;

      let best = SKINS_DATA[0];
      let minDiff = Infinity;
      SKINS_DATA.forEach((skin) => {
        const diff = Math.abs(skin.price - neededTarget);
        if (diff < minDiff) {
          minDiff = diff;
          best = skin;
        }
      });

      setTargetSkin(best);

      // If user has balance, also fine-tune slider to match exact chance as close as possible
      if (mode === 'auto' && best) {
        const exactInputNeeded = (best.price * clampedChance) / 95;
        const exactScrapNeeded = Math.max(0, exactInputNeeded - itemsValue);
        if (exactScrapNeeded <= profile.balance) {
          setScrapSlider(Number(exactScrapNeeded.toFixed(2)));
        }
      }

      soundManager.play('item_select');
    }
  }, [isSpinning, targetSkin, itemsValue, totalInputValue, profile.balance]);

  // Execute upgrade spin
  const executeUpgrade = useCallback(async () => {
    if (isSpinning) return;

    if (!targetSkin) {
      soundManager.play('codelock_error');
      setStatusMessage('Выберите предмет для апгрейда справа');
      return;
    }

    if (totalInputValue <= 0) {
      soundManager.play('codelock_error');
      setStatusMessage('Добавьте хотя бы один скин или Scrap в левый слот');
      return;
    }

    if (scrapSlider > profile.balance) {
      soundManager.play('codelock_error');
      setStatusMessage('Недостаточно Scrap на балансе');
      return;
    }

    if (!fairState) return;

    setIsSpinning(true);
    setStatusMessage(null);

    // Play fuse burn before spin starts
    soundManager.play('fuse_burn');

    await new Promise((r) => setTimeout(r, 280));

    const duration = turboMode ? 800 : 3500;
    soundManager.startWheelTicks(duration);

    // Calculate Provably Fair outcome
    const fairResult = await calculateUpgradeRoll(
      fairState.currentServerSeed,
      fairState.clientSeed,
      fairState.nonce,
      winProbability
    );

    // Arrow rotation calculation:
    // The wheel plate is static. The arrow starts at 0° (top) and rotates clockwise.
    // Victory sector spans [0, SectorAngle].
    // Target position is fairResult.landingAngle.
    const targetAngle = fairResult.landingAngle;
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    let delta = ((targetAngle - currentMod) % 360 + 360) % 360;
    if (delta < 30) delta += 360;

    const fullSpins = turboMode ? 3 : 5;
    const nextRotation = wheelRotation + fullSpins * 360 + delta;
    setWheelRotation(nextRotation);

    // Wait for wheel animation
    setTimeout(async () => {
      soundManager.stopWheelTicks();
      setIsSpinning(false);

      if (fairResult.isGoldenWin) {
        // GOLDEN ZONE HIT! X4 MULTIPLIER JACKPOT!
        setWheelOutcome('golden_win');
        setOutcomeSkin(targetSkin);
        soundManager.play('jackpot');
        try {
          confetti({
            particleCount: 220,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFF8DC', '#FFFFFF'],
          });
        } catch {
          // Confetti fallback
        }

        // Add 4x copies of won skin to inventory
        addSkin(targetSkin.id);
        addSkin(targetSkin.id);
        addSkin(targetSkin.id);
        addSkin(targetSkin.id);
      } else if (fairResult.isWin) {
        setWheelOutcome('win');
        setOutcomeSkin(targetSkin);
        soundManager.play('win');
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#4CAF50', '#FFD54F', '#FFFFFF'],
          });
        } catch {
          // Confetti fallback
        }

        // Add won skin to inventory
        addSkin(targetSkin.id);
      } else {
        setWheelOutcome('lose');
        setOutcomeSkin(targetSkin);
        soundManager.play('lose');
      }

      // Automatically reset wheel outcome to 'idle' after 5 seconds
      setTimeout(() => {
        setWheelOutcome('idle');
      }, 5000);

      // Deduct scrap & items
      if (scrapSlider > 0) {
        deductScrap(scrapSlider);
      }
      if (selectedItemIds.length > 0) {
        removeInventoryItems(selectedItemIds);
      }

      // Record round in round history and stats
      const roundRecord: UpgradeRound = {
        id: `rnd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        inputSkinIds: selectedInventoryItems.map((item) => item.skinId),
        inputScrap: scrapSlider,
        inputValue: totalInputValue,
        targetSkinId: targetSkin.id,
        targetValue: targetSkin.price,
        winProbability,
        serverSeed: fairState.currentServerSeed,
        serverSeedHash: fairState.currentServerSeedHash,
        clientSeed: fairState.clientSeed,
        nonce: fairState.nonce,
        roll: fairResult.roll,
        threshold: fairResult.threshold,
        isWin: fairResult.isWin,
        isGoldenWin: fairResult.isGoldenWin,
        landingAngle: fairResult.landingAngle,
      };

      setLastRoundResult(roundRecord);
      // DO NOT show popup modal! Result is shown directly on the wheel
      setShowResultModal(false);
      recordRoundResult(roundRecord);

      const updatedHistory = [roundRecord, ...roundHistory.slice(0, 49)];
      setRoundHistory(updatedHistory);
      saveRoundHistory(updatedHistory);

      // Reset selection
      setSelectedItemIds([]);
      setScrapSlider(0);

      // Prepare NEXT server seed (Commit-Reveal scheme)
      const nextServerSeed = generateRandomSeed(24);
      const nextServerSeedHash = await sha256(nextServerSeed);
      const updatedFair: StoredFairState = {
        currentServerSeed: nextServerSeed,
        currentServerSeedHash: nextServerSeedHash,
        clientSeed: fairState.clientSeed,
        nonce: fairState.nonce + 1,
      };
      setFairState(updatedFair);
      saveFairState(updatedFair);
    }, duration);
  }, [
    isSpinning,
    targetSkin,
    totalInputValue,
    scrapSlider,
    profile.balance,
    fairState,
    turboMode,
    winProbability,
    wheelRotation,
    selectedInventoryItems,
    selectedItemIds,
    roundHistory,
    addSkin,
    deductScrap,
    removeInventoryItems,
    recordRoundResult,
  ]);

  return {
    selectedItemIds,
    selectedInventoryItems,
    scrapSlider,
    maxAllowedScrap,
    targetSkin,
    totalInputValue,
    targetValue,
    winProbability,
    safetyStatus,
    isSpinning,
    turboMode,
    wheelRotation,
    wheelOutcome,
    outcomeSkin,
    lastRoundResult,
    showResultModal,
    roundHistory,
    fairState,
    statusMessage,
    setShowResultModal,
    toggleSelectItem,
    removeSelectedItem,
    clearSelectedItems,
    setScrapSlider: handleSetScrapSlider,
    setTargetSkin,
    setTurboMode,
    applyMultiplier,
    applyTargetChance,
    executeUpgrade,
  };
}
