import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const EVIDENCE = 'reports/place-production/oslo-six-remaining-access-verification-20261024.json';
const TARGETS = ['linderud_gard', 'sarabraten', 'saeterhytten_bygdoy', 'kristiania_teglverk_bryn'];

test('remaining Oslo sites keep access evidence distinct from approved visitor coordinates', () => {
  const report = read(EVIDENCE);
  const gates = read('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  const placesManifest = read('data/places/manifest.json');
  const quizManifest = read('data/quiz/manifest.json');
  assert.equal(report.schema, 'history_go_oslo_six_remaining_access_verification_v1');
  assert.equal(report.overall_status, 'VISITOR_ACCESS_PARTLY_RESOLVED_GPS_ALL_HELD');
  assert.deepEqual(report.decisions.map(x => x.place_id).sort(), [...TARGETS].sort());

  for (const entry of report.decisions) {
    assert.ok(entry.sources.length >= 2, entry.place_id + ': insufficient access evidence');
    assert.ok(entry.sources.every(x => x.url.startsWith('https://') && x.publisher && x.claim.length > 40));
    assert.ok(entry.next_required.length > 80, entry.place_id + ': missing actionable geo-verification step');
    assert.equal(entry.safe_observation_waypoint, null);
    assert.equal(entry.visitor_radius_m, null);
    assert.ok(['UNVERIFIED', 'HARD_HOLD'].includes(entry.visitor_pin));

    const gate = gates.places.find(x => x.place_id === entry.place_id);
    assert.ok(gate, entry.place_id + ': missing original release hold');
    assert.equal(gate.release_status, 'BLOCKED');
    assert.equal(gate.geographical_anchor.status, 'HOLD');
    for (const k of ['lat', 'lon', 'radius_m']) assert.equal(gate.geographical_anchor[k], null);
    assert.ok(Object.values(gate.publication_gates).every(v => v === false));
    assert.ok(!(placesManifest.files || []).some(p => p.endsWith('/' + entry.place_id + '.json')),
      entry.place_id + ': source-only evidence cannot publish a Place');
    assert.ok(!(quizManifest.sets || []).some(q => q.targetId === entry.place_id),
      entry.place_id + ': source-only evidence cannot publish a quiz');
  }
});

test('public gardens and parks do not imply event-space access, and teglverk stays hard-held', () => {
  const report = read(EVIDENCE);
  const byId = new Map(report.decisions.map(x => [x.place_id, x]));
  assert.equal(byId.get('linderud_gard').pedestrian_exterior_access, 'OFFICIALLY_CONFIRMED');
  assert.equal(byId.get('linderud_gard').indoor_access, 'GUIDED_TOURS_OR_EVENTS_ONLY');
  assert.equal(byId.get('saeterhytten_bygdoy').pedestrian_exterior_access, 'OPERATOR_CONFIRMS_PARK_PUBLIC');
  assert.equal(byId.get('saeterhytten_bygdoy').indoor_access, 'PRIVATE_EVENT_HIRE_NOT_GENERAL_PUBLIC');
  assert.equal(byId.get('sarabraten').indoor_access, 'NOT_APPLICABLE_RUINS');
  const kiln = byId.get('kristiania_teglverk_bryn');
  assert.equal(kiln.pedestrian_exterior_access, 'NOT_CONFIRMED_ON_INDUSTRIAL_PROPERTY');
  assert.equal(kiln.visitor_pin, 'HARD_HOLD');
  assert.match(kiln.next_required, /eiendomsparsell/i);
});
