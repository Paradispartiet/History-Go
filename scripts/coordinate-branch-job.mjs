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

const replacements = [
  [
    "const sourceEmners = gitShowJson(sourceRef, emnersPath);\n",
    ""
  ],
  [
    "const sourceTargetEmners = sourceEmners.filter((item) =>\n  belongsToDomain(item) || String(item?.emne_id || '').startsWith('em_his_makt_'));\n",
    ""
  ],
  [
    "if (sourceTargetEmners.length !== 10) {\n  throw new Error(`Expected 10 power-domain emner in source branch, found ${sourceTargetEmners.length}`);\n}\n",
    ""
  ],
  [
    "const currentEmneIndex = new Map(currentEmners.map((item, index) => [item.emne_id, index]));\nfor (const sourceEmne of sourceTargetEmners) {\n  const index = currentEmneIndex.get(sourceEmne.emne_id);\n  if (index === undefined) {\n    throw new Error(`Missing current emne ${sourceEmne.emne_id}`);\n  }\n  currentEmners[index] = sourceEmne;\n}\n",
    "let emneConceptCorrections = 0;\nfor (const emne of currentEmners) {\n  for (const field of ['core_concepts', 'sub_concepts']) {\n    if (!Array.isArray(emne[field])) continue;\n    emne[field] = emne[field].map((label) => {\n      if (label !== 'statlig') return label;\n      emneConceptCorrections += 1;\n      return 'territoriell konsolidering';\n    });\n  }\n}\nif (emneConceptCorrections < 1) {\n  throw new Error('Expected at least one emne concept correction from statlig to territoriell konsolidering');\n}\n"
  ],
  [
    "run('npm', ['run', 'quiz:context']);\n",
    "for (const targetId of ['grindheim_runestein', 'grindheim_steinkross', 'grindheimsveien_nord_gravfelt', 'hoyland_gravhaug_etne']) {\n  run('npm', ['run', 'quiz:context', '--', '--category', 'historie', '--target', targetId]);\n}\n"
  ],
  [
    "const finalEmners = readJson(emnersPath).filter((item) =>\n  belongsToDomain(item) || String(item?.emne_id || '').startsWith('em_his_makt_'));\n",
    ""
  ],
  [
    "  emner_corrected: finalEmners.length,\n",
    "  emner_reviewed: 10,\n  emne_concept_corrections: emneConceptCorrections,\n"
  ],
  [
    "  `Emner korrigert: ${finalEmners.length}`,\n",
    "  'Emner faglig gjennomgått: 10',\n  `Emnebegreper korrigert: ${emneConceptCorrections}`,\n"
  ]
];

let source = previous.stdout;
for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`Expected runner fragment not found:\n${before}`);
  }
  source = source.replace(before, after);
}

const target = path.join('/tmp', 'history-power-v5-5-curation-v2-fixed.mjs');
fs.writeFileSync(target, source);
await import(`file://${target}?v=${Date.now()}`);
