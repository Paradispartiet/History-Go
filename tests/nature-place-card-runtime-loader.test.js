const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const toastRuntime = fs.readFileSync(path.join(repo, 'js/ui/nature-unlock-toast.js'), 'utf8');
const bridgeRuntime = fs.readFileSync(path.join(repo, 'js/nature_place_map_bridge.js'), 'utf8');

const natureCardLoad = toastRuntime.indexOf('loadRuntimeScript("js/ui/nature-card.js"');
const placeMapBridgeLoad = toastRuntime.indexOf('loadRuntimeScript("js/nature_place_map_bridge.js"');

assert(natureCardLoad >= 0, 'Naturkort-runtime skal lastes eksplisitt');
assert(placeMapBridgeLoad > natureCardLoad, 'Naturkortet skal lastes før place-map-broen');
assert(toastRuntime.includes('window.addEventListener("hg:criticalReady", scheduleNaturePlaceCardRuntime'), 'Natur-runtime skal starte når criticalReady sendes');
assert(toastRuntime.includes('window.addEventListener("hg:appReady", scheduleNaturePlaceCardRuntime'), 'appReady skal være fallback for natur-runtime');
assert(toastRuntime.includes('window.HGNaturePlaceMap?.patchOpenPlaceCard?.()'), 'PlaceCard-wrapperen skal patches eksplisitt');
assert(toastRuntime.includes('window.HGNaturePlaceMap?.applyToPlaceCard?.(currentPlace)'), 'Et allerede åpent sted skal oppdateres etter sen lasting');
assert(toastRuntime.includes('closest("[data-flora], [data-fauna]")'), 'Både flora- og faunaknapper skal bruke fullt artskort');
assert(toastRuntime.includes('window.openNatureCard({ ...obj, _kind: kind })'), 'Artsknapper skal åpne canonical nature-card');

assert(bridgeRuntime.includes('"data/natur/nature_place_map.json"'), 'Naturbroen skal lese hovedkartet');
assert(bridgeRuntime.includes('"data/natur/nature_bird_place_map.json"'), 'Naturbroen skal lese fuglekartet');
assert(bridgeRuntime.includes('"data/natur/nature_oslo_expansion_place_map.json"'), 'Naturbroen skal lese utvidelseskartet');
assert(bridgeRuntime.includes('"data/natur/nature_routes_place_map.json"'), 'Naturbroen skal lese rutekartet');
assert(bridgeRuntime.includes('const floraHtml = floraItems.length'), 'Natur-rundingen skal rendre flora');
assert(bridgeRuntime.includes('const faunaHtml = faunaItems.length'), 'Natur-rundingen skal rendre fauna');
assert(bridgeRuntime.includes('const count = nature.floraItems.length + nature.faunaItems.length'), 'Rundingsantallet skal telle alle arter');

console.log('Nature PlaceCard runtime loader audit OK');
