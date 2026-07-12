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
  await writeFile(path.join(dir,'data/people/folder/single.json'), JSON.stringify({id:'hopper',name:'Grace Hopper'}, null, 2));
  return dir;
}
function wikidataEntityResponse(qid, claims){ return new Response(JSON.stringify({ entities: { [qid]: { claims } } })); }
function humanClaim(){ return { mainsnak: { datavalue: { value: { id: 'Q5' } } } }; }
function p18Claim(file){ return { mainsnak: { datavalue: { value: file } } }; }
function candidate(overrides={}){ return { personId:'ada', personName:'Ada', sourceFile:'data/people/folder/array.json', personIndex:0, pointer:'/0', wikidataId:'Q1', commonsFileName:'Ada.jpg', originalImageUrl:'https://upload.wikimedia.org/wikipedia/commons/a/ada.jpg', commonsPage:'https://commons.wikimedia.org/wiki/File:Ada.jpg', creator:'Creator', credit:'Credit', license:'CC BY-SA 4.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/', width:10, height:10, approved:true, reason:'test', score:100, ...overrides }; }
async function withCwd(dir, fn){ const old=process.cwd(); process.chdir(dir); try { return await fn(); } finally { process.chdir(old); } }

{
  const dir = await fixture();
  await withCwd(dir, async()=>{
    const entries = await loadPeople();
    assert.equal(entries.length, 2);
    assert(entries.some(e=>e.person.id==='ada'));
    assert(entries.some(e=>e.person.id==='hopper'));
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


{
  const { buildCandidates } = await import('../dist/tools/people-image-pipeline.mjs');
  const dir = await fixture();
  await withCwd(dir, async()=>{
    await writeFile('data/people/folder/array.json', JSON.stringify({people:[{id:'ada',name:'Ada',wikidataId:'Q1'}]}, null, 2));
    await buildCandidates(['--ids=ada','--limit=1'], async (url) => {
      const u = String(url);
      if (u.includes('Q1.json')) return wikidataEntityResponse('Q1', { P31: [humanClaim()], P18: [p18Claim('Ada.jpg')] });
      if (u.includes('commons.wikimedia.org')) return new Response(JSON.stringify({ query: { pages: { 1: { imageinfo: [{ url:'https://upload.wikimedia.org/wikipedia/commons/a/ada.jpg', width:640, height:480, extmetadata: { LicenseShortName:{value:'CC BY-SA 4.0'}, License:{value:'<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>'}, Artist:{value:'Ada Artist'}, Credit:{value:'Ada Credit'} } }] } } } }));
      throw new Error(`unexpected url ${u}`);
    });
    const out = JSON.parse(await readFile('data/people/people_image_candidates.json','utf8'));
    assert.equal(out.length, 1);
    assert.equal(out[0].licenseUrl, 'https://creativecommons.org/licenses/by-sa/4.0/');
    assert.equal(out[0].width, 640);
    assert.equal(out[0].height, 480);
    assert.equal(out[0].commonsPage, 'https://commons.wikimedia.org/wiki/File:Ada.jpg');
  });
}

console.log('people image pipeline tests passed');

{
  const { fetchJsonWithRetry, buildCandidates } = await import('../dist/tools/people-image-pipeline.mjs');
  const delays = [];
  let calls = 0;
  const ok = await fetchJsonWithRetry('https://www.wikidata.org/test', async (url, init) => {
    calls++;
    assert.equal(init.headers['User-Agent'].startsWith('History-Go people-image-rights-pipeline/'), true);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  }, {}, { sleepMs: async ms => delays.push(ms) });
  assert.deepEqual(ok, { ok: true });
  assert.equal(calls, 1);

  calls = 0;
  const retried = await fetchJsonWithRetry('https://www.wikidata.org/retry', async () => {
    calls++;
    if (calls === 1) return new Response('{}', { status: 503 });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }, {}, { sleepMs: async ms => delays.push(ms) });
  assert.deepEqual(retried, { ok: true });
  assert.equal(calls, 2);

  calls = 0;
  await assert.rejects(() => fetchJsonWithRetry('https://commons.wikimedia.org/fail', async () => {
    calls++;
    return new Response('{}', { status: 503 });
  }, {}, { sleepMs: async ms => delays.push(ms) }), /after 3 attempts/);
  assert.equal(calls, 3);

  calls = 0;
  await assert.rejects(() => fetchJsonWithRetry('https://commons.wikimedia.org/timeout', async (_url, init) => {
    calls++;
    await new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason));
    });
    return new Response('{}');
  }, {}, { timeoutMs: 1, sleepMs: async ms => delays.push(ms) }), /timed out|after 3 attempts/);
  assert.equal(calls, 3);

  delays.length = 0;
  calls = 0;
  await fetchJsonWithRetry('https://www.wikidata.org/rate-limit', async () => {
    calls++;
    if (calls === 1) return new Response('{}', { status: 429, headers: { 'retry-after': '2' } });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }, {}, { sleepMs: async ms => delays.push(ms) });
  assert.equal(delays[0], 2000);

  const dir = await fixture();
  await withCwd(dir, async()=>{
    await writeFile('data/people/folder/array.json', JSON.stringify({people:[{id:'ada',name:'Ada'},{id:'grace',name:'Grace'}]}, null, 2));
    const callsByName = [];
    await buildCandidates(['--ids=ada,grace','--limit=10'], async (url) => {
      const u = String(url);
      if (u.includes('search=Ada')) { callsByName.push('ada'); throw new Error('temporary lookup failure'); }
      if (u.includes('search=Grace') && u.includes('language=en')) return new Response(JSON.stringify({ search: [{ id: 'Q1' }, { id: 'Q2' }] }));
      if (u.includes('search=Grace') && u.includes('language=nb')) return new Response(JSON.stringify({ search: [] }));
      if (u.includes('Q1.json')) return wikidataEntityResponse('Q1', { P31: [humanClaim()] });
      if (u.includes('Q2.json')) return wikidataEntityResponse('Q2', { P31: [humanClaim()], P18: [p18Claim('Grace.jpg')] });
      if (u.includes('commons.wikimedia.org')) return new Response(JSON.stringify({ query: { pages: { 1: { imageinfo: [{ url:'https://upload.wikimedia.org/wikipedia/commons/g/grace.jpg', width:10, height:10, extmetadata: { LicenseShortName:{value:'CC BY-SA 4.0'}, LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'}, Artist:{value:'Artist'}, Credit:{value:'Credit'} } }] } } } }));
      throw new Error(`unexpected url ${u}`);
    });
    const out = JSON.parse(await readFile('data/people/people_image_candidates.json','utf8'));
    assert.equal(out.length, 1);
    assert.equal(out[0].personId, 'grace');
  });
}

{
  const workflow = await readFile('.github/workflows/build-people-image-candidates.yml', 'utf8');
  const draftPrStep = workflow.slice(workflow.indexOf('- name: Open draft PR for candidate batch'));

  assert.match(draftPrStep, /if: \$\{\{ inputs\.open_draft_pr == true \}\}/, 'open_draft_pr false skips draft PR step');
  assert.match(draftPrStep, /branch="automation\/people-image-candidates-\$\{\{ github\.run_id \}\}"/, 'draft PR branch uses unique run ID');
  assert.match(draftPrStep, /git add "\$CANDIDATE_FILE"/, 'candidate file is staged explicitly');
  assert.match(draftPrStep, /git add -f "\$REPORT_DIR\/verification\.json" "\$REPORT_DIR\/verification\.md"/, 'ignored verification reports are force-staged explicitly');
  assert.match(draftPrStep, /grep -Ev "\^\(\$\{CANDIDATE_FILE\}\|\$\{REPORT_DIR\}\/verification\\\.\(json\|md\)\)\$"/, 'only candidate and verification files may be staged');
  assert.match(draftPrStep, /git diff --quiet -- "\$CANDIDATE_FILE"/, 'candidate file must change before committing');
  assert.match(draftPrStep, /git push --set-upstream origin HEAD/, 'push uses upstream and current HEAD');
  assert.doesNotMatch(draftPrStep, /git push\s+origin\s+main\b/, 'draft PR step never pushes to main');
  assert.match(draftPrStep, /gh pr create[\s\S]*--draft[\s\S]*--base main[\s\S]*--head "\$branch"/, 'PR is created as a draft against main from automation branch');
  assert.match(draftPrStep, /GH_TOKEN: \$\{\{ github\.token \}\}/, 'gh CLI uses github.token');
  assert.match(draftPrStep, /Allow GitHub Actions to create and approve pull requests/, 'permission failure explains required Actions setting');
}
