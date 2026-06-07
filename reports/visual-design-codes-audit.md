# Visual design codes – audit

Generert: 2026-06-07T12:55:51.582Z

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
  - category: 244
  - heuristic: 496
  - default: 270

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 98 | 0 | 118 | 267 | 6 |
| people | 88 | 0 | 126 | 198 | 14 |
| articles | 63 | 0 | 0 | 31 | 250 |

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

## Pilot batch status

- Batch 1-baseline: 73 eksplisitte `visual.designCode`.
- Etter batch 2: 169 eksplisitte `visual.designCode`.
- Etter batch 3: 249 eksplisitte `visual.designCode`.
- Nåværende total: 249 eksplisitte `visual.designCode` (98 places, 88 people, 63 articles).
- Endring siden batch 3: 0.
- Omfang: Kontrollerte pilot-batcher for visual.designCode-dekning; nåværende total beregnes fra data.

## Topp brukte designCodes

- `article_default_miniature`: 250
- `waterfront_miniature`: 84
- `park_miniature`: 59
- `person_writer_miniature`: 45
- `person_historical_miniature`: 40
- `person_scientist_miniature`: 40
- `person_activist_miniature`: 38
- `person_business_miniature`: 37
- `person_musician_miniature`: 36
- `museum_miniature`: 27
- `person_politician_miniature`: 27
- `apartment_block_miniature`: 26
- `person_artist_miniature`: 26
- `commerce_miniature`: 24
- `university_miniature`: 24

## Default-kandidater for neste batch

Entiteter som fortsatt løses via default-fallback. Dette er den neste
ryddelisten – kandidater som kan vurderes for eksplisitt designCode.

#### Places som fortsatt er `default_miniature` (6)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| eidsvollsbygningen | Eidsvollsbygningen | historie | data/places/historie/oslo/places_historie.json |
| villa_grande | Villa Grande | historie | data/places/historie/oslo/places_historie.json |
| gamle_radhus | Gamle rådhus | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| galgeberg | Galgeberg | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| oslo_hospital | Oslo hospital | historie | data/places/historie/oslo/places_historie_added_batch_01.json |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json |

#### People som fortsatt er `person_default_miniature` (14)

| id | navn/tittel | kategori | fil |
| --- | --- | --- | --- |
| kong_christian_iv | Kong Christian IV | by | data/people/by/oslo/people_by_oslo.json |
| fritz_heinrich_frolich | Fritz Heinrich Frølich | by | data/people/by/oslo/people_by_oslo.json |
| gunnar_jahn_statistikk_og_styring | Gunnar Jahn | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| anton_martin_schweigaard_okonomi | Anton Martin Schweigaard | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| sam_eyde_industriutbygger | Sam Eyde | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| kristian_birkeland_teknologi_og_industri | Kristian Birkeland | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| christen_smith_schous_bryggeri | Christen Smith | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| ellef_ringnes_bryggeri_og_ledelse | Ellef Ringnes | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| christian_schweigaard_post_og_administrasjon | Christian Schweigaard | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| alf_bjercke_industri_og_kvalitet | Alf Bjercke | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| amund_ringnes_bryggeri | Amund Ringnes | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| herman_schou_bryggeri | Herman Schou | naeringsliv | data/people/naeringsliv/oslo/people_naeringsliv_oslo.json |
| eckbos_legat | Eckbos Legat | by | data/people/filantroper/oslo/people_filantroper_oslo.json |
| gjensidigestiftelsen | Gjensidigestiftelsen | by | data/people/filantroper/oslo/people_filantroper_oslo.json |

#### Artikler som fortsatt er `article_default_miniature` (250)

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

_Viser 40 av 250. Full liste i `reports/visual-design-codes-audit.json`._

## Heuristiske kandidater for eksplisitt designCode

Entiteter uten eksplisitt kode, men der resolveren gir en konkret kode via
heuristikk. High-confidence treff er trygge kandidater for eksplisitt merking.

### Places

- totalt: 267 (high 85, medium 177, low 5)

#### Topp high-confidence (85)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| tigeren | Tigerstatuen | monument_miniature | keyword: statue |
| gamlebyen_gravlund | Gamlebyen gravlund | cemetery_miniature | keyword: gravlund |
| var_frelsers_gravlund | Vår Frelsers gravlund | cemetery_miniature | keyword: gravlund |
| grini_fangeleir | Grini fangeleir | prison_miniature | keyword: fangeleir |
| bogstad_gard | Bogstad gård | farm_estate_miniature | keyword: gard |
| mollergata_19 | Møllergata 19 | prison_miniature | keyword: fengsel |
| oslo_ladegard | Oslo ladegård | farm_estate_miniature | keyword: gard |
| botsfengselet | Botsfengselet | prison_miniature | keyword: botsfengsel |
| camilla_collett_statue | Camilla Collett-statuen | monument_miniature | keyword: statue |
| henrik_wergeland_statue | Henrik Wergeland-statuen | monument_miniature | keyword: statue |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | church_miniature | keyword: kirke |
| norli_universitetsgata | Norli Universitetsgata | university_miniature | keyword: universitet |
| sigrid_undset_statue | Sigrid Undset-statuen | monument_miniature | keyword: statue |
| ruth_maier_minne | Ruth Maier-minnesmerke | monument_miniature | keyword: minnesmerke |
| alf_proysen_statue_nittedal | Alf Prøysen-statuen – Nittedal kulturhus | monument_miniature | keyword: statue |
| oscar_braaten_statuen | Oscar Braaten-statuen | monument_miniature | keyword: statue |
| fornebu_teknologipark | Fornebu Teknologipark | park_miniature | keyword: park |
| ulven_handelspark | Ulven handelspark | park_miniature | keyword: park |
| akershus_slott_bakeriet | Bakeriet ved Akershus | palace_miniature | keyword: slott |
| hellerud_gard | Hellerud gård | farm_estate_miniature | keyword: gard |
| voien_gard_voienvolden | Vøien gård / Vøienvolden | farm_estate_miniature | keyword: gard |
| bygdoy_kongsgard_salamanderdam | Bygdøy Kongsgård salamanderdam | farm_estate_miniature | keyword: gard |
| slottsplassen | Slottsplassen | palace_miniature | keyword: slott |
| aktivitet_rudolf_nilsens_plass | Rudolf Nilsens plass aktivitetspark | park_miniature | keyword: park |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | park_miniature | keyword: park |
| treningssted_kampen_park | Kampen park treningssted | park_miniature | keyword: park |
| gardermoen_raceway | Gardermoen Raceway | farm_estate_miniature | keyword: gard |
| gardermoen_motorpark | Gardermoen Motorpark | farm_estate_miniature | keyword: gard |
| grunerlokka_bakgardsvegger | Grünerløkka bakgårdsvegger | farm_estate_miniature | keyword: gard |
| abelhaugen | Abelhaugen | monument_miniature | keyword: monument |

_Viser 30 av 85. Full liste i `reports/visual-design-codes-audit.json`._

### People

- totalt: 198 (high 54, medium 144, low 0)

#### Topp high-confidence (54)

| id | navn/tittel | resolvedCode | reason |
| --- | --- | --- | --- |
| christian_heinrich_grosch | Christian Heinrich Grosch | person_architect_miniature | keyword: arkitekt |
| harald_hals | Harald Hals | person_urban_planner_miniature | keyword: byplanlegger |
| arne_korsmo | Arne Korsmo | person_architect_miniature | keyword: arkitekt |
| arnstein_arneberg | Arnstein Arneberg | person_architect_miniature | keyword: arkitekt |
| magnus_poulsson | Magnus Poulsson | person_architect_miniature | keyword: arkitekt |
| henrik_bull | Henrik Bull | person_architect_miniature | keyword: arkitekt |
| erling_viksjo | Erling Viksjø | person_architect_miniature | keyword: arkitekt |
| sverre_fehn | Sverre Fehn | person_architect_miniature | keyword: arkitekt |
| ove_bang | Ove Bang | person_architect_miniature | keyword: arkitekt |
| harald_aars | Harald Aars | person_architect_miniature | keyword: arkitekt |
| kirsten_sand | Kirsten Sand | person_architect_miniature | keyword: arkitekt |
| sverre_pedersen | Sverre Pedersen | person_urban_planner_miniature | keyword: byplanlegger |
| christian_norberg_schulz | Christian Norberg-Schulz | person_architect_miniature | keyword: arkitekt |
| thomas_thiis_evensen | Thomas Thiis-Evensen | person_architect_miniature | keyword: arkitekt |
| geir_grung | Geir Grung | person_architect_miniature | keyword: arkitekt |
| christian_krohg | Christian Krohg | person_writer_miniature | keyword: forfatter |
| aasta_hansteen | Aasta Hansteen | person_writer_miniature | keyword: forfatter |
| alexis_de_chateauneuf | Alexis de Chateauneuf | person_architect_miniature | keyword: arkitekt |
| wilhelm_von_hanno | Wilhelm von Hanno | person_architect_miniature | keyword: arkitekt |
| petter_moen | Petter Moen | person_writer_miniature | keyword: forfatter |
| peder_clausson_friis | Peder Claussøn Friis | person_writer_miniature | keyword: forfatter |
| cecilie_enger | Cecilie Enger | person_writer_miniature | keyword: forfatter |
| tor_age_bringsvaerd | Tor Åge Bringsværd | person_writer_miniature | keyword: forfatter |
| helene_uri | Helene Uri | person_writer_miniature | keyword: forfatter |
| ingvar_ambjornsen | Ingvar Ambjørnsen | person_writer_miniature | keyword: forfatter |
| krag | Vilhelm Krag | person_writer_miniature | keyword: forfatter |
| fernando_pessoa | Fernando Pessoa | person_writer_miniature | keyword: forfatter |
| joao_luis_carrilho_da_graca | João Luís Carrilho da Graça | person_architect_miniature | keyword: arkitekt |
| manuel_tainha | Manuel Tainha | person_architect_miniature | keyword: arkitekt |
| eduardo_souto_de_moura | Eduardo Souto de Moura | person_architect_miniature | keyword: arkitekt |

_Viser 30 av 54. Full liste i `reports/visual-design-codes-audit.json`._

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

### `opera_miniature`

- family: culture
- entityTypes: place
- søkeord: `opera`, `operahuset`, `performing arts`, `teater`
- anbefalt: Vurder operabygg og store scenekunsthus for eksplisitt opera_miniature.

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

#### Review candidates (15)

| id | navn/tittel | currentDesignCode | reason |
| --- | --- | --- | --- |
| slottsparken | Slottsparken | park_miniature | Navn/id antyder slott/palass, men koden er 'park_miniature' (vurder palace_miniature). |
| operahuset | Operahuset | theatre_miniature | Navn/id antyder opera, men koden er 'theatre_miniature' (vurder opera_miniature). |
| slottet | Det kongelige slott | civic_miniature | Navn/id antyder slott/palass, men koden er 'civic_miniature' (vurder palace_miniature). |
| akerhus_slott | Akerhus Slott | fortress_miniature | Navn/id antyder slott/palass, men koden er 'fortress_miniature' (vurder palace_miniature). |
| carl_berner | Carl Berner | person_politician_miniature | Byplanlegging/urbanisme antydes, men koden er 'person_politician_miniature' (vurder person_urban_planner_miniature). |
| peder_anker | Peder Anker | person_politician_miniature | Næringsliv/handel antydes, men koden er 'person_politician_miniature' (vurder person_business_miniature). |
| ronny_deila | Ronny Deila | person_footballer_miniature | Tags/desc antyder trener/coach, men koden er 'person_footballer_miniature' (vurder person_coach_miniature). |
| sonja_henie | Sonja Henie | person_athlete_miniature | Skøyte/skøyteløper antydes, men koden er 'person_athlete_miniature' (vurder person_skater_miniature). |
| oscar_mathisen | Oscar Mathisen | person_athlete_miniature | Skøyte/skøyteløper antydes, men koden er 'person_athlete_miniature' (vurder person_skater_miniature). |
| hjalmar_andersen | Hjalmar Andersen | person_athlete_miniature | Skøyte/skøyteløper antydes, men koden er 'person_athlete_miniature' (vurder person_skater_miniature). |
| johann_olav_koss | Johann Olav Koss | person_athlete_miniature | Skøyte/skøyteløper antydes, men koden er 'person_athlete_miniature' (vurder person_skater_miniature). |
| ole_gunnar_solskjaer | Ole Gunnar Solskjær | person_footballer_miniature | Tags/desc antyder trener/coach, men koden er 'person_footballer_miniature' (vurder person_coach_miniature). |
| var_frelsers_gravlund | var_frelsers_gravlund | article_history_miniature | Tittel/id antyder minne-/gravlundssted, men koden er 'article_history_miniature' (vurder article_memory_place_miniature). |
| grini_fangeleir | grini_fangeleir | article_history_miniature | Tittel/id antyder minne-/gravlundssted, men koden er 'article_history_miniature' (vurder article_memory_place_miniature). |
| gamlebyen_oslo_hospital | Oslo hospital | article_architecture_miniature | Tittel/id antyder institusjon, men koden er 'article_architecture_miniature' (vurder article_institution_miniature). |

## Forslag til Pilot batch 3

Prioritert liste (P5 = åpenbar og viktig, P3 = sannsynlig, bør sjekkes).
Lavere prioritet (P1–P2) finnes kun i JSON-rapporten.

#### Places (totalt 267, viser 20)

- `cemetery_miniature`:
  - [P5] Gamlebyen gravlund (`gamlebyen_gravlund`) — heuristisk high-confidence treff (gravlund); gjør eksplisitt for stabil visuell identitet
  - [P5] Vår Frelsers gravlund (`var_frelsers_gravlund`) — heuristisk high-confidence treff (gravlund); gjør eksplisitt for stabil visuell identitet
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
  - [P5] Bogstad gård (`bogstad_gard`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Bygdøy Kongsgård salamanderdam (`bygdoy_kongsgard_salamanderdam`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Gardermoen Motorpark (`gardermoen_motorpark`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Gardermoen Raceway (`gardermoen_raceway`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Grünerløkka bakgårdsvegger (`grunerlokka_bakgardsvegger`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Hellerud gård (`hellerud_gard`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Oslo ladegård (`oslo_ladegard`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
  - [P5] Vøien gård / Vøienvolden (`voien_gard_voienvolden`) — heuristisk high-confidence treff (gard); gjør eksplisitt for stabil visuell identitet
- `library_miniature`:
  - [P5] Grémio Literário (`lisbon_gremio_literario`) — heuristisk high-confidence treff (bibliotek); gjør eksplisitt for stabil visuell identitet

#### People (totalt 210, viser 20)

- `person_architect_miniature`:
  - [P5] Alexis de Chateauneuf (`alexis_de_chateauneuf`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Arne Korsmo (`arne_korsmo`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Arnstein Arneberg (`arnstein_arneberg`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Christian Heinrich Grosch (`christian_heinrich_grosch`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Christian Norberg-Schulz (`christian_norberg_schulz`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Eduardo Souto de Moura (`eduardo_souto_de_moura`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Erling Viksjø (`erling_viksjo`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Francisco Caldeira Cabral (`francisco_caldeira_cabral`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Geir Grung (`geir_grung`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Gonçalo Ribeiro Telles (`goncalo_ribeiro_telles`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Harald Aars (`harald_aars`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Henrik Bull (`henrik_bull`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] João Luís Carrilho da Graça (`joao_luis_carrilho_da_graca`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Kirsten Sand (`kirsten_sand`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Magnus Poulsson (`magnus_poulsson`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Manuel Tainha (`manuel_tainha`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Ove Bang (`ove_bang`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Sverre Fehn (`sverre_fehn`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Thomas Thiis-Evensen (`thomas_thiis_evensen`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet
  - [P5] Wilhelm von Hanno (`wilhelm_von_hanno`) — heuristisk high-confidence treff (arkitekt); gjør eksplisitt for stabil visuell identitet

#### Artikler (totalt 190, viser 30)

- `article_institution_miniature`:
  - [P4] Aftenposten i Akersgata (`aftenposten_akersgata_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] bankplassen (`bankplassen`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] botsparken (`botsparken`) — default-fallback; tydelig dyp-tekst treff 'fengsel'
  - [P4] Film som arkiv (`cinemateket_oslo_film_som_arkiv`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Cinemateket i Oslo (`cinemateket_oslo_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Norsk filminstitutt og cinematek-funksjonen (`cinemateket_oslo_norsk_filminstitutt`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] deichman_bjorvika (`deichman_bjorvika`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] ekebergparken (`ekebergparken`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] gronland_kirke (`gronland_kirke`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Kampen (`kampen_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Trehusmiljøet på Kampen (`kampen_trehusmiljo_smahus`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_centro_cultural_de_belem (`lisbon_centro_cultural_de_belem`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_culturgest (`lisbon_culturgest`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] lisbon_fundacao_calouste_gulbenkian (`lisbon_fundacao_calouste_gulbenkian`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
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
  - [P4] Allmennkringkasting på Marienlyst (`nrk_huset_marienlyst_allmennkringkasting`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] NRK-huset på Marienlyst (`nrk_huset_marienlyst_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene som arbeiderby og hverdagsby (`sagene_arbeiderby_boligstruktur`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene som film- og TV-miljø (`sagene_film_tv_lag`) — default-fallback; tydelig dyp-tekst treff 'institusjon'
  - [P4] Sagene (`sagene_hovedartikkel`) — default-fallback; tydelig dyp-tekst treff 'institusjon'

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
