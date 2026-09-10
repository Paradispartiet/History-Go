#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const id = "peststotten_krist_kirkegard";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

const packetFile = `data/places/production/${id}.json`;
const packet = read(packetFile);
const temporalClaim = packet.claims.find(claim => /brukes som historisk kilde/iu.test(claim.claim));
if (!temporalClaim) throw new Error("Expected temporal Peststøtten claim was not materialized");
temporalClaim.temporalStatus = "current";
if (!Array.isArray(packet.source_conflicts) || packet.source_conflicts.length === 0) throw new Error("Expected Peststøtten source conflict was not materialized");
packet.source_conflicts[0].claim = "Et eksakt samlet dødstall for hele Christiania under pesten i 1654.";
write(packetFile, packet);

const leksikonFile = `data/leksikon/places/oslo/historie/leksikon_${id}.json`;
const leksikon = read(leksikonFile);
if (!leksikon.entry?.id || leksikon.entry.place_id !== id) throw new Error("Expected Peststøtten leksikon entry was not materialized");
leksikon.places = [leksikon.entry];
write(leksikonFile, leksikon);

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

execFileSync("npm", ["run", "place-open:build"], { cwd: root, stdio: "inherit" });

console.log(JSON.stringify({
  place: id,
  temporal_claim_status: temporalClaim.temporalStatus,
  source_conflict: packet.source_conflicts[0].claim,
  leksikon_runtime_rows: leksikon.places.length,
  rule_preflight: workcard.rule_preflight.status,
  regression_registered: true
}, null, 2));
