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
| Objects | BEGRUNNET N/A | Ingen individidentifisert, lokalt proveniensbelagt objekt er dokumentert; generelt spillutstyr er ikke et unikt Objects-medlem. Kandidataudit under. |
| Brands | BLOCKED / REELL KANDIDAT | Virksomhetsnavnet House of Nerds er dokumentert, men canonical brand-medlemskap, rettighetsklart preview og bildeproveniens mangler. Se kandidataudit. |
| Category expression | BEGRUNNET N/A | Ingen navngitt kildebelagt enkeltkonkurranse kvalifiserer; arrangementstilbud alene kvalifiserer ikke til canonical Competition-medlemskort. |
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

## PlaceCard-kandidataudit (2026-11-02)
- **People — BLOCKED:** Den allerede aktive personen `andreas_sollund` har en kildebelagt stedstilknytning (`data/people/subkultur/oslo/house_of_nerds/andreas_sollund.json`), men mangler identifisert og gjenbruksgodkjent portrett/preview. Ikke legg den til `place_card_profile.collection_ids` før bildet er klart.
- **Objects — BEGRUNNET N/A:** Beskrivelsene av PC-rom, konsoller, VR-briller, shuffleboard og brettspill gjelder generelle aktiviteter og utskiftbart utstyr; ingen individidentifisert gjenstand med House of Nerds-proveniens og rettighetsklart medlemsbilde er funnet i offisiell stedsinformasjon eller canonical data. Ikke opprett fiktivt samleobjekt.
- **Brands — BLOCKED som kandidat:** House of Nerds er et faktisk virksomhetsnavn og kommersielt kjennetegn, kildebelagt hos driftsstedet og i Brønnøysundregistrene. Det ligger ingen `house_of_nerds`-kobling i `data/brands/brands_by_place.json` eller `data/brands/actors_by_place.json`, og intet rettighetsklarert brand-preview/attribusjon er dokumentert. Verifiser bedriftsidentitet, riktig brand-kobling, navnerett og asset før produksjon.
- **Kategoriuttrykk (`competitions`) — BEGRUNNET N/A:** Stedet annonserer turneringer og community-arrangementer, men gjennomgåtte kilder dokumenterer ingen særskilt navngitt, tid-/aktørforankret konkurranse som kan få eget canonical medlemskort. Generell turneringsaktivitet er ikke et individuelt Competition-objekt.
- **Samlinger totalt — BLOCKED:** 0 av 1–4 obligatorisk relevante, faktisk publiseringsklare samlinger. People/Brands har naturlige kandidater, men uten dokumentert preview. Ingen `related`-reserve. `frontImage` for stedet er fortsatt rettighetsblokkert.
- **Kildereferanser:** https://houseofnerds.no/ ; https://houseofnerds.no/about-us ; https://houseofnerds.no/house-of-nerds-oslo-vulkan ; https://virksomhet.brreg.no/nb/oppslag/underenheter/922951063 ; `docs/PLACE_PRODUCTION_PROFILES.md` §4 og §9.

## Nattlig CI- og integrasjonsaudit 2026-11-02
- PR #6900: Den faktiske Subkultur-quizprogresjonstesten identifiserte `sluttlaget mangler eksplisitt teoribinding`. Final-sett #16 har nå fagkartforankret Will Straw / `scene_fellesskap`-teori, med stedets dokumenterte arrangementspraksis skilt fra teoritolkningen. Nye Knowledge-ID-er og `data/fagverk/fagverk_release.json` ble generert med repository-eide script; temp-workflow er slettet. Direkte inspeksjon viser 21/21 kilde- og Knowledge-paritet, 10/10 QuizCard-paritet og svarposisjoner 7/7/7. Eksakt-head CI og faktisk quiz UI gjenstår.
- PR #6903: `node scripts/build-place-open-payloads.mjs` genererte `data/runtime/place-open/house_of_nerds.json`, leksikon-shard og nødvendig natur-shard; byggerens `--check` ble kjørt i samme engangsworkflow. Etter cleanup er `Epoch viewer quality`, `Rockefeller historical Story correction`, `Place production closeout` og `Oslo Fagverk — multi-Place production batch` observert som success. `Place-open payloads` var fortsatt in_progress i siste snapshot; ikke før PASS.
- PR #6904: `Civication scenario People` er observert success etter bygging av scenario-indeks. `People data` feilet først på stale `historyPeople_index.json`, sannsynlig på grunn av ny personkilde på main (`bo_terje_hustoft`). Repoens builder ble derfor kjørt i en *midlertidig flettet main/PR-worktree*; generert diff oppdaterte People-count 1437→1438 og scenario-tellerne, uten å endre Andreas-personens identitet. Temporary workflow er fjernet. Eksakt-head Data checks og Place-open er ikke attestert PASS ved dette notatet.
- Kandidataudit har konkludert med Objects og Competition-uttrykk som begrunnet N/A. People og House of Nerds-brand har reelle kandidater, men mangler godkjent preview. Hovedbilde/portrett/PlaceCard er reelle blocker-porter, ikke dokumentasjonsmangler som kan fylles med generiske assets.

## Oppdatering 2026-11-02 — direkte QA etter kanonisk bygning
- PR #6885: `node scripts/build-place-open-payloads.mjs` skrev genererte `data/runtime/place-open/house_of_nerds.json` og `data/runtime/nature-all/flora-001.json`. Engangsworkflowen er fjernet; eksakt-head CI gjenstår.
- PR #6886: Fagverk-grenen har også fått kanonisk Place-open-regenerering. Eksakt-head CI, registry/release og UI-godkjenning gjenstår.
- PR #6890: Story-projeksjonen ble bygget med kanonisk Place-open-script (House of Nerds-payload og Stories-shards). Engangsworkflow fjernet; manifest-/browser-QA gjenstår.
- PR #6895: Språkleksikon-grenen har bygget Place-open-payload og natur-shard på nytt. Engangsworkflow fjernet; CI og UI-kontroll gjenstår.
- PR #6900: 21/21 quizspørsmål manuelt kontrollert mot fasit, produksjonsbrief, kilde-ID og Knowledge-ID; 10/10 QuizCard-spørsmål har ordrett tekst og identiske svaralternativer/fasiter. Balanse 7/7/7 og teori/med metode i final. Permanent test `tests/house-of-nerds-quizcard-parity.test.mjs` og avgrenset CI-workflow lagt til. Dette er en datakontroll, ikke en attestasjon av browser-QA.
- Stedstekst-PR #6885 fikk CI `Place description governance` FAILURE i en fullpakke-kontroll. Nedlastet kjøringsartefakt fra 2026-11-02, run 41400041034, angir **eneste blocker**: `data/places/production/john_dee.json` metadataSnapshot.externalLinks mismatch. Feilen er ikke for House of Nerds; ikke foreta kunstige House of Nerds-korreksjoner for å skjule den.
- PR #6904: Personprofil/Civication-synkronisering er under egen kontroll, inklusive merget-visning; behold People-identitet og adresse uendret.
- Opphavsrett/medier: offisielle interiørfoto og OsloMet Journalen-foto er ikke rettighetsklarert til lokal app-publisering. Dokumentarisk House of Nerds-fasade-/portrettbilde, stående frontImage, PlaceCard-medlemmer og manuell app-QA forblir BLOCKED.
- Ingen PR er merget til `main` per denne kontrollen; aldri merk Place `vFerdig` før alle krav er virkelig godkjent.

## Dokumentert CI-resultat etter kanonisk runtime-bygg (2026-11-02)
- PR #6903, commit `93f2240d450df9604753fba908d8573ef2b742c0`: **5/5 PR CI workflows success**, inkludert `Epoch viewer quality`, `Place-open payloads`, `Place production closeout`, `Rockefeller historical Story correction` og `Oslo Fagverk — multi-Place production batch`. Dette er en teknisk PASS for den *isoler­te kronologi-PR-en*, ikke for sammenslått Place eller produksjon i main.
- PR #6900, direkte kildedatakontroll 2026-11-02: 21/21 spørsmål med korrekt svarposisjon, kildeclaim og Knowledge-ID; 10/10 QuizCard-paritet; fasitposisjoner 7/7/7; eksplisitt, avgrenset Will Straw-teori og metode kun i final-sett. Direkte data-PASS erstatter ikke GH CI eller UI-QA.
- PR #6904: person- og scenarioindekser er bygget på midlertidig merge-view mot current main, inkludert nytt `bo_terje_hustoft`-anker fra main. Endringene er genererte, ikke manuelt redigert. CI-resultat og People runtime-gate må fortsatt sees på nøyaktig PR-HEAD.

- PR #6904: kanonisk `node scripts/build-place-open-payloads.mjs` har nå skrevet `data/runtime/people-all/part-007.json`, `data/runtime/place-open/house_of_nerds.json` og nødvendig florashard til People-grenen. Engangsworkflowen ble fjernet; PR-head oppdatert. Siste CI-kjøringer etter cleanup er ikke dokumentert PASS; ikke endre `vFerdig`-status basert på bygg alene.

## Forskningsspor – kritisk vurdert (2026-11-02)
- Blumenthal, Veronica og Olga Gjerald (2022), «‘You just get sucked into it’: extending the immersion process model to virtual gameplay experiences in managed visitor attractions», *Leisure Studies* 41(5), 722–741, DOI https://doi.org/10.1080/02614367.2022.2049627. Studien bygger på intervjuer med gjester ved **House of Nerds Oslo** og er relevant for spilloppslukthet og kommersielle opplevelser.
- **Stedsgate:** Det er foreløpig ikke dokumentert at alle intervjuene fant sted på Vulkan 18. Ikke bruk studien som direkte Vulkan-evidens uten eksplisitt tidspunkt og sted. Klassifiser som metodisk forskningsspor, ikke som kronologi-/quizfasit eller PlaceCard-evidens.
