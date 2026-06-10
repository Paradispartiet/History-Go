# Visual design codes – audit

Generert: 2026-06-10T21:21:49.128Z

> Denne rapporten viser ikke bare dekning, men også konkrete kandidater for
> neste batch. Full, uavkortet liste finnes alltid i
> [`reports/visual-design-codes-audit.json`](visual-design-codes-audit.json).

## Register

- designCodes totalt: **81**
- per entityType:
  - place: 31
  - person: 23
  - article: 27
  - story: 27
  - leksikon: 27
  - lesespor: 27

## Data funnet

- places: 440
- people: 426
- leksikon: 335
- lesespor: 9
- artikler totalt (leksikon + lesespor): 344

## Resolusjon

- eksplisitt `visual.designCode`: 365
- per kilde (alle entiteter):
  - explicit: 365
  - assetType: 0
  - category: 233
  - heuristic: 425
  - default: 187

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 109 | 0 | 107 | 220 | 4 |
| people | 118 | 0 | 126 | 174 | 8 |
| articles | 138 | 0 | 0 | 31 | 175 |

## Eksplisitt pilot-merkede designCodes

- places (109):
  - `park_miniature`: 11
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
  - `cemetery_miniature`: 3
  - `prison_miniature`: 3
  - `fortress_miniature`: 2
  - `commerce_miniature`: 1
  - `stadium_miniature`: 1
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
- Nåværende total: 365 eksplisitte `visual.designCode` (109 places, 118 people, 138 articles).
- Endring siden batch 3: 116.
- Omfang: Kontrollerte pilot-batcher for visual.designCode-dekning; nåværende total beregnes fra data.

## Topp brukte designCodes

- `article_default_miniature`: 175
- `waterfront_miniature`: 82
- `park_miniature`: 51
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

- totalt: 220 (high 57, medium 158, low 5)

#### Topp high-confidence (57)

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
| lisbon_praca_dos_restauradores | Praça dos Restauradores | monument_miniature | keyword: monument |
| lisbon_praca_marques_de_pombal | Praça Marquês de Pombal | monument_miniature | keyword: monument |
| lisbon_museu_nacional_do_azulejo | Museu Nacional do Azulejo | museum_miniature | keyword: museum |
| lisbon_fundacao_calouste_gulbenkian | Fundação Calouste Gulbenkian | museum_miniature | keyword: museum |
| lisbon_maat | MAAT / Tejo-kraftstasjonen | museum_miniature | keyword: museum |

_Viser 30 av 57. Full liste i `reports/visual-design-codes-audit.json`._

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

### `sports_field_miniature`

- family: sport
- entityTypes: place
- søkeord: `place`, `sport`, `field`, `outdoor`
- anbefalt: Ingen entiteter løser til denne koden i dag. Vurder om noen entiteter bør merkes eksplisitt, eller om koden kan utgå.

### `gallery_miniature`

- family: culture
- entityTypes: place
- søkeord: `galleri`, `gallery`, `kunsthall`, `utstilling`
- anbefalt: Vurder places med galleri/kunsthall som i dag løses som museum_miniature eller default.

### `playground_miniature`

- family: nature
- entityTypes: place
- søkeord: `place`, `nature`, `playground`, `outdoor`
- anbefalt: Ingen entiteter løser til denne koden i dag. Vurder om noen entiteter bør merkes eksplisitt, eller om koden kan utgå.

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

### `article_nature_route_miniature`

- family: nature
- entityTypes: article, story, leksikon, lesespor
- søkeord: `elv`, `elveløp`, `natursti`, `turvei`, `grøntdrag`, `vassdrag`, `bekk`, `naturkorridor`
- anbefalt: Vurder naturstier, elver/bekker, vann, grøntdrag, turveier og natur-/elveforløp for eksplisitt article_nature_route_miniature (jf. articleBatch6Plan).

### `article_media_history_miniature`

- family: media
- entityTypes: article, story, leksikon, lesespor
- søkeord: `redaksjon`, `avis`, `journalistikk`, `nrk`, `kringkasting`, `mediehus`, `offentlighet`
- anbefalt: Vurder avisredaksjoner, NRK/mediehus, pressehistorie og medieoffentlighet for eksplisitt article_media_history_miniature (jf. articleBatch6Plan).

### `article_transport_miniature`

- family: transport
- entityTypes: article, story, leksikon, lesespor
- søkeord: `trikk`, `t-bane`, `tog`, `buss`, `stasjon`, `knutepunkt`, `kollektiv`, `terminal`
- anbefalt: Vurder trikk/t-bane/tog/buss, stasjoner, knutepunkt og kollektivsystem for eksplisitt article_transport_miniature (jf. articleBatch6Plan).

### `article_urban_infrastructure_miniature`

- family: urbanism
- entityTypes: article, story, leksikon, lesespor
- søkeord: `bro`, `bru`, `tunnel`, `akvedukt`, `vannforsyning`, `infrastruktur`, `kraft`
- anbefalt: Vurder veier, bruer, tunneler, vannforsyning, kraft og teknisk infrastruktur for eksplisitt article_urban_infrastructure_miniature (jf. articleBatch6Plan).

### `article_industry_miniature`

- family: industry
- entityTypes: article, story, leksikon, lesespor
- søkeord: `bryggeri`, `fabrikk`, `verksted`, `industri`, `produksjon`
- anbefalt: Vurder bryggeri, fabrikk, verksted, produksjon og industrihistorie for eksplisitt article_industry_miniature (jf. articleBatch6Plan).

### `article_religion_miniature`

- family: religion
- entityTypes: article, story, leksikon, lesespor
- søkeord: `kirke`, `menighet`, `trosliv`, `religion`, `kloster`, `moske`, `synagoge`
- anbefalt: Vurder kirkerom, menighet, trosliv og kirkehistorie (religion mer enn bygning) for eksplisitt article_religion_miniature (jf. articleBatch6Plan).

### `article_science_history_miniature`

- family: science
- entityTypes: article, story, leksikon, lesespor
- søkeord: `forskning`, `vitenskap`, `laboratorium`, `institutt`, `metode`, `fagfelt`
- anbefalt: Vurder forskning, vitenskapshistorie, fagmiljøer og laboratorier for eksplisitt article_science_history_miniature (jf. articleBatch6Plan).

### `article_food_market_miniature`

- family: food_market
- entityTypes: article, story, leksikon, lesespor
- søkeord: `matmarked`, `torghandel`, `mathall`, `markedshall`, `matkultur`, `servering`
- anbefalt: Vurder matmarked, torghandel, mathall, serverings- og matkultur for eksplisitt article_food_market_miniature (jf. articleBatch6Plan).

### `article_childhood_play_miniature`

- family: childhood
- entityTypes: article, story, leksikon, lesespor
- søkeord: `lekeplass`, `barndom`, `lek`, `barn`, `skolegård`, `aktivitet`
- anbefalt: Vurder lekeplasser, barndom/lek og barns bruk av sted for eksplisitt article_childhood_play_miniature (jf. articleBatch6Plan).

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

#### Places (totalt 218, viser 20)

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
  - [P5] Praça Marquês de Pombal (`lisbon_praca_marques_de_pombal`) — heuristisk high-confidence treff (monument); gjør eksplisitt for stabil visuell identitet
- `museum_miniature`:
  - [P5] Banco de Portugal / Museu do Dinheiro (`lisbon_banco_de_portugal_museu_do_dinheiro`) — heuristisk high-confidence treff (museum); gjør eksplisitt for stabil visuell identitet

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

#### Artikler (totalt 167, viser 30)

- `article_childhood_play_miniature`:
  - [P5] Grøntstruktur i Kampen park (`kampen_park_grontstruktur`) — default-fallback; dyp-tekst treff 'lekeplass' dekker ubrukt kode article_childhood_play_miniature
  - [P5] Kampen park (`kampen_park_hovedartikkel`) — default-fallback; dyp-tekst treff 'lekeplass' dekker ubrukt kode article_childhood_play_miniature
  - [P5] Parkrom, bakker og terreng i Kampen park (`kampen_park_parkrom_terreng`) — default-fallback; dyp-tekst treff 'lekeplass' dekker ubrukt kode article_childhood_play_miniature
- `article_industry_miniature`:
  - [P5] schous_bryggeri (`schous_bryggeri`) — default-fallback; dyp-tekst treff 'bryggeri' dekker ubrukt kode article_industry_miniature
- `article_media_history_miniature`:
  - [P5] Avisoffentlighet fra Aftenposten-redaksjonen (`aftenposten_akersgata_avisoffentlighet`) — default-fallback; dyp-tekst treff 'redaksjon' dekker ubrukt kode article_media_history_miniature
  - [P5] Redaksjonell makt og geografi i Akersgata (`aftenposten_akersgata_geografi`) — default-fallback; dyp-tekst treff 'redaksjon' dekker ubrukt kode article_media_history_miniature
  - [P5] bygdoy_huk (`bygdoy_huk`) — default-fallback; dyp-tekst treff 'presse' dekker ubrukt kode article_media_history_miniature
  - [P5] Filmkultur i Oslo (`cinemateket_oslo_filmkultur_i_oslo`) — default-fallback; dyp-tekst treff 'programkino' dekker ubrukt kode article_media_history_miniature
  - [P5] Kuratering og programkino (`cinemateket_oslo_kuratering_programkino`) — default-fallback; dyp-tekst treff 'programkino' dekker ubrukt kode article_media_history_miniature
  - [P5] Begreper rundt Dagbladet i Akersgata (`dagbladet_akersgata_begreper`) — default-fallback; dyp-tekst treff 'avishus' dekker ubrukt kode article_media_history_miniature
  - [P5] Kulturjournalistikk fra Dagbladet-redaksjonen (`dagbladet_akersgata_kulturjournalistikk`) — default-fallback; dyp-tekst treff 'journalistikk' dekker ubrukt kode article_media_history_miniature
  - [P5] elvestrekning_bla_brenneriveien (`elvestrekning_bla_brenneriveien`) — default-fallback; dyp-tekst treff 'presse' dekker ubrukt kode article_media_history_miniature
  - [P5] Good Game i digital offentlighet (`good_game_redaksjon_digital_offentlighet`) — default-fallback; dyp-tekst treff 'redaksjon' dekker ubrukt kode article_media_history_miniature
  - [P5] Spillkultur som mediefelt i Good Game (`good_game_redaksjon_spillkultur_mediefelt`) — default-fallback; dyp-tekst treff 'mediefelt' dekker ubrukt kode article_media_history_miniature
  - [P5] Klassekampen i politisk og kulturell offentlighet (`klassekampen_redaksjon_offentlighet`) — default-fallback; dyp-tekst treff 'redaksjon' dekker ubrukt kode article_media_history_miniature
  - [P5] ljanselva_ljan (`ljanselva_ljan`) — default-fallback; dyp-tekst treff 'presse' dekker ubrukt kode article_media_history_miniature
  - [P5] myralokka (`myralokka`) — default-fallback; dyp-tekst treff 'presse' dekker ubrukt kode article_media_history_miniature
  - [P5] Begreper rundt NRK-huset på Marienlyst (`nrk_huset_marienlyst_begreper`) — default-fallback; dyp-tekst treff 'nrk' dekker ubrukt kode article_media_history_miniature
- `article_nature_route_miniature`:
  - [P5] akerselva_utlop_bjorvika (`akerselva_utlop_bjorvika`) — default-fallback; dyp-tekst treff 'elva' dekker ubrukt kode article_nature_route_miniature
  - [P5] alna_bryn (`alna_bryn`) — default-fallback; dyp-tekst treff 'elve' dekker ubrukt kode article_nature_route_miniature
  - [P5] alna_smalvoll (`alna_smalvoll`) — default-fallback; dyp-tekst treff 'elve' dekker ubrukt kode article_nature_route_miniature
  - [P5] alna_utlop_bjorvika (`alna_utlop_bjorvika`) — default-fallback; dyp-tekst treff 'elv' dekker ubrukt kode article_nature_route_miniature
  - [P5] alnaelva (`alnaelva`) — default-fallback; dyp-tekst treff 'elva' dekker ubrukt kode article_nature_route_miniature
  - [P5] alnaelvstien (`alnaelvstien`) — default-fallback; dyp-tekst treff 'elva' dekker ubrukt kode article_nature_route_miniature
  - [P5] alnaparken (`alnaparken`) — default-fallback; dyp-tekst treff 'grøntdrag' dekker ubrukt kode article_nature_route_miniature
  - [P5] alnsjoen_alna_kilde (`alnsjoen_alna_kilde`) — default-fallback; dyp-tekst treff 'vassdrag' dekker ubrukt kode article_nature_route_miniature
  - [P5] beierbrua (`beierbrua`) — default-fallback; dyp-tekst treff 'elva' dekker ubrukt kode article_nature_route_miniature
  - [P5] bjoelsenfossen (`bjoelsenfossen`) — default-fallback; dyp-tekst treff 'elva' dekker ubrukt kode article_nature_route_miniature
  - [P5] bjoelsenparken_elvenaer (`bjoelsenparken_elvenaer`) — default-fallback; dyp-tekst treff 'elve' dekker ubrukt kode article_nature_route_miniature
  - [P5] fossveien_elvestrekning (`fossveien_elvestrekning`) — default-fallback; dyp-tekst treff 'elve' dekker ubrukt kode article_nature_route_miniature

## Article default analysis

Klassifisering av de gjenværende `article_default_miniature`. Denne
delen merker **ingen** datafiler – den forbereder en presis batch 6.

- total `article_default_miniature`: **175**
- safeBatch6Candidates: 134
- needsMetadata: 3
- needsNewDesignCode: 0
- keepDefaultForNow: 26
- manualReview: 12

### Trygge batch 6-kandidater

#### safeBatch6Candidates (134)

| id / title | suggestedDesignCode | confidence | reason | file |
| --- | --- | --- | --- | --- |
| sagene_arbeiderby_boligstruktur — Sagene som arbeiderby og hverdagsby | article_architecture_miniature | high | tydelig eksisterende fagområde (boligstruktur) → `article_architecture_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_sagene_kampen.json |
| frognerparken_hovedartikkel — Frognerparken | article_art_miniature | high | tydelig eksisterende fagområde (vigelandsanlegget) → `article_art_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| frognerparken_vigelandsanlegget — Vigelandsanlegget i Frognerparken | article_art_miniature | high | tydelig eksisterende fagområde (vigelandsanlegget, skulptur, skulpturpark) → `article_art_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| gamlebyen_middelalderbyen_oslo — Middelalderbyen Oslo | article_history_miniature | high | tydelig eksisterende fagområde (middelalderby, christiania, byhistorie) → `article_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| schous_plass_schous_bryggeri — Schous bryggeri | article_industry_miniature | high | tydelig eksisterende fagområde (bryggeri, industrihistorie) → `article_industry_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json |
| chateau_neuf_hovedartikkel — Chateau Neuf | article_institution_miniature | high | tydelig eksisterende fagområde (studenthus, studentersamfund) → `article_institution_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| psykologisk_institutt_uio_forskning_metode — Forskning, metode og faglig vurdering | article_institution_miniature | high | tydelig eksisterende fagområde (institutt) → `article_institution_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_psykologisk_institutt_uio.json |
| gronland_kirke — Østkantskirke som kobler institusjon, lokalhistorie og byendring. | article_local_story_miniature | high | tydelig eksisterende fagområde (lokalhistorie) → `article_local_story_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json |
| aftenposten_akersgata_avisoffentlighet — Avisoffentlighet fra Aftenposten-redaksjonen | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon, lederartikkel, dagsorden) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| aftenposten_akersgata_begreper — Begreper rundt Aftenposten i Akersgata | article_media_history_miniature | high | tydelig eksisterende fagområde (avishus, lederartikkel, dagsorden, presse) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| aftenposten_akersgata_geografi — Redaksjonell makt og geografi i Akersgata | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon, avishus, presse) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| cinemateket_oslo_kuratering_programkino — Kuratering og programkino | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch1.json |
| dagbladet_akersgata_begreper — Begreper rundt Dagbladet i Akersgata | article_media_history_miniature | high | tydelig eksisterende fagområde (tabloid, avishus, redaksjon) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| dagbladet_akersgata_kulturjournalistikk — Kulturjournalistikk fra Dagbladet-redaksjonen | article_media_history_miniature | high | tydelig eksisterende fagområde (kulturjournalistikk, redaksjon) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| dagbladet_akersgata_medieform — Forside, overskrift og medieform | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon, tabloid) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| good_game_redaksjon_begreper — Begreper rundt Good Game-redaksjonen | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| good_game_redaksjon_spillkultur_mediefelt — Spillkultur som mediefelt i Good Game | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon, mediefelt) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_kampen_park_good_game.json |
| klassekampen_redaksjon_begreper — Begreper rundt Klassekampen-redaksjonen | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon, kulturjournalistikk, dagsorden, presse) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| klassekampen_redaksjon_offentlighet — Klassekampen i politisk og kulturell offentlighet | article_media_history_miniature | high | tydelig eksisterende fagområde (redaksjon, presse) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| nrk_huset_marienlyst_begreper — Begreper rundt NRK-huset på Marienlyst | article_media_history_miniature | high | tydelig eksisterende fagområde (nrk, allmennkringkasting, redaksjon, kringkasting) → `article_media_history_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_media_redaksjoner.json |
| akerselva — Akerselva gjør Oslos industrilag og rekreasjonsby lesbare i samme løp. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, natur, turvei, elve) → `article_nature_route_miniature` | data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json |
| akerselva_utlop_bjorvika — Elv-til-fjord-overgang i Bjørvika der økologi og fjordbyutvikling møtes. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, elv) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| alna_bryn — Elvekorridor i overgangssonen ved Bryn. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elve, bekk, elva) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| alna_smalvoll — Restaurert Alna-strekning gjennom Smalvoll. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elve, kantvegetasjon) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| alnaelva — Byelv som bærer spor av industri, forurensning og restaurering. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, byelv, natur, naturhistorie, naturstruktur) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnaelvstien — En sti som gjorde elva tilgjengelig. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, natur, turvei, byelv) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| alnaparken — Alnaparken er et grøntdrag langs åpnet Alna-løp med turvei, kantvegetasjon og små oppholdsflater. Parken knytter boligområder til elva og fungerer som lokal ferdselsakse. | article_nature_route_miniature | high | tydelig eksisterende fagområde (grøntdrag, turvei, kantvegetasjon, elva, elve, nærnatur) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| alnsjoen_alna_kilde — Alnsjøen markerer kildesonen til Alna-vassdraget i skogsterreng øst i Oslo. Her starter vannveien som senere blir byelv gjennom tett bebyggelse. | article_nature_route_miniature | high | tydelig eksisterende fagområde (vassdrag, byelv) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| beierbrua — Historisk kryssingspunkt over Akerselva ved industripregede byrom. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, elve) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| bjoelsenfossen — Foss langs Akerselva med vannkraft- og industrihistorisk betydning. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, foss) → `article_nature_route_miniature` | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| bjoelsenparken_elvenaer — Elvenært parkdrag som kobler ferdsel og opphold ved Akerselva. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elve, elva, vannet) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| bogerudmyra — Bogerudmyra er en bynær fuktmark der myrvegetasjon gir et tydelig annet naturpreg enn skog og innsjø. | article_nature_route_miniature | high | tydelig eksisterende fagområde (innsjø, myr) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch2.json |
| bygdoy_bygdoynes — Bygdøynes er et nes med vid fjordkontakt, kystkratt og åpne gresspartier mot vannet. Landskapet oppleves som et tydelig møte mellom halvøy og fjord. | article_nature_route_miniature | high | tydelig eksisterende fagområde (vannet) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| bygdoy_dronningberget — Kystnært naturpunkt på Bygdøy med berg og skog. | article_nature_route_miniature | high | tydelig eksisterende fagområde (svaberg) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| bygdoy_huk — Huk ytterst på Bygdøy er en eksponert oddesone med svaberg, strender og marint preg. Området har sterk fjordkontakt og høy badebruk i sesong. | article_nature_route_miniature | high | tydelig eksisterende fagområde (svaberg) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| bygdoy_kongeskogen — Bynær løvskog på Bygdøy med stier, naturbruk og tydelig rekreasjonsfunksjon. | article_nature_route_miniature | high | tydelig eksisterende fagområde (kongeskogen) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |
| bygdoy_paradisbukta — Paradisbukta på Bygdøy er en skjermet bukt med sandstrand og gruntvann. Den lune formen gir roligere vann enn på de mer åpne kystpartiene. | article_nature_route_miniature | high | tydelig eksisterende fagområde (vann) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| elvestrekning_bla_brenneriveien — Smal urban elvestrekning ved Blå med høy bruk. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elve, elva, kantvegetasjon) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| fossveien_elvestrekning — Elvenær overgangssone ved Fossveien med synlig kantnatur. | article_nature_route_miniature | high | tydelig eksisterende fagområde (foss, elve, elva, natur) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| furuset_haugerud_skogbelte — Der boligbyen møter skogen. | article_nature_route_miniature | high | tydelig eksisterende fagområde (skogbelte, natur) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_alna.json |
| furuset_haugerud_skogbelte_forbindelse — Skogbelte som grønn forbindelse | article_nature_route_miniature | high | tydelig eksisterende fagområde (skogbelte, grøntdrag) → `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| furuset_haugerud_skogbelte_hovedartikkel — Furuset–Haugerud skogbelte | article_nature_route_miniature | high | tydelig eksisterende fagområde (skogbelte, natur) → `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| furuset_haugerud_skogbelte_terreng_vegetasjon — Terreng og vegetasjonsrom | article_nature_route_miniature | high | tydelig eksisterende fagområde (skogbelte, naturstruktur) → `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_ost_alna_natur_byhistorie.json |
| glads_molle — Møllehistorisk sted langs Akerselva. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva) → `article_nature_route_miniature` | data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json |
| gressholmen — Gressholmen er en fjordøy med kystskog, strandenger og viktige hekkeområder for sjøfugl. Øya har nærkontakt med byfjorden, men tydelig naturpreg. | article_nature_route_miniature | high | tydelig eksisterende fagområde (fjordøy, natur) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| grorud_groruddalen_dalrom — Groruddalen som dalrom | article_nature_route_miniature | high | tydelig eksisterende fagområde (dalrom) → `article_nature_route_miniature` | data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch4.json |
| hausmannsbrua — Krysningsbro over Akerselva i overgangen sentrum–øst. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, elve) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| hausmannsomradet_elvelop — Sentrumsnært elveparti med kulturbruk og tydelig vannkontakt. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elve, elva) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json |
| hovedoya — Hovedøya har kalkrik flora, skogholt og strender i et variert øylandskap i indre Oslofjord. Naturreservat og høy besøksbruk ligger tett side om side. | article_nature_route_miniature | high | tydelig eksisterende fagområde (naturreservat) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json |
| kuba_parken — Elvenær bypark i indre by, formet av transformasjonen langs Akerselva. | article_nature_route_miniature | high | tydelig eksisterende fagområde (elva, elve) → `article_nature_route_miniature` | data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json |

_Viser 50 av 134. Full liste i `reports/visual-design-codes-audit.json`._

### Mangler metadata

#### needsMetadata (3)

| id / title | missing | reason | file |
| --- | --- | --- | --- |
| lesespor_bjorvika_001 — Ellen de Vibe snakker ut: – Vi sviktet de rimelige boligene i Fjordbyen | summary.themes, classification.tags, popupDesc | for lite metadata til trygg designCode (category_hints: by) | data/lesespor/oslo/lesespor_oslo_by.json |
| lesespor_gronland_001 — Aktivitet skaper tryggere byer | summary.themes, classification.tags, popupDesc | for lite metadata til trygg designCode (category_hints: by) | data/lesespor/oslo/lesespor_oslo_by.json |
| lesespor_gronland_003 — Hva er god byutvikling? | summary.themes, classification.tags, popupDesc | for lite metadata til trygg designCode (category_hints: by/politikk) | data/lesespor/oslo/lesespor_oslo_by.json |

### Trenger mulig ny designCode

#### needsNewDesignCode (0)

- (ingen)

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

Topp 60 av 134, gruppert etter `suggestedDesignCode`:

- `article_architecture_miniature` (1):
  - sagene_arbeiderby_boligstruktur [high] — tydelig eksisterende fagområde (boligstruktur) → `article_architecture_miniature`
- `article_art_miniature` (2):
  - frognerparken_hovedartikkel [high] — tydelig eksisterende fagområde (vigelandsanlegget) → `article_art_miniature`
  - frognerparken_vigelandsanlegget [high] — tydelig eksisterende fagområde (vigelandsanlegget, skulptur, skulpturpark) → `article_art_miniature`
- `article_history_miniature` (1):
  - gamlebyen_middelalderbyen_oslo [high] — tydelig eksisterende fagområde (middelalderby, christiania, byhistorie) → `article_history_miniature`
- `article_industry_miniature` (1):
  - schous_plass_schous_bryggeri [high] — tydelig eksisterende fagområde (bryggeri, industrihistorie) → `article_industry_miniature`
- `article_institution_miniature` (2):
  - chateau_neuf_hovedartikkel [high] — tydelig eksisterende fagområde (studenthus, studentersamfund) → `article_institution_miniature`
  - psykologisk_institutt_uio_forskning_metode [high] — tydelig eksisterende fagområde (institutt) → `article_institution_miniature`
- `article_local_story_miniature` (1):
  - gronland_kirke [high] — tydelig eksisterende fagområde (lokalhistorie) → `article_local_story_miniature`
- `article_media_history_miniature` (12):
  - aftenposten_akersgata_avisoffentlighet [high] — tydelig eksisterende fagområde (redaksjon, lederartikkel, dagsorden) → `article_media_history_miniature`
  - aftenposten_akersgata_begreper [high] — tydelig eksisterende fagområde (avishus, lederartikkel, dagsorden, presse) → `article_media_history_miniature`
  - aftenposten_akersgata_geografi [high] — tydelig eksisterende fagområde (redaksjon, avishus, presse) → `article_media_history_miniature`
  - cinemateket_oslo_kuratering_programkino [high] — tydelig eksisterende fagområde (redaksjon) → `article_media_history_miniature`
  - dagbladet_akersgata_begreper [high] — tydelig eksisterende fagområde (tabloid, avishus, redaksjon) → `article_media_history_miniature`
  - dagbladet_akersgata_kulturjournalistikk [high] — tydelig eksisterende fagområde (kulturjournalistikk, redaksjon) → `article_media_history_miniature`
  - dagbladet_akersgata_medieform [high] — tydelig eksisterende fagområde (redaksjon, tabloid) → `article_media_history_miniature`
  - good_game_redaksjon_begreper [high] — tydelig eksisterende fagområde (redaksjon) → `article_media_history_miniature`
  - good_game_redaksjon_spillkultur_mediefelt [high] — tydelig eksisterende fagområde (redaksjon, mediefelt) → `article_media_history_miniature`
  - klassekampen_redaksjon_begreper [high] — tydelig eksisterende fagområde (redaksjon, kulturjournalistikk, dagsorden, presse) → `article_media_history_miniature`
  - klassekampen_redaksjon_offentlighet [high] — tydelig eksisterende fagområde (redaksjon, presse) → `article_media_history_miniature`
  - nrk_huset_marienlyst_begreper [high] — tydelig eksisterende fagområde (nrk, allmennkringkasting, redaksjon, kringkasting) → `article_media_history_miniature`
- `article_nature_route_miniature` (40):
  - akerselva [high] — tydelig eksisterende fagområde (elva, natur, turvei, elve) → `article_nature_route_miniature`
  - akerselva_utlop_bjorvika [high] — tydelig eksisterende fagområde (elva, elv) → `article_nature_route_miniature`
  - alna_bryn [high] — tydelig eksisterende fagområde (elve, bekk, elva) → `article_nature_route_miniature`
  - alna_smalvoll [high] — tydelig eksisterende fagområde (elve, kantvegetasjon) → `article_nature_route_miniature`
  - alnaelva [high] — tydelig eksisterende fagområde (elva, byelv, natur, naturhistorie, naturstruktur) → `article_nature_route_miniature`
  - alnaelvstien [high] — tydelig eksisterende fagområde (elva, natur, turvei, byelv) → `article_nature_route_miniature`
  - alnaparken [high] — tydelig eksisterende fagområde (grøntdrag, turvei, kantvegetasjon, elva, elve, nærnatur) → `article_nature_route_miniature`
  - alnsjoen_alna_kilde [high] — tydelig eksisterende fagområde (vassdrag, byelv) → `article_nature_route_miniature`
  - beierbrua [high] — tydelig eksisterende fagområde (elva, elve) → `article_nature_route_miniature`
  - bjoelsenfossen [high] — tydelig eksisterende fagområde (elva, foss) → `article_nature_route_miniature`
  - bjoelsenparken_elvenaer [high] — tydelig eksisterende fagområde (elve, elva, vannet) → `article_nature_route_miniature`
  - bogerudmyra [high] — tydelig eksisterende fagområde (innsjø, myr) → `article_nature_route_miniature`
  - bygdoy_bygdoynes [high] — tydelig eksisterende fagområde (vannet) → `article_nature_route_miniature`
  - bygdoy_dronningberget [high] — tydelig eksisterende fagområde (svaberg) → `article_nature_route_miniature`
  - bygdoy_huk [high] — tydelig eksisterende fagområde (svaberg) → `article_nature_route_miniature`
  - bygdoy_kongeskogen [high] — tydelig eksisterende fagområde (kongeskogen) → `article_nature_route_miniature`
  - bygdoy_paradisbukta [high] — tydelig eksisterende fagområde (vann) → `article_nature_route_miniature`
  - elvestrekning_bla_brenneriveien [high] — tydelig eksisterende fagområde (elve, elva, kantvegetasjon) → `article_nature_route_miniature`
  - fossveien_elvestrekning [high] — tydelig eksisterende fagområde (foss, elve, elva, natur) → `article_nature_route_miniature`
  - furuset_haugerud_skogbelte [high] — tydelig eksisterende fagområde (skogbelte, natur) → `article_nature_route_miniature`
  - furuset_haugerud_skogbelte_forbindelse [high] — tydelig eksisterende fagområde (skogbelte, grøntdrag) → `article_nature_route_miniature`
  - furuset_haugerud_skogbelte_hovedartikkel [high] — tydelig eksisterende fagområde (skogbelte, natur) → `article_nature_route_miniature`
  - furuset_haugerud_skogbelte_terreng_vegetasjon [high] — tydelig eksisterende fagområde (skogbelte, naturstruktur) → `article_nature_route_miniature`
  - glads_molle [high] — tydelig eksisterende fagområde (elva) → `article_nature_route_miniature`
  - gressholmen [high] — tydelig eksisterende fagområde (fjordøy, natur) → `article_nature_route_miniature`
  - grorud_groruddalen_dalrom [high] — tydelig eksisterende fagområde (dalrom) → `article_nature_route_miniature`
  - hausmannsbrua [high] — tydelig eksisterende fagområde (elva, elve) → `article_nature_route_miniature`
  - hausmannsomradet_elvelop [high] — tydelig eksisterende fagområde (elve, elva) → `article_nature_route_miniature`
  - hovedoya [high] — tydelig eksisterende fagområde (naturreservat) → `article_nature_route_miniature`
  - kuba_parken [high] — tydelig eksisterende fagområde (elva, elve) → `article_nature_route_miniature`
  - kvaernerbyen_alna [high] — tydelig eksisterende fagområde (byelv, elva) → `article_nature_route_miniature`
  - lisbon_jardim_botanico [high] — tydelig eksisterende fagområde (jardim, bynatur) → `article_nature_route_miniature`
  - lisbon_jardim_do_principe_real [high] — tydelig eksisterende fagområde (jardim, bynatur) → `article_nature_route_miniature`
  - lisbon_jardim_do_torel [high] — tydelig eksisterende fagområde (jardim, bynatur) → `article_nature_route_miniature`
  - lisbon_jardim_gulbenkian [high] — tydelig eksisterende fagområde (jardim, bynatur) → `article_nature_route_miniature`
  - lisbon_miradouro_da_graca [high] — tydelig eksisterende fagområde (miradouro, bynatur) → `article_nature_route_miniature`
  - lisbon_miradouro_da_senhora_do_monte [high] — tydelig eksisterende fagområde (miradouro, bynatur) → `article_nature_route_miniature`
  - lisbon_miradouro_sao_pedro_de_alcantara [high] — tydelig eksisterende fagområde (miradouro, bynatur) → `article_nature_route_miniature`
  - lisbon_monsanto [high] — tydelig eksisterende fagområde (monsanto, bynatur) → `article_nature_route_miniature`
  - lisbon_tapada_da_ajuda [high] — tydelig eksisterende fagområde (tapada, bynatur) → `article_nature_route_miniature`

_Viser 60 av 134. Full liste i `articleBatch6Plan.candidates` i JSON._

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
