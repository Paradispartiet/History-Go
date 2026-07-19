import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = '2026-07-19';
const aggregatePath = path.join(root, 'data/places/litteratur/oslo/places_litteratur.json');
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceManifestPath = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-30');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const places = read(aggregatePath);
const byId = new Map(places.map((place) => [place.id, place]));
const oskar = byId.get('oscar_braaten_statuen');
const alexander = byId.get('alexander_kiellands_plass');
if (!oskar || !alexander) throw new Error('Batch 30 places missing from literature aggregate');

const before = {
  oscar_braaten_statuen: { lat: oskar.lat, lon: oskar.lon },
  alexander_kiellands_plass: { lat: alexander.lat, lon: alexander.lon },
};

Object.assign(oskar, {
  name: 'Oskar Braaten-bysten',
  lat: 59.9309838,
  lon: 10.7578832,
  r: 45,
  year: 1961,
  desc: 'Bronsebyste av Oskar Braaten ved Beierbrua, utført av Arne Durban og avduket i 1961 til minne om forfatteren som skildret arbeidermiljøene langs Akerselva.',
  popupDesc: 'Bysten av Oskar Braaten står ved Beierbrua, et sted som er tett knyttet til forfatterskapet hans om fabrikkjenter, arbeidere og hverdagsliv langs Akerselva. Bronsebysten er utført av Arne Durban og ble avduket i 1961. Det tidligere History Go-punktet i Glads vei var feilplassert og bygget på en feil identitet; det eksakte OSM-kunstobjektet ved Beierbrua brukes nå som canonical markør.',
  locatorType: 'poi',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-node:10819902960',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'monument',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap node 10819902960 – OSKAR BRAATEN 1881 1939',
  coordSourceId: 'osm-node:10819902960',
  coordSourceUrl: 'https://www.openstreetmap.org/node/10819902960',
  coordVerifiedAt: today,
  coordNote: 'Presist objektanker for selve Oskar Braaten-bysten ved Beierbrua. Store norske leksikon og Lokalhistoriewiki dokumenterer bronsebysten av Arne Durban ved broen og avduking i 1961; OSM node 10819902960 er et eksakt tourism=artwork-punkt med navnet OSKAR BRAATEN 1881 1939. Det gamle punktet i Glads vei er erstattet.',
});
oskar.quiz_profile = {
  ...oskar.quiz_profile,
  signature_features: [
    'Oskar Braaten-bysten ved Beierbrua',
    'bronsebyste av Arne Durban avduket i 1961',
    'minnested i landskapet Braaten skildret langs Akerselva'
  ],
  must_include: [
    'plasseringen ved Beierbrua',
    'koblingen mellom Braatens forfatterskap og arbeidermiljøene langs Akerselva'
  ],
  notes: 'Skal spørres som konkret forfatterbyste ved Beierbrua, ikke som en statue i Glads vei.'
};

Object.assign(alexander, {
  lat: 59.9270478,
  lon: 10.7504014,
  year: 1914,
  desc: 'Park og plass oppkalt etter forfatteren Alexander Kielland i 1914, mellom Uelands gate, Maridalsveien og Waldemar Thranes gate.',
  popupDesc: 'Alexander Kiellands plass fikk navnet sitt i 1914 til minne om forfatteren Alexander L. Kielland. Oslo kommune avgrenser parken mellom Uelands gate, Maridalsveien og Waldemar Thranes gate, og Oslo byleksikon dokumenterer at området ble opparbeidet til park i 1918. Kartpunktet er nå hentet fra den konkrete OSM-parkpolygonen som dekker dette dokumenterte arealet, i stedet for det tidligere feilplasserte punktet lenger øst.',
  locatorType: 'park',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:3610607',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordType: 'park_center',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 3610607 – parkpolygon for Alexander Kiellands plass',
  coordSourceId: 'osm-way:3610607',
  coordSourceUrl: 'https://www.openstreetmap.org/way/3610607',
  coordVerifiedAt: today,
  coordNote: 'Kartverket SSR og Geonorge adresse ga ingen direkte treff. Oslo kommune dokumenterer parken mellom Uelands gate, Maridalsveien og Waldemar Thranes gate. OSM way 3610607 er den konkrete parkpolygonen innenfor denne avgrensningen; polygonens representasjonspunkt brukes som area_anchor, ikke en naboadresse eller et beregnet gatepunkt.',
});
alexander.quiz_profile = {
  ...alexander.quiz_profile,
  signature_features: [
    'park og plass oppkalt etter Alexander Kielland i 1914',
    'ligger mellom Uelands gate, Maridalsveien og Waldemar Thranes gate',
    'ble opparbeidet til park i 1918'
  ],
  must_include: [
    'navneåret 1914',
    'forholdet mellom det litterære navnet og den konkrete byparken'
  ],
  notes: 'Skal spørres som navngitt park og offentlig byrom; det tidligere årstallet 1913 var feil.'
};

write(aggregatePath, places);

const snapshot = (place) => ({
  lat: place.lat,
  lon: place.lon,
  r: place.r,
  coordStatus: place.coordStatus,
  coordSource: place.coordSource,
  coordType: place.coordType,
  coordNote: place.coordNote,
});

const evidenceSpecs = [
  {
    place: oskar,
    rel: 'oslo/litteratur/oscar_braaten_statuen.json',
    identity: 'Oskar Braaten-bysten av Arne Durban ved Beierbrua, avduket i 1961',
    evidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: 'Store norske leksikon – Beierbrua',
        sourceUrl: 'https://snl.no/Beierbrua',
        sourceObjectId: 'snl:beierbrua:oskar-braaten-byste',
        sourceQuality: 'documented_monument_identity',
        finding: 'SNL dokumenterer at en bronsebyste av Braaten, utført av Arne Durban, ble avduket ved Beierbrua i 1961.',
        canVerifyCoordinate: false,
        reason: 'Kilden dokumenterer identitet, plassering ved broen og årstall, mens koordinatet kommer fra det eksakte monumentobjektet.'
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Lokalhistoriewiki – Beierbrua',
        sourceUrl: 'https://lokalhistoriewiki.no/wiki/Beierbrua',
        sourceObjectId: 'lokalhistoriewiki:beierbrua:oskar-braaten-byste',
        sourceQuality: 'documented_local_position',
        finding: 'Kilden plasserer bysten på østsiden av Beierbrua, over veien fra Hønse-Lovisas hus.',
        canVerifyCoordinate: false,
        reason: 'Brukes som lokal posisjonskontroll av monumentidentiteten.'
      },
      {
        sourceProvider: 'osm',
        sourceName: 'OpenStreetMap node 10819902960',
        sourceUrl: 'https://www.openstreetmap.org/node/10819902960',
        sourceObjectId: 'osm-node:10819902960',
        sourceQuality: 'exact_named_artwork_point',
        finding: 'Eksakt tourism=artwork-punkt med navnet OSKAR BRAATEN 1881 1939 på stedet ved Beierbrua.',
        canVerifyCoordinate: true,
        reason: 'Direkte objektpunkt for selve minnesmerket.'
      }
    ]
  },
  {
    place: alexander,
    rel: 'oslo/litteratur/alexander_kiellands_plass.json',
    identity: 'Alexander Kiellands plass, parken mellom Uelands gate, Maridalsveien og Waldemar Thranes gate',
    evidence: [
      {
        sourceProvider: 'municipality',
        sourceName: 'Oslo kommune – Alexander Kiellands plass',
        sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/alexander-kiellands-plass/',
        sourceObjectId: 'oslo-kommune:park:alexander-kiellands-plass',
        sourceQuality: 'official_park_extent_description',
        finding: 'Oslo kommune dokumenterer parken mellom Uelands gate, Maridalsveien og Waldemar Thranes gate.',
        canVerifyCoordinate: false,
        reason: 'Kommunekilden identifiserer og avgrenser parken, men publiserer ikke et eget maskinlesbart koordinatobjekt i denne passeringen.'
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Alexander Kiellands plass',
        sourceUrl: 'https://oslobyleksikon.no/side/Alexander_Kiellands_plass',
        sourceObjectId: 'oslobyleksikon:alexander-kiellands-plass',
        sourceQuality: 'documented_place_history',
        finding: 'Kilden dokumenterer navneåret 1914 og at området ble opparbeidet til park i 1918.',
        canVerifyCoordinate: false,
        reason: 'Brukes til identitet og historikk, ikke som koordinatgenerator.'
      },
      {
        sourceProvider: 'osm',
        sourceName: 'OpenStreetMap way 3610607',
        sourceUrl: 'https://www.openstreetmap.org/way/3610607',
        sourceObjectId: 'osm-way:3610607',
        sourceQuality: 'exact_park_polygon',
        finding: 'Den konkrete leisure=park-polygonen dekker parken innenfor den offisielt dokumenterte gateavgrensningen.',
        canVerifyCoordinate: true,
        reason: 'Eksakt arealgeometri for det dokumenterte parkarealet; representasjonspunktet brukes som area_anchor.'
      }
    ]
  }
];

for (const spec of evidenceSpecs) {
  const evidence = {
    schemaVersion: '1.0',
    placeId: spec.place.id,
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(spec.place),
    identity: {
      currentName: spec.place.name,
      resolvedIdentity: spec.identity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: spec.place.locatorType,
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['dokumentert fysisk identitet', 'eksakt fysisk objekt eller arealgeometri'],
    evidence: spec.evidence,
    addressCandidates: [],
    sourceObjectCandidates: spec.evidence.map((entry) => ({
      sourceProvider: entry.sourceProvider,
      sourceObjectId: entry.sourceObjectId,
      canApplyToPlace: entry.canVerifyCoordinate === true
    })),
    geometryCandidates: [{
      sourceProvider: spec.place.sourceProvider,
      sourceObjectId: spec.place.sourceObjectId,
      lat: spec.place.lat,
      lon: spec.place.lon,
      canApplyToPlace: true
    }],
    coordinateCandidates: [{
      lat: spec.place.lat,
      lon: spec.place.lon,
      coordRole: spec.place.coordRole,
      canApplyToPlace: true
    }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Verified geometry is applied to canonical place data and must be visually checked before merge.'
    },
    notes: [spec.place.coordNote]
  };
  write(path.join(evidenceRoot, spec.rel), evidence);
}

const evidenceManifest = read(evidenceManifestPath);
for (const spec of evidenceSpecs) {
  if (!evidenceManifest.files.includes(spec.rel)) evidenceManifest.files.push(spec.rel);
}
write(evidenceManifestPath, evidenceManifest);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  'Oslo-tabellen inneholder nå 148 verifiserte eller kildekontrollerte canonical steder. Batch 29 starter litteratur-manifestet med to nye godkjente adresseankre: Kulturkirken Jakob og Ruth Maier-minnesmerket. Tre ytterligere Oslo-records avsluttes som needs_review, mens to feilplasserte Prøysen-records flyttes ut av Oslo. Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 34.',
  'Oslo-tabellen inneholder nå 150 verifiserte eller kildekontrollerte canonical steder. Batch 30 avslutter de to siste ukontrollerte recordene i Oslo-litteraturmanifestet med verified_geometry for Oskar Braaten-bysten ved Beierbrua og Alexander Kiellands plass. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 34.'
);
const anchor = '| 29 | `ruth_maier_minne` | Ruth Maier-minnesmerke | verified | `geonorge-adresser-v1:0301:11153:3` |';
if (!protocol.includes('| 30 | `oscar_braaten_statuen`')) {
  protocol = protocol.replace(anchor, `${anchor}\n| 30 | \`oscar_braaten_statuen\` | Oskar Braaten-bysten | verified_geometry | \`osm-node:10819902960\` |\n| 30 | \`alexander_kiellands_plass\` | Alexander Kiellands plass | verified_geometry | \`osm-way:3610607\` |`);
}
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 148 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 150 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);
fs.writeFileSync(protocolPath, protocol);

const rad = (value) => value * Math.PI / 180;
function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const movement = {
  oscar_braaten_statuen: {
    old: before.oscar_braaten_statuen,
    new: { lat: oskar.lat, lon: oskar.lon },
    movedMeters: Math.round(distanceMeters(before.oscar_braaten_statuen, oskar)),
    sourceObjectId: oskar.sourceObjectId
  },
  alexander_kiellands_plass: {
    old: before.alexander_kiellands_plass,
    new: { lat: alexander.lat, lon: alexander.lon },
    movedMeters: Math.round(distanceMeters(before.alexander_kiellands_plass, alexander)),
    sourceObjectId: alexander.sourceObjectId
  }
};
write(path.join(reportDir, 'applied-summary.json'), {
  generatedAt: new Date().toISOString(),
  result: '2 verified_geometry',
  movement,
  diagnostics: {
    kartverketSsr: '0 results for both records',
    alexanderAddressFinder: 'not_found',
    alexanderGeometry: 'osm-way:3610607',
    oskarMonument: 'osm-node:10819902960'
  }
});

fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo coordinate control batch 30\n\nDato: ${today}\n\nBatch 30 avslutter de to siste ukontrollerte Oslo-litteraturrecordene.\n\n## Resultat\n\n- \`oscar_braaten_statuen\` → **verified_geometry** på eksakt OSM artwork-node \`10819902960\`. Identiteten er korrigert til Oskar Braaten-bysten ved Beierbrua, og årstallet til 1961.\n- \`alexander_kiellands_plass\` → **verified_geometry** på OSM park-way \`3610607\`, som dekker parken innenfor Oslo kommunes dokumenterte gateavgrensning. Navneåret er korrigert fra 1913 til 1914.\n\nKartverket SSR ga ingen treff for noen av navnene, og Geonorge-adressefinder ga ingen treff for Alexander Kiellands plass. Ingen naboadresse eller proxy ble brukt.\n\nBegge faktiske markørflyttinger skal gjennom visuell kart-QA før merge.\n`);

console.log(JSON.stringify(movement, null, 2));
