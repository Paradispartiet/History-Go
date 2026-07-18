# Holmenkollen nasjonalanlegg – People batch 6: validering

## Nye ID-er

- `brit_pettersen`
- `anette_boe`
- `ingolf_mork`
- `noriaki_kasai`
- `sara_takanashi`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- skal registreres i `data/people/manifest.json` etter Holmenkollen batch 5

## Canonical audit

Dagens `main` ble auditert etter merge av Holmenkollen batch 5 og cleanup av de tidligere subkulturduplikatene. Søk etter foreslåtte ID-er, fulle navn og relevante navnevarianter fant ingen eksisterende canonical people-records for de fem nye kandidatene.

## Place gate

Alle fem har eksplisitt dokumentert fysisk konkurransedeltakelse og seier i Holmenkollen:

- Brit Pettersen: 20 km-seire i 1983 og 1987
- Anette Bøe: 20 km-seire i 1984 og 1985
- Ingolf Mork: hopprennseire i 1971 og 1972
- Noriaki Kasai: hopprennseier i 1999
- Sara Takanashi: hopprennseire i 2014, 2015, 2016 og 2022

## Avgrensning

Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen. Batchen legger kun til fem canonical people-records, manifestregistrering og dokumentasjon.

## Kontroller

Sluttkontroll utføres etter manifestregistrering og sammenligning mot fersk `main`. Den tidligere globale duplicate-ID-feilen i `people_subkultur_oslo_named_batch4.json` er nå ryddet på `main`, slik at batch 6 kan valideres mot et renere people-datasett.
