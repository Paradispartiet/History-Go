# Visual design codes – audit

Generert: 2026-06-07T09:24:25.461Z

> Denne rapporten viser ikke bare dekning, men også konkrete kandidater for
> neste batch. Full, uavkortet liste finnes alltid i
> [`reports/visual-design-codes-audit.json`](visual-design-codes-audit.json).

## Register

- designCodes totalt: **58**
- per entityType:
  - place: 25
  - person: 18
  - article: 15
  - story: 15
  - leksikon: 15
  - lesespor: 15

## Data funnet

- places: 489
- people: 426
- leksikon: 335
- lesespor: 9
- artikler totalt (leksikon + lesespor): 344

## Resolusjon

- eksplisitt `visual.designCode`: 249
- per kilde (alle entiteter):
  - explicit: 249
  - assetType: 0
  - category: 264
  - heuristic: 421
  - default: 325

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 98 | 0 | 132 | 247 | 12 |
| people | 88 | 0 | 132 | 144 | 62 |
| articles | 63 | 0 | 0 | 30 | 251 |

## Eksplisitt pilot-merkede designCodes

- places (98):
  - `park_miniature`: 13
  - `church_miniature`: 11
  - `station_miniature`: 9
  - `stadium_miniature`: 8
  - `museum_miniature`: 8
  - `square_miniature`: 7
  - `cinema_miniature`: 7
  - `university_miniature`: 6
  - `theatre_miniature`: 5
  - `library_miniature`: 5
  - `street_miniature`: 4
  - `waterfront_miniature`: 4
  - `ice_arena_miniature`: 4
  - `civic_miniature`: 2
  - `fortress_miniature`: 2
  - `commerce_miniature`: 1
  - `industrial_miniature`: 1
  - `school_miniature`: 1
- people (88):
  - `person_scientist_miniature`: 15
  - `person_musician_miniature`: 15
  - `person_writer_miniature`: 14
  - `person_politician_miniature`: 13
  - `person_athlete_miniature`: 9
  - `person_poet_miniature`: 5
  - `person_runner_miniature`: 5
  - `person_footballer_miniature`: 4
  - `person_skier_miniature`: 4
  - `person_activist_miniature`: 3
  - `person_historical_miniature`: 1
- articles (63):
  - `article_architecture_miniature`: 16
  - `article_history_miniature`: 13
  - `article_sports_history_miniature`: 11
  - `article_place_essay_miniature`: 9
  - `article_art_miniature`: 5
  - `article_political_history_miniature`: 3
  - `article_literature_miniature`: 3
  - `article_local_story_miniature`: 1
  - `article_groundhopper_miniature`: 1
  - `article_object_story_miniature`: 1

## Pilot batch 2

- Batch 1-baseline: 73 eksplisitte `visual.designCode` (28 places, 30 people, 15 articles).
- Nåværende total etter batch 2: 249 eksplisitte `visual.designCode`.
- Netto økning etter batch 1: 176 (70 places, 58 people, 48 articles).
- Omfang: Kontrollert Pilot batch 2: høy nytte for sentrale kartsteder, stedskoblede people og kunnskapslagartikler.

## Topp brukte designCodes

- `article_default_miniature`: 251
- `waterfront_miniature`: 87
- `park_miniature`: 63
- `person_default_miniature`: 62
- `person_writer_miniature`: 45
- `person_historical_miniature`: 44
- `person_scientist_miniature`: 41
- `person_activist_miniature`: 38
- `person_musician_miniature`: 36
- `apartment_block_miniature`: 28
- `person_politician_miniature`: 28
- `person_artist_miniature`: 28
- `museum_miniature`: 27
- `commerce_miniature`: 25
- `university_miniature`: 25

## Default-kandidater for neste batch

Entiteter som fortsatt løses via default-fallback. Dette er den neste
ryddelisten – kandidater som kan vurderes for eksplisitt designCode.

#### Places som fortsatt er `default_miniature` (12)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| eidsvollsbygningen | Eidsvollsbygningen | historie | data/places/historie/oslo/places_historie.json |
| grini_fangeleir | Grini fangeleir | historie | data/places/historie/oslo/places_historie.json |
| villa_grande | Villa Grande | historie | data/places/historie/oslo/places_historie.json |
| bogstad_gard | Bogstad gård | historie | data/places/historie/oslo/places_historie.json |
| oslo_ladegard | Oslo ladegård | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| gamle_radhus | Gamle rådhus | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| galgeberg | Galgeberg | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| oslo_hospital | Oslo hospital | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| botsfengselet | Botsfengselet | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| hellerud_gard | Hellerud gård | historie | data/places/natur/oslo/places_oslo_alna.json |
| lisbon_padrao_dos_descobrimentos | Padrão dos Descobrimentos | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json |

#### People som fortsatt er `person_default_miniature` (62)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| christian_heinrich_grosch | Christian Heinrich Grosch | by | data/people/by/oslo/people_by_oslo.json |
| harald_hals | Harald Hals | by | data/people/by/oslo/people_by_oslo.json |
| arne_korsmo | Arne Korsmo | by | data/people/by/oslo/people_by_oslo.json |
| kong_christian_iv | Kong Christian IV | by | data/people/by/oslo/people_by_oslo.json |
| arnstein_arneberg | Arnstein Arneberg | by | data/people/by/oslo/people_by_oslo.json |
| magnus_poulsson | Magnus Poulsson | by | data/people/by/oslo/people_by_oslo.json |
| henrik_bull | Henrik Bull | by | data/people/by/oslo/people_by_oslo.json |
| erling_viksjo | Erling Viksjø | by | data/people/by/oslo/people_by_oslo.json |
| sverre_fehn | Sverre Fehn | by | data/people/by/oslo/people_by_oslo.json |
| ove_bang | Ove Bang | by | data/people/by/oslo/people_by_oslo.json |
| harald_aars | Harald Aars | by | data/people/by/oslo/people_by_oslo.json |
| kirsten_sand | Kirsten Sand | by | data/people/by/oslo/people_by_oslo.json |
| sverre_pedersen | Sverre Pedersen | by | data/people/by/oslo/people_by_oslo.json |
| christian_norberg_schulz | Christian Norberg-Schulz | by | data/people/by/oslo/people_by_oslo.json |
| thomas_thiis_evensen | Thomas Thiis-Evensen | by | data/people/by/oslo/people_by_oslo.json |
| geir_grung | Geir Grung | by | data/people/by/oslo/people_by_oslo.json |
| fritz_heinrich_frolich | Fritz Heinrich Frølich | by | data/people/by/oslo/people_by_oslo.json |
| gunnar_jahn_statistikk_og_styring | Gunnar Jahn | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| nicolai_rygg_sentralbank | Nicolai Rygg | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| anton_martin_schweigaard_okonomi | Anton Martin Schweigaard | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| sam_eyde_industriutbygger | Sam Eyde | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| kristian_birkeland_teknologi_og_industri | Kristian Birkeland | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| christen_smith_schous_bryggeri | Christen Smith | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| ellef_ringnes_bryggeri_og_ledelse | Ellef Ringnes | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| christian_schweigaard_post_og_administrasjon | Christian Schweigaard | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| alf_bjercke_industri_og_kvalitet | Alf Bjercke | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| thomas_heftye_bank_og_byutvikling | Thomas Heftye | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| olav_thon_eiendom_og_handel | Olav Thon | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| petter_stordalen_hotell_og_service | Petter Stordalen | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| stein_erik_hagen_handel | Stein Erik Hagen | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| amund_ringnes_bryggeri | Amund Ringnes | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| herman_schou_bryggeri | Herman Schou | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| fred_olsen_shipping | Fred. Olsen | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| wilhelm_wilhelmsen_shipping | Wilhelm Wilhelmsen | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| anders_jahre_shipping | Anders Jahre | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| nicolay_august_andresen_bank | Nicolay August Andresen | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| ellef_ringnes | Ellef Ringnes | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| amund_ringnes | Amund Ringnes | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| halvor_schou | Halvor Schou | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| tony_elliott | Tony Elliott | naeringsliv | data/people/naeringsliv/europe/portugal/lisbon/people_naeringsliv_lisbon.json |

_Viser 40 av 62. Full liste i `reports/visual-design-codes-audit.json`._

#### Artikler som fortsatt er `article_default_miniature` (251)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| alnaelva | alnaelva | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnaelvstien | alnaelvstien | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| loelva_historisk | loelva_historisk | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| trosterud_friomrade | trosterud_friomrade | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| furuset_haugerud_skogbelte | furuset_haugerud_skogbelte | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnabru_jernbane_og_logistikk | alnabru_jernbane_og_logistikk | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| damstredet_telthusbakken | damstredet_telthusbakken | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| gamle_trikkestallen | gamle_trikkestallen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| sofienberg_kirke | sofienberg_kirke | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| gamlebyen_gravlund | gamlebyen_gravlund | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| bjoelsenfossen | bjoelsenfossen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| glads_molle | glads_molle | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| voienfossen | voienfossen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| nedre_foss | nedre_foss | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| vaterland_historisk_elvelop | vaterland_historisk_elvelop | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| lisbon_castelo_de_sao_jorge | lisbon_castelo_de_sao_jorge | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_aqueduto_das_aguas_livres | lisbon_aqueduto_das_aguas_livres | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_convento_do_carmo | lisbon_convento_do_carmo | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_padrao_dos_descobrimentos | lisbon_padrao_dos_descobrimentos | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_estacao_do_rossio | lisbon_estacao_do_rossio | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| bispelokket | bispelokket | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| ring_3 | ring_3 | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| trikk_17_18 | trikk_17_18 | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| grunerlokka_helgesens_tm | grunerlokka_helgesens_tm | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| toyen_torg | toyen_torg | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| majorstuen_krysset | majorstuen_krysset | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| st_hanshaugen_park | st_hanshaugen_park | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| oslo_s | oslo_s | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| vulkan_energisentral | vulkan_energisentral | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| aker_brygge | aker_brygge | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| tigeren | tigeren | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| gronland_kirke | gronland_kirke | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| kampen_kirke | kampen_kirke | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| jernbanetorget | jernbanetorget | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| oslo_bussterminal | oslo_bussterminal | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| helsfyr | helsfyr | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| bogstadveien | bogstadveien | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| gronlandsleiret | gronlandsleiret | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| storgata | storgata | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| ullevål_hageby | ullevål_hageby | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |

_Viser 40 av 251. Full liste i `reports/visual-design-codes-audit.json`._

## Heuristiske kandidater for eksplisitt designCode

Entiteter uten eksplisitt kode, men der resolveren gir en konkret kode via
heuristikk. High-confidence treff er trygge kandidater for eksplisitt merking.

### Places

- totalt: 247 (high 54, medium 187, low 6)

#### Topp high-confidence (54)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| tigeren | Tigerstatuen | station_miniature | keyword: stasjon |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | church_miniature | keyword: kirke |
| norli_universitetsgata | Norli Universitetsgata | university_miniature | keyword: universitet |
| fornebu_teknologipark | Fornebu Teknologipark | park_miniature | keyword: park |
| ulven_handelspark | Ulven handelspark | park_miniature | keyword: park |
| aktivitet_rudolf_nilsens_plass | Rudolf Nilsens plass aktivitetspark | park_miniature | keyword: park |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | park_miniature | keyword: park |
| treningssted_kampen_park | Kampen park treningssted | park_miniature | keyword: park |
| gardermoen_motorpark | Gardermoen Motorpark | park_miniature | keyword: park |
| forskningsparken | Forskningsparken | park_miniature | keyword: park |
| rikshospitalet | Rikshospitalet | university_miniature | keyword: universitet |
| lisbon_parque_eduardo_vii | Parque Eduardo VII | park_miniature | keyword: park |
| lisbon_estrela | Estrela | park_miniature | keyword: park |
| lisbon_gare_do_cais_do_sodre | Gare do Cais do Sodré | station_miniature | keyword: stasjon |
| lisbon_teatro_romano | Ruínas do Teatro Romano | theatre_miniature | keyword: teater |
| lisbon_panteao_nacional | Panteão Nacional (Igreja de Santa Engrácia) | church_miniature | keyword: kirke |
| lisbon_museu_de_lisboa | Museu de Lisboa (Palácio Pimenta) | museum_miniature | keyword: museum |
| lisbon_igreja_de_santo_antonio | Igreja de Santo António | church_miniature | keyword: kirke |
| lisbon_igreja_de_sao_roque | Igreja de São Roque | church_miniature | keyword: kirke |
| lisbon_museu_do_aljube | Museu do Aljube – Resistência e Liberdade | museum_miniature | keyword: museum |
| lisbon_igreja_de_sao_domingos | Igreja de São Domingos | church_miniature | keyword: kirke |
| lisbon_museu_de_marinha | Museu de Marinha | museum_miniature | keyword: museum |
| lisbon_museu_nacional_dos_coches | Museu Nacional dos Coches | museum_miniature | keyword: museum |
| lisbon_museu_nacional_do_azulejo | Museu Nacional do Azulejo | museum_miniature | keyword: museum |
| lisbon_fundacao_calouste_gulbenkian | Fundação Calouste Gulbenkian | museum_miniature | keyword: museum |
| lisbon_maat | MAAT / Tejo-kraftstasjonen | museum_miniature | keyword: museum |
| lisbon_centro_cultural_de_belem | Centro Cultural de Belém | museum_miniature | keyword: museum |
| lisbon_museu_do_oriente | Museu do Oriente | museum_miniature | keyword: museum |
| lisbon_mac_ccb_berardo | MAC/CCB (tidligere Museu Coleção Berardo) | museum_miniature | keyword: museum |
| lisbon_museu_nacional_de_arte_contemporanea_do_chiado | Museu Nacional de Arte Contemporânea do Chiado | museum_miniature | keyword: museum |

_Viser 30 av 54. Full liste i `reports/visual-design-codes-audit.json`._

### People

- totalt: 144 (high 35, medium 109, low 0)

#### Topp high-confidence (35)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| christian_krohg | Christian Krohg | person_writer_miniature | keyword: forfatter |
| aasta_hansteen | Aasta Hansteen | person_writer_miniature | keyword: forfatter |
| petter_moen | Petter Moen | person_writer_miniature | keyword: forfatter |
| peder_clausson_friis | Peder Claussøn Friis | person_writer_miniature | keyword: forfatter |
| cecilie_enger | Cecilie Enger | person_writer_miniature | keyword: forfatter |
| tor_age_bringsvaerd | Tor Åge Bringsværd | person_writer_miniature | keyword: forfatter |
| helene_uri | Helene Uri | person_writer_miniature | keyword: forfatter |
| ingvar_ambjornsen | Ingvar Ambjørnsen | person_writer_miniature | keyword: forfatter |
| krag | Vilhelm Krag | person_writer_miniature | keyword: forfatter |
| fernando_pessoa | Fernando Pessoa | person_writer_miniature | keyword: forfatter |
| humberto_delgado | Humberto Delgado | person_athlete_miniature | keyword: sport |
| fernando_pinto | Fernando Pinto | person_athlete_miniature | keyword: sport |
| alfred_nobel | Alfred Nobel | person_scientist_miniature | keyword: nobel |
| goncalo_ribeiro_telles | Gonçalo Ribeiro Telles | person_politician_miniature | keyword: politiker |
| hanna_kvanmo | Hanna Kvanmo | person_politician_miniature | keyword: politiker |
| jo_benkow | Jo Benkow | person_politician_miniature | keyword: politiker |
| marcelo_caetano | Marcelo Caetano | person_politician_miniature | keyword: statsminister |
| klanen | Klanen (VIF) | person_athlete_miniature | keyword: sport |
| nils_arne_eggen | Nils Arne Eggen | person_footballer_miniature | keyword: fotball |
| lyn_fotball | Lyn Fotball | person_footballer_miniature | keyword: fotball |
| skeid_fotball | Skeid Fotball | person_footballer_miniature | keyword: fotball |
| oslo_skoiteklub | Oslo Skøiteklub | person_athlete_miniature | keyword: sport |
| eusebio | Eusébio | person_footballer_miniature | keyword: fotball |
| jose_alvalade | José Alvalade | person_footballer_miniature | keyword: fotball |
| mario_moniz_pereira | Mário Moniz Pereira | person_runner_miniature | keyword: friidrett |
| tinashe_williamson | Tinashe Williamson | person_writer_miniature | keyword: forfatter |
| don_martin | Don Martin | person_writer_miniature | keyword: forfatter |
| romulo_de_carvalho | Rómulo de Carvalho | person_writer_miniature | keyword: forfatter |
| anne_cath_vestly | Anne-Cath. Vestly | person_writer_miniature | keyword: forfatter |
| arne_skouen | Arne Skouen | person_writer_miniature | keyword: forfatter |

_Viser 30 av 35. Full liste i `reports/visual-design-codes-audit.json`._

### Artikler

- totalt: 30 (high 0, medium 9, low 21)

#### Topp high-confidence (0)

- (ingen)

## Ubrukte designCodes – anbefalt oppfølging

### `gallery_miniature`

- family: culture
- entityTypes: place
- søkeord: `galleri`, `gallery`, `kunsthall`, `utstilling`
- anbefalt: Vurder places med galleri/kunsthall som i dag løses som museum_miniature eller default.

### `article_people_portrait_miniature`

- family: people
- entityTypes: article, story, leksikon, lesespor
- søkeord: `portrett`, `biografi`, `person`, `portrait`
- anbefalt: Vurder biografiske artikler/portretter for eksplisitt article_people_portrait_miniature.

### `article_wonderkammer_miniature`

- family: wonder
- entityTypes: article, story, leksikon, lesespor
- søkeord: `wonderkammer`, `kuriosa`, `objekt`, `samling`, `cabinet`
- anbefalt: Vurder AHA-/kuriosa-/objektsamling-artikler for eksplisitt article_wonderkammer_miniature.

## Review-kandidater – ikke nødvendigvis feil

Eksplisitte koder som kan være riktige, men bør vurderes manuelt. Dette er
**ikke** feil – bare sjekkpunkter for semantisk presisjon.

#### Review candidates (7)

| id | navn/tittel | currentDesignCode | reason |
| --- | --- | --- | --- |
| slottsparken | Slottsparken | park_miniature | Navn/id antyder slott/palass, men koden er 'park_miniature' (vurder fortress_miniature eller civic_miniature). |
| operahuset | Operahuset | theatre_miniature | Navn/id inneholder 'opera' og koden er theatre_miniature (egen opera-kode kan vurderes senere). |
| ronny_deila | Ronny Deila | person_footballer_miniature | Tags/desc antyder trener og koden er person_footballer_miniature (person_coach_miniature kan vurderes senere). |
| oscar_mathisen | Oscar Mathisen | person_athlete_miniature | Skøyte/skøyteløper og koden er person_athlete_miniature (person_skater_miniature kan vurderes senere). |
| hjalmar_andersen | Hjalmar Andersen | person_athlete_miniature | Skøyte/skøyteløper og koden er person_athlete_miniature (person_skater_miniature kan vurderes senere). |
| johann_olav_koss | Johann Olav Koss | person_athlete_miniature | Skøyte/skøyteløper og koden er person_athlete_miniature (person_skater_miniature kan vurderes senere). |
| ole_gunnar_solskjaer | Ole Gunnar Solskjær | person_footballer_miniature | Tags/desc antyder trener og koden er person_footballer_miniature (person_coach_miniature kan vurderes senere). |

## Forslag til Pilot batch 3

Prioritert liste (P5 = åpenbar og viktig, P3 = sannsynlig, bør sjekkes).
Lavere prioritet (P1–P2) finnes kun i JSON-rapporten.

#### Places (totalt 249, viser 20)

- `church_miniature`:
  - [P5] Kulturkirken Jakob (`kulturkirken_jakob_litteratur`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Cemitério dos Prazeres (`lisbon_cemiterio_dos_prazeres`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de Santo António (`lisbon_igreja_de_santo_antonio`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de São Domingos (`lisbon_igreja_de_sao_domingos`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de São Roque (`lisbon_igreja_de_sao_roque`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Miradouro da Senhora do Monte (`lisbon_miradouro_da_senhora_do_monte`) — heuristisk high-confidence treff (kapell); gjør eksplisitt for stabil visuell identitet
  - [P5] Panteão Nacional (Igreja de Santa Engrácia) (`lisbon_panteao_nacional`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
- `cinema_miniature`:
  - [P5] Cinema Ideal (`lisbon_cinema_ideal`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema Nimas (`lisbon_cinema_nimas`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema São Jorge (`lisbon_cinema_sao_jorge`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Doclisboa – Festival Internacional de Cinema (`lisbon_doclisboa`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
- `library_miniature`:
  - [P5] Grémio Literário (`lisbon_gremio_literario`) — heuristisk high-confidence treff (bibliotek); gjør eksplisitt for stabil visuell identitet
- `museum_miniature`:
  - [P5] Banco de Portugal / Museu do Dinheiro (`lisbon_banco_de_portugal_museu_do_dinheiro`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] Casa Fernando Pessoa (`lisbon_casa_fernando_pessoa`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] Casa-Museu Amália Rodrigues (`lisbon_casa_museu_amalia_rodrigues`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] Centro Cultural de Belém (`lisbon_centro_cultural_de_belem`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] Fundação Calouste Gulbenkian (`lisbon_fundacao_calouste_gulbenkian`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] MAAT / Tejo-kraftstasjonen (`lisbon_maat`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] MAC/CCB (tidligere Museu Coleção Berardo) (`lisbon_mac_ccb_berardo`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet
  - [P5] MUDE – Museu do Design e da Moda (`lisbon_mude`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet

#### People (totalt 148, viser 20)

- `person_athlete_miniature`:
  - [P5] Fernando Pinto (`fernando_pinto`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Humberto Delgado (`humberto_delgado`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Klanen (VIF) (`klanen`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Oslo Skøiteklub (`oslo_skoiteklub`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
- `person_footballer_miniature`:
  - [P5] Eusébio (`eusebio`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] José Alvalade (`jose_alvalade`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Lyn Fotball (`lyn_fotball`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Nils Arne Eggen (`nils_arne_eggen`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Skeid Fotball (`skeid_fotball`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
- `person_musician_miniature`:
  - [P5] Luís Villas-Boas (`luis_villas_boas`) — heuristisk high-confidence treff (musiker); gjør eksplisitt for stabil visuell identitet
- `person_politician_miniature`:
  - [P5] Gonçalo Ribeiro Telles (`goncalo_ribeiro_telles`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Hanna Kvanmo (`hanna_kvanmo`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Jo Benkow (`jo_benkow`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Marcelo Caetano (`marcelo_caetano`) — heuristisk high-confidence treff (statsminister); gjør eksplisitt for stabil visuell identitet
- `person_runner_miniature`:
  - [P5] Mário Moniz Pereira (`mario_moniz_pereira`) — heuristisk high-confidence treff (friidrett); gjør eksplisitt for stabil visuell identitet
- `person_scientist_miniature`:
  - [P5] Alfred Nobel (`alfred_nobel`) — heuristisk high-confidence treff (nobel); gjør eksplisitt for stabil visuell identitet
- `person_writer_miniature`:
  - [P5] Aasta Hansteen (`aasta_hansteen`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Anja Breien (`anja_breien`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Anne-Cath. Vestly (`anne_cath_vestly`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Arne Skouen (`arne_skouen`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet

#### Artikler (totalt 137, viser 30)

- `article_architecture_miniature`:
  - [P3] operahuset (`operahuset`) — default-fallback; mulig dyp-tekst treff 'arkitektur'
- `article_art_miniature`:
  - [P3] Broen og skulpturrommene (`frognerparken_broen_og_skulpturrom`) — heuristisk medium-confidence treff (skulptur); bør sjekkes før eksplisitt merking
  - [P3] Frognerparken (`frognerparken_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'skulptur'
  - [P3] Vigelandsanlegget i Frognerparken (`frognerparken_vigelandsanlegget`) — default-fallback; mulig dyp-tekst treff 'skulptur'
  - [P3] Astrup Fearnleys store uke (`lesespor_astrup_fearnley_001`) — default-fallback; mulig dyp-tekst treff 'kunst'
  - [P3] Vanskelige penger (`lesespor_astrup_fearnley_002`) — default-fallback; mulig dyp-tekst treff 'kunst'
  - [P3] Banal og overdimensjonert skulpturpark (`lesespor_ekebergparken_001`) — heuristisk medium-confidence treff (skulptur); bør sjekkes før eksplisitt merking
  - [P3] – Et smykkeskrin for våre kunstskatter (`lesespor_nasjonalmuseet_001`) — heuristisk medium-confidence treff (kunst); bør sjekkes før eksplisitt merking
  - [P3] lisbon_aqueduto_das_aguas_livres (`lisbon_aqueduto_das_aguas_livres`) — default-fallback; mulig dyp-tekst treff 'kunst'
  - [P3] tjuvholmen (`tjuvholmen`) — default-fallback; mulig dyp-tekst treff 'kunst'
- `article_groundhopper_miniature`:
  - [P4] bislett_stadion (`bislett_stadion`) — default-fallback; tydelig dyp-tekst treff 'stadion'
- `article_sports_history_miniature`:
  - [P4] alna_smalvoll (`alna_smalvoll`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] alnabru_jernbane_og_logistikk (`alnabru_jernbane_og_logistikk`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] carl_berner_plass (`carl_berner_plass`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] gamle_trikkestallen (`gamle_trikkestallen`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Begreper rundt Good Game-redaksjonen (`good_game_redaksjon_begreper`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Good Game i digital offentlighet (`good_game_redaksjon_digital_offentlighet`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Good Game-redaksjonen (NRK) (`good_game_redaksjon_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] helsfyr (`helsfyr`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] jernbanetorget (`jernbanetorget`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] lisbon_estacao_do_rossio (`lisbon_estacao_do_rossio`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] majorstuen_krysset (`majorstuen_krysset`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] nationaltheatret_stasjon (`nationaltheatret_stasjon`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] nedre_foss (`nedre_foss`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] oslo_bussterminal (`oslo_bussterminal`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] oslo_s (`oslo_s`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Begreper: knutepunkt, stasjonshall og folkestrøm (`oslo_s_begreper`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] storgata (`storgata`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] tigeren (`tigeren`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] trikk_17_18 (`trikk_17_18`) — default-fallback; tydelig dyp-tekst treff 'sport'

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
