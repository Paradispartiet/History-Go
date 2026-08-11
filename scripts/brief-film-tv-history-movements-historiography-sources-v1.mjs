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
  brief: 'data/fag/TV_og_Film/film_tv_history_movements_historiography_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-history-movements-historiography-source-brief-v1-audit.json'
});
const UNIT_ID = 'filmhistorie-bevegelser-og-historiografi';
const FUTURE_CHAPTER_ID = UNIT_ID;
const INPUT_GATE = 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief';
const SOURCE_BRIEF_GATE = 'film_history_movements_historiography_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const SOURCES = Object.freeze([
  {
    id: 'ftvhmh01-nsmm-lumiere', publisher: 'National Science and Media Museum',
    title: 'The Lumière Brothers: Pioneers of cinema and colour photography', url: 'https://blog.scienceandmediamuseum.org.uk/the-lumiere-brothers-pioneers-of-cinema-and-colour-photography/',
    type: 'national-museum-early-cinema-history', evidence_role: 'institutional-historiography',
    source_location: 'Cinématographe and Making early films sections on projection, apparatus mobility, Workers Leaving the Factory, short views and the 1895 Paris programme', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh02-bfi-melies', publisher: 'British Film Institute',
    title: 'Georges Méliès on his early struggles in cinema', url: 'https://www.bfi.org.uk/features/georges-melies-autobiography',
    type: 'national-film-institute-primary-extract', evidence_role: 'historical-primary-trace',
    source_location: 'Introduced autobiographical extract and A Trip to the Moon production context, used as a situated first-person source rather than a total early-film history', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh03-wfpp-about', publisher: 'Columbia University / Women Film Pioneers Project',
    title: 'About the Women Film Pioneers Project', url: 'https://wfpp.columbia.edu/about/',
    type: 'university-scholarly-recovery-project', evidence_role: 'scholarly-historiography',
    source_location: 'Project scope and editorial method for recovering women working globally at all levels of silent-era film production', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh04-wfpp-alice-guy', publisher: 'Columbia University / Women Film Pioneers Project',
    title: 'Alice Guy Blaché', url: 'https://wfpp.columbia.edu/pioneer/ccp-alice-guy-blache/',
    type: 'university-researched-pioneer-profile', evidence_role: 'scholarly-historiography',
    source_location: 'Chronology of Guy Blaché from Gaumont production through Solax, with filmography, archival uncertainty and historiographical recovery', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh05-loc-registry', publisher: 'Library of Congress / National Film Preservation Board',
    title: 'Brief Descriptions and Expanded Essays of National Film Registry Titles', url: 'https://www.loc.gov/programs/national-film-preservation-board/film-registry/descriptions-and-essays/',
    type: 'national-film-archive-registry', evidence_role: 'institutional-object-record',
    source_location: 'Entries and expanded essays for Gertie the Dinosaur, Gerald McBoing-Boing, Sunrise and The Jazz Singer, including technique, sound systems and historical framing', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh06-academy-hollywoodland', publisher: 'Academy Museum of Motion Pictures',
    title: 'Hollywoodland: Jewish Founders and the Making of a Movie Capital', url: 'https://www.academymuseum.org/exhibitions/hollywoodland',
    type: 'film-museum-studio-history', evidence_role: 'institutional-historiography',
    source_location: 'Exhibition overview on Jewish immigrant founders, independent production, studio formation and Los Angeles as a movie capital', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh07-academy-studios', publisher: 'Academy Museum of Motion Pictures',
    title: 'Hollywoodland: The Origins of the Studios', url: 'https://www.academymuseum.org/programs/series/hollywoodland-the-origins-of-the-studios',
    type: 'film-museum-studio-series', evidence_role: 'institutional-historiography',
    source_location: 'Series overview identifying the consolidation of eight US studios by the end of the 1920s and pairing each studio with a historical film case', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh08-academy-regeneration', publisher: 'Academy Museum of Motion Pictures',
    title: 'Regeneration: Black Cinema 1898–1971', url: 'https://www.academymuseum.org/en/exhibitions/regeneration-black-cinema',
    type: 'film-museum-recovery-historiography', evidence_role: 'institutional-historiography',
    source_location: 'Exhibition scope from early Black participation through independent production and the civil-rights era, including recovery of forgotten films and makers', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh09-bfi-french-new-wave', publisher: 'British Film Institute',
    title: '10 great French New Wave films', url: 'https://www.bfi.org.uk/lists/10-great-french-new-wave-films',
    type: 'national-film-institute-movement-history', evidence_role: 'institutional-historiography',
    source_location: 'Hiroshima mon amour, Breathless and related entries on documentary inheritance, street shooting, handheld camera, editing, cinephilia and genre revision', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh10-bfi-cinema-novo', publisher: 'British Film Institute',
    title: '10 great Cinema Novo films', url: 'https://www.bfi.org.uk/lists/10-great-cinema-novo-films',
    type: 'national-film-institute-movement-history', evidence_role: 'institutional-historiography',
    source_location: 'Movement introduction and Black God, White Devil entry on artisanal production, neocolonial context, radical style and later reassessment', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh11-harvard-med-hondo', publisher: 'Harvard Film Archive',
    title: 'Med Hondo and the Indocile Image', url: 'https://harvardfilmarchive.org/programs/med-hondo-and-the-indocile-image',
    type: 'university-film-archive-retrospective', evidence_role: 'scholarly-historiography',
    source_location: 'Career chronology, Soleil O, production and distribution constraints, Pan-African institutions and the indocile-image framework', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh12-bfi-indian-cinema', publisher: 'British Film Institute',
    title: '12 dazzling vintage film posters from the golden age of Indian cinema', url: 'https://www.bfi.org.uk/features/indian-cinema-posters',
    type: 'national-film-archive-material-history', evidence_role: 'institutional-historiography',
    source_location: 'Indian moving-picture exhibition from 1896, early shorts, Raja Harishchandra, sound-era genre shifts and poster/booklet circulation', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh13-dfi-danish-silent', publisher: 'Danish Film Institute',
    title: 'Discover the golden age of Danish silent films', url: 'https://www.dfi.dk/en/english/discover-golden-age-danish-silent-films',
    type: 'national-film-institute-silent-history', evidence_role: 'institutional-historiography',
    source_location: 'Overview of Danish silent-film circulation, international popularity, Asta Nielsen, Valdemar Psilander and Carl Th. Dreyer', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh14-dfi-1910-1920', publisher: 'Danish Film Institute',
    title: 'Danish Film History: 1910–1920', url: 'https://www.dfi.dk/en/english/danish-film-history/danish-film-history-1910-1920',
    type: 'national-film-institute-period-history', evidence_role: 'institutional-historiography',
    source_location: 'Period account of longer films, Nordisk Film, stars, directors, export and the changing Danish production system', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh15-nordic-women', publisher: 'Nordic Women in Film / Swedish Film Institute',
    title: 'Articles', url: 'https://nordicwomeninfilm.com/articles/',
    type: 'nordic-film-history-recovery-portal', evidence_role: 'scholarly-historiography',
    source_location: 'In-depth entries on women exhibition pioneers and cinema musicians in the 1905–1915 silent era, used to test auteur- and production-only Nordic periodization', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh16-nb-markens-grode', publisher: 'Nasjonalbiblioteket / Norsk filmografi',
    title: 'Markens grøde', url: 'https://www.nb.no/filmografi/show?id=793756',
    type: 'national-filmography-record', evidence_role: 'institutional-object-record',
    source_location: 'Filmographic record for the 1921 tinted silent feature: production country, adaptation source, credits, company, premiere, length and format category', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh17-nb-transnational', publisher: 'Nasjonalbiblioteket',
    title: 'Norsk litteratur og utenlandsk film 1900–1950', url: 'https://www.nb.no/hva-skjer/norsk-litteratur-og-utenlandsk-film-1900-1950/',
    type: 'national-library-research-programme', evidence_role: 'scholarly-historiography',
    source_location: 'Research-programme overview of almost one hundred foreign adaptations of Norwegian literature, unrealised projects, archive traces and transnational circulation', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh18-nfi-history', publisher: 'Norsk filminstitutt',
    title: 'Norsk filminstitutts historie', url: 'https://www.nfi.no/om-oss/hva-er-vi/nfis-historie',
    type: 'national-film-institute-institution-history', evidence_role: 'institutional-historiography',
    source_location: 'Institutional chronology including the 1996 Filmens Hus opening, cinema infrastructure, museum and later mandate changes', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh19-nfi-anja-breien', publisher: 'Norsk filminstitutt / Cinemateket',
    title: 'Anja Breien (1940–2026): Hun levde og åndet for filmkunsten', url: 'https://www.nfi.no/nyheter/anja-breien-1940-2026-hun-levde-og-aandet-for-filmkunsten',
    type: 'national-cinematheque-career-history', evidence_role: 'institutional-historiography',
    source_location: 'Career account from Vokse opp and Voldtekt through Hustruer, Arven, later shorts, international circulation and retrospective canonisation', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvhmh20-bfi-snowman', publisher: 'British Film Institute',
    title: 'How The Snowman was built', url: 'https://www.bfi.org.uk/features/raymond-briggs-the-snowman-christmas',
    type: 'national-film-institute-production-history', evidence_role: 'historical-production-trace',
    source_location: 'Production account of storyboard, pencil animation, cel rendering, rostrum photography, music timing, budget and Channel 4 delivery', retrieval_status: 'verified_2026-08-11'
  }
]);

const CASES = Object.freeze([
  { id: 'case-lumiere-views', work: 'Lumière factory, family, train and comedy views', medium: 'early-cinema-programme', years: '1895–1897', source_ids: ['ftvhmh01-nsmm-lumiere'], purpose: 'Skille apparat, opptak, projeksjon, kortform og omreisende/programmatisk visning i tidlig film.' },
  { id: 'case-melies-moon', work: 'A Trip to the Moon', medium: 'early-trick-film', year: 1902, source_ids: ['ftvhmh02-bfi-melies'], purpose: 'Bruke et situert førstepersonsspor til å undersøke illusjon, studioarbeid og ettertidig pionerfortelling.' },
  { id: 'case-alice-guy', work: 'Alice Guy Blachés Gaumont- og Solax-arbeid', medium: 'early-film-production-career', years: '1896–1920', source_ids: ['ftvhmh03-wfpp-about','ftvhmh04-wfpp-alice-guy'], purpose: 'Vise hvordan filmografi, selskapsroller og arkivfravær kan revidere en mannsdominert opphavshistorie.' },
  { id: 'case-gertie-upa', work: 'Gertie the Dinosaur / Gerald McBoing-Boing', medium: 'animation-technique-and-studio-comparison', years: '1914–1950', source_ids: ['ftvhmh05-loc-registry'], purpose: 'Sammenligne tidlig karakterbevegelse og cycling med UPAs stiliserte mid-century studioalternativ.' },
  { id: 'case-snowman', work: 'The Snowman', medium: 'television-animation-production', year: 1982, source_ids: ['ftvhmh20-bfi-snowman'], purpose: 'Koble papir, cel, musikk, rostrumkamera, arbeidsmengde og TV-leveranse i en konkret animasjonshistorie.' },
  { id: 'case-jazz-sunrise', work: 'The Jazz Singer / Sunrise', medium: 'silent-to-sound-transition', year: 1927, source_ids: ['ftvhmh05-loc-registry'], purpose: 'Skille part-talkie, lyd-på-plate og optisk lydspor fra ideen om ett øyeblikkelig globalt lydskifte.' },
  { id: 'case-hollywood-studios', work: 'Eight-studio Hollywood system', medium: 'studio-system-institutional-history', years: '1920s–1940s', source_ids: ['ftvhmh06-academy-hollywoodland','ftvhmh07-academy-studios'], purpose: 'Koble studioorganisering, immigrantgründere, geografi og filmutvalg uten å gjøre Hollywood-perioden universell.' },
  { id: 'case-regeneration', work: 'Regeneration: Black Cinema 1898–1971', medium: 'historiographical-recovery-exhibition', years: '1898–1971', source_ids: ['ftvhmh08-academy-regeneration'], purpose: 'Analysere hvordan kuratering og gjenfunne verk endrer fortellingen om hvem som deltok i amerikansk filmhistorie.' },
  { id: 'case-french-new-wave', work: 'Hiroshima mon amour / Breathless', medium: 'film-movement-comparison', years: '1959–1960', source_ids: ['ftvhmh09-bfi-french-new-wave'], purpose: 'Sammenligne dokumentararv, gatemiljø, produksjonsvalg, klipp og cinefili innen en uensartet ny bølge.' },
  { id: 'case-cinema-novo', work: 'Black God, White Devil and Cinema Novo', medium: 'decolonial-film-movement', years: '1960s', source_ids: ['ftvhmh10-bfi-cinema-novo'], purpose: 'Koble neokolonial kontekst, produksjonsmåte og radikal stil og følge bevegelsens senere historiografiske revisjon.' },
  { id: 'case-soleil-o', work: 'Soleil O and Med Hondos Pan-African cinema', medium: 'pan-african-transnational-cinema', years: '1965–2004', source_ids: ['ftvhmh11-harvard-med-hondo'], purpose: 'Følge migrasjon, formeksperiment, finansiering, distribusjon og panafrikanske institusjoner på tvers av nasjonal ramme.' },
  { id: 'case-indian-early-sound', work: 'Raja Harishchandra and Indian poster/booklet culture', medium: 'national-and-transnational-film-history', years: '1896–1950s', source_ids: ['ftvhmh12-bfi-indian-cinema'], purpose: 'Historisere tidlig produksjon, lydskifte, sjanger og publikumsadressat uten å bruke Hollywoods perioder som standard.' },
  { id: 'case-danish-golden-age', work: 'Danish silent-film golden age, Asta Nielsen and Nordisk Film', medium: 'nordic-silent-film-industry', years: '1910–1920', source_ids: ['ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920'], purpose: 'Koble lengre filmer, stjerner, selskap og eksport i et nordisk forløp med sterk internasjonal sirkulasjon.' },
  { id: 'case-nordic-women', work: 'Nordic women exhibitors and cinema musicians', medium: 'nordic-silent-film-recovery', years: '1905–1915', source_ids: ['ftvhmh15-nordic-women'], purpose: 'Utfordre en nordisk historie ordnet bare etter regissører, nasjonale verk og produksjonsselskaper.' },
  { id: 'case-markens-grode', work: 'Markens grøde', medium: 'norwegian-silent-feature', year: 1921, source_ids: ['ftvhmh16-nb-markens-grode'], purpose: 'Forankre norsk stumfilm i filmografiske data om adaptasjon, produksjon, tinting, premiere og format.' },
  { id: 'case-norwegian-transnational', work: 'Norwegian literature in foreign film 1900–1950', medium: 'transnational-adaptation-history', years: '1900–1950', source_ids: ['ftvhmh17-nb-transnational'], purpose: 'Vise at norsk filmrelatert historie også består av utenlandsk produksjon, urealiserte prosjekter og arkivspor.' },
  { id: 'case-filmens-hus', work: 'Filmens Hus and Norsk filminstitutt', medium: 'national-film-institution-place', years: '1996–', source_ids: ['ftvhmh18-nfi-history'], purpose: 'Koble institusjonshistorie, visningsrom, museum og endrede forvaltningsoppgaver til et konkret sted.' },
  { id: 'case-hustruer', work: 'Hustruer and Anja Breiens career', medium: 'norwegian-modernist-career-and-reception', years: '1967–2001', source_ids: ['ftvhmh19-nfi-anja-breien'], purpose: 'Koble verkform, produksjonskarriere, internasjonal distribusjon og senere retrospektiv kanonisering.' }
]);

const TOPIC_PLANS = Object.freeze([
  {
    emne_id: 'em_film_tv_animasjonshistorier_teknikker_og_industrier', case_ids: ['case-gertie-upa','case-snowman'],
    source_ids: ['ftvhmh05-loc-registry','ftvhmh20-bfi-snowman','ftvhmh03-wfpp-about'],
    learning_goal: 'Sammenligne animasjonshistoriske teknikker, arbeidsformer og industrimiljøer uten å skrive én lineær overgang fra tegning til digitalt bilde.',
    planned_claims: [
      ['ftv-hmh-pc-01','Hvordan Gertie the Dinosaur kombinerte cycling, karakterbevegelse og liveframføring i en tidlig animasjonspraksis.','animation-technique-case'],
      ['ftv-hmh-pc-02','Hvordan UPA gjorde stilisert tegning og farge til et industrielt og estetisk alternativ til naturaliserende studiostil.','animation-studio-case'],
      ['ftv-hmh-pc-03','Hvordan The Snowman forbinder papir, cel, musikk, rostrumkamera, arbeidsmengde og kringkastingsleveranse.','television-animation-case'],
      ['ftv-hmh-pc-04','Hvorfor animasjonshistorie må følge teknikk, arbeid, selskap, format og visningskontekst samtidig.','historical-synthesis']
    ]
  },
  {
    emne_id: 'em_film_tv_globale_transnasjonale_og_dekoloniale_skjermhistorier', case_ids: ['case-cinema-novo','case-soleil-o','case-indian-early-sound','case-regeneration'],
    source_ids: ['ftvhmh08-academy-regeneration','ftvhmh10-bfi-cinema-novo','ftvhmh11-harvard-med-hondo','ftvhmh12-bfi-indian-cinema'],
    learning_goal: 'Bygge skjermhistorie gjennom koloniale maktforhold, sirkulasjon, språk, produksjon og motinstitusjoner i stedet for å legge resten av verden til en vestlig hovedlinje.',
    planned_claims: [
      ['ftv-hmh-pc-05','Hvorfor global filmhistorie ikke kan organiseres som nasjonale tillegg til en ferdig europeisk-amerikansk standardperiodisering.','decolonial-historiography'],
      ['ftv-hmh-pc-06','Hvordan Cinema Novo knyttet neokolonial situasjon til artisanal produksjon og radikal form.','latin-american-movement-case'],
      ['ftv-hmh-pc-07','Hvordan Med Hondos migrasjon, finansiering, distribusjon og panafrikanske organisering gjør Soleil O til mer enn et nasjonalt auteurverk.','pan-african-case'],
      ['ftv-hmh-pc-08','Hvordan indisk tidlig film, lydskifte og plakat-/heftesirkulasjon viser et eget historisk forløp med transnasjonale forbindelser.','south-asian-history-case']
    ]
  },
  {
    emne_id: 'em_film_tv_historiografi_periodisering_og_kildekritikk', case_ids: ['case-alice-guy','case-regeneration','case-nordic-women'],
    source_ids: ['ftvhmh03-wfpp-about','ftvhmh04-wfpp-alice-guy','ftvhmh08-academy-regeneration','ftvhmh15-nordic-women','ftvhmh05-loc-registry'],
    learning_goal: 'Behandle perioder og kanoner som kildeavhengige argumenter og skille filmobjekt, metadata, førstehåndsspor, kuratering og senere fortolkning.',
    planned_claims: [
      ['ftv-hmh-pc-09','Hvorfor en filmhistorisk periode er en argumenterende inndeling basert på valgte brudd, kilder og analyseenheter, ikke bare en datoetikett.','historiographical-concept'],
      ['ftv-hmh-pc-10','Hvordan Women Film Pioneers bruker filmografi, arbeidsroller og arkivfravær til å revidere silent-era kanon.','recovery-project-case'],
      ['ftv-hmh-pc-11','Hvordan Regeneration bruker gjenfunne verk og kuratering til å flytte Black deltakelse fra rand til grunnstruktur i amerikansk filmhistorie.','canon-revision-case'],
      ['ftv-hmh-pc-12','Hvordan registertekst, utstillingsfortelling, filmografisk record og selvbiografisk spor har forskjellig rekkevidde og må kildekritiseres ulikt.','source-criticism']
    ]
  },
  {
    emne_id: 'em_film_tv_klassisk_film_studiosystem_og_sjangerindustri', case_ids: ['case-hollywood-studios','case-jazz-sunrise','case-regeneration'],
    source_ids: ['ftvhmh05-loc-registry','ftvhmh06-academy-hollywoodland','ftvhmh07-academy-studios','ftvhmh08-academy-regeneration'],
    learning_goal: 'Koble klassisk amerikansk filmform til studioorganisering, migrasjon, teknologi, sjanger og utelatelser uten å gjøre Hollywood til universell norm.',
    planned_claims: [
      ['ftv-hmh-pc-13','Hvordan åtte-studiosystemet konsoliderte produksjon og filmutvalg i USA mot slutten av 1920-årene.','studio-system-case'],
      ['ftv-hmh-pc-14','Hvordan immigrantgründere, Los Angeles-geografi og uavhengig produksjon kompliserer en rent stilhistorisk Hollywood-fortelling.','institutional-history'],
      ['ftv-hmh-pc-15','Hvordan Black uavhengig produksjon og gjenfunne verk viser hva en studio- og sjangerkanon kan utelate.','counter-history']
    ]
  },
  {
    emne_id: 'em_film_tv_modernisme_nye_bolger_og_alternative_filmbevegelser', case_ids: ['case-french-new-wave','case-cinema-novo','case-soleil-o','case-hustruer'],
    source_ids: ['ftvhmh09-bfi-french-new-wave','ftvhmh10-bfi-cinema-novo','ftvhmh11-harvard-med-hondo','ftvhmh19-nfi-anja-breien'],
    learning_goal: 'Sammenligne bevegelsers formbrudd, produksjonsvilkår og politiske prosjekter uten å gjøre ett manifest, land eller regissørnavn til hele bevegelsen.',
    planned_claims: [
      ['ftv-hmh-pc-16','Hvordan Hiroshima mon amour og Breathless viser ulike forbindelser mellom dokumentararv, cinefili, gatemiljø og formbrudd i fransk nybølge.','new-wave-comparison'],
      ['ftv-hmh-pc-17','Hvordan Cinema Novo koblet en radikal estetikk til brasiliansk neokolonial og politisk situasjon.','movement-context-case'],
      ['ftv-hmh-pc-18','Hvordan Med Hondo kombinerte avantgardestrategier med panafrikansk institusjonsbygging og distribusjonskamp.','alternative-movement-case'],
      ['ftv-hmh-pc-19','Hvordan Anja Breiens Hustruer kan plasseres i europeisk modernisme og norsk offentlighet uten å reduseres til en avlegger av fransk nybølge.','norwegian-comparative-case']
    ]
  },
  {
    emne_id: 'em_film_tv_nasjonale_film_tv_historier_og_sammenligning', case_ids: ['case-indian-early-sound','case-danish-golden-age','case-norwegian-transnational'],
    source_ids: ['ftvhmh12-bfi-indian-cinema','ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920','ftvhmh17-nb-transnational'],
    learning_goal: 'Sammenligne nasjonale historier med stabil analyseenhet og følge sirkulasjon, adaptasjon og institusjoner over grensene.',
    planned_claims: [
      ['ftv-hmh-pc-20','Hvorfor nasjonale filmhistorier må sammenlignes på samme nivå—verk, selskap, visning eller politikk—framfor å gjøre land til forklaring.','comparative-method'],
      ['ftv-hmh-pc-21','Hvordan dansk eksport, indisk plakatkultur og utenlandske filmatiseringer av norsk litteratur viser forskjellige transnasjonale forbindelser.','transnational-comparison'],
      ['ftv-hmh-pc-22','Hvordan lydskifte og spillefilmformat fikk ulik kronologi og industriell betydning i forskjellige nasjonale sammenhenger.','periodization-comparison']
    ]
  },
  {
    emne_id: 'em_film_tv_nordisk_film_og_tv_historie', case_ids: ['case-danish-golden-age','case-nordic-women','case-norwegian-transnational'],
    source_ids: ['ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920','ftvhmh15-nordic-women','ftvhmh17-nb-transnational'],
    learning_goal: 'Sammenholde nordiske produksjoner, arbeidsroller, språk og sirkulasjon uten å behandle Norden som en homogen estetisk enhet.',
    planned_claims: [
      ['ftv-hmh-pc-23','Hvordan dansk stumfilm fikk internasjonal tyngde gjennom selskap, stjerner, lengre format og eksport.','danish-industry-case'],
      ['ftv-hmh-pc-24','Hvordan utstillere og kinomusikere utvider nordisk filmhistorie utover regissører og produksjonsselskaper.','nordic-labour-recovery'],
      ['ftv-hmh-pc-25','Hvordan norsk litteratur i svenske, danske og andre utenlandske produksjoner gjør nordisk filmhistorie relasjonell og arkivavhengig.','nordic-transnational-case']
    ]
  },
  {
    emne_id: 'em_film_tv_norsk_filmhistorie_produksjon_verk_og_offentlighet', case_ids: ['case-markens-grode','case-filmens-hus','case-hustruer','case-norwegian-transnational'],
    source_ids: ['ftvhmh16-nb-markens-grode','ftvhmh17-nb-transnational','ftvhmh18-nfi-history','ftvhmh19-nfi-anja-breien'],
    learning_goal: 'Følge norsk film gjennom verk, produksjon, visning, institusjon, offentlighet og internasjonal sirkulasjon uten å gjøre en nasjonal kanon komplett.',
    planned_claims: [
      ['ftv-hmh-pc-26','Hvordan Markens grøde forankrer 1920-årenes norske film i adaptasjon, produksjon, tinting og premiereopplysninger.','norwegian-silent-case'],
      ['ftv-hmh-pc-27','Hvordan Hustruers form, distribusjon og senere retrospektive status forbinder verkhistorie med offentlighet og kanonisering.','norwegian-modernism-case'],
      ['ftv-hmh-pc-28','Hvordan Filmens Hus og utenlandske filmatiseringer viser at norsk filmhistorie også består av institusjoner, visningsrom og transnasjonale arkivspor.','institution-and-circulation']
    ]
  },
  {
    emne_id: 'em_film_tv_stumfilm_lydovergang_og_modernitet', case_ids: ['case-jazz-sunrise','case-danish-golden-age','case-markens-grode'],
    source_ids: ['ftvhmh01-nsmm-lumiere','ftvhmh05-loc-registry','ftvhmh13-dfi-danish-silent','ftvhmh14-dfi-1910-1920','ftvhmh16-nb-markens-grode'],
    learning_goal: 'Analysere stumfilm og synkronisert lyd som flerårige, tekniske og nasjonalt ulike overganger heller enn en enkel før–etter-dato.',
    planned_claims: [
      ['ftv-hmh-pc-29','Hvordan The Jazz Singer og Sunrise representerer ulike lydsystemer og ulike grader av synkronisert lyd i 1927.','sound-transition-case'],
      ['ftv-hmh-pc-30','Hvorfor stumfilm ikke var lydløs praksis, og hvorfor lydskiftet må skilles fra bortfall av lokalt akkompagnement og mellomtekster.','historical-concept'],
      ['ftv-hmh-pc-31','Hvordan dansk og norsk stumfilm viser at teknologisk overgang ikke følger én amerikansk premiere som universell periodeterskel.','comparative-transition']
    ]
  },
  {
    emne_id: 'em_film_tv_tidlig_film_attraksjoner_og_visningskultur', case_ids: ['case-lumiere-views','case-melies-moon','case-alice-guy'],
    source_ids: ['ftvhmh01-nsmm-lumiere','ftvhmh02-bfi-melies','ftvhmh03-wfpp-about','ftvhmh04-wfpp-alice-guy'],
    learning_goal: 'Historisere tidlig film gjennom apparat, kortform, program, scene, reise, arbeid og selskapsroller før spillefilmen blir norm.',
    planned_claims: [
      ['ftv-hmh-pc-32','Hvordan Cinématographe samlet opptak, kopiering og projeksjon og muliggjorde korte programmer på tvers av steder.','apparatus-and-exhibition'],
      ['ftv-hmh-pc-33','Hvordan Lumière-visninger, Méliès’ illusjonsfilm og Guy Blachés produksjonsarbeid viser flere samtidige tidligfilmpraksiser.','early-cinema-comparison'],
      ['ftv-hmh-pc-34','Hvorfor tidlig film ikke bare er uferdig fortellende spillefilm, men korte attraksjoner, aktualiteter, komedier, triks og programkultur.','historiographical-boundary'],
      ['ftv-hmh-pc-35','Hvordan selvbiografi, apparathistorie og recovery-filmografi må sammenholdes uten at ett pionernavn blir hele opphavshistorien.','source-critical-synthesis']
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

export function buildFilmTvHistoryMovementsHistoriographySourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Filmhistorie, bevegelser og historiografi');
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
    schema: 'history_go_film_tv_history_movements_historiography_source_claim_brief_v1',
    version: '1.0.0', updated_at: '2026-08-11', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv',
    planned_unit_id: UNIT_ID, future_chapter_id: FUTURE_CHAPTER_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: {
      title: unit.title, primary_domain_ids: unit.primary_domain_ids,
      prerequisite_planned_unit_ids: unit.prerequisite_planned_unit_ids,
      emne_count: unit.emne_count, emne_ids: unit.emne_ids, overlap_boundary: unit.overlap_boundary
    },
    source_policy: {
      sources_are_inspectable_https: true,
      institutional_university_archive_and_scholarly_sources_prioritized: true,
      periodization_requires_object_records_and_historiography: true,
      national_histories_require_stable_comparison_units: true,
      decolonial_history_is_structural_not_an_additive_sidebar: true,
      pioneer_claims_require_role_and_source_criticism: true,
      archive_management_and_preservation_practice_remain_outside_this_unit: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES,
    case_candidates: CASES,
    topic_briefs: topicBriefs,
    proposed_module_order: [
      { id: 'tidlig-film-stumfilm-lyd-og-studio', sequence: 1, emne_ids: [unit.emne_ids[9],unit.emne_ids[8],unit.emne_ids[3]], purpose: 'Fra apparat, kortform og visningsprogram via stum-/lydoverganger til amerikansk studiokonsolidering uten universell Hollywood-tidslinje.' },
      { id: 'modernisme-bevegelser-og-dekoloniale-forlop', sequence: 2, emne_ids: [unit.emne_ids[4],unit.emne_ids[1]], purpose: 'Sammenligner formbrudd, produksjonsvilkår, koloniale maktforhold og transnasjonale motinstitusjoner.' },
      { id: 'nasjonale-nordiske-og-norske-historier', sequence: 3, emne_ids: [unit.emne_ids[5],unit.emne_ids[6],unit.emne_ids[7]], purpose: 'Bruker stabile analyseenheter til å sammenligne nasjonal film, nordiske forbindelser og norsk produksjon, offentlighet og sirkulasjon.' },
      { id: 'animasjon-og-historiografisk-metode', sequence: 4, emne_ids: [unit.emne_ids[0],unit.emne_ids[2]], purpose: 'Følger animasjonens teknikker og arbeidsformer før periodisering, kildehierarki, fravær og kanonrevisjon gjøres eksplisitt.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true,
      paragraph_and_claim_counts_follow_problem_complexity: true,
      current_claim_plan_counts_by_emne: topicBriefs.map((row) => ({ emne_id: row.emne_id, planned_claim_count: row.planned_claims.length })),
      paragraph_claim_trace_required: true,
      every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      chronology_must_distinguish_event_period_and_later_historiography: true,
      comparisons_must_keep_analyseenhet_stable: true,
      hollywood_must_not_be_universal_periodization: true,
      archive_preservation_and_cultural_heritage_effects_remain_outside_scope: true,
      chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_filmhistorie_bevegelser_og_historiografi'
  };

  const registry = structuredClone(currentRegistry);
  registry.version = '2.82.0';
  registry.updatedAt = '2026-08-11';
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Serialitet, format og adaptasjon er registrert etter fulltekstporten. Filmhistorie, bevegelser og historiografi har nå en egen kilde- og claimbrief for 10 canonicale emner med 20 inspectable museums-, universitets-, arkiv- og filminstituttkilder, 18 verk-, produksjons-, bevegelses-, institusjons- og recoverycase og 35 variabelt fordelte claimplaner. Claimplanene er uverifiserte, og kapitlet er ikke runtime-registrert. Neste port er fulltekst med avsnittsnivå claimtrace og ny audit; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.fourthSourceClaimBrief = P.brief;

  const status = structuredClone(currentStatus);
  status.version = '1.70.0';
  status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.nextGate = SOURCE_BRIEF_GATE;
  filmStatus.note = 'Kilde- og claimbriefen for Filmhistorie, bevegelser og historiografi er komplett: 10 canonicale emner, 20 inspectable museums-, universitets-, arkiv- og filminstituttkilder, 18 case og 35 claimplaner fordelt 4–4–4–3–4–3–3–3–3–4 etter faglig behov. Planlagte claims er ikke verifiserte claims, og kapitlet er ikke registrert. Neste port er fulltekst, faktisk kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.';

  const usedSourceIds = new Set([...topicBriefs.flatMap((topic) => topic.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const evidenceRoles = new Set(SOURCES.map((row) => row.evidence_role));
  const report = {
    schema: 'history_go_film_tv_history_movements_historiography_source_brief_v1_audit',
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
      fourth_learning_order_unit_selected: plan.production_sequence[3] === UNIT_ID,
      required_prerequisite_chapters_registered: unit.prerequisite_planned_unit_ids.every((id) => currentRegistry.subjects.film_tv.chapters.some((row) => row.id === id)),
      exact_unit_emne_coverage: topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
      all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
      all_methods_resolve: topicBriefs.every((row) => row.method_ids.every((id) => methodIds.has(id))),
      inspectable_https_sources: SOURCES.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-11' && row.source_location),
      object_primary_and_historiographical_roles_present: [...evidenceRoles].some((role) => /object-record|primary-trace|production-trace/.test(role)) && [...evidenceRoles].some((role) => /historiography/.test(role)),
      every_source_used: SOURCES.every((row) => usedSourceIds.has(row.id)),
      every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
      every_case_documented: CASES.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))),
      early_silent_sound_studio_movement_global_nordic_norwegian_animation_cases_present: ['early-cinema','silent','studio','movement','african','nordic','norwegian','animation'].every((needle) => CASES.some((row) => `${row.medium} ${row.purpose}`.toLowerCase().includes(needle))),
      every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
      every_case_source_available_to_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((caseId) => CASES.find((row) => row.id === caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))),
      claim_counts_follow_variable_problem_scope: new Set(claimCounts).size > 1 && Math.min(...claimCounts) >= 3,
      no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
      all_planned_claim_ids_unique: new Set(plannedClaims.map((row) => row.id)).size === plannedClaims.length,
      all_topics_have_boundaries_sources_cases_and_methods: topicBriefs.every((row) => row.canonical_boundary && row.source_ids.length >= 3 && row.case_ids.length >= 2 && row.method_ids.length >= 1),
      module_order_covers_every_emne_once: moduleEmneIds.length === unit.emne_count && new Set(moduleEmneIds).size === unit.emne_count && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
      module_sizes_are_not_forced_equal: new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
      chapter_remains_unregistered: !registry.subjects.film_tv.chapters.some((row) => row.id === FUTURE_CHAPTER_ID),
      registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered && !brief.runtime_registration.allowed_before_full_chapter_gate && brief.production_requirements.chapter_registration_only_after_audit
    },
    next_gate: brief.next_gate
  };
  return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvHistoryMovementsHistoriographySourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, SOURCE_BRIEF_GATE, FULLTEXT_GATE, LATER_SOURCE_BRIEF_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([FULLTEXT_GATE, LATER_SOURCE_BRIEF_GATE].includes(currentGate)) {
    const brief = read(P.brief);
    const report = read(P.report);
    assert(brief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Filmhistoriebriefen skal være konsumert etter fulltekstporten');
    assert(brief.runtime_registration.registered === true && brief.runtime_registration.chapter_id === FUTURE_CHAPTER_ID, 'Filmhistoriebriefen mangler etterfølgende kapittelregistrering');
    assert(report.status === 'source_claim_brief_consumed_by_verified_chapter' && Object.values(report.gates).every(Boolean), 'Filmhistoriebriefens etteraudit er ikke grønn');
    return { brief, report, registry: read(P.registry), status: read(P.status), unit: read(P.plan).planned_units.find((row) => row.id === UNIT_ID), topicBriefs: brief.topic_briefs, plannedClaims: brief.topic_briefs.flatMap((row) => row.planned_claims) };
  }
  const built = buildFilmTvHistoryMovementsHistoriographySourceBriefV1();
  const outputs = { [P.brief]: built.brief, [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én filmhistoriebriefport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV filmhistoriebrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV filmhistoriebrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
