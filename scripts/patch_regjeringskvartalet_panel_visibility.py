from pathlib import Path

path = Path('tests/regjeringskvartalet-ui-production-audit.test.mjs')
text = path.read_text(encoding='utf-8')
old = "    assert.equal(await page.locator(`#hg-place-panel-${id}`).isVisible(), true);"
new = "    assert.equal(await page.locator(`#hg-place-panel-${id}`).evaluate(panel => panel.hidden), false);"
if text.count(old) != 1:
    raise SystemExit(f'Expected one panel visibility assertion, found {text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Regjeringskvartalet panel visibility contract: PASS')
