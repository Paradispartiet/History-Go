#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'Civication.html'), 'utf8');
const bridgePath = path.join(root, 'js/Civication/systems/civicationSpatialDayBridge.js');
assert.ok(fs.existsSync(bridgePath), 'Spatial Day Bridge must exist');
const bridge = fs.readFileSync(bridgePath, 'utf8');

const life = html.indexOf('js/Civication/ui/CivicationLifestoryUI.js');
const spatial = html.indexOf('js/Civication/systems/civicationSpatialDayBridge.js');
const shell = html.indexOf('js/Civication/civicationShellLoader.js');
assert.ok(life >= 0 && spatial > life && shell > spatial, 'Spatial Day Bridge loads after Min dag and before shell/day runtime');

assert.match(bridge, /CivicationNextActionSelector/);
assert.match(bridge, /map_context/);
assert.match(bridge, /Dagens steder/);
assert.match(bridge, /data-civi-spatial-open-map/);
assert.match(bridge, /data-spatial-mail-id/);
assert.match(bridge, /CivicationNextActionUI\?\.open/);
assert.match(bridge, /civi-mapmode/);
assert.match(bridge, /state: "now"/);
assert.match(bridge, /"next"/);
assert.match(bridge, /"later"/);
assert.match(bridge, /if \(!anchor\) return false/);

console.log('civication spatial day integration ok');
