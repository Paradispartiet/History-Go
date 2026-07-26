# Hadeland Glassverk coordinate production

## Result

- Place: `hadeland_glassverk`
- Previous coordinate: `60.23813, 10.39785`
- Applied coordinate: `60.23765, 10.39719`
- Displacement: approximately `64.6 m`
- Radius: retained at `360 m`
- Status: `verified`
- Role: `industrial_visitor_complex_anchor`
- Applied source object: `osm-node:559688012`

## Identity decision

The canonical record represents Hadeland Glassverk as one living glassworks institution and central production, museum and visitor complex. It does not represent one shop, the park alone or an assumed Glasshytta building centroid.

The official site identifies Glasshytta as the heart of the operation and documents living glass production, glassblowing, grinding and polishing. No stable separate building geometry for Glasshytta was captured in this production pass, so no unsupported coordinate was invented.

## Applied evidence

- OpenStreetMap node `559688012` is the stable named Hadeland Glassverk institution point at `60.23765, 10.39719`.
- Hadeland Glassverk lists `Glassverksveien 9, 3520 Jevnaker` as the visitor address.
- The official history documents the founding in 1762 and the development from bottles and household glass to design and art glass.
- The official historical walk identifies Glasshytta as the production core.
- OpenStreetMap way `693083889` is a named park area approximately `82.5 m` from the applied point and is used only as an area cross-check.
- Wikidata `Q2194066` independently confirms the glassworks identity but is not used as the production coordinate source.

## Coordinate decision

The legacy point was already near the complex but had no stable source-object role. It is moved approximately `64.6 m` to the named institution point. The `360 m` gameplay radius is retained because it covers the central production, museum, park and visitor environment.

## Representation limits

- The marker represents the named glassworks institution and central complex.
- Glasshytta is the documented production core but has no invented separate coordinate.
- The park polygon is context, not the complete glassworks identity.
- The radius is not a property boundary, legal heritage polygon or exact industrial-site geometry.

## Files

- `data/places/naeringsliv/akershus/hadeland_glassverk/hadeland_glassverk.json`
- `data/coordinate-evidence/akershus/naeringsliv/hadeland_glassverk.json`
- `reports/akershus-coordinate-hadeland-glassverk-source-probe/source-summary.json`
- `reports/akershus-coordinate-hadeland-glassverk-production-2026-07-26.md`

## Next manifest item

Continue with `kistefos_traesliperi` after this production change passes review and data checks.
