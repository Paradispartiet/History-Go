# History GO — TEAM WORKFLOW

Standard arbeidsflyt for all utvikling i History GO.

---

## HISTORY_GO_TECHNICAL_ARCHITECTURE.md

Når:
- Før nye teknologistack-, backend-, API-, database- eller språkvalg
- Når et nytt subsystem skal kobles til produksjonsplattformen
- Når eksisterende Supabase-, JavaScript-, TypeScript- eller serverløsninger skal migreres

Bruk:
- Hvilket språk skal denne koden skrives i?
- Hvem eier sannheten: klient, backend, database eller canonical JSON?
- Skal denne funksjonen gå gjennom FastAPI?
- Er Supabase her database/infrastruktur eller applikasjonslogikk?

Regel:
- Klient/browser/app-logikk → TypeScript
- Produksjonsbackend/server/API → Python + FastAPI
- Node scripts/tools → TypeScript
- Muterbar produksjonsdata → PostgreSQL
- Supabase → managed PostgreSQL/Auth/Storage og avgrenset plattforminfrastruktur
- Redaksjonelt canonical innhold → eksisterende JSON/dataformater

Les:
- `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`

---

## SYSTEM_REGISTRY.md

Når:
- Før du rører eksisterende runtime-struktur

Bruk:
- Hvor ligger dette?
- Hvem eier dette i dagens kodebase?

Regel:
- Hvis endringen ikke passer inn her → oppdater SYSTEM_REGISTRY først.

Eksempel:
- Endre ruter
- SYSTEM_REGISTRY → `js/routes.js`
- Jobb kun der.

---

## SYSTEM_MAP.md

Når:
- Når du endrer flyt eller oppførsel

Bruk:
- Hva skjer når brukeren gjør X?
- Hvor i kjeden må vi endre?

Regel:
- Endres event, storage, API eller runtime-flyt → oppdater SYSTEM_MAP.

Eksempel:
- Riktig svar gir ny effekt
- QuizEngine → HGInsights → knowledge/trivia → updateProfile → AHA

---

## README_DEV.md

Når:
- Teamarbeid
- PR
- Feilsøking
- Testing

Før merge:
- Kjør relevante automatiske sjekker for kodeflaten
- `DomainHealthReport.run({ toast: true });` når relevant
- `QuizAudit.run();` når relevant

Minimum manuell quiztest når quiz/progresjonsflyten berøres:
- Start quiz
- Riktig svar
- Knowledge/trivia lagres
- Profil oppdateres

---

## TYPESCRIPT_FIRST_POLICY.md

Når:
- Ny klient-/browserkode opprettes
- En legacy-JavaScript-modul bygges vesentlig om
- TypeScript guard eller annen typecheck stopper en PR
- CI- eller merge-regler for TypeScript/JavaScript skal endres

Regel:
- History GO er TypeScript-first på klienten og i Node-tooling.
- Ny browser-/app-logikk skrives som hovedregel i TypeScript.
- Node-verktøy og scripts skrives i `.ts`/`.mts`.
- Browserkode migreres kontrollert gjennom den etablerte esbuild-strangleren.
- Eksisterende JavaScript kan leve videre som legacy mens det migreres gradvis.
- JSON-data for places, people, quiz, pensum osv. forblir canonical dataformater.
- Ny produksjonsbackend skal ikke skrives i Node/TypeScript som standard; den følger Python/FastAPI-arkitekturen.
- Eksisterende, urelatert typegjeld i legacy-kode skal ikke behandles som ønsket permanent merge-portvakt.
- Reelle nye regresjoner, TypeScript-feil i moderne kode, relevante builds og målrettede kontrakts-/datasjekker skal fortsatt kunne blokkere merge.

Les:
- `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` — overordnet teknisk beslutning
- `docs/TYPESCRIPT_FIRST_POLICY.md` — klient-/Node-policy og TypeScript-CI
- `docs/typescript-migration-plan.md` — operativ browsermigrering
- `TYPESCRIPT_MIGRATION.md` — migreringshistorikk

---

## Backendarbeid

Når:
- Ny API-funksjon, auth, sync, flerbrukerfunksjon eller serverautoritativ logikk skal bygges

Regel:
- Følg `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`.
- Backend = Python + FastAPI.
- Request/response-kontrakter = eksplisitte Pydantic-modeller.
- Muterbar produksjonsdata = PostgreSQL.
- Supabase kan levere Auth/database/storage, men UI skal ikke eie serverregler.
- Sensitive eller komplekse writes skal gjennom servergrensen.
- Ikke opprett en parallell Node-backend uten en eksplisitt arkitekturbeslutning.
- Når `backend/` etableres, skal Python lint/typecheck/tests være egne CI-gates.

---

## README.md

Når:
- Onboarding
- Demo
- Overordnet forståelse

Bruk:
- Forklarer hva systemet er, ikke hvordan hver linje fungerer.

---

## Arbeidsflyt

### A) Avklar arkitektur og eierskap

1. Teknologistack/språk/servergrense → `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`
2. Eksisterende modulansvar → `README/SYSTEM_REGISTRY.md`
3. Eksisterende runtime-flyt → `README/SYSTEM_MAP.md`
4. TypeScript-migrering/CI → `docs/TYPESCRIPT_FIRST_POLICY.md`

Ikke gjett ut fra filendelser eller historiske løsninger.

### B) Gjør endringen

- Endre filen eller laget som faktisk eier ansvaret.
- Ikke hopp mellom moduler uten et eksplisitt integrasjonsbehov.
- Ikke bypass QuizEngine / HGInsights / knowledge-hooks.
- Opprett ny klientprogramlogikk i TypeScript.
- Opprett ny produksjonsbackendlogikk i Python/FastAPI.
- Ikke utvid legacy-JavaScript som permanent arkitekturmønster når funksjonen naturlig kan ligge i TypeScript.
- Ikke flytt canonical JSON-data til database uten dokumentert behov.
- Ikke la UI-filer eie database-, auth- eller serverregler direkte.

### C) Valider

- Kjør de målrettede sjekkene for kodeflaten som faktisk er endret.
- TypeScript-kode skal typechecke.
- Python-backend skal lintes/typecheckes/testes når backendsporet er etablert.
- Bygg og genererte artefakter skal være i sync.
- Kjør relevante domenegates.
- Kjør manuell smoke test når endringen påvirker brukerflyt.
- Ved en bred typecheck-feil: skill mellom ny regresjon og eksisterende, urelatert legacy-baseline før feilen brukes som merge-blokkering.

### D) Oppdater dokumentasjon når kontrakt endres

Dette gjelder blant annet:
- localStorage-key
- event
- public API
- entrypoint
- modul eller ansvar
- språk-/build-/CI-kontrakt
- klient/server-eierskap
- database-sannhetskilde
- auth- eller syncmodell

---

## HUSKEREGEL

**Hvilken teknologi / hvem eier sannheten?** → `HISTORY_GO_TECHNICAL_ARCHITECTURE`  
**Hvor ligger dette i dagens runtime?** → `SYSTEM_REGISTRY`  
**Hva skjer i dagens flyt?** → `SYSTEM_MAP`  
**Hvordan migreres klientkode?** → `TYPESCRIPT_FIRST_POLICY`  
**Trygt å merge?** → `README_DEV` + relevante CI-gates  
**Hva er appen?** → hoved-README

---

## GULLREGEL

**IKKE GJET**  
**SLÅ OPP**