import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const files = [
  ['filmfestivaler', 'filmfestivaler-brodert-v2-kandidat.webp', 508544, 'ebb59193a4bb0c92ad0806f7d7a3a4c15a9ce2953107c5f1688b221e3266ca98'],
  ['filmlocations', 'filmlocations-brodert-v2-kandidat.webp', 523002, '7549f03819a8f5e67d6a9652471937b62f6c202b8ab14de895ddff13da686796'],
];
for (const [id, name, length, hash] of files) {
  test(id + ' v2 candidate has verified 1024px alpha WebP', () => {
    const path = new URL('../bilder/merker/film_tv/undermerker/' + name, import.meta.url);
    const b = readFileSync(path);
    assert.equal(b.length, length);
    assert.equal(b.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(b.subarray(8, 12).toString('ascii'), 'WEBP');
    assert.equal(b.subarray(12, 16).toString('ascii'), 'VP8X');
    assert.ok(b[20] & 0x10, 'alpha flag');
    assert.equal(b.readUIntLE(24, 3) + 1, 1024);
    assert.equal(b.readUIntLE(27, 3) + 1, 1024);
    assert.equal(createHash('sha256').update(b).digest('hex'), hash);
  });
}
test('published images now use reviewed circular v3 replacements', () => {
  const film = JSON.parse(readFileSync(new URL('../data/badges/film_tv.json', import.meta.url), 'utf8'));
  assert.equal(film.subBadgeImages.filmfestivaler, 'bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v3.webp');
  assert.equal(film.subBadgeImages.filmlocations, 'bilder/merker/film_tv/undermerker/filmlocations-brodert-v3.webp');
  assert.equal(Object.keys(film.subBadgeImages).length, 11);
});
