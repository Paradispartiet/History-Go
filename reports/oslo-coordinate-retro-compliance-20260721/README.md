# Retrospektiv Oslo coordinate compliance-audit - batch 1-120

Generert: 2026-07-21T08:17:54.067Z

## Konklusjon

- Dokumenterte Oslo verified-rader kontrollert: **295**
- Unike placeId-er: **295**
- Contract v1 PASS: **295**
- Contract v1 FAIL: **0**
- Manglende current canonical records: **0**
- Protokollmismatch etter synk: **0**
- Lagrede entydige Geonorge-kandidater som fortsatt er overstyrt: **0**
- Regionale batcher feilaktig fanget av Oslo-auditen: **0**
- Åpne blokkerende funn: **0**

## Korrigeringer

- **Tronsmo Bokhandel:** gjenopprettet til den lagrede entydige Geonorge-adressekilden for Universitetsgata 12.
- **Oslo domkirke:** Stortorvet 1 er skilt fra Stortorvet 1B og brukes nå som official-address canonical: `geonorge-adresser-v1:0301:17083:1` (59.91266533589023, 10.746431229351575). Karl Johans gate 11 forblir forkastet som Kirkeristen.
- **Korketrekkeren:** samme rutegeometri og startpunkt beholdt; ugyldige enum-verdier normalisert til `route`, `semantic_anchor`, `line_anchor`.
- **Vaterland - historisk elveløp:** samme Vaterlands bru-anker og historiske kilde beholdt; `coordRole` normalisert til `line_anchor`.
- **Folkeobservatoriet / Slurpen:** stale protokoll-ID-er migrert til `folkeobservatoriet_holmenkollen` og `slurpen_lakkegata`.

## Åpne blokkerende funn

_Ingen._

## Dekningsgrunnlag

- **Batch 1-5:** ny sammenligning mot lagrede address-first-resultater og dagens canonical data.
- **Batch 6-35:** eksisterende full retrokontroll med tre korrigeringspass gjenbrukt, deretter dagens Contract v1 validert.
- **Batch 36-120:** dagens canonical verified-rader validert mot Contract v1 og dokumenterte source-closure-/objekttypebeslutninger.

Maskinrapport: `reports/oslo-coordinate-retro-compliance-20260721/audit.json`.
