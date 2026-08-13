#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateReligionAreaCurrentState } from './lib/religion-area-current-validator.mjs';

const CONFIG = {
  'audit-fagverk-religion-society-politics-law-articles-v1.mjs': ['society_politics_law', 'reports/fagverk/religion-society-politics-law-articles-v1-audit.json'],
  'audit-fagverk-religion-lived-identity-migration-articles-v1.mjs': ['lived_identity_migration', 'reports/fagverk/religion-lived-identity-migration-articles-v1-audit.json'],
  'audit-fagverk-religion-secular-new-media-articles-v1.mjs': ['secular_new_media', 'reports/fagverk/religion-secular-new-media-articles-v1-audit.json'],
  'audit-fagverk-religion-nature-science-ethics-articles-v1.mjs': ['nature_science_ethics', 'reports/fagverk/religion-nature-science-ethics-articles-v1-audit.json']
};
const basename = path.basename(fileURLToPath(import.meta.url));
const config = CONFIG[basename];
if (!config) throw new Error(`Ukjent Religion area-wrapper: ${basename}`);
const run = () => validateReligionAreaCurrentState({ areaId: config[0], reportPath: config[1] });

export const auditReligionSocietyPoliticsLawArticles = run;
export const auditReligionLivedIdentityMigrationArticles = run;
export const auditReligionSecularNewMediaArticles = run;
export const auditReligionNatureScienceEthicsArticles = run;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { report } = run();
    console.log(`Religion current-state area audit OK: ${report.status || config[0]}`);
  } catch (error) {
    console.error(`Religion current-state area audit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
