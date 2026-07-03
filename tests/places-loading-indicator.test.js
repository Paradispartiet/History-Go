const assert = require('assert');
const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const layout = fs.readFileSync('css/layout.css', 'utf8');
const bootFast = fs.readFileSync('js/boot-fast.js', 'utf8');
const placeCard = fs.readFileSync('js/ui/place-card.js', 'utf8');

assert(index.includes('id="placesLoadingIndicator"'), 'index.html renders a map-level places loading indicator');
assert(index.includes('class="places-loading-indicator"'), 'indicator has the expected compact UI class');
assert(index.includes('Laster steder …'), 'indicator uses the expected loading copy');

assert(layout.includes('#placesLoadingIndicator'), 'layout.css styles the indicator outside PlaceCard');
assert(layout.includes('pointer-events: none'), 'indicator must not block map interactions');
assert(layout.includes('border-radius: 999px'), 'indicator is a compact pill');

assert(bootFast.includes('updatePlacesLoadingIndicator(ready ? "ready" : (failed ? "error" : "loading")'), 'boot-fast shows indicator while places load');
assert(bootFast.includes('updatePlacesLoadingIndicator(ready ? "ready"'), 'boot-fast hides indicator when places are ready');
assert(bootFast.includes('status: placesReady ? "ready" : "error"'), 'boot-fast switches to a small error state on failed places load');
assert(!bootFast.includes('setTimeout'), 'places loading indicator must not rely on a fixed timeout');

const openPlaceCardStart = placeCard.indexOf('window.openPlaceCard = async function (place)');
assert(openPlaceCardStart >= 0, 'PlaceCard runtime exists');
const openPlaceCardHead = placeCard.slice(openPlaceCardStart, openPlaceCardStart + 500);
assert(openPlaceCardHead.includes('!place || !isPlacesDataReady()'), 'PlaceCard stays hidden until places data is ready');
assert(openPlaceCardHead.includes('hidePlaceCardUntilReady();'), 'PlaceCard hides instead of rendering an empty loading card');

console.log('places loading indicator audit OK');
