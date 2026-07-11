# Chat Noir people core 1 — validation

Generated: 2026-07-11

## Scope

Adds five new Chat Noir people as single-person files and cross-links six existing canonical people entries. No duplicate person files are introduced.

## New single-person files

- `data/people/popkultur/oslo/chat_noir/bokken_lasson.json`
- `data/people/popkultur/oslo/chat_noir/vilhelm_dybwad.json`
- `data/people/popkultur/oslo/chat_noir/victor_bernau.json`
- `data/people/popkultur/oslo/chat_noir/jens_book_jenssen.json`
- `data/people/popkultur/oslo/chat_noir/dag_froland.json`

## Existing canonical entries cross-linked

- `lalla_carlsen` — Edderkoppen + Chat Noir
- `ernst_diesen` — Edderkoppen + Chat Noir
- `einar_schanke` — Edderkoppen/ABC + Chat Noir
- `tom_sterri` — Edderkoppen/ABC + Chat Noir
- `egil_monn_iversen` — Det Norske Teatret + Chat Noir
- `johan_henrik_wiers_jenssen` — Nationaltheatret + Chat Noir

## Source basis

Primary source: Store norske leksikon.

- Bokken Lasson founded Chat Noir in 1912 and led it until 1917.
- Vilhelm Dybwad wrote plays, revues and songs, especially for Chat Noir.
- Victor Bernau joined Chat Noir in 1916, was director in 1917–1918 and transformed the literary cabaret into a modern popular revue theatre.
- Jens Book-Jenssen started at Chat Noir in 1936 and served as director in 1947–1950 and 1954–1959.
- Dag Frøland debuted as a director at Chat Noir in 1971 and presented his own revues there almost annually from 1976 to 1989.
- The Chat Noir institutional history supports the cross-links for Lalla Carlsen, Ernst Diesen, Einar Schanke, Tom Sterri, Egil Monn-Iversen and Johan Henrik Wiers-Jenssen.

## Manifest

`data/people/manifest.json` registers the five new single-person files. Existing cross-linked entries retain their existing manifest paths.

## Validation required after merge

```bash
mkdir -p reports/chat-noir-people-core-1-audit
npm run places:index:build | tee reports/chat-noir-people-core-1-audit/places-index-build.txt
npm run build:tools | tee reports/chat-noir-people-core-1-audit/build-tools.txt
node dist/tools/audit-people-invalid-place-refs.mjs | tee reports/chat-noir-people-core-1-audit/invalid-place-refs.txt
node dist/tools/audit-people-of-places-status.mjs | tee reports/chat-noir-people-core-1-audit/people-status.txt
node dist/tools/audit-people-place-coverage.mjs | tee reports/chat-noir-people-core-1-audit/place-coverage.txt
```

Expected:

- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
