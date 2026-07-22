import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'postvegen_etne_skanevik';
const OUT = 'data/quiz/historie/postvegen_etne_skanevik_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_postvegen_etne_skanevik_set_1","level":1,"order":1,"xp":50,"title":"Postruta over fjellet","questions":[{"q":"Kva to bygder batt den historiske postvegen saman?","o":["Etne og Skånevik","Etne og Røldal","Skånevik og Rosendal"],"a":0,"k":"Den historiske ruta batt Etne og Skånevik saman over Skåneviksfjella.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_akrafjorden","ut_postvegen"],"c":["Etne","Skånevik","ferdselslinje"],"g":["etne_skanevik"],"m":"met_sporlesning","b":"Postvegen er den historiske ferdselslinja mellom Etne og Skånevik."},{"q":"Kva større postnett var ruta del av?","o":["Den Stavangerske Posttour","Den Bergenske Kongeveg","Den Trondhjemske Postlinje"],"a":0,"k":"Postvegen mellom Skånevik og Etne var del av det nord–sørgåande sambandet kalla den Stavangerske Posttour.","t":"fact","e":"em_his_stat_institusjoner","s":["kringom_akrafjorden"],"c":["Stavangerske Posttour","postnett"],"g":["stavangerske_posttour"],"m":"met_kontekstualisering","b":"Etne–Skånevik-ruta inngjekk i den Stavangerske Posttour."},{"q":"Når vart den norske posttenesta fastare organisert?","o":["Midt på 1500-talet","Midt på 1600-talet","Midt på 1700-talet"],"a":1,"k":"Posttenesta vart fastare organisert frå midten av 1600-talet, og postvegane vart deretter gradvis bygde ut.","t":"fact","e":"em_his_stat_institusjoner","s":["kringom_akrafjorden"],"c":["postteneste","1600-talet"],"g":["postorganisering"],"m":"met_periodisering","b":"Utbygginga av postvegane heng saman med fastare organisering av posttenesta midt på 1600-talet."},{"q":"Kva vegstandard hadde Etne–Skånevik-ruta opphavleg?","o":["Rideveg for gåande og ridande ferdsel","Bre køyreveg for vogner","Jernbane med hestetrekk"],"a":0,"k":"Ruta vart bygd som rideveg og var tilpassa gåande og ridande postferdsel før ho fekk køyrevegstandard.","t":"fact","e":"em_his_hverdagsliv_praksiser","s":["ut_postvegen","kringom_akrafjorden"],"c":["rideveg","postferdsel"],"g":["rideveg"],"m":"met_sporlesning","b":"Postvegen vart opphavleg bygd som rideveg."},{"q":"Kva heiter høgaste delen av den noverande turtraséen?","o":["Varleite","Lurasund","Borgåsen"],"a":0,"k":"Ruta stig bratt til Varleite, om lag 600 meter over havet, før ho går ned mot Skånevik.","t":"observation","e":"em_his_spor_materialitet","s":["ut_postvegen"],"c":["Varleite","fjellovergang"],"g":["varleite"],"m":"met_sporlesning","b":"Varleite er høgaste delen av den dokumenterte turtraséen mellom Etne og Skånevik."}]},{"id":"historie_postvegen_etne_skanevik_set_2","level":2,"order":2,"xp":70,"title":"Frå rideveg til turveg","questions":[{"q":"Når fekk postvegar av denne typen etter kvart køyrevegstandard?","o":["På 1700-talet","På 1800-talet","På 1900-talet"],"a":1,"k":"Kringom opplyser at postvegane først på 1800-talet vart køyrevegar.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_akrafjorden"],"c":["køyreveg","vegstandard"],"g":["koyreveg_1800_tal"],"m":"met_endring_over_tid","b":"Postvegane fekk først køyrevegstandard på 1800-talet."},{"q":"Kor lang er den dokumenterte turen mellom Etne og Skånevik på UT.no?","o":["4,3 kilometer","8,3 kilometer","12,3 kilometer"],"a":1,"k":"UT.no presenterer den noverande turen som ei 8,3 kilometer lang éinvegsløype.","t":"fact","e":"em_his_spor_materialitet","s":["ut_postvegen"],"c":["rutelengd","turtrasé"],"g":["8_3_km"],"m":"met_sporlesning","b":"Den dokumenterte turtraséen er 8,3 kilometer lang."},{"q":"Kva bruk har den gamle traseen i dag?","o":["Han er sett i stand som turveg og friluftsområde","Han er hovudveg for biltrafikken mellom bygdene","Han er stengd og berre tilgjengeleg for forskarar"],"a":0,"k":"Den gamle postvegen er sett i stand som turveg, og Etne kommune listar området blant dei forvalta friluftsområda.","t":"fact","e":"em_his_kulturminner_bevaring","s":["kringom_akrafjorden","etne_friluftsomrade"],"c":["turveg","friluftsområde"],"g":["restaurert_turveg"],"m":"met_endring_over_tid","b":"Postvegen er restaurert og blir brukt som turveg og friluftsområde."},{"q":"Kvifor var Varleite ein sentral del av ferdselslandskapet?","o":["Fjellovergangen måtte passere høgda mellom dei to bygdene","Varleite var den einaste staden med postkontor langs ruta","Høgda gjorde det mogleg å unngå all stigning"],"a":0,"k":"Varleite er høgdepunktet i overgangen mellom Etnebygda og Skånevik. Terrenget bestemte stigning, tidsbruk og kva slags vegstandard som var praktisk mogleg.","t":"analysis","e":"em_his_spor_materialitet","s":["ut_postvegen"],"c":["terrengtilpassing","fjellovergang"],"g":["terreng_og_rute"],"m":"met_kontekstualisering","b":"Fjellovergangen over Varleite forma ruta og transportvilkåra mellom bygdene."},{"q":"Kva betyr det historisk at vegen er restaurert?","o":["Traseen er gjort farbar og lesbar att, men er ikkje nødvendigvis urørt frå posttida","Alle steinar og vegparti står nøyaktig slik dei gjorde på 1600-talet","Restaureringa gjer dagens tursti eldre enn den opphavlege postvegen"],"a":0,"k":"Istandsetting kan stabilisere, rydde og reparere traseen. Det gjer kulturminnet tilgjengeleg, men den synlege turvegen må ikkje behandlast som heilt uendra originalstoff.","t":"analysis","e":"em_his_kulturminner_bevaring","s":["kringom_akrafjorden","etne_friluftsomrade"],"c":["restaurering","autentisitet"],"g":["restaurert_ikkje_uroert"],"m":"met_kildekritikk","b":"Den restaurerte turvegen gjer den historiske linja synleg utan å vere identisk med ein urørt opphavleg trasé."}]},{"id":"historie_postvegen_etne_skanevik_set_3","level":3,"order":3,"xp":90,"title":"Postvesen, vegstandard og kart","questions":[{"q":"Kva var ein posttour?","o":["Ei organisert postrute med faste etappar og plikter langs eit større samband","Ei reise berre for turistar og embetsmenn","Eit enkelt posthus utan samband med andre stader"],"a":0,"k":"Ein posttour var ei organisert postrute gjennom fleire stader. Den Stavangerske Posttour batt lokale strekningar inn i eit større nord–sørgåande system.","t":"concept","e":"em_his_stat_institusjoner","s":["kringom_akrafjorden"],"c":["posttour","rutenett"],"g":["omgrep_posttour"],"m":"met_kontekstualisering","b":"Etne–Skånevik var éi strekning i den større Stavangerske Posttour."},{"q":"Kva er hovudskilnaden mellom ein rideveg og ein køyreveg?","o":["Ridevegen er tilpassa gåande og ridande, medan køyrevegen må tole hjulgåande køyretøy","Ridevegen går alltid langs sjøen, medan køyrevegen går i fjellet","Ridevegen er offentleg, medan køyrevegen alltid er privat"],"a":0,"k":"Ein rideveg kan vere smalare og brattare fordi han er laga for folk og hestar. Ein køyreveg krev breidd, jamnare stigning og bereevne for vogner og andre hjulkøyretøy.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_akrafjorden","ut_postvegen"],"c":["rideveg","køyreveg","vegstandard"],"g":["omgrep_vegstandard"],"m":"met_sporlesning","b":"Overgangen frå rideveg til køyreveg kravde ein annan fysisk vegstandard."},{"q":"Kva er eit linjeanker på kartet?","o":["Eit representativt punkt som hjelper brukaren å finne ein lang trasé","Det nøyaktige geometriske sentrum av alle delar av ruta","Eit bevis på at heile vegen historisk låg innanfor ein liten radius"],"a":0,"k":"Eit linjeanker er eit praktisk kartpunkt på ein lang stad som veg eller rute. Markøren ved Varleite representerer Postvegen, men heile kulturminnet strekkjer seg mellom Etne og Skånevik.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["ut_postvegen"],"c":["linjeanker","lineært kulturminne"],"g":["omgrep_linjeanker"],"m":"met_kildekritikk","b":"Kartmarkøren er eit representativt punkt på den lange postvegtraséen."},{"q":"Korleis viser Postvegen statsbygging i praksis?","o":["Eit organisert postnett kravde ruter, plikter og samband mellom lokale stader","Postvegen viser at staten ikkje trong faste kommunikasjonsliner","Ruta vart berre laga for privat fritidsferdsel"],"a":0,"k":"Fast postgang kravde at lokale vegar og transportplikter vart samordna i eit større offentleg system. Postvegen gjer statleg kommunikasjon konkret i landskapet.","t":"analysis","e":"em_his_stat_institusjoner","s":["kringom_akrafjorden"],"c":["statsbygging","offentleg kommunikasjon"],"g":["post_og_stat"],"m":"met_kontekstualisering","b":"Den Stavangerske Posttour knytte lokale ferdselsliner til ein organisert offentleg institusjon."},{"q":"Kvifor må Postvegen forståast som ei linje og ikkje berre som markøren ved Varleite?","o":["Den historiske funksjonen låg i sambandet mellom Etne og Skånevik, ikkje i eitt enkelt punkt","Berre Varleite vart brukt av posten, medan resten er moderne","Kartpunktet inneheld alle historiske vegdelar fysisk samla"],"a":0,"k":"Postvegen var eit samband gjennom skiftande terreng. Markøren hjelper spelaren inn på ruta, men historia ligg i heile ferdselslinja, stigninga og forbindelsen mellom bygdene.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["ut_postvegen","kringom_akrafjorden"],"c":["lineært kulturminne","romleg kjeldekritikk"],"g":["heile_traseen"],"m":"met_kildekritikk","b":"Postvegens historiske tyding ligg i heile sambandet mellom Etne og Skånevik."}]}];
const SOURCES = {
  kringom_akrafjorden: 'https://www.kringom.no/nb/sunnhordland/etne/akrafjorden',
  etne_friluftsomrade: 'https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/friluftsomrade/',
  ut_postvegen: 'https://ut.no/turforslag/114844/etneskanevik-postvegen'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `postvegen_etne_skanevik_quiz_${globalNo}`,
    quiz_id: `historie_postvegen_etne_skanevik_set_${setNo}_q${pos}`,
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
      'data/places/historie/vestland/etne/postvegen_etne_skanevik.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'historisk_veg',
      subtype: 'rideveg_i_den_stavangerske_posttour_over_varleite',
      signature_features: [
        'historisk samband mellom Etne og Skånevik',
        'del av den Stavangerske Posttour',
        'opphavleg rideveg over Varleite',
        'gradvis overgang til køyrevegstandard på 1800-talet',
        'restaurert og forvalta som turveg i dag'
      ],
      primary_angles: ['posthistorie', 'statsbygging', 'vegstandard', 'lineære kulturminne'],
      avoid_angles: ['behandle kartmarkøren som heile ruta', 'framstille den restaurerte turvegen som urørt original', 'blande ruta med Postvegen i Rullestad']
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
else throw new Error('Usage: node .tmp/bootstrap-postvegen-etne-skanevik.mjs assemble|validate');
