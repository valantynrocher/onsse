import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId = 'default' } = (await req.json()) as {
    messages: unknown[];
    userId?: string;
  };

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `Tu es Onsse, un assistant conversationnel de suivi du temps de travail.
Le contrat de référence est de 36h11 par semaine, soit 7h13m20s (26 000 secondes) par jour.
Tu parles uniquement en français.
Tu interprètes naturellement les messages de l'utilisateur pour :
- Démarrer une session de travail ("je commence", "je démarre", "j'arrive", etc.)
- Terminer une session ("je pars", "j'arrête", "fin de journée", etc.)
- Mettre en pause ("pause", "je m'absente", "déjeuner", etc.)
- Reprendre ("je reprends", "de retour", "fin de pause", etc.)
- Obtenir le solde d'heures ("combien j'ai fait ?", "mon solde", "suis-je en avance ?", etc.)
Utilise toujours les outils disponibles pour interagir avec le système avant de répondre.
Présente les soldes de manière lisible (ex: "+01:23:45" signifie 1h23m45s d'avance).`,
    messages: messages as Parameters<typeof streamText>[0]['messages'],
    tools: {
      getStatus: tool({
        description:
          "Obtenir le statut de la session en cours, le solde du jour et le solde de la semaine.",
        parameters: z.object({}),
        execute: async () => {
          const res = await fetch(
            `${API_URL}/session/current?userId=${encodeURIComponent(userId)}`,
          );
          if (!res.ok) return { error: `Erreur API: ${res.status}` };
          return res.json();
        },
      }),

      startSession: tool({
        description: "Démarrer une nouvelle session de travail.",
        parameters: z.object({
          startedAt: z
            .string()
            .datetime()
            .optional()
            .describe(
              "Heure de début au format ISO 8601. Par défaut: maintenant.",
            ),
        }),
        execute: async ({ startedAt }) => {
          const res = await fetch(`${API_URL}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, startedAt }),
          });
          const data = (await res.json()) as object;
          if (!res.ok) return { error: data };
          return data;
        },
      }),

      stopSession: tool({
        description: "Terminer la session de travail en cours.",
        parameters: z.object({
          endedAt: z
            .string()
            .datetime()
            .optional()
            .describe(
              "Heure de fin au format ISO 8601. Par défaut: maintenant.",
            ),
        }),
        execute: async ({ endedAt }) => {
          const res = await fetch(
            `${API_URL}/session/stop?userId=${encodeURIComponent(userId)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endedAt }),
            },
          );
          const data = (await res.json()) as object;
          if (!res.ok) return { error: data };
          return data;
        },
      }),

      pauseSession: tool({
        description: "Mettre en pause la session de travail en cours.",
        parameters: z.object({
          pausedAt: z
            .string()
            .datetime()
            .optional()
            .describe(
              "Heure de début de pause au format ISO 8601. Par défaut: maintenant.",
            ),
        }),
        execute: async ({ pausedAt }) => {
          const res = await fetch(
            `${API_URL}/session/pause?userId=${encodeURIComponent(userId)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pausedAt }),
            },
          );
          const data = (await res.json()) as object;
          if (!res.ok) return { error: data };
          return data;
        },
      }),

      resumeSession: tool({
        description: "Reprendre une session de travail en pause.",
        parameters: z.object({
          resumedAt: z
            .string()
            .datetime()
            .optional()
            .describe(
              "Heure de reprise au format ISO 8601. Par défaut: maintenant.",
            ),
        }),
        execute: async ({ resumedAt }) => {
          const res = await fetch(
            `${API_URL}/session/resume?userId=${encodeURIComponent(userId)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resumedAt }),
            },
          );
          const data = (await res.json()) as object;
          if (!res.ok) return { error: data };
          return data;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
