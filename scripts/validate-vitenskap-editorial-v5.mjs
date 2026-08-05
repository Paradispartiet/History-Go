#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const arr = (v) => Array.isArray(v) ? v : [];
const clean = (v) => String(v ?? '').trim();
const fail = [];
let pass = 0;
const check = (condition, message) => { if (condition) pass += 1; else fail.push(message); };
const unique = (xs) => new Set(xs).size === xs.length;

const manifest = read('data/fag/fag_manifest.json');
const entry = manifest.vitenskap;
const pensum = read('data/fag/vitenskap/vitenskappensum_canonical_v5.json');
const emner = read('data/fag/vitenskap/emner_vitenskap_canonical_v5.json');
const fagkart = read('data/fag/vitenskap/fagkart_vitenskap_canonical_v5.json');
const methodsDoc = read('data/fag/vitenskap/methods_vitenskap_canonical_v5.json');
const methods = arr(methodsDoc.methods);
const mapping = read('data/fag/vitenskap/emnemapping_vitenskap_canonical_v5.json');
const contract = read('data/fag/vitenskap/editorial_contract_vitenskap_v5.json');
const legacy = read('data/fag/vitenskap/canonical_legacy_status_vitenskap_v5.json');
const sourcePolicy = read('data/fag/vitenskap/source_policy_vitenskap_v5.json');
const report = read('reports/fagverk/vitenskap-editorial-v5-validation.json');
const technology = manifest.vitenskap?.specializations?.teknologi;

check(entry.canonicalModelVersion === '5.0', 'manifest.vitenskap.canonicalModelVersion må være 5.0');
check(entry.pensum === 'vitenskap/vitenskappensum_canonical_v5.json', 'manifestet peker ikke til V5-pensum');
check(entry.emner === 'vitenskap/emner_vitenskap_canonical_v5.json', 'manifestet peker ikke til V5-emner');
check(entry.fagkart === 'vitenskap/fagkart_vitenskap_canonical_v5.json', 'manifestet peker ikke til V5-fagkart');
check(entry.methods === 'vitenskap/methods_vitenskap_canonical_v5.json', 'manifestet peker ikke til V5-metoder');
check(entry.emnemapping === 'vitenskap/emnemapping_vitenskap_canonical_v5.json', 'manifestet peker ikke til V5-emnemapping');
check(entry.editorialStatus === 'reviewed_and_operationalized', 'manifestet mangler redaksjonell ferdigstatus');
check(entry.sourceIntegrity?.status === 'blocking', 'manifestets kildeport må være blokkerende');
check(technology?.status === 'canonical_scientific_specialization', 'Teknologi må fortsatt være canonical nested spesialisering');
check(technology?.canonicalModelVersion === '3.0', 'Teknologi V3 må bevares');

check(pensum.version === 'v5.0-canonical', 'pensumversjon må være V5');
check(pensum.summary?.module_count === 10, 'pensum skal ha 10 moduler');
check(pensum.summary?.emne_count === 80, `pensum skal ha 80 emner, fikk ${pensum.summary?.emne_count}`);
check(pensum.summary?.method_count === 84, `pensum skal ha 84 metoder, fikk ${pensum.summary?.method_count}`);
check(pensum.summary?.method_family_count === 12, 'pensum skal ha 12 metodefamilier');
check(arr(pensum.module_order).length === 10 && unique(pensum.module_order), 'module_order må ha 10 unike moduler');
check(arr(pensum.modules).length === 10, 'pensum.modules må ha 10 rader');
check(pensum.source_integrity?.status === 'blocking', 'pensumets source_integrity må være blocking');
check(pensum.technology_boundary?.status === 'blocking_for_overlap_topics', 'pensum må ha blokkerende teknologigrense');

check(Array.isArray(emner) && emner.length === 80, `V5-emner skal være 80, fikk ${emner.length}`);
check(unique(emner.map((e) => e.emne_id)), 'emne_id må være unike');
check(emner.every((e) => clean(e.emne_id).startsWith('em_vit_')), 'alle emne-ID-er må bruke em_vit_');
check(emner.every((e) => pensum.module_order.includes(e.module_id)), 'alle emner må ha gyldig module_id');
check(emner.every((e) => e.editorial_status === 'reviewed_and_operationalized_v5'), 'alle emner må være redaksjonelt operasjonalisert');
check(emner.every((e) => clean(e.definition) && clean(e.why_it_matters)), 'alle emner må ha definisjon og relevans');
check(emner.every((e) => arr(e.learning_outcomes).length >= 4), 'alle emner må ha minst fire læringsutbytter');
check(emner.every((e) => arr(e.claim_classes).length >= 2), 'alle emner må ha påstandsklasser');
check(emner.every((e) => arr(e.source_requirements).length >= 4), 'alle emner må ha kildekrav');
check(emner.every((e) => arr(e.evidence_requirements).length >= 4), 'alle emner må ha evidenskrav');
check(emner.every((e) => arr(e.failure_modes).length >= 4), 'alle emner må ha feilmodi');
check(emner.every((e) => clean(e.boundary_note)), 'alle emner må ha faggrense');
check(emner.every((e) => arr(e.assessment_task?.criteria).length >= 5), 'alle emner må ha vurderingsoppgave med fem kriterier');
check(emner.every((e) => e.source_gate?.status === 'blocking'), 'alle emner må ha blokkerende source_gate');
check(emner.filter((e) => e.technology_overlap_risk === 'high').length > 0, 'minst ett emne må identifiseres som teknologioverlapp');
check(emner.filter((e) => e.technology_overlap_risk === 'high').every((e) => clean(e.technology_boundary)), 'alle høyrisiko-overlapp må ha eksplisitt teknologigrense');

check(methodsDoc.version === 'v5.0-canonical', 'metodekatalogen må være V5');
check(methods.length === 84, `metodekatalogen skal ha 84 metoder, fikk ${methods.length}`);
check(unique(methods.map((m) => m.method_id)), 'method_id må være unike');
check(arr(methodsDoc.method_families).length === 12, 'metodekatalogen skal ha 12 familier');
check(methods.every((m) => m.operational_status === 'operationalized_v5'), 'alle metoder må være operasjonalisert');
check(methods.every((m) => arr(m.procedure_steps).length >= 5), 'alle metoder må ha fem prosedyresteg');
check(methods.every((m) => arr(m.required_inputs).length >= 4), 'alle metoder må ha datakrav');
check(methods.every((m) => arr(m.observables).length >= 3), 'alle metoder må ha observabler');
check(methods.every((m) => arr(m.validity_conditions).length >= 4), 'alle metoder må ha gyldighetsvilkår');
check(methods.every((m) => arr(m.limitations).length >= 3), 'alle metoder må ha begrensninger');
check(methods.every((m) => arr(m.ethics_gates).length >= 3), 'alle metoder må ha etiske porter');
check(methods.every((m) => arr(m.deliverables).length >= 3), 'alle metoder må ha leveranser');
check(methods.every((m) => arr(m.quality_gates).length >= 4), 'alle metoder må ha kvalitetsporter');
check(methods.every((m) => arr(m.blocked_when).length >= 4), 'alle metoder må ha blokkeringer');
check(methods.every((m) => ['core', 'specialized'].includes(m.method_role)), 'alle metoder må være core eller specialized');
check(methods.filter((m) => m.method_role === 'core').length === 12, 'nøyaktig 12 core-metoder kreves');

check(fagkart.version === 'v5.0-canonical', 'fagkart må være V5');
check(arr(fagkart.categories).length === 10, 'fagkart skal ha 10 kategorier/moduler');
check(fagkart.categories.every((c) => arr(c.emne_ids).length > 0), 'alle fagkartmoduler må ha emner');
check(arr(fagkart.module_order).join('|') === arr(pensum.module_order).join('|'), 'pensum og fagkart må ha samme modulrekkefølge');
check(mapping.length === 80, 'emnemapping skal ha 80 rader');
check(mapping.every((row) => pensum.module_order.includes(row.module_id)), 'alle mapping-rader må ha gyldig modul');
check(mapping.every((row) => arr(row.mappings).every((m) => m.external_claim_basis_required && m.locator_required && m.validity_scope_required)), 'alle mappings må håndheve kilde, lokator og gyldighetsområde');

check(contract.canonical_model_version === '5.0', 'editorial contract må være V5');
check(contract.architecture?.modules === 10 && contract.architecture?.topics === 80 && contract.architecture?.methods === 84, 'kontraktarkitekturen er feil');
check(contract.invariants?.preserve_emne_ids === true && contract.invariants?.preserve_method_ids === true, 'ID-kompatibilitet må være låst');
check(sourcePolicy.status === 'blocking', 'source policy må være blocking');
check(arr(sourcePolicy.required_fields).length === 5, 'source policy skal ha fem obligatoriske felt');
check(legacy.active_version === 'v5.0-canonical', 'legacy-status må peke til V5');
check(arr(legacy.historical_read_only).some((p) => p.includes('v4_5')), 'V4.5 må være historisk read-only');
check(arr(legacy.historical_read_only).some((p) => p.includes('teknologi_it_extension_v1')), 'legacy teknologi-extension må være historisk read-only');
check(report.status === 'pass' && Object.values(report.gates || {}).every(Boolean), 'valideringsrapporten må være pass');

console.log(`Vitenskap V5: ${pass} PASS / ${fail.length} FAIL`);
for (const message of fail) console.error(`FAIL: ${message}`);
if (fail.length) process.exit(1);
