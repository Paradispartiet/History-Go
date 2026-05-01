# Place duplicate cleanup – batch 4 (`damstredet_telthusbakken`, `ullevål_hageby`)

Dato: 2026-05-01

## Ryddede IDs
- `damstredet_telthusbakken`
- `ullevål_hageby`

## Masterfil per sted
- `damstredet_telthusbakken`: master i `data/places/places_historie.json`.
- `ullevål_hageby`: master i `data/places/places_by.json`.

## Sekundærentries fjernet
- `ullevål_hageby` fjernet fra `data/places/oslo_places.json` (duplikat med litteraturvinkel i kategori `litteratur`).
- Ingen sekundær top-level entry med `id: "damstredet_telthusbakken"` ble funnet i `places_by.json` eller `places_litteratur.json` i denne batchen; historiefilen sto allerede som eneste top-level place-entry.

## Bevarte perspektiver
### `damstredet_telthusbakken`
- Historisk trehusmiljø, bevaringscase og bystruktur er bevart i historie-master.
- Byperspektiv (småskala gateforløp, materialitet, bevaring, kontrast mot moderne byutvikling) er bevart i `popupDesc` og `quiz_profile`-felt.

### `ullevål_hageby`
- By-master med `category: "by"` beholdt.
- Litteraturperspektiv er bevart i mastertekst og quiz-vinkel (kobling til Sigrid Undset, kulturhistorisk boligmiljø, sted/person-kobling).

## Fletting av `emne_ids`
- Ingen nye `emne_ids` måtte flettes i denne batchen; relevante vinkler var allerede dekket i masterentries.

## Fletting av `quiz_profile`
- Ingen eksplisitt feltfletting nødvendig i denne batchen; relevante by- og litteraturvinkler var allerede representert i master for `ullevål_hageby`.
- For `damstredet_telthusbakken` var ønskede by-/bevaringsvinkler allerede representert i historie-masterens `quiz_profile`.

## Duplicate IDs som fortsatt gjenstår
Semantiske duplikater etter denne batchen:
- `deichman_bjorvika`
- `var_frelsers_gravlund`
- `vigelandsparken`
- `voienvolden`

## i18n-konsekvens
- Endringer i place-datasett kan gjøre `_sourceHash`-status stale/missing for berørte IDs i oversettelser.
- Dette er akseptabelt i denne batchen og rettes ikke her.

## Kontroll av avgrensning
Bekreftet:
- Ingen endringer i runtime JS
- Ingen endringer i CSS
- Ingen endringer i `js/boot.js`
- Ingen endringer i `data/places/manifest.json`
- Ingen endringer i i18n-filer
