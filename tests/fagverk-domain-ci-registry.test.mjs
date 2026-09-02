import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  loadRegistries,
  selectSubjects,
  validateRegistry,
} from "../scripts/run-fagverk-domain-ci-v1.mjs";

const registries = loadRegistries();

test("Helse, Utdanning, Sosiologi/antropologi, Geografi, Språk/lingvistikk Juss/rettsvitenskap Fysikk, Kjemi and Matematikk use one domain CI registry contract", () => {
  assert.deepEqual(Object.keys(registries), ["helse", "utdanning", "sosiologi_antropologi", "geografi", "sprak_lingvistikk", "juss_rettsvitenskap", "fysikk", "kjemi", "matematikk"]);
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
    changedFiles: ["data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json"],
  }), ["sprak_lingvistikk"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json"],
  }), ["juss_rettsvitenskap"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/vitenskap/fysikk/production_registry_v1.json"],
  }), ["fysikk"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/vitenskap/kjemi/production_registry_v1.json"],
  }), ["kjemi"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fag/vitenskap/matematikk/production_registry_v1.json"],
  }), ["matematikk"]);
  assert.deepEqual(selectSubjects({
    registries,
    changedFiles: ["data/fagverk/subject_inventory.json"],
  }), ["helse", "utdanning", "sosiologi_antropologi", "geografi", "sprak_lingvistikk", "juss_rettsvitenskap", "fysikk", "kjemi", "matematikk"]);
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

test("shared domain workflow triggers on every Språk & lingvistikk surface routed by the registry", () => {
  const workflow = readFileSync(".github/workflows/fagverk-domain-registry.yml", "utf8");
  for (const pathPattern of [
    "data/fag/litteratur/sprak_lingvistikk/**",
    "data/fagverk/litteratur/sprak_lingvistikk/**",
    "reports/fagverk/sprak-lingvistikk-*.json",
    "scripts/*sprak-lingvistikk*",
    "tests/sprak-lingvistikk-*.test.mjs",
    ".github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json",
  ]) {
    assert.match(workflow, new RegExp(pathPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `workflow mangler Språk & lingvistikk-trigger ${pathPattern}`);
  }
});

test("shared domain workflow triggers on every Juss & rettsvitenskap surface routed by the registry", () => {
  const workflow = readFileSync(".github/workflows/fagverk-domain-registry.yml", "utf8");
  for (const pathPattern of [
    "data/fag/politikk/juss_rettsvitenskap/**",
    "data/fagverk/politikk/juss_rettsvitenskap/**",
    "reports/fagverk/juss-rettsvitenskap-*.json",
    "scripts/*juss-rettsvitenskap*",
    "tests/juss-rettsvitenskap-*.test.mjs",
    ".github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json",
  ]) {
    assert.equal(workflow.includes(pathPattern), true, "workflow mangler Juss-trigger " + pathPattern);
  }
});

test("shared domain workflow triggers on every Fysikk surface routed by the registry", () => {
  const workflow = readFileSync(".github/workflows/fagverk-domain-registry.yml", "utf8");
  for (const pathPattern of ["data/fag/vitenskap/fysikk/**","data/fagverk/vitenskap/fysikk/**","reports/fagverk/fysikk-*.json","scripts/*fysikk*","tests/fysikk-*.test.mjs",".github/ci/fagverk-fysikk-domain-registry-v1.json"]) assert.equal(workflow.includes(pathPattern), true, "workflow mangler Fysikk-trigger " + pathPattern);
});

test("shared domain workflow triggers on every Kjemi surface routed by the registry", () => {
  const workflow = readFileSync(".github/workflows/fagverk-domain-registry.yml", "utf8");
  for (const pathPattern of ["data/fag/vitenskap/kjemi/**","data/fagverk/vitenskap/kjemi/**","reports/fagverk/kjemi-*.json","scripts/*kjemi*","tests/kjemi-*.test.mjs",".github/ci/fagverk-kjemi-domain-registry-v1.json"]) assert.equal(workflow.includes(pathPattern), true, "workflow mangler Kjemi-trigger " + pathPattern);
});


test("shared domain workflow triggers on every Matematikk surface routed by the registry",()=>{const workflow=readFileSync(".github/workflows/fagverk-domain-registry.yml","utf8");for(const p of ["data/fag/vitenskap/matematikk/**","data/fagverk/vitenskap/matematikk/**","reports/fagverk/matematikk-*.json","scripts/*matematikk*","tests/matematikk-*.test.mjs",".github/ci/fagverk-matematikk-domain-registry-v1.json"])assert.equal(workflow.includes(p),true,"workflow mangler Matematikk-trigger "+p)});
