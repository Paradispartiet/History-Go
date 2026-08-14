# Civication Scene Pipeline v1

## Status

Dette er den normative migreringskontrakten for å konsolidere Civications mail- og karrieregameplay.

Fase 1 etablerte en bevisst read-only audit og Scene Contract v1 uten å endre scenevalg, døgnrytme, svarbehandling eller konsekvenser. Migreringstrinn 3 er nå gjennomført: normal planruntime laster alle ni canonicale plantyper direkte. Den globale auditten står fortsatt i `observe` fordi senere arkitekturgjeld ennå ikke er lukket.

Kanoniske maskinlesbare kilder:

- `data/Civication/sceneContractV1.schema.json`
- `data/Civication/scenePipelinePolicyV1.json`
- `scripts/audit-civication-scene-pipeline.mjs`
- `tests/civication-scene-pipeline-reachability.test.js`

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

`CivicationMailRuntime` laster nå disse ni plantypene gjennom samme planruntime:

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

Dette lukker den tidligere feilen der:

- Arealplanleggers `knowledge`, `micro`, `followup` og `consequence` fantes som direkte innhold, men ikke ble lastet av normal planruntime.
- Barnehageassistentens `knowledge`, `followup` og `consequence` fantes som direkte innhold, men ikke ble lastet av normal planruntime.
- syv konkrete plansteg derfor kunne bli semantisk erstattet av en fallback-type selv om riktig katalog eksisterte.

Reachability-regresjonen krever nå:

- null plantyper som mangler i `CivicationMailRuntime`
- null plansteg der direkte innhold finnes, men ikke lastes
- direkte valg av riktig type og tillatt familie før fallback vurderes

Fallbackrekkefølgen er foreløpig bevart for tilfeller der direkte innhold faktisk mangler. Den skal strammes inn som del av SceneDirector-migreringen, ikke skjult i denne typeparitetsendringen.

## Bekreftet gjenværende migreringsgjeld

Auditten skal fortsatt synliggjøre, ikke skjule, følgende forhold:

1. `DailyMailBuilder` kan generere generiske standardvalg når kildeinnholdet har færre enn to valg. Dette er forbudt i målkontrakten, men fjernes i en egen gameplay-migrering.
2. Flere moduler pakker inn `EventEngine.answer()`. Målet er ett prioritert handlerregister i `CivicationChoiceDirector`, ikke lastrekkefølge som implisitt kontrollflyt.
3. Dagsprogrammet beskriver 18–26 elementer og 8 500–12 000 ord per dag. Målkontrakten bruker i stedet 3–6 faktiske arbeidssituasjoner; lesetid og ordmengde er observasjoner, ikke produksjonskvoter.
4. `CivicationDailyMailBuilder`, `CivicationMailRuntime` og `CivicationWorkdayMailBuilder` har fortsatt overlappende seleksjonsansvar. Ett SceneDirector-eierskap er neste migreringsport.
5. Runtime leser fortsatt kildekataloger direkte. Ett kompilert scene-register er måltilstanden etter at SceneDirector- og adaptergrensene er låst.

## Fagverk og stabile spilleregler

Fagverket kan forbedre:

- forklaringer
- stillingsbeskrivelser
- lenker og videre lesing

Fagverket kan ikke stille endre:

- valg
- oppgavekrav
- effekter og konsekvensregler
- fasit eller suksessregel
- interaksjonsmodus

Slike felt skal være låst til en versjonert `ruleset_ref` i `knowledge_contract`. Dynamisk forklaring er bare tillatt når de frosne gameplayfeltene fortsatt peker på samme regler.

## Audit og overgang fra observasjon til gate

Auditten er read-only og skriver aldri om data. Standardmodus rapporterer gjenværende gjeld med exit code 0. `--strict` finnes for å gjøre samme funn blokkerende.

Reachability-delen er nå en reell regresjonsport: testen krever typeparitet og direkte lasting av eksisterende innhold. Den globale `enforcement_mode` forblir `observe` til SceneDirector-eierskap, svarpipeline, generiske fallbackvalg og dagsbudsjett er migrert; ellers ville én samlet strict-gate blokkere på kjent, separat planlagt gjeld.

## Migreringsrekkefølge og status

1. **Fullført:** Frys nye mailformater.
2. **Fullført:** Behold read-only-auditten og Scene Contract v1 som fasit.
3. **Fullført:** Gjør alle ni plantyper direkte nåbare.
4. **Neste:** La `CivicationDailyMailBuilder` bli én SceneDirector og integrer/fjern separat WorkdayMailBuilder-eierskap.
5. Flytt svarwrappere til eksplisitte `CivicationChoiceDirector`-handlere i fast rekkefølge.
6. Gjør private, life, narrative og social til kildeadaptre.
7. La runtime lese ett kompilert scene-register; fjern parallell seleksjon og gamle `jobbmails`.
8. Slå på blokkerende semantisk spilltest: plansteg -> scene -> valg/oppgave/info -> konsekvens -> progresjon -> neste steg.

Renholder og Arealplanlegger er de første bevisrollene etter at den felles planmotoren støtter alle ni typer.
