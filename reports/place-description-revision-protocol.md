# Protokoll for desc/popupDesc-revisjonen

Dette dokumentet er den løpende produksjonsprotokollen for steder som er oppgradert etter den nye standarden i `PLACE_DESCRIPTION_CANONICAL.md`.

Oslo-omfanget skal telles fra alle faktiske, manifestlastede stedsobjekter på tvers av fagmapper og filstrukturer. Den tidligere listen på 90 steder var en delkø, ikke hele Oslo.

## Bindende ferdigkrav

- `desc`: normalt 40–80 ord.
- `popupDesc`: minst 300 ord; normalt 300–600 ord.
- `popupDesc`: minst tre avsnitt.
- Teksten skal være stedsspesifikk, faktabåret og kildegrunnlaget skal være inspiserbart.
- Bare steder som er ferdig skrevet, validert og merget på `main` telles i den publiserte totalen.

## Oslo-status etter full scope-audit

- Totalt aktive Oslo-steder: **512 steder**
- Ferdige etter alle mergede revisjonsbatcher: **239 steder**
- Gjenstår: **273 steder**
- Full restkø og ordtelling: `reports/oslo-place-description-scope-audit-2026-07-26.md`

## Ferdige steder etter denne PR-en

| Nr. | Sted | place_id | desc | popupDesc | Avsnitt | PR |
|---:|---|---|---:|---:|---:|---|
| 1 | Torggata | `torggata` | 49 | 482 | 5 | #3954 |
| 2 | Bispelokket / Trafikkmaskinen | `bispelokket` | 56 | 401 | 5 | #3958 |
| 3 | Ring 3 | `ring_3` | 50 | 422 | 5 | #4014 |
| 4 | Storgata | `storgata` | 43 | 420 | 7 | #4014 |
| 5 | Nydalen | `nydalen` | 55 | 421 | 7 | #4014 |
| 6 | Stensparken | `stensparken` | 46 | 397 | 7 | #4014 |
| 7 | Akerselva | `akerselva` | 51 | 445 | 8 | #4014 |
| 8 | Torshov | `torshov` | 53 | 411 | 7 | #4014 |
| 9 | Grorud | `grorud` | 57 | 403 | 7 | #4014 |
| 10 | Sagene | `sagene` | 52 | 416 | 7 | #4014 |
| 11 | Barcode | `barcode` | 58 | 411 | 7 | #4014 |
| 12 | Bjørvika | `bjorvika` | 49 | 426 | 8 | #4014 |
| 13 | Grønland Basarene | `gronland_basarene` | 46 | 300 | 4 | #4036 |
| 14 | Karl Johans gate | `karl_johan` | 46 | 386 | 5 | #4036 |
| 15 | Rådhusplassen | `radhusplassen` | 48 | 311 | 5 | #4036 |
| 16 | Tigerstatuen | `tigeren` | 46 | 316 | 5 | #4036 |
| 17 | Tøyen torg | `toyen_torg` | 43 | 336 | 6 | #4036 |
| 18 | Oslo S | `oslo_s` | 45 | 370 | 6 | #4036 |
| 19 | Jernbanetorget | `jernbanetorget` | 48 | 353 | 6 | #4036 |
| 20 | Aker Brygge | `aker_brygge` | 51 | 382 | 6 | #4036 |
| 21 | Vulkan energisentral | `vulkan_energisentral` | 48 | 351 | 6 | #4036 |
| 22 | Oslo bussterminal | `oslo_bussterminal` | 50 | 366 | 7 | #4036 |
| 23 | Helsfyr | `helsfyr` | 47 | 338 | 5 | #4043 |
| 24 | Bogstadveien | `bogstadveien` | 49 | 329 | 5 | #4043 |
| 25 | Markveien | `markveien` | 48 | 303 | 5 | #4043 |
| 26 | Grønlandsleiret | `gronlandsleiret` | 43 | 329 | 6 | #4043 |
| 27 | Majorstukrysset | `majorstuen_krysset` | 41 | 337 | 6 | #4043 |
| 28 | Rodeløkka | `rodelokka` | 48 | 345 | 6 | #4043 |
| 29 | Vålerenga | `vaalerenga` | 49 | 318 | 6 | #4043 |
| 30 | Vinderen | `vinderen` | 49 | 332 | 6 | #4043 |
| 31 | Ullern | `ullern` | 41 | 310 | 6 | #4043 |
| 32 | Grønland kirke | `gronland_kirke` | 46 | 309 | 6 | #4043 |
| 33 | Kampen kirke | `kampen_kirke` | 51 | 317 | 5 | #4069 |
| 34 | Ullevål Hageby | `ullevål_hageby` | 51 | 351 | 6 | #4069 |
| 35 | Romsås | `romsaås` | 48 | 321 | 6 | #4069 |
| 36 | Grünerløkka – Helgesens / Thorvald Meyers | `grunerlokka_helgesens_tm` | 44 | 321 | 6 | #4069 |
| 37 | Spikersuppa | `spikersuppa` | 45 | 319 | 6 | #4069 |
| 38 | Bankplassen | `bankplassen` | 46 | 372 | 7 | #4069 |
| 39 | Christiania Torv | `christiania_torv` | 49 | 357 | 7 | #4069 |
| 40 | Botsparken | `botsparken` | 44 | 314 | 6 | #4069 |
| 41 | Slottsparken | `slottsparken` | 47 | 335 | 7 | #4069 |
| 42 | Tjuvholmen | `tjuvholmen` | 43 | 351 | 7 | #4069 |
| 43 | Sørenga | `sorenga` | 49 | 326 | 6 | #4101 |
| 44 | Majorstuen T-banestasjon | `majorstuen_tbanestasjon` | 48 | 305 | 6 | #4101 |
| 45 | Nationaltheatret stasjon | `nationaltheatret_stasjon` | 48 | 316 | 6 | #4101 |
| 46 | Bislett | `bislett` | 50 | 340 | 6 | #4101 |
| 47 | Olaf Ryes plass | `olaf_ryes_plass` | 46 | 303 | 6 | #4101 |
| 48 | Birkelunden | `birkelunden` | 54 | 309 | 6 | #4101 |
| 49 | Universitetsplassen | `universitetsplassen` | 54 | 309 | 6 | #4101 |
| 50 | Deichman Bjørvika | `deichman_bjorvika` | 52 | 328 | 6 | #4101 |
| 51 | Vigelandsparken | `vigelandsparken` | 48 | 351 | 7 | #4101 |
| 52 | Voienvolden | `voienvolden` | 50 | 307 | 7 | #4101 |
| 53 | Carl Berners plass | `carl_berner_plass` | 49 | 309 | 6 | #4124 |
| 54 | Tullin | `tullin` | 48 | 318 | 6 | #4124 |
| 55 | Økern | `okern` | 49 | 308 | 6 | #4124 |
| 56 | Skøyen | `skoyen` | 48 | 303 | 6 | #4124 |
| 57 | Trikkelinje 17/18 | `trikk_17_18` | 49 | 301 | 6 | #4124 |
| 58 | St. Hanshaugen park | `st_hanshaugen_park` | 53 | 311 | 7 | #4124 |
| 59 | Saga kino | `saga_kino` | 48 | 337 | 6 | #4137 |
| 60 | Klingenberg kino | `klingenberg_kino` | 45 | 336 | 6 | #4137 |
| 61 | Gimle kino | `gimle_kino` | 51 | 320 | 6 | #4137 |
| 62 | Vika kino | `vika_kino` | 50 | 310 | 6 | #4137 |
| 63 | Hartvig Nissens skole (SKAM) | `hartvig_nissens_skole_skam` | 45 | 331 | 6 | #4137 |
| 64 | Middelalderparken | `middelalder_oslo` | 43 | 308 | 6 | #4137 |
| 65 | Gamlebyen gravlund | `gamlebyen_gravlund` | 44 | 302 | 6 | #4137 |
| 66 | Akershus festning | `akershus_festning` | 48 | 306 | 6 | #4137 |
| 67 | Hovedøya kloster | `hovedoya_kloster` | 44 | 301 | 6 | #4137 |
| 68 | Villa Grande | `villa_grande` | 48 | 325 | 6 | #4137 |

| 69 | Gamle Aker kirke | `gamle_aker_kirke` | 48 | 310 | 6 | #4147 |
| 70 | Vår Frelsers gravlund | `var_frelsers_gravlund` | 52 | 315 | 6 | #4147 |
| 71 | Bogstad gård | `bogstad_gard` | 50 | 307 | 6 | #4147 |
| 72 | Møllergata 19 | `mollergata_19` | 45 | 304 | 6 | #4147 |
| 73 | Sagene skole | `sagene_skole` | 49 | 314 | 6 | #4147 |
| 74 | Oslo domkirke | `oslo_domkirke` | 50 | 304 | 6 | #4147 |
| 75 | Damstredet og Telthusbakken | `damstredet_telthusbakken` | 46 | 304 | 6 | #4147 |
| 76 | Gamle trikkestallen på Sagene | `gamle_trikkestallen` | 47 | 308 | 6 | #4147 |
| 77 | Det kongelige slott | `slottet` | 51 | 301 | 6 | #4147 |
| 78 | Sofienberg kirke | `sofienberg_kirke` | 52 | 302 | 6 | #4147 |

| 79 | Trefoldighetskirken | `trefoldighetskirken` | 50 | 302 | 6 | #4149 |
| 80 | Nonneseter kloster | `nonneseter_kloster` | 53 | 321 | 6 | #4149 |
| 81 | Oslo ladegård | `oslo_ladegard` | 50 | 305 | 6 | #4149 |
| 82 | Galgeberg | `galgeberg` | 49 | 314 | 6 | #4149 |
| 83 | Oslo Hospital | `oslo_hospital` | 52 | 300 | 6 | #4149 |
| 84 | Botsfengselet | `botsfengselet` | 51 | 306 | 6 | #4149 |
| 85 | Prinds Christian Augusts Minde | `prinds_christian_augusts_minde` | 51 | 308 | 6 | #4149 |
| 86 | Peststøtten – Krist kirkegård | `peststotten_krist_kirkegard` | 51 | 302 | 6 | #4149 |
| 87 | Kjærlighetskarusellen | `kjaerlighetskarusellen` | 53 | 300 | 6 | #4149 |
| 88 | Villa Stenersen | `villa_stenersen` | 55 | 317 | 6 | #4149 |

| 89 | St. Hallvard kirke og kloster | `st_hallvard_kirke_kloster` | 52 | 301 | 6 | #4150 |
| 90 | Gamle rådhus | `gamle_radhus` | 50 | 300 | 6 | #4150 |

| 91 | Frognerparken | `frognerparken` | 44 | 302 | 6 | #4167 |
| 92 | Grorudparken | `grorudparken` | 45 | 313 | 6 | #4167 |
| 93 | Kampen park | `kampen_park` | 45 | 311 | 6 | #4167 |
| 94 | Kirsebærlunden | `kirsebarlunden` | 40 | 303 | 6 | #4167 |
| 95 | Egertorget | `egertorget` | 43 | 301 | 6 | #4167 |
| 96 | Grev Wedels plass | `grev_wedels_plass` | 42 | 302 | 6 | #4167 |
| 97 | Stortorget | `stortorget` | 43 | 302 | 6 | #4167 |
| 98 | Wessels plass | `wessels_plass` | 44 | 312 | 6 | #4167 |
| 99 | Østbanestasjonen | `ostbanestasjonen` | 41 | 329 | 6 | #4167 |
| 100 | Schiøllgården | `schiollgarden_prinsens_gate_26` | 42 | 309 | 6 | #4167 |

| 101 | Akrobaten gangbro | `akrobaten_gangbro` | 42 | 307 | 6 | #4170 |
| 102 | Fagerborg kirke | `fagerborg_kirke` | 44 | 302 | 6 | #4170 |
| 103 | Frogner kirke | `frogner_kirke` | 46 | 307 | 6 | #4170 |
| 104 | Holmenkollen kapell | `holmenkollen_kapell` | 42 | 317 | 6 | #4170 |
| 105 | Kampen Økologiske Barnebondegård | `kampen_okologiske_barnebondegard` | 46 | 309 | 6 | #4170 |
| 106 | Lindøya | `lindoya` | 44 | 304 | 6 | #4170 |
| 107 | Losæter | `losaeter` | 46 | 308 | 6 | #4170 |
| 108 | Nakholmen | `nakholmen` | 44 | 308 | 6 | #4170 |
| 109 | Ormøya | `ormoya` | 40 | 303 | 6 | #4170 |
| 110 | Sukkerbiten badstulandsby | `sukkerbiten_badstulandsby` | 45 | 304 | 6 | #4170 |

| 111 | Torshovparken | `torshovparken` | 46 | 301 | 6 | #4173 |
| 112 | Ulvøya | `ulvoya` | 42 | 302 | 6 | #4173 |
| 113 | Uranienborg kirke | `uranienborg_kirke` | 46 | 300 | 6 | #4173 |
| 114 | Vikaterrassen | `vikaterrassen` | 41 | 301 | 6 | #4173 |
| 115 | Rudolf Nilsens plass | `rudolf_nilsens_plass` | 44 | 300 | 6 | #4173 |
| 116 | Snippen lekepark | `snippen_lekepark` | 40 | 304 | 6 | #4173 |
| 117 | Sofienbergparken | `sofienbergparken` | 43 | 305 | 6 | #4173 |
| 118 | Torshovdalen | `torshovdalen` | 45 | 301 | 6 | #4173 |

| 119 | Cinemateket i Oslo | `cinemateket_oslo` | 44 | 305 | 6 | #4174 |
| 120 | Colosseum kino | `colosseum_kino` | 42 | 308 | 6 | #4174 |

| 121 | Hallvardskirken i middelalder-Oslo | `hallvardskirken_oslo` | 42 | 304 | 6 | #4180 |
| 122 | Frammuseet | `frammuseet` | 45 | 305 | 6 | #4180 |
| 123 | Gol stavkirke – Bygdøy | `gol_stavkirke_bygdoy` | 42 | 308 | 6 | #4180 |
| 124 | Kon-Tiki Museet | `kon_tiki_museet` | 46 | 309 | 6 | #4180 |
| 125 | Forsvarsmuseet | `forsvarsmuseet` | 46 | 301 | 6 | #4180 |
| 126 | Nordisk Bibelmuseum | `nordisk_bibelmuseum` | 45 | 301 | 6 | #4180 |
| 127 | Norges Hjemmefrontmuseum | `norges_hjemmefrontmuseum` | 41 | 301 | 6 | #4180 |
| 128 | Blått skilt: Enerhaugens Samfund | `bla_skilt_enerhaugen_samfund_smedgata_34` | 45 | 306 | 6 | #4180 |
| 129 | Blått skilt: Helverschous løkke | `bla_skilt_helverschous_lokke_munkedamsveien_35` | 46 | 300 | 6 | #4180 |
| 130 | Magistratgården | `magistratgarden` | 45 | 307 | 6 | #4180 |

| 131 | Rådmannsgården og Anatomibygget | `radmannsgarden_og_anatomibygget` | 46 | 306 | 6 | #4182 |
| 132 | Hauges Minde | `hauges_minde` | 46 | 304 | 6 | #4182 |
| 133 | Slurpen | `slurpen_lakkegata` | 43 | 301 | 6 | #4182 |
| 134 | Geitmyra gård | `geitmyra_gard` | 43 | 301 | 6 | #4182 |
| 135 | Grønland politistasjon | `gronland_politistasjon` | 45 | 300 | 6 | #4182 |
| 136 | Sagene festivitetshus | `sagene_festivitetshus` | 43 | 300 | 6 | #4182 |
| 137 | Stubljan-paviljongen i Hvervenbukta | `stubljan_paviljongen_hvervenbukta` | 45 | 302 | 6 | #4182 |
| 138 | Trosterudvillaen | `trosterudvillaen` | 46 | 301 | 6 | #4182 |
| 139 | Lambertseter gård | `lambertseter_gard` | 46 | 301 | 6 | #4182 |
| 140 | Lokomotivverkstedet | `lokomotivverkstedet` | 48 | 300 | 6 | #4182 |

| 141 | Nordre Skøyen hovedgård | `nordre_skoyen_hovedgard` | 40 | 306 | 6 | #4190 |
| 142 | Øvre Fossum gård | `ovre_fossum_gard` | 43 | 307 | 6 | #4190 |
| 143 | Saxegården | `saxegarden` | 41 | 305 | 6 | #4190 |
| 144 | Sporveismuseet | `sporveismuseet` | 41 | 304 | 6 | #4190 |
| 145 | Tveten gård | `tveten_gard` | 42 | 306 | 6 | #4190 |
| 146 | Minneparken | `minneparken_gamlebyen` | 45 | 301 | 6 | #4190 |
| 147 | Bånkall gård | `bankall_gard` | 41 | 301 | 6 | #4190 |
| 148 | Mustadgården – Kongens gate 3 | `mustadgarden_kongens_gate_3` | 46 | 304 | 6 | #4190 |
| 149 | Den gamle Krigsskolen | `den_gamle_krigsskolen` | 40 | 300 | 6 | #4190 |
| 150 | Kirkeristen, Basarene og Brannvakten | `kirkeristen_basarene_brannvakten` | 40 | 300 | 6 | #4190 |

| 151 | Garmanngården | `garmanngarden` | 48 | 303 | 6 | #4200 |
| 152 | Myntgatakvartalet | `myntgatakvartalet` | 46 | 311 | 6 | #4200 |
| 153 | Stattholdergården | `stattholdergarden` | 47 | 312 | 6 | #4200 |
| 154 | Waisenhuset | `waisenhuset_kongens_gate` | 45 | 315 | 6 | #4200 |
| 155 | Kontraskjæret | `kontraskjaeret` | 44 | 301 | 6 | #4200 |
| 156 | Paléhaven og Paleet | `palehaven_paleet` | 45 | 310 | 6 | #4200 |
| 157 | Avisen Tiden – Rådhusgata 10 | `avisen_tiden_radhusgata_10` | 44 | 303 | 6 | #4200 |
| 158 | Åmot bru | `aamot_bru` | 43 | 307 | 6 | #4200 |
| 159 | Abelonegården | `abelonegarden` | 42 | 308 | 6 | #4200 |
| 160 | Arbeidermuseet | `arbeidermuseet` | 45 | 305 | 6 | #4200 |

| 161 | Brannmuseet i Oslo | `brannmuseet_oslo` | 48 | 317 | 6 | #4204 |
| 162 | Bygdø Kongsgård | `bygdoy_kongsgard` | 41 | 305 | 6 | #4204 |
| 163 | Central Jam-e-Mosque | `central_jam_e_mosque` | 44 | 314 | 6 | #4204 |
| 164 | Christian Radich | `christian_radich` | 42 | 300 | 6 | #4204 |
| 165 | Clemenskirkeruinen | `clemenskirken_ruin_oslo` | 41 | 301 | 6 | #4204 |
| 166 | Helleristningene på Ekeberg | `ekeberg_helleristninger` | 41 | 303 | 6 | #4204 |
| 167 | Ekebergparken Museum | `ekebergparken_museum` | 40 | 301 | 6 | #4204 |
| 168 | Frogner hovedgård | `frogner_hovedgard` | 42 | 305 | 6 | #4204 |
| 169 | Gamlebyen kirke | `gamlebyen_kirke` | 40 | 303 | 6 | #4204 |
| 170 | Heggholmen | `heggholmen` | 44 | 306 | 6 | #4204 |

| 171 | Historisk museum | `historisk_museum` | 40 | 310 | 6 | #4212 |
| 172 | Skimuseet i Holmenkollen | `holmenkollen_skimuseum` | 43 | 304 | 6 | #4212 |
| 173 | Jødisk Museum i Oslo | `jodisk_museum_oslo` | 47 | 307 | 6 | #4212 |
| 174 | Mariakirken-ruinen | `mariakirken_ruin_oslo` | 41 | 300 | 6 | #4212 |
| 175 | Møllergata skole | `mollergata_skole` | 47 | 304 | 6 | #4212 |
| 176 | Museumsleiligheten Gråbein | `museumsleiligheten_grabein` | 42 | 312 | 6 | #4212 |
| 177 | Nobels Fredssenter | `nobels_fredssenter` | 41 | 305 | 6 | #4212 |
| 178 | Norsk Folkemuseum | `norsk_folkemuseum` | 48 | 315 | 6 | #4212 |
| 179 | Norsk Maritimt Museum | `norsk_maritimt_museum` | 43 | 305 | 6 | #4212 |
| 180 | Oscarshall | `oscarshall` | 47 | 301 | 6 | #4212 |

| 181 | Paulus kirke | `paulus_kirke` | 46 | 308 | 6 | #4225 |
| 182 | The Mini Bottle Gallery | `the_mini_bottle_gallery` | 47 | 307 | 6 | #4225 |
| 183 | Tøyen hovedgård | `toyen_hovedgard` | 46 | 313 | 6 | #4225 |
| 184 | Vålerenga kirke | `valerenga_kirke` | 47 | 315 | 6 | #4225 |
| 185 | Vestre gravlund | `vestre_gravlund` | 43 | 305 | 6 | #4225 |
| 186 | The Viking Planet Oslo | `viking_planet_oslo` | 45 | 315 | 6 | #4225 |
| 187 | Vikingtidsmuseet | `vikingtidsmuseet` | 46 | 303 | 6 | #4225 |

| 188 | Frognerstranda | `frognerstranda` | 43 | 305 | 6 | #4253 |
| 189 | Grand Hotel | `grand_hotel` | 45 | 300 | 6 | #4253 |
| 190 | Aftenposten – Akersgata 51 | `aftenposten_akersgata` | 41 | 309 | 6 | #4253 |
| 191 | Dagbladet – Akersgata 49 | `dagbladet_akersgata` | 41 | 300 | 6 | #4253 |
| 192 | Klassekampen-redaksjonen | `klassekampen_redaksjon` | 45 | 301 | 6 | #4253 |
| 193 | NRK-huset på Marienlyst | `nrk_huset_marienlyst` | 42 | 300 | 6 | #4253 |
| 194 | VG-huset | `vg_huset` | 42 | 312 | 6 | #4253 |

| 195 | Blå | `blaa` | 40 | 300 | 6 | #4257 |
| 196 | John Dee | `john_dee` | 44 | 300 | 6 | #4257 |
| 197 | Rockefeller Music Hall | `rockefeller` | 43 | 301 | 6 | #4257 |
| 198 | SALT | `salt` | 41 | 300 | 6 | #4257 |
| 199 | Sentrum Scene | `sentrum_scene` | 43 | 301 | 6 | #4257 |




| 200 | Psykologisk institutt, UiO | `psykologisk_institutt_uio` | 48 | 311 | 6 | #4261 |


| 201 | Blått skilt: Christopher Hornsrud | `bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5` | 44 | 311 | 6 | #4269 |
| 202 | 22. juli-senteret | `22_juli_senteret` | 44 | 310 | 6 | #4269 |
| 203 | Arbeidersamfunnets plass | `arbeidersamfunnets_plass` | 45 | 305 | 6 | #4269 |
| 204 | Eidsvolls plass | `eidsvolls_plass` | 44 | 304 | 6 | #4269 |
| 205 | Folkets Hus i Oslo | `folkets_hus_oslo` | 45 | 302 | 6 | #4269 |
| 206 | Høyblokka | `hoyblokka` | 43 | 301 | 6 | #4269 |
| 207 | Høyesteretts hus | `hoyesteretts_hus` | 46 | 303 | 6 | #4269 |
| 208 | Høyres Hus | `hoyres_hus` | 45 | 306 | 6 | #4269 |
| 209 | Oslo rådhus | `oslo_radhus` | 42 | 307 | 6 | #4269 |
| 210 | Politihuset på Grønland | `politihuset_gronland` | 44 | 304 | 6 | #4269 |


| 211 | Regjeringskvartalet | `regjeringskvartalet` | 45 | 321 | 6 | #4278 |
| 212 | Statsministerboligen | `statsministerboligen` | 47 | 302 | 6 | #4278 |
| 213 | Stortinget | `stortinget` | 46 | 303 | 6 | #4278 |
| 214 | Oslo tinghus | `tinghuset` | 45 | 306 | 6 | #4278 |
| 215 | Victoria terrasse | `victoria_terrasse` | 46 | 322 | 6 | #4278 |
| 216 | Y-blokka – historisk sted | `y_blokka` | 50 | 306 | 6 | #4278 |
| 217 | Youngstorget | `youngstorget` | 50 | 314 | 6 | #4278 |
| 218 | Slottsplassen | `slottsplassen` | 44 | 302 | 6 | #4278 |


| 219 | Nobelinstituttet | `nobelinstituttet` | 40 | 354 | 6 | #4292 |
| 220 | Observatoriet | `observatoriet` | 43 | 326 | 6 | #4292 |
| 221 | Folkeobservatoriet | `folkeobservatoriet_holmenkollen` | 43 | 342 | 6 | #4292 |
| 222 | Abelhaugen | `abelhaugen` | 44 | 349 | 6 | #4292 |
| 223 | Arkitektur- og designhøgskolen i Oslo | `arkitektur_og_designhogskolen` | 42 | 336 | 6 | #4292 |
| 224 | BI i Nydalen | `bi_nydalen` | 42 | 330 | 6 | #4292 |
| 225 | Botanisk hage | `botanisk_hage` | 46 | 346 | 6 | #4292 |
| 226 | Forskningsparken | `forskningsparken` | 44 | 322 | 6 | #4292 |
| 227 | Gamlebyen skole | `gamlebyen_skole` | 41 | 327 | 6 | #4292 |
| 228 | Klimahuset | `klimahuset` | 42 | 328 | 6 | #4292 |


| 229 | Meteorologisk institutt | `meteorologisk_institutt` | 45 | 302 | 6 | #4298 |
| 230 | Naturhistorisk museum | `naturhistorisk_museum` | 43 | 314 | 6 | #4298 |
| 231 | OsloMet, Pilestredet | `oslo_met_pilestredet` | 41 | 303 | 6 | #4298 |
| 232 | Oslo Reptilpark | `oslo_reptilpark` | 48 | 314 | 6 | #4298 |
| 233 | Radiumhospitalet | `radiumhospitalet` | 45 | 310 | 6 | #4298 |
| 234 | Rikshospitalet | `rikshospitalet` | 41 | 310 | 6 | #4298 |
| 235 | Norsk Teknisk Museum | `teknisk_museum` | 43 | 317 | 6 | #4298 |
| 236 | Tvergastein | `tvergastein` | 47 | 306 | 6 | #4298 |
| 237 | Universitetet i Oslo, Blindern | `universitetet_i_oslo_blindern` | 40 | 300 | 6 | #4298 |
| 238 | Universitetets gamle hovedbygning | `universitetets_gamle_hovedbygning` | 47 | 309 | 6 | #4298 |


| 239 | Universitetets gamle kjemibygning | `universitetets_gamle_kjemi` | 44 | 301 | 6 | #4302 |

## Gjenstående Oslo-kø

Det gjenstår **273 aktive Oslo-steder** uten ferdig desc/popupDesc-revisjon. Den autoritative, filspesifikke køen ligger i `reports/oslo-place-description-scope-audit-2026-07-26.md`.

- natur: **74**
- naeringsliv: **47**
- kunst: **40**
- subkultur: **38**
- sport: **29**
- scenekunst: **24**
- litteratur: **21**

## Oppdagede metadataavvik utenfor denne PR-ens tekstomfang

- `cinemateket_oslo.year` står som 1956, mens Cinemateket i Oslo startet med visninger i 1984 og flyttet til Filmens hus i 1996.

- `saga_kino.year` står som 1989, mens kinoen åpnet i 1934 og ble bygget om til kinosenter i 1981.
- `vika_kino.year` står som 1981, mens dagens kino i Ruseløkkveien 14 åpnet i 1997.
- `klingenberg_kino.category` står som `sport` selv om filens emner og innhold gjelder film- og kinokultur.

- `gamlebyen_skole.year` står som 1799, mens Gamlebyen skoles egen historikk dokumenterer at skolen åpnet som Oslo skole 1. november 1881.

- `tvergastein` ligger fysisk i Hol kommune, men telles i Oslo-revisjonskøen fordi filen ligger under `data/places/vitenskap/oslo`; scopeplasseringen må vurderes separat.

Disse avvikene skal repareres i et eget, eksplisitt metadataarbeid og ikke blandes skjult inn i desc/popupDesc-revisjonen.

## Batchlogg

| Batch | Steder | Resultat |
|---|---:|---|
| Pilot | 1 | Torggata merget i #3954 |
| Pilot | 1 | Bispelokket merget i #3958 |
| Oslo V4 batch 1 | 10 | Merget i #4014 |
| Oslo V4 batch 2 | 10 | Merget i #4036 |
| Oslo V4 batch 3 | 10 | Merget i #4043 |
| Oslo V4 batch 4 | 10 | #4069 |
| Oslo V4 batch 5 | 10 | #4101 |
| Oslo V4 batch 6 | 6 | #4124 – fullførte den opprinnelige 58-steders delkøen |
| Oslo V4 batch 7 | 10 | #4137 – første batch etter utvidelse til alle 90 aktive Oslo-steder |
| Oslo V4 batch 8 | 10 | #4147 |
| Oslo V4 batch 9 | 10 | #4149 |
| Oslo V4 batch 10 | 2 | #4150 – fullførte den tidligere 90-steders delkøen |
| Oslo scope-audit V2 | 0 | #4156 – korrigerte aktiv Oslo-total til 512 steder; 422 gjenstår |
| Oslo V4 batch 11 | 10 | #4167 – første produksjonsbatch fra full 512-steders scope |
| Oslo V4 batch 12 | 10 | #4170 – andre produksjonsbatch fra full 512-steders scope |
| Oslo V4 batch 13 | 8 | #4173 – fullførte hele Oslo-køen for fagområdet by |
| Oslo V4 batch 14 | 2 | #4174 – fullførte hele Oslo-køen for fagområdet film_tv |
| Oslo V4 batch 15 | 10 | #4180 – første produksjonsbatch fra historiekøen |
| Oslo V4 batch 16 | 10 | #4182 – andre produksjonsbatch fra historiekøen |
| Oslo V4 batch 17 | 10 | #4190 – tredje produksjonsbatch fra historiekøen |
| Oslo V4 batch 18 | 10 | #4200 – fjerde produksjonsbatch fra historiekøen |
| Oslo V4 batch 19 | 10 | #4204 – femte produksjonsbatch fra historiekøen |
| Oslo V4 batch 20 | 10 | #4212 – sjette produksjonsbatch fra historiekøen |
| Oslo V4 batch 21 | 7 | #4225 – fullførte hele Oslo-køen for fagområdet historie |
| Oslo V4 batch 22 | 7 | #4253 – fullførte hele Oslo-køen for fagområdet media |
| Oslo V4 batch 23 | 5 | #4257 – fullførte hele Oslo-køen for fagområdet musikk |
| Oslo V4 batch 24 | 1 | #4261 – fullførte hele Oslo-køen for fagområdet psykologi |
| Oslo V4 batch 25 | 10 | #4269 – første produksjonsbatch fra politikk-køen |
| Oslo V4 batch 26 | 8 | #4278 – fullførte hele Oslo-køen for fagområdet politikk |
| Oslo V4 batch 27 | 10 | #4292 – første produksjonsbatch fra vitenskapskøen |
| Oslo V4 batch 28 | 10 | #4298 – andre produksjonsbatch fra vitenskapskøen |
| Oslo V4 batch 29 | 1 | #4302 – fullførte hele Oslo-køen for fagområdet vitenskap |

Protokollen skal oppdateres i samme PR som hver nye batch. Et sted flyttes først til «Ferdige steder» når teksten oppfyller ord-, avsnitts-, kilde- og valideringskravene.
