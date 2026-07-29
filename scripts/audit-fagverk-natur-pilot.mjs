#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditNaturUniversalCoverage } from './audit-natur-universal-coverage.mjs';
import { composeNaturFinal, readNaturFinalOverlay, NATUR_FINAL_OVERLAY_PATH } from './natur-final-phase-compose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  core: 'js/fagverk-subject-core.js', categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json', portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json', status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json', badge: 'data/badges/natur.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json', overlay: NATUR_FINAL_OVERLAY_PATH,
  report: 'reports/fagverk/natur-pilot-audit.json'
});
const ORDER = ['okosystem_mangfold_habitat','artskunnskap_systematikk','evolusjon_biologisk_mangfold','botanikk_vegetasjon','zoologi_dyreliv','sopp_lav_mikroorganismer','organismebiologi_fysiologi','vann_hydrologi_kretslop','klima_energi_resiliens','geologi_landskap_tid','urban_okologi_gronnstruktur','miljopavirkning_forvaltning_regenerasjon'];
const CHAPTER_DOMAINS = [...ORDER];
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

function loadCore() {
  const sandbox = { console }; sandbox.globalThis = sandbox;
  vm.runInNewContext(read(P.core), sandbox, { filename: P.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

export function auditNaturePilot({ writeReport = false, checkReport = true } = {}) {
  const coverage = auditNaturUniversalCoverage({ checkReport });
  const core = loadCore();
  const categories = json(P.categories), manifest = json(P.manifest), portal = json(P.portal);
  const inventory = json(P.inventory), status = json(P.status), registry = json(P.registry), badge = json(P.badge);
  const portalEntry = portal.categories.find((row) => row.id === 'natur');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'natur');
  const baseStatusEntry = status.subjects.find((row) => row.id === 'natur');
  const manifestEntry = manifest.natur;
  const baseSource = {};
  for (const field of ['pensum','emner','fagkart','methods']) {
    const file = core.resolveManifestPointer(manifestEntry[field]);
    baseSource[field === 'emner' ? 'emners' : field] = json(file);
  }
  const composed = composeNaturFinal({
    pensum: baseSource.pensum,
    emners: baseSource.emners,
    methodsDoc: baseSource.methods,
    fagkart: baseSource.fagkart,
    mappings: json(P.mappings),
    registry,
    statusEntry: baseStatusEntry,
    overlay: readNaturFinalOverlay()
  });
  const source = { pensum: composed.pensum, emners: composed.emners, fagkart: composed.fagkart, methods: composed.methodsDoc };
  const model = core.normalizeSubject({ subjectId:'natur', categoryLabel:categories.labels.natur,
    categoryDescription:categories.decisions?.natur, schemaFamily:inventoryEntry.schemaFamily,
    manifestEntry, portalEntry, inventoryEntry, statusEntry:composed.statusEntry, registry:composed.registry, badge, source });

  const actualDomainOrder = [...model.domains].map((domain) => String(domain.id));
  assert(model.subject.status.assessment === 'audited', 'Natur har feil auditstatus');
  assert(model.subject.status.editorial === 'complete', 'Natur har feil redaksjonell status');
  assert(isDeepStrictEqual(actualDomainOrder, ORDER), 'Natur har feil canonical domenerekkefølge');
  assert(model.summary.domainCount === 12 && model.summary.emneCount === 77, 'Natur har feil domene- eller emnetall');
  assert(model.summary.methodCount === 51 && model.summary.mappingCount === 77 && model.summary.hookCount === 136, 'Natur sluttfase er ikke fullt materialisert');
  assert(model.chapters.length === 12, 'Natur skal ha tolv redigerte kapitler');

  const chapterByDomain = new Map([...model.chapters].map((chapter) => [chapter.primaryDomainId, chapter]));
  const chapters = CHAPTER_DOMAINS.map((domainId) => {
    const domain = model.domainsById.get(domainId), chapterMeta = chapterByDomain.get(domainId);
    assert(domain && chapterMeta, `${domainId}: mangler kapittel eller domene`);
    assert(fs.existsSync(abs(chapterMeta.source.file)), `${domainId}: kapittelfilen finnes ikke`);
    const chapter = json(chapterMeta.source.file);
    assert(chapter.schema === 'history_go_fagverk_chapter_v1' && chapter.subject === 'natur', `${domainId}: ugyldig kapittel`);
    assert(new Set([...chapterMeta.emneIds]).size === domain.emneIds.length && [...domain.emneIds].every((id) => chapterMeta.emneIds.includes(id)), `${domainId}: kapittelets emnedekning er usynkron`);
    assert((chapter.sections || []).length >= 5 && (chapter.sources || []).length >= 3, `${domainId}: kapittelet mangler pedagogiske lag eller kilder`);
    return { id: chapter.id, primaryDomainId: domainId, coverageRole: domain.source.coverage_status,
      emneCount: domain.emneIds.length, sectionCount: chapter.sections.length,
      paragraphCount: chapter.sections.reduce((sum, section) => sum + (section.paragraphs || []).length, 0),
      conceptCount: (chapter.concepts || []).length, sourceCount: chapter.sources.length };
  });

  assert(chapterByDomain.has('sopp_lav_mikroorganismer'), 'Mikrobiologikapittelet mangler');
  assert(chapterByDomain.has('geologi_landskap_tid'), 'Geologikapittelet mangler');
  assert(coverage.summary.requiredGapDomainCount === 0 && coverage.summary.partialDomainCount === 0, 'Natur har fortsatt åpne universelle hull');

  const report = {
    schema: 'history_go_fagverk_natur_expansion_audit_v1', version: '1.2.0',
    status: 'natur_universal_materialization_complete', generatedFrom: P,
    subject: { id:model.subject.id, title:model.subject.title, adapter:model.subject.adapter,
      assessmentStatus:model.subject.status.assessment, editorialStatus:model.subject.status.editorial,
      nextGate:composed.statusEntry.nextGate, subjectPage:model.subject.routes.subject, badgePage:model.subject.routes.badge },
    summary: { domainCount:12, materializedEmneCount:77, materializedMethodCount:51,
      materializedMappingCount:77, materializedHookCount:136, registeredChapterCount:12,
      preservedEnvironmentChapterCount:6,
      requiredGapDomainCount:0, partialDomainCount:0, placeCount:model.places.length },
    canonicalDomainOrder: ORDER, registeredChapterDomains: CHAPTER_DOMAINS,
    requiredGapDomains: [], chapters,
    gates: { canonicalTwelveDomainOrder:true, frozenPhaseTwoBasePreserved:true,
      canonicalFinalOverlayLoaded:true, currentEnvironmentLayerPreserved:true,
      biologyPhaseOneMaterialized:true, biologyPhaseTwoMaterialized:true,
      microbiologyMaterialized:true, innerGeologyAndNaturalHistoryMaterialized:true,
      registeredChaptersInspectable:true, noRequiredGaps:true, noPartialDomains:true,
      assessmentStatusAudited:true, editorialStatusComplete:true, universalCoverageAuditPassed:true }
  };
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)), { recursive:true }); fs.writeFileSync(abs(P.report), `${JSON.stringify(report,null,2)}\n`); }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return { report, model };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { const { report } = auditNaturePilot({ writeReport:args.has('--write-report'), checkReport:!args.has('--no-check-report') });
    console.log(`Natur komplett: ${report.summary.registeredChapterCount} kapitler, ${report.summary.domainCount}/12 områder og ${report.summary.requiredGapDomainCount} gjenværende hull.`); }
  catch (error) { console.error(`Natur-utvidelse FEIL: ${error.message}`); process.exitCode = 1; }
}
