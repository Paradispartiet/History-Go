import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('the same actor keeps the evidence and role of each place', async () => {
  const common={id:'shared_institution',name:'Institution',state:'catalog'};
  const sources={
    'brands_master.json':[common],
    'brands_by_place.json':{first:['shared_institution'],second:['shared_institution']},
    'actors_by_place.json':{
      first:[{...common,actor_role:'First place role',source_urls:['https://example.org/first']}],
      second:[{...common,actor_role:'Second place role',source_urls:['https://example.org/second']}]
    }
  };
  const window={};
  vm.runInNewContext(fs.readFileSync('js/brands/brands_loader.js','utf8'),{
    window,URL,document:{baseURI:'https://example.org/'},
    fetch:async url=>({ok:true,json:async()=>sources[new URL(url).pathname.split('/').pop()]})
  });
  await window.HGBrands.init();
  assert.equal(window.HGBrands.getByPlace('first')[0].actor_role,'First place role');
  assert.equal(window.HGBrands.getByPlace('second')[0].actor_role,'Second place role');
  assert.deepEqual(Array.from(window.HGBrands.getByPlace('second')[0].source_urls),['https://example.org/second']);
  assert.equal(window.HGBrands.getById(common.id).name,'Institution');
  assert.equal(window.HGBrands.getAll().length,1,'one shared identity, not duplicate brands');
});
