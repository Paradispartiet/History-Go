from pathlib import Path

path = Path('tools/build-vitenskap-editorial-v5.mjs')
text = path.read_text()
anchor = "\nconst methodsById = new Map(methods.map((m) => [m.method_id, m]));"
block = r'''

// Keyword classification is the first pass. Empty canonical families receive
// the strongest available method from a donor family with more than one member.
// This preserves every method ID while guaranteeing complete family coverage.
const methodFamilyCountsV5 = new Map(METHOD_FAMILIES.map((family) => [family.id, methods.filter((method) => method.method_family_id === family.id).length]));
for (const targetFamily of METHOD_FAMILIES.filter((family) => (methodFamilyCountsV5.get(family.id) || 0) === 0)) {
  const scoreForTarget = (method) => {
    const text = [method.method_id, method.title, method.description, ...arr(method.best_for_emne_kinds)].join(' ').toLowerCase();
    return targetFamily.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
  };
  const candidate = [...methods]
    .filter((method) => (methodFamilyCountsV5.get(method.method_family_id) || 0) > 1)
    .sort((a, b) => scoreForTarget(b) - scoreForTarget(a)
      || (methodFamilyCountsV5.get(b.method_family_id) || 0) - (methodFamilyCountsV5.get(a.method_family_id) || 0)
      || clean(a.method_id).localeCompare(clean(b.method_id)))[0];
  if (!candidate) throw new Error(`Could not assign an anchor method to family ${targetFamily.id}`);
  methodFamilyCountsV5.set(candidate.method_family_id, (methodFamilyCountsV5.get(candidate.method_family_id) || 0) - 1);
  Object.assign(candidate, methodOperationalFields(candidate, targetFamily));
  methodFamilyCountsV5.set(targetFamily.id, 1);
}
familyCoreId.clear();
for (const family of METHOD_FAMILIES) {
  const familyMethods = methods.filter((method) => method.method_family_id === family.id);
  if (!familyMethods.length) throw new Error(`Method family ${family.id} remains empty`);
  familyCoreId.set(family.id, familyMethods[0].method_id);
}
for (const method of methods) {
  method.method_role = familyCoreId.get(method.method_family_id) === method.method_id ? 'core' : 'specialized';
}
'''

if 'const methodFamilyCountsV5' not in text:
    if anchor not in text:
        raise SystemExit('Could not locate method post-processing anchor')
    text = text.replace(anchor, block + anchor)
path.write_text(text)
