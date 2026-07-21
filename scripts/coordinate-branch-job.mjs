import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Reuse the already validated fresh-main batch-102 job, but patch the family-index update
// to preserve its lightweight row shape and mandatory `file` field.
const original = execFileSync(
  'git',
  ['show', '071a170b3ae2cc74f6a455cd255aab75124c906e:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);

const oldBlock = `const splitIndex = readJson(SPLIT_INDEX);\nconst indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);\nif (indexPos < 0) throw new Error('Havnelageret missing from split index');\nsplitIndex[indexPos] = JSON.parse(JSON.stringify(childAfter));\nwriteJson(SPLIT_INDEX, splitIndex);`;

const newBlock = `const splitIndex = readJson(SPLIT_INDEX);\nconst indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);\nif (indexPos < 0) throw new Error('Havnelageret missing from split index');\nconst indexRow = splitIndex[indexPos];\nconst coordinateIndexFields = [\n  'lat', 'lon', 'r', 'coordType', 'coordStatus', 'locatorType', 'sourceProvider',\n  'sourceObjectId', 'address', 'geocodeAccuracy', 'coordRole', 'coordSource',\n  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote'\n];\nfor (const field of coordinateIndexFields) {\n  if (Object.prototype.hasOwnProperty.call(childAfter, field)) {\n    indexRow[field] = JSON.parse(JSON.stringify(childAfter[field]));\n  } else {\n    delete indexRow[field];\n  }\n}\nwriteJson(SPLIT_INDEX, splitIndex);`;

if (!original.includes(oldBlock)) {
  throw new Error('Validated Havnelageret job no longer contains expected full-row index replacement');
}

const patched = original.replace(oldBlock, newBlock);
const tempPath = '/tmp/history-go-havnelageret-batch-102-clean-final.mjs';
fs.writeFileSync(tempPath, patched);
await import(`${pathToFileURL(tempPath).href}?v=${Date.now()}`);
