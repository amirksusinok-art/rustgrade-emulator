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
  const now = Date.now();
  return {
    id: `RG_${randomSuffix}`,
    nickname: 'RustSurfer',
    avatar: 'scientist',
    balance: 25.00,
    inventory: [
      {
        instanceId: `inst_${now}_starter_1`,
        skinId: 'duelist_wood_door',
        acquiredAt: now,
      },
      {
        instanceId: `inst_${now}_starter_2`,
        skinId: 'old_prisoner_pants',
        acquiredAt: now + 1,
      },
      {
        instanceId: `inst_${now}_starter_3`,
        skinId: 'dragon_rage_kilt',
        acquiredAt: now + 2,
      },
      {
        instanceId: `inst_${now}_starter_4`,
        skinId: 'camo_netting',
        acquiredAt: now + 3,
      },
      {
        instanceId: `inst_${now}_starter_5`,
        skinId: 'plate_carrier___black',
        acquiredAt: now + 4,
      },
      {
        instanceId: `inst_${now}_starter_6`,
        skinId: 'fire_jacket',
        acquiredAt: now + 5,
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
      const def = getDefaultProfile();
      saveUserProfile(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    // If user's inventory was completely empty or minimal, seed realistic Rust skins
    if (!parsed.inventory || parsed.inventory.length === 0) {
      parsed.inventory = getDefaultProfile().inventory;
      if (!parsed.balance || parsed.balance < 5) parsed.balance = 25.00;
      saveUserProfile(parsed);
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
