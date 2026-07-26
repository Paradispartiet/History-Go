import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = resolve(process.env.GITHUB_WORKSPACE ?? process.cwd());
const exportDir = resolve(repoRoot, "reports/documentation-governance/source-export");
mkdirSync(exportDir, { recursive: true });
copyFileSync(resolve(repoRoot, "docs/README.md"), resolve(exportDir, "README.md"));
copyFileSync(
  resolve(repoRoot, "docs/documentation_registry.json"),
  resolve(exportDir, "documentation_registry.json"),
);

const originalSource = execFileSync(
  "git",
  ["show", "HEAD^1:scripts/check-documentation-governance.mts"],
  { cwd: repoRoot, encoding: "utf8" },
);
const temporaryChecker = resolve(repoRoot, ".tmp-check-documentation-governance-original.mts");
writeFileSync(temporaryChecker, originalSource, "utf8");

execFileSync(
  process.execPath,
  ["--experimental-strip-types", temporaryChecker],
  { cwd: repoRoot, env: process.env, stdio: "inherit" },
);
