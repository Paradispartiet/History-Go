import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'folgefonden_minnesmerke_skanevik';
const OUT = 'data/quiz/historie/folgefonden_minnesmerke_skanevik_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_folgefonden_minnesmerke_skanevik_set_1","level":1,"order":1,"xp":50,"title":"Forliset og minnesmerket","questions":[{"q":"Kva dato grunnstøytte dampskipet Folgefonden?","o":["22. august 1908","22. august 1918","22. september 1908"],"a":0,"k":"Dampskipet Folgefonden grunnstøytte 22. august 1908.","t":"fact","e":"em_his_reise_transport","s":["lokalhistoriewiki_folgefonden"],"c":["Folgefonden","forlisdato"],"g":["22_august_1908"],"m":"met_periodisering","b":"Forliset skjedde 22. august 1908."},{"q":"Kvar grunnstøytte Folgefonden?","o":["På Trøskenesfluno ved Skånevik","I Rullestadjuvet","Ved Skromme i Åkrafjorden"],"a":0,"k":"Folgefonden grunnstøytte på Trøskenesfluno ved Skånevik.","t":"fact","e":"em_his_spor_materialitet","s":["lokalhistoriewiki_folgefonden"],"c":["Trøskenesfluno","grunnstøyting"],"g":["troskenesfluno"],"m":"met_sporlesning","b":"Trøskenesfluno er den dokumenterte grunnstøytingsstaden."},{"q":"Kor mange menneske omkom i Folgefonden-forliset?","o":["16","26","36"],"a":1,"k":"26 menneske omkom i Folgefonden-forliset.","t":"fact","e":"em_his_reise_transport","s":["lokalhistoriewiki_folgefonden"],"c":["omkomne","sjøulykke"],"g":["26_omkomne"],"m":"met_kildekritikk","b":"Kjeldene oppgir 26 omkomne som det sikre ulykkestalet."},{"q":"Når vart minnesmerket over forliset reist i Skånevik?","o":["1909","1958","1993"],"a":2,"k":"Minnesmerket vart reist i Skånevik i 1993, 85 år etter forliset.","t":"fact","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden","nb_folgefonden_minnet"],"c":["minnesmerke","1993"],"g":["minnesmerke_1993"],"m":"met_endring_over_tid","b":"Minnesmerket vart reist i 1993."},{"q":"Kven laga Folgefonden-minnesmerket?","o":["Arne Mæland","Lars Hertervig","Nils Aas"],"a":0,"k":"Minnesmerket er laga av kunstnaren Arne Mæland.","t":"fact","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden"],"c":["Arne Mæland","minnekunst"],"g":["arne_maeland"],"m":"met_sporlesning","b":"Arne Mæland er dokumentert som kunstnaren bak minnesmerket."}]},{"id":"historie_folgefonden_minnesmerke_skanevik_set_2","level":2,"order":2,"xp":70,"title":"Frå ulykkesstad til minnestad","questions":[{"q":"Kva står på namneplata ved minnesmerket?","o":["Namna på dei 26 omkomne","Namna på alle som var om bord","Berre namnet på skipet og kapteinen"],"a":0,"k":"Namneplata ber namna på dei 26 menneska som omkom.","t":"observation","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden"],"c":["namneplate","individuelt minne"],"g":["namna_pa_dei_omkomne"],"m":"met_sporlesning","b":"Minnesmerket namngir dei 26 omkomne."},{"q":"Kvar står dagens minnesmerke?","o":["I kaiparken ved Skånevik ferjekai","På Trøskenesfluno ute i fjorden","Ved garden Skromme"],"a":0,"k":"Minnesmerket står på land i kaiparken ved Skånevik ferjekai.","t":"fact","e":"em_his_spor_materialitet","s":["skanevik_fjordhotell_folgefonden","lokalhistoriewiki_folgefonden"],"c":["kaipark","minnestad"],"g":["kaiparken_skanevik"],"m":"met_sporlesning","b":"Kaiparken er den dokumenterte plasseringa til minnesmerket."},{"q":"Korleis blir Folgefonden-forliset omtalt i Etne si moderne historie?","o":["Som den største ulukka i kommunen i moderne tid","Som den første jernbaneulukka i Vestland","Som eit forlis utan omkomne"],"a":0,"k":"Forliset blir omtalt som den største ulukka i Etne kommune i moderne tid.","t":"fact","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden"],"c":["lokal katastrofe","kollektivt minne"],"g":["storst_ulykke_moderne_tid"],"m":"met_kontekstualisering","b":"Kjelda omtalar forliset som Etne si største ulukke i moderne tid."},{"q":"Kvifor er namna på plata viktigare enn berre eit ulykkestal?","o":["Dei knyter minnet til enkeltmenneska som døydde","Dei beviser kor mange som overlevde","Dei viser kven som hadde juridisk skuld"],"a":0,"k":"Eit tal fortel om omfanget, medan namna gjer kvar av dei omkomne synlege som enkeltmenneske. Minnesmerket handlar derfor om personar, ikkje berre om skipet.","t":"analysis","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden"],"c":["individualisering","namneminne"],"g":["namn_framfor_berre_tal"],"m":"met_kontekstualisering","b":"Namneplata individualiserer dei omkomne og motverkar at dei blir reduserte til statistikk."},{"q":"Kvifor står minnesmerket på land og ikkje på sjølve grunnstøytingsstaden?","o":["Ein tilgjengeleg offentleg stad gjer felles minning mogleg utan å flytte sjølve ulykkespunktet","Trøskenesfluno ligg inne i kaiparken","Skipet vart flytta til parken etter forliset"],"a":0,"k":"Trøskenesfluno er ulykkesstaden ute på fjorden. Kaiparken gir lokalsamfunnet ein trygg og tilgjengeleg stad for minning, samtidig som dei to stadene blir haldne geografisk frå kvarandre.","t":"analysis","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden","skanevik_fjordhotell_folgefonden"],"c":["minnestad","ulykkesstad","tilgjenge"],"g":["minnestad_ikkje_forlisstad"],"m":"met_kontekstualisering","b":"Minnestaden på land er funksjonelt og geografisk skild frå grunnstøytingsstaden."}]},{"id":"historie_folgefonden_minnesmerke_skanevik_set_3","level":3,"order":3,"xp":90,"title":"Minnekultur og kjeldekritikk","questions":[{"q":"Kva er eit minnesmerke?","o":["Eit fysisk uttrykk som held minnet om personar eller hendingar offentleg synleg","Eit nøyaktig kartpunkt for staden der ei hending skjedde","Ei juridisk avgjerd om skuld etter ei ulukke"],"a":0,"k":"Eit minnesmerke er eit fysisk og offentleg uttrykk for minne. Det kan stå ein annan stad enn sjølve hendinga og formidle kven eller kva samfunnet ønskjer å minnast.","t":"concept","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden","nb_folgefonden_minnet"],"c":["minnesmerke","offentleg minne"],"g":["omgrep_minnesmerke"],"m":"met_kontekstualisering","b":"Folgefonden-skulpturen er ein offentleg, fysisk minnestad over ei tidlegare ulukke."},{"q":"Kva er eit minnelandskap?","o":["Sambandet mellom minnesmerket, kaiparken, fjordrommet og historia som blir mint","Berre sjøbotnen rundt skipsvraket","Eit landskap som ikkje har nokon fysisk stad"],"a":0,"k":"Eit minnelandskap oppstår når stad, utsyn, monument og forteljing verkar saman. I Skånevik bind kaiparken minnesmerket til fjorden utan å vere sjølve forlisstaden.","t":"concept","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden","skanevik_fjordhotell_folgefonden"],"c":["minnelandskap","stad og minne"],"g":["omgrep_minnelandskap"],"m":"met_kontekstualisering","b":"Kaiparken og utsynet mot fjorden dannar ein fysisk ramme rundt minnet om forliset."},{"q":"Kva er eit historisk minneanker på kartet?","o":["Eit representativt punkt for staden der minnet blir formidla","Eit bevis på at hendinga skjedde nøyaktig innanfor markørradiusen","Det geometriske midtpunktet mellom alle involverte stader"],"a":0,"k":"Eit historisk minneanker viser den tilgjengelege minnestaden. Markøren ved ferjekaien peikar på monumentet, ikkje på Trøskenesfluno.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["lokalhistoriewiki_folgefonden","skanevik_fjordhotell_folgefonden"],"c":["minneanker","kartrepresentasjon"],"g":["omgrep_minneanker"],"m":"met_kildekritikk","b":"Kartmarkøren representerer minnesmerket på land og må ikkje flyttast semantisk til forlisstaden."},{"q":"Kva er kjeldekritisk riktig om talet på overlevande?","o":["Talet er usikkert og bør ikkje brukast som sikker quizfasit","Nøyaktig 45 overlevde, fordi dette vart hevda under sjøforklaringa","Ingen overlevde, sidan 26 omkom"],"a":0,"k":"Kjeldene gir usikre og varierande opplysningar om kor mange som var om bord og overlevde. Det sikre talet er 26 omkomne, medan overlevartalet må presenterast som usikkert.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["lokalhistoriewiki_folgefonden"],"c":["talusikkerheit","sjøforklaring","kjeldekritikk"],"g":["usikkert_overlevartal"],"m":"met_kildekritikk","b":"Overlevartalet er usikkert, medan talet på omkomne er stabilt dokumentert."},{"q":"Kva viser tidsrommet frå forliset i 1908 til minnesmerket i 1993?","o":["At offentleg minnekultur kan bli forma lenge etter sjølve hendinga","At forliset først vart kjent i 1993","At minnesmerket stod på Trøskenesfluno i 85 år før det vart flytta"],"a":0,"k":"Det gjekk 85 år før monumentet vart reist. Minne blir ikkje berre skapt i ulykkesøyeblikket, men kan få nye offentlege former når seinare generasjonar vel å markere historia.","t":"analysis","e":"em_his_minner_identitet","s":["lokalhistoriewiki_folgefonden","nb_folgefonden_minnet"],"c":["minnearbeid","ettertid","offentleg markering"],"g":["1908_til_1993"],"m":"met_endring_over_tid","b":"Minnesmerket frå 1993 viser korleis lokalsamfunnet gav forliset ei ny offentleg minneform 85 år seinare."}]}];
const SOURCES = {
  lokalhistoriewiki_folgefonden: 'https://lokalhistoriewiki.no/Folgefonden-forliset',
  nb_folgefonden_minnet: 'https://www.nb.no/items/143c64e52ea61481540ec2ed19ec82b3',
  skanevik_fjordhotell_folgefonden: 'https://skaanevikfjordhotel.no/'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `folgefonden_minnesmerke_skanevik_quiz_${globalNo}`,
    quiz_id: `historie_folgefonden_minnesmerke_skanevik_set_${setNo}_q${pos}`,
    categoryId: 'historie',
    placeId: TARGET,
    targetId: TARGET,
    question_scope: 'place',
    question: row.q,
    options: row.o,
    answer: row.o[row.a],
    answerIndex: row.a,
    knowledge: row.k,
    difficulty: setNo,
    question_type: row.t,
    year: row.g.includes('minnesmerke_1993') ? 1993 : 1908,
    epoke_id: 'nittenhundre_1900_1945',
    epoke_domain: 'historie',
    emne_id: row.e,
    source: row.s,
    source_origin: 'mixed',
    claim_basis: row.b,
    guidance_basis: {
      emne_id: row.e,
      canonical_files_used_as_guidance_only: GUIDANCE,
      ...(row.m ? { method_id: row.m } : {})
    },
    core_concepts: row.c,
    tags: [TARGET, ...row.g]
  };
}

function buildQuiz() {
  let globalNo = 0;
  return {
    targetId: TARGET,
    categoryId: 'historie',
    generator_version: 'quiz_standard_canonical_v2_manual_source_based',
    generated_from: [
      'data/places/historie/vestland/etne/folgefonden_minnesmerke_skanevik.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'minnesmerke',
      subtype: 'offentleg_minnestad_over_skipsforlis_med_namneplate',
      signature_features: [
        'Folgefonden grunnstøytte på Trøskenesfluno 22. august 1908',
        '26 menneske omkom',
        'Arne Mælands minnesmerke vart reist i 1993',
        'namneplata synleggjer dei omkomne som enkeltmenneske',
        'markøren viser kaiparken og ikkje grunnstøytingsstaden'
      ],
      primary_angles: ['sjøfartshistorie', 'ulykkeshistorie', 'minnekultur', 'romleg kjeldekritikk'],
      avoid_angles: ['bruke usikkert overlevartal som fasit', 'forveksle minnestad med forlisstad', 'redusere minnet til skipet utan dei omkomne']
    },
    sets: SETS.map((set, setIndex) => ({
      set_id: set.id,
      level: set.level,
      order: set.order,
      xp: set.xp,
      title: set.title,
      questions: set.questions.map((row, questionIndex) => {
        globalNo += 1;
        return expandQuestion(row, setIndex + 1, questionIndex + 1, globalNo);
      })
    }))
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function assemble() {
  const quiz = buildQuiz();
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(quiz, null, 2)}\n`, 'utf8');

  const manifest = await readJson(MANIFEST);
  manifest.sets = Array.isArray(manifest.sets) ? manifest.sets : [];
  const wanted = { targetId: TARGET, file: OUT };
  const existing = manifest.sets.find((entry) => entry?.targetId === TARGET);
  if (existing) Object.assign(existing, wanted);
  else manifest.sets.push(wanted);
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function validate() {
  const quiz = await readJson(OUT);
  const questions = quiz.sets.flatMap((set) => set.questions);
  if (quiz.targetId !== TARGET || quiz.categoryId !== 'historie') throw new Error('root target/category mismatch');
  if (quiz.sets.length !== 3 || questions.length !== 15) throw new Error('expected 3 sets and 15 questions');

  const ids = new Set();
  const quizIds = new Set();
  const families = { fact: 0, context: 0, theory: 0 };
  for (const q of questions) {
    if (q.targetId !== TARGET || q.placeId !== TARGET || q.question_scope !== 'place') throw new Error(`target mismatch: ${q.id}`);
    if (!Array.isArray(q.options) || q.options.length !== 3 || q.options[q.answerIndex] !== q.answer) throw new Error(`invalid answer: ${q.id}`);
    if (ids.has(q.id) || quizIds.has(q.quiz_id)) throw new Error(`duplicate id: ${q.id}`);
    ids.add(q.id);
    quizIds.add(q.quiz_id);
    if (q.question_type === 'concept') families.theory += 1;
    else if (q.question_type === 'analysis') families.context += 1;
    else families.fact += 1;
    if (!q.emne_id || !q.knowledge || !q.claim_basis || !q.source?.length) throw new Error(`missing metadata: ${q.id}`);
    if (!q.knowledge_unit_ids?.length || q.knowledge_link_status !== 'linked') throw new Error(`missing canonical knowledge link: ${q.id}`);
  }
  if (families.fact !== 8 || families.context !== 4 || families.theory !== 3) {
    throw new Error(`wrong balance: ${JSON.stringify(families)}`);
  }

  const manifest = await readJson(MANIFEST);
  const hits = manifest.sets.filter((entry) => entry?.targetId === TARGET && entry?.file === OUT);
  if (hits.length !== 1) throw new Error(`manifest registration count: ${hits.length}`);
  console.log(JSON.stringify({ target: TARGET, sets: quiz.sets.length, questions: questions.length, families }, null, 2));
}

const mode = process.argv[2];
if (mode === 'assemble') await assemble();
else if (mode === 'validate') await validate();
else throw new Error('Usage: node .tmp/bootstrap-folgefonden-minnesmerke.mjs assemble|validate');
