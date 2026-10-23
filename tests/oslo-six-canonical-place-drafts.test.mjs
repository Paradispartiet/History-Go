import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixCanonicalStaging } from '../scripts/build-oslo-six-canonical-place-drafts.mjs';

const load = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const ids = [
  'linderud_gard','ekebergrestauranten','frognerseteren',
  'sarabraten','saeterhytten_bygdoy','kristiania_teglverk_bryn'
];

test('six editorial stories export as faithful nonplayable canonical-shaped Place payloads',()=>{
  const release=buildOsloSixCanonicalStaging();
  assert.equal(release.schema,'history_go_oslo_six_unpublished_canonical_place_staging_v1');
  assert.equal(release.publication_status,'NOT_REGISTERED_NOT_PLAYABLE_NO_FILE_WRITES');
  assert.deepEqual(release.places.map(p=>p.id),ids);
  assert.equal(release.places.reduce((n,p)=>n+p.quiz_candidate_count,0),133);
  assert.equal(release.places.reduce((n,p)=>n+p.quizcard_candidate_count,0),60);
  const manifest=load('data/places/manifest.json');
  const active=new Set(manifest.files);
  const expectedCategories=['historie','by','historie','historie','historie','naeringsliv'];
  for(const [i,p] of release.places.entries()){
    const draft=p.proposed_canonical_fields;
    assert.equal(draft.id,ids[i]); assert.equal(draft.category,expectedCategories[i]);
    assert.equal(p.publication_status,'STAGING_ONLY_NOT_PLAYABLE');
    assert.equal(p.fagverk_prepared,true);
    assert.ok(draft.desc.length>=110);
    assert.ok(draft.popupDesc.length>=600);
    assert.ok(draft.popupDesc.includes('\n\n'));
    assert.equal(draft.image,''); assert.equal(draft.frontImage,''); assert.equal(draft.cardImage,'');
    assert.ok(p.missing_release_checks.includes('separate_portrait_frontImage'));
    assert.ok(p.missing_release_checks.includes('licensed_image_binding_and_attribution'));
    if(p.id==='kristiania_teglverk_bryn') {
      assert.equal(p.staged_image_candidates,null);
    } else {
      const photo=p.staged_image_candidates;
      assert.equal(photo.publication_status,'STAGED_ONLY_NOT_BOUND');
      assert.equal(photo.front_image_status,'PORTRAIT_BINARY_IN_REPO_NOT_BOUND');
      assert.equal(photo.portrait_review_candidate.artifact_only,false);
      assert.equal(photo.portrait_review_candidate.runtime_registered,false);
      assert.match(photo.portrait_review_candidate.sha256,/^[a-f0-9]{64}$/);
      assert.equal(photo.portrait_review_candidate.path,'bilder/places/auto/'+p.id+'__front_portrait.webp');
      assert.equal(photo.source_attribution_rendered,false);
      assert.ok(photo.source_page.startsWith('https://commons.wikimedia.org/wiki/File:'));
      assert.ok(photo.author && photo.license_url);
      for(const role of ['lead','card','popup'])
        assert.equal(photo.paths[role],'bilder/places/auto/'+p.id+'__commons_'+role+'.webp');
    }
    for (const key of ['lat','lon','r']) assert.equal(draft[key],null);
    assert.ok(p.missing_release_checks.includes('safe_visitor_geopoint_and_radius'));
    assert.equal([...active].some(x=>x.endsWith('/'+p.id+'.json')),['ekebergrestauranten','frognerseteren'].includes(p.id));
  }
  assert.equal(release.places.filter(p=>p.provisional_site_poi_reference!==null).length,2);
  assert.equal(release.places.filter(p=>p.image_source_page_candidate!==null).length,5);
  assert.equal(release.places.filter(p=>p.staged_image_candidates!==null).length,5);
});

test('no staging generator may import a candidate as an approved visitor entrance',()=>{
  const geo=load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json');
  const mutated=structuredClone(geo);
  mutated.places[1].coordinate={lat:59.89943,lon:10.76173};
  assert.throws(()=>buildOsloSixCanonicalStaging({geo:mutated}),/prematurely activated/);
  const candidates=load('reports/place-production/oslo-six-geolocation-candidates-20261022.json');
  const lifted=structuredClone(candidates);
  lifted.places[0].visitor_radius_m=60;
  assert.throws(()=>buildOsloSixCanonicalStaging({candidates:lifted}),/tentative point/);
});

test('image candidates fail closed on mismatched credits, unsafe release and incorrect roles',()=>{
  const attribution=load('reports/place-production/oslo-six-generated-image-attribution-20261022.json');
  const badCredit=structuredClone(attribution);
  badCredit.places[0].author='Unknown';
  assert.throws(()=>buildOsloSixCanonicalStaging({imageAttribution:badCredit}),/image attribution/);
  const badVariant=structuredClone(attribution);
  badVariant.places[0].variants[0].width=400;
  assert.throws(()=>buildOsloSixCanonicalStaging({imageAttribution:badVariant}),/invalid, missing or unreviewed/);
  const visualQA=load('reports/place-production/oslo-six-image-visual-qa-20261022.json');
  const unreviewed=structuredClone(visualQA);
  unreviewed.per_place[0].lead_status='HOLD';
  assert.throws(()=>buildOsloSixCanonicalStaging({imageVisualQA:unreviewed}),/invalid, missing or unreviewed/);
  const unsafeFactory=structuredClone(attribution);
  unsafeFactory.places.push({...unsafeFactory.places[0],place_id:'kristiania_teglverk_bryn'});
  assert.throws(()=>buildOsloSixCanonicalStaging({imageAttribution:unsafeFactory}),/unexpected evidence coverage/);
});

test('the 2026-10-23 portrait visual verdict cannot be replaced by identical crops or a false pass',()=>{
  const report=load('reports/place-production/oslo-six-portrait-visual-review-20261023.json');
  assert.equal(report.per_place.length,5);
  assert.equal(report.per_place.filter(p=>p.visual_decision==='PASS_FRAMING').length,3);
  assert.equal(report.per_place.filter(p=>p.visual_decision==='HOLD_ALTERNATIVE_SOURCE_OR_COMPOSITION').length,2);
  assert.equal(report.constraints.candidates_checked_into_repository,false);
  for(const row of report.per_place)assert.notEqual(row.candidate_sha256.center_original,row.candidate_sha256.offset_original,row.place_id);
  const bad=structuredClone(report);
  bad.per_place[0].candidate_sha256.offset_original=bad.per_place[0].candidate_sha256.center_original;
  assert.throws(()=>buildOsloSixCanonicalStaging({portraitReview:bad}),/portrait metadata/);
  const premature=structuredClone(report);
  premature.constraints.candidates_checked_into_repository=true;
  assert.throws(()=>buildOsloSixCanonicalStaging({portraitReview:premature}),/portrait review must not imply image release/);
});

test('five physically committed portraits verify SHA256 and different photo source credits where relevant',()=>{
  const images=load('reports/place-production/oslo-six-frontimage-candidate-assets-20261023.json');
  const report=buildOsloSixCanonicalStaging();
  assert.equal(images.count,5);
  assert.equal(report.places.filter(p=>p.staged_image_candidates!==null).length,5);
  for(const image of images.sites){
    const staged=report.places.find(p=>p.id===image.place_id);
    assert.equal(staged.staged_image_candidates.portrait_review_candidate.source_page,image.source_page);
    assert.equal(staged.proposed_canonical_fields.frontImage,'');
    assert.equal(staged.proposed_canonical_fields.image,'');
    assert.equal(staged.proposed_canonical_fields.cardImage,'');
  }
  for(const id of ['ekebergrestauranten','frognerseteren']){
    const p=report.places.find(p=>p.id===id);
    assert.notEqual(p.staged_image_candidates.portrait_review_candidate.source_page,
      p.staged_image_candidates.source_page,'portrait and landscape must preserve separate photo attribution');
  }
  const changed=structuredClone(images);
  changed.sites[0].sha256='f'.repeat(64);
  assert.throws(()=>buildOsloSixCanonicalStaging({portraitAssets:changed}),/SHA256 or WebP signature drift/);
  const prematurelyReleased=structuredClone(images);
  prematurelyReleased.sites[0].canonical_place_bound=true;
  assert.throws(()=>buildOsloSixCanonicalStaging({portraitAssets:prematurelyReleased}),/cannot assert runtime release/);
});
