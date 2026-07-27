import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SOURCE_PROTOCOL = 'reports/place-description-revision-protocol.md';
export const OUTPUT_REGISTRY = 'reports/place-description-completion-registry-v4_2.json';

export function parseProtocolRows(markdown) {
  const rows = [];
  for (const line of String(markdown ?? '').split(/\r?\n/gu)) {
    if (!/^\|\s*\d+\s*\|/u.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 7) continue;
    const [numberRaw, name, placeIdRaw, descWordsRaw, popupWordsRaw, paragraphsRaw, prRaw] = cells;
    const placeId = placeIdRaw.replace(/`/gu, '').trim();
    const number = Number(numberRaw);
    const descWords = Number(descWordsRaw);
    const popupWords = Number(popupWordsRaw);
    const paragraphs = Number(paragraphsRaw);
    const pr = prRaw.replace(/`/gu, '').trim();
    if (!Number.isInteger(number) || !placeId) continue;
    rows.push({
      number,
      name,
      placeId,
      metrics: {
        descWords: Number.isFinite(descWords) ? descWords : null,
        popupWords: Number.isFinite(popupWords) ? popupWords : null,
        paragraphs: Number.isFinite(paragraphs) ? paragraphs : null
      },
      completionReference: pr,
      completedUnder: '4.1',
      currentStatus: 'requires_4_2_review',
      sourceVerifiedAt: null,
      claimsVerified: null,
      factualReview: 'not_recorded_under_4_1',
      editorialReview: 'not_recorded_under_4_1',
      validatorVersion: null
    });
  }
  return rows;
}

export function buildRegistry(markdown, generatedAt = new Date().toISOString()) {
  const entries = parseProtocolRows(markdown);
  return {
    schema: 'history_go_place_description_completion_registry_v4_2',
    standard: '4.2',
    generatedAt,
    migrationSource: SOURCE_PROTOCOL,
    migrationRule: 'Tidligere ferdigstatus beholdes historisk som 4.1, men teller ikke som current under 4.2 før claim-, setnings- og reviewportene er bestått.',
    totals: {
      migratedLegacyEntries: entries.length,
      currentV4_2Entries: 0,
      requiresV4_2Review: entries.length
    },
    entries
  };
}

function stableRegistry(registry) {
  const copy = structuredClone(registry);
  copy.generatedAt = '<generated-at>';
  return `${JSON.stringify(copy, null, 2)}\n`;
}

function readExisting(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
    check: argv.includes('--check'),
    source: argv.find((value) => value.startsWith('--source='))?.slice('--source='.length) || SOURCE_PROTOCOL,
    output: argv.find((value) => value.startsWith('--output='))?.slice('--output='.length) || OUTPUT_REGISTRY
  };
}

function main() {
  const root = process.cwd();
  const options = parseArgs(process.argv.slice(2));
  const sourcePath = path.join(root, options.source);
  const outputPath = path.join(root, options.output);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Mangler protokoll: ${options.source}`);
    process.exitCode = 1;
    return;
  }
  const registry = buildRegistry(fs.readFileSync(sourcePath, 'utf8'));
  if (options.write) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(registry, null, 2)}\n`);
    console.log(`Skrev ${options.output} med ${registry.entries.length} migrerte steder.`);
  }
  if (options.check) {
    const existing = readExisting(outputPath);
    if (!existing) {
      console.error(`Mangler generert register: ${options.output}. Kjør med --write.`);
      process.exitCode = 1;
      return;
    }
    if (stableRegistry(existing) !== stableRegistry(registry)) {
      console.error(`${options.output} er ute av sync med ${options.source}.`);
      process.exitCode = 1;
      return;
    }
    console.log(`${options.output} er i sync (${registry.entries.length} steder).`);
  }
  if (!options.write && !options.check) {
    console.log(JSON.stringify(registry, null, 2));
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) main();
