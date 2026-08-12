import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = file => fs.readFileSync(file, 'utf8');
const json = file => JSON.parse(read(file));

const place = json('data/places/by/oslo/places/torggata.json');
const lenses = json('data/observations/observations_by.json');
const historicalRoutes = json('data/routes/historical/routes_historical_oslo.json');
const card = read('js/ui/place-card.js');
const observationsRuntime = read('js/observations.js');
const interactions = read('js/ui/interactions.js');
const audit = json('reports/place-production/torggata-phase11-observer-note-route-audit-v1.json');

function allHistoricalChapterPlaceIds(routes) {
  return routes.flatMap(route => Array.isArray(route?.chapters) ? route.chapters : [])
    .map(chapter => String(chapter?.placeId || '').trim())
    .filter(Boolean);
}

test('Observer bruker canonical By-linse med faktisk observerbare fenomener', () => {
  assert.equal(place.id, 'torggata');
  assert.ok(place.category === 'by' || place.categoryId === 'by');
  assert.equal(lenses.subject_id, 'by');

  const lens = lenses.lenses.find(item => item.lens_id === 'by_byliv');
  assert.ok(lens, 'mangler by_byliv-linse');
  assert.equal(lens.type, 'multi_select');
  assert.equal(lens.allow_note, true);
  assert.match(lens.prompt, /faktisk ser eller merker/i);

  const optionIds = new Set(lens.options.map(option => option.id));
  for (const id of ['opphold', 'gjennomgang', 'kulturminne', 'moteplass', 'skjult_historie', 'kontrast']) {
    assert.ok(optionIds.has(id), `mangler observerbart valg ${id}`);
  }
  assert.ok(lens.related_emner.includes('em_by_opphold_vs_gjennomgang'));
  assert.ok(lens.concepts.includes('byliv'));

  assert.match(card, /subject_id: "by"/);
  assert.match(card, /categoryId: String\(place\.categoryId \|\| place\.category \|\| "by"\)/);
  assert.match(card, /lensId: "by_byliv"/);
});

test('Observer beholder learning-log-eierskap og place-target', () => {
  assert.match(observationsRuntime, /const LEARNING_KEY = "hg_learning_log_v1"/);
  assert.match(observationsRuntime, /type: "observation_done"/);
  assert.match(observationsRuntime, /targetType: s\(target\.targetType\)/);
  assert.match(observationsRuntime, /targetId: s\(target\.targetId\)/);
  assert.match(observationsRuntime, /appendLearningEvent\(evt\)/);
  assert.match(observationsRuntime, /related_emner/);
  assert.match(observationsRuntime, /concepts/);
  assert.match(observationsRuntime, /tags/);
});

test('Notat bruker eksisterende privat place-note-flow', () => {
  assert.match(card, /window\.handlePlaceNote\(place\)/);
  assert.match(interactions, /function handlePlaceNote\(place\)/);
  assert.match(interactions, /type: "place"/);
  assert.match(interactions, /placeId: place\.id/);
  assert.match(interactions, /visibility: "private"/);
  assert.match(interactions, /saveUserNotes\(\)/);
});

test('Rute bruker eksisterende navigasjon uten å konstruere historisk Torggata-rute', () => {
  assert.match(card, /window\.showNavRouteToPlace\(place\)/);
  assert.match(card, /window\.renderLeftRoutesList\(\)/);

  const historicalPlaceIds = allHistoricalChapterPlaceIds(historicalRoutes);
  assert.equal(historicalPlaceIds.includes('torggata'), false);

  // Torggatas routeSegments er navigasjonsgeometri og skal ikke brukes som bevis
  // på medlemskap i data/routes/historical.
  if (Object.hasOwn(place, 'routeSegments')) {
    assert.ok(Array.isArray(place.routeSegments));
  }
});

test('fase 11-auditen lukker eksisterende eiere uten parallelldata', () => {
  assert.equal(audit.place_id, 'torggata');
  assert.equal(audit.phase, '11');
  assert.equal(audit.result, 'PASS');
  assert.equal(audit.prior_work_gate.search_status, 'UTFØRT');
  assert.equal(audit.prior_work_gate.existing_phase11_branch_or_pr, false);
  assert.equal(audit.observer.status, 'PASS_EXISTING_RUNTIME');
  assert.equal(audit.observer.learning_log_key, 'hg_learning_log_v1');
  assert.equal(audit.note_flow.status, 'PASS_EXISTING_RUNTIME');
  assert.equal(audit.note_flow.visibility, 'private');
  assert.equal(audit.route.navigation.status, 'PASS_EXISTING_RUNTIME');
  assert.equal(audit.route.historical_route.status, 'N/A');
  assert.equal(audit.route.historical_route.new_route_created, false);
  assert.deepEqual(audit.canonical_data_changes, []);
  assert.equal(audit.next_phase, '12. People–sted-koblinger');
});
