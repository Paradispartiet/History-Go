# Holmenkollen nasjonalanlegg – People batch 2: validering

## Nye ID-er

- `lauritz_bergendahl`
- `anette_sagen`
- `petter_northug`
- `ole_einar_bjorndalen`
- `johannes_thingnes_bo`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- skal registreres samlet i `data/people/manifest.json` etter Holmenkollen batch 1

## Avgrensning

Ingen eksisterende canonical people-records er duplisert av denne batchen. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

Batch 2 er stablet på Holmenkollen batch 1 og skal merges etter PR #2199.

## Kontroller

Sluttkontrollen kjøres etter manifestregistrering og PR-opprettelse. Repoet har en kjent, pre-eksisterende `People data`-blokkering i `people_subkultur_oslo_named_batch4.json`; batchens fem nye ID-er kontrolleres separat mot denne arvede feilen.
