import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { validatePolitikkCurriculumArchitecture } from '../tools/validate-politikk-curriculum-architecture.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

test('Politikk har et komplett studielop over det canonicale registeret', () => {
  const result = validatePolitikkCurriculumArchitecture({ root });

  assert.equal(result.status, 'passed');
  assert.equal(result.curriculumParts, 41);
  assert.equal(result.domains, 13);
  assert.equal(result.emners, 123);
  assert.equal(result.methods, 71);
  assert.equal(result.concepts, 962);
  assert.equal(result.chapters, 13);
  assert.ok(result.textbookWords >= 25000);
  assert.equal(result.directDefinitions + result.editorialSeeds + result.explicitReviewDefinitions, result.concepts);
  assert.equal(result.explicitReviewDefinitions, 546);
  assert.equal(result.semanticRuleDefinitions, 0);
  assert.equal(result.contextualDefinitions, 0);
});

test('fagsiden eier studielop og forklarte begreper etter at portalen er pensjonert', () => {
  const subjectPage = read('js/fagverk.js');
  const ia = read('js/fagverk-ia-v3.js');
  const badgeUi = read('js/fagverk-ia-v3-badge-progress.js');
  const subjectHtml = read('fagverk.html');
  const compatibilityHtml = read('data/fag/politikk/merke_politikk.html');

  assert.match(subjectHtml, /css\/politikk-curriculum\.css/);
  assert.match(subjectPage, /renderPolitikkCurriculumOverview/);
  assert.match(subjectPage, /politikkConceptSearch/);
  assert.match(subjectPage, /Canonicalt fagregister/);
  assert.match(ia, /fagverk-ia-quiz-history/);
  assert.match(ia, /profile\.html#merker/);
  assert.match(badgeUi, /runtimeManifest\.underbadgeDomains/);
  assert.match(subjectPage, /Kildespor for begrepsreview/);
  assert.match(compatibilityHtml, /subject=politikk#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibilityHtml, /politikkPortalConceptSearch|politikk-fagportal\.js/);
});

test('begrepsregisteret er sporbart og alle oppslag har selvstendig definisjon', () => {
  const document = readJson('data/fag/politikk/concepts_politikk_canonical_v1.json');
  const concepts = document.concepts;
  const statuses = new Set(concepts.map((concept) => concept.definition_status));

  assert.equal(concepts.length, 962);
  assert.ok(['editorial_chapter', 'canonical_hook', 'canonical_emne'].some((status) => statuses.has(status)));
  assert.ok(statuses.has('editorial_reviewed'));
  assert.ok(!statuses.has('contextual_from_canonical_emne'));
  assert.equal(document.summary.editorial_seed_definition_count, 273);
  assert.equal(document.summary.explicit_editorial_review_count, 546);
  assert.equal(document.summary.semantic_rule_definition_count, 0);
  assert.equal(document.summary.contextual_definition_count, 0);
  assert.equal(concepts.filter((concept) => concept.definition_method === 'editorial_seed').length, 273);
  assert.equal(concepts.filter((concept) => concept.definition_method === 'explicit_editorial_review').length, 546);
  assert.equal(concepts.filter((concept) => concept.definition_method === 'semantic_editorial_rule').length, 0);
  assert.equal(new Set(concepts.flatMap((concept) => concept.source_emne_ids)).size, 123);
  assert.equal(new Set(concepts.flatMap((concept) => concept.domain_ids)).size, 13);
  assert.ok(concepts.every((concept) => concept.scope_note && concept.why_it_matters));
  assert.ok(concepts.every((concept) => concept.contextual_use && concept.definition_method !== 'domain_fallback'));
  assert.ok(concepts.every((concept) => !/kontekstuelt analysebegrep|koblingen til emnet|innen «|navnet angir|på den måten|med det innholdet|forleddet angir/iu.test(concept.definition)));
  assert.ok(concepts.every((concept) => concept.common_misuse.length && concept.source_requirements.length));
  assert.ok(concepts.filter((concept) => concept.definition_method === 'explicit_editorial_review').every((concept) => concept.editorial_review?.source_references?.length));
});

test('de 546 tidligere regeldefinisjonene har enkeltvise reviewer og verifiserbare kildespor', () => {
  const reviews = readJson('data/fag/politikk/concept_editorial_reviews_politikk_v1.json');
  assert.equal(reviews.summary.reviewed_concepts, 546);
  assert.equal(reviews.summary.chapters, 13);
  assert.equal(new Set(reviews.reviews.map((review) => review.concept_id)).size, 546);
  assert.ok(reviews.review_policy.automated_generation_is_not_external_expert_signoff);
  assert.ok(reviews.reviews.every((review) => review.review_status === 'machine_assisted_editorial_review_complete'));
  assert.ok(reviews.reviews.every((review) => review.claim_ids.length >= 1));
  assert.ok(reviews.reviews.every((review) => review.source_references.length >= 1));
  assert.ok(reviews.reviews.every((review) => review.source_references.every((source) => source.url.startsWith('https://') && source.source_location)));
});

test('anvendelsesspor og selvstendige definisjoner bruker hele fagtermer', () => {
  const curriculum = readJson('data/fag/politikk/curriculum_architecture_politikk_v1.json');
  const concepts = readJson('data/fag/politikk/concepts_politikk_canonical_v1.json').concepts;
  const legalTrack = curriculum.applied_tracks.find((track) => track.id === 'rett_sikkerhet');
  const concept = (label) => concepts.find((entry) => entry.label.toLocaleLowerCase('nb-NO') === label);

  assert.ok(legalTrack.entry_emne_ids.includes('em_pol_politi_sikkerhet_makt'));
  assert.ok(legalTrack.entry_emne_ids.includes('em_pol_domstoler_rettspraksis'));
  assert.ok(!legalTrack.entry_emne_ids.includes('em_pol_kvantitativ_inferens_maling'));
  assert.ok(legalTrack.entry_emne_ids.length < 40);
  assert.match(concept('statistisk inferens').definition, /utvalg.*populasjon/s);
  assert.match(concept('rettferdighet').definition, /normativt prinsipp/);
  assert.match(concept('administrativt skjønn').definition, /handlingsrom/);
  assert.match(concept('alternativkostnad').definition, /beste realistiske alternativ/);
  assert.match(concept('komparativ politikk').definition, /sammenligner regimer/);
});

test('den faktiske fagsiden rendrer 41 lesbare deler og et sokbart begrepsverk', async () => {
  const dom = new JSDOM(read('fagverk.html'), {
    url: 'https://history-go.test/fagverk.html?subject=politikk',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.console = console;
  window.eval(read('js/fagverk-subject-core.js'));

  const registry = readJson('data/fagverk/fagverk_registry.json');
  const status = readJson('data/fagverk/subject_status.json').subjects.find((entry) => entry.id === 'politikk');
  const curriculum = readJson('data/fag/politikk/curriculum_architecture_politikk_v1.json');
  const model = window.HGFagverkSubjectCore.normalizeSubject({
    subjectId: 'politikk',
    schemaFamily: 'standard_canonical',
    categoryLabel: 'Politikk',
    portalEntry: { badgePage: 'fagverk.html?subject=politikk#fagverkIaProgresjon', subjectStatus: 'materialized' },
    statusEntry: status,
    registry,
    source: {
      pensum: readJson('data/fag/politikk/politikkpensum_canonical_v4_5.json'),
      emners: readJson('data/fag/politikk/emner_politikk_canonical_v4_5.json'),
      fagkart: readJson('data/fag/politikk/fagkart_politikk_canonical_v4_5.json'),
      methods: readJson('data/fag/politikk/methods_politikk_canonical_v4_5.json'),
      concepts: readJson('data/fag/politikk/concepts_politikk_canonical_v1.json'),
      curriculum
    }
  });
  const coverage = model.emners.map((emne) => ({ emneId: emne.id, percent: 0 }));
  const domainProgress = model.domains.map((domain) => ({ domainId: domain.id, percent: 0 }));
  window.HGFagverkSubjectModel = {
    load: async () => model,
    readProgress: () => ({ points: 0, tier: { label: 'Nybegynner' }, coverage, domainProgress, quizHistory: [] }),
    domainUrl: (_subjectId, domainId) => `fagverk.html?subject=politikk&domain=${domainId}`,
    chapterUrl: (_subjectId, chapterId) => `fagverk.html?subject=politikk&chapter=${chapterId}`,
    emneUrl: (_subjectId, emneId) => `fagverk.html?subject=politikk&emne=${emneId}`,
    placePageUrl: (placeId) => `fagverk-sted.html?place=${placeId}`
  };

  window.eval(read('js/fagverk.js'));
  await new Promise((resolve) => window.setTimeout(resolve, 40));

  assert.equal(window.document.querySelectorAll('.fagverk-curriculum-article').length, 41);
  assert.equal(window.document.querySelectorAll('#politikkConceptResults .fagverk-canonical-concept').length, 36);
  assert.match(window.document.getElementById('politikkConceptCount').textContent, /962 begreper funnet/);
  assert.match(window.document.getElementById('fagverkSubjectOverview').textContent, /skille politiske standpunkter fra statsvitenskapelige beskrivelser/);
  assert.equal(window.document.getElementById('fagverkError').hidden, true);

  const search = window.document.getElementById('politikkConceptSearch');
  search.value = 'representasjon';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.doesNotMatch(window.document.getElementById('politikkConceptCount').textContent, /^0 begreper/);
  assert.match(window.document.getElementById('politikkConceptResults').textContent.toLocaleLowerCase('nb-NO'), /representasjon/);
  search.value = 'administrativ drift';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  const reviewedCard = window.document.querySelector('#politikkConceptResults .fagverk-canonical-concept');
  assert.match(reviewedCard.textContent, /Enkeltvis redaksjonelt gjennomgått/);
  assert.match(reviewedCard.textContent, /Kildespor for begrepsreview/);
  assert.ok(reviewedCard.querySelector('.fagverk-concept-review-sources a[href^="https://"]'));
  assert.ok(reviewedCard.querySelector('.fagverk-concept-review-sources small').textContent.trim().length >= 20);
  dom.window.close();
});
