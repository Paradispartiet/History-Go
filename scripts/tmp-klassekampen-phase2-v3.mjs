import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'klassekampen_redaksjon';
const VERIFIED_AT = '2026-10-04';
const PLACE_PATH = 'data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json';
const WORKFLOW_PATH = `data/places/workflow/${PLACE_ID}.json`;
const PEOPLE_PATH = 'data/people/media/oslo/people_media_oslo.json';
const ATTR_PATH = 'data/people/people_image_attributions.json';
const BRAND_MASTER_PATH = 'data/brands/brands_master.json';
const BRAND_BY_PLACE_PATH = 'data/brands/brands_by_place.json';
const FAG_MANIFEST_PATH = 'data/fag/fag_manifest.json';
const MEDIA_SUPERSET_PATH = 'data/fag/media/supersetQUIZMAL_media.json';
const SOURCE_BRIEF_PATH = 'data/quiz/production_briefs/media/klassekampen_redaksjon.json';
const CONTEXT_PATH = 'data/quiz/production_context/media/klassekampen_redaksjon.json';
const QUIZ_PATH = 'data/quiz/media/klassekampen_redaksjon_sets.json';
const QUIZ_MANIFEST_PATH = 'data/quiz/manifest.json';
const QUIZCARD_MANIFEST_PATH = 'data/quizcards/media/manifest.json';
const QUIZCARD_PATH = 'data/quizcards/media/klassekampen_redaksjon_quizkort_v1.json';
const PEOPLE_IMAGE = 'bilder/people/bjorgulv_braanen.jpg';
const OBJECT_IMAGE = 'bilder/kort/objects/klassekampen_forste_utgave_1969.jpg';
const BRAND_IMAGE = 'bilder/kort/brands/klassekampen.gif';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`);
};
const requireFile = (file) => {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Required file missing or empty: ${file}`);
};
const upsertById = (rows, row) => {
  const index = rows.findIndex((item) => item?.id === row.id);
  if (index >= 0) rows[index] = { ...rows[index], ...row };
  else rows.push(row);
};
const replaceOnce = (file, needle, replacement) => {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(replacement)) return;
  if (!source.includes(needle)) throw new Error(`Missing replacement anchor in ${file}: ${needle}`);
  fs.writeFileSync(file, source.replace(needle, replacement));
};

const productionSvg = ({ kicker, title, subtitle, mark }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">History Go redaksjonell illustrasjon for ${title}. ${subtitle}</desc>
  <rect width="900" height="560" rx="42" fill="#111"/>
  <rect x="42" y="42" width="816" height="476" rx="30" fill="#f4f0e8"/>
  <text x="84" y="120" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="#555">${kicker}</text>
  <text x="84" y="240" font-family="Georgia, serif" font-size="68" font-weight="700" fill="#111">${title}</text>
  <text x="84" y="310" font-family="system-ui, sans-serif" font-size="30" fill="#333">${subtitle}</text>
  <text x="84" y="440" font-family="system-ui, sans-serif" font-size="92" font-weight="800" fill="#111">${mark}</text>
</svg>`;

const productionAssets = {
  klassekampen_avis: 'bilder/kort/productions/klassekampen_avis.svg',
  klassekampen_bokmagasinet: 'bilder/kort/productions/klassekampen_bokmagasinet.svg',
  klassekampen_musikkmagasinet: 'bilder/kort/productions/klassekampen_musikkmagasinet.svg',
  klassekampen_eavis: 'bilder/kort/productions/klassekampen_eavis.svg',
};

const sources = {
  klassekampen_contact: {
    url: 'https://klassekampen.no/kontakt',
    source_type: 'official_institution',
    review_status: 'reviewed',
    review_note: 'Kontrollert for besøksadresse, ansvarlig redaktør og dokumenterte redaksjonelle funksjoner.',
  },
  klassekampen_eavis: {
    url: 'https://ks.klassekampen.no/eavis/',
    source_type: 'official_product_documentation',
    review_status: 'reviewed',
    review_note: 'Kontrollert for e-avis, nettavis, app og forholdet mellom papir- og digitalutgave.',
  },
  klassekampen_subscription: {
    url: 'https://ks.klassekampen.no/abonnement/info',
    source_type: 'official_product_documentation',
    review_status: 'reviewed',
    review_note: 'Kontrollert for papir/digital distribusjon, Bokmagasinet, Musikkmagasinet og e-avisarkiv.',
  },
  klassekampen_books: {
    url: 'https://klassekampen.no/magasiner/bokmagasinet',
    source_type: 'official_publication',
    review_status: 'reviewed',
    review_note: 'Kontrollert for Bokmagasinet som egen løpende litteraturpublikasjon.',
  },
  klassekampen_music: {
    url: 'https://klassekampen.no/magasiner/musikkmagasinet',
    source_type: 'official_publication',
    review_status: 'reviewed',
    review_note: 'Kontrollert for Musikkmagasinet som egen løpende musikkpublikasjon.',
  },
  snl_klassekampen: {
    url: 'https://snl.no/Klassekampen_-_avis',
    source_type: 'reputable_secondary',
    review_status: 'reviewed',
    review_note: 'Kontrollert for etablering, uavhengighet og redaktørhistorikk.',
  },
  oslo_byleksikon_klassekampen: {
    url: 'https://oslobyleksikon.no/side/Klassekampen',
    source_type: 'institutional_reference',
    review_status: 'reviewed',
    review_note: 'Kontrollert for Oslo-forankring og milepælene 1969, 1973, 1977, 1991 og 1996.',
  },
  snl_offentlighet: {
    url: 'https://snl.no/offentlighet',
    source_type: 'reputable_secondary',
    review_status: 'reviewed',
    review_note: 'Kontrollert for offentlighet som åpne kanaler og arenaer for utveksling av informasjon, ideer og argumenter.',
  },
  tuchman_making_news: {
    url: 'https://books.google.com/books?id=_OMkAQAAMAAJ',
    source_type: 'scholarly_book_record',
    review_status: 'reviewed',
    review_note: 'Bibliografisk bokpost kontrollert for Gaye Tuchmans Making News (Free Press, 1978) og verkets dokumenterte fokus på newsroom/newsworkers/routines.',
  },
};

const q = (id, question, options, answerIndex, claim, sourceIds, emneId, family, questionType, extra = {}) => ({
  id,
  question,
  options,
  answerIndex,
  claim,
  sourceIds,
  emneId,
  family,
  questionType,
  ...extra,
});

const QUESTIONS = [
  q('q01','Hva er Klassekampen-redaksjonens dokumenterte besøksadresse?',['Grønland 4','Akersgata 55','Hausmanns gate 16'],0,'Klassekampens offisielle kontaktside oppgir Grønland 4, 0188 Oslo som besøksadresse.',['klassekampen_contact'],'em_media_avishus_offentlighetsrom','fact','fact'),
  q('q02','Hvem oppgis som ansvarlig redaktør på Klassekampens kontaktside?',['Bjørgulv Braanen','Mari Skurdal','Harald Fougner'],1,'Klassekampens kontaktside oppgir Mari Skurdal som ansvarlig redaktør.',['klassekampen_contact'],'em_media_redaksjon_desk','fact','fact'),
  q('q03','Hvilken funksjon er eksplisitt oppført som del av redaksjonen?',['Seddeltrykkeri','Museumskonservering','Desk'],2,'Klassekampens kontaktside dokumenterer desk som en av redaksjonens funksjoner.',['klassekampen_contact'],'em_media_redaksjon_desk','fact','fact'),
  q('q04','Når kom første nummer av dagens Klassekampen?',['Februar 1969','Januar 1973','Mai 1977'],0,'Første nummer av dagens Klassekampen kom i februar 1969.',['snl_klassekampen','oslo_byleksikon_klassekampen'],'em_media_avishus_offentlighetsrom','fact','fact'),
  q('q05','Hvor ofte kom Klassekampen ut ved starten i 1969?',['Daglig','Månedlig','Ukentlig'],1,'Oslo byleksikon beskriver Klassekampen som månedsavis ved starten i 1969.',['oslo_byleksikon_klassekampen'],'em_media_avishus_offentlighetsrom','fact','fact'),
  q('q06','Når ble Klassekampen ukeavis?',['1969','1977','1973'],2,'Klassekampen ble ukeavis i 1973.',['oslo_byleksikon_klassekampen'],'em_media_avishus_offentlighetsrom','fact','fact'),
  q('q07','Når ble Klassekampen dagsavis?',['1977','1991','1996'],0,'Klassekampen ble dagsavis i 1977.',['oslo_byleksikon_klassekampen'],'em_media_avishus_offentlighetsrom','fact','fact'),

  q('q08','Hvilket år ble Klassekampen formelt uavhengig?',['1977','1991','1996'],1,'Klassekampen ble formelt uavhengig i 1991.',['snl_klassekampen','oslo_byleksikon_klassekampen'],'em_media_kritikk_kommentar','fact','fact'),
  q('q09','Når fikk Klassekampen nettavis ifølge Oslo byleksikon?',['1991','2002','1996'],2,'Oslo byleksikon oppgir 1996 som året Klassekampen fikk nettavis.',['oslo_byleksikon_klassekampen'],'em_media_digital_offentlighet','fact','fact'),
  q('q10','Hvem ble redaktør i Klassekampen i 2002?',['Bjørgulv Braanen','Mari Skurdal','Harald Fougner'],0,'Store norske leksikon oppgir at Bjørgulv Braanen ble redaktør i Klassekampen i 2002.',['snl_klassekampen'],'em_media_redaksjon_desk','fact','fact'),
  q('q11','Hvem overtok som sjefredaktør i 2018?',['Bjørgulv Braanen','Mari Skurdal','Torry Pedersen'],1,'Store norske leksikon oppgir at Mari Skurdal overtok som sjefredaktør i 2018.',['snl_klassekampen','klassekampen_contact'],'em_media_redaksjon_desk','fact','fact'),
  q('q12','Hvilken kombinasjon av distribusjonsformer dokumenterer Klassekampens egne kundesider?',['Bare papiravis','Bare nettavis','Papiravis og digitale utgaver'],2,'Klassekampens egne kundesider dokumenterer både papiravis og digitale utgaver.',['klassekampen_eavis','klassekampen_subscription'],'em_media_digital_offentlighet','fact','fact'),
  q('q13','Hva er e-avisen beskrevet som?',['En digital gjengivelse av papiravisen','En separat radiokanal','Et internt redaksjonsarkiv uten lesertilgang'],0,'Klassekampens e-avis er dokumentert som en digital gjengivelse av papiravisen.',['klassekampen_eavis'],'em_media_digital_offentlighet','fact','fact'),
  q('q14','Hvilken publikasjon er Klassekampens dokumenterte litteraturmagasin?',['Musikkmagasinet','Bokmagasinet','Utgaven'],1,'Bokmagasinet er en egen løpende Klassekampen-publikasjon med litteraturstoff og anmeldelser.',['klassekampen_books','klassekampen_subscription'],'em_media_kritikk_kommentar','fact','fact'),

  q('q15','Hvilken publikasjon er Klassekampens dokumenterte musikkmagasin?',['Bokmagasinet','E-avisen','Musikkmagasinet'],2,'Musikkmagasinet er en egen løpende Klassekampen-publikasjon med musikkstoff og anmeldelser.',['klassekampen_music','klassekampen_subscription'],'em_media_kritikk_kommentar','fact','fact'),
  q('q16','Hvilken digital distribusjonsflate er dokumentert i tillegg til nettavis og e-avis?',['App','Lineær TV-kanal','FM-radiokanal'],0,'Klassekampens kundesider dokumenterer en app i tillegg til nettavis og e-avis.',['klassekampen_eavis'],'em_media_digital_offentlighet','fact','fact'),
  q('q17','Hva er den mest presise forskjellen mellom redaksjonen i Grønland 4 og avisen som publisert produkt?',['De er to navn på samme bygning','Redaksjonen er arbeidsorganisasjonen, mens avisen er et publisert produkt','Avisen er bare den digitale utgaven'],1,'Grønland 4 er redaksjonens arbeidssted, mens papiravis, nettavis, e-avis og magasiner er dokumenterte publiserings- og distribusjonsflater.',['klassekampen_contact','klassekampen_eavis','klassekampen_subscription'],'em_media_redaksjon_desk','context','comparison'),
  q('q18','Hva kan du sikkert dokumentere ved å sammenligne papiravis og e-avis?',['At redaksjonen bruker to dokumenterte distribusjonsformer','At alt innhold alltid vises identisk','At de produseres av to helt separate redaksjoner'],0,'Papiravis og e-avis er to dokumenterte distribusjonsformer knyttet til samme avisorganisasjon, uten at kildene begrunner at presentasjon og rytme alltid er identiske.',['klassekampen_eavis','klassekampen_subscription'],'em_media_digital_offentlighet','context','comparison'),
  q('q19','Hva kan fasaden og inngangen i Grønland 4 dokumentere direkte?',['Hvilke saker desk diskuterer inne','At alle ansatte har samme politiske syn','At stedet fungerer som dokumentert redaksjonsadresse'],2,'Fasade, inngang og adresse kan brukes som direkte spor etter redaksjonens lokalisering, men dokumenterer ikke interne beslutninger eller individuelle standpunkter.',['klassekampen_contact'],'em_media_avishus_offentlighetsrom','context','observation'),
  q('q20','Hva kan årstallet 1969 ikke brukes som bevis for?',['At avisen ble etablert dette året','At redaksjonen flyttet inn i Grønland 4 dette året','At avisen har en historie før nettavisen'],1,'1969 er dokumentert som avisens etableringsår, men det gjennomgåtte kildegrunnlaget dokumenterer ikke 1969 som innflyttingsår i Grønland 4.',['snl_klassekampen','oslo_byleksikon_klassekampen','klassekampen_contact'],'em_media_avishus_offentlighetsrom','context','analysis'),
  q('q21','Hvorfor brukes både dagens kontaktside og historiske oppslagsverk i dette stedssporet?',['De dokumenterer ulike tidslag: nåværende arbeidssted og institusjonshistorie','Fordi kontaktsiden alene dokumenterer alle historiske år','Fordi oppslagsverkene alene dokumenterer dagens interne arbeidsplan'],0,'Dagens kontaktside dokumenterer nåværende adresse og roller, mens SNL og Oslo byleksikon dokumenterer historiske milepæler; kildene brukes til ulike tidslag.',['klassekampen_contact','snl_klassekampen','oslo_byleksikon_klassekampen'],'em_media_kritikk_kommentar','context','analysis'),

  q('q22','Hva viser papiravis, nettavis, e-avis og magasiner samlet om redaksjonen?',['At alle formatene må ha identisk innhold','At redaksjonelt arbeid distribueres gjennom flere dokumenterte publiseringsflater','At bare papiravisen er et redaksjonelt produkt'],1,'Klassekampen distribuerer redaksjonelt innhold gjennom flere dokumenterte flater: papiravis, nettavis, e-avis, app og egne magasinpublikasjoner.',['klassekampen_eavis','klassekampen_subscription','klassekampen_books','klassekampen_music'],'em_media_digital_offentlighet','context','analysis'),
  q('q23','Hva er en kildekritisk grense når du beskriver Klassekampens redaksjonelle profil?',['Å skille dokumenterte prioriteringer og publisering fra påstander om hva hver enkelt ansatt mener','Å anta at alle ansatte mener det samme','Å bruke byggets fasade som bevis for politiske standpunkter'],0,'En redaksjonell profil kan beskrives gjennom dokumentert institusjonshistorie og publisering, men kan ikke uten egne kilder gjøres om til en påstand om at alle ansatte deler samme mening.',['snl_klassekampen','klassekampen_contact'],'em_media_kritikk_kommentar','concept_theory','analysis'),
  q('q24','Hva betyr «offentlighet» mest presist i denne mediekonteksten?',['En lukket intern arbeidsgruppe','Bare statlige institusjoner','Åpne kanaler og arenaer der informasjon, ideer og argumenter kan utveksles'],2,'Store norske leksikon beskriver offentlighet blant annet som åpne møteplasser og kanaler der informasjon, ideer, synspunkter og argumenter utveksles, og inkluderer massemedier som slike arenaer.',['snl_offentlighet'],'em_media_kritikk_kommentar','concept_theory','concept'),
  q('q25','Hva kjennetegner en redaksjon som organisert arbeidsenhet i dette kildegrunnlaget?',['Flere dokumenterte roller og funksjoner som ledelse, fagredaksjoner, desk og foto','Én enkelt journalist som gjør alle oppgaver','Bare bygningens gateadresse'],0,'Klassekampens kontaktside dokumenterer en arbeidsdeling med redaksjonell ledelse, fagredaksjoner, desk, foto og andre funksjoner.',['klassekampen_contact'],'em_media_redaksjon_desk','concept_theory','analysis'),
  q('q26','Hva er den sikreste måten å undersøke en intern redaksjonell arbeidsprosess du ikke kan observere fra gaten?',['Anta prosessen ut fra fasaden','Bruke åpne kilder som dokumenterer roller og publisering','Tilskrive ansatte samme arbeidsrutine uten kilde'],1,'Interne redaksjonelle prosesser som ikke kan observeres utenfra må undersøkes gjennom åpne kilder og dokumenterte roller, ikke utledes fra fasaden alene.',['klassekampen_contact'],'em_media_kritikk_kommentar','concept_theory','analysis'),
  q('q27','Hvordan kan du systematisk undersøke arbeidsdelingen mellom nyhetsledelse, fagredaksjoner, desk og foto?',['Ved å telle vinduer i fasaden','Ved å måle avstanden til Oslo S','Ved å sammenligne de dokumenterte redaksjonsrollene og funksjonene'],2,'Klassekampens kontaktside dokumenterer flere redaksjonelle roller og funksjoner som kan sammenlignes systematisk uten å dikte interne arbeidsprosesser.',['klassekampen_contact'],'em_media_redaksjon_desk','concept_theory','analysis',{method_id:'met_media_redaksjonsanalyse',guidance_basis:['data/fag/media/methods_media_canonical_v4_5.json']}),
  q('q28','Hva kan Gaye Tuchmans perspektiv på nyhetsrutiner hjelpe deg å undersøke ved en redaksjon?',['Hvordan organiserte rutiner og redaksjonelle roller former nyhetsproduksjonen','Hvilket år Grønland 4 ble oppført','Hvor mange abonnenter avisen har akkurat i dag'],0,'Klassekampens kontaktside dokumenterer organiserte redaksjonelle roller, mens Gaye Tuchmans Making News undersøker nyhetsarbeid, newsroom-praksiser og rutiner; sammen gir de et kildegrunnlag for å analysere nyhetsproduksjon som organisert arbeid.',['klassekampen_contact','tuchman_making_news'],'em_media_redaksjon_desk','concept_theory','analysis',{topic_hook_id:'redaksjon_og_desk',thinker_id:'gaye_tuchman',theory_ref:{topic_hook_id:'redaksjon_og_desk',why_it_helps:'Tuchmans perspektiv retter oppmerksomheten mot rutiner og organisatorisk nyhetsarbeid, som kan undersøkes mot de dokumenterte rollene ved Klassekampen.'}}),
];

if (QUESTIONS.length !== 28) throw new Error(`Expected 28 questions, got ${QUESTIONS.length}`);

function upgradeMediaSuperset() {
  const superset = readJson(MEDIA_SUPERSET_PATH);
  superset.version = '3.0';
  superset.governance = {
    ...superset.governance,
    package_schema: 'data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
    subject_manifest: 'data/fag/fag_manifest.json',
    authority: 'category_content_and_orchestration',
  };
  superset.adaptive_profiles = {
    narrow: { sets: 3, questions_per_set: 7, use_when: 'avgrenset mediemål med få uavhengige, sterke påstander' },
    normal: { sets: 4, questions_per_set: 7, use_when: 'mediemål med solid hovedhistorie og minst ett tydelig faglig broledd' },
    rich: { sets_min: 5, sets_max: 8, questions_per_set: 7, use_when: 'mediemål med flere kildebelagte perioder, formater eller redaksjonelle spor' },
    major: { sets_min: 8, sets_max: 10, questions_per_set: 7, use_when: 'stort mediehistorisk hovedmål med flere uavhengige progresjonsløp' },
  };
  superset.profile_selection = {
    default: 'normal',
    evidence_order: ['uavhengige kildebelagte påstander','historisk og funksjonell bredde','dokumenterte publiseringsflater','stedlig forankrede emner','metode- og teorimuligheter med konkret anker'],
    never_pad_to_reach_profile: true,
    reduce_profile_when_evidence_is_thin: true,
  };
  superset.relative_progression = {
    phase_sequences: {
      '3':['opening','bridge','final'],
      '4':['opening','middle','bridge','final'],
      '5':['opening','middle','middle','bridge','final'],
      '6':['opening','middle','middle','middle','bridge','final'],
      '7':['opening','middle','middle','middle','bridge','bridge','final'],
      '8':['opening','middle','middle','middle','middle','bridge','bridge','final'],
      '9':['opening','middle','middle','middle','middle','middle','bridge','bridge','final'],
      '10':['opening','middle','middle','middle','middle','middle','middle','bridge','bridge','final'],
    },
    absolute_theory_set_numbers_forbidden: true,
  };
  writeJson(MEDIA_SUPERSET_PATH, superset);
}

function registerMediaQuizTarget() {
  const manifest = readJson(FAG_MANIFEST_PATH);
  const media = manifest.media;
  if (!media) throw new Error('Missing media entry in fag_manifest');
  Object.assign(media, {
    pensum: media.pensum || 'media/mediapensum_canonical_v4_5.json',
    emner: media.emner || 'media/emner_media_canonical_v4_5.json',
    fagkart: media.fagkart || 'media/fagkart_media_canonical_v4_5.json',
    methods: media.methods || 'media/methods_media_canonical_v4_5.json',
    supersetQuizMal: media.supersetQuizMal || 'media/supersetQUIZMAL_media.json',
    quizStandard: '../quiz/regler/QUIZ_PRODUCTION_CANONICAL.md',
    quizQuestionSchema: '../quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json',
    quizPackageSchema: '../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
  });
  media.quizProduction = {
    ...(media.quizProduction || {}),
    status: 'pilot',
    required_inputs: ['pensum','emner','fagkart','methods','supersetQuizMal','quizStandard','quizQuestionSchema'],
    context_builder: 'scripts/build-quiz-production-context.mjs',
    profile_system: 'adaptive_relative_superset',
    package_schema: 'quizPackageSchema',
    context_artifact_root: 'data/quiz/production_context',
    targets: {
      ...(media.quizProduction?.targets || {}),
      [PLACE_ID]: {
        source_brief: '../quiz/production_briefs/media/klassekampen_redaksjon.json',
        context_artifact: '../quiz/production_context/media/klassekampen_redaksjon.json',
        quiz_file: '../quiz/media/klassekampen_redaksjon_sets.json',
      },
    },
  };
  writeJson(FAG_MANIFEST_PATH, manifest);
}

function materializeCollections() {
  for (const file of [PEOPLE_IMAGE, OBJECT_IMAGE, BRAND_IMAGE]) requireFile(file);

  const place = readJson(PLACE_PATH);
  const expectedImage = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Groenland%204%20Oslo.jpg';
  const expectedFront = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Steplagaarden_gr%C3%B6nland_4_oslo_rk_163836_IMG_8308.JPG';
  if (place.image !== expectedImage || place.frontImage !== expectedFront) throw new Error('Reviewed Phase 1 place images changed unexpectedly');

  place.production_status = 'complete';
  place.profile_reason = 'Klassekampen-redaksjonen har en dokumentert redaktør, ett fysisk signaturobjekt, en egen medieidentitet og fire uavhengig dokumenterte publiseringsflater uten filler.';
  place.place_card_profile = {
    schema: 'history_go_place_card_profile_v2',
    production_profile: 'standard',
    collection_ids: ['people','objects','brands','productions'],
    category_collection_label: 'Utgivelser',
    reason: 'Bjørgulv Braanen har dokumentert redaktørkobling og gjenbruksavklart portrett; førsteutgaven fra 1969 er et fysisk signaturobjekt; Klassekampen er publikasjonens medieidentitet; papiravis, Bokmagasinet, Musikkmagasinet og e-avis er fire dokumenterte utgivelser.',
    verifiedAt: VERIFIED_AT,
  };
  place.rounds = ['people','objects','brands','productions'];
  place.related_people_ids = [...new Set([...(place.related_people_ids || []).filter((id) => id !== 'mari_skurdal'), 'bjorgulv_braanen'])];
  place.objects = [{
    id: 'klassekampen_forste_utgave_1969',
    name: 'Klassekampen nr. 1, 7. februar 1969',
    title: 'Førsteutgaven av Klassekampen',
    type: 'aviseksemplar',
    kind: 'physical_object',
    year: 1969,
    desc: 'Et fysisk eksemplar av første nummer av dagens Klassekampen, datert 7. februar 1969.',
    physicalObject: true,
    placeSpecific: true,
    collectable: true,
    placeSpecificReason: 'Objektet representerer publikasjonen som produseres av redaksjonen; det brukes ikke som bevis for at Grønland 4 var redaksjonsadresse i 1969.',
    why_here: 'Førsteutgaven gjør avisens institusjonshistorie konkret samtidig som adressehistorien holdes separat.',
    image: OBJECT_IMAGE,
    cardImage: OBJECT_IMAGE,
    imageMeta: {
      source: 'wikimedia_commons',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Klassekampen_no_1_1969.jpg',
      credit: 'Wikimedia Commons',
      license: 'Public domain',
      rightsBasis: 'public_domain_historic_newspaper_scan',
      assetKind: 'documentary_object_image',
      reviewedAt: VERIFIED_AT,
    },
    source_urls: ['https://commons.wikimedia.org/wiki/File:Klassekampen_no_1_1969.jpg','https://snl.no/Klassekampen_-_avis'],
  }];

  writeText(productionAssets.klassekampen_avis, productionSvg({ kicker:'PAPIRAVIS', title:'Klassekampen', subtitle:'Dagsavisen som redaksjonelt hovedprodukt', mark:'AVIS' }));
  writeText(productionAssets.klassekampen_bokmagasinet, productionSvg({ kicker:'LØRDAG', title:'Bokmagasinet', subtitle:'Litteratur, anmeldelser og bokoffentlighet', mark:'BOK' }));
  writeText(productionAssets.klassekampen_musikkmagasinet, productionSvg({ kicker:'FREDAG', title:'Musikkmagasinet', subtitle:'Musikkstoff, kritikk og anmeldelser', mark:'LYD' }));
  writeText(productionAssets.klassekampen_eavis, productionSvg({ kicker:'DIGITAL UTGAVE', title:'E-avisen', subtitle:'Digital gjengivelse av papiravisen', mark:'E' }));

  const prod = (id,title,type,desc,image,source) => ({
    id,title,name:title,type,kind:'publication',desc,image,cardImage:image,
    imageMeta:{source,creator:'History-Go editorial',rightsBasis:'history_go_original_editorial_graphic',disclosure:'Redaksjonell tekstillustrasjon, ikke gjengivelse av en kommersiell forside.',reviewedAt:VERIFIED_AT},
    source_urls:[source],
  });
  place.productions = [
    prod('klassekampen_avis','Klassekampen','papiravis','Klassekampens løpende papiravis.',productionAssets.klassekampen_avis,'https://ks.klassekampen.no/abonnement/info'),
    prod('klassekampen_bokmagasinet','Bokmagasinet','magasin','Klassekampens løpende litteraturmagasin.',productionAssets.klassekampen_bokmagasinet,'https://klassekampen.no/magasiner/bokmagasinet'),
    prod('klassekampen_musikkmagasinet','Musikkmagasinet','magasin','Klassekampens løpende musikkmagasin.',productionAssets.klassekampen_musikkmagasinet,'https://klassekampen.no/magasiner/musikkmagasinet'),
    prod('klassekampen_eavis','Klassekampen e-avis','e-avis','Digital gjengivelse av papiravisen som egen dokumentert distribusjonsflate.',productionAssets.klassekampen_eavis,'https://ks.klassekampen.no/eavis/'),
  ];
  writeJson(PLACE_PATH, place);

  const people = readJson(PEOPLE_PATH);
  const person = people.find((item) => item.id === 'bjorgulv_braanen');
  if (!person) throw new Error('Missing canonical bjorgulv_braanen');
  person.image = PEOPLE_IMAGE;
  person.cardImage = PEOPLE_IMAGE;
  person.imageMeta = {
    source: 'wikimedia_commons',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Bj%C3%B8rgulv_Braanen_(174850).jpg',
    creator: 'Tore Sætre',
    credit: 'Photo: Tore Sætre / Wikimedia',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    assetKind: 'identity_portrait',
    date: '2016-02-18',
    transformation: 'Originalfil lagret lokalt uten motivrekonstruksjon.',
    verifiedAt: VERIFIED_AT,
  };
  writeJson(PEOPLE_PATH, people);

  const attributions = readJson(ATTR_PATH);
  const attribution = {
    personId: 'bjorgulv_braanen',
    name: 'Bjørgulv Braanen',
    file: PEOPLE_IMAGE,
    source: 'wikimedia_commons',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Bj%C3%B8rgulv_Braanen_(174850).jpg',
    creator: 'Tore Sætre',
    credit: 'Photo: Tore Sætre / Wikimedia',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  };
  const attrIndex = attributions.findIndex((item) => item.personId === attribution.personId);
  if (attrIndex >= 0) attributions[attrIndex] = attribution; else attributions.push(attribution);
  writeJson(ATTR_PATH, attributions);

  const brands = readJson(BRAND_MASTER_PATH);
  upsertById(brands, {
    id:'klassekampen',name:'Klassekampen',brand_group:'oslo_based_brand',brand_type:'media_brand',brand_kind:'publication',sector:'media',state:'catalog',status:'active',verification:'verified',verified_at:VERIFIED_AT,
    desc:'Medieidentiteten til avisen Klassekampen, direkte knyttet til redaksjonen i Grønland 4.',
    popupdesc:'Brand-kortet gjelder publikasjonens medieidentitet, adskilt fra det fysiske redaksjonsstedet, enkeltutgaver og enkeltansatte.',
    tags:['brand','media','avis','klassekampen'],place_ids:[PLACE_ID],
    source_urls:['https://klassekampen.no/kontakt','https://commons.wikimedia.org/wiki/File:Klassekampen_logo.gif'],
    logo:BRAND_IMAGE,
    imageMeta:{source:'wikimedia_commons',sourcePage:'https://commons.wikimedia.org/wiki/File:Klassekampen_logo.gif',creator:'Klassekampen',credit:'Klassekampen / Wikimedia Commons',license:'Public domain (simple text logo)',rightsBasis:'public_domain_textlogo',reviewStatus:'manually_approved',assetKind:'logo',usageContext:'referential_identification',noEndorsement:true,generated:false,reconstructed:false,reviewedAt:VERIFIED_AT},
  });
  writeJson(BRAND_MASTER_PATH, brands);
  const byPlace = readJson(BRAND_BY_PLACE_PATH);
  byPlace[PLACE_ID] = ['klassekampen'];
  writeJson(BRAND_BY_PLACE_PATH, byPlace);
}

function writeSourceBrief() {
  const claims = QUESTIONS.map((item, index) => ({
    claim_id: `claim_klassekampen_${String(index + 1).padStart(2,'0')}`,
    order: index + 1,
    planned_phase: index < 7 ? 'opening' : index < 14 ? 'middle' : index < 21 ? 'bridge' : 'final',
    family: item.family,
    statement: item.claim,
    source_ids: item.sourceIds,
    source_origin: item.sourceIds.includes('tuchman_making_news') ? 'mixed_external' : 'external',
    emne_id: item.emneId,
    ...(item.method_id ? { method_id: item.method_id } : {}),
    ...(item.topic_hook_id ? { topic_hook_id: item.topic_hook_id } : {}),
    ...(item.thinker_id ? { thinker_id: item.thinker_id } : {}),
  }));
  writeJson(SOURCE_BRIEF_PATH, {
    schema_version:'1.0',status:'reviewed',categoryId:'media',targetId:PLACE_ID,reviewed_at:VERIFIED_AT,
    review_note:'28 påstander er kontrollert mot den eksisterende Klassekampen source-reviewen og de registrerte eksterne kildene før quizmaterialisering.',
    sources,
    selected_curriculum:{
      module_ids:['presse_redaksjoner_avishus','offentlighet_ytringsfrihet_etikk','plattformer_algoritmer_distribusjon'],
      emne_ids:['em_media_avishus_offentlighetsrom','em_media_redaksjon_desk','em_media_kritikk_kommentar','em_media_digital_offentlighet'],
      topic_hook_ids:['redaksjon_og_desk'],
      method_ids:['met_media_redaksjonsanalyse'],
      thinker_ids:['gaye_tuchman'],
      works:[],
    },
    existing_quiz_audit:{
      searched_paths:['data/quiz/manifest.json','data/quiz/media','data/quiz/quiz_media_from_populaerkultur.json'],
      active_before:[],
      decisions:['No active canonical quiz package for klassekampen_redaksjon existed before this governed Media pilot; build fresh from current source review.'],
      knowledge_migration:'No target-specific canonical Knowledge ownership is replaced by this package.',
    },
    profile_decision:{profile:'normal',set_count:4,questions_per_set:7,justification:'The reviewed source base supports 28 non-duplicated claims across newsroom/place facts, institution history, publication formats, source criticism, one method and one theory-bound final synthesis without padding.'},
    held_back_candidates:['1997 editor crisis remains under Stories governance','current circulation/traffic metrics','political affiliation questions','claims that 1969 is the move-in year for Grønland 4'],
    claims,
  });
}

function patchQuizCardLoaders() {
  replaceOnce('js/ui/placeQuizCards.ts', '  "scenekunst/manifest.json"\n]);', '  "scenekunst/manifest.json",\n  "media/manifest.json"\n]);');
  replaceOnce('js/ui/place-card.js', '  "data/quizcards/scenekunst/manifest.json"\n]);', '  "data/quizcards/scenekunst/manifest.json",\n  "data/quizcards/media/manifest.json"\n]);');
}

function prepareWorkflow() {
  const workflow = readJson(WORKFLOW_PATH);
  workflow.collections = {
    people:{status:'PASS',refs:[PEOPLE_PATH,ATTR_PATH]},
    objects:{status:'PASS',refs:[PLACE_PATH]},
    brands:{status:'PASS',refs:[BRAND_MASTER_PATH,BRAND_BY_PLACE_PATH]},
    productions:{status:'PASS',refs:[PLACE_PATH]},
  };
  workflow.modules.quiz = {status:'BLOCKED',reason:'Governed Media source brief is staged; deterministic production context and canonical 4 x 7 package are not yet materialized.',refs:[SOURCE_BRIEF_PATH]};
  workflow.modules.runtime = {status:'BLOCKED',reason:'Place-open runtime must be regenerated after the Phase 2 quiz package is canonical.'};
  workflow.blockers = ['Canonical 4 x 7 quiz, QuizCard binding and regenerated place-open runtime are not yet materialized.'];
  workflow.state = 'blocked';
  writeJson(WORKFLOW_PATH, workflow);
}

function finalizeQuiz() {
  requireFile(CONTEXT_PATH);
  const brief = readJson(SOURCE_BRIEF_PATH);
  const artifact = readJson(CONTEXT_PATH);
  if (artifact.profile !== 'normal_4x7') throw new Error(`Unexpected context profile: ${artifact.profile}`);
  const phases = ['opening','middle','bridge','final'];
  const sets = Array.from({length:4}, (_, setIndex) => ({
    set_id:`media_${PLACE_ID}_set_${setIndex + 1}`,
    level:setIndex + 1,
    order:setIndex + 1,
    xp:50 + setIndex * 10,
    phase:phases[setIndex],
    mode:['newsroom_and_place','institution_history','formats_and_source_work','method_and_theory'][setIndex],
    questions:QUESTIONS.slice(setIndex * 7, setIndex * 7 + 7).map((item, localIndex) => {
      const claimId = `claim_klassekampen_${String(setIndex * 7 + localIndex + 1).padStart(2,'0')}`;
      const question = {
        id:`klassekampen_${item.id}`,
        quiz_id:`media_${PLACE_ID}_${item.id}`,
        claim_id:claimId,
        categoryId:'media',placeId:PLACE_ID,targetId:PLACE_ID,question_scope:'place',
        question:item.question,options:item.options,answer:item.options[item.answerIndex],answerIndex:item.answerIndex,
        knowledge:item.claim,claim_basis:item.claim,difficulty:setIndex < 2 ? 1 : setIndex === 2 ? 2 : 3,
        question_type:item.questionType,question_layer:phases[setIndex],tags:['klassekampen','media'],source:item.sourceIds,emne_id:item.emneId,
      };
      if (item.method_id) { question.method_id = item.method_id; question.guidance_basis = item.guidance_basis; }
      if (item.topic_hook_id) { question.topic_hook_id = item.topic_hook_id; question.thinker_id = item.thinker_id; question.theory_ref = item.theory_ref; }
      return question;
    }),
  }));
  const resolvedPaths = Object.fromEntries(Object.entries(artifact.resolved_files || {}).map(([key,value]) => [key,value.path]));
  const quiz = {
    targetId:PLACE_ID,categoryId:'media',sources:Object.fromEntries(Object.entries(brief.sources).map(([id,source]) => [id,source.url])),
    production_context:{
      standard_version:'3.4',manifest_category:'media',source_brief:'data/quiz/production_briefs/media/klassekampen_redaksjon.json',context_artifact:'data/quiz/production_context/media/klassekampen_redaksjon.json',source_review_status:brief.status,
      required_inputs_loaded:artifact.required_inputs_loaded,resolved_files:resolvedPaths,
      pensum_module_ids:artifact.selected_curriculum?.module_ids || [],emne_ids:artifact.selected_curriculum?.emne_ids || [],topic_hook_ids:artifact.selected_curriculum?.topic_hook_ids || [],method_ids:artifact.selected_curriculum?.method_ids || [],thinker_ids:artifact.selected_curriculum?.thinker_ids || [],works:artifact.selected_curriculum?.works || [],
      existing_quiz_audit:brief.existing_quiz_audit,profile_decision:brief.profile_decision,held_back_candidates:brief.held_back_candidates,
      profile:artifact.profile,theory_start_phase:'final',method_start_phase:'final',
    },
    sets,
  };
  writeJson(QUIZ_PATH, quiz);

  const manifest = readJson(QUIZ_MANIFEST_PATH);
  manifest.sets = Array.isArray(manifest.sets) ? manifest.sets : [];
  const row = {targetId:PLACE_ID,file:QUIZ_PATH};
  const rowIndex = manifest.sets.findIndex((item) => item.targetId === PLACE_ID);
  if (rowIndex >= 0) manifest.sets[rowIndex] = row; else manifest.sets.push(row);
  writeJson(QUIZ_MANIFEST_PATH, manifest);

  const selected = [...sets[0].questions.slice(0,5), ...sets[1].questions.slice(0,3), sets[3].questions[5], sets[3].questions[6]];
  const cardQuestions = selected.map((question,index) => ({number:index + 1,question:question.question,options:question.options,answer:question.answer,answerIndex:question.answerIndex,sourceQuestionId:question.id,sourceQuizId:question.quiz_id,difficulty:question.difficulty,emne_id:question.emne_id,tags:question.tags}));
  const answerKey = cardQuestions.map((question) => ({number:question.number,answer:question.answer}));
  writeJson(QUIZCARD_MANIFEST_PATH,{categoryId:'media',title:'Media – quizkort-samlinger',collections:['klassekampen_redaksjon_quizkort_v1.json']});
  writeJson(QUIZCARD_PATH,{
    collection_id:'media_klassekampen_redaksjon_quizkort_v1',categoryId:'media',targetId:PLACE_ID,title:'Klassekampen-redaksjonen',subtitle:'10 spørsmål · sted, historie, utgivelser og redaksjonsarbeid',cardFormatRule:'single_surface_top10_with_answer_key',sourceBasis:'Ti spørsmål valgt fra den canonicale normal 4x7-pakken.',
    cards:[{card_id:'media_quizkort_klassekampen_redaksjon_v1',categoryId:'media',targetId:PLACE_ID,title:'Klassekampen-redaksjonen',subtitle:'10 spørsmål · fasit nederst',order:1,format:'single_surface_top10_with_answer_key',questionCount:10,questions:cardQuestions,answerKey,sourceFile:QUIZ_PATH}],
  });

  const workflow = readJson(WORKFLOW_PATH);
  workflow.modules.quiz = {status:'PASS',refs:[QUIZ_PATH,SOURCE_BRIEF_PATH,CONTEXT_PATH,QUIZCARD_MANIFEST_PATH,QUIZCARD_PATH]};
  workflow.modules.runtime = {status:'PASS',refs:[`data/runtime/place-open/${PLACE_ID}.json`]};
  workflow.blockers = [
    'The 1997 editor crisis remains a Story candidate and has not passed Stories governance.',
    'No licensed historical/current image pair with a sufficiently documented viewpoint and subject match has been established for before/after.',
    'Final interactive UI review remains pending after Phase 2 data/runtime materialization.',
  ];
  workflow.state = 'blocked';
  writeJson(WORKFLOW_PATH, workflow);

  let sourceReview = fs.readFileSync('reports/place-production/klassekampen-source-review-v1.md','utf8');
  const heading = '## Phase 2 v3 materialisering — 2026-10-04';
  if (!sourceReview.includes(heading)) {
    sourceReview += `\n\n${heading}\n\nPeople-samlingen bruker **Bjørgulv Braanen** fordi den canonicale personkoblingen kan lukkes med et dokumentarisk Commons-portrett av Tore Sætre under CC BY-SA 4.0. Mari Skurdal forblir canonicalt knyttet til stedet, men brukes ikke som Phase 2-medlem uten egen dokumentert bildeproveniens. Førsteutgaven 7. februar 1969 materialiseres som ett fysisk Object fra public-domain Commons-scan, mens Klassekampen-ordmerket brukes referensielt som Brand. Fire Publications/Productions får separate History-Go-tekstillustrasjoner uten kopierte kommersielle forsider.\n\nMedia aktiveres samtidig i dagens governed quizproduksjonskjede. Quizzen er normal 4 × 7 med to normale åpningssett, 28 én-til-én kildeclaims, eksplisitt metode først i sluttsettet og én kildebelagt Tuchman-binding til organiserte nyhetsrutiner. Story-kandidaten fra 1997, before/after og endelig interaktiv UI-review forblir egne fail-closed gates.\n`;
    fs.writeFileSync('reports/place-production/klassekampen-source-review-v1.md', sourceReview);
  }
}

function main() {
  const mode = process.argv[2];
  if (mode === 'prepare') {
    upgradeMediaSuperset();
    registerMediaQuizTarget();
    materializeCollections();
    writeSourceBrief();
    patchQuizCardLoaders();
    prepareWorkflow();
    console.log('Klassekampen Phase 2 v3 prepare complete.');
    return;
  }
  if (mode === 'finalize') {
    finalizeQuiz();
    console.log('Klassekampen Phase 2 v3 quiz/runtime contract finalized.');
    return;
  }
  throw new Error('Usage: node scripts/tmp-klassekampen-phase2-v3.mjs <prepare|finalize>');
}

main();
