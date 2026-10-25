import { useState, useEffect, useCallback } from 'react';
import { UserProfile, SkinDefinition, UpgradeRound } from '../types';
import { loadUserProfile, saveUserProfile, getDefaultProfile } from '../utils/storage';
import { SKINS_MAP } from '../data/skinsData';
import { soundManager } from '../utils/soundManager';

let globalProfile: UserProfile = loadUserProfile();
const listeners = new Set<(profile: UserProfile) => void>();

function updateProfile(newProfile: UserProfile) {
  globalProfile = newProfile;
  saveUserProfile(newProfile);
  listeners.forEach((listener) => listener(globalProfile));
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

  const resetProgress = useCallback(() => {
    const fresh = getDefaultProfile();
    updateProfile(fresh);
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
    claimAirdrop,
    redeemPromoCode,
    buySkin,
    recordRoundResult,
    resetProgress,
  };
}
