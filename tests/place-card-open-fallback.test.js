const assert = require('assert');
const fs = require('fs');

const placeCard = fs.readFileSync('js/ui/place-card.js', 'utf8');
const bottomSheet = fs.readFileSync('js/core/bottomSheetController.js', 'utf8');

const openStart = placeCard.indexOf('window.openPlaceCard = async function (place)');
assert(openStart >= 0, 'PlaceCard open function exists');
const openEnd = placeCard.indexOf('// ============================================================\n// PLACE CARD – bottom sheet bridge', openStart);
assert(openEnd > openStart, 'PlaceCard open function end marker exists');
const openBody = placeCard.slice(openStart, openEnd);

assert(openBody.includes('const fullPlace = await window.DataHub.loadFullPlace(placeId, { cache: "default" });'), 'openPlaceCard still attempts optional full-place enrichment');
assert(openBody.includes('if (fullPlace && typeof fullPlace === "object")'), 'full-place data is merged only when present');
assert(!openBody.includes('if (!fullPlace || typeof fullPlace !== "object")'), 'missing full-place data must not hard-fail opening');
assert(!openBody.includes('return false;\n    }\n  }\n\n  if (!isPlaceCardPlaceComplete(place))'), 'loadFullPlace failures should fall through to base-place completeness check');
assert(openBody.includes('if (!isPlaceCardPlaceComplete(place))'), 'final base/enriched place is still validated before opening');
assert(openBody.includes('forcePlaceCardOpenState(card, nextPlaceId);'), 'successful opens force visible PlaceCard DOM state');

const forceStart = placeCard.indexOf('function forcePlaceCardOpenState(card, placeId)');
assert(forceStart >= 0, 'visible-state helper exists');
const forceBody = placeCard.slice(forceStart, placeCard.indexOf('\n}', forceStart) + 2);
assert(forceBody.includes('card.classList.remove("is-hidden", "is-collapsed")'), 'visible-state helper removes stale hidden/collapsed classes');
assert(forceBody.includes('card.classList.add("is-open")'), 'visible-state helper adds is-open');
assert(forceBody.includes('card.setAttribute("aria-hidden", "false")'), 'visible-state helper clears aria-hidden');
assert(forceBody.includes('card.dataset.currentPlaceId = String(placeId || "").trim()'), 'visible-state helper records current place id');
assert(forceBody.includes('window.bottomSheetController.open()'), 'visible-state helper syncs bottom sheet controller');

const setStateStart = bottomSheet.indexOf('function setState(next)');
assert(setStateStart >= 0, 'bottomSheetController.setState exists');
const setStateBody = bottomSheet.slice(setStateStart, bottomSheet.indexOf('\n  }\n\n  function bindCollapseButton', setStateStart));
assert(!setStateBody.includes('if (next === state) return'), 'setState must sync DOM even when the requested state is already current');
assert(setStateBody.includes('el.classList.remove("is-open", "is-collapsed", "is-hidden")'), 'setState always rebuilds PlaceCard state classes');
assert(setStateBody.includes('el.setAttribute("aria-hidden", "false")'), 'setState syncs aria-visible for open state');

const bindStart = bottomSheet.indexOf('function bindCollapseButton()');
assert(bindStart >= 0, 'bottomSheetController binds the PlaceCard collapse button directly');
const bindEnd = bottomSheet.indexOf('\n  function open()', bindStart);
assert(bindEnd > bindStart, 'collapse button binding has a stable function boundary');
const bindBody = bottomSheet.slice(bindStart, bindEnd);
assert(bindBody.includes('document.getElementById("pcCollapseBtn")'), 'collapse binding targets the visible PlaceCard button');
assert(bindBody.includes('event.stopImmediatePropagation()'), 'early binding prevents a later duplicate toggle handler from reopening the card');
assert(bindBody.includes('window.collapsePlaceCard()'), 'collapse click uses the canonical PlaceCard collapse flow');

const initStart = bottomSheet.indexOf('function init()');
const initEnd = bottomSheet.indexOf('\n  window.bottomSheetController', initStart);
const initBody = bottomSheet.slice(initStart, initEnd);
assert(initBody.includes('bindCollapseButton();'), 'collapse button is bound during critical bottom-sheet initialization');

console.log('place-card open fallback audit OK');
