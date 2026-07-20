import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json';
const placeDir = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const splitIndexPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const writeJson = (p, value) => {
  const target = path.join(root, p);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');
const placePath = (id) => `${placeDir}/${id}.json`;
const osmUrl = (kind, id) => `https://www.openstreetmap.org/${kind}/${id}`;

const verified = {
  alnaparken: {
    lat: 59.9426114,
    lon: 10.8774877,
    locatorType: 'park',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:7810002134',
    sourceUrl: osmUrl('node', 7810002134),
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 7810002134 – Alnaparken',
    note: 'Eksakt navngitt OSM-punkt for Alnaparken. Punktet brukes som eksplisitt parkanker; likelydende treff for idrettsbane og parkering er forkastet som andre fysiske objekter.'
  },
  groruddammen: {
    lat: 59.9581221,
    lon: 10.8763191,
    locatorType: 'natural_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:60347628',
    sourceUrl: osmUrl('way', 60347628),
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'water_geometry_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 60347628 – Groruddammen',
    note: 'Geometrisk representasjonspunkt for den eksakt navngitte vannflaten Groruddammen (OSM way 60347628). Oslo kommune dokumenterer Groruddammen som egen fasilitet i Grorudparken; parkgeometrien brukes bare som identitetskryssjekk.'
  },
  svartdalen: {
    lat: 59.9037223,
    lon: 10.7972012,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:579463147',
    sourceUrl: osmUrl('way', 579463147),
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordType: 'valley_line_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 579463147 – Svartdalen',
    note: 'Representasjonspunkt for den eksakt navngitte dalgeometrien Svartdalen (OSM way 579463147). Recorden gjelder ravinedalen, ikke den fysisk separate Svartdalsparken.'
  },
  kvaernerbyen_alna: {
    lat: 59.9035994,
    lon: 10.7875433,
    locatorType: 'route',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:685201630',
    sourceUrl: osmUrl('way', 685201630),
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordType: 'river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 685201630 – Alna',
    note: 'Eksakt navngitt Alna-segment gjennom Kværnerbyen, modellert som line_anchor fra OSM way 685201630. Punktet representerer selve vannløpet, ikke boligområdet eller et separat vannspeil.'
  }
};

const unresolved = {
  alnsjoen_alna_kilde: {
    coordStatus: 'needs_source',
    coordSource: 'alnsjoen_outflow_geometry_unresolved',
    coordType: 'legacy_unverified',
    note: 'Kontrollen bekrefter at Alna renner ut fra Alnsjøen, men legacy-markøren ligger ved Gamle Gruvevei og kontrollen fant ingen entydig navngitt Alnsjøen-vanngeometri eller ett eksplisitt utløpsobjekt som kan brukes uten gjetting. Flere separate Alna-way-er finnes øst for sjøen. Punktet beholdes bare som midlertidig kartanker til eksakt sjø-/utløpsgeometri er dokumentert.'
  },
  alna_smalvoll: {
    coordStatus: 'needs_source',
    coordSource: 'alna_smalvoll_segment_unresolved',
    coordType: 'legacy_unverified',
    note: 'Alna ved Smalvoll er en lokalt definert elvestrekning. Flere separate navngitte Alna-way-er passer området, men recorden avgrenser ikke hvilken strekning som er canonical. Dagens punkt ved Smalvollveien er ikke i seg selv bevis for elvegeometrien. Krever eksplisitt avgrenset segment eller flere kildebelagte ruteankre.'
  },
  alna_bryn: {
    coordStatus: 'needs_source',
    coordSource: 'alna_bryn_segment_unresolved',
    coordType: 'legacy_unverified',
    note: 'Alna ved Bryn er en bred lokal elvestrekning med flere separate Alna-way-er. Bryn bru er et entydig navngitt objekt, men er ikke identisk med denne recorden, og Brynsfossen ble ikke dokumentert som ett entydig kildeobjekt. Recorden må avgrenses til en konkret elvestrekning eller få flere kildebelagte ankere.'
  },
  alna_utlop_bjorvika: {
    coordStatus: 'needs_source',
    coordSource: 'alna_historical_outlet_multilayer_unresolved',
    coordType: 'legacy_historical_area_anchor',
    note: 'Recorden gjelder Alnas historiske munningslandskap ved Sørenga/Middelalderparken, mens faktisk vannføring siden 1922 går i tunnel til Kongshavn. Oslo kommune dokumenterer at vannspeilet markerer det opprinnelige utløpet, men ett enkelt legacy-punkt kan ikke samtidig representere historisk elveos, rekonstruert vannspeil og dagens tunnelutløp. Krever en eksplisitt historisk area-/multi-anchor-modell.'
  }
};

const allIds = [...Object.keys(verified), ...Object.keys(unresolved)];
const before = {};
const after = {};

function patchPlace(place, id) {
  if (!allIds.includes(id)) return place;
  before[id] ??= {
    lat: place.lat,
    lon: place.lon,
    coordStatus: place.coordStatus ?? null,
    coordSource: place.coordSource ?? null,
    coordType: place.coordType ?? null
  };

  if (verified[id]) {
    const d = verified[id];
    Object.assign(place, {
      lat: d.lat,
      lon: d.lon,
      locatorType: d.locatorType,
      sourceProvider: d.sourceProvider,
      sourceObjectId: d.sourceObjectId,
      geocodeAccuracy: d.geocodeAccuracy,
      coordRole: d.coordRole,
      coordType: d.coordType,
      coordStatus: d.coordStatus,
      coordSource: d.coordSource,
      coordSourceId: d.sourceObjectId,
      coordSourceUrl: d.sourceUrl,
      coordVerifiedAt: verifiedAt,
      coordNote: d.note
    });
  } else {
    const d = unresolved[id];
    Object.assign(place, {
      coordStatus: d.coordStatus,
      coordSource: d.coordSource,
      coordType: d.coordType,
      coordVerifiedAt: verifiedAt,
      coordNote: d.note
    });
    for (const key of ['sourceProvider', 'sourceObjectId', 'coordSourceId', 'coordSourceUrl', 'geocodeAccuracy', 'coordRole']) delete place[key];

    if (id === 'alna_utlop_bjorvika' && Array.isArray(place.anchors)) {
      const labels = {
        alna_utlop_innlop: ['Alna historisk utløpslandskap – indre markør', 'Foreløpig landskapsanker for historisk trase; ikke dokumentert som dagens åpne Alna-løp.'],
        alna_utlop_munning: ['Alna historisk munningslandskap – representasjonsanker', 'Foreløpig markør for historisk munning/vannspeil; ikke dagens tunnelutløp ved Kongshavn.'],
        alna_utlop_fjord: ['Alna historisk utløpslandskap – fjordkantmarkør', 'Foreløpig historisk landskapsanker; synlig fjordvann er ikke i seg selv dokumentasjon på dagens Alna-vannføring.']
      };
      place.anchors = place.anchors.map((a) => labels[a.id] ? { ...a, name: labels[a.id][0], note: labels[a.id][1] } : a);
    }
  }

  after[id] = {
    lat: place.lat,
    lon: place.lon,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    sourceObjectId: place.sourceObjectId ?? null
  };
  return place;
}

const aggregate = readJson(aggregatePath);
for (const place of aggregate) if (place?.id) patchPlace(place, place.id);
writeJson(aggregatePath, aggregate);

for (const id of allIds) {
  const child = readJson(placePath(id));
  patchPlace(child, id);
  writeJson(placePath(id), child);
}

const splitManifest = readJson(splitManifestPath);
const aggregateText = fs.readFileSync(path.join(root, aggregatePath), 'utf8');
splitManifest.source_sha256 = sha256Text(aggregateText);
splitManifest.generated_at = `source_sha256:${splitManifest.source_sha256}`;
const splitIndex = [];
for (const row of splitManifest.places) {
  const childPath = `data/places/natur/oslo/${row.file}`;
  const childText = fs.readFileSync(path.join(root, childPath), 'utf8');
  row.sha256 = sha256Text(childText);
  const place = JSON.parse(childText);
  splitIndex.push({
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file: row.file
  });
}
writeJson(splitManifestPath, splitManifest);
writeJson(splitIndexPath, splitIndex);

const byleksikon = {
  sourceProvider: 'manual_research',
  sourceName: 'Oslo byleksikon – Alnaelva',
  sourceUrl: 'https://oslobyleksikon.no/side/Alnaelva',
  sourceObjectId: 'oslobyleksikon:alnaelva'
};

const evidenceDefs = {
  alnaparken: {
    resolvedIdentity: 'Alnaparken som navngitt park',
    locatorTypeCandidate: 'park',
    requiredEvidence: [],
    evidence: [{
      sourceProvider: 'osm', sourceName: 'OpenStreetMap – Alnaparken', sourceUrl: verified.alnaparken.sourceUrl,
      sourceObjectId: verified.alnaparken.sourceObjectId, sourceQuality: 'exact_named_place_anchor',
      finding: 'Eksakt navngitt parkpunkt; likelydende treff for idrettsbane og parkering er separate objekter.',
      canVerifyCoordinate: true, reason: verified.alnaparken.note
    }]
  },
  groruddammen: {
    resolvedIdentity: 'Groruddammen som konkret vannflate i Grorudparken',
    locatorTypeCandidate: 'natural_area',
    requiredEvidence: [],
    evidence: [
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap – Groruddammen', sourceUrl: verified.groruddammen.sourceUrl,
        sourceObjectId: verified.groruddammen.sourceObjectId, sourceQuality: 'exact_named_water_geometry',
        finding: 'Eksakt navngitt natural=water-polygon for Groruddammen.', canVerifyCoordinate: true, reason: verified.groruddammen.note
      },
      {
        sourceProvider: 'municipality', sourceName: 'Oslo kommune – Grorudparken',
        sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken',
        sourceObjectId: 'oslo-kommune:park:grorudparken', sourceQuality: 'official_identity_crosscheck',
        finding: 'Oslo kommune oppgir Groruddammen som egen fasilitet i Grorudparken.',
        canVerifyCoordinate: false, reason: 'Bekrefter identiteten; koordinaten kommer fra den eksakte vanngeometrien.'
      }
    ]
  },
  svartdalen: {
    resolvedIdentity: 'Svartdalen som ravinedal langs Alna, adskilt fra Svartdalsparken',
    locatorTypeCandidate: 'linear_area',
    requiredEvidence: [],
    evidence: [
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap – Svartdalen', sourceUrl: verified.svartdalen.sourceUrl,
        sourceObjectId: verified.svartdalen.sourceObjectId, sourceQuality: 'exact_named_valley_geometry',
        finding: 'Eksakt navngitt natural=valley-geometri for Svartdalen.', canVerifyCoordinate: true, reason: verified.svartdalen.note
      },
      {
        ...byleksikon, sourceQuality: 'documented_valley_identity',
        finding: 'Kilden beskriver den trange Alnadalen vest for Bryn som Svartdalen.',
        canVerifyCoordinate: false, reason: 'Avklarer identiteten; geometrien kommer fra det eksakte OSM-objektet.'
      }
    ]
  },
  kvaernerbyen_alna: {
    resolvedIdentity: 'Den konkrete Alna-strekningen gjennom Kværnerbyen',
    locatorTypeCandidate: 'route',
    requiredEvidence: [],
    evidence: [
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap – Alna ved Kværnerbyen', sourceUrl: verified.kvaernerbyen_alna.sourceUrl,
        sourceObjectId: verified.kvaernerbyen_alna.sourceObjectId, sourceQuality: 'exact_named_waterway_segment',
        finding: 'Eksakt navngitt Alna-segment ved eksisterende markeringsområde.', canVerifyCoordinate: true, reason: verified.kvaernerbyen_alna.note
      },
      {
        ...byleksikon, sourceQuality: 'documented_river_identity',
        finding: 'Kilden dokumenterer Alnas nedre løp gjennom Kværnerområdet.',
        canVerifyCoordinate: false, reason: 'Kryssjekker elveidentiteten.'
      }
    ]
  },
  alnsjoen_alna_kilde: {
    resolvedIdentity: 'Alnas utløp/kildesone ved Alnsjøen',
    locatorTypeCandidate: 'natural_area',
    requiredEvidence: ['eksakt Alnsjøen-vanngeometri eller dokumentert Alna-utløpsobjekt ved sjøen'],
    evidence: [
      {
        ...byleksikon, sourceQuality: 'documented_source_identity',
        finding: 'Kilden dokumenterer at den egentlige Alna renner ut fra Alnsjøen og først går østover.',
        canVerifyCoordinate: false, reason: unresolved.alnsjoen_alna_kilde.note
      },
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap – separate Alna-segmenter øst for Alnsjøen',
        sourceUrl: 'https://www.openstreetmap.org/search?query=Alna%20Alnsj%C3%B8en%20Oslo',
        sourceObjectId: 'osm:alna-alnsjoen-multiple-waterway-ways', sourceQuality: 'fragmented_local_waterway_geometry',
        finding: 'Flere separate Alna-way-er, men ikke ett entydig sjø-/utløpsobjekt.',
        canVerifyCoordinate: false, reason: unresolved.alnsjoen_alna_kilde.note
      }
    ]
  },
  alna_smalvoll: {
    resolvedIdentity: 'Lokal Alna-strekning ved Smalvoll',
    locatorTypeCandidate: 'route',
    requiredEvidence: ['eksplisitt avgrenset Alna-segment ved Smalvoll eller flere kildebelagte ruteankre'],
    evidence: [
      {
        ...byleksikon, sourceQuality: 'documented_local_river_identity',
        finding: 'Kilden dokumenterer Alnas mange buktninger særlig i Smalvolldalen.',
        canVerifyCoordinate: false, reason: unresolved.alna_smalvoll.note
      },
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap – flere Alna-segmenter ved Smalvoll',
        sourceUrl: 'https://www.openstreetmap.org/search?query=Alna%20Smalvoll%20Oslo',
        sourceObjectId: 'osm:alna-smalvoll-multiple-waterway-ways', sourceQuality: 'multiple_plausible_local_segments',
        finding: 'Flere separate navngitte Alna-way-er passer kontrollområdet uten at recordens scope velger ett av dem.',
        canVerifyCoordinate: false, reason: unresolved.alna_smalvoll.note
      }
    ]
  },
  alna_bryn: {
    resolvedIdentity: 'Lokal Alna-strekning ved Bryn',
    locatorTypeCandidate: 'route',
    requiredEvidence: ['konkret avgrenset Alna-segment ved Bryn eller flere kildebelagte ruteankre'],
    evidence: [
      {
        ...byleksikon, sourceQuality: 'documented_local_river_identity',
        finding: 'Kilden dokumenterer Alnas løp nedenfor Bryn og videre gjennom Svartdalen.',
        canVerifyCoordinate: false, reason: unresolved.alna_bryn.note
      },
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap – flere Alna-segmenter ved Bryn',
        sourceUrl: 'https://www.openstreetmap.org/search?query=Alna%20Bryn%20Oslo',
        sourceObjectId: 'osm:alna-bryn-multiple-waterway-ways', sourceQuality: 'multiple_plausible_local_segments',
        finding: 'Flere Alna-way-er og ett eksakt Bryn bru-objekt, men ingen entydig geometri for den brede place-identiteten.',
        canVerifyCoordinate: false, reason: unresolved.alna_bryn.note
      }
    ]
  },
  alna_utlop_bjorvika: {
    resolvedIdentity: 'Alnas historiske utløpslandskap ved Sørenga/Middelalderparken, adskilt fra dagens tunnelutløp ved Kongshavn',
    locatorTypeCandidate: 'historic_site',
    requiredEvidence: ['eksplisitt historisk area-/multi-anchor-modell som skiller opprinnelig elveos, vannspeil og dagens Kongshavn-utløp'],
    evidence: [
      {
        sourceProvider: 'municipality', sourceName: 'Oslo kommune – Middelalderparken',
        sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/middelalderparken',
        sourceObjectId: 'oslo-kommune:kultureiendom:middelalderparken', sourceQuality: 'official_historical_area_definition',
        finding: 'Oslo kommune dokumenterer at vannspeilet markerer Alnaelvas opprinnelige utløp.',
        canVerifyCoordinate: false, reason: unresolved.alna_utlop_bjorvika.note
      },
      {
        ...byleksikon, sourceQuality: 'documented_historical_and_current_outlet_layers',
        finding: 'Kilden dokumenterer opprinnelig utløp ved Sørenga og tunnelutløp ved Kongshavn siden 1922.',
        canVerifyCoordinate: false, reason: unresolved.alna_utlop_bjorvika.note
      }
    ]
  }
};

const aggregateById = new Map(aggregate.map((p) => [p.id, p]));
for (const id of allIds) {
  const place = aggregateById.get(id);
  const def = evidenceDefs[id];
  const isVerified = Boolean(verified[id]);
  writeJson(`data/coordinate-evidence/oslo/natur/${id}.json`, {
    schemaVersion: '1.0',
    placeId: id,
    placeFile: aggregatePath,
    evidenceStatus: isVerified ? 'applied_to_place' : 'needs_research',
    coordinateDecision: isVerified ? 'do_not_change_coordinates_yet' : 'needs_geometry',
    currentCoordinate: {
      lat: place.lat,
      lon: place.lon,
      r: place.r,
      coordStatus: place.coordStatus ?? '',
      coordSource: place.coordSource ?? '',
      coordType: place.coordType ?? '',
      coordNote: place.coordNote ?? ''
    },
    identity: {
      currentName: place.name,
      resolvedIdentity: def.resolvedIdentity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: def.locatorTypeCandidate,
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: def.requiredEvidence,
    evidence: def.evidence,
    addressCandidates: [],
    sourceObjectCandidates: def.evidence.map((e) => ({
      sourceProvider: e.sourceProvider,
      sourceObjectId: e.sourceObjectId,
      canApplyToPlace: Boolean(e.canVerifyCoordinate)
    })),
    geometryCandidates: isVerified ? [{
      sourceProvider: verified[id].sourceProvider,
      sourceObjectId: verified[id].sourceObjectId,
      lat: verified[id].lat,
      lon: verified[id].lon,
      coordRole: verified[id].coordRole,
      canApplyToPlace: true
    }] : [],
    coordinateCandidates: isVerified ? [{
      lat: verified[id].lat,
      lon: verified[id].lon,
      coordRole: verified[id].coordRole,
      canApplyToPlace: true
    }] : [],
    decision: {
      canBecomeVerified: isVerified,
      blockedReason: isVerified ? '' : unresolved[id].note,
      nextAction: isVerified ? 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' : def.requiredEvidence[0]
    },
    notes: [isVerified ? verified[id].note : unresolved[id].note]
  });
}

const evidenceManifest = readJson(evidenceManifestPath);
for (const id of allIds) {
  const entry = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
}
writeJson(evidenceManifestPath, evidenceManifest);

let protocol = fs.readFileSync(path.join(root, protocolPath), 'utf8');
const batchNums = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const newBatch = Math.max(...batchNums) + 1;
if (newBatch !== 91) throw new Error(`Forventet batch 91 på current main, fant neste batch ${newBatch}.`);

const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\..*?Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!countMatch) throw new Error('Kunne ikke lese Oslo-tellerne i protokollen.');
const newVerifiedCount = Number(countMatch[1]) + Object.keys(verified).length;
const newNeedsReviewCount = Number(countMatch[2]) + Object.keys(unresolved).length;
protocol = protocol.replace(
  countMatch[0],
  `Oslo-tabellen inneholder nå ${newVerifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch ${newBatch} kontrollerer alle åtte Alnaelva-rutepunktene: fire får eksakt kildegeometri, mens fire avsluttes som dokumenterte needs_review-saker uten proxy-gjetting. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${newNeedsReviewCount}.`
);
protocol = protocol.replace('Sist oppdatert: 2026-07-20', 'Sist oppdatert: 2026-07-21');
protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newVerifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);

const verifiedRows = [
  `| ${newBatch} | \`alnaparken\` | Alnaparken | verified_geometry | \`osm-node:7810002134\` |`,
  `| ${newBatch} | \`groruddammen\` | Groruddammen | verified_geometry | \`osm-way:60347628\` |`,
  `| ${newBatch} | \`svartdalen\` | Svartdalen | verified_geometry | \`osm-way:579463147\` |`,
  `| ${newBatch} | \`kvaernerbyen_alna\` | Kværnerbyen ved Alna | verified_geometry | \`osm-way:685201630\` |`
].join('\n');
const batchNote = `Batch ${newBatch} (2026-07-21) fullfører den utsatte kontrollen av de åtte Alnaelva-rutepunktene etter objekt-type-først-metoden. \`alnaparken\` bruker det eksakt navngitte OSM-parkankeret, \`groruddammen\` den navngitte vanngeometrien, \`svartdalen\` selve dalgeometrien i stedet for Svartdalsparken, og \`kvaernerbyen_alna\` et eksakt navngitt Alna-segment. \`alnsjoen_alna_kilde\`, \`alna_smalvoll\`, \`alna_bryn\` og \`alna_utlop_bjorvika\` avsluttes som needs_review fordi kontrollen ikke ga ett entydig kildeobjekt som samsvarer med hele recordens fysiske eller historiske scope.`;
const marker = '\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(marker)) throw new Error('Fant ikke innsettingspunktet i Oslo-tabellen.');
protocol = protocol.replace(marker, `\n${verifiedRows}\n\n${batchNote}\n${marker}`);

const reviewRows = [
  '| `alnsjoen_alna_kilde` – Alnsjøen (Alna-kilde) | needs_review | Alna er dokumentert å renne ut fra Alnsjøen, men legacy-punktet ligger ved Gamle Gruvevei og kontrollen fant flere separate Alna-segmenter uten ett entydig sjø-/utløpsobjekt. | Finn eksakt Alnsjøen-vanngeometri eller et dokumentert Alna-utløpsobjekt før canonical koordinat godkjennes. |',
  '| `alna_smalvoll` – Alna ved Smalvoll | needs_review | Flere navngitte Alna-way-er passer det brede Smalvollområdet, mens recorden ikke avgrenser én konkret elvestrekning og dagens punkt ved Smalvollveien ikke er kildebevis. | Avgrens ett konkret elve-segment eller modeller flere kildebelagte ruteankre. |',
  '| `alna_bryn` – Alna ved Bryn | needs_review | Flere Alna-segmenter finnes ved Bryn; Bryn bru er ikke identisk med den brede elverecorden, og ingen entydig Brynsfossen-geometri ble dokumentert. | Avgrens recorden til en konkret elvestrekning eller modeller flere kildebelagte ankere. |',
  '| `alna_utlop_bjorvika` – Alna utløp i Bjørvika | needs_review | Recorden kombinerer historisk utløpslandskap, vannspeilet som markerer den gamle munningen og dagens tunnelutløp ved Kongshavn. Ett enkelt punkt kan ikke representere alle tidslagene. | Bygg en eksplisitt historisk area-/multi-anchor-modell som skiller opprinnelig elveos, vannspeil og dagens tunnelutløp. |'
];
const lines = protocol.split('\n');
const sectionLine = lines.findIndex((line) => line.startsWith('### Dokumenterte Oslo-kontroller uten godkjent koordinat'));
let tableStarted = false;
let insertAt = -1;
for (let i = sectionLine + 1; i < lines.length; i += 1) {
  if (lines[i].startsWith('| kandidat |')) tableStarted = true;
  if (tableStarted && lines[i] === '') {
    insertAt = i;
    break;
  }
}
if (insertAt < 0) throw new Error('Fant ikke slutten på needs_review-tabellen.');
lines.splice(insertAt, 0, ...reviewRows);
protocol = lines.join('\n');

protocol = protocol.replace(
  /## Neste arbeid\n\n(?:- .*\n){4,6}/,
  `## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch 92.\n- Før batch 92 starter skal neste aktive sekundære Oslo-kildekø auditeres eksplisitt mot top-level manifestrekkefølgen; ikke gjett neste kategori.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`
);
fs.writeFileSync(path.join(root, protocolPath), protocol);

const reportDir = `reports/oslo-coordinate-control-batch-${newBatch}-alna-route`;
writeJson(`${reportDir}/results.json`, {
  generatedAt: new Date().toISOString(),
  batch: newBatch,
  method: 'object-type-first; active aggregate + split + split index + runtime + evidence kept in sync; no proxy guessing',
  verified: Object.keys(verified),
  needsReview: Object.keys(unresolved),
  before,
  after
});
fs.writeFileSync(path.join(root, reportDir, 'README.md'), `# Oslo coordinate control batch ${newBatch} – Alna route\n\nAlle åtte Alna-rutepunkter er kontrollert mot current main. Aggregate source, split children, split manifest, lightweight index, runtime index og coordinate evidence skal være synkronisert i samme PR.\n\n## Godkjent geometri\n- \`alnaparken\` → \`osm-node:7810002134\`\n- \`groruddammen\` → \`osm-way:60347628\`\n- \`svartdalen\` → \`osm-way:579463147\`\n- \`kvaernerbyen_alna\` → \`osm-way:685201630\`\n\n## Fullført uten godkjent koordinat\n- \`alnsjoen_alna_kilde\`\n- \`alna_smalvoll\`\n- \`alna_bryn\`\n- \`alna_utlop_bjorvika\`\n\nIngen nearest/first-hit-logikk, adresseproxy eller Wikidata brukes som primær koordinatkilde.\n`);

console.log(JSON.stringify({
  batch: newBatch,
  newVerifiedCount,
  newNeedsReviewCount,
  verified: Object.keys(verified),
  needsReview: Object.keys(unresolved),
  reportDir
}, null, 2));
