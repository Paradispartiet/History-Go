#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return { getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(String(k),String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear() };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath }); }

function reset(activePosition) {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  global.CivicationState.setActivePosition(activePosition);
  global.CivicationState.setInbox([]);
}

async function run() {
  const base = { career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', role_key: 'ekspeditor', role_id: 'naer_ekspeditor' };

  reset(base);
  let inspect = global.CivicationMailRuntime.inspect();
  assert(!inspect.family_paths.some((p) => p.includes('/brand/')), 'generic should not include /brand/ path');
  let cands = await global.CivicationMailRuntime.debugCandidates();
  assert(cands.some((m) => String(m.id || '').startsWith('ekspeditor_')), 'generic candidates should load');
  assert(!cands.some((m) => m && (m.brand_id === 'norli' || m.brand_id === 'narvesen')), 'generic must not leak brand mails');

  reset({ ...base, brand_id: 'norli' });
  inspect = global.CivicationMailRuntime.inspect();
  assert(inspect.family_paths.includes('data/Civication/mailFamilies/naeringsliv/brand/ekspeditor_norli.json'));
  cands = await global.CivicationMailRuntime.debugCandidates();
  const norli = cands.filter((m) => m && m.brand_id === 'norli');
  assert(norli.length > 0, 'norli brand mails should be included');
  assert(norli.some((m) => m.mail_family === 'kasse_og_pris'), 'norli must match first plan family');
  assert(norli.every((m) => m.brand_name === 'Norli' && m.brand_role === 'bokhandler'));
  assert(!cands.some((m) => m && m.brand_id === 'narvesen'), 'norli should not leak narvesen');

  reset({ ...base, brand_id: 'narvesen' });
  inspect = global.CivicationMailRuntime.inspect();
  assert(inspect.family_paths.includes('data/Civication/mailFamilies/naeringsliv/brand/ekspeditor_narvesen.json'));
  cands = await global.CivicationMailRuntime.debugCandidates();
  const narvesen = cands.filter((m) => m && m.brand_id === 'narvesen');
  assert(narvesen.length > 0, 'narvesen brand mails should be included');
  assert(narvesen.every((m) => m.brand_name === 'Narvesen' && m.brand_role === 'kioskmedarbeider'));
  assert(!cands.some((m) => m && m.brand_id === 'norli'), 'narvesen should not leak norli');

  console.log('civication brand mail runtime ok');
}

run();
