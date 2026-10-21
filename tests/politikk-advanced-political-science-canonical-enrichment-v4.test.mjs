import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const load = name => JSON.parse(fs.readFileSync('data/fag/politikk/' + name, 'utf8'));
const audit = load('advanced_political_science_wave4_canonical_enrichment_v1.json');
const methods = load('methods_politikk_canonical_v4_5.json');
const curriculum = load('curriculum_architecture_politikk_v1.json');
const pensum = load('politikkpensum_canonical_v4_5.json');
const chapters = load('advanced_political_science_wave3_chapter_review_v1.json');
const byMethodId = new Map(methods.methods.map(x => [x.method_id, x]));
const byFieldId = new Map(curriculum.disciplinary_fields.map(x => [x.id, x]));
const byChapterId = new Map(chapters.chapter_evidence.map(x => [x.id, x]));
test('Statsvitenskap v4: eksisterende kanon styrkes uten nye metoder, domener eller claims', () => {
  assert.equal(methods.methods.length, 71);
  assert.equal(pensum.domains.length, 13);
  assert.equal(curriculum.disciplinary_fields.length, 7);
  assert.equal(new Set(methods.methods.map(x => x.method_id)).size, 71);
  assert.equal(new Set(pensum.domains.map(x => x.domain_id)).size, 13);
  assert.equal(audit.methods_enriched.length, 3);
  assert.equal(audit.curriculum_field_overviews_enriched.length, 2);
  assert.equal(audit.candidate_units_created, 0);
  assert.equal(audit.new_method_ids, 0);
  assert.equal(audit.new_domains, 0);
  assert.equal(audit.source_layer_claims_promoted, 0);
  assert.equal(audit.quiz_items_created, 0);
  assert.equal(audit.concept_catalog_full_audit, false);
  for (const id of audit.methods_enriched) assert.ok(byMethodId.has(id), id);
  for (const id of audit.curriculum_field_overviews_enriched) assert.ok(byFieldId.has(id), id);
});
test('Statsvitenskap v4: fagtekst, metode og kontrollspørsmål har sammenfallende innhold', () => {
  const erosion = byMethodId.get('met_pol_institusjonell_tilbakegangsanalyse');
  const policy = byMethodId.get('met_pol_policyprosessanalyse');
  const design = byMethodId.get('met_pol_policy_design_og_virkemiddelanalyse');
  const comparative = byFieldId.get('komparativ_politikk');
  const publicPolicy = byFieldId.get('offentlig_politikk');
  assert.match(erosion.procedure[2], /valgregulering.*uavhengighet.*lik håndheving/s);
  assert.match(erosion.limitations[1], /reelle|Regler som skal beskytte valgintegritet/);
  assert.match(policy.procedure[2], /kollektivt valg.*handlingskapasitet.*deliberasjon.*sosial samhandling/s);
  assert.match(policy.limitations[1], /teknologikostnader.*internasjonale føringer/s);
  assert.match(design.procedure[2], /utslippsmål.*revisjon av enkelttiltak/s);
  assert.match(design.limitations[1], /utslippseffekt.*tidsrom/s);
  assert.match(comparative.overview, /Valgtilsyn kan beskytte mot juks/);
  assert.match(publicPolicy.overview, /Langsiktige mål må skilles fra de enkelte virkemidlene/);
});
test('Statsvitenskap v4: alle kildespor er attribuert til kontrollerte kapitler, uten fulltekstpromotering', () => {
  assert.equal(audit.source_basis.length, 3);
  for (const source of audit.source_basis) {
    const ch = byChapterId.get(source.id);
    assert.ok(ch, source.id);
    assert.equal(source.doi, ch.doi);
    assert.equal(source.url, ch.source_url);
    assert.equal(ch.fulltext_audited, false);
    assert.equal(ch.promotion_allowed, false);
  }
  assert.match(audit.concept_catalog_audit_note, /begrenset til kontrollert pensum/);
  assert.ok(audit.deferred.length >= 2);
});
