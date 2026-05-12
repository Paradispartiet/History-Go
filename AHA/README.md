# History Go AHA-flate (lokal innsiktsmotor + eksportbro)

`History-Go/AHA` er kun History Go sin lokale innsiktsmotor og eksport-/statusflate for `aha_import_payload_v1`.
Canonical AHA-motor ligger i `Paradispartiet/AHA-EchoNet`.

## Ansvarsdeling

- **AHA-EchoNet** = canonical/personal AHA (chat, feed, notes, gallery, insta og øvrige personlige AHA-moduler).
- **History Go** = samlings- og læringsunivers (quiz, steder, personer, progresjon, Civication, kart m.m.).
- **History-Go/AHA** = lokal bro/statusflate som viser og eksporterer `aha_import_payload_v1` til AHA-EchoNet.

## Hva finnes i denne mappen nå

- `index.html`: side for **History Go innsiktsmotor** med lokal statusvisning.
- `insights.html`: read-only innsiktsvisning for `aha_insight_chamber_v1` + `aha_source_events_v1`.
- `aha-chat.css`: enkel stil for statusflaten.
- `ahaHistoryGoImport.js`: importbro på AHA-siden (dokumentert her for kompatibilitet).
- `insightsChamber.js`, `metaInsightsEngine.js`, `ahaIngest.js`, `ahaSources.js`, `ahaFieldProfiles.js`: historiske/motorrelaterte filer som brukes i import/innsiktsflyt.

## Viktig

History-Go/AHA er ikke en full AHA-app. For canonical AHA-opplevelse, bruk:

- https://paradispartiet.github.io/AHA-EchoNet/


Innsikter, lister, stier og AHAavisa-utkast kan nå legges direkte i lokale Grupper / Sirkler som referanser.
