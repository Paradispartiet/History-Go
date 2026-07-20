# History GO — TEAM WORKFLOW

Standard arbeidsflyt for all utvikling i History GO.

---

## SYSTEM_REGISTRY.md
Når:
- Før du rører noe som helst.

Bruk:
- Hvor ligger dette?
- Hvem eier dette?

Regel:
- Hvis endringen ikke passer inn her → oppdater SYSTEM_REGISTRY først.

Eksempel:
- Endre ruter
- SYSTEM_REGISTRY → js/routes.js
- Jobb kun der.

---

## SYSTEM_MAP.md
Når:
- Når du endrer flyt eller oppførsel.

Bruk:
- Hva skjer når brukeren gjør X?
- Hvor i kjeden må vi endre?

Regel:
- Endres event, storage eller API → oppdater SYSTEM_MAP.

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
DomainHealthReport.run({ toast: true });
QuizAudit.run();

Minimum test:
- Start quiz
- Riktig svar
- Knowledge/trivia lagres
- Profil oppdateres

---

## TYPESCRIPT_FIRST_POLICY.md
Når:
- Ny programkode opprettes
- En legacy-JavaScript-modul bygges vesentlig om
- TypeScript guard eller annen typecheck stopper en PR
- CI- eller merge-regler for kode skal endres

Regel:
- History GO er TypeScript-first.
- Ny programlogikk skrives som hovedregel i TypeScript.
- Node-verktøy og scripts skrives i `.ts`/`.mts`.
- Browserkode migreres kontrollert gjennom den etablerte esbuild-strangleren.
- Eksisterende JavaScript kan leve videre som legacy mens det migreres gradvis.
- JSON-data for places, people, quiz, pensum osv. forblir canonical dataformater.
- Eksisterende, urelatert typegjeld i legacy-kode skal ikke behandles som ønsket permanent merge-portvakt.
- Reelle nye regresjoner, TypeScript-feil i moderne kode, relevante builds og målrettede kontrakts-/datasjekker skal fortsatt kunne blokkere merge.

Les:
- `docs/TYPESCRIPT_FIRST_POLICY.md` — overordnet beslutning
- `docs/typescript-migration-plan.md` — operativ migreringsmetode
- `TYPESCRIPT_MIGRATION.md` — migreringshistorikk

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

A) Pek på dokument
- Ref: SYSTEM_REGISTRY §2 – routes → js/routes.js
- Ref: SYSTEM_MAP §3.2–3.4
- Ved språkvalg, TypeScript-migrering eller typecheck/CI → `docs/TYPESCRIPT_FIRST_POLICY.md`

B) Gjør endringen
- Endre kun fil som eier ansvaret
- Ikke hopp mellom moduler
- Ikke bypass QuizEngine / HGInsights / knowledge-hooks
- Opprett ny programlogikk i TypeScript når det ikke finnes en dokumentert grunn til noe annet
- Ikke utvid legacy-JavaScript som permanent arkitekturmønster når funksjonen naturlig kan ligge i TypeScript

C) Valider
- Kjør de målrettede sjekkene for kodeflaten som faktisk er endret
- TypeScript-kode skal typechecke
- Bygg og genererte artefakter skal være i sync
- DomainHealthReport
- QuizAudit
- Manuell test
- Ved en bred typecheck-feil: skill mellom ny regresjon og eksisterende, urelatert legacy-baseline før feilen brukes som merge-blokkering

D) Oppdater dokumentasjon kun hvis kontrakt endres
- localStorage-key
- event
- public API
- entrypoint
- modul eller ansvar
- språk-/build-/CI-kontrakt

---

## HUSKEREGEL
Hvor? → SYSTEM_REGISTRY  
Hva skjer? → SYSTEM_MAP  
Hvilket språk / hvilken typecheck-policy? → TYPESCRIPT_FIRST_POLICY  
Trygt å merge? → README_DEV  
Hva er appen? → README

---

## GULLREGEL
IKKE GJET  
SLÅ OPP
