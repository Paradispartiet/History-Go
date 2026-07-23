import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-23';
const reportDir = path.join(root, 'reports/etne-religion-skate-final');
const manifestPath = path.join(root, 'data/places/manifest.json');
const indexPath = path.join(root, 'data/places/places_index.json');

async function writeJson(relativePath, value) {
  const file = path.join(root, relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
}

const unique = (values) => [...new Set(values)];

function records(doc) {
  if (Array.isArray(doc)) return doc;
  if (Array.isArray(doc?.places)) return doc.places;
  return [doc];
}

function haversineM(aLat, aLon, bLat, bLon) {
  const R = 6371000;
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
}

function polygonCentroid(points) {
  const pts = [...points];
  const first = pts[0];
  const last = pts.at(-1);
  if (first.lat !== last.lat || first.lon !== last.lon) pts.push(first);
  let area2 = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const x0 = pts[i].lon;
    const y0 = pts[i].lat;
    const x1 = pts[i + 1].lon;
    const y1 = pts[i + 1].lat;
    const cross = x0 * y1 - x1 * y0;
    area2 += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(area2) < 1e-12) {
    return {
      lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
      lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
    };
  }
  return { lat: cy / (3 * area2), lon: cx / (3 * area2) };
}

async function geonorgeAddress({ key, street, number, postcode, city, expected }) {
  const url = new URL('https://ws.geonorge.no/adresser/v1/sok');
  url.searchParams.set('adressenavn', street);
  url.searchParams.set('nummer', String(number));
  url.searchParams.set('kommunenummer', '4611');
  url.searchParams.set('treffPerSide', '100');

  const response = await fetch(url, { headers: { 'user-agent': 'History-Go-Etne-final/1.0' } });
  if (!response.ok) throw new Error(`${key}: Geonorge HTTP ${response.status}`);
  const payload = await response.json();
  await writeJson(`reports/etne-religion-skate-final/geonorge/${key}.json`, { url: url.toString(), response: payload });

  const hits = Array.isArray(payload.adresser) ? payload.adresser : [];
  const exact = hits.filter((hit) =>
    String(hit.adressenavn || '').toLowerCase() === street.toLowerCase()
    && String(hit.nummer) === String(number)
    && String(hit.kommunenummer) === '4611'
  );
  if (exact.length !== 1) throw new Error(`${key}: expected exactly one exact Geonorge hit, got ${exact.length}`);
  const hit = exact[0];
  if (String(hit.postnummer || '') !== String(postcode)) throw new Error(`${key}: unexpected postcode ${hit.postnummer}`);
  const lat = Number(hit.representasjonspunkt?.lat);
  const lon = Number(hit.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error(`${key}: missing Geonorge coordinates`);
  const distance = haversineM(lat, lon, expected.lat, expected.lon);
  if (distance > expected.maxM) throw new Error(`${key}: address point is ${distance.toFixed(1)} m from independent church reference`);

  return {
    lat,
    lon,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}`,
    coordSourceUrl: url.toString(),
    address: {
      street,
      number: String(number),
      postcode: String(hit.postnummer),
      city,
      country: 'NO',
    },
  };
}

async function fetchFretteGeometry() {
  const wayId = 557505490;
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full.json`;
  const response = await fetch(url, { headers: { 'user-agent': 'History-Go-Etne-final/1.0' } });
  if (!response.ok) throw new Error(`frette_kapell: OSM HTTP ${response.status}`);
  const payload = await response.json();
  await writeJson('reports/etne-religion-skate-final/osm/frette_kapell.json', { url, response: payload });

  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const way = elements.find((element) => element.type === 'way' && Number(element.id) === wayId);
  if (!way) throw new Error('frette_kapell: OSM way missing');
  if (way.tags?.amenity !== 'place_of_worship' || way.tags?.building !== 'chapel' || !String(way.tags?.name || '').toLowerCase().includes('frette')) {
    throw new Error(`frette_kapell: unexpected OSM tags ${JSON.stringify(way.tags || {})}`);
  }
  const nodeMap = new Map(
    elements
      .filter((element) => element.type === 'node' && Number.isFinite(Number(element.lat)) && Number.isFinite(Number(element.lon)))
      .map((node) => [Number(node.id), { lat: Number(node.lat), lon: Number(node.lon) }]),
  );
  const points = (way.nodes || []).map((nodeId) => nodeMap.get(Number(nodeId))).filter(Boolean);
  if (points.length < 3) throw new Error('frette_kapell: insufficient building geometry');
  const center = polygonCentroid(points);
  const distance = haversineM(center.lat, center.lon, 59.7261, 6.16205);
  if (distance > 120) throw new Error(`frette_kapell: centroid is ${distance.toFixed(1)} m from independent reference`);
  return { lat: center.lat, lon: center.lon, wayId, url };
}

const religionEmneIds = [
  'em_religion_hellige_rom',
  'em_religion_ritualer_praksis',
  'em_religion_religionshistorie_lokalt',
  'em_religion_kristendom',
];

function addressCoord(result, note) {
  return {
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: result.sourceObjectId,
    address: result.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.coordSourceUrl,
    coordVerifiedAt: verifiedAt,
    coordNote: note,
  };
}

function religionDoc({ id, name, lat, lon, year, period, desc, popupDesc, tags, coord, links, quizProfile }) {
  return {
    places: [{
      id,
      name,
      lat,
      lon,
      r: 180,
      category: 'religion',
      fylke: 'vestland',
      kommune: 'Etne',
      year,
      period,
      tags: unique(['religion', ...tags]),
      desc,
      popupDesc,
      emne_ids: religionEmneIds,
      ...coord,
      externalLinks: links,
      quiz_profile: quizProfile,
    }],
  };
}

async function addSubcultureLayer(relativePath, kind) {
  const doc = await readJson(relativePath);
  const list = records(doc);
  if (list.length !== 1) throw new Error(`${relativePath}: expected exactly one place record`);
  const place = list[0];
  place.secondaryBadgeIds = unique([...(place.secondaryBadgeIds || []), 'subkultur']);
  place.tags = unique([...(place.tags || []), 'subkultur', 'skatekultur', 'scene_og_fellesskap']);
  place.emne_ids = unique([
    ...(place.emne_ids || []),
    'em_sub_ungdomskultur_identitet',
    'em_sub_tilhorighet_miljo',
    'em_sub_scene_fellesskap',
  ]);
  const paragraph = kind === 'bmx'
    ? 'I History Go er Sport framleis hovudkategorien fordi dette fysisk er eit BMX- og skateanlegg. Samstundes får staden eit sekundært Subkultur-lag: ei eiga BMX-/skateforeining, eigenorganisert bruk og ungdomskultur dokumenterer eit sjølvstendig miljø rundt arenaen.'
    : 'I History Go er Sport framleis hovudkategorien fordi dette fysisk er eit skateanlegg. Samstundes får parken eit sekundært Subkultur-lag fordi den permanente streetprega parken er bygd spesifikt rundt skating og eigenorganisert skatepraksis.';
  if (!String(place.popupDesc || '').includes('sekundært Subkultur-lag')) place.popupDesc = `${String(place.popupDesc || '').trim()} ${paragraph}`.trim();
  place.quiz_profile = place.quiz_profile || {};
  place.quiz_profile.primary_angles = unique([...(place.quiz_profile.primary_angles || []), 'skatekultur', 'scene_og_fellesskap']);
  place.quiz_profile.must_include = unique([...(place.quiz_profile.must_include || []), 'at Sport er hovudkategori og Subkultur eit dokumentert sekundært lag']);
  place.quiz_profile.avoid_angles = unique([...(place.quiz_profile.avoid_angles || []), 'a_kalle_all_bruk_eller_alle_brukarar_subkultur']);
  place.quiz_profile.notes = `${place.quiz_profile.notes ? `${place.quiz_profile.notes} ` : ''}Subkultur-laget gjeld den dokumenterte skate/BMX-praksisen, scena og fellesskapet rundt eigenorganisert bruk; det er ikkje ein påstand om at alle brukarar er marginaliserte.`;
  await writeJson(relativePath, doc);
}

async function main() {
  await fs.mkdir(reportDir, { recursive: true });
  const existingIndex = await readJson('data/places/places_index.json');
  const newIds = ['etne_kyrkje', 'skanevik_kyrkje', 'frette_kapell'];
  const duplicates = newIds.filter((id) => existingIndex.some((place) => place?.id === id));
  if (duplicates.length) throw new Error(`Refusing duplicate canonical place IDs: ${duplicates.join(', ')}`);

  const etne = await geonorgeAddress({
    key: 'etne_kyrkje',
    street: 'Enge',
    number: 5,
    postcode: '5590',
    city: 'Etne',
    expected: { lat: 59.6696388889, lon: 5.9444611111, maxM: 250 },
  });
  const skanevik = await geonorgeAddress({
    key: 'skanevik_kyrkje',
    street: 'Prestavegen',
    number: 11,
    postcode: '5593',
    city: 'Skånevik',
    expected: { lat: 59.7318305556, lon: 5.9394833333, maxM: 250 },
  });
  const frette = await fetchFretteGeometry();

  const placeFiles = [
    {
      path: 'data/places/religion/vestland/etne/etne_kyrkje.json',
      doc: religionDoc({
        id: 'etne_kyrkje',
        name: 'Etne kyrkje',
        lat: etne.lat,
        lon: etne.lon,
        year: 2013,
        period: 'Moderne soknekyrkje frå 2013',
        desc: 'Etne kyrkje er den moderne soknekyrkja i Etne sentrum, teken i bruk i 2013 og i aktiv bruk til gudstenester, trusopplæring og kyrkjelydsarbeid.',
        popupDesc: 'Etne kyrkje vart teken i bruk i 2013 og er eit aktivt religiøst samlingspunkt i Etne. Kyrkja blir brukt til gudstenester, konfirmantarbeid, babysong, KRIK og anna kyrkjelydsarbeid. I History Go er dette først og fremst eit levande trossted, medan den nyare bygningshistoria er eit sekundært lag.',
        tags: ['kristendom', 'kirke', 'etne', 'soknekyrkje', 'trusliv', '2013'],
        coord: addressCoord(etne, 'Address-first: Enge 5 er løyst som eitt eksakt Geonorge-adressepunkt og krysskontrollert mot ein uavhengig kyrkjeposisjon for Etne kyrkje.'),
        links: [
          { type: 'official', label: 'Etne kyrkjelege fellesråd – Kyrkjene våre', url: 'https://www.etne.kyrkja.no/Kyrkjene-v%C3%A5re', lang: 'nn', verifiedAt },
          { type: 'official', label: 'Etne kyrkjelege fellesråd – Born og unge', url: 'https://www.etne.kyrkja.no/Born-og-unge', lang: 'nn', verifiedAt },
        ],
        quizProfile: {
          place_type: 'kirke',
          subtype: 'moderne_aktiv_soknekyrkje_fra_2013',
          signature_features: ['teken i bruk i 2013', 'aktiv soknekyrkje i Etne', 'arena for gudstenester og trusopplæring'],
          primary_angles: ['trosliv', 'kristendom', 'ritualer', 'lokalsamfunn'],
          question_families: ['kirkesteder', 'moderne_kirkebygg', 'etne', 'trosliv'],
          avoid_angles: ['framstille_som_historisk_middelalderkirke'],
          must_include: ['året 2013', 'den aktive kyrkjelydsfunksjonen'],
          contrast_targets: ['gjerde_kyrkje_etne', 'stodle_kyrkje'],
        },
      }),
    },
    {
      path: 'data/places/religion/vestland/etne/skanevik_kyrkje.json',
      doc: religionDoc({
        id: 'skanevik_kyrkje',
        name: 'Skånevik kyrkje',
        lat: skanevik.lat,
        lon: skanevik.lon,
        year: 1900,
        period: 'Aktiv soknekyrkje frå 1900',
        desc: 'Dagens Skånevik kyrkje vart vigsla i 1900 og er den aktive soknekyrkja i bygda, fysisk skild frå det eldre historiske kyrkjestadsankeret.',
        popupDesc: 'Skånevik kyrkje er dagens aktive kyrkjebygg i bygda og vart vigsla i 1900. Ho står nord for den eldre kyrkjestaden der tidlegare kyrkjer stod. History Go skil derfor mellom dagens levande trossted og den eldre kyrkjestaden som eit eige fysisk og historisk lag.',
        tags: ['kristendom', 'kirke', 'skanevik', 'soknekyrkje', 'trusliv', '1900'],
        coord: addressCoord(skanevik, 'Address-first: Prestavegen 11 er løyst som eitt eksakt Geonorge-adressepunkt og krysskontrollert mot ein uavhengig kyrkjeposisjon. Markøren er medvite skild frå det eldre skanevik_kyrkjestad-ankeret.'),
        links: [
          { type: 'official', label: 'Etne kyrkjelege fellesråd – Kyrkjene våre', url: 'https://www.etne.kyrkja.no/Kyrkjene-v%C3%A5re', lang: 'nn', verifiedAt },
          { type: 'reference', label: 'Norges Kirker – Skånevik kyrkje', url: 'https://norgeskirker.no/wiki/Sk%C3%A5nevik_kyrkje', lang: 'nn', verifiedAt },
        ],
        quizProfile: {
          place_type: 'kirke',
          subtype: 'aktiv_soknekyrkje_fra_1900',
          signature_features: ['vigsla i 1900', 'dagens aktive kyrkje i Skånevik', 'fysisk skild frå den eldre kyrkjestaden'],
          primary_angles: ['trosliv', 'kristendom', 'ritualer', 'stadskontinuitet'],
          question_families: ['kirkesteder', 'skanevik', '1900_tallet', 'trosliv'],
          avoid_angles: ['blande_med_skanevik_kyrkjestad', 'framstille_dagens_bygg_som_middelalderkirke'],
          must_include: ['at dette er dagens kyrkje frå 1900', 'skiljet frå den eldre kyrkjestaden'],
          contrast_targets: ['skanevik_kyrkjestad', 'fjaera_kapell'],
        },
      }),
    },
    {
      path: 'data/places/religion/vestland/etne/frette_kapell.json',
      doc: religionDoc({
        id: 'frette_kapell',
        name: 'Frette kapell',
        lat: frette.lat,
        lon: frette.lon,
        year: 1959,
        period: 'Bedehus frå 1910, vigsla som kapell i 1959',
        desc: 'Frette kapell ved enden av Stordalsvatnet vart oppført som bedehuset Betania i 1910 og ombygd og vigsla til kyrkjeleg bruk i 1959.',
        popupDesc: 'Bygningen på Frette vart reist som bedehuset Betania i 1910. I 1959 vart han bygd om til kyrkjeleg bruk med den eldre stova som kjerne, og kapellet vart vigsla 13. desember same år. Staden viser ei konkret overgang frå lokal bedehustradisjon til fast kapellfunksjon.',
        tags: ['kristendom', 'kapell', 'bedehus', 'frette', 'stordalsvatnet', '1910', '1959'],
        coord: {
          locatorType: 'building',
          sourceProvider: 'osm',
          sourceObjectId: `osm-way:${frette.wayId}`,
          geocodeAccuracy: 'building',
          coordRole: 'building_center',
          coordType: 'building_center',
          coordStatus: 'verified_geometry',
          coordSource: 'OpenStreetMap building geometry + Norges Kirker',
          coordSourceId: `osm-way:${frette.wayId}`,
          coordSourceUrl: `https://www.openstreetmap.org/way/${frette.wayId}`,
          coordVerifiedAt: verifiedAt,
          coordNote: 'Object-first: OSM way 557505490 er henta direkte frå OSM API og verifisert fresh som namngitt place_of_worship med building=chapel. Polygoncentroid frå sjølve bygningsgeometrien er canonical marker og er krysskontrollert mot Norges Kirker.',
        },
        links: [
          { type: 'reference', label: 'Norges Kirker – Frette kapell', url: 'https://norgeskirker.no/wiki/Frette_kapell', lang: 'nn', verifiedAt },
          { type: 'official', label: 'Etne kyrkjelege fellesråd – Kyrkjene våre', url: 'https://www.etne.kyrkja.no/Kyrkjene-v%C3%A5re', lang: 'nn', verifiedAt },
        ],
        quizProfile: {
          place_type: 'kapell',
          subtype: 'bedehus_ombygd_til_kapell_i_1959',
          signature_features: ['Betania bedehus frå 1910', 'ombygd og vigsla som kapell i 1959', 'ligg ved enden av Stordalsvatnet'],
          primary_angles: ['trosliv', 'bedehustradisjon', 'kristendom', 'lokalsamfunn'],
          question_families: ['kapeller', 'bedehus', 'frette', '1950_tallet'],
          avoid_angles: ['hevde_at_bygningen_var_kapell_fra_1910'],
          must_include: ['skiljet mellom bedehuset frå 1910 og kapellfunksjonen frå 1959'],
          contrast_targets: ['fjaera_kapell', 'grindheim_kyrkje_etne'],
        },
      }),
    },
  ];

  for (const entry of placeFiles) await writeJson(entry.path, entry.doc);

  await addSubcultureLayer('data/places/sport/vestland/etne/etne_bmx_og_skatepark.json', 'bmx');
  await addSubcultureLayer('data/places/sport/vestland/etne/skanevik_skatepark.json', 'skate');

  const manifest = await readJson('data/places/manifest.json');
  for (const entry of placeFiles) {
    const relative = entry.path.replace(/^data\//, '');
    if (!manifest.files.includes(relative)) manifest.files.push(relative);
  }
  await writeJson('data/places/manifest.json', manifest);

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(path.join(reportDir, 'README.md'), `# Etne religion og skatekultur – sluttbatch\n\nDato: ${verifiedAt}\n\n## Nye Religion-steder\n\n- Etne kyrkje\n- Skånevik kyrkje\n- Frette kapell\n\n## Utsett stad\n\nSkånevik bedehus er ikkje aktivert. Kommunen dokumenterer organisasjonen og ei adresseoppføring, men det finst ikkje tilstrekkeleg verifisert grunnlag for å identifisere den fysiske bedehusbygningen. Ingen kartmarkør blir gjetta.\n\n## Subkultur-vurdering\n\n- Etne BMX- og skatepark: Sport primært, Subkultur sekundært.\n- Skånevik skatepark: Sport primært, Subkultur sekundært.\n- Etne pumptrack: Sport berre; kjeldegrunnlaget dokumenterer ikkje eit like tydeleg sjølvstendig skate-/subkulturmiljø.\n\n## Prinsipp\n\nSkate-/BMX-anlegga får ikkje Subkultur fordi dei er ulovlege eller fordi alle brukarar står utanfor samfunnet. Sekundærlaget gjeld dokumentert eigenorganisert praksis, scene, identitet og fellesskap.\n`);

  console.log(JSON.stringify({
    addedReligionPlaces: newIds,
    secondarySubculturePlaces: ['etne_bmx_og_skatepark', 'skanevik_skatepark'],
    unchangedSportOnly: ['etne_pumptrack'],
    deferred: ['skanevik_bedehus'],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
