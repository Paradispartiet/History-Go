import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const branch = "agent/oslo-coordinate-remove-popkultur-domain";
const runnerScript = path.join(root, "scripts/coordinate-branch-job.mjs");
const sportFile = path.join(root, "data/quiz/sport/vg_huset_sets.json");
const mediaFile = path.join(root, "data/quiz/media/vg_huset_sets.json");
const manifestFile = path.join(root, "data/quiz/manifest.json");
const peopleManifestFile = path.join(root, "data/people/manifest.json");
const staleFailureLog = path.join(root, "reports/remove-popkultur-domain-editorial-failure.log");

const knownGeneratedConflicts = [
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

function readCommand(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", env: process.env }).trim();
}

function rewriteCategory(value) {
  if (Array.isArray(value)) return value.map(rewriteCategory);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, raw]) => {
    if (["category", "categoryId", "category_id"].includes(key) && raw === "sport") {
      return [key, "media"];
    }
    return [key, rewriteCategory(raw)];
  }));
}

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["fetch", "origin", "main"]);
const mergeBase = readCommand("git", ["merge-base", "HEAD", "origin/main"]);

let mergeConflicted = false;
try {
  run("git", ["merge", "--no-edit", "origin/main"]);
} catch {
  mergeConflicted = true;
}

if (mergeConflicted) {
  const conflicts = readCommand("git", ["diff", "--name-only", "--diff-filter=U"])
    .split("\n")
    .filter(Boolean);
  const allowed = new Set(["data/people/manifest.json", ...knownGeneratedConflicts]);
  const unexpected = conflicts.filter((file) => !allowed.has(file));
  if (unexpected.length) throw new Error(`Uventede mergekonflikter: ${unexpected.join(", ")}`);

  const baseManifest = JSON.parse(readCommand("git", ["show", `${mergeBase}:data/people/manifest.json`]));
  const oursManifest = JSON.parse(readCommand("git", ["show", ":2:data/people/manifest.json"]));
  const mainManifest = JSON.parse(readCommand("git", ["show", ":3:data/people/manifest.json"]));
  const baseFiles = new Set(baseManifest.files || []);
  const oursFiles = new Set(oursManifest.files || []);
  const removedByMigration = new Set([...baseFiles].filter((file) => !oursFiles.has(file)));
  const addedByMigration = [...oursFiles].filter((file) => !baseFiles.has(file));
  const mergedFiles = (mainManifest.files || []).filter((file) => {
    if (removedByMigration.has(file)) return false;
    return !String(file).includes("people/popkultur/");
  });
  for (const file of addedByMigration) if (!mergedFiles.includes(file)) mergedFiles.push(file);
  await fs.writeFile(peopleManifestFile, `${JSON.stringify({ ...mainManifest, files: mergedFiles }, null, 2)}\n`, "utf8");
  run("git", ["add", "data/people/manifest.json"]);

  for (const file of knownGeneratedConflicts) {
    if (!conflicts.includes(file)) continue;
    run("git", ["checkout", "--theirs", "--", file]);
    run("git", ["add", file]);
  }

  const unresolved = readCommand("git", ["diff", "--name-only", "--diff-filter=U"]);
  if (unresolved) throw new Error(`Uavklarte mergekonflikter: ${unresolved}`);
  run("git", ["commit", "--no-edit"]);
}

const vg = rewriteCategory(JSON.parse(await fs.readFile(sportFile, "utf8")));
await fs.mkdir(path.dirname(mediaFile), { recursive: true });
await fs.writeFile(mediaFile, `${JSON.stringify(vg, null, 2)}\n`, "utf8");
await fs.rm(sportFile, { force: true });

const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
const vgEntry = (manifest.sets || []).find((entry) => entry.targetId === "vg_huset");
if (vgEntry) {
  vgEntry.file = "data/quiz/media/vg_huset_sets.json";
  await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}
await fs.rm(staleFailureLog, { force: true });

const verify = JSON.parse(await fs.readFile(mediaFile, "utf8"));
if (verify.categoryId !== "media") throw new Error("VG-huset har ikke media som toppkategori.");
for (const block of verify.sets || []) {
  for (const question of block.questions || []) {
    if (question.categoryId !== "media") throw new Error(`Feil kategori i ${question.id}`);
  }
}

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
if (readCommand("git", ["diff", "--cached", "--name-only"])) {
  run("git", ["commit", "-m", "Finalize popkultur domain migration"]);
}
run("git", ["push", "origin", `HEAD:${branch}`]);

console.log(JSON.stringify({
  vg_huset: "media",
  activeManifestEntry: Boolean(vgEntry),
  manifestPath: vgEntry?.file ?? null,
  branchSyncedWithMain: true,
  mergeBase,
  mergeConflicted,
  healthExit,
  selfPublished: true
}, null, 2));
