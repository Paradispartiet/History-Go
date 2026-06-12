# Visual design codes – audit

Generert: 2026-06-12T09:34:18.931Z

> Denne rapporten viser ikke bare dekning, men også konkrete kandidater for
> neste batch. Full, uavkortet liste finnes alltid i
> [`reports/visual-design-codes-audit.json`](visual-design-codes-audit.json).

## Register

- designCodes totalt: **83**
- per entityType:
  - place: 31
  - person: 23
  - article: 29
  - story: 29
  - leksikon: 29
  - lesespor: 29

## Data funnet

- places: 504
- people: 431
- leksikon: 335
- lesespor: 9
- artikler totalt (leksikon + lesespor): 344

## Resolusjon

- eksplisitt `visual.designCode`: 529
- per kilde (alle entiteter):
  - explicit: 529
  - assetType: 0
  - category: 242
  - heuristic: 450
  - default: 58

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 144 | 0 | 116 | 240 | 4 |
| people | 118 | 0 | 126 | 179 | 8 |
| articles | 267 | 0 | 0 | 31 | 46 |

## Eksplisitt pilot-merkede designCodes

- places (144):
  - `stadium_miniature`: 30
  - `park_miniature`: 13
  - `church_miniature`: 11
  - `station_miniature`: 9
  - `monument_miniature`: 9
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
- articles (267):
  - `article_nature_route_miniature`: 74
  - `article_place_essay_miniature`: 36
  - `article_architecture_miniature`: 33
  - `article_institution_miniature`: 27
  - `article_transport_miniature`: 21
  - `article_art_miniature`: 18
  - `article_history_miniature`: 14
  - `article_media_history_miniature`: 13
  - `article_sports_history_miniature`: 11
  - `article_memory_place_miniature`: 3
  - `article_political_history_miniature`: 3
  - `article_urban_infrastructure_miniature`: 3
  - `article_literature_miniature`: 3
  - `article_religion_miniature`: 2
  - `article_local_story_miniature`: 2
  - `article_groundhopper_miniature`: 1
  - `article_object_story_miniature`: 1
  - `article_industry_miniature`: 1
  - `article_language_miniature`: 1

## Pilot batch status

- Batch 1-baseline: 73 eksplisitte `visual.designCode`.
- Etter batch 2: 169 eksplisitte `visual.designCode`.
- Etter batch 3: 249 eksplisitte `visual.designCode`.
- Nåværende total: 529 eksplisitte `visual.designCode` (144 places, 118 people, 267 articles).
- Endring siden batch 3: 280.
- Omfang: Kontrollerte pilot-batcher for visual.designCode-dekning; nåværende total beregnes fra data.

## Topp brukte designCodes

- `waterfront_miniature`: 83
- `article_nature_route_miniature`: 74
- `park_miniature`: 59
- `article_place_essay_miniature`: 48
- `person_writer_miniature`: 46
- `article_default_miniature`: 46
- `person_business_miniature`: 45
- `person_historical_miniature`: 40
- `person_scientist_miniature`: 40
- `stadium_miniature`: 39
- `person_activist_miniature`: 38
- `person_musician_miniature`: 36
- `article_architecture_miniature`: 33
- `article_institution_miniature`: 28
- `museum_miniature`: 27

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

#### Artikler som fortsatt er `article_default_miniature` (46)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| gamle_trikkestallen | gamle_trikkestallen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| tigeren | tigeren | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| spikersuppa | spikersuppa | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| slottsparken | slottsparken | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| botsparken | botsparken | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| stensparken | stensparken | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| olaf_ryes_plass | olaf_ryes_plass | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| birkelunden | birkelunden | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| operahuset | operahuset | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| schous_bryggeri | schous_bryggeri | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| nydalsdammen | nydalsdammen | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| bygdoy_roykenvika | bygdoy_roykenvika | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| bygdoy_natur | Bygdøy naturmiljø | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| ankerbrua | ankerbrua | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| cinemateket_oslo_filmkultur_i_oslo | Filmkultur i Oslo | — | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| chateau_neuf_revy_og_studentkultur | Revy og studentkultur | — | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| schous_plass_hovedartikkel | Schous plass | — | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| vaterland_hovedartikkel | Vaterland | — | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| vaterland_sanering | Saneringen av Vaterland | — | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| vaterland_vaterlandsparken | Vaterlandsparken | — | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| sagene_film_tv_lag | Sagene som film- og TV-miljø | — | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| kampen_topografi_bratte_gater | Kampens topografi og bratte gater | — | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| kampen_film_tv_lag | Kampen som film- og TV-miljø | — | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| colosseum_kino_hovedartikkel | Colosseum kino som norsk storfilmkino | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| house_of_nerds_hovedartikkel | House of Nerds som møteplass for nerdkultur | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| folketeateret_hovedartikkel | Folketeateret som storskalateater for musikaler | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| latter_hovedartikkel | Latter som profesjonell standup-scene | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| frognerstranda_hovedartikkel | Frognerstranda som sesongbasert kjendissone | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| majorstuen_krysset_hovedartikkel | Majorstuen-krysset som hverdagsspottingsone | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| vaterland_populaerkultur_hovedartikkel | Vaterland som filmkulisse for krim og TV-drama | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| gronlandsleiret_hovedartikkel | Grønlandsleiret som sosialrealistisk filmbakteppe | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| psykologisk_institutt_uio_psykologi_fag | Psykologi som fag ved instituttet | — | data/leksikon/places/oslo/mixed/leksikon_oslo_psykologisk_institutt_uio.json |
| kampen_park_hovedartikkel | Kampen park | — | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| kampen_park_parkrom_terreng | Parkrom, bakker og terreng i Kampen park | — | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| trosterud_friomrade_stier_bruk | Stier og hverdagsbevegelse | — | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| furuset_haugerud_skogbelte_boligkant | Boligkant og naturkant | — | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| hellerud_gard_hovedartikkel | Hellerud gård | — | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| hellerud_gard_jordbruk_byutvikling | Fra jordbruk til byutvikling | — | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| toyen_torg_torgscene | Torgflaten som offentlig scene | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| toyen_torg_identitet | Tøyen-identitet i sentrumsskala | — | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |

_Viser 40 av 46. Full liste i `reports/visual-design-codes-audit.json`._

## Heuristiske kandidater for eksplisitt designCode

Entiteter uten eksplisitt kode, men der resolveren gir en konkret kode via
heuristikk. High-confidence treff er trygge kandidater for eksplisitt merking.

### Places

- totalt: 240 (high 62, medium 173, low 5)

#### Topp high-confidence (62)

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
| lisbon_igreja_de_santo_antonio | Igreja de Santo António | church_miniature | keyword: kirke |
| lisbon_igreja_de_sao_roque | Igreja de São Roque | church_miniature | keyword: kirke |
| lisbon_museu_do_aljube | Museu do Aljube – Resistência e Liberdade | museum_miniature | keyword: museum |
| lisbon_igreja_de_sao_domingos | Igreja de São Domingos | church_miniature | keyword: kirke |
| lisbon_museu_de_marinha | Museu de Marinha | museum_miniature | keyword: museum |
| lisbon_museu_nacional_dos_coches | Museu Nacional dos Coches | museum_miniature | keyword: museum |

_Viser 30 av 62. Full liste i `reports/visual-design-codes-audit.json`._

### People

- totalt: 179 (high 35, medium 144, low 0)

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
| reinaldo_manuel_dos_santos | Reinaldo Manuel dos Santos | person_architect_miniature | keyword: arkitekt |
| angel_arribas_ugarte | Ángel Arribas Ugarte | person_architect_miniature | keyword: arkitekt |
| manuel_aires_mateus | Manuel Aires Mateus | person_architect_miniature | keyword: arkitekt |
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

_Viser 30 av 35. Full liste i `reports/visual-design-codes-audit.json`._

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

### `article_popular_culture_miniature`

- family: popular_culture
- entityTypes: article, story, leksikon, lesespor
- søkeord: `populærkultur`, `filmkultur`, `kino`, `TV`, `standup`, `gaming`, `kjendis`
- anbefalt: Vurder film, TV, scene/standup, spillkultur, kjendiskultur og populærkulturell stedsbruk for eksplisitt article_popular_culture_miniature (jf. future small data batch).

### `article_everyday_life_miniature`

- family: everyday_life
- entityTypes: article, story, leksikon, lesespor
- søkeord: `hverdagsliv`, `møteplass`, `daglig bruk`, `parkbruk`, `sosial bruk`, `byliv`
- anbefalt: Vurder hverdagsbruk, møteplasser, parkbruk og sosialt byliv for eksplisitt article_everyday_life_miniature (jf. future small data batch).

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

### `article_science_history_miniature`

- family: science
- entityTypes: article, story, leksikon, lesespor
- søkeord: `forskning`, `vitenskap`, `laboratorium`, `institutt`, `metode`, `fagfelt`
- anbefalt: Vurder forskning, vitenskapshistorie, fagmiljøer og laboratorier for eksplisitt article_science_history_miniature (jf. articleBatch7Plan).

### `article_food_market_miniature`

- family: food_market
- entityTypes: article, story, leksikon, lesespor
- søkeord: `matmarked`, `torghandel`, `mathall`, `markedshall`, `matkultur`, `servering`
- anbefalt: Vurder matmarked, torghandel, mathall, serverings- og matkultur for eksplisitt article_food_market_miniature (jf. articleBatch7Plan).

### `article_childhood_play_miniature`

- family: childhood
- entityTypes: article, story, leksikon, lesespor
- søkeord: `lekeplass`, `barndom`, `lek`, `barn`, `skolegård`, `aktivitet`
- anbefalt: Vurder lekeplasser, barndom/lek og barns bruk av sted for eksplisitt article_childhood_play_miniature (jf. articleBatch7Plan).

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

#### Places (totalt 238, viser 20)

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

#### People (totalt 185, viser 20)

- `person_architect_miniature`:
  - [P5] Ángel Arribas Ugarte (`angel_arribas_ugarte`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Francisco Caldeira Cabral (`francisco_caldeira_cabral`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Gonçalo Ribeiro Telles (`goncalo_ribeiro_telles`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Manuel Aires Mateus (`manuel_aires_mateus`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Reinaldo Manuel dos Santos (`reinaldo_manuel_dos_santos`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
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

#### Artikler (totalt 53, viser 30)

- `article_architecture_miniature`:
  - [P3] Colosseum kino som norsk storfilmkino (`colosseum_kino_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'bygning'
- `article_art_miniature`:
  - [P3] Broen og skulpturrommene (`frognerparken_broen_og_skulpturrom`) — heuristisk medium-confidence treff (skulptur); bør sjekkes før eksplisitt merking
  - [P3] Banal og overdimensjonert skulpturpark (`lesespor_ekebergparken_001`) — heuristisk medium-confidence treff (skulptur); bør sjekkes før eksplisitt merking
  - [P3] – Et smykkeskrin for våre kunstskatter (`lesespor_nasjonalmuseet_001`) — heuristisk medium-confidence treff (kunst); bør sjekkes før eksplisitt merking
- `article_biography_miniature`:
  - [P3] ankerbrua (`ankerbrua`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] birkelunden (`birkelunden`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Bygdøy naturmiljø (`bygdoy_natur`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Frognerstranda som sesongbasert kjendissone (`frognerstranda_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] gamle_trikkestallen (`gamle_trikkestallen`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Kampen som film- og TV-miljø (`kampen_film_tv_lag`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Aktivitet skaper tryggere byer (`lesespor_gronland_001`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Majorstuen-krysset som hverdagsspottingsone (`majorstuen_krysset_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] olaf_ryes_plass (`olaf_ryes_plass`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] operahuset (`operahuset`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] spikersuppa (`spikersuppa`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Populærkultur gjennom bruk av stedet (`toyen_torg_byliv`) — heuristisk medium-confidence treff (liv); bør sjekkes før eksplisitt merking
- `article_childhood_play_miniature`:
  - [P5] Kampen park (`kampen_park_hovedartikkel`) — default-fallback; dyp-tekst treff 'lekeplass' dekker ubrukt kode article_childhood_play_miniature
  - [P5] Parkrom, bakker og terreng i Kampen park (`kampen_park_parkrom_terreng`) — default-fallback; dyp-tekst treff 'lekeplass' dekker ubrukt kode article_childhood_play_miniature
- `article_everyday_life_miniature`:
  - [P5] Hva er god byutvikling? (`lesespor_gronland_003`) — default-fallback; dyp-tekst treff 'sosial bruk' dekker ubrukt kode article_everyday_life_miniature
  - [P5] slottsparken (`slottsparken`) — default-fallback; dyp-tekst treff 'hverdagsbruk' dekker ubrukt kode article_everyday_life_miniature
- `article_groundhopper_miniature`:
  - [P3] Aker Brygge som synlig kjendisarena (`aker_brygge_hovedartikkel`) — heuristisk medium-confidence treff (arena); bør sjekkes før eksplisitt merking
  - [P3] Grand Hotel som arena for prisutdelinger og pressebilder (`grand_hotel_hovedartikkel`) — heuristisk medium-confidence treff (arena); bør sjekkes før eksplisitt merking
- `article_industry_miniature`:
  - [P3] schous_bryggeri (`schous_bryggeri`) — default-fallback; mulig dyp-tekst treff 'bryggeri'
- `article_institution_miniature`:
  - [P4] botsparken (`botsparken`) — default-fallback; tydelig dyp-tekst treff 'fengsel'
  - [P3] bygdoy_roykenvika (`bygdoy_roykenvika`) — default-fallback; mulig dyp-tekst treff 'forvaltning'
- `article_popular_culture_miniature`:
  - [P5] Revy og studentkultur (`chateau_neuf_revy_og_studentkultur`) — default-fallback; dyp-tekst treff 'revy' dekker ubrukt kode article_popular_culture_miniature
  - [P5] Filmkultur i Oslo (`cinemateket_oslo_filmkultur_i_oslo`) — default-fallback; dyp-tekst treff 'filmkultur' dekker ubrukt kode article_popular_culture_miniature
  - [P5] Grønlandsleiret som sosialrealistisk filmbakteppe (`gronlandsleiret_hovedartikkel`) — default-fallback; dyp-tekst treff 'film' dekker ubrukt kode article_popular_culture_miniature
  - [P5] House of Nerds som møteplass for nerdkultur (`house_of_nerds_hovedartikkel`) — default-fallback; dyp-tekst treff 'house of nerds' dekker ubrukt kode article_popular_culture_miniature
  - [P5] Latter som profesjonell standup-scene (`latter_hovedartikkel`) — default-fallback; dyp-tekst treff 'latter' dekker ubrukt kode article_popular_culture_miniature

## Remaining article default audit

Klassifisering av de gjenværende `article_default_miniature`. Denne
delen merker **ingen** datafiler – den klassifiserer om en eventuell batch 7 har nok trygge kandidater.

- total `article_default_miniature`: **46**
- safeBatch7Candidates: 22
- needsMetadata: 0
- needsNewDesignCode: 6
- keepDefaultForNow: 6
- manualReview: 12

### Trygge batch 7-kandidater

#### safeBatch7Candidates (22)

| id / title | suggestedDesignCode | confidence | reason | file |
| --- | --- | --- | --- | --- |
| birkelunden — Birkelunden er et grønt samlingspunkt på Grünerløkka med høy hverdagsbruk i tett byvev. | article_everyday_life_miniature | high | tydelig eksisterende fagområde (rekreasjon, hverdagsbruk, hverdag) → `article_everyday_life_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| kampen_park_hovedartikkel — Kampen park | article_everyday_life_miniature | high | tydelig eksisterende fagområde (hverdag) → `article_everyday_life_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| olaf_ryes_plass — Olaf Ryes plass er Grünerløkkas nabolagstorg med sterk sosial hverdagsbruk. | article_everyday_life_miniature | high | tydelig eksisterende fagområde (hverdagsbruk, møteplass) → `article_everyday_life_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| slottsparken — Slottsparken kombinerer kongelig representasjonslandskap med åpen hverdagsbruk midt i byen. | article_everyday_life_miniature | high | tydelig eksisterende fagområde (hverdagsbruk, parkbruk) → `article_everyday_life_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| spikersuppa — Spikersuppa er et sentralt møtepunkt på Karl Johan med tydelig sesongskifte fra oppholdsplass til skøytebane. | article_everyday_life_miniature | high | tydelig eksisterende fagområde (møtepunkt, oppholdsplass, sesongbruk, møteplass) → `article_everyday_life_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| stensparken — Stensparken er en høydepark som kombinerer utsikt, gjennomgang og nabolagsopphold mellom Bislett og St. Hanshaugen. | article_everyday_life_miniature | high | tydelig eksisterende fagområde (hverdagsbevegelse, parkbruk) → `article_everyday_life_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| tigeren — Bysymbol ved Oslo S med høy synlighet i hverdagsmobiliteten. | article_everyday_life_miniature | high | tydelig eksisterende fagområde (møtepunkt, hverdag) → `article_everyday_life_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| bygdoy_natur — Bygdøy naturmiljø | article_nature_route_miniature | high | tydelig eksisterende fagområde (natur, bynatur) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| furuset_haugerud_skogbelte_boligkant — Boligkant og naturkant | article_nature_route_miniature | high | tydelig eksisterende fagområde (skogbelte, nærnatur) → `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| chateau_neuf_revy_og_studentkultur — Revy og studentkultur | article_popular_culture_miniature | high | tydelig eksisterende fagområde (revy, scene) → `article_popular_culture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| cinemateket_oslo_filmkultur_i_oslo — Filmkultur i Oslo | article_popular_culture_miniature | high | tydelig eksisterende fagområde (cinemateket, filmkultur, film) → `article_popular_culture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| colosseum_kino_hovedartikkel — Colosseum kino som norsk storfilmkino | article_popular_culture_miniature | high | tydelig eksisterende fagområde (colosseum kino, scene, kino, film, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| folketeateret_hovedartikkel — Folketeateret som storskalateater for musikaler | article_popular_culture_miniature | high | tydelig eksisterende fagområde (scene, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| frognerstranda_hovedartikkel — Frognerstranda som sesongbasert kjendissone | article_popular_culture_miniature | high | tydelig eksisterende fagområde (kjendis, sladder, livsstilsmedier, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| gronlandsleiret_hovedartikkel — Grønlandsleiret som sosialrealistisk filmbakteppe | article_popular_culture_miniature | high | tydelig eksisterende fagområde (film, serie, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| house_of_nerds_hovedartikkel — House of Nerds som møteplass for nerdkultur | article_popular_culture_miniature | high | tydelig eksisterende fagområde (house of nerds, nerdkultur, spillkultur, sjangerfellesskap, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| kampen_film_tv_lag — Kampen som film- og TV-miljø | article_popular_culture_miniature | high | tydelig eksisterende fagområde (film- og tv) → `article_popular_culture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| latter_hovedartikkel — Latter som profesjonell standup-scene | article_popular_culture_miniature | high | tydelig eksisterende fagområde (latter, standup, scene, tv, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| sagene_film_tv_lag — Sagene som film- og TV-miljø | article_popular_culture_miniature | high | tydelig eksisterende fagområde (film- og tv, filmsted) → `article_popular_culture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| toyen_torg_torgscene — Torgflaten som offentlig scene | article_popular_culture_miniature | high | tydelig eksisterende fagområde (scene) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| vaterland_populaerkultur_hovedartikkel — Vaterland som filmkulisse for krim og TV-drama | article_popular_culture_miniature | high | tydelig eksisterende fagområde (populaerkultur, filmkulisse, krim, tv, serie, film, populærkultur) → `article_popular_culture_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| oslo_s_sentrum_mobilitet — Porten til sentrum | article_everyday_life_miniature | medium | tydelig eksisterende fagområde (møtepunkt) → `article_everyday_life_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |

### Mangler metadata

#### needsMetadata (0)

- (ingen)

### Trenger mulig ny designCode

#### needsNewDesignCode (6)

- `article_civic_space_miniature` (2):
  - lesespor_gronland_001 [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_civic_space_miniature` (`data/lesespor/oslo/lesespor_oslo_by.json`)
  - lesespor_gronland_003 [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_civic_space_miniature` (`data/lesespor/oslo/lesespor_oslo_by.json`)
- `article_event_place_miniature` (1):
  - slottsplassen_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_event_place_miniature` (`data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json`)
- `article_neighborhood_identity_miniature` (1):
  - toyen_torg_identitet [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_neighborhood_identity_miniature` (`data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json`)
- `article_social_history_miniature` (2):
  - lesespor_bjorvika_001 [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_social_history_miniature` (`data/lesespor/oslo/lesespor_oslo_by.json`)
  - vaterland_sanering [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_social_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json`)

### Bør forbli default foreløpig

#### keepDefaultForNow (6)

| id / title | reason | file |
| --- | --- | --- |
| bygdoy_roykenvika — Røykensvika på Bygdøy er en fjordvik med strandkant, gruntvann og vegeterte randsoner. Vika markerer en mykere overgang mellom land og sjø. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| hellerud_gard_jordbruk_byutvikling — Fra jordbruk til byutvikling | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| kampen_park_parkrom_terreng — Parkrom, bakker og terreng i Kampen park | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| kampen_topografi_bratte_gater — Kampens topografi og bratte gater | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| operahuset — Operahuset er både kulturinstitusjon og offentlig taklandskap i fjordbyen. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| slottsplassen_fotografi — Fotografi og turistblikk | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |

### Manuell vurdering

#### manualReview (12)

| id / title | suggestedDesignCode | reason | file |
| --- | --- | --- | --- |
| botsparken — Botsparken er en liten nabolagspark ved Botsfengselet med stor hverdagsverdi i tett by. | article_everyday_life_miniature | flere plausible koder med lik styrke: `article_everyday_life_miniature` vs `article_childhood_play_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| schous_bryggeri — Schous plass er et grønt nabolagsrom i Grünerløkkas tette kvartalsstruktur. | article_everyday_life_miniature | flere plausible koder med lik styrke: `article_everyday_life_miniature` vs `article_architecture_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| trosterud_friomrade_stier_bruk — Stier og hverdagsbevegelse | article_everyday_life_miniature | flere plausible koder med lik styrke: `article_everyday_life_miniature` vs `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| schous_plass_hovedartikkel — Schous plass | article_industry_miniature | flere plausible koder med lik styrke: `article_industry_miniature` vs `article_place_essay_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| psykologisk_institutt_uio_psykologi_fag — Psykologi som fag ved instituttet | article_institution_miniature | flere plausible koder med lik styrke: `article_institution_miniature` vs `article_science_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_psykologisk_institutt_uio.json |
| hellerud_gard_hovedartikkel — Hellerud gård | article_memory_place_miniature | flere plausible koder med lik styrke: `article_memory_place_miniature` vs `article_architecture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| ankerbrua — Sentral Akerselv-bro med tydelig elveromskobling. | article_nature_route_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_urban_infrastructure_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| nydalsdammen — Regulert dammiljø i Akerselva der vannstyring, byhistorie og bynatur møtes. | article_nature_route_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_urban_infrastructure_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| vaterland_vaterlandsparken — Vaterlandsparken | article_nature_route_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_social_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| majorstuen_krysset_hovedartikkel — Majorstuen-krysset som hverdagsspottingsone | article_popular_culture_miniature | flere plausible koder med lik styrke: `article_popular_culture_miniature` vs `article_everyday_life_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| gamle_trikkestallen — Tidlig trikkedriftsanlegg med transport- og arbeidshistorisk verdi. | article_transport_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_industry_miniature` | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| vaterland_hovedartikkel — Vaterland | article_transport_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |

## Article batch 7 plan

Anbefalt omfang: **0–40** artikler (ikke press frem batch hvis kandidatgrunnlaget er lite).
Prioritert rekkefølge:
1. safe high/medium-confidence article defaults
1. only candidates backed by existing metadata
1. do not include metadata/new-code/default/manual-review groups

Kun trygge kandidater (high/medium-confidence). `needsMetadata` og
`needsNewDesignCode` tas **ikke** med som direkte batchkandidater.

Topp 22 av 22, gruppert etter `suggestedDesignCode`:

- `article_everyday_life_miniature` (8):
  - birkelunden [high] — tydelig eksisterende fagområde (rekreasjon, hverdagsbruk, hverdag) → `article_everyday_life_miniature`
  - kampen_park_hovedartikkel [high] — tydelig eksisterende fagområde (hverdag) → `article_everyday_life_miniature`
  - olaf_ryes_plass [high] — tydelig eksisterende fagområde (hverdagsbruk, møteplass) → `article_everyday_life_miniature`
  - slottsparken [high] — tydelig eksisterende fagområde (hverdagsbruk, parkbruk) → `article_everyday_life_miniature`
  - spikersuppa [high] — tydelig eksisterende fagområde (møtepunkt, oppholdsplass, sesongbruk, møteplass) → `article_everyday_life_miniature`
  - stensparken [high] — tydelig eksisterende fagområde (hverdagsbevegelse, parkbruk) → `article_everyday_life_miniature`
  - tigeren [high] — tydelig eksisterende fagområde (møtepunkt, hverdag) → `article_everyday_life_miniature`
  - oslo_s_sentrum_mobilitet [medium] — tydelig eksisterende fagområde (møtepunkt) → `article_everyday_life_miniature`
- `article_nature_route_miniature` (2):
  - bygdoy_natur [high] — tydelig eksisterende fagområde (natur, bynatur) → `article_nature_route_miniature`
  - furuset_haugerud_skogbelte_boligkant [high] — tydelig eksisterende fagområde (skogbelte, nærnatur) → `article_nature_route_miniature`
- `article_popular_culture_miniature` (12):
  - chateau_neuf_revy_og_studentkultur [high] — tydelig eksisterende fagområde (revy, scene) → `article_popular_culture_miniature`
  - cinemateket_oslo_filmkultur_i_oslo [high] — tydelig eksisterende fagområde (cinemateket, filmkultur, film) → `article_popular_culture_miniature`
  - colosseum_kino_hovedartikkel [high] — tydelig eksisterende fagområde (colosseum kino, scene, kino, film, populærkultur) → `article_popular_culture_miniature`
  - folketeateret_hovedartikkel [high] — tydelig eksisterende fagområde (scene, populærkultur) → `article_popular_culture_miniature`
  - frognerstranda_hovedartikkel [high] — tydelig eksisterende fagområde (kjendis, sladder, livsstilsmedier, populærkultur) → `article_popular_culture_miniature`
  - gronlandsleiret_hovedartikkel [high] — tydelig eksisterende fagområde (film, serie, populærkultur) → `article_popular_culture_miniature`
  - house_of_nerds_hovedartikkel [high] — tydelig eksisterende fagområde (house of nerds, nerdkultur, spillkultur, sjangerfellesskap, populærkultur) → `article_popular_culture_miniature`
  - kampen_film_tv_lag [high] — tydelig eksisterende fagområde (film- og tv) → `article_popular_culture_miniature`
  - latter_hovedartikkel [high] — tydelig eksisterende fagområde (latter, standup, scene, tv, populærkultur) → `article_popular_culture_miniature`
  - sagene_film_tv_lag [high] — tydelig eksisterende fagområde (film- og tv, filmsted) → `article_popular_culture_miniature`
  - toyen_torg_torgscene [high] — tydelig eksisterende fagområde (scene) → `article_popular_culture_miniature`
  - vaterland_populaerkultur_hovedartikkel [high] — tydelig eksisterende fagområde (populaerkultur, filmkulisse, krim, tv, serie, film, populærkultur) → `article_popular_culture_miniature`

## Remaining article-default decision

Dette er en audit-/beslutningsseksjon etter Article batch 7, ikke en ny data-batch. Den merker ingen artikler og endrer ikke register eller resolver.

- total remaining `article_default_miniature`: **46**
- metadataFirst count: 0
- registerExpansionCandidates count: 6 artikler / 6 kodeforslag
- manualReviewBeforeAction count: 12
- keepDefaultIntentionally count: 6
- deferSafeButLowValue count: 1

**Anbefalt neste steg:** Do not create Article batch 8 now; run audit-only review of the new popular culture/everyday life candidates, then consider a small high-confidence data batch.

### Metadata først

#### metadataFirst (0)

- (ingen)

### Mulige nye designCodes

#### `article_civic_space_miniature`

- candidateCount: 2
- priority: 3
- shouldAddNow: false
- eksempelartikler: lesespor_gronland_001, lesespor_gronland_003
- reason: Tydelig systemverdi for torg og offentlig scene, men bare få sikre kandidater i restgruppen; bør vurderes sammen med manuell byromsgjennomgang.

#### `article_social_history_miniature`

- candidateCount: 2
- priority: 3
- shouldAddNow: false
- eksempelartikler: lesespor_bjorvika_001, vaterland_sanering
- reason: Sosialhistorie er faglig relevant, men restgruppen har få entydige kandidater og flere manuelle grenseflater mot natur/byfornyelse.

#### `article_event_place_miniature`

- candidateCount: 1
- priority: 2
- shouldAddNow: false
- eksempelartikler: slottsplassen_begreper
- reason: Seremonier, parader og sesonghendelser er et mulig visuelt mønster, men restgruppen har for få entydige kandidater til egen kode nå.

#### `article_neighborhood_identity_miniature`

- candidateCount: 1
- priority: 2
- shouldAddNow: false
- eksempelartikler: toyen_torg_identitet
- reason: Nabolagsidentitet kan bli nyttig, men én sikker kandidat bør ikke alene drive registerutvidelse.

#### `article_education_place_miniature`

- candidateCount: 0
- priority: 1
- shouldAddNow: false
- eksempelartikler: —
- reason: Ingen tydelige gjenværende kandidater etter batch 7; ikke legg til kode nå.

#### `article_nightlife_miniature`

- candidateCount: 0
- priority: 1
- shouldAddNow: false
- eksempelartikler: —
- reason: Ingen tydelige gjenværende kandidater etter batch 7; ikke legg til kode nå.

### Manuell vurdering

#### manualReviewBeforeAction (12)

| id/title | possibleDesignCodes | reason | file |
| --- | --- | --- | --- |
| botsparken — Botsparken er en liten nabolagspark ved Botsfengselet med stor hverdagsverdi i tett by. | article_everyday_life_miniature, article_childhood_play_miniature | flere plausible koder med lik styrke: `article_everyday_life_miniature` vs `article_childhood_play_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| schous_bryggeri — Schous plass er et grønt nabolagsrom i Grünerløkkas tette kvartalsstruktur. | article_everyday_life_miniature, article_architecture_miniature | flere plausible koder med lik styrke: `article_everyday_life_miniature` vs `article_architecture_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| trosterud_friomrade_stier_bruk — Stier og hverdagsbevegelse | article_everyday_life_miniature, article_nature_route_miniature | flere plausible koder med lik styrke: `article_everyday_life_miniature` vs `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| schous_plass_hovedartikkel — Schous plass | article_industry_miniature, article_place_essay_miniature | flere plausible koder med lik styrke: `article_industry_miniature` vs `article_place_essay_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| psykologisk_institutt_uio_psykologi_fag — Psykologi som fag ved instituttet | article_institution_miniature, article_science_history_miniature | flere plausible koder med lik styrke: `article_institution_miniature` vs `article_science_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_psykologisk_institutt_uio.json |
| hellerud_gard_hovedartikkel — Hellerud gård | article_memory_place_miniature, article_architecture_miniature | flere plausible koder med lik styrke: `article_memory_place_miniature` vs `article_architecture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| ankerbrua — Sentral Akerselv-bro med tydelig elveromskobling. | article_nature_route_miniature, article_urban_infrastructure_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_urban_infrastructure_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| nydalsdammen — Regulert dammiljø i Akerselva der vannstyring, byhistorie og bynatur møtes. | article_nature_route_miniature, article_urban_infrastructure_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_urban_infrastructure_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| vaterland_vaterlandsparken — Vaterlandsparken | article_nature_route_miniature, article_social_history_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_social_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| majorstuen_krysset_hovedartikkel — Majorstuen-krysset som hverdagsspottingsone | article_popular_culture_miniature, article_everyday_life_miniature | flere plausible koder med lik styrke: `article_popular_culture_miniature` vs `article_everyday_life_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| gamle_trikkestallen — Tidlig trikkedriftsanlegg med transport- og arbeidshistorisk verdi. | article_transport_miniature, article_industry_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_industry_miniature` | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| vaterland_hovedartikkel — Vaterland | article_transport_miniature, article_nature_route_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |

### Behold default foreløpig

#### keepDefaultIntentionally (6)

| id/title | reason | file |
| --- | --- | --- |
| bygdoy_roykenvika — Røykensvika på Bygdøy er en fjordvik med strandkant, gruntvann og vegeterte randsoner. Vika markerer en mykere overgang mellom land og sjø. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| hellerud_gard_jordbruk_byutvikling — Fra jordbruk til byutvikling | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| kampen_park_parkrom_terreng — Parkrom, bakker og terreng i Kampen park | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| kampen_topografi_bratte_gater — Kampens topografi og bratte gater | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| operahuset — Operahuset er både kulturinstitusjon og offentlig taklandskap i fjordbyen. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| slottsplassen_fotografi — Fotografi og turistblikk | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |

### Vent selv om mulig

#### deferSafeButLowValue (1)

| id/title | possibleDesignCode | reason |
| --- | --- | --- |
| oslo_s_sentrum_mobilitet — Porten til sentrum | article_everyday_life_miniature | tydelig eksisterende fagområde (møtepunkt) → `article_everyday_life_miniature` |

### Anbefalt neste PR-rekkefølge

| step | title | type | reason | scope |
| --- | --- | --- | --- | --- |
| 1 | Audit-only review of new popular culture/everyday life candidates | audit | Registeret har nå egne koder for de to største tidligere hullene; neste steg er å lese de omklassifiserte safe/deferred kandidatene uten å starte en bred artikkelbatch. | Bruk remainingArticleDefaultDecision og articleBatch7Plan som beslutningsgrunnlag; ingen visual.designCode endres av audit alene. |
| 2 | Small data batch only for high-confidence candidates | data-batch | Etter audit-only gjennomgang kan en liten batch merke bare artikler med tydelig metadata og vedtatte koder, inkludert de nye kodene der evidensen er klar. | Eventuell senere batch skal være smal og eksplisitt ikke en automatisk Article batch 8 over hele restgruppen. |
| 3 | Manual review of ambiguous remainder | manual-review | Flere artikler har to omtrent like plausible koder eller krever faglig valg mellom sted, bruk, sosialhistorie, byrom og infrastruktur. | Beslutningsnotat per artikkel; kan ende med eksisterende kode, ny kode, metadataarbeid eller bevisst default. |
| 4 | Defer further register expansion | register | Etter popular culture/everyday life-utvidelsen bør nye registerkoder vente til audit viser et nytt, konsolidert hull med flere sikre kandidater. | Ikke foreslå en ny register-PR umiddelbart; samle civic/social/event/neighborhood-spørsmål med manuell vurdering først. |
| 5 | Accept intentional article defaults | none | Noen brede, blandede eller svakt visuelle artikler bør ikke presses inn i smale designCodes. | Behold article_default_miniature for artiklene i keepDefaultIntentionally til bedre semantisk grunnlag finnes. |

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
