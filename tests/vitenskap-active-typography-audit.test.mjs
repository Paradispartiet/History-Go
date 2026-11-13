import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const bytes = path => readFileSync(new URL('../' + path, import.meta.url));
const json = path => JSON.parse(bytes(path).toString('utf8'));
const active = json('data/badges/vitenskap.json');
const audit = json('data/badges/vitenskap_active_typography_audit_20261113.json');

test('all 16 currently active science underbadges have genuine unchanged image references', () => {
  assert.equal(active.id, 'vitenskap');
  assert.equal(audit.categoryId, 'vitenskap');
  assert.equal(audit.status, 'manual_visual_audit_unapproved_not_activating');
  assert.equal(audit.registeredCount, 16);
  assert.equal(audit.auditedCount, 16);
  assert.equal(audit.items.length, 16);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.deepEqual(new Set(audit.items.map(x => x.id)), new Set(active.sub));
  assert.equal(new Set(audit.items.map(x => x.id)).size, 16);
  assert.equal(audit.requiredMainTitle, 'VITENSKAP & TEKNOLOGI');
  for(const item of audit.items) {
    assert.equal(item.image, active.subBadgeImages[item.id]);
    assert.ok(item.image.startsWith('bilder/merker/vitenskap/brodert/'));
    assert.ok(item.label);
    assert.ok(item.notes);
    assert.ok(['high', 'review'].includes(item.priority));
    assert.ok(['missing', 'partial', 'complete'].includes(item.footerStatus));
    const data = bytes(item.image);
    assert.equal(data.toString('ascii',0,4),'RIFF');
    assert.equal(data.toString('ascii',8,12),'WEBP');
    assert.ok(data.length > 10000, item.image);
  }
});

test('exactly three original illustrations need full parent category text, not activation', () => {
  const flagged = audit.items.filter(x => x.priority === 'high');
  assert.deepEqual(new Set(flagged.map(x => x.id)), new Set([
    'teknologi_og_ingeniorfag',
    'data_programvare_og_algoritmer',
    'nettverk_og_digital_infrastruktur'
  ]));
  assert.equal(flagged.filter(x => x.footerStatus === 'partial').length, 2);
  assert.equal(flagged.filter(x => x.footerStatus === 'missing').length, 1);
  assert.ok(flagged.every(x => x.footerVisible !== audit.requiredMainTitle));
  assert.ok(audit.decision.includes('do not overwrite or autoactivate'));
});

test('review webpage is an authenticated read-only renderer with mobile-size and full-size views', () => {
  const page = bytes('vitenskap-aktive-merker-review.html').toString('utf8');
  assert.ok(page.includes('html:not(.hg-auth-verified) body'));
  assert.ok(page.includes('src="js/aha.js"'));
  assert.ok(page.includes('src="js/auth/require-login.js'));
  assert.ok(page.includes('data/badges/vitenskap.json'));
  assert.ok(page.includes('data/badges/vitenskap_active_typography_audit_20261113.json'));
  assert.ok(page.includes("item.priority === 'high'"));
  assert.ok(page.includes('catalog.subBadgeImages[item.id] !== item.image'));
  for(const size of [38,52,96,160,320]) assert.ok(page.includes('value="' + size + '"'));
  assert.ok(page.includes('<dialog'));
  const inline = page.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(inline, 'Missing renderer script');
  assert.doesNotThrow(() => new Script(inline[1], { filename: 'vitenskap-aktive-merker-review.html' }));
  assert.ok(Object.values(active.subBadgeImages).every(path => !path.includes('kandidater')));
});
