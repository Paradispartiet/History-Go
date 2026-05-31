# Oslo place-audit batch 26 — audit av `health:places` warnings

**Dato:** 2026-05-31

## Formål og avgrensning

Batch 26 er en audit-only rapport etter at Batch 25 fullførte missing-`emne_id`-oppryddingen. Rapporten kartlegger gjenværende `npm run health:places` warnings som beslutningsgrunnlag for Batch 27+, uten å endre data, emne-koblinger, manifest, index, scripts, UI eller bilder.

**Ingen datafikser er gjort i denne PR-en.** Kun denne rapportfilen er opprettet.

## Kommandoer kjørt

- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`
- `python3 - <<'PY' ...` — read-only parsing av `/tmp/health-places.txt`, `data/places/manifest.json` og aktive place-filer for å gruppere warnings per kategori, fil, place-id, bildefelt og wrong-prefix-par.
- `git status --short`

NPM skrev også `npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.` før hvert script. Det påvirket ikke exit code eller scriptresultatene.

## Filer og scripts undersøkt

- `package.json` — bekreftet script-navn: `places:emner:check`, `places:index:check`, `health:places`.
- `tools/check_place_emne_ids.mjs` — bekreftet emne-id-gaten som sjekker missing emne_ids, duplikate emne_ids per place, duplikate place-id-er og duplikate canonical emne_ids.
- `tools/check_places_index_sync.mjs` — kjørt via `npm run places:index:check`.
- `tools/placeHealthReport.mjs` — riktig health-script for `npm run health:places`.
- `data/places/manifest.json` — brukt read-only for å finne 40 aktive place-filer.
- Alle aktive place-filer deklarert i manifest — lest read-only for audit-gruppering.
- `reports/oslo-place-audit-batch-25-migrate-naeringsliv-legacy-emner.md` — brukt som Batch 25-baseline.
- Tidligere rapporter funnet ved søk etter `frontImage`, `cardImage`, `missing image`, `health:places`, `PlaceHealth` og `Wrong-prefix`, særlig eldre asset-/coverage-rapporter som beslutningsstøtte, men ingen av dem ble endret.

## Gate-status etter Batch 25

### `npm run places:emner:check`

Exit code: 0.

```text
=== Place emne_id validation ===
Active place files: 40
Canonical emne files scanned: 15
Canonical emne ids loaded: 995

Missing emne_ids: 0

Duplicate emne_ids within same place: 0

Duplicate place ids across active files: 0

Duplicate canonical emne_ids across canonical files: 0
```

Konklusjon: emne-id-gaten er grønn. Missing emne_ids, duplikate emne_ids per place, duplikate place-id-er og duplikate canonical emne_ids er alle 0.

### `npm run places:index:check`

Exit code: 0.

```text
places_index.json is in sync with source place files.
```

Konklusjon: `data/places/places_index.json` er grønn og i sync med aktive source place-filer.

### `npm run health:places`

Exit code: 0.

```text
History Go PlaceHealthReport
Files checked: 40
Places checked: 470
Hidden places: 0
Stub places: 0
Canonical emne files checked: 16
emne_ids checked: 1051
Canonical emne_ids: 1051
Unknown emne_ids: 0
Wrong-prefix emne_ids: 304
Errors: 0
Warnings: 1321
```

Konklusjon: `health:places` har ingen errors, men 1321 warnings. Alle 1051 place-emne-koblinger finnes i canonical registry; 304 av dem har prefix som ikke matcher place-kategorien.

## Full warning-oppsummering fra `health:places`

| Warning-kategori | Antall | Kommentar |
|---|---:|---|
| `missing cardImage` | 434 | `cardImage` mangler som felt eller er tom streng. Health-scriptet skiller ikke disse i selve warning-teksten, men read-only data-audit gjør det under bildeseksjonen. |
| `missing image` | 430 | `image` mangler som felt eller er tom streng. |
| Wrong-prefix `emne_ids` | 304 | Canonical emne_id finnes, men prefix matcher ikke place-kategorien. |
| `frontImage file not found` | 152 | 150 er tom streng i eksisterende `frontImage`-felt; 2 er konkrete paths som ikke finnes. |
| `popupImage file not found` | 1 | Ett tomt `popupImage`-felt valideres som path-not-found. |
| Missing/weak `popupDesc` | 0 | Ingen warnings fra health-scriptet i nåværende kjøring. |
| Missing/weak `desc` | 0 | Ingen warnings fra health-scriptet i nåværende kjøring. |
| Missing coordinates | 0 | Ugyldig/manglende lat/lon ville vært errors, ikke warnings; `Errors: 0`. |
| Missing `quiz_profile` fields | 0 | Ikke validert av `tools/placeHealthReport.mjs` i dagens health-script. |
| Category/subcategory mismatch | 0 | Invalid category ville vært errors; ingen subcategory-mismatch-regel i dagens health-script. |
| Other warning categories | 0 | Ingen `year should be numeric`, unknown emne_ids eller andre warning-typer i output. |

## Topp berørte place-filer

Målt på totalt antall `health:places` warnings per fil:

| Rank | Warnings | Fil |
|---:|---:|---|
| 1 | 165 | `data/places/by/oslo/places_by.json` |
| 2 | 143 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| 3 | 83 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| 4 | 80 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| 5 | 73 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| 6 | 54 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| 7 | 49 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| 8 | 46 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| 9 | 42 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| 10 | 40 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| 11 | 38 | `data/places/litteratur/oslo/places_litteratur.json` |
| 12 | 33 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| 13 | 30 | `data/places/sport/oslo/places_sport.json` |
| 14 | 30 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| 15 | 30 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |

Hovedmønster: Oslo `by`, Oslo `naeringsliv`, Oslo Akerselva/natur og Lisboa-filene står for mesteparten av warning-volumet.

## Topp berørte place-id-er

Målt på totalt antall warnings per place-id:

| Warnings | Fil | Place-id |
|---:|---|---|
| 8 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | `lisbon_praca_marques_de_pombal` |
| 8 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_cordoaria_nacional` |
| 8 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_doca_de_alcantara` |
| 8 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | `lisbon_monsanto` |
| 7 | `data/places/by/oslo/places_by.json` | `barcode` |
| 7 | `data/places/by/oslo/places_by.json` | `sagene` |
| 7 | `data/places/by/oslo/places_by.json` | `kampen` |
| 7 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | `lisbon_praca_dos_restauradores` |
| 7 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_lx_factory` |
| 7 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_mercado_da_ribeira` |
| 7 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_parque_das_nacoes` |
| 7 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | `lisbon_jardim_botanico` |
| 7 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | `lisbon_tapada_das_necessidades` |
| 7 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | `lisbon_miradouro_sao_pedro_de_alcantara` |
| 7 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | `lisbon_miradouro_da_graca` |

Disse topp-plassene kombinerer som regel 2–3 bildewarnings med flere wrong-prefix emne_ids.

## Kategorisering av warnings og anbefalt håndtering

| Kategori | Antall | Mest berørte filer | Trygg automatikk? | Redaksjonell vurdering? | Bør batch-es etter |
|---|---:|---|---|---|---|
| `missing image` | 430 | `places_by.json` 63, `places_naeringsliv.json` 28, `places_lisbon_by.json` 26, `places_oslo_natur_akerselvarute.json` 23, `places_lisbon_historie.json` 20 | Delvis: bare hvis det finnes deterministisk, eksisterende asset-kandidat. Ikke sett placeholder ukritisk. | Ja, for valg av riktig motiv, lisens og representasjon. | Først per stedsfil eller by/fagfamilie. |
| `missing cardImage` | 434 | Samme hovedmønster som `missing image`: `places_by.json` 63, `places_naeringsliv.json` 28, `places_lisbon_by.json` 26, `places_oslo_natur_akerselvarute.json` 23, `places_lisbon_historie.json` 20 | Delvis: kan speile `image` bare der etablert praksis tilsier samme asset og filen finnes. | Ja, fordi kortbilde kan ha annet utsnitt/formål enn hovedbilde. | Sammen med `image` per fil. |
| `frontImage file not found` | 152 | Lisboa by 26, Lisboa historie 20, Lisboa kunst 14, Lisboa litteratur 11, Lisboa natur 11, Lisboa vitenskap 10 | Delvis: tomme `frontImage: ""` kan i senere fix-batch enten fjernes eller fylles, men valg må standardiseres først. | Ja, hvis frontImage skal fylles med ekte hero-bilde. | Først som egen bildefelt-normalisering, deretter asset-fyll. |
| `popupImage file not found` | 1 | `data/places/naeringsliv/oslo/places_naeringsliv.json` | Ja: tomt felt kan normaliseres etter samme regel som andre tomme bildefelt. | Lite, hvis regel er å fjerne tomme optional-felt. | Kan tas sammen med bildefelt-normalisering. |
| Wrong-prefix `emne_ids` | 304 | `places_naeringsliv.json` 86, `places_by.json` 37, `places_oslo_natur_akerselvarute.json` 34, `places_litteratur.json` 30, Lisboa næringsliv 22, Lisboa natur 21 | Nei, ikke som blind prefix-rewrite. Alle ID-er finnes canonical og kan være bevisste tverrfaglige koblinger. | Ja, høy. Må avgjøre om koblingen er tilsiktet tverrfaglig, feil kategori eller legacy prefixdrift. | Egen Batch 27 anbefales. |

## Konkrete eksempler per warning-kategori

### `missing image`

- `data/places/by/oslo/places_by.json #torggata: missing image`
- `data/places/by/oslo/places_by.json #bispelokket: missing image`
- `data/places/by/oslo/places_by.json #gronland_basarene: missing image`
- `data/places/by/oslo/places_by.json #karl_johan: missing image`
- `data/places/by/oslo/places_by.json #radhusplassen: missing image`
- `data/places/by/oslo/places_by.json #bjorvika: missing image`
- `data/places/by/oslo/places_by.json #ring_3: missing image`
- `data/places/by/oslo/places_by.json #trikk_17_18: missing image`
- `data/places/by/oslo/places_by.json #grunerlokka_helgesens_tm: missing image`
- `data/places/by/oslo/places_by.json #toyen_torg: missing image`

### `missing cardImage`

- `data/places/by/oslo/places_by.json #torggata: missing cardImage`
- `data/places/by/oslo/places_by.json #bispelokket: missing cardImage`
- `data/places/by/oslo/places_by.json #gronland_basarene: missing cardImage`
- `data/places/by/oslo/places_by.json #karl_johan: missing cardImage`
- `data/places/by/oslo/places_by.json #radhusplassen: missing cardImage`
- `data/places/by/oslo/places_by.json #bjorvika: missing cardImage`
- `data/places/by/oslo/places_by.json #ring_3: missing cardImage`
- `data/places/by/oslo/places_by.json #trikk_17_18: missing cardImage`
- `data/places/by/oslo/places_by.json #grunerlokka_helgesens_tm: missing cardImage`
- `data/places/by/oslo/places_by.json #toyen_torg: missing cardImage`

### `frontImage file not found`

- `data/places/by/oslo/places_by.json #torggata: frontImage file not found (bilder/kort/places/by/torggata_Front.WEBP)`
- `data/places/by/oslo/places_by.json #bispelokket: frontImage file not found (bilder/kort/places/by/bispelokket_Front.WEBP)`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_city: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_praca_do_comercio: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_alfama: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_elevador_de_santa_justa: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_ponte_25_de_abril: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_rossio: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_avenida_da_liberdade: frontImage file not found ()`
- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json #lisbon_parque_eduardo_vii: frontImage file not found ()`

### `popupImage file not found`

- `data/places/naeringsliv/oslo/places_naeringsliv.json #vinmonopolet_lager: popupImage file not found ()`

### Wrong-prefix `emne_ids`

- `data/places/by/oslo/places_by.json #radhusplassen: emne_id "em_pop_ikoniske_oyeblikk" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #radhusplassen: emne_id "em_pop_digital_offentlighet" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #bjorvika: emne_id "em_pop_kino_populaer_offentlighet" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #bjorvika: emne_id "em_pop_film_tv_format" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #toyen_torg: emne_id "em_pop_fellesskap_tilhorighet" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #toyen_torg: emne_id "em_pop_deltakelse_remix" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #majorstuen_krysset: emne_id "em_pop_aktualitet_trend" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #majorstuen_krysset: emne_id "em_pop_digital_offentlighet" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #oslo_s: emne_id "em_pop_publikum_rytme_vaner" does not match category "by" expected prefix "em_by_"`
- `data/places/by/oslo/places_by.json #oslo_s: emne_id "em_pop_aktualitet_trend" does not match category "by" expected prefix "em_by_"`

## Egen seksjon: wrong-prefix `emne_ids`

### Status

- Totalt: 304 wrong-prefix warnings.
- `Unknown emne_ids: 0`, så dette er ikke lenger missing canonical-problem.
- Alle wrong-prefix-ID-er er eksisterende canonical registry-ID-er, men health-scriptet forventer at place-kategorien og emne-id-prefixet matcher én-til-én.

### Prefix-par sortert etter faktisk par

| Prefix-par | Antall | Foreløpig audit-vurdering |
|---|---:|---|
| `naeringsliv→naeringsliv-legacy-prefix` (`em_naer_*`) | 67 | Legacy prefixdrift. Canonical finnes, men health forventer `em_naering_*`. Bør undersøkes som egen næringsliv-prefixpolicy, ikke blind-rettes i place-data. |
| `natur→by` | 34 | Ofte sannsynlig tverrfaglig byrom/natur-infrastruktur. Krever redaksjonell vurdering. |
| `litteratur→by` | 30 | Sannsynlig stedlig/litterær bykobling. Krever redaksjonell vurdering. |
| `naeringsliv→by` | 28 | Kan være byøkonomi, havn, logistikk eller transformasjon. Delvis tverrfaglig, delvis mulig category drift. |
| `historie→by` | 25 | Ofte bevisst tverrfaglig kobling til byutvikling/stedsminne. Krever gjennomgang. |
| `by→populaerkultur` | 24 | Kan være bevisst tverrfaglig offentlighet/populærkultur. Bør vurderes per place. |
| `naeringsliv→historie` | 13 | Ofte historiske næringslivsinstitusjoner. Trolig tverrfaglig, men bør vurderes. |
| `politikk→historie` | 11 | Trolig bevisst historisk-politisk kobling. Beholdes hvis intent er tydelig. |
| `by→film_tv` | 10 | Kan være medie-/filmrelatert byrom. Manuell vurdering. |
| `by→kunst` | 9 | Kan være offentlig kunst/arkitektur/byrom. Manuell vurdering. |
| `natur→historie` | 7 | Kan være kulturminne/naturhistorie. Manuell vurdering. |
| `subkultur→by` | 7 | Ofte scene/byrom/gentrifisering. Trolig tverrfaglig. |
| `historie→kunst` | 6 | Arkitektur/museum/kunsthistorie; trolig tverrfaglig. |
| `populaerkultur→film_tv` | 5 | Sannsynlig bevisst tverrfaglig eller fagfamilie-overlapp. |
| `by→historie` | 5 | Trolig tverrfaglig. |
| `politikk→by` | 4 | Trolig tverrfaglig offentlig rom/makt. |
| `kunst→by` | 4 | Trolig institusjon/transformasjon/byrom. |
| `psykologi→<unknown prefix>` (`em_psy_*`) | 3 | Prefixpolicy-drift: health forventer `em_psykologi_*`, mens canonical registry har `em_psy_*`. Ikke place-fiks før policy er avklart. |
| `kunst→historie` | 3 | Tverrfaglig museum/kulturminne. |
| `subkultur→musikk` | 3 | Trolig bevisst scene-/musikkkobling. |
| `politikk→populaerkultur` | 2 | Må vurderes manuelt. |
| `subkultur→historie` | 1 | Må vurderes manuelt. |
| `subkultur→kunst` | 1 | Må vurderes manuelt. |
| `subkultur→naeringsliv-legacy-prefix` (`em_naer_*`) | 1 | Kombinerer tverrfaglighet og legacy-prefixpolicy. |
| `natur→kunst` | 1 | Må vurderes manuelt. |

### Topp filer for wrong-prefix

| Wrong-prefix warnings | Fil |
|---:|---|
| 86 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| 37 | `data/places/by/oslo/places_by.json` |
| 34 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| 30 | `data/places/litteratur/oslo/places_litteratur.json` |
| 22 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| 21 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| 15 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| 13 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| 13 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| 7 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |

### Topp place-id-er for wrong-prefix

| Wrong-prefix warnings | Fil | Place-id |
|---:|---|---|
| 5 | `data/places/by/oslo/places_by.json` | `barcode` |
| 5 | `data/places/by/oslo/places_by.json` | `sagene` |
| 5 | `data/places/by/oslo/places_by.json` | `kampen` |
| 5 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | `lisbon_praca_marques_de_pombal` |
| 5 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_cordoaria_nacional` |
| 5 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_doca_de_alcantara` |
| 5 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | `lisbon_monsanto` |
| 4 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | `lisbon_praca_dos_restauradores` |
| 4 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_lx_factory` |
| 4 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | `lisbon_mercado_da_ribeira` |

### Foreløpig sortering etter type

- **Bevisst tverrfaglig kobling:** mange `natur→by`, `historie→by`, `politikk→historie`, `subkultur→musikk`, `kunst→historie`, `by→kunst` og `populaerkultur→film_tv`-tilfeller. Disse bør ikke automatisk fjernes bare fordi prefixet er annerledes.
- **Sannsynlig feil kategori eller kategori-drift:** enkeltplaces med mange by-/historie-/næringsliv-koblinger i en annen kategori bør vurderes per place. Topp-listen over place-id-er er best startpunkt.
- **Legacy prefixdrift:** `em_naer_*` under næringsliv og `em_psy_*` under psykologi tyder på prefixpolicy som health-scriptet ikke harmonerer med. Dette bør avklares før dataendringer.
- **Bør undersøkes manuelt:** alle små par med 1–4 forekomster, særlig der koblingen ikke åpenbart forklares av stedets rolle.

### Anbefaling for senere håndtering

Ikke gjør blind prefix-rewrite i place-data. Anbefalt rekkefølge:

1. Lag en read-only wrong-prefix decision-rapport per fil/fagfamilie med place-id, category, emne_id, canonical-fil og emnetittel.
2. Avklar policy: skal health tillate deklarerte tverrfaglige emne_ids, eller skal hvert place kun ha category-matchende emne_ids?
3. Avklar legacy-prefixpolicy for `em_naer_*` og `em_psy_*` mot canonical-filer før place-fikser.
4. Først etter policy: kjør små, reviewbare batcher per fil/fagfamilie. Skill mellom `behold som tverrfaglig`, `bytt til category-matchende emne`, `endre place category`, og `fjern kobling`.

## Egen seksjon: image/frontImage/cardImage

### Health-warningstatus

- `missing image`: 430
- `missing cardImage`: 434
- `frontImage file not found`: 152
- `popupImage file not found`: 1
- Totalt bilde-/asset-relaterte warnings: 1017 av 1321 warnings.

### Feltstatus i aktive place-filer

Read-only audit av faktiske feltverdier viser:

| Felt | Mangler felt | Tom verdi | Path finnes ikke | Path finnes | Health-relevant merknad |
|---|---:|---:|---:|---:|---|
| `image` | 199 | 231 | 0 | 40 | Health rapporterer både manglende felt og tom verdi som `missing image`. |
| `cardImage` | 199 | 235 | 0 | 36 | Health rapporterer både manglende felt og tom verdi som `missing cardImage`. |
| `frontImage` | 317 | 150 | 2 | 1 | Manglende optional-felt gir ikke warning; tom verdi og ikke-finnes path gir `frontImage file not found`. |
| `popupImage` | 469 | 1 | 0 | 0 | Manglende optional-felt gir ikke warning; tom verdi gir `popupImage file not found`. |

Det ble ikke funnet case-insensitive filtreff for de ikke-finnende bildepayloadene i denne auditen. De to konkrete `frontImage`-pathene i Oslo by ser derfor ikke ut som rene casing-feil basert på eksisterende filtre.

### Tomme bildefelt vs manglende felt

- `image`: 231 tomme verdier og 199 manglende felt.
- `cardImage`: 235 tomme verdier og 199 manglende felt.
- `frontImage`: 150 tomme verdier, 317 manglende felt og 2 ikke-finnende paths.
- `popupImage`: 1 tom verdi og 469 manglende felt.

Forskjellen er viktig: `frontImage` og `popupImage` er optional i health-scriptet når feltet mangler helt, men gir warning når feltet finnes med tom streng. En senere safe-normalisering kan derfor redusere warnings uten å velge nye bilder, men bare hvis prosjektet godkjenner regelen om å fjerne tomme optional image-felt eller sette dem til fravær.

### Topp filer for `missing image` og `missing cardImage`

Begge kategoriene har nesten identisk toppmønster:

| Warnings | Fil |
|---:|---|
| 63 | `data/places/by/oslo/places_by.json` |
| 28 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| 26 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| 23 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| 20 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| 15 | `data/places/sport/oslo/places_sport.json` |
| 15 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| 14 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| 13/12 | `data/places/subkultur/oslo/places_subkultur.json` (`image` 13, `cardImage` 12) |
| 12 | `data/places/vitenskap/oslo/places_vitenskap.json` |

### Topp filer for `frontImage file not found`

| Warnings | Fil |
|---:|---|
| 26 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| 20 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| 14 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| 11 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| 11 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| 10 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| 9 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| 9 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| 8 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| 8 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |

### Mulige casing-/filnavnfeil

- `data/places/by/oslo/places_by.json #torggata` peker til `bilder/kort/places/by/torggata_Front.WEBP`, men pathen finnes ikke.
- `data/places/by/oslo/places_by.json #bispelokket` peker til `bilder/kort/places/by/bispelokket_Front.WEBP`, men pathen finnes ikke.
- Case-insensitive søk fant ikke eksisterende asset med samme path i annen casing. Dette peker mer mot manglende asset eller feil filnavn enn ren casing-feil.

### Steder der bilde kanskje bevisst mangler

Audit kan ikke skille intensjon fra mangel. Følgende mønstre bør behandles varsomt:

- Steder med historisk, sensitiv eller abstrakt tematikk kan trenge redaksjonelt valgt bilde heller enn automatisk generisk bilde.
- Lisboa-filene har mange tomme bildefelt på tvers av fagfamilier, som kan bety import-/scaffold-status snarere enn konkret assetfeil.
- Oslo by og Oslo næringsliv har mange manglende `image`/`cardImage`; disse bør prioriteres fordi de påvirker eksisterende Oslo-opplevelse bredt.

### Anbefalt første trygge bildebølge

1. **Normaliser tomme optional-felt først:** vurder en liten batch som fjerner eller standardiserer `frontImage: ""` og `popupImage: ""` der feltet er optional og health bare klager fordi tom streng tolkes som path. Dette bør gjøres først som egen regelbasert batch, ikke sammen med nye assets.
2. **Verifiser eksisterende assets før nye bilder:** for `image`/`cardImage`, finn kun eksisterende, lisensierte, korrekt navngitte assets og koble dem deterministisk der matchen er åpenbar.
3. **Start med høy-volum Oslo-filer:** `data/places/by/oslo/places_by.json` og `data/places/naeringsliv/oslo/places_naeringsliv.json` gir størst warningreduksjon og høy brukerflate.
4. **Ta Lisboa som egen scaffold-/asset-bølge:** Lisboa-filene har bredt mønster av tomme bildefelt og bør håndteres samlet per by/fagfamilie etter assetpolicy.
5. **Ikke bruk placeholder-bilder ukritisk:** det kan redusere warnings, men svekke kvalitet og redaksjonell presisjon.

## Hva er trygt å fikse automatisk senere?

Trygt eller delvis trygt etter eksplisitt policy:

- Fjerne eller normalisere tomme optional `frontImage`/`popupImage`-felt der manglende felt allerede er warning-fritt i health-scriptet.
- Koble `image` og `cardImage` til eksisterende asset bare der path kan bevises deterministisk og filen finnes.
- Eventuell synk av `cardImage` fra `image` bare for filgrupper der dette allerede er etablert konvensjon.
- Lage read-only decision-rapporter med canonical emne-titler for wrong-prefix før faktiske dataendringer.

Ikke trygt som blind automatikk:

- Bytte wrong-prefix emne_ids til category-matchende emne_ids uten redaksjonell vurdering.
- Fjerne tverrfaglige emne_ids bare fordi prefixet ikke matcher.
- Endre place category for å få prefix til å passe.
- Sette generiske placeholders i `image`/`cardImage` for å få health grønn.
- Endre manifest, index eller schema for å undertrykke warnings uten innholdsbeslutning.

## Hva krever redaksjonell vurdering?

- Alle wrong-prefix emne_ids som kan være bevisste tverrfaglige koblinger.
- Næringsliv `em_naer_*` og psykologi `em_psy_*` prefixpolicy, fordi dette ser ut som canonical-/health-konvensjonsdrift mer enn enkeltplacefeil.
- Valg av bilde, motiv, lisens og utsnitt for `image`, `cardImage` og eventuelle `frontImage`.
- Om Lisboa-filene skal behandles som scaffold-import med samlet assetløft eller som ordinære enkeltfikser.
- Om `frontImage` skal være optional/fraværende eller obligatorisk for bestemte place-typer.

## Anbefalt Batch 27

Anbefalt Batch 27: **wrong-prefix decision audit, ikke datafix**.

Begrunnelse:

- Wrong-prefix er nå største ikke-bildekategori og kan ikke løses trygt med mekanisk rewrite.
- `Unknown emne_ids: 0` betyr at grunnlaget er stabilt nok til å analysere intent uten samtidig missing-ID-støy.
- En beslutningsrapport bør liste hvert wrong-prefix-tilfelle med place-id, place category, emne_id, actual prefix/fag, canonical kildefil og anbefalt handling: `behold tverrfaglig`, `bytt emne`, `fjern kobling`, `endre place category`, eller `policyavklaring`.

Alternativ Batch 27 dersom målet er rask warningreduksjon: **bildefelt-normalisering for tomme optional `frontImage`/`popupImage`-felt**, men kun etter eksplisitt policy om at fraværende optional-felt er foretrukket fremfor tom streng.

## Bekreftelse: ingen datafiler endret

Denne batchen endret ikke:

- `data/places/**`
- `data/fag/**`
- `data/places/places_index.json`
- `data/places/manifest.json`
- manifest, UI, CSS, HTML, JS, scripts/tools eller bilder
- `emne_ids`
- alias-schema

Kun `reports/oslo-place-audit-batch-26-health-warnings-audit.md` er opprettet.
