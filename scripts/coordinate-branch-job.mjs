import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OLD = 'jernbanetorget_trafikknutepunkt';
const REPORT_DIR = 'reports/jernbanetorget-duplicate-audit';

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const refs = [];
for (const abs of walk(path.join(ROOT, 'data'))) {
  if (!abs.endsWith('.json')) continue;
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(OLD)) continue;
  const rel = path.relative(ROOT, abs);
  const exactQuotedCount = (text.match(new RegExp(`"${OLD}"`, 'g')) || []).length;
  const totalCount = text.split(OLD).length - 1;
  refs.push({ file: rel, exactQuotedCount, totalCount });
}
refs.sort((a, b) => a.file.localeCompare(b.file));

fs.mkdirSync(path.join(ROOT, REPORT_DIR), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, REPORT_DIR, 'references.json'),
  `${JSON.stringify({ date: '2026-07-20', oldId: OLD, references: refs }, null, 2)}\n`
);
fs.writeFileSync(
  path.join(ROOT, REPORT_DIR, 'README.md'),
  `# Jernbanetorget duplicate reference audit\n\nFound ${refs.length} active JSON files containing \`${OLD}\`.\n\n${refs.map((r) => `- \`${r.file}\`: ${r.exactQuotedCount} exact quoted IDs / ${r.totalCount} total mentions`).join('\n')}\n`
);

console.log(JSON.stringify({ oldId: OLD, referenceFileCount: refs.length, refs }, null, 2));
