const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html', 'utf8');
const headerMenu = fs.readFileSync('js/ui/header-menu.js', 'utf8');
const components = fs.readFileSync('css/components.css', 'utf8');
const contract = fs.readFileSync('docs/HG_TEST_MODE.md', 'utf8');

const runtimeScript = '<script src="js/debug/HGTestMode.js"></script>';
assert.equal(index.split(runtimeScript).length - 1, 1, 'HGTestMode skal lastes nøyaktig én gang');
assert.ok(index.indexOf(runtimeScript) < index.indexOf('<script type="module" src="./js/app.js'), 'HGTestMode må lastes før app.js');

const loaderStart = index.indexOf('const scripts = [');
const loaderEnd = index.indexOf('let chain = Promise.resolve()', loaderStart);
assert.ok(loaderStart >= 0 && loaderEnd > loaderStart, 'post-ready loader må finnes');
assert.doesNotMatch(index.slice(loaderStart, loaderEnd), /js\/debug\/HGTestMode\.js/, 'HGTestMode må ikke ligge i post-ready loader');

assert.match(headerMenu, /button\.id = "btnTestMode"/, 'headeren må opprette TEST-knappen');
assert.match(headerMenu, /button\.textContent = "TEST"/, 'TEST-knappen må være synlig merket');
assert.match(headerMenu, /testMode\.setEnabled\(!testMode\.isEnabled\(\)\)/, 'knappen må bruke canonical HGTestMode');
assert.match(headerMenu, /hg:testModeChanged/, 'knappen må følge runtime-state');
assert.match(components, /\.header-test-mode-button\[aria-pressed="true"\]/, 'aktiv testmodus må ha synlig state');

assert.match(contract, /synlige .*TEST.*knappen i headeren/, 'canonical kontrakt må tillate headerkontrollen');
assert.doesNotMatch(contract, /gir ingen offentlig knapp/, 'gammel hidden-only policy må være borte');
assert.match(contract, /generell «Unlock all»-kontroll/, 'TEST-knappen må ikke gjeninnføre Unlock all');

console.log('History Go TEST header contract OK');
