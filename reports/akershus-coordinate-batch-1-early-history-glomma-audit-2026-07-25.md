# Akershus coordinate audit – batch 1: tidlig historie og Glomma

Dato: 2026-07-25  
Omfang: De fem første aktive Akershus-recordene etter Oslo i `data/places/manifest.json`.

## Resultat

| placeId | Sted | Resultat | Kandidat / blokkering |
| --- | --- | --- | --- |
| `nostvet_boplass` | Nøstvet-boplassen | `needs_geometry_source` | Ås kommune løser identitet og landskap, men ikke eksakt kulturminneobjekt eller geometri. |
| `raknehaugen` | Raknehaugen | `needs_raw_geometry_capture` | Eksakt navngitt OSM-way `258836263` er identifisert; rå nodegeometri og deterministisk representasjonspunkt må lagres før produksjon. |
| `nes_kirkeruiner` | Nes kirkeruiner | `needs_ruin_geometry_source` | MiA oppgir Ullershovvegen 8, men besøksadressen må skilles fra ruinens semantiske geometri. |
| `blaker_skanse` | Blaker skanse | `needs_fortification_geometry_source` | Lillestrøm kommune oppgir Skanseveien 43; eksakt adressepunkt og/eller skansegeometri mangler. |
| `fetsund_lenser` | Fetsund lenser | `candidate_ready_for_production` | MiA publiserer GPS-punkt i EUREF89/UTM sone 32. Deterministisk transformert til WGS84. |

## Produksjonsklar kandidat

### Fetsund lenser

MiA publiserer:

- adresse: `Lundveien 3, 1900 Fetsund`
- koordinat: `32V N 6644601, Ø 620295`
- tolket CRS: EUREF89 / UTM sone 32 (`EPSG:25832`)
- deterministisk transformasjon til WGS84 (`EPSG:4326`):
  - latitude: `59.92129383059753`
  - longitude: `11.151830033283264`

Dagens markør er `59.9256, 11.1598`. Avstanden til det offisielle punktet er omtrent `653.1 m`.

Kandidaten er klar til en egen produksjonsendring som synkroniserer aggregate, split-fil og indekser. Radius bør foreløpig beholdes bred fordi punktet representerer besøksstedet, ikke hele det lineære lenseanlegget.

## Nær produksjonsklar kandidat

### Raknehaugen

Ullensaker kommune løser stedets identitet og plassering ved Sand. Et eksakt navngitt OpenStreetMap-objekt er identifisert:

- `osm-way:258836263`
- semantikk: arkeologisk område / Raknehaugen
- foreløpig representasjon: `60.14698, 11.13719`
- avstand fra dagens markør: omtrent `33.8 m`

Koordinaten anvendes ikke i denne auditen. Før produksjon skal rå way-geometri med noder lagres og et deterministisk interiørpunkt beregnes etter samme standard som tidligere geometry-batcher.

## Blokkerte steder

### Nøstvet-boplassen

Ås kommune bekrefter Nøstvedt-funnplassen ved Sjøskogen og forklarer navneforholdet til Nøstvetkulturen. Kilden publiserer ikke et eksakt kulturminneobjekt eller en inspiserbar geometri. Neste steg er å koble recorden til korrekt Askeladden/Kulturminnesøk-objekt og kontrollere avgrensningen mot Tussebo og Nøstvedtmarka.

### Nes kirkeruiner

MiA oppgir `Ullershovvegen 8, 2160 Vormsund`. Adressen kan være besøks-/adkomstpunkt via Ullershov og skal derfor ikke automatisk brukes som ruinens representasjonspunkt. Neste steg er Geonorge-oppslag og sammenligning med navngitt ruin- eller kulturminnegeometri.

### Blaker skanse

Lillestrøm kommune oppgir `Skanseveien 43, Blaker`. Recorden representerer hele skanseanlegget, ikke bare ett bygg. Neste steg er å hente eksakt Geonorge-adresseobjekt og sammenligne dette med en navngitt skansegrense før display-marker velges.

## Endringer i denne PR-en

- fem nye evidence-filer under `data/coordinate-evidence/akershus/historie/`
- denne reproduserbare batchrapporten
- ingen canonical koordinater endret
- ingen Oslo-protokollrader lagt til
- ingen nearest/first-hit-avgjørelser brukt

## Neste produksjonsrekkefølge

1. Anvend Fetsund-lenserpunktet i aggregate, split og indekser.
2. Hent rå OSM-geometri for Raknehaugen og produser deterministisk områdeanker.
3. Kjør adresse-/geometrikontroll for Nes kirkeruiner og Blaker skanse.
4. Løs Askeladden/Kulturminnesøk-objektet for Nøstvet-boplassen.
