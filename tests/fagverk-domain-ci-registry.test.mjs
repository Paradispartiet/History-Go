import assert from "node:assert/strict";
import test from "node:test";

import {
  loadRegistries,
  selectSubjects,
  validateRegistry,
} from "../scripts/run-fagverk-domain-ci-v1.mjs";

const registries = loadRegistries();

test("Helse and Utdanning use one domain CI registry contract", () => {
  assert.deepEqual(Object.keys(registries), ["helse", "utdanning"]);
  for (const [subject, registry] of Object.entries(registries)) {
    const validated = validateRegistry(registry);
    assert.equal(registry.subject, subject);
    assert.equal(validated.domains.length, registry.totalDomains);
    assert.ok(Number.isInteger(validated.count));
    assert.ok(validated.count >= 0 && validated.count <= registry.totalDomains);
  }
});

test("domain routing selects affected subjects and fans shared changes into one job", () => {
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/helse/emner_helse_canonical_v1.json"],
  }), ["helse"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/utdanning/emner_utdanning_canonical_v1.json"],
  }), ["utdanning"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fagverk/subject_inventory.json"],
  }), ["helse", "utdanning"]);
});
