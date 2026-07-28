# Hadeland Glassverk coordinate production

## Result

- Place: `hadeland_glassverk`
- Legacy coordinate: `60.23813, 10.39785`
- Retained production coordinate: `60.23765, 10.39719`
- Original displacement from legacy: approximately `64.6 m`
- Coordinate change in this pass: `0 m`
- Radius: retained at `360 m`
- Status: `verified_geometry`
- Coordinate Source Contract role: `area_anchor`
- Locator type: `institutional_area`
- Accuracy: `semantic_anchor`
- Applied source object: `osm-node:559688012`

## Why the coordinate is retained

The 2026-07-26 production already moved the unsupported nearby legacy point approximately 64.6 metres to the stable named Hadeland Glassverk institution object. Current research still supports that point as the canonical marker for the complete living glassworks, production, museum and visitor institution.

This pass does not invent a second movement merely to produce a coordinate delta. It repairs three semantic metadata values that had become invalid under Coordinate Source Contract v1:

- `industrial_site` → `institutional_area`
- `named_point` → `semantic_anchor`
- `industrial_visitor_complex_anchor` → `area_anchor`

With an explicit anchor and representation note, `verified_geometry` is the correct status for the retained semantic area anchor.

## Identity decision

The canonical record represents Hadeland Glassverk as one living industrial institution and central production, museum and visitor complex. It does not represent one shop, the park alone or an assumed Glasshytta building centroid.

The official site identifies Glasshytta as the heart of the operation and documents living production, glassblowing, grinding and polishing. The reviewed sources still do not expose a stable separately named building geometry suitable for replacing the institution anchor, so no unsupported coordinate is invented.

## Applied evidence

- OpenStreetMap node `559688012` is the stable named Hadeland Glassverk institution point at `60.23765, 10.39719`.
- Hadeland Glassverk lists `Glassverksveien 9, 3520 Jevnaker` as its visitor address.
- The current official visitor page describes production viewing, museum, activities, shops and dining with changing opening schedules.
- The official site map presents Glasshytta, museum, shops and dining as components of one glassworks environment.
- The official history documents the founding in 1762 and the development from bottles and household glass to design and art glass.
- The official historical walk identifies Glasshytta as the production core.
- OpenStreetMap way `693083889` is a named park polygon approximately `82.5 m` from the retained point and is used only as an area control.
- Wikidata `Q2194066` independently confirms the glassworks identity but is not used as the production coordinate source.

## Access and representation limits

- Outdoor and indoor access follows current opening hours, production, ticket, guided-tour and event conditions.
- Production, furnace, cold-working, storage and staff areas are not general gameplay space.
- Glasshytta, the museum, park, shops and dining venues remain components of the complete institution.
- The park polygon is context, not the complete glassworks identity.
- The `360 m` radius is not a property, heritage, production, fire-safety, visitor-access or legal boundary.

## Files

- `data/places/naeringsliv/akershus/hadeland_glassverk/hadeland_glassverk.json`
- `data/coordinate-evidence/akershus/naeringsliv/hadeland_glassverk.json`
- `reports/akershus-coordinate-hadeland-glassverk-source-probe/source-summary.json`
- `reports/akershus-coordinate-hadeland-glassverk-production-2026-07-26.md`

## Next manifest item

Continue with `kistefos_traesliperi` after this contract migration passes review and data checks.
