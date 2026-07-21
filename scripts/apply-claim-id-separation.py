from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "js/knowledgeClaimCore.ts"
text = path.read_text(encoding="utf-8")
old_concepts = '''  return unique([
    ...array(row.concepts),
    ...array(row.core_concepts),
    ...array(row.conceptIds),
    ...array(row.concept_ids),
    ...array(row.begreper)
  ]);'''
new_concepts = '''  return unique([
    ...array(row.concepts),
    ...array(row.core_concepts),
    ...array(row.begreper)
  ]);'''
old_terms = '''  return unique([
    ...array(row.terms),
    ...array(row.term_ids),
    ...array(row.terminology),
    ...array(row.terminologi),
    ...array(row.faguttrykk)
  ]);'''
new_terms = '''  return unique([
    ...array(row.terms),
    ...array(row.terminology),
    ...array(row.terminologi),
    ...array(row.faguttrykk)
  ]);'''
for old, new in ((old_concepts, new_concepts), (old_terms, new_terms)):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"knowledgeClaimCore.ts expected one anchor, found {count}")
    text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("claim labels and canonical IDs separated")
