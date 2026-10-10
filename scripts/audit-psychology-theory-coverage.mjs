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
    const related = theory?.emne_ids || (theory?.emne_id ? [theory.emne_id] : []);
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
  } else if (theoryIds.some((theoryId) => theories.get(theoryId)?.source_review_state === "partial_historical_method_review")) {
    fail("theory card has a partial source review omitted from coverage: " + id);
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
