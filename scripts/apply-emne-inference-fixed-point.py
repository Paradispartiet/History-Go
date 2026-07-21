from pathlib import Path

path = Path(__file__).resolve().parents[1] / "scripts/knowledge-canonical-data.mts"
text = path.read_text(encoding="utf-8")


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected one anchor, found {count}: {old[:120]!r}")
    text = text.replace(old, new, 1)

old_seed = '''  const targetExplicit = new Map<string, Set<string>>();
  const setExplicit = new Map<string, Set<string>>();
  for (const row of rows) {
    const ids = emneIds(row.question);
    if (!ids.length) continue;
    const subject = subjectId(row.question, row.root);
    const target = targetId(row.question, row.root);
    if (subject && target) {
      const key = `${subject}::${target}`;
      if (!targetExplicit.has(key)) targetExplicit.set(key, new Set());
      ids.forEach((id) => targetExplicit.get(key)!.add(id));
    }
    if (row.set) {
      const key = `${row.file}::${clean(row.set.set_id)}`;
      if (!setExplicit.has(key)) setExplicit.set(key, new Set());
      ids.forEach((id) => setExplicit.get(key)!.add(id));
    }
  }

  const units = new Map<string, JsonObject>();'''
new_seed = '''  const targetExplicit = new Map<string, Set<string>>();
  const setExplicit = new Map<string, Set<string>>();
  const addInferenceSignals = (row: QuestionRow, ids: string[]): void => {
    const subject = subjectId(row.question, row.root);
    const target = targetId(row.question, row.root);
    if (subject && target) {
      const key = `${subject}::${target}`;
      if (!targetExplicit.has(key)) targetExplicit.set(key, new Set());
      ids.forEach((id) => targetExplicit.get(key)!.add(id));
    }
    if (row.set) {
      const key = `${row.file}::${clean(row.set.set_id)}`;
      if (!setExplicit.has(key)) setExplicit.set(key, new Set());
      ids.forEach((id) => setExplicit.get(key)!.add(id));
    }
  };
  rows.forEach((row) => {
    const ids = emneIds(row.question);
    if (ids.length) addInferenceSignals(row, ids);
  });

  const plannedInference = new Map<QuestionRow, Inference>();
  for (let iteration = 0; iteration < rows.length; iteration += 1) {
    const additions = rows
      .filter((row) => knowledgeText(row.question))
      .filter((row) => !emneIds(row.question).length && !plannedInference.has(row))
      .map((row) => ({ row, inference: inferEmne(row, targetExplicit, setExplicit, catalogs) }))
      .filter((candidate) => candidate.inference.ids.length)
      .sort((a, b) => a.row.file.localeCompare(b.row.file, 'en') || a.row.location.localeCompare(b.row.location, 'en'));
    if (!additions.length) break;
    additions.forEach(({ row, inference }) => {
      plannedInference.set(row, inference);
      addInferenceSignals(row, inference.ids);
    });
  }

  const units = new Map<string, JsonObject>();'''
replace_once(old_seed, new_seed)

old_inference = '''    const claims = splitClaims(text);
    const effectiveClaims = claims.length ? claims : [text];
    const inference = inferEmne(row, targetExplicit, setExplicit, catalogs);
    const eids = inference.ids;
    if (!emneIds(q).length && eids.length) {
      q.emne_ids = eids;
      q.knowledge_link_evidence = { method: inference.method, confidence: inference.confidence, ...(inference.evidence || {}) };
      inferredEmneLinks += 1;
    }
'''
new_inference = '''    const claims = splitClaims(text);
    const effectiveClaims = claims.length ? claims : [text];
    const existingEmneIds = emneIds(q);
    const inference = existingEmneIds.length
      ? { ids: existingEmneIds, method: 'explicit', confidence: 1 }
      : (plannedInference.get(row) || inferEmne(row, targetExplicit, setExplicit, catalogs));
    const eids = inference.ids;
    if (!existingEmneIds.length && eids.length) {
      q.emne_ids = eids;
      q.knowledge_link_evidence = { method: inference.method, confidence: inference.confidence, ...(inference.evidence || {}) };
    }
    const linkMethod = clean(q.knowledge_link_evidence?.method || inference.method);
    if (eids.length && linkMethod && linkMethod !== 'explicit') inferredEmneLinks += 1;
'''
replace_once(old_inference, new_inference)

replace_once(
    '''    questions_changed: questionsChanged,
    canonical_units: unitList.length,''',
    '''    questions_with_canonical_contract: rows.filter((row) => knowledgeText(row.question) && Number(row.question.knowledge_contract_version) === 1).length,
    canonical_units: unitList.length,'''
)
replace_once(
    '''    generated_ids: { knowledge: generatedKnowledgeIds, concepts: generatedConceptIds, terms: generatedTermIds, stories: generatedStoryIds },
    unresolved,''',
    '''    canonical_id_counts: { knowledge: unitList.length, concepts: conceptList.length, terms: termList.length, stories: storyList.length },
    unresolved,'''
)

path.write_text(text, encoding="utf-8")
print("emne inference now reaches a deterministic fixed point in one run")
