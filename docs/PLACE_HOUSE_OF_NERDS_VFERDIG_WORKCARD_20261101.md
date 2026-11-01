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
| Kronologi og epoker | UNDER REVIEW / BLOCKED FOR INDEX | PR #6903: egen manifestlastet Vulkan-leksikonartikkel med to kildebelagte åpningsannonser (2019 og 2020). PR #6885 setter Løren-/omstridt åpning-claims til timelineScope=institution_context for å unngå falske Vulkan-milestones. Deterministisk epokeindeks bygget med kanonisk script og lagret i PR #6903; diffen inneholder to dokumenterte Vulkan-milestones og reduserer Oslo-gapet med ett. CI og visuell QA gjenstår. |
| Språkleksikon | UNDER REVIEW | PR #6895: 4 kildebelagte stedstermer, egen språkfil og aktiv manifestkobling; CI og UI-kontroll gjenstår |
| People | EKSISTERENDE PERSON GJENBRUKT / UNDER REVIEW | `andreas_sollund` var allerede manifestlastet og koblet til House of Nerds; PR #6904 retter navn og kildebelagte roller (Gamer.no 2013, selskap Vulkan 2026) uten å duplisere personen. Portrett mangler og full People Profile v1 er ikke attestert. People-indeksen ble gjenbygget med kanonisk Civication-builder i PR #6904; generert diff gjelder én person i `data/Civication/historyPeople_index.json`. Eksakt-head CI, portrett og People UI-QA gjenstår. |
| Objects | KANDIDATAUDIT | Ingen dokumentert egenarts- eller eierklarert PlaceCard-objektsamling ennå |
| Brands | KANDIDATAUDIT | Driftsselskap/House of Nerds-identiteten kan være relevant, men canonical brand-gate er ikke gjennomgått |
| Category expression | KANDIDATAUDIT | Innhold skal bare produseres dersom canonical samling passer med dokumenterte spor |
| PlaceCard-samlinger | BLOCKED | Ingen 1–4 verifiserte PASS-samlinger/medlemsbilder i `place_card_profile` |
| Fullquiz | UNDER REVIEW / KNOWLEDGE PRODUSERT | PR #6900: 21 kildebaserte spørsmål i 3×7 narrow-sett med 21/21 genererte Knowledge-koblinger, canonical produksjonskontekst, balansert lagret fasitfordeling 7/7/7, to relevante metodekoblinger og kildekonflikt om VIP-kapasitet fjernet fra quiz. Eksakt-head CI + manuell quizflattest gjenstår. |
| QuizCard | UNDER REVIEW / KNOWLEDGE KOBLET | PR #6900: 10 identiske spørsmål og fasiter fra fullquiz, alle 10 har genererte Knowledge-ID-er og manifestkobling. Faktisk stående kortbilde, PlaceCard-flip/runtime og browserkontroll gjenstår. |
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
**Quizprofil:** foreløpig valgt `narrow_3x7` på 21 kildebaserte quizclaims i PR #6900; kandidat er ikke teknisk godkjent før Knowledge-generering, ny CI og quiz-UI-kontroll.  
**V3:** Ingen `data/places/workflow/house_of_nerds.json` funnet ved preflight; stedet følger eksisterende legacy-prosess, ikke kunstig V3-`complete`.

Ingen `vFerdig`-attest før alle nødvendige canonical data er bygd, kilde- og bildeporter har PASS, faktisk desktop/mobil UX er kontrollert, relevante tester er grønne, eksakt head er merget til main og live-readback er dokumentert. **Ikke fyll manglende samlinger med filler og ikke erstatt eksisterende verifisert geometri eller Subkultur-evidens.**

## Endringer i arbeidsløpet 2026-11-01
- PR #6885: 4.2-påstand om Løren-konkursselskapet presisert; ny validator-run viser `Place description governance = success`.
- PR #6886: syv navngitte operative lenker, Place-eid Fagverk-indeks og deterministisk release-digest oppdatert; `Fagverk release feed = success` i ny kjøring.
- PR #6890: `Stories governance = success`; fremdeles draft og ikke publisert.
- Flere `Place-open`- og `Epoch viewer`-kjøringer stopper ved genererte filer (`data/runtime/nature-all/flora-001.json`, `data/epoker/epoke-place-index.json`). Disse statusene må skilles fra faglig godkjenning og løses før `vFerdig`.

- PR #6895: kildebelagt Språkleksikon med `nerdehjem`, `gaming`, `VR-escape room` og `community`; canonical manifestregistrering; avventer slutt-QA.

- PR #6900: 21 kildebaserte spørsmål, 3 sett, ti nøyaktige QuizCard-spørsmål, registrert i quiz- og QuizCard-manifest. CI viser `Knowledge canonical data`-drift i `data/quiz/subkultur/house_of_nerds_sets.json`, `data/knowledge/subjects/subkultur/knowledge_units.generated.json` og `reports/knowledge-id-backfill.json`. Ikke sett Quiz/Knowledge til PASS før kanonisk builder og faktisk UI-QA.

- PR #6903: Vulkan-spesifikt leksikon med daterte kildeannonser fra 2019 og 2020; eksakt åpning holdes omstridt. Epokeindeks og viewer gjenstår.
- PR #6904: eksisterende `andreas_sollund` People-ID gjenbrukt; feilaktig kontaktperson-påstand erstattet med dokumentert prosjektlederrolle og profesjonell rolle i Vulkan-selskapet. Bildet er fremdeles tomt.
- PR #6900: Narrow-fasene justert til canonical `opening → bridge → final`; `quizProduction.targets` er registrert. Engangskjøring av repository-eid `quiz:context` + Knowledge-generator forsøkt på quizgrenen. Ingen generert output regnes som synkronisert før commit og CI PASS er observert.

## Bildeproveniens og rettighetsgate (research 2026-11-01)
- Mulig fasade-/stedsmotiv er publisert i OsloMet Journalen (05.11.2022), med **foto: Emma Rosenberg Hammeren**. Kilde: https://journalen.oslomet.no/nb/innenriks/2022/11/dette-er-nerdenes-samlingspunkt . Ingen fri lisens eller brukstillatelse er dokumentert; derfor ikke importer som `frontImage` eller lokalt asset.
- Offisiell House of Nerds Vulkan-side publiserer interiørbilder fra bar, VIP-gaming og VR: https://houseofnerds.no/house-of-nerds-oslo-vulkan . Publisering på virksomhetens nettsted er **ikke** dokumentasjon på viderebrukslisens for History GO.
- Kilde: https://vulkanoslo.no/no/house-of-nerds/ omtaler stedet og aktiviteter, men gir ingen dokumentert rettighetsklarert originalfil.
- Både fasade/hero, stående PlaceCard-bilde og eventuelle QuizCard-/People-illustrasjoner forblir `BLOCKED` inntil eier/oppmann krediteres, originalens proveniens, bruksrett, format og synlig faktisk appgeometri er kontrollert. Ikke bruk generert fotorealistisk stedskopi som stedsevidens.

- Senere faglig review av quiz tok ut motstridende VIP-kapasitetsclaim og forbedret final-sett med tidskildekritikk, dokumentert miljøpraksis og kommersialiseringsmetode. Rebuild har 21/21 Knowledge-koblinger, og lagret svarposisjonsbias er balansert 7/7/7. Eksakt-head CI/resultat og browser-QA fortsatt åpen.
- PR #6903: kanonisk epokebygger la to Vulkan-milestones i `data/epoker/epoke-place-index.json` uten manuelle indeksendringer; diffen gir `dated_evidence` for House of Nerds. Visuell tidslinjetest gjenstår.
- PR #6904: People-index-regenerering er satt opp med kanonisk Civication-builder fordi `Data checks` stoppet på stale `data/Civication/historyPeople_index.json`.

## PlaceCard og relaterte steder — antifyll
- `vulkan_industriomrade` finnes som selvstendig canonical Place med kildetilknyttede CC0-bilder og faktisk stående, kreditert PlaceCard-bilde: `data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json`.
- Vulkan-industriområdet er relevant områdetilknytning for House of Nerds på Vulkan 18, men er ikke et bilde av selve House of Nerds. Ikke bruk områdets CC0-foto som om det dokumenterer gaming-lokalet.
- Ifølge `docs/PLACE_PRODUCTION_PROFILES.md` §9 er `related` aldri en PlaceCard-samling eller reserve. Mulig geografisk relasjon kan undersøkes i relasjonslaget, men skal ikke settes i `place_card_profile.collection_ids`.
- Minst én ekte relevant, kilde- og bildegodkjent People/Objects/Brands/kategoriuttrykk-samling mangler fortsatt. Den eksisterende People-personen (`andreas_sollund`) har ikke rettighetsklarert portrett. Dette blokkerer PlaceCard-closeout uten filler.

- PR #6904: `npm run civication:history-people:build` materialiserte Andreas Bøe Sollunds korrigerte navn/rolle i `data/Civication/historyPeople_index.json`; engangs-workflow fjernet igjen, Person-bilde/People Profile v1 fortsatt ikke ferdig.
- PR #6900/6903: kanoniske quiz-Knowledge- og epokeindekser er skrevet av repository-eide generatorer. Midlertidige genereringsworkflows er slettet etter kjøring. Sluttest etter siste menneskelige commit må fortsatt vurderes; ingen `vFerdig` uten browser-/image-/PlaceCard-PASS.
