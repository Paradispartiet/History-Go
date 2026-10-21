import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const base = 'data/fag/politikk/';
const audit = read(base + 'advanced_political_science_wave5_targeted_concept_audit_v1.json');
const candidate = read(base + 'advanced_political_science_wave5_election_case_assessment_v1.json');
const concepts = read(base + 'concepts_politikk_canonical_v1.json').concepts;
const emner = read(base + 'emner_politikk_canonical_v4_5.json');
const methods = read(base + 'methods_politikk_canonical_v4_5.json').methods;
const questionSchema = read('data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json');
const normalize = (value) => String(value).toLocaleLowerCase('nb-NO').normalize('NFKD')
  .replace(/\p{M}/gu, '').replace(/[^a-z0-9æøå]+/g, ' ').trim();
const unique = (a) => new Set(a).size;

test('Statsvitenskap v5: hele kanoniske begreps-/emneregisteret er maskinelt kontrollert', () => {
  assert.equal(concepts.length, audit.verified_inventory.concepts.count);
  assert.equal(emner.length, audit.verified_inventory.emner.count);
  assert.equal(unique(concepts.map(c => c.concept_id)), concepts.length);
  assert.equal(unique(concepts.map(c => normalize(c.label))), concepts.length);
  const emneIds = new Set(emner.map(e => e.emne_id));
  assert.equal(unique(emner.map(e => e.emne_id)), emner.length);
  for (const c of concepts) for (const id of c.source_emne_ids || []) assert.ok(emneIds.has(id), c.concept_id + ': ' + id);
  assert.equal(audit.verified_inventory.concepts.read_entire_file, true);
  assert.equal(audit.verified_inventory.emner.read_entire_file, true);
  assert.equal(audit.full_semantic_concept_review, false);
  assert.match(audit.scope, /ikke ekstern fagfellevurdering/i);
});

test('Statsvitenskap v5: vurderingskandidat gjenbruker eksisterende metode, emne og begreper', () => {
  const links = candidate.canonical_links;
  const emne = emner.find(e => e.emne_id === links.emne_id);
  assert.ok(emne);
  assert.equal(emne.domain, links.domain_id);
  assert.ok(emne.methods.includes(links.method_id));
  assert.ok(methods.some(m => m.method_id === links.method_id));
  const byId = new Map(concepts.map(c => [c.concept_id, c]));
  assert.equal(unique(links.concept_ids), links.concept_ids.length);
  for (const id of links.concept_ids) {
    const c = byId.get(id);
    assert.ok(c, id);
    assert.ok(c.source_emne_ids.includes(links.emne_id), id);
  }
  assert.equal(audit.canonical_target.emne_id, links.emne_id);
  assert.equal(audit.canonical_target.method_id, links.method_id);
  assert.deepEqual(audit.canonical_target.assessment_focus_concept_ids, links.concept_ids);
  for (const id of links.concept_ids) assert.ok(audit.canonical_target.relevant_concept_ids.includes(id), id);
  assert.equal(audit.no_new_domains, true);
  assert.equal(audit.no_new_methods, true);
  assert.equal(audit.no_new_concept_ids, true);
  assert.equal(audit.no_new_claim_registry_entries, true);
});

test('Statsvitenskap v5: Polen-oppgaven er etterprøvbar, mekanismeorientert og svarlogisk', () => {
  assert.equal(candidate.case.election_date, '2023-10-15');
  assert.match(candidate.case.unit_of_analysis, /valgkamp og valgadministrasjon/i);
  assert.match(candidate.case.alternative_explanation_to_test, /ikke hvilken andel/i);
  assert.match(candidate.case.inference_limits, /manipulert opptelling/i);
  const q = candidate.assessment;
  for (const field of ['question','options','answer','answerIndex','knowledge','difficulty','question_type','emne_id','source','method_id','concept_ids','claim_basis']) assert.ok(Object.hasOwn(q, field), field);
  assert.ok(questionSchema.question_type_values.includes(q.question_type));
  assert.equal(q.question_scope, 'subject_area');
  assert.equal(q.options.length, 4);
  assert.equal(unique(q.options), 4);
  assert.equal(q.options[q.answerIndex], q.answer);
  assert.equal(q.feedback_by_option.length, q.options.length);
  assert.equal(q.method_id, candidate.canonical_links.method_id);
  assert.equal(q.emne_id, candidate.canonical_links.emne_id);
  assert.deepEqual(q.concept_ids, candidate.canonical_links.concept_ids);
  assert.match(q.question, /Polen.*2023.*ODIHR|ODIHR.*Polen.*2023/i);
  assert.match(q.answer, /konkurransepreget.*effektivt.*ressurser/s);
  assert.match(q.knowledge, /ikke at opptellingen var manipulert/i);
});

test('Statsvitenskap v5: eksterne observasjoner skilles fra teori og for bastante slutninger', () => {
  const refs = new Map(candidate.sources.map(s => [s.id, s]));
  assert.equal(refs.size, 3);
  for (const e of candidate.evidence) {
    assert.ok(refs.has(e.source_id), e.source_id);
    assert.match(refs.get(e.source_id).url, /^https:\/\//);
  }
  const osce = candidate.sources.filter(s => s.organization.includes('ODIHR') || s.organization.startsWith('OSCE'));
  assert.equal(osce.length, 2);
  assert.ok(osce.every(s => new URL(s.url).hostname === 'odihr.osce.org'));
  assert.equal(candidate.sources.find(s => s.id === 'osce_odihr_pl_2023_final_summary').published, '2024-03-27');
  assert.equal(candidate.sources.find(s => s.id === 'dixon_landau_electoral_regulation_ch3').doi, '10.1017/9781009447713.004');
  assert.equal(candidate.assessment.source_origin, 'external');
  assert.equal(candidate.assessment.source.length, 2);
  assert.equal(candidate.status, 'editorial_candidate_not_published');
  assert.equal(candidate.publication_constraints.no_runtime_inclusion, true);
  assert.equal(candidate.publication_constraints.not_a_complete_subject_pathway, true);
  assert.equal(audit.assessment_candidates_created, 1);
  assert.equal(audit.published_quiz_items_created, 0);
});
