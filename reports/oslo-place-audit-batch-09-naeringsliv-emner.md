# Oslo place-audit batch 09 — naeringsliv emner

**Dato:** 2026-05-26

## Formål
Verifisere gjenværende `em_naer_*` / næringsliv-relaterte mangler etter batch 08, og gjøre minimal canonical-opprydding uten å innføre nytt alias-schema i canonical-filen.

## Leste filer
- `reports/place-emne-missing-audit-batch-07.json`
- `reports/oslo-place-audit-batch-08-em-by-canonical.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- `data/fag/naeringsliv/emner_naeringsliv2.json`
- `data/places/naeringsliv/oslo/places_naeringsliv.json`
- `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`

## Relevante emne_id-er
Gjenværende næringsliv-relaterte mangler i validering:
- `em_naer_felt_arbeid_verdiskaping`
- `em_naer_geografi_infrastruktur`
- `em_naering_havn_sjofart`
- `em_naering_lager_terminal_infrastruktur`
- `em_naering_logistikk_handel_flyt`
- `em_naering_modernisering_teknologi`
- `em_naering_telekom_infrastruktur`
- `em_naering_transport_infrastruktur`

## Verifisering mot eksisterende næringsliv-data
- `em_naer_felt_arbeid_verdiskaping` og `em_naer_geografi_infrastruktur` finnes fullverdig i `emner_naeringsliv2.json` med eksisterende næringsliv-schema.
- De seks `em_naering_*`-variantene over finnes ikke som fullverdige emner med samme ID i eksisterende næringslivfiler og behandles derfor som legacy/place-varianter i denne batchen.

## Gjennomført canonical-endring (Batch 09 fix)
- Fjernet de korte alias-postene fra `emner_naeringsliv_canonical_v4_5.json` (ingen `id`/`alias_of`/`note`/`canonical_status` beholdt).
- La i stedet inn to fullverdige emneobjekter (uendret struktur fra `emner_naeringsliv2.json`) i canonical-filen:
  - `em_naer_felt_arbeid_verdiskaping`
  - `em_naer_geografi_infrastruktur`

Endringen er additiv ift. etablerte schema-felter:
- ingen place-filer endret
- ingen eksisterende emne-id-er endret
- ingen ny mini-schema-variant introdusert i canonical-filen

## Utsatt (legacy/place variants)
Følgende beholdes som manglende inntil egen alias/mapping-struktur er etablert i separat PR:
- `em_naering_havn_sjofart`
- `em_naering_lager_terminal_infrastruktur`
- `em_naering_logistikk_handel_flyt`
- `em_naering_modernisering_teknologi`
- `em_naering_telekom_infrastruktur`
- `em_naering_transport_infrastruktur`

## Før/etter
- Før batch 09-fix (`npm run places:emner:check`): `Missing emne_ids: 176`
- Etter batch 09-fix (`npm run places:emner:check`): `Missing emne_ids: 110`

## Øvrige sjekker etter endring
- `npm run places:emner:check` → `Missing emne_ids: 110` (forventet non-zero exit pga øvrige familier)
- `npm run places:index:check` → OK
- `npm run health:places` → OK (Errors: 0, Warnings: 1435, Unknown emne_ids: 110)
