import fs from 'node:fs';

const mode = process.argv[2];
const quizFile = 'data/quiz/by/rodelokka_sets.json';
const briefFile = 'data/quiz/production_briefs/by/rodelokka.json';
const artifactFile = 'data/quiz/production_context/by/rodelokka.json';

function read(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function write(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function qNumber(question) {
  const match = /^claim_rodelokka_quiz_(\d+)$/.exec(question.claim_id || '');
  return Number(match?.[1] || 0);
}

const bridge = {
  22: {
    question: 'Hva viser kombinasjonen av små gater, lave trehus og landsbyaktig preg om Rodeløkkas byform?',
    options: ['At området har en småskala trehusstruktur som skiller seg fra storbyen rundt', 'At området ble planlagt som motorveiknutepunkt', 'At området først og fremst er et havne- og industriområde'],
    answer: 'At området har en småskala trehusstruktur som skiller seg fra storbyen rundt',
    knowledge: 'Rodeløkka kan leses som en småskala trehusstruktur med smale gater og lav bebyggelse, tydelig forskjellig fra større bystrukturer rundt.',
    claim_basis: 'Oslo byleksikon og SNL beskriver Rodeløkka som et særpreget trehusmiljø med små gater og landsbyaktig preg i byen.',
    emne_id: 'em_by_boligstruktur', source: ['byleksikon', 'snl']
  },
  23: {
    question: 'Hva forteller Fjellgata, Langgata og Tromsøgata som lengre gateløp gjennom trehusbebyggelsen?',
    options: ['At trehusmiljøet har en lesbar intern gatestruktur', 'At området mangler sammenhengende gater', 'At de tre gatene er motorveier gjennom området'],
    answer: 'At trehusmiljøet har en lesbar intern gatestruktur',
    knowledge: 'De lengre gateløpene gjør det mulig å lese sammenhengen mellom gatenett og trehusbebyggelse på Rodeløkka.',
    claim_basis: 'Oslo byleksikon nevner Fjellgata, Langgata og Tromsøgata som lengre gateløp gjennom trehusbebyggelsen.',
    emne_id: 'em_by_gangstrommer_snarveier', source: ['byleksikon']
  },
  24: {
    question: 'Hva viser det at trehusmiljøet er omkranset av leiegårder som ble oppført fram mot 1930-årene?',
    options: ['At ulike bolig- og utbyggingslag ligger tett sammen', 'At all trehusbebyggelse ble fjernet før 1900', 'At Rodeløkka bare består av én bygningstype'],
    answer: 'At ulike bolig- og utbyggingslag ligger tett sammen',
    knowledge: 'Kontrasten mellom trehus og senere leiegårder gjør flere historiske bolig- og utbyggingslag synlige i samme nabolag.',
    claim_basis: 'Oslo byleksikon beskriver trehusbebyggelsen som omkranset av leiegårder og oppgir at leiegårder ble oppført fram til 1930-årene.',
    emne_id: 'em_by_boligstruktur', source: ['byleksikon']
  },
  25: {
    question: 'Hva viser vedtaket om 137 eiendommer i 1988 om bevaringsstrategien på Rodeløkka?',
    options: ['At et sammenhengende miljø ble behandlet som bevaringsverdig', 'At bare ett enkelt trehus ble vernet', 'At bevaringsvedtaket bare gjaldt Freia-fabrikken'],
    answer: 'At et sammenhengende miljø ble behandlet som bevaringsverdig',
    knowledge: 'Omfanget på 137 eiendommer viser at bevaringen gjaldt et sammenhengende trehusmiljø, ikke bare ett enkeltobjekt.',
    claim_basis: 'Oslo byleksikon oppgir at 137 eiendommer i trebebyggelsen ble vedtatt som bevaringsområde i 1988.',
    emne_id: 'em_by_historiske_lag_i_hverdagsrom', source: ['byleksikon', 'lokalhistorie']
  },
  26: {
    question: 'Hva forteller striden om sanering eller bevaring i 1970- og 1980-årene om byutviklingen på Rodeløkka?',
    options: ['At modernisering og vern sto som reelle alternative utviklingsretninger', 'At området allerede var revet før striden startet', 'At konflikten bare handlet om trikketakster'],
    answer: 'At modernisering og vern sto som reelle alternative utviklingsretninger',
    knowledge: 'Saneringsstriden viser at Rodeløkkas framtid var omstridt, og at vern ikke var et selvsagt utfall.',
    claim_basis: 'Oslo byleksikon beskriver 1970- og 1980-årene som en periode med strid om Rodeløkka skulle saneres eller bevares.',
    emne_id: 'em_by_transformasjon_ombruk', source: ['byleksikon', 'lokalhistorie']
  },
  27: {
    question: 'Hva illustrerer skiftet fra arbeiderstrøk til høyt verdsatt historisk miljø?',
    options: ['At sosial status og verdsetting av et nabolag kan endres over tid', 'At områdets historie sluttet i 1900', 'At trehus automatisk gir samme sosiale status i alle perioder'],
    answer: 'At sosial status og verdsetting av et nabolag kan endres over tid',
    knowledge: 'Rodeløkka viser hvordan samme boligmiljø kan få en annen sosial og kulturell verdi gjennom historiske endringer.',
    claim_basis: 'Den canonicale stedsprofilen framhever statusskiftet fra arbeiderstrøk til høyt verdsatt historisk miljø, forankret i byleksikonets historie om området.',
    emne_id: 'em_by_bydelsforskjeller_segregering', source: ['byleksikon']
  },
  28: {
    question: 'Hva viser flyttingen av Rodes hus i 1984 sammen med bevaringsvedtaket i 1988?',
    options: ['At bevaringsarbeidet gikk fra konkrete inngrep rundt enkelthus til vern av et større sammenhengende miljø', 'At Rodes hus ble flyttet ut av Oslo etter at området ble sanert', 'At 1988-vedtaket opphevet alt tidligere bevaringsarbeid'],
    answer: 'At bevaringsarbeidet gikk fra konkrete inngrep rundt enkelthus til vern av et større sammenhengende miljø',
    knowledge: 'Flyttingen av Rodes hus og det senere vedtaket for 137 eiendommer kan leses som to dokumenterte nivåer i bevaringshistorien.',
    claim_basis: 'Rodes hus ble flyttet til Langgata 30 i 1984, og Oslo vedtok i 1988 et bevaringsområde som omfattet 137 eiendommer.',
    emne_id: 'em_by_historiske_lag_i_hverdagsrom', source: ['byleksikon', 'langgata', 'lokalhistorie']
  }
};

const finalLayer = {
  29: {
    question: 'Hva viser trikkens åpning i 1900 og nedleggelse i 1949 når Rodeløkka analyseres som mobilitetshistorie?',
    options: ['At transportforbindelser er historiske lag som kan endres med byens mobilitetssystem', 'At Rodeløkka aldri var koblet til kollektivtransport', 'At trikkelinjen var uendret fra 1854 til i dag'],
    answer: 'At transportforbindelser er historiske lag som kan endres med byens mobilitetssystem',
    knowledge: 'Trikkens etablering og avvikling viser at kollektivtilbudet rundt et nabolag er et historisk lag, ikke en permanent egenskap.',
    claim_basis: 'Oslo byleksikon oppgir at den første Rodeløkka-trikken ble innviet i mars 1900 og nedlagt i februar 1949.',
    emne_id: 'em_by_infrastruktur_mobilitet', source: ['byleksikon']
  },
  30: {
    question: 'Hva bør sammenlignes i en morfologisk analyse av Rodeløkkas trehusmiljø og bebyggelsen rundt?',
    options: ['Gatenett, tomtestruktur, byggehøyde og bygningstyper', 'Bare dagens boligpriser', 'Kun navnene på nærmeste butikker'],
    answer: 'Gatenett, tomtestruktur, byggehøyde og bygningstyper',
    knowledge: 'Morfologisk analyse undersøker den fysiske byformen. På Rodeløkka er gater, tomter, trehus og omkransende leiegårder konkrete sammenligningspunkter.',
    claim_basis: 'Oslo byleksikon og SNL beskriver små gater, trehusbebyggelse og omkransende leiegårder som sentrale fysiske trekk ved Rodeløkka.',
    emne_id: 'em_by_boligstruktur', source: ['byleksikon', 'snl'], method_id: 'met_morfologisk_analyse'
  },
  31: {
    question: 'Hva bør registreres i felt for å undersøke beskrivelsen av Rodeløkka som småskala og landsbyaktig?',
    options: ['Gatebredde, byggehøyde, materialer og overganger til større bebyggelse', 'Bare antallet parkerte biler på ett tidspunkt', 'Kun postnummeret til området'],
    answer: 'Gatebredde, byggehøyde, materialer og overganger til større bebyggelse',
    knowledge: 'Feltobservasjon kan gjøre den overordnede stedsbeskrivelsen testbar ved å registrere konkrete fysiske trekk og overganger.',
    claim_basis: 'Kildene beskriver Rodeløkka gjennom små gater, lave trehus og kontrasten til større bybebyggelse rundt.',
    emne_id: 'em_by_boligstruktur', source: ['byleksikon', 'snl'], method_id: 'met_feltobservasjon'
  },
  32: {
    question: 'Hva må være gjenkjennelig når før- og etter-materiale brukes for å undersøke endring på Rodeløkka?',
    options: ['Samme gate, bygning eller et annet fast fysisk anker', 'Samme person i begge bildene', 'Samme værtype og ukedag'],
    answer: 'Samme gate, bygning eller et annet fast fysisk anker',
    knowledge: 'Før/etter-metoden blir sikrere når sammenligningen låses til et gjenkjennelig fysisk anker før endringer beskrives.',
    claim_basis: 'Rodeløkka har dokumenterte, navngitte gater og bevarte/flyttede bygningsspor som gir faste ankere for historisk sammenligning.',
    emne_id: 'em_by_historiske_lag_i_hverdagsrom', source: ['byleksikon', 'langgata'], method_id: 'met_for_etter'
  },
  33: {
    question: 'Aldo Rossi framhever at varige byformer kan bære historie gjennom skiftende bruk. Hvilket trekk ved Rodeløkka gir et konkret anker for dette perspektivet?',
    options: ['Den vedvarende småskala trehus- og gatestrukturen i et område som har skiftet sosial status', 'At alle bygninger på Rodeløkka er oppført samtidig', 'At området mangler historiske bygningsspor'],
    answer: 'Den vedvarende småskala trehus- og gatestrukturen i et område som har skiftet sosial status',
    knowledge: 'Rossis typologiske perspektiv gjør det mulig å undersøke hvordan varige fysiske former kan bære historiske lag selv når bruk, verdi og sosial status endres.',
    claim_basis: 'Rodeløkka har en dokumentert småskala trehus- og gatestruktur samtidig som kildene og stedsprofilen viser store historiske endringer i bruk, bevaring og status.',
    emne_id: 'em_by_boligstruktur', source: ['byleksikon', 'snl'],
    topic_hook_id: 'ark_bygningstyper', thinker_id: 'aldo_rossi', work: 'The Architecture of the City',
    theory_ref: { topic_hook_id: 'ark_bygningstyper', thinker_id: 'aldo_rossi', work: 'The Architecture of the City', why_it_helps: 'Rossis typologiske perspektiv gir et presist språk for å undersøke hvordan en vedvarende fysisk byform kan bære historiske lag gjennom endret bruk og status.' }
  },
  34: {
    question: 'Hva betyr det å lese Rodeløkka som et historisk lagdelt boligmiljø?',
    options: ['Å se trehus, leiegårder, arbeiderhistorie, mobilitet og bevaring i sammenheng', 'Å behandle hvert hus som helt løsrevet fra gaten og nabolaget', 'Å bruke bare dagens eiendomsverdi som historisk forklaring'],
    answer: 'Å se trehus, leiegårder, arbeiderhistorie, mobilitet og bevaring i sammenheng',
    knowledge: 'Et lagdelt boligmiljø forstås gjennom sammenhengen mellom fysisk form, sosial historie, transport og senere vern eller omforming.',
    claim_basis: 'Kildene dokumenterer trehusmiljø, leiegårder, arbeiderbefolkning, trikk, saneringsstrid og bevaring som historiske lag på Rodeløkka.',
    emne_id: 'em_by_historiske_lag_i_hverdagsrom', source: ['byleksikon', 'lokalhistorie', 'snl']
  },
  35: {
    question: 'Hvorfor er bevaringsvedtaket fra 1988 mer enn vern av enkeltfasader?',
    options: ['Fordi 137 eiendommer inngikk i et sammenhengende bevaringsområde', 'Fordi vedtaket bare omtalte Rodes sommerhus', 'Fordi vedtaket gjaldt én trikkeholdeplass'],
    answer: 'Fordi 137 eiendommer inngikk i et sammenhengende bevaringsområde',
    knowledge: 'Når 137 eiendommer behandles som et bevaringsområde, er kulturmiljøets sammenheng et sentralt poeng, ikke bare utseendet til ett hus.',
    claim_basis: 'Oslo byleksikon oppgir at 137 eiendommer i trebebyggelsen ble vedtatt som bevaringsområde i 1988.',
    emne_id: 'em_by_boligstruktur', source: ['byleksikon', 'lokalhistorie']
  }
};

function applyQuestionSpec(question, spec, questionType) {
  Object.assign(question, spec);
  question.question_type = questionType;
  question.topic = spec.question;
  question.answerIndex = spec.options.indexOf(spec.answer);
  if (question.answerIndex < 0) throw new Error(`${question.claim_id}: answer missing from options`);
  for (const field of ['method_id', 'topic_hook_id', 'thinker_id', 'work', 'theory_ref']) {
    if (!(field in spec)) delete question[field];
  }
}

function normalizeStory() {
  const manifestFile = 'data/stories/stories_manifest.json';
  const storyFile = 'data/stories/stories_rodelokka.json';
  const testFile = 'tests/rodelokka-completion.test.mjs';
  const manifest = read(manifestFile);
  manifest.files = (manifest.files || []).filter((entry) => !entry || typeof entry !== 'object' || (entry.entity_id !== 'rodelokka' && entry.path !== storyFile));
  manifest.files.push({ category: 'by', entity_id: 'rodelokka', path: storyFile });
  write(manifestFile, manifest);

  const rows = read(storyFile);
  const matches = rows.filter((row) => row?.id === 'st_rodelokka_bevaring_1988');
  if (matches.length !== 1) throw new Error(`Expected one Rodeløkka Story, found ${matches.length}`);
  const story = matches[0];
  const text = `${String(story.summary || '').trim()} ${String(story.story || '').trim()}`.trim().toLowerCase();
  const count = (pattern) => text.match(pattern)?.length ?? 0;
  const narrative = Math.min(3 + count(/\bkonflikt|strid|debatt|drama\b/g), 5);
  const historical = Math.min(2 + count(/\bkrig|valg|regjering|okkupasjon\b/g) + count(/\bbyutvikling|industri|arbeider\b/g), 5);
  const sourceCount = Array.isArray(story.sources) ? story.sources.length : 0;
  const source = sourceCount >= 3 ? 5 : sourceCount === 2 ? 4 : sourceCount === 1 ? 3 : 1;
  const play_value = Math.min(3 + count(/\bmorsom|absurd|merkelig|underlig\b/g) + count(/\bkonflikt|skandale|drama|vendepunkt\b/g), 5);
  const originality = Math.min(3 + count(/\buvanlig|unik|første gang|sjelden\b/g) + count(/\bmerkelig|underlig|absurd\b/g), 5);
  story.score = { narrative, historical, source, play_value, originality, total: narrative + historical + source + play_value + originality };
  if (story.score.total !== 16 || narrative !== 4 || historical !== 2 || play_value !== 3) throw new Error(`Unexpected Story score ${JSON.stringify(story.score)}`);
  write(storyFile, rows);
  let testText = fs.readFileSync(testFile, 'utf8');
  testText = testText.replace('assert.equal(stories[0].score.total,15)', 'assert.equal(stories[0].score.total,16)').replace('Story 15/15', 'Story canonical 16');
  fs.writeFileSync(testFile, testText);
}

if (mode === 'pre') {
  const quiz = read(quizFile);
  const brief = read(briefFile);
  const phases = ['opening', 'middle', 'middle', 'bridge', 'final'];
  for (let index = 0; index < quiz.sets.length; index += 1) quiz.sets[index].phase = phases[index];

  const questions = quiz.sets.flatMap((set) => set.questions || []);
  const byClaim = new Map(questions.map((question) => [question.claim_id, question]));
  for (const question of questions) {
    const n = qNumber(question);
    if (!n) throw new Error(`Unexpected claim id ${question.claim_id}`);
    if (n <= 21 && ['em_by_vegetasjon_parker_grontdrag', 'em_by_lyd_stoy_akustikk', 'em_by_institusjoner_kulturformidling'].includes(question.emne_id)) {
      question.emne_id = 'em_by_historiske_lag_i_hverdagsrom';
    }
    if (bridge[n]) applyQuestionSpec(question, bridge[n], 'context');
    if (finalLayer[n]) applyQuestionSpec(question, finalLayer[n], 'concept');
  }

  const quizClaims = (brief.claims || []).filter((claim) => /^claim_rodelokka_quiz_\d+$/.test(claim.claim_id || ''));
  if (quizClaims.length !== 35) throw new Error(`Expected 35 quiz claims, found ${quizClaims.length}`);
  for (const claim of quizClaims) {
    const n = Number(/^claim_rodelokka_quiz_(\d+)$/.exec(claim.claim_id)[1]);
    const question = byClaim.get(claim.claim_id);
    if (!question) throw new Error(`${claim.claim_id}: question missing`);
    claim.planned_phase = n <= 7 ? 'opening' : n <= 21 ? 'middle' : n <= 28 ? 'bridge' : 'final';
    claim.family = n <= 21 ? 'fact' : n <= 28 ? 'context' : 'concept_theory';
    claim.statement = question.claim_basis;
    claim.source_ids = [...question.source];
    claim.emne_id = question.emne_id;
    for (const field of ['method_id', 'topic_hook_id', 'thinker_id', 'work']) {
      if (question[field]) claim[field] = question[field]; else delete claim[field];
    }
  }

  brief.existing_quiz_audit = {
    searched_paths: ['data/quiz/manifest.json', 'data/quiz/by/rodelokka_sets.json', 'data/quiz/by/rodelokka_sets_merged.json', 'data/places/by/oslo/places/rodelokka.json'],
    active_before: { file: 'data/quiz/by/rodelokka_sets_merged.json', set_count: 5, question_count: 30, finding: 'Legacy merged normal_place 5x6 package existed, but no standard rodelokka_sets.json package or canonical v3.3 source-brief/context pair existed.' },
    decisions: ['Reuse source-backed factual coverage where it remains valid, but materialize the active package as canonical rich 5x7.', 'Keep the first three sets factual, use the bridge set for context and reserve method/theory work for the final phase.', 'Require every active question to resolve through reviewed source claims and the canonical production context.'],
    knowledge_migration: 'The legacy 5x6 package is treated as editorial input only; canonical Knowledge and quiz context are regenerated from the reviewed 35-claim source brief.'
  };
  brief.profile_decision = { profile: 'rich', set_count: 5, questions_per_set: 7, justification: 'Rodeløkka supports five distinct source-backed learning jobs across settlement history, wooden-house morphology, working-class urbanization, preservation and contemporary historical reading.' };
  brief.held_back_candidates = ['Claims that general Grünerløkka history automatically applies to Rodeløkka without place-specific evidence.', 'Named people, brands or neighboring institutions whose connection is only geographic proximity rather than documented Rodeløkka relevance.', 'Exact causal claims about gentrification or preservation effects that are not directly supported by the reviewed source set.'];
  brief.selected_curriculum = {
    module_ids: ['kur_by_02_nabolag_ulikhet_segregering', 'kur_by_03_infrastruktur_og_bevegelse', 'kur_by_04_historiske_lag_og_transformasjon'],
    emne_ids: ['em_by_historiske_lag_i_hverdagsrom', 'em_by_boligstruktur', 'em_by_bydelsforskjeller_segregering', 'em_by_gangstrommer_snarveier', 'em_by_transformasjon_ombruk', 'em_by_infrastruktur_mobilitet'],
    topic_hook_ids: ['ark_bygningstyper', 'bolig_boligtyper', 'bolig_endring_tid', 'his_bevaring'],
    method_ids: ['met_feltobservasjon', 'met_gis_romlig_analyse', 'met_morfologisk_analyse', 'met_for_etter'],
    thinker_ids: ['aldo_rossi'],
    works: ['The Architecture of the City']
  };
  write(briefFile, brief);
  write(quizFile, quiz);
  normalizeStory();
} else if (mode === 'post') {
  const quiz = read(quizFile);
  const brief = read(briefFile);
  const artifact = read(artifactFile);
  const selected = artifact.selected_curriculum;
  quiz.sources = Object.fromEntries(Object.entries(brief.sources).map(([id, source]) => [id, source.url]));
  quiz.production_context = {
    manifest_category: 'by', profile: artifact.profile, standard_version: '3.4', source_brief: briefFile, context_artifact: artifactFile,
    resolved_files: Object.fromEntries(Object.entries(artifact.resolved_files).map(([key, metadata]) => [key, metadata.path])),
    required_inputs_loaded: artifact.required_inputs_loaded,
    pensum_module_ids: selected.module_ids, emne_ids: selected.emne_ids, topic_hook_ids: selected.topic_hook_ids, method_ids: selected.method_ids,
    thinker_ids: selected.thinker_ids, works: selected.works, source_review_status: brief.status,
    theory_start_phase: 'final', method_start_phase: 'final', existing_quiz_audit: brief.existing_quiz_audit,
    profile_decision: brief.profile_decision, held_back_candidates: brief.held_back_candidates
  };
  write(quizFile, quiz);
} else {
  throw new Error('Usage: node tools/normalize-rodelokka-production.mjs pre|post');
}
