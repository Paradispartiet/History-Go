# 📚 History GO – Dokumentasjon

## Start her
- `README.md` — Overordnet inngang til prosjektet
- `README/README.md` — Hovedoversikt for History GO-spillet
- `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` — **Canonical teknisk målarkitektur og språk-/plattformdeling**

## System & arkitektur
- `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` — Overordnet teknisk beslutning: TypeScript-klient, Python/FastAPI-backend, PostgreSQL/Supabase og JSON-data
- `README/SYSTEM_REGISTRY.md` — Kontrakter, eierskap og regler for dagens runtime
- `README/SYSTEM_MAP.md` — Arkitektur, flyter og modulkart for dagens runtime
- `ONTOLOGY.md` — Begreps- og kunnskapsmodell
- `docs/TYPESCRIPT_FIRST_POLICY.md` — TypeScript-policy for klient/browser og Node-tooling samt CI/merge-prinsipp
- `docs/typescript-migration-plan.md` — Operativ plan for gradvis migrering av browser-runtime til TypeScript
- `TYPESCRIPT_MIGRATION.md` — Historisk migreringsjournal

### Dokumentprioritet ved tekniske arkitekturvalg
1. `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`
2. `docs/TYPESCRIPT_FIRST_POLICY.md`
3. `docs/typescript-migration-plan.md`
4. relevante domene-/backendkontrakter
5. `TYPESCRIPT_MIGRATION.md` som historikk

## Backend & sosial
- `docs/HG_SOCIAL_MEET_BACKEND_ROADMAP.md` — Produksjonsroadmap og safety gates for Social Meet / Spotmeeting
- `docs/social-meet-backend.md` — Eksisterende Supabase/PostgreSQL-grunnmur og adapterhistorikk
- `docs/HG_SOCIAL_BACKEND_CONTRACT.md` — Social backend-domenegrense

Disse dokumentene beskriver eksisterende implementasjon og domenekrav **innenfor** den overordnede målarkitekturen. Ved konflikt om teknologistack eller servereierskap gjelder `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`.

## Produkt & visjon
- `IDE_BIBLE.md` — Idé, visjon og strategi
- `docs/HISTORY_GO_PRODUCT_MAP.md` — Produktkart og ferdigstillelseskart
- `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md` — Kjent gap mellom bygget system og spillbar ferdig app

## Progresjon & læring
- `README/README.pensum.md` — Emner, fagkart og pensum
- `README/nextupREADME.md` — NextUp / UI-flyt

## Endringer
- `CHANGELOG.FULL.md` — Full historikk

## Arbeidsform
- `README/TEAM_WORKFLOW.md` — Hvordan prosjektet utvikles og hvilke dokumenter som styrer ulike beslutninger