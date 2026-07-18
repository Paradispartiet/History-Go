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
- er registrert samlet i `data/people/manifest.json` rett etter Holmenkollen batch 1

## Avgrensning

Ingen eksisterende canonical people-records er duplisert av denne batchen. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

Batch 2 er stablet på Holmenkollen batch 1 som draft-PR #2205 og skal merges etter PR #2199.

## Diffkontroll

Sammenlignet med batch 1-basen består nettodiffen av:

- fem nye one-person people-filer
- fem nye manifestregistreringer
- researchrapport
- valideringsrapport

Manifestinnholdet er ellers uendret; GitHub viser i tillegg kun en teknisk sluttlinjeskift-diff på filslutten.

## Kontroller

GitHub Actions `Data checks` på den ferdige data-diffen ga:

- `Places data`: **bestått**
- `People data`: **feilet i repoets eksisterende duplicate-ID gate**

Repoet har en kjent, pre-eksisterende `People data`-blokkering i `people_subkultur_oslo_named_batch4.json` med duplikat-ID-ene `stein_lillevolden`, `bror_wyller` og `hermann_stene`. De finnes allerede i batch 1-basen og er utenfor denne batchens diff. Batch 1 ga samme blokkering før batch 2 ble opprettet.

Batchens fem nye ID-er ble repo-auditert før opprettelse og ingen eksisterende canonical people-record ble funnet. CI-funnet er derfor behandlet som en arvet repo-blokkering, ikke som en Holmenkollen batch 2-regresjon.
