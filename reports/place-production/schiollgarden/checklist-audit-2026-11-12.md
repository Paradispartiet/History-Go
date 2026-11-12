# Schiøllgården — checklist audit and description repair

Date: 2026-11-12. Baseline: ba6ae2e51af4128cf3f1c8f3104f780462013cf9.
Canonical ID: `schiollgarden_prinsens_gate_26`. Category: `by`.
Branch: `codex/schiollgarden-checklist-text-20261112`.
Status: description checkpoint prepared; full production BLOCKED; not live.

## Scope and evidence

The supplied iPad screenshot shows an empty portrait image frame, duplicated introductory facts and only Om/Fagverk/Kilder navigation. Repository source confirms no `image`, `frontImage`, `frontImageMeta`, `fagverk`, `underbadge_ids` or `place_card_profile` in the Place source. Runtime place-open has empty people/brands/events and no language or reading trail. No new image or runtime change is claimed by this PR.

Rules consulted: current PLACE_PRODUCTION_CHECKLIST v2.6, reference v1, profiles, README_place_rounds, Badge index/by/routing, Objects and Brand contracts, description canonical 4.2.1, v1 minimum and V3 workflow documentation. This is a description-only checkpoint, not a confirmed full-profile preflight. No production profile or final collection plan has been locked. The separate quiz workflow remains required.

## Null measurement and decisions

| Layer | Finding | Disposition |
| --- | --- | --- |
| Identity | Standing 1881 building, distinct from demolished lodging house | Preserve explicit boundary in factuality packet |
| Coordinates | Existing verified Geonorge address point | Preserve; no new field visit or geometry certification claimed |
| Category | By & arkitektur | Preserve; underbadges still need confirmed production preflight |
| Description | Repeated opening, generic explanation, exposed internal ID and model boundary | Rewritten; 13 inspectable claims; all 17 sentences mapped |
| Sources | External links without a production packet | Add independent factuality packet and source labels |
| Images | No Place image fields/assets | BLOCKED until local published image and independent portrait variant are integrated and inspected |
| Fagverk | No Place-owned block; emne reference alone is insufficient | BLOCKED; dedicated standard/full learning job and registry required |
| Collections | No operative PlaceCard profile | Pending source-led candidate audit; do not invent four collections |
| People | Henrik Nissen, Oscar Schjøll, Christian Reuter and Hans Halvorsen appear in inspected sources | Candidates only; direct roles require canonical profile/image review before publication |
| Objects | Furnishings are described historically | Candidate research only; no identified surviving object or member asset certified |
| Brands | Halvorsens Conditori and Norske Alliance are source-backed research candidates | Not approved Brands; owner/place boundaries, evidence and authentic logo assets need review |
| Structures | A building must not be duplicated as an artificial member of itself | No candidate approved; collection scope unresolved |
| Fullquiz / Knowledge | No matching target found in active quiz material search | BLOCKED; separate canonical quiz production workflow |
| QuizCard | No matching asset filename or runtime binding found | BLOCKED; nine readiness prompts are not a playable quiz or QuizCard |
| Language | Runtime language is null | BLOCKED; research name/Alliancegården history and materialize through canonical owner |
| Chronology | 1881 already represented in epoke index | Preserve; research later exact anchors without changing approximate dates into years |
| Stories | Existing Wonderkammer historical layer | Preserve legacy pending proper owner audit; not certified as a Story |
| Before/after | Historical building photograph located | Candidate only; no comparison pair certified |
| News / reading trails | Empty runtime reading list; inspected official and heritage texts offer candidates | Research/materialize; no blanket N/A |
| Visits / favourite / rewards | Not exercised in this checkpoint | Pending UI QA; no status migration |
| Mobile / desktop / flip | Screenshot is baseline evidence only | BLOCKED; final browser QA not performed |

## Inspected source evidence

- Oslo municipality / Byantikvaren, [Stortingsmennene i byen](https://www.oppdagkvadraturen.no/stoppesteder/stortingsrepresentantene): Hals, Borchsenius, 1815–1816, private lodging and replacement of earlier houses.
- [Stortingsarkivet, building committee history](https://arkivportalen.no/api/digital-asset/download/no-STA_arkiv_000000006566-2.pdf), pp. 1, 4–5: actual state purchase on 2 June 1972, building architects and Halvorsens. This avoids confusing later adaptation/occupation in 1977 with acquisition. Exact demolition year is omitted because sources differ.
- Fortidsminneforeningen, [Et kulturminne for den gode smak](https://fortidsminneforeningen.no/aktuelt/nyrenoverte-halvorsens-conditori/): double tenement, room furnishings and Østerskjelleren. The emperor anecdote concerns another confectionery; it is deliberately not transferred here.
- [Stortinget's 2019 project report](https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/Nyhetsarkiv/Hva-skjer-nyheter/2019-2020/stortingets-byggeprosjekt-er-gjennomfort/): retained facade, modern interior, new technical level and post/receiving tunnel. Used as a historical report, not proof of 2026 operating conditions.
- [Prinsens gate 26 Oslo.jpg](https://commons.wikimedia.org/wiki/File:Prinsens_gate_26_Oslo.jpg): own work by Mahlum, dated 31 May 2008, public-domain declaration, 1600×995. Correct building identified by address and heritage ID 166098. Not downloaded, cropped, integrated or passed as a present-day photo in this checkpoint.

## Validation

- `node --test tests/place-description-production-v4_2.test.mjs tests/place-description-length-policy.test.mjs tests/place-description-ingress-policy.test.mjs`: 22/22 PASS.
- `validatePacket` followed by the existing `applySourceLedLengthPolicy`: no blocking findings for this Place. The canonical policy treats word counts as guidance; no validator changed.
- Raw repository audit with source-led length policy: baseline 272 packets / 228 quiz-volume findings; after 273 packets / 228 findings. Exact issue-object comparison: zero new findings. The actual canonical CLI also applies its existing Micro Place quiz exception: all 228 findings are valid Micro Places with quizMode=none, leaving ZERO blocking errors. `node scripts/validate-place-description-production-v4_2_policy.mjs --changed --base ba6ae2e51af4128cf3f1c8f3104f780462013cf9 --head HEAD`: PASS, 273 packets, 257 ready, 0 blocking errors. No policy was modified.
- Readiness prompts were reviewed against the actual popup text and removed/replaced where the answer appeared only in the ingress.
- Generated indexes, place-open and translations were not included in the description-only PR, as required by description scope isolation. They remain an explicit downstream integration checkpoint.
- No browser verification, image load, flip or quiz-runtime PASS is claimed.

## Six-part quality assessment

| Dimension | Score | Evidence / limit |
| --- | ---: | --- |
| Correctness and evidence | 4/5 | Four inspected historical sources; 13 claims; acquisition vs later occupation separated |
| Coverage and completion | 2/5 | Description checkpoint only; image/Fagverk/quiz/collections and final QA remain open |
| Editorial quality | 4/5 | Internal production prose removed; concrete lodging, rooms, serving and rebuilding history |
| Technical integrity | 3/5 | 22 tests pass; canonical changed-description gate has zero errors; runtime materialization/UI remains pending |
| Safety and responsibility | 4/5 | No private address data added; historical image not passed as 2026 documentation; uncertainties bounded |
| Maintainability and auditability | 4/5 | Sentence-to-claim mapping, hashes, reviews, independent readiness prompts and scoped diff |

Total: 21/30. Full production does not pass the quality gate. Keep PR draft; do not describe this Place as complete, v1 or high quality end-to-end.
