#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHAPTER_ID = "makt-regulering-baerekraft";
const DOMAIN_ID = "makt_regulering_baerekraft";
const CHAPTER_PATH = `data/fagverk/naeringsliv/${CHAPTER_ID}.json`;
const BASE = `data/fagverk/naeringsliv/${CHAPTER_ID}`;
const BRIEF_PATH = `${BASE}/brief.json`;
const CLAIMS_PATH = `${BASE}/claims.json`;
const MODULE_PATHS = [`${BASE}/01-grunnlag.json`, `${BASE}/02-fordypning.json`, `${BASE}/03-anvendelse.json`];
const PENSUM_PATH = "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json";
const RUNTIME_PATH = "data/fag/naeringsliv/naeringsliv_runtime_manifest.json";
const REGISTRY_PATH = "data/fagverk/fagverk_registry.json";
const STATUS_PATH = "data/fagverk/subject_status.json";
const REPORT_PATH = "reports/fagverk/naeringsliv-makt-regulering-baerekraft-audit.json";
const REQUIRED_PLACE_IDS = [
  "youngstorget",
  "christiania_seildugsfabrik",
  "vulkan_industriomrade",
  "alnabru_jernbane_og_logistikk",
  "havnelageret",
  "barcode",
];

const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const equalSet = (actual, expected, label) => {
  const a = sorted(actual || []);
  const e = sorted(expected || []);
  assert(JSON.stringify(a) === JSON.stringify(e), `${label} mismatch\nactual=${JSON.stringify(a)}\nexpected=${JSON.stringify(e)}`);
};
function collectClaimIds(value, target = new Set(), insideClaimField = false) {
  if (Array.isArray(value)) {
    for (const item of value) collectClaimIds(item, target, insideClaimField);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const isClaimField = key === "claimIds" || key === "paragraphClaimIds" || key === "keyPointClaimIds";
      collectClaimIds(item, target, insideClaimField || isClaimField);
    }
  } else if (insideClaimField && typeof value === "string") {
    target.add(value);
  }
  return target;
}
function findCanonicalPlaceFiles() {
  const root = abs("data/places");
  const found = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".json")) {
        // places_index.json is a generated lookup projection, not a canonical source record.
        if (entry.name === "places_index.json") continue;
        try {
          const value = JSON.parse(fs.readFileSync(full, "utf8"));
          const rows = Array.isArray(value) ? value : [value];
          for (const row of rows) {
            if (!row || typeof row !== "object" || typeof row.id !== "string") continue;
            if (!found.has(row.id)) found.set(row.id, []);
            found.get(row.id).push(path.relative(ROOT, full));
          }
        } catch {
          // Place audit ignores non-JSON-compatible support files.
        }
      }
    }
  };
  walk(root);
  return found;
}

export function auditMaktReguleringBaerekraft({ writeReport = false, checkReport = true } = {}) {
  const chapter = readJson(CHAPTER_PATH);
  const brief = readJson(BRIEF_PATH);
  const claimsDoc = readJson(CLAIMS_PATH);
  const modules = MODULE_PATHS.map(readJson);
  const pensum = readJson(PENSUM_PATH);
  const runtime = readJson(RUNTIME_PATH);
  const registry = readJson(REGISTRY_PATH);
  const status = readJson(STATUS_PATH);
  const domain = pensum.domains.find((item) => item.domain_id === DOMAIN_ID);
  assert(domain, `Missing canonical domain ${DOMAIN_ID}`);

  assert(chapter.schema === "history_go_fagverk_chapter_v1", "Wrong chapter schema");
  assert(chapter.subject_id === "naeringsliv" && chapter.subject === "naeringsliv", "Wrong chapter subject");
  assert(chapter.id === CHAPTER_ID && chapter.chapter_id === CHAPTER_ID, "Wrong chapter id");
  assert(chapter.primary_domain_id === DOMAIN_ID, "Wrong primary domain");
  equalSet(chapter.emne_ids, domain.emne_ids, "chapter emne_ids");
  equalSet(chapter.method_ids, domain.method_ids, "chapter method_ids");
  equalSet(brief.requiredEmneIds, domain.emne_ids, "brief emne_ids");
  equalSet(brief.requiredMethodIds, domain.method_ids, "brief method_ids");
  assert(chapter.moduleFiles.length === 3 && JSON.stringify(chapter.moduleFiles) === JSON.stringify(MODULE_PATHS), "Module file order mismatch");
  assert(chapter.briefFile === BRIEF_PATH && chapter.claimsFile === CLAIMS_PATH, "Support paths mismatch");
  assert(chapter.editorialStatus === "chapter_ready" && chapter.claimTraceRequired === true, "Readiness contract missing");

  const sectionIds = new Set();
  let sectionCount = 0;
  let paragraphCount = 0;
  let workedExamples = 0;
  let misconceptions = 0;
  let applicationTasks = 0;
  let selfCheck = 0;
  let relatedPlaces = 0;
  for (const [index, module] of modules.entries()) {
    assert(Array.isArray(module.sections) && module.sections.length === 3, `Module ${index + 1} must have three sections`);
    for (const section of module.sections) {
      assert(!sectionIds.has(section.id), `Duplicate section id ${section.id}`);
      sectionIds.add(section.id);
      sectionCount += 1;
      assert(section.paragraphs.length === 3, `${section.id} must have three paragraphs`);
      assert(section.paragraphClaimIds.length === 3, `${section.id} paragraph trace mismatch`);
      assert(section.keyPoints.length >= 2 && section.keyPointClaimIds.length === section.keyPoints.length, `${section.id} key point trace mismatch`);
      for (let i = 0; i < 3; i += 1) {
        assert(typeof section.paragraphs[i] === "string" && section.paragraphs[i].length >= 160, `${section.id} paragraph ${i + 1} is too short`);
        assert(Array.isArray(section.paragraphClaimIds[i]) && section.paragraphClaimIds[i].length >= 1, `${section.id} paragraph ${i + 1} lacks claims`);
        paragraphCount += 1;
      }
    }
    workedExamples += (module.workedExamples || []).length;
    misconceptions += (module.misconceptions || []).length;
    applicationTasks += (module.applicationTasks || []).length;
    selfCheck += (module.selfCheck || []).length;
    relatedPlaces += (module.relatedPlaces || []).length;
  }
  assert(sectionCount === 9 && paragraphCount === 27, "Expected 9 sections and 27 paragraphs");
  assert(workedExamples === 2, "Expected two worked examples");
  assert(misconceptions === 5, "Expected five misconceptions");
  assert(applicationTasks === 3, "Expected three application tasks");
  assert(selfCheck === 8, "Expected eight self checks");
  assert(relatedPlaces === 6, "Expected six related places");

  assert(claimsDoc.schema === "history_go_fagverk_claims_v1" && claimsDoc.verification_status === "verified", "Claims document is not verified");
  assert(claimsDoc.claims.length === 42, "Expected 42 claims");
  assert(claimsDoc.sources.length === 22, "Expected 22 sources");
  const claimIds = new Set(claimsDoc.claims.map((c) => c.id));
  const sourceIds = new Set(claimsDoc.sources.map((s) => s.id));
  assert(claimIds.size === 42 && sourceIds.size === 22, "Claim or source IDs are not unique");
  for (const source of claimsDoc.sources) {
    assert(/^https:\/\//.test(source.url), `${source.id} lacks inspectable URL`);
    assert(String(source.source_location || "").trim(), `${source.id} lacks source location`);
  }
  const usedSourceIds = new Set();
  for (const claim of claimsDoc.claims) {
    assert(claim.status === "verified" && claim.source_ids.length >= 1, `${claim.id} is not verified`);
    assert(Array.isArray(claim.used_in) && claim.used_in.length >= 1, `${claim.id} lacks used_in`);
    for (const sid of claim.source_ids) {
      assert(sourceIds.has(sid), `${claim.id} references unknown source ${sid}`);
      usedSourceIds.add(sid);
    }
  }
  equalSet(usedSourceIds, sourceIds, "source usage");
  const traced = collectClaimIds(modules);
  equalSet(traced, claimIds, "claim trace");
  for (const claim of claimsDoc.claims) {
    for (const sectionId of claim.used_in) assert(sectionIds.has(sectionId), `${claim.id} uses unknown section ${sectionId}`);
  }

  const places = modules.flatMap((m) => m.relatedPlaces || []);
  equalSet(places.map((p) => p.id), REQUIRED_PLACE_IDS, "related places");
  const placeFiles = findCanonicalPlaceFiles();
  for (const placeId of REQUIRED_PLACE_IDS) {
    const matches = placeFiles.get(placeId) || [];
    assert(matches.length === 1, `${placeId}: expected exactly one canonical place file, found ${matches.length}`);
  }

  const chapters = registry.subjects?.naeringsliv?.chapters || [];
  const entry = chapters.find((row) => row.id === CHAPTER_ID);
  assert(entry, "Registry entry is missing");
  equalSet(entry.emne_ids, chapter.emne_ids, "registry emnes");
  equalSet(entry.method_ids, chapter.method_ids, "registry methods");
  assert(runtime.chapterByDomain?.[DOMAIN_ID] === CHAPTER_ID, "Runtime domain mapping is missing");
  for (const emneId of chapter.emne_ids) assert(runtime.chapterByEmne?.[emneId] === CHAPTER_ID, `Runtime emne mapping missing for ${emneId}`);
  const statusEntry = status.subjects.find((row) => row.id === "naeringsliv");
  assert(chapters.length === pensum.domains.length, "Næringsliv must register all six canonical chapters");
  assert(statusEntry?.editorialStatus === "complete", "Næringsliv must be complete at 6/6");
  assert(String(statusEntry.note || "").includes("6 av 6"), "Status note does not report 6/6");

  const report = {
    schema: "history_go_naeringsliv_chapter_audit_v1",
    version: "1.0.0",
    status: "PASSED",
    subjectId: "naeringsliv",
    chapterId: CHAPTER_ID,
    generatedAt: "2026-07-31",
    counts: {
      emner: chapter.emne_ids.length,
      methods: chapter.method_ids.length,
      modules: modules.length,
      sections: sectionCount,
      paragraphs: paragraphCount,
      claims: claimsDoc.claims.length,
      sources: claimsDoc.sources.length,
      workedExamples,
      misconceptions,
      applicationTasks,
      selfCheck,
      relatedPlaces,
    },
    gates: {
      canonicalCoverage: true,
      paragraphClaimTrace: true,
      allClaimsVerified: true,
      allSourcesInspectableAndUsed: true,
      pedagogicalComponents: true,
      canonicalPlaces: true,
      runtimeRegistryStatusSynchronized: true,
      subjectCompleteSixOfSix: true,
    },
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT_PATH)), { recursive: true });
    fs.writeFileSync(abs(REPORT_PATH), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(readJson(REPORT_PATH), report), `${REPORT_PATH} is stale`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditMaktReguleringBaerekraft({ writeReport: args.has("--write-report"), checkReport: !args.has("--no-check-report") });
    console.log(`PASS ${report.chapterId}: ${report.counts.claims} claims, ${report.counts.sources} sources`);
  } catch (error) {
    console.error(`FAIL ${CHAPTER_ID}: ${error.message}`);
    process.exitCode = 1;
  }
}
