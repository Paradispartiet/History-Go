# History Go import i AHA-EchoNet

- History Go har egen lokal lærings-/innsiktsmotor og eksporterer `aha_import_payload_v1`.
- Payloaden identifiserer seg som `schema_version: aha_import_payload_v1` og
  `contract_version: 1`. Ukjente hovedversjoner skal avvises av AHA-EchoNet.
- V1 er privat brukerimport: `public_sharing` og `model_training_allowed` er
  alltid `false` i produsert payload.
- AHA-EchoNet importerer dette som ferdig tolket materiale via `ahaHistoryGoImport.js`.
- Importen bruker eksisterende AHA-motor (`InsightsEngine`) og lagrer i `aha_insight_chamber_v1`.
- Importflyten bruker **ikke** `ahaEmneMatcher.js`.
- Importrekkefølge:
  1. `nextup_learning_signal`
  2. `hg_learning_log_v1`
  3. `hg_insights_events_v1`
  4. `knowledge_universe`
  5. `notes`
  6. `dialogs`
- Metadata fra History Go videreføres på signalene med `imported: true`, `source_app: "historygo"` og passende `source_type`.
