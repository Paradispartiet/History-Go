# Civication Scene Pipeline v1

## Status

Dette er den normative migreringskontrakten for å konsolidere Civications mail- og karrieregameplay.

Fase 1 etablerte en read-only audit og Scene Contract v1 uten å endre scenevalg, døgnrytme, svarbehandling eller konsekvenser. Migreringstrinn 3 og SceneDirector-cutover 4A–4C er nå gjennomført:

- alle ni canonicale plantyper er direkte nåbare;
- Daily, Workday og EventEngine bruker ett outcome-aware kandidatinnsteg;
- EventEngine oppløser canonicale arbeidskandidater én gang;
- DailyBuilders ekstra arbeids-slot, familiekataloglasting og kildenormalisering ligger bak `CivicationSceneDirector` og `CivicationSceneCatalog`.

Den globale auditten står fortsatt i `observe`. Generiske runtimevalg, parallelle `answer()`-wrappere og kildeadapter-cutoveren er nå lukket gjennom 4D–4G. Gjenværende synlig gjeld er dagsbudsjett, compiled registry og den senere blokkerende semantiske spilltesten.

Kanoniske maskinlesbare kilder:

- `data/Civication/sceneContractV1.schema.json`
- `data/Civication/scenePipelinePolicyV1.json`
- `scripts/audit-civication-scene-pipeline.mjs`
- `tests/civication-scene-pipeline-reachability.test.js`
- `tests/civication-scene-director-ownership.test.js`
- `tests/civication-scene-director-daily-catalog.test.js`

## Arkitekturbeslutning

`scene` er gameplay-enheten. `mail` er én av flere leveringsformer.

```text
RolePack / FWG ─┐
Private / Life ─┼─> kildeadaptre -> normalisering/kompilering -> SceneCatalog
Narrativ / Social┤                                            |
Fagverket ──────┘                                      SceneDirector
                                                             |
                                                   delivery / NextAction
                                                             |
                                                        ChoiceDirector
                                                             |
                                         konsekvens -> progresjon -> state
```

En scene skiller mellom:

- domene (`work`, `private`, `life`, `social`, `system`)
- scenetype (`task`, `relationship`, `conflict`, `knowledge`, `consequence`, `offer`, `milestone`)
- levering (`mail`, `meeting`, `conversation`, `task`, `notification`)
- faktisk døgnfase og dramaturgisk stadium
- interaksjonsmodus (`decision`, `task`, `ack`, `info`)
- tråd, praksisfortelling, personer og sted
- én normalisert effektmodell
- én versjonert `knowledge_contract`

Informasjonsscener kan ha null valg. Beslutningsscener må ha minst to reelle valg. Oppgavescener må ha en eksplisitt `task_contract`. Runtime skal ikke generere standardvalg for å skjule manglende innhold.

## Lukket migreringsgjeld: typeparitet og direkte reachability

`CivicationMailRuntime` laster disse ni plantypene gjennom samme planruntime:

1. `job`
2. `knowledge`
3. `micro`
4. `people`
5. `conflict`
6. `followup`
7. `story`
8. `event`
9. `consequence`

`faction_choice` beholdes som en runtime-spesifikk type ved siden av de ni canonicale plantypene.

Reachability-regresjonen krever:

- null plantyper som mangler i `CivicationMailRuntime`;
- null plansteg der direkte innhold finnes, men ikke lastes;
- direkte valg av riktig type og tillatt familie før fallback vurderes.

Dette lukker den tidligere feilen der Arealplanlegger og Barnehageassistent hadde direkte `knowledge`-, `micro`-, `followup`- og `consequence`-innhold som normal runtime likevel ikke nådde.

## SceneDirector-cutover 4A–4B: ett kandidatinnsteg

`CivicationWorkdayMailBuilder` oppretter `window.CivicationSceneDirector` etter at MailRuntime og eksisterende kandidat-utvidelser er lastet. Director fanger den komplette, outcome-aware kildeselektoren og eksponerer:

- `getWorkCandidates(active, state, options)`
- `getPrimaryWorkScene(active, state, options)`
- `getEventEnginePack(engine, active, state, roleKey)`
- `inspect()` med begrenset seleksjonsspor

Det gamle navnet `CivicationMailRuntime.makeCandidateMailsForActiveRole` er en ren alias til Director. Workday, Dailys primærscene, EventEngines `buildMailPool` og eldre kompatibilitetskall går derfor gjennom samme canonicale innsteg.

EventEngine laster legacy-pack og RoleStoryletBridge bare når Director returnerer null canonicale kandidater. En terminal karrieretilstand med `__career_outcome_terminal_closed` åpner ikke legacy-fallback. Den forrige `buildMailPool`-adapteren brukes bare som eksplisitt feilsikring dersom Director selv kaster en feil.

## SceneDirector-cutover 4C: Daily-ekstrascener og katalogeierskap

`window.CivicationSceneCatalog` er nå den ene runtimeadapteren for dagens kildekataloger. Den eier:

- canonical liste over rollefamiliestier;
- lasting og cache av plan og mailfamilier;
- flattening av familiekataloger;
- valg- og felt-normalisering under migreringen;
- Career Knowledge Bridge-dekorering;
- progresjonsfiltrering, case-tråd-deduplisering og deterministisk rangering.

Dette er en kildeadapter mot legacy `mailFamilies`, ikke sluttens `compiled_scene_registry_v1`. Registry-cutoveren kommer senere uten at Daily igjen får katalogeierskap.

SceneDirector eksponerer nå i tillegg:

- `getDailyCatalog(active, state, options)`
- `populateDailyExtraSlots(active, state, runtime, options)`
- `prewarmDailyCatalog(active, options)`
- `getLastSelectionSnapshot(active)` for å bevare terminalt karriereutfall gjennom samme købygging

Dailys offentlige API og døgnrytme er bevart. Den normale købyggingen følger denne rekkefølgen:

```text
Daily bygger fasekø, private scener, narrativer og canonical primærscene
→ gammel intern mailFamilies-lesing undertrykkes i dette avgrensede kallrommet
→ SceneCatalog laster og normaliserer kildene én gang
→ SceneDirector fyller bare genererte plassholdere i forenoon/workday
→ ferdig runtime lagres og gjenbrukes av Dailys eksisterende levering
```

Director erstatter ikke:

- canonical primærscene;
- private faser;
- narrative storylets;
- fasegeneratorer;
- allerede valgte eller besvarte runtimeelementer.

Eksisterende same-day runtime adopteres uten å nullstille status eller progresjon. Nye ekstrascener får eksplisitt katalog- og seleksjonsprovenance. Terminalt lukket karriere får null Daily-ekstrascener og åpner ikke gammel katalogfallback.

Regresjonstesten for 4C beviser:

- at Daily-fasaden patches før normal bruk;
- at Dailys gamle familiekataloglesing ikke treffer kilden;
- at hver katalogfil lastes gjennom SceneCatalog, ikke både Daily og Catalog;
- at Director fyller riktige `job`, `micro`, `people`, `conflict`, `followup` og `consequence`-slot uten kilde-ID-duplikater;
- at Career Knowledge Bridge-dekorering og arbeidsdagstempling bevares;
- at `startToday` gjenbruker den Director-bygde runtimekøen;
- at terminal karriere forblir lukket.

De gamle interne Daily-funksjonene finnes foreløpig som kompatibilitetskode i filen, men normal produksjonsflyt leser ikke rollefamilier gjennom dem. De fjernes fysisk sammen med senere compiled-registry-cutover, ikke ved å reaktivere et konkurrerende eierlag.

## Bekreftet gjenværende migreringsgjeld

1. Dagsprogrammet beskriver fortsatt en eldre element-/ordmengdemodell. Målkontrakten bruker 3–6 faktiske arbeidssituasjoner; lesetid og ordmengde er observasjoner, ikke produksjonskvoter.
2. SceneCatalog leser fortsatt registrerte kildekataloger. Ett kompilert scene-register er måltilstanden nå som `private`, `life`, `narrative` og `social` er samlet bak registrerte kildeadaptre.

## Fagverk og stabile spilleregler

Fagverket kan forbedre:

- forklaringer;
- stillingsbeskrivelser;
- lenker og videre lesing.

Fagverket kan ikke stille endre:

- valg;
- oppgavekrav;
- effekter og konsekvensregler;
- fasit eller suksessregel;
- interaksjonsmodus.

Slike felt skal være låst til en versjonert `ruleset_ref` i `knowledge_contract`. Dynamisk forklaring er bare tillatt når de frosne gameplayfeltene fortsatt peker på samme regler.

## Audit og overgang fra observasjon til gate

Auditten er read-only og skriver aldri om data. Standardmodus rapporterer gjenværende gjeld med exit code 0. `--strict` gjør de samme funnene blokkerende.

Reachability-testen håndhever typeparitet og direkte lasting. SceneDirector-eierskapstesten låser kandidatkjeden og EventEngine. Daily-katalogtesten låser 4C-grensen. Global `enforcement_mode` forblir `observe` til dagsbudsjett og compiled registry er migrert og den blokkerende semantiske spilltesten kan slås på.

## Migreringsrekkefølge og status

1. **Fullført:** Frys nye mailformater.
2. **Fullført:** Behold read-only-auditten og Scene Contract v1 som fasit.
3. **Fullført:** Gjør alle ni plantyper direkte nåbare.
4. **Fullført:** Ett SceneDirector- og katalogeierskap.
   - **Fullført 4A:** Samle Daily/Workday-kall bak ett offentlig kandidatinnsteg.
   - **Fullført 4B:** Flytt EventEngines interne `buildMailPool` bak Director og fjern dobbeltseleksjonen.
   - **Fullført 4C:** Flytt Daily-ekstrascener, familielasting og normalisering bak Director/SceneCatalog.
5. **Fullført 4D–4E:** Fjern generiske runtimevalg og krev korrekt `decision`, `task`, `info` eller `ack`.
6. **Fullført 4F:** `CivicationChoiceDirector` er eneste aktive `EventEngine.answer`-eier; rundt-semantikk ligger i eksplisitt prioritert middleware.
7. **Fullført 4G:** Gjør private, life, narrative og social til kildeadaptre.
   - **Fullført 4G-A:** `private` registreres deferred og konsumeres via `CivicationSceneCatalog`; Daily har ingen direkte produsentkobling.
   - **Fullført 4G-B:** `life` registreres som egen SceneCatalog-adapter; standard Life-`onAppOpen` konsumerer kilden via Catalog uten direkte produsentfallback.
   - **Fullført 4G-C:** `narrative` eier manifest/stream-eligibility og storylet→scene bak SceneCatalog; Daily eier fortsatt dagsplassering og narrativ state/effect-transaksjon.
   - **Fullført 4G-D:** `social` registreres som SceneCatalog-adapter; FriendsEngine er synkron kompatibilitetsfasade mot den registrerte adapteren, mens kart, private meldinger og samtalekonsekvenser beholder eksisterende semantikk.
8. **Neste:** La runtime lese ett kompilert scene-register; fjern parallelle kildeveier og gamle `jobbmails`.
9. Slå på blokkerende semantisk spilltest: plansteg → scene → valg/oppgave/info → konsekvens → progresjon → neste steg.

Renholder og Arealplanlegger er de første bevisrollene etter at interaksjonskontrakten og svartransaksjonen er samlet.

## Scene Interaction 4D: ingen syntetiske runtimevalg

Runtime genererer ikke lenger standardvalgene «Gjør dette ryddig og dokumenter det» / «Løs det raskt og gå videre» når kildeinnholdet har færre enn to valg. Både legacy-Daily-normaliseringen og `CivicationSceneCatalog` bevarer nå bare kildeeide valg: null valg forblir null, ett eksplisitt valg forblir ett, og to eller flere reelle valg normaliseres uten semantisk erstatning.

Dette lukker bare den syntetiske fallbacken. Neste interaksjonsport skal klassifisere `decision`, `task`, `info` og `ack` eksplisitt og blokkere mangelfulle beslutningsscener i stedet for å dikte gameplay. Den globale Scene Pipeline-auditen forblir derfor i `observe` inntil svarpipeline, interaksjonsklassifisering, dagsbudsjett og compiled registry er migrert.

## Scene Interaction 4E: eksplisitt interaksjonskontrakt

`CivicationSceneInteraction` er nå én delt runtime-adapter for Scene Contract v1-modusene `decision`, `task`, `ack` og `info`. Legacy-scener uten eksplisitt modus klassifiseres deterministisk fra kildeeide strukturer: oppgavekontrakt/-signal → `task`, minst to valg → `decision`, ett valg → `ack`, ingen valg → `info`. En eksplisitt modus blir aldri nedgradert for å få scenen til å passe.

SceneDirector sender bare gyldige, handlingskrevende scener inn i den eksisterende svarsløyfen. En eksplisitt `decision` med færre enn to reelle valg blokkeres som `decision_requires_two_choices`; passive `info`-scener beholdes som gyldig semantikk i katalogen, men materialiseres ikke som åpne dagsrader før en egen passiv leveringsport finnes. Når canonical-kilden finnes men bare består av blokkert/passivt innhold, er legacy-gameplay-fallback også sperret slik at runtime ikke erstatter semantikken med et annet spillvalg. Daily task gates bruker samme kontrakt og mapper eksisterende `task_gate_id` + `expected_output` til canonical `task_contract` uten å dikte ny oppgavelogikk. ChoiceDirector-eierskapet ble senere samlet i 4F og er nå eneste aktive `EventEngine.answer`-pipeline.


## Source adapters 4G-A: private

`CivicationSceneCatalog` har nå ett lite kildeadapterregister som overgangsgrense før den senere `compiled_scene_registry_v1`-cutoveren. Dette er ikke et nytt parallelt registry: Catalog forblir eier, adapterne er navngitte produsentgrenser, og `compiled_registry_ready` forblir `false`.

`CivicationPrivatePhaseMailBuilder` registrerer `private` med `source_format: private_phase_mail_families_v1`. Fordi Private lastes før Workday/SceneCatalog i standard `DAY_SCRIPTS`, bruker den en deferred registreringskø som Catalog adopterer ved opprettelse. Daily kjenner ikke lenger `CivicationPrivatePhaseMailBuilder` direkte; den ber `CivicationSceneCatalog.getSourceScenes("private", ...)` om fasens scene.

4G-A endrer ikke utvalg, døgnrytme, private felt, valg eller fasebegrensninger. Den samme `buildPhaseMail`-logikken er adapterens produsent. Catalog legger bare til provenance (`scene_source_adapter`, `scene_source_format`, `scene_catalog_owner`, `scene_catalog_version`) og den eksisterende Scene Interaction-dekoreringen.

Regresjonen krever at:

- Private kan registrere seg før SceneCatalog finnes;
- Catalog adopterer nøyaktig én `private`-adapter;
- Daily har null direkte referanse til Private-builderen;
- adapterkallet velger samme scene som den eksisterende produsentlogikken;
- `compiled_registry_ready` fortsatt er `false`.

## Source adapters 4G-B: life

`CivicationLifeMailRuntime` registrerer `life` i det samme SceneCatalog-registeret med `source_format: life_mail_manifest_v1`. Life-generatoren (`makeCandidateLifeMails` / `makeNextLifeMail`) beholder sitt eksisterende eierskap til manifestlasting, eligibility, consumed-state, syklus og prioritering; adapteren er bare den navngitte kildegrensen rundt samme produsent.

I standard `DAY_SCRIPTS` lastes Workday/SceneCatalog før Life. `lifeRuntimeOnAppOpen` ber derfor nå `CivicationSceneCatalog.getSourceScenes("life", ...)` om kandidaten og har ingen direkte `makeNextLifeMail()`-fallback. Adapteren støtter likevel samme deferred kø som Private, slik at isolerte test-/alternativlastere kan registrere Life før Catalog uten å opprette et parallelt eierlag.

4G-B endrer ikke morning-gaten, `shouldTryLifeMail`, valgt scene, valg, consumed-state eller answer-semantikk. Den eksisterende `life_mail_runtime`-middlewareen forblir uendret på priority 30. Catalog legger bare til den samme provenance- og Scene Interaction-dekoreringen som for øvrige adapterkilder.

Regresjonen krever at:

- standard loader rekkefølge plasserer SceneCatalog før Life;
- Catalog eier nøyaktig én `life`-adapter;
- adapteren velger samme scene som `makeNextLifeMail`;
- standard Life-`onAppOpen` ikke kaller Life-produsenten direkte;
- deferred Life-registrering adopteres idempotent;
- answer-middleware-navn og priority 30 er uendret;
- `compiled_registry_ready` fortsatt er `false`.


## Source adapters 4G-C: narrative

`CivicationNarrativeSceneSource` registrerer `narrative` i det eksisterende SceneCatalog-registeret med `source_format: civication_narrative_stream_v1`. Modulen eier manifest-/streamlasting, stream- og storylet-eligibility, vekt/manifestrekkefølge og storylet→scene-materialisering. Standard `DAY_SCRIPTS` laster kilden etter Workday/SceneCatalog og før Daily.

Daily beholder dagsorkestreringen: hvilke slots som finnes, private/work-separasjonen, `narrative_state_v1`, valg-/effekttransaksjonen og hvor en same-day storylet settes inn. Selve sceneproduksjonen går derimot gjennom `CivicationSceneCatalog.getSourceScenes("narrative", ...)` både ved normal dagsbygging og når `opens_streams` injiserer en ny storylet samme dag. Daily refererer aldri `CivicationNarrativeSceneSource` direkte.

4G-C bevarer de eksisterende reglene for manifestrekkefølge, første kvalifiserte storylet per stream, `weight_when`, phase/time-slot, private blokkering av work/class_case/conflict, scene-ID/thread-key, valg, `opens_streams` og prefererte injeksjonsfaser. Catalog legger bare til vanlig source-provenance og Scene Interaction-dekorering. De gamle interne narrative kildefunksjonene kan ligge som kompatibilitetskode frem til compiled-registry-cutoveren, men normal Daily-produksjon kaller dem ikke.

Regresjonen krever at:

- loaderrekkefølgen er SceneCatalog → Narrative source → Daily;
- Catalog eier nøyaktig én `narrative`-adapter;
- normal `buildQueue` ikke laster streammanifest, velger storylet eller materialiserer narrative scene direkte;
- same-day `opens_streams`-injeksjon bruker samme Catalog-adapter;
- private/work-separasjon, sceneidentitet, valg og injeksjonsfase bevares;
- Daily answer-middleware forblir priority 40;
- `compiled_registry_ready` fortsatt er `false`.

## Source adapters 4G-D: social

`CivicationSocialSceneSource` registrerer `social` i det eksisterende SceneCatalog-registeret med `source_format: civication_social_encounter_v1`. Modulen fanger den eksisterende deterministiske `CivicationFriendsEngine.getSocialEncountersForLocation`-produsenten én gang og gjør deretter FriendsEngines offentlige `getSocialEncountersForLocation` og `canApproachFriendAtLocation` til synkrone kompatibilitetsfasader mot den registrerte adapteren.

I standard `DAY_SCRIPTS` lastes `CivicationSocialSceneSource` etter `CivicationWorkdayMailBuilder`, som allerede har opprettet SceneCatalog, og før Daily fortsetter. Det betyr at normal runtime aldri trenger en direkte raw-producer-fallback. Hvis en alternativ testloader laster Social tidligere, kan adapteren bare legges i den samme deferred registreringskøen som Private/Life; den offentlige fasaden feiler lukket til Catalog faktisk eier adapteren.

Social er en annen leveringsflate enn den choice-baserte Daily-svarsløyfen. Encounter-modellen beholder derfor `action: "approach"` og mottakerens `responseOptions` (`reply`, `ignore`, `decline`) uten å bli tvangsklassifisert som `decision`/`info` av ChoiceDirector. `CivicationFriendMessages`, `CivicationRelationshipEngine` og `CivicationSocialConversationEngine` beholder eierskap til privat melding, svar, relasjonskonsekvens og samtaletråd. Adapteren legger bare på source-provenance; den endrer ikke hvem som møtes, hvor, når eller hvilke svar som finnes.

Regresjonen krever at:

- standard loaderrekkefølge er SceneCatalog → Social source → Daily;
- Catalog eier nøyaktig én `social`-adapter;
- FriendsEngines offentlige møteoppslag og `canApproachFriendAtLocation` går gjennom den registrerte adapteren;
- valgt person, fase, locationId, `approach` og `reply/ignore/decline` er identiske med den eksisterende produsenten;
- CityLayer kjenner bare FriendsEngine-fasaden, ikke Social-produsenten direkte;
- registrering er idempotent og CityLayer får én rerender etter cutover;
- eksisterende private meldings-, respons-, relasjons- og samtaletester forblir grønne;
- `compiled_registry_ready` fortsatt er `false`.
