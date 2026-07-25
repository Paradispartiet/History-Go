import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const domainId = 'his_katastrofer_brudd_ulykker';
const concepts = JSON.parse(fs.readFileSync(path.join(root, 'data/fag/historie/concepts_historie_canonical_v5_5.json'), 'utf8'));
const theories = JSON.parse(fs.readFileSync(path.join(root, 'data/fag/historie/theory_objects_historie_canonical_v5_5.json'), 'utf8'));
const emner = JSON.parse(fs.readFileSync(path.join(root, 'data/fag/historie/emner_historie_canonical_v4_5.json'), 'utf8'));
const belongs = (item) => item?.domain_id === domainId || item?.domain_ids?.includes(domainId) || item?.explanatory_scope?.includes(domainId);
const domainConcepts = concepts.filter(belongs);
const domainTheories = theories.filter(belongs);
const theoryEmneIds = domainTheories
  .map((item) => String(item.theory_id || '').replace(/^theory_/, 'em_'));
const sourceEmneIds = domainTheories.flatMap((item) => item.source_emne_ids || []);
const emneIds = [...new Set([...theoryEmneIds, ...sourceEmneIds])];
const domainEmner = emneIds.map((id) => emner.find((item) => item.emne_id === id)).filter(Boolean);
const report = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  counts: { concepts: domainConcepts.length, theories: domainTheories.length, emner: domainEmners.length },
  concepts: domainConcepts,
  theories: domainTheories,
  emners: domainEmners
};
const out = path.join(root, 'reports/historie-v5/katastrofer-brudd-ulykker-inventory.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  domain_id: domainId,
  counts: report.counts,
  concept_ids: domainConcepts.map((item) => [item.concept_id, item.label, item.status]),
  theory_ids: domainTheories.map((item) => [item.theory_id, item.label]),
  emne_ids: domainEmners.map((item) => [item.emne_id, item.title || item.label])
}, null, 2));
