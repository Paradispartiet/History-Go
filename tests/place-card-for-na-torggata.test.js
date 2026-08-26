const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');
const placeCardJs = read('js/ui/place-card.js');
const popupTabsJs = read('js/ui/place-popup-tabs.js');
const torggata = JSON.parse(read('data/places/by/oslo/places/torggata.json'));
const checklist = read('docs/PLACE_PRODUCTION_CHECKLIST.md');
const popupSystem = read('docs/PLACE_POPUP_SYSTEM.md');
const audit = read('reports/place-production/torggata-phase7d-before-after-audit-v1.md');
const workcard = read('reports/place-production/torggata-workcard-current.md');
const backlog = JSON.parse(read('reports/place-production/torggata-quality-improvement-backlog-v1.json'));

assert.strictEqual(Object.prototype.hasOwnProperty.call(torggata, 'rounds'), false, 'Torggata skal ikke gjeninnføre legacy-rundinger etter fase 8E');
assert(torggata.for_na, 'Torggata skal ha for_na-innhold');
assert.strictEqual(torggata.for_na.title, 'Torggata 30–36: ca. 1965 og 2025');

for (const field of ['before', 'now', 'change']) {
  assert(String(torggata.for_na[field] || '').length > 250, `for_na.${field} skal være konkret og kildeavgrenset`);
}
for (const field of ['before', 'now']) {
  assert.match(torggata.for_na[field], /Torggata 30–36/);
  assert.match(torggata.for_na[field], /Hausmanns gate/);
}
assert.match(torggata.for_na.change, /ikke i seg selv husleie, fortrengning eller automatisk sosial effekt/i);
assert.match(torggata.for_na.before, /fasaderekken.*høyre side/i);
assert.match(torggata.for_na.now, /fasaderekken.*høyre side/i);
assert.doesNotMatch(torggata.for_na.before + torggata.for_na.now, /venstre side/i);

assert(Array.isArray(torggata.for_na.lookFor), 'for_na.lookFor skal være liste');
assert.strictEqual(torggata.for_na.lookFor.length, 3, 'for_na.lookFor skal ha tre presise observasjoner');
assert(torggata.for_na.lookFor.every(item => /fasaderek|gateaks|1965|2025/i.test(item)), 'observasjonene skal binde samme gateakse sammen');
assert(!torggata.for_na.lookFor.some(item => /ulike kamerastandpunkter/i.test(item)), 'gammelt mismatch-forbehold skal være fjernet');

assert(Array.isArray(torggata.for_na.sources), 'for_na.sources skal være liste');
assert(torggata.for_na.sources.length >= 6, 'for_na.sources skal vise fakta-, bilde- og lisensgrunnlag');
assert(torggata.for_na.sources.every(source => /^https:\/\//.test(source)), 'for_na.sources skal være inspectable HTTPS-lenker');
assert(torggata.for_na.sources.includes('https://www.oslobilder.no/OMU/OB.A11305'));
assert(torggata.for_na.sources.includes('https://kartaview.org/terms'));
assert(!torggata.for_na.sources.some(source => /History Go|Wonderkammer/i.test(source)), 'interne History Go-kilder skal ikke være faktabevis i før/etter');

assert(/^https:\/\/dms01\.dimu\.org\/media\/decoimage\//.test(torggata.for_na.beforeImage));
assert.strictEqual(torggata.for_na.beforeImageMeta.credit, 'Henrik Ørsted / Oslo Museum');
assert.strictEqual(torggata.for_na.beforeImageMeta.license, 'CC BY-NC-ND 3.0 NO');
assert.strictEqual(torggata.for_na.beforeImageMeta.sourcePage, 'https://www.oslobilder.no/OMU/OB.A11305');
assert.strictEqual(torggata.for_na.beforeImageMeta.date, 'ca. 1965');
assert.match(torggata.for_na.beforeImageMeta.viewpoint, /Torggata 30–36 mot Hausmanns gate/);

assert(/^https:\/\/storage13\.openstreetcam\.org\/files\/photo\/2025\/3\/27\/proc\//.test(torggata.for_na.nowImage));
assert.strictEqual(torggata.for_na.nowImageMeta.credit, '© Grab and KartaView Contributors');
assert.strictEqual(torggata.for_na.nowImageMeta.license, 'CC BY-SA 4.0');
assert.strictEqual(torggata.for_na.nowImageMeta.sourcePage, 'https://kartaview.org/details/10723145/5/track-info');
assert.strictEqual(torggata.for_na.nowImageMeta.date, '2025-03-27');
assert.strictEqual(torggata.for_na.nowImageMeta.photoId, '2551570473');
assert.match(torggata.for_na.nowImageMeta.viewpoint, /59\.917304, 10\.754085; heading 41\.02°/);

assert.match(checklist, /canonical place-register\/manifester er søkt før motivet velges/i);
assert.match(checklist, /delsted som har egen canonical place-oppføring brukes ikke som primært Før\/etter-stedfortreder/i);
assert.match(checklist, /delsted som har egen canonical place-oppføring brukes ikke som primært Før\/etter-stedfortreder/i);
assert.match(popupSystem, /Torggata Bad kan ikke bære hovedparet for Torggata/i);
assert.match(popupSystem, /hovedparet for Torggata må vise selve gaten/i);
assert.match(audit, /Eksplisitt avvist kandidat: Torggata Bad/i);
assert.match(audit, /Badet har egen place-oppføring og kan ikke erstatte parent-place Torggata/i);
assert.match(audit, /Torggata 30–36 ca\. 1965 \+ KartaView 2025 \| Valgt/i);
assert.match(audit, /Fasaderekken Torggata 30–36 ligger visuelt på høyre side i begge bilder/i);
assert.match(workcard, /Torggata Bad/i);
assert.match(workcard, /egen place-oppføring/i);

const finding = backlog.findings.find(item => item.id === 'before_after_comparability_and_depth');
assert(finding, 'kvalitetsfunnet skal finnes');
assert.strictEqual(finding.workflow_status, 'RESOLVED_PHASE_7D');
assert.strictEqual(finding.resolution.rejected_own_place_proxy, 'Torggata Bad');
assert.strictEqual(backlog.sequence[0].status, 'RESOLVED');
assert.strictEqual(backlog.findings.find(item => item.id === 'news_missing').workflow_status, 'RESOLVED_PHASE_7F');
assert.strictEqual(backlog.findings.find(item => item.id === 'reading_trail_missing').workflow_status, 'RESOLVED_PHASE_7G');
assert.deepStrictEqual(backlog.active_phase, { id: 'final_closeout', status: 'COMPLETED' });

assert(placeCardJs.includes('function renderPlaceCardForNa'), 'PlaceCard skal rendre for_na');
assert(placeCardJs.includes('renderPlaceCardForNa(currentPlace || place)'), 'Før/nå-popup skal bruke for_na-renderer');
assert(placeCardJs.includes('setRoundLabel(forNaIcon, "🕰️", forNaData ? 1 : "")'), 'Før/nå-runding skal markere innhold');
assert(popupTabsJs.includes('beforeImageMeta'), 'Stedspopupen skal kunne vise bildeattribusjon');
assert(popupTabsJs.includes('nowImageMeta'), 'Stedspopupen skal kunne vise nåbilde-attribusjon');
assert(popupTabsJs.includes('Bildekilde ↗'), 'Stedspopupen skal eksponere kilde til før/etter-bildet');
