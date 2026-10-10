// Psykoteori: canonical, read-only coverage integrity test.
// Source/editorial verification is a separate evidence-backed human review gate.
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const repo = path.resolve(__dirname, "..");
const result = execFileSync(process.execPath, [
  path.join(repo, "scripts", "audit-psychology-theory-coverage.mjs"), "--check"
], { cwd: repo, encoding: "utf8", timeout: 30000 });

assert.match(result, /Psykoteori structural audit PASS: 58\/58 canonical emner/);
assert.match(result, /source-verified/);
assert.match(result, /NOT scholarly quality/);

const fs = require("node:fs");
const load = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), "utf8"));
const catalog = load("data/psychology/psychology_theories.json");
const coverage = load("data/psychology/psychology_theory_coverage_v1.json");
const byEmne = new Map(coverage.coverage_entries.map((entry) => [entry.emne_id, entry]));
const partiallyReviewed = catalog.theories.filter((theory) => theory.source_review_state === "partial_historical_method_review");
const expectedPartials = [
  "psykoanalyse", "behaviorisme", "kognitiv_psykologi",
  "humanistisk_psykologi", "femfaktormodellen", "heuristikker",
  "stressvurdering", "tilknytning", "sosial_laring",
  "sosial_identitet", "konformitet", "resiliens",
  "kognitiv_terapi", "biopsykososial_modell"
];
assert.deepEqual(partiallyReviewed.map((theory) => theory.id), expectedPartials,
  "batches 01–04 must be accounted for as PARTIAL reviews, not scholarly approval");
for (const theory of partiallyReviewed) {
  assert.ok(expectedPartials.includes(theory.id));
  const entry = byEmne.get(theory.emne_id);
  assert.ok(entry?.theory_ids.includes(theory.id), "source review must bind canonical emne");
  assert.equal(entry.source_review_status, "not_reviewed", "partial review must not mark full theory verified");
  assert.equal(entry.editorial_review_status, "not_reviewed");
  assert.ok(theory.reference_links.length >= 2);
  const register = load("data/fagverk/psykologi/" + theory.chapter_id + "/claims.json");
  const claims = new Map(register.claims.map((claim) => [claim.id, claim]));
  const sourceIds = new Set(register.sources.map((source) => source.id));
  for (const reference of theory.reference_links) {
    assert.match(reference.url, /^https:\/\/[^\s"'<>]+$/, "reference must have a safe inspectable URL");
    assert.ok(reference.title && reference.supports.length > 30, "reference needs an explanatory scope");
    for (const claimId of reference.canonical_claim_ids) {
      assert.ok(claims.has(claimId), "unknown canonical claim " + claimId);
    }
    for (const sourceId of reference.canonical_source_ids) {
      assert.ok(sourceIds.has(sourceId), "unknown canonical source " + sourceId);
      assert.ok(reference.canonical_claim_ids.some((id) => claims.get(id)?.source_ids.includes(sourceId)),
        "canonical source must actually support one referenced claim: " + sourceId);
    }
  }
}
assert.equal(catalog.theories.filter((theory) => !theory.reference_links).length, 0);
assert.equal(coverage.coverage_entries.filter((entry) => entry.partial_reference_review).length, 14);
assert.equal(coverage.coverage_entries.filter((entry) => entry.theory_ids.length).length, 18,
  "four claim-bound reuse links add emne-level coverage without adding duplicate theory cards");
const extraLinks = catalog.theories.flatMap((theory) => theory.related_emne_links || []);
assert.equal(extraLinks.length, 4);
for (const link of extraLinks) {
  const entry = byEmne.get(link.emne_id);
  assert.equal(entry?.related_link_evidence?.review, "canonical_id_and_claim_binding_only");
  assert.equal(entry.source_review_status, "not_reviewed");
}
assert.equal(coverage.coverage_entries.filter((entry) => entry.source_review_status === "verified").length, 0,
  "partial evidence must not be silently promoted to full verification");

// Evidence-bounded field-review regression: links and alternatives stay on the
// actual theory cards, without silently promoting partial reviews to verification.
const fieldReviewSources = {
  femfaktormodellen: ["https://pubmed.ncbi.nlm.nih.gov/18453460/"],
  heuristikker: [
    "https://pubmed.ncbi.nlm.nih.gov/7455683/",
    "https://doi.org/10.1146/annurev-psych-120709-145346"
  ],
  tilknytning: ["https://doi.org/10.1002/jhbs.21729"],
  sosial_identitet: ["https://www.yorku.ca/pclassic/Sherif/chap2.htm"],
  konformitet: ["https://doi.org/10.1037/0033-2909.119.1.111"],
  kognitiv_terapi: ["https://pubmed.ncbi.nlm.nih.gov/36640411/"]
};
for (const [id, urls] of Object.entries(fieldReviewSources)) {
  const theory = catalog.theories.find((item) => item.id === id);
  assert.ok(theory, "missing field-reviewed theory: " + id);
  const actual = theory.reference_links.map((link) => link.url);
  for (const url of urls) {
    assert.ok(actual.includes(url), "field-review source is missing: " + id + " / " + url);
    const reference = theory.reference_links.find((link) => link.url === url);
    assert.deepEqual(reference.canonical_claim_ids, [],
      "new literature must not inherit unverified canonical claim IDs");
    assert.deepEqual(reference.canonical_source_ids, [],
      "new literature must not inherit unverified canonical source IDs");
  }
  const mirror = byEmne.get(theory.emne_id).partial_reference_review.reference_urls;
  assert.deepEqual(mirror, actual, "audit source URL mirror diverged: " + id);
}
const reviewed = new Map(catalog.theories.map((theory) => [theory.id, theory]));
assert.match(reviewed.get("femfaktormodellen").contrast, /HEXACO/);
assert.match(reviewed.get("heuristikker").contrast, /økologisk rasjonalitet/i);
assert.match(reviewed.get("heuristikker").example, /Undervisningsscenario:/);
assert.match(reviewed.get("sosial_identitet").contrast, /Sherif/);
assert.match(reviewed.get("behaviorisme").idea, /Negativ forsterkning/);
assert.match(reviewed.get("kognitiv_terapi").limit, /depresjon/);
assert.match(reviewed.get("tilknytning").limit, /diagnos/);
// Evidence batch 05: safeguard quantitative claims against summary drift.
assert.match(reviewed.get("femfaktormodellen").idea, /ekstraversjon.*omgjengelighet.*planmessighet.*nevrotisisme.*åpenhet/);
assert.match(reviewed.get("heuristikker").example, /gevinster.*tap/);
assert.match(reviewed.get("tilknytning").limit, /r = 0,28/);
assert.match(reviewed.get("tilknytning").limit, /publiseringsskjevhet/);
assert.match(reviewed.get("resiliens").method, /traumeeksponerte voksne/);
assert.match(reviewed.get("resiliens").limit, /korrelasjonsdesign/);
assert.match(reviewed.get("kognitiv_terapi").limit, /g = 0,06/);
assert.match(reviewed.get("kognitiv_terapi").limit, /statistisk signifikant i hovedanalysen/);
assert.match(reviewed.get("konformitet").method, /133.*17 land/);
assert.ok(reviewed.get("tilknytning").reference_links.some((link) =>
  link.url === "https://pubmed.ncbi.nlm.nih.gov/32772822/" && link.supports.includes("2021-årgang")));
assert.ok(reviewed.get("kognitiv_terapi").reference_links.some((link) =>
  link.url === "https://pubmed.ncbi.nlm.nih.gov/36640411/" && link.supports.includes("de fleste sensitivitetsanalysene")));
assert.equal(coverage.coverage_entries.filter((entry) => entry.source_review_status === "verified").length, 0,
  "batch 05 specific-source check must never imply 14/14 full source verification");
// Evidence batch 06: theoretical proposals are not silently upgraded to
// causal, clinical or person-level proof.
assert.match(reviewed.get("humanistisk_psykologi").limit, /seks betingelser.*teoretisk påstand/);
assert.match(reviewed.get("sosial_laring").method, /1961.*1977/);
assert.match(reviewed.get("sosial_identitet").method, /Minimalgruppeeksperimenter.*belønning/);
assert.match(reviewed.get("biopsykososial_modell").limit, /ikke en dokumentert årsaksfordeling/);
assert.equal(catalog.theories.length, 14);

// Structured evidence matrix: all 14 cards must expose traceable, bounded
// source anchors. A source anchor is NOT proof that the full card is verified.
const fieldEvidence = load("reports/psychology/psykoteori_evidence_matrix_14_2026-10-10.json");
assert.equal(fieldEvidence.schema, "history_go_psykoteori_field_evidence_matrix_v1");
assert.equal(fieldEvidence.card_count, catalog.theories.length);
assert.deepEqual(fieldEvidence.cards.map((x) => x.theory_id), catalog.theories.map((x) => x.id));
for (const row of fieldEvidence.cards) {
  const theory = catalog.theories.find((x) => x.id === row.theory_id);
  assert.equal(row.emne_id, theory.emne_id, "matrix emne mismatch: " + row.theory_id);
  assert.equal(row.chapter_id, theory.chapter_id, "matrix chapter mismatch: " + row.theory_id);
  assert.equal(row.source_verification, "partial_historical_method_review");
  assert.equal(row.editorial_approval, "not_reviewed");
  assert.deepEqual(row.claims_reviewed,
    ["founders", "period", "idea", "method", "limit", "contrast", "example", "example_secondary"]);
  assert.ok(typeof row.key_claim === "string" && row.key_claim.length > 75,
    "claim scope missing: " + row.theory_id);
  assert.ok(typeof row.limitation === "string" && row.limitation.length > 75,
    "limitations missing: " + row.theory_id);
  assert.equal(row.reference_urls.length, 2, "two precise anchors required: " + row.theory_id);
  for (const url of row.reference_urls) {
    assert.ok(theory.reference_links.some((source) => source.url === url),
      "matrix source not cited by theory: " + row.theory_id + " / " + url);
  }
  for (const id of row.canonical_claim_ids) {
    assert.ok(theory.reference_links.some((reference) => reference.canonical_claim_ids.includes(id)),
      "unknown bound claim in evidence matrix: " + row.theory_id + " / " + id);
  }
  for (const id of row.canonical_source_ids) {
    assert.ok(theory.reference_links.some((reference) => reference.canonical_source_ids.includes(id)),
      "unknown bound source in evidence matrix: " + row.theory_id + " / " + id);
  }
  assert.ok(theory.example_secondary.startsWith("Undervisningsscenario:"));
  assert.notEqual(theory.example, theory.example_secondary);
  assert.equal(row.secondary_scenario_status, "authored_hypothetical_not_historical_case");
}
assert.equal(fieldEvidence.cards.filter((x) => x.editorial_approval !== "not_reviewed").length, 0,
  "structural evidence matrix must not confer scholarly approval");

// Batch 07: four-card source audit must remain evidence-bounded.
const group1 = ["psykoanalyse", "tilknytning", "resiliens", "kognitiv_terapi"];
const group1Sources = {
  psykoanalyse: ["https://www.loc.gov/item/76454571/", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10168167/"],
  tilknytning: ["https://wellcomecollection.org/works/ebjjsja2", "https://pubmed.ncbi.nlm.nih.gov/5490680/"],
  resiliens: ["https://wellcomecollection.org/works/wxaez2sy", "https://doi.org/10.1111/jftr.12255"],
  kognitiv_terapi: ["https://pubmed.ncbi.nlm.nih.gov/14045261/", "https://pubmed.ncbi.nlm.nih.gov/7006557/"]
};
for (const id of group1) {
  const theory = reviewed.get(id);
  const entry = byEmne.get(theory.emne_id);
  const matrixRow = fieldEvidence.cards.find((row) => row.theory_id === id);
  const urls = theory.reference_links.map((link) => link.url);
  assert.deepEqual(entry.partial_reference_review.reference_urls, urls,
    "group 1 reference mirrors must match: " + id);
  assert.equal(entry.source_review_status, "not_reviewed");
  assert.equal(entry.editorial_review_status, "not_reviewed");
  assert.equal(theory.source_review_state, "partial_historical_method_review");
  assert.equal(matrixRow.group_1_source_audit.status, "source_bounded_review_in_progress");
  assert.equal(matrixRow.group_1_source_audit.fulltext_complete, false);
  assert.equal(matrixRow.group_1_source_audit.report,
    "reports/psychology/psykoteori_kildekontroll_gruppe1_2026-10-10.md");
  for (const url of group1Sources[id]) {
    const source = theory.reference_links.find((link) => link.url === url);
    assert.ok(source, "missing group 1 scholarly reference: " + id + " / " + url);
    assert.deepEqual(source.canonical_claim_ids, []);
    assert.deepEqual(source.canonical_source_ids, []);
  }
}
assert.match(reviewed.get("psykoanalyse").limit, /moderne psykodynamisk psykoterapi/);
assert.match(reviewed.get("tilknytning").period, /1958.*1970.*1978/);
assert.match(reviewed.get("resiliens").period, /1955.*1982.*2001/);
assert.match(reviewed.get("kognitiv_terapi").limit, /g = 0,79.*g = 0,06/);
console.log("civication-psychology-room-coverage.test.js passed");
