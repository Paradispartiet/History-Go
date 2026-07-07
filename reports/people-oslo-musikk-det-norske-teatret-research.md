# Det Norske Teatret people research

Generated: 2026-07-07

## Result

This is a gap-based research note for people-of-places work. The earlier broad music scene-anchor PR was closed because it duplicated already-covered places. This note focuses only on an actually uncovered place in `data/places/musikk/oslo/places_musikk.json`.

## Target place

- `placeId`: `det_norske_teatret`
- file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.

## Repo gate

Searches performed before proposing a people entry:

- `det_norske_teatret people`
- `Hulda Garborg`
- `hulda_garborg Hulda Garborg people`
- `rasmus_rasmussen Rasmus Rasmussen people`

Findings:

- `det_norske_teatret` appears as a place and in stories/quiz/report material, but not as an existing people anchor.
- `hulda_garborg` does not exist as a people ID in the repo search result.
- `rasmus_rasmussen` does not exist as a people ID in the repo search result.

## Research gate: Hulda Garborg

SNL documents that Hulda Garborg was a versatile writer, cultural entrepreneur and folk educator, with pioneer work in language movement, theatre work, women's cause, bunad use and folk dance.

SNL also documents that she was part of founding Det Norske Teatret in 1912 and was the theatre's first chair. The same SNL article states that Det Norske Spellaget was the forerunner of Det Norske Teatret, and that her play `Rationelt Fjøsstell` was part of the theatre's opening performance in 1913.

The SNL article on Det Norske Teatret documents the theatre as an Oslo national theatre, founded 22 November 1912, developed from an ambitious Nynorsk theatre into a Nynorsk national theatre, and states that Hulda and Arne Garborg were drivers behind its founding. It also documents that the theatre has prioritized music theatre, imported Broadway musicals from 1949, and became Norway's leading music theatre in the Tormod Skagestad period with Egil Monn-Iversen as musical director.

## Decision

Safe candidate:

```json
{
  "id": "hulda_garborg",
  "name": "Hulda Garborg",
  "placeId": "det_norske_teatret"
}
```

Reason:

- The place is actually uncovered in the Oslo music place file.
- The candidate has explicit, source-backed institutional connection to Det Norske Teatret.
- The candidate also has relevant folk dance / song-dance / theatre context, which makes her acceptable in the `musikk` category for this specific place.

## Rejected / not used

- Generic `det_norske_teatret_musikkteatermiljoet`: rejected for now because the user explicitly requested more careful people work after the duplicate scene-anchor PR.
- Rockefeller / John Dee / Sentrum Scene anchors: rejected because those places already have people coverage.
- SALT: not handled here because existing people entries already point to SALT, and current venue status requires separate historical/current-status review if we do more.

## Proposed append entry

```json
{
  "id": "hulda_garborg",
  "name": "Hulda Garborg",
  "initials": "HG",
  "desc": "Forfatter, teaterpioner og folkedansformidler som var med på å grunnlegge Det Norske Teatret.",
  "tags": [
    "musikk",
    "scenekunst",
    "teater",
    "nynorsk",
    "folkedans",
    "songdans",
    "grunnlegger"
  ],
  "placeId": "det_norske_teatret",
  "category": "musikk",
  "year": 1912,
  "popupDesc": "Hulda Garborg er et presist personanker for Det Norske Teatret fordi hun var med på å grunnlegge teateret i 1912 og ble teaterets første styreleder. SNL dokumenterer også at Det Norske Spellaget var forløperen til Det Norske Teatret, og at Garborgs eget stykke Rationelt Fjøsstell var del av åpningsforestillingen i 1913. Koblingen passer særlig godt til dette musikk-/scenekunststedet fordi Garborg også arbeidet med folkedans, songdans, teater og nynorsk scenekultur.",
  "places": [
    "det_norske_teatret"
  ],
  "image": "",
  "cardImage": ""
}
```

## Validation required before data append

Run normal validation after appending the entry:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- one new people entry
- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
