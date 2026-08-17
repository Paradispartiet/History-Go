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

# The parity test must compare at the actual SceneCatalog runtime boundary.
# compatibility_projection is intentionally JSON-safe source input; the runtime
# applies normalizeChoices() after loading it from the compiled registry.
parity_path = Path("tests/civication-compiled-scene-registry-parity.test.js")
parity = parity_path.read_text(encoding="utf-8")
old_test_normalize = '''function normalizeChoices(choices) {
  return (Array.isArray(choices) ? choices : []).filter(Boolean).map((choice, index) => ({
    ...choice,
    id: norm(choice?.id) || String.fromCharCode(65 + index),
    label: norm(choice?.label || choice?.text || choice?.id),
    effect: Number(choice?.effect || 0),
    tags: Array.isArray(choice?.tags) ? choice.tags.map(norm).filter(Boolean) : [],
    feedback: norm(choice?.feedback)
  })).filter((choice) => choice.id && choice.label);
}
'''
new_test_normalize = '''function normalizeChoices(choices) {
  return (Array.isArray(choices) ? choices : []).filter(Boolean).map((choice) => ({
    ...choice,
    id: norm(choice?.id),
    label: norm(choice?.label),
    effect: Number(choice?.effect || 0),
    tags: Array.isArray(choice?.tags) ? choice.tags.map(norm).filter(Boolean) : [],
    feedback: norm(choice?.feedback)
  })).filter((choice) => choice.id && choice.label);
}
'''
if parity.count(old_test_normalize) != 1:
    raise SystemExit(f"parity normalizeChoices anchor count={parity.count(old_test_normalize)}")
parity = parity.replace(old_test_normalize, new_test_normalize, 1)

old_projection_compare = '''      return entry.compatibility_projection;
'''
new_projection_compare = '''      const projection = entry.compatibility_projection || {};
      return {
        ...projection,
        id: norm(projection.id || entry.id),
        category: norm(projection.category || entry.category),
        role_scope: norm(projection.role_scope || entry.role_scope),
        mail_type: norm(projection.mail_type || entry.mail_type || "job"),
        mail_family: norm(projection.mail_family),
        choices: normalizeChoices(projection.choices),
        situation: Array.isArray(projection.situation)
          ? projection.situation.map(norm).filter(Boolean)
          : [norm(projection.summary)].filter(Boolean),
        scene_catalog_source_path: norm(entry.source_path || projection.scene_catalog_source_path),
        scene_catalog_version: 1
      };
'''
if parity.count(old_projection_compare) != 1:
    raise SystemExit(f"parity projection boundary anchor count={parity.count(old_projection_compare)}")
parity = parity.replace(old_projection_compare, new_projection_compare, 1)
parity_path.write_text(parity, encoding="utf-8")

print("Patched compiler and parity test at the true legacy runtime boundary")
