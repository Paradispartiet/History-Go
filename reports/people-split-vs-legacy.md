# People split vs legacy audit

Generert: 2026-05-11T13:06:22.323Z

## Sammendrag

- Legacy people-fil: data/people.json
- People-mappe: data/people
- Runtime-liste lest fra: js/boot.js
- Relasjoner lest fra: data/relations.json
- Legacy people: **98**
- Legacy unike ID-er: **98**
- Split people: **165**
- Split unike ID-er: **156**
- Split-filer: **13**
- Runtime-filer i boot.js: **12**
- ID-er i begge: **88**
- ID-er bare i legacy: **6**
- Legacy relation-only stubs: **4**
- ID-er bare i split: **68**
- Duplikate ID-er på tvers av split-filer: **9**
- Split-filer ikke lastet av boot.js: **1**
- Runtime-filer i boot.js som mangler på disk: **0**
- JSON-filer med feil: **0**

## Split-filer

| Fil | Lastes av boot.js | People | Mangler ID | Duplikate ID-er i fil |
|---|---:|---:|---:|---|
| data/people/people_by.json | ja | 4 | 0 |  |
| data/people/people_filantroper.json | ja | 4 | 0 |  |
| data/people/people_historie.json | ja | 57 | 0 |  |
| data/people/people_kunst.json | ja | 7 | 0 |  |
| data/people/people_litteratur.json | ja | 33 | 0 |  |
| data/people/people_musikk.json | ja | 10 | 0 |  |
| data/people/people_naeringsliv.json | ja | 9 | 0 |  |
| data/people/people_natur.json | ja | 4 | 0 |  |
| data/people/people_politikk.json | ja | 9 | 0 |  |
| data/people/people_scenekunst.json | nei | 6 | 0 |  |
| data/people/people_sport.json | ja | 7 | 0 |  |
| data/people/people_subkultur.json | ja | 9 | 0 |  |
| data/people/people_vitenskap.json | ja | 6 | 0 |  |

## Split-filer som ikke lastes av boot.js

- data/people/people_scenekunst.json

## Boot-filer som mangler på disk

- Ingen.

## ID-er bare i legacy `data/people.json`

- arne_naess | Arne Næss | natur | ikke-stub
- astrid_s | Astrid S | populærkultur | ikke-stub
- haakon_vii | Haakon VII | politikk | ikke-stub
- klanen | Klanen (VIF) | sport | ikke-stub
- kong_christian_iv | Kong Christian IV | by | ikke-stub
- per_petterson | Per Petterson |  | stub

## Legacy relation-only stubs (skal ikke flyttes)

- geir_berdahl | Geir Berdahl | stub
- terje_thorsen | Terje Thorsen | stub
- trond_andreassen | Trond Andreassen | stub
- unni_rustad | Unni Rustad | stub

## ID-er bare i split-filene

- alexis_de_chateauneuf | Alexis de Chateauneuf | data/people/people_historie.json
- alf_bjercke_industri_og_kvalitet | Alf Bjercke | data/people/people_naeringsliv.json
- alfred_nobel | Alfred Nobel | data/people/people_filantroper.json
- anna_sethne | Anna Sethne | data/people/people_historie.json
- anton_martin_schweigaard_okonomi | Anton Martin Schweigaard | data/people/people_naeringsliv.json
- arne_korsmo | Arne Korsmo | data/people/people_by.json
- arnulf_overland | Arnulf Øverland | data/people/people_historie.json
- bard_tufte_johansen | Bård Tufte Johansen | data/people/people_scenekunst.json
- bernt_anker | Bernt Anker | data/people/people_historie.json
- birger_eriksen | Birger Eriksen | data/people/people_historie.json
- carl_deichman | Carl Deichman | data/people/people_filantroper.json, data/people/people_historie.json
- carsten_anker | Carsten Anker | data/people/people_historie.json
- christen_smith_schous_bryggeri | Christen Smith | data/people/people_naeringsliv.json
- christian_heinrich_grosch | Christian Heinrich Grosch | data/people/people_by.json
- christian_iv | Christian IV | data/people/people_historie.json
- christian_krohg | Christian Krohg | data/people/people_historie.json
- christian_magnus_falsen | Christian Magnus Falsen | data/people/people_historie.json
- christian_michelsen | Christian Michelsen | data/people/people_politikk.json
- christian_ringnes | Christian Ringnes | data/people/people_filantroper.json
- christian_schweigaard_post_og_administrasjon | Christian Schweigaard | data/people/people_naeringsliv.json
- christopher_hansteen | Christopher Hansteen | data/people/people_historie.json
- cj_hambro | C.J. Hambro | data/people/people_historie.json
- edvard_munch | Edvard Munch | data/people/people_historie.json
- einar_gerhardsen | Einar Gerhardsen | data/people/people_politikk.json
- ellef_ringnes_bryggeri_og_ledelse | Ellef Ringnes | data/people/people_naeringsliv.json
- else_kass_furuseth | Else Kåss Furuseth | data/people/people_scenekunst.json
- georg_ossian_sars | Georg Ossian Sars | data/people/people_natur.json
- georg_sverdrup | Georg Sverdrup | data/people/people_historie.json
- gregers_gram | Gregers Gram | data/people/people_historie.json
- gunnar_jahn_statistikk_og_styring | Gunnar Jahn | data/people/people_naeringsliv.json
- gunnar_sonsteby | Gunnar Sønsteby | data/people/people_historie.json
- hans_rasmus_astrup | Hans Rasmus Astrup | data/people/people_filantroper.json
- harald_eia | Harald Eia | data/people/people_scenekunst.json
- harald_hals | Harald Hals | data/people/people_by.json
- harald_hardrade | Harald Hardråde | data/people/people_historie.json
- henrik_bjelke | Henrik Bjelke | data/people/people_historie.json
- henrik_ibsen | Henrik Ibsen | data/people/people_historie.json
- haakon_nyhuus | Haakon Nyhuus | data/people/people_historie.json
- haakon_v_magnusson | Håkon V Magnusson | data/people/people_historie.json
- jens_bjelke | Jens Bjelke | data/people/people_historie.json
- jens_esmark | Jens Esmark | data/people/people_natur.json
- johan_nygaardsvold | Johan Nygaardsvold | data/people/people_politikk.json
- kong_karl_johan | Karl Johan | data/people/people_historie.json
- kristian_birkeland_teknologi_og_industri | Kristian Birkeland | data/people/people_naeringsliv.json
- kristine_bonnevie | Kristine Bonnevie | data/people/people_historie.json
- kristoffer_olsen | Kristoffer Olsen | data/people/people_scenekunst.json
- marcus_thrane | Marcus Thrane | data/people/people_historie.json
- maria_quisling | Maria Quisling | data/people/people_historie.json
- martin_tranmael | Martin Tranmæl | data/people/people_historie.json
- michael_sars | Michael Sars | data/people/people_natur.json
- morten_ramm | Morten Ramm | data/people/people_scenekunst.json
- nicolai_rygg_sentralbank | Nicolai Rygg | data/people/people_naeringsliv.json
- oda_krohg | Oda Krohg | data/people/people_historie.json
- olaf_rye | Olaf Rye | data/people/people_historie.json
- oscar_i | Oscar I | data/people/people_historie.json
- peder_anker | Peder Anker | data/people/people_historie.json
- peter_christen_asbjornsen | Peter Christen Asbjørnsen | data/people/people_natur.json
- rolf_wickstrom | Rolf Wickstrøm | data/people/people_historie.json
- sam_eyde | Sam Eyde | data/people/people_historie.json
- sam_eyde_industriutbygger | Sam Eyde | data/people/people_naeringsliv.json
- st_hallvard | St. Hallvard | data/people/people_historie.json
- thorvald_meyer | Thorvald Meyer | data/people/people_historie.json
- trygve_bratteli | Trygve Bratteli | data/people/people_historie.json
- vidkun_quisling | Vidkun Quisling | data/people/people_historie.json
- viggo_hansteen | Viggo Hansteen | data/people/people_historie.json
- wilhelm_f_k_christie | Wilhelm Frimann Koren Christie | data/people/people_historie.json
- wilhelm_von_hanno | Wilhelm von Hanno | data/people/people_historie.json
- aasta_hansteen | Aasta Hansteen | data/people/people_historie.json

## Duplikate ID-er på tvers av split-filer

- bjornstjerne_bjornson: data/people/people_historie.json, data/people/people_litteratur.json
- camilla_collett: data/people/people_historie.json, data/people/people_litteratur.json
- carl_berner: data/people/people_by.json, data/people/people_historie.json
- carl_deichman: data/people/people_filantroper.json, data/people/people_historie.json
- eilert_sundt: data/people/people_historie.json, data/people/people_vitenskap.json
- gina_krog: data/people/people_historie.json, data/people/people_politikk.json
- gustav_vigeland: data/people/people_historie.json, data/people/people_kunst.json
- henrik_wergeland: data/people/people_historie.json, data/people/people_litteratur.json
- johan_sverdrup: data/people/people_historie.json, data/people/people_politikk.json

## Feltforskjeller for ID-er som finnes begge steder

- alexander_rybak | Alexander Rybak | placeId | data/people/people_musikk.json
- alf_proysen | Alf Prøysen | placeId | data/people/people_litteratur.json
- bjornstjerne_bjornson | Bjørnstjerne Bjørnson | category, placeId | data/people/people_historie.json, data/people/people_litteratur.json
- camilla_collett | Camilla Collett | category, placeId | data/people/people_historie.json, data/people/people_litteratur.json
- cecilie_loveid | Cecilie Løveid | placeId | data/people/people_litteratur.json
- christian_frederik | Christian Frederik | category | data/people/people_historie.json
- edvard_grieg | Edvard Grieg | placeId | data/people/people_musikk.json
- eilert_sundt | Eilert Sundt | category, placeId | data/people/people_historie.json, data/people/people_vitenskap.json
- fridtjof_nansen | Fridtjof Nansen | category | data/people/people_historie.json
- gina_krog | Gina Krog | category, placeId | data/people/people_historie.json, data/people/people_politikk.json
- grete_waitz | Grete Waitz | placeId | data/people/people_sport.json
- gustav_vigeland | Gustav Vigeland | category | data/people/people_historie.json, data/people/people_kunst.json
- henrik_wergeland | Henrik Wergeland | category, placeId | data/people/people_historie.json, data/people/people_litteratur.json
- herman_flesvig | Herman Flesvig | category, placeId | data/people/people_scenekunst.json
- johan_sverdrup | Johan Sverdrup | category, placeId | data/people/people_historie.json, data/people/people_politikk.json
- jonas_collett | Jonas Collett | placeId | data/people/people_litteratur.json
- kirsten_flagstad | Kirsten Flagstad | placeId | data/people/people_musikk.json
- marit_bjorgen | Marit Bjørgen | placeId | data/people/people_sport.json
- oskar_braaten | Oskar Braaten | placeId | data/people/people_litteratur.json
- roald_amundsen | Roald Amundsen | category | data/people/people_historie.json
- rolf_jacobsen | Rolf Jacobsen | placeId | data/people/people_litteratur.json
- ronny_deila | Ronny Deila | placeId | data/people/people_sport.json
- therese_johaug | Therese Johaug | placeId | data/people/people_sport.json
- ulrikke_brandstorp | Ulrikke Brandstorp | placeId | data/people/people_musikk.json

## Anbefalt bruk

- Bruk rapporten til å avgjøre om `data/people.json` kan fjernes som manuell kilde, eller om manglende ID-er først må flyttes til `data/people/*.json`.
- Ikke slett `data/people.json` før `onlyInLegacy` er tom eller bevisst markert som legacy/stub.
- Ikke legg nye people i `data/people.json`; legg dem i riktig mappefil.
