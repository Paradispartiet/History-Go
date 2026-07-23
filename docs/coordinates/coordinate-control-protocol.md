# Protokoll for koordinatkontroll

Sist oppdatert: 2026-07-23

Dette dokumentet er den løpende protokollen for manuell koordinatkontroll. Det viser hvilke steder som faktisk er kontrollert, hvilken status som er godtatt, og hvilket stabilt kildeobjekt som støtter avgjørelsen. Protokollen utfyller koordinatkontrakten og evidensfilene; den erstatter dem ikke.

## Føringsregler

- Før inn en rad først etter at kildefilen og den genererte runtime-indeksen er sammenlignet.
- Bruk kanonisk `placeId`, ikke bare visningsnavnet.
- `verified`, `verified_geometry` og `verified_historical_source` betyr at stedet oppfyller `coordinate-source-contract-v1.md`.
- Et ikke-verifisert resultat er likevel en fullført kontroll når kildekonflikten er dokumentert. Det skal ikke telles som en verifisert koordinat.
- Hvis en senere kontroll endrer koordinat eller identitet, oppdateres den eksisterende raden, og korrigerende PR føres under tabellen.
- Hver fullførte batch skal passere source/runtime-paritet, indekssynk, kvalitetsporten, strict-new intake, split-manifest-revisjon og evidensrevisjon når evidensfiler er involvert.
- Hver fullført koordinatbatch skal føres i denne protokollen i samme PR som kontrollen, eller i en umiddelbar dokumentasjons-PR før neste koordinatbatch starter. Protokollen skal aldri ligge etter den faktiske kontrollrekken.
- `needs_review`-resultater som avslutter en konkret kontroll skal dokumenteres i egen tabell med årsaken til at ingen koordinat ble godkjent.

## Oslo

Oslo-protokollen dekker nå 419 aktive current `verified*` canonical Oslo-steder.

| batch | placeId | navn | godkjent status | kildeobjekt |
|---:|---|---|---|---|
| 1 | `nasjonalmuseet` | Nasjonalmuseet | verified | `geonorge-adresser-v1:0301:18199:3` |
| 1 | `munch_museet` | MUNCH | verified | `geonorge-adresser-v1:0301:21680:1` |
| 1 | `astrup_fearnley` | Astrup Fearnley Museet | verified | `geonorge-adresser-v1:0301:21458:2` |
| 1 | `nasjonalbiblioteket` | Nasjonalbiblioteket | verified | `geonorge-adresser-v1:0301:21471:110` |
| 1 | `vg_huset` | VG-huset | verified | `geonorge-adresser-v1:0301:10069:55` |
| 1 | `nrk_huset_marienlyst` | NRK-huset på Marienlyst | verified | `geonorge-adresser-v1:0301:10722:1` |
| 1 | `deichman_grunerlokka` | Deichman Grünerløkka | verified | `geonorge-adresser-v1:0301:16240:10` |
| 1 | `deichman_bjorvika` | Deichman Bjørvika | verified | `geonorge-adresser-v1:0301:21670:1` |
| 2 | `det_norske_teatret` | Det Norske Teatret | verified | `geonorge-adresser-v1:0301:13973:8` |
| 2 | `rockefeller` | Rockefeller Music Hall | verified | `geonorge-adresser-v1:0301:14618:5B` |
| 2 | `john_dee` | John Dee | verified | `geonorge-adresser-v1:0301:14618:5A` |
| 2 | `sentrum_scene` | Sentrum Scene | verified | `geonorge-adresser-v1:0301:10210:1` |
| 3 | `oslo_s` | Oslo S | verified | `geonorge-adresser-v1:0301:13444:1` |
| 3 | `vulkan_energisentral` | Vulkan energisentral | verified | `geonorge-adresser-v1:0301:21649:5` |
| 3 | `gronland_kirke` | Grønland kirke | verified | `geonorge-adresser-v1:0301:12450:34` |
| 3 | `kampen_kirke` | Kampen kirke | verified | `geonorge-adresser-v1:0301:10988:1` |
| 3 | `oslo_bussterminal` | Oslo bussterminal | verified | `geonorge-adresser-v1:0301:16260:10` |
| 4 | `operahuset` | Operahuset | verified | `geonorge-adresser-v1:0301:21493:1` |
| 4 | `oslo_domkirke` | Oslo domkirke | verified | `geonorge-adresser-v1:0301:17083:1` |
| 4 | `slottet` | Det kongelige slott | verified | `geonorge-adresser-v1:0301:21608:1` |
| 4 | `sofienberg_kirke` | Sofienberg kirke | verified | `geonorge-adresser-v1:0301:15821:18` |
| 4 | `gamle_aker_kirke` | Gamle Aker kirke | verified | `geonorge-adresser-v1:0301:10057:26` |
| 5 | `chateau_neuf` | Chateau Neuf | verified | `geonorge-adresser-v1:0301:16621:15` |
| 5 | `litteraturhuset` | Litteraturhuset | verified | `geonorge-adresser-v1:0301:18496:29` |
| 5 | `nationaltheatret` | Nationaltheatret | verified | `geonorge-adresser-v1:0301:20681:1` |
| 5 | `tronsmo_bokhandel` | Tronsmo Bokhandel | verified | `geonorge-adresser-v1:0301:17999:12` |
| 5 | `folketeateret` | Folketeateret | verified | `geonorge-adresser-v1:0301:18554:2` |
| 6 | `gronland_basarene` | Grønland basarene | verified | `geonorge-adresser-v1:0301:17875:2` |
| 6 | `mollergata_19` | Møllergata 19 | verified | `geonorge-adresser-v1:0301:14943:19` |
| 6 | `villa_grande` | Villa Grande | verified | `geonorge-adresser-v1:0301:13153:56` |
| 7 | `blaa` | Blå | verified_geometry | `osm-node:4312299494` |
| 7 | `tinghuset` | Oslo tinghus | verified | `geonorge-adresser-v1:0301:11017:4` |
| 7 | `bogstad_gard` | Bogstad gård | verified_geometry | `osm-way:219498663` |
| 7 | `salt` | SALT | verified_geometry | `osm-node:6677384187` |
| 7 | `tollbukaia` | Tollbukaia | verified_historical_source | `oslobyleksikon:tollbukaia` |
| 7 | `akershus_kaier` | Akershuskaiene | verified_geometry | `osm-way:4252516` |
| 7 | `oslo_mek` | Akers mekaniske Verksted | verified_historical_source | `oslobyleksikon:akers-mek-verksted` |
| 8 | `folkeobservatoriet_holmenkollen` | Folkeobservatoriet | verified | `geonorge-adresser-v1:0301:13070:119` |
| 8 | `kjeglebanen_langgaardslokken` | Kjeglebanen på Langgaardsløkken | verified | `geonorge-adresser-v1:0301:10898:21` |
| 8 | `radmannsgarden_og_anatomibygget` | Rådmannsgården og Anatomibygget | verified | `geonorge-adresser-v1:0301:16115:19` |
| 8 | `magistratgarden` | Magistratgården | verified | `geonorge-adresser-v1:0301:11309:11` |
| 8 | `hauges_minde` | Hauges Minde | verified | `geonorge-adresser-v1:0301:15331:2` |
| 8 | `slurpen_lakkegata` | Slurpen | verified | `geonorge-adresser-v1:0301:14097:79C` |
| 8 | `geitmyra_gard` | Geitmyra gård | verified | `geonorge-adresser-v1:0301:17894:2` |
| 9 | `gronland_politistasjon` | Grønland politistasjon | verified | `geonorge-adresser-v1:0301:17872:5` |
| 9 | `toyen_trafo` | Tøyen trafo | verified | `geonorge-adresser-v1:0301:13143:1` |
| 9 | `honse_lovisas_hus` | Hønse-Lovisas hus | verified | `geonorge-adresser-v1:0301:16161:2` |
| 9 | `sagene_festivitetshus` | Sagene festivitetshus | verified | `geonorge-adresser-v1:0301:13102:3` |
| 9 | `etterstadgata_6` | Etterstadgata 6 | verified | `geonorge-adresser-v1:0301:11631:6` |
| 9 | `villa_furulund` | Villa Furulund | verified | `geonorge-adresser-v1:0301:12855:5` |
| 9 | `villa_romsli` | Villa Romsli | verified | `geonorge-adresser-v1:0301:15318:83` |
| 10 | `stubljan_paviljongen_hvervenbukta` | Stubljan-paviljongen i Hvervenbukta | verified | `geonorge-adresser-v1:0301:12168:4C` |
| 10 | `trosterudvillaen` | Trosterudvillaen | verified | `geonorge-adresser-v1:0301:11287:28D` |
| 10 | `sporveismuseet` | Sporveismuseet | verified | `geonorge-adresser-v1:0301:12188:15` |
| 10 | `saxegarden` | Saxegården | verified | `geonorge-adresser-v1:0301:16210:17` |
| 10 | `ovre_fossum_gard` | Øvre Fossum gård | verified | `geonorge-adresser-v1:0301:15338:130` |
| 10 | `lambertseter_gard` | Lambertseter gård | verified | `geonorge-adresser-v1:0301:14120:2B` |
| 10 | `nordre_skoyen_hovedgard` | Nordre Skøyen hovedgård | verified | `geonorge-adresser-v1:0301:15665:17` |
| 11 | `lokomotivverkstedet` | Lokomotivverkstedet | verified | `geonorge-adresser-v1:0301:10641:16` |
| 11 | `tveten_gard` | Tveten gård | verified | `geonorge-adresser-v1:0301:17852:101` |
| 11 | `torggata` | Torggata | verified_geometry | `oslobyleksikon:torggata` |
| 11 | `bispelokket` | Bispelokket / Trafikkmaskinen | verified_historical_source | `regjeringen:stmeld-28-2001-2002:bispelokket` |
| 11 | `karl_johan` | Karl Johans gate | verified_geometry | `oslobyleksikon:karl-johans-gate` |
| 11 | `radhusplassen` | Rådhusplassen | verified_geometry | `oslo-kommune:fjordbyen:radhusplassen` |
| 11 | `bjorvika` | Bjørvika | verified_geometry | `oslo-kommune:fjordbyen:bjorvika` |
| 12 | `grunerlokka_helgesens_tm` | Grünerløkka – Helgesens / Thorvald Meyers | verified_geometry | `oslobyleksikon:thorvald-meyers-gate:helgesens-gate-corner` |
| 12 | `toyen_torg` | Tøyen torg | verified_geometry | `oslo-kommune:byplan:toyen-torg` |
| 12 | `majorstuen_krysset` | Majorstuen krysset | verified_geometry | `oslobyleksikon:valkyriegata:majorstukrysset` |
| 12 | `st_hanshaugen_park` | St. Hanshaugen park | verified_geometry | `oslo-kommune:park:st-hanshaugen` |
| 12 | `aker_brygge` | Aker Brygge | verified_geometry | `oslo-kommune:fjordbyen:aker-brygge` |
| 13 | `tigeren` | Tigerstatuen | verified_geometry | `osm-node:3578576333` |
| 13 | `jernbanetorget` | Jernbanetorget | verified_geometry | `osm-way:10576072` |
| 13 | `helsfyr` | Helsfyr | verified_geometry | `osm-node:5218231670` |
| 13 | `bogstadveien` | Bogstadveien | verified_geometry | `oslobyleksikon:bogstadveien` |
| 13 | `markveien` | Markveien | verified_geometry | `oslobyleksikon:markveien` |
| 13 | `gronlandsleiret` | Grønlandsleiret | verified_geometry | `oslobyleksikon:gronlandsleiret` |
| 13 | `storgata` | Storgata | verified_geometry | `oslobyleksikon:storgata` |
| 14 | `slottsparken` | Slottsparken | verified_geometry | `royalcourt:palace-park` |
| 14 | `botsparken` | Botsparken | verified_geometry | `oslo-kommune:park:gronland-park-klosterenga` |
| 14 | `stensparken` | Stensparken | verified_geometry | `oslo-kommune:parks:stensparken` |
| 14 | `nydalen` | Nydalen | verified_geometry | `oslobyleksikon:nydalen` |
| 14 | `tjuvholmen` | Tjuvholmen | verified_geometry | `oslo-kommune:fjordbyen:tjuvholmen` |
| 14 | `sorenga` | Sørenga | verified_geometry | `oslo-kommune:bjorvika:sorenga` |
| 14 | `majorstuen_tbanestasjon` | Majorstuen T-banestasjon | verified_geometry | `osm-node:2274012035` |
| 15 | `nationaltheatret_stasjon` | Nationaltheatret stasjon | verified_geometry | `osm-node:5218231660+1759965001` |
| 15 | `olaf_ryes_plass` | Olaf Ryes plass | verified_geometry | `oslo-kommune:park:olaf-ryes-plass` |
| 15 | `birkelunden` | Birkelunden | verified_geometry | `osm-way:3236549` |
| 15 | `akerselva` | Akerselva | verified_geometry | `oslo-kommune:river:akerselva` |
| 15 | `universitetsplassen` | Universitetsplassen | verified_geometry | `oslobyleksikon:universitetsplassen` |
| 15 | `barcode` | Barcode | verified_geometry | `osm-node:8071120191` |
| 16 | `vigelandsparken` | Vigelandsparken | verified_geometry | `vigelandmuseet:vigeland-park` |
| 16 | `voienvolden` | Vøienvolden | verified | `geonorge-adresser-v1:0301:14622:120` |
| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `oslobyleksikon:carl-berners-plass` |
| 16 | `tullin` | Tullin | verified_geometry | `osm-way:666946874` |
| 16 | `okern` | Økern | verified_geometry | `oslobyleksikon:okern-strok` |
| 16 | `skoyen` | Skøyen | verified_geometry | `oslobyleksikon:skoyen-strok` |
| 16 | `torshov` | Torshov | verified_geometry | `oslobyleksikon:torshov-strok` |
| 17 | `grorud` | Grorud | verified_geometry | `oslobyleksikon:grorud-strok` |
| 17 | `sagene` | Sagene | verified_geometry | `oslobyleksikon:sagene-strok` |
| 17 | `saga_kino` | Saga kino | verified | `geonorge-adresser-v1:0301:17079:28` |
| 17 | `klingenberg_kino` | Klingenberg kino | verified | `geonorge-adresser-v1:0301:20950:4` |
| 17 | `gimle_kino` | Gimle kino | verified | `geonorge-adresser-v1:0301:10967:39` |
| 17 | `vika_kino` | Vika kino | verified | `geonorge-adresser-v1:0301:16038:14` |
| 18 | `middelalder_oslo` | Middelalderparken | verified_geometry | `oslo-kommune:kultureiendom:middelalderparken` |
| 18 | `gamlebyen_gravlund` | Gamlebyen gravlund | verified_geometry | `oslo-kommune:gravplass:gamlebyen` |
| 18 | `akershus_festning` | Akershus festning | verified_geometry | `forsvarsbygg:akershus-festning` |
| 18 | `var_frelsers_gravlund` | Vår Frelsers gravlund | verified_geometry | `oslo-kommune:gravplass:var-frelsers` |
| 18 | `hovedoya_kloster` | Hovedøya kloster | verified_geometry | `osm-way:457724681` |
| 19 | `sagene_skole` | Sagene skole | verified | `geonorge-adresser-v1:0301:10585:2` |
| 19 | `damstredet_telthusbakken` | Damstredet og Telthusbakken | verified_geometry | `oslobyleksikon:damstredet+telthusbakken` |
| 19 | `gamle_trikkestallen` | Gamle trikkestallen på Sagene | verified | `geonorge-adresser-v1:0301:17667:33` |
| 19 | `trefoldighetskirken` | Trefoldighetskirken | verified | `geonorge-adresser-v1:0301:10069:60` |
| 19 | `nonneseter_kloster` | Nonneseter kloster | verified_historical_source | `oslobyleksikon:nonneseter` |
| 19 | `oslo_ladegard` | Oslo ladegård | verified | `geonorge-adresser-v1:0301:15449:13` |
| 19 | `galgeberg` | Galgeberg | verified_historical_source | `oslobyleksikon:galgeberg-rettersted` |
| 20 | `oslo_hospital` | Oslo Hospital | verified_geometry | `osm-way:111555053` |
| 20 | `botsfengselet` | Botsfengselet | verified | `geonorge-adresser-v1:0301:18780:11` |
| 20 | `gamle_radhus` | Gamle Rådhus | verified | `geonorge-adresser-v1:0301:15006:1` |
| 21 | `ekebergparken` | Ekebergparken skulpturpark | verified_geometry | `ekebergparken:official-map` |
| 21 | `camilla_collett_statue` | Camilla Collett-statuen | verified_geometry | `osm-node:7573449468` |
| 21 | `henrik_wergeland_statue` | Henrik Wergeland-statuen | verified_geometry | `oslo-museum:OB.A17403` |
| 21 | `grotta` | Grotten | verified | `geonorge-adresser-v1:0301:18496:4` |
| 21 | `eldorado_bokhandel` | Eldorado Bokhandel | verified | `geonorge-adresser-v1:0301:17635:9A` |
| 21 | `gamle_deichman` | Gamle Deichman | verified | `geonorge-adresser-v1:0301:10244:4` |
| 22 | `klassekampen_redaksjon` | Klassekampen-redaksjonen | verified | `geonorge-adresser-v1:0301:12446:4` |
| 22 | `oslo_gassverk` | Oslo Gassverk | verified_historical_source | `oslobyleksikon:gassverket:storgata-36c` |
| 22 | `oslo_posthus` | Oslo Posthus / Hovedpostkontoret | verified | `geonorge-adresser-v1:0301:11309:15` |
| 22 | `telegrafbygningen` | Telegrafbygningen | verified_geometry | `osm-relation:13931026` |
| 23 | `vinmonopolet_lager` | Vinmonopolets hovedlager | verified | `geonorge-adresser-v1:0301:12723:16` |
| 23 | `jernbaneverkstedet_lodalen` | Lodalen jernbaneverksted | verified | `geonorge-adresser-v1:0301:11370:2` |
| 23 | `grunnlovsbygget_bankplassen` | Den gamle Norges Bank | verified | `geonorge-adresser-v1:0301:10412:3` |
| 24 | `ovre_foss` | Øvre Foss – Hjula Veveri | verified_historical_source | `kulturminnesok:164747` |
| 24 | `schous_bryggeri` | Schous bryggeri | verified | `geonorge-adresser-v1:0301:17749:2` |
| 24 | `ringnes_bryggeri` | Ringnes bryggeri | verified | `geonorge-adresser-v1:0301:17489:2A` |
| 24 | `akershus_slott_bakeriet` | Bakeriet ved Akershus | verified_geometry | `osm-way:669390521` |
| 26 | `myrens_verksted` | Myrens Verksted | verified_geometry | `osm-way:99757039` |
| 26 | `christiania_seildugsfabrik` | Christiania Seildugsfabrik | verified | `geonorge-adresser-v1:0301:11891:24` |
| 27 | `ullevål_hageby` | Ullevål Hageby | verified_geometry | `osm-node:1125978057` |
| 27 | `romsaås` | Romsås | verified_geometry | `osm-node:963813366` |
| 27 | `rodelokka` | Rodeløkka | verified_geometry | `osm-node:1290871351` |
| 27 | `vaalerenga` | Vålerenga | verified_geometry | `osm-node:366154118` |
| 27 | `vinderen` | Vinderen | verified_geometry | `osm-node:1125573258` |
| 27 | `ullern` | Ullern | verified_geometry | `osm-node:1370932493` |
| 27 | `spikersuppa` | Spikersuppa | verified_geometry | `osm-relation:11158886` |
| 28 | `bankplassen` | Bankplassen | verified_geometry | `osm-relation:12044741` |
| 28 | `christiania_torv` | Christiania Torv | verified_geometry | `osm-way:594329484` |
| 29 | `kulturkirken_jakob_litteratur` | Kulturkirken Jakob | verified | `geonorge-adresser-v1:0301:12782:14` |
| 29 | `ruth_maier_minne` | Ruth Maier-minnesmerke | verified | `geonorge-adresser-v1:0301:11153:3` |
| 30 | `oscar_braaten_statuen` | Oskar Braaten-bysten | verified_geometry | `osm-node:10819902960` |
| 30 | `alexander_kiellands_plass` | Alexander Kiellands plass | verified_geometry | `osm-way:3610607` |
| 31 | `alnabru_jernbane_og_logistikk` | Alnabru godsterminal | verified_geometry | `osm-way:84268939` |
| 32 | `nydalsdammen` | Nydalsdammen | verified_geometry | `osm-relation:14637129` |
| 32 | `bjoelsenfossen` | Bjølsenfossen | verified_geometry | `osm-node:10679414566` |
| 32 | `bjoelsenparken_elvenaer` | Advokat Dehlis plass – grøntarealet | verified_geometry | `osm-way:336602343` |
| 33 | `glads_molle` | Glads mølle | verified | `geonorge-adresser-v1:0301:16161:10A` |
| 33 | `voien_gard_voienvolden` | Vøienvolden gård | verified | `geonorge-adresser-v1:0301:14622:120` |
| 33 | `myralokka` | Myraløkka | verified_geometry | `osm-way:4648305` |
| 33 | `kuba_parken` | Kuba-parken | verified_geometry | `osm-relation:1103963` |
| 33 | `beierbrua` | Beierbrua | verified_geometry | `osm-way:532768329` |
| 33 | `nedre_foss` | Nedre Foss | verified_geometry | `osm-node:4171862592` |
| 34 | `vulkan_industriomrade` | Vulkan industriområde | verified | `geonorge-adresser-v1:0301:14622:17` |
| 34 | `hausmannsbrua` | Hausmannsbrua | verified_geometry | `osm-way:377766486` |
| 34 | `ankerbrua` | Ankerbrua | verified_geometry | `osm-way:381749949` |
| 35 | `vaterland_historisk_elvelop` | Vaterland – historisk elveløp | verified_historical_source | `oslobyleksikon:akerselva:vaterlands-bru` |
| 35 | `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | verified_geometry | `osm-way:246047712` |
| 36 | `prinds_christian_augusts_minde` | Prinds Christian Augusts Minde | verified_historical_source | `prindsen:official-documentation` |
| 36 | `hartvig_nissens_skole_skam` | Hartvig Nissens skole (SKAM) | verified_geometry | `osm-node:325636287` |
| 36 | `inger_hagerups_plass` | Inger Hagerups plass | verified | `lokalhistoriewiki:inger-hagerups-plass` |
| 37 | `norli_universitetsgata` | Norli Universitetsgata | verified_geometry | `osm-node:1664967174` |
| 37 | `bankall_gard` | Bånkall gård | verified_geometry | `osm-relation:11788354` |
| 37 | `frysja_33_brekke_kraftstasjon` | Frysja 33 – Brekke kraftstasjon | verified | `geonorge-adresser-v1:0301:13747:151C` |
| 38 | `bislett` | Bislett | verified_geometry | `osm-node:1126526860` |
| 38 | `st_halvard_bryggeri` | St. Halvard bryggeri | verified_historical_source | `oslobyleksikon:st-halvards-bryggeri` |
| 39 | `grensen_kjopesenter` | Grensen – handelsgate | verified_geometry | `oslobyleksikon:grensen` |
| 40 | `trikk_17_18` | Trikkelinje 17/18 | verified_geometry | `ruter:tram-lines:17+18:2026-04-20` |
| 41 | `norges_hjemmefrontmuseum` | Norges Hjemmefrontmuseum | verified_geometry | `osm-way:111833902` |
| 41 | `forsvarsmuseet` | Forsvarsmuseet | verified_geometry | `osm-way:54830211` |
| 41 | `roseslottet` | Roseslottet | verified_geometry | `osm-way:1004591108` |
| 42 | `norsk_folkemuseum` | Norsk Folkemuseum | verified | `geonorge-adresser-v1:0301:14899:10` |
| 42 | `norsk_maritimt_museum` | Norsk Maritimt Museum | verified | `geonorge-adresser-v1:0301:10977:37` |
| 42 | `historisk_museum` | Historisk museum | verified | `geonorge-adresser-v1:0301:11941:2` |
| 43 | `frogner_hovedgard` | Frogner hovedgård | verified | `geonorge-adresser-v1:0301:12613:58` |
| 43 | `arbeidermuseet` | Arbeidermuseet | verified | `geonorge-adresser-v1:0301:16135:28` |
| 43 | `nobels_fredssenter` | Nobels Fredssenter | verified | `geonorge-adresser-v1:0301:18199:1` |
| 44 | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | verified_geometry | `osm-way:669390505` |
| 45 | `kunstnernes_hus` | Kunstnernes Hus | verified | `geonorge-adresser-v1:0301:18496:17` |
| 45 | `vigelandmuseet` | Vigelandmuseet | verified | `geonorge-adresser-v1:0301:15080:32` |
| 45 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |
| 46 | `vippetangen_fisketorg` | Fiskehallen på Vippetangen | verified | `geonorge-adresser-v1:0301:10077:23` |
| 47 | `lilleborg_fabrikker` | Lilleborg Fabrikker | verified | `geonorge-adresser-v1:0301:16161:54` |
| 48 | `tbs_gallery` | TBS Gallery | verified | `geonorge-adresser-v1:0301:15439:23` |
| 48 | `viking_planet_oslo` | The Viking Planet Oslo | verified | `geonorge-adresser-v1:0301:11993:4` |
| 48 | `the_salmon_vitensenter` | The Salmon – kunnskapssenter | verified | `geonorge-adresser-v1:0301:21458:11` |
| 49 | `jodisk_museum_oslo` | Jødisk Museum i Oslo | verified | `geonorge-adresser-v1:0301:11019:15B` |
| 49 | `det_internasjonale_barnekunstmuseet` | Det internasjonale Barnekunstmuseet | verified | `geonorge-adresser-v1:0301:14283:4` |
| 50 | `ibsen_museum_teater` | IBSEN Museum & Teater | verified | `geonorge-adresser-v1:0301:21471:26` |
| 51 | `oslo_reptilpark` | Oslo Reptilpark | verified | `geonorge-adresser-v1:0301:16935:2` |
| 52 | `toyenbadet` | Tøyenbadet | verified | `geonorge-adresser-v1:0301:12860:90` |
| 53 | `ekt_rideskole_husdyrpark` | EKT Rideskole og Husdyrpark | verified | `geonorge-adresser-v1:0301:11462:99` |
| 54 | `dronning_sonja_kunststall` | Dronning Sonja KunstStall | verified | `geonorge-adresser-v1:0301:15614:50` |
| 55 | `holmlia_bad` | Holmlia bad | verified | `geonorge-adresser-v1:0301:13084:34` |
| 56 | `skimore_oslo` | Skimore Oslo | verified | `geonorge-adresser-v1:0301:17787:64` |
| 56 | `oslo_kraftselskap` | Oslo Lysverkers hovedkontor | verified | `geonorge-adresser-v1:0301:16854:1` |
| 57 | `fagerborg_kirke` | Fagerborg kirke | verified | `geonorge-adresser-v1:0301:15670:74` |
| 58 | `uranienborg_kirke` | Uranienborg kirke | verified | `geonorge-adresser-v1:0301:13110:15` |
| 59 | `frogner_kirke` | Frogner kirke | verified | `geonorge-adresser-v1:0301:10967:36` |
| 60 | `vestre_gravlund` | Vestre gravlund | verified_geometry | `osm-way:4740772` |
| 61 | `brannmuseet_oslo` | Brannmuseet i Oslo | verified | `geonorge-adresser-v1:0301:12450:32` |
| 62 | `skoytemuseet` | Skøytemuseet | verified | `geonorge-adresser-v1:0301:14742:26` |
| 63 | `vikaterrassen` | Vikaterrassen | verified_geometry | `osm-relation:14169568` |
| 64 | `kampen_okologiske_barnebondegard` | Kampen Økologiske Barnebondegård | verified | `geonorge-adresser-v1:0301:16443:23` |
| 65 | `klimahuset` | Klimahuset | verified | `geonorge-adresser-v1:0301:14797:12` |
| 66 | `seilduksfabrikken_nydalen` | Øvre spinneri | verified_geometry | `kulturminnesok:165570-6` |
| 67 | `fotografiens_hus` | Fotografiens Hus | verified | `geonorge-adresser-v1:0301:16115:20` |
| 68 | `christian_radich` | Christian Radich | verified | `geonorge-adresser-v1:0301:10077:9` |
| 69 | `central_jam_e_mosque` | Central Jam-e-Mosque | verified | `geonorge-adresser-v1:0301:18780:28B` |
| 70 | `toyen_hovedgard` | Tøyen hovedgård | verified | `geonorge-adresser-v1:0301:17749:23B` |
| 71 | `museumsleiligheten_grabein` | Museumsleiligheten Gråbein | verified | `geonorge-adresser-v1:0301:17875:38B` |
| 72 | `akrobaten_gangbro` | Akrobaten gangbro | verified_geometry | `osm-way:468892289` |
| 73 | `sorenga_sjobad` | Sørenga sjøbad | verified_geometry | `osm-node:5295458069` |
| 74 | `frigo_friluftssenteret` | FRIGO – Friluftssenteret i Gamle Oslo | verified | `geonorge-adresser-v1:0301:11589:20` |
| 75 | `galleri_map` | Galleri MAP | verified | `geonorge-adresser-v1:0301:17875:32` |
| 76 | `vi_vii_gallery` | VI, VII | verified | `geonorge-adresser-v1:0301:15006:8` |
| 77 | `ekeberg_helleristninger` | Helleristningene på Ekeberg | verified_geometry | `kulturminnesok:41907` |
| 78 | `the_oslo_gallery` | The Oslo Gallery | verified | `geonorge-adresser-v1:0301:13536:2A` |
| 79 | `valerenga_kirke` | Vålerenga kirke | verified | `geonorge-adresser-v1:0301:12974:3` |
| 80 | `kunsthall_oslo` | Kunsthall Oslo | verified | `geonorge-adresser-v1:0301:13764:21` |
| 81 | `mariakirken_ruin_oslo` | Mariakirken-ruinen | verified_geometry | `kulturminnesok:42178` |
| 82 | `clemenskirken_ruin_oslo` | Clemenskirkeruinen | verified_geometry | `kulturminnesok:51949` |
| 83 | `biblo_toyen` | Biblo Tøyen | verified | `geonorge-adresser-v1:0301:12580:22` |
| 84 | `ekebergparken_museum` | Ekebergparken Museum | verified | `geonorge-adresser-v1:0301:13868:23` |
| 85 | `kosk_oslo` | KÖSK | verified | `geonorge-adresser-v1:0301:21508:63C` |
| 86 | `galleri_mini_oslo` | Galleri Mini | verified | `geonorge-adresser-v1:0301:14861:1` |
| 87 | `van_etten` | Van Etten | verified | `geonorge-adresser-v1:0301:16675:3` |
| 88 | `jordal_ungdomshall` | Jordal ungdomshall | verified_geometry | `osm:way:33263069` |
| 89 | `gamlebyen_kirke` | Gamlebyen kirke | verified_geometry | `osm-way:557799193` |
| 91 | `frammuseet` | Frammuseet | verified | `geonorge-adresser-v1:0301:10977:39` |
| 91 | `kon_tiki_museet` | Kon-Tiki Museet | verified | `geonorge-adresser-v1:0301:10977:36` |
| 92 | `gol_stavkirke_bygdoy` | Gol stavkirke – Bygdøy | verified_geometry | `osm-way:161661199` |
| 95 | `korketrekkeren` | Korketrekkeren | verified_geometry | `osm-relation:1459739` |
| 97 | `universitetets_gamle_kjemi` | Universitetets gamle kjemibygning | verified | `geonorge-adresser-v1:0301:11941:3` |

| 90 | `oslo_prosjektrom` | Oslo Prosjektrom | verified | `geonorge-adresser-v1:0301:15684:18` |


Batch 91 (2026-07-21) retter to legacy `verified_source_coordinate`-poster på Bygdøynes. `frammuseet` bruker nå det entydige Geonorge-punktet for Bygdøynesveien 39, og `kon_tiki_museet` bruker det entydige Geonorge-punktet for Bygdøynesveien 36. Begge adressene er samtidig bekreftet av museenes egne nettsider. De to offisielle adresseobjektene er fysisk separate (51.7 meter mellom representasjonspunktene), og Wikidata er fjernet som primær koordinatkilde. `gol_stavkirke_bygdoy` inngår ikke i batchen fordi Museumsveien 10 er museumsområdets besøksadresse og ikke uten videre et presist bygningsanker for stavkirken.

Batch 92 (2026-07-21) retter `gol_stavkirke_bygdoy` fra legacy `verified_source_coordinate` med Wikidata som primærkilde til eksakt bygningsgeometri. OSM-way 161661199 må i selve API-responsen være en lukket polygon, være tagget `building=church` og ha et eksplisitt navn som identifiserer Gol stavkirke før koordinaten godkjennes. Geometrisk sentrum brukes som displayanker og kryssjekkes mot Norsk Folkemuseums offisielle Gol-stavkirke-side. Punktet ligger 196.8 meter fra museets separate Geonorge-adresseanker; Museumsveien 10 er derfor fjernet fra subplace-recorden og brukes ikke som kirkekoordinat.
| 93 | `alnaparken` | Alnaparken | verified_geometry | `osm-node:7810002134` |
| 93 | `groruddammen` | Groruddammen | verified_geometry | `osm-way:60347628` |
| 93 | `svartdalen` | Svartdalen | verified_geometry | `osm-way:579463147` |
| 93 | `kvaernerbyen_alna` | Kværnerbyen ved Alna | verified_geometry | `osm-way:685201630` |

Batch 93 (2026-07-21) fullfører den utsatte kontrollen av de åtte Alnaelva-rutepunktene etter objekt-type-først-metoden. `alnaparken` bruker det eksakt navngitte OSM-parkankeret, `groruddammen` den navngitte vanngeometrien, `svartdalen` selve dalgeometrien i stedet for Svartdalsparken, og `kvaernerbyen_alna` et eksakt navngitt Alna-segment. `alnsjoen_alna_kilde`, `alna_smalvoll`, `alna_bryn` og `alna_utlop_bjorvika` avsluttes som needs_review fordi kontrollen ikke ga ett entydig kildeobjekt som samsvarer med hele recordens fysiske eller historiske scope.

| 94 | `peststotten_krist_kirkegard` | Peststøtten – Krist kirkegård | verified | `atlasobscura:black-death-monument-peststotten` |
| 94 | `kjaerlighetskarusellen` | Kjærlighetskarusellen | verified_geometry | `osm-node:1346356285` |
| 94 | `villa_stenersen` | Villa Stenersen | verified | `geonorge-adresser-v1:0301:17802:10C` |
| 94 | `st_hallvard_kirke_kloster` | St. Hallvard kirke og kloster | verified | `geonorge-adresser-v1:0301:11553:4` |
| 115 | `bogstadvannet` | Bogstadvannet | verified_geometry | `osm-way:4351126` |
| 115 | `holmenkollen_kapell` | Holmenkollen kapell | verified | `geonorge-adresser-v1:0301:13070:142` |
| 115 | `kollentrollet` | Kollentrollet | verified_geometry | `osm-node:1768125117` |
| 115 | `vettakollen` | Vettakollen | verified_geometry | `osm-node:301173327` |
| 115 | `kragstotten` | Kragstøtten | verified_geometry | `osm-node:484968664` |
| 117 | `oslo_golfklubb_bogstad` | Oslo Golfklubb – Bogstad | verified | `geonorge-adresser-v1:0301:10163:127` |

Batch 94 (2026-07-21) følger top-level manifestrekkefølgen videre inn i `places_historie_added_batch_01.json`. De seks første recordene i filen var allerede kontrollert i tidligere batcher; de fire neste og siste recordene lukkes her. `peststotten_krist_kirkegard` beholder et eksplisitt publisert monumentpunkt med separat identitets- og plasseringskryssjekk mot Oslo byleksikon, `kjaerlighetskarusellen` bruker det eksakt navngitte OSM-punktet uten Wikidata som koordinatkilde, og `villa_stenersen` samt `st_hallvard_kirke_kloster` bruker offisielle Geonorge-adressepunkter etter address-first-policyen.


Batch 95 (2026-07-21) reviderer `korketrekkeren` som lineær akebakke/rute, ikke som adressepunkt. Oslo kommune dokumenterer Korketrekkeren fra Frognerseteren til Midtstuen og oppgir ca. 2700 meter. OSM-ruterelasjon 1459739 er eksplisitt navngitt Korketrekkeren og tagget `type=route`, `route=sled` og `piste:type=sled`. De 16 ordnede medlems-way-ene danner to internt sammenhengende rutedeler med samlet geometri 2436 meter og et 31.8 meter kartgap mellom delene; gap inkludert blir den dokumenterte ruterekken 2467 meter. Startankeret er det eksakte øvre relasjonsendepunktet 25 meter fra Frognerseteren stasjon, mens nedre ende er 41 meter fra Midtstuen stasjon. Relasjonen brukes som semantisk ruteobjekt og startpunktet som `route_start`; batchen påstår ikke at traseen er én topologisk ubrutt polyline. Trailforks er fjernet som primær koordinatkilde.
| 96 | `emanuel_vigeland_mausoleum` | Emanuel Vigelands mausoleum | verified_geometry | `osm-node:974731248` |
| 96 | `framtidsbiblioteket_nordmarka` | Framtidsbiblioteket – Nordmarka | verified | `visitnorway:future-library-forest-nordmarka` |

Batch 96 (2026-07-21) avslutter `places_kunst.json` i kildefilens rekkefølge etter at de fire første recordene allerede var dokumentert i tidligere batcher. `emanuel_vigeland_mausoleum` bruker nå det eksakt navngitte OSM-punktet node 974731248, kontrollert direkte mot OSM API og kryssjekket mot museets offisielle adresse; Wikidata er fjernet som koordinatkilde. `framtidsbiblioteket_nordmarka` beholder Visit Norways eksplisitt publiserte besøkskoordinater for kunstskogen, matematisk omregnet direkte fra DMS uten kartgjetting.


Batch 97 (2026-07-21) retter `universitetets_gamle_kjemi` etter objekt-type-først og adresse-first-metoden. Stedet er en konkret historisk universitetsbygning, og både Oslo byleksikon og regjeringens museumsmelding identifiserer bygningen som Frederiks gate 3. Geonorge-oppslaget må gi ett entydig `verified_candidate` for nøyaktig Frederiks gate 3 i Oslo før koordinaten brukes. Det tidligere `manual_map_check`-punktet lå 353 meter unna og var derfor både kildekontraktsmessig og geografisk feil.
| 98 | `paulus_kirke` | Paulus kirke | verified | `geonorge-adresser-v1:0301:17489:31` |
| 99 | `purenkel_galleri` | Purenkel galleri | verified | `geonorge-adresser-v1:0301:12432:3` |
| 100 | `torshovparken` | Torshovparken | verified_geometry | `osm-way:252260743` |
| 101 | `hodet_nn_torshovdalen` | HODET N.N. | verified_geometry | `osm-node:2965223021` |
| 102 | `havnelageret` | Oslo Havnelager | verified | `geonorge-adresser-v1:0301:14150:1` |
| 103 | `oscarshall` | Oscarshall | verified | `geonorge-adresser-v1:0301:15443:15` |
| 104 | `vikingtidsmuseet` | Vikingtidsmuseet | verified | `geonorge-adresser-v1:0301:13153:35` |

Batch 103 (2026-07-21) produserer `oscarshall` som eget historisk lystslott og kultursted. Geonorge gir ett entydig adressepunkt for Oscarshallveien 15, mens Det norske kongehus dokumenterer den selvstendige bygnings- og besøksidentiteten. Den romantiske parken beholdes som del av samme besøkskompleks og splittes ikke til en ny overlappende markør fra denne kilden alene.

Batch 104 (2026-07-21) produserer `vikingtidsmuseet` som én stabil fysisk museumsidentitet for det bevarte Vikingskipshuset fra 1926 og det sammenkoblede nye museumsanlegget på Huk aveny 35. Geonorge-adressepunktet verifiserer stedet, mens bygge- og besøksstatus holdes eksplisitt adskilt fra koordinatstatus; recorden oppretter derfor ikke et konkurrerende separat `vikingskipshuset`-sted.

| 105 | `bygdoy_kongsgard` | Bygdø Kongsgård | verified_geometry | `osm-node:6593517797` |
| 106 | `bygdoy_dronningberget` | Bygdøy Dronningberget | verified_geometry | `miljodirektoratet-naturvern:VV00003059` |
| 106 | `bygdoy_huk` | Bygdøy Huk | verified_geometry | `osm-way:32547162` |
| 106 | `bygdoy_paradisbukta` | Bygdøy Paradisbukta | verified_geometry | `osm-way:28447738` |

Batch 106 (2026-07-21) reviderer hele Bygdøy-naturkilden fra 2026-05-03, der legacy-statusene var `OpenStreetMap/Mapcarta` eller `nearby_reference`. Dronningberget forankres i offisiell Naturbase-geometri VV00003059. For Kongeskogen, Huk, Paradisbukta og Bygdøynes brukes bare et unikt eksakt navnetreff som også passer forhåndsdefinert fysisk objekttype innenfor Bygdøy-boksen; alle rå Nominatim-resultater lagres. Røykensvika godkjennes ikke uten uavhengig dokumentasjon av at place-identiteten faktisk finnes på Bygdøy.
| 107 | `ostensjovannet` | Østensjøvannet | verified_geometry | `miljodirektoratet-naturvern:VV00000972` |
| 107 | `hovedoya` | Hovedøya | verified_geometry | `osm-relation:20749306` |
| 107 | `gressholmen` | Gressholmen | verified_geometry | `osm-relation:11816903` |
| 107 | `maerradalen` | Mærradalen | verified_geometry | `osm-way:844862938` |
| 107 | `maridalsvannet` | Maridalsvannet | verified_geometry | `osm-relation:1438314` |
| 107 | `noklevann` | Nøklevann | verified_geometry | `osm-relation:16661` |

Batch 107 (2026-07-21) reviderer natur-hovedstedene som fortsatt manglet full Coordinate Source Contract v1. Runneren hopper eksplisitt over placeId-er som allerede står i Oslo-hovedtabellen eller den separate needs_review-tabellen. Offisiell Naturbase-geometri brukes der et entydig verneobjekt finnes; ellers må OSM-kandidaten være et unikt eksakt navnetreff med riktig forhåndsdefinert objekttype. `bygdoy_natur` og `alnaelva_hovedsteder` kan ikke reduseres til nye tilfeldige punktproxyer når deres scope overlapper separate canonical delsteder eller eksisterende hovedrecords.

Batch 102 (2026-07-21) reparerer en dokumentert aggregate/split-divergens for `havnelageret`. Aggregate-recorden var allerede korrekt verifisert mot Geonorge-adressen Langkaia 1 (`geonorge-adresser-v1:0301:14150:1`), mens split-child og split-index fortsatt bar den gamle `needs_source`/`legacy_manual_map_check`-koordinaten. Geonorge address-first ble kjørt på nytt og måtte returnere samme kildeobjekt og et punkt innen 1 meter fra aggregate-recorden før canonical aggregate-data ble kopiert uendret til split-child og split-index. Evidence-recorden peker fortsatt på aggregate-filen og trengte derfor ingen semantisk omskriving.
| 108 | `sukkerbiten_badstulandsby` | Sukkerbiten badstulandsby | verified | `geonorge-adresser-v1:0301:15256:28` |
| 109 | `losaeter` | Losæter | verified_geometry | `osm-way:172520783` |
| 110 | `friluftshuset_sorenga` | Friluftshuset på Sørenga | verified | `geonorge-adresser-v1:0301:21549:124` |
| 111 | `operastranda` | Operastranda | verified_geometry | `osm-way:936040800` |
| 112 | `skraperudtjern` | Skraperudtjern | verified_geometry | `osm-way:23761672` |

Batch 108 (2026-07-21) produserer `sukkerbiten_badstulandsby`. Én samlet og stabil badstulandsby ved Sukkerbiten. Enkeltbadstuer og Oslo Badstuforenings andre lokasjoner får ikke overlappende markører fra denne kilden.

Batch 109 (2026-07-21) produserer `losaeter`. Eksakt navngitt Losæter-parkpolygon som eget sted for kunst, urbant jordbruk og fellesskap; ikke et generelt Sørenga- eller Bjørvika-proxyanker.

Batch 110 (2026-07-21) produserer `friluftshuset_sorenga`. DNTs konkrete institusjons- og aktivitetssenter på Sørengkaia 124, fysisk og funksjonelt separat fra Sørenga sjøbad og det brede Sørenga-områdeankeret.

Batch 111 (2026-07-21) produserer `operastranda`. Eksakt navngitt kommunal badestrand som eget fysisk badested; ikke en erstatning for det brede Bjørvika-ankeret og ikke samme anlegg som Sørenga sjøbad.

Batch 112 (2026-07-21) etterfører den allerede validerte Ljanselva-rutekontrollen etter at parallelle VisitOSLO-batcher tok numrene 108–111 før Ljanselva-PR-en ble merget. `skraperudtjern` bruker det eksakt navngitte OSM-vannobjektet way 23761672 som `pond_center`. `noklevann_ljanselva_start`, `ljanselva_skullerud`, `ljanselva_hauketo`, `ljanselva_ljan`, `ljanselva_fiskevollen` og `ljanselva_bunnefjorden` er fullførte kontroller uten godkjent koordinat og står derfor i needs_review-tabellen. Den opprinnelige build-rapporten ble generert som batch 108 før den parallelle køen landet; rapportstien og resultatmetadataen er i denne reparasjonen canonical-renummerert til batch 112.

Batch 113 (2026-07-21) reviderer Østensjøvannet-kildens fem legacy `OpenStreetMap/Mapcarta`- og `nearby_reference`-punkter. `ostensjovannet_nord`, `ostensjovannet_sivbelte` og `ostensjovannet_sor` er lokale narrative delsoner og får ikke låne hele Naturbase-reservatpolygonet som falsk punktpresisjon. `ostensjovannet_fugletarn` og `bogerudmyra` kan bare verifiseres ved ett unikt eksakt navngitt fysisk objekt med riktig semantisk objekttype i forhåndsdefinert lokal scope; ingen nearest/first-hit-logikk brukes.

Batch 115 (2026-07-21) produserer fem fysisk selvstendige Holmenkollen-steder fra den lukkede VisitOSLO-auditen. `holmenkollen_kapell` bruker det entydige Geonorge-adressepunktet for Holmenkollveien 142. `bogstadvannet` bruker et områdeanker på eksakt navngitt vanngeometri, mens `kollentrollet`, `vettakollen` og `kragstotten` bruker eksakte navngitte OSM-punktobjekter med riktig objekttype. Vettakollen-stasjon/-bydel og Kragstøtten-guidepost/-utsiktspunkt er eksplisitt avvist som navnelike feilobjekter. Oslo Golfklubb Bogstad holdes utenfor batchen til representasjonsrollen mellom klubbhusadresse og golfbanegeometri er eksplisitt avgjort.
| 118 | `stortinget` | Stortinget | verified | `geonorge-adresser-v1:0301:13630:22` |
| 118 | `youngstorget` | Youngstorget | verified_geometry | `osm-relation:12773689` |
| 118 | `oslo_radhus` | Oslo rådhus | verified | `geonorge-adresser-v1:0301:16120:1` |
| 118 | `eidsvolls_plass` | Eidsvolls plass | verified_geometry | `osm-way:841080897` |
| 118 | `hoyesteretts_hus` | Høyesteretts hus | verified | `geonorge-adresser-v1:0301:21338:1` |
| 118 | `politihuset_gronland` | Politihuset på Grønland | verified | `geonorge-adresser-v1:0301:12450:44` |
| 118 | `folkets_hus_oslo` | Folkets Hus i Oslo | verified | `geonorge-adresser-v1:0301:18550:11` |

Batch 118 (2026-07-21) fullfører politikk-manifestet etter objekt-type-først-metoden. `youngstorget` og `eidsvolls_plass` bruker eksakte navngitte plassgeometrier. De konkrete adressebare byggene `stortinget`, `oslo_radhus`, `hoyesteretts_hus`, `politihuset_gronland`, `folkets_hus_oslo` bruker entydige Geonorge-adressepunkter etter address-first-policyen. `regjeringskvartalet` forblir needs_review fordi eneste eksakte samlede OSM-kandidat er en midlertidig `landuse=construction`-geometri, ikke en stabil canonical institusjonsgrense. Ingen nearest/first-hit-logikk brukes.
| 119 | `cinemateket_oslo` | Cinemateket i Oslo | verified | `geonorge-adresser-v1:0301:11309:16` |
| 119 | `colosseum_kino` | Colosseum kino | verified_geometry | `osm-way:115958003` |
| 119 | `house_of_nerds` | House of Nerds | verified | `geonorge-adresser-v1:0301:21649:18` |
| 119 | `latter` | Latter | verified | `geonorge-adresser-v1:0301:20305:1` |
| 119 | `grand_hotel` | Grand Hotel | verified | `geonorge-adresser-v1:0301:13630:31` |
| 119 | `slottsplassen` | Slottsplassen | verified_geometry | `osm-relation:12806921` |
| 119 | `chat_noir` | Chat Noir | verified | `geonorge-adresser-v1:0301:13780:5` |
| 119 | `edderkoppen_scene` | Edderkoppen Scene | verified | `geonorge-adresser-v1:0301:16937:1` |

| 121 | `ullevaal_stadion` | Ullevaal Stadion | verified_geometry | `osm-way:43222619` |
| 121 | `intility_arena` | Intility Arena | verified_geometry | `osm-way:443983964` |

Batch 119 (2026-07-21) er korrigert til objekt-type-først/address-first-metoden. De konkrete adressebare stedene `cinemateket_oslo`, `house_of_nerds`, `latter`, `grand_hotel`, `chat_noir`, `edderkoppen_scene` bruker entydige Geonorge-adressepunkter med venue-adressen dokumentert av stedet selv. `colosseum_kino` beholdes på eksakt OSM-geometri først etter dokumentert ikke-feilende Geonorge-forsøk uten anvendbart entydig treff. `slottsplassen` forblir et eksakt navngitt offentlig plassanker basert på geometri. `frognerstranda` forblir needs_source fordi en vei eller tilfeldig kystlinje ikke kan brukes som proxy for en bred strandsone. Tekniske Geonorge-feil kan ikke legitimere OSM-fallback, og ingen nearest/first-hit-logikk brukes.
Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).

Nyere Oslo-kontroller ble integrert gjennom PR #2327, #2330, #2332, #2335, #2338, #2342, #2343, #2347 og #2357. Protokollen ble etterført 2026-07-19 fordi disse kontrollene var dokumentert i batchrapportene og place-recordene, men ikke var blitt ført fortløpende i denne tabellen.

Retrokontroll fra batch 6 (2026-07-20): Batch 6 er korrigert tilbake til den låste adresse-first-metoden. `gronland_basarene`, `mollergata_19` og `villa_grande` bruker igjen de entydige Geonorge-resultatene fra den opprinnelige batch-6-kjøringen; senere OSM-baserte visual-marker-overstyringer er fjernet fra canonical koordinatkilde. OSM kan fortsatt brukes som visuell QA, men ikke som primær koordinatkilde for disse tre konkrete adressebare byggene.

Retrokontroll fra batch 6 (2026-07-20), pass 2: `torggata` og `storgata` er tilbakeført fra feilaktige enkeltadresseankre til dokumenterte lineære gateankre med ruteankre. `botsparken` bruker nå kommunal parkdefinisjon. De fire batch-16-recordene `carl_berner_plass`, `okern`, `skoyen` og `torshov` har fått dokumenterte steds-/områdefinisjoner fra Oslo byleksikon i stedet for Wikidata som primær verifikasjonskilde.

Retrokontroll fra batch 6 (2026-07-20), pass 3: `telegrafbygningen` bruker nå det dokumenterte OSM-bygningsobjektet som primær geometrikilde etter tvetydig Geonorge-oppslag; `ovre_foss` dokumenterer at Geonorge faktisk ble forsøkt først og bruker Kulturminnesøk 164747 som semantisk historisk områdeanker; `henrik_wergeland_statue` bruker Oslo Museums stabile aksesjonsnummer OB.A17403 som primær kildeidentitet i stedet for Commons-siden.

Batch 36 (2026-07-20) gjenåpner konkrete needs_review-saker med objekt-type-først-metoden. Tre steder er løst uten proxy-gjetting: Prindsen med dokumentert historisk kompleksidentitet og eksakt OSM-områdegeometri etter tvetydig Geonorge-oppslag, Hartvig Nissens skole med entydig navngitt OSM-skoleobjekt etter tvetydig adresseoppslag, og Inger Hagerups plass med eksplisitt kildekoordinat kryssjekket mot Oslo byleksikon og Oslo bykart. Sigrid Undset-statuen forblir needs_review fordi eksakt sokkelpunkt fortsatt mangler.

Batch 37 (2026-07-20) løser `norli_universitetsgata` med et entydig navngitt OSM-bokhandelspunkt etter dokumentert 22/24-adressekonflikt, oppgraderer `bankall_gard` til eksakt navngitt gårdsrelasjon etter tvetydig Geonorge-oppslag, og synkroniserer protokollen med at `frysja_33_brekke_kraftstasjon` allerede er canonical verified på Geonorge 151C. `seilduksfabrikken_nydalen` forblir needs_review fordi objektoppslagene ikke ga et entydig navngitt Øvre Spinneri-objekt.

Batch 38 (2026-07-20) skiller `bislett` fysisk fra `bislett_stadion` ved å bruke det entydige navngitte OSM-strøksobjektet som områdeanker, og retter `st_halvard_bryggeri` til det dokumenterte historiske bryggeristedet i Pilestredet 75C før det tidligere lagrede entydige Geonorge-punktet tas i bruk som historisk adresseanker. `sigrid_undset_statue` forblir needs_review uten sokkelpunkt, og `grensen_kjopesenter` holdes tilbake til en egen lineær gate-modell med flere segmenter/ankre.

Batch 39 (2026-07-20) normaliserer `grensen_kjopesenter` til den faktiske lineære gaten Grensen. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass; tre eksakte navngitte OSM-way-segmenter dokumenterer gateløpet, men parallelle kjørebaner modelleres ikke som én falskt sammenhengende polyline. To kildebelagte endeankre og et representativt linjeanker brukes. `ring_3` forblir needs_review fordi research ikke ga en entydig komplett ruteankerkjede.

Batch 40 (2026-07-20) modellerer `trikk_17_18` som et forgrenet rutepar i stedet for ett symbolsk midtpunkt. Ruters gjeldende rutetabell definerer de to grenene, og fem entydige parent-stopp fra Enturs nasjonale stoppregister brukes som felles vestende, felles sentrums-/linjeanker ved Nybrua, grenankre ved Sinsenkrysset og Storo og felles ende ved Grefsen stasjon.

Batch 41 (2026-07-20) etterfører de tre geometri-verifiserte stedene fra PR #2594 etter at batch 40 samtidig synkroniserte runtime-indeks og evidence-snapshotene. `norges_hjemmefrontmuseum` bruker Det dobbelte batteri / bygning 21 (`osm-way:111833902`) som eget bygningsanker, og `forsvarsmuseet` bruker Hovedarsenalet / bygning 62 (`osm-way:54830211`); begge er fysisk separate understeder inne på Akershus festning. `roseslottet` bruker den navngitte installasjonsgeometrien `osm-way:1004591108` som `site_center`, og aktiv status skal revurderes etter 2026-12-31.

Batch 42 (2026-07-20) produserer tre nye, fysisk selvstendige museumssteder fra den lukkede Oslo-museumsauditen. `norsk_folkemuseum` bruker det entydige Geonorge-punktet for Museumsveien 10 og modelleres separat fra `gol_stavkirke_bygdoy`, som er ett konkret objekt inne i det større museumsområdet. `norsk_maritimt_museum` bruker Bygdøynesveien 37 og er separat fra de nærliggende `frammuseet` og `kon_tiki_museet`. `historisk_museum` bruker Frederiks gate 2 og representerer selve museumsbygningen, mens `tullin` fortsatt er det bredere områdeankeret for Tullinløkka.

Batch 43 (2026-07-20) produserer tre videre museumssteder fra samme lukkede audit. `frogner_hovedgard` bruker Halvdan Svartes gate 58 og modellerer selve hovedgårdsanlegget, med Bymuseet og Teatermuseet som nåværende institusjonslag i stedet for separate markører. `arbeidermuseet` bruker Sagveien 28 og holdes fysisk separat fra brede industriområde-records langs Akerselva. `nobels_fredssenter` bruker Brynjulf Bulls plass 1 i den tidligere Vestbanestasjonen og skilles fra både områdeankeret `radhusplassen` og institusjonsstedet `nobelinstituttet`.

Batch 44 (2026-07-20) løser `oslo_kornmagasin` som et identitetsproblem før koordinatproblemet. Den tidligere aktive «Christiania kornmagasin»-recorden fra 1785 manglet eksternt verifisert identitet, noe også eksisterende quiz-QC dokumenterte. Recorden er korrigert til Kornmagasinet, inventar 0008 på Akershus festning, offisielt datert 1788. Eksakt navngitt OSM-way 669390505 brukes som bygningsgeometri, kryssjekket mot fredningsforskriften. Fysisk overlap mot det separate Bakeriet er kontrollert mot dets eget OSM-bygningsobjekt 669390521. Den eksisterende quizfilen er samtidig korrigert slik at den ikke lenger lærer bort den udokumenterte 1785-identiteten eller bruker place-filen som faktakilde.

Batch 45 (2026-07-20) legger til tre fysisk avklarte institusjonssteder fra den lukkede museumsauditen. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.

Batch 46 (2026-07-20) løser `vippetangen_fisketorg` ved å avgrense den tidligere blandede fisketorg/fiskehavn/Fiskehallen-recorden til dagens konkrete Fiskehallen på Akershusstranda 23. Fisketorget ble flyttet til Vippetangen i 1905; dagens større hall ble oppført 1932–33 og åpnet i 1933. Det entydige Geonorge-adressepunktet `geonorge-adresser-v1:0301:10077:23` brukes som canonical bygningsanker. Punktet representerer ikke hele Vippetangen eller den historiske fiskehavna.

Batch 47 (2026-07-20) løser `lilleborg_fabrikker` ved å skille selskaps- og produksjonstidslinjen og bruke den dokumenterte fabrikkporten i Sandakerveien 54 som eksplisitt inngangs-/displayanker for det historiske fabrikkomplekset. A/S Lilleborg Fabriker ble grunnlagt i 1897; 1833 gjelder oljemøllen og 1842 såpefabrikken i forhistorien. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:16161:54` representerer fabrikkporten, ikke det geometriske sentrum av det delvis revne og transformerte industriområdet.

Batch 48 (2026-07-20) produserer tre stabile besøkssteder fra museumsauditens grensesone. `tbs_gallery` bruker Oscars gate 23 og modelleres som permanent kunstnersenter i et historisk villa- og stallanlegg, ikke som et tilfeldig kommersielt salgsgalleri. `viking_planet_oslo` bruker Fridtjof Nansens plass 4 og holdes fysisk separat fra Rådhusplassen og institusjonelt separat fra Vikingtidsmuseet på Bygdøy; den digitale formidlingen skal behandles kildekritisk. `the_salmon_vitensenter` bruker Strandpromenaden 11 og representerer det gratis kunnskapssenteret om havbruk, ikke restaurantdelen eller hele Tjuvholmen.

Batch 49 (2026-07-20) fullfører de to status-sensitive standardkandidatene fra museumsauditen. `jodisk_museum_oslo` bruker Calmeyers gate 15B som fysisk museums- og kulturminneanker; museumsbygget er stengt for renovering fra 1. mai 2026 med estimert gjenåpning høsten 2028, men undervisning og byvandringer fortsetter utenfor bygget. `det_internasjonale_barnekunstmuseet` bruker Lille Frøens vei 4 som fysisk museumsanker; ordinære åpningstider har vært innstilt siden 8. desember 2025 og det finnes per 20. juli 2026 ingen fast gjenåpningsdato. `verified` i denne tabellen gjelder koordinat og fysisk identitet, ikke aktuell publikumsåpning.

Batch 50 (2026-07-20) fullfører den siste spesialkoordinatsaken fra museumsauditen. `ibsen_museum_teater` bruker det eksakte Geonorge-punktet for dagens offisielle publikumsinngang i Henrik Ibsens gate 26 som display- og unlock-anker. Museets historiske kjerne er Henrik og Suzannah Ibsens leilighet i Arbins gate 1, der de bodde fra 1895 til 1906; denne adressen bevares eksplisitt som historisk lag og skal ikke erstattes av den moderne besøksadressen i litteraturhistorisk innhold.

Batch 51 (2026-07-20) starter den avgrensede completeness-passeringen for VisitOSLO-attraksjoner utenfor museumskategorien. `oslo_reptilpark` bruker det entydige Geonorge-adressepunktet `geonorge-adresser-v1:0301:16935:2` for St. Olavs gate 2 som dagens bygnings- og displayanker. Oslo Reptilparks egen historikk dokumenterer at institusjonen åpnet i Storgata 10. januar 2002 og flyttet til større lokaler i St. Olavs gate 2 i september 2007. Dagens koordinat representerer derfor nåværende besøkssted, ikke den opprinnelige 2002-lokasjonen.


Batch 52 (2026-07-20) fortsetter den avgrensede completeness-passeringen for VisitOSLO-attraksjoner utenfor museumskategorien. `toyenbadet` bruker det entydige Geonorge-adressepunktet `geonorge-adresser-v1:0301:12860:90` for Helgesens gate 90 som dagens bygnings-, display- og unlock-anker. Oslo kommune dokumenterer at det nye hovedbadet åpnet 6. januar 2025 på samme tomt som det opprinnelige Tøyenbadet fra 1976. Stedet modelleres derfor som én fysisk canonical place med to bygningshistoriske lag, ikke som to overlappende markører.

Batch 53 (2026-07-20) produserer `ekt_rideskole_husdyrpark` etter separat koordinat- og taxonomy-gate. Det normative adresse-først-intaket ga det eksakte Geonorge-punktet `geonorge-adresser-v1:0301:11462:99` for Ekebergveien 99. EKT ble etablert som rideskole i 1954 ved Jomfrubråtveien 40, mens dagens ridehus-, stall- og husdyrparkkompleks ble utviklet etter festeavtalen med Oslo kommune i 1964. Canonical primærkategori er sport fordi organisert rideundervisning og hestesport er den kontinuerlige institusjonskjernen; husdyrparken beholdes som et integrert formidlings- og besøkslag på samme fysiske sted, ikke som en overlappende markør.

Batch 54 (2026-07-20) legger til `dronning_sonja_kunststall` med det entydige Geonorge-punktet `geonorge-adresser-v1:0301:15614:50` for Parkveien 50. De kongelige stallene dateres til 1848, mens KunstStallen åpnet som offentlig kunst- og kulturarena 4. juli 2017. Stedet er en egen kunstinstitusjon og ikke en duplikat av `slottet` eller `slottsparken`.

Batch 55 (2026-07-20) legger til `holmlia_bad` som et eget kommunalt svømme- og idrettsanlegg. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:13084:34` for Holmlia Senter vei 34 brukes som dagens bygnings-, display- og unlock-anker. Holmlia bad stod klart i 1983 som del av et fjellanlegg der idrettshall, svømmehall og tilfluktsrom ble kombinert. Den bredere underjordiske infrastrukturen er fysisk og historisk kontekst, ikke en ekstra overlappende markør. Midlertidige sommerstenginger gjelder drift og endrer ikke canonical stedsstatus.

Oslo West-kirkepakken (2026-07-20) legger til `fagerborg_kirke`, `uranienborg_kirke` og `frogner_kirke` som tre separate canonical `by`-steder etter aktiv duplikatkontroll og normative adresse-først-oppslag. De bruker eksisterende kirkemodell og ekskluderer `nature` for å beholde de åtte prioriterte PlaceCard-rundingene.

Batch 60 (2026-07-20) legger til `vestre_gravlund` som et dokumentert `cemetery_area_anchor`. Oslo kommune identifiserer det 243 dekar store gravplassområdet, mens OpenStreetMap way 4740772 gir den konkrete, navngitte gravlundsgeometrien. Det representative punktet er kontrollert inne i polygonet. Besøksadressen Sørkedalsveien 66 brukes bevisst ikke som snarvei for hele gravlunden.
Batch 56 (2026-07-20) legger til `skimore_oslo` som én canonical helårsrepresentasjon av Skimore-anlegget på Tryvann. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:17787:64` for Tryvannsveien 64 brukes som publikums-, display- og unlock-anker. Skimore dokumenterer både vinterens alpin-/snowboardanlegg og sommerens klatrepark ved samme anlegg; klatreparken ble bygget i 2012. VisitOSLOs separate sommer- og vinteroppføringer skal derfor ikke bli overlappende place-markører. Adressepunktet representerer hovedankeret og skal ikke leses som full geometri for alle bakker, heiser og klatreparkløyper.

Batch 61 (2026-07-20) legger til `brannmuseet_oslo` som ett fysisk historisk sted for den tidligere Grønland brannstasjon og dagens Brannmuseet i Oslo. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:12450:32` for Grønlandsleiret 32 brukes som bygnings-, display- og unlock-anker. Den brede canonical gate-recorden `gronlandsleiret` er ikke et duplikat og skal ikke brukes som proxy for museumsbygningen. Stasjonen dateres til 1861, var i ordinær brannstasjonsbruk fram til 1978 og formidler i dag Oslos brann- og beredskapshistorie gjennom bevart materiell, kjøretøy og museumssamlinger.


Batch 62 (2026-07-20) legger til `skoytemuseet` som en egen sportshistorisk museuminstitusjon ved Frogner stadion. Det normative Geonorge-punktet `geonorge-adresser-v1:0301:14742:26` for Middelthuns gate 26 ligger 70.5 meter fra canonical `frogner_stadion`-markøren på arenaområdet. Museet og stadion beholdes derfor som separate, relaterte steder: samlings- og minneinstitusjon versus aktiv idrettsarena.

Batch 63 (2026-07-20) legger til `vikaterrassen` med et navngitt OSM-geometrianker kryssjekket mot de offisielle Geonorge-adressene Ruseløkkveien 3 og 5. Stedet behandles som ett gate- og bygningskompleks med historiske lag fra Ruseløkkbakken og Ruseløkkbasarene via 1960-tallets modernistiske utbygging til dagens gågate. `victoria_terrasse` er ikke en eksisterende canonical place og blandes ikke inn som identisk sted.

Batch 64 (2026-07-20) legger til `kampen_okologiske_barnebondegard` etter separat adresse- og taxonomy-gate. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:16443:23` for Skedsmogata 23 brukes som display- og unlock-anker for det integrerte gårdsstedet med gårdstun, skolehage, fjøs og stall. Canonical primærkategori er `by` fordi stedet ble skapt som et barnedrevet nærmiljøinitiativ og i dag fungerer som lavterskel møteplass, pedagogisk tilbud og sosial infrastruktur; `natur` beholdes som sekundært faglag for dokumentert dyrking, matproduksjon, dyrestell og naturens kretsløp. Husdyrene skal ikke behandles som vill fauna, og stedet skal ikke splittes i overlappende markører.

Batch 65 (2026-07-20) legger til `klimahuset` etter separat overlap-, adresse- og taxonomy-gate. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:14797:12` for Monrads gate 12 brukes som display- og unlock-anker. Punktet ligger om lag 13,2 meter fra den separat navngitte Klimahuset-geometrien `osm-way:762832690`, som brukes som identitets- og visuell QA, ikke som erstatning for den normative adressekilden. Klimahuset beholdes som et fysisk eget `vitenskap`-sted med `natur` som sekundært faglag; `naturhistorisk_museum` representerer fortsatt den bredere institusjonen og `botanisk_hage` den større hage- og campusarenaen.

Batch 66 (2026-07-20) løser `seilduksfabrikken_nydalen` etter at tidligere legacy-punkt, adressebokstav-korrelasjon og feilplasserte bygningskandidater ble forkastet. Riksantikvarens offentlige enkeltminne `165570-6` er registrert av Byantikvaren i Oslo som «Nydalen Compagnie Bomullsspinneri – Gjerdrums vei 12» og eksplisitt som «Spinneri (bygn 108)». Den separate enkeltminnegeometrien `165570-5` er «Veveri (bygn 113)», slik at spinneriet og veveriet kan skilles fysisk uten proxy-gjetting. Geometrisk senter for 165570-6 brukes som canonical `building_center`; stedet fjernes samtidig fra needs_review-tabellen. Aggregate, split-record og per-source legacy-index holdes eksplisitt synkronisert i denne batchen fordi Akerselva-kilden fortsatt er manifest-lastet gjennom aggregate-filen.
Duplikatmigrering (2026-07-20): `nrk_marienlyst` er fjernet som separat place og alle aktive datareferanser er migrert til canonical `nrk_huset_marienlyst`. Det tidligere naeringsliv-quizsettet er beholdt som faglig spor på canonical place-ID, den komplementære arbeidslivshistorien er slått inn i canonical storyfil, og legacy-ID-en er lagt til alias-gaten for å hindre nye referanser.

Duplikatmigrering (2026-07-20): `jernbanetorget_trafikknutepunkt` er fjernet som separat place fordi recorden representerte samme fysiske knutepunkt som canonical `jernbanetorget`. Den separate næringslivs-Civication-mappingen er fjernet fordi canonical Jernbanetorget allerede har egen Civication-mapping, i18n-dublettnøkler er ryddet, og legacy-ID-en er lagt til alias-gaten. Ingen ny verifisert place er opprettet.

Duplikatmigrering (2026-07-20): `akerhus_slott` er fjernet som separat fysisk place og eksakte aktive data-ID-er er migrert til canonical `akershus_festning`. Quiz- og storyfiler kan beholde legacy-filnavn som innholdsbeholdere, men alle place-targets peker nå på canonical festningsrecord. Legacy-ID-en er lagt til alias-gaten. Ingen ny verifisert place er opprettet.

Duplikatmigrering (2026-07-20): `good_game_redaksjon` er fjernet som separat fysisk place fordi Good Game er et redaksjonelt innholdsmiljø inne i canonical `nrk_huset_marienlyst`, ikke et eget dokumentert sted. Story-, people- og Wonderkammer-referanser er beholdt som Good Game-innhold, men eksakte fysiske place-ID-er peker nå på NRK-huset. Den separate Civication-mappingen er fjernet fordi canonical NRK allerede har egen mapping, og legacy-ID-en er lagt til alias-gaten.

Duplikatmigrering (2026-07-20): `nydalen_industristed` er fjernet som separat fysisk place fordi recorden overlapper canonical og koordinatverifiserte `nydalen`. Industristedets dokumenterte works, før–nå, brands, Civication-objekter, kilder, underbadges og Akerselva-naturprofil er slått inn i canonical Nydalen. Quiz-, people-, story-, leksikon-, natur- og rutereferanser er retargetet til canonical place-ID, mens det verifiserte Nydalen-området beholder sitt eksisterende geometrianker.

Alias-migrering (2026-07-20): `loelva_historisk` er fjernet som separat fysisk place fordi Loelva er dokumentert som historisk/alternativt navn på `alnaelva`, ikke som et eget vassdrag. Navnehistorien er bevart som en eksplisitt `historical_alias`-relasjon på canonical Alnaelva, aktive referanser er retargetet og den separate Civication-markøren er fjernet. Alnaelvas koordinatstatus er fortsatt `needs_source`; migreringen verifiserer ikke den uavklarte elvegeometrien.

Protokollsynk (2026-07-21): stale needs_review-rader ble fjernet bare når både dagens canonical runtime-index og koordinat-evidensen dokumenterer en godkjent koordinatstatus. Fjernet: `nybrua_vaterlandsparken`, `grensen_kjopesenter`. Synken endrer ingen koordinater.

Koordinatkorreksjon (2026-07-21): `frysja_industriomrade` er nedgradert fra legacy `verified` til `needs_source`. Det tidligere punktet bygger bare på `manual_map_check` og beholdes foreløpig som displayanker; ingen kildebelagt områdegeometri eller area-ankre er lagt til.

| 122 | `kfum_arena` | KFUM Arena | verified | `geonorge-adresser-v1:0301:11462:109` |
| 122 | `nordre_aasen_idrettspark` | Nordre Åsen idrettspark | verified | `geonorge-adresser-v1:0301:13747:7` |
| 122 | `gressbanen` | Gressbanen | verified_geometry | `osm-way:5046575` |
| 122 | `daelenenga_idrettspark` | Dælenenga idrettspark | verified_geometry | `osm-composite:way/4708872+way/101769218` |

Batch 122 (2026-07-21) lukker de fire åpne sportstedene fra batch 121 etter den låste metodeprioriteten. KFUM Arena og Nordre Åsen bruker entydige Geonorge-adressepunkter etter offisiell adresseavklaring. Gressbanen har dokumentert address-first-forsøk uten ett entydig eksakt ulettert 24-treff og bruker derfor direkte stable-ID-oppslag av eksakt navngitt OSM way 5046575. Dælenenga ga ingen Geonorge-resultat for kommunens besøksadresse; ett enkelt delobjekt brukes derfor ikke som proxy. Canonical stedet modelleres med komponentankrene OSM way 4708872 og Grünerhallen OSM way 101769218, og hovedpunktet er et dokumentert semantisk area-anchor mellom dem. Ingen nearest/first-hit- eller teknisk-feil-fallback brukes.

Batch 123 (2026-07-21) rydder lekeplass-/treningskøen før videre koordinatproduksjon. Syv sikre subfeature-records er migrert til eksisterende canonical parent-place og fjernet som aktive places: `lekeplass_sofienbergparken` → `sofienbergparken_subkultur`, `lekeplass_st_hanshaugen` → `st_hanshaugen_park`, `lekeplass_birkelunden` → `birkelunden`, `lekeplass_olaf_ryes_plass` → `olaf_ryes_plass`, `lekeplass_botsparken` → `botsparken`, `lekeplass_stensparken` → `stensparken`, `treningssted_skur13` → `skur13`. Wonderkammer-referanser er retargetet, de syv Civication-top-level-mappingene og place-i18n-postene er fjernet, og legacy-ID-ene er lagt i alias-gaten. Åtte grensefall forblir urørt til egen identitetskontroll: `lekeplass_kirsebarlunden`, `lekeplass_snippen`, `lekeplass_frognerborgen`, `lekeplass_kampen_park`, `aktivitet_rudolf_nilsens_plass`, `treningssted_torshovdalen`, `treningssted_kampen_park`, `treningssted_sognsvann`. Frognerborgen og de to Kampen-postene beholdes i review fordi den eldre migreringsauditen pekte på parent-ID-ene `frognerparken` og `kampen_park`, som ikke finnes i dagens canonical inventory. `korketrekkeren` var allerede kontrollert.

| 124 | `frognerparken` | Frognerparken | verified_geometry | `osm-way:4334023` |

Batch 124 (2026-07-21) løser Frognerborgen-parentproblemet ved å produsere den allerede scope-godkjente canonical identiteten `frognerparken`. Oslo kommune definerer Frognerparken som hele parken og Frognerborgen som lekeplassen ved hovedinngangen inne i parken. `lekeplass_frognerborgen` fjernes derfor som egen aktiv kartmarkør og beholdes som Wonderkammer-/subfeature-innhold under `frognerparken`. Parkankeret kommer fra ett eksakt navngitt OSM-parkobjekt med polygongeometri etter objekt-type-først-filter; ingen nearest/first-hit-logikk brukes, og Vigelandsparken, Frogner stadion og Frogner hovedgård forblir separate canonical steder.

| 125 | `sofienbergparken` | Sofienbergparken | verified_geometry | `osm-way:3235895` |
| 125 | `torshovdalen` | Torshovdalen | verified_geometry | `osm-relation:959781` |
| 125 | `sognsvann` | Sognsvann | verified_geometry | `osm-relation:448255` |

Batch 125 (2026-07-21) gjennomfører den lukkede treveis canonical identity-migreringen fra VisitOSLO parker/natur-scopeauditen: `sofienbergparken_subkultur` → `sofienbergparken`, `treningssted_torshovdalen` → `torshovdalen` og `treningssted_sognsvann` → `sognsvann`. Selve fysiske stedet er canonical identitet; subkultur, trening og aktivitet beholdes som bruk-/innholdslag. Hvert sted bruker ett eksakt navngitt OSM-polygon med riktig objekttype, kryssjekket mot Oslo kommunes stedsbeskrivelse. De gamle pseudo-place-ID-ene fjernes og beskyttes med alias-gaten.

| 126 | `kampen_park` | Kampen park | verified_geometry | `osm-way:4870715` |
| 126 | `rudolf_nilsens_plass` | Rudolf Nilsens plass | verified_geometry | `osm-way:36972584` |

Batch 126 (2026-07-21) normaliserer aktivitetsorienterte pseudo-ID-er til de fysiske park-/byromidentitetene. `lekeplass_kampen_park` og `treningssted_kampen_park` samles i `kampen_park`; `aktivitet_rudolf_nilsens_plass` blir `rudolf_nilsens_plass`. Oslo kommune beskriver Kampen park som én park med blant annet lekeplass, bordtennis og treningsmuligheter, og Rudolf Nilsens plass som ett samlet park-/byrom med lekeplass, treningsapparater, multibane og kunstgress/kunstis. Begge canonical steder bruker ett eksakt navngitt OSM-parkpolygon med stable ID fra den tidligere intake-kontrollen. De gamle aktivitets-ID-ene fjernes og beholdes kun som alias/innholdslag; ingen overlappende markører opprettes.

| 127 | `snippen_lekepark` | Snippen lekepark | verified_geometry | `osm-way:761333023` |

Batch 127 (2026-07-21) løser den tidligere manuelle parent-konflikten for `lekeplass_snippen`. Oslo kommune beskriver Snippen lekepark som et eget navngitt lekeparksted rett utenfor sørsiden av Botanisk hage; `botanisk_hage` avvises derfor som parent. `lekeplass_snippen` normaliseres til canonical `snippen_lekepark`, basert på det eksakt navngitte OSM-parkpolygonet `osm-way:761333023` som allerede ble funnet i intake-kontrollen. Ingen nearest/first-hit-logikk brukes.

| 128 | `kirsebarlunden` | Kirsebærlunden | verified_geometry | `osm-way:1097943191` |

Batch 128 (2026-07-21) lukker siste ukontrollerte record i `places_oslo_lekeplasser_trening.json`. Oslo kommune omtaler området både som parken og lekeplassen på Kirsebærlunden, plasserer det nedenfor Tøyenparken og mellom Tøyen torg og Gamle Munch, mens prosjektbeskrivelsen klassifiserer det oppgraderte området som lekeplass/park. Ingen av de nærliggende canonical stedene er derfor dokumentert parent. `lekeplass_kirsebarlunden` normaliseres til canonical `kirsebarlunden`, med direkte stable-ID-oppslag av det eksakt navngitte polygonet `osm-way:1097943191` som geometrisk area-anchor. `korketrekkeren` var allerede kontrollert, så denne gamle kilden har etter batch 128 ingen ukontrollerte place-records.

| 129 | `skur13` | Skur 13 | verified | `geonorge-adresser-v1:0301:11762:3` |

Batch 129 (2026-07-21) reviderer `skur13` etter dagens address-first-policy. Oslo kommune oppgir Skur 13 som skate-/aktivitetshall med besøksadresse Filipstadveien 3. Det innledende fritekstsøket i Geonorge ga flere treff og ble forkastet. Batchen bruker derfor et strukturert oppslag på adressenavn, nummer og kommunenummer og krever nøyaktig ett eksakt Oslo-treff før status oppgraderes. Den tidligere `official_site_manual`/`legacy_unknown`-forankringen fjernes; Geonorges representasjonspunkt brukes som display-marker for bygningen.

| 130 | `stovnertarnet` | Stovnertårnet | verified_geometry | `osm-node:5163964280` |

Batch 130 (2026-07-21) reviderer `stovnertarnet` etter objekt-type-først-metoden. Karl Fossums vei 30 brukes ikke som adresseproxy for selve tårnet. Oslo kommune plasserer Stovnertårnet ved Jesperudjordet/Fossumberget og identifiserer det som et eget kommunalt utsiktstårn. Koordinaten godkjennes bare dersom Nominatim/OSM gir nøyaktig ett eksakt navngitt `tourism=viewpoint`-punkt i forhåndsdefinert Stovner-scope og stable ID `osm-node:5163964280`.

| 131 | `revolver_oslo` | Revolver | verified | `geonorge-adresser-v1:0301:14943:32B` |

Batch 131 (2026-07-21) reviderer `revolver_oslo` etter address-first-policy. Revolvers egen nettside oppgir Møllergata 32, mens Brønnøysundregistrenes beliggenhetsadresse og nåværende TicketCo-oppføring presiserer Møllergata 32B. Batchen godtar derfor bare et strukturert Geonorge-resultat med nøyaktig adressenavn Møllergata, nummer 32, bokstav B og kommunenummer 0301. Den gamle `official_site_manual`/`legacy_unknown`-forankringen fjernes og erstattes av offisielt matrikkeladressepunkt.

| 132 | `helvete_neseblod_records` | Helvete / Neseblod Records | verified_geometry | `osm-node:2847570870` |

Batch 132 (2026-07-21) reviderer `helvete_neseblod_records` med address-first før POI-fallback. Neseblod Records og Brønnøysundregistrene oppgir Schweigaards gate 56, men Geonorge har både 56A og 56B og ingen primærkilde i batchen avgjør bokstavleddet. Ingen adressekandidat velges derfor. I stedet kreves nøyaktig ett eksakt navngitt `shop=music`-POI i lokal Gamlebyen-scope; live oppslag gir `osm-node:2847570870`. Punktet brukes som site-center for dagens Neseblod Records og fysisk anker for den kombinerte Helvete/Neseblod-stedsfortellingen. Den gamle Yandex-/legacy-forankringen fjernes.

| 133 | `club_7_vika` | Club 7 | verified_historical_source | `geonorge-adresser-v1:0301:14857:15` |

Batch 133 (2026-07-21) reviderer `club_7_vika` som et historisk fler-lokasjonssted med eksplisitt representert periode. Recorden bruker Munkedamsveien 15-perioden 1971–1985 som kartanker. Sceneweb dokumenterer flyttingen til Konserthusets underetasje i 1971 og driften frem til 1985; Oslo byleksikon oppgir Munkedamsveien 15, og Røverstaden bekrefter kontinuiteten i lokalene. Etter denne historiske identitetsavklaringen brukes ett eksakt Geonorge-adresseobjekt for Munkedamsveien 15 som `historical_anchor`. Status er `verified_historical_source`, ikke en påstand om at Club 7 lå her gjennom hele 1963–1985.

| 134 | `norges_varemesse` | Norges Varemesse – Sjølystsenteret | verified_historical_source | `lokalhistoriewiki:norges-varemesse-sjolyst` |

Batch 134 (2026-07-21) løser identity-konflikten i `norges_varemesse` ved å avgrense Oslo-recorden til det konkrete Sjølystsenteret/Messehallen i Drammensveien 154, 1962–2002, i stedet for institusjonen Norges Varemesse gjennom alle lokasjoner. Et obligatorisk address-first-forsøk viste at den revne adressen 154 ikke lenger finnes som aktivt Geonorge-objekt; ingen moderne naboadresse brukes som proxy. Lokalhistoriewikis stedfestede artikkel for det tidligere anlegget oppgir 59.9206, 10.6791 og dokumenterer at dagens Messepromenaden går gjennom området der Messehallen lå. Oslo byleksikon dokumenterer adressen, perioden, rivningen og at Sjølyststranda ble bygget på den tidligere messeeiendommen. Punktet behandles derfor som `verified_historical_source` med `historical_approximation`/`historical_anchor`, ikke som et eksakt nåværende bygningspunkt.

| 135 | `dagbladet_akersgata` | Dagbladet – Akersgata 49 | verified_historical_source | `oslobyleksikon:dagbladet-akersgata49:1967-2008` |

Batch 135 (2026-07-21) løser den tidligere fleradresse-konflikten i `dagbladet_akersgata` ved å avgrense canonical kartsted til Dagbladets formålsbygde avishus mot Akersgata 49 fra 1967 til flyttingen i 2008. Den eldre Akersgata 36-perioden beholdes som institusjonshistorie, men inngår ikke i kartpunktets fysiske scope. Oslo byleksikon og Lokalhistoriewiki dokumenterer perioden, og Dagbladets egen 2008-omtale dokumenterer flyttingen fra nr. 49 til Havnelageret. Etter historisk identitetsavklaring brukes ett eksakt Geonorge-adresseobjekt (geonorge-adresser-v1:0301:10069:49) som presist fysisk historical-anchor. Status er `verified_historical_source`, ikke en påstand om at Dagbladet lå i nr. 49 gjennom hele historien siden 1869.

| 136 | `aftenposten_akersgata` | Aftenposten – Akersgata 51 | verified_historical_source | `aftenposten:akersgata51:1876-2003` |

Batch 136 (2026-07-21) løser overlap-/fleradresse-konflikten i `aftenposten_akersgata` ved å bruke Akersgata 51 som eksplisitt historisk hovedanker for perioden 1876–2003. Aftenpostens egen historikk dokumenterer at redaksjon, ekspedisjon og setteri hadde hovedadresse 51 gjennom 127 år, samtidig som komplekset senere ble utvidet til 53 og mot slutten også 55. Disse utvidelsene beholdes som historisk kontekst; dagens Akersgata 55 er fortsatt separat canonical `vg_huset`. Etter historisk identitetsavklaring brukes ett eksakt Geonorge-adresseobjekt (geonorge-adresser-v1:0301:10069:51) som presist physical historical-anchor for nr. 51. Status er `verified_historical_source`, ikke en påstand om at alle Aftenpostens byggfunksjoner gjennom perioden lå i én uforandret bygningskropp.

| 137 | `bygdoy_kongeskogen` | Bygdøy Kongeskogen | verified_geometry | `kartverket-ssr:241789` |

Batch 137 (2026-07-21) løser `bygdoy_kongeskogen` med official-map object-type-first etter at tidligere OSM-kontroll ikke fant ett entydig navngitt polygon. Kartverkets Sentralt stedsnavnregister gir nøyaktig ett aktivt Kongeskogen-treff i Oslo, objekttype `Skog`, stedsnummer 241789, med offisielt representasjonspunkt 59.90511, 10.66718. Regjeringens reguleringsvedtak kryssjekker S-F1 Kongeskogen som eget kombinert kulturmiljø-, naturvern- og friluftsområde, og Bygdø Kongsgård bekrefter den lokale stedsidentiteten. SSR-punktet brukes som stabilt `area_anchor`; det gamle Mapcarta-/nearby-punktet pensjoneres, og ingen nearest/first-hit-logikk brukes.

| 138 | `bygdoy_bygdoynes` | Bygdøy Bygdøynes | verified_geometry | `kartverket-ssr:732865` |

Batch 138 (2026-07-21) løser `bygdoy_bygdoynes` med official-map object-type-first etter at tidligere OSM-kontroll ikke fant ett entydig navngitt objekt. Kartverket SSR gir nøyaktig ett aktivt Bygdøynes-treff i Oslo, objekttype `Nes i sjø`, stedsnummer 732865, med offisielt representasjonspunkt 59.90369, 10.70131. Store norske leksikon kryssjekker identiteten som det ytterste sørøstre neset på Bygdøy ved innløpet til Frognerkilen. SSR-punktet brukes som stabilt `area_anchor`; det gamle Mapcarta-/nearby-punktet pensjoneres, og ingen nearest/first-hit-logikk brukes.

| 139 | `ibsen_quotes` | Sitatgaten – Ibsen-sitatene | verified_geometry | `ibsen-museum:sitatgaten` |

Batch 139 (2026-07-21) løser `ibsen_quotes` som en distribuert fleranker-rute i stedet for ett enkelt monumentpunkt. IBSEN Museum & Teater dokumenterer 69 sitater langs Karl Johans gate og Henrik Ibsens gate, mens Oslo byleksikon avgrenser kunstverket mellom Ibsenmuseet og Grand Café. Endepunktene forankres med eksakte Geonorge-adresseobjekter (geonorge-adresser-v1:0301:21471:26 og geonorge-adresser-v1:0301:13630:31). Canonical lat/lon er et beregnet `semantic_anchor` mellom endepunktene for kartvisning; det er ikke en påstand om rettlinjet trasé eller ett bestemt sitatpunkt.

| 140 | `alnsjoen_alna_kilde` | Alungsjøen (Alna-kilde) | verified_geometry | `osm-node:844892785` |

Batch 140 (2026-07-21) løser kildesonen med eksplisitt hydrologisk nettverkstopologi og oppdaterer synlig innsjønavn til Kartverkets vedtatte `Alungsjøen`; place-id-en beholdes for kompatibilitet. Kartverket SSR stedsnummer 733527 fastsetter innsjøidentiteten. Oslo kommune og Oslo byleksikon dokumenterer Alna fra innsjøen. I OSM deler Alunsjødammen (way 70869529) og første lokale Alna-segment (way 70869513) nøyaktig node 844892785 ved 59.9665991, 10.8589871. Den delte noden brukes som `semantic_anchor`/`area_anchor` med eksplisitt anchor-metadata; legacy-punktet ved Gamle Gruvevei pensjoneres. Ingen nearest-/first-hit-logikk eller sjøsentrum-proxy brukes.

| 141 | `noklevann_ljanselva_start` | Nøklevann – utløp mot Skraperudbekken | verified_geometry | `osm-node:1636570783` |

Batch 141 (2026-07-22) løser `noklevann_ljanselva_start` som et eksplisitt hydrologisk utløpsanker i stedet for et vilkårlig innsjøpunkt. OSM relation 16661 identifiserer Nøklevann; utløpskant-way 89296578, dam-way 150774536 og Skraperudbekken-way 127882479 deler node 1636570783 på `59.8736207, 10.8582866`. Visningsnavnet korrigeres fra «Nøklevann (Ljanselva start)» til «Nøklevann – utløp mot Skraperudbekken» fordi canonical punkt representerer den dokumenterte overgangen fra Nøklevann til Skraperudbekken, ikke et påstått direkte startpunkt for hele Ljanselva.


| 142 | `plata_oslo` | Plata | verified_historical_source | `lokalhistoriewiki:plata-oslo` |
| 142 | `prindsen_mottakssenter` | Prindsen mottakssenter | verified | `geonorge-adresser-v1:0301:12782:11` |
| 142 | `fyrlyset_oslo` | Fyrlyset | verified | `geonorge-adresser-v1:0301:18016:16A` |
| 142 | `evangeliesenteret_kontaktsenter_oslo` | Evangeliesenterets kontaktsenter | verified | `geonorge-adresser-v1:0301:15458:1` |

Batch 142 (2026-07-22) etterfører den mergede Subkultur-randsonebatchen. `plata_oslo` bruker et dokumentert historisk områdeanker for den tidligere åpne russcenen ved Christian Frederiks plass. `prindsen_mottakssenter`, `fyrlyset_oslo` og `evangeliesenteret_kontaktsenter_oslo` følger address-first-policyen og bruker entydige Geonorge-adressepunkter på dokumentert besøksadresse. Batchen skiller mellom historisk åpen russcene, sosial møteplass og dagens lavterskel hjelpeinfrastruktur.

| 143 | `ljanselva_skullerud` | Ljanselva ved Skullerud | verified_geometry | `osm-way:27271638` |

Batch 143 (2026-07-22) løser `ljanselva_skullerud` som et eksplisitt line_anchor på OSM way 27271638. Batch 112 fant fem eksakt navngitte Ljanselva-segmenter i den forhåndsdefinerte lokale Skullerud-scope-boksen. Way 27271638 er det eneste av disse kandidatsegmentene hvis geometri omslutter recordens eksisterende lokale Skullerud-markør, og way-en har i tillegg alternativnavnet `Skullerudbekken`. Legacy-punktet brukes bare til identitets- og scope-disambiguering, ikke som koordinatbevis. Canonical lat/lon beregnes som lengdemidtpunkt langs selve OSM-geometrien og lagres som `semantic_anchor` / `line_anchor`; ingen nearest/first-hit-logikk brukes.

| 144 | `ljanselva_hauketo` | Ljanselva ved Hauketo | verified_geometry | `osm-way:695993872` |

Batch 144 (2026-07-22) løser `ljanselva_hauketo` som den lange åpne Ljanselva-strekningen langs Hauketo-områdets nordside fram til Lja bru. Hauketo-kilden dokumenterer Ljanselva som strøkets nordgrense, Oslo byleksikon kryssjekker Hauketo-korridoren, og den dokumenterte Lja bru-koordinaten brukes som fysisk topologisk referanse. Av de fem eksakte batch-112-kandidatene er way 695993872 den eneste lange elvegeometrien som ender ved brua; korte koblingssegmenter og segmentene på motsatt side av brua brukes ikke som proxy. Canonical lat/lon beregnes som lengdemidtpunkt langs selve OSM-wayen og lagres som `semantic_anchor` / `line_anchor`. Legacy-punktet pensjoneres; ingen nearest/first-hit-logikk brukes.

| 145 | `ljanselva_ljan` | Ljanselva ved Ljan | verified_geometry | `osm-way:98539575` |

Batch 145 (2026-07-22) korrigerer den opprinnelige batch-112-scope-boksen, som lå for langt øst og derfor ga null eksakte Ljanselva-treff for Ljan. Uavhengige kilder dokumenterer Liadalen som Ljanselvas dalføre ved Ljan. Den korrigerte Liadalen-auditen finner fem eksakt navngitte elveways; way 98539575 er den eneste over én kilometer og dekker hovedstrekningen gjennom dalen. Nedstrøms kobler den eksakt til way 156700580, som holdes av til den separate utløpsnære Fiskevollen-kontrollen. Canonical lat/lon er lengdemidtpunktet på fresh way-geometri og lagres som `semantic_anchor` / `line_anchor`. Legacy-punktet brukes ikke; ingen nearest/first-hit-logikk brukes.

| 146 | `ljanselva_fiskevollen` | Ljanselva ved Fiskevollen | verified_geometry | `osm-way:156700580` |

Batch 146 (2026-07-22) avgrenser `ljanselva_fiskevollen` som den nedre Ljanselva-korridoren mellom Liadalen og Fiskevollbukta. OSM way 156700580 er eksakt navngitt Ljanselva, kobler eksakt oppstrøms til Ljan/Liadalen-way 98539575 og ender i shared node 1689201164 med coastline way 4154785; denne kystnoden ligger 113.6 meter fra den uavhengige Fiskevollbukta-referansen. Oslo byleksikon og Ljan skole dokumenterer samtidig at den nederste fysiske delen av elva er kulvertert. Wayen brukes derfor som `semantic_anchor` / `line_anchor` for vassdragskorridoren, ikke som påstand om at hele linjen er synlig åpen elv eller som dokumentasjon av eksakt tunnelløp. Legacy-punktet brukes ikke; ingen nearest/first-hit-logikk brukes.

| 147 | `ljanselva_bunnefjorden` | Ljanselva – utløp i Fiskevollbukta | verified_geometry | `osm-node:1689201164` |

Batch 147 (2026-07-22) løser `ljanselva_bunnefjorden` som et eksplisitt hydrologisk munningsanker og presiserer visningsnavnet til «Ljanselva – utløp i Fiskevollbukta». OSM node 1689201164 er et endepunkt på den eksakt navngitte Ljanselva-wayen 156700580 og deles med coastline way 4154785. Noden ligger 113.6 meter fra den uavhengige Fiskevollbukta-referansen. Oslo byleksikon dokumenterer munningen i Fiskevollbukta og at nederste elvedel er kulvertert. Punktet representerer derfor den konkrete elv–fjord-overgangen, ikke et generelt Bunnefjorden-punkt eller et midtpunkt på en nærliggende elvegeometri. Legacy-punktet pensjoneres; ingen nearest/first-hit-logikk brukes.

| 148 | `ljanselva` | Ljanselva | verified_geometry | `osm-way:695993872` + 6 verifiserte komponentankre |

Batch 148 (2026-07-22) løser hovedrecorden `ljanselva` som en eksplisitt multi-anchor vassdragsmodell. Sju allerede `verified_geometry`-komponenter dokumenterer kjeden fra Nøklevanns utløp og Skraperudtjern via Skullerud, Hauketo, Liadalen/Ljan og den nedre Fiskevollen-korridoren til munningsnoden i Fiskevollbukta. Hauketo-way 695993872 brukes som sentralt canonical displayanker fordi det er et verifisert punkt på selve elveløpet; det påstås ikke å være geometrisk sentrum for hele vassdraget. Hovedrecordens fysiske scope ligger i den lagrede anchor-kjeden, ikke i ett syntetisk punkt eller én tilfeldig OSM-way. Ingen legacy-koordinat eller nearest/first-hit-logikk brukes.


| 146 | `brugata_storgata_rusmiljo` | Brugata / Storgata – det åpne rusmiljøet | verified | `geonorge-adresser-v1:0301:17059:33` |
| 146 | `huset_oslo` | Huset Oslo | verified | `geonorge-adresser-v1:0301:17994:22` |
| 146 | `nadheim_oslo` | Nadheim | verified | `geonorge-adresser-v1:0301:15107:45` |
| 146 | `motestedet_tollbugata` | Møtestedet – Tollbugata | verified | `geonorge-adresser-v1:0301:17577:3` |

Batch 146 (2026-07-22) etterfører Subkultur-randsonebatch 03. `brugata_storgata_rusmiljo` bruker det offisielle Geonorge-adressepunktet for Storgata 33 som semantisk områdeanker for det dokumenterte miljøet rundt Storgata/Brugata. `huset_oslo`, `nadheim_oslo` og `motestedet_tollbugata` bruker entydige Geonorge-adressepunkter på dokumenterte besøksadresser.

| 149 | `ostensjovannet_nord` | Vadedammen | verified_geometry | `osm-relation:6503853` |

Batch 149 (2026-07-23) erstatter den repo-syntetiske «Østensjøvannet nord»-identiteten med det konkrete navngitte våtmarksobjektet Vadedammen; place-id beholdes for kompatibilitet. Korrigert lokal research finner én eneste eksakt navngitt kandidat: OSM relation 6503853, modellert som pond-polygon. Østensjøvannets Venner dokumenterer Vadedammen som en kunstig anlagt, grunn våtmarksdam nord for Østensjøvannet og publiserer en GPS-referanse som faller innenfor samme polygon-scope. Canonical lat/lon beregnes deterministisk fra polygongeometrien som area-anchor. Hele naturreservatpolygonet, legacy-punktet og nearest/first-hit brukes ikke.

| 150 | `ostensjovannet_fugletarn` | Fugleskjulet ved Østensjøvannet | verified_geometry | `osm-way:533351097` |

Batch 150 (2026-07-23) retter den tidligere «Østensjøvannet fugletårn»-identiteten til det konkrete fugleskjulet på vestsiden av vannet; place-id beholdes for kompatibilitet. En objekt-type-first Overpass-audit finner nøyaktig ett leisure=bird_hide rundt Østensjøvannet: OSM way 533351097, tagget building=hut og leisure=bird_hide. En uavhengig oppdatert fugleguide beskriver tilsvarende ett bird hide på vestsiden med utsyn over de sentrale delene av vannet. Canonical lat/lon beregnes deterministisk som bygningssenter for selve OSM-polygonet og klassifiseres som building/building_center. Legacy-punktet på østsiden og nearest/first-hit brukes ikke.

| 151 | `bogerudmyra` | Bogerudmyra | verified_geometry | `osm-relation:4106652` |

Batch 151 (2026-07-23) løser Bogerudmyra som et konkret navngitt våtmarksobjekt sør for Østensjøvannet. Eksakt-name-auditen finner flere Bogerudmyra-navnetreff, men objekttypefilteret skiller entydig ut OSM relation 4106652 som eneste fysiske våtmark; de øvrige treffene er kollektivobjekter. Relation 4106652 er tagget natural=wetland, wetland=marsh og type=multipolygon. Lovdata og Østensjøvannets Venner dokumenterer Bogerudmyra som del av Østensjøvannet naturreservat. Canonical lat/lon beregnes deterministisk som arealvektet centroid av MultiPolygon-geometrien. Legacy-punktet og nearest/first-hit brukes ikke.

| 153 | `ostensjovannet_sor` | Bølerbekkens utløp i Østensjøvannet | verified_geometry | `osm-node:1110773258` |

Batch 153 (2026-07-23) erstatter den repo-syntetiske «Østensjøvannet sør»-identiteten med det konkrete hydrologiske munningspunktet der Bølerbekken møter innsjøen. Fresh OSM validerer way 1456532473 som Bølerbekken/waterway=stream og relation 33561 som Østensjøvannet/water=lake. Bekkewayen ender i node 1110773258, som samtidig ligger på outer-memberway 1122249176 i innsjø-relationen. Østensjøvannets Venner dokumenterer Bølerbekken som en viktig tilløpsbekk og fremhever sørenden/Bølerbekkens utløp som fuglerikt observasjonsområde. Canonical punkt er den eksakte delte topologinoden; legacy-punktet og nearest/first-hit brukes ikke.

| 154 | `alna_smalvoll` | Alna ved Smalvoll | verified_geometry | `osm-way:22698275` |

Batch 154 (2026-07-23) løser Alna ved Smalvoll som den lange åpne Alna-strekningen på OSM way 22698275. Wayen er topologisk koblet oppstrøms til den korte tunnel-wayen 22698285 og følger hovedspennet til Smalvollveien-korridoren gjennom det området kildene beskriver som Smalvolldalen. Fresh Smalvollveien-way 652471071 brukes bare som uavhengig geografisk korridoravgrensning; canonical lat/lon beregnes deterministisk som lengdemidtpunkt langs selve elvegeometrien. Legacy-punktet og nearest/first-hit brukes ikke.

| 155 | `alna_bryn` | Alna ved Bryn | verified_geometry | `osm-way:112543919` |

Batch 155 (2026-07-23) løser Alna ved Bryn som den lange åpne Alna-strekningen på OSM way 112543919. Fresh topologi validerer en eksakt sammenhengende Alna-way-kjede fra det allerede verifiserte Smalvoll-segmentet 22698275 fram til valgt segment, og wayen kobler direkte nedstrøms til culvert-way 113281373. Den uavhengige OSM place=Bryn-noden brukes bare som geografisk scope-kryssjekk; Bryn bru brukes ikke som proxy for den bredere elverecorden. Canonical lat/lon beregnes deterministisk som lengdemidtpunkt langs selve elvegeometrien. Legacy-punktet og nearest/first-hit brukes ikke.

| 156 | `alna_utlop_bjorvika` | Alnas historiske utløp ved Vannspeilet | verified_geometry | `osm-way:4258487` |

Batch 156 (2026-07-23) løser utløpsrecordens tidslag med to separate ankere. Canonical displayanker er Vannspeilet i Middelalderparken, fysisk kartlagt som OSM way 4258487 med navnet Tenerife; Oslo kommune dokumenterer at vannspeilet markerer Alnaelvas opprinnelige utløp, og uavhengig kildebruk kryssjekker Tenerife som tilnavn på vannspeilet. Modellen hevder ikke et eget eksakt middelaldermunningspunkt. Dagens faktiske utløp lagres separat på node 8067892897, som er endepunkt på den åpne Alna-wayen 131984275 og samtidig node på coastline way 865225826 etter tunnelstrekningen fra Kværner. Legacy-punktet og nearest/first-hit brukes ikke.

| 157 | `alnaelva` | Alnaelva | verified_geometry | `osm-way:22698275` |

Batch 157 (2026-07-23) løser hovedrecorden Alnaelva som et eksplisitt multi-anchor vassdrag fra Alungsjøens utløp gjennom Groruddammen, Alnaparken, Smalvoll, Bryn, Svartdalen og Kværnerbyen til dagens hydrologiske utløp ved Kongshavn. Vannspeilet/Tenerife beholdes som separat historisk utløpsmarkør og brukes ikke som dagens mouth-anchor. Canonical lat/lon er den allerede verifiserte Smalvoll-wayens line-anchor og deklareres bare som displayanker, ikke som geometrisk sentrum for hele elva. Alle delankre leses fra canonical verified_geometry-komponenter; legacy-punktet, nearest/first-hit og syntetisk enkeltgeometri brukes ikke.

| 159 | `alnaelvstien` | Alnastien – Svartdalen og Bryn | verified_geometry | `osm-way:113281394` |

Batch 159 (2026-07-23) retter den brede legacy-identiteten «Alnaelvstien» til den konkrete kartlagte Alnastien-komponenten gjennom Svartdalen og Bryn. Elleve fresh OSM-ways med eksakt name=Alnastien danner én uforgrenet endepunktkoblet kjede på 1642 meter. Alle ways lagres eksplisitt som routeSegments. Canonical lat/lon beregnes deterministisk som lengdemidtpunkt for hele kjeden og ligger på way 113281394, som brukes som displaykilde i coordinate-source-contract. Oslo kommune kryssjekker turveien gjennom Svartdalsparken og Alnastien-navnet i Bryn/Etterstad-scope. Modellen hevder ikke at denne komponenten er hele turveisystemet langs Alnaelva. Legacy-punktet og nearest/first-hit brukes ikke.

| 160 | `elvestrekning_bla_brenneriveien` | Elvestrekning ved Blå (Brenneriveien) | verified_geometry | `osm-way:80915045` |

Batch 160 (2026-07-23) løser den lokalt definerte Akerselva-strekningen ved Blå/Brenneriveien med eksplisitt bracket-geometri i stedet for legacy-punkt eller nearest-søk. Fresh OSM way 80915045 er Akerselva. Delstrekningen klippes mellom den fysiske Grünerbrua/Nordre gate-kryssingen (way 4826556) og Elvebakken bru-kryssingen (way 4826553); gangbroen ved Blå/Ingens gate (way 4826555) ligger strengt inne i intervallet og kryssjekkes mot Ingens gate way 4826554 og Blå node 4312299494. Canonical lat/lon er det deterministiske lengdemidtpunktet langs den klippede ca. 286.3 meter lange elvegeometrien. Hele 5,2 km-Akerselva-wayen brukes ikke som recordens scope, og legacy-koordinaten brukes ikke.

| 161 | `fossveien_elvestrekning` | Fossveien – elvestrekning | verified_geometry | `osm-way:80915045` |

Batch 161 (2026-07-23) løser Fossveien-recorden som Akerselva-strekningen som svarer til Fossveiens dokumenterte utstrekning fra Nordre gate til Seilduksgata. Sørgrensen er Grünerbrua/Nordre gate (way 4826556); nordgrensen er den fysiske broen ved Kunsthøgskolen/Seilduksgata-scope (way 3236542), med live-validert topologisk forbindelse fra Fossveiens Seilduksgata-endepunkt. De interne broene 457755404 og 4826557 ligger strengt inne i intervallet. Canonical lat/lon er lengdemidtpunktet langs den klippede ca. 584.8 meter lange Akerselva-geometrien; dagens Fossveien-way brukes ikke som et kunstig elvepunkt, og nearest/first-hit brukes ikke.

| 162 | `hausmannsomradet_elvelop` | Hausmannskvartalene – elveløp | verified_geometry | `osm-way:80915045` |

Batch 162 (2026-07-23) løser den tidligere brede «Hausmannsområdet»-recorden som Hausmannskvartalenes dokumenterte Akerselva-grense mellom Nybrua og Hausmanns bru. Oslo byleksikon avgrenser Hausmannskvartalene med Hausmanns gate i nord, Akerselva i nordøst og Storgata i sørøst. Fresh OSM way 80915045 er den synlige Akerselva-geometrien; de eksakte navngitte broflatene Nybrua (way 315066295) og Hausmanns bru (way 377766486) skjærer samme elveway og brukes som fysiske yttergrenser. Canonical lat/lon er lengdemidtpunktet langs den klippede ca. 409.3 meter lange elvegeometrien. Legacy-punktet vest for elva og nearest/first-hit brukes ikke.

| 163 | `voienfossen` | Vøyenfallene | verified_geometry | `osm-way:80915045` |

Batch 163 (2026-07-23) løser Vøyenfallene som et eksplisitt tre-fallsystem i stedet for ett tilfeldig foss-punkt. Fresh OSM way 80915045 er den synlige Akerselva-geometrien mellom de eksakte navngitte broflatene Bentsebrua (way 381743815) og Sannerbrua (way 381749952), en strekning på ca. 1148.2 meter. Nøyaktig tre waterway=waterfall-noder (7876345836, 10820084635, 5169533163) er medlemmer av samme elveway strengt inne i intervallet og lagres som egne fossankre. Canonical lat/lon er et semantisk systemanker langs elva midt i spennvidden mellom første og siste fossanker; hele segmentet og alle tre fallene er bevart i scope-metadata.

| 164 | `frysjadammen` | Oset slusebru – damanlegget ved Maridalsoset | verified_geometry | `osm-way:79506476` |

Batch 164 (2026-07-23) løser identitetskonflikten i legacy-recorden `frysjadammen`. Recordens innhold og kilder beskriver damanlegget ved Maridalsoset, ikke Brekkedammen/Kjelsåsdammen ved Frysja. Oset slusebru identifiseres gjennom den kildefestede topologien som tre-gangbrua umiddelbart nedenfor Oset anleggsbru. Bounded OSM-research fant tre brede fotbru/kjørebru-par, men bare way 79506476 og den stengte servicebrua way 66159193 oppfyller den umiddelbare naborelasjonen, med 9,6 meter mellom geometrisentrene. Canonical lat/lon er geometrisk sentrum av fresh OSM way 79506476. Det stabile placeId-et beholdes for kompatibilitet; legacy-punktet, Brekkedammen som proxy og nearest/first-hit brukes ikke.

| 165 | `stilla_nydalen` | Elvepartiet nedenfor Nydalsdammen | verified_geometry | `osm-way:66098212` |

Batch 165 (2026-07-23) løser den siste unresolved Akerselva-routeposten med direkte utløpstopologi. Verified Nydalsdammen relation 14637129, dam way 66098763 og exact name=Akerselva way 66098212 deler node 802312309; river-wayen starter i denne noden og fortsetter 161.8 meter nedstrøms. Den andre Akerselva-wayen som møter magasinet, way 1456110817, slutter ved magasinets andre grensenode og representerer det lange oppstrøms innløpet. Canonical lat/lon er det deterministiske lengdemidtpunktet på den lokale outflow-wayen. Den tekniske ID-en `stilla_nydalen` beholdes, men historiske Stilla-badekulper lenger nord brukes ikke som identitet eller koordinatproxy; legacy-punkt og nearest/first-hit brukes ikke.

Batch 174 (2026-07-23) faser ut `bantjern_salamanderlokalitet` fra aktiv runtime i stedet for å promotere et falskt koordinatanker. Kilderecorden dokumenterer en privat salamanderdam ved Bånntjernveien, mens den eksisterende app-koordinaten uttrykkelig er et offentlig næranker ved det separate skogstjernet Båntjern. Et offentlig proxy-punkt kan derfor ikke verifiseres som selve salamanderlokaliteten, og History Go skal heller ikke publisere et presist besøksmål på privat tomt. ID-en legges i `disabledPlaceIds`, Civication-mappingen fjernes, og aktive `nearby_place_ids` ryddes. Kilde- og evidensrecorden beholdes som historikk; ingen verified-telling økes.

| 175 | `blindern_forskningsparken_salamanderdam` | Blindern/Forskningsparken salamanderdam | verified_geometry | `osm-way:94984903` |

Batch 175 (2026-07-23) løser Blindern/Forskningsparken salamanderdam som et konkret offentlig damobjekt i stedet for et generisk campus-næranker. Oslo kommune dokumenterer salamandere i dam ved Forskningsparken, og Forskningsparken avgrenser dammen mellom IFI/Ole-Johan Dahls hus og Forskningsparken. Bounded research fant fire vannobjekter i den brede campus-scope-boksen, men bare OSM way 94984903 ligger i den kildefestede korridoren og innen 350 meter fra begge institusjonsankrene. Fresh way 94984903 valideres som lukket natural=water/water=pond-geometri; canonical lat/lon er polygonets arealsentrum, verifisert inne i polygonet. Punktet representerer den offentlige dammen, ikke individuelle salamanderposisjoner. Legacy-punktet og nearest/first-hit brukes ikke.

Retrospektiv compliance-audit batch 1–120 (2026-07-21): Full revisjon er nå utvidet fra de historiske batchradene til hele det aktive current verified*-settet fra Oslo-kilder. Sluttinventaret dekker 372/372 current verified*-steder uten duplikater, kontraktfeil eller metodiske review-punkter. Detaljer: `reports/oslo-coordinate-retro-compliance-20260721/final-current-oslo-compliance.json`.

### Retrospektiv current-sett compliance (2026-07-21)

Denne tabellen dekker aktive current `verified*` Oslo-steder som ikke allerede har en unik historisk batchrad i tabellen over. Radene er ikke gitt oppdiktede gamle batchnumre; de dokumenterer den retrospektive revisjonen av dagens canonical sett. Hvert sted er kontrollert mot Coordinate Source Contract v1 og klassifisert mot den låste metodeprioriteten.

| audit | placeId | navn | godkjent status | kildeobjekt | metodegrunnlag |
|---|---|---|---|---|---|
| R2026-07-21 | `abelonegarden` | Abelonegården | verified_historical_source | `lokalhistoriewiki:abelonegarden` | `historical_source_first` |
| R2026-07-21 | `amerikalinjen` | Amerikalinjen | verified | `geonorge-adresser-v1:0301:13444:2` | `address_first_official_address` |
| R2026-07-21 | `avisen_tiden_radhusgata_10` | Avisen Tiden – Rådhusgata 10 | verified | `geonorge-adresser-v1:0301:16115:10` | `address_first_official_address` |
| R2026-07-21 | `bislett_stadion` | Bislett Stadion | verified_geometry | `osm-way:115277337` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `bla_skilt_aud_schonemann_vetlandsveien_69d` | Blått skilt: Aud Schønemann | verified | `geonorge-adresser-v1:0301:18274:69D` | `address_first_official_address` |
| R2026-07-21 | `bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5` | Blått skilt: Christopher Hornsrud | verified | `geonorge-adresser-v1:0301:14777:5` | `address_first_official_address` |
| R2026-07-21 | `bla_skilt_enerhaugen_samfund_smedgata_34` | Blått skilt: Enerhaugens Samfund | verified | `geonorge-adresser-v1:0301:16675:34` | `address_first_official_address` |
| R2026-07-21 | `bla_skilt_helverschous_lokke_munkedamsveien_35` | Blått skilt: Helverschous løkke | verified | `geonorge-adresser-v1:0301:14857:35` | `address_first_official_address` |
| R2026-07-21 | `bla_skilt_stein_mehren_ullevalsveien_60` | Blått skilt: Stein Mehren | verified | `geonorge-adresser-v1:0301:17972:60` | `address_first_official_address` |
| R2026-07-21 | `bleikoya` | Bleikøya | verified_geometry | `osm-way:4154383` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `blitzhuset` | Blitzhuset | verified | `geonorge-adresser-v1:0301:15670:30C` | `address_first_official_address` |
| R2026-07-21 | `borsen_oslo` | Oslo Børs | verified | `geonorge-adresser-v1:0301:17577:2` | `address_first_official_address` |
| R2026-07-21 | `cafe_engebret` | Café Engebret | verified | `geonorge-adresser-v1:0301:10412:1B` | `address_first_official_address` |
| R2026-07-21 | `centralbanken_kirkegata` | Centralbanken | verified | `geonorge-adresser-v1:0301:13707:18` | `address_first_official_address` |
| R2026-07-21 | `den_gamle_krigsskolen` | Den gamle Krigsskolen | verified | `geonorge-adresser-v1:0301:17577:10` | `address_first_official_address` |
| R2026-07-21 | `dfds_bygget` | DFDS-bygget | verified | `geonorge-adresser-v1:0301:13630:1` | `address_first_official_address` |
| R2026-07-21 | `egertorget` | Egertorget | verified_geometry | `osm-relation:4546219` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `ekebergsletta` | Ekebergsletta | verified_geometry | `osm-relation:15951742` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `flop_museum` | FLOP Museum | verified | `geonorge-adresser-v1:0301:21509:19` | `address_first_official_address` |
| R2026-07-21 | `frogner_stadion` | Frogner stadion | verified_geometry | `osm-way:4272321` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `furuset_forum` | Furuset Forum | verified_geometry | `osm-way:131269106` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `gamlebyen_sport_og_fritid` | Gamlebyen Sport og Fritid | verified | `geonorge-adresser-v1:0301:16931:4` | `address_first_official_address` |
| R2026-07-21 | `garmanngarden` | Garmanngården | verified | `geonorge-adresser-v1:0301:16115:7` | `address_first_official_address` |
| R2026-07-21 | `grev_wedels_plass` | Grev Wedels plass | verified_geometry | `osm-way:33610051` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `hausmania` | Hausmania | verified | `geonorge-adresser-v1:0301:12782:34` | `address_first_official_address` |
| R2026-07-21 | `heggholmen` | Heggholmen | verified_geometry | `kartverket-ssr:692270` | `official_map_object_type_first` |
| R2026-07-21 | `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | verified_geometry | `osm-way:81300521` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `holmenkollen_skimuseum` | Skimuseet i Holmenkollen | verified | `geonorge-adresser-v1:0301:13850:5` | `address_first_official_address` |
| R2026-07-21 | `hotel_du_nord` | Hotel du Nord | verified | `geonorge-adresser-v1:0301:11309:13` | `address_first_official_address` |
| R2026-07-21 | `jaeger_oslo` | Jaeger | verified | `geonorge-adresser-v1:0301:12356:9` | `address_first_official_address` |
| R2026-07-21 | `jordal_amfi` | Jordal Amfi | verified_geometry | `osm-way:760875553` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `kafe_grei` | Kafé Grei | verified | `geonorge-adresser-v1:0301:16467:3` | `address_first_official_address` |
| R2026-07-21 | `kafe_haerverk` | Kafé Hærverk | verified | `geonorge-adresser-v1:0301:12782:34` | `address_first_official_address` |
| R2026-07-21 | `kirkegata_5` | Kirkegata 5 | verified | `geonorge-adresser-v1:0301:13707:5` | `address_first_official_address` |
| R2026-07-21 | `kirkeristen_basarene_brannvakten` | Kirkeristen, Basarene og Brannvakten | verified | `geonorge-adresser-v1:0301:11309:27` | `address_first_official_address` |
| R2026-07-21 | `kontraskjaeret` | Kontraskjæret | verified_geometry | `osm-way:545698008` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `last_train_oslo` | Last Train | verified | `geonorge-adresser-v1:0301:13630:45` | `address_first_official_address` |
| R2026-07-21 | `lindoya` | Lindøya | verified_geometry | `osm-relation:11816904` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `malmoya` | Malmøya | verified_geometry | `osm-way:35213472` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `manglerudhallen` | Manglerudhallen | verified_geometry | `osm-way:176303011` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `minneparken_gamlebyen` | Minneparken | verified_geometry | `osm-way:111546637` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `mir_grunerlokka_lufthavn` | MIR / Grünerløkka Lufthavn | verified | `geonorge-adresser-v1:0301:17566:69` | `address_first_official_address` |
| R2026-07-21 | `mustadgarden_kongens_gate_3` | Mustadgården – Kongens gate 3 | verified | `geonorge-adresser-v1:0301:13846:3` | `address_first_official_address` |
| R2026-07-21 | `myntgatakvartalet` | Myntgatakvartalet | verified | `geonorge-adresser-v1:0301:14919:2` | `address_first_official_address` |
| R2026-07-21 | `nakholmen` | Nakholmen | verified_geometry | `osm-way:4154397` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `nordisk_bibelmuseum` | Nordisk Bibelmuseum | verified | `geonorge-adresser-v1:0301:15006:4C` | `address_first_official_address` |
| R2026-07-21 | `norges_bank_bankplassen_2` | Norges Bank – Bankplassen 2 | verified | `geonorge-adresser-v1:0301:10412:2` | `address_first_official_address` |
| R2026-07-21 | `norges_bank_bankplassen_4` | Norges Bank – Bankplassen 4 | verified | `geonorge-adresser-v1:0301:10412:4` | `address_first_official_address` |
| R2026-07-21 | `nybrua_vaterlandsparken` | Nybrua | verified_geometry | `osm-way:315066295` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `ormoya` | Ormøya | verified_geometry | `osm-way:4154500` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `oslo_skatehall` | Oslo Skatehall | verified | `geonorge-adresser-v1:0301:16960:28` | `address_first_official_address` |
| R2026-07-21 | `ostbanestasjonen` | Østbanestasjonen | verified_geometry | `osm-way:131419741` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `palehaven_paleet` | Paléhaven og Paleet | verified_historical_source | `oppdag-kvadraturen:palehaven-og-paleet` | `historical_source_first` |
| R2026-07-21 | `rambergoya` | Rambergøya | verified_geometry | `kartverket-ssr:489838` | `official_map_object_type_first` |
| R2026-07-21 | `rock_in_oslo` | Rock In | verified | `geonorge-adresser-v1:0301:12446:14` | `address_first_official_address` |
| R2026-07-21 | `schiollgarden_prinsens_gate_26` | Schiøllgården | verified | `geonorge-adresser-v1:0301:15742:26` | `address_first_official_address` |
| R2026-07-21 | `sjofartsbygningen` | Sjøfartsbygningen | verified | `geonorge-adresser-v1:0301:13846:6` | `address_first_official_address` |
| R2026-07-21 | `skulptursonen_ovre_slottsgate` | Skulptursonen i Øvre Slottsgate | verified_geometry | `oppdag-kvadraturen:skulptursonen-i-ovre-slottsgate` | `documented_semantic_geometry` |
| R2026-07-21 | `stattholdergarden` | Stattholdergården | verified | `geonorge-adresser-v1:0301:16115:11` | `address_first_official_address` |
| R2026-07-21 | `steen_og_strom` | Steen & Strøm | verified | `geonorge-adresser-v1:0301:13846:23` | `address_first_official_address` |
| R2026-07-21 | `stortorget` | Stortorget | verified_geometry | `osm-way:179095465` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `sub_scene` | Sub Scene | verified | `geonorge-adresser-v1:0301:15980:17` | `address_first_official_address` |
| R2026-07-21 | `the_villa` | The Villa | verified | `geonorge-adresser-v1:0301:14943:23` | `address_first_official_address` |
| R2026-07-21 | `tollboden_oslo` | Tollboden | verified_geometry | `osm-way:112195502` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `tollpakkhuset` | Tollpakkhuset | verified_geometry | `osm-way:112195503` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `torggata_blad` | Torggata Blad | verified | `geonorge-adresser-v1:0301:12782:19A` | `address_first_official_address` |
| R2026-07-21 | `treschowgarden` | Treschowgården | verified | `geonorge-adresser-v1:0301:11926:2` | `address_first_official_address` |
| R2026-07-21 | `ulvoya` | Ulvøya | verified_geometry | `osm-way:4154565` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `valle_hovin_stadion` | Valle Hovin stadion | verified_geometry | `osm-way:1528387076` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `vallhall_arena` | Vallhall Arena | verified_geometry | `osm-way:50634101` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `vaterland_bar_scene` | Vaterland Bar & Scene | verified | `geonorge-adresser-v1:0301:10923:9` | `address_first_official_address` |
| R2026-07-21 | `vaterlandsparken` | Vaterlandsparken | verified_geometry | `osm-way:4334996` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `waisenhuset_kongens_gate` | Waisenhuset | verified | `geonorge-adresser-v1:0301:13846:1` | `address_first_official_address` |
| R2026-07-21 | `wessels_plass` | Wessels plass | verified_geometry | `osm-way:942267111` | `object_type_first_exact_osm_geometry` |
| R2026-07-21 | `xray_ungdomskulturhus` | X-Ray Ungdomskulturhus | verified | `geonorge-adresser-v1:0301:14622:3` | `address_first_official_address` |

Metodegrunnlagene betyr:
- `address_first_official_address`: konkret norsk adresse er verifisert med Geonorge og stabil adresse-ID.
- `object_type_first_exact_osm_geometry`: eksakt navngitt fysisk objekt/geometri er valgt etter objekttype og dokumentert scope, ikke nearest/first-hit.
- `official_map_object_type_first`: offisielt kartobjekt fra Kartverket brukes for ikke-adressebasert areal/geometri.
- `historical_source_first`: historisk sted bruker stabil historisk forskningskilde og historisk anker.
- `documented_semantic_geometry`: dokumentert linje-/områdeutstrekning bruker kildebelagt semantisk geometri.

| 166 | `trosterud_friomrade` | Lille Wembley | verified_geometry | `osm-way:220842445` |

Batch 166 (2026-07-23) løser den repo-syntetiske identiteten «Trosterud friområde» som det konkrete Lille Wembley på Haugerud. Oslo kommune dokumenterer området som statlig sikret friluftsområde og møteplass ved inngangen til marka, mens Lovdata navngir Lille Wembley som kommunalt dressurområde for hund. Fresh OSM way 220842445 hard-gates som eksakt navngitt, lukket rekreasjonsgeometri; canonical punkt er polygoncentroid. Trosterudparken, Haugerudparken, det brede planområdet og legacy-punktet brukes ikke som proxy.

| 167 | `furuset_haugerud_skogbelte` | Haugerudparken | verified_geometry | `osm-way:643537729` |

Batch 167 (2026-07-23) pensjonerer den repo-syntetiske identiteten «Furuset–Haugerud skogbelte» og modellerer recorden som det dokumenterte friområdet Haugerudparken. OSM har ingen samlet eksakt navngitt parkpolygon som kan brukes som falsk yttergrense. I stedet identifiseres ett kildebeskrevet internt anker: Oslo kommune dokumenterer en ubelyst sykkelbane bygget som grusbane, og bounded live OSM-research finner nøyaktig én særskilt match, way 643537729 (leisure=track, cycling=pump_track, sport=bmx, surface=fine_gravel). Canonical lat/lon er lengdemidtpunktet langs denne fresh geometrien. Ankeret representerer et dokumentert sted inne i parken, ikke parkens fulle areal eller geometriske sentrum; legacy-punkt og nearest/first-hit brukes ikke.

| 168 | `lillomarka` | Lillomarka | verified_geometry | `osm-relation:5806405` |

Batch 168 (2026-07-23) oppretter Lillomarka som ett bredt navngitt Marka- og skogsområde, ikke som et utfartssted eller en løypestart. Oslo kommune navngir Lillomarka som en egen del av Oslomarka og knytter Marka til friluftsliv, folkehelse og naturmangfold. Fresh exact-object lookup hard-gater OSM relation 5806405 som name=Lillomarka, category=place, type=woodland med arealgeometri. Canonical lat/lon er det geometriske representasjonspunktet for den eksakte relationen. Lilloseter, vann, stier og startpunkter brukes ikke som proxy; nearest/first-hit brukes ikke.

| 169 | `brekkedammen` | Brekkedammen ved Frysja | verified_geometry | `osm-relation:14334474` |
| 170 | `grorudparken` | Grorudparken | verified_geometry | `osm-way:125848624` |
| 171 | `aamot_bru` | Åmot bru | verified_geometry | `osm-way:791117473` |
| 172 | `klosterenga_skulpturpark` | Klosterenga skulpturpark | verified_geometry | `osm-way:4874898` |
| 173 | `peer_gynt_parken` | Peer Gynt-parken | verified_geometry | `osm-way:126850692` |
| 176 | `hellerud_gard` | Nedre Hellerud – historisk gårdssted | verified_historical_source | `history-go-research:nedre-hellerud-cadastral:143-3` |
| 177 | `ring_3` | Ring 3 | verified_geometry | `osm-way:4341399` |
### Dokumenterte Oslo-kontroller uten godkjent koordinat

Disse kontrollene er fullført, men teller ikke blant de 411 verifiserte canonical Oslo-stedene.

| kandidat | status | dokumentert konflikt | oppfølging |
|---|---|---|---|
| `sigrid_undset_statue` – Sigrid Undset-skulpturen | needs_review | Statuen er dokumentert i Stensparken og avduket i 1991, men ingen konkret adresse eller entydig sokkelkoordinat er dokumentert. | Finn eksakt monumentobjekt eller dokumentert sokkelpunkt før canonical koordinat kan godkjennes. |
| `alf_proysen_statue_nittedal` – Alf Prøysen-monumentet ved Kulturverket Flammen | needs_review; moved to Akershus/Nittedal | Recorden lå feilaktig i Oslo-kilden. Kulturverket Flammen er dokumentert på Borghild Ruds vei 3 og kommunens kunstdatabase plasserer monumentet utenfor nedre inngang, men Geonorge-adressepunktet er ikke selve sokkelen. | Finn eksakt monument-/sokkelpunkt; behold Flammen-adressen kun som foreløpig host/site-anchor. |
| `grini_fangeleir` – Grini fangeleir | needs_review; moved to Akershus/Bærum | Recorden lå feilaktig i Oslo-kilden. Bærum kommune dokumenterer leiren ved Ila, men dagens punkt mangler kildebelagt leirgeometri. | Finn offisiell/historisk leirgeometri; Grinimuseets adresse skal ikke brukes som sentrum for hele leiren. |
| `fornebu_teknologipark` – Fornebu Teknologipark | needs_review | Recorden ligger i Oslo-kilden, men Fornebu ligger i Bærum; navnet beskriver dessuten et bredt nærings-/utviklingsområde uten ett dokumentert fysisk hovedanker. | Flytt/erstatt i Bærum-kontekst etter at fysisk scope eller områdegeometri er eksplisitt definert. |
| `ulven_handelspark` – Ulven handelspark | needs_review | Audit fant Ulven som transformasjons- og næringsområde, men ingen stabil dokumentert fysisk entitet med navnet «Ulven handelspark». | Identifiser konkret handels-/næringsanlegg eller erstatt med et dokumentert områdeobjekt før koordinaten godkjennes. |
| `akershus_energi` – Akershus Energi Varme | needs_review | Recorden ligger i Oslo-kilden og har ett Oslo-punkt, men selskapet har flere dokumenterte fjernvarmeanlegg i Akershus og forretningsadresse i Lillestrøm. | Definer ett konkret anlegg som place eller modeller selskapet som aktør med flere anleggsrelasjoner; ikke behold generisk Oslo-punkt. |
| `sagene_kvernhus` – Sagene mølle og kvernhus | needs_review | Recorden kombinerer flere mølle-, sagbruks- og industriidentiteter langs Akerselva uten ett entydig fysisk anlegg; Hjula er allerede representert av `ovre_foss`. | Avgrens til ett dokumentert fysisk anlegg eller modeller industrimiljøet som område/relasjon med flere ankere. |
| `frysja_industriomrade` – Frysja industriområde | needs_review | Området er reelt, men dagens legacy `verified`-punkt bygger på `manual_map_check` og mangler kildebelagt områdegeometri eller flere area-ankre. | Hent offisiell plan-/områdegeometri eller dokumenterte area-ankre før verified-status kan forsvares. |
| `bryn_industriomrade` – Bryn industriområde | needs_review | Bryn er et stort industri- og boligstrøk på tvers av flere bydeler; recorden har ett punkt, men ingen dokumentert avgrensning av hvilket industriområde den representerer. | Definer fysisk scope og legg inn offisiell områdegeometri eller flere area-ankre. |
| `gronlikaia` – Grønlikaia | needs_review | Grønlikaia er et bredt tidligere havne-/containerområde og dagens utviklingsområde; batchens OSM-treff er serviceveier, ikke arealgeometri for hele stedet. | Hent offisiell plan-/havnegeometri eller flere dokumenterte quay-/area-ankre. |
| `akerselva_industri` – Akerselva industriområde | needs_review | Recorden beskriver en lang industrikorridor som overlapper canonical `akerselva` og flere separate industriplaces; ett punkt kan ikke representere hele systemet. | Legg inn lineær geometri/flere anchors eller modeller som tematisk relation til Akerselva og konkrete industristeder. |
| `bygdoy_roykenvika` – Bygdøy Røykensvika | needs_review | Ingen uavhengig troverdig kilde dokumenterer Røykensvika som sted på Bygdøy; gamle Mapcarta/OSM-opplysninger kan ikke verifisere en uavklart identitet. | uavhengig troverdig kilde som dokumenterer lokal stedsidentitet på Bygdøy |
| `bygdoy_natur` – Bygdøy natur- og kulturmiljø | needs_review | Recorden er et repo-syntetisk landskapssystem som kombinerer hele halvøya, kystsoner, skog og flere allerede separate canonical delsteder. Ett enkelt adresse-, strand- eller parkobjekt kan ikke legitimt representere hele natur- og kulturmiljøet. | Dokumenter en eksplisitt halvøy-/multi-anchor-modell eller offisiell områdegeometri som samsvarer med hele recordens scope. |
| `ostensjovannet_sivbelte` – Østensjøvannet sivbelte | needs_review | Recorden beskriver et habitatbelte med skiftende utstrekning, ikke ett dokumentert navngitt fysisk objekt med stabil grense. Reservatets samlede polygon kan ikke verifisere ett vilkårlig sivbelte-midpunkt. | Dokumenter eksplisitt kartlagt siv-/våtmarksgeometri eller flere kildebelagte habitatankre før et canonical punkt godkjennes. |
| `bygdoy_kongsgard_salamanderdam` – Bygdøy Kongsgård salamanderdam | needs_review | Kilderecorden dokumenterer salamanderforekomst i dam ved Bygdøy Kongsgård, men dagens koordinat er uttrykkelig et offentlig områdeanker og ikke en dokumentert koordinat for selve dammen. Å bruke Kongsgårdens områdepunkt som verified salamanderdam ville gjøre et pedagogisk proxy-anker til et falskt fysisk sted og overlappe den bredere Kongsgård-identiteten. | Dokumenter en offentlig og ikke-sensitiv damgeometri dersom lokaliteten skal være et eget place; ellers modeller salamanderforekomsten som tematisk naturrelation til Bygdøy Kongsgård uten separat koordinatmarkør. |
| `tjernsmyr_salamanderlokalitet` – Tjernsmyr salamanderlokalitet | needs_review | Recorden dokumenterer selv at Tjernsmyr ligger i Bærum, men er lagret i Oslo-kilden. En koordinat kan ikke canonical-verifiseres i Oslo-køen før geografisk eierskap og kildefamilie er rettet; dagens generiske wetland-reference mangler dessuten et stabilt eksplisitt kildeobjekt. | Flytt recorden til Akershus/Bærum-kontekst og dokumenter deretter ett stabilt Tjernsmyr-områdeobjekt eller offisiell våtmarksgeometri før koordinaten godkjennes. |
| `regjeringskvartalet` – Regjeringskvartalet | needs_review | Den avgrensede kontrollen ga ikke ett unikt eksakt navngitt fysisk objekt med godkjent objekttype (no_exact_semantic_candidate). Legacy-punktet beholdes kun som uverifisert kartanker; ingen nearest/first-hit-kandidat brukes. | Dokumenter én legitim samlet institusjonsgeometri for Regjeringskvartalet; enkeltbygninger kan ikke brukes som proxy for hele området. |
| `frognerstranda` – Frognerstranda | needs_review | Kontrollen fant ikke ett eksakt navngitt strand-/områdefysisk objekt med stabil polygongeometri (no_exact_semantic_candidate). En vei eller tilfeldig fjordkantlinje med samme navn kan ikke brukes som proxy for den brede popkulturelle strandsonen. | Dokumenter en eksplisitt Frognerstranda-områdegeometri eller flere kildebelagte strand-/promenadeankre før ett canonical representasjonspunkt godkjennes. |

Protokollsynk (2026-07-23, post batch 165): fjernet 13 stale `needs_review`-rader etter trippelkontroll mot dagens koordinat-evidens, canonical source-record og runtime-indeks. Fjernet: `alnaelva`, `alnaelvstien`, `alna_smalvoll`, `alna_bryn`, `alna_utlop_bjorvika`, `ostensjovannet_nord`, `ostensjovannet_fugletarn`, `ostensjovannet_sor`, `bogerudmyra`, `daelenenga_idrettspark`, `gressbanen`, `kfum_arena`, `nordre_aasen_idrettspark`. Ingen koordinater eller place-identiteter ble endret.
Protokollsynk (2026-07-23, post batch 176): fjernet 1 stale unresolved-rader etter kontroll mot dagens aktive runtime-indeks. Fjernet: `alnaelva_hovedsteder`. Ingen koordinater eller place-identiteter ble endret i denne synken.


## Etne – historiesett

Alle de 35 innsendte radene er kontrollert. Trettitre er verifiserte Etne-steder. To rader hadde gyldige arkeologiske beskrivelser, men var plassert i feil kommune. De er flyttet til kommunene som primærkildene dokumenterer, og beholdes nedenfor som fullførte identitetskontroller i stedet for å bli telt som Etne-steder.

| batch | placeId | navn | godkjent status | kildeobjekt |
|---:|---|---|---|---|
| 1 | `borgasen_etne` | Borgåsen bygdeborg | verified_geometry | `kulturminnesok:90166-1` |
| 1 | `bruteigsteinen_etne` | Bruteigsteinen | verified_geometry | `kulturminnesok:90158-1` |
| 1 | `gjerde_kyrkje_etne` | Gjerde kyrkje | verified | `geonorge-adresser-v1:4611:1030:2` |
| 1 | `grindheim_kyrkje_etne` | Grindheim kyrkje | verified | `geonorge-adresser-v1:4611:1054:1` |
| 1 | `helgaberget_etne` | Helgaberget | verified_geometry | `kulturminnesok:90164-1` |
| 1 | `saebotunet_etne` | Sæbøtunet | verified | `sunnhordland-museum:saebotunet` |
| 1 | `stodle_kyrkje` | Stødle kyrkje | verified | `geonorge-adresser-v1:4611:1006:183` |
| 2 | `driftevegen_stordalen_roldal` | Driftevegen Stordalen–Røldal | verified_historical_source | `kartverket-stedsnavn:671399` |
| 2 | `duesteinen_etne` | Duesteinen | verified_geometry | `kulturminnesok:90143-1` |
| 2 | `folgefonden_minnesmerke_skanevik` | Folgefonden-minnesmerket | verified_historical_source | `kartverket-stedsnavn:978614` |
| 2 | `gamle_akrafjordvegen` | Gamle Åkrafjordvegen | verified_historical_source | `kartverket-stedsnavn:64077` |
| 2 | `postvegen_etne_skanevik` | Postvegen Etne–Skånevik | verified_historical_source | `ut-turforslag:114844` |
| 2 | `postvegen_rullestadjuvet` | Postvegen i Rullestadjuvet | verified_historical_source | `kartverket-stedsnavn:550482` |
| 2 | `skanevik_gjestgjevargarden` | Skånevik Gjestgjevargard | verified | `geonorge-adresser-v1:4611:1099:4` |
| 3 | `etnesjoen_forromersk_landsby` | Den førromerske landsbyen ved Etnesjøen | verified_geometry | `kulturminnesok:130869` |
| 3 | `grindheimsveien_nord_gravfelt` | Gravfeltet ved Grindheimsvegen | verified_geometry | `kulturminnesok:90213-1` |
| 3 | `reichwald_snublesteiner_skanevik` | Reichwald-snublesteinene | verified | `geonorge-adresser-v1:4611:1152:10` |
| 3 | `sorheimsmoen_gravfelt` | Sørheimsmoen gravfelt | verified_geometry | `kulturminnesok:90185-1` |
| 3 | `steine_heio_bygdeborg` | Steine-Heio bygdeborg | verified_geometry | `kulturminnesok:90165-1` |
| 3 | `tesdal_gravfelt` | Tesdal gravfelt | verified_geometry | `kulturminnesok:90178+90168` |
| 3 | `varhaug_nervik` | Varhaug gravrøys | verified_geometry | `kulturminnesok:90182-1` |
| 4 | `dysjanes_rivaisen_gravroys` | Gravrøysa på Dysjanes | verified_geometry | `kulturminnesok:90184-1` |
| 4 | `gjerdesvagen_jernvinne` | Jernvinneanlegget i Gjerdesvågen | verified_geometry; moved to Kvinnherad | `kulturminnesok:94612-1` |
| 4 | `grindheim_jernvinne` | Jernvinna på Grindheim | verified_geometry; moved to Bømlo | `kulturminnesok:72832-1` |
| 4 | `hidlesnes_nernes_gravroys` | Gravrøysa på Hidlesnes | verified_geometry | `kulturminnesok:90179-1` |
| 4 | `keisarhaugen_frette` | Keisarhaugen på Frette | verified_geometry | `kulturminnesok:90125-1` |
| 4 | `nesjarhaugen_byrkjenes` | Nesjarhaugen | verified_geometry | `kulturminnesok:90161-1` |
| 4 | `vardahaugen_lauareid` | Vardahaugen på Lauareid | verified_geometry | `kulturminnesok:90174-1` |
| 5 | `etne_prestebustad` | Etne prestebustad | verified | `geonorge-adresser-v1:4611:1006:80` |
| 5 | `fjaera_kapell` | Fjæra kapell | verified | `geonorge-adresser-v1:4611:1133:47` |
| 5 | `grindheim_runestein` | Grindheim runestein | verified_historical_source | `kulturminnesok:84426-1` |
| 5 | `grindheim_steinkross` | Grindheim steinkross | verified_historical_source | `kulturminnesok:84426-2` |
| 5 | `hoyland_gravhaug_etne` | Gravhaugen på Høyland | verified_geometry | `kulturminnesok:90156-1` |
| 5 | `skanevik_kyrkjestad` | Skånevik kyrkjestad | verified_historical_source | `kulturminnesok:85489-4` |
| 5 | `stampehaug_meland` | Stampehaug på Meland | verified_geometry | `kulturminnesok:90135-1` |
| 121 | `bislett_stadion` | Bislett Stadion | verified_geometry | `osm-way:115277337` |
- Neste nye Oslo-kontroll er batch 122.
- `places/sport/europa/norway/oslo_sport.json` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er `places/sport/europa/norway/places_oslo_lekeplasser_trening.json`; tidligere kontrollerte placeId-er skal hoppes over.
| 121 | `jordal_amfi` | Jordal Amfi | verified_geometry | `osm-way:760875553` |
| 121 | `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | verified_geometry | `osm-way:81300521` |
| 121 | `frogner_stadion` | Frogner stadion | verified_geometry | `osm-way:4272321` |
| 121 | `valle_hovin_stadion` | Valle Hovin stadion | verified_geometry | `osm-way:1528387076` |
| 121 | `ekebergsletta` | Ekebergsletta | verified_geometry | `osm-relation:15951742` |
| 121 | `vallhall_arena` | Vallhall Arena | verified_geometry | `osm-way:50634101` |
| 121 | `manglerudhallen` | Manglerudhallen | verified_geometry | `osm-way:176303011` |
| 121 | `furuset_forum` | Furuset Forum | verified_geometry | `osm-way:131269106` |

Etne-batchmerger: `083a6a07b` / PR #2300, `f6e668d35` / PR #2305, `4c1bc18a6` / PR #2309, `c1f8f9041` / PR #2314 og `3fd6d69ac` / PR #2318.

## Neste arbeid

- Neste nye Oslo-kontroll er batch 121.
- `places/popkultur/oslo/places_oslo_populaerkultur.json` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er `places/sport/europa/norway/oslo_sport.json`; tidligere kontrollerte placeId-er skal hoppes over.
- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.
- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.

Batch 67 (2026-07-20) produserer `fotografiens_hus` som eget offentlig fotogalleri og fotografispesifikt kunststed. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Rådhusgata 20. Offisiell institusjonsinformasjon dokumenterer samme adresse og kontinuerlig bruk som visningssted siden 1999; canonical overlap-audit fant ingen identitetsduplikat. Midlertidige enkeltutstillinger forblir innholdslag og skal ikke splittes til egne overlappende place-markører.

Batch 68 (2026-07-20) produserer `christian_radich` som historisk fartøy med dokumentert Oslo-hjemmebase. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Skur 32, Akershusstranda 9. Oslo Havn dokumenterer Akershusutstikkeren som Christian Radichs hjemmehavn og fast plass siden 1994, mens VisitOSLO opplyser at skipet ligger der når det ikke er på oppdrag. Markøren bruker standard `official_address` / `address_point`-kontrakt, men place- og koordinatnotene presiserer at dette er et stabilt hjemmebaseanker og ikke live-sporing eller garanti for fysisk tilstedeværelse. `akershus_kaier` forblir det bredere lineære kaianlegget og er ikke en duplikatidentitet.

Batch 69 (2026-07-20) produserer `central_jam_e_mosque` som eget historisk religions- og institusjonssted. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Åkebergveien 28B. World Islamic Mission dokumenterer samme adresse og den formålsbygde moskeens historie; canonical overlap-audit fant ingen identitetsduplikat, og nærmeste canonical sted er en annen bygning mer enn 100 meter unna.

Batch 70 (2026-07-20) produserer `toyen_hovedgard` som eget historisk hovedgårdsanlegg. Den låste address-first-kjøringen ga ett tydelig Geonorge-treff for Trondheimsveien 23B. Hovedgården ligger fysisk inne i Botanisk hage, men er et eldre selvstendig bygg- og gårdsanlegg; `botanisk_hage`, `naturhistorisk_museum` og `klimahuset` beholdes som separate parent-/nabosteder med andre fysiske og institusjonelle skalaer.

Batch 71 (2026-07-20) produserer `museumsleiligheten_grabein` som eget sosialhistorisk museumssted. Den generelle adressen Tøyengata 38 ga flere uentydige Geonorge-treff, mens Oslo Museum og Oslo byleksikon identifiserer leiligheten i Tøyengata 38B; den presise address-first-kjøringen ga ett tydelig offisielt punkt. Recorden representerer den bevarte museumsleiligheten inne i Gråbein-komplekset, ikke hele leiegårdskomplekset eller Tøyen som område.

Batch 77 (2026-07-20) retter protokollplasseringen for `ekeberg_helleristninger`. Den opprinnelige produksjonsmergen plasserte Ekeberg-raden nederst i Etne-tabellen, mens senere Oslo-batcher fortsatte å bruke den ordinære Oslo-tabellen. Denne reparasjonen fjerner den feilplasserte raden og den gamle produksjonsteksten og registrerer Ekeberg i riktig Oslo-tabell på neste ledige batch etter siste synkroniserte `main`. Canonical place, runtime-identitet, coordinate evidence og den Riksantikvaren-verifiserte geometrien `kulturminnesok:41907` endres ikke, og Oslo-totalen forblir 224.



Batch 121 (2026-07-21) reviderer Oslo-sport-manifestet med den fullt gate-validerte payloaden fra #3158. Fresh-main-finalizeren kopierer bare sport- og evidence-filer etter å ha bevist at alle pre-eksisterende sportfiler fortsatt er byte-identiske med source-base `b0e4227557591cec48f53dcdd4eb98a0d61af072`, og at de nye evidence-filene fortsatt er fraværende på main. Stadioner og haller bruker eksakt navngitte fysiske sportsobjekter; Holmenkollen nasjonalanlegg og Ekebergsletta bruker legitime samlede områdegeometrier. `daelenenga_idrettspark`, `gressbanen`, `kfum_arena` og `nordre_aasen_idrettspark` forblir needs_review fordi kontrollen ikke ga ett entydig kildeobjekt som representerer hele canonical identiteten. Ingen nearest/first-hit-logikk brukes.

## Vestland – Etne

| batch | placeId | navn | godkjent status | kildeobjekt |
|---:|---|---|---|---|
| 3 | `brattholmen_naturreservat_etne` | Brattholmen naturreservat | verified_geometry | `miljodirektoratet-naturvern:VV00001741` |

Etne batch 3 (2026-07-21) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Artskart-revisjonen bruker det samme polygonet og er dokumentert i `reports/etne-natur-batch-4-brattholmen-artskart.json`.

| 4 | `skano_naturreservat_etne` | Skåno naturreservat | verified_geometry | `miljodirektoratet-naturvern:VV00001719` |

Etne batch 4 (2026-07-21) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Artskart-revisjonen er avgrenset til den samme polygonen og dokumentert i `reports/etne-natur-batch-5-skano-artskart.json`.

| 116 | `heggholmen` | Heggholmen | verified_geometry | `kartverket-ssr:692270` |
| 116 | `rambergoya` | Rambergøya | verified_geometry | `kartverket-ssr:489838` |
| 116 | `ormoya` | Ormøya | verified_geometry | `osm-way:4154500` |
| 116 | `malmoya` | Malmøya | verified_geometry | `osm-way:35213472` |
| 116 | `nakholmen` | Nakholmen | verified_geometry | `osm-way:4154397` |
| 116 | `lindoya` | Lindøya | verified_geometry | `osm-relation:11816904` |
| 116 | `bleikoya` | Bleikøya | verified_geometry | `osm-way:4154383` |
| 116 | `ulvoya` | Ulvøya | verified_geometry | `osm-way:4154565` |

Batch 116 (2026-07-21) produserer åtte separate Oslofjord-identiteter. Kombinerte VisitOSLO-rader er ikke kopiert som syntetiske steder: Heggholmen og Rambergøya beholdes ved siden av eksisterende `gressholmen`, og Ormøya og Malmøya beholdes som separate øyer. Eksakte OSM-øygeometrier brukes der de finnes; Heggholmen og Rambergøya bruker eksakte aktive Kartverket SSR-objekter med objekttype Øy i sjø. Alle åtte place-id-er ble kontrollert mot current runtime index umiddelbart før produksjon.

Batch 117 (2026-07-21) produserer `oslo_golfklubb_bogstad` som det sjette og siste nye stedet fra VisitOSLO Holmenkollen-auditen. Den normative address-first-kjøringen ga ett entydig Geonorge-treff for Ankerveien 127. Klubbhuset brukes som stabil offentlig display- og unlock-marker for hele golfanlegget; den omtrent 480 mål store 18-hullsbanen er stedsomfang og sportskontekst, men adressepunktet påstås ikke å være banens geometriske sentrum.

| 120 | `holmenkollen_skimuseum` | Skimuseet i Holmenkollen | verified | `geonorge-adresser-v1:0301:13850:5` |

Batch 120 (2026-07-21) produserer `holmenkollen_skimuseum` som egen museumsidentitet. Kongeveien 5 er valgt etter den lukkede adressekonflikt-auditen; Kongeveien 40 ligger 231,8 meter unna og beholdes som alternativ adkomst-/anleggsadresse i coordinate evidence. Fysisk nærhet til `holmenkollen_nasjonalanlegg` er forventet parent/child-overlap og skaper ikke et nytt hopptårn-place.


| 137 | `centralteatret` | Centralteatret | verified | `geonorge-adresser-v1:0301:10069:38` |
| 137 | `kloden_teater_pilotscenen` | Kloden teater – Pilotscenen | verified_geometry | `osm-node:13243059793` |
| 137 | `grusomhetens_teater` | Grusomhetens Teater | verified | `geonorge-adresser-v1:0301:12782:34` |

Batch 137 (2026-07-21) oppretter tre fysisk avgrensede Scenekunst-steder. `centralteatret` og `grusomhetens_teater` bruker entydige Geonorge-adressepunkter etter address-first-policyen; Grusomhetens Teater deler bevisst adresseanker med Hausmania, men representerer en selvstendig teaterscene. `kloden_teater_pilotscenen` oppgir Kabelgata 31 som besøksadresse, men Geonorge returnerer ingen matrikkeladresse for nummer 31. Nærmeste adresse, Kabelgata 33, avvises som proxy. Etter dokumentert address-first-miss brukes derfor det eksakt navngitte OSM-punktet `osm-node:13243059793`, tagget `amenity=theatre` og `name=Kloden Teater - Pilotscenen`, som verified_geometry display-marker. Kloden-recorden gjelder dagens aktive Pilotscene og skal revurderes ved åpningen av det permanente teaterhuset.

| 167 | `fotogalleriet` | Fotogalleriet | verified | `geonorge-adresser-v1:0301:14943:34A` |

Batch 167 (2026-07-23) produserer `fotogalleriet` etter den lukkede VisitOSLO gallery-priority scope-auditen og den separate Møllergata 34A–D-disambigueringen. Institusjonens egen kartlenke velger 34A blant de offisielle adresseobjektene; Geonorge forblir canonical koordinatkilde.

| 168 | `kunstnerforbundet` | Kunstnerforbundet | verified | `geonorge-adresser-v1:0301:13743:3` |

Batch 168 (2026-07-23) produserer `kunstnerforbundet` etter den lukkede VisitOSLO gallery-priority scope-auditen. Institusjonen har ingen canonical identitetsduplikat eller markør innen 35 meter og bruker det eksakte Geonorge-adressepunktet for Kjeld Stubs gate 3.
