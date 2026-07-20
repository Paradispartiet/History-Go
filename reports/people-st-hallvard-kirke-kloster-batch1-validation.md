# St. Hallvard kirke og kloster people batch 1 validation

Dato: 2026-07-20

## Eksisterende dekning før batchen

- Ingen eksisterende people-ankere funnet ved materialisering.

## Canonical audit og handlinger

- `kjell_lund` — **created_new** — `people/by/oslo/st_hallvard_kirke_kloster/kjell_lund.json`
- `nils_slaatto` — **created_new** — `people/by/oslo/st_hallvard_kirke_kloster/nils_slaatto.json`
- `johan_castricum` — **created_new** — `people/historie/oslo/st_hallvard_kirke_kloster/johan_castricum.json`

## Streng stedsgate

- Kjell Lund og Nils Slaatto: dokumenterte arkitekter for selve kirke- og klosteranlegget.
- Johan Castricum: dokumentert sogneprest og pådriver for prosjektet; SNL beskriver det konkrete samarbeidet med Kjell Lund om å bygge klosteret på Enerhaugen.

Alle koblingene gjelder den konkrete etableringen eller utformingen av det fysiske anlegget. Generelle arkitektur- eller katolisismeassosiasjoner er ikke tilstrekkelige.

## Kilder

- Riksantikvaren: fredningen av St. Hallvard kirke og kloster.
- Store norske leksikon: St. Hallvard kirke og kloster.
- Den katolske kirke: St. Hallvard menighets historie.
- Norsk biografisk leksikon / Norsk kunstnerleksikon: Kjell Lund og Nils Slaatto.

## Runtime-gater

Materializeren stopper ved tvetydig canonical match. Nye personer opprettes bare når ingen canonical match finnes; ellers oppdateres eksisterende person i place-listen. Etter materialisering regenereres Civication history people index og repoets ordinære People- og Places-gater skal passere.
