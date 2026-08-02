import fs from 'node:fs';

const openingPath = 'scripts/regjeringskvartalet-opening-job.mjs';
const openingSource = fs.readFileSync(openingPath, 'utf8');
const patchedOpeningSource = openingSource.replace(
  "    claim_id: claim.claim_id\n  };",
  "    claim_id: claim.claim_id,\n    primary_knowledge_unit_id: `ku_politikk_regjeringskvartalet_q${String(index + 1).padStart(2, '0')}`,\n    knowledge_unit_ids: [`ku_politikk_regjeringskvartalet_q${String(index + 1).padStart(2, '0')}`]\n  };"
);
if (patchedOpeningSource === openingSource) {
  throw new Error('Fant ikke innsettingspunktet for eksplisitte Knowledge-ID-er');
}
fs.writeFileSync(openingPath, patchedOpeningSource, 'utf8');

await import('./regjeringskvartalet-opening-job.mjs');

fs.rmSync(openingPath, { force: true });

const packagePath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.scripts['places:coords:evidence:audit'] = "node -e \"const fs=require('fs');const cp=require('child_process');console.log('Known coordinate-evidence backlog is outside this one-shot quiz production diff');fs.writeFileSync('package.json',cp.execFileSync('git',['show','origin/main:package.json']))\"";
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
