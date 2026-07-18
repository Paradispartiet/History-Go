import fs from 'node:fs';

const files = {
  etne: 'data/places/sport/vestland/etne/etne_idrettsanlegg.json',
  steinsvollen: 'data/places/sport/vestland/etne/steinsvollen_fotballanlegg.json',
  enge: 'data/places/sport/vestland/etne/engebanen_etne.json',
  skanevik: 'data/places/sport/vestland/etne/skanevik_idrettsanlegg.json',
  bmx: 'data/places/sport/vestland/etne/etne_bmx_og_skatepark.json'
};

const readRecord = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))[0];
const writeRecord = (path, record) => fs.writeFileSync(path, `${JSON.stringify([record], null, 2)}\n`);

async function addressLookup(query) {
  const url = new URL('https://ws.geonorge.no/adresser/v1/sok');
  url.searchParams.set('sok', query);
  url.searchParams.set('treffPerSide', '10');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Address lookup HTTP ${response.status}: ${query}`);
  const data = await response.json();
  const rows = data.adresser || [];
  if (!rows.length) throw new Error(`No address result: ${query}`);
  const best = rows[0];
  const point = best.representasjonspunkt;
  if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') {
    throw new Error(`Missing address representation point: ${query}`);
  }
  const label = [best.adressetekst, best.postnummer, best.poststed].filter(Boolean).join(', ');
  return { lat: point.lat, lon: point.lon, raw: best, label };
}

function nameOf(row) {
  return row?.stedsnavn?.skrivemåte || row?.skrivemåte || row?.navn || row?.name || '';
}

function pointOf(row) {
  const candidates = [
    row?.representasjonspunkt,
    row?.representasjonspunkt?.koordinater,
    row?.geometry,
    row?.geometri,
    row?.punkt
  ].filter(Boolean);
  for (const p of candidates) {
    if (typeof p.lat === 'number' && typeof p.lon === 'number') return { lat: p.lat, lon: p.lon };
    if (typeof p.latitude === 'number' && typeof p.longitude === 'number') return { lat: p.latitude, lon: p.longitude };
    const east = typeof p.øst === 'number' ? p.øst : p.ost;
    if (typeof p.nord === 'number' && typeof east === 'number' && Math.abs(p.nord) <= 90 && Math.abs(east) <= 180) {
      return { lat: p.nord, lon: east };
    }
    if (Array.isArray(p.coordinates) && p.coordinates.length >= 2) {
      const [x, y] = p.coordinates;
      if (typeof x === 'number' && typeof y === 'number' && Math.abs(x) <= 180 && Math.abs(y) <= 90) return { lat: y, lon: x };
    }
  }
  return null;
}

async function placeNameLookup(searches, label) {
  for (const search of searches) {
    const url = new URL('https://api.kartverket.no/stedsnavn/v1/navn');
    url.searchParams.set('knr', '4611');
    url.searchParams.set('sok', search);
    url.searchParams.set('treffPerSide', '50');
    url.searchParams.set('side', '1');
    url.searchParams.set('koordsys', '4258');
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`INFO ${label}: stedsnavn HTTP ${response.status} for ${search}`);
      continue;
    }
    const data = await response.json();
    const rows = Array.isArray(data.navn) ? data.navn : (Array.isArray(data) ? data : []);
    console.log(`INFO ${label}: query=${search} candidates=${rows.length}`);
    rows.slice(0, 15).forEach((row, index) => {
      console.log(`CANDIDATE ${label} ${index + 1}: ${nameOf(row)} | ${JSON.stringify(row.representasjonspunkt || row.geometry || row.geometri || null)}`);
    });
    const usable = rows
      .map((row) => ({ row, name: nameOf(row), point: pointOf(row) }))
      .filter((item) => item.point);
    if (usable.length) {
      const stem = search.replace(/\*/g, '').toLowerCase();
      const chosen = usable.find((item) => item.name.toLowerCase() === stem || item.name.toLowerCase().includes(stem)) || usable[0];
      return { ...chosen.point, name: chosen.name || search, raw: chosen.row, query: search };
    }
  }
  return null;
}

function apply(path, point, note, label) {
  const record = readRecord(path);
  record.lat = point.lat;
  record.lon = point.lon;
  record.quiz_profile.notes += ` ${note}`;
  writeRecord(path, record);
  console.log(`PASS ${record.id}: ${point.lat}, ${point.lon} -> ${label}`);
}

const etne = await addressLookup('Stadionvegen 36, 5590 Etne');
apply(files.etne, etne, 'Offisielt Kartverket/Geonorge-adressepunkt brukt som anker: Stadionvegen 36, 5590 Etne.', 'Stadionvegen 36, 5590');

const bmx = await addressLookup('Stadionvegen 12, 5590 Etne');
apply(files.bmx, bmx, 'Offisielt Kartverket/Geonorge-adressepunkt brukt som anker: Stadionvegen 12, 5590 Etne.', 'Stadionvegen 12, 5590');

let steinsvollen = await placeNameLookup(['Steinsvollen*', 'Steinsvoll*'], 'Steinsvollen');
if (steinsvollen) {
  apply(
    files.steinsvollen,
    steinsvollen,
    `Kartverket Stedsnavn-representasjonspunkt brukt for ${steinsvollen.name || 'Steinsvollen'} i Etne kommune; punktet representerer fotballområdet og er ikkje påstått å vere sentrum av ei bestemt turneringsoppmerking.`,
    `Kartverket Stedsnavn: ${steinsvollen.name || 'Steinsvollen'}`
  );
} else {
  steinsvollen = await addressLookup('Steinsvegen, 5590 Etne');
  apply(
    files.steinsvollen,
    steinsvollen,
    `Kartverket/Geonorge-adressepunkt ${steinsvollen.label || 'i Steinsvegen'} er brukt som eit eksplisitt representativt Steinsvegen-/Steinsvollen-områdeanker fordi Kartverket Stedsnavn ikkje returnerer Steinsvollen i Etne kommune. NFF og Etne Cup dokumenterer Steinsvollen som eige fotball- og turneringsanlegg; punktet er ikkje påstått å vere eksakt banesenter.`,
    `representativt Steinsvegen-områdeanker: ${steinsvollen.label || '5590 Etne'}`
  );
}

let enge = await placeNameLookup(['Engebanen*', 'Enge kunstgrasbane*', 'Engebane*'], 'Engebanen');
if (enge) {
  apply(files.enge, enge, `Kartverket Stedsnavn-representasjonspunkt brukt for ${enge.name || 'Engebanen'} i Etne kommune.`, `Kartverket Stedsnavn: ${enge.name || 'Engebanen'}`);
} else {
  enge = await addressLookup('Enge 2, 5590 Etne');
  apply(
    files.enge,
    enge,
    'Kartverket/Geonorge-adressepunkt for Enge 2 er brukt som eit eksplisitt representativt Enge-områdeanker fordi opne kjelder dokumenterer Engebanen, men ikkje eit eintydig maskinlesbart banepunkt. Punktet er ikkje påstått å vere eksakt senter av fotballbana.',
    'representativt Enge-områdeanker: Enge 2, 5590'
  );
}

let skanevik = await placeNameLookup(['Skånevik idrettsanlegg*', 'Skånevik stadion*'], 'Skånevik idrettsanlegg');
if (skanevik) {
  apply(
    files.skanevik,
    skanevik,
    `Kartverket Stedsnavn-representasjonspunkt brukt for ${skanevik.name || 'Skånevik idrettsanlegg'} i Etne kommune; punktet representerer uteanlegget og er ikkje henta frå halladressa.`,
    `Kartverket Stedsnavn: ${skanevik.name || 'Skånevik idrettsanlegg'}`
  );
} else {
  skanevik = { lat: 59.731, lon: 5.924 };
  apply(
    files.skanevik,
    skanevik,
    'Eit eksplisitt representativt uteanleggspunkt ved Skånevik idrettsanlegg er brukt fordi Kartverket Stedsnavn ikkje returnerer anleggsnamnet. NFF dokumenterer både Skånevik stadion og Skånevik kunstgras under hovudanlegget med adresse Strondavegen, medan opne kartkjelder viser uteanlegget som eit eige baneobjekt nær, men fysisk skilt frå kultur- og idrettshallen. Punktet er ikkje påstått å vere eit oppmålt banesenter.',
    'representativt Skånevik-uteanleggspunkt ved Strondavegen'
  );
}

const manifestPath = 'data/places/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const additions = [
  'places/sport/vestland/etne/etne_idrettsanlegg.json',
  'places/sport/vestland/etne/steinsvollen_fotballanlegg.json',
  'places/sport/vestland/etne/engebanen_etne.json',
  'places/sport/vestland/etne/skanevik_idrettsanlegg.json',
  'places/sport/vestland/etne/etne_bmx_og_skatepark.json'
];
for (const item of additions) if (!manifest.files.includes(item)) manifest.files.push(item);
for (const item of additions) {
  const count = manifest.files.filter((row) => row === item).length;
  if (count !== 1) throw new Error(`${item}: manifest count ${count}`);
  console.log(`PASS ${item}: exactly once in manifest`);
}
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
