import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const tempScript = path.join(ROOT, "scripts", ".remove-popkultur-domain-runner.mjs");
const sourceUrl = "https://raw.githubusercontent.com/Paradispartiet/History-Go/667fc1d0c72c1227b2a079148ddbb9bab8d0eb5d/scripts/remove-popkultur-domain.mjs";

function run(command, args) {
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
}

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Kunne ikke hente migreringsscript: ${response.status} ${response.statusText}`);
}

let source = await response.text();
source = source.replace("await audit();", "");
source = source.replace("await writeReport();", "await writeReport();\nexport { audit };");
await fs.writeFile(tempScript, source, "utf8");

try {
  const moduleUrl = `${pathToFileURL(tempScript).href}?run=${Date.now()}`;
  const migration = await import(moduleUrl);

  run("npm", ["run", "places:index:build"]);
  run("npm", ["run", "build:web"]);
  run("npm", ["run", "build:web:check"]);
  run("npm", ["run", "typecheck:web"]);

  if (typeof migration.audit !== "function") {
    throw new Error("Migreringsscriptet eksporterte ikke audit-funksjonen.");
  }
  await migration.audit();
} finally {
  await fs.rm(tempScript, { force: true });
}
