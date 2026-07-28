import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rules = fs.readFileSync('data/places/regler/PLACE_DESCRIPTION_CANONICAL.md', 'utf8');
const guide = fs.readFileSync('docs/PLACE_DESCRIPTION_INGRESS_GUIDE.md', 'utf8');
const template = JSON.parse(fs.readFileSync('data/places/regler/place_description_templates_v1.json', 'utf8'));

test('desc er definert som leksikalsk ingress med én styrende idé', () => {
  assert.match(rules, /leksikalske ingress/);
  assert.match(rules, /Styrende idé/);
  assert.equal(template.global.desc.role, 'encyclopedic_lead_not_compressed_table_of_contents');
  assert.equal(template.global.desc.controllingIdeaRequired, true);
});

test('ordtelling og faktatelling er ikke harde ingressporter', () => {
  assert.equal(template.global.desc.wordCountIsValidationGate, false);
  assert.equal(template.global.desc.minimumConcreteFacts, null);
  assert.equal(template.global.desc.rangeType, 'editorial_guidance_only');
});

test('ingresspolicyen avviser oppramsing og krever naturlig informasjonsflyt', () => {
  assert.ok(template.global.desc.avoid.includes('chronology_inventory'));
  assert.ok(template.global.desc.avoid.includes('name_and_year_pileup'));
  assert.equal(template.global.desc.knownNewFlowPreferred, true);
  assert.match(guide, /punktliste/);
});

test('detaljer skal utsettes til popupDesc', () => {
  assert.equal(template.global.desc.detailsDeferredToPopupDesc, true);
  assert.match(rules, /Resten skal utsettes til .*popupDesc/);
});
