import { UserProfile, UpgradeRound } from '../types';
import { generateRandomSeed, sha256 } from './provablyFair';

const STORAGE_KEY = 'rustgrade_emulator_v1';
const HISTORY_KEY = 'rustgrade_history_v1';
const FAIR_KEY = 'rustgrade_fair_v1';

export interface StoredFairState {
  currentServerSeed: string;
  currentServerSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export function getDefaultProfile(): UserProfile {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return {
    id: `RG_${randomSuffix}`,
    nickname: 'RustSurfer',
    avatar: 'scientist',
    balance: 5.00,
    inventory: [
      {
        instanceId: `inst_${Date.now()}_starter_1`,
        skinId: 'cloth',
        acquiredAt: Date.now(),
      },
      {
        instanceId: `inst_${Date.now()}_starter_2`,
        skinId: 'blue_cap',
        acquiredAt: Date.now(),
      },
    ],
    stats: {
      totalUpgrades: 0,
      totalWins: 0,
      totalLosses: 0,
      totalScrapEarned: 0,
      totalAirdropsClaimed: 0,
      bestDropChance: null,
      bestDropSkinId: null,
    },
    usedPromoCodes: [],
  };
}

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultProfile();
      saveUserProfile(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultProfile(),
      ...parsed,
      stats: {
        ...getDefaultProfile().stats,
        ...(parsed.stats || {}),
      },
    };
  } catch (e) {
    console.error('[Storage] Failed to load profile, resetting:', e);
    const initial = getDefaultProfile();
    saveUserProfile(initial);
    return initial;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('[Storage] Failed to save profile:', e);
  }
}

export async function initFairState(): Promise<StoredFairState> {
  const serverSeed = generateRandomSeed(24);
  const serverSeedHash = await sha256(serverSeed);
  const clientSeed = generateRandomSeed(12);
  const state: StoredFairState = {
    currentServerSeed: serverSeed,
    currentServerSeedHash: serverSeedHash,
    clientSeed,
    nonce: 1,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAIR_KEY, JSON.stringify(state));
  }
  return state;
}

export async function loadFairState(): Promise<StoredFairState> {
  if (typeof window === 'undefined') return initFairState();
  try {
    const raw = localStorage.getItem(FAIR_KEY);
    if (!raw) return await initFairState();
    const parsed = JSON.parse(raw);
    if (!parsed.currentServerSeed || !parsed.currentServerSeedHash) {
      return await initFairState();
    }
    return parsed;
  } catch {
    return await initFairState();
  }
}

export function saveFairState(state: StoredFairState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAIR_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[Storage] Failed to save fair state:', e);
  }
}

export function loadRoundHistory(): UpgradeRound[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRoundHistory(history: UpgradeRound[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('[Storage] Failed to save history:', e);
  }
}
