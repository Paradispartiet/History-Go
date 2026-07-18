import fs from 'node:fs';

const files = {
  tennis: 'data/places/sport/vestland/etne/etne_tennisanlegg.json',
  skate: 'data/places/sport/vestland/etne/skanevik_skatepark.json',
  pool: 'data/places/sport/vestland/etne/sjokanten_trivsel_skanevik.json',
  dojo: 'data/places/sport/vestland/etne/etne_kyokushin_dojo.json',
  fikse: 'data/places/sport/vestland/etne/fikse_skytebane.json'
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
  if (!rows.length) return null;
  const best = rows[0];
  const point = best.representasjonspunkt;
  if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') return null;
  return { lat: point.lat, lon: point.lon, raw: best, query };
}

function nameOf(row) {
  return row?.stedsnavn?.skrivemåte || row?.skrivemåte || row?.navn || row?.name || '';
}

function pointOf(row) {
  const candidates = [row?.representasjonspunkt, row?.representasjonspunkt?.koordinater, row?.geometry, row?.geometri, row?.punkt].filter(Boolean);
  for (const p of candidates) {
    if (typeof p.lat === 'number' && typeof p.lon === 'number') return { lat: p.lat, lon: p.lon };
    if (typeof p.latitude === 'number' && typeof p.longitude === 'number') return { lat: p.latitude, lon: p.longitude };
    const east = typeof p.øst === 'number' ? p.øst : p.ost;
    if (typeof p.nord === 'number' && typeof east === 'number' && Math.abs(p.nord) <= 90 && Math.abs(east) <= 180) return { lat: p.nord, lon: east };
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
    rows.slice(0, 15).forEach((row, index) => console.log(`CANDIDATE ${label} ${index + 1}: ${nameOf(row)} | ${JSON.stringify(row.representasjonspunkt || row.geometry || row.geometri || null)}`));
    const usable = rows.map((row) => ({ row, name: nameOf(row), point: pointOf(row) })).filter((item) => item.point);
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

const tennis = await addressLookup('Stadionvegen 12, 5590 Etne');
if (!tennis) throw new Error('No Kartverket address point for Stadionvegen 12');
apply(files.tennis, tennis, 'Offisielt Kartverket/Geonorge-adressepunkt brukt som besøksanker: Stadionvegen 12, 5590 Etne. Tennisanlegget deler adresseankeret med andre aktivitetar i området, men er ein sjølvstendig fysisk og funksjonell idrettsarena.', 'Stadionvegen 12, 5590');

let skate = null;
for (const query of ['Fylkesvei 34 220, 5593 Skånevik', 'Fv34 220, 5593 Skånevik']) {
  skate = await addressLookup(query);
  if (skate) break;
}
if (skate) {
  apply(files.skate, skate, `Kartverket/Geonorge-adressepunkt brukt for den dokumenterte skateparkadressa (${skate.query}). Punktet fungerer som besøksanker og er ikkje påstått å vere geometrisk sentrum av betongparken.`, skate.query);
} else {
  apply(files.skate, { lat: 59.73, lon: 5.92 }, 'Opne skatepark-kjelder oppgir lokasjonen til om lag 59.73, 5.92 og adressa Fv34 220. Kartverket gav ikkje eit eintydig maskinlesbart adressepunkt, så koordinatet er eksplisitt representativt og ikkje påstått å vere eksakt senter av parken.', 'representativt skateparkområdeanker 59.73, 5.92');
}

const pool = await addressLookup('Åsheimsvegen 1, 5593 Skånevik');
if (!pool) throw new Error('No Kartverket address point for Åsheimsvegen 1');
apply(files.pool, pool, 'Offisielt Kartverket/Geonorge-adressepunkt brukt som anker: Åsheimsvegen 1, 5593 Skånevik.', 'Åsheimsvegen 1, 5593');

const dojo = await addressLookup('Stadionvegen 38, 5590 Etne');
if (!dojo) throw new Error('No Kartverket address point for Stadionvegen 38');
apply(files.dojo, dojo, 'Offisielt Kartverket/Geonorge-adressepunkt brukt som anker: Stadionvegen 38, 5590 Etne.', 'Stadionvegen 38, 5590');

const fikse = await placeNameLookup(['Fikse skytebane*', 'Fikse*'], 'Fikse skytebane');
if (!fikse) throw new Error('No usable Kartverket Stedsnavn point for Fikse/Fikse skytebane in Etne municipality');
if (!(fikse.lat > 59 && fikse.lat < 61 && fikse.lon > 4 && fikse.lon < 7)) throw new Error(`Implausible Fikse point: ${fikse.lat}, ${fikse.lon}`);
apply(files.fikse, fikse, `Kartverket Stedsnavn-representasjonspunkt brukt for ${fikse.name || 'Fikse'} med kommune-filter 4611 Etne. Punktet er eit stad-/anleggsanker for Fikse skytebane og skal ikkje lesast som koordinat for den separate leirduebana over kommunegrensa i Vindafjord.`, `Kartverket Stedsnavn: ${fikse.name || 'Fikse'}`);

const manifestPath = 'data/places/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const additions = [
  'places/sport/vestland/etne/etne_tennisanlegg.json',
  'places/sport/vestland/etne/skanevik_skatepark.json',
  'places/sport/vestland/etne/sjokanten_trivsel_skanevik.json',
  'places/sport/vestland/etne/etne_kyokushin_dojo.json',
  'places/sport/vestland/etne/fikse_skytebane.json'
];
for (const item of additions) if (!manifest.files.includes(item)) manifest.files.push(item);
for (const item of additions) {
  const count = manifest.files.filter((row) => row === item).length;
  if (count !== 1) throw new Error(`${item}: manifest count ${count}`);
  console.log(`PASS ${item}: exactly once in manifest`);
}
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
