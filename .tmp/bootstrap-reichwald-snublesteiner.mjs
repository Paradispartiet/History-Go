import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'reichwald_snublesteiner_skanevik';
const OUT = 'data/quiz/historie/reichwald_snublesteiner_skanevik_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_reichwald_snublesteiner_skanevik_set_1","level":1,"order":1,"xp":50,"title":"Tre namn i Skånevik","questions":[{"q":"Kven er dei tre snublesteinane i Skånevik lagde for?","o":["Hans, Edith og Harry Reichwald","Jacob, Jeanette og Wilhelm Reichwald","Moritz, Johanne og Edith Rabinowitz"],"a":0,"k":"Steinane ved Skånevikvegen 10 minnast Hans, Edith og sonen Harry Reichwald.","t":"fact","e":"em_his_minner_identitet","s":["snublestein_hans","snublestein_edith","snublestein_harry"],"c":["Hans Reichwald","Edith Reichwald","Harry Reichwald"],"g":["tre_namn"],"m":"met_sporlesning","b":"Tre separate snublesteinar ved adressa ber namna Hans, Edith og Harry Reichwald."},{"q":"Kvar ligg Reichwald-familien sine snublesteinar?","o":["Skånevikvegen 10","Skånevikvegen 1","Etnevegen 10"],"a":0,"k":"Snublesteinane ligg ved familien si dokumenterte adresse, Skånevikvegen 10.","t":"fact","e":"em_his_spor_materialitet","s":["snublestein_hans","snublestein_edith","snublestein_harry"],"c":["bustadadresse","Skånevikvegen 10"],"g":["skanevikvegen_10"],"m":"met_sporlesning","b":"Snublestein.no plasserer alle tre steinane ved Skånevikvegen 10."},{"q":"Kvar var Hans Reichwald fødd?","o":["Wien","Bergen","Skånevik"],"a":0,"k":"Hans Reichwald vart fødd i Wien i 1916 og kom til Noreg som jødisk flyktning i 1938.","t":"fact","e":"em_his_makt_motstand","s":["snublestein_hans","fanger_hans"],"c":["Wien","jødisk flyktning","1938"],"g":["hans_fra_wien"],"m":"met_kontekstualisering","b":"Hans Reichwald var fødd i Wien og flykta til Noreg i 1938."},{"q":"Kva arbeid hadde Hans Reichwald i Skånevik?","o":["Han dreiv sykkelverkstad og arbeidde som reparatør","Han var prest i Skånevik kyrkje","Han dreiv gjestgjevarstaden"],"a":0,"k":"Hans var utdanna maskinmontør og dreiv sykkelverkstad eller arbeidde som reparatør i Skånevik.","t":"fact","e":"em_his_hverdagsliv_praksiser","s":["snublestein_hans","fanger_hans"],"c":["sykkelverkstad","reparatør","kvardagsliv"],"g":["hans_arbeid"],"m":"met_kontekstualisering","b":"Kjeldene dokumenterer Hans som maskinmontør, reparatør og innehavar av sykkelverkstad."},{"q":"Når vart Hans Reichwald arrestert?","o":["26. oktober 1942","26. november 1942","25. februar 1943"],"a":0,"k":"Hans Reichwald vart arrestert 26. oktober 1942 av norsk politi og den lokale lensmannen.","t":"fact","e":"em_his_makt_motstand","s":["snublestein_hans","fanger_hans"],"c":["arrestasjon","norsk politi","lensmann"],"g":["hans_arrestert_26_oktober"],"m":"met_kildekritikk","b":"Arrestasjonen 26. oktober 1942 vart gjennomført av norske politimyndigheiter."}]},{"id":"historie_reichwald_snublesteiner_skanevik_set_2","level":2,"order":2,"xp":70,"title":"Arrestasjon og deportasjon","questions":[{"q":"Kva skip vart Hans Reichwald deportert med 26. november 1942?","o":["Donau","Gotenland","Folgefonden"],"a":0,"k":"Hans Reichwald vart deportert frå Oslo med Donau 26. november 1942.","t":"fact","e":"em_his_makt_motstand","s":["snublestein_hans","fanger_hans"],"c":["Donau","deportasjon"],"g":["hans_med_donau"],"m":"met_periodisering","b":"Hans vart deportert med Donau 26. november 1942."},{"q":"Kva skip vart Edith og Harry Reichwald deporterte med?","o":["Gotenland","Donau","Hydro"],"a":0,"k":"Edith og Harry vart deporterte med Gotenland 25. februar 1943.","t":"fact","e":"em_his_makt_motstand","s":["snublestein_edith","snublestein_harry"],"c":["Gotenland","deportasjon"],"g":["edith_harry_med_gotenland"],"m":"met_periodisering","b":"Edith og Harry vart deporterte med Gotenland 25. februar 1943."},{"q":"Kor gammal var Harry Reichwald då han vart drepen i Auschwitz?","o":["To år","Tolv år","Tjue år"],"a":0,"k":"Harry Reichwald var to år gammal då han og mora Edith vart drepne ved ankomsten til Auschwitz 3. mars 1943.","t":"fact","e":"em_his_minner_identitet","s":["snublestein_harry","snublestein_edith"],"c":["Harry Reichwald","barn under Holocaust"],"g":["harry_to_ar"],"m":"met_kontekstualisering","b":"Harry var fødd i november 1940 og vart drepen 3. mars 1943."},{"q":"Kvifor må Hans si deportasjon skiljast frå Edith og Harry si?","o":["Dei vart arresterte og deporterte på ulike tidspunkt og med ulike skip","Berre Hans vart forfølgd som jøde","Edith og Harry reiste frivillig etter Hans"],"a":0,"k":"Hans vart arrestert først og sendt med Donau. Edith og Harry vart arresterte seinare og deporterte med Gotenland. Ei presis framstilling held dei tre dokumenterte forløpa frå kvarandre.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["fanger_hans","snublestein_edith","snublestein_harry"],"c":["individuelle tidslinjer","deportasjonsforløp"],"g":["skilde_tidslinjer"],"m":"met_kildekritikk","b":"Familien vart ikkje deportert samla; kjeldene dokumenterer ulike arrestasjons- og transportforløp."},{"q":"Kva viser arrestasjonen av Hans i Skånevik om Holocaust i Noreg?","o":["Norske politi- og lensmannsorgan deltok i arrestasjonane som førte til deportasjon","Arrestasjonane i Noreg vart berre gjennomførte av tyske soldatar","Lokale styresmakter prøvde aldri å finne jødiske innbyggjarar"],"a":0,"k":"Norsk politi og lokale lensmenn gjennomførte arrestasjonar og overleverte jødar til internering og deportasjon. Holocaust i Noreg vart derfor gjennomført gjennom både norske og tyske institusjonar.","t":"analysis","e":"em_his_makt_motstand","s":["snublestein_hans","fanger_hans"],"c":["norsk medverknad","politiapparat","Holocaust i Noreg"],"g":["norske_arrestasjonar"],"m":"met_kontekstualisering","b":"Hans vart arrestert av norske myndigheiter før deportasjonen til det tyske leirsystemet."}]},{"id":"historie_reichwald_snublesteiner_skanevik_set_3","level":3,"order":3,"xp":90,"title":"Snublesteinar og stadbunde minne","questions":[{"q":"Kva er ein snublestein?","o":["Ei lita minneplate i gateplanet ved ein person sin siste frivillige bustad","Ein gravstein reist på sjølve dødsstaden","Ein generell krigsstatue utan personnamn"],"a":0,"k":"Ein snublestein er ei lita minneplate lagd i gateplanet ved ein stad knytt til livet til eit offer for nazismen. Namn og lagnad blir førte tilbake til kvardagsrommet.","t":"concept","e":"em_his_minner_identitet","s":["snublestein_hans","snublestein_edith","snublestein_harry"],"c":["snublestein","stadbunde minne"],"g":["omgrep_snublestein"],"m":"met_kontekstualisering","b":"Reichwald-steinane ligg i gateplanet ved familien si adresse i Skånevik."},{"q":"Kva betyr deportasjon i Reichwald-familien si historie?","o":["Tvangstransport ut av Noreg til det nazistiske leir- og drapssystemet","Frivillig flytting til ein trygg stad i Sverige","Mellombels evakuering til ein annan norsk kommune"],"a":0,"k":"Deportasjon var tvungen transport under vakthald frå norsk fangenskap og ut av landet til det nazistiske leir- og drapssystemet.","t":"concept","e":"em_his_makt_motstand","s":["fanger_hans","snublestein_edith","snublestein_harry"],"c":["deportasjon","tvangstransport"],"g":["omgrep_deportasjon"],"m":"met_kontekstualisering","b":"Hans, Edith og Harry vart tvangstransporterte ut av Noreg som del av jødeforfølginga."},{"q":"Kva betyr Holocaust i denne lokale historia?","o":["Det systematiske nazistiske folkemordet på Europas jødar, gjennomført også via arrestasjonar i Noreg","Alle krigshandlingar som skjedde i Skånevik mellom 1940 og 1945","Berre livet i Auschwitz etter at fangane hadde kome fram"],"a":0,"k":"Holocaust var det systematiske nazistiske folkemordet på Europas jødar. Reichwald-familien si historie viser korleis registrering, arrestasjon, norsk fangenskap, deportasjon og drap hang saman.","t":"concept","e":"em_his_makt_motstand","s":["fanger_hans","snublestein_hans","snublestein_edith","snublestein_harry"],"c":["Holocaust","folkemord","forfølgingsapparat"],"g":["omgrep_holocaust"],"m":"met_kontekstualisering","b":"Dei tre vart forfølgde og drepne som jødar i det nazistiske folkemordet."},{"q":"Kvifor er plasseringa ved familien si adresse historisk viktig?","o":["Ho knyter eit europeisk folkemord til menneske som levde kvardagsliv i Skånevik","Ho viser at Auschwitz låg ved Skånevikvegen 10","Ho beviser at alle arrestasjonane skjedde på nøyaktig same punkt"],"a":0,"k":"Adressa minner om at Hans, Edith og Harry var naboar og familiemedlemmer før dei vart offer. Den lokale staden gjer den større historia konkret utan å forveksle bustaden med fengsla eller drapsstadene.","t":"analysis","e":"em_his_minner_identitet","s":["snublestein_hans","snublestein_edith","snublestein_harry"],"c":["bustadminne","lokalhistorie","kvardagsliv"],"g":["adresse_gjer_historia_lokal"],"m":"met_kontekstualisering","b":"Steinane fører namna tilbake til den dokumenterte bustadadressa i Skånevik."},{"q":"Kvifor ligg det éin stein for kvar av dei tre?","o":["Kvar person får namn, liv og lagnad synleggjord kvar for seg","Familien budde på tre ulike adresser i Skånevik","Steinane markerer tre ulike konsentrasjonsleirar"],"a":0,"k":"Tre individuelle steinar hindrar at familien blir redusert til ei anonym gruppe. Hans, Edith og Harry blir minna som tre menneske med ulike liv og dokumenterte forløp.","t":"analysis","e":"em_his_minner_identitet","s":["snublestein_hans","snublestein_edith","snublestein_harry"],"c":["individualisering","personminne","namn"],"g":["ein_stein_per_person"],"m":"met_kildekritikk","b":"Dei tre separate minneplatene gjer kvar person synleg og støttar presis personhistorie."}]}];
const SOURCES = {
  snublestein_hans: 'https://www.snublestein.no/Hans-Reichwald/p%3D557/',
  snublestein_edith: 'https://www.snublestein.no/Edith-Reichwald/p%3D558/',
  snublestein_harry: 'https://www.snublestein.no/Harry-Reichwald/p%3D559/',
  fanger_hans: 'https://www.fanger.no/persons/30329',
  fanger_edith: 'https://www.fanger.no/persons/30330',
  fanger_harry: 'https://www.fanger.no/persons/30328'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `reichwald_snublesteiner_skanevik_quiz_${globalNo}`,
    quiz_id: `historie_reichwald_snublesteiner_skanevik_set_${setNo}_q${pos}`,
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
    year: 1942,
    epoke_id: 'andre_verdenskrig',
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
      'data/places/historie/vestland/etne/reichwald_snublesteiner_skanevik.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'snublesteinar',
      subtype: 'tre_personlege_minnesteinar_for_holocaustofre_ved_familieadressa',
      signature_features: [
        'tre steinar for Hans, Edith og Harry Reichwald',
        'plassering ved Skånevikvegen 10',
        'Hans arrestert av norsk politi og lensmann 26. oktober 1942',
        'Hans deportert med Donau, Edith og Harry med Gotenland',
        'norsk arrestasjon og deportasjon knytt til Holocaust i ein lokal familiehistorie'
      ],
      primary_angles: ['Holocaust i Noreg', 'personhistorie', 'norsk medverknad', 'stadbunde minnekultur'],
      avoid_angles: ['generalisere bort dei tre personane', 'framstille arrestasjonane som berre tysk handling', 'slå saman dei ulike deportasjonsforløpa']
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
else throw new Error('Usage: node .tmp/bootstrap-reichwald-snublesteiner.mjs assemble|validate');
