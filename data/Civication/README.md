# Civication

Civication er History GOs system for arbeid, livsposisjon, levevei, økonomi, psyke, relasjoner, bolig/livssituasjon, status og sosial læring.

## Ett system, fire lag

```text
SPILLERENS LIV
jobb + livsposisjon + livelihood + økonomi + psyke + relasjoner + bolig + status
        ↓ context / eligibility
ROLE WORLD
samfunn + klasse + makt + arbeid + familie + ambisjon + faste mennesker + 14-dagers dramaturgi
        ↓ authored content
SCENE PIPELINE
civication_scene_v1 → compiled registry → SceneCatalog → SceneDirector → ChoiceDirector
        ↓ consequences
LIVET FORANDRER SEG
jobb + relasjoner + psyke + livelihood + økonomi + bolig + omdømme + senere scener
```

Vi mangler ikke en ny motor for dypere roller. Den tekniske Scene Pipeline er konsolidert gjennom 4H-D. Det åpne arbeidet er redaksjonell dybdeproduksjon.

## Role World

Canonical standard: [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md).

En Role World gjør en teknisk jobbrolle til en liten sosial serie. Den eier blant annet:

- sosiologisk hovedproblem
- abstrakte temaakser
- sosialt miljø
- faste NPC-typer og relasjoner
- langsomme state-akser
- 14 dager × morgen/lunsj/ettermiddag/kveld
- utviklede relasjonelle tråder
- privat etterklang og senere konsekvenser

Role World er **redaksjonelt**. Det får ingen egen runtime og materialiseres inn i eksisterende sourceformater og Scene Pipeline.

## Film/Story Theme Bank

[`roleWorldThemeBank.json`](./roleWorldThemeBank.json) inneholder bare abstrakte temaer. Filmhistorie og dramaturgi kan inspirere konflikter som fremmedgjøring, klasse, emosjonelt arbeid, statusangst, usynlig arbeid, kropp/disiplin og ambisjon.

Det er eksplisitt forbudt å bruke banken til å kopiere handling, karakterer, dialog eller konkrete filmscener. Temaer blir heller aldri gameplay-state eller scene-ID-er.

## Completion betyr to forskjellige ting

Dagens Career Gameplay Matrix bruker blant annet `reference_complete`. Det er en teknisk/innholdsmessig career-status og beholdes for kompatibilitet.

Den betyr **ikke** at rolleverdenen er fylt.

`role_world_complete` er en separat, strengere status som bare kan gis når Role World-standarden og den permanente kontraktstesten består.

I den nye Role World-indeksen er ingen rolle markert komplett ennå.

## 14-dagersstandarden

14 dager × fire døgnbeats er dramaturgisk dekning, ikke en beslutningskvote.

```text
morgen       info / press / beskjed
tlunsj        relasjon / rykte / kropp / sosial friksjon
ettermiddag  task / conflict / decision
kveld        privat etterklang / økonomi / vennskap / refleksjon
```

En dag kan derfor ha fire meningsfulle beats uten fire store strategiske valg.

Viktige relasjonelle tråder skal utvikle seg over flere scener. «5–10 utvekslinger» betyr en tråd som lever over omtrent 5–10 beats, ikke ti klikk i hver scene.

## Runtimefasit

Se [`SCENE_PIPELINE_V1.md`](./SCENE_PIPELINE_V1.md).

```text
authored sources
→ civication_scene_v1
→ compiledSceneRegistryV1
→ SceneCatalog
→ SceneDirector
→ NextAction/delivery
→ ChoiceDirector
→ EventEngine/consequences
```

Mail er én delivery. `RoleStoryletBridge` og `jobbmails` er ikke gameplayfallbacks.

## Første Role World

Første fullstendige referanseproduksjon er:

```text
naeringsliv / ekspeditor
```

Ekspeditør har allerede gode byggesteiner — `service_mask`, arbeids/private beats, personer, praksisfortellinger og consequence flags — men er ikke `role_world_complete` før den nye 14-dagers sosiale serien faktisk er materialisert og auditert.

Deretter kan samme mønster brukes på blant annet Renholder, Controller, By-rådgiver og Sport-utøver.
