#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULTS = {
  registry: "data/fagverk/fagverk_registry.json",
  inventory: "data/fagverk/subject_inventory.json",
  manifest: "data/fag/fag_manifest.json",
  output: "data/fagverk/fagverk_release.json"
};
const FILE_REFERENCE_PATTERN = /\.(?:json|md|mjs|js|ya?ml|csv|tsv|txt)$/i;

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(stable(value));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function repoPath(root, absolutePath) {
  return normalizePath(path.relative(root, absolutePath));
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), "utf8"));
}

function parseArgs(argv) {
  const args = { root: process.cwd(), ...DEFAULTS, check: false };
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

function canonicalFile(root, relativePath) {
  const raw = fs.readFileSync(path.resolve(root, relativePath), "utf8");
  return relativePath.toLowerCase().endsWith(".json")
    ? { path: relativePath, kind: "json", content: stable(JSON.parse(raw)) }
    : { path: relativePath, kind: "text", content: raw.replaceAll("\r\n", "\n") };
}

function hashFiles(root, relativePaths) {
  const missing = [];
  const files = [];
  for (const relativePath of [...new Set(relativePaths.map(normalizePath).filter(Boolean))].sort()) {
    if (!fs.existsSync(path.resolve(root, relativePath))) missing.push(relativePath);
    else files.push(canonicalFile(root, relativePath));
  }
  return { missing, digest: sha256(canonicalJson(files)) };
}

function resolveManifestReference(root, manifestPath, rawValue) {
  const raw = normalizePath(rawValue);
  const manifestDirectory = path.dirname(path.resolve(root, manifestPath));
  const rootCandidate = path.resolve(root, raw);
  const manifestCandidate = path.resolve(manifestDirectory, raw);
  if (fs.existsSync(rootCandidate)) return repoPath(root, rootCandidate);
  if (fs.existsSync(manifestCandidate)) return repoPath(root, manifestCandidate);
  if (/^(?:data|scripts|README|docs|tests|js|backend|frontend)\//.test(raw)) return repoPath(root, rootCandidate);
  return repoPath(root, manifestCandidate);
}

function collectReferences(value, context) {
  const references = [];
  const walk = (nested, keyPath) => {
    if (typeof nested === "string") {
      if (!FILE_REFERENCE_PATTERN.test(nested.trim())) return;
      references.push({
        field: context.field,
        key_path: keyPath,
        required: context.required,
        path: resolveManifestReference(context.root, context.manifestPath, nested)
      });
    } else if (Array.isArray(nested)) {
      nested.forEach((item, index) => walk(item, `${keyPath}[${index}]`));
    } else if (nested && typeof nested === "object") {
      Object.entries(nested).forEach(([key, item]) => walk(item, keyPath ? `${keyPath}.${key}` : key));
    }
  };
  walk(value, context.field);
  return references;
}

function packageRecords(inventory, manifest) {
  const records = [];
  for (const subject of inventory.subjects || []) {
    records.push({
      id: subject.id,
      kind: "subject",
      parent_subject_id: null,
      inventory: subject,
      manifest: manifest[subject.id] || null
    });
    for (const specialization of subject.specializations || []) {
      records.push({
        id: specialization.id,
        kind: "specialization",
        parent_subject_id: subject.id,
        inventory: specialization,
        manifest: manifest[subject.id]?.specializations?.[specialization.id] || null
      });
    }
  }
  return records.sort((a, b) => a.id.localeCompare(b.id, "nb"));
}

function packageInventory(record, root, manifestPath) {
  const requiredFields = [...new Set(record.inventory.requiredManifestFields || [])];
  const optionalFields = [...new Set(record.inventory.optionalManifestFields || [])];
  const source = record.manifest || {};
  const missingManifestFields = requiredFields.filter((field) => !(field in source)).sort();
  const references = [];

  for (const field of requiredFields) {
    if (field in source) references.push(...collectReferences(source[field], { root, manifestPath, field, required: true }));
  }
  for (const field of optionalFields) {
    if (!(field in source) || field === "specializations") continue;
    references.push(...collectReferences(source[field], { root, manifestPath, field, required: false }));
  }

  const byPath = new Map();
  for (const reference of references) {
    if (!byPath.has(reference.path)) {
      byPath.set(reference.path, { path: reference.path, required: false, fields: [], key_paths: [] });
    }
    const entry = byPath.get(reference.path);
    entry.required ||= reference.required;
    entry.fields.push(reference.field);
    entry.key_paths.push(reference.key_path);
  }

  const files = [...byPath.values()].map((entry) => {
    const exists = fs.existsSync(path.resolve(root, entry.path));
    return {
      path: entry.path,
      required: entry.required,
      fields: [...new Set(entry.fields)].sort(),
      key_paths: [...new Set(entry.key_paths)].sort(),
      exists,
      content_sha256: exists ? sha256(canonicalJson(canonicalFile(root, entry.path))) : null
    };
  }).sort((a, b) => a.path.localeCompare(b.path, "nb"));

  return {
    required_fields: requiredFields,
    optional_fields: optionalFields,
    present_fields: [...new Set([...requiredFields, ...optionalFields].filter((field) => field in source))].sort(),
    missing_manifest_fields: missingManifestFields,
    files,
    missing_required_files: files.filter((file) => file.required && !file.exists).map((file) => file.path),
    missing_optional_files: files.filter((file) => !file.required && !file.exists).map((file) => file.path),
    content_sha256: hashFiles(root, files.map((file) => file.path)).digest
  };
}

function chapterPaths(record, document) {
  return [...new Set([
    record.file,
    ...(document.moduleFiles || []),
    document.briefFile,
    document.claimsFile,
    ...(document.sourceFiles || [])
  ].map(normalizePath).filter((value) => value?.endsWith(".json")))].sort();
}

function chapterInventory(root, subjectId, registrySubject) {
  const chapters = [];
  const referenced = new Set();
  const missing = [];
  let moduleCount = 0;
  let briefCount = 0;
  let claimsCount = 0;

  for (const record of registrySubject?.chapters || []) {
    const chapterFile = normalizePath(record.file);
    if (!chapterFile || !fs.existsSync(path.resolve(root, chapterFile))) {
      if (chapterFile) missing.push(chapterFile);
      continue;
    }
    const document = readJson(root, chapterFile);
    const paths = chapterPaths(record, document);
    paths.forEach((value) => referenced.add(value));
    const modules = (document.moduleFiles || []).map(normalizePath).filter(Boolean);
    moduleCount += modules.length;
    if (document.briefFile) briefCount += 1;
    if (document.claimsFile) claimsCount += 1;
    const hashed = hashFiles(root, paths);
    missing.push(...hashed.missing);
    chapters.push({
      chapter_id: record.id || document.chapter_id || document.id,
      title: record.title || document.title || "",
      file: chapterFile,
      module_file_count: modules.length,
      referenced_file_count: paths.length,
      content_sha256: hashed.digest
    });
  }

  const referencedPaths = [...referenced].sort();
  return {
    chapter_count: chapters.length,
    module_file_count: moduleCount,
    brief_file_count: briefCount,
    claims_file_count: claimsCount,
    referenced_paths: referencedPaths,
    missing_files: [...new Set(missing)].sort(),
    content_sha256: hashFiles(root, referencedPaths).digest,
    chapters
  };
}

function metadata(documentPath, document) {
  return {
    path: documentPath,
    schema: document.schema || null,
    version: document.version || null,
    updated_at: document.updatedAt || document.updated_at || null,
    content_sha256: sha256(canonicalJson(document))
  };
}

export function buildReleaseManifest({
  root,
  registryPath = DEFAULTS.registry,
  inventoryPath = DEFAULTS.inventory,
  manifestPath = DEFAULTS.manifest
}) {
  const registry = readJson(root, registryPath);
  const inventory = readJson(root, inventoryPath);
  const manifest = readJson(root, manifestPath);
  const subjects = {};
  const allReferenced = new Set([registryPath, inventoryPath, manifestPath]);
  const issues = [];
  let rootSubjectCount = 0;
  let specializationCount = 0;
  let chapterSubjectCount = 0;
  let chapterCount = 0;
  let moduleCount = 0;
  let packageFileCount = 0;
  let chapterFileCount = 0;

  for (const record of packageRecords(inventory, manifest)) {
    record.kind === "subject" ? rootSubjectCount += 1 : specializationCount += 1;
    const packageData = packageInventory(record, root, manifestPath);
    const chapterData = chapterInventory(root, record.id, registry.subjects?.[record.id]);
    const referencedPaths = [...new Set([
      ...packageData.files.map((file) => file.path),
      ...chapterData.referenced_paths
    ])].sort();
    referencedPaths.forEach((value) => allReferenced.add(value));
    const combined = hashFiles(root, referencedPaths);
    const missingFiles = [...new Set([
      ...packageData.missing_required_files,
      ...packageData.missing_optional_files,
      ...chapterData.missing_files,
      ...combined.missing
    ])].sort();
    const packageStatus = !record.manifest
      ? "manifest_missing"
      : packageData.missing_manifest_fields.length || packageData.missing_required_files.length
        ? "incomplete"
        : packageData.missing_optional_files.length
          ? "complete_with_optional_gaps"
          : "complete";
    const chapterStatus = chapterData.chapter_count ? "materialized" : "not_materialized";
    const structuralPayload = {
      subject_id: record.id,
      kind: record.kind,
      parent_subject_id: record.parent_subject_id,
      schema_family: record.inventory.schemaFamily || null,
      required_fields: packageData.required_fields,
      optional_fields: packageData.optional_fields,
      present_fields: packageData.present_fields,
      package_files: packageData.files.map(({ path: filePath, required, fields }) => ({ path: filePath, required, fields })),
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
      missing_required_files: packageData.missing_required_files,
      missing_optional_files: packageData.missing_optional_files,
      missing_chapter_files: chapterData.missing_files,
      missing_files: missingFiles,
      structure_sha256: sha256(canonicalJson(structuralPayload)),
      content_sha256: combined.digest,
      chapters: chapterData.chapters
    };

    issues.push(...packageData.missing_manifest_fields.map((field) => `${record.id}:manifest-field:${field}`));
    issues.push(...packageData.missing_required_files.map((file) => `${record.id}:required:${file}`));
    issues.push(...chapterData.missing_files.map((file) => `${record.id}:chapter:${file}`));
    chapterCount += chapterData.chapter_count;
    moduleCount += chapterData.module_file_count;
    packageFileCount += packageData.files.length;
    chapterFileCount += chapterData.referenced_paths.length;
    if (chapterData.chapter_count) chapterSubjectCount += 1;
  }

  const payload = {
    schema: "history_go_fagverk_release_v2",
    version: "2.0.0",
    source: {
      repository: "Paradispartiet/History-Go",
      branch: "main",
      source_ref_mode: "consumer_observed_head"
    },
    registry: metadata(registryPath, registry),
    subject_inventory: {
      ...metadata(inventoryPath, inventory),
      root_subject_count: rootSubjectCount,
      specialization_count: specializationCount
    },
    fag_manifest: metadata(manifestPath, manifest),
    summary: {
      subject_count: Object.keys(subjects).length,
      root_subject_count: rootSubjectCount,
      specialization_count: specializationCount,
      chapter_subject_count: chapterSubjectCount,
      chapter_count: chapterCount,
      module_file_count: moduleCount,
      package_file_count: packageFileCount,
      chapter_referenced_file_count: chapterFileCount,
      referenced_file_count: allReferenced.size,
      missing_file_count: issues.length,
      optional_gap_count: Object.values(subjects).reduce((sum, subject) => sum + subject.missing_optional_files.length, 0)
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
  const release = buildReleaseManifest({
    root: args.root,
    registryPath: args.registry,
    inventoryPath: args.inventory,
    manifestPath: args.manifest
  });
  if (release.summary.missing_file_count) {
    const issues = Object.entries(release.subjects).flatMap(([subjectId, subject]) => [
      ...subject.missing_manifest_fields.map((field) => `${subjectId}:manifest-field:${field}`),
      ...subject.missing_required_files.map((file) => `${subjectId}:required:${file}`),
      ...subject.missing_chapter_files.map((file) => `${subjectId}:chapter:${file}`)
    ]);
    throw new Error(`Fagverk release has missing required references: ${issues.join(", ")}`);
  }
  const serialized = serializeReleaseManifest(release);
  const outputPath = path.resolve(args.root, args.output);
  if (args.check) {
    if (!fs.existsSync(outputPath)) throw new Error(`Missing Fagverk release manifest: ${args.output}`);
    if (fs.readFileSync(outputPath, "utf8") !== serialized) throw new Error(`Stale Fagverk release manifest: ${args.output}`);
    console.log(`Verified Fagverk release ${release.release_sha256}: ${release.summary.subject_count} packages, ${release.summary.chapter_count} chapters.`);
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(`Wrote Fagverk release ${release.release_sha256}: ${release.summary.subject_count} packages, ${release.summary.chapter_count} chapters.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) main();
