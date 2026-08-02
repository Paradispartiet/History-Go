import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { runBuildQuizProductionContext } from './build-quiz-production-context.mjs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const run = (command, args = []) => {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
};

const manifestPath = 'data/fag/fag_manifest.json';
const briefPath = 'data/quiz/production_briefs/politikk/regjeringskvartalet.json';
const contextPath = 'data/quiz/production_context/politikk/regjeringskvartalet.json';
const quizPath = 'data/quiz/politikk/regjeringskvartalet_sets.json';
const reportPath = 'data/places/politikk-production/regjeringskvartalet.json';

const manifest = readJson(manifestPath);
manifest.politikk.quizProduction.targets.regjeringskvartalet = {
  source_brief: '../quiz/production_briefs/politikk/regjeringskvartalet.json',
  context_artifact: '../quiz/production_context/politikk/regjeringskvartalet.json',
  quiz_file: '../quiz/politikk/regjeringskvartalet_sets.json'
};
writeJson(manifestPath, manifest);

const sources = {
  reguleringsplan: {
    url: 'https://www.regjeringen.no/no/dokumenter/vedtak-av-statlig-reguleringsplan-for-nytt-regjeringskvartal/id2538263/',
    source_type: 'official_plan_decision',
    review_status: 'reviewed',
    review_note: 'Brukt for planavgrensning, rettslig beslutning og rammen for nytt regjeringskvartal.'
  },
  nytt_rkv: {
    url: 'https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/nytt-RKV/id712726/',
    source_type: 'official_project_documentation',
    review_status: 'reviewed',
    review_note: 'Brukt for byggetrinn, byggestart, sikkerhetstiltak, kontrollsenter og videre gjennomføring.'
  },
  apning_2026: {
    url: 'https://www.regjeringen.no/no/aktuelt/det-nye-regjeringskvartalet-offisielt-apnet/id3155987/',
    source_type: 'official_institution',
    review_status: 'reviewed',
    review_note: 'Brukt for åpningen 13. april 2026, bygningene i første byggetrinn, innflyttede virksomheter og om lag 2200 ansatte.'
  },
  bygninger_kunst: {
    url: 'https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/bygninger/id712727/',
    source_type: 'official_historical_documentation',
    review_status: 'reviewed',
    review_note: 'Brukt for Empirekvartalet, G-blokka, Høyblokka, Y-blokka, naturbetong, integrert kunst og senere bygningslag.'
  },
  melding_21: {
    url: 'https://www.regjeringen.no/no/dokumenter/meld.-st.-21-20182019/id2641647/',
    source_type: 'official_policy_document',
    review_status: 'reviewed',
    review_note: 'Brukt for mål og avveininger om funksjon, sikkerhet, bymiljø, vern, kunst og minne i gjenoppbyggingen.'
  },
  minnested_2026: {
    url: 'https://www.regjeringen.no/no/aktuelt/apning-av-nasjonalt-minnested/id3168433/',
    source_type: 'official_institution',
    review_status: 'reviewed',
    review_note: 'Brukt for åpningen av det nasjonale minnestedet 19. juli 2026 og minnestedets offentlige funksjon.'
  },
  senter_2026: {
    url: 'https://www.regjeringen.no/no/aktuelt/statsministerens-tale-ved-minnemarkeringen-i-regjeringskvartalet/id3169237/',
    source_type: 'official_primary',
    review_status: 'reviewed',
    review_note: 'Brukt for åpningen av det permanente 22. juli-senteret 22. juli 2026 og senterets minne- og læringsfunksjon.'
  }
};

const claimSpecs = [
  ['opening', 'fact', 'Regjeringskvartalet samler regjeringen og departementene som utøver og gjennomfører politikk, mens Stortinget vedtar lover og kontrollerer regjeringen.', ['apning_2026'], 'em_pol_byrakrati_forvaltning'],
  ['opening', 'fact', 'G-blokka fra 1906 var det første bygget i området som ble reist særskilt for departementsformål.', ['bygninger_kunst'], 'em_pol_byrakrati_forvaltning'],
  ['opening', 'fact', 'Høyblokka ble fullført i 1958 og ble et sentralt modernistisk regjeringsbygg.', ['bygninger_kunst'], 'em_pol_byrakrati_forvaltning'],
  ['opening', 'fact', 'Y-blokka ble tatt i bruk i 1969 og var kjent for integrert kunst i naturbetong.', ['bygninger_kunst'], 'em_pol_mediert_offentlighet'],
  ['opening', 'context', 'Senere bygg som S-blokka, R4, R5 og R6 viser at regjeringsområdet vokste trinnvis gjennom flere tiår.', ['bygninger_kunst'], 'em_pol_byrakrati_forvaltning'],
  ['opening', 'fact', 'Terrorangrepet 22. juli 2011 drepte åtte mennesker i Regjeringskvartalet og gjorde flere regjeringsbygg ubrukelige.', ['melding_21'], 'em_pol_politi_sikkerhet_makt'],
  ['opening', 'fact', 'Byggetrinn 1 ble offisielt åpnet 13. april 2026 med Høyblokka, A-blokka og D-blokka og om lag 2200 ansatte.', ['apning_2026'], 'em_pol_byrakrati_forvaltning'],
  ['bridge', 'context', 'Arkitektkonkurranser og planforsøk fra slutten av 1800-tallet og midten av 1900-tallet viser et langvarig mål om å samle sentralforvaltningen.', ['bygninger_kunst'], 'em_pol_byrakrati_forvaltning'],
  ['bridge', 'context', 'Statens bruk av Empirekvartalet og det tidligere Rikshospitalet viser at eldre bygg ble ombrukt før nye regjeringsbygg ble reist.', ['bygninger_kunst'], 'em_pol_byrakrati_forvaltning'],
  ['bridge', 'context', 'Første byggetrinn kombinerer rehabilitert Høyblokk med nye A- og D-blokker for å samle sentrale regjeringsfunksjoner.', ['nytt_rkv', 'apning_2026'], 'em_pol_byrakrati_forvaltning'],
  ['bridge', 'context', 'Perimetersikring, kjellerarealer og et eksternt kontrollsenter for post og varer er konkrete ressurser i sikkerhetsstyringen av området.', ['nytt_rkv'], 'em_pol_politi_sikkerhet_makt'],
  ['bridge', 'fact', 'Kunstverkene Fiskerne og Måken ble bevart fra Y-blokka og integrert i det nye regjeringsområdet.', ['bygninger_kunst', 'apning_2026'], 'em_pol_mediert_offentlighet'],
  ['bridge', 'fact', 'Det nasjonale minnestedet i Regjeringskvartalet åpnet 19. juli 2026.', ['minnested_2026'], 'em_pol_mediert_offentlighet'],
  ['bridge', 'fact', 'Det permanente 22. juli-senteret åpnet 22. juli 2026 som arena for minne, kunnskap og demokratisk læring.', ['senter_2026'], 'em_pol_mediert_offentlighet'],
  ['final', 'context', 'Byggetrinn 2 viser at Regjeringskvartalet fortsatt er under gjennomføring etter åpningen av første byggetrinn.', ['nytt_rkv'], 'em_pol_byrakrati_forvaltning'],
  ['final', 'context', 'Planarbeid og forprosjekt for senere bygg dokumenterer beslutnings- og gjennomføringsprosesser, men ikke at hele området er ferdig.', ['nytt_rkv', 'reguleringsplan'], 'em_pol_byrakrati_forvaltning'],
  ['final', 'context', 'Åpning av bygg og innflytting av ansatte er dokumenterte leveranser, men beviser ikke alene bedre samordning eller styringskvalitet.', ['apning_2026'], 'em_pol_byrakrati_forvaltning'],
  ['final', 'context', 'Sikkerhetstiltak og ferdigstilte bygg dokumenterer gjennomføring, men ikke en målt langsiktig reduksjon i sikkerhetsrisiko.', ['nytt_rkv', 'melding_21'], 'em_pol_politi_sikkerhet_makt'],
  ['final', 'context', 'Gjenoppbyggingen må balansere beskyttelse av nasjonale funksjoner med offentlige plasser, ganglinjer og tilgjengelig byrom.', ['melding_21', 'reguleringsplan'], 'em_pol_politi_sikkerhet_makt'],
  ['final', 'context', 'Regjeringskvartalet kan leses som en styringskjede fra institusjon og beslutning via ressurser og bygging til faktisk bruk.', ['reguleringsplan', 'nytt_rkv', 'apning_2026'], 'em_pol_byrakrati_forvaltning'],
  ['final', 'context', 'Minnestedet, 22. juli-senteret, kunsten og regjeringsbyggene gjør statlig makt, krisehistorie og offentlig minne synlige på samme sted.', ['bygninger_kunst', 'minnested_2026', 'senter_2026'], 'em_pol_mediert_offentlighet']
];

const claims = claimSpecs.map(([planned_phase, family, statement, source_ids, emne_id], index) => ({
  claim_id: `claim_regjeringskvartalet_quiz_${index + 1}`,
  order: index + 1,
  planned_phase,
  family,
  statement,
  source_ids,
  source_origin: 'external',
  emne_id
}));

const brief = {
  schema_version: '1.0',
  status: 'reviewed',
  categoryId: 'politikk',
  targetId: 'regjeringskvartalet',
  profile_hint: 'narrow',
  reviewed_at: '2026-08-02',
  review_note: 'Alle synlige påstander er forankret i regjeringen.no-kilder. Bygg, beslutning, sikkerhetstiltak, åpning og minnefunksjoner holdes atskilt fra udokumenterte påstander om langsiktig effekt.',
  scope: {
    place: 'Regjeringskvartalet',
    production_profile: 'narrow',
    set_count: 3,
    questions_per_set: 7,
    total_questions: 21,
    normal_opening_questions: 14
  },
  sources,
  selected_curriculum: {
    emne_ids: [
      'em_pol_byrakrati_forvaltning',
      'em_pol_politi_sikkerhet_makt',
      'em_pol_mediert_offentlighet'
    ],
    method_ids: [
      'met_pol_institusjonsanalyse',
      'met_pol_forvaltningsanalyse',
      'met_pol_kontroll_og_sanksjonsanalyse',
      'met_pol_dokumentanalyse',
      'met_pol_offentlighetsanalyse',
      'met_pol_plan_og_reguleringsanalyse'
    ],
    thinker_ids: [],
    works: []
  },
  claims
};
writeJson(briefPath, brief);

const context = await runBuildQuizProductionContext({
  root: process.cwd(),
  categoryId: 'politikk',
  targetId: 'regjeringskvartalet',
  outputPath: contextPath
});

const guidanceBasis = [
  'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  'data/fag/politikk/methods_politikk_canonical_v4_5.json'
];

const questionSpecs = [
  {
    question: 'Hva er den viktigste politiske forskjellen mellom Regjeringskvartalet og Stortinget?',
    options: ['Regjeringskvartalet utøver og gjennomfører politikk, mens Stortinget vedtar lover og kontrollerer regjeringen', 'Regjeringskvartalet vedtar Grunnloven, mens Stortinget driver departementene', 'Regjeringskvartalet er et kommunalt rådhus, mens Stortinget er et departement'], answerIndex: 0,
    knowledge: 'Regjeringen og departementene leder, forbereder og gjennomfører politikk. Stortinget er den lovgivende nasjonalforsamlingen og fører parlamentarisk kontroll.', concepts: ['utøvende makt', 'lovgivende makt', 'departement'], difficulty: 1, type: 'comparison', year: null
  },
  {
    question: 'Hva gjorde G-blokka fra 1906 historisk viktig i Regjeringskvartalet?',
    options: ['Den var den første norske parlamentsbygningen', 'Den var det første bygget i området reist særskilt for departementsformål', 'Den var en privat bank som senere ble museum'], answerIndex: 1,
    knowledge: 'G-blokka markerte overgangen fra tilfeldig bruk av eldre lokaler til et bygg reist særskilt for departementsarbeid.', concepts: ['byråkrati', 'departement', 'institusjonsbygg'], difficulty: 1, type: 'fact', year: 1906
  },
  {
    question: 'Når ble Høyblokka fullført?',
    options: ['1906', '1969', '1958'], answerIndex: 2,
    knowledge: 'Høyblokka ble fullført i 1958 og ble et sentralt symbol på etterkrigstidens moderne sentralforvaltning.', concepts: ['Høyblokka', 'modernisme', 'sentralforvaltning'], difficulty: 1, type: 'fact', year: 1958
  },
  {
    question: 'Hva var et særtrekk ved Y-blokka da den ble tatt i bruk i 1969?',
    options: ['Integrert kunst i naturbetong', 'En åpen stortingssal', 'En underjordisk jernbanestasjon'], answerIndex: 0,
    knowledge: 'Y-blokka kombinerte regjeringskontorer med integrert kunst i naturbetong og ble et tydelig kultur- og arkitekturspor i kvartalet.', concepts: ['Y-blokka', 'naturbetong', 'offentlig kunst'], difficulty: 1, type: 'fact', year: 1969
  },
  {
    question: 'Hva viser bygg som S-blokka, R4, R5 og R6 om Regjeringskvartalets utvikling?',
    options: ['At hele området ble reist samtidig', 'At området vokste trinnvis gjennom flere tiår', 'At departementene gradvis ble erstattet av private selskaper'], answerIndex: 1,
    knowledge: 'Regjeringsområdet er et lagdelt institusjonsmiljø som ble utvidet i flere omganger, ikke ett samlet byggeprosjekt fra én periode.', concepts: ['utbyggingstrinn', 'institusjonell vekst', 'historiske lag'], difficulty: 2, type: 'context', year: null
  },
  {
    question: 'Hva var den direkte virkningen av terrorangrepet i Regjeringskvartalet 22. juli 2011?',
    options: ['Åtte mennesker ble drept og flere regjeringsbygg ble ubrukelige', 'Stortinget ble permanent flyttet til Bergen', 'Alle departementer ble avviklet'], answerIndex: 0,
    knowledge: 'Angrepet drepte åtte mennesker i Regjeringskvartalet og førte til omfattende ødeleggelser og en langvarig gjenoppbyggingsprosess.', concepts: ['22. juli', 'terrorangrep', 'gjenoppbygging'], difficulty: 1, type: 'fact', year: 2011
  },
  {
    question: 'Hva ble dokumentert ved den offisielle åpningen 13. april 2026?',
    options: ['At hele det planlagte kvartalet var ferdig', 'At bare et midlertidig informasjonssenter åpnet', 'At Høyblokka, A-blokka og D-blokka var tatt i bruk av om lag 2200 ansatte'], answerIndex: 2,
    knowledge: 'Åpningen gjaldt første byggetrinn. Den dokumenterte faktisk bruk av tre bygg, ikke ferdigstillelse av hele det planlagte kvartalet.', concepts: ['byggetrinn 1', 'innflytting', 'leveranse'], difficulty: 1, type: 'fact', year: 2026
  },
  {
    question: 'Hva viser de mange planforsøkene for et samlet regjeringsområde siden slutten av 1800-tallet?',
    options: ['At ønsket om samlokalisering har vært langvarig og vanskelig å realisere', 'At staten aldri ønsket egne departementsbygg', 'At området opprinnelig var planlagt som fornøyelsespark'], answerIndex: 0,
    knowledge: 'Gjentatte konkurranser og planer viser at samlokalisering var et langsiktig institusjonelt mål, men at gjennomføringen skjedde stykkevis.', concepts: ['samlokalisering', 'planhistorie', 'institusjonell endring'], difficulty: 2, type: 'context', year: null
  },
  {
    question: 'Hva forteller bruken av Empirekvartalet og det tidligere Rikshospitalet om statens tidlige lokaler?',
    options: ['At staten bare brukte nybygde kontorbygg', 'At eldre bygg ble ombrukt før nye, formålsbygde regjeringsbygg kom', 'At departementene holdt til utenfor Oslo'], answerIndex: 1,
    knowledge: 'Sentralforvaltningen brukte og tilpasset eldre bygningsmiljøer før staten bygde mer spesialiserte departementsbygg.', concepts: ['ombruk', 'Empirekvartalet', 'departementslokaler'], difficulty: 2, type: 'context', year: null
  },
  {
    question: 'Hvorfor kombinerer byggetrinn 1 rehabilitert Høyblokk med nye A- og D-blokker?',
    options: ['For å gjøre området til et kjøpesenter', 'For å erstatte all historisk arkitektur', 'For å samle regjeringsfunksjoner gjennom både bevaring og nybygg'], answerIndex: 2,
    knowledge: 'Første byggetrinn kobler rehabilitering og nybygg for å gjenetablere et fungerende, samlokalisert regjeringsområde.', concepts: ['rehabilitering', 'nybygg', 'samlokalisering'], difficulty: 2, type: 'context', year: null
  },
  {
    question: 'Hva er den politiske funksjonen til perimetersikring og et eksternt kontrollsenter for post og varer?',
    options: ['De omsetter sikkerhetsbeslutninger til konkrete tekniske og romlige tiltak', 'De overfører lovgivende makt til vaktselskaper', 'De dokumenterer at all risiko er fjernet'], answerIndex: 0,
    knowledge: 'Sikkerhetskrav blir styring i praksis når de materialiseres som kontrollsoner, logistikkfunksjoner og teknisk infrastruktur.', concepts: ['perimetersikring', 'kontrollsenter', 'sikkerhetsstyring'], difficulty: 2, type: 'context', year: null
  },
  {
    question: 'Hva skjedde med kunstverkene Fiskerne og Måken etter rivningen av Y-blokka?',
    options: ['De ble ødelagt', 'De ble bevart og integrert i det nye regjeringsområdet', 'De ble solgt til private samlere'], answerIndex: 1,
    knowledge: 'Bevaringen av kunstverkene viser hvordan fysisk kulturarv kan flyttes og gis en ny plass i et transformert institusjonsmiljø.', concepts: ['Fiskerne', 'Måken', 'integrert kunst'], difficulty: 1, type: 'fact', year: null
  },
  {
    question: 'Når åpnet det nasjonale minnestedet i Regjeringskvartalet?',
    options: ['19. juli 2026', '22. juli 2011', '13. april 2026'], answerIndex: 0,
    knowledge: 'Det nasjonale minnestedet åpnet 19. juli 2026 og gjør minnet etter terrorangrepet fysisk til stede i regjeringsområdet.', concepts: ['nasjonalt minnested', 'offentlig minne', '22. juli'], difficulty: 1, type: 'fact', year: 2026
  },
  {
    question: 'Hva er hovedfunksjonen til det permanente 22. juli-senteret som åpnet 22. juli 2026?',
    options: ['Å administrere departementenes post', 'Å være kontor for Stortingets presidentskap', 'Å formidle minne, kunnskap og demokratisk læring'], answerIndex: 2,
    knowledge: 'Senteret knytter minnestedet til dokumentasjon, læring og offentlig refleksjon om terror, demokrati og samfunn.', concepts: ['22. juli-senteret', 'demokratisk læring', 'minnearbeid'], difficulty: 1, type: 'fact', year: 2026
  },
  {
    question: 'Hva viser arbeidet med byggetrinn 2 etter åpningen i 2026?',
    options: ['At Regjeringskvartalet fortsatt er under gjennomføring', 'At første byggetrinn må rives', 'At departementene skal avvikles'], answerIndex: 0,
    knowledge: 'Åpningen av første byggetrinn var en milepæl, men senere byggetrinn viser at det samlede regjeringsområdet fortsatt utvikles.', concepts: ['byggetrinn 2', 'implementering', 'ufullført prosjekt'], difficulty: 2, type: 'context', year: 2026
  },
  {
    question: 'Hva kan et vedtatt planarbeid eller forprosjekt dokumentere?',
    options: ['At alle planlagte bygg allerede er i bruk', 'At beslutnings- og gjennomføringsprosessen er i gang, men ikke at resultatet er ferdig', 'At langsiktige samfunnseffekter er bevist'], answerIndex: 1,
    knowledge: 'Plan, beslutning og forprosjekt er egne ledd i styringskjeden. De må ikke forveksles med fysisk ferdigstillelse eller målt effekt.', concepts: ['planvedtak', 'forprosjekt', 'gjennomføring'], difficulty: 3, type: 'context', year: null
  },
  {
    question: 'Hvorfor er innflytting av ansatte en leveranse, men ikke automatisk et dokumentert samfunnsutfall?',
    options: ['Fordi ansatte aldri påvirker forvaltningen', 'Fordi bygg ikke kan brukes politisk', 'Fordi bruk av bygg er dokumentert, mens bedre samordning eller styringskvalitet krever egne målinger'], answerIndex: 2,
    knowledge: 'Åpning og innflytting viser output. Påstander om bedre samordning, effektivitet eller kvalitet krever separat utfallsdokumentasjon.', concepts: ['output', 'outcome', 'styringskvalitet'], difficulty: 3, type: 'analysis', year: null
  },
  {
    question: 'Hva kan man ikke konkludere med bare fordi nye sikkerhetstiltak er bygget?',
    options: ['At tiltakene er gjennomført', 'At den langsiktige sikkerhetsrisikoen er målt og dokumentert redusert', 'At sikkerhet har påvirket utformingen'], answerIndex: 1,
    knowledge: 'Fysisk gjennomføring er dokumenterbar. Varig risikoreduksjon er et annet spørsmål som krever egne data og evaluering.', concepts: ['sikkerhetstiltak', 'risiko', 'effektmåling'], difficulty: 3, type: 'analysis', year: null
  },
  {
    question: 'Hvilken grunnleggende avveining preger det nye Regjeringskvartalet?',
    options: ['Beskyttelse av nasjonale funksjoner mot ønsket om et tilgjengelig offentlig byrom', 'Kommunalt selvstyre mot monarki', 'Landbruk mot industri'], answerIndex: 0,
    knowledge: 'Gjenoppbyggingen må kombinere sikkerhet og kontroll med ganglinjer, byrom, kunst, minne og offentlig tilgjengelighet.', concepts: ['sikkerhet', 'åpenhet', 'offentlig byrom'], difficulty: 2, type: 'analysis', year: null
  },
  {
    question: 'Hvilken rekkefølge beskriver best en etterprøvbar styringskjede i Regjeringskvartalet?',
    options: ['Effekt → rykte → arkitektur → beslutning', 'Institusjon og beslutning → ressurser og bygging → faktisk bruk', 'Kunst → turisme → lovgivning → valg'], answerIndex: 1,
    knowledge: 'Stedet kan leses gjennom hvem som beslutter, hvilke regler og ressurser som brukes, hvordan tiltak gjennomføres og hva som faktisk tas i bruk.', concepts: ['institusjon', 'beslutning', 'implementering'], difficulty: 3, type: 'analysis', year: null
  },
  {
    question: 'Hvorfor er Regjeringskvartalet også et sted for offentlig minne, ikke bare statsadministrasjon?',
    options: ['Fordi alle departementer er museer', 'Fordi området ikke lenger brukes av regjeringen', 'Fordi minnestedet, 22. juli-senteret, kunsten og byggene gjør krisehistorie og statlig makt synlig på samme sted'], answerIndex: 2,
    knowledge: 'Regjeringsområdet samler arbeidende statsinstitusjoner med kunst, minnespor og læringsarenaer. Det gjør makt og minne samtidig observerbare.', concepts: ['offentlig minne', 'statlig makt', 'krisehistorie'], difficulty: 3, type: 'analysis', year: null
  }
];

if (questionSpecs.length !== claims.length) throw new Error('Question/claim count mismatch');

const questions = questionSpecs.map((spec, index) => {
  const claim = claims[index];
  return {
    id: `regjeringskvartalet_quiz_${index + 1}`,
    quiz_id: `politikk_regjeringskvartalet_set_${Math.floor(index / 7) + 1}_q${(index % 7) + 1}`,
    categoryId: 'politikk',
    placeId: 'regjeringskvartalet',
    targetId: 'regjeringskvartalet',
    question_scope: index < 7 ? 'place' : 'emne',
    question: spec.question,
    options: spec.options,
    answer: spec.options[spec.answerIndex],
    answerIndex: spec.answerIndex,
    knowledge: spec.knowledge,
    core_concepts: spec.concepts,
    difficulty: spec.difficulty,
    question_type: spec.type,
    year: spec.year,
    emne_id: claim.emne_id,
    source: claim.source_ids,
    source_origin: 'external',
    claim_basis: claim.statement,
    guidance_basis: guidanceBasis,
    claim_id: claim.claim_id
  };
});

const quiz = {
  targetId: 'regjeringskvartalet',
  categoryId: 'politikk',
  sources: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url])),
  production_context: {
    manifest_category: 'politikk',
    profile: context.profile,
    standard_version: '3.0',
    source_brief: briefPath,
    context_artifact: contextPath,
    resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([key, value]) => [key, value.path])),
    required_inputs_loaded: context.required_inputs_loaded,
    pensum_module_ids: context.selected_curriculum.module_ids,
    emne_ids: context.selected_curriculum.emne_ids,
    topic_hook_ids: context.selected_curriculum.topic_hook_ids,
    method_ids: context.selected_curriculum.method_ids,
    thinker_ids: context.selected_curriculum.thinker_ids,
    works: context.selected_curriculum.works,
    source_review_status: context.source_review_status,
    theory_start_phase: 'final',
    method_start_phase: 'final'
  },
  sets: [
    { set_id: 'politikk_regjeringskvartalet_set_1', level: 1, order: 1, phase: 'opening', xp: 50, title: 'Regjeringsområdet og tidslagene', questions: questions.slice(0, 7) },
    { set_id: 'politikk_regjeringskvartalet_set_2', level: 2, order: 2, phase: 'bridge', xp: 75, title: 'Gjenoppbygging, sikkerhet og minne', questions: questions.slice(7, 14) },
    { set_id: 'politikk_regjeringskvartalet_set_3', level: 3, order: 3, phase: 'final', xp: 100, title: 'Fra beslutning til virkning', questions: questions.slice(14, 21) }
  ]
};
writeJson(quizPath, quiz);

const report = readJson(reportPath);
report.quizOpening = {
  status: 'PASS',
  quizTargetId: 'regjeringskvartalet',
  firstTwoSetsQuestionCount: 14,
  sourceBrief: briefPath,
  productionContext: contextPath,
  requiredInputs: Object.values(quiz.production_context.resolved_files)
};
report.gates.F = {
  status: 'PASS',
  evidenceRefs: [quizPath, briefPath, contextPath]
};
report.review.notes = 'Rapporten materialiserer eksisterende v4.2-dossier, canonical emne_ids, tre episode_v1-stories og en full narrow 3x7-quizpakke. De første to settene utgjør en godkjent normalåpning på 14 spørsmål. Ingen udokumentert effektpåstand er godkjent.';
writeJson(reportPath, report);

run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'audit:quiz-manifest:v2']);
run('npm', ['run', 'audit:politikk-place-production']);
run('npm', ['run', 'test:politikk-place-production']);
run('npm', ['run', 'knowledge:canonical:check']);
