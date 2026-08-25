import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  bindings: 'data/fag/helse/theory_integrity_bindings_helse_v1.json',
  pensum: 'data/fag/helse/helsepensum_canonical_v1.json',
  emner: 'data/fag/helse/emner_helse_canonical_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  report: 'reports/fagverk/helse-theory-integrity-audit.json',
};
const abs = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]);

export function auditHelseTheoryIntegrity({ writeReport = false, checkReport = true } = {}) {
  const bindings = read(P.bindings);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const registry = read(P.registry).subjects.helse;
  const safety = read(P.safety);

  assert(bindings.schema === 'history_go_helse_theory_integrity_bindings_v1', 'Ugyldig Helse theory-integrity binding schema');
  assert(bindings.version === '1.0.0' && bindings.status === 'canonical', 'Helse theory-integrity bindings må være canonical v1');
  assert(bindings.subject_id === 'helse' && bindings.profile === 'hybrid', 'Helse strict proof må bruke hybrid-profil');
  assert(bindings.completion_status_read_only === true && bindings.content_mutation === false, 'Strict proof skal bevise eksisterende innhold uten å skrive om det');
  assert(safety.status === 'blocking', 'Helse clinical safety contract må være blocking');
  assert(/aldri individuell diagnose/u.test(pensum.safety_boundary || ''), 'Pensum må bevare ikke-individualiserende sikkerhetsgrense');
  assert(Array.isArray(pensum.domain_order) && pensum.domain_order.length === 12, 'Helse skal ha 12 canonicale hovedfelt');
  assert(Array.isArray(bindings.fields) && bindings.fields.length === 12, 'Helse strict proof skal dekke 12 hovedfelt');
  assert(sameSet(bindings.fields.map((field) => field.domain_id), pensum.domain_order), 'Strict proof-feltene må være identiske med canonical domain_order');

  const registryByDomain = new Map(registry.chapters.map((chapter) => [chapter.primary_domain_id, chapter]));
  const emneIds = new Set(emner.map((entry) => entry.emne_id));
  const objectIds = new Set();
  const scholarlySourceIds = new Set();
  let contentRoleBindings = 0;
  let actualProseBindings = 0;
  let verifiedClaims = 0;
  const fieldReports = [];

  for (const domainId of pensum.domain_order) {
    const field = bindings.fields.find((entry) => entry.domain_id === domainId);
    const chapterEntry = registryByDomain.get(domainId);
    assert(field && chapterEntry, `${domainId}: mangler strict field eller registry-kapittel`);
    assert(Array.isArray(field.model_objects) && field.model_objects.length === 2, `${domainId}: må ha to komplementære modellobjekter`);
    assert(sameSet(field.comparison?.model_object_ids || [], field.model_objects.map((object) => object.id)), `${domainId}: comparison må binde begge modellobjektene`);
    assert(String(field.comparison?.interpretive_consequence || '').length >= 120, `${domainId}: comparison mangler faglig tolkningskonsekvens`);

    const chapter = read(chapterEntry.file);
    const claimsDoc = read(chapterEntry.claimsFile);
    const claimsById = new Map(claimsDoc.claims.map((claim) => [claim.id, claim]));
    const sourcesById = new Map(claimsDoc.sources.map((source) => [source.id, source]));
    const sectionsByKey = new Map();
    let paragraphCount = 0;
    for (const moduleFile of chapter.moduleFiles) {
      const module = read(moduleFile);
      for (const section of module.sections) {
        sectionsByKey.set(`${moduleFile}::${section.id}`, section);
        paragraphCount += section.paragraphs.length;
      }
    }
    assert(chapter.moduleFiles.length === 4 && sectionsByKey.size === 8 && paragraphCount === 32, `${domainId}: canonicalt kapittel skal være 4/8/32`);
    assert(claimsDoc.claims.length === 32 && claimsDoc.claims.every((claim) => claim.status === 'verified'), `${domainId}: 32 verifiserte claims kreves`);
    verifiedClaims += claimsDoc.claims.length;

    const fieldSourceIds = new Set();
    for (const object of field.model_objects) {
      assert(!objectIds.has(object.id), `Duplikat model object: ${object.id}`);
      objectIds.add(object.id);
      assert(object.domain_id === domainId && emneIds.has(object.emne_id), `${object.id}: canonical domain-/emnebinding feiler`);
      assert(String(object.model_kind || '').length >= 8, `${object.id}: mangler model_kind`);
      assert(String(object.model_name || '').length >= 12, `${object.id}: mangler model_name`);
      for (const key of ['scope', 'core_claim_or_mechanism', 'rival_or_alternative', 'interpretive_consequence']) {
        assert(String(object[key] || '').length >= 30, `${object.id}: mangler substansiell ${key}`);
      }
      assert(Array.isArray(object.limitations) && object.limitations.length >= 2 && object.limitations.every((value) => String(value).length >= 80), `${object.id}: eksplisitte gyldighetsgrenser mangler`);
      assert(Array.isArray(object.content_bindings) && object.content_bindings.length === 3, `${object.id}: må ha mechanism/limitation/alternative-bindings`);
      assert(sameSet(object.content_bindings.map((binding) => binding.role), ['mechanism', 'limitation', 'alternative']), `${object.id}: feil prosebinding-roller`);

      const source = sourcesById.get(object.scholarly_source?.source_id);
      assert(source, `${object.id}: scholarly source finnes ikke i kapittelets claim ledger`);
      assert(source.url === object.scholarly_source.url && /^https:\/\//u.test(source.url), `${object.id}: source URL må være inspectable og identisk med ledger`);
      assert(source.source_location && /^verified_\d{4}-\d{2}-\d{2}$/u.test(source.retrieval_status || ''), `${object.id}: source locator/retrieval mangler`);
      assert(String(object.scholarly_source.source_role || '').length >= 30 && String(object.scholarly_source.use_limit || '').length >= 60, `${object.id}: source role/use limit mangler`);
      assert(!fieldSourceIds.has(source.id), `${domainId}: de to modellobjektene må ha selvstendige scholarly source-bindings`);
      fieldSourceIds.add(source.id);
      scholarlySourceIds.add(source.id);

      for (const binding of object.content_bindings) {
        assert(binding.chapter_file === chapterEntry.file && chapter.moduleFiles.includes(binding.module_file), `${object.id}/${binding.role}: chapter/module-binding feiler`);
        const section = sectionsByKey.get(`${binding.module_file}::${binding.section_id}`);
        assert(section, `${object.id}/${binding.role}: section finnes ikke`);
        const paragraph = section.paragraphs[binding.paragraph_index];
        const trace = section.paragraphClaimIds[binding.paragraph_index];
        const claim = claimsById.get(binding.claim_id);
        assert(typeof paragraph === 'string' && paragraph.length >= 120, `${object.id}/${binding.role}: faktisk prosa mangler`);
        assert(Array.isArray(trace) && trace.includes(binding.claim_id) && claim, `${object.id}/${binding.role}: claimspor feiler`);
        assert(sameSet(binding.source_ids || [], claim.source_ids || []), `${object.id}/${binding.role}: source-binding avviker fra claim ledger`);
        if (binding.role === 'mechanism') {
          assert(paragraph === object.core_claim_or_mechanism, `${object.id}: mechanism-prosa må være eksakt bundet`);
          assert(claim.source_ids.includes(source.id), `${object.id}: scholarly source må bære mechanism-claimet`);
        }
        if (binding.role === 'limitation') assert(paragraph === object.limitations[0], `${object.id}: limitation-prosa må være eksakt bundet`);
        contentRoleBindings += 1;
        actualProseBindings += 1;
      }
    }

    fieldReports.push({
      domainId,
      strictlyProven: true,
      modelObjectCount: 2,
      scholarlySourceCount: fieldSourceIds.size,
      proseBindingCount: 6,
      explicitProofBridgeCount: 2,
      personWorkBinding: 'not_applicable_hybrid_without_named_person_provenance',
      healthSafetyGuard: true,
    });
  }

  assert(objectIds.size === 24 && scholarlySourceIds.size === 24, 'Helse strict proof skal ha 24 unike model/source-bindings');
  assert(contentRoleBindings === 72 && actualProseBindings === 72 && verifiedClaims === 384, 'Helse strict proof totals feiler');

  const report = {
    schema: 'history_go_helse_theory_integrity_audit_v1',
    version: '1.0.0',
    subject_id: 'helse',
    status: 'STRICTLY_PROVEN',
    proof_scope: 'per_canonical_major_field',
    profile: 'hybrid',
    completion_status_read_only: true,
    content_rewrite_required: false,
    person_work_binding: 'not_applicable_hybrid_without_named_person_provenance',
    health_safety: 'blocking_general_education_no_individual_diagnosis_prognosis_triage_treatment_legal_or_budget_decision',
    summary: {
      canonicalMajorFields: 12,
      fieldsStrictlyProven: 12,
      modelObjects: 24,
      scholarlySources: 24,
      contentRoleBindings: 72,
      actualProseBindings: 72,
      explicitProofBridges: 24,
      verifiedClaims: 384,
      registeredChapters: 12,
      substantiveContentGapsProven: 0,
    },
    fields: fieldReports,
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
    assert(JSON.stringify(read(P.report)) === JSON.stringify(report), `${P.report} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    console.log(JSON.stringify(auditHelseTheoryIntegrity({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report'),
    }), null, 2));
  } catch (error) {
    console.error(`Helse theory integrity FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
