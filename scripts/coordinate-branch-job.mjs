import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const emnerPath = path.join(root, 'data/fag/historie/emner_historie_canonical_v4_5.json');
const conceptsPath = path.join(root, 'data/fag/historie/concepts_historie_canonical_v5_5.json');
const emner = JSON.parse(fs.readFileSync(emnerPath, 'utf8'));
const concepts = JSON.parse(fs.readFileSync(conceptsPath, 'utf8'));
const domainId = 'his_katastrofer_brudd_ulykker';
const domainLabels = new Set(
  concepts
    .filter((item) => item?.domain_ids?.includes(domainId))
    .map((item) => item.label)
    .filter(Boolean)
);
const explicitLegacyIds = new Set([
  'em_his_branner_ulykker_brudd',
  'em_his_gjenoppbygging_minne',
  'em_his_terror_samtidshistorie'
]);

const candidates = emner.filter((item) => {
  const id = String(item.emne_id || '');
  const title = String(item.title || item.label || '').toLowerCase();
  const conceptLabels = [...(item.core_concepts || []), ...(item.sub_concepts || [])];
  const overlap = conceptLabels.filter((label) => domainLabels.has(label)).length;
  return id.startsWith('em_his_katastrofer_brudd_') ||
    explicitLegacyIds.has(id) ||
    /katastrof|ulykke|brann|terror|gjenoppbygg|resilien|beredskap|kriseled|miljøskade|systemulykke/.test(title) ||
    overlap >= 3;
});

const compact = candidates.map((item) => ({
  emne_id: item.emne_id,
  title: item.title || item.label || null,
  core_concepts: item.core_concepts || [],
  sub_concepts: item.sub_concepts || [],
  theory_ids: item.theory_ids || [],
  method_ids: item.method_ids || [],
  source_hook_id: item.source_hook_id || null
}));

const out = path.join(root, 'reports/historie-v5/katastrofer-brudd-ulykker-emne-inventory.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  candidate_count: compact.length,
  candidates: compact
}, null, 2)}\n`);
console.log(JSON.stringify({
  domain_id: domainId,
  candidate_count: compact.length,
  candidates: compact
}, null, 2));
