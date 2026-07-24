#!/usr/bin/env node
import { promises as fs } from "node:fs";
import process from "node:process";
import { buildQuizNormalOpeningMigrationInventory } from "./build-quiz-normal-opening-migration-inventory.mjs";

const INVENTORY_PATH = "reports/quiz-normal-opening-migration-inventory.json";
const CONTENT_REPORT_PATH = "reports/quiz-content-quality.json";
const MARKDOWN_PATH = "reports/quiz-normal-opening-migration-inventory.md";

let pass = 0;
function ok(value, message) {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass += 1;
}

function stableFileView(item) {
  return {
    file: item.file,
    status: item.status,
    targetIds: item.targetIds,
    registrationSources: item.registrationSources,
    activeProductionTargets: item.activeProductionTargets,
    discoveredInRepository: item.discoveredInRepository,
    exists: item.exists,
    parseError: item.parseError,
    opening: {
      actualSetCount: item.opening.actualSetCount,
      setQuestionCounts: item.opening.setQuestionCounts,
      structuralViolations: item.opening.structuralViolations,
      questionViolationCount: item.opening.questionViolationCount,
      compliant: item.opening.compliant
    },
    content: {
      scannedQuestions: item.content.scannedQuestions,
      templateViolations: item.content.templateViolations,
      theoryQuestions: item.content.theoryQuestions,
      balanceViolations: item.content.balanceViolations,
      optionLengthSignals: item.content.optionLengthSignals,
      repeatedOpeningSignals: item.content.repeatedOpeningSignals
    },
    migrationRequired: item.migrationRequired,
    contentReviewRequired: item.contentReviewRequired,
    priorityScore: item.priorityScore
  };
}

async function main() {
  const [inventoryText, contentText, markdown, rebuilt] = await Promise.all([
    fs.readFile(INVENTORY_PATH, "utf8"),
    fs.readFile(CONTENT_REPORT_PATH, "utf8"),
    fs.readFile(MARKDOWN_PATH, "utf8"),
    buildQuizNormalOpeningMigrationInventory({ writeReports: false })
  ]);

  const inventory = JSON.parse(inventoryText);
  const contentReport = JSON.parse(contentText);
  const current = rebuilt.inventory;

  ok(inventory.schema === "history_go_quiz_normal_opening_migration_inventory_v1", "Inventaret har riktig schema");
  ok(Boolean(inventory.generatedAt), "Inventaret har genereringstid");
  ok(markdown.includes("# Quiz: migreringskø for global 2 × 7-normalåpning"), "Markdownrapporten har riktig tittel");
  ok(markdown.includes("Høyest prioriterte migreringskø"), "Markdownrapporten viser prioritert kø");

  ok(JSON.stringify(inventory.summary) === JSON.stringify(current.summary), "Lagret sammendrag matcher ny discovery");
  ok(JSON.stringify(inventory.contentAuditSummary) === JSON.stringify(current.contentAuditSummary), "Lagret innholdsaudit matcher ny kjøring");
  ok(JSON.stringify(contentReport.summary) === JSON.stringify(current.contentAuditSummary), "Full innholdsrapport matcher inventarets sammendrag");

  ok(inventory.summary.activeProductionTargets > 0, "Aktive produksjonsmål er oppdaget");
  ok(inventory.summary.activeProductionTargets === inventory.summary.activeProductionCompliant, "Alle aktive produksjonsmål består global 2 × 7");
  ok(inventory.summary.missingFiles === 0, "Ingen registrerte quizfiler mangler");
  ok(inventory.summary.parseErrors === 0, "Ingen registrerte eller oppdagede set-filer har JSON-feil");
  ok(inventory.summary.uniqueFiles >= inventory.summary.manifestEntries, "Inventaret dekker minst alle manifestoppføringer");
  ok(inventory.summary.discoveredSetFiles > inventory.summary.activeProductionFiles, "Inventaret finner flere set-filer enn de aktive produksjonsfilene");

  const storedFiles = inventory.files.map(stableFileView);
  const currentFiles = current.files.map(stableFileView);
  ok(JSON.stringify(storedFiles) === JSON.stringify(currentFiles), "Alle filposter matcher ny discovery og audit");

  const fileSet = new Set(inventory.files.map((item) => item.file));
  ok(fileSet.size === inventory.files.length, "Inventaret har ingen dupliserte filposter");
  ok(inventory.files.every((item) => Array.isArray(item.registrationSources)), "Alle filposter har registreringskilder");
  ok(inventory.files.filter((item) => item.status === "active_production").every((item) => item.opening.compliant), "Alle aktive produksjonsfiler består åpningskontrollen");
  ok(inventory.files.filter((item) => item.status === "active_production").every((item) => item.activeProductionTargets.length > 0), "Aktive produksjonsfiler har eksplisitte mål");
  ok(inventory.files.filter((item) => item.status === "pending_manifest_addition").every((item) => item.registrationSources.includes("manifest_addition")), "Ventende manifesttillegg er korrekt klassifisert");
  ok(inventory.files.filter((item) => item.status === "manifest_only").every((item) => item.registrationSources.includes("manifest")), "Manifest-only-filer er korrekt klassifisert");
  ok(inventory.files.filter((item) => item.status === "unregistered_set_file").every((item) => item.discoveredInRepository), "Uregistrerte filer er fysisk oppdaget i repoet");

  const queueFiles = inventory.queue.map((item) => item.file);
  ok(new Set(queueFiles).size === queueFiles.length, "Migreringskøen har ingen duplikater");
  ok(inventory.queue.every((item) => item.migrationRequired || item.contentReviewRequired), "Alle køposter krever migrering eller innholdsgjennomgang");
  ok(inventory.queue.every((item, index, queue) => index === 0 || queue[index - 1].priorityScore >= item.priorityScore), "Migreringskøen er sortert etter fallende prioritet");
  ok(inventory.queue.every((item) => fileSet.has(item.file)), "Alle køposter finnes i filinventaret");
  ok(JSON.stringify(inventory.queue.map(stableFileView)) === JSON.stringify(current.queue.map(stableFileView)), "Lagret kø matcher ny prioriteringskjøring");

  const contentFiles = new Set((contentReport.groups || []).map((group) => group.file));
  ok(inventory.files.filter((item) => item.exists && !item.parseError).every((item) => contentFiles.has(item.file) || item.content.scannedQuestions === 0), "Innholdsauditen og inventaret er krysskoblet");

  console.log(`PASS: ${pass}`);
  console.log("RESULTAT: PASS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
