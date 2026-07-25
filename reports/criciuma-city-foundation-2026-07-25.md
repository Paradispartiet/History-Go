# Criciúma city expansion — foundation package

Date: 2026-07-25  
Template: Oslo  
City ID: `criciuma`

## Delivered

- 40 place records across 11 canonical History GO categories
- 31 person records with explicit main and secondary place anchors
- 47 canonical person-to-place relations
- 40 separate Coordinate Evidence v1 files
- 0 coordinates marked verified; every foundation marker remains `needs_source`
- Central city registry and generic loader, without coupling Criciúma to Oslo, Lisboa or Civication files

## Canonical package

- `data/cities/manifest.json`
- `data/cities/criciuma/manifest.json`
- `data/places/by/america/brazil/criciuma/places_criciuma_01.json` through `places_criciuma_08.json`
- `data/people/by/america/brazil/criciuma/people_criciuma.json`
- `data/relations/america/brazil/criciuma/relations_criciuma.json`
- `data/coordinate-evidence/brasil/santa-catarina/criciuma/*.json`
- `js/data/city-package-loader.js`

## Content model

Oslo is the structural content model: concrete place anchors, category coverage, rounds, place-specific quiz profiles, Wonderkammer prompts, people and relations. Criciúma remains its own clean city package and does not edit unrelated city data.

## Coordinate policy

The supplied coordinates are foundation display candidates only. Every evidence record has `evidenceStatus: needs_research`, `coordinateDecision: do_not_change_coordinates_yet`, and `canBecomeVerified: false`. Verification must happen later through the ordinary coordinate-control workflow.

## Remaining production layers

Final place quiz sets and image assets are not included in this foundation PR. The place records already contain quiz-profile constraints and Wonderkammer observation prompts for those later batches.
