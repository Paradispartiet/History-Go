import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path,root),'utf8'));
const digest = (bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const appPath = 'bilder/merker/kunst/undermerker/tegning_og_grafikk-brodert-v2.webp';

test('Kunst: activate only approved Tegning og grafikk v2, preserve parent and nine other subbadges',()=>{
  const kunst = readJson('data/badges/kunst.json');
  const manifest = readJson('data/badges/kunst_tegning_og_grafikk_v2_candidate_20261117.json');
  assert.equal(kunst.id,'kunst');
  assert.equal(kunst.image,'bilder/merker/kunst-brodert.webp','parent badge remains unchanged');
  assert.equal(kunst.sub.length,10);
  assert.equal(kunst.sub[2],'tegning_og_grafikk');
  assert.deepEqual(kunst.subBadgeImages,{tegning_og_grafikk:appPath},'other nine subbadges are not activated');
  assert.equal(manifest.approval.visualApproved,true);
  assert.equal(manifest.design.upperLabel,'KUNST');
  assert.equal(manifest.design.upperLabelSize,'largest');
  assert.equal(manifest.design.lowerLabel,'TEGNING OG GRAFIKK');
  assert.equal(manifest.design.lowerLabelSize,'smaller');
  assert.equal(manifest.design.letterColor,'#FFFFFF');
  assert.match(manifest.design.border,/yellow.*not metallic gold/i);

  // Mandatory activation gate: never merge a pointing reference to missing binaries.
  assert.equal(manifest.quality.repositoryUploaded,true,'GitHub binary upload must be verified before activation');
  assert.equal(manifest.quality.repositoryHashVerified,true,'GitHub Git-blob SHA must be verified');
  assert.equal(manifest.quality.active,true,'manifest status must reflect live mapping');
  for(const [kind,expected] of Object.entries(manifest.images)){
    const bytes=readFileSync(new URL(expected.path,root));
    assert.equal(bytes.length,expected.bytes,kind+' exact byte count');
    assert.equal(digest(bytes),expected.sha256,kind+' SHA-256');
    const gitObject=Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes]);
    assert.equal(digest(gitObject,'sha1'),expected.gitBlobSha,kind+' Git object SHA-1');
    if(expected.format==='WebP'){
      assert.equal(bytes.toString('ascii',0,4),'RIFF',kind);
      assert.equal(bytes.readUInt32LE(4)+8,bytes.length,kind);
      assert.equal(bytes.toString('ascii',8,12),'WEBP',kind);
      assert.equal(bytes.toString('ascii',12,16),'VP8X',kind);
      assert.ok(bytes[20]&0x10,kind+' alpha');
      assert.equal(bytes.readUIntLE(24,3)+1,expected.width,kind);
      assert.equal(bytes.readUIntLE(27,3)+1,expected.height,kind);
    }else{
      assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',kind);
      assert.equal(bytes.readUInt32BE(16),expected.width,kind);
      assert.equal(bytes.readUInt32BE(20),expected.height,kind);
      assert.equal(bytes[25],6,kind+' RGBA');
    }
  }
});
