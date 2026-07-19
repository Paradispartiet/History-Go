# Protokoll for koordinatkontroll

Sist oppdatert: 2026-07-19

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

Oslo-tabellen inneholder nå 150 verifiserte eller kildekontrollerte canonical steder. Batch 30 avslutter de to siste ukontrollerte recordene i Oslo-litteraturmanifestet med verified_geometry for Oskar Braaten-bysten ved Beierbrua og Alexander Kiellands plass. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 34.

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
| 4 | `oslo_domkirke` | Oslo domkirke | verified | `osm-node:2785921267` |
| 4 | `slottet` | Det kongelige slott | verified | `geonorge-adresser-v1:0301:21608:1` |
| 4 | `sofienberg_kirke` | Sofienberg kirke | verified | `geonorge-adresser-v1:0301:15821:18` |
| 4 | `gamle_aker_kirke` | Gamle Aker kirke | verified | `geonorge-adresser-v1:0301:10057:26` |
| 5 | `chateau_neuf` | Chateau Neuf | verified | `geonorge-adresser-v1:0301:16621:15` |
| 5 | `litteraturhuset` | Litteraturhuset | verified | `geonorge-adresser-v1:0301:18496:29` |
| 5 | `nationaltheatret` | Nationaltheatret | verified | `geonorge-adresser-v1:0301:20681:1` |
| 5 | `tronsmo_bokhandel` | Tronsmo Bokhandel | verified | `osm-node:10524908476` |
| 5 | `folketeateret` | Folketeateret | verified | `geonorge-adresser-v1:0301:18554:2` |
| 6 | `gronland_basarene` | Grønland basarene | verified | `osm-node:1022312515` |
| 6 | `mollergata_19` | Møllergata 19 | verified | `osm-way:112207578` |
| 6 | `villa_grande` | Villa Grande | verified | `osm-node:12591050047` |
| 7 | `blaa` | Blå | verified_geometry | `osm-node:4312299494` |
| 7 | `tinghuset` | Oslo tinghus | verified | `geonorge-adresser-v1:0301:11017:4` |
| 7 | `bogstad_gard` | Bogstad gård | verified_geometry | `osm-way:219498663` |
| 7 | `salt` | SALT | verified_geometry | `osm-node:6677384187` |
| 7 | `tollbukaia` | Tollbukaia | verified_historical_source | `oslobyleksikon:tollbukaia` |
| 7 | `akershus_kaier` | Akershuskaiene | verified_geometry | `osm-way:4252516` |
| 7 | `oslo_mek` | Akers mekaniske Verksted | verified_historical_source | `oslobyleksikon:akers-mek-verksted` |
| 8 | `folkeobservatoriet` | Folkeobservatoriet | verified | `geonorge-adresser-v1:0301:13070:119` |
| 8 | `kjeglebanen_langgaardslokken` | Kjeglebanen på Langgaardsløkken | verified | `geonorge-adresser-v1:0301:10898:21` |
| 8 | `radmannsgarden_og_anatomibygget` | Rådmannsgården og Anatomibygget | verified | `geonorge-adresser-v1:0301:16115:19` |
| 8 | `magistratgarden` | Magistratgården | verified | `geonorge-adresser-v1:0301:11309:11` |
| 8 | `hauges_minde` | Hauges Minde | verified | `geonorge-adresser-v1:0301:15331:2` |
| 8 | `slurpen` | Slurpen | verified | `geonorge-adresser-v1:0301:14097:79C` |
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
| 14 | `botsparken` | Botsparken | verified_geometry | `lokalhistoriewiki:gronlands-park` |
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
| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `wikidata:Q5039902` |
| 16 | `tullin` | Tullin | verified_geometry | `osm-way:666946874` |
| 16 | `okern` | Økern | verified_geometry | `wikidata:Q12011791` |
| 16 | `skoyen` | Skøyen | verified_geometry | `wikidata:Q6514682` |
| 16 | `torshov` | Torshov | verified_geometry | `wikidata:Q7827191` |
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
| 21 | `henrik_wergeland_statue` | Henrik Wergeland-statuen | verified_geometry | `wikimedia-commons:oslo-museum-ob-a17403` |
| 21 | `grotta` | Grotten | verified | `geonorge-adresser-v1:0301:18496:4` |
| 21 | `eldorado_bokhandel` | Eldorado Bokhandel | verified | `geonorge-adresser-v1:0301:17635:9A` |
| 21 | `gamle_deichman` | Gamle Deichman | verified | `geonorge-adresser-v1:0301:10244:4` |
| 22 | `klassekampen_redaksjon` | Klassekampen-redaksjonen | verified | `geonorge-adresser-v1:0301:12446:4` |
| 22 | `oslo_gassverk` | Oslo Gassverk | verified_historical_source | `oslobyleksikon:gassverket:storgata-36c` |
| 22 | `oslo_posthus` | Oslo Posthus / Hovedpostkontoret | verified | `geonorge-adresser-v1:0301:11309:15` |
| 22 | `telegrafbygningen` | Telegrafbygningen | verified_geometry | `wikidata:Q17195132` |
| 23 | `vinmonopolet_lager` | Vinmonopolets hovedlager | verified | `geonorge-adresser-v1:0301:12723:16` |
| 23 | `jernbaneverkstedet_lodalen` | Lodalen jernbaneverksted | verified | `geonorge-adresser-v1:0301:11370:2` |
| 23 | `grunnlovsbygget_bankplassen` | Den gamle Norges Bank | verified | `geonorge-adresser-v1:0301:10412:3` |
| 24 | `ovre_foss` | Øvre Foss – Hjula Veveri | verified_geometry | `wikidata:Q11975545` |
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

Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).

Nyere Oslo-kontroller ble integrert gjennom PR #2327, #2330, #2332, #2335, #2338, #2342, #2343, #2347 og #2357. Protokollen ble etterført 2026-07-19 fordi disse kontrollene var dokumentert i batchrapportene og place-recordene, men ikke var blitt ført fortløpende i denne tabellen.

### Dokumenterte Oslo-kontroller uten godkjent koordinat

Disse kontrollene er fullført, men teller ikke blant de 150 verifiserte eller kildekontrollerte canonical Oslo-stedene.

| kandidat | status | dokumentert konflikt | oppfølging |
|---|---|---|---|
| `norli_universitetsgata` – Norli Universitetsgata | needs_review | Norli oppgir Universitetsgata 22–24. Intervallsøket gir ikke ett Geonorge-treff, mens 22 og 24 gir hvert sitt separate entydige adressepunkt. | Krever dokumentert hovedinngang eller annen kilde som velger ett konkret adresseanker; ikke velg 22 eller 24 vilkårlig. |
| `sigrid_undset_statue` – Sigrid Undset-skulpturen | needs_review | Statuen er dokumentert i Stensparken og avduket i 1991, men ingen konkret adresse eller entydig sokkelkoordinat er dokumentert. | Finn eksakt monumentobjekt eller dokumentert sokkelpunkt før canonical koordinat kan godkjennes. |
| `inger_hagerups_plass` – Inger Hagerups plass | needs_review | Oslo byleksikon identifiserer plassen som snuplassen i enden av Hagapynten og navn fra 1999, men gir ikke ett adressepunkt eller offisiell plassgeometri. | Hent offisiell plassgeometri eller et eksplisitt dokumentert representativt anker. |
| `alf_proysen_statue_nittedal` – Alf Prøysen-monumentet ved Kulturverket Flammen | needs_review; moved to Akershus/Nittedal | Recorden lå feilaktig i Oslo-kilden. Kulturverket Flammen er dokumentert på Borghild Ruds vei 3 og kommunens kunstdatabase plasserer monumentet utenfor nedre inngang, men Geonorge-adressepunktet er ikke selve sokkelen. | Finn eksakt monument-/sokkelpunkt; behold Flammen-adressen kun som foreløpig host/site-anchor. |
| Frysja 33 / Brekke kraftstasjon | needs_review | Korrekt adresse er Kjelsåsveien 151, men Geonorge gir både 151B og 151C uten kilde som identifiserer hvilken bygning som er kraftstasjonen/hovedankeret. | Krever offisiell objektgeometri eller dokumentert kobling mellom bygning og husbokstav. |
| Bånkall gård | needs_review | Trondheimsveien 640 ga flere ikke-entydige Geonorge-treff uten én eksakt fysisk match. | Krever mer presis offisiell adresse eller objektgeometri før canonical koordinat kan godkjennes. |
| `ring_3` – Ring 3 | needs_review | Offisiell rv. 150-identitet er dokumentert, men ett lavpresisjonspunkt kan ikke verifisere hele ringveitraseen. | Krever routeSegments/traségeometri eller flere kildebelagte ruteankre. |
| `trikk_17_18` – Trikkelinje 17/18 | needs_review | Ruter dokumenterer begge linjene, men den kombinerte recorden har bare ett lavpresisjonspunkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller eksplisitt modellert fellessegment før canonical koordinat kan godkjennes. |
| `bislett` – Bislett strøk | needs_review | Område-recordens eksisterende punkt overlapper praktisk talt det separate canonical `bislett_stadion`-punktet. | Krever et eget dokumentert strøks-/knutepunktanker, for eksempel Bislett rundkjøring, uten å gjette koordinater. |
| `hartvig_nissens_skole_skam` – Hartvig Nissens skole (SKAM) | needs_review | Det historiske SKAM-skolebygget er identifisert, men Geonorge gir flere ikke-entydige treff for President Harbitz' gate 11. | Krever offisiell bygningsgeometri eller eksplisitt kobling mellom det historiske bygget og ett konkret adressepunkt. |
| `akerhus_slott` – Akerhus Slott | needs_review | Dokumentert legacy-typofeil/duplikat av canonical `akershus_festning`; begge representerer samme fysiske anlegg. | Migrer gamle quiz/story-referanser til `akershus_festning`; ikke godkjenn et separat fysisk anker. |
| `grini_fangeleir` – Grini fangeleir | needs_review; moved to Akershus/Bærum | Recorden lå feilaktig i Oslo-kilden. Bærum kommune dokumenterer leiren ved Ila, men dagens punkt mangler kildebelagt leirgeometri. | Finn offisiell/historisk leirgeometri; Grinimuseets adresse skal ikke brukes som sentrum for hele leiren. |
| `prinds_christian_augusts_minde` – Prinds Christian Augusts Minde | needs_review | Storgata 36 gir flere ikke-entydige Geonorge-treff for et historisk bygningskompleks; ingen husbokstav er dokumentert som canonical hovedanker. | Krever offisiell kompleks-/eiendomsgeometri eller et dokumentert representativt anker. |
| `ibsen_quotes` – Ibsen sitater / Sitatgaten | needs_review | Den fysiske installasjonen består av 69 sitater langs Karl Johans gate og Henrik Ibsens gate, men recorden har bare ett punkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller flere kildebelagte ankere før canonical koordinat kan godkjennes. |
| `good_game_redaksjon` – Good Game-redaksjonen (NRK) | needs_review | Redaksjonelt delmiljø inne i allerede canonical NRK Marienlyst; ingen separat fysisk lokasjon er dokumentert. | Modeller som subplace/relation til `nrk_huset_marienlyst`, eller dokumenter eget studio-/romanker. |
| `aftenposten_akersgata` – Aftenposten i Akersgata | needs_review | Dagens Akersgata 55 overlapper canonical `vg_huset`, mens den historiske recorden også omfatter 51/53. | Avklar om stedet skal være historisk flerankret Akersgata-record eller institusjonsrelation til A55. |
| `dagbladet_akersgata` – Dagbladet i Akersgata | needs_review | Historisk redaksjonsforankring omfatter både Akersgata 36 og 47/49, men recorden har bare ett punkt. | Krever flerankre eller et eksplisitt tidsavgrenset hovedanker. |
| `nrk_marienlyst` – NRK Marienlyst | needs_review | Repoets place-audit dokumenterer at recorden dupliserer canonical `nrk_huset_marienlyst` for det samme fysiske NRK-anlegget. | Migrer gamle næringsliv-referanser til `nrk_huset_marienlyst`; ikke godkjenn et separat fysisk punkt. |
| `fornebu_teknologipark` – Fornebu Teknologipark | needs_review | Recorden ligger i Oslo-kilden, men Fornebu ligger i Bærum; navnet beskriver dessuten et bredt nærings-/utviklingsområde uten ett dokumentert fysisk hovedanker. | Flytt/erstatt i Bærum-kontekst etter at fysisk scope eller områdegeometri er eksplisitt definert. |
| `ulven_handelspark` – Ulven handelspark | needs_review | Audit fant Ulven som transformasjons- og næringsområde, men ingen stabil dokumentert fysisk entitet med navnet «Ulven handelspark». | Identifiser konkret handels-/næringsanlegg eller erstatt med et dokumentert områdeobjekt før koordinaten godkjennes. |
| `akershus_energi` – Akershus Energi Varme | needs_review | Recorden ligger i Oslo-kilden og har ett Oslo-punkt, men selskapet har flere dokumenterte fjernvarmeanlegg i Akershus og forretningsadresse i Lillestrøm. | Definer ett konkret anlegg som place eller modeller selskapet som aktør med flere anleggsrelasjoner; ikke behold generisk Oslo-punkt. |
| `sagene_kvernhus` – Sagene mølle og kvernhus | needs_review | Recorden kombinerer flere mølle-, sagbruks- og industriidentiteter langs Akerselva uten ett entydig fysisk anlegg; Hjula er allerede representert av `ovre_foss`. | Avgrens til ett dokumentert fysisk anlegg eller modeller industrimiljøet som område/relasjon med flere ankere. |
| `st_halvard_bryggeri` – St. Halvard bryggeri | needs_review | Aktiv record oppgir feil år/geografi i forhold til det dokumenterte St. Halvards/Nora-anlegget i Pilestredet 75C. Det entydige Geonorge-punktet kan ikke anvendes før place-identiteten og historikken er korrigert. | Rett recordens historiske fakta og avklar bygningskontinuitet før Pilestredet 75C eventuelt godkjennes. |
| `oslo_kornmagasin` – Christiania kornmagasin | needs_review | Aktiv 1785-record matcher ikke sikkert det dokumenterte Kornmagasinet på Akershus, inventar 0008 fra 1788, selv om et eksakt navngitt bygningsobjekt finnes. | Avklar historisk identitet og korriger/erstatt recorden før et Akershus-anker eventuelt brukes. |
| `jernbanetorget_trafikknutepunkt` – Jernbanetorget – handelsknutepunktet | needs_review | Fysisk duplikat av allerede canonical og koordinatkontrollerte `jernbanetorget`; næringslivsvinkelen skaper ikke et nytt fysisk sted. | Migrer innhold/referanser til `jernbanetorget`, eller dokumenter en faktisk separat delentitet. |
| `oslo_kraftselskap` – Oslo Lysverker | needs_review | Recorden beskriver en institusjon og et distribusjonssystem med flere historiske anlegg; Sommerrogata 1 er et senere hovedkontor, ikke en entydig representasjon av hele 1892-recorden. | Definer ett konkret bygg/anlegg som place eller flytt institusjonshistorien ut av place-modellen. |
| `grensen_kjopesenter` – Grensen – handelens sentrum | needs_review | ID/type antyder kjøpesenter/knutepunkt, mens navn, tekst og kilder beskriver den lineære gaten Grensen. Ett punkt uten traségeometri/ankre kan ikke verifisere hele gata. | Normaliser til gate og legg inn kildebelagte endepunkter/traségeometri før koordinaten godkjennes. |
| `vippetangen_fisketorg` – Vippetangen fisketorg | needs_review | Aktiv record oppgir 1890, men fisketorget/fiskehavna ble flyttet til Vippetangen i 1905 og recorden blander marked, havn og senere Fiskehallen. | Rett tidslinje og velg eksplisitt mellom historisk fiskehavn/område og konkret Fiskehallen-bygg. |
| `frysja_industriomrade` – Frysja industriområde | needs_review | Området er reelt, men dagens legacy `verified`-punkt bygger på `manual_map_check` og mangler kildebelagt områdegeometri eller flere area-ankre. | Hent offisiell plan-/områdegeometri eller dokumenterte area-ankre før verified-status kan forsvares. |
| `norges_varemesse` – Norges Varemesse | needs_review | Recorden blander institusjonen stiftet i 1920 med Messehallen på Sjølyst fra 1962; virksomheten flyttet til Lillestrøm i 2002 og Oslo-bygningen ble revet. | Omdefiner til historisk Sjølyst-sted med historisk anker, eller flytt institusjonsinnholdet ut av place-modellen. |
| `bryn_industriomrade` – Bryn industriområde | needs_review | Bryn er et stort industri- og boligstrøk på tvers av flere bydeler; recorden har ett punkt, men ingen dokumentert avgrensning av hvilket industriområde den representerer. | Definer fysisk scope og legg inn offisiell områdegeometri eller flere area-ankre. |
| `gronlikaia` – Grønlikaia | needs_review | Grønlikaia er et bredt tidligere havne-/containerområde og dagens utviklingsområde; batchens OSM-treff er serviceveier, ikke arealgeometri for hele stedet. | Hent offisiell plan-/havnegeometri eller flere dokumenterte quay-/area-ankre. |
| `lilleborg_fabrikker` – Lilleborg Fabrikker | needs_review | Aktiv record bruker 1833, mens dette viser til oljemøllen; såpeproduksjon kom i 1842 og A/S Lilleborg Fabriker i 1897. Fabrikkomplekset har flere mulige fysiske ankere. | Rett historisk identitet/år og avgjør om fabrikkport, bevart bygg eller historisk områdegeometri skal være canonical anker. |
| `akerselva_industri` – Akerselva industriområde | needs_review | Recorden beskriver en lang industrikorridor som overlapper canonical `akerselva` og flere separate industriplaces; ett punkt kan ikke representere hele systemet. | Legg inn lineær geometri/flere anchors eller modeller som tematisk relation til Akerselva og konkrete industristeder. |

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

Etne-batchmerger: `083a6a07b` / PR #2300, `f6e668d35` / PR #2305, `4c1bc18a6` / PR #2309, `c1f8f9041` / PR #2314 og `3fd6d69ac` / PR #2318.

## Neste arbeid

- Neste nye Oslo-kontroll er nummer 175 og starter batch 29.
- Batch 28 er fullført med to nye godkjente plassankere; `places_by_manifest.json` er nå ferdig kontrollert.
- By-manifestet er uttømt etter `christiania_torv`. Før batch 29 starter skal neste aktive sekundære Oslo-kildekø auditeres eksplisitt mot top-level manifestrekkefølgen; ikke gjett neste kategori.
- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.
- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.
