#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const requireMatch = (condition, message) => {
  if (!condition) throw new Error(message);
};

const contractPath = 'docs/DATA_PRODUCTION_CONTRACT.md';
let contract = read(contractPath).replace('Last verified: 2026-07-25', 'Last verified: 2026-07-26');
if (!contract.includes('docs/SUBJECT_FILE_CONTRACT.md')) {
  requireMatch(contract.includes('docs/DOMAIN_CONTRACT.md'), `Mangler DOMAIN_CONTRACT-anker i ${contractPath}`);
  contract = contract.replace('docs/DOMAIN_CONTRACT.md', 'docs/DOMAIN_CONTRACT.md\ndocs/SUBJECT_FILE_CONTRACT.md');
}
write(contractPath, contract);

const pensumPath = 'README/README.pensum.md';
let pensum = read(pensumPath);
if (!pensum.includes('Den bindende regelen for fagfilenes geografiske ansvar')) {
  const anchor = 'For den kanoniske definisjonen av brukerens personlige Knowledge gjelder også `README/knowledgeREADME.md`.';
  requireMatch(pensum.includes(anchor), `Mangler Knowledge-anker i ${pensumPath}`);
  pensum = pensum.replace(anchor, `${anchor}\n\nDen bindende regelen for fagfilenes geografiske ansvar ligger i \`docs/SUBJECT_FILE_CONTRACT.md\`: én universell fagmodell per fag, med separate geografiske profiler, cases, claims, kilder, steder, personer og quizlag.`);
}
if (!pensum.includes('### Universell fagpakke og geografiske produksjonslag')) {
  const anchor = 'Runtime skal bruke manifestet først og kan beholde fallback-paths der det er nødvendig for bakoverkompatibilitet.';
  requireMatch(pensum.includes(anchor), `Mangler manifestanker i ${pensumPath}`);
  const section = [
    anchor,
    '',
    '### Universell fagpakke og geografiske produksjonslag',
    '',
    'Fagkart, emner, begreper, teorier og metoder skal være universelle for faget. Det skal ikke opprettes ett komplett fagsett per land, by eller region.',
    '',
    'Geografisk innhold skal kobles til de universelle fag-ID-ene gjennom profiler, mappings, lokale cases, dokumenterte claims, kilder, steder, personer og quizproduksjon.',
    '',
    'Derfor må dekning måles separat som:',
    '',
    '- **universell fagdekning** — om faget dekker nødvendige områder, emner, begreper, teorier og metoder;',
    '- **geografisk produksjonsdekning** — om et område har nok cases, kilder, claims, steder, personer og quizer til å realisere faget.',
    '',
    'Mange lokale cases beviser ikke at fagmodellen er heldekkende. Manglende lokalt innhold skal heller ikke løses ved å kopiere hele fagpakken.',
    '',
    'Se den bindende kontrakten i `docs/SUBJECT_FILE_CONTRACT.md`.',
  ].join('\n');
  pensum = pensum.replace(anchor, section);
}
write(pensumPath, pensum);

const structurePath = 'README/fagstrukturREADME.md';
let structure = read(structurePath);
if (!structure.includes('Bindende geografisk regel:')) {
  const anchor = 'Den er **epistemisk og normativ**: den forklarer hva som er riktig bruk av strukturene, ikke bare hva som finnes.';
  requireMatch(structure.includes(anchor), `Mangler innledningsanker i ${structurePath}`);
  structure = structure.replace(anchor, `${anchor}\n\nBindende geografisk regel: \`docs/SUBJECT_FILE_CONTRACT.md\` eier skillet mellom universelle fagfiler og lokale produksjonslag. Fagstruktur skal ikke kopieres per land.`);
}
if (!structure.includes('Dette er selve universelle fagkartet')) {
  const replacement = [
    '## 2. FAGKART (dypt, strukturerende)',
    '',
    'Fagkartet er den **universelle, dype fagmodellen** for ett fag. Det skal ikke kopieres for hvert land, hver by eller hver region.',
    '',
    'Fagkartet:',
    '- forklarer *hvordan faget henger sammen*;',
    '- definerer fagområder, begreper, konflikter og sentrale spørsmål;',
    '- kobler teorier, metoder og emner;',
    '- gir universelle ID-er som geografiske innholdslag kan bruke.',
    '',
    'Kjennetegn:',
    '- `principles`;',
    '- `categories`;',
    '- `topic_hooks`;',
    '- `canon`;',
    '- konflikter, aktører og spørsmål.',
    '',
    'Eksisterende filer med bynavn eller felt som `scope: oslo_og_omegn` og `recommended_oslo_cases` er compatibility-/profilblanding. Den geografiske informasjonen skal gradvis skilles ut i profiler, mappings, cases, claims, kilder, steder, personer og quizlag. Slike filer er ikke presedens for nye landkopier.',
    '',
    'Dette laget er:',
    '- epistemisk;',
    '- strukturerende;',
    '- normativt;',
    '- geografisk gjenbrukbart.',
    '',
    '👉 **Dette er selve universelle fagkartet.**',
  ].join('\n');
  const pattern = /## 2\. FAGKART \(dypt, strukturerende\)[\s\S]*?👉 \*\*Dette er selve fagkartet\.\*\*/;
  requireMatch(pattern.test(structure), `Mangler FAGKART-blokk i ${structurePath}`);
  structure = structure.replace(pattern, replacement);
}
if (!structure.includes('Én universell fagmodell per fag; ingen komplette landkopier')) {
  const anchor = 'Låste prinsipper';
  requireMatch(structure.includes(anchor), `Mangler prinsippanker i ${structurePath}`);
  structure = structure.replace(anchor, `${anchor}\n\t•\tÉn universell fagmodell per fag; ingen komplette landkopier\n\t•\tGeografiske profiler og produksjonslag refererer til canonical fag-ID-er\n\t•\tUniversell fagdekning og geografisk produksjonsdekning måles separat`);
}
write(structurePath, structure);

const docsReadmePath = 'docs/README.md';
let docsReadme = read(docsReadmePath).replace('Sist kontrollert: **2026-07-25**', 'Sist kontrollert: **2026-07-26**');
if (!docsReadme.includes('SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md)')) {
  const anchor = '### Fag, emner og quiz\n\n';
  requireMatch(docsReadme.includes(anchor), `Mangler fagseksjon i ${docsReadmePath}`);
  docsReadme = docsReadme.replace(anchor, `${anchor}1. [\`SUBJECT_FILE_CONTRACT.md\`](./SUBJECT_FILE_CONTRACT.md) — bindende regel om én universell fagmodell per fag og separate geografiske produksjonslag\n`);
  const lines = docsReadme.split('\n');
  let inSection = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i] === '### Fag, emner og quiz') {
      inSection = true;
      continue;
    }
    if (inSection && lines[i].startsWith('### ')) break;
    if (inSection) {
      const match = lines[i].match(/^(\d+)\. \[\`\.\.\//);
      if (match) lines[i] = lines[i].replace(/^\d+\./, `${Number(match[1]) + 1}.`);
    }
  }
  docsReadme = lines.join('\n');
}
if (!docsReadme.includes('Fagfilene er universelle. Land, regioner og byer')) {
  const anchor = 'Det gamle extensionløse `README/emnepackREADME` var et biologispesifikt utkast og er fjernet.';
  requireMatch(docsReadme.includes(anchor), `Mangler emnepack-anker i ${docsReadmePath}`);
  docsReadme = docsReadme.replace(anchor, `Fagfilene er universelle. Land, regioner og byer skal legge til profiler, mappings, cases, claims, kilder, steder, personer og quizinnhold som refererer til de samme canonical fag-ID-ene; de skal ikke opprette komplette fagkopier. Universell fagdekning og geografisk produksjonsdekning er separate mål.\n\n${anchor}`);
}
write(docsReadmePath, docsReadme);

const registryPath = 'docs/documentation_registry.json';
const registry = JSON.parse(read(registryPath));
registry.last_verified = '2026-07-26';
const subjectContractPath = 'docs/SUBJECT_FILE_CONTRACT.md';
if (!registry.priority_order.includes(subjectContractPath)) {
  const after = registry.priority_order.indexOf('docs/DATA_PRODUCTION_CONTRACT.md');
  requireMatch(after >= 0, 'Mangler DATA_PRODUCTION_CONTRACT i priority_order');
  registry.priority_order.splice(after + 1, 0, subjectContractPath);
}
if (!registry.documents.some((entry) => entry.path === subjectContractPath)) {
  const after = registry.documents.findIndex((entry) => entry.path === 'docs/DATA_PRODUCTION_CONTRACT.md');
  requireMatch(after >= 0, 'Mangler DATA_PRODUCTION_CONTRACT i dokumentregisteret');
  registry.documents.splice(after + 1, 0, {
    path: subjectContractPath,
    status: 'canonical',
    role: 'Bindende arkitektur for én universell fagmodell per fag, separate geografiske produksjonslag og separate dekningsmål',
    owns: [
      'subject_file_architecture',
      'universal_subject_model',
      'geographic_subject_profiles',
      'subject_coverage_separation',
    ],
    last_verified: '2026-07-26',
  });
}
write(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

const reportDir = path.join(root, 'reports/documentation-governance');
fs.mkdirSync(reportDir, {recursive: true});
const run = (label, command, args) => {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8'});
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, `${label}.log`), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};
run('build-scripts', 'npm', ['run', 'build:scripts']);
run('documentation-governance', process.execPath, ['dist/scripts/check-documentation-governance.mjs']);

spawnSync('git', ['restore', '--staged', '--worktree', 'reports'], {cwd: root, encoding: 'utf8'});
spawnSync('git', ['clean', '-fd', 'reports/documentation-governance'], {cwd: root, encoding: 'utf8'});
fs.rmSync(path.join(root, 'scripts/coordinate-branch-job.mjs'));

const expected = [
  'README/README.pensum.md',
  'README/fagstrukturREADME.md',
  'docs/DATA_PRODUCTION_CONTRACT.md',
  'docs/README.md',
  'docs/documentation_registry.json',
  'scripts/coordinate-branch-job.mjs',
];
spawnSync('git', ['config', 'user.name', 'github-actions[bot]'], {cwd: root, encoding: 'utf8'});
spawnSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], {cwd: root, encoding: 'utf8'});
const add = spawnSync('git', ['add', ...expected], {cwd: root, encoding: 'utf8'});
if (add.status !== 0) throw new Error(add.stderr || 'git add failed');
const commit = spawnSync('git', ['commit', '-m', 'Forankre universell fagfilarkitektur i dokumentasjonen'], {cwd: root, encoding: 'utf8'});
process.stdout.write(commit.stdout || commit.stderr || '');
if (commit.status !== 0) throw new Error(commit.stderr || 'git commit failed');
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
const pull = spawnSync('git', ['pull', '--rebase', 'origin', branch], {cwd: root, encoding: 'utf8'});
process.stdout.write(pull.stdout || pull.stderr || '');
if (pull.status !== 0) throw new Error(pull.stderr || 'git pull --rebase failed');
const push = spawnSync('git', ['push', 'origin', `HEAD:${branch}`], {cwd: root, encoding: 'utf8'});
process.stdout.write(push.stdout || push.stderr || '');
if (push.status !== 0) throw new Error(push.stderr || 'git push failed');
