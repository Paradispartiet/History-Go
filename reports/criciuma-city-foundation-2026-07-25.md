# Criciúma city expansion — foundation package

Date: 2026-07-25  
Template: Oslo  
City ID: `criciuma`

## Scope

- 40 place records in eight city batches
- 31 person records with explicit main and secondary place anchors
- 8 place points verified or context-verified against open-map geometry
- 32 explicit coordinate candidates awaiting the ordinary coordinate-control workflow
- Categories: by (8), historie (11), kunst (5), litteratur (1), naeringsliv (4), natur (2), politikk (1), popkultur (1), scenekunst (1), sport (3), vitenskap (3)

## Canonical package

- `data/cities/criciuma/manifest.json`
- `data/places/by/america/brazil/criciuma/places_criciuma_01.json` through `places_criciuma_08.json`
- `data/people/by/america/brazil/criciuma/people_criciuma.json`

## Runtime integration

The current loaders use flat global manifests. Until the generic city-package loader is introduced, the Criciúma place batches are activated through the existing international split-manifest mechanism, and the person records are mirrored into one already loaded international people file. The canonical Criciúma files remain separate and authoritative. `data/Civication/locations/manifest.json` registers Criciúma with center, Parque das Nações and Mina Octávio Fontana anchors.

## Content principles

Every person has one main place and explicit secondary places. Every place has category, coordinate status, rounds, source links, a place-specific quiz profile and Wonderkammer observation prompts. No candidate coordinate is presented as verified.

## Next production layers

This foundation does not yet include final quiz sets or image assets. Those should be produced place by place after coordinate review and source verification, using the canonical quiz workflow and normal-opening rule.
