import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'borgasen_etne';
const OUT = 'data/quiz/historie/borgasen_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_borgasen_etne_set_1","level":1,"order":1,"xp":50,"title":"Borga i terrenget","questions":[{"q":"Kva type kulturminne er Borgåsen?","o":["Ei bygdeborg","Eit gravfelt","Eit helleristningsfelt"],"a":0,"k":"Borgåsen er ei bygdeborg, eit befestingsanlegg på ei naturleg verna høgd.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["bygdeborg","befestingsanlegg"],"g":["bygdeborg"],"m":"met_sporlesning","b":"Borgåsen er ei bygdeborg med murrestar på ei strategisk høgd."},{"q":"Kor ligg Borgåsen i høve til Etnepollen?","o":["På nordsida av Etnepollen","På sørsida av Etnepollen","Ved den inste enden av Stordalsvatnet"],"a":1,"k":"Borgåsen ligg på sørsida av Etnepollen.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["Etnepollen","plassering"],"g":["sorsida_etnepollen"],"m":"met_sporlesning","b":"Borgåsen ligg på sørsida av Etnepollen."},{"q":"Kva kjenneteiknar sjølve toppområdet på Borgåsen?","o":["Ein smal rygg med brattkant på éi side","Ei open skråning utan naturleg vern","Eit flatt parti med stup på tre sider"],"a":2,"k":"På toppen ligg eit flatt parti som er verna av stup på tre sider.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["toppområde","naturleg vern"],"g":["stup_tre_sider"],"m":"met_sporlesning","b":"Toppen har eit flatt parti med stup på tre sider."},{"q":"Kvar vart den største muren lagd?","o":["På den fjerde og mest framkomelege sida","Langs alle fire sidene av toppen","Berre langs dei tre stupbratte sidene"],"a":0,"k":"Ein stor mur vart lagd på den fjerde sida, der tilkomsten til borgområdet var lettast.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["steinmur","tilkomst"],"g":["forsvarsmur"],"m":"met_sporlesning","b":"Den mest framkomelege sida vart stengd med ein stor mur."},{"q":"Kva landskap har ein fullt utsyn over frå Borgåsen?","o":["Skånevikfjorden vest for bygda","Innseglinga til Etnebygda","Den øvre delen av Stordalen"],"a":1,"k":"Frå Borgåsen er det fullt utsyn over innseglinga til Etnebygda.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["utsyn","innsegling"],"g":["utsyn_etnebygda"],"m":"met_sporlesning","b":"Frå Borgåsen er det fullt utsyn over innseglinga til Etnebygda."}]},{"id":"historie_borgasen_etne_set_2","level":2,"order":2,"xp":70,"title":"Forsvar i Sunnhordland","questions":[{"q":"Kor mange kjende bygdeborger finst det i Etne?","o":["To","Seks","Fire"],"a":2,"k":"Kringom oppgir fire kjende bygdeborger i Etne.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["bygdeborger","Etne"],"g":["fire_bygdeborger"],"m":"met_sporlesning","b":"I Etne finst det fire kjende bygdeborger."},{"q":"Kva periodar blir bygdeborgene i området vanlegvis knytte til?","o":["Romartid og folkevandringstid","Bronsealder og førromersk jernalder","Vikingtid og tidleg mellomalder"],"a":0,"k":"Bygdeborgene blir i oversikta knytte til romartid og folkevandringstid, fram mot om lag år 600.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["romartid","folkevandringstid"],"g":["jernalder"],"m":"met_periodisering","b":"Bygdeborger av denne typen blir knytte til romartid og folkevandringstid."},{"q":"Kva er dei viktigaste synlege spora etter anlegget i dag?","o":["Gravkammer og runesteinar","Murrester og terrengforma","Dokumenterte hustufter og ein brønn"],"a":1,"k":"På Borgåsen er murrestane, det flate toppområdet, stupa og utsynet dei viktigaste synlege spora.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["murrester","terrengform"],"g":["synlege_spor"],"m":"met_sporlesning","b":"Murrester og terrengform er dei viktigaste synlege spora etter Borgåsen."},{"q":"Kvifor var høgda godt eigna til forsvar?","o":["Den flate toppen gav store jordbruksareal","Muren gav ly mot vind frå fjorden","Stupa avgrensa tilkomsten, og muren sperra den lettaste vegen"],"a":2,"k":"Stupa på tre sider reduserte talet på moglege angrepsvegar, medan muren stengde den mest framkomelege sida.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["forsvarslandskap","tilkomstkontroll"],"g":["strategisk_terreng"],"m":"met_kontekstualisering","b":"Stupa avgrensa tilkomsten, og muren sperra den lettaste vegen inn."},{"q":"Kva viser kombinasjonen av stup og mur?","o":["Forsvaret utnytta naturleg vern og forsterka den svakaste sida","Toppen vart delt i faste bustadskvarter av muren","Stupa var utan betydning fordi heile borga var omringa av mur"],"a":0,"k":"Anlegget kombinerte naturleg vern med ein menneskebygd barriere der terrenget gav minst vern.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["naturleg vern","menneskebygd forsvar"],"g":["terreng_og_mur"],"m":"met_kontekstualisering","b":"Anlegget utnytta stupa og forsterka den mest tilgjengelege sida med mur."}]},{"id":"historie_borgasen_etne_set_3","level":3,"order":3,"xp":90,"title":"Kjelder og tolking","questions":[{"q":"Kva er ei bygdeborg?","o":["Ein permanent kongeborg bygd av hoggen stein","Eit befestingsanlegg på ei høgd som utnyttar terreng og sperrer","Ein gravhaug som seinare vart brukt som utkikkspunkt"],"a":1,"k":"Ei bygdeborg er eit befestingsanlegg på ein topp eller fjellknaus. Bratte sider gav naturleg vern, medan murar eller vollar stengde lettare tilkomstvegar.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_borgasen"],"c":["bygdeborg","befestingsanlegg"],"g":["omgrep_bygdeborg"],"m":"met_sporlesning","b":"Bygdeborger utnyttar naturleg vanskeleg terreng og menneskebygde sperrer."},{"q":"Kringom nemner at bygdeborger kan ha hatt palisadar. Kva er ein palisade?","o":["Ein steinvoll fylt med jord","Ei grøft som samlar regnvatn","Eit tett gjerde eller vern av ståande trestokkar"],"a":2,"k":"Ein palisade er eit vern av ståande trestokkar. Slike trekonstruksjonar kan ha komplettert steinmurane, men ein palisade er ikkje dokumentert sikkert på Borgåsen.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_borgasen"],"c":["palisade","forgjengeleg materiale"],"g":["omgrep_palisade"],"m":"met_kildekritikk","b":"Bygdeborger kan ha hatt palisadar av tre i tillegg til murar, men dette er ikkje sikkert dokumentert på Borgåsen."},{"q":"Kva betyr ei siktlinje mellom bygdeborger?","o":["At ein kan sjå frå eitt borgområde mot eit anna","At borgene er bundne saman av ein oppmurt veg","At lydsignal alltid kan høyrast mellom borgene"],"a":0,"k":"Ei siktlinje betyr at to punkt har direkte visuelt samband. Frie siktliner kan ha gjort varsling og oversyn mogleg, utan å bevise at alle borgene inngjekk i eitt system.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_borgasen"],"c":["siktlinje","visuelt samband"],"g":["omgrep_siktlinje"],"m":"met_kontekstualisering","b":"Fleire bygdeborger i Sunnhordland ligg med frie siktliner mellom seg."},{"q":"Kva er kjeldekritisk forsvarleg å seie om funksjonen til Borgåsen?","o":["Borga var sikkert hovudsetet til ein namngitt høvding","Ho kan ha vore tilfluktsstad eller del av eit større forsvar","Ho vart berre brukt som innhegning for husdyr"],"a":1,"k":"Bygdeborgene er lite arkeologisk undersøkte. Borgåsen kan ha vore eit lokalt tilfluktssted eller del av eit meir organisert regionalt forsvar, men funksjonen er ikkje sikkert fastslått.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_borgasen"],"c":["kjeldekritikk","funksjonstolking"],"g":["usikker_funksjon"],"m":"met_kildekritikk","b":"Borgåsen kan ha hatt fleire moglege forsvarsfunksjonar, men ingen av dei er sikkert bevist."},{"q":"Kva kan samlinga av bygdeborger, frie siktliner og rike gravfunn i Sunnhordland tyde på?","o":["At alle borgene vart bygde same året av éin konge","At plasseringa var tilfeldig og utan samband med maktmiljø","At nokre borger kan ha inngått i eit organisert regionalt forsvar"],"a":2,"k":"Tolv av dei nitten kjende bygdeborgene i det historiske Hordaland ligg samla i Sunnhordland. Siktliner, tett busetnad og rike gravfunn kan tyde på at lokale høvdingar organiserte forsvar, men beviser ikkje eitt samla rike eller éin byggeplan.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_borgasen"],"c":["regional makt","organisert forsvar","arkeologisk tolking"],"g":["sunnhordland_forsvar"],"m":"met_kontekstualisering","b":"Konsentrasjonen av borger, siktliner og rike gravfunn kan tyde på organisert regionalt forsvar, utan å bevise eitt samla system."}]}];
const SOURCES = {
  kringom_borgasen: 'https://www.kringom.no/nb/borgasen'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `borgasen_etne_quiz_${globalNo}`,
    quiz_id: `historie_borgasen_etne_set_${setNo}_q${pos}`,
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
    epoke_id: 'jernalder',
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
      'data/places/historie/vestland/etne/borgasen_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'bygdeborg',
      subtype: 'strategisk_hogdeborg_med_murrester_og_fjordutsyn',
      signature_features: [
        'flatt toppområde med stup på tre sider',
        'stor mur på den mest framkomelege sida',
        'utsyn over innseglinga til Etnebygda',
        'ei av fire kjende bygdeborger i Etne',
        'usikker funksjon fordi anlegga er lite undersøkte'
      ],
      primary_angles: ['jernalder', 'forsvarslandskap', 'regional makt', 'arkeologisk kjeldekritikk'],
      avoid_angles: ['fastslå eksakt datering utan funn', 'fastslå éin sikker funksjon', 'presentere regionalt forsvar som bevist system']
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
else throw new Error('Usage: node .tmp/bootstrap-borgasen.mjs assemble|validate');
