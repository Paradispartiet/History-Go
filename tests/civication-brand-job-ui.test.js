#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
}

function bootstrap() {
  global.window = global;
  global.localStorage = makeStorage();
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.setTimeout = (fn) => { fn(); return 1; };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};

  const host = {
    id: 'activeJobCard',
    innerHTML: '',
    insertAdjacentHTML(_pos, html) { this.innerHTML += html; }
  };

  global.document = {
    readyState: 'complete',
    addEventListener() {},
    getElementById(id) {
      if (id === 'activeJobCard') return host;
      if (id === 'civiBrandJobStateBlock' && host.innerHTML.includes('id="civiBrandJobStateBlock"')) {
        return {
          remove() { host.innerHTML = host.innerHTML.replace(/<div id="civiBrandJobStateBlock"[\s\S]*?<\/div>\s*$/, ''); },
          set outerHTML(value) { host.innerHTML = value; },
          get outerHTML() { return host.innerHTML; }
        };
      }
      return null;
    }
  };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/ui/CivicationBrandJobUI.js');

  return { host };
}

(function testNoBrandNoBlock() {
  const { host } = bootstrap();
  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    career_name: 'Næringsliv',
    role_id: 'naer_ekspeditor',
    title: 'Ekspeditør / butikkmedarbeider'
  });

  const rendered = global.CivicationBrandJobUI.render();
  assert.strictEqual(rendered, false);
  assert.strictEqual(host.innerHTML.includes('civiBrandJobStateBlock'), false);
})();

(function testNorliBrandStateRenders() {
  const { host } = bootstrap();

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    career_name: 'Næringsliv',
    role_id: 'naer_ekspeditor',
    title: 'Ekspeditør / butikkmedarbeider',
    brand_id: 'norli',
    brand_name: 'Norli'
  });

  localStorage.setItem('hg_brand_job_state_v1', JSON.stringify({
    version: 1,
    byBrandRole: {
      'norli:ekspeditor': {
        brand_id: 'norli',
        brand_name: 'Norli',
        role_scope: 'ekspeditor',
        career_id: 'naeringsliv',
        metrics: {
          kundetillit: 3,
          faglighet: 2,
          brand_tillit: 1,
          risiko: 0,
          stress: 1
        },
        answered_mail_ids: ['m1', 'm2'],
        history: []
      }
    },
    updated_at: '2026-04-29T00:00:00.000Z'
  }));

  localStorage.setItem('hg_brand_job_progression_v1', JSON.stringify({
    version: 1,
    triggered: {
      'norli:ekspeditor:norli_ekspeditor_faglighet_3': {
        at: '2026-04-29T00:00:00.000Z',
        mail_id: 'brand_progress_norli_faglighet_3',
        brand_id: 'norli',
        brand_name: 'Norli',
        role_scope: 'ekspeditor',
        metric: 'faglighet',
        threshold: 3,
        value: 3
      }
    },
    updated_at: '2026-04-29T00:00:00.000Z'
  }));

  const rendered = global.CivicationBrandJobUI.render();
  assert.strictEqual(rendered, true);
  assert(host.innerHTML.includes('civiBrandJobStateBlock'));
  assert(host.innerHTML.includes('Norli'));
  assert(host.innerHTML.includes('Kunder'));
  assert(host.innerHTML.includes('Faglighet'));
  assert(host.innerHTML.includes('brand progress norli faglighet 3'));
  assert(host.innerHTML.includes('2 brandvalg'));
})();

console.log('PASS: Civication brand job UI test completed.');
