import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { isAllowedLicense, loadPeople, applyCandidates } from '../dist/tools/people-image-pipeline.mjs';

assert.equal(isAllowedLicense('Public Domain'), true);
assert.equal(isAllowedLicense('CC0'), true);
assert.equal(isAllowedLicense('CC BY 4.0'), true);
assert.equal(isAllowedLicense('CC BY-SA 4.0'), true);
assert.equal(isAllowedLicense('CC BY-NC 4.0'), false);
assert.equal(isAllowedLicense('CC BY-ND 4.0'), false);
assert.equal(isAllowedLicense('all rights reserved'), false);
assert.equal(isAllowedLicense(''), false);

async function missing(p){ try { await access(p); return false; } catch { return true; } }
async function fixture(){
  const dir = await mkdtemp(path.join(tmpdir(), 'people-img-'));
  await mkdir(path.join(dir,'data/people/folder'), {recursive:true});
  await mkdir(path.join(dir,'bilder/kort/people'), {recursive:true});
  await writeFile(path.join(dir,'data/people/manifest.json'), JSON.stringify({files:['people/folder/array.json','people/folder/single.json']}, null, 2));
  await writeFile(path.join(dir,'data/people/folder/array.json'), JSON.stringify({people:[{id:'ada',name:'Ada',extra:'keep'}]}, null, 2));
  await writeFile(path.join(dir,'data/people/folder/single.json'), JSON.stringify({id:'grace',name:'Grace'}, null, 2));
  return dir;
}
function candidate(overrides={}){ return { personId:'ada', personName:'Ada', sourceFile:'data/people/folder/array.json', personIndex:0, pointer:'/0', wikidataId:'Q1', commonsFileName:'Ada.jpg', originalImageUrl:'https://upload.wikimedia.org/wikipedia/commons/a/ada.jpg', commonsPage:'https://commons.wikimedia.org/wiki/File:Ada.jpg', creator:'Creator', credit:'Credit', license:'CC BY-SA 4.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/', width:10, height:10, approved:true, reason:'test', score:100, ...overrides }; }
async function withCwd(dir, fn){ const old=process.cwd(); process.chdir(dir); try { return await fn(); } finally { process.chdir(old); } }

{
  const dir = await fixture();
  await withCwd(dir, async()=>{
    const entries = await loadPeople();
    assert.equal(entries.length, 2);
    assert(entries.some(e=>e.person.id==='ada'));
    assert(entries.some(e=>e.person.id==='grace'));
    await writeFile('data/people/people_image_candidates.json', JSON.stringify([candidate()], null, 2));
    await applyCandidates([]);
    const after = await readFile('data/people/folder/array.json','utf8');
    assert(!after.includes('imageMeta'), 'dry-run writes nothing');
  });
}

for (const bad of [
  {approved:false},
  {license:'CC BY-NC 4.0'},
  {originalImageUrl:'https://example.com/a.jpg'},
  {sourceFile:'data/people/folder/missing.json'},
  {personId:'missing'}
]) {
  const dir = await fixture();
  await withCwd(dir, async()=>{
    await writeFile('data/people/people_image_candidates.json', JSON.stringify([candidate(bad)], null, 2));
    await assert.rejects(() => applyCandidates(['--write'], async()=>{ throw new Error('fetch should not be reached'); }));
  });
}

{
  const dir = await fixture();
  await withCwd(dir, async()=>{
    await writeFile('data/people/people_image_candidates.json', JSON.stringify([candidate()], null, 2));
    const body = new ReadableStream({ start(c){ c.enqueue(new Uint8Array([1,2,3])); c.close(); } });
    await applyCandidates(['--write'], async()=>new Response(body, {headers:{'content-type':'image/jpeg'}}));
    const data = JSON.parse(await readFile('data/people/folder/array.json','utf8'));
    assert.equal(data.people[0].extra, 'keep');
    assert.equal(data.people[0].image, 'bilder/kort/people/ada.jpg');
    const attr1 = await readFile('data/people/people_image_attributions.json','utf8');
    const attr2 = await readFile('data/people/people_image_attributions.json','utf8');
    assert.equal(attr1, attr2, 'attributions deterministic');
    assert.equal(await missing('bilder/kort/people/ada.tmp'), true);
  });
}
console.log('people image pipeline tests passed');
