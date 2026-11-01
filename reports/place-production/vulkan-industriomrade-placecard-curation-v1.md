# Vulkan industriområde – PlaceCard collection curation (2026-11-01)

## Scope

Canonical `vulkan_industriomrade` covers the former factory and foundry precinct west of Akerselva and its later reuse, not an automatic umbrella commercial Brand for every business in the neighborhood.

Nine legacy entries in `place.brands` have no verified canonical entries for this Place in `data/brands/brands_by_place.json` or `data/brands/brands_master.json`:
- **Historical industrial context:** Bagaas Brug; Vulkan Jernstøberi og mekaniske Verksted; A/S Vulkan. These remain in the authored industrial narrative.
- **On-site facilities and cultural organizations:** Vulkan Flerbrukshall; Dansens Hus; Westerdals School of Communication; Mathallen Oslo. Some are actual contemporary institutions or business names, but the current Place provides no independent canonical Brand profile or source-verified local signage/logo asset for their respective collections. They may be modeled as Brands later after a separate evidence-led process.
- **Area developers:** Aspelin Ramm; Anton B. Nilsen Eiendom. Their redevelopment role remains in the historical text, not a fabricated Brand card.

Remove only the nine `place.brands` items in the canonical Place and generated Place-open. No logo or storefront media is invented. No independent Brand registry or historical article is modified.

## People and Objects — preserve existing data; separately review weak links

Seven People references already occur in the runtime: `halvor_hoaas`, `ferdinand_ludvig_vibe`, `axel_ingvald_spone_amundsen`, `kristin_jarmund`, `mats_zuccarello`, `oslo_graffiti_miljoet` and `oslo_skateboardmiljoet`. The first three are documented industrial figures in Vulkan's existing v4.2 history; some other entries are broad associations or group labels that warrant separate evidence/People-classification review. **This Brands-only change preserves all seven entries rather than silently deleting unrelated data or upgrading them to approved profiles.**

Five `civication_store` products are interpretive/game inventory, not authenticated in-situ Objects. Do not construct a false Objects collection or an empty `place_card_profile`.

## Protected historical and quiz content

- Historical claim pack `data/places/production/vulkan_industriomrade.json`: **29/29 source-backed v4.2 claims**.
- `data/quiz/historie/vulkan_industriomrade_sets.json`: 4 × 7 = **28** historical fullquiz questions. **13 are `linked`; 15 are `editorial_review_required`**. Preserve all states.
- Historical QuizCard `data/quizcards/historie/vulkan_industriomrade_quizcard_v1.json`: **10/10** questions `linked` to fullquiz sources.
- Separate nature QuizCard `data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json`: **10** matching source questions, of which **five still require editorial review**. This is explicitly **not** described as fully Knowledge-approved and needs a later separately scoped review.
- Existing photo paths: `bilder/places/vulkan_industriomrade.webp`, `bilder/places/vulkan_industriomrade_front_portrait.webp`, `bilder/kort/places/vulkan_industriomrade.webp`. Current metadata: Leonhard Lenz / Wikimedia Commons, CC0.
- Location, architecture and reuse history, source links, Fagverk, nature overlays, existing People and Civication Store data unchanged.
- Publication level remains **`v1_candidate`**, not newly certified `vFerdig`.

## Source basis

The 29 independently mapped claims and source references are recorded in `data/places/production/vulkan_industriomrade.json`. Prior content PR #6416 and QuizCard PR #6718 document the respective history and quiz sourcing. No new historical claims are introduced by this curation.

## Gate

Run `node --test tests/vulkan-industriomrade-placecard-collections-v2.test.mjs` plus required relevant PR CI. The previously observed `trikk_17_18` nature-map problem is outside scope and should not be “fixed” by changes to this Place.
