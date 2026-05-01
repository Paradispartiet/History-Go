# Place duplicate cleanup – batch 4 (`damstredet_telthusbakken`, `ullevål_hageby`)

Dato: 2026-05-01

## Ryddede IDs
- `damstredet_telthusbakken`
- `ullevål_hageby`

## Masterfil per sted
- `damstredet_telthusbakken`: master i `data/places/places_historie.json`.
- `ullevål_hageby`: master i `data/places/places_by.json`.

## Fjernede sekundærentries
- Fjernet `damstredet_telthusbakken` fra `data/places/places_by.json`.
- Fjernet `ullevål_hageby` fra `data/places/places_litteratur.json`.

## Bevarte perspektiver
### `damstredet_telthusbakken`
- Historie-master beholdt som hovednode for trehusmiljø, bevaring og historiske lag.
- Byperspektiv flettet inn: bystruktur, materialitet, småskala gateforløp og kontrast mot moderne byutvikling.

### `ullevål_hageby`
- By-master beholdt med kategori `by` og hovedvekt på hageby, boligmodell og planleggingscase.
- Litteraturperspektiv fra sekundærpost bevart gjennom tekst og quiz-vinkling (Sigrid Undset-kobling og kulturhistorisk boligmiljø).

## Fletting av `emne_ids`
Ja.
- `damstredet_telthusbakken`: beholdt historiske emner og la til manglende by-emne (`em_by_materialitet_og_sanseerfaring`).
- `ullevål_hageby`: litteraturpostens emner ble slått sammen med by-master uten å miste eksisterende emner.

## Fletting av `quiz_profile`
Ja, for begge steder. Følgende felt ble flettet der relevant:
- `signature_features`
- `primary_angles`
- `question_families`
- `avoid_angles`
- `must_include`
- `contrast_targets`
- `notes`

## Duplicate IDs som gjenstår (modell-A-listen)
- `deichman_bjorvika`
- `var_frelsers_gravlund`
- `vigelandsparken`
- `voienvolden`

Semantisk duplicate count for modell-A-listen gikk fra 6 til 4.

## i18n-konsekvens
Kjøring av `node scripts/i18n-audit-places.js en` etter batchen viser:
- `ullevål_hageby` som `Stale` i `en` (forventet pga. endret mastertekst/sourceHash).
- øvrige missing translations finnes fortsatt (forventet).
- Ingen i18n-filer er endret i denne batchen.

`sourceHash` kan derfor være stale for berørte IDs til egen i18n-sync-batch kjøres.

## Kontroll av avgrensning
Bekreftet i denne batchen:
- Ingen endringer i runtime JS
- Ingen endringer i CSS
- Ingen endringer i `js/boot.js`
- Ingen endringer i `data/places/manifest.json`
- Ingen endringer i i18n-runtime
- Ingen endringer i quiz-resultatlogikk
- Ingen endringer i unlock/progresjon
- Ingen endringer i kartlogikk
- Ingen endringer i service worker
