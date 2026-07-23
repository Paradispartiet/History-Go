import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = 'ed592d06f25bf2e97c6cbf7391f3319cf78e2f04';
const TEMP_SCRIPT = '/tmp/akerselva-industri-thematic-migration.mjs';
let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`], { encoding: 'utf8' });

const oldBlock = `// Remove the duplicate Civication map object when canonical Akerselva already has its own mapping.\nconst civication = readJson(CIVICATION);\nconst canonicalMappingCount = countMappings(civication, CANONICAL_ID);\nconst legacyMappingCount = countMappings(civication, LEGACY_ID);\nif (legacyMappingCount !== 1) throw new Error(\`Expected one legacy Civication mapping, got \${legacyMappingCount}\`);\nconst civiStats = { removed: 0 };\nlet updatedCivication;\nif (canonicalMappingCount >= 1) {\n  updatedCivication = removeMappings(civication, LEGACY_ID, civiStats);\n  if (civiStats.removed !== 1) throw new Error(\`Expected one duplicate Civication mapping removal, got \${civiStats.removed}\`);\n} else {\n  throw new Error('Canonical Akerselva has no Civication mapping; explicit retarget path is required before retirement');\n}\nwriteJson(CIVICATION, updatedCivication);`;

const newBlock = `// Preserve the single Civication map presence: remove a duplicate legacy mapping if canonical exists, otherwise retarget the legacy mapping to canonical Akerselva.\nconst civication = readJson(CIVICATION);\nconst canonicalMappingCount = countMappings(civication, CANONICAL_ID);\nconst legacyMappingCount = countMappings(civication, LEGACY_ID);\nif (legacyMappingCount !== 1) throw new Error(\`Expected one legacy Civication mapping, got \${legacyMappingCount}\`);\nconst civiStats = { removed: 0, retargeted: 0 };\nlet updatedCivication;\nif (canonicalMappingCount >= 1) {\n  updatedCivication = removeMappings(civication, LEGACY_ID, civiStats);\n  if (civiStats.removed !== 1) throw new Error(\`Expected one duplicate Civication mapping removal, got \${civiStats.removed}\`);\n} else {\n  updatedCivication = civication;\n  const retarget = (value) => {\n    if (Array.isArray(value)) return value.forEach(retarget);\n    if (!value || typeof value !== 'object') return;\n    if (value.historyGoPlaceId === LEGACY_ID) {\n      value.historyGoPlaceId = CANONICAL_ID;\n      value.historyGoSourceFile = 'places/by/oslo/places/akerselva.json';\n      value.name = mergedCanonical.name;\n      value.lat = mergedCanonical.lat;\n      value.lon = mergedCanonical.lon;\n      value.needsVerification = false;\n      civiStats.retargeted += 1;\n    }\n    Object.values(value).forEach(retarget);\n  };\n  retarget(updatedCivication);\n  if (civiStats.retargeted !== 1) throw new Error(\`Expected one Civication mapping retarget, got \${civiStats.retargeted}\`);\n}\nwriteJson(CIVICATION, updatedCivication);`;

if (!source.includes(oldBlock)) throw new Error('Could not patch Civication migration branch');
source = source.replace(oldBlock, newBlock);
source = source.replace(
  `removedLegacyCivicationMappings: civiStats.removed,`,
  `removedLegacyCivicationMappings: civiStats.removed,\n    retargetedLegacyCivicationMappings: civiStats.retargeted,`
);

fs.writeFileSync(TEMP_SCRIPT, source, 'utf8');
await import(pathToFileURL(TEMP_SCRIPT).href);
