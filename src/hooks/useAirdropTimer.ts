import { useState, useEffect, useCallback } from 'react';
import { soundManager } from '../utils/soundManager';
import { SKINS_DATA } from '../data/skinsData';
import { SkinDefinition } from '../types';
import { useUserStore } from './useUserStore';

export interface AirdropReward {
  scrap: number;
  skin?: SkinDefinition;
}

export function useAirdropTimer(autoSpawn = false) {
  const { claimAirdrop } = useUserStore();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [lastReward, setLastReward] = useState<AirdropReward | null>(null);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);

  // Trigger Airdrop
  const spawnAirdrop = useCallback(() => {
    setIsActive(true);
    setTimeLeft(10);
    soundManager.play('airdrop_plane');
  }, []);

  // Periodic drop (disabled by default when autoSpawn is false)
  useEffect(() => {
    if (!autoSpawn) return;

    // 2 minutes for first drop
    const firstTimeout = setTimeout(() => {
      spawnAirdrop();
    }, 120 * 1000);

    // Recurring interval every ~9 minutes (540s)
    const interval = setInterval(() => {
      spawnAirdrop();
    }, 540 * 1000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [autoSpawn, spawnAirdrop]);

  // 10-second countdown when active
  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      setIsActive(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // Handle clicking the crate
  const handleClaim = useCallback(() => {
    if (!isActive) return;
    setIsActive(false);
    soundManager.play('airdrop_land');

    // 70% Scrap (+20..+50), 30% Rare Skin
    const isSkinDrop = Math.random() < 0.30;
    let reward: AirdropReward;

    if (isSkinDrop) {
      // Pick random skin from Restricted / Mil-Spec / Master
      const candidateSkins = SKINS_DATA.filter(
        (s) => s.rarity === 'restricted' || s.rarity === 'mil-spec' || s.rarity === 'master'
      );
      const wonSkin = candidateSkins[Math.floor(Math.random() * candidateSkins.length)] || SKINS_DATA[10];
      const bonusScrap = Math.floor(10 + Math.random() * 15);
      reward = { scrap: bonusScrap, skin: wonSkin };
      claimAirdrop(bonusScrap, wonSkin);
    } else {
      const scrapReward = Math.floor(20 + Math.random() * 31); // 20 - 50 Scrap
      reward = { scrap: scrapReward };
      claimAirdrop(scrapReward);
    }

    setLastReward(reward);
    setShowClaimModal(true);
  }, [isActive, claimAirdrop]);

  return {
    isActive,
    timeLeft,
    lastReward,
    showClaimModal,
    setShowClaimModal,
    spawnAirdrop,
    handleClaim,
  };
}
