# Place duplicate cleanup – batch 3 (`barcode`, `tjuvholmen`)

Dato: 2026-05-01

## Ryddede IDs
- `barcode`
- `tjuvholmen`

## Masterfil
- Master beholdt i `data/places/places_by.json` for begge IDs.

## Fjernede sekundærentries
Fjernet fra `data/places/places_kunst.json`:
- `barcode`
- `tjuvholmen`

Ikke fjernet:
- `astrup_fearnley`
- `munch_museet`
- `vigelandsparken`
- `nasjonalmuseet`
- `ekebergparken`
- øvrige kunststeder

## Bevarte kunstperspektiver i master
### `barcode`
Bevart/innlemmet i by-master:
- arkitektur- og byutviklingsperspektiv som skyline-/høyhusrekke-case
- kobling til materialitet, transformasjon og konflikt
- kontraster mot kunst/by-steder der relevant

### `tjuvholmen`
Bevart/innlemmet i by-master:
- offentlig kunst i uterom/promenader
- kunstakse-perspektiv i fjordbyen
- nærhet til Astrup Fearnley/galleriaktivitet
- kunst som aktiv faktor i byforming

## Fletting av `emne_ids`
Ja. Relevante kunst-emner ble flettet inn i master (`places_by.json`) for begge IDs.

## Fletting av `quiz_profile`
Ja. Følgende felter ble flettet for begge IDs:
- `primary_angles`
- `question_families`
- `must_include`
- `contrast_targets`
- `notes`
- `signature_features`

## Duplicate IDs som gjenstår etter batchen
Semantiske (modell-A-listen) som fortsatt gjenstår:
- `damstredet_telthusbakken`
- `deichman_bjorvika`
- `ullevål_hageby`
- `var_frelsers_gravlund`
- `vigelandsparken`
- `voienvolden`

Forventning oppfylt: semantisk duplicate count gikk fra 8 til 6.

## i18n-konsekvens
Kjøring av `node scripts/i18n-audit-places.js en` viser at:
- `barcode` og `tjuvholmen` er `Missing` i `en` (ikke `Stale`), som er akseptabelt.
- Endring av mastertekst kan gjøre eksisterende oversettelser stale i språk der disse ID-ene finnes med `_sourceHash`.
- Dette er ikke rettet i denne batchen (som avtalt).

## Kontroll av avgrensning
Bekreftet:
- Ingen endringer i runtime JS
- Ingen endringer i CSS
- Ingen endringer i `js/boot.js`
- Ingen endringer i `data/places/manifest.json`
- Ingen i18n-fikser/oversettelser i denne batchen
