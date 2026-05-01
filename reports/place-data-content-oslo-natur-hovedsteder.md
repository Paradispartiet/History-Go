# Place-data innholdsjobb: `places_oslo_natur_hovedsteder.json`

Dato: 2026-05-01

## Ferdigstilte steder

Følgende steder er ferdigstilt innholdsmessig:

- `ostensjovannet`
- `hovedoya`
- `gressholmen`
- `bygdoy_natur`
- `alnaelva`
- `ljanselva`
- `maerradalen`
- `maridalsvannet`
- `noklevann`

## Year-verdier lagt til

| Place-id | Year | Type |
|---|---:|---|
| `ostensjovannet` | 1992 | Eksakt (verneår brukt som historisk anker) |
| `hovedoya` | 1147 | Periodisert/anker (middelalderlig klosterfase) |
| `gressholmen` | 1992 | Periodisert/anker (moderne verneperiode i øyområdet) |
| `bygdoy_natur` | 2002 | Periodisert/anker (moderne kulturmiljø-/forvaltningsfase) |
| `alnaelva` | 2005 | Periodisert/anker (nyere restaureringsfase) |
| `ljanselva` | 1977 | Periodisert/anker (hovedfase for moderne natur-/vassdragsforvaltning) |
| `maerradalen` | 2009 | Periodisert/anker (nyere verne-/forvaltningsfase) |
| `maridalsvannet` | 1867 | Periodisert/anker (institusjonell vannforsyningsfase) |
| `noklevann` | 1923 | Periodisert/anker (hovedfase i bynær marka-/friluftsbruk) |

## Felter lagt til per sted

Alle ni steder fikk lagt til:

- `year`
- `popupDesc`
- `emne_ids`
- `quiz_profile`

## Brukte `emne_ids`

Kun eksisterende `emne_ids` fra repoet er brukt.

- `em_nat_by_natur_motepunkt`
- `em_nat_okologi_grenser`
- `em_by_urban_helse_miljo`
- `em_his_kirke_kloster_middelalder`
- `em_by_vannpromenader_fjordliv`
- `em_his_historiske_lag_i_byrom`
- `em_his_kulturminner_bevaring`
- `em_by_offentlige_rom_motesteder`
- `em_by_klima_blagronn_klimatilpasning`
- `em_by_industri_havn_logistikk`
- `em_by_topografi_utsyn_hoydedrag`
- `em_by_stillhet_vs_aktivitet_i_grontrom`
- `em_by_urban_metabolisme_vann_energi_avfall_mat`
- `em_by_parker_som_sosial_infrastruktur`

## Audit før/etter for `places_oslo_natur_hovedsteder.json`

Kilde: `node tools/audit-place-data.mjs`

**Før:**
- Manglende `year`: 9
- Manglende `popupDesc`: 9
- Manglende `emne_ids`: 9
- Manglende `quiz_profile`: 9

**Etter:**
- Manglende `year`: 0
- Manglende `popupDesc`: 0
- Manglende `emne_ids`: 0
- Manglende `quiz_profile`: 0

## Bekreftelser

- `image` er ikke endret i denne jobben.
- `cardImage` er ikke endret i denne jobben.
- Ingen asset paths er rettet eller lagt til.
- Globale ugyldige place-referanser er fortsatt **0** i audit-rapporten.
