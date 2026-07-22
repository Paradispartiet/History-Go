import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'helgaberget_etne';
const OUT = 'data/quiz/historie/helgaberget_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_helgaberget_etne_set_1","level":1,"order":1,"xp":50,"title":"Motiva på berget","questions":[{"q":"Kva type kulturminne er Helgaberget?","o":["Eit helleristningsfelt","Ei gravrøys","Ein bygdeborg"],"a":0,"k":"Helgaberget er eit helleristningsfelt på ein låg bergknaus på Stødleterrassen.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["helleristningsfelt","bergkunst"],"g":["helleristningar"],"m":"met_sporlesning","b":"Helgaberget er eit helleristningsfelt på ein låg bergknaus på Stødleterrassen."},{"q":"Kva tidsperiode blir bergkunsten på Helgaberget knytt til?","o":["Bronsealderen","Vikingtida","Høgmellomalderen"],"a":0,"k":"Motiva på Helgaberget blir knytte til bronsealderens jordbrukskultur.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["bronsealder","bergkunst"],"g":["bronsealder"],"m":"met_periodisering","b":"Motiva på Helgaberget blir knytte til bronsealderens jordbrukskultur."},{"q":"Kor mange skålgroper er minst registrerte på Helgaberget?","o":["270","27","2 700"],"a":0,"k":"Minst 270 skålgroper er registrerte på bergflata. Dei er den største motivgruppa på feltet.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["skålgroper"],"g":["270_skaalgroper"],"m":"met_sporlesning","b":"Minst 270 skålgroper er registrerte på bergflata."},{"q":"Kor mange ringfigurar er registrerte på feltet?","o":["23","13","33"],"a":0,"k":"Helgaberget har 23 registrerte ringfigurar i fleire variantar.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["ringfigurar"],"g":["23_ringfigurar"],"m":"met_sporlesning","b":"Helgaberget har 23 registrerte ringfigurar i fleire variantar."},{"q":"Kor store er skålgropene vanlegvis oppgitt å vere i tverrmål?","o":["Om lag 3–10 centimeter","Om lag 30–100 centimeter","Om lag 1–2 meter"],"a":0,"k":"Skålgropene varierer frå om lag 3–4 til 10 centimeter i tverrmål.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["skålgrop","materialspor"],"g":["storleik"],"m":"met_sporlesning","b":"Skålgropene varierer frå om lag 3–4 til 10 centimeter i tverrmål."}]},{"id":"historie_helgaberget_etne_set_2","level":2,"order":2,"xp":70,"title":"Feltets særpreg","questions":[{"q":"Kva motivgruppe finst det om lag 20 av på Helgaberget?","o":["Ovale eller U-forma figurar","Skipsfigurar","Dyrefigurar"],"a":0,"k":"Om lag 20 ovale eller U-forma figurar er registrerte saman med skålgropene og ringfigurane.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["ovalfigurar","U-forma figurar"],"g":["ovalfigurar"],"m":"met_sporlesning","b":"Om lag 20 ovale eller U-forma figurar er registrerte saman med skålgropene og ringfigurane."},{"q":"Kva motiv manglar på Helgaberget, ifølgje skildringa av feltet?","o":["Skip, menneske og dyr","Skålgroper og ringar","Ovale og U-forma figurar"],"a":0,"k":"Feltet skil seg ut ved at skip, fotspor, menneske og dyr ikkje er registrerte blant motiva.","t":"observation","e":"em_his_kilder_taushet_blindsoner","s":["kringom_helgaberget"],"c":["fråvær av motiv","arkeologisk observasjon"],"g":["manglande_motiv"],"m":"met_sporlesning","b":"Feltet skil seg ut ved at skip, fotspor, menneske og dyr ikkje er registrerte blant motiva."},{"q":"Kva to former kan ringfigurane på Helgaberget ha?","o":["Eiker som eit hjul eller konsentriske sirklar","Skip med stavn eller menneske med våpen","Fotspor eller dyrespor"],"a":0,"k":"Nokre ringfigurar har eiker som eit hjul, medan andre består av konsentriske sirklar med ei skålgrop i midten.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["ringfigur","konsentriske sirklar"],"g":["ringvariantar"],"m":"met_sporlesning","b":"Nokre ringfigurar har eiker som eit hjul, medan andre består av konsentriske sirklar med ei skålgrop i midten."},{"q":"Kvifor blir motiva på Helgaberget rekna som jordbruksristningar?","o":["Dei høyrer til ein bergkunsttradisjon knytt til jordbrukslandskap","Dei viser sikre kart over åkergrenser","Dei vart laga med moderne jordbruksmaskiner"],"a":0,"k":"Jordbruksristningar er bergkunst frå bronsealderens jordbruksmiljø, i motsetnad til eldre veideristningar som ofte viser jakt og dyr.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["jordbruksristningar","jordbrukslandskap"],"g":["jordbruksristningar"],"m":"met_kontekstualisering","b":"Jordbruksristningar er bergkunst frå bronsealderens jordbruksmiljø, i motsetnad til eldre veideristningar som ofte viser jakt og dyr."},{"q":"Kva gjer motivsamansetjinga på Helgaberget særmerkt?","o":["Skålgroper og ringar dominerer, medan skip og levande vesen manglar","Skip dominerer, medan skålgroper manglar","Feltet består berre av dyrefigurar"],"a":0,"k":"Helgaberget har svært mange skålgroper og fleire ringfigurar, men manglar motiv som skip, menneske og dyr. Denne kombinasjonen gir feltet eit tydeleg særpreg.","t":"analysis","e":"em_his_kilder_taushet_blindsoner","s":["kringom_helgaberget"],"c":["motivsamansetjing","særpreg"],"g":["motivsamansetjing"],"m":"met_sammenligning","b":"Helgaberget har svært mange skålgroper og fleire ringfigurar, men manglar motiv som skip, menneske og dyr."}]},{"id":"historie_helgaberget_etne_set_3","level":3,"order":3,"xp":90,"title":"Tolking og vern","questions":[{"q":"Kva er ei skålgrop i bergkunst?","o":["Ei lita skålforma grop hogd eller banka inn i berg","Ei naturleg sprekk fylt med vatn","Eit hol bora for moderne sikringsboltar"],"a":0,"k":"Ei skålgrop er ei lita rund eller skålforma fordjuping som er laga i bergflata. Den opphavlege bruken og tydinga kan vere usikker.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["skålgrop","bergkunst"],"g":["omgrep_skaalgrop"],"m":"met_sporlesning","b":"Ei skålgrop er ei lita rund eller skålforma fordjuping som er laga i bergflata."},{"q":"Kva meiner arkeologar med bergkunst?","o":["Figurar og teikn som er hogde, banka eller måla på berg","Lausgjenstandar av metall funne i jord","Tekstar skrivne på papir i arkiv"],"a":0,"k":"Bergkunst er bilete, figurar eller teikn som er laga direkte på bergflater. Helleristningar er bergkunst som er hogd eller banka inn i berget.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_helgaberget"],"c":["bergkunst","helleristning"],"g":["omgrep_bergkunst"],"m":"met_sporlesning","b":"Bergkunst er bilete, figurar eller teikn som er laga direkte på bergflater."},{"q":"Kva er kjeldekritisk forsvarleg å seie om ein mogleg kultisk funksjon?","o":["Det er ei mogleg tolking, men ikkje sikkert bevist","Det er sikkert bevist av ringfigurane åleine","Det kan avvisast fordi skriftlege kjelder manglar"],"a":0,"k":"Ristningane kan ha inngått i ritual eller kult, men symbola gir ikkje eit sikkert svar. Kjeldevurderinga må skilje mellom registrerte motiv og moderne tolkingar.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_helgaberget"],"c":["kjeldekritikk","tolking","ritual"],"g":["kultisk_tolking"],"m":"met_kildekritikk","b":"Ristningane kan ha inngått i ritual eller kult, men symbola gir ikkje eit sikkert svar."},{"q":"Kvifor er landskapet rundt Helgaberget viktig for tolkinga av feltet?","o":["Bergkunsten inngår i eit miljø med jordbruk, gravminne og langvarig busetnad","Motiva kan berre forståast dersom berget blir flytta til eit museum","Landskapet viser at alle figurane vart laga samtidig"],"a":0,"k":"Helgaberget ligg i det rike kulturmiljøet på Stødleterrassen. Nærleiken til jordbrukslandskap, gravminne og andre funn gir arkeologisk samanheng utan å bevise ei bestemt tyding.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_helgaberget","vestland_stodleterrassen_freda"],"c":["kulturlandskap","arkeologisk kontekst"],"g":["stodleterrassen"],"m":"met_kontekstualisering","b":"Helgaberget ligg i det rike kulturmiljøet på Stødleterrassen."},{"q":"Kvifor blir heile Stødleterrassen verna som kulturmiljø?","o":["Fordi fleire typar spor saman viser bruk og makt gjennom fleire tusen år","Fordi berre helleristningane har historisk verdi","Fordi området skal byggjast om til ein kopi av bronsealderen"],"a":0,"k":"Fredinga omfattar eit samanhengande kulturmiljø med spor etter busetnad, gravlegging, jordbruk, kult og makt gjennom fleire tusen år. Heilskapen gir meir kunnskap enn kvart enkelt kulturminne åleine.","t":"analysis","e":"em_his_kulturminner_bevaring","s":["vestland_stodleterrassen_freda","kringom_helgaberget"],"c":["kulturmiljøvern","heilskap"],"g":["freding"],"m":"met_kontekstualisering","b":"Fredinga omfattar eit samanhengande kulturmiljø med spor etter busetnad, gravlegging, jordbruk, kult og makt gjennom fleire tusen år."}]}];
const SOURCES = {
  kringom_helgaberget: 'https://www.kringom.no/nb/sunnhordland/etne/helgaberget',
  vestland_stodleterrassen_freda: 'https://www.vestlandfylke.no/nyheitsarkiv/2024/stodleterrassen-i-etne-er-freda/'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `helgaberget_etne_quiz_${globalNo}`,
    quiz_id: `historie_helgaberget_etne_set_${setNo}_q${pos}`,
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
      'data/places/historie/vestland/etne/helgaberget_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'helleristningsfelt',
      subtype: 'bronsealderens_jordbruksristningar_med_ringfigurar_og_skaalgroper',
      signature_features: [
        'minst 270 registrerte skålgroper',
        '23 ringfigurar i fleire variantar',
        'om lag 20 ovale eller U-forma figurar',
        'fråvær av skip, menneske og dyr',
        'plassering i kulturmiljøet på Stødleterrassen'
      ],
      primary_angles: ['bronsealder', 'bergkunst', 'arkeologisk kjeldekritikk', 'kulturmiljøvern'],
      avoid_angles: ['presentere kultstad som bevist faktum', 'blande feltet med skipsristningar']
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
    ids.add(q.id); quizIds.add(q.quiz_id);
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
else throw new Error('Usage: node .tmp/bootstrap-helgaberget.mjs assemble|validate');
