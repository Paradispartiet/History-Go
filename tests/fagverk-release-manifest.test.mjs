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

test("builds deterministic registry-driven Fagverk releases", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "history-go-fagverk-release-"));
  writeJson(root, "data/fagverk/fagverk_registry.json", {
    schema: "history_go_fagverk_registry_v1",
    version: "1.0.0",
    updatedAt: "2026-08-05",
    subjects: {
      natur: {
        title: "Natur",
        chapters: [{ id: "okologi", title: "Økologi", file: "data/fagverk/natur/okologi.json" }]
      },
      politikk: {
        title: "Politikk",
        chapters: [{ id: "forvaltning", title: "Forvaltning", file: "data/fagverk/politikk/forvaltning.json" }]
      }
    }
  });
  writeJson(root, "data/fagverk/natur/okologi.json", {
    id: "okologi",
    title: "Økologi",
    moduleFiles: ["data/fagverk/natur/okologi/01.json"],
    briefFile: "data/fagverk/natur/okologi/brief.json",
    claimsFile: "data/fagverk/natur/okologi/claims.json"
  });
  writeJson(root, "data/fagverk/natur/okologi/01.json", { concepts: ["habitat"] });
  writeJson(root, "data/fagverk/natur/okologi/brief.json", { status: "ready" });
  writeJson(root, "data/fagverk/natur/okologi/claims.json", { claims: [] });
  writeJson(root, "data/fagverk/politikk/forvaltning.json", {
    id: "forvaltning",
    title: "Forvaltning",
    moduleFiles: ["data/fagverk/politikk/forvaltning/01.json", "data/fagverk/politikk/forvaltning/02.json"]
  });
  writeJson(root, "data/fagverk/politikk/forvaltning/01.json", { concepts: ["delegasjon"] });
  writeJson(root, "data/fagverk/politikk/forvaltning/02.json", { concepts: ["skjønn"] });

  const first = buildReleaseManifest({ root });
  const second = buildReleaseManifest({ root });
  assert.equal(serializeReleaseManifest(first), serializeReleaseManifest(second));
  assert.equal(first.summary.subject_count, 2);
  assert.equal(first.summary.chapter_count, 2);
  assert.equal(first.summary.module_file_count, 3);
  assert.equal(first.summary.missing_file_count, 0);
  assert.equal(first.subjects.natur.chapter_count, 1);
  assert.equal(first.subjects.natur.module_file_count, 1);
  assert.equal(first.subjects.natur.brief_file_count, 1);
  assert.equal(first.subjects.natur.claims_file_count, 1);
  assert.equal(first.subjects.politikk.module_file_count, 2);

  const oldDigest = first.subjects.politikk.content_sha256;
  writeJson(root, "data/fagverk/politikk/forvaltning/02.json", { concepts: ["skjønn", "klage"] });
  const changed = buildReleaseManifest({ root });
  assert.notEqual(changed.subjects.politikk.content_sha256, oldDigest);
  assert.notEqual(changed.release_sha256, first.release_sha256);

  writeJson(root, "data/fagverk/fagverk_registry.json", {
    schema: "history_go_fagverk_registry_v1",
    version: "1.1.0",
    updatedAt: "2026-08-05",
    subjects: {
      politikk: {
        title: "Politikk",
        chapters: [
          { id: "forvaltning", title: "Forvaltning", file: "data/fagverk/politikk/forvaltning.json" },
          { id: "valg", title: "Valg", file: "data/fagverk/politikk/valg.json" }
        ]
      }
    }
  });
  writeJson(root, "data/fagverk/politikk/valg.json", { id: "valg", title: "Valg", moduleFiles: [] });
  const structural = buildReleaseManifest({ root });
  assert.equal(structural.subjects.politikk.chapter_count, 2);
  assert.notEqual(structural.subjects.politikk.structure_sha256, first.subjects.politikk.structure_sha256);
});
