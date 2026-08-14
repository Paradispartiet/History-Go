import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'reports/place-production/torggata-phase13-candidate-work';
const USER_AGENT = 'History-Go/phase13-brand-review (https://github.com/Paradispartiet/History-Go)';

const targets = [
  {
    id: 'angst',
    name: 'Angst',
    queries: ['Angst Bar Oslo Torggata', 'Angst Oslo bar sign'],
    officialUrls: ['https://www.visitoslo.com/no/produkt/?name=Angst-Bar&tlp=3006243']
  },
  {
    id: 'john_dee',
    name: 'John Dee',
    queries: ['John Dee venue Oslo logo', 'John Dee Torggata Oslo'],
    knownCommons: ['File:John dee venue logo black.gif'],
    officialUrls: ['https://www.rockefeller.no/john-dee']
  },
  {
    id: 'eldorado_bokhandel',
    name: 'Eldorado Bokhandel',
    queries: ['Eldorado Bokhandel Oslo Torggata', 'Eldorado bokhandel Torggata'],
    knownCommons: ['File:Marie Sneve Martinussen på Eldorado (27676732300).jpg']
  },
  {
    id: 'jernia_torggata',
    name: 'Jernia Torggata',
    queries: ['Jernia logo', 'Jernia Torggata Oslo'],
    knownCommons: ['File:Jernia logo.png'],
    officialUrls: ['https://www.jernia.no/butikker/oslo/jernia-torggata']
  },
  {
    id: 'oslo_sportslager',
    name: 'Oslo Sportslager',
    queries: ['Oslo Sportslager Torggata', 'Oslo Sportslager logo'],
    officialUrls: ['https://oslosportslager.no/']
  },
  {
    id: 'norli_eldorado',
    name: 'Norli Eldorado',
    queries: ['Norli logo', 'Norli Eldorado Torggata'],
    knownCommons: ['File:Norli.svg'],
    officialUrls: ['https://www.norli.no/butikker/oslo/norli-oslo-eldorado']
  },
  {
    id: 'oslo_bar_bowling',
    name: 'Oslo Bar & Bowling',
    queries: ['Oslo Bar Bowling Torggata', 'Oslo Bowling Torggata logo'],
    officialUrls: ['https://oslobowling.no/']
  },
  {
    id: 'oslo_street_food',
    name: 'Oslo Street Food',
    queries: ['Oslo Street Food Torggata'],
    knownCommons: ['File:Oslo Street Food, Torggata 16B, Oslo.jpg'],
    officialUrls: ['https://www.oslo-streetfood.no/']
  },
  {
    id: 'adelsten',
    name: 'Adelsten',
    queries: ['Adelsten Jensen shop Oslo', 'Adelsten Torggata Oslo'],
    knownCommons: [
      'File:Delstenjensen1962-63.jpg',
      'File:Adelsten Jensen - no-nb digifoto 20160119 00047 NB NS 000109A.jpg'
    ]
  },
  {
    id: 'ludvig_jensen_co',
    name: 'Ludvig Jensen & Co.',
    queries: ['Ludvig Jensen Torggata Oslo shop', 'Torggata 5 Oslo historical shop']
  },
  {
    id: 'pm_jensen',
    name: 'P. M. Jensen',
    queries: ['P M Jensen Torggata Oslo shop', 'Torggata 5b Oslo historical shop']
  },
  {
    id: 'karl_a_jensen_forretning',
    name: 'Karl A. Jensen Vilt- og lakseforretning',
    queries: ['Karl A Jensen Torggata Oslo', 'Karl A Jensens forretningsgaard'],
    knownCommons: ['File:Karl A. Jensens nye forretningsgaard - no-nb digifoto 20160119 00076 NB NS 000109B.jpg']
  },
  {
    id: 'ingwald_nielsen',
    name: 'Ingwald Nielsen',
    queries: ['Ingwald Nielsen Torggata Oslo', 'Torggata 4 6 Ingwald Nielsen']
  }
];

const ensureDir = dir => fs.mkdir(dir, { recursive: true });
const clean = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const safe = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9æøå]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 90) || 'candidate';
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));

async function fetchOk(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: { 'user-agent': USER_AGENT, accept: '*/*', ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response;
}

function ext(meta, key) {
  return clean(meta?.[key]?.value || '');
}

function commonsCandidate(page) {
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  const meta = info.extmetadata || {};
  return {
    candidateId: `commons_${page.pageid}`,
    sourceKind: 'wikimedia_commons',
    title: page.title,
    sourcePage: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    assetUrl: info.url,
    previewUrl: info.thumburl || info.url,
    mime: info.mime || '',
    width: info.width || 0,
    height: info.height || 0,
    creator: ext(meta, 'Artist'),
    credit: ext(meta, 'Credit'),
    license: ext(meta, 'LicenseShortName'),
    licenseUrl: ext(meta, 'LicenseUrl'),
    usageTerms: ext(meta, 'UsageTerms'),
    description: ext(meta, 'ImageDescription'),
    dateTimeOriginal: ext(meta, 'DateTimeOriginal'),
    rightsAssessment: 'commons_metadata_review_required'
  };
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
    iiurlwidth: '600',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const response = await fetchOk(`https://commons.wikimedia.org/w/api.php?${params}`);
  const json = await response.json();
  return (json?.query?.pages || []).map(commonsCandidate).filter(Boolean);
}

async function commonsKnown(titles) {
  if (!titles?.length) return [];
  const params = new URLSearchParams({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
    iiurlwidth: '600',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const response = await fetchOk(`https://commons.wikimedia.org/w/api.php?${params}`);
  const json = await response.json();
  return (json?.query?.pages || []).map(commonsCandidate).filter(Boolean);
}

function attr(html, tag, attrName) {
  const match = tag.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i'));
  if (match) return match[1];
  const unquoted = tag.match(new RegExp(`${attrName}\\s*=\\s*([^\\s>]+)`, 'i'));
  return unquoted?.[1] || '';
}

function resolveUrl(value, base) {
  const raw = clean(value).replace(/&amp;/g, '&');
  if (!raw || raw.startsWith('data:')) return '';
  try { return new URL(raw, base).toString(); } catch { return ''; }
}

async function officialCandidates(officialUrl, brandName) {
  let html = '';
  try {
    html = await (await fetchOk(officialUrl, { headers: { accept: 'text/html,application/xhtml+xml' } })).text();
  } catch (error) {
    return [{
      candidateId: `official_fetch_error_${safe(officialUrl)}`,
      sourceKind: 'official_site_error',
      title: `${brandName} – official fetch failed`,
      sourcePage: officialUrl,
      error: String(error?.message || error)
    }];
  }

  const scored = [];
  const add = (url, reason, score) => {
    const resolved = resolveUrl(url, officialUrl);
    if (!resolved || !/^https?:/i.test(resolved)) return;
    scored.push({ resolved, reason, score });
  };

  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = `${attr(tag, 'property')} ${attr(tag, 'name')}`.toLowerCase();
    const content = attr(tag, 'content');
    if (/og:image|twitter:image/.test(key)) add(content, key.trim(), 75);
  }
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = attr(tag, 'rel').toLowerCase();
    if (/icon|apple-touch/.test(rel)) add(attr(tag, 'href'), `link:${rel}`, /apple-touch/.test(rel) ? 45 : 35);
  }
  const brandTokens = brandName.toLowerCase().split(/\s+/).filter(token => token.length >= 4);
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const descriptor = `${attr(tag, 'alt')} ${attr(tag, 'class')} ${attr(tag, 'id')} ${attr(tag, 'src')}`.toLowerCase();
    let score = 10;
    if (/logo|brand|header|navbar/.test(descriptor)) score += 60;
    if (brandTokens.some(token => descriptor.includes(token))) score += 35;
    add(attr(tag, 'src') || attr(tag, 'data-src') || attr(tag, 'data-lazy-src'), `img:${clean(descriptor).slice(0, 160)}`, score);
  }

  const unique = [...new Map(scored.sort((a, b) => b.score - a.score).map(item => [item.resolved, item])).values()].slice(0, 10);
  return unique.map((item, index) => ({
    candidateId: `official_${safe(new URL(officialUrl).hostname)}_${index + 1}`,
    sourceKind: 'official_site',
    title: `${brandName} official candidate ${index + 1}`,
    sourcePage: officialUrl,
    assetUrl: item.resolved,
    previewUrl: item.resolved,
    discoveryReason: item.reason,
    discoveryScore: item.score,
    rightsAssessment: 'referential_trademark_review_required',
    noEndorsementRequired: true
  }));
}

async function normalizeCandidate(target, candidate, index) {
  if (!candidate.previewUrl) return { ...candidate, localPreview: null };
  const dir = path.join(OUT, 'previews', target.id);
  await ensureDir(dir);
  const local = path.join(dir, `${String(index + 1).padStart(2, '0')}_${safe(candidate.title || candidate.candidateId)}.jpg`);
  try {
    const response = await fetchOk(candidate.previewUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 15_000_000) throw new Error(`candidate too large: ${buffer.length}`);
    await sharp(buffer, { animated: false, density: 180 })
      .rotate()
      .resize(520, 340, { fit: 'contain', background: { r: 246, g: 246, b: 246, alpha: 1 }, withoutEnlargement: true })
      .flatten({ background: '#f6f6f6' })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(local);
    return { ...candidate, localPreview: path.relative(OUT, local).replaceAll('\\', '/') };
  } catch (error) {
    return { ...candidate, localPreview: null, previewError: String(error?.message || error) };
  }
}

async function makeContactSheet(targetResults) {
  const candidates = targetResults.flatMap(target => target.candidates
    .filter(candidate => candidate.localPreview)
    .slice(0, 9)
    .map(candidate => ({ target, candidate })));
  const tileW = 600;
  const tileH = 430;
  const cols = 3;
  const rows = Math.max(1, Math.ceil(candidates.length / cols));
  const canvas = sharp({ create: { width: tileW * cols, height: tileH * rows, channels: 3, background: '#ececec' } });
  const composites = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const { target, candidate } = candidates[i];
    const left = (i % cols) * tileW;
    const top = Math.floor(i / cols) * tileH;
    const preview = await fs.readFile(path.join(OUT, candidate.localPreview));
    const image = await sharp(preview).resize(tileW - 20, 330, { fit: 'contain', background: '#ffffff' }).jpeg().toBuffer();
    const label = `${target.id} · ${candidate.candidateId}\n${clean(candidate.title).slice(0, 76)}\n${clean(candidate.license || candidate.rightsAssessment).slice(0, 58)}`;
    const svg = Buffer.from(`<svg width="${tileW - 20}" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><text x="10" y="20" font-family="Arial, sans-serif" font-size="15" fill="#111">${label.split('\n').map((line, idx) => `<tspan x="10" dy="${idx ? 22 : 0}">${esc(line)}</tspan>`).join('')}</text></svg>`);
    composites.push({ input: image, left: left + 10, top: top + 10 });
    composites.push({ input: svg, left: left + 10, top: top + 340 });
  }
  await canvas.composite(composites).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, 'contact-sheet.jpg'));
}

await fs.rm(OUT, { recursive: true, force: true });
await ensureDir(OUT);

const targetResults = [];
for (const target of targets) {
  const raw = [];
  raw.push(...await commonsKnown(target.knownCommons || []));
  for (const query of target.queries || []) {
    try { raw.push(...await commonsSearch(query)); }
    catch (error) { raw.push({ candidateId: `commons_error_${safe(query)}`, sourceKind: 'commons_error', title: query, error: String(error?.message || error) }); }
  }
  for (const url of target.officialUrls || []) raw.push(...await officialCandidates(url, target.name));

  const unique = [...new Map(raw.map(candidate => [candidate.sourcePage || candidate.assetUrl || candidate.candidateId, candidate])).values()]
    .filter(candidate => candidate.candidateId)
    .slice(0, 24);
  const candidates = [];
  for (let index = 0; index < unique.length; index += 1) candidates.push(await normalizeCandidate(target, unique[index], index));
  targetResults.push({ id: target.id, name: target.name, candidates });
  console.log(`${target.id}: ${candidates.length} candidates, ${candidates.filter(item => item.localPreview).length} previews`);
}

await makeContactSheet(targetResults);
const report = {
  schema: 'history_go_torggata_phase13_brand_asset_candidates_v1',
  generatedAt: new Date().toISOString(),
  placeId: 'torggata',
  phase: 13,
  policy: {
    preferred: ['public_domain', 'cc0', 'creative_commons', 'official_referential_only'],
    prohibited: ['generated_logo', 'reconstructed_logo', 'identity_guess'],
    reviewRequired: true,
    note: 'Candidate discovery is not approval. Every selected asset needs identity, source and rights review.'
  },
  targets: targetResults
};
await fs.writeFile(path.join(OUT, 'candidates.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${path.join(OUT, 'candidates.json')} and contact sheet`);
