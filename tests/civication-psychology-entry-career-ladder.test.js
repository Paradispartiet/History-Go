#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');

const entryTitles = [
  'Miljøassistent',
  'Sosialassistent',
  'Aktivitetsleder (omsorgsarbeid)',
  'Miljøarbeider'
];

for (const title of entryTitles) {
  const active = { career_id: 'psykologi', title };
  assert.strictEqual(
    Resolver.resolveCareerRoleScope(active),
    'psykologi_miljoarbeid',
    `${title}: skal resolve til shared Psychology role_scope`
  );
  assert.strictEqual(
    Resolver.resolveCareerRoleId(active),
    'psykologi_miljoarbeider',
    `${title}: skal resolve til shared Psychology role_id`
  );
}

const manifest = readJson('data/Civication/lifestory/manifest.json');
assert.strictEqual(
  Content.resolveRoleIdForRoleScope(manifest, 'psykologi_miljoarbeid'),
  'psykologi_miljoarbeid',
  'shared Psychology role_scope skal gi aktiv Life Story-pakke'
);

const roleModelsManifest = readJson('data/Civication/roleModels/manifest.json');
assert.ok(
  roleModelsManifest.files.includes('data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json'),
  'shared Psychology roleModel må være manifestert'
);

const sharedModel = readJson('data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json');
assert.strictEqual(sharedModel.role_scope, 'psykologi_miljoarbeid');
assert.strictEqual(sharedModel.role_id, 'psykologi_miljoarbeider');
assert.ok(sharedModel.scope_boundaries.must_not_simulate_as_authority.includes('diagnostisere'));

async function runtimeIntegration() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/Civication.html',
    runScripts: 'outside-only'
  });
  const { window } = dom;

  window.fetch = async (requestPath) => {
    const rel = String(requestPath || '').replace(/^\.?\//, '');
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      return { ok: false, status: 404, json: async () => null, text: async () => '' };
    }
    const text = fs.readFileSync(abs, 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
  };

  window.eval(fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRoleResolver.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationRoleModelRuntime.js'), 'utf8'));

  for (const title of entryTitles) {
    const resolved = await window.CivicationRoleModelRuntime.resolveRoleModelPath({
      career_id: 'psykologi',
      title
    });
    assert.strictEqual(resolved.role_scope, 'psykologi_miljoarbeid');
    assert.strictEqual(resolved.strategy, 'canonical_role_scope');
    assert.strictEqual(
      resolved.path,
      'data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json'
    );
    assert.strictEqual(resolved.manifest_has_path, true,
      `${title}: shared canonical roleModel må være i manifestet`);

    const model = await window.CivicationRoleModelRuntime.loadRoleModel({
      career_id: 'psykologi',
      title
    });
    assert.strictEqual(model.role_id, 'psykologi_miljoarbeider');
  }
}

runtimeIntegration().then(() => {
  console.log('civication psychology entry career ladder ok: 4 jobs -> shared scope/FWG/Life Story/roleModel');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
