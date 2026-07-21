#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 134;
const date = '2026-07-21';
const placeId = 'norges_varemesse';
const lat = 59.9206;
const lon = 10.6791;
const historicalSourceObjectId = 'lokalhistoriewiki:norges-varemesse-sjolyst';
const lhwUrl = 'https://lokalhistoriewiki.no/wiki/Norges_Varemesse_(Sj%C3%B8lyst)';
const osloByleksikonUrl = 'https://oslobyleksikon.no/side/Norges_Varemesse';
const sjolyststrandaUrl = 'https://oslobyleksikon.no/side/Sj%C3%B8lyststranda';
const snlUrl = 'https://snl.no/Norges_Varemesse';
const novaHistoryUrl = 'https://novaspektrum.no/rapport/2023/stiftelsen-nova-spektrum-i-mer-enn-100-ar/';

const aggregateFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv.json');
const childFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv/norges_varemesse.json');
const splitIndexFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv_index.json');
const splitManifestFile = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/naeringsliv/norges_varemesse.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-134-norges-varemesse-sjolyst');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const coordinateFields = {
  lat,
  lon,
  r: 180,
  locatorType: 'historic_site',
  sourceProvider: 'manual_research',
  sourceObjectId: historicalSourceObjectId,
  address: {
    street: 'Drammensveien',
    number: '154',
    city: 'Oslo',
    country: 'NO',
  },
  geocodeAccuracy: 'historical_approximation',
  coordRole: 'historical_anchor',
  coordStatus: 'verified_historical_source',
  coordSource: 'Lokalhistoriewiki – georeferenced Norges Varemesse (Sjølyst), cross-checked with Oslo byleksikon',
  coordSourceId: historicalSourceObjectId,
  coordSourceUrl: lhwUrl,
  coordType: 'demolished_historical_venue_anchor',
  coordVerifiedAt: date,
  coordNote: 'Batch 134 historical-source-first: Recorden representerer eksplisitt Norges Varemesses Sjølystsenter/Messehall i Drammensveien 154 fra 1962 til flyttingen i 2002, ikke institusjonen gjennom alle lokasjoner. Lokalhistoriewikis stedfestede artikkel for det tidligere anlegget oppgir 59.9206, 10.6791 og dokumenterer at dagens Messepromenaden går mellom blokkene og næringsbyggene der Messehallen lå. Oslo byleksikon dokumenterer adressen, perioden, rivningen og at Sjølyststranda ble bygget på den tidligere messeeiendommen. Punktet er derfor et kildebelagt historisk områdeanker, ikke et påstått eksakt bygningssenter eller et moderne adressepunkt.',
};

function applyToPlace(place) {
  if (place?.id !== placeId) return place;
  const updated = {
    ...place,
    name: 'Norges Varemesse – Sjølystsenteret',
    year: 1962,
    desc: 'Historisk messe- og utstillingsanlegg på Sjølyst, der Norges Varemesse holdt til fra 1962 til flyttingen til Lillestrøm i 2002.',
    popupDesc: 'Norges Varemesse åpnet Sjølystsenteret, også kalt Messehallen, i Drammensveien 154 i 1962. I fire tiår var anlegget et av landets viktigste møtesteder for industri, handel, produktlanseringer, publikumsmesser, konferanser og store kulturarrangementer.\n\nHistory Go-recorden representerer dette konkrete Oslo-stedet og perioden 1962–2002, ikke stiftelsen Norges Varemesse gjennom hele historien fra 1920 og ikke dagens NOVA Spektrum i Lillestrøm. Etter flyttingen ble Messehallen revet, og den tidligere messeeiendommen ble bygget ut som Sjølyststranda. Dagens Messepromenaden går gjennom området der anlegget lå og bevarer navnesporet etter messevirksomheten.',
    ...coordinateFields,
  };
  updated.externalLinks = Array.isArray(updated.externalLinks) ? [...updated.externalLinks] : [];
  for (const link of [
    { type: 'historical_source', label: 'Lokalhistoriewiki – Norges Varemesse (Sjølyst)', url: lhwUrl, lang: 'nb', verifiedAt: date },
    { type: 'historical_source', label: 'Oslo byleksikon – Norges Varemesse', url: osloByleksikonUrl, lang: 'nb', verifiedAt: date },
    { type: 'site_history', label: 'Oslo byleksikon – Sjølyststranda', url: sjolyststrandaUrl, lang: 'nb', verifiedAt: date },
    { type: 'reference', label: 'Store norske leksikon – Norges Varemesse', url: snlUrl, lang: 'nb', verifiedAt: date },
    { type: 'institution_history', label: 'NOVA Spektrum – mer enn 100 års historie', url: novaHistoryUrl, lang: 'nb', verifiedAt: date },
  ]) {
    if (!updated.externalLinks.some((item) => item?.url === link.url)) updated.externalLinks.push(link);
  }
  return updated;
}

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate)) throw new Error('places_naeringsliv.json må være array');
if (aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error('norges_varemesse må finnes nøyaktig én gang i aggregate');
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map(applyToPlace);
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const splitIndex = readJson(splitIndexFile);
const indexRow = splitIndex.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('norges_varemesse mangler i split-index');
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
if (!manifestRow) throw new Error('norges_varemesse mangler i split-manifest');
manifestRow.name = updatedPlace.name;
splitManifest.source_sha256 = sha256File(aggregateFile);
splitManifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(splitManifestFile, splitManifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/naeringsliv/oslo/places_naeringsliv.json',
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
    resolvedIdentity: 'Norges Varemesse – Sjølystsenteret/Messehallen, Drammensveien 154, 1962–2002',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'entydig fysisk Oslo-scope',
    'historisk kilde som binder Sjølyst-perioden til Drammensveien 154',
    'kildebelagt historisk områdeanker for den revne messeeiendommen',
  ],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Norges Varemesse (Sjølyst)',
      sourceUrl: lhwUrl,
      sourceObjectId: historicalSourceObjectId,
      sourceQuality: 'georeferenced_historical_site_article',
      finding: 'Artikkelen identifiserer Messehallen/Sjølystsenteret i Drammensveien 154, oppgir koordinaten 59.9206, 10.6791 og beskriver at Messepromenaden i dag går gjennom området der Messehallen lå.',
      canVerifyCoordinate: true,
      reason: 'Gir et eksplisitt stedfestet historisk områdeanker med stabil kildeidentitet for det revne anlegget.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Norges Varemesse',
      sourceUrl: osloByleksikonUrl,
      sourceObjectId: 'oslobyleksikon:norges-varemesse-sjolyst:1962-2002',
      sourceQuality: 'city_historical_reference',
      finding: 'Dokumenterer tidligere bygning i Drammensveien 154, åpningen av Sjølystsenteret i 1962, flyttingen i 2002 og etterfølgende rivning.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker historisk identitet, adresse og periode; koordinaten kommer fra den stedfestede Lokalhistoriewiki-artikkelen.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Sjølyststranda',
      sourceUrl: sjolyststrandaUrl,
      sourceObjectId: 'oslobyleksikon:sjolyststranda:former-varemesse-site',
      sourceQuality: 'current_site_continuity_reference',
      finding: 'Dokumenterer at dagens Sjølyststranda er boligområdet bygget der Norges Varemesse tidligere lå.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker tomtekontinuitet etter rivningen uten å late som dagens boliger er den historiske Messehallen.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'manual_research', sourceObjectId: historicalSourceObjectId, canApplyToPlace: true },
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { sourceProvider: 'manual_research', sourceObjectId: historicalSourceObjectId, lat, lon, coordRole: 'historical_anchor', canApplyToPlace: true },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Identity-konflikten er løst ved å avgrense recorden til Sjølystsenteret/Messehallen 1962–2002 og bruke et dokumentert historisk områdeanker.',
  },
  notes: [coordinateFields.coordNote],
});

const protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('| 134 | `norges_varemesse` |')) {
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch-innsetting');
  const insertion = `| 134 | \`norges_varemesse\` | Norges Varemesse – Sjølystsenteret | verified_historical_source | \`${historicalSourceObjectId}\` |\n\nBatch 134 (2026-07-21) løser identity-konflikten i \`norges_varemesse\` ved å avgrense Oslo-recorden til det konkrete Sjølystsenteret/Messehallen i Drammensveien 154, 1962–2002, i stedet for institusjonen Norges Varemesse gjennom alle lokasjoner. Et obligatorisk address-first-forsøk viste at den revne adressen 154 ikke lenger finnes som aktivt Geonorge-objekt; ingen moderne naboadresse brukes som proxy. Lokalhistoriewikis stedfestede artikkel for det tidligere anlegget oppgir 59.9206, 10.6791 og dokumenterer at dagens Messepromenaden går gjennom området der Messehallen lå. Oslo byleksikon dokumenterer adressen, perioden, rivningen og at Sjølyststranda ble bygget på den tidligere messeeiendommen. Punktet behandles derfor som \`verified_historical_source\` med \`historical_approximation\`/\`historical_anchor\`, ikke som et eksakt nåværende bygningspunkt.\n\n`;
  fs.writeFileSync(protocolFile, protocol.replace(marker, insertion + marker));
}

writeJson(path.join(reportDir, 'batch-134-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  identity: 'Norges Varemesse – Sjølystsenteret/Messehallen, 1962–2002',
  sourceObjectId: historicalSourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_historical_source',
  method: 'historical_source_first',
  addressFirstOutcome: 'Drammensveien 154 no longer exists as an active Geonorge address object; no current proxy address used.',
});

fs.writeFileSync(
  path.join(reportDir, 'sources.md'),
  '# Batch 134 source chain\n\n- Lokalhistoriewiki – Norges Varemesse (Sjølyst): primary georeferenced historical-site anchor, 59.9206 / 10.6791.\n- Oslo byleksikon – Norges Varemesse: exact historical address, period, move and demolition.\n- Oslo byleksikon – Sjølyststranda: confirms current redevelopment occupies the former Varemesse site.\n- Address-first attempt: no active exact Geonorge Drammensveien 154 object; no modern proxy address accepted.\n',
);

console.log(JSON.stringify({
  batch,
  placeId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat, lon },
  status: 'verified_historical_source',
  sourceObjectId: historicalSourceObjectId,
}, null, 2));
