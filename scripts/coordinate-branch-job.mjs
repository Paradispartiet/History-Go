import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const branch = "agent/oslo-coordinate-remove-popkultur-domain";
const runnerScript = path.join(root, "scripts/coordinate-branch-job.mjs");
const peopleManifestFile = path.join(root, "data/people/manifest.json");

const generatedReports = [
  "reports/coordinate-evidence-audit.md",
  "reports/people-of-places-status.json",
  "reports/people-of-places-status.md",
  "reports/place-coordinate-intake-gate.md",
  "reports/place-coordinate-quality-gate.md"
];

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
}

function runAllowFailure(command, args) {
  try {
    run(command, args);
    return 0;
  } catch (error) {
    return Number(error?.status ?? 1);
  }
}

function read(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", env: process.env }).trim();
}

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["fetch", "origin", "main"]);

const mergeBase = read("git", ["merge-base", "HEAD", "origin/main"]);
let mergeConflicted = false;

try {
  run("git", ["merge", "--no-edit", "origin/main"]);
} catch {
  mergeConflicted = true;
}

if (mergeConflicted) {
  const conflicts = read("git", ["diff", "--name-only", "--diff-filter=U"])
    .split("\n")
    .filter(Boolean);
  const allowed = new Set(["data/people/manifest.json", ...generatedReports]);
  const unexpected = conflicts.filter((file) => !allowed.has(file));
  if (unexpected.length) {
    throw new Error(`Uventede mergekonflikter: ${unexpected.join(", ")}`);
  }

  const baseManifest = JSON.parse(read("git", ["show", `${mergeBase}:data/people/manifest.json`]));
  const oursManifest = JSON.parse(read("git", ["show", ":2:data/people/manifest.json"]));
  const mainManifest = JSON.parse(read("git", ["show", ":3:data/people/manifest.json"]));

  const baseFiles = new Set(baseManifest.files || []);
  const oursFiles = new Set(oursManifest.files || []);
  const removedByMigration = new Set([...baseFiles].filter((file) => !oursFiles.has(file)));
  const addedByMigration = [...oursFiles].filter((file) => !baseFiles.has(file));

  const mergedFiles = (mainManifest.files || []).filter((file) => {
    if (removedByMigration.has(file)) return false;
    return !String(file).includes("people/popkultur/");
  });
  for (const file of addedByMigration) {
    if (!mergedFiles.includes(file)) mergedFiles.push(file);
  }

  await fs.writeFile(
    peopleManifestFile,
    `${JSON.stringify({ ...mainManifest, files: mergedFiles }, null, 2)}\n`,
    "utf8"
  );
  run("git", ["add", "data/people/manifest.json"]);

  for (const file of generatedReports) {
    if (!conflicts.includes(file)) continue;
    run("git", ["checkout", "--theirs", "--", file]);
    run("git", ["add", file]);
  }

  const unresolved = read("git", ["diff", "--name-only", "--diff-filter=U"]);
  if (unresolved) throw new Error(`Uavklarte mergekonflikter: ${unresolved}`);
  run("git", ["commit", "--no-edit"]);
}

run("npm", ["run", "build:web"]);
run("npm", ["run", "typecheck:web"]);
run("npm", ["run", "audit:categories"]);
run("npm", ["run", "audit:people-of-places"]);
run("npm", ["run", "places:emner:check"]);
run("npm", ["run", "places:index:build"]);
run("npm", ["run", "audit:places-split-manifest-sync"]);
run("npm", ["run", "places:index:check"]);
run("npm", ["run", "test:coordinate-source-contract"]);
run("npm", ["run", "places:coords:quality"]);
run("npm", ["run", "places:coords:intake"]);
run("npm", ["run", "places:coords:evidence:audit"]);
const healthExit = runAllowFailure("npm", ["run", "health:places"]);
run("git", ["diff", "--check"]);

await fs.rm(runnerScript, { force: true });
await fs.rm(path.join(root, "scripts/.coordinate-branch-job-complete"), { force: true });
run("git", ["add", "-A"]);
if (read("git", ["diff", "--cached", "--name-only"])) {
  run("git", ["commit", "-m", "Sync popkultur migration with main"]);
}
run("git", ["push", "origin", `HEAD:${branch}`]);

console.log(JSON.stringify({
  branchSyncedWithMain: true,
  mergeBase,
  mergeConflicted,
  healthExit,
  selfPublished: true
}, null, 2));
