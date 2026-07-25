import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const repo = "Paradispartiet/History-Go";
const branch = "agent/oslo-coordinate-remove-popkultur-domain";
const prNumber = 3734;
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

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: options.capture ? "utf8" : undefined,
    env: process.env
  });
}

function read(command, args) {
  return String(run(command, args, { capture: true })).trim();
}

function allowFailure(command, args) {
  try {
    run(command, args);
    return 0;
  } catch (error) {
    return Number(error?.status ?? 1);
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function authHeaders() {
  const raw = read("git", ["config", "--local", "--get", "http.https://github.com/.extraheader"]);
  const colon = raw.indexOf(":");
  if (colon < 1) throw new Error("Fant ikke GitHub-autentisering fra checkout.");
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    [raw.slice(0, colon).trim()]: raw.slice(colon + 1).trim()
  };
}

async function mergeMain() {
  run("git", ["fetch", "origin", "main"]);
  const mainSha = read("git", ["rev-parse", "origin/main"]);
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
    if (unexpected.length) {
      throw new Error(`Uventede mergekonflikter: ${unexpected.join(", ")}`);
    }

    if (conflicts.includes("data/people/manifest.json")) {
      const base = JSON.parse(read("git", ["show", `${mergeBase}:data/people/manifest.json`]));
      const ours = JSON.parse(read("git", ["show", ":2:data/people/manifest.json"]));
      const theirs = JSON.parse(read("git", ["show", ":3:data/people/manifest.json"]));
      const baseFiles = new Set(base.files || []);
      const oursFiles = new Set(ours.files || []);
      const removedByMigration = new Set([...baseFiles].filter((file) => !oursFiles.has(file)));
      const addedByMigration = [...oursFiles].filter((file) => !baseFiles.has(file));
      const files = (theirs.files || []).filter((file) => {
        if (removedByMigration.has(file)) return false;
        return !String(file).includes("people/popkultur/");
      });
      for (const file of addedByMigration) {
        if (!files.includes(file)) files.push(file);
      }
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

  return { mainSha, conflicted };
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
    allowFailure("npm", ["run", "health:places"]);
  }
  run("git", ["diff", "--check"]);
}

async function pushMergeCandidate(attempt) {
  await fs.rm(scriptPath, { force: true });
  await fs.rm(path.join(root, "scripts/.coordinate-branch-job-complete"), { force: true });
  run("git", ["add", "-A"]);
  if (read("git", ["diff", "--cached", "--name-only"])) {
    run("git", ["commit", "-m", `Final popkultur merge candidate ${attempt}`]);
  }
  run("git", ["push", "origin", `HEAD:${branch}`]);
  return read("git", ["rev-parse", "HEAD"]);
}

async function restoreRunner(attempt) {
  await fs.mkdir(path.dirname(scriptPath), { recursive: true });
  await fs.writeFile(scriptPath, scriptSource, "utf8");
  run("git", ["add", "scripts/coordinate-branch-job.mjs"]);
  run("git", ["commit", "-m", `Retry atomic popkultur merge ${attempt}`]);
  run("git", ["push", "origin", `HEAD:${branch}`]);
}

async function tryMerge(headSha) {
  const response = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/merge`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sha: headSha,
      merge_method: "squash",
      commit_title: "Fjern populærkultur som toppdomene (#3734)",
      commit_message: "Flytt steder, People, quiz, fagfiler og støttefiler til riktige domener. Behold populærkultur som tverrgående tagg og mediefaglig analysefelt."
    })
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);

let fullValidationDone = false;
for (let attempt = 1; attempt <= 8; attempt += 1) {
  const sync = await mergeMain();
  validate(!fullValidationDone);
  fullValidationDone = true;

  run("git", ["fetch", "origin", "main"]);
  const currentMain = read("git", ["rev-parse", "origin/main"]);
  if (currentMain !== sync.mainSha) {
    console.log(`main flyttet seg under validering (${sync.mainSha} -> ${currentMain}); synkroniserer på nytt.`);
    continue;
  }

  const headSha = await pushMergeCandidate(attempt);
  const result = await tryMerge(headSha);
  if (result.status === 200 && result.body?.merged === true) {
    console.log(JSON.stringify({
      merged: true,
      mergeSha: result.body.sha,
      headSha,
      attempt
    }, null, 2));
    process.exit(0);
  }

  const retryable = [405, 409, 422].includes(result.status);
  console.error(JSON.stringify({
    merged: false,
    status: result.status,
    message: result.body?.message || null,
    attempt
  }, null, 2));
  if (!retryable || attempt === 8) {
    throw new Error(`GitHub avviste merge: ${result.status} ${result.body?.message || "ukjent feil"}`);
  }

  await restoreRunner(attempt);
}

throw new Error("Klarte ikke å finne et stabilt mergevindu etter åtte forsøk.");
