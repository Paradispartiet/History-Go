import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(ROOT, file));
const sameSet = (a, b) => a.length === b.length && [...new Set(a)].sort().join('\n') === [...new Set(b)].sort().join('\n');
const unique = (items) => new Set(items).size === items.length;

const PATHS = Object.freeze({
  canonical: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-full-subject-completion-v1.json'
});

const canonical = readJson(PATHS.canonical);
const registry = readJson(PATHS.registry);
const status = readJson(PATHS.status);
const report = readJson(PATHS.report);
const filmRegistry = registry.subjects?.film_tv;
const filmStatus = status.subjects?.find((row) => row.id === 'film_tv');

assert.ok(Array.isArray(canonical), 'Film & TV canonical inventory must be an array');
assert.equal(canonical.length, 192, 'Film & TV must retain exactly 192 canonical topics');
const canonicalIds = canonical.map((row) => row.emne_id);
assert.ok(unique(canonicalIds), 'Canonical Film & TV topic ids must be unique');
assert.ok(canonical.every((row) => row.subject_id === 'film_tv'), 'Every canonical topic must belong to film_tv');
assert.ok(canonical.every((row) => row.canonical_status === 'canonical'), 'Every active Film & TV topic must remain canonical');
const canonicalDomains = [...new Set(canonical.map((row) => row.domain))].sort();
assert.equal(canonicalDomains.length, 10, 'Film & TV must retain ten canonical domains');

assert.ok(filmRegistry, 'Film & TV must be registered in fagverk_registry');
assert.ok(Array.isArray(filmRegistry.chapters), 'Film & TV registry must expose chapters');
assert.equal(filmRegistry.chapters.length, 17, 'Film & TV completion contract requires 17 registered chapters');
assert.ok(unique(filmRegistry.chapters.map((row) => row.id)), 'Film & TV chapter ids must be unique');
assert.ok(unique(filmRegistry.chapters.map((row) => row.file)), 'Film & TV chapter files must be unique');

const ownership = new Map();
const chapterDomains = new Set();
let verifiedClaimCount = 0;
let sourceRegistrationCount = 0;
let moduleCount = 0;
let sectionCount = 0;

for (const registered of filmRegistry.chapters) {
  assert.ok(registered.id && registered.file, 'Every registered Film & TV chapter needs id and file');
  assert.ok(exists(registered.file), `Missing chapter file: ${registered.file}`);
  const chapter = readJson(registered.file);
  assert.equal(chapter.id, registered.id, `Chapter id mismatch for ${registered.id}`);
  assert.equal(chapter.subject_id, 'film_tv', `Chapter ${registered.id} must belong to film_tv`);
  assert.ok(Array.isArray(chapter.emne_ids) && chapter.emne_ids.length > 0, `Chapter ${registered.id} needs topic ownership`);
  assert.ok(unique(chapter.emne_ids), `Chapter ${registered.id} repeats a topic internally`);
  if (Array.isArray(registered.emne_ids)) {
    assert.ok(sameSet(registered.emne_ids, chapter.emne_ids), `Registry/chapter topic mismatch for ${registered.id}`);
  }

  const primaryDomain = registered.primary_domain_id ?? registered.primaryDomainId ?? chapter.primary_domain_id ?? chapter.primaryDomainId;
  assert.ok(primaryDomain, `Chapter ${registered.id} needs a primary domain`);
  chapterDomains.add(primaryDomain);

  for (const emneId of chapter.emne_ids) {
    const owners = ownership.get(emneId) ?? [];
    owners.push(registered.id);
    ownership.set(emneId, owners);
  }

  const briefFile = registered.briefFile ?? chapter.briefFile;
  const claimsFile = registered.claimsFile ?? chapter.claimsFile;
  assert.ok(briefFile && exists(briefFile), `Missing brief for ${registered.id}`);
  assert.ok(claimsFile && exists(claimsFile), `Missing claims file for ${registered.id}`);
  if (registered.briefFile && chapter.briefFile) assert.equal(registered.briefFile, chapter.briefFile, `Brief path mismatch for ${registered.id}`);
  if (registered.claimsFile && chapter.claimsFile) assert.equal(registered.claimsFile, chapter.claimsFile, `Claims path mismatch for ${registered.id}`);

  const brief = readJson(briefFile);
  assert.equal(brief.chapter_id, registered.id, `Brief chapter id mismatch for ${registered.id}`);
  assert.ok(Array.isArray(brief.requiredEmneIds), `Brief ${registered.id} needs requiredEmneIds`);
  assert.ok(sameSet(brief.requiredEmneIds, chapter.emne_ids), `Brief/chapter topic mismatch for ${registered.id}`);

  const moduleFiles = chapter.moduleFiles ?? registered.moduleFiles;
  assert.ok(Array.isArray(moduleFiles) && moduleFiles.length > 0, `Chapter ${registered.id} needs module files`);
  assert.ok(unique(moduleFiles), `Chapter ${registered.id} repeats a module file`);
  const moduleTopicIds = [];
  for (const moduleFile of moduleFiles) {
    assert.ok(exists(moduleFile), `Missing module file: ${moduleFile}`);
    const module = readJson(moduleFile);
    assert.equal(module.chapter_id, registered.id, `Module chapter id mismatch: ${moduleFile}`);
    assert.equal(module.subject_id, 'film_tv', `Module subject mismatch: ${moduleFile}`);
    assert.ok(Array.isArray(module.emne_ids) && module.emne_ids.length > 0, `Module needs topic ownership: ${moduleFile}`);
    moduleTopicIds.push(...module.emne_ids);
    moduleCount += 1;
    if (Array.isArray(module.sections)) sectionCount += module.sections.length;
  }
  assert.ok(unique(moduleTopicIds), `Modules overlap topic ownership inside ${registered.id}`);
  assert.ok(sameSet(moduleTopicIds, chapter.emne_ids), `Module/chapter topic mismatch for ${registered.id}`);

  const claimsDoc = readJson(claimsFile);
  assert.equal(claimsDoc.chapter_id, registered.id, `Claims chapter id mismatch for ${registered.id}`);
  if (claimsDoc.subject_id) assert.equal(claimsDoc.subject_id, 'film_tv', `Claims subject mismatch for ${registered.id}`);
  assert.ok(Array.isArray(claimsDoc.sources) && claimsDoc.sources.length > 0, `Chapter ${registered.id} needs sources`);
  assert.ok(Array.isArray(claimsDoc.claims) && claimsDoc.claims.length > 0, `Chapter ${registered.id} needs claims`);
  const sourceIds = claimsDoc.sources.map((row) => row.id);
  assert.ok(unique(sourceIds), `Source ids must be unique inside ${registered.id}`);
  assert.ok(claimsDoc.sources.every((row) => row.id && typeof row.url === 'string' && /^https?:\/\//.test(row.url)), `Every source in ${registered.id} must be inspectable by URL`);
  const sourceSet = new Set(sourceIds);
  const claimIds = claimsDoc.claims.map((row) => row.id);
  assert.ok(unique(claimIds), `Claim ids must be unique inside ${registered.id}`);
  for (const claim of claimsDoc.claims) {
    assert.equal(claim.status, 'verified', `Claim ${claim.id} in ${registered.id} must be verified`);
    assert.ok(Array.isArray(claim.source_ids) && claim.source_ids.length > 0, `Claim ${claim.id} in ${registered.id} needs sources`);
    assert.ok(claim.source_ids.every((sourceId) => sourceSet.has(sourceId)), `Claim ${claim.id} in ${registered.id} references an unknown source`);
    assert.ok(Array.isArray(claim.used_in) && claim.used_in.length > 0, `Claim ${claim.id} in ${registered.id} needs a trace target`);
  }
  verifiedClaimCount += claimsDoc.claims.length;
  sourceRegistrationCount += claimsDoc.sources.length;
}

const missingTopics = canonicalIds.filter((id) => !ownership.has(id));
const unknownTopics = [...ownership.keys()].filter((id) => !canonicalIds.includes(id));
const duplicateTopics = [...ownership.entries()].filter(([, owners]) => owners.length !== 1).map(([id, owners]) => ({ id, owners }));
assert.deepEqual(missingTopics, [], 'Every canonical Film & TV topic must be chapter-owned');
assert.deepEqual(unknownTopics, [], 'No non-canonical topic may enter the completion chapter set');
assert.deepEqual(duplicateTopics, [], 'Every canonical Film & TV topic must be owned exactly once');
assert.equal(ownership.size, 192, 'Chapter ownership must resolve exactly 192 canonical topics');
assert.deepEqual([...chapterDomains].sort(), canonicalDomains, 'Registered chapters must cover all ten canonical domains');

assert.equal(report.schema, 'history_go_film_tv_full_subject_completion_audit_v1');
assert.equal(report.status, 'film_tv_full_subject_completion_verified');
assert.equal(report.canonicalInventory.topicCount, 192);
assert.equal(report.canonicalInventory.domainCount, 10);
assert.equal(report.chapterSet.registeredChapterCount, 17);
assert.equal(report.coverage.assignmentRule, 'each_canonical_topic_exactly_once');
assert.deepEqual(report.coverage.missingTopics, []);
assert.deepEqual(report.coverage.unknownTopics, []);
assert.deepEqual(report.coverage.duplicateTopics, []);
assert.ok(Object.values(report.gates).every(Boolean), 'Every committed Film & TV completion gate must be true');

assert.ok(filmStatus, 'Film & TV subject status must exist');
assert.equal(filmStatus.navigationStatus, 'materialized');
assert.equal(filmStatus.assessmentStatus, 'audited');
assert.equal(filmStatus.editorialStatus, 'complete', 'Film & TV can only pass this audit after status is set to complete');
assert.equal(filmStatus.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

console.log(JSON.stringify({
  status: report.status,
  canonicalTopics: canonicalIds.length,
  canonicalDomains: canonicalDomains.length,
  registeredChapters: filmRegistry.chapters.length,
  modules: moduleCount,
  sections: sectionCount,
  verifiedClaims: verifiedClaimCount,
  sourceRegistrations: sourceRegistrationCount,
  missingTopics: missingTopics.length,
  duplicateTopics: duplicateTopics.length,
  unknownTopics: unknownTopics.length
}, null, 2));
