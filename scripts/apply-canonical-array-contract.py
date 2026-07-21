from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

core = ROOT / "js/knowledgeClaimCore.ts"
text = core.read_text(encoding="utf-8")
old = '''function unique(values: unknown[]): string[] {
  return Array.from(new Set(values.map(text).filter(Boolean)));
}'''
new = '''function flattenValues(values: unknown[]): unknown[] {
  return values.flatMap((value) => Array.isArray(value) ? flattenValues(value) : [value]);
}

function unique(values: unknown[]): string[] {
  return Array.from(new Set(flattenValues(values).map(text).filter(Boolean)));
}'''
if text.count(old) != 1:
    raise RuntimeError(f"knowledgeClaimCore unique anchor count: {text.count(old)}")
core.write_text(text.replace(old, new, 1), encoding="utf-8")

test_file = ROOT / "tests/quiz-knowledge-memory.test.js"
test_text = test_file.read_text(encoding="utf-8")
old_test = '''      core_concepts: ["offentlig institusjon"],
      term_ids: ["hovedbibliotek"],
      tags: ["oslo"]'''
new_test = '''      core_concepts: ["offentlig institusjon"],
      terminology: ["hovedbibliotek"],
      term_ids: ["term_by_hovedbibliotek_test"],
      tags: ["oslo"]'''
if test_text.count(old_test) != 1:
    raise RuntimeError(f"quiz memory term contract anchor count: {test_text.count(old_test)}")
test_file.write_text(test_text.replace(old_test, new_test, 1), encoding="utf-8")
print("canonical array and term label contracts fixed")
