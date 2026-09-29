import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  auditRepository,
  DEFAULT_REPO_ROOT,
  findDuplicateSceneIds
} from "../scripts/audit-civication-scene-pipeline.mjs";

const registryPath = path.join(
  DEFAULT_REPO_ROOT,
  "data/Civication/compiledSceneRegistryV1.json"
);
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const ignoredSourceFiles = new Set(registry.ignored_source_files || []);
const transitionSource = "data/Civication/mailFamilies/naeringsliv/job/mellomleder_fraksjonsvalg.json";
const legacyJobmailSources = [
  "data/Civication/jobbmails/byCivic.json",
  "data/Civication/jobbmails/mediaCivic.json",
  "data/Civication/jobbmails/naeringsliv/naeringslivCivic.json"
];

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
const inventoriedSceneSources = new Set(
  (audit.inventory?.formats || []).flatMap((row) => row.paths || [])
);

for (const source of legacyJobmailSources) {
  assert.ok(
    inventoriedSceneSources.has(source),
    `${source} must remain inventoried as a legacy scene source`
  );
}

for (const issue of duplicateBlockers) {
  for (const occurrence of issue.occurrences || []) {
    assert.ok(
      !ignoredSourceFiles.has(occurrence.path),
      `duplicate blocker ${issue.id} must not include compiler-ignored source ${occurrence.path}`
    );
    assert.ok(
      !occurrence.path.startsWith("data/Civication/jobbmails/"),
      `duplicate blocker ${issue.id} must not include legacy jobbmails source ${occurrence.path}`
    );
  }
}

assert.ok(
  !duplicateBlockers.some((issue) => issue.id === "ml_faction_001"),
  "ml_faction_001 must not be a canonical duplicate blocker when its transition occurrence is compiler-ignored"
);
assert.ok(
  !duplicateBlockers.some((issue) => issue.id === "nav_001"),
  "nav_001 must not be a canonical duplicate blocker when every duplicate occurrence is legacy jobbmails debt"
);

const syntheticDuplicates = findDuplicateSceneIds([
  { id: "runtime_duplicate_probe", source_path: "data/Civication/mailFamilies/probe/a.json" },
  { id: "runtime_duplicate_probe", source_path: "data/Civication/mailFamilies/probe/b.json" },
  { id: "legacy_duplicate_probe", source_path: "data/Civication/jobbmails/a.json" },
  { id: "legacy_duplicate_probe", source_path: "data/Civication/jobbmails/b.json" }
]);
assert.deepEqual(
  syntheticDuplicates.map((issue) => issue.id),
  ["runtime_duplicate_probe"],
  "duplicates across active mailFamilies sources must still block while legacy jobbmails duplicates stay non-blocking"
);

console.log("civication-scene-pipeline-ignored-source-duplicates.test.js: OK");
