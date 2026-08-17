# Civication rolleinnhold, maillevering og roleModels

Status: **aktiv authoring-guide**  
Sist reconcilet: **2026-08-18**

Denne filbanen beholdes fordi mange repo-lenker peker hit. Den gamle teksten beskrev MailRuntime som om den selv eide rå `mailFamilies`-lasting og jobbseleksjon. Det er ikke lenger riktig etter Scene Pipeline 4H-D.

## Kort fasit

Civication simulerer ikke CV-titler. Civication simulerer arbeid, sosial posisjon og et liv som påvirkes av valgene.

Authoringkjeden er:

```text
ROLE WORLD
  ↓ redaksjonell modell
roleModel + FWG/work grammar + mailPlan + mailFamilies
private/life/social/narrative-kilder
  ↓ build/normalisering
civication_scene_v1
  ↓
compiledSceneRegistryV1 / registrerte SceneCatalog-adapters
  ↓
SceneCatalog → SceneDirector → delivery/NextAction → ChoiceDirector
  ↓
EventEngine → state, relasjoner, psyke, økonomi, livelihood og senere scener
```

**Mail er delivery og et authored sourceformat. Mail er ikke lenger den overordnede gameplaymodellen.**

Den normative runtimekontrakten ligger i [`SCENE_PIPELINE_V1.md`](./SCENE_PIPELINE_V1.md). Den normative redaksjonelle dybdekontrakten ligger i [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md).

## Hva roleModel eier

RoleModel er rollens faglige grunnmodell, ikke en scene og ikke en egen runtime.

Den skal beskrive blant annet:

- hva arbeidet faktisk består i
- faglige og praktiske krav
- myndighet og grenser
- kjernefortelling og konflikter
- relevante personer og steder
- kompetanse- og kvalitetsakser
- forholdet til FWG, plan og authored scenekilder

En generisk Badge-generert roleModel er ikke automatisk en full rollebibel. For `role_world_complete` kreves den rikere sosiale modellen i Role World-standarden.

## Hva FWG/work grammar eier

FWG beskriver arbeidets grammatikk: oppgaver, actors, steder, praksisfortellinger, kvalitet, risiko og mulige variasjoner. Det er et authored produksjonslag som kan materialisere work-scenes.

FWG skal ikke opprette en alternativ sceneengine.

## Hva mailPlan eier

MailPlan er en dramaturgisk/progresjonsmessig sourceplan. Den kan styre rekkefølge, familiescope, fase og hva som bør komme senere.

MailPlan er **ikke** runtimekatalogen. Runtimekandidater går gjennom compiled registry og SceneCatalog.

## Hva mailFamilies eier

`data/Civication/mailFamilies/**` er authored innhold. De kan fortsatt inneholde rolleegne situasjoner, personer, choices, effects, threads og `triggers_on_choice`.

De er source-of-build. Normal jobbgameplay skal ikke lese dem som en skjult reservevei når SceneCatalog ikke finner en canonical scene.

## Private, life, social og narrative kilder

Disse lagene er separate authored kilder fordi livet ikke bare består av jobb. De registreres bak SceneCatalog-grensen og skal kunne gi scener i blant annet `private`, `life` og `social` domene.

Levevei er allerede et eget system gjennom `CivicationLivelihoods`. Role World skal derfor **bruke** livelihood opportunities og konsekvenser, ikke bygge en ny økonomi- eller leveveimotor.

## Role World: den manglende innholdskontrakten

En teknisk spillbar jobb kan eksistere uten å være en fullt utviklet sosial verden. Derfor er følgende statuser bevisst forskjellige:

- `reference_complete`: career-gameplay-auditen har bevist den eksisterende 15-komponents jobbløkken, Life Story og praksisdybde.
- `role_world_complete`: den strengere sosiale serie-/rolleverdenstandarden er oppfylt og bevist av Role World-porten.

`reference_complete` skal aldri omtales som synonymt med «fylt rolle».

Role World krever blant annet:

- et eksplisitt sosiologisk hovedproblem
- abstrakte temaakser
- et sosialt miljø og faste typer
- NPC-er med klasse/status/makt/mål/skjult side/talemåte/læringsfunksjon
- langsomme state-akser
- 14 dager × morgen/lunsj/ettermiddag/kveld som dramaturgisk dekning
- viktige relasjonelle tråder over flere beats
- privat etterklang
- senere konsekvenser
- materialisering inn i den eksisterende Scene Pipeline

Se [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md).

## Film/Story Theme Bank

[`roleWorldThemeBank.json`](./roleWorldThemeBank.json) inneholder abstrakte temaer som redaksjonelt råmateriale. Banken kan inspirere sosiologiske konflikter, men den skal aldri kopiere filmplot, figurer, konkrete scener eller dialog.

Riktig kjede er:

```text
abstrakt film-/storytema
→ menneskelig/sosiologisk konflikt
→ Role World
→ konkrete personer og sesongbuer
→ authored scenes
→ canonical Scene Pipeline
```

Tema-ID-er skal aldri brukes som scene-ID-er eller gameplay-state.

## Produksjonsrekkefølge for en dyp rolle

1. Les eksisterende career-/FWG-/roleModel-evidens. Ikke produser det som allerede finnes.
2. Definer eller revider Role World etter standarden.
3. Velg abstrakte temaer fra Theme Bank der de faktisk passer.
4. Definer sosialt miljø, NPC-bibel, langsomme akser og primære relasjonelle tråder.
5. Planlegg 14-dagers dekning med morgen/lunsj/ettermiddag/kveld.
6. Fordel beats mellom `info`, `conversation`, `relationship`, `task`, `decision`, `private_consequence`, `social` og `consequence`.
7. Materialiser gjennom eksisterende roleModel/FWG/mailPlan/mailFamilies/private/life/social/narrative-kilder.
8. Bygg compiled registry og kjør Scene Pipeline-/Role World-portene.

14 × 4 betyr **56 dramaturgiske dekningspunkter**, ikke 56 store A/B/C-valg. En god dag kan ha flere passive/relasjonelle beats og normalt bare 1–2 strategiske valg når stoffet tilsier det.

## Flerstegs korrespondanse

«5–10 meldingsutvekslinger» skal ikke tolkes som ti klikk i hver scene. En viktig relasjonell tråd skal utvikle seg over omtrent 5–10 beats/scener/meldinger, slik at tidligere handlinger får sosial hukommelse og senere etterspill.

## Legacy som ikke skal gjeninnføres

- `RoleStoryletBridge` er ikke fallback for jobbgameplay.
- `data/Civication/jobbmails` er ikke runtime reservekilde.
- gammel `buildMailPool` skal ikke ta over ved Director-feil.
- generiske career-mails skal ikke maskere null canonical kandidater.
- nye roller skal ikke få egen sceneengine eller parallell dagsmotor.

Null canonical innhold skal være synlig innholdsgjeld.

## Første reference Role World

Første Role World som skal produseres fullt etter standarden er:

```text
category: naeringsliv
role_scope: ekspeditor
```

Ekspeditør har allerede relevant career- og sceneinnhold, men dette skal behandles som råmateriale og delvis fundament — ikke som bevis på `role_world_complete` før den nye porten faktisk består.
