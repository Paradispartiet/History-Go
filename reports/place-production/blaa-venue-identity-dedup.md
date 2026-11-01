# Blå – duplicate Place identity and misplaced legacy marker closeout (2026-11-01)

## Confirmed issue and evidence

There were **two active Place IDs with exactly the same name and GPS point**, not two actual concert venues:

| Place ID | Canonical file | Position as of 2026-11-01 | Decision |
| --- | --- | --- | --- |
| `blaa` | `data/places/musikk/oslo/places_musikk/blaa.json` | 59.920159, 10.752843 | Keep as **only active Blå venue** |
| `bla` | `data/places/subkultur/oslo/places_subkultur/bla.json` | 59.920159, 10.752843 | Deactivate duplicate; retain source |
| `elvestrekning_bla_brenneriveien` | `data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json` | 59.92000495695905, 10.753194575921878 | Keep: genuinely different river-segment Place |

The legacy `bla` source's own `coordNote` explicitly documents a previous marker **289.4 m** away that was already corrected on 2026-07-24. Both Place IDs were subsequently still included in the active index. This is an identity/duplicate issue, **not** grounds to reposition the verified venue point.

Blå's official website, Oslo byleksikon, and the Norwegian company registry all confirm **Brenneriveien 9C, 0182 Oslo**. Both source IDs cite OpenStreetMap POI node **4312299494**, consistent with the canonical coordinate. See:
- https://www.blaaoslo.no/kontakt-oss
- https://oslobyleksikon.no/side/Bl%C3%A5
- https://virksomhet.brreg.no/nb/oppslag/underenheter/979197071

## Corrective action

1. Add `bla` to `data/places/place_exclusions.json`; retain its original split Place file as reversible historical evidence and for possible saved-progress migration.
2. Regenerate the light Places index semantics by removing exactly `bla`. The active map now contains **one Blå music venue**. Preserve `elvestrekning_bla_brenneriveien` as a distinct natural-river Place.
3. Remove the now-obsolete generated `data/runtime/place-open/bla.json`; the build explicitly deletes runtime files absent from the active Places index.
4. **Do not discard the unique subcultural Story.** Keep ID `st_bla_elvekant_nattmusikk_1998`, reanchor its `place_id` and Story manifest entry to `blaa`, synchronize `data/runtime/stories-all/part-001.json`, and show both Blå Stories in the surviving Place-open.
5. **Do not discard the verified Blå Brand.** Move the by-place mapping `bla: ["bla"]` to `blaa: ["bla"]` without changing Brand ID or brand master. Update surviving runtime Brand collection using the existing canonical record.
6. Preserve the two existing named musician People associations (Jan Garbarek and Bugge Wesseltoft). Legacy collective/group People profiles still referencing retired `bla` are **not** upgraded to a real People collection without a separate historical and image audit.
7. Keep all **27/27** source-verified v4.2 claims, all **30/30 Knowledge-linked fullquiz** questions and **10/10 QuizCard** questions, and the original three licensed Blå photos (Marthe Thu, Wikimedia Commons, CC BY-SA 4.0). No new quizzes, fictional objects or fabricated logos are introduced.

## Scope and remaining work

This is **venue identity deduplication**, not blanket removal of all historical occurrences of the string “Blå.” The river segment, neighboring street art and related venues are distinct geography.

Existing local user saved state keyed on the retired ID `bla` is not automatically rewritten by a JSON-only data correction; preserve the source data and avoid falsely claiming local-progress migration. If legacy state migration becomes necessary, perform it as a separate, tested application-code change.

Production tier remains **`v1_candidate`**. Regression: `node --test tests/blaa-venue-identity-dedup.test.mjs`, plus relevant required PR gates. The unrelated pre-existing `trikk_17_18` nature-map reference failure must not be hidden by changing the Blå data.
