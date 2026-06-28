const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('js/social/HGSpotmeetingPlaceCardDemo.js', 'utf8');
const app = fs.readFileSync('js/app.js', 'utf8');

assert(source.includes('HG_SpotmeetingPlaceCardDemo'), 'exports debug helper');
assert(source.includes('data-hg-spotmeeting-send'), 'renders a send button hook');
assert(source.includes('createSpotmeetingInvite'), 'uses existing invite API');
assert(source.includes('HG_TEST_MODE'), 'keeps UI demo gated to TEST_MODE');
assert(source.includes('quiz_together'), 'maps quiz action to preset');
assert(source.includes('route_one_day'), 'maps route action to preset');
assert(source.includes('shared_observation'), 'maps observation action to preset');
assert(source.includes('compare_place_learning'), 'maps match action to preset');
assert(app.includes('js/social/HGSpotmeetingPlaceCardDemo.js'), 'app loads the PlaceCard demo layer');

for (const forbidden of ['latitude', 'longitude', 'coords', 'lastSeen', 'followers', 'feed', 'freeText', 'visitedPlaces']) {
  assert(!source.includes(forbidden), `demo layer must not introduce forbidden field/copy: ${forbidden}`);
}

console.log('HG Spotmeeting PlaceCard demo tests passed');
