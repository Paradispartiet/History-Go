# Civication mailsystem, roleModels og authored scene-data

Oppdatert: **2026-08-17**

Dette dokumentet forklarer hvordan Civication-jobbinnhold produseres og hvordan `badges`, roleModels, FWG/work grammars, `mailPlans`, authored `mailFamilies`, compiled scene registry og runtime henger sammen.

> Motoroversikt: [`../../js/Civication/README.md`](../../js/Civication/README.md)  
> Scene/runtime-kontrakt: [`SCENE_PIPELINE_V1.md`](./SCENE_PIPELINE_V1.md)  
> Teknisk jobbkompletthet: [`../../docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](../../docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md)  
> Redaksjonell «fylt rolleverden»: [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md)

## Kort prinsipp

**Civication simulerer ikke CV-titler. Civication simulerer arbeidshverdager og liv rundt arbeidet.**

En rolle skal først forstås som:

- en faglig praksis;
- et sosialt miljø;
- et maktforhold;
- et sett mennesker og institusjoner;
- en fortelling over tid;
- et sted der valg får konsekvenser på jobb og privat.

Det nye Scene Pipeline-prinsippet er samtidig:

> **Scene er gameplay-enheten. Mail er bare én delivery-form.**

Dermed er `mailFamilies` fortsatt viktige authored source-filer, men de er ikke normal runtime-eier.

## Dagens systemkjede

```text
Badge / career contract
        ↓
roleModel + FWG/work grammar
        ↓
mailPlan + authored work scene/mailFamily-data
        ↓ build
compiledSceneRegistryV1.json
        ↓
CivicationSceneCatalog
        ↓
CivicationMailRuntime plan/progresjon
+ CivicationSceneDirector kandidat-/day-/EventEngine-eierskap
        ↓
delivery / NextAction / EventEngine
        ↓
CivicationChoiceDirector
        ↓
consequences / progression / domain state
```

Private, life, narrative og social går gjennom registrerte SceneCatalog-source adapters i stedet for å opprette parallelle mailmotorer.

## 1. Badge og career contract

Badge-data uttrykker læring/progresjon og kan åpne muligheter. Badge-poeng skal ikke automatisk gjøre spilleren til:

- ansatt;
- autorisert fagperson;
- leder;
- politisk innehaver;
- livsidentitet;
- mottaker av lønn eller sideinntekt.

Jobb, livsposisjon og levevei er separate akser.

Career contracts/resolvere bestemmer hvilken faktisk arbeidsverden og `role_scope` som er relevant.

## 2. roleModel: faglig og narrativ rollebibel

RoleModels ligger under:

```text
data/Civication/roleModels/{category}/...
```

En god roleModel skal forklare:

- hva rollen faktisk gjør;
- hvilke oppgaver som går igjen;
- hvilken fagkunnskap som kreves;
- miljø og institusjoner;
- personer og motparter;
- mandat og authority boundaries;
- press og dilemmaer;
- karriere-/exit-retninger;
- hva rollen gjør med spilleren over tid.

En gammel Badge-generert roleModel kan eksistere som kompatibilitetsdata uten å være god nok som Role World-bibel.

For en full rolleverden må roleModel/FWG samlet dekke kravene i `CIVICATION_ROLE_WORLD_STANDARD.md`, særlig sosialt miljø, maktkart, gjennomgående personer, sosiologisk hovedkonflikt og læringsmål.

## 3. FWG/work grammar

FWG beskriver hva slags arbeidssituasjoner rollen faktisk kan generere uten å bli en liste tilfeldige dilemmaer.

Den bør blant annet styre:

- actor grammar;
- place grammar;
- task/competence axes;
- pressure;
- conflict patterns;
- solution/failure patterns;
- practice stories;
- authority boundaries.

FWG er ikke en alternativ runtime. Den er styringsdata for authored/generert innhold og audits.

## 4. mailPlan: progresjons- og dramaturgiplan

MailPlans ligger under:

```text
data/Civication/mailPlans/{category}/{role_scope}_plan.json
```

`mailPlan` bestemmer den langsiktige progresjonen gjennom rollen.

Typiske typer:

- `job`
- `knowledge`
- `micro`
- `people`
- `conflict`
- `followup`
- `story`
- `event`
- `consequence`

`faction_choice` kan finnes som runtime-spesifikk type ved siden av disse.

En plan skal beskrive hvorfor neste situasjon kommer, ikke bare type-rekkefølgen.

Dårlig:

```text
job → people → conflict → event
```

Bedre:

```text
spilleren lærer et tilsynelatende enkelt problem
→ en kollega viser hvordan praksis faktisk fungerer
→ et tidligere valg skaper en konflikt
→ ansvar og myndighet kommer i utakt
→ senere etterprøving viser kostnaden
```

For Role World-produksjon skal planen dessuten støtte en sammenhengende 14-dagers bue, ikke bare isolerte milestones.

## 5. mailFamilies: authored work source-data

MailFamilies ligger under:

```text
data/Civication/mailFamilies/{category}/{mail_type}/...
```

De er fortsatt den viktigste authored work-kilden for konkrete situasjoner, men normal runtime leser dem ikke direkte etter 4H-D.

En god authored scene/mail bør minst uttrykke:

- stabil ID;
- rolle/role_scope;
- scene/mail type;
- sender/person når relevant;
- sted når relevant;
- subject/summary/situation;
- konkret task/problem;
- kompetanse;
- pressure;
- choice axis;
- consequence axis;
- narrative arc;
- learning focus;
- reelle choices eller eksplisitt task/info/ack-semantikk;
- effects/flags/next bias;
- thread/practice-story identitet når relevant.

### Ikke skriv tilfeldige moralske quizzer

Dårlig:

```text
Du har et problem. Velg om du vil være nøye eller rask.
```

Bedre:

```text
Køen vokser, kampanjeprisen i kassa avviker fra hylleprisen, kollegaen står i varepåfyll, og kunden ser at plakaten viser et annet beløp. Hva prioriterer du, og hvem må involveres?
```

Valgene skal kunne endre senere state, ikke bare gi øyeblikkelig feedback.

## 6. Compiled Scene Registry

Work-innhold kompileres med:

```text
node scripts/build-civication-scene-registry.mjs
```

Output:

```text
data/Civication/compiledSceneRegistryV1.json
```

Registryet er den materialiserte runtime-kilden for statiske work-scenes og inneholder blant annet:

- `civication_scene_v1`;
- compatibility projection;
- source provenance/hash;
- role index;
- registry hash;
- source inventory;
- shadowed-duplicate inventory.

Permanent sync-gate:

```text
node scripts/build-civication-scene-registry.mjs --check
```

Normal work-runtime skal ikke gå rundt registryet og lese rå `mailFamilies` som fallback.

## 7. SceneCatalog

`CivicationSceneCatalog` er canonical source-/normaliseringsgrense.

For work:

```text
getRoleMails(active, state)
→ compiled registry / role_index
```

For plan:

```text
getRolePlan(active)
→ authored mailPlan
```

For private/life/narrative/social brukes registrerte source adapters.

SceneCatalog skal være stedet der kildeformatforskjeller slutter å være et problem for konsumentene.

## 8. CivicationMailRuntime

`CivicationMailRuntime` eier **plan og progresjon**.

Den skal ikke beskrives som rå mailFamily-loader lenger.

Primærkjeden er:

```text
SceneCatalog.getRolePlan(active)
+ SceneCatalog.getRoleMails(active, state)
→ selectCandidateMailsFromResolvedSources(...)
```

MailRuntime håndterer blant annet:

- plansteg;
- consumed IDs;
- history;
- allowed family/type;
- canonical fallback types;
- kandidat-scoring;
- triggered threads;
- progresjon til neste plansteg etter vellykket svar.

Hvis SceneCatalog mangler, skal planned gameplay fail-closed.

## 9. SceneDirector

`CivicationSceneDirector` gir ett samlet kandidatinnsteg for Workday, Daily og EventEngine.

Det betyr at gamle broer eller kompatibilitetsnavn ikke skal tolkes som source ownership selv om de fortsatt finnes i kode.

Legacy pack, RoleStoryletBridge og gammel `buildMailPool` får ikke overta når canonical kandidat mangler.

## 10. ChoiceDirector

`CivicationChoiceDirector` er eneste aktive answer-eier for EventEngine-svar i standardruntime.

Scene Interaction skiller mellom:

- `decision`
- `task`
- `ack`
- `info`

Manglende choices skal ikke fylles med syntetiske standardvalg.

Konsekvensmotorer, jobbprogresjon, learning, livelihood og andre domener skal koble seg til den vellykkede canonical choice-transaksjonen, ikke lage egne answer-wrappere.

## 11. Praksisfortellinger: baseline, ikke «fylt»

`data/Civication/praksisfortellinger_registry.json` dokumenterer to-ukers pakker for flere modne Næringslivsroller.

Dette er verdifull produksjonsbaseline, men skal ikke lenger omtales som at rollen er fullstendig fylt.

Ekspeditør har for eksempel:

- uke 1: 5 jobbtråder + 5 private tråder;
- uke 2: 5 jobbtråder + 5 private tråder.

Det er 20 baseline-tråder og gir reell spillbarhet, men Role World-standarden sikter mot en langt mer sammenhengende sosial sesong.

## 12. Role World: høyere redaksjonell standard

En fylt rolleverden skal behandles som en liten serie/sosial roman.

Kravene eies av:

```text
docs/CIVICATION_ROLE_WORLD_STANDARD.md
```

Målbildet er blant annet:

- tydelig rolletema;
- sosiologisk hovedkonflikt;
- faglig kjerne;
- sosialt miljø;
- faste NPC-er/sosiale typer;
- klasse/status/makt;
- 14 dagers sesongbue;
- morgen/lunsj/ettermiddag/kveld som dramaturgiske ankerpunkter;
- viktige korrespondansetråder som utvikler seg over 5–10 beats;
- arbeid/private consequences;
- læring om rollen og samfunnet.

### 14 dager er ikke 56 kunstige decisions

Scene Pipeline støtter forskjellige semantiske scener.

En dag kan derfor være:

```text
morgen      → info / ramme
lunsj       → relationship / conversation
ettermiddag → task eller decision
kveld       → private consequence / ack / life scene
```

Målet er meningsfulle beats, ikke en mailkvote.

## 13. Film-/fortellingstemaer

Film og andre fortellinger kan brukes som intern tematisk inspirasjon:

```text
tema
→ sosiologisk konflikt
→ rollehverdag
→ authored scene
```

Eksempler på temaer:

- fremmedgjøring;
- klasse;
- status;
- arbeid/kropp;
- emosjonelt arbeid;
- byråkrati;
- skam;
- ambisjon;
- lojalitet;
- forbruk;
- kynisme;
- drømmen om et annet liv;
- fellesskap.

Det er ikke tillatt å kopiere eller nær-omskrive plot, karakterer, dialog eller konkrete scener fra identifiserbare verk.

## 14. NPC-er og sosialt miljø

Faste personer skal ha mer enn navn.

For viktige NPC-er bør roleModel/FWG/sceneproduksjonen kunne uttrykke:

- sosial/klasseposisjon;
- status;
- formell/uformell makt;
- mål;
- frykt/skjult interesse;
- institusjonell funksjon;
- talemåte;
- utviklingsmuligheter;
- hva spilleren lærer gjennom relasjonen.

NPC-er kan begynne som tydelige sosiale typer, men skal ikke bli flate karikaturer.

## 15. Jobb, livsposisjon og levevei

Civication har separate akser for:

```text
Badge-progresjon
livsposisjon
formell jobb/arbeidsstatus
levevei
```

En scene kan åpne en `livelihood opportunity`, men dette er ikke automatisk jobb eller direkte betaling.

Canonical livelihood-kjede:

```text
scene / Life Story / nettverk
→ opportunity
→ spillerens eksplisitte aksept
→ livelihood stream
→ deterministisk økonomisk avregning
```

Ingen authored scene skal skrive sideinntekt direkte til wallet.

## 16. Produksjonsrekkefølge for en rolle

For en eksisterende `role_scope`:

```text
1. Revider roleModel/FWG som rollebibel.
2. Definer sosiologisk hovedkonflikt og faglig læring.
3. Definer cast, steder, makt- og klassekart.
4. Definer 14-dagers sesongbue og gjentakende tråder.
5. Revider/utvid mailPlan.
6. Skriv authored work/private/life/social/narrative scenes i eksisterende formater.
7. Bygg/regenerer compiled registry for work.
8. Kjør Scene Pipeline/Career Gameplay/rolle-spesifikke tester.
9. Les faktisk spillflyt som helhet — ikke bare tell filer.
```

Ikke opprett ny runtime, ny dagsrytme eller ny nesten-lik `role_scope` bare for å få et kvalitetsmerke.

## 17. Første Role World-referanse: Ekspeditør

Ekspeditør har allerede en sterk baseline med:

- to praksisuker;
- private etterklangsscener;
- tilbakevendende Lene/Amir/Sara/Jonas;
- `service_mask`, stress, kundetillit og relasjonelle konsekvenser;
- 30-stegs plan;
- brandscener i compiled registry.

Men dagens gamle roleModel er fortsatt for generisk, og to-ukerspakken er ikke en full sosial sesong.

Neste Ekspeditør-produksjon skal derfor først forbedre **rollebibelen og sesongstrukturen**, deretter scenevolumet.

## 18. Kvalitetsregel

En rolle er ikke «fylt» fordi den:

- har roleModel;
- har FWG;
- har mailPlan;
- har mange mailFamilies;
- har to praksisuker;
- er `reference_complete` i Career Gameplay Matrix.

«Fylt» betyr den høyere Role World-standarden: et vedvarende sosialt drama der arbeid, mennesker, samfunn, privatliv og konsekvenser faktisk henger sammen over tid.
