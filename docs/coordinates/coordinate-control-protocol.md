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

Oslo-tabellen inneholder nå 129 verifiserte eller kildekontrollerte canonical steder. Batch 22 godkjenner 5 nye ankere: Kulturkirken Jakob, Ruth Maier-minnesmerket, Inger Hagerups plass, Oskar Braaten-bysten og Alexander Kiellands plass. Norli Universitetsgata og Sigrid Undset-statuen står som nye dokumenterte `needs_review`-utfall. 12 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen bruker Oslo-manifeststier i leksikografisk rekkefølge, bevarer record-rekkefølgen i hvert manifest og hopper over placeId-er som allerede er kontrollert.

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
| 22 | `kulturkirken_jakob_litteratur` | Kulturkirken Jakob | verified | `geonorge-adresser-v1:0301:12782:14` |
| 22 | `ruth_maier_minne` | Ruth Maier-minnesmerke | verified_geometry | `wikidata:Q44179381` |
| 22 | `inger_hagerups_plass` | Inger Hagerups plass | verified_geometry | `lokalhistoriewiki:Inger_Hagerups_plass` |
| 22 | `oscar_braaten_statuen` | Oscar Braaten-statuen | verified_geometry | `osm-node:10819902960` |
| 22 | `alexander_kiellands_plass` | Alexander Kiellands plass | verified_geometry | `osm-relation:7723252` |

Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).

Nyere Oslo-kontroller ble integrert gjennom PR #2327, #2330, #2332, #2335, #2338, #2342, #2343, #2347 og #2357. Protokollen ble etterført 2026-07-19 fordi disse kontrollene var dokumentert i batchrapportene og place-recordene, men ikke var blitt ført fortløpende i denne tabellen.

### Dokumenterte Oslo-kontroller uten godkjent koordinat

Disse kontrollene er fullført, men teller ikke blant de 129 verifiserte eller kildekontrollerte canonical Oslo-stedene.

| kandidat | status | dokumentert konflikt | oppfølging |
|---|---|---|---|
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
| `norli_universitetsgata` – Norli Universitetsgata | needs_review | Den offisielle adressen er Universitetsgata 22–24, mens Geonorge gir separate punkter for 22 og 24 uten kilde som identifiserer ett canonical hovedanker. | Krever eksplisitt hovedinngang/POI eller bygningsgeometri for hele 22–24-komplekset. |
| `sigrid_undset_statue` – Sigrid Undset-statuen | needs_review | Kildene dokumenterer statuen i Stensparken ved Fagerborg kirke, men ingen entydig maskinlesbar objektkoordinat ble funnet; dagens punkt ligger feil. | Krever kommunalt kunstobjekt, Wikidata/OSM-objekt eller annen stabil objektkilde med eksakt punkt. |

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

- Neste nye Oslo-kontroll er nummer 140 og starter batch 23.
- Batch 22 er fullført med 5 godkjente ankere og 2 nye dokumenterte `needs_review`-utfall.
- Sekundær Oslo-kildekø: sorter Oslo-manifeststier leksikografisk, behold `order` i hvert manifest og hopp over alle placeId-er som allerede står i protokollen.
- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.
- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.
