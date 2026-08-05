import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('Vitenskap V5 er aktiv canonical versjon med ti moduler', () => {
  const manifest = read('data/fag/fag_manifest.json');
  const pensum = read('data/fag/vitenskap/vitenskappensum_canonical_v5.json');
  assert.equal(manifest.vitenskap.canonicalModelVersion, '5.0');
  assert.equal(manifest.vitenskap.pensum, 'vitenskap/vitenskappensum_canonical_v5.json');
  assert.equal(pensum.modules.length, 10);
  assert.equal(pensum.summary.emne_count, 80);
  assert.equal(pensum.summary.method_count, 84);
  assert.equal(pensum.summary.method_family_count, 12);
});

test('alle Vitenskap-emner har læringsutbytte, evidensport og vurderingsoppgave', () => {
  const emner = read('data/fag/vitenskap/emner_vitenskap_canonical_v5.json');
  assert.equal(emner.length, 80);
  assert.equal(new Set(emner.map((e) => e.emne_id)).size, 80);
  for (const emne of emner) {
    assert.ok(emne.module_id);
    assert.ok(emne.definition);
    assert.ok(emne.why_it_matters);
    assert.ok(emne.learning_outcomes.length >= 4);
    assert.ok(emne.evidence_requirements.length >= 4);
    assert.equal(emne.source_gate.status, 'blocking');
    assert.ok(emne.assessment_task.criteria.length >= 5);
  }
});

test('alle Vitenskap-metoder er operasjonalisert i tolv metodefamilier', () => {
  const doc = read('data/fag/vitenskap/methods_vitenskap_canonical_v5.json');
  assert.equal(doc.method_families.length, 12);
  assert.equal(doc.methods.length, 84);
  assert.equal(doc.methods.filter((m) => m.method_role === 'core').length, 12);
  for (const method of doc.methods) {
    assert.equal(method.operational_status, 'operationalized_v5');
    assert.ok(method.procedure_steps.length >= 5);
    assert.ok(method.validity_conditions.length >= 4);
    assert.ok(method.quality_gates.length >= 4);
    assert.ok(method.blocked_when.length >= 4);
  }
});

test('Vitenskap og Teknologi har eksplisitt og bevart faggrense', () => {
  const manifest = read('data/fag/fag_manifest.json');
  const emner = read('data/fag/vitenskap/emner_vitenskap_canonical_v5.json');
  const technology = manifest.vitenskap.specializations.teknologi;
  assert.equal(technology.canonicalModelVersion, '3.0');
  assert.equal(technology.status, 'canonical_scientific_specialization');
  const overlap = emner.filter((e) => e.technology_overlap_risk === 'high');
  assert.ok(overlap.length > 0);
  assert.ok(overlap.every((e) => e.technology_boundary.includes('Teknologi V3')));
});
