# Damstredet / Telthusbakken integration checklist

Verification scope: repository state on the current branch. This is a report-only check; no runtime code, JSON data, image references, or quiz content was changed. Image quality and suitability are intentionally excluded because images will be handled manually later.

Status key: **PASS** = verified, **WARNING** = intentionally deferred or requires manual follow-up, **FAIL** = integration defect found.

## 1. Place data

**Status: PASS**

Checked `data/places/historie/oslo/places_historie.json`.

- [x] Exactly one place object has `id: "damstredet_telthusbakken"`.
- [x] Existing required fields are present: `id`, `name`, `lat`, `lon`, `r`, `category`, `emne_ids`, `desc`, `popupDesc`, and `quiz_profile`.
- [x] Enriched fields are present: `safe_facts`, `subplaces`, `history_layers`, `urban_profile`, `wonderkammer_seed`, `people_relations_seed`, `research_notes`, and `source_summary`.
- [x] The Wergeland and Munch entries under `people_relations_seed` are not hard relations. They are explicitly marked `needs_source_review` and `research_note_only`, respectively.

## 2. Places index

**Status: PASS WITH WARNING**

Checked `data/places/places_index.json`.

- [x] Exactly one index object has `id: "damstredet_telthusbakken"`.
- [x] The place is available in the consolidated places index.
- [!] Image quality, image selection, and replacement images were not checked. Existing image references were left unchanged and must be handled manually later.

## 3. Wonderkammer

**Status: PASS**

Checked `data/wonderkammer/base.json`.

- [x] Exactly one block has `place_id: "damstredet_telthusbakken"`.
- [x] The block contains all required chambers:
  - `Småby midt i byen`
  - `Før murbyen`
  - `Bakker som byform`
  - `Hager, gjerder og grenser`
  - `Bevaring som byvalg`
  - `Akersbakken-klyngen`

## 4. Relations

**Status: PASS**

Checked the hard-relation datasets `data/relations.json` and `data/relations_philanthropy.json`.

- [x] No relation object has `place: "damstredet_telthusbakken"`.
- [x] No hard person relation was added for Henrik Wergeland.
- [x] No hard person relation was added for Edvard Munch.
- [x] There are therefore no current hard relations for this place to list or flag.
- [x] The Wergeland/Munch objects found in the place's `people_relations_seed` remain research/context seeds only. Any future promotion to a hard relation requires independent source verification.

## 5. People

**Status: PASS**

Checked the people datasets and the Damstredet / Telthusbakken integration commit chain.

- [x] Existing person records were found for `henrik_wergeland` and `edvard_munch`; no new person stub is required.
- [x] `henrik_wergeland` is not tied to `damstredet_telthusbakken` through his `placeId` or `places` fields.
- [x] `edvard_munch` is not tied to `damstredet_telthusbakken` through his `placeId` or `places` fields.
- [x] The place-enrichment, Wonderkammer, and leksikon commits in this PR chain did not add or modify people files.
- [x] Neither person has been newly tied as a hard relation to this place without source verification.

## 6. Quiz

**Status: PASS**

Checked `data/quiz/manifest.json` and its active Damstredet / Telthusbakken file references.

- [x] Existing quiz data references `damstredet_telthusbakken`.
- [x] The manifest contains two entries for the target, and both referenced files exist:
  - `data/quiz/by/damstredet_telthusbakken_sets.json`
  - `data/quiz/historie/damstredet_telthusbakken_sets.json`
- [x] The manifest-backed data contains **7 sets and 44 questions** in total:
  - `by`: 6 sets, 42 questions
  - `historie`: 1 set, 2 questions
- [x] All 44 questions use `placeId: "damstredet_telthusbakken"`.
- [x] All questions use compatible existing categories: 42 use `categoryId: "by"`, and 2 use `categoryId: "historie"`.
- [x] No missing `answerIndex` values were found.
- [x] No missing or empty `options` arrays were found.
- [x] Every `answerIndex` points to an available option.
- [x] No duplicate question `id` or `quiz_id` values were found across the two manifest-backed files.
- [x] Both referenced quiz files parse as valid JSON.
- [x] No quiz content was added, removed, or edited by this report.

Archived/generated quiz files also contain historical references to the same target, but the counts and integrity checks above are intentionally based on the two files activated by `data/quiz/manifest.json`.

## 7. Observations

**Status: PASS**

Checked `data/observations/observations_by.json`.

- [x] The file contains `lens_id: "by_byliv"`.
- [x] Exactly one lens has that ID.
- [x] No observation changes are required for this PR.

## 8. Leksikon

**Status: PASS**

Checked `leksikon/historie/damstredet_telthusbakken.html`.

- [x] The file exists.
- [x] It contains all required sections:
  - `Kort fortalt`
  - `Småby midt i byen`
  - `Før murbyen`
  - `Bakker som byform`
  - `Hager, gjerder og grenser`
  - `Bevaring som byvalg`
  - `Akersbakken-klyngen`
  - `Se etter når du er her`
  - `Kilder`
- [x] The content sections are accompanied by a `Kilder` section that identifies the existing quality-assured History Go place, Wonderkammer, and quiz data plus the summarized area sources used for the page.
- [x] This verification confirms the source attribution present in the page; it does not independently expand or replace those sources.

## 9. Hold-back claims

**Status: PASS**

The following claims remain in `research_notes` with `use_in_app: false` and a status requiring primary-source review. They have **not** been promoted as hard facts by this integration:

- [x] Exact building dates for individual houses.
- [x] A specific Henrik Wergeland relation to individual houses or addresses.
- [x] A specific Edvard Munch relation to Damstredet / Telthusbakken.
- [x] Individual-house protection or listing status.

The corresponding `source_summary.hold_back_sources` entries reinforce the same restrictions. The research-only person seeds must not be treated as app-facing hard relations.

## 10. Manual test checklist

The following checks remain for a manual app session. They were not performed as part of this static repository verification:

- [ ] Open app.
- [ ] Find Damstredet / Telthusbakken.
- [ ] Open PlaceCard.
- [ ] Check description appears.
- [ ] Open Mer info.
- [ ] Open Wonderkammer.
- [ ] Start quiz if available.
- [ ] Start observation.
- [ ] Open leksikon link.
- [ ] Confirm no console errors.

## 11. Result

# PASS WITH WARNINGS

The data-level integration checks pass. Image quality and suitability were deliberately not verified because images will be handled manually later. The end-to-end app interactions in the manual test checklist also remain to be run; no repository defect was found by the static checks.
