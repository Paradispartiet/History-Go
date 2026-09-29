import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testsDir, "..");
const auditScript = path.join(repoRoot, "scripts", "audit-civication-fwg-governance.mjs");
const reportPath = path.join(repoRoot, "docs", "CIVICATION_FWG_GOVERNANCE.md");

execFileSync(process.execPath, [auditScript], { cwd: repoRoot, stdio: "pipe" });
const report = fs.readFileSync(reportPath, "utf8");

assert.ok(
  !report.includes(
    "konflikt-mail film_tv_manus_conflict_motstridende_001 har pressure 'motstridende_bestillinger' uten forankring i conflict_grammar"
  ),
  "an explicitly declared conflict mail_family must anchor the mail even when pressure uses a more specific runtime label"
);

assert.ok(
  report.includes(
    "konflikt-mail film_tv_manus_realism_author_response_001 har pressure 'ny_versjon_vs_uforlost_brief' uten forankring i conflict_grammar"
  ),
  "an unbound conflict pressure must remain visible as governance debt"
);

assert.ok(
  report.includes(
    "konflikt-mail film_tv_program_conflict_premiss_001 har pressure 'skarphet_vs_kildestatus' uten forankring i conflict_grammar"
  ),
  "the compatibility rule must not suppress unrelated unbound conflict mismatches"
);

console.log("civication-fwg-governance-conflict-bindings.test.js: OK");
