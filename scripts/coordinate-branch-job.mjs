#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const date = '2026-07-21';
const placeId = 'ibsen_quotes';
const routeSourceObjectId = 'ibsen-museum:sitatgaten';
const museumUrl = 'https://ibsenmt.no/skoletilbud';
const byleksikonUrl = 'https://oslobyleksikon.no/side/Sitatgaten';
const aggregateFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur.json');
const childFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur/ibsen_quotes.json');
const indexFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur_index.json');
const manifestFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/litteratur/ibsen_quotes.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-139-ibsen-sitatgaten-anchors');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

async function exactAddress(street, number, reportName) {
  const params = new URLSearchParams({ adressenavn: street, nummer: number, kommunenummer: '0301', treffPerSide: '100' });
  const url = `https://ws.geonorge.no/adresser/v1/sok?${params}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Geonorge feilet for ${street} ${number}: HTTP ${response.status}`);
  const payload = await response.json();
  writeJson(path.join(reportDir, reportName), payload);
  const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
  const exact = hits.filter((hit) => norm(hit?.adressenavn) === norm(street) && String(hit?.nummer ?? '') === number && String(hit?.bokstav ?? '').trim() === '' && String(hit?.kommunenummer ?? '') === '0301');
  if (exact.length !== 1) throw new Error(`${street} ${number}: forventet ett eksakt ulettert Geonorge-objekt, fant ${exact.length}`);
  const hit = exact[0];
  const lat = Number(hit?.representasjonspunkt?.lat);
  const lon = Number(hit?.representasjonspunkt?.lon);
  const code = String(hit?.adressekode ?? '').trim();
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !code) throw new Error(`${street} ${number}: mangler koordinat/adressekode`);
  return {
    lat, lon, url,
    sourceObjectId: `geonorge-adresser-v1:0301:${code}:${number}`,
    address: { street, number, postcode: String(hit?.postnummer ?? ''), city: 'Oslo', country: 'NO' },
  };
}

const museum = await exactAddress('Henrik Ibsens gate', '26', 'geonorge-henrik-ibsens-gate-26.json');
const grand = await exactAddress('Karl Johans gate', '31', 'geonorge-karl-johans-gate-31.json');
const lat = (museum.lat + grand.lat) / 2;
const lon = (museum.lon + grand.lon) / 2;
const anchors = [
  { id: 'ibsen_museum_endpoint', name: 'IBSEN Museum & Teater', lat: museum.lat, lon: museum.lon, r: 60, type: 'route_endpoint', sourceProvider: 'official_address', sourceObjectId: museum.sourceObjectId, address: museum.address, note: 'Vestlig endepunkt for den dokumenterte Sitatgaten ved Ibsenmuseet.' },
  { id: 'grand_cafe_endpoint', name: 'Grand Café', lat: grand.lat, lon: grand.lon, r: 60, type: 'route_endpoint', sourceProvider: 'official_address', sourceObjectId: grand.sourceObjectId, address: grand.address, note: 'Østlig endepunkt for den dokumenterte Sitatgaten ved Grand Café.' },
];
const coordNote = `Batch 139 multi-anchor route model: IBSEN Museum & Teater dokumenterer 69 Ibsen-sitater langs Karl Johans gate og Henrik Ibsens gate, og Oslo byleksikon avgrenser kunstverket mellom Ibsenmuseet og Grand Café. De to fysiske endepunktene er forankret med eksakte Geonorge-adresseobjekter (${museum.sourceObjectId} og ${grand.sourceObjectId}). Canonical lat/lon er kun et beregnet semantisk midtanker mellom endepunktene for kartvisning; det er ikke et påstått enkelt sitatpunkt, en rettlinjet traségeometri eller en millimeterpresis posisjon for alle 69 installasjonene.`;
const fields = { lat, lon, r: 180, locatorType: 'route', sourceProvider: 'manual_research', sourceObjectId: routeSourceObjectId, geocodeAccuracy: 'semantic_anchor', coordRole: 'line_anchor', coordStatus: 'verified_geometry', coordSource: 'IBSEN Museum & Teater + Oslo byleksikon – Sitatgaten; exact route endpoints anchored with Geonorge addresses', coordSourceId: routeSourceObjectId, coordSourceUrl: museumUrl, coordType: 'distributed_quote_route_anchor', coordVerifiedAt: date, anchors, coordNote };

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((p) => p?.id === placeId).length !== 1) throw new Error('ibsen_quotes må finnes nøyaktig én gang');
const oldPlace = aggregate.find((p) => p?.id === placeId);
const updatedAggregate = aggregate.map((p) => p?.id === placeId ? { ...p, name: 'Sitatgaten – Ibsen-sitatene', year: 2008, desc: 'Kunstverket Sitatgaten med 69 Henrik Ibsen-sitater nedfelt i fortauene mellom Ibsenmuseet og Grand Café.', popupDesc: 'Sitatgaten, også kalt Sitat Ibsen eller Ibsenstien, består av 69 Henrik Ibsen-sitater i metall nedfelt i fortauene langs ruten mellom Ibsenmuseet og Grand Café. History Go modellerer stedet som en distribuert rute med to dokumenterte endepunkter, ikke som ett enkelt monumentpunkt.', ...fields } : p);
const updatedPlace = updatedAggregate.find((p) => p?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('ibsen_quotes mangler i split-index');
Object.assign(indexRow, { name: updatedPlace.name, lat, lon, r: 180, year: 2008, coordStatus: fields.coordStatus, coordType: fields.coordType });
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('ibsen_quotes mangler i split-manifest');
manifestRow.name = updatedPlace.name;
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0', placeId, placeFile: 'data/places/litteratur/oslo/places_litteratur.json', evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: 180, coordStatus: fields.coordStatus, coordSource: fields.coordSource, coordType: fields.coordType, coordNote },
  identity: { currentName: updatedPlace.name, resolvedIdentity: 'Sitatgaten mellom Ibsenmuseet og Grand Café, med 69 Ibsen-sitater langs Karl Johans gate og Henrik Ibsens gate', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['dokumentert fysisk rutescope', 'minst to kildebelagte ruteankre', 'ingen påstand om ett enkelt monumentpunkt'],
  evidence: [
    { sourceProvider: 'manual_research', sourceName: 'IBSEN Museum & Teater – Sitatgaten', sourceUrl: museumUrl, sourceObjectId: routeSourceObjectId, sourceQuality: 'official_museum_route_identity', finding: 'Museet dokumenterer 69 Ibsen-sitater langs Karl Johans gate og Henrik Ibsens gate.', canVerifyCoordinate: true, reason: 'Definerer kunstverket som distribuert rute.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Sitatgaten', sourceUrl: byleksikonUrl, sourceObjectId: 'oslobyleksikon:sitatgaten', sourceQuality: 'independent_route_scope_crosscheck', finding: 'Avgrenser Sitatgaten som kunstverket mellom Ibsenmuseet og Grand Café.', canVerifyCoordinate: false, reason: 'Kryssjekker rutescope og endepunkter.' },
    { sourceProvider: 'official_address', sourceName: 'Geonorge – Ibsenmuseet endpoint', sourceUrl: museum.url, sourceObjectId: museum.sourceObjectId, sourceQuality: 'official_exact_endpoint_anchor', finding: `Eksakt adresseanker: ${museum.lat}, ${museum.lon}.`, canVerifyCoordinate: true, reason: 'Vestlig ruteendepunkt.' },
    { sourceProvider: 'official_address', sourceName: 'Geonorge – Grand Café endpoint', sourceUrl: grand.url, sourceObjectId: grand.sourceObjectId, sourceQuality: 'official_exact_endpoint_anchor', finding: `Eksakt adresseanker: ${grand.lat}, ${grand.lon}.`, canVerifyCoordinate: true, reason: 'Østlig ruteendepunkt.' },
  ],
  addressCandidates: [{ sourceProvider: 'official_address', sourceObjectId: museum.sourceObjectId, address: museum.address, lat: museum.lat, lon: museum.lon, canApplyToPlace: true }, { sourceProvider: 'official_address', sourceObjectId: grand.sourceObjectId, address: grand.address, lat: grand.lat, lon: grand.lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'manual_research', sourceObjectId: routeSourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [{ type: 'multi_anchor_route', anchors, canApplyToPlace: true }],
  coordinateCandidates: [{ lat, lon, coordRole: 'line_anchor', sourceObjectId: routeSourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Sitatgaten er modellert som distribuert rute med to eksakte kildebelagte endepunkter og et semantisk kartanker.' }, notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const staleRow = '| `ibsen_quotes` – Ibsen sitater / Sitatgaten | needs_review | Den fysiske installasjonen består av 69 sitater langs Karl Johans gate og Henrik Ibsens gate, men recorden har bare ett punkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller flere kildebelagte ankere før canonical koordinat kan godkjennes. |';
if (protocol.split(staleRow).length - 1 !== 1) throw new Error('Forventet én stale ibsen_quotes needs_review-rad');
protocol = protocol.replace(`${staleRow}\n`, '');
if (!protocol.includes('| 139 | `ibsen_quotes` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør');
  const insertion = `| 139 | \`ibsen_quotes\` | Sitatgaten – Ibsen-sitatene | verified_geometry | \`${routeSourceObjectId}\` |\n\nBatch 139 (2026-07-21) løser \`ibsen_quotes\` som en distribuert fleranker-rute i stedet for ett enkelt monumentpunkt. IBSEN Museum & Teater dokumenterer 69 sitater langs Karl Johans gate og Henrik Ibsens gate, mens Oslo byleksikon avgrenser kunstverket mellom Ibsenmuseet og Grand Café. Endepunktene forankres med eksakte Geonorge-adresseobjekter (${museum.sourceObjectId} og ${grand.sourceObjectId}). Canonical lat/lon er et beregnet \`semantic_anchor\` mellom endepunktene for kartvisning; det er ikke en påstand om rettlinjet trasé eller ett bestemt sitatpunkt.\n\n`;
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-139-result.json'), { generatedAt: new Date().toISOString(), batch: 139, placeId, sourceObjectId: routeSourceObjectId, oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, newCoordinate: { lat, lon }, anchors, status: 'verified_geometry', method: 'documented_multi_anchor_route' });
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 139 source chain\n\n- IBSEN Museum & Teater: 69 quotes along Karl Johans gate and Henrik Ibsens gate.\n- Oslo byleksikon: route scope between Ibsenmuseet and Grand Café.\n- Geonorge: exact endpoint address objects ${museum.sourceObjectId} and ${grand.sourceObjectId}.\n- Canonical lat/lon is a semantic midpoint between endpoints; no invented detailed route geometry.\n`);
console.log(JSON.stringify({ batch: 139, placeId, sourceObjectId: routeSourceObjectId, oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, newCoordinate: { lat, lon }, anchors, status: 'verified_geometry' }, null, 2));
