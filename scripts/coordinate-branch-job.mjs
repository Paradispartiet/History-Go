import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const overridesPath = path.join(root, 'data/places/category_overrides.json');
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/etne-category-completion-20260723/README.md');

const primaryOverrides = [
  ['house_of_blues_skanevik', 'musikk', 'Permanent livescene og festivalanker i Skånevik; musikk er tydelig hovedfunksjon.'],
  ['musikkpaviljongen_doktorhagen', 'musikk', 'Dedikert musikkpaviljong og konsertsted; primærbadge Musikk.'],
  ['old_river_saloon_etne', 'musikk', 'Fast live- og countryscene; musikk er primærfunksjonen.'],
  ['abc_studio_etne', 'musikk', 'Profesjonelt lydstudio og musikkproduksjonsmiljø; primærbadge Musikk.'],
  ['skanevik_fjordhotel_pippifestivalen', 'scenekunst', 'Fast teater- og familiefestivalarena; levende teaterproduksjon er primærfunksjonen.'],
  ['skanevik_kultur_og_idrettshall', 'scenekunst', 'Flerbruksarena med dokumentert revy, dans og sceneprogram; Scenekunst er mer presis enn generell Kunst.'],
  ['skakke_kultursenter_etne', 'scenekunst', 'Kombinert konsert-, teater- og arrangementsarena; Scenekunst er primærbadge, med kino, musikk og kunst som sekundære faglag.']
].map(([id, category, note]) => ({ id, category, note }));

const secondaryUpdates = [
  {
    file: 'data/places/kunst/vestland/etne/skakke_kultursenter_etne.json',
    id: 'skakke_kultursenter_etne',
    badges: ['film_tv', 'musikk', 'kunst'],
    tags: ['film_tv', 'musikk', 'scenekunst', 'kino', 'visningssted'],
    note: 'Film & TV-laget gjelder den aktive kinofunksjonen i samme fysiske kulturhus; det opprettes ikke en duplikatmarkør for Etne kino.'
  },
  {
    file: 'data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen.json',
    id: 'skanevik_fjordhotel_pippifestivalen',
    badges: ['populaerkultur'],
    tags: ['scenekunst', 'populaerkultur', 'barnekultur'],
    note: 'Populærkultur-laget gjelder Pippi-universet rundt den dokumenterte teaterfestivalen; Scenekunst er fortsatt primærbadge.'
  },
  {
    file: 'data/places/kunst/vestland/etne/skanevik_kultur_og_idrettshall.json',
    id: 'skanevik_kultur_og_idrettshall',
    badges: ['sport'],
    tags: ['scenekunst', 'sport', 'fleirbruk'],
    note: 'Sport beholdes sekundært fordi bygget også er idrettshall, mens History Go-recorden dokumenterer kultur-, revy- og sceneprogrammet.'
  }
];

const required = ['historie','religion','vitenskap','kunst','scenekunst','by','musikk','litteratur','natur','sport','politikk','naeringsliv','populaerkultur','subkultur','film_tv','media','psykologi'];

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const writeJson = async (file, value) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const unique = (values) => [...new Set((values || []).filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()))];
const records = (doc) => Array.isArray(doc) ? doc : Array.isArray(doc?.places) ? doc.places : doc?.id ? [doc] : [];

const overrides = await readJson(overridesPath);
if (!Array.isArray(overrides)) throw new Error('category_overrides.json must be an array');
const overrideIndex = new Map(overrides.map((row, index) => [row?.id, index]));
for (const next of primaryOverrides) {
  const index = overrideIndex.get(next.id);
  if (typeof index === 'number') overrides[index] = { ...overrides[index], ...next };
  else {
    overrideIndex.set(next.id, overrides.length);
    overrides.push(next);
  }
}
const duplicateOverrideIds = overrides.map((row) => row?.id).filter(Boolean).filter((id, index, all) => all.indexOf(id) !== index);
if (duplicateOverrideIds.length) throw new Error(`Duplicate category override IDs: ${unique(duplicateOverrideIds).join(', ')}`);
await writeJson(overridesPath, overrides);

for (const update of secondaryUpdates) {
  const fullPath = path.join(root, update.file);
  const doc = await readJson(fullPath);
  const place = records(doc).find((row) => row?.id === update.id);
  if (!place) throw new Error(`${update.file}: ${update.id} not found`);
  place.secondaryBadgeIds = unique([...(place.secondaryBadgeIds || []), ...update.badges]);
  place.tags = unique([...(place.tags || []), ...update.tags]);
  place.quiz_profile = place.quiz_profile || {};
  place.quiz_profile.must_include = unique([...(place.quiz_profile.must_include || []), update.note]);
  await writeJson(fullPath, doc);
}

const overrideMap = new Map(overrides.map((row) => [row.id, row.category]));
const manifest = await readJson(manifestPath);
const coverage = new Map();
const primaryCounts = new Map();
const secondaryRows = [];
for (const rel of manifest.files || []) {
  const file = path.join(root, 'data', rel);
  let doc;
  try { doc = await readJson(file); } catch (error) { if (error?.code === 'ENOENT') continue; throw error; }
  for (const place of records(doc)) {
    if (String(place?.kommune || '').toLowerCase() !== 'etne') continue;
    const id = String(place.id || '').trim();
    const primary = overrideMap.get(id) || String(place.category || '').trim();
    const secondary = unique(place.secondaryBadgeIds || []);
    if (primary) {
      coverage.set(primary, (coverage.get(primary) || 0) + 1);
      primaryCounts.set(primary, (primaryCounts.get(primary) || 0) + 1);
    }
    for (const badge of secondary) coverage.set(badge, (coverage.get(badge) || 0) + 1);
    if (secondary.length) secondaryRows.push({ id, primary, secondary });
  }
}
const missing = required.filter((badge) => !coverage.has(badge));
if (missing.length) throw new Error(`Etne still lacks effective category coverage: ${missing.join(', ')}`);

const primaryLines = [...primaryCounts.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([badge,count]) => `- **${badge}**: ${count} primærsted(er)`).join('\n');
const secondaryLines = secondaryRows.sort((a,b) => a.id.localeCompare(b.id)).map((row) => `- \`${row.id}\`: ${row.primary} primært; sekundært ${row.secondary.join(', ')}`).join('\n');
const report = `# Etne – full kategoridekning\n\nDato: 2026-07-23\n\n## Prinsipp\n\nSemantisk primærkategori avgjøres av stedets faktiske hovedidentitet, ikke av filmappe. Ett fysisk sted kan ha dokumenterte sekundære badge-lag. \`sosial_laering\` er ikke et geografisk dekningskrav.\n\n## Primærendringer\n\n- House of Blues Skånevik → Musikk\n- Musikkpaviljongen i Doktorhagen → Musikk\n- Old River Saloon → Musikk\n- ABC Studio → Musikk\n- Skånevik Fjordhotel / Pippifestivalen → Scenekunst\n- Skånevik kultur- og idrettshall → Scenekunst\n- Skakke → Scenekunst\n\n## Sekundære faglag\n\n- Skakke: Film & TV, Musikk og Kunst.\n- Pippifestivalen: Populærkultur.\n- Skånevik kultur- og idrettshall: Sport.\n- Etne BMX- og skatepark og Skånevik skatepark beholder sekundær Subkultur for dokumentert skate-/BMX-scene og egenorganisert miljø; dette gjør ikke all skating eller alle brukere til subkultur.\n\n## Primærkategorier\n\n${primaryLines}\n\n## Sekundære badge-lag\n\n${secondaryLines}\n\n## Resultat\n\nAlle 17 geografiske innholdskategorier er representert i Etne gjennom minst ett primært eller dokumentert sekundært stedslag. Det er ikke opprettet et kunstig eget Subkultur-sted uten kildegrunnlag.\n`;
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, report, 'utf8');

console.log(JSON.stringify({ primaryOverrides, secondaryUpdates: secondaryUpdates.map(({id,badges}) => ({id,badges})), missing }, null, 2));
