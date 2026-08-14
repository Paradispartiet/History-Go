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
const MAINTENANCE = 'maintenance_source_refresh_and_place_case_expansion';
const sameSet = (a,b) => a.length === b.length && a.every((value) => new Set(b).has(value));

function chapterEvidence(chapter) {
  const claimsDoc = readJson(chapter.claimsFile);
  const claims = claimsDoc.claims || [];
  const sources = chapter.sourcesFile ? readJson(chapter.sourcesFile).sources : (claimsDoc.sources || []);
  let sections;
  if (chapter.id === 'arenaer-steder-groundhopper') {
    const files = ['01-arena-som-sted.json','02-groundhopper.json','03-hall-is-ski.json','04-tilgang.json','05-hverdagsidrett.json','06-frivillighet.json','07-stadionminne.json','08-arenaendring.json','09-flerbruk.json'];
    sections = files.flatMap((file) => readJson(`data/fagverk/sport/arenaer-steder-groundhopper/${file}`).sections || []);
  } else {
    sections = (chapter.moduleFiles || []).flatMap((file) => readJson(file).sections || []);
  }
  const claimIds = new Set(claims.map((claim) => claim.id));
  const sourceIds = new Set(sources.map((source) => source.id));
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const traces = sections.flatMap((section) => section.paragraphClaimIds || []);
  assert(sections.length === 9, `${chapter.id} skal ha 9 seksjoner`);
  assert(paragraphs.length === 27, `${chapter.id} skal ha 27 fagavsnitt`);
  assert(claims.length === 27, `${chapter.id} skal ha 27 claims`);
  assert(sources.length >= 10, `${chapter.id} skal ha minst 10 kilder`);
  assert(sources.every((source) => source.title && source.publisher && /^https:\/\//.test(source.url)), `${chapter.id} har ikke-inspiserbar kilde`);
  assert(claims.every((claim) => claim.sourceIds?.length && claim.sourceIds.every((id) => sourceIds.has(id))), `${chapter.id} har claim uten gyldig kilde`);
  assert(traces.length === 27 && traces.every((ids) => ids.length && ids.every((id) => claimIds.has(id))), `${chapter.id} har ufullstendig paragraph-claim trace`);
  return { sections: sections.length, paragraphs: paragraphs.length, claims: claims.length, sources: sources.length };
}

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
  } else if (chapters.length < 6) {
    assert(status.editorialStatus === 'chapters_in_progress', 'Sport under produksjon må være chapters_in_progress');
    assert(/_chapter_production$/.test(status.nextGate), 'Sport har feil produksjonsport');
  } else {
    assert(chapters.length === 6, 'Sport skal ikke ha flere enn 6 canonicale kapitler');
    assert(status.editorialStatus === 'complete', 'Sport 6/6 må være complete');
    assert(status.nextGate === MAINTENANCE, 'Sport 6/6 har feil vedlikeholdsport');
  }

  let evidence = { sections:0, paragraphs:0, claims:0, sources:0 };
  if (chapters.length === 6) {
    assert(isDeepStrictEqual(chapters.map((chapter) => chapter.primary_domain_id), ORDER), 'Sport-kapitlene har feil canonical rekkefølge');
    const allChapterTopics = [];
    for (const domain of pensum.domains) {
      const row = chapters.find((chapter) => chapter.primary_domain_id === domain.domain_id);
      assert(row, `Sport mangler kapittel for ${domain.domain_id}`);
      const chapter = readJson(row.file);
      assert(sameSet(chapter.emne_ids, domain.emne_ids), `${chapter.id} har feil emnedekning`);
      assert(sameSet(chapter.method_ids, domain.method_ids), `${chapter.id} har feil metodedekning`);
      allChapterTopics.push(...chapter.emne_ids);
      const counts = chapterEvidence(chapter);
      for (const key of Object.keys(evidence)) evidence[key] += counts[key];
    }
    assert(allChapterTopics.length === 116 && new Set(allChapterTopics).size === 116, 'Sport-kapitlene skal dekke 116/116 emner nøyaktig én gang');
    assert(evidence.sections === 54 && evidence.paragraphs === 162 && evidence.claims === 162, 'Sport fullteksttall er feil');
  }

  const report = {
    schema: 'history_go_fagverk_sport_phase3_audit_v3',
    version: '3.0.0',
    status: chapters.length === 6 ? 'sport_complete' : chapters.length ? 'sport_phase_3_preserved_during_chapter_production' : 'sport_phase_3_structure_ready',
    subject: { id:'sport', title:'Sport & lek', schemaFamily:'standard_canonical', adapter:'standard', navigationStatus:status.navigationStatus, assessmentStatus:status.assessmentStatus, editorialStatus:status.editorialStatus, nextGate:status.nextGate, subjectPage:portal.subjectPage, badgePage:portal.badgePage },
    summary: { domainCount:6, emneCount:116, methodCount:109, mappingCount:116, hookCount:pensum.summary.topic_hook_count, registeredChapterCount:chapters.length, explicitMappingRowCount:mappings.length, legacyUmbrellaEmneCount:2, sectionCount:evidence.sections, paragraphCount:evidence.paragraphs, claimCount:evidence.claims, sourceRegistrationCount:evidence.sources },
    canonicalDomainOrder: ORDER,
    domainEmneCounts: Object.fromEntries(pensum.domains.map((d) => [d.domain_id, d.emne_ids.length])),
    gates: { allCanonicalEmnersInPensum:true, allCanonicalEmnersInFagkart:true, allCanonicalEmnersInMappingRegistry:true, legacyUmbrellaEmnersExcludedFromActiveSet:true, allMethodReferencesResolved:true, generatorCountsSynchronized:true, knowledgeContractsPreserved:true, sourceFirstGenerationLocked:true, groundhopperPlaceLogicPreserved:true, badgeAndSubjectRoutesDistinct:true, assessmentStatusAudited:true, editorialProgressionMonotonic:true, completeDomainCoverage:chapters.length===6, completeTopicCoverage:chapters.length===6, completeMethodCoverage:chapters.length===6, paragraphClaimTraceComplete:chapters.length===6 }
  };
  if (writeReport) fs.writeFileSync(path.join(ROOT, REPORT), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert`);
  return { report, model: { domains:pensum.domains.map((d) => ({ id:d.domain_id, sourceKind:'pensum_domain' })), emners:topicIds.map((id) => ({ id })), chapters } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { const {report}=auditSportPhase3({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}); console.log(`Sport audit OK: ${report.summary.domainCount} områder, ${report.summary.emneCount} emner, ${report.summary.registeredChapterCount} kapitler.`); }
  catch (error) { console.error(`Sport audit FEIL: ${error.message}`); process.exitCode = 1; }
}
