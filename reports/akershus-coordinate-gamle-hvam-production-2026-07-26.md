# Akershus coordinate production – Gamle Hvam museum

Date: 2026-07-26

## Scope

Production source-contract upgrade for `gamle_hvam_museum`, the sixth record in the original eight-place Akershus history batch 2.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/gamle_hvam_museum.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/gamle_hvam_museum.json`

## Previous state

- coordinate: `60.10201, 11.38486`
- radius: `260 m`
- no Coordinate Source Contract metadata
- record semantically described the full historic farm museum, not one building

## Identity and official address

MiA identifies Gamle Hvam as a cultural-history museum at:

`Store-Hvamsvegen 26, 2165 Hvam`

The official museum material describes a visitor destination composed of multiple historic buildings and a farm environment. Parts of the building environment remain on their original locations. The canonical record must therefore represent the institution and central historic farmyard rather than select one arbitrary building as the complete place.

Official sources:

- `https://mia.no/gamlehvam/kontakt`
- `https://mia.no/gamlehvam/besok`
- `https://mia.no/gamlehvam/bygninger`

## Physical anchor

OpenStreetMap node `9671520670` is a stable named point for Gamle Hvam museum / the farm site.

Stable source identity:

`osm-node:9671520670`

Source URL:

`https://www.openstreetmap.org/node/9671520670`

Coordinate:

`60.10201, 11.38486`

This is identical to the legacy canonical point. No coordinate movement is necessary.

## Representation decision

The place uses:

- `locatorType: institutional_area`
- `sourceProvider: osm`
- `sourceObjectId: osm-node:9671520670`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: area_anchor`
- `coordType: named_farm_museum_area_anchor`
- `coordStatus: verified_geometry`

This path is valid under Coordinate Source Contract v1 because the point has a stable source identity, the representation is explicitly an `area_anchor`, and the note documents what the point does and does not represent.

## Production result

- previous coordinate: `60.10201, 11.38486`
- applied coordinate: `60.10201, 11.38486`
- displacement: `0.0 m`
- radius retained: `260 m`
- address added: `Store-Hvamsvegen 26, 2165 Hvam`
- stable named source object added: `osm-node:9671520670`
- coordinate trust upgraded to `verified_geometry`

## Radius and scope

The 260-metre radius is retained for the central museum environment, including the inntun, uttun and principal visitor buildings. It is not presented as an exact cadastral boundary.

The coordinate is not claimed to be:

- the geometric centre of the property;
- the centre of one specific museum building;
- a complete polygon for all land historically associated with Store Hvam.

It is a stable, named gameplay and display anchor for the coherent multi-building destination.

## Independent cross-check

Lokalhistoriewiki describes Gamle Hvam as a substantial historic farm museum with numerous antiquarian buildings organised around inntun and uttun. This supports the area representation and retained radius, but the independent article is not used as the primary coordinate source.

## Validation target

The canonical object is expected to satisfy Coordinate Source Contract v1 through the verified-geometry semantic-area-anchor path:

1. valid coordinate and radius;
2. allowed `institutional_area` locator type;
3. stable OSM source identity;
4. structured official address;
5. `semantic_anchor` accuracy;
6. explicit `area_anchor` role;
7. full coordinate note explaining representation scope.

## Next queue item

`heggedal_hovedgard`

The Heggedal record is a preserved historic farm complex and conservation case. Its production review must distinguish the physical historic buildings from nearby modern school and settlement functions and must not treat a generic Heggedal locality point as the farm coordinate.
