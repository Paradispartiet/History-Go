# St. Hanshaugen park integration checklist

Verification-only report for the current repository state. No runtime code, JSON data, image references, or quiz content was changed as part of this report.

Status key: **PASS** = check satisfied, **WARNING** = intentionally not verified or requires manual follow-up, **FAIL** = requested integration is missing or invalid.

## 1. Place data

**Status: PASS**

Checked `data/places/by/oslo/places_by.json`.

- [x] `st_hanshaugen_park` exists.
- [x] Exactly one object has `id: "st_hanshaugen_park"`.
- [x] Existing fields remain present:
  - `id`
  - `name`
  - `lat`
  - `lon`
  - `r`
  - `category`
  - `emne_ids`
  - `desc`
  - `popupDesc`
  - `quiz_profile`
- [x] Enriched fields are present:
  - `safe_facts`
  - `subplaces`
  - `history_layers`
  - `nature_profile`
  - `wonderkammer_seed`
  - `people_relations_seed`
  - `research_notes`
  - `source_summary`

## 2. Places index

**Status: PASS WITH WARNING**

Checked `data/places/places_index.json`.

- [x] `st_hanshaugen_park` exists in the index.
- [x] Exactly one index entry has `id: "st_hanshaugen_park"`.
- [!] Image quality and suitability were not checked, and no images or image references were replaced. Images are reserved for later manual handling.

## 3. Wonderkammer

**Status: FAIL**

Checked `data/wonderkammer/base.json`.

- [x] Exactly one block has `place_id: "st_hanshaugen_park"`.
- [x] The existing older chambers remain:
  - `wk_st_hanshaugen_park_lekeplass`
  - `wk_st_hanshaugen_park_bakke_og_gress`
  - `wk_st_hanshaugen_park_utsikt_og_stier`
- [ ] The requested new chambers do not exist as chambers in this file:
  - `St. Hans-tradisjonen`
  - `Frølich og parkideen`
  - `Tusen trær på haugen`
  - `Vannspeil og klassisk parkrom`
  - `Parken som bydelsanker`
  - `Utsikt som bylesing`

The current Wonderkammer block contains only the three older chambers. The place record's `wonderkammer_seed` contains related seed material, including exact titles `Frølich og parkideen` and `Tusen trær på haugen`, but seed entries are not chambers in `data/wonderkammer/base.json` and therefore do not satisfy this check.

## 4. Relations

**Status: PASS**

Checked `data/relations.json`.

- [x] Relation `rel_st_hanshaugen_frolich_parkinitiativ` exists exactly once.
- [x] It uses `place: "st_hanshaugen_park"`.
- [x] It uses `person: "fritz_heinrich_frolich"`.

## 5. People

**Status: PASS**

Loaded all 27 files listed in `data/people/manifest.json`, resolving manifest paths relative to `data/`.

- [x] All manifest-listed people files parsed successfully.
- [x] `fritz_heinrich_frolich` exists in a loaded people file.
- [x] The person lives in `data/people/by/oslo/people_by_oslo.json`.
- [x] There is exactly one `fritz_heinrich_frolich` ID across all manifest-loaded people files; no duplicate was found.

## 6. Quiz

**Status: PASS**

Checked `data/quiz/by/st_hanshaugen_park_sets.json` and `data/quiz/manifest.json`.

- [x] `data/quiz/by/st_hanshaugen_park_sets.json` exists and is valid JSON.
- [x] The quiz manifest includes the required mapping:

  ```json
  {
    "targetId": "st_hanshaugen_park",
    "file": "data/quiz/by/st_hanshaugen_park_sets.json"
  }
  ```

- [x] Every question uses `placeId: "st_hanshaugen_park"`.
- [x] Every question uses `categoryId: "by"`.
- [x] Number of sets: **6**.
- [x] Number of questions: **42** (7 in each set).
- [x] No invalid `placeId` or `categoryId` values were found.
- [x] No missing `answerIndex` values were found.
- [x] No missing or empty `options` arrays were found.
- [x] No duplicate question IDs were found.
- [x] No malformed JSON was found.
- [x] No quiz content was added or removed.

## 7. Observations

**Status: PASS**

Checked `data/observations/observations_by.json`.

- [x] A lens with `lens_id: "by_byliv"` exists.
- [x] Exactly one `by_byliv` lens exists.
- [x] It has all required fields:
  - `options`
  - `related_emner`
  - `concepts`
  - `tags`
  - `allow_note`

## 8. Leksikon

**Status: PASS**

Checked `leksikon/by/st_hanshaugen_park.html`.

- [x] The file exists.
- [x] It includes the requested source-backed sections:
  - `Kort fortalt`
  - `Høyden og utsikten`
  - `St. Hans-tradisjonen`
  - `Fra høyde til bypark`
  - `Trær, vann og klassisk parkrom`
  - `Parken som bydelsanker`
  - `Se etter når du er her`
  - `Kilder`
- [x] No statue-specific claims appear on the page.
- [x] No reservoir-specific claims appear on the page. Its references to water are limited to the general, source-backed `vannspeil`/park-room material and do not expand the reservoir research note.

## 9. Hold-back claims

**Status: PASS**

- [x] The statue-specific details remain marked `needs_primary_source_check` and `use_in_app: false` in the place record's `research_notes`.
- [x] The statue-specific research-note details were not found promoted into the checked Wonderkammer, relation, quiz, index, or St. Hanshaugen leksikon integration surfaces.
- [x] Statue-specific details should continue to require primary-source verification before expansion.
- [x] The reservoir-specific detail remains marked `needs_primary_source_check` and `use_in_app: false` in `research_notes`.
- [x] The leksikon and other checked non-quiz integration surfaces do not expand the held-back claim that the dam/water mirror is connected to an older reservoir.
- [x] Existing reservoir material is present in the source-backed St. Hanshaugen quiz data; reservoir claims should not be expanded beyond that existing quiz/source material without verification.

## 10. Manual test checklist

These checks remain for a human app run; this report does not claim that they were executed.

- [ ] Open app.
- [ ] Find St. Hanshaugen park.
- [ ] Open PlaceCard.
- [ ] Check description appears.
- [ ] Open Mer info.
- [ ] Check people list includes Fritz Heinrich Frølich if relation/person data is loaded.
- [ ] Open Wonderkammer.
- [ ] Start quiz.
- [ ] Start observation.
- [ ] Open leksikon link.
- [ ] Confirm no console errors.

## 11. Result

The integration does not currently meet the requested Wonderkammer checklist because all six named new chambers are absent from `data/wonderkammer/base.json`. Images were intentionally not verified and remain a manual warning, but the missing Wonderkammer chambers are a substantive failure rather than an image-only warning. All other automated repository checks in this report passed. The manual app checklist remains unexecuted.

**FAIL**
