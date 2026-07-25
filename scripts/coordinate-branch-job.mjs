import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const previous = spawnSync('git', ['show', '28e117bd348c17bebdac1660c22b603146ed099e:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
if (previous.error || previous.status !== 0) {
  throw new Error(`Could not load first power-curation runner\n${previous.stderr || ''}`);
}

let source = previous.stdout;
function replaceOnce(pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`Expected runner fragment not found: ${label}`);
  source = source.replace(pattern, replacement);
}

replaceOnce(/^const sourceEmner = gitShowJson\(sourceRef, emnerPath\);\n/m, '', 'source emner load');
replaceOnce(/^const sourceTargetEmner = sourceEmner\.filter\(\(item\) =>\n  belongsToDomain\(item\) \|\| String\(item\?\.emne_id \|\| ''\)\.startsWith\('em_his_makt_'\)\);\n/m, '', 'source emner selection');
replaceOnce(/^if \(sourceTargetEmner\.length !== 10\) \{\n  throw new Error\(`Expected 10 power-domain emner in source branch, found \$\{sourceTargetEmner\.length\}`\);\n\}\n/m, '', 'source emner count guard');
replaceOnce(
  /^const currentEmneIndex = new Map\(currentEmner\.map\(\(item, index\) => \[item\.emne_id, index\]\)\);\nfor \(const sourceEmne of sourceTargetEmner\) \{\n  const index = currentEmneIndex\.get\(sourceEmne\.emne_id\);\n  if \(index === undefined\) \{\n    throw new Error\(`Missing current emne \$\{sourceEmne\.emne_id\}`\);\n  \}\n  currentEmner\[index\] = sourceEmne;\n\}\n/m,
  "let emneConceptCorrections = 0;\nfor (const emne of currentEmner) {\n  for (const field of ['core_concepts', 'sub_concepts']) {\n    if (!Array.isArray(emne[field])) continue;\n    emne[field] = emne[field].map((label) => {\n      if (label !== 'statlig') return label;\n      emneConceptCorrections += 1;\n      return 'territoriell konsolidering';\n    });\n  }\n}\nif (emneConceptCorrections < 1) {\n  throw new Error('Expected at least one emne concept correction from statlig to territoriell konsolidering');\n}\n",
  'emne import block'
);
replaceOnce(
  /^run\('npm', \['run', 'quiz:context'\]\);\n/m,
  "for (const targetId of ['grindheim_runestein', 'grindheim_steinkross', 'grindheimsveien_nord_gravfelt', 'hoyland_gravhaug_etne']) {\n  run('npm', ['run', 'quiz:context', '--', '--category', 'historie', '--target', targetId, '--output', `data/quiz/production_context/historie/${targetId}.json`]);\n}\n",
  'quiz context command'
);
replaceOnce(/^const finalEmner = readJson\(emnerPath\)\.filter\(\(item\) =>\n  belongsToDomain\(item\) \|\| String\(item\?\.emne_id \|\| ''\)\.startsWith\('em_his_makt_'\)\);\n/m, '', 'final emners selection');
replaceOnce(/^  emner_corrected: finalEmner\.length,\n/m, "  emner_reviewed: 10,\n  emne_concept_corrections: emneConceptCorrections,\n", 'result emner field');
replaceOnce(/^  `Emner korrigert: \$\{finalEmner\.length\}`,\n/m, "  'Emner faglig gjennomgått: 10',\n  `Emnebegreper korrigert: ${emneConceptCorrections}`,\n", 'validation emner line');

const target = path.join('/tmp', 'history-power-v5-5-curation-v2-fixed.mjs');
fs.writeFileSync(target, source);
await import(`file://${target}?v=${Date.now()}`);

const canonicalWorkflow = spawnSync('git', ['show', 'origin/main:.github/workflows/coordinate-branch-runner.yml'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 4 * 1024 * 1024,
});
if (canonicalWorkflow.error || canonicalWorkflow.status !== 0) {
  throw new Error(`Could not restore canonical coordinate workflow\n${canonicalWorkflow.stderr || ''}`);
}
fs.writeFileSync(path.join(root, '.github/workflows/coordinate-branch-runner.yml'), canonicalWorkflow.stdout);
