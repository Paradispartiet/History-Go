import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  STATIC_RULE_FILES,
  buildRulePreflight,
  requiredRuleFiles,
  validateWorkcard
} from "../scripts/place-production-rule-preflight.mjs";

test("historie preflight requires all canonical rule files plus category badge", () => {
  const files = requiredRuleFiles("historie");
  for (const required of STATIC_RULE_FILES) assert.ok(files.includes(required), `missing ${required}`);
  assert.ok(files.includes("data/badges/historie.json"));
  assert.equal(new Set(files).size, files.length);
});

test("recorded historie preflight snapshots the canonical four-collection route", () => {
  const preflight = buildRulePreflight("akershus_festning", "historie");
  assert.equal(preflight.schema, "history_go_place_rule_preflight_v1");
  assert.equal(preflight.status, "PASS");
  assert.deepEqual(preflight.contract_snapshot.candidate_collections, ["people", "objects", "brands", "productions"]);
  assert.equal(preflight.contract_snapshot.category_expression, "productions");
  assert.equal(preflight.contract_snapshot.full_place_collection_count, 4);
  assert.equal(preflight.contract_snapshot.related_is_placecard_collection, false);
  assert.equal(preflight.contract_snapshot.no_filler, true);
  for (const entry of preflight.files) assert.match(entry.sha256, /^[a-f0-9]{64}$/);
});

test("fresh rule evidence validates and a stale hash is rejected", () => {
  const preflight = buildRulePreflight("akershus_festning", "historie");
  const workcard = {
    schema: "history_go_place_workcard_v2",
    place_id: "akershus_festning",
    category: "historie",
    status: "preflight",
    rule_preflight: preflight
  };
  assert.deepEqual(validateWorkcard(workcard, "fixture.json"), []);

  const stale = structuredClone(workcard);
  stale.rule_preflight.files[0].sha256 = "0".repeat(64);
  assert.ok(validateWorkcard(stale, "fixture.json").some(error => error.includes("stale preflight")));
});

test("READ-FIRST compares place workcards against the current pull-request base branch", () => {
  const workflow = fs.readFileSync(".github/workflows/place-production-read-first.yml", "utf8");
  assert.match(workflow, /git fetch origin \"\$\{\{ github\.base_ref \}\}:refs\/remotes\/origin\/\$\{\{ github\.base_ref \}\}\"/);
  assert.match(workflow, /check --base \"origin\/\$\{\{ github\.base_ref \}\}\"/);
  assert.doesNotMatch(workflow, /pull_request\.base\.sha/);
});
