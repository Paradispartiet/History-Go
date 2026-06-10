# Visual design codes – audit

Generert: 2026-06-10T04:55:56.416Z

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

- eksplisitt `visual.designCode`: 378
- per kilde (alle entiteter):
  - explicit: 378
  - assetType: 0
  - category: 250
  - heuristic: 456
  - default: 187

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 122 | 0 | 124 | 251 | 4 |
| people | 118 | 0 | 126 | 174 | 8 |
| articles | 138 | 0 | 0 | 31 | 175 |

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
- articles (138):
  - `article_architecture_miniature`: 32
  - `article_place_essay_miniature`: 28
  - `article_institution_miniature`: 25
  - `article_art_miniature`: 16
  - `article_history_miniature`: 13
  - `article_sports_history_miniature`: 11
  - `article_memory_place_miniature`: 3
  - `article_political_history_miniature`: 3
  - `article_literature_miniature`: 3
  - `article_local_story_miniature`: 1
  - `article_groundhopper_miniature`: 1
  - `article_object_story_miniature`: 1
  - `article_language_miniature`: 1

## Pilot batch status

- Batch 1-baseline: 73 eksplisitte `visual.designCode`.
- Etter batch 2: 169 eksplisitte `visual.designCode`.
- Etter batch 3: 249 eksplisitte `visual.designCode`.
- Nåværende total: 378 eksplisitte `visual.designCode` (122 places, 118 people, 138 articles).
- Endring siden batch 3: 129.
- Omfang: Kontrollerte pilot-batcher for visual.designCode-dekning; nåværende total beregnes fra data.

## Topp brukte designCodes

- `article_default_miniature`: 175
- `waterfront_miniature`: 84
- `park_miniature`: 60
- `person_writer_miniature`: 46
- `person_business_miniature`: 43
- `person_historical_miniature`: 40
- `person_scientist_miniature`: 40
- `article_place_essay_miniature`: 40
- `person_activist_miniature`: 38
- `person_musician_miniature`: 36
- `article_architecture_miniature`: 32
- `museum_miniature`: 27
- `person_politician_miniature`: 27
- `apartment_block_miniature`: 26
- `article_institution_miniature`: 26

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

#### Artikler som fortsatt er `article_default_miniature` (175)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| alnaelva | alnaelva | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnaelvstien | alnaelvstien | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| loelva_historisk | loelva_historisk | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| trosterud_friomrade | trosterud_friomrade | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| furuset_haugerud_skogbelte | furuset_haugerud_skogbelte | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnabru_jernbane_og_logistikk | alnabru_jernbane_og_logistikk | — | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| gamle_trikkestallen | gamle_trikkestallen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| sofienberg_kirke | sofienberg_kirke | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| bjoelsenfossen | bjoelsenfossen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| glads_molle | glads_molle | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| voienfossen | voienfossen | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| nedre_foss | nedre_foss | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| vaterland_historisk_elvelop | vaterland_historisk_elvelop | — | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| bispelokket | bispelokket | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| ring_3 | ring_3 | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| trikk_17_18 | trikk_17_18 | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| st_hanshaugen_park | st_hanshaugen_park | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| oslo_s | oslo_s | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| vulkan_energisentral | vulkan_energisentral | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json |
| tigeren | tigeren | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| gronland_kirke | gronland_kirke | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| kampen_kirke | kampen_kirke | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| jernbanetorget | jernbanetorget | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| oslo_bussterminal | oslo_bussterminal | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| spikersuppa | spikersuppa | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| slottsparken | slottsparken | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| botsparken | botsparken | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| stensparken | stensparken | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| majorstuen_tbanestasjon | majorstuen_tbanestasjon | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| nationaltheatret_stasjon | nationaltheatret_stasjon | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| olaf_ryes_plass | olaf_ryes_plass | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| birkelunden | birkelunden | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| akerselva | akerselva | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| operahuset | operahuset | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| carl_berner_plass | carl_berner_plass | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| schous_bryggeri | schous_bryggeri | — | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| nydalsdammen | nydalsdammen | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| stilla_nydalen | stilla_nydalen | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| kuba_parken | kuba_parken | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| vulkan_industriomrade | vulkan_industriomrade | — | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |

_Viser 40 av 175. Full liste i `reports/visual-design-codes-audit.json`._

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

#### Artikler (totalt 127, viser 30)

- `article_art_miniature`:
  - [P3] Broen og skulpturrommene (`frognerparken_broen_og_skulpturrom`) — heuristisk medium-confidence treff (skulptur); bør sjekkes før eksplisitt merking
  - [P3] Frognerparken (`frognerparken_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'skulptur'
  - [P3] Banal og overdimensjonert skulpturpark (`lesespor_ekebergparken_001`) — heuristisk medium-confidence treff (skulptur); bør sjekkes før eksplisitt merking
  - [P3] – Et smykkeskrin for våre kunstskatter (`lesespor_nasjonalmuseet_001`) — heuristisk medium-confidence treff (kunst); bør sjekkes før eksplisitt merking
- `article_biography_miniature`:
  - [P3] akerselva (`akerselva`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] alnabru_jernbane_og_logistikk (`alnabru_jernbane_og_logistikk`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] ankerbrua (`ankerbrua`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] birkelunden (`birkelunden`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] bygdoy_kongeskogen (`bygdoy_kongeskogen`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] bygdoy_natur (`bygdoy_natur`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Chateau Neuf (`chateau_neuf_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Vigelandsanlegget i Frognerparken (`frognerparken_vigelandsanlegget`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] Frognerstranda som sesongbasert kjendissone (`frognerstranda_hovedartikkel`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] gamle_trikkestallen (`gamle_trikkestallen`) — default-fallback; mulig dyp-tekst treff 'liv'
  - [P3] gressholmen (`gressholmen`) — default-fallback; mulig dyp-tekst treff 'liv'
- `article_institution_miniature`:
  - [P4] botsparken (`botsparken`) — default-fallback; tydelig dyp-tekst treff 'fengsel'
  - [P4] gronland_kirke (`gronland_kirke`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene som arbeiderby og hverdagsby (`sagene_arbeiderby_boligstruktur`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene som film- og TV-miljø (`sagene_film_tv_lag`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] schous_bryggeri (`schous_bryggeri`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Schous plass (`schous_plass_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] sofienberg_kirke (`sofienberg_kirke`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] trikk_17_18 (`trikk_17_18`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
- `article_sports_history_miniature`:
  - [P4] carl_berner_plass (`carl_berner_plass`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Begreper rundt Good Game-redaksjonen (`good_game_redaksjon_begreper`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Good Game i digital offentlighet (`good_game_redaksjon_digital_offentlighet`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] jernbanetorget (`jernbanetorget`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] oslo_bussterminal (`oslo_bussterminal`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] Begreper: knutepunkt, stasjonshall og folkestrøm (`oslo_s_begreper`) — default-fallback; tydelig dyp-tekst treff 'sport'
  - [P4] tigeren (`tigeren`) — default-fallback; tydelig dyp-tekst treff 'sport'

## Article default analysis

Klassifisering av de gjenværende `article_default_miniature`. Denne
delen merker **ingen** datafiler – den forbereder en presis batch 6.

- total `article_default_miniature`: **175**
- safeBatch6Candidates: 16
- needsMetadata: 3
- needsNewDesignCode: 118
- keepDefaultForNow: 26
- manualReview: 12

### Trygge batch 6-kandidater

#### safeBatch6Candidates (16)

| id / title | suggestedDesignCode | confidence | reason | file |
| --- | --- | --- | --- | --- |
| sagene_arbeiderby_boligstruktur — Sagene som arbeiderby og hverdagsby | article_architecture_miniature | high | tydelig eksisterende fagområde (boligstruktur) → `article_architecture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| frognerparken_hovedartikkel — Frognerparken | article_art_miniature | high | tydelig eksisterende fagområde (vigelandsanlegget) → `article_art_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| frognerparken_vigelandsanlegget — Vigelandsanlegget i Frognerparken | article_art_miniature | high | tydelig eksisterende fagområde (vigelandsanlegget, skulptur, skulpturpark) → `article_art_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| gamlebyen_middelalderbyen_oslo — Middelalderbyen Oslo | article_history_miniature | high | tydelig eksisterende fagområde (middelalderby, christiania, byhistorie) → `article_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| chateau_neuf_hovedartikkel — Chateau Neuf | article_institution_miniature | high | tydelig eksisterende fagområde (studenthus, studentersamfund) → `article_institution_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| psykologisk_institutt_uio_forskning_metode — Forskning, metode og faglig vurdering | article_institution_miniature | high | tydelig eksisterende fagområde (institutt) → `article_institution_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_psykologisk_institutt_uio.json |
| gronland_kirke — Østkantskirke som kobler institusjon, lokalhistorie og byendring. | article_local_story_miniature | high | tydelig eksisterende fagområde (lokalhistorie) → `article_local_story_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| radhusplassen_begreper — Begreper: plassrom, markering og byseremoni | article_place_essay_miniature | high | tydelig eksisterende fagområde (plassrom) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| radhusplassen_fjordrom — Byrommet ved fjorden | article_place_essay_miniature | high | tydelig eksisterende fagområde (byrom, plassrom) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| radhusplassen_hovedartikkel — Rådhusplassen som popkulturelt plassrom | article_place_essay_miniature | high | tydelig eksisterende fagområde (plassrom, byrom) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| radhusplassen_offentlighet — Åpen flate og representasjonsrom | article_place_essay_miniature | high | tydelig eksisterende fagområde (representasjonsrom, byrom) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| slottsplassen_akse — Plassflate, akse og utsyn | article_place_essay_miniature | high | tydelig eksisterende fagområde (seremoniell byform, byakse) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| slottsplassen_hovedartikkel — Slottsplassen som popkulturelt representasjonsrom | article_place_essay_miniature | high | tydelig eksisterende fagområde (representasjonsrom, byakse) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| torshov_torshovparken — Torshovparken | article_place_essay_miniature | high | tydelig eksisterende fagområde (byrom) → `article_place_essay_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json |
| toyen_torg_hovedartikkel — Tøyen torg som popkulturelt byrom | article_place_essay_miniature | high | tydelig eksisterende fagområde (byrom) → `article_place_essay_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| spikersuppa — Spikersuppa er et sentralt møtepunkt på Karl Johan med tydelig sesongskifte fra oppholdsplass til skøytebane. | article_political_history_miniature | medium | tydelig eksisterende fagområde (storting) → `article_political_history_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |

### Mangler metadata

#### needsMetadata (3)

| id / title | missing | reason | file |
| --- | --- | --- | --- |
| lesespor_bjorvika_001 — Ellen de Vibe snakker ut: – Vi sviktet de rimelige boligene i Fjordbyen | summary.themes, classification.tags, popupDesc | for lite metadata til trygg designCode (category_hints: by) | data/lesespor/oslo/lesespor_oslo_by.json |
| lesespor_gronland_001 — Aktivitet skaper tryggere byer | summary.themes, classification.tags, popupDesc | for lite metadata til trygg designCode (category_hints: by) | data/lesespor/oslo/lesespor_oslo_by.json |
| lesespor_gronland_003 — Hva er god byutvikling? | summary.themes, classification.tags, popupDesc | for lite metadata til trygg designCode (category_hints: by/politikk) | data/lesespor/oslo/lesespor_oslo_by.json |

### Trenger mulig ny designCode

#### needsNewDesignCode (118)

- `article_industry_miniature` (1):
  - schous_plass_schous_bryggeri [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_industry_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json`)
- `article_media_history_miniature` (13):
  - aftenposten_akersgata_avisoffentlighet [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - aftenposten_akersgata_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - aftenposten_akersgata_geografi [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - cinemateket_oslo_kuratering_programkino [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json`)
  - dagbladet_akersgata_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - dagbladet_akersgata_kulturjournalistikk [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - dagbladet_akersgata_medieform [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - good_game_redaksjon_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json`)
  - good_game_redaksjon_spillkultur_mediefelt [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json`)
  - klassekampen_redaksjon_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - klassekampen_redaksjon_offentlighet [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - nrk_huset_marienlyst_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json`)
  - good_game_redaksjon_digital_offentlighet [medium] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_media_history_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json`)
- `article_nature_route_miniature` (79):
  - akerselva [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json`)
  - akerselva_utlop_bjorvika [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json`)
  - alna_bryn [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - alna_smalvoll [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - alnaelva [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_alna.json`)
  - alnaelvstien [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_alna.json`)
  - alnaparken [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json`)
  - alnsjoen_alna_kilde [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json`)
  - beierbrua [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - bjoelsenfossen [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json`)
  - bjoelsenparken_elvenaer [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - bogerudmyra [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch2.json`)
  - bygdoy_bygdoynes [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json`)
  - bygdoy_dronningberget [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - bygdoy_huk [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json`)
  - bygdoy_kongeskogen [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json`)
  - bygdoy_paradisbukta [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json`)
  - elvestrekning_bla_brenneriveien [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - fossveien_elvestrekning [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json`)
  - furuset_haugerud_skogbelte [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_nature_route_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_alna.json`)
  - _… 59 til i JSON._
- `article_religion_miniature` (1):
  - kampen_kirke [medium] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_religion_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json`)
- `article_transport_miniature` (21):
  - alnabru_jernbane_og_logistikk [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_alna.json`)
  - carl_berner_plass [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json`)
  - grorud_t_bane_stasjon [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json`)
  - jernbanetorget [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json`)
  - majorstuen_tbanestasjon [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json`)
  - nationaltheatret_stasjon [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json`)
  - okern_byutvikling_transformasjon [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json`)
  - okern_ring3_okernkrysset [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json`)
  - okern_t_bane_knutepunkt [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json`)
  - oslo_bussterminal [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json`)
  - oslo_s [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json`)
  - oslo_s_begreper [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json`)
  - oslo_s_hovedartikkel [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json`)
  - oslo_s_transitrom [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json`)
  - skoyen_drammensveien_e18 [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json`)
  - skoyen_naeringskorridor [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json`)
  - skoyen_stasjon [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch3.json`)
  - trikk_17_18 [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json`)
  - tullin_pilestredet_ring1 [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json`)
  - vaterland_knutepunkt [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_transport_miniature` (`data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json`)
  - _… 1 til i JSON._
- `article_urban_infrastructure_miniature` (3):
  - bispelokket [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_urban_infrastructure_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json`)
  - groruddammen [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_urban_infrastructure_miniature` (`data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json`)
  - vulkan_energisentral [high] — temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode `article_urban_infrastructure_miniature` (`data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json`)

### Bør forbli default foreløpig

#### keepDefaultForNow (26)

| id / title | reason | file |
| --- | --- | --- |
| birkelunden — Birkelunden er et grønt samlingspunkt på Grünerløkka med høy hverdagsbruk i tett byvev. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| botsparken — Botsparken er en liten nabolagspark ved Botsfengselet med stor hverdagsverdi i tett by. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| bygdoy_roykenvika — Røykensvika på Bygdøy er en fjordvik med strandkant, gruntvann og vegeterte randsoner. Vika markerer en mykere overgang mellom land og sjø. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| chateau_neuf_revy_og_studentkultur — Revy og studentkultur | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| cinemateket_oslo_filmkultur_i_oslo — Filmkultur i Oslo | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| colosseum_kino_hovedartikkel — Colosseum kino som norsk storfilmkino | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| folketeateret_hovedartikkel — Folketeateret som storskalateater for musikaler | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| frognerstranda_hovedartikkel — Frognerstranda som sesongbasert kjendissone | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| gronlandsleiret_hovedartikkel — Grønlandsleiret som sosialrealistisk filmbakteppe | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| hellerud_gard_jordbruk_byutvikling — Fra jordbruk til byutvikling | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| house_of_nerds_hovedartikkel — House of Nerds som møteplass for nerdkultur | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| kampen_park_hovedartikkel — Kampen park | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| kampen_park_parkrom_terreng — Parkrom, bakker og terreng i Kampen park | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| kampen_topografi_bratte_gater — Kampens topografi og bratte gater | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| latter_hovedartikkel — Latter som profesjonell standup-scene | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| majorstuen_krysset_hovedartikkel — Majorstuen-krysset som hverdagsspottingsone | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |
| olaf_ryes_plass — Olaf Ryes plass er Grünerløkkas nabolagstorg med sterk sosial hverdagsbruk. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| operahuset — Operahuset er både kulturinstitusjon og offentlig taklandskap i fjordbyen. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| oslo_s_sentrum_mobilitet — Porten til sentrum | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| slottsparken — Slottsparken kombinerer kongelig representasjonslandskap med åpen hverdagsbruk midt i byen. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| slottsplassen_begreper — Begreper: paradeplass, seremoni og ikon | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| slottsplassen_fotografi — Fotografi og turistblikk | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| stensparken — Stensparken er en høydepark som kombinerer utsikt, gjennomgang og nabolagsopphold mellom Bislett og St. Hanshaugen. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json |
| tigeren — Bysymbol ved Oslo S med høy synlighet i hverdagsmobiliteten. | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| toyen_torg_identitet — Tøyen-identitet i sentrumsskala | populærkulturell/blandet artikkel uten klar visuell hovedtype | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |
| toyen_torg_torgscene — Torgflaten som offentlig scene | generell artikkel uten tydelig fagområde; default beholdes | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_popkultur_sentrum_batch1.json |

### Manuell vurdering

#### manualReview (12)

| id / title | suggestedDesignCode | reason | file |
| --- | --- | --- | --- |
| kampen_film_tv_lag — Kampen som film- og TV-miljø | article_architecture_miniature | flere plausible koder med lik styrke: `article_architecture_miniature` vs `article_place_essay_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| schous_bryggeri — Schous plass er et grønt nabolagsrom i Grünerløkkas tette kvartalsstruktur. | article_architecture_miniature | flere plausible koder med lik styrke: `article_architecture_miniature` vs `article_industry_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| vaterland_sanering — Saneringen av Vaterland | article_architecture_miniature | flere plausible koder med lik styrke: `article_architecture_miniature` vs `article_place_essay_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| schous_plass_hovedartikkel — Schous plass | article_industry_miniature | flere plausible koder med lik styrke: `article_industry_miniature` vs `article_place_essay_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| psykologisk_institutt_uio_psykologi_fag — Psykologi som fag ved instituttet | article_institution_miniature | flere plausible koder med lik styrke: `article_institution_miniature` vs `article_science_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_psykologisk_institutt_uio.json |
| hellerud_gard_hovedartikkel — Hellerud gård | article_memory_place_miniature | flere plausible koder med lik styrke: `article_memory_place_miniature` vs `article_architecture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| ankerbrua — Sentral Akerselv-bro med tydelig elveromskobling. | article_nature_route_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_urban_infrastructure_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| nydalsdammen — Regulert dammiljø i Akerselva der vannstyring, byhistorie og bynatur møtes. | article_nature_route_miniature | flere plausible koder med lik styrke: `article_nature_route_miniature` vs `article_urban_infrastructure_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| sofienberg_kirke — Kirkested som speiler byvekst og lokalsamfunn i indre øst. | article_religion_miniature | flere plausible koder med lik styrke: `article_religion_miniature` vs `article_local_story_miniature` | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| gamle_trikkestallen — Tidlig trikkedriftsanlegg med transport- og arbeidshistorisk verdi. | article_transport_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_industry_miniature` | data/leksikon/places/oslo/historie/leksikon_oslo_historie.json |
| vaterland_hovedartikkel — Vaterland | article_transport_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| vaterland_populaerkultur_hovedartikkel — Vaterland som filmkulisse for krim og TV-drama | article_transport_miniature | flere plausible koder med lik styrke: `article_transport_miniature` vs `article_nature_route_miniature` | data/leksikon/places/oslo/populaerkultur/leksikon_oslo_populaerkultur_sentrum.json |

## Forslag til Article batch 6

Anbefalt omfang: **50–90** artikler.
Prioritert rekkefølge:
1. safe high-confidence article defaults
1. unused/underused existing article designCodes
1. manual review after human check

Kun trygge kandidater (high/medium-confidence). `needsMetadata` og
`needsNewDesignCode` tas **ikke** med som direkte batchkandidater.

Topp 16 av 16, gruppert etter `suggestedDesignCode`:

- `article_architecture_miniature` (1):
  - sagene_arbeiderby_boligstruktur [high] — tydelig eksisterende fagområde (boligstruktur) → `article_architecture_miniature`
- `article_art_miniature` (2):
  - frognerparken_hovedartikkel [high] — tydelig eksisterende fagområde (vigelandsanlegget) → `article_art_miniature`
  - frognerparken_vigelandsanlegget [high] — tydelig eksisterende fagområde (vigelandsanlegget, skulptur, skulpturpark) → `article_art_miniature`
- `article_history_miniature` (1):
  - gamlebyen_middelalderbyen_oslo [high] — tydelig eksisterende fagområde (middelalderby, christiania, byhistorie) → `article_history_miniature`
- `article_institution_miniature` (2):
  - chateau_neuf_hovedartikkel [high] — tydelig eksisterende fagområde (studenthus, studentersamfund) → `article_institution_miniature`
  - psykologisk_institutt_uio_forskning_metode [high] — tydelig eksisterende fagområde (institutt) → `article_institution_miniature`
- `article_local_story_miniature` (1):
  - gronland_kirke [high] — tydelig eksisterende fagområde (lokalhistorie) → `article_local_story_miniature`
- `article_place_essay_miniature` (8):
  - radhusplassen_begreper [high] — tydelig eksisterende fagområde (plassrom) → `article_place_essay_miniature`
  - radhusplassen_fjordrom [high] — tydelig eksisterende fagområde (byrom, plassrom) → `article_place_essay_miniature`
  - radhusplassen_hovedartikkel [high] — tydelig eksisterende fagområde (plassrom, byrom) → `article_place_essay_miniature`
  - radhusplassen_offentlighet [high] — tydelig eksisterende fagområde (representasjonsrom, byrom) → `article_place_essay_miniature`
  - slottsplassen_akse [high] — tydelig eksisterende fagområde (seremoniell byform, byakse) → `article_place_essay_miniature`
  - slottsplassen_hovedartikkel [high] — tydelig eksisterende fagområde (representasjonsrom, byakse) → `article_place_essay_miniature`
  - torshov_torshovparken [high] — tydelig eksisterende fagområde (byrom) → `article_place_essay_miniature`
  - toyen_torg_hovedartikkel [high] — tydelig eksisterende fagområde (byrom) → `article_place_essay_miniature`
- `article_political_history_miniature` (1):
  - spikersuppa [medium] — tydelig eksisterende fagområde (storting) → `article_political_history_miniature`

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
