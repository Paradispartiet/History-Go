import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testsDir, "..");
const sourceAuditScript = path.join(repoRoot, "scripts", "audit-civication-fwg-governance.mjs");
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "civication-fwg-conflict-bindings-"));

function writeJson(rel, value) {
  const target = path.join(fixtureRoot, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

try {
  const fixtureAuditScript = path.join(fixtureRoot, "scripts", "audit-civication-fwg-governance.mjs");
  fs.mkdirSync(path.dirname(fixtureAuditScript), { recursive: true });
  fs.copyFileSync(sourceAuditScript, fixtureAuditScript);

  writeJson("data/Civication/workGrammars/fixture/conflict_binding.json", {
    schema: "civication_work_grammar_v2",
    version: 2,
    category: "fixture",
    role_scope: "conflict_binding",
    conflict_grammar: [
      {
        id: "declared_conflict",
        axis: "declared_axis",
        pressure: "declared_pressure",
        mail_families: ["bound_family"]
      }
    ]
  });

  writeJson("data/Civication/mailFamilies/fixture/conflict/conflict_binding_conflict.json", {
    schema: "civication_mail_family_catalog_v1",
    version: 1,
    category: "fixture",
    role_scope: "conflict_binding",
    mail_type: "conflict",
    families: [
      {
        id: "bound_family",
        mails: [
          {
            id: "fixture_bound_conflict",
            mail_type: "conflict",
            mail_family: "bound_family",
            pressure: "runtime_specific_pressure"
          }
        ]
      },
      {
        id: "unbound_family",
        mails: [
          {
            id: "fixture_unbound_conflict",
            mail_type: "conflict",
            mail_family: "unbound_family",
            pressure: "genuinely_unbound_pressure"
          }
        ]
      }
    ]
  });

  execFileSync(process.execPath, [fixtureAuditScript], { cwd: fixtureRoot, stdio: "pipe" });
  const report = fs.readFileSync(path.join(fixtureRoot, "docs", "CIVICATION_FWG_GOVERNANCE.md"), "utf8");

  assert.ok(
    !report.includes(
      "konflikt-mail fixture_bound_conflict har pressure 'runtime_specific_pressure' uten forankring i conflict_grammar"
    ),
    "an explicitly declared conflict mail_family must anchor the mail even when pressure uses a more specific runtime label"
  );

  assert.ok(
    report.includes(
      "konflikt-mail fixture_unbound_conflict har pressure 'genuinely_unbound_pressure' uten forankring i conflict_grammar"
    ),
    "an unbound conflict pressure must remain visible as governance debt"
  );

  console.log("civication-fwg-governance-conflict-bindings.test.js: OK");
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
