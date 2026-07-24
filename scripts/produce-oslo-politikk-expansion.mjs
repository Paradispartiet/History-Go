import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const TODAY = '2026-07-24';
const RESEARCH = 'reports/oslo-politikk-expansion-research.json';

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function writeJson(rel, value) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function uniq(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function patchPlaceFile(rel, id, patcher) {
  const data = readJson(rel);
  let found = 0;
  const patch = (place) => {
    if (place?.id !== id) return place;
    found += 1;
    return patcher(place);
  };
  let next;
  if (Array.isArray(data)) next = data.map(patch);
  else if (Array.isArray(data?.places)) next = { ...data, places: data.places.map(patch) };
  else next = patch(data);
  if (found !== 1) throw new Error(`${rel}: expected one ${id}, found ${found}`);
  writeJson(rel, next);
}

function addressObjectId(hit) {
  return `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav || ''}`;
}

function addressCoordinate(report, key, label, locatorType = 'building') {
  const row = report.addresses?.[key];
  const hits = row?.hits || [];
  if (hits.length !== 1) throw new Error(`${key}: expected one Geonorge hit, got ${hits.length}`);
  const hit = hits[0];
  const lat = hit.representasjonspunkt?.lat;
  const lon = hit.representasjonspunkt?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error(`${key}: missing coordinate`);
  const id = addressObjectId(hit);
  const number = `${hit.nummer}${hit.bokstav || ''}`;
  return {
    lat,
    lon,
    r: 60,
    locatorType,
    sourceProvider: 'official_address',
    sourceObjectId: id,
    address: {
      street: hit.adressenavn,
      number,
      postcode: hit.postnummer,
      city: hit.poststed === 'OSLO' ? 'Oslo' : hit.poststed,
      country: 'NO',
    },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: id,
    coordSourceUrl: row.url,
    coordVerifiedAt: TODAY,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${label}. Punktet er representasjonspunktet for adressen og brukes som display-marker, ikke som et påstått geometrisk sentrum.`,
  };
}

function polygonCentroid(geometry) {
  const pts = (geometry || []).map((p) => [Number(p.lon), Number(p.lat)]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pts.length < 3) throw new Error('Polygon geometry has too few points');
  const closed = pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1] ? pts : [...pts, pts[0]];
  let area2 = 0;
  let cx6a = 0;
  let cy6a = 0;
  for (let i = 0; i < closed.length - 1; i += 1) {
    const [x0, y0] = closed[i];
    const [x1, y1] = closed[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area2 += cross;
    cx6a += (x0 + x1) * cross;
    cy6a += (y0 + y1) * cross;
  }
  if (Math.abs(area2) < 1e-12) {
    return { lon: pts.reduce((s, p) => s + p[0], 0) / pts.length, lat: pts.reduce((s, p) => s + p[1], 0) / pts.length };
  }
  return { lon: cx6a / (3 * area2), lat: cy6a / (3 * area2) };
}

function osmGeometryCoordinate(report, osmId, label, locatorType, coordRole, coordType) {
  const element = report.overpass_regjeringskvartalet?.elements?.find((row) => row.type === 'way' && row.id === osmId)
    || report.overpass_named?.elements?.find((row) => row.type === 'way' && row.id === osmId);
  if (!element) throw new Error(`${label}: missing OSM way ${osmId}`);
  const center = element.center || polygonCentroid(element.geometry);
  return {
    lat: Number(center.lat),
    lon: Number(center.lon),
    r: locatorType === 'square' ? 110 : 55,
    locatorType,
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${osmId}`,
    geocodeAccuracy: 'geometric_center',
    coordRole,
    coordType,
    coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap way ${osmId} – ${label}`,
    coordSourceId: `osm-way:${osmId}`,
    coordSourceUrl: `https://www.openstreetmap.org/way/${osmId}`,
    coordVerifiedAt: TODAY,
    coordNote: `Eksakt navngitt OSM-objekt for ${label}. Representasjonspunktet er beregnet deterministisk fra kildegeometrien; ingen nearest/first-hit-kandidat er brukt.`,
  };
}

function politicsPlace({ id, name, year, desc, popupDesc, underbadges, coordinate, externalLinks = [], subtype, signatures = [] }) {
  return {
    id,
    name,
    visual: { designCode: coordinate.locatorType === 'square' ? 'square_miniature' : 'government_miniature' },
    ...coordinate,
    category: 'politikk',
    year,
    desc,
    popupDesc,
    underbadge_ids: underbadges,
    rounds: ['people', 'badges', 'civication', 'brands', 'leksikon', 'routes'],
    quiz_profile: {
      place_type: coordinate.locatorType === 'square' ? 'politisk_byrom' : coordinate.locatorType === 'historic_site' ? 'politisk_historisk_sted' : 'politisk_institusjonssted',
      subtype,
      signature_features: signatures,
      primary_angles: ['institusjon', 'makt', 'historie', 'offentlighet'],
      question_families: ['sted_og_funksjon', 'historisk_endring', 'institusjonell_makt', 'symbol_og_offentlighet'],
      avoid_angles: ['generisk_byggquiz_uten_politisk_stedskobling'],
      must_include: signatures.slice(0, 3),
      contrast_targets: ['stortinget', 'regjeringskvartalet'],
      notes: 'Stedet skal spørres konkret gjennom fysisk funksjon, hendelser og institusjonell betydning.',
    },
    externalLinks,
  };
}

function evidenceFor(place, resolvedIdentity, sourceName, finding) {
  return {
    schemaVersion: '1.0',
    placeId: place.id,
    placeFile: 'data/places/politikk/oslo/places_politikk.json',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'apply_source_backed_coordinate',
    currentCoordinate: {
      lat: place.lat,
      lon: place.lon,
      r: place.r,
      coordStatus: place.coordStatus,
      coordSource: place.coordSource,
      coordType: place.coordType,
      coordNote: place.coordNote,
    },
    identity: {
      currentName: place.name,
      resolvedIdentity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: place.locatorType,
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: ['entydig fysisk eller historisk kildeidentitet', 'etterprøvbart representasjonsanker'],
    evidence: [{
      sourceProvider: place.sourceProvider,
      sourceName,
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'primary_coordinate_and_identity_source',
      finding,
      canVerifyCoordinate: true,
      reason: place.coordNote,
    }],
    addressCandidates: place.address ? [{ address: `${place.address.street} ${place.address.number} Oslo`, sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: place.sourceProvider === 'osm' ? [{ sourceProvider: 'osm', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og koordinat er anvendt på canonical place.' },
    notes: [place.coordNote],
  };
}

const research = readJson(RESEARCH);
const aggregatePath = 'data/places/politikk/oslo/places_politikk.json';
const aggregate = readJson(aggregatePath);
if (!Array.isArray(aggregate)) throw new Error('Politics aggregate must be an array');

const underbadgeMap = {
  stortinget: ['storting_og_regjering'],
  youngstorget: ['arbeiderbevegelse', 'aktivisme_og_protest'],
  oslo_radhus: ['kommune_og_byraad', 'velferd_og_institusjoner'],
  eidsvolls_plass: ['storting_og_regjering', 'aktivisme_og_protest'],
  tinghuset: ['rettsstat_og_domstoler'],
  regjeringskvartalet: ['storting_og_regjering', 'politi_og_beredskap', 'velferd_og_institusjoner'],
  hoyesteretts_hus: ['rettsstat_og_domstoler'],
  politihuset_gronland: ['politi_og_beredskap'],
  folkets_hus_oslo: ['arbeiderbevegelse', 'interesseorganisasjoner'],
};

for (const [id, badges] of Object.entries(underbadgeMap)) {
  const place = aggregate.find((row) => row.id === id);
  if (!place) throw new Error(`Missing existing politics place ${id}`);
  place.underbadge_ids = badges;
}

const hoyblokkaCoordinate = osmGeometryCoordinate(research, 32448081, 'Høyblokken', 'building', 'building_center', 'building_geometry_center');
const arbeiderplassenCoordinate = osmGeometryCoordinate(research, 37046320, 'Arbeidersamfunnets plass', 'square', 'area_anchor', 'public_space_center');
const yBlokkaCoordinate = {
  lat: 59.915806,
  lon: 10.745198,
  r: 90,
  locatorType: 'historic_site',
  sourceProvider: 'manual_research',
  sourceObjectId: 'commons-file:Regjeringskvartalet_yblokka_id_165631.jpg',
  geocodeAccuracy: 'historical_approximation',
  coordRole: 'historical_anchor',
  coordType: 'historical_object_location',
  coordStatus: 'verified_historical_source',
  coordSource: 'Wikimedia Commons object location – Y-blokka, Akersgata 44',
  coordSourceId: 'commons-file:Regjeringskvartalet_yblokka_id_165631.jpg',
  coordSourceUrl: 'https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_yblokka_id_165631.jpg',
  coordVerifiedAt: TODAY,
  coordNote: 'Historisk stedsanker fra geotagget kulturminnefoto som eksplisitt identifiserer Y-blokka i Akersgata 44. Punktet representerer det revne byggets tidligere plassering, ikke en nåværende bygning eller den nye A-blokka.',
};

const newPlaces = [
  politicsPlace({
    id: '22_juli_senteret',
    name: '22. juli-senteret',
    year: 2015,
    desc: 'Nasjonalt minne- og læringssenter om terrorangrepene 22. juli 2011, fra 2026 i permanent lokale i Akersgata 42.',
    popupDesc: '22. juli-senteret dokumenterer terrorangrepene mot Regjeringskvartalet og Utøya, menneskene som ble rammet, samfunnets reaksjoner og spørsmål om demokrati, ekstremisme, beredskap og minnekultur. Den permanente plasseringen i Akersgata 42 knytter læringssenteret direkte til det første åstedet i Regjeringskvartalet.',
    underbadges: ['politi_og_beredskap', 'velferd_og_institusjoner'],
    coordinate: addressCoordinate(research, '22_juli_senteret', 'Akersgata 42, Oslo'),
    externalLinks: [{ type: 'official', label: '22. juli-senteret', url: 'https://www.22julisenteret.no/', lang: 'nb', verifiedAt: TODAY }],
    subtype: 'nasjonalt_minne_og_laeringssenter',
    signatures: ['terrorangrepene 22. juli 2011', 'demokrati og ekstremisme', 'permanent lokale i Akersgata 42'],
  }),
  politicsPlace({
    id: 'hoyblokka',
    name: 'Høyblokka',
    year: 1958,
    desc: 'Erling Viksjøs modernistiske regjeringsbygg, rehabilitert etter 22. juli og gjenåpnet som del av nytt regjeringskvartal i 2026.',
    popupDesc: 'Høyblokka gjorde etterkrigsstatens voksende administrasjon synlig som modernistisk høyhus. Bygget ble rammet av bomben 22. juli 2011, men bevart og rehabilitert. Naturbetongen, den integrerte kunsten og gjenbruken gjør stedet til et konkret møte mellom statsmakt, arkitektur, sikkerhet og kulturminnevern.',
    underbadges: ['storting_og_regjering', 'politi_og_beredskap', 'velferd_og_institusjoner'],
    coordinate: hoyblokkaCoordinate,
    externalLinks: [{ type: 'official', label: 'Regjeringen.no – bygninger og arkitektur', url: 'https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/bygninger/id712727/', lang: 'nb', verifiedAt: TODAY }],
    subtype: 'modernistisk_regjeringsbygg',
    signatures: ['Erling Viksjø', 'naturbetong og integrert kunst', 'rehabilitert etter 22. juli'],
  }),
  politicsPlace({
    id: 'y_blokka',
    name: 'Y-blokka – historisk sted',
    year: 1969,
    desc: 'Stedet for Erling Viksjøs Y-blokk, revet i 2020 etter en lang strid om sikkerhet, arkitektur, kunst og vern.',
    popupDesc: 'Y-blokka var et regjeringsbygg i naturbetong med de integrerte kunstverkene «Fiskerne» og «Måken», utført av Carl Nesjar etter skisser av Pablo Picasso. Bygget ble skadet i 2011 og revet i 2020. History Go-markøren gjelder det historiske stedet og bevaringsstriden, ikke en bygning som fortsatt står.',
    underbadges: ['storting_og_regjering', 'politi_og_beredskap'],
    coordinate: yBlokkaCoordinate,
    externalLinks: [
      { type: 'official', label: 'Regjeringen.no – Y-blokken og kunsten', url: 'https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/fakta-y-blokken-ma-rives/id2721904/', lang: 'nb', verifiedAt: TODAY },
      { type: 'source', label: 'Wikimedia Commons – historisk objektplassering', url: yBlokkaCoordinate.coordSourceUrl, lang: 'nb', verifiedAt: TODAY },
    ],
    subtype: 'revet_regjeringsbygg_og_bevaringsstrid',
    signatures: ['revet Y-formet regjeringsbygg', 'Picasso og Carl Nesjars integrerte kunst', 'bevaringsstriden fram mot rivingen i 2020'],
  }),
  politicsPlace({
    id: 'victoria_terrasse',
    name: 'Victoria terrasse',
    year: 1889,
    desc: 'Monumentalt statlig bygningskompleks knyttet til norsk utenrikspolitikk, regjeringshistorie, okkupasjon og Gestapos virksomhet.',
    popupDesc: 'Victoria terrasse ble et hovedsted for norsk utenrikspolitikk da Utenriksdepartementet flyttet inn i 1905. Under okkupasjonen brukte Gestapo deler av komplekset til avhør, tortur og henrettelser. Etter krigen vendte statsforvaltningen tilbake, og stedet ble igjen UDs viktigste fysiske symbol. Komplekset viser hvordan diplomati, statsmakt og overgrep kan avsette svært ulike historiske lag i samme bygning.',
    underbadges: ['storting_og_regjering', 'politi_og_beredskap', 'rettsstat_og_domstoler'],
    coordinate: addressCoordinate(research, 'victoria_terrasse', '7. juni-plassen 1, Oslo'),
    externalLinks: [
      { type: 'official', label: 'Regjeringen.no – Utenriksdepartementets historie', url: 'https://www.regjeringen.no/no/dep/ud/dep/historikk/id861/', lang: 'nb', verifiedAt: TODAY },
      { type: 'official', label: 'Regjeringen.no – fredningsmarkeringen', url: 'https://www.regjeringen.no/no/aktuelt/utenriksministerens-tale-ved-markeringen-av-fredningsvedtaket-for-victoria-terrasse/id3093157/', lang: 'nb', verifiedAt: TODAY },
    ],
    subtype: 'utenrikspolitisk_maktsted_og_okkupasjonshistorie',
    signatures: ['Utenriksdepartementets historiske hjem', 'regjeringsbeslutninger og diplomati', 'Gestapos avhørs- og tortursted under okkupasjonen'],
  }),
  politicsPlace({
    id: 'statsministerboligen',
    name: 'Statsministerboligen',
    year: 2008,
    desc: 'Norges faste statsministerbolig i Inkognitogata 18, tatt i bruk i 2008 som del av statens representasjonsanlegg ved Parkveien 45.',
    popupDesc: 'Statsministerboligen gir regjeringssjefen en fast og sikret bolig i hovedstaden. Anlegget viser at politisk makt også krever hverdagslig, representativ og sikkerhetsmessig infrastruktur utenfor kontorene i Regjeringskvartalet.',
    underbadges: ['storting_og_regjering', 'politi_og_beredskap'],
    coordinate: addressCoordinate(research, 'statsministerboligen', 'Inkognitogata 18, Oslo'),
    externalLinks: [{ type: 'official', label: 'Regjeringen.no – Statsministerboliger', url: 'https://www.regjeringen.no/no/dep/smk/ansvarsomrader/forloperne/1905-1945/1908-Statsministerboliger/id759072/', lang: 'nb', verifiedAt: TODAY }],
    subtype: 'fast_bolig_for_regjeringssjefen',
    signatures: ['Inkognitogata 18', 'fast statsministerbolig siden 2008', 'sikkerhet og representasjon'],
  }),
  politicsPlace({
    id: 'hoyres_hus',
    name: 'Høyres Hus',
    year: 1935,
    desc: 'Partibygg og politisk møteplass i Stortingsgata 20, brukt til organisasjon, programarbeid, valgkamp og medlemsdemokrati.',
    popupDesc: 'Høyres Hus er fysisk infrastruktur for et politisk parti. Her holdes møter, seminarer, programprosesser og valgkampaktiviteter. Stedet gjør partiorganisasjonen synlig som noe mer enn kandidater og medieutspill: politikk produseres også gjennom medlemsarbeid, administrasjon og langsiktig organisering.',
    underbadges: ['partier_og_valg'],
    coordinate: addressCoordinate(research, 'hoyres_hus', 'Stortingsgata 20, Oslo'),
    externalLinks: [{ type: 'official', label: 'Oslo Høyre', url: 'https://hoyre.no/oslo/', lang: 'nb', verifiedAt: TODAY }],
    subtype: 'partihus_og_organisasjonssted',
    signatures: ['Stortingsgata 20', 'partiorganisasjon og medlemsmøter', 'programarbeid og valgkamp'],
  }),
  politicsPlace({
    id: 'arbeidersamfunnets_plass',
    name: 'Arbeidersamfunnets plass',
    year: 1962,
    desc: 'Offentlig plass oppkalt etter Oslo Arbeidersamfunn, mellom Torggata, Samfunnshuset, Calmeyers gate og Hammersborggata.',
    popupDesc: 'Arbeidersamfunnets plass binder arbeiderbevegelsens organisasjonshistorie til et konkret offentlig byrom. Plassen fikk navnet i 1962 etter Oslo Arbeidersamfunn og ligger ved Samfunnshuset. Den viser hvordan foreningsliv, politiske møter og folkelig organisering kan bli skrevet inn i byens stedsnavn og møteplasser.',
    underbadges: ['arbeiderbevegelse', 'aktivisme_og_protest'],
    coordinate: arbeiderplassenCoordinate,
    externalLinks: [{ type: 'source', label: 'Oslo byleksikon – Arbeidersamfunnets plass', url: 'https://oslobyleksikon.no/side/Arbeidersamfunnets_plass', lang: 'nb', verifiedAt: TODAY }],
    subtype: 'arbeiderbevegelsens_offentlige_plass',
    signatures: ['oppkalt etter Oslo Arbeidersamfunn', 'Samfunnshuset', 'politisk organisering i offentlig byrom'],
  }),
];

const existingIds = new Set(aggregate.map((row) => row.id));
for (const place of newPlaces) {
  if (existingIds.has(place.id)) throw new Error(`New place already exists: ${place.id}`);
  aggregate.push(place);
}
writeJson(aggregatePath, aggregate);

patchPlaceFile('data/places/politikk/oslo/slottet.json', 'slottet', (place) => ({ ...place, underbadge_ids: ['storting_og_regjering'] }));
patchPlaceFile('data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01.json', 'bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5', (place) => ({ ...place, underbadge_ids: ['storting_og_regjering', 'arbeiderbevegelse'] }));

patchPlaceFile('data/places/historie/oslo/places_historie/nobels_fredssenter.json', 'nobels_fredssenter', (place) => ({
  ...place,
  secondaryBadgeIds: uniq([...(place.secondaryBadgeIds || []), 'politikk']),
  underbadge_ids: uniq([...(place.underbadge_ids || []), 'samtidshistorie', 'kulturminner_og_bevaring']),
}));
patchPlaceFile('data/places/by/oslo/gamle_radhus.json', 'gamle_radhus', (place) => ({
  ...place,
  secondaryBadgeIds: uniq([...(place.secondaryBadgeIds || []), 'politikk']),
  underbadge_ids: uniq([...(place.underbadge_ids || []), 'klassisk_arkitektur', 'monumenter_og_landemerker']),
}));
patchPlaceFile('data/places/by/oslo/places/slottsparken.json', 'slottsparken', (place) => ({
  ...place,
  secondaryBadgeIds: uniq([...(place.secondaryBadgeIds || []), 'politikk']),
  underbadge_ids: uniq([...(place.underbadge_ids || []), 'byplanlegging', 'monumenter_og_landemerker']),
}));

const politicsBadgePath = 'data/badges/politikk.json';
const politicsBadge = readJson(politicsBadgePath);
politicsBadge.sub = uniq([
  ...(politicsBadge.sub || []).slice(0, 1),
  'partier_og_valg',
  ...(politicsBadge.sub || []).slice(1),
]);
writeJson(politicsBadgePath, politicsBadge);

const contractPath = 'docs/DATA_PRODUCTION_CONTRACT.md';
let contract = fs.readFileSync(contractPath, 'utf8');
if (!contract.includes('`partier_og_valg`')) {
  contract = contract.replace('- `storting_og_regjering`\n', '- `storting_og_regjering`\n- `partier_og_valg`\n');
  fs.writeFileSync(contractPath, contract, 'utf8');
}

for (const place of newPlaces) {
  const sourceName = place.sourceProvider === 'official_address'
    ? 'Geonorge Adresser API v1'
    : place.sourceProvider === 'osm'
      ? 'OpenStreetMap'
      : 'Wikimedia Commons geotagget kulturminneobjekt';
  writeJson(`data/coordinate-evidence/oslo/politikk/${place.id}.json`, evidenceFor(
    place,
    `${place.name} som eget canonical politikksted i Oslo`,
    sourceName,
    `Kilden identifiserer ${place.name} og det lagrede representasjonsankeret.`,
  ));
}

execFileSync(process.execPath, ['scripts/split-politikk-oslo-places.mjs'], { stdio: 'inherit' });

const report = `# Oslo-politikk: steder og underkategorier\n\nDato: ${TODAY}\n\n## Resultat\n\n- 9 eksisterende manifeststeder er omklassifisert med presise politikk-underbadges.\n- Slottet og Christopher Hornsrud-skiltet er kontrollert og oppdatert.\n- Nobels Fredssenter, Gamle rådhus og Slottsparken beholder sin hovedkategori og får politikk som sekundærbadge.\n- 7 nye canonical politikksteder er lagt til: 22. juli-senteret, Høyblokka, Y-blokka, Victoria terrasse, Statsministerboligen, Høyres Hus og Arbeidersamfunnets plass.\n- Ny underkategori: partier_og_valg.\n\n## Koordinatbeslutninger\n\n- Adressebare aktive bygg bruker Geonorge først.\n- Høyblokka bruker eksakt navngitt OSM-bygningsgeometri.\n- Arbeidersamfunnets plass bruker eksakt navngitt OSM-plasspolygon.\n- Y-blokka bruker et dokumentert historisk objektanker og er uttrykkelig ikke modellert som et eksisterende bygg.\n`;
fs.writeFileSync('reports/oslo-politikk-steder-underkategorier.md', report, 'utf8');

console.log(`Produced ${newPlaces.length} new politics places and updated 14 existing/cross-domain places.`);
