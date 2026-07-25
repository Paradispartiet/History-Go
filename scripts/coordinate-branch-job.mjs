import fs from 'node:fs';
import path from 'node:path';

const domainId = 'his_velferd_rett_hverdagsliv';
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fagkart = read('data/fag/historie/fagkart_historie_canonical_v4_5.json');
const pensum = read('data/fag/historie/historiepensum_canonical_v4_5.json');
const emner = read('data/fag/historie/emner_historie_canonical_v4_5.json');
const methods = read('data/fag/historie/methods_historie_canonical_v4_5.json');
const mappings = read('data/fag/historie/emnemapping_historie_canonical_v4_5.json');
const generator = read('data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json');
const blueprint = read('data/fag/historie/historie_v5_blueprint.json');

const category = fagkart.categories.find((item) => item.id === domainId);
const domain = pensum.domains.find((item) => item.domain_id === domainId);
const emneIds = domain.emne_ids;
const methodIds = [...new Set([
  ...domain.method_ids,
  ...(category.topic_hooks || []).flatMap((hook) => hook.recommended_method_ids || [])
])];

const methodList = Array.isArray(methods) ? methods : (methods.methods || []);
const mappingList = Array.isArray(mappings) ? mappings : (mappings.mappings || mappings.emnemappings || []);

function collect(value, predicate, currentPath = '$', output = []) {
  if (!value || typeof value !== 'object') return output;
  if (!Array.isArray(value) && predicate(value)) output.push({ path: currentPath, object: value });
  if (Array.isArray(value)) value.forEach((item, index) => collect(item, predicate, `${currentPath}[${index}]`, output));
  else Object.entries(value).forEach(([key, child]) => collect(child, predicate, `${currentPath}.${key}`, output));
  return output;
}

const output = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  category,
  domain,
  emner: emner.filter((item) => emneIds.includes(item.emne_id)),
  methods: methodList.filter((item) => methodIds.includes(item.method_id || item.id)),
  mappings: mappingList.filter((item) => emneIds.includes(item.emne_id || item.target_emne_id || item.id)),
  generator_records: collect(generator, (item) => item.domain_id === domainId || emneIds.includes(item.emne_id) || emneIds.includes(item.target_emne_id)),
  v5_domain: collect(blueprint, (item) => item.id === domainId || item.domain_id === domainId)
};

const outPath = 'reports/historie-canonical-migration/velferd-phase5-compact-audit.json';
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`emner=${output.emner.length} methods=${output.methods.length} mappings=${output.mappings.length} generator=${output.generator_records.length} v5=${output.v5_domain.length}`);