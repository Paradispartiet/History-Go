# Civication Scene Pipeline v1

Status: **canonical runtimekontrakt — 4H-D fullført**  
Sist reconcilet: **2026-08-18**

## Dagens fasit

`scene` er gameplay-enheten. `mail` er bare én leveringsform.

Den aktive kjeden er:

```text
authored sources
roleModel / FWG / mailPlan / mailFamilies
private / life / social / narrative / fagverk
        ↓
normalisering + build
        ↓
civication_scene_v1
        ↓
compiledSceneRegistryV1
        ↓
CivicationSceneCatalog
        ↓
CivicationSceneDirector
        ↓
NextAction / delivery
        ↓
CivicationChoiceDirector
        ↓
EventEngine / middleware
        ↓
state + konsekvenser + progresjon
```

Normal jobbgameplay leser **ikke** rå `mailFamilies` som en parallell gameplaykilde. `mailFamilies` er fortsatt et gyldig authored source-of-build-format, men `compiled_scene_registry_v1` er runtimekatalogen for work-scenes.

## Scene Contract

Canonical schema: [`sceneContractV1.schema.json`](./sceneContractV1.schema.json).

En scene skiller mellom:

- `domain`: `work`, `private`, `life`, `social`, `system`
- `scene_kind`: blant annet `task`, `relationship`, `conflict`, `knowledge`, `consequence`, `offer`, `milestone`
- `delivery`: blant annet `mail`, `conversation`, `meeting`, `task`, `notification`
- `day_phase` og dramaturgisk stadium
- `interaction_mode`: `decision`, `task`, `ack`, `info`
- tråd, praksisfortelling, personer og sted
- normaliserte effekter
- versjonert `knowledge_contract`

`decision` krever reelle valg. `task` krever en eksplisitt oppgavekontrakt. `info` kan ha null valg. Runtime skal aldri dikte standardvalg for å skjule manglende innhold.

## Eierskap

### SceneCatalog

`CivicationSceneCatalog` er den canonicale kataloggrensen. Den leser compiled registry for work-scenes og registrerte adapters for private/life/social/narrative-kilder.

### SceneDirector

`CivicationSceneDirector` eier kandidatvalg. Daily, Workday og EventEngine skal ikke ha konkurrerende seleksjonslogikk som kan gjenåpne gamle kilder.

### ChoiceDirector

`CivicationChoiceDirector` er den canonicale svargrensen. Valg går gjennom én transaksjonsvei før konsekvenser og progresjon oppdateres.

### Delivery

MailEngine, samtalevisning, møte, task og notification er presentasjon/levering av en scene. De eier ikke den semantiske gameplaymodellen.

## 4H-D er lukket

PR #5053 fullførte den semantiske end-to-end-porten. Den permanente testen [`tests/civication-semantic-playthrough-gate.test.js`](../../tests/civication-semantic-playthrough-gate.test.js) beviser den grunnleggende kjeden:

```text
compiled scene
→ SceneCatalog/SceneDirector
→ EventEngine delivery
→ ChoiceDirector answer
→ consequence/state
→ plan progression
→ neste scene
```

`data/Civication/scenePipelinePolicyV1.json` skal derfor aldri igjen rapportere `4H-C → 4H-D` som nåstatus.

## Fail-closed er permanent

4H-C stengte gamle gameplayreserver. Følgende kan ikke overta når canonical sceneinnhold mangler:

- `data/Civication/jobbmails`
- legacy packs
- generisk karrieremail
- `RoleStoryletBridge`
- den tidligere `buildMailPool`-fallbacken

Null canonical kandidat betyr no-op. Director-feil betyr fail-closed tom gameplaypool. Manglende authored innhold skal synliggjøres som innholdsgjeld, ikke maskeres med en svakere motorvei.

## Role World ligger over pipeline, ikke ved siden av den

Den neste Civication-kvalitetsfasen er redaksjonell. [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md) definerer hvordan en jobb/livsposisjon blir en levende sosial verden.

Role World kan definere:

- sosiologisk hovedproblem
- temaakser
- sosialt miljø
- faste NPC-typer
- langsomme state-akser
- 14-dagers dramaturgisk dekning
- relasjonelle tråder
- private ettervirkninger
- senere konsekvenser

Men Role World får **ingen ny runtime** og **ingen ny sceneformatfamilie**. Den materialiseres gjennom eksisterende authored sources og ender alltid som `civication_scene_v1` i den samme Scene Pipeline.

## Formatfrys

Nye mailformater er frosset. Et nytt authored kildeformat kan bare innføres hvis det registreres som adapter og kan normaliseres til `civication_scene_v1` uten å skape et parallelt gameplayformat.

Film-/story-temaer er redaksjonelt råmateriale. De skal aldri bli runtime-state, scene-ID-er eller en alternativ sceneontologi.

## Historisk migreringsdetalj

Fasene 4A–4H-D er fullført. Tidligere aktive beskrivelser av hvert mellomsteg er fjernet fra denne fasitfilen fordi de blandet migreringshistorie med nåarkitektur. PR- og Git-historikken bevarer detaljene.

Aktiv nåstatus er enkel:

```text
Scene Pipeline teknisk konsolidert
+ 4H-D semantisk gate grønn
+ legacy fallback lukket
→ neste arbeid: Role World-standard og dybdeproduksjon
```
