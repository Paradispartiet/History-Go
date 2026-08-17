#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  emners: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json',
  methods: 'data/fag/vitenskap/methods_vitenskap_canonical_v4_5.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json'
});

const EXPECTED_EMNES = [
  'em_vit_universitet_kunnskapsproduksjon',
  'em_vit_laboratorium_praksis',
  'em_vit_instrumenter_maling',
  'em_vit_forskningsinfrastruktur',
  'em_vit_fagmiljo_standarder',
  'em_vit_fagfellevurdering',
  'em_vit_reproduserbarhet',
  'em_vit_institusjonell_tillit'
];
const EXPECTED_METHODS = [
  'met_vit_institusjonsanalyse',
  'met_vit_kalibreringsanalyse',
  'met_vit_usikkerhetsanalyse',
  'met_vit_fagfelleanalyse',
  'met_vit_feilkildeanalyse'
];
const EXPECTED_GAPS = [
  'mathematics_formal_sciences',
  'physics_astronomy',
  'chemistry_material_science',
  'medicine_biomedicine_public_health'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => a.length === b.length && new Set(a).size === a.length && a.every((id) => b.includes(id));
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapUnit1() {
  const readiness = json(P.readiness);
  const emners = json(P.emners);
  const methodsDocument = json(P.methods);
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);

  assert(readiness.subject_id === 'vitenskap', 'Readiness peker ikke til vitenskap');
  assert(readiness.complete_ready === false, 'Unit 1 må ikke gjøre hele Vitenskap complete');
  assert(sameSet(readiness.blocking_gaps || [], EXPECTED_GAPS), 'De fire readiness-gapene må forbli åpne i Unit 1');
  assert(readiness.current_inventory?.teknologi?.top_level_subject === false, 'Teknologi må forbli nested');
  assert(readiness.current_inventory?.teknologi?.canonical_parent_subject === 'vitenskap', 'Teknologi har feil canonical parent');
  assert(readiness.first_production_unit?.chapter_id === chapter.chapter_id, 'Kapittelet avviker fra readiness sin første produksjonsenhet');
  assert(readiness.first_production_unit?.primary_domain_id === chapter.primary_domain_id, 'Kapittelet har feil readiness-domain');
  assert(sameSet(readiness.first_production_unit?.emne_ids || [], EXPECTED_EMNES), 'Readiness har feil Unit 1-emnesett');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  for (const id of EXPECTED_EMNES) {
    const row = emneById.get(id);
    assert(row, `Ukjent canonicalt Vitenskap-emne: ${id}`);
    assert(row.domain === 'institusjoner_laboratorier_kunnskapssteder', `${id} ligger utenfor Unit 1-domain`);
    assert(row.canonical_status === 'canonical', `${id} er ikke canonical`);
  }
  const methodIds = new Set((methodsDocument.methods || []).map((row) => row.method_id));
  for (const id of EXPECTED_METHODS) assert(methodIds.has(id), `Ukjent canonical Vitenskap-metode: ${id}`);

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kapittelroot har feil schema');
  assert(chapter.editorialStatus === 'chapter_ready', 'Unit 1 er ikke chapter_ready');
  assert(chapter.claimTraceRequired === true, 'Unit 1 mangler bindende claim-sporing');
  assert(chapter.primary_domain_id === 'institusjoner_laboratorier_kunnskapssteder', 'Unit 1 har feil primary domain');
  assert(sameSet(chapter.emne_ids || [], EXPECTED_EMNES), 'Kapittelroot har feil emnesett');
  assert(sameSet(chapter.method_ids || [], EXPECTED_METHODS), 'Kapittelroot har feil metodesett');
  assert(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length === 3, 'Unit 1 skal ha tre redigerte moduler');
  assert(chapter.briefFile === P.brief && chapter.claimsFile === P.claims, 'Kapittelroot peker ikke til canonical brief/claims');
  assert(chapter.qualityGuard?.blockingCoverageGapsRemainOpen === true, 'Unit 1 må eksplisitt bevare readiness-gapene');
  assert(chapter.qualityGuard?.doesNotClaimSubjectComplete === true, 'Unit 1 må eksplisitt blokkere premature complete');
  assert(chapter.qualityGuard?.technologyRemainsNested === true, 'Unit 1 må bevare nested Teknologi');
  for (const file of [...chapter.moduleFiles, chapter.briefFile, chapter.claimsFile]) assert(fs.existsSync(abs(file)), `Mangler kapittelfil: ${file}`);

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1', 'Brief har feil schema');
  assert(brief.chapter_id === chapter.chapter_id, 'Brief har feil kapittel-ID');
  assert(sameSet(brief.requiredEmneIds || [], EXPECTED_EMNES), 'Brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds || [], EXPECTED_METHODS), 'Brief har feil obligatoriske metoder');
  assert((brief.requiredCriticalDistinctions || []).length >= 10, 'Brief mangler kritiske distinksjoner');
  assert(brief.sourceStrategy?.minimumExternalSources >= 8, 'Brief krever for få eksterne kilder');
  assert(brief.sourceStrategy?.claimLevelTrace === true && brief.sourceStrategy?.sourceLocationsRequired === true, 'Brief mangler claim-/locator-port');
  assert(brief.sourceStrategy?.noDecorativeSources === true, 'Brief må blokkere dekorative kilder');
  assert((brief.documentedCasesOrScenarios || []).length >= 2, 'Brief mangler dokumenterte case/teaching scenarios');
  assert(brief.qa?.crossChapterOriginalityRequired === true, 'Brief mangler originality-port');

  const modules = chapter.moduleFiles.map(json);
  const sections = modules.flatMap((module) => module.sections || []);
  assert(sections.length === 9, 'Unit 1 skal ha ni redigerte seksjoner');
  assert(new Set(sections.map((s) => s.id)).size === sections.length, 'Unit 1 har dupliserte seksjons-ID-er');
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  assert(paragraphs.length === 27, 'Unit 1 skal ha 27 redigerte fagavsnitt');
  assert(paragraphs.every((p) => typeof p === 'string' && p.length >= 260), 'Alle Unit 1-avsnitt skal være substansielle');
  assert(new Set(paragraphs).size === paragraphs.length, 'Unit 1 gjenbruker identisk avsnittstekst');
  assert(sections.every((section) => section.paragraphClaimIds?.length === section.paragraphs?.length), 'Hvert fagavsnitt må ha claim-sporing');

  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length === 10, 'Unit 1 skal ha ti inspiserbare eksterne kilder');
  assert(claims.length === 18, 'Unit 1 skal ha atten verifiserte claims');
  const sourceIds = new Set(sources.map((row) => row.id));
  const claimIds = new Set(claims.map((row) => row.id));
  assert(sourceIds.size === sources.length, 'Unit 1 har dupliserte source-ID-er');
  assert(claimIds.size === claims.length, 'Unit 1 har dupliserte claim-ID-er');
  assert(sources.every((row) => /^https:\/\//.test(row.url || '') && row.publisher && row.source_location), 'Alle Unit 1-kilder må ha HTTPS, publisher og source_location');
  assert(claims.every((row) => row.status === 'verified' && row.source_ids?.length), 'Alle Unit 1-claims må være verified og kildekoblet');
  assert(claims.every((row) => row.source_ids.every((id) => sourceIds.has(id))), 'Unit 1-claim peker til ukjent kilde');

  const refsBySection = new Map();
  for (const section of sections) {
    const refs = new Set([...flatten(section.paragraphClaimIds), ...flatten(section.keyPointClaimIds)]);
    assert([...refs].every((id) => claimIds.has(id)), `${section.id} peker til ukjent claim`);
    refsBySection.set(section.id, refs);
  }
  const allRefs = new Set([...refsBySection.values()].flatMap((set) => [...set]));
  assert(claims.every((claim) => allRefs.has(claim.id)), 'Unit 1 har orphan claim uten redaksjonell bruk');
  for (const claim of claims) {
    assert(Array.isArray(claim.used_in) && claim.used_in.length, `${claim.id} mangler used_in`);
    for (const sectionId of claim.used_in) {
      assert(refsBySection.has(sectionId), `${claim.id} peker til ukjent seksjon ${sectionId}`);
      assert(refsBySection.get(sectionId).has(claim.id), `${claim.id} er ikke faktisk brukt i ${sectionId}`);
    }
  }

  const workedExamples = modules.flatMap((module) => module.workedExamples || []);
  const applicationTasks = modules.flatMap((module) => module.applicationTasks || []);
  const selfCheck = modules.flatMap((module) => module.selfCheck || []);
  const misconceptions = modules.flatMap((module) => module.misconceptions || []);
  assert(workedExamples.length === 2 && workedExamples.every((row) => row.analysis?.length >= 4), 'Unit 1 skal ha to substansielle worked examples');
  assert(applicationTasks.length === 4 && applicationTasks.every((row) => row.prompts?.length >= 3), 'Unit 1 skal ha fire anvendelsesoppgaver');
  assert(selfCheck.length === 6 && selfCheck.every((row) => row.question && row.answer), 'Unit 1 skal ha seks self-check-spørsmål');
  assert(misconceptions.length === 4 && misconceptions.every((row) => row.claim && row.correction), 'Unit 1 skal ha fire eksplisitte misoppfatninger');

  const fullText = JSON.stringify({ chapter, brief, modules }).toLowerCase();
  assert(!fullText.includes('fagfellevurdert betyr sant'), 'Unit 1 inneholder forbudt peer-review truth shortcut');
  assert(!fullText.includes('kalibrert betyr sporbar'), 'Unit 1 inneholder forbudt calibration/traceability shortcut');
  assert(chapter.diagnosticQuestions.some((row) => /reproducibility/i.test(row.question) && /replicability/i.test(row.question)), 'Unit 1 mangler eksplisitt reproducibility/replicability-skille');

  return {
    schema: 'history_go_fagverk_vitenskap_unit1_audit_v1',
    version: '1.0.0',
    status: 'pass',
    subject: 'vitenskap',
    chapterId: chapter.chapter_id,
    summary: {
      emneCount: chapter.emne_ids.length,
      methodCount: chapter.method_ids.length,
      moduleCount: modules.length,
      sectionCount: sections.length,
      paragraphCount: paragraphs.length,
      sourceCount: sources.length,
      claimCount: claims.length,
      workedExampleCount: workedExamples.length,
      applicationTaskCount: applicationTasks.length,
      selfCheckCount: selfCheck.length
    },
    gates: {
      readinessUnitMatched: true,
      canonicalEmnersAndMethodsResolved: true,
      paragraphClaimsResolved: true,
      sourceLocatorsInspectable: true,
      blockingCoverageGapsRemainOpen: true,
      prematureCompleteBlocked: true,
      technologyRemainsNested: true,
      peerReviewTruthShortcutBlocked: true,
      calibrationTraceabilityShortcutBlocked: true,
      reproducibilityReplicationDistinctionPresent: true
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log(JSON.stringify(auditVitenskapUnit1(), null, 2));
}
