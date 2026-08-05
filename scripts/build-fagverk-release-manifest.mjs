#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_REGISTRY = "data/fagverk/fagverk_registry.json";
const DEFAULT_OUTPUT = "data/fagverk/fagverk_release.json";

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

function parseArgs(argv) {
  const args = { root: process.cwd(), registry: DEFAULT_REGISTRY, output: DEFAULT_OUTPUT, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--root") args.root = path.resolve(argv[++index] || args.root);
    else if (token === "--registry") args.registry = normalizePath(argv[++index] || args.registry);
    else if (token === "--output") args.output = normalizePath(argv[++index] || args.output);
    else if (token === "--check") args.check = true;
    else if (token === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function referencedPaths(chapterRecord, chapterDocument) {
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

function hashFiles(root, relativePaths) {
  const missing = [];
  const canonicalFiles = [];
  for (const relativePath of relativePaths) {
    const absolutePath = path.resolve(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      missing.push(relativePath);
      continue;
    }
    const parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
    canonicalFiles.push({ path: relativePath, content: stableValue(parsed) });
  }
  return {
    missing,
    digest: sha256(canonicalJson(canonicalFiles)),
    canonicalFiles
  };
}

export function buildReleaseManifest({ root, registryPath = DEFAULT_REGISTRY }) {
  const registry = readJson(root, registryPath);
  const subjects = {};
  let totalChapters = 0;
  let totalModules = 0;
  let totalReferencedFiles = 0;
  const allMissing = [];

  for (const subjectId of Object.keys(registry.subjects || {}).sort()) {
    const subject = registry.subjects[subjectId] || {};
    const chapters = [];
    const subjectPaths = new Set();
    let moduleFileCount = 0;
    let briefFileCount = 0;
    let claimsFileCount = 0;

    for (const chapterRecord of subject.chapters || []) {
      const chapterFile = normalizePath(chapterRecord.file);
      const chapterDocument = readJson(root, chapterFile);
      const paths = referencedPaths(chapterRecord, chapterDocument);
      paths.forEach((value) => subjectPaths.add(value));
      const modulePaths = (chapterDocument.moduleFiles || []).map(normalizePath).filter(Boolean);
      moduleFileCount += modulePaths.length;
      if (chapterDocument.briefFile) briefFileCount += 1;
      if (chapterDocument.claimsFile) claimsFileCount += 1;
      const chapterHash = hashFiles(root, paths);
      allMissing.push(...chapterHash.missing.map((value) => `${subjectId}:${value}`));
      chapters.push({
        chapter_id: chapterRecord.id || chapterDocument.chapter_id || chapterDocument.id,
        title: chapterRecord.title || chapterDocument.title || "",
        file: chapterFile,
        module_file_count: modulePaths.length,
        referenced_file_count: paths.length,
        content_sha256: chapterHash.digest
      });
    }

    const sortedPaths = [...subjectPaths].sort();
    const subjectHash = hashFiles(root, sortedPaths);
    const structure = {
      subject_id: subjectId,
      chapter_ids: chapters.map((chapter) => chapter.chapter_id),
      chapter_files: chapters.map((chapter) => chapter.file),
      module_file_counts: Object.fromEntries(chapters.map((chapter) => [chapter.chapter_id, chapter.module_file_count]))
    };
    subjects[subjectId] = {
      title: subject.title || subjectId,
      chapter_count: chapters.length,
      module_file_count: moduleFileCount,
      brief_file_count: briefFileCount,
      claims_file_count: claimsFileCount,
      referenced_file_count: sortedPaths.length,
      missing_files: subjectHash.missing,
      structure_sha256: sha256(canonicalJson(structure)),
      content_sha256: subjectHash.digest,
      chapters
    };
    totalChapters += chapters.length;
    totalModules += moduleFileCount;
    totalReferencedFiles += sortedPaths.length;
  }

  const registryDocument = stableValue(registry);
  const payload = {
    schema: "history_go_fagverk_release_v1",
    version: "1.0.0",
    source: {
      repository: "Paradispartiet/History-Go",
      branch: "main",
      source_ref_mode: "consumer_observed_head"
    },
    registry: {
      path: registryPath,
      schema: registry.schema || null,
      version: registry.version || null,
      updated_at: registry.updatedAt || null,
      content_sha256: sha256(canonicalJson(registryDocument))
    },
    summary: {
      subject_count: Object.keys(subjects).length,
      chapter_count: totalChapters,
      module_file_count: totalModules,
      referenced_file_count: totalReferencedFiles,
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
    console.log("Usage: node scripts/build-fagverk-release-manifest.mjs [--root dir] [--registry path] [--output path] [--check]");
    return;
  }
  const manifest = buildReleaseManifest({ root: args.root, registryPath: args.registry });
  if (manifest.summary.missing_file_count) {
    const missing = Object.entries(manifest.subjects).flatMap(([subjectId, subject]) => subject.missing_files.map((file) => `${subjectId}:${file}`));
    throw new Error(`Fagverk release has missing files: ${missing.join(", ")}`);
  }
  const serialized = serializeReleaseManifest(manifest);
  const outputPath = path.resolve(args.root, args.output);
  if (args.check) {
    if (!fs.existsSync(outputPath)) throw new Error(`Missing Fagverk release manifest: ${args.output}`);
    if (fs.readFileSync(outputPath, "utf8") !== serialized) throw new Error(`Stale Fagverk release manifest: ${args.output}`);
    console.log(`Verified Fagverk release ${manifest.release_sha256}: ${manifest.summary.subject_count} subjects, ${manifest.summary.chapter_count} chapters.`);
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(`Wrote Fagverk release ${manifest.release_sha256}: ${manifest.summary.subject_count} subjects, ${manifest.summary.chapter_count} chapters.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) main();
