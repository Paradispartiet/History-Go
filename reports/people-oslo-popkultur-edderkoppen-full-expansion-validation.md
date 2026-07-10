# Edderkoppen Scene — full people expansion validation

Generated: 2026-07-10

## Scope

Expands `edderkoppen_scene` from five core people anchors to nineteen active person links.

## New single-person files

- `per_kvist.json`
- `arvid_nilssen.json`
- `willie_hoel.json`
- `dan_fosse.json`
- `tom_sterri.json`
- `ketil_aamodt.json`
- `anders_moland.json`
- `oivind_blunck.json`
- `jon_eikemo.json`
- `kirsti_sparboe.json`
- `inger_lise_rypdal.json`
- `ole_paus.json`
- `rolv_wesenlund.json`
- `harald_heide_steen_jr.json`

All new files are under:

`data/people/popkultur/oslo/edderkoppen_scene/`

## Existing people updated without duplication

- `oliver_neerland` — existing Nationaltheatret file gains `edderkoppen_scene` in `places` and Edderkoppen context in text/tags.
- `kjersti_holmen` — existing film/TV entry gains `edderkoppen_scene` in `places` and Edderkoppen/ABC context in text/tags.

## Place naming

The place keeps the current display name:

- `Edderkoppen Scene`

Historical aliases added:

- `Edderkoppen`
- `Edderkoppen Teater`
- `ABC-teatret`

## Source basis

Primary source basis is Store norske leksikon and the documented Edderkoppen/ABC theatre history:

- Leif Juster material supports the early Edderkoppen collaborators, including Per Kvist, Oliver Neerland, Arvid Nilssen, Willie Hoel and Dan Fosse.
- Einar Schanke material supports the ABC-period leadership and performer network, including Tom Sterri, Ketil Aamodt, Anders Moland, Øivind Blunck, Jon Eikemo, Kirsti Sparboe, Inger Lise Rypdal, Ole Paus and Kjersti Holmen.
- Rolv Wesenlund and Harald Heide-Steen jr. are included as major Schanke-era revue/comedy profiles with explicit ABC/Edderkoppen context in the research pass.

## Manifest

`data/people/manifest.json` now references all fourteen new single-person files. Existing Oliver Neerland and Kjersti Holmen files were already registered and were therefore updated in place rather than duplicated.

## Expected total

- Existing core Edderkoppen people: 5
- New single-person files: 14
- Existing people cross-linked: 2
- Total active Edderkoppen person links after this change: 21

## Validation required locally

```bash
npm run places:index:build
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
