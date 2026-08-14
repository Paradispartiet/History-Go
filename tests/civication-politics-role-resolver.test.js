#!/usr/bin/env node
const assert = require('assert');
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const expected = {
  'Organisasjonssekretær':'politikk_organisasjonsarbeid',
  'Politisk rådgiver':'politikk_politisk_radgivning',
  'Ordfører':'politikk_kommunal_ledelse',
  'Stortingsrepresentant':'politikk_parlamentarisk_arbeid',
  'Statssekretær':'politikk_regjeringsledelse',
  'Statsråd (minister)':'politikk_regjeringsledelse',
  'Statsminister':'politikk_regjeringsledelse'
};
for (const [title, scope] of Object.entries(expected)) {
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'politikk', title}), scope, `${title}: title resolver mismatch`);
  assert.strictEqual(Resolver.resolveCareerRoleId({career_id:'politikk', title}), scope, `${title}: role id mismatch`);
}
console.log('civication politics role resolver ok: 7 formal titles / 5 shared scopes');
