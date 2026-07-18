# Holmenkollen nasjonalanlegg – People batch 4: validering

## Nye ID-er

- `thomas_alsgaard`
- `adam_malysz`
- `simon_ammann`
- `jens_weissflog`
- `espen_bredesen`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- skal registreres samlet i `data/people/manifest.json` rett etter Holmenkollen batch 3

## Canonical audit

Før opprettelse ble ny `main` auditert etter merge av Holmenkollen batch 1–3. Søk etter foreslåtte ID-er, fulle navn og relevante navnevarianter fant ingen eksisterende canonical people-records for de fem nye kandidatene.

## Avgrensning

Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen. Bjørn Dæhlie ble vurdert, men utsatt fordi denne batchen bruker dokumentert Holmenkollen-seier som terskel.

## Kontroller

Et ordinært sluttpass kjøres etter manifestregistrering og PR-opprettelse. Repoets tidligere `People data`-blokkering med duplicate-ID-er i subkulturdata er en kjent pre-eksisterende feil og vurderes separat fra batchens fem nye ID-er.
