import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const data = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const path = 'bilder/merker/film_tv/undermerker/film_og_tv_produksjon-brodert-v1.webp';
const sha256 = '3b0680272984508d700055361a53129d603514ce0ae65e08d47e6cc3a7938301';

test('Film- og TV-produksjon v1 has real alpha WebP and matching production manifest', () => {
  const film = data('data/badges/film_tv.json');
  const manifest = data('data/badges/underbadge_batch01_production.json');
  const asset = manifest.families.film_tv.assets.find(x => x.id === 'film_og_tv_produksjon');
  assert.equal(film.subBadgeImages.film_og_tv_produksjon, path);
  assert.equal(Object.keys(film.subBadgeImages).length, 12);
  assert.equal(manifest.status, 'seven_scenekunst_twelve_film_active_complete');
  assert.equal(asset.status, 'integrated');
  assert.equal(asset.selectedImage, path);
  assert.deepEqual(asset.quality, {visualApproved:true, technicalApproved:true});
  assert.equal(asset.productionBrief.topLabel, 'FILM- OG TV-PRODUKSJON');
  assert.equal(asset.productionBrief.bottomLabel, 'FILM & TV');
  const bytes = readFileSync(new URL('../'+path,import.meta.url));
  assert.equal(bytes.length, 472622);
  assert.equal(bytes.subarray(0,4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8,12).toString('ascii'), 'WEBP');
  assert.equal(bytes.subarray(12,16).toString('ascii'), 'VP8X');
  assert.ok((bytes[20] & 0x10) !== 0, 'alpha flag');
  assert.equal(bytes.readUIntLE(24,3)+1, 1024);
  assert.equal(bytes.readUIntLE(27,3)+1, 1024);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256);
  assert.equal(asset.sha256, sha256);
  assert.equal(asset.bytes, 472622);
});

test('nine earlier Film & TV and seven Scenekunst images remain active unchanged', () => {
  const film = data('data/badges/film_tv.json');
  const scene = data('data/badges/scenekunst.json');
  assert.deepEqual(film.subBadgeImages, {
    spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
    kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
    dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
    tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
    nyheter_og_reportasje:'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp',
    klassikere:'bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp',
    norsk_film_og_tv:'bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp',
    filmfestivaler:'bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v3.webp',
    filmlocations:'bilder/merker/film_tv/undermerker/filmlocations-brodert-v3.webp',
    film_og_tv_produksjon:path,
    arkiv_og_kanon:'bilder/merker/film_tv/undermerker/arkiv_og_kanon-brodert-v1.webp',
    visningssteder:'bilder/merker/film_tv/undermerker/visningssteder-brodert-v1.webp'
  });
  assert.equal(Object.keys(scene.subBadgeImages).length, 7);
  for(const id of scene.sub) assert.ok(scene.subBadgeImages[id]);
});
