import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const COMMAND = 'npm run typecheck';
const REPORT_PATH = path.join('reports', 'typecheck-baseline-report.md');
const MAX_RAW_LINES = 80;

const DIAG_RE = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.*)$/;

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function mapGroup(filePath) {
  const p = normalizePath(filePath);
  if (p.startsWith('schemas/')) return 'schemas/**';
  if (p.startsWith('js/state/')) return 'js/state/**';
  if (p.startsWith('js/Civication/')) return 'js/Civication/**';
  if (p.startsWith('js/ui/')) return 'js/ui/**';
  if (p === 'js/profile.js') return 'js/profile.js';
  if (p === 'js/hgKnowledgeEngine.js') return 'js/hgKnowledgeEngine.js';
  if (p === 'js/dataHub.js') return 'js/dataHub.js';
  if (p === 'js/boot.js') return 'js/boot.js';
  if (p.startsWith('scripts/')) return 'scripts/**';
  if (p.startsWith('tools/')) return 'tools/**';
  if (p === 'sw.js') return 'sw.js';
  if (!p.includes('/')) return 'root files';
  return 'other';
}

function runTypecheck() {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'typecheck']);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|');
}

function uniqueExampleFiles(files, limit = 3) {
  return [...files].sort().slice(0, limit).join('<br>') || '-';
}

function buildReport({ exitCode, combinedOutput, parsed, unknownLines }) {
  const byFile = new Map();
  const byGroup = new Map();
  const byCode = new Map();

  for (const d of parsed) {
    const file = normalizePath(d.file);
    const group = mapGroup(file);

    if (!byFile.has(file)) byFile.set(file, { count: 0, group });
    byFile.get(file).count += 1;

    if (!byGroup.has(group)) byGroup.set(group, { files: new Set(), count: 0 });
    const g = byGroup.get(group);
    g.files.add(file);
    g.count += 1;

    const code = d.code || 'unknown/no-code';
    byCode.set(code, (byCode.get(code) || 0) + 1);
  }

  if (unknownLines.length > 0) {
    const key = 'unknown/no-code';
    byCode.set(key, (byCode.get(key) || 0) + unknownLines.length);
  }

  const groupRows = [...byGroup.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([group, data]) => `| ${escapeCell(group)} | ${data.files.size} | ${data.count} | ${uniqueExampleFiles(data.files)} |`)
    .join('\n');

  const topFilesRows = [...byFile.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([file, data]) => `| ${escapeCell(file)} | ${data.count} | ${escapeCell(data.group)} |`)
    .join('\n');

  const codeRows = [...byCode.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => `| ${escapeCell(code)} | ${count} |`)
    .join('\n');

  const sortedGroups = [...byGroup.entries()].sort((a, b) => b[1].count - a[1].count);
  const topGroup = sortedGroups[0];
  const largeAreas = sortedGroups.slice(1, 4).map(([name]) => name);

  const rawLines = combinedOutput.split(/\r?\n/).filter(Boolean).slice(0, MAX_RAW_LINES);
  const rawBlock = rawLines.length ? rawLines.join('\n') : '(no output captured)';

  return `# Typecheck baseline report

## Metadata
- Generated at (UTC): ${new Date().toISOString()}
- Command: \`${COMMAND}\`
- Typecheck exit code: ${exitCode}
- Total diagnostic lines found: ${parsed.length}
- Files with diagnostics: ${byFile.size}
- Groups with diagnostics: ${byGroup.size}
- Unparsed/unknown diagnostic lines: ${unknownLines.length}

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
${groupRows || '| (none) | 0 | 0 | - |'}

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
${topFilesRows || '| (none) | 0 | - |'}

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
${codeRows || '| unknown/no-code | 0 |'}

## Priority recommendations (mechanical)
1. Start with **${topGroup ? `${topGroup[0]} (${topGroup[1].count} diagnostics)` : 'no failing area detected'}** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: ${[...byFile.entries()].sort((a,b)=>b[1].count-a[1].count).slice(0,5).map(([f,v]) => `\`${f}\` (${v.count})`).join(', ') || 'none'}.
3. Defer broader/sensitive areas until hotspot reduction is complete: ${largeAreas.length ? largeAreas.map((a) => `\`${a}\``).join(', ') : 'none identified'}.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first ${MAX_RAW_LINES} lines)
\`\`\`
${rawBlock}
\`\`\`
`;
}

async function main() {
  const { code, stdout, stderr } = await runTypecheck();
  const combinedOutput = `${stdout}${stdout && stderr ? '\n' : ''}${stderr}`;
  const lines = combinedOutput.split(/\r?\n/);

  const parsed = [];
  const unknownLines = [];

  for (const line of lines) {
    const m = line.match(DIAG_RE);
    if (m) {
      parsed.push({ file: m[1], line: Number(m[2]), column: Number(m[3]), code: m[4], message: m[5] });
      continue;
    }
    if (line.includes('error TS')) unknownLines.push(line);
  }

  const report = buildReport({ exitCode: code, combinedOutput, parsed, unknownLines });
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, report, 'utf8');

  console.log(`Baseline report written: ${REPORT_PATH}`);
  console.log(`Typecheck exit code captured: ${code}`);
}

main().catch((err) => {
  console.error('Failed to generate typecheck baseline report.');
  console.error(err);
  process.exit(1);
});
