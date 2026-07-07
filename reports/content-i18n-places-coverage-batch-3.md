# Content i18n places coverage batch 3

## Status

Kort oppsummering:

- Report-only.
- Ingen runtime/data/dictionary-endringer.
- Places translation architecture finnes etter batch 2.
- Denne rapporten kartlegger coverage/mangler for place translations i `en`, `es` og `pt`.

## Scope

Inspiserte filer/områder:

- `reports/content-i18n-audit-batch-1.md`
- `reports/content-i18n-places-architecture-batch-2.md`
- `js/i18n.js`
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `data/places/manifest.json`
- `data/places/places_index.json`
- Manifest-listede canonical place source files under `data/places/**`.

## Canonical place source

Canonical placeIds ble hentet fra `data/places/manifest.json`, som peker til 129 runtime source files. Disse manifest-listede sourcefilene ble lest direkte og ga 991 unike canonical placeIds.

`data/places/places_index.json` ble bare brukt som kontroll: index inneholder 959 ids. Differanse mot manifest-source: 32 manifest ids mangler i index, 0 index ids mangler i manifest-source. Fordi tidligere rapporter omtaler index som mulig stale, er manifest + source files brukt som source-of-truth.

Allowlist for translatable place fields kommer fra batch 2 / `js/i18n.js`: `title`, `name`, `label`, `description`, `desc`, `popupDesc`, `popupdesc`, `summary`, `shortDescription`, `shortDesc`, `subtitle`, `intro`, `body`, `facts`, `why`, `tasks_profile`, `for_na`, `leksikon`, `stories`, `works`, `badges`.

## Translation files inspected

| File | Parses | Place ids | Notes |
|---|---:|---:|---|
| `data/i18n/content/places/en.json` | yes | 434 | 6 stale/extra ids vs manifest-source |
| `data/i18n/content/places/es.json` | yes | 434 | 6 stale/extra ids vs manifest-source |
| `data/i18n/content/places/pt.json` | yes | 434 | 6 stale/extra ids vs manifest-source |

## Overall coverage

| Language | Canonical place ids | Translation entries | Missing ids | Stale ids | Coverage |
|---|---:|---:|---:|---:|---:|
| en | 991 | 428 | 563 | 6 | 43.2% |
| es | 991 | 428 | 563 | 6 | 43.2% |
| pt | 991 | 428 | 563 | 6 | 43.2% |

## Field coverage

| Language | Field | Canonical places with field | Translated count | Missing count | Coverage |
|---|---|---:|---:|---:|---:|
| en | name | 991 | 428 | 563 | 43.2% |
| en | desc | 991 | 428 | 563 | 43.2% |
| en | popupDesc | 991 | 428 | 563 | 43.2% |
| en | for_na | 1 | 0 | 1 | 0.0% |
| en | works | 1 | 0 | 1 | 0.0% |
| es | name | 991 | 428 | 563 | 43.2% |
| es | desc | 991 | 428 | 563 | 43.2% |
| es | popupDesc | 991 | 428 | 563 | 43.2% |
| es | for_na | 1 | 0 | 1 | 0.0% |
| es | works | 1 | 0 | 1 | 0.0% |
| pt | name | 991 | 428 | 563 | 43.2% |
| pt | desc | 991 | 428 | 563 | 43.2% |
| pt | popupDesc | 991 | 428 | 563 | 43.2% |
| pt | for_na | 1 | 0 | 1 | 0.0% |
| pt | works | 1 | 0 | 1 | 0.0% |

## Missing place ids by language

### en
Total missing ids: 563.

`bislett`, `saga_kino`, `klingenberg_kino`, `gimle_kino`, `vika_kino`, `hartvig_nissens_skole_skam`, `sagene_skole`, `trefoldighetskirken`, `nostvet_boplass`, `raknehaugen`, `nes_kirkeruiner`, `blaker_skanse`, `baerums_verk_jernverk`, `eidsvoll_verk_andelva`, `fetsund_lenser`, `tertitten_urskog_holandsbanen`, `kjeller_flyplass`, `trandumskogen`, `tanum_kirke`, `haslum_kirke`, `skedsmo_kirke`, `enebakk_kirke`, `asker_kirke_kirkested`, `gamle_hvam_museum`, `heggedal_hovedgard`, `hvitsten_sjobodene`, `son_ladested`, `holen_ladested`, `hurdal_verk_glassverk`, `vollen_maudbukta`, `roald_amundsens_hjem_uranienborg`, `stunner_boplass`, `ski_middelalderkirke`, `krakstad_kirke_og_gravhaug`, `hadeland_glassverk`, `kistefos_traesliperi`, `lunner_kirke`, `hakadal_verk`, `nesodden_kirke`, `seiersten_skanse`, `raelingen_bygdetun`, `losby_gods`, `frogner_gamle_kirke`, `sorum_kirke`, `feiring_jernverk`, `gardermoen_militaerleir_tunet`, `ullensaker_kirke_kirkested`, `drobak_kirke`, `aurskog_holand_bygdetun`, `nannestad_bygdemuseum`, `fredriksten_festning`, `fredrikstad_festning_gamlebyen`, `borgarsyssel_museum_olavsbyen`, `solbergfeltet_helleristninger`, `hunnfeltet_gravfelt`, `tune_skipet_funnsted`, `moss_jernverk_konventionsgarden`, `hafslund_hovedgard`, `rod_herregard`, `gjellestadskipet_jellhaugen`, `hoytorp_fort`, `orje_sluser_haldenkanalen`, `basmo_festning`, `eidsberg_kirke`, `rygge_kirke`, `hvaler_kirke`, `askim_gummivarefabrikk`, `borregaard_sarpsborg_industri`, `sarpsfossen`, `spydeberg_prestegard_1814`, `skjeberg_kirke`, `tistedalen_saugbrugsforeningen`, `indreroed_gard_fredrikstad`, `varne_kloster`, `onsøy_kirke`, `isegran_fort_verft`, `akeroya_fort`, `trogstad_fort`, `rodenes_kirke`, `fredrikshalds_teater` ...

### es
Total missing ids: 563.

`bislett`, `saga_kino`, `klingenberg_kino`, `gimle_kino`, `vika_kino`, `hartvig_nissens_skole_skam`, `sagene_skole`, `trefoldighetskirken`, `nostvet_boplass`, `raknehaugen`, `nes_kirkeruiner`, `blaker_skanse`, `baerums_verk_jernverk`, `eidsvoll_verk_andelva`, `fetsund_lenser`, `tertitten_urskog_holandsbanen`, `kjeller_flyplass`, `trandumskogen`, `tanum_kirke`, `haslum_kirke`, `skedsmo_kirke`, `enebakk_kirke`, `asker_kirke_kirkested`, `gamle_hvam_museum`, `heggedal_hovedgard`, `hvitsten_sjobodene`, `son_ladested`, `holen_ladested`, `hurdal_verk_glassverk`, `vollen_maudbukta`, `roald_amundsens_hjem_uranienborg`, `stunner_boplass`, `ski_middelalderkirke`, `krakstad_kirke_og_gravhaug`, `hadeland_glassverk`, `kistefos_traesliperi`, `lunner_kirke`, `hakadal_verk`, `nesodden_kirke`, `seiersten_skanse`, `raelingen_bygdetun`, `losby_gods`, `frogner_gamle_kirke`, `sorum_kirke`, `feiring_jernverk`, `gardermoen_militaerleir_tunet`, `ullensaker_kirke_kirkested`, `drobak_kirke`, `aurskog_holand_bygdetun`, `nannestad_bygdemuseum`, `fredriksten_festning`, `fredrikstad_festning_gamlebyen`, `borgarsyssel_museum_olavsbyen`, `solbergfeltet_helleristninger`, `hunnfeltet_gravfelt`, `tune_skipet_funnsted`, `moss_jernverk_konventionsgarden`, `hafslund_hovedgard`, `rod_herregard`, `gjellestadskipet_jellhaugen`, `hoytorp_fort`, `orje_sluser_haldenkanalen`, `basmo_festning`, `eidsberg_kirke`, `rygge_kirke`, `hvaler_kirke`, `askim_gummivarefabrikk`, `borregaard_sarpsborg_industri`, `sarpsfossen`, `spydeberg_prestegard_1814`, `skjeberg_kirke`, `tistedalen_saugbrugsforeningen`, `indreroed_gard_fredrikstad`, `varne_kloster`, `onsøy_kirke`, `isegran_fort_verft`, `akeroya_fort`, `trogstad_fort`, `rodenes_kirke`, `fredrikshalds_teater` ...

### pt
Total missing ids: 563.

`bislett`, `saga_kino`, `klingenberg_kino`, `gimle_kino`, `vika_kino`, `hartvig_nissens_skole_skam`, `sagene_skole`, `trefoldighetskirken`, `nostvet_boplass`, `raknehaugen`, `nes_kirkeruiner`, `blaker_skanse`, `baerums_verk_jernverk`, `eidsvoll_verk_andelva`, `fetsund_lenser`, `tertitten_urskog_holandsbanen`, `kjeller_flyplass`, `trandumskogen`, `tanum_kirke`, `haslum_kirke`, `skedsmo_kirke`, `enebakk_kirke`, `asker_kirke_kirkested`, `gamle_hvam_museum`, `heggedal_hovedgard`, `hvitsten_sjobodene`, `son_ladested`, `holen_ladested`, `hurdal_verk_glassverk`, `vollen_maudbukta`, `roald_amundsens_hjem_uranienborg`, `stunner_boplass`, `ski_middelalderkirke`, `krakstad_kirke_og_gravhaug`, `hadeland_glassverk`, `kistefos_traesliperi`, `lunner_kirke`, `hakadal_verk`, `nesodden_kirke`, `seiersten_skanse`, `raelingen_bygdetun`, `losby_gods`, `frogner_gamle_kirke`, `sorum_kirke`, `feiring_jernverk`, `gardermoen_militaerleir_tunet`, `ullensaker_kirke_kirkested`, `drobak_kirke`, `aurskog_holand_bygdetun`, `nannestad_bygdemuseum`, `fredriksten_festning`, `fredrikstad_festning_gamlebyen`, `borgarsyssel_museum_olavsbyen`, `solbergfeltet_helleristninger`, `hunnfeltet_gravfelt`, `tune_skipet_funnsted`, `moss_jernverk_konventionsgarden`, `hafslund_hovedgard`, `rod_herregard`, `gjellestadskipet_jellhaugen`, `hoytorp_fort`, `orje_sluser_haldenkanalen`, `basmo_festning`, `eidsberg_kirke`, `rygge_kirke`, `hvaler_kirke`, `askim_gummivarefabrikk`, `borregaard_sarpsborg_industri`, `sarpsfossen`, `spydeberg_prestegard_1814`, `skjeberg_kirke`, `tistedalen_saugbrugsforeningen`, `indreroed_gard_fredrikstad`, `varne_kloster`, `onsøy_kirke`, `isegran_fort_verft`, `akeroya_fort`, `trogstad_fort`, `rodenes_kirke`, `fredrikshalds_teater` ...

## Partially translated places

| Language | placeId | Existing fields | Missing fields | Recommendation |
|---|---|---|---|---|

## Stale / extra translation ids

This section treats stale/extra ids as translation ids that are not present in the manifest-derived canonical placeId set. The existing `npm run i18n:places:audit` script also reports hash-stale entries where the id still exists but `_sourceHash` no longer matches the current canonical source; that check reported 73 hash-stale entries per language, in addition to the 6 extra ids listed below. No stale or hash-stale entries were changed.

| Language | Stale id | Recommendation |
|---|---|---|
| en | `schous_plass` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| en | `kampen` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| en | `vaterland` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| en | `gamlebyen` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| en | `frognerparken` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| en | `kampen_park` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| es | `vaterland` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| es | `kampen` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| es | `schous_plass` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| es | `gamlebyen` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| es | `frognerparken` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| es | `kampen_park` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| pt | `vaterland` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| pt | `kampen` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| pt | `schous_plass` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| pt | `gamlebyen` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| pt | `frognerparken` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |
| pt | `kampen_park` | Keep for now; verify whether id was renamed, removed, or belongs to a non-manifest source before deleting in a cleanup batch. |

## Possible language-quality issues

| Language | placeId | Field | Issue type | Example / note |
|---|---|---|---|---|
| en | `torggata` | name | Same as canonical NB | Torggata |
| en | `karl_johan` | name | Same as canonical NB | Karl Johans gate |
| en | `radhusplassen` | popupDesc | Norwegian leftover | City Hall Square is one of the places in Oslo where the city can shift character within a few hours. On an ordinary week |
| en | `bjorvika` | name | Same as canonical NB | Bjørvika |
| en | `ring_3` | name | Same as canonical NB | Ring 3 |
| en | `ring_3` | popupDesc | Norwegian leftover | Ring 3 is one of those structures in Oslo that almost everyone relates to, but few experience as a place in itself. For  |
| en | `grunerlokka_helgesens_tm` | name | Same as canonical NB | Grünerløkka – Helgesens / Thorvald Meyers |
| en | `aker_brygge` | name | Same as canonical NB | Aker Brygge |
| en | `aker_brygge` | popupDesc | Norwegian leftover | Aker Brygge grew on the site of the former Akers Mekaniske Verksted, so its history mirrors a broader economic shift in  |
| en | `jernbanetorget` | name | Same as canonical NB | Jernbanetorget |
| en | `helsfyr` | name | Same as canonical NB | Helsfyr |
| en | `bogstadveien` | name | Same as canonical NB | Bogstadveien |
| en | `markveien` | name | Same as canonical NB | Markveien |
| en | `gronlandsleiret` | name | Same as canonical NB | Grønlandsleiret |
| en | `storgata` | name | Same as canonical NB | Storgata |
| en | `romsaås` | name | Same as canonical NB | Romsås |
| en | `rodelokka` | name | Same as canonical NB | Rodeløkka |
| en | `vaalerenga` | name | Same as canonical NB | Vålerenga |
| en | `vaalerenga` | popupDesc | Norwegian leftover | Vålerenga emerged as a residential district between Gamlebyen and Kampen, and its built environment consists of several  |
| en | `vinderen` | name | Same as canonical NB | Vinderen |
| en | `ullern` | name | Same as canonical NB | Ullern |
| en | `spikersuppa` | name | Same as canonical NB | Spikersuppa |
| en | `bankplassen` | name | Same as canonical NB | Bankplassen |
| en | `botsparken` | name | Same as canonical NB | Botsparken |
| en | `stensparken` | name | Same as canonical NB | Stensparken |
| en | `nydalen` | name | Same as canonical NB | Nydalen |
| en | `tjuvholmen` | name | Same as canonical NB | Tjuvholmen |
| en | `sorenga` | name | Same as canonical NB | Sørenga |
| en | `olaf_ryes_plass` | name | Same as canonical NB | Olaf Ryes plass |
| en | `birkelunden` | name | Same as canonical NB | Birkelunden |
| en | `akerselva` | name | Same as canonical NB | Akerselva |
| en | `deichman_bjorvika` | name | Same as canonical NB | Deichman Bjørvika |
| en | `barcode` | name | Same as canonical NB | Barcode |
| en | `barcode` | popupDesc | Norwegian leftover | Barcode in Bjørvika consists of a striking row of high-rises and commercial buildings that has become one of the most di |
| en | `carl_berner_plass` | name | Same as canonical NB | Carl Berners plass |
| en | `tullin` | name | Same as canonical NB | Tullin |
| en | `okern` | name | Same as canonical NB | Økern |
| en | `skoyen` | name | Same as canonical NB | Skøyen |
| en | `torshov` | name | Same as canonical NB | Torshov |
| en | `grorud` | name | Same as canonical NB | Grorud |
| en | `middelalder_oslo` | desc | Norwegian leftover | A historic area in Gamlebyen with remains of medieval Oslo. |
| en | `middelalder_oslo` | popupDesc | Norwegian leftover | The Medieval Park lies in the area where old Oslo grew in the High Middle Ages, and it contains visible remains of the c |
| en | `gamlebyen_gravlund` | name | Norwegian leftover | Gamlebyen Cemetery |
| en | `gamlebyen_gravlund` | popupDesc | Norwegian leftover | Gamlebyen Cemetery was established in the 1800s and is among the older burial sites in the area around the historic city |
| en | `gamle_aker_kirke` | popupDesc | Norwegian leftover | Old Aker Church is Oslo’s oldest preserved building and one of the most concrete medieval traces in the modern city. The |
| en | `villa_grande` | name | Same as canonical NB | Villa Grande |
| en | `mollergata_19` | name | Same as canonical NB | Møllergata 19 |
| en | `nonneseter_kloster` | desc | Norwegian leftover | Medieval nunnery in Gamlebyen, linked to ecclesiastical power, women’s monastic life and Oslo’s earliest religious lands |
| en | `oslo_ladegard` | desc | Norwegian leftover | Baroque building in Gamlebyen and a gateway to the interpretation of the medieval city, with layers from monastery, epis |
| en | `gamle_radhus` | name | Same as canonical NB | Gamle rådhus |
| en | `galgeberg` | name | Same as canonical NB | Galgeberg |
| en | `oslo_hospital` | desc | Norwegian leftover | Historic hospital in Gamlebyen, with roots in monastic and post-Reformation care history. |
| en | `oslo_hospital` | popupDesc | Norwegian leftover | Oslo Hospital shows a long line from medieval religious care to the early-modern institutional and health history. The s |
| en | `botsfengselet` | name | Same as canonical NB | Botsfengselet |
| en | `prinds_christian_augusts_minde` | name | Same as canonical NB | Prinds Christian Augusts Minde |
| en | `munch_museet` | name | Same as canonical NB | MUNCH |
| en | `grotta` | name | Same as canonical NB | Grotten |
| en | `deichman_grunerlokka` | name | Same as canonical NB | Deichman Grünerløkka |
| en | `norli_universitetsgata` | name | Same as canonical NB | Norli Universitetsgata |
| en | `inger_hagerups_plass` | popupDesc | Norwegian leftover | At the end of Hagapynten in Haugerud lies Inger Hagerup Square, a street and residential area named after the poet who l |
| en | `salt` | name | Same as canonical NB | SALT |
| en | `det_norske_teatret` | name | Same as canonical NB | Det Norske Teatret |
| en | `blaa` | name | Same as canonical NB | Blå |
| en | `rockefeller` | name | Same as canonical NB | Rockefeller Music Hall |
| en | `john_dee` | name | Same as canonical NB | John Dee |
| en | `sentrum_scene` | name | Same as canonical NB | Sentrum Scene |
| en | `tollbukaia` | name | Same as canonical NB | Tollbukaia |
| en | `nrk_marienlyst` | name | Same as canonical NB | NRK Marienlyst |
| en | `gronlikaia` | name | Same as canonical NB | Grønlikaia |
| en | `hellerud_gard` | popupDesc | Norwegian leftover | Hellerud Farm preserves traces of an older cultural landscape that existed before modern urban expansion in this part of |
| en | `myralokka` | name | Same as canonical NB | Myraløkka |
| en | `nedre_foss` | name | Same as canonical NB | Nedre Foss |
| en | `groruddammen` | name | Same as canonical NB | Groruddammen |
| en | `svartdalen` | name | Same as canonical NB | Svartdalen |
| en | `kvaernerbyen_alna` | name | Norwegian leftover | Kværnerbyen by the Alna |
| en | `kvaernerbyen_alna` | desc | Norwegian leftover | Urban river point where the Alna is visible again in the city fabric at Kværnerbyen. |
| en | `kvaernerbyen_alna` | popupDesc | Norwegian leftover | By Kværnerbyen, the Alna is visible again in the urban fabric, making the river’s return to the city landscape concrete  |
| en | `bygdoy_huk` | name | Same as canonical NB | Bygdøy Huk |
| en | `bygdoy_paradisbukta` | name | Same as canonical NB | Bygdøy Paradisbukta |
| en | `bygdoy_bygdoynes` | name | Same as canonical NB | Bygdøy Bygdøynes |
| en | `bygdoy_roykenvika` | name | Same as canonical NB | Bygdøy Røykensvika |
| en | `ostensjovannet` | name | Same as canonical NB | Østensjøvannet |
| en | `hovedoya` | name | Same as canonical NB | Hovedøya |
| en | `gressholmen` | name | Same as canonical NB | Gressholmen |
| en | `ljanselva` | name | Same as canonical NB | Ljanselva |
| en | `maerradalen` | name | Same as canonical NB | Mærradalen |
| en | `maridalsvannet` | name | Same as canonical NB | Maridalsvannet |
| en | `noklevann` | name | Same as canonical NB | Nøklevann |
| en | `alnaelva_hovedsteder` | name | Same as canonical NB | Alnaelva |
| en | `noklevann_ljanselva_start` | name | Same as canonical NB | Nøklevann (Ljanselva start) |
| en | `skraperudtjern` | name | Same as canonical NB | Skraperudtjern |
| en | `ljanselva_skullerud` | popupDesc | Norwegian leftover | At Skullerud, Ljanselva runs through forested and open green areas close to urban development. In History Go, this stret |
| en | `youngstorget` | name | Same as canonical NB | Youngstorget |
| en | `eidsvolls_plass` | name | Same as canonical NB | Eidsvolls plass |
| en | `house_of_nerds` | name | Same as canonical NB | House of Nerds |
| en | `folketeateret` | name | Same as canonical NB | Folketeateret |
| en | `chateau_neuf` | name | Same as canonical NB | Chateau Neuf |
| en | `latter` | name | Same as canonical NB | Latter |
| en | `frognerstranda` | name | Same as canonical NB | Frognerstranda |
| en | `grand_hotel` | name | Same as canonical NB | Grand Hotel |
| en | `intility_arena` | name | Same as canonical NB | Intility Arena |
| en | `jordal_amfi` | name | Same as canonical NB | Jordal Amfi |
| en | `gressbanen` | name | Same as canonical NB | Gressbanen |
| en | `ekebergsletta` | name | Same as canonical NB | Ekebergsletta |
| en | `kfum_arena` | name | Same as canonical NB | KFUM Arena |
| en | `vallhall_arena` | name | Same as canonical NB | Vallhall Arena |
| en | `manglerudhallen` | name | Same as canonical NB | Manglerudhallen |
| en | `furuset_forum` | name | Same as canonical NB | Furuset Forum |
| en | `lekeplass_frognerborgen` | name | Same as canonical NB | Frognerborgen |
| en | `hausmania` | name | Same as canonical NB | Hausmania |
| en | `hausmania` | popupDesc | Norwegian leftover | Hausmania in the Hausmann quarter is an alternative cultural arena built on self-organization, art production, and indep |
| en | `skur13` | name | Same as canonical NB | Skur 13 |
| en | `torggata_blad` | name | Same as canonical NB | Torggata Blad |
| en | `bla` | name | Same as canonical NB | Blå |
| en | `tvergastein` | name | Same as canonical NB | Tvergastein |
| en | `gamlebyen_skole` | name | Norwegian leftover | Gamlebyen School |
| en | `gamlebyen_skole` | popupDesc | Norwegian leftover | Gamlebyen School represents an early and lasting layer in Oslo’s educational history. As a school institution in an olde |
| en | `lisbon_praca_do_comercio` | name | Same as canonical NB | Praça do Comércio |
| en | `lisbon_alfama` | name | Same as canonical NB | Alfama |
| en | `lisbon_avenida_da_liberdade` | name | Same as canonical NB | Avenida da Liberdade |
| en | ... | ... | ... | Additional issues omitted after first 120 examples. |
| es | `torggata` | name | Same as canonical NB | Torggata |
| es | `torggata` | popupDesc | Spanish/Portuguese mix risk | La Torggata ilustra cómo la gentrificación, la regulación y el desarrollo inmobiliario moldean a lo largo del tiempo los |
| es | `bispelokket` | desc | Spanish/Portuguese mix risk | Antiguo nudo viario de tres niveles en Bjørvika que articulaba la E18, la Bispegata y la Nylandsveien, y que fue durante |
| es | `karl_johan` | name | Same as canonical NB | Karl Johans gate |
| es | `karl_johan` | popupDesc | Placeholder-like value | La Karl Johans gate es más que una calle comercial. Es el propio eje de la capital moderna, bautizada en honor al rey Ca |
| es | `radhusplassen` | name | Same as canonical NB | Rådhusplassen |
| es | `radhusplassen` | desc | Spanish/Portuguese mix risk | Vasto espacio urbano abierto ante el Ayuntamiento de Oslo, donde puerto, política, festivales y vida cotidiana se encuen |
| es | `radhusplassen` | popupDesc | Spanish/Portuguese mix risk | La Rådhusplassen es uno de los lugares de Oslo donde la ciudad puede cambiar de carácter en pocas horas. Una mañana cual |
| es | `bjorvika` | name | Same as canonical NB | Bjørvika |
| es | `bjorvika` | desc | Spanish/Portuguese mix risk | Antigua zona portuaria y de tráfico transformada en un nuevo paisaje urbano para vivienda, cultura, oficinas y vida ribe |
| es | `bjorvika` | popupDesc | Placeholder-like value | Bjørvika es, quizás, el lugar en el que Oslo ha intentado de forma más nítida reescribir su propia identidad. Durante mu |
| es | `ring_3` | name | Same as canonical NB | Ring 3 |
| es | `ring_3` | desc | Spanish/Portuguese mix risk | Una de las principales arterias de tráfico de Oslo y nítida expresión del planeamiento urbano centrado en el automóvil d |
| es | `ring_3` | popupDesc | Placeholder-like value | La Ring 3 es una de esas estructuras de Oslo con las que casi todo el mundo se relaciona, pero que pocos viven como un l |
| es | `grunerlokka_helgesens_tm` | name | Same as canonical NB | Grünerløkka – Helgesens / Thorvald Meyers |
| es | `toyen_torg` | name | Same as canonical NB | Tøyen torg |
| es | `toyen_torg` | desc | Placeholder-like value | Plaza de barrio en el este interior donde la vida cotidiana, la espera, los encuentros y la convivencia fortuita tienen  |
| es | `st_hanshaugen_park` | desc | Spanish/Portuguese mix risk | Parque en altura, con vistas, caminos, bancos y áreas de permanencia, y uno de los respiros verdes más nítidos de la ciu |
| es | `st_hanshaugen_park` | popupDesc | Spanish/Portuguese mix risk | El parque de St. Hanshaugen ilustra el papel del parque como infraestructura social en la ciudad. No es solo un área ver |
| es | `oslo_s` | name | Same as canonical NB | Oslo S |
| es | `vulkan_energisentral` | popupDesc | Placeholder-like value | La central energética de Vulkan fue desarrollada en el marco de la reconversión de la antigua zona industrial junto al A |
| es | `aker_brygge` | name | Same as canonical NB | Aker Brygge |
| es | `aker_brygge` | desc | Spanish/Portuguese mix risk | Antigua zona de astilleros e industria transformada en comercio, restauración, oficinas, vivienda y recreación junto al  |
| es | `aker_brygge` | popupDesc | Placeholder-like value | Aker Brygge creció en los terrenos del antiguo Akers Mekaniske Verksted, y la historia del lugar es la historia de una c |
| es | `tigeren` | popupDesc | Placeholder-like value | La Tigerstatuen, ante Oslo S, es un buen ejemplo de cómo un simple monumento puede adquirir una vida que va mucho más al |
| es | `gronland_kirke` | desc | Spanish/Portuguese mix risk | Primera iglesia en mampostería del este de Oslo; un hito nítido en una zona obrera históricamente importante y un lugar  |
| es | `gronland_kirke` | popupDesc | Placeholder-like value | La iglesia de Grønland fue erigida en una parte de la ciudad durante mucho tiempo marcada por trabajadores, inmigración, |
| es | `jernbanetorget` | name | Same as canonical NB | Jernbanetorget |
| es | `jernbanetorget` | popupDesc | Spanish/Portuguese mix risk | La Jernbanetorget se sitúa frente a la Oslo Sentralstasjon y es uno de los lugares con más tráfico de Noruega. La plaza  |
| es | `oslo_bussterminal` | popupDesc | English leftover | La terminal de autobuses de Oslo se sitúa al lado de la Oslo Sentralstasjon y funciona como nudo central para viajes en  |
| es | `helsfyr` | name | Same as canonical NB | Helsfyr |
| es | `bogstadveien` | name | Same as canonical NB | Bogstadveien |
| es | `markveien` | name | Same as canonical NB | Markveien |
| es | `markveien` | popupDesc | Spanish/Portuguese mix risk | La Markveien queda en Grünerløkka y ha sido durante mucho tiempo una calle en la que el pequeño comercio, la restauració |
| es | `gronlandsleiret` | name | Same as canonical NB | Grønlandsleiret |
| es | `gronlandsleiret` | desc | Spanish/Portuguese mix risk | La Grønlandsleiret es una calle comercial histórica en el barrio de Grønland, conocida por su variedad de tiendas, resta |
| es | `storgata` | name | Same as canonical NB | Storgata |
| es | `storgata` | popupDesc | Placeholder-like value | La Storgata es una de esas calles de Oslo en las que verdaderamente se nota cómo está construida la ciudad por capas. Es |
| es | `ullevål_hageby` | name | Same as canonical NB | Ullevål Hageby |
| es | `ullevål_hageby` | desc | English leftover | Ullevål Hageby es una de las más conocidas zonas residenciales planeadas de Oslo y se basa en el ideal de la ciudad-jard |
| es | `ullevål_hageby` | popupDesc | Placeholder-like value | Ullevål Hageby fue desarrollada como un gran proyecto de ciudad-jardín en la primera parte del siglo XX y sigue siendo u |
| es | `romsaås` | name | Same as canonical NB | Romsås |
| es | `romsaås` | popupDesc | Spanish/Portuguese mix risk | Romsås fue construida como una de las últimas grandes ciudades-satélite de Oslo, y el área es casi de manual en su lógic |
| es | `rodelokka` | name | Same as canonical NB | Rodeløkka |
| es | `vaalerenga` | name | Same as canonical NB | Vålerenga |
| es | `vaalerenga` | popupDesc | Norwegian leftover | Vålerenga creció como barrio residencial entre Gamlebyen y Kampen, y la edificación incluye varias capas históricas toda |
| es | `vinderen` | name | Same as canonical NB | Vinderen |
| es | `vinderen` | popupDesc | Placeholder-like value | Vinderen se desarrolló como zona residencial a raíz de la apertura de la Holmenkollbanen en 1898, y la expansión mayor o |
| es | `ullern` | name | Same as canonical NB | Ullern |
| es | `spikersuppa` | name | Same as canonical NB | Spikersuppa |
| es | `spikersuppa` | desc | Placeholder-like value | Spikersuppa es un pequeño parque, punto de encuentro y escenario urbano en medio de la Karl Johans gate, en el centro de |
| es | `bankplassen` | name | Same as canonical NB | Bankplassen |
| es | `bankplassen` | popupDesc | Placeholder-like value | La Bankplassen se sitúa en pleno Kvadraturen, la parte del centro en la que la ciudad temprana, planeada tras el siglo X |
| es | `christiania_torv` | name | Same as canonical NB | Christiania Torv |
| es | `christiania_torv` | popupDesc | Spanish/Portuguese mix risk | Christiania Torv se sitúa en la parte planeada más antigua del actual centro y es un lugar clave para entender cómo fue  |
| es | `slottsparken` | name | Same as canonical NB | Slottsparken |
| es | `slottsparken` | desc | Spanish/Portuguese mix risk | El Slottsparken es uno de los parques más grandes y centrales de Oslo y rodea el Palacio Real con anchas alamedas, vasta |
| es | `slottsparken` | popupDesc | Spanish/Portuguese mix risk | El Slottsparken se extiende en torno al Palacio Real y tiene un doble papel que lo hace particularmente interesante en a |
| es | `botsparken` | name | Same as canonical NB | Botsparken |
| es | `botsparken` | desc | Spanish/Portuguese mix risk | El Botsparken es un espacio verde urbano junto a la antigua prisión de Botsfengselet, en el este de Oslo, utilizado para |
| es | `stensparken` | name | Same as canonical NB | Stensparken |
| es | `stensparken` | popupDesc | Spanish/Portuguese mix risk | El Stensparken se sitúa en una elevación y ocupa una posición particular en el paisaje urbano, tanto física como socialm |
| es | `nydalen` | name | Same as canonical NB | Nydalen |
| es | `nydalen` | desc | Spanish/Portuguese mix risk | Nydalen es una antigua zona industrial a lo largo del Akerselva que ha sido reconvertida en un barrio moderno, con ofici |
| es | `tjuvholmen` | name | Same as canonical NB | Tjuvholmen |
| es | `tjuvholmen` | popupDesc | Spanish/Portuguese mix risk | Tjuvholmen fue desarrollada desde los años 2000 como un nuevo barrio sobre antiguos terrenos portuarios y de relleno, en |
| es | `sorenga` | name | Same as canonical NB | Sørenga |
| es | `majorstuen_tbanestasjon` | popupDesc | English leftover | La estación de metro de Majorstuen es uno de los puntos más importantes de la red de metro de Oslo y tiene desde hace mu |
| es | `nationaltheatret_stasjon` | popupDesc | Placeholder-like value | La estación de Nationaltheatret es un lugar en el que Oslo casi muestra todo su sistema de transportes a la vez. Bajo la |
| es | `olaf_ryes_plass` | name | Same as canonical NB | Olaf Ryes plass |
| es | `olaf_ryes_plass` | popupDesc | Placeholder-like value | La Olaf Ryes plass se sitúa en el corazón de Grünerløkka y es un buen ejemplo de cómo un espacio público más pequeño pue |
| es | `birkelunden` | name | Same as canonical NB | Birkelunden |
| es | `birkelunden` | desc | Spanish/Portuguese mix risk | Birkelunden es un parque muy utilizado en Grünerløkka y un importante espacio verde urbano para recreación, permanencia, |
| es | `birkelunden` | popupDesc | Spanish/Portuguese mix risk | Birkelunden tiene una posición particular en Grünerløkka porque es simultáneamente parque, entorno cultural y espacio co |
| es | `akerselva` | name | Same as canonical NB | Akerselva |
| es | `akerselva` | popupDesc | Placeholder-like value | El Akerselva tuvo un papel decisivo en el desarrollo de Oslo, simultáneamente como recurso natural, eje industrial y fro |
| es | `universitetsplassen` | name | Same as canonical NB | Universitetsplassen |
| es | `operahuset` | name | Same as canonical NB | Operahuset |
| es | `deichman_bjorvika` | name | Same as canonical NB | Deichman Bjørvika |
| es | `deichman_bjorvika` | popupDesc | Spanish/Portuguese mix risk | La Deichman Bjørvika es simultáneamente biblioteca, casa de la literatura y espacio urbano público, y es, así, uno de lo |
| es | `barcode` | name | Same as canonical NB | Barcode |
| es | `vigelandsparken` | name | Same as canonical NB | Vigelandsparken |
| es | `vigelandsparken` | popupDesc | Spanish/Portuguese mix risk | El Vigelandsparken es uno de los lugares más ambivalentes de Oslo: un espacio urbano verde y vivo en uso cotidiano, y si |
| es | `carl_berner_plass` | name | Same as canonical NB | Carl Berners plass |
| es | `tullin` | name | Same as canonical NB | Tullin |
| es | `tullin` | popupDesc | Spanish/Portuguese mix risk | El área de Tullin se extiende a lo largo de Pilestredet y Ring 1 y está moldeada por oficinas, instituciones de enseñanz |
| es | `okern` | name | Same as canonical NB | Økern |
| es | `okern` | popupDesc | Spanish/Portuguese mix risk | Økern es un ejemplo clave de transformación urbana en el este de Oslo. La zona ha pasado de un paisaje esencialmente com |
| es | `skoyen` | name | Same as canonical NB | Skøyen |
| es | `skoyen` | popupDesc | Spanish/Portuguese mix risk | Skøyen funciona como nudo de transportes y de oficinas en el oeste de Oslo, donde el ferrocarril, la red rodada y las co |
| es | `torshov` | name | Same as canonical NB | Torshov |
| es | `torshov` | popupDesc | Spanish/Portuguese mix risk | Torshov es un ejemplo nítido de núcleo de barrio en el nordeste interior de Oslo. La zona combina manzanas residenciales |
| es | `grorud` | name | Same as canonical NB | Grorud |
| es | `grorud` | popupDesc | Spanish/Portuguese mix risk | Grorud es un núcleo de barrio en la Groruddalen, organizado en torno a la estación, un centro local y una estructura res |
| es | `middelalder_oslo` | name | Same as canonical NB | Middelalderparken |
| es | `middelalder_oslo` | desc | Norwegian leftover | Área histórica en Gamlebyen – los restos de la Oslo medieval. |
| es | `middelalder_oslo` | popupDesc | Norwegian leftover | El Middelalderparken se extiende por el área en la que la antigua Oslo creció en la Alta Edad Media, y aquí son visibles |
| es | `gamlebyen_gravlund` | name | Norwegian leftover | Cementerio de Gamlebyen |
| es | `gamlebyen_gravlund` | popupDesc | Norwegian leftover | El cementerio de Gamlebyen fue creado en el siglo XIX y está entre los más antiguos de la zona en torno al núcleo histór |
| es | `gamle_aker_kirke` | popupDesc | Norwegian leftover | La Gamle Aker kirke es el edificio preservado más antiguo de Oslo y uno de los vestigios medievales más concretos de la  |
| es | `villa_grande` | name | Same as canonical NB | Villa Grande |
| es | `mollergata_19` | name | Same as canonical NB | Møllergata 19 |
| es | `nonneseter_kloster` | desc | Norwegian leftover | Convento femenino medieval en Gamlebyen, vinculado al poder eclesiástico, a la vida monástica femenina y al paisaje reli |
| es | `oslo_ladegard` | name | Same as canonical NB | Oslo ladegård |
| es | `oslo_ladegard` | desc | Norwegian leftover | Edificio barroco en Gamlebyen y puerta de entrada a la divulgación de la ciudad medieval, con capas de monasterio, palac |
| es | `oslo_ladegard` | popupDesc | Spanish/Portuguese mix risk | Oslo ladegård es un nudo histórico en el que se encuentran varias capas de la historia de Oslo. El edificio del siglo XV |
| es | `gamle_radhus` | name | Same as canonical NB | Gamle rådhus |
| es | `gamle_radhus` | popupDesc | Spanish/Portuguese mix risk | El Gamle rådhus es uno de los vestigios más importantes de Christiania tras el traslado de la ciudad en 1624. El edifici |
| es | `galgeberg` | name | Same as canonical NB | Galgeberg |
| es | `galgeberg` | popupDesc | English leftover | Galgeberg lleva el nombre del antiguo lugar de ejecución de la ciudad y abre una parte más sombría de la historia de Osl |
| es | `oslo_hospital` | name | Same as canonical NB | Oslo hospital |
| es | `oslo_hospital` | desc | Norwegian leftover | Antiguo hospital en Gamlebyen, con raíces en la historia monástica y asistencial postreformista. |
| es | `oslo_hospital` | popupDesc | Norwegian leftover | El Oslo hospital muestra una larga línea que va de la asistencia religiosa medieval a la historia institucional y sanita |
| es | `botsfengselet` | name | Same as canonical NB | Botsfengselet |
| es | `botsfengselet` | popupDesc | Spanish/Portuguese mix risk | El Botsfengselet, a menudo llamado Botsen, fue inaugurado en 1851 como prisión central para reclusos masculinos de larga |
| es | `prinds_christian_augusts_minde` | name | Same as canonical NB | Prinds Christian Augusts Minde |
| es | `prinds_christian_augusts_minde` | popupDesc | Spanish/Portuguese mix risk | Prinds Christian Augusts Minde, a menudo llamado Prindsen, es uno de los conjuntos histórico-sociales más importantes de |
| es | `eidsvollsbygningen` | popupDesc | English leftover | El Eidsvollsbygningen es el lugar en el que la Constitución noruega fue redactada y aprobada en la primavera de 1814. El |
| es | `nasjonalmuseet` | name | Same as canonical NB | Nasjonalmuseet |
| es | `nasjonalmuseet` | popupDesc | English leftover | El Nasjonalmuseet, en el solar de la antigua Vestbanen, reúne en un único edificio nacional las instituciones antes sepa |
| es | ... | ... | ... | Additional issues omitted after first 120 examples. |
| pt | `torggata` | name | Same as canonical NB | Torggata |
| pt | `bispelokket` | popupDesc | Placeholder-like value | O Bispelokket é um dos exemplos mais nítidos em Oslo de como uma infraestrutura pode moldar todo o relacionamento de uma |
| pt | `karl_johan` | name | Same as canonical NB | Karl Johans gate |
| pt | `karl_johan` | popupDesc | Placeholder-like value | A Karl Johans gate é mais do que uma rua comercial. É o próprio eixo da capital moderna, batizada em honra do rei Carlos |
| pt | `radhusplassen` | name | Same as canonical NB | Rådhusplassen |
| pt | `radhusplassen` | popupDesc | Spanish/Portuguese mix risk | A Rådhusplassen é um dos lugares de Oslo em que a cidade pode mudar de carácter em poucas horas. Numa manhã comum de dia |
| pt | `bjorvika` | name | Same as canonical NB | Bjørvika |
| pt | `ring_3` | name | Same as canonical NB | Ring 3 |
| pt | `grunerlokka_helgesens_tm` | name | Same as canonical NB | Grünerløkka – Helgesens / Thorvald Meyers |
| pt | `toyen_torg` | name | Same as canonical NB | Tøyen torg |
| pt | `oslo_s` | name | Same as canonical NB | Oslo S |
| pt | `vulkan_energisentral` | popupDesc | Placeholder-like value | A central energética de Vulkan foi desenvolvida no quadro da reconversão da antiga zona industrial junto ao Akerselva nu |
| pt | `aker_brygge` | name | Same as canonical NB | Aker Brygge |
| pt | `aker_brygge` | popupDesc | Norwegian leftover | Aker Brygge cresceu na área do antigo Akers Mekaniske Verksted, e a história do lugar é, por isso, a história de uma cid |
| pt | `gronland_kirke` | popupDesc | Placeholder-like value | A igreja de Grønland foi erguida numa parte da cidade durante muito tempo marcada por trabalhadores, imigração, habitaçã |
| pt | `jernbanetorget` | name | Same as canonical NB | Jernbanetorget |
| pt | `helsfyr` | name | Same as canonical NB | Helsfyr |
| pt | `bogstadveien` | name | Same as canonical NB | Bogstadveien |
| pt | `markveien` | name | Same as canonical NB | Markveien |
| pt | `gronlandsleiret` | name | Same as canonical NB | Grønlandsleiret |
| pt | `storgata` | name | Same as canonical NB | Storgata |
| pt | `ullevål_hageby` | name | Same as canonical NB | Ullevål Hageby |
| pt | `ullevål_hageby` | desc | English leftover | Ullevål Hageby é um dos mais conhecidos bairros habitacionais planeados de Oslo e baseia-se no ideal da cidade-jardim do |
| pt | `romsaås` | name | Same as canonical NB | Romsås |
| pt | `rodelokka` | name | Same as canonical NB | Rodeløkka |
| pt | `vaalerenga` | name | Same as canonical NB | Vålerenga |
| pt | `vaalerenga` | popupDesc | Norwegian leftover | Vålerenga cresceu como bairro habitacional entre Gamlebyen e Kampen, e a edificação inclui várias camadas históricas ain |
| pt | `vinderen` | name | Same as canonical NB | Vinderen |
| pt | `ullern` | name | Same as canonical NB | Ullern |
| pt | `spikersuppa` | name | Same as canonical NB | Spikersuppa |
| pt | `spikersuppa` | desc | Placeholder-like value | Spikersuppa é um pequeno parque, ponto de encontro e palco urbano no meio da Karl Johans gate, no centro de Oslo, onde a |
| pt | `bankplassen` | name | Same as canonical NB | Bankplassen |
| pt | `bankplassen` | popupDesc | Placeholder-like value | A Bankplassen situa-se em pleno Kvadraturen, a parte do centro em que a cidade precoce, planeada após o século XVII, ain |
| pt | `christiania_torv` | name | Same as canonical NB | Christiania Torv |
| pt | `slottsparken` | name | Same as canonical NB | Slottsparken |
| pt | `botsparken` | name | Same as canonical NB | Botsparken |
| pt | `stensparken` | name | Same as canonical NB | Stensparken |
| pt | `nydalen` | name | Same as canonical NB | Nydalen |
| pt | `tjuvholmen` | name | Same as canonical NB | Tjuvholmen |
| pt | `sorenga` | name | Same as canonical NB | Sørenga |
| pt | `nationaltheatret_stasjon` | popupDesc | Placeholder-like value | A estação de Nationaltheatret é um lugar em que Oslo quase mostra todo o seu sistema de transportes de uma só vez. Sob a |
| pt | `olaf_ryes_plass` | name | Same as canonical NB | Olaf Ryes plass |
| pt | `olaf_ryes_plass` | popupDesc | Placeholder-like value | A Olaf Ryes plass situa-se no coração de Grünerløkka e é um bom exemplo de como um espaço público mais pequeno pode torn |
| pt | `birkelunden` | name | Same as canonical NB | Birkelunden |
| pt | `akerselva` | name | Same as canonical NB | Akerselva |
| pt | `akerselva` | popupDesc | Placeholder-like value | O Akerselva teve um papel decisivo no desenvolvimento de Oslo, simultaneamente como recurso natural, eixo industrial e f |
| pt | `universitetsplassen` | name | Same as canonical NB | Universitetsplassen |
| pt | `operahuset` | name | Same as canonical NB | Operahuset |
| pt | `deichman_bjorvika` | name | Same as canonical NB | Deichman Bjørvika |
| pt | `barcode` | name | Same as canonical NB | Barcode |
| pt | `vigelandsparken` | name | Same as canonical NB | Vigelandsparken |
| pt | `carl_berner_plass` | name | Same as canonical NB | Carl Berners plass |
| pt | `tullin` | name | Same as canonical NB | Tullin |
| pt | `okern` | name | Same as canonical NB | Økern |
| pt | `skoyen` | name | Same as canonical NB | Skøyen |
| pt | `torshov` | name | Same as canonical NB | Torshov |
| pt | `grorud` | name | Same as canonical NB | Grorud |
| pt | `middelalder_oslo` | name | Same as canonical NB | Middelalderparken |
| pt | `middelalder_oslo` | desc | Norwegian leftover | Área histórica em Gamlebyen – os restos da Oslo medieval. |
| pt | `middelalder_oslo` | popupDesc | Norwegian leftover | O Middelalderparken estende-se na área onde a antiga Oslo cresceu na Alta Idade Média, e aqui são visíveis vestígios das |
| pt | `gamlebyen_gravlund` | name | Norwegian leftover | Cemitério de Gamlebyen |
| pt | `gamlebyen_gravlund` | popupDesc | Norwegian leftover | O cemitério de Gamlebyen foi instituído no século XIX e está entre os mais antigos da zona em torno do núcleo histórico  |
| pt | `gamle_aker_kirke` | popupDesc | Norwegian leftover | A Gamle Aker kirke é o mais antigo edifício preservado de Oslo e um dos mais concretos vestígios medievais da cidade atu |
| pt | `villa_grande` | name | Same as canonical NB | Villa Grande |
| pt | `mollergata_19` | name | Same as canonical NB | Møllergata 19 |
| pt | `nonneseter_kloster` | desc | Norwegian leftover | Mosteiro feminino medieval em Gamlebyen, ligado ao poder eclesiástico, à vida monástica feminina e à mais antiga paisage |
| pt | `oslo_ladegard` | name | Same as canonical NB | Oslo ladegård |
| pt | `oslo_ladegard` | desc | Norwegian leftover | Edifício barroco em Gamlebyen e porta de entrada para a divulgação da cidade medieval, com camadas de mosteiro, paço epi |
| pt | `gamle_radhus` | name | Same as canonical NB | Gamle rådhus |
| pt | `galgeberg` | name | Same as canonical NB | Galgeberg |
| pt | `galgeberg` | popupDesc | English leftover | Galgeberg traz o nome do antigo lugar de execução da cidade e abre uma parte mais sombria da história de Oslo. O lugar m |
| pt | `oslo_hospital` | name | Same as canonical NB | Oslo hospital |
| pt | `oslo_hospital` | desc | Norwegian leftover | Antigo hospital em Gamlebyen, com raízes na história monástica e assistencial pós-Reforma. |
| pt | `oslo_hospital` | popupDesc | Norwegian leftover | O Oslo hospital mostra uma longa linha que vai da assistência religiosa medieval à história institucional e sanitária da |
| pt | `botsfengselet` | name | Same as canonical NB | Botsfengselet |
| pt | `prinds_christian_augusts_minde` | name | Same as canonical NB | Prinds Christian Augusts Minde |
| pt | `eidsvollsbygningen` | popupDesc | English leftover | O Eidsvollsbygningen é o lugar em que a Constituição norueguesa foi redigida e aprovada na primavera de 1814. O edifício |
| pt | `nasjonalmuseet` | name | Same as canonical NB | Nasjonalmuseet |
| pt | `nasjonalmuseet` | popupDesc | English leftover | O Nasjonalmuseet, no terreno da antiga Vestbanen, reúne num único edifício nacional as instituições antes separadas para |
| pt | `munch_museet` | name | Same as canonical NB | MUNCH |
| pt | `munch_museet` | popupDesc | English leftover | O MUNCH em Bjørvika administra e divulga o legado de Edvard Munch num novo edifício em altura junto ao Oslofjorden. A tr |
| pt | `astrup_fearnley` | name | Same as canonical NB | Astrup Fearnley Museet |
| pt | `astrup_fearnley` | popupDesc | English leftover | O Astrup Fearnley Museet, em Tjuvholmen, é uma arena central da arte contemporânea em Oslo, com uma história de coleção  |
| pt | `ekebergparken` | popupDesc | English leftover | O Ekebergparken conjuga escultura, percurso natural e miradouro numa paisagem acidentada sobre a cidade. As obras estão  |
| pt | `grotta` | name | Same as canonical NB | Grotten |
| pt | `nationaltheatret` | name | Same as canonical NB | Nationaltheatret |
| pt | `litteraturhuset` | name | Same as canonical NB | Litteraturhuset |
| pt | `deichman_grunerlokka` | name | Same as canonical NB | Deichman Grünerløkka |
| pt | `kulturkirken_jakob_litteratur` | name | Same as canonical NB | Kulturkirken Jakob |
| pt | `norli_universitetsgata` | name | Same as canonical NB | Norli Universitetsgata |
| pt | `proysenhuset_rudshogda` | name | Same as canonical NB | Prøysenhuset – Rudshøgda |
| pt | `inger_hagerups_plass` | name | Same as canonical NB | Inger Hagerups plass |
| pt | `alexander_kiellands_plass` | name | Same as canonical NB | Alexander Kiellands plass |
| pt | `alexander_kiellands_plass` | popupDesc | Spanish/Portuguese mix risk | A Alexander Kiellands plass recebeu este nome em 1913 para honrar o autor de «Garman & Worse» e «Gift». A praça situa-se |
| pt | `salt` | name | Same as canonical NB | SALT |
| pt | `det_norske_teatret` | name | Same as canonical NB | Det Norske Teatret |
| pt | `blaa` | name | Same as canonical NB | Blå |
| pt | `rockefeller` | name | Same as canonical NB | Rockefeller Music Hall |
| pt | `john_dee` | name | Same as canonical NB | John Dee |
| pt | `sentrum_scene` | name | Same as canonical NB | Sentrum Scene |
| pt | `oslo_gassverk` | popupDesc | English leftover | A Fábrica de Gás de Oslo, em Grønland, foi o núcleo do abastecimento de gás da cidade desde meados do século XIX. A part |
| pt | `havnelageret` | desc | Placeholder-like value | Erguido na década de 1920 como o maior edifício em betão da Escandinávia – armazenou café, cereais e produtos coloniais  |
| pt | `havnelageret` | popupDesc | English leftover | O Armazém Portuário de Oslo, em Vippetangen, foi erguido para armazenamento em larga escala de mercadorias importadas no |
| pt | `tollbukaia` | name | Same as canonical NB | Tollbukaia |
| pt | `oslo_posthus` | popupDesc | English leftover | Os Correios de Oslo foram um nó central de triagem e distribuição postal na capital. O edifício articulava o caminho de  |
| pt | `telegrafbygningen` | popupDesc | English leftover | O Edifício do Telégrafo, no centro, foi um pivot tecnológico para a telegrafia e a telefonia. A partir daqui, mensagens, |
| pt | `nrk_marienlyst` | name | Same as canonical NB | NRK Marienlyst |
| pt | `grunnlovsbygget_bankplassen` | popupDesc | English leftover | A antiga sede do Norges Bank, na Bankplassen, foi uma instituição-chave na construção da economia monetária norueguesa.  |
| pt | `akershus_kaier` | desc | Placeholder-like value | Artéria do comércio na antiga Christiania – aqui chegavam mercadorias, peixe, carvão e madeira de todo o mundo. |
| pt | `akershus_kaier` | popupDesc | English leftover | Os cais de Akershus foram uma arena principal para a descarga, o transbordo e o embarque de mercadorias com destino ou o |
| pt | `fornebu_teknologipark` | popupDesc | English leftover | Fornebu passou de aeroporto a área empresarial tecnológica, com escritórios, serviços digitais e postos de trabalho do c |
| pt | `ulven_handelspark` | popupDesc | English leftover | O parque comercial de Ulven representa a passagem das antigas áreas industriais e de transporte para o comércio, o armaz |
| pt | `akershus_energi` | name | Same as canonical NB | Akershus Energi Varme |
| pt | `akershus_energi` | popupDesc | English leftover | A Akershus Energi Varme faz parte do abastecimento energético moderno da região metropolitana, através do aquecimento ur |
| pt | `sagene_kvernhus` | popupDesc | English leftover | A área dos moinhos e do moinho de Sagene aproveitava a energia hidráulica do Akerselva para a produção industrial precoc |
| pt | `ovre_foss` | name | Same as canonical NB | Øvre Foss – Hjula Veveri |
| pt | `ovre_foss` | popupDesc | English leftover | Em Øvre Foss/Hjula reuniam-se em larga escala a energia hidráulica, a produção têxtil e o trabalho fabril. O conjunto es |
| pt | `oslo_mek` | name | Same as canonical NB | Oslo Mekaniske Verksted |
| pt | `oslo_mek` | popupDesc | Norwegian leftover | A Oslo Mekaniske Verksted foi um importante meio de produção de máquinas e indústria marítima na área portuária. A ofici |
| pt | `schous_bryggeri` | popupDesc | English leftover | A cervejaria Schous, em Grünerløkka, era simultaneamente unidade de produção e grande posto de trabalho numa cidade indu |
| pt | ... | ... | ... | Additional issues omitted after first 120 examples. |

## Recommended next batch

Primær anbefaling: **Content i18n batch 4 — translate top visible Oslo places to en/es/pt**.

| Priority | placeId | Name/title | Missing languages | Missing fields | Reason |
|---:|---|---|---|---|---|
| 1 | `torggata` | Torggata | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 2 | `gronland_basarene` | Grønland basarene | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 3 | `karl_johan` | Karl Johans gate | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 4 | `bjorvika` | Bjørvika | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 5 | `oslo_s` | Oslo S | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 6 | `aker_brygge` | Aker Brygge | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 7 | `tjuvholmen` | Tjuvholmen | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 8 | `akerselva` | Akerselva | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 9 | `operahuset` | Operahuset | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 10 | `vigelandsparken` | Vigelandsparken | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 11 | `bispelokket` | Bispelokket / Trafikkmaskinen | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 12 | `radhusplassen` | Rådhusplassen | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 13 | `ring_3` | Ring 3 | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 14 | `trikk_17_18` | Trikkelinje 17/18 | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 15 | `grunerlokka_helgesens_tm` | Grünerløkka – Helgesens / Thorvald Meyers | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 16 | `toyen_torg` | Tøyen torg | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 17 | `majorstuen_krysset` | Majorstuen krysset | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 18 | `st_hanshaugen_park` | St. Hanshaugen park | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 19 | `vulkan_energisentral` | Vulkan energisentral | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |
| 20 | `tigeren` | Tigerstatuen | Partial only | name, desc, popupDesc | Oslo/by-flow visibility, PlaceCard fields present, and existing partial translations can be completed quickly. |

## Validation

Kommandoer/scripts kjørt:

`npm run i18n:places:check` was also run. It completed TypeScript/build steps and reached the existing place audit, which reported translation work still needed: 991 master places, 563 missing translations, 73 hash-stale translations and 6 extra ids for `en` before exiting non-zero. This is expected for a report-only coverage batch and was not used to block the report.

```sh
node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"
```

```sh
rg -n "localizePlace|localizePlaces|loadPlaceTranslations|currentPlaceDict|getPlaceTranslationKeys|data/i18n/content/places|content/places" js data
```

```sh
find data/places -type f -name "*.json" | sort
```

```sh
find data/i18n/content/places -maxdepth 1 -type f | sort
```

```sh
node /tmp/places_coverage.js > reports/content-i18n-places-coverage-batch-3.md
```

```sh
git diff --check
```

## Final note

No runtime files changed. No UI dictionaries changed. No place translation files changed. No canonical place data changed.
