# Civication Career Gameplay Contract v1

## Formål

Dette er den permanente produksjonskontrakten for spillbare jobber i Civication. Den erstatter ikke Badge Career Matrix eller Role Pack Index:

- Badge Career Matrix vurderer om 266 Badge-titler er jobber, livsposisjoner eller kvalifikasjonsstyrte milepæler.
- Role Pack Index viser hvilke rollepakke-filer som finnes.
- Career Gameplay Matrix kollapser dataene til faktiske arbeidsverdener per `category/role_scope` og vurderer om hele spillerloopen finnes.

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
4. `practice_stories` — konkrete situasjoner og, for referansenivaa, minst to uker variasjon.
5. `people` — kolleger, leder, brukere/kunder eller andre motparter finnes i spillinnholdet.
6. `places` — arbeidssted og relevante arbeidsflater er konkrete.
7. `mail` — mail/event-genereringen har rolleegne valg og variasjon.
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
- `playable`: runtime-kjernen `entry -> day_one -> workday_loop -> mail -> consequences -> economy` er komplett, og ingen av de 15 komponentene mangler helt. Andre komponenter kan fortsatt ha `partial` evidens.
- `partial`: noe spillinnhold/runtime finnes, men den komplette gameplay-gaten er ikke bevist.
- `architecture_only`: arbeidsverdenen har modell/FWG/deklarasjon, men ingen faktisk mailPlan eller arbeidslivsmail som kan drive en arbeidsdag.

`playable` og `reference_complete` er beregnede auditresultater, ikke manuelle kvalitetsmerker.

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

## Produksjonsregel

Nye arbeidsverdener skal bygges ved å forbedre det eksisterende `role_scope`-sporet. Ikke lag en ny motor, ny dagsrytme eller en nesten lik scope bare for å få en ny Badge-tittel til å se komplett ut.
