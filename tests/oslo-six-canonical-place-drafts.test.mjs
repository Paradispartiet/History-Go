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
    assert.equal(draft.image,''); assert.equal(draft.cardImage,'');
    for (const key of ['lat','lon','r']) assert.equal(draft[key],null);
    assert.ok(p.missing_release_checks.includes('safe_visitor_geopoint_and_radius'));
    assert.equal([...active].some(x=>x.endsWith('/'+p.id+'.json')),false);
  }
  assert.equal(release.places.filter(p=>p.provisional_site_poi_reference!==null).length,2);
  assert.equal(release.places.filter(p=>p.image_source_page_candidate!==null).length,5);
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
