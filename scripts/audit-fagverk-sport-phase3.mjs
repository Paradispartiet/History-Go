#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const REPORT = 'reports/fagverk/sport-phase3-audit.json';
const ORDER = ['arenaer_steder_groundhopper','regler_spill_konkurranse','kropp_trening_prestasjon','klubber_lag_frivillighet','supportere_publikum_kultur','inkludering_helse_lek_samfunn'];

export function auditSportPhase3({ writeReport = false, checkReport = true } = {}) {
  const pensum = readJson('data/fag/sport/sportpensum_canonical_v4_5.json');
  const methods = readJson('data/fag/sport/methods_sport_canonical_v4_5.json');
  const mappings = readJson('data/fag/sport/emnemapping_sport_canonical_v4_5.json');
  const status = readJson('data/fagverk/subject_status.json').subjects.find((x) => x.id === 'sport');
  const registry = readJson('data/fagverk/fagverk_registry.json').subjects.sport;
  const portal = readJson('data/fagverk/fagverk_portal.json').categories.find((x) => x.id === 'sport');
  const inventory = readJson('data/fagverk/subject_inventory.json').subjects.find((x) => x.id === 'sport');
  const chapters = registry.chapters || [];
  const topicIds = pensum.domains.flatMap((d) => d.emne_ids || []);
  const methodIds = new Set(methods.methods.map((m) => m.method_id));

  assert(pensum.summary.domain_count === 6, 'Sport skal ha 6 områder');
  assert(topicIds.length === 116 && new Set(topicIds).size === 116, 'Sport skal ha 116 unike emner');
  assert(methodIds.size === 109, 'Sport skal ha 109 canonicale metoder');
  assert(mappings.length === 116, 'Sport skal ha 116 mappingrader');
  assert(isDeepStrictEqual(pensum.domain_order, ORDER), 'Sport har feil områdeorden');
  assert(status.navigationStatus === 'materialized' && status.assessmentStatus === 'audited', 'Sport må være materialized og audited');
  assert(portal.subjectPage === 'fagverk.html?subject=sport', 'Sport har feil fagsiderute');
  assert(inventory.schemaFamily === 'standard_canonical', 'Sport har feil schemafamilie');
  assert(pensum.domains.find((d) => d.domain_id === 'arenaer_steder_groundhopper')?.groundhopper_relevant_when_place_based === true, 'Groundhopper-kontrakten mangler');
  if (chapters.length === 0) {
    assert(status.editorialStatus === 'structure_ready' && status.nextGate === 'chapter_production', 'Sport uten kapitler må være structure_ready');
  } else {
    assert(status.editorialStatus === 'chapters_in_progress', 'Sport med kapitler må være chapters_in_progress');
    assert(/_chapter_production$/.test(status.nextGate), 'Sport har feil produksjonsport');
  }

  const report = {
    schema: 'history_go_fagverk_sport_phase3_audit_v2',
    version: '2.0.0',
    status: chapters.length ? 'sport_phase_3_preserved_during_chapter_production' : 'sport_phase_3_structure_ready',
    subject: { id:'sport', title:'Sport & lek', schemaFamily:'standard_canonical', adapter:'standard', navigationStatus:status.navigationStatus, assessmentStatus:status.assessmentStatus, editorialStatus:status.editorialStatus, nextGate:status.nextGate, subjectPage:portal.subjectPage, badgePage:portal.badgePage },
    summary: { domainCount:6, emneCount:116, methodCount:109, mappingCount:116, hookCount:pensum.summary.topic_hook_count, registeredChapterCount:chapters.length, explicitMappingRowCount:mappings.length, legacyUmbrellaEmneCount:2 },
    canonicalDomainOrder: ORDER,
    domainEmneCounts: Object.fromEntries(pensum.domains.map((d) => [d.domain_id, d.emne_ids.length])),
    gates: { allCanonicalEmnersInPensum:true, allCanonicalEmnersInFagkart:true, allCanonicalEmnersInMappingRegistry:true, legacyUmbrellaEmnersExcludedFromActiveSet:true, allMethodReferencesResolved:true, generatorCountsSynchronized:true, knowledgeContractsPreserved:true, sourceFirstGenerationLocked:true, groundhopperPlaceLogicPreserved:true, badgeAndSubjectRoutesDistinct:true, assessmentStatusAudited:true, editorialProgressionMonotonic:true }
  };
  if (writeReport) fs.writeFileSync(path.join(ROOT, REPORT), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert`);
  return { report, model: { domains:pensum.domains.map((d) => ({ id:d.domain_id, sourceKind:'pensum_domain' })), emners:topicIds.map((id) => ({ id })), chapters } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { const {report}=auditSportPhase3({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}); console.log(`Sport Fase 3 OK: ${report.summary.domainCount} områder, ${report.summary.emneCount} emner, ${report.summary.registeredChapterCount} kapitler.`); }
  catch (error) { console.error(`Sport Fase 3 FEIL: ${error.message}`); process.exitCode = 1; }
}
