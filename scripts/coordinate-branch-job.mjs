import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const PARENT_ID = 'ostensjovannet';
const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder/ostensjovannet.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json');
const reportDir = path.join(ROOT, 'reports/ostensjovannet-parent-anchor-sync-20260723');

const componentSpecs = [
  {
    id: 'ostensjovannet_nord',
    path: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_nord.json',
    expectedSourceObjectId: 'osm-relation:6503853',
    type: 'area_anchor',
    role: 'north_wetland_anchor',
    note: 'Vadedammen er den verifiserte konkrete våtmarksdammen nord for Østensjøvannet.',
  },
  {
    id: 'ostensjovannet_fugletarn',
    path: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_fugletarn.json',
    expectedSourceObjectId: 'osm-way:533351097',
    type: 'building_center',
    role: 'observation_anchor',
    note: 'Fugleskjulet på vestsiden er verifisert som den eneste lokale leisure=bird_hide-geometrien.',
  },
  {
    id: 'ostensjovannet_sor',
    path: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_sor.json',
    expectedSourceObjectId: 'osm-node:1110773258',
    type: 'mouth_anchor',
    role: 'tributary_mouth_anchor',
    note: 'Bølerbekkens utløp er verifisert som en eksplisitt delt bekk–innsjø-grensenode.',
  },
  {
    id: 'bogerudmyra',
    path: 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/bogerudmyra.json',
    expectedSourceObjectId: 'osm-relation:4106652',
    type: 'area_anchor',
    role: 'south_wetland_anchor',
    note: 'Bogerudmyra er verifisert som det konkrete natural=wetland/wetland=marsh-multipolygonet sør for vannet.',
  },
];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

fs.mkdirSync(reportDir, { recursive: true });
const components = componentSpecs.map((spec) => {
  const place = readJson(path.join(ROOT, spec.path));
  if (place.id !== spec.id) throw new Error(`Komponent-id mismatch for ${spec.path}: ${place.id}`);
  if (place.coordStatus !== 'verified_geometry') throw new Error(`${place.id} er ikke verified_geometry`);
  if (place.sourceObjectId !== spec.expectedSourceObjectId) throw new Error(`${place.id} har uventet sourceObjectId ${place.sourceObjectId}`);
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lon)) throw new Error(`${place.id} mangler gyldig lat/lon`);
  return { spec, place };
});

const anchors = components.map(({ spec, place }) => ({
  id: place.id,
  name: place.name,
  lat: place.lat,
  lon: place.lon,
  r: place.r,
  type: spec.type,
  role: spec.role,
  coordStatus: place.coordStatus,
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  sourceUrl: place.coordSourceUrl,
  note: spec.note,
}));

function updateParent(place) {
  if (!place || place.id !== PARENT_ID) throw new Error(`Fant ikke ${PARENT_ID}`);
  if (place.coordStatus !== 'verified_geometry' || place.sourceObjectId !== 'miljodirektoratet-naturvern:VV00000972') {
    throw new Error('Østensjøvannet-parenten har uventet canonical coordinate state');
  }
  return {
    ...place,
    sourceHint: 'Hovedpunktet representerer hele Østensjøvannet naturreservat med Miljødirektoratets offisielle vernegeometri. Delankrene bygges kun fra verifiserte konkrete komponenter: Vadedammen, fugleskjulet på vestsiden, Bølerbekkens utløp og Bogerudmyra. Det generiske sivbelte-recordet står fortsatt needs_source og brukes ikke som kartanker.',
    anchors,
    nature_profile: {
      ...(place.nature_profile || {}),
      nearby_place_ids: ['ostensjovannet_nord', 'ostensjovannet_fugletarn', 'ostensjovannet_sor', 'bogerudmyra'],
    },
  };
}

const aggregate = readJson(aggregatePath);
const oldParent = aggregate.find((place) => place?.id === PARENT_ID);
if (!oldParent) throw new Error(`Mangler ${PARENT_ID} i aggregate`);
const newParent = updateParent(oldParent);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PARENT_ID ? newParent : place));
writeJson(childPath, updateParent(readJson(childPath)));

const manifest = readJson(manifestPath);
manifest.source_sha256 = sha256(aggregatePath);
manifest.generated_at = new Date().toISOString();
const manifestRow = manifest.places?.find((row) => row?.id === PARENT_ID);
if (!manifestRow) throw new Error(`Mangler ${PARENT_ID} i hovedstedsmanifest`);
manifestRow.sha256 = sha256(childPath);
writeJson(manifestPath, manifest);

const oldAnchorIds = (oldParent.anchors || []).map((anchor) => anchor.id);
writeJson(path.join(reportDir, 'result.json'), {
  generatedAt: new Date().toISOString(),
  placeId: PARENT_ID,
  canonicalCoordinateUnchanged: {
    lat: newParent.lat,
    lon: newParent.lon,
    coordStatus: newParent.coordStatus,
    coordType: newParent.coordType,
    coordNote: newParent.coordNote,
    sourceObjectId: newParent.sourceObjectId,
  },
  coordinateMetadataChanged: false,
  beforeAnchorIds: oldAnchorIds,
  afterAnchors: anchors,
  excludedAsAnchor: {
    id: 'ostensjovannet_sivbelte',
    reason: 'Batch 152 research found no explicit mapped reedbed geometry in the bounded Østensjøvannet scope; the record remains needs_source and is not used as a parent anchor.',
  },
  method: 'parent anchor reconciliation from fresh verified component place records; canonical coordinate metadata and evidence unchanged; no copied legacy coordinates, no nearest/first-hit',
});
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Østensjøvannet parent anchor sync\n\nThe parent canonical coordinate and all coordinate metadata remain unchanged on the official Miljødirektoratet reserve geometry anchor VV00000972.\n\nThe stale manual child anchors are replaced by four fresh verified component records:\n- Vadedammen\n- Fugleskjulet ved Østensjøvannet\n- Bølerbekkens utløp i Østensjøvannet\n- Bogerudmyra\n\nThe unresolved generic sivbelte record is intentionally excluded from the anchor list.\n`);

console.log(JSON.stringify({
  status: 'parent_anchor_sync_applied',
  placeId: PARENT_ID,
  anchorCount: anchors.length,
  anchorIds: anchors.map((anchor) => anchor.id),
  canonicalCoordinateChanged: false,
  coordinateMetadataChanged: false,
}, null, 2));
