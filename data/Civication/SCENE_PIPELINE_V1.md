# Civication Scene Pipeline v1

## Status

Dette er den normative migreringskontrakten for å konsolidere Civications mail- og karrieregameplay.

Fase 1 etablerte en read-only audit og Scene Contract v1 uten å endre scenevalg, døgnrytme, svarbehandling eller konsekvenser. Migreringstrinn 3 og SceneDirector-cutover 4A–4C er nå gjennomført:

- alle ni canonicale plantyper er direkte nåbare;
- Daily, Workday og EventEngine bruker ett outcome-aware kandidatinnsteg;
- EventEngine oppløser canonicale arbeidskandidater én gang;
- DailyBuilders ekstra arbeids-slot, familiekataloglasting og kildenormalisering ligger bak `CivicationSceneDirector` og `CivicationSceneCatalog`.

Den globale auditten står fortsatt i `observe`. Generiske standardvalg, svarwrappere, gammel dagskvote og manglende compiled registry er separate, synlige porter som ennå ikke er lukket.

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
Narrativer ─────┤                                            |
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

1. `CivicationSceneCatalog` bevarer foreløpig de eksisterende generiske standardvalgene når en kilde har færre enn to valg. Det er forbudt i målkontrakten og lukkes i neste interaksjonsport.
2. Flere moduler pakker inn `EventEngine.answer()`. Målet er ett prioritert handlerregister i `CivicationChoiceDirector`, ikke lastrekkefølge som implisitt kontrollflyt.
3. Dagsprogrammet beskriver 18–26 elementer og 8 500–12 000 ord per dag. Målkontrakten bruker 3–6 faktiske arbeidssituasjoner; lesetid og ordmengde er observasjoner, ikke produksjonskvoter.
4. SceneCatalog leser fortsatt registrerte kildekataloger. Ett kompilert scene-register er måltilstanden etter at interaksjons- og svargrensene er låst.
5. Private, life, narrative og social produserer ennå ikke alle canonicale scener gjennom rene adaptergrenser.

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

Reachability-testen håndhever typeparitet og direkte lasting. SceneDirector-eierskapstesten låser kandidatkjeden og EventEngine. Daily-katalogtesten låser 4C-grensen. Global `enforcement_mode` forblir `observe` til generiske fallbackvalg, svarpipeline, dagsbudsjett og compiled registry er migrert.

## Migreringsrekkefølge og status

1. **Fullført:** Frys nye mailformater.
2. **Fullført:** Behold read-only-auditten og Scene Contract v1 som fasit.
3. **Fullført:** Gjør alle ni plantyper direkte nåbare.
4. **Fullført:** Ett SceneDirector- og katalogeierskap.
   - **Fullført 4A:** Samle Daily/Workday-kall bak ett offentlig kandidatinnsteg.
   - **Fullført 4B:** Flytt EventEngines interne `buildMailPool` bak Director og fjern dobbeltseleksjonen.
   - **Fullført 4C:** Flytt Daily-ekstrascener, familielasting og normalisering bak Director/SceneCatalog.
5. **Neste:** Fjern generiske runtimevalg og krev korrekt `decision`, `task`, `info` eller `ack`.
6. Flytt svarwrappere til eksplisitte `CivicationChoiceDirector`-handlere i fast rekkefølge.
7. Gjør private, life, narrative og social til kildeadaptre.
8. La runtime lese ett kompilert scene-register; fjern parallelle kildeveier og gamle `jobbmails`.
9. Slå på blokkerende semantisk spilltest: plansteg → scene → valg/oppgave/info → konsekvens → progresjon → neste steg.

Renholder og Arealplanlegger er de første bevisrollene etter at interaksjonskontrakten og svartransaksjonen er samlet.

## Scene Interaction 4D: ingen syntetiske runtimevalg

Runtime genererer ikke lenger standardvalgene «Gjør dette ryddig og dokumenter det» / «Løs det raskt og gå videre» når kildeinnholdet har færre enn to valg. Både legacy-Daily-normaliseringen og `CivicationSceneCatalog` bevarer nå bare kildeeide valg: null valg forblir null, ett eksplisitt valg forblir ett, og to eller flere reelle valg normaliseres uten semantisk erstatning.

Dette lukker bare den syntetiske fallbacken. Neste interaksjonsport skal klassifisere `decision`, `task`, `info` og `ack` eksplisitt og blokkere mangelfulle beslutningsscener i stedet for å dikte gameplay. Den globale Scene Pipeline-auditen forblir derfor i `observe` inntil svarpipeline, interaksjonsklassifisering, dagsbudsjett og compiled registry er migrert.

## Scene Interaction 4E: eksplisitt interaksjonskontrakt

`CivicationSceneInteraction` er nå én delt runtime-adapter for Scene Contract v1-modusene `decision`, `task`, `ack` og `info`. Legacy-scener uten eksplisitt modus klassifiseres deterministisk fra kildeeide strukturer: oppgavekontrakt/-signal → `task`, minst to valg → `decision`, ett valg → `ack`, ingen valg → `info`. En eksplisitt modus blir aldri nedgradert for å få scenen til å passe.

SceneDirector sender bare gyldige, handlingskrevende scener inn i den eksisterende svarsløyfen. En eksplisitt `decision` med færre enn to reelle valg blokkeres som `decision_requires_two_choices`; passive `info`-scener beholdes som gyldig semantikk i katalogen, men materialiseres ikke som åpne dagsrader før en egen passiv leveringsport finnes. Når canonical-kilden finnes men bare består av blokkert/passivt innhold, er legacy-gameplay-fallback også sperret slik at runtime ikke erstatter semantikken med et annet spillvalg. Daily task gates bruker samme kontrakt og mapper eksisterende `task_gate_id` + `expected_output` til canonical `task_contract` uten å dikte ny oppgavelogikk. ChoiceDirector-eierskap er fortsatt uendret i denne porten.
