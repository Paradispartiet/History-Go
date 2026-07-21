from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "scripts/knowledge-canonical-data.mts"
text = PATH.read_text(encoding="utf-8")


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected one anchor, found {count}: {old[:100]!r}")
    text = text.replace(old, new, 1)

replace_once(
    "const LEGACY_REPORT_PATH = path.join(ROOT, 'reports/knowledge-universe-readers.json');",
    "const LEGACY_REPORT_PATH = path.join(ROOT, 'reports/knowledge-universe-readers.json');\nconst REVIEW_QUEUE_PATH = path.join(KNOWLEDGE_ROOT, 'knowledge_emne_review_queue.generated.json');"
)
replace_once(
    "function conceptLabels(question: JsonObject): string[] {\n  return unique([question.concepts, question.core_concepts, question.concept_focus, question.begreper]);\n}",
    "function conceptLabels(question: JsonObject): string[] {\n  const legacyIdsAsLabels = unique([question.concept_ids, question.conceptIds]).filter((id) => !ID_PATTERN.concept.test(id));\n  return unique([question.concepts, question.core_concepts, question.concept_focus, question.begreper, legacyIdsAsLabels]);\n}"
)
replace_once(
    "function termLabels(question: JsonObject): string[] {\n  return unique([question.terms, question.terminology, question.terminologi, question.faguttrykk]);\n}",
    "function termLabels(question: JsonObject): string[] {\n  const legacyIdsAsLabels = unique([question.term_ids, question.termIds]).filter((id) => !ID_PATTERN.term.test(id));\n  return unique([question.terms, question.terminology, question.terminologi, question.faguttrykk, legacyIdsAsLabels]);\n}"
)
replace_once(
    "function storyLabels(question: JsonObject): string[] {\n  return unique([question.related_stories, question.stories]);\n}",
    "function storyLabels(question: JsonObject): string[] {\n  const legacyIdsAsLabels = unique([question.story_ids, question.storyIds]).filter((id) => !ID_PATTERN.story.test(id));\n  return unique([question.related_stories, question.stories, legacyIdsAsLabels]);\n}"
)
replace_once(
    "    if (!eids.length) unresolved.push({ file: row.file, location: row.location, question_id: questionId(q, row.file, row.location), subject_id: subject, target_id: targetId(q, row.root), reason: 'missing_emne_link', inference });",
    "    if (!eids.length) {\n      q.knowledge_link_status = 'editorial_review_required';\n      q.knowledge_link_evidence = { method: inference.method, confidence: inference.confidence, ...(inference.evidence || {}) };\n      unresolved.push({ file: row.file, location: row.location, question_id: questionId(q, row.file, row.location), subject_id: subject, target_id: targetId(q, row.root), reason: 'missing_emne_link', inference });\n    } else {\n      q.knowledge_link_status = 'linked';\n    }"
)
replace_once(
    "  await writeOrCheck(STORY_REGISTRY_PATH, { schema: 'history_go_story_registry_v1', version: 1, generated_by: 'scripts/knowledge-canonical-data.mts', stories: storyList }, changedFiles);\n  const report = {",
    "  await writeOrCheck(STORY_REGISTRY_PATH, { schema: 'history_go_story_registry_v1', version: 1, generated_by: 'scripts/knowledge-canonical-data.mts', stories: storyList }, changedFiles);\n  await writeOrCheck(REVIEW_QUEUE_PATH, { schema: 'history_go_knowledge_emne_review_queue_v1', version: 1, policy: 'Do not infer ambiguous emne links automatically.', items: unresolved }, changedFiles);\n  const report = {"
)
replace_once(
    "      if (!refs.emne_ids.length) errors.push('missing_emne_link');",
    "      if (!refs.emne_ids.length) {\n        if (clean(row.question.knowledge_link_status) === 'editorial_review_required') notes.push('editorial_emne_review_required');\n        else errors.push('missing_emne_link');\n      }"
)
replace_once(
    "      missing_concept_ids: warnings.length,",
    "      missing_concept_ids: warnings.filter((row) => row.warnings.includes('missing_concept_ids')).length,\n      editorial_emne_review_required: warnings.filter((row) => row.warnings.includes('editorial_emne_review_required')).length,"
)
replace_once(
    "  if (!legacy.ok) process.exitCode = 1;\n}",
    "  if (!legacy.ok || contract.questions_with_errors > 0) process.exitCode = 1;\n}"
)
PATH.write_text(text, encoding="utf-8")
print("canonical review queue patch applied")
