import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const fromRoot = (relative) => readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(fromRoot(relative));
const gate = readJson('reports/place-production/oslo-six-places-integration-gates-20261022.json');
const editorial = fromRoot(gate.source_ownership.editorial);
const linderud = readJson(gate.source_ownership.linderud_brief);
const manifest = readJson('data/places/manifest.json');

const EXPECTED_IDS = [
  'linderud_gard',
  'ekebergrestauranten',
  'frognerseteren',
  'sarabraten',
  'saeterhytten_bygdoy',
  'kristiania_teglverk_bryn',
];

function markdownBlock(markdown, marker, boundary) {
  const start = markdown.indexOf(marker);
  assert.ok(start >= 0, `Missing markdown heading: ${marker}`);
  const tail = markdown.slice(start + marker.length);
  const next = tail.search(boundary);
  return next < 0 ? tail : tail.slice(0, next);
}

test('six-place integration gate is explicit, non-canonical and fail-closed', () => {
  assert.equal(gate.schema, 'history_go_oslo_six_place_intake_gate_v1');
  assert.equal(gate.status, 'editorial_only_not_v1');
  assert.deepEqual(gate.places.map((place) => place.place_id), EXPECTED_IDS);
  assert.equal(gate.safeguards.active_places, 0);
  assert.equal(gate.safeguards.v1_certified, 0);
  assert.equal(new Set(gate.places.map((place) => place.place_id)).size, 6);

  const paths = new Set(manifest.files);
  for (const place of gate.places) {
    assert.equal(place.release_status, 'BLOCKED', place.place_id);
    assert.equal(place.source_status, 'full_text_review_pending', place.place_id);
    assert.equal(place.geographical_anchor.status, 'HOLD', place.place_id);
    assert.equal(place.geographical_anchor.lat, null, place.place_id);
    assert.equal(place.geographical_anchor.lon, null, place.place_id);
    assert.equal(place.geographical_anchor.radius_m, null, place.place_id);
    assert.ok(place.geographical_anchor.reason.length >= 20);
    assert.ok(place.address_reference_only);
    assert.ok(place.canonical_identity);
    assert.equal(place.editorial.short_long_story_drafted, true);
    assert.equal(place.editorial.quizcard_fact_candidates, 10);

    for (const [gateName, passed] of Object.entries(place.publication_gates)) {
      assert.equal(passed, false, `${place.place_id}: ${gateName} cannot be marked PASS from an editorial draft`);
    }
    assert.ok(Object.keys(place.publication_gates).length >= 10);
    assert.equal([...paths].some((file) => file.endsWith(`/${place.place_id}.json`)), ['ekebergrestauranten','frognerseteren'].includes(place.place_id),
      `${place.place_id} must follow the separately validated canonical onboarding inventory`);
  }
  const teglverk = gate.places.find((place) => place.place_id === 'kristiania_teglverk_bryn');
  assert.match(teglverk.geographical_anchor.reason, /14\/18/);
});

test('all six stories contain ten distinct numbered candidate fact questions', () => {
  const first = editorial.split('## Supplerende Fagverk-plan')[0];
  assert.equal(first.includes('## Linderud gård'), true);
  for (const place of gate.places) {
    const block = markdownBlock(first, `## ${place.name} (\`${place.place_id}\`)`, /^## /m);
    assert.match(block, /\*\*Foreslått \`desc\`/);
    assert.match(block, /\*\*Foreslått \`popupDesc\`/);
    const candidates = [...block.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
    assert.deepEqual(candidates, Array.from({ length: 10 }, (_, i) => i + 1), place.place_id);
  }
});

test('five supplemental multiple-choice sets have 10 options each but are not active quizzes', () => {
  const supplemental = editorial.split('## Supplerende Fagverk-plan')[1];
  assert.ok(supplemental);
  let alternativeCount = 0;
  for (const place of gate.places) {
    const expected = place.place_id === 'linderud_gard' ? 0 : 10;
    assert.equal(place.editorial.four_choice_alternatives, expected);
    if (expected === 0) continue;
    const block = markdownBlock(supplemental, `### ${place.name}\n`, /^### /m);
    assert.match(block, /\*\*Fagverk – stedets egen undersøkelsesjobb:\*\*/);
    const questions = [...block.matchAll(/^(\d{1,2})\.\s+[^\n|]+\|[^\n|]+\|[^\n|]+\|[^\n|]+$/gm)]
      .map((match) => Number(match[1]));
    assert.deepEqual(questions, Array.from({ length: 10 }, (_, i) => i + 1), place.place_id);
    alternativeCount += questions.length;
  }
  assert.equal(alternativeCount, 50);
});

test('Linderud claim bank is preserved, source-bounded, and not promoted to active quiz', () => {
  const entry = gate.places.find((place) => place.place_id === 'linderud_gard');
  assert.equal(entry.editorial.source_claim_bank_count, 35);
  assert.equal(linderud.targetId, 'linderud_gard');
  assert.equal(linderud.status, 'in_review');
  assert.equal(linderud.profile_decision.confirmed, false);
  assert.equal(linderud.claims.length, 35);
  assert.equal(new Set(linderud.claims.map((claim) => claim.claim_id)).size, 35);
  assert.equal(Object.keys(linderud.sources).length, 6);
  assert.equal(linderud.publication_gate.place_created, false);
  assert.equal(linderud.publication_gate.quiz_manifest_registered, false);
  assert.equal(linderud.publication_gate.preflight_cli_run, false);
  for (const claim of linderud.claims) {
    assert.ok(claim.statement);
    assert.ok(claim.source_ids.length > 0, claim.claim_id);
    for (const sourceId of claim.source_ids) {
      assert.ok(linderud.sources[sourceId], `${claim.claim_id} uses unknown source ${sourceId}`);
    }
  }
  assert.ok(Object.values(linderud.sources).some((source) => source.review_status === 'pending'));
});
