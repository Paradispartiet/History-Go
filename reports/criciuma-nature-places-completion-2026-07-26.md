# Criciúma nature places completion

Date: 2026-07-26

## Scope

Completes the five nature records from `places_criciuma_10` against the canonical nature-round and coordinate contracts.

## Completed round content

Each place now has concrete content for tasks, nature, badges, training, Civication, brands, before/now, stories and lexicon. Manual `rounds` overrides and empty `people` arrays were removed.

## Coordinate result

- Parque Ecológico Municipal José Milanese: `verified_geometry` at the published research-fragment anchor 28°40′39″S, 49°22′11″W.
- Rio Criciúma: `verified_geometry` as a linear-area record using the named OpenStreetMap network, the public Rua Henrique Lage display anchor and the Rio Sangão confluence at OSM node 1265531584.
- Morro Casagrande, Bosque do Repouso and Morro Albino e Estevão: remain `needs_source`; custom noncanonical evidence decisions were normalized to `needs_geometry`. Current municipal polygons and legal public observation anchors are still required.

## Runtime integration

- 5 stories in `stories_criciuma_natur_completion_batch1.json`
- story file registered in the already loaded nature extra manifest
- 5 lexicon articles in a new Criciúma nature file
- lexicon file registered in the canonical manifest
- city coordinate status updated from 50/0 to 48/2 needs-source/verified

## Validation

The dedicated test verifies all nine nature rounds, canonical badge IDs, safe public tasks/training, story and lexicon manifest loading, evidence lifecycle, coordinate split and unchanged 50-place city count.
