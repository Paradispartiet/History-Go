# Civication — motorer og dagens spillvei

Status: **aktiv runtimeoversikt**  
Sist reconcilet: **2026-08-18**

Civication er et samfunns-/livssimulatorsubsystem i History Go. Denne filen beskriver dagens runtimeeierskap. Redaksjonell Role World-standard ligger i [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md).

## 1. Produktlag og daglag

Civication-skallet eier produktflaten: kart, dashboard, kapital, psyke, identitet, folk, rollepaneler og navigasjon. Dag-/Life Story-lagene leverer dagens scener og konsekvenser inn i dette skallet.

Min dag / Life Story er et viktig fortellingspanel, men er ikke hele Civication. Nye fortellinger bygges som data og registrerte scenekilder, ikke som nye motorer.

## 2. Én aktiv handling

Aktive svarvalg skal ha én eier i brukerflyten. Passive flater som fasekort, inbox og dashboard kan vise kontekst, men skal ikke opprette parallelle svartransaksjoner.

Den semantiske svargrensen er `CivicationChoiceDirector`.

## 3. Canonical Scene Pipeline

Etter fullført 4H-D er kjeden:

```text
authored sources
roleModel / FWG / mailPlan / mailFamilies
private / life / social / narrative
        ↓
normalisering + build/adapters
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
EventEngine / consequence middleware
        ↓
state + progresjon + senere scener
```

`scene` er gameplay-enheten. Mail er én delivery.

## 4. SceneCatalog

`CivicationSceneCatalog` er den canonicale kataloggrensen.

For work-scenes leser normal runtime `compiled_scene_registry_v1`. Rå `mailFamilies` er authored source-of-build, ikke en parallel reservekatalog.

Private/life/social/narrative-kilder går gjennom registrerte source adapters bak samme kataloggrense.

## 5. SceneDirector

`CivicationSceneDirector` eier kandidatseleksjon for canonicale gameplayscener. Daily, Workday og EventEngine skal ikke ha konkurrerende rolle-/mailseleksjon som kan omgå Catalog.

Null canonical kandidat er et gyldig no-op og skal synliggjøre innholdsgjeld.

## 6. Delivery og UI

En scene kan leveres som blant annet:

- `mail`
- `conversation`
- `meeting`
- `task`
- `notification`

MailEngine eier inbox/envelope-lagring når delivery faktisk er mail. Den eier ikke den overordnede gameplaymodellen.

NextAction er den aktive handlingsflaten og skal presentere den scene/interaksjon som Director/daglaget har valgt.

## 7. ChoiceDirector og EventEngine

`CivicationChoiceDirector` er den eneste canonicale svargrensen for gameplayscener.

Et svar kan via EventEngine/middleware påvirke eksisterende state som:

- jobb-/planprogresjon
- relasjoner
- kapital/økonomi
- psyke
- task completion
- flags / `next_bias`
- livelihood opportunities
- senere scener

4H-Ds permanente test `tests/civication-semantic-playthrough-gate.test.js` beviser den grunnleggende kjeden fra compiled scene via svar og konsekvens til videre progresjon.

## 8. Interaksjonsmoduser

- `decision`: minst to reelle valg.
- `task`: eksplisitt task contract.
- `ack`: enkel bekreftelse/respons når det faktisk er semantikken.
- `info`: ingen valg påkrevd.

Runtime skal ikke generere standardvalg for å maskere manglende authored innhold.

## 9. Legacy som er lukket

Følgende kan ikke overta jobbgameplay når canonicale kandidater mangler:

- `data/Civication/jobbmails`
- legacy packs
- `RoleStoryletBridge`
- gammel `buildMailPool`-fallback
- generisk career-mail

Director-feil skal fail-closed med tom gameplaypool.

Legacy-/arkivdata kan ligge i repoet for migrering og historikk uten å være runtime-eier.

## 10. Rolledata og Role World

Teknisk career-gameplay og redaksjonell Role World-completion er to forskjellige lag.

- `reference_complete` i Career Gameplay Matrix beviser den eksisterende jobbloopen.
- `role_world_complete` krever den strengere Role World-standarden.

Role World oppretter ingen runtime. Den beskriver sosiologisk kjerne, NPC-er, langsomme akser, 14-dagers dramaturgi, relasjonelle tråder og privat etterklang, og materialiseres gjennom de eksisterende authored sourceformatene ovenfor.

## 11. Levevei

`CivicationLivelihoods` og opportunity-kjeden er et eksisterende livs-/inntektslag. Scener kan påvirke eller åpne livelihood opportunities gjennom eksisterende consequence-systemer. Det skal ikke bygges en ny leveveimotor inne i Role World.

## 12. Første reference Role World

Neste innholdsproduksjon er `naeringsliv/ekspeditor`.

Ekspeditør har allerede tekniske og redaksjonelle byggesteiner. Arbeidet er å reconcile dem til en 14-dagers sosial serie, ikke å bygge ny Scene Pipeline.

## Helhetlig livsverden og History Go-samling (21.10.2026)

«Min dag» er ikke bare arbeidsdagen. **Arbeidsledig er jobbstatus**, og private Life Stories må kunne fortsette etter dag 7 og gjennom dag 14 uten at spilleren tvinges til å skaffe seg et Badge, en livsposisjon eller en jobb. Valgfrie ekstra kapitler kan fortsatt ha dokumenterte livsposisjonsgater.

History Go-signaler går via eksisterende `systems/civicationProfileSignalBridge.js`, `systems/day/dayKnowledge.js`, `systems/civicationHistoryGoTaskBridge.js` og eksisterende oppdragstoast/retur. Samling/observasjoner, kunnskap, fagmeritter, personer og besøk er forskjellige akser; brukerens handlinger kan åpne konkrete dialoger, privatlivshistorier, miljøer og selvvalgte posisjoner, men ikke automatisk jobb, vennskap eller generelle ferdighetspoeng.

Skille mellom dagens **psyke/energi**, **sju kapitalakser**, **relasjoner/miljøomdømme**, **History Go-meritter** og seks **Skills-skalaer**: visdom/dømmekraft, sosial teft, kreativitet, praktisk mestring, formidling og handlekraft (foreslått 0–100). `streetkred` er anseelse hos bestemte aktører/miljøer, ikke én ny global poengsum. `CivicationSkills` gir en additiv, kildeavgrenset `skills_v1`-slice i eksisterende CivicationState, uten egen localStorage-nøkkel. Full authored progresjon og balanse gjenstår. Les [`../../docs/CIVICATION_README.md`](../../docs/CIVICATION_README.md), [`../../docs/CIVICATION_DATA_LAYERS.md`](../../docs/CIVICATION_DATA_LAYERS.md) og [`../../docs/CIVICATION_INTEGRATED_LIFE_ROADMAP_2026_10_20.md`](../../docs/CIVICATION_INTEGRATED_LIFE_ROADMAP_2026_10_20.md).

## 13. Dokumenteierskap

- Runtime: [`../../data/Civication/SCENE_PIPELINE_V1.md`](../../data/Civication/SCENE_PIPELINE_V1.md)
- Maskinpolicy: [`../../data/Civication/scenePipelinePolicyV1.json`](../../data/Civication/scenePipelinePolicyV1.json)
- Role World: [`../../docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md)
- Career completion: [`../../docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](../../docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md)
- Role authoring: [`../../data/Civication/README-mailsystem-og-rolemodels.md`](../../data/Civication/README-mailsystem-og-rolemodels.md)

Detaljert 4A–4H-D-migreringshistorikk ligger i Git/PR-historikken, ikke i denne aktive runtimefasiten.
