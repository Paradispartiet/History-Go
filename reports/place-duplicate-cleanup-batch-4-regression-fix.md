# Place duplicate cleanup – batch 4 regression fix (`oslo_places.json`)

## Bakgrunn
Etter PR #151 ble `data/places/oslo_places.json` reintrodusert på toppnivå i `data/places/`.
Dette reverserte tidligere batch-2-opprydding, der filen var tatt ut av aktiv top-level scan for å unngå støy i duplicate-kontroll.

## Utført fix
- Verifisert at toppnivåfilen eksisterte: `data/places/oslo_places.json`.
- Verifisert at `data/places/arkiv/oslo_places.json` manglet i repoet før fix.
- Arkivkopi ble opprettet fra gjeldende toppnivåversjon: `data/places/arkiv/oslo_places.json`.
- Toppnivåfilen ble deretter fjernet: `data/places/oslo_places.json`.

## Verifikasjon etter fix
- `data/places/oslo_places.json` finnes ikke lenger på toppnivå.
- `data/places/arkiv/oslo_places.json` finnes og bevarer dataene.
- `js/boot.js` refererer ikke til `oslo_places.json`.
- `data/places/manifest.json` refererer ikke til `oslo_places.json`.
- Ingen aktive place-filer ble endret (kun fjerning av toppnivå `oslo_places.json`; ingen endringer i øvrige aktive `data/places/*.json`).
- Ingen runtime JS-, CSS- eller i18n-filer ble endret.

## Duplicate-scan (top-level `data/places/*.json`)
Kjørt etter fix. Resultat:
- Duplicate ID count: **4**
- Gjenstående semantiske duplicate IDs:
  - `deichman_bjorvika`
  - `var_frelsers_gravlund`
  - `vigelandsparken`
  - `voienvolden`

## i18n-audit
Kommando: `node scripts/i18n-audit-places.js en`
- Scriptet rapporterer fortsatt eksisterende oversettelsesarbeid (manglende/stale oversettelser), som forventet.
- Duplicate master place IDs i audit: 4 (`vigelandsparken`, `voienvolden`, `deichman_bjorvika`, `var_frelsers_gravlund`).
