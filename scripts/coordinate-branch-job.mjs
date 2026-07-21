import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_COMMIT = 'c85006f008774a4c9badd18dfa8f5f8e9b32698d';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_RUNNER = path.join(ROOT, 'scripts/.safe-six-migration-fixed.mjs');

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], {
  cwd: ROOT,
  encoding: 'utf8'
});

const badScript = "'places:emners:check'";
if (!source.includes(badScript)) {
  throw new Error('Expected stale places:emners:check call was not found in source runner');
}
source = source.replace(badScript, "'places:emner:check'");

const oldArrayRewrite = `    if (PHYSICAL_REF_ARRAY_KEYS.has(key) && Array.isArray(raw)) {
      const next = raw.map((item) => typeof item === 'string' && ID_MAP.has(item) ? ID_MAP.get(item) : item);
      out[key] = dedupeStrings(next);
      next.forEach((item, i) => {
        const old = raw[i];
        if (typeof old === 'string' && ID_MAP.has(old)) actions.push({ path: [...pathParts, key, String(i)].join('.'), oldId: old, newId: item });
      });
      continue;
    }`;
const newArrayRewrite = `    if (PHYSICAL_REF_ARRAY_KEYS.has(key) && Array.isArray(raw) && raw.every((item) => typeof item === 'string')) {
      const next = raw.map((item) => ID_MAP.has(item) ? ID_MAP.get(item) : item);
      out[key] = dedupeStrings(next);
      next.forEach((item, i) => {
        const old = raw[i];
        if (ID_MAP.has(old)) actions.push({ path: [...pathParts, key, String(i)].join('.'), oldId: old, newId: item });
      });
      continue;
    }`;
if (!source.includes(oldArrayRewrite)) {
  throw new Error('Could not find the original physical-reference array rewrite block');
}
source = source.replace(oldArrayRewrite, newArrayRewrite);

const stageMarkers = [
  ["const placeIndexRaw = readJson(PLACE_INDEX);", "console.log('[safe-six] preflight: verify legacy and canonical place IDs');\nconst placeIndexRaw = readJson(PLACE_INDEX);"],
  ["const initialPhysicalRefs = [];", "console.log('[safe-six] preflight: scan explicit physical references');\nconst initialPhysicalRefs = [];"],
  ["const aggregate = readJson(AGGREGATE);", "console.log('[safe-six] mutate: remove six pseudo-place rows and split children');\nconst aggregate = readJson(AGGREGATE);"],
  ["const civicationActions = [];", "console.log('[safe-six] mutate: remove pseudo-place Civication mappings');\nconst civicationActions = [];"],
  ["const i18nActions = [];", "console.log('[safe-six] mutate: remove obsolete place i18n keys');\nconst i18nActions = [];"],
  ["const special = new Set([AGGREGATE, SPLIT_INDEX, SPLIT_MANIFEST, PLACE_INDEX]);", "console.log('[safe-six] mutate: retarget explicit physical place-reference fields');\nconst special = new Set([AGGREGATE, SPLIT_INDEX, SPLIT_MANIFEST, PLACE_INDEX]);"],
  ["let aliasText = fs.readFileSync(abs(ALIAS_CHECK), 'utf8');", "console.log('[safe-six] mutate: register retired aliases');\nlet aliasText = fs.readFileSync(abs(ALIAS_CHECK), 'utf8');"],
  ["execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });", "console.log('[safe-six] validate: rebuild runtime and run target-aware checks');\nexecFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });"]
];
for (const [needle, replacement] of stageMarkers) {
  if (!source.includes(needle)) throw new Error(`Could not instrument migration stage: ${needle}`);
  source = source.replace(needle, replacement);
}

fs.writeFileSync(TEMP_RUNNER, source);
try {
  execFileSync(process.execPath, [TEMP_RUNNER], { cwd: ROOT, stdio: 'inherit' });
} finally {
  if (fs.existsSync(TEMP_RUNNER)) fs.unlinkSync(TEMP_RUNNER);
}
