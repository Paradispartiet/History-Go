# i18n EN sync after duplicate cleanup

Date: 2026-05-01

## Scope
Targeted English i18n sync for affected place IDs after duplicate cleanup. Norwegian place data treated as master. No broad batch translation was performed.

Affected IDs:
- barcode
- tjuvholmen
- damstredet_telthusbakken
- ullevål_hageby
- deichman_bjorvika
- var_frelsers_gravlund
- vigelandsparken
- voienvolden

## Commands run
1. `node scripts/i18n-audit-places.js en`
2. `node scripts/i18n-stamp-places.js en`
3. `node scripts/i18n-audit-places.js en`
4. `node scripts/i18n-quality-places.js en`

## Status before sync (from initial audit)
- barcode: missing
- tjuvholmen: missing
- damstredet_telthusbakken: missing
- ullevål_hageby: stale
- deichman_bjorvika: missing
- var_frelsers_gravlund: missing
- vigelandsparken: missing
- voienvolden: missing

## Updated IDs in `data/i18n/content/places/en.json`
Updated/added entries for all 8 affected IDs listed above.

Each updated entry includes:
- `_sourceHash`
- `_status: machine_translated`
- `name`
- `desc`
- `popupDesc`

## Stamp script result
`node scripts/i18n-stamp-places.js en` reported:
- entries: 37
- hashes changed: 3
- translation IDs without master place: 0

## Audit result after sync
From `node scripts/i18n-audit-places.js en`:
- OK: 37
- Missing: 125
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0

Note: Missing translations for other places remain expected in this targeted sync.

## Quality result after sync
From `node scripts/i18n-quality-places.js en`:
- Entries checked: 37
- Entries with issues: 2
- Errors: 0
- Warnings: 2

Warnings reported:
- `radhusplassen`: `popup_much_shorter`
- `bjorvika`: `popup_much_shorter`

No `popup_equals_desc` or `popup_too_short` for the eight updated IDs.

## Change boundaries confirmed
- No `data/places/*.json` files changed.
- No runtime JS/CSS files changed.
- No i18n files changed except `data/i18n/content/places/en.json`.
