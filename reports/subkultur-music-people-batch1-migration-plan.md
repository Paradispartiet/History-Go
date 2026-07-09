# Migration plan — subkultur music people batch 1

Dato: 2026-07-09

## Bakgrunn

PR #2068 flyttet fire rene musikk-/venue-/klubbsteder fra primær `subkultur` til primær `musikk`, med subkultur som sekundærkobling på place-nivå:

- `bla`
- `revolver_oslo`
- `the_villa`
- `jaeger_oslo`

Tilhørende kollektive people-/miljøankre bør følge primærkategorien til place-ankeret.

## Batch 1

Denne migreringen flytter bare disse fire people-entryene:

- `revolver_oslo_miljoet`
- `the_villa_miljoet`
- `jaeger_oslo_miljoet`
- `bla_miljoet_concrete_anchor`

Fra subkultur-people-filene til:

- `data/people/musikk/oslo/people_musikk_oslo.json`

## Script

```bash
node scripts/migrate-subkultur-music-people-batch1.mjs
```

Scriptet:

1. Leser de to relevante subkultur-people-filene.
2. Finner nøyaktig fire target-ID-er.
3. Krever at de fortsatt har `category: "subkultur"`.
4. Fjerner dem fra subkultur-filene.
5. Setter `category: "musikk"`.
6. Beholder `subkultur` som tag, men legger `musikk` først i tags.
7. Appender entryene til `data/people/musikk/oslo/people_musikk_oslo.json`.
8. Skriver valideringsrapport til `reports/subkultur-music-people-batch1-validation.md`.
9. Feiler hvis destination allerede har en av ID-ene.

## Etter merge av script-PR

Kjør:

```bash
node scripts/migrate-subkultur-music-people-batch1.mjs
bash scripts/check-people.sh
```

Commit forventede filer:

- `data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json`
- `data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json`
- `data/people/musikk/oslo/people_musikk_oslo.json`
- `reports/subkultur-music-people-batch1-validation.md`

## Ikke gjør

- Ikke flytt places i samme PR.
- Ikke endre manifest.
- Ikke flytt Blitzhuset, Hausmania, X-Ray, Sub Scene, MIR eller Torggata Blad.
- Ikke rydd `_concrete_anchor`-ID-er i samme PR.
- Ikke endre UI/runtime/quiz.
