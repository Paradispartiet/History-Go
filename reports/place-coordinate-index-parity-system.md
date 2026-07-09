# Place coordinate index parity system

## Prinsipp

Source-filene under `data/places/` er eneste sannhet for steders koordinater og koordinatmetadata. Runtime-indexer som `data/places/places_index.json` og category-indexer på formen `*_index.json` er genererte cacher som skal speile source, ikke overstyre den.

Koordinatfeltene som må være like per `place.id` er:

- `lat`
- `lon`
- `r`
- `coordType`
- `coordStatus`
- `coordSource`
- `coordVerifiedAt`
- `coordNote`

## Hvorfor dette trengs

SALT/Bispelokket-feilen oppsto fordi runtime-data og source-data kunne komme ut av sync: en koordinat kunne endres i source uten at index ble regenerert, eller en index kunne bli liggende med en eldre/generert verdi som appen faktisk leste ved runtime. Da så source riktig ut ved manuell inspeksjon, mens kart/runtime fortsatt brukte feil koordinat fra index-cachen.

## Ny kontroll

`tests/place-coordinate-index-parity.test.js` leser `data/places/manifest.json` som inngang til source-of-truth for hovedindexen og leser split-manifester ved siden av category-indexer for å finne split-source-filene som genererer disse indexene.

Testen sammenligner koordinatfeltene per `place.id` mellom source og index. Ved avvik skriver den en tydelig diff med:

- `id`
- felt
- source-verdi
- index-verdi
- source-fil
- index-fil

## Hvordan dette hindrer samme feil

Når en utvikler endrer koordinat eller koordinatmetadata i en source-fil uten å regenerere tilhørende index, vil `npm run places:coords:check` feile. Siden kontrollen også er koblet inn i `npm run places:index:check`, fanges avvik sammen med de øvrige index-synkroniseringskontrollene før endringen merges.

Dermed kan index-filene fortsatt brukes som raske runtime-cacher, men de får ikke lov til å bli en alternativ sannhet for koordinater.
