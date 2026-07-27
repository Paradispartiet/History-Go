import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const write = (relative, content) => fs.writeFileSync(path.join(root, relative), content.endsWith('\n') ? content : `${content}\n`);
const replaceOnce = (content, before, after, label) => {
  if (!content.includes(before)) throw new Error(`Missing anchor: ${label}`);
  return content.replace(before, after);
};

let docs = execFileSync('git', ['show', 'origin/main:docs/README.md'], { encoding: 'utf8' });
docs = docs.replace('Sist kontrollert: **2026-07-26**', 'Sist kontrollert: **2026-07-27**');
docs = replaceOnce(
  docs,
  '> Én sannhet per ansvarsområde.',
  '> Én sannhet per ansvarsområde.\n\n[`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) gjelder alle brukerrettede fakta: ingen opplysning skal diktes, gjettes eller fylles inn for å skape completeness. Manglende eller uavklart informasjon skal utelates.',
  'ground rule',
);
docs = replaceOnce(
  docs,
  `1. [\`DOMAIN_CONTRACT.md\`](./DOMAIN_CONTRACT.md) — bindende kategoribeslutninger\n2. [\`../data/categories/category_contract.json\`](../data/categories/category_contract.json) — maskinlesbar sannhetskilde for runtime- og fagkategorier\n3. [\`DOMAIN_REGISTRY_README.md\`](./DOMAIN_REGISTRY_README.md) — operativ bruk av DomainRegistry og eksplisitte legacy-aliasgrenser\n4. [\`DATA_PRODUCTION_CONTRACT.md\`](./DATA_PRODUCTION_CONTRACT.md) — aktiv dataproduksjonskontrakt\n5. relevante manifests under \`data/**/manifest.json\`\n6. lokale README-filer ved datasettet\n7. relevante audits og CI-gates`,
  `1. [\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md) — overordnet canonical regel for sannhet, kildeverifikasjon, usikkerhet og forbud mot gjetting\n2. [\`DOMAIN_CONTRACT.md\`](./DOMAIN_CONTRACT.md) — bindende kategoribeslutninger\n3. [\`../data/categories/category_contract.json\`](../data/categories/category_contract.json) — maskinlesbar sannhetskilde for runtime- og fagkategorier\n4. [\`DOMAIN_REGISTRY_README.md\`](./DOMAIN_REGISTRY_README.md) — operativ bruk av DomainRegistry og eksplisitte legacy-aliasgrenser\n5. [\`DATA_PRODUCTION_CONTRACT.md\`](./DATA_PRODUCTION_CONTRACT.md) — aktiv dataproduksjonskontrakt\n6. relevante manifests under \`data/**/manifest.json\`\n7. lokale README-filer ved datasettet\n8. relevante audits og CI-gates`,
  'data reading order',
);
docs = replaceOnce(
  docs,
  `1. [\`people-of-places-method.md\`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger\n2. [\`PEOPLE_POPUP_SYSTEM.md\`](./PEOPLE_POPUP_SYSTEM.md) — canonical presentasjons-, felt-, fallback- og persontypekontrakt\n3. [\`../data/people/manifest.json\`](../data/people/manifest.json) — aktive canonical people-source-filer\n4. [\`../tools/audit-people-popup-readiness.mts\`](../tools/audit-people-popup-readiness.mts) — rangerer alle manifest-lastede profiler etter popup-readiness og skriver regenererbare rapporter\n5. [\`../reports/people-popup-readiness.md\`](../reports/people-popup-readiness.md) — prioritert arbeidsliste etter kategori og stedsklynge\n6. [\`../tools/audit-people-of-places-status.mts\`](../tools/audit-people-of-places-status.mts) — status-, schema-, referanse- og struktur-audit\n7. [\`../tools/check-people-of-places-gate.mts\`](../tools/check-people-of-places-gate.mts) — blokkerer duplikater, ugyldige refs, manglende primæranker og tomme \`places\`\n8. [\`PEOPLE_IMAGES.md\`](./PEOPLE_IMAGES.md) — canonical kilde-, lisens-, godkjennings- og attribusjonskontrakt for people-bilder\n9. [\`../tools/people-image-pipeline.mts\`](../tools/people-image-pipeline.mts) — implementert kandidat-, review-, apply- og audit-pipeline\n10. [\`../tests/people-images.test.mjs\`](../tests/people-images.test.mjs) — lisens-, identitets-, quality-, apply- og attribusjonsregresjoner`,
  `1. [\`FACTUALITY_CONTRACT.md\`](./FACTUALITY_CONTRACT.md) — bindende regel om at ingen personopplysning eller stedskobling kan gjettes eller fylles for completeness\n2. [\`people-of-places-method.md\`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger\n3. [\`PEOPLE_POPUP_SYSTEM.md\`](./PEOPLE_POPUP_SYSTEM.md) — canonical presentasjons-, felt-, fallback- og persontypekontrakt\n4. [\`../data/people/manifest.json\`](../data/people/manifest.json) — aktive canonical people-source-filer\n5. [\`../tools/audit-people-popup-readiness.mts\`](../tools/audit-people-popup-readiness.mts) — rangerer alle manifest-lastede profiler etter popup-readiness og skriver regenererbare rapporter\n6. [\`../reports/people-popup-readiness.md\`](../reports/people-popup-readiness.md) — prioritert arbeidsliste etter kategori og stedsklynge\n7. [\`../tools/audit-people-of-places-status.mts\`](../tools/audit-people-of-places-status.mts) — status-, schema-, referanse- og struktur-audit\n8. [\`../tools/check-people-of-places-gate.mts\`](../tools/check-people-of-places-gate.mts) — blokkerer duplikater, ugyldige refs, manglende primæranker og tomme \`places\`\n9. [\`PEOPLE_IMAGES.md\`](./PEOPLE_IMAGES.md) — canonical kilde-, lisens-, godkjennings- og attribusjonskontrakt for people-bilder\n10. [\`../tools/people-image-pipeline.mts\`](../tools/people-image-pipeline.mts) — implementert kandidat-, review-, apply- og audit-pipeline\n11. [\`../tests/people-images.test.mjs\`](../tests/people-images.test.mjs) — lisens-, identitets-, quality-, apply- og attribusjonsregresjoner`,
  'people reading order',
);
docs = replaceOnce(
  docs,
  'People of Places-metoden eier den redaksjonelle relevans- og kildegaten.',
  'Faktisitetskontrakten står over alle lokale people-regler. Readiness, schema og grønne tester er ikke sannhetsbevis; hver brukerrettet påstand og person–sted-kobling må støttes av kilder som faktisk er lest. People of Places-metoden eier den redaksjonelle relevans- og kildegaten.',
  'people factuality explanation',
);
docs = replaceOnce(
  docs,
  '- manifest eller canonical datastruktur,',
  '- manifest eller canonical datastruktur,\n- faktisitets-, kilde-, usikkerhets- eller verifikasjonskrav,',
  'update conditions',
);
docs = replaceOnce(
  docs,
  '- canonical dokumentregister og dokumentasjonsgate',
  '- canonical dokumentregister og dokumentasjonsgate\n- overordnet canonical faktisitetskontrakt med permanent test- og tools-gate',
  'consolidation status',
);
write('docs/README.md', docs);

const testPath = path.join(root, 'tests/factuality-contract.test.mjs');
let test = fs.readFileSync(testPath, 'utf8');
const anchor = `test('documentation registry gives factuality one canonical owner and high priority', () => {`;
if (!test.includes("test('documentation map preserves exact ordered lists'")) {
  test = test.replace(anchor, `test('documentation map preserves exact ordered lists', () => {\n  const docs = read('docs/README.md');\n  assert.match(docs, /### Dagens runtime og arbeidsflyt[\\s\\S]*?1\\. .*SYSTEM_REGISTRY\\.md[\\s\\S]*?2\\. .*SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS\\.md[\\s\\S]*?3\\. .*SYSTEM_MAP\\.md/);\n  assert.match(docs, /### People-produksjon, stedskobling og bilder[\\s\\S]*?1\\. .*FACTUALITY_CONTRACT\\.md[\\s\\S]*?2\\. .*people-of-places-method\\.md[\\s\\S]*?3\\. .*PEOPLE_POPUP_SYSTEM\\.md[\\s\\S]*?11\\. .*people-images\\.test\\.mjs/);\n  assert.doesNotMatch(docs, /### Dagens runtime og arbeidsflyt[\\s\\S]*?10\\. .*SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS\\.md/);\n});\n\n${anchor}`);
}
write('tests/factuality-contract.test.mjs', test);
console.log('Rebuilt docs/README.md from fresh main with exact factuality blocks and numbering guard.');
