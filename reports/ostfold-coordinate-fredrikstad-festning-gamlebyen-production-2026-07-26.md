# Fredrikstad festning / Gamlebyen coordinate production

## Result

- Place: `fredrikstad_festning_gamlebyen`
- Previous coordinate: `59.20444, 10.95583`
- Applied coordinate: `59.2034, 10.9542`
- Displacement: approximately `148.3 m`
- Radius: retained at `420 m`
- Status: `verified_historical_source`
- Role: `fortified_city_area_anchor`
- Applied identity: Wikidata `Q5499573`, Kulturminne `116956`

## Identity decision

The canonical record represents the complete fortified town: the defensive works and the living civilian settlement inside the ramparts. Fredrikstad festning and Gamlebyen are two aspects of one coherent place and share one area anchor.

## Applied evidence

- The Fredrikstad Fortress entity publishes `59.2034, 10.9542` and links Kulturminne ID `116956`.
- The independent Gamlebyen entity publishes a point only `5.6 m` from the applied coordinate.
- Forsvarsbygg identifies Fredrikstad as Norway's only preserved fortified town and emphasizes the integration of military and civilian life.
- Store norske leksikon defines the fortress as the complete defences and town fabric, while Gamlebyen is the civilian settlement inside the ramparts.
- OSM nodes `829118267` and `829117408` are information points and are rejected.
- Kongsten, Isegran, Huth and Akerøya are separate components in the wider defence system.

## Coordinate decision

The legacy point was approximately `148.3 m` northeast of the shared fortress and old-town anchor. It is replaced with the fortress heritage-entity coordinate. The `420 m` radius is retained for the walled town, bastions, ramparts and much of the moat system.

## Representation limits

- The marker represents the fortified-city core.
- The radius is not the legal protection boundary.
- Information points are not coordinate candidates.
- Separate outer forts and the full Glomma defence system remain wider context.

## Files

- `data/places/historie/ostfold/places_historie_ostfold_batch1/fredrikstad_festning_gamlebyen.json`
- `data/coordinate-evidence/ostfold/historie/fredrikstad_festning_gamlebyen.json`
- `reports/ostfold-coordinate-fredrikstad-festning-gamlebyen-source-probe/source-summary.json`
- `reports/ostfold-coordinate-fredrikstad-festning-gamlebyen-production-2026-07-26.md`

## Next manifest item

Continue with `borgarsyssel_museum_olavsbyen` after this production change passes review and data checks.
