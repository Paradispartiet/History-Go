from pathlib import Path

p = Path('scripts/.tmp-civication-4hb-cutover.py')
text = p.read_text(encoding='utf-8')

start = "test = replace_regex_once(\n    test,\n    r'  // To canonicale runtime-paths har i dagens datatre samme scene-ID.*?"
end = "    'compiler duplicate debt block'\n)"
i = text.find(start)
if i < 0:
    raise SystemExit('compiler duplicate replacement start not found')
j = text.find(end, i)
if j < 0:
    raise SystemExit('compiler duplicate replacement end not found')
j += len(end)
replacement = '''test = replace_once(
    test,
    ''' + repr('''  // To canonicale runtime-paths har i dagens datatre samme scene-ID og identisk\n  // routing-signatur. Runtime laster job-kilden først; compileren skal derfor\n  // beholde den første og inventere den senere kopien som eksplisitt gjeld.\n  const duplicateEntries = first.entries.filter((entry) => entry.id === duplicateSceneId);\n  assert.equal(duplicateEntries.length, 1);\n  assert.equal(duplicateEntries[0].source_path, keptDuplicateSource);\n  const duplicateDebt = first.shadowed_duplicates.find((entry) => entry.id === duplicateSceneId);\n  assert(duplicateDebt, "kjent route-ekvivalent duplicate skal inventeres");\n  assert.equal(duplicateDebt.kept_source_path, keptDuplicateSource);\n  assert.equal(duplicateDebt.shadowed_source_path, shadowedDuplicateSource);\n  assert(duplicateDebt.kept_source_rank < duplicateDebt.shadowed_source_rank);\n  assert.match(duplicateDebt.routing_signature, /^[a-f0-9]{64}$/);\n''') + ''',
    ''' + repr('''  // 4H-B fjerner den eneste runtime-reachable skyggekopien uten å endre vinnerscenen.\n  assert.equal(first.stats.shadowed_duplicate_count, 0, "4H-B krever null shadowed duplicate-gjeld");\n  assert.deepEqual(first.shadowed_duplicates, []);\n  assert.equal(first.entries.filter((entry) => entry.id === duplicateSceneId).length, 1);\n''') + ''',
    'compiler duplicate debt block'
)'''
text = text[:i] + replacement + text[j:]

old_ci = ("    '      - name: Run Civication tests\\n        run: node tests/run-civication-tests.mjs\\n',\n"
          "    '      - name: Verify compiled scene registry is synchronized\\n        run: node scripts/build-civication-scene-registry.mjs --check\\n      - name: Run Civication tests\\n        run: node tests/run-civication-tests.mjs\\n',\n")
new_ci = ("    '      - name: Run complete Civication suite\\n        run: npm run test:civication\\n',\n"
          "    '      - name: Verify compiled scene registry is synchronized\\n        run: node scripts/build-civication-scene-registry.mjs --check\\n      - name: Run complete Civication suite\\n        run: npm run test:civication\\n',\n")
count = text.count(old_ci)
if count != 1:
    raise SystemExit(f'CI registry replacement anchor: expected one source block, found {count}')
text = text.replace(old_ci, new_ci, 1)

role_replacements = {
    'offentlig/renholder': ('naeringsliv/administrasjonsmedarbeider', 3),
    'by/arealplanlegger_plan': ('by/by_radgiver_plan', 1),
}
for stale_role, (replacement_role, expected_count) in role_replacements.items():
    role_count = text.count(stale_role)
    if role_count != expected_count:
        raise SystemExit(f'{stale_role} fixture anchor: expected {expected_count} occurrences, found {role_count}')
    text = text.replace(stale_role, replacement_role)

old_terminal = '''  const terminalRuntime = makeRuntimeContext({ roleKey:"naeringsliv/administrasjonsmedarbeider", legacyMails: legacyByRole.get("naeringsliv/administrasjonsmedarbeider"), registry: materialized, mode:"compiled", terminal:true });
  const terminalDay = await terminalRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(
    terminalRuntime.active, {}, makeBaseRuntime("2026-08-18"), { selection_snapshot: { terminal_closed:true } }
  );
  assert.equal(terminalDay.daily_extra_terminal_closed, true);
  assert.equal(terminalDay.daily_extra_catalog_count, 0);
  assert.equal(workdayProjection(terminalDay).rows.length, 0, "terminal karriere skal ikke åpne arbeidsfallback");
  const terminalPack = await new terminalRuntime.windowObject.CivicationEventEngine().buildMailPool(terminalRuntime.active, {}, "renholder");
  assert.equal(terminalPack.__legacy_fallback, false, "terminal karriere skal ikke åpne EventEngine legacy-fallback");
  assert.equal(terminalPack.__terminal_closed, true);
'''
new_terminal = '''  const terminalRuntime = makeRuntimeContext({ roleKey:"naeringsliv/administrasjonsmedarbeider", legacyMails: legacyByRole.get("naeringsliv/administrasjonsmedarbeider"), registry: materialized, mode:"compiled", terminal:true });
  const terminalCandidates = await terminalRuntime.windowObject.CivicationSceneDirector.getWorkCandidates(terminalRuntime.active, {});
  assert.equal(terminalCandidates.__career_outcome_terminal_closed, true, "terminal source selection skal eie terminal snapshot");
  const terminalDay = await terminalRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(
    terminalRuntime.active, {}, makeBaseRuntime("2026-08-18")
  );
  assert.equal(terminalDay.daily_extra_terminal_closed, true);
  assert.equal(terminalDay.daily_extra_catalog_count, 0);
  assert.equal(workdayProjection(terminalDay).rows.length, 0, "terminal karriere skal ikke åpne arbeidsfallback");
  const terminalPack = await new terminalRuntime.windowObject.CivicationEventEngine().buildMailPool(terminalRuntime.active, {}, "administrasjonsmedarbeider");
  assert.equal(terminalPack.__legacy_fallback, false, "terminal karriere skal ikke åpne EventEngine legacy-fallback");
  assert.equal(terminalPack.__terminal_closed, true);
'''
if text.count(old_terminal) != 1:
    raise SystemExit(f'terminal parity fixture anchor: expected 1 occurrence, found {text.count(old_terminal)}')
text = text.replace(old_terminal, new_terminal, 1)

p.write_text(text, encoding='utf-8')

# 4G deliberately prohibited a compiled registry because that phase only introduced
# dynamic source adapters. 4H-B is the explicit compiled work-scene cutover, so those
# same regression tests must now prove that the adapters coexist with the compiled owner.
adapter_expectations = {
    'tests/civication-scene-source-adapter-life.test.js': [
        ('assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-B skal ikke smuginnføre compiled registry");',
         'assert.equal(catalog.inspect().compiled_registry_ready, true, "4H-B skal eksponere compiled registry uten å endre Life-adaptereierskap");')
    ],
    'tests/civication-scene-source-adapter-narrative.test.js': [
        ('assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-C skal ikke smuginnføre compiled registry");',
         'assert.equal(catalog.inspect().compiled_registry_ready, true, "4H-B skal eksponere compiled registry uten å endre narrative-adaptereierskap");')
    ],
    'tests/civication-scene-source-adapter-private.test.js': [
        ('assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-A skal ikke smuginnføre compiled registry");',
         'assert.equal(catalog.inspect().compiled_registry_ready, true, "4H-B skal eksponere compiled registry uten å endre private-adaptereierskap");')
    ],
    'tests/civication-scene-source-adapter-social.test.js': [
        ('assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-D skal ikke smuginnføre compiled registry");',
         'assert.equal(catalog.inspect().compiled_registry_ready, true, "4H-B skal eksponere compiled registry uten å endre social-adaptereierskap");'),
        ('assert.equal(inspection.compiled_registry_ready, false);',
         'assert.equal(inspection.compiled_registry_ready, true);')
    ],
}
for rel, replacements in adapter_expectations.items():
    test_path = Path(rel)
    test_text = test_path.read_text(encoding='utf-8')
    for old, new in replacements:
        count = test_text.count(old)
        if count != 1:
            raise SystemExit(f'{rel}: expected one 4G compiled-registry gate, found {count}')
        test_text = test_text.replace(old, new, 1)
    test_path.write_text(test_text, encoding='utf-8')

print('Repaired one-shot 4H-B anchors, role fixtures, terminal parity flow and 4G adapter gates')
