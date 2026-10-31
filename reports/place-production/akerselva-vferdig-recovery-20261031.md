# Akerselva – vFerdig recovery audit (31.10.2026)

## Scope
Canonical city Place `akerselva` (not the 20+ distinct Nature stops along the Akerselva route). This note records verified repository state after the archived Work session; it is **not** a vFerdig acceptance.

## Verified on main
- Canonical Place: `data/places/by/oslo/places/akerselva.json`, id `akerselva`, category `by`.
- Three explicit river route anchors (Nydalen, Grünerløkka, Vaterland), with geometry status `verified_geometry`. The primary point is a route anchor, not the centre of the river.
- Canonical `desc` and `popupDesc` describe industrial water power, factories and workers, pollution and cleanup, and current reuse of industrial buildings.
- Existing media are Wikimedia Commons redirect URLs in `image` and `cardImage`; no locally recovered vFerdig image is asserted.
- A separate legacy quiz metadata file exists at `data/quiz/by/akerselva.json`. It has older generic text, an older image reference, and a different `emne_ids` list. Do not copy it over the canonical Place.
- Historical People profiles along Akerselva and separate Nature route places exist; these must not be conflated with the canonical city Place.
- Production branch `production/akerselva-vferdig-20261031` was nine commits behind main and zero ahead at time of inspection. Reported local commit `f23628af` could not be resolved on GitHub.

## Open gates for vFerdig
1. Recover or rebuild the missing local changes against current main; do not treat the archived session's description as committed files.
2. Confirm the effective fullquiz question-set paths and actual count (the claimed 35 questions are **unverified**); verify answers, sources, canonical Knowledge binding, and the ten QuizCard questions.
3. Confirm PlaceCard and Fagverk runtime links, relevant People connections, local/licensed image and its crop.
4. Verify nb/en/es/pt text on the canonical Place and in actual runtime language switching; maintain consistency with the canonical history.
5. Run narrowly scoped generated-file/quiz/Fagverk checks and required PR CI. Only then consider merge and vFerdig promotion.

## Preservation rules
Preserve coordinates/route anchors, stable question and place IDs, user progress, unrelated Akerselva Nature stops, and existing photography credits. Do not substitute a person portrait or generated image for the Akerselva place photograph.

## Outcome
Recovery context is preserved as a committed audit. No completion or visual QA is claimed.