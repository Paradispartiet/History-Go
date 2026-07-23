import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const overridesPath = path.join(root, 'data/places/category_overrides.json');
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/etne-category-completion-20260723/README.md');

const primaryOverrides = [
  {
    id: 'house_of_blues_skanevik',
    category: 'musikk',
    note: 'Permanent livescene og festivalanker i Skånevik; musikk er dagens og stadens tydelige hovedfunksjon.'
  },
  {
    id: 'musikkpaviljongen_doktorhagen',
    category: 'musikk',
    note: 'Dedikert musikkpaviljong og konsertsted; primærbadge Musikk.'
  },
  {
    id: 'old_river_saloon_etne',
    category: 'musikk',
    note: 'Fast live- og countryscene; musikk er primærfunksjonen.'
  },
  {
    id: 'abc_studio_etne',
    category: 'musikk',
    note: 'Profesjonelt lydstudio og musikkproduksjonsmiljø; primærbadge Musikk.'
  },
  {
    id: 'skanevik_fjordhotel_pippifestivalen',
    category: 'scenekunst',
    note: 'Fast teater- og familiefestivalarena i hotellhagen; levende teaterproduksjon er primærfunksjonen.'
  },
  {
    id: 'skanevik_kultur_og_idrettshall',
    category: 'scenekunst',
    note: 'Flerbruksarena med dokumentert revy, dans og sceneprogram; Scenekunst er mer presis primærbadge enn generell Kunst.'
  },
  {
    id: 'skakke_kultursenter_etne',
    category: 'scenekunst',
    note: 'Kombinert konsert-, teater- og arrangementsarena; Scenekunst er primærbadge, mens kino, musikk og kunst beholdes som sekundære faglag.'
  }
];

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
    note: 'Populærkultur-laget gjelder Pippi som etablert populærkulturelt univers rundt den dokumenterte teaterfestivalen; Scenekunst er fortsatt primærbadge.'
  },
  {
    file: 'data/places/kunst/vestland/etne/skanevik_kultur_og_idrettshall.json',
    id: 'skanevik_kultur_og_idrettshall',
    badges: ['sport'],
    tags: ['scenekunst', 'sport', 'fleirbruk'],
    note: 'Sport beholdes sekundært fordi bygget også er idrettshall, men den aktuelle History Go-recorden dokumenterer særlig kultur-, revy- og sceneprogrammet.'
  }
];

const requiredContentBadges = [
  'historie',
  'religion',
  'vitenskap',
  'kunst',
  'scenekunst',
  'by',
  'musikk',
  'litteratur',
  'natur',
  'sport',
  'politikk',
  'naeringsliv',
  'populaerkultur',
  'subkultur',
  'film_tv',
  'media',
  'psykologi'
];

function records(doc) {
  if (Array.isArray(doc)) return doc;
  if (doc && typeof doc === 'object' && Array.isArray(doc.places)) return doc.places;
  if (doc && typeof doc === 'object' && typeof doc.id === 'string') return [doc];
  return [];
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))];
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function upsertCategoryOverrides() {
  const overrides = await readJson(overridesPath);
  if (!Array.isArray(overrides)) throw new Error('category_overrides.json must be an array');

  const byId = new Map(overrides.map((row, index) => [row?.id, index]));
  for (const next of primaryOverrides) {
    const index = byId.get(next.id);
    if (typeof index === 'number') overrides[index] = { ...overrides[index], ...next };
    else {
      byId.set(next.id, overrides.length);
      overrides.push(next);
    }
  }

  const duplicateIds = overrides
    .map((row) => row?.id)
    .filter(Boolean)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicateIds.length) throw new Error(`Duplicate category override IDs: ${unique(duplicateIds).join(', ')}`);

  await writeJson(overridesPath, overrides);
  return new Map(overrides.map((row) => [row.id, row.category]));
}

async function updateSecondaryLayers() {
  for (const update of secondaryUpdates) {
    const fullPath = path.join(root, update.file);
    const doc = await readJson(fullPath);
    const rows = records(doc);
    const place = rows.find((row) => row?.id === update.id);
    if (!place) throw new Error(`${update.file}: place ${update.id} not found`);

    place.secondaryBadgeIds = unique([...(place.secondaryBadgeIds || []), ...update.badges]);
    place.tags = unique([...(place.tags || []), ...update.tags]);
    place.quiz_profile = place.quiz_profile || {};
    place.quiz_profile.must_include = unique([
      ...(place.quiz_profile.must_include || []),
      update.note
    ]);

    await writeJson(fullPath, doc);
  }
}

async function collectEtneCoverage(categoryOverrides) {
  const manifest = await readJson(manifestPath);
  if (!Array.isArray(manifest?.files)) throw new Error('places manifest missing files array');

  const coverage = new Map();
  const primaries = new Map();
  const placeRows = [];

  for (const rel of manifest.files) {
    const file = path.join(root, 'data', rel);
    let doc;
    try {
      doc = await readJson(file);
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
    for (const place of records(doc)) {
      if (String(place?.kommune || '').toLowerCase() !== 'etne') continue;
      const id = String(place.id || '').trim();
      const primary = categoryOverrides.get(id) || String(place.category || '').trim();
      const secondary = unique(place.secondaryBadgeIds || []);
      placeRows.push({ id, name: place.name, primary, secondary });
      if (primary) {
        if (!coverage.has(primary)) coverage.set(primary, []);
        coverage.get(primary).push(id);
        if (!primaries.has(primary)) primaries.set(primary, []);
        primaries.get(primary).push(id);
      }
      for (const badge of secondary) {
        if (!coverage.has(badge)) coverage.set(badge, []);
        coverage.get(badge).push(id);
      }
    }
  }

  return { coverage, primaries, placeRows };
}

async function writeReport(categoryOverrides) {
  const { coverage, primaries, placeRows } = await collectEtneCoverage(categoryOverrides);
  const missing = requiredContentBadges.filter((badge) => !coverage.has(badge));
  if (missing.length) throw new Error(`Etne still lacks effective content coverage for: ${missing.join(', ')}`);

  const primaryLines = [...primaries.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([badge, ids]) => `- **${badge}**: ${ids.length} primærsted(er)`)
    .join('\n');

  const secondaryLines = placeRows
    .filter((row) => row.secondary.length)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((row) => `- \`${row.id}\`: ${row.primary} primært; sekundært ${row.secondary.join(', ')}`)
    .join('\n');

  const report = `# Etne – full kategoridekning\n\nDato: 2026-07-23\n\n## Prinsipp\n\nDenne batchen rydder faktisk semantisk primærkategori før den vurderer dekning. Filmappe alene brukes ikke som fasit. Ett fysisk sted kan ha én primærkategori og dokumenterte sekundære badge-lag. \`sosial_laering\` holdes utenfor geografisk dekningskrav fordi den er en progresjons-/samhandlingsbadge, ikke en stedstype.\n\n## Primærendringer\n\n- House of Blues Skånevik → Musikk\n- Musikkpaviljongen i Doktorhagen → Musikk\n- Old River Saloon → Musikk\n- ABC Studio → Musikk\n- Skånevik Fjordhotel / Pippifestivalen → Scenekunst\n- Skånevik kultur- og idrettshall → Scenekunst\n- Skakke → Scenekunst\n\n## Sekundære faglag\n\n- Skakke: Film & TV, Musikk og Kunst. Film & TV er knyttet til den aktive kinofunksjonen; ingen duplikatmarkør opprettes.\n- Pippifestivalen: Populærkultur sekundært, knyttet til Pippi-universet; teaterfestivalen er fortsatt primært Scenekunst.\n- Skånevik kultur- og idrettshall: Sport sekundært.\n- Etne BMX- og skatepark og Skånevik skatepark beholder eksisterende sekundære Subkultur-lag. Dette beskriver dokumentert skate-/BMX-scene og egenorganisert miljø, ikke at alle brukere eller all skating automatisk er subkultur.\n\n## Primærkategorier etter opprydding\n\n${primaryLines}\n\n## Steder med sekundære badge-lag\n\n${secondaryLines || '- Ingen'}\n\n## Dekningsresultat\n\nAlle 17 geografiske innholdskategorier er representert i Etne gjennom minst ett primært eller dokumentert sekundært stedslag. Det er ikke opprettet et kunstig eget Subkultur-sted uten kildegrunnlag.\n`;

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report, 'utf8');
}

const categoryOverrides = await upsertCategoryOverrides();
await updateSecondaryLayers();
await writeReport(categoryOverrides);

console.log(JSON.stringify({
  primaryOverrides: primaryOverrides.map(({ id, category }) => ({ id, category })),
  secondaryUpdates: secondaryUpdates.map(({ id, badges }) => ({ id, badges })),
  excludedFromGeographicCoverage: ['sosial_laering']
}, null, 2));
