import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = {
  pumptrack: 'data/places/sport/vestland/etne/etne_pumptrack.json',
  skakkeringen: 'data/places/sport/vestland/etne/skakkeringen_etne.json',
  osnes: 'data/places/sport/vestland/etne/osnes_discgolfbane.json',
  skanevik: 'data/places/sport/vestland/etne/skanevik_discgolf.json'
};

const readRecord = (path) => JSON.parse(fs.readFileSync(path, 'utf8'))[0];
const writeRecord = (path, record) => fs.writeFileSync(path, `${JSON.stringify([record], null, 2)}\n`);

function plausible(point) {
  return point && point.lat > 59.4 && point.lat < 59.9 && point.lon > 5.6 && point.lon < 6.2;
}

function extractPoint(text) {
  const decoded = decodeURIComponent(String(text || ''));
  const patterns = [
    /@(-?\d{2}\.\d+),(-?\d{1,2}\.\d+)/,
    /!3d(-?\d{2}\.\d+)!4d(-?\d{1,2}\.\d+)/,
    /(?:query|destination|center)=(-?\d{2}\.\d+),(-?\d{1,2}\.\d+)/,
    /(-?59\.\d{4,}),\s*(5\.\d{4,})/
  ];
  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match) {
      const point = { lat: Number(match[1]), lon: Number(match[2]) };
      if (plausible(point)) return point;
    }
  }
  return null;
}

async function resolveMapPin(shortUrl, label) {
  const attempts = [];
  try {
    const response = await fetch(shortUrl, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (History-Go coordinate audit)' }
    });
    attempts.push(response.url);
    const fromUrl = extractPoint(response.url);
    if (fromUrl) {
      console.log(`PASS ${label}: resolved via fetch URL ${response.url}`);
      return { ...fromUrl, resolvedUrl: response.url, method: 'fetch' };
    }
    const html = await response.text();
    const fromHtml = extractPoint(html);
    if (fromHtml) {
      console.log(`PASS ${label}: resolved via fetched HTML from ${response.url}`);
      return { ...fromHtml, resolvedUrl: response.url, method: 'fetch-html' };
    }
  } catch (error) {
    console.log(`INFO ${label}: fetch resolution failed: ${error.message}`);
  }

  try {
    const result = spawnSync('curl', ['-L', '-sS', '-o', '/dev/null', '-w', '%{url_effective}', shortUrl], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout) {
      const finalUrl = result.stdout.trim();
      attempts.push(finalUrl);
      const point = extractPoint(finalUrl);
      if (point) {
        console.log(`PASS ${label}: resolved via curl URL ${finalUrl}`);
        return { ...point, resolvedUrl: finalUrl, method: 'curl' };
      }
    } else {
      console.log(`INFO ${label}: curl resolution failed: ${result.stderr || `status ${result.status}`}`);
    }
  } catch (error) {
    console.log(`INFO ${label}: curl exception: ${error.message}`);
  }

  console.log(`INFO ${label}: no coordinate extracted; attempted URLs=${JSON.stringify(attempts)}`);
  return null;
}

function appendNote(record, note) {
  if (!record.quiz_profile.notes.includes(note)) record.quiz_profile.notes += ` ${note}`;
}

function apply(path, point, note, label) {
  if (!plausible(point)) throw new Error(`${label}: implausible point ${JSON.stringify(point)}`);
  const record = readRecord(path);
  record.lat = point.lat;
  record.lon = point.lon;
  appendNote(record, note);
  writeRecord(path, record);
  console.log(`PASS ${record.id}: ${point.lat}, ${point.lon} -> ${label}`);
}

const pumpPin = await resolveMapPin('https://maps.app.goo.gl/hiw8sPwALHFA8E5s8', 'Etne pumptrack');
if (pumpPin) {
  apply(
    files.pumptrack,
    pumpPin,
    'Den publiserte Google Maps-pinnen frå Shapers vart løyst i integrasjonen og brukt som besøksanker for pumptracken.',
    `published Shapers map pin via ${pumpPin.method}`
  );
} else {
  apply(
    files.pumptrack,
    { lat: 59.66795396985244, lon: 5.942168981207253 },
    'Den publiserte Google Maps-kortlenka gav ikkje eit maskinlesbart sluttkoordinat i integrasjonen. Kartverket/Geonorge-adressepunktet for Stadionvegen 12 er derfor brukt som eksplisitt delt besøksanker; recorden representerer den dokumentert separate pumptracken, ikkje skateparken.',
    'shared representative Stadionvegen 12 address anchor'
  );
}

const skakkeringenPin = await resolveMapPin('https://maps.app.goo.gl/TV8s91piZFby7hDA8', 'Skakkeringen');
if (skakkeringenPin) {
  apply(
    files.skakkeringen,
    skakkeringenPin,
    'Den publiserte Google Maps-pinnen frå prosjektomtalen vart løyst i integrasjonen og brukt som anker for det utandørs aktivitetsanlegget Skakkeringen.',
    `published Skakkeringen project map pin via ${skakkeringenPin.method}`
  );
} else {
  apply(
    files.skakkeringen,
    { lat: 59.6672, lon: 5.9409 },
    'Den publiserte prosjektkartlenka gav ikkje eit maskinlesbart sluttkoordinat i integrasjonen. Punktet 59.6672, 5.9409 er derfor brukt som eit eksplisitt representativt områdeanker for det utandørs Skakkeringen-anlegget ved Skakke og skal ikkje lesast som bygningsadressa til kultursenteret.',
    'representative Skakkeringen outdoor-area anchor'
  );
}

for (const [key, path] of [['osnes', files.osnes], ['skanevik', files.skanevik]]) {
  const record = readRecord(path);
  if (!plausible({ lat: record.lat, lon: record.lon })) throw new Error(`${key}: implausible documented UDisc point`);
  console.log(`PASS ${record.id}: documented UDisc point retained ${record.lat}, ${record.lon}`);
}

const manifestPath = 'data/places/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const additions = [
  'places/sport/vestland/etne/etne_pumptrack.json',
  'places/sport/vestland/etne/skakkeringen_etne.json',
  'places/sport/vestland/etne/osnes_discgolfbane.json',
  'places/sport/vestland/etne/skanevik_discgolf.json'
];
for (const item of additions) if (!manifest.files.includes(item)) manifest.files.push(item);
for (const item of additions) {
  const count = manifest.files.filter((row) => row === item).length;
  if (count !== 1) throw new Error(`${item}: manifest count ${count}`);
  console.log(`PASS ${item}: exactly once in manifest`);
}
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
