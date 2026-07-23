import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const validatedMigrationCommit = "f2801c08d05546969eb5974d2f2c272498f5b862";
const shown = spawnSync("git", ["show", `${validatedMigrationCommit}:scripts/coordinate-branch-job.mjs`], { encoding: "utf8" });
if (shown.status !== 0) {
  process.stderr.write(shown.stderr ?? "");
  throw new Error("Could not load batch-188 duplicate-retirement implementation");
}

const marker = "// Hard-gate that no active JSON data still references the retired ID exactly or as an embedded legacy identifier.";
if (!shown.stdout.includes(marker)) throw new Error("Could not locate batch-188 preflight marker");
const preflight = `// Rebuild the generated runtime index before scanning for stale legacy references.\nconst preflightIndex = spawnSync("npm", ["run", "places:index:build"], { encoding: "utf8" });\nwriteFileSync(\`\${REPORT_DIR}/preflight-places-index-build.log\`, \`\${preflightIndex.stdout ?? ""}\${preflightIndex.stderr ?? ""}\`, "utf8");\nif (preflightIndex.status !== 0) throw new Error(\`Preflight place-index rebuild failed with exit \${preflightIndex.status}\`);`;
const patched = shown.stdout.replace(marker, `${preflight}\n\n${marker}`);
const replayPath = "/tmp/history-go-batch-188-retire-sagene-kvernhus.mjs";
writeFileSync(replayPath, patched, "utf8");
const run = spawnSync("node", [replayPath], { encoding: "utf8" });
process.stdout.write(run.stdout ?? "");
process.stderr.write(run.stderr ?? "");
if (run.status !== 0) process.exit(run.status ?? 1);
