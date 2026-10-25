/**
 * Rustgrade Provably Fair Cryptographic Engine (HMAC-SHA256)
 */

export interface FairResult {
  isWin: boolean;
  roll: number;
  threshold: number;
  landingAngle: number;
  hash: string;
}

export function generateRandomSeed(byteLength: number = 24): string {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256(message: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function calculateUpgradeRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  winProbability: number
): Promise<FairResult> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(serverSeed),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const message = enc.encode(`${clientSeed}:${nonce}`);
  const signature = await crypto.subtle.sign('HMAC', key, message);
  const hashArray = Array.from(new Uint8Array(signature));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // First 13 hex characters = 52 bits of roll
  const rollHex = hexHash.slice(0, 13);
  const roll = parseInt(rollHex, 16);
  const max52Bits = 4503599627370496; // 2^52

  const pScaled = Math.round(winProbability * 1000000);
  const threshold = Math.floor((pScaled * max52Bits) / 100000000);

  const isWin = roll < threshold;
  const landingRatio = roll / max52Bits;
  const landingAngle = landingRatio * 360; // 0° - 360°

  return {
    isWin,
    roll,
    threshold,
    landingAngle,
    hash: hexHash,
  };
}

export function calculateWinChance(inputValue: number, targetValue: number): number {
  if (targetValue <= 0 || inputValue <= 0) return 0;
  // Formula: P = min(79.99, max(1.00, (V_input / V_target) * 0.95 * 100))
  const rawP = (inputValue / targetValue) * 0.95 * 100;
  const clamped = Math.min(79.99, Math.max(1.00, rawP));
  return Number(clamped.toFixed(2));
}
