import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const date = '2026-07-28';
const contractPath = 'docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md';

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content.endsWith('\n') ? content : `${content}\n`, 'utf8');

function replaceOnce(file, needle, replacement) {
  const source = read(file);
  if (!source.includes(needle)) throw new Error(`${file} mangler forventet markør: ${needle.slice(0, 120)}`);
  write(file, source.replace(needle, replacement));
}

function insertAfter(file, marker, addition) {
  const source = read(file);
  if (source.includes(addition.trim())) return;
  if (!source.includes(marker)) throw new Error(`${file} mangler markør: ${marker}`);
  write(file, source.replace(marker, `${marker}${addition}`));
}

if (!fs.existsSync(path.join(root, contractPath))) throw new Error(`Mangler ${contractPath}`);
if (!fs.existsSync(path.join(root, 'tests/fagverk-documentation-contract.test.mjs'))) throw new Error('Mangler permanent dokumentasjonstest');

const registryFile = 'docs/documentation_registry.json';
const registry = JSON.parse(read(registryFile));
registry.last_verified = date;

if (!registry.priority_order.includes(contractPath)) {
  const anchor = registry.priority_order.indexOf('docs/SUBJECT_FILE_CONTRACT.md');
  if (anchor < 0) throw new Error('priority_order mangler docs/SUBJECT_FILE_CONTRACT.md');
  registry.priority_order.splice(anchor + 1, 0, contractPath);
}

function upsert(entry, afterPath) {
  const oldIndex = registry.documents.findIndex((item) => item.path === entry.path);
  if (oldIndex >= 0) registry.documents.splice(oldIndex, 1);
  const anchor = registry.documents.findIndex((item) => item.path === afterPath);
  if (anchor < 0) throw new Error(`Registeret mangler anker ${afterPath}`);
  registry.documents.splice(anchor + 1, 0, entry);
}

upsert({
  path: contractPath,
  status: 'canonical',
  role: 'Bindende kontrakt for generell fagsidemotor, adaptere, produksjonsstatus, claims, reviews, materialisering og ferdigstilling av alle fag',
  owns: [
    'fagverk_subject_page_contract',
    'fagverk_subject_page_status_model',
    'fagverk_chapter_production_gate'
  ],
  last_verified: date
}, 'docs/SUBJECT_FILE_CONTRACT.md');

upsert({
  path: 'docs/FAGVERK_NAVIGATION.md',
  status: 'canonical',
  role: 'Bindende navigasjonskontrakt for Fagverkforsiden, merkesider, fagsider og portalstatus',
  owns: ['fagverk_navigation_contract'],
  last_verified: date
}, contractPath);

upsert({
  path: 'docs/FAGVERK.md',
  status: 'operational',
  role: 'Operativ implementasjonsguide for dagens politikkfagverk, runtime, stedskoblinger og QA',
  owns: ['fagverk_politikk_implementation_guide'],
  last_verified: date
}, 'docs/FAGVERK_NAVIGATION.md');

upsert({
  path: 'docs/FAGVERK_PLACE_DESIGN.md',
  status: 'canonical',
  role: 'Bindende kategori-, bilde- og presentasjonskontrakt for stedets egne fagverksider',
  owns: ['fagverk_place_design_contract'],
  last_verified: date
}, 'docs/FAGVERK.md');

const owners = new Map();
for (const entry of registry.documents) {
  for (const owner of entry.owns || []) {
    if (entry.status !== 'canonical' && entry.status !== 'transitional') continue;
    if (owners.has(owner)) throw new Error(`${owner} eies av både ${owners.get(owner)} og ${entry.path}`);
    owners.set(owner, entry.path);
  }
}
write(registryFile, JSON.stringify(registry, null, 2));

replaceOnce(
  'docs/README.md',
  `1. [\`SUBJECT_FILE_CONTRACT.md\`](./SUBJECT_FILE_CONTRACT.md) — bindende regel om én universell fagmodell per fag og separate geografiske produksjonslag
2. [\`../README/README.pensum.md\`](../README/README.pensum.md) — fagkart, emner og pensum
3. [\`../README/fagstrukturREADME.md\`](../README/fagstrukturREADME.md) — operativ guide til fagpakkens lag og manifest-resolverte filer
4. [\`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md\`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende quizproduksjonsprosedyre
5. [\`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json\`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge, globale invariants og kategori-profiler
6. [\`../data/fag/fag_manifest.json\`](../data/fag/fag_manifest.json) — filresolver, full fagpakke og aktive \`quizProduction.targets\`
7. [\`../data/quiz/manifest.json\`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett
8. [\`../README/quizREADME.md\`](../README/quizREADME.md) — compatibility-pointer til canonical produksjon, schemas, audits og runtime-eierskap`,
  `1. [\`SUBJECT_FILE_CONTRACT.md\`](./SUBJECT_FILE_CONTRACT.md) — bindende regel om én universell fagmodell per fag og separate geografiske produksjonslag
2. [\`FAGVERK_SUBJECT_PAGE_CONTRACT.md\`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md) — bindende kontrakt for generell fagsidemotor, materialisering, claims, reviews og ferdigstatus
3. [\`FAGVERK_NAVIGATION.md\`](./FAGVERK_NAVIGATION.md) — bindende skille mellom Fagverkforsiden, merkesider og fagsider
4. [\`FAGVERK_PLACE_DESIGN.md\`](./FAGVERK_PLACE_DESIGN.md) — bindende kategori-, bilde- og presentasjonskontrakt for stedets egne fagverksider
5. [\`../README/README.pensum.md\`](../README/README.pensum.md) — fagkart, emner, Knowledge og progresjon
6. [\`../README/fagstrukturREADME.md\`](../README/fagstrukturREADME.md) — operativ guide til fagpakkens lag og manifest-resolverte filer
7. [\`../data/fag/fag_manifest.json\`](../data/fag/fag_manifest.json) — filresolver og aktiv canonical fagpakke per fag
8. [\`FAGVERK.md\`](./FAGVERK.md) — operativ beskrivelse av dagens politikkimplementasjon
9. [\`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md\`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende quizproduksjonsprosedyre
10. [\`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json\`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge, globale invariants og kategori-profiler
11. [\`../data/quiz/manifest.json\`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett
12. [\`../README/quizREADME.md\`](../README/quizREADME.md) — compatibility-pointer til canonical produksjon, schemas, audits og runtime-eierskap`
);

insertAfter(
  'docs/README.md',
  'Fagfilene er universelle. Land, regioner og byer skal legge til profiler, mappings, cases, claims, kilder, steder, personer og quizinnhold som refererer til de samme canonical fag-ID-ene; de skal ikke opprette komplette fagkopier.',
  ' Bygging og ferdigstilling av de synlige fagsidene styres av `FAGVERK_SUBJECT_PAGE_CONTRACT.md`; en fungerende URL eller grønn schema-kontroll er ikke i seg selv ferdigbevis.'
);

insertAfter(
  'DOCS.md',
  '- Fag og pensum: [`README/README.pensum.md`](./README/README.pensum.md)',
  '\n- Fagsider og fagverk: [`docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md)'
);

replaceOnce('docs/FAGVERK.md', 'Status: canonical politikk-integrasjon v4', 'Status: **operational politikk-implementasjon v4**');
insertAfter(
  'docs/FAGVERK.md',
  'Sider: `fagverk-forside.html`, `data/fag/politikk/merke_politikk.html`, `fagverk.html?subject=politikk`, `fagverk-sted.html?place=<place_id>`',
  '\n\nCanonical kontrakt for bygging og ferdigstilling av alle fagsider: [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md)\n\nNavigasjon og sideroller: [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md)\n\nDette dokumentet beskriver dagens politikkimplementasjon og eksisterende runtime. Det eier ikke den generelle produksjons- eller ferdigstatusmodellen for alle fag.'
);

insertAfter(
  'docs/FAGVERK_NAVIGATION.md',
  'Register: `data/fagverk/fagverk_portal.json`',
  '\nProduksjon og ferdigstilling: [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md)\n\nDenne filen eier bare navigasjon, adresser og sideroller. Den generelle motoren, statusmodellen, claims, reviews og ferdigkriteriene eies av fagsidekontrakten.'
);

insertAfter(
  'docs/FAGVERK_PLACE_DESIGN.md',
  'Materialisert status: `data/places/place_image_backlog_summary.json`',
  '\nOverordnet fagsideproduksjon: [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md)\n\nDenne kontrakten gjelder stedets fagverksider. Den eier ikke den generelle fagsiden for et helt fag.'
);

insertAfter(
  'docs/SUBJECT_FILE_CONTRACT.md',
  'Denne kontrakten definerer skillet mellom universell fagstruktur og geografisk innholdsproduksjon. Den gjelder alle fag, ikke bare Historie.',
  '\n\nHvordan de universelle fagfilene materialiseres som synlige fagsider, lærekapitler, claims og ferdigstatus eies av [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md). Denne filen eier fagdataarkitekturen, ikke fagsidens presentasjons- og produksjonsstatus.'
);

insertAfter(
  'docs/DATA_PRODUCTION_CONTRACT.md',
  '| Fagverk-navigasjon | `docs/FAGVERK_NAVIGATION.md` |',
  '\n| Fagsideproduksjon | `docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md` |'
);

insertAfter(
  'README/README.pensum.md',
  'Den bindende regelen for fagfilenes geografiske ansvar ligger i `docs/SUBJECT_FILE_CONTRACT.md`: én universell fagmodell per fag, med separate geografiske profiler, cases, claims, kilder, steder, personer og quizlag.',
  '\n\nDen bindende produksjons- og ferdigstillingskontrakten for de synlige fagsidene ligger i `docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md`.'
);

for (const file of [
  'DOCS.md',
  'README/README.pensum.md',
  'docs/README.md',
  'docs/FAGVERK.md',
  'docs/FAGVERK_NAVIGATION.md',
  'docs/FAGVERK_PLACE_DESIGN.md',
  'docs/SUBJECT_FILE_CONTRACT.md',
  'docs/DATA_PRODUCTION_CONTRACT.md'
]) {
  const normalized = read(file).split('\n').map((line) => line.replace(/[\t ]+$/u, '')).join('\n');
  write(file, normalized);
}

console.log('Fresh-main fagverk documentation governance materialized.');
