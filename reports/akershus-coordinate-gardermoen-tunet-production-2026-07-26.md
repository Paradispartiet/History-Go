# Gardermoen militærleir / Tunet coordinate production

Date: 2026-07-26

## Result

`gardermoen_militaerleir_tunet` has been moved from an incorrect point northeast of the museum area to the named Ullensaker museum point in the centre of Tunet at Lilleplassen.

- Previous coordinate: `60.1986, 11.0782`
- Applied coordinate: `60.1911316, 11.0698695`
- Displacement: approximately `949.5 m`
- Applied source object: OpenStreetMap node `6593405620`
- Coordinate status: `verified_historical_source`
- Coordinate role: `area_anchor`
- Radius: `420 m`

## Canonical identity

The canonical record represents Tunet on Sør-Gardermoen and its relationship to Lilleplassen, one of Norway's oldest military drill grounds.

The place includes:

- the historical drill-ground context established in 1740;
- the relocated building collection from the former Sør-Gardermoen military camp;
- military storage, barracks, postal and meteorological history;
- the civilian settlement that developed around the camp;
- Romani history represented by Furua;
- the transition from military landscape to the modern airport era.

The marker does not represent one selected museum building, the Norwegian Armed Forces Aircraft Collection, the modern military air station or Oslo Airport.

## Named museum anchor

OpenStreetMap node `6593405620` is:

- named `Ullensaker museum`;
- tagged `tourism=museum`;
- tagged `museum=history`;
- located at `60.1911316, 11.0698695`.

Nominatim independently resolves the same object at `60.1911310, 11.0698690`, approximately `0.1 m` from the applied point.

The named point lies centrally among the surviving and relocated buildings at Tunet and provides the strongest available physical anchor for the whole collection.

## Why one building was not selected

A named civic museum building, OpenStreetMap way `652142158`, lies approximately `29.9 m` west of the museum point. It has:

- name `Ullensaker museum`;
- national building reference `15353090`;
- Wikidata `Q19393789`;
- `tourism=museum`.

The History Go place, however, is not limited to this building. MiA documents eight protected buildings distributed across Tunet. Selecting one building centroid would misrepresent the place as a single-building museum rather than a relocated military and civilian building collection at Lilleplassen.

The named museum node is therefore applied as an `area_anchor`.

## Lilleplassen and the building collection

MiA documents Lilleplassen as a military drill ground established in 1740 for cavalry. During the nineteenth century Gardermoen developed into a major military camp and, by the 1850s, the principal camp for eastern Norway.

The historical buildings now at Tunet were moved from other locations at Gardermoen when the main airport was developed. The collection includes:

- Kornmagasinet;
- Depot 148;
- Telthuset;
- Østerrikegata 13, which burned in 2021;
- Ballonghuset;
- Rawindhuset;
- Posthuset;
- Furua.

The buildings cover military logistics, accommodation, meteorology, postal services, civilian settlement and Romani history.

## Address assessment

MiA publishes the location as:

- `Tunvegen`
- `2060 Gardermoen`

It does not publish one house number for the entire Tunet.

Kartverket returns multiple separate addresses within the museum area. Examples include:

- Tunvegen 9, `22.5 m` from the museum point;
- Tunvegen 17, `23.6 m` from the museum point;
- Tunvegen 11, `27.8 m` from the museum point;
- Tunvegen 19, `30.2 m` from the museum point;
- Tunvegen 13, `31.5 m` from the museum point.

These addresses belong to separate buildings and parcels. No single official address was found that can honestly represent the whole building collection.

For that reason the canonical record deliberately omits a top-level numbered address instead of inventing one.

## Separate nearby objects

### Forsvarets flysamling Gardermoen

The Norwegian Armed Forces Aircraft Collection is a separate aerospace museum approximately `227.4 m` south of the Ullensaker museum point. It has its own named building geometry and institutional identity and is not the canonical object for this record.

### Hotels and conference buildings

Clarion Hotel, The Qube and other airport hotels surround the museum area. They are modern commercial buildings and are not part of the historical Tunet identity.

### Oslo Airport and Gardermoen air station

The airport and military air station represent later aviation and defence layers. They are separate large-scale installations and are not used as alternative anchors for the relocated museum collection.

## Legacy-point assessment

The previous coordinate `60.1986, 11.0782` lies approximately `949.5 m` northeast of the applied museum point.

It is closer to the modern airport and hotel landscape and cannot be tied to:

- Ullensaker museum;
- Lilleplassen;
- the relocated building collection;
- any named historical Tunet object.

The correction is therefore a substantial physical relocation rather than only a provenance upgrade.

## Radius decision

The existing radius of `420 m` is retained to support gameplay coverage of:

- the museum buildings at Tunet;
- Lilleplassen;
- the nearest military, civilian and aviation-history layers;
- the immediate route and landscape context.

The radius must not be interpreted as:

- the exact historical extent of the military camp;
- the drill-ground boundary;
- an airport or air-station polygon;
- a cadastral parcel;
- a formal heritage-protection zone.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM node 6593405620 | Named Ullensaker museum point | Primary applied area anchor |
| OSM way 652142158 | Named museum building | Physical cross-check, not canonical |
| MiA – Bygningene på Tunet | Official Lilleplassen and building-collection identity | Primary historical identity |
| MiA – Museets samlinger | Eight relocated protected buildings | Area-model cross-check |
| MiA – Militærutstillingen | Gardermoen as eastern Norway's principal military camp | Historical context |
| MiA – Furua | Civilian and Romani history | Social-history context |
| SNL – Gardermoens military history | 1740–airport-transition chronology | Authoritative cross-check |
| Kartverket Tunvegen results | Multiple separate building addresses | Supports omission of synthetic house number |
| Forsvarets flysamling | Separate aerospace museum | Rejected as canonical |
| Legacy coordinate | Incorrect northeastern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-gardermoen-tunet-source-probe/osm-node-6593405620.xml`
- `reports/akershus-coordinate-gardermoen-tunet-source-probe/nominatim-ullensaker-museum.json`
- `reports/akershus-coordinate-gardermoen-tunet-source-probe/osm-gardermoen-tunet-bbox.xml`
- `reports/akershus-coordinate-gardermoen-tunet-source-probe/geonorge-tunvegen-gardermoen.json`
- `reports/akershus-coordinate-gardermoen-tunet-source-probe/geonorge-tunvegen-1-gardermoen.json`
- `reports/akershus-coordinate-gardermoen-tunet-source-probe/geonorge-tunvegen-2-gardermoen.json`
- `reports/akershus-coordinate-gardermoen-tunet-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch5/gardermoen_militaerleir_tunet.json`
- `data/coordinate-evidence/akershus/historie/gardermoen_militaerleir_tunet.json`
- `reports/akershus-coordinate-gardermoen-tunet-production-2026-07-26.md`
- the seven raw-source files listed above

## Next record

Continue with `ullensaker_kirke_kirkested`, the next place in the active Akershus batch-5 sequence.
