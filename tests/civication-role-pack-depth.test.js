#!/usr/bin/env node
// tests/civication-role-pack-depth.test.js
//
// Pakkedybde på jobbtilbud: CivicationRolePackDepth klassifiserer tilbud mot
// data/Civication/rolePackIndex.json, og CivicationUI viser én kort linje
// (full/delvis/generisk) på tilbudskortet. Pinner at:
//   - komplett referanserolle (Arealplanlegger) → level "full",
//   - partial_pack → level "partial",
//   - role_model_only → level "generic",
//   - ukjent rolle / ulastet indeks → null og tom HTML (aldri "undefined"),
//   - HTML-en escaper og bruker data-pack-depth-attributt.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.Event = function (type) { this.type = type; };
global.document = { readyState: 'complete', addEventListener: () => {}, getElementById: () => null, querySelector: () => null };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.fetch = async () => ({ ok: false, status: 404, async json() { return {}; } });

function loadScript(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), { filename: rel });
}

loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
loadScript('js/Civication/systems/civicationRolePackDepth.js');
loadScript('js/Civication/ui/CivicationUI.js');

const depth = global.window.CivicationRolePackDepth;
const ui = global.window.CivicationUI;
assert(depth, 'CivicationRolePackDepth global mangler');
assert(typeof ui?.getOfferPackDepthViewModel === 'function', 'CivicationUI.getOfferPackDepthViewModel mangler');
assert(typeof ui?.buildOfferPackDepthHtml === 'function', 'CivicationUI.buildOfferPackDepthHtml mangler');

// 1) Ulastet indeks → null / tom HTML, aldri "undefined"-støy.
assert.strictEqual(depth.getPackDepthSync({ career_id: 'by', title: 'Arealplanlegger' }), null, 'uten indeks skal sync-oppslag gi null');
assert.strictEqual(ui.buildOfferPackDepthHtml({ career_id: 'by', title: 'Arealplanlegger' }), '', 'uten indeks skal HTML være tom');

// 2) Last den ekte genererte indeksen.
const realIndex = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/rolePackIndex.json'), 'utf8'));
depth._setIndexForTest(realIndex);
assert.strictEqual(depth._inspect().loaded, true, 'indeksen skal være lastet i test');

// 3) Komplett referanserolle → full.
const full = depth.getPackDepthSync({ career_id: 'by', title: 'Arealplanlegger' });
assert(full, 'Arealplanlegger skal finnes i indeksen');
assert.strictEqual(full.status, 'complete_reference_v2');
assert.strictEqual(full.level, 'full');
assert.strictEqual(full.role_scope, 'by_radgiver_plan');

// 4) partial_pack → partial (Arkitekt iflg. indeksen).
const partialRow = realIndex.roles.find((r) => r.status === 'partial_pack');
assert(partialRow, 'indeksen skal ha minst én partial_pack-rolle');
const partial = depth.getPackDepthSync({ career_id: partialRow.category, title: partialRow.title });
assert(partial, `partial-rollen ${partialRow.title} skal klassifiseres`);
assert.strictEqual(partial.level, 'partial', `${partialRow.title} skal være partial, fikk ${partial.level}`);

// 5) Klassifiseringen speiler OPPLEVD dybde: runtime-resolveren avgjør hvilken
// pakke rollen faktisk spiller. «Byarkitekt» er selv role_model_only, men
// resolves til by_arkitekt-pakken (partial) — tilbudskortet skal si partial.
const byarkitekt = depth.getPackDepthSync({ career_id: 'by', title: 'Byarkitekt' });
assert(byarkitekt, 'Byarkitekt skal klassifiseres');
assert.strictEqual(byarkitekt.level, 'partial', 'Byarkitekt spiller by_arkitekt-pakken og skal vise partial');
assert.strictEqual(byarkitekt.role_scope, 'by_arkitekt');

// 6) role_model_only-roller som IKKE resolves til en dypere pakke → generic.
const genericRows = realIndex.roles.filter((r) => r.status === 'role_model_only');
assert(genericRows.length > 0, 'indeksen skal ha role_model_only-roller');
const genericHits = genericRows
  .map((r) => depth.getPackDepthSync({ career_id: r.category, title: r.title }))
  .filter((vmRow) => vmRow && vmRow.level === 'generic');
assert(genericHits.length > 0, 'minst én role_model_only-rolle skal klassifiseres generic');
genericHits.forEach((vmRow) => assert.strictEqual(vmRow.status, 'role_model_only'));

// 7) Ukjent rolle → null / tom HTML.
assert.strictEqual(depth.getPackDepthSync({ career_id: 'tull', title: 'Finnes Ikke' }), null);
assert.strictEqual(ui.buildOfferPackDepthHtml({ career_id: 'tull', title: 'Finnes Ikke' }), '');
assert.strictEqual(ui.buildOfferPackDepthHtml(null), '');

// 8) HTML-form: data-attributt + label + beskrivelse, ingen "undefined".
const html = ui.buildOfferPackDepthHtml({ career_id: 'by', title: 'Arealplanlegger' });
assert(html.includes('data-pack-depth="full"'), 'HTML skal merke nivået i data-pack-depth');
assert(html.includes('Full rollepakke'), 'HTML skal vise label');
assert(!html.includes('undefined'), 'HTML skal aldri inneholde "undefined"');

console.log('civication-role-pack-depth.test.js passed');
