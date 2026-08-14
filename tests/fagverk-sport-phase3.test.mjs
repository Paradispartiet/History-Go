import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSportPhase3 } from '../scripts/audit-fagverk-sport-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ORDER = ['arenaer_steder_groundhopper','regler_spill_konkurranse','kropp_trening_prestasjon','klubber_lag_frivillighet','supportere_publikum_kultur','inkludering_helse_lek_samfunn'];
const sameSet = (a,b) => a.length === b.length && a.every((value) => new Set(b).has(value));

function evidenceFor(chapter) {
  const claimsDoc = readJson(chapter.claimsFile);
  const claims = claimsDoc.claims || [];
  const sources = chapter.sourcesFile ? readJson(chapter.sourcesFile).sources : (claimsDoc.sources || []);
  let sections;
  if (chapter.id === 'arenaer-steder-groundhopper') {
    const files=['01-arena-som-sted.json','02-groundhopper.json','03-hall-is-ski.json','04-tilgang.json','05-hverdagsidrett.json','06-frivillighet.json','07-stadionminne.json','08-arenaendring.json','09-flerbruk.json'];
    sections=files.flatMap((file)=>readJson(`data/fagverk/sport/arenaer-steder-groundhopper/${file}`).sections);
  } else {
    sections=(chapter.moduleFiles||[]).flatMap((file)=>readJson(file).sections||[]);
  }
  const claimIds=new Set(claims.map((claim)=>claim.id));
  const sourceIds=new Set(sources.map((source)=>source.id));
  const traces=sections.flatMap((section)=>section.paragraphClaimIds||[]);
  return {claims,sources,sections,claimIds,sourceIds,traces,paragraphs:sections.flatMap((section)=>section.paragraphs||[])};
}

test('Sport er komplett og bevarer den canonicale Fase 3-strukturen', () => {
  const { report } = auditSportPhase3();
  assert.equal(report.subject.id, 'sport');
  assert.equal(report.subject.schemaFamily, 'standard_canonical');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.deepEqual({domainCount:report.summary.domainCount,emneCount:report.summary.emneCount,methodCount:report.summary.methodCount,mappingCount:report.summary.mappingCount,hookCount:report.summary.hookCount}, {domainCount:6,emneCount:116,methodCount:109,mappingCount:116,hookCount:60});
  assert.equal(report.summary.registeredChapterCount,6);
  assert.equal(report.status,'sport_complete');
});

test('Sport har 6/6 kapitler i canonical rekkefølge og dekker 116/116 emner nøyaktig én gang', () => {
  const pensum=readJson('data/fag/sport/sportpensum_canonical_v4_5.json');
  const registry=readJson('data/fagverk/fagverk_registry.json').subjects.sport;
  assert.deepEqual(registry.chapters.map((chapter)=>chapter.primary_domain_id),ORDER);
  const allTopics=[];
  for (const domain of pensum.domains) {
    const row=registry.chapters.find((chapter)=>chapter.primary_domain_id===domain.domain_id);
    assert.ok(row,`mangler ${domain.domain_id}`);
    const chapter=readJson(row.file);
    assert.ok(sameSet(chapter.emne_ids,domain.emne_ids),`${chapter.id} emnedekning`);
    assert.ok(sameSet(chapter.method_ids,domain.method_ids),`${chapter.id} metodedekning`);
    allTopics.push(...chapter.emne_ids);
  }
  assert.equal(allTopics.length,116);
  assert.equal(new Set(allTopics).size,116);
});

test('alle seks Sport-kapitler har 9 seksjoner, 27 avsnitt, 27 claims og inspiserbare eksterne kilder', () => {
  const registry=readJson('data/fagverk/fagverk_registry.json').subjects.sport;
  let sections=0, paragraphs=0, claims=0, sources=0;
  for (const row of registry.chapters) {
    const chapter=readJson(row.file);
    const e=evidenceFor(chapter);
    assert.equal(e.sections.length,9,chapter.id);
    assert.equal(e.paragraphs.length,27,chapter.id);
    assert.equal(e.claims.length,27,chapter.id);
    assert.ok(e.sources.length>=10,chapter.id);
    assert.ok(e.sources.every((source)=>source.title&&source.publisher&&/^https:\/\//.test(source.url)),`${chapter.id} ekstern kilde`);
    assert.ok(e.claims.every((claim)=>claim.sourceIds?.length&&claim.sourceIds.every((id)=>e.sourceIds.has(id))),`${chapter.id} claim-kilde`);
    assert.equal(e.traces.length,27,`${chapter.id} trace-antall`);
    assert.ok(e.traces.every((ids)=>ids.length&&ids.every((id)=>e.claimIds.has(id))),`${chapter.id} paragraph-claim trace`);
    sections+=e.sections.length; paragraphs+=e.paragraphs.length; claims+=e.claims.length; sources+=e.sources.length;
  }
  assert.deepEqual({sections,paragraphs,claims,sources},{sections:54,paragraphs:162,claims:162,sources:74});
});

test('Sport completion overlay og status er konsistente', () => {
  const completion=readJson('data/fagverk/sport/sport_completion_v1.json');
  const status=readJson('data/fagverk/subject_status.json').subjects.find((row)=>row.id==='sport');
  assert.equal(completion.status,'complete');
  assert.equal(completion.complete_ready,true);
  assert.deepEqual({domains:completion.canonical_domain_count,topics:completion.canonical_topic_count,methods:completion.canonical_method_count,chapters:completion.chapter_count,sections:completion.section_count,paragraphs:completion.paragraph_count,claims:completion.claim_count},{domains:6,topics:116,methods:109,chapters:6,sections:54,paragraphs:162,claims:162});
  assert.deepEqual(completion.chapter_order,['arenaer-steder-groundhopper','regler-spill-konkurranse','kropp-trening-prestasjon','klubber-lag-frivillighet','supportere-publikum-kultur','inkludering-helse-lek-samfunn']);
  assert.equal(status.editorialStatus,'complete');
  assert.equal(status.nextGate,completion.next_gate);
});

test('Sport beholder source-first og Groundhopper-kontraktene', () => {
  const { report }=auditSportPhase3();
  assert.equal(report.gates.sourceFirstGenerationLocked,true);
  assert.equal(report.gates.groundhopperPlaceLogicPreserved,true);
  assert.equal(report.gates.completeDomainCoverage,true);
  assert.equal(report.gates.completeTopicCoverage,true);
  assert.equal(report.gates.completeMethodCoverage,true);
  assert.equal(report.gates.paragraphClaimTraceComplete,true);
});

test('Sport-merkesiden skiller merket fra fagsiden', () => {
  const html=fs.readFileSync(path.join(root,'data/fag/sport/merke_sport.html'),'utf8');
  assert.match(html,/fagverk-forside\.html/);
  assert.match(html,/fagverk\.html\?subject=sport/);
});
