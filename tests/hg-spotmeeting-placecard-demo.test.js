const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('js/social/HGSpotmeetingPlaceCardDemo.js', 'utf8');
const canonical = fs.readFileSync('js/social/HGSpotmeetingUI.js', 'utf8');
const app = fs.readFileSync('js/app.js', 'utf8');

// Wrapper: HGSpotmeetingPlaceCardDemo.js er kun kompatibilitet/demo og delegerer alt.
assert(source.includes('HG_SpotmeetingPlaceCardDemo'), 'exports debug helper');
assert(source.includes('HG_SpotmeetingUI'), 'wrapper delegates to the canonical UI');
assert(source.includes('HG_TEST_MODE'), 'wrapper keeps TEST_MODE helper');
assert(!source.includes('hgSpotmeetingSheet'), 'wrapper does not own the canonical sheet');
assert(!source.includes('createSpotmeetingInvite'), 'wrapper does not call the invite API directly');

// Canonical: js/social/HGSpotmeetingUI.js eier UI-flowen.
assert(canonical.includes('HG_SpotmeetingUI'), 'canonical UI exports global');
assert(canonical.includes('data-hg-spotmeeting-send'), 'canonical UI renders a send button hook');
assert(canonical.includes('createSpotmeetingInvite'), 'canonical UI uses existing invite API');
assert(canonical.includes('HG_TEST_MODE'), 'canonical UI keeps demo gated to TEST_MODE');
assert(canonical.includes('quiz_together'), 'canonical UI maps quiz action to preset');
assert(canonical.includes('route_one_day'), 'canonical UI maps route action to preset');
assert(canonical.includes('shared_observation'), 'canonical UI maps observation action to preset');
assert(canonical.includes('compare_place_learning'), 'canonical UI maps match action to preset');

assert(app.includes('js/social/HGSpotmeetingUI.js'), 'app loads the canonical Spotmeeting UI');
assert(app.includes('js/social/HGSpotmeetingPlaceCardDemo.js'), 'app loads the PlaceCard demo layer');
assert(app.indexOf('js/social/HGSpotmeetingUI.js') < app.indexOf('js/social/HGSpotmeetingPlaceCardDemo.js'), 'canonical UI loads before the compat wrapper');

for (const forbidden of ['latitude', 'longitude', 'coords', 'lastSeen', 'followers', 'feed', 'freeText', 'visitedPlaces']) {
  assert(!source.includes(forbidden), `demo layer must not introduce forbidden field/copy: ${forbidden}`);
  assert(!canonical.includes(forbidden), `canonical UI must not introduce forbidden field/copy: ${forbidden}`);
}

console.log('HG Spotmeeting PlaceCard demo tests passed');
