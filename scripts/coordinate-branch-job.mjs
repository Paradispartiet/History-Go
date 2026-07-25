import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const branch = "agent/oslo-coordinate-remove-popkultur-domain";
const scriptPath = path.join(root, "scripts/coordinate-branch-job.mjs");
const scriptSource = await fs.readFile(scriptPath, "utf8");
const peopleManifestPath = path.join(root, "data/people/manifest.json");
const generatedReports = [
  "reports/coordinate-evidence-audit.md",
  "reports/people-of-places-status.json",
  "reports/people-of-places-status.md",
  "reports/place-coordinate-intake-gate.md",
  "reports/place-coordinate-quality-gate.md"
];

function run(command, args, { capture = false, allowFailure = false } = {}) {
  try {
    return execFileSync(command, args, {
      cwd: root,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      encoding: capture ? "utf8" : undefined,
      env: process.env
    });
  } catch (error) {
    if (allowFailure) return null;
    throw error;
  }
}

function read(command, args) {
  return String(run(command, args, { capture: true })).trim();
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function mergeLatestMain() {
  run("git", ["fetch", "origin", "main"]);
  const mainSha = read("git", ["rev-parse", "origin/main"]);
  if (run("git", ["merge-base", "--is-ancestor", "origin/main", "HEAD"], { allowFailure: true }) !== null) {
    return { mainSha, conflicted: false, alreadyContained: true };
  }

  const mergeBase = read("git", ["merge-base", "HEAD", "origin/main"]);
  let conflicted = false;
  try {
    run("git", ["merge", "--no-edit", "origin/main"]);
  } catch {
    conflicted = true;
  }

  if (conflicted) {
    const conflicts = read("git", ["diff", "--name-only", "--diff-filter=U"])
      .split("\n")
      .filter(Boolean);
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
      await writeJson(peopleManifestPath, { ...theirs, files });
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

  return { mainSha, conflicted, alreadyContained: false };
}

function validate(full) {
  run("npm", ["run", "build:web"]);
  run("npm", ["run", "typecheck:web"]);
  run("npm", ["run", "audit:categories"]);
  run("npm", ["run", "audit:people-of-places"]);
  run("npm", ["run", "places:emner:check"]);
  run("npm", ["run", "places:index:build"]);
  run("npm", ["run", "audit:places-split-manifest-sync"]);
  run("npm", ["run", "places:index:check"]);
  if (full) {
    run("npm", ["run", "test:coordinate-source-contract"]);
    run("npm", ["run", "places:coords:quality"]);
    run("npm", ["run", "places:coords:intake"]);
    run("npm", ["run", "places:coords:evidence:audit"]);
    run("npm", ["run", "health:places"], { allowFailure: true });
  }
  run("git", ["diff", "--check"]);
}

async function commitAndPushBranch(attempt) {
  await fs.rm(scriptPath, { force: true });
  await fs.rm(path.join(root, "scripts/.coordinate-branch-job-complete"), { force: true });
  run("git", ["add", "-A"]);
  if (read("git", ["diff", "--cached", "--name-only"])) {
    run("git", ["commit", "-m", `Final synchronized popkultur migration ${attempt}`]);
  }
  run("git", ["push", "origin", `HEAD:${branch}`]);
}

async function restoreRunner(attempt) {
  await fs.mkdir(path.dirname(scriptPath), { recursive: true });
  await fs.writeFile(scriptPath, scriptSource, "utf8");
  run("git", ["add", "scripts/coordinate-branch-job.mjs"]);
  run("git", ["commit", "-m", `Retry final popkultur fast-forward ${attempt}`]);
  run("git", ["push", "origin", `HEAD:${branch}`]);
}

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);

let fullValidated = false;
for (let attempt = 1; attempt <= 12; attempt += 1) {
  const sync = await mergeLatestMain();
  validate(!fullValidated);
  fullValidated = true;

  run("git", ["fetch", "origin", "main"]);
  const latestMain = read("git", ["rev-parse", "origin/main"]);
  if (latestMain !== sync.mainSha) {
    console.log(`main flyttet seg under validering (${sync.mainSha} -> ${latestMain}); prøver igjen.`);
    continue;
  }

  await commitAndPushBranch(attempt);
  const pushed = run("git", ["push", "origin", "HEAD:main"], { allowFailure: true });
  if (pushed !== null) {
    console.log(JSON.stringify({
      mergedByFastForward: true,
      mainSha: read("git", ["rev-parse", "HEAD"]),
      attempt
    }, null, 2));
    process.exit(0);
  }

  if (attempt === 12) break;
  await restoreRunner(attempt);
}

await restoreRunner(12).catch(() => {});
throw new Error("Klarte ikke å fast-forwarde main etter tolv forsøk.");
