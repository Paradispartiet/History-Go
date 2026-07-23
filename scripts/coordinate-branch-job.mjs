import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const validatedImplementationCommit = "b827f8c5565c14dd38a39e84dd94d476f06e9747";
const shown = spawnSync(
  "git",
  ["show", `${validatedImplementationCommit}:scripts/coordinate-branch-job.mjs`],
  { encoding: "utf8" }
);
if (shown.status !== 0) {
  process.stderr.write(shown.stderr ?? "");
  throw new Error("Could not load the validated batch 187 implementation");
}

const replayPath = "/tmp/history-go-batch-187-akershus-energipark.mjs";
writeFileSync(replayPath, shown.stdout, "utf8");
const replay = spawnSync("node", [replayPath], { encoding: "utf8" });
process.stdout.write(replay.stdout ?? "");
process.stderr.write(replay.stderr ?? "");
if (replay.status !== 0) process.exit(replay.status ?? 1);
