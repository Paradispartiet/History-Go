from pathlib import Path

AUDIT_PATH = Path("scripts/audit-civication-scene-pipeline.mjs")
TEST_PATH = Path("tests/civication-scene-pipeline-ignored-source-duplicates.test.js")

audit = AUDIT_PATH.read_text(encoding="utf-8")
marker = "  const compilerLegacyFallbackRoot = norm(compiledRegistry?.legacy_fallback_inventory?.root)"
if marker not in audit:
    start_marker = "  const compilerIgnoredSourceFiles = new Set(uniq(compiledRegistry?.ignored_source_files));\n"
    end_marker = "\n\n  const ids = new Map();"
    start = audit.find(start_marker)
    if start < 0:
        raise SystemExit("duplicate-filter start marker not found")
    end = audit.find(end_marker, start)
    if end < 0:
        raise SystemExit("duplicate-filter end marker not found")
    replacement = "\n".join([
        "  const compilerIgnoredSourceFiles = new Set(uniq(compiledRegistry?.ignored_source_files));",
        "  const compilerLegacyFallbackRoot = norm(compiledRegistry?.legacy_fallback_inventory?.root).replace(/\\/+$/, \"\");",
        "  const duplicateCandidateRecords = sceneRecords.filter((record) => {",
        "    if (compilerIgnoredSourceFiles.has(record.source_path)) return false;",
        "    if (compilerLegacyFallbackRoot && (",
        "      record.source_path === compilerLegacyFallbackRoot",
        "      || record.source_path.startsWith(`${compilerLegacyFallbackRoot}/`)",
        "    )) return false;",
        "    return true;",
        "  });",
    ])
    audit = audit[:start] + replacement + audit[end:]
    AUDIT_PATH.write_text(audit, encoding="utf-8")

TEST_PATH.write_text(r'''import assert from "node:assert/strict";
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
const legacyFallbackRoot = String(registry.legacy_fallback_inventory?.root || "").replace(/\/+$/, "");
const transitionSource = "data/Civication/mailFamilies/naeringsliv/job/mellomleder_fraksjonsvalg.json";
const legacyNavSources = [
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
assert.equal(
  legacyFallbackRoot,
  "data/Civication/jobbmails",
  "legacy jobbmail root must remain explicit compiler inventory rather than a competing scene source"
);
for (const source of legacyNavSources) {
  assert.ok(
    source.startsWith(`${legacyFallbackRoot}/`),
    `${source} must remain inside compiler legacy fallback inventory`
  );
  assert.ok(
    !(registry.compiled_source_files || []).includes(source),
    `${source} must not be compiled into the runtime registry`
  );
}

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
    assert.ok(
      !legacyFallbackRoot || (
        occurrence.path !== legacyFallbackRoot
        && !occurrence.path.startsWith(`${legacyFallbackRoot}/`)
      ),
      `duplicate blocker ${issue.id} must not include compiler legacy source ${occurrence.path}`
    );
  }
}

assert.ok(
  !duplicateBlockers.some((issue) => issue.id === "ml_faction_001"),
  "ml_faction_001 must not be a canonical duplicate blocker when its transition occurrence is compiler-ignored"
);
assert.ok(
  !duplicateBlockers.some((issue) => issue.id === "nav_001"),
  "nav_001 must not be a canonical duplicate blocker when all occurrences live under compiler legacy fallback inventory"
);

console.log("civication-scene-pipeline-ignored-source-duplicates.test.js: OK");
''', encoding="utf-8")
