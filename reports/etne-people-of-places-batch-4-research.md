# Etne People of Places batch 4 — Grannar

Date: 2026-07-18

## Included candidate

### `ann_margit_gronstad` → `grannar_redaksjon_etne`

Decision: include.

Grannar documented Ann Margit Grønstad starting as responsible editor in the Grannar newsroom in 2025. The newspaper's current official information still identifies her as responsible editor. Brønnøysundregistrene registers Grannar AS at Haukelivegen 997, the address represented by the canonical place `grannar_redaksjon_etne`.

This is therefore a direct professional newsroom connection to the current canonical editorial workplace, not merely a generic association with local journalism.

## Deferred historical candidates

Ragni Sunniva Fett and Arnhild Aaen are documented by Grannar as the newspaper's first editors in 1973. They are not added in this batch because the available sources do not establish that the 1973 newsroom occupied the current canonical address at Haukelivegen 997.

This follows the project rule that People of Places links require a defensible physical connection to the canonical place itself.

## Duplicate gate

Current `main` was searched for:

- `ann_margit_gronstad`
- `grethe_hopland_ravn`
- `torstein_tysvaer_nymoen`
- the two historical first editors

No existing canonical `ann_margit_gronstad` people record was found.

## Sources

1. Grannar — Ny redaktør på plass
   - https://www.grannar.no/nyhende/ny-redaktor-pa-plass/114546
2. Grannar — Om oss
   - https://www.grannar.no/om-oss
3. Brønnøysundregistrene — GRANNAR AS
   - https://virksomhet.brreg.no/nb/oppslag/enheter/923708715
4. Grannar — Ei rivande utvikling sidan starten
   - https://www.grannar.no/2023/03/ei-rivande-utvikling-sidan-starten/

## Validation plan

- register `people/media/vestland/etne/ann_margit_gronstad.json` exactly once
- run full people checks and People of Places gate
- verify exactly one canonical `ann_margit_gronstad` record globally
- verify `grannar_redaksjon_etne` is active
- remove temporary integration workflow before merge
