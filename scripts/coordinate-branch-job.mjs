import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

// Sync to latest main before touching shared manifests/protocol, minimizing coordinate-batch races.
execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git', ['fetch', 'origin', 'main'], { stdio: 'inherit' });
execFileSync('git', ['rebase', 'origin/main'], { stdio: 'inherit' });

const id = 'mariakirken_ruin_oslo';
const placeRel = 'places/historie/oslo/places_historie/mariakirken_ruin_oslo.json';
const placePath = `data/${placeRel}`;
const evidenceRel = 'oslo/historie/mariakirken_ruin_oslo.json';
const evidencePath = `data/coordinate-evidence/${evidenceRel}`;
const intakePath = 'reports/visitoslo-oslo-east-audit-20260720/mariakirken-ruin/decision.json';
const intake = JSON.parse(readFileSync(intakePath, 'utf8'));
const c = intake.coordinate;

const rawIndex = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const currentPlaces = Array.isArray(rawIndex) ? rawIndex : rawIndex.places ?? [];
if (currentPlaces.some((place) => place.id === id)) throw new Error(`${id} already exists; abort duplicate production.`);
const identityMatches = currentPlaces.filter((place) => {
  const text = `${place.id ?? ''} ${place.name ?? ''}`.toLowerCase();
  return text.includes('mariakirken') || text.includes('maria_kirken');
});
if (identityMatches.length) throw new Error(`Potential canonical Mariakirken identity already exists: ${identityMatches.map((p) => p.id).join(', ')}`);
if (intake.productionGate !== 'ready_for_canonical_production') throw new Error(`Mariakirken intake gate is not ready: ${intake.productionGate}`);

const place = {
  id,
  name: 'Mariakirken-ruinen',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'historie',
  year: 1050,
  period: 'Middelalder – første kirkefase omtrentlig datert',
  emne_ids: [
    'em_his_tid_periodisering_epoker',
    'em_his_historiske_lag_i_byrom'
  ],
  desc: 'Ruinene etter Mariakirken ved middelalderens kongsgård i Oslo, et konkret spor etter kongemakt, kirkebygging og den sørlige maktkjernen i middelalderbyen.',
  popupDesc: 'Mariakirken lå ved kongsgården i den sørlige delen av middelalderens Oslo. Riksantikvaren registrerer den konkrete ruinlokaliteten som «Mariakirken kirkested», Kulturminne-ID 42178. Den første kirken på stedet knyttes til midten av 1000-tallet; senere kom en romansk steinkirke, og anlegget ble bygd videre ut omkring 1300. Kirken fikk en særlig rolle som kongsgårdskirke, kongelig kapell og gravkirke.\n\nI dagens bylandskap ligger ruinene inne i det større området Middelalderparken, men History Go modellerer Mariakirken som et eget fysisk kulturminne. Den skal derfor ikke slås sammen med områdeankeret `middelalder_oslo`, og den er heller ikke samme ruin som `hallvardskirken_oslo`. År 1050 i recorden er et omtrentlig representasjonspunkt for den første kirkefasen, ikke en eksakt dokumentert innvielsesdato.',
  quiz_profile: {
    place_type: 'kirkeruin',
    subtype: 'middelaldersk_kongsgardskirke_og_kongelig_gravkirke',
    signature_features: [
      'Riksantikvarens lokalitet 42178 Mariakirken kirkested',
      'ruin ved middelalderens kongsgård i Oslo',
      'første kirkefase knyttet til midten av 1000-tallet',
      'senere romansk steinkirke og utbygging omkring 1300',
      'kongsgårdskirke, kongelig kapell og gravkirke'
    ],
    primary_angles: [
      'middelalderhistorie',
      'kongemakt_og_kirke',
      'arkeologiske_spor',
      'byggefaser',
      'historiske_lag_i_byrom'
    ],
    question_families: [
      'gjenkjenning',
      'historisk_endring',
      'byggefaser',
      'institusjon_og_makt',
      'kontrast'
    ],
    avoid_angles: [
      'presentere_1050_som_eksakt_innvielsesar',
      'forveksle_med_hallvardskirken',
      'forveksle_ruinen_med_hele_middelalderparken',
      'generisk_middelalderkirke_uten_stedlig_kilde'
    ],
    must_include: [
      'forholdet til middelalderens kongsgård',
      'de ulike kirkefasene',
      'rollen som kongelig kapell og gravkirke',
      'at ruinen er en egen fysisk identitet inne i Middelalderparken'
    ],
    contrast_targets: [
      'hallvardskirken_oslo',
      'middelalder_oslo'
    ],
    notes: 'Eksterne middelalder- og arkeologikilder skal dominere synlig quizinnhold. År 1050 brukes som omtrentlig representasjon for den tidligste kirkefasen, ikke som et eksakt faktaspørsmål.'
  },
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId: c.sourceObjectId,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: intake.source.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: '2026-07-20',
  coordNote: c.coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Riksantikvaren – Mariakirken kirkested 42178',
      url: intake.source.sourceUrl,
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'source',
      label: 'Kulturminnesøk – lokalitet 42178',
      url: intake.identity.linkKulturminnesok,
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'official',
      label: 'Oslo kommune – Middelalderparken',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/middelalderparken',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    }
  ]
};
mkdirSync(dirname(placePath), { recursive: true });
writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);

const evidence = {
  placeId: id,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Riksantikvaren feature 42178, Mariakirken kirkested in medieval Oslo, the concrete church-ruin locality itself',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'poi',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'direkte offisielt objektoppslag for Riksantikvaren feature 42178',
    'Oslo kommune 0301 og Mariakirken/kongsgård-identitet',
    'eksplisitt skille fra middelalder_oslo og hallvardskirken_oslo'
  ],
  evidence: [
    {
      sourceProvider: 'official_heritage_registry',
      sourceName: intake.source.sourceName,
      sourceUrl: intake.source.sourceUrl,
      sourceObjectId: c.sourceObjectId,
      sourceQuality: 'official_heritage_object_geometry',
      finding: 'Direkte Riksantikvaren-oppslag gir feature 42178, Mariakirken kirkested i Oslo, med offisiell MultiPolygon-geometri og Kulturminnesøk-lokalitet 42178.',
      canVerifyCoordinate: true,
      reason: c.coordNote
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_heritage_registry',
      sourceObjectId: c.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [
    {
      sourceProvider: 'official_heritage_registry',
      sourceObjectId: 'riksantikvaren-feature:42178',
      geometryType: intake.identity.geometryType,
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied the geometric center of official Riksantikvaren feature 42178 as the site representation point for Mariakirken ruin.'
  },
  notes: [place.coordNote]
};
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

for (const [manifestPath, entry] of [['data/places/manifest.json', placeRel], ['data/coordinate-evidence/manifest.json', evidenceRel]]) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.files)) throw new Error(`${manifestPath} has no files array.`);
  if (manifest.files.includes(entry)) throw new Error(`${manifestPath} already contains ${entry}.`);
  manifest.files.push(entry);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = readFileSync(protocolPath, 'utf8');
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse Oslo verified-place count.');
const oldCount = Number(countMatch[1]);
const newCount = oldCount + 1;
const anchor = 'Relevante korrigerende merger for de første Oslo-batchene:';
const anchorIndex = protocol.indexOf(anchor);
if (anchorIndex < 0) throw new Error('Could not find Oslo coordinate table end anchor.');
const osloRegion = protocol.slice(0, anchorIndex);
const osloRows = [...osloRegion.matchAll(/^\|\s*(\d+)\s*\|.*$/gm)];
if (!osloRows.length) throw new Error('No Oslo coordinate table rows found.');
const nextBatch = Math.max(...osloRows.map((m) => Number(m[1]))) + 1;
const last = osloRows.at(-1);
const insertAt = last.index + last[0].length;
const row = `| ${nextBatch} | \`${id}\` | Mariakirken-ruinen | verified_geometry | \`kulturminnesok:42178\` |`;
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/, `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} produserer Mariakirken-ruinen som egen fysisk middelalderlokalitet med Riksantikvarens offisielle geometri, separat fra det brede \`middelalder_oslo\`-ankeret og den separate \`hallvardskirken_oslo\`-ruinen. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 29.`);
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`${id}\` som den konkrete Mariakirken-ruinen ved middelalderens kongsgård i Oslo. Koordinaten er geometrisenteret for Riksantikvarens offisielle MultiPolygon-feature \`42178\`, kryssjekket mot feature-feltets eget senterpunkt med avrundet 0 meters avvik. Stedet holdes separat fra \`middelalder_oslo\`, som representerer det bredere historiske området, og fra \`hallvardskirken_oslo\`, som er en annen kirkeruin. År 1050 brukes som omtrentlig representasjon for den første kirkefasen, ikke som en eksakt innvielsesdato.\n`;
writeFileSync(protocolPath, protocol);

console.log(`Produced ${id} as Oslo coordinate batch ${nextBatch}; verified Oslo count ${oldCount} -> ${newCount}.`);
rmSync(new URL(import.meta.url));
