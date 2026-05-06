import { z } from 'zod';

export const StartSessionSchema = z.object({
  startedAt: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Heure de début de la session (ISO 8601). Par défaut: l'heure actuelle.",
    ),
  userId: z
    .string()
    .optional()
    .describe("Identifiant de l'utilisateur. Par défaut: 'default'."),
});

export const StopSessionSchema = z.object({
  endedAt: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Heure de fin de la session (ISO 8601). Par défaut: l'heure actuelle.",
    ),
});

export const PauseSessionSchema = z.object({
  pausedAt: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Heure de début de la pause (ISO 8601). Par défaut: l'heure actuelle.",
    ),
});

export const ResumeSessionSchema = z.object({
  resumedAt: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Heure de reprise de la session (ISO 8601). Par défaut: l'heure actuelle.",
    ),
});

export type StartSessionDto = z.infer<typeof StartSessionSchema>;
export type StopSessionDto = z.infer<typeof StopSessionSchema>;
export type PauseSessionDto = z.infer<typeof PauseSessionSchema>;
export type ResumeSessionDto = z.infer<typeof ResumeSessionSchema>;
