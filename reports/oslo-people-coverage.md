# Oslo People of Places coverage

Generert: 2026-07-25T08:49:48.838Z

## Policy

- Alle canonical Oslo-steder utenfor natur skal ha minst én gyldig People-kobling.
- Natursteder rapporteres separat og inngår foreløpig ikke i null-hull-gaten.
- Telling er deduplisert på `placeId` og `personId` på tvers av aggregate- og split-filer.

## Sammendrag

- Oslo-steder totalt: **485**
- Kravpliktige steder utenom natur: **428**
- Dekket: **192**
- Uten People: **236**
- Dekningsgrad: **44.86%**
- Natursteder: **57** (53 uten People)
- Geografikonflikter holdt utenfor Oslo-tellingen: **0**
- Ugyldige People→place-referanser globalt: **0**

## Dekning per kategori

| Kategori | Totalt | Dekket | Uten People | People-lenker |
|---|---:|---:|---:|---:|
| by | 101 | 48 | 53 | 169 |
| film_tv | 2 | 2 | 0 | 12 |
| historie | 96 | 36 | 60 | 167 |
| kunst | 40 | 7 | 33 | 17 |
| litteratur | 21 | 19 | 2 | 52 |
| media | 7 | 5 | 2 | 19 |
| musikk | 9 | 9 | 0 | 16 |
| naeringsliv | 49 | 12 | 37 | 32 |
| natur | 57 | 4 | 53 | 11 |
| politikk | 19 | 18 | 1 | 163 |
| psykologi | 1 | 0 | 1 | 0 |
| scenekunst | 24 | 12 | 12 | 218 |
| sport | 3 | 0 | 3 | 0 |
| subkultur | 35 | 17 | 18 | 31 |
| vitenskap | 21 | 7 | 14 | 47 |

## Arbeidskø: Oslo uten natur og uten People

| Kategori | Place ID | Navn | Canonical kilde |
|---|---|---|---|
| by | `akrobaten_gangbro` | Akrobaten gangbro | data/places/by/oslo/places/akrobaten_gangbro.json |
| by | `alnabru_jernbane_og_logistikk` | Alnabru godsterminal | data/places/natur/oslo/places_oslo_alna.json |
| by | `beierbrua` | Beierbrua | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| by | `bislett` | Bislett | data/places/by/oslo/places_by.json |
| by | `bogstadveien` | Bogstadveien | data/places/by/oslo/places_by.json |
| by | `botsparken` | Botsparken | data/places/by/oslo/places_by.json |
| by | `damstredet_telthusbakken` | Damstredet og Telthusbakken | data/places/by/oslo/damstredet_telthusbakken.json |
| by | `fagerborg_kirke` | Fagerborg kirke | data/places/by/oslo/places/fagerborg_kirke.json |
| by | `frogner_kirke` | Frogner kirke | data/places/by/oslo/places/frogner_kirke.json |
| by | `frognerparken` | Frognerparken | data/places/by/oslo/frognerparken.json |
| by | `gamle_trikkestallen` | Gamle trikkestallen på Sagene | data/places/by/oslo/gamle_trikkestallen.json |
| by | `grorud` | Grorud | data/places/by/oslo/places_by.json |
| by | `grorudparken` | Grorudparken | data/places/by/oslo/grorudparken.json |
| by | `gronland_basarene` | Grønland basarene | data/places/by/oslo/places_by.json |
| by | `gronlandsleiret` | Grønlandsleiret | data/places/by/oslo/places_by.json |
| by | `hausmannsomradet_elvelop` | Hausmannskvartalene – elveløp | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| by | `holmenkollen_kapell` | Holmenkollen kapell | data/places/by/oslo/places/holmenkollen_kapell.json |
| by | `jernbanetorget` | Jernbanetorget | data/places/by/oslo/places_by.json |
| by | `kampen_park` | Kampen park | data/places/by/oslo/kampen_park.json |
| by | `kampen_okologiske_barnebondegard` | Kampen Økologiske Barnebondegård | data/places/by/oslo/places/kampen_okologiske_barnebondegard.json |
| by | `kirsebarlunden` | Kirsebærlunden | data/places/by/oslo/kirsebarlunden.json |
| by | `lindoya` | Lindøya | data/places/by/oslo/places/lindoya.json |
| by | `losaeter` | Losæter | data/places/by/oslo/places/losaeter.json |
| by | `majorstuen_krysset` | Majorstuen krysset | data/places/by/oslo/places_by.json |
| by | `majorstuen_tbanestasjon` | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json |
| by | `nakholmen` | Nakholmen | data/places/by/oslo/places/nakholmen.json |
| by | `nationaltheatret_stasjon` | Nationaltheatret stasjon | data/places/by/oslo/places_by.json |
| by | `ormoya` | Ormøya | data/places/by/oslo/places/ormoya.json |
| by | `oslo_bussterminal` | Oslo bussterminal | data/places/by/oslo/places_by.json |
| by | `ring_3` | Ring 3 | data/places/by/oslo/places_by.json |
| by | `rodelokka` | Rodeløkka | data/places/by/oslo/places_by.json |
| by | `romsaås` | Romsås | data/places/by/oslo/places_by.json |
| by | `rudolf_nilsens_plass` | Rudolf Nilsens plass | data/places/by/oslo/rudolf_nilsens_plass.json |
| by | `sagene` | Sagene | data/places/by/oslo/places_by.json |
| by | `schiollgarden_prinsens_gate_26` | Schiøllgården | data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02.json |
| by | `skoyen` | Skøyen | data/places/by/oslo/places_by.json |
| by | `snippen_lekepark` | Snippen lekepark | data/places/by/oslo/snippen_lekepark.json |
| by | `spikersuppa` | Spikersuppa | data/places/by/oslo/places_by.json |
| by | `storgata` | Storgata | data/places/by/oslo/places_by.json |
| by | `stortorget` | Stortorget | data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03.json |
| by | `sukkerbiten_badstulandsby` | Sukkerbiten badstulandsby | data/places/by/oslo/places/sukkerbiten_badstulandsby.json |
| by | `torshov` | Torshov | data/places/by/oslo/places_by.json |
| by | `torshovdalen` | Torshovdalen | data/places/by/oslo/torshovdalen.json |
| by | `torshovparken` | Torshovparken | data/places/by/oslo/places/torshovparken.json |
| by | `trikk_17_18` | Trikkelinje 17/18 | data/places/by/oslo/places_by.json |
| by | `ullern` | Ullern | data/places/by/oslo/places_by.json |
| by | `ulvoya` | Ulvøya | data/places/by/oslo/places/ulvoya.json |
| by | `uranienborg_kirke` | Uranienborg kirke | data/places/by/oslo/places/uranienborg_kirke.json |
| by | `vika_kino` | Vika kino | data/places/film/oslo/places_oslo_film.json |
| by | `vikaterrassen` | Vikaterrassen | data/places/by/oslo/places/vikaterrassen.json |
| by | `vinderen` | Vinderen | data/places/by/oslo/places_by.json |
| by | `vaalerenga` | Vålerenga | data/places/by/oslo/places_by.json |
| by | `okern` | Økern | data/places/by/oslo/places_by.json |
| historie | `abelonegarden` | Abelonegården | data/places/historie/oslo/places_historie/abelonegarden.json |
| historie | `arbeidermuseet` | Arbeidermuseet | data/places/historie/oslo/places_historie/arbeidermuseet.json |
| historie | `avisen_tiden_radhusgata_10` | Avisen Tiden – Rådhusgata 10 | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json |
| historie | `brannmuseet_oslo` | Brannmuseet i Oslo | data/places/historie/oslo/places_historie/brannmuseet_oslo.json |
| historie | `bygdoy_kongsgard` | Bygdø Kongsgård | data/places/historie/oslo/places_historie/bygdoy_kongsgard.json |
| historie | `bankall_gard` | Bånkall gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_13.json |
| historie | `central_jam_e_mosque` | Central Jam-e-Mosque | data/places/historie/oslo/places_historie/central_jam_e_mosque.json |
| historie | `christian_radich` | Christian Radich | data/places/historie/oslo/places_historie/christian_radich.json |
| historie | `clemenskirken_ruin_oslo` | Clemenskirkeruinen | data/places/historie/oslo/places_historie/clemenskirken_ruin_oslo.json |
| historie | `ekebergparken_museum` | Ekebergparken Museum | data/places/historie/oslo/places_historie/ekebergparken_museum.json |
| historie | `forsvarsmuseet` | Forsvarsmuseet | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json |
| historie | `frogner_hovedgard` | Frogner hovedgård | data/places/historie/oslo/places_historie/frogner_hovedgard.json |
| historie | `galgeberg` | Galgeberg | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `gamlebyen_gravlund` | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json |
| historie | `gamlebyen_kirke` | Gamlebyen kirke | data/places/historie/oslo/places_historie/gamlebyen_kirke.json |
| historie | `geitmyra_gard` | Geitmyra gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json |
| historie | `gronland_politistasjon` | Grønland politistasjon | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json |
| historie | `heggholmen` | Heggholmen | data/places/historie/oslo/places_historie/heggholmen.json |
| historie | `ekeberg_helleristninger` | Helleristningene på Ekeberg | data/places/historie/oslo/places_historie/ekeberg_helleristninger.json |
| historie | `historisk_museum` | Historisk museum | data/places/historie/oslo/places_historie/historisk_museum.json |
| historie | `hovedoya_kloster` | Hovedøya kloster | data/places/historie/oslo/places_historie.json |
| historie | `jodisk_museum_oslo` | Jødisk Museum i Oslo | data/places/historie/oslo/places_historie/jodisk_museum_oslo.json |
| historie | `kjaerlighetskarusellen` | Kjærlighetskarusellen | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `kontraskjaeret` | Kontraskjæret | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04.json |
| historie | `lambertseter_gard` | Lambertseter gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `lokomotivverkstedet` | Lokomotivverkstedet | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `mariakirken_ruin_oslo` | Mariakirken-ruinen | data/places/historie/oslo/places_historie/mariakirken_ruin_oslo.json |
| historie | `minneparken_gamlebyen` | Minneparken | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11.json |
| historie | `museumsleiligheten_grabein` | Museumsleiligheten Gråbein | data/places/historie/oslo/places_historie/museumsleiligheten_grabein.json |
| historie | `myntgatakvartalet` | Myntgatakvartalet | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json |
| historie | `mollergata_skole` | Møllergata skole | data/places/historie/oslo/places_historie/mollergata_skole.json |
| historie | `hellerud_gard` | Nedre Hellerud – historisk gårdssted | data/places/natur/oslo/places_oslo_alna.json |
| historie | `nobels_fredssenter` | Nobels Fredssenter | data/places/historie/oslo/places_historie/nobels_fredssenter.json |
| historie | `nonneseter_kloster` | Nonneseter kloster | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `nordisk_bibelmuseum` | Nordisk Bibelmuseum | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json |
| historie | `nordre_skoyen_hovedgard` | Nordre Skøyen hovedgård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `norges_hjemmefrontmuseum` | Norges Hjemmefrontmuseum | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json |
| historie | `norsk_folkemuseum` | Norsk Folkemuseum | data/places/historie/oslo/places_historie/norsk_folkemuseum.json |
| historie | `norsk_maritimt_museum` | Norsk Maritimt Museum | data/places/historie/oslo/places_historie/norsk_maritimt_museum.json |
| historie | `oscarshall` | Oscarshall | data/places/historie/oslo/places_historie/oscarshall.json |
| historie | `oslo_hospital` | Oslo hospital | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `paulus_kirke` | Paulus kirke | data/places/historie/oslo/places_historie/paulus_kirke.json |
| historie | `peststotten_krist_kirkegard` | Peststøtten – Krist kirkegård | data/places/historie/oslo/places_historie_added_batch_01.json |
| historie | `sagene_festivitetshus` | Sagene festivitetshus | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json |
| historie | `saxegarden` | Saxegården | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `holmenkollen_skimuseum` | Skimuseet i Holmenkollen | data/places/historie/oslo/places_historie/holmenkollen_skimuseum.json |
| historie | `slurpen_lakkegata` | Slurpen | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json |
| historie | `sporveismuseet` | Sporveismuseet | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `stubljan_paviljongen_hvervenbukta` | Stubljan-paviljongen i Hvervenbukta | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07.json |
| historie | `the_mini_bottle_gallery` | The Mini Bottle Gallery | data/places/historie/oslo/places_historie/the_mini_bottle_gallery.json |
| historie | `viking_planet_oslo` | The Viking Planet Oslo | data/places/historie/oslo/places_historie/viking_planet_oslo.json |
| historie | `trosterudvillaen` | Trosterudvillaen | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08.json |
| historie | `tveten_gard` | Tveten gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `toyen_hovedgard` | Tøyen hovedgård | data/places/historie/oslo/places_historie/toyen_hovedgard.json |
| historie | `vestre_gravlund` | Vestre gravlund | data/places/historie/oslo/places_historie/vestre_gravlund.json |
| historie | `vikingtidsmuseet` | Vikingtidsmuseet | data/places/historie/oslo/places_historie/vikingtidsmuseet.json |
| historie | `valerenga_kirke` | Vålerenga kirke | data/places/historie/oslo/places_historie/valerenga_kirke.json |
| historie | `waisenhuset_kongens_gate` | Waisenhuset | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json |
| historie | `ovre_fossum_gard` | Øvre Fossum gård | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json |
| historie | `aamot_bru` | Åmot bru | data/places/historie/oslo/places_historie/aamot_bru.json |
| kunst | `det_internasjonale_barnekunstmuseet` | Det internasjonale Barnekunstmuseet | data/places/kunst/oslo/places_kunst/det_internasjonale_barnekunstmuseet.json |
| kunst | `dronning_sonja_kunststall` | Dronning Sonja KunstStall | data/places/kunst/oslo/places_kunst/dronning_sonja_kunststall.json |
| kunst | `edvard_munchs_atelier_ekely` | Edvard Munchs atelier på Ekely | data/places/kunst/oslo/places_kunst/edvard_munchs_atelier_ekely.json |
| kunst | `fotogalleriet` | Fotogalleriet | data/places/kunst/oslo/places_kunst/fotogalleriet.json |
| kunst | `fotografiens_hus` | Fotografiens Hus | data/places/kunst/oslo/places_kunst/fotografiens_hus.json |
| kunst | `galleri_lnm` | Galleri LNM | data/places/kunst/oslo/places_kunst/galleri_lnm.json |
| kunst | `galleri_map` | Galleri MAP | data/places/kunst/oslo/places_kunst/galleri_map.json |
| kunst | `galleri_mini_oslo` | Galleri Mini | data/places/kunst/oslo/places_kunst/galleri_mini_oslo.json |
| kunst | `norske_grafikere` | Galleri Norske Grafikere | data/places/kunst/oslo/places_kunst/norske_grafikere.json |
| kunst | `galleri_schaeffers_gate_5` | Galleri Schaeffers Gate 5 | data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json |
| kunst | `grafill` | Grafill | data/places/kunst/oslo/places_kunst/grafill.json |
| kunst | `hodet_nn_torshovdalen` | HODET N.N. | data/places/kunst/oslo/places_kunst/hodet_nn_torshovdalen.json |
| kunst | `klosterenga_skulpturpark` | Klosterenga skulpturpark | data/places/kunst/oslo/places_kunst/klosterenga_skulpturpark.json |
| kunst | `kollentrollet` | Kollentrollet | data/places/kunst/oslo/places_kunst/kollentrollet.json |
| kunst | `kragstotten` | Kragstøtten | data/places/kunst/oslo/places_kunst/kragstotten.json |
| kunst | `kunsthall_oslo` | Kunsthall Oslo | data/places/kunst/oslo/places_kunst/kunsthall_oslo.json |
| kunst | `kunstnerforbundet` | Kunstnerforbundet | data/places/kunst/oslo/places_kunst/kunstnerforbundet.json |
| kunst | `kunstnernes_hus` | Kunstnernes Hus | data/places/kunst/oslo/places_kunst/kunstnernes_hus.json |
| kunst | `kosk_oslo` | KÖSK | data/places/kunst/oslo/places_kunst/kosk_oslo.json |
| kunst | `oslo_prosjektrom` | Oslo Prosjektrom | data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json |
| kunst | `peer_gynt_parken` | Peer Gynt-parken | data/places/kunst/oslo/places_kunst/peer_gynt_parken.json |
| kunst | `purenkel_galleri` | Purenkel galleri | data/places/kunst/oslo/places_kunst/purenkel_galleri.json |
| kunst | `ram_galleri` | RAM galleri | data/places/kunst/oslo/places_kunst/ram_galleri.json |
| kunst | `skulptursonen_ovre_slottsgate` | Skulptursonen i Øvre Slottsgate | data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01.json |
| kunst | `tbs_gallery` | TBS Gallery | data/places/kunst/oslo/places_kunst/tbs_gallery.json |
| kunst | `tegnerforbundet` | Tegnerforbundet – senter for tegnekunst | data/places/kunst/oslo/places_kunst/tegnerforbundet.json |
| kunst | `the_oslo_gallery` | The Oslo Gallery | data/places/kunst/oslo/places_kunst/the_oslo_gallery.json |
| kunst | `unge_kunstneres_samfund` | Unge Kunstneres Samfund | data/places/kunst/oslo/places_kunst/unge_kunstneres_samfund.json |
| kunst | `van_etten` | Van Etten | data/places/kunst/oslo/places_kunst/van_etten.json |
| kunst | `vi_vii_gallery` | VI, VII | data/places/kunst/oslo/places_kunst/vi_vii_gallery.json |
| kunst | `vigelandmuseet` | Vigelandmuseet | data/places/kunst/oslo/places_kunst/vigelandmuseet.json |
| kunst | `villa_furulund` | Villa Furulund | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05.json |
| kunst | `villa_romsli` | Villa Romsli | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06.json |
| litteratur | `biblo_toyen` | Biblo Tøyen | data/places/litteratur/oslo/places_litteratur/biblo_toyen.json |
| litteratur | `ibsen_museum_teater` | IBSEN Museum & Teater | data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json |
| media | `frognerstranda` | Frognerstranda | data/places/media/oslo/frognerstranda.json |
| media | `grand_hotel` | Grand Hotel | data/places/media/oslo/grand_hotel.json |
| naeringsliv | `oslo_mek` | Akers mekaniske Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `amerikalinjen` | Amerikalinjen | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json |
| naeringsliv | `akershus_slott_bakeriet` | Bakeriet ved Akershus | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `bryn_industriomrade` | Bryn industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `christiania_seildugsfabrik` | Christiania Seildugsfabrik | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `ulven_handelspark` | Construction City | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `dfds_bygget` | DFDS-bygget | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json |
| naeringsliv | `etterstadgata_6` | Etterstadgata 6 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05.json |
| naeringsliv | `vippetangen_fisketorg` | Fiskehallen på Vippetangen | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `flop_museum` | FLOP Museum | data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07.json |
| naeringsliv | `frysja_33_brekke_kraftstasjon` | Frysja 33 – Brekke kraftstasjon | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13.json |
| naeringsliv | `frysja_industriomrade` | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `gimle_kino` | Gimle kino | data/places/film/oslo/places_oslo_film.json |
| naeringsliv | `grensen_kjopesenter` | Grensen – handelsgate | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `gronlikaia` | Grønlikaia | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `hotel_du_nord` | Hotel du Nord | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json |
| naeringsliv | `kirkegata_5` | Kirkegata 5 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01.json |
| naeringsliv | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `jernbaneverkstedet_lodalen` | Lodalen jernbaneverksted | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `myrens_verksted` | Myrens Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `norges_bank_bankplassen_2` | Norges Bank – Bankplassen 2 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01.json |
| naeringsliv | `norges_bank_bankplassen_4` | Norges Bank – Bankplassen 4 | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json |
| naeringsliv | `norges_varemesse` | Norges Varemesse – Sjølystsenteret | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `oslo_gassverk` | Oslo Gassverk | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `havnelageret` | Oslo Havnelager | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `oslo_kraftselskap` | Oslo Lysverkers hovedkontor | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `saga_kino` | Saga kino | data/places/film/oslo/places_oslo_film.json |
| naeringsliv | `sjofartsbygningen` | Sjøfartsbygningen | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json |
| naeringsliv | `st_halvard_bryggeri` | St. Halvard bryggeri | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `telegrafbygningen` | Telegrafbygningen | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `the_salmon_vitensenter` | The Salmon – kunnskapssenter | data/places/naeringsliv/oslo/places_naeringsliv/the_salmon_vitensenter.json |
| naeringsliv | `tollboden_oslo` | Tollboden | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json |
| naeringsliv | `tollbukaia` | Tollbukaia | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `tollpakkhuset` | Tollpakkhuset | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json |
| naeringsliv | `toyen_trafo` | Tøyen trafo | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04.json |
| naeringsliv | `vinmonopolet_lager` | Vinmonopolets hovedlager | data/places/naeringsliv/oslo/places_naeringsliv.json |
| naeringsliv | `ovre_foss` | Øvre Foss – Hjula Veveri | data/places/naeringsliv/oslo/places_naeringsliv.json |
| politikk | `slottsplassen` | Slottsplassen | data/places/politikk/oslo/slottsplassen.json |
| psykologi | `psykologisk_institutt_uio` | Psykologisk institutt, UiO | data/places/psykologi/oslo/places_psykologi.json |
| scenekunst | `black_box_teater` | Black Box teater | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `bla_skilt_aud_schonemann_vetlandsveien_69d` | Blått skilt: Aud Schønemann | data/places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json |
| scenekunst | `chateau_neuf` | Chateau Neuf | data/places/scenekunst/oslo/chateau_neuf.json |
| scenekunst | `dansens_hus_oslo` | Dansens Hus | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `det_andre_teatret_intimscenen` | Det Andre Teatret – Intimscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `kloden_teater_pilotscenen` | Kloden teater – Pilotscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `latter` | Latter | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `oslo_nye_teater_hovedscenen` | Oslo Nye Teater – Hovedscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `riksscenen` | Riksscenen | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `rommen_scene` | Rommen Scene | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `salt_oslo` | SALT | data/places/scenekunst/oslo/places_scenekunst.json |
| scenekunst | `vega_scene` | Vega Scene | data/places/scenekunst/oslo/vega_scene.json |
| sport | `jordal_ungdomshall` | Jordal ungdomshall | data/places/sport/oslo/places_sport/jordal_ungdomshall.json |
| sport | `klingenberg_kino` | Klingenberg kino | data/places/film/oslo/places_oslo_film.json |
| sport | `voldslokka_pumptrack` | Voldsløkka pumptrack | data/places/sport/oslo/voldslokka_pumptrack.json |
| subkultur | `brugata_storgata_rusmiljo` | Brugata / Storgata – det åpne rusmiljøet | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `evangeliesenteret_kontaktsenter_oslo` | Evangeliesenterets kontaktsenter | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `fyrlyset_oslo` | Fyrlyset | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `grunerlokka_bakgardsvegger` | Grünerløkka bakgårdsvegger | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `gronland_underganger` | Grønland underganger | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `hartvig_nissens_skole_skam` | Hartvig Nissens skole (SKAM) | data/places/film/oslo/places_oslo_film.json |
| subkultur | `hausmannsgate_aksen` | Hausmannsgate-aksen | data/places/subkultur/oslo/places_subkultur.json |
| subkultur | `house_of_nerds` | House of Nerds | data/places/subkultur/oslo/house_of_nerds.json |
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
| vitenskap | `klimahuset` | Klimahuset | data/places/vitenskap/oslo/places_vitenskap/klimahuset.json |
| vitenskap | `meteorologisk_institutt` | Meteorologisk institutt | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `teknisk_museum` | Norsk Teknisk Museum | data/places/vitenskap/oslo/places_vitenskap.json |
| vitenskap | `oslo_reptilpark` | Oslo Reptilpark | data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json |
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
| `bleikoya` | Bleikøya | data/places/natur/oslo/bleikoya.json |
| `blindern_forskningsparken_salamanderdam` | Blindern/Forskningsparken salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json |
| `bogerudmyra` | Bogerudmyra | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
| `bogstadvannet` | Bogstadvannet | data/places/natur/oslo/places_natur/bogstadvannet.json |
| `brekkedammen` | Brekkedammen ved Frysja | data/places/natur/oslo/brekkedammen.json |
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
| `lillomarka` | Lillomarka | data/places/natur/oslo/lillomarka.json |
| `ljanselva` | Ljanselva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `ljanselva_bunnefjorden` | Ljanselva – utløp i Fiskevollbukta | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_fiskevollen` | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_hauketo` | Ljanselva ved Hauketo | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_ljan` | Ljanselva ved Ljan | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `ljanselva_skullerud` | Ljanselva ved Skullerud | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `malmoya` | Malmøya | data/places/natur/oslo/malmoya.json |
| `myralokka` | Myraløkka | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `nydalsdammen` | Nydalsdammen | data/places/natur/oslo/places_oslo_natur_akerselvarute.json |
| `noklevann` | Nøklevann | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `noklevann_ljanselva_start` | Nøklevann – utløp mot Skraperudbekken | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `rambergoya` | Rambergøya | data/places/natur/oslo/rambergoya.json |
| `skraperudtjern` | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json |
| `sognsvann` | Sognsvann | data/places/natur/oslo/sognsvann.json |
| `svartdalen` | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json |
| `ostensjovannet_nord` | Vadedammen | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
| `vettakollen` | Vettakollen | data/places/natur/oslo/places_natur/vettakollen.json |
| `ostensjovannet` | Østensjøvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json |
| `ostensjovannet_sivbelte` | Østensjøvannet sivbelte | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json |
