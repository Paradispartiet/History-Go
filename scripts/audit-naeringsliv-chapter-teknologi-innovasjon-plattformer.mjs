#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CHAPTER_ID = "teknologi-innovasjon-plattformer";
const DOMAIN_ID = "teknologi_innovasjon_plattform";
const CHAPTER_PATH = `data/fagverk/naeringsliv/${CHAPTER_ID}.json`;
const BRIEF_PATH = `data/fagverk/naeringsliv/${CHAPTER_ID}/brief.json`;
const CLAIMS_PATH = `data/fagverk/naeringsliv/${CHAPTER_ID}/claims.json`;
const MODULE_PATHS = [
  `data/fagverk/naeringsliv/${CHAPTER_ID}/01-grunnlag.json`,
  `data/fagverk/naeringsliv/${CHAPTER_ID}/02-fordypning.json`,
  `data/fagverk/naeringsliv/${CHAPTER_ID}/03-anvendelse.json`,
];
const PENSUM_PATH = "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json";
const RUNTIME_PATH = "data/fag/naeringsliv/naeringsliv_runtime_manifest.json";
const REGISTRY_PATH = "data/fagverk/fagverk_registry.json";
const STATUS_PATH = "data/fagverk/subject_status.json";
const REPORT_PATH = `reports/fagverk/naeringsliv-${CHAPTER_ID}-audit.json`;

const writeReport = process.argv.includes("--write-report");
const skipIntegration = process.argv.includes("--skip-integration");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function sorted(values) {
  return [...values].sort();
}
function equalSet(actual, expected, label) {
  const a = sorted(actual);
  const e = sorted(expected);
  assert(JSON.stringify(a) === JSON.stringify(e),
    `${label} mismatch\nactual=${JSON.stringify(a)}\nexpected=${JSON.stringify(e)}`);
}
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
const PLACE_FILES = {
  forskningsparken: "data/places/vitenskap/oslo/places_vitenskap/forskningsparken.json",
  fornebu_teknologipark: "data/places/naeringsliv/akershus/telenor_fornebu.json",
  barcode: "data/places/by/oslo/places/barcode.json",
  bjorvika: "data/places/by/oslo/places/bjorvika.json",
  alnabru_jernbane_og_logistikk: "data/places/natur/oslo/places_oslo_alna/alnabru_jernbane_og_logistikk.json",
  havnelageret: "data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json",
};

const chapter = readJson(CHAPTER_PATH);
const brief = readJson(BRIEF_PATH);
const claimsDoc = readJson(CLAIMS_PATH);
const modules = MODULE_PATHS.map(readJson);
const pensum = readJson(PENSUM_PATH);
const domain = pensum.domains.find((item) => item.domain_id === DOMAIN_ID);
assert(domain, `Missing canonical domain ${DOMAIN_ID}`);

assert(chapter.schema === "history_go_fagverk_chapter_v1", "Wrong chapter schema");
assert(chapter.subject_id === "naeringsliv", "Wrong chapter subject");
assert(chapter.chapter_id === CHAPTER_ID && chapter.id === CHAPTER_ID, "Wrong chapter id");
assert(chapter.primary_domain_id === DOMAIN_ID, "Wrong primary domain");
equalSet(chapter.emne_ids, domain.emne_ids, "chapter emne_ids");
equalSet(chapter.method_ids, domain.method_ids, "chapter method_ids");
equalSet(brief.requiredEmneIds, domain.emne_ids, "brief emne_ids");
equalSet(brief.requiredMethodIds, domain.method_ids, "brief method_ids");
assert(chapter.moduleFiles.length === 3, "Chapter must declare three module files");
assert(JSON.stringify(chapter.moduleFiles) === JSON.stringify(MODULE_PATHS), "Module file order mismatch");
assert(chapter.briefFile === BRIEF_PATH && chapter.claimsFile === CLAIMS_PATH, "Chapter support paths mismatch");
assert(chapter.editorialStatus === "chapter_ready" && chapter.claimTraceRequired === true, "Chapter readiness contract missing");

const sectionIds = new Set();
let sectionCount = 0;
let paragraphCount = 0;
for (const [index, module] of modules.entries()) {
  assert(Array.isArray(module.sections) && module.sections.length === 3, `Module ${index + 1} must have three sections`);
  for (const section of module.sections) {
    assert(!sectionIds.has(section.id), `Duplicate section id ${section.id}`);
    sectionIds.add(section.id);
    sectionCount += 1;
    assert(Array.isArray(section.paragraphs) && section.paragraphs.length === 3, `${section.id} must have three paragraphs`);
    assert(Array.isArray(section.paragraphClaimIds) && section.paragraphClaimIds.length === 3, `${section.id} paragraph trace mismatch`);
    assert(Array.isArray(section.keyPoints) && section.keyPoints.length >= 2, `${section.id} must have key points`);
    assert(Array.isArray(section.keyPointClaimIds) && section.keyPointClaimIds.length === section.keyPoints.length, `${section.id} key point trace mismatch`);
    for (let i = 0; i < 3; i += 1) {
      assert(typeof section.paragraphs[i] === "string" && section.paragraphs[i].length >= 160, `${section.id} paragraph ${i + 1} is too short`);
      assert(Array.isArray(section.paragraphClaimIds[i]) && section.paragraphClaimIds[i].length >= 1, `${section.id} paragraph ${i + 1} lacks claims`);
      paragraphCount += 1;
    }
  }
}
assert(sectionCount === 9 && paragraphCount === 27, "Chapter must contain 9 sections and 27 paragraphs");

assert(claimsDoc.schema === "history_go_fagverk_claims_v1", "Wrong claims schema");
assert(claimsDoc.verification_status === "verified", "Claims must be verified");
assert(Array.isArray(claimsDoc.sources) && claimsDoc.sources.length >= 20, "At least 20 inspectable sources required");
assert(Array.isArray(claimsDoc.claims) && claimsDoc.claims.length >= 40, "At least 40 verified claims required");

const sourceIds = new Set();
for (const source of claimsDoc.sources) {
  assert(!sourceIds.has(source.id), `Duplicate source ${source.id}`);
  sourceIds.add(source.id);
  assert(typeof source.url === "string" && source.url.startsWith("https://"), `Source ${source.id} must have https URL`);
  assert(typeof source.publisher === "string" && source.publisher.length > 2, `Source ${source.id} lacks publisher`);
  assert(typeof source.source_location === "string" && source.source_location.length >= 20, `Source ${source.id} lacks source location`);
}
const claimIds = new Set();
for (const claim of claimsDoc.claims) {
  assert(!claimIds.has(claim.id), `Duplicate claim ${claim.id}`);
  claimIds.add(claim.id);
  assert(claim.status === "verified", `${claim.id} is not verified`);
  assert(typeof claim.claim === "string" && claim.claim.length >= 70, `${claim.id} is too weakly specified`);
  assert(Array.isArray(claim.source_ids) && claim.source_ids.length >= 1, `${claim.id} lacks source`);
  for (const sourceId of claim.source_ids) assert(sourceIds.has(sourceId), `${claim.id} references unknown source ${sourceId}`);
  assert(Array.isArray(claim.used_in) && claim.used_in.length >= 1, `${claim.id} lacks used_in`);
  for (const sectionId of claim.used_in) assert(sectionIds.has(sectionId), `${claim.id} references unknown section ${sectionId}`);
}
const usedClaimIds = new Set();
for (const module of modules) collectClaimIds(module, usedClaimIds);
for (const claimId of usedClaimIds) assert(claimIds.has(claimId), `Module references unknown claim ${claimId}`);
for (const claimId of claimIds) assert(usedClaimIds.has(claimId), `Claim ${claimId} is not used in chapter content`);

const workedExamples = modules.flatMap((m) => m.workedExamples ?? []);
const misconceptions = modules.flatMap((m) => m.misconceptions ?? []);
const tasks = modules.flatMap((m) => m.applicationTasks ?? []);
const selfCheck = modules.flatMap((m) => m.selfCheck ?? []);
const places = modules.flatMap((m) => m.relatedPlaces ?? []);
assert(workedExamples.length >= 2, "At least two worked examples required");
assert(misconceptions.length >= 5, "At least five misconceptions required");
assert(tasks.length >= 3, "At least three application tasks required");
assert(selfCheck.length >= 8, "At least eight self-check items required");
assert(places.length >= 6, "At least six canonical places required");
for (const place of places) {
  const rel = PLACE_FILES[place.id];
  assert(rel, `No canonical place contract for ${place.id}`);
  const canonical = readJson(rel);
  assert(canonical.id === place.id, `Canonical place mismatch for ${place.id}`);
}

if (!skipIntegration) {
  const runtime = readJson(RUNTIME_PATH);
  assert(runtime.chapterByDomain?.[DOMAIN_ID] === CHAPTER_ID, "Runtime domain mapping missing");
  for (const emneId of domain.emne_ids) {
    assert(runtime.chapterByEmne?.[emneId] === CHAPTER_ID, `Runtime emne mapping missing for ${emneId}`);
  }

  const registry = readJson(REGISTRY_PATH);
  const subject = registry.subjects?.naeringsliv;
  assert(subject, "Næringsliv missing from Fagverk registry");
  const registered = subject.chapters.find((item) => item.id === CHAPTER_ID);
  assert(registered, "Chapter missing from Fagverk registry");
  equalSet(registered.emne_ids, domain.emne_ids, "registry emne_ids");
  equalSet(registered.method_ids, domain.method_ids, "registry method_ids");

  const status = readJson(STATUS_PATH);
  const subjectStatus = status.subjects.find((item) => item.id === "naeringsliv");
  const registeredChapterCount = subject.chapters.length;
  const canonicalDomainCount = pensum.domains.length;
  const expectedEditorialStatus = registeredChapterCount === canonicalDomainCount ? "complete" : "chapters_in_progress";
  assert(subjectStatus?.editorialStatus === expectedEditorialStatus, `Næringsliv editorial status must be ${expectedEditorialStatus}`);
  assert(String(subjectStatus?.note || "").includes(`${registeredChapterCount} av ${canonicalDomainCount}`), "Næringsliv status chapter count mismatch");
}

const report = {
  schema: "history_go_naeringsliv_chapter_audit_v1",
  version: "1.0.0",
  status: "PASSED",
  subject_id: "naeringsliv",
  chapter_id: CHAPTER_ID,
  primary_domain_id: DOMAIN_ID,
  counts: {
    emner: chapter.emne_ids.length,
    methods: chapter.method_ids.length,
    modules: modules.length,
    sections: sectionCount,
    paragraphs: paragraphCount,
    claims: claimsDoc.claims.length,
    sources: claimsDoc.sources.length,
    workedExamples: workedExamples.length,
    misconceptions: misconceptions.length,
    applicationTasks: tasks.length,
    selfCheck: selfCheck.length,
    relatedPlaces: places.length,
  },
  gates: {
    exactCanonicalEmneCoverage: true,
    exactCanonicalMethodCoverage: true,
    paragraphLevelClaimTrace: true,
    allClaimsVerifiedAndUsed: true,
    allSourcesInspectable: true,
    pedagogicalComponentsPresent: true,
    canonicalPlacesResolved: true,
    runtimeAndRegistryIntegrated: !skipIntegration,
    honestSubjectStatus: !skipIntegration,
  },
  files: {
    chapter: CHAPTER_PATH,
    brief: BRIEF_PATH,
    claims: CLAIMS_PATH,
    modules: MODULE_PATHS,
  },
};

if (writeReport) {
  const abs = path.join(ROOT, REPORT_PATH);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(report, null, 2)}\n`);
} else if (!skipIntegration) {
  assert(fs.existsSync(path.join(ROOT, REPORT_PATH)), `Missing committed report ${REPORT_PATH}`);
  const committed = readJson(REPORT_PATH);
  assert(JSON.stringify(committed) === JSON.stringify(report), `Committed report ${REPORT_PATH} is stale`);
}

console.log(`PASS ${CHAPTER_ID}: ${sectionCount} sections, ${paragraphCount} paragraphs, ${claimsDoc.claims.length} claims, ${claimsDoc.sources.length} sources`);
