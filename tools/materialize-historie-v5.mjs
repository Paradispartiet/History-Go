#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

// The old materializer wrote synthetic V5 emner, concepts and theories that were
// not used by the production quiz pipeline. Materialization now means producing
// a truthful V5.5 readiness snapshot from the active production canonical files.
const validator = path.join(process.cwd(), "tools/validate-historie-v5.mjs");
const result = spawnSync(process.execPath, [validator, "--write", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: "inherit"
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
