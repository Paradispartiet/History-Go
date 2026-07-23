import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-23';
const reportDir = path.join(root, 'reports', 'etne-natur-batch-4-vikedalsvassdraget');
const sourceDir = path.join(reportDir, 'sources');
const manifestPath = path.join(root, 'data', 'places', 'manifest.json');
const targetDir = path.join(root, 'data', 'places', 'natur', 'vestland', 'etne');
const nveUrl = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/rogaland/038-1-vikedalselva/';
const etneUrl = 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/';
const nvePlanUrl = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/';

await fs.mkdir(sourceDir, { recursive: true });
await fs.mkdir(targetDir, { recursive: true });

const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .trim();

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fetchJson(url, name) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go coordinate research (Paradispartiet/History-Go)',
      'Accept': 'application/json, */*;q=0.8'
    }
  });
  const text = await response.text();
  await fs.writeFile(path.join(sourceDir, `${name}.txt`), text, 'utf8');
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  const json = JSON.parse(text);
  await writeJson(path.join(sourceDir, `${name}.json`), json);
  return json;
}

function collectCandidates(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectCandidates(item, out);
    return out;
  }
  const rp = value.representasjonspunkt;
  if (rp && typeof rp === 'object') {
    const lat = Number(rp.nord ?? rp.lat ?? rp.y);
    const lon = Number(rp.øst ?? rp.ost ?? rp.lon ?? rp.x);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      out.push({
        lat,
        lon,
        id: String(value.stedsnummer ?? value.stednummer ?? value.id ?? '').trim(),
        text: JSON.stringify(value)
      });
    }
  }
  for (const item of Object.values(value)) collectCandidates(item, out);
  return out;
}

async function resolveBjonndalen() {
  const aliases = ['Bjønndalen', 'Bjonndalen', 'Bjønndal'];
  const attempts = [];
  for (const alias of aliases) {
    const params = new URLSearchParams({ knr: '4611', sok: alias, treffPerSide: '100', side: '1', utkoordsys: '4258' });
    const url = `https://api.kartverket.no/stedsnavn/v1/sted?${params}`;
    const json = await fetchJson(url, `ssr-${normalize(alias).replace(/\s+/g, '-')}`);
    const candidates = collectCandidates(json).map((row) => {
      const haystack = normalize(row.text);
      let score = 0;
      if (haystack.includes(normalize(alias))) score += 100;
      if (haystack.includes('etne')) score += 20;
      if (haystack.includes('bjønndalen') || haystack.includes('bjonndalen')) score += 50;
      return { ...row, score };
    }).sort((a, b) => b.score - a.score);
    attempts.push({ alias, candidates });
    if (candidates[0]?.score >= 100) {
      return {
        lat: Number(candidates[0].lat.toFixed(7)),
        lon: Number(candidates[0].lon.toFixed(7)),
        sourceObjectId: `kartverket-ssr:${candidates[0].id || `${candidates[0].lat},${candidates[0].lon}`}`,
        sourceUrl: url,
        matchedAlias: alias
      };
    }
  }
  await writeJson(path.join(reportDir, 'unresolved-bjonndalen.json'), attempts);
  throw new Error('Could not resolve Bjønndalen in Etne from Kartverket SSR');
}

const coordinate = await resolveBjonndalen();
const place = {
  id: 'vikedalsvassdraget_bjonndalen',
  name: 'Vikedalsvassdraget – Bjønndalen',
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: 1500,
  coordType: 'area_center',
  coordStatus: 'needs_manual_visual_qa',
  coordSource: 'Kartverket SSR – navngitt Bjønndalen-anker i Etne for Etne-delen av det vernede Vikedalsvassdraget',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Semantisk områdeanker i Bjønndalen for den delen av Vikedalsvassdragets nedbørfelt som ligger i Etne kommune. Punktet er ikke et geometrisk sentrum for hele vassdraget eller en anbefalt turstart. NVE dokumenterer at det vernede Vikedalsvassdraget berører Etne, mens Etne kommune uttrykkelig fører Vikedalsvassdraget (Bjønndalen) blant kommunens vernede vassdrag.',
  locatorType: 'natural_area',
  sourceProvider: 'kartverket',
  sourceObjectId: coordinate.sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'area_anchor',
  category: 'natur',
  fylke: 'vestland',
  kommune: 'Etne',
  year: 1986,
  period: 'Vernet typevassdrag – Etne-delen i Bjønndalen',
  tags: ['vikedalsvassdraget', 'bjonndalen', 'vernet_vassdrag', 'nedborfelt', 'etne', 'typevassdrag'],
  desc: 'Bjønndalen ligger i den delen av det vernede Vikedalsvassdragets nedbørfelt som berører Etne. Vassdraget er vernet som typevassdrag og rommer et variert system av fjell, vann, elveløp og våtmark.',
  popupDesc: 'Etne kommune fører Vikedalsvassdraget (Bjønndalen) blant kommunens vernede vassdrag. NVE beskriver Vikedalselva som et vernet typevassdrag med mange vann, svært varierte elveløp og våtmarksområder fra fjell til fjord. History Go-stedet representerer Etne-delen av nedbørfeltet ved Bjønndalen, ikke hele Vikedalselva ned mot Sandeidfjorden. Det gjør stedet til et tydelig eksempel på at et vernet vassdrag kan krysse kommune- og fylkesgrenser og må forstås som ett sammenhengende nedbørfelt.',
  nature_profile: {
    type: 'vernet nedbørfelt / fjelldal / vassdragssystem',
    title: 'Etne-delen av eit vassdrag som renn mot Ryfylke',
    summary: 'Bjønndalen er Etne sitt vindauge inn i Vikedalsvassdraget. Natur-rundingen handlar om samanhengen mellom høgare nedbørfelt, småvatn, elveløp og våtmark i eit verna system som held fram over kommunegrensa.',
    themes: ['vernet vassdrag', 'nedbørfelt', 'fjelldal', 'våtmark', 'sammenheng over kommunegrense'],
    nearby_place_ids: ['etnefjella', 'stordalsvatnet_etne', 'krokavatnet_etneforkastningen']
  },
  quiz_profile: {
    place_type: 'vernet_vassdrag',
    subtype: 'etne_del_av_vikedalsvassdragets_nedborfelt',
    signature_features: ['Bjønndalen i Etne ligger i det vernede Vikedalsvassdragets nedbørfelt', 'vassdraget er vernet som typevassdrag', 'systemet fortsetter fra fjellområdene mot Vikedal og Sandeidfjorden'],
    primary_angles: ['nedbørfelt', 'vassdragsvern', 'landskapssammenheng', 'kommunegrenser'],
    question_families: ['vernet_vassdrag', 'nedborfelt', 'fra_fjell_til_fjord', 'typevassdrag'],
    avoid_angles: ['påstå_at_kartankeret_er_heile_vassdraget', 'gjore_stedet_til_vikedal_sentrum'],
    must_include: ['at markøren gjelder Etne-delen ved Bjønndalen', 'at Vikedalsvassdraget er et større vernet nedbørfelt'],
    contrast_targets: ['etnevassdraget', 'vaulaelva_vassdraget'],
    notes: 'Spør som del av et sammenhengende nedbørfelt. Kartankeret er semantisk og skal ikke tolkes som eksakt vassdragsgrense eller anbefalt ferdselslinje.'
  },
  externalLinks: [
    { type: 'official', label: 'Etne kommune – naturforvaltning og verna vassdrag', url: etneUrl, lang: 'nn', verifiedAt },
    { type: 'official', label: 'NVE – 038/1 Vikedalselva', url: nveUrl, lang: 'nb', verifiedAt },
    { type: 'official', label: 'NVE – Verneplan for vassdrag', url: nvePlanUrl, lang: 'nb', verifiedAt }
  ],
  emne_ids: ['em_natur_elver_bekker_vassdrag', 'em_natur_arter_habitat_mangfold', 'em_natur_vern_forvaltning_politikk'],
  underbadge_ids: ['vann_og_vassdrag', 'elv', 'ravine_og_dal', 'naturvern', 'friluftsliv']
};

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest.files)) throw new Error('data/places/manifest.json is missing files[]');
const rel = 'places/natur/vestland/etne/vikedalsvassdraget_bjonndalen.json';

for (const manifestFile of manifest.files) {
  const full = path.join(root, 'data', manifestFile);
  let payload;
  try { payload = JSON.parse(await fs.readFile(full, 'utf8')); } catch { continue; }
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : [];
  if (rows.some((row) => row?.id === place.id)) throw new Error(`Refusing duplicate active place id ${place.id}`);
}

await writeJson(path.join(targetDir, 'vikedalsvassdraget_bjonndalen.json'), [place]);
if (!manifest.files.includes(rel)) manifest.files.push(rel);
await writeJson(manifestPath, manifest);

const summary = {
  batch: 'Etne nature batch 4 – Vikedalsvassdraget/Bjønndalen',
  date: verifiedAt,
  addedPlaceIds: [place.id],
  coordinateStatus: { [place.id]: place.coordStatus },
  coordinateSources: { [place.id]: { sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon } }
};
await writeJson(path.join(reportDir, 'summary.json'), summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Etne natur – batch 4\n\nDato: ${verifiedAt}\n\nLagt til Vikedalsvassdraget – Bjønndalen (\`${place.id}\`) som semantisk områdeanker for Etne-delen av det vernede Vikedalsvassdraget.\n\nKoordinatet er henta frå Kartverket SSR og er medvite merka \`needs_manual_visual_qa\` fordi markøren representerer eit større nedbørfelt, ikkje eit punktobjekt.\n`, 'utf8');

console.log(JSON.stringify(summary, null, 2));