import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryIntegrity } from '../scripts/audit-fagverk-theory-integrity.mjs';

test('field-level theory integrity audit covers the full canonical Fagverk scope', () => {
  const report = auditFagverkTheoryIntegrity();
  assert.equal(report.scope.topLevelSubjects, 17);
  assert.equal(report.scope.nestedSpecializations, 1);
  assert.equal(report.scope.totalAudited, 18);
  assert.equal(report.subjects.length, 18);
  assert.ok(report.scope.canonicalMajorFields > 0);
});

test('the integrity audit stays read-only and cannot claim final readiness during reconciliation', () => {
  const report = auditFagverkTheoryIntegrity();
  assert.equal(report.mode, 'read_only');
  assert.equal(report.completionStatusChangesAllowed, false);
  assert.equal(report.finalReady, false);
  assert.match(report.finalReadyRule, /separat reconciliation/i);
});

test('every resolved field reports concrete evidence or an explicit missing signal', () => {
  const report = auditFagverkTheoryIntegrity();
  for (const subject of report.subjects) {
    assert.ok(['green', 'yellow', 'red'].includes(subject.status), `${subject.id} har ugyldig status`);
    assert.ok(Array.isArray(subject.parseFailures));
    for (const field of subject.fields) {
      assert.ok(field.id, `${subject.id} har felt uten id`);
      assert.ok(['green', 'yellow', 'red'].includes(field.status), `${subject.id}/${field.id} har ugyldig status`);
      assert.ok(Array.isArray(field.missingSignals));
      assert.ok(Array.isArray(field.evidence));
      if (field.status === 'green') {
        assert.equal(field.missingSignals.length, 0, `${subject.id}/${field.id} er grønt med manglende signaler`);
        assert.ok(field.candidateCount > 0, `${subject.id}/${field.id} er grønt uten teori-/modellkandidat`);
      } else {
        assert.ok(field.missingSignals.length > 0, `${subject.id}/${field.id} mangler forklaring på ikke-grønn status`);
      }
    }
  }
});

test('aggregate 18/18 baseline is not accepted as the final integrity proof', () => {
  const report = auditFagverkTheoryIntegrity();
  assert.notEqual(report.schema, 'history_go_fagverk_theory_quality_audit_v1');
  assert.ok(report.subjects.every((subject) => Number.isInteger(subject.fieldCount)));
  assert.equal(report.finalReady, false);
});
