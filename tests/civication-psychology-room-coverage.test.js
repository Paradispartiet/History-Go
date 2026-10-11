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
  "stressvurdering", "tilknytning", "sosial_laring", "selvbestemmelsesteori",
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
assert.equal(coverage.coverage_entries.filter((entry) => entry.partial_reference_review).length, 15);
assert.equal(coverage.coverage_entries.filter((entry) => entry.theory_ids.length).length, 31,
  "seventeen additional relevant emner, including one new primary theory, are linked");
// Batch 02: eight new canonical claim-bound, still-unreviewed reuse links.
const batch02Links = [
  [
    "humanistisk_psykologi",
    "em_psy_motivasjon_behov",
    "fti-15",
    "src-apa-humanistic"
  ],
  [
    "stressvurdering",
    "em_psy_affektregulering",
    "kfa-23",
    "src-reappraisal-review"
  ],
  [
    "tilknytning",
    "em_psy_barn_ungdom",
    "uol-02",
    "src-who-nurturing"
  ],
  [
    "tilknytning",
    "em_psy_oppvekst_miljo",
    "uol-07",
    "src-harvard-serve-return"
  ],
  [
    "sosial_identitet",
    "em_psy_fordommer_kategorisering",
    "sns-11",
    "src-status-ingroup"
  ],
  [
    "konformitet",
    "em_psy_normalitet_avvik",
    "sns-13",
    "src-stigma-framework"
  ],
  [
    "biopsykososial_modell",
    "em_psy_byrom_psykisk_helse",
    "phi-25",
    "src-who-guidance"
  ],
  [
    "biopsykososial_modell",
    "em_psy_velferd_psykisk_helse",
    "phi-03",
    "src-who-guidance"
  ]
];
for (const [theoryId, emneId, claimId, sourceId] of batch02Links) {
  const theory = catalog.theories.find((item) => item.id === theoryId);
  const link = theory?.related_emne_links?.find((item) => item.emne_id === emneId);
  assert.ok(link, "missing batch 02 link: " + emneId);
  assert.deepEqual(link.claim_ids, [claimId]);
  assert.deepEqual(link.source_ids, [sourceId]);
  assert.deepEqual(byEmne.get(emneId).theory_ids, [theoryId]);
  assert.equal(byEmne.get(emneId).link_status, "linked_unreviewed");
  assert.equal(byEmne.get(emneId).source_review_status, "not_reviewed");
  assert.equal(byEmne.get(emneId).editorial_review_status, "not_reviewed");
}
assert.equal(coverage.coverage_entries.filter((entry) => !entry.theory_ids.length).length, 27);

const extraLinks = catalog.theories.flatMap((theory) => theory.related_emne_links || []);
assert.equal(extraLinks.length, 16);
for (const link of extraLinks) {
  const entry = byEmne.get(link.emne_id);
  assert.equal(entry?.related_link_evidence?.review, "canonical_id_and_claim_binding_only");
  assert.equal(entry.source_review_status, "not_reviewed");
}
assert.equal(coverage.coverage_entries.filter((entry) => entry.source_review_status === "verified").length, 0,
  "partial evidence must not be silently promoted to full verification");


// Educational readiness is a publishing/editorial decision, not a false claim that every
// original article or historical cohort has been independently reanalyzed.
for (const id of ["psykoanalyse", "tilknytning", "resiliens", "kognitiv_terapi"]) {
  const card = catalog.theories.find((item) => item.id === id);
  assert.equal(card.teaching_view?.editorial_state, "ready_for_educational_use");
  for (const key of ["period", "idea", "method", "limit"]) {
    const text = card.teaching_view[key];
    assert.ok(typeof text === "string" && text.length > 65 && text.length < 500,
      "pedagogical summary missing or too long: " + id + "." + key);
  }
  const highlights = card.teaching_view.featured_reference_urls;
  assert.equal(highlights.length, 4);
  assert.ok(highlights.every((url) => card.reference_links.some((ref) => ref.url === url)));
  assert.equal(card.source_review_state, "partial_historical_method_review",
    "pedagogical readiness must not masquerade as complete original-source verification");
}
for (const [id, emne] of [
  ["psykoanalyse", "em_psy_ubevisste_prosesser"],
  ["tilknytning", "em_psy_familie_samspill"],
  ["resiliens", "em_psy_traume_regulering"],
  ["kognitiv_terapi", "em_psy_terapi_praksis"]
]) {
  assert.ok(catalog.theories.find((item) => item.id === id).related_emne_links
    .some((link) => link.emne_id === emne));
  assert.deepEqual(byEmne.get(emne).theory_ids, [id]);
  assert.equal(byEmne.get(emne).source_review_status, "not_reviewed");
}

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
assert.match(reviewed.get("resiliens").limit, /Stianalysene er observasjonelle og kan ikke isolere årsakseffekt/);
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
assert.equal(catalog.theories.length, 15);

// First new theory card: independent primary emne, with traceable sources and
// educational text, but no false scholarly-verification promotion.
const selfDetermination = catalog.theories.find((x) => x.id === "selvbestemmelsesteori");
assert.ok(selfDetermination);
assert.equal(selfDetermination.emne_id, "em_psy_skole_motivasjon");
assert.equal(selfDetermination.chapter_id, "utvikling-oppvekst-og-laring");
assert.equal(selfDetermination.compare_with, "sosial_laring");
assert.equal(selfDetermination.teaching_view.editorial_state, "ready_for_educational_use");
assert.match(selfDetermination.idea, /autonomi.*kompetanse.*tilhørighet/);
assert.match(selfDetermination.limit, /belønninger/);
assert.deepEqual(byEmne.get("em_psy_skole_motivasjon").theory_ids, ["selvbestemmelsesteori"]);
assert.equal(byEmne.get("em_psy_skole_motivasjon").source_review_status, "not_reviewed");
for (const [claimId, sourceId] of [["uol-13", "src-student-motivation"], ["uol-14", "src-motivation-pathways"]]) {
  assert.ok(selfDetermination.reference_links.some((r) => r.canonical_claim_ids.includes(claimId) && r.canonical_source_ids.includes(sourceId)),
    "SDT card must tie reviewed school claims to canonical sources");
}
assert.deepEqual(selfDetermination.teaching_view.featured_reference_urls.length, 4);
assert.ok(!selfDetermination.related_emne_links, "do not force a cross-chapter link");

// Historical 2026-10-10 evidence matrix records the original 14-card cohort only:
// new cards have separately scoped source reviews. Historical matrix remains immutable.
const fieldEvidence = load("reports/psychology/psykoteori_evidence_matrix_14_2026-10-10.json");
assert.equal(fieldEvidence.schema, "history_go_psykoteori_field_evidence_matrix_v1");
assert.equal(fieldEvidence.card_count, 14);
assert.deepEqual(fieldEvidence.cards.map((x) => x.theory_id), catalog.theories.filter((x) => x.id !== "selvbestemmelsesteori").map((x) => x.id));
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

const detailedReview = load("reports/psychology/psykoteori_claim_units_group1_2026-10-10.json");
assert.equal(detailedReview.schema, "history_go_psykoteori_claim_units_source_review_v1");
assert.equal(detailedReview.card_count, 4);
assert.equal(detailedReview.fields_per_card, 8);
assert.equal(detailedReview.unit_count, 32);
assert.equal(detailedReview.units.length, 32);
const expectedFields = [
  "founders", "period", "idea", "method", "limit", "contrast", "example", "example_secondary"
];
assert.equal(new Set(detailedReview.units.map((unit) => unit.id)).size, 32);
for (const id of group1) {
  const theory = reviewed.get(id);
  const rows = detailedReview.units.filter((unit) => unit.theory_id === id);
  assert.deepEqual(rows.map((unit) => unit.field), expectedFields,
    "each group 1 card must have eight distinct, scoped evidence units: " + id);
  for (const unit of rows) {
    assert.equal(unit.full_original_review_complete, false,
      "partial source consultation cannot claim full original research verification");
    assert.equal(unit.card_is_source_verified, false);
    assert.ok(unit.assertion.length > 35 && unit.scope_limit.length > 35);
    assert.equal(unit.id, id + "__" + unit.field);
    if (unit.field.startsWith("example")) {
      assert.deepEqual(unit.evidence_urls, []);
      assert.equal(unit.claim_status, "hypothetical_label_checked");
    } else {
      assert.equal(unit.claim_status, "evidence_bounded_not_fully_verified");
      assert.ok(unit.evidence_urls.length >= 1);
      for (const url of unit.evidence_urls) {
        assert.ok(theory.reference_links.some((ref) => ref.url === url),
          "evidence URL not found on the theory card: " + id + " / " + url);
      }
    }
  }
}

// Scientific signoff is separate from claim-field documentation and green CI.
// All eight CBT fields were assessed, but the 1981/1982 participant bridge remains unresolved.
const cbtAudits = detailedReview.units.filter((unit) => unit.theory_id === "kognitiv_terapi");
assert.equal(cbtAudits.length, 8);
assert.ok(cbtAudits.every((unit) => unit.latest_claim_audit?.date === "2026-10-11"
  && unit.latest_claim_audit.report_section === "28"
  && unit.latest_claim_audit.scientific_signoff === false
  && unit.card_is_source_verified === false
  && unit.full_original_review_complete === false));
assert.equal(cbtAudits.find((unit) => unit.field === "method").latest_claim_audit.verdict,
  "blocked_primary_fulltext_and_cohort_flow");
assert.ok(cbtAudits.find((unit) => unit.field === "method")
  .latest_claim_audit.remaining_gate.includes("Kovacs 1981"));

// Original 1977 follow-up: dosing/taper confound must remain in the published card.
assert.match(reviewed.get("kognitiv_terapi").method, /15,3 økter.*75 mg.*250 mg.*nedtrapping/);
assert.match(reviewed.get("kognitiv_terapi").limit, /BDI.*2,43.*ikke dokumentasjon/);
const taperMethod = cbtAudits.find((unit) => unit.field === "method").latest_claim_audit.followup_29;
const taperLimits = cbtAudits.find((unit) => unit.field === "limit").latest_claim_audit.followup_29;
assert.ok(taperMethod && taperLimits
  && taperMethod.archive_access_state.includes("not_read")
  && taperMethod.cohort_link_1977_1981_1982 === "unresolved"
  && taperMethod.scientific_signoff === false
  && taperLimits.scientific_signoff === false);

// Batch 08: original-method audit; note that passing these guards is not scholarly approval.
const primaryOriginalSources = {
  tilknytning: [
    "https://pubmed.ncbi.nlm.nih.gov/13610508/",
    "https://www.jstor.org/stable/1127388"
  ],
  resiliens: [
    "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1939-0025.1989.tb01636.x",
    "https://www.cambridge.org/core/journals/development-and-psychopathology/article/abs/risk-resilience-and-recovery-perspectives-from-the-kauai-longitudinal-study/DC3C3F10587A1A7D04C0310270717B3E"
  ],
  kognitiv_terapi: [
    "https://jamanetwork.com/journals/jamapsychiatry/article-abstract/488402"
  ]
};
for (const [id, urls] of Object.entries(primaryOriginalSources)) {
  const theory = reviewed.get(id);
  const coverageRow = byEmne.get(theory.emne_id);
  const matrixRow = fieldEvidence.cards.find((row) => row.theory_id === id);
  for (const url of urls) {
    const source = theory.reference_links.find((link) => link.url === url);
    assert.ok(source, "batch 08 missing original publication reference: " + id);
    assert.deepEqual(source.canonical_claim_ids, []);
    assert.deepEqual(source.canonical_source_ids, []);
    assert.ok(matrixRow.group_1_source_audit.new_reference_urls.includes(url));
  }
  assert.deepEqual(coverageRow.partial_reference_review.reference_urls,
    theory.reference_links.map((link) => link.url));
  assert.equal(matrixRow.group_1_source_audit.fulltext_complete, false);
}
assert.match(reviewed.get("tilknytning").idea, /biologiske mor/);
assert.match(reviewed.get("tilknytning").method, /56.*23.*33.*åtte/);
// The entire 1970 original is now inspected, while the independently deposited coding manual is not.
const ainsworthFull = "https://www.fre.uy/a/e68bbdc6/Ainsworth.Attachmentexplorationandseparation.pdf";

// Bowlby (1958): primary journal reprint supports caregiver definition and noncausal monotropy.
const bowlby1958Original = "https://scispace.com/pdf/the-nature-of-the-child-s-tie-to-his-mother-1y4tsohzwc.pdf";
const bowlbyTheory = reviewed.get("tilknytning");
assert.ok(bowlbyTheory.idea.includes("monotropi") && bowlbyTheory.idea.includes("beskrivende begrep"));
assert.ok(bowlbyTheory.method.includes("24-siders originaltrykk-reproduksjon"));
assert.ok(bowlbyTheory.limit.includes("s. 365–366") && bowlbyTheory.limit.includes("s. 370"));
assert.ok(bowlbyTheory.reference_links.some((r) =>
  r.url === bowlby1958Original && r.canonical_claim_ids.length === 0 && r.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((r) => r.theory_id === "tilknytning")
  .group_1_source_audit.new_reference_urls.includes(bowlby1958Original));
assert.equal(detailedReview.original_publication_audit.entries.find((r) =>
  r.id === "tilknytning_bowlby_1958").source_url, bowlby1958Original);
assert.equal(detailedReview.original_publication_audit.entries.find((r) =>
  r.id === "tilknytning_bowlby_1958").access,
  "original_journal_24_page_reprint_accessible_key_pp350_351_365_366_369_370_visually_reviewed");
assert.ok(detailedReview.units.filter((u) => u.theory_id === "tilknytning"
  && ["founders", "idea", "method", "limit"].includes(u.field))
  .every((u) => u.evidence_urls.includes(bowlby1958Original)
    && u.card_is_source_verified === false && u.full_original_review_complete === false));

const ainsworthCard = reviewed.get("tilknytning");
assert.ok(ainsworthCard.reference_links.some((ref) =>
  ref.url === ainsworthFull && ref.canonical_claim_ids.length === 0 && ref.canonical_source_ids.length === 0));
assert.match(ainsworthCard.method, /NAPS 00762/);
assert.match(ainsworthCard.limit, /for tidlig kvantifisering/);
assert.ok(fieldEvidence.cards.find((x) => x.theory_id === "tilknytning").group_1_source_audit.new_reference_urls.includes(ainsworthFull));
assert.equal(detailedReview.original_publication_audit.entries.find((x) =>
  x.id === "tilknytning_ainsworth_bell_1970").access,
  "full_1970_printed_pages49_67_read_in_third_party_JSTOR_scan_NAPS_00762_unread");
assert.ok(detailedReview.units.filter((x) =>
  x.theory_id === "tilknytning" && ["method", "limit"].includes(x.field))
  .every((x) => x.evidence_urls.includes(ainsworthFull) && x.card_is_source_verified === false));
// Ainsworth/Bell/Stayton original 1969 author manuscript is not NAPS 00762.
const ericAinsworth1969 = "https://files.eric.ed.gov/fulltext/ED056742.pdf";
assert.match(ainsworthCard.period, /juli 1969.*1971.*1970/);
assert.match(ainsworthCard.method, /1969.*A\/B\/C.*åtte undergrupper/);
assert.match(ainsworthCard.method, /bare 23 av de 56 barna.*hjemmeobservasjoner/);
assert.match(ainsworthCard.limit, /NAPS 00762 er fremdeles ikke lest/);
assert.ok(ainsworthCard.reference_links.some((x) =>
  x.url === ericAinsworth1969 && x.canonical_claim_ids.length === 0 && x.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((x) => x.theory_id === "tilknytning")
  .group_1_source_audit.new_reference_urls.includes(ericAinsworth1969));
assert.ok(detailedReview.units.filter((x) =>
  x.theory_id === "tilknytning" && ["period", "method", "limit"].includes(x.field))
  .every((x) => x.evidence_urls.includes(ericAinsworth1969) && x.card_is_source_verified === false));
assert.equal(detailedReview.original_publication_audit.entries.find((x) =>
  x.id === "tilknytning_ainsworth_bell_stayton_1969").access,
  "ERIC_scanned_1969_author_manuscript_methods_classification_and_discussion_read_NAPS00762_unread");
// The 2015 book contents identify potentially relevant scoring appendices, not inspected NAPS 00762.
const ainsworthClassic2015 = "https://www.routledge.com/Patterns-of-Attachment-A-Psychological-Study-of-the-Strange-Situation/Ainsworth-Blehar-Waters-Wall/p/book/9780203758045";
assert.match(ainsworthCard.method, /appendiks I s\. 316.*II s\. 319.*III s\. 336/);
assert.match(ainsworthCard.limit, /appendiks I–III.*ikke innholdskontrollert.*NAPS 00762/);
assert.ok(ainsworthCard.reference_links.some((x) =>
  x.url === ainsworthClassic2015 && x.canonical_claim_ids.length === 0 && x.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((x) => x.theory_id === "tilknytning").group_1_source_audit.new_reference_urls.includes(ainsworthClassic2015));
assert.equal(detailedReview.original_publication_audit.entries.find((x) =>
  x.id === "tilknytning_ainsworth_blehar_waters_wall_1978_1979").access, "routledge_original_1978_preface_and_2015_preface_fully_read_in_148page_excerpt_appendices_I_III_unread_NAPS_00762_not_compared");
assert.ok(detailedReview.units.filter((x) =>
  x.theory_id === "tilknytning" && ["period","method","limit"].includes(x.field))
  .every((x) => x.evidence_urls.includes(ainsworthClassic2015) && x.card_is_source_verified === false));
// The original 1978 author preface directly rules out treating the fixed sequence as an experimental effect test.
const ainsworth1978Preface = "https://tilknytning.nu/wp-content/uploads/2023/04/Ainsworth-Patterns-of-Attachment.pdf";
assert.match(ainsworthCard.method, /1978, s\. xli og xliv.*ikke er et randomisert eksperiment/);
assert.match(ainsworthCard.method, /totalt 106 spedbarn.*ikke bare de 56/);
assert.match(ainsworthCard.limit, /rekkefølgeeffekter.*xliii–xliv/);
assert.ok(ainsworthCard.reference_links.some((x) => x.url === ainsworth1978Preface));
assert.ok(fieldEvidence.cards.find((x) => x.theory_id === "tilknytning")
  .group_1_source_audit.new_reference_urls.includes(ainsworth1978Preface));
assert.ok(detailedReview.units.filter((x) =>
  x.theory_id === "tilknytning" && ["period","method","limit"].includes(x.field))
  .every((x) => x.evidence_urls.includes(ainsworth1978Preface) && x.card_is_source_verified === false));
// Waters 2002 provides later coauthor scoring criteria, not the original NAPS 00762.
const watersScoring2002 = "https://psychology.psy.sunysb.edu/attachment/measures/content/ss_scoring.pdf";
assert.ok(ainsworthCard.period.includes("2002: Everett Waters"));
assert.ok(ainsworthCard.method.includes("fire sentrale sjuleddede interaksjonsskalaer"));
assert.ok(ainsworthCard.method.includes("ikke identiske med alle de fem sosialatferdsmålene"));
assert.ok(ainsworthCard.limit.includes("gruppe D (desorganisert tilknytning)"));
assert.ok(ainsworthCard.limit.includes("ikke klassifiseres"));
assert.ok(ainsworthCard.reference_links.some((r) => r.url === watersScoring2002 && r.canonical_claim_ids.length === 0 && r.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((r) => r.theory_id === "tilknytning").group_1_source_audit.new_reference_urls.includes(watersScoring2002));
assert.equal(detailedReview.original_publication_audit.entries.find((r) => r.id === "tilknytning_waters_scoring_2002").access, "18_page_author_coauthor_scoring_guide_online_key_pages1_2_11_14_visually_read_NAPS_00762_still_unread");
assert.ok(detailedReview.units.filter((u) => u.theory_id === "tilknytning" && ["period","method","limit"].includes(u.field)).every((u) => u.evidence_urls.includes(watersScoring2002) && u.card_is_source_verified === false));
assert.match(reviewed.get("tilknytning").limit, /4, 8 eller 14/);
assert.match(reviewed.get("resiliens").method, /698.*201.*72.*1, 2, 10, 18 og 32/);
assert.match(reviewed.get("resiliens").limit, /698.*201.*72.*88 %.*90 %.*80 %/);

// Werner 1982/1992/1993 provenance: historical book dates are not interchangeable.
assert.match(reviewed.get("resiliens").period, /1982.*1989.*1992.*1993/);
assert.match(reviewed.get("resiliens").method, /stianalyser med latente variabler/);
assert.match(reviewed.get("resiliens").method, /1982 dekker ikke 32-årsresultatene/);
assert.match(reviewed.get("resiliens").limit, /intervensjonsforsøk|evaluerte hjelpetiltak/);
assert.match(reviewed.get("resiliens").limit, /kulturelt avhengige oppvekstvilkår/);
const wernerSourceLinks = [
  "https://books.google.com/books?id=1YqZAAAAIAAJ",
  "https://www.scribd.com/document/799482252/Werner-1993"
];
const wernerCard = reviewed.get("resiliens");
const wernerMatrix = fieldEvidence.cards.find((r) => r.theory_id === "resiliens");
for (const url of wernerSourceLinks) {
  const link = wernerCard.reference_links.find((r) => r.url === url);
  assert.ok(link, "missing book provenance / original reproduction: " + url);
  assert.deepEqual(link.canonical_claim_ids, []);
  assert.deepEqual(link.canonical_source_ids, []);
  assert.ok(wernerMatrix.group_1_source_audit.new_reference_urls.includes(url));
}
assert.match(detailedReview.original_publication_audit.entries.find((e) =>
  e.id === "resiliens_werner_smith_1982").access, /no_book_fulltext/);
assert.match(detailedReview.original_publication_audit.entries.find((e) =>
  e.id === "resiliens_werner_1993").access, /pages503_515_reviewed/);

// The 1992 adult sample cannot be silently conflated with the original birth cohort.
const new1992Book = "https://cornellpress.cornell.edu/book/9780801480188/overcoming-the-odds/";
const nlmSummary = "https://www.ncbi.nlm.nih.gov/nlmcatalog/101063381";
for (const url of [new1992Book, nlmSummary]) {
  const ref = wernerCard.reference_links.find((r) => r.url === url);
  assert.ok(ref && ref.canonical_claim_ids.length === 0 && ref.canonical_source_ids.length === 0);
  assert.ok(wernerMatrix.group_1_source_audit.new_reference_urls.includes(url));
}

// Edition provenance: Werner/Smith (1989) is a verified reprint of 1982, not a second adult cohort study.
const reprint1989 = "https://ci.nii.ac.jp/ncid/BA13269997?l=en";
assert.match(wernerCard.period, /1982.*1989.*opptrykk.*1992.*1993/);
assert.match(wernerCard.period, /separat artikkel rapporterte Werner oppfølging til 32 år/);
assert.ok(wernerCard.reference_links.some((ref) =>
  ref.url === reprint1989 && ref.canonical_claim_ids.length === 0 && ref.canonical_source_ids.length === 0));
assert.ok(wernerMatrix.group_1_source_audit.new_reference_urls.includes(reprint1989));
assert.ok(detailedReview.units.filter((u) => u.theory_id === "resiliens"
  && ["founders", "period"].includes(u.field))
  .every((u) => u.evidence_urls.includes(reprint1989) && u.card_is_source_verified === false));

// Audit PLS provenance without claiming the original 1992 models have been reconstructed.
const lohmollerMethod = "https://link.springer.com/book/10.1007/978-3-642-52512-4";
assert.match(wernerCard.method, /Lohmöller \(1984\).*PLS-tradisjonen/);
assert.match(wernerCard.limit, /PLS-implementering/);
assert.ok(wernerCard.reference_links.some((ref) =>
  ref.url === lohmollerMethod && ref.canonical_claim_ids.length === 0 && ref.canonical_source_ids.length === 0));
assert.ok(wernerMatrix.group_1_source_audit.new_reference_urls.includes(lohmollerMethod));
assert.ok(detailedReview.units.find((u) => u.id === "resiliens__method").evidence_urls.includes(lohmollerMethod));
// Direct author-origin historical source: the 1989 cohort-tracing numbers have bounded meanings.
const wernerGardenIsland = "https://people.uncw.edu/hungerforda/Infancy/PDF/gardenisland.pdf";
assert.match(wernerCard.method, /2 203 registrerte svangerskap.*240 fosterdødsfall.*1 963 levende fødte/);
assert.match(wernerCard.method, /545 medlemmer av fødselskohorten.*62 av de 72/);
assert.match(wernerCard.limit, /545 oppsporede.*505 voksne/);
assert.ok(wernerCard.reference_links.some((ref) =>
  ref.url === wernerGardenIsland && ref.canonical_claim_ids.length === 0 && ref.canonical_source_ids.length === 0));
assert.ok(wernerMatrix.group_1_source_audit.new_reference_urls.includes(wernerGardenIsland));
assert.ok(detailedReview.units.find((unit) => unit.id === "resiliens__method").evidence_urls.includes(wernerGardenIsland));
// Separate 1968 combined 1955/1956 analytic sample must not be conflated with 1955 birth cohort.
const werner1968 = "https://publications.aap.org/pediatrics/article/42/1/112/44332/REPRODUCTIVE-AND-ENVIRONMENTAL-CASUALTIES-A-REPORT";
assert.match(wernerCard.period, /1968.*866 barn.*1956/);
assert.match(wernerCard.method, /866 barn.*1955-fødte.*1956/);
assert.match(wernerCard.limit, /tiårsanalysen fra 1968 hadde 866 barn/);
assert.ok(wernerCard.reference_links.some((x) => x.url === werner1968));
assert.ok(wernerMatrix.group_1_source_audit.new_reference_urls.includes(werner1968));
assert.ok(detailedReview.units.find((x) => x.id === "resiliens__method").evidence_urls.includes(werner1968));
assert.equal(detailedReview.original_publication_audit.entries.find((e) =>
  e.id === "resiliens_werner_bierman_1968").access, "AAP_original_journal_publisher_abstract_only_no_article_fulltext");
assert.match(wernerCard.method, /505 personer/);
// Differing denominators must remain explicitly unresolved until 1992 original pages are checked.
assert.match(wernerCard.limit, /614 som overlevende.*ikke bekreftet i originalbokens metodekapittel/);
assert.match(wernerCard.limit, /samlet retensjonsprosent eller et antall dødsfall kan derfor ikke fastslås/);
assert.match(fieldEvidence.cards.find((row) => row.theory_id === "resiliens").limitation, /Sekundærkilder beskriver 614 som overlevende/);
assert.match(detailedReview.units.find((row) => row.id === "resiliens__method").scope_limit, /ingen dødsfallstall eller komplett retensjonsandel kan verifiseres/i);
assert.match(wernerCard.limit, /505.*614.*698/);
assert.match(detailedReview.original_publication_audit.entries.find((e) =>
  e.id === "resiliens_werner_smith_1992").access, /no_appendix_fulltext/);


// 1981 CBT publications: one-year outcome and four-week cross-lagged mechanism are not interchangeable.
const rush1981 = "https://www.sciencedirect.com/science/article/pii/0165032781900240";
const cbtCard = reviewed.get("kognitiv_terapi");
assert.ok(cbtCard.period.includes("januar 1981") && cbtCard.period.includes("september 1981"));
assert.ok(cbtCard.method.toLowerCase().includes("kryssforskjøvede panelanalyser") && cbtCard.method.includes("behandlingsuke 1–4"));
assert.ok(cbtCard.limit.includes("placebo- eller ventelistekontroller"));
assert.ok(cbtCard.limit.includes("kan det ikke fastslås at analysene bygger på nøyaktig samme delutvalg"));
assert.ok(cbtCard.reference_links.some((r) => r.url === rush1981
  && r.canonical_claim_ids.length === 0 && r.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((r) => r.theory_id === "kognitiv_terapi")
  .group_1_source_audit.new_reference_urls.includes(rush1981));
assert.ok(detailedReview.units.filter((u) => u.theory_id === "kognitiv_terapi"
  && ["period", "method", "limit"].includes(u.field))
  .every((u) => u.evidence_urls.includes(rush1981)
    && u.card_is_source_verified === false && u.full_original_review_complete === false));
assert.equal(detailedReview.original_publication_audit.entries.find((r) =>
  r.id === "kognitiv_terapi_rush_1981").access, "elsevier_original_publisher_abstract_read_fulltext_unavailable");
// Original Rush et al. (1977): sample N=41, differential dropout and methodological limitations.
const rush1977Original = "https://dradamvolungis.com/wp-content/uploads/2012/01/efficacy-of-cognitive-therapy-treatment-for-depression-rush-et-al-1977.pdf";
assert.match(cbtCard.period, /1977: Rush.*N=41.*19.*22/);
assert.match(cbtCard.method, /110 søkere.*41 inkludert.*terapeuttider.*ikke blindet/);
assert.match(cbtCard.limit, /1 av 19 CT.*8 av 22 imipramin/);
assert.match(cbtCard.limit, /N=41.*N=44.*ikke dokumentert/);
assert.ok(cbtCard.reference_links.some((r) =>
  r.url === rush1977Original && r.canonical_claim_ids.length === 0 && r.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((r) => r.theory_id === "kognitiv_terapi")
  .group_1_source_audit.new_reference_urls.includes(rush1977Original));
assert.ok(detailedReview.units.filter((u) => u.theory_id === "kognitiv_terapi"
  && ["period","method","limit"].includes(u.field))
  .every((u) => u.evidence_urls.includes(rush1977Original)
    && u.card_is_source_verified === false && u.full_original_review_complete === false));
assert.equal(detailedReview.original_publication_audit.entries.find((r) =>
  r.id === "kognitiv_terapi_rush_1977").access,
  "1977_21page_original_journal_scan_available_selected_design_results_and_limitations_pp17_22_27_32_35_checked");
// Original July 1982 N=35 is a third publication; matching N does not prove participant identity.
const rush1982SelfConcept = "https://pubmed.ncbi.nlm.nih.gov/7091401/";
assert.ok(cbtCard.period.includes("juli 1982: Rush"));
assert.ok(cbtCard.method.includes("over omtrent 11 uker") && cbtCard.method.includes("håpløshet og selvoppfatning"));
assert.ok(cbtCard.limit.includes("samme oppgitte N=35 som i to artikler fra 1981"));
assert.ok(cbtCard.limit.includes("pasientoverlapp ikke bekreftet"));
assert.ok(cbtCard.reference_links.some((r) =>
  r.url === rush1982SelfConcept
  && r.canonical_claim_ids.length === 0 && r.canonical_source_ids.length === 0));
assert.ok(fieldEvidence.cards.find((r) => r.theory_id === "kognitiv_terapi")
  .group_1_source_audit.new_reference_urls.includes(rush1982SelfConcept));
assert.ok(detailedReview.units.filter((u) => u.theory_id === "kognitiv_terapi"
  && ["period","method","limit"].includes(u.field))
  .every((u) => u.evidence_urls.includes(rush1982SelfConcept)
    && u.card_is_source_verified === false && u.full_original_review_complete === false));
const rush1982Gate = detailedReview.original_publication_audit.entries.find((r) =>
  r.id === "kognitiv_terapi_rush_1982");
assert.equal(rush1982Gate.access, "american_journal_of_psychiatry_original_publisher_abstract_only_fulltext_paywalled");
assert.ok(rush1982Gate.open_requirement.includes("subject provenance"));
// Original 1977 treatment completers cannot be relabeled as the 1981 abstract's 35.
const trialFlow1977 = { ctStart: 19, drugStart: 22, ctDropouts: 1, drugDropouts: 8 };
const completers1977 = trialFlow1977.ctStart + trialFlow1977.drugStart
  - trialFlow1977.ctDropouts - trialFlow1977.drugDropouts;
assert.equal(trialFlow1977.ctStart + trialFlow1977.drugStart, 41);
assert.equal(completers1977, 32);
 // 1977 table-specific denominators and follow-up contacts are not protocol-completer counts.
 assert.ok(cbtCard.limit.includes("siste registrerte depresjonsskår videreført"));
 assert.ok(cbtCard.limit.includes("38 oppfulgte"));
 assert.ok(detailedReview.units.find((u) => u.id === "kognitiv_terapi__method")
   .assertion.includes("38 pasienter ved oppfølging etter 3/6 måneder"));
 assert.ok(detailedReview.units.find((u) => u.id === "kognitiv_terapi__method")
   .scope_limit.includes("Skala-spesifikke nevnergrupper"));

assert.equal(44 - 35, 41 - 32);
assert.notEqual(completers1977, 35);
assert.ok(cbtCard.method.includes("18 av de 19 i CT-gruppen"));
assert.ok(cbtCard.method.includes("14 av de 22 i imipramingruppen"));
assert.ok(cbtCard.method.includes("32"));
assert.ok(cbtCard.method.includes("44 behandlingsstartende og 35 protokollfullførere"));
assert.ok(cbtCard.limit.includes("identisk differanse beviser ikke identisk frafallsårsak"));
assert.ok(cbtCard.limit.includes("gruppespesifikke start- og fullførertall ikke kan verifiseres"));
assert.ok(detailedReview.units.find((u) => u.id === "kognitiv_terapi__method")
  .scope_limit.includes("Tallparene 41/32 (1977) og 44/35 (1981)"));
assert.ok(detailedReview.units.find((u) => u.id === "kognitiv_terapi__limit")
  .scope_limit.includes("frafallstyper, unike personidentiteter"));
assert.ok(detailedReview.original_publication_audit.entries.find((e) =>
  e.id === "kognitiv_terapi_kovacs_1981").open_requirement.includes("N=44 versus 1977 N=41"));
assert.match(reviewed.get("kognitiv_terapi").method, /1963.*50.*31.*håndskrevne/);
assert.match(reviewed.get("kognitiv_terapi").method, /observasjonsstudie, ikke et randomisert behandlingsforsøk/);
assert.match(reviewed.get("kognitiv_terapi").limit, /terapi.*notater|behandlingsnotater|håndskrevne behandlingsnotater/);
for (const [id, urls] of Object.entries(primaryOriginalSources)) {
  const units = detailedReview.units.filter((unit) => unit.theory_id === id);
  assert.ok(units.some((unit) => urls.some((url) => unit.evidence_urls.includes(url))),
    "original primary literature must be referenced by claim units: " + id);
  assert.ok(units.every((unit) => unit.card_is_source_verified === false));
}

// Batch 09: original-publication access and unresolved scientific gates
assert.equal(detailedReview.original_publication_audit.status, "in_progress_not_source_verified");
assert.equal(detailedReview.original_publication_audit.entries.length, 16);
assert.deepEqual(new Set(detailedReview.original_publication_audit.entries.map((item) => item.id)).size, 16);
for (const item of detailedReview.original_publication_audit.entries) {
  assert.ok(group1.includes(item.theory_id));
  assert.ok(item.open_requirement.length > 50);
  assert.ok(item.access.length > 15);
  assert.ok(reviewed.get(item.theory_id).reference_links.some((ref) => ref.url === item.source_url));
}
assert.match(detailedReview.units.find((unit) => unit.id === "resiliens__limit").assertion, /88 %.*90 %.*80 %/);
assert.match(detailedReview.units.find((unit) => unit.id === "resiliens__method").assertion, /698.*201.*72/);
assert.match(wernerCard.method, /Werner \(1993, s\. 505–506\).*voksen tilpasning/);
assert.match(wernerCard.limit, /historiske institusjoner og verdier/);
assert.match(detailedReview.units.find((unit) => unit.id === "resiliens__method").assertion, /offentlige arkiver.*1993, s\. 505–506/);
assert.match(detailedReview.units.find((unit) => unit.id === "resiliens__limit").scope_limit, /Juridiske\/administrative registre/);
assert.equal(detailedReview.units.filter((unit) => unit.full_original_review_complete === true).length, 0);
console.log("civication-psychology-room-coverage.test.js passed");
