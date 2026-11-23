import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const manifest=read('data/badges/subbadge_round01_production_v1.json');
const expectedIds={scenekunst:7,by:10,film_tv:12};

test('underbadge round 01 follows all 29 canonical category IDs and palettes',()=>{
  assert.equal(manifest.version,1);
  assert.equal(manifest.status,'design_briefs_only');
  assert.deepEqual(manifest.scope,['scenekunst','by','film_tv']);
  assert.equal(manifest.families.length,3);
  let count=0;
  for(const family of manifest.families){
    const category=read('data/badges/'+family.categoryId+'.json');
    assert.equal(family.primaryColor,category.color.toUpperCase());
    assert.equal(family.secondaryColor,category.secondaryColor.toUpperCase());
    assert.equal(family.assets.length,expectedIds[family.categoryId]);
    assert.deepEqual(family.assets.map(asset=>asset.id),category.sub);
    assert.equal(new Set(family.assets.map(asset=>asset.id)).size,family.assets.length);
    for(const asset of family.assets){
      assert.ok(asset.label.length>2);
      assert.ok(asset.motif.length>12);
      count++;
    }
  }
  assert.equal(count,29);
});

test('no candidate artwork is spuriously called approved or activated',()=>{
  assert.equal(manifest.currentArtworkCount,0);
  for(const family of manifest.families){
    const category=read('data/badges/'+family.categoryId+'.json');
    assert.equal(Object.keys(category.subBadgeImages||{}).length,0);
    for(const asset of family.assets){
      assert.equal(asset.status,'needs_visual_art_review');
      assert.equal(asset.approved,false);
      assert.equal(asset.image,null);
      assert.equal(asset.sha256,null);
    }
  }
});

test('nine protected main badge images remain linked and real',()=>{
  assert.equal(Object.keys(manifest.protectedMainImages).length,9);
  for(const [id,image] of Object.entries(manifest.protectedMainImages)){
    assert.equal(read('data/badges/'+id+'.json').image,image);
    assert.ok(existsSync(resolve(root,image)),'Missing approved asset: '+image);
  }
});

test('existing Religion and Vitenskap underbadge families remain linked',()=>{
  for(const [id,expected] of [['religion',8],['vitenskap',7]]){
    const family=read('data/badges/'+id+'_underbadge_artwork.json');
    const category=read('data/badges/'+id+'.json');
    assert.equal(family.parentImage,category.image);
    assert.equal(family.assets.length,expected);
    for(const asset of family.assets)assert.ok(existsSync(resolve(root,asset.image)));
  }
});
