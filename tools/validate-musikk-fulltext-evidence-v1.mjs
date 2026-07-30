#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'data/fag/musikk/musikkvitenskap_canonical_v1';
const INDEX = `${BASE}/fulltext_evidence_v1/index.json`;
const PACKAGE = 'data/fag/musikk/scientific_package.json';
const RESEARCH = `${BASE}/research_contract.json`;
const METHODS = `${BASE}/method_protocols_v1.json`;
const MODULE = `${BASE}/modules_v2/musikalsk_analyse_lyd_struktur.json`;
const REGISTRY_DIRS = [
  `${BASE}/scholarly_source_registries_v1`,
  `${BASE}/scholarly_source_registries_v2`
];

let pass = 0;
let fail = 0;
const errors = [];
const ok = (condition, message) => {
  if (condition) pass += 1;
  else { fail += 1; errors.push(message); }
};
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const text = (value) => typeof value === 'string' ? value.trim() : '';
const list = (value) => Array.isArray(value) ? value : [];

function walkJson(dir) {
  const absolute = path.join(ROOT, dir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return walkJson(relative);
    return entry.isFile() && entry.name.endsWith('.json') ? [relative] : [];
  });
}

function collectSourceIds(value, out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectSourceIds(item, out);
  } else if (value && typeof value === 'object') {
    if (text(value.source_id)) out.add(value.source_id);
    for (const child of Object.values(value)) collectSourceIds(child, out);
  }
  return out;
}

function main() {
  const pkg = readJson(PACKAGE);
  const index = readJson(INDEX);
  const contract = readJson(`${BASE}/fulltext_evidence_v1/${index.contract}`);
  const research = readJson(RESEARCH);
  const methods = readJson(METHODS);
  const module = readJson(MODULE);

  const registryFiles = REGISTRY_DIRS.flatMap(walkJson);
  const sourceIds = new Set();
  for (const file of registryFiles) collectSourceIds(readJson(file), sourceIds);

  const claimTypeIds = new Set(list(research.evidence_contract?.claim_types).map((item) => item.claim_type_id));
  const methodIds = new Set(list(methods.protocols).map((item) => item.method_id));
  const topic = list(module.topics).find((item) => item.emne_id === 'em_musikk_vit_rytme_meter_groove_timing');
  ok(Boolean(topic), 'Mangler canonicalt rytme/meter/groove/timing-emne');
  const topicClaimTypes = new Set(list(topic?.claim_type_ids));
  const topicMethodIds = new Set(list(topic?.method_protocol_ids));

  ok(pkg.fulltext_evidence === 'musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json', 'scientific_package peker ikke til fulltekstevidensindeksen');
  ok(pkg.fulltext_evidence_revision === index.revision, 'fulltekstevidensrevisjon er usynkronisert');
  ok(index.status === 'pilot_active', 'fulltekstevidensindeksen må være pilot_active');
  ok(index.summary.fulltext_pilot_topic_count === list(index.topic_files).length, 'pilot topic count matcher ikke topic_files');
  ok(index.summary.question_release_ready_topic_count === 0, 'piloten skal ikke være question-ready uten direkte objekt');
  ok(contract.hard_rules.full_text_must_be_reviewed_before_claim_ready === true, 'kontrakten mangler fulltekstport');
  ok(contract.hard_rules.article_locator_is_not_direct_music_object_locator === true, 'kontrakten må skille artikkellokator fra musikkobjektlokator');
  ok(contract.hard_rules.question_release_requires_topic_direct_object_gate === true, 'kontrakten mangler direct-object question gate');

  let reviewedSources = 0;
  let claimReady = 0;
  let boundaries = 0;
  let questionReadyTopics = 0;

  for (const topicFile of list(index.topic_files)) {
    const relative = `${BASE}/fulltext_evidence_v1/${topicFile}`;
    const evidence = readJson(relative);
    ok(evidence.subject_id === 'musikk', `${topicFile}: feil subject_id`);
    ok(evidence.domain_id === 'musikalsk_analyse_lyd_struktur', `${topicFile}: feil domain_id`);
    ok(evidence.emne_id === topic?.emne_id, `${topicFile}: feil emne_id`);
    ok(evidence.status === 'research_evidence_ready_direct_object_blocked', `${topicFile}: uventet release-status`);

    for (const review of list(evidence.source_reviews)) {
      reviewedSources += 1;
      ok(sourceIds.has(review.source_id), `${topicFile}: ukjent source_id ${review.source_id}`);
      ok(text(review.registry_path).includes('scholarly_source_registries_'), `${topicFile}/${review.source_id}: registry_path mangler canonical registry`);
      ok(text(review.full_text_status).startsWith('reviewed_'), `${topicFile}/${review.source_id}: fulltekst er ikke reviewed`);
      ok(/^https:\/\//.test(text(review.full_text_access)), `${topicFile}/${review.source_id}: full_text_access må være https`);
      ok(/^\d{4}-\d{2}-\d{2}$/.test(text(review.checked_at)), `${topicFile}/${review.source_id}: checked_at mangler ISO-dato`);
      ok(list(review.locators).length >= 2, `${topicFile}/${review.source_id}: minst to artikkellokatorer kreves`);
      ok(Boolean(text(review.rights_and_reuse_note)), `${topicFile}/${review.source_id}: rights_and_reuse_note mangler`);
      for (const locator of list(review.locators)) {
        ok(Boolean(text(locator.pages)), `${topicFile}/${review.source_id}: locator mangler pages`);
        ok(Boolean(text(locator.section)), `${topicFile}/${review.source_id}: locator mangler section`);
        ok(Boolean(text(locator.supports)), `${topicFile}/${review.source_id}: locator mangler supports`);
      }
    }

    const sourceReviewIds = new Set(list(evidence.source_reviews).map((item) => item.source_id));
    const claimIds = new Set();
    for (const claim of list(evidence.claim_records)) {
      claimReady += claim.support_level === 'claim_ready_editorial' ? 1 : 0;
      ok(Boolean(text(claim.claim_id)), `${topicFile}: claim_id mangler`);
      ok(!claimIds.has(claim.claim_id), `${topicFile}: duplikat claim_id ${claim.claim_id}`);
      claimIds.add(claim.claim_id);
      ok(Boolean(text(claim.statement)), `${topicFile}/${claim.claim_id}: statement mangler`);
      ok(claimTypeIds.has(claim.claim_type_id), `${topicFile}/${claim.claim_id}: claim_type finnes ikke i research_contract`);
      ok(topicClaimTypes.has(claim.claim_type_id), `${topicFile}/${claim.claim_id}: claim_type er ikke tillatt for emnet`);
      ok(list(claim.source_ids).length >= 1, `${topicFile}/${claim.claim_id}: source_ids mangler`);
      for (const sourceId of list(claim.source_ids)) {
        ok(sourceIds.has(sourceId), `${topicFile}/${claim.claim_id}: ukjent kilde ${sourceId}`);
        ok(sourceReviewIds.has(sourceId), `${topicFile}/${claim.claim_id}: kilden er ikke fulltekst-reviewed i topic-filen: ${sourceId}`);
      }
      ok(list(claim.locators).length >= 2, `${topicFile}/${claim.claim_id}: minst to presise lokatorer kreves`);
      ok(list(claim.method_protocol_ids).length >= 1, `${topicFile}/${claim.claim_id}: method_protocol_ids mangler`);
      for (const methodId of list(claim.method_protocol_ids)) {
        ok(methodIds.has(methodId), `${topicFile}/${claim.claim_id}: ukjent metode ${methodId}`);
        ok(topicMethodIds.has(methodId), `${topicFile}/${claim.claim_id}: metode ${methodId} er ikke tillatt for emnet`);
      }
      ok(claim.object_scope && typeof claim.object_scope === 'object', `${topicFile}/${claim.claim_id}: object_scope mangler`);
      ok(claim.support_level === 'claim_ready_editorial', `${topicFile}/${claim.claim_id}: pilotclaims skal være claim_ready_editorial`);
      ok(Boolean(text(claim.uncertainty)), `${topicFile}/${claim.claim_id}: uncertainty mangler`);
      ok(Boolean(text(claim.prohibited_inference)), `${topicFile}/${claim.claim_id}: prohibited_inference mangler`);
      ok(claim.reproducibility && claim.reproducibility.independent_reanalysis === false, `${topicFile}/${claim.claim_id}: piloten må eksplisitt si at uavhengig reanalyse ikke er gjort`);
    }

    for (const boundary of list(evidence.boundary_records)) {
      boundaries += 1;
      ok(Boolean(text(boundary.boundary_id)), `${topicFile}: boundary_id mangler`);
      ok(Boolean(text(boundary.statement)), `${topicFile}/${boundary.boundary_id}: statement mangler`);
      ok(list(boundary.source_ids).length >= 1, `${topicFile}/${boundary.boundary_id}: source_ids mangler`);
      for (const sourceId of list(boundary.source_ids)) {
        ok(sourceIds.has(sourceId), `${topicFile}/${boundary.boundary_id}: ukjent kilde ${sourceId}`);
        ok(sourceReviewIds.has(sourceId), `${topicFile}/${boundary.boundary_id}: kilden er ikke fulltekst-reviewed ${sourceId}`);
      }
      ok(list(boundary.locators).length >= 1, `${topicFile}/${boundary.boundary_id}: locator mangler`);
      for (const claimId of list(boundary.applies_to_claim_ids)) ok(claimIds.has(claimId), `${topicFile}/${boundary.boundary_id}: ukjent claim ${claimId}`);
      ok(Boolean(text(boundary.release_effect)), `${topicFile}/${boundary.boundary_id}: release_effect mangler`);
    }

    const gate = evidence.direct_object_gate || {};
    ok(gate.required_before_question_release === true, `${topicFile}: direct object må kreves før question release`);
    ok(gate.article_locators_satisfied === true, `${topicFile}: artikkellokatorene skal være tilfredsstilt`);
    ok(gate.direct_music_object_locators_satisfied === false, `${topicFile}: direct object skal fortsatt være uløst i denne piloten`);
    ok(gate.minimum_direct_object_locator_count >= 2, `${topicFile}: direct-object minimum må være minst 2`);
    ok(list(gate.unresolved).length >= 1, `${topicFile}: uløste direct-object-punkter må være dokumentert`);
    ok(gate.question_release_ready === false, `${topicFile}: question_release_ready kan ikke være true`);
    if (gate.question_release_ready === true) questionReadyTopics += 1;

    ok(evidence.coverage.fulltext_reviewed_source_count === list(evidence.source_reviews).length, `${topicFile}: coverage source count feil`);
    ok(evidence.coverage.claim_ready_editorial_count === list(evidence.claim_records).length, `${topicFile}: coverage claim count feil`);
    ok(evidence.coverage.boundary_count === list(evidence.boundary_records).length, `${topicFile}: coverage boundary count feil`);
    ok(evidence.coverage.question_release_ready_claim_count === 0, `${topicFile}: question-ready claim count skal være 0`);
  }

  ok(index.summary.fulltext_reviewed_source_count === reviewedSources, 'index fulltext_reviewed_source_count er feil');
  ok(index.summary.claim_ready_editorial_count === claimReady, 'index claim_ready_editorial_count er feil');
  ok(index.summary.boundary_count === boundaries, 'index boundary_count er feil');
  ok(index.summary.question_release_ready_topic_count === questionReadyTopics, 'index question_release_ready_topic_count er feil');
  ok(pkg.summary.fulltext_pilot_topic_count === list(index.topic_files).length, 'scientific_package fulltext_pilot_topic_count er feil');
  ok(pkg.summary.fulltext_reviewed_source_count === reviewedSources, 'scientific_package fulltext_reviewed_source_count er feil');
  ok(pkg.summary.claim_ready_editorial_count === claimReady, 'scientific_package claim_ready_editorial_count er feil');
  ok(pkg.summary.question_release_ready_topic_count === questionReadyTopics, 'scientific_package question_release_ready_topic_count er feil');

  console.log(`Musikk fulltekstevidens v1: ${pass} PASS, ${fail} FAIL`);
  console.log(`Pilot: ${list(index.topic_files).length} emne, ${reviewedSources} fulltekster, ${claimReady} redaksjonelt claim-klare funn, ${boundaries} slutningsgrenser, ${questionReadyTopics} question-ready emner.`);
  if (errors.length) {
    for (const error of errors) console.error(`FAIL: ${error}`);
    process.exitCode = 1;
  }
}

main();
