#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2);
const command = args.find(arg => !arg.startsWith("--")) || "audit";
const allowed = new Set(["audit", "candidates", "apply"]);

if (!allowed.has(command)) {
  console.error("Bruk: node scripts/people-images.mjs audit|candidates|apply [--write] [--limit=N] [--ids=a,b]");
  process.exit(1);
}

const build = spawnSync("npm", ["run", "build:tools"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: process.platform === "win32"
});
if (build.status !== 0) process.exit(build.status ?? 1);

const forwarded = args.filter(arg => arg !== command);
const run = spawnSync("node", ["dist/tools/people-image-pipeline.mjs", command, ...forwarded], {
  cwd: process.cwd(),
  stdio: "inherit"
});
process.exit(run.status ?? 1);
