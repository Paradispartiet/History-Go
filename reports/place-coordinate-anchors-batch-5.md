# Place coordinate anchors batch 5

## Endrede filer
- `data/places/places_by.json`
- `data/places/places_natur.json`
- `data/places/oslo/places_oslo_natur_hovedsteder.json`
- `data/places/oslo/places_oslo_natur_akerselvarute.json`
- `data/places/oslo/places_oslo_natur_alnaelva_rute.json`
- `tools/audit-place-coordinates.mjs`

## Steder som fikk anchors

### Gater
- `karl_johan`: allerede anchors i datasett (ikke endret i batch 5).
- `bogstadveien`: la til 3 punkter (Majorstuen, Homansbyen, Hegdehaugsveien-overgang).
- `markveien`: la til 3 punkter (Schous plass, Olaf Ryes plass, nedre løp).

### Elver/ruter
- `akerselva`: allerede multi-anchor i hovedfil (ikke endret i batch 5).
- `alnaelva`: allerede multi-anchor i hovedfil (ikke endret i batch 5).
- `ljanselva`: allerede multi-anchor i hovedfil (ikke endret i batch 5).
- `alna_utlop_bjorvika`: la til 3 punkter (indre løp, munningspunkt, fjordkant).
- `elvestrekning_bla_brenneriveien`: la til 3 punkter (øvre, ved Blå, nedre).
- `fossveien_elvestrekning`: la til 3 punkter (nord, midtre, sør).
- `hausmannsomradet_elvelop`: la til 3 punkter (øvre, midtre, nedre).
- `nybrua_vaterlandsparken`: la til 3 punkter (nord, parkrom, sør).
- `akerselva_utlop_bjorvika`: la til 3 punkter (indre løp, delta/munning, fjordkant).

### Store områder
- `bygdoy_natur`: beholdt hovedanker, la til `coordNote` + 3 area-anchor-punkter.
- `maerradalen`: beholdt hovedanker, la til `coordNote` + 3 area-anchor-punkter.
- `maridalsvannet`: beholdt hovedanker, la til `coordNote` + 3 area-anchor-punkter.
- `noklevann`: beholdt hovedanker, la til `coordNote` + 3 area-anchor-punkter.
- `ostensjovannet`: beholdt hovedanker, la til `coordNote` + 3 area-anchor-punkter.
- `sognsvann`: beholdt hovedanker, la til coord-metadata + `coordNote` + 3 area-anchor-punkter.

## Vurdert men ikke endret
- `ring_3`: beholdt eksisterende anchors; tilstrekkelig for nåværende modell.
- `trikk_17_18`: beholdt eksisterende anchors; tilstrekkelig for nåværende modell.

## Steder som trenger senere datamodell
- `ring_3`: `needs_route_model` (forslag: `routeSegments` for presis lineær dekning).
- `trikk_17_18`: `needs_route_model` (forslag: `routeSegments` for traséspesifikk unlock).

## Audit-oppdatering
- Audit validerer nå anchor-felter (`id`, `name`, `lat`, `lon`, `r`, `type`) og gyldige typer.
- Ugyldige anchors flagges som `invalid_anchor`.
- Lineære steder uten anchors flagges som `needs_multiple_anchors`.
- Store radiusverdier flagges ikke når `coordStatus`/`coordNote` forklarer bevisst områdeanker.
- Steder med gyldige anchors får ikke `street_or_route_as_single_point`.
