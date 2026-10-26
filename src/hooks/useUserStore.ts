import { useState, useEffect, useCallback } from 'react';
import { UserProfile, SkinDefinition, UpgradeRound } from '../types';
import { loadUserProfile, saveUserProfile, getDefaultProfile } from '../utils/storage';
import { SKINS_MAP } from '../data/skinsData';
import { soundManager } from '../utils/soundManager';
import { adminManager } from '../utils/adminManager';

let globalProfile: UserProfile = loadUserProfile();
const listeners = new Set<(profile: UserProfile) => void>();

function updateProfile(newProfile: UserProfile) {
  globalProfile = newProfile;
  saveUserProfile(newProfile);
  listeners.forEach((listener) => listener(globalProfile));
}

export const MAX_STAKING_SLOTS = 8;

export function calculateSkinYield(skinId: string): number {
  const skin = SKINS_MAP[skinId];
  if (!skin) return 0;
  // High-tier Mythics & Legendaries give Massive Clan Yield (Oligarch status):
  if (skin.id === 'titanium_crown_facemask') return 3500.0;
  if (skin.id === 'god_of_rust_chestplate') return 2200.0;
  if (skin.id === 'immortal_skull_mask') return 1500.0;
  if (skin.id === 'platinum_dragon_lr300') return 1000.0;
  if (skin.id === 'dark_matter_ak47') return 700.0;
  if (skin.id === 'helks_golden_facemask') return 400.0;
  if (skin.id === 'golden_dragon_lr300') return 200.0;

  // Calibrated Mid-Tier (Holding 1 mythic beats filling all 8 slots with mid-tiers):
  if (skin.id === 'big_grin') return 12.0;
  if (skin.id === 'glory_facemask') return 8.0;
  if (skin.id === 'tempered_ak47') return 5.0;

  if (skin.price >= 10000) return Number((skin.price * 0.02).toFixed(2));
  if (skin.price >= 1000) return Number((skin.price * 0.008).toFixed(2));
  if (skin.price >= 500) return Number((skin.price * 0.005).toFixed(2));
  if (skin.price >= 50) return Math.max(0.25, Number((skin.price * 0.003).toFixed(2)));
  return 0;
}

export function useUserStore() {
  const [profile, setProfile] = useState<UserProfile>(globalProfile);

  useEffect(() => {
    listeners.add(setProfile);
    return () => {
      listeners.delete(setProfile);
    };
  }, []);

  const addScrap = useCallback((amount: number) => {
    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + amount).toFixed(2)),
      stats: {
        ...globalProfile.stats,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + amount).toFixed(2)),
      },
    };
    updateProfile(updated);
  }, []);

  const deductScrap = useCallback((amount: number): boolean => {
    if (globalProfile.balance < amount) return false;
    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance - amount).toFixed(2)),
    };
    updateProfile(updated);
    return true;
  }, []);

  const addSkin = useCallback((skinId: string) => {
    const instanceId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const updated: UserProfile = {
      ...globalProfile,
      inventory: [
        {
          instanceId,
          skinId,
          acquiredAt: Date.now(),
        },
        ...globalProfile.inventory,
      ],
    };
    updateProfile(updated);
    return instanceId;
  }, []);

  const removeInventoryItem = useCallback((instanceId: string) => {
    const updated: UserProfile = {
      ...globalProfile,
      inventory: globalProfile.inventory.filter((item) => item.instanceId !== instanceId),
    };
    updateProfile(updated);
  }, []);

  const removeInventoryItems = useCallback((instanceIds: string[]) => {
    const idSet = new Set(instanceIds);
    const updated: UserProfile = {
      ...globalProfile,
      inventory: globalProfile.inventory.filter((item) => !idSet.has(item.instanceId)),
    };
    updateProfile(updated);
  }, []);

  const sellInventoryItem = useCallback((instanceId: string) => {
    const item = globalProfile.inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const skin = SKINS_MAP[item.skinId];
    const scrapPrice = skin ? skin.price : 0.14;

    soundManager.play('scrap_sell');

    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + scrapPrice).toFixed(2)),
      inventory: globalProfile.inventory.filter((i) => i.instanceId !== instanceId),
      stats: {
        ...globalProfile.stats,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + scrapPrice).toFixed(2)),
      },
    };
    updateProfile(updated);
  }, []);

  const sellAllSkins = useCallback(() => {
    if (globalProfile.inventory.length === 0) return;

    let totalGain = 0;
    globalProfile.inventory.forEach((item) => {
      const skin = SKINS_MAP[item.skinId];
      totalGain += skin ? skin.price : 0.14;
    });

    totalGain = Number(totalGain.toFixed(2));
    soundManager.play('scrap_sell');

    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + totalGain).toFixed(2)),
      inventory: [],
      stats: {
        ...globalProfile.stats,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + totalGain).toFixed(2)),
      },
    };
    updateProfile(updated);
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    updateProfile({
      ...globalProfile,
      avatar,
    });
  }, []);

  const updateNickname = useCallback((nickname: string) => {
    updateProfile({
      ...globalProfile,
      nickname,
    });
  }, []);

  const claimAirdrop = useCallback((scrapReward: number, wonSkin?: SkinDefinition) => {
    let updatedInv = [...globalProfile.inventory];
    if (wonSkin) {
      updatedInv = [
        {
          instanceId: `inst_airdrop_${Date.now()}`,
          skinId: wonSkin.id,
          acquiredAt: Date.now(),
        },
        ...updatedInv,
      ];
    }

    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + scrapReward).toFixed(2)),
      inventory: updatedInv,
      stats: {
        ...globalProfile.stats,
        totalAirdropsClaimed: globalProfile.stats.totalAirdropsClaimed + 1,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + scrapReward).toFixed(2)),
      },
    };
    updateProfile(updated);
  }, []);

  const redeemPromoCode = useCallback(
    (rawCode: string): { success: boolean; message: string; reward?: number } => {
      const code = rawCode.trim().toUpperCase();
      if (!code) {
        soundManager.play('codelock_error');
        return { success: false, message: 'Введите промокод' };
      }

      if (globalProfile.usedPromoCodes.includes(code)) {
        soundManager.play('codelock_error');
        return { success: false, message: 'Этот промокод уже был активирован' };
      }

      let reward = 0;
      if (code === 'START') {
        reward = 25.00;
      } else if (code === 'RUST2026') {
        reward = 50.00;
      } else if (code === 'SCRAPBOOST') {
        reward = 100.00;
      } else {
        soundManager.play('codelock_error');
        return { success: false, message: 'Неверный промокод' };
      }

      soundManager.play('scrap_sell');
      const updated: UserProfile = {
        ...globalProfile,
        balance: Number((globalProfile.balance + reward).toFixed(2)),
        usedPromoCodes: [...globalProfile.usedPromoCodes, code],
        stats: {
          ...globalProfile.stats,
          totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + reward).toFixed(2)),
        },
      };
      updateProfile(updated);
      return {
        success: true,
        message: `Промокод активирован! +${reward.toFixed(2)} Scrap`,
        reward,
      };
    },
    []
  );

  const recordRoundResult = useCallback((round: UpgradeRound) => {
    let bestDropChance = globalProfile.stats.bestDropChance;
    let bestDropSkinId = globalProfile.stats.bestDropSkinId;

    if (round.isWin) {
      if (bestDropChance === null || round.winProbability < bestDropChance) {
        bestDropChance = round.winProbability;
        bestDropSkinId = round.targetSkinId;
      }
    }

    const updated: UserProfile = {
      ...globalProfile,
      stats: {
        ...globalProfile.stats,
        totalUpgrades: globalProfile.stats.totalUpgrades + 1,
        totalWins: round.isWin ? globalProfile.stats.totalWins + 1 : globalProfile.stats.totalWins,
        totalLosses: !round.isWin ? globalProfile.stats.totalLosses + 1 : globalProfile.stats.totalLosses,
        bestDropChance,
        bestDropSkinId,
      },
    };
    updateProfile(updated);
  }, []);

  const buySkin = useCallback((skinId: string): boolean => {
    const skin = SKINS_MAP[skinId];
    if (!skin) return false;

    if (globalProfile.balance < skin.price) {
      soundManager.play('codelock_error');
      return false;
    }

    soundManager.play('scrap_sell');
    const instanceId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance - skin.price).toFixed(2)),
      inventory: [
        {
          instanceId,
          skinId,
          acquiredAt: Date.now(),
        },
        ...globalProfile.inventory,
      ],
    };
    updateProfile(updated);
    return true;
  }, []);

  // Staking & Skin Lending
  const stakeSkin = useCallback((instanceId: string): boolean => {
    const currentStaked = globalProfile.stakedItems || [];
    if (currentStaked.length >= MAX_STAKING_SLOTS) {
      soundManager.play('codelock_error');
      return false;
    }

    const item = globalProfile.inventory.find((i) => i.instanceId === instanceId);
    if (!item) return false;

    const yieldRate = calculateSkinYield(item.skinId);
    if (yieldRate <= 0) return false;

    // First auto-claim pending yield before adding new skin to prevent timestamp skew
    const now = Date.now();
    const hourlyRate = currentStaked.reduce((s, i) => s + (i.yieldPerHour || 0), 0);
    const elapsedHours = Math.max(0, (now - (globalProfile.lastYieldClaimAt || now)) / 3600000);
    const pendingEarned = Number((hourlyRate * elapsedHours).toFixed(2));

    const newStakedItem = {
      instanceId: item.instanceId,
      skinId: item.skinId,
      stakedAt: now,
      yieldPerHour: yieldRate,
    };

    soundManager.play('barrel_hit');

    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + pendingEarned).toFixed(2)),
      inventory: globalProfile.inventory.filter((i) => i.instanceId !== instanceId),
      stakedItems: [newStakedItem, ...currentStaked],
      lastYieldClaimAt: now,
      stats: {
        ...globalProfile.stats,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + pendingEarned).toFixed(2)),
      },
    };
    updateProfile(updated);
    return true;
  }, []);

  const unstakeSkin = useCallback((instanceId: string): boolean => {
    const currentStaked = globalProfile.stakedItems || [];
    const item = currentStaked.find((i) => i.instanceId === instanceId);
    if (!item) return false;

    const now = Date.now();
    const hourlyRate = currentStaked.reduce((s, i) => s + (i.yieldPerHour || 0), 0);
    const elapsedHours = Math.max(0, (now - (globalProfile.lastYieldClaimAt || now)) / 3600000);
    const pendingEarned = Number((hourlyRate * elapsedHours).toFixed(2));

    soundManager.play('item_select');

    const returnedItem = {
      instanceId: item.instanceId,
      skinId: item.skinId,
      acquiredAt: now,
    };

    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + pendingEarned).toFixed(2)),
      inventory: [returnedItem, ...globalProfile.inventory],
      stakedItems: currentStaked.filter((i) => i.instanceId !== instanceId),
      lastYieldClaimAt: now,
      stats: {
        ...globalProfile.stats,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + pendingEarned).toFixed(2)),
      },
    };
    updateProfile(updated);
    return true;
  }, []);

  const claimStakingYield = useCallback((): number => {
    const currentStaked = globalProfile.stakedItems || [];
    if (currentStaked.length === 0) return 0;

    const now = Date.now();
    const hourlyRate = currentStaked.reduce((s, i) => s + (i.yieldPerHour || 0), 0);
    const elapsedHours = Math.max(0, (now - (globalProfile.lastYieldClaimAt || now)) / 3600000);
    const pendingEarned = Number((hourlyRate * elapsedHours).toFixed(2));

    if (pendingEarned <= 0) return 0;

    soundManager.play('scrap_sell');

    const updated: UserProfile = {
      ...globalProfile,
      balance: Number((globalProfile.balance + pendingEarned).toFixed(2)),
      lastYieldClaimAt: now,
      stats: {
        ...globalProfile.stats,
        totalScrapEarned: Number((globalProfile.stats.totalScrapEarned + pendingEarned).toFixed(2)),
      },
    };
    updateProfile(updated);
    return pendingEarned;
  }, []);

  const updateProfileDetails = useCallback((nickname: string, steamId: string, avatar?: string) => {
    const updated: UserProfile = {
      ...globalProfile,
      nickname: nickname.trim() || globalProfile.nickname,
      steamId: steamId.trim() || globalProfile.steamId || globalProfile.id,
      avatar: avatar || globalProfile.avatar,
    };
    updateProfile(updated);
  }, []);

  const recordCaseOpened = useCallback(() => {
    const updated: UserProfile = {
      ...globalProfile,
      stats: {
        ...globalProfile.stats,
        totalCasesOpened: (globalProfile.stats.totalCasesOpened || 0) + 1,
      },
    };
    updateProfile(updated);
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = getDefaultProfile();
    updateProfile(fresh);
  }, []);

  // Admin Controls
  const setBalance = useCallback((newBalance: number) => {
    const updated: UserProfile = {
      ...globalProfile,
      balance: Math.max(0, Number(newBalance.toFixed(2))),
    };
    updateProfile(updated);
  }, []);

  const clearInventory = useCallback(() => {
    const updated: UserProfile = {
      ...globalProfile,
      inventory: [],
    };
    updateProfile(updated);
  }, []);

  // Global Server Wipe: Take away all money and skins from all players & slots
  const wipeAllPlayers = useCallback(() => {
    // 1. Wipe current active profile: 0 balance, 0 skins, 0 staked skins
    const wipedProfile: UserProfile = {
      ...globalProfile,
      balance: 0.00,
      inventory: [],
      stakedItems: [],
      lastYieldClaimAt: Date.now(),
      stats: {
        totalUpgrades: 0,
        totalWins: 0,
        totalLosses: 0,
        totalScrapEarned: 0,
        totalAirdropsClaimed: 0,
        totalCasesOpened: 0,
        bestDropChance: null,
        bestDropSkinId: null,
        bestDropMultiplier: null,
      },
    };
    updateProfile(wipedProfile);

    // 2. Wipe all admin profile slots (slot_1, slot_2, slot_3)
    const slots: ('slot_1' | 'slot_2' | 'slot_3')[] = ['slot_1', 'slot_2', 'slot_3'];
    slots.forEach((s) => {
      try {
        const slotProfile = adminManager.loadSlotProfile(s);
        slotProfile.balance = 0.00;
        slotProfile.inventory = [];
        slotProfile.stakedItems = [];
        slotProfile.stats = {
          totalUpgrades: 0,
          totalWins: 0,
          totalLosses: 0,
          totalScrapEarned: 0,
          totalAirdropsClaimed: 0,
          totalCasesOpened: 0,
          bestDropChance: null,
          bestDropSkinId: null,
          bestDropMultiplier: null,
        };
        adminManager.saveSlotProfile(s, slotProfile);
      } catch {
        // ignore
      }
    });

    // 3. Wipe all real players from leaderboard registry
    try {
      localStorage.setItem('rustgrade_real_players_v1', JSON.stringify([]));
    } catch {
      // ignore
    }

    // 4. Wipe history
    try {
      localStorage.setItem('rustgrade_history_v1', JSON.stringify([]));
    } catch {
      // ignore
    }

    soundManager.play('pipi');
  }, []);

  const importProfile = useCallback((imported: UserProfile) => {
    if (!imported || typeof imported.balance !== 'number') return;
    const sanitized: UserProfile = {
      ...getDefaultProfile(),
      ...imported,
      inventory: Array.isArray(imported.inventory) ? imported.inventory : [],
    };
    updateProfile(sanitized);
  }, []);

  return {
    profile,
    addScrap,
    deductScrap,
    addSkin,
    removeInventoryItem,
    removeInventoryItems,
    sellInventoryItem,
    sellAllSkins,
    updateAvatar,
    updateNickname,
    updateProfileDetails,
    stakeSkin,
    unstakeSkin,
    claimStakingYield,
    recordCaseOpened,
    claimAirdrop,
    redeemPromoCode,
    buySkin,
    recordRoundResult,
    resetProgress,
    setBalance,
    clearInventory,
    wipeAllPlayers,
    importProfile,
  };
}
