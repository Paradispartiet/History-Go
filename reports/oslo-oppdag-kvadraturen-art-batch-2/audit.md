# Oslo completeness — Oppdag Kvadraturen art representation audit batch 2

Date: 2026-07-19

## Context

The historical 33-stop Oppdag Kvadraturen core is complete in canonical place batches 1–4. Art microplaces batch 1 was merged in PR #2467 with twelve stable artworks represented as Wonderkammer `actual_site_treasure` entries under physically correct existing parents.

This audit resolves the next two deferred art/detail cases without creating a guessed coordinate, a false parent relationship or additional map clutter:

1. Skulptursonen i Øvre Slottsgate
2. Den røde prikk by Otto Künzli, Kongens gate 3

## Repository-wide duplicate audit

Exact-title, alias, artist/title and address searches found no existing canonical place or Wonderkammer record for:

- `Skulptursonen i Øvre Slottsgate`
- `skulptursonen`
- `Den røde prikk`
- `Otto Künzli`

Generic references to Øvre Slottsgate and Kongens gate do not represent either candidate and must not be reused as semantic substitutes.

## Skulptursonen i Øvre Slottsgate

### Source findings

Official Oppdag Kvadraturen material describes the sculpture zone as a permanent exhibition area in the pedestrian section of Øvre Slottsgate between Prinsens gate and Tollbugata. The project was launched in 2019 as a collaboration between Norsk Billedhoggerforening, Oslo kommune Kulturetaten and Bymiljøetaten, with five dedicated sculpture positions in the street.

Oslo kommune independently describes the same transformation: Øvre Slottsgate became a pedestrian street with trees, cobbles and a sculpture zone, completed in June 2019.

Norsk Billedhoggerforening describes the project as an outdoor gallery with changing works. Its current site refers to the collaboration as running from 2020 to 2024, while earlier releases document new installations in 2023. This means the physical sculpture-zone infrastructure and the rotating exhibition programme must not be conflated.

Primary sources:

- https://www.oppdagkvadraturen.no/stoppesteder/skulptursonen-i-ovre-slottsgate
- https://www.oslo.kommune.no/slik-bygger-vi-oslo/bilfritt-byliv-2016-2023/
- https://www.norskbilledhoggerforening.no/skulptursonen
- https://www.norskbilledhoggerforening.no/aktuelt/nye-skulpturer-i-skulptursonen

### Representation decision

**Canonical `kunst` candidate.**

The zone itself is a physically bounded, publicly accessible art destination and is not merely one artwork attached to a building. One canonical marker can represent the stable street-gallery infrastructure while the individual rotating works should be modeled as versioned Wonderkammer content or another time-aware exhibition layer.

Provisional ID:

- `skulptursonen_ovre_slottsgate`

### Coordinate decision

**Do not write coordinates yet.**

The official source bounds the site to the pedestrian street segment between Prinsens gate and Tollbugata. A neighbouring building address, a generic Øvre Slottsgate centroid or one photographed sculpture position would not safely represent the full zone.

Required before implementation:

1. identify an exact named OSM street/pedestrian-area geometry or another authoritative geometry for the bounded segment;
2. preserve the evidence output in the report folder;
3. use a semantic street-zone area anchor or documented segment midpoint only if the coordinate contract explicitly permits it;
4. never substitute a nearby address point.

## Den røde prikk — Otto Künzli

### Source findings

Oppdag Kvadraturen places the small facade artwork at Kongens gate 3 and includes it in both the Nysgjerrigperens art walk and the BaBYvandring Kunst route.

Primary sources:

- https://www.oppdagkvadraturen.no/stoppesteder/den-rode-prikk-otto-kunzli
- https://www.oppdagkvadraturen.no/turer/kunst-i-kvadraturen-nysgjerrigperens-vandring
- https://www.oppdagkvadraturen.no/turer/babyvandring-kunst

### Representation decision

**Wonderkammer microplace, but still deferred.**

The artwork is too small and building-integrated to justify a standalone map marker. History Go currently has no physically correct canonical parent for the Kongens gate 3 facade. It must not be attached to Waisenhuset at Kongens gate 1 or another nearby place merely to make it fit the current model.

Before adding it, audit whether Kongens gate 3 has an independently place-worthy canonical building/site context. If it does not, use a future area-level Kvadraturen art parent or an explicit parentless/geometric microplace mechanism rather than a false building relationship.

## Source-integrity blocker found during the audit

`data/places/kunst/oslo/places_kunst_manifest.json` still declares only four split records, while the authoritative aggregate now contains later records including Emanuel Vigelands mausoleum and Framtidsbiblioteket. The manifest metadata is therefore stale relative to the aggregate.

A controlled run of the repository's existing `scripts/split-kunst-oslo-places.mjs` workflow correctly regenerated the manifest and index from four to six records. The same run also exposed a second drift: the current split record for `ekebergparken` contains a 17-line `nature_profile` that is absent from the authoritative aggregate. A direct regeneration would therefore delete valid Ekeberg nature content while fixing the manifest.

The generated PR #2472 was not merged. All temporary migration/workflow edits were removed, and the PR was closed with zero remaining diff. No valid place data was changed or lost.

No new canonical Oslo art record should be added until both directions of the drift are repaired:

1. copy the verified Ekeberg `nature_profile` into the aggregate on a fresh branch;
2. run the standard splitter;
3. verify a lossless aggregate-to-split round trip with six records;
4. review the Ekeberg diff explicitly before merge.

Writing another canonical record through a direct file-only connector change would compound the drift.

## Next implementation batch

1. Repair Ekeberg aggregate/split parity, then regenerate and validate the six-record Oslo art manifest from fresh `main`.
2. Resolve exact geometry for the bounded Skulptursonen street segment and preserve the raw evidence.
3. Add `skulptursonen_ovre_slottsgate` as one canonical `kunst` place if all coordinate gates pass.
4. Keep individual rotating sculptures outside the permanent canonical place record; represent them as time-aware Wonderkammer content.
5. Continue the Kongens gate 3 building/site audit before representing `Den røde prikk`.

## Merge status

Read-only audit. This branch contains no canonical place data and no coordinate claim. It should not be treated as the implementation batch.