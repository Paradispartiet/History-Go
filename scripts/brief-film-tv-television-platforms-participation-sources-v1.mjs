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
  brief: 'data/fag/TV_og_Film/film_tv_television_platforms_participation_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-television-platforms-participation-source-brief-v1-audit.json'
});
const UNIT_ID = 'fjernsyn-plattformer-og-deltakerhistorier';
const FUTURE_CHAPTER_ID = UNIT_ID;
const INPUT_GATE = 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief';
const SOURCE_BRIEF_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const SOURCES = Object.freeze([
  {
    id: 'ftvtp01-nb-first-tv', publisher: 'Nasjonalbiblioteket',
    title: '70 år siden de første TV-bildene', url: 'https://www.nb.no/historier-fra-samlingen/70-ar-siden-de-forste-tv-bildene/',
    type: 'national-library-broadcast-history', evidence_role: 'institutional-historiography',
    source_location: 'The account of the public 1954 trial images at Egertorget and the start of regular Norwegian television broadcasts on 20 August 1960', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp02-nb-broadcast-archive', publisher: 'Nasjonalbiblioteket',
    title: 'Kringkasting – Norsk radio og fjernsyn', url: 'https://www.nb.no/samlingen/kringkasting/',
    type: 'national-broadcast-archive-overview', evidence_role: 'institutional-archive-record',
    source_location: 'Collection scope for NRK, TV 2 and TVNorge broadcasts, historical programmes, programme reports and research access', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp03-science-coronation', publisher: 'Science Museum Group',
    title: "Television reigns: Broadcasting Queen Elizabeth's coronation", url: 'https://www.sciencemuseum.org.uk/objects-and-stories/television-reigns-broadcasting-queen-elizabeths-coronation',
    type: 'national-science-museum-television-history', evidence_role: 'institutional-historiography',
    source_location: 'The 1953 live production, relay logistics, television-set uptake and collective viewing in homes and public rooms', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp04-ebu-innovation', publisher: 'European Broadcasting Union',
    title: '100 years of innovation', url: 'https://www.ebu.ch/about/public-service-media/100-years-of-innovation',
    type: 'broadcast-union-technology-history', evidence_role: 'institutional-historiography',
    source_location: 'The 23 July 1962 Telstar relay of the first live transatlantic television signal and the role of European public-service broadcasters', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp05-science-our-world', publisher: 'Science Museum Group',
    title: 'Telstar, Intelsat and the first global satellite broadcast', url: 'https://www.sciencemuseum.org.uk/objects-and-stories/telstar-intelsat-and-first-global-satellite-broadcast',
    type: 'national-science-museum-satellite-history', evidence_role: 'institutional-historiography',
    source_location: "Satellite infrastructure and the 25 June 1967 live global broadcast Our World, including the distinction from Telstar's earlier transatlantic relay", retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp06-fcc-cable', publisher: 'Federal Communications Commission',
    title: 'Cable Television', url: 'https://www.fcc.gov/media/engineering/cable-television',
    type: 'communications-regulator-history', evidence_role: 'regulatory-primary-trace',
    source_location: 'Cable-system engineering overview and the 1965 establishment of FCC rules for systems receiving signals by microwave antennas', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp07-ofcom-pay-tv', publisher: 'Ofcom',
    title: 'Pay TV market overview', url: 'https://www.ofcom.org.uk/siteassets/resources/documents/consultations/uncategorised/8480-market_invest_paytv/associated-documents/a8.pdf?v=332519',
    type: 'communications-regulator-market-history', evidence_role: 'regulatory-historiography',
    source_location: 'Sections 2.56 onward and platform tables on the growth of UK pay television through cable and satellite from the 1980s and 1990s', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp08-bfi-videotape', publisher: 'British Film Institute',
    title: 'All about... videotape', url: 'https://www.bfi.org.uk/features/all-about-videotape',
    type: 'national-film-archive-format-history', evidence_role: 'institutional-historiography',
    source_location: 'Videotape formats and their historical impact on television recording, production, reuse, access and later digitisation', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp09-loc-home-movies', publisher: 'Library of Congress / National Film Preservation Board',
    title: 'Northeast Historic Film', url: 'https://www.loc.gov/static/programs/national-film-preservation-board/documents/fnehistoric.pdf',
    type: 'national-film-preservation-survey', evidence_role: 'archive-primary-trace',
    source_location: 'Collection statement on amateur material from 1916 onward and home movies as records of everyday life, with annotation and provenance requirements', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp10-loc-disneyland-dream', publisher: 'Library of Congress',
    title: 'From the Film Registry: Disneyland Dream (1956)', url: 'https://blogs.loc.gov/now-see-hear/2021/07/from-the-film-registry-disneyland-dream-1956/',
    type: 'national-film-registry-home-movie-case', evidence_role: 'institutional-object-record',
    source_location: 'The Barstow family film, reversal-film uniqueness, amateur production circumstances and its later registry framing', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp11-nmaahc-home-movies', publisher: 'Smithsonian National Museum of African American History and Culture',
    title: 'The Great Migration Home Movie Project', url: 'https://nmaahc.si.edu/explore/initiatives/great-migration-home-movie-project',
    type: 'national-museum-community-film-project', evidence_role: 'participatory-historiography',
    source_location: 'Project scope for family films as community-made historical evidence of African American life, movement and memory', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp12-nfb-verite', publisher: 'National Film Board of Canada',
    title: 'Cinéma Vérité: Defining the Moment', url: 'https://www.nfb.ca/film/cinema_verite_defining_the_moment/',
    type: 'national-film-board-documentary-history', evidence_role: 'institutional-historiography',
    source_location: 'The 1950s–1960s direct-cinema and cinéma-vérité movement, portable practice and cases including Crisis, Lonely Boy and Chronicle of a Summer', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp13-ushmm-theresienstadt', publisher: 'United States Holocaust Memorial Museum',
    title: 'Theresienstadt: A Documentary Film, 1944', url: 'https://perspectives.ushmm.org/item/theresienstadt-a-documentary-film-1944',
    type: 'national-museum-propaganda-film-analysis', evidence_role: 'institutional-object-record',
    source_location: 'Production context and deceptive documentary staging commissioned by Nazi authorities in the Theresienstadt ghetto', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp14-nmaahc-anderson', publisher: 'Smithsonian National Museum of African American History and Culture',
    title: 'Filmmaker Madeline Anderson', url: 'https://nmaahc.si.edu/explore/stories/filmmaker-madeline-anderson',
    type: 'national-museum-television-career-history', evidence_role: 'recovery-historiography',
    source_location: "Anderson's documentary and television career, including her pioneering position as a Black woman producing and directing a televised documentary", retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp15-loc-aapb', publisher: 'Library of Congress / American Archive of Public Broadcasting',
    title: 'American Archive of Public Broadcasting resources for libraries', url: 'https://www.loc.gov/static/portals/librarians/american-library-association/annual/pdf/american-archive-of-public-broadcasting-resources-for-libraries.pdf',
    type: 'national-public-broadcast-archive-guide', evidence_role: 'institutional-archive-record',
    source_location: 'Collection scale, regional and local programme scope, 70-plus years of public broadcasting and curated counter-historical exhibits', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp16-sec-netflix-2008', publisher: 'U.S. Securities and Exchange Commission / Netflix',
    title: 'Netflix 2007 Form 10-K', url: 'https://www.sec.gov/Archives/edgar/data/1065280/000119312508040378/d10k.htm',
    type: 'regulatory-company-filing', evidence_role: 'corporate-primary-trace',
    source_location: 'Contemporaneous 2007 business description of DVD-by-mail, instant watching, catalogue scale and anticipated consumer-electronics delivery', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp17-sec-netflix-2011', publisher: 'U.S. Securities and Exchange Commission / Netflix',
    title: 'Netflix 2011 Form 10-K', url: 'https://www.sec.gov/Archives/edgar/data/1065280/000119312512053009/d260328d10k.htm',
    type: 'regulatory-company-filing', evidence_role: 'corporate-primary-trace',
    source_location: 'The 2011 separation into domestic streaming, international streaming and domestic DVD segments after the earlier hybrid plan', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp18-youtube-ten-years', publisher: 'YouTube',
    title: 'Celebrating 10 Years of YouTube', url: 'https://youtube.googleblog.com/2015/05/celebrating-10-years-of-youtube.html',
    type: 'platform-primary-history', evidence_role: 'corporate-primary-trace',
    source_location: 'The 23 April 2005 upload of Me at the Zoo and the platform chronology presented by YouTube at its tenth anniversary', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp19-pew-online-video', publisher: 'Pew Research Center',
    title: 'Your Other Tube: Audience for Video-Sharing Sites Soars', url: 'https://www.pewresearch.org/2009/07/29/your-other-tube-audience-for-videosharing-sites-soars/',
    type: 'nonpartisan-research-survey', evidence_role: 'historical-audience-research',
    source_location: '2006–2009 survey comparisons for video-sharing use, uploads, online television and the coexistence of user-made and professional material', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvtp20-ssb-media-use', publisher: 'Statistisk sentralbyrå',
    title: 'Mediebruksundersøkelsen 2020', url: 'https://www.ssb.no/kultur-og-fritid/artikler-og-publikasjoner/_attachment/451642?_ts=178fd3d8250',
    type: 'national-statistics-method-report', evidence_role: 'historical-audience-research',
    source_location: 'Documentation that Norwegian mass-media-use surveys began in 1967 and became annual quarterly surveys from 1991, enabling historical comparison across media transitions', retrieval_status: 'verified_2026-08-11'
  }
]);

const CASES = Object.freeze([
  { id: 'case-norwegian-tv-trials', work: 'Egertorget trial images and regular Norwegian television', medium: 'national-broadcast-transition', years: '1954–1960', source_ids: ['ftvtp01-nb-first-tv'], purpose: 'Skille offentlig prøvesending, mottakersituasjon og regulær kringkasting i norsk fjernsynshistorie.' },
  { id: 'case-norwegian-broadcast-archive', work: 'Nasjonalbibliotekets kringkastingsarkiv', medium: 'broadcast-archive-record', years: '1930s–', source_ids: ['ftvtp02-nb-broadcast-archive'], purpose: 'Vise hvordan bevarte sendinger og programrapporter gir ulik evidens om norsk radio- og fjernsynshistorie.' },
  { id: 'case-coronation-1953', work: "Queen Elizabeth II's coronation broadcast", medium: 'live-national-television-event', year: 1953, source_ids: ['ftvtp03-science-coronation'], purpose: 'Koble direktesendt begivenhet, produksjonslogistikk, mottakerkjøp og kollektiv visning.' },
  { id: 'case-telstar-1962', work: 'Telstar transatlantic television relay', medium: 'live-transatlantic-satellite-relay', year: 1962, source_ids: ['ftvtp04-ebu-innovation'], purpose: 'Skille en transatlantisk satellittoverføring fra senere globalt samordnet fjernsyn.' },
  { id: 'case-our-world-1967', work: 'Our World', medium: 'live-global-satellite-programme', year: 1967, source_ids: ['ftvtp05-science-our-world'], purpose: 'Undersøke hvordan satellittnett, kringkastere og programorganisering produserte global samtidighet.' },
  { id: 'case-us-cable-regulation', work: 'US cable systems and FCC rules', medium: 'commercial-cable-regulation', years: '1950s–1965', source_ids: ['ftvtp06-fcc-cable'], purpose: 'Koble signalmottak, mikrobølgeinfrastruktur og regulering i kabelens institusjonalisering.' },
  { id: 'case-uk-pay-tv', work: 'UK cable and satellite pay-TV platforms', medium: 'commercial-satellite-cable-market', years: '1982–2007', source_ids: ['ftvtp07-ofcom-pay-tv'], purpose: 'Følge kanalvekst og betalingsfjernsyn gjennom konkrete distribusjonsplattformer framfor en løs idé om kommersialisering.' },
  { id: 'case-videotape-formats', work: 'Broadcast and consumer videotape', medium: 'videotape-production-and-home-media', years: '1950s–2000s', source_ids: ['ftvtp08-bfi-videotape'], purpose: 'Koble opptak, redigering, gjenbruk, hjemmeformat og senere digitalisering uten å gjøre formatene til en enkel framgangslinje.' },
  { id: 'case-home-movie-everyday-life', work: 'Northeast Historic Film home-movie collections', medium: 'amateur-film-everyday-history', years: '1916–', source_ids: ['ftvtp09-loc-home-movies'], purpose: 'Vise hvorfor proveniens, annotasjon og familiekunnskap påvirker hjemmefilmens historiske lesbarhet.' },
  { id: 'case-disneyland-dream', work: 'Disneyland Dream', medium: 'family-home-movie', year: 1956, source_ids: ['ftvtp10-loc-disneyland-dream'], purpose: 'Analysere et konkret familieopptak som unikt reversalmateriale, reisedokument og senere kulturarvobjekt.' },
  { id: 'case-great-migration-home-movies', work: 'Great Migration Home Movie Project', medium: 'community-home-movie-history', years: '20th-century', source_ids: ['ftvtp11-nmaahc-home-movies'], purpose: 'Koble familieblikk og migrasjon til en deltakerhistorie som endrer hvilke hverdagsliv som blir synlige.' },
  { id: 'case-cinema-verite', work: 'Crisis / Lonely Boy / Chronicle of a Summer', medium: 'documentary-truth-regime', years: '1950s–1960s', source_ids: ['ftvtp12-nfb-verite'], purpose: 'Historisere bærbart utstyr, observasjon og medvirkning som et bestemt sannhetsregime, ikke nøytral virkelighet.' },
  { id: 'case-theresienstadt', work: 'Theresienstadt: A Documentary Film', medium: 'staged-propaganda-documentary', year: 1944, source_ids: ['ftvtp13-ushmm-theresienstadt'], purpose: 'Vise hvordan dokumentariske bilder kan være planlagt bedrag og må leses mot produksjonsmakt og tvang.' },
  { id: 'case-madeline-anderson', work: "Madeline Anderson's televised documentary work", medium: 'recovered-television-documentary-career', years: '1950s–1970s', source_ids: ['ftvtp14-nmaahc-anderson'], purpose: 'Revidere fjernsyns- og dokumentarhistorie gjennom dokumentert arbeid som Black kvinne i produksjon og regi.' },
  { id: 'case-aapb-local-public-media', work: 'American Archive of Public Broadcasting regional collections', medium: 'local-public-television-counter-history', years: 'late-1940s–', source_ids: ['ftvtp15-loc-aapb'], purpose: 'Vise hvordan lokale og regionale programmer utfordrer en historie bygget bare på nasjonale nettverk og prime time.' },
  { id: 'case-netflix-hybrid-2007', work: 'Netflix DVD and instant-watching hybrid', medium: 'dvd-to-streaming-platform-transition', years: '2007–2008', source_ids: ['ftvtp16-sec-netflix-2008'], purpose: 'Følge plattformovergangen mens DVD-post, nettkatalog og instant watching fortsatt var én abonnementsmodell.' },
  { id: 'case-netflix-segments-2011', work: 'Netflix streaming and DVD segment separation', medium: 'streaming-business-transition', year: 2011, source_ids: ['ftvtp17-sec-netflix-2011'], purpose: 'Dokumentere når strømming, internasjonal ekspansjon og DVD ble rapportert som ulike virksomhetssegmenter.' },
  { id: 'case-youtube-first-upload', work: 'Me at the Zoo and early YouTube', medium: 'participatory-web-video', years: '2005–2009', source_ids: ['ftvtp18-youtube-ten-years','ftvtp19-pew-online-video'], purpose: 'Koble den første opplastingen til dokumentert vekst i videodeling og skille plattformens egen opphavshistorie fra bruksmåling.' },
  { id: 'case-norwegian-media-surveys', work: 'Norwegian media-use survey series', medium: 'longitudinal-media-use-source', years: '1967–2020', source_ids: ['ftvtp20-ssb-media-use'], purpose: 'Vise hvordan en historisk overgang i seing må undersøkes med sammenlignbare målinger, ikke bare selskapenes lanseringsdatoer.' }
]);

const TOPIC_PLANS = Object.freeze([
  {
    emne_id: 'em_film_tv_amatorfilm_hjemmevideo_og_deltakerhistorie',
    case_ids: ['case-home-movie-everyday-life','case-disneyland-dream','case-great-migration-home-movies','case-youtube-first-upload'],
    source_ids: ['ftvtp09-loc-home-movies','ftvtp10-loc-disneyland-dream','ftvtp11-nmaahc-home-movies','ftvtp18-youtube-ten-years','ftvtp19-pew-online-video'],
    learning_goal: 'Lese ikke-profesjonelle opptak som historiske praksiser med bestemte apparater, relasjoner, metadata og offentligheter uten å gjøre dagens fanbruk til enhetens tema.',
    planned_claims: [
      ['ftv-tp-pc-01','Hvordan hjemmefilmer blir historiske kilder gjennom proveniens, annotasjon og kunnskap om hvem som filmer hvem.','amateur-source-criticism'],
      ['ftv-tp-pc-02','Hvordan Disneyland Dream viser forskjellen mellom et unikt familieopptak, et reisedokument og et senere kanonisert arkivobjekt.','home-movie-case'],
      ['ftv-tp-pc-03','Hvordan Great Migration Home Movie Project bruker familiebilder til å gjøre Black hverdagsliv og migrasjon synlig i historien.','participatory-counter-history'],
      ['ftv-tp-pc-04','Hvordan Me at the Zoo og samtidige bruksmålinger dokumenterer overgangen fra privat videopptak til offentlig nettvideo uten å gjøre én opplasting til hele deltakerhistorien.','web-video-transition']
    ]
  },
  {
    emne_id: 'em_film_tv_direktesendt_samtidighet_som_tv_historie',
    case_ids: ['case-coronation-1953','case-telstar-1962','case-our-world-1967','case-norwegian-tv-trials'],
    source_ids: ['ftvtp01-nb-first-tv','ftvtp03-science-coronation','ftvtp04-ebu-innovation','ftvtp05-science-our-world'],
    learning_goal: 'Skille direktesendt produksjon, signaloverføring, programmert begivenhet og kollektiv mottakelse som forskjellige vilkår for historisk samtidighet.',
    planned_claims: [
      ['ftv-tp-pc-05','Hvordan kroningen i 1953 bandt produksjonslogistikk, mottakerkjøp og kollektiv visning til én nasjonal fjernsynsbegivenhet.','live-event-case'],
      ['ftv-tp-pc-06','Hvorfor Telstars transatlantiske signal i 1962 og Our Worlds globale program i 1967 er to forskjellige historiske prestasjoner.','satellite-comparison'],
      ['ftv-tp-pc-07','Hvordan prøvesendingene på Egertorget viser at offentlig samtidighet kunne produseres før regulær norsk fjernsynskringkasting.','norwegian-live-history'],
      ['ftv-tp-pc-08','Hvorfor direktesendt bildeevidens må skilles fra ettertidig opptak, redigert utdrag og publikumsminne.','live-source-criticism']
    ]
  },
  {
    emne_id: 'em_film_tv_dokumentarhistorier_og_sannhetsregimer',
    case_ids: ['case-cinema-verite','case-theresienstadt','case-madeline-anderson'],
    source_ids: ['ftvtp12-nfb-verite','ftvtp13-ushmm-theresienstadt','ftvtp14-nmaahc-anderson'],
    learning_goal: 'Historisere dokumentariske sannhetskrav gjennom teknikk, institusjon, produksjonsmakt og deltagelse uten å overta den neste enhetens næranalyse av evidens og etikk.',
    planned_claims: [
      ['ftv-tp-pc-09','Hvordan cinéma vérité og direct cinema knyttet bærbart utstyr og nye arbeidsformer til et historisk ideal om mindre oppstilt virkelighet.','documentary-movement-history'],
      ['ftv-tp-pc-10','Hvordan Theresienstadt-filmen viser at dokumentarisk overflate kan produseres gjennom tvang, iscenesettelse og bedrag.','propaganda-documentary-case'],
      ['ftv-tp-pc-11','Hvordan Madeline Andersons arbeid forbinder fjernsynsdokumentarens sannhetskrav med tilgang til produksjonsroller og hvilke erfaringer som kunne formidles.','televised-documentary-career'],
      ['ftv-tp-pc-12','Hvorfor dokumentarhistorie må sammenligne institusjon, apparat, arbeidsform og erklært virkelighetsforhold framfor å ordne alt etter en lineær realismeutvikling.','truth-regime-synthesis']
    ]
  },
  {
    emne_id: 'em_film_tv_glemte_forlop_og_historiografisk_revisjon',
    case_ids: ['case-great-migration-home-movies','case-madeline-anderson','case-aapb-local-public-media','case-norwegian-broadcast-archive'],
    source_ids: ['ftvtp02-nb-broadcast-archive','ftvtp11-nmaahc-home-movies','ftvtp14-nmaahc-anderson','ftvtp15-loc-aapb'],
    learning_goal: 'Revidere fjernsyns- og skjermhistorie gjennom lokale, private og marginaliserte spor samtidig som kildefravær og arkivtilgang behandles som historiografiske vilkår.',
    planned_claims: [
      ['ftv-tp-pc-13','Hvordan lokale public-service-programmer og familieopptak kan bryte en nettverks- og prime-time-dominert fjernsynshistorie.','counter-history-comparison'],
      ['ftv-tp-pc-14','Hvordan Madeline Andersons dokumenterte karriere korrigerer en produksjonshistorie som overser arbeid bak kamera og utenfor majoritetens institusjonsfortelling.','career-recovery'],
      ['ftv-tp-pc-15','Hvordan forskjellen mellom bevart sending, programrapport og manglende opptak begrenser hva som kan hevdes om norsk fjernsynshistorie.','archival-absence'],
      ['ftv-tp-pc-16','Hvorfor historiografisk revisjon krever nye kilder og nye analyseenheter, ikke bare at flere navn legges til en uendret kanon.','historiographical-method']
    ]
  },
  {
    emne_id: 'em_film_tv_kommersiell_tv_kabel_og_satellitt',
    case_ids: ['case-us-cable-regulation','case-uk-pay-tv','case-telstar-1962'],
    source_ids: ['ftvtp04-ebu-innovation','ftvtp06-fcc-cable','ftvtp07-ofcom-pay-tv'],
    learning_goal: 'Følge kabel og satellitt som historiske signal-, kanal-, abonnements- og reguleringssystemer uten å gjøre dagens plattformøkonomi til enhetens analyseobjekt.',
    planned_claims: [
      ['ftv-tp-pc-17','Hvordan tidlig amerikansk kabel koblet lokal signaltilgang og mikrobølgeoverføring til ny føderal regulering i 1965.','cable-regulation-case'],
      ['ftv-tp-pc-18','Hvordan britisk betalingsfjernsyn vokste gjennom ulike kabel- og satellittplattformer og endret kanalvalg og abonnementsforhold.','pay-tv-platform-history'],
      ['ftv-tp-pc-19','Hvorfor satellitt som overføringsteknologi må skilles fra satellittfjernsyn som kommersiell kanal- og abonnementsmodell.','technology-market-boundary']
    ]
  },
  {
    emne_id: 'em_film_tv_kringkastingsfjernsynets_historie',
    case_ids: ['case-norwegian-tv-trials','case-coronation-1953','case-norwegian-broadcast-archive','case-aapb-local-public-media'],
    source_ids: ['ftvtp01-nb-first-tv','ftvtp02-nb-broadcast-archive','ftvtp03-science-coronation','ftvtp15-loc-aapb'],
    learning_goal: 'Historisere kringkastingsfjernsyn gjennom sendestart, skjema, husholdning, begivenhet, allmennkringkasting og lokale offentligheter uten å analysere institusjonenes nåværende mandat.',
    planned_claims: [
      ['ftv-tp-pc-20','Hvordan offentlig prøvevisning i 1954 og regulær sendestart i 1960 markerer forskjellige institusjonelle faser i norsk fjernsyn.','norwegian-broadcast-periodization'],
      ['ftv-tp-pc-21','Hvordan kroningen i 1953 viser at kringkastingsfjernsynets husholdning også omfattet puber, kirkehaller og andre kollektive mottakerrom.','domestic-public-viewing'],
      ['ftv-tp-pc-22','Hvordan lokale og regionale public-service-programmer gjør nasjonal fjernsynshistorie flerskalert.','public-service-locality'],
      ['ftv-tp-pc-23','Hvordan sendinger, programrapporter og samlingsomfang må sammenholdes før man trekker konklusjoner om sendeskjema og nasjonal TV-offentlighet.','broadcast-source-method']
    ]
  },
  {
    emne_id: 'em_film_tv_stromming_og_fjernsynets_plattformovergang',
    case_ids: ['case-netflix-hybrid-2007','case-netflix-segments-2011','case-youtube-first-upload','case-norwegian-media-surveys'],
    source_ids: ['ftvtp16-sec-netflix-2008','ftvtp17-sec-netflix-2011','ftvtp18-youtube-ten-years','ftvtp19-pew-online-video','ftvtp20-ssb-media-use'],
    learning_goal: 'Historisere overgangen fra sendeskjema og fysisk katalog til bestilling, strømming og nettvideo gjennom samtidige selskaps- og brukerdata uten å analysere dagens markedsmakt eller anbefalingssystemer.',
    planned_claims: [
      ['ftv-tp-pc-24','Hvordan Netflix i 2007–2008 kombinerte DVD-post, nettkatalog og instant watching i en hybrid abonnementsmodell.','streaming-origin-primary-trace'],
      ['ftv-tp-pc-25','Hvordan rapporteringen i 2011 skilte domestic streaming, international streaming og domestic DVD som egne virksomhetssegmenter.','platform-separation-primary-trace'],
      ['ftv-tp-pc-26','Hvordan YouTubes opplastingsmodell og bruksvekst representerte et parallelt nettvideoforløp som ikke kan reduseres til abonnementsstrømming.','web-video-comparison'],
      ['ftv-tp-pc-27','Hvorfor lanseringsdatoer må sammenholdes med longitudinelle bruksdata før man hevder at en seerpraksis faktisk er erstattet.','transition-method']
    ]
  },
  {
    emne_id: 'em_film_tv_video_hjemmemedier_og_digital_omveltning',
    case_ids: ['case-videotape-formats','case-netflix-hybrid-2007','case-norwegian-broadcast-archive','case-youtube-first-upload'],
    source_ids: ['ftvtp02-nb-broadcast-archive','ftvtp08-bfi-videotape','ftvtp16-sec-netflix-2008','ftvtp18-youtube-ten-years','ftvtp19-pew-online-video'],
    learning_goal: 'Følge hvordan videotape, hjemmeopptak, DVD, digital fil og nettlevering endret produksjon og tilgang uten å overta arkivområdets analyse av digital bevaring.',
    planned_claims: [
      ['ftv-tp-pc-28','Hvordan videotape endret fjernsynets opptak, redigering, gjenbruk og produksjonsrytme før forbrukerformatene flyttet opptak inn i hjemmet.','videotape-history'],
      ['ftv-tp-pc-29','Hvordan DVD-by-mail og instant watching eksisterte samtidig og viser at hjemmemedieovergangen var hybrid, ikke et øyeblikkelig formatbytte.','hybrid-home-media-case'],
      ['ftv-tp-pc-30','Hvordan digital avlevering og katalogmetadata endrer hvilke kringkastede og bestilte programmer som kan gjenfinnes som historiske objekter.','digital-record-boundary'],
      ['ftv-tp-pc-31','Hvordan lavterskel nettvideo flyttet deler av hjemmeopptaket fra privat sirkulasjon til søkbar offentlig distribusjon.','home-to-networked-video']
    ]
  }
]);

function buildTopicBriefs(emneById) {
  return TOPIC_PLANS.map((topic) => {
    const canonical = emneById.get(topic.emne_id);
    assert(canonical, `Mangler canonicalt emne ${topic.emne_id}`);
    return {
      emne_id: topic.emne_id,
      case_ids: topic.case_ids,
      source_ids: topic.source_ids,
      learning_goal: topic.learning_goal,
      planned_claims: topic.planned_claims.map(([id, claim_focus, claim_type]) => ({
        id, claim_focus, claim_type, source_ids: topic.source_ids, status: 'planned_requires_fulltext_verification'
      })),
      title: canonical.title,
      canonical_boundary: canonical.boundary,
      method_ids: canonical.method_ids
    };
  });
}

export function buildFilmTvTelevisionPlatformsParticipationSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Fjernsyn, plattformer og deltakerhistorier');
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDoc = read(P.methods);
  const methodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
  const sourceIds = new Set(SOURCES.map((row) => row.id));
  const caseIds = new Set(CASES.map((row) => row.id));
  const topicBriefs = buildTopicBriefs(emneById);
  const plannedClaims = topicBriefs.flatMap((topic) => topic.planned_claims);
  const currentRegistry = read(P.registry);
  const currentStatus = read(P.status);

  const brief = {
    schema: 'history_go_film_tv_television_platforms_participation_source_claim_brief_v1',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    planned_unit_id: UNIT_ID, future_chapter_id: FUTURE_CHAPTER_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: {
      title: unit.title, primary_domain_ids: unit.primary_domain_ids,
      prerequisite_planned_unit_ids: unit.prerequisite_planned_unit_ids,
      prerequisite_existing_chapter_ids: unit.prerequisite_existing_chapter_ids,
      emne_count: unit.emne_count, emne_ids: unit.emne_ids, overlap_boundary: unit.overlap_boundary
    },
    source_policy: {
      sources_are_inspectable_https: true,
      institutional_archive_regulator_museum_and_primary_filings_prioritized: true,
      technological_transition_requires_documented_institution_program_access_or_use_change: true,
      live_transmission_requires_signal_programme_and_reception_distinctions: true,
      company_origin_claims_require_independent_or_regulatory_context: true,
      home_and_participant_images_require_provenance_and_power_analysis: true,
      current_platform_power_audience_data_and_fan_use_remain_outside_this_unit: true,
      documentary_close_analysis_of_evidence_and_ethics_remains_in_next_unit: true,
      archive_preservation_practice_remains_outside_this_unit: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES,
    case_candidates: CASES,
    topic_briefs: topicBriefs,
    proposed_module_order: [
      { id: 'kringkasting-direkte-og-tv-offentlighet', sequence: 1, emne_ids: [unit.emne_ids[5],unit.emne_ids[1]], purpose: 'Fra prøvesending og sendestart til direktesendt nasjonal, transatlantisk og global samtidighet, med skille mellom signal, program og mottakelse.' },
      { id: 'dokumentar-revisjon-og-deltakerbilder', sequence: 2, emne_ids: [unit.emne_ids[2],unit.emne_ids[3],unit.emne_ids[0]], purpose: 'Historiserer sannhetsregimer og gjør private, lokale og marginaliserte bilder til kilder som kan revidere fjernsynshistorien.' },
      { id: 'kabel-hjemmemedier-og-plattformovergang', sequence: 3, emne_ids: [unit.emne_ids[4],unit.emne_ids[7],unit.emne_ids[6]], purpose: 'Følger kabel, satellitt, videotape, DVD, strømming og nettvideo som overlappende distribusjons- og brukssystemer.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true,
      paragraph_and_claim_counts_follow_problem_complexity: true,
      current_claim_plan_counts_by_emne: topicBriefs.map((row) => ({ emne_id: row.emne_id, planned_claim_count: row.planned_claims.length })),
      paragraph_claim_trace_required: true,
      every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      chronology_must_distinguish_launch_signal_service_adoption_and_later_historiography: true,
      transitions_must_keep_technology_institution_program_access_and_use_distinct: true,
      corporate_primary_sources_must_not_define_the_whole_transition: true,
      current_platform_market_power_and_recommendation_analysis_remain_outside_scope: true,
      current_fan_practice_and_audience_data_analysis_remain_outside_scope: true,
      documentary_evidence_and_ethics_close_analysis_remains_for_next_unit: true,
      archive_preservation_practice_remains_outside_scope: true,
      chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_fjernsyn_plattformer_og_deltakerhistorier'
  };

  const registry = structuredClone(currentRegistry);
  registry.version = '2.84.0';
  registry.updatedAt = '2026-08-11';
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Filmhistorie, bevegelser og historiografi er registrert etter fulltekstporten. Fjernsyn, plattformer og deltakerhistorier har nå en egen kilde- og claimbrief for 8 canonicale emner med 20 inspectable bibliotek-, arkiv-, museums-, kringkastings-, regulator-, statistikk- og primærkilder, 19 sending-, format-, institusjons-, hjemmefilm- og plattformcase og 31 variabelt fordelte claimplaner. Claimplanene er uverifiserte, og kapitlet er ikke runtime-registrert. Neste port er fulltekst med avsnittsnivå claimtrace og ny audit; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.fifthSourceClaimBrief = P.brief;

  const status = structuredClone(currentStatus);
  status.version = '1.72.0';
  status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.nextGate = SOURCE_BRIEF_GATE;
  filmStatus.note = 'Kilde- og claimbriefen for Fjernsyn, plattformer og deltakerhistorier er komplett: 8 canonicale emner, 20 inspectable kilder, 19 case og 31 claimplaner fordelt 4–4–4–4–3–4–4–4 etter faglig behov. Planlagte claims er ikke verifiserte claims, og kapitlet er ikke registrert. Neste port er fulltekst, faktisk kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.';

  const usedSourceIds = new Set([...topicBriefs.flatMap((topic) => topic.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const evidenceRoles = new Set(SOURCES.map((row) => row.evidence_role));
  const report = {
    schema: 'history_go_film_tv_television_platforms_participation_source_brief_v1_audit',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    summary: {
      emne_count: unit.emne_count, source_count: SOURCES.length, case_count: CASES.length,
      planned_claim_count: plannedClaims.length, planned_claim_counts_by_emne: claimCounts,
      proposed_module_count: brief.proposed_module_order.length, registered_chapter_count_delta: 0
    },
    coverage: topicBriefs.map((topic) => ({
      emne_id: topic.emne_id, method_count: topic.method_ids.length, source_count: topic.source_ids.length,
      case_count: topic.case_ids.length, planned_claim_count: topic.planned_claims.length
    })),
    gates: {
      fifth_learning_order_unit_selected: plan.production_sequence[4] === UNIT_ID,
      required_prerequisite_chapters_registered: unit.prerequisite_planned_unit_ids.every((id) => currentRegistry.subjects.film_tv.chapters.some((row) => row.id === id)) && unit.prerequisite_existing_chapter_ids.every((id) => currentRegistry.subjects.film_tv.chapters.some((row) => row.id === id)),
      exact_unit_emne_coverage: topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
      all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
      all_methods_resolve: topicBriefs.every((row) => row.method_ids.every((id) => methodIds.has(id))),
      inspectable_https_sources: SOURCES.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-11' && row.source_location),
      archive_regulatory_primary_and_historiographical_roles_present: [...evidenceRoles].some((role) => /archive-record|object-record|primary-trace/.test(role)) && [...evidenceRoles].some((role) => /historiography/.test(role)) && [...evidenceRoles].some((role) => /regulatory/.test(role)),
      every_source_used: SOURCES.every((row) => usedSourceIds.has(row.id)),
      every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
      every_case_documented: CASES.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))),
      broadcast_live_documentary_revision_cable_home_video_streaming_and_participation_cases_present: ['broadcast','live','documentary','counter-history','cable','home','streaming','participatory'].every((needle) => CASES.some((row) => `${row.medium} ${row.purpose}`.toLowerCase().includes(needle))),
      every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
      every_case_source_available_to_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((caseId) => CASES.find((row) => row.id === caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))),
      claim_counts_follow_variable_problem_scope: new Set(claimCounts).size > 1 && Math.min(...claimCounts) >= 3,
      no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
      all_planned_claim_ids_unique: new Set(plannedClaims.map((row) => row.id)).size === plannedClaims.length,
      all_topics_have_boundaries_sources_cases_and_methods: topicBriefs.every((row) => row.canonical_boundary && row.source_ids.length >= 3 && row.case_ids.length >= 3 && row.method_ids.length >= 1),
      module_order_covers_every_emne_once: moduleEmneIds.length === unit.emne_count && new Set(moduleEmneIds).size === unit.emne_count && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
      module_sizes_are_not_forced_equal: new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
      scope_boundaries_preserved: brief.source_policy.current_platform_power_audience_data_and_fan_use_remain_outside_this_unit && brief.source_policy.documentary_close_analysis_of_evidence_and_ethics_remains_in_next_unit && brief.source_policy.archive_preservation_practice_remains_outside_this_unit,
      chapter_remains_unregistered: !registry.subjects.film_tv.chapters.some((row) => row.id === FUTURE_CHAPTER_ID),
      registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered && !brief.runtime_registration.allowed_before_full_chapter_gate && brief.production_requirements.chapter_registration_only_after_audit
    },
    next_gate: brief.next_gate
  };
  return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvTelevisionPlatformsParticipationSourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, SOURCE_BRIEF_GATE, FULLTEXT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if (currentGate === FULLTEXT_GATE) {
    const brief = read(P.brief);
    const report = read(P.report);
    assert(brief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Fjernsynsbriefen skal være konsumert etter fulltekstporten');
    assert(brief.runtime_registration.registered === true && brief.runtime_registration.chapter_id === FUTURE_CHAPTER_ID, 'Fjernsynsbriefen mangler etterfølgende kapittelregistrering');
    assert(report.status === 'source_claim_brief_consumed_by_verified_chapter' && Object.values(report.gates).every(Boolean), 'Fjernsynsbriefens etteraudit er ikke grønn');
    return { brief, report, registry: read(P.registry), status: read(P.status), unit: read(P.plan).planned_units.find((row) => row.id === UNIT_ID), topicBriefs: brief.topic_briefs, plannedClaims: brief.topic_briefs.flatMap((row) => row.planned_claims) };
  }
  const built = buildFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  const outputs = { [P.brief]: built.brief, [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én fjernsynsbriefport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV fjernsynsbrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV fjernsynsbrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
