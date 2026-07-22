# Etne Lesespor — full coverage pass

## Scope

This pass completes the first curated Lesespor collection for all active History Go places in Etne municipality.

Final active Etne collection after this branch:

- 11 category files under `data/lesespor/etne/`
- 53 unique curated external reading entries
- 81 of 81 active Etne place IDs covered by at least one explicit `place_ids` reference
- no copied article fulltext
- active entries use open access, link-only rights and accepted source-quality/curation values

## Editorial model

The collection follows the canonical Lesespor contract. Lesespor is curated external reading, not another encyclopedia and not an artificial one-link-per-place catalogue. A strong source may serve several genuinely related places when the relationship is explicit.

The pass preserves the Etne history, nature and industry entries that were merged while the wider batch was being prepared. Those files are extended rather than replaced:

- history keeps the existing specific Kringom and SNL tracks and adds the municipal culture-environment plan as an overarching route through the remaining heritage places
- nature keeps the existing Langfoss, Rullestad, Etneelva and Etnedeltaet tracks and adds Stordalsvatnet
- industry keeps the existing Litledalselva power-system track and adds focused reading for Norsk Motormuseum, Sunnhordland Mekaniske Verkstad and the Skånevik canning-industry site

Eight additional category files cover by, kunst, litteratur, sport, politikk, vitenskap, media and psykologi.

## Validation and runtime integration

`data/lesespor/manifest.json` registers all 11 Etne category files.

PR #3221 generalized `tools/validate_lesespor.mts` from an Oslo-only validator to manifest-driven multi-scope validation. The active Etne collection is therefore checked through the same manifest contract as Oslo, including:

- schema, scope/city and category consistency
- registered badge categories and category hints
- open-access requirement
- accepted source quality and curation status
- forbidden copied-fulltext fields
- valid place references against the global active places index
- duplicate item-ID checks

## Coverage audit

The final data model was cross-checked against the active Etne place inventory used for this batch:

- history: 33/33
- sport: 15/15
- all other Etne categories combined: 33/33
- total: 81/81

The collection contains 53 unique active Etne Lesespor item IDs after combining the 13 pre-existing Etne entries, 35 entries from the eight new category files and 5 completion entries added to the existing history/nature/industry files.
