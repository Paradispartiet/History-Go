# Migration plan — subkultur music venues batch 1

Dato: 2026-07-09

## Bakgrunn

PR #2057 innførte primær-/sekundærbadge-modellen.

PR #2061 auditerte eksisterende subkultur-data og anbefalte at rene musikk-/venue-/klubbsteder flyttes fra primær `subkultur` til primær `musikk`, med `secondaryBadgeIds: ["subkultur"]` der undergrunns-/klubbkulturkoblingen er reell.

## Batch 1

Denne batchen gjelder bare fire steder:

- `bla`
- `revolver_oslo`
- `the_villa`
- `jaeger_oslo`

## Hvorfor script

`data/places/subkultur/oslo/places_subkultur.json` er en stor aktiv JSON-fil. For å unngå manuell feilredigering gjøres flyttingen med et deterministisk migreringsscript:

```bash
node scripts/migrate-subkultur-music-venues-batch1.mjs
```

Scriptet:

1. Leser `data/places/subkultur/oslo/places_subkultur.json`.
2. Finner nøyaktig fire target-ID-er.
3. Krever at de fortsatt har `category: "subkultur"`.
4. Setter `category: "musikk"`.
5. Legger til `secondaryBadgeIds: ["subkultur"]` uten duplikater.
6. Skriver valideringsrapport til `reports/subkultur-music-venues-batch1-validation.md`.
7. Feiler hvis en target mangler eller allerede har annen kategori.

## Kjøring etter merge av script-PR

```bash
node scripts/migrate-subkultur-music-venues-batch1.mjs
npm run places:index:build
bash scripts/check-places.sh
```

Deretter commit følgende forventede filer:

- `data/places/subkultur/oslo/places_subkultur.json`
- `data/places/places_index.json`
- `reports/subkultur-music-venues-batch1-validation.md`

## Ikke gjør

- Ikke flytt people i samme PR.
- Ikke flytt flere steder i denne batchen.
- Ikke flytt Blitzhuset, Hausmania, X-Ray, Skur 13, Torggata Blad, Club 7 eller Helvete/Neseblod.
- Ikke endre `place_exclusions.json`.
- Ikke legg til nye places.

## Neste batch etter dette

Etter place-flytting:

1. Flytt tilhørende venue-miljøankre i people.
2. Rydd `_concrete_anchor`-ID-ene.
3. Vurder byoriginaler ut av subkultur.
