import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildReleaseManifest, serializeReleaseManifest } from "../scripts/build-fagverk-release-manifest.mjs";

function writeJson(root, relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(root, relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value, "utf8");
}

test("builds deterministic whole-architecture Fagverk releases", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "history-go-fagverk-release-v2-"));
  writeJson(root, "data/fagverk/subject_inventory.json", {
    schema: "history_go_fagverk_subject_inventory_v1",
    version: "1.0.0",
    subjects: [
      {
        id: "natur",
        schemaFamily: "standard_canonical",
        requiredManifestFields: ["pensum", "emner", "fagkart", "methods"],
        optionalManifestFields: ["quizStandard"],
        pilot: true
      },
      {
        id: "vitenskap",
        schemaFamily: "standard_canonical",
        requiredManifestFields: ["pensum", "emner", "fagkart", "methods"],
        optionalManifestFields: ["specializations"],
        specializations: [
          {
            id: "teknologi",
            schemaFamily: "technology_scientific_v2_4",
            requiredManifestFields: ["pensum", "emner", "fagkart", "methods"],
            optionalManifestFields: ["scientificPackage"]
          }
        ]
      }
    ]
  });
  writeJson(root, "data/fag/fag_manifest.json", {
    natur: {
      pensum: "natur/pensum.json",
      emner: "natur/emner.json",
      fagkart: "natur/fagkart.json",
      methods: "natur/methods.json",
      quizStandard: "../quiz/standard.md"
    },
    vitenskap: {
      pensum: "vitenskap/pensum.json",
      emner: "vitenskap/emner.json",
      fagkart: "vitenskap/fagkart.json",
      methods: "vitenskap/methods.json",
      specializations: {
        teknologi: {
          pensum: "teknologi/pensum.json",
          emner: "teknologi/emner.json",
          fagkart: "teknologi/fagkart.json",
          methods: "teknologi/methods.json",
          scientificPackage: "teknologi/package/index.json"
        }
      }
    }
  });
  writeJson(root, "data/fagverk/fagverk_registry.json", {
    schema: "history_go_fagverk_registry_v1",
    version: "1.0.0",
    updatedAt: "2026-08-05",
    subjects: {
      natur: {
        title: "Natur",
        chapters: [{ id: "okologi", title: "Økologi", file: "data/fagverk/natur/okologi.json" }]
      }
    }
  });
  for (const file of [
    "data/fag/natur/pensum.json", "data/fag/natur/emner.json", "data/fag/natur/fagkart.json", "data/fag/natur/methods.json",
    "data/fag/vitenskap/pensum.json", "data/fag/vitenskap/emner.json", "data/fag/vitenskap/fagkart.json", "data/fag/vitenskap/methods.json",
    "data/fag/teknologi/pensum.json", "data/fag/teknologi/emner.json", "data/fag/teknologi/fagkart.json", "data/fag/teknologi/methods.json",
    "data/fag/teknologi/package/index.json"
  ]) writeJson(root, file, { id: file, entries: ["a"] });
  writeText(root, "data/quiz/standard.md", "# Quizstandard\n");
  writeJson(root, "data/fagverk/natur/okologi.json", {
    id: "okologi",
    title: "Økologi",
    moduleFiles: ["data/fagverk/natur/okologi/01.json"]
  });
  writeJson(root, "data/fagverk/natur/okologi/01.json", { concepts: ["habitat"] });

  const first = buildReleaseManifest({ root });
  const second = buildReleaseManifest({ root });
  assert.equal(serializeReleaseManifest(first), serializeReleaseManifest(second));
  assert.equal(first.schema, "history_go_fagverk_release_v2");
  assert.equal(first.summary.root_subject_count, 2);
  assert.equal(first.summary.specialization_count, 1);
  assert.equal(first.summary.subject_count, 3);
  assert.equal(first.summary.chapter_subject_count, 1);
  assert.equal(first.summary.chapter_count, 1);
  assert.equal(first.summary.module_file_count, 1);
  assert.equal(first.summary.missing_file_count, 0);
  assert.equal(first.subjects.natur.package_status, "complete");
  assert.equal(first.subjects.natur.chapter_status, "materialized");
  assert.equal(first.subjects.vitenskap.chapter_status, "not_materialized");
  assert.equal(first.subjects.teknologi.kind, "specialization");
  assert.equal(first.subjects.teknologi.parent_subject_id, "vitenskap");
  assert.equal(first.subjects.teknologi.schema_family, "technology_scientific_v2_4");

  const oldDigest = first.subjects.vitenskap.content_sha256;
  writeJson(root, "data/fag/vitenskap/emner.json", { entries: ["a", "b"] });
  const changed = buildReleaseManifest({ root });
  assert.notEqual(changed.subjects.vitenskap.content_sha256, oldDigest);
  assert.notEqual(changed.release_sha256, first.release_sha256);

  writeJson(root, "data/fagverk/fagverk_registry.json", {
    schema: "history_go_fagverk_registry_v1",
    version: "1.1.0",
    updatedAt: "2026-08-05",
    subjects: {
      natur: {
        title: "Natur",
        chapters: [
          { id: "okologi", title: "Økologi", file: "data/fagverk/natur/okologi.json" },
          { id: "klima", title: "Klima", file: "data/fagverk/natur/klima.json" }
        ]
      }
    }
  });
  writeJson(root, "data/fagverk/natur/klima.json", { id: "klima", title: "Klima", moduleFiles: [] });
  const structural = buildReleaseManifest({ root });
  assert.equal(structural.subjects.natur.chapter_count, 2);
  assert.notEqual(structural.subjects.natur.structure_sha256, first.subjects.natur.structure_sha256);
});

test("reports optional gaps without invalidating the required package contract", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "history-go-fagverk-release-optional-gap-"));
  writeJson(root, "data/fagverk/subject_inventory.json", {
    schema: "history_go_fagverk_subject_inventory_v1",
    version: "1.0.0",
    subjects: [
      {
        id: "natur",
        schemaFamily: "standard_canonical",
        requiredManifestFields: ["pensum", "emner", "fagkart", "methods"],
        optionalManifestFields: ["quizStandard"]
      }
    ]
  });
  writeJson(root, "data/fag/fag_manifest.json", {
    natur: {
      pensum: "natur/pensum.json",
      emner: "natur/emner.json",
      fagkart: "natur/fagkart.json",
      methods: "natur/methods.json",
      quizStandard: "../quiz/missing-standard.md"
    }
  });
  writeJson(root, "data/fagverk/fagverk_registry.json", {
    schema: "history_go_fagverk_registry_v1",
    version: "1.0.0",
    subjects: {}
  });
  for (const file of [
    "data/fag/natur/pensum.json",
    "data/fag/natur/emner.json",
    "data/fag/natur/fagkart.json",
    "data/fag/natur/methods.json"
  ]) writeJson(root, file, { id: file });

  const release = buildReleaseManifest({ root });
  assert.equal(release.summary.missing_file_count, 0);
  assert.equal(release.summary.optional_gap_count, 1);
  assert.equal(release.subjects.natur.package_status, "complete_with_optional_gaps");
  assert.deepEqual(release.subjects.natur.missing_required_files, []);
  assert.deepEqual(release.subjects.natur.missing_optional_files, ["data/quiz/missing-standard.md"]);
  assert.deepEqual(release.subjects.natur.missing_files, ["data/quiz/missing-standard.md"]);
});
