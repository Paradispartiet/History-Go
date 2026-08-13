#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installReligionMilestoneReadCompatibility } from './lib/religion-milestone-compat.mjs';

installReligionMilestoneReadCompatibility();
const basename = path.basename(fileURLToPath(import.meta.url));
const legacy = await import(new URL(`./milestone-${basename}`, import.meta.url));
const auditImpl = Object.entries(legacy).find(([name, value]) => name.startsWith('auditReligion') && typeof value === 'function')?.[1];
if (!auditImpl) throw new Error(`Mangler Religion milestone-audit i milestone-${basename}`);
const run = (options = {}) => auditImpl(options);

export const auditReligionPilot = run;
export const auditReligionTheoryMethodArticles = run;
export const auditReligionHistoryComparisonArticles = run;
export const auditReligionAbrahamicTraditionsArticles = run;
export const auditReligionSouthAsianArticles = run;
export const auditReligionEastAsianArticles = run;
export const auditReligionIndigenousSamiArticles = run;
export const auditReligionRitualMaterialitySpaceArticles = run;
export const auditReligionTextsMythsAuthorityArticles = run;
export const auditReligionSocietyPoliticsLawArticles = run;
export const auditReligionLivedIdentityMigrationArticles = run;
export const auditReligionSecularNewMediaArticles = run;
export const auditReligionNatureScienceEthicsArticles = run;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { report } = run();
    console.log(`Religion milestone-audit OK: ${report.status || basename}`);
  } catch (error) {
    console.error(`Religion milestone-audit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
