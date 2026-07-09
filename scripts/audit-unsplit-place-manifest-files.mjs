// Audit manifest-listed place JSON files that are still arrays and lack split sidecar manifests.
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';

const root = process.cwd();
const manifestPath = join(root, 'data/places/manifest.json');
const reportPath = join(root, 'reports/places-unsplit-manifest-audit.md');
const jsonReportPath = join(root, 'reports/places-unsplit-manifest-audit.json');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function dataPathFromManifestEntry(entry) {
  return join(root, 'data', entry);
}

function expectedSplitManifestFor(sourcePath) {
  const dir = dirname(sourcePath);
  const stem = basename(sourcePath, '.json');
  return join(dir, `${stem}_manifest.json`);
}

function rel(path) {
  return path.replace(`${root}/`, '');
}

function firstPlaceId(value) {
  if (!Array.isArray(value) || !value.length) return null;
  const first = value[0];
  return typeof first?.id === 'string' ? first.id : null;
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

if (!Array.isArray(manifest.files)) {
  throw new Error('Expected data/places/manifest.json to contain a files array.');
}

const audit = {
  generated_at: new Date().toISOString(),
  manifest_path: 'data/places/manifest.json',
  total_manifest_entries: manifest.files.length,
  json_array_entries: 0,
  json_object_or_scalar_entries: 0,
  missing_source_files: [],
  parse_errors: [],
  arrays_with_split_manifest: [],
  arrays_missing_split_manifest: [],
};

for (const entry of manifest.files) {
  const sourcePath = dataPathFromManifestEntry(entry);
  if (!(await exists(sourcePath))) {
    audit.missing_source_files.push({ manifest_entry: entry, source_path: rel(sourcePath) });
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(await readFile(sourcePath, 'utf8'));
  } catch (error) {
    audit.parse_errors.push({ manifest_entry: entry, source_path: rel(sourcePath), error: error.message });
    continue;
  }

  if (!Array.isArray(parsed)) {
    audit.json_object_or_scalar_entries += 1;
    continue;
  }

  audit.json_array_entries += 1;
  const expectedManifest = expectedSplitManifestFor(sourcePath);
  const row = {
    manifest_entry: entry,
    source_path: rel(sourcePath),
    expected_split_manifest: rel(expectedManifest),
    place_count: parsed.length,
    first_place_id: firstPlaceId(parsed),
  };

  if (await exists(expectedManifest)) {
    audit.arrays_with_split_manifest.push(row);
  } else {
    audit.arrays_missing_split_manifest.push(row);
  }
}

audit.arrays_missing_split_manifest.sort((a, b) => a.source_path.localeCompare(b.source_path));
audit.arrays_with_split_manifest.sort((a, b) => a.source_path.localeCompare(b.source_path));

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(jsonReportPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');

const md = [
  '# Places manifest split audit',
  '',
  `Generated at: ${audit.generated_at}`,
  '',
  '## Summary',
  '',
  `- Manifest entries checked: ${audit.total_manifest_entries}`,
  `- JSON array entries: ${audit.json_array_entries}`,
  `- JSON object/scalar entries: ${audit.json_object_or_scalar_entries}`,
  `- Array entries with split manifest: ${audit.arrays_with_split_manifest.length}`,
  `- Array entries missing split manifest: ${audit.arrays_missing_split_manifest.length}`,
  `- Missing source files: ${audit.missing_source_files.length}`,
  `- Parse errors: ${audit.parse_errors.length}`,
  '',
  '## Array entries missing split manifest',
  '',
  audit.arrays_missing_split_manifest.length
    ? '| Source | Places | First place id | Expected split manifest |\n| --- | ---: | --- | --- |\n'
      + audit.arrays_missing_split_manifest.map((row) => `| \`${row.source_path}\` | ${row.place_count} | \`${row.first_place_id ?? ''}\` | \`${row.expected_split_manifest}\` |`).join('\n')
    : '_None._',
  '',
  '## Missing source files',
  '',
  audit.missing_source_files.length
    ? audit.missing_source_files.map((row) => `- \`${row.manifest_entry}\` -> \`${row.source_path}\``).join('\n')
    : '_None._',
  '',
  '## Parse errors',
  '',
  audit.parse_errors.length
    ? audit.parse_errors.map((row) => `- \`${row.source_path}\`: ${row.error}`).join('\n')
    : '_None._',
  '',
  '## Array entries already covered by split manifest',
  '',
  audit.arrays_with_split_manifest.length
    ? audit.arrays_with_split_manifest.map((row) => `- \`${row.source_path}\` (${row.place_count}) -> \`${row.expected_split_manifest}\``).join('\n')
    : '_None._',
  '',
].join('\n');

await writeFile(reportPath, md, 'utf8');

console.log(`Manifest entries checked: ${audit.total_manifest_entries}`);
console.log(`Array entries missing split manifest: ${audit.arrays_missing_split_manifest.length}`);
console.log(`Report written: ${rel(reportPath)}`);
