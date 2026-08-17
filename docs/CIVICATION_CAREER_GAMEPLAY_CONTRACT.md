# Civication Career Gameplay Contract v1

## Formål

Dette er den permanente produksjonskontrakten for spillbare jobber i Civication. Den erstatter ikke Badge Career Matrix, Role Pack Index eller den strengere redaksjonelle Role World-standarden:

- Badge Career Matrix vurderer om 266 Badge-titler er jobber, livsposisjoner eller kvalifikasjonsstyrte milepæler.
- Role Pack Index viser hvilke rollepakke-filer som finnes.
- Career Gameplay Matrix kollapser dataene til faktiske arbeidsverdener per `category/role_scope` og vurderer om hele spillerloopen finnes.
- `CIVICATION_ROLE_WORLD_STANDARD.md` vurderer et høyere redaksjonelt nivå: om rollen faktisk fungerer som et langt, sammenhengende sosialt hverdagsdrama.

En arbeidsverden er ikke spillbar bare fordi den har en roleModel eller FWG. `playable` krever en sammenhengende vei fra jobbtilbud til lagret konsekvens og videre arbeidsdag.

## Canonical arbeidsverdener

Arbeidsverdenene oppdages som unionen av eksisterende deklarasjoner i:

- `data/Civication/workGrammars/`
- `data/Civication/badgeRoleMappings.json`
- `data/Civication/mailPlans/`
- `data/Civication/praksisfortellinger_registry.json`
- `data/Civication/lifestory/manifest.json`

En roleModel-fil alene oppretter ikke en ny arbeidsverden. Dette er bevisst: mange roleModels er tittellag eller eldre Badge-genererte modeller, og skal ikke gjøre 266 tiers til 266 parallelle jobbmotorer.

## Minimumskontrakt

Hver arbeidsverden auditeres mot de samme 15 komponentene:

1. `entry` — jobbtilbud, gate og aktiv stilling kan etableres.
2. `day_one` — første arbeidsdag har en planlagt og testet åpning.
3. `workday_loop` — rollen har gjentakbar arbeidslogikk, ikke bare en introduksjon.
4. `practice_stories` — konkrete situasjoner og, for referansenivå, minst to uker variasjon.
5. `people` — kolleger, leder, brukere/kunder eller andre motparter finnes i spillinnholdet.
6. `places` — arbeidssted og relevante arbeidsflater er konkrete.
7. `mail` — authored scene-/mailinnholdet har rolleegne valg og variasjon; normal work-runtime konsumerer dette gjennom SceneCatalog/compiled registry.
8. `knowledge` — fagkunnskap brukes i beslutninger; kunnskap er ikke bare pynt.
9. `quality_axes` — arbeidets kvalitet kan vurderes langs tydelige akser.
10. `authority` — mandat, ansvar og grenser er eksplisitte.
11. `consequences` — valg gir samme-dag eller senere etterspill.
12. `performance` — mestring, risiko, stagnasjon eller svikt kan vurderes.
13. `economy` — faktisk jobb har en eksakt lønnsregel; kategori-default alene er ikke nok.
14. `progression` — erfaring og prestasjon kan gi mer ansvar, spesialisering eller nytt tilbud.
15. `exit` — oppsigelse, avgang eller jobbskifte har en definert vei.

Life Story registreres i tillegg som en egen integrasjonskolonne. Den er obligatorisk for `reference_complete`, men er ikke en sekstende parallell jobbkontrakt.

## Evidensnivå

Hver komponent får ett av tre evidensnivåer:

- `complete`: både innhold og relevant runtime-/testbevis finnes.
- `partial`: arkitektur eller innhold finnes, men hele kjeden er ikke bevist.
- `missing`: ingen tilstrekkelig repo-evidens er funnet.

Auditen er konservativ. En fil med et lovende navn gir ikke automatisk `complete`.

## Arbeidsverdensstatus

- `reference_complete`: alle 15 komponenter er `complete`, Life Story er koblet, minst 12 praksissituasjoner finnes og minst to praksisuker er testet.
- `playable`: runtime-kjernen `entry -> day_one -> workday_loop -> mail/scene -> consequences -> economy` er komplett, og ingen av de 15 komponentene mangler helt. Andre komponenter kan fortsatt ha `partial` evidens.
- `partial`: noe spillinnhold/runtime finnes, men den komplette gameplay-gaten er ikke bevist.
- `architecture_only`: arbeidsverdenen har modell/FWG/deklarasjon, men ingen faktisk plan eller authored arbeidslivsscene som kan drive en arbeidsdag.

`playable` og `reference_complete` er beregnede auditresultater, ikke manuelle kvalitetsmerker.

### Viktig: `reference_complete` betyr ikke «fylt rolleverden»

Career Gameplay Matrix måler **teknisk og produksjonsmessig komplett jobbgameplay**, ikke den høyeste redaksjonelle dybden.

En `reference_complete` arbeidsverden kan fortsatt mangle:

- 14 dagers sammenhengende sosial dramaturgi;
- fire dramaturgiske ankerpunkter gjennom dagen;
- faste NPC-er som bærer tydelige klasse-, status- og maktforhold;
- gjentakende 5–10-beat korrespondansetråder;
- systematisk privat etterklang;
- film-/fortellingstemaer oversatt til sosiologiske konflikter;
- langvarige kryssvirkninger mellom arbeid, relasjoner, psyke, levevei og øvrig livsstate.

Den strengere definisjonen ligger i `docs/CIVICATION_ROLE_WORLD_STANDARD.md`.

`role_world_complete` er reservert som et høyere redaksjonelt nivå og skal **ikke** utledes fra denne matrisen før en egen permanent Role World-audit/test finnes. Dokumentasjon og PR-er skal derfor ikke bruke ordet «fylt» bare fordi en rolle er `reference_complete`.

## Scene- og runtimegrense

Career Gameplay-innhold produseres gjennom den canonicale Scene Pipeline:

```text
authored work sources (`mailFamilies` m.m.)
→ deterministic build
→ `compiled_scene_registry_v1`
→ `CivicationSceneCatalog`
→ `CivicationSceneDirector`
→ delivery / NextAction
→ `CivicationChoiceDirector`
→ konsekvens / MailRuntime-progresjon / domeneeid state
```

For work-scenes er `mailFamilies` source-of-build, ikke normal runtime-kilde. `CivicationMailRuntime` eier plan/progresjon og bruker SceneCatalog/Director-kandidatene; det skal ikke gjenåpnes direkte råkataloglesing eller legacy fallback for å få en rolle til å se spillbar ut.

Null canonical kandidater betyr no-op/fail-closed. Manglende innhold skal produseres, ikke skjules av generiske runtimevalg.

## Levevei og Career Gameplay

Formell jobb og levevei er separate akser.

Career Gameplay Matrix måler jobbens økonomi gjennom den faktiske jobb-/lønnskontrakten. Sideinntekt, freelance, gigs, royalties, prosjektmidler, støtte og nullinntektsperioder eies av `CivicationLivelihoods` og kan eksistere parallelt uten å omskrive arbeidsstatus.

En Role World kan skape en livelihood-opportunity som konsekvens av en canonical scene, men produsenten skal aldri betale direkte til wallet. Normal kjede er:

```text
scene / Life Story / nettverk
→ livelihood opportunity
→ eksplisitt aksept
→ livelihood stream
→ økonomisk avregning
```

## Permanent gate

`node scripts/audit-civication-career-gameplay.mjs --check` skal:

- regenerere matrisen deterministisk i minnet;
- kontrollere at checked-in JSON og Markdown er synkronisert;
- avvise ukjente komponenter og dupliserte arbeidsverdener;
- avvise `playable` uten komplett runtime-kjerne;
- avvise `reference_complete` uten alle 15 komponenter, Life Story, praksisdybde og to uker.

`node scripts/audit-civication-career-gameplay.mjs --write` oppdaterer:

- `data/Civication/careerGameplayMatrix.json`
- `reports/civication-career-gameplay-matrix.md`

Role World-dybde er foreløpig en separat redaksjonell kontrakt og må ikke late som den håndheves av denne auditen før en dedikert gate faktisk er implementert.

## Produksjonsregel

Nye arbeidsverdener skal bygges ved å forbedre det eksisterende `role_scope`-sporet. Ikke lag en ny motor, ny dagsrytme, et nytt sceneformat eller en nesten lik scope bare for å få en ny Badge-tittel eller Role World til å se komplett ut.

For roller som allerede er teknisk spillbare skal neste verdi normalt komme fra **bedre authored data og dypere rolleverden**, ikke mer grunnarkitektur.
