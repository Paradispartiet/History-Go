# Nedre Foss – stale research cleanup

Dato: 2026-07-20

## Bakgrunn

PR #2529 ble lukket som superseded etter at den kanoniske Nedre Foss-batchen ble merget gjennom PR #2530. Etter merge stod to eldre research-flagg igjen i place-dataene og hevdet fortsatt at møllekronologi og bygningshistorie manglet kildekontroll, selv om #2530 allerede hadde lagt inn kildebelagt kronologi og bygningsdata.

## Endringer

- Fjerner de foreldede research-flaggene for møllekronologi og bygningshistorie.
- Oppdaterer `source_summary` med de faktiske kildegrunnlagene og markerer den løste forskningen eksplisitt.
- Beholder reelle forbehold om tidssensitive virksomheter og presis geologi.
- Retter leksikonets mini-panel fra gamle `fact_01` / `fact_02` / `story_01` til de kanoniske ID-ene som ble innført i #2530.
- Endrer ingen koordinater, place-ID-er eller andre Akerselva-steder.

## Validering

Den målrettede cleanup-auditen bekrefter at de foreldede flaggene er borte, at de nye mini-panel-ID-ene finnes, at begge endrede JSON-filer parser, og at `git diff --check` er ren.
