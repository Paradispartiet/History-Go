import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const templatePath = path.join(root, "scripts/apply-knowledge-core-cleanup.ts");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "history-go-knowledge-core-"));
const tempSource = path.join(tempRoot, "apply-knowledge-core-cleanup.ts");
const outDir = path.join(tempRoot, "dist");

const template = fs.readFileSync(templatePath, "utf8");
const corrected = template.replace("${sourceId}", "\\${sourceId}");
if (corrected === template) throw new Error("Knowledge migration template placeholder was not found");
fs.writeFileSync(tempSource, corrected);

const tsc = process.platform === "win32" ? "npx.cmd" : "npx";
execFileSync(tsc, [
  "tsc",
  tempSource,
  "--target", "ES2022",
  "--module", "CommonJS",
  "--moduleResolution", "Node",
  "--types", "node",
  "--esModuleInterop",
  "--skipLibCheck",
  "--outDir", outDir
], { cwd: root, stdio: "inherit" });

const compiled = path.join(outDir, "apply-knowledge-core-cleanup.js");
execFileSync(process.execPath, [compiled], { cwd: root, stdio: "inherit" });
