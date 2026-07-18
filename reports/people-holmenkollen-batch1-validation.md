# Holmenkollen nasjonalanlegg – People batch 1: validering

## Nye ID-er

- `thorleif_haug`
- `birger_ruud`
- `gjermund_eggen`
- `matti_nykanen`
- `maren_lundby`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- er registrert i `data/people/manifest.json`

Manifestregistreringen ligger samlet rett etter `people/sport/oslo/people_sport_oslo.json`. Den midlertidige manifest-workflowen er fjernet og inngår ikke i nettodiffen.

## Avgrensning

Ingen eksisterende canonical people-records er duplisert av denne batchen. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

## Kontroller

GitHub Actions-kjøringen `Data checks` på batch-headen kjørte både People- og Places-kontrollene.

- `Places data`: **bestått**.
- `People data`: **stoppet på eksisterende duplikater utenfor denne batchens diff**.
- People-kontrollen kom gjennom JSON-lesingen og rapporterte deretter duplikat-ID-ene `stein_lillevolden`, `bror_wyller` og `hermann_stene` i `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`.
- De samme tre duplikatene finnes allerede i batchens base-commit `c12d5a2a35f3947d229cc79437652a19404b9a33`; Holmenkollen-PR-en endrer ikke denne filen.
- Ingen av de fem nye Holmenkollen-ID-ene ble rapportert som duplikater.

CI-feilen er dermed en pre-eksisterende repo-blokkering og ikke introdusert av Holmenkollen batch 1. Batchens egen diff er avgrenset til fem nye people-filer, manifestregistrering og to rapportfiler.
