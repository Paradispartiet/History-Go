# History Go AHA-flate (lokal innsiktsmotor + eksportbro)

`History-Go/AHA` er kun History Go sin lokale innsiktsmotor og eksport-/statusflate for `aha_import_payload_v1`.
Canonical AHA-motor ligger i `Paradispartiet/AHA-EchoNet`.

Eksportgrensen er nå en eksplisitt v1-kontrakt. Den kanoniske kontrakten eies
av AHA-EchoNet; en kontrollert produsentkopi ligger i
`AHA/contracts/aha_import_payload_v1.schema.json`, og CI validerer den faktiske
payloaden fra `js/aha.js` mot kopien. Payloaden erklærer privat bruk og kan ikke
aktivere offentlig deling eller modelltrening.

## Ansvarsdeling

- **AHA-EchoNet** = canonical/personal AHA (chat, feed, notes, gallery, insta og øvrige personlige AHA-moduler).
- **History Go** = samlings- og læringsunivers (quiz, steder, personer, progresjon, Civication, kart m.m.).
- **History-Go/AHA** = lokal bro/statusflate som viser og eksporterer `aha_import_payload_v1` til AHA-EchoNet.

## Hva finnes i denne mappen nå

- `index.html`: side for **History Go innsiktsmotor** med lokal statusvisning.
- `insights.html`: read-only innsiktsvisning for `aha_insight_chamber_v1` + `aha_source_events_v1`.
- `aha-chat.css`: enkel stil for statusflaten.
- `ahaHistoryGoImport.js`: importbro på AHA-siden (dokumentert her for kompatibilitet).
- `contracts/aha_import_payload_v1.schema.json`: låst produsentkopi av den
  kanoniske AHA-EchoNet-kontrakten.
- `insightsChamber.js`, `metaInsightsEngine.js`, `ahaIngest.js`, `ahaSources.js`, `ahaFieldProfiles.js`: historiske/motorrelaterte filer som brukes i import/innsiktsflyt.

## Viktig

History-Go/AHA er ikke en full AHA-app. For canonical AHA-opplevelse, bruk:

- https://paradispartiet.github.io/AHA-EchoNet/
