from pathlib import Path

path = Path(__file__).resolve().parents[1] / "scripts/knowledge-canonical-data.mts"
text = path.read_text(encoding="utf-8")
old = '''    const labels = conceptLabels(q);
    const existingCoIds = conceptIds(q);
    const generatedCoIds = labels.map((label) => stableId('co', subject, label));
    q.concept_ids = unique([existingCoIds, generatedCoIds]);'''
new = '''    const legacyConceptLabels = unique([q.concept_ids, q.conceptIds]).filter((id) => !ID_PATTERN.concept.test(id));
    if (legacyConceptLabels.length) q.concepts = unique([q.concepts, legacyConceptLabels]);
    const labels = conceptLabels(q);
    const existingCoIds = conceptIds(q);
    const generatedCoIds = labels.map((label) => stableId('co', subject, label));
    q.concept_ids = unique([existingCoIds, generatedCoIds]);'''
if text.count(old) != 1:
    raise RuntimeError(f"concept anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''    const tLabels = termLabels(q);
    const existingTermIds = termIds(q);
    const generatedTIds = tLabels.map((label) => stableId('term', subject, label));
    q.term_ids = unique([existingTermIds, generatedTIds]);'''
new = '''    const legacyTermLabels = unique([q.term_ids, q.termIds]).filter((id) => !ID_PATTERN.term.test(id));
    if (legacyTermLabels.length) q.terms = unique([q.terms, legacyTermLabels]);
    const tLabels = termLabels(q);
    const existingTermIds = termIds(q);
    const generatedTIds = tLabels.map((label) => stableId('term', subject, label));
    q.term_ids = unique([existingTermIds, generatedTIds]);'''
if text.count(old) != 1:
    raise RuntimeError(f"term anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''    const sLabels = storyLabels(q);
    const existingStoryIds = storyIds(q);
    const generatedSIds = sLabels.map((label) => stableId('story', subject, label));
    if (existingStoryIds.length || generatedSIds.length) q.story_ids = unique([existingStoryIds, generatedSIds]);'''
new = '''    const legacyStoryLabels = unique([q.story_ids, q.storyIds]).filter((id) => !ID_PATTERN.story.test(id));
    if (legacyStoryLabels.length) q.related_stories = unique([q.related_stories, legacyStoryLabels]);
    const sLabels = storyLabels(q);
    const existingStoryIds = storyIds(q);
    const generatedSIds = sLabels.map((label) => stableId('story', subject, label));
    if (existingStoryIds.length || generatedSIds.length) q.story_ids = unique([existingStoryIds, generatedSIds]);'''
if text.count(old) != 1:
    raise RuntimeError(f"story anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

path.write_text(text, encoding="utf-8")
print("legacy ID-field labels are preserved in explicit label fields")
