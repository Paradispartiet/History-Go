import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));

test('Kristiania Teglverk sources favor historical no. 18 but contradictory no. 14 cannot be silently discarded', () => {
  const a = load('reports/place-production/kristiania-teglverk-address-identity-evidence-20261022.json');
  const geo = load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json');
  const gates = load('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  const pin = geo.places.find(p=>p.place_id==='kristiania_teglverk_bryn');
  const gate = gates.places.find(p=>p.place_id==='kristiania_teglverk_bryn');
  assert.equal(a.place_id, 'kristiania_teglverk_bryn');
  assert.equal(a.assessment.stronger_historical_building_address, 'Nils Hansens vei 18');
  assert.equal(a.assessment.status, 'ADDRESS_EVIDENCE_STRONGER_FOR_18_BUT_HARD_HOLD');
  assert.equal(a.publication_status,'NO_CANONICAL_PLACE_NO_PIN_NO_PUBLIC_ENTRY_ASSUMED');
  assert.ok(a.evidence.filter(e=>e.address==='Nils Hansens vei 18').length>=5);
  const municipal=a.evidence.find(e=>e.kind==='oslo_municipality_heritage_planning_report_search_extract');
  assert.ok(municipal.source.endsWith('.pdf'));
  assert.match(municipal.current_review,/full_page_review_pending/);
  const caseFile=a.evidence.find(e=>e.kind==='recent_building_project_register_reporting_official_application');
  assert.ok(caseFile.source.startsWith('https://norskbyggedata.no/'));
  assert.deepEqual(
    [a.assessment.recent_cadastral_reference_candidate.gnr,
     a.assessment.recent_cadastral_reference_candidate.bnr],
    [137,31]
  );
  assert.equal(a.assessment.recent_cadastral_reference_candidate.may_use_for_public_GPS,false);
  assert.match(a.assessment.recent_cadastral_reference_candidate.validation_status,/NOT_INDEPENDENTLY_VERIFIED/);
  assert.equal(a.evidence.filter(e=>e.address==='Nils Hansens vei 14').length, 1);
  assert.match(a.assessment.address_14_alternate_identity,/Zinkhvidt/);
  for (const row of a.evidence) assert.ok(row.source.startsWith('https://'));
  for (const value of ['cadastral_link_verified','exact_surviving_building_footprint_verified','public_external_access_2026_verified','street_level_geo_verified'])
    assert.equal(a.assessment[value],false,value);
  for (const key of ['visitor_anchor','lat','lon','radius_m'])
    assert.equal(a.assessment[key],null,key);
  assert.equal(pin.address_source_status,'conflicting_14_18');
  assert.equal(pin.coordinate_status,'HARD_HOLD');
  assert.equal(pin.coordinate,null);
  assert.equal(pin.radius_m,null);
  assert.equal(pin.address_identity_evidence_file,'reports/place-production/kristiania-teglverk-address-identity-evidence-20261022.json');
  assert.equal(gate.geographical_anchor.status,'HOLD');
  assert.equal(gate.geographical_anchor.lat,null);
  assert.equal(gate.geographical_anchor.radius_m,null);
  assert.equal(gate.release_status,'BLOCKED');
  assert.ok(Object.values(gate.publication_gates).every(v=>v===false));
});
