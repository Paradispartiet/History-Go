import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  auditRepository,
  DEFAULT_REPO_ROOT
} from "../scripts/audit-civication-scene-pipeline.mjs";

const registryPath = path.join(
  DEFAULT_REPO_ROOT,
  "data/Civication/compiledSceneRegistryV1.json"
);
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const ignoredSourceFiles = new Set(registry.ignored_source_files || []);
const transitionSource = "data/Civication/mailFamilies/naeringsliv/job/mellomleder_fraksjonsvalg.json";

assert.ok(
  ignoredSourceFiles.has(transitionSource),
  `${transitionSource} must remain compiler-ignored while it is a transition source`
);
assert.ok(
  !(registry.compiled_source_files || []).includes(transitionSource),
  `${transitionSource} must not be compiled into the runtime registry`
);

const audit = auditRepository(DEFAULT_REPO_ROOT);
const duplicateBlockers = (audit.blocking_issues || []).filter(
  (issue) => issue.category === "duplicate_scene_id"
);

for (const issue of duplicateBlockers) {
  for (const occurrence of issue.occurrences || []) {
    assert.ok(
      !ignoredSourceFiles.has(occurrence.path),
      `duplicate blocker ${issue.id} must not include compiler-ignored source ${occurrence.path}`
    );
  }
}

assert.ok(
  !duplicateBlockers.some((issue) => issue.id === "ml_faction_001"),
  "ml_faction_001 must not be a canonical duplicate blocker when its transition occurrence is compiler-ignored"
);

console.log("civication-scene-pipeline-ignored-source-duplicates.test.js: OK");
