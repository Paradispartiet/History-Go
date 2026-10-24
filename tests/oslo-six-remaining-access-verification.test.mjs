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

test('geo research stays explicitly non-canonical until a public path waypoint and radius are checked', () => {
  const report = read(EVIDENCE);
  const byId = new Map(report.decisions.map(x => [x.place_id, x]));
  for (const entry of report.decisions) {
    const geo = entry.geo_research;
    assert.ok(geo, entry.place_id + ': missing source-sensitive geo research');
    assert.equal(geo.usable_as_canonical_waypoint, false);
    assert.equal(geo.on_path_waypoint_verified, false);
    assert.equal(geo.radius_justified, false);
    assert.ok(geo.public_path_verification_method.length > 80);
    assert.ok(geo.new_evidence.length > 80);
    if (geo.research_only_coordinate) {
      assert.ok(Number.isFinite(geo.research_only_coordinate.lat));
      assert.ok(Number.isFinite(geo.research_only_coordinate.lon));
      assert.ok(geo.research_only_coordinate.role.includes('not_'));
    }
    assert.equal(entry.safe_observation_waypoint, null);
    assert.equal(entry.visitor_radius_m, null);
  }
  const linderud = byId.get('linderud_gard');
  assert.equal(linderud.geo_research.operator_map_url, 'https://mia.no/linderud/finn-oss');
  assert.match(linderud.geo_research.research_only_coordinate.role, /not_visitor_path/);

  const sarabraten = byId.get('sarabraten');
  assert.match(sarabraten.geo_research.candidate_kind, /separate_from_ruins_and_milorg_memorial/);

  const saeterhytten = byId.get('saeterhytten_bygdoy');
  assert.equal(saeterhytten.geo_research.research_only_coordinate.role,
    'photo_camera_location_not_independently_confirmed_public_waypoint');
  assert.match(saeterhytten.geo_research.coordinate_independence_warning,
    /ikke to uavhengig/);

  const teglverk = byId.get('kristiania_teglverk_bryn');
  assert.equal(teglverk.geo_research.research_only_coordinate, null);
  assert.equal(teglverk.geo_research.cadastral_reference, '137/31');
  assert.ok(teglverk.geo_research.address_18_support.length >= 3);
  assert.match(teglverk.geo_research.conflicting_source_14, /oslobyleksikon/);
  assert.equal(teglverk.visitor_pin, 'HARD_HOLD');
});

test('candidate landmarks are documented without declaring a playable coordinate', () => {
  const report = read(EVIDENCE);
  assert.equal(report.on_path_validation_status,
    'CANDIDATE_LANDMARKS_DOCUMENTED_NO_GEOREFERENCED_PUBLIC_VISITOR_ANCHOR');
  for (const entry of report.decisions) {
    const plan = entry.visitor_observation_plan;
    assert.ok(plan && plan.candidate_landmark.length > 60, entry.place_id);
    assert.ok(plan.visual_evidence_url.startsWith('https://'), entry.place_id);
    assert.ok(plan.operator_site_layout_url.startsWith('https://'), entry.place_id);
    assert.ok(plan.onsite_scope.length > 60, entry.place_id);
    assert.ok(plan.exclusion.length > 80, entry.place_id);
    assert.ok(plan.missing_verification.length > 80, entry.place_id);
    assert.equal(plan.approved_waypoint, null, entry.place_id);
    assert.equal(plan.approved_radius_m, null, entry.place_id);
    assert.equal(plan.ready_for_activation, false, entry.place_id);
    assert.equal(entry.safe_observation_waypoint, null, entry.place_id);
    assert.equal(entry.visitor_radius_m, null, entry.place_id);
  }
  const byId = new Map(report.decisions.map(e => [e.place_id, e]));
  assert.match(byId.get('linderud_gard').visitor_observation_plan.candidate_landmark, /blå X/);
  assert.match(byId.get('sarabraten').visitor_observation_plan.exclusion, /Milorg/);
  assert.match(byId.get('saeterhytten_bygdoy').visitor_observation_plan.exclusion, /brattskråningen/);
  const tegl = byId.get('kristiania_teglverk_bryn');
  assert.equal(tegl.visitor_pin, 'HARD_HOLD');
  assert.match(tegl.visitor_observation_plan.exclusion, /næringseiendom/);
  assert.ok(tegl.sources.some(s => s.url.endsWith('/bevarte-ringovner-i-norge/')));
});
