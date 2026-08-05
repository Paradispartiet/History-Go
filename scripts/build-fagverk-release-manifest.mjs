#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_REGISTRY = "data/fagverk/fagverk_registry.json";
const DEFAULT_INVENTORY = "data/fagverk/subject_inventory.json";
const DEFAULT_MANIFEST = "data/fag/fag_manifest.json";
const DEFAULT_OUTPUT = "data/fagverk/fagverk_release.json";
const FILE_REFERENCE_PATTERN = /\.(?:json|md|mjs|js|ya?ml|csv|tsv|txt)$/i;

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(stableValue(value));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readJson(root, relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function relativeRepoPath(root, absolutePath) {
  return normalizePath(path.relative(root, absolutePath));
}

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    registry: DEFAULT_REGISTRY,
    inventory: DEFAULT_INVENTORY,
    manifest: DEFAULT_MANIFEST,
    output: DEFAULT_OUTPUT,
    check: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--root") args.root = path.resolve(argv[++index] || args.root);
    else if (token === "--registry") args.registry = normalizePath(argv[++index] || args.registry);
    else if (token === "--inventory") args.inventory = normalizePath(argv[++index] || args.inventory);
    else if (token === "--manifest") args.manifest = normalizePath(argv[++index] || args.manifest);
    else if (token === "--output") args.output = normalizePath(argv[++index] || args.output);
    else if (token === "--check") args.check = true;
    else if (token === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function referencedChapterPaths(chapterRecord, chapterDocument) {
  const paths = new Set();
  const add = (value) => {
    const normalized = normalizePath(value);
    if (normalized.endsWith(".json")) paths.add(normalized);
  };
  add(chapterRecord.file);
  for (const value of chapterDocument.moduleFiles || []) add(value);
  add(chapterDocument.briefFile);
  add(chapterDocument.claimsFile);
  for (const value of chapterDocument.sourceFiles || []) add(value);
  return [...paths].sort();
}

function canonicalFile(root, relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  const raw = fs.readFileSync(absolutePath, "utf8");
  if (relativePath.toLowerCase().endsWith(".json")) {
    return { path: relativePath, kind: "json", content: stableValue(JSON.parse(raw)) };
  }
  return { path: relativePath, kind: "text", content: raw.replaceAll("\r\n", "\n") };
}

function hashFiles(root, relativePaths) {
  const missing = [];
  const canonicalFiles = [];
  for (const relativePath of [...new Set(relativePaths.map(normalizePath).filter(Boolean))].sort()) {
    const absolutePath = path.resolve(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      missing.push(relativePath);
      continue;
    }
    canonicalFiles.push(canonicalFile(root, relativePath));
  }
  return {
    missing,
    digest: sha256(canonicalJson(canonicalFiles)),
    canonicalFiles
  };
}

function looksLikeFileReference(value) {
  return typeof value === "string" && FILE_REFERENCE_PATTERN.test(value.trim());
}

function collectFileReferences(value, { root, manifestPath, field, required }) {
  const manifestDirectory = path.dirname(path.resolve(root, manifestPath));
  const references = [];
  const walk = (nested, keyPath) => {
    if (typeof nested === "string") {
      if (!looksLikeFileReference(nested)) return;
      const absolutePath = path.resolve(manifestDirectory, nested);
      references.push({
        field,
        key_path: keyPath,
        required,
        path: relativeRepoPath(root, absolutePath)
      });
      return;
    }
    if (Array.isArray(nested)) {
      nested.forEach((item, index) => walk(item, `${keyPath}[${index}]`));
      return;
    }
    if (nested && typeof nested === "object") {
      Object.entries(nested).forEach(([key, item]) => walk(item, keyPath ? `${keyPath}.${key}` : key));
    }
  };
  walk(value, field);
  return references;
}

function packageRecords(inventory, manifest) {
  const records = [];
  for (const subject of inventory.subjects || []) {
    const subjectId = subject.id;
    records.push({
      id: subjectId,
      kind: "subject",
      parent_subject_id: null,
      inventory: subject,
      manifest: manifest[subjectId] || null
    });
    for (const specialization of subject.specializations || []) {
      records.push({
        id: specialization.id,
        kind: "specialization",
        parent_subject_id: subjectId,
        inventory: specialization,
        manifest: manifest[subjectId]?.specializations?.[specialization.id] || null
      });
    }
  }
  return records.sort((a, b) => a.id.localeCompare(b.id, "nb"));
}

function packageFileInventory(record, { root, manifestPath }) {
  const requiredFields = [...new Set(record.inventory.requiredManifestFields || [])];
  const optionalFields = [...new Set(record.inventory.optionalManifestFields || [])];
  const missingManifestFields = [];
  const references = [];
  const source = record.manifest || {};

  for (const field of requiredFields) {
    if (!(field in source)) {
      missingManifestFields.push(field);
      continue;
    }
    references.push(...collectFileReferences(source[field], { root, manifestPath, field, required: true }));
  }
  for (const field of optionalFields) {
    if (!(field in source)) continue;
    references.push(...collectFileReferences(source[field], { root, manifestPath, field, required: false }));
  }

  const byPath = new Map();
  for (const reference of references) {
    if (!byPath.has(reference.path)) {
      byPath.set(reference.path, { path: reference.path, required: reference.required, fields: [], key_paths: [] });
    }
    const existing = byPath.get(reference.path);
    existing.required ||= reference.required;
    existing.fields.push(reference.field);
    existing.key_paths.push(reference.key_path);
  }

  const files = [...byPath.values()].map((entry) => ({
    ...entry,
    fields: [...new Set(entry.fields)].sort(),
    key_paths: [...new Set(entry.key_paths)].sort()
  })).sort((a, b) => a.path.localeCompare(b.path, "nb"));
  const fileHash = hashFiles(root, files.map((file) => file.path));
  const missingSet = new Set(fileHash.missing);

  return {
    required_fields: requiredFields,
    optional_fields: optionalFields,
    present_fields: [...new Set([...requiredFields, ...optionalFields].filter((field) => field in source))].sort(),
    missing_manifest_fields: missingManifestFields.sort(),
    files: files.map((file) => ({
      ...file,
      exists: !missingSet.has(file.path),
      content_sha256: missingSet.has(file.path) ? null : sha256(canonicalJson(canonicalFile(root, file.path)))
    })),
    missing_files: fileHash.missing,
    content_sha256: fileHash.digest
  };
}

function chapterInventory(root, subjectId, registrySubject) {
  const chapters = [];
  const subjectPaths = new Set();
  let moduleFileCount = 0;
  let briefFileCount = 0;
  let claimsFileCount = 0;
  const missing = [];

  for (const chapterRecord of registrySubject?.chapters || []) {
    const chapterFile = normalizePath(chapterRecord.file);
    if (!chapterFile || !fs.existsSync(path.resolve(root, chapterFile))) {
      if (chapterFile) missing.push(chapterFile);
      continue;
    }
    const chapterDocument = readJson(root, chapterFile);
    const paths = referencedChapterPaths(chapterRecord, chapterDocument);
    paths.forEach((value) => subjectPaths.add(value));
    const modulePaths = (chapterDocument.moduleFiles || []).map(normalizePath).filter(Boolean);
    moduleFileCount += modulePaths.length;
    if (chapterDocument.briefFile) briefFileCount += 1;
    if (chapterDocument.claimsFile) claimsFileCount += 1;
    const chapterHash = hashFiles(root, paths);
    missing.push(...chapterHash.missing);
    chapters.push({
      chapter_id: chapterRecord.id || chapterDocument.chapter_id || chapterDocument.id,
      title: chapterRecord.title || chapterDocument.title || "",
      file: chapterFile,
      module_file_count: modulePaths.length,
      referenced_file_count: paths.length,
      content_sha256: chapterHash.digest
    });
  }

  const paths = [...subjectPaths].sort();
  const content = hashFiles(root, paths);
  const structure = {
    subject_id: subjectId,
    chapter_ids: chapters.map((chapter) => chapter.chapter_id),
    chapter_files: chapters.map((chapter) => chapter.file),
    module_file_counts: Object.fromEntries(chapters.map((chapter) => [chapter.chapter_id, chapter.module_file_count]))
  };
  return {
    chapter_count: chapters.length,
    module_file_count: moduleFileCount,
    brief_file_count: briefFileCount,
    claims_file_count: claimsFileCount,
    referenced_paths: paths,
    missing_files: [...new Set([...missing, ...content.missing])].sort(),
    structure_sha256: sha256(canonicalJson(structure)),
    content_sha256: content.digest,
    chapters
  };
}

function metadataFor(documentPath, document, contentDigest) {
  return {
    path: documentPath,
    schema: document.schema || null,
    version: document.version || null,
    updated_at: document.updatedAt || document.updated_at || null,
    content_sha256: contentDigest
  };
}

export function buildReleaseManifest({
  root,
  registryPath = DEFAULT_REGISTRY,
  inventoryPath = DEFAULT_INVENTORY,
  manifestPath = DEFAULT_MANIFEST
}) {
  const registry = readJson(root, registryPath);
  const inventory = readJson(root, inventoryPath);
  const manifest = readJson(root, manifestPath);
  const subjects = {};
  const allReferenced = new Set([registryPath, inventoryPath, manifestPath]);
  const allMissing = [];
  let totalChapters = 0;
  let totalModules = 0;
  let totalPackageFiles = 0;
  let totalChapterFiles = 0;
  let chapterSubjectCount = 0;
  let rootSubjectCount = 0;
  let specializationCount = 0;

  for (const record of packageRecords(inventory, manifest)) {
    if (record.kind === "subject") rootSubjectCount += 1;
    else specializationCount += 1;
    const packageData = packageFileInventory(record, { root, manifestPath });
    const chapterData = chapterInventory(root, record.id, registry.subjects?.[record.id]);
    const referencedPaths = [...new Set([
      ...packageData.files.map((file) => file.path),
      ...chapterData.referenced_paths
    ])].sort();
    referencedPaths.forEach((value) => allReferenced.add(value));
    const combinedHash = hashFiles(root, referencedPaths);
    const missingFiles = [...new Set([
      ...packageData.missing_files,
      ...chapterData.missing_files,
      ...combinedHash.missing
    ])].sort();
    const missingRequiredFiles = packageData.files.filter((file) => file.required && !file.exists).map((file) => file.path);
    const packageStatus = !record.manifest
      ? "manifest_missing"
      : packageData.missing_manifest_fields.length || missingRequiredFiles.length
        ? "incomplete"
        : "complete";
    const chapterStatus = chapterData.chapter_count ? "materialized" : "not_materialized";
    const structure = {
      subject_id: record.id,
      kind: record.kind,
      parent_subject_id: record.parent_subject_id,
      schema_family: record.inventory.schemaFamily || null,
      package_status: packageStatus,
      chapter_status: chapterStatus,
      required_fields: packageData.required_fields,
      optional_fields: packageData.optional_fields,
      present_fields: packageData.present_fields,
      package_files: packageData.files.map((file) => ({ path: file.path, required: file.required, fields: file.fields })),
      chapter_ids: chapterData.chapters.map((chapter) => chapter.chapter_id),
      chapter_files: chapterData.chapters.map((chapter) => chapter.file),
      module_file_counts: Object.fromEntries(chapterData.chapters.map((chapter) => [chapter.chapter_id, chapter.module_file_count]))
    };
    const registrySubject = registry.subjects?.[record.id] || {};
    subjects[record.id] = {
      title: registrySubject.title || record.manifest?.label || record.id,
      kind: record.kind,
      parent_subject_id: record.parent_subject_id,
      schema_family: record.inventory.schemaFamily || null,
      pilot: Boolean(record.inventory.pilot),
      package_status: packageStatus,
      chapter_status: chapterStatus,
      required_manifest_fields: packageData.required_fields,
      optional_manifest_fields: packageData.optional_fields,
      present_manifest_fields: packageData.present_fields,
      missing_manifest_fields: packageData.missing_manifest_fields,
      package_file_count: packageData.files.length,
      required_package_file_count: packageData.files.filter((file) => file.required).length,
      optional_package_file_count: packageData.files.filter((file) => !file.required).length,
      package_files: packageData.files,
      package_content_sha256: packageData.content_sha256,
      chapter_count: chapterData.chapter_count,
      module_file_count: chapterData.module_file_count,
      brief_file_count: chapterData.brief_file_count,
      claims_file_count: chapterData.claims_file_count,
      chapter_referenced_file_count: chapterData.referenced_paths.length,
      chapter_content_sha256: chapterData.content_sha256,
      referenced_file_count: referencedPaths.length,
      missing_files: missingFiles,
      structure_sha256: sha256(canonicalJson(structure)),
      content_sha256: combinedHash.digest,
      chapters: chapterData.chapters
    };
    allMissing.push(...missingFiles.map((value) => `${record.id}:${value}`));
    if (packageData.missing_manifest_fields.length) {
      allMissing.push(...packageData.missing_manifest_fields.map((field) => `${record.id}:manifest-field:${field}`));
    }
    totalChapters += chapterData.chapter_count;
    totalModules += chapterData.module_file_count;
    totalPackageFiles += packageData.files.length;
    totalChapterFiles += chapterData.referenced_paths.length;
    if (chapterData.chapter_count) chapterSubjectCount += 1;
  }

  const registryDocument = stableValue(registry);
  const inventoryDocument = stableValue(inventory);
  const manifestDocument = stableValue(manifest);
  const payload = {
    schema: "history_go_fagverk_release_v2",
    version: "2.0.0",
    source: {
      repository: "Paradispartiet/History-Go",
      branch: "main",
      source_ref_mode: "consumer_observed_head"
    },
    registry: metadataFor(registryPath, registry, sha256(canonicalJson(registryDocument))),
    subject_inventory: {
      ...metadataFor(inventoryPath, inventory, sha256(canonicalJson(inventoryDocument))),
      root_subject_count: rootSubjectCount,
      specialization_count: specializationCount
    },
    fag_manifest: metadataFor(manifestPath, manifest, sha256(canonicalJson(manifestDocument))),
    summary: {
      subject_count: Object.keys(subjects).length,
      root_subject_count: rootSubjectCount,
      specialization_count: specializationCount,
      chapter_subject_count: chapterSubjectCount,
      chapter_count: totalChapters,
      module_file_count: totalModules,
      package_file_count: totalPackageFiles,
      chapter_referenced_file_count: totalChapterFiles,
      referenced_file_count: allReferenced.size,
      missing_file_count: allMissing.length
    },
    subjects
  };
  return { ...payload, release_sha256: sha256(canonicalJson(payload)) };
}

export function serializeReleaseManifest(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/build-fagverk-release-manifest.mjs [--root dir] [--registry path] [--inventory path] [--manifest path] [--output path] [--check]");
    return;
  }
  const manifest = buildReleaseManifest({
    root: args.root,
    registryPath: args.registry,
    inventoryPath: args.inventory,
    manifestPath: args.manifest
  });
  if (manifest.summary.missing_file_count) {
    const missing = Object.entries(manifest.subjects).flatMap(([subjectId, subject]) => [
      ...subject.missing_manifest_fields.map((field) => `${subjectId}:manifest-field:${field}`),
      ...subject.missing_files.map((file) => `${subjectId}:${file}`)
    ]);
    throw new Error(`Fagverk release has missing references: ${missing.join(", ")}`);
  }
  const serialized = serializeReleaseManifest(manifest);
  const outputPath = path.resolve(args.root, args.output);
  if (args.check) {
    if (!fs.existsSync(outputPath)) throw new Error(`Missing Fagverk release manifest: ${args.output}`);
    if (fs.readFileSync(outputPath, "utf8") !== serialized) throw new Error(`Stale Fagverk release manifest: ${args.output}`);
    console.log(`Verified Fagverk release ${manifest.release_sha256}: ${manifest.summary.subject_count} packages, ${manifest.summary.chapter_count} chapters.`);
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(`Wrote Fagverk release ${manifest.release_sha256}: ${manifest.summary.subject_count} packages, ${manifest.summary.chapter_count} chapters.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) main();
