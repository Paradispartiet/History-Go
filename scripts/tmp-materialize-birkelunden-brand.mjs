import fs from 'node:fs';

const placeId = 'birkelunden';
const brandId = 'bondens_marked';
const logoPath = 'bilder/kort/brands/bondens_marked.png';
const masterPath = 'data/brands/brands_master.json';
const byPlacePath = 'data/brands/brands_by_place.json';

if (!fs.existsSync(logoPath)) {
  throw new Error(`Missing official Bondens marked logo asset: ${logoPath}`);
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
  verified_at: '2026-08-24',
  popupdesc: 'Bondens marked er et norsk markedsnavn etablert i 2003. Organisasjonen oppgir selv gjentatte markedsdager i Birkelunden og bruker stedet som fast markedsplass i Oslo.',
  desc: 'Nasjonalt lokalmat- og produsentmarked med dokumentert, gjentatt tilstedeværelse i Birkelunden.',
  tags: ['brand', 'farmers_market', 'local_food', 'birkelunden', 'oslo'],
  place_ids: [placeId],
  source_urls: [
    'https://bondensmarked.no/om-oss',
    'https://bondensmarked.no/markedsplasser/birkelunden-gr-nerloekka',
    'https://kommunikasjon.ntb.no/presserom/17848583/bondensmarked/mi?item=logo-17981723'
  ],
  logo: logoPath,
  imageMeta: {
    sourcePage: 'https://kommunikasjon.ntb.no/presserom/17848583/bondensmarked/mi?item=logo-17981723',
    sourceAsset: 'https://kommunikasjon.ntb.no/data/images/00438/af74f0cb-914c-4614-a0e6-0c1ff9c4c611.png',
    creator: 'Bondens marked',
    credit: 'Bondens marked / NTB Kommunikasjon mediebank',
    rightsBasis: 'referential_trademark_identification',
    rightsNote: 'Official PNG logo distributed in the Bondens marked press-room media bank and stored locally only for referential identification. No endorsement is implied.',
    temporalScope: 'current',
    assetKind: 'logo',
    sourceForm: 'official_pressroom_logo_asset',
    transformation: 'downloaded unchanged from the official Bondens marked NTB press-room media bank',
    reviewStatus: 'manually_approved',
    usageContext: 'referential_identification',
    noEndorsement: true,
    generated: false,
    reconstructed: false,
    bytes,
    reviewedAt: '2026-08-24'
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
