# Kistefos Træsliberi coordinate production

## Result

- Place: `kistefos_traesliperi`
- Legacy coordinate: `60.2245, 10.3715`
- Retained production coordinate: `60.22228888888889, 10.369111111111112`
- Original displacement from legacy: approximately `279.0 m`
- Coordinate change in this pass: `0 m`
- Radius: retained at `420 m`
- Status: `verified_historical_source`
- Coordinate Source Contract role: `historical_anchor`
- Locator type: `historic_site`
- Accuracy: `semantic_anchor`
- Applied identity: Kulturminne `241111`, Wikidata `Q6417316`

## Why the coordinate is retained

The 2026-07-26 production already moved the unsupported legacy point approximately 279 metres south-west to the heritage-entity coordinate for Kistefos Træsliberi. That point remains physically consistent with the preserved factory core and the independent geotagged cross-check.

This pass does not create a second artificial movement. It replaces the obsolete custom role `industrial_building_anchor` with the valid Coordinate Source Contract v1 role `historical_anchor`. Together with `historic_site`, `manual_research`, `semantic_anchor`, an explicit anchor and the current representation note, `verified_historical_source` remains the correct status.

## Identity decision

The canonical record represents the preserved wood-pulp mill and central technical-industrial core. It does not represent a generic Kistefos information point, one visitor entrance, the complete legal protection geometry or the entire modern art and sculpture destination.

The official industrial museum identifies Tresliperiet as the heart of Kistefos and documents the unusually complete machinery and production rooms. Riksantikvaren’s protection decision dated 31 October 2025 confirms that the legal cultural environment is broader than the single canonical marker.

## Applied evidence

- Wikidata `Q6417316` publishes the factory coordinate and links Kulturminne ID `241111`.
- Kistefos documents establishment in 1889, production from 1890 to 1955 and near-complete preservation of buildings and production equipment.
- The official `Levende fabrikk` page identifies the old pulp factory as the heart of the destination.
- Riksantikvaren protected the industrial complex on 31 October 2025, including the pulp mill, connected buildings, installations, former work areas, roads, water and green structures.
- Kistefos lists `Samsmoveien 41N, 3520 Jevnaker` as its current contact address.
- A geotagged photograph of the pulp mill linked to monument `241111` was taken approximately `47.9 m` from the retained anchor.
- OSM nodes `6546228596` and `10983953387` are tourism-information points and remain rejected as canonical candidates.

## Access and representation limits

- Public access follows the current Kistefos season, tickets, museum opening, guided tours, events and temporary closures.
- Historic machinery, industrial interiors, riverbanks and protected structures may require supervision or remain outside public routes.
- The marker represents the preserved pulp mill and immediate industrial core.
- The `420 m` radius is not the legal protection polygon, property boundary, museum boundary, artwork boundary, access boundary or safety zone.
- The wider art hall and sculpture park remain modern destination context.

## Files

- `data/places/naeringsliv/akershus/kistefos_traesliperi/kistefos_traesliperi.json`
- `data/coordinate-evidence/akershus/naeringsliv/kistefos_traesliperi.json`
- `reports/akershus-coordinate-kistefos-traesliperi-source-probe/source-summary.json`
- `reports/akershus-coordinate-kistefos-traesliperi-production-2026-07-26.md`

## Next manifest item

Continue with `hakadal_verk` after this contract migration passes review and data checks.
