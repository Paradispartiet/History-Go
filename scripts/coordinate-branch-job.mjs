import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const read = async (relativePath) => JSON.parse(await fs.readFile(path.resolve(root, relativePath), 'utf8'));

const fagkart = await read('data/fag/historie/fagkart_historie_canonical_v4_5.json');
const pensum = await read('data/fag/historie/historiepensum_canonical_v4_5.json');
const emnerRaw = await read('data/fag/historie/emner_historie_canonical_v4_5.json');
const mappingsRaw = await read('data/fag/historie/emnemapping_historie_canonical_v4_5.json');
const methodsRaw = await read('data/fag/historie/methods_historie_canonical_v4_5.json');
const generator = await read('data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json');

const emner = Array.isArray(emnerRaw) ? emnerRaw : emnerRaw.emner || [];
const mappings = Array.isArray(mappingsRaw) ? mappingsRaw : mappingsRaw.mappings || [];
const methods = methodsRaw.methods || [];
const domainId = 'his_industri_arbeid_sosialhistorie';
const neighborIds = [
  'his_velferd_rett_hverdagsliv',
  'his_migrasjon_minoritet_tilhorighet',
  'his_byhistorie_stedsendring',
  'his_makt_stat_institusjoner'
];

const domain = pensum.domains.find((item) => item.domain_id === domainId);
if (!domain) throw new Error(`Missing domain ${domainId}`);
const category = fagkart.categories.find((item) => item.id === domainId);
if (!category) throw new Error(`Missing category ${domainId}`);
const emneIds = domain.emne_ids || [];
const methodIds = domain.method_ids || [];

const report = {
  generated_at: new Date().toISOString(),
  source_commit: process.env.GITHUB_SHA || null,
  counts: {
    total_domains: pensum.domains.length,
    total_emner: emner.length,
    total_mappings: mappings.length,
    total_methods: methods.length,
    total_hooks: fagkart.categories.flatMap((item) => item.topic_hooks || []).length
  },
  target: {
    category,
    domain,
    emner: emner.filter((item) => emneIds.includes(item.emne_id)),
    mappings: mappings.filter((item) => emneIds.includes(item.emne_id)),
    methods: methods.filter((item) => methodIds.includes(item.method_id)),
    generator_profile: generator.domain_profiles?.[domainId] || null
  },
  neighbors: neighborIds.map((neighborId) => {
    const neighborDomain = pensum.domains.find((item) => item.domain_id === neighborId);
    return {
      category: fagkart.categories.find((item) => item.id === neighborId) || null,
      domain: neighborDomain || null,
      emne_summaries: emner
        .filter((item) => (neighborDomain?.emne_ids || []).includes(item.emne_id))
        .map((item) => ({
          emne_id: item.emne_id,
          title: item.title,
          definition: item.definition,
          avgrensning: item.avgrensning,
          source_requirements: item.source_requirements,
          recommended_method_ids: item.recommended_method_ids
        }))
    };
  }),
  normal_opening_contract: generator.normal_opening_contract,
  canonical_inputs: generator.canonical_inputs
};

const output = path.resolve(root, 'reports/historie-canonical-migration/industri-arbeid-phase4-research.json');
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(root, output)}`);
