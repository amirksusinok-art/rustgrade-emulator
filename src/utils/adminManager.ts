import { UserProfile } from '../types';
import { getDefaultProfile, loadUserProfile, saveUserProfile } from './storage';

export interface AdminRiggingState {
  forceNextOutcome: 'win' | 'lose' | null;
  riggedFurnace: boolean;
  wheelSpeed: number; // in seconds, default 3.5
}

export interface ProfileSlotInfo {
  slotId: 'slot_1' | 'slot_2' | 'slot_3';
  label: string;
  nickname: string;
  balance: number;
  inventoryCount: number;
  isActive: boolean;
}

const ADMIN_AUTH_KEY = 'rustgrade_admin_authenticated_session';
const ADMIN_RIG_KEY = 'rustgrade_admin_rigging_v1';
const ACTIVE_SLOT_KEY = 'rustgrade_active_slot_id';

let adminRigging: AdminRiggingState = {
  forceNextOutcome: null,
  riggedFurnace: false,
  wheelSpeed: 3.5,
};

// Try restoring rigging from session or storage if available
try {
  const saved = sessionStorage.getItem(ADMIN_RIG_KEY);
  if (saved) {
    adminRigging = { ...adminRigging, ...JSON.parse(saved) };
  }
} catch {
  // ignore
}

const listeners = new Set<(state: AdminRiggingState) => void>();

function notifyRiggingChanged() {
  try {
    sessionStorage.setItem(ADMIN_RIG_KEY, JSON.stringify(adminRigging));
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn({ ...adminRigging }));
}

export const adminManager = {
  // --- 1. Authentication ---
  isAdmin(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  },

  login(password: string): boolean {
    const clean = password.trim().toUpperCase();
    if (clean === 'РАСТЕНОК12345') {
      try {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  },

  logout(): void {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // ignore
    }
  },

  // --- 2. Rigging Controls ---
  getRigging(): AdminRiggingState {
    return { ...adminRigging };
  },

  subscribe(fn: (state: AdminRiggingState) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setForceNextOutcome(outcome: 'win' | 'lose' | null): void {
    adminRigging.forceNextOutcome = outcome;
    notifyRiggingChanged();
  },

  consumeForceNextOutcome(): 'win' | 'lose' | null {
    const current = adminRigging.forceNextOutcome;
    if (current !== null) {
      adminRigging.forceNextOutcome = null;
      notifyRiggingChanged();
    }
    return current;
  },

  setRiggedFurnace(enabled: boolean): void {
    adminRigging.riggedFurnace = enabled;
    notifyRiggingChanged();
  },

  setWheelSpeed(seconds: number): void {
    adminRigging.wheelSpeed = Math.max(0.2, Math.min(6.0, Number(seconds.toFixed(2))));
    notifyRiggingChanged();
  },

  // --- 3. Profile Slots Management ---
  getActiveSlotId(): 'slot_1' | 'slot_2' | 'slot_3' {
    if (typeof window === 'undefined') return 'slot_1';
    return (localStorage.getItem(ACTIVE_SLOT_KEY) as 'slot_1' | 'slot_2' | 'slot_3') || 'slot_1';
  },

  setActiveSlotId(slotId: 'slot_1' | 'slot_2' | 'slot_3'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
  },

  getSlotStorageKey(slotId: 'slot_1' | 'slot_2' | 'slot_3'): string {
    return slotId === 'slot_1' ? 'rustgrade_emulator_v1' : `rustgrade_emulator_${slotId}`;
  },

  loadSlotProfile(slotId: 'slot_1' | 'slot_2' | 'slot_3'): UserProfile {
    if (typeof window === 'undefined') return getDefaultProfile();
    const key = this.getSlotStorageKey(slotId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const def = getDefaultProfile();
        def.nickname = slotId === 'slot_1' ? 'RustSurfer' : slotId === 'slot_2' ? 'RustyRaider' : 'Clansman';
        def.id = `RG_${slotId.toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
        return def;
      }
      return JSON.parse(raw);
    } catch {
      return getDefaultProfile();
    }
  },

  saveSlotProfile(slotId: 'slot_1' | 'slot_2' | 'slot_3', profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    const key = this.getSlotStorageKey(slotId);
    localStorage.setItem(key, JSON.stringify(profile));
  },

  getAllSlots(): ProfileSlotInfo[] {
    const activeSlot = this.getActiveSlotId();
    const slots: ('slot_1' | 'slot_2' | 'slot_3')[] = ['slot_1', 'slot_2', 'slot_3'];

    return slots.map((s, idx) => {
      const p = this.loadSlotProfile(s);
      return {
        slotId: s,
        label: `Профиль ${idx + 1}`,
        nickname: p.nickname || `Игрок ${idx + 1}`,
        balance: p.balance,
        inventoryCount: Array.isArray(p.inventory) ? p.inventory.length : 0,
        isActive: s === activeSlot,
      };
    });
  },

  updateSlotBalance(slotId: 'slot_1' | 'slot_2' | 'slot_3', newBalance: number): UserProfile {
    const prof = this.loadSlotProfile(slotId);
    prof.balance = Math.max(0, Number(newBalance.toFixed(2)));
    this.saveSlotProfile(slotId, prof);
    return prof;
  },

  adjustSlotBalance(slotId: 'slot_1' | 'slot_2' | 'slot_3', delta: number): UserProfile {
    const prof = this.loadSlotProfile(slotId);
    prof.balance = Math.max(0, Number((prof.balance + delta).toFixed(2)));
    this.saveSlotProfile(slotId, prof);
    return prof;
  },

  resetSlot(slotId: 'slot_1' | 'slot_2' | 'slot_3'): UserProfile {
    const def = getDefaultProfile();
    def.nickname = slotId === 'slot_1' ? 'RustSurfer' : slotId === 'slot_2' ? 'RustyRaider' : 'Clansman';
    def.id = `RG_${slotId.toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    this.saveSlotProfile(slotId, def);
    return def;
  },
};
