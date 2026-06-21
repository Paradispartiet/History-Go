# Debate → Civication flow audit etter PR #1406

Dato: 2026-06-21 UTC  
Scope: post-#1406 preflight/audit av debattinnhold, Civication-konfliktkoblinger, spillerens standpunktlogg, per-axis leaning, `Dine debatt-tendenser` og Civication History Go-broen.

Dette er en rapport-only preflight. Ingen runtime, data, HTML/CSS, service worker, TypeScript-oppsett, koordinatkandidatpipeline, candidate/network builders eller Civication mail-/rolemodel-data er endret.

## 1. TypeScript/build-status

| Kontroll | Kommando | Resultat |
| --- | --- | --- |
| Root typecheck | `npm run typecheck` | Grønn |
| Scripts typecheck | `npm run typecheck:scripts` | Grønn |
| Scripts build | `npm run build:scripts` | Grønn |
| Tools typecheck | `npm run typecheck:tools` | Grønn |
| Tools build | `npm run build:tools` | Grønn |
| Debate content | `npm run test:debates-content` | Grønn: 20 debatter over 8 manifestfiler, 20 konfliktkoblet |
| Debate leaning/overview | `npm run test:history-go-debate-leaning` | Grønn |
| Debate surface/reopen | `npm run test:history-go-debate-surface` | Grønn |
| Debate signal | `npm run test:history-go-debate-signal` | Grønn |
| Civication debate bridge | `npm run test:history-go-task-bridge` | Grønn |
| Whitespace/patch check | `git diff --check` | Grønn etter rapportfilen |

Baseline-statusen er fortsatt null diagnostikk: `reports/typecheck-baseline-report.md` sier `Typecheck exit code: 0`, `Total diagnostic lines found: 0` og `Files with diagnostics: 0`. TypeScript-migreringsstatusen etter PR #1373 beskriver også root/scripts/tools-løypene som grønne og oppgir baseline diagnostics = 0. Denne auditten regenererte ikke baselinefilen fordi preflighten ikke fant nye TypeScript-diagnostikk.

## 2. Debate content coverage

### Omfang

Manifestet `data/debates/manifest.json` peker til 8 debattfiler:

- `data/debates/debates_by.json`
- `data/debates/debates_historie.json`
- `data/debates/debates_kunst.json`
- `data/debates/debates_musikk.json`
- `data/debates/debates_natur.json`
- `data/debates/debates_politikk.json`
- `data/debates/debates_sport.json`
- `data/debates/debates_vitenskap.json`

Faktisk innhold per 2026-06-21:

- 20 debatter totalt.
- 8 domener/kategorier: `by`, `historie`, `kunst`, `musikk`, `natur`, `politikk`, `sport`, `vitenskap`.
- Alle 20 debatter har `conflict_id`.
- Alle 20 `conflict_id`-verdier validerer mot ekte Civication conflict axes fra `data/Civication/conflicts/*.json` (`primary`/`secondary`).
- Alle debatter har gyldige `positions` med unike position-id-er, label og `pole`.
- Hver `pole` er enten en side av debattens `conflict_id` (`*_vs_*`) eller `midt`.

Merk: Dokumentasjonen i `docs/CIVICATION_HISTORY_GO_DEBATE_SURFACE.md` sier fortsatt i én seksjon at “Alle 14 debattene” er koblet til en akse, men samme dokument beskriver også dagens 20 debatter over 8 domener. Dette er dokumentasjonsstøy, ikke runtime-mismatch. Jeg endret det ikke i denne rapport-only PR-en.

### Brukte conflict axes

| `conflict_id` | Antall debatter | Debate IDs |
| --- | ---: | --- |
| `bevaring_vs_utvikling` | 5 | `fredrikshalds_teater_vern`, `blaa_kulturscene`, `groruddammen_bruk`, `regjeringskvartalet_vern`, `bislett_modernisering` |
| `bilprioritering_vs_myke_trafikanter` | 3 | `radhusplassen_bilfri`, `torggata_sykkelgate`, `ring3_kollektiv` |
| `ideal_vs_budsjett` | 2 | `munch_offentlig_kunst`, `holmenkollen_kostnad` |
| `demokrati_vs_effektiv_styring` | 1 | `stortinget_folkeavstemning` |
| `faglig_integritet_vs_politisk_press` | 1 | `blindern_akademisk_frihet` |
| `fortetting_vs_livskvalitet` | 1 | `bjorvika_hoyhus` |
| `funksjonsdeling_vs_blandet_by` | 1 | `youngstorget_protest` |
| `historie_vs_fremtid` | 1 | `isegran_fort_formidling` |
| `ideal_vs_gjennomforbarhet` | 1 | `observatoriet_grunnforskning` |
| `langsiktig_by_vs_kortsiktig_gevinst` | 1 | `karl_johan_handel_vs_byrom` |
| `samfunnsrolle_vs_eiermakt` | 1 | `ekebergparken_privat_natur` |
| `tett_by_vs_gronnstruktur` | 1 | `alna_gjenapning` |
| `visjon_vs_kontantstrom` | 1 | `rockefeller_profil` |

## 3. Player position persistence

Debattsignalet eies av `js/hgDebates.js` og persisteres i localStorage-nøkkelen `hg_debate_log_v1`.

- `HGDebates.record({ debateId, conflictId, position })` nøkler primært på `debateId`, eller på `conflictId` når `debateId` mangler.
- Ved åpning av en debatt kaller `HGDebatesContent.open(id)` `HGDebates.record({ debateId, conflictId })`. Det markerer deltakelse, men setter ikke standpunkt.
- Ved position-click kaller klikkhandleren `HGDebates.record({ debateId, position })`.
- `record()` er idempotent for samme position: `positions[]` får ikke duplikater, mens `position` oppdateres til siste valgte standpunkt.
- Ved reopen henter `open()` først `HGDebates.getById(debateId)` og faller tilbake til `HGDebates.getById(conflict_id)` hvis nødvendig. Den tidligere valgte positionen sendes inn i `debateHtml()`, som setter `is-chosen`, `aria-pressed="true"` og teksten `Du valgte: …`.
- Reopen registrerer bare deltakelse på nytt. Siden `record()` bare skriver når raden endres, dobbelttelles ikke gammel position i `positions[]`, og reopen i seg selv lager ikke nytt standpunktsignal.
- Stabil ID-kontrakt: UI-knapper bruker `data-debate-id="<debate.id>"`; Civication-broen matcher `debate_id`, `conflict_id` eller `target_id` mot samme persisted logg.

## 4. Per-axis leaning

`HGDebatesContent.leaning(conflictId)` gjør følgende:

1. Normaliserer `conflictId` og splitter aksen på `_vs_` til `poleA` og `poleB`.
2. Starter counts for `poleA`, `poleB` og `midt`.
3. Itererer alle innlastede debatter og tar bare dem med samme `conflict_id`.
4. Leser spillerens lagrede `row.position` fra `HGDebates.getById(debateId)`.
5. Mapper valgt position-id til debattens `positions[].pole`.
6. Teller bare pole-verdier som finnes i counts (`poleA`, `poleB`, `midt`).
7. Setter `lean` til dominant side når `poleA` eller `poleB` leder; setter `lean = "midt"` ved likhet mellom sidepolene; setter `lean = null` når total = 0.

`midt` telles i total og vises som `Midt imellom`, men avgjør ikke dominant side med mindre sidepolene står likt. Det betyr at én `midt` og to valg på `utvikling` gir dominant `utvikling`; sidepol-likhet gir `midt`.

`leaningAll()`:

- Samler alle unike `conflict_id` fra innlastede debatter.
- Kaller `leaning(conflictId)` for hver akse.
- Filtrerer bort akser med `total < 1`, slik at bare engaged axes vises.
- Sorterer synkende på `total` (engagement). Sorteringen har ingen sekundær nøkkel; for lik total bevares normal JS stable sort-order i moderne runtime, basert på rekkefølgen aksene ble sett i debattdataene.

## 5. Overview popup

`openOverview()` er en tynn wrapper rundt eksisterende popup-system:

- Kaller `ensureStyles()`.
- Bruker `window.makePopup` eller global `makePopup` når tilgjengelig.
- Returnerer `false` og viser toasten `Popup-systemet er ikke lastet` hvis popup-systemet mangler.
- Sender `overviewHtml()` til `makePopup(..., "hg-debate-popup")` når popup finnes.

`overviewHtml()`:

- Tittelen er `Dine debatt-tendenser`.
- Lister bare rows fra `leaningAll()`.
- Viser empty state når spilleren ikke har tatt standpunkt: `Du har ikke tatt standpunkt i noen debatter ennå.`
- Escaper conflict labels via `esc(conflictLabel(...))` og lean-tekst via `esc(lean)`, der `lean` kommer fra `poleLabel()` eller `Midt imellom`.

Klikkflyten er separert:

- `onClick()` sjekker først `[data-debate-overview]`; da åpnes overview og handleren returnerer.
- Position-click håndteres etterpå via `[data-debate-position]`.
- Dermed bryter ikke `Se alle dine tendenser` vanlig standpunktvalg, og standpunktknapper trigges ikke av overview-knappen.

## 6. Civication bridge

Civication-broen bruker localStorage-kontrakten, ikke browser-globaler fra History Go-vinduet.

- `readHistoryGoState()` leser `hg_debate_log_v1.byId` og `hg_debate_log_v1.byConflict`.
- For `target_type === "debate"` bygger `evaluate()` kandidatlisten `[debate_id, conflict_id, target_id]`.
- For hver kandidat forsøker den direkte treff i `state.debateById[id]` og deretter konfliktindeks via `state.debateByConflict[id] -> state.debateById[key]`.
- `completion_mode === "position_chosen"` krever `row.position`.
- `debate_participated` og andre debate-modes krever `row.participated`.
- `reconcile()` ignorerer tasks som allerede har `history_go.completed_at`, så reopen eller storage/updateProfile-events trigget av gamle signaler skal ikke lage nye consequences for samme task.
- Conflict-tilhørighet dupliseres ikke i debattdataene: debatten lagrer ett `conflict_id`; `byConflict` er bare en sekundærindeks i spillerloggen for task matching.
- Aksen Civication bruker er samme string som History Go-debatten bruker (`conflict_id`), og content-testen validerer dette mot Civication conflict registry.
- Broen krever ikke en separat debattstatus utover persisted `participated` og eventuelt `position`.

## 7. Testdekning

Eksisterende relevante tester:

- `tests/debates-content.test.js`
  - Dekker manifestfiler, unik debatt-id, canonical category, `place_id` i places index, `conflict_id` i Civication conflict registry, gyldige positions og gyldige poles.
- `tests/civication-history-go-debate-surface.test.js`
  - Dekker loader, `getById`, `getByPlace`, unknown debate, participation-record ved open, conflict chip/label, position-click og reopen med tidligere standpunkt.
- `tests/civication-history-go-debate-leaning.test.js`
  - Dekker `leaning()`, dominant pole, `midt`, uavhengige akser, `poleLabel()`, `leaningAll()` med engaged-only axes og `overviewHtml()` for tittel/akse/lean.
- `tests/civication-history-go-debate-signal.test.js`
  - Dekker localStorage-signal, idempotent positions-array, conflict-keyed row og `byConflict`-indeks.
- `tests/civication-history-go-task-bridge.test.js`
  - Dekker Civication History Go-broens matching og completion av relevante task-kilder, inkludert debate-flow.

Anbefalte neste tester, ikke lagt til her fordi auditten var grønn:

1. `openOverview()` fallback-test som eksplisitt verifiserer `false` + toast når `makePopup` mangler.
2. XSS/escaping-test for `overviewHtml()` med syntetisk conflict/position labels dersom test-fixturen kan gjøre dette uten å endre produksjonsdata.
3. Stabil tie-sort-test for `leaningAll()` når to akser har lik engagement, hvis UI-en senere skal love deterministisk sekundærsortering på label/id.
4. Bridge-regresjonstest som simulerer reopen etter already-completed task og verifiserer at `markHistoryGoComplete` ikke kalles på nytt.

## 8. Konklusjon

Post-#1406-flyten henger sammen:

- TypeScript root/scripts/tools er grønn.
- Debate content har 20 debatter over 8 domener, alle koblet til ekte Civication conflict axes.
- Player position persistence bruker stabil `debateId`, gjenbruker tidligere standpunkt ved reopen og dobbeltteller ikke gammel position.
- `leaning()` og `leaningAll()` leser samme persisted standpunkter som Civication-broen bruker og presenterer bare aksene spilleren faktisk har engasjert seg i.
- `Dine debatt-tendenser` bruker eksisterende popup-kontrakt og har empty state/fallback.
- Civication-broen kan fullføre både debate-id- og conflict-id-rettede debate tasks via `byId` og `byConflict`, uten krav om ekstra runtime-status.

Ingen konkrete feil ble funnet som krevde runtime- eller dataendring.
