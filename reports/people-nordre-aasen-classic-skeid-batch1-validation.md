# Nordre Åsen classic Skeid batch 1 — validation

## Scope checked

Expected data changes:

- Five new single-person JSON files under `data/people/sport/oslo/nordre_aasen_idrettspark/`
- Five new entries in `data/people/manifest.json`
- Research and validation notes under `reports/`

No batch people file was created.

## Structural checks

The five people files contain the required project fields:

- `id`
- `name`
- `initials`
- `desc`
- `tags`
- `placeId`
- `category`
- `year`
- `popupDesc`
- `places`
- `image`
- `cardImage`

All five use:

- `placeId: nordre_aasen_idrettspark`
- `places: [nordre_aasen_idrettspark]`
- `category: sport`

The place ID exists in `data/places/sport/europa/norway/oslo_sport.json` and is defined as Skeid's historic club ground and home area.

## Manifest check

Verified on the branch that the following entries appear once, immediately after the existing Oslo sport people file:

- `people/sport/oslo/nordre_aasen_idrettspark/harald_hennum.json`
- `people/sport/oslo/nordre_aasen_idrettspark/hans_nordahl.json`
- `people/sport/oslo/nordre_aasen_idrettspark/finn_gundersen.json`
- `people/sport/oslo/nordre_aasen_idrettspark/kjell_kaspersen.json`
- `people/sport/oslo/nordre_aasen_idrettspark/jan_jonas_gulbrandsen.json`

## Diff check

GitHub compare showed only the intended people files, the five manifest additions and the two report files. No place data, runtime code, generated place index or image assets were changed.

## Local command status

A local checkout was not available in the connector-only environment, so the repository commands below were not claimed as executed here:

```bash
node -e "for (const f of [
  'data/people/sport/oslo/nordre_aasen_idrettspark/harald_hennum.json',
  'data/people/sport/oslo/nordre_aasen_idrettspark/hans_nordahl.json',
  'data/people/sport/oslo/nordre_aasen_idrettspark/finn_gundersen.json',
  'data/people/sport/oslo/nordre_aasen_idrettspark/kjell_kaspersen.json',
  'data/people/sport/oslo/nordre_aasen_idrettspark/jan_jonas_gulbrandsen.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f, 'utf8')); console.log('json ok')"

bash scripts/check-people.sh
```

These should be run by CI or before merge.
