# Civication playable loop audit (etter siste merges)

## 1) Kort status

**Konklusjon:** Hovedloopen er teknisk spillbar fra merit/unlocked brand til svar og konsekvens/progresjon, men deler av opplevelsen er fragmentert i UI.

- **Teknisk flyt fungerer:**
  - merit/unlocked brand kan gi ekspeditør-tilbud via brand access + employer bridge.
  - `acceptOffer` setter `active_position` inkl. brand metadata.
  - Mail runtime kan levere planlagte jobbmailer (og brand-family når `brand_id` finnes).
  - svar går via `EventEngine.answer`, og brand-konsekvenser + milestone-evaluering kobles på.
- **Hvor den stopper:** ingen hard P0-stopp i testet hovedflyt; men bruker kan oppleve “hva skjedde nå?” fordi konsekvens/milestone ikke alltid presenteres tydelig i samme UI-strøm.
- **Hva som er spillbart nå:**
  - jobbtilbud → aksept → aktiv rolle → pending mail → svarvalg → ny pending/følgeevent/milestone.
- **Hva som primært er motor uten tydelig UX:**
  - brand metric-endringer (`hg_brand_job_state_v1`) og progression-trigger (`hg_brand_job_progression_v1`) er stabile, men vises lite eksplisitt som “du fikk +X/-Y” i dedikert, vedvarende flate.

## 2) Flytkart (merit/unlocked brand → neste handling)

1. **Merit og adgang**
   - merits leses fra `merits_by_category` og brukes i offer-rebuild (testet i `rebuildJobOffersFromCurrentMerits`).
   - unlocked steder hentes fra `quiz_progress`, `hg_unlocks_v1`, `visited_places`, `merits_by_category` og mappes til brand-employers.
2. **Ekspeditør-jobbtilbud**
   - `CivicationBrandEmployerBridge` patcher `CivicationJobs.pushOffer`.
   - Ved ekspeditør-tilbud velges brand employer; uten match pushes blokkert melding (`blocked_job`) i inbox i stedet.
3. **Brand employer på offer**
   - valgt employer injiseres i offer (`brand_id`, `brand_name`, `place_id`, `employer_context`).
4. **acceptOffer**
   - `CivicationJobs.acceptOffer` (patch) oppdaterer `active_position` med brand metadata.
5. **active_position**
   - runtime bruker aktiv rolle + brand-id for plan path og family paths.
6. **CivicationMailRuntime**
   - patcher `EventEngine.onAppOpen`/`answer` og leverer plan/thread-mail fra `mailPlans`/`mailFamilies`.
   - med `brand_id` inkluderes også `mailFamilies/.../brand/<role>_<brand>.json`.
7. **Arbeidsdag/message/milestone via channels**
   - `CivicationEventChannels.classifyEvent` splitter inbox til `workday`, `message`, `milestone`, `system`.
8. **UI-visning**
   - dashboard viser “Neste fokus” fra pending event subject.
   - mini-sections markerer urgency basert på channel-split og interaksjoner.
9. **Svarvalg**
   - valg i mail går gjennom runtime/event engine (`HG_CiviEngine.answer`).
10. **EventEngine.answer**
   - runtime wrapper kaller original answer; ved `ok !== false` anvendes brand job consequences.
11. **BrandJobState consequence**
   - `applyChoiceConsequences` oppdaterer metrics per `brand_id:role_scope` for planned brand-mail.
12. **BrandJobProgression milestone**
   - progression evaluerer terskler og enqueuer `source_type: brand_progression` milestone event (dedupet).
13. **Dashboard “Neste handling”**
   - dashboard/mini UI plukker ny pending og oppdaterer “Neste fokus” / handlingstekst.

## 3) Storage-nøkler involvert i loopen

Kjernenøkler i denne flyten:

- `merits_by_category` (meritgrunnlag for tilbud)
- `quiz_progress`, `hg_unlocks_v1`, `visited_places` (brand access)
- `hg_job_offers_v1` (tilbudsliste)
- `hg_active_position_v1` (aktiv rolle + brand metadata)
- `hg_civi_state_v1` (global Civication state inkl. consumed/mail-system/runtime patch state)
- `hg_civi_mail_v1` (autoritativ mailstore)
- `hg_civi_inbox_v1` (legacy mirror fra mail engine)
- `mail_runtime_v1` (planned/thread runtime progresjon)
- `life_mail_runtime_v1` (life-runtime, separert fra job runtime)
- `hg_brand_job_state_v1` (brand metrics/historikk etter svar)
- `hg_brand_job_progression_v1` (hvilke milestones som er trigget)
- `hg_civi_selected_life_category_v1` (mini-sections visningsvalg; ikke motorisk, men påvirker hva bruker ser først)

## 4) UI-status

- **Hvor vises jobbtilbud?**
  - `#activeJobSection` / `#activeJobCard` i `CivicationUI` viser tilbud med Aksepter/Ikke nå.
- **Hvor vises arbeidsdag?**
  - `#civiWorkdaySection` / `#civiWorkdayPanel`, kategorisert via `CivicationEventChannels`.
- **Hvor vises meldinger?**
  - `#civiInboxSection` / `#civiInbox`; dashboard teller message+unknown i inbox-metric.
- **Hvor vises milepæl?**
  - milepæl-event ligger i inbox og klassifiseres som `milestone`; visning skjer via samme event/inbox-strøm (ikke egen stor milestone-skjerm i de leste filene).
- **Hvor vises konsekvens etter svar?**
  - direkte metrisk konsekvens (f.eks. `kundetillit +1`) lagres i state, men har begrenset eksplisitt visualisering i disse UI-filene; bruker får primært indirekte signal via nye events/milestones og fokus-tekst.
- **Hva mangler visuelt (uten redesign):**
  - tydelig, konsistent “svar ga konsekvens X” feedback i UI-laget.
  - klar milestone-highlight i hovedflate (ikke bare som en melding blant andre).

## 5) Teststatus

Dekning som finnes:

- `civication-ekspeditor-brand-flow.test.js` dekker merit→brand employer gating, blocked path, acceptOffer og runtime-path sanity.
- `civication-mail-loop.test.js` dekker planned mail enqueue/answer/consume, runtime state progression, no re-delivery, og separasjon mot life runtime.
- `civication-brand-job-state.test.js` dekker consequence-regler, dedupe, brand mismatch og answer-integrasjon.
- `civication-brand-job-progression.test.js` dekker terskler→milestone enqueue/dedupe og load order.
- `civication-event-channels.test.js` dekker klassifisering/splitting.
- `civication-brand-mail-runtime.test.js` dekker brand family isolasjon per `brand_id`.

**Hull:**
- Ingen ende-til-ende test som eksplisitt verifiserer “etter svar på planned brand mail blir både BrandJobState oppdatert **og** BrandJobProgression-event synlig som pending milestone i samme flyt med dashboard-relevant pending-handover”.
- I denne jobben ble ingen runtime-logikk endret; eksisterende testsett dokumenterer det meste, men dette hullet kan fylles med én ren integrasjonstest i neste test-PR.

## 6) Problemliste (prioritert)

### P0 (stopper/krasjer)
- Ingen klare P0 funnet i de leste filene + testene for denne loopen.

### P1 (fungerer, men bruker ser ikke tydelig hva som skjer)
- Brand consequence er i stor grad “usynlig motor” (lagres, men forklares svakt i UI).
- Milestone deler plass med vanlig innboksflyt uten tydelig fremheving av hvorfor den kom nå.

### P2 (tekst/UI/forståelighet)
- “Neste fokus” henter subject, men forklarer ikke alltid om det er arbeidsdag, melding eller milestone-konsekvens.
- Mini-sections gir handling, men ikke alltid kontekstkjede (hva forårsaket neste steg).

### P3 (senere innhold)
- Flere brand-spesifikke progression-regler/tekster kan bygges senere, men motorfundamentet er klart.

## 7) Anbefalt neste PR (nøyaktig første byggesteg)

**Første anbefalte PR etter audit:**
1. **Ingen motorendringer.**
2. Legg inn en **tydelig UI-feedbacklinje** når `BrandJobState.applyChoiceConsequences` har endret metrics (f.eks. “Konsekvens: kundetillit +1, stress +1”), plassert i eksisterende inbox/workday-svaroppsummering.
3. Legg inn en **minimal milestone-highlight** i eksisterende dashboard/mini-lag når pending event er `source_type=brand_progression`.
4. Legg til **én integrasjonstest** som dokumenterer akkurat denne synlige handoveren etter svar (planned brand mail → consequence persisted → milestone pending).

Dette gir størst brukerforståelse uten å endre core/dataarkitektur.
