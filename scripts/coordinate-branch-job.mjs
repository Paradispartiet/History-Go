import { createHash } from 'node:crypto';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194');
const summaryPath = join(reportDir, 'summary.json');
const readmePath = join(reportDir, 'README.md');
const preview1Path = join(reportDir, 'visual-preview-1.jpg');
const preview2Path = join(reportDir, 'visual-preview-2.jpg');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const [summary, preview1, preview2] = await Promise.all([
  JSON.parse(await readFile(summaryPath, 'utf8')),
  readFile(preview1Path),
  readFile(preview2Path),
]);

assert(summary.placeId === 'sigrid_undset_statue', 'Unexpected report placeId.');
assert(summary.coordinateMaxBatch === 194, 'Research report is not post-194.');
assert(summary.exactOsmCandidate?.id === 7596280553, 'Exact OSM candidate changed.');
assert(summary.exactOsmCandidate?.lat === 59.9242367 && summary.exactOsmCandidate?.lon === 10.7294736, 'OSM candidate coordinate changed.');
assert(summary.officialIdentity?.title === 'S. Undset – Styrke', 'Official object identity changed.');
assert(summary.officialIdentity?.material === 'granite', 'Official material is no longer granite.');
assert(summary.officialIdentity?.heightWithoutBaseCm === 282, 'Official height changed.');
assert(summary.materialConflict?.osmTagMaterial === 'bronze', 'Pinned OSM material conflict changed.');
assert(sha256(preview1) === '66c8b2f886b8ec94a609745c78ed2ef7541ce39d5ca534dbc331b98e3ec23338', 'Preview 1 hash changed.');
assert(sha256(preview2) === 'db48ddfc3c9d7ea1b070634ca3de9d80ba6c5c1cb0668b4c21d051993d35a647', 'Preview 2 hash changed.');

const manualReview = {
  version: '2026-07-24',
  placeId: 'sigrid_undset_statue',
  researchType: 'manual_visual_exact_object_rejection',
  exactOsmCandidate: {
    sourceObjectId: 'osm-node:7596280553',
    coordinate: { lat: 59.9242367, lon: 10.7294736 },
    imageLinkCarriedByNode: 'https://photos.app.goo.gl/JrhcnKr6gwFmcEtu5',
    mapillaryKeyCarriedByNode: '227628268720356',
    materialTag: 'bronze',
  },
  authoritativeObject: {
    title: 'S. Undset – Styrke',
    artist: 'Kjersti Wexelsen Goksøyr',
    year: 1991,
    material: 'granite',
    heightWithoutBaseCm: 282,
    location: 'Stensparken',
    sourceUrl: 'https://kjersti-wexelsen-goksoyr.no/portfolio_page/sigrid-undset/',
  },
  reviewedImages: [
    {
      file: 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/visual-preview-1.jpg',
      sha256: sha256(preview1),
      sourceDerivation: 'Loss-reduced preview of the first full-resolution image from the Google Photos album linked directly by OSM node 7596280553.',
    },
    {
      file: 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/visual-preview-2.jpg',
      sha256: sha256(preview2),
      sourceDerivation: 'Loss-reduced preview of the second full-resolution image from the same exact OSM-linked album.',
    },
  ],
  visualObservation: {
    depictedObject: 'A relatively small dark metal female figure in a detailed draped dress, standing on a black polished plinth beside a building and outdoor picnic benches.',
    expectedObject: 'A 282 cm elongated minimalist granite figure on a granite pedestal in Stensparken.',
    decisiveDifferences: [
      'dark metal versus gray granite',
      'detailed draped dress versus elongated minimalist monolithic form',
      'small black polished plinth versus substantial granite pedestal',
      'building courtyard with picnic seating versus open Stensparken setting',
    ],
  },
  decision: {
    candidateMatchesOfficialObject: false,
    rejectCandidate: true,
    canPromoteCoordinate: false,
    reason: 'Both images linked directly from the exact OSM node visibly depict a different artwork. The material tag is not merely inaccurate; the complete form, scale, pedestal and setting are incompatible with the authoritative S. Undset – Styrke object.',
    nextAction: 'Keep the canonical place needs_source. Search for a new exact monument object or an official georeferenced public-art record; do not reuse node 7596280553 or infer a point from its 13.26 m proximity.',
  },
};

await writeFile(join(reportDir, 'manual-visual-review.json'), `${JSON.stringify(manualReview, null, 2)}\n`, 'utf8');

const conciseInscription = {
  version: '2026-07-24',
  placeId: 'sigrid_undset_statue',
  exactOsmNodeId: 7596280553,
  method: 'Tesseract OCR on two full-resolution OSM-linked album images, enhanced copies and lower-image crops with multiple page-segmentation modes',
  inscriptionConfirmed: false,
  partialInscriptionEvidence: false,
  decision: 'ocr_did_not_resolve_identity; subsequent manual visual review decisively rejected the depicted object',
  manualVisualReview: 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/manual-visual-review.json',
};
await writeFile(join(reportDir, 'inscription-crosscheck.json'), `${JSON.stringify(conciseInscription, null, 2)}\n`, 'utf8');

summary.imageAvailableForManualReview = true;
summary.canPromoteAutomatically = false;
summary.canPromote = false;
summary.decision = 'reject_exact_osm_node_visual_mismatch';
summary.inscriptionCrosscheck = {
  report: 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/inscription-crosscheck.json',
  inscriptionConfirmed: false,
  partialInscriptionEvidence: false,
  decision: 'ocr_did_not_resolve_identity',
};
summary.manualVisualReview = {
  report: 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/manual-visual-review.json',
  candidateMatchesOfficialObject: false,
  rejectCandidate: true,
  reviewedPreviewSha256: [sha256(preview1), sha256(preview2)],
};
summary.productionConditions = [];
summary.nextAction = 'Keep needs_source and find a different exact georeferenced monument object. OSM node 7596280553 is permanently rejected for this canonical place.';
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const readme = `# Sigrid Undset exact-object visual crosscheck after batch 194

Date: 2026-07-24

This is a research-only result. No canonical coordinate, evidence state or protocol batch is changed.

## Authoritative identity

The sculptor's official portfolio identifies the Stensparken work as **S. Undset – Styrke** (1991): granite, 282 cm high without the base, purchased by Oslo municipality and installed in Stensparken. Oslo municipality independently identifies the Sigrid Undset sculpture in Stensparken.

## Exact OSM candidate tested

- object: \`osm-node:7596280553\`
- coordinate: \`59.9242367, 10.7294736\`
- distance from legacy marker: \`13.26 m\`
- OSM material tag: \`bronze\`
- direct Google Photos link carried by the node: \`https://photos.app.goo.gl/JrhcnKr6gwFmcEtu5\`
- direct Mapillary key carried by the node: \`227628268720356\`

The album linked by the exact node was fetched. Two independent source photographs were reduced to durable review previews and inspected manually.

## Manual visual decision

Both photographs depict a different artwork: a relatively small dark metal female figure in a detailed draped dress on a black polished plinth, beside a building and picnic benches. The official Sigrid Undset work is a 282 cm elongated minimalist granite figure on a granite pedestal in Stensparken.

The mismatch is decisive across material, form, scale, pedestal and setting. The OSM node is therefore not an imprecisely tagged version of the correct sculpture; it is the wrong physical object.

## Result

\`reject_exact_osm_node_visual_mismatch\`

- node \`7596280553\` is permanently rejected for \`sigrid_undset_statue\`
- proximity to the legacy marker is not accepted as evidence
- the canonical place remains \`needs_source\`
- no batch 195 is allocated to this candidate
- next research must find another exact georeferenced monument object or an official public-art geometry

The two review images and their SHA-256 hashes are recorded in \`manual-visual-review.json\`.
`;
await writeFile(readmePath, readme, 'utf8');

const removeFiles = [
  'google-album-keyword-context.json',
  'ocr-dependency-setup.log',
  'osm-google-photo-1-full.jpg',
  'osm-google-photo-2-full.jpg',
  'osm-google-photo.jpg',
  'photo-1-bottom-enhanced.png',
  'photo-1-bottom-psm11.log',
  'photo-1-bottom-psm12.log',
  'photo-1-bottom-psm6.log',
  'photo-1-enhanced-psm11.log',
  'photo-1-enhanced-psm12.log',
  'photo-1-enhanced-psm6.log',
  'photo-1-enhanced.png',
  'photo-1-full-psm11.log',
  'photo-1-full-psm12.log',
  'photo-1-full-psm6.log',
  'photo-2-bottom-enhanced.png',
  'photo-2-bottom-psm11.log',
  'photo-2-bottom-psm12.log',
  'photo-2-bottom-psm6.log',
  'photo-2-enhanced-psm11.log',
  'photo-2-enhanced-psm12.log',
  'photo-2-enhanced-psm6.log',
  'photo-2-enhanced.png',
  'photo-2-full-psm11.log',
  'photo-2-full-psm12.log',
  'photo-2-full-psm6.log',
  'visual-preview-generation.log',
  'visual-previews-base64.json',
];
for (const file of removeFiles) await rm(join(reportDir, file), { force: true });

const duplicateRunnerDir = join(root, 'reports/coordinate-branch-runner/agent_oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/manual-visual');
await rm(duplicateRunnerDir, { recursive: true, force: true });

console.log(JSON.stringify({
  placeId: 'sigrid_undset_statue',
  exactOsmCandidate: 'osm-node:7596280553',
  decision: 'reject_exact_osm_node_visual_mismatch',
  canPromote: false,
  previewSha256: [sha256(preview1), sha256(preview2)],
  removedIntermediateFiles: removeFiles.length,
  removedDuplicateRunnerCopies: true,
}, null, 2));
