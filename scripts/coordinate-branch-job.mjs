#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_byhistorie_stedsendring';

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));
const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');
const domainConcepts = concepts.filter((item) => item.domain_ids?.includes(domainId));
const domainTheories = theories.filter((item) => item.domain_ids?.includes(domainId));
const domainEmner = emner.filter((item) => item.area_id === domainId);

const output = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  counts: {
    concepts: domainConcepts.length,
    theories: domainTheories.length,
    emner: domainEmner.length
  },
  concepts: domainConcepts,
  theories: domainTheories,
  emner: domainEmner
};

fs.mkdirSync(reportDir, {recursive: true});
const outputPath = path.join(reportDir, 'byhistorie-curation-inventory.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(JSON.stringify(output.counts));
