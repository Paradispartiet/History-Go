# Civication Scene Pipeline v1

Status: **canonical scene/runtime-kontrakt**  
Sist kontrollert: **2026-08-17**

## Formål

Denne filen beskriver den aktive Scene Pipeline-arkitekturen etter at 4F–4H-migreringen er fullført.

Den grunnleggende beslutningen er:

> **`scene` er gameplay-enheten. `mail` er én av flere leveringsformer.**

Civication skal derfor ikke utvikles som en samling parallelle mailmotorer. Work, private, life, narrative og social kan ha forskjellige produsenter, men de møtes ved én canonical scene-/kandidatgrense og én canonical svargrense der interaksjonen bruker EventEngine/ChoiceDirector.

Kanoniske maskinlesbare kilder og gates:

- `data/Civication/sceneContractV1.schema.json`
- `data/Civication/scenePipelinePolicyV1.json`
- `data/Civication/compiledSceneRegistryV1.schema.json`
- `data/Civication/compiledSceneRegistryV1.json`
- `scripts/build-civication-scene-registry.mjs`
- `scripts/audit-civication-scene-pipeline.mjs`
- `tests/civication-scene-pipeline-reachability.test.js`
- `tests/civication-scene-director-ownership.test.js`
- `tests/civication-scene-director-daily-catalog.test.js`
- `tests/civication-compiled-scene-registry-parity.test.js`
- `tests/civication-legacy-work-fallback-closed.test.js`
- `tests/civication-semantic-playthrough-gate.test.js`

## Arkitektur

```text
Authored work sources ───────────────┐
Private / Life source adapters ──────┤
Narrative / Social source adapters ──┼→ SceneCatalog
Fagverk / knowledge decoration ──────┘       │
                                             ▼
                                      SceneDirector
                                             │
                                  delivery / NextAction
                                             │
                                      ChoiceDirector
                                             │
                              consequence / progression
                                             │
                                           state
```

For work er det ett ekstra build-ledd:

```text
mailFamilies / authored work catalogs
→ deterministic compiler
→ compiled_scene_registry_v1
→ CivicationSceneCatalog
```

`mailFamilies` er dermed **source-of-build**, ikke normal work-runtime-kilde.

## Scene Contract

En canonical scene skiller mellom:

- domene (`work`, `private`, `life`, `social`, `system`);
- scenetype (`task`, `relationship`, `conflict`, `knowledge`, `consequence`, `offer`, `milestone`);
- levering (`mail`, `meeting`, `conversation`, `task`, `notification`);
- faktisk døgnfase;
- dramaturgisk stadium;
- interaksjonsmodus (`decision`, `task`, `ack`, `info`);
- tråd/praksisfortelling;
- personer og sted;
- én normalisert effektmodell;
- én versjonert `knowledge_contract`.

Informasjonsscener kan ha null valg. Beslutningsscener må ha minst to reelle kildeeide valg. Oppgavescener må ha en eksplisitt `task_contract`.

Runtime skal aldri dikte standardvalg for å skjule manglende innhold.

---

## Work pipeline etter 4H-D

### 1. Authoring

Work-innhold skrives fortsatt i de etablerte dataformatene, særlig:

- roleModel/FWG;
- `mailPlan`;
- `mailFamilies` og registrerte work-kataloger;
- knowledge-/practice-story metadata.

Dette er produksjonskilder, ikke selvstendige runtime-eiere.

### 2. Deterministisk kompilering

`build-civication-scene-registry.mjs` materialiserer `compiled_scene_registry_v1`.

Registryet inneholder blant annet:

- canonical scene-ID;
- `civication_scene_v1`-projeksjon;
- compatibility projection;
- source provenance og source hash;
- role index;
- registry hash;
- inventory av source files, ignored sources og eventuelle shadowed duplicates.

Normal runtime kan bare bruke registryet når shadowed duplicate-gjeld er null.

`node scripts/build-civication-scene-registry.mjs --check` er permanent sync-gate.

### 3. SceneCatalog

`CivicationSceneCatalog` er source-/normaliseringsgrensen.

For work:

- `getRoleMails()` leser compiled registry + `role_index`;
- brand-spesifikke scener filtreres mot aktiv `brand_id`;
- Career Knowledge Bridge-dekorering bevares;
- raw `mailFamilies` leses ikke av normal gameplay-runtime.

`getRolePlan()` kan fortsatt laste authored `mailPlan`, fordi planen er progresjonskontrakt og ikke sceneinnhold.

For private/life/narrative/social bruker samme Catalog registrerte source adapters.

### 4. MailRuntime

`CivicationMailRuntime` eier **plan/progresjon**, ikke rå scene-source loading.

Primær kandidatvei er:

```text
SceneCatalog.getRolePlan(active)
+ SceneCatalog.getRoleMails(active, state)
→ MailRuntime.selectCandidateMailsFromResolvedSources(...)
```

MailRuntime eier blant annet:

- current plan step;
- consumed IDs;
- plan history;
- family/type matching;
- canonical `fallback_types` innen samme resolved scene-sett;
- kandidat-scoring;
- plansteg-progresjon etter gyldig svar;
- thread-/brandrelatert progresjonsstate.

Hvis SceneCatalog mangler, lukkes planned gameplay fail-closed.

### 5. SceneDirector

`CivicationSceneDirector` er ett samlet kandidatinnsteg for Workday, Daily og EventEngine.

Det eksponerer blant annet:

- `getWorkCandidates(active, state, options)`;
- `getPrimaryWorkScene(active, state, options)`;
- `getEventEnginePack(engine, active, state, roleKey)`;
- Daily catalog/extra-slot helpers;
- selection snapshots/provenance.

Kompatibilitetsaliaser kan eksistere, men skal delegere inn i denne kjeden.

### 6. Delivery og svar

Scene leveres gjennom eksisterende flater, primært NextAction/MailEngine/EventEngine avhengig av scenetype.

`CivicationChoiceDirector` er eneste aktive `EventEngine.answer`-eier i standardruntime og validerer Scene Interaction før domenemiddleware/handlers får anvende konsekvenser.

---

## Fail-closed etter 4H-C

Følgende fallbackveier er lukket for work-gameplay:

- `data/Civication/jobbmails` som runtimekilde;
- legacy pack-fallback;
- RoleStoryletBridge-fallback;
- gammel `buildMailPool`-fallback;
- syntetisk generisk karrieremail;
- generiske runtimevalg som erstatter manglende kildeeide valg.

Regelen er:

```text
null canonical kandidat → no-op
SceneDirector/SceneCatalog-feil → fail-closed tom kandidatpool
```

Arkiv/migreringsdata kan ligge i repoet uten å være gameplaykilde.

Manglende rolleinnhold skal produseres, ikke maskeres.

---

## Typeparitet og direkte reachability

Disse ni plantypene er direkte nåbare gjennom samme planruntime:

1. `job`
2. `knowledge`
3. `micro`
4. `people`
5. `conflict`
6. `followup`
7. `story`
8. `event`
9. `consequence`

`faction_choice` beholdes som runtime-spesifikk type ved siden av de ni canonicale plantypene.

Reachability-porten krever:

- ingen deklarert plantype som MailRuntime ikke kan nå;
- ingen plansteg med direkte canonical innhold som likevel ikke kan velges;
- riktig type og tillatt familie før canonical fallback vurderes.

---

## Scene Interaction 4D–4E

Runtime genererer ikke lenger standardvalgene «gjør det ryddig» / «løs det raskt» når kilden mangler reelle valg.

`CivicationSceneInteraction` håndhever:

- `decision` → minst to reelle valg;
- `task` → eksplisitt task contract;
- `ack` → eksplisitt bekreftelse/ett kildeeid valg;
- `info` → null valg er gyldig.

En eksplisitt `decision` med for få valg blokkeres i stedet for å bli omskrevet.

Passive `info`-scener er semantisk gyldige. Der en bestemt delivery-flate ennå ikke har egen passiv presentasjon, skal runtime ikke gjøre dem om til falske decisions.

---

## ChoiceDirector 4F

`CivicationChoiceDirector` er canonical svargrense for EventEngine-interaksjoner.

Rundt-svar-logikk bruker prioritert middleware. Konsekvenser av et vellykket valg bruker handlers eller domeneeide runtimehooks.

Standard nesting er dokumentert i `docs/CIVICATION_PATCH_ORDER.md`.

Ny kode skal ikke direkte wrappe `CivicationEventEngine.prototype.answer`.

Dette gjelder også nye konsekvensområder som livelihood: en opportunity som oppstår fra et valg er en konsekvens av den canonicale scene-/choice-transaksjonen, ikke en ny svarmotor.

---

## Source adapters 4G

### Private

`CivicationPrivatePhaseMailBuilder` registrerer `private` bak SceneCatalog. Daily trenger ikke kjenne produsenten direkte.

### Life

`CivicationLifeMailRuntime` registrerer `life` bak SceneCatalog. Eksisterende eligibility, consumed-state, syklus og priority beholdes.

### Narrative

`CivicationNarrativeSceneSource` registrerer `narrative`. Kilden eier manifest-/stream-eligibility og storylet→scene-materialisering; Daily eier dagsplassering og narrativ state/effect-transaksjon.

### Social

`CivicationSocialSceneSource` registrerer `social`. FriendsEngine kan være kompatibilitetsfasade, mens private meldinger, svar, relasjonskonsekvens og samtaletråder beholder sitt domeneeierskap.

Source adapters er produsentgrenser, ikke et konkurrerende registry.

---

## Compiled registry 4H-A–4H-B

4H-A etablerte schema/compiler og deterministic registry contract.

4H-B materialiserte registryet og flyttet normal work-runtime over til det etter at før/etter-paritet var bevist.

Parity-porten dekker blant annet:

- scene-ID-er per rolle;
- type/familie/source path;
- choices/tags/effect/feedback/reply;
- priority/cooldown/repeatable/phase/stage;
- eligibility;
- thread/dedupe;
- knowledge decoration;
- kandidatsett og deterministisk utvalg.

Renholder og Arealplanlegger er representative bevisroller for denne kjeden.

---

## Semantisk playthrough 4H-D

4H-D er **fullført**.

Den permanente blokkerende testen `tests/civication-semantic-playthrough-gate.test.js` beviser en faktisk spillkjede:

```text
compiled scene selection
→ SceneDirector primary scene
→ EventEngine delivery
→ ChoiceDirector answer
→ EventEngine consequence
→ MailRuntime plan progression
→ consumed/history
→ next canonical plan scene
```

Testen avviser samtidig raw `mailFamilies`-reads i primærkjeden.

Ekspeditør-brandscener er også kompilert og filtrert mot aktiv brand slik at brandinnhold ikke lekker mellom arbeidsgivere.

Det finnes **ingen planlagt 4H-E** i denne migreringsrekken.

---

## Status etter 4H-D

Fullført:

1. freeze av nye tilfeldige mailformater;
2. Scene Contract og audit;
3. typeparitet/reachability;
4. SceneDirector/SceneCatalog ownership;
5. eksplisitt interaction contract uten syntetiske choices;
6. ChoiceDirector som eneste answer-eier;
7. private/life/narrative/social source adapters;
8. compiled registry for work;
9. lukket legacy fallback;
10. blokkerende semantisk playthrough.

Gjenværende Scene Pipeline-kvalitetsgjeld skal ikke forveksles med en ny arkitekturfase. Aktuelle områder er blant annet:

- finjustering/håndheving av dagsbudsjett;
- bedre presentasjon av passive `info`-scener der delivery-flaten trenger det;
- authored innholdsdybde;
- Role World-produksjon.

Den globale pipeline-auditten kan fortsatt stå i `observe` for gjeld som ikke er gjort blokkerende. Det betyr ikke at 4H-cutoveren er uferdig.

---

## Role World: neste innholdsretning, ikke ny runtime

`docs/CIVICATION_ROLE_WORLD_STANDARD.md` definerer den høyere redaksjonelle målstandarden for en fylt rolleverden.

Den skal bruke denne pipeline-arkitekturen:

```text
sosiologisk rollebibel / tematikk
→ roleModel + FWG + mailPlan + authored work sources
  + private/life/narrative/social sources
→ SceneCatalog
→ SceneDirector
→ delivery
→ ChoiceDirector
→ konsekvenser
```

Role World skal **ikke** introdusere:

- ny `roleWorldRuntime`;
- ny mailmotor;
- ny sceneformatfamilie bare for korrespondanse;
- egen bolig-/livelihood-/vennemotor ved siden av SceneCatalog;
- ny answer-wrapper.

14 dager × morgen/lunsj/ettermiddag/kveld er en dramaturgisk produksjonsstandard, ikke en kvote på 56 beslutningsmailer. `info`, `relationship`, `task`, `decision`, `ack` og ulike delivery-former skal brukes etter semantikken.

Viktige korrespondansetråder bør utvikles over flere beats/dager med eksisterende thread IDs, flags, effects, `next_bias` og consequences i stedet for å tvinge lange klikkdialoger inn i én scene.

---

## Fagverk og stabile spilleregler

Fagverket kan forbedre:

- forklaringer;
- stillingsbeskrivelser;
- lenker og videre lesing.

Fagverket kan ikke stille endre:

- interaksjonsmodus;
- valg;
- task requirements;
- effekter/konsekvensregler;
- fasit/success rule.

Gameplay-regler skal være versjonspinnet gjennom `knowledge_contract`/`ruleset_ref` der relevant.

---

## Audits

`audit-civication-scene-pipeline.mjs` er read-only som standard. `--strict` kan gjøre de samme funnene blokkerende.

Separate permanente tester håndhever allerede de viktigste migrerte grensene:

- direct reachability;
- Director ownership;
- Daily Catalog ownership;
- interaction contract;
- ChoiceDirector ownership;
- source adapters;
- compiled registry parity/sync;
- fail-closed legacy policy;
- semantic playthrough.

Dokumentasjonen skal aldri bruke en eldre migreringsfase som «neste» når den permanente testen og `main` allerede viser at fasen er fullført.
