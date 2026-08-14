import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const OUT = 'reports/place-production/torggata-phase13-deep-candidate-work';
const USER_AGENT = 'History-Go/phase13-brand-review (https://github.com/Paradispartiet/History-Go)';
const ensureDir = dir => fs.mkdir(dir, { recursive: true });
const safe = value => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 90) || 'candidate';
const clean = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));

const dimuTargets = [
  { id: 'ludvig_jensen_co', name: 'Ludvig Jensen & Co.', queries: ['"Ludvig Jensen" Torggata', '"Ludvig Jensen & Co"'] },
  { id: 'pm_jensen', name: 'P. M. Jensen', queries: ['"P.M. Jensen" Torggata', '"P M Jensen" kjøttvarer', '"P.M. Jensen kjøttvarer"'] },
  { id: 'karl_a_jensen_forretning', name: 'Karl A. Jensen', queries: ['"Karl A. Jensen" Torggata', '"Karl A. Jensens" forretningsgaard'] },
  { id: 'ingwald_nielsen', name: 'Ingwald Nielsen', queries: ['"Ingwald Nielsen" Torggata', '"Ingwald Nielsens forretning"', '"Ingwald Nielsen jernvareforretning"'] },
  { id: 'adelsten', name: 'Adelsten', queries: ['"Adelsten Jensen" Torggata', '"Adelsten Jensen" forretning'] }
];

const officialTargets = [
  { id: 'oslo_sportslager', name: 'Oslo Sportslager', url: 'https://oslosportslager.no/' },
  { id: 'oslo_bar_bowling', name: 'Oslo Bar & Bowling', url: 'https://oslobowling.no/' },
  { id: 'oslo_street_food', name: 'Oslo Street Food', url: 'https://www.oslo-streetfood.no/' },
  { id: 'angst', name: 'Angst', url: 'https://www.visitnorway.no/listings/angst-bar/24690/' }
];

async function fetchOk(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(45_000),
    ...options,
    headers: { 'user-agent': USER_AGENT, accept: '*/*', ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response;
}

function dimuCandidate(doc) {
  const mediaIdentifier = doc['artifact.defaultMediaIdentifier'];
  const uniqueId = doc['artifact.uniqueId'];
  if (!mediaIdentifier || !uniqueId) return null;
  const license = doc['artifact.ingress.license'] || doc['artifact.license'] || [];
  return {
    candidateId: `dimu_${safe(uniqueId)}`,
    sourceKind: 'digitaltmuseum',
    title: doc['artifact.ingress.title'] || doc['artifact.title'] || doc['identifier.id'] || uniqueId,
    sourcePage: `https://digitaltmuseum.no/${uniqueId}`,
    assetUrl: `https://dms01.dimu.org/image/${mediaIdentifier}?dimension=1200x1200&filename=${safe(uniqueId)}.jpg`,
    previewUrl: `https://dms01.dimu.org/image/${mediaIdentifier}?dimension=600x600&filename=${safe(uniqueId)}.jpg`,
    mediaIdentifier,
    uniqueId,
    owner: doc['identifier.owner'] || '',
    museumIdentifier: doc['identifier.id'] || '',
    creator: doc['artifact.ingress.producer'] || '',
    producerRole: doc['artifact.ingress.producerRole'] || '',
    fromYear: doc['artifact.ingress.production.fromYear'] || doc['artifact.event.fromYear'] || null,
    toYear: doc['artifact.ingress.production.toYear'] || doc['artifact.event.toYear'] || null,
    license: Array.isArray(license) ? license.join(', ') : String(license),
    rightsAssessment: 'digitaltmuseum_record_review_required'
  };
}

async function dimuSearch(query) {
  const params = new URLSearchParams({
    q: query,
    fq: 'artifact.hasPictures:true',
    wt: 'json',
    rows: '25',
    'api.key': 'demo'
  });
  const json = await (await fetchOk(`https://api.dimu.org/api/solr/select?${params}`)).json();
  return (json?.response?.docs || []).map(dimuCandidate).filter(Boolean);
}

async function normalizeRemote(targetId, candidate, index) {
  const dir = path.join(OUT, 'previews', targetId);
  await ensureDir(dir);
  const local = path.join(dir, `${String(index + 1).padStart(2, '0')}_${safe(candidate.title || candidate.candidateId)}.jpg`);
  try {
    const response = await fetchOk(candidate.previewUrl || candidate.assetUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer, { density: 180 })
      .rotate()
      .resize(700, 440, { fit: 'contain', background: '#f6f6f6', withoutEnlargement: true })
      .flatten({ background: '#f6f6f6' })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(local);
    return { ...candidate, localPreview: path.relative(OUT, local).replaceAll('\\', '/') };
  } catch (error) {
    return { ...candidate, localPreview: null, previewError: String(error?.message || error) };
  }
}

async function captureOfficial(browser, target) {
  const dir = path.join(OUT, 'previews', target.id);
  await ensureDir(dir);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  const result = { id: target.id, name: target.name, url: target.url, candidates: [], errors: [] };
  try {
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 75_000 });
    await page.waitForTimeout(3500);
    for (const label of ['Godta', 'Godta alle', 'Aksepter', 'Accept', 'Allow all', 'OK']) {
      try {
        const button = page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }).first();
        if (await button.isVisible({ timeout: 300 })) await button.click({ timeout: 1000 });
      } catch {}
    }
    await page.waitForTimeout(1200);
    const fullPath = path.join(dir, '00_page_top.jpg');
    await page.screenshot({ path: fullPath, type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1440, height: 900 } });
    result.pageTitle = await page.title();
    result.finalUrl = page.url();
    result.candidates.push({
      candidateId: 'official_page_top',
      sourceKind: 'official_site_capture',
      title: `${target.name} official page top`,
      sourcePage: target.url,
      localPreview: path.relative(OUT, fullPath).replaceAll('\\', '/'),
      rightsAssessment: 'referential_trademark_review_required',
      noEndorsementRequired: true
    });

    const brandTokens = target.name.toLowerCase().split(/\s+/).filter(token => token.length >= 3);
    const descriptors = await page.locator('img, svg').evaluateAll((nodes, tokens) => nodes.map((node, index) => {
      const rect = node.getBoundingClientRect();
      const attrs = ['alt', 'aria-label', 'class', 'id', 'src', 'href'].map(name => node.getAttribute(name) || '').join(' ');
      const text = `${attrs} ${node.parentElement?.getAttribute('href') || ''}`.toLowerCase();
      let score = 0;
      if (/logo|brand|header|navbar|site-logo|custom-logo/.test(text)) score += 70;
      if (tokens.some(token => text.includes(token))) score += 40;
      if (rect.top < 300) score += 20;
      if (rect.width >= 80 && rect.height >= 25) score += 15;
      if (rect.width > 900 || rect.height > 500) score -= 50;
      return { index, tag: node.tagName.toLowerCase(), text: text.slice(0, 500), score, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
    }), brandTokens);
    const selected = descriptors
      .filter(item => item.score >= 20 && item.rect.width >= 30 && item.rect.height >= 16 && item.rect.y >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    for (let i = 0; i < selected.length; i += 1) {
      const item = selected[i];
      const locator = page.locator('img, svg').nth(item.index);
      const local = path.join(dir, `${String(i + 1).padStart(2, '0')}_element.jpg`);
      try {
        await locator.screenshot({ path: local, type: 'jpeg', quality: 92, timeout: 10_000 });
        result.candidates.push({
          candidateId: `official_element_${i + 1}`,
          sourceKind: 'official_site_element_capture',
          title: `${target.name} official element ${i + 1}`,
          sourcePage: target.url,
          descriptor: item.text,
          discoveryScore: item.score,
          boundingBox: item.rect,
          localPreview: path.relative(OUT, local).replaceAll('\\', '/'),
          rightsAssessment: 'referential_trademark_review_required',
          noEndorsementRequired: true
        });
      } catch (error) {
        result.errors.push(`element ${i + 1}: ${error?.message || error}`);
      }
    }
  } catch (error) {
    result.errors.push(String(error?.message || error));
  } finally {
    await page.close();
  }
  return result;
}

async function contactSheet(groups) {
  const rows = groups.flatMap(group => group.candidates.filter(c => c.localPreview).slice(0, 12).map(candidate => ({ group, candidate })));
  const tileW = 660;
  const tileH = 520;
  const cols = 3;
  const countRows = Math.max(1, Math.ceil(rows.length / cols));
  const composites = [];
  for (let i = 0; i < rows.length; i += 1) {
    const { group, candidate } = rows[i];
    const left = (i % cols) * tileW;
    const top = Math.floor(i / cols) * tileH;
    const input = await fs.readFile(path.join(OUT, candidate.localPreview));
    const preview = await sharp(input).resize(tileW - 20, 400, { fit: 'contain', background: '#fff' }).jpeg().toBuffer();
    const lines = [group.id, candidate.candidateId, clean(candidate.title).slice(0, 82), clean(candidate.license || candidate.rightsAssessment).slice(0, 70)];
    const svg = Buffer.from(`<svg width="${tileW - 20}" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><text x="10" y="20" font-family="Arial,sans-serif" font-size="15" fill="#111">${lines.map((line, idx) => `<tspan x="10" dy="${idx ? 22 : 0}">${esc(line)}</tspan>`).join('')}</text></svg>`);
    composites.push({ input: preview, left: left + 10, top: top + 10 }, { input: svg, left: left + 10, top: top + 410 });
  }
  await sharp({ create: { width: tileW * cols, height: tileH * countRows, channels: 3, background: '#e8e8e8' } })
    .composite(composites)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, 'contact-sheet.jpg'));
}

await fs.rm(OUT, { recursive: true, force: true });
await ensureDir(OUT);
const groups = [];

for (const target of dimuTargets) {
  const raw = [];
  for (const query of target.queries) {
    try { raw.push(...await dimuSearch(query)); }
    catch (error) { raw.push({ candidateId: `dimu_error_${safe(query)}`, sourceKind: 'dimu_error', title: query, error: String(error?.message || error) }); }
  }
  const unique = [...new Map(raw.map(item => [item.sourcePage || item.candidateId, item])).values()].slice(0, 30);
  const candidates = [];
  for (let index = 0; index < unique.length; index += 1) candidates.push(await normalizeRemote(target.id, unique[index], index));
  groups.push({ id: target.id, name: target.name, source: 'digitaltmuseum', candidates });
  console.log(`${target.id}: ${candidates.length} DiMu candidates, ${candidates.filter(c => c.localPreview).length} previews`);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const target of officialTargets) {
    const group = await captureOfficial(browser, target);
    groups.push({ ...group, source: 'official_site' });
    console.log(`${target.id}: ${group.candidates.length} official captures, ${group.errors.length} errors`);
  }
} finally {
  await browser.close();
}

await contactSheet(groups);
await fs.writeFile(path.join(OUT, 'candidates.json'), `${JSON.stringify({
  schema: 'history_go_torggata_phase13_brand_deep_candidates_v1',
  generatedAt: new Date().toISOString(),
  placeId: 'torggata',
  phase: 13,
  groups
}, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
