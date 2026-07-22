import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'gjerde_kyrkje_etne';
const OUT = 'data/quiz/historie/gjerde_kyrkje_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_gjerde_kyrkje_etne_set_1","level":1,"order":1,"xp":50,"title":"Kyrkjestaden gjennom tidene","questions":[{"q":"Kva år vart tømmerkyrkja flytta til den noverande kyrkjestaden?","o":["1673","1676","1706"],"a":1,"k":"Den lafta tømmerkyrkja vart flytta til den noverande staden i 1676. Året seier når kyrkja kom hit, ikkje sikkert når alle delane av bygningen først vart oppførte.","t":"fact","e":"em_his_kirke_kloster_middelalder","s":["snl_gjerde_kirke","etne_kommune_kyrkja"],"c":["kyrkjestad","flytting"],"g":["1676"],"m":"met_periodisering","b":"Gjerde kyrkje har stått på den noverande staden sidan 1676."},{"q":"Når er den eldre kyrkja på Storgarden Gjerde først omtalt i skriftlege kjelder?","o":["1288","1388","1488"],"a":0,"k":"Ei eldre kyrkje på Storgarden Gjerde er omtalt i 1288.","t":"fact","e":"em_his_kirke_kloster_middelalder","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["skriftleg kjelde","kyrkjestad"],"g":["1288"],"m":"met_kildekritikk","b":"Kyrkja på Storgarden Gjerde er omtalt i ei skriftleg kjelde frå 1288."},{"q":"Kva hende med den eldre stavkyrkja i 1673?","o":["Ho vart riven for å gi plass til eit steinkor","Ho vart flytta heil til ein annan gard","Ho vart teken av vinden etter langvarig forfall"],"a":2,"k":"Den eldre stavkyrkja var i dårleg stand og vart teken av vinden i 1673. Delar av inventaret vart berga.","t":"fact","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["stavkyrkje","stormskade"],"g":["1673"],"m":"met_endring_over_tid","b":"Den eldre stavkyrkja vart teken av vinden i 1673 etter lang tids forfall."},{"q":"Kva byggjemåte har hovuddelen av dagens Gjerde kyrkje?","o":["Lafta tømmer","Reisverk av jern og tegl","Murverk av kleberstein"],"a":0,"k":"Gjerde kyrkje er ei lafta tømmerkyrkje med kort skip og rett avslutta kor.","t":"observation","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke"],"c":["laft","tømmerkyrkje"],"g":["tommerkyrkje"],"m":"met_sporlesning","b":"Hovuddelen av Gjerde kyrkje er bygd i lafta tømmer."},{"q":"Kva endring vart gjord ved vestenden av kyrkja i 1930?","o":["Koret vart erstatta av eit steinkor","Det eldre våpenhuset vart erstatta av eit tårn i bindingsverk","Skipet vart forlenga med ein ny lafta kyrkjesal"],"a":1,"k":"I 1930 vart det eldre våpenhuset erstatta av eit tårn i bindingsverk.","t":"fact","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["kyrkjetårn","bindingsverk"],"g":["tarn_1930"],"m":"met_endring_over_tid","b":"Tårnet i bindingsverk vart reist i 1930 og erstatta eit eldre våpenhus."}]},{"id":"historie_gjerde_kyrkje_etne_set_2","level":2,"order":2,"xp":70,"title":"Inventar og historiske lag","questions":[{"q":"Kva motiv står i midtfeltet på altertavla frå 1600-talet?","o":["Nattverden","Jesu dåp","Korsfestinga"],"a":0,"k":"Altertavla har nattverden i midtfeltet. Korsfestinga står over, medan omskjeringa og dåpen finst i sidefelta.","t":"observation","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke"],"c":["altertavle","nattverden"],"g":["altertavle"],"m":"met_sporlesning","b":"Nattverden er hovudmotivet i midtfeltet på altertavla."},{"q":"Kven er framstilte på preikestolen som vart teken vare på frå den eldre kyrkja?","o":["Dei fire evangelistane","Dei tolv apostlane","Dei norske mellomalderkongane"],"a":0,"k":"Preikestolen frå den eldre kyrkja har bilete av dei fire evangelistane.","t":"observation","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke"],"c":["preikestol","evangelistar"],"g":["preikestol"],"m":"met_sporlesning","b":"Preikestolen har framstillingar av dei fire evangelistane."},{"q":"Kor mange kyrkjeklokker frå mellomalderen er bevarte i Gjerde kyrkje?","o":["Éi","To","Tre"],"a":1,"k":"Gjerde kyrkje har to bevarte kyrkjeklokker frå mellomalderen.","t":"fact","e":"em_his_kirke_kloster_middelalder","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["kyrkjeklokker","mellomalder"],"g":["to_mellomalderklokker"],"m":"met_sporlesning","b":"To kyrkjeklokker frå mellomalderen er bevarte i kyrkja."},{"q":"Kvifor er altertavla og preikestolen viktige for historia til kyrkjestaden?","o":["Dei viser at heile dagens kyrkjebygg er frå mellomalderen","Dei fører materielle spor frå den eldre kyrkja inn i dagens kyrkjerom","Dei dokumenterer at kyrkja aldri har skifta plassering"],"a":1,"k":"Altertavla og preikestolen vart tekne vare på frå den eldre kyrkja. Dei skaper materiell kontinuitet sjølv om bygningen og plasseringa vart endra.","t":"analysis","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["materiell kontinuitet","gjenbruk"],"g":["eldre_inventar"],"m":"met_kontekstualisering","b":"Eldre inventar vart overført til den noverande kyrkja og bind bygningsfasane saman."},{"q":"Kva viser kombinasjonen av eldre inventar, lafta kyrkjekropp og tårnet frå 1930?","o":["At kyrkja består av fleire historiske lag frå ulike tider","At alle delane vart laga samtidig etter éin byggeplan","At berre tårnet har historisk verdi"],"a":0,"k":"Gjerde kyrkje er ikkje eitt einsarta tidslag. Mellomalderklokker og eldre inventar, den flytta tømmerkyrkja og tårnet frå 1930 viser endring og vidare bruk gjennom fleire hundreår.","t":"analysis","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["historiske lag","bygningsfasar"],"g":["fleire_tidslag"],"m":"met_endring_over_tid","b":"Kyrkja samlar inventar og bygningsdelar frå fleire historiske fasar."}]},{"id":"historie_gjerde_kyrkje_etne_set_3","level":3,"order":3,"xp":90,"title":"Byggjemåtar og kjeldekritikk","questions":[{"q":"Kva kjenneteiknar ei stavkyrkje som byggjemåte?","o":["Ein berande konstruksjon av loddrette stavar og rammer","Veggstokkar lagde vassrett og felte saman i hjørna","Ein skjelettkonstruksjon med korte stolpar og diagonalavstiving"],"a":0,"k":"I ei stavkyrkje ber loddrette stavar og rammer konstruksjonen. Den eldre kyrkja på Gjerde var ei stavkyrkje, medan dagens kyrkje er lafta.","t":"concept","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke","kringom_gjerde_kyrkje"],"c":["stavverk","stavkyrkje"],"g":["omgrep_stavkyrkje"],"m":"met_sporlesning","b":"Den eldre Gjerde-kyrkja var bygd som stavkyrkje."},{"q":"Kva betyr det at kyrkja er lafta?","o":["Veggane er mura med stein i jamne skift","Veggstokkane ligg vassrett og er felte saman i hjørna","Taket blir bore av støypte bogar utan treverk"],"a":1,"k":"I lafting blir vassrette tømmerstokkar felte saman i hjørna. Dette er byggjemåten i hovuddelen av dagens Gjerde kyrkje.","t":"concept","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke"],"c":["lafting","tømmer"],"g":["omgrep_laft"],"m":"met_sporlesning","b":"Dagens kyrkje er ei lafta tømmerkyrkje."},{"q":"Kva er bindingsverk i tårnet frå 1930?","o":["Ein berande treramme der felta mellom delane blir fylte eller kledde","Ein vegg av heile liggjande stokkar med nov i hjørna","Ein massiv mur av naturstein utan indre ramme"],"a":0,"k":"Bindingsverk er ein berande ramme av tre med felt mellom stolpar, losholtar og avstiving. Tårnet frå 1930 er bygt annleis enn den lafta kyrkjekroppen.","t":"concept","e":"em_his_spor_materialitet","s":["snl_gjerde_kirke"],"c":["bindingsverk","treramme"],"g":["omgrep_bindingsverk"],"m":"met_sporlesning","b":"Tårnet frå 1930 er bygt i bindingsverk."},{"q":"Kva er kjeldekritisk riktig å seie om alderen til dagens kyrkjebygg?","o":["Heile bygningen er sikkert oppført frå grunnen av i 1676","Den fulle alderen er usikker, men kyrkja vart flytta hit i 1676","Bygningen er sikkert den same stavkyrkja som er nemnd i 1288"],"a":1,"k":"Kjeldene slår fast flyttinga til den noverande staden i 1676, men ikkje ein sikker opphavleg byggjedato for alle delar av tømmerkyrkja. Flytteåret må derfor ikkje brukast som eit sikkert første byggeår.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["snl_gjerde_kirke","etne_kommune_kyrkja"],"c":["datering","kjeldekritikk"],"g":["usikker_alder"],"m":"met_kildekritikk","b":"Kyrkja vart flytta hit i 1676, medan den fulle alderen til bygningen er usikker."},{"q":"Korleis bør opplysningane om Gjerde som mogleg høvdingsete eller krongods brukast?","o":["Som sikkert bevis på ubrutt kongemakt frå vikingtid til dagens kyrkje","Som historisk kontekst og tolking, ikkje som bevist institusjonell kontinuitet","Som grunnlag for å avvise at området hadde eldre maktmiljø"],"a":1,"k":"Historiske framstillingar peikar på Gjerde som eit mogleg høgstatusmiljø i vikingtida og kanskje seinare krongods. Dette gir viktig kontekst, men beviser ikkje ei ubrutt maktlinje fram til dagens kyrkje.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["snl_etne","kringom_etne"],"c":["maktlandskap","historisk tolking","kontinuitet"],"g":["gjerde_maktmiljo"],"m":"met_kildekritikk","b":"Gjerde blir tolka som eit mogleg eldre maktmiljø, men samanhengen til den seinare kyrkjestaden er ikkje sikkert dokumentert som ubrutt kontinuitet."}]}];
const SOURCES = {
  snl_gjerde_kirke: 'https://snl.no/Gjerde_kirke',
  etne_kommune_kyrkja: 'https://www.etne.kommune.no/kultur-og-fritid/kyrkja/',
  kringom_gjerde_kyrkje: 'https://www.kringom.no/nb/sunnhordland/etne/gjerde-kyrkje',
  snl_etne: 'https://snl.no/Etne',
  kringom_etne: 'https://www.kringom.no/nb/sunnhordland/etne/etne'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `gjerde_kyrkje_etne_quiz_${globalNo}`,
    quiz_id: `historie_gjerde_kyrkje_etne_set_${setNo}_q${pos}`,
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
      'data/places/historie/vestland/etne/gjerde_kyrkje_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'kyrkje',
      subtype: 'flytta_lafta_tommerkyrkje_med_eldre_inventar_og_seinare_bygningslag',
      signature_features: [
        'noveraande kyrkjestad frå 1676',
        'eldre kyrkje omtalt i 1288 og øydelagd i 1673',
        'lafta tømmerkyrkje med kort skip og rett avslutta kor',
        'eldre altertavle, preikestol og to mellomalderklokker',
        'tårn i bindingsverk frå 1930'
      ],
      primary_angles: ['kyrkjehistorie', 'byggjemåtar', 'materiell kontinuitet', 'kjeldekritikk'],
      avoid_angles: ['bruke 1676 som sikkert opphavleg byggeår', 'presentere Gjerde som sikkert krongods', 'påstå ubrutt maktkontinuitet', 'låse avdekkinga av veggmåleri til eitt omstridt årstal']
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
else throw new Error('Usage: node .tmp/bootstrap-gjerde-kyrkje.mjs assemble|validate');
