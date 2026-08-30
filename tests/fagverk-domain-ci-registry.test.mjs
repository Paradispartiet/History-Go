import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  loadRegistries,
  selectSubjects,
  validateRegistry,
} from "../scripts/run-fagverk-domain-ci-v1.mjs";

const registries = loadRegistries();

test("Helse, Utdanning, Sosiologi/antropologi and Geografi use one domain CI registry contract", () => {
  assert.deepEqual(Object.keys(registries), ["helse", "utdanning", "sosiologi_antropologi", "geografi"]);
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
    changedFiles: ["data/fag/politikk/sosiologi_antropologi/production_registry_v1.json"],
  }), ["sosiologi_antropologi"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/natur/geografi/production_registry_v1.json"],
  }), ["geografi"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fagverk/subject_inventory.json"],
  }), ["helse", "utdanning", "sosiologi_antropologi", "geografi"]);
});

test("shared domain workflow triggers on every Geografi surface routed by the registry", () => {
  const workflow = readFileSync(".github/workflows/fagverk-domain-registry.yml", "utf8");
  for (const pathPattern of [
    "data/fag/natur/geografi/**",
    "data/fagverk/natur/geografi/**",
    "reports/fagverk/geografi-*.json",
    "scripts/*geografi*",
    "tests/geografi-*.test.mjs",
    ".github/ci/fagverk-geografi-domain-registry-v1.json",
  ]) {
    assert.match(workflow, new RegExp(pathPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `workflow mangler Geografi-trigger ${pathPattern}`);
  }
});
