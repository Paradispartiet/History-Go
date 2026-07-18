# Holmenkollen nasjonalanlegg – People batch 3: validering

## Nye ID-er

- `oddvar_bra`
- `vegard_ulvang`
- `magnar_estenstad`
- `vladimir_smirnov`
- `bente_skari`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- skal registreres samlet i `data/people/manifest.json` etter Holmenkollen batch 2

## Avgrensning

Ingen eksisterende canonical people-records er duplisert av denne batchen. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

Batch 3 er stablet på Holmenkollen batch 2 og skal merges etter PR #2205.

## Kontroller

Sluttkontrollen kjøres etter manifestregistrering og PR-opprettelse. Repoets kjente, pre-eksisterende duplicate-ID blokkering i `people_subkultur_oslo_named_batch4.json` er utenfor batchens diff.
