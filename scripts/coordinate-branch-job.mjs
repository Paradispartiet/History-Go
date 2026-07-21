#!/usr/bin/env node

import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { cwd: process.cwd(), stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with ${result.status}`);
}

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-3.test.js"]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-2.test.js"]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-1.test.js"]);
run("node", ["tests/etne-jettegrytene-nature-rounds.test.js"]);
run("node", ["tests/etne-langfoss-nature-rounds.test.js"]);
run("node", ["tests/etne-skano-nature-rounds.test.js"]);
run("node", ["tests/etne-brattholmen-nature-rounds.test.js"]);
run("node", ["tests/etne-saevareidberget-nature-rounds.test.js"]);
run("node", ["tests/etne-langebudalen-nature-rounds.test.js"]);
run("node", ["tests/etne-fish-species-rounds.test.js"]);
run("node", ["tests/etne-nature-round-content.test.js"]);

console.log("Åkrafjorden marine species batch 3 final validation OK");
