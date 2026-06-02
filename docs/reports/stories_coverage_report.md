# Stories coverage-rapport

Post-merge rapport etter at PR #892 er merget. Rapporten kartlegger faktisk Stories-dekning i `main` etter at 40 nye story manifest-entries fra de siste parallelle storybatchene er registrert i `data/stories/stories_manifest.json`. Rapporten er revalidert mot gjeldende main-grunnlag for PR #898-refresh; totalsummene er uendret etter refreshen.

Dette er kun coverage-/rapportanalyse. Det er ikke gjort endringer i story-filer, place-filer, people-filer, manifeststruktur, UI, CSS, loaders eller runtime-kode.

Grunnlaget er faktisk `data/stories/stories_manifest.json`, alle story-filer manifestet peker til, faktisk `data/places/manifest.json`, alle aktive place-sourcefiler som place-manifestet peker til, og aktive people-ID-er fra `data/people/manifest.json`. Gamle rapporttall er bare brukt som formatreferanse og som forrige baseline i endringsseksjonen, ikke som fasit for ny coverage.

## Sammendrag

- Totalt antall aktive, unike places i place-sourcefilene: **459**.
- Places med minst én story: **115**.
- Places uten story: **344**.
- Total coverage: **25.1%**.
- Story-manifestet peker på **116** story-filer med **117** stories totalt. **117** stories har `place_id` som finnes som aktiv place-ID, fordelt på **115** aktive places.
- De **40** nye manifest-entryene fra PR #892 er registrert, peker til eksisterende story-filer og teller alle i aktiv coverage (**40** tellende entries).
- `stories_gamlebyen.json` er fortsatt uregistrert i story-manifestet og teller ikke fordi `gamlebyen` ikke finnes som aktiv place-ID i `data/places/manifest.json`-grunnlaget.

## Dekning totalt

| Måltall | Antall |
|---|---:|
| Aktive places totalt | 459 |
| Places med minst én story | 115 |
| Places uten story | 344 |
| Coverage totalt | 25.1% |
| Story-filer i manifest | 116 |
| Stories totalt | 117 |

## Endring siden forrige rapport

| Måltall | Forrige rapport | Ny rapport | Endring |
|---|---:|---:|---:|
| Places med story | 75 | 115 | +40 |
| Coverage-prosent | 16.0% | 25.1% | +9.1 prosentpoeng |
| Story-filer i manifest | 76 | 116 | +40 |
| Nye manifest-entries fra PR #892 som teller | 0 | 40 | +40 |

- Forrige baseline hadde **75** places med story og **16.0%** coverage.
- Ny status er **115** places med story og **25.1%** coverage.
- Alle de 40 nye manifest-entryene fra PR #892 teller fordi story-filene finnes, JSON er gyldig, manifestets `entity_id` matcher storyens `place_id`, og `place_id` finnes som aktiv place-ID.
- `stories_gamlebyen.json` teller ikke: filen finnes lokalt, men er ikke manifestregistrert, og `gamlebyen` er ikke aktiv place-ID i place-manifestgrunnlaget.

## Dekning per kategori

| Kategori | Places totalt | Med story | Uten story | Coverage |
|---|---:|---:|---:|---:|
| by | 86 | 12 | 74 | 14.0% |
| film_tv | 8 | 7 | 1 | 87.5% |
| historie | 54 | 15 | 39 | 27.8% |
| kunst | 18 | 5 | 13 | 27.8% |
| litteratur | 31 | 6 | 25 | 19.4% |
| media | 11 | 7 | 4 | 63.6% |
| musikk | 13 | 1 | 12 | 7.7% |
| naeringsliv | 41 | 7 | 34 | 17.1% |
| natur | 63 | 15 | 48 | 23.8% |
| politikk | 15 | 5 | 10 | 33.3% |
| populaerkultur | 18 | 8 | 10 | 44.4% |
| psykologi | 1 | 1 | 0 | 100.0% |
| sport | 49 | 11 | 38 | 22.4% |
| subkultur | 23 | 5 | 18 | 21.7% |
| vitenskap | 28 | 10 | 18 | 35.7% |

## Kontrollseksjon

Datakontrollen er gjort mot manifestet, story-filene, aktive place-ID-er og aktive people-ID-er:

- Manifest-entry-filer kontrollert: **116**.
- Manifest-entryer som peker til eksisterende story-fil: **116** av **116**.
- Story-filer som lot seg lese som gyldig JSON: **116**.
- Story-objekter kontrollert: **117**.
- Aktive place-ID-er kontrollert: **459**.
- Aktive people-ID-er kontrollert: **323**.
- Kontrollfunn som bør rettes i egen PR: **0**.

Ingen kontrollfunn: alle manifest-entryer peker til eksisterende story-fil, alle story-filer er gyldig JSON, storyenes `place_id` finnes som aktive place-ID-er, manifestets `entity_id` matcher storyenes `place_id`, people-referanser er aktive eller tomme, og `related_places`/`next_scenes.place_id` peker til aktive place-ID-er eller er tomme.

## Nye manifest-entryer fra PR #892

| place_id | Status | Navn | Kategori | Story title(s) | Story file |
|---|---|---|---|---|---|
| `lisbon_diario_de_noticias` | teller | Diário de Notícias-bygget | media | Avisbygget som gjorde pressen synlig i paradegaten | `data/stories/stories_lisbon_diario_de_noticias.json` |
| `dagbladet_akersgata` | teller | Dagbladet i Akersgata | media | Den radikale avisen i presseaksen | `data/stories/stories_dagbladet_akersgata.json` |
| `aftenposten_akersgata` | teller | Aftenposten i Akersgata | media | Aftenposten og den lange linjen i Akersgata | `data/stories/stories_aftenposten_akersgata.json` |
| `lisbon_antena_1_rdp` | teller | Antena 1 / RDP-radiohistorie | media | Fra statlig radiosignal til demokratisk allmennradio | `data/stories/stories_lisbon_antena_1_rdp.json` |
| `vg_huset` | teller | VG-huset | media | Døgnmaskinen i Akersgata 55 | `data/stories/stories_vg_huset.json` |
| `lisbon_arquivo_rtp` | teller | Arquivo RTP | media | Arkivet der Portugal kan spole tilbake offentligheten | `data/stories/stories_lisbon_arquivo_rtp.json` |
| `lisbon_centro_nautico_de_belem` | teller | Centro Náutico de Belém | sport | Tejo som klubbrom ved Belém | `data/stories/stories_lisbon_centro_nautico_de_belem.json` |
| `lisbon_hipodromo_do_campo_grande` | teller | Hipódromo do Campo Grande | sport | Da Campo Grande var hesteveddeløpsbane | `data/stories/stories_lisbon_hipodromo_do_campo_grande.json` |
| `frogner_stadion` | teller | Frogner stadion | sport | Skøyterekordene ved Frognerparken | `data/stories/stories_frogner_stadion.json` |
| `daelenenga_idrettspark` | teller | Dælenenga idrettspark | sport | Østkantbanen som skiftet idrett | `data/stories/stories_daelenenga_idrettspark.json` |
| `gressbanen` | teller | Gressbanen | sport | Landslagsbanen før Ullevaal | `data/stories/stories_gressbanen.json` |
| `nordre_aasen_idrettspark` | teller | Nordre Åsen idrettspark | sport | Skeids hjem på Nordre Åsen | `data/stories/stories_nordre_aasen_idrettspark.json` |
| `lisbon_city` | teller | Lisboa | by | Jordskjelvet som tegnet byen på nytt | `data/stories/stories_lisbon_city.json` |
| `lisbon_martim_moniz_mouraria_axis` | teller | Martim Moniz–Mouraria-aksen | by | Aksen der innvandring blir byrom | `data/stories/stories_lisbon_martim_moniz_mouraria_axis.json` |
| `lisbon_graca` | teller | Graça | by | Fra klosterhøyde til nabolagskamp | `data/stories/stories_lisbon_graca.json` |
| `lisbon_belem_bydel` | teller | Belém | by | Beléms monumentale imperieakse | `data/stories/stories_lisbon_belem_bydel.json` |
| `lisbon_feira_da_ladra` | teller | Feira da Ladra | populaerkultur | Loppemarkedet som samlet byens brukte ting | `data/stories/stories_lisbon_feira_da_ladra.json` |
| `lisbon_tram_28` | teller | Tram 28 (Eléctrico 28) | populaerkultur | Trikken som ble byikon | `data/stories/stories_lisbon_tram_28.json` |
| `lisbon_feira_do_livro` | teller | Feira do Livro de Lisboa | populaerkultur | Da parken ble bokmesse | `data/stories/stories_lisbon_feira_do_livro.json` |
| `lisbon_marchas_populares` | teller | Marchas Populares de Lisboa | populaerkultur | Nabolagene som marsjerer ned Avenidaen | `data/stories/stories_lisbon_marchas_populares.json` |
| `lisbon_santo_antonio_festival` | teller | Santo António-festivalen i Lisboa | populaerkultur | Skytshelgenfesten som fyller gatene | `data/stories/stories_lisbon_santo_antonio_festival.json` |
| `folketeateret` | teller | Folketeateret | populaerkultur | Folkets sal ved Youngstorget | `data/stories/stories_folketeateret.json` |
| `lisbon_cinema_ideal` | teller | Cinema Ideal | film_tv | Den lille kinoen som overlevde filmens skifter | `data/stories/stories_lisbon_cinema_ideal.json` |
| `lisbon_tobis_portuguesa` | teller | Tobis Portuguesa | film_tv | Lydfilmfabrikken i Lumiar | `data/stories/stories_lisbon_tobis_portuguesa.json` |
| `lisbon_cinemateca_portuguesa` | teller | Cinemateca Portuguesa | film_tv | Arkivet som gjorde film til kulturarv | `data/stories/stories_lisbon_cinemateca_portuguesa.json` |
| `lisbon_cinema_sao_jorge` | teller | Cinema São Jorge | film_tv | Den monumentale premieresalen | `data/stories/stories_lisbon_cinema_sao_jorge.json` |
| `cinemateket_oslo` | teller | Cinemateket i Oslo | film_tv | Filmhistorie som kinoprogram | `data/stories/stories_cinemateket_oslo.json` |
| `lisbon_cinema_nimas` | teller | Cinema Nimas | film_tv | Arthouse-salen nord for Saldanha | `data/stories/stories_lisbon_cinema_nimas.json` |
| `lisbon_miradouro_da_graca` | teller | Miradouro da Graça (Sophia de Mello Breyner Andresen) | natur | Klosterforplass, furuskygge og et nytt navn | `data/stories/stories_lisbon_miradouro_da_graca.json` |
| `lisbon_tapada_da_ajuda` | teller | Tapada da Ajuda | natur | Fra kongelig tapada til agronomisk forskningslandskap | `data/stories/stories_lisbon_tapada_da_ajuda.json` |
| `lisbon_tapada_das_necessidades` | teller | Tapada das Necessidades | natur | Den stille tapadaen bak Necessidades-palasset | `data/stories/stories_lisbon_tapada_das_necessidades.json` |
| `lisbon_miradouro_da_senhora_do_monte` | teller | Miradouro da Senhora do Monte | natur | Høyden der byen blir et kart | `data/stories/stories_lisbon_miradouro_da_senhora_do_monte.json` |
| `lisbon_jardim_da_estrela` | teller | Jardim da Estrela | natur | En romantisk park som sosial infrastruktur | `data/stories/stories_lisbon_jardim_da_estrela.json` |
| `lisbon_jardim_do_principe_real` | teller | Jardim do Príncipe Real | natur | Treet over reservoaret | `data/stories/stories_lisbon_jardim_do_principe_real.json` |
| `gamlebyen_skole` | teller | Gamlebyen skole | vitenskap | Skolegården over middelalderbyen | `data/stories/stories_gamlebyen_skole.json` |
| `rikshospitalet` | teller | Rikshospitalet | vitenskap | Mønstersykehuset som ble nasjonal medisinsk institusjon | `data/stories/stories_rikshospitalet.json` |
| `observatoriet` | teller | Observatoriet | vitenskap | Tid og sted målt fra Observatoriet | `data/stories/stories_observatoriet.json` |
| `universitetets_gamle_hovedbygning` | teller | Universitetets gamle hovedbygning | vitenskap | Universitetet som nasjonsbyggende kunnskapsmaskin | `data/stories/stories_universitetets_gamle_hovedbygning.json` |
| `lisbon_museu_nacional_de_historia_natural_e_da_ciencia` | teller | Museu Nacional de História Natural e da Ciência | vitenskap | Samlingene fra Escola Politécnica | `data/stories/stories_lisbon_museu_nacional_de_historia_natural_e_da_ciencia.json` |
| `lisbon_observatorio_astronomico` | teller | Observatório Astronómico de Lisboa | vitenskap | Meridianen som gjorde tid statlig | `data/stories/stories_lisbon_observatorio_astronomico.json` |

## Uregistrerte story-filer

Disse story-lignende JSON-filene finnes i `data/stories/`, men er ikke registrert i `data/stories/stories_manifest.json` og teller derfor ikke i aktiv coverage. Manifest- og støttefiler som `stories_manifest.json`, `stories_generation_manifest.json`, grafdata, kandidatdata og legacy people/place-dumper er ikke aktive story coverage-filer og er derfor holdt utenfor denne korte listen.

| Fil | Story-id / rute-id | place_id / beat-place_id | Status |
|---|---|---|---|
| `data/stories/stories_by.json` | st_by_akse_offentlighet | stortinget, karl_johan, youngstorget | ikke i manifestet og teller ikke i aktiv coverage |
| `data/stories/stories_gamlebyen.json` | st_gamlebyen_brann_flytting_1624 | gamlebyen | ikke i manifestet; `gamlebyen` finnes ikke som aktiv place-ID og teller ikke |

## Places med stories

| place_id | Navn | Kategori | Story title(s) | Story file |
|---|---|---|---|---|
| `akerselva` | Akerselva | by | Fyrstikkpikene streiker langs Akerselva | `data/stories/stories_akerselva.json` |
| `barcode` | Barcode | by | Striden om Barcode; Fra havn til finansdistrikt | `data/stories/stories_barcode.json` |
| `lisbon_belem_bydel` | Belém | by | Beléms monumentale imperieakse | `data/stories/stories_lisbon_belem_bydel.json` |
| `lisbon_graca` | Graça | by | Fra klosterhøyde til nabolagskamp | `data/stories/stories_lisbon_graca.json` |
| `lisbon_city` | Lisboa | by | Jordskjelvet som tegnet byen på nytt | `data/stories/stories_lisbon_city.json` |
| `lisbon_martim_moniz_mouraria_axis` | Martim Moniz–Mouraria-aksen | by | Aksen der innvandring blir byrom | `data/stories/stories_lisbon_martim_moniz_mouraria_axis.json` |
| `operahuset` | Operahuset | by | Operahuset man kan gå på taket av | `data/stories/stories_operahuset.json` |
| `tigeren` | Tigerstatuen | by | Da Tigerstaden fikk sin bronsetiger | `data/stories/stories_tigeren.json` |
| `torggata` | Torggata | by | Gata som ble forhandlet mellom handel, sykkel og opphold | `data/stories/stories_torggata.json` |
| `toyen_torg` | Tøyen torg | by | Fra Tøyensenteret til nabolagets åpne stue | `data/stories/stories_toyen_torg.json` |
| `universitetsplassen` | Universitetsplassen | by | Det Kongelige Frederiks Universitet – grunnlagt 1811 | `data/stories/stories_universitetsplassen.json` |
| `vigelandsparken` | Vigelandsparken | by | Gustav Vigelands kontrakt med Oslo | `data/stories/stories_vigelandsparken.json` |
| `lisbon_cinema_ideal` | Cinema Ideal | film_tv | Den lille kinoen som overlevde filmens skifter | `data/stories/stories_lisbon_cinema_ideal.json` |
| `lisbon_cinema_nimas` | Cinema Nimas | film_tv | Arthouse-salen nord for Saldanha | `data/stories/stories_lisbon_cinema_nimas.json` |
| `lisbon_cinema_sao_jorge` | Cinema São Jorge | film_tv | Den monumentale premieresalen | `data/stories/stories_lisbon_cinema_sao_jorge.json` |
| `lisbon_cinemateca_portuguesa` | Cinemateca Portuguesa | film_tv | Arkivet som gjorde film til kulturarv | `data/stories/stories_lisbon_cinemateca_portuguesa.json` |
| `cinemateket_oslo` | Cinemateket i Oslo | film_tv | Filmhistorie som kinoprogram | `data/stories/stories_cinemateket_oslo.json` |
| `colosseum_kino` | Colosseum kino | film_tv | Kuppelen som falt i brannen | `data/stories/stories_colosseum_kino.json` |
| `lisbon_tobis_portuguesa` | Tobis Portuguesa | film_tv | Lydfilmfabrikken i Lumiar | `data/stories/stories_lisbon_tobis_portuguesa.json` |
| `akerhus_slott` | Akerhus Slott | historie | Terboven tar over Akershus, september 1940 | `data/stories/stories_akerhus_slott.json` |
| `botsfengselet` | Botsfengselet | historie | Cellefengselet bygd for total isolasjon | `data/stories/stories_botsfengselet.json` |
| `eidsvollsbygningen` | Eidsvollsbygningen | historie | Grunnloven ble skrevet på Eidsvoll | `data/stories/stories_eidsvollsbygningen.json` |
| `gamle_aker_kirke` | Gamle Aker kirke | historie | Fossiler i Oslos eldste stående bygning | `data/stories/stories_gamle_aker_kirke.json` |
| `grini_fangeleir` | Grini fangeleir | historie | Grini ble den største fangeleiren i Norge | `data/stories/stories_grini_fangeleir.json` |
| `hovedoya_kloster` | Hovedøya kloster | historie | Klosteret på Hovedøya ble plyndret og brent | `data/stories/stories_hovedoya_kloster.json` |
| `middelalder_oslo` | Middelalderparken | historie | Ruinene der Oslo begynte | `data/stories/stories_middelalder_oslo.json` |
| `mollergata_19` | Møllergata 19 | historie | Quisling overga seg ved Møllergata 19 | `data/stories/stories_mollergata_19.json` |
| `oscarsborg_festning` | Oscarsborg festning | historie | Oscarsborg senket Blücher | `data/stories/stories_oscarsborg_festning.json` |
| `oslo_domkirke` | Oslo domkirke | historie | Bybrannen 1624 og den nye byen | `data/stories/stories_oslo_domkirke.json` |
| `oslo_ladegard` | Oslo ladegård | historie | Barokk over middelaldermurer | `data/stories/stories_oslo_ladegard.json` |
| `prinds_christian_augusts_minde` | Prinds Christian Augusts Minde | historie | Arbeid, tvang og asyl i Storgata 36 | `data/stories/stories_prinds_christian_augusts_minde.json` |
| `vaterland_historisk_elvelop` | Vaterland – historisk elveløp | historie | Bydelen som ble slettet og kom tilbake som knutepunkt | `data/stories/stories_vaterland.json` |
| `villa_grande` | Villa Grande | historie | Fra Gimle til HL-senteret | `data/stories/stories_villa_grande.json` |
| `var_frelsers_gravlund` | Vår Frelsers gravlund | historie | Æreslunden – der Ibsen, Bjørnson og Munch hviler | `data/stories/stories_var_frelsers_gravlund.json` |
| `astrup_fearnley` | Astrup Fearnley Museet | kunst | Privatsamlingen som ble fjordbyens kunstscene | `data/stories/stories_astrup_fearnley.json` |
| `ekebergparken` | Ekebergparken skulpturpark | kunst | Skulpturparken som leses til fots | `data/stories/stories_ekebergparken.json` |
| `lisbon_fundacao_calouste_gulbenkian` | Fundação Calouste Gulbenkian | kunst | Samlingen som ble en kulturstiftelse | `data/stories/stories_lisbon_fundacao_calouste_gulbenkian.json` |
| `munch_museet` | MUNCH | kunst | Munchs nattlige ridetur; Skrik og Madonna stjålet i høylys dag | `data/stories/stories_edvard_munch.json; data/stories/stories_munch_museet.json` |
| `nasjonalmuseet` | Nasjonalmuseet | kunst | Da samlingene flyttet under ett tak | `data/stories/stories_nasjonalmuseet.json` |
| `gamle_deichman` | Gamle Deichman | litteratur | Boksamlingen som ble folkebibliotek | `data/stories/stories_gamle_deichman.json` |
| `litteraturhuset` | Litteraturhuset | litteratur | Et nytt hus for litteraturen | `data/stories/stories_litteraturhuset.json` |
| `nasjonalbiblioteket` | Nasjonalbiblioteket | litteratur | Da nasjonalbiblioteket flyttet inn på Solli plass | `data/stories/stories_nasjonalbiblioteket.json` |
| `nationaltheatret` | Nationaltheatret | litteratur | Åpningen av Nationaltheatret 1899 | `data/stories/stories_nationaltheatret.json` |
| `ruth_maier_minne` | Ruth Maier-minnesmerke | litteratur | Dagboken som overlevde | `data/stories/stories_ruth_maier_minne.json` |
| `tronsmo_bokhandel` | Tronsmo Bokhandel | litteratur | Den uavhengige bokhandelen som holdt kursen | `data/stories/stories_tronsmo_bokhandel.json` |
| `aftenposten_akersgata` | Aftenposten i Akersgata | media | Aftenposten og den lange linjen i Akersgata | `data/stories/stories_aftenposten_akersgata.json` |
| `lisbon_antena_1_rdp` | Antena 1 / RDP-radiohistorie | media | Fra statlig radiosignal til demokratisk allmennradio | `data/stories/stories_lisbon_antena_1_rdp.json` |
| `lisbon_arquivo_rtp` | Arquivo RTP | media | Arkivet der Portugal kan spole tilbake offentligheten | `data/stories/stories_lisbon_arquivo_rtp.json` |
| `dagbladet_akersgata` | Dagbladet i Akersgata | media | Den radikale avisen i presseaksen | `data/stories/stories_dagbladet_akersgata.json` |
| `lisbon_diario_de_noticias` | Diário de Notícias-bygget | media | Avisbygget som gjorde pressen synlig i paradegaten | `data/stories/stories_lisbon_diario_de_noticias.json` |
| `nrk_huset_marienlyst` | NRK-huset på Marienlyst | media | Det hvite huset der radio og TV samlet seg | `data/stories/stories_nrk_huset_marienlyst.json` |
| `vg_huset` | VG-huset | media | Døgnmaskinen i Akersgata 55 | `data/stories/stories_vg_huset.json` |
| `det_norske_teatret` | Det Norske Teatret | musikk | Teaterslaget om nynorsk på scenen | `data/stories/stories_det_norske_teatret.json` |
| `grunnlovsbygget_bankplassen` | Den gamle Norges Bank | naeringsliv | Bankplassen og den nye statens kapital | `data/stories/stories_grunnlovsbygget_bankplassen.json` |
| `jernbaneverkstedet_lodalen` | Lodalen jernbaneverksted | naeringsliv | Togenes verkstedby i dalen | `data/stories/stories_jernbaneverkstedet_lodalen.json` |
| `oslo_gassverk` | Oslo Gassverk | naeringsliv | Gassen som tente byen | `data/stories/stories_oslo_gassverk.json` |
| `havnelageret` | Oslo Havnelager | naeringsliv | Betonglageret som organiserte havnebyen | `data/stories/stories_havnelageret.json` |
| `ringnes_bryggeri` | Ringnes bryggeri | naeringsliv | Bryggeriet som fylte kvartalet | `data/stories/stories_ringnes_bryggeri.json` |
| `schous_bryggeri` | Schous bryggeri | naeringsliv | Bryggeriet som ble kulturkvartal | `data/stories/stories_schous_bryggeri.json` |
| `telegrafbygningen` | Telegrafbygningen | naeringsliv | Kvartalet som koblet landet | `data/stories/stories_telegrafbygningen.json` |
| `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | natur | Der Akerselva møter fjorden igjen | `data/stories/stories_akerselva_utlop_bjorvika.json` |
| `alnaelva` | Alnaelva | natur | Byelva som ble skjult og lesbar igjen | `data/stories/stories_alnaelva.json` |
| `alnaelvstien` | Alnaelvstien | natur | Turveien som gjør Alna lesbar | `data/stories/stories_alnaelvstien.json` |
| `alnaparken` | Alnaparken | natur | Fra jordvei til parkdrag langs Alna | `data/stories/stories_alnaparken.json` |
| `hovedoya` | Hovedøya | natur | Øya der kalknatur, kloster og forsvar ligger lagvis | `data/stories/stories_hovedoya.json` |
| `lisbon_jardim_da_estrela` | Jardim da Estrela | natur | En romantisk park som sosial infrastruktur | `data/stories/stories_lisbon_jardim_da_estrela.json` |
| `lisbon_jardim_do_principe_real` | Jardim do Príncipe Real | natur | Treet over reservoaret | `data/stories/stories_lisbon_jardim_do_principe_real.json` |
| `ljanselva` | Ljanselva | natur | Vassdraget som går fra marka mot fjorden | `data/stories/stories_ljanselva.json` |
| `maridalsvannet` | Maridalsvannet | natur | Vannet som gjør byen mulig, men holder byen på avstand | `data/stories/stories_maridalsvannet.json` |
| `lisbon_miradouro_da_graca` | Miradouro da Graça (Sophia de Mello Breyner Andresen) | natur | Klosterforplass, furuskygge og et nytt navn | `data/stories/stories_lisbon_miradouro_da_graca.json` |
| `lisbon_miradouro_da_senhora_do_monte` | Miradouro da Senhora do Monte | natur | Høyden der byen blir et kart | `data/stories/stories_lisbon_miradouro_da_senhora_do_monte.json` |
| `svartdalen` | Svartdalen | natur | Ravinedalen der byen slipper elva fram | `data/stories/stories_svartdalen.json` |
| `lisbon_tapada_da_ajuda` | Tapada da Ajuda | natur | Fra kongelig tapada til agronomisk forskningslandskap | `data/stories/stories_lisbon_tapada_da_ajuda.json` |
| `lisbon_tapada_das_necessidades` | Tapada das Necessidades | natur | Den stille tapadaen bak Necessidades-palasset | `data/stories/stories_lisbon_tapada_das_necessidades.json` |
| `ostensjovannet` | Østensjøvannet | natur | Innsjøen som lagrer fugl, vann og randsoner | `data/stories/stories_ostensjovannet.json` |
| `eidsvolls_plass` | Eidsvolls plass | politikk | Lavvoen foran Stortinget | `data/stories/stories_eidsvolls_plass.json` |
| `oslo_radhus` | Oslo rådhus | politikk | Rådhuset åpner under byjubileet | `data/stories/stories_oslo_radhus.json` |
| `regjeringskvartalet` | Regjeringskvartalet | politikk | Bomben i Regjeringskvartalet 22. juli | `data/stories/stories_regjeringskvartalet.json` |
| `stortinget` | Stortinget | politikk | 7. juni 1905 – Stortinget erklærer unionen opphørt | `data/stories/stories_stortinget.json` |
| `youngstorget` | Youngstorget | politikk | 1. mai på Youngstorget | `data/stories/stories_youngstorget.json` |
| `lisbon_feira_da_ladra` | Feira da Ladra | populaerkultur | Loppemarkedet som samlet byens brukte ting | `data/stories/stories_lisbon_feira_da_ladra.json` |
| `lisbon_feira_do_livro` | Feira do Livro de Lisboa | populaerkultur | Da parken ble bokmesse | `data/stories/stories_lisbon_feira_do_livro.json` |
| `folketeateret` | Folketeateret | populaerkultur | Folkets sal ved Youngstorget | `data/stories/stories_folketeateret.json` |
| `grand_hotel` | Grand Hotel | populaerkultur | Ibsens daglige marsj til Grand Café | `data/stories/stories_henrik_ibsen.json` |
| `hartvig_nissens_skole_skam` | Hartvig Nissens skole (SKAM) | populaerkultur | Skolen som ble SKAMs virkelige adresse | `data/stories/stories_hartvig_nissens_skole_skam.json` |
| `lisbon_marchas_populares` | Marchas Populares de Lisboa | populaerkultur | Nabolagene som marsjerer ned Avenidaen | `data/stories/stories_lisbon_marchas_populares.json` |
| `lisbon_santo_antonio_festival` | Santo António-festivalen i Lisboa | populaerkultur | Skytshelgenfesten som fyller gatene | `data/stories/stories_lisbon_santo_antonio_festival.json` |
| `lisbon_tram_28` | Tram 28 (Eléctrico 28) | populaerkultur | Trikken som ble byikon | `data/stories/stories_lisbon_tram_28.json` |
| `psykologisk_institutt_uio` | Psykologisk institutt, UiO | psykologi | Da psykologien fikk et institutt i Norge | `data/stories/stories_psykologisk_institutt_uio.json` |
| `bislett_stadion` | Bislett Stadion | sport | Hjalmar «Hjallis» Andersen tok tre gull på Bislett | `data/stories/stories_bislett.json` |
| `lisbon_centro_nautico_de_belem` | Centro Náutico de Belém | sport | Tejo som klubbrom ved Belém | `data/stories/stories_lisbon_centro_nautico_de_belem.json` |
| `daelenenga_idrettspark` | Dælenenga idrettspark | sport | Østkantbanen som skiftet idrett | `data/stories/stories_daelenenga_idrettspark.json` |
| `ekebergsletta` | Ekebergsletta | sport | Norway Cup starter med jentelag | `data/stories/stories_ekebergsletta.json` |
| `frogner_stadion` | Frogner stadion | sport | Skøyterekordene ved Frognerparken | `data/stories/stories_frogner_stadion.json` |
| `gressbanen` | Gressbanen | sport | Landslagsbanen før Ullevaal | `data/stories/stories_gressbanen.json` |
| `lisbon_hipodromo_do_campo_grande` | Hipódromo do Campo Grande | sport | Da Campo Grande var hesteveddeløpsbane | `data/stories/stories_lisbon_hipodromo_do_campo_grande.json` |
| `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | sport | Da Holmenkollrennet ble en nasjonal tradisjon | `data/stories/stories_holmenkollen.json` |
| `jordal_amfi` | Jordal Amfi | sport | Kunstisen som reddet OL-hockeyen | `data/stories/stories_jordal_amfi.json` |
| `nordre_aasen_idrettspark` | Nordre Åsen idrettspark | sport | Skeids hjem på Nordre Åsen | `data/stories/stories_nordre_aasen_idrettspark.json` |
| `ullevaal_stadion` | Ullevaal Stadion | sport | Cupfinalenes hjem åpnet i 1926 | `data/stories/stories_ullevaal_stadion.json` |
| `bla` | Blå | subkultur | Elvekanten som ble nattlig musikkrom | `data/stories/stories_bla.json` |
| `hausmania` | Hausmania | subkultur | Kulturhuset som ble fristed og bypolitisk konflikt | `data/stories/stories_hausmania.json` |
| `skur13` | Skur 13 | subkultur | Havnelageret som ble rulleflate | `data/stories/stories_skur13.json` |
| `sofienbergparken_subkultur` | Sofienbergparken | subkultur | Parken som lavterskel offentlighet | `data/stories/stories_sofienbergparken_subkultur.json` |
| `torggata_blad` | Torggata Blad | subkultur | Bladet som gjorde gata til alternativ offentlighet | `data/stories/stories_torggata_blad.json` |
| `botanisk_hage` | Botanisk hage | vitenskap | Hagen som skulle bygge kunnskap for den nye nasjonen | `data/stories/stories_botanisk_hage.json` |
| `gamlebyen_skole` | Gamlebyen skole | vitenskap | Skolegården over middelalderbyen | `data/stories/stories_gamlebyen_skole.json` |
| `meteorologisk_institutt` | Meteorologisk institutt | vitenskap | Været blir en nasjonal datainfrastruktur | `data/stories/stories_meteorologisk_institutt.json` |
| `lisbon_museu_nacional_de_historia_natural_e_da_ciencia` | Museu Nacional de História Natural e da Ciência | vitenskap | Samlingene fra Escola Politécnica | `data/stories/stories_lisbon_museu_nacional_de_historia_natural_e_da_ciencia.json` |
| `naturhistorisk_museum` | Naturhistorisk museum | vitenskap | Fossilet Ida blir verdensnyhet | `data/stories/stories_naturhistorisk_museum.json` |
| `teknisk_museum` | Norsk Teknisk Museum | vitenskap | Fra jubileumsutstilling til teknologihistorisk hukommelse | `data/stories/stories_teknisk_museum.json` |
| `observatoriet` | Observatoriet | vitenskap | Tid og sted målt fra Observatoriet | `data/stories/stories_observatoriet.json` |
| `lisbon_observatorio_astronomico` | Observatório Astronómico de Lisboa | vitenskap | Meridianen som gjorde tid statlig | `data/stories/stories_lisbon_observatorio_astronomico.json` |
| `rikshospitalet` | Rikshospitalet | vitenskap | Mønstersykehuset som ble nasjonal medisinsk institusjon | `data/stories/stories_rikshospitalet.json` |
| `universitetets_gamle_hovedbygning` | Universitetets gamle hovedbygning | vitenskap | Universitetet som nasjonsbyggende kunnskapsmaskin | `data/stories/stories_universitetets_gamle_hovedbygning.json` |

## Places uten stories, gruppert per kategori

### by (74 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_ajuda` | Ajuda | 1761 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `aker_brygge` | Aker Brygge | 1989 | `data/places/by/oslo/places_by.json` |
| `lisbon_alcantara` | Alcântara | 1888 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_alfama` | Alfama | 711 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `alnabru_jernbane_og_logistikk` | Alnabru – jernbane og logistikk |  | `data/places/natur/oslo/places_oslo_alna.json` |
| `ankerbrua` | Ankerbrua | 1874 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `lisbon_avenida_da_liberdade` | Avenida da Liberdade | 1879 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_baixa_pombalina` | Baixa Pombalina | 1758 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `bankplassen` | Bankplassen | 1800 | `data/places/by/oslo/places_by.json` |
| `beierbrua` | Beierbrua | 1889 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `lisbon_bica` | Bica | 1892 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `birkelunden` | Birkelunden | 1910 | `data/places/by/oslo/places_by.json` |
| `bislett` | Bislett | 1922 | `data/places/by/oslo/places_by.json` |
| `bispelokket` | Bispelokket / Trafikkmaskinen | 1966 | `data/places/by/oslo/places_by.json` |
| `bjorvika` | Bjørvika | 2008 | `data/places/by/oslo/places_by.json` |
| `bogstadveien` | Bogstadveien | 1870 | `data/places/by/oslo/places_by.json` |
| `botsparken` | Botsparken | 1900 | `data/places/by/oslo/places_by.json` |
| `lisbon_cais_do_sodre` | Cais do Sodré | 1875 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_campo_de_ourique` | Campo de Ourique | 1879 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_campo_pequeno` | Campo Pequeno | 1892 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `carl_berner_plass` | Carl Berners plass | 1905 | `data/places/by/oslo/places_by.json` |
| `lisbon_chiado` | Chiado | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `christiania_torv` | Christiania Torv | 1648 | `data/places/by/oslo/places_by.json` |
| `deichman_bjorvika` | Deichman Bjørvika | 2020 | `data/places/by/oslo/places_by.json` |
| `lisbon_elevador_de_santa_justa` | Elevador de Santa Justa | 1902 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_entrecampos` | Entrecampos | 1957 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_oriente_station` | Estação do Oriente | 1998 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_estrela` | Estrela | 1790 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_gare_do_cais_do_sodre` | Gare do Cais do Sodré | 1928 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `gronland_basarene` | Grønland basarene | 1901 | `data/places/by/oslo/places_by.json` |
| `gronland_kirke` | Grønland kirke | 1869 | `data/places/by/oslo/places_by.json` |
| `gronlandsleiret` | Grønlandsleiret | 1860 | `data/places/by/oslo/places_by.json` |
| `grunerlokka_helgesens_tm` | Grünerløkka – Helgesens / Thorvald Meyers | 1880 | `data/places/by/oslo/places_by.json` |
| `hausmannsbrua` | Hausmannsbrua | 1880 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `hausmannsomradet_elvelop` | Hausmannsområdet (elveløp) | 1970 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `helsfyr` | Helsfyr | 1966 | `data/places/by/oslo/places_by.json` |
| `lisbon_intendente` | Intendente | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `jernbanetorget` | Jernbanetorget | 1854 | `data/places/by/oslo/places_by.json` |
| `kampen_kirke` | Kampen kirke | 1882 | `data/places/by/oslo/places_by.json` |
| `karl_johan` | Karl Johans gate | 1848 | `data/places/by/oslo/places_by.json` |
| `lisbon_lapa` | Lapa | 1850 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `majorstuen_krysset` | Majorstuen krysset | 1930 | `data/places/by/oslo/places_by.json` |
| `majorstuen_tbanestasjon` | Majorstuen T-banestasjon | 1898 | `data/places/by/oslo/places_by.json` |
| `markveien` | Markveien | 1880 | `data/places/by/oslo/places_by.json` |
| `nationaltheatret_stasjon` | Nationaltheatret stasjon | 1928 | `data/places/by/oslo/places_by.json` |
| `nybrua_vaterlandsparken` | Nybrua / Vaterlandsparken | 1827 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `nydalen` | Nydalen | 2000 | `data/places/by/oslo/places_by.json` |
| `olaf_ryes_plass` | Olaf Ryes plass | 1890 | `data/places/by/oslo/places_by.json` |
| `oslo_bussterminal` | Oslo bussterminal | 1987 | `data/places/by/oslo/places_by.json` |
| `oslo_s` | Oslo S | 1980 | `data/places/by/oslo/places_by.json` |
| `lisbon_parque_eduardo_vii` | Parque Eduardo VII | 1903 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_ponte_25_de_abril` | Ponte 25 de Abril | 1966 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_praca_do_comercio` | Praça do Comércio | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `lisbon_principe_real` | Príncipe Real | 1860 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `ring_3` | Ring 3 | 1970 | `data/places/by/oslo/places_by.json` |
| `rodelokka` | Rodeløkka | 1870 | `data/places/by/oslo/places_by.json` |
| `romsaås` | Romsås | 1970 | `data/places/by/oslo/places_by.json` |
| `lisbon_rossio` | Rossio (Praça Dom Pedro IV) | 1755 | `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` |
| `radhusplassen` | Rådhusplassen | 1950 | `data/places/by/oslo/places_by.json` |
| `slottsparken` | Slottsparken | 1840 | `data/places/by/oslo/places_by.json` |
| `spikersuppa` | Spikersuppa | 1930 | `data/places/by/oslo/places_by.json` |
| `st_hanshaugen_park` | St. Hanshaugen park | 1876 | `data/places/by/oslo/places_by.json` |
| `stensparken` | Stensparken | 1890 | `data/places/by/oslo/places_by.json` |
| `storgata` | Storgata | 1850 | `data/places/by/oslo/places_by.json` |
| `sorenga` | Sørenga | 2015 | `data/places/by/oslo/places_by.json` |
| `tjuvholmen` | Tjuvholmen | 2010 | `data/places/by/oslo/places_by.json` |
| `trikk_17_18` | Trikkelinje 17/18 | 1924 | `data/places/by/oslo/places_by.json` |
| `ullern` | Ullern | 1930 | `data/places/by/oslo/places_by.json` |
| `ullevål_hageby` | Ullevål Hageby | 1915 | `data/places/by/oslo/places_by.json` |
| `vinderen` | Vinderen | 1920 | `data/places/by/oslo/places_by.json` |
| `voienvolden` | Voienvolden | 1716 | `data/places/by/oslo/places_by.json` |
| `vulkan_energisentral` | Vulkan energisentral | 2012 | `data/places/by/oslo/places_by.json` |
| `vulkan_industriomrade` | Vulkan industriområde | 1857 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `vaalerenga` | Vålerenga | 1860 | `data/places/by/oslo/places_by.json` |

### film_tv (1 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_doclisboa` | Doclisboa – Festival Internacional de Cinema | 2002 | `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` |

### historie (39 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_aqueduto_das_aguas_livres` | Aqueduto das Águas Livres | 1748 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `bjoelsenfossen` | Bjølsenfossen | 1850 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `bogstad_gard` | Bogstad gård | 1772 | `data/places/historie/oslo/places_historie.json` |
| `lisbon_castelo_de_sao_jorge` | Castelo de São Jorge | 1147 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_convento_do_carmo` | Convento do Carmo | 1389 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `damstredet_telthusbakken` | Damstredet og Telthusbakken | 1750 | `data/places/historie/oslo/places_historie.json` |
| `slottet` | Det kongelige slott | 1849 | `data/places/historie/oslo/places_historie.json` |
| `lisbon_estacao_do_rossio` | Estação do Rossio | 1890 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `frysjadammen` | Frysjadammen | 1918 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `galgeberg` | Galgeberg | 1600 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| `gamle_radhus` | Gamle rådhus | 1641 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| `gamle_trikkestallen` | Gamle trikkestallen på Sagene | 1899 | `data/places/historie/oslo/places_historie.json` |
| `gamlebyen_gravlund` | Gamlebyen gravlund | 1800 | `data/places/historie/oslo/places_historie.json` |
| `glads_molle` | Glads mølle | 1736 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `hellerud_gard` | Hellerud gård |  | `data/places/natur/oslo/places_oslo_alna.json` |
| `lisbon_igreja_de_santo_antonio` | Igreja de Santo António | 1812 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_igreja_de_sao_domingos` | Igreja de São Domingos | 1241 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_igreja_de_sao_roque` | Igreja de São Roque | 1565 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_sao_vicente_de_fora` | Igreja e Mosteiro de São Vicente de Fora | 1582 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_mosteiro_dos_jeronimos` | Mosteiro dos Jerónimos | 1502 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_museu_de_lisboa` | Museu de Lisboa (Palácio Pimenta) | 1762 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_museu_de_marinha` | Museu de Marinha | 1962 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_museu_do_aljube` | Museu do Aljube – Resistência e Liberdade | 2015 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_museu_nacional_dos_coches` | Museu Nacional dos Coches | 1905 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `nedre_foss` | Nedre Foss | 1800 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `nonneseter_kloster` | Nonneseter kloster | 1161 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| `nydalen_industristed` | Nydalen industristed | 1845 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `oslo_hospital` | Oslo hospital | 1538 | `data/places/historie/oslo/places_historie_added_batch_01.json` |
| `lisbon_padrao_dos_descobrimentos` | Padrão dos Descobrimentos | 1960 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_palacio_fronteira` | Palácio dos Marqueses de Fronteira | 1672 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_palacio_ajuda` | Palácio Nacional da Ajuda | 1796 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_panteao_nacional` | Panteão Nacional (Igreja de Santa Engrácia) | 1681 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_teatro_romano` | Ruínas do Teatro Romano | -57 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `seilduksfabrikken_nydalen` | Seilduksfabrikken (Nydalen) | 1856 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `sofienberg_kirke` | Sofienberg kirke | 1877 | `data/places/historie/oslo/places_historie.json` |
| `lisbon_se_de_lisboa` | Sé de Lisboa | 1147 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `lisbon_torre_de_belem` | Torre de Belém | 1519 | `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` |
| `voien_gard_voienvolden` | Vøien gård / Vøienvolden | 1670 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `voienfossen` | Vøienfossen | 1847 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |

### kunst (13 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_centro_cultural_de_belem` | Centro Cultural de Belém | 1992 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_culturgest` | Culturgest | 1993 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_maat` | MAAT / Tejo-kraftstasjonen | 2016 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_mac_ccb_berardo` | MAC/CCB (tidligere Museu Coleção Berardo) | 2007 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_mude` | MUDE – Museu do Design e da Moda | 2009 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_museu_arpad_szenes_vieira_da_silva` | Museu Arpad Szenes – Vieira da Silva | 1994 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_museu_bordalo_pinheiro` | Museu Bordalo Pinheiro | 1916 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_museu_do_oriente` | Museu do Oriente | 2008 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_museu_nacional_de_arte_antiga` | Museu Nacional de Arte Antiga | 1884 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_museu_nacional_de_arte_contemporanea_do_chiado` | Museu Nacional de Arte Contemporânea do Chiado | 1911 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_museu_nacional_do_azulejo` | Museu Nacional do Azulejo | 1965 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_teatro_nacional_d_maria_ii` | Teatro Nacional D. Maria II | 1846 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |
| `lisbon_teatro_sao_luiz` | Teatro São Luiz | 1894 | `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` |

### litteratur (25 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_a_brasileira` | A Brasileira / Fernando Pessoa | 1905 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `alexander_kiellands_plass` | Alexander Kiellands plass | 1913 | `data/places/litteratur/oslo/places_litteratur.json` |
| `alf_proysen_statue_nittedal` | Alf Prøysen-statuen – Nittedal kulturhus | 2019 | `data/places/litteratur/oslo/places_litteratur.json` |
| `lisbon_biblioteca_nacional_de_portugal` | Biblioteca Nacional de Portugal | 1796 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `camilla_collett_statue` | Camilla Collett-statuen | 1911 | `data/places/litteratur/oslo/places_litteratur.json` |
| `lisbon_casa_dos_bicos` | Casa dos Bicos / Fundação José Saramago | 1523 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `lisbon_casa_dos_estudantes_do_imperio` | Casa dos Estudantes do Império | 1944 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `lisbon_casa_fernando_pessoa` | Casa Fernando Pessoa | 1993 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `lisbon_cemiterio_dos_prazeres` | Cemitério dos Prazeres | 1833 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `deichman_grunerlokka` | Deichman Grünerløkka | 1914 | `data/places/litteratur/oslo/places_litteratur.json` |
| `eldorado_bokhandel` | Eldorado Bokhandel | 1924 | `data/places/litteratur/oslo/places_litteratur.json` |
| `lisbon_estatua_eca_de_queiros` | Estátua de Eça de Queirós | 1903 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `grotta` | Grotten | 1924 | `data/places/litteratur/oslo/places_litteratur.json` |
| `lisbon_gremio_literario` | Grémio Literário | 1846 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `lisbon_hemeroteca_municipal` | Hemeroteca Municipal de Lisboa | 1931 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `henrik_wergeland_statue` | Henrik Wergeland-statuen | 1881 | `data/places/litteratur/oslo/places_litteratur.json` |
| `ibsen_quotes` | Ibsen sitater | 2006 | `data/places/litteratur/oslo/places_litteratur.json` |
| `inger_hagerups_plass` | Inger Hagerups plass | 1990 | `data/places/litteratur/oslo/places_litteratur.json` |
| `kulturkirken_jakob_litteratur` | Kulturkirken Jakob | 2000 | `data/places/litteratur/oslo/places_litteratur.json` |
| `lisbon_livraria_bertrand` | Livraria Bertrand (Chiado) | 1732 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `norli_universitetsgata` | Norli Universitetsgata | 1890 | `data/places/litteratur/oslo/places_litteratur.json` |
| `oscar_braaten_statuen` | Oscar Braaten-statuen | 1956 | `data/places/litteratur/oslo/places_litteratur.json` |
| `lisbon_praca_luis_de_camoes` | Praça Luís de Camões | 1867 | `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` |
| `proysenhuset_rudshogda` | Prøysenhuset – Rudshøgda | 2014 | `data/places/litteratur/oslo/places_litteratur.json` |
| `sigrid_undset_statue` | Sigrid Undset-statuen | 1982 | `data/places/litteratur/oslo/places_litteratur.json` |

### media (4 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `good_game_redaksjon` | Good Game-redaksjonen (NRK) | 2011 | `data/places/media/oslo/places_oslo_media.json` |
| `klassekampen_redaksjon` | Klassekampen-redaksjonen (Hausmanns gate) | 1969 | `data/places/media/oslo/places_oslo_media.json` |
| `lisbon_lusa` | Lusa – Agência de Notícias de Portugal | 1987 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |
| `lisbon_rtp` | RTP – Rádio e Televisão de Portugal | 1957 | `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` |

### musikk (12 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `blaa` | Blå | 1998 | `data/places/musikk/oslo/places_musikk.json` |
| `lisbon_clube_de_fado` | Clube de Fado | 1995 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| `lisbon_coliseu_dos_recreios` | Coliseu dos Recreios | 1890 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| `lisbon_hot_clube_de_portugal` | Hot Clube de Portugal | 1948 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| `john_dee` | John Dee | 1997 | `data/places/musikk/oslo/places_musikk.json` |
| `lisbon_mouraria_fado` | Mouraria / fado | 1147 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| `lisbon_museu_do_fado` | Museu do Fado | 1998 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| `rockefeller` | Rockefeller Music Hall | 1986 | `data/places/musikk/oslo/places_musikk.json` |
| `salt` | SALT | 2014 | `data/places/musikk/oslo/places_musikk.json` |
| `sentrum_scene` | Sentrum Scene | 1992 | `data/places/musikk/oslo/places_musikk.json` |
| `lisbon_tasca_do_chico` | Tasca do Chico | 1993 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |
| `lisbon_teatro_tivoli_bbva` | Teatro Tivoli BBVA | 1924 | `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` |

### naeringsliv (34 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `akerselva_industri` | Akerselva industriområde | 1850 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `akershus_energi` | Akershus Energi Varme | 2010 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `akershus_kaier` | Akershuskaiene | 1850 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `lisbon_armazens_do_chiado` | Armazéns do Chiado | 1894 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `akershus_slott_bakeriet` | Bakeriet ved Akershus | 1820 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `bryn_industriomrade` | Bryn industriområde | 1880 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `oslo_kornmagasin` | Christiania kornmagasin | 1785 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `christiania_seildugsfabrik` | Christiania Seildugsfabrik | 1856 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `lisbon_cordoaria_nacional` | Cordoaria Nacional | 1771 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `lisbon_doca_de_alcantara` | Doca de Alcântara | 1887 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `fornebu_teknologipark` | Fornebu Teknologipark | 2002 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `frysja_industriomrade` | Frysja industriområde | 1750 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `grensen_kjopesenter` | Grensen – handelens sentrum | 1800 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `gronlikaia` | Grønlikaia | 1960 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `jernbanetorget_trafikknutepunkt` | Jernbanetorget – handelsknutepunktet | 1854 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `lilleborg_fabrikker` | Lilleborg Fabrikker | 1833 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `lisbon_lx_factory` | LX Factory | 1846 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `lisbon_mercado_da_ribeira` | Mercado da Ribeira / Time Out Market | 1882 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `lisbon_mercado_de_campo_de_ourique` | Mercado de Campo de Ourique | 1934 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `myrens_verksted` | Myrens Verksted | 1848 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `norges_varemesse` | Norges Varemesse | 1920 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `nrk_marienlyst` | NRK Marienlyst | 1938 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `oslo_kraftselskap` | Oslo Lysverker | 1892 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `oslo_mek` | Oslo Mekaniske Verksted | 1854 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `oslo_posthus` | Oslo Posthus | 1924 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `lisbon_parque_das_nacoes` | Parque das Nações | 1998 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `sagene_kvernhus` | Sagene mølle og kvernhus | 1750 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `st_halvard_bryggeri` | St. Halvard bryggeri | 1843 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `lisbon_terminal_de_cruzeiros` | Terminal de Cruzeiros de Lisboa | 2017 | `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` |
| `tollbukaia` | Tollbukaia | 1890 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `ulven_handelspark` | Ulven handelspark | 2020 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `vinmonopolet_lager` | Vinmonopolets hovedlager | 1930 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `vippetangen_fisketorg` | Vippetangen fisketorg | 1890 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |
| `ovre_foss` | Øvre Foss – Hjula Veveri | 1855 | `data/places/naeringsliv/oslo/places_naeringsliv.json` |

### natur (48 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `alna_utlop_bjorvika` | Alna utløp i Bjørvika |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| `alna_bryn` | Alna ved Bryn |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| `alna_smalvoll` | Alna ved Smalvoll |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| `alnaelva_hovedsteder` | Alnaelva | 2005 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| `alnsjoen_alna_kilde` | Alnsjøen (Alna-kilde) |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| `bjoelsenparken_elvenaer` | Bjølsenparken (elvenær del) | 1930 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `blindern_forskningsparken_salamanderdam` | Blindern/Forskningsparken salamanderdam | 2025 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| `bygdoy_bygdoynes` | Bygdøy Bygdøynes |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| `bygdoy_dronningberget` | Bygdøy Dronningberget |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| `bygdoy_huk` | Bygdøy Huk |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| `bygdoy_kongeskogen` | Bygdøy Kongeskogen |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| `bygdoy_kongsgard_salamanderdam` | Bygdøy Kongsgård salamanderdam | 2006 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| `bygdoy_natur` | Bygdøy natur- og kulturmiljø | 2002 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| `bygdoy_paradisbukta` | Bygdøy Paradisbukta |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| `bygdoy_roykenvika` | Bygdøy Røykensvika |  | `data/places/natur/oslo/places_oslo_natur_bygdoy.json` |
| `bantjern_salamanderlokalitet` | Båntjern salamanderlokalitet | 1988 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| `bogerudmyra` | Bøler/Bogerudmyra |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| `elvestrekning_bla_brenneriveien` | Elvestrekning ved Blå (Brenneriveien) | 1998 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `fossveien_elvestrekning` | Fossveien – elvestrekning | 1890 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `furuset_haugerud_skogbelte` | Furuset–Haugerud skogbelte |  | `data/places/natur/oslo/places_oslo_alna.json` |
| `gressholmen` | Gressholmen | 1992 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| `groruddammen` | Groruddammen |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| `lisbon_jardim_botanico` | Jardim Botânico de Lisboa | 1873 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| `lisbon_jardim_gulbenkian` | Jardim da Fundação Calouste Gulbenkian | 1969 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| `lisbon_jardim_do_torel` | Jardim do Torel | 1860 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| `kuba_parken` | Kuba-parken | 2007 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `kvaernerbyen_alna` | Kværnerbyen ved Alna |  | `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` |
| `ljanselva_bunnefjorden` | Ljanselva ut i Bunnefjorden |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `ljanselva_fiskevollen` | Ljanselva ved Fiskevollen |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `ljanselva_hauketo` | Ljanselva ved Hauketo |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `ljanselva_ljan` | Ljanselva ved Ljan |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `ljanselva_skullerud` | Ljanselva ved Skullerud |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `loelva_historisk` | Loelva (historisk vassdrag) |  | `data/places/natur/oslo/places_oslo_alna.json` |
| `lisbon_miradouro_sao_pedro_de_alcantara` | Miradouro de São Pedro de Alcântara | 1864 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| `myralokka` | Myraløkka | 1920 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `maerradalen` | Mærradalen | 2009 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| `nydalsdammen` | Nydalsdammen | 1860 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `noklevann` | Nøklevann | 1923 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` |
| `noklevann_ljanselva_start` | Nøklevann (Ljanselva start) |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `lisbon_monsanto` | Parque Florestal de Monsanto | 1934 | `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` |
| `skraperudtjern` | Skraperudtjern |  | `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` |
| `stilla_nydalen` | Stilla ved Nydalen | 1900 | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` |
| `tjernsmyr_salamanderlokalitet` | Tjernsmyr salamanderlokalitet | 2020 | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` |
| `trosterud_friomrade` | Trosterud friområde |  | `data/places/natur/oslo/places_oslo_alna.json` |
| `ostensjovannet_fugletarn` | Østensjøvannet fugletårn |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| `ostensjovannet_nord` | Østensjøvannet nord |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| `ostensjovannet_sivbelte` | Østensjøvannet sivbelte |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |
| `ostensjovannet_sor` | Østensjøvannet sør |  | `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` |

### politikk (10 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_assembleia_da_republica` | Assembleia da República | 1834 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_avenida_24_de_julho` | Avenida 24 de Julho | 1882 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_fundacao_mario_soares_maria_barroso` | Fundação Mário Soares e Maria Barroso | 1996 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_largo_do_carmo` | Largo do Carmo | 1974 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `tinghuset` | Oslo tinghus | 1994 | `data/places/politikk/oslo/places_politikk.json` |
| `lisbon_palacio_de_belem` | Palácio de Belém | 1726 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_praca_do_municipio` | Praça do Município / Câmara Municipal de Lisboa | 1880 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_praca_dos_restauradores` | Praça dos Restauradores | 1886 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_praca_marques_de_pombal` | Praça Marquês de Pombal | 1934 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |
| `lisbon_tribunal_constitucional` | Tribunal Constitucional / Palácio Ratton | 1746 | `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` |

### populaerkultur (10 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_casa_museu_amalia_rodrigues` | Casa-Museu Amália Rodrigues | 2001 | `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` |
| `chateau_neuf` | Chateau Neuf | 1971 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| `frognerstranda` | Frognerstranda |  | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| `gimle_kino` | Gimle kino | 1939 | `data/places/film/oslo/places_oslo_film.json` |
| `house_of_nerds` | House of Nerds | 2020 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| `klingenberg_kino` | Klingenberg kino | 1938 | `data/places/film/oslo/places_oslo_film.json` |
| `latter` | Latter | 2004 | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| `saga_kino` | Saga kino | 1989 | `data/places/film/oslo/places_oslo_film.json` |
| `slottsplassen` | Slottsplassen |  | `data/places/popkultur/oslo/places_oslo_populaerkultur.json` |
| `vika_kino` | Vika kino | 1981 | `data/places/film/oslo/places_oslo_film.json` |

### psykologi (0 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|

### sport (38 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lekeplass_birkelunden` | Birkelunden lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lekeplass_botsparken` | Botsparken lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lisbon_estadio_da_luz` | Estádio da Luz | 2003 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| `lisbon_complexo_desportivo_do_restelo` | Estádio do Restelo (Complexo Desportivo do Restelo) | 1956 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| `lisbon_estadio_jose_alvalade` | Estádio José Alvalade | 2003 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| `lisbon_estadio_universitario` | Estádio Universitário de Lisboa | 1956 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| `finnskogbanen` | Finnskogbanen |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `lekeplass_frognerborgen` | Frognerborgen | 2006 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `furuset_forum` | Furuset Forum | 1998 | `data/places/sport/oslo/places_sport.json` |
| `gardermoen_motorpark` | Gardermoen Motorpark |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `gardermoen_raceway` | Gardermoen Raceway | 1996 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `grenland_motorsportsenter` | Grenland Motorsportsenter | 2007 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `intility_arena` | Intility Arena | 2017 | `data/places/sport/oslo/places_sport.json` |
| `lekeplass_kampen_park` | Kampen park lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `treningssted_kampen_park` | Kampen park treningssted |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `kfum_arena` | KFUM Arena | 2007 | `data/places/sport/oslo/places_sport.json` |
| `lekeplass_kirsebarlunden` | Kirsebærlunden lekeplass | 2022 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `kongsberg_motorsenter` | Kongsberg Motorsenter |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `lyngasbanen` | Lyngåsbanen (historisk) | 1959 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `manglerudhallen` | Manglerudhallen | 1979 | `data/places/sport/oslo/places_sport.json` |
| `momarken_bilbane` | Momarken Bilbane |  | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `naf_gokartsenter_andebu` | NAF Gokartsenter Andebu (Håsken) | 1993 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `lekeplass_olaf_ryes_plass` | Olaf Ryes plass lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lisbon_pavilhao_joao_rocha` | Pavilhão João Rocha | 2017 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| `lisbon_pista_moniz_pereira` | Pista de Atletismo Professor Moniz Pereira | 2009 | `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` |
| `aktivitet_rudolf_nilsens_plass` | Rudolf Nilsens plass aktivitetspark | 2022 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `rudskogen_motorsenter` | Rudskogen Motorsenter | 1990 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `treningssted_skur13` | Skur 13 skate- og balansetrening |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lekeplass_snippen` | Snippen lekepark | 2018 | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lekeplass_sofienbergparken` | Sofienbergparken lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `treningssted_sognsvann` | Sognsvann treningsrunde |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lekeplass_st_hanshaugen` | St. Hanshaugen lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `lekeplass_stensparken` | Stensparken lekeplass |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `treningssted_torshovdalen` | Torshovdalen trenings- og aktivitetspark |  | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` |
| `valle_hovin_stadion` | Valle Hovin stadion | 1966 | `data/places/sport/oslo/places_sport.json` |
| `vallhall_arena` | Vallhall Arena | 2001 | `data/places/sport/oslo/places_sport.json` |
| `varna_kartring` | Varna Kartring | 1991 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |
| `valerbanen` | Vålerbanen | 1990 | `data/places/sport/ostlandet/places_motorsport_ostlandet.json` |

### subkultur (18 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `lisbon_anjos70` | Anjos70 | 2015 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `lisbon_bairro_alto` | Bairro Alto | 1500 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `lisbon_crew_hassan` | Crew Hassan | 2007 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `lisbon_desterro` | Desterro | 2014 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `lisbon_fabrica_braco_de_prata` | Fábrica Braço de Prata | 2007 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `lisbon_galeria_ze_dos_bois` | Galeria Zé dos Bois (ZDB) | 1994 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `gronland_underganger` | Grønland underganger | 2008 | `data/places/subkultur/oslo/places_subkultur.json` |
| `grunerlokka_bakgardsvegger` | Grünerløkka bakgårdsvegger | 2007 | `data/places/subkultur/oslo/places_subkultur.json` |
| `hausmannsgate_aksen` | Hausmannsgate-aksen | 2000 | `data/places/subkultur/oslo/places_subkultur.json` |
| `kolstadgata_toyen_vegger` | Kolstadgata veggmiljø | 2016 | `data/places/subkultur/oslo/places_subkultur.json` |
| `kuba_akselpassasjer` | Kuba-passasjene ved Akerselva | 2009 | `data/places/subkultur/oslo/places_subkultur.json` |
| `lisbon_musicbox` | Musicbox Lisboa | 2006 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `nybrua_pilarrom` | Nybrua pilarrom | 2010 | `data/places/subkultur/oslo/places_subkultur.json` |
| `lisbon_pink_street` | Rua Nova do Carvalho / Pink Street | 2011 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `schweigaards_gate_lodalen` | Schweigaards gate–Lodalen veggakse | 2011 | `data/places/subkultur/oslo/places_subkultur.json` |
| `stovnertarnet` | Stovnertårnet | 2017 | `data/places/subkultur/oslo/places_subkultur.json` |
| `lisbon_village_underground` | Village Underground Lisboa | 2014 | `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` |
| `vulkan_murvegger` | Vulkan murvegger og passasjer | 2012 | `data/places/subkultur/oslo/places_subkultur.json` |

### vitenskap (18 uten story)

| place_id | Navn | År | Place file |
|---|---|---:|---|
| `abelhaugen` | Abelhaugen | 1908 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `arkitektur_og_designhogskolen` | Arkitektur- og designhøgskolen i Oslo | 1945 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `lisbon_torre_do_tombo` | Arquivo Nacional da Torre do Tombo | 1990 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `bi_nydalen` | BI i Nydalen | 2005 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `lisbon_faculdade_de_ciencias` | Faculdade de Ciências da Universidade de Lisboa | 1911 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `forskningsparken` | Forskningsparken | 1989 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `lisbon_instituto_higiene_medicina_tropical` | Instituto de Higiene e Medicina Tropical | 1902 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `lisbon_instituto_ricardo_jorge` | Instituto Nacional de Saúde Doutor Ricardo Jorge | 1899 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `lisbon_instituto_superior_tecnico` | Instituto Superior Técnico | 1911 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `lisbon_jardim_botanico_tropical` | Jardim Botânico Tropical | 1906 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `lisbon_laboratorio_nacional_engenharia_civil` | Laboratório Nacional de Engenharia Civil | 1946 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `nobelinstituttet` | Nobelinstituttet | 1905 | `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json` |
| `oslo_met_pilestredet` | OsloMet, Pilestredet | 1994 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `lisbon_pavilhao_do_conhecimento` | Pavilhão do Conhecimento | 1999 | `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` |
| `radiumhospitalet` | Radiumhospitalet | 1932 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `tvergastein` | Tvergastein | 1937 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `universitetet_i_oslo_blindern` | Universitetet i Oslo, Blindern | 1937 | `data/places/vitenskap/oslo/places_vitenskap.json` |
| `universitetets_gamle_kjemi` | Universitetets gamle kjemibygning | 1865 | `data/places/vitenskap/oslo/places_vitenskap.json` |

## Kort vurdering av svakest dekkede kategorier

- **musikk**: 7.7% coverage (1/13). Dette er en av de svakeste kategoriene målt etter prosentvis dekning.
- **by**: 14.0% coverage (12/86). Dette er en av de svakeste kategoriene målt etter prosentvis dekning.
- **naeringsliv**: 17.1% coverage (7/41). Dette er en av de svakeste kategoriene målt etter prosentvis dekning.
- **litteratur**: 19.4% coverage (6/31). Dette er en av de svakeste kategoriene målt etter prosentvis dekning.
- **subkultur**: 21.7% coverage (5/23). Dette er en av de svakeste kategoriene målt etter prosentvis dekning.
- **sport**: 22.4% coverage (11/49). Dette er en av de svakeste kategoriene målt etter prosentvis dekning.

De svakeste kategoriene er særlig `musikk`, `by`, `naeringsliv`, `litteratur`, `subkultur` og `sport`. `musikk` har lavest prosentvis dekning, mens `by`, `natur`, `historie`, `sport` og `naeringsliv` har størst absolutte restanser.

## Anbefalt neste storybatch (analyse, ikke dataendring)

Neste batch bør prioritere aktive place-ID-er i kategorier med lav coverage. Forslaget under oppretter ingen story-filer; det er kun en analysebasert arbeidsliste.

### musikk

| Prioritert aktiv place_id | Navn | Begrunnelse |
|---|---|---|
| `blaa` | Blå | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_clube_de_fado` | Clube de Fado | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_coliseu_dos_recreios` | Coliseu dos Recreios | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_hot_clube_de_portugal` | Hot Clube de Portugal | Lav kategori-coverage og aktiv place uten story. |
| `john_dee` | John Dee | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_mouraria_fado` | Mouraria / fado | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_museu_do_fado` | Museu do Fado | Lav kategori-coverage og aktiv place uten story. |
| `rockefeller` | Rockefeller Music Hall | Lav kategori-coverage og aktiv place uten story. |

### by

| Prioritert aktiv place_id | Navn | Begrunnelse |
|---|---|---|
| `lisbon_ajuda` | Ajuda | Lav kategori-coverage og aktiv place uten story. |
| `aker_brygge` | Aker Brygge | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_alcantara` | Alcântara | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_alfama` | Alfama | Lav kategori-coverage og aktiv place uten story. |
| `alnabru_jernbane_og_logistikk` | Alnabru – jernbane og logistikk | Lav kategori-coverage og aktiv place uten story. |
| `ankerbrua` | Ankerbrua | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_avenida_da_liberdade` | Avenida da Liberdade | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_baixa_pombalina` | Baixa Pombalina | Lav kategori-coverage og aktiv place uten story. |
| `bankplassen` | Bankplassen | Lav kategori-coverage og aktiv place uten story. |
| `beierbrua` | Beierbrua | Lav kategori-coverage og aktiv place uten story. |

### naeringsliv

| Prioritert aktiv place_id | Navn | Begrunnelse |
|---|---|---|
| `akerselva_industri` | Akerselva industriområde | Lav kategori-coverage og aktiv place uten story. |
| `akershus_energi` | Akershus Energi Varme | Lav kategori-coverage og aktiv place uten story. |
| `akershus_kaier` | Akershuskaiene | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_armazens_do_chiado` | Armazéns do Chiado | Lav kategori-coverage og aktiv place uten story. |
| `akershus_slott_bakeriet` | Bakeriet ved Akershus | Lav kategori-coverage og aktiv place uten story. |
| `bryn_industriomrade` | Bryn industriområde | Lav kategori-coverage og aktiv place uten story. |
| `oslo_kornmagasin` | Christiania kornmagasin | Lav kategori-coverage og aktiv place uten story. |
| `christiania_seildugsfabrik` | Christiania Seildugsfabrik | Lav kategori-coverage og aktiv place uten story. |

### litteratur

| Prioritert aktiv place_id | Navn | Begrunnelse |
|---|---|---|
| `lisbon_a_brasileira` | A Brasileira / Fernando Pessoa | Lav kategori-coverage og aktiv place uten story. |
| `alexander_kiellands_plass` | Alexander Kiellands plass | Lav kategori-coverage og aktiv place uten story. |
| `alf_proysen_statue_nittedal` | Alf Prøysen-statuen – Nittedal kulturhus | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_biblioteca_nacional_de_portugal` | Biblioteca Nacional de Portugal | Lav kategori-coverage og aktiv place uten story. |
| `camilla_collett_statue` | Camilla Collett-statuen | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_casa_dos_bicos` | Casa dos Bicos / Fundação José Saramago | Lav kategori-coverage og aktiv place uten story. |

### subkultur

| Prioritert aktiv place_id | Navn | Begrunnelse |
|---|---|---|
| `lisbon_anjos70` | Anjos70 | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_bairro_alto` | Bairro Alto | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_crew_hassan` | Crew Hassan | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_desterro` | Desterro | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_fabrica_braco_de_prata` | Fábrica Braço de Prata | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_galeria_ze_dos_bois` | Galeria Zé dos Bois (ZDB) | Lav kategori-coverage og aktiv place uten story. |

### sport

| Prioritert aktiv place_id | Navn | Begrunnelse |
|---|---|---|
| `lekeplass_birkelunden` | Birkelunden lekeplass | Lav kategori-coverage og aktiv place uten story. |
| `lekeplass_botsparken` | Botsparken lekeplass | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_estadio_da_luz` | Estádio da Luz | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_complexo_desportivo_do_restelo` | Estádio do Restelo (Complexo Desportivo do Restelo) | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_estadio_jose_alvalade` | Estádio José Alvalade | Lav kategori-coverage og aktiv place uten story. |
| `lisbon_estadio_universitario` | Estádio Universitário de Lisboa | Lav kategori-coverage og aktiv place uten story. |
| `finnskogbanen` | Finnskogbanen | Lav kategori-coverage og aktiv place uten story. |
| `lekeplass_frognerborgen` | Frognerborgen | Lav kategori-coverage og aktiv place uten story. |
