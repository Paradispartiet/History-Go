import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGET = 'bruteigsteinen_etne';
const OUT = 'data/quiz/historie/bruteigsteinen_etne_sets.json';
const MANIFEST = 'data/quiz/manifest.json';
const SETS = [{"id":"historie_bruteigsteinen_etne_set_1","level":1,"order":1,"xp":50,"title":"Bileta på steinen","questions":[{"q":"Kva type kulturminne er Bruteigsteinen?","o":["Eit helleristningsfelt på ei stor steinblokk","Ei gravrøys med synleg gravkammer","Ein bygdeborg med murrestar"],"a":0,"k":"Bruteigsteinen er eit helleristningsfelt på ei stor steinblokk på Flåte i Stordalen.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne","nve_etnevassdraget"],"c":["helleristningsfelt","steinblokk"],"g":["helleristningsfelt"],"m":"met_sporlesning","b":"Bruteigsteinen er eit helleristningsfelt på ei stor steinblokk i Stordalen."},{"q":"Kva hovudperiode blir ristningane daterte til?","o":["Bronsealderen","Folkevandringstida","Høgmellomalderen"],"a":0,"k":"Ristningane på Bruteigsteinen blir i hovudsak daterte til bronsealderen.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["bronsealder","datering"],"g":["bronsealder"],"m":"met_periodisering","b":"Bruteigsteinens ristningar blir daterte til bronsealderen."},{"q":"Kva sjeldsynt motiv er hogge inn på Bruteigsteinen?","o":["Eit tre","Ei vogn med fire hjul","Ein bygning med tak"],"a":0,"k":"Eit tremotiv er hogge inn mellom figurane. Kringom framhevar tre som eit uvanleg motiv i norsk helleristningskunst.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["tremotiv","bergkunst"],"g":["tremotiv"],"m":"met_sporlesning","b":"Bruteigsteinen har eit sjeldsynt innhogge tremotiv."},{"q":"Kva motivgruppe finst på Bruteigsteinen, men manglar på Helgaberget?","o":["Skip","Skålgroper","Ringfigurar"],"a":0,"k":"Bruteigsteinen har skipsfigurar. På Helgaberget er det ikkje registrert skip, sjølv om skålgroper og ringfigurar finst på begge stadene.","t":"observation","e":"em_his_kilder_taushet_blindsoner","s":["kringom_bergkunst_etne"],"c":["skipsfigurar","motivforskjell"],"g":["skipsfigurar"],"m":"met_sammenligning","b":"Skipsfigurar skil Bruteigsteinen frå Helgaberget."},{"q":"Kva utval finst i det samansette motivfeltet?","o":["Skip, menneske, dyr, tre, øksar og fleire geometriske motiv","Berre skålgroper, ringar og U-forma teikn","Berre dyr, jaktvåpen og fotspor"],"a":0,"k":"Feltet omfattar mellom anna ringfigurar, skip, menneske, dyr, tre, øksar, lurar, fotsolar, spiralar, ovalfigurar og skålgroper.","t":"observation","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["motivmangfald","bergkunst"],"g":["motivliste"],"m":"met_sporlesning","b":"Bruteigsteinen samlar svært mange ulike motivtypar på den same biletflata."}]},{"id":"historie_bruteigsteinen_etne_set_2","level":2,"order":2,"xp":70,"title":"Det mest varierte feltet","questions":[{"q":"Kva plass har Bruteigsteinen blant helleristningsfelta i Etne?","o":["Feltet har det mest varierte kjende motivutvalet","Feltet har flest figurar når alle skålgropene blir talde","Feltet er det einaste som har ringfigurar"],"a":0,"k":"Kringom omtalar Bruteigsteinen som det mest varierte biletfeltet i Etne. Helgaberget har flest figurar dersom skålgropene blir talde med.","t":"fact","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["motivvariasjon","samanlikning"],"g":["mest_variert"],"m":"met_sammenligning","b":"Bruteigsteinen har det mest varierte kjende motivutvalet blant Etne-felta."},{"q":"Kva vurdering gir NVE av Bruteigsteinen?","o":["Eit av Vestlandets mest interessante helleristningsfelt","Det største utgravde gravfeltet i Vestland","Det best bevarte mellomalderlege steinbrotet i regionen"],"a":0,"k":"NVE framhevar Bruteigsteinen på Flåte som eit av Vestlandets mest interessante helleristningsfelt.","t":"fact","e":"em_his_kulturminner_bevaring","s":["nve_etnevassdraget"],"c":["kulturminneverdi","Etnevassdraget"],"g":["nve_vurdering"],"m":"met_kontekstualisering","b":"NVE omtalar Bruteigsteinen som eit av Vestlandets mest interessante helleristningsfelt."},{"q":"Kvar ligg Bruteigsteinen i det større landskapet?","o":["På Flåte i Stordalen ved Stordalsvatnet","På Stødleterrassen ved Etneelva","På Borgåsen over Etnepollen"],"a":0,"k":"Bruteigsteinen ligg på Flåte i Stordalen, nær Stordalsvatnet og fleire andre helleristningsfelt.","t":"fact","e":"em_his_spor_materialitet","s":["nve_etnevassdraget","kringom_bergkunst_etne"],"c":["Stordalen","Stordalsvatnet"],"g":["flate_stordalen"],"m":"met_kontekstualisering","b":"Bruteigsteinen ligg på Flåte i Stordalen ved Stordalsvatnet."},{"q":"Kvifor er motivmangfaldet historisk viktig?","o":["Det viser at bronsealderens bergkunst kunne bruke mange biletformer i det same feltet","Det viser at alle motiva har éi kjend og felles tyding","Det viser at figurane vart laga av éin dokumentert kunstnar"],"a":0,"k":"Den store variasjonen viser eit rikt biletuttrykk med skip, menneske, dyr, reiskapar og geometriske teikn. Mangfaldet dokumenterer uttrykksformer, men gir ikkje ei sikker fasit på tydinga.","t":"analysis","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["biletuttrykk","motivmangfald"],"g":["variert_biletsprak"],"m":"met_kontekstualisering","b":"Motivmangfaldet viser at bronsealderens bergkunst i Etne hadde eit rikt og samansett biletuttrykk."},{"q":"Kva lærer samanlikninga med Helgaberget?","o":["At to felt i same region og periode kan ha svært ulik motivsamansetjing","At Helgaberget og Bruteigsteinen er delar av den same steinblokka","At alle Etne-felta inneheld nøyaktig dei same motiva"],"a":0,"k":"Helgaberget blir dominert av skålgroper og ringfigurar og manglar skip, menneske og dyr. Bruteigsteinen har eit langt breiare motivutval. Samanlikninga viser lokal variasjon innanfor bergkunstlandskapet.","t":"analysis","e":"em_his_kilder_taushet_blindsoner","s":["kringom_bergkunst_etne"],"c":["lokal variasjon","motivsamansetjing"],"g":["kontrast_helgaberget"],"m":"met_sammenligning","b":"Bruteigsteinen og Helgaberget har ulike motivutval sjølv om begge høyrer til Etne si bronsealderbergkunst."}]},{"id":"historie_bruteigsteinen_etne_set_3","level":3,"order":3,"xp":90,"title":"Biletspråk og tolking","questions":[{"q":"Kva betyr motivrepertoar på Bruteigsteinen?","o":["Samlinga av ulike motivtypar som finst på feltet","Rekkjefølgja figurane vart oppdaga i","Metoden som blir brukt til å måle djupna i ristningane"],"a":0,"k":"Motivrepertoar er det samla utvalet av motivtypar. På Bruteigsteinen omfattar det både figurative motiv, reiskapar og geometriske teikn.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["motivrepertoar","motivtype"],"g":["omgrep_motivrepertoar"],"m":"met_sporlesning","b":"Bruteigsteinen har eit uvanleg breitt motivrepertoar."},{"q":"Kva betyr det at skipsfigurane er stiliserte?","o":["Formene er forenkla framstillingar, ikkje naturtru avbildingar","Figurane er måla opp med moderne farge","Skipa er hogde i full storleik etter verkelege båtar"],"a":0,"k":"Stilisering betyr at trekk blir forenkla og ordna som teikn. Skipsfigurane kan likne fartøy utan å vere detaljerte, naturtru avbildingar.","t":"concept","e":"em_his_spor_materialitet","s":["kringom_bergkunst_etne"],"c":["stilisering","skipsfigur"],"g":["omgrep_stilisering"],"m":"met_sporlesning","b":"Skipsfigurane er sterkt stiliserte framstillingar."},{"q":"Kva er arkeologisk kontekst for Bruteigsteinen?","o":["Sambandet mellom figurane, steinblokka og det kulturminnerike landskapet rundt Stordalsvatnet","Berre namnet forskarar har gitt kvar enkelt figur","Ei moderne forklaring som erstattar dei fysiske spora"],"a":0,"k":"Arkeologisk kontekst er samanhengen eit funn står i. For Bruteigsteinen omfattar dette steinblokka, plasseringa i Stordalen og den tette konsentrasjonen av bronsealderristningar rundt Stordalsvatnet.","t":"concept","e":"em_his_kildekritikk_arkiv_spor","s":["nve_etnevassdraget","kringom_bergkunst_etne"],"c":["arkeologisk kontekst","kulturminnelandskap"],"g":["omgrep_kontekst"],"m":"met_kontekstualisering","b":"Bruteigsteinen inngår i eit større bergkunst- og kulturminnelandskap rundt Stordalsvatnet."},{"q":"Kvifor er konsentrasjonen av helleristningsfelt rundt Stordalsvatnet viktig?","o":["Fleire lokalitetar viser at bergkunsten var ein gjenteken praksis i landskapet","Konsentrasjonen beviser at alle felta vart laga same dag","Felta viser at området ikkje vart brukt til jordbruk"],"a":0,"k":"Mange felt rundt vatnet viser at biletskaping på berg var ein tilbakevendande del av bronsealderlandskapet. Det styrkjer landskapskonteksten utan å bevise at alle felta hadde same funksjon.","t":"analysis","e":"em_his_spor_materialitet","s":["nve_etnevassdraget","kringom_bergkunst_etne"],"c":["bergkunstlandskap","gjenteken praksis"],"g":["stordalsvatnet_felt"],"m":"met_kontekstualisering","b":"Den tette konsentrasjonen av felt viser gjenteken bergkunstpraksis i Stordalen."},{"q":"Kva er kjeldekritisk forsvarleg å seie om tydinga av tremotivet og dei andre symbola?","o":["Motiva kan tolkast, men ei sikker opphavleg tyding er ikkje kjend","Tremotivet beviser at feltet var ein bestemt heilag lund","Alle figurane er eit kart over gardane i Stordalen"],"a":0,"k":"Motiva kan ha inngått i ritual, forteljingar eller sosial symbolbruk, men ristningane forklarer ikkje sjølve tydinga. Registrerte former må skiljast frå moderne tolkingar.","t":"analysis","e":"em_his_kildekritikk_arkiv_spor","s":["kringom_bergkunst_etne"],"c":["symboltolking","kjeldekritikk"],"g":["usikker_tyding"],"m":"met_kildekritikk","b":"Den opphavlege tydinga av Bruteigsteinens motiv er ikkje sikkert kjend."}]}];
const SOURCES = {
  kringom_bergkunst_etne: 'https://www.kringom.no/nb/sunnhordland/etne/helgaberget',
  nve_etnevassdraget: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/041-1-etnevassdraget/',
  digitaltmuseum_bruteigsteinen: 'https://digitaltmuseum.no/0210112413874/bruteigsteinen-pa-flote-oversikt-over-den-sorlige-del-av-helleristningsfeltet'
};
const GUIDANCE = [
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/supersetQUIZMAL_historie.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json'
];

function expandQuestion(row, setNo, pos, globalNo) {
  return {
    id: `bruteigsteinen_etne_quiz_${globalNo}`,
    quiz_id: `historie_bruteigsteinen_etne_set_${setNo}_q${pos}`,
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
      'data/places/historie/vestland/etne/bruteigsteinen_etne.json',
      'data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md',
      'data/fag/historie/supersetQUIZMAL_historie.json'
    ],
    sources: SOURCES,
    profile_snapshot: {
      place_type: 'helleristningsfelt',
      subtype: 'variert_bronsealderbergkunst_pa_stor_steinblokk',
      signature_features: [
        'det mest varierte kjende biletfeltet i Etne',
        'skip, menneske, dyr, reiskapar og geometriske motiv',
        'eit sjeldsynt tremotiv',
        'plassering på Flåte ved Stordalsvatnet',
        'tydeleg kontrast til motivutvalet på Helgaberget'
      ],
      primary_angles: ['bronsealder', 'motivrepertoar', 'bergkunstlandskap', 'symboltolking'],
      avoid_angles: ['gi tremotivet ei sikker tyding', 'blande feltet med Helgaberget', 'påstå at alle felta hadde same funksjon']
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
else throw new Error('Usage: node .tmp/bootstrap-bruteigsteinen.mjs assemble|validate');
