# Civication – funksjonsgjennomgang (2026-07-02)

Gjennomgang av hva som må gjøres for at Civication skal fungere godt og henge logisk sammen.
Basert på kjøring av **alle** 132 Civication-testfiler enkeltvis, alle `audit:civication*`-skript,
headless boot av `Civication.html` (JSDOM), typecheck, smoke:web, og kildelesing mot
`js/Civication/README.md`-kontrakten.

## Sammendrag

Civication er i god teknisk stand: 130 av 132 testfiler passerer, alle audits er grønne,
`Civication.html` booter uten konsollfeil og publiserer alle dokumenterte globaler. Men:

1. **Én reell gameplay-regresjon** (P1): strike-advarsler fortrenger planlagte mailer i
   dagsflyten — `npm run test:civication` er rød.
2. **Én inkonsistens i bundle-svarstien** (P1/P2): `answerBundleItem` løser aldri
   innbokskopien → faseavansering låser seg (debug-/inline-stien).
3. **61 av 132 testfiler kjøres ikke av noe npm-script** — én av dem er rød uten at noen ser det.
4. **~1 600 linjer død kode** i seks filer som aldri lastes.
5. Noe dokumentdrift og stor (men bevisst) innholdsgjeld i rollepakkene.

---

## P1 — Regresjon: advarselsmail fortrenger planlagt dagsflyt

**Symptom:** `tests/civication-praksisfortellinger-two-week-flow.test.js` feiler
(«avoidant-minimum»-spillestilen): runtime presenterer `arbeider_warning_<ts>` der
`personal_friend_replies_late` skulle kommet. Siden `test:civication` er en `&&`-kjede
stopper hele suiten her — ~23 senere steg kjøres aldri.

**Rotårsak (verifisert ved bisect + instrumentering):**

- Regresjonen kom inn med `1f2975e` («Fix History-Go review findings»), som endret
  `civicationEventEngine.js` fra fire-and-forget til `await this.enqueueImmediateFollowupEvent()`.
- Følgeeffekten: followup-en enqueuer nå neste planlagte mail **deterministisk** under
  `answer()`. Når spilleren deretter svarer «avoidant» på en konsekvens-tråd
  (`job_praise_more_work_minimum`) og får strike 1 → `WARNING`, enqueue-es
  advarselsmailen fra den direkte WARNING-grenen i `answer()`.
- `enqueueEvent` **prepender** (`[item].concat(inbox)`), og `getPendingEvent()` tar første
  pending — advarselen legger seg altså **foran** den planlagte mailen og bryter den
  deterministiske to-ukers-rekkefølgen.
- Før `1f2975e` fyrte den samme WARNING-grenen på nøyaktig samme sted (verifisert i
  worktree på `819666b`), men testen passerte fordi den ikke-awaitede followup-en
  «vant» toppen av køen ved mikrotask-flaks. Den gamle grønnfargen var altså
  race-avhengig; `1f2975e` gjorde rekkefølgen deterministisk og avdekket designfeilen.

**Beslutning som trengs (design):** skal en første-strike-advarsel avbryte den planlagte
scenen umiddelbart, eller legge seg bak den?

- **Anbefalt:** advarsler (og andre reaktive mailer fra `answer()`) skal **ikke fortrenge**
  en allerede planlagt/pending mail — legg dem bak i køen (append i stedet for prepend for
  `is_warning_mail`/reaktive events), eller lever dem via IncomingFlow/dagfase-kanalen.
  Dette matcher den dokumenterte kontrakten («deterministisk dag 1»,
  `js/Civication/README.md`) og testens forventning for alle tre spillestiler.
- Alternativet (testen skal tolerere avbrudd) krever i så fall at README-kontrakten og
  testene skrives om — ikke bare at testen «fikses».

Merk: å utvide followup-suppresjon til `source_type: planned|thread` er **ikke** nok
(verifisert empirisk) — advarselen kommer fra den direkte WARNING-grenen, ikke followup-en.

## P1/P2 — `answerBundleItem` løser aldri innbokskopien

**Symptom:** `tests/civication-phase-bundle.test.js` feiler («answered bundle can advance»).
Testen er foreldreløs (ikke i noe npm-script), så ingen har sett det.

**Rotårsak:** `20c2fff` («Unify Civication next action flow») innførte at åpne innbokssaker
med valg blokkerer faseavansering (`open_inbox_items` i `dayProgressionController.inspect()`).
Men `CivicationDailyMailBuilder.answerBundleItem` (= `markAnswered`) markerer bare
runtime-raden som besvart — den kaller aldri `CivicationMailEngine.markResolved` (slik
`markHandled` gjør) og kjører aldri `HG_CiviEngine.answer` (så valg-effekter går tapt).
Innbokskopien blir stående `pending` → `canAdvance` blir aldri `true` via denne stien.

I normal runtime er stien debug-only (bundlekort med `data-civi-bundle-choice` rendres kun
i `CIVICATION_DEBUG`/testmodus; NextAction eier svar), så vanlige spillere rammes ikke —
men kontrakten «svar markerer saken løst overalt» brytes, og debug-modus deadlocker.

**Anbefalt fix:** la `answerBundleItem` enten rute gjennom
`CivicationMailEngine.answerMail` (så effekter + resolved følger med), eller minimum kalle
`markResolved` slik `markHandled` gjør. Ta testen inn i `test:civication`.

## P2 — Testhygiene

- **61 av 132 Civication-testfiler er ikke referert av noe npm-script** (bl.a.
  `civication-phase-bundle`, `civication-mail-choice-uniqueness`,
  `civication-arealplanlegger-mail-plan`, `civication-daily-gameplay-loop`,
  `civication-next-action-new-day`, hele brand-/friends-/social-settene). Alle unntatt
  phase-bundle passerer i dag, men de råtner usett. Lag én runner som kjører
  `tests/civication-*.test.js` med glob (og rapporterer alle feil), i stedet for å
  vedlikeholde `&&`-kjeden for hånd.
- **`test:civication` er én lang `&&`-kjede** — stopper ved første feil og skjuler
  totalbildet. Samme runner løser dette.

## P2 — Død kode (aldri lastet av noen side, ingen dynamisk lasting)

| Fil | Linjer |
| --- | --- |
| `js/Civication/roleThreadResolver.js` | 453 |
| `js/Civication/map/loadCivicationCityMapEntries.js` (kun brukt av én test) | 501 |
| `js/Civication/ui/CivicationSectionsUI.js` | 285 |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 252 |
| `js/Civication/systems/day/dayFactionChoiceSystem.js` | 71 |
| `js/Civication/systems/day/dayFactionNpcReactions.js` | 69 |

Beslutt per fil: koble på (script-tag/lazy-load) eller slett. (`civicationRoleModelRuntime.js`
og `CivicationBrandJobUI.js` så også døde ut, men lazy-lastes fra `CivicationBoot`/
`CivicationDashboardUI` — de er OK.)

## P3 — Dokumentdrift

- `js/Civication/README.md` sier at barnehageassistent «har fortsatt governance-avvik» —
  FWG-auditen viser nå **0 avvik** på alle dimensjoner for alle tre referanseroller. Oppdater.
- `CLAUDE.md` sier Civication lastes av «Civication.html/index.html/profile.html» —
  `index.html` laster i dag **ingen** Civication-filer (profile.html laster 19). Oppdater.
- `js/Civication/pchyche.md` — skrivefeil i filnavn (skal være `psyche.md`).
- `CivicationDebateUI.js` lastes før `civicationDebateEngine.js` i `Civication.html`
  (linje 278 vs. 319). Fungerer pga. defensiv aksess, men lastrekkefølgen bør speile
  avhengigheten.

## Innholdsgjeld (bevisst strategi, men styr den)

- **Rollepakker:** 3 av 246 roller er `complete_reference_v2` (Arealplanlegger, Renholder,
  Barnehageassistent), 20 er `partial_pack`, 223 er `role_model_only`. Roller uten pakke
  faller tilbake til generiske mailer (`missing_pack`) — spillbart, men grunt. For at spillet
  skal oppleves koherent bør jobbtilbud/rollevalg enten filtreres til spillbare pakker eller
  merke dybdenivået i UI, så spilleren ikke lander i en «tom» rolle.
- **Bykart:** 318 av 869 Oslo-steder er plassert; 77 mangler asset-type
  (`reports/civication-historygo-map-audit.md`). Report-only i dag.

## Hva som er verifisert friskt

- Headless boot av `Civication.html`: alle 17 kjerne-globaler publiseres, 0 konsollfeil,
  0 manglende/dupliserte script-referanser (115 scripts).
- `npm run typecheck` og `npm run smoke:web`: grønt.
- Audits: FWG-governance (0 avvik), place-mapping, building-types, city-map-entries,
  role-packs, job-learning-profiles, job-knowledge-requirements — alle grønne.
- 130 av 132 testfiler passerer enkeltvis.

## Anbefalt rekkefølge

1. Avgjør advarsels-designet og fiks kø-fortrengningen (P1) → `test:civication` grønn.
2. Fiks `answerBundleItem`-resolusjonen og ta `civication-phase-bundle` inn i suiten.
3. Erstatt `&&`-kjeden med en glob-runner som kjører alle `tests/civication-*`-filer.
4. Rydd de seks døde filene (koble på eller slett).
5. Oppdater README/CLAUDE-drift; gi bundle-svar-stien og debattmotoren riktig lastrekkefølge.
6. Velg neste 2–3 roller som løftes til komplett pakke, og la jobbtilbuds-UI signalisere
   pakkedybde til spilleren.
