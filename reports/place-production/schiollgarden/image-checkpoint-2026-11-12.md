# Schiøllgården — image checkpoint

Branch: `codex/schiollgarden-images-20261112`, based on text PR #7294 head `e30dbfb67d9cc5e73982926b1dcdbc7dd08051a3`. This image/integration PR is stacked on that branch to respect description/derived-index isolation.

The former empty portrait frame has a 900×1350 crop from Mahlum's photograph dated 31 May 2008 (public domain). The separate 1400×933 overview comes from Helge Høifødt's photograph dated 24 August 2020 (CC BY-SA 4.0), cropped to Schiøllgården at the right of the original. These are two different photographers, original files, source pages and source SHA-256 values. Both dates are disclosed through the actual app historical-caption fields; both works retain separate attribution, license and transformation records. Neither is 2026 site evidence.

The portrait shows the central 1881 facade from the 2008 photograph. The overview shows the building after the 2014–2019 rebuilding. The two originals and selected outputs were visually inspected locally. The unused overview derived from the 2008 source is removed. No generative fill, invented architecture, deprecated cardImage or substitute QuizCard is introduced.

## Checks and limitations

- `npm run build:tools`: PASS.
- Canonical places-index builder and place-open builder run; 1538 payloads regenerated/verified.
- `node dist/tools/check_places_index_sync.mjs`: PASS.
- `node scripts/build-place-open-payloads.mjs --check`: PASS.
- Full image audit: 218 local, 141 remote, 79 optional Micro Places, 1100 missing, 0 invalid; summary regenerated from those results. This is exactly one missing image resolved.
- The index builder also synchronizes a pre-existing missing `imageMeta` projection for Tjuvholmen. Its canonical source, photos, crop and content are unchanged. This is deterministic generator output, not another place-production job.
- `check-distinct-place-photos --place <canonical file> --require-both`: PASS; no invariant weakened. Existing photo-original regression tests also run.
- Browser runner covers real application hydration, the actual local portrait image, visible dimensions, image credits, source link data and card overflow at 390, 1024 and 1440 pixels. It records screenshots and page errors. It does not certify quiz/flip, Fagverk or full production.
- Local Chromium could not start: its ProcessSingleton socket is denied by this runtime. Therefore no local app/browser PASS is claimed. The GitHub browser job passed at head 047dcd1 for all three screen widths, image loading, visible historical date, credits and no card overflow. The replacement overview and its two-source/date checks require a fresh pass on the new head.
- Epoch index regenerated from six explicitly dated, source-backed building milestones (1881 twice, 1899, 1972, 2014, 2019). The 1815–1816 lodging interval belongs to the demolished predecessor and remains contextual instead of becoming an invented exact building event. 39/39 existing epoch tests PASS. Fagverk release manifest rebuilt and already current.
- Full production remains open: Fagverk, candidate collections, Språkleksikon, fullquiz/Knowledge, dedicated QuizCard and full final UI review.

## Quality assessment of the whole requested Place

Correctness/evidence 4/5 (two attributed original photographs and inspected facade); coverage 2/5 (image checkpoint only); editorial/visual 4/5 (independent overview and portrait, inspected); technical integrity 3/5 (builders/sync pass, replacement browser result pending); responsibility 4/5 (honest 2008/2020 dates and distinct rights); auditability 4/5 (source metadata, SHA-256 and reproducible crop coordinates). Total 21/30. No complete/v1/high-quality end-to-end status is asserted.
