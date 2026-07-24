import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PINNED_RESEARCH_URL = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/179b04c9ce4c46cfe353e7942479252b40a17743/scripts/coordinate-branch-job.mjs';

const response = await fetch(PINNED_RESEARCH_URL, {
  headers: {
    'user-agent': 'History-Go coordinate research replay/1.0',
    accept: 'text/plain,*/*;q=0.8',
  },
});
if (!response.ok) throw new Error(`Could not fetch pinned Frognerstranda research script: ${response.status} ${response.statusText}`);
const script = await response.text();
if (script.length < 15_000 || !script.includes("const PLACE_ID = 'frognerstranda';") || !script.includes("const EXPECTED_MAX_BATCH = 194;")) {
  throw new Error(`Pinned Frognerstranda script failed identity gate: length=${script.length}`);
}
const temporaryScript = '/tmp/history-go-frognerstranda-scope-research-post-194.mjs';
writeFileSync(temporaryScript, script, 'utf8');
const run = spawnSync(process.execPath, [temporaryScript], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});
if (run.error) throw run.error;
if (run.status !== 0) process.exit(run.status ?? 1);
