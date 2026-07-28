import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const date = '2026-07-28';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content.endsWith('\n') ? content : `${content}\n`, 'utf8');

function replaceBetween(file, startMarker, endMarker, replacement) {
  const source = read(file);
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`${file} mangler startmarkør: ${startMarker}`);
  const bodyStart = start + startMarker.length;
  const end = source.indexOf(endMarker, bodyStart);
  if (end < 0) throw new Error(`${file} mangler sluttmarkør: ${endMarker}`);
  write(file, `${source.slice(0, bodyStart)}${replacement}${source.slice(end)}`);
}

function replaceOnce(file, needle, replacement) {
  const source = read(file);
  if (!source.includes(needle)) throw new Error(`${file} mangler forventet tekst: ${needle.slice(0, 120)}`);
  write(file, source.replace(needle, replacement));
}

function insertAfter(file, marker, addition) {
  const source = read(file);
  if (source.includes(addition.trim())) return;
  if (!source.includes(marker)) throw new Error(`${file} mangler markør: ${marker}`);
  write(file, source.replace(marker, `${marker}${addition}`));
}

const readingOrder = `1. [\`documentation_registry.json\`](./documentation_registry.json) — dokumentstatus, canonicalt eierskap og prioritet.
2. [\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md) — faktisitet, inspectable kilder, påstandssporing og forbud mot gjetting.
3. [\`DOMAIN_CONTRACT.md\`](./DOMAIN_CONTRACT.md) og [\`../data/categories/category_contract.json\`](../data/categories/category_contract.json) — canonical fag-ID-er, rekkefølge, visningsnavn og kategoriavgrensning.
4. [\`SUBJECT_FILE_CONTRACT.md\`](./SUBJECT_FILE_CONTRACT.md) — én universell fagmodell per fag og separate geografiske produksjonslag.
5. **Dette dokumentet** — fagsidearkitektur, materialisering, status, produksjonsrekkefølge og ferdigkrav.
6. [\`FAGVERK_NAVIGATION.md\`](./FAGVERK_NAVIGATION.md) — den smale navigasjonskontrakten for portal, merkesider, fagsider, dypkoblinger og stedssider.
7. [\`../README/README.pensum.md\`](../README/README.pensum.md) — forholdet mellom merke, fagkart, emner, quiz, Knowledge, learning log og pensumprogresjon.
8. [\`../README/fagstrukturREADME.md\`](../README/fagstrukturREADME.md) — operativ guide til manifest-resolverte fagpakker og filstruktur.
9. [\`DATA_PRODUCTION_CONTRACT.md\`](./DATA_PRODUCTION_CONTRACT.md) — produksjon og integrasjon av canonical data.
10. [\`KNOWLEDGE_ARCHITECTURE.md\`](./KNOWLEDGE_ARCHITECTURE.md), [\`../data/knowledge/knowledge_system_policy_v1.json\`](../data/knowledge/knowledge_system_policy_v1.json) og [\`../data/knowledge/knowledge_unit_schema_v1.json\`](../data/knowledge/knowledge_unit_schema_v1.json) — Knowledge-eierskap og kunnskapsenheter.
11. [\`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md\`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md), [\`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json\`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) og [\`../data/quiz/quiz_knowledge_delivery_contract_v1.json\`](../data/quiz/quiz_knowledge_delivery_contract_v1.json) — quizproduksjon, kategori-profiler og kunnskapsleveranse.
12. [\`PROGRESSION_MODEL.md\`](./PROGRESSION_MODEL.md) — progresjons-read-model og grensen mot eide lagringskilder.
13. [\`FAGVERK_PLACE_DESIGN.md\`](./FAGVERK_PLACE_DESIGN.md) — kategoridesign og bildekrav for fagverkets stedssider.
14. [\`PLACE_PRODUCTION_CHECKLIST.md\`](./PLACE_PRODUCTION_CHECKLIST.md) og [\`PLACE_STANDARD.md\`](./PLACE_STANDARD.md) — produksjon og ferdigstilling av konkrete steder som fagsiden lenker til.
15. [\`COMPLETION_DEFINITIONS.md\`](./COMPLETION_DEFINITIONS.md) og [\`HISTORY_GO_PRODUCT_MAP.md\`](./HISTORY_GO_PRODUCT_MAP.md) — overordnede ferdigbegreper og produktprioritet.
16. [\`TYPESCRIPT_FIRST_POLICY.md\`](./TYPESCRIPT_FIRST_POLICY.md) og [\`HISTORY_GO_TECHNICAL_ARCHITECTURE.md\`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md) — språkvalg, runtime-eierskap og målarkitektur.
17. [\`../README/README_DEV.md\`](../README/README_DEV.md) og [\`../README/TEAM_WORKFLOW.md\`](../README/TEAM_WORKFLOW.md) — kjøring, validering, branch-, PR- og mergeflyt.`;

replaceBetween(
  'docs/FAGVERK.md',
  'Arbeid med Fagverket skal starte i denne rekkefølgen:\n\n',
  '\n\nVed konflikt gjelder dokumentet som eier det aktuelle ansvarsområdet.',
  `${readingOrder}\n`
);

const fagMap = `1. [\`SUBJECT_FILE_CONTRACT.md\`](./SUBJECT_FILE_CONTRACT.md) — bindende regel om én universell fagmodell per fag og separate geografiske produksjonslag
2. [\`FAGVERK.md\`](./FAGVERK.md) — canonical arkitektur, produksjonsrekkefølge, status og ferdigkrav for alle fagsider
3. [\`FAGVERK_NAVIGATION.md\`](./FAGVERK_NAVIGATION.md) — bindende skille mellom Fagverkforsiden, merkesider, fagsider og stedssider
4. [\`FAGVERK_PLACE_DESIGN.md\`](./FAGVERK_PLACE_DESIGN.md) — kategori-, bilde- og presentasjonskontrakt for stedets egne fagverksider
5. [\`../README/README.pensum.md\`](../README/README.pensum.md) — fagkart, emner, Knowledge og progresjon
6. [\`../README/fagstrukturREADME.md\`](../README/fagstrukturREADME.md) — operativ guide til fagpakkens lag og manifest-resolverte filer
7. [\`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md\`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende quizproduksjonsprosedyre
8. [\`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json\`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge, globale invariants og kategori-profiler
9. [\`../data/fag/fag_manifest.json\`](../data/fag/fag_manifest.json) — filresolver, full fagpakke og aktive \`quizProduction.targets\`
10. [\`../data/quiz/manifest.json\`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett
11. [\`../README/quizREADME.md\`](../README/quizREADME.md) — compatibility-pointer til canonical produksjon, schemas, audits og runtime-eierskap`;

replaceBetween(
  'docs/README.md',
  '### Fag, emner og quiz\n\n',
  '\n\nFagfilene er universelle.',
  `${fagMap}\n`
);

insertAfter(
  'docs/DATA_PRODUCTION_CONTRACT.md',
  '| Fagverk-navigasjon | `docs/FAGVERK_NAVIGATION.md` |',
  '\n| Fagsidearkitektur og ferdigstilling | `docs/FAGVERK.md` |'
);

insertAfter(
  'README/README.pensum.md',
  'Den bindende regelen for fagfilenes geografiske ansvar ligger i `docs/SUBJECT_FILE_CONTRACT.md`: én universell fagmodell per fag, med separate geografiske profiler, cases, claims, kilder, steder, personer og quizlag.',
  '\n\nDen bindende arkitektur-, produksjons- og ferdigstillingskontrakten for de synlige fagsidene ligger i `docs/FAGVERK.md`.'
);

const registryPath = 'docs/documentation_registry.json';
const registry = JSON.parse(read(registryPath));
registry.last_verified = date;
const masterPath = 'docs/FAGVERK.md';
if (!registry.priority_order.includes(masterPath)) {
  const index = registry.priority_order.indexOf('docs/SUBJECT_FILE_CONTRACT.md');
  if (index < 0) throw new Error('priority_order mangler docs/SUBJECT_FILE_CONTRACT.md');
  registry.priority_order.splice(index + 1, 0, masterPath);
}

function upsertDocument(entry, afterPath) {
  const existing = registry.documents.findIndex((item) => item.path === entry.path);
  if (existing >= 0) registry.documents.splice(existing, 1);
  const anchor = registry.documents.findIndex((item) => item.path === afterPath);
  if (anchor < 0) throw new Error(`Dokumentregisteret mangler anker ${afterPath}`);
  registry.documents.splice(anchor + 1, 0, entry);
}

upsertDocument({
  path: masterPath,
  status: 'canonical',
  role: 'Bindende all-subject-kontrakt for fagsidearkitektur, normalisert modell, materialisering, produksjonsrekkefølge og redaksjonell ferdigstilling',
  owns: ['fagverk_subject_page_architecture', 'fagverk_subject_page_production'],
  last_verified: date
}, 'docs/SUBJECT_FILE_CONTRACT.md');

upsertDocument({
  path: 'docs/FAGVERK_NAVIGATION.md',
  status: 'canonical',
  role: 'Bindende navigasjonskontrakt for Fagverkforsiden, merkesider, fagsider, dypkoblinger og stedssider',
  owns: ['fagverk_navigation_contract'],
  last_verified: date
}, masterPath);

upsertDocument({
  path: 'docs/FAGVERK_PLACE_DESIGN.md',
  status: 'canonical',
  role: 'Bindende kategori-, bilde- og presentasjonskontrakt for fagverkets stedssider',
  owns: ['fagverk_place_design_contract'],
  last_verified: date
}, 'docs/FAGVERK_NAVIGATION.md');

const canonicalOwners = new Map();
for (const entry of registry.documents) {
  if (!['canonical', 'transitional'].includes(entry.status)) continue;
  for (const owner of entry.owns || []) {
    if (canonicalOwners.has(owner)) throw new Error(`${owner} eies både av ${canonicalOwners.get(owner)} og ${entry.path}`);
    canonicalOwners.set(owner, entry.path);
  }
}
write(registryPath, JSON.stringify(registry, null, 2));

for (const file of ['docs/FAGVERK.md', 'docs/README.md', 'docs/DATA_PRODUCTION_CONTRACT.md', 'README/README.pensum.md']) {
  const normalized = read(file).split('\n').map((line) => line.replace(/[\t ]+$/u, '')).join('\n');
  write(file, normalized);
}

console.log('Fagverk documentation governance finalized.');
