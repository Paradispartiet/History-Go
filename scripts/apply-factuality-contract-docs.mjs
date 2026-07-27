import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const write = (relative, content) => fs.writeFileSync(path.join(root, relative), content.endsWith('\n') ? content : `${content}\n`);

function replaceOnce(content, before, after, label) {
  if (!content.includes(before)) throw new Error(`Missing anchor for ${label}`);
  return content.replace(before, after);
}

let people = read('docs/PEOPLE_POPUP_SYSTEM.md');
people = people.replace('Sist kontrollert: **2026-07-26**', 'Sist kontrollert: **2026-07-27**');
people = replaceOnce(
  people,
  'Readiness-audit: `tools/audit-people-popup-readiness.mts`  ',
  'Readiness-audit: `tools/audit-people-popup-readiness.mts`  \nFaktisitetskontrakt: `docs/FACTUALITY_CONTRACT.md`  ',
  'people factuality metadata',
);
people = replaceOnce(
  people,
  '## 1. Rolle og avgrensning',
  `## 0. Faktisitetsgate\n\nAlle people-profiler følger [\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md). Ingen dato, rolle, utdanning, produksjon, publikasjon, stedskobling, vurdering eller annen detalj skal fylles inn fordi den virker sannsynlig eller gjør profilen mer komplett.\n\n- En språkmodell er aldri en faktakilde.\n- Hver brukerrettet faktapåstand skal kunne spores til en inspectable kilde som faktisk støtter påstanden.\n- Manglende informasjon skal utelates, ikke rekonstrueres.\n- Kilder skal leses; det er ikke nok at en URL finnes.\n- Motstridende eller utilstrekkelige kilder skal føre til utelatelse eller eksplisitt dokumentert usikkerhet.\n- Readiness, schema, grønne tester og \`verifiedAt\` er ikke bevis på historisk korrekthet.\n\nEn profilebatch skal stoppes dersom navn, livsdata, verk, roller eller stedstilknytninger ikke kan verifiseres. Framdrift og visuell fylde er alltid underordnet sannhet.\n\n## 1. Rolle og avgrensning`,
  'people factuality gate',
);
people = replaceOnce(
  people,
  '- interne auditnotater og rapportstier skal ikke vises som brukerrettede kilder.',
  `- interne auditnotater og rapportstier skal ikke vises som brukerrettede kilder;\n- kildeantall alene er ikke verifikasjon: hver dato, rolle, produksjon og stedskobling må faktisk støttes av kildematerialet;\n- en generell biografiside kan ikke brukes som bevis for et verk eller en produksjon den ikke omtaler;\n- PR- eller researchmaterialet skal dokumentere hvilke kilder som støtter hvilke grupper av påstander.`,
  'people source rules',
);
people = replaceOnce(
  people,
  'Poengsummen er et produksjonsverktøy, ikke historisk kvalitetsdom. En person kan være viktig selv om profilen er `sparse`. Auditen avgjør heller ikke om personen er relevant for stedet; dette eies fortsatt av `people-of-places-method.md`.',
  `Poengsummen er et produksjonsverktøy, ikke historisk kvalitetsdom. En person kan være viktig selv om profilen er \`sparse\`. Auditen avgjør heller ikke om personen er relevant for stedet; dette eies fortsatt av \`people-of-places-method.md\`.\n\n**Viktig:** \`complete\` betyr bare at profilen har høy feltdekning. Statusen betyr ikke \`source_verified\`, og skal aldri omtales som faktaverifisert uten en egen påstand-for-påstand-kontroll etter \`FACTUALITY_CONTRACT.md\`.`,
  'people readiness caveat',
);
people = replaceOnce(
  people,
  '- minst to inspectable kilder, helst fire for sentrale profiler;',
  `- minst to inspectable kilder, helst fire for sentrale profiler;\n- dokumentert påstand-for-påstand-kontroll av navn, datoer, roller, verk og alle stedskoblinger;\n- ingen felt som er fylt bare for å øke readiness-score eller oppnå et ønsket antall verk;`,
  'people production requirements',
);
people = replaceOnce(
  people,
  '3. kjør `node --test tests/people-popup-system-contract.test.mjs`;',
  '3. kjør `node --test tests/people-popup-system-contract.test.mjs tests/factuality-contract.test.mjs`;',
  'people QA factuality test',
);
people = replaceOnce(
  people,
  '- `docs/PEOPLE_POPUP_SYSTEM.md` eier presentasjons- og feltkontrakten.',
  '- `docs/PEOPLE_POPUP_SYSTEM.md` eier presentasjons- og feltkontrakten.\n- `docs/FACTUALITY_CONTRACT.md` eier den overordnede regelen om sannhet, kildeverifikasjon, usikkerhet og forbud mot gjetting.',
  'people ownership',
);
write('docs/PEOPLE_POPUP_SYSTEM.md', people);

let method = read('docs/people-of-places-method.md');
method = method.replace('Sist kontrollert: **2026-07-26**', 'Sist kontrollert: **2026-07-27**');
method = replaceOnce(
  method,
  'Data-/manifestkontrakt: [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md)  ',
  'Data-/manifestkontrakt: [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md)  \nFaktisitetskontrakt: [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md)  ',
  'method factuality metadata',
);
method = replaceOnce(
  method,
  '## Formål',
  `## Bindende faktisitetsgate\n\nDenne metoden er underlagt [\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md). En person–sted-kobling skal aldri opprettes fordi den virker sannsynlig, fordi personen arbeidet i samme bransje, eller fordi koblingen gir bedre dekning.\n\nHver kobling må ha en inspectable kilde som dokumenterer den konkrete forbindelsen. Kilden skal leses og må faktisk støtte rollen, perioden, hendelsen, verket eller oppholdet som dataene uttrykker. En generell personbiografi uten omtale av stedet er ikke tilstrekkelig. En språkmodell, tidligere History GO-tekst eller kandidatrapport er ikke en faktakilde.\n\nHvis forbindelsen ikke kan verifiseres, skal kandidaten avvises eller feltet utelates.\n\n## Formål`,
  'method factuality gate',
);
method = replaceOnce(
  method,
  'Kildene skal underbygge selve stedskoblingen, ikke bare personens generelle biografi.',
  `Kildene skal underbygge selve stedskoblingen, ikke bare personens generelle biografi. Kildeantall er ikke nok: batchen skal dokumentere hvilken kilde som støtter hvilken forbindelse, rolle, periode eller hendelse.`,
  'method source mapping',
);
method = replaceOnce(
  method,
  '4. Dokumenter den konkrete stedstilknytningen med autoritative kilder.',
  '4. Åpne og les autoritative kilder, og dokumenter den konkrete stedstilknytningen påstand for påstand.',
  'method workflow source read',
);
method = replaceOnce(
  method,
  '- at duplikatsøk er gjennomført;',
  `- at duplikatsøk er gjennomført;\n- hvilke inspectable kilder som faktisk er lest;\n- hvilke navn, datoer, roller, verk, perioder og stedskoblinger hver kilde støtter;\n- hvilke detaljer som ble utelatt eller avvist fordi de ikke kunne verifiseres;\n- at ingen felt er fylt for å øke dekning, readiness eller profilens visuelle fylde;`,
  'method batch factuality gate',
);
method = replaceOnce(
  method,
  'Endringer som svekker relevanskravet, tillater generiske koblinger eller senker dokumentasjonskravet skal behandles som en eksplisitt metodeendring, ikke som en lokal batchavgjørelse.',
  `Endringer som svekker relevanskravet, tillater generiske koblinger eller senker dokumentasjonskravet skal behandles som en eksplisitt metodeendring, ikke som en lokal batchavgjørelse. Ingen lokal metodeendring kan overstyre \`FACTUALITY_CONTRACT.md\`.`,
  'method maintenance factuality',
);
write('docs/people-of-places-method.md', method);

let data = read('docs/DATA_PRODUCTION_CONTRACT.md');
data = data.replace('Last verified: 2026-07-26', 'Last verified: 2026-07-27');
data = replaceOnce(
  data,
  'docs/DOMAIN_CONTRACT.md\n',
  'docs/FACTUALITY_CONTRACT.md\ndocs/DOMAIN_CONTRACT.md\n',
  'data related factuality',
);
data = replaceOnce(
  data,
  '## 1. One place ID, one canonical place object',
  `## 0. Factuality and source verification\n\nAll user-facing data production is governed by [\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md). Never invent, guess, interpolate or silently complete missing facts. A language model, an existing History GO description or a generated candidate report is not a factual source.\n\nEvery published factual claim must be traceable to an inspectable source that actually supports the claim. Missing information must remain missing. When sources conflict and the conflict cannot be resolved, omit the field or describe the uncertainty only when the uncertainty itself is sourced and relevant.\n\nSchema validity, field coverage, readiness scores, green CI and \`verifiedAt\` do not prove factual correctness. Content production must stop when source coverage is insufficient.\n\n## 1. One place ID, one canonical place object`,
  'data factuality section',
);
data = replaceOnce(
  data,
  '8. Any progression-changing code must dispatch:',
  `8. Each new or materially changed user-facing factual claim must be checked against the source used for it.\n9. Batch material must identify which sources support names, dates, roles, works, results, events and place links.\n10. Unverified details must be omitted, not filled for completeness.\n11. Any progression-changing code must dispatch:`,
  'data validation factuality',
);
data = replaceOnce(
  data,
  'Minimal, source-first data work is preferred over broad refactors.',
  `Minimal, source-first data work is preferred over broad refactors. Source-first means that the source is opened and read before the claim is written; it does not mean merely attaching a plausible URL afterward.`,
  'data source first clarification',
);
write('docs/DATA_PRODUCTION_CONTRACT.md', data);

let docsReadme = read('docs/README.md');
docsReadme = docsReadme.replace('Sist kontrollert: **2026-07-26**', 'Sist kontrollert: **2026-07-27**');
docsReadme = replaceOnce(
  docsReadme,
  '> Én sannhet per ansvarsområde.',
  `> Én sannhet per ansvarsområde.\n\n[\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md) gjelder alle brukerrettede fakta: ingen opplysning skal diktes, gjettes eller fylles inn for å skape completeness. Manglende eller uavklart informasjon skal utelates.`,
  'docs readme ground rule',
);
docsReadme = replaceOnce(
  docsReadme,
  '1. [`DOMAIN_CONTRACT.md`](./DOMAIN_CONTRACT.md) — bindende kategoribeslutninger',
  '1. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) — overordnet canonical regel for sannhet, kildeverifikasjon, usikkerhet og forbud mot gjetting\n2. [`DOMAIN_CONTRACT.md`](./DOMAIN_CONTRACT.md) — bindende kategoribeslutninger',
  'docs data reading order',
);
docsReadme = docsReadme.replace('2. [`../data/categories/category_contract.json`', '3. [`../data/categories/category_contract.json`');
docsReadme = docsReadme.replace('3. [`DOMAIN_REGISTRY_README.md`', '4. [`DOMAIN_REGISTRY_README.md`');
docsReadme = docsReadme.replace('4. [`DATA_PRODUCTION_CONTRACT.md`', '5. [`DATA_PRODUCTION_CONTRACT.md`');
docsReadme = docsReadme.replace('5. relevante manifests under `data/**/manifest.json`', '6. relevante manifests under `data/**/manifest.json`');
docsReadme = docsReadme.replace('6. lokale README-filer ved datasettet', '7. lokale README-filer ved datasettet');
docsReadme = docsReadme.replace('7. relevante audits og CI-gates', '8. relevante audits og CI-gates');
docsReadme = replaceOnce(
  docsReadme,
  '1. [`people-of-places-method.md`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger',
  '1. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) — bindende regel om at ingen personopplysning eller stedskobling kan gjettes eller fylles for completeness\n2. [`people-of-places-method.md`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger',
  'docs people reading order',
);
for (const [from, to] of [[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10]]) {
  docsReadme = docsReadme.replace(`${from}. [\`../`, `${to}. [\`../`);
}
docsReadme = replaceOnce(
  docsReadme,
  'People of Places-metoden eier den redaksjonelle relevans- og kildegaten.',
  `Faktisitetskontrakten står over alle lokale people-regler. Readiness, schema og grønne tester er ikke sannhetsbevis; hver brukerrettet påstand og person–sted-kobling må støttes av kilder som faktisk er lest. People of Places-metoden eier den redaksjonelle relevans- og kildegaten.`,
  'docs people factuality explanation',
);
docsReadme = replaceOnce(
  docsReadme,
  '- manifest eller canonical datastruktur,',
  '- manifest eller canonical datastruktur,\n- faktisitets-, kilde-, usikkerhets- eller verifikasjonskrav,',
  'docs update conditions',
);
docsReadme = replaceOnce(
  docsReadme,
  '- canonical dokumentregister og dokumentasjonsgate',
  '- canonical dokumentregister og dokumentasjonsgate\n- overordnet canonical faktisitetskontrakt med permanent test- og tools-gate',
  'docs consolidation factuality',
);
write('docs/README.md', docsReadme);

const registryPath = 'docs/documentation_registry.json';
const registry = JSON.parse(read(registryPath));
registry.last_verified = '2026-07-27';
if (!registry.priority_order.includes('docs/FACTUALITY_CONTRACT.md')) {
  const index = registry.priority_order.indexOf('docs/DATA_PRODUCTION_CONTRACT.md');
  registry.priority_order.splice(index < 0 ? 0 : index, 0, 'docs/FACTUALITY_CONTRACT.md');
}
if (!registry.documents.some((item) => item.path === 'docs/FACTUALITY_CONTRACT.md')) {
  const index = registry.documents.findIndex((item) => item.path === 'docs/DATA_PRODUCTION_CONTRACT.md');
  registry.documents.splice(index < 0 ? registry.documents.length : index, 0, {
    path: 'docs/FACTUALITY_CONTRACT.md',
    status: 'canonical',
    role: 'Overordnet bindende kontrakt for faktisitet, kildeverifikasjon, usikkerhet, korrigering og forbud mot gjetting',
    owns: ['factuality_and_source_verification_contract'],
    last_verified: '2026-07-27',
  });
}
for (const item of registry.documents) {
  if (['docs/PEOPLE_POPUP_SYSTEM.md', 'docs/people-of-places-method.md', 'docs/DATA_PRODUCTION_CONTRACT.md', 'docs/README.md', 'docs/documentation_registry.json'].includes(item.path)) {
    item.last_verified = '2026-07-27';
  }
}
write(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

const testContent = `import assert from 'node:assert/strict';\nimport fs from 'node:fs';\nimport path from 'node:path';\nimport test from 'node:test';\n\nconst root = path.join(import.meta.dirname, '..');\nconst read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');\nconst readJson = (relative) => JSON.parse(read(relative));\n\ntest('canonical factuality contract forbids invention and guessing', () => {\n  const contract = read('docs/FACTUALITY_CONTRACT.md');\n  assert.match(contract, /Status: \\*\\*canonical\\*\\*/);\n  assert.match(contract, /aldri fylle inn, publisere eller presentere en opplysning fordi den virker sannsynlig/i);\n  assert.match(contract, /En språkmodell er aldri en faktakilde/i);\n  assert.match(contract, /Hver brukerrettet faktapåstand skal kunne spores/i);\n  assert.match(contract, /Et tomt eller utelatt felt er alltid bedre/i);\n  assert.match(contract, /Readiness er ikke faktaverifikasjon/i);\n  assert.match(contract, /En batch skal stoppes når kildedekningen er utilstrekkelig/i);\n});\n\ntest('all active people and data contracts defer to factuality contract', () => {\n  for (const relative of [\n    'docs/PEOPLE_POPUP_SYSTEM.md',\n    'docs/people-of-places-method.md',\n    'docs/DATA_PRODUCTION_CONTRACT.md',\n    'docs/README.md',\n  ]) {\n    assert.match(read(relative), /FACTUALITY_CONTRACT\\.md/);\n  }\n  const people = read('docs/PEOPLE_POPUP_SYSTEM.md');\n  assert.match(people, /complete.*betyr ikke.*source_verified/is);\n  assert.match(people, /En språkmodell er aldri en faktakilde/i);\n  assert.match(people, /påstand-for-påstand/i);\n});\n\ntest('documentation registry gives factuality one canonical owner and high priority', () => {\n  const registry = readJson('docs/documentation_registry.json');\n  const entries = registry.documents.filter((item) => item.path === 'docs/FACTUALITY_CONTRACT.md');\n  assert.equal(entries.length, 1);\n  assert.equal(entries[0].status, 'canonical');\n  assert.deepEqual(entries[0].owns, ['factuality_and_source_verification_contract']);\n  assert.ok(registry.priority_order.includes('docs/FACTUALITY_CONTRACT.md'));\n  assert.ok(registry.priority_order.indexOf('docs/FACTUALITY_CONTRACT.md') < registry.priority_order.indexOf('docs/DATA_PRODUCTION_CONTRACT.md'));\n});\n`;
write('tests/factuality-contract.test.mjs', testContent);

let popupTest = read('tests/people-popup-system-contract.test.mjs');
popupTest = replaceOnce(
  popupTest,
  '  assert.match(docs, /tools\\/audit-people-popup-readiness\\.mts/);',
  '  assert.match(docs, /tools\\/audit-people-popup-readiness\\.mts/);\n  assert.match(docs, /FACTUALITY_CONTRACT\\.md/);\n  assert.match(docs, /En språkmodell er aldri en faktakilde/i);\n  assert.match(docs, /complete.*betyr ikke.*source_verified/is);',
  'popup contract factuality assertions',
);
write('tests/people-popup-system-contract.test.mjs', popupTest);

const packagePath = 'package.json';
const packageJson = JSON.parse(read(packagePath));
packageJson.scripts['test:factuality-contract'] = 'node --test tests/factuality-contract.test.mjs tests/people-popup-system-contract.test.mjs';
if (!packageJson.scripts['tools:check'].includes('npm run test:factuality-contract')) {
  packageJson.scripts['tools:check'] = packageJson.scripts['tools:check'].replace(
    'npm run typecheck:tools && npm run build:tools &&',
    'npm run typecheck:tools && npm run build:tools && npm run test:factuality-contract &&',
  );
}
write(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log('Applied canonical factuality documentation and permanent contract test.');
