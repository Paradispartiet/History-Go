# Etne media batch 1 — research and place gate

Date: 2026-07-18

## Candidate

### `grannar_redaksjon_etne` — Grannar-redaksjonen i Etne

Decision: **include** as a concrete `media` place.

Grannar is the local newspaper for Etne municipality in Vestland and Vindafjord municipality in Rogaland. The newspaper states that it was started in 1973, publishes news online throughout the week and produces the newspaper locally. It describes itself as politically independent and operating under the Norwegian press ethics framework.

This is a direct media-production anchor rather than a generic business place: the physical redaction is where local source work, selection, editing and publication take place.

## Physical address and coordinate method

Current registered business and sub-unit address:

- Haukelivegen 997
- 5590 ETNE

Primary address source:

- Brønnøysundregistrene, GRANNAR AS, org. no. 923 708 715
- https://virksomhet.brreg.no/nb/oppslag/enheter/923708715

The repository's address-first coordinate finder was run before the canonical source record was created:

```bash
mkdir -p reports/etne-media-batch-1-coordinate-intake
npm run places:coords:find:address -- --address "Haukelivegen 997, 5590 Etne" \
  | tee reports/etne-media-batch-1-coordinate-intake/grannar-haukelivegen-997.json
```

Result:

- status: `verified_candidate`
- reason: one clear Geonorge address hit
- coordinate: `59.66414439895677, 5.940649457868514`
- radius: `60`
- `sourceProvider: official_address`
- `sourceObjectId: geonorge-adresser-v1:4611:1003:997`
- `locatorType: building`
- `geocodeAccuracy: rooftop`
- `coordRole: display_marker`
- `coordStatus: verified`
- `coordType: address_point`

Raw saved evidence:

- `reports/etne-media-batch-1-coordinate-intake/grannar-haukelivegen-997.json`

## Duplicate gate

Current `main` was searched before creation for:

- `Grannar`
- `grannar_redaksjon`
- `Haukelivegen 997`
- existing Etne media PRs

No existing canonical Grannar place record or competing Etne media batch was found.

The record is intentionally separate from:

- `etnesjoen_tettstad` and other broad settlement records, because Grannar is a concrete editorial workplace
- generic Etne Senter identity, because the canonical media object is the newspaper redaction at its registered address
- any place merely covered by Grannar, because media coverage alone does not create a media-category place

## Category gate

Canonical Media guidance explicitly includes newspapers, editorial offices, media houses and documented media production as valid `media` anchors.

Selected canonical topics:

- `em_media_avishus_offentlighetsrom`
- `em_media_redaksjon_desk`
- `em_media_kildearbeid`
- `em_media_digital_offentlighet`

These represent the physical newspaper/redaction, editorial workflow, source work and combined print/digital public sphere.

## Editorial guardrails

Do not build questions from current daily headlines or temporary staff counts.

Prefer stable, source-backed angles:

- the newspaper's founding in 1973
- the role of a local editorial office
- source work and editorial selection
- local public sphere across Etne and Vindafjord
- the transition between print and digital publication
- press ethics and editorial responsibility

## Sources

1. Grannar — Om oss
   - https://www.grannar.no/om-oss
   - official newspaper description, coverage area, 1973 start and publication model
2. Brønnøysundregistrene — GRANNAR AS
   - https://virksomhet.brreg.no/nb/oppslag/enheter/923708715
   - registered business address and newspaper-publishing activity
3. Geonorge Adresser API v1
   - saved through the repository coordinate finder under `reports/etne-media-batch-1-coordinate-intake/`
4. `data/fag/media/SET_MAL_README_media_v4_3.md`
   - category and canonical-emne guidance only; not used as factual source
