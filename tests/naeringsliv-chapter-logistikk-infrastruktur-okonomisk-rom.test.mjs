import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

test("Logistikk, infrastruktur og økonomisk rom passes its permanent chapter gate", () => {
  const result = spawnSync(process.execPath, ["scripts/audit-naeringsliv-chapter-logistikk-infrastruktur-okonomisk-rom.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /PASS logistikk-infrastruktur-okonomisk-rom/);
  const report = JSON.parse(fs.readFileSync("reports/fagverk/naeringsliv-logistikk-infrastruktur-okonomisk-rom-audit.json", "utf8"));
  assert.equal(report.status, "PASSED");
  assert.deepEqual(report.counts, {
    emner: 3,
    methods: 9,
    modules: 3,
    sections: 9,
    paragraphs: 27,
    claims: 42,
    sources: 22,
    workedExamples: 2,
    misconceptions: 5,
    applicationTasks: 3,
    selfCheck: 8,
    relatedPlaces: 6,
  });
});
