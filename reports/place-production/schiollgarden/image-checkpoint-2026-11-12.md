# Schiøllgården — image checkpoint

Branch: `codex/schiollgarden-images-20261112`, based on text PR #7294 head `e30dbfb67d9cc5e73982926b1dcdbc7dd08051a3`. This image/integration PR is stacked on that branch to respect description/derived-index isolation.

The former empty image frame now has a local 900×1350 portrait of the central facade. The separate 1400×871 overview preserves the complete original photograph. Both are derived independently from Mahlum's photograph dated 31 May 2008, released to the public domain by its author on Commons. The caption explicitly places it before the rebuilding begun in 2014. It is not 2026 site evidence. Source identity (address, heritage ID 166098, distinctive facade), rights declaration, original download hash and both output hashes are recorded in `image-source-2008.json` and canonical image metadata. Both output crops were visually inspected locally.

The portrait was manually selected from the original at x=450,y=90,w=600,h=900. It shows the mansard roof, facade and central entrances without the large traffic-light post at the right of the overview. The overview preserves the full building. No invented architectural content or generative fill was used. No deprecated cardImage or substitute QuizCard was introduced.

## Checks and limitations

- `npm run build:tools`: PASS.
- Canonical places-index builder and place-open builder run; 1538 payloads regenerated/verified.
- `node dist/tools/check_places_index_sync.mjs`: PASS.
- `node scripts/build-place-open-payloads.mjs --check`: PASS.
- Full image audit: 218 local, 141 remote, 79 optional Micro Places, 1100 missing, 0 invalid; summary regenerated from those results. This is exactly one missing image resolved.
- The index builder also synchronizes a pre-existing missing `imageMeta` projection for Tjuvholmen. Its canonical source, photos, crop and content are unchanged. This is deterministic generator output, not another place-production job.
- Browser runner covers real application hydration, the actual local portrait image, visible dimensions, image credits, source link data and card overflow at 390, 1024 and 1440 pixels. It records screenshots and page errors. It does not certify quiz/flip, Fagverk or full production.
- Local Chromium could not start: its ProcessSingleton socket is denied by this runtime. Therefore no local app/browser PASS is claimed. A narrowly scoped GitHub Actions job is included to run the same real-app QA and publish screenshots.
- Full production remains open: Fagverk, candidate collections, Språkleksikon, fullquiz/Knowledge, dedicated QuizCard and full final UI review.

## Quality assessment of the whole requested Place

Correctness/evidence 4/5 (attributable 2008 photograph and inspected facade); coverage 2/5 (image checkpoint only); editorial/visual 4/5 (independent overview and portrait, inspected); technical integrity 3/5 (builders/sync pass, browser result pending); responsibility 4/5 (honest historic date and rights); auditability 4/5 (source metadata, SHA-256 and reproducible crop coordinates). Total 21/30. No complete/v1/high-quality end-to-end status is asserted.
