# Batch 46: asset-warning path audit for place images

Dato: 2026-06-01

## Formål

Denne batchen er en read-only asset-audit av image-/cardImage-/frontImage-/popupImage-warningene i `npm run health:places` etter Batch 45-baseline. Målet er å skille faktisk manglende assets fra feil filsti, casing, filendelse, nær-match i repo, mulige fallback-felt og steder som sannsynligvis trenger ny bildeproduksjon.

Denne rapporten gjør ingen retting. Den endrer ikke place-data, index, canonical-filer, scripts/tools, manifest, UI eller assets.

## Kommandoer kjørt

```bash
npm run health:places | tee /tmp/health_places_batch46.txt
npm run places:emner:check | tee /tmp/places_emner_batch46.txt
npm run places:index:check | tee /tmp/places_index_batch46.txt
node /tmp/audit_assets_batch46.mjs
npm run health:places
npm run places:emner:check
npm run places:index:check
```

`/tmp/audit_assets_batch46.mjs` var et lokalt, ikke-committet analyseverktøy brukt for å lese aktive place-filer og søke i asset-mappene. Det er ikke lagt til i repoet.

## Baseline etter Batch 45

| Kontrollpunkt | Resultat |
| --- | ---: |
| `health:places` files checked | 40 |
| `health:places` places checked | 459 |
| Hidden places | 0 |
| Stub places | 0 |
| Canonical emne files checked | 16 |
| emne_ids checked | 1032 |
| Canonical emne_ids | 1032 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Allowlisted cross-disciplinary emne_ids | 187 |
| `health:places` errors | 0 |
| `health:places` warnings | 1088 |
| `places:emner:check` | OK |
| Duplicate place ids across active files | 0 |
| `places:index:check` | OK |
| Missing emne_ids | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |

`places:emner:check` rapporterte 40 aktive place-filer, 15 canonical emne-filer scannet, 996 canonical emne ids lastet, 0 missing emne_ids, 0 duplicate emne_ids innen samme place, 0 duplicate place ids og 0 duplicate canonical emne_ids. `places:index:check` rapporterte at `places_index.json` er synkron med source place files.

## Metode for asset-audit

Auditmetoden var read-only:

1. Leste `reports/oslo-place-audit-batch-44-health-warnings-classification.md` for tidligere warning-gruppering.
2. Leste `tools/placeHealthReport.mjs` for faktisk health-logikk: `image` og `cardImage` gir warning når felt mangler eller asset path ikke finnes; `frontImage` og `popupImage` gir warning når feltet finnes, men path ikke finnes.
3. Leste `data/places/manifest.json` og itererte kun aktive place-filer fra manifestet.
4. Leste hvert place-objekt uten å skrive tilbake.
5. Samlet `image`, `cardImage`, `frontImage` og `popupImage` per aktivt, ikke-skjult og ikke-stub sted.
6. Sjekket eksakt path-eksistens fra repo-root.
7. Indekserte bildeassets under `bilder/**`, med særlig vekt på `bilder/places/**` og `bilder/kort/places/**`.
8. Søkte nær-match etter:
   - samme basename,
   - samme basename med annen casing,
   - samme basename/stem med annen filendelse,
   - samme place-id-token i `bilder/places/**`,
   - samme place-id-token i `bilder/kort/places/**`,
   - manglende `cardImage` der `image` allerede finnes som mulig fallback.
9. Klassifiserte funn i:
   - `exact_missing_no_match`,
   - `case_mismatch_candidate`,
   - `extension_mismatch_candidate`,
   - `directory_mismatch_candidate`,
   - `basename_match_candidate`,
   - `field_missing_but_possible_existing_asset`,
   - `field_missing_no_asset_found`.

## Totalt antall image-/card-/front-/popup-warnings

| Måling | Antall |
| --- | ---: |
| Total health warnings | 1088 |
| Image-relaterte warnings analysert i denne batchen | 996 |
| Ikke-image-relaterte warnings holdt utenfor denne batchen | 92 |

De 92 warningene utenfor denne audit-batchen er legacy-/secondary category-informasjon og er bevisst ikke rørt her.

## Fordeling per field

| Felt | Antall warnings |
| --- | ---: |
| `image` | 420 |
| `cardImage` | 423 |
| `frontImage` | 152 |
| `popupImage` | 1 |
| **Totalt** | **996** |

## Fordeling per warning-type fra health-output

| Warning-type | Antall |
| --- | ---: |
| `missing image` | 371 |
| `image file not found` | 49 |
| `missing cardImage` | 375 |
| `cardImage file not found` | 48 |
| `frontImage file not found` | 152 |
| `popupImage file not found` | 1 |
| **Totalt** | **996** |

## Fordeling per audit-kategori

| Audit-kategori | Tolkning | Antall felt-warnings |
| --- | --- | ---: |
| `case_mismatch_candidate` | Path ser ut til å kunne løses kun med casing-endring | 0 |
| `extension_mismatch_candidate` | Samme directory/stem finnes med annen filendelse og/eller casing | 1 |
| `directory_mismatch_candidate` | Samme filnavn finnes i annen directory | 2 |
| `basename_match_candidate` | Nær-match finnes via basename/place-token, men krever manuell vurdering | 4 |
| `field_missing_but_possible_existing_asset` | Felt mangler, men et eksisterende bilde kan kanskje brukes som fallback | 5 |
| `exact_missing_no_match` | Felt peker til en path som ikke finnes, og audit fant ingen trygg nær-match | 243 |
| `field_missing_no_asset_found` | Felt mangler, og audit fant ingen asset-kandidat | 741 |
| **Totalt** |  | **996** |

## Operasjonell gruppering for fix-planlegging

| Fix-gruppe | Audit-kategorier | Antall felt-warnings | Vurdering |
| --- | --- | ---: | --- |
| likely path fix | `directory_mismatch_candidate`, `basename_match_candidate` | 6 | Lavest risiko, men basename-funn bør verifiseres manuelt. |
| likely casing fix | `case_mismatch_candidate` | 0 | Ingen rene casing-funn i denne kjøringen. |
| likely extension fix | `extension_mismatch_candidate` | 1 | Lav risiko, men `Voienvolden.JPG` bør visuelt/verdimessig bekreftes før rewrite. |
| likely should use existing image fallback | `field_missing_but_possible_existing_asset` | 5 | Mulig policy-/datafix for manglende `cardImage`; bør ikke blandes med path-fix i første batch. |
| actual asset production needed / remove invalid optional field | `exact_missing_no_match`, `field_missing_no_asset_found` | 984 | Største gruppe; bør ikke startes som bulk-produksjon i Batch 47. |

Merk: `frontImage file not found ()` for Lisboa-filene er klassifisert som `exact_missing_no_match` når feltet finnes, men er tomt. Dette er ikke en asset som finnes med feil path; det er sannsynligvis enten et optional-felt som bør fjernes/normaliseres i en senere data-batch, eller et sted som trenger ny front-image-produksjon.

## Fordeling per place-fil og kategori

| Place-fil | Totalt | Directory | Basename | Extension | Existing image fallback | Exact missing | Missing field / no asset |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `data/places/by/oslo/places_by.json` | 107 | 2 | 4 | 1 | 0 | 92 | 8 |
| `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` | 78 | 0 | 0 | 0 | 0 | 26 | 52 |
| `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` | 60 | 0 | 0 | 0 | 0 | 20 | 40 |
| `data/places/naeringsliv/oslo/places_naeringsliv.json` | 57 | 0 | 0 | 0 | 0 | 1 | 56 |
| `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` | 46 | 0 | 0 | 0 | 0 | 0 | 46 |
| `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` | 42 | 0 | 0 | 0 | 0 | 14 | 28 |
| `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` | 33 | 0 | 0 | 0 | 0 | 11 | 22 |
| `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | 33 | 0 | 0 | 0 | 0 | 11 | 22 |
| `data/places/sport/oslo/places_sport.json` | 30 | 0 | 0 | 0 | 0 | 0 | 30 |
| `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | 30 | 0 | 0 | 0 | 0 | 0 | 30 |
| `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` | 30 | 0 | 0 | 0 | 0 | 10 | 20 |
| `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | 27 | 0 | 0 | 0 | 0 | 9 | 18 |
| `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | 27 | 0 | 0 | 0 | 0 | 9 | 18 |
| `data/places/subkultur/oslo/places_subkultur.json` | 25 | 0 | 0 | 0 | 0 | 0 | 25 |
| `data/places/vitenskap/oslo/places_vitenskap.json` | 24 | 0 | 0 | 0 | 0 | 0 | 24 |
| `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | 24 | 0 | 0 | 0 | 0 | 8 | 16 |
| `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` | 24 | 0 | 0 | 0 | 0 | 8 | 16 |
| `data/places/sport/ostlandet/places_motorsport_ostlandet.json` | 22 | 0 | 0 | 0 | 0 | 0 | 22 |
| `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` | 21 | 0 | 0 | 0 | 0 | 7 | 14 |
| `data/places/historie/oslo/places_historie.json` | 20 | 0 | 0 | 0 | 0 | 0 | 20 |
| `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | 18 | 0 | 0 | 0 | 0 | 0 | 18 |
| `data/places/popkultur/oslo/places_oslo_populaerkultur.json` | 18 | 0 | 0 | 0 | 0 | 0 | 18 |
| `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` | 18 | 0 | 0 | 0 | 0 | 6 | 12 |
| `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` | 18 | 0 | 0 | 0 | 0 | 6 | 12 |
| `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` | 16 | 0 | 0 | 0 | 0 | 0 | 16 |
| `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` | 15 | 0 | 0 | 0 | 0 | 5 | 10 |
| `data/places/historie/oslo/places_historie_added_batch_01.json` | 14 | 0 | 0 | 0 | 0 | 0 | 14 |
| `data/places/natur/oslo/places_oslo_alna.json` | 14 | 0 | 0 | 0 | 0 | 0 | 14 |
| `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` | 14 | 0 | 0 | 0 | 0 | 0 | 14 |
| `data/places/media/oslo/places_oslo_media.json` | 12 | 0 | 0 | 0 | 0 | 0 | 12 |
| `data/places/musikk/oslo/places_musikk.json` | 12 | 0 | 0 | 0 | 0 | 0 | 12 |
| `data/places/natur/oslo/places_oslo_natur_bygdoy.json` | 12 | 0 | 0 | 0 | 0 | 0 | 12 |
| `data/places/politikk/oslo/places_politikk.json` | 12 | 0 | 0 | 0 | 0 | 0 | 12 |
| `data/places/film/oslo/places_oslo_film.json` | 10 | 0 | 0 | 0 | 0 | 0 | 10 |
| `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` | 10 | 0 | 0 | 0 | 0 | 0 | 10 |
| `data/places/litteratur/oslo/places_litteratur.json` | 8 | 0 | 0 | 0 | 4 | 0 | 4 |
| `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` | 8 | 0 | 0 | 0 | 0 | 0 | 8 |
| `data/places/kunst/oslo/places_kunst.json` | 5 | 0 | 0 | 0 | 1 | 0 | 4 |
| `data/places/psykologi/oslo/places_psykologi.json` | 2 | 0 | 0 | 0 | 0 | 0 | 2 |

## Sikre og mulige path-fix-kandidater

Følgende er de eneste funnene der repoet allerede inneholder en kandidatasset. De skal ikke endres i denne batchen, men er aktuelle for en separat fix-batch.


### case_mismatch_candidate (0)
| Place-fil | id | Felt | Referanse | Kandidat(er) |
| --- | --- | --- | --- | --- |

### extension_mismatch_candidate (1)
| Place-fil | id | Felt | Referanse | Kandidat(er) |
| --- | --- | --- | --- | --- |
| `data/places/by/oslo/places_by.json` | `voienvolden` | `image` | `bilder/places/voienvolden.PNG` | `bilder/places/Voienvolden.JPG`<br>`bilder/kort/places/voienvolden.PNG` |

### directory_mismatch_candidate (2)
| Place-fil | id | Felt | Referanse | Kandidat(er) |
| --- | --- | --- | --- | --- |
| `data/places/by/oslo/places_by.json` | `torggata` | `image` | `bilder/places/torggata_IMG.JPG` | `bilder/places/by/torggata_IMG.JPG`<br>`bilder/places/by/torggata_Front.WEBP` |
| `data/places/by/oslo/places_by.json` | `torggata` | `frontImage` | `bilder/kort/places/by/torggata_Front.WEBP` | `bilder/places/by/torggata_Front.WEBP`<br>`bilder/places/by/torggata_IMG.JPG` |

### basename_match_candidate (4)
| Place-fil | id | Felt | Referanse | Kandidat(er) |
| --- | --- | --- | --- | --- |
| `data/places/by/oslo/places_by.json` | `torggata` | `cardImage` | `bilder/kort/places/by/torggata_CardImage.PNG` | `bilder/places/by/torggata_Front.WEBP`<br>`bilder/places/by/torggata_IMG.JPG` |
| `data/places/by/oslo/places_by.json` | `bogstadveien` | `cardImage` | `bilder/kort/places/bogstadveien.PNG` | `bilder/QuizCards/Bogstadveien.PNG` |
| `data/places/by/oslo/places_by.json` | `barcode` | `image` | `bilder/places/barcode.PNG` | `bilder/QuizCards/Barcode.PNG` |
| `data/places/by/oslo/places_by.json` | `barcode` | `cardImage` | `bilder/kort/places/barcode.PNG` | `bilder/QuizCards/Barcode.PNG` |

### field_missing_but_possible_existing_asset (5)
| Place-fil | id | Felt | Referanse | Kandidat(er) |
| --- | --- | --- | --- | --- |
| `data/places/kunst/oslo/places_kunst.json` | `munch_museet` | `cardImage` | `(mangler)` | `bilder/places/kunst/Munch_liggende.JPG` |
| `data/places/litteratur/oslo/places_litteratur.json` | `camilla_collett_statue` | `cardImage` | `(mangler)` | `bilder/places/camilla_collett_statue.JPG` |
| `data/places/litteratur/oslo/places_litteratur.json` | `tronsmo_bokhandel` | `cardImage` | `(mangler)` | `bilder/places/Tronsmo.JPG` |
| `data/places/litteratur/oslo/places_litteratur.json` | `sigrid_undset_statue` | `cardImage` | `(mangler)` | `bilder/places/Sigrid_Undset_statuen.JPG` |
| `data/places/litteratur/oslo/places_litteratur.json` | `ruth_maier_minne` | `cardImage` | `(mangler)` | `bilder/places/Ruth_Meiers_plass.JPG` |

## Felt som mangler asset fullstendig

Denne listen samler felt som enten peker til en ikke-eksisterende path uten nær-match, eller mangler feltverdi uten at audit fant kandidatasset. Dette er ikke en instruks om å produsere alt i én batch; det er en kø for senere produksjon, validering eller optional-felt-normalisering.


### Eksisterende referansefelt uten nær-match (`exact_missing_no_match`)

- `data/places/by/oslo/places_by.json` (46 steder)
  - `bispelokket` (image=bilder/places/bispelokket_IMG.JPG, cardImage=bilder/kort/places/by/bispelokket_CardImage.PNG, frontImage=bilder/kort/places/by/bispelokket_Front.WEBP); `gronland_basarene` (image=bilder/places/gronland_basarene.JPG, cardImage=bilder/kort/places/gronland_basarene.PNG); `karl_johan` (image=bilder/places/karl_johan.JPG, cardImage=bilder/kort/places/karl_johan.PNG); `radhusplassen` (image=bilder/places/radhusplassen.JPG, cardImage=bilder/kort/places/radhusplassen.PNG); `bjorvika` (image=bilder/places/bjorvika.JPG, cardImage=bilder/kort/places/bjorvika.PNG); `ring_3` (image=bilder/places/ring_3.JPG, cardImage=bilder/kort/places/ring_3.PNG); `trikk_17_18` (image=bilder/places/trikk_17_18.JPG, cardImage=bilder/kort/places/trikk_17_18.PNG); `grunerlokka_helgesens_tm` (image=bilder/places/grunerlokka.JPG, cardImage=bilder/kort/places/grunerlokka.PNG)
  - `toyen_torg` (image=bilder/places/toyen_torg.JPG, cardImage=bilder/kort/places/toyen_torg.PNG); `majorstuen_krysset` (image=bilder/places/majorstuen_krysset.JPG, cardImage=bilder/kort/places/majorstuen_krysset.PNG); `st_hanshaugen_park` (image=bilder/places/st_hanshaugen_park.JPG, cardImage=bilder/kort/places/st_hanshaugen_park.PNG); `oslo_s` (image=bilder/places/oslo_s.JPG, cardImage=bilder/kort/places/oslo_s.PNG); `vulkan_energisentral` (image=bilder/places/vulkan_energisentral.JPG, cardImage=bilder/kort/places/vulkan_energisentral.PNG); `jernbanetorget` (image=bilder/places/jernbanetorget.JPG, cardImage=bilder/kort/places/jernbanetorget.PNG); `oslo_bussterminal` (image=bilder/places/oslo_bussterminal.JPG, cardImage=bilder/kort/places/oslo_bussterminal.PNG); `helsfyr` (image=bilder/places/helsfyr.JPG, cardImage=bilder/kort/places/helsfyr.PNG)
  - `bogstadveien` (image=bilder/places/bogstadveien.JPG); `markveien` (image=bilder/places/markveien.JPG, cardImage=bilder/kort/places/markveien.PNG); `gronlandsleiret` (image=bilder/places/gronlandsleiret.JPG, cardImage=bilder/kort/places/gronlandsleiret.PNG); `storgata` (image=bilder/places/storgata.JPG, cardImage=bilder/kort/places/storgata.PNG); `ullevål_hageby` (image=bilder/places/ullevål_hageby.JPG, cardImage=bilder/kort/places/ullevål_hageby.PNG); `romsaås` (image=bilder/places/romsaås.JPG, cardImage=bilder/kort/places/romsaås.PNG); `rodelokka` (image=bilder/places/rodelokka.JPG, cardImage=bilder/kort/places/rodelokka.PNG); `vaalerenga` (image=bilder/places/vaalerenga.JPG, cardImage=bilder/kort/places/vaalerenga.PNG)
  - `vinderen` (image=bilder/places/vinderen.JPG, cardImage=bilder/kort/places/vinderen.PNG); `ullern` (image=bilder/places/ullern.JPG, cardImage=bilder/kort/places/ullern.PNG); `spikersuppa` (image=bilder/places/spikersuppa.JPG, cardImage=bilder/kort/places/spikersuppa.PNG); `bankplassen` (image=bilder/places/bankplassen.JPG, cardImage=bilder/kort/places/bankplassen.PNG); `christiania_torv` (image=bilder/places/christiania_torv.JPG, cardImage=bilder/kort/places/christiania_torv.PNG); `slottsparken` (image=bilder/places/slottsparken.JPG, cardImage=bilder/kort/places/slottsparken.PNG); `botsparken` (image=bilder/places/botsparken.JPG, cardImage=bilder/kort/places/botsparken.PNG); `stensparken` (image=bilder/places/stensparken.JPG, cardImage=bilder/kort/places/stensparken.PNG)
  - `nydalen` (image=bilder/places/nydalen.JPG, cardImage=bilder/kort/places/nydalen.PNG); `tjuvholmen` (image=bilder/places/tjuvholmen.JPG, cardImage=bilder/kort/places/tjuvholmen.PNG); `sorenga` (image=bilder/places/sorenga.JPG, cardImage=bilder/kort/places/sorenga.PNG); `majorstuen_tbanestasjon` (image=bilder/places/majorstuen_tbanestasjon.JPG, cardImage=bilder/kort/places/majorstuen_tbanestasjon.PNG); `nationaltheatret_stasjon` (image=bilder/places/nationaltheatret_stasjon.JPG, cardImage=bilder/kort/places/nationaltheatret_stasjon.PNG); `bislett` (image=bilder/places/bislett.JPG, cardImage=bilder/kort/places/bislett.PNG); `olaf_ryes_plass` (image=bilder/places/olaf_ryes_plass.JPG, cardImage=bilder/kort/places/olaf_ryes_plass.PNG); `birkelunden` (image=bilder/places/birkelunden.JPG, cardImage=bilder/kort/places/birkelunden.PNG)
  - `akerselva` (image=bilder/places/akerselva.JPG, cardImage=bilder/kort/places/akerselva.PNG); `universitetsplassen` (image=bilder/places/universitetsplassen.JPG, cardImage=bilder/kort/places/universitetsplassen.PNG); `operahuset` (image=bilder/places/operahuset.PNG, cardImage=bilder/kort/places/operahuset.PNG); `deichman_bjorvika` (image=bilder/places/deichman_bjorvika.PNG, cardImage=bilder/kort/places/deichman_bjorvika.PNG); `vigelandsparken` (image=bilder/places/vigelandsparken.PNG, cardImage=bilder/kort/places/vigelandsparken.PNG); `carl_berner_plass` (image=bilder/places/carl_berner_plass.PNG, cardImage=bilder/kort/places/carl_berner_plass.PNG)

- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` (26 steder)
  - `lisbon_city` (frontImage); `lisbon_praca_do_comercio` (frontImage); `lisbon_alfama` (frontImage); `lisbon_elevador_de_santa_justa` (frontImage); `lisbon_ponte_25_de_abril` (frontImage); `lisbon_rossio` (frontImage); `lisbon_avenida_da_liberdade` (frontImage); `lisbon_parque_eduardo_vii` (frontImage)
  - `lisbon_cais_do_sodre` (frontImage); `lisbon_principe_real` (frontImage); `lisbon_baixa_pombalina` (frontImage); `lisbon_bica` (frontImage); `lisbon_graca` (frontImage); `lisbon_belem_bydel` (frontImage); `lisbon_alcantara` (frontImage); `lisbon_intendente` (frontImage)
  - `lisbon_chiado` (frontImage); `lisbon_campo_de_ourique` (frontImage); `lisbon_estrela` (frontImage); `lisbon_lapa` (frontImage); `lisbon_ajuda` (frontImage); `lisbon_campo_pequeno` (frontImage); `lisbon_entrecampos` (frontImage); `lisbon_oriente_station` (frontImage)
  - `lisbon_martim_moniz_mouraria_axis` (frontImage); `lisbon_gare_do_cais_do_sodre` (frontImage)

- `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` (20 steder)
  - `lisbon_torre_de_belem` (frontImage); `lisbon_mosteiro_dos_jeronimos` (frontImage); `lisbon_castelo_de_sao_jorge` (frontImage); `lisbon_aqueduto_das_aguas_livres` (frontImage); `lisbon_se_de_lisboa` (frontImage); `lisbon_convento_do_carmo` (frontImage); `lisbon_padrao_dos_descobrimentos` (frontImage); `lisbon_estacao_do_rossio` (frontImage)
  - `lisbon_teatro_romano` (frontImage); `lisbon_panteao_nacional` (frontImage); `lisbon_sao_vicente_de_fora` (frontImage); `lisbon_palacio_ajuda` (frontImage); `lisbon_palacio_fronteira` (frontImage); `lisbon_museu_de_lisboa` (frontImage); `lisbon_igreja_de_santo_antonio` (frontImage); `lisbon_igreja_de_sao_roque` (frontImage)
  - `lisbon_museu_do_aljube` (frontImage); `lisbon_igreja_de_sao_domingos` (frontImage); `lisbon_museu_de_marinha` (frontImage); `lisbon_museu_nacional_dos_coches` (frontImage)

- `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` (14 steder)
  - `lisbon_museu_nacional_do_azulejo` (frontImage); `lisbon_fundacao_calouste_gulbenkian` (frontImage); `lisbon_maat` (frontImage); `lisbon_museu_nacional_de_arte_antiga` (frontImage); `lisbon_centro_cultural_de_belem` (frontImage); `lisbon_museu_do_oriente` (frontImage); `lisbon_mac_ccb_berardo` (frontImage); `lisbon_museu_nacional_de_arte_contemporanea_do_chiado` (frontImage)
  - `lisbon_mude` (frontImage); `lisbon_teatro_nacional_d_maria_ii` (frontImage); `lisbon_teatro_sao_luiz` (frontImage); `lisbon_culturgest` (frontImage); `lisbon_museu_arpad_szenes_vieira_da_silva` (frontImage); `lisbon_museu_bordalo_pinheiro` (frontImage)

- `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` (11 steder)
  - `lisbon_casa_dos_bicos` (frontImage); `lisbon_a_brasileira` (frontImage); `lisbon_livraria_bertrand` (frontImage); `lisbon_casa_fernando_pessoa` (frontImage); `lisbon_biblioteca_nacional_de_portugal` (frontImage); `lisbon_cemiterio_dos_prazeres` (frontImage); `lisbon_praca_luis_de_camoes` (frontImage); `lisbon_estatua_eca_de_queiros` (frontImage)
  - `lisbon_hemeroteca_municipal` (frontImage); `lisbon_gremio_literario` (frontImage); `lisbon_casa_dos_estudantes_do_imperio` (frontImage)

- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` (11 steder)
  - `lisbon_jardim_botanico` (frontImage); `lisbon_tapada_das_necessidades` (frontImage); `lisbon_miradouro_sao_pedro_de_alcantara` (frontImage); `lisbon_miradouro_da_graca` (frontImage); `lisbon_monsanto` (frontImage); `lisbon_jardim_da_estrela` (frontImage); `lisbon_jardim_do_torel` (frontImage); `lisbon_miradouro_da_senhora_do_monte` (frontImage)
  - `lisbon_tapada_da_ajuda` (frontImage); `lisbon_jardim_gulbenkian` (frontImage); `lisbon_jardim_do_principe_real` (frontImage)

- `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` (10 steder)
  - `lisbon_museu_nacional_de_historia_natural_e_da_ciencia` (frontImage); `lisbon_observatorio_astronomico` (frontImage); `lisbon_instituto_superior_tecnico` (frontImage); `lisbon_faculdade_de_ciencias` (frontImage); `lisbon_pavilhao_do_conhecimento` (frontImage); `lisbon_jardim_botanico_tropical` (frontImage); `lisbon_instituto_higiene_medicina_tropical` (frontImage); `lisbon_laboratorio_nacional_engenharia_civil` (frontImage)
  - `lisbon_instituto_ricardo_jorge` (frontImage); `lisbon_torre_do_tombo` (frontImage)

- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` (9 steder)
  - `lisbon_assembleia_da_republica` (frontImage); `lisbon_largo_do_carmo` (frontImage); `lisbon_praca_dos_restauradores` (frontImage); `lisbon_praca_marques_de_pombal` (frontImage); `lisbon_praca_do_municipio` (frontImage); `lisbon_tribunal_constitucional` (frontImage); `lisbon_fundacao_mario_soares_maria_barroso` (frontImage); `lisbon_avenida_24_de_julho` (frontImage)
  - `lisbon_palacio_de_belem` (frontImage)

- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` (9 steder)
  - `lisbon_bairro_alto` (frontImage); `lisbon_pink_street` (frontImage); `lisbon_galeria_ze_dos_bois` (frontImage); `lisbon_musicbox` (frontImage); `lisbon_fabrica_braco_de_prata` (frontImage); `lisbon_crew_hassan` (frontImage); `lisbon_village_underground` (frontImage); `lisbon_desterro` (frontImage)
  - `lisbon_anjos70` (frontImage)

- `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` (8 steder)
  - `lisbon_lx_factory` (frontImage); `lisbon_mercado_da_ribeira` (frontImage); `lisbon_parque_das_nacoes` (frontImage); `lisbon_cordoaria_nacional` (frontImage); `lisbon_doca_de_alcantara` (frontImage); `lisbon_mercado_de_campo_de_ourique` (frontImage); `lisbon_armazens_do_chiado` (frontImage); `lisbon_terminal_de_cruzeiros` (frontImage)

- `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` (8 steder)
  - `lisbon_estadio_da_luz` (frontImage); `lisbon_estadio_jose_alvalade` (frontImage); `lisbon_estadio_universitario` (frontImage); `lisbon_pavilhao_joao_rocha` (frontImage); `lisbon_hipodromo_do_campo_grande` (frontImage); `lisbon_centro_nautico_de_belem` (frontImage); `lisbon_pista_moniz_pereira` (frontImage); `lisbon_complexo_desportivo_do_restelo` (frontImage)

- `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` (7 steder)
  - `lisbon_mouraria_fado` (frontImage); `lisbon_hot_clube_de_portugal` (frontImage); `lisbon_museu_do_fado` (frontImage); `lisbon_coliseu_dos_recreios` (frontImage); `lisbon_teatro_tivoli_bbva` (frontImage); `lisbon_clube_de_fado` (frontImage); `lisbon_tasca_do_chico` (frontImage)

- `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` (6 steder)
  - `lisbon_cinemateca_portuguesa` (frontImage); `lisbon_cinema_sao_jorge` (frontImage); `lisbon_cinema_ideal` (frontImage); `lisbon_cinema_nimas` (frontImage); `lisbon_tobis_portuguesa` (frontImage); `lisbon_doclisboa` (frontImage)

- `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` (6 steder)
  - `lisbon_casa_museu_amalia_rodrigues` (frontImage); `lisbon_tram_28` (frontImage); `lisbon_marchas_populares` (frontImage); `lisbon_feira_da_ladra` (frontImage); `lisbon_santo_antonio_festival` (frontImage); `lisbon_feira_do_livro` (frontImage)

- `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` (5 steder)
  - `lisbon_rtp` (frontImage); `lisbon_diario_de_noticias` (frontImage); `lisbon_lusa` (frontImage); `lisbon_antena_1_rdp` (frontImage); `lisbon_arquivo_rtp` (frontImage)

- `data/places/naeringsliv/oslo/places_naeringsliv.json` (1 steder)
  - `vinmonopolet_lager` (popupImage)

### Manglende felt uten funnet asset (`field_missing_no_asset_found`)

- `data/places/naeringsliv/oslo/places_naeringsliv.json` (28 steder)
  - `havnelageret` (image, cardImage); `tollbukaia` (image, cardImage); `oslo_posthus` (image, cardImage); `grunnlovsbygget_bankplassen` (image, cardImage); `akershus_kaier` (image, cardImage); `fornebu_teknologipark` (image, cardImage); `ulven_handelspark` (image, cardImage); `akershus_energi` (image, cardImage)
  - `sagene_kvernhus` (image, cardImage); `ovre_foss` (image, cardImage); `oslo_mek` (image, cardImage); `schous_bryggeri` (image, cardImage); `ringnes_bryggeri` (image, cardImage); `st_halvard_bryggeri` (image, cardImage); `oslo_kornmagasin` (image, cardImage); `akershus_slott_bakeriet` (image, cardImage)
  - `jernbanetorget_trafikknutepunkt` (image, cardImage); `oslo_kraftselskap` (image, cardImage); `grensen_kjopesenter` (image, cardImage); `vippetangen_fisketorg` (image, cardImage); `frysja_industriomrade` (image, cardImage); `norges_varemesse` (image, cardImage); `bryn_industriomrade` (image, cardImage); `gronlikaia` (image, cardImage)
  - `myrens_verksted` (image, cardImage); `christiania_seildugsfabrik` (image, cardImage); `lilleborg_fabrikker` (image, cardImage); `akerselva_industri` (image, cardImage)

- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` (26 steder)
  - `lisbon_city` (image, cardImage); `lisbon_praca_do_comercio` (image, cardImage); `lisbon_alfama` (image, cardImage); `lisbon_elevador_de_santa_justa` (image, cardImage); `lisbon_ponte_25_de_abril` (image, cardImage); `lisbon_rossio` (image, cardImage); `lisbon_avenida_da_liberdade` (image, cardImage); `lisbon_parque_eduardo_vii` (image, cardImage)
  - `lisbon_cais_do_sodre` (image, cardImage); `lisbon_principe_real` (image, cardImage); `lisbon_baixa_pombalina` (image, cardImage); `lisbon_bica` (image, cardImage); `lisbon_graca` (image, cardImage); `lisbon_belem_bydel` (image, cardImage); `lisbon_alcantara` (image, cardImage); `lisbon_intendente` (image, cardImage)
  - `lisbon_chiado` (image, cardImage); `lisbon_campo_de_ourique` (image, cardImage); `lisbon_estrela` (image, cardImage); `lisbon_lapa` (image, cardImage); `lisbon_ajuda` (image, cardImage); `lisbon_campo_pequeno` (image, cardImage); `lisbon_entrecampos` (image, cardImage); `lisbon_oriente_station` (image, cardImage)
  - `lisbon_martim_moniz_mouraria_axis` (image, cardImage); `lisbon_gare_do_cais_do_sodre` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` (23 steder)
  - `frysjadammen` (image, cardImage); `nydalen_industristed` (image, cardImage); `seilduksfabrikken_nydalen` (image, cardImage); `nydalsdammen` (image, cardImage); `stilla_nydalen` (image, cardImage); `bjoelsenfossen` (image, cardImage); `bjoelsenparken_elvenaer` (image, cardImage); `glads_molle` (image, cardImage)
  - `voienfossen` (image, cardImage); `voien_gard_voienvolden` (image, cardImage); `myralokka` (image, cardImage); `kuba_parken` (image, cardImage); `beierbrua` (image, cardImage); `nedre_foss` (image, cardImage); `vulkan_industriomrade` (image, cardImage); `elvestrekning_bla_brenneriveien` (image, cardImage)
  - `fossveien_elvestrekning` (image, cardImage); `hausmannsbrua` (image, cardImage); `hausmannsomradet_elvelop` (image, cardImage); `ankerbrua` (image, cardImage); `nybrua_vaterlandsparken` (image, cardImage); `vaterland_historisk_elvelop` (image, cardImage); `akerselva_utlop_bjorvika` (image, cardImage)

- `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` (20 steder)
  - `lisbon_torre_de_belem` (image, cardImage); `lisbon_mosteiro_dos_jeronimos` (image, cardImage); `lisbon_castelo_de_sao_jorge` (image, cardImage); `lisbon_aqueduto_das_aguas_livres` (image, cardImage); `lisbon_se_de_lisboa` (image, cardImage); `lisbon_convento_do_carmo` (image, cardImage); `lisbon_padrao_dos_descobrimentos` (image, cardImage); `lisbon_estacao_do_rossio` (image, cardImage)
  - `lisbon_teatro_romano` (image, cardImage); `lisbon_panteao_nacional` (image, cardImage); `lisbon_sao_vicente_de_fora` (image, cardImage); `lisbon_palacio_ajuda` (image, cardImage); `lisbon_palacio_fronteira` (image, cardImage); `lisbon_museu_de_lisboa` (image, cardImage); `lisbon_igreja_de_santo_antonio` (image, cardImage); `lisbon_igreja_de_sao_roque` (image, cardImage)
  - `lisbon_museu_do_aljube` (image, cardImage); `lisbon_igreja_de_sao_domingos` (image, cardImage); `lisbon_museu_de_marinha` (image, cardImage); `lisbon_museu_nacional_dos_coches` (image, cardImage)

- `data/places/sport/oslo/places_sport.json` (15 steder)
  - `bislett_stadion` (image, cardImage); `ullevaal_stadion` (image, cardImage); `intility_arena` (image, cardImage); `jordal_amfi` (image, cardImage); `holmenkollen_nasjonalanlegg` (image, cardImage); `frogner_stadion` (image, cardImage); `valle_hovin_stadion` (image, cardImage); `daelenenga_idrettspark` (image, cardImage)
  - `gressbanen` (image, cardImage); `ekebergsletta` (image, cardImage); `kfum_arena` (image, cardImage); `nordre_aasen_idrettspark` (image, cardImage); `vallhall_arena` (image, cardImage); `manglerudhallen` (image, cardImage); `furuset_forum` (image, cardImage)

- `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` (15 steder)
  - `lekeplass_sofienbergparken` (image, cardImage); `lekeplass_st_hanshaugen` (image, cardImage); `lekeplass_birkelunden` (image, cardImage); `lekeplass_olaf_ryes_plass` (image, cardImage); `lekeplass_botsparken` (image, cardImage); `lekeplass_stensparken` (image, cardImage); `lekeplass_kirsebarlunden` (image, cardImage); `lekeplass_snippen` (image, cardImage)
  - `lekeplass_frognerborgen` (image, cardImage); `lekeplass_kampen_park` (image, cardImage); `aktivitet_rudolf_nilsens_plass` (image, cardImage); `treningssted_torshovdalen` (image, cardImage); `treningssted_kampen_park` (image, cardImage); `treningssted_sognsvann` (image, cardImage); `treningssted_skur13` (image, cardImage)

- `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` (14 steder)
  - `lisbon_museu_nacional_do_azulejo` (image, cardImage); `lisbon_fundacao_calouste_gulbenkian` (image, cardImage); `lisbon_maat` (image, cardImage); `lisbon_museu_nacional_de_arte_antiga` (image, cardImage); `lisbon_centro_cultural_de_belem` (image, cardImage); `lisbon_museu_do_oriente` (image, cardImage); `lisbon_mac_ccb_berardo` (image, cardImage); `lisbon_museu_nacional_de_arte_contemporanea_do_chiado` (image, cardImage)
  - `lisbon_mude` (image, cardImage); `lisbon_teatro_nacional_d_maria_ii` (image, cardImage); `lisbon_teatro_sao_luiz` (image, cardImage); `lisbon_culturgest` (image, cardImage); `lisbon_museu_arpad_szenes_vieira_da_silva` (image, cardImage); `lisbon_museu_bordalo_pinheiro` (image, cardImage)

- `data/places/subkultur/oslo/places_subkultur.json` (13 steder)
  - `hausmania` (image); `skur13` (image, cardImage); `torggata_blad` (image, cardImage); `stovnertarnet` (image, cardImage); `bla` (image, cardImage); `vulkan_murvegger` (image, cardImage); `hausmannsgate_aksen` (image, cardImage); `kolstadgata_toyen_vegger` (image, cardImage)
  - `gronland_underganger` (image, cardImage); `nybrua_pilarrom` (image, cardImage); `schweigaards_gate_lodalen` (image, cardImage); `kuba_akselpassasjer` (image, cardImage); `grunerlokka_bakgardsvegger` (image, cardImage)

- `data/places/vitenskap/oslo/places_vitenskap.json` (12 steder)
  - `gamlebyen_skole` (image, cardImage); `universitetet_i_oslo_blindern` (image, cardImage); `naturhistorisk_museum` (image, cardImage); `botanisk_hage` (image, cardImage); `teknisk_museum` (image, cardImage); `forskningsparken` (image, cardImage); `rikshospitalet` (image, cardImage); `radiumhospitalet` (image, cardImage)
  - `meteorologisk_institutt` (image, cardImage); `oslo_met_pilestredet` (image, cardImage); `arkitektur_og_designhogskolen` (image, cardImage); `bi_nydalen` (image, cardImage)

- `data/places/sport/ostlandet/places_motorsport_ostlandet.json` (11 steder)
  - `rudskogen_motorsenter` (image, cardImage); `valerbanen` (image, cardImage); `gardermoen_raceway` (image, cardImage); `gardermoen_motorpark` (image, cardImage); `grenland_motorsportsenter` (image, cardImage); `varna_kartring` (image, cardImage); `naf_gokartsenter_andebu` (image, cardImage); `kongsberg_motorsenter` (image, cardImage)
  - `finnskogbanen` (image, cardImage); `momarken_bilbane` (image, cardImage); `lyngasbanen` (image, cardImage)

- `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` (11 steder)
  - `lisbon_casa_dos_bicos` (image, cardImage); `lisbon_a_brasileira` (image, cardImage); `lisbon_livraria_bertrand` (image, cardImage); `lisbon_casa_fernando_pessoa` (image, cardImage); `lisbon_biblioteca_nacional_de_portugal` (image, cardImage); `lisbon_cemiterio_dos_prazeres` (image, cardImage); `lisbon_praca_luis_de_camoes` (image, cardImage); `lisbon_estatua_eca_de_queiros` (image, cardImage)
  - `lisbon_hemeroteca_municipal` (image, cardImage); `lisbon_gremio_literario` (image, cardImage); `lisbon_casa_dos_estudantes_do_imperio` (image, cardImage)

- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` (11 steder)
  - `lisbon_jardim_botanico` (image, cardImage); `lisbon_tapada_das_necessidades` (image, cardImage); `lisbon_miradouro_sao_pedro_de_alcantara` (image, cardImage); `lisbon_miradouro_da_graca` (image, cardImage); `lisbon_monsanto` (image, cardImage); `lisbon_jardim_da_estrela` (image, cardImage); `lisbon_jardim_do_torel` (image, cardImage); `lisbon_miradouro_da_senhora_do_monte` (image, cardImage)
  - `lisbon_tapada_da_ajuda` (image, cardImage); `lisbon_jardim_gulbenkian` (image, cardImage); `lisbon_jardim_do_principe_real` (image, cardImage)

- `data/places/historie/oslo/places_historie.json` (10 steder)
  - `gamlebyen_gravlund` (image, cardImage); `akerhus_slott` (image, cardImage); `gamle_aker_kirke` (image, cardImage); `hovedoya_kloster` (image, cardImage); `eidsvollsbygningen` (image, cardImage); `oscarsborg_festning` (image, cardImage); `grini_fangeleir` (image, cardImage); `villa_grande` (image, cardImage)
  - `bogstad_gard` (image, cardImage); `mollergata_19` (image, cardImage)

- `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` (10 steder)
  - `lisbon_museu_nacional_de_historia_natural_e_da_ciencia` (image, cardImage); `lisbon_observatorio_astronomico` (image, cardImage); `lisbon_instituto_superior_tecnico` (image, cardImage); `lisbon_faculdade_de_ciencias` (image, cardImage); `lisbon_pavilhao_do_conhecimento` (image, cardImage); `lisbon_jardim_botanico_tropical` (image, cardImage); `lisbon_instituto_higiene_medicina_tropical` (image, cardImage); `lisbon_laboratorio_nacional_engenharia_civil` (image, cardImage)
  - `lisbon_instituto_ricardo_jorge` (image, cardImage); `lisbon_torre_do_tombo` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` (9 steder)
  - `ostensjovannet` (image, cardImage); `hovedoya` (image, cardImage); `gressholmen` (image, cardImage); `bygdoy_natur` (image, cardImage); `ljanselva` (image, cardImage); `maerradalen` (image, cardImage); `maridalsvannet` (image, cardImage); `noklevann` (image, cardImage)
  - `alnaelva_hovedsteder` (image, cardImage)

- `data/places/popkultur/oslo/places_oslo_populaerkultur.json` (9 steder)
  - `cinemateket_oslo` (image, cardImage); `colosseum_kino` (image, cardImage); `house_of_nerds` (image, cardImage); `folketeateret` (image, cardImage); `chateau_neuf` (image, cardImage); `latter` (image, cardImage); `frognerstranda` (image, cardImage); `grand_hotel` (image, cardImage)
  - `slottsplassen` (image, cardImage)

- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` (9 steder)
  - `lisbon_assembleia_da_republica` (image, cardImage); `lisbon_largo_do_carmo` (image, cardImage); `lisbon_praca_dos_restauradores` (image, cardImage); `lisbon_praca_marques_de_pombal` (image, cardImage); `lisbon_praca_do_municipio` (image, cardImage); `lisbon_tribunal_constitucional` (image, cardImage); `lisbon_fundacao_mario_soares_maria_barroso` (image, cardImage); `lisbon_avenida_24_de_julho` (image, cardImage)
  - `lisbon_palacio_de_belem` (image, cardImage)

- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` (9 steder)
  - `lisbon_bairro_alto` (image, cardImage); `lisbon_pink_street` (image, cardImage); `lisbon_galeria_ze_dos_bois` (image, cardImage); `lisbon_musicbox` (image, cardImage); `lisbon_fabrica_braco_de_prata` (image, cardImage); `lisbon_crew_hassan` (image, cardImage); `lisbon_village_underground` (image, cardImage); `lisbon_desterro` (image, cardImage)
  - `lisbon_anjos70` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` (8 steder)
  - `alnsjoen_alna_kilde` (image, cardImage); `alnaparken` (image, cardImage); `groruddammen` (image, cardImage); `alna_smalvoll` (image, cardImage); `alna_bryn` (image, cardImage); `svartdalen` (image, cardImage); `kvaernerbyen_alna` (image, cardImage); `alna_utlop_bjorvika` (image, cardImage)

- `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` (8 steder)
  - `lisbon_lx_factory` (image, cardImage); `lisbon_mercado_da_ribeira` (image, cardImage); `lisbon_parque_das_nacoes` (image, cardImage); `lisbon_cordoaria_nacional` (image, cardImage); `lisbon_doca_de_alcantara` (image, cardImage); `lisbon_mercado_de_campo_de_ourique` (image, cardImage); `lisbon_armazens_do_chiado` (image, cardImage); `lisbon_terminal_de_cruzeiros` (image, cardImage)

- `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` (8 steder)
  - `lisbon_estadio_da_luz` (image, cardImage); `lisbon_estadio_jose_alvalade` (image, cardImage); `lisbon_estadio_universitario` (image, cardImage); `lisbon_pavilhao_joao_rocha` (image, cardImage); `lisbon_hipodromo_do_campo_grande` (image, cardImage); `lisbon_centro_nautico_de_belem` (image, cardImage); `lisbon_pista_moniz_pereira` (image, cardImage); `lisbon_complexo_desportivo_do_restelo` (image, cardImage)

- `data/places/historie/oslo/places_historie_added_batch_01.json` (7 steder)
  - `nonneseter_kloster` (image, cardImage); `oslo_ladegard` (image, cardImage); `gamle_radhus` (image, cardImage); `galgeberg` (image, cardImage); `oslo_hospital` (image, cardImage); `botsfengselet` (image, cardImage); `prinds_christian_augusts_minde` (image, cardImage)

- `data/places/natur/oslo/places_oslo_alna.json` (7 steder)
  - `alnaelva` (image, cardImage); `alnaelvstien` (image, cardImage); `loelva_historisk` (image, cardImage); `trosterud_friomrade` (image, cardImage); `furuset_haugerud_skogbelte` (image, cardImage); `hellerud_gard` (image, cardImage); `alnabru_jernbane_og_logistikk` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` (7 steder)
  - `noklevann_ljanselva_start` (image, cardImage); `skraperudtjern` (image, cardImage); `ljanselva_skullerud` (image, cardImage); `ljanselva_hauketo` (image, cardImage); `ljanselva_ljan` (image, cardImage); `ljanselva_fiskevollen` (image, cardImage); `ljanselva_bunnefjorden` (image, cardImage)

- `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` (7 steder)
  - `lisbon_mouraria_fado` (image, cardImage); `lisbon_hot_clube_de_portugal` (image, cardImage); `lisbon_museu_do_fado` (image, cardImage); `lisbon_coliseu_dos_recreios` (image, cardImage); `lisbon_teatro_tivoli_bbva` (image, cardImage); `lisbon_clube_de_fado` (image, cardImage); `lisbon_tasca_do_chico` (image, cardImage)

- `data/places/media/oslo/places_oslo_media.json` (6 steder)
  - `good_game_redaksjon` (image, cardImage); `vg_huset` (image, cardImage); `nrk_huset_marienlyst` (image, cardImage); `aftenposten_akersgata` (image, cardImage); `dagbladet_akersgata` (image, cardImage); `klassekampen_redaksjon` (image, cardImage)

- `data/places/musikk/oslo/places_musikk.json` (6 steder)
  - `salt` (image, cardImage); `det_norske_teatret` (image, cardImage); `blaa` (image, cardImage); `rockefeller` (image, cardImage); `john_dee` (image, cardImage); `sentrum_scene` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_bygdoy.json` (6 steder)
  - `bygdoy_kongeskogen` (image, cardImage); `bygdoy_dronningberget` (image, cardImage); `bygdoy_huk` (image, cardImage); `bygdoy_paradisbukta` (image, cardImage); `bygdoy_bygdoynes` (image, cardImage); `bygdoy_roykenvika` (image, cardImage)

- `data/places/politikk/oslo/places_politikk.json` (6 steder)
  - `stortinget` (image, cardImage); `youngstorget` (image, cardImage); `oslo_radhus` (image, cardImage); `eidsvolls_plass` (image, cardImage); `tinghuset` (image, cardImage); `regjeringskvartalet` (image, cardImage)

- `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` (6 steder)
  - `lisbon_cinemateca_portuguesa` (image, cardImage); `lisbon_cinema_sao_jorge` (image, cardImage); `lisbon_cinema_ideal` (image, cardImage); `lisbon_cinema_nimas` (image, cardImage); `lisbon_tobis_portuguesa` (image, cardImage); `lisbon_doclisboa` (image, cardImage)

- `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` (6 steder)
  - `lisbon_casa_museu_amalia_rodrigues` (image, cardImage); `lisbon_tram_28` (image, cardImage); `lisbon_marchas_populares` (image, cardImage); `lisbon_feira_da_ladra` (image, cardImage); `lisbon_santo_antonio_festival` (image, cardImage); `lisbon_feira_do_livro` (image, cardImage)

- `data/places/film/oslo/places_oslo_film.json` (5 steder)
  - `saga_kino` (image, cardImage); `klingenberg_kino` (image, cardImage); `gimle_kino` (image, cardImage); `vika_kino` (image, cardImage); `hartvig_nissens_skole_skam` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` (5 steder)
  - `ostensjovannet_nord` (image, cardImage); `ostensjovannet_fugletarn` (image, cardImage); `ostensjovannet_sivbelte` (image, cardImage); `ostensjovannet_sor` (image, cardImage); `bogerudmyra` (image, cardImage)

- `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` (5 steder)
  - `lisbon_rtp` (image, cardImage); `lisbon_diario_de_noticias` (image, cardImage); `lisbon_lusa` (image, cardImage); `lisbon_antena_1_rdp` (image, cardImage); `lisbon_arquivo_rtp` (image, cardImage)

- `data/places/by/oslo/places_by.json` (4 steder)
  - `aker_brygge` (image, cardImage); `tigeren` (image, cardImage); `gronland_kirke` (image, cardImage); `kampen_kirke` (image, cardImage)

- `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` (4 steder)
  - `bygdoy_kongsgard_salamanderdam` (image, cardImage); `bantjern_salamanderlokalitet` (image, cardImage); `tjernsmyr_salamanderlokalitet` (image, cardImage); `blindern_forskningsparken_salamanderdam` (image, cardImage)

- `data/places/kunst/oslo/places_kunst.json` (2 steder)
  - `astrup_fearnley` (image, cardImage); `ekebergparken` (image, cardImage)

- `data/places/litteratur/oslo/places_litteratur.json` (2 steder)
  - `henrik_wergeland_statue` (image, cardImage); `kulturkirken_jakob_litteratur` (image, cardImage)

- `data/places/psykologi/oslo/places_psykologi.json` (1 steder)
  - `psykologisk_institutt_uio` (image, cardImage)

## Steder der ny bildeproduksjon sannsynligvis trengs

| Place-fil | Steder med sannsynlig produksjonsbehov | Felt-warnings |
| --- | ---: | ---: |
| `data/places/by/oslo/places_by.json` | 50 | 100 |
| `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` | 26 | 78 |
| `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` | 20 | 60 |
| `data/places/naeringsliv/oslo/places_naeringsliv.json` | 29 | 57 |
| `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` | 23 | 46 |
| `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` | 14 | 42 |
| `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` | 11 | 33 |
| `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | 11 | 33 |
| `data/places/sport/oslo/places_sport.json` | 15 | 30 |
| `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | 15 | 30 |
| `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` | 10 | 30 |
| `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` | 9 | 27 |
| `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | 9 | 27 |
| `data/places/subkultur/oslo/places_subkultur.json` | 13 | 25 |
| `data/places/vitenskap/oslo/places_vitenskap.json` | 12 | 24 |

Totalt er 984 felt-warnings i gruppen `exact_missing_no_match` eller `field_missing_no_asset_found`. Disse fordeler seg på 423 steder. Mange Lisboa-`frontImage`-warnings er tomme optional-felt og bør vurderes som data-normalisering før man konkluderer med at alle trenger nye assets.

### Topp 20 lavrisiko-fikser
| Prioritet | Place-fil | id | Felt | Nåverdi | Kategori | Kandidat(er) |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `data/places/by/oslo/places_by.json` | `voienvolden` | `image` | `bilder/places/voienvolden.PNG` | `extension_mismatch_candidate` | `bilder/places/Voienvolden.JPG`<br>`bilder/kort/places/voienvolden.PNG` |
| 2 | `data/places/by/oslo/places_by.json` | `torggata` | `image` | `bilder/places/torggata_IMG.JPG` | `directory_mismatch_candidate` | `bilder/places/by/torggata_IMG.JPG`<br>`bilder/places/by/torggata_Front.WEBP` |
| 3 | `data/places/by/oslo/places_by.json` | `torggata` | `frontImage` | `bilder/kort/places/by/torggata_Front.WEBP` | `directory_mismatch_candidate` | `bilder/places/by/torggata_Front.WEBP`<br>`bilder/places/by/torggata_IMG.JPG` |
| 4 | `data/places/by/oslo/places_by.json` | `torggata` | `cardImage` | `bilder/kort/places/by/torggata_CardImage.PNG` | `basename_match_candidate` | `bilder/places/by/torggata_Front.WEBP`<br>`bilder/places/by/torggata_IMG.JPG` |
| 5 | `data/places/by/oslo/places_by.json` | `bogstadveien` | `cardImage` | `bilder/kort/places/bogstadveien.PNG` | `basename_match_candidate` | `bilder/QuizCards/Bogstadveien.PNG` |
| 6 | `data/places/by/oslo/places_by.json` | `barcode` | `image` | `bilder/places/barcode.PNG` | `basename_match_candidate` | `bilder/QuizCards/Barcode.PNG` |
| 7 | `data/places/by/oslo/places_by.json` | `barcode` | `cardImage` | `bilder/kort/places/barcode.PNG` | `basename_match_candidate` | `bilder/QuizCards/Barcode.PNG` |
| 8 | `data/places/kunst/oslo/places_kunst.json` | `munch_museet` | `cardImage` | `(mangler)` | `field_missing_but_possible_existing_asset` | `bilder/places/kunst/Munch_liggende.JPG` |
| 9 | `data/places/litteratur/oslo/places_litteratur.json` | `camilla_collett_statue` | `cardImage` | `(mangler)` | `field_missing_but_possible_existing_asset` | `bilder/places/camilla_collett_statue.JPG` |
| 10 | `data/places/litteratur/oslo/places_litteratur.json` | `tronsmo_bokhandel` | `cardImage` | `(mangler)` | `field_missing_but_possible_existing_asset` | `bilder/places/Tronsmo.JPG` |
| 11 | `data/places/litteratur/oslo/places_litteratur.json` | `sigrid_undset_statue` | `cardImage` | `(mangler)` | `field_missing_but_possible_existing_asset` | `bilder/places/Sigrid_Undset_statuen.JPG` |
| 12 | `data/places/litteratur/oslo/places_litteratur.json` | `ruth_maier_minne` | `cardImage` | `(mangler)` | `field_missing_but_possible_existing_asset` | `bilder/places/Ruth_Meiers_plass.JPG` |

### Topp 5 place-filer å starte med
| Prioritet | Place-fil | Lavrisiko-funn | Totale image-relaterte warnings | Begrunnelse |
| ---: | --- | ---: | ---: | --- |
| 1 | `data/places/by/oslo/places_by.json` | 7 | 107 | Alle sikre path-/extension-/basename-funn ligger her, og Batch 44 pekte allerede på by/oslo som naturlig start. |
| 2 | `data/places/litteratur/oslo/places_litteratur.json` | 4 | 8 | Bør vente til etter by/oslo; funnene er enten fallback-kandidater eller hovedsakelig produksjonsbehov/tomme felt. |
| 3 | `data/places/kunst/oslo/places_kunst.json` | 1 | 5 | Bør vente til etter by/oslo; funnene er enten fallback-kandidater eller hovedsakelig produksjonsbehov/tomme felt. |
| 4 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` | 0 | 78 | Bør vente til etter by/oslo; funnene er enten fallback-kandidater eller hovedsakelig produksjonsbehov/tomme felt. |
| 5 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` | 0 | 60 | Bør vente til etter by/oslo; funnene er enten fallback-kandidater eller hovedsakelig produksjonsbehov/tomme felt. |

## Anbefalt Batch 47

Anbefaling: **Batch 47: fix exact existing asset path mismatches in by/oslo**.

Begrunnelse:

- Alle 7 lavrisiko path-/extension-/basename-funn ligger i `data/places/by/oslo/places_by.json`.
- Dette følger prioriteringen fra Batch 44 om å starte med by/oslo.
- Det gir trygg warning-reduksjon uten ny bildeproduksjon.
- Det unngår å starte med manuell utfylling av 375 `missing cardImage`-warnings.
- Det unngår å blande optional `frontImage`-normalisering for Lisboa med asset-path-fiksene.

Ikke anbefalt som Batch 47: `remove/normalize invalid frontImage references where no asset exists`. Det kan gi større warning-reduksjon på sikt, men har høyere policy-/data-risiko fordi tomme `frontImage`-felt først bør avklares som optional-feltstrategi.

## Bekreftelser

- Ingen filer under `data/places/**` ble endret.
- `data/places/places_index.json` ble ikke endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen canonical-filer ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Manifestet ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret, opprettet eller slettet.
- Ingen `image`, `cardImage`, `frontImage` eller `popupImage`-felt ble slettet eller omskrevet.
- Emneoppryddingen ble ikke gjenåpnet.
- Legacy-/secondary category-warningene ble ikke rørt.

## Validering etter rapportendring

| Kommando | Resultat |
| --- | --- |
| `npm run health:places` | OK: Errors 0, Warnings 1088, Places checked 459 |
| `npm run places:emner:check` | OK: Missing emne_ids 0, Duplicate place ids 0 |
| `npm run places:index:check` | OK: `places_index.json is in sync with source place files.` |

Kun denne rapportfilen skal være endret i git-status for Batch 46.
