# AHA Architecture (History Go avgrensing)

- `AHA-EchoNet` er canonical AHA.
- `History-Go/AHA` er kun en lokal History Go-spesifikk eksport- og statusbro.
- History Go eksporterer kun den versjonerte kontrakten
  `aha_import_payload_v1`, med `schema_version`, `contract_version` og privat
  `privacy`-policy i payloaden.
- `js/aha.js` bygger eksportpayload, håndterer sync/readback og peker til AHA-EchoNet.
- AHA-EchoNet eier validering, migrering, import, signalbygging, matching og
  innsiktsanalyse etter kontraktsgrensen.
- History-Go skal ikke inneholde `InsightsEngine`, `MetaInsightsEngine`, en
  AHA-importmotor eller en lokal kopi av AHA sitt innsiktslager.
- Full AHA-app-moduler (chat/feed/notes/gallery/insta) skal ikke ligge som lokal app i History-Go.
