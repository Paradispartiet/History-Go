import fs from 'node:fs';
import { execSync } from 'node:child_process';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => {
  fs.mkdirSync(p.split('/').slice(0, -1).join('/'), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
};
const addUnique = (arr, value) => { if (!arr.includes(value)) arr.push(value); };

// Always materialize from the latest canonical main so shared manifests and protocol state cannot go stale.
execSync('git fetch origin main && git reset --hard origin/main', { stdio: 'inherit' });

const places = [
  {
    id: 'oscarshall',
    name: 'Oscarshall',
    lat: 59.91026364422076,
    lon: 10.69231350671801,
    r: 60,
    category: 'historie',
    year: 1852,
    desc: 'Kongelig lystslott på Bygdøy, fullført i 1852 som et samlet kunst-, håndverks- og arkitekturprosjekt og senere åpnet for publikum som museum og kultursted.',
    popupDesc: 'Oscarshall ble oppført for kong Oscar I og dronning Joséphine i 1847–1852 etter tegninger av Johan Henrik Nebelong. Kunstnere og håndverkere fikk en sentral rolle i interiørene, og anlegget står som et viktig fysisk uttrykk for norsk kunst, kunsthåndverk og nasjonalromantisk representasjon på 1800-tallet. I 1881 åpnet Oscar II lystslottet som museum, og denne offentlige formidlingstradisjonen er videreført.\n\nI History Go behandles selve lystslottet som den primære canonical identiteten. Den romantiske parken hører til besøksanlegget, men splittes ikke ut som et nytt overlappende sted fra denne kilden alene. Oscarshall er også fysisk og funksjonelt forskjellig fra både Det kongelige slott i sentrum og det bredere Bygdø Kongsgård-anlegget.',
    emne_ids: ['em_his_spor_materialitet', 'em_his_historiske_lag_i_byrom', 'em_his_kulturminner_bevaring', 'em_his_samtid_ettertid_fortelling'],
    quiz_profile: {
      place_type: 'kongelig_lystslott_og_museum',
      subtype: 'nasjonalromantisk_kunst_arkitektur_og_kongelig_kultursted',
      signature_features: ['kongelig lystslott fullført i 1852', 'helhet mellom arkitektur, kunst og kunsthåndverk', 'offentlig museumstradisjon siden 1881'],
      primary_angles: ['bygning_og_materialitet', 'kunst_og_handverk', 'kongelig_kulturhistorie', 'museum_og_bevaring'],
      question_families: ['historisk_endring', 'materielle_spor', 'kunst_og_arkitektur', 'institusjon_og_ettertid', 'kontrast'],
      avoid_angles: ['generisk_kongelig_residens', 'behandle_parken_som_eget_sted_uten_ny_kilde', 'forveksle_med_det_kongelige_slott'],
      must_include: ['fullføringen i 1852', 'forholdet mellom arkitektur, kunst og kunsthåndverk', 'rollen som offentlig museum og kultursted'],
      contrast_targets: ['slottet', 'villa_stenersen', 'bygdoy_kongsgard'],
      notes: 'Spør som et konkret historisk kunst- og kulturmiljø. Eksterne hoff-, arkitektur- og kunsthistoriske kilder skal drive synlig quizinnhold.'
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-adresser-v1:0301:15443:15',
    address: { street: 'Oscarshallveien', number: '15', postcode: '0287', city: 'Oslo', country: 'NO' },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-adresser-v1:0301:15443:15',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Oscarshallveien%2015%20Oslo',
    coordType: 'address_point',
    coordVerifiedAt: '2026-07-21',
    coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Oscarshallveien 15, OSLO. Punktet brukes som display- og unlock-marker for Oscarshall og representerer ikke hele parken eller det bredere Bygdø Kongsgård-anlegget.',
    externalLinks: [
      { type: 'official', label: 'Det norske kongehus – Oscarshall', url: 'https://www.royalcourt.no/the-royal-residences/oscarshall', lang: 'nb', verifiedAt: '2026-07-21' },
      { type: 'official', label: 'Det norske kongehus – Besøk Oscarshall', url: 'https://www.royalcourt.no/visits-and-cultural-activities/visit-oscarshall', lang: 'nb', verifiedAt: '2026-07-21' }
    ]
  },
  {
    id: 'vikingtidsmuseet',
    name: 'Vikingtidsmuseet',
    lat: 59.9045924976552,
    lon: 10.684908358141946,
    r: 75,
    category: 'historie',
    year: 1926,
    desc: 'Det historiske Vikingskipshuset fra 1926 og det nye sammenkoblede Vikingtidsmuseet på Bygdøy, ett fysisk museumsanlegg for vikingskip og andre arkeologiske gjenstander fra vikingtiden.',
    popupDesc: 'Vikingtidsmuseet representerer den stabile museumsplassen på Huk aveny 35 der det historiske Vikingskipshuset bevares og bygges sammen med et nytt museumsanlegg. Den gamle korsformede museumsbygningen stod ferdig i 1926 og er en del av den nye helheten, ikke et separat tidligere sted som skal få en konkurrerende markør.\n\nI 2026 er anlegget fortsatt under ferdigstilling. De tre vikingskipene og Oseberg-sledene er flyttet fra den gamle delen inn i den nye museumsdelen som del av sikrings- og byggeprosjektet. Coordinate-verifisering betyr derfor bare at den fysiske museumsplassen er sikkert lokalisert; den skal ikke tolkes som at museet allerede er et ordinært åpent besøkssted.\n\nHistory Go bruker én canonical identitet for den historiske og nye museumshelheten. Spørsmål skal skille mellom arkeologiske funn, bevaring og konservering, det historiske museumsbygget og den pågående transformasjonen av stedet.',
    emne_ids: ['em_his_spor_materialitet', 'em_his_historiske_lag_i_byrom', 'em_his_kulturminner_bevaring', 'em_his_samtid_ettertid_fortelling'],
    quiz_profile: {
      place_type: 'arkeologisk_museumsanlegg_i_transformasjon',
      subtype: 'bevart_vikingskipshus_koblet_til_nytt_vikingtidsmuseum',
      signature_features: ['historisk Vikingskipshus fra 1926', 'bevart eldre museumsbygg integrert i et nytt anlegg', 'vikingskip og Oseberg-gjenstander flyttet til ny museumsdel i byggeperioden'],
      primary_angles: ['arkeologiske_funn', 'museum_og_bevaring', 'bygg_og_transformasjon', 'kilde_og_fortolkning'],
      question_families: ['materielle_spor', 'institusjonshistorie', 'bevaring_og_konservering', 'historisk_endring', 'kontrast'],
      avoid_angles: ['behandle_vikingskipshuset_og_vikingtidsmuseet_som_to_overlappende_steder', 'påstå_at_museet_er_ordinært_åpent_i_byggeperioden', 'generisk_vikingquiz_uten_stedlig_kilde'],
      must_include: ['den bevarte 1926-bygningen', 'sammenkoblingen med det nye museumsanlegget', 'skillet mellom fysisk koordinatverifisering og besøksstatus'],
      contrast_targets: ['historisk_museum', 'norsk_folkemuseum', 'frammuseet', 'kon_tiki_museet'],
      notes: 'Spør som én fysisk museumsplass med flere tidslag. Eksterne arkeologiske, museumsfaglige og prosjektkilder skal drive synlig quizinnhold.'
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-adresser-v1:0301:13153:35',
    address: { street: 'Huk aveny', number: '35', postcode: '0287', city: 'Oslo', country: 'NO' },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-adresser-v1:0301:13153:35',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Huk%20Aveny%2035%20Oslo',
    coordType: 'address_point',
    coordVerifiedAt: '2026-07-21',
    coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Huk aveny 35, OSLO. Punktet brukes som stabil display- og unlock-marker for den samlede museumsplassen med bevart Vikingskipshus og nytt Vikingtidsmuseum; det uttrykker ikke åpningstatus og er ikke en markør for hele Bygdøy.',
    externalLinks: [
      { type: 'official', label: 'Statsbygg – alle vikingskipene på plass', url: 'https://www.statsbygg.no/nyheter/no-er-alle-vikingskipa-pa-plass', lang: 'nn', verifiedAt: '2026-07-21' },
      { type: 'official', label: 'Statsbygg – vikingskattene trygt på plass', url: 'https://www.statsbygg.no/nyheter/na-er-vikingskattene-trygt-pa-plass', lang: 'nb', verifiedAt: '2026-07-21' }
    ]
  }
];

const manifestPath = 'data/places/manifest.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const manifest = readJson(manifestPath);
const evidenceManifest = readJson(evidenceManifestPath);

for (const place of places) {
  const placePath = `data/places/historie/oslo/places_historie/${place.id}.json`;
  const evidencePath = `data/coordinate-evidence/oslo/historie/${place.id}.json`;
  if (fs.existsSync(placePath)) throw new Error(`${place.id} already exists on latest main; aborting duplicate production.`);
  writeJson(placePath, place);
  addUnique(manifest.files, placePath.replace(/^data\//, ''));

  const evidence = {
    placeId: place.id,
    placeFile: placePath,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat: place.lat, lon: place.lon, r: place.r,
      coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote
    },
    identity: {
      currentName: place.name,
      resolvedIdentity: place.id === 'oscarshall'
        ? 'Oscarshall summer palace and its integrated visitor complex at Oscarshallveien 15'
        : 'One stable museum-site identity combining the retained 1926 Vikingskipshuset and the connected new Vikingtidsmuseet at Huk aveny 35',
      identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: ''
    },
    requiredEvidence: place.id === 'oscarshall'
      ? ['entydig offisielt adressepunkt for Oscarshallveien 15', 'offisiell identitet som eget kongelig lystslott og offentlig kultursted', 'eksplisitt skille fra Bygdø Kongsgård og park som egen duplikatmarkør']
      : ['entydig offisielt adressepunkt for Huk aveny 35', 'dokumentert kontinuitet mellom bevart Vikingskipshus og nytt sammenkoblet museumsanlegg', 'eksplisitt skille mellom fysisk koordinatverifisering og nåværende besøksstatus'],
    evidence: [{
      sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId, sourceQuality: 'official_address_plus_official_institution_identity',
      finding: place.id === 'oscarshall'
        ? 'Geonorge gir ett tydelig adressetreff for Oscarshallveien 15. Det norske kongehus dokumenterer Oscarshall som et eget historisk lystslott og offentlig besøkssted.'
        : 'Geonorge gir ett tydelig adressetreff for Huk aveny 35. Statsbygg dokumenterer at det bevarte Vikingskipshuset og nybygget utgjør ett sammenkoblet Vikingtidsmuseum.',
      canVerifyCoordinate: true, reason: place.coordNote
    }],
    addressCandidates: [{ address: `${place.address.street} ${place.address.number} Oslo`, sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: 'display_marker', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: `Applied ${place.address.street} ${place.address.number} as the canonical display marker for ${place.name}.` },
    notes: [place.coordNote]
  };
  writeJson(evidencePath, evidence);
  addUnique(evidenceManifest.files, evidencePath.replace(/^data\/coordinate-evidence\//, ''));
}

writeJson(manifestPath, manifest);
writeJson(evidenceManifestPath, evidenceManifest);

let protocol = fs.readFileSync(protocolPath, 'utf8');
const osloStart = protocol.indexOf('## Oslo');
const osloEnd = protocol.indexOf('## Vestland – Etne');
if (osloStart < 0 || osloEnd < 0) throw new Error('Could not locate Oslo protocol section.');
const osloSection = protocol.slice(osloStart, osloEnd);
const countMatch = osloSection.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse Oslo documented-place count.');
const oldCount = Number(countMatch[1]);
const batchNumbers = [...osloSection.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const maxBatch = Math.max(...batchNumbers);
const firstBatch = Math.max(maxBatch + 1, 103); // batch 102 is reserved by the active Havnelageret repair.
const secondBatch = firstBatch + 1;

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  `Oslo-tabellen inneholder nå ${oldCount + 2} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${firstBatch}–${secondBatch} legger til Oscarshall og Vikingtidsmuseet med entydige Geonorge-adresseankre etter fullført VisitOSLO Bygdøy-identitets- og scope-audit.`
);

const insertionMarker = 'Relevante korrigerende merger for de første Oslo-batchene:';
const markerIndex = protocol.indexOf(insertionMarker);
if (markerIndex < 0) throw new Error('Could not locate Oslo protocol insertion marker.');
const rowsAndNotes = `| ${firstBatch} | \`oscarshall\` | Oscarshall | verified | \`geonorge-adresser-v1:0301:15443:15\` |\n| ${secondBatch} | \`vikingtidsmuseet\` | Vikingtidsmuseet | verified | \`geonorge-adresser-v1:0301:13153:35\` |\n\nBatch ${firstBatch} (2026-07-21) produserer \`oscarshall\` som eget historisk lystslott og kultursted. Geonorge gir ett entydig adressepunkt for Oscarshallveien 15, mens Det norske kongehus dokumenterer den selvstendige bygnings- og besøksidentiteten. Den romantiske parken beholdes som del av samme besøkskompleks og splittes ikke til en ny overlappende markør fra denne kilden alene.\n\nBatch ${secondBatch} (2026-07-21) produserer \`vikingtidsmuseet\` som én stabil fysisk museumsidentitet for det bevarte Vikingskipshuset fra 1926 og det sammenkoblede nye museumsanlegget på Huk aveny 35. Geonorge-adressepunktet verifiserer stedet, mens bygge- og besøksstatus holdes eksplisitt adskilt fra koordinatstatus; recorden oppretter derfor ikke et konkurrerende separat \`vikingskipshuset\`-sted.\n\n`;
protocol = `${protocol.slice(0, markerIndex)}${rowsAndNotes}${protocol.slice(markerIndex)}`;
fs.writeFileSync(protocolPath, protocol);

writeJson('reports/visitoslo-bygdoy-audit-20260721/production-summary.json', {
  createdAt: '2026-07-21',
  produced: [
    { placeId: 'oscarshall', batch: firstBatch, sourceObjectId: 'geonorge-adresser-v1:0301:15443:15' },
    { placeId: 'vikingtidsmuseet', batch: secondBatch, sourceObjectId: 'geonorge-adresser-v1:0301:13153:35' }
  ],
  deferred: [{ placeId: 'bygdoy_kongsgard', reason: 'Multiple named geometries and POIs require a dedicated physical representation decision; no first-hit proxy accepted.' }],
  protocolCountBefore: oldCount,
  protocolCountAfter: oldCount + 2
});

console.log(JSON.stringify({ ok: true, firstBatch, secondBatch, countBefore: oldCount, countAfter: oldCount + 2, produced: places.map((p) => p.id) }, null, 2));
