// Read-only integrity audit for Psykoteori ↔ canonical Psykologifagverk.
// A passing structural audit never means that psychology theories are source-verified.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const audit = read("data/psychology/psychology_theory_coverage_v1.json");
const catalog = read("data/psychology/psychology_theories.json");
const errors = [];
const fail = (message) => errors.push(message);
const unique = (values) => new Set(values).size === values.length;

if (audit.schema !== "history_go_psykologi_theory_coverage_audit_v1") fail("unexpected audit schema");
if (audit.subject_id !== "psykologi" || catalog.fagverk_subject !== "psykologi") fail("subject mismatch");
if (!Array.isArray(catalog.chapters) || catalog.chapters.length !== 6) fail("expected six Fagverk chapters");
if (!Array.isArray(audit.coverage_entries)) fail("missing coverage entries");

const canonical = new Map();
for (const chapter of catalog.chapters || []) {
  const source = read("data/fagverk/psykologi/" + chapter.id + ".json");
  if (source.chapter_id !== chapter.id || source.subject_id !== "psykologi") {
    fail("invalid chapter: " + chapter.id);
  }
  for (const id of source.emne_ids || []) {
    if (canonical.has(id)) fail("duplicate canonical emne: " + id);
    canonical.set(id, chapter.id);
  }
}
const theories = new Map((catalog.theories || []).map((theory) => [theory.id, theory]));
if (theories.size !== (catalog.theories || []).length) fail("duplicate theory ID");
const entryIds = (audit.coverage_entries || []).map((entry) => entry.emne_id);
if (!unique(entryIds)) fail("duplicate audit emne");
if (canonical.size !== 58 || entryIds.length !== 58) fail("58-emne baseline changed: update audit deliberately");
const linkedTheories = new Set();
let linked = 0, sourceReviewed = 0, editorialReviewed = 0;
for (const entry of audit.coverage_entries || []) {
  const id = entry.emne_id;
  if (canonical.get(id) !== entry.chapter_id) fail("unknown/wrong chapter for " + id);
  if (!entry.article_path || entry.article_path !== "data/fagverk/psykologi/emneartikler/" + id + ".json") {
    fail("wrong canonical article path for " + id);
    continue;
  }
  const article = read(entry.article_path);
  if (article.emne_id !== id || article.subject_id !== "psykologi") fail("invalid article: " + id);
  const theoryIds = entry.theory_ids || [];
  if (!Array.isArray(theoryIds) || !unique(theoryIds)) fail("duplicate/malformed theory IDs for " + id);
  for (const theoryId of theoryIds) {
    const theory = theories.get(theoryId);
    const related = theory ? [theory.emne_id, ...(theory.related_emne_links || []).map((item) => item.emne_id)] : [];
    if (!theory || !related.includes(id) || theory.chapter_id !== entry.chapter_id) {
      fail("theory card does not link back to canonical emne: " + id + " / " + theoryId);
    }
    linkedTheories.add(theoryId);
  }
  if (theoryIds.length) linked++;
  if (entry.link_status === "unmapped" && theoryIds.length) fail("unmapped has theory: " + id);
  if (entry.link_status === "linked_unreviewed" && !theoryIds.length) fail("linked has no theory: " + id);
  const partial = entry.partial_reference_review;
  if (partial) {
    if (partial.status !== "partial_historical_method_review" || entry.source_review_status !== "not_reviewed") {
      fail("partial reference audit must remain non-final: " + id);
    }
    const boundTheory = theoryIds.length === 1 ? theories.get(theoryIds[0]) : null;
    if (!boundTheory || boundTheory.source_review_state !== partial.status ||
        !Array.isArray(partial.reference_urls) || !partial.reference_urls.length ||
        !Array.isArray(boundTheory.reference_links) ||
        partial.reference_urls.length !== boundTheory.reference_links.length ||
        partial.reference_urls.some((url, i) => url !== boundTheory.reference_links[i]?.url)) {
      fail("partial reference audit does not match theory-card citations: " + id);
    }
  } else if (theoryIds.some((theoryId) => {
    const theory = theories.get(theoryId);
    return theory?.emne_id === id && theory.source_review_state === "partial_historical_method_review";
  })) {
    // A theory's partial source review belongs to its original card/emne;
    // additional emne reuse is separately claim-bound but remains unreviewed.
    fail("primary theory card has a partial source review omitted from coverage: " + id);
  }
  if (!["unmapped", "linked_unreviewed", "source_verified", "editorial_pass"].includes(entry.link_status)) {
    fail("unrecognized link status for " + id);
  }
  if (!["not_reviewed", "verified", "rework"].includes(entry.source_review_status)) {
    fail("unknown source review status: " + id);
  }
  if (!["not_reviewed", "verified", "rework"].includes(entry.editorial_review_status)) {
    fail("unknown editorial review status: " + id);
  }
  for (const [field, allowed] of [
    ["article_claim_candidates", article.claim_ids || []],
    ["article_source_candidates", article.source_ids || []]
  ]) {
    const candidateIds = entry[field] || [];
    if (!Array.isArray(candidateIds) || !unique(candidateIds)) fail("duplicate/invalid candidates: " + id);
    for (const candidate of candidateIds) {
      if (!allowed.includes(candidate)) fail("candidate not in article: " + id + " / " + candidate);
    }
  }
  const vettedClaims = entry.verified_theory_claim_ids || [];
  const vettedSources = entry.verified_theory_source_ids || [];
  if (!Array.isArray(vettedClaims) || !Array.isArray(vettedSources)) fail("malformed vetted evidence: " + id);
  if (entry.source_review_status === "verified") {
    sourceReviewed++;
    if (!theoryIds.length || !vettedClaims.length || !vettedSources.length) {
      fail("verified without checked claims, sources and theory: " + id);
    }
  } else if (vettedClaims.length || vettedSources.length) {
    fail("unchecked evidence misrepresented as verified: " + id);
  }
  if (entry.editorial_review_status === "verified") {
    editorialReviewed++;
    if (entry.source_review_status !== "verified" || !theoryIds.length) {
      fail("editorial pass without source review: " + id);
    }
  }
  if (entry.link_status === "source_verified" && entry.source_review_status !== "verified") {
    fail("false source-verified coverage: " + id);
  }
  if (entry.link_status === "editorial_pass" && entry.editorial_review_status !== "verified") {
    fail("false editorial coverage: " + id);
  }
}
// Each additional emne link must be semantically justified and explicitly supported
// by a canonical claim and source in that particular Fagverk chapter. No link counts
// as full scholarly review until field-level review is completed.
for (const theory of catalog.theories || []) {
  const links = theory.related_emne_links || [];
  if (!Array.isArray(links) || !unique(links.map((link) => link.emne_id))) {
    fail("duplicate/malformed extra emne links: " + theory.id);
    continue;
  }
  for (const link of links) {
    if (link.emne_id === theory.emne_id || canonical.get(link.emne_id) !== theory.chapter_id) {
      fail("cross-chapter, duplicate or unknown extra emne: " + theory.id + " / " + link.emne_id);
      continue;
    }
    const article = read("data/fagverk/psykologi/emneartikler/" + link.emne_id + ".json");
    if (link.title !== article.title || typeof link.why !== "string" || link.why.trim().length < 55) {
      fail("extra emne requires canonical title and substantive scope: " + theory.id + " / " + link.emne_id);
    }
    const claimRegistry = read("data/fagverk/psykologi/" + theory.chapter_id + "/claims.json");
    const claimMap = new Map(claimRegistry.claims.map((claim) => [claim.id, claim]));
    const sourceSet = new Set(claimRegistry.sources.map((src) => src.id));
    if (!Array.isArray(link.claim_ids) || !link.claim_ids.length ||
        !Array.isArray(link.source_ids) || !link.source_ids.length ||
        !unique(link.claim_ids) || !unique(link.source_ids)) {
      fail("unsubstantiated extra emne link: " + theory.id + " / " + link.emne_id);
      continue;
    }
    for (const id of link.claim_ids) {
      if (!article.claim_ids?.includes(id) || !claimMap.has(id)) {
        fail("extra emne references unknown article claim: " + link.emne_id + " / " + id);
      }
    }
    for (const id of link.source_ids) {
      if (!sourceSet.has(id) || !article.source_ids?.includes(id) ||
          !link.claim_ids.some((claimId) => claimMap.get(claimId)?.source_ids.includes(id))) {
        fail("extra emne source has no matching canonical claim: " + link.emne_id + " / " + id);
      }
    }
    const entry = audit.coverage_entries.find((item) => item.emne_id === link.emne_id);
    if (!entry || !entry.theory_ids.includes(theory.id) || entry.link_status !== "linked_unreviewed" ||
        entry.source_review_status !== "not_reviewed" ||
        entry.editorial_review_status !== "not_reviewed" ||
        entry.related_link_evidence?.review !== "canonical_id_and_claim_binding_only" ||
        JSON.stringify(entry.related_link_evidence?.claim_ids) !== JSON.stringify(link.claim_ids) ||
        JSON.stringify(entry.related_link_evidence?.source_ids) !== JSON.stringify(link.source_ids)) {
      fail("additional emne link must be non-final and exactly mirrored in coverage: " + link.emne_id);
    }
  }
}
for (const id of canonical.keys()) if (!entryIds.includes(id)) fail("missing canonical emne: " + id);
for (const theoryId of theories.keys()) if (!linkedTheories.has(theoryId)) fail("theory missing from audit: " + theoryId);

if (errors.length) {
  for (const error of errors) console.error("ERROR: " + error);
  console.error("Psykoteori audit FAILED: " + errors.length + " structural problems");
  process.exitCode = 1;
} else {
  console.log(
    "Psykoteori structural audit PASS: " + entryIds.length + "/" + canonical.size
    + " canonical emner, " + linked + " linked (" + (entryIds.length - linked)
    + " unmapped), " + sourceReviewed + " source-verified, "
    + editorialReviewed + " editorially approved."
  );
  console.log("Note: PASS verifies data integrity only, NOT scholarly quality.");
}
