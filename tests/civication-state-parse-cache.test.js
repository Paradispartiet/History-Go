#!/usr/bin/env node
// tests/civication-state-parse-cache.test.js
//
// Ytelseskontrakt for CivicationState: getState() re-parser IKKE localStorage
// på hvert kall. Dagsruntimen (alle mailobjekter) ligger inne i dette blobbet,
// og DayProgression/Builder.inspect kaller getState tusenvis av ganger under ett
// svar — uten parse-cache summerte det seg til >100MB JSON.parse pr. svar.
//
// Pinner at:
//   1. Gjentatte getState() uten skriv gir maks ÉN JSON.parse (cache-treff).
//   2. setState() buster/reprimer cachen: verdien er korrekt etterpå.
//   3. En ekstern localStorage-skriv (annen skriver) fanges opp (raw-streng-nøkkel).
//   4. Semantikk uendret: getState returnerer et ferskt topp-objekt med defaults.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

const store = new Map();
let parseCount = 0;

global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.Event = function (t) { this.type = t; };
global.document = { readyState: 'complete', addEventListener() {} };
global.localStorage = {
  getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
  setItem: (k, v) => void store.set(String(k), String(v)),
  removeItem: (k) => void store.delete(String(k)),
  clear: () => store.clear()
};

const realParse = JSON.parse.bind(JSON);
global.JSON.parse = function (s, ...rest) { parseCount++; return realParse(s, ...rest); };

vm.runInThisContext(fs.readFileSync(path.join(repoRoot, 'js/Civication/core/civicationState.js'), 'utf8'), { filename: 'civicationState.js' });

const S = global.window.CivicationState;
assert(S && typeof S.getState === 'function' && typeof S.setState === 'function', 'CivicationState mangler');

// Seed en realistisk stor state (simuler dagsruntime med mange items).
const bigRuntime = { items: [] };
for (let i = 0; i < 40; i++) bigRuntime.items.push({ status: 'delivered', event: { id: 'm' + i, subject: 'Sak ' + i, choices: [{ id: 'A' }, { id: 'B' }] } });
S.setState({ mail_day_runtime_v1: bigRuntime, score: 1 });

// 1) Mange getState uten skriv → maks én ny parse.
parseCount = 0;
let last;
for (let i = 0; i < 500; i++) last = S.getState();
assert(parseCount <= 1, `500 getState uten skriv skal gi <=1 parse, ga ${parseCount}`);
assert.strictEqual(last.score, 1, 'getState leser riktig verdi fra cache');
assert(Array.isArray(last.mail_day_runtime_v1.items) && last.mail_day_runtime_v1.items.length === 40, 'runtime bevart');

// 2) setState reprimer: neste getState ser ny verdi uten ekstra parse-storm.
S.setState({ score: 2 });
parseCount = 0;
const after = S.getState();
assert.strictEqual(after.score, 2, 'setState-verdi synlig etterpå');
assert(parseCount <= 1, `getState etter setState skal gi <=1 parse, ga ${parseCount}`);

// 3) Ekstern skriv til samme nøkkel fanges (raw-streng-nøkkel buster cachen).
const raw = JSON.parse(localStorage.getItem('hg_civi_state_v1'));
raw.score = 99;
localStorage.setItem('hg_civi_state_v1', JSON.stringify(raw));
assert.strictEqual(S.getState().score, 99, 'ekstern localStorage-skriv reflekteres');

// 4) Ferskt topp-objekt pr. kall (mutasjon lekker ikke tilbake via toppnivå).
const a = S.getState();
a.score = -1;
assert.strictEqual(S.getState().score, 99, 'mutasjon av returnert topp-objekt persisterer ikke uten setState');

console.log('civication-state-parse-cache.test.js passed');
