import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const source = execFileSync(
  "git",
  ["show", "HEAD^:scripts/coordinate-branch-job.mjs"],
  { encoding: "utf8" }
);

const patched = source
  .replaceAll(
    'run("node", ["dist/tools/audit-oslo-people-coverage.mjs"]);',
    'run("node", ["--experimental-strip-types", "tools/audit-oslo-people-coverage.mts"]);'
  )
  .replaceAll(
    'run("node", ["dist/tools/audit-oslo-latent-people-coverage.mjs"]);',
    'run("node", ["--experimental-strip-types", "tools/audit-oslo-latent-people-coverage.mts"]);'
  );

if (patched === source) {
  throw new Error("Fant ikke Oslo People audit-kallene som skulle repareres.");
}

const runtimePath = "scripts/.coordinate-branch-job-batch9-runtime.mjs";
fs.writeFileSync(runtimePath, patched, "utf8");
try {
  await import(`${pathToFileURL(`${process.cwd()}/${runtimePath}`).href}?v=${Date.now()}`);
} finally {
  fs.rmSync(runtimePath, { force: true });
}
