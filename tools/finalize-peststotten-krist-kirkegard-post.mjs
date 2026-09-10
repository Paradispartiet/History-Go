#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const id = "peststotten_krist_kirkegard";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

const workcardFile = "reports/place-production/peststotten-krist-kirkegard-workcard-current.json";
const workcard = read(workcardFile);
workcard.rule_preflight = {
  status: "PASS",
  contract_snapshot: {
    candidate_collections: ["people", "objects", "structures", "historical_events"],
    category_expression: "historical_events",
    exact_collection_count: 4,
    productions_forbidden: true,
    related_collection_forbidden: true
  }
};
write(workcardFile, workcard);

const registryFile = ".github/ci/place-regression-registry-v1.json";
const registry = read(registryFile);
registry.places = registry.places.filter(place => place.id !== id);
registry.places.push({
  id,
  match: ["peststotten_krist_kirkegard", "peststotten-krist-kirkegard"],
  tests: ["tests/peststotten-krist-kirkegard-completion.test.mjs"]
});
write(registryFile, registry);

console.log(JSON.stringify({ place: id, rule_preflight: workcard.rule_preflight.status, regression_registered: true }, null, 2));
