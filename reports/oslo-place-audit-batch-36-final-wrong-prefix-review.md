# Batch 36 — manuell vurdering av siste wrong-prefix warnings

Dato: 2026-06-01

## Formål

Batch 36 vurderer de fire gjenværende wrong-prefix warningene etter Batch 35 og gjør kun smale datafiks der place-teksten ikke dokumenterer emnevalget godt nok. Det er ikke innført ny allowlist, og ingen script-, canonical-, manifest-, UI- eller asset-filer er endret.

## Kommandoer kjørt

Baseline før dataendring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Etter dataendring:

```bash
npm run places:index:check
npm run places:emner:check
npm run health:places
npm run health:places 2>&1 | rg "does not match category|Wrong-prefix|Allowlisted|Warnings:|Errors:|Unknown"
```

## Filer undersøkt

- `reports/oslo-place-audit-batch-35-by-popkultur-allowlist.md`
- `reports/oslo-place-audit-batch-32-film-popkultur-policy-audit.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `data/places/politikk/oslo/places_politikk.json`
- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
- `data/places/manifest.json`

`data/places/places_index.json` ble ikke endret fordi index-check fortsatt var grønn etter dataendringene.

## Baseline før endring

`npm run places:emner:check`:

- Exit code: 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:index:check`:

- Exit code: 0
- `places_index.json is in sync with source place files.`

`npm run health:places`:

- Exit code: 0
- Errors: 0
- Warnings: 1113
- Wrong-prefix emne_ids: 4
- Allowlisted cross-disciplinary emne_ids: 217
- Unknown emne_ids: 0

Merk: Batch 35-rapporten oppgir Warnings: 1021 etter Batch 35. I denne arbeidskopien var faktisk baseline 1113 warnings før Batch 36-endringene, men de relevante kontrollpunktene for denne batchen var uendret: Errors 0, Unknown 0, Wrong-prefix 4 og Allowlisted 217.

## Vurdering per place

### `youngstorget`

Aktuelle wrong-prefix emner:

- `em_pop_digital_offentlighet`
- `em_pop_deltakelse_remix`

Stedsteksten beskriver Youngstorget som arbeiderbevegelsens og fagorganiseringens mobiliseringsrom, en arena for demonstrasjoner, appeller og folkelig politisk deltakelse. `popupDesc` bruker eksplisitt begrepet politisk offentlighet, og `tags` / `layers.populaerkultur` dokumenterer breaking news, TV, direkteoffentlighet og mediescene.

Vurdering:

- `em_pop_digital_offentlighet` beholdes som warning. Digital/mediert offentlighet er dokumentert gjennom `tags` (`breaking_news`, `tv`, `offentlighet`) og `layers.populaerkultur`, som beskriver direktesendt politisk offentlighet, reportere, live-intervjuer og nyhetshendelser. Dette er fortsatt ikke grunnlag for å allowliste hele `politikk → populaerkultur`, men det er nok til å beholde emnet på dette stedet.
- `em_pop_deltakelse_remix` fjernes. Place-teksten dokumenterer politisk deltakelse og mobilisering, men ikke remix som popkulturell produksjonslogikk. Batch 32 vurderte dette emnet som svakere, og den manuelle gjennomgangen fant ikke nytt tekstgrunnlag for å beholde det.

Endring:

- Fjernet `em_pop_deltakelse_remix` fra `youngstorget`.
- Beholdt `em_pop_digital_offentlighet` som den eneste gjenværende wrong-prefix warningen.

### `lisbon_jardim_botanico`

Aktuelt wrong-prefix emne:

- `em_kunst_institusjoner_kanon`

Place-teksten beskriver en vitenskapelig botanisk hage fra 1873, knyttet til Escola Politécnica / Faculdade de Ciências og Portugals universitære botanikkhistorie. `popupDesc` beskriver systematiske plantesamlinger, subtropiske trær, forskningsanlegg, undervisningssted, offentlig park og kolonial kunnskapshistorie.

Vurdering:

- Kunstinstitusjons- eller kanondannelseskontekst er ikke dokumentert i `desc`, `popupDesc` eller `quiz_profile`.
- Stedet har allerede historie- og byromsemner som dekker institusjon, parkfunksjon og bevaring.
- Det ble ikke lagt til nytt emne, fordi batchen skulle unngå bred omskriving og bare gjøre sikre datafiks.

Endring:

- Fjernet `em_kunst_institusjoner_kanon` fra `lisbon_jardim_botanico`.

### `lisbon_fabrica_braco_de_prata`

Aktuelt wrong-prefix emne:

- `em_naer_felt_arbeid_verdiskaping`

Place-teksten beskriver Fábrica Braço de Prata som en tidligere våpenfabrikk i Marvila som fra 2007 ble omgjort til selvorganisert kulturhus med konserter, debatter, bokhandel, bibliotek, bar, atelier og kunstutstillinger. `popupDesc` dokumenterer en militærindustriell bakgrunn, nedleggelse og senere omforming til lavterskel kulturoffentlighet.

Vurdering:

- Industri-/arbeidslivslaget er relevant som bakgrunn, men `em_naer_felt_arbeid_verdiskaping` legger på en næringslivs- og verdiskapingspåstand som place-teksten ikke utdyper som hovedlag.
- Transformasjonen fra industribygg til kulturhus er allerede dekket av `em_by_transformasjon_ombruk`.
- Det ble ikke lagt til nytt emne, og teksten ble ikke utvidet.

Endring:

- Fjernet `em_naer_felt_arbeid_verdiskaping` fra `lisbon_fabrica_braco_de_prata`.

## Fjernede og beholdte `emne_ids`

Fjernet:

- `youngstorget`: `em_pop_deltakelse_remix`
- `lisbon_jardim_botanico`: `em_kunst_institusjoner_kanon`
- `lisbon_fabrica_braco_de_prata`: `em_naer_felt_arbeid_verdiskaping`

Beholdt som warning:

- `youngstorget`: `em_pop_digital_offentlighet`, fordi mediert/digital politisk offentlighet er eksplisitt dokumentert gjennom breaking-news-, TV-, offentlighets- og direkteoffentlighetslaget i place-dataene.

## Før/etter-resultat

| Kontrollpunkt | Før Batch 36 | Etter Batch 36 | Endring |
| --- | ---: | ---: | ---: |
| Errors | 0 | 0 | 0 |
| Warnings | 1113 | 1110 | -3 |
| Wrong-prefix emne_ids | 4 | 1 | -3 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| emne_ids checked | 1044 | 1041 | -3 |

`npm run places:emner:check` før og etter:

- Før: exit code 0, Missing emne_ids 0, Unknown/missing canonical-problemer 0, Duplicate emne_ids 0, Duplicate place ids 0, Duplicate canonical emne_ids 0.
- Etter: exit code 0, Missing emne_ids 0, Duplicate emne_ids 0, Duplicate place ids 0, Duplicate canonical emne_ids 0.

`npm run places:index:check`:

- Før: exit code 0, `places_index.json is in sync with source place files.`
- Etter: exit code 0, `places_index.json is in sync with source place files.`
- `places_index.json` måtte ikke sync-es, og `npm run places:index:build` ble derfor ikke kjørt.

`npm run health:places` før og etter:

- Før: exit code 0, Errors 0, Warnings 1113, Wrong-prefix emne_ids 4, Allowlisted cross-disciplinary emne_ids 217, Unknown emne_ids 0.
- Etter: exit code 0, Errors 0, Warnings 1110, Wrong-prefix emne_ids 1, Allowlisted cross-disciplinary emne_ids 217, Unknown emne_ids 0.

Gjenværende wrong-prefix etter Batch 36:

- `data/places/politikk/oslo/places_politikk.json #youngstorget`: `em_pop_digital_offentlighet` på `category: politikk`.

## Bekreftelser

- `tools/placeHealthReport.mjs` er ikke endret.
- `tools/check_place_emne_ids.mjs` er ikke endret.
- Ingen `data/fag/**`-filer er endret.
- Ingen canonical emne-filer er endret.
- `data/places/manifest.json` er ikke endret.
- Ingen UI-, CSS-, HTML-, JS- eller asset-filer er endret.
- Ingen ny allowlist er innført.
- `politikk → populaerkultur`, `natur → kunst` og `subkultur → naeringsliv` er ikke allowlistet.
- Ingen blind prefix-rewrite er gjort.

## Sluttvalidering på gjeldende branch

Etter at Batch 36-endringene allerede lå i arbeidskopien, ble kontrollene kjørt på nytt i denne arbeidsøkten for å bekrefte at resultatet fortsatt står på gjeldende branch:

- `npm run places:emner:check`: exit code 0, Missing emne_ids 0, Duplicate emne_ids 0, Duplicate place ids 0 og Duplicate canonical emne_ids 0.
- `npm run places:index:check`: exit code 0, `places_index.json is in sync with source place files.`
- `npm run health:places`: exit code 0, Errors 0, Warnings 1110, Wrong-prefix emne_ids 1, Allowlisted cross-disciplinary emne_ids 217 og Unknown emne_ids 0.

Denne revalideringen krevde ikke index-sync, og `places_index.json` ble ikke endret.

## Anbefalt Batch 37

Anbefalt Batch 37 er en smal policy-/emnemodell-vurdering av den siste gjenværende warningen på `youngstorget`: om politisk, mediert og digital offentlighet bør dekkes av et politikk-spesifikt canonical emne i stedet for `em_pop_digital_offentlighet`. Ikke innfør en bred `politikk → populaerkultur` allowlist uten flere tydelig dokumenterte eksempler.
