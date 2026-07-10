#!/usr/bin/env node
/**
 * Address-first coordinate finder for History Go.
 *
 * Norske steder med konkret adresse skal bruke Geonorge Adresser API før
 * Nominatim/OSM/POI-søk. Dette verktøyet endrer ikke place-data; det finner og
 * skriver en Coordinate Source Contract v1-kandidat som kan brukes i en senere
 * source-fix PR.
 *
 * Eksempel:
 *   npm run places:coords:find:address -- --address "Langkaia 1 Oslo"
 */

const GEONORGE_ADRESSER_API = 'https://ws.geonorge.no/adresser/v1/sok';

type AddressResult = {
  adressenavn?: string;
  adressetekst?: string;
  nummer?: number | string;
  bokstav?: string | null;
  kommunenummer?: string;
  kommunenavn?: string;
  adressekode?: number | string;
  postnummer?: string;
  poststed?: string;
  representasjonspunkt?: {
    epsg?: string;
    lat?: number;
    lon?: number;
  };
};

type FinderResult = {
  ok: boolean;
  status: 'verified_candidate' | 'needs_review' | 'not_found' | 'error';
  reason: string;
  query: string;
  sourceProvider?: 'official_address';
  sourceName?: string;
  sourceUrl?: string;
  sourceObjectId?: string;
  coordinate?: {
    lat: number;
    lon: number;
    r: number;
    locatorType: 'building';
    sourceProvider: 'official_address';
    sourceObjectId: string;
    address: {
      street: string;
      number: string;
      postcode: string;
      city: string;
      country: 'NO';
    };
    geocodeAccuracy: 'rooftop';
    coordRole: 'display_marker';
    coordStatus: 'verified';
    coordSource: 'geonorge_adresser_v1';
    coordType: 'address_point';
    coordNote: string;
  };
  rawHit?: AddressResult;
};

function parseArgs(argv: string[]) {
  const args: { address?: string; city?: string; help?: boolean } = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--help' || t === '-h') args.help = true;
    else if (t === '--address') args.address = argv[++i];
    else if (t.startsWith('--address=')) args.address = t.slice('--address='.length);
    else if (t === '--city') args.city = argv[++i];
    else if (t.startsWith('--city=')) args.city = t.slice('--city='.length);
  }
  return args;
}

function hasText(v: unknown) {
  return typeof v === 'string' && v.trim().length > 0;
}

function norm(s: unknown) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceObjectId(hit: AddressResult) {
  const kommune = String(hit.kommunenummer ?? '').trim();
  const kode = String(hit.adressekode ?? '').trim();
  const nr = String(hit.nummer ?? '').trim();
  const bokstav = String(hit.bokstav ?? '').trim();
  return `geonorge-adresser-v1:${kommune}:${kode}:${nr}${bokstav}`;
}

function findBestHit(query: string, hits: AddressResult[]): { hit?: AddressResult; reason: string } {
  if (!hits.length) return { reason: 'Geonorge returnerte ingen adressetreff.' };

  const q = norm(query);
  const exact = hits.filter((h) => {
    const text = norm(h.adressetekst);
    const withPoststed = norm(`${h.adressetekst ?? ''} ${h.poststed ?? ''}`);
    const withKommune = norm(`${h.adressetekst ?? ''} ${h.kommunenavn ?? ''}`);
    return text === q || withPoststed === q || withKommune === q || q.includes(text);
  });

  if (hits.length === 1) return { hit: hits[0], reason: 'Geonorge returnerte ett tydelig adressetreff.' };
  if (exact.length === 1) return { hit: exact[0], reason: 'Geonorge returnerte flere treff, men ett eksakt adressetreff.' };
  if (exact.length > 1) return { reason: 'Geonorge returnerte flere eksakte treff; må avklares manuelt.' };
  return { reason: 'Geonorge returnerte flere treff uten entydig match; må avklares manuelt.' };
}

function toFinderResult(query: string, sourceUrl: string, hit: AddressResult, reason: string): FinderResult {
  const lat = hit.representasjonspunkt?.lat;
  const lon = hit.representasjonspunkt?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return {
      ok: false,
      status: 'needs_review',
      reason: 'Adressetreff mangler representasjonspunkt med lat/lon.',
      query,
      rawHit: hit,
    };
  }

  const street = String(hit.adressenavn ?? '').trim();
  const number = `${String(hit.nummer ?? '').trim()}${String(hit.bokstav ?? '').trim()}`;
  const postcode = String(hit.postnummer ?? '').trim();
  const city = String(hit.poststed || hit.kommunenavn || '').trim();
  const id = sourceObjectId(hit);
  const label = [street, number].filter(Boolean).join(' ');

  if (!hasText(street) || !hasText(number) || !hasText(id)) {
    return {
      ok: false,
      status: 'needs_review',
      reason: 'Adressetreff mangler street/number/sourceObjectId-komponenter.',
      query,
      rawHit: hit,
    };
  }

  return {
    ok: true,
    status: 'verified_candidate',
    reason,
    query,
    sourceProvider: 'official_address',
    sourceName: 'Geonorge Adresser API v1',
    sourceUrl,
    sourceObjectId: id,
    coordinate: {
      lat,
      lon,
      r: 60,
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: id,
      address: {
        street,
        number,
        postcode,
        city: city === 'OSLO' ? 'Oslo' : city,
        country: 'NO',
      },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordType: 'address_point',
      coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${label}${city ? `, ${city}` : ''}. Punktet er representasjonspunktet for adressen og brukes som display-marker, ikke som kai-, vei-, vannflate- eller generelt områdeanker.`,
    },
    rawHit: hit,
  };
}

export async function findNorwegianAddressCoordinate(query: string): Promise<FinderResult> {
  const clean = String(query || '').trim();
  if (!clean) {
    return { ok: false, status: 'error', reason: 'Mangler adressequery.', query: clean };
  }

  const sourceUrl = `${GEONORGE_ADRESSER_API}?sok=${encodeURIComponent(clean)}`;
  const res = await (globalThis as any).fetch(sourceUrl, { headers: { Accept: 'application/json' } });
  if (!res?.ok) {
    return {
      ok: false,
      status: 'error',
      reason: `Geonorge-kall feilet: HTTP ${res?.status ?? 'unknown'}`,
      query: clean,
      sourceUrl,
    };
  }

  const json = await res.json();
  const hits: AddressResult[] = Array.isArray(json?.adresser) ? json.adresser : [];
  const { hit, reason } = findBestHit(clean, hits);
  if (!hit) return { ok: false, status: hits.length ? 'needs_review' : 'not_found', reason, query: clean, sourceUrl };
  return toFinderResult(clean, sourceUrl, hit, reason);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.address) {
    console.log('Bruk: npm run places:coords:find:address -- --address "Langkaia 1 Oslo"');
    return;
  }

  const query = [args.address, args.city].filter(Boolean).join(' ');
  const result = await findNorwegianAddressCoordinate(query);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
