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
- er registrert samlet i `data/people/manifest.json` rett etter Holmenkollen batch 3

## Canonical audit

Før opprettelse ble ny `main` auditert etter merge av Holmenkollen batch 1–3. Søk etter foreslåtte ID-er, fulle navn og relevante navnevarianter fant ingen eksisterende canonical people-records for de fem nye kandidatene.

## Avgrensning

Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen. Bjørn Dæhlie ble vurdert, men utsatt fordi denne batchen bruker dokumentert Holmenkollen-seier som terskel.

## Diffkontroll

Branchen ble synkronisert med fersk `main` etter at Eidsvollsbygningen batch 7–9 og en separat Civication-endring landet. Sammenlignet med gjeldende `main` består nettodiffen av nøyaktig åtte filer:

- fem nye one-person people-filer
- fem nye manifestregistreringer i én eksisterende fil
- researchrapport
- valideringsrapport

## Kontroller

GitHub Actions kjøres på PR-en. Repoets tidligere `People data`-blokkering med duplicate-ID-er i subkulturdata er en kjent pre-eksisterende feil og vurderes separat fra batchens fem nye ID-er.
