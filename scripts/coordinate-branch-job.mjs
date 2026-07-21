import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const original = execFileSync(
  'git',
  ['show', '071a170b3ae2cc74f6a455cd255aab75124c906e:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);

const resetLine = "execSync('git fetch origin main && git reset --hard origin/main', { stdio: 'inherit' });";
if (!original.includes(resetLine)) throw new Error('Could not locate legacy in-job main reset');

const oldIndexBlock = `const splitIndex = readJson(SPLIT_INDEX);\nconst indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);\nif (indexPos < 0) throw new Error('Havnelageret missing from split index');\nsplitIndex[indexPos] = JSON.parse(JSON.stringify(childAfter));\nwriteJson(SPLIT_INDEX, splitIndex);`;
const newIndexBlock = `const splitIndex = readJson(SPLIT_INDEX);\nconst indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);\nif (indexPos < 0) throw new Error('Havnelageret missing from split index');\nconst indexRow = splitIndex[indexPos];\nconst coordinateIndexFields = [\n  'lat', 'lon', 'r', 'coordType', 'coordStatus', 'locatorType', 'sourceProvider',\n  'sourceObjectId', 'address', 'geocodeAccuracy', 'coordRole', 'coordSource',\n  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote'\n];\nfor (const field of coordinateIndexFields) {\n  if (Object.prototype.hasOwnProperty.call(childAfter, field)) indexRow[field] = JSON.parse(JSON.stringify(childAfter[field]));\n  else delete indexRow[field];\n}\nwriteJson(SPLIT_INDEX, splitIndex);`;
if (!original.includes(oldIndexBlock)) throw new Error('Could not locate legacy full-row family-index replacement');

const patched = original
  .replace(resetLine, "console.log('[Batch 102] Running on branch checkout without resetting HEAD; branch was created from current main.');")
  .replace(oldIndexBlock, newIndexBlock);

const tempPath = '/tmp/history-go-havnelageret-batch-102-no-reset.mjs';
fs.writeFileSync(tempPath, patched);
await import(`${pathToFileURL(tempPath).href}?v=${Date.now()}`);
