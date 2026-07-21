#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 135;
const date = '2026-07-21';
const placeId = 'dagbladet_akersgata';
const street = 'Akersgata';
const number = '49';
const municipality = '0301';
const historicalSourceObjectId = 'oslobyleksikon:dagbladet-akersgata49:1967-2008';
const osloByleksikonUrl = 'https://oslobyleksikon.no/side/Dagbladet';
const akersgataUrl = 'https://oslobyleksikon.no/side/Akersgata';
const lokalhistoriewikiUrl = 'https://lokalhistoriewiki.no/wiki/Dagbladet';
const dagbladet2008Url = 'https://www.dagbladet.no/kultur/her-er-dagbladets-beste-bilder-fra-2008/65298414';

const aggregateFile = path.join(root, 'data/places/media/oslo/places_oslo_media.json');
const childFile = path.join(root, 'data/places/media/oslo/places_oslo_media/dagbladet_akersgata.json');
const splitIndexFile = path.join(root, 'data/places/media/oslo/places_oslo_media_index.json');
const splitManifestFile = path.join(root, 'data/places/media/oslo/places_oslo_media_manifest.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/media/dagbladet_akersgata.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-135-dagbladet-akersgata49');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const norm = (value) => String(value ?? '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

// Historical identity is resolved first: this record represents the purpose-built
// Dagbladet house at Akersgata 49 from 1967 until the 2008 move to Havnelageret.
// Only then is the current official address object used as the precise physical anchor.
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
writeJson(path.join(reportDir, 'geonorge-akersgata-49.json'), payload);
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
  throw new Error(`Dagbladet batch 135 krever ett eksakt Akersgata 49-objekt uten bokstav; fant ${exact.length} av ${hits.length}. Treff=${JSON.stringify(summary)}`);
}
const hit = exact[0];
const lat = hit?.representasjonspunkt?.lat;
const lon = hit?.representasjonspunkt?.lon;
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Akersgata 49 mangler representasjonspunkt');
const addressCode = String(hit?.adressekode ?? '').trim();
if (!addressCode) throw new Error('Akersgata 49 mangler adressekode');
const addressSourceObjectId = `geonorge-adresser-v1:${municipality}:${addressCode}:${number}`;
const postcode = String(hit?.postnummer ?? '').trim();
const poststed = String(hit?.poststed || hit?.kommunenavn || '').trim();

const coordinateFields = {
  lat,
  lon,
  r: 70,
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
  coordSource: 'Oslo byleksikon – Dagbladets Akersgata 49-period 1967–2008; exact physical address point from Geonorge Adresser API v1',
  coordSourceId: historicalSourceObjectId,
  coordSourceUrl: osloByleksikonUrl,
  coordType: 'historical_press_building_address_anchor',
  coordVerifiedAt: date,
  coordNote: `Batch 135 historical-source + address-first: Recorden representerer eksplisitt Dagbladets formålsbygde avishus mot Akersgata 49 fra 1967 til flyttingen til Havnelageret i 2008, ikke alle Dagbladets adresser siden 1869. Oslo byleksikon og Lokalhistoriewiki dokumenterer denne perioden, og Dagbladets egen 2008-omtale dokumenterer flyttingen fra Akersgata 49 til Langkaia 1. Ett eksakt Geonorge-adresseobjekt (${addressSourceObjectId}) brukes som presist fysisk historical-anchor for den fortsatt eksisterende adressen. Den eldre Akersgata 36-perioden beholdes som historisk bakgrunn, men inngår ikke i canonical kartpunktet.`,
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = {
    ...place,
    name: 'Dagbladet – Akersgata 49',
    year: 1967,
    desc: 'Dagbladets historiske avishus i Akersgata 49, redaksjonens hovedbase fra 1967 til flyttingen til Havnelageret i 2008.',
    popupDesc: 'Dagbladets Akersgata-historie omfatter flere adresser, men denne History Go-recorden representerer eksplisitt avishuset mot Akersgata 49 som ble reist i 1967 og var redaksjonens base fram til 2008. Her ble avisens nyhets-, kultur- og kommentarjournalistikk produsert midt i den historiske norske avisgata, tett på konkurrerende redaksjoner og politiske institusjoner.\n\nDagbladet hadde tidligere lokaler i blant annet Akersgata 36. Denne eldre perioden er en del av institusjonshistorien, men kartpunktet her gjelder bare Akersgata 49-perioden 1967–2008. I 2008 flyttet redaksjonen til Havnelageret, og senere videre til Hasle.',
    ...coordinateFields,
  };
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'historical_source', label: 'Oslo byleksikon – Dagbladet', url: osloByleksikonUrl, lang: 'nb', verifiedAt: date },
    { type: 'site_history', label: 'Oslo byleksikon – Akersgata', url: akersgataUrl, lang: 'nb', verifiedAt: date },
    { type: 'historical_source', label: 'Lokalhistoriewiki – Dagbladet', url: lokalhistoriewikiUrl, lang: 'nb', verifiedAt: date },
    { type: 'first_party_history', label: 'Dagbladet – flyttingen fra Akersgata 49 i 2008', url: dagbladet2008Url, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_oslo_media.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('dagbladet_akersgata må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('dagbladet_akersgata mangler i split-index');
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
if (!manifestRow) throw new Error('dagbladet_akersgata mangler i split-manifest');
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
    resolvedIdentity: 'Dagbladets avishus i Akersgata 49, 1967–2008',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksplisitt tidsavgrenset hovedanker',
    'historisk kilde for Akersgata 49-perioden',
    'entydig offisielt fysisk adresseobjekt',
  ],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Dagbladet',
      sourceUrl: osloByleksikonUrl,
      sourceObjectId: historicalSourceObjectId,
      sourceQuality: 'city_historical_reference_with_period_and_address',
      finding: 'Dokumenterer Dagbladets Akersgata-forankring og at avisen holdt til i den nye bygningen mot Akersgata 49 fram til flyttingen i 2008.',
      canVerifyCoordinate: true,
      reason: 'Løser den tidligere fleradresse-konflikten ved å avgrense canonical place til 1967–2008-perioden i nr. 49.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Dagbladet',
      sourceUrl: lokalhistoriewikiUrl,
      sourceObjectId: 'lokalhistoriewiki:dagbladet:akersgata49-1967-2008',
      sourceQuality: 'documented_press_history',
      finding: 'Dokumenterer tidligere Akersgata 36-periode og den formålsbygde Akersgata 49-perioden fra 1967 til 2008.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker at nr. 49 er en eksplisitt senere periode, ikke en påstand om hele avisens historie.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Dagbladet – 2008 retrospective',
      sourceUrl: dagbladet2008Url,
      sourceObjectId: 'dagbladet:2008:move-akersgata49-langakaia1',
      sourceQuality: 'first_party_move_documentation',
      finding: 'Dagbladets egen omtale dokumenterer flyttingen fra Akersgata 49 til Langkaia 1 i 2008.',
      canVerifyCoordinate: false,
      reason: 'Førstepartskryssjekk av sluttpunktet for den representerte perioden.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geonorgeUrl,
      sourceObjectId: addressSourceObjectId,
      sourceQuality: 'official_exact_address_anchor',
      finding: `Ett eksakt offisielt adresseobjekt for Akersgata 49 ved ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Gir det presise fysiske ankeret etter at historiske kilder har avgrenset perioden til nr. 49.',
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
    nextAction: 'Fleradresse-konflikten er løst ved å gjøre 1967–2008-perioden i Akersgata 49 til eksplisitt canonical fysisk scope.',
  },
  notes: [coordinateFields.coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
const staleRow = '| `dagbladet_akersgata` – Dagbladet i Akersgata | needs_review | Historisk redaksjonsforankring omfatter både Akersgata 36 og 47/49, men recorden har bare ett punkt. | Krever flerankre eller et eksplisitt tidsavgrenset hovedanker. |';
const staleOccurrences = protocol.split(staleRow).length - 1;
if (staleOccurrences !== 1) throw new Error(`Forventet én stale dagbladet_akersgata needs_review-rad, fant ${staleOccurrences}`);
protocol = protocol.replace(`${staleRow}\n`, '');

if (!protocol.includes('| 135 | `dagbladet_akersgata` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch-innsetting');
  const insertion = `| 135 | \`dagbladet_akersgata\` | Dagbladet – Akersgata 49 | verified_historical_source | \`${historicalSourceObjectId}\` |\n\nBatch 135 (2026-07-21) løser den tidligere fleradresse-konflikten i \`dagbladet_akersgata\` ved å avgrense canonical kartsted til Dagbladets formålsbygde avishus mot Akersgata 49 fra 1967 til flyttingen i 2008. Den eldre Akersgata 36-perioden beholdes som institusjonshistorie, men inngår ikke i kartpunktets fysiske scope. Oslo byleksikon og Lokalhistoriewiki dokumenterer perioden, og Dagbladets egen 2008-omtale dokumenterer flyttingen fra nr. 49 til Havnelageret. Etter historisk identitetsavklaring brukes ett eksakt Geonorge-adresseobjekt (${addressSourceObjectId}) som presist fysisk historical-anchor. Status er \`verified_historical_source\`, ikke en påstand om at Dagbladet lå i nr. 49 gjennom hele historien siden 1869.\n\n`;
  protocol = protocol.replace(marker, insertion + marker);
}
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-135-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  identity: 'Dagbladets avishus i Akersgata 49, 1967–2008',
  historicalSourceObjectId,
  addressSourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_historical_source',
  method: 'historical_source_first_then_official_address',
});

fs.writeFileSync(
  path.join(reportDir, 'sources.md'),
  `# Batch 135 source chain\n\n- Oslo byleksikon – Dagbladet: primary historical identity for the Akersgata 49 period.\n- Lokalhistoriewiki – Dagbladet: cross-checks the earlier Akersgata 36 period and 1967–2008 nr. 49 period.\n- Dagbladet 2008 retrospective: first-party confirmation of the move from Akersgata 49 to Langkaia 1.\n- Geonorge Adresser API v1: exact physical address object ${addressSourceObjectId}.\n`,
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
