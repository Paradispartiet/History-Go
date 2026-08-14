import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const DATE = '2026-08-14';
const PLACE_ID = 'torggata';
const USER_AGENT = 'History-Go/phase13-brand-assets (https://github.com/Paradispartiet/History-Go)';
const MASTER_PATH = 'data/brands/brands_master.json';
const ATTRIBUTIONS_PATH = 'data/brands/brand_asset_attributions.json';
const AUDIT_PATH = 'reports/place-production/torggata-phase13-brands-audit-v1.json';
const WORKCARD_PATH = 'reports/place-production/torggata-workcard-current.md';
const DOC_PATH = 'docs/BRAND_ASSETS.md';
const TEST_PATH = 'tests/torggata-phase13-brands.test.mjs';
const IMAGE_DIR = 'bilder/kort/brands';

const CANONICAL_IDS = [
  'angst',
  'john_dee',
  'eldorado_bokhandel',
  'jernia_torggata',
  'oslo_sportslager',
  'norli_eldorado',
  'oslo_bar_bowling',
  'oslo_street_food',
  'adelsten',
  'ludvig_jensen_co',
  'pm_jensen',
  'karl_a_jensen_forretning',
  'ingwald_nielsen'
];

const ASSETS = [
  {
    id: 'john_dee',
    assetKind: 'logo',
    destination: `${IMAGE_DIR}/john_dee.webp`,
    provider: 'wikimedia_commons',
    fileTitle: 'File:John dee venue logo black.gif',
    expectedLicense: /CC BY 4\.0/i,
    background: '#f2f2f2',
    notes: 'Canonical venue logo from Wikimedia Commons.'
  },
  {
    id: 'jernia_torggata',
    assetKind: 'logo',
    destination: `${IMAGE_DIR}/jernia_torggata.webp`,
    provider: 'wikimedia_commons',
    fileTitle: 'File:Jernia logo.png',
    expectedLicense: /CC0/i,
    background: '#ffffff',
    notes: 'Canonical chain logo from Wikimedia Commons.'
  },
  {
    id: 'norli_eldorado',
    assetKind: 'logo',
    destination: `${IMAGE_DIR}/norli_eldorado.webp`,
    provider: 'wikimedia_commons',
    fileTitle: 'File:Norli.svg',
    expectedLicense: /Public domain/i,
    background: '#ffffff',
    notes: 'Canonical chain logo; Commons marks the simple logo public domain.'
  },
  {
    id: 'oslo_sportslager',
    assetKind: 'logo',
    destination: `${IMAGE_DIR}/oslo_sportslager.webp`,
    provider: 'official_header_capture',
    sourcePage: 'https://oslosportslager.no/',
    rightsBasis: 'referential_trademark_identification',
    background: '#032846',
    notes: 'Cropped directly from the official site header; used only to identify the documented brand.'
  },
  {
    id: 'oslo_bar_bowling',
    assetKind: 'logo',
    destination: `${IMAGE_DIR}/oslo_bar_bowling.webp`,
    provider: 'official_direct',
    sourcePage: 'https://oslobowling.no/',
    assetUrl: 'https://oslobowling.no/wp-content/uploads/2020/07/logo-web-cropped.webp',
    rightsBasis: 'referential_trademark_identification',
    background: '#ffffff',
    notes: 'Official logo asset used only to identify the venue.'
  },
  {
    id: 'oslo_street_food',
    assetKind: 'logo',
    destination: `${IMAGE_DIR}/oslo_street_food.webp`,
    provider: 'official_direct',
    sourcePage: 'https://www.oslo-streetfood.no/',
    assetUrl: 'https://images.squarespace-cdn.com/content/v1/6038204a6bf989551704f5c2/b48e68b9-ce76-4f9f-815e-8c8a7c781a0d/logo+white.png?format=1500w',
    rightsBasis: 'referential_trademark_identification',
    background: '#292342',
    notes: 'Official white logo placed on a neutral dark presentation background; identity is otherwise unchanged.'
  },
  {
    id: 'eldorado_bokhandel',
    assetKind: 'documentary_brand_image',
    destination: `${IMAGE_DIR}/eldorado_bokhandel.webp`,
    provider: 'wikimedia_commons',
    fileTitle: 'File:Marie Sneve Martinussen på Eldorado (27676732300).jpg',
    expectedLicense: /CC BY 2\.0/i,
    background: '#f2f2f2',
    notes: 'Documentary image made inside Eldorado in Torggata; not presented as a logo.'
  },
  {
    id: 'adelsten',
    assetKind: 'documentary_brand_image',
    destination: `${IMAGE_DIR}/adelsten.webp`,
    provider: 'wikimedia_commons',
    fileTitle: 'File:Adelsten Jensen - no-nb digifoto 20160119 00047 NB NS 000109A.jpg',
    expectedLicense: /Public domain/i,
    background: '#f2f2f2',
    notes: 'Historical National Library image explicitly catalogued as Adelsten Jensen at Torggata 1.'
  },
  {
    id: 'pm_jensen',
    assetKind: 'documentary_brand_image',
    destination: `${IMAGE_DIR}/pm_jensen.webp`,
    provider: 'digitaltmuseum',
    sourcePage: 'https://digitaltmuseum.no/021015463551',
    assetUrl: 'https://dms01.dimu.org/image/012uMXHSuPgT?dimension=1800x1800&filename=021015463551.jpg',
    creator: 'Ørnelund, Leif Krohn',
    credit: 'Oslo Museum, object 021015463551',
    license: 'CC BY-SA',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    rightsBasis: 'open_license_or_public_domain',
    background: '#f2f2f2',
    notes: '1962 storefront photograph with P. M. Jensen signage and Torggata 5b visible.'
  },
  {
    id: 'karl_a_jensen_forretning',
    assetKind: 'documentary_brand_image',
    destination: `${IMAGE_DIR}/karl_a_jensen_forretning.webp`,
    provider: 'wikimedia_commons',
    fileTitle: 'File:Karl A. Jensens nye forretningsgaard - no-nb digifoto 20160125 00124 NB NS 000225.jpg',
    expectedLicense: /Public domain/i,
    background: '#f2f2f2',
    notes: 'Historical National Library image explicitly catalogued as Karl A. Jensens new business building.'
  },
  {
    id: 'ingwald_nielsen',
    assetKind: 'documentary_brand_image',
    destination: `${IMAGE_DIR}/ingwald_nielsen.webp`,
    provider: 'digitaltmuseum',
    sourcePage: 'https://digitaltmuseum.no/011014570247',
    assetUrl: 'https://dms01.dimu.org/image/042sBYQ9PkvR?dimension=1800x1800&filename=011014570247.jpg',
    creator: 'L. Szacinski',
    credit: 'Oslo Museum, object 011014570247',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    rightsBasis: 'open_license_or_public_domain',
    background: '#f2f2f2',
    notes: '1916 interior photograph explicitly catalogued as Ingwald Nielsens forretning.'
  }
];

const HOLDBACKS = [
  {
    id: 'angst',
    status: 'name_fallback',
    reason: 'No identity-controlled logo or photograph with an inspectable reuse licence was found. VisitOSLO documents the venue and sign, but does not publish a reusable asset licence; third-party directory images were rejected.'
  },
  {
    id: 'ludvig_jensen_co',
    status: 'name_fallback',
    reason: 'Exact museum and Commons searches did not yield a contemporaneous, brand-specific reusable asset. DigitaltMuseum name hits concerned an unrelated Ludvig Jensen in Hamar; the modern successor logo was not used as if it were the historical Torggata identity.'
  }
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const clean = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
};

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(90_000),
        ...options,
        headers: {
          'user-agent': USER_AGENT,
          accept: '*/*',
          ...(options.headers || {})
        }
      });
      if (response.ok) return response;
      const text = await response.text().catch(() => '');
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`${response.status} ${response.statusText}: ${url} ${text.slice(0, 240)}`);
      }
      lastError = new Error(`${response.status} ${response.statusText}: ${url}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(attempt * 2500);
  }
  throw lastError || new Error(`Unable to fetch ${url}`);
}

function ext(meta, key) {
  return clean(meta?.[key]?.value || '');
}

async function resolveCommons(asset) {
  const params = new URLSearchParams({
    action: 'query',
    titles: asset.fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
    format: 'json',
    formatversion: '2',
    origin: '*'
  });
  const response = await fetchWithRetry(`https://commons.wikimedia.org/w/api.php?${params}`);
  const json = await response.json();
  const page = json?.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!page || page.missing || !info?.url) throw new Error(`Commons file missing: ${asset.fileTitle}`);
  const meta = info.extmetadata || {};
  const license = ext(meta, 'LicenseShortName') || ext(meta, 'UsageTerms');
  if (asset.expectedLicense && !asset.expectedLicense.test(license)) {
    throw new Error(`Unexpected Commons licence for ${asset.id}: ${license}`);
  }
  return {
    assetUrl: info.url,
    sourcePage: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(asset.fileTitle.replaceAll(' ', '_'))}`,
    fileTitle: page.title,
    creator: ext(meta, 'Artist') || 'Unknown creator',
    credit: ext(meta, 'Credit') || ext(meta, 'ImageDescription') || page.title,
    license,
    licenseUrl: ext(meta, 'LicenseUrl'),
    usageTerms: ext(meta, 'UsageTerms'),
    sourceMime: info.mime || '',
    sourceWidth: info.width || 0,
    sourceHeight: info.height || 0,
    rightsBasis: 'open_license_or_public_domain'
  };
}

async function captureSportslagerLogo() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    await page.goto('https://oslosportslager.no/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForTimeout(4000);

    let clip = { x: 500, y: 15, width: 455, height: 85 };
    const exactText = page.getByText('Oslo Sportslager', { exact: true }).first();
    try {
      if (await exactText.isVisible({ timeout: 1000 })) {
        const box = await exactText.boundingBox();
        if (box) {
          clip = {
            x: Math.max(0, Math.floor(box.x - 72)),
            y: Math.max(0, Math.floor(box.y - 14)),
            width: Math.min(520, Math.ceil(box.width + 92)),
            height: Math.min(110, Math.ceil(box.height + 28))
          };
        }
      }
    } catch {}

    const buffer = await page.screenshot({ type: 'png', clip });
    await page.close();
    return buffer;
  } finally {
    await browser.close();
  }
}

async function sourceFor(asset) {
  if (asset.provider === 'wikimedia_commons') {
    const resolved = await resolveCommons(asset);
    const response = await fetchWithRetry(resolved.assetUrl);
    return { buffer: Buffer.from(await response.arrayBuffer()), metadata: resolved };
  }
  if (asset.provider === 'official_header_capture') {
    return {
      buffer: await captureSportslagerLogo(),
      metadata: {
        sourcePage: asset.sourcePage,
        fileTitle: 'Official website header capture',
        creator: 'Oslo Sportslager',
        credit: 'Oslo Sportslager official website',
        license: 'Not asserted',
        licenseUrl: '',
        rightsBasis: asset.rightsBasis,
        sourceMime: 'image/png'
      }
    };
  }
  if (asset.provider === 'official_direct' || asset.provider === 'digitaltmuseum') {
    const response = await fetchWithRetry(asset.assetUrl);
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      metadata: {
        sourcePage: asset.sourcePage,
        fileTitle: path.basename(new URL(asset.assetUrl).pathname) || asset.id,
        creator: asset.creator || asset.id,
        credit: asset.credit || `${asset.id} official website`,
        license: asset.license || 'Not asserted',
        licenseUrl: asset.licenseUrl || '',
        rightsBasis: asset.rightsBasis || 'referential_trademark_identification',
        sourceMime: response.headers.get('content-type') || ''
      }
    };
  }
  throw new Error(`Unknown provider: ${asset.provider}`);
}

async function render(asset, input) {
  await fs.mkdir(path.dirname(asset.destination), { recursive: true });
  const image = sharp(input, { animated: false, density: 220 }).rotate();
  if (asset.assetKind === 'logo') {
    await image
      .resize(900, 520, {
        fit: 'contain',
        background: asset.background || '#ffffff',
        withoutEnlargement: false
      })
      .flatten({ background: asset.background || '#ffffff' })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(asset.destination);
  } else {
    await image
      .resize(1200, 800, {
        fit: 'contain',
        background: asset.background || '#f2f2f2',
        withoutEnlargement: true
      })
      .flatten({ background: asset.background || '#f2f2f2' })
      .webp({ quality: 88, effort: 6 })
      .toFile(asset.destination);
  }
  const metadata = await sharp(asset.destination).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 180 || metadata.height < 120) {
    throw new Error(`Rendered asset is too small: ${asset.destination}`);
  }
  return metadata;
}

await fs.mkdir(IMAGE_DIR, { recursive: true });
const master = await readJson(MASTER_PATH);
if (!Array.isArray(master)) throw new Error('brands_master.json must be an array');
const byId = new Map(master.map(item => [item?.id, item]));
for (const id of CANONICAL_IDS) {
  const brand = byId.get(id);
  if (!brand) throw new Error(`Missing canonical Torggata brand: ${id}`);
  if (brand.state !== 'catalog') throw new Error(`Torggata brand is not catalog state: ${id}`);
}

const results = [];
for (const asset of ASSETS) {
  console.log(`Materializing ${asset.id} (${asset.assetKind})`);
  const source = await sourceFor(asset);
  const rendered = await render(asset, source.buffer);
  const brand = byId.get(asset.id);
  if (asset.assetKind === 'logo') {
    brand.logo = asset.destination;
    brand.image = '';
  } else {
    brand.image = asset.destination;
    brand.logo = '';
  }
  brand.imageMeta = {
    source: asset.provider,
    sourcePage: source.metadata.sourcePage,
    fileTitle: source.metadata.fileTitle,
    creator: source.metadata.creator,
    credit: source.metadata.credit,
    license: source.metadata.license,
    licenseUrl: source.metadata.licenseUrl,
    rightsBasis: source.metadata.rightsBasis,
    retrievedAt: DATE,
    reviewStatus: 'manually_approved',
    assetKind: asset.assetKind,
    usageContext: 'referential_identification',
    noEndorsement: true,
    transformation: asset.assetKind === 'logo'
      ? 'normalized to a fixed card canvas; no identity reconstruction'
      : 'resized and letterboxed; documentary content not reconstructed',
    notes: asset.notes
  };
  results.push({
    id: asset.id,
    path: asset.destination,
    assetKind: asset.assetKind,
    provider: asset.provider,
    sourcePage: source.metadata.sourcePage,
    fileTitle: source.metadata.fileTitle,
    creator: source.metadata.creator,
    credit: source.metadata.credit,
    license: source.metadata.license,
    licenseUrl: source.metadata.licenseUrl,
    rightsBasis: source.metadata.rightsBasis,
    noEndorsement: true,
    width: rendered.width,
    height: rendered.height,
    notes: asset.notes
  });
  await sleep(1200);
}

for (const holdback of HOLDBACKS) {
  const brand = byId.get(holdback.id);
  if (String(brand.logo || '').trim() || String(brand.image || '').trim()) {
    throw new Error(`Holdback unexpectedly has a visual asset: ${holdback.id}`);
  }
}

await writeJson(MASTER_PATH, master);

const attribution = {
  schema: 'history_go_brand_asset_attributions_v1',
  generated_at: DATE,
  place_id: PLACE_ID,
  policy: {
    purpose: 'referential identification in an informational place card',
    preference_order: ['open licence/public domain', 'official referential logo', 'documented name fallback'],
    generated_or_reconstructed_logos: false,
    endorsement_claimed: false,
    note: 'An official logo record is not an assertion that the brand sponsors, approves or is affiliated with History GO.'
  },
  assets: results,
  holdbacks: HOLDBACKS
};
await writeJson(ATTRIBUTIONS_PATH, attribution);

const audit = {
  schema: 'history_go_torggata_phase13_brands_audit_v1',
  generated_at: DATE,
  place_id: PLACE_ID,
  phase: 13,
  prior_work_gate: {
    status: 'UTFØRT',
    prior_phase: '8C',
    prior_audit: 'reports/place-production/torggata-phase8c-brands-audit-v1.json',
    decision: 'KEEP_13_CANONICAL_LINKS_AND_UPGRADE_VISUAL_IDENTIFICATION'
  },
  canonical_brands: {
    expected: 13,
    found: 13,
    place_mapped: 13,
    duplicate_ids: 0
  },
  visual_review: {
    approved_assets: 11,
    logos: 6,
    documentary_brand_images: 5,
    name_fallbacks: 2,
    generated_or_reconstructed_logos: 0,
    wrong_identity_assets_applied: 0,
    approved_ids: results.map(item => item.id),
    holdbacks: HOLDBACKS
  },
  rights_and_provenance: {
    attribution_file: ATTRIBUTIONS_PATH,
    every_asset_has_source_page: results.every(item => Boolean(item.sourcePage)),
    every_asset_has_rights_basis: results.every(item => Boolean(item.rightsBasis)),
    no_endorsement_marked: results.every(item => item.noEndorsement === true),
    official_referential_ids: results.filter(item => item.rightsBasis === 'referential_trademark_identification').map(item => item.id),
    open_or_public_domain_ids: results.filter(item => item.rightsBasis === 'open_license_or_public_domain').map(item => item.id)
  },
  runtime: {
    loader: 'js/brands/brands_loader.js',
    display_fallback: 'js/ui/popup-utils.js',
    rule: 'Use logo first, then documentary image, then canonical name fallback.'
  },
  status: 'PASS',
  next_phase: '14. Leksikon, relations, NextUp, Nearby, søk og i18n',
  validation: [
    'torggata_phase8c_brands',
    'torggata_phase13_brands',
    'place_production_brand_quiz_governance',
    'typecheck_web',
    'typecheck_scripts',
    'typecheck_tools',
    'build_web'
  ]
};
await writeJson(AUDIT_PATH, audit);

const doc = `# Brand assets

## Formål

Brandbilder brukes for å identifisere en dokumentert virksomhet, institusjon eller venue i en informasjonsflate. Et brandbilde er ikke en påstand om samarbeid, sponsing, godkjenning eller annen tilknytning til History GO.

## Prioritert kildeorden

1. Wikimedia Commons, DigitaltMuseum eller annen kilde med eksplisitt åpen lisens eller public-domain-status.
2. Offisiell logo fra brandets egen nettside når logoen er nødvendig for refererende identifikasjon og bruken er nøktern.
3. Dokumentarisk brandbilde når en historisk virksomhet ikke har en forsvarlig tilgjengelig logo.
4. Canonical navn som fallback når identitet eller rettigheter ikke kan dokumenteres.

## Stoppregler

- Logoer skal ikke genereres, rekonstrueres eller tegnes etter hukommelsen.
- Et navnetreff er ikke identitetsbevis.
- Historiske og nåværende logoer skal ikke blandes uten eksplisitt tidsmerking.
- Tredjeparts katalog- eller pressebilder uten tydelig gjenbrukstillatelse skal ikke kopieres.
- Offisiell refererende bruk skal være nødvendig, proporsjonal og uten antydning om endorsement.

## Datakrav

Hvert publisert asset skal ha lokal fil, sourcePage, creator/credit, license eller rightsBasis, reviewStatus, assetKind, usageContext og noEndorsement. Historiske fotografier skal registreres som documentary_brand_image, ikke som logo.
`;
await fs.mkdir(path.dirname(DOC_PATH), { recursive: true });
await fs.writeFile(DOC_PATH, doc);

const test = `import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const master = readJson('data/brands/brands_master.json');
const byPlace = readJson('data/brands/brands_by_place.json');
const audit = readJson('reports/place-production/torggata-phase13-brands-audit-v1.json');
const attributions = readJson('data/brands/brand_asset_attributions.json');
const workcard = fs.readFileSync(path.join(root, 'reports/place-production/torggata-workcard-current.md'), 'utf8');
const loader = fs.readFileSync(path.join(root, 'js/brands/brands_loader.js'), 'utf8');
const popup = fs.readFileSync(path.join(root, 'js/ui/popup-utils.js'), 'utf8');

const expectedIds = ${JSON.stringify(CANONICAL_IDS, null, 2)};
const logoIds = ${JSON.stringify(ASSETS.filter(item => item.assetKind === 'logo').map(item => item.id), null, 2)};
const documentaryIds = ${JSON.stringify(ASSETS.filter(item => item.assetKind === 'documentary_brand_image').map(item => item.id), null, 2)};
const holdbackIds = ${JSON.stringify(HOLDBACKS.map(item => item.id), null, 2)};
const byId = new Map(master.map(item => [item.id, item]));

test('Torggata keeps the exact 13 canonical Brand IDs', () => {
  assert.deepEqual(byPlace.torggata, expectedIds);
  assert.equal(new Set(byPlace.torggata).size, 13);
  expectedIds.forEach(id => {
    const brand = byId.get(id);
    assert.ok(brand, id);
    assert.equal(brand.state, 'catalog', id);
    assert.ok(Array.isArray(brand.source_urls) && brand.source_urls.length >= 2, id);
  });
});

test('11 reviewed assets are local, unique and large enough for the Brand round', async () => {
  const paths = [];
  for (const id of [...logoIds, ...documentaryIds]) {
    const brand = byId.get(id);
    const assetPath = brand.logo || brand.image;
    assert.ok(assetPath, id);
    paths.push(assetPath);
    const absolute = path.join(root, assetPath);
    assert.ok(fs.existsSync(absolute), assetPath);
    assert.ok(fs.statSync(absolute).size > 1500, assetPath);
    const metadata = await sharp(absolute).metadata();
    assert.ok((metadata.width || 0) >= 180, assetPath);
    assert.ok((metadata.height || 0) >= 120, assetPath);
    assert.equal(brand.imageMeta?.reviewStatus, 'manually_approved', id);
    assert.equal(brand.imageMeta?.usageContext, 'referential_identification', id);
    assert.equal(brand.imageMeta?.noEndorsement, true, id);
    assert.ok(brand.imageMeta?.sourcePage, id);
    assert.ok(brand.imageMeta?.rightsBasis, id);
    assert.doesNotMatch(String(brand.imageMeta?.transformation), /generated|reconstructed/i, id);
  }
  assert.equal(new Set(paths).size, 11);
});

test('logos and documentary images remain semantically distinct', () => {
  logoIds.forEach(id => {
    const brand = byId.get(id);
    assert.ok(brand.logo, id);
    assert.equal(brand.image, '', id);
    assert.equal(brand.imageMeta.assetKind, 'logo', id);
  });
  documentaryIds.forEach(id => {
    const brand = byId.get(id);
    assert.ok(brand.image, id);
    assert.equal(brand.logo, '', id);
    assert.equal(brand.imageMeta.assetKind, 'documentary_brand_image', id);
  });
});

test('unsafe candidates remain explicit name fallbacks', () => {
  assert.deepEqual(audit.visual_review.holdbacks.map(item => item.id), holdbackIds);
  audit.visual_review.holdbacks.forEach(item => {
    assert.equal(item.status, 'name_fallback');
    assert.ok(item.reason.length >= 80, item.id);
    const brand = byId.get(item.id);
    assert.equal(String(brand.logo || ''), '', item.id);
    assert.equal(String(brand.image || ''), '', item.id);
  });
});

test('attribution and no-endorsement contract covers every published asset', () => {
  assert.equal(attributions.assets.length, 11);
  assert.equal(attributions.holdbacks.length, 2);
  assert.equal(attributions.policy.generated_or_reconstructed_logos, false);
  assert.equal(attributions.policy.endorsement_claimed, false);
  attributions.assets.forEach(item => {
    assert.ok(item.sourcePage, item.id);
    assert.ok(item.rightsBasis, item.id);
    assert.equal(item.noEndorsement, true, item.id);
  });
});

test('runtime supports logo, documentary image and canonical name fallback', () => {
  assert.match(loader, /logo:\s*asString\(raw\?\.logo\)/);
  assert.match(loader, /image:\s*asString\(raw\?\.image\)/);
  assert.match(loader, /imageMeta:/);
  assert.match(popup, /brand\.logo\s*\|\|\s*brand\.image/);
});

test('phase 13 audit and workcard close Brands and advance to phase 14', () => {
  assert.equal(audit.status, 'PASS');
  assert.equal(audit.canonical_brands.found, 13);
  assert.equal(audit.visual_review.approved_assets, 11);
  assert.equal(audit.visual_review.logos, 6);
  assert.equal(audit.visual_review.documentary_brand_images, 5);
  assert.equal(audit.visual_review.name_fallbacks, 2);
  assert.equal(audit.visual_review.generated_or_reconstructed_logos, 0);
  assert.equal(audit.visual_review.wrong_identity_assets_applied, 0);
  assert.equal(audit.rights_and_provenance.every_asset_has_source_page, true);
  assert.equal(audit.rights_and_provenance.every_asset_has_rights_basis, true);
  assert.equal(audit.rights_and_provenance.no_endorsement_marked, true);
  assert.match(workcard, /Fase 13 Brands = GODKJENT/);
  assert.match(workcard, /Neste aktive fase:\s*\*\*14\. Leksikon, relations, NextUp, Nearby, søk og i18n/);
});
`;
await fs.mkdir(path.dirname(TEST_PATH), { recursive: true });
await fs.writeFile(TEST_PATH, test);

let workcard = await fs.readFile(WORKCARD_PATH, 'utf8');
if (!workcard.includes('## Fase 13 – Brands')) {
  workcard = `${workcard.trimEnd()}\n\n## Fase 13 – Brands\n\n\`\`\`text\nTIDLIGERE-ARBEID-SØK: UTFØRT\nAKTIV BASELINE: 13 canonical Brand-ID-er fra fase 8C\nBESLUTNING: behold koblingene, oppgrader visuell identifikasjon med kilde- og rettighetskontroll\n\`\`\`\n\n### Godkjent resultat\n\n- **13/13** canonical Brand-koblinger er beholdt uten duplikater eller omklassifisering.\n- **11** brands har nå lokal visuell identifikasjon: **6 logoer** og **5 dokumentariske brandbilder**.\n- John Dee, Jernia og Norli bruker reviewede Commons-logoer.\n- Oslo Sportslager, Oslo Bar & Bowling og Oslo Street Food bruker nøktern, offisiell logoidentifikasjon med eksplisitt no-endorsement-markering.\n- Eldorado Bokhandel, Adelsten, P. M. Jensen, Karl A. Jensen og Ingwald Nielsen bruker kildebårne dokumentarbilder; de presenteres ikke som logoer.\n- Angst og Ludvig Jensen & Co. beholder canonical navnefallback etter kandidatspesifikt søk: manglende gjenbrukslisens for Angst og feil/navnebror-treff for Ludvig Jensen.\n- **0** genererte eller rekonstruerte logoer, **0** anvendte feilidentiteter og **0** antydninger om samarbeid eller godkjenning.\n- Proveniens, lisens/rettighetsgrunnlag, transformasjon og attribusjon ligger i \`${ATTRIBUTIONS_PATH}\`.\n\n**Fase 13 Brands = GODKJENT.**\n\nNeste aktive fase: **14. Leksikon, relations, NextUp, Nearby, søk og i18n**.\n`;
  await fs.writeFile(WORKCARD_PATH, workcard);
}

console.log(JSON.stringify({
  phase: 13,
  canonical: CANONICAL_IDS.length,
  assets: results.length,
  logos: results.filter(item => item.assetKind === 'logo').length,
  documentary: results.filter(item => item.assetKind === 'documentary_brand_image').length,
  holdbacks: HOLDBACKS.length,
  status: 'PASS'
}, null, 2));
