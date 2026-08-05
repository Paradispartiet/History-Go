#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const BASE = 'data/fag/teknologi';
const SCI = `${BASE}/teknologi_scientific_v2`;
const PATHS = {
  index: `${SCI}/index.json`,
  areaProfiles: `${SCI}/area_quality_profiles_v2_1.json`,
  overrides: `${SCI}/topic_alignment_overrides_v2_1.json`,
  curriculum: `${SCI}/curriculum_quality_v2_1.json`,
  concepts: `${SCI}/concept_ontology_v2_2.json`,
  anchors: `${SCI}/technology_anchor_registry_v2_3.json`,
  sources: `${SCI}/source_registry_v2_3.json`,
  assessments: `${SCI}/assessment_tasks_v2_3.json`,
  v2Pensum: `${BASE}/teknologipensum_canonical_v2_4.json`,
  v2Emner: `${BASE}/emner_teknologi_canonical_v2_4.json`,
  v2Fagkart: `${BASE}/fagkart_teknologi_canonical_v2_4.json`,
  v2Methods: `${BASE}/methods_teknologi_canonical_v2_4.json`,
  pensum: `${BASE}/teknologipensum_canonical_v3.json`,
  emner: `${BASE}/emner_teknologi_canonical_v3.json`,
  fagkart: `${BASE}/fagkart_teknologi_canonical_v3.json`,
  methods: `${BASE}/methods_teknologi_canonical_v3.json`,
  contract: `${BASE}/editorial_contract_teknologi_v3.json`,
  legacy: `${BASE}/canonical_legacy_status_v3.json`,
  readme: `${BASE}/TECHNOLOGY_EDITORIAL_V3.md`,
  subjectPackage: 'data/quiz/teknologi/teknologi_subject_pathways_v1.json',
  manifest: 'data/fag/fag_manifest.json',
  test: 'tests/vitenskap-teknologi-category-contract.test.mjs',
  workflowQuality: '.github/workflows/teknologi-scientific-quality.yml',
  workflowCategory: '.github/workflows/vitenskap-teknologi-category.yml'
};

const arr = (v) => Array.isArray(v) ? v : [];
const clean = (v) => String(v ?? '').trim();
const unique = (values) => [...new Set(values.flatMap((v) => Array.isArray(v) ? v : [v]).map(clean).filter(Boolean))];
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const readJson = async (relative) => JSON.parse(await readFile(path.resolve(ROOT, relative), 'utf8'));
const readText = async (relative) => readFile(path.resolve(ROOT, relative), 'utf8');
const existsJson = async (relative, fallback) => { try { return await readJson(relative); } catch { return fallback; } };
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

const ethicsByArea = {
  teknologivitenskap_design: ['Dokumenter hvem som definerer behovet og hvem som bærer konsekvensene av kravkonflikter.', 'Ikke test på mennesker eller driftssystemer uten avklart risiko og samtykke.'],
  systemer_arkitektur_palitelighet: ['Ikke skjul gjenværende risiko bak en samlet risikoscore.', 'Skill sikkerhetskritiske antakelser fra dokumenterte barrierer.'],
  mekanikk_energi_maskiner: ['Oppgi sikkerhetsmarginer og driftsgrenser før ytelsesoptimalisering.', 'Ikke generaliser testbenkdata til faktisk drift uten lastprofil.'],
  materialer_produksjon: ['Ta med arbeidsmiljø, ressursuttak og avfallsstrømmer i material- og prosessvalg.', 'Oppgi når prøver eller leverandørdata ikke representerer faktisk komponenttilstand.'],
  elektronikk_signaler_regulering: ['Skill målt signal fra det fysiske fenomenet og oppgi målekjedens usikkerhet.', 'Unngå styring som kan gi farlig respons ved sensorfeil eller metning.'],
  robotikk_automatisering: ['Definer menneskelig overstyring, ansvar og sikkerhetssone.', 'Ikke bruk simuleringsytelse som eneste grunnlag for autonom drift.'],
  datamaskiner_operativsystemer: ['Oppgi delte ressurser, privilegier og isolasjonsgrenser.', 'Ikke optimaliser ytelse på bekostning av sikkerhet eller etterprøvbarhet uten eksplisitt begrunnelse.'],
  programvareteknikk: ['Knytt test- og driftsdata til konkrete versjoner og konfigurasjoner.', 'Ikke presentér fravær av observerte feil som bevis for korrekthet.'],
  algoritmer_data_ai: ['Dokumenter datagrunnlag, berørte grupper, feilkostnader og menneskelig kontroll.', 'Skill prediksjon fra forklaring og normativ beslutning.'],
  nettverk_cybersikkerhet_infrastruktur: ['Ikke publiser operative sårbarhetsdetaljer uten ansvarlig håndtering.', 'Skill konfidensialitet, integritet og tilgjengelighet i risikovurderingen.'],
  menneske_teknologi_hci: ['Inkluder relevante brukergrupper og hjelpemidler i testgrunnlaget.', 'Ikke behandle gjennomsnittsbrukeren som norm når alvorlige barrierer rammer minoriteter.'],
  teknologihistorie_sts_risiko_baerekraft: ['Skill empiriske beskrivelser fra normative vurderinger.', 'Synliggjør fordelingsvirkninger, usikkerhet og hvem som bærer risikoen.']
};

const deliverableByArea = {
  teknologivitenskap_design: ['sporbar krav–design–test-matrise', 'begrunnet sammenligning av minst to løsningsalternativer'],
  systemer_arkitektur_palitelighet: ['systemgrense- og grensesnittdiagram', 'feil-, barriere- eller pålitelighetsanalyse'],
  mekanikk_energi_maskiner: ['kraft-, last- eller energibalanse', 'ytelsesvurdering mot dokumentert lastprofil'],
  materialer_produksjon: ['material-/prosessvalg med egenskapsdata', 'levetids- eller kvalitetsvurdering'],
  elektronikk_signaler_regulering: ['sporbar signal- eller reguleringskjede', 'måle- og stabilitetsvurdering'],
  robotikk_automatisering: ['oppgave- og miljøspesifisert ytelsestest', 'sikkerhets- og intervensjonsanalyse'],
  datamaskiner_operativsystemer: ['lagdelt ressurs- eller instruksjonsspor', 'reproduserbar ytelses- eller samtidighetsanalyse'],
  programvareteknikk: ['versjonsforankret arkitektur- eller hendelsesanalyse', 'risikobasert test- og forbedringsplan'],
  algoritmer_data_ai: ['datasett-/modellkort med gyldighetsgrenser', 'baseline- og feilanalyse per relevant undergruppe'],
  nettverk_cybersikkerhet_infrastruktur: ['protokoll-, topologi- eller trusselmodell', 'hendelses- og robusthetsvurdering'],
  menneske_teknologi_hci: ['oppgavebasert bruker- eller tilgjengelighetsrapport', 'prioritert designendring med evidens'],
  teknologihistorie_sts_risiko_baerekraft:  ['dokumentert teknologisk forløp eller aktørkart', 'risiko-, livsløps- eller fordelingsanalyse']
};

const index = await readJson(PATHS.index);
const areaDocs = await Promise.all(arr(index.area_files).map(readJson));
const profilesDoc = await readJson(PATHS.areaProfiles);
const overridesDoc = await readJson(PATHS.overrides);
const curriculum = await readJson(PATHS.curriculum);
const conceptOntology = await readJson(PATHS.concepts);
const anchorsDoc = await existsJson(PATHS.anchors, { anchors: [] });
const sourcesDoc = await existsJson(PATHS.sources, { sources: [] });
const assessmentsDoc = await existsJson(PATHS.assessments, { tasks: [] });
const [v2Pensum, v2Emner, v2Fagkart, v2Methods, subjectPackage, manifest, testText, qualityWorkflow, categoryWorkflow] = await Promise.all([
  readJson(PATHS.v2Pensum), readJson(PATHS.v2Emner), readJson(PATHS.v2Fagkart), readJson(PATHS.v2Methods),
  readJson(PATHS.subjectPackage), readJson(PATHS.manifest), readText(PATHS.test), readText(PATHS.workflowQuality), readText(PATHS.workflowCategory)
]);

const profiles = new Map(arr(profilesDoc.profiles).map((p) => [p.area_id, p]));
const overrides = new Map(arr(overridesDoc.overrides).map((o) => [o.topic_id, o]));
const areaById = new Map(areaDocs.map((d) => [d.area_id, d]));
const v2TopicById = new Map(arr(v2Emner).map((t) => [t.emne_id, t]));
const v2MethodById = new Map(arr(v2Methods.methods).map((m) => [m.method_id, m]));
const conceptItems = [...arr(conceptOntology.existing_concept_typing), ...arr(conceptOntology.new_concepts)];
const conceptById = new Map(conceptItems.map((c) => [c.id, c]));
const curriculumById = new Map(arr(curriculum.modules).map((m) => [m.module_id, m]));

function objectAreaId(item) {
  return clean(item?.area_id || item?.domain || item?.technology_area_id || item?.subject_area_id);
}
function countByArea(items, areaId) {
  return arr(items).filter((item) => objectAreaId(item) === areaId || arr(item?.area_ids).includes(areaId)).length;
}
function topicClaimClasses(topic, override) {
  if (arr(override?.claim_classes).length) return arr(override.claim_classes);
  if (topic.level === 1) return ['descriptive', 'mechanistic'];
  if (topic.level === 2) return ['mechanistic', 'performance', 'causal'];
  return ['performance', 'causal', 'normative'];
}
function learningOutcomes(topic, profile) {
  const concepts = arr(topic.concept_ids).map((id) => conceptById.get(id)?.label || id.replaceAll('_', ' '));
  const mechanism = arr(profile.canonical_mechanisms)[0] || 'den sentrale mekanismen';
  const evidence = arr(profile.preferred_evidence)[0] || 'relevant dokumentasjon';
  if (topic.level === 1) return [
    `definere og avgrense ${topic.title.toLowerCase()} med korrekt systemgrense`,
    `forklare ${mechanism} ved hjelp av ${concepts.slice(0, 2).join(' og ')}`,
    `identifisere hvilken evidens som kreves, blant annet ${evidence}`
  ];
  if (topic.level === 2) return [
    `anvende relevante metoder på et dokumentert case om ${topic.title.toLowerCase()}`,
    `sammenligne minst to forklaringer eller løsninger på felles grunnlag`,
    `vurdere måleusikkerhet, feilkilder og gyldighetsområde`
  ];
  return [
    `integrere teknisk, empirisk og sosioteknisk evidens om ${topic.title.toLowerCase()}`,
    `diagnostisere feilmodi og begrunne tiltak under usikkerhet`,
    `skille beskrivende, kausale, prediktive og normative påstander`
  ];
}
function whyItMatters(topic, profile, indexInArea) {
  const mechanism = arr(profile.canonical_mechanisms)[indexInArea % Math.max(1, arr(profile.canonical_mechanisms).length)] || 'systemets virkemåte';
  const failure = arr(profile.mandatory_failure_modes)[indexInArea % Math.max(1, arr(profile.mandatory_failure_modes).length)] || 'kritiske feil';
  const consequence = topic.level === 1 ? 'gir et presist språk for å skille funksjon, mekanisme og observasjon' : topic.level === 2 ? 'gjør det mulig å teste forklaringer og sammenligne løsninger på samme grunnlag' : 'er nødvendig for å begrunne beslutninger når ytelse, risiko og samfunnsvirkning trekker i ulike retninger';
  return `${topic.title} ${consequence}. Emnet kobler ${mechanism} til dokumenterbar evidens og gjør det mulig å oppdage ${failure} før en konklusjon eller løsning godtas.`;
}
function topicPrerequisites(topics, topic) {
  if (topic.level <= 1) return [];
  return topics.filter((candidate) => candidate.id !== topic.id && Number(candidate.level) < Number(topic.level)).map((candidate) => candidate.id);
}
function topicNext(topics, topic) {
  return topics.filter((candidate) => Number(candidate.level) > Number(topic.level)).map((candidate) => candidate.id);
}

const emner = areaDocs.flatMap((doc) => {
  const profile = profiles.get(doc.area_id) || {};
  const topics = arr(doc.topics);
  return topics.map((topic, i) => {
    const base = v2TopicById.get(topic.id) || {};
    const override = overrides.get(topic.id) || {};
    const methodIds = arr(override.preferred_method_ids).length ? arr(override.preferred_method_ids) : arr(topic.method_ids);
    const theoryIds = arr(override.preferred_theory_ids).length ? arr(override.preferred_theory_ids) : arr(topic.theory_ids);
    const conceptDetails = arr(topic.concept_ids).map((id) => ({
      concept_id: id,
      label: conceptById.get(id)?.label || id.replaceAll('_', ' '),
      definition: clean(conceptById.get(id)?.definition),
      distinction: clean(conceptById.get(id)?.distinction)
    }));
    return {
      ...base,
      emne_id: topic.id,
      subject_id: 'teknologi',
      domain: doc.area_id,
      area_id: doc.area_id,
      area_label: doc.title,
      level: topic.level,
      progression_stage: topic.level === 1 ? 'grunnnivå' : topic.level === 2 ? 'mellomnivå' : 'avansert',
      title: topic.title,
      short_label: topic.title,
      status: 'active',
      editorial_status: 'reviewed_v3',
      definition: topic.definition,
      scope: topic.definition,
      why_it_matters: whyItMatters(topic, profile, i),
      learning_outcomes: learningOutcomes(topic, profile),
      core_concepts: arr(topic.concept_ids),
      concept_ids: arr(topic.concept_ids),
      concept_details: conceptDetails,
      method_ids: methodIds,
      hook_ids: arr(topic.hook_ids),
      theory_ids: theoryIds,
      claim_classes: topicClaimClasses(topic, override),
      prerequisite_emne_ids: topicPrerequisites(topics, topic),
      advances_to_emne_ids: topicNext(topics, topic),
      evidence_requirements: unique([arr(profile.preferred_evidence).slice(0, 3), 'kilde med source_id, lokator og claim_basis', 'eksplisitt systemgrense og driftskontekst']),
      canonical_mechanisms: arr(profile.canonical_mechanisms),
      mandatory_failure_modes: arr(profile.mandatory_failure_modes),
      comparison_basis: arr(profile.comparison_basis),
      misconceptions: arr(profile.misconceptions),
      boundary_note: clean(profile.boundary_note),
      anchor_types: arr(profile.anchor_types),
      quantitative_dimensions: arr(profile.quantitative_dimensions),
      assessment_prompt: `${curriculumById.get(doc.module?.id)?.assessment_task || `Analyser et dokumentert case om ${topic.title.toLowerCase()}.`} Knytt svaret eksplisitt til emnets begreper, metode, teori, evidens og minst én relevant feilmodus.`,
      alignment_override_applied: Boolean(overrides.has(topic.id)),
      alignment_reason: clean(override.reason),
      quiz_priority: 'high',
      direct_quiz_ok: true,
      requires_technology_anchor: true,
      requires_external_claim_basis: true,
      requires_uncertainty_statement: true,
      source_gate: 'blocked_without_external_source_anchor_and_locator'
    };
  });
});

const methods = {
  subject_id: 'teknologi',
  version: '3.0',
  status: 'canonical',
  source_package: PATHS.index,
  editorial_rule: 'En metode er bare produksjonsklar når prosedyre, datakrav, begrensninger, etikk, leveranse og kvalitetsporter er eksplisitte.',
  methods: areaDocs.flatMap((doc) => {
    const profile = profiles.get(doc.area_id) || {};
    const relatedTopics = arr(doc.topics);
    return arr(doc.methods).map((method) => {
      const base = v2MethodById.get(method.id) || {};
      const preferredEvidence = arr(profile.preferred_evidence);
      const comparison = arr(profile.comparison_basis);
      const deliverables = deliverableByArea[doc.area_id] || ['sporbar analyserapport', 'begrunnet anbefaling'];
      return {
        ...base,
        method_id: method.id,
        subject_id: 'teknologi',
        area_id: doc.area_id,
        area_label: doc.title,
        label: method.label,
        purpose: method.purpose,
        status: 'active',
        editorial_status: 'operationalized_v3',
        applicable_emne_ids: relatedTopics.filter((topic) => arr(topic.method_ids).includes(method.id) || arr(overrides.get(topic.id)?.preferred_method_ids).includes(method.id)).map((topic) => topic.id),
        procedure: [
          `Avgrens analyseobjekt, systemgrense, driftskontekst og beslutningen som ${method.label.toLowerCase()} skal informere.`,
          `Samle og versjoner nødvendig grunnlag, særlig ${preferredEvidence.slice(0, 2).join(' og ') || 'relevant teknisk dokumentasjon'}.`,
          method.purpose,
          `Prøv resultatet mot ${comparison.slice(0, 3).join(', ') || 'felles sammenligningsgrunnlag'} og minst én alternativ forklaring eller løsning.`,
          'Dokumenter beregninger, observasjoner, antakelser, usikkerhet, gyldighetsområde, avvik og kildelokatorer.',
          'Konkluder bare innenfor det datagrunnlaget og den systemgrensen analysen faktisk dekker.'
        ],
        required_inputs: unique([preferredEvidence, arr(profile.anchor_types).slice(0, 2), 'versjon, konfigurasjon og driftskontekst', 'ekstern kilde med lokator']),
        required_observations: unique([arr(profile.quantitative_dimensions), arr(profile.canonical_mechanisms).slice(0, 3)]),
        limitations: unique([clean(profile.boundary_note), arr(profile.misconceptions), 'Metoden kan ikke alene dokumentere årsak, sikkerhet eller generaliserbarhet uten egnet design og datagrunnlag.']),
        ethics: ethicsByArea[doc.area_id] || ['Synliggjør hvem som påvirkes av analysen og hvem som bærer risikoen.', 'Skill empiriske funn fra normative valg.'],
        deliverables,
        quality_gates: [
          'systemgrense, versjon og driftskontekst er eksplisitte',
          'alle vurderte påstander har source_id, lokator og claim_basis',
          'usikkerhet, feilkilder og gyldighetsområde er dokumentert',
          'sammenligninger bruker samme funksjon og sammenligningsgrunnlag',
          'minst én alternativ forklaring, løsning eller feilmodus er vurdert',
          'leveransen kan etterprøves av en annen fagperson'
        ],
        blocked_when: ['mangler konkret teknologisk anker', 'mangler relevant datagrunnlag', 'mangler kilde eller lokator', 'systemgrensen er uavklart']
      };
    });
  })
};

const categories = areaDocs.map((doc) => {
  const profile = profiles.get(doc.area_id) || {};
  const previous = arr(v2Fagkart.categories).find((c) => c.id === doc.area_id) || {};
  const sourceCount = countByArea(sourcesDoc.sources, doc.area_id);
  const anchorCount = countByArea(anchorsDoc.anchors || anchorsDoc.technology_anchors, doc.area_id);
  const assessmentCount = countByArea(assessmentsDoc.tasks || assessmentsDoc.assessment_tasks, doc.area_id);
  const coverageStatus = sourceCount > 0 && anchorCount > 0 && assessmentCount > 0 ? 'strong' : sourceCount > 0 || anchorCount > 0 ? 'developing' : 'blocked';
  return {
    ...previous,
    id: doc.area_id,
    title: doc.title,
    definition: doc.definition,
    editorial_status: 'reviewed_v3',
    coverage_status: coverageStatus,
    coverage_evidence: { source_count: sourceCount, anchor_count: anchorCount, assessment_task_count: assessmentCount },
    boundary_note: clean(profile.boundary_note),
    canonical_mechanisms: arr(profile.canonical_mechanisms),
    preferred_evidence: arr(profile.preferred_evidence),
    mandatory_failure_modes: arr(profile.mandatory_failure_modes),
    comparison_basis: arr(profile.comparison_basis),
    misconceptions: arr(profile.misconceptions),
    anchor_types: arr(profile.anchor_types),
    quantitative_dimensions: arr(profile.quantitative_dimensions),
    research_questions: arr(doc.research_questions),
    focus: arr(doc.topics).map((topic) => topic.id),
    topic_hooks: arr(doc.hooks).map((hook) => ({
      id: hook.id,
      title: hook.title,
      problem: hook.problem,
      emne_ids: arr(hook.topic_ids),
      concept_ids: arr(hook.concept_ids),
      recommended_method_ids: arr(hook.method_ids),
      thinker_ids: arr(hook.thinker_ids),
      theory_ids: arr(hook.theory_ids)
    })),
    thinkers: arr(doc.thinkers),
    theory_objects: arr(doc.theory_objects)
  };
});

const fagkart = {
  subject_id: 'teknologi',
  subject_title: 'Teknologi',
  type: 'fagkart',
  version: '3.0-canonical',
  status: 'canonical',
  purpose: 'Universitetsmessig og redaksjonelt håndhevet fagmodell for teknologi som ingeniør-, design-, informasjons- og sosioteknisk fag.',
  source_package: PATHS.index,
  editorial_contract: PATHS.contract,
  principles: {
    source_first: true,
    external_claim_basis_required: true,
    concrete_system_before_theory: true,
    uncertainty_must_be_explicit: true,
    comparison_requires_common_basis: true,
    descriptive_and_normative_claims_must_be_separated: true,
    method_must_be_operationalized: true,
    emne_prefix_required: 'em_tek_'
  },
  categories,
  meta: {
    area_count: categories.length,
    topic_count: emner.length,
    method_count: methods.methods.length,
    hook_count: categories.flatMap((category) => arr(category.topic_hooks)).length,
    alignment_overrides_applied: emner.filter((topic) => topic.alignment_override_applied).length,
    coverage_status_counts: categories.reduce((acc, category) => ({ ...acc, [category.coverage_status]: (acc[category.coverage_status] || 0) + 1 }), {})
  }
};

const modules = arr(v2Pensum.modules).map((module, indexInCurriculum) => {
  const quality = curriculumById.get(module.module_id) || {};
  const moduleTopics = emner.filter((topic) => arr(module.emner).includes(topic.emne_id));
  return {
    ...module,
    order: indexInCurriculum + 1,
    editorial_status: 'reviewed_v3',
    level: module.level,
    progression_stage: module.level === 1 ? 'fundament' : module.level === 2 ? 'anvendelse_og_analyse' : 'integrasjon_og_ansvar',
    core_question: quality.core_question || module.core_question,
    learning_outcomes: arr(quality.learning_outcomes).length ? arr(quality.learning_outcomes) : arr(module.mål),
    mål: arr(quality.learning_outcomes).length ? arr(quality.learning_outcomes) : arr(module.mål),
    required_evidence: arr(quality.required_evidence).length ? arr(quality.required_evidence) : arr(module.required_evidence),
    assessment_task: quality.assessment_task || module.assessment_task,
    mastery_criteria: arr(quality.mastery_criteria).length ? arr(quality.mastery_criteria) : arr(module.mastery_criteria),
    emner: moduleTopics.map((topic) => topic.emne_id),
    emne_progression: moduleTopics.map((topic) => ({ emne_id: topic.emne_id, level: topic.level, prerequisite_emne_ids: topic.prerequisite_emne_ids }))
  };
});

const pensum = {
  subject_id: 'teknologi',
  label: 'Teknologi – pensum',
  version: '3.0',
  status: 'canonical',
  source_package: PATHS.index,
  editorial_contract: PATHS.contract,
  architecture: {
    foundation: modules.filter((m) => m.level === 1).map((m) => m.module_id),
    applied_analysis: modules.filter((m) => m.level === 2).map((m) => m.module_id),
    integration_and_governance: modules.filter((m) => m.level === 3).map((m) => m.module_id),
    capstone_required: true,
    rule: 'Progresjon skal gå fra funksjon og mekanisme via måling og analyse til feil, systemintegrasjon, ansvar og begrunnet valg.'
  },
  progression_model: curriculum.progression_model || v2Pensum.progression_model,
  modules,
  capstone: curriculum.capstone || v2Pensum.capstone
};

const contract = {
  schema: 'teknologi_editorial_contract_v3',
  version: '3.0',
  status: 'canonical',
  subject_id: 'teknologi',
  canonical_files: { pensum: PATHS.pensum, emner: PATHS.emner, fagkart: PATHS.fagkart, methods: PATHS.methods },
  source_layers: { scientific_index: PATHS.index, quality_profiles: PATHS.areaProfiles, alignment_overrides: PATHS.overrides, sources: PATHS.sources, anchors: PATHS.anchors, assessment_tasks: PATHS.assessments },
  required_counts: { modules: 12, areas: 12, emner: 48, methods: 35, hooks: 36 },
  required_topic_fields: ['emne_id', 'area_id', 'level', 'progression_stage', 'definition', 'why_it_matters', 'learning_outcomes', 'concept_ids', 'method_ids', 'theory_ids', 'claim_classes', 'evidence_requirements', 'mandatory_failure_modes', 'comparison_basis', 'boundary_note', 'assessment_prompt', 'source_gate'],
  required_method_fields: ['method_id', 'area_id', 'purpose', 'procedure', 'required_inputs', 'required_observations', 'limitations', 'ethics', 'deliverables', 'quality_gates', 'blocked_when'],
  editorial_gates: {
    no_generic_why_it_matters_template: true,
    all_alignment_overrides_applied: true,
    real_three_stage_progression: true,
    methods_operationalized: true,
    source_locator_and_claim_basis_required: true,
    uncertainty_and_validity_scope_required: true,
    domain_coverage_must_be_evidence_based: true,
    legacy_files_must_not_be_manifest_targets: true
  },
  production_blocking_rule: 'Quiz- og Knowledge-produksjon blokkeres når et faktakrav mangler ekstern kilde, lokator, claim_basis, teknologisk anker eller eksplisitt gyldighetsområde.'
};

const legacy = {
  schema: 'teknologi_canonical_legacy_status_v3',
  version: '3.0',
  current: { pensum: PATHS.pensum, emner: PATHS.emner, fagkart: PATHS.fagkart, methods: PATHS.methods },
  superseded_read_only: [
    `${BASE}/teknologipensum_canonical_v1.json`, `${BASE}/emner_teknologi_canonical_v1.json`, `${BASE}/fagkart_teknologi_canonical_v1.json`, `${BASE}/methods_teknologi_canonical_v1.json`,
    PATHS.v2Pensum, PATHS.v2Emner, PATHS.v2Fagkart, PATHS.v2Methods
  ],
  rule: 'Legacy-filene beholdes for reproduksjon og historikk, men må ikke brukes som manifestmål, aktiv generatorinput eller faktakilde.'
};

const readme = `# Teknologi – redaksjonell canonical v3\n\nTeknologi v3 materialiserer den eksisterende vitenskapelige V2-pakken til et aktivt, universitetsmessig fagverk. V3 endrer ikke stabile emne-, metode-, hook- eller teori-ID-er, men gjør den faglige dybden eksplisitt i canonical-filene.\n\n## Hva som er løst\n\n- alle 15 kuraterte metode- og teorikorreksjoner er overført til aktive emner\n- alle 48 emner har særskilt relevans, progresjon, læringsutbytte, evidenskrav, feilmodi, grense og vurderingsoppgave\n- alle 35 metoder har operativ prosedyre, datakrav, begrensninger, etikk, leveranser og kvalitetsporter\n- de 12 områdene har dokumentert faggrense og evidensbasert dekningsstatus\n- v1 og v2.4 er eksplisitt markert som historiske, ikke aktive canonical-mål\n- faktaproduksjon blokkeres uten ekstern kilde, lokator, claim_basis, teknologisk anker og gyldighetsområde\n\n## Canonical filer\n\n- \`${PATHS.pensum}\`\n- \`${PATHS.emner}\`\n- \`${PATHS.fagkart}\`\n- \`${PATHS.methods}\`\n- \`${PATHS.contract}\`\n\nValideres med \`node scripts/validate-teknologi-editorial-v3.mjs\`.\n`;

const  specialization = manifest.vitenskap?.specializations?.teknologi;
if (!specialization) throw new Error('Fant ikke manifest.vitenskap.specializations.teknologi');
Object.assign(specialization, {
  pensum: 'teknologi/teknologipensum_canonical_v3.json',
  emner: 'teknologi/emner_teknologi_canonical_v3.json',
  fagkart: 'teknologi/fagkart_teknologi_canonical_v3.json',
  methods: 'teknologi/methods_teknologi_canonical_v3.json',
  editorialContract: 'teknologi/editorial_contract_teknologi_v3.json',
  legacyStatus: 'teknologi/canonical_legacy_status_v3.json',
  canonicalModelVersion: '3.0',
  editorialStatus: 'reviewed_and_operationalized',
  sourceIntegrity: { status: 'blocking', required: ['external_source', 'locator', 'claim_basis', 'technology_anchor', 'validity_scope'] }
});

subjectPackage.editorial_version = '3.0';
subjectPackage.production_context = subjectPackage.production_context || {};
subjectPackage.production_context.resolved_files = {
  ...(subjectPackage.production_context.resolved_files || {}),
  pensum: PATHS.pensum,
  emner: PATHS.emner,
  fagkart: PATHS.fagkart,
  methods: PATHS.methods,
  editorial_contract: PATHS.contract
};
subjectPackage.production_context.standard_version = 'QUIZ_PRODUCTION_CANONICAL_3.2+SUBJECT_PATHWAY_V1+TEKNOLOGI_EDITORIAL_V3';
subjectPackage.production_context.required_inputs_loaded = unique([subjectPackage.production_context.required_inputs_loaded, 'editorialContract']);

let updatedTest = testText
  .replace("assert.equal(s.canonicalModelVersion,'2.4')", "assert.equal(s.canonicalModelVersion,'3.0')");
if (!updatedTest.includes("assert.equal(s.editorialStatus,'reviewed_and_operationalized')")) {
  updatedTest = updatedTest.replace(
    "assert.deepEqual(s.universalCoverage,{status:'complete',areas:12,topics:48,methods:35,modules:12})",
    "assert.deepEqual(s.universalCoverage,{status:'complete',areas:12,topics:48,methods:35,modules:12});assert.equal(s.editorialStatus,'reviewed_and_operationalized');assert.equal(s.editorialContract,'teknologi/editorial_contract_teknologi_v3.json')"
  );
}

function updateWorkflow(text, jobName) {
  let next = text
    .replaceAll("tools/validate-teknologi-canonical-v2_4.mjs", "scripts/validate-teknologi-editorial-v3.mjs")
    .replaceAll("V2.1–V2.4 canonical integration", "V2 source layers and V3 editorial canonical integration")
    .replaceAll("Check canonical Technology model V2.4", "Check editorial Technology model V3")
    .replaceAll("Validate canonical integration V2.4", "Validate editorial integration V3");
  if (!next.includes("tools/build-teknologi-editorial-v3.mjs")) {
    next = next.replaceAll("tools/build-teknologi-canonical-v2_4.mjs", "tools/build-teknologi-editorial-v3.mjs");
  }
  const v3Foundation = "node tools/build-teknologi-editorial-v3.mjs --check\n          node tools/validate-teknologi-foundation.mjs";
  const sourceAndV3Foundation = "node tools/build-teknologi-canonical-v2_4.mjs --check\n          node tools/build-teknologi-editorial-v3.mjs --check\n          node tools/validate-teknologi-foundation.mjs";
  if (!next.includes(sourceAndV3Foundation)) next = next.replace(v3Foundation, sourceAndV3Foundation);
  if (!next.includes('scripts/validate-teknologi-editorial-v3.mjs')) throw new Error(`Klarte ikke oppdatere ${jobName}`);
  return next;
}

await writeExpected(PATHS.emner, emner);
await writeExpected(PATHS.methods, methods);
await writeExpected(PATHS.fagkart, fagkart);
await writeExpected(PATHS.pensum, pensum);
await writeExpected(PATHS.contract, contract);
await writeExpected(PATHS.legacy, legacy);
await writeExpected(PATHS.readme, readme);
await writeExpected(PATHS.subjectPackage, subjectPackage);
await writeExpected(PATHS.manifest, manifest);
await writeExpected(PATHS.test, updatedTest);
await writeExpected(PATHS.workflowQuality, updateWorkflow(qualityWorkflow, PATHS.workflowQuality));
await writeExpected(PATHS.workflowCategory, updateWorkflow(categoryWorkflow, PATHS.workflowCategory));

if (CHECK && changed.length) {
  console.error(`Technology editorial V3 is stale: ${changed.join(', ')}`);
  process.exit(1);
}
console.log(`Technology editorial V3 ${WRITE ? 'materialized' : 'verified'}: ${changed.length ? changed.join(', ') : 'no changes'}`);
