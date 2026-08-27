import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  bindings: 'data/fag/utdanning/theory_integrity_bindings_utdanning_v1.json',
  pensum: 'data/fag/utdanning/utdanningpensum_canonical_v1.json',
  emner: 'data/fag/utdanning/emner_utdanning_canonical_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/utdanning-theory-integrity-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]);

export function auditUtdanningTheoryIntegrity({ writeReport = false, checkReport = true } = {}) {
  const bindings = read(P.bindings);
  const pensum = read(P.pensum);
  const emners = read(P.emner);
  const registry = read(P.registry).subjects.utdanning;
  assert(bindings.schema === 'history_go_utdanning_theory_integrity_bindings_v1' && bindings.status === 'canonical', 'Ugyldige Utdanning theory-integrity bindings');
  assert(bindings.subject_id === 'utdanning' && bindings.profile === 'theorist_rival', 'Utdanning strict proof må bruke theorist_rival-profil');
  assert(bindings.completion_status_read_only === true && bindings.content_mutation === false, 'Strict proof skal bevise eksisterende innhold');
  assert(/aldri automatisk elevdiagnose/u.test(bindings.safety_boundary), 'Utdanning safety boundary mangler');
  assert(pensum.domain_order.length === 14 && bindings.fields.length === 14, 'Utdanning strict proof skal dekke 14 hovedfelt');
  assert(sameSet(bindings.fields.map((field) => field.domain_id), pensum.domain_order), 'Strict proof-feltene må samsvare med domain_order');

  const registryByDomain = new Map(registry.chapters.map((chapter) => [chapter.primary_domain_id, chapter]));
  const emneIds = new Set(emners.map((entry) => entry.emne_id));
  const objectIds = new Set();
  const scholarlySourceIds = new Set();
  let actualProseBindings = 0;
  let verifiedClaims = 0;
  const fieldReports = [];

  for (const domainId of pensum.domain_order) {
    const field = bindings.fields.find((entry) => entry.domain_id === domainId);
    const chapterEntry = registryByDomain.get(domainId);
    assert(field && chapterEntry, `${domainId}: strict field eller kapittel mangler`);
    assert(field.model_objects.length === 2 && sameSet(field.comparison.model_object_ids, field.model_objects.map((entry) => entry.id)), `${domainId}: to sammenlignede modellobjekter kreves`);
    assert(field.comparison.interpretive_consequence.length >= 120, `${domainId}: sammenligningen er for svak`);
    const chapter = read(chapterEntry.file);
    const claimsDoc = read(chapterEntry.claimsFile);
    const claimsById = new Map(claimsDoc.claims.map((claim) => [claim.id, claim]));
    const sourcesById = new Map(claimsDoc.sources.map((source) => [source.id, source]));
    const sectionsByKey = new Map();
    let paragraphCount = 0;
    for (const moduleFile of chapter.moduleFiles) {
      for (const section of read(moduleFile).sections) {
        sectionsByKey.set(`${moduleFile}::${section.id}`, section);
        paragraphCount += section.paragraphs.length;
      }
    }
    assert(chapter.moduleFiles.length === 4 && sectionsByKey.size === 8 && paragraphCount === 32, `${domainId}: canonical 4/8/32-struktur mangler`);
    assert(claimsDoc.claims.length === 32 && claimsDoc.claims.every((claim) => claim.status === 'verified'), `${domainId}: 32 verifiserte claims kreves`);
    verifiedClaims += 32;
    const fieldSources = new Set();

    for (const object of field.model_objects) {
      assert(!objectIds.has(object.id), `Duplikat modellobjekt: ${object.id}`); objectIds.add(object.id);
      assert(object.domain_id === domainId && emneIds.has(object.emne_id), `${object.id}: domain-/emnebinding feiler`);
      assert(object.model_kind.length >= 12 && object.model_name.length >= 12 && object.named_work_binding.length >= 20, `${object.id}: navngitt teori-/verkbinding mangler`);
      for (const key of ['scope', 'core_claim_or_mechanism', 'rival_or_alternative', 'interpretive_consequence']) assert(object[key].length >= 30, `${object.id}: ${key} er for svak`);
      assert(object.limitations.length >= 2 && object.limitations.every((value) => value.length >= 80), `${object.id}: eksplisitte begrensninger mangler`);
      assert(object.content_bindings.length === 3 && sameSet(object.content_bindings.map((entry) => entry.role), ['mechanism', 'limitation', 'alternative']), `${object.id}: prosebinding-roller feiler`);
      const source = sourcesById.get(object.scholarly_source.source_id);
      assert(source && source.url === object.scholarly_source.url && source.url.startsWith('https://'), `${object.id}: scholarly source må finnes i claim ledger`);
      assert(source.source_location && /^verified_\d{4}-\d{2}-\d{2}$/u.test(source.retrieval_status || ''), `${object.id}: source locator/retrieval mangler`);
      assert(object.scholarly_source.source_role.length >= 25 && object.scholarly_source.use_limit.length >= 60, `${object.id}: source role/use limit mangler`);
      assert(!fieldSources.has(source.id), `${domainId}: modellobjektene må ha selvstendige kilder`); fieldSources.add(source.id); scholarlySourceIds.add(source.id);

      for (const contentBinding of object.content_bindings) {
        assert(contentBinding.chapter_file === chapterEntry.file && chapter.moduleFiles.includes(contentBinding.module_file), `${object.id}/${contentBinding.role}: filbinding feiler`);
        const section = sectionsByKey.get(`${contentBinding.module_file}::${contentBinding.section_id}`);
        const paragraph = section?.paragraphs[contentBinding.paragraph_index];
        const trace = section?.paragraphClaimIds[contentBinding.paragraph_index];
        const claim = claimsById.get(contentBinding.claim_id);
        assert(typeof paragraph === 'string' && paragraph.length >= 120 && trace.includes(contentBinding.claim_id) && claim, `${object.id}/${contentBinding.role}: faktisk prosa/claimspor mangler`);
        assert(sameSet(contentBinding.source_ids, claim.source_ids), `${object.id}/${contentBinding.role}: kildebinding avviker`);
        if (contentBinding.role === 'mechanism') {
          assert(paragraph === object.core_claim_or_mechanism && claim.source_ids.includes(source.id), `${object.id}: mekanismebinding feiler`);
        }
        if (contentBinding.role === 'limitation') assert(paragraph === object.limitations[0], `${object.id}: begrensningsbinding feiler`);
        actualProseBindings += 1;
      }
    }
    fieldReports.push({ domainId, strictlyProven: true, modelObjectCount: 2, scholarlySourceCount: fieldSources.size, proseBindingCount: 6, namedWorkBinding: 'verified', educationSafetyGuard: true });
  }

  assert(objectIds.size === 28 && scholarlySourceIds.size === 28, 'Utdanning strict proof skal ha 28 unike modell-/kildebindinger');
  assert(actualProseBindings === 84 && verifiedClaims === 448, 'Utdanning strict proof totals feiler');
  const report = {
    schema: 'history_go_utdanning_theory_integrity_audit_v1', version: '1.0.0', subject_id: 'utdanning', status: 'STRICTLY_PROVEN', proof_scope: 'per_canonical_major_field', profile: 'theorist_rival', completion_status_read_only: true, content_rewrite_required: false, person_work_binding: 'verified_named_theory_framework_or_source_work', education_safety: 'general_analysis_no_automatic_individual_decision',
    summary: { canonicalMajorFields: 14, fieldsStrictlyProven: 14, modelObjects: 28, scholarlySources: 28, contentRoleBindings: 84, actualProseBindings: 84, explicitProofBridges: 28, verifiedClaims: 448, registeredChapters: 14, substantiveContentGapsProven: 0 },
    fields: fieldReports,
  };
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true }); fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`); }
  if (checkReport) { assert(fs.existsSync(abs(P.report)), `${P.report} mangler`); assert(JSON.stringify(read(P.report)) === JSON.stringify(report), `${P.report} er utdatert`); }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { console.log(JSON.stringify(auditUtdanningTheoryIntegrity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') }), null, 2)); }
  catch (error) { console.error(`Utdanning theory integrity FEIL: ${error.message}`); process.exitCode = 1; }
}
