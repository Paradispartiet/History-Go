# Drøbak kirke coordinate production

Date: 2026-07-26

## Result

`drobak_kirke` has been moved from an incorrect southeastern point to the deterministic centroid of the named 1776 timber church at Kirkegata 18.

- Previous coordinate: `59.66389, 10.62949`
- Applied coordinate: `59.66526355521415, 10.627102938185208`
- Displacement: approximately `203.2 m`
- Applied geometry: OpenStreetMap way `745690085`
- National building reference: `149217290`
- Official address: `Kirkegata 18, 1440 Drøbak`
- Kartverket identity: municipality `3214`, farm/use number `86/210`, address code `1560`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`
- Radius: `220 m`

## Canonical identity

The canonical marker represents Drøbak kirke, also known as Vår Frelsers kirke, as the physical expression of Drøbak's eighteenth-century timber, shipping and merchant economy.

The place identity includes:

- the consecration on 29 October 1776;
- the timber cruciform building;
- the unusual west-facing altar caused by the terrain;
- the influence of the former Church of Our Saviour in Christiania, today's Oslo Cathedral;
- the financing by timber merchant and shipowner Niels Carlsen and Martha Zachariasdatter;
- the maritime and merchant-elite symbolism in the interior.

## Church geometry

OpenStreetMap way `745690085` is:

- named `Drøbak kirke`;
- alternatively named `Vår Frelsers kirke`;
- tagged `building=church`;
- tagged `start_date=1776`;
- linked to national building reference `149217290`;
- linked to Wikidata `Q7589679`;
- represented by a 21-node closed polygon including the repeated closing node.

The deterministic polygon centroid is:

- Latitude: `59.66526355521415`
- Longitude: `10.627102938185208`

Nominatim independently resolves the same way at `59.6652484, 10.6271037`, approximately `1.7 m` from the calculated centroid.

## Official address and spelling

Published visitor sources use both `Kirkegata 18` and the older-looking variant `Kirkegaten 18`.

Kartverket was queried with both forms. Both searches returned the same official object:

- Street name: `Kirkegata`
- House number: `18`
- Municipality: `3214 Frogn`
- Farm/use number: `86/210`
- Address code: `1560`
- Postal code: `1440`
- Representation point: `59.665264145000016, 10.627205118703042`

The official address point lies approximately `5.7 m` from the applied church centroid. The canonical spelling is therefore `Kirkegata 18`.

## Historical identity

Drøbak and Frogn parish documents the church as a timber cruciform church consecrated on 29 October 1776. The terrain caused the altar to be placed in the west, with tower and entrance facing the town in the east.

The parish also documents the central role of Niels Carlsen and Martha Zachariasdatter. When the proposed transfer of church income from Nordby met opposition, Carlsen and his family assumed the financial responsibility for the building and its furnishings.

This makes the church an unusually direct material expression of private merchant wealth, timber trade, shipping and institution building in the ladested.

## Nearby-object assessment

The materialized map extract separates the church from:

- the Kirkegata 18 address node;
- a separate religious/service building 29.4 m away;
- the graveyard approximately 52 m away;
- bus stops outside the site;
- Badeparken;
- Frogn eldresenter;
- the Blücher anchor memorial.

The canonical point therefore represents the church building itself rather than a broader churchyard, park or town-centre area.

## Legacy-point assessment

The previous coordinate `59.66389, 10.62949` lies approximately `203.2 m` southeast of the church centroid.

It is replaced because it does not represent the church polygon or the Kirkegata 18 address.

## Radius decision

The radius remains `220 m` to support gameplay around the church, churchyard and immediate ladested environment.

It must not be interpreted as:

- the church property boundary;
- the graveyard boundary;
- Badeparken;
- an automatic-listing or heritage-protection zone;
- a cultural-environment polygon for central Drøbak.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM way 745690085 | Named church-building polygon | Primary applied geometry |
| Kartverket, Kirkegata 18 | Official address and spelling | Address cross-check |
| Drøbak and Frogn parish – Historikk | Building, consecration and donor history | Primary institutional history |
| Drøbak and Frogn parish – Tilgjengelighet | Current access and neighbouring facilities | Site-context source |
| Store norske leksikon | Building type, donors and protection context | Authoritative historical cross-check |
| Nominatim | Named-object and polygon cross-check | Secondary geometry check |
| Materialized area map | Separates church from nearby objects | Context geometry |
| Legacy coordinate | Incorrect southeastern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-drobak-kirke-source-probe/osm-way-745690085-full.xml`
- `reports/akershus-coordinate-drobak-kirke-source-probe/nominatim-drobak-kirke.json`
- `reports/akershus-coordinate-drobak-kirke-source-probe/geonorge-kirkegata-18-drobak.json`
- `reports/akershus-coordinate-drobak-kirke-source-probe/geonorge-kirkegaten-18-drobak.json`
- `reports/akershus-coordinate-drobak-kirke-source-probe/osm-drobak-kirke-bbox.xml`
- `reports/akershus-coordinate-drobak-kirke-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/by/akershus/drobak_kirke/drobak_kirke.json`
- `data/coordinate-evidence/akershus/by/drobak_kirke.json`
- `reports/akershus-coordinate-drobak-kirke-production-2026-07-26.md`
- the six raw-source files listed above

## Batch status

Drøbak kirke is the last category-moved record from the original eight-place Akershus batch-5 source. The complete source sequence is finished after this pull request is validated and merged.
