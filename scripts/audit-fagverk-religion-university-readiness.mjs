#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installReligionMilestoneReadCompatibility } from './lib/religion-milestone-compat.mjs';

installReligionMilestoneReadCompatibility();
const legacy = await import('./milestone-audit-fagverk-religion-university-readiness.mjs');
const run = (options = {}) => legacy.auditReligionUniversityReadiness(options);
export const auditReligionUniversityReadiness = run;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { report } = run();
    console.log(`Religion readiness milestone OK: ${report.target.universityAreaCount}/12 områder, ${report.target.canonicalTopicCount}/72 emner.`);
  } catch (error) {
    console.error(`Religion readiness milestone FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
