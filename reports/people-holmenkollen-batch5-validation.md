# Holmenkollen nasjonalanlegg – People batch 5: validering

## Nye ID-er

- `bjorn_wirkola`
- `reidar_andersen`
- `arne_hoel`
- `berit_aunli`
- `odd_bjorn_hjelmeset`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- skal registreres samlet i `data/people/manifest.json` etter Holmenkollen batch 4

## Canonical audit

Gjeldende `main` ble auditert etter merge av batch 4. Søk etter foreslåtte ID-er, fulle navn og relevante navnevarianter fant ingen eksisterende canonical people-records for de fem kandidatene.

## Place-gate

Alle fem har dokumentert direkte Holmenkollen-resultat:

- Wirkola: seier i Holmenkollrennet 1967
- Andersen: tre strake seirer 1936–1938
- Hoel: seirer 1948, 1951 og 1959, samt ekstrarennet 1954
- Aunli: 20 km-seier 1981 og tre VM-gull i Holmenkollen 1982
- Hjelmeset: 50 km-seier 2007

## Scope

Ingen place-, bilde-, UI- eller runtimefiler skal inngå i batchen. Den kjente globale `People data`-blokkeringen med duplikater i subkulturdata er separat fra disse fem ID-ene.

## Sluttkontroll

Etter manifestregistrering kontrolleres branchdiff mot fersk `main` og GitHub Actions-status på PR-en.
