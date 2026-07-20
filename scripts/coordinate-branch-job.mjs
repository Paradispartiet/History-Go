import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-production-skimore-oslo';
const sourceRef = 'FETCH_HEAD:scripts/coordinate-branch-job.mjs';
const tempRunner = path.join(ROOT, 'scripts/.skimore-oslo-v2-runner.mjs');

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
let source = execFileSync('git', ['show', sourceRef], { encoding: 'utf8' });

const oldBlock = `const tableMarker = '\\n\\nRelevante korrigerende merger for de første Oslo-batchene:';\nconst tableEnd = protocol.indexOf(tableMarker);\nif (tableEnd < 0) throw new Error('Could not find Oslo table end');\nconst batchNos = [...protocol.slice(0, tableEnd).matchAll(/^\\| (\\d+) \\|/gm)].map((m) => Number(m[1]));\nif (!batchNos.length) throw new Error('Could not parse Oslo batch numbers');\nconst batchNo = Math.max(...batchNos) + 1;`;

const newBlock = `const protocolLines = protocol.split('\\n');\nconst tableHeaderIndex = protocolLines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');\nif (tableHeaderIndex < 0) throw new Error('Could not find Oslo table header');\nlet firstRowIndex = tableHeaderIndex + 2;\nlet afterLastRowIndex = firstRowIndex;\nwhile (afterLastRowIndex < protocolLines.length) {\n  const line = protocolLines[afterLastRowIndex];\n  if (line.startsWith('| ')) {\n    afterLastRowIndex += 1;\n    continue;\n  }\n  if (line.trim() === '') {\n    let lookahead = afterLastRowIndex + 1;\n    while (lookahead < protocolLines.length && protocolLines[lookahead].trim() === '') lookahead += 1;\n    if (lookahead < protocolLines.length && protocolLines[lookahead].startsWith('| ')) {\n      afterLastRowIndex = lookahead;\n      continue;\n    }\n  }\n  break;\n}\nconst batchNos = protocolLines.slice(firstRowIndex, afterLastRowIndex).flatMap((line) => {\n  const match = line.match(/^\\| (\\d+) \\|/);\n  return match ? [Number(match[1])] : [];\n});\nif (!batchNos.length) throw new Error('Could not parse Oslo batch numbers');\nconst batchNo = Math.max(...batchNos) + 1;`;

if (!source.includes(oldBlock)) throw new Error('Could not find old Skimore table-boundary block');
source = source.replace(oldBlock, newBlock);

const oldInsert = "protocol = protocol.slice(0, tableEnd) + `\\n| ${batchNo} | ` + '\\`' + `${ID}` + '\\`' + ` | Skimore Oslo | verified | ` + '\\`' + `${result.sourceObjectId}` + '\\`' + ` |` + protocol.slice(tableEnd);";
const newInsert = `protocolLines.splice(afterLastRowIndex, 0, \`| \${batchNo} | \\\`\${ID}\\\` | Skimore Oslo | verified | \\\`\${result.sourceObjectId}\\\` |\`);\nprotocol = protocolLines.join('\\n');`;

if (!source.includes(oldInsert)) throw new Error('Could not find old Skimore table-row insertion');
source = source.replace(oldInsert, newInsert);

fs.writeFileSync(tempRunner, source);
try {
  execFileSync(process.execPath, [tempRunner], { cwd: ROOT, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempRunner)) fs.unlinkSync(tempRunner);
}
