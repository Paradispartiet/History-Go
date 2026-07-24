import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const MAX_BATCH = 194;
const PLACE_ID = 'sigrid_undset_statue';
const OSM_NODE_ID = 7596280553;
const VERIFIED_AT = '2026-07-24';
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194');

const paths = {
  protocol: join(root, 'docs/coordinates/coordinate-control-protocol.md'),
  place: join(root, 'data/places/litteratur/oslo/places_litteratur.json'),
  evidence: join(root, 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json'),
  priorSummary: join(root, 'reports/oslo-coordinate-sigrid-undset-exact-object-refresh-post-192/summary.json'),
  centralAudit: join(root, 'reports/oslo-coordinate-central-unresolved-audit-post-194/summary.json'),
};

const urls = {
  osmApi: `https://api.openstreetmap.org/api/0.6/node/${OSM_NODE_ID}.json`,
  overpass: `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json][timeout:25];node(${OSM_NODE_ID});out meta;`)}`,
  artist: 'https://kjersti-wexelsen-goksoyr.no/portfolio_page/sigrid-undset/',
  municipality: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/',
  googlePhotos: 'https://photos.app.goo.gl/JrhcnKr6gwFmcEtu5',
  mapillary: 'https://www.mapillary.com/app/?pKey=227628268720356',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/\u003d/gi, '=')
    .replace(/\u0026/gi, '&')
    .replace(/\\\//g, '/');
}

function normalizeText(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchResponse(url, accept = '*/*') {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
        accept,
      },
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
      contentType: response.headers.get('content-type') ?? '',
      buffer,
      text: buffer.toString('utf8'),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      statusText: '',
      finalUrl: url,
      contentType: '',
      buffer: Buffer.alloc(0),
      text: '',
      error: String(error),
    };
  }
}

function extractImageUrls(html) {
  const decoded = decodeHtml(html);
  const found = new Set();
  const metaPatterns = [
    /<meta[^>]+(?:property|name|itemprop)=["'](?:og:image|twitter:image|image)["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["'](?:og:image|twitter:image|image)["']/gi,
  ];
  for (const pattern of metaPatterns) {
    for (const match of decoded.matchAll(pattern)) found.add(decodeHtml(match[1]));
  }
  for (const match of decoded.matchAll(/https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_~?=&%+.,:/@-]+/g)) found.add(match[0]);
  for (const match of decoded.matchAll(/https:\/\/scontent[^"'<>\s]+/g)) found.add(match[0]);
  return [...found].filter((url) => /^https:\/\//.test(url));
}

function extensionFor(contentType) {
  if (/png/i.test(contentType)) return 'png';
  if (/webp/i.test(contentType)) return 'webp';
  if (/gif/i.test(contentType)) return 'gif';
  return 'jpg';
}

function imageDimensions(buffer, contentType) {
  if (/png/i.test(contentType) && buffer.length >= 24 && buffer.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (/jpe?g/i.test(contentType) || (buffer[0] === 0xff && buffer[1] === 0xd8)) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      if (!Number.isFinite(length) || length < 2) break;
      offset += 2 + length;
    }
  }
  if (/webp/i.test(contentType) && buffer.length >= 30 && buffer.subarray(0, 4).toString('ascii') === 'RIFF') {
    const kind = buffer.subarray(12, 16).toString('ascii');
    if (kind === 'VP8X') {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height };
    }
  }
  return { width: null, height: null };
}

async function downloadFirstImage(sourceLabel, pageResult) {
  const urlsFound = pageResult.contentType.startsWith('image/')
    ? [pageResult.finalUrl]
    : extractImageUrls(pageResult.text);
  const attempts = [];
  for (const imageUrl of urlsFound.slice(0, 12)) {
    const result = await fetchResponse(imageUrl, 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
    attempts.push({
      imageUrl,
      ok: result.ok,
      status: result.status,
      finalUrl: result.finalUrl,
      contentType: result.contentType,
      bytes: result.buffer.length,
      error: result.error,
    });
    if (result.ok && result.contentType.startsWith('image/') && result.buffer.length > 5000) {
      const ext = extensionFor(result.contentType);
      const fileName = `${sourceLabel}.${ext}`;
      await writeFile(join(reportDir, fileName), result.buffer);
      const dimensions = imageDimensions(result.buffer, result.contentType);
      return {
        downloaded: true,
        file: `reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/${fileName}`,
        sourceUrl: imageUrl,
        finalUrl: result.finalUrl,
        contentType: result.contentType,
        bytes: result.buffer.length,
        sha256: sha256(result.buffer),
        ...dimensions,
        discoveredImageUrls: urlsFound,
        attempts,
      };
    }
  }
  return {
    downloaded: false,
    file: null,
    sourceUrl: null,
    finalUrl: null,
    contentType: null,
    bytes: 0,
    sha256: null,
    width: null,
    height: null,
    discoveredImageUrls: urlsFound,
    attempts,
  };
}

function haversineMeters(a, b) {
  const R = 6371008.8;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

await mkdir(reportDir, { recursive: true });
const [protocol, places, evidence, priorSummary, centralAudit] = await Promise.all([
  readFile(paths.protocol, 'utf8'),
  readJson(paths.place),
  readJson(paths.evidence),
  readJson(paths.priorSummary),
  readJson(paths.centralAudit),
]);

const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batchNumbers) === MAX_BATCH, `Protocol max batch must be ${MAX_BATCH}.`);
assert(protocol.includes('| 194 | `regjeringskvartalet` |'), 'Protocol does not end with merged batch 194 Regjeringskvartalet state.');
assert(centralAudit.coordinateMaxBatch === MAX_BATCH, 'Central audit is not post-194.');
assert(centralAudit.nextCandidate?.placeId === PLACE_ID, 'Central audit no longer ranks Sigrid Undset as next candidate.');
assert(evidence.placeId === PLACE_ID && evidence.evidenceStatus === 'needs_research' && evidence.coordinateDecision === 'needs_geometry', 'Evidence state changed since queue audit.');
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', 'Sigrid Undset is no longer unresolved.');
assert(priorSummary.placeId === PLACE_ID && priorSummary.candidate?.id === OSM_NODE_ID && priorSummary.canPromote === false, 'Prior exact-object research state changed.');

const placeMatches = places.filter((place) => place.id === PLACE_ID);
assert(placeMatches.length === 1, `Expected one canonical ${PLACE_ID}, got ${placeMatches.length}.`);
const place = placeMatches[0];
assert(Math.abs(place.lat - 59.9242) < 1e-10 && Math.abs(place.lon - 10.7297) < 1e-10, 'Legacy public marker changed unexpectedly.');

let osmResult = await fetchResponse(urls.osmApi, 'application/json');
if (!osmResult.ok) osmResult = await fetchResponse(urls.overpass, 'application/json');
assert(osmResult.ok, `Could not fetch exact OSM node: ${osmResult.status} ${osmResult.error ?? ''}`);
const osmPayload = JSON.parse(osmResult.text);
const osmElements = Array.isArray(osmPayload.elements) ? osmPayload.elements : [];
const nodeMatches = osmElements.filter((entry) => entry.type === 'node' && Number(entry.id) === OSM_NODE_ID);
assert(nodeMatches.length === 1, `Expected exact OSM node ${OSM_NODE_ID}, got ${nodeMatches.length}.`);
const node = nodeMatches[0];
assert(node.tags?.tourism === 'artwork' && node.tags?.artwork_type === 'statue', 'OSM node no longer has statue/artwork semantics.');
assert(node.tags?.image === urls.googlePhotos, 'OSM node image link changed.');
assert(String(node.tags?.mapillary) === '227628268720356', 'OSM node Mapillary key changed.');
assert(Math.abs(node.lat - 59.9242367) < 0.000001 && Math.abs(node.lon - 10.7294736) < 0.000001, 'OSM node coordinate drifted from merged research.');

const [artistResult, municipalityResult, googlePage, mapillaryPage] = await Promise.all([
  fetchResponse(urls.artist, 'text/html,*/*;q=0.8'),
  fetchResponse(urls.municipality, 'text/html,*/*;q=0.8'),
  fetchResponse(urls.googlePhotos, 'text/html,image/*,*/*;q=0.8'),
  fetchResponse(urls.mapillary, 'text/html,image/*,*/*;q=0.8'),
]);
assert(artistResult.ok, `Artist page fetch failed: ${artistResult.status} ${artistResult.error ?? ''}`);
assert(municipalityResult.ok, `Oslo municipality page fetch failed: ${municipalityResult.status} ${municipalityResult.error ?? ''}`);
const artistText = normalizeText(artistResult.text);
const municipalityText = normalizeText(municipalityResult.text);
const artistChecks = {
  title: /S\.\s*Undset\s*[–-]\s*Styrke/i.test(artistText),
  year1991: artistText.includes('1991'),
  granite: /Granitt/i.test(artistText),
  height282cm: /282\s*cm/i.test(artistText),
  purchasedByOslo: /Innkjøpt av Oslo kommune/i.test(artistText),
  stensparken: /står i Stensparken/i.test(artistText),
};
assert(Object.values(artistChecks).every(Boolean), `Artist-page identity/material gate failed: ${JSON.stringify(artistChecks)}`);
const municipalityChecks = {
  sigridUndset: /Sigrid Undset/i.test(municipalityText),
  sculpture: /skulptur/i.test(municipalityText),
  stensparken: /Stensparken/i.test(municipalityText),
};
assert(Object.values(municipalityChecks).every(Boolean), `Municipality identity gate failed: ${JSON.stringify(municipalityChecks)}`);

const googleImage = await downloadFirstImage('osm-google-photo', googlePage);
const mapillaryImage = await downloadFirstImage('osm-mapillary-preview', mapillaryPage);

const candidateCoordinate = { lat: node.lat, lon: node.lon };
const legacyCoordinate = { lat: place.lat, lon: place.lon };
const distanceFromLegacyM = haversineMeters(legacyCoordinate, candidateCoordinate);
const materialConflict = {
  authoritativeMaterial: 'granite',
  osmTagMaterial: node.tags?.material ?? null,
  conflict: String(node.tags?.material ?? '').toLowerCase() !== 'granite',
  resolutionRule: 'The OSM material tag cannot establish identity. The linked OSM/Mapillary imagery must be visually matched to the official artist-described granite work before production.',
};
const imageAvailableForManualReview = googleImage.downloaded || mapillaryImage.downloaded;
const decision = imageAvailableForManualReview
  ? 'manual_visual_crosscheck_of_exact_osm_linked_image_required'
  : 'keep_needs_source_image_endpoints_not_retrievable';

const pageChecks = {
  googlePhotos: {
    ok: googlePage.ok,
    status: googlePage.status,
    finalUrl: googlePage.finalUrl,
    contentType: googlePage.contentType,
    bytes: googlePage.buffer.length,
    sha256: googlePage.buffer.length ? sha256(googlePage.buffer) : null,
    error: googlePage.error,
  },
  mapillary: {
    ok: mapillaryPage.ok,
    status: mapillaryPage.status,
    finalUrl: mapillaryPage.finalUrl,
    contentType: mapillaryPage.contentType,
    bytes: mapillaryPage.buffer.length,
    sha256: mapillaryPage.buffer.length ? sha256(mapillaryPage.buffer) : null,
    error: mapillaryPage.error,
  },
};

const summary = {
  version: VERIFIED_AT,
  placeId: PLACE_ID,
  coordinateMaxBatch: MAX_BATCH,
  status: 'research_only',
  officialIdentity: {
    title: 'S. Undset – Styrke',
    artist: 'Kjersti Wexelsen Goksøyr',
    year: 1991,
    material: 'granite',
    heightWithoutBaseCm: 282,
    owner: 'Oslo kommune',
    location: 'Stensparken',
    sourceUrl: urls.artist,
    checks: artistChecks,
  },
  municipalityIdentity: {
    sourceUrl: urls.municipality,
    checks: municipalityChecks,
  },
  exactOsmCandidate: {
    type: node.type,
    id: node.id,
    lat: node.lat,
    lon: node.lon,
    tags: node.tags,
    sourceUrl: `https://www.openstreetmap.org/node/${OSM_NODE_ID}`,
    distanceFromLegacyM: Number(distanceFromLegacyM.toFixed(2)),
  },
  materialConflict,
  pageChecks,
  googleImage,
  mapillaryImage,
  imageAvailableForManualReview,
  canPromoteAutomatically: false,
  decision,
  productionConditions: [
    'A downloaded image linked directly from exact OSM node 7596280553 must visibly depict the official granite S. Undset – Styrke monument, including a distinctive match such as the elongated figure and/or Sigrid Undset pedestal inscription.',
    'The bronze material tag must be corrected or explicitly overridden by authoritative artist evidence; it cannot be silently accepted.',
    'A production batch must re-fetch the exact live node, preserve the official artist and Oslo municipality identity chain, and pass canonical collision checks.',
  ],
};

await writeJson(join(reportDir, 'summary.json'), summary);
await writeJson(join(reportDir, 'osm-node.json'), { elements: [node] });
await writeJson(join(reportDir, 'source-fetch-metadata.json'), pageChecks);

const readme = `# Sigrid Undset exact OSM-linked image crosscheck after batch 194\n\nDate: ${VERIFIED_AT}\n\nThis is a research-only pass. No canonical coordinate or evidence state is changed.\n\n## Authoritative object identity\n\nThe sculptor's own portfolio identifies the work as **S. Undset – Styrke** (1991), granite, 282 cm high without the base, purchased by Oslo municipality and installed in Stensparken. Oslo municipality independently identifies Sigrid Undset's sculpture in Stensparken as an official wreath-laying monument.\n\n## Exact OSM candidate\n\n- node: \`${OSM_NODE_ID}\`\n- coordinate: \`${node.lat}, ${node.lon}\`\n- distance from legacy marker: \`${distanceFromLegacyM.toFixed(2)} m\`\n- linked Google Photos image: \`${node.tags?.image ?? ''}\`\n- linked Mapillary key: \`${node.tags?.mapillary ?? ''}\`\n- OSM material tag: \`${node.tags?.material ?? '(missing)'}\`\n\nThe OSM material tag conflicts with the authoritative granite description. It is not used as proof of identity.\n\n## Decision\n\n\`${decision}\`\n\n${imageAvailableForManualReview ? 'At least one image linked from the exact OSM node was downloaded into this report for manual visual identity review.' : 'Neither linked image endpoint yielded a downloadable image in the runner environment, so the coordinate remains blocked.'}\n\nProduction remains forbidden until the exact linked image is visually confirmed as the official granite monument.\n`;
await writeFile(join(reportDir, 'README.md'), readme, 'utf8');

console.log(JSON.stringify({
  placeId: PLACE_ID,
  coordinateMaxBatch: MAX_BATCH,
  candidate: summary.exactOsmCandidate,
  authoritativeIdentity: summary.officialIdentity,
  materialConflict,
  googleImage: { downloaded: googleImage.downloaded, file: googleImage.file, bytes: googleImage.bytes, sha256: googleImage.sha256, width: googleImage.width, height: googleImage.height },
  mapillaryImage: { downloaded: mapillaryImage.downloaded, file: mapillaryImage.file, bytes: mapillaryImage.bytes, sha256: mapillaryImage.sha256, width: mapillaryImage.width, height: mapillaryImage.height },
  decision,
}, null, 2));
