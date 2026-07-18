# Holmenkollen People of Place batch 8 — validation

## Canonical audit
- No existing canonical people record found for `torbjorn_falkanger` / Torbjørn Falkanger.
- No existing canonical people record found for `helmut_recknagel` / Helmut Recknagel.
- No existing canonical people record found for `toralf_engan` / Toralf Engan.
- No existing canonical people record found for `torbjorn_yggeseth` / Torbjørn Yggeseth.
- No existing canonical people record found for `roger_ruud` / Roger Ruud.

## File structure
- Five new files.
- Each file contains one person object in a one-person JSON array.
- Every `id` matches its filename.
- Every record uses `category: "sport"`.
- Every record uses `placeId: "holmenkollen_nasjonalanlegg"`.
- Every `places` array contains only `holmenkollen_nasjonalanlegg`.
- Every record uses `person_skier_miniature`.
- No image fields are populated.

## Place gate
- Torbjørn Falkanger: Holmenkollen winner in 1949 and 1950.
- Helmut Recknagel: Holmenkollen winner in 1957 and 1960.
- Toralf Engan: Holmenkollen winner in 1962.
- Torbjørn Yggeseth: Holmenkollen winner in 1963.
- Roger Ruud: Holmenkollen winner in 1981.

## Manifest
Planned registrations, exactly once each:
- `people/sport/oslo/holmenkollen_nasjonalanlegg/torbjorn_falkanger.json`
- `people/sport/oslo/holmenkollen_nasjonalanlegg/helmut_recknagel.json`
- `people/sport/oslo/holmenkollen_nasjonalanlegg/toralf_engan.json`
- `people/sport/oslo/holmenkollen_nasjonalanlegg/torbjorn_yggeseth.json`
- `people/sport/oslo/holmenkollen_nasjonalanlegg/roger_ruud.json`

## Expected scope
- 5 new person JSON files
- 1 people manifest modification
- 1 research report
- 1 validation report
- Total: 8 changed files

No place, UI, image or runtime changes are part of this batch.
