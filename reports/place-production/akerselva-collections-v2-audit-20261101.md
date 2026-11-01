# Akerselva – PlaceCard v2 collection review (2026-11-01)

## Identity boundary
This audit concerns the canonical `by` Place `akerselva`, a continuous river route with
three route anchors. It does not combine the ~23 separately registered Akerselva Nature
stops or the independent industrial Places along the banks into one building complex.
The verified image and language records are retained.

## Badge-driven collection decisions

| Candidate | Outcome | Evidence / ownership |
| --- | --- | --- |
| People | **PASS** | Existing canonical Knud Graah (`knud_graah_voyenfallene`) and Halvor Schou (`halvor_schou`) are tied to Vøiens Bomuldsspinderi and Hjula Væveri respectively. Both have license-reviewed, identifiable portraits and People v1 claims. Place-open has exactly these two persons. |
| Objects | **BEGRUNNET N/A** for the river-wide card | No distinct, sourced physical artefact is currently registered as belonging to the *whole watercourse* rather than an individual industrial site. Existing machinery and artwork at Hjula, for example, belong to `ovre_foss` and should not be copied merely to add a collection. |
| Brands | **BEGRUNNET N/A** for the river-wide card | Hjula and Graahs Spinneri are separate enterprises anchored to their own industrial locations. No independent, evidence-backed and image-ready brand representing the entire watercourse is currently registered. |
| Structures | **BEGRUNNET N/A** for the river-wide card | Documented factories, bridges, dams and falls are already independent canonical Places: examples include `voienfossen`, `ovre_foss`, `nedre_foss` and `beierbrua`. They belong in the route and related-place system, not duplicated as members of another Place's Structure collection. |

The output is one canonical `place_card_profile_v2` collection, `people`. This is
not a claim that there are no artefacts or companies **along** Akerselva. It is
the narrower and necessary own-place decision for this river-wide profile.

## UI and invariant gates
- Only the documented People icon is present as a collection preview.
- The authentic Schou portrait and the 1891 Oslo Museum painting of Graah must both
  load and open their person entries; a missing image/icon fallback cannot close QA.
- No empty Objects, Brands or Structures collection is displayed, and no `related`
  collection is used as a substitute.
- Preserve 30 canonical fullquiz questions, the existing 10-question QuizCard,
  three spatial route anchors, i18n, Språkleksikon and the independent `frontImage`.

Relevant primary records:
- `data/places/by/oslo/places/akerselva.json`
- `data/runtime/place-open/akerselva.json`
- `data/people/natur/oslo/people_natur_oslo.json`
- `data/people/naeringsliv/oslo/ovre_foss/halvor_schou.json`
- `data/places/naeringsliv/oslo/places_naeringsliv/ovre_foss.json`
- `data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json`
- `data/places/README_place_rounds.md`

## Remaining full-production status
This closes the **PlaceCard collection decision**, not all `vFerdig` gates.
Akerselva is still a legacy Place without
`data/places/production/akerselva.json` (v4.2 claim/source record)
and `data/places/workflow/akerselva.json` (V3 workflow status).
The historical long-form article, chronology, source-claim parity and remaining
conditionally applicable modules require a separate editorial closeout before
full `vFerdig` can be asserted. Do not mark it complete based on this PR alone.
