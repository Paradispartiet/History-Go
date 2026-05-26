# Oslo place-audit batch 09 — naeringsliv emner

**Dato:** 2026-05-26

## Formål
Verifisere gjenværende `em_naer_*` / næringsliv-relaterte mangler etter batch 08, og gjøre minimal canonical-opprydding i næringsliv canonical-kilde.

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
- `em_naer_felt_arbeid_verdiskaping` og `em_naer_geografi_infrastruktur` finnes allerede fullverdig i `emner_naeringsliv2.json`, men manglet i canonical-scan fordi checker kun leser filer som matcher `emner*_canonical*.json`.
- Øvrige seks er place-/prefix-varianter som peker semantisk på etablerte canonical-emner i samme fagfamilie (`havn_transport`, `handel_verdikjeder`, `teknologi_infrastruktur`).

## Gjennomført canonical-endring
La til åtte små canonical alias-poster i:
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`

Endringen er additiv:
- ingen place-filer endret
- ingen eksisterende ID-er endret
- ingen semantikk flyttet; varianter peker til eksisterende canonical-emner via `alias_of`

## Utsatt
- Ingen næringsliv-relaterte `em_naer_*`/`em_naering_*` utsatt i denne batchen.

## Før/etter
- Før batch 09 (`npm run places:emner:check`): `Missing emne_ids: 176`
- Etter batch 09 (`npm run places:emner:check`): `Missing emne_ids: 103`
- Netto reduksjon: `73`

## Øvrige sjekker etter endring
- `npm run places:index:check` → OK
- `npm run health:places` → OK (forventede warnings), unknown emne_ids: 176 (egen health-check teller bredere enn emner-check, men uten nye errors).
