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

Oslo-tabellen inneholder nå 60 verifiserte eller kildekontrollerte canonical steder. Batch 1–7 dekker de første 37 stedene. Batch 8–10 legger til sju steder hver, og batch 11 er foreløpig påbegynt med to steder. I tillegg er to senere kandidater ferdig kontrollert med `needs_review` og ført separat fordi ingen koordinat ble godkjent. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.

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

Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).

Nyere Oslo-kontroller ble integrert gjennom PR #2327, #2330, #2332, #2335, #2338, #2342, #2343, #2347 og #2357. Protokollen ble etterført 2026-07-19 fordi disse kontrollene var dokumentert i batchrapportene og place-recordene, men ikke var blitt ført fortløpende i denne tabellen.

### Dokumenterte Oslo-kontroller uten godkjent koordinat

Disse kontrollene er fullført, men teller ikke blant de 60 verifiserte canonical stedene.

| kandidat | status | dokumentert konflikt | oppfølging |
|---|---|---|---|
| Frysja 33 / Brekke kraftstasjon | needs_review | Korrekt adresse er Kjelsåsveien 151, men Geonorge gir både 151B og 151C uten kilde som identifiserer hvilken bygning som er kraftstasjonen/hovedankeret. | Krever offisiell objektgeometri eller dokumentert kobling mellom bygning og husbokstav. |
| Bånkall gård | needs_review | Trondheimsveien 640 ga flere ikke-entydige Geonorge-treff uten én eksakt fysisk match. | Krever mer presis offisiell adresse eller objektgeometri før canonical koordinat kan godkjennes. |

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

- Neste nye Oslo-kontroll er nummer 61.
- Batch 11 har foreløpig to av sju planlagte steder (`lokomotivverkstedet` og `tveten_gard`); før de neste fem fortløpende inn i samme batch.
- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.
