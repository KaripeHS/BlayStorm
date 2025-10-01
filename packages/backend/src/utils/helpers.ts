import { randomBytes } from 'crypto';

export function generateRoomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  const bytes = randomBytes(length);

  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

export function calculateXpForLevel(level: number): number {
  // Progressive XP requirement: base * (level ^ 1.5)
  const base = 100;
  return Math.floor(base * Math.pow(level, 1.5));
}

export function calculateLevel(totalXp: number): { level: number; xpForNext: number } {
  let level = 1;
  let xpRequired = calculateXpForLevel(level);

  while (totalXp >= xpRequired) {
    level++;
    xpRequired = calculateXpForLevel(level);
  }

  return {
    level: level - 1,
    xpForNext: xpRequired,
  };
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100 * 10) / 10; // Round to 1 decimal
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeUsername(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}