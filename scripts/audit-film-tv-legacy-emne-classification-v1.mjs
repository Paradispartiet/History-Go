#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  fagkart: 'data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json',
  emner: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  completeness: 'reports/fagverk/film-tv-curriculum-completeness-v1.json',
  report: 'reports/fagverk/film-tv-legacy-emne-classification-v1.json'
});

const DOMAINS = Object.freeze({
  A: 'audiovisuell_form_stil_analyse',
  F: 'fortelling_sjanger_serialitet_format',
  H: 'film_tv_historie_historiografi',
  D: 'dokumentar_virkelighetsformer_etikk',
  S: 'samfunn_representasjon_identitet_makt',
  P: 'produksjon_arbeid_teknologi_praksis',
  I: 'industri_institusjoner_politikk_distribusjon',
  V: 'visning_publikum_resepsjon_deltakelse',
  L: 'sted_location_skjermgeografi',
  R: 'arkiv_kulturarv_minne_stjerner'
});

const [A, F, H, D, S, P, I, V, L, R] = Object.values(DOMAINS);
const d = (action, targetDomainIds, successorConceptIds, rationale) => Object.freeze({
  action,
  target_domain_ids: Array.isArray(targetDomainIds) ? targetDomainIds : [targetDomainIds],
  successor_concept_ids: Array.isArray(successorConceptIds) ? successorConceptIds : [successorConceptIds],
  rationale
});

// Every legacy ID is deliberately listed. This is a classification plan, not a
// title-derived fallback: a new or renamed legacy item must fail the audit.
const DECISIONS = Object.freeze({
  em_film_tv_kino_fellesrom: d('keep', V, 'kino_som_kollektiv_visningssituasjon', 'Kinoens samtidige, kollektive visningssituasjon er et selvstendig resepsjonsproblem.'),
  em_film_tv_publikumsopplevelse: d('keep', V, 'audiovisuell_publikumsopplevelse', 'Publikums sanselige og sosiale erfaring kan undersøkes uten å reduseres til besøkstall.'),
  em_film_tv_cinematek_filmarv: d('move', R, 'cinematek_programmering_og_filmarv', 'Cinemateket forvalter og aktualiserer filmarv; institusjonen er mer enn et ordinært visningsrom.'),
  em_film_tv_filmhistorisk_formidling: d('split', [H, R], ['filmhistorisk_kunnskapsformidling', 'kulturarv_programmering'], 'Historisk forklaring og kulturarvprogrammering har ulike kilder, metoder og sannhetskrav.'),
  em_film_tv_filmfestival_premiere: d('keep', V, 'festival_premiere_og_hendelsesvisning', 'Festival og premiere former verkets første offentligheter, sirkulasjon og resepsjon.'),
  em_film_tv_offentlig_filmbegivenhet: d('merge', V, 'festival_premiere_og_hendelsesvisning', 'Begrepet er en videre, mindre presis variant av festival-, premiere- og hendelsesvisning.'),
  em_film_tv_filmklubb_nisje: d('keep', V, 'filmklubb_og_nisjeoffentlighet', 'Filmklubber organiserer varige nisjeoffentligheter gjennom utvalg, samtale og medlemskap.'),
  em_film_tv_kuratering_publikum: d('keep', V, 'kuratering_og_publikumsdannelse', 'Kuratering former publikums tilgang og fortolkning og er ikke identisk med distribusjon.'),
  em_film_tv_tv_ritualer: d('keep', V, 'tv_ritualer_og_samtidighet', 'TV-ritualer forklarer tidsbundet fellesskap rundt sendeskjema, direktesending og gjentakelse.'),
  em_film_tv_seervaner: d('keep', V, 'seervaner_og_mediebruk', 'Seervaner krever egne bruks- og publikumsmetoder på tvers av lineær-TV og strømmetjenester.'),
  em_film_tv_stromming_fragmentering: d('split', [I, V], ['strommedistribusjon_og_marked', 'fragmenterte_publikum'], 'Plattformenes markedslogikk og publikums fragmenterte bruk er to kausalt koblede, men ulike spørsmål.'),
  em_film_tv_plattformpublikum: d('keep', V, 'plattformpublikum_og_bruksspor', 'Plattformpublikum kan studeres gjennom bruk, anbefalinger og deltakelse uten å gjøre markedet til eneste forklaring.'),
  em_film_tv_publikumsminne: d('move', R, 'publikumsminne_og_audiovisuell_erindring', 'Publikums erindring handler om hvordan audiovisuelle erfaringer lagres, fortelles og omformes over tid.'),
  em_film_tv_kollektiv_filmhukommelse: d('merge', R, 'publikumsminne_og_audiovisuell_erindring', 'Kollektiv filmhukommelse er en skala av publikumsminne, ikke et klart separat emne.'),
  em_film_tv_distribusjon_tilgang: d('move', I, 'distribusjon_tilgang_og_tilgjengelighet', 'Distribusjonsledd, vinduer og tilgjengelighet styrer hvem som faktisk kan møte et verk.'),
  em_film_tv_visningspolitikk: d('move', I, 'visningspolitikk_og_tilgangsstyring', 'Politiske og institusjonelle regler for visning må skilles fra publikums faktiske resepsjon.'),
  em_film_tv_kinoarkitektur: d('keep', V, 'kinoarkitektur_og_visningsbetingelser', 'Salens arkitektur organiserer syn, lyd, kropp og sosialitet i visningssituasjonen.'),
  em_film_tv_visningsrom_estetikk: d('split', [A, V], ['romlig_audiovisuell_estetikk', 'visningsrom_og_publikumsbetingelser'], 'Romlig estetikk i verket og estetiske betingelser i salen må kunne analyseres hver for seg.'),
  em_film_tv_publikumsdata: d('keep', V, 'publikumsdata_metoder_og_makt', 'Publikumsdata krever metodekritikk om måling, representativitet, personvern og institusjonell bruk.'),
  em_film_tv_besokstall: d('merge', V, 'publikumsdata_metoder_og_makt', 'Besøkstall er én datakilde i publikumsanalyse og kan ikke bære et eget fagområde alene.'),

  em_film_tv_studio_produksjonsrom: d('keep', P, 'studio_som_produksjonsmiljo', 'Studioet organiserer materiell kontroll, arbeidsdeling og teknologiske muligheter i produksjonen.'),
  em_film_tv_filmproduksjon: d('split', [P, I], ['audiovisuell_produksjonsprosess', 'produksjonssystem_og_finansiering'], 'Filmproduksjon er for bredt og må deles mellom kreativ arbeidsprosess og industrielt produksjonssystem.'),
  em_film_tv_kamera_bildearbeid: d('keep', P, 'kameraarbeid_og_bildepraksis', 'Kameraarbeid er en konkret skapende og teknisk praksis med valg om optikk, bevegelse og eksponering.'),
  em_film_tv_fotografi_film: d('move', A, 'filmfotografi_og_bildeestetikk', 'Filmfotografi må også analyseres som stil og meningsproduksjon, ikke bare som yrkespraksis.'),
  em_film_tv_lys_lyd: d('split', [A, P], ['lys_og_fargeanalyse', 'lyd_og_lyddesign', 'lys_lyd_produksjonspraksis'], 'Lys og lyd er ulike uttrykksdimensjoner, samtidig som produksjonspraksisen krever en egen kobling.'),
  em_film_tv_audiovisuell_form: d('move', A, 'audiovisuell_form_og_stil', 'Audiovisuell form er analysefagets overordnede objekt og må ikke eies av utstyrs- eller produksjonslogikk.'),
  em_film_tv_klipp_montasje: d('move', A, 'klipp_montasje_og_relasjonell_mening', 'Klipp og montasje organiserer tid, rom og relasjoner og er en kjerne i nærlesning av verk.'),
  em_film_tv_filmrytme: d('merge', A, 'klipp_montasje_og_relasjonell_mening', 'Filmrytme er en analytisk dimensjon ved blant annet klipp, lyd og bevegelse, ikke et isolert produksjonsledd.'),
  em_film_tv_manus_dramaturgi: d('move', F, 'manus_dramaturgi_og_scenisk_organisering', 'Manus og dramaturgi organiserer hendelser og sceneforløp og hører til fortellingsanalysen.'),
  em_film_tv_fortellingsstruktur: d('keep', F, 'fortellingsstruktur_og_narrasjon', 'Fortellingsstruktur har et selvstendig begrepsapparat for tid, perspektiv, kausalitet og informasjon.'),
  em_film_tv_produksjonsteam: d('keep', P, 'produksjonsteam_roller_og_samarbeid', 'Produksjonsteamet gjør arbeidsdeling, koordinering og skapende autoritet empirisk undersøkbart.'),
  em_film_tv_kollektivt_filmwerk: d('merge', P, 'produksjonsteam_roller_og_samarbeid', 'Kollektivt filmverk beskriver resultatet av samarbeid, men dupliserer team- og autoritetsproblemet.'),
  em_film_tv_produsent_finansiering: d('split', [P, I], ['produsentrolle_og_beslutninger', 'finansiering_og_produksjonssystem'], 'Produsentens skapende styring og finansieringens institusjonelle vilkår trenger ulike analyser.'),
  em_film_tv_filmokonomi: d('move', I, 'film_tv_okonomi_og_forretningsmodeller', 'Økonomi forklarer kapital, risiko, inntektsstrømmer og markedsstruktur på industrinivå.'),
  em_film_tv_postproduksjon: d('keep', P, 'postproduksjon_arbeidsflyt_og_beslutninger', 'Postproduksjon samler særskilte arbeidsflyter og skapende beslutninger etter opptak.'),
  em_film_tv_digital_etterarbeid: d('merge', P, 'postproduksjon_arbeidsflyt_og_beslutninger', 'Digitalt etterarbeid er dagens dominerende del av postproduksjon og trenger ikke en parallell emnetittel.'),
  em_film_tv_tv_hus_redaksjon: d('split', [P, I], ['tv_redaksjon_og_produksjonspraksis', 'kringkastingsorganisasjon'], 'Redaksjonell produksjonspraksis og TV-huset som institusjon har forskjellige aktører og styringsnivåer.'),
  em_film_tv_kringkastingsproduksjon: d('keep', P, 'kringkastingsproduksjon_og_direkteformat', 'Kringkastingsproduksjon har egne tidskrav, produksjonskjeder og direkteformater.'),
  em_film_tv_filmarbeidsliv: d('keep', P, 'audiovisuelt_arbeidsliv_og_vilkar', 'Arbeidsvilkår, fagorganisering, prosjektarbeid og ulikhet er et selvstendig produksjonsfelt.'),
  em_film_tv_usynlig_filmproduksjon: d('merge', P, 'audiovisuelt_arbeidsliv_og_vilkar', 'Usynlig arbeid er et viktig perspektiv innen arbeidsliv og kreditering, men ikke en stabil separat kategori.'),

  em_film_tv_location_filmsted: d('keep', L, 'location_valg_og_filmsted', 'Locationvalg kobler fortelling, produksjon og faktisk sted gjennom dokumenterbare beslutninger.'),
  em_film_tv_innspillingsspor: d('keep', L, 'innspillingsspor_og_stedlig_endring', 'Fysiske og sosiale spor etter innspilling gjør produksjonens stedlige virkninger undersøkelige.'),
  em_film_tv_byen_som_bilde: d('keep', L, 'byen_som_audiovisuelt_bilde', 'Byen som bilde undersøker hvordan urban form velges, rammes inn og gjøres lesbar.'),
  em_film_tv_urban_filmrepresentasjon: d('split', [L, S], ['urban_skjermgeografi', 'byrepresentasjon_og_makt'], 'Urban geografi og representasjonens makt over identitet og synlighet må ha hver sin kontroll.'),
  em_film_tv_gate_kamera: d('keep', L, 'gate_kamera_og_offentlig_rom', 'Kameraarbeid i gater berører bevegelse, kontroll, tilfeldighet og bruk av offentlig rom.'),
  em_film_tv_hverdagsfilm: d('retire', [D, H], ['hverdagsdokumentasjon_og_amatorkultur'], 'Tittelen er for vag; relevant stoff bevares som dokumentarisk hverdagsregistrering og historisk amatørkultur.'),
  em_film_tv_leilighet_interior: d('keep', L, 'interior_bolig_og_skjermrom', 'Boliginteriør organiserer kropp, klasse, intimitet og produksjonsbegrensninger i skjermrommet.'),
  em_film_tv_intimrom_film: d('merge', L, 'interior_bolig_og_skjermrom', 'Intimrom er en fortolkende dimensjon ved interiør og bolig, ikke en stabil parallell stedstype.'),
  em_film_tv_landskap_stemning: d('keep', L, 'landskap_stemning_og_stedsetikk', 'Landskap skaper stemning, men reiser også spørsmål om stedskunnskap, inngrep og miljøetikk.'),
  em_film_tv_filmisk_atmosfare: d('move', A, 'audiovisuell_atmosfare', 'Atmosfære produseres på tvers av bilde, lyd, rytme og rom og krever formanalytisk eierskap.'),
  em_film_tv_sted_identitet: d('keep', L, 'sted_identitet_og_tilhorighet', 'Stedsidentitet viser hvordan audiovisuelle verk former og forhandles av lokale tilhørigheter.'),
  em_film_tv_filmisk_tilhorighet: d('merge', L, 'sted_identitet_og_tilhorighet', 'Filmisk tilhørighet er virkningen som allerede undersøkes gjennom sted, identitet og publikum.'),
  em_film_tv_ikonisk_filmsted: d('keep', L, 'ikonisk_filmsted_og_sirkulasjon', 'Et filmsted blir ikonisk gjennom gjentatt framstilling, distribusjon, resepsjon og fysisk gjenkjennelse.'),
  em_film_tv_publikumsminne_sted: d('split', [L, R], ['stedlig_skjermminne', 'publikumsminne_og_audiovisuell_erindring'], 'Stedets medierte minne og publikums erindringspraksis overlapper, men har ulike analyseenheter.'),
  em_film_tv_dokumentarisk_sted: d('move', D, 'dokumentarisk_sted_og_evidens', 'Dokumentariske steder brukes som evidens og må vurderes mot utsnitt, iscenesettelse og situert kunnskap.'),
  em_film_tv_virkelighetsbilde: d('move', D, 'virkelighetsbilde_og_evidenspastand', 'Et virkelighetsbilde fremsetter sannhets- og evidenspåstander som krever dokumentarteoretisk prøving.'),
  em_film_tv_filmturisme: d('keep', L, 'filmturisme_og_lokale_virkninger', 'Filmturisme kobler skjermbilder til mobilitet, økonomi, belastning og lokal fortolkning.'),
  em_film_tv_filmgeografi: d('keep', L, 'film_tv_geografi_og_romlig_sirkulasjon', 'Filmgeografi analyserer romlige mønstre i produksjon, representasjon, sirkulasjon og resepsjon.'),
  em_film_tv_sted_som_myte: d('keep', L, 'sted_som_audiovisuell_myte', 'Steder mytologiseres gjennom gjentatte motiver og fortellinger som kan sammenholdes med faktisk sted.'),
  em_film_tv_audiovisuell_mytologi: d('merge', L, 'sted_som_audiovisuell_myte', 'I denne legacy-konteksten er audiovisuell mytologi den generelle mekanismen bak sted som myte.'),

  em_film_tv_sjanger_kontrakt: d('keep', F, 'sjanger_konvensjon_og_kontrakt', 'Sjanger organiserer formvalg og forventninger som historisk foranderlige konvensjoner.'),
  em_film_tv_publikumsforventning: d('move', V, 'forventningshorisont_og_resepsjon', 'Publikums forventningshorisont må undersøkes empirisk og historisk, ikke avledes direkte fra sjanger.'),
  em_film_tv_serieformat: d('keep', F, 'serieformat_og_serialitet', 'Serieformatet organiserer gjentakelse, utvikling, episodegrenser og langvarig fortelling.'),
  em_film_tv_sesongstruktur: d('keep', F, 'sesongstruktur_og_fortellingsbue', 'Sesongstruktur har egne mellomnivåer mellom episode og hel serie og bør analyseres eksplisitt.'),
  em_film_tv_dokumentar_sannhet: d('move', D, 'dokumentar_sannhet_og_evidens', 'Dokumentarens sannhetskrav krever kontroll av indeksikalitet, argument, kilder og framstilling.'),
  em_film_tv_dokumentarisk_etikk: d('move', D, 'dokumentar_etikk_og_deltakeransvar', 'Dokumentaretikk gjelder samtykke, makt, konsekvens, sårbarhet og ansvar overfor deltakere.'),
  em_film_tv_fiksjon_realisme: d('keep', F, 'fiksjon_realisme_og_verdensbygging', 'Realisme er en historisk og sjangermessig strategi for å gjøre fiksjonsverdener troverdige.'),
  em_film_tv_filmisk_troverdighet: d('merge', F, 'fiksjon_realisme_og_verdensbygging', 'Troverdighet er et vurderingsproblem innen realisme og verdensbygging, ikke en parallell hovedkategori.'),
  em_film_tv_reality_observasjon: d('move', D, 'reality_observasjon_og_formatmakt', 'Reality kombinerer observasjon med formatregler, casting, produksjonsmakt og redigering.'),
  em_film_tv_iscenesatt_virkelighet: d('keep', D, 'iscenesettelse_og_virkelighetskrav', 'Iscenesettelse må vurderes selvstendig fordi den kan finnes i dokumentar, reality og nyhetsbilder.'),
  em_film_tv_nyhetsbilde_tv: d('move', D, 'tv_nyhetsbilde_og_evidens', 'TV-nyhetsbildet fremsetter samtidige evidenspåstander gjennom utvalg, direktehet og redigering.'),
  em_film_tv_kringkastet_samtid: d('split', [D, H, S], ['direktebilde_og_evidens', 'tv_samtidighet_historie', 'kringkastet_offentlighet'], 'Kringkastet samtid rommer bildeevidens, mediehistorisk samtidighet og offentlighetens tidsorganisering.'),
  em_film_tv_karakter_rollefigur: d('keep', F, 'karakter_rollefigur_og_fortellingsfunksjon', 'Rollefigurer organiserer handling, perspektiv, identifikasjon og konflikt i fortellingen.'),
  em_film_tv_stjerne_og_rolle: d('split', [F, R], ['rollefigur_og_fremstilling', 'stjernepersona_og_rolleforhandling'], 'Rollefigurens funksjon og stjernens offentlige persona er analytisk ulike selv når samme skuespiller binder dem sammen.'),
  em_film_tv_cliffhanger_rytme: d('split', [F, A], ['cliffhanger_og_informasjonsstans', 'audiovisuell_rytme'], 'Cliffhanger er en narrativ informasjonsstrategi, mens rytme oppstår i flere audiovisuelle lag.'),
  em_film_tv_episodisk_dramaturgi: d('keep', F, 'episodisk_dramaturgi_og_fremdrift', 'Episodisk dramaturgi organiserer lokal avslutning og langsiktig framdrift i serialiserte verk.'),
  em_film_tv_humor_sitcom: d('keep', F, 'sitcom_humor_og_format', 'Sitcom kobler komiske mekanismer til faste rom, rolleensembler, episodeform og produksjonsformat.'),
  em_film_tv_komisk_format: d('merge', F, 'sitcom_humor_og_format', 'Komisk format er for generelt og dekkes bedre av konkrete komiske sjangre og mekanismer.'),
  em_film_tv_krim_spenning: d('keep', F, 'krim_sjanger_og_spenningsstruktur', 'Krim organiserer kunnskapsfordeling, etterforskning og moralsk orden gjennom sjangerkonvensjoner.'),
  em_film_tv_suspense: d('move', A, 'suspense_som_audiovisuell_teknikk', 'Suspense er en formell teknikk for tidsstyring og kunnskapsforskjell på tvers av sjangre.'),

  em_film_tv_kringkasting_institusjon: d('keep', I, 'kringkasting_institusjon_og_allmennoppdrag', 'Kringkasting organiseres gjennom institusjoner, infrastruktur, mandat og regulering.'),
  em_film_tv_tv_offentlighet: d('move', S, 'tv_offentlighet_og_demokratisk_deltakelse', 'TV-offentlighet gjelder synlighet, felles dagsorden og demokratisk deltakelse, ikke bare organisasjon.'),
  em_film_tv_filmstotte_kulturpolitikk: d('keep', I, 'filmstotte_og_kulturpolitikk', 'Filmstøtte gjør prioriteringer, armlengdesprinsipp og kulturpolitiske mål empirisk etterprøvbare.'),
  em_film_tv_nasjonal_filmproduksjon: d('split', [H, I], ['nasjonal_film_tv_historie', 'nasjonalt_produksjonssystem'], 'Nasjonale verkforløp og dagens produksjonssystem trenger henholdsvis historisk og institusjonell analyse.'),
  em_film_tv_sensur_regulering: d('keep', I, 'sensur_regulering_og_ytringsrom', 'Sensur og regulering former produksjon, distribusjon og tilgang gjennom formelle og uformelle inngrep.'),
  em_film_tv_aldersgrense_makt: d('keep', I, 'aldersgrenser_klassifisering_og_makt', 'Aldersgrenser viser hvordan skade, vern, tilgang og statlig eller bransjebasert makt klassifiseres.'),
  em_film_tv_film_tv_arkiv: d('move', R, 'film_tv_arkiv_institusjoner_og_praksis', 'Audiovisuelle arkiv har egne institusjoner, ordningsprinsipper, materialiteter og tilgangsvalg.'),
  em_film_tv_audiovisuell_bevaring: d('move', R, 'audiovisuell_bevaring_og_restaurering', 'Bevaring og restaurering krever tekniske, etiske og historiografiske beslutninger over tid.'),
  em_film_tv_plattformmakt: d('keep', I, 'plattformmakt_og_algoritmisk_portvakt', 'Plattformer styrer synlighet, data, vilkår og adgang gjennom tekniske og kontraktsmessige portvakter.'),
  em_film_tv_strommemarked: d('keep', I, 'strommemarked_og_forretningsmodeller', 'Strømmemarkedet har egne abonnements-, rettighets-, katalog- og konkurranselogikker.'),
  em_film_tv_rettigheter_distribusjon: d('keep', I, 'rettigheter_vinduer_og_distribusjon', 'Rettigheter og vinduer bestemmer territorium, tid, plattform og økonomisk sirkulasjon.'),
  em_film_tv_lisens_og_tilgang: d('merge', I, 'rettigheter_vinduer_og_distribusjon', 'Lisens og tilgang er konkrete mekanismer i rettighets- og distribusjonsregimet.'),
  em_film_tv_film_tv_offentlighet: d('move', S, 'film_tv_offentlighet_og_debatt', 'Film og TV skaper offentlighet gjennom verk, hendelser, kritikk, kontrovers og samtale.'),
  em_film_tv_audiovisuell_debatt: d('merge', S, 'film_tv_offentlighet_og_debatt', 'Audiovisuell debatt er en praksis innen den bredere film- og TV-offentligheten.'),
  em_film_tv_representasjon_makt: d('keep', S, 'representasjon_identitet_og_makt', 'Representasjon fordeler taleposisjoner, gjenkjennelse og stereotypisering og krever maktanalyse.'),
  em_film_tv_synlighet_og_frasortering: d('keep', S, 'synlighet_fravaer_og_frasortering', 'Fravær og frasortering kan måles i casting, narrativ betydning, arkiv og distribusjon.'),
  em_film_tv_film_tv_kommersialisering: d('keep', I, 'kommersialisering_og_verdikjeder', 'Kommersialisering kobler finansiering, produktintegrasjon, eierskap og publikumsverdi.'),
  em_film_tv_publikumsmarked: d('split', [I, V], ['publikum_som_marked', 'publikum_som_sosiale_brukere'], 'Bransjens markedssegment og faktiske publikums praksiser er forskjellige konstruksjoner.'),
  em_film_tv_nasjonal_fortelling: d('move', S, 'nasjon_fortelling_og_forestilt_fellesskap', 'Nasjonale fortellinger former tilhørighet og eksklusjon gjennom verk og institusjonell prioritering.'),
  em_film_tv_film_tv_identitet: d('split', [S, V], ['identitetsrepresentasjon_og_makt', 'publikums_identitetsarbeid'], 'Identitet må deles mellom representasjon i verk og publikums bruk av verk i eget identitetsarbeid.'),

  em_film_tv_filmstjerne_myte: d('keep', R, 'filmstjerne_persona_og_myte', 'Filmstjernens persona skapes på tvers av roller, presse, bilder, industri og publikumsbruk.'),
  em_film_tv_stjerneproduksjon: d('keep', R, 'stjerneproduksjon_og_industrielt_apparat', 'Stjerneproduksjon undersøker institusjonene og praksisene som konstruerer og vedlikeholder persona.'),
  em_film_tv_rollefigur_sitat: d('move', R, 'rollefigur_sitat_og_sirkulasjon', 'Sitat og rollefigur løsriver seg fra verket gjennom gjentakelse, imitasjon og mediesirkulasjon.'),
  em_film_tv_kollektiv_referanse: d('keep', R, 'kollektiv_audiovisuell_referanse', 'Kollektive referanser viser hvordan bestemte bilder, replikker og figurer blir sosialt tilgjengelige.'),
  em_film_tv_tv_minne: d('keep', R, 'tv_minne_og_mediert_erindring', 'TV-minne kobler programhistorie, sendetid, husholdning, arkiv og senere gjenbruk.'),
  em_film_tv_felles_tv_erfaring: d('merge', R, 'tv_minne_og_mediert_erindring', 'Felles TV-erfaring er en sosial kilde til TV-minne, men ikke et stabilt separat emne.'),
  em_film_tv_filmarv_kanon: d('keep', R, 'filmarv_kanon_og_verdivalg', 'Filmarv og kanon synliggjør hvilke verk som bevares, undervises, vises og tillegges verdi.'),
  em_film_tv_kanonisering: d('keep', R, 'kanonisering_prosesser_og_makt', 'Kanonisering er prosessen som gjør institusjoner, kritikere, festivaler og arkiv til portvakter.'),
  em_film_tv_nostalgi_gjentakelse: d('split', [R, V], ['nostalgi_og_historiebruk', 'gjentakelse_og_resepsjon'], 'Nostalgi er en historiebruk, mens gjentakelse også er en distribusjons- og resepsjonspraksis.'),
  em_film_tv_reprise_kultur: d('keep', R, 'reprise_ombruk_og_kulturell_varighet', 'Repriser og ombruk gjør kanon, generasjonsminne og katalogpolitikk empirisk synlig.'),
  em_film_tv_arkivbilder: d('keep', R, 'arkivbilder_kontekst_og_ombruk', 'Arkivbilder krever proveniens, kontekst og analyse av ny betydning når de gjenbrukes.'),
  em_film_tv_audiovisuelt_minne: d('merge', R, 'tv_minne_og_mediert_erindring', 'Audiovisuelt minne er et overbegrep som dekkes mer presist av publikums-, TV- og arkivminne.'),
  em_film_tv_fans_deltakelse: d('move', V, 'fans_deltakelse_og_fellesskap', 'Fans produserer fortolkning, fellesskap, arbeid og sirkulasjon og må studeres som deltakende publikum.'),
  em_film_tv_deltakende_seerkultur: d('merge', V, 'fans_deltakelse_og_fellesskap', 'Deltakende seerkultur er den bredere praksisen som fanstudier allerede konkretiserer.'),
  em_film_tv_kultfilm_resepsjon: d('split', [R, V], ['kultstatus_og_kulturarv', 'kultfilm_resepsjon_og_fellesskap'], 'Kultstatusens historiske varighet og samtidige resepsjonsfellesskap krever ulike belegg.'),
  em_film_tv_nisjeminne: d('merge', R, 'kultstatus_og_kulturarv', 'Nisjeminne er en mulig virkning av kultstatus og marginal kulturarv, ikke et presist eget objekt.'),
  em_film_tv_festivalminne: d('keep', R, 'festivalminne_programhistorie_og_erindring', 'Festivalminne forbinder programarkiv, sted, hendelse og deltakeres senere erindring.'),
  em_film_tv_filmoffentlighet_minne: d('merge', R, 'festivalminne_programhistorie_og_erindring', 'Filmoffentlighetens minne inngår i dokumenterbare program- og hendelseshistorier.'),
  em_film_tv_tapte_bilder: d('keep', R, 'tapte_bilder_fravaer_og_rekonstruksjon', 'Tapte bilder gjør fravær, materialtap, rekonstruksjon og arkivets grenser til faglige problemer.'),
  em_film_tv_glemt_film_tv_historie: d('move', H, 'glemte_forlop_og_historiografisk_revisjon', 'Glemte forløp krever historiografisk kildekritikk og revisjon av etablerte perioder og kanoner.')
});

const abs = (file) => path.join(ROOT, file);
const json = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function auditFilmTvLegacyEmneClassificationV1({ writeReport = false, checkReport = true } = {}) {
  const fagkart = json(PATHS.fagkart);
  const emner = json(PATHS.emner);
  const completeness = json(PATHS.completeness);
  const emneById = new Map(emner.map((row) => [row.emne_id, row]));
  const hookRows = fagkart.categories.flatMap((legacyDomain) =>
    legacyDomain.topic_hooks.flatMap((hook) => hook.emne_ids.map((emneId) => ({
      emne_id: emneId,
      legacy_domain_id: legacyDomain.id,
      legacy_domain_title: legacyDomain.title,
      legacy_hook_id: hook.id,
      legacy_hook_title: hook.title
    })))
  );
  const legacyIds = hookRows.map((row) => row.emne_id);
  const decisionIds = Object.keys(DECISIONS);
  const allowedActions = new Set(['keep', 'merge', 'move', 'split', 'retire']);
  const allowedDomains = new Set(completeness.proposed_domain_candidates.map((row) => row.id));

  assert(emner.length === 120 && hookRows.length === 120, 'Legacyinventaret må fortsatt inneholde 120 emner før migrasjon');
  assert(new Set(legacyIds).size === legacyIds.length, 'Et legacy-emne forekommer i flere hooks');
  assert(decisionIds.length === legacyIds.length, 'Klassifikasjonen må ha nøyaktig én beslutning per legacy-emne');
  assert(legacyIds.every((id) => DECISIONS[id]), 'Minst ett legacy-emne mangler eksplisitt beslutning');
  assert(decisionIds.every((id) => emneById.has(id)), 'Klassifikasjonen inneholder ukjent legacy-ID');

  const classifications = hookRows.map((row) => {
    const legacy = emneById.get(row.emne_id);
    const decision = DECISIONS[row.emne_id];
    assert(allowedActions.has(decision.action), `${row.emne_id} har ugyldig handling`);
    assert(decision.target_domain_ids.length > 0 && decision.target_domain_ids.every((id) => allowedDomains.has(id)), `${row.emne_id} har ugyldig målområde`);
    assert(decision.successor_concept_ids.length > 0, `${row.emne_id} mangler etterfølgerbegrep`);
    assert(decision.rationale.length >= 70, `${row.emne_id} har for kort faglig begrunnelse`);
    if (decision.action === 'split') assert(decision.successor_concept_ids.length >= 2, `${row.emne_id} er split uten flere etterfølgere`);
    return {
      ...row,
      legacy_title: legacy.title,
      action: decision.action,
      target_domain_ids: decision.target_domain_ids,
      successor_concept_ids: decision.successor_concept_ids,
      rationale: decision.rationale,
      boundary_note: `${legacy.title} eies av ${decision.target_domain_ids.join(' + ')}. Naboområder kan levere case og metoder, men overtar ikke denne begrunnelsen: ${decision.rationale}`,
      alias_required: true
    };
  });

  const actionCounts = Object.fromEntries([...allowedActions].map((action) => [action, classifications.filter((row) => row.action === action).length]));
  const targetDomainCounts = Object.fromEntries([...allowedDomains].map((domainId) => [domainId, classifications.filter((row) => row.target_domain_ids.includes(domainId)).length]));
  const report = {
    schema: 'history_go_film_tv_legacy_emne_classification_v1',
    version: '1.0.0',
    updated_at: '2026-08-11',
    status: 'all_legacy_emner_classified_gap_design_next',
    subject_id: 'film_tv',
    policy: {
      classification_is_migration_input_not_final_canonical_inventory: true,
      no_fixed_target_domain_or_emne_count: true,
      every_legacy_id_keeps_an_alias: true,
      chapter_production_remains_blocked: true
    },
    summary: {
      legacy_emne_count: classifications.length,
      classified_emne_count: classifications.length,
      action_counts: actionCounts,
      target_domain_reference_counts: targetDomainCounts,
      next_gate: 'identify_missing_relevant_emner_and_design_variable_inventory'
    },
    classifications
  };

  assert(Object.values(actionCounts).every((count) => count > 0), 'Alle fem migreringshandlinger skal være reelt brukt');
  assert(Object.values(targetDomainCounts).every((count) => count > 0), 'Alle begrunnede kandidatområder skal motta klassifisert stoff');
  if (writeReport) fs.writeFileSync(abs(PATHS.report), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(json(PATHS.report), report), `${PATHS.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvLegacyEmneClassificationV1({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Film & TV legacyklassifikasjon OK: ${report.summary.classified_emne_count}/${report.summary.legacy_emne_count} emner klassifisert; neste port er gapdesign.`);
  } catch (error) {
    console.error(`Film & TV legacyklassifikasjon FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
