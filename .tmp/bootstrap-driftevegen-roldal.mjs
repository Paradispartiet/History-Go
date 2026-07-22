import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'driftevegen_stordalen_roldal';
const OUT = 'data/quiz/historie/driftevegen_stordalen_roldal_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_driftevegen_stordalen_roldal_set_1","level":1,"order":1,"xp":50,"title":"Ferdselslinja mot Røldal","questions":[{"q":"Kvar gjekk den gamle ferdselslinja frå Etne-sida?","o":["Gjennom Stordalen og Øyno mot Røldal","Langs Etnepollen og vidare til Skånevik","Over Stødleterrassen og ned til Hardangerfjorden"],"a":0,"k":"Driftevegen gjekk gjennom Stordalen og Øyno og vidare over fjellet mot Røldal.","t":"fact","e":"em_his_reise_transport","s":["kringom_akrafjorden","kringom_kyrping"],"c":["Stordalen","Øyno","Røldal"],"g":["stordalen_oyno_roldal"],"m":"met_sporlesning","b":"Kjeldene legg den historiske ferdselslinja gjennom Stordalen og Øyno mot Røldal."},{"q":"Kor langt tilbake blir sambandet omtalt som sentralt?","o":["Til mellomalderen","Til 1700-talet","Til jernbanealderen"],"a":0,"k":"Kringom omtalar ruta som ei sentral aust–vestgåande sambandsline heilt frå mellomalderen.","t":"fact","e":"em_his_reise_transport","s":["kringom_akrafjorden"],"c":["mellomalder","aust–vest-samband"],"g":["sidan_mellomalderen"],"m":"met_periodisering","b":"Sambandet mellom Stordalen og Røldal er dokumentert som sentralt sidan mellomalderen."},{"q":"Kva gjorde Røldal kyrkje viktig for ferdselen?","o":["Ho var ein viktig valfartsstad","Ho var hovudsete for postvesenet","Ho var tollstasjon for sjøhandel"],"a":0,"k":"Røldal kyrkje var ein viktig valfartsstad som drog pilegrimar over fjellet.","t":"fact","e":"em_his_tro_ritualer","s":["kringom_akrafjorden","kringom_kyrping"],"c":["Røldal kyrkje","valfart"],"g":["roldal_valfartsstad"],"m":"met_kontekstualisering","b":"Pilegrimsferd til Røldal kyrkje var ein viktig bruk av ruta."},{"q":"Kva årleg hending heldt fram med å trekkje reisande til Røldal langt inn på 1800-talet?","o":["Røldalsmarknaden","Etne ting","Skånevikmessa"],"a":0,"k":"Den årlege Røldalsmarknaden trekte til seg mykje folk langt inn på 1800-talet.","t":"fact","e":"em_his_arbeid_naering","s":["kringom_akrafjorden","kringom_kyrping"],"c":["Røldalsmarknaden","marknadsferd"],"g":["roldalsmarknaden"],"m":"met_periodisering","b":"Røldalsmarknaden heldt ferdselslinja viktig også etter mellomalderen."},{"q":"Kven brukte den gamle fjellruta?","o":["Krøtterdrivarar, pilegrimar, handelsfolk og andre reisande","Berre kongens embetsmenn og soldatar","Berre lokale bønder på veg til eigne stølar"],"a":0,"k":"Ruta vart brukt til drift av krøtter, transport av varer, pilegrimsferd og reiser til marknaden.","t":"observation","e":"em_his_reise_transport","s":["kringom_akrafjorden","kringom_kyrping"],"c":["krøtterdrift","pilegrimar","handelsreisande"],"g":["fleire_brukargrupper"],"m":"met_kontekstualisering","b":"Den same ferdselslinja tente fleire typar reisande og transport."}]},{"id":"historie_driftevegen_stordalen_roldal_set_2","level":2,"order":2,"xp":70,"title":"Knutepunkt, terreng og bruk","questions":[{"q":"Kva rolle hadde Kyrping i ferdselen mot Røldal?","o":["Knutepunkt mellom sjøvegen og ruta gjennom Stordalen","Fast vinterhamn for kongelege krigsskip","Endestasjon for den Stavangerske Posttour"],"a":0,"k":"Kyrping var eit gammalt knutepunkt mellom sjøferdsel og hovudvegen austover gjennom Stordalen og Øyno mot Røldal.","t":"fact","e":"em_his_reise_transport","s":["kringom_kyrping"],"c":["Kyrping","knutepunkt","sjøveg"],"g":["kyrping_knutepunkt"],"m":"met_kontekstualisering","b":"Kyrping kopla ferdsel på fjorden til ruta austover mot Røldal."},{"q":"Kvar kom mange av pilegrimane til Røldal frå før dei tok fjellruta?","o":["Bergen og fjordbygdene nordafor","Berre gardane inst i Stordalen","Sverige og Austlandet via ein kystveg"],"a":0,"k":"Kringom omtalar reisande frå Bergen og fjordbygdene nordafor som kom sjøvegen og drog vidare mot Røldal.","t":"fact","e":"em_his_tro_ritualer","s":["kringom_kyrping"],"c":["Bergen","fjordbygder","pilegrimsferd"],"g":["pilegrimar_fra_fjordbygdene"],"m":"met_kontekstualisering","b":"Pilegrimar frå Bergen og fjordbygdene kunne gå i land ved Kyrping og halde fram gjennom Stordalen."},{"q":"Kva opplyser dagens turskildring frå Øyno om stien?","o":["Han følgjer i hovudsak den gamle ferdselsvegen mellom Etne og Røldal","Han er ein heilt ny sti utan historisk samband","Han følgjer den gamle postvegen mellom Etne og Skånevik"],"a":0,"k":"UT.no opplyser at stien frå Øyno i hovudsak følgjer den gamle ferdselsvegen mellom Etne og Røldal.","t":"fact","e":"em_his_spor_materialitet","s":["ut_indre_etnefjellene"],"c":["dagens sti","historisk ferdselsveg"],"g":["sti_folger_gammal_veg"],"m":"met_sporlesning","b":"Dagens sti frå Øyno overlappar i hovudsak den historiske ferdselsretninga."},{"q":"Kvifor vart Stordalen og Øyno ein naturleg ferdselskorridor?","o":["Dalføret leidde ferdselen frå fjorden mot pass og høgfjell i aust","Terrenget var heilt flatt og utan høgdeskilnader","Ruta var vald for å unngå alle gardar og hamner"],"a":0,"k":"Dalføret gav ei samanhengande retning frå Åkrafjorden opp mot fjellet. Terreng, gardar og naturlege pass forma kvar ferdselen kunne gå.","t":"analysis","e":"em_his_landskap_makt_identitet","s":["kringom_akrafjorden","kringom_kyrping","ut_indre_etnefjellene"],"c":["dalføre","ferdselskorridor","terrengtilpassing"],"g":["landskap_formar_rute"],"m":"met_kontekstualisering","b":"Stordalen gav ein naturleg korridor frå fjorden mot fjellovergangen til Røldal."},{"q":"Kva viser det at same rute vart brukt til drift, valfart og marknad?","o":["Ei ferdselslinje kunne ha økonomiske, religiøse og praktiske funksjonar samtidig","Kvar brukargruppe måtte ha ein heilt separat veg gjennom dalen","Ruta vart berre brukt i eitt bestemt århundre"],"a":0,"k":"Den same korridoren tente transport av dyr og varer, religiøse reiser og marknadsferd. Historiske vegar kan derfor ikkje alltid forklarast med eitt føremål.","t":"analysis","e":"em_his_reise_transport","s":["kringom_akrafjorden","kringom_kyrping"],"c":["fleirbruk","regionalt nettverk"],"g":["same_rute_fleire_formal"],"m":"met_kontekstualisering","b":"Ruta hadde fleire samtidige og skiftande funksjonar for reisande og lokalsamfunn."}]},{"id":"historie_driftevegen_stordalen_roldal_set_3","level":3,"order":3,"xp":90,"title":"Drifteveg, valfart og rutespor","questions":[{"q":"Kva er ein drifteveg?","o":["Ei ferdselsrute brukt til å drive husdyr mellom område og marknader","Ein veg bygd berre for å frakte tømmer med slede","Ein offentleg postveg med faste postgardar"],"a":0,"k":"Ein drifteveg er ei rute der krøtter eller andre husdyr vart førte over lengre avstandar, ofte til beite, handel eller marknad.","t":"concept","e":"em_his_arbeid_naering","s":["kringom_akrafjorden"],"c":["drifteveg","krøtterdrift"],"g":["omgrep_drifteveg"],"m":"met_kontekstualisering","b":"Krøtterdrift var ein av dei historiske funksjonane på sambandet mellom Etne og Røldal."},{"q":"Kva betyr valfart?","o":["Ei religiøst motivert reise til ein heilag stad","Ei årleg flytting av buskap til stølen","Ei offentleg inspeksjonsreise langs postruta"],"a":0,"k":"Valfart er ei religiøst motivert reise til ein heilag stad. Røldal kyrkje var eit viktig mål for slike reiser.","t":"concept","e":"em_his_tro_ritualer","s":["kringom_akrafjorden","kringom_kyrping"],"c":["valfart","pilegrimsferd"],"g":["omgrep_valfart"],"m":"met_kontekstualisering","b":"Pilegrimar brukte ruta på veg til valfartsstaden Røldal kyrkje."},{"q":"Kva er eit linjeanker på kartet?","o":["Eit representativt punkt på ei lang rute som hjelper brukaren inn i landskapet","Det nøyaktige geometriske sentrum av heile den historiske vegen","Eit bevis på at all ferdsel gjekk innanfor markørradiusen"],"a":0,"k":"Eit linjeanker er eit praktisk kartpunkt på eit lineært kulturminne. Øyno representerer Etne-sida av ruta, ikkje heile ferdselsvegen.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_akrafjorden","ut_indre_etnefjellene"],"c":["linjeanker","lineært kulturminne"],"g":["omgrep_linjeanker"],"m":"met_kildekritikk","b":"Markøren ved Øyno er eit representativt punkt på den lange ruta mot Røldal."},{"q":"Kvifor bør ruta ikkje framstillast som éin nøyaktig og uendra trasé gjennom alle periodar?","o":["Stiar og ferdselsval kan ha flytta seg med terreng, bruk og seinare inngrep","Alle mellomaldervegar vart flytta kvart einaste år","Kjeldene viser at ruta berre eksisterte som ei teikna linje på kart"],"a":0,"k":"Den historiske ferdselsretninga er godt dokumentert, men konkrete stiforløp kan ha skifta. Dagens sti, stadnamn og skriftlege kjelder må lesast saman utan å late som kvart meter er uendra frå mellomalderen.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_akrafjorden","ut_indre_etnefjellene"],"c":["traséendring","romleg kjeldekritikk"],"g":["ikkje_ein_uforandra_trase"],"m":"met_kildekritikk","b":"Kjeldene dokumenterer sambandet og retninga betre enn éin meterpresis, uendra trasé."},{"q":"Kvifor heldt Røldalsmarknaden sambandet viktig inn på 1800-talet?","o":["Marknaden skapte behov for å flytte menneske, dyr og varer mellom aust og vest","Marknaden gjorde all sjøferdsel og lokal handel forbode","Marknaden vart halden berre for pilegrimar utan varebyte"],"a":0,"k":"Ein stor årleg marknad samla kjøparar, seljarar, dyr og varer. Det gav den eldre fjellruta økonomisk betydning også etter at valfarten hadde endra karakter.","t":"analysis","e":"em_his_arbeid_naering","s":["kringom_akrafjorden","kringom_kyrping"],"c":["marknadsnettverk","varebyte","ferdselsbehov"],"g":["marknad_opprettheld_samband"],"m":"met_kontekstualisering","b":"Røldalsmarknaden skapte langvarig transport- og handelsbehov langs ruta."}]}];
const SOURCES = {
  kringom_akrafjorden: 'https://www.kringom.no/nb/sunnhordland/etne/akrafjorden',
  kringom_kyrping: 'https://www.kringom.no/nb/sunnhordland/etne/kyrping',
  ut_indre_etnefjellene: 'https://ut.no/turforslag/115813/porten-til-indre-etnefjellene'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `driftevegen_stordalen_roldal_quiz_${globalNo}`,
    quiz_id: `historie_driftevegen_stordalen_roldal_set_${setNo}_q${pos}`,
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
    epoke_id: 'middelalder',
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
      'data/places/historie/vestland/etne/driftevegen_stordalen_roldal.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'historisk_ferdselsveg',
      subtype: 'middelalderleg_drifte_pilegrims_og_marknadsrute_mot_roldal',
      signature_features: [
        'ferdselslinje gjennom Stordalen og Øyno mot Røldal',
        'sentralt aust–vest-samband sidan mellomalderen',
        'brukt av krøtterdrivarar, pilegrimar og marknadsreisande',
        'knytt til Røldal kyrkje og Røldalsmarknaden',
        'Øyno er lineært ruteanker, ikkje geometrisk sentrum'
      ],
      primary_angles: ['samferdsel', 'driftehandel', 'pilegrimsferd', 'landskapsarkeologi'],
      avoid_angles: ['behandle markøren som heile ruta', 'fastslå éin meterpresis uendra trasé', 'redusere ruta til berre pilegrimsveg eller berre drifteveg']
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
else throw new Error('Usage: node .tmp/bootstrap-driftevegen-roldal.mjs assemble|validate');
