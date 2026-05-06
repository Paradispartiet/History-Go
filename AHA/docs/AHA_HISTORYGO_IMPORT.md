# History Go import i AHA-EchoNet

- History Go har egen lokal lærings-/innsiktsmotor og eksporterer `aha_import_payload_v1`.
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
