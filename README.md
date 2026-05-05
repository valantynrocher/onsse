# 🛡️ Onsse

**Onsse** (prononcé *[on-sé]*) est un bouclier temporel conçu pour les salariés et les indépendants. Né du besoin de protéger l'équilibre vie pro/vie perso dans des environnements basés sur la "confiance", Onsse automatise le suivi du temps avec une précision chirurgicale et une friction minimale.

## 📖 Philosophie & Vision

*   **L'origine :** Dans les entreprises sans pointage officiel, le surmenage invisible est un risque majeur. Onsse permet d'objectiver son temps de travail pour soi-même.
*   **Le contrat de référence :** Configuré par défaut pour le contrat de **36,11 heures hebdomadaires** (soit 7h 13min 20s par jour).
*   **L'expérience "Zéro Friction" :** L'utilisateur ne remplit pas de tableaux complexes ; il valide ou ajuste des intentions via une interface conversationnelle pilotée par l'IA.

---

## 🛠 Architecture Technique (IA-Native)

Le projet repose sur un couplage fort entre la validation métier et la découverte dynamique par l'IA :

*   **Single Source of Truth (Zod) :** Tous les schémas de données sont définis avec **Zod**. Chaque champ est documenté via `.describe()` pour permettre à l'IA de comprendre le besoin métier sans prompt complexe.
*   **Protocole Hypermédia (HAL-Forms) :** Le backend NestJS génère des `_templates` dynamiques basés sur l'introspection des schémas Zod.
*   **Agent Autonome :** Le chatbot (LLM) ne possède pas de logique métier "hardcodée". Il découvre les actions possibles et les formulaires à remplir en lisant les templates HAL-Forms en temps réel.
*   **Stack :** 
    *   **Backend :** NestJS & PostgreSQL (Prisma/Drizzle).
    *   **Frontend :** Next.js PWA & Shadcn/UI.
    *   **IA :** Vercel AI SDK & OpenAI (GPT-4o-mini).
    *   **Temps :** Luxon (gestion de la base 60).

---

## 🚀 Plan de Développement (MVP)

### Phase 1 : Fondations (Validation & Temps)
- [ ] Implémenter le `TimeEngine` : calcul du solde hebdomadaire en secondes sur la base des 36,11h.
- [ ] Définir les schémas Zod `WorkSession` riches et documentés.
- [ ] Setup de la base de données PostgreSQL.

### Phase 2 : API Hypermédia
- [ ] Développer l'Interceptor NestJS pour transformer les schémas Zod en templates HAL-Forms.
- [ ] Exposer l'endpoint `GET /session/current` avec les actions dynamiques (`start`, `stop`, `pause`).

### Phase 3 : Intelligence Conversationnelle
- [ ] Intégration du Vercel AI SDK.
- [ ] Implémentation du "Tool Calling" dynamique : l'agent doit mapper les entrées utilisateur aux propriétés du `_template` reçu.

### Phase 4 : Frontend & Déploiement
- [ ] Dashboard Next.js avec visualisation du reliquat (format `HH:mm:ss`).
- [ ] Configuration PWA pour un accès "One-tap" sur mobile.
- [ ] Déploiement CI/CD sur Vercel & Railway.

---

## 📈 Roadmap Future

*   **Mode Freelance :** Suivi multi-projets et distinction entre tâches facturables et "support".
*   **Analyse de Charge :** Reporting sur le ressenti de fatigue et check-in émotionnel de fin de journée.
*   **Export Légal :** Génération de rapports pour justifier du respect des temps de repos.

---

## 🤖 Note pour les agents IA (Cursor/Windsurf)

> Lors de l'implémentation, chaque règle métier doit être définie dans un schéma Zod. Ne codez pas de logique de formulaire en dur côté frontend. Utilisez les `_templates` HAL-Forms exposés par le backend pour piloter les interactions du chatbot et les composants UI.
