import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditHelseTheoryIntegrity } from '../tools/audit-helse-theory-integrity.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  pensum: 'data/fag/helse/helsepensum_canonical_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/helse-strict-completion-v1-audit.json',
};
const abs = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const write = (p, value) => {
  fs.mkdirSync(path.dirname(abs(p)), { recursive: true });
  fs.writeFileSync(abs(p), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function materializeHelseStrictCompletionV1() {
  const proof = auditHelseTheoryIntegrity();
  assert(proof.status === 'STRICTLY_PROVEN' && proof.summary.fieldsStrictlyProven === 12, 'Helse strict theory proof er ikke 12/12');
  assert(proof.summary.verifiedClaims === 384 && proof.summary.registeredChapters === 12, 'Helse fulltextgrunnlag er ikke 12 kapitler / 384 claims');

  const pensum = read(P.pensum);
  const registryDoc = read(P.registry);
  const statusDoc = read(P.status);
  const registry = registryDoc.subjects.helse;
  const status = statusDoc.subjects.find((entry) => entry.id === 'helse');

  assert(pensum.domain_order.length === 12 && pensum.domains.every((domain) => domain.status === 'materialized'), 'Alle Helse-domener må være materialized');
  assert(registry.editorialPlan.registeredChapterCount === 12 && registry.chapters.length === 12, 'Helse registry må være 12/12');
  assert(status.navigationStatus === 'materialized' && status.assessmentStatus === 'audited', 'Helse navigation/assessment gate feiler');

  pensum.status = 'complete';
  pensum.complete_ready = true;
  registry.canonicalModel.note = 'Alle tolv Helse-domener er fulltekstmaterialisert source-first og strict completion er bevist per canonicalt hovedfelt. Permanent audit binder 24 modeller, mekanismer eller rammeverk til 24 inspectable scholarly sources, 72 eksakte claim-sporede prosebindings og den blokkerende ikke-individualiserende sikkerhetskontrakten.';
  registry.editorialPlan.nextGate = 'complete';
  registry.editorialPlan.strictCompletionProof = {
    status: 'strictly_proven',
    proof_scope: 'per_canonical_major_field',
    canonical_major_fields: 12,
    model_objects: 24,
    scholarly_sources: 24,
    actual_prose_bindings: 72,
    verified_claims: 384,
    bindings_file: 'data/fag/helse/theory_integrity_bindings_helse_v1.json',
    audit_script: 'tools/audit-helse-theory-integrity.mjs',
    audit_report: 'reports/fagverk/helse-theory-integrity-audit.json',
    safety: 'blocking_general_non_individualizing',
  };
  status.editorialStatus = 'complete';
  status.nextGate = 'complete';
  status.note = 'Helse er ferdig: 12/12 fulltekstmaterialiserte domener og 12/12 strict-proven hovedfelt. Beviset omfatter 24 modeller eller rammeverk, 24 inspectable scholarly sources, 72 eksakte claim-sporede prosebindings og 384 verifiserte claims. Den blokkerende sikkerhetsgrensen forbyr individuell diagnose, prognose, triage, behandling, rettighetsavgjørelse og budsjettinstruks.';
  statusDoc.updatedAt = '2026-08-24';

  const report = {
    schema: 'history_go_helse_strict_completion_audit_v1',
    version: '1.0.0',
    subject_id: 'helse',
    status: 'complete',
    editorialStatus: 'complete',
    fulltextDomains: 12,
    canonicalMajorFields: 12,
    fieldsStrictlyProven: 12,
    registeredChapters: 12,
    verifiedClaims: 384,
    modelObjects: 24,
    scholarlySources: 24,
    actualProseBindings: 72,
    substantiveContentGapsProven: 0,
    clinicalSafety: 'blocking_general_non_individualizing',
    nextSubject: 'utdanning',
  };

  write(P.pensum, pensum);
  write(P.registry, registryDoc);
  write(P.status, statusDoc);
  write(P.report, report);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(materializeHelseStrictCompletionV1(), null, 2));
  } catch (error) {
    console.error(`Helse strict completion FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
