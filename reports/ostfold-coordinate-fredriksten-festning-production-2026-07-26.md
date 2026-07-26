# Fredriksten festning coordinate production

## Result

- Place: `fredriksten_festning`
- Previous coordinate: `59.11944, 11.40167`
- Applied coordinate: `59.11991, 11.39651`
- Displacement: approximately `299.1 m`
- Radius: retained at `420 m`
- Status: `verified_geometry`
- Role: `fortress_area_anchor`
- Applied source object: `osm-way:228874452`

## Identity decision

The canonical record represents the named main Fredriksten fortress complex above Halden. It does not represent one building, gate, museum room or same-name information sign. Detached forts, approach works and the wider siege and border landscape remain contextual extents.

## Applied evidence

- OpenStreetMap way `228874452` is the named historic-site and castle area for Fredriksten, with representative point `59.11991, 11.39651`.
- Forsvarsbygg identifies Fredriksten as a national fortified cultural monument and public fortress area and lists Generalveien 6, 1776 Halden as the visitor address.
- Forsvarsbygg documents the strategic border setting and the development of the fortress after the loss of Bohuslän.
- Wikidata `Q1408884` publishes a coordinate approximately `42.3 m` from the applied point and links Kulturminne ID `122685`.
- OSM node `13042891993` is a tourism-information sign and is explicitly rejected as canonical.

## Coordinate decision

The legacy point was approximately `299.1 m` east of the named main fortress area anchor. It is replaced with the representative point for the fortress polygon. The `420 m` gameplay radius is retained for the central fortress, courtyards, buildings, walls and nearby outworks.

## Representation limits

- The marker represents the main fortress complex.
- The radius is not the legal protection or property boundary.
- Detached forts, siege lines and the full border landscape are not reduced to this circle.
- The information sign is not a coordinate candidate.

## Files

- `data/places/historie/ostfold/places_historie_ostfold_batch1/fredriksten_festning.json`
- `data/coordinate-evidence/ostfold/historie/fredriksten_festning.json`
- `reports/ostfold-coordinate-fredriksten-festning-source-probe/source-summary.json`
- `reports/ostfold-coordinate-fredriksten-festning-production-2026-07-26.md`

## Next manifest item

Continue with `fredrikstad_festning_gamlebyen` after this production change passes review and data checks.
