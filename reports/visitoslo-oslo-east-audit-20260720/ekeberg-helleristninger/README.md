# Helleristningene på Ekeberg — offisiell geometri-intak

Dato: 2026-07-20

- Kandidat: `ekeberg_helleristninger`
- Kulturminne-ID: `41907`
- Offisielt Riksantikvaren-objekt: `41907-1`
- Offisielt navn: `Ekeberg 2 (Sjømannsskolen) / Familiedalen`
- Kilde: Riksantikvaren OGC API, direkte objektoppslag
- Geometri: `MultiPolygon`
- Representasjonspunkt: `59.8975599746796, 10.759838207896665`
- Koordinatstatus: `verified_geometry`
- Produksjonsgate: `ready_for_canonical_production`

Den endelige metoden bruker direkte oppslag på det eksakte offisielle feature-objektet `41907-1`. Koordinaten er beregnet fra Riksantikvarens egen geometri for helleristningsfeltet. Ingen veiadresse, Ekebergparken-senter, Wikidata-koordinat eller annen bred områdeproxy brukes som canonical koordinatkilde.

Den første OGC-kjøringen feilet fordi den bare undersøkte første resultatside. En pagineringsdiagnose identifiserte det riktige feature-ID-et, men viste samtidig at bbox-spørringen ikke ga en pålitelig avgrensning av `numberMatched`. Derfor er direkte objektoppslag den endelige og reproduserbare metoden.
