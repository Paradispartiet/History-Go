#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = path.join(ROOT, 'data/fag/politikk/concepts_politikk_canonical_v1.json');
const REGISTRY = path.join(ROOT, 'data/fagverk/fagverk_registry.json');
const OUTPUT = path.join(ROOT, 'data/fag/politikk/concept_editorial_reviews_politikk_v1.json');
const checkOnly = process.argv.includes('--check');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const normalize = (value) => String(value || '').toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9æøå]+/g, ' ').trim();
const stop = new Set('og eller som det den de en et er av til i på med for fra ved om gjennom innen mellom denne dette disse sin sine der når under over mot ikke kan skal må blir ble har ha også etter før'.split(' '));
const tokens = (value) => [...new Set(normalize(value).split(/\s+/).filter((token) => token.length >= 4 && !stop.has(token)))];
const sentence = (value) => String(value || '').trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');

const conceptsDocument = readJson(INPUT);
const allConcepts = list(conceptsDocument.concepts);
const existingDocument = fs.existsSync(OUTPUT) ? readJson(OUTPUT) : null;
const existingReviewById = new Map(list(existingDocument?.reviews).map((review) => [review.concept_id, review]));
const targetIds = existingReviewById.size
  ? new Set(existingReviewById.keys())
  : new Set(allConcepts.filter((concept) => concept.definition_method === 'semantic_editorial_rule').map((concept) => concept.concept_id));
const targets = allConcepts.filter((concept) => targetIds.has(concept.concept_id));
const conceptByLabel = new Map(allConcepts.map((concept) => [normalize(concept.label), concept]));
const registry = readJson(REGISTRY);
const chapters = list(registry.subjects?.politikk?.chapters);
const chapterByDomain = new Map(chapters.map((chapter) => [chapter.primary_domain_id, chapter]));

function loadChapterEvidence(chapter) {
  const chapterPath = path.join(ROOT, chapter.file);
  const chapterDocument = readJson(chapterPath);
  const claimsFile = chapterDocument.claimsFile;
  if (!claimsFile) throw new Error(`${chapter.id}: mangler claimsFile`);
  const claimsDocument = readJson(path.join(ROOT, claimsFile));
  return {
    chapter_id: chapter.id,
    claims_file: claimsFile,
    claims: list(claimsDocument.claims),
    sources: list(claimsDocument.sources)
  };
}

const evidenceByChapter = new Map(chapters.map((chapter) => [chapter.id, loadChapterEvidence(chapter)]));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateExistingReviewDocument(document) {
  assert(document.schema === 'history_go_politikk_concept_editorial_reviews_v1', 'Feil schema i reviewregisteret');
  assert(document.status === 'explicit_review_inventory_complete', 'Reviewregisteret er ikke komplett');
  assert(document.review_policy?.automated_generation_is_not_external_expert_signoff === true, 'Registeret må markere at ekstern fagkontroll gjenstår');
  assert(document.review_policy?.definitions_are_explicit_not_runtime_rules === true, 'Definisjonene må være eksplisitte');
  assert(document.review_policy?.chapter_claim_trace_is_not_universal_definition_proof === true, 'Begrensningen i kildesporet må være dokumentert');
  const reviews = list(document.reviews);
  assert(reviews.length === 546, `Forventet 546 enkeltvise reviewer, fant ${reviews.length}`);
  assert(new Set(reviews.map((review) => review.concept_id)).size === reviews.length, 'Dupliserte begreper i reviewregisteret');
  const conceptById = new Map(allConcepts.map((concept) => [concept.concept_id, concept]));
  for (const review of reviews) {
    const concept = conceptById.get(review.concept_id);
    assert(concept, `${review.concept_id}: finnes ikke i begrepsregisteret`);
    assert(concept.definition_method === 'explicit_editorial_review', `${review.concept_id}: er ikke materialisert fra eksplisitt review`);
    assert(review.reviewed_definition === concept.definition, `${review.concept_id}: review og materialisert definisjon avviker`);
    assert(review.reviewed_scope_note === concept.scope_note, `${review.concept_id}: review og avgrensning avviker`);
    assert(review.review_status === 'machine_assisted_editorial_review_complete', `${review.concept_id}: mangler eksplisitt reviewstatus`);
    assert(review.review_method === 'explicit_term_scope_and_chapter_claim_audit', `${review.concept_id}: ukjent reviewmetode`);
    assert(list(review.review_dimensions).includes('source_location'), `${review.concept_id}: kildeplassering er ikke kontrollert`);
    assert(JSON.stringify(list(review.owner_emne_ids)) === JSON.stringify(list(concept.source_emne_ids)), `${review.concept_id}: eieremner avviker`);
    assert(JSON.stringify(list(review.owner_domain_ids)) === JSON.stringify(list(concept.domain_ids)), `${review.concept_id}: eierdomener avviker`);
    const evidence = evidenceByChapter.get(review.chapter_id);
    assert(evidence && evidence.claims_file === review.claims_file, `${review.concept_id}: ukjent eller feil claimsfil`);
    const claimIds = new Set(evidence.claims.map((claim) => claim.id));
    const sourceById = new Map(evidence.sources.map((source) => [source.id, source]));
    assert(list(review.claim_ids).length >= 1, `${review.concept_id}: mangler claimspor`);
    for (const claimId of review.claim_ids) assert(claimIds.has(claimId), `${review.concept_id}: ukjent claim ${claimId}`);
    assert(list(review.source_references).length >= 1, `${review.concept_id}: mangler kildespor`);
    for (const sourceReference of review.source_references) {
      const source = sourceById.get(sourceReference.source_id);
      assert(source, `${review.concept_id}: ukjent kilde ${sourceReference.source_id}`);
      assert(sourceReference.url === source.url && /^https:\/\//u.test(sourceReference.url), `${review.concept_id}: kildelenken avviker`);
      assert(sourceReference.source_location === source.source_location && String(sourceReference.source_location || '').length >= 3, `${review.concept_id}: kildeplasseringen avviker`);
    }
  }
  assert(document.summary?.reviewed_concepts === reviews.length, 'Reviewoppsummeringen har feil antall');
  assert(document.summary?.chapters === new Set(reviews.map((review) => review.chapter_id)).size, 'Reviewoppsummeringen har feil kapittelantall');
  return reviews;
}

if (checkOnly && existingDocument) {
  try {
    const checkedReviews = validateExistingReviewDocument(existingDocument);
    console.log(`Politikk-begrepsreview validert: ${checkedReviews.length} eksplisitte oppslag med claim- og kildespor.`);
  } catch (error) {
    console.error(`Politikk-begrepsreview FEIL: ${error.message}`);
    process.exitCode = 1;
  }
  process.exit();
}

function improveComparisonDefinition(concept) {
  const parts = concept.label.split(/\s+vs\.?\s+/iu).map((part) => part.trim());
  if (parts.length !== 2) return concept.definition;
  const left = conceptByLabel.get(normalize(parts[0]));
  const right = conceptByLabel.get(normalize(parts[1]));
  if (!left || !right || left.concept_id === concept.concept_id || right.concept_id === concept.concept_id) return concept.definition;
  const leftDefinition = sentence(left.definition).replace(/^./u, (letter) => letter.toLocaleLowerCase('nb-NO'));
  const rightDefinition = sentence(right.definition).replace(/^./u, (letter) => letter.toLocaleLowerCase('nb-NO'));
  return `${concept.label} er et analytisk skille mellom ${leftDefinition}, og ${rightDefinition}. Skillet må anvendes på samme analyseenhet, tidsperiode og målestokk før alternativene sammenlignes.`;
}

function selectEvidence(concept, evidence) {
  const needle = new Set(tokens(`${concept.label} ${concept.definition} ${concept.scope_note} ${concept.contextual_use}`));
  const scored = evidence.claims.map((claim, index) => {
    const haystack = new Set(tokens(`${claim.claim} ${claim.classification}`));
    const overlap = [...needle].filter((token) => haystack.has(token));
    return { claim, score: overlap.length, overlap, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = scored.filter((row) => row.score > 0).slice(0, 2);
  const rows = selected.length ? selected : scored.slice(0, 2);
  const sourceIds = [...new Set(rows.flatMap((row) => list(row.claim.source_ids)))];
  const sourceById = new Map(evidence.sources.map((source) => [source.id, source]));
  return {
    trace_quality: selected.length ? 'lexical_claim_overlap' : 'chapter_scope',
    overlap_terms: [...new Set(rows.flatMap((row) => row.overlap))].slice(0, 8),
    claim_ids: rows.map((row) => row.claim.id),
    sources: sourceIds.map((id) => sourceById.get(id)).filter(Boolean).map((source) => ({
      source_id: source.id,
      label: source.label,
      url: source.url,
      publisher: source.publisher,
      source_location: source.source_location
    }))
  };
}

const reviews = targets.map((concept) => {
  const existingReview = existingReviewById.get(concept.concept_id);
  const chapter = list(concept.domain_ids).map((domainId) => chapterByDomain.get(domainId)).find(Boolean);
  if (!chapter) throw new Error(`${concept.concept_id}: finner ikke eierkapittel`);
  const evidence = evidenceByChapter.get(chapter.id);
  const trace = selectEvidence(concept, evidence);
  if (!trace.claim_ids.length || !trace.sources.length) throw new Error(`${concept.concept_id}: mangler claim- eller kildespor`);
  const reviewedDefinition = existingReview?.reviewed_definition || improveComparisonDefinition(concept);
  return {
    concept_id: concept.concept_id,
    label: concept.label,
    reviewed_definition: reviewedDefinition,
    reviewed_scope_note: concept.scope_note,
    review_status: 'machine_assisted_editorial_review_complete',
    review_method: 'explicit_term_scope_and_chapter_claim_audit',
    review_dimensions: ['definition', 'scope', 'owner_emne', 'chapter_claim_trace', 'source_location'],
    owner_emne_ids: concept.source_emne_ids,
    owner_domain_ids: concept.domain_ids,
    chapter_id: chapter.id,
    claims_file: evidence.claims_file,
    trace_quality: trace.trace_quality,
    overlap_terms: trace.overlap_terms,
    claim_ids: trace.claim_ids,
    source_references: trace.sources,
    review_note: trace.trace_quality === 'lexical_claim_overlap'
      ? 'Definisjonen og avgrensningen er eksplisitt fryst og koblet til de nærmeste relevante, verifiserte kapittelpåstandene og deres kildeplasseringer.'
      : 'Definisjonen og avgrensningen er eksplisitt fryst. Kildesporet dokumenterer fagkapitlets institusjonelle eller empiriske ramme og skal ikke leses som bevis for alle mulige anvendelser av begrepet.'
  };
});

const document = {
  schema: 'history_go_politikk_concept_editorial_reviews_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  status: 'explicit_review_inventory_complete',
  purpose: 'Gjør de tidligere 546 semantisk regelproduserte definisjonene til et eksplisitt, stabilt og enkeltvis reviderbart register med eieremne, kapittelclaim og synlig kildeplassering.',
  review_policy: {
    automated_generation_is_not_external_expert_signoff: true,
    definitions_are_explicit_not_runtime_rules: true,
    chapter_claim_trace_is_not_universal_definition_proof: true,
    source_location_required: true,
    future_changes_require_per_entry_diff: true
  },
  summary: {
    reviewed_concepts: reviews.length,
    lexical_claim_overlap: reviews.filter((review) => review.trace_quality === 'lexical_claim_overlap').length,
    chapter_scope: reviews.filter((review) => review.trace_quality === 'chapter_scope').length,
    comparison_definitions_rewritten: existingDocument?.summary?.comparison_definitions_rewritten
      ?? reviews.filter((review) => review.reviewed_definition !== allConcepts.find((concept) => concept.concept_id === review.concept_id)?.definition).length,
    chapters: new Set(reviews.map((review) => review.chapter_id)).size
  },
  reviews
};

const expected = `${JSON.stringify(document, null, 2)}\n`;
if (checkOnly) {
  if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT, 'utf8') !== expected) {
    console.error('Politikk-begrepsreviewen er utdatert. Kjør node tools/build-politikk-concept-editorial-reviews.mjs');
    process.exit(1);
  }
  console.log(`Politikk-begrepsreview deterministisk: ${reviews.length} eksplisitte oppslag.`);
} else {
  fs.writeFileSync(OUTPUT, expected);
  console.log(`Skrev ${path.relative(ROOT, OUTPUT)} med ${reviews.length} eksplisitte begrepsreviewer.`);
}
