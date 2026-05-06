import { WorkSession } from '@prisma/client';

/** Contrat : 7h 13m 20s par jour = 26 000 secondes */
export const DAILY_TARGET_SECONDS = 26_000;

/** Contrat : 36h 6m 40s par semaine = 130 000 secondes (≈ 36,11h) */
export const WEEKLY_TARGET_SECONDS = DAILY_TARGET_SECONDS * 5;

export class TimeEngine {
  /** Formate un nombre de secondes (positif ou négatif) en ±HH:mm:ss */
  static formatDuration(totalSeconds: number): string {
    const sign = totalSeconds < 0 ? '-' : '+';
    const abs = Math.abs(Math.round(totalSeconds));
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Calcule la durée effective d'une session en secondes
   * (durée totale − pauses cumulées).
   */
  static sessionDurationSeconds(session: WorkSession): number {
    const end = session.endedAt ?? new Date();
    const totalMs = end.getTime() - session.startedAt.getTime();
    return Math.max(0, Math.floor(totalMs / 1000) - session.pauseDuration);
  }

  /** Calcule le solde du jour : travaillé − cible journalière. */
  static dailyBalanceSeconds(sessions: WorkSession[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = sessions.filter(
      (s) => s.startedAt >= today && s.startedAt < tomorrow,
    );

    const worked = todaySessions.reduce(
      (acc, s) => acc + this.sessionDurationSeconds(s),
      0,
    );
    return worked - DAILY_TARGET_SECONDS;
  }

  /** Calcule le solde de la semaine courante (lundi→vendredi). */
  static weeklyBalanceSeconds(sessions: WorkSession[]): number {
    const now = new Date();
    const monday = new Date(now);
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon
    monday.setDate(now.getDate() - day);
    monday.setHours(0, 0, 0, 0);

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const weekSessions = sessions.filter(
      (s) => s.startedAt >= monday && s.startedAt < saturday,
    );

    const workedDays = new Set(
      weekSessions.map((s) => s.startedAt.toDateString()),
    ).size;

    const worked = weekSessions.reduce(
      (acc, s) => acc + this.sessionDurationSeconds(s),
      0,
    );

    return worked - workedDays * DAILY_TARGET_SECONDS;
  }
}
