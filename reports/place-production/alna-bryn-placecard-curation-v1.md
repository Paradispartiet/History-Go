# Alna ved Bryn – PlaceCard curation, 2026-11-01

## Scoped evidence review

Canonical place `alna_bryn` represents the Alna river section at Bryn and Brynsfossen, **not** an identity for Bryn station or the old industrial premises.

Eleven legacy `place.brands` entries were miscoded:
- `Alna ved Bryn`, `Brynsfossen`, `Alnaelva`, `Alnastien`: physical location, waterfall, river and pathway rather than Brands.
- `Hovedbanen`: railway infrastructure, not an evidenced commercial Brand sign within this place's scope.
- `Oslo kommune`, `Bymiljøetaten`, `Vann- og avløpsetaten`, `NIVA`, `Oslo Elveforum`: authorities, research institute or association, not validated local Brand assets.
- `Joh. Petersen A/S`: historically relevant textile company in Bryn's industrial context, but no verified canonical Brand record and no sourced in-situ Brand marker at this specific river Place. This is preserved as historical context, not promoted to a commercial collection card.

Neither `data/brands/brands_by_place.json` nor `data/brands/brands_master.json` links a canonical Brand to `alna_bryn`. Remove only the false `place.brands` entries in the source and generated runtime; do **not** edit the central Brands catalog.

### PlaceCard collection decision

- **People**: no site-specific, source-attested linked People entry in the runtime; no person invented.
- **Objects**: the four `civication_store` items are educational, game-store concepts, not sourced real artifacts located at the river marker. Keep them in the Store but do not use them to populate a real Objects collection.
- **Brands**: none documented. No fake signs, logos or cards.
- **Profile**: `place_card_profile` requires at least one authenticated collection; do not add an empty placeholder.

### Protected existing content

- `data/places/production/alna_bryn.json`: source-backed v4.2 history with **15 verified claims**.
- `data/quiz/natur/alna_bryn_sets.json`: **42** Knowledge-linked questions across 6 sets.
- `data/quizcards/natur/topp10_natur_alna_v1_batch01.json`: **10** synchronized fullquiz-derived questions.
- The three existing photographic asset references, front/hero/card variants, credited to PaulVIF / Wikimedia Commons, **CC BY-SA 3.0** and the unchanged source URL `https://commons.wikimedia.org/wiki/File:Brynfoss.JPG`.
- Location coordinates, nature-round data, Fagverk, Wonderkammer, connections and source prose remain untouched.
- Publication tier remains **`v1_candidate`**, not newly accredited as `vFerdig`.

### Source context

1. Oslo byleksikon: https://oslobyleksikon.no/side/Bryn
2. Oslo byleksikon: https://oslobyleksikon.no/side/Alnaelva
3. Historical source packet `data/places/production/alna_bryn.json` documents individual claims.
4. Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Brynfoss.JPG

### Gate

Only the targeted test `node --test tests/alna-bryn-placecard-collections-v2.test.mjs` and required relevant PR CI. Pre-existing naturkart `trikk_17_18` and stale global `epoke-place-index.json` are unrelated to the modification.
