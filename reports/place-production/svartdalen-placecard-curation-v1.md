# Svartdalen – PlaceCard collections: evidence review (2026-11-01)

## Scope and decision

Canonical Place: `svartdalen` (ravine and Alna river corridor above Kværner). **Do not confuse this area with the separate, smaller Svartdalsparken at the western edge.**

The eleven legacy `place.brands` entries were not verified brand identities:
- The valley, Alna, Alnastien and Svartdalsparken are places or natural systems.
- Oslo kommune, municipal agencies, NIVA, Oslo Elveforum and Alnaelvas Venner are public, research or voluntary organizations; none is evidenced as a site-specific commercial brand/sign in Svartdalen.
- Kværner Brug is documented in the area's industrial context, but its former factory identity belongs to the adjoining Kværner area, not an invented brand sign inside the ravine.

All eleven entries are removed **only from the Svartdalen Brand round data**, while the existing historical narrative, nearby-place explanations and relevant institutions remain in the prose and nature profile. There is no canonical Svartdalen entry in `data/brands/brands_by_place.json` or `data/brands/brands_master.json`; the real brand registry remains untouched.

### Curated collection status

- **People:** no named person currently has a source-verified, directly place-specific canonical profile for this ravine. Do not invent one.
- **Objects:** the four `civication_store` reliefs, route drawings and field cards are educational merchandise concepts, **not physical artifacts documented in situ**. Preserve their gameplay/store data separately; do not assert these are an approved historical Objects collection.
- **Brands:** none approved. Do not render site names, agencies or river systems as Brands.
- The canonical v2 `place_card_profile` requires **1–4 content-backed collections**. No curated profile is asserted while there are zero approved collections; it would be incorrect to record an empty profile or invent a placeholder collection.

**Nearby physical object for later, separately scoped review:** `Det blå løpehjulet`, a turbine runner displayed in **Svartdalsparken** by the river. Oslo byleksikon identifies it as a Kværner Vel gift installed in cooperation with the Kværner Brug workshop union. Lokalhistoriewiki reports that the runner came from Kildalen power station and a turbine Kværner Brug built in 1959. The object is a candidate for a future *Svartdalsparken*-scoped Object profile, **not evidence of an artifact at the current Svartdalen marker**. No image/logo or person profile has been manufactured.

## Protected existing production

- Source description and popup: `data/places/production/svartdalen.json`, v4.2, 16 source-linked claims.
- Fullquiz: `data/quiz/natur/svartdalen_sets.json`, 6 sets × 7 questions = **42** existing Knowledge-linked questions.
- QuizCard: `data/quizcards/natur/topp10_natur_alna_v1_batch01.json`, **10** existing fullquiz-derived questions.
- Licensed documentary photos remain `bilder/places/svartdalen.webp`, `bilder/places/svartdalen_front_portrait.webp` and `bilder/kort/places/svartdalen.webp` (Helge Høifødt, Public domain).
- The prior browser audit passed Svartdalen at 390 and 768 pixels; no CSS or media replacements are made.
- Published production tier remains **`v1_candidate`**. Automated data and browser checks are not a physical device/editorial acceptance certificate.

## Independent sources

1. Oslo byleksikon, *Svartdalen*: https://oslobyleksikon.no/side/Svartdalen
2. Oslo byleksikon, *Svartdalsparken*: https://oslobyleksikon.no/side/Svartdalsparken
3. Norsk landskapsarkitektur, *Turvei D10 Svartdalen*: https://landskapsarkitektur.no/prosjekter/turvei-d10-svartdalen
4. Lokalhistoriewiki, *Svartdalsparken*: https://lokalhistoriewiki.no/Svartdalsparken

## Gate

Pass scoped Node test `tests/svartdalen-placecard-collections-v2.test.mjs` (Brand registry, source/runtime parity, quiz and original photo parity); keep derived content and all unrelated Places unchanged.
