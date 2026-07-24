import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const evidencePath = join(root, 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json');
const protocolPath = join(root, 'docs/coordinates/coordinate-control-protocol.md');
const emuseumPath = join(root, 'reports/oslo-coordinate-sigrid-undset-emuseum-research-post-194/detail-followup.json');
const osmPath = join(root, 'reports/oslo-coordinate-sigrid-undset-emuseum-research-post-194/osm-node-7596280553.json');
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-rejection-post-194');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const protocol = await readFile(protocolPath, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(batches.length > 0, 'No coordinate batches found in protocol.');
assert(Math.max(...batches) === 194, `Expected coordinate max batch 194, got ${Math.max(...batches)}.`);

const evidence = JSON.parse(await readFile(evidencePath, 'utf8'));
assert(evidence.placeId === 'sigrid_undset_statue', 'Unexpected evidence place.');
assert(evidence.evidenceStatus === 'needs_research', 'Sigrid evidence no longer needs research.');
assert(evidence.coordinateDecision === 'needs_geometry', 'Sigrid coordinate decision changed.');
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', 'Sigrid coordinate is no longer unresolved.');
assert(evidence.currentCoordinate?.lat === 59.9242 && evidence.currentCoordinate?.lon === 10.7297, 'Legacy coordinate changed unexpectedly.');

const emuseum = JSON.parse(await readFile(emuseumPath, 'utf8'));
const exactCard = emuseum.exactCard;
assert(exactCard?.emuseumId === '168573', 'Official eMuseum record changed.');
assert(exactCard?.internalObjectId === '2339', 'Official eMuseum internal object changed.');
assert(exactCard?.title === 'Sigrid Undset (1882-1949)', 'Official eMuseum title changed.');
assert(exactCard?.artist === 'Kjersti Wexelsen Goksøyr', 'Official eMuseum artist changed.');
assert(emuseum.modalDetail?.coordinateSignals?.length === 0, 'Official eMuseum record now exposes coordinates; visual rejection report must be revisited.');

const osm = JSON.parse(await readFile(osmPath, 'utf8'));
assert(Array.isArray(osm.elements) && osm.elements.length === 1, 'Unexpected OSM capture shape.');
const node = osm.elements[0];
assert(node.type === 'node' && node.id === 7596280553, 'Unexpected OSM candidate.');
assert(node.lat === 59.9242367 && node.lon === 10.7294736, 'Pinned OSM candidate coordinate changed.');
assert(node.tags?.image === 'https://photos.app.goo.gl/JrhcnKr6gwFmcEtu5', 'Pinned OSM image link changed.');
assert(node.tags?.material === 'bronze', 'Pinned OSM material tag changed.');

const manualVisualReview = {
  reviewDate: '2026-07-24',
  method: 'Manual visual comparison of the two full-resolution Google Photos images linked directly from exact OSM node 7596280553 against documented photographs and the artist description of the official Sigrid Undset monument.',
  osmLinkedImageProvenance: {
    albumUrl: node.tags.image,
    mapillaryId: node.tags.mapillary,
    pinnedThumbnailSha256: 'bc1dc83cce6a039eb1012cc69058ba09076707f1e603f36ba1326d326f4f1d6f',
    fullImageUrls: [
      'https://lh3.googleusercontent.com/pw/AP1GczNDF0E9ymKgGhGPA03pe7QSHTCMqIVN855JOxV6pyWK-nysuZ_3J2yazhWk6aw_rqKcVnsVFBxi0Isd1TJBTB1Oxvz7ErUuLggiBY3yWpafVgQ2l8Ng=w1800-h1400-no',
      'https://lh3.googleusercontent.com/pw/AP1GczME26lM6pCznkAUWlquN39pDTnXQnP6O7JErZ77Hm-aMEZhqU0Wq6ExIDHDLGKVapRipcVjxzwrGI0EW17kCaSKIFWyZHraESItTYkovp_Kdec-8gBB=w1800-h1400-no'
    ],
    researchPr: 3609,
    previewPr: 3615
  },
  observedCandidateFeatures: [
    'Dark naturalistic standing human figure with separately modelled clothing and hair.',
    'Small black rectangular plinth.',
    'Installed immediately beside a stone building and yellow/orange benches.'
  ],
  documentedOfficialWorkFeatures: [
    'Elongated, highly simplified standing figure.',
    'Smooth grey granite body and light granite pedestal.',
    'Pedestal inscription identifies Sigrid Undset and her life dates.',
    'Installed as a freestanding monument in the open landscape of Stensparken.'
  ],
  officialReferenceSources: [
    'https://kjersti-wexelsen-goksoyr.no/portfolio_page/sigrid-undset/',
    'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/',
    'https://okk.kunstsamlingen.no/search/2339?modal=true'
  ],
  verdict: 'visual_identity_mismatch',
  conclusion: 'The exact OSM node-linked images depict a different sculpture. OSM node 7596280553 must not be used as the canonical Sigrid Undset anchor, regardless of its 13.26 metre proximity to the legacy marker.'
};

const report = {
  version: '2026-07-24',
  placeId: 'sigrid_undset_statue',
  coordinateMaxBatch: 194,
  officialIdentity: {
    sourceProvider: 'Oslo kommunes kunstsamling',
    emuseumId: exactCard.emuseumId,
    internalObjectId: exactCard.internalObjectId,
    title: exactCard.title,
    artist: exactCard.artist,
    year: exactCard.year,
    exactCoordinateAvailable: false
  },
  rejectedCandidate: {
    sourceProvider: 'openstreetmap',
    sourceObjectId: 'osm-node:7596280553',
    lat: node.lat,
    lon: node.lon,
    tags: node.tags,
    manualVisualReview
  },
  coordinateChanged: false,
  decision: 'reject_osm_node_keep_needs_source',
  nextAction: 'Find an independent exact monument anchor or authoritative coordinate. Do not retry OSM node 7596280553.'
};

const rejectionEntry = {
  sourceProvider: 'manual_research',
  sourceName: 'Exact OSM node 7596280553 – linked-image visual rejection',
  sourceUrl: 'https://www.openstreetmap.org/node/7596280553',
  sourceObjectId: 'osm-node:7596280553',
  sourceQuality: 'exact_candidate_visual_rejection',
  finding: 'The two images linked directly from the exact OSM node show a dark naturalistic figure on a black plinth beside a stone building and benches. This does not match Kjersti Wexelsen Goksøyrs elongated grey-granite Sigrid Undset monument on a light inscribed pedestal.',
  canVerifyCoordinate: false,
  reason: 'Visual identity mismatch. The OSM node represents another sculpture and is explicitly rejected as a canonical anchor.'
};

evidence.evidence = [
  ...evidence.evidence.filter((entry) => entry.sourceObjectId !== rejectionEntry.sourceObjectId),
  rejectionEntry
];

evidence.sourceObjectCandidates = [
  ...evidence.sourceObjectCandidates.filter((entry) => entry.sourceObjectId !== 'osm-node:7596280553'),
  {
    sourceProvider: 'openstreetmap',
    sourceObjectId: 'osm-node:7596280553',
    canApplyToPlace: false
  }
];

evidence.decision = {
  canBecomeVerified: false,
  blockedReason: 'Official sources resolve the Sigrid Undset monument identity but expose no exact coordinate. The closest exact OSM artwork candidate, node 7596280553, is now visually rejected because its directly linked images show a different sculpture. No verified canonical anchor remains.',
  nextAction: 'Find an independent exact monument anchor or authoritative coordinate. Do not retry OSM node 7596280553.'
};

const rejectionNote = 'Post-194 visual control explicitly rejects OSM node 7596280553: its directly linked images depict another sculpture. The legacy marker remains needs_source.';
evidence.notes = [...evidence.notes.filter((note) => !note.includes('7596280553')), rejectionNote];

await mkdir(reportDir, { recursive: true });
await writeFile(join(reportDir, 'summary.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(join(reportDir, 'README.md'), `# Sigrid Undset exact-candidate visual rejection after batch 194\n\nThe official object identity is resolved through Oslo kommunes kunstsamling, but no official coordinate is exposed.\n\nThe exact nearby OSM candidate \`osm-node:7596280553\` was inspected through the two Google Photos images linked directly on that node. Both images show a dark naturalistic figure on a black plinth beside a stone building and benches. The documented Sigrid Undset monument is an elongated grey-granite figure on a light inscribed pedestal in the open park.\n\n## Decision\n\n- candidate verdict: \`visual_identity_mismatch\`\n- coordinate change: **none**\n- canonical state: remains \`needs_source\`\n- forbidden retry: \`osm-node:7596280553\`\n\nThe complete source chain and visual observations are stored in \`summary.json\`.\n`, 'utf8');
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  placeId: evidence.placeId,
  coordinateMaxBatch: Math.max(...batches),
  rejectedSourceObjectId: rejectionEntry.sourceObjectId,
  coordinateChanged: false,
  decision: report.decision
}, null, 2));
