# Oslo kultureiendommer completeness pass — batch 11

Date: 2026-07-19

## Minneparken

No canonical History Go record was found for `Minneparken` as a place. Existing `middelalder_oslo` / Middelalderparken is a different park south of Bispegata, while Minneparken is the separate ruin park containing St. Hallvardskatedralen, Klosterkirken and Olavsklostret.

Oslo kommune documents Minneparken as a distinct historical area opened to the public in 1932. The park contains major medieval church ruins and burial grounds. The current expansion work removes the 1960s concrete cover over parts of St. Hallvardskatedralen and restores a larger accessible ruin landscape.

## Representation decision

Create one canonical `historie` place: `minneparken_gamlebyen`.

The three principal ruin groups are treated as historical layers within the park rather than as three new overlapping canonical map markers. This keeps the physical model coherent while preserving their individual significance in the content and quiz profile.

## Coordinate decision

Minneparken is a park/ruin area, so an address point is not appropriate. Use the named OpenStreetMap park geometry `way 111546637`, cross-checked against Oslo kommune's official Minneparken cultural-property page.

Display anchor:
- lat: `59.90616`
- lon: `10.76884`
- role: `area_anchor`
- source object: `osm-way:111546637`

This point represents the named park geometry, not one individual ruin.

## Sources

- Oslo kommune — Minneparken: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/
- OpenStreetMap way 111546637, named Minneparken, used only for the physical park geometry.
