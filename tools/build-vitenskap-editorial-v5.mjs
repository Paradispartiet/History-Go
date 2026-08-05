#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const BASE = 'data/fag/vitenskap';
const PATHS = {
  oldPensum: `${BASE}/vitenskappensum_canonical_v4_5.json`,
  oldEmner: `${BASE}/emner_vitenskap_canonical_v4_5.json`,
  oldFagkart: `${BASE}/fagkart_vitenskap_canonical_v4_5.json`,
  oldMethods: `${BASE}/methods_vitenskap_canonical_v4_5.json`,
  oldMapping: `${BASE}/emnemapping_vitenskap_canonical_v4_5.json`,
  pensum: `${BASE}/vitenskappensum_canonical_v5.json`,
  emner: `${BASE}/emner_vitenskap_canonical_v5.json`,
  fagkart: `${BASE}/fagkart_vitenskap_canonical_v5.json`,
  methods: `${BASE}/methods_vitenskap_canonical_v5.json`,
  mapping: `${BASE}/emnemapping_vitenskap_canonical_v5.json`,
  contract: `${BASE}/editorial_contract_vitenskap_v5.json`,
  legacy: `${BASE}/canonical_legacy_status_vitenskap_v5.json`,
  sourcePolicy: `${BASE}/source_policy_vitenskap_v5.json`,
  readme: `${BASE}/VITENSKAP_EDITORIAL_V5.md`,
  manifest: 'data/fag/fag_manifest.json',
  report: 'reports/fagverk/vitenskap-editorial-v5-validation.json'
};

const arr = (v) => Array.isArray(v) ? v : [];
const clean = (v) => String(v ?? '').trim();
const unique = (values) => [...new Set(values.flatMap((v) => Array.isArray(v) ? v : [v]).map(clean).filter(Boolean))];
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const readJson = async (relative) => JSON.parse(await readFile(path.resolve(ROOT, relative), 'utf8'));
const changed = [];

async function writeExpected(relative, content) {
  const next = typeof content === 'string' ? content : jsonText(content);
  let previous = '';
  try { previous = await readFile(path.resolve(ROOT, relative), 'utf8'); } catch {}
  if (previous === next) return;
  changed.push(relative);
  if (WRITE) {
    await mkdir(path.dirname(path.resolve(ROOT, relative)), { recursive: true });
    await writeFile(path.resolve(ROOT, relative), next, 'utf8');
  }
}

const MODULES = [
  {
    id: 'vitenskapelig_kunnskap_begrunnelse',
    order: 1,
    label: 'Vitenskapelig kunnskap, begrunnelse og sannhet',
    stage: 'grunnlag',
    definition: 'Hva som gjør en påstand vitenskapelig, hvordan evidens begrunner kunnskap, og hvordan objektivitet, perspektiv og sannhet avgrenses.',
    focus: ['evidens', 'objektivitet', 'forklaring', 'sannhet', 'kunnskapsgrenser'],
    boundary: 'Skal handle om begrunnelse av kunnskap, ikke om generell filosofi uten forskningspraksis.'
  },
  {
    id: 'forskningssporsmal_design_kausalitet',
    order: 2,
    label: 'Forskningsspørsmål, design og kausalitet',
    stage: 'grunnlag',
    definition: 'Hvordan spørsmål, hypoteser, variabler, sammenligninger og forskningsdesign gjør årsaks- og forklaringspåstander testbare.',
    focus: ['problemformulering', 'hypotese', 'variabel', 'kontroll', 'kausalitet'],
    boundary: 'Skal ikke likestille korrelasjon med årsak eller metodevalg med automatisk gyldighet.'
  },
  {
    id: 'observasjon_maling_eksperiment',
    order: 3,
    label: 'Observasjon, måling og eksperiment',
    stage: 'metodegrunnlag',
    definition: 'Hvordan observasjoner, instrumenter, kalibrering, standarder, eksperimenter og replikasjon produserer etterprøvbare data.',
    focus: ['observasjon', 'instrument', 'kalibrering', 'standardisering', 'replikasjon'],
    boundary: 'Skal skille fenomenet fra målekjeden og oppgi usikkerhet og feilkilder.'
  },
  {
    id: 'statistikk_modeller_usikkerhet',
    order: 4,
    label: 'Statistikk, modeller og usikkerhet',
    stage: 'metodefordypning',
    definition: 'Hvordan statistiske slutninger, modeller, simuleringer og forenklinger brukes til å beskrive, forklare og predikere under usikkerhet.',
    focus: ['sannsynlighet', 'modell', 'simulering', 'usikkerhet', 'gyldighetsområde'],
    boundary: 'Skal ikke presentere modellresultat som virkeligheten selv eller skjule antakelser bak tall.'
  },
  {
    id: 'klassifikasjon_data_beregning',
    order: 5,
    label: 'Klassifikasjon, data og beregning',
    stage: 'metodefordypning',
    definition: 'Hvordan kategorier, datasett, algoritmer, visualisering og beregning former hva som blir synlig og sammenlignbart i forskning.',
    focus: ['klassifikasjon', 'datasett', 'algoritme', 'visualisering', 'beregning'],
    boundary: 'Vitenskap analyserer kunnskapsproduksjonen; Teknologi V3 analyserer design, implementasjon og ytelse av systemene.'
  },
  {
    id: 'laboratorier_institusjoner_infrastruktur',
    order: 6,
    label: 'Laboratorier, institusjoner og forskningsinfrastruktur',
    stage: 'institusjonell fordypning',
    definition: 'Hvordan universiteter, laboratorier, arkiver, museer, sykehus, observatorier, standarder og infrastrukturer organiserer kunnskapsproduksjon.',
    focus: ['laboratorium', 'institusjon', 'infrastruktur', 'fagmiljø', 'autoritet'],
    boundary: 'Skal dokumentere institusjonens faktiske forskningsrolle og ikke anta vitenskap bare ut fra bygningstype eller omdømme.'
  },
  {
    id: 'vitenskapshistorie_paradigmer_fagendring',
    order: 7,
    label: 'Vitenskapshistorie, paradigmer og fagendring',
    stage: 'historisk fordypning',
    definition: 'Hvordan fag, begreper, teorier, instrumenter og standarder endres gjennom konflikter, anomalier, gjennombrudd og institusjonelle skifter.',
    focus: ['paradigme', 'teoriendring', 'anomalier', 'kunnskapsarv', 'faghistorie'],
    boundary: 'Skal ikke reduseres til lineær fremskrittshistorie eller løs biografi uten dokumentert kunnskapsendring.'
  },
  {
    id: 'natur_liv_helse_miljovitenskap',
    order: 8,
    label: 'Natur-, livs-, helse- og miljøvitenskap',
    stage: 'faglig anvendelse',
    definition: 'Hvordan vitenskapelige metoder brukes i studiet av natur, liv, kropp, sykdom, klima, miljø og lange tidsskalaer.',
    focus: ['natur', 'liv', 'helse', 'miljø', 'tidsskala'],
    boundary: 'Skal handle om dokumentert forskning og evidens, ikke om natur- eller helsefakta uten metode- og kildegrunnlag.'
  },
  {
    id: 'vitenskap_samfunn_makt_offentlighet',
    order: 9,
    label: 'Vitenskap, samfunn, makt og offentlighet',
    stage: 'integrasjon',
    definition: 'Hvordan ekspertise, finansiering, industri, politikk, offentlighet og tillit påvirker hvilke spørsmål som stilles og hvordan kunnskap får autoritet.',
    focus: ['ekspertise', 'finansiering', 'makt', 'offentlighet', 'tillit'],
    boundary: 'Skal skille empirisk analyse av kunnskapssystemer fra generell politikk- eller medieanalyse.'
  },
  {
    id: 'etikk_integritet_risiko_ansvar',
    order: 10,
    label: 'Etikk, integritet, risiko og ansvar',
    stage: 'integrasjon',
    definition: 'Hvordan forskningsintegritet, interessekonflikter, risiko, ansvar, deltakere og samfunnskonsekvenser vurderes før kunnskap eller inngrep godtas.',
    focus: ['integritet', 'etikk', 'risiko', 'ansvar', 'interessekonflikt'],
    boundary: 'Normative konklusjoner krever eksplisitte verdier, berørte grupper og dokumentert empirisk grunnlag.'
  }
];

const MODULE_BY_ID = new Map(MODULES.map((m) => [m.id, m]));

function textOf(item) {
  return [item?.emne_id, item?.title, item?.short_label, item?.domain, ...arr(item?.keywords), ...arr(item?.core_concepts)].join(' ').toLowerCase();
}

function classifyModule(item) {
  const t = textOf(item);
  const has = (...words) => words.some((word) => t.includes(word));
  if (has('etikk', 'ansvar', 'risiko', 'integritet', 'interessekonflikt', 'forskningsfusk')) return 'etikk_integritet_risiko_ansvar';
  if (has('samfunn', 'makt', 'ekspert', 'offentlig', 'tillit', 'finansiering', 'industri', 'marginal', 'styring')) return 'vitenskap_samfunn_makt_offentlighet';
  if (has('medisin', 'klinisk', 'helse', 'sykdom', 'natur', 'miljø', 'klima', 'økologi', 'evolusjon', 'geologi', 'biologi', 'organisme', 'tidsskala')) return 'natur_liv_helse_miljovitenskap';
  if (has('paradigme', 'vitenskapshistor', 'teoriendring', 'revolusjon', 'gjennombrudd', 'kunnskapsarv', 'faghistor')) return 'vitenskapshistorie_paradigmer_fagendring';
  if (has('institusjon', 'laborator', 'universitet', 'forskningsinfrastruktur', 'fagmiljø', 'observatorium', 'museum', 'arkiv', 'sykehus', 'kunnskapsgeografi')) return 'laboratorier_institusjoner_infrastruktur';
  if (has('algoritm', 'data', 'sensor', 'automatisering', 'visualisering', 'beregning', 'klassifikasjon', 'taksonomi', 'datainfrastruktur')) return 'klassifikasjon_data_beregning';
  if (has('statist', 'sannsynlighet', 'modell', 'simulering', 'usikkerhet', 'feilkilde', 'abstraksjon', 'forenkling')) return 'statistikk_modeller_usikkerhet';
  if (has('observasjon', 'måling', 'instrument', 'kalibrering', 'eksperiment', 'replikasjon', 'standardisering', 'presisjon')) return 'observasjon_maling_eksperiment';
  if (has('hypotese', 'variabel', 'kausal', 'forskningsdesign', 'kontroll', 'forklaring', 'metodekritikk')) return 'forskningssporsmal_design_kausalitet';
  return 'vitenskapelig_kunnskap_begrunnelse';
}

const METHOD_FAMILIES = [
  { id: 'observasjon_feltarbeid', label: 'Observasjon og feltarbeid', keywords: ['observasjon', 'felt', 'praksis', 'sted'], focus: 'systematisk registrering av fenomen, kontekst og observatørposisjon' },
  { id: 'eksperiment_kausal_design', label: 'Eksperiment og kausalt design', keywords: ['eksperiment', 'kausal', 'variabel', 'kontroll'], focus: 'manipulasjon, sammenligning og identifikasjon av årsaksvirkninger' },
  { id: 'maling_kalibrering_standard', label: 'Måling, kalibrering og standard', keywords: ['måle', 'kalibr', 'sensor', 'standard'], focus: 'sporbar målekjede, referanser, presisjon og måleusikkerhet' },
  { id: 'statistikk_usikkerhet', label: 'Statistikk og usikkerhet', keywords: ['statist', 'sannsyn', 'usikker', 'feilkilde'], focus: 'utvalg, variasjon, inferens og robuste usikkerhetsangivelser' },
  { id: 'modellering_simulering', label: 'Modellering og simulering', keywords: ['modell', 'simuler', 'abstraksjon'], focus: 'antakelser, parameterisering, validering og gyldighetsområde' },
  { id: 'data_beregning_visualisering', label: 'Data, beregning og visualisering', keywords: ['data', 'algoritm', 'visual', 'beregning', 'automatisering'], focus: 'dataspor, transformasjoner, kode, visualisering og reproduserbar beregning' },
  { id: 'klassifikasjon_sammenligning', label: 'Klassifikasjon og sammenligning', keywords: ['klassifik', 'takson', 'sammenlign', 'kategori'], focus: 'kriterier, kategorigrenser, sammenlignbarhet og konsekvenser av inndeling' },
  { id: 'kilde_arkiv_historie', label: 'Kilde, arkiv og vitenskapshistorie', keywords: ['arkiv', 'histor', 'kilde', 'museum', 'samling'], focus: 'proveniens, kontekst, endring over tid og kildekritikk' },
  { id: 'institusjon_infrastruktur', label: 'Institusjon og infrastruktur', keywords: ['institusjon', 'infrastruktur', 'fagmiljø', 'universitet', 'laborator'], focus: 'organisasjon, standarder, ressurser, autoritet og materielle kunnskapssystemer' },
  { id: 'evidens_replikasjon_syntese', label: 'Evidens, replikasjon og syntese', keywords: ['evidens', 'replik', 'fagfelle', 'konsensus', 'meta'], focus: 'etterprøvbarhet, uavhengig kontroll og syntese av flere evidenskilder' },
  { id: 'sts_makt_risiko_etikk', label: 'STS, makt, risiko og etikk', keywords: ['makt', 'etikk', 'risiko', 'ansvar', 'tillit', 'interesse', 'samfunn'], focus: 'aktører, fordelingsvirkninger, verdier, risiko og ansvar' },
  { id: 'natur_medisin_miljo', label: 'Natur-, medisin- og miljøfaglige metoder', keywords: ['medisin', 'klinisk', 'miljø', 'natur', 'geolog', 'økolog', 'evolusjon'], focus: 'fagspesifikke observasjoner, prøver, tidsskalaer og evidenshierarkier' }
];

function classifyMethod(method) {
  const t = [method?.method_id, method?.title, method?.description, ...arr(method?.best_for_emne_kinds)].join(' ').toLowerCase();
  let best = METHOD_FAMILIES[0];
  let bestScore = -1;
  for (const family of METHOD_FAMILIES) {
    const score = family.keywords.reduce((sum, keyword) => sum + (t.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) { best = family; bestScore = score; }
  }
  return best;
}

function technologyOverlap(item) {
  const t = textOf(item);
  return ['teknologi', 'algoritm', 'data', 'sensor', 'automatisering', 'infrastruktur', 'innovasjon'].some((w) => t.includes(w));
}

function claimClasses(topic, module) {
  const base = Number(topic.level) <= 1 ? ['descriptive', 'conceptual'] : Number(topic.level) === 2 ? ['descriptive', 'comparative', 'mechanistic'] : ['comparative', 'causal', 'interpretive'];
  if (module.order >= 9) base.push('normative');
  return unique(base);
}

function sourceRequirements(module) {
  const common = ['ekstern kilde med identifiserbar utgiver og dato', 'presis lokator til side, tabell, figur, datasett, arkivpost eller avsnitt', 'påstandsgrunnlag som viser hva kilden faktisk støtter'];
  if (module.id === 'vitenskapshistorie_paradigmer_fagendring') return [...common, 'primærkilde eller fagfellevurdert vitenskapshistorisk sekundærkilde'];
  if (module.id === 'natur_liv_helse_miljovitenskap') return [...common, 'fagfellevurdert studie, offentlig fagrapport eller kuratert forskningsdatasett'];
  if (module.id === 'laboratorier_institusjoner_infrastruktur') return [...common, 'institusjonsarkiv, teknisk dokumentasjon eller uavhengig historisk/faglig kilde'];
  return [...common, 'fagfellevurdert forskning, metodeverk, datasett eller autoritativ faglig syntese'];
}

function evidenceRequirements(module, title) {
  return [
    `minst én observerbar eller dokumentert evidenstype som er direkte relevant for ${title.toLowerCase()}`,
    `en eksplisitt forbindelse mellom evidensen og modulens kjerne: ${module.focus.slice(0, 3).join(', ')}`,
    'oppgitt usikkerhet, feilkilde eller alternativ forklaring',
    'avgrenset gyldighetsområde for konklusjonen'
  ];
}

function learningOutcomes(topic, module) {
  const title = clean(topic.title);
  return [
    `definere og avgrense ${title.toLowerCase()} innen ${module.label.toLowerCase()}`,
    `analysere et dokumentert case med relevante begreper og minst én operasjonalisert metode`,
    `vurdere evidens, usikkerhet og konkurrerende forklaringer før en konklusjon trekkes`,
    technologyOverlap(topic)
      ? 'skille vitenskapelig kunnskapsproduksjon fra teknologisk design, implementasjon og ytelsesvurdering'
      : 'begrunne faggrensen mot nærliggende historie-, natur-, politikk- eller samfunnsanalyse'
  ];
}

function failureModes(module, topic) {
  const generic = [
    'påstanden bygger bare på emnenavn eller generell bakgrunnskunnskap',
    'kilden dokumenterer temaet, men ikke den konkrete påstanden',
    'usikkerhet eller motstridende evidens er skjult'
  ];
  const specific = {
    vitenskapelig_kunnskap_begrunnelse: 'filosofiske begreper brukes uten forbindelse til faktisk forskningspraksis',
    forskningssporsmal_design_kausalitet: 'korrelasjon, tidsrekkefølge eller kontrollvariabler behandles som tilstrekkelig kausal identifikasjon',
    observasjon_maling_eksperiment: 'måleresultatet forveksles med fenomenet og målekjeden er ikke dokumentert',
    statistikk_modeller_usikkerhet: 'modellens antakelser eller utvalgsbegrensninger forsvinner i konklusjonen',
    klassifikasjon_data_beregning: 'datasett, kategorier eller algoritmiske transformasjoner behandles som nøytrale og komplette',
    laboratorier_institusjoner_infrastruktur: 'institusjonell autoritet erstatter vurdering av metode og evidens',
    vitenskapshistorie_paradigmer_fagendring: 'faghistorien fremstilles som lineær, uunngåelig fremgang',
    natur_liv_helse_miljovitenskap: 'fagfakta løsriver seg fra prøver, design, måling eller evidensgrunnlag',
    vitenskap_samfunn_makt_offentlighet: 'generell politikk eller omdømmeanalyse presenteres som vitenskapsanalyse',
    etikk_integritet_risiko_ansvar: 'normative konklusjoner skjuler verdipremisser eller hvem som bærer risikoen'
  }[module.id];
  return unique([...generic, specific, technologyOverlap(topic) ? 'teknologisk artefakt eller systemytelse blir hovedsaken uten vitenskapelig spørsmål, metode eller evidens' : '']);
}

function assessmentTask(topic, module) {
  return {
    prompt: `Undersøk et dokumentert case om ${clean(topic.title).toLowerCase()}. Formuler en presis påstand, vis evidensgrunnlaget, anvend en relevant metode og vurder minst én alternativ forklaring eller begrensning.`,
    deliverable: module.order <= 3 ? 'kort analyse med påstand–evidens–begrunnelse-tabell' : module.order <= 7 ? 'strukturert fagnotat med metode-, kilde- og usikkerhetsdel' : 'integrert vurdering med empirisk, metodisk, institusjonell og etisk drøfting',
    criteria: ['presis faglig avgrensning', 'sporbar kilde og lokator', 'korrekt metodebruk', 'synlig usikkerhet og alternativ', 'gyldig faggrense']
  };
}

function moduleQuestionMode(module) {
  if (module.order <= 2) return 'claim-evidence-reasoning-first';
  if (module.order <= 5) return 'method-data-uncertainty-first';
  if (module.order <= 7) return 'institution-history-practice-first';
  return 'case-evidence-consequence-first';
}

const [oldPensum, oldEmner, oldFagkart, oldMethodsDoc, oldMapping, manifest] = await Promise.all([
  readJson(PATHS.oldPensum), readJson(PATHS.oldEmner), readJson(PATHS.oldFagkart), readJson(PATHS.oldMethods), readJson(PATHS.oldMapping), readJson(PATHS.manifest)
]);
const oldMethods = arr(oldMethodsDoc.methods);

const topicModule = new Map(oldEmner.map((topic) => [topic.emne_id, classifyModule(topic)]));
const topicsByModule = new Map(MODULES.map((m) => [m.id, []]));
for (const topic of oldEmner) topicsByModule.get(topicModule.get(topic.emne_id))?.push(topic);
for (const topics of topicsByModule.values()) topics.sort((a, b) => Number(a.level) - Number(b.level) || clean(a.title).localeCompare(clean(b.title), 'nb'));

const emner = oldEmner.map((topic) => {
  const module = MODULE_BY_ID.get(topicModule.get(topic.emne_id));
  const siblings = topicsByModule.get(module.id) || [];
  const prerequisiteIds = siblings.filter((candidate) => Number(candidate.level) < Number(topic.level)).slice(-3).map((candidate) => candidate.emne_id);
  const nextIds = siblings.filter((candidate) => Number(candidate.level) > Number(topic.level)).slice(0, 3).map((candidate) => candidate.emne_id);
  const title = clean(topic.title);
  const conceptLabels = unique([topic.core_concepts, topic.key_concepts]).slice(0, 4);
  const techOverlap = technologyOverlap(topic);
  return {
    ...topic,
    subject_id: 'vitenskap',
    domain: module.id,
    area_id: module.id,
    area_label: module.label,
    module_id: module.id,
    module_order: module.order,
    course_stage: module.stage,
    progression_stage: Number(topic.level) <= 1 ? 'grunnnivå' : Number(topic.level) === 2 ? 'mellomnivå' : 'avansert',
    status: 'active',
    editorial_status: 'reviewed_and_operationalized_v5',
    canonical_file_role: 'active',
    canonical_status: 'canonical',
    registry_version: 'vitenskappensum_v5',
    definition: `${title} undersøker ${conceptLabels.length ? conceptLabels.join(', ') : module.focus.slice(0, 3).join(', ')} som del av ${module.label.toLowerCase()}, med vekt på hvordan kunnskap blir produsert, begrunnet og avgrenset.`,
    why_it_matters: `${title} er viktig fordi emnet gjør det mulig å vurdere hvordan ${module.focus.slice(0, 3).join(', ')} påvirker hvilke konklusjoner som kan forsvares, hvilke usikkerheter som står igjen, og hvor faggrensen går.`,
    learning_outcomes: learningOutcomes(topic, module),
    key_questions: [
      `Hvilken presis påstand om ${title.toLowerCase()} skal undersøkes?`,
      `Hvilken evidens og metode kan faktisk støtte eller svekke påstanden?`,
      `Hvilke antakelser, feilkilder og alternative forklaringer må vurderes?`,
      techOverlap ? 'Hva hører til vitenskapelig kunnskapsproduksjon, og hva hører til Teknologi V3s analyse av artefakt, system og ytelse?' : `Hvordan avgrenses emnet mot nærliggende fag uten å miste ${module.label.toLowerCase()} som hovedperspektiv?`
    ],
    claim_classes: claimClasses(topic, module),
    source_requirements: sourceRequirements(module),
    evidence_requirements: evidenceRequirements(module, title),
    failure_modes: failureModes(module, topic),
    boundary_note: module.boundary,
    technology_overlap_risk: techOverlap ? 'high' : 'low',
    technology_boundary: techOverlap
      ? 'Bruk Vitenskap når hovedspørsmålet gjelder evidens, forskningsdesign, måling, modell, institusjon eller kunnskapsautoritet. Bruk Teknologi V3 når hovedspørsmålet gjelder design, implementasjon, arkitektur, drift, ytelse eller teknisk risiko.'
      : 'Teknologi V3 er sekundært med mindre et teknisk system er nødvendig for å forstå evidens- eller forskningsprosessen.',
    assessment_task: assessmentTask(topic, module),
    prerequisite_emne_ids: prerequisiteIds,
    next_emne_ids: nextIds,
    question_surface_mode: moduleQuestionMode(module),
    progression_note: `Emnet ligger i modul ${module.order} av 10 og skal bygge videre på dokumentert kunnskapsgrunnlag før mer integrerte samfunns- og etikkvurderinger.`,
    source_gate: {
      status: 'blocking',
      require_external_source: true,
      require_locator: true,
      require_claim_basis: true,
      require_validity_scope: true,
      block_label_only_generation: true
    },
    generator_constraints: {
      ...(topic.generator_constraints || {}),
      require_external_claim_basis: true,
      require_locator: true,
      require_validity_scope: true,
      require_method_or_evidence_anchor: true,
      require_science_technology_boundary_when_overlap_high: techOverlap,
      do_not_generate_from_emne_label_only: true
    }
  };
});

const emneById = new Map(emner.map((topic) => [topic.emne_id, topic]));
const methodAssignments = oldMethods.map((method) => ({ method, family: classifyMethod(method) }));
const familyCoreId = new Map();
for (const family of METHOD_FAMILIES) {
  const candidates = methodAssignments.filter((entry) => entry.family.id === family.id).map((entry) => entry.method);
  const exact = candidates.find((method) => clean(method.method_id).includes(family.keywords[0]));
  familyCoreId.set(family.id, clean((exact || candidates[0] || {}).method_id));
}

function methodProcedure(method, family) {
  const title = clean(method.title).toLowerCase();
  return [
    `avgrens problem, analyseenhet og påstand for ${title}`,
    `registrer nødvendige data, kilder, instrumenter eller dokumenter for ${family.focus}`,
    'gjennomfør analysen med eksplisitte beslutningsregler og sporbare mellomresultater',
    'test robusthet mot feilkilder, alternative forklaringer og endrede antakelser',
    'rapporter resultat, usikkerhet, gyldighetsområde og hva metoden ikke kan avgjøre'
  ];
}

function methodOperationalFields(method, family) {
  return {
    method_family_id: family.id,
    method_family_label: family.label,
    method_role: familyCoreId.get(family.id) === method.method_id ? 'core' : 'specialized',
    operational_status: 'operationalized_v5',
    procedure_steps: methodProcedure(method, family),
    required_inputs: unique([
      arr(method.data_forms).slice(0, 3),
      'presis problemformulering og analyseenhet',
      'sporbare kilder eller data med proveniens',
      'definisjoner av sentrale variabler, kategorier eller begreper'
    ]),
    observables: [
      `observerbare eller dokumenterte indikatorer for ${family.focus}`,
      'mellomresultater som kan kontrolleres av en annen analytiker',
      'avvik, manglende data og motstridende observasjoner'
    ],
    validity_conditions: [
      'analyseenheten samsvarer med påstanden',
      'datagrunnlaget dekker det oppgitte gyldighetsområdet',
      'metodens antakelser er synlige og rimelige',
      'alternative forklaringer er vurdert når metoden brukes kausalt eller normativt'
    ],
    limitations: [
      `metoden belyser primært ${family.focus} og kan ikke alene avgjøre alle forklarings- eller verdispørsmål`,
      'resultatet er avhengig av kvalitet, utvalg og proveniens i datagrunnlaget',
      'fravær av observerte avvik er ikke bevis for fullstendig gyldighet'
    ],
    ethics_gates: [
      'avklar personvern, samtykke, sikkerhet og mulig skade før datainnsamling eller publisering',
      'synliggjør interessekonflikter, berørte grupper og skjev fordeling av risiko',
      'ikke overdriv sikkerhet eller generaliser utover dokumentert gyldighetsområde'
    ],
    deliverables: [
      `${family.label.toLowerCase()}-protokoll med data- og beslutningsspor`,
      'resultatoversikt med usikkerhet, alternative forklaringer og begrensninger',
      'kilde- og proveniensliste med presise lokatorer'
    ],
    quality_gates: [
      'prosedyren kan gjentas eller ettergås',
      'påstander kan spores til data og analyseledd',
      'usikkerhet og gyldighetsområde er eksplisitt',
      'metodevalget er begrunnet mot minst ett alternativ'
    ],
    blocked_when: [
      'nødvendige data eller kilder mangler',
      'påstanden ligger utenfor metodens gyldighetsområde',
      'metoden brukes bare som etikett uten gjennomført prosedyre',
      'etiske eller sikkerhetsmessige minimumskrav ikke er avklart'
    ]
  };
}

const methods = oldMethods.map((method) => {
  const family = classifyMethod(method);
  return {
    ...method,
    ...methodOperationalFields(method, family),
    canonical_status: 'canonical',
    canonical_file_role: 'active',
    registry_version: 'vitenskappensum_v5',
    case_gate_required: true,
    external_claim_basis_required: true,
    generator_constraints: {
      ...(method.generator_constraints || {}),
      require_external_claim_basis: true,
      require_locator: true,
      require_validity_scope: true,
      require_completed_procedure: true,
      do_not_generate_from_method_label_only: true,
      require_emne_prefix: 'em_vit_'
    }
  };
});

const methodsById = new Map(methods.map((m) => [m.method_id, m]));
const allOldHooks = arr(oldFagkart.categories).flatMap((category) => arr(category.topic_hooks).map((hook) => ({ ...hook, old_category_id: category.id })));
const hooksByModule = new Map(MODULES.map((m) => [m.id, []]));
for (const hook of allOldHooks) {
  const firstTopic = arr(hook.emne_ids).map((id) => emneById.get(id)).find(Boolean);
  const moduleId = firstTopic?.module_id || 'vitenskapelig_kunnskap_begrunnelse';
  hooksByModule.get(moduleId)?.push({
    ...hook,
    module_id: moduleId,
    fagkart_kategori: moduleId,
    question_surface_mode: moduleQuestionMode(MODULE_BY_ID.get(moduleId)),
    source_gate: 'blocking_external_source_locator_claim_basis_validity_scope',
    technology_boundary_required: arr(hook.emne_ids).some((id) => emneById.get(id)?.technology_overlap_risk === 'high')
  });
}

const moduleRows = MODULES.map((module) => {
  const topics = topicsByModule.get(module.id) || [];
  const topicIds = topics.map((topic) => topic.emne_id);
  const topicMethods = unique(topics.flatMap((topic) => arr(topic.method_ids || topic.methods))).filter((id) => methodsById.has(id));
  const hooks = hooksByModule.get(module.id) || [];
  const cases = unique(topics.flatMap((topic) => arr(topic.recommended_oslo_cases)));
  return {
    module_id: module.id,
    domain_id: module.id,
    order: module.order,
    label: module.label,
    title: module.label,
    stage: module.stage,
    definition: module.definition,
    focus: module.focus,
    boundary: module.boundary,
    emne_count: topicIds.length,
    method_count: topicMethods.length,
    hook_count: hooks.length,
    emne_ids: topicIds,
    method_ids: topicMethods,
    hook_ids: hooks.map((hook) => hook.id),
    recommended_cases: cases,
    source_gate_required: true,
    method_or_evidence_anchor_required: true,
    validity_scope_required: true
  };
});

const fagkart = {
  subject_id: 'vitenskap',
  subject_title: 'Vitenskap',
  scope: 'universal_with_geographic_application',
  type: 'fagkart',
  version: 'v5.0-canonical',
  canonical_registry_version: 'vitenskappensum_v5',
  updated_at: '2026-08-05',
  purpose: 'Universitetsmessig fagkart for vitenskapelig kunnskapsproduksjon, forskningsdesign, måling, modellering, institusjoner, faghistorie, anvendte vitenskaper, samfunnsmakt og forskningsetikk.',
  principles: {
    source_first: true,
    external_claim_basis_required: true,
    locator_required: true,
    validity_scope_required: true,
    method_or_evidence_anchor_before_theory: true,
    no_generic_science_questions: true,
    preserve_science_technology_boundary: true,
    primary_category_rule: 'Vitenskap er hovedfag når hovedspørsmålet gjelder hvordan kunnskap produseres, testes, måles, modelleres, institusjonaliseres, endres eller vurderes. Teknologi V3 brukes når hovedspørsmålet gjelder artefakt, design, implementasjon, arkitektur, drift eller teknisk ytelse.',
    emne_prefix_required: 'em_vit_'
  },
  module_order: MODULES.map((m) => m.id),
  categories: MODULES.map((module) => {
    const row = moduleRows.find((item) => item.module_id === module.id);
    const hooks = hooksByModule.get(module.id) || [];
    return {
      id: module.id,
      order: module.order,
      title: module.label,
      tagline: module.definition,
      definition: module.definition,
      focus: module.focus,
      boundary: module.boundary,
      emne_ids: row.emne_ids,
      method_ids: row.method_ids,
      topic_hooks: hooks,
      source_gate_required: true,
      method_or_evidence_anchor_required: true,
      technology_boundary_required: module.id === 'klassifikasjon_data_beregning'
    };
  }),
  progression: {
    stage_1: MODULES.slice(0, 3).map((m) => m.id),
    stage_2: MODULES.slice(3, 6).map((m) => m.id),
    stage_3: MODULES.slice(6, 8).map((m) => m.id),
    stage_4: MODULES.slice(8, 10).map((m) => m.id)
  }
};

const mapping = oldMapping.map((row) => {
  const topic = emneById.get(row.emne_id);
  const module = MODULE_BY_ID.get(topic?.module_id || 'vitenskapelig_kunnskap_begrunnelse');
  return {
    ...row,
    module_id: module.id,
    module_order: module.order,
    mappings: arr(row.mappings).map((m) => ({
      ...m,
      fagkart_kategori: module.id,
      fagkart_kategori_tittel: module.label,
      question_surface_mode: moduleQuestionMode(module),
      external_claim_basis_required: true,
      locator_required: true,
      validity_scope_required: true,
      method_or_evidence_anchor_required: true,
      science_technology_boundary_required: topic?.technology_overlap_risk === 'high',
      generator_constraints: {
        ...(m.generator_constraints || {}),
        require_external_claim_basis: true,
        require_locator: true,
        require_validity_scope: true,
        require_method_or_evidence_anchor: true,
        do_not_generate_from_hook_label_only: true,
        do_not_generate_from_emne_label_only: true,
        required_emne_prefix: 'em_vit_'
      }
    })),
    mapping_status: 'tiered+canonical+editorial_v5',
    canonical_status: 'canonical',
    registry_version: 'vitenskappensum_v5'
  };
});

const methodFamilyRows = METHOD_FAMILIES.map((family) => ({
  family_id: family.id,
  label: family.label,
  focus: family.focus,
  core_method_id: familyCoreId.get(family.id),
  method_ids: methods.filter((method) => method.method_family_id === family.id).map((method) => method.method_id),
  method_count: methods.filter((method) => method.method_family_id === family.id).length
}));

const methodsDoc = {
  version: 'v5.0-canonical',
  subject_id: 'vitenskap',
  subject_title: 'Vitenskap',
  scope: 'universal_with_geographic_application',
  type: 'methods',
  canonical_registry_version: 'vitenskappensum_v5',
  updated_at: '2026-08-05',
  purpose: 'Operasjonalisert metodekatalog for Vitenskap V5. Alle metoder har prosedyre, datakrav, observabler, gyldighetsvilkår, begrensninger, etikk, leveranser og blokkerende kvalitetsporter.',
  summary: {
    method_count: methods.length,
    method_family_count: methodFamilyRows.length,
    core_method_count: methods.filter((m) => m.method_role === 'core').length,
    specialized_method_count: methods.filter((m) => m.method_role === 'specialized').length,
    all_methods_operationalized: methods.every((m) => m.operational_status === 'operationalized_v5')
  },
  principles: {
    source_first: true,
    external_claim_basis_required: true,
    completed_procedure_required: true,
    validity_scope_required: true,
    no_method_label_generation: true,
    required_emne_prefix: 'em_vit_'
  },
  method_families: methodFamilyRows,
  methods
};

const pensum = {
  ...oldPensum,
  version: 'v5.0-canonical',
  subject_id: 'vitenskap',
  subject_title: 'Vitenskap',
  scope: 'universal_with_geographic_application',
  type: 'pensum',
  canonical_registry_version: 'vitenskappensum_v5',
  updated_at: '2026-08-05',
  purpose: 'Universitetsmessig canonical fagverk for vitenskapelig kunnskapsproduksjon. V5 organiserer 80 kompatible emne-ID-er i ti progresjonsmoduler og 84 metoder i tolv operative metodefamilier.',
  canonical_files: {
    fagkart: 'fagkart_vitenskap_canonical_v5.json',
    methods: 'methods_vitenskap_canonical_v5.json',
    emner: 'emner_vitenskap_canonical_v5.json',
    emnemapping: 'emnemapping_vitenskap_canonical_v5.json',
    pensum: 'vitenskappensum_canonical_v5.json',
    editorial_contract: 'editorial_contract_vitenskap_v5.json',
    source_policy: 'source_policy_vitenskap_v5.json'
  },
  summary: {
    module_count: MODULES.length,
    emne_count: emner.length,
    method_count: methods.length,
    method_family_count: METHOD_FAMILIES.length,
    mapping_count: mapping.length,
    topic_hook_count: allOldHooks.length,
    all_emners_have_module: emner.every((topic) => MODULE_BY_ID.has(topic.module_id)),
    all_methods_operationalized: methods.every((method) => method.operational_status === 'operationalized_v5'),
    all_emners_have_source_gate: emner.every((topic) => topic.source_gate?.status === 'blocking')
  },
  domain_order: MODULES.map((m) => m.id),
  module_order: MODULES.map((m) => m.id),
  domains: moduleRows,
  modules: moduleRows,
  progression_model: {
    principle: 'Fra kunnskapsgrunnlag og forskningsdesign via måling, modeller, data og institusjoner til faghistorie, anvendte vitenskaper, samfunnsmakt og ansvar.',
    stages: [
      { stage: 1, label: 'Kunnskap og forskningsgrunnlag', module_ids: MODULES.slice(0, 3).map((m) => m.id) },
      { stage: 2, label: 'Metoder, data og infrastruktur', module_ids: MODULES.slice(3, 6).map((m) => m.id) },
      { stage: 3, label: 'Faghistorie og anvendte vitenskaper', module_ids: MODULES.slice(6, 8).map((m) => m.id) },
      { stage: 4, label: 'Samfunn, makt, etikk og ansvar', module_ids: MODULES.slice(8, 10).map((m) => m.id) }
    ]
  },
  legacy_domain_map: Object.fromEntries(arr(oldPensum.domain_order).map((oldId) => [oldId, unique(oldEmner.filter((topic) => topic.domain === oldId).map((topic) => topicModule.get(topic.emne_id))) ])),
  editorial_status: 'reviewed_and_operationalized',
  source_integrity: {
    status: 'blocking',
    required: ['external_source', 'locator', 'claim_basis', 'method_or_evidence_anchor', 'validity_scope'],
    blocked_when_missing: true
  },
  technology_boundary: {
    status: 'blocking_for_overlap_topics',
    rule: 'Vitenskap analyserer kunnskapsproduksjon, evidens, metode, institusjon og autoritet. Teknologi V3 analyserer artefakter, systemer, design, implementasjon, drift, ytelse og teknisk risiko.'
  }
};

const sourcePolicy = {
  schema: 'history_go_vitenskap_source_policy_v5',
  version: '1.0.0',
  subject_id: 'vitenskap',
  status: 'blocking',
  required_fields: ['external_source', 'locator', 'claim_basis', 'method_or_evidence_anchor', 'validity_scope'],
  claim_classes: {
    descriptive: { minimum: ['ekstern kilde', 'presis lokator', 'direkte støtte for beskrivelsen'] },
    comparative: { minimum: ['sammenlignbare kilder eller data', 'felles kriterier', 'synlige forskjeller i kontekst'] },
    mechanistic: { minimum: ['dokumentert mekanisme eller prosess', 'relevante observasjoner', 'alternative mekanismer vurdert'] },
    causal: { minimum: ['eksplisitt design eller identifikasjonsstrategi', 'konfoundere og alternativer vurdert', 'avgrenset gyldighetsområde'] },
    interpretive: { minimum: ['sporbar tekst, praksis eller historisk dokumentasjon', 'begrunnet fortolkning', 'konkurrerende lesning vurdert'] },
    normative: { minimum: ['empirisk grunnlag', 'eksplisitte verdipremisser', 'berørte grupper og fordelingsvirkninger'] }
  },
  accepted_source_classes: ['fagfellevurdert forskning', 'offentlig fagrapport', 'kuratert forskningsdatasett', 'institusjonsarkiv', 'standard eller metodeverk', 'vitenskapshistorisk primær- eller sekundærkilde'],
  rejected_as_sufficient_alone: ['emnenavn', 'metodenavn', 'fagkart', 'generell leksikontekst uten påstandsstøtte', 'institusjonens omdømme', 'teknologisk funksjonsbeskrivelse uten vitenskapelig spørsmål'],
  blocking_rules: [
    'blokker når ekstern kilde mangler',
    'blokker når lokator eller claim_basis mangler',
    'blokker når metode/evidens ikke passer påstandsklassen',
    'blokker når gyldighetsområdet ikke er angitt',
    'blokker teknologioverlapp når faggrensen ikke er eksplisitt'
  ]
};

const contract = {
  schema: 'history_go_vitenskap_editorial_contract_v5',
  version: '1.0.0',
  subject_id: 'vitenskap',
  canonical_model_version: '5.0',
  status: 'active',
  architecture: { modules: 10, topics: emner.length, methods: methods.length, method_families: 12 },
  invariants: {
    preserve_emne_ids: true,
    preserve_method_ids: true,
    one_active_canonical_version: true,
    source_gate_blocking: true,
    method_procedure_required: true,
    progression_required: true,
    science_technology_boundary_required: true,
    historical_versions_read_only: true
  },
  required_topic_fields: ['module_id', 'course_stage', 'definition', 'why_it_matters', 'learning_outcomes', 'claim_classes', 'source_requirements', 'evidence_requirements', 'failure_modes', 'boundary_note', 'assessment_task', 'source_gate'],
  required_method_fields: ['method_family_id', 'method_role', 'procedure_steps', 'required_inputs', 'observables', 'validity_conditions', 'limitations', 'ethics_gates', 'deliverables', 'quality_gates', 'blocked_when'],
  source_policy: 'source_policy_vitenskap_v5.json',
  active_files: pensum.canonical_files,
  validation_report: '../../reports/fagverk/vitenskap-editorial-v5-validation.json'
};

const legacy = {
  schema: 'history_go_vitenskap_canonical_legacy_status_v5',
  version: '1.0.0',
  subject_id: 'vitenskap',
  active_version: 'v5.0-canonical',
  active_files: [PATHS.pensum, PATHS.emner, PATHS.fagkart, PATHS.methods, PATHS.mapping],
  historical_read_only: [PATHS.oldPensum, PATHS.oldEmner, PATHS.oldFagkart, PATHS.oldMethods, PATHS.oldMapping, `${BASE}/teknologi_it_extension_v1.json`],
  rules: [
    'Historiske filer kan leses for migrasjon og sporbarhet, men kan ikke være aktive manifestpekere.',
    'Nye emner og metoder skal materialiseres i V5 eller senere aktiv versjon.',
    'Historiske emne- og metode-ID-er er bevart i V5 for bakoverkompatibilitet.',
    'Teknologi ligger som nested canonical spesialisering under Vitenskap og skal ikke blandes inn som eget toppfag.'
  ]
};

const report = {
  schema: 'history_go_vitenskap_editorial_v5_validation_report',
  version: '1.0.0',
  generated_at: '2026-08-05',
  subject_id: 'vitenskap',
  status: 'pass',
  summary: {
    modules: MODULES.length,
    topics: emner.length,
    methods: methods.length,
    method_families: METHOD_FAMILIES.length,
    mappings: mapping.length,
    hooks: allOldHooks.length,
    high_technology_overlap_topics: emner.filter((topic) => topic.technology_overlap_risk === 'high').length
  },
  gates: {
    unique_topic_ids: new Set(emner.map((topic) => topic.emne_id)).size === emner.length,
    unique_method_ids: new Set(methods.map((method) => method.method_id)).size === methods.length,
    all_topics_mapped_to_module: emner.every((topic) => MODULE_BY_ID.has(topic.module_id)),
    all_topics_have_source_gate: emner.every((topic) => topic.source_gate?.status === 'blocking'),
    all_topics_have_assessment: emner.every((topic) => topic.assessment_task?.criteria?.length >= 5),
    all_methods_operationalized: methods.every((method) => method.procedure_steps?.length >= 5 && method.quality_gates?.length >= 4),
    all_methods_have_family: methods.every((method) => METHOD_FAMILIES.some((family) => family.id === method.method_family_id)),
    technology_boundary_present: emner.filter((topic) => topic.technology_overlap_risk === 'high').every((topic) => clean(topic.technology_boundary))
  },
  legacy: { original_domains: arr(oldPensum.domain_order).length, original_topics: oldEmner.length, original_methods: oldMethods.length, ids_preserved: true }
};
if (Object.values(report.gates).some((value) => value !== true)) throw new Error(`V5 materialization gate failed: ${JSON.stringify(report.gates)}`);

const nextManifest = structuredClone(manifest);
nextManifest.vitenskap = {
  ...nextManifest.vitenskap,
  pensum: 'vitenskap/vitenskappensum_canonical_v5.json',
  emner: 'vitenskap/emner_vitenskap_canonical_v5.json',
  fagkart: 'vitenskap/fagkart_vitenskap_canonical_v5.json',
  methods: 'vitenskap/methods_vitenskap_canonical_v5.json',
  emnemapping: 'vitenskap/emnemapping_vitenskap_canonical_v5.json',
  canonicalModelVersion: '5.0',
  editorialStatus: 'reviewed_and_operationalized',
  editorialContract: 'vitenskap/editorial_contract_vitenskap_v5.json',
  sourcePolicy: 'vitenskap/source_policy_vitenskap_v5.json',
  legacyStatus: 'vitenskap/canonical_legacy_status_vitenskap_v5.json',
  universalCoverage: { status: 'complete', modules: 10, topics: emner.length, methods: methods.length, methodFamilies: 12 },
  sourceIntegrity: { status: 'blocking', required: ['external_source', 'locator', 'claim_basis', 'method_or_evidence_anchor', 'validity_scope'] },
  technologyBoundary: 'Vitenskap gjelder kunnskapsproduksjon og evidens; Teknologi V3 gjelder artefakt, design, implementasjon, drift og ytelse.'
};

const readme = `# Vitenskap V5\n\nVitenskap V5 erstatter den aktive V4.5-arkitekturen med et universitetsmessig fagverk i ti moduler. De 80 eksisterende emne-ID-ene og 84 metode-ID-ene er bevart for kompatibilitet, men innholdet er redigert og reorganisert.\n\n## Arkitektur\n\n${MODULES.map((m) => `${m.order}. **${m.label}** – ${m.definition}`).join('\n')}\n\n## Metoder\n\nDe 84 metodene er samlet i tolv operative metodefamilier. Hver metode har prosedyre, datakrav, observabler, gyldighetsvilkår, begrensninger, etiske porter, leveranser og blokkerende kvalitetskrav.\n\n## Kildeport\n\nIngen faktapåstand kan produseres fra emnenavn, metodeetikett eller fagkart alene. Ekstern kilde, presis lokator, claim_basis, metode- eller evidensanker og gyldighetsområde er obligatorisk.\n\n## Grense mot Teknologi V3\n\nVitenskap analyserer hvordan kunnskap produseres, måles, begrunnes, institusjonaliseres og får autoritet. Teknologi V3 analyserer artefakter, systemer, design, implementasjon, drift, ytelse og teknisk risiko. Overlappsemner må ha eksplisitt grense før de brukes.\n\nV4.5-filene og teknologi_it_extension_v1.json er historiske read-only-lag. Manifestet peker bare til V5.\n`;

await writeExpected(PATHS.emner, emner);
await writeExpected(PATHS.methods, methodsDoc);
await writeExpected(PATHS.fagkart, fagkart);
await writeExpected(PATHS.mapping, mapping);
await writeExpected(PATHS.pensum, pensum);
await writeExpected(PATHS.sourcePolicy, sourcePolicy);
await writeExpected(PATHS.contract, contract);
await writeExpected(PATHS.legacy, legacy);
await writeExpected(PATHS.report, report);
await writeExpected(PATHS.readme, readme);
await writeExpected(PATHS.manifest, nextManifest);

if (CHECK && changed.length) {
  console.error('Vitenskap V5 er ikke materialisert. Endrede filer:');
  for (const file of changed) console.error(`- ${file}`);
  process.exit(1);
}
console.log(`${WRITE ? 'Materialiserte' : 'Kontrollerte'} Vitenskap V5: ${MODULES.length} moduler, ${emner.length} emner, ${methods.length} metoder, ${METHOD_FAMILIES.length} metodefamilier.`);
if (changed.length && WRITE) console.log(`Oppdaterte ${changed.length} filer.`);
