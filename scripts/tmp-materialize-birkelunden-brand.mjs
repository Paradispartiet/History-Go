import fs from 'node:fs';

const placeId = 'birkelunden';
const brandId = 'bondens_marked';
const logoPath = 'bilder/kort/brands/bondens_marked.webp';
const masterPath = 'data/brands/brands_master.json';
const byPlacePath = 'data/brands/brands_by_place.json';

if (!fs.existsSync(logoPath)) {
  throw new Error(`Missing generated authentic wordmark asset: ${logoPath}`);
}

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
if (!Array.isArray(master)) throw new Error('brands_master.json must be an array');

const existing = master.find(item => item?.id === brandId);
if (existing) {
  throw new Error(`${brandId} already exists; abort one-shot materializer instead of overwriting canonical data`);
}

const bytes = fs.statSync(logoPath).size;
const brand = {
  id: brandId,
  name: 'Bondens marked',
  aliases: ['Bondens Marked'],
  brand_group: 'venue_brand',
  brand_type: 'farmers_market_brand',
  brand_kind: 'brand',
  sector: 'food_and_drink',
  state: 'catalog',
  status: 'active',
  verification: 'verified',
  verified_at: '2026-08-23',
  popupdesc: 'Bondens marked er et beskyttet norsk markedsnavn etablert i 2003. Organisasjonen oppgir selv gjentatte markedsdager i Birkelunden og bruker stedet som fast markedsplass i Oslo.',
  desc: 'Nasjonalt lokalmat- og produsentmarked med dokumentert, gjentatt tilstedeværelse i Birkelunden.',
  tags: ['brand', 'farmers_market', 'local_food', 'birkelunden', 'oslo'],
  place_ids: [placeId],
  source_urls: [
    'https://bondensmarked.no/om-oss',
    'https://bondensmarked.no/markedsplasser/birkelunden-gr-nerloekka',
    'https://bondensmarked.no/om-oss/bilder'
  ],
  logo: logoPath,
  imageMeta: {
    sourcePage: 'https://bondensmarked.no/om-oss/bilder',
    sourceAsset: 'https://res.cloudinary.com/hanen/image/upload/b_rgb%3Af8f8f9%2Cc_pad%2Cdpr_2%2Ch_700%2Cq_70%2Cw_1050/v1/BM/ct9bxkxkv5nzqrf8vrmx.jpg',
    creator: 'Tore Berntsen',
    credit: 'Bondens marked / Tore Berntsen',
    rightsBasis: 'explicit_media_reuse_permission_on_source_page',
    rightsNote: 'Bondens markeds egen Bilderside sier at illustrasjonsbildene er til bruk for media og andre som måtte trenge det. Assetet er kun et crop av et autentisk, synlig Bondens marked-ordmerke i det oppgitte mediebildet.',
    temporalScope: 'current',
    assetKind: 'logo',
    sourceForm: 'authentic_wordmark_on_official_media_image',
    transformation: 'crop of authentic Bondens marked wordmark printed on an official market bag; resize and WebP normalization only',
    reviewStatus: 'manually_approved',
    usageContext: 'referential_identification',
    noEndorsement: true,
    generated: false,
    reconstructed: false,
    width: 900,
    height: 520,
    bytes,
    reviewedAt: '2026-08-23'
  }
};

master.push(brand);
fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`);

const byPlace = JSON.parse(fs.readFileSync(byPlacePath, 'utf8'));
const previous = Array.isArray(byPlace[placeId]) ? byPlace[placeId] : [];
const next = [...new Set([...previous, brandId])];
byPlace[placeId] = next;
fs.writeFileSync(byPlacePath, `${JSON.stringify(byPlace, null, 2)}\n`);

console.log(JSON.stringify({ brandId, placeId, logoPath, bytes, mapping: next }, null, 2));
