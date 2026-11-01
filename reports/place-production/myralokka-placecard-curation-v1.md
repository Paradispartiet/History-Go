# Myraløkka – PlaceCard collection evidence review (2026-11-01)

## Site identity and decision

The canonical Place `myralokka` covers the former clay-extraction hollow and present green space on Sagene, between Maridalsveien and Akerselva, south of Arendalsgata. It is not the separately located Myrens Verksted property across the river.

Ten legacy `place.brands` entries are not supported canonical Brand cards at the Myraløkka park marker:

- `Myraløkka`: physical public park, not a Brand.
- `Bentse teglverk`: historic brickworks and clay-extraction context; park topography and buried factory chimney remain in the sourced article, not as a fictitious Brand sign.
- `Myrens Verksted`: historical industrial company giving the park its name, but its premises were across Akerselva; do not claim a local Brand sign at this park marker.
- `Myrens Verksteds Byggeselskap`, `Morgenstierne & Eide`: genuine housing / architectural history referenced by the article; not verified site-specific registered Brands at this Place.
- `Oslo kommune`, `Bymiljøetaten`: authorities, not evidence of local Brands.
- `Norsk Teknisk Museum`, `Oslo Byes Vel`, `Sagene Torshov Historielag`: museum, civic and local-history sources, not canonical commercial Brands linked to this park.

The canonical `data/brands/brands_by_place.json` and `data/brands/brands_master.json` have no `myralokka` Brand. Remove all ten pseudo-Brands from the Place's canonical and generated Place-open data, **without deleting their source-backed historical or contextual references**. Leave both Brand registries unchanged.

### PlaceCard collections

- **People:** no existing place-specific canonical People references in current runtime; invent none.
- **Objects:** four `civication_store` models, display boards and field cards are interpretive merchandise/gameplay items, not authenticated original physical artifacts located at the park. The buried factory chimney is historical evidence, but not established here as a visibly collectible, image-licensed Object at this site. No false Objects collection.
- **Brands:** zero approved.
- **Profile:** the v2 collection profile requires real content; no empty or fabricated `place_card_profile` should be created.

### Protected production

- Original source-backed 26-claim v4.2 historical packet: `data/places/production/myralokka.json`.
- Fullquiz: `data/quiz/natur/myralokka_sets.json` — 6 sets × 7 questions = **42**, including **21 `linked` and 21 `editorial_review_required`** Knowledge statuses. All remain unchanged; do not silently promote the latter.
- QuizCard: `data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json` — 10 source-question-linked questions, unchanged.
- Three licensed photo derivatives `bilder/places/myralokka.webp`, `bilder/places/myralokka_front_portrait.webp`, `bilder/kort/places/myralokka.webp`: Helge Høifødt, Public domain; source https://commons.wikimedia.org/wiki/File:Myralokka2.JPG.
- Coordinates, original place narration, nature profiles, Fagverk and Civication Store products unchanged.
- Production tier stays **`v1_candidate`**, not automatically `vFerdig`.

### Evidence sources

1. Oslo byleksikon: https://oslobyleksikon.no/side/Myraløkka
2. Oslo byleksikon: https://oslobyleksikon.no/side/Myrens_Verksted
3. History Go's existing v4.2 sources and claim locations in `data/places/production/myralokka.json`.
4. Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Myralokka2.JPG

### Gate

Run the scoped `node --test tests/myralokka-placecard-collections-v2.test.mjs` and relevant required CI only. The known missing nature-map place `trikk_17_18` is unrelated. Editorial review of 21 quiz questions is a separate quality issue, not misrepresented as complete by this PR.
