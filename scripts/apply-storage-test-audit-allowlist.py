from pathlib import Path

path = Path(__file__).resolve().parents[1] / "scripts/knowledge-canonical-data.mts"
text = path.read_text(encoding="utf-8")
old = '''    'tests/knowledge-v2-model.test.js',
    'tests/knowledge-profile-memory-integration.test.js',
    'scripts/knowledge-canonical-data.mts','''
new = '''    'tests/knowledge-v2-model.test.js',
    'tests/knowledge-profile-memory-integration.test.js',
    'tests/knowledge-canonical-storage-contract.test.js',
    'scripts/knowledge-canonical-data.mts','''
count = text.count(old)
if count != 1:
    raise RuntimeError(f"expected one audit allowlist anchor, found {count}")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("canonical storage contract test added to legacy audit allowlist")
