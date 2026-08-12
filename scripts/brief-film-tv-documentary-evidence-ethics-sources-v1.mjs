#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_documentary_evidence_ethics_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-documentary-evidence-ethics-source-brief-v1-audit.json'
});
const UNIT_ID = 'dokumentar-evidens-og-etikk';
const INPUT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const SOURCE_BRIEF_GATE = 'documentary_evidence_ethics_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const REPRESENTATION_SOURCE_BRIEF_GATE = 'representation_position_counterimages_source_brief_complete_full_chapter_production';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const source = (id, publisher, title, url, type, role, location) => ({
  id, publisher, title, url, type, evidence_role: role, source_location: location,
  retrieval_status: 'verified_2026-08-12'
});

const SOURCES = Object.freeze([
  source('ftvde01-loc-nanook','Library of Congress / National Film Preservation Board','Nanook of the North','https://www.loc.gov/static/programs/national-film-preservation-board/documents/nanook2.pdf','national-film-registry-essay','institutional-object-analysis','The essay documents reenactment, staging, Inuit collaboration, observational practice and participant risk in the 1922 production.'),
  source('ftvde02-nfb-verite','National Film Board of Canada','Cinéma Vérité: Defining the Moment','https://www.nfb.ca/film/cinema_verite_defining_the_moment/','national-film-board-documentary-history','institutional-form-history','The programme and case list situate direct cinema and cinéma vérité in portable practice, observation and participation.'),
  source('ftvde03-bfi-essay','British Film Institute / Sight and Sound','The essay film','https://www.bfi.org.uk/sight-and-sound/features/essay-film','national-film-institute-criticism','documentary-form-analysis','The essay traces audiovisual argument, voice, montage, uncertainty and the porous fiction/non-fiction boundary through works including Sans Soleil and Handsworth Songs.'),
  source('ftvde04-bfi-sans-soleil','British Film Institute','Sans Soleil (1982)','https://www.bfi.org.uk/film/a9bab1d5-f6df-51d3-bdda-5e1beba14602/sans-soleil','national-film-institute-object-record','institutional-object-record','The catalogue record identifies personal reflection, narrated fictional letters, synthesized sound, travel images and historical comparison in Marker’s essay film.'),
  source('ftvde05-loc-collections','Library of Congress','Collections with Films, Videos','https://www.loc.gov/film-and-videos/collections/','national-library-collection-directory','institutional-archive-record','The directory exposes collection identity, date, creator and context for actuality, labour, leisure, civil-rights and home-movie records.'),
  source('ftvde06-eye-policy','Eye Filmmuseum','Collection Policy','https://www.eyefilm.nl/uploads/downloads/blocks/eye_collectionpolicy.pdf','national-film-archive-policy','archive-reuse-policy','The policy distinguishes collection, metadata, access, research and artistic reuse, including found-footage work with collection material.'),
  source('ftvde07-witness-ethics','WITNESS','Ethical Guidelines for Using Videos in Human Rights Reporting and Advocacy','https://www.witness.org/portfolio_page/ethical-guidelines-for-using-videos-in-human-rights-reporting-and-advocacy/','human-rights-video-guidance','participant-ethics-guidance','The guidance addresses consent, intended audience, safety, dignity, privacy, context, credit, graphic footage and minimising harm.'),
  source('ftvde08-witness-evidence','WITNESS','Video as Evidence Field Guide','https://vae.witness.org/video-as-evidence-field-guide/','human-rights-video-method','digital-evidence-guidance','The field guide treats filming, preservation, verification and ethical use as separate requirements for video to function as evidence.'),
  source('ftvde09-dawg-framework','Documentary Accountability Working Group','Framework for Values, Ethics, and Accountability in Nonfiction Filmmaking','https://www.docaccountability.org/framework','documentary-sector-framework','participant-accountability-framework','The framework locates accountability across story, participants, audience, funders and the production process rather than in a release form alone.'),
  source('ftvde10-cmsi-honest-truths','Center for Media and Social Impact, American University','Honest Truths: Documentary Filmmakers on Ethical Challenges in Their Work','https://cmsimpact.org/resource/honest-truths-documentary-filmmakers-on-ethical-challenges-in-their-work/','university-field-study','documentary-ethics-research','Interview research documents case-specific ethical decisions alongside shared principles such as avoiding harm, protecting vulnerable participants and honouring viewer trust.'),
  source('ftvde11-ofcom-reality','Ofcom','Protecting people taking part in reality shows','https://www.ofcom.org.uk/tv-radio-and-on-demand/broadcast-standards/protecting-people-taking-part-in-reality-shows','broadcast-regulator-guidance','regulatory-participant-care','The regulator requires due care where programme participation may expose people to significant harm, especially vulnerable or inexperienced participants.'),
  source('ftvde12-ofcom-under18','Ofcom','Section one: Protecting the under-eighteens','https://www.ofcom.org.uk/tv-radio-and-on-demand/broadcast-standards/section-one-protecting-under-eighteens','broadcast-code','regulatory-child-protection','Rules 1.28–1.29 require welfare and dignity safeguards for under-eighteens irrespective of consent and prohibit unjustified distress or anxiety.'),
  source('ftvde13-ohchr-berkeley','OHCHR / Human Rights Center, UC Berkeley','Berkeley Protocol on Digital Open Source Investigations','https://www.ohchr.org/en/publications/policy-and-methodological-publications/berkeley-protocol-digital-open-source','un-methodology','digital-evidence-protocol','The protocol separates collection, preservation, verification, analysis, security and reporting for digital open-source information.'),
  source('ftvde14-ap-visuals','Associated Press','Telling the Story','https://www.ap.org/about/news-values-and-principles/telling-the-story/','news-agency-standard','visual-news-standard','AP requires accurate visuals, restricts digital alteration and warns against generic imagery that could be mistaken for evidence of the reported event.'),
  source('ftvde15-reuters-standards','Reuters','Reuters Journalistic Standards','https://reutersagency.com/about/standards-values/','news-agency-standard','editorial-verification-standard','Reuters places accuracy, fairness, editorial accountability and transparency around generative AI within its journalistic standards.'),
  source('ftvde16-amnesty-saydnaya','Amnesty International / Forensic Architecture','Explore Saydnaya: Methodology','https://saydnaya.amnesty.org/en/methodology.html','human-rights-investigation-method','situated-testimony-reconstruction','The methodology documents survivor-controlled interviews, written accounts, satellite images, architectural and acoustic modelling, and explicit limits caused by the absence of photographs.'),
  source('ftvde17-usc-dit','USC Shoah Foundation','Dimensions in Testimony: FAQs','https://sfi.usc.edu/dit/faq','testimony-technology-method','testimony-integrity-record','The FAQ distinguishes pre-recorded answers from live presence and documents participant control, collaborative interviewing, unaltered responses and reviewed question matching.'),
  source('ftvde18-ushmm-shoah','United States Holocaust Memorial Museum','USC Shoah Foundation Testimonies','https://www.ushmm.org/collections/ask-a-research-question/tools-for-research/shoah-foundation','museum-testimony-collection','institutional-testimony-record','The collection record documents nearly 52,000 recorded interviews across survivor, witness, rescuer, liberator and trial-participant positions.'),
  source('ftvde19-dart-trauma','Dart Center for Journalism and Trauma','Interviewing in the aftermath of trauma','https://dartcenter.org/resources/interviewing-aftermath-trauma','journalism-trauma-guidance','trauma-informed-interview-guidance','The guidance requires advance explanation, participant choice, attentive listening, safe settings and calm responses instead of extracting a predetermined performance.'),
  source('ftvde20-loc-disneyland','Library of Congress','From the Film Registry: Disneyland Dream (1956)','https://blogs.loc.gov/now-see-hear/2021/07/from-the-film-registry-disneyland-dream-1956/','national-film-registry-home-movie-case','institutional-object-record','The object history separates a family travel film’s production, reversal-film materiality, later discovery and registry framing.'),
  source('ftvde21-nmaahc-home','Smithsonian National Museum of African American History and Culture','The Great Migration Home Movie Project','https://nmaahc.si.edu/explore/initiatives/great-migration-home-movie-project','national-museum-community-film-project','participatory-history-record','The project treats family films and community knowledge as evidence of African American everyday life, migration and memory.'),
  source('ftvde22-ap-ai','Associated Press','Standards around generative AI','https://www.ap.org/the-definitive-source/behind-the-news/standards-around-generative-ai/','news-agency-ai-standard','synthetic-image-standard','AP treats generative output as unvetted material, forbids adding or subtracting elements in news visuals and requires clear labelling when synthetic imagery is itself newsworthy.'),
  source('ftvde23-nfb-wall','National Film Board of Canada','The Wall','https://www.nfb.ca/film/mur/','national-film-board-object-record','animated-documentary-record','The record documents an animated feature following David Hare’s investigation of the separation wall and identifies voice, participants, animation and performance-capture roles.'),
  source('ftvde24-fa-mariupol','Forensic Architecture','A City Within a Building: The Mariupol Drama Theatre','https://forensic-architecture.org/investigation/a-city-within-a-building-the-mariupol-drama-theatre','research-agency-investigation','spatial-evidence-reconstruction','The investigation assembles situated testimony, spatial modelling and visual traces around a destroyed place while documenting attacks on both civilians and evidence.'),
  source('ftvde25-vvp','Norsk Presseforbund','Vær Varsom-plakaten','https://www.presse.no/vaer-varsom-plakaten','national-press-ethics-code','press-ethics-primary-record','The current Norwegian code connects source criticism, factual control, identification, privacy, vulnerable people, children, images and editorial responsibility.'),
  source('ftvde26-ushmm-theresienstadt','United States Holocaust Memorial Museum','Theresienstadt: A Documentary Film, 1944','https://perspectives.ushmm.org/item/theresienstadt-a-documentary-film-1944','museum-propaganda-film-analysis','institutional-object-record','The object record documents coercion, staging and deceptive documentary appearance in a film commissioned by Nazi authorities.'),
]);

const caseRow = (id, work, medium, years, source_ids, purpose) => ({ id, work, medium, years, source_ids, purpose });
const CASES = Object.freeze([
  caseRow('case-nanook','Nanook of the North','staged-collaborative-documentary','1922',['ftvde01-loc-nanook'],'Prøve hvordan staging, samarbeid, fare, location og etnografisk ramme endrer et dokumentarisk sannhetskrav.'),
  caseRow('case-cinema-verite','Cinéma Vérité: Defining the Moment','observational-participatory-documentary-history','1950s–1960s',['ftvde02-nfb-verite'],'Skille observasjon, deltakelse og bærbar produksjonspraksis.'),
  caseRow('case-sans-soleil','Sans Soleil','essay-film','1982',['ftvde03-bfi-essay','ftvde04-bfi-sans-soleil'],'Analysere subjektiv stemme, brevfigur, montasje, reisebilde og historisk argument.'),
  caseRow('case-handsworth-songs','Handsworth Songs','archive-essay-counter-documentary','1986',['ftvde03-bfi-essay'],'Vise hvordan laget og funnet materiale kan produsere kontekst uten å late som filmen gir én endelig forklaring.'),
  caseRow('case-loc-collections','Library of Congress film and video collections','archival-context-system','1893–',['ftvde05-loc-collections'],'Skille arkivobjekt, samling, metadata, katalogkontekst og senere ombruk.'),
  caseRow('case-eye-reuse','Eye collection reuse and residency practice','found-footage-reuse-policy','2017–',['ftvde06-eye-policy'],'Koble ombruk til dokumentert samlingsproveniens, tilgang og kunstnerisk bearbeiding.'),
  caseRow('case-witness-eyewitness','WITNESS eyewitness-video guidance','human-rights-eyewitness-video','2015–',['ftvde07-witness-ethics','ftvde08-witness-evidence'],'Vurdere samtykke, risiko, kontekst, kjede og verifikasjon før gjenbruk av andres opptak.'),
  caseRow('case-dawg','DAWG accountability framework','nonfiction-participant-accountability','2022–',['ftvde09-dawg-framework'],'Flytte etikk fra signert release til løpende relasjon, makt, virkning og ansvar.'),
  caseRow('case-honest-truths','Honest Truths field study','documentary-ethics-practice','2009',['ftvde10-cmsi-honest-truths'],'Sammenligne situerte etiske avveininger med delte minimumsprinsipper.'),
  caseRow('case-ofcom-reality','Ofcom reality participant protections','reality-format-duty-of-care','2020–2023',['ftvde11-ofcom-reality'],'Analysere hvordan casting, eksponering og redigert format utløser regulatorisk omsorgsansvar.'),
  caseRow('case-ofcom-children','Ofcom under-eighteen rules','child-participant-protection','2021–',['ftvde12-ofcom-under18'],'Vise at samtykke ikke opphever selvstendig vern av barns velferd og verdighet.'),
  caseRow('case-berkeley-protocol','Berkeley Protocol','digital-open-source-evidence','2020–2022',['ftvde13-ohchr-berkeley'],'Skille synlig innhold fra innsamling, proveniens, verifikasjon, analyse og rapportering.'),
  caseRow('case-ap-visuals','AP visual standards','television-news-image-standard','current',['ftvde14-ap-visuals'],'Teste nyhetsbildets direktehet mot utvalg, bildetekst, manipulasjon og kontekst.'),
  caseRow('case-reuters-standards','Reuters journalistic standards','television-news-verification','current',['ftvde15-reuters-standards'],'Koble visuell evidens til redaksjonell kontroll og eksplisitt ansvar.'),
  caseRow('case-saydnaya','Explore Saydnaya','testimony-spatial-reconstruction','2016',['ftvde16-amnesty-saydnaya'],'Vise hvordan fravær av bilder kan møtes med situert vitnesbyrd, rommodell og åpen metode uten å forveksle modellen med opptak.'),
  caseRow('case-dimensions-testimony','Dimensions in Testimony','interactive-recorded-testimony','2010–',['ftvde17-usc-dit'],'Skille innspilt svar, teknologisk matching og etisk framvisning fra et live møte med vitnet.'),
  caseRow('case-shoah-archive','USC Shoah Foundation testimony collection','video-testimony-archive','1994–2002',['ftvde18-ushmm-shoah'],'Behandle videovitnesbyrd som situerte livshistorier med intervjuer, opptak og samlingskontekst.'),
  caseRow('case-trauma-interview','Trauma-informed interview practice','trauma-testimony-method','2022',['ftvde19-dart-trauma'],'Gjøre formål, valg, tempo, trygghet og ettervirkning til deler av opptaksmetoden.'),
  caseRow('case-disneyland-dream','Disneyland Dream','family-home-movie','1956',['ftvde20-loc-disneyland'],'Skille hverdagsopptakets familieformål fra senere dokumentarisk og institusjonell betydning.'),
  caseRow('case-great-migration-home','Great Migration Home Movie Project','community-amateur-history','20th century',['ftvde21-nmaahc-home'],'Vise hvordan amatørbilder får historisk lesbarhet gjennom familie- og fellesskapskunnskap.'),
  caseRow('case-ap-synthetic','AP generative-AI visual rules','synthetic-news-image-standard','2023–',['ftvde22-ap-ai'],'Skille dokumentert nyhetsbilde, merket illustrasjon og falsk syntetisk virkelighetsframstilling.'),
  caseRow('case-the-wall','The Wall','animated-documentary','2017',['ftvde23-nfb-wall'],'Analysere animasjon, stemme, reise, intervju og performance capture som dokumentarisk rekonstruksjon.'),
  caseRow('case-mariupol-theatre','Mariupol Drama Theatre investigation','spatial-documentary-evidence','2022–2023',['ftvde24-fa-mariupol'],'Koble sted, skade, vitnesbyrd, modell og visuelle spor uten å gjøre én framstilling til hele hendelsen.'),
  caseRow('case-vvp','Vær Varsom-plakaten','norwegian-tv-news-ethics','current',['ftvde25-vvp'],'Prøve nyhets- og dokumentarbilder mot kildekritikk, identifikasjon, personvern og vern av barn.'),
  caseRow('case-theresienstadt','Theresienstadt: A Documentary Film','coerced-staged-propaganda','1944',['ftvde26-ushmm-theresienstadt'],'Vise at fotografisk indeks og dokumentarisk overflate ikke i seg selv beviser fri, sann eller representativ framstilling.'),
]);

const C = {
  archive:['case-loc-collections','case-eye-reuse','case-handsworth-songs','case-sans-soleil'], direct:['case-berkeley-protocol','case-witness-eyewitness','case-ap-visuals','case-reuters-standards'],
  ethics:['case-dawg','case-honest-truths','case-witness-eyewitness','case-vvp'], truth:['case-nanook','case-theresienstadt','case-berkeley-protocol','case-saydnaya'],
  forms:['case-cinema-verite','case-nanook','case-sans-soleil','case-handsworth-songs'], place:['case-saydnaya','case-mariupol-theatre','case-nanook'],
  essay:['case-sans-soleil','case-handsworth-songs','case-the-wall'], everyday:['case-disneyland-dream','case-great-migration-home','case-loc-collections'],
  staging:['case-nanook','case-theresienstadt','case-saydnaya','case-the-wall'], observation:['case-cinema-verite','case-nanook','case-saydnaya'],
  reality:['case-ofcom-reality','case-ofcom-children','case-dawg','case-honest-truths'], reconstruction:['case-the-wall','case-saydnaya','case-ap-synthetic','case-dimensions-testimony'],
  news:['case-ap-visuals','case-reuters-standards','case-vvp','case-berkeley-protocol'], image:['case-berkeley-protocol','case-witness-eyewitness','case-ap-visuals','case-theresienstadt'],
  testimony:['case-shoah-archive','case-dimensions-testimony','case-trauma-interview','case-saydnaya','case-witness-eyewitness']
};
const claims = (prefix, rows) => rows.map((row, index) => [`ftv-de-pc-${prefix}${index + 1}`, row[0], row[1]]);
const TOPIC_PLANS = Object.freeze([
  ['arkivdokumentar_found_footage_og_ombruk','archive','Prøve hvordan utvalg, montasje og ny kontekst omformer eksisterende bilder uten å viske ut proveniens, opprinnelig funksjon eller arkivfravær.',claims('01-',[['Hvorfor found footage må spores til kildeobjekt, samling, metadata og opprinnelig bruk før ny montasje tolkes.','archive-provenance'],['Hvordan Handsworth Songs bruker arkiv- og mediebilder til et argument uten å gjøre materialet selvforklarende.','found-footage-case'],['Hvordan Sans Soleil lar nye stemme- og montasjerelasjoner endre bilders betydning.','essay-recontextualisation'],['Hvorfor arkivtilgang og kunstnerisk ombruk ikke er det samme som arkivets bevaringspraksis.','archive-boundary']])],
  ['direktebilde_og_evidens','direct','Skille sendingens eller opptakets samtidighet fra autentisitet, helhet, proveniens og etterfølgende kontroll.',claims('02-',[['Hvorfor et direkte eller umiddelbart bilde fortsatt krever identitet, tid, sted og kjede.','live-evidence-limits'],['Hvordan Berkeley-protokollen skiller innsamling, bevaring, verifikasjon og analyse.','digital-evidence-method'],['Hvorfor redaksjonell merking og kontekst er del av bildeevidensen.','editorial-context'],['Hvordan risiko for den filmede kan endre om og hvordan et verifisert bilde bør vises.','verified-but-harmful']])],
  ['dokumentar_etikk_og_deltakeransvar','ethics','Gjøre samtykke, maktasymmetri, sårbarhet, bruksendring og ettervirkning til løpende ansvar gjennom hele produksjonen.',claims('03-',[['Hvorfor et signert samtykke ikke alene avgjør om en dokumentarisk handling er etisk forsvarlig.','consent-not-complete'],['Hvordan DAWG flytter ansvar fra releaseøyeblikket til relasjonen mellom deltaker, filmskaper, publikum og finansiering.','accountability-framework'],['Hvordan WITNESS skiller offentlig interesse fra unødvendig identifisering og risiko.','risk-minimisation'],['Hvorfor barns velferd og verdighet krever selvstendig vurdering også når foresatte har samtykket.','child-protection']])],
  ['dokumentar_sannhet_og_evidens','truth','Analysere hva bilder viser, hvordan de ble produsert, hvilket argument de inngår i og hvilke kilder som kan kontrollere påstanden.',claims('04-',[['Hvorfor fotografisk registrering ikke gjør et dokumentarisk argument automatisk sant.','indexicality-limit'],['Hvordan Nanook viser at staging, samarbeid og risiko må inn i sannhetsvurderingen.','nanook-truth-case'],['Hvordan Theresienstadt viser at dokumentarisk overflate kan konstrueres gjennom tvang og bedrag.','propaganda-evidence-case'],['Hvordan Saydnaya skiller modell, vitnesbyrd, satellittspor og eksplisitt usikkerhet.','multi-source-truth']])],
  ['dokumentarformer_tradisjoner_og_moduser','forms','Bruke modus som analytisk beskrivelse av stemme, argument og relasjon, ikke som en lukket sjangerboks eller sannhetsrangering.',claims('05-',[['Hvordan observasjon, deltakelse, essay og refleksivitet organiserer ulike relasjoner til virkeligheten.','mode-distinction'],['Hvorfor ett verk kan kombinere flere dokumentariske moduser.','hybrid-modes'],['Hvorfor modusnavnet ikke beviser verken etikk eller sannhet.','mode-not-proof']])],
  ['dokumentarisk_sted_og_evidens','place','Behandle stedet som situert og beskåret evidens som må kontrolleres mot geometri, tid, vitnesbyrd og produksjonsposisjon.',claims('06-',[['Hvordan Saydnaya bruker rommodell og akustikk når direkte bilder mangler.','spatial-reconstruction'],['Hvordan Mariupol-undersøkelsen sammenholder sted, skade, modeller og situerte vitnesbyrd.','place-evidence-case'],['Hvorfor locationbildet aldri alene representerer alle erfaringer eller hele hendelsesforløpet på stedet.','place-frame-limit']])],
  ['essayfilm_subjektivitet_og_audiovisuelt_argument','essay','Analysere personlig stemme, tvil, brev, montasje og refleksjon som synlige premisser for et argument.',claims('07-',[['Hvordan Sans Soleil bygger argument gjennom avstand mellom bilder, brevstemme og historisk minne.','essay-voice'],['Hvordan Handsworth Songs nekter én forklarende fasit og produserer kontekst gjennom montasje.','essay-counterhistory'],['Hvorfor eksplisitt subjektivitet kan gjøre premisser synlige uten å frita filmen fra kildekritikk.','subjectivity-accountability']])],
  ['hverdagsdokumentasjon_og_amatorkultur','everyday','Lese amatørbilder gjennom apparat, relasjon, anledning, fravær, annotasjon og senere sirkulasjon.',claims('08-',[['Hvordan Disneyland Dream skifter funksjon fra familieopptak til arkiv- og kulturarvobjekt.','home-movie-reframing'],['Hvordan Great Migration Home Movie Project kobler familiekompetanse til historisk lesbarhet.','community-knowledge'],['Hvorfor hverdagsbildets nærhet ikke garanterer representativitet, fullstendighet eller samtykke til ny bruk.','everyday-limit']])],
  ['iscenesettelse_og_virkelighetskrav','staging','Skille avtalt handling, reenactment, tvang, pedagogisk rekonstruksjon og bedrag etter funksjon og åpenhet.',claims('09-',[['Hvordan Nanooks iscenesatte jakt og igloarbeid både involverte samarbeid og produksjonsmakt.','collaborative-staging'],['Hvordan Theresienstadt gjør tvungen iscenesettelse til bevis på produksjonsmakt, ikke på det viste livet.','coerced-staging'],['Hvorfor åpen rekonstruksjon må vurderes annerledes enn skjult bedrag.','disclosed-reconstruction'],['Hvordan kildegrunnlag og merking bestemmer hvilken evidensvekt en iscenesatt sekvens kan bære.','staging-evidence-weight']])],
  ['observasjon_deltakelse_refleksivitet_og_performance','observation','Undersøke hvordan kamera, filmskaper og opptakssituasjon påvirker handling, relasjon og framføring.',claims('10-',[['Hvorfor observerende stil ikke betyr fravær av filmskaper eller produksjonsvalg.','observational-presence'],['Hvordan cinéma vérité gjør møtet og påvirkningen til en del av metoden.','participatory-method'],['Hvordan refleksiv form kan synliggjøre apparat og forhandling uten å løse alle maktproblemer.','reflexive-limit'],['Hvordan performance må analyseres som respons på både sosial situasjon og kamera.','camera-performance']])],
  ['reality_observasjon_og_formatmakt','reality','Koble observerende overflate til casting, regler, produksjonsinngrep, redigering, publisering og omsorgsansvar.',claims('11-',[['Hvordan realityformatet produserer handlingsrom gjennom casting, regler og selektiv redigering.','format-power'],['Hvorfor broadcasterens omsorgsansvar gjelder mulig skade under og etter deltakelse.','duty-of-care'],['Hvorfor samtykke og formatkjennskap ikke opphever særskilt vern for sårbare og mindreårige deltakere.','vulnerable-participants']])],
  ['rekonstruksjon_animasjon_og_syntetiske_dokumentarbilder','reconstruction','Vurdere ikke-fotografiske bilder etter kildegrunnlag, nødvendighet, merking, estetisk valg og risiko for forveksling.',claims('12-',[['Hvordan The Wall bruker animasjon, reise, stemme og deltakere i et dokumentarisk argument.','animated-documentary'],['Hvordan Saydnayas modell er en kildebasert rekonstruksjon og ikke et kameraopptak fra fengselet.','model-status'],['Hvordan Dimensions in Testimony skiller bevarte svar fra teknologisk valgt avspilling.','interactive-testimony'],['Hvorfor syntetiske nyhetsbilder krever tydelig merking og aldri kan erstatte dokumentert hendelsesfotografi.','synthetic-disclosure']])],
  ['tv_nyhetsbilde_og_evidens','news','Prøve nyhetsbildets samtidighet mot kildekritikk, utvalg, redigering, bildetekst, imøtegåelse og vern.',claims('13-',[['Hvorfor TV-nyhetsbildet er et redaksjonelt utvalg selv når hendelsen skjer direkte.','news-selection'],['Hvordan APs visuelle standard skiller dokumenterende bilde fra generisk eller manipulert illustrasjon.','news-visual-standard'],['Hvordan Vær Varsom-plakaten knytter kildekontroll til identifikasjon, privatliv og barn.','norwegian-press-ethics'],['Hvorfor hastighet aldri kan erstatte verifikasjon av tid, sted, kilde og sammenheng.','speed-verification']])],
  ['virkelighetsbilde_og_evidenspastand','image','Skille det synlige sporet fra påstanden om hva bildet beviser, hvem det gjelder og hvilken helhet det representerer.',claims('14-',[['Hvorfor et bilde kan være autentisk, men feilbeskrevet, urepresentativt eller skadelig brukt.','authentic-miscontextualised'],['Hvordan kildekjede og kontekst gjør en evidenspåstand etterprøvbar.','chain-context'],['Hvordan Theresienstadt viser forskjellen mellom det kameraet registrerte og den historiske påstanden filmen skulle produsere.','recorded-versus-claimed']])],
  ['vitnesbyrd_traume_og_dokumentarisk_ansvar','testimony','Behandle vitnesbyrd som situert erfaring med deltakerkontroll, intervjurelasjon, klipp, kontekst og mulige ettervirkninger.',claims('15-',[['Hvorfor traumebevisst intervju begynner med formål, valg, trygghet og rett til å stoppe.','trauma-informed-process'],['Hvordan Shoah-samlingen gjør intervju- og arkivkontekst nødvendig for tolkning av videovitnesbyrd.','testimony-archive'],['Hvordan Dimensions in Testimony bevarer konkrete svar samtidig som avspillingen styres av et eget teknologisk lag.','testimony-interface'],['Hvordan Saydnaya viser at vitnesbyrd og modell kan støtte hverandre når metode og begrensning er synlig.','testimony-reconstruction']])]
]);

const caseById = new Map(CASES.map((row) => [row.id, row]));
function buildTopicBriefs(emneById) {
  return TOPIC_PLANS.map(([suffix, caseKey, learning_goal, planned]) => {
    const emne_id = `em_film_tv_${suffix}`;
    const canonical = emneById.get(emne_id);
    assert(canonical, `Mangler canonicalt emne ${emne_id}`);
    const case_ids = C[caseKey];
    const source_ids = [...new Set(case_ids.flatMap((id) => caseById.get(id)?.source_ids || []))];
    return {
      emne_id, case_ids, source_ids, learning_goal,
      planned_claims: planned.map(([id, claim_focus, claim_type]) => ({ id, claim_focus, claim_type, source_ids, status: 'planned_requires_fulltext_verification' })),
      title: canonical.title, canonical_boundary: canonical.boundary, method_ids: canonical.method_ids
    };
  });
}

export function buildFilmTvDocumentaryEvidenceEthicsSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Dokumentar, evidens og etikk');
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDoc = read(P.methods);
  const methodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
  const sourceIds = new Set(SOURCES.map((row) => row.id));
  const caseIds = new Set(CASES.map((row) => row.id));
  const topicBriefs = buildTopicBriefs(emneById);
  const plannedClaims = topicBriefs.flatMap((row) => row.planned_claims);
  const currentRegistry = read(P.registry);
  const currentStatus = read(P.status);
  const brief = {
    schema: 'history_go_film_tv_documentary_evidence_ethics_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-12',
    status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv', planned_unit_id: UNIT_ID, future_chapter_id: UNIT_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: { title: unit.title, primary_domain_ids: unit.primary_domain_ids, prerequisite_planned_unit_ids: unit.prerequisite_planned_unit_ids, prerequisite_existing_chapter_ids: unit.prerequisite_existing_chapter_ids, emne_count: unit.emne_count, emne_ids: unit.emne_ids, overlap_boundary: unit.overlap_boundary },
    source_policy: {
      sources_are_inspectable_https: true, institutions_regulators_archives_field_guides_and_object_records_prioritized: true,
      every_truth_claim_separates_recording_staging_reconstruction_interpretation_and_ethics: true,
      consent_is_a_process_not_a_complete_ethics_verdict: true, verified_image_can_still_be_miscontextualised_or_harmful: true,
      testimony_requires_interview_editing_context_and_aftercare_analysis: true, synthetic_and_reconstructed_images_require_visible_status: true,
      general_representation_identity_and_power_analysis_remains_in_next_unit: true,
      archive_preservation_access_rights_and_authenticity_remain_outside_this_unit: true,
      planned_claim_is_not_verified_claim: true, fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES, case_candidates: CASES, topic_briefs: topicBriefs,
    proposed_module_order: [
      { id:'bilde-pastand-og-verifikasjon',sequence:1,emne_ids:[unit.emne_ids[13],unit.emne_ids[3],unit.emne_ids[1],unit.emne_ids[12]],purpose:'Skiller det registrerte bildet fra evidenspåstanden og bygger kontroll av direkte- og nyhetsbilder.' },
      { id:'former-stemmer-og-opptakssituasjoner',sequence:2,emne_ids:[unit.emne_ids[4],unit.emne_ids[6],unit.emne_ids[9]],purpose:'Sammenligner dokumentariske moduser, essayistisk argument og kameraets deltakelse i situasjonen.' },
      { id:'iscenesettelse-ombruk-sted-og-rekonstruksjon',sequence:3,emne_ids:[unit.emne_ids[8],unit.emne_ids[11],unit.emne_ids[0],unit.emne_ids[5]],purpose:'Prøver staging, syntese, found footage og rommodell mot kildegrunnlag, åpenhet og evidensvekt.' },
      { id:'deltakere-hverdagsbilder-format-og-vitnesbyrd',sequence:4,emne_ids:[unit.emne_ids[2],unit.emne_ids[10],unit.emne_ids[7],unit.emne_ids[14]],purpose:'Gjør samtykke, sårbarhet, formatmakt, amatørkultur, traume og ettervirkning til produksjonsansvar.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true, paragraph_and_claim_counts_follow_problem_complexity: true,
      current_claim_plan_counts_by_emne: topicBriefs.map((row) => ({ emne_id: row.emne_id, planned_claim_count: row.planned_claims.length })),
      paragraph_claim_trace_required: true, every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true, image_status_must_distinguish_recording_reenactment_model_animation_and_synthetic_generation: true,
      participant_analysis_must_cover_consent_power_risk_use_change_and_aftereffects: true,
      testimony_must_not_be_reduced_to_transcripted_fact: true, mode_labels_must_not_be_used_as_truth_or_ethics_scores: true,
      general_identity_representation_and_counterimage_analysis_remains_outside_scope: true,
      archive_preservation_rights_access_and_restoration_remain_outside_scope: true, chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_dokumentar_evidens_og_etikk'
  };
  const registry = structuredClone(currentRegistry);
  registry.version = '2.86.0'; registry.updatedAt = '2026-08-12';
  registry.subjects.film_tv.canonicalModel.note = `Film & TVs variable canon har 192 emner. De fem første planenhetene er registrert etter fulltekstporten. Dokumentar, evidens og etikk har nå en egen kilde- og claimbrief for ${unit.emne_count} canonicale emner med ${SOURCES.length} inspectable institusjons-, regulator-, arkiv-, metode- og objektkilder, ${CASES.length} dokumentar-, nyhets-, amatør-, reality-, rekonstruksjons- og vitnesbyrdcase og ${plannedClaims.length} variabelt fordelte claimplaner. Claimplanene er uverifiserte, og kapitlet er ikke runtime-registrert. Neste port er fulltekst med avsnittsnivå claimtrace og ny audit; omfanget følger problemgrensene, ikke en kvote.`;
  registry.subjects.film_tv.canonicalModel.sixthSourceClaimBrief = P.brief;
  const status = structuredClone(currentStatus);
  status.version = '1.74.0'; status.updatedAt = '2026-08-12';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.nextGate = SOURCE_BRIEF_GATE;
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  filmStatus.note = `Kilde- og claimbriefen for Dokumentar, evidens og etikk er komplett: ${unit.emne_count} canonicale emner, ${SOURCES.length} inspectable kilder, ${CASES.length} case og ${plannedClaims.length} claimplaner fordelt ${claimCounts.join('–')} etter faglig behov. Planlagte claims er ikke verifiserte claims, og kapitlet er ikke registrert. Neste port er fulltekst, faktisk kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.`;
  const usedSourceIds = new Set([...topicBriefs.flatMap((row) => row.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const roles = SOURCES.map((row) => row.evidence_role).join(' ');
  const report = {
    schema:'history_go_film_tv_documentary_evidence_ethics_source_brief_v1_audit',version:'1.0.0',updated_at:'2026-08-12',status:'source_claim_brief_complete_full_chapter_next',subject_id:'film_tv',
    summary:{ emne_count:unit.emne_count,source_count:SOURCES.length,case_count:CASES.length,planned_claim_count:plannedClaims.length,planned_claim_counts_by_emne:claimCounts,proposed_module_count:brief.proposed_module_order.length,registered_chapter_count_delta:0 },
    coverage:topicBriefs.map((row)=>({emne_id:row.emne_id,method_count:row.method_ids.length,source_count:row.source_ids.length,case_count:row.case_ids.length,planned_claim_count:row.planned_claims.length})),
    gates:{
      sixth_learning_order_unit_selected:plan.production_sequence[5]===UNIT_ID,
      required_prerequisite_chapters_registered:unit.prerequisite_planned_unit_ids.every((id)=>currentRegistry.subjects.film_tv.chapters.some((row)=>row.id===id)),
      exact_unit_emne_coverage:topicBriefs.length===unit.emne_count&&new Set(topicBriefs.map((row)=>row.emne_id)).size===unit.emne_count&&unit.emne_ids.every((id)=>topicBriefs.some((row)=>row.emne_id===id)),
      all_emners_active_canonical:topicBriefs.every((row)=>emneById.has(row.emne_id)),all_methods_resolve:topicBriefs.every((row)=>row.method_ids.every((id)=>methodIds.has(id))),
      inspectable_https_sources:SOURCES.every((row)=>row.url.startsWith('https://')&&row.retrieval_status==='verified_2026-08-12'&&row.source_location),
      institutional_regulatory_archive_method_and_object_roles_present:['institutional','regulatory','archive','guidance','object'].every((needle)=>roles.includes(needle)),
      every_source_used:SOURCES.every((row)=>usedSourceIds.has(row.id)),every_source_reference_resolves:[...usedSourceIds].every((id)=>sourceIds.has(id)),
      every_case_documented:CASES.every((row)=>row.source_ids.length&&row.source_ids.every((id)=>sourceIds.has(id))),
      documentary_news_amateur_reality_reconstruction_and_testimony_cases_present:['documentary','news','amateur','reality','reconstruction','testimony'].every((needle)=>CASES.some((row)=>`${row.medium} ${row.purpose}`.toLowerCase().includes(needle))),
      every_case_reference_resolves:topicBriefs.every((row)=>row.case_ids.every((id)=>caseIds.has(id))),
      every_case_source_available_to_owning_topic:topicBriefs.every((topic)=>topic.case_ids.every((id)=>caseById.get(id).source_ids.every((sourceId)=>topic.source_ids.includes(sourceId)))),
      claim_counts_follow_variable_problem_scope:new Set(claimCounts).size>1&&Math.min(...claimCounts)>=3,
      no_planned_claim_overstated_as_verified:plannedClaims.every((row)=>row.status==='planned_requires_fulltext_verification'),all_planned_claim_ids_unique:new Set(plannedClaims.map((row)=>row.id)).size===plannedClaims.length,
      all_topics_have_boundaries_sources_cases_and_methods:topicBriefs.every((row)=>row.canonical_boundary&&row.source_ids.length>=3&&row.case_ids.length>=3&&row.method_ids.length>=1),
      module_order_covers_every_emne_once:moduleEmneIds.length===unit.emne_count&&new Set(moduleEmneIds).size===unit.emne_count&&unit.emne_ids.every((id)=>moduleEmneIds.includes(id)),
      module_sizes_are_not_forced_equal:new Set(brief.proposed_module_order.map((row)=>row.emne_ids.length)).size>1,
      scope_boundaries_preserved:brief.source_policy.general_representation_identity_and_power_analysis_remains_in_next_unit&&brief.source_policy.archive_preservation_access_rights_and_authenticity_remain_outside_this_unit,
      chapter_remains_unregistered:!registry.subjects.film_tv.chapters.some((row)=>row.id===UNIT_ID),
      registration_waits_for_fulltext_claim_source_audit:!brief.runtime_registration.registered&&!brief.runtime_registration.allowed_before_full_chapter_gate&&brief.production_requirements.chapter_registration_only_after_audit
    },next_gate:brief.next_gate
  };
  return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1({ writeFiles=false, checkFiles=true }={}) {
  const currentGate=read(P.status).subjects.find((row)=>row.id==='film_tv')?.nextGate;
  assert([INPUT_GATE,SOURCE_BRIEF_GATE,FULLTEXT_GATE,REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate),`Uventet Film & TV-port: ${currentGate}`);
  if([FULLTEXT_GATE,REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate)){const brief=read(P.brief);const report=read(P.report);assert(brief.status==='source_claim_brief_consumed_by_verified_chapter','Dokumentarbriefen skal være konsumert etter fulltekstporten');assert(brief.runtime_registration.registered===true&&brief.runtime_registration.chapter_id===UNIT_ID,'Dokumentarbriefen mangler kapittelregistrering');assert(report.status==='source_claim_brief_consumed_by_verified_chapter'&&Object.values(report.gates).every(Boolean),'Dokumentarbriefens etteraudit er ikke grønn');return{brief,report,registry:read(P.registry),status:read(P.status),unit:read(P.plan).planned_units.find((row)=>row.id===UNIT_ID),topicBriefs:brief.topic_briefs,plannedClaims:brief.topic_briefs.flatMap((row)=>row.planned_claims)};}
  const built=buildFilmTvDocumentaryEvidenceEthicsSourceBriefV1();const outputs={[P.brief]:built.brief,[P.report]:built.report,[P.registry]:built.registry,[P.status]:built.status};
  if(writeFiles)for(const[file,value]of Object.entries(outputs))write(file,value);if(checkFiles)for(const[file,value]of Object.entries(outputs))assert(isDeepStrictEqual(read(file),value),`${file} er utdatert`);assert(Object.values(built.report.gates).every(Boolean),'Minst én dokumentarbriefport feiler');return built;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const args=new Set(process.argv.slice(2));try{const result=auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1({writeFiles:args.has('--write'),checkFiles:!args.has('--write')});console.log(`Film & TV dokumentarbrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);}catch(error){console.error(`Film & TV dokumentarbrief FEIL: ${error.message}`);process.exitCode=1;}}
