import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'postvegen_rullestadjuvet';
const OUT = 'data/quiz/historie/postvegen_rullestadjuvet_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_postvegen_rullestadjuvet_set_1","level":1,"order":1,"xp":50,"title":"Postvegen gjennom juvet","questions":[{"q":"Kvar startar den restaurerte Postvegen i Rullestadjuvet?","o":["Ved garden Skromme","Ved Gjerde kyrkje","Ved Kyrping kai"],"a":0,"k":"Den restaurerte ruta startar ved garden Skromme og går ned gjennom Rullestadjuvet.","t":"fact","e":"em_his_spor_materialitet","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["Skromme","ruteanker"],"g":["start_skromme"],"m":"met_sporlesning","b":"Skromme er det dokumenterte startpunktet for den restaurerte ruta."},{"q":"Kor lang er den historiske turstrekninga om lag?","o":["To kilometer","Fem kilometer","Åtte kilometer"],"a":0,"k":"Den restaurerte historiske strekninga er om lag to kilometer lang.","t":"fact","e":"em_his_spor_materialitet","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["rutelengd","historisk trase"],"g":["om_lag_to_kilometer"],"m":"met_sporlesning","b":"Visit Norway og Fjord Norway oppgir ei om lag to kilometer lang rute."},{"q":"Når stod kløvvegen gjennom Rullestadjuvet ferdig?","o":["1850","1870","1890"],"a":1,"k":"Kløvvegen stod ferdig i 1870.","t":"fact","e":"em_his_spor_materialitet","s":["etne_kulturmiljoplan_rullestad"],"c":["kløvveg","1870"],"g":["ferdig_1870"],"m":"met_periodisering","b":"Etne kommune dokumenterer ferdigstillinga av kløvvegen i 1870."},{"q":"Kva fysisk spor bind ruta direkte til byggjeåret?","o":["Årstalet 1870 er rissa inn i fjellet","Ei minnestein frå 1905 står midt i vegen","Alle bruene har støypte årstal frå 1877"],"a":0,"k":"Årstalet 1870 er rissa inn i fjellet to stader langs ruta.","t":"observation","e":"em_his_spor_materialitet","s":["etne_kulturmiljoplan_rullestad"],"c":["innskrift","dateringsspor"],"g":["1870_rissa_i_fjellet"],"m":"met_sporlesning","b":"To innrissa 1870-tal fungerer som fysiske dateringsspor langs vegen."},{"q":"Kva endring vart gjord med vegen i 1877?","o":["Han vart utbetra frå kløvveg til kjerreveg","Han vart stengd og erstatta av tunnel","Han vart bygd om til jernbane"],"a":0,"k":"I 1877 vart kløvvegen utbetra til kjerreveg.","t":"fact","e":"em_his_spor_materialitet","s":["etne_kulturmiljoplan_rullestad"],"c":["kjerreveg","vegutbetring"],"g":["kjerreveg_1877"],"m":"met_endring_over_tid","b":"Vegen fekk høgare standard som kjerreveg i 1877."}]},{"id":"historie_postvegen_rullestadjuvet_set_2","level":2,"order":2,"xp":70,"title":"Reisande og vegstandard","questions":[{"q":"Kven blir særleg knytte til ferdselen på ruta?","o":["Postbønder, krøtterdrivarar og andre reisande","Berre soldatar og tollarar","Berre pilegrimar til Røldal"],"a":0,"k":"Kjeldene knyter vegen til postbønder, krøtterdrivarar og andre reisande gjennom juvet.","t":"fact","e":"em_his_hverdagsliv_praksiser","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["postbønder","krøtterdrivarar","reisande"],"g":["brukargrupper"],"m":"met_kontekstualisering","b":"Fleire brukargrupper nytta postvegen gjennom Rullestadjuvet."},{"q":"Kva kunstnar blir omtalt som ein som skal ha gått vegen?","o":["Lars Hertervig","Edvard Munch","J.C. Dahl"],"a":0,"k":"Landskapsmålaren Lars Hertervig blir omtalt som ein reisande som skal ha gått denne vegen.","t":"fact","e":"em_his_hverdagsliv_praksiser","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["Lars Hertervig","historisk reisande"],"g":["lars_hertervig"],"m":"met_kildekritikk","b":"Reiselivskjeldene knyter Lars Hertervig til ferdsel på ruta, formulert som tradisjon og ikkje detaljert reisedokumentasjon."},{"q":"Når var restaureringa av den historiske ruta ferdig?","o":["1989","1999","2009"],"a":2,"k":"Den restaurerte turvegen vart ferdig i 2009.","t":"fact","e":"em_his_kulturminner_bevaring","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["restaurering","2009"],"g":["restaurert_2009"],"m":"met_endring_over_tid","b":"Visit Norway og Fjord Norway oppgir 2009 som året restaureringa vart ferdig."},{"q":"Kvifor vart kløvvegen utbetra til kjerreveg berre sju år etter ferdigstillinga?","o":["Transportkrava voks, og hjulgåande ferdsel trong breiare og jamnare veg","Postferdsla vart avvikla og vegen skulle berre brukast av gåande","Juvet vart mindre bratt etter eit jordskjelv"],"a":0,"k":"Overgangen frå kløv til kjerre kravde større breidd, bereevne og jamnare parti. Utbetringa viser rask utvikling i krava til offentleg ferdsel.","t":"analysis","e":"em_his_spor_materialitet","s":["etne_kulturmiljoplan_rullestad"],"c":["transportkrav","vegstandard","hjulgåande ferdsel"],"g":["rask_standardheving"],"m":"met_kontekstualisering","b":"Utbetringa frå 1870 til 1877 viser at ruta raskt måtte tilpassast kjerretransport."},{"q":"Kvifor ligg vegen tett langs elva gjennom juvet?","o":["Terrenget avgrensa moglege passasjar mellom fjell, elv, fossar og stup","Postvesenet kravde at alle vegar skulle følgje rennande vatn","Elva gav ei flat og risikofri byggjeflate gjennom heile juvet"],"a":0,"k":"Rullestadjuvet gav få moglege ferdselsliner. Vegen måtte tilpassast smale parti langs elva og førast forbi fossar, stup og bratte fjellsider.","t":"analysis","e":"em_his_landskap_makt_identitet","s":["visit_norway_rullestad","fjord_norway_rullestad","etne_kulturmiljoplan_rullestad"],"c":["terrengtilpassing","juv","ferdselskorridor"],"g":["terreng_formar_vegen"],"m":"met_kontekstualisering","b":"Den dramatiske naturforma styrte kor postvegen kunne leggjast."}]},{"id":"historie_postvegen_rullestadjuvet_set_3","level":3,"order":3,"xp":90,"title":"Kløvveg, kjerreveg og restaurering","questions":[{"q":"Kva er ein kløvveg?","o":["Ein veg for gåande, ridande og lastedyr med kløv","Ein brei veg for vogner med fire hjul","Ein vinterveg som berre kan brukast med slede"],"a":0,"k":"Ein kløvveg er tilpassa menneske, hestar og andre lastedyr som ber last på ryggen. Han kan vere smalare og brattare enn ein kjerreveg.","t":"concept","e":"em_his_hverdagsliv_praksiser","s":["etne_kulturmiljoplan_rullestad"],"c":["kløvveg","lastedyr"],"g":["omgrep_klovveg"],"m":"met_kontekstualisering","b":"Rullestadvegen vart først bygd som kløvveg i 1870."},{"q":"Kva er ein kjerreveg?","o":["Ein veg tilpassa enkle hjulkøyretøy og kjerretransport","Ein merka pilegrimssti utan plass til dyr","Ein veg som berre postbonden kunne bruke"],"a":0,"k":"Ein kjerreveg har breidd og underlag som gjer det mogleg å bruke kjerre eller andre enkle hjulkøyretøy.","t":"concept","e":"em_his_spor_materialitet","s":["etne_kulturmiljoplan_rullestad"],"c":["kjerreveg","hjulkøyretøy"],"g":["omgrep_kjerreveg"],"m":"met_sporlesning","b":"Ruta vart utbetra til kjerreveg i 1877."},{"q":"Kva var ein postbonde?","o":["Ein gardbrukar med plikt til å føre post vidare på ei rute","Ein bonde som berre selde varer ved eit postkontor","Ein embetsmann som teikna kart over vegane"],"a":0,"k":"Ein postbonde hadde ansvar for å transportere post vidare mellom etappar, ofte med hest og innan bestemte pliktsystem.","t":"concept","e":"em_his_hverdagsliv_praksiser","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["postbonde","transportplikt"],"g":["omgrep_postbonde"],"m":"met_kontekstualisering","b":"Postbønder var blant dei sentrale brukarane av ruta gjennom Rullestadjuvet."},{"q":"Kva er kjeldekritisk riktig om den restaurerte vegen?","o":["Restaureringa gjer traseen lesbar og farbar, men han er ikkje nødvendigvis urørt frå 1870","Alle synlege steinar ligg sikkert nøyaktig som ved ferdigstillinga i 1870","Restaureringa sletta alle eldre spor og laga ein heilt ny turistveg"],"a":0,"k":"Restaurering kan rydde, sikre, byggje opp att og erstatte skadde parti. Dagens turveg formidlar den historiske linja utan å vere eit urørt originalanlegg.","t":"analysis","e":"em_his_kulturminner_bevaring","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["restaurering","autentisitet","kulturminnevern"],"g":["restaurert_ikkje_uroert"],"m":"met_kildekritikk","b":"Den ferdig restaurerte ruta frå 2009 inneheld både historiske og istandsette parti."},{"q":"Kvifor representerer markøren ved Skromme ikkje heile Postvegen?","o":["Skromme er eit startanker for ei om lag to kilometer lang lineær rute","Alle historiske vegdelar er flytta og samla ved Skromme","Ruta vart berre brukt inne på sjølve garden"],"a":0,"k":"Kartmarkøren hjelper brukaren til startpunktet, medan kulturminnet strekkjer seg ned gjennom juvet til gardane ved Rullestadvatnet.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["visit_norway_rullestad","fjord_norway_rullestad"],"c":["linjeanker","lineært kulturminne","ruteutstrekning"],"g":["skromme_er_startanker"],"m":"met_kildekritikk","b":"Skromme er startpunkt for ruta, ikkje geometrisk sentrum eller heile kulturminnet."}]}];
const SOURCES = {
  etne_kulturmiljoplan_rullestad: 'https://www.etne.kommune.no/_f/p1/i3e3c0bb7-eb12-4fd0-83e4-93a1926fa478/vedlegg-3-omsynssoner-a-med-verdikriteria-docx.pdf',
  visit_norway_rullestad: 'https://www.visitnorway.no/listings/postvegen-i-rullestadjuvet/23420/',
  fjord_norway_rullestad: 'https://www.fjordnorway.com/no/se-og-gjore/postvegen-i-rullestadjuvet'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `postvegen_rullestadjuvet_quiz_${globalNo}`,
    quiz_id: `historie_postvegen_rullestadjuvet_set_${setNo}_q${pos}`,
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
    year: null,
    epoke_id: 'attenhundretallet',
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
      'data/places/historie/vestland/etne/postvegen_rullestadjuvet.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'historisk_postveg',
      subtype: 'klovveg_fra_1870_utbetra_til_kjerreveg_i_1877_gjennom_juv',
      signature_features: [
        'start ved Skromme og om lag to kilometer gjennom Rullestadjuvet',
        'kløvveg ferdig i 1870 med årstalet rissa i fjellet',
        'utbetra til kjerreveg i 1877',
        'brukt av postbønder, krøtterdrivarar og andre reisande',
        'restaurert ferdig i 2009'
      ],
      primary_angles: ['posthistorie', 'vegstandard', 'ferdselslandskap', 'kulturminnerestaurering'],
      avoid_angles: ['blande ruta med Postvegen Etne–Skånevik', 'presentere dagens sti som urørt original', 'behandle Skromme-markøren som heile ruta']
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
else throw new Error('Usage: node .tmp/bootstrap-postvegen-rullestadjuvet.mjs assemble|validate');
