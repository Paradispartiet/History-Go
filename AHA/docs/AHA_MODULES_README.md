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


## Fase 4B: Direkte kobling til Grupper / Sirkler
- Innsikter, lister, stier og AHAavisa-utkast kan nå legges direkte i lokale grupper som referanser fra sine moduler.
- Grupper lagrer fortsatt bare referansefeltene `source`, `type`, `refId`, `title` (eventuelt meta i UI-flyt), ikke fullobjekter.
- Ingen ekte deling eller backend er bygget i denne fasen.
