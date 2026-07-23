import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const inputPath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-155-alna-bryn-research/candidate-summary.json');
const outputPath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-155-alna-bryn-research/compact-topology.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const compactWay = (way) => ({
  osmId: way.osmId,
  tags: way.tags,
  lengthM: way.lengthM,
  firstPoint: way.firstPoint,
  lastPoint: way.lastPoint,
  boundingbox: way.boundingbox,
});

const compact = {
  generatedAt: new Date().toISOString(),
  placeId: data.placeId,
  proposedResolvedIdentity: data.proposedResolvedIdentity,
  bbox: data.bbox,
  upstreamReferenceWay: data.upstreamReferenceWay,
  downstreamReferenceWay: data.downstreamReferenceWay,
  references: {
    upstream: data.riverWays.find((way) => way.osmId === data.upstreamReferenceWay) ? compactWay(data.riverWays.find((way) => way.osmId === data.upstreamReferenceWay)) : null,
    downstream: data.riverWays.find((way) => way.osmId === data.downstreamReferenceWay) ? compactWay(data.riverWays.find((way) => way.osmId === data.downstreamReferenceWay)) : null,
  },
  localRiverWays: (data.localRiverWays || []).map(compactWay),
  namedBrynObjects: (data.namedBrynObjects || []).map((object) => ({
    osmType: object.osmType,
    osmId: object.osmId,
    tags: object.tags,
    lat: object.lat,
    lon: object.lon,
    geometryPointCount: object.geometryPointCount,
  })),
  topology: data.topology || [],
  sourceContext: data.sourceContext,
  nextAction: data.nextAction,
};

fs.writeFileSync(outputPath, `${JSON.stringify(compact, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'compact_topology_written',
  localRiverWayCount: compact.localRiverWays.length,
  namedBrynObjectCount: compact.namedBrynObjects.length,
  topologyRowCount: compact.topology.length,
  report: path.relative(ROOT, outputPath),
}, null, 2));
