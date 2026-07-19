import fs from 'node:fs';
import crypto from 'node:crypto';

const root = 'data/places/natur/oslo';
const sourcePath = `${root}/places_oslo_natur_akerselvarute.json`;
const manifestPath = `${root}/places_oslo_natur_akerselvarute_manifest.json`;
const indexPath = `${root}/places_oslo_natur_akerselvarute_index.json`;
const splitDir = `${root}/places_oslo_natur_akerselvarute`;
const evidenceDir = 'data/coordinate-evidence/oslo/natur';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-35';
const verifiedAt = '2026-07-20';
const ids = ['vaterland_historisk_elvelop', 'akerselva_utlop_bjorvika'];

const coordinateKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address',
  'geocodeAccuracy','coordRole','coordType','coordStatus','coordSource',
  'coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','coordPrecisionM','anchors',
];

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => {
  fs.mkdirSync(new URL('.', `file://${process.cwd()}/${path}`).pathname, { recursive: true });
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const snapshot = place => ({
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  coordStatus: place.coordStatus ?? '',
  coordSource: place.coordSource ?? '',
  coordType: place.coordType ?? '',
  coordNote: place.coordNote ?? '',
});

const aggregate = read(sourcePath);
const byId = new Map(aggregate.map(place => [place.id, place]));
for (const id of ids) if (!byId.has(id)) throw new Error(`Missing ${id} in aggregate`);

const vaterland = byId.get('vaterland_historisk_elvelop');
Object.assign(vaterland, {
  lat: 59.9134578,
  lon: 10.7581117,
  locatorType: 'historic_site',
  sourceProvider: 'manual_research',
  sourceObjectId: 'oslobyleksikon:akerselva:vaterlands-bru',
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'historical_anchor',
  coordType: 'historic_river_course_anchor',
  coordStatus: 'verified_historical_source',
  coordSource: 'Oslo byleksikon – Akerselva/Vaterlands bru + OpenStreetMap way 381749953',
  coordSourceId: 'osm-way:381749953',
  coordSourceUrl: 'https://oslobyleksikon.no/side/Akerselva',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Dokumentert historisk linjeanker ved Vaterlands bru. Oslo byleksikon beskriver at den nedre Akerselva-strekningen fra Vaterlands bru til Bjørvika ble lagt i tunnel i 1964–1969. Den eksakte navngitte brogeometrien i OSM brukes som fysisk startanker for den historiske åpne elvestrekningen, ikke som et påstått sentrum for hele det tidligere elveløpet.',
  anchors: [
    {
      id: 'vaterland_historisk_elvelop_vaterlands_bru',
      name: 'Vaterland – historisk elveløp ved Vaterlands bru',
      lat: 59.9134578,
      lon: 10.7581117,
      r: 120,
      type: 'historic_route_anchor',
      sourceObjectId: 'osm-way:381749953',
      role: 'historical_anchor',
      note: 'Eksakt navngitt Vaterlands bru brukes som dokumentert startanker for den historiske nedre Akerselva-strekningen som senere ble lagt i tunnel.'
    }
  ],
});
delete vaterland.coordPrecisionM;

const outlet = byId.get('akerselva_utlop_bjorvika');
Object.assign(outlet, {
  lat: 59.9075303,
  lon: 10.7554479,
  locatorType: 'linear_area',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:246047712',
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'river_mouth_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 246047712 – nedre Akerselva ved utløpet i Bjørvika',
  coordSourceId: 'osm-way:246047712',
  coordSourceUrl: 'https://www.openstreetmap.org/way/246047712',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Endepunktet på den navngitte OSM-wayen for nederste åpne del av Akerselva brukes som eksakt linjeanker ved elvas møte med Bjørvika. Oslo byleksikon og Store norske leksikon dokumenterer Bjørvika som Akerselvas utløp. Den gamle markøren og de tre manuelle ruteankrene lå ved Karl Johans gate/Kvadraturen, langt vest for det faktiske elveløpet, og er erstattet av dette kildebelagte utløpsankeret.',
  anchors: [
    {
      id: 'akerselva_utlop_bjorvika_munning',
      name: 'Akerselva – utløpsanker i Bjørvika',
      lat: 59.9075303,
      lon: 10.7554479,
      r: 120,
      type: 'river_mouth_anchor',
      sourceObjectId: 'osm-way:246047712',
      role: 'line_anchor',
      note: 'Endepunktet på den navngitte nederste OSM-wayen for Akerselva brukes som kildebelagt anker for utløpet i Bjørvika.'
    }
  ],
});
delete outlet.coordPrecisionM;

write(sourcePath, aggregate);

for (const id of ids) {
  const source = byId.get(id);
  const childPath = `${splitDir}/${id}.json`;
  const child = read(childPath);
  for (const key of coordinateKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) child[key] = source[key];
    else delete child[key];
  }
  write(childPath, child);
}

const evidence = {
  vaterland_historisk_elvelop: {
    schemaVersion: '1.0',
    placeId: 'vaterland_historisk_elvelop',
    placeFile: sourcePath,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(vaterland),
    identity: {
      currentName: vaterland.name,
      resolvedIdentity: vaterland.name,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'historic_site',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: [],
    evidence: [
      {
        type: 'historical_reference',
        source: 'Oslo byleksikon – Akerselva',
        sourceObjectId: 'oslobyleksikon:akerselva:vaterlands-bru',
        url: 'https://oslobyleksikon.no/side/Akerselva',
        note: 'Dokumenterer at den nedre Akerselva-strekningen fra Vaterlands bru til Bjørvika ble lagt i tunnel i 1964–1969.'
      }
    ],
    addressCandidates: [],
    sourceObjectCandidates: [
      {
        sourceObjectId: 'osm-way:381749953',
        name: 'Vaterlands bru',
        lat: 59.9134578,
        lon: 10.7581117,
        role: 'historical_anchor'
      }
    ],
    geometryCandidates: [
      {
        sourceObjectId: 'osm-way:381749953',
        type: 'named_bridge_geometry',
        decision: 'accepted_as_historical_start_anchor'
      }
    ],
    coordinateCandidates: [
      {
        lat: 59.9134578,
        lon: 10.7581117,
        sourceObjectId: 'osm-way:381749953',
        role: 'historical_anchor',
        status: 'accepted'
      }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Applied to canonical place as a source-backed historical anchor.'
    },
    notes: [vaterland.coordNote]
  },
  akerselva_utlop_bjorvika: {
    schemaVersion: '1.0',
    placeId: 'akerselva_utlop_bjorvika',
    placeFile: sourcePath,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(outlet),
    identity: {
      currentName: outlet.name,
      resolvedIdentity: outlet.name,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'linear_area',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: [],
    evidence: [
      {
        type: 'reference',
        source: 'Oslo byleksikon – Akerselva',
        url: 'https://oslobyleksikon.no/side/Akerselva',
        note: 'Dokumenterer Akerselvas nedre løp og utløp i Bjørvika.'
      },
      {
        type: 'reference',
        source: 'Store norske leksikon – Akerselva',
        url: 'https://snl.no/Akerselva',
        note: 'Dokumenterer at Akerselva renner til Bjørvika.'
      }
    ],
    addressCandidates: [],
    sourceObjectCandidates: [
      {
        sourceObjectId: 'osm-way:246047712',
        name: 'Akerselva',
        lat: 59.9081792,
        lon: 10.7559014
      }
    ],
    geometryCandidates: [
      {
        sourceObjectId: 'osm-way:246047712',
        type: 'named_lower_river_way',
        endpoint: { lat: 59.9075303, lon: 10.7554479 },
        decision: 'accepted_outlet_endpoint'
      }
    ],
    coordinateCandidates: [
      {
        lat: 59.9075303,
        lon: 10.7554479,
        sourceObjectId: 'osm-way:246047712',
        role: 'line_anchor',
        status: 'accepted'
      }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Applied to canonical place as the sourced endpoint of the lower named Akerselva geometry.'
    },
    notes: [outlet.coordNote]
  }
};

for (const [id, doc] of Object.entries(evidence)) write(`${evidenceDir}/${id}.json`, doc);

const evidenceManifest = read(evidenceManifestPath);
for (const id of ids) {
  const rel = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
write(evidenceManifestPath, evidenceManifest);

const manifest = read(manifestPath);
manifest.source_sha256 = sha256(sourcePath);
manifest.generated_at = '2026-07-20T01:00:00+02:00';
for (const row of manifest.places || []) {
  const childPath = `${root}/${row.file}`;
  if (!fs.existsSync(childPath)) throw new Error(`Missing split child ${row.file}`);
  row.sha256 = sha256(childPath);
}
write(manifestPath, manifest);

const routeIndex = (manifest.places || []).map(row => {
  const place = read(`${root}/${row.file}`);
  return {
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file: row.file,
  };
});
write(indexPath, routeIndex);

let protocol = fs.readFileSync(protocolPath, 'utf8');
const summaryPattern = /Oslo-tabellen inneholder nå 163 verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 49\./;
const newSummary = 'Oslo-tabellen inneholder nå 165 verifiserte eller kildekontrollerte canonical steder. Batch 35 fullfører Akerselva-ruten: Vaterland – historisk elveløp får et dokumentert historisk linjeanker ved Vaterlands bru, mens Akerselvas utløp i Bjørvika flyttes fra et feilplassert manuelt punkt ved Karl Johans gate til endepunktet på den navngitte nederste Akerselva-geometrien. Antallet fullførte kontroller uten godkjent Oslo-koordinat forblir 49.';
if (!summaryPattern.test(protocol)) throw new Error('Expected Batch 34 Oslo protocol summary not found');
protocol = protocol.replace(summaryPattern, newSummary);

if (!protocol.includes('| 35 | `vaterland_historisk_elvelop`')) {
  const marker = '\nRelevante korrigerende merger for de første Oslo-batchene:';
  const rows = '\n| 35 | `vaterland_historisk_elvelop` | Vaterland – historisk elveløp | verified_historical_source | `oslobyleksikon:akerselva:vaterlands-bru` |\n| 35 | `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | verified_geometry | `osm-way:246047712` |\n';
  if (!protocol.includes(marker)) throw new Error('Protocol insertion marker not found');
  protocol = protocol.replace(marker, `${rows}${marker}`);
}
protocol = protocol.replace('teller ikke blant de 163 verifiserte eller kildekontrollerte canonical Oslo-stedene.', 'teller ikke blant de 165 verifiserte eller kildekontrollerte canonical Oslo-stedene.');
fs.writeFileSync(protocolPath, protocol);

fs.mkdirSync(reportDir, { recursive: true });
write(`${reportDir}/applied-summary.json`, {
  batch: 35,
  controlled: ids,
  approved: {
    vaterland_historisk_elvelop: {
      from: [59.9158, 10.7332],
      to: [59.9134578, 10.7581117],
      status: 'verified_historical_source',
      sourceObjectId: 'oslobyleksikon:akerselva:vaterlands-bru',
      geometryAnchor: 'osm-way:381749953'
    },
    akerselva_utlop_bjorvika: {
      from: [59.9118, 10.7469],
      to: [59.9075303, 10.7554479],
      status: 'verified_geometry',
      sourceObjectId: 'osm-way:246047712'
    }
  },
  unresolvedAdded: 0,
  osloControlledApprovedCountAfter: 165,
  osloCompletedWithoutApprovedCoordinateAfter: 49,
  akerselvaManifestControlled: '23/23'
});
fs.writeFileSync(`${reportDir}/README.md`, '# Oslo coordinate control batch 35\n\nFinal two Akerselva-route records. Vaterland receives a source-backed historical anchor at Vaterlands bru; the Bjørvika outlet moves to the endpoint of the named lower Akerselva geometry. After this batch the 23-record Akerselva source is fully controlled.\n');

console.log('Applied Oslo coordinate control batch 35 to the final two Akerselva records.');
