#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'data/fag/musikk/musikkvitenskap_canonical_v1';
const INDEX = `${BASE}/fulltext_evidence_v1/index.json`;
const CANONICAL_INDEX = `${BASE}/index.json`;
const PACKAGE = 'data/fag/musikk/scientific_package.json';
const RESEARCH = `${BASE}/research_contract.json`;
const METHODS = `${BASE}/method_protocols_v1.json`;
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

function hasBibliographicIdentity(extension) {
  const bib = extension?.bibliographic_identity;
  return bib && list(bib.creators).length >= 1 && Number.isInteger(bib.year) && Boolean(text(bib.title)) && Boolean(text(bib.publication));
}

function main() {
  const pkg = readJson(PACKAGE);
  const index = readJson(INDEX);
  const canonicalIndex = readJson(CANONICAL_INDEX);
  const contract = readJson(`${BASE}/fulltext_evidence_v1/${index.contract}`);
  const research = readJson(RESEARCH);
  const methods = readJson(METHODS);
  const canonicalModuleFiles = list(canonicalIndex.files?.canonical_modules);
  const canonicalModules = canonicalModuleFiles.map((file) => readJson(`${BASE}/${file}`));

  const registryFiles = REGISTRY_DIRS.flatMap(walkJson);
  const canonicalSourceIds = new Set();
  for (const file of registryFiles) collectSourceIds(readJson(file), canonicalSourceIds);

  const claimTypeIds = new Set(list(research.evidence_contract?.claim_types).map((item) => item.claim_type_id));
  const methodIds = new Set(list(methods.protocols).map((item) => item.method_id));
  const topicById = new Map();
  const canonicalDomainIds = new Set();
  for (const module of canonicalModules) {
    const domainId = text(module?.domain?.domain_id);
    if (domainId) canonicalDomainIds.add(domainId);
    for (const topic of list(module?.topics)) {
      if (!topicById.has(topic.emne_id)) topicById.set(topic.emne_id, topic);
    }
  }

  ok(pkg.version === '2.0', 'scientific_package må beholde canonical versjon 2.0');
  ok(pkg.summary.verified_scholarly_source_record_count === canonicalIndex.summary.verified_scholarly_source_record_count, 'produksjonskilder kan ikke endre canonical bibliografisk basistall');
  ok(pkg.fulltext_evidence === 'musikkvitenskap_canonical_v1/fulltext_evidence_v1/index.json', 'scientific_package peker ikke til fulltekstevidensindeksen');
  ok(pkg.fulltext_evidence_revision === index.revision, 'fulltekstevidensrevisjon er usynkronisert');
  ok(index.status === 'pilot_active', 'fulltekstevidensindeksen må være pilot_active');
  ok(index.summary.fulltext_pilot_topic_count === list(index.topic_files).length, 'pilot topic count matcher ikke topic_files');
  ok(new Set(list(index.topic_files)).size === list(index.topic_files).length, 'topic_files kan ikke inneholde duplikater');
  ok(canonicalModuleFiles.length === canonicalIndex.summary.domain_count, 'canonical_modules må dekke alle canonicale domener');
  ok(canonicalDomainIds.size === canonicalIndex.summary.domain_count, 'canonical modules har feil antall unike domener');
  ok(topicById.size === canonicalIndex.summary.topic_count, 'canonical modules har feil antall unike emner');
  ok(contract.hard_rules.full_text_must_be_reviewed_before_claim_ready === true, 'kontrakten mangler fulltekstport');
  ok(contract.hard_rules.article_locator_is_not_direct_music_object_locator === true, 'kontrakten må skille artikkellokator fra direkte objektlokator');
  ok(contract.hard_rules.question_release_requires_topic_direct_object_gate === true, 'kontrakten mangler direct-object question gate');
  ok(contract.hard_rules.production_source_extension_does_not_increment_canonical_bibliographic_basis === true, 'kontrakten må bevare canonical bibliografisk basistall');
  ok(contract.hard_rules.nonredistributable_objects_must_remain_external_link_only === true, 'kontrakten må beskytte ikke-redistribuerbare objekter');

  let reviewedSources = 0;
  let canonicalReviewedSources = 0;
  let productionExtensions = 0;
  let directObjects = 0;
  let claimReady = 0;
  let boundaries = 0;
  let questionReadyTopics = 0;
  let questionReadyClaims = 0;
  const seenEmneIds = new Set();

  for (const topicFile of list(index.topic_files)) {
    const relative = `${BASE}/fulltext_evidence_v1/${topicFile}`;
    const evidence = readJson(relative);
    const topic = topicById.get(evidence.emne_id);
    ok(evidence.subject_id === 'musikk', `${topicFile}: feil subject_id`);
    ok(canonicalDomainIds.has(evidence.domain_id), `${topicFile}: ukjent canonical domain_id ${evidence.domain_id}`);
    ok(Boolean(topic), `${topicFile}: ukjent canonical emne_id ${evidence.emne_id}`);
    ok(!seenEmneIds.has(evidence.emne_id), `${topicFile}: duplikat evidensfil for ${evidence.emne_id}`);
    seenEmneIds.add(evidence.emne_id);
    ok(topic?.domain_id === evidence.domain_id, `${topicFile}: emne og evidens har ulikt domene`);
    ok(list(contract.release_states).includes(evidence.status), `${topicFile}: uventet release-status ${evidence.status}`);

    const topicClaimTypes = new Set(list(topic?.claim_type_ids));
    const topicMethodIds = new Set(list(topic?.method_protocol_ids));
    const topicObjectTypes = new Set(list(topic?.research_object_types));

    const extensionIds = new Set();
    for (const extension of list(evidence.production_source_extensions)) {
      productionExtensions += 1;
      ok(Boolean(text(extension.source_id)), `${topicFile}: production extension mangler source_id`);
      ok(!canonicalSourceIds.has(extension.source_id), `${topicFile}/${extension.source_id}: production extension kolliderer med canonical source_id`);
      ok(!extensionIds.has(extension.source_id), `${topicFile}: duplikat production source_id ${extension.source_id}`);
      extensionIds.add(extension.source_id);
      ok(hasBibliographicIdentity(extension), `${topicFile}/${extension.source_id}: bibliographic_identity er ufullstendig`);
      ok(Boolean(text(extension.registration_reason)), `${topicFile}/${extension.source_id}: registration_reason mangler`);
      ok(text(extension.full_text_status).startsWith('reviewed_'), `${topicFile}/${extension.source_id}: production fulltext er ikke reviewed`);
      ok(/^https:\/\//.test(text(extension.full_text_access)), `${topicFile}/${extension.source_id}: full_text_access må være https`);
      ok(/^\d{4}-\d{2}-\d{2}$/.test(text(extension.checked_at)), `${topicFile}/${extension.source_id}: checked_at mangler ISO-dato`);
    }

    const registeredSourceIds = new Set([...canonicalSourceIds, ...extensionIds]);
    for (const review of list(evidence.source_reviews)) {
      reviewedSources += 1;
      ok(registeredSourceIds.has(review.source_id), `${topicFile}: uregistrert source_id ${review.source_id}`);
      ok(list(contract.source_registration_modes).includes(review.source_registration), `${topicFile}/${review.source_id}: ugyldig source_registration`);
      if (review.source_registration === 'canonical_registry') {
        canonicalReviewedSources += 1;
        ok(canonicalSourceIds.has(review.source_id), `${topicFile}/${review.source_id}: canonical source finnes ikke i registry`);
        ok(text(review.registry_path).includes('scholarly_source_registries_'), `${topicFile}/${review.source_id}: registry_path mangler canonical registry`);
      } else if (review.source_registration === 'production_extension') {
        ok(extensionIds.has(review.source_id), `${topicFile}/${review.source_id}: production review mangler production_source_extensions-post`);
      }
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
    const objectById = new Map();
    for (const object of list(evidence.direct_objects)) {
      directObjects += 1;
      ok(Boolean(text(object.object_id)), `${topicFile}: direct object mangler object_id`);
      ok(topicObjectTypes.has(object.object_type), `${topicFile}/${object.object_id}: object_type er ikke tillatt for emnet`);
      ok(Boolean(text(object.title)), `${topicFile}/${object.object_id}: title mangler`);
      ok(/^https:\/\//.test(text(object.persistent_url)), `${topicFile}/${object.object_id}: persistent_url må være https`);
      ok(!objectById.has(object.object_id), `${topicFile}: duplikat object_id ${object.object_id}`);
      objectById.set(object.object_id, object);
      ok(list(object.provenance_source_ids).length >= 1, `${topicFile}/${object.object_id}: provenance_source_ids mangler`);
      for (const sourceId of list(object.provenance_source_ids)) ok(sourceReviewIds.has(sourceId), `${topicFile}/${object.object_id}: provenance-kilden er ikke fulltekst-reviewed ${sourceId}`);
      ok(list(object.locators).length >= 2, `${topicFile}/${object.object_id}: minst to direkte objektlokatorer kreves`);
      for (const locator of list(object.locators)) {
        ok(Boolean(text(locator.locator)), `${topicFile}/${object.object_id}: object locator mangler locator`);
        ok(Boolean(text(locator.role)), `${topicFile}/${object.object_id}: object locator mangler role`);
      }
      ok(object.rights && Boolean(text(object.rights.history_go_use_mode)), `${topicFile}/${object.object_id}: rights/history_go_use_mode mangler`);
      if (object.rights?.redistribution_allowed === false || object.rights?.modification_allowed === false) {
        ok(object.rights.history_go_use_mode === 'external_link_and_metadata_only', `${topicFile}/${object.object_id}: ikke-redistribuerbart objekt må være external_link_and_metadata_only`);
      }
      if (text(object.rights?.commercial_compatibility_with_history_go) === 'not_resolved') {
        ok(object.rights.history_go_use_mode === 'external_link_and_metadata_only', `${topicFile}/${object.object_id}: uløst kommersiell lisenskompatibilitet må være external_link_and_metadata_only`);
      }
    }

    const claimIds = new Set();
    const claimById = new Map();
    for (const claim of list(evidence.claim_records)) {
      claimReady += claim.support_level === 'claim_ready_editorial' ? 1 : 0;
      ok(Boolean(text(claim.claim_id)), `${topicFile}: claim_id mangler`);
      ok(!claimIds.has(claim.claim_id), `${topicFile}: duplikat claim_id ${claim.claim_id}`);
      claimIds.add(claim.claim_id);
      claimById.set(claim.claim_id, claim);
      ok(Boolean(text(claim.statement)), `${topicFile}/${claim.claim_id}: statement mangler`);
      ok(claimTypeIds.has(claim.claim_type_id), `${topicFile}/${claim.claim_id}: claim_type finnes ikke i research_contract`);
      ok(topicClaimTypes.has(claim.claim_type_id), `${topicFile}/${claim.claim_id}: claim_type er ikke tillatt for emnet`);
      ok(list(claim.source_ids).length >= 1, `${topicFile}/${claim.claim_id}: source_ids mangler`);
      for (const sourceId of list(claim.source_ids)) {
        ok(registeredSourceIds.has(sourceId), `${topicFile}/${claim.claim_id}: uregistrert kilde ${sourceId}`);
        ok(sourceReviewIds.has(sourceId), `${topicFile}/${claim.claim_id}: kilden er ikke fulltekst-reviewed i topic-filen: ${sourceId}`);
      }
      ok(list(claim.locators).length >= 2, `${topicFile}/${claim.claim_id}: minst to presise artikkellokatorer kreves`);
      ok(list(claim.method_protocol_ids).length >= 1, `${topicFile}/${claim.claim_id}: method_protocol_ids mangler`);
      for (const methodId of list(claim.method_protocol_ids)) {
        ok(methodIds.has(methodId), `${topicFile}/${claim.claim_id}: ukjent metode ${methodId}`);
        ok(topicMethodIds.has(methodId), `${topicFile}/${claim.claim_id}: metode ${methodId} er ikke tillatt for emnet`);
      }
      ok(claim.object_scope && typeof claim.object_scope === 'object', `${topicFile}/${claim.claim_id}: object_scope mangler`);
      if (text(claim.object_scope?.direct_object_id)) ok(objectById.has(claim.object_scope.direct_object_id), `${topicFile}/${claim.claim_id}: ukjent direct_object_id ${claim.object_scope.direct_object_id}`);
      ok(claim.support_level === 'claim_ready_editorial', `${topicFile}/${claim.claim_id}: claim skal være claim_ready_editorial`);
      ok(Boolean(text(claim.uncertainty)), `${topicFile}/${claim.claim_id}: uncertainty mangler`);
      ok(Boolean(text(claim.prohibited_inference)), `${topicFile}/${claim.claim_id}: prohibited_inference mangler`);
      ok(claim.reproducibility && claim.reproducibility.independent_reanalysis === false, `${topicFile}/${claim.claim_id}: må eksplisitt si at uavhengig reanalyse ikke er gjort`);
    }

    for (const boundary of list(evidence.boundary_records)) {
      boundaries += 1;
      ok(Boolean(text(boundary.boundary_id)), `${topicFile}: boundary_id mangler`);
      ok(Boolean(text(boundary.statement)), `${topicFile}/${boundary.boundary_id}: statement mangler`);
      ok(list(boundary.source_ids).length >= 1, `${topicFile}/${boundary.boundary_id}: source_ids mangler`);
      for (const sourceId of list(boundary.source_ids)) {
        ok(registeredSourceIds.has(sourceId), `${topicFile}/${boundary.boundary_id}: uregistrert kilde ${sourceId}`);
        ok(sourceReviewIds.has(sourceId), `${topicFile}/${boundary.boundary_id}: kilden er ikke fulltekst-reviewed ${sourceId}`);
      }
      ok(list(boundary.locators).length >= 1, `${topicFile}/${boundary.boundary_id}: locator mangler`);
      for (const claimId of list(boundary.applies_to_claim_ids)) ok(claimIds.has(claimId), `${topicFile}/${boundary.boundary_id}: ukjent claim ${claimId}`);
      ok(Boolean(text(boundary.release_effect)), `${topicFile}/${boundary.boundary_id}: release_effect mangler`);
    }

    const gate = evidence.direct_object_gate || {};
    ok(gate.required_before_question_release === true, `${topicFile}: direct object må kreves før question release`);
    ok(gate.article_locators_satisfied === true, `${topicFile}: artikkellokatorene skal være tilfredsstilt`);
    ok(gate.minimum_direct_object_locator_count >= 2, `${topicFile}: direct-object minimum må være minst 2`);
    if (gate.question_release_ready === true) {
      questionReadyTopics += 1;
      ok(evidence.status === 'question_release_ready', `${topicFile}: status må være question_release_ready når gaten er åpen`);
      ok(gate.direct_music_object_locators_satisfied === true, `${topicFile}: direkte objektlokatorer må være løst`);
      ok(objectById.has(gate.selected_object_id), `${topicFile}: selected_object_id finnes ikke`);
      ok(list(gate.unresolved).length === 0, `${topicFile}: question-ready gate kan ikke ha unresolved-punkter`);
      ok(list(gate.resolved).length >= 3, `${topicFile}: question-ready gate må dokumentere identitet, locatorer og rettigheter`);
      ok(list(gate.question_ready_claim_ids).length >= 1, `${topicFile}: question_ready_claim_ids mangler`);
      for (const claimId of list(gate.question_ready_claim_ids)) {
        questionReadyClaims += 1;
        const claim = claimById.get(claimId);
        ok(Boolean(claim), `${topicFile}: question-ready claim finnes ikke: ${claimId}`);
        ok(claim?.object_scope?.direct_object_id === gate.selected_object_id, `${topicFile}/${claimId}: question-ready claim peker ikke til selected direct object`);
      }
      const selectedObject = objectById.get(gate.selected_object_id);
      if (text(selectedObject?.rights?.commercial_compatibility_with_history_go) === 'not_resolved') {
        ok(selectedObject.rights.history_go_use_mode === 'external_link_and_metadata_only', `${topicFile}: uløst lisenskompatibilitet kan bare frigi metadata/ekstern-lenke-bruk`);
      }
    } else {
      ok(evidence.status !== 'question_release_ready', `${topicFile}: status kan ikke være question_release_ready når gaten er lukket`);
      ok(list(gate.question_ready_claim_ids).length === 0, `${topicFile}: lukket gate kan ikke ha question_ready_claim_ids`);
    }

    ok(evidence.coverage.fulltext_reviewed_source_count === list(evidence.source_reviews).length, `${topicFile}: coverage source count feil`);
    ok(evidence.coverage.canonical_fulltext_reviewed_source_count === list(evidence.source_reviews).filter((x) => x.source_registration === 'canonical_registry').length, `${topicFile}: canonical reviewed count feil`);
    ok(evidence.coverage.production_extension_source_count === list(evidence.production_source_extensions).length, `${topicFile}: production extension count feil`);
    ok(evidence.coverage.direct_object_count === list(evidence.direct_objects).length, `${topicFile}: direct object count feil`);
    ok(evidence.coverage.claim_ready_editorial_count === list(evidence.claim_records).length, `${topicFile}: coverage claim count feil`);
    ok(evidence.coverage.boundary_count === list(evidence.boundary_records).length, `${topicFile}: coverage boundary count feil`);
    ok(evidence.coverage.question_release_ready_claim_count === list(gate.question_ready_claim_ids).length, `${topicFile}: question-ready claim count feil`);
  }

  ok(index.summary.fulltext_reviewed_source_count === reviewedSources, 'index fulltext_reviewed_source_count er feil');
  ok(index.summary.canonical_fulltext_reviewed_source_count === canonicalReviewedSources, 'index canonical_fulltext_reviewed_source_count er feil');
  ok(index.summary.production_extension_source_count === productionExtensions, 'index production_extension_source_count er feil');
  ok(index.summary.direct_object_count === directObjects, 'index direct_object_count er feil');
  ok(index.summary.claim_ready_editorial_count === claimReady, 'index claim_ready_editorial_count er feil');
  ok(index.summary.boundary_count === boundaries, 'index boundary_count er feil');
  ok(index.summary.question_release_ready_topic_count === questionReadyTopics, 'index question_release_ready_topic_count er feil');
  ok(index.summary.question_release_ready_claim_count === questionReadyClaims, 'index question_release_ready_claim_count er feil');
  ok(pkg.summary.fulltext_pilot_topic_count === list(index.topic_files).length, 'scientific_package fulltext_pilot_topic_count er feil');
  ok(pkg.summary.fulltext_reviewed_source_count === reviewedSources, 'scientific_package fulltext_reviewed_source_count er feil');
  ok(pkg.summary.canonical_fulltext_reviewed_source_count === canonicalReviewedSources, 'scientific_package canonical_fulltext_reviewed_source_count er feil');
  ok(pkg.summary.production_extension_source_count === productionExtensions, 'scientific_package production_extension_source_count er feil');
  ok(pkg.summary.direct_object_count === directObjects, 'scientific_package direct_object_count er feil');
  ok(pkg.summary.claim_ready_editorial_count === claimReady, 'scientific_package claim_ready_editorial_count er feil');
  ok(pkg.summary.question_release_ready_topic_count === questionReadyTopics, 'scientific_package question_release_ready_topic_count er feil');
  ok(pkg.summary.question_release_ready_claim_count === questionReadyClaims, 'scientific_package question_release_ready_claim_count er feil');

  console.log(`Musikk fulltekstevidens v1: ${pass} PASS, ${fail} FAIL`);
  console.log(`Pilot: ${list(index.topic_files).length} emner, ${reviewedSources} fulltekster (${canonicalReviewedSources} canonical + ${productionExtensions} produksjonsutvidelser), ${directObjects} direkte objekter, ${claimReady} claim-klare funn, ${boundaries} slutningsgrenser, ${questionReadyTopics} question-ready emner/${questionReadyClaims} claims.`);
  if (errors.length) {
    for (const error of errors) console.error(`FAIL: ${error}`);
    process.exitCode = 1;
  }
}

main();
