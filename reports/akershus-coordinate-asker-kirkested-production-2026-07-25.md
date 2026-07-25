# Akershus coordinate production – Asker kirke / gamle kirkested

Date: 2026-07-25

## Scope

Production application for `asker_kirke_kirkested`, the fifth and final church record in the Akershus batch-2 queue.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/asker_kirke_kirkested.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/asker_kirke_kirkested.json`

## Semantic scope

This record is not a simple record for the present 1879 church building. It represents the layered Asker church site:

- medieval stone church on the site from the 1100s;
- fire on 3 March 1878;
- removal of the damaged medieval walls;
- construction of the present church on the same location;
- consecration of the new church on 19 October 1879;
- continued churchyard, burial and cultural-landscape history.

The production representation must therefore preserve the distinction between the historical site and the age of the building currently standing there.

## Primary historical source

Asker menighet's official presentation of Asker kirkested states that:

- the present church is the centre of the wider church site;
- the church was built where the medieval stone church had stood;
- the medieval church burned in 1878;
- the present church was completed the following year.

Stable historical source identity:

`asker-menighet:asker-kirkested`

Source URL:

`https://www.kirken.no/nb-NO/fellesrad/askerfellesrad/menigheter/askerkirke/virksomhetsomrader/Om%20kirkebygget/asker%20kirkested/`

The official account of the new church independently confirms that the replacement church was designed and built on the same place after the old walls were removed.

## Physical anchor

OpenStreetMap way `506440682` is the exact named building geometry for the present Asker church.

Physical anchor:

`59.84333, 10.43670`

Stable geometry identity:

`osm-way:506440682`

The current building is used as the physical historical anchor because the official source explicitly documents same-site continuity. The geometry does not by itself prove the medieval site; it materializes the location established by the historical source.

## Address and wrong-object exclusion

Asker kirkelige fellesråd distinguishes:

- Asker kirke: `Kirkelia 7, 1384 Asker`
- Askertun: `Kirkelia 3, 1384 Asker`

Askertun is a separate menighet and office building and is explicitly rejected as a coordinate source or proxy for the historical church site.

## Independent checks

- The structured church record connects Asker kirke to OSM way `506440682` and Kulturminne ID `83800`.
- The official Asker cemetery page documents the medieval church, possible earlier wooden church, long burial continuity and surrounding prehistoric burial mounds.

## Production result

- previous coordinate: `59.84333, 10.43664`
- applied coordinate: `59.84333, 10.43670`
- displacement: approximately `3.4 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `asker-menighet:asker-kirkested`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `historical_anchor`
- `coordType`: `same_site_medieval_church_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: OSM way `506440682`
- radius retained at `220 m`

The 220-metre radius represents the near layered church-site landscape. It is not presented as an exact geometry for the entire churchyard or historical property.

## Coordinate Source Contract decision

The record satisfies the historical-source path because:

1. the primary source is an official historical presentation with stable identity;
2. the source explicitly documents same-site continuity;
3. the current church has a stable named building geometry;
4. the building geometry is stored as a physical historical anchor;
5. the current church address is independently documented;
6. the adjacent Askertun address is explicitly excluded;
7. the modern address is not used as the sole evidence for the medieval site.

## Batch result

The five-place Akershus batch-2 church production queue is complete:

1. Tanum kirke – corrected to official church point
2. Skedsmo kirke – corrected to official church point
3. Enebakk kirke – existing building-aligned point retained and verified
4. Haslum kirke – existing building-aligned point retained; displaced SSR label point rejected
5. Asker kirke / gamle kirkested – verified as a same-site historical anchor

The next Akershus coordinate queue can continue with the remaining batch-2 records or move to the next active manifest batch.
