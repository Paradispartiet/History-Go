import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = path => new URL('../' + path, import.meta.url);
const load = path => JSON.parse(readFileSync(root(path), 'utf8'));

test('all fifteen checked-in Commons WebPs have exact recorded cryptographic hashes and retained source credits', () => {
  const report=load('reports/place-production/oslo-six-generated-image-attribution-20261022.json');
  const source=load('reports/place-production/oslo-six-image-rights-shortlist-20261022.json');
  const qa=load('reports/place-production/oslo-six-image-visual-qa-20261022.json');
  const manifests=load('data/places/manifest.json');
  const gate=load('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  assert.equal(source.status,'SOURCE_PAGES_REVIEWED_15_CROPS_STAGED_NOT_REGISTERED');
  assert.equal(report.schema,'history_go_oslo_six_prepared_commons_image_triplets_v1');
  assert.equal(report.status,'PREPARED_BYTES_NOT_VISUALLY_QA_NOT_REGISTERED');
  assert.equal(qa.status,'VISUAL_FRAMING_PASS_15_ASSETS_COMMITTED_BUT_NO_RUNTIME_BINDING');
  assert.equal(qa.still_required.webp_binary_committed_to_repository,true);
  const allowedIds=new Set(['linderud_gard','ekebergrestauranten','frognerseteren','sarabraten','saeterhytten_bygdoy']);
  const roleSize={lead:[1600,900],card:[900,600],popup:[1200,800]};
  assert.equal(report.places.length,5);
  assert.deepEqual(new Set(report.places.map(p=>p.place_id)),allowedIds);
  const paths=new Set();
  for(const p of report.places){
    const src=source.places.find(x=>x.place_id===p.place_id);
    const q=qa.per_place.find(x=>x.place_id===p.place_id);
    assert.ok(src&&q);
    assert.equal(p.author,src.lead_candidate.author);
    assert.equal(p.license,src.lead_candidate.license);
    assert.equal(p.source_page,src.lead_candidate.page);
    assert.equal(p.canonical_place_bound,false);
    assert.equal(p.attribution_display_checked,false);
    assert.equal(p.visual_quality_approved,false,'automated source record cannot override separate human crop QA');
    assert.equal(p.variants.length,3);
    for(const v of p.variants){
      assert.deepEqual([v.width,v.height],roleSize[v.role]);
      const path='bilder/places/auto/'+p.place_id+'__commons_'+v.role+'.webp';
      assert.equal(v.path,path);
      assert.ok(!paths.has(path),'image path repeated '+path);
      paths.add(path);
      const data=readFileSync(root(path));
      assert.ok(data.length>12000);
      assert.equal(data.subarray(0,4).toString('ascii'),'RIFF');
      assert.equal(data.subarray(8,12).toString('ascii'),'WEBP');
      assert.equal(createHash('sha256').update(data).digest('hex'),v.sha256,path);
      assert.equal(q[v.role+'_status'],'FRAMING_PASS');
    }
    assert.equal(manifests.files.some(path=>path.endsWith('/'+p.place_id+'.json')),['ekebergrestauranten','frognerseteren'].includes(p.place_id));
    assert.equal(gate.places.find(x=>x.place_id===p.place_id).release_status,'BLOCKED');
  }
  assert.equal(paths.size,15);
});
