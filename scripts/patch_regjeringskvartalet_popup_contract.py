from pathlib import Path

path = Path('tests/regjeringskvartalet-ui-production-audit.test.mjs')
text = path.read_text(encoding='utf-8')
old = '    window.showPlacePopup = () => {};\n    window.PLACES = ${JSON.stringify([place])};'
new = '    window.showPlacePopup = () => {};\n    window.showPlacePopup.__hgPlacePopupV2 = true;\n    window.PLACES = ${JSON.stringify([place])};'
if text.count(old) != 1:
    raise SystemExit(f'Expected one popup fixture anchor, found {text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Regjeringskvartalet popup contract fixture: PASS')
