# Musikkvitenskap: migrering av temaer og spørsmålsplaner v2

Revisjon: `musikkvitenskap-emnemigrasjon-v2-2026-07-27`

## Resultat

Den vitenskapelige fagdybden er flyttet fra overordnet rammeverk inn i det aktive innholdsregisteret.

- 8 canonicale domener
- 48 canonicale temaer
- 48 canonicale spørsmålsplaner
- 18 canonicale metodeprotokoller
- 25 canonicale teoritradisjoner
- 16 canonicale forskningsdebatter
- 10 påstandstyper

## Autoritetsendring

De tidligere filene i `modules/` inneholder pedagogiske progresjonsfelt og lokale metode- og teori-ID-er. De beholdes bare som legacy kildeinventar for eksisterende avhengigheter.

Aktiv autoritet er nå:

- `domain_catalog_v2.json`
- `modules_v2/*.json`
- `content_contract_defaults_v2.json`

## Temakvalitet

Hvert tema angir nå:

- konkrete forskningsobjekttyper
- deklarerte påstandstyper
- minst to canonicale metodeprotokoller
- minst to teoritradisjoner
- minst to relevante forskningsdebatter
- tema-spesifikt evidenskrav
- tema-spesifikk slutningsgrense
- presise kjernebegreper og forskbart spørsmål

`progression_stage` og pedagogiske nivåer finnes ikke i det aktive registeret.

## Spørsmålsplaner

Hver spørsmålsplan arver temaets objekter, påstandstyper, metoder, teorier og debatter. Den krever identifiserbart objekt, proveniens, metode–evidens-samsvar, konkret analyse, konkurrerende forklaring eller begrensning og eksplisitt usikkerhet.

Felles kontrakter styrer svar, kilder og distraktorer uten å gjenta generisk tekst 48 ganger.

## Kompatibilitet

`legacy_module_id_map_v1.json` kartlegger:

- 24 gamle metode-ID-er
- 32 gamle teori-ID-er

Kartet er uttrykkelig ikke vitenskapelig autoritet. Nye emner og spørsmål skal aldri produsere gamle ID-er.

## Validering

Permanent validator: `tools/validate-musikk-emner-fagdybde-v2.mjs`.

Den kontrollerer aktiv autoritet, alle 48 temaer, alle 48 spørsmålsplaner, alle referanser, fravær av pedagogiske felt, fravær av gamle ID-er og full kompatibilitetsmapping.
