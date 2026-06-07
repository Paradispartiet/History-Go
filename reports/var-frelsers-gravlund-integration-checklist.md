# Vår Frelsers gravlund integration checklist

Verification date: 2026-06-07

Scope: repository-state verification only. No runtime code, JSON data, image references, or quiz content was changed. Image quality and suitability were deliberately not assessed because images will be handled manually later.

## 1. Place data

Source checked: `data/places/historie/oslo/places_historie.json`.

- [x] `var_frelsers_gravlund` exists.
- [x] Exactly one object has `id: "var_frelsers_gravlund"`.
- [x] The existing fields are present: `id`, `name`, `lat`, `lon`, `r`, `category`, `emne_ids`, `desc`, `popupDesc`, and `quiz_profile`.
- [x] The enriched fields are present: `safe_facts`, `subplaces`, `history_layers`, `cemetery_profile`, `wonderkammer_seed`, `people_relations_seed`, `research_notes`, and `source_summary`.

Result: **PASS**.

## 2. Places index

Source checked: `data/places/places_index.json`.

- [x] `var_frelsers_gravlund` exists in the index.
- [x] Exactly one index entry has `id: "var_frelsers_gravlund"`.
- [ ] Image quality was not checked, and no images or image references were replaced.

Result: **PASS WITH WARNING** — index integration is valid, but images remain intentionally unverified for later manual handling.

## 3. Wonderkammer

Source checked: `data/wonderkammer/base.json`.

- [x] Exactly one place block has `place_id: "var_frelsers_gravlund"`.
- [x] The block includes all required chambers:
  - `Gravlunden fra 1808`
  - `Æreslunden`
  - `Ibsen, Bjørnson og Munch`
  - `Gravkunst og status`
  - `Et register over Norge`
  - `Stille parkrom`
  - `Gravlund og Gamle Aker-laget`

Result: **PASS**.

## 4. Relations

Source checked: `data/relations.json`.

- [x] Relations with `place: "var_frelsers_gravlund"` exist.
- [x] There are 11 matching relations.
- [x] All required relation IDs exist:
  - `rel_var_frelsers_henrik_ibsen_buried`
  - `rel_var_frelsers_bjornstjerne_bjornson_buried`
  - `rel_var_frelsers_edvard_munch_buried`
  - `rel_var_frelsers_henrik_wergeland_buried`
  - `rel_var_frelsers_camilla_collett_buried`
  - `rel_var_frelsers_christian_krohg_buried`
  - `rel_var_frelsers_oda_krohg_buried`
  - `rel_var_frelsers_rikard_nordraak_buried`
  - `rel_var_frelsers_johan_sverdrup_buried`
  - `rel_var_frelsers_marcus_thrane_buried`
  - `rel_var_frelsers_arnulf_overland_buried`

Result: **PASS**.

## 5. People

Source manifest checked: `data/people/manifest.json`.

- [x] All 27 files listed by the manifest exist and parse as JSON.
- [x] The manifest-loaded files contain 426 person records.
- [x] No duplicate person IDs were found across manifest-loaded people files.
- [x] Every required person exists exactly once and is linked to `var_frelsers_gravlund` through either `placeId` or `places`.

| Person ID | Manifest-loaded file | Link to Vår Frelsers gravlund |
| --- | --- | --- |
| `henrik_ibsen` | `data/people/historie/oslo/people_historie_oslo.json` | `places` |
| `bjornstjerne_bjornson` | `data/people/litteratur/oslo/people_litteratur_oslo.json` | `places` |
| `edvard_munch` | `data/people/historie/oslo/people_historie_oslo.json` | `places` |
| `henrik_wergeland` | `data/people/litteratur/oslo/people_litteratur_oslo.json` | `places` |
| `camilla_collett` | `data/people/litteratur/oslo/people_litteratur_oslo.json` | `places` |
| `christian_krohg` | `data/people/historie/oslo/people_historie_oslo.json` | `places` |
| `oda_krohg` | `data/people/historie/oslo/people_historie_oslo.json` | `places` |
| `rikard_nordraak` | `data/people/musikk/oslo/people_musikk_oslo.json` | `placeId` and `places` |
| `johan_sverdrup` | `data/people/politikk/oslo/people_politikk_oslo.json` | `places` |
| `marcus_thrane` | `data/people/historie/oslo/people_historie_oslo.json` | `placeId` and `places` |
| `arnulf_overland` | `data/people/historie/oslo/people_historie_oslo.json` | `places` |

Result: **PASS**.

## 6. Quiz

Sources checked:

- `data/quiz/manifest.json`
- `data/quiz/historie/var_frelsers_gravlund_sets.json`
- `data/stories/stories_manifest.json`
- `data/stories/stories_var_frelsers_gravlund.json`

Findings:

- [x] Existing quiz data references `var_frelsers_gravlund`.
- [x] Existing story data references `var_frelsers_gravlund`.
- [x] The quiz manifest has exactly one set entry for `targetId: "var_frelsers_gravlund"`.
- [x] Its referenced file, `data/quiz/historie/var_frelsers_gravlund_sets.json`, exists and parses as JSON.
- [x] The story manifest has an entry for `entity_id: "var_frelsers_gravlund"`; its referenced story file exists, parses as JSON, and contains one story with `place_id: "var_frelsers_gravlund"`.
- [x] Vår Frelsers quiz content contains **1 set and 5 questions**.
- [x] All 5 questions use `placeId: "var_frelsers_gravlund"`.
- [x] All 5 questions use the compatible existing category `categoryId: "historie"`.
- [x] No Vår Frelsers question has a missing or non-integer `answerIndex`.
- [x] No Vår Frelsers question has missing or malformed `options`; each has at least two options.
- [x] No duplicate or missing question IDs were found in the Vår Frelsers quiz content.
- [x] No malformed JSON was found in the Vår Frelsers quiz or story files checked.
- [x] No quiz or story content was added, removed, or edited.

Result: **PASS**.

## 7. Observations

Source checked: `data/observations/observations_by.json`.

- [x] A lens with `lens_id: "by_byliv"` exists.
- [x] Exactly one `by_byliv` lens exists.
- [x] No observation changes are required for this verification PR.

Result: **PASS**.

## 8. Leksikon

Source checked: `leksikon/historie/var_frelsers_gravlund.html`.

- [x] The file exists.
- [x] It contains all requested sections:
  - `Kort fortalt`
  - `Gravlunden fra 1808`
  - `Æreslunden`
  - `Ibsen, Bjørnson og Munch`
  - `Flere historiske personer`
  - `Gravkunst og status`
  - `Stille parkrom`
  - `Nær Gamle Aker kirke`
  - `Se etter når du er her`
  - `Kilder`
- [x] The page identifies its basis as summarized sources and quality-assured History Go data and includes a six-item source list covering the existing place, Wonderkammer, relations, quiz/story data, and Vår Frelsers summaries.

This is a structural integration check; it does not independently re-research every historical statement on the page.

Result: **PASS**.

## 9. Hold-back claims

Sources checked included the place record's `research_notes` and `source_summary`, plus the app-facing place fields, Wonderkammer block, Vår Frelsers quiz questions, and leksikon page.

- [x] Exact grave field/row/number data remains a research note with `status: "needs_primary_source_check"` and `use_in_app: false`.
- [x] Precise protected-gravestone counts remain a research note with `status: "needs_primary_source_check"` and `use_in_app: false`.
- [x] First-burial details remain a research note with `status: "needs_primary_source_check"` and `use_in_app: false`.
- [x] The three hold-back claims are reiterated in `source_summary.hold_back_sources`.
- [x] No exact field/row/number data, precise protected-gravestone count, or first-burial detail was found promoted as a hard fact in the checked app-facing place data, Wonderkammer content, quiz content, or leksikon page.

Result: **PASS**.

## 10. Manual test checklist

The following checks remain for a human tester in a runnable app environment:

- [ ] Open app.
- [ ] Find Vår Frelsers gravlund.
- [ ] Open PlaceCard.
- [ ] Check description appears.
- [ ] Open Mer info.
- [ ] Check people list includes buried-person relations if people/relations are loaded.
- [ ] Open Wonderkammer.
- [ ] Start quiz if available.
- [ ] Start observation.
- [ ] Open leksikon link.
- [ ] Confirm no console errors.

Manual UI execution is outside this report-only repository verification. The data checks above indicate that the required integration records are present for these flows.

## 11. Result

# PASS WITH WARNINGS

All requested repository-level integration checks passed. Images were intentionally not verified or changed and must be handled manually later. The end-to-end UI checklist also remains a manual test; no runtime code was changed as part of this verification-only report.
