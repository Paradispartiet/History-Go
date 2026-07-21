#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 136;
const date = '2026-07-21';
const placeId = 'aftenposten_akersgata';
const street = 'Akersgata';
const number = '51';
const municipality = '0301';
const historicalSourceObjectId = 'aftenposten:akersgata51:1876-2003';
const aftenpostenHistoryUrl = 'https://www.aftenposten.no/norge/i/BJdpw/tanta-flytter-hjem';
const osloByleksikonUrl = 'https://oslobyleksikon.no/side/Aftenposten';
const lokalhistoriewikiUrl = 'https://lokalhistoriewiki.no/wiki/Aftenposten';
const akersgata51Url = 'https://www.akersgata51.no/';

const aggregateFile = path.join(root, 'data/places/media/oslo/places_oslo_media.json');
const childFile = path.join(root, 'data/places/media/oslo/places_oslo_media/aftenposten_akersgata.json');
const splitIndexFile = path.join(root, 'data/places/media/oslo/places_oslo_media_index.json');
const splitManifestFile = path.join(root, 'data/places/media/oslo/places_oslo_media_manifest.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/media/aftenposten_akersgata.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-136-aftenposten-akersgata51');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

// Resolve the historical physical scope first: Akersgata 51 is the documented main address
// from 1876 to 2003. The wider press complex expanded to 53 and later 55, but those expansions
// are historical context rather than additional canonical map points for this record.
const params = new URLSearchParams({
  adressenavn: street,
  nummer: number,
  kommunenummer: municipality,
  treffPerSide: '100',
});
const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?${params.toString()}`;
const response = await fetch(geonorgeUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Geonorge-kall feilet: HTTP ${response.status}`);
const payload = await response.json();
writeJson(path.join(reportDir, 'geonorge-akersgata-51.json'), payload);
const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
const exact = hits.filter((hit) =>
  norm(hit?.adressenavn) === norm(street) &&
  String(hit?.nummer ?? '').trim() === number &&
  String(hit?.bokstav ?? '').trim() === '' &&
  String(hit?.kommunenummer ?? '').trim() === municipality
);
if (exact.length !== 1) {
  const summary = hits.map((hit) => ({
    adressetekst: hit?.adressetekst,
    nummer: hit?.nummer,
    bokstav: hit?.bokstav,
    kommunenummer: hit?.kommunenummer,
    adressekode: hit?.adressekode,
  }));
  throw new Error(`Aftenposten batch 136 krever ett eksakt Akersgata 51-objekt uten bokstav; fant ${exact.length} av ${hits.length}. Treff=${JSON.stringify(summary)}`);
}
const hit = exact[0];
const lat = hit?.representasjonspunkt?.lat;
const lon = hit?.representasjonspunkt?.lon;
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Akersgata 51 mangler representasjonspunkt');
const addressCode = String(hit?.adressekode ?? '').trim();
if (!addressCode) throw new Error('Akersgata 51 mangler adressekode');
const addressSourceObjectId = `geonorge-adresser-v1:${municipality}:${addressCode}:${number}`;
const postcode = String(hit?.postnummer ?? '').trim();
const poststed = String(hit?.poststed || hit?.kommunenavn || '').trim();

const coordinateFields = {
  lat,
  lon,
  r: 80,
  locatorType: 'historic_site',
  sourceProvider: 'manual_research',
  sourceObjectId: historicalSourceObjectId,
  address: {
    street,
    number,
    postcode,
    city: poststed === 'OSLO' ? 'Oslo' : poststed,
    country: 'NO',
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'historical_anchor',
  coordStatus: 'verified_historical_source',
  coordSource: 'Aftenposten – documented Akersgata 51 main address, 1876–2003; exact physical address point from Geonorge Adresser API v1',
  coordSourceId: historicalSourceObjectId,
  coordSourceUrl: aftenpostenHistoryUrl,
  coordType: 'historical_press_house_address_anchor',
  coordVerifiedAt: date,
  coordNote: `Batch 136 historical-source + address-first: Recorden representerer eksplisitt Aftenpostens historiske hovedadresse Akersgata 51 fra 1876 til flyttingen til Posthuset i 2003. Aftenpostens egen historikk dokumenterer 127 år i nr. 51 og forklarer at pressekomplekset senere ble utvidet til nr. 53 og, mot slutten, også nr. 55. Canonical kartpunkt bruker likevel hovedadressen 51 som eksplisitt fysisk scope; dagens Akersgata 55 overlapper derfor ikke denne recorden og forblir canonical \`vg_huset\`. Ett eksakt Geonorge-adresseobjekt (${addressSourceObjectId}) brukes som presist physical historical-anchor for Akersgata 51. Punktet er ikke en påstand om at alle Aftenpostens tilknyttede bygg eller funksjoner gjennom 1876–2003 lå i én bygningskropp.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = {
    ...place,
    name: 'Aftenposten – Akersgata 51',
    year: 1876,
    desc: 'Aftenpostens historiske hovedadresse i Akersgata 51, der avisen hadde redaksjon, ekspedisjon og setteri fra 1876 til flyttingen i 2003.',
    popupDesc: 'Aftenposten flyttet til Akersgata 51 i 1876 og gjorde adressen til kjernen i et av Norges viktigste pressehus i 127 år. Her vokste avisen fra en hovedstadsavis til en moderne stor redaksjon, tett på Stortinget, Regjeringskvartalet og den øvrige avisgaten.\n\nPressekomplekset ble etter hvert utvidet med Akersgata 53 og andre tilknyttede bygg, og mot slutten også nr. 55. Denne History Go-recorden bruker likevel Akersgata 51 som det eksplisitte historiske hovedankeret for perioden 1876–2003. Dagens Akersgata 55 er et separat canonical sted gjennom `vg_huset` og blandes ikke inn i dette kartpunktet. I 2003 flyttet Aftenposten til Posthuset ved Oslo S, før avisen i 2014 returnerte til Akersgata 55.',
    ...coordinateFields,
  };
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'first_party_history', label: 'Aftenposten – Tanta flytter hjem', url: aftenpostenHistoryUrl, lang: 'nb', verifiedAt: date },
    { type: 'historical_source', label: 'Oslo byleksikon – Aftenposten', url: osloByleksikonUrl, lang: 'nb', verifiedAt: date },
    { type: 'historical_source', label: 'Lokalhistoriewiki – Aftenposten', url: lokalhistoriewikiUrl, lang: 'nb', verifiedAt: date },
    { type: 'current_building_reference', label: 'Akersgata 51 – byggets historie', url: akersgata51Url, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_oslo_media.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('aftenposten_akersgata må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('aftenposten_akersgata mangler i split-index');
Object.assign(indexRow, {
  name: updatedPlace.name,
  lat,
  lon,
  r: updatedPlace.r,
  year: updatedPlace.year,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
});
writeJson(splitIndexFile, splitIndex);

const splitManifest = readJson(splitManifestFile);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('aftenposten_akersgata mangler i split-manifest');
manifestRow.name = updatedPlace.name;
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(splitManifestFile, splitManifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/media/oslo/places_oslo_media.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat,
    lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: updatedPlace.coordNote,
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Aftenpostens historiske hovedadresse Akersgata 51, 1876–2003',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksplisitt historisk hovedanker uten overlap mot Akersgata 55',
    'historisk kilde for 1876–2003-perioden',
    'entydig offisielt fysisk adresseobjekt for nr. 51',
  ],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Aftenposten – Tanta flytter hjem',
      sourceUrl: aftenpostenHistoryUrl,
      sourceObjectId: historicalSourceObjectId,
      sourceQuality: 'first_party_detailed_press_history',
      finding: 'Aftenpostens egen historikk dokumenterer redaksjon, ekspedisjon og setteri i Akersgata 51 fra 1876 til 2003, samt senere utvidelser av pressekomplekset.',
      canVerifyCoordinate: true,
      reason: 'Avgrenser et stabilt historisk hovedanker som ikke er identisk med dagens Akersgata 55 / vg_huset.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Aftenposten',
      sourceUrl: osloByleksikonUrl,
      sourceObjectId: 'oslobyleksikon:aftenposten-akersgata51',
      sourceQuality: 'city_historical_reference',
      finding: 'Dokumenterer hovedbygningen, Akersgata-perioden og flyttingen til Postgirobygget i 2003.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker historisk identitet og tidslinje.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Akersgata 51 – current building history',
      sourceUrl: akersgata51Url,
      sourceObjectId: 'akersgata51:building:1964-aftenposten',
      sourceQuality: 'current_property_history',
      finding: 'Dokumenterer at dagens bygg i Akersgata 51 ble reist for Aftenposten i 1964 og var avishus fram til 2003.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter fysisk kontinuitet for dagens adresseobjekt uten å gjøre dagens kontorbruk til Aftenpostens nåværende lokasjon.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geonorgeUrl,
      sourceObjectId: addressSourceObjectId,
      sourceQuality: 'official_exact_address_anchor',
      finding: `Ett eksakt offisielt adresseobjekt for Akersgata 51 ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Gir presist fysisk historical-anchor etter at det historiske hovedscopet er avklart.',
    },
  ],
  addressCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: addressSourceObjectId, address: coordinateFields.address, lat, lon, canApplyToPlace: true },
  ],
  sourceObjectCandidates: [
    { sourceProvider: 'manual_research', sourceObjectId: historicalSourceObjectId, canApplyToPlace: true },
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: addressSourceObjectId, lat, lon, coordRole: 'historical_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Overlap-konflikten er løst ved å bruke Akersgata 51 som eksplisitt historisk hovedanker og holde dagens Akersgata 55 separat som vg_huset.',
  },
  notes: [coordinateFields.coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const staleRow = '| `aftenposten_akersgata` – Aftenposten i Akersgata | needs_review | Dagens Akersgata 55 overlapper canonical `vg_huset`, mens den historiske recorden også omfatter 51/53. | Avklar om stedet skal være historisk flerankret Akersgata-record eller institusjonsrelation til A55. |';
const staleOccurrences = protocol.split(staleRow).length - 1;
if (staleOccurrences !== 1) throw new Error(`Forventet én stale aftenposten_akersgata needs_review-rad, fant ${staleOccurrences}`);
protocol = protocol.replace(`${staleRow}\n`, '');

if (!protocol.includes('| 136 | `aftenposten_akersgata` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch-innsetting');
  const insertion = `| 136 | \`aftenposten_akersgata\` | Aftenposten – Akersgata 51 | verified_historical_source | \`${historicalSourceObjectId}\` |\n\nBatch 136 (2026-07-21) løser overlap-/fleradresse-konflikten i \`aftenposten_akersgata\` ved å bruke Akersgata 51 som eksplisitt historisk hovedanker for perioden 1876–2003. Aftenpostens egen historikk dokumenterer at redaksjon, ekspedisjon og setteri hadde hovedadresse 51 gjennom 127 år, samtidig som komplekset senere ble utvidet til 53 og mot slutten også 55. Disse utvidelsene beholdes som historisk kontekst; dagens Akersgata 55 er fortsatt separat canonical \`vg_huset\`. Etter historisk identitetsavklaring brukes ett eksakt Geonorge-adresseobjekt (${addressSourceObjectId}) som presist physical historical-anchor for nr. 51. Status er \`verified_historical_source\`, ikke en påstand om at alle Aftenpostens byggfunksjoner gjennom perioden lå i én uforandret bygningskropp.\n\n`;
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-136-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  identity: 'Aftenpostens historiske hovedadresse Akersgata 51, 1876–2003',
  historicalSourceObjectId,
  addressSourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_historical_source',
  method: 'historical_source_first_then_official_address',
});

fs.writeFileSync(
  path.join(reportDir, 'sources.md'),
  `# Batch 136 source chain\n\n- Aftenposten – Tanta flytter hjem: first-party detailed history for Akersgata 51, 1876–2003, and later complex expansion.\n- Oslo byleksikon – Aftenposten: historical cross-check.\n- Akersgata51.no: current-building continuity and 1964 Aftenposten purpose-built house.\n- Geonorge Adresser API v1: exact physical address object ${addressSourceObjectId}.\n`,
);

console.log(JSON.stringify({
  batch,
  placeId,
  historicalSourceObjectId,
  addressSourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_historical_source',
}, null, 2));
