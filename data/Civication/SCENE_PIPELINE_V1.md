# Civication Scene Pipeline v1

## Status

Dette er den normative migreringskontrakten for å konsolidere Civications mail- og karrieregameplay. Første leveranse er bevisst **read-only**: den endrer ikke scenevalg, døgnrytme, svarbehandling eller konsekvenser i runtime.

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

## Bekreftet baselinegjeld

Auditten skal synliggjøre, ikke skjule, følgende forhold før migrering:

1. `CivicationMailRuntime` velger fra seks typer, mens de dramaturgiske planene bruker ni canonicale legacy-typer.
2. Arealplanlegger har direkte innholdsfiler for `knowledge`, `micro`, `followup` og `consequence`, men disse lastes ikke av normal planruntime.
3. Barnehageassistent har direkte innholdsfiler for `knowledge`, `followup` og `consequence`, men disse lastes ikke av normal planruntime.
4. Dermed finnes syv konkrete plansteg med innhold som kan bli semantisk erstattet av en fallback-type.
5. `DailyMailBuilder` kan generere generiske standardvalg når kildeinnholdet har færre enn to valg. Dette er forbudt i målkontrakten, men fjernes først i en egen gameplay-migrering.
6. Flere moduler pakker inn `EventEngine.answer()`. Målet er ett prioritert handlerregister i `CivicationChoiceDirector`, ikke lastrekkefølge som implisitt kontrollflyt.
7. Dagsprogrammet beskriver 18–26 elementer og 8 500–12 000 ord per dag. Målkontrakten bruker i stedet 3–6 faktiske arbeidssituasjoner; lesetid og ordmengde er observasjoner, ikke produksjonskvoter.

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

Auditten er read-only og skriver aldri om data. Standardmodus rapporterer dagens gjeld med exit code 0. `--strict` finnes for å gjøre samme funn blokkerende, men skal ikke kobles til obligatorisk CI før planruntime er migrert.

Den semantiske reachability-testen beviser både algoritmen og dagens baseline. Når alle ni typer lastes direkte, skal baselineforventningen endres fra `observe` til `gate`; testen skal da kreve at hvert plansteg når en scene med riktig type og familie før fallback.

## Migreringsrekkefølge

1. Frys nye mailformater.
2. Behold denne read-only-auditten og Scene Contract v1 som fasit.
3. Gjør alle ni plantyper direkte nåbare.
4. La `CivicationDailyMailBuilder` bli én SceneDirector og integrer/fjern separat WorkdayMailBuilder-eierskap.
5. Flytt svarwrappere til eksplisitte `CivicationChoiceDirector`-handlere i fast rekkefølge.
6. Gjør private, life, narrative og social til kildeadaptre.
7. La runtime lese ett kompilert scene-register; fjern parallell seleksjon og gamle `jobbmails`.
8. Slå på blokkerende semantisk spilltest: plansteg -> scene -> valg/oppgave/info -> konsekvens -> progresjon -> neste steg.

Renholder og Arealplanlegger er de første bevisrollene etter at den felles planmotoren støtter alle ni typer.
