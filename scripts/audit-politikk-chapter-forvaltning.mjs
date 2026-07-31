#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPolitikkCompleteChapter } from './audit-politikk-complete-chapter.mjs';

const CONFIG = Object.freeze({
  id: 'forvaltning',
  domainId: 'styring_institusjoner_forvaltning',
  report: 'reports/fagverk/politikk-forvaltning-audit.json',
  reportSchema: 'history_go_politikk_chapter_forvaltning_audit_v1'
});

export const auditPolitikkForvaltningChapter = (options) => auditPolitikkCompleteChapter(CONFIG, options);

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditPolitikkForvaltningChapter({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report')
    });
    console.log(`Politikk-kapittel OK: ${report.summary.sectionCount} seksjoner, ${report.summary.claimCount} claims, ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Politikk-kapittel FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
