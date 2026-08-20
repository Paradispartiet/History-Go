#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  release: 'data/fagverk/fagverk_release.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell.json',
  brief: 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell/claims.json'
});

const CHAPTER_ID = 'vitenskap-matematisk-bevis-struktur-og-modell';
const EXPECTED_EMNES = [
  'em_vit_matematisk_bevis_og_deduksjon',
  'em_vit_algebra_og_strukturer',
  'em_vit_analyse_endring_og_kontinuitet',
  'em_vit_geometri_rom_og_symmetri',
  'em_vit_diskret_matematikk_og_kombinatorikk'
];
const EXPECTED_METHODS = [
  'met_vit_teorianalyse',
  'met_vit_beregningsanalyse',
  'met_vit_modellanalyse',
  'met_vit_statistisk_analyse',
  'met_vit_visualiseringsanalyse',
  'met_vit_algoritmeanalyse'
];
const EXPECTED_REMAINING_BLOCKERS = [
  'physics_astronomy',
  'chemistry_material_science',
  'medicine_biomedicine_public_health'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id) => b.includes(id));
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapMathematicsFulltext() {
  const readiness = json(P.readiness);
  const registry = json(P.registry);
  const release = json(P.release);
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);
  const registrySubject = registry.subjects?.vitenskap;
  const releaseSubject = release.subjects?.vitenskap;

  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Matematikk-kapittelet har feil schema');
  assert(chapter.chapter_id === CHAPTER_ID && chapter.id === CHAPTER_ID, 'Matematikk-kapittelet har feil ID');
  assert(chapter.subject_id === 'vitenskap' && chapter.primary_domain_id === 'metoder_maling_modeller', 'Matematikk-kapittelet har feil subject/domain');
  assert(chapter.coverage_family_id === 'mathematics_formal_sciences', 'Matematikk-kapittelet har feil coverage family');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Matematikk-kapittelet er ikke chapter_ready med claim trace');
  assert(sameSet(chapter.emne_ids, EXPECTED_EMNES), 'Matematikk-kapittelet har feil emnesett');
  assert(sameSet(chapter.method_ids, EXPECTED_METHODS), 'Matematikk-kapittelet har feil metodesett');
  assert(chapter.briefFile === P.brief && chapter.claimsFile === P.claims, 'Matematikk-kapittelet peker ikke til canonical brief/claims');
  assert(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length === 3, 'Matematikk-kapittelet skal ha tre moduler');
  for (const file of [...chapter.moduleFiles, chapter.briefFile, chapter.claimsFile]) assert(fs.existsSync(abs(file)), `Mangler Unit 2-fil ${file}`);

  const guard = chapter.qualityGuard || {};
  assert(guard.formalVsEmpiricalBoundaryExplicit === true, 'Kapittelet mangler formell/empirisk grense');
  assert(guard.noProofEqualsEmpiricalEvidenceShortcut === true, 'Kapittelet må blokkere bevis=empiri-snarvei');
  assert(guard.noTheoremProverEmpiricalValidationShortcut === true, 'Kapittelet må blokkere theorem-prover=empirisk-validering');
  assert(guard.representationVsObjectDistinctionExplicit === true, 'Kapittelet mangler objekt/representasjon-skille');
  assert(guard.continuousVsDiscreteModelChoiceExplicit === true, 'Kapittelet mangler kontinuerlig/diskret modellskille');
  assert(guard.symmetryRequiresTransformationAndInvariance === true, 'Kapittelet mangler transformasjon/invarians-port');
  assert(guard.doesNotClaimSubjectComplete === true && guard.remainingBreadthEditorialBlockersRequired === true, 'Kapittelet blokkerer ikke premature subject completion');
  assert(guard.technologyRemainsNested === true, 'Kapittelet må bevare Teknologi nested');

  assert(brief.chapter_id === CHAPTER_ID && sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Brief og kapittel er ikke aligned');
  assert(sameSet(brief.requiredMethodIds, EXPECTED_METHODS), 'Brief og kapittel har ulike metoder');
  const claims = claimsDocument.claims || [];
  const sources = claimsDocument.sources || [];
  assert(claims.length === 18 && sources.length === 10, 'Unit 2 må bevare 18 claims og 10 kilder');
  const claimIds = new Set(claims.map((row) => row.id));
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(claimIds.size === claims.length && sourceIds.size === sources.length, 'Unit 2 har dupliserte claim/source-ID-er');
  assert(claims.every((row) => row.status === 'verified' && row.source_ids?.length && row.source_ids.every((id) => sourceIds.has(id))), 'Unit 2 har uverifisert eller ukjent kildekoblet claim');

  const modules = chapter.moduleFiles.map(json);
  const sections = modules.flatMap((module) => module.sections || []);
  assert(sections.length === 9, `Unit 2 skal ha 9 seksjoner, fant ${sections.length}`);
  assert(new Set(sections.map((row) => row.id)).size === 9, 'Unit 2 har dupliserte seksjons-ID-er');
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  assert(paragraphs.length === 27, `Unit 2 skal ha 27 avsnitt, fant ${paragraphs.length}`);
  assert(paragraphs.every((text) => typeof text === 'string' && text.trim().length >= 220), 'Alle Unit 2-fagavsnitt må være substansielle');
  assert(new Set(paragraphs).size === paragraphs.length, 'Unit 2 gjenbruker identisk avsnittstekst');
  assert(sections.every((section) => section.paragraphs?.length === 3 && section.paragraphClaimIds?.length === 3), 'Hver Unit 2-seksjon skal ha tre claimsporede avsnitt');
  assert(sections.every((section) => section.keyPoints?.length === 2 && section.keyPointClaimIds?.length === 2), 'Hver Unit 2-seksjon skal ha to claimsporede key points');

  const refsBySection = new Map();
  for (const section of sections) {
    const refs = new Set([...flatten(section.paragraphClaimIds), ...flatten(section.keyPointClaimIds)]);
    assert([...refs].every((id) => claimIds.has(id)), `${section.id} peker til ukjent claim`);
    refsBySection.set(section.id, refs);
  }
  const allRefs = new Set([...refsBySection.values()].flatMap((set) => [...set]));
  assert(claims.every((claim) => allRefs.has(claim.id)), 'Unit 2 har orphan claim uten fulltekstbruk');
  for (const claim of claims) {
    const actualSections = [...refsBySection.entries()].filter(([, refs]) => refs.has(claim.id)).map(([id]) => id);
    assert(isDeepStrictEqual(sorted(actualSections), sorted(claim.used_in || [])), `${claim.id} har ikke eksakt reciprocal used_in/fulltext-sporing`);
  }

  const workedExamples = modules.flatMap((module) => module.workedExamples || []);
  const applicationTasks = modules.flatMap((module) => module.applicationTasks || []);
  const selfCheck = modules.flatMap((module) => module.selfCheck || []);
  const misconceptions = modules.flatMap((module) => module.misconceptions || []);
  assert(workedExamples.length === 2 && workedExamples.every((row) => row.analysis?.length >= 4 && row.claim_ids?.length >= 3), 'Unit 2 skal ha to substansielle worked examples');
  assert(applicationTasks.length === 4 && applicationTasks.every((row) => row.prompts?.length >= 4), 'Unit 2 skal ha fire substansielle anvendelsesoppgaver');
  assert(selfCheck.length === 6 && selfCheck.every((row) => row.question && row.answer), 'Unit 2 skal ha seks self-check-spørsmål');
  assert(misconceptions.length === 4 && misconceptions.every((row) => row.claim && row.correction), 'Unit 2 skal ha fire eksplisitte misoppfatninger');
  assert(misconceptions.some((row) => /bevis/i.test(row.claim) && /empir/i.test(row.claim + row.correction)), 'Unit 2 mangler bevis/empiri-misoppfatning');
  assert(misconceptions.some((row) => /symmetri/i.test(row.claim) && /transformasjon/i.test(row.correction)), 'Unit 2 mangler symmetri/invarians-korreksjon');

  assert(readiness.complete_ready === false || readiness.status === 'university_breadth_complete', 'Unit 2 kan ikke gjøre Vitenskap complete-ready');
  assert(readiness.current_inventory?.vitenskap?.registered_chapter_count >= 2, 'Readiness må bevare minst to Vitenskap-kapitler etter Unit 2');
  assert((readiness.editorial_blockers || []).every((id) => EXPECTED_REMAINING_BLOCKERS.includes(id)) && !(readiness.editorial_blockers || []).includes('mathematics_formal_sciences'), 'Senere units kan bare redusere Unit 2 sitt tillatte blocker-sett');
  const mathFamily = readiness.coverage_families?.find((row) => row.id === 'mathematics_formal_sciences');
  assert(mathFamily?.status === 'chapter_materialized', 'Matematikkfamilien må være chapter_materialized');
  assert(mathFamily?.materialized_chapter_id === CHAPTER_ID, 'Matematikkfamilien mangler materialized chapter-link');
  assert(mathFamily?.requires_canonical_inventory_change === false, 'Matematikkfamilien kan ikke åpne inventory igjen');
  assert(readiness.current_inventory?.teknologi?.top_level_subject === false && readiness.current_inventory?.teknologi?.canonical_parent_subject === 'vitenskap', 'Teknologi må forbli nested');

  const registryChapter = registrySubject?.chapters?.find((row) => row.id === CHAPTER_ID);
  assert(registrySubject?.chapters?.length >= 2, 'Vitenskap-registry må bevare minst to kapitler etter Unit 2');
  assert(registryChapter, 'Matematikk-kapittelet mangler i registry');
  assert(registryChapter.file === P.chapter && registryChapter.claimsFile === P.claims && registryChapter.briefFile === P.brief, 'Matematikk-registry peker til feil filer');
  assert(sameSet(registryChapter.emne_ids, EXPECTED_EMNES), 'Matematikk-registry har feil emnesett');
  assert(releaseSubject?.chapter_status === 'materialized' && releaseSubject?.chapter_count === registrySubject.chapters.length && releaseSubject?.chapter_count >= 2, 'Release må bevare Unit 2 og følge registry-kapitteltallet');
  assert(releaseSubject?.missing_chapter_files?.length === 0, 'Vitenskap release har manglende kapittelfiler');

  return {
    schema: 'history_go_fagverk_vitenskap_mathematics_fulltext_audit_v1',
    version: '1.0.0',
    status: 'pass',
    subject: 'vitenskap',
    chapterId: CHAPTER_ID,
    summary: {
      emneCount: chapter.emne_ids.length,
      methodCount: chapter.method_ids.length,
      moduleCount: modules.length,
      sectionCount: sections.length,
      paragraphCount: paragraphs.length,
      sourceCount: sources.length,
      claimCount: claims.length,
      misconceptionCount: misconceptions.length,
      workedExampleCount: workedExamples.length,
      applicationTaskCount: applicationTasks.length,
      selfCheckCount: selfCheck.length,
      registeredChapterCount: registrySubject.chapters.length,
      remainingEditorialBlockerCount: readiness.editorial_blockers.length
    },
    gates: {
      formalEmpiricalBoundaryLocked: true,
      claimTraceReciprocalAndComplete: true,
      sourceClaimIntegrityPreserved: true,
      mathematicsChapterMaterializedAndRegistered: true,
      mathematicsEditorialBlockerResolved: true,
      remainingBreadthEditorialBlockersConsistent: true,
      prematureCompleteBlocked: true,
      technologyRemainsNested: true
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log(JSON.stringify(auditVitenskapMathematicsFulltext(), null, 2));
}
