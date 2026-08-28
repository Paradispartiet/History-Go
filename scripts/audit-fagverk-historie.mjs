#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { validateHistoryCurriculumArchitecture } from '../tools/validate-historie-curriculum-architecture.mjs';
import { validateHistoryPeriodModules } from '../tools/validate-historie-period-modules.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  core: 'js/fagverk-subject-core.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  legacyBadgePage: 'data/fag/historie/archive/merke_historie_full_teori_legacy_20260828.html',
  compatibilityBadgePage: 'data/fag/historie/merke_historie (1).html',
  badgeProgressRoute: 'fagverk.html?subject=historie#fagverkIaProgresjon',
  theoryEvidence: 'data/fag/historie/theory_evidence_historie_canonical_v1.json',
  universalCoverage: 'reports/historie-universal-coverage/historie-universal-coverage.json',
  curriculumArchitecture: 'data/fag/historie/curriculum_architecture_historie_v1.json',
  report: 'reports/fagverk/historie-subject-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(PATHS.core), sandbox, { filename: PATHS.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

export function assertHistoryRendererContract(module, modulePath = 'kapittelmodul') {
  for (const example of module.workedExamples || []) {
    assert(
      example.title && example.situation && Array.isArray(example.analysis) && example.analysis.length > 0,
      `Arbeidseksempel i ${modulePath} følger ikke renderer-kontrakten title/situation/analysis`
    );
  }
  for (const misconception of module.commonMisconceptions || []) {
    assert(misconception.claim && misconception.correction, `Misoppfatning i ${modulePath} følger ikke renderer-kontrakten claim/correction`);
  }
  for (const task of module.applicationTasks || []) {
    assert(
      task.task && Array.isArray(task.prompts) && task.prompts.length > 0,
      `Anvendelsesoppgave i ${modulePath} følger ikke renderer-kontrakten task/prompts`
    );
  }
  for (const place of module.relatedPlaces || []) {
    assert(place.id && place.name && place.role, `Stedskobling i ${modulePath} følger ikke renderer-kontrakten id/name/role`);
  }
}

function assertChapter(chapterRow, model, evidenceRegistries, canonicalDomainsById) {
  assert(fs.existsSync(abs(chapterRow.file)), `Registrert kapittelfil mangler: ${chapterRow.file}`);
  assert(model.domainsById.has(chapterRow.primary_domain_id), `Kapittelet peker til ukjent fagområde ${chapterRow.primary_domain_id}`);
  for (const emneId of chapterRow.emne_ids || []) assert(model.emnersById.has(emneId), `Kapittelet peker til ukjent emne ${emneId}`);
  const chapter = json(chapterRow.file);
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', `Kapittelet ${chapterRow.id} har feil schema`);
  assert(chapter.subject === 'historie' && chapter.id === chapterRow.id, `Kapittelet ${chapterRow.id} har feil identitet`);
  assert(chapter.title && chapter.subtitle && chapter.lead, `Kapittelet ${chapterRow.id} mangler tittel, undertittel eller ingress`);
  assert(chapter.learningObjectives?.length >= 5, `Kapittelet ${chapterRow.id} mangler konkrete læringsmål`);
  assert(chapter.diagnosticQuestions?.length >= 3, `Kapittelet ${chapterRow.id} mangler forkunnskapsspørsmål`);
  assert(chapter.moduleFiles?.length >= 3, `Kapittelet ${chapterRow.id} mangler modulstruktur`);

  let productionBrief = null;
  if (chapter.productionBriefFile) {
    assert(fs.existsSync(abs(chapter.productionBriefFile)), `Kapittelbrief mangler: ${chapter.productionBriefFile}`);
    productionBrief = json(chapter.productionBriefFile);
    assert(productionBrief.schema === 'history_go_fagverk_chapter_brief_v1', `Kapittelbriefen ${chapterRow.id} har feil schema`);
    assert(productionBrief.subject === 'historie' && productionBrief.chapterId === chapterRow.id, `Kapittelbriefen ${chapterRow.id} har feil identitet`);
    assert(productionBrief.primaryDomainId === chapterRow.primary_domain_id, `Kapittelbriefen ${chapterRow.id} har feil fagområde`);
    assert(
      isDeepStrictEqual([...(productionBrief.requiredEmneIds || [])].sort(), [...(chapterRow.emne_ids || [])].sort()),
      `Kapittelbriefen ${chapterRow.id} dekker ikke registrerte emner eksakt`
    );
    assert(productionBrief.requiredMethodIds?.length >= 1, `Kapittelbriefen ${chapterRow.id} mangler metoder`);
    for (const methodId of productionBrief.requiredMethodIds) {
      assert(model.methodsById.has(methodId), `Kapittelbriefen ${chapterRow.id} peker til ukjent metode ${methodId}`);
    }
    const canonicalDomain = canonicalDomainsById.get(chapterRow.primary_domain_id);
    assert(
      isDeepStrictEqual([...(productionBrief.requiredMethodIds || [])].sort(), [...(canonicalDomain?.method_ids || [])].sort()),
      `Kapittelbriefen ${chapterRow.id} dekker ikke canonical domenemetoder eksakt`
    );
    assert(productionBrief.editorialRequirements?.paragraphClaimTraceRequired === true, `Kapittelbriefen ${chapterRow.id} krever ikke avsnittssporing`);
    assert(productionBrief.evidenceBoundary?.length >= 3, `Kapittelbriefen ${chapterRow.id} mangler evidensgrense`);
    for (const theoryId of productionBrief.requiredTheoryEvidenceIds || []) {
      assert(evidenceRegistries.theoryEvidenceIds.has(theoryId), `Kapittelbriefen ${chapterRow.id} peker til ukjent theory-evidence ${theoryId}`);
    }
  }

  let sectionCount = 0;
  let workedExampleCount = 0;
  let misconceptionCount = 0;
  let taskCount = 0;
  let selfCheckCount = 0;
  let sourceCount = 0;
  let tracedParagraphCount = 0;
  const claimIds = [];
  const sourceIds = [];
  const theoryEvidenceIds = [];

  for (const modulePath of chapter.moduleFiles) {
    assert(fs.existsSync(abs(modulePath)), `Kapittelmodul mangler: ${modulePath}`);
    const module = json(modulePath);
    sectionCount += module.sections?.length || 0;
    for (const section of module.sections || []) {
      if (productionBrief?.editorialRequirements?.paragraphClaimTraceRequired) {
        assert(section.paragraphClaimIds?.length === section.paragraphs?.length, `Seksjonen ${section.id} i ${chapterRow.id} mangler komplett avsnittssporing`);
        const generatorOwned = productionBrief.generatedFrom?.generator === 'tools/materialize-historie-editorial-chapters.mjs';
        if (generatorOwned) {
          assert(section.paragraphTraceTypes?.length === section.paragraphs?.length, `Seksjonen ${section.id} i ${chapterRow.id} mangler sporingsklassifikasjon`);
        }
        for (const [paragraphIndex, paragraphClaimIds] of section.paragraphClaimIds.entries()) {
          const traceType = section.paragraphTraceTypes?.[paragraphIndex];
          if (generatorOwned && traceType === 'analytical') {
            assert(paragraphClaimIds?.length === 0, `Seksjonen ${section.id} i ${chapterRow.id} gir analytisk tekst misvisende claim-spor`);
            continue;
          }
          if (generatorOwned) assert(traceType === 'claim_supported', `Seksjonen ${section.id} i ${chapterRow.id} har ukjent sporingsklassifikasjon`);
          assert(paragraphClaimIds?.length > 0, `Seksjonen ${section.id} i ${chapterRow.id} har claim-støttet tekst uten claim-spor`);
          tracedParagraphCount += 1;
          for (const claimId of paragraphClaimIds) {
            assert(evidenceRegistries.claimIds.has(claimId), `Seksjonen ${section.id} i ${chapterRow.id} peker til ukjent claim ${claimId}`);
          }
        }
      }
    }
    assertHistoryRendererContract(module, modulePath);
    workedExampleCount += module.workedExamples?.length || 0;
    misconceptionCount += module.commonMisconceptions?.length || 0;
    taskCount += module.applicationTasks?.length || 0;
    selfCheckCount += module.selfCheck?.length || 0;
    sourceCount += module.sources?.length || 0;
    claimIds.push(...(module.claimIds || []));
    theoryEvidenceIds.push(...(module.theoryEvidenceIds || []));
    sourceIds.push(...(module.sources || []).map((source) => source.id).filter(Boolean));
  }

  assert(sectionCount >= 8, `Kapittelet ${chapterRow.id} har for få redigerte seksjoner`);
  assert(workedExampleCount >= 2, `Kapittelet ${chapterRow.id} mangler arbeidseksempler`);
  assert(misconceptionCount >= 4, `Kapittelet ${chapterRow.id} mangler reelle misoppfatninger`);
  assert(taskCount >= 3, `Kapittelet ${chapterRow.id} mangler anvendelsesoppgaver`);
  assert(selfCheckCount >= 5, `Kapittelet ${chapterRow.id} mangler selvtest`);
  assert(sourceCount >= 4, `Kapittelet ${chapterRow.id} mangler inspectable kilder`);
  assert(claimIds.length > 0, `Kapittelet ${chapterRow.id} mangler canonical claim-koblinger`);
  assert(theoryEvidenceIds.length > 0, `Kapittelet ${chapterRow.id} mangler canonical theory-evidence-koblinger`);
  if (productionBrief) {
    assert(sectionCount >= productionBrief.editorialRequirements.minimumSectionCount, `Kapittelet ${chapterRow.id} underskrider briefens seksjonskrav`);
    assert(workedExampleCount >= productionBrief.editorialRequirements.minimumWorkedExamples, `Kapittelet ${chapterRow.id} underskrider briefens eksempelkrav`);
    assert(taskCount >= productionBrief.editorialRequirements.minimumApplicationTasks, `Kapittelet ${chapterRow.id} underskrider briefens oppgavekrav`);
    assert(selfCheckCount >= productionBrief.editorialRequirements.minimumSelfChecks, `Kapittelet ${chapterRow.id} underskrider briefens selvtestkrav`);
    assert(
      isDeepStrictEqual([...new Set(theoryEvidenceIds)].sort(), [...new Set(productionBrief.requiredTheoryEvidenceIds || [])].sort()),
      `Kapittelet ${chapterRow.id} dekker ikke briefens theory-evidence eksakt`
    );
    const expectedClaimIds = new Set(
      productionBrief.requiredTheoryEvidenceIds.flatMap((theoryId) => evidenceRegistries.theoryEvidenceClaimsById.get(theoryId) || [])
    );
    const expectedSourceIds = new Set(
      productionBrief.requiredTheoryEvidenceIds.flatMap((theoryId) => evidenceRegistries.theoryEvidenceSourcesById.get(theoryId) || [])
    );
    assert(
      isDeepStrictEqual([...new Set(claimIds)].sort(), [...expectedClaimIds].sort()),
      `Kapittelet ${chapterRow.id} dekker ikke alle claims fra briefens theory-evidence eksakt`
    );
    assert(
      isDeepStrictEqual([...new Set(sourceIds)].sort(), [...expectedSourceIds].sort()),
      `Kapittelet ${chapterRow.id} dekker ikke alle kilder fra briefens theory-evidence eksakt`
    );
  }

  for (const claimId of claimIds) assert(evidenceRegistries.claimIds.has(claimId), `Kapittelet ${chapterRow.id} peker til ukjent claim ${claimId}`);
  for (const sourceId of sourceIds) assert(evidenceRegistries.sourceIds.has(sourceId), `Kapittelet ${chapterRow.id} peker til ukjent kilde ${sourceId}`);
  for (const theoryId of theoryEvidenceIds) assert(evidenceRegistries.theoryEvidenceIds.has(theoryId), `Kapittelet ${chapterRow.id} peker til ukjent theory-evidence ${theoryId}`);

  return {
    id: chapterRow.id,
    domainId: chapterRow.primary_domain_id,
    sectionCount,
    workedExampleCount,
    misconceptionCount,
    taskCount,
    selfCheckCount,
    sourceCount,
    claimReferenceCount: claimIds.length,
    sourceReferenceCount: sourceIds.length,
    theoryEvidenceReferenceCount: theoryEvidenceIds.length,
    ...(productionBrief ? { tracedParagraphCount, productionBriefValidated: true } : {})
  };
}

export function auditHistorySubject({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(PATHS.categories);
  const manifest = json(PATHS.manifest);
  const portal = json(PATHS.portal);
  const inventory = json(PATHS.inventory);
  const status = json(PATHS.status);
  const registry = json(PATHS.registry);
  const universalCoverage = json(PATHS.universalCoverage);
  const portalEntry = portal.categories.find((row) => row.id === 'historie');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'historie');
  const statusEntry = status.subjects.find((row) => row.id === 'historie');
  const manifestEntry = manifest.historie;

  assert(categories.fagSubjects.includes('historie'), 'Historie mangler i kategorikontrakten');
  assert(manifestEntry && portalEntry && inventoryEntry && statusEntry, 'Historie mangler i manifest, portal, inventar eller status');
  assert(portalEntry.subjectStatus === 'materialized', 'Historie er ikke materialized');
  assert(portalEntry.subjectPage === 'fagverk.html?subject=historie', 'Historie har feil fagsiderute');
  assert(portalEntry.badgePage === PATHS.badgeProgressRoute, 'Historie har feil integrert merkesiderute');
  assert(fs.existsSync(abs(PATHS.legacyBadgePage)), 'Historie mangler arkivert legacy-teori');
  assert(fs.existsSync(abs(PATHS.compatibilityBadgePage)), 'Historie mangler compatibility-merkeside');
  const compatibilityBadgeHtml = read(PATHS.compatibilityBadgePage);
  assert(compatibilityBadgeHtml.includes('location.replace') && compatibilityBadgeHtml.includes('subject=historie#fagverkIaProgresjon'), 'Historie compatibility-merkeside redirecter ikke til Progresjon');
  assert(statusEntry.navigationStatus === 'materialized' && statusEntry.assessmentStatus === 'audited', 'Historie har usynkron strukturell status');
  assert(['structure_ready', 'chapters_in_progress', 'complete', 'expanded_and_audited'].includes(statusEntry.editorialStatus), 'Historie har ugyldig redaksjonell status');
  assert(inventoryEntry.schemaFamily === 'standard_canonical', 'Historie bruker feil schemafamilie');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const resolved = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(resolved)), `Historie mangler required source: ${field}`);
    source[field === 'emner' ? 'emners' : field] = json(resolved);
  }
  for (const field of ['curriculumArchitecture', 'periodGuides', 'periodModules', 'concepts', 'coverageContract', 'qualityContract', 'caseRequirements', 'claims', 'sources', 'placeEvidence', 'profilesManifest']) {
    const resolved = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(resolved)), `Historie mangler manifesttillegget ${field}`);
  }
  source.concepts = json(CORE.resolveManifestPointer(manifestEntry.concepts));
  assert(fs.existsSync(abs(PATHS.theoryEvidence)), 'Historie mangler canonical theory-evidence-register');
  const curriculumArchitecture = validateHistoryCurriculumArchitecture({ root: ROOT });
  const periodModules = validateHistoryPeriodModules({ root: ROOT });

  const claimRegistry = json(CORE.resolveManifestPointer(manifestEntry.claims));
  const sourceRegistry = json(CORE.resolveManifestPointer(manifestEntry.sources));
  const theoryEvidenceRegistry = json(PATHS.theoryEvidence);
  const readyTheoryEvidenceEntries = (theoryEvidenceRegistry.entries || []).filter((entry) => entry.status === 'evidence_ready');
  const evidenceRegistries = {
    claimIds: new Set((claimRegistry.claims || []).map((claim) => claim.claim_id)),
    sourceIds: new Set((sourceRegistry.sources || []).map((sourceItem) => sourceItem.source_id)),
    theoryEvidenceIds: new Set(readyTheoryEvidenceEntries.map((entry) => entry.theory_id)),
    theoryEvidenceClaimsById: new Map(readyTheoryEvidenceEntries.map((entry) => [entry.theory_id, entry.claim_ids || []])),
    theoryEvidenceSourcesById: new Map(readyTheoryEvidenceEntries.map((entry) => [entry.theory_id, entry.source_ids || []]))
  };

  const model = CORE.normalizeSubject({
    subjectId: 'historie', categoryLabel: categories.labels.historie, categoryDescription: categories.decisions?.historie,
    schemaFamily: inventoryEntry.schemaFamily, manifestEntry, portalEntry, inventoryEntry, statusEntry, registry,
    badge: fs.existsSync(abs('data/badges/historie.json')) ? json('data/badges/historie.json') : null, source
  });
  const expectedDomainOrder = source.pensum.domains.map((domain) => domain.domain_id);
  const actualDomainOrder = [...model.domains].map((domain) => domain.id);
  assert(isDeepStrictEqual(actualDomainOrder, expectedDomainOrder), 'Historie-fagområdene vises ikke i source-definert rekkefølge');
  assert(model.subject.id === 'historie' && model.subject.adapter === 'standard', 'Historie normaliseres ikke gjennom standard-adapteren');
  assert(model.summary.domainCount === 23 && model.summary.emneCount === 230 && model.summary.methodCount === 105, 'Historie har uventet kjerneinventar');
  assert(model.summary.mappingCount === 230 && model.summary.hookCount === 230, 'Historie har uventet mapping- eller hookinventar');

  for (const domain of model.domains) {
    assert(domain.label && domain.definition, `Fagområdet ${domain.id} mangler label eller definisjon`);
    assert(domain.emneIds.length === 10 && domain.hookIds.length === 10, `Fagområdet ${domain.id} har uventet dekning`);
    for (const emneId of domain.emneIds) assert(model.emnersById.has(emneId), `Fagområdet ${domain.id} peker til ukjent emne ${emneId}`);
    for (const methodId of domain.methodIds) assert(model.methodsById.has(methodId), `Fagområdet ${domain.id} peker til ukjent metode ${methodId}`);
  }
  for (const emne of model.emners) {
    assert(emne.subjectId === 'historie' && model.domainsById.has(emne.domainId), `Emnet ${emne.id} har ugyldig fagkobling`);
    assert(emne.title && emne.definition && emne.whyItMatters && emne.concepts.length && emne.keyQuestions.length, `Emnet ${emne.id} mangler faglig minimum`);
  }
  for (const method of model.methods) assert(method.title && method.description, `Metoden ${method.id} mangler navn eller forklaring`);
  assert(model.concepts.length === 976, 'Historie har uventet begrepsinventar');
  for (const concept of model.concepts) {
    assert(concept.label && concept.definition && concept.emneIds.length, `Begrepet ${concept.id} mangler forklaring eller emnekobling`);
    for (const emneId of concept.emneIds) assert(model.emnersById.has(emneId), `Begrepet ${concept.id} peker til ukjent emne ${emneId}`);
  }

  const chapterRows = registry.subjects?.historie?.chapters || [];
  const canonicalDomainsById = new Map(source.pensum.domains.map((domain) => [domain.domain_id, domain]));
  const chapterAudits = chapterRows.map((row) => assertChapter(row, model, evidenceRegistries, canonicalDomainsById));
  const coveredChapterDomains = [...new Set(chapterRows.map((row) => row.primary_domain_id))];
  if (chapterRows.length > 0 && coveredChapterDomains.length < 23) {
    assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Ufullstendig kapittelproduksjon krever chapters_in_progress');
  }

  assert(universalCoverage.subject_id === 'historie', 'Heldedekningsrapporten gjelder ikke Historie');
  assert(universalCoverage.inventory?.domains === 23 && universalCoverage.inventory?.emner === 230 && universalCoverage.inventory?.methods === 105, 'Heldedekningsrapporten er usynkronisert');
  const theoryEvidence = universalCoverage.production?.checks?.find((check) => check.id === 'theory_evidence_readiness');
  assert(theoryEvidence, 'Heldedekningsrapporten mangler theory-evidence-port');
  if (universalCoverage.status !== 'COMPLETE' || coveredChapterDomains.length < 23) {
    assert(!['complete', 'expanded_and_audited'].includes(statusEntry.editorialStatus), 'Historie kan ikke få ferdigstatus før alle porter er oppfylt');
  } else {
    assert(['complete', 'expanded_and_audited'].includes(statusEntry.editorialStatus), 'Historie skal ha ferdigstatus når heldekning og 23/23 kapitler er verifisert');
  }
  assert(registry.placePage?.fallbackSubjectByCategory?.historie === 'historie', 'Historie-stedssider faller fortsatt tilbake til et annet fag');
  assert(!JSON.stringify(model.subject).toLocaleLowerCase('nb-NO').includes('politikk'), 'Historie-modellen inneholder politikkspesifikk resttekst');

  const report = {
    schema: 'history_go_fagverk_historie_subject_audit_v1', version: '1.4.0', status: 'phase_5_curriculum_navigation_active', generatedFrom: PATHS,
    subject: { id: model.subject.id, title: model.subject.title, schemaFamily: inventoryEntry.schemaFamily, adapter: model.subject.adapter, badgePage: model.subject.routes.badge, subjectPage: model.subject.routes.subject, assessmentStatus: statusEntry.assessmentStatus, editorialStatus: statusEntry.editorialStatus },
    summary: { domainCount: 23, emneCount: 230, conceptCount: model.concepts.length, methodCount: 105, mappingCount: 230, hookCount: 230, chapterCount: chapterRows.length, chapterDomainCount: coveredChapterDomains.length, remainingChapterDomains: 23 - coveredChapterDomains.length, placeCount: model.places.length, curriculumPeriods: curriculumArchitecture.periods, curriculumPeriodGuides: curriculumArchitecture.periodGuides, curriculumCoveredPeriods: curriculumArchitecture.coveredPeriods, curriculumPartialPeriods: curriculumArchitecture.partialPeriods, curriculumMissingPeriods: curriculumArchitecture.missingPeriods, periodModuleCount: periodModules.modules, periodModuleUnitCount: periodModules.units, periodModuleSourceCount: periodModules.sources, periodModuleCaseCount: periodModules.cases, curriculumThematicFields: curriculumArchitecture.thematicFields, curriculumMethodModules: curriculumArchitecture.methodModules, curriculumGeographicPaths: curriculumArchitecture.geographicPaths },
    chapters: chapterAudits,
    universalCoverage: { status: universalCoverage.status, coveredCells: universalCoverage.summary?.covered_cells ?? null, totalCells: universalCoverage.summary?.total_cells ?? null, productionGaps: universalCoverage.summary?.production_gaps ?? null, theoryEvidenceQualifying: theoryEvidence.measured?.qualifying ?? null, theoryEvidenceTotal: theoryEvidence.measured?.total ?? null, theoryEvidenceRatio: theoryEvidence.measured?.ratio ?? null },
    canonicalDomainOrder: actualDomainOrder,
    gates: { manifestFirst: true, normalizedModel: true, canonicalDomainOrder: true, curriculumNavigationActive: true, variableTrackSizing: true, curriculumGapsClosedWithEvidenceModules: true, emneReferencesResolved: true, methodReferencesResolved: true, mappingsResolved: true, historyExtensionPointersResolved: true, badgeAndSubjectRoutes: true, registeredChaptersValidated: true, chapterEvidenceReferencesResolved: true, productionBriefAndParagraphTraceValidated: chapterAudits.some((chapterAudit) => chapterAudit.productionBriefValidated), honestCompletionBoundary: true, historyPlaceFallbackResolved: true, politicsResiduals: 0 }
  };
  if (writeReport) { fs.mkdirSync(path.dirname(abs(PATHS.report)), { recursive: true }); fs.writeFileSync(abs(PATHS.report), `${JSON.stringify(report, null, 2)}\n`); }
  if (checkReport) assert(isDeepStrictEqual(json(PATHS.report), report), `${PATHS.report} er utdatert`);
  return { report, model };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditHistorySubject({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Historie-fagverk OK: ${report.summary.domainCount} fagområder, ${report.summary.chapterCount} kapitler og ${report.summary.remainingChapterDomains} gjenstående kapitteldomener.`);
  } catch (error) { console.error(`Historie-fagverk FEIL: ${error.message}`); process.exitCode = 1; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
