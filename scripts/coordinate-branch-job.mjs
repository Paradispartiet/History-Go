import fs from 'node:fs';
import path from 'node:path';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};

const files = {
  pensum: 'data/fag/historie/historiepensum_canonical_v4_5.json',
  fagkart: 'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  emner: 'data/fag/historie/emner_historie_canonical_v4_5.json',
  methods: 'data/fag/historie/methods_historie_canonical_v4_5.json',
  mapping: 'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
  generator: 'data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json',
  tests: 'tests/quiz-production-pipeline.test.mjs'
};

const data = Object.fromEntries(Object.entries(files).filter(([k]) => k !== 'tests').map(([k, f]) => [k, read(f)]));
const phase8 = 'his_minne_kulturarv_historiebruk';
const phase7 = 'his_migrasjon_minoritet_tilhorighet';
const p8Domain = data.pensum.domains.find((x) => x.domain_id === phase8);
const p7Domain = data.pensum.domains.find((x) => x.domain_id === phase7);
if (!p8Domain || !p7Domain) throw new Error('Missing phase 7 or phase 8 domain');

const arrays = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, { length: v.length, sample_keys: v[0] && typeof v[0] === 'object' ? Object.keys(v[0]) : [] }]));
const topShape = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { keys: Object.keys(v), arrays: arrays(v) }]));

const allObjects = (value, out = []) => {
  if (Array.isArray(value)) for (const item of value) allObjects(item, out);
  else if (value && typeof value === 'object') {
    out.push(value);
    for (const child of Object.values(value)) allObjects(child, out);
  }
  return out;
};

const objectsByAnyId = (root, ids) => allObjects(root).filter((obj) => Object.values(obj).some((v) => typeof v === 'string' && ids.includes(v)));
const textMatches = (root, terms) => allObjects(root).filter((obj) => {
  const text = JSON.stringify(obj).toLowerCase();
  return terms.some((term) => text.includes(term));
});

const phase8Ids = [phase8, ...p8Domain.emne_ids, ...p8Domain.hook_ids, ...p8Domain.method_ids];
const phase7Ids = [phase7, ...p7Domain.emne_ids, ...p7Domain.hook_ids, ...p7Domain.method_ids];
const compactUnique = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const report = {
  generated_at: new Date().toISOString(),
  files,
  top_shape: topShape,
  phase8_domain: p8Domain,
  phase7_domain: p7Domain,
  phase8_objects: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, compactUnique(objectsByAnyId(v, phase8Ids))])),
  phase7_objects: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, compactUnique(objectsByAnyId(v, phase7Ids))])),
  minne_keyword_objects: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, compactUnique(textMatches(v, ['kulturarv', 'historiebruk', 'minnested', 'monument', 'minnepolitikk'])).slice(0, 80)])),
  test_snippets: fs.readFileSync(files.tests, 'utf8').split('\n').filter((line) => /85 emner|75 hooks|48 metoder|85 mappinger|migrasjon|historie production context/i.test(line)).slice(0, 120)
};

write('reports/historie-canonical-migration/phase8-audit.json', report);
fs.rmSync('scripts/coordinate-branch-job.mjs');
console.log('Wrote compact phase 8 audit and removed one-shot script.');
