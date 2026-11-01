# House of Nerds — vFerdig arbeidskort / faktisk status 2026-11-01

**Place:** `house_of_nerds` — Vulkan 18, 0178 Oslo.  
**Canonical:** `data/places/subkultur/oslo/house_of_nerds.json`  
**Autoritativ produksjon:** `docs/PLACE_PRODUCTION_CHECKLIST.md` v2.6 + `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` + `docs/PLACE_PRODUCTION_MINIMUM_V1.md`.  
**STATUS: IKKE vFerdig — flere harde porter gjenstår.** Denne rapporten må aldri brukes som fullføringsattest.

## Tidligere-arbeid-gate (gjennomført før endringer)
- Canonical `place_id`, navn, manifestforekomst og adresse kontrollert.
- Godkjent Subkultur-rapport: `data/places/subkultur-production/house_of_nerds.json` (status `ready`; A–F PASS). Fagprofilen har `case_sub_house_of_nerds` som `validated_case` etter PR #4694; denne evidensen skal bevares.
- Tidligere place-redaksjon bl.a. PR #589; historisk People-kollektivanker PR #1755, ikke automatisk godkjent individuell People-profil.
- Canonical koordinat ved Vulkan 18 er `coordStatus: verified`, `coordRole: display_marker`, kilden er Geonorge-adresseoppføring (2026-07-21). Ingen koordinatendring utført.
- Story-kandidat `data/stories/stories_house_of_nerds.json` finnes, men var **ikke oppført** i `data/stories/stories_manifest.json` ved denne gjennomgangen og kan ikke telle som aktiv Story.
- `data/quiz/manifest.json` inneholdt ikke `house_of_nerds`; heller ikke egen sets-fil i `data/quiz/subkultur/`.
- `bilder/QuizCards/` hadde ikke eget House of Nerds-kort.
- `data/fagverk/fagverk_registry.json` hadde ingen `house_of_nerds`-forekomst ved kontroll.

## Førte delarbeider
| Område | Status | Artefakt / krav |
| --- | --- | --- |
| Identitet | BEHOLD | Eksisterende Place og adresse |
| Koordinat | ALLEREDE FERDIG / BEHOLD | Eksisterende Geonorge-verifisering; endres ikke uten regresjon |
| Hovedbadge | BEHOLD | `subkultur` |
| Underbadge | ENDRING UNDER REVIEW | `fandom` → `fandom_og_nerdekultur`, PR #6885 |
| Faglig Subkultur-case | ALLEREDE FERDIG / BEHOLD | PR #4694, `case_sub_house_of_nerds` |
| Stedstekst + claimpakke | UNDER REVIEW | PR #6885; 17 source-claims, setningskoblinger, 10 quiz-readiness-kandidater |
| Stedsegen Fagverk-side | UNDER REVIEW | PR #6886; curated/standard, navngitte eksterne kilder, registry-indeks og release-digest oppdatert; krever CI, browser-QA og merge |
| Aktiv Story | UNDER REVIEW | PR #6890 migrerer kandidat til episode_v1 og registrerer aktiv Story med fire eksterne kilder; Stories governance PASS, men PR ikke merget, slutt-QA og Place-open PASS gjenstår |
| Kronologi og epoker | BLOCKED | Historiske kilder dokumenterer Løren 2015 og Vulkan rundt årsskiftet 2019–2020; kildeuenighet i åpningsdato må behandles ved tidslinjematerialisering |
| Språkleksikon | BLOCKED | Mangler dokumentert stedsspesifikk term-/navnekobling og UI-kontroll |
| People | BLOCKED / kandidataudit | Eldre kollektivanker `house_of_nerds_miljoet` er ikke en automatisk godkjent individuell person; navngitte personer må belegges med stedsspesifikk rolle |
| Objects | KANDIDATAUDIT | Ingen dokumentert egenarts- eller eierklarert PlaceCard-objektsamling ennå |
| Brands | KANDIDATAUDIT | Driftsselskap/House of Nerds-identiteten kan være relevant, men canonical brand-gate er ikke gjennomgått |
| Category expression | KANDIDATAUDIT | Innhold skal bare produseres dersom canonical samling passer med dokumenterte spor |
| PlaceCard-samlinger | BLOCKED | Ingen 1–4 verifiserte PASS-samlinger/medlemsbilder i `place_card_profile` |
| Fullquiz | BLOCKED | Quizreadiness ≠ aktiv fullquiz; krev kildebelagt `narrow|normal|rich|major`, manifestsynk, Knowledge-paritet, anti-repetisjon og UI-kontroll |
| QuizCard | BLOCKED | Ingen faktisk stående kortfil/kobling for stedet og ingen godkjent spørsmålsparitet |
| Hovedbilde | BLOCKED | `popupImage` peker mot tredjeparts Squarespace-bilde uten dokumentert lisens-/proveniensgate; dette er ikke nok til publiseringsgodkjent hero-bilde |
| Stående `frontImage` | BLOCKED | Egen bildefil, stående pikselgeometri, motividentitet, rettighet og faktisk kortvisning mangler |
| Utforsk/På stedet/Progress | BLOCKED | Ingen eksakt app-/browser-QA av stedskort, popup, check-in, quizstart, progress og mobilflate |
| Runtime/sync | BLOCKED | Bygg av place-index, place-open, Fagverk-release, epokeindeks, eventuelle quiz/Knowledge-projeksjoner og verifikasjon ikke dokumentert grønn |
| CI og manuell slutt-QA | BLOCKED | Exact-head CI var queued ved opprettelsen; manuell desktop/mobil bilde-/flow-QA ikke gjennomført |
| Merge/live | BLOCKED | PR #6885 og #6886 er draft og ikke merget; ingenting er attestert publisert |

## Kildekonflikt (ikke visk bort)
- Offisiell Vulkan-side: «åpnet dørene til desember 2019»: https://houseofnerds.no/house-of-nerds-oslo-vulkan
- Mer av Oslo 22. januar 2020 annonserer «åpner fredag 24. januar»: https://meravoslo.no/nyheter/ikke-bare-for-nerder
- Begge er omtalt attribuert i PR #6885. `year: 2020` i eksisterende metadata er **ikke** attestasjon av én sikker, ubestridt åpningsdato.
- PressFire 24. april 2020 skiller eksplisitt Løren-konkursen fra Vulkan-virksomheten: https://www.pressfire.no/artikkel/gamingsenteret-house-of-nerds-pa-loren-i-oslo-er-konkurs

## Produksjonsbeslutning og ferdig-gate
**Produksjonsprofil:** `focused` (provisional, ikke confirmed; ett relativt avgrenset aktivt spill-/arrangementssted med eget subkultur-case). Ferdig profil krever endelig badge-drevet kilde- og kandidataudit.  
**Quizprofil:** ikke avgjort før komplett claimbank og eksisterende quiz-audit.  
**V3:** Ingen `data/places/workflow/house_of_nerds.json` funnet ved preflight; stedet følger eksisterende legacy-prosess, ikke kunstig V3-`complete`.

Ingen `vFerdig`-attest før alle nødvendige canonical data er bygd, kilde- og bildeporter har PASS, faktisk desktop/mobil UX er kontrollert, relevante tester er grønne, eksakt head er merget til main og live-readback er dokumentert. **Ikke fyll manglende samlinger med filler og ikke erstatt eksisterende verifisert geometri eller Subkultur-evidens.**

## Endringer i arbeidsløpet 2026-11-01
- PR #6885: 4.2-påstand om Løren-konkursselskapet presisert; ny validator-run viser `Place description governance = success`.
- PR #6886: syv navngitte operative lenker, Place-eid Fagverk-indeks og deterministisk release-digest oppdatert; `Fagverk release feed = success` i ny kjøring.
- PR #6890: `Stories governance = success`; fremdeles draft og ikke publisert.
- Flere `Place-open`- og `Epoch viewer`-kjøringer stopper ved genererte filer (`data/runtime/nature-all/flora-001.json`, `data/epoker/epoke-place-index.json`). Disse statusene må skilles fra faglig godkjenning og løses før `vFerdig`.
