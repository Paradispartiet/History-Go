import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

test('canonical people popup documentation owns the active presentation contract', () => {
  const docs = read('docs/PEOPLE_POPUP_SYSTEM.md');
  assert.match(docs, /Status: \*\*canonical\*\*/);
  assert.match(docs, /js\/ui\/person-popup-v2\.js/);
  assert.match(docs, /css\/person-popup-v2\.css/);
  assert.match(docs, /tools\/audit-people-popup-readiness\.mts/);
  assert.match(docs, /FACTUALITY_CONTRACT\.md/);
  assert.match(docs, /PEOPLE_PROFILE_CANONICAL\.md/);
  assert.match(docs, /En språkmodell er aldri en faktakilde/i);
  assert.match(docs, /complete.*betyr ikke.*source_verified/is);
  assert.match(docs, /Quizknappen skal aldri være en fullbredde gul bannerknapp/);
  assert.match(docs, /skjule tomme seksjoner helt/i);
  assert.match(docs, /initialfallback/i);
  assert.match(docs, /Politiker, embetsperson og monark/);
  assert.match(docs, /Idrettsutøver, trener og sportsleder/);
});

test('runtime and CSS still implement the documented people popup surface', () => {
  const runtime = read('js/ui/person-popup-v2.js');
  const css = read('css/person-popup-v2.css');
  assert.match(runtime, /person\?\.popupDesc/);
  assert.match(runtime, /renderWorks\(works\)/);
  assert.match(runtime, /renderProfileBlock\("Utdanning"/);
  assert.match(runtime, /renderProfileBlock\("Materialer"/);
  assert.match(runtime, /renderProfileBlock\("Temaer"/);
  assert.match(runtime, /data-person-quiz/);
  assert.match(runtime, /button\.remove\(\)/);
  assert.match(css, /width:\s*min\(820px, calc\(100vw - 64px\)\)/);
  assert.match(css, /\.hg-person-quiz-btn\.hg-quiz-btn\{[\s\S]*?width:\s*auto/);
});

test('documentation registry and package scripts expose the people popup contract', () => {
  const registry = readJson('docs/documentation_registry.json');
  const packageJson = readJson('package.json');
  assert.ok(registry.priority_order.includes('docs/PEOPLE_PROFILE_CANONICAL.md'));
  assert.ok(registry.priority_order.includes('docs/PEOPLE_POPUP_SYSTEM.md'));
  const entry = registry.documents.find((item) => item.path === 'docs/PEOPLE_POPUP_SYSTEM.md');
  assert.ok(entry);
  assert.equal(entry.status, 'canonical');
  assert.ok(entry.owns.includes('person_popup_presentation_contract'));
  assert.equal(entry.owns.includes('person_popup_readiness_model'), false);
  const productionEntry = registry.documents.find((item) => item.path === 'docs/PEOPLE_PROFILE_CANONICAL.md');
  assert.ok(productionEntry);
  assert.ok(productionEntry.owns.includes('person_profile_production_contract'));
  assert.equal(
    packageJson.scripts['audit:people-popup-readiness'],
    'npm run build:tools && node dist/tools/audit-people-popup-readiness.mjs',
  );
  assert.equal(
    packageJson.scripts['audit:people-popup-readiness:check'],
    'npm run build:tools && node dist/tools/audit-people-popup-readiness.mjs --check',
  );
});

test('readiness reports are deterministic and internally consistent', () => {
  const report = readJson('reports/people-popup-readiness.json');
  const markdown = read('reports/people-popup-readiness.md');
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.contract, 'docs/PEOPLE_POPUP_SYSTEM.md');
  assert.equal(report.productionContract, 'docs/PEOPLE_PROFILE_CANONICAL.md');
  assert.equal(report.policy.countBasedRewards, false);
  assert.equal(report.policy.missingEducationIsError, false);
  assert.equal(report.summary.readyPeopleV1 + report.summary.legacyUnreviewed, report.summary.totalPeople);
  assert.match(report.sourceFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(report.people.length, report.summary.totalPeople);
  assert.equal(
    report.summary.complete + report.summary.strong + report.summary.partial + report.summary.sparse,
    report.summary.totalPeople,
  );
  assert.ok(report.summary.totalPeople > 100);
  assert.ok(Array.isArray(report.categories) && report.categories.length > 5);
  assert.ok(Array.isArray(report.placeClusters));
  assert.match(markdown, /# People-popup readiness/);
  assert.match(markdown, /## Stedsklynger med mest gjenstående arbeid/);
  assert.match(markdown, /## Prioritert arbeidsliste/);
});
