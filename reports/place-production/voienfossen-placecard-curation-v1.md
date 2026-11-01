# Vøyenfossen (Vøyenfallene) — PlaceCard collection evidence review, 2026-11-01

## Identity and scope

Canonical place ID: `voienfossen`; the three falls along Akerselva between Bentsebrua and Sannerbrua, including industrial history on both riverbanks. The existing article and v4.2 source/claim record already document the individual factories, mill operations, fall rights, and architecture.

Nine entries under `place.brands` are historical/contextual labels, **not** approved canonical Brands:

1. Nedre Vøiens Kornmølle — historic mill installation and industrial history.
2. Vøiens Bomuldsspinderi — historically situated textile mill, but not a validated Brand record/sign for the present place.
3. Knud Graah A/S — historic textile company, not separately evidenced as a canonical Brand card.
4. Hjula Væverier — genuine local industrial history, no corresponding registered Brand asset.
5. Foss Spinderi — historic mill, not an authenticated Brands entry.
6. Den Norske Hesteskosømfabrik — contextual historic factory reuse, not a registered site-specific Brand.
7. Myrens mekaniske Verksted — engineering/turbine supplier discussed in the site's history.
8. Akerselvens Brugseierforening — historic water-rights association.
9. Akerselva Digitalt — information/history resource, not a physical local Brand.

`data/brands/brands_by_place.json` and `data/brands/brands_master.json` have no `voienfossen` canonical entry. Remove only the nine `place.brands` entries from canonical Place and generated Place-open. **Do not erase the names from the historical prose** and do not edit the Brands registries or create fabricated logos/signage. A documented historic mill/company may in future receive its own independently sourced structure or brand profile; that is separate work.

## Legitimate People already attached

Preserve all three existing canonical People references (and portraits), which have historical ties to industrial activity:
- `knud_graah_voyenfallene`: Knud Graah, documented cotton-spinning operator.
- `halvor_schou`: Halvor Schou, associated with Hjula.
- `oluf_nicolai_roll_nydalen`: Oluf Nicolai Roll, factory architect and engineer.

No duplicate person is created. `civication_store` keeps its four **interpretive game products**, not verified in-situ Objects. Do not fabricate a `place_card_profile` merely to make a collection grid.

## Existing content retained

- Place historical `desc` and `popupDesc` and `data/places/production/voienfossen.json` with **26** documented v4.2 claims.
- `data/quiz/historie/voienfossen_sets.json`: 4 sets containing **28** Knowledge-linked questions.
- Two ten-question QuizCards: `data/quizcards/historie/voienfossen_quizcard_v1.json` and `data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json`.
- Three existing local site-photo references `bilder/places/voienfossen.webp`, `bilder/places/voienfossen_front_portrait.webp`, `bilder/kort/places/voienfossen.webp`, Ryan Hodnett / Wikimedia Commons, CC BY-SA 4.0.
- All original coordinates, routes, photographic attribution, People runtime and source material.
- Tier remains **`v1_candidate`**, not automatically `vFerdig`.

## Source pointers

- Existing site-level v4.2 claims, per-claim source URLs and sentence coverage: `data/places/production/voienfossen.json`.
- Existing People evidence: PR #6847 and PR #6854.
- Wikimedia Commons source photograph: https://commons.wikimedia.org/wiki/File:V%C3%B8yenfallene_-_Oslo%2C_Norway_2020-09-19_%2801%29.jpg

## Gate

Only the dedicated `node --test tests/voienfossen-placecard-collections-v2.test.mjs` and relevant PR CI. The global nature-map `trikk_17_18` reference and stale global epoke-place-index are separately tracked baseline issues.
