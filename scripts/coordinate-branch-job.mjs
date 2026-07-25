import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit', encoding: 'utf8' });

const paths = {
  pensum: 'data/fag/historie/historiepensum_canonical_v4_5.json',
  fagkart: 'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  emner: 'data/fag/historie/emner_historie_canonical_v4_5.json',
  methods: 'data/fag/historie/methods_historie_canonical_v4_5.json',
  mapping: 'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
  generator: 'data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json'
};
const data = Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, read(p)]));
const ids = {
  p8: 'his_minne_kulturarv_historiebruk',
  p7: 'his_migrasjon_minoritet_tilhorighet'
};
const domain = (id) => data.pensum.domains.find((x) => x.domain_id === id);
const p8 = domain(ids.p8);
const p7 = domain(ids.p7);
if (!p8 || !p7) throw new Error('Missing phase domain');

const directObjectMatch = (value, id) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = directObjectMatch(item, id);
      if (hit) return hit;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  if (Object.values(value).some((v) => typeof v === 'string' && v === id)) return value;
  for (const child of Object.values(value)) {
    const hit = directObjectMatch(child, id);
    if (hit) return hit;
  }
  return null;
};

const exact = (d) => ({
  domain: d,
  category: data.fagkart.categories.find((x) => x.id === d.domain_id),
  emner: data.emner.filter((x) => d.emne_ids.includes(x.emne_id)),
  methods: data.methods.methods.filter((x) => d.method_ids.includes(x.method_id)),
  mappings: data.mapping.filter((x) => d.emne_ids.includes(x.emne_id)),
  generator_profile: directObjectMatch(data.generator.domain_profiles, d.domain_id),
  emne_blueprints: d.emne_ids.map((id) => directObjectMatch(data.generator, id)).filter(Boolean)
});

const report = {
  generated_at: new Date().toISOString(),
  counts: {
    domains: data.pensum.domains.length,
    categories: data.fagkart.categories.length,
    emner: data.emner.length,
    methods: data.methods.methods.length,
    mappings: data.mapping.length
  },
  shapes: {
    category: Object.keys(data.fagkart.categories[0] || {}),
    emne: Object.keys(data.emner[0] || {}),
    method: Object.keys(data.methods.methods[0] || {}),
    mapping: Object.keys(data.mapping[0] || {}),
    generator_profile: Object.keys(directObjectMatch(data.generator.domain_profiles, ids.p7) || {})
  },
  phase8: exact(p8),
  phase7_template: exact(p7)
};

const out = 'reports/historie-canonical-migration/phase8-compact-audit.json';
write(out, report);
fs.rmSync('scripts/coordinate-branch-job.mjs');
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', out, 'scripts/coordinate-branch-job.mjs']);
run('git', ['commit', '-m', 'Report compact Historie phase 8 audit']);
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
if (!branch) throw new Error('Could not resolve branch name');
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published compact phase 8 audit.');
