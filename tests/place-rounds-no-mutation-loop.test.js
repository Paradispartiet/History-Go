#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui', 'place-rounds-visual-collections.js'), 'utf8');

assert.doesNotMatch(src, /new\s+MutationObserver\s*\(/, 'Rundingsruntime skal ikke observere hele PlaceCard-DOM-en');
assert.match(src, /visualPreviewSignature/, 'Preview-DOM skal kun skrives når preview faktisk endres');
assert.match(src, /requestAnimationFrame/, 'Rundingsoppdatering skal koaleseres til én frame');
assert.match(src, /hg:place-selected/, 'Rundinger skal oppdateres fra stedsevent i stedet for generell DOM-observer');
assert.match(src, /selected\.length === 4/, '4-runderslayout skal beholdes');
assert.match(src, /repeat\(3, var\(--place-card-orb-size\)\)/, '6-runderslayout skal beholdes');

console.log('place rounds update without a self-triggering MutationObserver loop');
