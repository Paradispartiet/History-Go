# Oslo People of Places coverage

Generert: 2026-07-25T05:00:47.124Z

## Policy

- Alle canonical Oslo-steder utenfor natur skal ha minst én gyldig People-kobling.
- Natursteder rapporteres separat og inngår foreløpig ikke i null-hull-gaten.
- Telling er deduplisert på `placeId` og `personId` på tvers av aggregate- og split-filer.

## Sammendrag

- Oslo-steder totalt: **389**
- Kravpliktige steder utenom natur: **340**
- Dekket: **170**
- Uten People: **170**
- Dekningsgrad: **50%**
- Natursteder: **49** (45 uten People)
- Geografikonflikter holdt utenfor Oslo-tellingen: **0**
- Ugyldige People→place-referanser globalt: **50**

## Dekning per kategori

| Kategori | Totalt | Dekket | Uten People | People-lenker |
|---|---:|---:|---:|---:|
| by | 78 | 47 | 31 | 166 |
| film_tv | 2 | 2 | 0 | 12 |
| historie | 66 | 24 | 42 | 138 |
| kunst | 10 | 7 | 3 | 17 |
| litteratur | 19 | 19 | 0 | 52 |
| media | 5 | 5 | 0 | 19 |
| musikk | 9 | 9 | 0 | 16 |
| naeringsliv | 46 | 6 | 40 | 18 |
| natur | 49 | 4 | 45 | 11 |
| politikk | 18 | 18 | 0 | 163 |
| populaerkultur | 11 | 2 | 9 | 2 |
| psykologi | 1 | 0 | 1 | 0 |
| scenekunst | 22 | 7 | 15 | 241 |
| sport | 1 | 0 | 1 | 0 |
| subkultur | 33 | 17 | 16 | 31 |
| vitenskap | 19 | 7 | 12 | 47 |

## Arbeidskø: Oslo uten natur og uten People

| Kategori | Place ID | Navn | Canonical kilde |
|---|---|---|---|
| by | `alnabru_jernbane_og_logistikk` | Alnabru godsterminal | data/places/natur/oslo/places_oslo_alna.json |
| by | `beierbrua` | Beierbrua | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| by | `bislett` | Bislett | data/places/by/oslo/places_by.json |
| by | `bogstadveien` | Bogstadveien | data/places/by/oslo/places_by.json |
| by | `botsparken` | Botsparken | data/places/by/oslo/places_by.json |
| by | `damstredet_telthusbakken` | Damstredet og Telthusbakken | data/places/by/oslo/damstredet_telthusbakken.json |
| by | `gamle_trikkestallen` | Gamle trikkestallen på Sagene | data/places/by/oslo/gamle_trikkestallen.json |
| by | `grorud` | Grorud | data/places/by/oslo/places_by.json |
| by | `gronland_basarene` | Grønland basarene | data/places/by/oslo/places_by.json |
| by | `gronlandsleiret` | Grønlandsleiret | data/places/by/oslo/places_by.json |
| by | `hausmannsomradet_elvelop` | Hausmannskvartalene – elveløp | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| by | `jernbanetorget` | Jernbanetorget | data/places/by/oslo/places_by.json |
| by | `majorstuen_krysset` | Majorstuen krysset | data/places/by/oslo/places_by.json |
| by | `majorstuen_tbanestasjon` | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json |
| by | `nationaltheatret_stasjon` | Nationaltheatret stasjon | data/places/by/oslo/places_by.json |
| by | `oslo_bussterminal` | Oslo bussterminal | data/places/by/oslo/places_by.json |
| by | `ring_3` | Ring 3 | data/places/by/oslo/places_by.json |
| by | `rodelokka` | Rodeløkka | data/places/by/oslo/places_by.json |
| by | `romsaås` | Romsås | data/places/by/oslo/places_by.json |
| by | `sagene` | Sagene | data/places/by/oslo/places_by.json |
| by | `schiollgarden_prinsens_gate_26` | Schiøllgården | data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02.json |
| by | `skoyen` | Skøyen | data/places/by/oslo/places_by.json |
| by | `spikersuppa` | Spikersuppa | data/places/by/oslo/places_by.json |
| by | `storgata` | Storgata | data/places/by/oslo/places_by.json |
| by | `stortorget` | Stortorget | data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03.json |
| by | `torshov` | Torshov | data/places/by/oslo/places_by.json |
| by | `trikk_17_18` | Trikkelinje 17/18 | data/places/by/oslo/places_by.json |
| by | `ullern` | Ullern | data/places/by/oslo/places_by.json |
| by | `vinderen` | Vinderen | data/places/by/oslo/places_by.json |
| by | `vaalerenga` | Vålerenga | data/places/by/oslo/places_by.json |
| by | `okern` | Økern | data/places/by/oslo/places_by.json |
| historie | `avisen_tiden_radhusgata_10` | Avisen Tiden – Rådhusgata 10 | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json |
| historie | `bankall_gard` | Bånkall gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_13.json |
| historie | `den_gamle_krigsskolen` | Den gamle Krigsskolen | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json |
| historie | `forsvarsmuseet` | Forsvarsmuseet | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json |
| historie | `galgeberg` | Galgeberg | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `gamlebyen_gravlund` | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json |
| historie | `garmanngarden` | Garmanngården | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json |
| historie | `geitmyra_gard` | Geitmyra gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json |
| historie | `gol_stavkirke_bygdoy` | Gol stavkirke – Bygdøy | data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json |
| historie | `gronland_politistasjon` | Grønland politistasjon | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json |
| historie | `hauges_minde` | Hauges Minde | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json |
| historie | `hovedoya_kloster` | Hovedøya kloster | data/places/historie/oslo/places_historie.json |
| historie | `kirkeristen_basarene_brannvakten` | Kirkeristen, Basarene og Brannvakten | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json |
| historie | `kjaerlighetskarusellen` | Kjærlighetskarusellen | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `kon_tiki_museet` | Kon-Tiki Museet | data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json |
| historie | `kontraskjaeret` | Kontraskjæret | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04.json |
| historie | `lambertseter_gard` | Lambertseter gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `lokomotivverkstedet` | Lokomotivverkstedet | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `magistratgarden` | Magistratgården | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json |
| historie | `minneparken_gamlebyen` | Minneparken | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11.json |
| historie | `mustadgarden_kongens_gate_3` | Mustadgården – Kongens gate 3 | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01.json |
| historie | `myntgatakvartalet` | Myntgatakvartalet | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json |
| historie | `hellerud_gard` | Nedre Hellerud – historisk gårdssted | data/places/natur/oslo/places_oslo_alna.json |
| historie | `nonneseter_kloster` | Nonneseter kloster | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `nordisk_bibelmuseum` | Nordisk Bibelmuseum | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json |
| historie | `nordre_skoyen_hovedgard` | Nordre Skøyen hovedgård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `norges_hjemmefrontmuseum` | Norges Hjemmefrontmuseum | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json |
| historie | `oslo_hospital` | Oslo hospital | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `oslo_ladegard` | Oslo ladegård | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `palehaven_paleet` | Paléhaven og Paleet | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04.json |
| historie | `peststotten_krist_kirkegard` | Peststøtten – Krist kirkegård | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `radmannsgarden_og_anatomibygget` | Rådmannsgården og Anatomibygget | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json |
| historie | `sagene_festivitetshus` | Sagene festivitetshus | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json |
| historie | `saxegarden` | Saxegården | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `slurpen_lakkegata` | Slurpen | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json |
| historie | `sporveismuseet` | Sporveismuseet | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `stattholdergarden` | Stattholdergården | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json |
| historie | `stubljan_paviljongen_hvervenbukta` | Stubljan-paviljongen i Hvervenbukta | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07.json |
| historie | `trosterudvillaen` | Trosterudvillaen | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08.json |
| historie | `tveten_gard` | Tveten gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `waisenhuset_kongens_gate` | Waisenhuset | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json |
| historie | `ovre_fossum_gard` | Øvre Fossum gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| kunst | `skulptursonen_ovre_slottsgate` | Skulptursonen i Øvre Slottsgate | data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01.json |
| kunst | `villa_furulund` | Villa Furulund | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05.json |
| kunst | `villa_romsli` | Villa Romsli | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06.json |
| naeringsliv | `oslo_mek` | Akers mekaniske Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `amerikalinjen` | Amerikalinjen | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json |
| naeringsliv | `akershus_slott_bakeriet` | Bakeriet ved Akershus | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `bryn_industriomrade` | Bryn industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `cafe_engebret` | Café Engebret | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json |
| naeringsliv | `centralbanken_kirkegata` | Centralbanken | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json |
| naeringsliv | `christiania_seildugsfabrik` | Christiania Seildugsfabrik | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `ulven_handelspark` | Construction City | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `dfds_bygget` | DFDS-bygget | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json |
| naeringsliv | `etterstadgata_6` | Etterstadgata 6 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05.json |
| naeringsliv | `vippetangen_fisketorg` | Fiskehallen på Vippetangen | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `flop_museum` | FLOP Museum | data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07.json |
| naeringsliv | `frysja_33_brekke_kraftstasjon` | Frysja 33 – Brekke kraftstasjon | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13.json |
| naeringsliv | `frysja_industriomrade` | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `grensen_kjopesenter` | Grensen – handelsgate | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `gronlikaia` | Grønlikaia | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `hotel_du_nord` | Hotel du Nord | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json |
| naeringsliv | `kafe_grei` | Kafé Grei | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json |
| naeringsliv | `kirkegata_5` | Kirkegata 5 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01.json |
| naeringsliv | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `jernbaneverkstedet_lodalen` | Lodalen jernbaneverksted | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `myrens_verksted` | Myrens Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `norges_bank_bankplassen_2` | Norges Bank – Bankplassen 2 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01.json |
| naeringsliv | `norges_bank_bankplassen_4` | Norges Bank – Bankplassen 4 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json |
| naeringsliv | `norges_varemesse` | Norges Varemesse – Sjølystsenteret | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `borsen_oslo` | Oslo Børs | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json |
| naeringsliv | `oslo_gassverk` | Oslo Gassverk | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `havnelageret` | Oslo Havnelager | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `oslo_kraftselskap` | Oslo Lysverkers hovedkontor | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `sjofartsbygningen` | Sjøfartsbygningen | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json |
| naeringsliv | `st_halvard_bryggeri` | St. Halvard bryggeri | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `steen_og_strom` | Steen & Strøm | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json |
| naeringsliv | `telegrafbygningen` | Telegrafbygningen | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `tollboden_oslo` | Tollboden | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json |
| naeringsliv | `tollbukaia` | Tollbukaia | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `tollpakkhuset` | Tollpakkhuset | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json |
| naeringsliv | `treschowgarden` | Treschowgården | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json |
| naeringsliv | `toyen_trafo` | Tøyen trafo | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04.json |
| naeringsliv | `vinmonopolet_lager` | Vinmonopolets hovedlager | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `ovre_foss` | Øvre Foss – Hjula Veveri | data/places/naeringsliv/oslo/places_naeringsliv.json |
| populaerkultur | `chateau_neuf` | Chateau Neuf | data/places/popkultur/oslo/places_oslo_populaerkultur.json |
| populaerkultur | `frognerstranda` | Frognerstranda | data/places/popkultur/oslo/places_oslo_populaerkultur.json |
| populaerkultur | `gimle_kino` | Gimle kino | data/places/film/oslo/places_oslo_film.json |
| populaerkultur | `grand_hotel` | Grand Hotel | data/places/popkultur/oslo/places_oslo_populaerkultur.json |
| populaerkultur | `hartvig_nissens_skole_skam` | Hartvig Nissens skole (SKAM) | data/places/film/oslo/places_oslo_film.json |
| populaerkultur | `klingenberg_kino` | Klingenberg kino | data/places/film/oslo/places_oslo_film.json |
| populaerkultur | `saga_kino` | Saga kino | data/places/film/oslo/places_oslo_film.json |
| populaerkultur | `slottsplassen` | Slottsplassen | data/places/popkultur/oslo/places_oslo_populaerkultur.json |
| populaerkultur | `vika_kino` | Vika kino | data/places/film/oslo/places_oslo_film.json |
| psykologi | `psykologisk_institutt_uio` | Psykologisk institutt, UiO | data/places/psykologi/oslo/places_psykologi.json |
| scenekunst | `black_box_teater` | Black Box teater | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `centralteatret` | Centralteatret | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `dansens_hus_oslo` | Dansens Hus | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `det_andre_teatret` | Det Andre Teatret | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `det_andre_teatret_intimscenen` | Det Andre Teatret – Intimscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `dramatikkens_hus` | Dramatikkens hus | data/places/scenekunst/oslo/dramatikkens_hus.json |
| scenekunst | `grusomhetens_teater` | Grusomhetens Teater | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `kloden_teater_pilotscenen` | Kloden teater – Pilotscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `nordic_black_theatre_cafeteatret` | Nordic Black Theatre / Cafeteatret | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `oslo_nye_teater_hovedscenen` | Oslo Nye Teater – Hovedscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `riksscenen` | Riksscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `rommen_scene` | Rommen Scene | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `salt_oslo` | SALT | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `teater_manu` | Teater Manu | data/places/scenekunst/oslo/teater_manu.json |
| scenekunst | `vega_scene` | Vega Scene | data/places/scenekunst/oslo/vega_scene.json |
| sport | `voldslokka_pumptrack` | Voldsløkka pumptrack | data/places/sport/oslo/voldslokka_pumptrack.json |
| subkultur | `brugata_storgata_rusmiljo` | Brugata / Storgata – det åpne rusmiljøet | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `evangeliesenteret_kontaktsenter_oslo` | Evangeliesenterets kontaktsenter | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `fyrlyset_oslo` | Fyrlyset | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `grunerlokka_bakgardsvegger` | Grünerløkka bakgårdsvegger | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `gronland_underganger` | Grønland underganger | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `hausmannsgate_aksen` | Hausmannsgate-aksen | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `huset_oslo` | Huset Oslo | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `kolstadgata_toyen_vegger` | Kolstadgata veggmiljø | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `kuba_akselpassasjer` | Kuba-passasjene ved Akerselva | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `motestedet_tollbugata` | Møtestedet – Tollbugata | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `nadheim_oslo` | Nadheim | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `nybrua_pilarrom` | Nybrua pilarrom | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `plata_oslo` | Plata | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `prindsen_mottakssenter` | Prindsen mottakssenter | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `schweigaards_gate_lodalen` | Schweigaards gate–Lodalen veggakse | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `vulkan_murvegger` | Vulkan murvegger og passasjer | data/places/subkultur/oslo/places_subkultur.json |
| vitenskap | `arkitektur_og_designhogskolen` | Arkitektur- og designhøgskolen i Oslo | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `bi_nydalen` | BI i Nydalen | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `folkeobservatoriet_holmenkollen` | Folkeobservatoriet | data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01.json |
| vitenskap | `forskningsparken` | Forskningsparken | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `gamlebyen_skole` | Gamlebyen skole | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `meteorologisk_institutt` | Meteorologisk institutt | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `teknisk_museum` | Norsk Teknisk Museum | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `oslo_met_pilestredet` | OsloMet, Pilestredet | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `radiumhospitalet` | Radiumhospitalet | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `rikshospitalet` | Rikshospitalet | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `tvergastein` | Tvergastein | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `universitetet_i_oslo_blindern` | Universitetet i Oslo, Blindern | data/places/vitenskap/oslo/places_vitenskap.json |

## Natursteder uten People (separat)

| Place ID | Navn | Canonical kilde |
|---|---|---|
| `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `alna_bryn` | Alna ved Bryn | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `alna_smalvoll` | Alna ved Smalvoll | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `alnaelva` | Alnaelva | data/places/natur/oslo/places_oslo_alna.json |
| `alnaelva_hovedsteder` | Alnaelva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `alnaparken` | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `alna_utlop_bjorvika` | Alnas historiske utløp ved Vannspeilet | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `alnaelvstien` | Alnastien – Svartdalen og Bryn | data/places/natur/oslo/places_oslo_alna.json |
| `alnsjoen_alna_kilde` | Alungsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `bjoelsenparken_elvenaer` | Bjølsenparken (elvenær del) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `blindern_forskningsparken_salamanderdam` | Blindern/Forskningsparken salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json |
| `bogerudmyra` | Bogerudmyra | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
| `bygdoy_bygdoynes` | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json |
| `bygdoy_dronningberget` | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json |
| `bygdoy_huk` | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json |
| `bygdoy_kongeskogen` | Bygdøy Kongeskogen | data/places/natur/oslo/places_oslo_natur_bygdoy.json |
| `bygdoy_kongsgard_salamanderdam` | Bygdøy Kongsgård salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json |
| `bygdoy_paradisbukta` | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json |
| `ostensjovannet_sor` | Bølerbekkens utløp i Østensjøvannet | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
| `bantjern_salamanderlokalitet` | Båntjern salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json |
| `stilla_nydalen` | Elvepartiet nedenfor Nydalsdammen | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `elvestrekning_bla_brenneriveien` | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `fossveien_elvestrekning` | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `ostensjovannet_fugletarn` | Fugleskjulet ved Østensjøvannet | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
| `gressholmen` | Gressholmen | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `groruddammen` | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `furuset_haugerud_skogbelte` | Haugerudparken | data/places/natur/oslo/places_oslo_alna.json |
| `kuba_parken` | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `kvaernerbyen_alna` | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `trosterud_friomrade` | Lille Wembley | data/places/natur/oslo/places_oslo_alna.json |
| `ljanselva` | Ljanselva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `ljanselva_bunnefjorden` | Ljanselva – utløp i Fiskevollbukta | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_fiskevollen` | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_hauketo` | Ljanselva ved Hauketo | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_ljan` | Ljanselva ved Ljan | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_skullerud` | Ljanselva ved Skullerud | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `myralokka` | Myraløkka | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `nydalsdammen` | Nydalsdammen | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `noklevann` | Nøklevann | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `noklevann_ljanselva_start` | Nøklevann – utløp mot Skraperudbekken | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `skraperudtjern` | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `svartdalen` | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `ostensjovannet_nord` | Vadedammen | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
| `ostensjovannet` | Østensjøvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `ostensjovannet_sivbelte` | Østensjøvannet sivbelte | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
