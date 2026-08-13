# AHA Architecture (History Go avgrensing)

- `AHA-EchoNet` er canonical AHA.
- `History-Go/AHA` er kun lokal History Go-spesifikk innsikts-/eksportbro.
- History Go eksporterer kun den versjonerte kontrakten
  `aha_import_payload_v1`, med `schema_version`, `contract_version` og privat
  `privacy`-policy i payloaden.
- `js/aha.js` bygger eksportpayload, håndterer sync/readback og peker til AHA-EchoNet.
- `AHA/ahaHistoryGoImport.js` beskriver/importerer History Go payload inn i AHA-systemet.
- Full AHA-app-moduler (chat/feed/notes/gallery/insta) skal ikke ligge som lokal app i History-Go.
