import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSportPhase3 } from '../scripts/audit-fagverk-sport-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));

test('Sport bevarer Fase 3-strukturen gjennom kapittelproduksjon', () => {
  const { report } = auditSportPhase3();
  assert.equal(report.subject.id, 'sport');
  assert.equal(report.subject.schemaFamily, 'standard_canonical');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.ok(['structure_ready','chapters_in_progress'].includes(report.subject.editorialStatus));
  if (report.summary.registeredChapterCount === 0) assert.equal(report.subject.nextGate, 'chapter_production');
  else assert.match(report.subject.nextGate, /_chapter_production$/);
  assert.deepEqual({domainCount:report.summary.domainCount,emneCount:report.summary.emneCount,methodCount:report.summary.methodCount,mappingCount:report.summary.mappingCount,hookCount:report.summary.hookCount}, {domainCount:6,emneCount:116,methodCount:109,mappingCount:116,hookCount:60});
});

test('Sport beholder seks canonicale områder uten syntetiske fagområder', () => {
  const { report, model } = auditSportPhase3();
  assert.deepEqual(report.canonicalDomainOrder, ['arenaer_steder_groundhopper','regler_spill_konkurranse','kropp_trening_prestasjon','klubber_lag_frivillighet','supportere_publikum_kultur','inkludering_helse_lek_samfunn']);
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'));
  assert.equal(Object.values(report.domainEmneCounts).reduce((sum, count) => sum + count, 0), 116);
});

test('alle Sport-emner og metoder er strukturelt bevart', () => {
  const { report, model } = auditSportPhase3();
  assert.equal(model.emners.length, 116);
  assert.equal(report.gates.allCanonicalEmnersInPensum, true);
  assert.equal(report.gates.allCanonicalEmnersInMappingRegistry, true);
  assert.equal(report.gates.allMethodReferencesResolved, true);
  assert.equal(report.gates.editorialProgressionMonotonic, true);
});

test('Sport beholder source-first og Groundhopper-kontraktene', () => {
  const { report } = auditSportPhase3();
  assert.equal(report.gates.sourceFirstGenerationLocked, true);
  assert.equal(report.gates.groundhopperPlaceLogicPreserved, true);
});

test('første Sport-kapittel dekker Arenaer 20/20 og 23/23 metoder', () => {
  const c=readJson('data/fagverk/sport/arenaer-steder-groundhopper.json');
  const p=readJson('data/fag/sport/sportpensum_canonical_v4_5.json');
  const d=p.domains.find(x=>x.domain_id==='arenaer_steder_groundhopper');
  assert.deepEqual(new Set(c.emne_ids),new Set(d.emne_ids));
  assert.deepEqual(new Set(c.method_ids),new Set(d.method_ids));
  assert.equal(c.emne_ids.length,20); assert.equal(c.method_ids.length,23);
  assert.ok(c.emne_ids.includes('em_sport_groundhopper_stedsbesok'));
});

test('første Sport-kapittel har full claim- og kildeproveniens', () => {
  const c=readJson('data/fagverk/sport/arenaer-steder-groundhopper.json');
  const claims=readJson(c.claimsFile).claims; const sources=readJson(c.sourcesFile).sources;
  const claimIds=new Set(claims.map(x=>x.id)); const sourceIds=new Set(sources.map(x=>x.id));
  assert.equal(claims.length,27); assert.equal(sources.length,14);
  assert.ok(sources.every(x=>x.title&&x.publisher&&x.sourceLocation&&/^https:\/\//.test(x.url)));
  assert.ok(claims.every(x=>x.sourceIds.length&&x.sourceIds.every(id=>sourceIds.has(id))));
  const sectionFiles=['01-arena-som-sted.json','02-groundhopper.json','03-hall-is-ski.json','04-tilgang.json','05-hverdagsidrett.json','06-frivillighet.json','07-stadionminne.json','08-arenaendring.json','09-flerbruk.json'];
  const sections=sectionFiles.flatMap(f=>readJson('data/fagverk/sport/arenaer-steder-groundhopper/'+f).sections);
  assert.equal(sections.length,9);
  assert.equal(sections.flatMap(x=>x.paragraphs).length,27);
  assert.ok(sections.flatMap(x=>x.paragraphClaimIds).every(ids=>ids.length&&ids.every(id=>claimIds.has(id))));
});

test('Sport-status og registry følger første kapittel', () => {
  const c=readJson('data/fagverk/sport/arenaer-steder-groundhopper.json');
  const reg=readJson('data/fagverk/fagverk_registry.json').subjects.sport;
  const s=readJson('data/fagverk/subject_status.json').subjects.find(x=>x.id==='sport');
  assert.ok(reg.chapters.some(x=>x.id===c.id));
  assert.equal(s.editorialStatus,'chapters_in_progress');
  assert.equal(s.nextGate,'regler_spill_konkurranse_chapter_production');
});

test('Sport-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/sport/merke_sport.html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=sport/);
});
