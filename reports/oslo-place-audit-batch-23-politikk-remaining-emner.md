# Oslo place-audit batch 23 — politikk remaining emne_ids

**Dato:** 2026-05-31

## Kommandoer kjørt

- `npm run places:emner:check` — før endring. Resultat: **10 missing emne_id-forekomster**; `em_pol_makt_institusjoner` var fortsatt missing for to Lisboa-politikk-steder.
- `rg -n "em_pol_makt_institusjoner" data/fag/politikk reports data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json`
- `find data/fag/politikk -type f -iname '*emner*_canonical*.json' | sort`
- `python3`-inspeksjon av politikk-emneobjekter i `data/fag/politikk/emner_jjpolitikk.json` og `data/fag/politikk/emner_politikk_canonical_v4_5.json`.
- `npm run places:emner:check` — etter endring. Resultat: **8 missing emne_id-forekomster**; ingen gjenværende `em_pol_*`.
- `npm run places:index:check` — OK, `places_index.json` er i synk.
- `npm run health:places` — OK for error-gate: **Errors: 0**.

## Filer undersøkt

- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/oslo-place-audit-batch-22-migrate-em-nat-prefix.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/politikk/SET_MAL_README_politikk_v4_3.md`
- `data/fag/politikk/emnemapping_politikk_canonical_v4_5.json`
- `data/fag/politikk/emner_jjpolitikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/fag/politikk/fagkart_politikk_canonical_v4_5.json`
- `data/fag/politikk/methods_politikk_canonical_v4_5.json`
- `data/fag/politikk/politikkpensum_canonical_v4_5.json`
- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` — kun som kontekst; ikke endret.

## Før-status

`npm run places:emner:check` rapporterte **10** missing emne_id-forekomster før batchen. Blant disse var politikk-klyngen:

- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` / `lisbon_assembleia_da_republica` / `em_pol_makt_institusjoner`
- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` / `lisbon_largo_do_carmo` / `em_pol_makt_institusjoner`

Batch 12 hadde allerede klassifisert ID-en som `full_definition_exists_not_canonical`.

## Place-id-er som bruker emnet

- `lisbon_assembleia_da_republica` — parlamentsbygg / Assembleia da República i Palácio de São Bento. Place-teksten beskriver bygningen som sentrum for portugisisk parlamentarisme og som institusjonelt knutepunkt mellom kloster, stat, diktatur og demokrati.
- `lisbon_largo_do_carmo` — torg/minnested for nellikrevolusjonen i 1974, der Marcelo Caetano overga seg og Estado Novo falt. Place-teksten knytter stedet til regimeskifte, demokratisk legitimitet og statsmaktens overgang.

## Vurdering av eksisterende fagdata

`em_pol_makt_institusjoner` fantes som et fullverdig objekt i den ikke-canonical politikk-filen `data/fag/politikk/emner_jjpolitikk.json`. Objektet hadde tittel, faglig beskrivelse, keywords, core concepts, blindspots, methods og analysis axes, og var derfor ikke en kort placeholder.

ID-en fantes ikke i den aktive canonical politics-emnefilen `data/fag/politikk/emner_politikk_canonical_v4_5.json`, som er den eneste politikk-filen som matcher `emner*_canonical*.json`.

## Endring gjort

`em_pol_makt_institusjoner` ble gjort canonical i `data/fag/politikk/emner_politikk_canonical_v4_5.json` som et fullverdig politikk-emne med samme canonical schema/stil som eksisterende politikk-emner.

Avgrensningen ble beholdt smal mot politiske institusjoner, statsmakt, parlament/regjering/embetsverk, maktbalanse, regimeskifte og institusjonell legitimitet. Emnet ble ikke gjort til generell historie, generell byromsanalyse, protestkultur eller abstrakt juridisk teori.

## Utsatt / ikke gjort

- Ingen place-data ble migrert i denne batchen.
- Ingen `data/places/**`-filer ble endret.
- `data/places/places_index.json` ble ikke endret.
- Manifest ble ikke endret.
- UI, CSS, HTML og JS ble ikke endret.
- Ingen alias-schema eller alias-mini-schema ble innført.
- Ingen kort placeholder-emne ble opprettet.
- `em_naering_*`, `em_kunst_*` og andre remaining IDs ble ikke rørt.

## Etter-status

### `npm run places:emner:check`

Etter endringen rapporterer sjekken **8** missing emne_id-forekomster, ned fra 10. `em_pol_makt_institusjoner` rapporteres ikke lenger missing, og gjenværende `em_pol_*` er **0**.

Gjenværende missing ligger utenfor batchens scope:

- `em_naering_logistikk_handel_flyt` — 2 forekomster
- `em_naering_lager_terminal_infrastruktur` — 1 forekomst
- `em_naering_havn_sjofart` — 1 forekomst
- `em_naering_telekom_infrastruktur` — 1 forekomst
- `em_naering_modernisering_teknologi` — 1 forekomst
- `em_naering_transport_infrastruktur` — 1 forekomst
- `em_kunst_materialitet_teknikk_handverk` — 1 forekomst

### `npm run places:index:check`

OK: `places_index.json is in sync with source place files.`

### `npm run health:places`

OK for error-gate:

- Files checked: 40
- Places checked: 470
- Hidden places: 0
- Stub places: 0
- Canonical emne files checked: 16
- emne_ids checked: 1051
- Canonical emne_ids: 1043
- Unknown emne_ids: 8
- Wrong-prefix emne_ids: 302
- Errors: 0
- Warnings: 1327

## Anbefalt Batch 24

Neste avgrensede batch bør ta remaining `em_kunst_materialitet_teknikk_handverk` i Lisboa-kunst, fordi den er én unik ID med én forekomst og kan avklares uten å røre `em_naering_*`-klyngen. Etterpå kan en separat næringsliv-batch håndtere de seks gjenværende `em_naering_*`-ID-ene samlet.
