import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'duesteinen_etne';
const OUT = 'data/quiz/historie/duesteinen_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_duesteinen_etne_set_1","level":1,"order":1,"xp":50,"title":"Ringar og groper på Vinja","questions":[{"q":"Kvar ligg Duesteinen?","o":["På Vinja i Stordalen","På Stødleterrassen","Ved Etnepollen"],"a":0,"k":"Duesteinen ligg på Vinja i Stordalen, nær Stordalsvatnet.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne","digitaltmuseum_duesteinen"],"c":["Vinja","Stordalen"],"g":["vinja_stordalen"],"m":"met_kontekstualisering","b":"Duesteinen er ein helleristningslokalitet på Vinja i Stordalen."},{"q":"Kva hovudperiode blir bergkunsten på Duesteinen knytt til?","o":["Bronsealderen","Romartida","Seinmellomalderen"],"a":0,"k":"Duesteinen blir lesen som del av Etne si omfattande bergkunst frå bronsealderen.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["bronsealder","bergkunst"],"g":["bronsealder"],"m":"met_periodisering","b":"Duesteinen høyrer til bronsealderens bergkunstlandskap i Etne."},{"q":"Kva figurtype er registrert på Duesteinen?","o":["Ringfigurar","Skipsflåtar med mannskap","Dyreflokkar i jakt"],"a":0,"k":"Ringfigurar er blant dei registrerte motiva på Duesteinen.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne","digitaltmuseum_duesteinen"],"c":["ringfigur","helleristning"],"g":["ringfigurar"],"m":"met_sporlesning","b":"Duesteinen har registrerte ringfigurar."},{"q":"Kva finst i stort tal saman med ringfigurane?","o":["Skålgroper","Runer","Borehol etter steinbrot"],"a":0,"k":"Kringom omtalar mange skålgroper på Duesteinen saman med ringfigurane.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["skålgroper","motivkombinasjon"],"g":["mange_skaalgroper"],"m":"met_sporlesning","b":"Duesteinen har mange skålgroper saman med ringfigurane."},{"q":"Kva tre helleristningsstader i Etne er særleg tilrettelagde for besøk?","o":["Helgaberget, Duesteinen og Bruteigsteinen","Borgåsen, Duesteinen og Sæbøtunet","Helgaberget, Grindheim kyrkje og Duesteinen"],"a":0,"k":"Helgaberget på Stødle og Duesteinen og Bruteigsteinen i Stordalen er dei tre tilrettelagde helleristningsstadene som blir presenterte samla.","t":"fact","e":"em_his_kulturminner_bevaring","s":["fjord_norway_helleristningar_etne"],"c":["tilrettelegging","kulturminne"],"g":["tre_tilrettelagde_felt"],"m":"met_kontekstualisering","b":"Helgaberget, Duesteinen og Bruteigsteinen er tilrettelagde helleristningsstader i Etne."}]},{"id":"historie_duesteinen_etne_set_2","level":2,"order":2,"xp":70,"title":"Eit felt i eit større landskap","questions":[{"q":"Kva kombinasjon kjenneteiknar Duesteinen i kjeldene?","o":["Ringfigurar og mange skålgroper","Skip og eit sjeldsynt tremotiv","Berre ovale og U-forma teikn"],"a":0,"k":"Duesteinen er særleg omtalt med ringfigurar og mange skålgroper.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["ringfigurar","skålgroper"],"g":["ringar_og_groper"],"m":"met_sporlesning","b":"Ringfigurar og mange skålgroper er den dokumenterte motivkombinasjonen på Duesteinen."},{"q":"Kva institusjonssamling har fotografisk dokumentasjon av Duesteinen?","o":["DigitaltMuseum / Universitetsmuseet i Bergen","Nasjonalbibliotekets avissamling","Norsk vegmuseum"],"a":0,"k":"Fotografi av Duesteinen finst i DigitaltMuseum gjennom Universitetsmuseet i Bergen si samling.","t":"fact","e":"em_his_kildekritikk_arkiv_spor","s":["digitaltmuseum_duesteinen"],"c":["fotodokumentasjon","museumssamling"],"g":["digitaltmuseum"],"m":"met_kildekritikk","b":"Universitetsmuseet si samling dokumenterer Duesteinen fotografisk i DigitaltMuseum."},{"q":"Kva to andre tilrettelagde felt gir den viktigaste lokale samanlikninga?","o":["Helgaberget og Bruteigsteinen","Borgåsen og Helgaberget","Bruteigsteinen og Gjerde kyrkje"],"a":0,"k":"Duesteinen kan lesast saman med Helgaberget og Bruteigsteinen. Dei tre felta viser både fellestrekk og ulik motivsamansetjing.","t":"fact","e":"em_his_spor_materialitet","s":["fjord_norway_helleristningar_etne","kringom_bergkunst_etne"],"c":["lokal samanlikning","bergkunstfelt"],"g":["tre_etnefelt"],"m":"met_sammenligning","b":"Helgaberget og Bruteigsteinen er dei næraste formidlingsmessige samanlikningsfelta til Duesteinen."},{"q":"Kvifor er eldre fotografi av bergflata nyttige?","o":["Dei gjer det mogleg å samanlikne synlegheit og tilstand over tid utan å røre berget","Dei beviser den opphavlege tydinga til kvar figur","Dei erstattar behovet for å registrere sjølve lokaliteten"],"a":0,"k":"Fotografi kan dokumentere plassering, form og tilstand på eit bestemt tidspunkt. Seinare bilete kan samanliknast med dei utan å måtte gripe inn i den sårbare bergflata.","t":"analysis","e":"em_his_kulturminner_bevaring","s":["digitaltmuseum_duesteinen"],"c":["tilstandsdokumentasjon","fotografisk kjelde"],"g":["dokumentasjon_over_tid"],"m":"met_kildekritikk","b":"Fotodokumentasjon gjer samanlikning over tid mogleg og reduserer behovet for fysisk handsaming."},{"q":"Kvifor er Duesteinen viktig sjølv om Bruteigsteinen har større motivvariasjon?","o":["Duesteinen viser at bergkunsten ligg tett på fleire lokalitetar i det same dalføret","Duesteinen har sikkert vore hovudfeltet som styrte alle dei andre","Duesteinen er den einaste staden i Etne med skålgroper"],"a":0,"k":"Duesteinen gjer den geografiske konsentrasjonen synleg. Eit mindre variert felt kan vere avgjerande for å forstå at bergkunstpraksisen var spreidd over fleire stader rundt Stordalsvatnet.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne","fjord_norway_helleristningar_etne"],"c":["lokalitetskonsentrasjon","bergkunstlandskap"],"g":["landskapsrolle"],"m":"met_kontekstualisering","b":"Duesteinen dokumenterer den tette geografiske konsentrasjonen av bergkunstfelt i Stordalen."}]},{"id":"historie_duesteinen_etne_set_3","level":3,"order":3,"xp":90,"title":"Landskapsarkeologi og vern","questions":[{"q":"Kva betyr lokalitetskonsentrasjon rundt Stordalsvatnet?","o":["At mange registrerte bergkunststader ligg innanfor eit avgrensa landskap","At alle figurane er samla på éi bergflate","At alle lokalitetane har identisk motivutval"],"a":0,"k":"Lokalitetskonsentrasjon betyr at mange separate funnstader ligg tett i eit område. Rundt Stordalsvatnet finst fleire sjølvstendige helleristningsfelt.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["lokalitetskonsentrasjon","funnstad"],"g":["omgrep_lokalitetskonsentrasjon"],"m":"met_kontekstualisering","b":"Duesteinen inngår i ein tett konsentrasjon av separate bergkunstlokalitetar."},{"q":"Kva er landskapsarkeologi i arbeidet med Duesteinen?","o":["Å undersøkje korleis funnstaden heng saman med vatn, ferdsel, gardar og andre kulturminne","Å studere berre den enkelte ringfiguren utan omgjevnadene","Å rekonstruere eit bestemt ritual utan fysiske eller geografiske spor"],"a":0,"k":"Landskapsarkeologi ser funn i geografisk samanheng. Duesteinen blir då undersøkt som del av Stordalen med Stordalsvatnet, ferdselsliner, gardar og fleire bergkunstfelt.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_bergkunst_etne"],"c":["landskapsarkeologi","romleg samanheng"],"g":["omgrep_landskapsarkeologi"],"m":"met_kontekstualisering","b":"Duesteinen kan analyserast gjennom sambandet mellom funnstaden og det omkringliggjande landskapet."},{"q":"Kva betyr tilstandsdokumentasjon av bergkunst?","o":["Systematisk registrering av korleis figurane og bergflata ser ut på eit bestemt tidspunkt","Ei moderne oppmåling som gir symbola ei endeleg tyding","Oppmaling av alle figurane for å gjere dei permanente"],"a":0,"k":"Tilstandsdokumentasjon registrerer synlege trekk, skadar og endringar på eit tidspunkt. Foto og andre berøringsfrie metodar kan brukast i vern og oppfølging.","t":"concept","e":"em_his_kulturminner_bevaring","s":["digitaltmuseum_duesteinen"],"c":["tilstandsdokumentasjon","kulturminnevern"],"g":["omgrep_tilstandsdokumentasjon"],"m":"met_kildekritikk","b":"Fotografi av Duesteinen fungerer som dokumentasjon av feltets synlege tilstand."},{"q":"Kva er kjeldekritisk riktig når fleire Etne-felt blir lesne saman?","o":["Felta kan vise ein regional praksis, men kvar lokalitet må analyserast ut frå sitt eige motivutval og sin kontekst","Alle felta må ha hatt same funksjon fordi dei ligg i same kommune","Forskjellar mellom felta kan ignorerast når dateringa er lik"],"a":0,"k":"Nærleik og lik datering gjer samanlikning relevant, men Duesteinen, Helgaberget og Bruteigsteinen har ulike motiv og lokale samanhengar. Eit regionalt mønster er ikkje det same som identisk funksjon.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_bergkunst_etne"],"c":["samanliknande analyse","lokal variasjon"],"g":["ikkje_identiske_felt"],"m":"met_sammenligning","b":"Etne-felta kan samanliknast regionalt utan at ulikskapane mellom lokalitetane blir viska ut."},{"q":"Kva kan vi sikkert seie om ringfigurane og skålgropene på Duesteinen?","o":["Dei er registrerte bergkunstspor, medan den opphavlege tydinga er usikker","Dei er sikre kartteikn for bronsealdergardane","Dei dokumenterer eitt bestemt fruktbarheitsritual"],"a":0,"k":"Formene og plasseringa kan dokumenterast. Kva dei betydde for menneska som laga dei, kan diskuterast gjennom tolkingar, men er ikkje sikkert kjent.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_bergkunst_etne","digitaltmuseum_duesteinen"],"c":["observasjon","symboltolking"],"g":["usikker_tyding"],"m":"met_kildekritikk","b":"Ringfigurane og skålgropene er dokumenterte, men den opphavlege tydinga er ikkje sikkert kjend."}]}];
const SOURCES = {
  kringom_bergkunst_etne: 'https://www.kringom.no/nb/sunnhordland/etne/helgaberget',
  digitaltmuseum_duesteinen: 'https://digitaltmuseum.no/0210112418176/helleristninger-duesteinen-vinje-etne-hordaland',
  fjord_norway_helleristningar_etne: 'https://www.fjordnorway.com/no/se-og-gjore/hellerisningar-i-etne'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `duesteinen_etne_quiz_${globalNo}`,
    quiz_id: `historie_duesteinen_etne_set_${setNo}_q${pos}`,
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
    epoke_id: 'bronsealder',
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
      'data/places/historie/vestland/etne/duesteinen_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'helleristningsfelt',
      subtype: 'ringfigurar_og_skaalgroper_i_stordalens_bergkunstlandskap',
      signature_features: [
        'plassering på Vinja i Stordalen ved Stordalsvatnet',
        'registrerte ringfigurar og mange skålgroper',
        'eit av tre tilrettelagde helleristningsfelt i Etne',
        'fotografisk dokumentasjon i Universitetsmuseet si samling',
        'viktig for å forstå den tette konsentrasjonen av bergkunstlokalitetar'
      ],
      primary_angles: ['bronsealder', 'landskapsarkeologi', 'fotodokumentasjon', 'lokal variasjon'],
      avoid_angles: ['kopiere Bruteigsteinens motivquiz', 'påstå at alle Etne-felta hadde same funksjon', 'gi ringar og groper ei sikker rituell tyding']
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
else throw new Error('Usage: node .tmp/bootstrap-duesteinen.mjs assemble|validate');
