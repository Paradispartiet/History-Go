# Akerselva – vFerdig recovery audit (31.10.2026)

## Scope
Canonical city Place `akerselva` (not the 20+ distinct Nature stops along the Akerselva route). This note records verified repository state after the archived Work session; it is **not** a vFerdig acceptance.

## Verified on main
- Canonical Place: `data/places/by/oslo/places/akerselva.json`, id `akerselva`, category `by`.
- Three explicit river route anchors (Nydalen, Grünerløkka, Vaterland), with geometry status `verified_geometry`. The primary point is a route anchor, not the centre of the river.
- Canonical `desc` and `popupDesc` describe industrial water power, factories and workers, pollution and cleanup, and current reuse of industrial buildings.
- Existing media are Wikimedia Commons redirect URLs in `image` and `cardImage`; no locally recovered vFerdig image is asserted.
- The active fullquiz is registered in `data/quiz/manifest.json` as five sets of six questions (30 total) from `data/quiz/naeringsliv/akerselva_industri_sets_merged.json`. A targeted regression test now asserts the existing manifest, answers, source URLs and Knowledge links. A separate legacy quiz metadata file exists at `data/quiz/by/akerselva.json`. It has older generic text, an older image reference, and a different `emne_ids` list. Do not copy it over the canonical Place.
- Historical People profiles along Akerselva and separate Nature route places exist; these must not be conflated with the canonical city Place.
- Production branch `production/akerselva-vferdig-20261031` was nine commits behind main and zero ahead at time of inspection. Reported local commit `f23628af` could not be resolved on GitHub.

## Implemented in recovery PR #6838
- A ten-question QuizCard from ten **existing** fullquiz questions is registered in `data/quizcards/naeringsliv/manifest.json`. Source question IDs, answer keys and Knowledge links are retained; the QuizCard adds no questions to the 30-question fullquiz.
- The Akerselva-only entries in `en.json`, `es.json` and `pt.json` have been translated to the current canonical Norwegian eight-paragraph article. The three entries now carry canonical source hash `db217cea5131ef90`. Other places in those language files are unchanged.
- Commons metadata for the existing landscape image confirms Reem78, 19 August 2015, CC BY-SA 4.0 and 4160×2336 original resolution. Current canonical rights fields and the generated place-open payload already agree. The image has **not** been recropped, replaced, locally downloaded or visually accepted in the app.
- Added contract tests for fullquiz/manifest/Knowledge, QuizCard source parity, Fagverk and People primary-place boundaries, i18n source-freshness and image metadata/runtime parity. Direct JSON contract verification for the affected places passed. GitHub Actions on the latest head still determine merge readiness.

## Open gates for vFerdig
1. Recover or rebuild the missing local changes against current main; do not treat the archived session's description as committed files.
2. The manifest currently resolves to 30 fullquiz questions, not the 35 previously reported locally (five sets of six). The ten-question QuizCard is now present and sourced from existing questions. Resolve the five-question discrepancy from actual production evidence before increasing the quiz count.
3. The canonical Fagverk is curated and the existing People retain their documentary anchor places; verify their **actual UI** rendering. The image license is independently checked; photo framing/crop in PlaceCard is still unverified.
4. nb is canonical; en/es/pt entries have been synchronised to its content and hash. The actual language-switching UI still needs checking.
5. Complete relevant PR CI on the latest head and check the moving main branch before merging. No vFerdig promotion without resolving the remaining gates.

## Preservation rules
Preserve coordinates/route anchors, stable question and place IDs, user progress, unrelated Akerselva Nature stops, and existing photography credits. Do not substitute a person portrait or generated image for the Akerselva place photograph.

## Outcome
Recovery work includes an active QuizCard, repaired language content and data contract tests. No complete vFerdig or visual QA is claimed.