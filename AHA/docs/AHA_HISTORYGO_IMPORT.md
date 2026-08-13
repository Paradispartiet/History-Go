# History Go import i AHA-EchoNet

- History Go beholder lokal læringslogg, Knowledge V2 og domenehendelser og
  eksporterer dem som `aha_import_payload_v1`.
- Payloaden identifiserer seg som `schema_version: aha_import_payload_v1` og
  `contract_version: 1`. Ukjente hovedversjoner skal avvises av AHA-EchoNet.
- V1 er privat brukerimport: `public_sharing` og `model_training_allowed` er
  alltid `false` i produsert payload.
- History Go stopper ved den validerbare eksportgrensen. Payloaden inneholder
  domenehendelser og canonical Knowledge V2, ikke AHA-genererte signaler eller
  innsikter.
- AHA-EchoNet validerer og importerer payloaden med sin kanoniske
  `ahaHistoryGoImport.js` og AHA-motor.
- History-Go har ingen lokal `ahaHistoryGoImport.js`, `InsightsEngine`,
  `ahaEmneMatcher.js` eller `aha_insight_chamber_v1`-skriver.
- Importrekkefølge:
  1. `nextup_learning_signal`
  2. `hg_learning_log_v1`
  3. `hg_insights_events_v1`
  4. `hg_knowledge_entries_v2`
  5. `notes`
  6. `dialogs`
- Hvordan disse feltene blir til AHA-signaler og innsikter bestemmes og testes
  utelukkende i AHA-EchoNet.
