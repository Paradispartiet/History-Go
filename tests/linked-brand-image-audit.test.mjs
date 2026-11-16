import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { auditLinkedBrandAssets } from '../scripts/audit-linked-brand-images.mjs';

function withFixture(entries, fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'history-go-brand-images-'));
  fs.mkdirSync(path.join(root, 'data/brands'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/brands/brands_master.json'), JSON.stringify(entries));
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
const img = 'bilder/kort/brands/verified.svg';
const source = 'https://example.org/verified-historic-wordmark';

test('reports missing brands rather than inventing artwork', () => {
  withFixture([
    {id: 'x', name: 'Missing', place_ids: ['one']},
    {id: 'not-linked', name: 'Skip'},
    {id: 'y', name: 'Verified', place_ids: ['two'], logo: img,
      imageMeta: { sourcePage: source, license: 'CC BY-SA 4.0', reviewStatus: 'manually_approved' } }
  ], root => {
    const dst = path.join(root, img);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const result = auditLinkedBrandAssets(root);
    assert.equal(result.totalLinkedBrands, 2);
    assert.equal(result.withAnyImage, 1);
    assert.equal(result.missingImage, 1);
    assert.equal(result.invalidDeclaredAssets, 0);
    assert.deepEqual(result.missingImageQueue.map(x => x.id), ['x']);
  });
});

test('hard-fails unsafe, missing, or generated brandmark assets', () => {
  withFixture([
    {id:'unsafe', name:'Unsafe', place_ids:['x'], logo:'bilder/../../secret.svg'},
    {id:'gone', name:'Missing file', place_ids:['x'], logo:'bilder/kort/brands/removed.svg'},
    {id:'generated', name:'False logo', place_ids:['x'], logo:img,
      imageMeta: { generated: true, source: 'openai_imagegen' }}
  ], root => {
    fs.mkdirSync(path.join(root, 'bilder/kort/brands'), {recursive:true});
    fs.writeFileSync(path.join(root, img), '<svg/>');
    const result = auditLinkedBrandAssets(root);
    assert.equal(result.invalidDeclaredAssets, 3);
    assert.ok(result.hardFailures.some(x => x.issues.includes('unsafe_or_noncanonical_asset_path')));
    assert.ok(result.hardFailures.some(x => x.issues.includes('declared_asset_file_missing')));
    assert.ok(result.hardFailures.some(x => x.issues.includes('generated_brandmark_not_allowed')));
  });
});

test('declared logo requires source and reuse rights', () => {
  withFixture([
    {id:'no-rights', name:'Incomplete attribution', place_ids:['x'], logo:img,
      imageMeta:{sourcePage:source}},
    {id:'no-source', name:'Unidentified logo', place_ids:['x'], logo:img,
      imageMeta:{rightsBasis:'Permission granted'}}
  ], root => {
    fs.mkdirSync(path.join(root,'bilder/kort/brands'), {recursive:true});
    fs.writeFileSync(path.join(root,img), '<svg/>');
    const result=auditLinkedBrandAssets(root);
    assert.equal(result.invalidDeclaredAssets,2);
    assert.ok(result.hardFailures.some(x => x.issues.includes('rights_basis_missing')));
    assert.ok(result.hardFailures.some(x => x.issues.includes('source_page_missing')));
  });
});

test('image-only identities remain flagged for authentic-logo review', () => {
  withFixture([
    {id:'image-only', name:'Uses photograph', place_id:'p', image:img,
      imageMeta:{sourcePage:source, rightsBasis:'original-photo', assetKind:'documentary_facade_wordmark'}}
  ], root => {
    fs.mkdirSync(path.join(root,'bilder/kort/brands'), {recursive:true});
    fs.writeFileSync(path.join(root,img), '<svg/>');
    const result=auditLinkedBrandAssets(root);
    assert.equal(result.invalidDeclaredAssets,0);
    assert.ok(result.records[0].review.includes('asset_not_explicitly_declared_as_logo'));
    assert.ok(result.records[0].review.includes('manual_authenticity_review_pending'));
  });
});

test('the real linked-brand inventory has no dangling or generated declared assets', () => {
  const result = auditLinkedBrandAssets();
  assert.ok(result.totalLinkedBrands >= 90);
  assert.ok(result.withAnyImage > 0);
  assert.equal(result.invalidDeclaredAssets, 0, JSON.stringify(result.hardFailures, null, 2));
});
