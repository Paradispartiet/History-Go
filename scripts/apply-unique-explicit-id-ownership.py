from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

runtime = ROOT / "js/knowledgeV2.ts"
text = runtime.read_text(encoding="utf-8")
old = '''function canonicalIdsForLabels(
  prefix: "co" | "term" | "story",
  subjectId: string,
  labels: string[],
  explicitIds: string[]
): string[] {
  const aligned = labels.map((label, index) => explicitIds[index] || generatedCanonicalId(prefix, subjectId, label));
  return unique([...aligned, ...explicitIds.slice(labels.length)]);
}'''
new = '''function canonicalIdsForLabels(
  prefix: "co" | "term" | "story",
  subjectId: string,
  labels: string[],
  explicitIds: string[]
): string[] {
  const used = new Set<string>();
  const aligned = labels.map((label, index) => {
    const explicitId = explicitIds[index];
    const generatedId = generatedCanonicalId(prefix, subjectId, label);
    const id = explicitId && !used.has(explicitId) ? explicitId : generatedId;
    used.add(id);
    return id;
  });
  const extras = explicitIds.slice(labels.length).filter((id) => {
    if (!id || used.has(id)) return false;
    used.add(id);
    return true;
  });
  return [...aligned, ...extras];
}'''
if text.count(old) != 1:
    raise RuntimeError(f"runtime canonical ID helper anchor count: {text.count(old)}")
runtime.write_text(text.replace(old, new, 1), encoding="utf-8")

pipeline = ROOT / "scripts/knowledge-canonical-data.mts"
text = pipeline.read_text(encoding="utf-8")
old = '''function canonicalIdsForLabels(prefix: 'co' | 'term' | 'story', subject: string, labels: string[], explicitIds: string[]): string[] {
  const aligned = labels.map((label, index) => explicitIds[index] || stableId(prefix, subject, label));
  return unique([...aligned, ...explicitIds.slice(labels.length)]);
}'''
new = '''function canonicalIdsForLabels(prefix: 'co' | 'term' | 'story', subject: string, labels: string[], explicitIds: string[]): string[] {
  const used = new Set<string>();
  const aligned = labels.map((label, index) => {
    const explicitId = explicitIds[index];
    const generatedId = stableId(prefix, subject, label);
    const id = explicitId && !used.has(explicitId) ? explicitId : generatedId;
    used.add(id);
    return id;
  });
  const extras = explicitIds.slice(labels.length).filter((id) => {
    if (!id || used.has(id)) return false;
    used.add(id);
    return true;
  });
  return [...aligned, ...extras];
}'''
if text.count(old) != 1:
    raise RuntimeError(f"pipeline canonical ID helper anchor count: {text.count(old)}")
pipeline.write_text(text.replace(old, new, 1), encoding="utf-8")
print("explicit canonical IDs now have unique label ownership")
