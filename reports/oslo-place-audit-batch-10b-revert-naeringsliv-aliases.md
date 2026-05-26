# Oslo place audit — Batch 10b revert av næringsliv-aliaser

## Bakgrunn
PR #663 ble merget utilsiktet og innførte en alias-retning vi tidligere hadde valgt å utsette:
- korte `canonical_alias`-poster i `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- alias-integritetssjekk i `tools/check_place_emne_ids.mjs`

I Batch 10b reverserer vi denne effekten slik at canonical emne-filer igjen bare representerer fullverdige canonical emneobjekter.

## Hva som er fjernet
Følgende alias-poster (lagt inn i PR #663) er fjernet fra næringsliv canonical:
- `em_naering_havn_sjofart`
- `em_naering_lager_terminal_infrastruktur`
- `em_naering_logistikk_handel_flyt`
- `em_naering_modernisering_teknologi`
- `em_naering_telekom_infrastruktur`
- `em_naering_transport_infrastruktur`

## Hva som er beholdt
De to fullverdige Batch 09-emnene er beholdt uendret:
- `em_naer_felt_arbeid_verdiskaping`
- `em_naer_geografi_infrastruktur`

## Verktøy-endring
`tools/check_place_emne_ids.mjs` er tilbakeført til enkel canonical-sjekk uten alias-logikk.
Fjernet fra scriptet:
- `canonical_status`
- `alias_of`
- `aliasIssues`
- `alias_missing_emne_id`
- `alias_missing_alias_of`
- `alias_self_reference`
- `alias_target_missing`

Scriptet sjekker nå:
- manglende `emne_ids` i places
- duplikate `emne_ids` per place
- duplikate place-id-er på tvers av aktive place-filer
- duplikate canonical `emne_id` på tvers av canonical-filer

## Før/etter validering
Kjøringer etter revert:
- `node --check tools/check_place_emne_ids.mjs` → **OK**.
- `npm run places:emner:check` → **feiler forventet** med manglende emner; totalt `Missing emne_ids: 65`.
- `npm run places:index:check` → **OK**.
- `npm run health:places` → **OK** (0 errors, warnings eksisterer fra før).

Effekt sammenlignet med alias-varianten fra PR #663:
- Manglende næringsliv-emner blir synlige igjen (dette er ønsket i denne batchen), bl.a.:
  - `em_naering_logistikk_handel_flyt`
  - `em_naering_lager_terminal_infrastruktur`
  - `em_naering_havn_sjofart`
  - `em_naering_telekom_infrastruktur`
  - `em_naering_modernisering_teknologi`
  - `em_naering_transport_infrastruktur`

## Videre arbeid
Hvis vi ønsker aliaser/mapping senere, må dette tas i en **egen separat batch** med tydelig datastruktur for mapping/alias, ikke blandet inn i canonical emneobjekter.
