import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditOsloSixV1Readiness } from '../scripts/audit-oslo-six-v1-release.mjs';

const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('six places have staged material but zero falsely published v1 releases',()=>{
  const report=auditOsloSixV1Readiness();
  assert.equal(report.schema,'history_go_oslo_six_readiness_audit_v1');
  assert.equal(report.status,'CANONICAL_CANDIDATES_PENDING_RELEASE');
  assert.equal(report.canonical_candidates,2);
  assert.equal(report.candidate_count,6);
  assert.equal(report.story_drafts,6);
  assert.equal(report.fullquiz_candidates,133);
  assert.equal(report.quizcard_candidates,60);
  assert.equal(report.fagverk_drafts,6);
  assert.equal(report.staged_credited_image_triplets,5);
  assert.equal(report.published_v1,0);
  assert.equal(report.places.filter(p=>p.editorial.credited_landscape_triplet).length,5);
  for(const item of report.places){
    if(['ekebergrestauranten','frognerseteren'].includes(item.place_id)){
      assert.equal(item.status,'CANONICAL_CANDIDATE_NOT_YET_PUBLISHED_V1');
      assert.equal(item.live.canonical_place_in_manifest,true);
      assert.equal(item.live.quizcard_registered,true);
      assert.equal(item.live.knowledge_synced,true);
      continue;
    }
    assert.equal(item.status,'STAGING_ONLY_NOT_V1');
    assert.ok(Object.values(item.live).every(v=>v===false),item.place_id);
    assert.ok(item.blocking_release_gates.includes('approved_visitor_anchor'));
    assert.ok(item.blocking_release_gates.includes('standing_frontImage'));
    assert.ok(item.blocking_release_gates.includes('actual_live_app_browser_qa'));
    assert.ok(item.blocking_release_gates.includes('source_claim_review_approved'));
  }
  assert.equal(report.places.at(-1).place_id,'kristiania_teglverk_bryn');
  assert.ok(report.places.at(-1).blocking_release_gates.includes('credited_landscape_triplet'));
});
test('readiness audit fails closed when any active release is secretly introduced',()=>{
  const m=load('data/places/manifest.json');
  m.files.push('places/naeringsliv/oslo/places/kristiania_teglverk_bryn.json');
  assert.throws(()=>auditOsloSixV1Readiness({activeManifest:m}),/partially activated release gate/);
  const g=load('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  g.places[0].publication_gates.canonical_place=true;
  assert.throws(()=>auditOsloSixV1Readiness({gates:g}),/partially activated release gate/);
});
