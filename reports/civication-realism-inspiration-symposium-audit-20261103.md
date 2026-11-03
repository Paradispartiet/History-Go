# Civication – realisme, verk-inspirasjon og Symposium: kontroll 3. november 2026

**Status:** Kilde-/runtime-kontrakt gjennomgått. Dette er en etterprøvbar kvalitetsbaseline, **ikke** iPad-akseptanse eller 244 ferdigspilte liv. Endrer ingen rollescope, sceneformat eller spillmotor.

## Konklusjon

- **244 Role Worlds** i `data/Civication/roleWorlds/index.json`: 85 karrierer + 159 livsposisjoner; alle har redaksjonell status `role_world_complete`. Denne statusen alene verifiserer ikke en opplevd yrkessimulering.
- **87 Work Grammar-filer** og egen Career Gameplay Matrix. Skill mellom faglig rollebeskrivelse, faktiske scener og vedvarende arbeidsobjekter.
- **15 roller** er registrert i `data/Civication/lifestory/manifest.json`. Bare `arbeidsledig` har en egen `symposium`-definisjon i rollefilen; `getSymposium` er en faktisk lesemodell av lagret arkiv, ikke en separat hukommelse.
- **24 samtidige historietyper** i `storyCoverageInventoryV1.json`; alle har kuratert bokmatch (`read_four_plus_verified`), men **24/24 filmer har `film_analysis: not_reviewed`**. Dette dokumenterer metadata- og tematisk kandidatkobling, ikke nærlesning eller synlig virkning i publisert gameplay.
- Sammenhengende historier må vurderes **spillerens faktiske valg → synlig respons → vedvarende endring → senere tilbakekomst**, ikke etter antall JSON-scener.

## Tre faglig ulike kontrollroller

Kontrollert mot de syv `data/Civication/mailFamilies/<kategori>/<type>/<rolle>_<type>.json`-katalogene per rolle, Work Grammar, Role World, plan og eksisterende tester. «Arbeidsobjekt-scener» betyr scener med `work_context.object_ids` eller konkrete `work_object_ops`; dette er en katalogmåling, ikke attestert nettleservisning.

| Rolle | Registrerte mail-scener | Scener knyttet til vedvarende arbeidsobjekt | Ulike stedsreferanser | Grunnlag og kvalitetshull |
| --- | ---: | ---: | ---: | --- |
| Renholder | 81 | **0** | 10 | To ukers konkret plan, renholdsfaglige oppgaver, berøringspunkter, romstandard, kjemi, HMS og privat etterklang. Scenene oppdaterer stats, men mangler vedvarende rom-/sone-/avvikssak. |
| Film/TV – Produksjonsassistent | 14 | **7** | 5 | Ett stabilt opptaksdagcase (`film_tv_pa_shoot_day_case_001`), call, adgang, transport og eskalering. Sjekk om de øvrige scenene oppleves som reelt arbeid og om repeterte fasebeskrivelser preger spillflyten. |
| By-rådgiver | 87 | **9** | 8 | Lillebekk-plansak (`by_radgiver_lillebekk_plan_case_001`), beboerinnspill, planjurist, godkjenning, History Go-læring og rework. Test lang tidslinje, andre valgruter og faktisk nettlesermontering. |

### Funn 1 – Renholder er neste konkrete implementeringsjobb

Kilder: `workGrammars/naeringsliv/renholder.json`, `mailPlans/naeringsliv/renholder_plan.json`, `mailFamilies/naeringsliv/job/renholder_job.json` og `tests/civication-renholder-two-week-flow.test.js`.

**Ikke** erstatt faglige scener med generiske AI-dilemmaer eller gi automatisk helseskade/sykdom. Bruk eksisterende `CivicationWorkWorld`, Scene Pipeline og ChoiceDirector. Lag en **vedvarende rom-/sone-/avvikssak** med observerbare tilstander: bestilt → undersøkt → prioritert → utført/avvik meldt → etterkontrollert. Knytt minst tre eksisterende hendelser til samme sak: (a) møtelokalets berøringspunkter, (b) urealistisk tidsbudsjett eller feil kjemikaliebruk, (c) senere faglig etterkontroll/lederrespons. Definer ansvarlig rolle, faktisk oppgaveinput, tilgjengelig metode, utstyr og HMS-grense. Ikke la en statsøkning erstatte arbeidets resultat.

Akseptanse: to forskjellige spillervalg gir forskjellige spor i samme arbeidsobjekt; forkert metode skaper ikke deterministisk oppdiktet sykdom; avvik kan eskaleres til riktig aktør; saksstatus og NPC-respons overlever restart; faglig feil er mulig uten at ett åpenbart «onde» valg må velges. Kjør målrettet test + ordinær CI når koden er endret.

### Funn 2 – Produksjonsassistent: kvaliteten må bevises i spillet

Kilder: `reports/CIVICATION_FILM_TV_PRODUKSJONSASSISTENT_ROLE_WORLD_ROLLOUT.md`, `tests/civication-film-tv-produksjonsassistent-role-world-rollout.test.js`, `...-playability.test.js`.

Et faktisk opptaksdagcase finnes med 7 sceneinnganger og korrekt mandat. Neste kontroll må gjennomspille ulike valg for call sheet, lokasjonsadgang og avdelingshandoff; kontrollere at spilleren **ikke** får godkjenne oppgaver over rollen, og at ulike valg endrer den samme planens tilstand. Måle hvor ofte tekster bare gjentar «morgenen etablerer ... / ettermiddagen krever ... / kvelden viser ...», og skrive om gjentakelser til spesifikke observerbare hendelser. Måles både i test og visuelt i mobil/iPad.

### Funn 3 – By-rådgiver: riktig fag, men test forløp og mennesker

Kilder: `reports/civication-by-radgiver-role-world-realism-pilot.md` og `tests/civication-by-radgiver-role-world-realism-pilot.test.js`.

Testen beviser ett spor gjennom godkjenningsport og History Go-fagvalg. Neste kvalitetsprøve er flere ruter over tid: aktørene skal ha troverdige interesser, ikke bli talerør for en faglig fasit. Spillerens anbefaling må holdes atskilt fra formelle politiske vedtak; faktisk planmateriale og seinere innspill skal overleve dagsbytte og ny innlogging.

## Bok, film og original dramaturgi – redaksjonell kildeport

Kilder: `docs/CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md`, `.../storyInspirationCoverageV1.json`, `.../storyCoverageInventoryV1.json`.

Før en C01–C24-bue markeres redaksjonelt godkjent: noter (1) verifisert bok/film og **konkret tema fra nærlesning**, (2) sosiologisk konflikt som *ikke* kopierer verkets dialog, karakterer eller plott, (3) rolletilpasning, status og myndighet, (4) unik hendelse og flere legitime valg, (5) lagret konsekvens og senere tilbakekomst, (6) empirisk testbevis og manuell språk-/dramaturgikontroll. Ukjent filmtematikk skal stå `not_reviewed`. Unngå å «rette» status med metadata-match alene.

Det historiske 18. oktober-registeret har `registered_first_installment` for 8 typer, `no_new_scenes` for 16 og `full_arc_complete: false` for alle. Nyere Wave G-scener ligger utenfor registerets sist bekreftede status; oppdater registeret kun etter dokumentert sammenstilling, ikke ved å anta 24 ferdige buer.

## Symposium – utvid eksisterende lesemodell, ikke parallell motor

`js/Civication/lifestory/lifestoryRunner.js` har `getSymposium`: arkiv, personer, avtaler, møter, kapittelarkiv og tråder fra *faktisk state*. I dag er det `symposium` i `arbeidsledig` sin rollefil, ikke i de øvrige 14 manifeste rollene. Utkastene [#6279](https://github.com/Paradispartiet/History-Go/pull/6279) og [#6283](https://github.com/Paradispartiet/History-Go/pull/6283) er ikke godkjent/merget. Ikke kopier dem ukritisk over dagens main.

Neste leveranse: felles **lesbar** tidslinje for registrerte roller, basert på kanonisk lagrede scener; rollebytte bevarer person-/valgminne; løfter og møter vises bare når de faktisk finnes; ingen automatisk jobb, booking, kjærestestatus eller fantasiresultat. Bruk eksisterende state, tests og UI. Start med den dokumenterte arbeidsledigmodellen, og valider i mobil og iPad.

## Eksisterende kontrollporter som ikke skal svekkes

- `data/Civication/careerGameplayMatrix.json` / `careerGameplayPolicy.json`: 15 karrierekomponenter; `reference_complete` er **ikke** `role_world_complete`.
- `data/Civication/roleWorldRealismMatrix.json` / `roleWorldRolloutReadiness.json`: kontinuerlig arbeid, roller, mandat og provenance; godkjent kontrollert utrulling er ikke bevis på brukeropplevelse.
- `data/Civication/roleWorlds/index.json` / `roleWorldAuthoringChecklist.json`: redaksjonelle rolleverdener.
- `docs/CIVICATION_SYMPOSIUM_NARRATIVE_PRINCIPLES.md`: konkret, original fortelling og kontinuitet.
- `tests/civication-arbeidsledig-symposium.test.js`: eksisterende persistert tidslinje og avtalestatus.

**Sluttakseptanse for en rolle:** 14-spilldagers variasjon, faktiske faglige gjøremål, flere likeverdige beslutningsgrunner, vedvarende arbeidsobjekt der jobben krever det, dokumenterte myndighetsgrenser, ulike NPC-reaksjoner, privatliv som ikke er yrkeskarikatur, konsekvens etter dagsbytte/reload og observert mobil/iPad-flyt. Ingen ny parallell motor, ingen oppkonstruert AI-fasit og ingen «alt ferdig»-status basert på filantall.
