#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPolitikkCompleteChapter } from './audit-politikk-complete-chapter.mjs';

const CONFIG = Object.freeze({
  id: 'parlamentarisme',
  domainId: 'demokrati_representasjon_offentlighet',
  report: 'reports/fagverk/politikk-parlamentarisme-audit.json',
  reportSchema: 'history_go_politikk_chapter_parlamentarisme_audit_v1'
});

export const auditPolitikkParlamentarismeChapter = (options) => auditPolitikkCompleteChapter(CONFIG, options);

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditPolitikkParlamentarismeChapter({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report')
    });
    console.log(`Politikk-kapittel OK: ${report.summary.sectionCount} seksjoner, ${report.summary.claimCount} claims, ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Politikk-kapittel FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
