# Gamle Aker kirke integration checklist

Verification date: 2026-06-06

Scope: repository-state verification only. No runtime code, JSON data, image references, or quiz content was changed. Image quality and image replacement are deliberately outside this review and must be handled manually later.

## 1. Place data

Source checked: `data/places/historie/oslo/places_historie.json`.

- [x] `gamle_aker_kirke` exists.
- [x] Exactly one object has `id: "gamle_aker_kirke"`.
- [x] Existing fields are present: `id`, `name`, `lat`, `lon`, `r`, `category`, `emne_ids`, `desc`, `popupDesc`, and `quiz_profile`.
- [x] Enriched fields are present: `safe_facts`, `subplaces`, `history_layers`, `architecture_profile`, `nature_profile`, `wonderkammer_seed`, `people_relations_seed`, `research_notes`, and `source_summary`.

**Status: PASS.**

## 2. Places index

Source checked: `data/places/places_index.json`.

- [x] `gamle_aker_kirke` exists in the index.
- [x] Exactly one index entry has `id: "gamle_aker_kirke"`.
- [ ] Image quality and suitability were not checked, and no images or image references were replaced.

**Status: PASS WITH WARNING** because image verification is explicitly deferred to manual follow-up.

## 3. Wonderkammer

Source checked: `data/wonderkammer/base.json`.

- [x] Exactly one block has `place_id: "gamle_aker_kirke"`.
- [x] The block includes all expected chambers:
  - `Oslos eldste stående bygning`
  - `Kalkstein og fossiler`
  - `Nonneseter-laget`
  - `Brannen i 1703`
  - `Kirken som ble reddet`
  - `Dronning Maud i krypten`
  - `Gruvene under kirken`
  - `Ølhaller under kirkegården`

**Status: PASS.**

## 4. Relations

Source checked: `data/relations.json`.

- [ ] No relation currently has `place: "gamle_aker_kirke"` (found: **0**).
- [ ] `rel_gamle_aker_schirmer_restaurering` is missing.
- [ ] `rel_gamle_aker_von_hanno_restaurering` is missing.
- [ ] `rel_gamle_aker_thomas_blix_prekestol_dopefont` is missing.
- [ ] `rel_gamle_aker_torvald_moseid_ostvinduer` is missing.
- [ ] `rel_gamle_aker_dronning_maud_krypten` is missing.
- [ ] `rel_gamle_aker_eivind_berggrav_maud` is missing.
- [ ] `rel_gamle_aker_haakon_vii_gjenapning` is missing.

The place object contains `people_relations_seed` records, but those seeds are not loaded relations in `data/relations.json` and therefore do not satisfy this integration check.

**Status: FAIL.**

## 5. People

Source checked: all **27** files listed in `data/people/manifest.json`. All manifest-listed files parsed successfully. Across those files, **425** person records with IDs were checked.

| Person ID | Manifest-loaded file | Result |
| --- | --- | --- |
| `heinrich_ernst_schirmer` | Not found | FAIL |
| `wilhelm_von_hanno` | `data/people/historie/oslo/people_historie_oslo.json` | PASS |
| `thomas_blix` | Not found | FAIL |
| `torvald_moseid` | Not found | FAIL |
| `dronning_maud` | Not found | FAIL |
| `eivind_berggrav` | Not found | FAIL |
| `haakon_vii_krigstid` | `data/people/historie/oslo/people_historie_oslo.json` | PASS |

- [x] No duplicate person IDs were found across manifest-loaded people files.
- [ ] Five of the seven required person IDs are absent from the manifest-loaded people data.

**Status: FAIL.**

## 6. Quiz

Sources checked: `data/quiz/manifest.json` and `data/quiz/historie/gamle_aker_kirke_sets.json`.

- [x] The quiz manifest references `gamle_aker_kirke` and points to `data/quiz/historie/gamle_aker_kirke_sets.json`.
- [x] Found **1 set** containing **5 questions** for `gamle_aker_kirke`.
- [x] Every found question uses `placeId: "gamle_aker_kirke"`.
- [x] Every found question uses `categoryId: "historie"`, which is the place's existing category.
- [x] No invalid target/place/category IDs were found in these questions.
- [x] No question is missing `answerIndex`.
- [x] No question is missing or has an empty `options` array.
- [x] No duplicate question `id` values were found within the Gamle Aker quiz file.
- [x] The relevant JSON files parsed successfully; no malformed JSON was found.
- [x] No quiz content was added or removed.

**Status: PASS.**

## 7. Observations

Source checked: `data/observations/observations_by.json`.

- [x] A lens with `lens_id: "by_byliv"` exists.
- [x] Exactly one `by_byliv` lens exists.
- [x] No observation changes are required for this verification PR.

**Status: PASS.**

## 8. Leksikon

Source checked: `leksikon/historie/gamle_aker_kirke.html`.

- [x] The file exists.
- [x] It contains `Kort fortalt`.
- [x] It contains `Middelalderkirken`.
- [x] It contains `Kalkstein og fossiler`.
- [x] It contains `Nonneseter og eierskap`.
- [x] It contains `Brann og restaurering`.
- [x] It contains `Kunst og interiør`.
- [x] It contains `Dronning Maud i krypten`.
- [x] It contains `Kirkegården og det underjordiske`.
- [x] It contains `Se etter når du er her`.
- [x] It contains `Kilder`, including links/references to Oslo byleksikon, Lokalhistoriewiki, and existing History Go data.

The requested source-backed section structure is present. This check verifies structure and cited-source presence, not a fresh external fact review.

**Status: PASS.**

## 9. Hold-back claims

Sources checked: the Gamle Aker place record, Wonderkammer block, relations data, quiz file, and leksikon page.

- [x] The claim that Olav Kyrre founded the church is not presented as a hard fact. It remains a `research_notes` item with `use_in_app: false`; its relation seed is marked `research_note_only` and `weak_traditional`.
- [x] The claim that an earlier timber church stood here is not presented as a hard fact. It remains a `research_notes` item with `use_in_app: false`; the `history_layers` wording is explicitly qualified as `mulig eldre trekirke før steinkirken`.
- [x] The claim that the site was a pre-Christian thing-site is not presented as a hard fact. It remains a `research_notes` item with `use_in_app: false` and status `not_verified_for_app`.
- [x] `source_summary.hold_back_sources` explicitly says all three claims require stronger sourcing before promotion.
- [x] None of the three claims is asserted as fact in the checked Wonderkammer chambers, relation records, Gamle Aker quiz questions, or leksikon page.

**Status: PASS.**

## 10. Manual test checklist

These checks were not executed as part of the static repository verification and remain for manual app testing:

- [ ] Open app.
- [ ] Find Gamle Aker kirke.
- [ ] Open PlaceCard.
- [ ] Check description appears.
- [ ] Open Mer info.
- [ ] Check people list includes the relation persons if people/relations are loaded. **Expected to fail or be incomplete until the missing relation records and five missing person records are resolved.**
- [ ] Open Wonderkammer.
- [ ] Start quiz.
- [ ] Start observation.
- [ ] Open leksikon link.
- [ ] Confirm no console errors.

## 11. Result

The static integration is present and valid for place data, the places index, Wonderkammer, quiz, observations, leksikon structure, and hold-back handling. However, the required loaded integration is incomplete because `data/relations.json` has no Gamle Aker relation records and five required person IDs are absent from the manifest-loaded people files. Images were not verified and remain a manual warning, but the missing relations and people are blocking failures rather than warnings.

# FAIL
