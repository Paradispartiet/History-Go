# Rockefeller Music Hall – correction of false Folkets Hus Story (2026-11-01)

## Factual audit

The existing Place `rockefeller` and the v4.2 production packet correctly identify **Rockefeller Music Hall** inside the **former Torggata bad** (formerly a municipal swimming bath), with a dedicated audience entrance **Mariboes gate 5B, Oslo**. The nearby **John Dee** venue opened in the same building in 1997 and uses **Mariboes gate 5A**. **Folkets Hus** at Youngstorget is a distinct building.

However the separately authored Story `data/stories/stories_rockefeller.json` incorrectly called itself **"Folkets Hus ble konsertscene"**, claimed Rockefeller opened in the Folkets Hus complex, and repeated this error in its introduction, main text and arc. This is a documented **identity and historical-factuality defect**, not a new place/coordinate issue.

### Corrected Story

- Title changed to **"Torggata bad ble konsertscene"**.
- Documents municipal bath closure **1980**, opening of Rockefeller Music Hall **14 March 1986**, former swimming pool reuse, main entrance **Mariboes gate 5B**, **Jonas Fjeld-band** on opening night, Young Neils annual Christmas concerts from **1992**, and separate John Dee opening **1997**.
- Explicitly distinguishes **Folkets Hus** from Torggata bad.
- Replaces weak/free-form source labels with direct source objects (title and HTTP URL) that support Story-to-epoch provenance, using:
  1. [Oslo byleksikon: Rockefeller](https://oslobyleksikon.no/side/Rockefeller)
  2. [Rockefeller: Om oss](https://www.rockefeller.no/om-oss)
  3. [Rockefeller: Kontakt](https://www.rockefeller.no/kontakt)
  4. [Ballade: Rockefeller fyller 20 år](https://www.ballade.no/bransjen/rockefeller-fyller-20-ar/)
  5. [Oslo byleksikon: Folkets hus](https://oslobyleksikon.no/side/Folkets_hus)
- **Preserves Story ID** `st_rockefeller_folkets_hus_ble_konsertscene` verbatim for the user's existing saved progression. The historical string in the technical ID is a legacy ID, not a claim about the building. No new Story ID is created.
- Synchronizes the Story in `data/runtime/stories-all/part-005.json`, `data/runtime/place-open/rockefeller.json` and derived `data/epoker/epoke-place-index.json`. No changes to venue coordinates.

## Protected PlaceCard and quiz

- Existing canonical `rockefeller` remains the sole venue identity: `data/places/musikk/oslo/places_musikk/rockefeller.json`.
- All **22/22** verified v4.2 claims are left intact.
- All **30/30** Knowledge-linked fullquiz questions and their original ten QuizCard derived questions stay intact.
- All three existing licensed photo variants (Birgit Fostervold / Wikimedia Commons, CC BY-SA 4.0) and original geographic coordinates are retained.
- Existing People `mari_boine`, `joachim_nielsen`, `morten_harket` remain unchanged; no new People/Objects/Brands or fake collection profile.
- John Dee, Torggata bad and nearby Folkets Hus are not merged into this Place and do not change their own IDs.

## Verification and status

Focused test `node --test tests/rockefeller-torggata-bad-story.test.mjs`; Story governance, Place-open sync, source-backed epoke contract, v4.2 gate, music quiz/QuizCard parity and main CI. Full production tier is **not** automatically upgraded to `vFerdig`.
