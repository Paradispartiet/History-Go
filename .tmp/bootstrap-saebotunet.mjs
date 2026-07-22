import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'saebotunet_etne';
const OUT = 'data/quiz/historie/saebotunet_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_saebotunet_etne_set_1","level":1,"order":1,"xp":50,"title":"Tunet og museet","questions":[{"q":"Kva slags historisk stad er Sæbøtunet?","o":["Eit bevart gardstun og bygdemuseum","Eit mellomalderkloster med ruinar","Eit arkeologisk gravfelt"],"a":0,"k":"Sæbøtunet er eit bevart gardstun som blir forvalta som museumsavdeling av Sunnhordland Museum.","t":"fact","e":"em_his_sosialhistorie_hverdagsliv","s":["sunnhordland_museum_saebotunet","kringom_saebotunet"],"c":["gardstun","bygdemuseum"],"g":["gardstun"],"m":"met_sporlesning","b":"Sæbøtunet er eit bevart historisk gardstun og ei museumsavdeling."},{"q":"Når tok Sunnhordland Museum over Sæbøtunet?","o":["1918","1938","1958"],"a":1,"k":"Sunnhordland Museum tok over tunet i 1938.","t":"fact","e":"em_his_kulturminner_bevaring","s":["kringom_saebotunet"],"c":["museumsovertaking","kulturvern"],"g":["1938"],"m":"met_periodisering","b":"Sæbøtunet vart overteke av Sunnhordland Museum i 1938."},{"q":"Kva sider av historia formidlar bygningane særleg?","o":["Krigføring, skipsbygging og sjøhandel","Kyrkjekunst, pilegrimsferd og klosterliv","Sosiale tilhøve, byggeskikk og handverk"],"a":2,"k":"Museet framhevar at bygningane viser sosiale tilhøve, byggeskikk og handverk på 1700- og 1800-talet.","t":"fact","e":"em_his_sosialhistorie_hverdagsliv","s":["sunnhordland_museum_saebotunet"],"c":["sosiale tilhøve","byggeskikk","handverk"],"g":["hverdagsliv"],"m":"met_kontekstualisering","b":"Bygningane formidlar sosiale tilhøve, byggeskikk og handverk."},{"q":"Kva finst i dei innreidde bygningane på tunet?","o":["Møblar, arbeidsreiskapar og tekstilar","Våpen, myntskattar og runesteinar","Kyrkjeklokker, altertavler og prosesjonsutstyr"],"a":0,"k":"Bygningane er innreidde med møblar, arbeidsreiskapar og tekstilar som gjer kvardagslivet meir konkret.","t":"observation","e":"em_his_spor_materialitet","s":["sunnhordland_museum_saebotunet"],"c":["møblar","arbeidsreiskapar","tekstilar"],"g":["gjenstandar"],"m":"met_sporlesning","b":"Museet bruker møblar, arbeidsreiskapar og tekstilar i formidlinga."},{"q":"Kva er Forteljarskuten?","o":["Ei gammal løe som vart flytta til tunet i 1938","Eit lite amfi bygt i møkaskuten under restaureringa i 2016","Ein museumsbutikk innreidd i røykstova"],"a":1,"k":"Ved restaureringa i 2016 vart det bygt eit lite amfi i møkaskuten. Formidlingsrommet fekk namnet Forteljarskuten.","t":"fact","e":"em_his_kulturminner_bevaring","s":["sunnhordland_museum_saebotunet"],"c":["Forteljarskuten","museumsformidling"],"g":["2016"],"m":"met_endring_over_tid","b":"Forteljarskuten er eit lite amfi som vart bygt i møkaskuten i 2016."}]},{"id":"historie_saebotunet_etne_set_2","level":2,"order":2,"xp":70,"title":"Hus, arbeid og sosial orden","questions":[{"q":"Kor mange hus blir rekna opp i skiftet frå 1799?","o":["Åtte","Ti","Femten"],"a":2,"k":"Eit skifte frå 1799 reknar opp femten hus på garden, med funksjonar for bustad, matlaging, lagring, dyr, handverk og drift.","t":"fact","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_saebotunet"],"c":["skifte","husliste"],"g":["skifte_1799"],"m":"met_kildekritikk","b":"Skiftet frå 1799 reknar opp femten hus på garden."},{"q":"Kva to eldre husdelar er stovehuset sett saman av?","o":["Stabbur og eldhus","Røykstove og glasstove","Fjøs og smalahus"],"a":1,"k":"Stovehuset er sett saman av ei røykstove og ei glasstove.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_saebotunet"],"c":["røykstove","glasstove"],"g":["stovehuset"],"m":"met_sporlesning","b":"Stovehuset er bygt saman av ei røykstove og ei glasstove."},{"q":"Kva todeling av tunet er framleis synleg?","o":["Inntun og uttun","Kyrkjegard og marknadsplass","Nausttun og setertun"],"a":0,"k":"Sæbøtunet er delt i inntun og uttun, ei organisering som skilde bustadnære funksjonar frå delar av drifta.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_saebotunet"],"c":["inntun","uttun"],"g":["tunstruktur"],"m":"met_sporlesning","b":"Tunet er delt i inntun og uttun."},{"q":"Kvifor er lista over mange ulike hus viktig for å forstå garden?","o":["Ho viser at alle aktivitetar gjekk føre seg i eitt stort hus","Ho viser at garden mangla rom for dyr og lagring","Ho viser korleis arbeid og funksjonar var fordelte på spesialiserte bygningar"],"a":2,"k":"Huslista viser at bustad, matlaging, lagring, dyrehald, fôr, smie og kvern kunne ha eigne rom eller bygningar. Tunet var eit organisert produksjonsmiljø.","t":"analysis","e":"em_his_sosialhistorie_hverdagsliv","s":["kringom_saebotunet"],"c":["arbeidsdeling","gardstun"],"g":["spesialiserte_hus"],"m":"met_kontekstualisering","b":"Dei mange hustypane viser at arbeid og funksjonar var fordelte i tunet."},{"q":"Kva kan romfordelinga i stovehuset fortelje om sosiale tilhøve?","o":["At plassering av gjester, born og tenarar spegla roller og rang i hushaldet","At alle i hushaldet hadde eigne, like store soverom","At stovehuset berre vart brukt til lagring av avling"],"a":0,"k":"Kringom omtalar gjesteseng og kleskister i glasstova, medan born og tenarar hadde sengeplassar på lemen. Rombruken kan derfor vise sosiale roller og skilnader i hushaldet.","t":"analysis","e":"em_his_sosialhistorie_hverdagsliv","s":["kringom_saebotunet"],"c":["sosial orden","rombruk"],"g":["sosiale_skilnader"],"m":"met_kontekstualisering","b":"Romfordelinga mellom gjester, born og tenarar kan vise sosiale roller i hushaldet."}]},{"id":"historie_saebotunet_etne_set_3","level":3,"order":3,"xp":90,"title":"Omgrep og kjeldekritikk","questions":[{"q":"Kva er grindverk i den treskipa svåla-løa?","o":["Ein murteknikk med stein og kalk","Ein berande trekonstruksjon av stavar og tverrbjelkar","Ein måte å tekke tak med torv på"],"a":1,"k":"Grindverk er ein berande trekonstruksjon der par av stavar og tverrbjelkar dannar grinder. I svåla-løa ber grindene den treskipa konstruksjonen.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_saebotunet"],"c":["grindverk","trekonstruksjon"],"g":["omgrep_grindverk"],"m":"met_sporlesning","b":"Svåla-løa har ein treskipa grindverkskonstruksjon."},{"q":"Kva er eit skifte i denne samanhengen?","o":["Ein årleg flytting av buskap mellom gard og seter","Ei ombygging der eitt hus blir delt i to","Ei juridisk oppteikning og fordeling av eigedelar etter eit dødsfall"],"a":2,"k":"Eit skifte er ei juridisk registrering og fordeling av eigedelar etter eit dødsfall. Skiftet frå 1799 fungerer derfor som skriftleg kjelde til bygningane og drifta på garden.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_saebotunet"],"c":["skifte","arkivkjelde"],"g":["omgrep_skifte"],"m":"met_kildekritikk","b":"Skiftet frå 1799 er ei arkivkjelde som reknar opp hus på garden."},{"q":"Kva uttrykkjer omgrepa inntun og uttun?","o":["Ei funksjonell deling mellom bustadnære område og driftsområde i tunet","Ei grense mellom innmark og utmark rundt heile garden","Ei deling mellom sjøvegen inn og landevegen ut av bygda"],"a":0,"k":"Inntun og uttun er ei funksjonell deling av gardstunet. Inntunet låg nær bustadhusa, medan uttunet samla fleire driftsbygningar og arbeidsfunksjonar.","t":"concept","e":"em_his_sosialhistorie_hverdagsliv","s":["kringom_saebotunet"],"c":["inntun","uttun","tunskipnad"],"g":["omgrep_tunskipnad"],"m":"met_kontekstualisering","b":"Sæbøtunet er organisert som inntun og uttun."},{"q":"Korleis bør ulike opplysningar om talet på bygningar i tunet behandlast?","o":["Det høgaste talet må alltid reknast som korrekt","Kjelda, tidspunktet og kva som blir telt må oppgivast","Alle tala må avvisast fordi dei er ulike"],"a":1,"k":"Skiftet frå 1799 listar femten hus, Kringom omtalar ti ståande hus, medan museet presenterer åtte innreidde bygningar. Tala kan gjelde ulike tidspunkt og avgrensingar og bør derfor ikkje blandast til eitt tidlaust fasitsvar.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["sunnhordland_museum_saebotunet","kringom_saebotunet"],"c":["kjeldekritikk","avgrensing","datering"],"g":["bygningstal"],"m":"met_kildekritikk","b":"Kjeldene oppgir ulike bygningstal fordi dei kan gjelde ulike tidspunkt og avgrensingar."},{"q":"Kvifor gir eit heilt bevart tun meir kunnskap enn eitt lausrive hus?","o":["Fordi museet då kan slå fast nøyaktig kven som brukte kvart rom","Fordi alle bygningane må vere oppførte på same tid","Fordi plasseringa mellom bustad, lager, dyr og arbeid viser korleis garden fungerte som heilskap"],"a":2,"k":"Samanhengen mellom bygningane viser korleis hushald, arbeid, lagring og dyrehald var organiserte. Det gjer tunet til ei kjelde til både byggeskikk og sosialhistorie.","t":"analysis","e":"em_his_sosialhistorie_hverdagsliv","s":["sunnhordland_museum_saebotunet","kringom_saebotunet"],"c":["heilskapleg kulturmiljø","sosialhistorie"],"g":["tunet_som_heilskap"],"m":"met_kontekstualisering","b":"Plasseringa og sambandet mellom bygningane viser korleis garden fungerte som heilskap."}]}];
const SOURCES = {
  sunnhordland_museum_saebotunet: 'https://sunnhordland.museum.no/avdeling/saebotunet/',
  kringom_saebotunet: 'https://www.kringom.no/nb/sunnhordland/etne/saebotunet'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `saebotunet_etne_quiz_${globalNo}`,
    quiz_id: `historie_saebotunet_etne_set_${setNo}_q${pos}`,
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
      'data/places/historie/vestland/etne/saebotunet_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'bygdetun',
      subtype: 'bevart_gardstun_for_sosialhistorie_byggeskikk_og_handverk',
      signature_features: [
        'bevart historisk gardstun i Etne',
        'overtatt av Sunnhordland Museum i 1938',
        'skifte frå 1799 med femten oppførte hus',
        'stovehus sett saman av røykstove og glasstove',
        'inntun, uttun og treskipa svåla-løe i grindverk'
      ],
      primary_angles: ['sosialhistorie', 'hverdagsliv', 'byggeskikk', 'museumshistorie'],
      avoid_angles: ['låse quizen til eitt tidlaust bygningstal', 'redusere staden til generisk folkemuseum', 'bruke dagsaktuelle opningstider eller prisar']
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
else throw new Error('Usage: node .tmp/bootstrap-saebotunet.mjs assemble|validate');
