#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const LIT_DIR = path.join(ROOT, 'data/places/litteratur/oslo');
const AGG = path.join(LIT_DIR, 'places_litteratur.json');
const INDEX = path.join(LIT_DIR, 'places_litteratur_index.json');
const SPLIT_MANIFEST = path.join(LIT_DIR, 'places_litteratur_manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const EVIDENCE_MANIFEST = path.join(ROOT, 'data/coordinate-evidence/manifest.json');
const EVIDENCE_DIR = path.join(ROOT, 'data/coordinate-evidence/oslo/litteratur');
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-22');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8');
};
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const updates = {
  kulturkirken_jakob_litteratur: {
    lat: 59.9180329772343,
    lon: 10.754119014784367,
    r: 60,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-adresser-v1:0301:12782:14',
    address: { street: 'Hausmanns gate', number: '14', postcode: '0182', city: 'Oslo', country: 'NO' },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-adresser-v1:0301:12782:14',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Hausmanns%20gate%2014%20Oslo',
    coordType: 'address_point',
    coordVerifiedAt: DATE,
    coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Kulturkirken Jakob i Hausmanns gate 14. Punktet er et konkret display-anker for kirkebygget og litteraturarenaen, ikke et generelt områdeanker.'
  },
  ruth_maier_minne: {
    lat: 59.922697,
    lon: 10.737988,
    r: 35,
    locatorType: 'poi',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q44179381',
    address: { street: 'Dalsbergstien', number: '3', postcode: '0170', city: 'Oslo', country: 'NO' },
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q44179381 – snublestein til minne om Ruth Maier; kildehenvisning til snublestein.no',
    coordSourceId: 'wikidata:Q44179381',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q44179381',
    coordType: 'monument_point',
    coordVerifiedAt: DATE,
    coordNote: 'Presist objektanker for snublesteinen til minne om Ruth Maier ved Dalsbergstien 3. Wikidata-objektet oppgir selve snublesteinens koordinat og viser til snublestein.no; Geonorge-adressen Dalsbergstien 3 er kontrollert separat som fysisk kontekst. Recorden ankres til minnesmerket, ikke til den senere Ruth Maiers plass.'
  },
  inger_hagerups_plass: {
    lat: 59.9221744,
    lon: 10.853756,
    r: 70,
    locatorType: 'square',
    sourceProvider: 'manual_research',
    sourceObjectId: 'lokalhistoriewiki:Inger_Hagerups_plass',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Lokalhistoriewiki – Inger Hagerups plass; kryssjekket mot Oslo byleksikon',
    coordSourceId: 'lokalhistoriewiki:Inger_Hagerups_plass',
    coordSourceUrl: 'https://lokalhistoriewiki.no/Inger_Hagerups_plass',
    coordType: 'square_area_anchor',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker for snuplassen i enden av Hagapynten som bærer navnet Inger Hagerups plass. Lokalhistoriewiki oppgir punktkoordinatet, og Oslo byleksikon bekrefter den fysiske identiteten nær Haugerud T-banestasjon. Det tidligere punktet lå flere kilometer feil og er korrigert.'
  },
  oscar_braaten_statuen: {
    lat: 59.9309838,
    lon: 10.7578832,
    r: 35,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:10819902960',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 10819902960 – Oskar Braaten-bysten ved Beierbrua',
    coordSourceId: 'osm-node:10819902960',
    coordSourceUrl: 'https://www.openstreetmap.org/node/10819902960',
    coordType: 'monument_point',
    coordVerifiedAt: DATE,
    coordNote: 'Presist objektanker for Oskar Braaten-bysten ved Beierbrua, overfor Hønse-Lovisas hus. OSM node 10819902960 identifiserer selve kunstverket som en byste. Det tidligere punktet representerte ikke monumentets faktiske plassering og er korrigert.'
  },
  alexander_kiellands_plass: {
    lat: 59.9279501,
    lon: 10.750098,
    r: 160,
    locatorType: 'square',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-relation:7723252',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 7723252 – Alexander Kiellands plass; kryssjekket mot Oslo kommune',
    coordSourceId: 'osm-relation:7723252',
    coordSourceUrl: 'https://www.openstreetmap.org/relation/7723252',
    coordType: 'square_area_anchor',
    coordVerifiedAt: DATE,
    coordNote: 'Objektbasert områdeanker for Alexander Kiellands plass. OSM relation 7723252 identifiserer den navngitte plassen, og Oslo kommune avgrenser parken mellom Uelands gate, Maridalsveien og Waldemar Thranes gate. Det gamle punktet lå utenfor den faktiske plassen og er korrigert.'
  }
};

const aggregate = readJson(AGG);
const index = readJson(INDEX);
if (!Array.isArray(aggregate) || !Array.isArray(index)) throw new Error('Litteratur aggregate/index har uventet format');

for (const [id, patch] of Object.entries(updates)) {
  const aggRow = aggregate.find((p) => p?.id === id);
  if (!aggRow) throw new Error(`Mangler ${id} i aggregate`);
  Object.assign(aggRow, patch);

  const childPath = path.join(LIT_DIR, 'places_litteratur', `${id}.json`);
  const child = readJson(childPath);
  if (child?.id !== id) throw new Error(`Uventet child-id i ${childPath}`);
  Object.assign(child, patch);
  writeJson(childPath, child);

  const idxRow = index.find((p) => p?.id === id);
  if (!idxRow) throw new Error(`Mangler ${id} i kategoriindeks`);
  for (const key of ['lat','lon','r','coordStatus','coordType','coordSource','coordVerifiedAt','coordNote']) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) idxRow[key] = patch[key];
  }
}
writeJson(AGG, aggregate);
writeJson(INDEX, index);

const splitManifest = readJson(SPLIT_MANIFEST);
splitManifest.source_sha256 = sha256(AGG);
splitManifest.generated_at = new Date().toISOString();
for (const id of Object.keys(updates)) {
  const row = splitManifest.places?.find((p) => p?.id === id);
  if (!row) throw new Error(`Mangler ${id} i split-manifest`);
  row.sha256 = sha256(path.join(LIT_DIR, row.file));
}
writeJson(SPLIT_MANIFEST, splitManifest);

const appliedEvidence = [
  {
    id: 'kulturkirken_jakob_litteratur', name: 'Kulturkirken Jakob', identity: 'Kulturkirken Jakob i Hausmanns gate 14', provider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: updates.kulturkirken_jakob_litteratur.coordSourceUrl, sourceId: updates.kulturkirken_jakob_litteratur.sourceObjectId, quality: 'official_address_plus_documented_identity', finding: 'Geonorge gir ett tydelig offisielt adressetreff for Hausmanns gate 14.', locator: 'building'
  },
  {
    id: 'ruth_maier_minne', name: 'Ruth Maier-minnesmerke', identity: 'Snublesteinen til minne om Ruth Maier ved Dalsbergstien 3', provider: 'manual_research', sourceName: 'Wikidata Q44179381 med referanse til snublestein.no', sourceUrl: updates.ruth_maier_minne.coordSourceUrl, sourceId: updates.ruth_maier_minne.sourceObjectId, quality: 'stable_object_coordinate_crosschecked_with_official_address', finding: 'Wikidata-objektet identifiserer selve snublesteinen og oppgir punktkoordinat; Dalsbergstien 3 er separat kontrollert i Geonorge.', locator: 'poi'
  },
  {
    id: 'inger_hagerups_plass', name: 'Inger Hagerups plass', identity: 'Snuplassen i enden av Hagapynten som bærer navnet Inger Hagerups plass', provider: 'manual_research', sourceName: 'Lokalhistoriewiki – Inger Hagerups plass', sourceUrl: updates.inger_hagerups_plass.coordSourceUrl, sourceId: updates.inger_hagerups_plass.sourceObjectId, quality: 'stable_named_place_coordinate_crosschecked_with_oslo_byleksikon', finding: 'Kilden oppgir punktkoordinat og identifiserer plassen som snuplassen i enden av Hagapynten; Oslo byleksikon bekrefter samme fysiske sted.', locator: 'square'
  },
  {
    id: 'oscar_braaten_statuen', name: 'Oscar Braaten-statuen', identity: 'Oskar Braaten-bysten ved Beierbrua', provider: 'osm', sourceName: 'OpenStreetMap node 10819902960', sourceUrl: updates.oscar_braaten_statuen.coordSourceUrl, sourceId: updates.oscar_braaten_statuen.sourceObjectId, quality: 'stable_object_source', finding: 'OSM-noden identifiserer selve kunstverket som en byste med navnet Oskar Braaten.', locator: 'poi'
  },
  {
    id: 'alexander_kiellands_plass', name: 'Alexander Kiellands plass', identity: 'Den offentlige plassen/parken mellom Uelands gate, Maridalsveien og Waldemar Thranes gate', provider: 'osm', sourceName: 'OpenStreetMap relation 7723252 – Alexander Kiellands plass', sourceUrl: updates.alexander_kiellands_plass.coordSourceUrl, sourceId: updates.alexander_kiellands_plass.sourceObjectId, quality: 'stable_area_source_crosschecked_with_municipality', finding: 'OSM-relasjonen identifiserer den navngitte plassen; Oslo kommunes parkside bekrefter fysisk avgrensning.', locator: 'square'
  }
];

for (const meta of appliedEvidence) {
  const p = aggregate.find((row) => row.id === meta.id);
  const evidence = {
    placeId: meta.id,
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat: p.lat, lon: p.lon, r: p.r, coordStatus: p.coordStatus, coordSource: p.coordSource, coordType: p.coordType, coordNote: p.coordNote
    },
    identity: {
      currentName: p.name,
      resolvedIdentity: meta.identity,
      identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: meta.locator, requiresSplit: false, splitReason: ''
    },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{
      sourceProvider: meta.provider, sourceName: meta.sourceName, sourceUrl: meta.sourceUrl, sourceObjectId: meta.sourceId, sourceQuality: meta.quality,
      finding: meta.finding, canVerifyCoordinate: true, reason: p.coordNote
    }],
    addressCandidates: p.address ? [{ address: `${p.address.street} ${p.address.number} ${p.address.city}`, sourceProvider: meta.provider, sourceObjectId: meta.sourceId, canApplyToPlace: true }] : [],
    sourceObjectCandidates: [{ sourceProvider: meta.provider, sourceObjectId: meta.sourceId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: p.lat, lon: p.lon, coordRole: p.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [p.coordNote]
  };
  writeJson(path.join(EVIDENCE_DIR, `${meta.id}.json`), evidence);
}

const needsReview = [
  {
    id: 'norli_universitetsgata', name: 'Norli Universitetsgata', current: { lat: 59.9181, lon: 10.7385, r: 120 }, locator: 'building',
    sourceName: 'Norli / Geonorge Adresser API v1', sourceUrl: 'https://www.norli.no/kundeservice/omoss', sourceId: 'norli:universitetsgata-22-24',
    problem: 'Norli dokumenterer adressen som Universitetsgata 22–24, mens Geonorge gir separate, entydige adressepunkter for både 22 og 24. Ingen av kildene identifiserer ett av dem som canonical hovedinngang eller representativt hovedanker.',
    next: 'Finn eksplisitt hovedinngang/POI eller bygningsgeometri for hele 22–24-komplekset før canonical koordinat godkjennes.'
  },
  {
    id: 'sigrid_undset_statue', name: 'Sigrid Undset-statuen', current: { lat: 59.9242, lon: 10.7297, r: 120 }, locator: 'poi',
    sourceName: 'Oslo byleksikon / Oslo kommune – Stensparken og 17. mai-bekransning', sourceUrl: 'https://oslobyleksikon.no/side/Stensparken', sourceId: 'oslobyleksikon:stensparken:sigrid-undset-skulptur',
    problem: 'Kildene dokumenterer statuen i Stensparken, i sørenden / ved Fagerborg kirke, men det ble ikke funnet et entydig kildeobjekt med maskinlesbar punktkoordinat. Dagens recordpunkt ligger utenfor riktig plassering og kan ikke godkjennes.',
    next: 'Finn kommunalt kunstregister, Wikidata/OSM-objekt eller annen stabil objektkilde med eksakt punkt før koordinaten flyttes.'
  }
];
for (const item of needsReview) {
  writeJson(path.join(EVIDENCE_DIR, `${item.id}.json`), {
    placeId: item.id,
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_geometry',
    currentCoordinate: { ...item.current, coordStatus: 'needs_source', coordSource: item.sourceName, coordType: item.locator === 'building' ? 'building_center' : 'monument_point', coordNote: item.problem },
    identity: { currentName: item.name, resolvedIdentity: item.name, identityStatus: 'resolved', identityProblem: item.problem, locatorTypeCandidate: item.locator, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['ett entydig fysisk hovedanker', 'stabil kildeidentitet for selve objektet', 'visuell kontroll mot nærliggende steder'],
    evidence: [{ sourceProvider: 'manual_research', sourceName: item.sourceName, sourceUrl: item.sourceUrl, sourceObjectId: item.sourceId, sourceQuality: 'identity_confirmed_coordinate_unresolved', finding: item.problem, canVerifyCoordinate: false, reason: item.problem }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'manual_research', sourceObjectId: item.sourceId, canApplyToPlace: false }],
    geometryCandidates: [],
    coordinateCandidates: [{ ...item.current, coordRole: item.locator === 'building' ? 'display_marker' : 'display_marker', canApplyToPlace: false }],
    decision: { canBecomeVerified: false, blockedReason: item.problem, nextAction: item.next },
    notes: [item.problem]
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
const evidencePaths = [
  'oslo/litteratur/kulturkirken_jakob_litteratur.json',
  'oslo/litteratur/norli_universitetsgata.json',
  'oslo/litteratur/sigrid_undset_statue.json',
  'oslo/litteratur/ruth_maier_minne.json',
  'oslo/litteratur/inger_hagerups_plass.json',
  'oslo/litteratur/oscar_braaten_statuen.json',
  'oslo/litteratur/alexander_kiellands_plass.json'
];
for (const rel of evidencePaths) if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = protocol.replace(
  'Oslo-tabellen inneholder nå 124 verifiserte eller kildekontrollerte canonical steder. Batch 21 starter den sekundære Oslo-kildekøen og godkjenner 6 nye ankere: Ekebergparken, Camilla Collett-statuen, Henrik Wergeland-statuen, Grotten, Eldorado Bokhandel, Gamle Deichman. Ibsen-sitatene står som nye dokumenterte `needs_review`-utfall. 10 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen bruker Oslo-manifeststier i leksikografisk rekkefølge, bevarer record-rekkefølgen i hvert manifest og hopper over placeId-er som allerede er kontrollert.',
  'Oslo-tabellen inneholder nå 129 verifiserte eller kildekontrollerte canonical steder. Batch 22 godkjenner 5 nye ankere: Kulturkirken Jakob, Ruth Maier-minnesmerket, Inger Hagerups plass, Oskar Braaten-bysten og Alexander Kiellands plass. Norli Universitetsgata og Sigrid Undset-statuen står som nye dokumenterte `needs_review`-utfall. 12 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen bruker Oslo-manifeststier i leksikografisk rekkefølge, bevarer record-rekkefølgen i hvert manifest og hopper over placeId-er som allerede er kontrollert.'
);
const afterBatch21 = '| 21 | `gamle_deichman` | Gamle Deichman | verified | `geonorge-adresser-v1:0301:10244:4` |';
const batch22Rows = `${afterBatch21}\n| 22 | \`kulturkirken_jakob_litteratur\` | Kulturkirken Jakob | verified | \`geonorge-adresser-v1:0301:12782:14\` |\n| 22 | \`ruth_maier_minne\` | Ruth Maier-minnesmerke | verified_geometry | \`wikidata:Q44179381\` |\n| 22 | \`inger_hagerups_plass\` | Inger Hagerups plass | verified_geometry | \`lokalhistoriewiki:Inger_Hagerups_plass\` |\n| 22 | \`oscar_braaten_statuen\` | Oscar Braaten-statuen | verified_geometry | \`osm-node:10819902960\` |\n| 22 | \`alexander_kiellands_plass\` | Alexander Kiellands plass | verified_geometry | \`osm-relation:7723252\` |`;
if (!protocol.includes('| 22 | `kulturkirken_jakob_litteratur`')) protocol = protocol.replace(afterBatch21, batch22Rows);
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 124 verifiserte eller kildekontrollerte canonical Oslo-stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 129 verifiserte eller kildekontrollerte canonical Oslo-stedene.');
const ibsenRow = '| `ibsen_quotes` – Ibsen sitater / Sitatgaten | needs_review | Den fysiske installasjonen består av 69 sitater langs Karl Johans gate og Henrik Ibsens gate, men recorden har bare ett punkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller flere kildebelagte ankere før canonical koordinat kan godkjennes. |';
const reviewRows = `${ibsenRow}\n| \`norli_universitetsgata\` – Norli Universitetsgata | needs_review | Den offisielle adressen er Universitetsgata 22–24, mens Geonorge gir separate punkter for 22 og 24 uten kilde som identifiserer ett canonical hovedanker. | Krever eksplisitt hovedinngang/POI eller bygningsgeometri for hele 22–24-komplekset. |\n| \`sigrid_undset_statue\` – Sigrid Undset-statuen | needs_review | Kildene dokumenterer statuen i Stensparken ved Fagerborg kirke, men ingen entydig maskinlesbar objektkoordinat ble funnet; dagens punkt ligger feil. | Krever kommunalt kunstobjekt, Wikidata/OSM-objekt eller annen stabil objektkilde med eksakt punkt. |`;
if (!protocol.includes('| `norli_universitetsgata` – Norli Universitetsgata')) protocol = protocol.replace(ibsenRow, reviewRows);
protocol = protocol.replace('- Neste nye Oslo-kontroll er nummer 133 og starter batch 22.', '- Neste nye Oslo-kontroll er nummer 140 og starter batch 23.');
protocol = protocol.replace('- Batch 21 er fullført med 6 godkjente ankere og 1 nye dokumenterte `needs_review`-utfall.', '- Batch 22 er fullført med 5 godkjente ankere og 2 nye dokumenterte `needs_review`-utfall.');
fs.writeFileSync(PROTOCOL, protocol, 'utf8');

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, 'README.md'), `# Oslo koordinatkontroll – batch 22\n\nDato: ${DATE}\n\nBatch 22 fortsetter den sekundære Oslo-kildekøen med kontroll 133–139. Fem koordinater er godkjent og to kontroller er avsluttet som \`needs_review\`.\n\n| kontroll | placeId | resultat | kildeobjekt / avgjørelse |\n|---:|---|---|---|\n| 133 | \`kulturkirken_jakob_litteratur\` | verified | \`geonorge-adresser-v1:0301:12782:14\` |\n| 134 | \`norli_universitetsgata\` | needs_review | Universitetsgata 22–24 gir to adressepunkter uten dokumentert hovedanker |\n| 135 | \`sigrid_undset_statue\` | needs_review | identitet i Stensparken dokumentert, eksakt objektpunkt ikke funnet |\n| 136 | \`ruth_maier_minne\` | verified_geometry | \`wikidata:Q44179381\` |\n| 137 | \`inger_hagerups_plass\` | verified_geometry | \`lokalhistoriewiki:Inger_Hagerups_plass\` |\n| 138 | \`oscar_braaten_statuen\` | verified_geometry | \`osm-node:10819902960\` |\n| 139 | \`alexander_kiellands_plass\` | verified_geometry | \`osm-relation:7723252\` |\n\n## Viktige korrigeringer\n\n- Inger Hagerups plass flyttes fra et feilpunkt til den dokumenterte snuplassen i enden av Hagapynten.\n- Oscar Braaten-statuen flyttes til den konkrete Oskar Braaten-bysten ved Beierbrua.\n- Alexander Kiellands plass flyttes til den faktiske plassen mellom Uelands gate, Maridalsveien og Waldemar Thranes gate.\n- Ruth Maier-recorden avgrenses til den konkrete snublesteinen ved Dalsbergstien 3, ikke Ruth Maiers plass.\n\n## Metode\n\nKonkrete adressekandidater er kjørt gjennom repoets normative Geonorge-finner, og terminaloutput er lagret i denne rapportmappen med \`tee\`. Monumenter og plasser er behandlet som egne fysiske objekttyper. Ingen midpoint eller nærmeste-treff er konstruert for Norli eller Sigrid Undset-statuen.\n`, 'utf8');

console.log('Applied Oslo coordinate control batch 22: 5 verified, 2 needs_review');
