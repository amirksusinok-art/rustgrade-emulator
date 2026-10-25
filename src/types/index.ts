export type ItemRarity = 
  | 'contraband' 
  | 'master' 
  | 'classified' 
  | 'restricted' 
  | 'mil-spec' 
  | 'industrial';

export interface SkinDefinition {
  id: string;
  name: string;
  type: string;
  price: number;
  rarity: ItemRarity;
  iconUrl: string;
  localFile: string;
}

export interface InventoryItem {
  instanceId: string;
  skinId: string;
  acquiredAt: number;
}

export interface StakedSkinItem {
  instanceId: string;
  skinId: string;
  stakedAt: number;
  yieldPerHour: number;
}

export interface UserStats {
  totalUpgrades: number;
  totalWins: number;
  totalLosses: number;
  totalScrapEarned: number;
  totalAirdropsClaimed: number;
  totalCasesOpened?: number;
  bestDropChance: number | null;
  bestDropSkinId: string | null;
  bestDropMultiplier?: number | null;
}

export interface UserProfile {
  id: string;
  steamId?: string;
  nickname: string;
  avatar: string;
  balance: number;
  inventory: InventoryItem[];
  stakedItems?: StakedSkinItem[];
  lastYieldClaimAt?: number;
  stats: UserStats;
  usedPromoCodes: string[];
}

export interface UpgradeRound {
  id: string;
  timestamp: number;
  inputSkinIds: string[];
  inputScrap: number;
  inputValue: number;
  targetSkinId: string;
  targetValue: number;
  winProbability: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  roll: number;
  threshold: number;
  isWin: boolean;
  landingAngle: number;
}

export interface LiveDrop {
  id: string;
  botName: string;
  avatar: string;
  skin: SkinDefinition;
  chance: number;
  timestamp: number;
}

export type AvatarId = 'scientist' | 'naked' | 'big_grin' | 'wolf';

export interface CaseItem {
  skinId: string;
  weight: number; // probability weight
}

export interface CaseDefinition {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  badge: string;
  color: string;
  glowColor: string;
  image: string;
  isFree?: boolean;
  freeConditionText?: string;
  items: CaseItem[];
}
