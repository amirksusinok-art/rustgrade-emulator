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
    inventory: [],
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
      const def = getDefaultProfile();
      saveUserProfile(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.inventory)) {
      parsed.inventory = [];
    }
    // One-time cleanup of old hardcoded starter test skins
    if (!localStorage.getItem('rustgrade_starter_cleaned_v2')) {
      localStorage.setItem('rustgrade_starter_cleaned_v2', 'true');
      parsed.inventory = parsed.inventory.filter(
        (i: { instanceId?: string }) => !i.instanceId || !i.instanceId.includes('_starter_')
      );
      if (parsed.balance >= 20 && parsed.inventory.length === 0) {
        parsed.balance = 5.00;
      }
      saveUserProfile(parsed);
    }
    if (typeof parsed.balance !== 'number' || isNaN(parsed.balance)) {
      parsed.balance = 5.00;
    }
    return parsed;
  } catch {
    return getDefaultProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[Storage] Failed to save profile:', e);
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
    console.warn('[Storage] Failed to save history:', e);
  }
}

export async function loadFairState(): Promise<StoredFairState> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(FAIR_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
  }

  const serverSeed = generateRandomSeed(24);
  const serverSeedHash = await sha256(serverSeed);
  const clientSeed = generateRandomSeed(16);

  const state: StoredFairState = {
    currentServerSeed: serverSeed,
    currentServerSeedHash: serverSeedHash,
    clientSeed,
    nonce: 1,
  };

  saveFairState(state);
  return state;
}

export function saveFairState(state: StoredFairState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAIR_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[Storage] Failed to save fair state:', e);
  }
}
