import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const content = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const v6 = JSON.parse(content('data/badges/vitenskap_v6_typography_candidates_20261113.json'));
const active = JSON.parse(content('data/badges/vitenskap.json'));

test('v6 interactive review compares source v5 and new v6 at PlaceCard dimensions', () => {
  const html = content('vitenskap-v6-review.html');
  assert.match(html, /Vitenskap &amp; teknologi – v6-gjennomgang/);
  assert.ok(html.includes('html:not(.hg-auth-verified) body'));
  assert.ok(html.includes('src="js/aha.js"'));
  assert.ok(html.includes('src="js/auth/require-login.js'));
  assert.ok(html.includes('vitenskap_v6_typography_candidates_20261113.json'));
  assert.ok(html.includes("figure(row.source, 'Oversatt v5'"));
  assert.ok(html.includes("figure(row.path, 'Oversatt v6'"));
  for (const px of [38, 52, 96, 160, 320]) assert.ok(html.includes('value="' + px + '"'));
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, 'review page must contain static frontend');
  assert.doesNotThrow(() => new Script(script[1], {filename:'vitenskap-v6-review.html'}));
  assert.equal(v6.items.length, 16);
  assert.equal(v6.visualSignoffRequired, true);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.ok(Object.values(active.subBadgeImages).every(x => !x.includes('-v6-')));
});
