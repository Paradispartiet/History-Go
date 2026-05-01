# i18n EN quality fix: radhusplassen + bjorvika

## Quality result before fix
Command: `node scripts/i18n-quality-places.js en`

- Entries checked: 37
- Entries with issues: 2
- Errors: 0
- Warnings: 2
- Warning entries:
  - `radhusplassen` — `popup_much_shorter` (source 493 words, translation 215)
  - `bjorvika` — `popup_much_shorter` (source 545 words, translation 238)

## Updated entries
Updated only in `data/i18n/content/places/en.json`:
- `radhusplassen.popupDesc`
- `bjorvika.popupDesc`

## What was improved in popupDesc
- Expanded both popup descriptions to long-form translations aligned with Norwegian master structure and analytical tone.
- Preserved civic/political/public-space framing for `radhusplassen`, including city hall–fjord threshold, ceremony vs everyday public use, mass events, and urban publicness.
- Preserved urban transformation framing for `bjorvika`, including Fjord City context, infrastructure shift, waterfront reuse, cultural institutions, capital/property dynamics, public access, and social sorting/gentrification discussion.
- Kept `_status: "machine_translated"` and existing `_sourceHash` values (no source change).

## Stamp script result
Command: `node scripts/i18n-stamp-places.js en`

- entries: 37
- hashes changed: 0
- translation IDs without master place: 0

No stamp changes were applied.

## Audit result after fix
Command: `node scripts/i18n-audit-places.js en`

- OK: 37
- Missing: 125
- Stale: 0
- Missing _sourceHash: 0
- Extra translation IDs: 0
- Duplicate master place IDs: 0 (per project status / targeted cleanup baseline)

## Quality result after fix
Command: `node scripts/i18n-quality-places.js en`

- Entries checked: 37
- Entries with issues: 0
- Errors: 0
- Warnings: 0

## Scope confirmation
- No `data/places/*.json` files were changed.
- No runtime JS/CSS files were changed.
- No i18n files other than `data/i18n/content/places/en.json` were changed.
