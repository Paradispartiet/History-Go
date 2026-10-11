import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const root = 'reports/place-production/arbeiderbladet-youngstorget-intake-20261011';
await mkdir(root, { recursive: true });
await mkdir('bilder/places', { recursive: true });
const records = [];
async function request(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': 'HistoryGo-SourceReview/1.0 (licensed-media-intake)' } });
    if (response.ok) return response;
    if (![429, 502, 503, 504].includes(response.status) || attempt === 4) throw new Error(`HTTP ${response.status}: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
}
for (const [title, path] of [
  ['Folketeaterbygningen_1947.jpg', 'bilder/places/arbeiderbladet_youngstorget_1947.jpg'],
  ['Folketeaterbygningen_Oslo.jpg', 'bilder/places/arbeiderbladet_youngstorget_2006.jpg'],
  ['Vort_Arbeide_No_1_1884.jpg', 'bilder/places/arbeiderbladet_vort_arbeide_1884.jpg'],
]) {
  const hash = createHash('md5').update(title).digest('hex');
  const url = `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(title)}`;
  const response = await request(url);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`Not a JPEG: ${title}`);
  await writeFile(path, bytes);
  records.push({ title, path, url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(`${root}/assets.json`, `${JSON.stringify(records, null, 2)}\n`);
for (const [name, url] of [
  ['address.json', 'https://ws.geonorge.no/adresser/v1/sok?sok=Youngstorget%202&kommunenummer=0301&treffPerSide=10'],
  ['official-logo-page.html', 'https://www.dagsavisen.no/nyheter/logo-dagsavisen/8542896'],
]) {
  const response = await request(url);
  await writeFile(`${root}/${name}`, (await response.text()).split("\n").map(line => line.trimEnd()).join("\n"));
}
console.log(JSON.stringify(records));

await mkdir('bilder/brands', { recursive: true });
const logoUrl = 'https://www.dagsavisen.no/view-resources/dachser2/public/dagsavisen/DA_Primarylogo_Negativ.svg';
const logo = (await (await request(logoUrl)).text()).split('\n').map(line => line.trimEnd()).join('\n');
if (!logo.includes('<svg')) throw new Error('Official header asset is not SVG');
await writeFile('bilder/brands/dagsavisen.svg', logo);
await writeFile(`${root}/logo-source.json`, JSON.stringify({ url: logoUrl, source: 'Official header and publisher.logo metadata in downloaded Dagsavisen HTML', retrievedAt: new Date().toISOString(), sha256: createHash('sha256').update(logo).digest('hex') }, null, 2) + '\n');
