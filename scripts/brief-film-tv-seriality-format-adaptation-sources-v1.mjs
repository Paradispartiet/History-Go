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
  brief: 'data/fag/TV_og_Film/film_tv_seriality_format_adaptation_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-seriality-format-adaptation-source-brief-v1-audit.json'
});
const UNIT_ID = 'serialitet-format-og-adaptasjon';
const FUTURE_CHAPTER_ID = UNIT_ID;
const INPUT_GATE = 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief';
const SOURCE_BRIEF_GATE = 'seriality_format_adaptation_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'film_history_movements_historiography_source_brief_complete_full_chapter_production';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const SOURCES = Object.freeze([
  {
    id: 'ftvsfa01-series-episodic-serial', publisher: 'Università di Bologna / Series',
    title: 'The Ethics of Serial Narrative Structures', url: 'https://series.unibo.it/article/view/10393', type: 'peer-reviewed-seriality-study',
    source_location: 'Abstract and analysis of semi-serial television balancing stand-alone episodes with long-term arcs across seasons', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa02-series-maigret', publisher: 'Università di Bologna / Series',
    title: 'Inspector Maigret and the Teleromanzo', url: 'https://series.unibo.it/article/view/19995/19218', type: 'peer-reviewed-episode-form-study',
    source_location: 'Discussion of episode narration as repetition of a recognizable formula inside a serial structure', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa03-series-doctor-who', publisher: 'Università di Bologna / Series',
    title: 'Who’s in Charge?: Changing Character Agency in Early Doctor Who', url: 'https://series.unibo.it/article/view/9805', type: 'peer-reviewed-television-history-study',
    source_location: 'Abstract and article on production context, rapid turnaround, character agency and long-term arcs in early and modern Doctor Who', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa04-series-fringe-transmedia', publisher: 'Università di Bologna / Series',
    title: 'Dimensional expansions and shiftings: fan fiction and transmedia storytelling in the Fringeverse', url: 'https://series.unibo.it/article/view/6593', type: 'peer-reviewed-transmedia-study',
    source_location: 'Abstract and methodology distinguishing storyworld expansion, shifting and participatory fan texts around Fringe', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa05-series-crime-revision', publisher: 'Università di Bologna / Series',
    title: 'Baltimore in The Wire and Los Angeles in The Shield', url: 'https://series.unibo.it/article/view/7144', type: 'peer-reviewed-crime-genre-study',
    source_location: 'Abstract on cop-show, noir, serial expansion, place and genre revision in The Wire and The Shield', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa06-jenkins-transmedia', publisher: 'Henry Jenkins / MIT teaching context',
    title: 'Transmedia Storytelling 101', url: 'https://henryjenkins.org/blog/2007/03/transmedia_storytelling_101.html', type: 'university-transmedia-reference',
    source_location: 'Points 1–2 defining coordinated distribution across media and the Matrix example; each medium should contribute distinctly', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa07-bfi-prisoner', publisher: 'British Film Institute',
    title: '6 ways cult show The Prisoner prepared us for the modern world', url: 'https://www.bfi.org.uk/features/prisoner-patrick-mcgoohan-50', type: 'national-film-institute-television-analysis',
    source_location: 'Commissioned two-season plan, reduction to 17 episodes and Fall Out’s unresolved cliffhanger', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa08-bfi-doctor-who', publisher: 'British Film Institute',
    title: '60 years of Doctor Who: in search of classic Who locations', url: 'https://www.bfi.org.uk/features/60-years-doctor-who-locations', type: 'national-film-institute-television-history',
    source_location: 'The Invasion and Spearhead from Space sections, including episode cliffhanger construction and serial continuity', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa09-tv-academy-jeopardy', publisher: 'Television Academy',
    title: 'Jeopardy! By the Numbers', url: 'https://www.televisionacademy.com/features/news/online-originals/jeopardy-60th-anniversary-game-show-trivia', type: 'television-academy-format-history',
    source_location: 'Three contestants, rounds, Daily Doubles, Final Jeopardy and approximately thirty-minute repeated format since 1964', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa10-tv-academy-price-is-right', publisher: 'Television Academy',
    title: 'Bob Barker: Hall of Fame Tribute', url: 'https://www.televisionacademy.com/features/news/hall-fame/bob-barker-hall-fame-tribute', type: 'television-academy-game-show-history',
    source_location: 'The Price Is Right section on contestant rules, game variation, host explanation, studio audience and dramatic escalation', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa11-tv-academy-comedy', publisher: 'Television Academy Foundation Interviews',
    title: 'Comedy Series', url: 'https://interviews.televisionacademy.com/genres/comedy-series', type: 'television-academy-oral-history-index',
    source_location: 'Genre distinctions and indexed I Love Lucy interviews on episode writing, recurring cast, set, production and later hour format', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa12-tv-academy-anthology', publisher: 'Television Academy',
    title: 'So Many Stories to Tell', url: 'https://www.televisionacademy.com/features/news/online-originals/so-many-stories-tell', type: 'television-academy-format-analysis',
    source_location: 'The Guest Book and discussion of anthology and hybrid formats across comedy, crime and science fiction', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa13-bfi-body-snatchers', publisher: 'British Film Institute',
    title: 'Pod people: the legacy of Invasion of the Body Snatchers', url: 'https://www.bfi.org.uk/features/pod-people-legacy-invasion-body-snatchers', type: 'national-film-institute-remake-analysis',
    source_location: 'Serialised novel source and comparison of four screen versions reworking place, ending, viewpoint and contemporary anxiety', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa14-loc-film-registry', publisher: 'Library of Congress / National Film Preservation Board',
    title: 'Brief Descriptions and Expanded Essays of National Film Registry Titles', url: 'https://www.loc.gov/programs/national-film-preservation-board/film-registry/descriptions-and-essays/', type: 'national-film-archive-reference',
    source_location: 'Entries for 12 Angry Men, Flash Gordon Serial, The Godfather, The Godfather Part II and The Matrix', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa15-bfi-matrix', publisher: 'British Film Institute',
    title: 'The Matrix: how the Wachowskis changed sci-fi', url: 'https://www.bfi.org.uk/features/matrix-wachowskis-keanu-reeves', type: 'national-film-institute-franchise-analysis',
    source_location: 'Trilogy conception, back-to-back sequels and the expansion of the Matrix world and machine city', retrieval_status: 'verified_2026-08-11'
  },
  {
    id: 'ftvsfa16-bfi-horror-history', publisher: 'British Film Institute',
    title: 'A great horror film for every year, from 1922 to now', url: 'https://www.bfi.org.uk/lists/great-horror-film-from-every-year-from-1922-now', type: 'national-film-institute-genre-history',
    source_location: 'Historical framing of cycles, censorship, audience shifts, J-horror, zombie, slasher and later category revisions', retrieval_status: 'verified_2026-08-11'
  }
]);

const CASES = Object.freeze([
  { id: 'case-prisoner', work: 'The Prisoner', medium: 'television-series', years: '1967–1968', source_ids: ['ftvsfa07-bfi-prisoner'], purpose: 'Sammenligne planlagt sesongomfang, faktisk episodeantall og en avslutning som stanser informasjon uten full lukning.' },
  { id: 'case-doctor-who-invasion', work: 'Doctor Who: The Invasion', medium: 'television-serial', year: 1968, source_ids: ['ftvsfa08-bfi-doctor-who'], purpose: 'Følge cliffhanger og framdrift over episodegrenser i et langvarig serieunivers.' },
  { id: 'case-jeopardy', work: 'Jeopardy!', medium: 'television-competition-format', year: 1964, source_ids: ['ftvsfa09-tv-academy-jeopardy'], purpose: 'Skille stabile regler og repeterbare runder fra variasjonen i deltakere og spørsmål.' },
  { id: 'case-price-is-right', work: 'The Price Is Right', medium: 'television-competition-format', year: 1972, source_ids: ['ftvsfa10-tv-academy-price-is-right'], purpose: 'Analysere programleder, studiopublikum, enkeltspill og dramatisk progresjon innen et repeterbart format.' },
  { id: 'case-i-love-lucy', work: 'I Love Lucy', medium: 'television-sitcom', years: '1951–1957', source_ids: ['ftvsfa11-tv-academy-comedy'], purpose: 'Koble ensemble, gjentakende situasjoner og episodehåndverk til sitcomformat uten å gjøre produksjonsteknikk til hele sjangeren.' },
  { id: 'case-guest-book', work: 'The Guest Book', medium: 'television-anthology-comedy', year: 2017, source_ids: ['ftvsfa12-tv-academy-anthology'], purpose: 'Vise hvordan samme sted kan bære skiftende rollefigurer og sjangertoner i et hybridisert antologiformat.' },
  { id: 'case-body-snatchers', work: 'The Body Snatchers / Invasion of the Body Snatchers versions', medium: 'novel-film-remake-sequence', years: '1954–2007', source_ids: ['ftvsfa13-bfi-body-snatchers'], purpose: 'Sammenligne hva nye versjoner endrer i sted, slutt, synsvinkel og historisk bekymring.' },
  { id: 'case-matrix', work: 'The Matrix franchise', medium: 'film-transmedia-franchise', years: '1999–', source_ids: ['ftvsfa06-jenkins-transmedia','ftvsfa15-bfi-matrix'], purpose: 'Skille filmoppfølger, verdensutvidelse og bidrag fra andre medier i samme fortellingsunivers.' },
  { id: 'case-flash-gordon', work: 'Flash Gordon Serial', medium: 'cinema-serial-comic-adaptation', year: 1936, source_ids: ['ftvsfa14-loc-film-registry'], purpose: 'Koble episodeinndeling, cliffhangertradisjon og adaptasjon fra tegneserie til kinoføljetong.' },
  { id: 'case-godfather', work: 'The Godfather and The Godfather Part II', medium: 'film-adaptation-sequel-prequel', years: '1972–1974', source_ids: ['ftvsfa14-loc-film-registry'], purpose: 'Analysere krimsaga, adaptasjon og oppfølger/prequel-struktur uten å redusere serien til franchiseøkonomi.' },
  { id: 'case-wire-shield', work: 'The Wire and The Shield', medium: 'television-crime-series', years: '2002–2008', source_ids: ['ftvsfa05-series-crime-revision'], purpose: 'Sammenligne hvordan to serier utvider og reviderer politi-, noir- og bykonvensjoner gjennom serialitet.' },
  { id: 'case-twelve-angry-men', work: '12 Angry Men', medium: 'stage-television-film-adaptation', years: '1954–1957', source_ids: ['ftvsfa14-loc-film-registry'], purpose: 'Sammenligne samme dramatiske grunnlag på scene, direktesendt TV og film gjennom form- og romvalg.' }
]);

const TOPIC_PLANS = Object.freeze([
  {
    emne_id: 'em_film_tv_adaptasjon_remake_og_intermedialitet', case_ids: ['case-body-snatchers','case-twelve-angry-men','case-flash-gordon'],
    source_ids: ['ftvsfa13-bfi-body-snatchers','ftvsfa14-loc-film-registry','ftvsfa06-jenkins-transmedia'],
    learning_goal: 'Sammenligne kildetekst, versjon og medium som ulike formvalg uten å bruke troskap som eneste målestokk.',
    planned_claims: [
      ['ftv-sfa-pc-01','Hvorfor adaptasjon må beskrive hva et nytt medium gjør med tid, rom, framstilling og rollefigur, ikke bare telle avvik fra et opphav.','analytical-concept'],
      ['ftv-sfa-pc-02','Hvordan Body Snatchers-versjonene flytter sted, slutt, synsvinkel og samtidshistorisk bekymring.','comparative-remake-case'],
      ['ftv-sfa-pc-03','Hvordan 12 Angry Men endrer uttrykk mellom scene, direktesendt fjernsyn og film samtidig som juryrommets konflikt beholdes.','intermedial-case'],
      ['ftv-sfa-pc-04','Hvordan Flash Gordon Serial forbinder tegneserieadaptasjon med episodisk kinoføljetong uten at adaptasjon, serialitet og franchise blir samme begrep.','boundary-case']
    ]
  },
  {
    emne_id: 'em_film_tv_cliffhanger_og_informasjonsstans', case_ids: ['case-prisoner','case-doctor-who-invasion'],
    source_ids: ['ftvsfa01-series-episodic-serial','ftvsfa07-bfi-prisoner','ftvsfa08-bfi-doctor-who'],
    learning_goal: 'Analysere hvilken handling eller kunnskap som holdes tilbake ved en grense, atskilt fra generell klipperytme og antatt publikumsvirkning.',
    planned_claims: [
      ['ftv-sfa-pc-05','Hvorfor cliffhanger er en organisert stans i handling eller informasjon ved en publiseringsgrense, ikke et synonym for rask rytme.','analytical-concept'],
      ['ftv-sfa-pc-06','Hvordan The Invasion og Fall Out bruker ulike grenseformer: utsatt episodisk svar og avsluttende ulukkethet.','comparative-television-case']
    ]
  },
  {
    emne_id: 'em_film_tv_direkte_underholdning_konkurranse_og_formatlogikk', case_ids: ['case-jeopardy','case-price-is-right'],
    source_ids: ['ftvsfa09-tv-academy-jeopardy','ftvsfa10-tv-academy-price-is-right','ftvsfa02-series-maigret'],
    learning_goal: 'Skille formatets repeterbare regler og roller fra den konkrete sendingens deltakere, innhold og utfall.',
    planned_claims: [
      ['ftv-sfa-pc-07','Hvordan formatlogikk består av repeterbare regler, runder, roller og tidsgrenser som kan fylles med nytt innhold.','analytical-concept'],
      ['ftv-sfa-pc-08','Hvordan Jeopardy! skaper variasjon innen en uvanlig stabil sekvens av deltakere, runder og spørsmål.','game-show-case'],
      ['ftv-sfa-pc-09','Hvordan The Price Is Right bruker programlederforklaring, studiopublikum og flere enkeltspill til å bygge lokal dramatisk progresjon.','live-entertainment-case']
    ]
  },
  {
    emne_id: 'em_film_tv_episodisk_dramaturgi_og_fremdrift', case_ids: ['case-prisoner','case-doctor-who-invasion'],
    source_ids: ['ftvsfa01-series-episodic-serial','ftvsfa02-series-maigret','ftvsfa03-series-doctor-who','ftvsfa07-bfi-prisoner','ftvsfa08-bfi-doctor-who'],
    learning_goal: 'Skille episodens lokale oppgave og lukning fra framdrift som fortsetter mellom episoder.',
    planned_claims: [
      ['ftv-sfa-pc-10','Hvordan én episode kan gjenta en formel og samtidig endre rollefigurer, relasjoner eller en langsiktig bue.','analytical-concept'],
      ['ftv-sfa-pc-11','Hvorfor episodisk og seriell dramaturgi er grader og kombinasjoner, ikke et absolutt enten–eller.','seriality-concept'],
      ['ftv-sfa-pc-12','Hvordan Doctor Who og The Prisoner organiserer lokal fare, episodegrense og langsiktig premiss på forskjellige måter.','comparative-television-case']
    ]
  },
  {
    emne_id: 'em_film_tv_franchise_univers_og_transmedial_fortelling', case_ids: ['case-matrix','case-flash-gordon'],
    source_ids: ['ftvsfa04-series-fringe-transmedia','ftvsfa06-jenkins-transmedia','ftvsfa14-loc-film-registry','ftvsfa15-bfi-matrix'],
    learning_goal: 'Kartlegge hvor nye fortellingsopplysninger faktisk plasseres i et univers, og skille dette fra merkevareutbredelse alene.',
    planned_claims: [
      ['ftv-sfa-pc-13','Hvorfor transmedial fortelling krever at ulike medier bidrar forskjellig, mens ren gjenfortelling eller markedsføring ikke automatisk utvider verden.','analytical-concept'],
      ['ftv-sfa-pc-14','Hvordan Matrix-universet fordeler fortellingsinformasjon mellom filmer, animasjon, tegneserier og spill.','transmedia-case'],
      ['ftv-sfa-pc-15','Hvordan oppfølger, prequel, remake, adaptasjon og transmedial utvidelse må holdes analytisk atskilt selv når de inngår i samme franchise.','boundary-comparison']
    ]
  },
  {
    emne_id: 'em_film_tv_krim_sjanger_og_spenningsstruktur', case_ids: ['case-godfather','case-wire-shield'],
    source_ids: ['ftvsfa05-series-crime-revision','ftvsfa14-loc-film-registry','ftvsfa01-series-episodic-serial'],
    learning_goal: 'Analysere hvordan krim fordeler kunnskap, etterforskning, trussel og moralsk orden på tvers av verk- og serieformer.',
    planned_claims: [
      ['ftv-sfa-pc-16','Hvordan krimspenning kan organiseres rundt gåte, etterforskning, kjent gjerningsperson eller truet orden uten én universell oppskrift.','genre-concept'],
      ['ftv-sfa-pc-17','Hvordan The Godfather og Part II omorganiserer familiesaga, forbrytelse og tid som både adaptasjon, oppfølger og prequel.','film-crime-case'],
      ['ftv-sfa-pc-18','Hvordan The Wire og The Shield reviderer politi- og noirtradisjoner gjennom serialisert by-, institusjons- og karakterstruktur.','television-crime-case']
    ]
  },
  {
    emne_id: 'em_film_tv_serieformat_og_serialitet', case_ids: ['case-prisoner','case-doctor-who-invasion','case-flash-gordon'],
    source_ids: ['ftvsfa01-series-episodic-serial','ftvsfa02-series-maigret','ftvsfa03-series-doctor-who','ftvsfa07-bfi-prisoner','ftvsfa08-bfi-doctor-who','ftvsfa14-loc-film-registry'],
    learning_goal: 'Analysere gjentakelse og endring over flere deler gjennom eksplisitte episode- og serialgrenser.',
    planned_claims: [
      ['ftv-sfa-pc-19','Hvordan serialitet oppstår når deler både gjentar et gjenkjennelig mønster og endrer et forløp eller en verden.','analytical-concept'],
      ['ftv-sfa-pc-20','Hvorfor serie, serial, føljetong og episodeformat beskriver forskjellige kombinasjoner av lokal lukning og videreføring.','format-concept'],
      ['ftv-sfa-pc-21','Hvordan Flash Gordon, Doctor Who og The Prisoner viser historisk ulike løsninger på gjentakelse, episodegrense og langt premiss.','historical-comparison']
    ]
  },
  {
    emne_id: 'em_film_tv_sesongstruktur_og_fortellingsbue', case_ids: ['case-prisoner','case-doctor-who-invasion'],
    source_ids: ['ftvsfa01-series-episodic-serial','ftvsfa03-series-doctor-who','ftvsfa07-bfi-prisoner','ftvsfa08-bfi-doctor-who'],
    learning_goal: 'Behandle sesongen som et mellomnivå mellom episode og hel serie, med egne buer, rytmer og avslutningsvalg.',
    planned_claims: [
      ['ftv-sfa-pc-22','Hvorfor sesongbuen må kartlegges som et mellomnivå som kan samle flere episodeoppgaver uten å være identisk med hele serien.','analytical-concept'],
      ['ftv-sfa-pc-23','Hvordan The Prisoners reduserte episodeomfang og Doctor Whos skiftende produksjonsforløp viser at sesongstruktur også formes av historiske produksjonsbetingelser.','historical-case']
    ]
  },
  {
    emne_id: 'em_film_tv_sitcom_humor_og_format', case_ids: ['case-i-love-lucy','case-guest-book'],
    source_ids: ['ftvsfa11-tv-academy-comedy','ftvsfa12-tv-academy-anthology','ftvsfa01-series-episodic-serial'],
    learning_goal: 'Koble komiske mekanismer til ensemble, rom, episodeform og repeterbart format uten å gjøre alle komiserier til samme modell.',
    planned_claims: [
      ['ftv-sfa-pc-24','Hvordan sitcom bygger humor gjennom tilbakevendende rollefigurer og situasjoner samtidig som hver episode etablerer en lokal komisk forstyrrelse.','sitcom-concept'],
      ['ftv-sfa-pc-25','Hvordan I Love Lucy og The Guest Book viser ulike forbindelser mellom fast ensemble, fast sted, episodeavslutning og formatvariasjon.','comparative-comedy-case']
    ]
  },
  {
    emne_id: 'em_film_tv_sjangerhistorie_hybridisering_og_revisjon', case_ids: ['case-body-snatchers','case-guest-book','case-wire-shield'],
    source_ids: ['ftvsfa05-series-crime-revision','ftvsfa12-tv-academy-anthology','ftvsfa13-bfi-body-snatchers','ftvsfa16-bfi-horror-history'],
    learning_goal: 'Historisere hvordan sjangre blandes, siteres og revideres uten å opprette én canonical emneboks per sjanger.',
    planned_claims: [
      ['ftv-sfa-pc-26','Hvorfor sjangerhistorie må følge sykluser, institusjonelle kategorier og formendringer framfor å behandle etiketter som tidløse.','historical-concept'],
      ['ftv-sfa-pc-27','Hvordan Body Snatchers-versjonene reviderer samme science fiction- og horrorgrunnlag mot forskjellige historiske bekymringer.','remake-genre-case'],
      ['ftv-sfa-pc-28','Hvordan The Guest Book, The Wire og The Shield hybridiserer henholdsvis antologikomedie, politi-, by- og noirformer uten å oppheve gjenkjennelige sjangerspor.','comparative-hybrid-case']
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

export function buildFilmTvSerialityFormatAdaptationSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Serialitet, format og adaptasjon');
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
    schema: 'history_go_film_tv_seriality_format_adaptation_source_claim_brief_v1',
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
      institutional_university_and_peer_reviewed_sources_prioritized: true,
      conceptual_claims_require_faglig_source: true,
      case_claims_require_work_or_format_specific_source: true,
      film_and_television_cases_are_both_required: true,
      comparable_versions_must_name_observable_changes: true,
      format_rules_must_be_separated_from_single_episode_content: true,
      franchise_economics_remain_outside_this_unit: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES,
    case_candidates: CASES,
    topic_briefs: topicBriefs,
    proposed_module_order: [
      { id: 'episode-serie-sesong', sequence: 1, emne_ids: [unit.emne_ids[6],unit.emne_ids[3],unit.emne_ids[7],unit.emne_ids[1]], purpose: 'Fra gjentakelse og episodegrense til sesongbue og strategisk informasjonsstans.' },
      { id: 'repeterbare-tv-formater', sequence: 2, emne_ids: [unit.emne_ids[2],unit.emne_ids[8]], purpose: 'Sammenligner regelstyrt konkurranseunderholdning og situasjonskomikk som ulike repeterbare TV-former.' },
      { id: 'adaptasjon-og-univers', sequence: 3, emne_ids: [unit.emne_ids[0],unit.emne_ids[4]], purpose: 'Skiller versjonssammenligning fra oppfølger, franchise og koordinert transmedial verdensutvidelse.' },
      { id: 'krim-og-sjangerrevisjon', sequence: 4, emne_ids: [unit.emne_ids[5],unit.emne_ids[9]], purpose: 'Bruker krim som avgrenset case før sjangerhistorie, hybridisering og revisjon generaliseres.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true,
      paragraph_and_claim_counts_follow_problem_complexity: true,
      current_claim_plan_counts_by_emne: topicBriefs.map((row) => ({ emne_id: row.emne_id, planned_claim_count: row.planned_claims.length })),
      paragraph_claim_trace_required: true,
      every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      comparisons_must_distinguish_source_fact_observation_and_interpretation: true,
      episode_season_series_and_franchise_levels_must_not_be_conflated: true,
      rights_licensing_distribution_and_production_technique_remain_outside_scope: true,
      chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_serialitet_format_og_adaptasjon'
  };

  const registry = structuredClone(currentRegistry);
  registry.version = '2.80.0';
  registry.updatedAt = '2026-08-11';
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Fortelling, synsvinkel og sjanger er registrert etter fulltekstporten. Serialitet, format og adaptasjon har nå en egen kilde- og claimbrief for 10 canonicale emner med 16 inspectable universitets-, arkiv- og institusjonskilder, 12 film-, TV- og versjonscase og 28 variabelt fordelte claimplaner. Claimplanene er uverifiserte, og kapitlet er ikke runtime-registrert. Neste port er fulltekst med avsnittsnivå claimtrace og ny audit; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.thirdSourceClaimBrief = P.brief;

  const status = structuredClone(currentStatus);
  status.version = '1.68.0';
  status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.nextGate = SOURCE_BRIEF_GATE;
  filmStatus.note = 'Kilde- og claimbriefen for Serialitet, format og adaptasjon er komplett: 10 canonicale emner, 16 inspectable universitets-, arkiv- og institusjonskilder, 12 film-, TV- og versjonscase og 28 claimplaner fordelt 4–2–3–3–3–3–3–2–2–3 etter faglig behov. Planlagte claims er ikke verifiserte claims, og kapitlet er ikke registrert. Neste port er fulltekst, faktisk kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.';

  const usedSourceIds = new Set([...topicBriefs.flatMap((topic) => topic.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const report = {
    schema: 'history_go_film_tv_seriality_format_adaptation_source_brief_v1_audit',
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
      third_learning_order_unit_selected: plan.production_sequence[2] === UNIT_ID,
      narrative_prerequisite_registered: currentRegistry.subjects.film_tv.chapters.some((row) => row.id === 'fortelling-synsvinkel-og-sjanger'),
      exact_unit_emne_coverage: topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
      all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
      all_methods_resolve: topicBriefs.every((row) => row.method_ids.every((id) => methodIds.has(id))),
      inspectable_https_sources: SOURCES.every((row) => row.url.startsWith('https://') && row.retrieval_status === 'verified_2026-08-11' && row.source_location),
      every_source_used: SOURCES.every((row) => usedSourceIds.has(row.id)),
      every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
      every_case_documented: CASES.every((row) => row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))),
      film_and_television_cases_present: CASES.some((row) => /film|cinema/.test(row.medium)) && CASES.some((row) => /television/.test(row.medium)),
      comparable_version_cases_present: CASES.some((row) => /remake|adaptation/.test(row.medium)) && CASES.some((row) => /transmedia/.test(row.medium)),
      every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
      every_case_source_available_to_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((caseId) => CASES.find((row) => row.id === caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))),
      claim_counts_follow_variable_problem_scope: new Set(claimCounts).size > 1 && Math.min(...claimCounts) >= 2,
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

export function auditFilmTvSerialityFormatAdaptationSourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, SOURCE_BRIEF_GATE, FULLTEXT_GATE, LATER_SOURCE_BRIEF_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([FULLTEXT_GATE, LATER_SOURCE_BRIEF_GATE].includes(currentGate)) {
    const brief = read(P.brief);
    const report = read(P.report);
    assert(brief.status === 'source_claim_brief_consumed_by_verified_chapter', 'Serialitetsbriefen skal være konsumert etter fulltekstporten');
    assert(brief.runtime_registration.registered === true && brief.runtime_registration.chapter_id === FUTURE_CHAPTER_ID, 'Serialitetsbriefen mangler etterfølgende kapittelregistrering');
    assert(report.status === 'source_claim_brief_consumed_by_verified_chapter' && Object.values(report.gates).every(Boolean), 'Serialitetsbriefens etteraudit er ikke grønn');
    return { brief, report, registry: read(P.registry), status: read(P.status), unit: read(P.plan).planned_units.find((row) => row.id === UNIT_ID), topicBriefs: brief.topic_briefs, plannedClaims: brief.topic_briefs.flatMap((row) => row.planned_claims) };
  }
  const built = buildFilmTvSerialityFormatAdaptationSourceBriefV1();
  const outputs = { [P.brief]: built.brief, [P.report]: built.report, [P.registry]: built.registry, [P.status]: built.status };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én serialitetsbriefport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV serialitetsbrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV serialitetsbrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
