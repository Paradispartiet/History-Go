# Hunnfeltet gravfelt – coordinate production

Date: 2026-07-26

## Result

- Place: `hunnfeltet_gravfelt`
- Previous coordinate: `59.2182, 11.0368`
- Applied coordinate: `59.21764, 11.07646`
- Displacement: approximately `2,257.8 m`
- Radius: `360 m` retained
- Status: `verified_historical_source`
- Role: `archaeological_field_anchor`
- Source object: `osm-node:8374670062;wikidata:Q11976121`

## Identity resolution

Hunnfeltet is not one grave and not one compact polygon represented by the legacy point. Store norske leksikon describes a large and well-preserved burial landscape with more than 100 mounds, cairns and stone circles, normally divided into:

- Vestfeltet: predominantly burial mounds
- Sydfeltet: predominantly circular stone settings
- Midtfeltet: predominantly cairns

The named archaeological-site object `Hunn (Steinringfeltet)` in Sydfeltet is used as the stable physical and visitor anchor for the combined History Go record. This does not assert that the point is the centroid of all three subfields.

## Applied source

OpenStreetMap node `8374670062` is tagged as an archaeological site and visitor attraction, is named for the Hunn stone-ring field and is linked to Wikidata `Q11976121`. Its coordinate is:

- `59.21764, 11.07646`

Visit Fredrikstad & Hvaler identifies the stone-ring field as the most visible Hunn destination on Oldtidsruta and describes stone circles, smaller graves, cairns and other traces distributed through a larger landscape. Fredrikstad museum documents the 1950–1952 investigations as an attempt to understand a complete Iron Age farm environment and its landscape.

## Rejected candidates

- Legacy point `59.2182, 11.0368`: approximately 2.26 km west of the field and without a source-object identity.
- OSM node `803006104`, Hunnfeltet: tourism-information point, approximately 180.7 m from the applied anchor.
- OSM node `803006407`, Steinringene på Hunn: information sign, approximately 76.8 m from the applied anchor.
- OSM node `6271663565`, Oldtidspark: visitor park infrastructure, approximately 89.6 m from the applied anchor.
- OSM node `803006030`, Helleristning: separate archaeological rock-art object east of the stone-ring field.
- Ravneberget: separate hillfort north of the burial field and not a substitute for the gravfelt coordinate.

## Radius decision

The existing 360 m gameplay radius is retained. It covers Sydfeltet, the principal stone rings and part of the immediate burial landscape. Published map relationships place Midtfeltet approximately 330 m northwest and Vestfeltet approximately 510 m northwest of the applied anchor.

The radius is explicitly not:

- the full archaeological extent of Vestfeltet, Sydfeltet and Midtfeltet
- an Askeladden locality or protection polygon
- a property boundary
- a claim that every individual grave lies within the gameplay circle

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch1/hunnfeltet_gravfelt.json`
- `data/coordinate-evidence/ostfold/historie/hunnfeltet_gravfelt.json`
- `reports/ostfold-coordinate-hunnfeltet-source-probe/source-summary.json`
- `reports/ostfold-coordinate-hunnfeltet-production-2026-07-26.md`

## Queue

The next manifest entry after Hunnfeltet is `tune_skipet_funnsted`.
