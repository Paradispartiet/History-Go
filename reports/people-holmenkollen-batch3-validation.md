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
- er registrert samlet i `data/people/manifest.json` rett etter Holmenkollen batch 2

## Avgrensning

Ingen eksisterende canonical people-records er duplisert av denne batchen. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

Batch 3 er stablet på Holmenkollen batch 2 som draft-PR #2208 og skal merges etter PR #2205.

## Diffkontroll

Sammenlignet med batch 2-basen består nettodiffen av:

- fem nye one-person people-filer
- fem nye manifestregistreringer
- researchrapport
- valideringsrapport

Manifestet fikk samtidig tilbake ordinært sluttlinjeskift; ingen øvrige manifestoppføringer ble endret.

## Kontroller

GitHub Actions `Data checks` på den ferdige data-diffen ga:

- `Places data`: **bestått**
- `People data`: **feilet i repoets eksisterende duplicate-ID gate**

Den kjente blokkeringen ligger i `people_subkultur_oslo_named_batch4.json` med duplikat-ID-ene `stein_lillevolden`, `bror_wyller` og `hermann_stene`. Problemet finnes allerede i batch 2-basen og er utenfor denne batchens diff.

Batchens fem nye ID-er ble repo-auditert før opprettelse og ingen eksisterende canonical people-record ble funnet. CI-funnet behandles derfor som en arvet repo-blokkering, ikke som en Holmenkollen batch 3-regresjon.
