import { useState, useEffect, useCallback } from 'react';
import { soundManager } from '../utils/soundManager';
import { SKINS_DATA } from '../data/skinsData';
import { SkinDefinition } from '../types';

export interface CargoReward {
  scrap: number;
  skin: SkinDefinition;
}

const STORAGE_CARGO_TIME = 'rustgrade_last_cargo_time';
const CARGO_INTERVAL_SECONDS = 600; // 10 minutes

export function useCargoShipTimer(autoSpawn = true) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [bannerTimeLeft, setBannerTimeLeft] = useState<number>(60);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentReward, setCurrentReward] = useState<CargoReward | null>(null);

  // Generate tactical cargo crate loot
  const generateReward = useCallback((): CargoReward => {
    const candidateSkins = SKINS_DATA.filter(
      (s) => s.price >= 10 && s.price <= 150
    );
    const chosenSkin =
      candidateSkins[Math.floor(Math.random() * candidateSkins.length)] ||
      SKINS_DATA.find((s) => s.id === 'mp5a4') ||
      SKINS_DATA[0];

    const scrapAmount = Number((15 + Math.random() * 35).toFixed(2)); // 15 - 50 Scrap
    return {
      scrap: scrapAmount,
      skin: chosenSkin,
    };
  }, []);

  // Trigger Cargo Ship
  const spawnCargoShip = useCallback(() => {
    setIsActive(true);
    setBannerTimeLeft(60);
    setCurrentReward(generateReward());
    soundManager.play('cargo');
    try {
      localStorage.setItem(STORAGE_CARGO_TIME, Date.now().toString());
    } catch {
      // ignore
    }
  }, [generateReward]);

  // Periodic automatic appearance every 10-12 minutes
  useEffect(() => {
    if (!autoSpawn) return;

    let initialDelay = 120 * 1000; // 2 minutes for first encounter
    try {
      const last = localStorage.getItem(STORAGE_CARGO_TIME);
      if (last) {
        const elapsedSec = (Date.now() - parseInt(last, 10)) / 1000;
        if (elapsedSec < CARGO_INTERVAL_SECONDS) {
          initialDelay = Math.max(5000, (CARGO_INTERVAL_SECONDS - elapsedSec) * 1000);
        }
      }
    } catch {
      // ignore
    }

    const firstTimer = setTimeout(() => {
      spawnCargoShip();
    }, initialDelay);

    const recurringInterval = setInterval(() => {
      spawnCargoShip();
    }, CARGO_INTERVAL_SECONDS * 1000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(recurringInterval);
    };
  }, [autoSpawn, spawnCargoShip]);

  // 60-second countdown for ship presence in waters
  useEffect(() => {
    if (!isActive || isModalOpen) return;

    if (bannerTimeLeft <= 0) {
      setIsActive(false);
      return;
    }

    const timer = setInterval(() => {
      setBannerTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isModalOpen, bannerTimeLeft]);

  const handleBoardShip = useCallback(() => {
    if (!currentReward) {
      setCurrentReward(generateReward());
    }
    setIsModalOpen(true);
  }, [currentReward, generateReward]);

  const handleDismissBanner = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsActive(false);
    soundManager.stop('crack_system');
    soundManager.stop('pipi');
  }, []);

  return {
    isActive,
    bannerTimeLeft,
    isModalOpen,
    currentReward,
    spawnCargoShip,
    handleBoardShip,
    handleDismissBanner,
    handleCloseModal,
  };
}
