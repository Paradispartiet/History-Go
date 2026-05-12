# AHA modules: insights.html (read-only)

`insights.html` er en read-only visningsmodul.

## Leser disse localStorage-nøklene
- `aha_insight_chamber_v1`
- `aha_source_events_v1`

## Kildekobling
- Innsikter leser `source_event_ids` (primær), `source_event_id`, samt eldre fallback-felt i UI-laget.
- `Med kilde` viser kun innsikter der minst én faktisk `source_event_id` finnes i `aha_source_events_v1`.
- I motorlaget viderefører `createInsightFromSignal` og `reinforceInsight` `signal.source_event_id` til `insight.source_event_ids` med dedupe.

## Sikker rendering
All storage-avledet tekst som gjengis via `innerHTML` escapes med `escapeHtml`.
Dette gjelder tittel, summary, topic, concepts, source-felter og JSON-preview i meta/forslag.


## Fase 3 – History Go status/importmodul
- `historygo.html` er AHA sin History Go-status/importmodul.
- Modulen viser `aha_import_payload_v1`, History Go localStorage-status og importerte AHA source events.
- Import skjer bare manuelt ved knappetrykk.
- Modulen bygger ikke History Go inn i AHA og lager ikke ny motor.
