# Stories coverage-rapport

Rapporten kartlegger eksisterende story-dekning uten å endre story-, place-, people- eller UI-data. Grunnlaget er `data/stories/stories_manifest.json`, alle story-filer som manifestet peker på, `data/places/manifest.json` og alle place-sourcefiler som place-manifestet peker på.

## Sammendrag

- Totalt antall unike places i place-sourcefilene: **470**.
- Places med minst én story: **41**.
- Places uten story: **429**.
- Total coverage: **8.7%**.
- Story-manifestet peker på **42** story-filer med **43** stories totalt. **43** stories har `place_id`, fordelt på **41** places.
- `npm run check:stories` er kjørt etter rapportarbeidet og rapporterer `Stories integrity OK`.

## Dekning totalt

| Måltall | Antall |
|---|---:|
| Places totalt | 470 |
| Places med minst én story | 41 |
| Places uten story | 429 |
| Coverage totalt | 8.7% |
| Story-filer i manifest | 42 |
| Stories totalt | 43 |

## Dekning per kategori

| Kategori | Places totalt | Med story | Uten story | Coverage |
|---|---:|---:|---:|---:|
| by | 97 | 6 | 91 | 6.2% |
| film_tv | 8 | 1 | 7 | 12.5% |
| historie | 54 | 14 | 40 | 25.9% |
| kunst | 18 | 1 | 17 | 5.6% |
| litteratur | 31 | 1 | 30 | 3.2% |
| media | 11 | 1 | 10 | 9.1% |
| musikk | 13 | 1 | 12 | 7.7% |
| naeringsliv | 41 | 2 | 39 | 4.9% |
| natur | 63 | 0 | 63 | 0.0% |
| politikk | 15 | 5 | 10 | 33.3% |
| populaerkultur | 18 | 2 | 16 | 11.1% |
| psykologi | 1 | 0 | 1 | 0.0% |
| sport | 49 | 5 | 44 | 10.2% |
| subkultur | 23 | 0 | 23 | 0.0% |
| vitenskap | 28 | 2 | 26 | 7.1% |

## Places med stories

| Kategori | place_id | Navn | Story-titler | Story-filer |
|---|---|---|---|---|
| by | `akerselva` | Akerselva | Fyrstikkpikene streiker langs Akerselva | data/stories/stories_akerselva.json |
| by | `barcode` | Barcode | Striden om Barcode<br>Fra havn til finansdistrikt | data/stories/stories_barcode.json |
| by | `operahuset` | Operahuset | Operahuset man kan gå på taket av | data/stories/stories_operahuset.json |
| by | `tigeren` | Tigerstatuen | Da Tigerstaden fikk sin bronsetiger | data/stories/stories_tigeren.json |
| by | `universitetsplassen` | Universitetsplassen | Det Kongelige Frederiks Universitet – grunnlagt 1811 | data/stories/stories_universitetsplassen.json |
| by | `vigelandsparken` | Vigelandsparken | Gustav Vigelands kontrakt med Oslo | data/stories/stories_vigelandsparken.json |
| film_tv | `colosseum_kino` | Colosseum kino | Kuppelen som falt i brannen | data/stories/stories_colosseum_kino.json |
| historie | `akerhus_slott` | Akerhus Slott | Terboven tar over Akershus, september 1940 | data/stories/stories_akerhus_slott.json |
| historie | `botsfengselet` | Botsfengselet | Cellefengselet bygd for total isolasjon | data/stories/stories_botsfengselet.json |
| historie | `eidsvollsbygningen` | Eidsvollsbygningen | Grunnloven ble skrevet på Eidsvoll | data/stories/stories_eidsvollsbygningen.json |
| historie | `gamle_aker_kirke` | Gamle Aker kirke | Fossiler i Oslos eldste stående bygning | data/stories/stories_gamle_aker_kirke.json |
| historie | `grini_fangeleir` | Grini fangeleir | Grini ble den største fangeleiren i Norge | data/stories/stories_grini_fangeleir.json |
| historie | `hovedoya_kloster` | Hovedøya kloster | Klosteret på Hovedøya ble plyndret og brent | data/stories/stories_hovedoya_kloster.json |
| historie | `middelalder_oslo` | Middelalderparken | Ruinene der Oslo begynte | data/stories/stories_middelalder_oslo.json |
| historie | `mollergata_19` | Møllergata 19 | Quisling overga seg ved Møllergata 19 | data/stories/stories_mollergata_19.json |
| historie | `oscarsborg_festning` | Oscarsborg festning | Oscarsborg senket Blücher | data/stories/stories_oscarsborg_festning.json |
| historie | `oslo_domkirke` | Oslo domkirke | Bybrannen 1624 og den nye byen | data/stories/stories_oslo_domkirke.json |
| historie | `oslo_ladegard` | Oslo ladegård | Barokk over middelaldermurer | data/stories/stories_oslo_ladegard.json |
| historie | `prinds_christian_augusts_minde` | Prinds Christian Augusts Minde | Arbeid, tvang og asyl i Storgata 36 | data/stories/stories_prinds_christian_augusts_minde.json |
| historie | `villa_grande` | Villa Grande | Fra Gimle til HL-senteret | data/stories/stories_villa_grande.json |
| historie | `var_frelsers_gravlund` | Vår Frelsers gravlund | Æreslunden – der Ibsen, Bjørnson og Munch hviler | data/stories/stories_var_frelsers_gravlund.json |
| kunst | `munch_museet` | MUNCH | Munchs nattlige ridetur<br>Skrik og Madonna stjålet i høylys dag | data/stories/stories_edvard_munch.json<br>data/stories/stories_munch_museet.json |
| litteratur | `nationaltheatret` | Nationaltheatret | Åpningen av Nationaltheatret 1899 | data/stories/stories_nationaltheatret.json |
| media | `nrk_huset_marienlyst` | NRK-huset på Marienlyst | Det hvite huset der radio og TV samlet seg | data/stories/stories_nrk_huset_marienlyst.json |
| musikk | `det_norske_teatret` | Det Norske Teatret | Teaterslaget om nynorsk på scenen | data/stories/stories_det_norske_teatret.json |
| naeringsliv | `havnelageret` | Oslo Havnelager | Betonglageret som organiserte havnebyen | data/stories/stories_havnelageret.json |
| naeringsliv | `schous_bryggeri` | Schous bryggeri | Bryggeriet som ble kulturkvartal | data/stories/stories_schous_bryggeri.json |
| politikk | `eidsvolls_plass` | Eidsvolls plass | Lavvoen foran Stortinget | data/stories/stories_eidsvolls_plass.json |
| politikk | `oslo_radhus` | Oslo rådhus | Rådhuset åpner under byjubileet | data/stories/stories_oslo_radhus.json |
| politikk | `regjeringskvartalet` | Regjeringskvartalet | Bomben i Regjeringskvartalet 22. juli | data/stories/stories_regjeringskvartalet.json |
| politikk | `stortinget` | Stortinget | 7. juni 1905 – Stortinget erklærer unionen opphørt | data/stories/stories_stortinget.json |
| politikk | `youngstorget` | Youngstorget | 1. mai på Youngstorget | data/stories/stories_youngstorget.json |
| populaerkultur | `grand_hotel` | Grand Hotel | Ibsens daglige marsj til Grand Café | data/stories/stories_henrik_ibsen.json |
| populaerkultur | `hartvig_nissens_skole_skam` | Hartvig Nissens skole (SKAM) | Skolen som ble SKAMs virkelige adresse | data/stories/stories_hartvig_nissens_skole_skam.json |
| sport | `bislett_stadion` | Bislett Stadion | Hjalmar «Hjallis» Andersen tok tre gull på Bislett | data/stories/stories_bislett.json |
| sport | `ekebergsletta` | Ekebergsletta | Norway Cup starter med jentelag | data/stories/stories_ekebergsletta.json |
| sport | `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | Da Holmenkollrennet ble en nasjonal tradisjon | data/stories/stories_holmenkollen.json |
| sport | `jordal_amfi` | Jordal Amfi | Kunstisen som reddet OL-hockeyen | data/stories/stories_jordal_amfi.json |
| sport | `ullevaal_stadion` | Ullevaal Stadion | Cupfinalenes hjem åpnet i 1926 | data/stories/stories_ullevaal_stadion.json |
| vitenskap | `botanisk_hage` | Botanisk hage | Hagen som skulle bygge kunnskap for den nye nasjonen | data/stories/stories_botanisk_hage.json |
| vitenskap | `naturhistorisk_museum` | Naturhistorisk museum | Fossilet Ida blir verdensnyhet | data/stories/stories_naturhistorisk_museum.json |

## Places uten stories

| Kategori | place_id | Navn | År | Sourcefil |
|---|---|---|---:|---|
| by | `lisbon_ajuda` | Ajuda | 1761 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `aker_brygge` | Aker Brygge | 1989 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_alcantara` | Alcântara | 1888 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_alfama` | Alfama | 711 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `alnabru_jernbane_og_logistikk` | Alnabru – jernbane og logistikk |  | `data/places/natur/oslo/places_oslo_alna.json` |
| by | `ankerbrua` | Ankerbrua | 1874 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| by | `lisbon_avenida_da_liberdade` | Avenida da Liberdade | 1879 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_baixa_pombalina` | Baixa Pombalina | 1758 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `bankplassen` | Bankplassen | 1800 | `data/places/by/oslo/places_by.json` |
| by | `beierbrua` | Beierbrua | 1889 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| by | `lisbon_belem_bydel` | Belém | 1496 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_bica` | Bica | 1892 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `birkelunden` | Birkelunden | 1910 | `data/places/by/oslo/places_by.json` |
| by | `bispelokket` | Bispelokket / Trafikkmaskinen | 1966 | `data/places/by/oslo/places_by.json` |
| by | `bjorvika` | Bjørvika | 2008 | `data/places/by/oslo/places_by.json` |
| by | `bogstadveien` | Bogstadveien | 1870 | `data/places/by/oslo/places_by.json` |
| by | `botsparken` | Botsparken | 1900 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_cais_do_sodre` | Cais do Sodré | 1875 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_campo_de_ourique` | Campo de Ourique | 1879 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_campo_pequeno` | Campo Pequeno | 1892 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `carl_berner_plass` | Carl Berners plass | 1905 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_chiado` | Chiado | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `christiania_torv` | Christiania Torv | 1648 | `data/places/by/oslo/places_by.json` |
| by | `deichman_bjorvika` | Deichman Bjørvika | 2020 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_elevador_de_santa_justa` | Elevador de Santa Justa | 1902 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_entrecampos` | Entrecampos | 1957 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_oriente_station` | Estação do Oriente | 1998 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_estrela` | Estrela | 1790 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `frognerparken` | Frognerparken | 1900 | `data/places/by/oslo/places_by.json` |
| by | `gamlebyen` | Gamlebyen | 1000 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_gare_do_cais_do_sodre` | Gare do Cais do Sodré | 1928 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_graca` | Graça | 1271 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `grorud` | Grorud | 1950 | `data/places/by/oslo/places_by.json` |
| by | `grunerlokka_helgesens_tm` | Grünerløkka – Helgesens / Thorvald Meyers | 1880 | `data/places/by/oslo/places_by.json` |
| by | `gronland_basarene` | Grønland basarene | 1901 | `data/places/by/oslo/places_by.json` |
| by | `gronland_kirke` | Grønland kirke | 1869 | `data/places/by/oslo/places_by.json` |
| by | `gronlandsleiret` | Grønlandsleiret | 1860 | `data/places/by/oslo/places_by.json` |
| by | `hausmannsbrua` | Hausmannsbrua | 1880 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| by | `hausmannsomradet_elvelop` | Hausmannsområdet (elveløp) | 1970 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| by | `helsfyr` | Helsfyr | 1966 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_intendente` | Intendente | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `jernbanetorget` | Jernbanetorget | 1854 | `data/places/by/oslo/places_by.json` |
| by | `kampen` | Kampen | 1880 | `data/places/by/oslo/places_by.json` |
| by | `kampen_kirke` | Kampen kirke | 1882 | `data/places/by/oslo/places_by.json` |
| by | `kampen_park` | Kampen park | 1915 | `data/places/by/oslo/places_by.json` |
| by | `karl_johan` | Karl Johans gate | 1848 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_lapa` | Lapa | 1850 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_city` | Lisboa | 1147 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `majorstuen_krysset` | Majorstuen krysset | 1930 | `data/places/by/oslo/places_by.json` |
| by | `majorstuen_tbanestasjon` | Majorstuen T-banestasjon | 1898 | `data/places/by/oslo/places_by.json` |
| by | `markveien` | Markveien | 1880 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_martim_moniz_mouraria_axis` | Martim Moniz–Mouraria-aksen | 1147 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `nationaltheatret_stasjon` | Nationaltheatret stasjon | 1928 | `data/places/by/oslo/places_by.json` |
| by | `nybrua_vaterlandsparken` | Nybrua / Vaterlandsparken | 1827 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| by | `nydalen` | Nydalen | 2000 | `data/places/by/oslo/places_by.json` |
| by | `olaf_ryes_plass` | Olaf Ryes plass | 1890 | `data/places/by/oslo/places_by.json` |
| by | `oslo_bussterminal` | Oslo bussterminal | 1987 | `data/places/by/oslo/places_by.json` |
| by | `oslo_s` | Oslo S | 1980 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_parque_eduardo_vii` | Parque Eduardo VII | 1903 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_ponte_25_de_abril` | Ponte 25 de Abril | 1966 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_praca_do_comercio` | Praça do Comércio | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `lisbon_principe_real` | Príncipe Real | 1860 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `ring_3` | Ring 3 | 1970 | `data/places/by/oslo/places_by.json` |
| by | `rodelokka` | Rodeløkka | 1870 | `data/places/by/oslo/places_by.json` |
| by | `romsaås` | Romsås | 1970 | `data/places/by/oslo/places_by.json` |
| by | `lisbon_rossio` | Rossio (Praça Dom Pedro IV) | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| by | `radhusplassen` | Rådhusplassen | 1950 | `data/places/by/oslo/places_by.json` |
| by | `sagene` | Sagene | 1850 | `data/places/by/oslo/places_by.json` |
| by | `schous_plass` | Schous plass | 1881 | `data/places/by/oslo/places_by.json` |
| by | `skoyen` | Skøyen | 1900 | `data/places/by/oslo/places_by.json` |
| by | `slottsparken` | Slottsparken | 1840 | `data/places/by/oslo/places_by.json` |
| by | `spikersuppa` | Spikersuppa | 1930 | `data/places/by/oslo/places_by.json` |
| by | `st_hanshaugen_park` | St. Hanshaugen park | 1876 | `data/places/by/oslo/places_by.json` |
| by | `stensparken` | Stensparken | 1890 | `data/places/by/oslo/places_by.json` |
| by | `storgata` | Storgata | 1850 | `data/places/by/oslo/places_by.json` |
| by | `sorenga` | Sørenga | 2015 | `data/places/by/oslo/places_by.json` |
| by | `tjuvholmen` | Tjuvholmen | 2010 | `data/places/by/oslo/places_by.json` |
| by | `torggata` | Torggata | 1850 | `data/places/by/oslo/places_by.json` |
| by | `torshov` | Torshov | 1920 | `data/places/by/oslo/places_by.json` |
| by | `trikk_17_18` | Trikkelinje 17/18 | 1924 | `data/places/by/oslo/places_by.json` |
| by | `tullin` | Tullin | 1890 | `data/places/by/oslo/places_by.json` |
| by | `toyen_torg` | Tøyen torg | 1972 | `data/places/by/oslo/places_by.json` |
| by | `ullern` | Ullern | 1930 | `data/places/by/oslo/places_by.json` |
| by | `ullevål_hageby` | Ullevål Hageby | 1915 | `data/places/by/oslo/places_by.json` |
| by | `vaterland` | Vaterland | 1850 | `data/places/by/oslo/places_by.json` |
| by | `vinderen` | Vinderen | 1920 | `data/places/by/oslo/places_by.json` |
| by | `vulkan_energisentral` | Vulkan energisentral | 2012 | `data/places/by/oslo/places_by.json` |
| by | `vulkan_industriomrade` | Vulkan industriområde | 1857 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| by | `voienvolden` | Vøienvolden | 1716 | `data/places/by/oslo/places_by.json` |
| by | `vaalerenga` | Vålerenga | 1860 | `data/places/by/oslo/places_by.json` |
| by | `okern` | Økern | 1960 | `data/places/by/oslo/places_by.json` |
| film_tv | `lisbon_cinema_ideal` | Cinema Ideal | 1904 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |
| film_tv | `lisbon_cinema_nimas` | Cinema Nimas | 1976 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |
| film_tv | `lisbon_cinema_sao_jorge` | Cinema São Jorge | 1950 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |
| film_tv | `lisbon_cinemateca_portuguesa` | Cinemateca Portuguesa | 1948 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |
| film_tv | `cinemateket_oslo` | Cinemateket i Oslo | 1956 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| film_tv | `lisbon_doclisboa` | Doclisboa – Festival Internacional de Cinema | 2002 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |
| film_tv | `lisbon_tobis_portuguesa` | Tobis Portuguesa | 1932 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |
| historie | `lisbon_aqueduto_das_aguas_livres` | Aqueduto das Águas Livres | 1748 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `bjoelsenfossen` | Bjølsenfossen | 1850 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `bogstad_gard` | Bogstad gård | 1772 | `data/places/historie/oslo/places_historie.json` |
| historie | `lisbon_castelo_de_sao_jorge` | Castelo de São Jorge | 1147 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_convento_do_carmo` | Convento do Carmo | 1389 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `damstredet_telthusbakken` | Damstredet og Telthusbakken | 1750 | `data/places/historie/oslo/places_historie.json` |
| historie | `slottet` | Det kongelige slott | 1849 | `data/places/historie/oslo/places_historie.json` |
| historie | `lisbon_estacao_do_rossio` | Estação do Rossio | 1890 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `frysjadammen` | Frysjadammen | 1918 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `galgeberg` | Galgeberg | 1600 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| historie | `gamle_radhus` | Gamle rådhus | 1641 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| historie | `gamle_trikkestallen` | Gamle trikkestallen på Sagene | 1899 | `data/places/historie/oslo/places_historie.json` |
| historie | `gamlebyen_gravlund` | Gamlebyen gravlund | 1800 | `data/places/historie/oslo/places_historie.json` |
| historie | `glads_molle` | Glads mølle | 1736 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `hellerud_gard` | Hellerud gård |  | `data/places/natur/oslo/places_oslo_alna.json` |
| historie | `lisbon_igreja_de_santo_antonio` | Igreja de Santo António | 1812 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_igreja_de_sao_domingos` | Igreja de São Domingos | 1241 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_igreja_de_sao_roque` | Igreja de São Roque | 1565 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_sao_vicente_de_fora` | Igreja e Mosteiro de São Vicente de Fora | 1582 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_mosteiro_dos_jeronimos` | Mosteiro dos Jerónimos | 1502 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_museu_de_lisboa` | Museu de Lisboa (Palácio Pimenta) | 1762 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_museu_de_marinha` | Museu de Marinha | 1962 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_museu_do_aljube` | Museu do Aljube – Resistência e Liberdade | 2015 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_museu_nacional_dos_coches` | Museu Nacional dos Coches | 1905 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `nedre_foss` | Nedre Foss | 1800 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `nonneseter_kloster` | Nonneseter kloster | 1161 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| historie | `nydalen_industristed` | Nydalen industristed | 1845 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `oslo_hospital` | Oslo hospital | 1538 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| historie | `lisbon_padrao_dos_descobrimentos` | Padrão dos Descobrimentos | 1960 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_palacio_fronteira` | Palácio dos Marqueses de Fronteira | 1672 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_palacio_ajuda` | Palácio Nacional da Ajuda | 1796 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_panteao_nacional` | Panteão Nacional (Igreja de Santa Engrácia) | 1681 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_teatro_romano` | Ruínas do Teatro Romano | -57 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `lisbon_se_de_lisboa` | Sé de Lisboa | 1147 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `seilduksfabrikken_nydalen` | Seilduksfabrikken (Nydalen) | 1856 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `sofienberg_kirke` | Sofienberg kirke | 1877 | `data/places/historie/oslo/places_historie.json` |
| historie | `lisbon_torre_de_belem` | Torre de Belém | 1519 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| historie | `vaterland_historisk_elvelop` | Vaterland – historisk elveløp | 1650 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `voien_gard_voienvolden` | Vøien gård / Vøienvolden | 1670 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| historie | `voienfossen` | Vøienfossen | 1847 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| kunst | `astrup_fearnley` | Astrup Fearnley Museet | 2012 | `data/places/kunst/oslo/places_kunst.json` |
| kunst | `lisbon_centro_cultural_de_belem` | Centro Cultural de Belém | 1992 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_culturgest` | Culturgest | 1993 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `ekebergparken` | Ekebergparken skulpturpark | 2013 | `data/places/kunst/oslo/places_kunst.json` |
| kunst | `lisbon_fundacao_calouste_gulbenkian` | Fundação Calouste Gulbenkian | 1956 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_mac_ccb_berardo` | MAC/CCB (tidligere Museu Coleção Berardo) | 2007 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_mude` | MUDE – Museu do Design e da Moda | 2009 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_museu_arpad_szenes_vieira_da_silva` | Museu Arpad Szenes – Vieira da Silva | 1994 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_museu_bordalo_pinheiro` | Museu Bordalo Pinheiro | 1916 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_museu_do_oriente` | Museu do Oriente | 2008 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_museu_nacional_de_arte_antiga` | Museu Nacional de Arte Antiga | 1884 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_museu_nacional_de_arte_contemporanea_do_chiado` | Museu Nacional de Arte Contemporânea do Chiado | 1911 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_museu_nacional_do_azulejo` | Museu Nacional do Azulejo | 1965 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_maat` | MAAT / Tejo-kraftstasjonen | 2016 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `nasjonalmuseet` | Nasjonalmuseet | 2022 | `data/places/kunst/oslo/places_kunst.json` |
| kunst | `lisbon_teatro_nacional_d_maria_ii` | Teatro Nacional D. Maria II | 1846 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| kunst | `lisbon_teatro_sao_luiz` | Teatro São Luiz | 1894 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| litteratur | `lisbon_a_brasileira` | A Brasileira / Fernando Pessoa | 1905 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `alexander_kiellands_plass` | Alexander Kiellands plass | 1913 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `alf_proysen_statue_nittedal` | Alf Prøysen-statuen – Nittedal kulturhus | 2019 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_biblioteca_nacional_de_portugal` | Biblioteca Nacional de Portugal | 1796 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `camilla_collett_statue` | Camilla Collett-statuen | 1911 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_casa_dos_bicos` | Casa dos Bicos / Fundação José Saramago | 1523 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `lisbon_casa_dos_estudantes_do_imperio` | Casa dos Estudantes do Império | 1944 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `lisbon_casa_fernando_pessoa` | Casa Fernando Pessoa | 1993 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `lisbon_cemiterio_dos_prazeres` | Cemitério dos Prazeres | 1833 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `deichman_grunerlokka` | Deichman Grünerløkka | 1914 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `eldorado_bokhandel` | Eldorado Bokhandel | 1924 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_estatua_eca_de_queiros` | Estátua de Eça de Queirós | 1903 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `gamle_deichman` | Gamle Deichman | 1890 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_gremio_literario` | Grémio Literário | 1846 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `grotta` | Grotten | 1924 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_hemeroteca_municipal` | Hemeroteca Municipal de Lisboa | 1931 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `henrik_wergeland_statue` | Henrik Wergeland-statuen | 1881 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `ibsen_quotes` | Ibsen sitater | 2006 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `inger_hagerups_plass` | Inger Hagerups plass | 1990 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `kulturkirken_jakob_litteratur` | Kulturkirken Jakob | 2000 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `litteraturhuset` | Litteraturhuset | 2007 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_livraria_bertrand` | Livraria Bertrand (Chiado) | 1732 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `nasjonalbiblioteket` | Nasjonalbiblioteket | 1914 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `norli_universitetsgata` | Norli Universitetsgata | 1890 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `oscar_braaten_statuen` | Oscar Braaten-statuen | 1956 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `lisbon_praca_luis_de_camoes` | Praça Luís de Camões | 1867 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| litteratur | `proysenhuset_rudshogda` | Prøysenhuset – Rudshøgda | 2014 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `ruth_maier_minne` | Ruth Maier-minnesmerke | 2010 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `sigrid_undset_statue` | Sigrid Undset-statuen | 1982 | `data/places/litteratur/oslo/places_litteratur.json` |
| litteratur | `tronsmo_bokhandel` | Tronsmo Bokhandel | 1973 | `data/places/litteratur/oslo/places_litteratur.json` |
| media | `aftenposten_akersgata` | Aftenposten i Akersgata | 1880 | `data/places/media/oslo/places_oslo_media.json` |
| media | `lisbon_antena_1_rdp` | Antena 1 / RDP-radiohistorie | 1935 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |
| media | `lisbon_arquivo_rtp` | Arquivo RTP | 1957 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |
| media | `dagbladet_akersgata` | Dagbladet i Akersgata | 1869 | `data/places/media/oslo/places_oslo_media.json` |
| media | `lisbon_diario_de_noticias` | Diário de Notícias-bygget | 1864 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |
| media | `good_game_redaksjon` | Good Game-redaksjonen (NRK) | 2011 | `data/places/media/oslo/places_oslo_media.json` |
| media | `klassekampen_redaksjon` | Klassekampen-redaksjonen (Hausmanns gate) | 1969 | `data/places/media/oslo/places_oslo_media.json` |
| media | `lisbon_lusa` | Lusa – Agência de Notícias de Portugal | 1987 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |
| media | `lisbon_rtp` | RTP – Rádio e Televisão de Portugal | 1957 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |
| media | `vg_huset` | VG-huset | 1945 | `data/places/media/oslo/places_oslo_media.json` |
| musikk | `blaa` | Blå | 1998 | `data/places/musikk/oslo/places_musikk.json` |
| musikk | `lisbon_clube_de_fado` | Clube de Fado | 1995 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| musikk | `lisbon_coliseu_dos_recreios` | Coliseu dos Recreios | 1890 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| musikk | `lisbon_hot_clube_de_portugal` | Hot Clube de Portugal | 1948 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| musikk | `john_dee` | John Dee | 1997 | `data/places/musikk/oslo/places_musikk.json` |
| musikk | `lisbon_mouraria_fado` | Mouraria / fado | 1147 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| musikk | `lisbon_museu_do_fado` | Museu do Fado | 1998 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| musikk | `rockefeller` | Rockefeller Music Hall | 1986 | `data/places/musikk/oslo/places_musikk.json` |
| musikk | `salt` | SALT | 2014 | `data/places/musikk/oslo/places_musikk.json` |
| musikk | `sentrum_scene` | Sentrum Scene | 1992 | `data/places/musikk/oslo/places_musikk.json` |
| musikk | `lisbon_tasca_do_chico` | Tasca do Chico | 1993 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| musikk | `lisbon_teatro_tivoli_bbva` | Teatro Tivoli BBVA | 1924 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| naeringsliv | `akerselva_industri` | Akerselva industriområde | 1850 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `akershus_energi` | Akershus Energi Varme | 2010 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `akershus_kaier` | Akershuskaiene | 1850 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lisbon_armazens_do_chiado` | Armazéns do Chiado | 1894 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `akershus_slott_bakeriet` | Bakeriet ved Akershus | 1820 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `bryn_industriomrade` | Bryn industriområde | 1880 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `oslo_kornmagasin` | Christiania kornmagasin | 1785 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `christiania_seildugsfabrik` | Christiania Seildugsfabrik | 1856 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lisbon_cordoaria_nacional` | Cordoaria Nacional | 1771 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `grunnlovsbygget_bankplassen` | Den gamle Norges Bank | 1828 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lisbon_doca_de_alcantara` | Doca de Alcântara | 1887 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `fornebu_teknologipark` | Fornebu Teknologipark | 2002 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `frysja_industriomrade` | Frysja industriområde | 1750 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `grensen_kjopesenter` | Grensen – handelens sentrum | 1800 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `gronlikaia` | Grønlikaia | 1960 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `jernbanetorget_trafikknutepunkt` | Jernbanetorget – handelsknutepunktet | 1854 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lilleborg_fabrikker` | Lilleborg Fabrikker | 1833 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `jernbaneverkstedet_lodalen` | Lodalen jernbaneverksted | 1890 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lisbon_lx_factory` | LX Factory | 1846 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `lisbon_mercado_da_ribeira` | Mercado da Ribeira / Time Out Market | 1882 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `lisbon_mercado_de_campo_de_ourique` | Mercado de Campo de Ourique | 1934 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `myrens_verksted` | Myrens Verksted | 1848 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `norges_varemesse` | Norges Varemesse | 1920 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `nrk_marienlyst` | NRK Marienlyst | 1938 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `oslo_gassverk` | Oslo Gassverk | 1858 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `oslo_kraftselskap` | Oslo Lysverker | 1892 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `oslo_mek` | Oslo Mekaniske Verksted | 1854 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `oslo_posthus` | Oslo Posthus | 1924 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lisbon_parque_das_nacoes` | Parque das Nações | 1998 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `ringnes_bryggeri` | Ringnes bryggeri | 1876 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `sagene_kvernhus` | Sagene mølle og kvernhus | 1750 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `st_halvard_bryggeri` | St. Halvard bryggeri | 1843 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `telegrafbygningen` | Telegrafbygningen | 1924 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `lisbon_terminal_de_cruzeiros` | Terminal de Cruzeiros de Lisboa | 2017 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| naeringsliv | `tollbukaia` | Tollbukaia | 1890 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `ulven_handelspark` | Ulven handelspark | 2020 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `vinmonopolet_lager` | Vinmonopolets hovedlager | 1930 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `vippetangen_fisketorg` | Vippetangen fisketorg | 1890 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| naeringsliv | `ovre_foss` | Øvre Foss – Hjula Veveri | 1855 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| natur | `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | 2000 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `alna_utlop_bjorvika` | Alna utløp i Bjørvika |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `alna_bryn` | Alna ved Bryn |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `alna_smalvoll` | Alna ved Smalvoll |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `alnaelva` | Alnaelva | 2005 | `data/places/natur/oslo/places_oslo_alna.json` |
| natur | `alnaelva_hovedsteder` | Alnaelva | 2005 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `alnaelvstien` | Alnaelvstien |  | `data/places/natur/oslo/places_oslo_alna.json` |
| natur | `alnaparken` | Alnaparken |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `alnsjoen_alna_kilde` | Alnsjøen (Alna-kilde) |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `bjoelsenparken_elvenaer` | Bjølsenparken (elvenær del) | 1930 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `blindern_forskningsparken_salamanderdam` | Blindern/Forskningsparken salamanderdam | 2025 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| natur | `bygdoy_bygdoynes` | Bygdøy Bygdøynes |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| natur | `bygdoy_dronningberget` | Bygdøy Dronningberget |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| natur | `bygdoy_huk` | Bygdøy Huk |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| natur | `bygdoy_kongeskogen` | Bygdøy Kongeskogen |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| natur | `bygdoy_kongsgard_salamanderdam` | Bygdøy Kongsgård salamanderdam | 2006 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| natur | `bygdoy_natur` | Bygdøy natur- og kulturmiljø | 2002 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `bygdoy_paradisbukta` | Bygdøy Paradisbukta |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| natur | `bygdoy_roykenvika` | Bygdøy Røykensvika |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| natur | `bogerudmyra` | Bøler/Bogerudmyra |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| natur | `bantjern_salamanderlokalitet` | Båntjern salamanderlokalitet | 1988 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| natur | `elvestrekning_bla_brenneriveien` | Elvestrekning ved Blå (Brenneriveien) | 1998 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `fossveien_elvestrekning` | Fossveien – elvestrekning | 1890 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `furuset_haugerud_skogbelte` | Furuset–Haugerud skogbelte |  | `data/places/natur/oslo/places_oslo_alna.json` |
| natur | `gressholmen` | Gressholmen | 1992 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `groruddammen` | Groruddammen |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `hovedoya` | Hovedøya | 1147 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `lisbon_jardim_botanico` | Jardim Botânico de Lisboa | 1873 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_jardim_da_estrela` | Jardim da Estrela | 1852 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_jardim_gulbenkian` | Jardim da Fundação Calouste Gulbenkian | 1969 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_jardim_do_principe_real` | Jardim do Príncipe Real | 1860 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_jardim_do_torel` | Jardim do Torel | 1860 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `kuba_parken` | Kuba-parken | 2007 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `kvaernerbyen_alna` | Kværnerbyen ved Alna |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `ljanselva` | Ljanselva | 1977 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `ljanselva_bunnefjorden` | Ljanselva ut i Bunnefjorden |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `ljanselva_fiskevollen` | Ljanselva ved Fiskevollen |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `ljanselva_hauketo` | Ljanselva ved Hauketo |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `ljanselva_ljan` | Ljanselva ved Ljan |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `ljanselva_skullerud` | Ljanselva ved Skullerud |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `loelva_historisk` | Loelva (historisk vassdrag) |  | `data/places/natur/oslo/places_oslo_alna.json` |
| natur | `maridalsvannet` | Maridalsvannet | 1867 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `lisbon_miradouro_da_graca` | Miradouro da Graça (Sophia de Mello Breyner Andresen) | 1271 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_miradouro_da_senhora_do_monte` | Miradouro da Senhora do Monte | 1796 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_miradouro_sao_pedro_de_alcantara` | Miradouro de São Pedro de Alcântara | 1864 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `myralokka` | Myraløkka | 1920 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `maerradalen` | Mærradalen | 2009 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `nydalsdammen` | Nydalsdammen | 1860 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `noklevann` | Nøklevann | 1923 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `noklevann_ljanselva_start` | Nøklevann (Ljanselva start) |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `lisbon_monsanto` | Parque Florestal de Monsanto | 1934 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `skraperudtjern` | Skraperudtjern |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| natur | `stilla_nydalen` | Stilla ved Nydalen | 1900 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| natur | `svartdalen` | Svartdalen |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| natur | `lisbon_tapada_da_ajuda` | Tapada da Ajuda | 1645 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `lisbon_tapada_das_necessidades` | Tapada das Necessidades | 1747 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| natur | `tjernsmyr_salamanderlokalitet` | Tjernsmyr salamanderlokalitet | 2020 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| natur | `trosterud_friomrade` | Trosterud friområde |  | `data/places/natur/oslo/places_oslo_alna.json` |
| natur | `ostensjovannet` | Østensjøvannet | 1992 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| natur | `ostensjovannet_fugletarn` | Østensjøvannet fugletårn |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| natur | `ostensjovannet_nord` | Østensjøvannet nord |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| natur | `ostensjovannet_sivbelte` | Østensjøvannet sivbelte |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| natur | `ostensjovannet_sor` | Østensjøvannet sør |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| politikk | `lisbon_assembleia_da_republica` | Assembleia da República | 1834 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_avenida_24_de_julho` | Avenida 24 de Julho | 1882 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_fundacao_mario_soares_maria_barroso` | Fundação Mário Soares e Maria Barroso | 1996 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_largo_do_carmo` | Largo do Carmo | 1974 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `tinghuset` | Oslo tinghus | 1994 | `data/places/politikk/oslo/places_politikk.json` |
| politikk | `lisbon_palacio_de_belem` | Palácio de Belém | 1726 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_praca_do_municipio` | Praça do Município / Câmara Municipal de Lisboa | 1880 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_praca_dos_restauradores` | Praça dos Restauradores | 1886 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_praca_marques_de_pombal` | Praça Marquês de Pombal | 1934 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| politikk | `lisbon_tribunal_constitucional` | Tribunal Constitucional / Palácio Ratton | 1746 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| populaerkultur | `lisbon_casa_museu_amalia_rodrigues` | Casa-Museu Amália Rodrigues | 2001 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| populaerkultur | `chateau_neuf` | Chateau Neuf | 1971 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| populaerkultur | `lisbon_feira_da_ladra` | Feira da Ladra | 1882 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| populaerkultur | `lisbon_feira_do_livro` | Feira do Livro de Lisboa | 1931 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| populaerkultur | `folketeateret` | Folketeateret | 1935 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| populaerkultur | `frognerstranda` | Frognerstranda |  | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| populaerkultur | `gimle_kino` | Gimle kino | 1939 | `data/places/film/oslo/places_oslo_film.json` |
| populaerkultur | `house_of_nerds` | House of Nerds | 2020 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| populaerkultur | `klingenberg_kino` | Klingenberg kino | 1938 | `data/places/film/oslo/places_oslo_film.json` |
| populaerkultur | `latter` | Latter | 2004 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| populaerkultur | `lisbon_marchas_populares` | Marchas Populares de Lisboa | 1932 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| populaerkultur | `saga_kino` | Saga kino | 1989 | `data/places/film/oslo/places_oslo_film.json` |
| populaerkultur | `lisbon_santo_antonio_festival` | Santo António-festivalen i Lisboa | 1934 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| populaerkultur | `slottsplassen` | Slottsplassen |  | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| populaerkultur | `lisbon_tram_28` | Tram 28 (Eléctrico 28) | 1914 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| populaerkultur | `vika_kino` | Vika kino | 1981 | `data/places/film/oslo/places_oslo_film.json` |
| psykologi | `psykologisk_institutt_uio` | Psykologisk institutt, UiO | 1909 | `data/places/psykologi/oslo/places_psykologi.json` |
| sport | `lekeplass_birkelunden` | Birkelunden lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lekeplass_botsparken` | Botsparken lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lisbon_centro_nautico_de_belem` | Centro Náutico de Belém | 1856 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `daelenenga_idrettspark` | Dælenenga idrettspark | 1916 | `data/places/sport/oslo/places_sport.json` |
| sport | `lisbon_estadio_da_luz` | Estádio da Luz | 2003 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `lisbon_complexo_desportivo_do_restelo` | Estádio do Restelo (Complexo Desportivo do Restelo) | 1956 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `lisbon_estadio_jose_alvalade` | Estádio José Alvalade | 2003 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `lisbon_estadio_universitario` | Estádio Universitário de Lisboa | 1956 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `finnskogbanen` | Finnskogbanen |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `frogner_stadion` | Frogner stadion | 1914 | `data/places/sport/oslo/places_sport.json` |
| sport | `lekeplass_frognerborgen` | Frognerborgen | 2006 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `furuset_forum` | Furuset Forum | 1998 | `data/places/sport/oslo/places_sport.json` |
| sport | `gardermoen_motorpark` | Gardermoen Motorpark |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `gardermoen_raceway` | Gardermoen Raceway | 1996 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `grenland_motorsportsenter` | Grenland Motorsportsenter | 2007 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `gressbanen` | Gressbanen | 1918 | `data/places/sport/oslo/places_sport.json` |
| sport | `lisbon_hipodromo_do_campo_grande` | Hipódromo do Campo Grande | 1885 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `intility_arena` | Intility Arena | 2017 | `data/places/sport/oslo/places_sport.json` |
| sport | `lekeplass_kampen_park` | Kampen park lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `treningssted_kampen_park` | Kampen park treningssted |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `kfum_arena` | KFUM Arena | 2007 | `data/places/sport/oslo/places_sport.json` |
| sport | `lekeplass_kirsebarlunden` | Kirsebærlunden lekeplass | 2022 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `kongsberg_motorsenter` | Kongsberg Motorsenter |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `lyngasbanen` | Lyngåsbanen (historisk) | 1959 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `manglerudhallen` | Manglerudhallen | 1979 | `data/places/sport/oslo/places_sport.json` |
| sport | `momarken_bilbane` | Momarken Bilbane |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `naf_gokartsenter_andebu` | NAF Gokartsenter Andebu (Håsken) | 1993 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `nordre_aasen_idrettspark` | Nordre Åsen idrettspark | 1952 | `data/places/sport/oslo/places_sport.json` |
| sport | `lekeplass_olaf_ryes_plass` | Olaf Ryes plass lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lisbon_pavilhao_joao_rocha` | Pavilhão João Rocha | 2017 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `lisbon_pista_moniz_pereira` | Pista de Atletismo Professor Moniz Pereira | 2009 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| sport | `aktivitet_rudolf_nilsens_plass` | Rudolf Nilsens plass aktivitetspark | 2022 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `rudskogen_motorsenter` | Rudskogen Motorsenter | 1990 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `treningssted_skur13` | Skur 13 skate- og balansetrening |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lekeplass_snippen` | Snippen lekepark | 2018 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lekeplass_sofienbergparken` | Sofienbergparken lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `treningssted_sognsvann` | Sognsvann treningsrunde |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lekeplass_st_hanshaugen` | St. Hanshaugen lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `lekeplass_stensparken` | Stensparken lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `treningssted_torshovdalen` | Torshovdalen trenings- og aktivitetspark |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| sport | `valle_hovin_stadion` | Valle Hovin stadion | 1966 | `data/places/sport/oslo/places_sport.json` |
| sport | `vallhall_arena` | Vallhall Arena | 2001 | `data/places/sport/oslo/places_sport.json` |
| sport | `varna_kartring` | Varna Kartring | 1991 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| sport | `valerbanen` | Vålerbanen | 1990 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| subkultur | `lisbon_anjos70` | Anjos70 | 2015 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `lisbon_bairro_alto` | Bairro Alto | 1500 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `bla` | Blå | 1998 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `lisbon_crew_hassan` | Crew Hassan | 2007 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `lisbon_desterro` | Desterro | 2014 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `lisbon_fabrica_braco_de_prata` | Fábrica Braço de Prata | 2007 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `lisbon_galeria_ze_dos_bois` | Galeria Zé dos Bois (ZDB) | 1994 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `grunerlokka_bakgardsvegger` | Grünerløkka bakgårdsvegger | 2007 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `gronland_underganger` | Grønland underganger | 2008 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `hausmania` | Hausmania | 2001 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `hausmannsgate_aksen` | Hausmannsgate-aksen | 2000 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `kolstadgata_toyen_vegger` | Kolstadgata veggmiljø | 2016 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `kuba_akselpassasjer` | Kuba-passasjene ved Akerselva | 2009 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `lisbon_musicbox` | Musicbox Lisboa | 2006 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `nybrua_pilarrom` | Nybrua pilarrom | 2010 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `lisbon_pink_street` | Rua Nova do Carvalho / Pink Street | 2011 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `schweigaards_gate_lodalen` | Schweigaards gate–Lodalen veggakse | 2011 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `skur13` | Skur 13 | 2013 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `sofienbergparken_subkultur` | Sofienbergparken | 1980 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `stovnertarnet` | Stovnertårnet | 2017 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `torggata_blad` | Torggata Blad | 1990 | `data/places/subkultur/oslo/places_subkultur.json` |
| subkultur | `lisbon_village_underground` | Village Underground Lisboa | 2014 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| subkultur | `vulkan_murvegger` | Vulkan murvegger og passasjer | 2012 | `data/places/subkultur/oslo/places_subkultur.json` |
| vitenskap | `abelhaugen` | Abelhaugen | 1908 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `arkitektur_og_designhogskolen` | Arkitektur- og designhøgskolen i Oslo | 1945 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `lisbon_torre_do_tombo` | Arquivo Nacional da Torre do Tombo | 1990 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `bi_nydalen` | BI i Nydalen | 2005 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `lisbon_faculdade_de_ciencias` | Faculdade de Ciências da Universidade de Lisboa | 1911 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `forskningsparken` | Forskningsparken | 1989 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `gamlebyen_skole` | Gamlebyen skole | 1799 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `lisbon_instituto_higiene_medicina_tropical` | Instituto de Higiene e Medicina Tropical | 1902 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `lisbon_instituto_ricardo_jorge` | Instituto Nacional de Saúde Doutor Ricardo Jorge | 1899 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `lisbon_instituto_superior_tecnico` | Instituto Superior Técnico | 1911 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `lisbon_jardim_botanico_tropical` | Jardim Botânico Tropical | 1906 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `lisbon_laboratorio_nacional_engenharia_civil` | Laboratório Nacional de Engenharia Civil | 1946 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `meteorologisk_institutt` | Meteorologisk institutt | 1866 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `lisbon_museu_nacional_de_historia_natural_e_da_ciencia` | Museu Nacional de História Natural e da Ciência | 1858 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `nobelinstituttet` | Nobelinstituttet | 1905 | `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json` |
| vitenskap | `teknisk_museum` | Norsk Teknisk Museum | 1914 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `observatoriet` | Observatoriet | 1833 | `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json` |
| vitenskap | `lisbon_observatorio_astronomico` | Observatório Astronómico de Lisboa | 1861 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `oslo_met_pilestredet` | OsloMet, Pilestredet | 1994 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `lisbon_pavilhao_do_conhecimento` | Pavilhão do Conhecimento | 1999 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| vitenskap | `radiumhospitalet` | Radiumhospitalet | 1932 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `rikshospitalet` | Rikshospitalet | 1826 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `tvergastein` | Tvergastein | 1937 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `universitetet_i_oslo_blindern` | Universitetet i Oslo, Blindern | 1937 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `universitetets_gamle_hovedbygning` | Universitetets gamle hovedbygning | 1852 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| vitenskap | `universitetets_gamle_kjemi` | Universitetets gamle kjemibygning | 1865 | `data/places/vitenskap/oslo/places_vitenskap.json` |

## Prioritert shortlist for neste Stories-batch

Shortlisten er oppdatert etter batch 4 og inneholder bare steder som fortsatt mangler story. Den prioriterer kategorier med lav eller null dekning: særlig `natur`, `subkultur`, `media`, `naeringsliv` og `vitenskap`, med Lisboa samlet nederst som egen mulig batch.

| Prioritet | place_id | Navn | Kategori | Hvorfor nå | Mulig story-vinkel | Kildespor |
|---:|---|---|---|---|---|---|
| 1 | `alnaelva` | Alnaelva | natur | Null story-dekning i natur; elveløpet er et stort byøkologisk og industrihistorisk spor. | En natur-/byhistorisk story om hvordan Alna ble lagt om, skjult, renset og gjort lesbar igjen. | Oslo kommune; vann- og miljøetat; lokalhistoriske kilder; kart/fotoarkiv |
| 2 | `ostensjovannet` | Østensjøvannet | natur | Vernet våtmark med fugleliv og lang konflikt mellom byvekst, jordbruk og naturvern. | En story om innsjøen som naturarkiv og byens kamp om vann, fugl og randsoner. | Bymiljøetaten; Naturvernforbundet/lokale naturkilder; Artsdatabanken; historiske kart |
| 3 | `hovedoya` | Hovedøya | natur | Øylandskapet kan binde natur, klosterruiner, militærhistorie og friluftsliv sammen. | En story om hvordan én øy rommer kalknatur, kloster, forsvar og sommerby. | Oslo kommune; Byantikvaren; Naturbase; Oslo byleksikon |
| 4 | `maridalsvannet` | Maridalsvannet | natur | Drikkevannskilde og landskap med tydelige grenser mellom by, marka og vannforsyning. | En story om vannet som usynlig infrastruktur: hvorfor byen verner om Maridalen. | Vann- og avløpsetaten; Marka-/vannverkshistorie; kommunale planer; fotoarkiv |
| 5 | `ljanselva` | Ljanselva | natur | Elvedal og biologisk korridor med god ruteverdi og null kategoridekning. | En story om å følge et lite vassdrag fra marka mot fjorden og lese natur i byen. | Oslo kommune; lokale elveforum; Naturbase; historiske kart |
| 6 | `hausmania` | Hausmania | subkultur | Subkultur har fortsatt null dekning; Hausmania er et tydelig sted for okkupasjon, atelierer og alternativ kultur. | En story om hvordan et husmiljø ble kulturpolitisk konflikt og fristed. | Hausmania-arkiv/nettsider; Oslo kommune; pressearkiv; intervjuer |
| 7 | `bla` | Blå | subkultur | Konsert- og klubbhistorie ved Akerselva gir en synlig inngang til undergrunnskultur. | En story om elvekanten som ble nattlig musikk- og kulturrom. | Scene-/programarkiv; musikkpresse; Oslo byleksikon; fotoarkiv |
| 8 | `skur13` | Skur 13 | subkultur | Skate- og havnebygg gir fysisk, spillbar subkultur og byromstransformasjon. | En story om hvordan lager- og kaikultur ble rulleflate, trening og ungdomsrom. | Oslo Havn/kommune; skate-miljø; pressearkiv; fotoarkiv |
| 9 | `torggata_blad` | Torggata Blad | subkultur | Tegneserie-/fanzinekultur gir en annen type kulturhistorie enn institusjonene. | En story om gate, trykk, småforlag og alternativ offentlighet. | Utgiver-/miljøarkiv; Nasjonalbiblioteket; intervjuer; pressearkiv |
| 10 | `sofienbergparken_subkultur` | Sofienbergparken | subkultur | Parken kan knyttes til uformell bybruk, musikk, møteplasser og nabolagsidentitet. | En story om parken som hverdagsarena for subkultur og lokalt offentlig rom. | Kommunale parkdata; lokalhistorie; pressearkiv; fotoarkiv |
| 11 | `aftenposten_akersgata` | Aftenposten i Akersgata | media | Media har fortsatt lav dekning; Akersgata er en konkret presseakse med lang offentlighetshistorie. | En story om avishuset som nyhetsmaskin, trykkested og maktpunkt i sentrum. | Aftenposten-arkiv; Oslo byleksikon; pressehistorie; fotoarkiv |
| 12 | `vg_huset` | VG-huset | media | VG-huset gir tabloidisering, pressefoto og riksnyheter et fysisk sted. | En story om hvordan nyheter ble produsert, frontet og solgt fra Akersgata. | VG-arkiv; mediehistorie; pressearkiv; fotoarkiv |
| 13 | `dagbladet_akersgata` | Dagbladet i Akersgata | media | Dagbladet supplerer Akersgata som pressegeografi med kultur-, politikk- og tabloidspor. | En story om redaksjonskultur, avisforsider og offentlig debatt i ett kvartal. | Dagbladet-arkiv; Nasjonalbiblioteket; mediehistorie; fotoarkiv |
| 14 | `klassekampen_redaksjon` | Klassekampen-redaksjonen (Hausmanns gate) | media | Redaksjonen gir politisk pressehistorie og en tydelig kontrast til de store mediehusene. | En story om avis, ideologi og offentlighet fra redaksjonslokaler på Hausmanns gate. | Klassekampen-arkiv; pressehistoriske kilder; intervjuer; avisarkiv |
| 15 | `oslo_gassverk` | Oslo Gassverk | naeringsliv | Næringsliv har fortsatt lav dekning; gassverket gjør energi, industri og byvekst konkret. | En story om lys, varme, lukt og industriell infrastruktur i byen. | Oslo byleksikon; teknisk/kommunal historie; Byantikvaren; fotoarkiv |
| 16 | `telegrafbygningen` | Telegrafbygningen | naeringsliv | Kommunikasjonsteknologi og monumental arkitektur gir en klar næringslivs-/infrastrukturstory. | En story om kabler, telegrafi og hvordan informasjon ble byens moderne vare. | Telenor-/telemuseumskilder; Byantikvaren; Oslo byleksikon; fotoarkiv |
| 17 | `ringnes_bryggeri` | Ringnes bryggeri | naeringsliv | Bryggerihistorie kan utvide etter Schous uten å gjenta samme sted. | En story om industri, merkevare og ølkultur fra bryggerikvartalet. | Ringnes-/bryggeriarkiv; Oslo byleksikon; industrihistorie; fotoarkiv |
| 18 | `myrens_verksted` | Myrens Verksted | naeringsliv | Akerselva-industri er fysisk lesbar og kan koble produksjon, arbeid og transformasjon. | En story om verksted, vannkraft, maskiner og ny bruk langs elva. | Oslo byleksikon; industrihistorie; Byantikvaren; fotoarkiv |
| 19 | `universitetets_gamle_kjemi` | Universitetets gamle kjemibygning | vitenskap | Vitenskap har lav dekning; stedet har et konkret forskningsgjennombrudd knyttet til massevirkningsloven. | En story om laboratoriet der eksperimenter, matematikk og kjemihistorie møttes. | UiO-historie; kjemihistoriske artikler; SNL; universitetets arkiv |
| 20 | `observatoriet` | Observatoriet | vitenskap | Astronomi, presis tid og universitetsbygg gir tydelig vitenskapshistorisk play-verdi. | En story om meridianer, stjernemåling og tid i den tidlige universitetsbyen. | UiO Museum for universitets- og vitenskapshistorie; Oslo byleksikon; astronomihistorie; instrumentkataloger |
| 21 | `teknisk_museum` | Norsk Teknisk Museum | vitenskap | Museum og teknologihistorie kan gjøre norsk industri, transport og hverdagsmaskiner spillbare. | En story om hvordan teknologi ble samlet, vist fram og forklart for publikum. | Norsk Teknisk Museum; museumskataloger; teknologihistorie; fotoarkiv |
| 22 | `meteorologisk_institutt` | Meteorologisk institutt | vitenskap | Værvarsling gir en konkret kobling mellom vitenskap, samfunnssikkerhet og hverdag. | En story om målinger, varsler og hvordan været ble en offentlig tjeneste. | Meteorologisk institutt; UiO/meteorologihistorie; SNL; arkivfoto |
| 23 | `lisbon_bairro_alto` | Bairro Alto | subkultur | Lisboa kan samles som egen batch; Bairro Alto gir nattliv, fado og byrom med høy ruteverdi. | En Lisboa-story om smale gater som kultur- og nattlivsmaskin. | Lisboa kommunale kilder; kulturhistorie; musikk-/utelivskilder; fotoarkiv |
| 24 | `lisbon_lx_factory` | LX Factory | naeringsliv | Lisboa-kandidat med industriell transformasjon fra fabrikk til kreativt næringsområde. | En story om fabrikk, gjenbruk og ny byøkonomi under broen. | LX Factory; Lisboa byhistorie; industrihistoriske kilder; pressearkiv |
| 25 | `lisbon_observatorio_astronomico` | Observatório Astronómico de Lisboa | vitenskap | Lisboa-vitenskap med tydelig institusjon, instrumenter og bynær plassering. | En story om observasjon, presis tid og vitenskapelig infrastruktur i Lisboa. | Observatoriet/institusjonskilder; universitetskilder; vitenskapshistorie; fotoarkiv |
| 26 | `lisbon_jardim_botanico` | Jardim Botânico de Lisboa | natur | Lisboa-natur kan gi en egen internasjonal natur-/vitenskapsrute. | En story om botanisk samling, koloniale plantebaner og grønt byrom. | Universitetet/museet; botaniske kilder; Lisboa byhistorie; hagehistorie |

## Anbefalt neste batch

Anbefalt neste Stories-batch bør være **20–30 stories** og bør ikke gjenta batch 4-stedene som nå er dekket. For best balanse anbefales:

1. **Første del: natur og subkultur i Oslo** — `alnaelva`, `ostensjovannet`, `hovedoya`, `maridalsvannet`, `ljanselva`, `hausmania`, `bla`, `skur13`, `torggata_blad`, `sofienbergparken_subkultur`. Dette løfter to kategorier som fortsatt har **0.0%** story-dekning.
2. **Andre del: media, næringsliv og vitenskap i Oslo** — `aftenposten_akersgata`, `vg_huset`, `dagbladet_akersgata`, `klassekampen_redaksjon`, `oslo_gassverk`, `telegrafbygningen`, `ringnes_bryggeri`, `myrens_verksted`, `universitetets_gamle_kjemi`, `observatoriet`, `teknisk_museum`, `meteorologisk_institutt`. Dette øker kategorier som fortsatt ligger lavt etter batch 4.
3. **Tredje del: Lisboa som egen batch eller delbatch** — `lisbon_bairro_alto`, `lisbon_lx_factory`, `lisbon_observatorio_astronomico`, `lisbon_jardim_botanico` kan starte en tydelig internasjonal rute. Lisboa bør helst samles som egen batch dersom Oslo-dekningen prioriteres først.

Batch 4-kontrollen bekrefter at `prinds_christian_augusts_minde`, `middelalder_oslo`, `oslo_ladegard`, `nrk_huset_marienlyst`, `hartvig_nissens_skole_skam`, `ekebergsletta`, `botanisk_hage`, `havnelageret`, `schous_bryggeri`, `villa_grande` alle returnerer minst én manifest-lastet story. Før skriving bør hvert kandidatsted få en kort research-note med minst to uavhengige kilder eller én primær-/institusjonskilde pluss én uavhengig sekundærkilde. Rapporten foreslår ikke nye story-tekster og gjør ingen dataendringer.
