from pathlib import Path

# 1) Compile brand-specific catalogs into the canonical registry in the same
# position where legacy MailRuntime appended them: after generic job/extra files.
compiler = Path('scripts/build-civication-scene-registry.mjs')
source = compiler.read_text()
old = '''  if (normalizedPath === `${SOURCE_ROOT}/${category}/job/${roleScope}_intro_v2.json`) return 0;
  if (normalizedPath === `${SOURCE_ROOT}/${category}/job/${roleScope}_job.json`) return 1;
  if (!EXTRA_MAIL_TYPE_SET.has(mailType)) return null;
  const extraIndex = EXTRA_MAIL_TYPES.indexOf(mailType);
  const canonical = `${SOURCE_ROOT}/${category}/${mailType}/${roleScope}_${mailType}.json`;
  return normalizedPath === canonical ? 2 + extraIndex : null;
'''
new = '''  if (normalizedPath === `${SOURCE_ROOT}/${category}/job/${roleScope}_intro_v2.json`) return 0;
  if (normalizedPath === `${SOURCE_ROOT}/${category}/job/${roleScope}_job.json`) return 1;
  if (EXTRA_MAIL_TYPE_SET.has(mailType)) {
    const extraIndex = EXTRA_MAIL_TYPES.indexOf(mailType);
    const canonical = `${SOURCE_ROOT}/${category}/${mailType}/${roleScope}_${mailType}.json`;
    if (normalizedPath === canonical) return 2 + extraIndex;
  }
  const brandId = norm(catalog?.brand_id).toLowerCase();
  if (brandId && normalizedPath === `${SOURCE_ROOT}/${category}/brand/${roleScope}_${brandId}.json`) {
    return 2 + EXTRA_MAIL_TYPES.length;
  }
  return null;
'''
if old not in source:
    raise SystemExit('compiler runtimeSourceRank block not found')
compiler.write_text(source.replace(old, new, 1))

# 2) Preserve legacy brand isolation after the brand files become compiled.
builder = Path('js/Civication/systems/civicationWorkdayMailBuilder.js')
source = builder.read_text()
old = '''      const mails = (await decorateMails(flattened)).map(decorateSceneInteraction);
      catalogTrace.push({
'''
new = '''      const activeBrandId = slugify(active?.brand_id || "");
      const brandFiltered = flattened.filter((mail) => {
        const mailBrandId = slugify(mail?.brand_id || "");
        if (!mailBrandId) return true;
        return !!activeBrandId && mailBrandId === activeBrandId;
      });
      const mails = (await decorateMails(brandFiltered)).map(decorateSceneInteraction);
      catalogTrace.push({
'''
if old not in source:
    raise SystemExit('SceneCatalog compiled mail decoration block not found')
builder.write_text(source.replace(old, new, 1))

# 3) Move legacy integration harnesses that exercise MailRuntime candidate selection
# onto the same production SceneCatalog boundary. Wrapper tests may not contain the
# load line; their shared underlying test is patched instead.
failing = [
    'civication-brand-mail-runtime.test.js',
    'civication-controller-day1-daily-builder.test.js',
    'civication-controller-first-week-praksisfortellinger.test.js',
    'civication-controller-second-week-praksisfortellinger.test.js',
    'civication-controller-two-week-flow.test.js',
    'civication-ekspeditor-brand-flow.test.js',
    'civication-ekspeditor-second-week-praksisfortellinger.test.js',
    'civication-ekspeditor-ui-flow.test.js',
    'civication-fagarbeider-two-week-flow.test.js',
    'civication-film-tv-produksjonsassistent-playability.test.js',
    'civication-first-week-praksisfortellinger.test.js',
    'civication-formann-first-week-praksisfortellinger.test.js',
    'civication-formann-second-week-praksisfortellinger.test.js',
    'civication-formann-two-week-flow.test.js',
    'civication-mellomleder-two-week-flow.test.js',
    'civication-praksisfortellinger-cross-role.test.js',
    'civication-praksisfortellinger-two-week-flow.test.js',
    'civication-second-week-praksisfortellinger.test.js',
]
needle = "  loadScript('js/Civication/systems/civicationMailRuntime.js');"
insert = needle + "\n  loadScript('js/Civication/systems/civicationWorkdayMailBuilder.js');"
patched = []
for name in failing:
    path = Path('tests') / name
    if not path.exists():
        continue
    text = path.read_text()
    if 'civicationWorkdayMailBuilder.js' in text:
        continue
    if needle in text:
        path.write_text(text.replace(needle, insert, 1))
        patched.append(name)

print(f'4H-D stage2 patched {len(patched)} harnesses: {patched}')
