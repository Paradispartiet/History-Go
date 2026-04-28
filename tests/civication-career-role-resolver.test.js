#!/usr/bin/env node
const assert = require('assert');
const { resolveCareerRoleScope } = require('../js/Civication/systems/civicationCareerRoleResolver.js');
assert.strictEqual(resolveCareerRoleScope({ role_key: 'ekspeditor_butikkmedarbeider' }), 'ekspeditor');
assert.strictEqual(resolveCareerRoleScope({ role_key: 'naer_fagarbeider' }), 'fagarbeider');
console.log('career role resolver ok');
