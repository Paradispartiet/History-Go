#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const A = (value) => Array.isArray(value) ? value : [];
const domainId = 'his_tid_periodisering';
const concepts = JSON.parse(fs.readFileSync('data/fag/historie/concepts_historie_canonical_v5_5.json', 'utf8'));
const theories = JSON.parse(fs.readFileSync('data/fag/historie/theory_objects_historie_canonical_v5_5.json', 'utf8'));
const emners = JSON.parse(fs.readFileSync('data/fag/historie/emner_historie_canonical_v4_5.json', 'utf8'));
const expectedConceptIds = ["con_his_1800_tallets","con_his_anakronisme","con_his_apne","con_his_begreper","con_his_brudd","con_his_byrom","con_his_datering","con_his_dateringsgrunnlag","con_his_dateringsusikkerhet","con_his_endringstempo","con_his_epoker","con_his_erfaring","con_his_erfaringsrom","con_his_ettertid","con_his_fortelling","con_his_forventningshorisont","con_his_framtider","con_his_hendelse","con_his_historisk_endring","con_his_historiske_rytmer","con_his_kildegrunnlag","con_his_kontinuitet","con_his_kronologi","con_his_lag","con_his_lang","con_his_lang_varighet","con_his_modernisering","con_his_periodisering","con_his_prosess","con_his_samtid","con_his_samtidighet","con_his_samtidshistorie","con_his_stedlig_spor","con_his_strukturer","con_his_tid","con_his_tidsforlop","con_his_tidsmessig","con_his_tidsmessig_usikkerhet","con_his_ulike","con_his_usikkerhet","con_his_varighet"];
const forbiddenLabels = ["1800-tallets","åpne","begreper","brudd","byrom","epoker","erfaring","ettertid","fortelling","framtider","hendelse","kontinuitet","lag","lang","prosess","samtid","strukturer","tid","tidsmessig","ulike","usikkerhet","varighet"];
const genericDefinition = /^I .+ betegner «.+» en historisk avgrenset relasjon, praksis, prosess eller institusjon som må dokumenteres gjennom kilder, tid, sted og aktører\.$/;
const genericMisuse = /^Å bruke «.+» som en tidløs etikett uten kilde, kronologi eller aktør\.$/;
const genericTheory = new Set(['Må brukes med eksplisitt tids-, steds- og kildeavgrensning.','Kan ikke erstatte dokumentert historisk årsaksanalyse eller kontrollkilde.']);
const failures = [];
const pass = (condition, label) => condition ? console.log('PASS | ' + label) : failures.push(label);

const selectedConcepts = concepts.filter((item) => A(item.domain_ids).includes(domainId));
pass(selectedConcepts.length === 41, '41 domain concepts');
pass(JSON.stringify(selectedConcepts.map((item) => item.concept_id).sort()) === JSON.stringify(expectedConceptIds), 'concept id set');
for (const concept of selectedConcepts) {
  const relations = [...A(concept.broader_concepts), ...A(concept.narrower_concepts), ...A(concept.related_concepts), ...A(concept.distinguish_from)];
  pass(concept.curation_status === 'individually_curated', concept.concept_id + ': curated');
  pass(!genericDefinition.test(concept.definition || '') && String(concept.definition || '').length >= 80, concept.concept_id + ': specific definition');
  pass(relations.length >= 2, concept.concept_id + ': semantic relations');
  pass(A(concept.common_misuse).length >= 1 && !A(concept.common_misuse).every((item) => genericMisuse.test(item)), concept.concept_id + ': misuse guard');
  pass(A(concept.domain_ids).length >= 1 && A(concept.source_emne_ids).length >= 1, concept.concept_id + ': provenance');
}

const selectedTheories = theories.filter((item) => A(item.explanatory_scope).includes(domainId));
pass(selectedTheories.length === 10, '10 domain theories');
const signatures = new Set();
for (const theory of selectedTheories) {
  const signature = JSON.stringify(A(theory.limitations).slice().sort());
  signatures.add(signature);
  pass(theory.curation_status === 'individually_curated', theory.theory_id + ': curated');
  pass(A(theory.limitations).length >= 2 && A(theory.limitations).every((item) => !genericTheory.has(item)), theory.theory_id + ': specific limitations');
  pass(A(theory.method_links).length >= 1 && A(theory.thinker_ids).length >= 1 && Boolean(theory.source_hook_id), theory.theory_id + ': linked');
  pass(theory.evidence_ready === false, theory.theory_id + ': evidence gate');
}
pass(signatures.size === 10, 'unique theory limitation profiles');

for (const emne of emners) {
  for (const key of ['key_concepts', 'core_concepts', 'sub_concepts']) {
    const values = A(emne[key]);
    for (const oldLabel of forbiddenLabels) pass(!values.includes(oldLabel), emne.emne_id + ': no stale concept label ' + oldLabel);
  }
}

const globalRun = spawnSync(process.execPath, ['tools/validate-historie-v5.mjs', '--write'], { stdio: 'inherit' });
pass(globalRun.status === 0, 'global structural validator');
const readiness = JSON.parse(fs.readFileSync('reports/historie-v5/historie-v5-5-readiness.json', 'utf8'));
const domain = A(readiness.domains).find((item) => item.domain_id === domainId);
pass(Boolean(domain?.freeze_ready), 'time domain freeze ready');
pass(domain?.issue_counts?.concepts === 0 && domain?.issue_counts?.theories === 0 && domain?.issue_counts?.emner === 0, 'time domain zero quality gaps');
pass(readiness.v6_allowed === false, 'V6 remains blocked until all domains pass');
pass(readiness.quality_issue_totals.concepts <= 785, 'global concept queue reduced');
pass(readiness.quality_issue_totals.theories <= 190, 'global theory queue reduced');

const report = {
  version: 'historie-quality-freeze-v1',
  domain_id: domainId,
  status: failures.length ? 'FAIL' : 'PASS',
  concepts_curated: selectedConcepts.length,
  theories_curated: selectedTheories.length,
  remaining_global_quality_issues: readiness.quality_issue_totals,
  freeze_ready_domains: A(readiness.domains).filter((item) => item.freeze_ready).map((item) => item.domain_id),
  v6_allowed: readiness.v6_allowed,
  failures
};
fs.writeFileSync('reports/historie-v5/tid-periodisering-quality-freeze.json', JSON.stringify(report, null, 2) + '\n');
if (failures.length) {
  console.error('RESULT | ' + (selectedConcepts.length + selectedTheories.length) + ' objects checked, ' + failures.length + ' FAIL');
  for (const failure of failures) console.error('FAIL | ' + failure);
  process.exit(1);
}
console.log('RESULT | Historisk tid og periodisering is freeze-ready');
