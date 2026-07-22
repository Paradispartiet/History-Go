import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'gamle_akrafjordvegen';
const OUT = 'data/quiz/historie/gamle_akrafjordvegen_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_gamle_akrafjordvegen_set_1","level":1,"order":1,"xp":50,"title":"Vegen mellom fjell og fjord","questions":[{"q":"Mellom kva to stader går den historiske vegstrekninga?","o":["Tjelmeland og Teigland","Etne og Skånevik","Rullestad og Skromme"],"a":0,"k":"Gamle Åkrafjordvegen følgjer den bratte fjordsida mellom Tjelmeland og Teigland.","t":"fact","e":"em_his_spor_materialitet","s":["akrafjorden_gamlevegen"],"c":["Tjelmeland","Teigland","vegstrekning"],"g":["tjelmeland_teigland"],"m":"met_sporlesning","b":"Den historiske strekninga går mellom Tjelmeland og Teigland."},{"q":"Når starta arbeidet med Åkrafjordvegen?","o":["1927","1937","1947"],"a":1,"k":"Arbeidet starta i 1937, før den tyske okkupasjonen av Noreg.","t":"fact","e":"em_his_spor_materialitet","s":["akrafjorden_gamlevegen"],"c":["byggjestart","1937"],"g":["1937"],"m":"met_periodisering","b":"Vegprosjektet vart sett i gang i 1937."},{"q":"Om lag kor mange mann arbeidde på prosjektet i 1940?","o":["Om lag 100","Om lag 500","Om lag 1000"],"a":2,"k":"Vel tusen mann var i arbeid på Åkrafjordvegen i 1940.","t":"fact","e":"em_his_hverdagsliv_praksiser","s":["kringom_akrafjorden","akrafjorden_gamlevegen"],"c":["arbeidsstyrke","vegbygging"],"g":["tusen_mann_1940"],"m":"met_kontekstualisering","b":"Om lag tusen mann arbeidde på vegprosjektet i 1940."},{"q":"Kva terreng måtte vegbyggjarane arbeide i?","o":["Bratte fjellsider som fell direkte mot fjorden","Ei flat elveslette med laus sand","Eit ope høgfjellsplatå utan bergskjeringar"],"a":0,"k":"Vegen vart driven fram i svært bratte fjordsider med stup mot Åkrafjorden.","t":"observation","e":"em_his_spor_materialitet","s":["akrafjorden_gamlevegen","kringom_akrafjorden"],"c":["fjordside","bratt terreng"],"g":["bratt_fjordterreng"],"m":"met_sporlesning","b":"Ekstremt bratt terreng mellom fjell og fjord forma veganlegget."},{"q":"Kva tunnel førte til at den gamle strekninga vart omkøyrd i 1995?","o":["Markhustunnelen","Åkrafjordtunnelen","Røldalstunnelen"],"a":0,"k":"Den gamle strekninga vart omkøyrd då Markhustunnelen opna i 1995.","t":"fact","e":"em_his_spor_materialitet","s":["akrafjorden_gamlevegen"],"c":["Markhustunnelen","omlegging"],"g":["1995"],"m":"met_endring_over_tid","b":"Markhustunnelen tok over hovudtrafikken frå den gamle vegstrekninga i 1995."}]},{"id":"historie_gamle_akrafjordvegen_set_2","level":2,"order":2,"xp":70,"title":"Ingeniørarbeid og krigstid","questions":[{"q":"Kor høge fjellskjeringar vart drivne ut på prosjektet?","o":["Opptil 20 meter","Opptil 40 meter","Opptil 60 meter"],"a":1,"k":"Kringom omtalar fjellskjeringar på opptil 40 meter.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_akrafjorden"],"c":["fjellskjering","høgde"],"g":["40_meter_skjaering"],"m":"met_sporlesning","b":"Vegprosjektet omfatta fjellskjeringar på opptil 40 meter."},{"q":"Kor høge vegmurar vart bygde langs fjorden?","o":["Opptil 10 meter","Opptil 20 meter","Opptil 30 meter"],"a":2,"k":"Dei største vegmurane var om lag 30 meter høge.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_akrafjorden"],"c":["vegmur","støttekonstruksjon"],"g":["30_meter_mur"],"m":"met_sporlesning","b":"Vegen vart halden oppe av vegmurar på opptil 30 meter."},{"q":"Kva omfang av tunnelar og bruer oppgir Kringom for vegprosjektet?","o":["13 tunnelar og 40 bruer","30 tunnelar og 14 bruer","4 tunnelar og 13 bruer"],"a":0,"k":"Kringom oppgir 13 tunnelar og 40 bruer, små og store, for det omfattande vegprosjektet langs Åkrafjorden.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_akrafjorden"],"c":["tunnelar","bruer","veganlegg"],"g":["13_tunnelar_40_bruer"],"m":"met_sporlesning","b":"Vegprosjektet omfatta 13 tunnelar og 40 bruer."},{"q":"Kvifor kravde traseen så mange ulike konstruksjonar?","o":["Skjeringar, murar, tunnelar og bruer løyste ulike hinder i den bratte fjordsida","Vegbyggjarane ønskte flest mogleg konstruksjonstypar av estetiske grunnar","Terrenget var flatt, men staten kravde tunnelar av symbolske grunnar"],"a":0,"k":"Vegen måtte skjerast inn i fjellet, støttast over stup, førast gjennom berg og kryssa søkk og bekkar. Konstruksjonane var svar på konkrete terrengproblem.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_akrafjorden","akrafjorden_gamlevegen"],"c":["terrengtilpassing","ingeniørløysing"],"g":["konstruksjon_og_terreng"],"m":"met_kontekstualisering","b":"Det bratte fjordterrenget kravde ein kombinasjon av skjeringar, murar, tunnelar og bruer."},{"q":"Kva følgje fekk den tyske forseringa av vegarbeidet?","o":["Arbeidet gjekk raskare, men vegen fekk ikkje fullt ut den planlagde standarden","Heile det norske prosjektet vart lagt ned til etter krigen","Vegen vart omgjord frå bilveg til rideveg"],"a":0,"k":"Tyske styresmakter pressa på av militære og sysselsettingspolitiske grunnar. Arbeidet vart forsert, og Kringom opplyser at vegen ikkje fekk heilt den standarden som opphavleg var planlagd.","t":"analysis","e":"em_his_krig_konflikt","s":["kringom_akrafjorden"],"c":["forsering","okkupasjon","vegstandard"],"g":["tysk_press"],"m":"met_kontekstualisering","b":"Okkupasjonsstyresmaktene pressa fram raskare bygging, noko som påverka sluttstandarden."}]},{"id":"historie_gamle_akrafjordvegen_set_3","level":3,"order":3,"xp":90,"title":"Teknisk kulturmiljø og kjeldekritikk","questions":[{"q":"Kva er ei fjellskjering?","o":["Eit parti der fjell er sprengt eller hogge bort for å gi plass til vegen","Ein mur som ber vegbanen over ei skråning","Ein tunnel som går heilt gjennom eit fjell"],"a":0,"k":"Ei fjellskjering er ei utskoren side i berg eller fjell langs ein veg. På Åkrafjordvegen viser dei kor mykje fjell som måtte fjernast.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_akrafjorden"],"c":["fjellskjering","veganlegg"],"g":["omgrep_fjellskjaering"],"m":"met_sporlesning","b":"Store fjellskjeringar er eit synleg hovudspor i veganlegget."},{"q":"Kva funksjon har ein vegmur i dette terrenget?","o":["Han støttar vegbanen der fjellsida fell bratt mot fjorden","Han markerer kommunegrensa mellom bygdene","Han stenger all ferdsel langs den gamle traseen"],"a":0,"k":"Vegmuren held massar og vegbane på plass i bratt terreng. Dei høge murane gjorde det mogleg å leggje vegen langs fjordsida.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_akrafjorden"],"c":["vegmur","støttefunksjon"],"g":["omgrep_vegmur"],"m":"met_sporlesning","b":"Handmura vegmurar bar og stabiliserte vegbanen i den bratte fjordsida."},{"q":"Kva er eit teknisk kulturmiljø?","o":["Ein samanheng av anlegg, konstruksjonar og landskap som dokumenterer teknisk verksemd","Eit enkelt laust verktøy utan samband med ein stad","Berre naturen rundt eit moderne veganlegg"],"a":0,"k":"Eit teknisk kulturmiljø omfattar fleire samverkande spor etter bygging og drift. På Åkrafjordvegen er veglinja, murane, skjeringane, tunnelane og bruene del av same miljø.","t":"concept","e":"em_his_kulturminner_bevaring","s":["kringom_akrafjorden","akrafjorden_gamlevegen"],"c":["teknisk kulturmiljø","heilskap"],"g":["omgrep_teknisk_kulturmiljo"],"m":"met_kontekstualisering","b":"Den gamle veglinja og dei mange konstruksjonane dannar eit samanhengande teknisk kulturmiljø."},{"q":"Kva er kjeldekritisk riktig om kven som bygde Åkrafjordvegen?","o":["Prosjektet starta norsk i 1937 og vart kraftig forsert under tysk okkupasjon","Heile vegen vart planlagd og bygd utelukkande av tyske styrkar etter 1940","Vegen vart ferdig før krigen og vart ikkje påverka av okkupasjonen"],"a":0,"k":"Bygginga var sett i gang i 1937. Under okkupasjonen pressa tyske styresmakter på for raskare framdrift, men dette gjer ikkje heile prosjektet til eit vegprosjekt som oppstod først i 1940.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["akrafjorden_gamlevegen","kringom_akrafjorden"],"c":["prosjektopphav","okkupasjon","kjeldekritikk"],"g":["starta_for_krigen"],"m":"met_kildekritikk","b":"Arbeidet starta før krigen og vart seinare forsert av okkupasjonsstyresmaktene."},{"q":"Kvifor representerer kartmarkøren ved Teigland ikkje heile kulturminnet?","o":["Gamle Åkrafjordvegen er ei lang veglinje mellom Tjelmeland og Teigland","Alle historiske konstruksjonar ligg samla på eitt punkt ved Teigland","Markøren viser berre ein bygning som ikkje høyrer til vegen"],"a":0,"k":"Teigland er eit praktisk endepunktsanker. Kulturmiljøet omfattar heile traseen med murar, skjeringar, tunnelar og bruer langs fjorden.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["akrafjorden_gamlevegen"],"c":["lineært kulturminne","endepunktsanker"],"g":["heile_vegtraseen"],"m":"met_kildekritikk","b":"Kartpunktet ved Teigland er inngang til eit langt lineært kulturmiljø, ikkje eit punktobjekt."}]}];
const SOURCES = {
  akrafjorden_gamlevegen: 'https://akrafjorden.no/experiences/the-old-akrafjord-road',
  kringom_akrafjorden: 'https://www.kringom.no/nb/sunnhordland/etne/akrafjorden'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `gamle_akrafjordvegen_quiz_${globalNo}`,
    quiz_id: `historie_gamle_akrafjordvegen_set_${setNo}_q${pos}`,
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
      'data/places/historie/vestland/etne/gamle_akrafjordvegen.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'historisk_veg',
      subtype: 'krigstidsforsert_fjordveg_med_store_tekniske_konstruksjonar',
      signature_features: [
        'historisk veg mellom Tjelmeland og Teigland',
        'byggjestart i 1937 og kraftig forsering i 1940–1942',
        'om lag tusen arbeidarar i 1940',
        'opptil 40 meter høge skjeringar og 30 meter høge vegmurar',
        '13 tunnelar og 40 bruer i det større vegprosjektet'
      ],
      primary_angles: ['ingeniørhistorie', 'arbeidsliv', 'andre verdskrigen', 'teknisk kulturmiljø'],
      avoid_angles: ['framstille heile prosjektet som tyskstarta', 'redusere staden til ein naturskjønn køyretur', 'behandle Teigland-markøren som heile veglinja']
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
else throw new Error('Usage: node .tmp/bootstrap-gamle-akrafjordvegen.mjs assemble|validate');
