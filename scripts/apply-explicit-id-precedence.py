from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Runtime source after the main codemod has been applied.
runtime = ROOT / "js/knowledgeV2.ts"
text = runtime.read_text(encoding="utf-8")
old = '''function explicitIdList(value: unknown, ...keys: string[]): string[] {
  const row = toObject(value);
  return unique(keys.flatMap((key) => toArray(row[key])));
}

function normalizeSubjectId(value: unknown): string {'''
new = '''function explicitIdList(value: unknown, ...keys: string[]): string[] {
  const row = toObject(value);
  return unique(keys.flatMap((key) => toArray(row[key])));
}

function canonicalIdsForLabels(
  prefix: "co" | "term" | "story",
  subjectId: string,
  labels: string[],
  explicitIds: string[]
): string[] {
  const aligned = labels.map((label, index) => explicitIds[index] || generatedCanonicalId(prefix, subjectId, label));
  return unique([...aligned, ...explicitIds.slice(labels.length)]);
}

function normalizeSubjectId(value: unknown): string {'''
if text.count(old) != 1:
    raise RuntimeError(f"runtime helper anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''  const explicitConceptIds = explicitIdList(quizItem, "concept_ids", "conceptIds");
  const conceptIds = unique([explicitConceptIds, concepts.map((concept) => generatedCanonicalId("co", subjectId, concept))]);
  const explicitTermIds = explicitIdList(quizItem, "term_ids", "termIds");
  const termIds = unique([explicitTermIds, terms.map((term) => generatedCanonicalId("term", subjectId, term))]);
  const storyIds = unique([quizItem.story_ids, quizItem.storyIds]);'''
new = '''  const explicitConceptIds = explicitIdList(quizItem, "concept_ids", "conceptIds");
  const conceptIds = canonicalIdsForLabels("co", subjectId, concepts, explicitConceptIds);
  const explicitTermIds = explicitIdList(quizItem, "term_ids", "termIds");
  const termIds = canonicalIdsForLabels("term", subjectId, terms, explicitTermIds);
  const explicitStoryIds = explicitIdList(quizItem, "story_ids", "storyIds");
  const storyLabels = unique([quizItem.stories, quizItem.related_stories]);
  const storyIds = canonicalIdsForLabels("story", subjectId, storyLabels, explicitStoryIds);'''
if text.count(old) != 1:
    raise RuntimeError(f"runtime capture anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''      concept_ids: unique([explicitConceptIds, concepts.map((concept) => generatedCanonicalId("co", subjectId, concept))]),
      term_ids: unique([explicitTermIds, normalizeTerms(entry).map((term) => generatedCanonicalId("term", subjectId, term))]),
      story_ids: explicitStoryIds,'''
new = '''      concept_ids: canonicalIdsForLabels("co", subjectId, concepts, explicitConceptIds),
      term_ids: canonicalIdsForLabels("term", subjectId, normalizeTerms(entry), explicitTermIds),
      story_ids: canonicalIdsForLabels("story", subjectId, unique([entry.stories, entry.related_stories]), explicitStoryIds),'''
if text.count(old) != 1:
    raise RuntimeError(f"runtime stored-entry anchor count: {text.count(old)}")
text = text.replace(old, new, 1)
runtime.write_text(text, encoding="utf-8")

# Permanent canonical data pipeline.
pipeline = ROOT / "scripts/knowledge-canonical-data.mts"
text = pipeline.read_text(encoding="utf-8")
old = '''function stableId(prefix: 'ku' | 'co' | 'term' | 'story', subjectId: string, value: unknown): string {
  const readable = slug(value, prefix === 'ku' ? 24 : 36) || 'item';
  return `${prefix}_${slug(subjectId, 24) || 'unknown'}_${readable}_${digest(`${subjectId}\\0${normalize(value)}`, 10)}`;
}
function splitClaims'''
new = '''function stableId(prefix: 'ku' | 'co' | 'term' | 'story', subjectId: string, value: unknown): string {
  const readable = slug(value, prefix === 'ku' ? 24 : 36) || 'item';
  return `${prefix}_${slug(subjectId, 24) || 'unknown'}_${readable}_${digest(`${subjectId}\\0${normalize(value)}`, 10)}`;
}
function canonicalIdsForLabels(prefix: 'co' | 'term' | 'story', subject: string, labels: string[], explicitIds: string[]): string[] {
  const aligned = labels.map((label, index) => explicitIds[index] || stableId(prefix, subject, label));
  return unique([...aligned, ...explicitIds.slice(labels.length)]);
}
function splitClaims'''
if text.count(old) != 1:
    raise RuntimeError(f"pipeline helper anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''    const labels = conceptLabels(q);
    const existingCoIds = conceptIds(q);
    const generatedCoIds = labels.map((label) => stableId('co', subject, label));
    q.concept_ids = unique([existingCoIds, generatedCoIds]);
    generatedConceptIds += generatedCoIds.filter((id) => !existingCoIds.includes(id)).length;
    labels.forEach((label, index) => {
      const id = generatedCoIds[index];'''
new = '''    const labels = conceptLabels(q);
    const existingCoIds = conceptIds(q);
    const canonicalCoIds = canonicalIdsForLabels('co', subject, labels, existingCoIds);
    q.concept_ids = canonicalCoIds;
    generatedConceptIds += canonicalCoIds.filter((id) => !existingCoIds.includes(id)).length;
    labels.forEach((label, index) => {
      const id = canonicalCoIds[index];'''
if text.count(old) != 1:
    raise RuntimeError(f"pipeline concept anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''    const tLabels = termLabels(q);
    const existingTermIds = termIds(q);
    const generatedTIds = tLabels.map((label) => stableId('term', subject, label));
    q.term_ids = unique([existingTermIds, generatedTIds]);
    generatedTermIds += generatedTIds.filter((id) => !existingTermIds.includes(id)).length;
    tLabels.forEach((label, index) => {
      const id = generatedTIds[index];'''
new = '''    const tLabels = termLabels(q);
    const existingTermIds = termIds(q);
    const canonicalTermIds = canonicalIdsForLabels('term', subject, tLabels, existingTermIds);
    q.term_ids = canonicalTermIds;
    generatedTermIds += canonicalTermIds.filter((id) => !existingTermIds.includes(id)).length;
    tLabels.forEach((label, index) => {
      const id = canonicalTermIds[index];'''
if text.count(old) != 1:
    raise RuntimeError(f"pipeline term anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''    const sLabels = storyLabels(q);
    const existingStoryIds = storyIds(q);
    const generatedSIds = sLabels.map((label) => stableId('story', subject, label));
    if (existingStoryIds.length || generatedSIds.length) q.story_ids = unique([existingStoryIds, generatedSIds]);
    generatedStoryIds += generatedSIds.filter((id) => !existingStoryIds.includes(id)).length;
    sLabels.forEach((label, index) => {
      const id = generatedSIds[index];'''
new = '''    const sLabels = storyLabels(q);
    const existingStoryIds = storyIds(q);
    const canonicalStoryIds = canonicalIdsForLabels('story', subject, sLabels, existingStoryIds);
    if (canonicalStoryIds.length) q.story_ids = canonicalStoryIds;
    generatedStoryIds += canonicalStoryIds.filter((id) => !existingStoryIds.includes(id)).length;
    sLabels.forEach((label, index) => {
      const id = canonicalStoryIds[index];'''
if text.count(old) != 1:
    raise RuntimeError(f"pipeline story anchor count: {text.count(old)}")
text = text.replace(old, new, 1)
pipeline.write_text(text, encoding="utf-8")
print("explicit canonical IDs now take precedence over generated IDs")
