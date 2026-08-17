from pathlib import Path

p = Path("scripts/build-civication-scene-registry.mjs")
text = p.read_text(encoding="utf-8")

old_choices = '''function normalizeRuntimeChoices(choices) {
  return (Array.isArray(choices) ? choices : [])
    .filter((choice) => choice && typeof choice === "object")
    .map((choice, index) => ({
      ...choice,
      id: norm(choice.id) || String.fromCharCode(65 + index),
      label: norm(choice.label || choice.text || choice.id),
      effect: numberOr(choice.effect, 0),
      tags: uniqueStrings(choice.tags),
      feedback: norm(choice.feedback)
    }))
    .filter((choice) => choice.id && choice.label);
}
'''
new_choices = '''function normalizeCanonicalChoiceInputs(choices) {
  return (Array.isArray(choices) ? choices : [])
    .filter((choice) => choice && typeof choice === "object")
    .map((choice, index) => ({
      ...choice,
      id: norm(choice.id) || String.fromCharCode(65 + index),
      label: norm(choice.label || choice.text || choice.id),
      effect: numberOr(choice.effect, 0),
      tags: uniqueStrings(choice.tags),
      feedback: norm(choice.feedback)
    }))
    .filter((choice) => choice.id && choice.label);
}

function compatibilityChoiceInputs(choices) {
  // Keep the on-disk compatibility projection JSON-safe and source-faithful.
  // SceneCatalog applies its legacy normalizeChoices() after registry load, so
  // runtime-only values such as NaN are reproduced in memory instead of being
  // serialized as null. Array order and duplicate tags are deliberately kept.
  return (Array.isArray(choices) ? choices : [])
    .filter((choice) => choice && typeof choice === "object")
    .map((choice) => ({ ...choice }));
}
'''
if text.count(old_choices) != 1:
    raise SystemExit(f"compiler choice-normalization anchor count={text.count(old_choices)}")
text = text.replace(old_choices, new_choices, 1)

old_compile = '''  const runtimeChoices = normalizeRuntimeChoices(mail?.choices);
  const choices = canonicalChoices(runtimeChoices, sourcePath, sceneId);
  const taskContract = normalizeTaskContract(mail);
'''
new_compile = '''  const canonicalChoiceInputs = normalizeCanonicalChoiceInputs(mail?.choices);
  const compatibilityChoices = compatibilityChoiceInputs(mail?.choices);
  const choices = canonicalChoices(canonicalChoiceInputs, sourcePath, sceneId);
  const taskContract = normalizeTaskContract(mail);
'''
if text.count(old_compile) != 1:
    raise SystemExit(f"compiler compileMail choice anchor count={text.count(old_compile)}")
text = text.replace(old_compile, new_compile, 1)

old_projection = '''    choices: runtimeChoices,
'''
new_projection = '''    choices: compatibilityChoices,
'''
if text.count(old_projection) != 1:
    raise SystemExit(f"compiler compatibility projection choice anchor count={text.count(old_projection)}")
text = text.replace(old_projection, new_projection, 1)

old_order = '''  entries.sort((a, b) =>
    a.category.localeCompare(b.category, "en") ||
    a.role_scope.localeCompare(b.role_scope, "en") ||
    a.mail_type.localeCompare(b.mail_type, "en") ||
    a.id.localeCompare(b.id, "en")
  );
  shadowedDuplicates.sort((a, b) =>
    a.id.localeCompare(b.id, "en") || a.shadowed_source_path.localeCompare(b.shadowed_source_path, "en")
  );

  const roleIndex = {};
  for (const entry of entries) {
    const key = `${entry.category}/${entry.role_scope}`;
    if (!roleIndex[key]) roleIndex[key] = [];
    roleIndex[key].push(entry.id);
  }
  const sortedRoleIndex = Object.fromEntries(
    Object.entries(roleIndex)
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([key, ids]) => [key, [...ids].sort((a, b) => a.localeCompare(b, "en"))])
  );
'''
new_order = '''  // role_index is runtime-semantic: preserve source-rank, source-file and in-file mail order.
  // entries may still be canonically sorted for stable reviewable output after the index is captured.
  const roleIndex = {};
  for (const entry of entries) {
    const key = `${entry.category}/${entry.role_scope}`;
    if (!roleIndex[key]) roleIndex[key] = [];
    roleIndex[key].push(entry.id);
  }

  entries.sort((a, b) =>
    a.category.localeCompare(b.category, "en") ||
    a.role_scope.localeCompare(b.role_scope, "en") ||
    a.mail_type.localeCompare(b.mail_type, "en") ||
    a.id.localeCompare(b.id, "en")
  );
  shadowedDuplicates.sort((a, b) =>
    a.id.localeCompare(b.id, "en") || a.shadowed_source_path.localeCompare(b.shadowed_source_path, "en")
  );

  const sortedRoleIndex = Object.fromEntries(
    Object.entries(roleIndex)
      .sort(([a], [b]) => a.localeCompare(b, "en"))
  );
'''
if text.count(old_order) != 1:
    raise SystemExit(f"compiler role-index anchor count={text.count(old_order)}")
text = text.replace(old_order, new_order, 1)

p.write_text(text, encoding="utf-8")
print("Patched compiler with JSON-safe compatibility choices and legacy runtime role order")
