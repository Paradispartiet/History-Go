# Visual design codes – audit

Generert: 2026-06-09T20:05:18.417Z

> Denne rapporten viser ikke bare dekning, men også konkrete kandidater for
> neste batch. Full, uavkortet liste finnes alltid i
> [`reports/visual-design-codes-audit.json`](visual-design-codes-audit.json).

## Register

- designCodes totalt: **72**
- per entityType:
  - place: 31
  - person: 23
  - article: 18
  - story: 18
  - leksikon: 18
  - lesespor: 18

## Data funnet

- places: 501
- people: 426
- leksikon: 335
- lesespor: 9
- artikler totalt (leksikon + lesespor): 344

## Resolusjon

- eksplisitt `visual.designCode`: 312
- per kilde (alle entiteter):
  - explicit: 312
  - assetType: 0
  - category: 250
  - heuristic: 456
  - default: 253

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 122 | 0 | 124 | 251 | 4 |
| people | 118 | 0 | 126 | 174 | 8 |
| articles | 72 | 0 | 0 | 31 | 241 |

## Eksplisitt pilot-merkede designCodes

- places (122):
  - `park_miniature`: 13
  - `church_miniature`: 11
  - `station_miniature`: 9
  - `monument_miniature`: 9
  - `stadium_miniature`: 8
  - `museum_miniature`: 8
  - `square_miniature`: 7
  - `cinema_miniature`: 7
  - `farm_estate_miniature`: 6
  - `university_miniature`: 6
  - `library_miniature`: 5
  - `street_miniature`: 4
  - `waterfront_miniature`: 4
  - `palace_miniature`: 4
  - `theatre_miniature`: 4
  - `ice_arena_miniature`: 4
  - `cemetery_miniature`: 3
  - `prison_miniature`: 3
  - `fortress_miniature`: 2
  - `commerce_miniature`: 1
  - `opera_miniature`: 1
  - `industrial_miniature`: 1
  - `school_miniature`: 1
  - `civic_miniature`: 1
- people (118):
  - `person_architect_miniature`: 18
  - `person_scientist_miniature`: 15
  - `person_musician_miniature`: 15
  - `person_writer_miniature`: 14
  - `person_politician_miniature`: 13
  - `person_business_miniature`: 8
  - `person_poet_miniature`: 5
  - `person_runner_miniature`: 5
  - `person_athlete_miniature`: 5
  - `person_skier_miniature`: 4
  - `person_skater_miniature`: 4
  - `person_activist_miniature`: 3
  - `person_footballer_miniature`: 3
  - `person_coach_miniature`: 3
  - `person_urban_planner_miniature`: 2
  - `person_historical_miniature`: 1
- articles (72):
  - `article_architecture_miniature`: 15
  - `article_history_miniature`: 11
  - `article_sports_history_miniature`: 11
  - `article_place_essay_miniature`: 9
  - `article_institution_miniature`: 9
  - `article_art_miniature`: 5
  - `article_memory_place_miniature`: 3
  - `article_political_history_miniature`: 3
  - `article_literature_miniature`: 3
  - `article_local_story_miniature`: 1
  - `article_groundhopper_miniature`: 1
  - `article_object_story_miniature`: 1

## Pilot batch status

- Batch 1-baseline: 73 eksplisitte `visual.designCode`.
- Etter batch 2: 169 eksplisitte `visual.designCode`.
- Etter batch 3: 249 eksplisitte `visual.designCode`.
- Nåværende total: 312 eksplisitte `visual.designCode` (122 places, 118 people, 72 articles).
- Endring siden batch 3: 63.
- Omfang: Kontrollerte pilot-batcher for visual.designCode-dekning; nåværende total beregnes fra data.

## Topp brukte designCodes

- `article_default_miniature`: 241
- `waterfront_miniature`: 84
- `park_miniature`: 60
- `person_writer_miniature`: 46
- `person_business_miniature`: 43
- `person_historical_miniature`: 40
- `person_scientist_miniature`: 40
- `person_activist_miniature`: 38
- `person_musician_miniature`: 36
- `museum_miniature`: 27
- `person_politician_miniature`: 27
- `apartment_block_miniature`: 26
- `stadium_miniature`: 25
- `person_artist_miniature`: 25
- `commerce_miniature`: 24

## Default-kandidater for neste batch

Entiteter som fortsatt løses via default-fallback. Dette er den neste
ryddelisten – kandidater som kan vurderes for eksplisitt designCode.

#### Places som fortsatt er `default_miniature` (4)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| gamle_radhus | Gamle rådhus | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| galgeberg | Galgeberg | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| oslo_hospital | Oslo hospital | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json |

#### People som fortsatt er `person_default_miniature` (8)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| kong_christian_iv | Kong Christian IV | by | data/people/by/oslo/people_by_oslo.json |
| fritz_heinrich_frolich | Fritz Heinrich Frølich | by | data/people/by/oslo/people_by_oslo.json |
| gunnar_jahn_statistikk_og_styring | Gunnar Jahn | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| anton_martin_schweigaard_okonomi | Anton Martin Schweigaard | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| kristian_birkeland_teknologi_og_industri | Kristian Birkeland | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| christian_schweigaard_post_og_administrasjon | Christian Schweigaard | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| eckbos_legat | Eckbos Legat | by | data/people/filantroper/oslo/people_filantroper_oslo.json |
| gjensidigestiftelsen | Gjensidigestiftelsen | by | data/people/filantroper/oslo/people_filantroper_oslo.json |

#### Artikler som fortsatt er `article_default_miniature` (241)

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
| romsaås | romsaås | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |

_Viser 40 av 241. Full liste i `reports/visual-design-codes-audit.json`._

## Heuristiske kandidater for eksplisitt designCode

Entiteter uten eksplisitt kode, men der resolveren gir en konkret kode via
heuristikk. High-confidence treff er trygge kandidater for eksplisitt merking.

### Places

- totalt: 251 (high 71, medium 175, low 5)

#### Topp high-confidence (71)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | church_miniature | keyword: kirke |
| norli_universitetsgata | Norli Universitetsgata | university_miniature | keyword: universitet |
| alf_proysen_statue_nittedal | Alf Prøysen-statuen – Nittedal kulturhus | monument_miniature | keyword: statue |
| fornebu_teknologipark | Fornebu Teknologipark | park_miniature | keyword: park |
| ulven_handelspark | Ulven handelspark | park_miniature | keyword: park |
| akershus_slott_bakeriet | Bakeriet ved Akershus | palace_miniature | keyword: slott |
| bygdoy_kongsgard_salamanderdam | Bygdøy Kongsgård salamanderdam | farm_estate_miniature | keyword: gard |
| slottsplassen | Slottsplassen | palace_miniature | keyword: slott |
| aktivitet_rudolf_nilsens_plass | Rudolf Nilsens plass aktivitetspark | park_miniature | keyword: park |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | park_miniature | keyword: park |
| treningssted_kampen_park | Kampen park treningssted | park_miniature | keyword: park |
| gardermoen_raceway | Gardermoen Raceway | farm_estate_miniature | keyword: gard |
| gardermoen_motorpark | Gardermoen Motorpark | farm_estate_miniature | keyword: gard |
| wembley_stadium_london | Wembley Stadium | stadium_miniature | keyword: stadium |
| tottenham_hotspur_stadium_london | Tottenham Hotspur Stadium | stadium_miniature | keyword: stadium |
| emirates_stadium_london | Emirates Stadium | stadium_miniature | keyword: stadium |
| london_stadium_london | London Stadium | stadium_miniature | keyword: stadium |
| selhurst_park_london | Selhurst Park | park_miniature | keyword: park |
| gtech_community_stadium_london | Gtech Community Stadium | stadium_miniature | keyword: stadium |
| grunerlokka_bakgardsvegger | Grünerløkka bakgårdsvegger | farm_estate_miniature | keyword: gard |
| forskningsparken | Forskningsparken | park_miniature | keyword: park |
| rikshospitalet | Rikshospitalet | university_miniature | keyword: universitet |
| lisbon_parque_eduardo_vii | Parque Eduardo VII | park_miniature | keyword: park |
| lisbon_belem_bydel | Belém | monument_miniature | keyword: monument |
| lisbon_estrela | Estrela | park_miniature | keyword: park |
| lisbon_gare_do_cais_do_sodre | Gare do Cais do Sodré | station_miniature | keyword: stasjon |
| lisbon_aqueduto_das_aguas_livres | Aqueduto das Águas Livres | monument_miniature | keyword: monument |
| lisbon_teatro_romano | Ruínas do Teatro Romano | theatre_miniature | keyword: teater |
| lisbon_panteao_nacional | Panteão Nacional (Igreja de Santa Engrácia) | church_miniature | keyword: kirke |
| lisbon_museu_de_lisboa | Museu de Lisboa (Palácio Pimenta) | museum_miniature | keyword: museum |

_Viser 30 av 71. Full liste i `reports/visual-design-codes-audit.json`._

### People

- totalt: 174 (high 32, medium 142, low 0)

#### Topp high-confidence (32)

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
| alfred_nobel | Alfred Nobel | person_scientist_miniature | keyword: nobel |
| francisco_caldeira_cabral | Francisco Caldeira Cabral | person_architect_miniature | keyword: arkitekt |
| goncalo_ribeiro_telles | Gonçalo Ribeiro Telles | person_architect_miniature | keyword: arkitekt |
| hanna_kvanmo | Hanna Kvanmo | person_politician_miniature | keyword: politiker |
| jo_benkow | Jo Benkow | person_politician_miniature | keyword: politiker |
| marcelo_caetano | Marcelo Caetano | person_politician_miniature | keyword: statsminister |
| klanen | Klanen (VIF) | person_athlete_miniature | keyword: sport |
| lyn_fotball | Lyn Fotball | person_footballer_miniature | keyword: fotball |
| skeid_fotball | Skeid Fotball | person_footballer_miniature | keyword: fotball |
| oslo_skoiteklub | Oslo Skøiteklub | person_skater_miniature | keyword: skøyte |
| eusebio | Eusébio | person_footballer_miniature | keyword: fotball |
| jose_alvalade | José Alvalade | person_footballer_miniature | keyword: fotball |
| tinashe_williamson | Tinashe Williamson | person_writer_miniature | keyword: forfatter |
| don_martin | Don Martin | person_writer_miniature | keyword: forfatter |
| romulo_de_carvalho | Rómulo de Carvalho | person_writer_miniature | keyword: forfatter |
| anne_cath_vestly | Anne-Cath. Vestly | person_writer_miniature | keyword: forfatter |
| arne_skouen | Arne Skouen | person_writer_miniature | keyword: forfatter |
| anja_breien | Anja Breien | person_writer_miniature | keyword: forfatter |
| nils_r_muller | Nils R. Müller | person_writer_miniature | keyword: forfatter |
| luis_villas_boas | Luís Villas-Boas | person_musician_miniature | keyword: musiker |

_Viser 30 av 32. Full liste i `reports/visual-design-codes-audit.json`._

### Artikler

- totalt: 31 (high 0, medium 12, low 19)

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

#### Review candidates (10)

| id | navn/tittel | currentDesignCode | reason |
| --- | --- | --- | --- |
| slottsparken | Slottsparken | park_miniature | Navn/id antyder slott/palass, men koden er 'park_miniature' (vurder palace_miniature). |
| akerhus_slott | Akerhus Slott | fortress_miniature | Navn/id antyder slott/palass, men koden er 'fortress_miniature' (vurder palace_miniature). |
| carl_berner | Carl Berner | person_politician_miniature | Byplanlegging/urbanisme antydes, men koden er 'person_politician_miniature' (vurder person_urban_planner_miniature). |
| harald_hals | Harald Hals | person_urban_planner_miniature | Arkitekt antydes, men koden er 'person_urban_planner_miniature' (vurder person_architect_miniature). |
| sverre_pedersen | Sverre Pedersen | person_urban_planner_miniature | Arkitekt antydes, men koden er 'person_urban_planner_miniature' (vurder person_architect_miniature). |
| peder_anker | Peder Anker | person_politician_miniature | Næringsliv/handel antydes, men koden er 'person_politician_miniature' (vurder person_business_miniature). |
| joao_luis_carrilho_da_graca | João Luís Carrilho da Graça | person_architect_miniature | Næringsliv/handel antydes, men koden er 'person_architect_miniature' (vurder person_business_miniature). |
| manuel_tainha | Manuel Tainha | person_architect_miniature | Næringsliv/handel antydes, men koden er 'person_architect_miniature' (vurder person_business_miniature). |
| eduardo_souto_de_moura | Eduardo Souto de Moura | person_architect_miniature | Næringsliv/handel antydes, men koden er 'person_architect_miniature' (vurder person_business_miniature). |
| ole_gunnar_solskjaer | Ole Gunnar Solskjær | person_footballer_miniature | Tags/desc antyder trener/coach, men koden er 'person_footballer_miniature' (vurder person_coach_miniature). |

## Forslag til Pilot batch 3

Prioritert liste (P5 = åpenbar og viktig, P3 = sannsynlig, bør sjekkes).
Lavere prioritet (P1–P2) finnes kun i JSON-rapporten.

#### Places (totalt 249, viser 20)

- `church_miniature`:
  - [P5] Kulturkirken Jakob (`kulturkirken_jakob_litteratur`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de Santo António (`lisbon_igreja_de_santo_antonio`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de São Domingos (`lisbon_igreja_de_sao_domingos`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Igreja de São Roque (`lisbon_igreja_de_sao_roque`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
  - [P5] Miradouro da Senhora do Monte (`lisbon_miradouro_da_senhora_do_monte`) — heuristisk high-confidence treff (kapell); gjør eksplisitt for stabil visuell identitet
  - [P5] Panteão Nacional (Igreja de Santa Engrácia) (`lisbon_panteao_nacional`) — heuristisk high-confidence treff (kirke); gjør eksplisitt for stabil visuell identitet
- `cinema_miniature`:
  - [P5] Cinema Ideal (`lisbon_cinema_ideal`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema Nimas (`lisbon_cinema_nimas`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
  - [P5] Doclisboa – Festival Internacional de Cinema (`lisbon_doclisboa`) — heuristisk high-confidence treff (cinema); gjør eksplisitt for stabil visuell identitet
- `farm_estate_miniature`:
  - [P5] Bygdøy Kongsgård salamanderdam (`bygdoy_kongsgard_salamanderdam`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Gardermoen Motorpark (`gardermoen_motorpark`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Gardermoen Raceway (`gardermoen_raceway`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Grünerløkka bakgårdsvegger (`grunerlokka_bakgardsvegger`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
- `library_miniature`:
  - [P5] Grémio Literário (`lisbon_gremio_literario`) — heuristisk high-confidence treff (bibliotek); gjør eksplisitt for stabil visuell identitet
- `monument_miniature`:
  - [P5] Alf Prøysen-statuen – Nittedal kulturhus (`alf_proysen_statue_nittedal`) — heuristisk high-confidence treff (statue); gjør eksplisitt for stabil visuell identitet
  - [P5] Aqueduto das Águas Livres (`lisbon_aqueduto_das_aguas_livres`) — heuristisk high-confidence treff (monument); gjør eksplisitt for stabil visuell identitet
  - [P5] Belém (`lisbon_belem_bydel`) — heuristisk high-confidence treff (monument); gjør eksplisitt for stabil visuell identitet
  - [P5] Cinema São Jorge (`lisbon_cinema_sao_jorge`) — heuristisk high-confidence treff (monument); gjør eksplisitt for stabil visuell identitet
  - [P5] Praça dos Restauradores (`lisbon_praca_dos_restauradores`) — heuristisk high-confidence treff (monument); gjør eksplisitt for stabil visuell identitet
  - [P5] Praça Luís de Camões (`lisbon_praca_luis_de_camoes`) — heuristisk high-confidence treff (monument); gjør eksplisitt for stabil visuell identitet

#### People (totalt 180, viser 20)

- `person_architect_miniature`:
  - [P5] Francisco Caldeira Cabral (`francisco_caldeira_cabral`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Gonçalo Ribeiro Telles (`goncalo_ribeiro_telles`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
- `person_athlete_miniature`:
  - [P5] Klanen (VIF) (`klanen`) — heuristisk high-confidence treff (sport); gjør eksplisitt for stabil visuell identitet
- `person_footballer_miniature`:
  - [P5] Eusébio (`eusebio`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] José Alvalade (`jose_alvalade`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Lyn Fotball (`lyn_fotball`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
  - [P5] Skeid Fotball (`skeid_fotball`) — heuristisk high-confidence treff (fotball); gjør eksplisitt for stabil visuell identitet
- `person_musician_miniature`:
  - [P5] Luís Villas-Boas (`luis_villas_boas`) — heuristisk high-confidence treff (musiker); gjør eksplisitt for stabil visuell identitet
- `person_politician_miniature`:
  - [P5] Hanna Kvanmo (`hanna_kvanmo`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Jo Benkow (`jo_benkow`) — heuristisk high-confidence treff (politiker); gjør eksplisitt for stabil visuell identitet
  - [P5] Marcelo Caetano (`marcelo_caetano`) — heuristisk high-confidence treff (statsminister); gjør eksplisitt for stabil visuell identitet
- `person_scientist_miniature`:
  - [P5] Alfred Nobel (`alfred_nobel`) — heuristisk high-confidence treff (nobel); gjør eksplisitt for stabil visuell identitet
- `person_skater_miniature`:
  - [P5] Oslo Skøiteklub (`oslo_skoiteklub`) — heuristisk high-confidence treff (skøyte); gjør eksplisitt for stabil visuell identitet
- `person_writer_miniature`:
  - [P5] Aasta Hansteen (`aasta_hansteen`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Anja Breien (`anja_breien`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Anne-Cath. Vestly (`anne_cath_vestly`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Arne Skouen (`arne_skouen`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Cecilie Enger (`cecilie_enger`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Christian Krohg (`christian_krohg`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet
  - [P5] Don Martin (`don_martin`) — heuristisk high-confidence treff (forfatter); gjør eksplisitt for stabil visuell identitet

#### Artikler (totalt 181, viser 30)

- `article_institution_miniature`:
  - [P4] Aftenposten i Akersgata (`aftenposten_akersgata_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] bankplassen (`bankplassen`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] botsparken (`botsparken`) — default-fallback; tydelig dyp-tekst treff 'fengsel'
  - [P4] ekebergparken (`ekebergparken`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] gronland_kirke (`gronland_kirke`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Kampen (`kampen_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Trehusmiljøet på Kampen (`kampen_trehusmiljo_smahus`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_centro_cultural_de_belem (`lisbon_centro_cultural_de_belem`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_culturgest (`lisbon_culturgest`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_maat (`lisbon_maat`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_mac_ccb_berardo (`lisbon_mac_ccb_berardo`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_mude (`lisbon_mude`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_museu_arpad_szenes_vieira_da_silva (`lisbon_museu_arpad_szenes_vieira_da_silva`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_museu_bordalo_pinheiro (`lisbon_museu_bordalo_pinheiro`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_museu_do_oriente (`lisbon_museu_do_oriente`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_museu_nacional_de_arte_antiga (`lisbon_museu_nacional_de_arte_antiga`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_museu_nacional_de_arte_contemporanea_do_chiado (`lisbon_museu_nacional_de_arte_contemporanea_do_chiado`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_museu_nacional_do_azulejo (`lisbon_museu_nacional_do_azulejo`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_teatro_nacional_d_maria_ii (`lisbon_teatro_nacional_d_maria_ii`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_teatro_sao_luiz (`lisbon_teatro_sao_luiz`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene som arbeiderby og hverdagsby (`sagene_arbeiderby_boligstruktur`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene som film- og TV-miljø (`sagene_film_tv_lag`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene (`sagene_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] schous_bryggeri (`schous_bryggeri`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Schous plass (`schous_plass_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] sofienberg_kirke (`sofienberg_kirke`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] tjuvholmen (`tjuvholmen`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Torshov (`torshov_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Torshov teater (`torshov_torshov_teater`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] trikk_17_18 (`trikk_17_18`) — default-fallback; tydelig dyp-tekst treff 'institusjon'

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
