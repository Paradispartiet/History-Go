# Place coordinate candidates (pipeline v1)

Generert: 2026-06-15T19:03:44.877Z

> Maskinell, kildebasert kandidatgenerering. **Ingen place-koordinater er endret av dette verktøyet.**
> Kilder: wikidata, nominatim, overpass, official_address. Google Maps / Google Places / Google geocodes brukes ikke som skrapet eller lagret datakilde.

## Oppsummering
- Steder analysert: **581** (fra 51 fil(er))
- auto_approved: **0**
- needs_review: **581**
- rejected: **0**
- category_overlap-funn: **1**
- Modus: offline/cache-only (nett: 0 ok / 0 feil / 0 cache-treff)

> ⚠ Nettverk var utilgjengelig eller deaktivert. Steder uten cachet kilde står som needs_review («ingen kilde funnet»). Kjør på nytt med nettverkstilgang for å fylle inn kandidater.

## Confidence-regler
- **auto_approved**: Regel A (presist navne-/adressetreff, riktig område+kategori, conf ≥ 0.90), Regel B (≥2 uavhengige kilder innen 30 m, conf ≥ 0.85) eller Regel C (nåværende punkt > 100 m unna + sterk kandidat, conf ≥ 0.90).
- **needs_review**: kun navnematch, upresis kilde, historisk/revet, gate/område-anker, eller flere mulige treff.
- **rejected**: feil by/land, feil kategori, dårlig navnematch eller urimelig avstand uten kildegrunnlag.

## Topp 50 kandidater (høyest confidence)

| # | placeId | name | kategori | metode | conf | status | dist_m | kilde |
| ---: | --- | --- | --- | --- | ---: | --- | ---: | --- |
| – | – | – | – | – | – | – | – | – |

## Steder med stor avstand fra nåværende punkt (> 150 m)

| placeId | name | dist_m | conf | status | metode |
| --- | --- | ---: | ---: | --- | --- |
| – | – | – | – | – | – |

## Steder der nåværende koordinat sannsynligvis er feil

Sterk kandidat (conf ≥ 0.80) > 100 m fra nåværende punkt.

| placeId | name | dist_m | conf | status | coordSourceUrl |
| --- | --- | ---: | ---: | --- | --- |
| – | – | – | – | – | – |

## category_overlap (samme fysiske navn i flere kategorier)

Kan være samme fysiske venue (f.eks. Blå i musikk og subkultur) – ikke nødvendigvis feil duplikat.

| name | kategorier | placeIds | filer |
| --- | --- | --- | --- |
| Blå | musikk, subkultur | blaa, bla | musikk/oslo/places_musikk.json, subkultur/oslo/places_subkultur.json |

## Steder der pipeline ikke fant godt treff (needs_review uten kandidat / rejected)

| placeId | name | kategori | status | grunn |
| --- | --- | --- | --- | --- |
| torggata | Torggata | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| bispelokket | Bispelokket / Trafikkmaskinen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gronland_basarene | Grønland basarene | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| karl_johan | Karl Johans gate | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| radhusplassen | Rådhusplassen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| bjorvika | Bjørvika | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ring_3 | Ring 3 | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| trikk_17_18 | Trikkelinje 17/18 | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| toyen_torg | Tøyen torg | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| majorstuen_krysset | Majorstuen krysset | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| st_hanshaugen_park | St. Hanshaugen park | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oslo_s | Oslo S | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vulkan_energisentral | Vulkan energisentral | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| aker_brygge | Aker Brygge | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tigeren | Tigerstatuen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gronland_kirke | Grønland kirke | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| kampen_kirke | Kampen kirke | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| jernbanetorget | Jernbanetorget | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oslo_bussterminal | Oslo bussterminal | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| helsfyr | Helsfyr | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| bogstadveien | Bogstadveien | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| markveien | Markveien | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gronlandsleiret | Grønlandsleiret | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| storgata | Storgata | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ullevål_hageby | Ullevål Hageby | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| romsaås | Romsås | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| rodelokka | Rodeløkka | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vaalerenga | Vålerenga | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vinderen | Vinderen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ullern | Ullern | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| spikersuppa | Spikersuppa | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| bankplassen | Bankplassen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| christiania_torv | Christiania Torv | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| slottsparken | Slottsparken | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| botsparken | Botsparken | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| stensparken | Stensparken | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nydalen | Nydalen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tjuvholmen | Tjuvholmen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sorenga | Sørenga | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nationaltheatret_stasjon | Nationaltheatret stasjon | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| bislett | Bislett | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| olaf_ryes_plass | Olaf Ryes plass | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| birkelunden | Birkelunden | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| akerselva | Akerselva | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| universitetsplassen | Universitetsplassen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| operahuset | Operahuset | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| deichman_bjorvika | Deichman Bjørvika | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| barcode | Barcode | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vigelandsparken | Vigelandsparken | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| voienvolden | Voienvolden | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| carl_berner_plass | Carl Berners plass | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tullin | Tullin | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| okern | Økern | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| skoyen | Skøyen | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| torshov | Torshov | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| grorud | Grorud | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sagene | Sagene | by | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| saga_kino | Saga kino | populaerkultur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| klingenberg_kino | Klingenberg kino | populaerkultur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gimle_kino | Gimle kino | populaerkultur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vika_kino | Vika kino | populaerkultur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hartvig_nissens_skole_skam | Hartvig Nissens skole (SKAM) | populaerkultur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| middelalder_oslo | Middelalderparken | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oslo_domkirke | Oslo domkirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| damstredet_telthusbakken | Damstredet og Telthusbakken | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| slottet | Det kongelige slott | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sofienberg_kirke | Sofienberg kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gamlebyen_gravlund | Gamlebyen gravlund | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| akerhus_slott | Akerhus Slott | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gamle_aker_kirke | Gamle Aker kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| var_frelsers_gravlund | Vår Frelsers gravlund | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hovedoya_kloster | Hovedøya kloster | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| eidsvollsbygningen | Eidsvollsbygningen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oscarsborg_festning | Oscarsborg festning | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| grini_fangeleir | Grini fangeleir | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| villa_grande | Villa Grande | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| bogstad_gard | Bogstad gård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| mollergata_19 | Møllergata 19 | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sagene_skole | Sagene skole | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| trefoldighetskirken | Trefoldighetskirken | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nonneseter_kloster | Nonneseter kloster | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oslo_ladegard | Oslo ladegård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gamle_radhus | Gamle rådhus | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| galgeberg | Galgeberg | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oslo_hospital | Oslo hospital | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| botsfengselet | Botsfengselet | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nostvet_boplass | Nøstvet-boplassen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| raknehaugen | Raknehaugen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nes_kirkeruiner | Nes kirkeruiner | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| blaker_skanse | Blaker skanse | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| baerums_verk_jernverk | Bærums Verk | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| eidsvollsbygningen | Eidsvollsbygningen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| fetsund_lenser | Fetsund lenser | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tertitten_urskog_holandsbanen | Tertitten / Urskog-Hølandsbanen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| kjeller_flyplass | Kjeller flyplass | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oscarsborg_festning | Oscarsborg festning | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| trandumskogen | Trandumskogen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tanum_kirke | Tanum kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| haslum_kirke | Haslum kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| skedsmo_kirke | Skedsmo kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| enebakk_kirke | Enebakk kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| asker_kirke_kirkested | Asker kirke / gamle kirkested | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gamle_hvam_museum | Gamle Hvam museum | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| heggedal_hovedgard | Heggedal hovedgård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hvitsten_sjobodene | Hvitsten sjøbodene | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| son_ladested | Son ladested | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| holen_ladested | Hølen ladested | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hurdal_verk_glassverk | Hurdal Verk / Hurdal Glassverk | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vollen_maudbukta | Vollen / Maudbukta | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| roald_amundsens_hjem_uranienborg | Roald Amundsens hjem Uranienborg | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| stunner_boplass | Stunner steinalderboplass | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ski_middelalderkirke | Ski middelalderkirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| krakstad_kirke_og_gravhaug | Kråkstad kirke og gravhaug | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hadeland_glassverk | Hadeland Glassverk | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| kistefos_traesliperi | Kistefos Træsliberi | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| lunner_kirke | Lunner kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hakadal_verk | Hakadal Verk | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nesodden_kirke | Nesodden kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| seiersten_skanse | Seiersten skanse | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| raelingen_bygdetun | Rælingen bygdetun | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| losby_gods | Losby Gods | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| frogner_gamle_kirke | Frogner gamle kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sorum_kirke | Sørum kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| feiring_jernverk | Feiring jernverk | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gardermoen_militaerleir_tunet | Gardermoen militærleir / Tunet | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ullensaker_kirke_kirkested | Ullensaker kirke / Ullinhof kirkested | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| drobak_kirke | Drøbak kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| aurskog_holand_bygdetun | Aurskog-Høland bygdetun | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nannestad_bygdemuseum | Nannestad bygdemuseum | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| fredriksten_festning | Fredriksten festning | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| fredrikstad_festning_gamlebyen | Fredrikstad festning / Gamlebyen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| borgarsyssel_museum_olavsbyen | Borgarsyssel Museum / Olavsbyen Sarpsborg | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| solbergfeltet_helleristninger | Solbergfeltet helleristninger | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hunnfeltet_gravfelt | Hunnfeltet gravfelt | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tune_skipet_funnsted | Tune-skipets funnsted | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| moss_jernverk_konventionsgarden | Moss Jernverk / Konventionsgården | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hafslund_hovedgard | Hafslund hovedgård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| rod_herregard | Rød Herregård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gjellestadskipet_jellhaugen | Gjellestadskipet / Jellhaugen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hoytorp_fort | Høytorp fort | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| orje_sluser_haldenkanalen | Ørje sluser / Haldenkanalen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| basmo_festning | Basmo festning | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| eidsberg_kirke | Eidsberg kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| rygge_kirke | Rygge kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| hvaler_kirke | Hvaler kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| askim_gummivarefabrikk | Askim Gummivarefabrikk / Viking | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| borregaard_sarpsborg_industri | Borregaard Sarpsborg | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sarpsfossen | Sarpsfossen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| spydeberg_prestegard_1814 | Spydeberg prestegård / 1814-møtet | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| skjeberg_kirke | Skjeberg kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tistedalen_saugbrugsforeningen | Tistedalen / Saugbrugsforeningen | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| indreroed_gard_fredrikstad | Indre Rød gård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| varne_kloster | Værne kloster | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| onsøy_kirke | Onsøy kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| isegran_fort_verft | Isegran fort og maritime senter | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| akeroya_fort | Akerøya fort | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| trogstad_fort | Trøgstad fort | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| rodenes_kirke | Rødenes kirke | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| fredrikshalds_teater | Fredrikshalds Teater | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| rakkestad_prestegard_1814 | Rakkestad prestegård | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| aremark_kirke_kirkested | Aremark kirke / kirkested | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| kornsjo_grensestasjon | Kornsjø stasjon / grensestasjon | historie | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nasjonalmuseet | Nasjonalmuseet | kunst | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| munch_museet | MUNCH | kunst | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| astrup_fearnley | Astrup Fearnley Museet | kunst | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ekebergparken | Ekebergparken skulpturpark | kunst | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ibsen_quotes | Ibsen sitater | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nasjonalbiblioteket | Nasjonalbiblioteket | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| camilla_collett_statue | Camilla Collett-statuen | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| henrik_wergeland_statue | Henrik Wergeland-statuen | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| grotta | Grotten | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nationaltheatret | Nationaltheatret | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| litteraturhuset | Litteraturhuset | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| tronsmo_bokhandel | Tronsmo Bokhandel | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| eldorado_bokhandel | Eldorado Bokhandel | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| gamle_deichman | Gamle Deichman | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| deichman_grunerlokka | Deichman Grünerløkka | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| norli_universitetsgata | Norli Universitetsgata | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| sigrid_undset_statue | Sigrid Undset-statuen | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| ruth_maier_minne | Ruth Maier-minnesmerke | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| alf_proysen_statue_nittedal | Alf Prøysen-statuen – Nittedal kulturhus | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| proysenhuset_rudshogda | Prøysenhuset – Rudshøgda | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| inger_hagerups_plass | Inger Hagerups plass | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| oscar_braaten_statuen | Oscar Braaten-statuen | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| alexander_kiellands_plass | Alexander Kiellands plass | litteratur | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| good_game_redaksjon | Good Game-redaksjonen (NRK) | media | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| vg_huset | VG-huset | media | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| nrk_huset_marienlyst | NRK-huset på Marienlyst | media | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| aftenposten_akersgata | Aftenposten i Akersgata | media | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| dagbladet_akersgata | Dagbladet i Akersgata | media | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| klassekampen_redaksjon | Klassekampen-redaksjonen (Hausmanns gate) | media | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| salt | SALT | musikk | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| det_norske_teatret | Det Norske Teatret | musikk | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |
| blaa | Blå | musikk | needs_review | Ingen kilde funnet (mangler treff eller nettverk utilgjengelig). |

## Neste steg
- Gå gjennom needs_review manuelt mot kart.
- En senere PR kan apply'e auto_approved-kandidater via et eget apply-verktøy (ikke del av denne PR-en).
