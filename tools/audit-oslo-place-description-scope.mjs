#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const MANIFEST_PATH = 'data/places/manifest.json';
const PROTOCOL_PATH = 'reports/place-description-revision-protocol.md';
const REPORT_JSON = 'reports/oslo-place-description-scope-audit-2026-07-26.json';
const REPORT_MD = 'reports/oslo-place-description-scope-audit-2026-07-26.md';

const wordCount = (value) => String(value || '').trim()
  ? String(value).trim().split(/\s+/u).length
  : 0;
const paragraphCount = (value) => String(value || '').trim()
  ? String(value).split(/\n\n+/u).filter((part) => part.trim()).length
  : 0;
const normalize = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/ø/g, 'o')
  .replace(/å/g, 'a')
  .replace(/æ/g, 'ae');
const isOsloValue = (value) => ['oslo', 'oslo kommune', '0301'].includes(normalize(value));
const isOsloPath = (value) => {
  const normalized = String(value).replace(/\\/g, '/').toLowerCase();
  return /(^|\/)oslo(\/|$)/u.test(normalized)
    || /(^|[\/_-])oslo([\/_.-]|$)/u.test(normalized);
};
const toRepoPath = (manifestEntry) => manifestEntry.startsWith('data/')
  ? manifestEntry
  : `data/${manifestEntry}`;

function walkJsonFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkJsonFiles(fullPath, output);
    else if (entry.isFile() && entry.name.endsWith('.json')) {
      output.push(path.relative(ROOT, fullPath).replace(/\\/g, '/'));
    }
  }
  return output;
}

function extractPlaceRecords(value, file, output, ancestry = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => extractPlaceRecords(item, file, output, ancestry.concat(index)));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const hasPlaceShape = typeof value.id === 'string'
    && value.id.trim()
    && Number.isFinite(Number(value.lat))
    && Number.isFinite(Number(value.lon))
    && (typeof value.name === 'string' || typeof value.title === 'string');

  if (hasPlaceShape) {
    const address = value.address && typeof value.address === 'object' ? value.address : {};
    const explicitOslo = [
      value.city,
      value.municipality,
      value.kommune,
      value.region,
      value.county,
      address.city,
      address.municipality,
      address.kommune,
      address.poststed
    ].some(isOsloValue);

    output.push({
      id: value.id.trim(),
      name: String(value.name || value.title || value.id),
      category: String(value.category || ''),
      file,
      ancestry,
      lat: Number(value.lat),
      lon: Number(value.lon),
      pathOslo: isOsloPath(file),
      explicitOslo,
      descWords: wordCount(value.desc),
      popupWords: wordCount(value.popupDesc),
      paragraphs: paragraphCount(value.popupDesc)
    });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    extractPlaceRecords(child, file, output, ancestry.concat(key));
  }
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const protocolSource = fs.readFileSync(PROTOCOL_PATH, 'utf8');
const manifestEntries = Array.isArray(manifest.files) ? manifest.files : [];
const manifestPaths = manifestEntries.map(toRepoPath);
const manifestSet = new Set(manifestPaths);
const manifestRecords = [];
const readErrors = [];

for (const file of manifestPaths) {
  try {
    extractPlaceRecords(JSON.parse(fs.readFileSync(file, 'utf8')), file, manifestRecords);
  } catch (error) {
    readErrors.push({ file, error: error.message });
  }
}

const protocolIds = new Set();
for (const match of protocolSource.matchAll(/^\|\s*\d+\s*\|.*?\|\s*`([^`]+)`\s*\|/gmu)) {
  protocolIds.add(match[1]);
}

const activeOsloRaw = manifestRecords.filter((record) => record.pathOslo || record.explicitOslo);
const activeById = new Map();
for (const record of activeOsloRaw) {
  if (!activeById.has(record.id)) activeById.set(record.id, []);
  activeById.get(record.id).push(record);
}

const activeIds = [...activeById.keys()].sort();
const additionalIds = activeIds.filter((id) => !protocolIds.has(id));
const additional = additionalIds.map((id) => {
  const records = activeById.get(id);
  const preferred = records.find((record) => record.pathOslo) || records[0];
  return { ...preferred, sourceFiles: records.map((record) => record.file) };
}).sort((left, right) => left.file.localeCompare(right.file) || left.id.localeCompare(right.id));

const duplicates = [...activeById.entries()]
  .filter(([, records]) => records.length > 1)
  .map(([id, records]) => ({ id, files: records.map((record) => record.file) }));
const allPlaceJsonFiles = walkJsonFiles('data/places');
const osloPathJsonFiles = allPlaceJsonFiles.filter(isOsloPath).sort();
const unmanifestedOsloPathFiles = osloPathJsonFiles.filter((file) => !manifestSet.has(file));
const needsRevision = additional.filter((record) => (
  record.descWords < 40
  || record.descWords > 80
  || record.popupWords < 300
  || record.paragraphs < 3
));
const passesCanonical = additional.filter((record) => !needsRevision.includes(record));
const groups = {};
for (const record of additional) {
  const domain = record.file.split('/')[2] || 'unknown';
  groups[domain] ??= [];
  groups[domain].push(record);
}
const groupCounts = Object.fromEntries(
  Object.entries(groups).map(([domain, records]) => [domain, records.length])
);

const result = {
  generatedAt: new Date().toISOString(),
  manifest: {
    entries: manifestEntries.length,
    records: manifestRecords.length,
    readErrors
  },
  protocol: { ids: protocolIds.size },
  activeOslo: {
    rawRecords: activeOsloRaw.length,
    uniqueIds: activeIds.length,
    duplicateIds: duplicates
  },
  comparison: {
    alreadyInProtocol: activeIds.filter((id) => protocolIds.has(id)).length,
    additionalActiveOsloIds: additional.length,
    protocolIdsMissingFromActive: [...protocolIds].filter((id) => !activeById.has(id)).sort()
  },
  quality: {
    additionalPassingCanonical: passesCanonical.length,
    additionalNeedingRevision: needsRevision.length
  },
  filesystem: {
    allPlaceJsonFiles: allPlaceJsonFiles.length,
    osloPathJsonFiles: osloPathJsonFiles.length,
    unmanifestedOsloPathFiles
  },
  groupCounts,
  groups,
  additional
};

const markdown = [];
markdown.push('# Full Oslo place description scope audit');
markdown.push('');
markdown.push('This report counts actual manifest-loaded place records, not one folder or one manually selected queue.');
markdown.push('');
markdown.push(`- Manifest entries: **${manifestEntries.length}**`);
markdown.push(`- Unique active Oslo place IDs: **${activeIds.length}**`);
markdown.push(`- IDs in the current revision protocol: **${protocolIds.size}**`);
markdown.push(`- Additional active Oslo IDs outside the protocol: **${additional.length}**`);
markdown.push(`- Additional IDs already passing canonical text limits: **${passesCanonical.length}**`);
markdown.push(`- Additional IDs needing revision: **${needsRevision.length}**`);
markdown.push(`- Oslo-path JSON files outside the active manifest: **${unmanifestedOsloPathFiles.length}**`);
markdown.push('');
markdown.push('## Remaining queue by domain');
markdown.push('');
markdown.push('| Domain | Remaining |');
markdown.push('|---|---:|');
for (const [domain, count] of Object.entries(groupCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  markdown.push(`| ${domain} | ${count} |`);
}
markdown.push('');
markdown.push('## Additional active Oslo places');
markdown.push('');
markdown.push('| Domain | Place | ID | desc | popupDesc | Paragraphs | File | Status |');
markdown.push('|---|---|---|---:|---:|---:|---|---|');
for (const record of additional) {
  const domain = record.file.split('/')[2] || 'unknown';
  const passes = record.descWords >= 40
    && record.descWords <= 80
    && record.popupWords >= 300
    && record.paragraphs >= 3;
  markdown.push(`| ${domain} | ${record.name.replace(/\|/g, '\\|')} | \`${record.id}\` | ${record.descWords} | ${record.popupWords} | ${record.paragraphs} | \`${record.file}\` | ${passes ? 'passes' : 'needs revision'} |`);
}
markdown.push('');
markdown.push('## Unmanifested Oslo-path JSON files');
markdown.push('');
if (unmanifestedOsloPathFiles.length) {
  unmanifestedOsloPathFiles.forEach((file) => markdown.push(`- \`${file}\``));
} else {
  markdown.push('None.');
}
markdown.push('');
markdown.push('## Duplicate active Oslo IDs');
markdown.push('');
if (duplicates.length) {
  duplicates.forEach((entry) => markdown.push(`- \`${entry.id}\`: ${entry.files.map((file) => `\`${file}\``).join(', ')}`));
} else {
  markdown.push('None.');
}

if (WRITE) {
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(REPORT_MD, `${markdown.join('\n')}\n`);

  let protocol = protocolSource;
  const scopeParagraph = 'Oslo-omfanget skal telles fra alle faktiske, manifestlastede stedsobjekter på tvers av fagmapper og filstrukturer. Den tidligere listen på 90 steder var en delkø, ikke hele Oslo.';
  protocol = protocol.replace(/^Oslo-omfanget skal telles[^\n]*$/mu, scopeParagraph);

  const statusBlock = `## Oslo-status etter full scope-audit\n\n- Totalt aktive Oslo-steder: **${activeIds.length} steder**\n- Ferdige etter alle mergede revisjonsbatcher: **${protocolIds.size} steder**\n- Gjenstår: **${additional.length} steder**\n- Full restkø og ordtelling: \`${REPORT_MD}\`\n`;
  protocol = protocol.replace(/## Oslo-status etter (?:denne PR-en|full scope-audit)[\s\S]*?(?=## Ferdige steder)/u, `${statusBlock}\n`);

  const remainingLines = Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([domain, count]) => `- ${domain}: **${count}**`)
    .join('\n');
  const remainingBlock = `## Gjenstående Oslo-kø\n\nDet gjenstår **${additional.length} aktive Oslo-steder** uten ferdig desc/popupDesc-revisjon. Den autoritative, filspesifikke køen ligger i \`${REPORT_MD}\`.\n\n${remainingLines}\n\n`;
  protocol = protocol.replace(/## Gjenstående Oslo-kø[\s\S]*?(?=## Oppdagede metadataavvik)/u, remainingBlock);
  protocol = protocol.replace(
    '| Oslo V4 batch 10 | 2 | #4150 – fullfører alle 90 aktive Oslo-steder |',
    '| Oslo V4 batch 10 | 2 | #4150 – fullførte den tidligere 90-steders delkøen |'
  );
  const auditRow = '| Oslo scope-audit V2 | 0 | #4156 – korrigerte aktiv Oslo-total til 512 steder; 422 gjenstår |';
  if (!protocol.includes('| Oslo scope-audit V2 |')) {
    protocol = protocol.replace(
      '| Oslo V4 batch 10 | 2 | #4150 – fullførte den tidligere 90-steders delkøen |',
      `| Oslo V4 batch 10 | 2 | #4150 – fullførte den tidligere 90-steders delkøen |\n${auditRow}`
    );
  }
  fs.writeFileSync(PROTOCOL_PATH, protocol);
}

console.log(JSON.stringify({
  manifestEntries: manifestEntries.length,
  activeOsloUniqueIds: activeIds.length,
  protocolIds: protocolIds.size,
  additionalActiveOsloIds: additional.length,
  additionalNeedingRevision: needsRevision.length,
  additionalPassingCanonical: passesCanonical.length,
  groupCounts,
  unmanifestedOsloPathFiles: unmanifestedOsloPathFiles.length,
  duplicateActiveOsloIds: duplicates.length,
  wroteFiles: WRITE
}, null, 2));
