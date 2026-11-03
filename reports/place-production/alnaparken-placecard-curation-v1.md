# Alnaparken – PlaceCard collection evidence review (2026-11-01)

## Scope

Place ID: `alnaparken`, Alnaparken/Nylandsparken along Alna near Nedre Furuset. This is **not** a duplicate record for the separate Nedre Furuset farm, the Alna river in its entirety, or the neighboring Alna ridesenter.

### Why the ten legacy Brands are removed

- `Alnaparken / Nylandsparken` and `Alnaelva`: a park place and a natural watercourse, not Brands.
- `Oslo kommune`, `Bymiljøetaten`, `Plan- og bygningsetaten`, `Bydel Alna`: government authorities, not evidence of place-specific commercial signs or approved brand cards.
- `Oslo Elveforum`, `Alnaelvas Venner`, `Artsdatabanken`: associations and information sources, not canonical Alnaparken Brands.
- `Alna ridesenter`: a separately identifiable recreation business with an address in Alnaparkveien; its mention in Alnaparken's site history does not establish a licensed, geolocated Brand at the park marker.

None of these ten has an Alnaparken entry in `data/brands/brands_by_place.json` or a matching place link in `data/brands/brands_master.json`. Remove them from `place.brands` in the canonical and generated Place-open data. Keep the historical prose and other legitimate contextual mentions. The central Brands registry is unchanged.

### Curated PlaceCard collection decision

- **People:** no directly linked, source-backed person was validated for the park marker; none generated.
- **Objects:** the park's real bridges, riverbank and amphibian pond remain described as landscape or built features. The four `civication_store` models and field cards are game/learning products, not authenticated in-situ physical artifacts. They are not promoted to Objects.
- **Brands:** zero verified for this place. Do not show aliases, public bodies, NGOs or neighboring businesses as brand cards.
- **PlaceCard v2:** requires at least one evidence-backed collection; no empty or fabricated `place_card_profile` should be added.

### Protected production content

- Historical `desc` and `popupDesc`, already documented in the **v4.2** packet with 16 verified sentence-linked claims: `data/places/production/alnaparken.json`.
- Six quiz sets, **42 Knowledge-linked questions**: `data/quiz/natur/alnaparken_sets.json`.
- **10 fullquiz-derived QuizCard questions** in `data/quizcards/natur/topp10_natur_alna_v1_batch01.json`.
- Three site-photo variants: `bilder/places/alnaparken.webp`, `bilder/places/alnaparken_front_portrait.webp`, `bilder/kort/places/alnaparken.webp`. Photo by Chell Hill / Wikimedia Commons, CC BY-SA 3.0.
- Site location, nature profile, protected park species mapping, route associations, the non-collection `wonderkammer` content and all four pre-existing Civication Store products remain untouched.
- Production tier stays **`v1_candidate`**; this correction is not final v1/vFerdig accreditation.

## Independent contextual sources

1. Oslo byleksikon, *Alnaparken*: https://oslobyleksikon.no/side/Alnaparken
2. Oslo byleksikon, *Alnaelva*: https://oslobyleksikon.no/side/Alnaelva
3. Oslo Elveforum, *Om Alnaelva*: https://www.osloelveforum.org/om-alnaelva/
4. Documentary photograph: https://commons.wikimedia.org/wiki/File:2011-04-03_Alnaelva_i_Alnaparken.jpg

## Validation

Run only the scoped test `node --test tests/alnaparken-placecard-collections-v2.test.mjs` plus required relevant repository CI. Do not alter unrelated places, source histories, quiz answers, registered brands, images or nature map baseline.
