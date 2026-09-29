import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { auditRepository } from "../scripts/audit-civication-scene-pipeline.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "civication-scene-audit-"));

function writeJson(relative, value) {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

try {
  writeJson("data/Civication/scenePipelinePolicyV1.json", {
    canonical_scene_contract: "data/Civication/sceneContractV1.schema.json",
    format_freeze: { new_mail_source_formats_allowed: false },
    audit: { enforcement_mode: "observe" }
  });
  writeJson("data/Civication/sceneContractV1.schema.json", {
    properties: { schema: { const: "civication_scene_v1" } }
  });
  writeJson("data/Civication/badgeRoleMappings.json", { careers: {} });
  writeJson("data/Civication/compiledSceneRegistryV1.json", {
    compiled_source_files: [],
    ignored_source_files: []
  });

  writeJson("data/Civication/jobbmails/byCivic.json", {
    mails: [{ id: "legacy_duplicate", subject: "Legacy A" }]
  });
  writeJson("data/Civication/jobbmails/mediaCivic.json", {
    mails: [{ id: "legacy_duplicate", subject: "Legacy B" }]
  });

  writeJson("data/Civication/mailFamilies/test/job/runtime_a.json", {
    mails: [{ id: "runtime_duplicate", subject: "Runtime A" }]
  });
  writeJson("data/Civication/mailFamilies/test/job/runtime_b.json", {
    mails: [{ id: "runtime_duplicate", subject: "Runtime B" }]
  });

  const audit = auditRepository(root);
  const duplicateBlockers = (audit.blocking_issues || []).filter(
    (issue) => issue.category === "duplicate_scene_id"
  );

  assert.equal(
    audit.inventory.scene_records,
    4,
    "legacy jobbmails must remain inventoried as scene records"
  );
  assert.ok(
    !duplicateBlockers.some((issue) => issue.id === "legacy_duplicate"),
    "legacy jobbmails duplicates must not be active duplicate-scene blockers"
  );

  const runtimeDuplicate = duplicateBlockers.find(
    (issue) => issue.id === "runtime_duplicate"
  );
  assert.ok(
    runtimeDuplicate,
    "duplicate IDs across active mailFamilies sources must remain blocking"
  );
  assert.deepEqual(
    runtimeDuplicate.occurrences.map((row) => row.path).sort(),
    [
      "data/Civication/mailFamilies/test/job/runtime_a.json",
      "data/Civication/mailFamilies/test/job/runtime_b.json"
    ]
  );

  console.log("civication-scene-pipeline-legacy-jobmail-duplicates.test.js: OK");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
