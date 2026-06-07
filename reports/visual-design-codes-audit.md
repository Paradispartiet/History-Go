# Visual design codes – audit

Generert: 2026-06-07T06:05:56.679Z

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

- eksplisitt `visual.designCode`: 169
- per kilde (alle entiteter):
  - explicit: 169
  - assetType: 0
  - category: 264
  - heuristic: 478
  - default: 348

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 68 | 0 | 132 | 274 | 15 |
| people | 65 | 0 | 132 | 167 | 62 |
| articles | 36 | 0 | 0 | 37 | 271 |

## Eksplisitt pilot-merkede designCodes

- places (68):
  - `square_miniature`: 7
  - `park_miniature`: 7
  - `church_miniature`: 6
  - `station_miniature`: 5
  - `museum_miniature`: 5
  - `university_miniature`: 5
  - `street_miniature`: 4
  - `waterfront_miniature`: 4
  - `library_miniature`: 4
  - `cinema_miniature`: 4
  - `stadium_miniature`: 4
  - `ice_arena_miniature`: 4
  - `theatre_miniature`: 2
  - `civic_miniature`: 2
  - `fortress_miniature`: 2
  - `commerce_miniature`: 1
  - `industrial_miniature`: 1
  - `school_miniature`: 1
- people (65):
  - `person_musician_miniature`: 14
  - `person_scientist_miniature`: 11
  - `person_writer_miniature`: 6
  - `person_politician_miniature`: 6
  - `person_athlete_miniature`: 6
  - `person_poet_miniature`: 5
  - `person_runner_miniature`: 5
  - `person_footballer_miniature`: 4
  - `person_skier_miniature`: 4
  - `person_activist_miniature`: 3
  - `person_historical_miniature`: 1
- articles (36):
  - `article_history_miniature`: 13
  - `article_place_essay_miniature`: 9
  - `article_sports_history_miniature`: 5
  - `article_political_history_miniature`: 3
  - `article_art_miniature`: 3
  - `article_local_story_miniature`: 1
  - `article_groundhopper_miniature`: 1
  - `article_object_story_miniature`: 1

## Pilot batch 2

- Batch 1-baseline: 73 eksplisitte `visual.designCode` (28 places, 30 people, 15 articles).
- Nåværende total etter batch 2: 169 eksplisitte `visual.designCode`.
- Netto økning etter batch 1: 96 (40 places, 35 people, 21 articles).
- Omfang: Kontrollert Pilot batch 2: høy nytte for sentrale kartsteder, stedskoblede people og kunnskapslagartikler.

## Topp brukte designCodes

- `article_default_miniature`: 271
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
- `museum_miniature`: 26
- `commerce_miniature`: 25
- `university_miniature`: 25

## Default-kandidater for neste batch

Entiteter som fortsatt løses via default-fallback. Dette er den neste
ryddelisten – kandidater som kan vurderes for eksplisitt designCode.

#### Places som fortsatt er `default_miniature` (15)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| eidsvollsbygningen | Eidsvollsbygningen | historie | data/places/historie/oslo/places_historie.json |
| grini_fangeleir | Grini fangeleir | historie | data/places/historie/oslo/places_historie.json |
| villa_grande | Villa Grande | historie | data/places/historie/oslo/places_historie.json |
| bogstad_gard | Bogstad gård | historie | data/places/historie/oslo/places_historie.json |
| nonneseter_kloster | Nonneseter kloster | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| oslo_ladegard | Oslo ladegård | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| gamle_radhus | Gamle rådhus | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| galgeberg | Galgeberg | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| oslo_hospital | Oslo hospital | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| botsfengselet | Botsfengselet | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| hellerud_gard | Hellerud gård | historie | data/places/natur/oslo/places_oslo_alna.json |
| lisbon_padrao_dos_descobrimentos | Padrão dos Descobrimentos | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json |
| lisbon_sao_vicente_de_fora | Igreja e Mosteiro de São Vicente de Fora | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json |
| lisbon_palacio_ajuda | Palácio Nacional da Ajuda | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json |

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

#### Artikler som fortsatt er `article_default_miniature` (271)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| alnaelva | alnaelva | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnaelvstien | alnaelvstien | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| loelva_historisk | loelva_historisk | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| trosterud_friomrade | trosterud_friomrade | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| furuset_haugerud_skogbelte | furuset_haugerud_skogbelte | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| hellerud_gard | hellerud_gard | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnabru_jernbane_og_logistikk | alnabru_jernbane_og_logistikk | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| damstredet_telthusbakken | damstredet_telthusbakken | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| gamle_trikkestallen | gamle_trikkestallen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| sofienberg_kirke | sofienberg_kirke | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| gamlebyen_gravlund | gamlebyen_gravlund | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| bjoelsenfossen | bjoelsenfossen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| glads_molle | glads_molle | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| voienfossen | voienfossen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| voien_gard_voienvolden | voien_gard_voienvolden | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| nedre_foss | nedre_foss | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| vaterland_historisk_elvelop | vaterland_historisk_elvelop | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| lisbon_torre_de_belem | lisbon_torre_de_belem | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_mosteiro_dos_jeronimos | lisbon_mosteiro_dos_jeronimos | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_castelo_de_sao_jorge | lisbon_castelo_de_sao_jorge | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_aqueduto_das_aguas_livres | lisbon_aqueduto_das_aguas_livres | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_se_de_lisboa | lisbon_se_de_lisboa | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_convento_do_carmo | lisbon_convento_do_carmo | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_padrao_dos_descobrimentos | lisbon_padrao_dos_descobrimentos | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| lisbon_estacao_do_rossio | lisbon_estacao_do_rossio | — | data/leksikon/places/europe/portugal/lisbon/historie/leksikon_lisbon_historie.json |
| bispelokket | bispelokket | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| gronland_basarene | gronland_basarene | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
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

_Viser 40 av 271. Full liste i `reports/visual-design-codes-audit.json`._

## Heuristiske kandidater for eksplisitt designCode

Entiteter uten eksplisitt kode, men der resolveren gir en konkret kode via
heuristikk. High-confidence treff er trygge kandidater for eksplisitt merking.

### Places

- totalt: 274 (high 81, medium 187, low 6)

#### Topp high-confidence (81)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| tigeren | Tigerstatuen | station_miniature | keyword: stasjon |
| botsparken | Botsparken | park_miniature | keyword: park |
| bislett | Bislett | stadium_miniature | keyword: stadion |
| trefoldighetskirken | Trefoldighetskirken | church_miniature | keyword: kirke |
| ekebergparken | Ekebergparken skulpturpark | park_miniature | keyword: park |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | church_miniature | keyword: kirke |
| norli_universitetsgata | Norli Universitetsgata | university_miniature | keyword: universitet |
| det_norske_teatret | Det Norske Teatret | theatre_miniature | keyword: teater |
| jernbaneverkstedet_lodalen | Lodalen jernbaneverksted | station_miniature | keyword: jernbane |
| fornebu_teknologipark | Fornebu Teknologipark | park_miniature | keyword: park |
| ulven_handelspark | Ulven handelspark | park_miniature | keyword: park |
| jernbanetorget_trafikknutepunkt | Jernbanetorget – handelsknutepunktet | station_miniature | keyword: jernbane |
| alnabru_jernbane_og_logistikk | Alnabru – jernbane og logistikk | station_miniature | keyword: jernbane |
| alnaparken | Alnaparken | park_miniature | keyword: park |
| cinemateket_oslo | Cinemateket i Oslo | cinema_miniature | keyword: cinema |
| colosseum_kino | Colosseum kino | cinema_miniature | keyword: kino |
| folketeateret | Folketeateret | theatre_miniature | keyword: teater |
| holmenkollen_nasjonalanlegg | Holmenkollen nasjonalanlegg | stadium_miniature | keyword: stadion |
| frogner_stadion | Frogner stadion | stadium_miniature | keyword: stadion |
| daelenenga_idrettspark | Dælenenga idrettspark | park_miniature | keyword: park |
| nordre_aasen_idrettspark | Nordre Åsen idrettspark | park_miniature | keyword: park |
| aktivitet_rudolf_nilsens_plass | Rudolf Nilsens plass aktivitetspark | park_miniature | keyword: park |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | park_miniature | keyword: park |
| treningssted_kampen_park | Kampen park treningssted | park_miniature | keyword: park |
| gardermoen_motorpark | Gardermoen Motorpark | park_miniature | keyword: park |
| sofienbergparken_subkultur | Sofienbergparken | park_miniature | keyword: park |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | university_miniature | keyword: universitet |
| forskningsparken | Forskningsparken | park_miniature | keyword: park |
| rikshospitalet | Rikshospitalet | university_miniature | keyword: universitet |
| lisbon_parque_eduardo_vii | Parque Eduardo VII | park_miniature | keyword: park |

_Viser 30 av 81. Full liste i `reports/visual-design-codes-audit.json`._

### People

- totalt: 167 (high 58, medium 109, low 0)

#### Topp high-confidence (58)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| carl_berner | Carl Berner | person_politician_miniature | keyword: politiker |
| henrik_ibsen | Henrik Ibsen | person_writer_miniature | keyword: forfatter |
| christian_krohg | Christian Krohg | person_writer_miniature | keyword: forfatter |
| aasta_hansteen | Aasta Hansteen | person_writer_miniature | keyword: forfatter |
| peder_anker | Peder Anker | person_politician_miniature | keyword: statsminister |
| cj_hambro | C.J. Hambro | person_politician_miniature | keyword: politiker |
| trygve_bratteli | Trygve Bratteli | person_politician_miniature | keyword: statsminister |
| petter_moen | Petter Moen | person_writer_miniature | keyword: forfatter |
| peder_clausson_friis | Peder Claussøn Friis | person_writer_miniature | keyword: forfatter |
| cecilie_enger | Cecilie Enger | person_writer_miniature | keyword: forfatter |
| jens_bjorneboe | Jens Bjørneboe | person_writer_miniature | keyword: forfatter |
| tor_age_bringsvaerd | Tor Åge Bringsværd | person_writer_miniature | keyword: forfatter |
| helene_uri | Helene Uri | person_writer_miniature | keyword: forfatter |
| ingvar_ambjornsen | Ingvar Ambjørnsen | person_writer_miniature | keyword: forfatter |
| ruth_maier | Ruth Maier | person_writer_miniature | keyword: forfatter |
| oskar_braaten | Oskar Braaten | person_writer_miniature | keyword: forfatter |
| krag | Vilhelm Krag | person_writer_miniature | keyword: forfatter |
| jon_fosse | Jon Fosse | person_writer_miniature | keyword: forfatter |
| bjornstjerne_bjornson | Bjørnstjerne Bjørnson | person_writer_miniature | keyword: forfatter |
| camilla_collett | Camilla Collett | person_writer_miniature | keyword: forfatter |
| fernando_pessoa | Fernando Pessoa | person_writer_miniature | keyword: forfatter |
| humberto_delgado | Humberto Delgado | person_athlete_miniature | keyword: sport |
| fernando_pinto | Fernando Pinto | person_athlete_miniature | keyword: sport |
| alfred_nobel | Alfred Nobel | person_scientist_miniature | keyword: nobel |
| thekla_resvoll | Thekla Resvoll | person_scientist_miniature | keyword: forsker |
| rolf_nordhagen | Rolf Nordhagen | person_scientist_miniature | keyword: forsker |
| haaken_hasberg_gran | Haaken Hasberg Gran | person_scientist_miniature | keyword: forsker |
| lauritz_somme | Lauritz Sømme | person_scientist_miniature | keyword: forsker |
| helge_ingstad | Helge Ingstad | person_writer_miniature | keyword: forfatter |
| goncalo_ribeiro_telles | Gonçalo Ribeiro Telles | person_politician_miniature | keyword: politiker |

_Viser 30 av 58. Full liste i `reports/visual-design-codes-audit.json`._

### Artikler

- totalt: 37 (high 7, medium 9, low 21)

#### Topp high-confidence (7)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| daelenenga_idrettspark_hovedartikkel | Dælenenga idrettspark | article_sports_history_miniature | keyword: idrett |
| daelenenga_idrettspark_grunerhallen | Grünerhallen | article_sports_history_miniature | keyword: idrett |
| daelenenga_idrettspark_gruner_il | Grüner IL og klubbhistorien | article_sports_history_miniature | keyword: idrett |
| daelenenga_idrettspark_arbeideridrett | Arbeideridretten på Dælenenga | article_sports_history_miniature | keyword: idrett |
| daelenenga_idrettspark_fleridrett_og_anleggsendring | Fleridrett og anleggsendringer | article_sports_history_miniature | keyword: idrett |
| daelenenga_idrettspark_nabolagsidrett | Nabolagsidrett og sosial infrastruktur | article_sports_history_miniature | keyword: idrett |
| tullin_historisk_museum_og_nasjonalgalleriet | Historisk museum og det tidligere Nasjonalgalleriet | article_art_miniature | keyword: galleri |

## Ubrukte designCodes – anbefalt oppfølging

### `gallery_miniature`

- family: culture
- entityTypes: place
- søkeord: `galleri`, `gallery`, `kunsthall`, `utstilling`
- anbefalt: Vurder places med galleri/kunsthall som i dag løses som museum_miniature eller default.

### `article_literature_miniature`

- family: literature
- entityTypes: article, story, leksikon, lesespor
- søkeord: `litteratur`, `forfatter`, `roman`, `dikt`, `poesi`, `novelle`
- anbefalt: Vurder leksikon/lesespor om litteratur og forfatterskap for eksplisitt article_literature_miniature.

### `article_architecture_miniature`

- family: architecture
- entityTypes: article, story, leksikon, lesespor
- søkeord: `arkitektur`, `architecture`, `bygning`, `byrom`, `byggeskikk`
- anbefalt: Vurder artikler om arkitektur og bygde miljøer for eksplisitt article_architecture_miniature.

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

#### Places (totalt 279, viser 20)

- `church_miniature`:
  - [P5] Kulturkirken Jakob (`kulturkirken_jakob_litteratur`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Cemitério dos Prazeres (`lisbon_cemiterio_dos_prazeres`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Convento do Carmo (`lisbon_convento_do_carmo`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de Santo António (`lisbon_igreja_de_santo_antonio`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de São Domingos (`lisbon_igreja_de_sao_domingos`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de São Roque (`lisbon_igreja_de_sao_roque`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Miradouro da Senhora do Monte (`lisbon_miradouro_da_senhora_do_monte`) — heuristisk high-confidence treff (kapell); gjør eksplisitt for stabil visuell identitet
  - [P5] Panteão Nacional (Igreja de Santa Engrácia) (`lisbon_panteao_nacional`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Sé de Lisboa (`lisbon_se_de_lisboa`) — heuristisk high-confidence treff (katedral); gjør eksplisitt for stabil visuell identitet
  - [P5] Trefoldighetskirken (`trefoldighetskirken`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
- `cinema_miniature`:
  - [P5] Cinemateket i Oslo (`cinemateket_oslo`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Colosseum kino (`colosseum_kino`) — heuristisk high-confidence treff (kino); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema Ideal (`lisbon_cinema_ideal`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema Nimas (`lisbon_cinema_nimas`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema São Jorge (`lisbon_cinema_sao_jorge`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinemateca Portuguesa (`lisbon_cinemateca_portuguesa`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Doclisboa – Festival Internacional de Cinema (`lisbon_doclisboa`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
- `library_miniature`:
  - [P5] Biblioteca Nacional de Portugal (`lisbon_biblioteca_nacional_de_portugal`) — heuristisk high-confidence treff (bibliotek); gjør eksplisitt for stabil visuell identitet
  - [P5] Grémio Literário (`lisbon_gremio_literario`) — heuristisk high-confidence treff (bibliotek); gjør eksplisitt for stabil visuell identitet
- `museum_miniature`:
  - [P5] Banco de Portugal / Museu do Dinheiro (`lisbon_banco_de_portugal_museu_do_dinheiro`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet

#### People (totalt 171, viser 20)

- `person_athlete_miniature`:
  - [P5] Andreas Thorkildsen (`andreas_thorkildsen`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Fernando Pinto (`fernando_pinto`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Humberto Delgado (`humberto_delgado`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Klanen (VIF) (`klanen`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Nora Mørk (`nora_mork`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Oslo Skøiteklub (`oslo_skoiteklub`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
  - [P5] Sander Sagosen (`sander_sagosen`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
- `person_footballer_miniature`:
  - [P5] Eusébio (`eusebio`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] José Alvalade (`jose_alvalade`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Lyn Fotball (`lyn_fotball`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Nils Arne Eggen (`nils_arne_eggen`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Skeid Fotball (`skeid_fotball`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
- `person_musician_miniature`:
  - [P5] Luís Villas-Boas (`luis_villas_boas`) — heuristisk high-confidence treff (musiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Rikard Nordraak (`rikard_nordraak`) — heuristisk high-confidence treff (komponist); gjør eksplisitt for stabil visuell identitet
- `person_politician_miniature`:
  - [P5] Berit Ås (`berit_aas`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Betzy Kjelsberg (`betzy_kjelsberg`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Carl Berner (`carl_berner`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] C.J. Hambro (`cj_hambro`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Eva Kolstad (`eva_kolstad`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Gonçalo Ribeiro Telles (`goncalo_ribeiro_telles`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet

#### Artikler (totalt 164, viser 30)

- `article_architecture_miniature`:
  - [P5] Frogner hovedgård i parken (`frognerparken_frogner_hovedgaard`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] Parkaksen gjennom Frognerparken (`frognerparken_parkakse`) — default-fallback; dyp-tekst treff 'arkitektur' dekker ubrukt kode article_architecture_miniature
  - [P5] Middelalderparken og ruinene (`gamlebyen_middelalderparken_ruiner`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] Oslo hospital (`gamlebyen_oslo_hospital`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] gronland_basarene (`gronland_basarene`) — default-fallback; dyp-tekst treff 'arkitektur' dekker ubrukt kode article_architecture_miniature
  - [P5] hellerud_gard (`hellerud_gard`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] lisbon_mosteiro_dos_jeronimos (`lisbon_mosteiro_dos_jeronimos`) — default-fallback; dyp-tekst treff 'arkitektur' dekker ubrukt kode article_architecture_miniature
  - [P5] lisbon_se_de_lisboa (`lisbon_se_de_lisboa`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] lisbon_torre_de_belem (`lisbon_torre_de_belem`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] markveien (`markveien`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] nydalen (`nydalen`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] operahuset (`operahuset`) — default-fallback; dyp-tekst treff 'arkitektur' dekker ubrukt kode article_architecture_miniature
  - [P5] Torshovbyen (`torshov_torshovbyen`) — default-fallback; dyp-tekst treff 'arkitektur' dekker ubrukt kode article_architecture_miniature
  - [P5] Tullin (`tullin_hovedartikkel`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] universitetsplassen (`universitetsplassen`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
  - [P5] vigelandsparken (`vigelandsparken`) — default-fallback; dyp-tekst treff 'arkitektur' dekker ubrukt kode article_architecture_miniature
  - [P5] voien_gard_voienvolden (`voien_gard_voienvolden`) — default-fallback; dyp-tekst treff 'bygning' dekker ubrukt kode article_architecture_miniature
- `article_art_miniature`:
  - [P5] Historisk museum og det tidligere Nasjonalgalleriet (`tullin_historisk_museum_og_nasjonalgalleriet`) — heuristisk high-confidence treff (galleri); gjør eksplisitt for stabil visuell identitet
  - [P4] Tullinløkka (`tullin_tullinlokka`) — default-fallback; tydelig dyp-tekst treff 'galleri'
- `article_groundhopper_miniature`:
  - [P4] bislett_stadion (`bislett_stadion`) — default-fallback; tydelig dyp-tekst treff 'stadion'
- `article_literature_miniature`:
  - [P5] Fremtidsrommet åpner (`lesespor_deichman_001`) — default-fallback; dyp-tekst treff 'litteratur' dekker ubrukt kode article_literature_miniature
  - [P5] lisbon_jardim_da_estrela (`lisbon_jardim_da_estrela`) — default-fallback; dyp-tekst treff 'roman' dekker ubrukt kode article_literature_miniature
  - [P5] Navnet Tullin (`tullin_navn_christian_brunmann_tullin`) — default-fallback; dyp-tekst treff 'dikt' dekker ubrukt kode article_literature_miniature
- `article_sports_history_miniature`:
  - [P5] Arbeideridretten på Dælenenga (`daelenenga_idrettspark_arbeideridrett`) — heuristisk high-confidence treff (idrett); gjør eksplisitt for stabil visuell identitet
  - [P5] Fleridrett og anleggsendringer (`daelenenga_idrettspark_fleridrett_og_anleggsendring`) — heuristisk high-confidence treff (idrett); gjør eksplisitt for stabil visuell identitet
  - [P5] Grüner IL og klubbhistorien (`daelenenga_idrettspark_gruner_il`) — heuristisk high-confidence treff (idrett); gjør eksplisitt for stabil visuell identitet
  - [P5] Grünerhallen (`daelenenga_idrettspark_grunerhallen`) — heuristisk high-confidence treff (idrett); gjør eksplisitt for stabil visuell identitet
  - [P5] Dælenenga idrettspark (`daelenenga_idrettspark_hovedartikkel`) — heuristisk high-confidence treff (idrett); gjør eksplisitt for stabil visuell identitet
  - [P5] Nabolagsidrett og sosial infrastruktur (`daelenenga_idrettspark_nabolagsidrett`) — heuristisk high-confidence treff (idrett); gjør eksplisitt for stabil visuell identitet
  - [P4] alna_smalvoll (`alna_smalvoll`) — default-fallback; tydelig dyp-tekst treff 'sport'

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
