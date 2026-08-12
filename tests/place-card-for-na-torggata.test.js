const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const placeCardJs = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const popupTabsJs = fs.readFileSync(path.join(repo, 'js/ui/place-popup-tabs.js'), 'utf8');
const torggata = JSON.parse(fs.readFileSync(path.join(repo, 'data/places/by/oslo/places/torggata.json'), 'utf8'));

assert.strictEqual(Object.prototype.hasOwnProperty.call(torggata, 'rounds'), false, 'Torggata skal ikke gjeninnføre legacy-rundinger etter fase 8E');
assert(torggata.for_na, 'Torggata skal ha for_na-innhold');
assert.strictEqual(torggata.for_na.title, 'Torggata før og etter ombyggingen');
for (const field of ['before', 'now', 'change']) {
  assert(String(torggata.for_na[field] || '').length > 180, `for_na.${field} skal være konkret og kildeavgrenset`);
}
assert(Array.isArray(torggata.for_na.lookFor), 'for_na.lookFor skal være liste');
assert.strictEqual(torggata.for_na.lookFor.length, 3, 'for_na.lookFor skal ha tre presise observasjoner');
assert(Array.isArray(torggata.for_na.sources), 'for_na.sources skal være liste');
assert(torggata.for_na.sources.length >= 5, 'for_na.sources skal vise fakta- og bildekildegrunnlag');
assert(torggata.for_na.sources.every(source => /^https:\/\//.test(source)), 'for_na.sources skal være inspectable HTTPS-lenker');
assert(!torggata.for_na.sources.some(source => /History Go|Wonderkammer/i.test(source)), 'interne History Go-kilder skal ikke være faktabevis i før/etter');

for (const prefix of ['before', 'now']) {
  const image = torggata.for_na[`${prefix}Image`];
  const meta = torggata.for_na[`${prefix}ImageMeta`];
  assert(/^https:\/\/upload\.wikimedia\.org\//.test(image), `${prefix}Image skal være direkte Commons-media`);
  assert(meta && meta.credit === 'Kjetil Ree', `${prefix}ImageMeta skal kreditere fotograf`);
  assert(meta.license === 'CC BY-SA 3.0', `${prefix}ImageMeta skal ha lisens`);
  assert(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(meta.sourcePage), `${prefix}ImageMeta skal peke til Commons-kildeside`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(meta.date), `${prefix}ImageMeta skal ha bildedato`);
}
assert.match(torggata.for_na.now, /ikke tatt fra identisk kamerastandpunkt/i, 'etterbildet skal ikke fremstilles som eksakt fotoreplikk');
assert.match(torggata.for_na.change, /ikke et bestemt leienivå eller en automatisk sosial effekt/i, 'før/etter skal avgrense udokumentert gentrifiseringskausalitet');

assert(placeCardJs.includes('function renderPlaceCardForNa'), 'PlaceCard skal rendre for_na');
assert(placeCardJs.includes('renderPlaceCardForNa(currentPlace || place)'), 'Før/nå-popup skal bruke for_na-renderer');
assert(placeCardJs.includes('setRoundLabel(forNaIcon, "🕰️", forNaData ? 1 : "")'), 'Før/nå-runding skal markere innhold');
assert(popupTabsJs.includes('beforeImageMeta'), 'Stedspopupen skal kunne vise bildeattribusjon');
assert(popupTabsJs.includes('nowImageMeta'), 'Stedspopupen skal kunne vise etterbilde-attribusjon');
assert(popupTabsJs.includes('Bildekilde ↗'), 'Stedspopupen skal eksponere kilde til før/etter-bildet');
