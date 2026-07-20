# St. Hallvard kirke og kloster people batch 1 validation

Dato: 2026-07-20

## Eksisterende dekning før batchen

- Ingen eksisterende people-ankere funnet ved materialisering.

## Canonical audit og faktiske handlinger

- `kjell_lund` — **created_new** — `people/by/oslo/st_hallvard_kirke_kloster/kjell_lund.json`
- `nils_slaatto` — **created_new** — `people/by/oslo/st_hallvard_kirke_kloster/nils_slaatto.json`
- `johan_castricum` — **created_new** — `people/historie/oslo/st_hallvard_kirke_kloster/johan_castricum.json`

Fersk canonical scan fant ingen eksisterende personrecord for noen av de tre kandidatene. Manifestet fikk derfor nøyaktig tre nye enkeltfiler.

## Streng stedsgate

- Kjell Lund og Nils Slaatto: dokumenterte arkitekter for selve kirke- og klosteranlegget.
- Johan Castricum: dokumentert sogneprest og pådriver for prosjektet; SNL beskriver det konkrete samarbeidet med Kjell Lund om å bygge klosteret på Enerhaugen.

Alle koblingene gjelder den konkrete etableringen eller utformingen av det fysiske anlegget. Generelle arkitektur- eller katolisismeassosiasjoner er ikke tilstrekkelige.

## Kilder

- Riksantikvaren: fredningen av St. Hallvard kirke og kloster.
- Store norske leksikon: St. Hallvard kirke og kloster.
- Den katolske kirke: St. Hallvard menighets historie.
- Norsk biografisk leksikon / Norsk kunstnerleksikon: Kjell Lund og Nils Slaatto.

## Materialisering og validering

Materializeren:

- fant ingen eksisterende people-ankere for stedet
- fant ingen tvetydige eller eksisterende canonical personmatcher
- opprettet bare de tre nye enkeltfilene
- regenererte `data/Civication/historyPeople_index.json`
- kjørte `bash scripts/check-people.sh` med success
- kjørte `git diff --check`
- fjernet one-shot-scriptet og gjenopprettet ordinær `data-checks.yml` før publisering

Den publiserte data-headen skal i tillegg passere ordinær GitHub Actions `People data` og `Places data` før merge.
