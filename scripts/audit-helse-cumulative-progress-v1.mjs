#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const assert = (v, m) => { if (!v) throw new Error(m); };

const UNITS = [
  { id: 'medisinsk-etikk-evidens-og-ansvarlig-beslutning', source: 'data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json' },
  { id: 'anatomi-fysiologi-struktur-funksjon-og-regulering', source: 'data/fag/helse/anatomy_physiology_source_claim_brief_v1.json' },
  { id: 'sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt', source: 'data/fag/helse/disease_pathophysiology_source_claim_brief_v1.json' }
];

export function auditHealthCumulativeProgressV1() {
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((x) => x.id === 'helse');
  const manifest = read('data/fag/fag_manifest.json').helse;
  const safety = read('data/fag/helse/clinical_safety_contract_helse_v1.json');
  assert(safety.status === 'blocking', 'Klinisk sikkerhetskontrakt må være blocking');
  assert(registry.editorialPlan.targetDomainCount === 12, 'Helse skal ha 12 planlagte domener');
  assert(registry.editorialPlan.registeredChapterCount === 3 && registry.chapters.length >= 3, 'Kumulativ Helse-status skal være 3/12');
  assert(status.navigationStatus === 'materialized' && status.assessmentStatus === 'audited' && status.editorialStatus === 'chapters_in_progress', 'Kumulativ status feiler');
  assert(status.nextGate === 'disease_pathophysiology_full_chapter_complete_next_domain_source_brief', 'Feil kumulativ nextGate');

  const summaries = [];
  for (const unit of UNITS) {
    const chapterFile = `data/fagverk/helse/${unit.id}.json`;
    const dir = `data/fagverk/helse/${unit.id}`;
    const chapter = read(chapterFile), claims = read(`${dir}/claims.json`), brief = read(`${dir}/brief.json`), assessment = read(`${dir}/assessment.json`), source = read(unit.source);
    const modules = chapter.moduleFiles.map(read), sections = modules.flatMap((x) => x.sections), paragraphs = sections.flatMap((x) => x.paragraphs), traces = sections.flatMap((x) => x.paragraphClaimIds);
    const claimIds = new Set(claims.claims.map((x) => x.id)), sourceIds = new Set(claims.sources.map((x) => x.id));
    const planned = source.topic_briefs.flatMap((t) => t.planned_claims.map((c) => c.id));
    assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired && chapter.sourceFirst, `${unit.id}: kapittelstatus feiler`);
    assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32 && traces.length === 32, `${unit.id}: struktur er ikke 4/8/32`);
    assert(claimIds.size === 32 && new Set(planned).size === 32 && planned.every((id) => claimIds.has(id)), `${unit.id}: 32 briefclaims er ikke bevart`);
    assert(traces.every((ids) => ids.length === 1 && ids.every((id) => claimIds.has(id))) && new Set(traces.flat()).size === 32, `${unit.id}: claimspor feiler`);
    assert(sourceIds.size === 14 && claims.claims.every((x) => x.status === 'verified' && x.source_ids.length >= 3 && x.source_ids.every((id) => sourceIds.has(id))), `${unit.id}: kilde-/claimbinding feiler`);
    assert(claims.sources.every((x) => x.url?.startsWith('https://') && x.source_location && x.retrieval_status === 'verified_2026-08-21'), `${unit.id}: kildeproveniens feiler`);
    assert(assessment.questions.length === 8 && assessment.questions.every((x) => x.answer === x.options[x.answerIndex] && claimIds.has(x.claim_id) && x.source.length >= 3 && x.safety_mode === 'general_non_individualizing'), `${unit.id}: assessment feiler`);
    assert(brief.safety?.individualDiagnosis === false && brief.safety?.individualTreatmentAdvice === false, `${unit.id}: sikkerhetsgrense feiler`);
    assert(registry.chapters.filter((x) => x.id === unit.id && x.file === chapterFile).length === 1, `${unit.id}: registrybinding feiler`);
    assert(manifest.chapters?.includes(chapterFile), `${unit.id}: manifest mangler kapittel`);
    summaries.push({ id: unit.id, modules: 4, sections: 8, paragraphs: 32, claims: 32, sources: 14, questions: 8 });
  }

  assert(manifest.sourceClaimBriefs?.includes(UNITS[2].source), 'Domene 3 source brief mangler i manifest');
  assert(status.editorialStatus !== 'complete', '3/12 kan ikke være complete');
  return { subject_id: 'helse', completedDomains: 3, targetDomains: 12, strictCompletionClaimed: false, units: summaries };
}

try { const r = auditHealthCumulativeProgressV1(); console.log(`Helse kumulativ audit OK: ${r.completedDomains}/${r.targetDomains} domener, ${r.units.reduce((n, u) => n + u.claims, 0)} verifiserte claims.`); }
catch (e) { console.error(`Helse kumulativ audit FEIL: ${e.message}`); process.exitCode = 1; }
