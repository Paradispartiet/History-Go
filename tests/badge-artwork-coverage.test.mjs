import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=(path)=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const categories=read('data/categories/category_contract.json').runtimeCategories;
const index=read('data/badges/index.json').files.map(path=>path.split('/').at(-1).replace('.json',''));
test('all 19 canonical badges have distinct, present SVG symbols',()=>{
  assert.equal(categories.length,19);
  assert.deepEqual(new Set(index),new Set(categories));
  for(const id of categories){
    const badge=read('data/badges/'+id+'.json');
    assert.equal(badge.id,id);
    assert.equal(badge.image,'bilder/merker/'+id+'.svg');
    assert.ok(existsSync(resolve(root,badge.image)),id+' lacks SVG');
    const svg=readFileSync(resolve(root,badge.image),'utf8');
    assert.ok(svg.includes('id="symbol-'+id+'"'),id+' lacks its own symbol');
    assert.match(svg,/<title id="title">/);
    assert.match(svg,/<desc id="desc">/);
    assert.match(svg,/<\/svg>\s*$/);
    assert.doesNotMatch(svg,/<script|<image\s|<foreignObject|xlink:href=/);
  }
});
