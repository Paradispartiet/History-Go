import { execFileSync } from "node:child_process";

const root = process.cwd();

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
}

function read(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", env: process.env }).trim();
}

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["fetch", "origin", "main"]);

try {
  run("git", ["merge", "--no-edit", "origin/main"]);
  console.log("MERGE_CLEAN");
} catch {
  const conflicts = read("git", ["diff", "--name-only", "--diff-filter=U"])
    .split("\n")
    .filter(Boolean);
  console.error(JSON.stringify({ conflicts }, null, 2));
  throw new Error(`Main merge conflicts: ${conflicts.join(", ")}`);
}
