# AHA Architecture

- `insightsChamber.js` er canonical AHA-motor i AHA-EchoNet.
- `metaInsightsEngine.js` er metanivå for mønstre på tvers av tema.
- `ahaChat.js` kobler UI til eksisterende motor.
- `ahaIngest.js` er broen fra kilder til motoren.
- `ahaSources.js` er rå kildelogg (`aha_source_events_v1`).
- `History-Go/AHA` er **ikke** hoved-AHA-dashboard; denne mappen er en History Go-spesifikk bro/eksportflate for `aha_import_payload_v1` og lokal statusvisning.
- Notes/Galleri/Feed/Insta er ikke aktive moduler i History Go sin AHA-landingsflate, men kan eksistere som historiske/prototype-sider i repoet.
- History Go har egen lokal innsiktsmotor og eksporterer ferdig materiale til AHA-EchoNet-import.
