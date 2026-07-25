import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const branch = "agent/oslo-coordinate-remove-popkultur-domain";
const script = path.join(root, "scripts/coordinate-branch-job.mjs");
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
function read(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", env: process.env }).trim();
}
function allowFailure(command, args) {
  try { run(command, args); return 0; } catch (error) { return Number(error?.status ?? 1); }
}

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["fetch", "origin", "main"]);
const mergeBase = read("git", ["merge-base", "HEAD", "origin/main"]);
let conflicted = false;
try { run("git", ["merge", "--no-edit", "origin/main"]); } catch { conflicted = true; }

if (conflicted) {
  const conflicts = read("git", ["diff", "--name-only", "--diff-filter=U"]).split("\n").filter(Boolean);
  const allowed = new Set(["data/people/manifest.json", ...generatedReports]);
  const unexpected = conflicts.filter((file) => !allowed.has(file));
  if (unexpected.length) throw new Error(`Uventede mergekonflikter: ${unexpected.join(", ")}`);

  if (conflicts.includes("data/people/manifest.json")) {
    const base = JSON.parse(read("git", ["show", `${mergeBase}:data/people/manifest.json`]));
    const ours = JSON.parse(read("git", ["show", ":2:data/people/manifest.json"]));
    const theirs = JSON.parse(read("git", ["show", ":3:data/people/manifest.json"]));
    const baseFiles = new Set(base.files || []);
    const oursFiles = new Set(ours.files || []);
    const removed = new Set([...baseFiles].filter((file) => !oursFiles.has(file)));
    const added = [...oursFiles].filter((file) => !baseFiles.has(file));
    const files = (theirs.files || []).filter((file) => !removed.has(file) && !String(file).includes("people/popkultur/"));
    for (const file of added) if (!files.includes(file)) files.push(file);
    await fs.writeFile(peopleManifestFile, `${JSON.stringify({ ...theirs, files }, null, 2)}\n`, "utf8");
    run("git", ["add", "data/people/manifest.json"]);
  }

  for (const file of generatedReports) {
    if (!conflicts.includes(file)) continue;
    run("git", ["checkout", "--theirs", "--", file]);
    run("git", ["add", file]);
  }
  const unresolved = read("git", ["diff", "--name-only", "--diff-filter=U"]);
  if (unresolved) throw new Error(`Uavklarte konflikter: ${unresolved}`);
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
const healthExit = allowFailure("npm", ["run", "health:places"]);
run("git", ["diff", "--check"]);

await fs.rm(script, { force: true });
await fs.rm(path.join(root, "scripts/.coordinate-branch-job-complete"), { force: true });
run("git", ["add", "-A"]);
if (read("git", ["diff", "--cached", "--name-only"])) run("git", ["commit", "-m", "Final sync before popkultur merge"]);
run("git", ["push", "origin", `HEAD:${branch}`]);
console.log(JSON.stringify({ synced: true, mergeBase, conflicted, healthExit }, null, 2));
