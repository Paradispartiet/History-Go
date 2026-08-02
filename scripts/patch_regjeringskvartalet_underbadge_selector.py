from pathlib import Path

path = Path('tests/regjeringskvartalet-ui-production-audit.test.mjs')
text = path.read_text(encoding='utf-8')
old = "  assert.equal(await fagverk.locator('#fagverkPlaceUnderbadges a').count(), 3);"
new = "  await fagverk.waitForSelector('#fagverkPlaceBadgePath .fagverk-canonical-underbadges a');\n  assert.equal(await fagverk.locator('#fagverkPlaceBadgePath .fagverk-canonical-underbadges a').count(), 3);"
if text.count(old) != 1:
    raise SystemExit(f'Expected one underbadge selector assertion, found {text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Regjeringskvartalet canonical underbadge selector: PASS')
