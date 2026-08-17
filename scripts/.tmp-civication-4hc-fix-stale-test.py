from pathlib import Path

path = Path('tests/civication-scene-interaction-contract.test.js')
text = path.read_text()
old = '''  sourceMode = "empty";
  const fallbackPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(fallbackPack.__legacy_fallback, true, "reelt tom canonical kilde kan fortsatt bruke eksisterende fallback i denne porten");
  assert.equal(legacyPackLoads, 1);
  assert.equal(legacyRoleLoads, 1);
'''
new = '''  sourceMode = "empty";
  const emptyPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(emptyPack.__legacy_fallback, false, "reelt tom canonical kilde skal være fail-closed etter 4H-C");
  assert.equal(emptyPack.__no_runtime_candidates, true);
  assert.equal(emptyPack.mails.length, 0);
  assert.equal(legacyPackLoads, 0);
  assert.equal(legacyRoleLoads, 0);
'''
count = text.count(old)
if count != 1:
    raise SystemExit(f'expected one stale scene-interaction fallback block, got {count}')
path.write_text(text.replace(old, new, 1))
