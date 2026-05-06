# AHA Architecture

- `insightsChamber.js` er canonical AHA-motor i AHA-EchoNet.
- `metaInsightsEngine.js` er metanivå for mønstre på tvers av tema.
- `ahaChat.js` kobler UI til eksisterende motor.
- `ahaIngest.js` er broen fra kilder (Notes, Galleri, Feed, Insta, import) til motoren.
- `ahaSources.js` er rå kildelogg (`aha_source_events_v1`).
- Notes, Galleri, Feed og Insta skal kun ingestes via `AHAIngest`, ingen egne motorer.
- History Go er valgfri kilde. AHA fungerer uten History Go.
