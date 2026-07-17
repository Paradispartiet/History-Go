# Etne historie — batch 1 research

## Scope

First dedicated `historie` batch for Etne after the Etne-area nature expansion.

Selected canonical IDs:

- `stodle_kyrkje`
- `helgaberget_etne`
- `borgasen_etne`
- `saebotunet_etne`
- `gjerde_kyrkje_etne`

All five are placed under `data/places/historie/vestland/etne/` because Etne is administratively in Vestland.

## Pre-creation duplicate audit

Repository code search was run against current `main` before creating the files for the following names and variants:

- Etne
- Stødle / Støle / Stødle kyrkje
- Helgaberget / Helgaberg
- Borgåsen
- Sæbøtunet
- Gjerde kyrkje

No existing canonical place record was found for any of the five selected IDs or names. Search hits for the token `Etne` were unrelated Etnedal material and general reports/runtime code rather than existing Etne place records.

## Candidate decisions

### `stodle_kyrkje`

**Decision:** add.

The surviving stone section is medieval and dates to the 1100s. Local church documentation describes the traditional attribution to Erling Skakke around the 1160s, while also discussing newer historical arguments that the church may be somewhat older and could have been built by Kyrpinga-Orm or Ogmund. The record therefore treats Erling Skakke as a tradition, not a certain builder attribution.

The site is historically significant as the private high-status church of the Stødle stormann milieu and for its connection to Erling Skakke and Magnus Erlingsson.

Coordinate anchor: church building, `59.67308, 5.96579`, based on the mapped church object / open geographic datasets.

Primary sources:

- https://www.etne.kyrkja.no/Artikler/Artikkeldetaljer/ArticleId/124/Stodle-kyrkje
- https://norgeskirker.no/wiki/St%C3%B8dle_kyrkje
- https://snl.no/St%C3%B8dle-%C3%A6tten

### `helgaberget_etne`

**Decision:** add as a separate archaeological anchor rather than creating a broad, overlapping `stodleterrassen` place in the same batch.

Kringom documents at least 270 cup marks, 23 ring figures and around 20 oval/U-shaped figures. The field belongs to the Bronze Age agricultural-rock-art tradition. The possible cultic function is presented as interpretation rather than certain fact.

The site also represents the prehistoric depth of the protected Stødleterrassen cultural landscape while keeping the gameplay marker on a concrete archaeological location.

Coordinate anchor: rock-art locality, `59.674206, 5.967379`.

Primary sources:

- https://www.kringom.no/nb/sunnhordland/etne/helgaberget
- https://www.etne.kommune.no/organisasjon/planar-og-strategiar/kommuneplan/kommunedelplan-for-kulturmiljo-2022-2026/
- https://www.vestlandfylke.no/nyheitsarkiv/2024/stodleterrassen-i-etne-er-freda/

### `borgasen_etne`

**Decision:** add.

Borgåsen preserves remains of one of four known hillforts in Etne. Kringom describes a flat summit protected by cliffs on three sides and a substantial constructed wall on the accessible side, with strategic views over the entrance to Etne.

The exact dating and function are not treated as certain. The record follows the source's caution that Sunnhordland's hillforts are poorly investigated and may have served either local refuge functions or wider organized defence.

Coordinate anchor: Borgåsen summit, `59.659013, 5.914183`.

Primary sources:

- https://www.kringom.no/nb/borgasen
- https://snl.no/Etne

### `saebotunet_etne`

**Decision:** add.

Sæbøtunet provides the batch's social and everyday-history anchor. Sunnhordland Museum and Kringom describe the preserved farm environment as evidence for building practice, labour and social conditions before agricultural mechanization. The museum took over the site in 1938.

Sources differ in how many buildings they count in the present complex, so the canonical record deliberately avoids making a current building count a required quiz fact.

Coordinate anchor: museum site, `59.6622, 5.92855`.

Primary sources:

- https://sunnhordland.museum.no/avdeling/saebotunet/
- https://www.kringom.no/nb/sunnhordland/etne/saebotunet

### `gjerde_kyrkje_etne`

**Decision:** add.

The current church location dates from 1676, while the building's full age and earliest history are uncertain. The record keeps that uncertainty explicit.

The surrounding Gjerde area is historically significant in its own right: broader historical sources describe Gjerde as a probable high-status centre in the Viking Age and possibly later royal/crown property. The record treats those statements as contextual historical interpretation rather than certain institutional continuity into the present church.

Coordinate anchor: church building, `59.6640508, 5.934726`.

Primary sources:

- https://snl.no/Gjerde_kirke
- https://www.etne.kommune.no/kultur-og-fritid/kyrkja/
- https://snl.no/Etne

## Deliberately deferred candidates

- **Stødleterrassen** — highly significant protected cultural landscape, but deferred to avoid placing a broad-area marker almost on top of both Stødle kyrkje and Helgaberget in the same first batch.
- **Grindheim kyrkje** — valid historical candidate, but deferred to avoid an overly church-heavy first batch.
- **Postvegen Etne–Skånevik** — strong future transport-history candidate, but its long linear route needs a deliberate gameplay anchor rather than an arbitrary midpoint.
- **Bruteigsteinen / Duesteinen / Fjøsnaneset rock art** — strong archaeological follow-up candidates for a later Etne prehistoric-history batch.

## Integration gate

Before merge, the five new canonical files must be:

1. registered in `data/places/manifest.json`,
2. included in a rebuilt `data/places/places_index.json`,
3. checked for active-place duplicate IDs,
4. passed through the normal place/index/coordinate validation gates.

No merge should happen while the batch exists only as unregistered source files.
