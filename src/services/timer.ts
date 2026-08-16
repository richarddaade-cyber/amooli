/**
 * Server-Authoritative Timer & Test Session Rules
 */

export interface TimerStatus {
  totalSeconds: number;
  remainingSeconds: number;
  isExpired: boolean;
  formattedTime: string;
  percentRemaining: number;
}

export function calculateTimerStatus(startedAtIso: string, durationMinutes: number): TimerStatus {
  const startedAt = new Date(startedAtIso).getTime();
  const totalSeconds = Math.max(1, durationMinutes * 60);
  const expiresAt = startedAt + totalSeconds * 1000;
  const now = Date.now();

  const remainingMs = expiresAt - now;
  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const isExpired = remainingSeconds <= 0;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const percentRemaining = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  return {
    totalSeconds,
    remainingSeconds,
    isExpired,
    formattedTime,
    percentRemaining,
  };
}

/**
 * Access Code Generator
 * Generates human-friendly 6-character access codes (e.g. Q7K4P9)
 * Excludes easily confused characters: 0, O, 1, I, L
 */
export function generateAccessCode(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
