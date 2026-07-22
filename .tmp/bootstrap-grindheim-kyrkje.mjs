import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'grindheim_kyrkje_etne';
const OUT = 'data/quiz/historie/grindheim_kyrkje_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_grindheim_kyrkje_etne_set_1","level":1,"order":1,"xp":50,"title":"Kyrkjestaden og tømmerkyrkja","questions":[{"q":"Når er kyrkjestaden på Grindheim først nemnd i ei skriftleg kjelde?","o":["1326","1426","1526"],"a":0,"k":"Grindheim kyrkje er først nemnd i ei skriftleg kjelde frå 1326.","t":"fact","e":"em_his_kirke_kloster_middelalder","s":["norges_kirker_grindheim"],"c":["kyrkjestad","skriftleg kjelde"],"g":["1326"],"m":"met_kildekritikk","b":"Kyrkjestaden på Grindheim er skriftleg kjend frå 1326."},{"q":"Når vart dagens tømmerkyrkje mest sannsynleg bygd?","o":["Omkring 1683–1684","Omkring 1723–1724","Omkring 1763–1764"],"a":1,"k":"Norges Kirker vurderer det som mest sannsynleg at kyrkja vart bygd mellom juli 1723 og mars 1724.","t":"fact","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["datering","tømmerkyrkje"],"g":["1723_1724"],"m":"met_periodisering","b":"Dagens kyrkje vart mest sannsynleg bygd i 1723–1724."},{"q":"Kva hovudform har dagens Grindheim kyrkje?","o":["Ei einskipa lafta tømmerkyrkje med smalare kor i aust","Ei treskipa steinkyrkje med apsis i vest","Ei krosskyrkje i bindingsverk med sentraltårn"],"a":0,"k":"Kyrkja er einskipa og lafta i tømmer, med eit smalare og lågare, rett avslutta kor i aust.","t":"observation","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["langkyrkje","laft","kor"],"g":["kyrkjeform"],"m":"met_sporlesning","b":"Grindheim er ei einskipa lafta tømmerkyrkje med smalare kor i aust."},{"q":"Kva vart gjort med skipet i 1854?","o":["Det vart korta inn mot aust","Det vart lengt mot vest","Det vart bygd om til stein"],"a":1,"k":"I 1854 vart veggene skorne av og skipet lengt mot vest med nye veggstykke.","t":"fact","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["utviding","skip"],"g":["1854"],"m":"met_endring_over_tid","b":"Skipet vart lengt mot vest i 1854."},{"q":"Når vart kyrkja restaurert under leiing av E. Knoph og K. Bjerknes?","o":["1934–1935","1954–1955","1974–1975"],"a":1,"k":"Grindheim kyrkje vart restaurert i 1954–1955 under leiing av arkitektane E. Knoph og K. Bjerknes.","t":"fact","e":"em_his_kulturminner_bevaring","s":["norges_kirker_grindheim"],"c":["restaurering","kulturminnevern"],"g":["1954_1955"],"m":"met_endring_over_tid","b":"Kyrkja vart restaurert i 1954–1955."}]},{"id":"historie_grindheim_kyrkje_etne_set_2","level":2,"order":2,"xp":70,"title":"Spor etter den eldre kyrkja","questions":[{"q":"Kor mange veggplankar frå ei eldre stavkyrkje vart funne i takkonstruksjonen på 1950-talet?","o":["Ni","Nitten","Tjueni"],"a":1,"k":"På 1950-talet vart det funne 19 veggplankar frå ein stavkyrkjevegg.","t":"fact","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["veggplankar","stavkyrkje"],"g":["19_stavplankar"],"m":"met_sporlesning","b":"Nitten veggplankar frå ei eldre stavkyrkje vart funne i dagens kyrkje."},{"q":"Kvar var dei gjenbrukte stavkyrkjeplankane lagde?","o":["Som takbord over koret","Som golvbord under skipet","Som panel i våpenhuset"],"a":0,"k":"Plankane låg i sutaket over koret og var tilpassa for gjenbruk som takbord.","t":"observation","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["sutak","gjenbruk"],"g":["plankar_over_koret"],"m":"met_sporlesning","b":"Stavkyrkjeplankane vart gjenbrukte som takbord over koret."},{"q":"Kva eldre detalj finst på inngangsdøra til skipet?","o":["Smijarnsbeslag med liljeforma endar","Utskoren portal av kleberstein","Bronseplater med latinsk innskrift"],"a":0,"k":"Inngangsdøra har eldre gangjarn og smijarnsbeslag med liljeforma endar.","t":"observation","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["smijarn","dørbeslag"],"g":["liljeforma_beslag"],"m":"met_sporlesning","b":"Døra til skipet har eldre smijarnsbeslag med liljeforma endar."},{"q":"Kvifor er skøyten etter utvidinga i 1854 eit viktig spor?","o":["Han viser kvar den eldre kyrkjekroppen vart forlenga med nytt tømmer","Han viser at heile kyrkja vart flytta i 1854","Han viser kvar den eldre stavkyrkja hadde alteret"],"a":0,"k":"Forskjellar i tømmer og skøytar i veggene viser kvar den eldre delen sluttar og utvidinga frå 1854 tek til.","t":"analysis","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["bygningsskøyt","bygningsfase"],"g":["spor_etter_utviding"],"m":"met_sporlesning","b":"Skøyten og tømmerforskjellane gjer utvidinga frå 1854 lesbar i bygningen."},{"q":"Kva viser dei gjenbrukte stavplankane om overgangen mellom kyrkjene?","o":["At delar av den eldre bygningen vart tekne inn som materiale i den nye","At dagens kyrkje sjølv er den uendra stavkyrkja frå mellomalderen","At den eldre kyrkja var bygd av stein og ikkje tre"],"a":0,"k":"Plankane viser materiell gjenbruk: delar frå den eldre stavkonstruksjonen fekk ein ny funksjon i taket på tømmerkyrkja.","t":"analysis","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["materialgjenbruk","materiell kontinuitet"],"g":["gjenbrukte_stavplankar"],"m":"met_kontekstualisering","b":"Stavplankane vart gjenbrukte i den nye kyrkja og bind bygningsfasane materielt saman."}]},{"id":"historie_grindheim_kyrkje_etne_set_3","level":3,"order":3,"xp":90,"title":"Byggjekunnskap og kjeldekritikk","questions":[{"q":"Kva kjenneteiknar stavkonstruksjonen som plankane stammar frå?","o":["Loddrette veggplankar sette i rammer med not og fjør","Vassrette stokkar felte saman i novene","Ein treramme fylt med tegl eller leire"],"a":0,"k":"I stavverk står veggplankane loddrett i ein berande ramme. Fleire Grindheim-plankar har bevart not eller fjør frå denne konstruksjonen.","t":"concept","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["stavverk","not og fjør"],"g":["omgrep_stavverk"],"m":"met_sporlesning","b":"Dei gjenbrukte plankane har konstruksjonsspor frå ein eldre stavvegg."},{"q":"Kva betyr det at dagens kor og skip er lafta?","o":["Vassrette tømmerstokkar er felte saman i hjørna","Loddrette stavar ber veggplankar i rammer","Tynne bord er festa til eit frittståande jarnskjelett"],"a":0,"k":"Lafting byggjer veggar av vassrette stokkar som blir felte saman i hjørna. Kor og skip på Grindheim er lafta i flathogge tømmer.","t":"concept","e":"em_his_spor_materialitet","s":["norges_kirker_grindheim"],"c":["lafting","flathogge tømmer"],"g":["omgrep_laft"],"m":"met_sporlesning","b":"Kor og skip er lafta i flathogge tømmer."},{"q":"Kva betyr bygningsarkeologi i arbeidet med Grindheim kyrkje?","o":["Å undersøkje materialar, skøytar og konstruksjonsspor for å finne bygningsfasar","Å bruke berre skriftlege kjelder og sjå bort frå sjølve bygningen","Å rekonstruere alle tapte delar utan fysiske spor"],"a":0,"k":"Bygningsarkeologi les sjølve bygningen som kjelde. Tømmerdimensjonar, skøytar, naglehol og gjenbrukte plankar kan vise korleis kyrkja er endra.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["norges_kirker_grindheim"],"c":["bygningsarkeologi","materialspor"],"g":["omgrep_bygningsarkeologi"],"m":"met_sporlesning","b":"Fysiske detaljar i Grindheim kyrkje blir brukte til å skilje mellom bygningsfasar."},{"q":"Kvifor bør quizen bruke dateringa 1723–1724 med forbehold?","o":["Fordi perioden er ei fagleg vurdering, medan kommunen oppgir 1728 som oppføringsår","Fordi alle kjelder er samde om at kyrkja vart bygd nøyaktig 1. januar 1724","Fordi kyrkja ikkje finst i nokon kjelder før 1854"],"a":0,"k":"Norges Kirker daterer bygginga mest sannsynleg til eit opphald i kyrkjelege forretningar mellom juli 1723 og mars 1724. Etne kommune oppgir 1728. Den smalare faglege dateringa bør derfor presenterast som sannsynleg, ikkje absolutt sikker.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["norges_kirker_grindheim","etne_kommune_kyrkja"],"c":["dateringsusikkerheit","kjeldesamanlikning"],"g":["datering_1723_1728"],"m":"met_kildekritikk","b":"Kjeldene gir ulike dateringsnivå: sannsynleg bygging i 1723–1724 og kommunalt oppføringsår 1728."},{"q":"Kva er det som har kontinuitet frå mellomalderen på Grindheim?","o":["Kyrkjestaden og kyrkjeleg bruk, medan bygningane har vorte skifta og endra","Heile dagens kyrkjebygg utan ombyggingar eller utskiftingar","Berre kyrkjegardsmuren, ikkje sjølve kyrkjefunksjonen"],"a":0,"k":"Kyrkjestaden er dokumentert frå 1326, men dagens bygning er frå 1700-talet og vart utvida og restaurert seinare. Kontinuiteten ligg derfor først og fremst i staden og bruken, ikkje i ein uendra bygning.","t":"analysis","e":"em_his_kirke_kloster_middelalder","s":["norges_kirker_grindheim"],"c":["stadskontinuitet","bygningsendring"],"g":["kyrkjestad_kontinuitet"],"m":"met_endring_over_tid","b":"Kyrkjestaden og bruken held fram, sjølv om kyrkjebygningen er skifta ut og endra."}]}];
const SOURCES = {
  norges_kirker_grindheim: 'https://norgeskirker.no/wiki/Grindheim_kyrkje',
  etne_kommune_kyrkja: 'https://www.etne.kommune.no/kultur-og-fritid/kyrkja/'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `grindheim_kyrkje_etne_quiz_${globalNo}`,
    quiz_id: `historie_grindheim_kyrkje_etne_set_${setNo}_q${pos}`,
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
    epoke_id: 'tidlig_modernetid',
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
      'data/places/historie/vestland/etne/grindheim_kyrkje_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'kyrkje',
      subtype: 'mellomalderleg_kyrkjestad_med_lafta_1700_talskyrkje_og_gjenbrukte_stavdelar',
      signature_features: [
        'kyrkjestad skriftleg kjend frå 1326',
        'dagens tømmerkyrkje mest sannsynleg bygd i 1723–1724',
        'skipet lengt mot vest i 1854',
        '19 gjenbrukte stavkyrkjeplankar over koret',
        'restaurering i 1954–1955'
      ],
      primary_angles: ['kyrkjehistorie', 'bygningsarkeologi', 'materialgjenbruk', 'kjeldekritisk datering'],
      avoid_angles: ['presentere 1724 som heilt sikkert byggeår', 'blande kyrkja med Grindheim i Agder', 'framstille dagens bygning som uendra frå mellomalderen']
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
else throw new Error('Usage: node .tmp/bootstrap-grindheim-kyrkje.mjs assemble|validate');
