import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien-research');
const inputPath = path.join(REPORT_DIR, 'crossing-order-followup.json');
const outputPath = path.join(REPORT_DIR, 'resolved-crossing-brackets.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const crossings = data.crossings || [];
const grunerCandidates = crossings.filter((crossing) =>
  crossing.connectedNames?.includes('grünerbrua') || crossing.bridgeTags?.name === 'Nordre gate'
);
const blaCandidates = crossings.filter((crossing) => crossing.connectedToExactIngensWay === true);
const elvebakkenCandidates = crossings.filter((crossing) => crossing.connectedNames?.includes('elvebakken bru'));

if (grunerCandidates.length !== 3) {
  throw new Error(`Forventet tre separate Grünerbrua carriageway/sidewalk crossing ways, fant ${grunerCandidates.length}`);
}
if (blaCandidates.length !== 1) throw new Error(`Forventet én Blå/Ingens gate-kryssing, fant ${blaCandidates.length}`);
if (elvebakkenCandidates.length !== 1) throw new Error(`Forventet én Elvebakken bru-kryssing, fant ${elvebakkenCandidates.length}`);

const grunerRoad = grunerCandidates.find((crossing) => crossing.bridgeWayId === 4826556);
const blaBridge = blaCandidates[0];
const elvebakkenBridge = elvebakkenCandidates[0];
if (!grunerRoad) throw new Error('Mangler hovedway 4826556 for Grünerbrua/Nordre gate');

const ascending = grunerRoad.riverMeasureM < blaBridge.riverMeasureM && blaBridge.riverMeasureM < elvebakkenBridge.riverMeasureM;
const descending = elvebakkenBridge.riverMeasureM < blaBridge.riverMeasureM && blaBridge.riverMeasureM < grunerRoad.riverMeasureM;
if (!ascending && !descending) {
  throw new Error(`Offisiell kryssingsrekkefølge matcher ikke river measures: Grüner=${grunerRoad.riverMeasureM}, Blå=${blaBridge.riverMeasureM}, Elvebakken=${elvebakkenBridge.riverMeasureM}`);
}

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'elvestrekning_bla_brenneriveien',
  riverWayId: data.riverWay.osmId,
  officialOrderReproduced: true,
  riverDirectionInReport: ascending ? 'Grünerbrua -> Blå/Ingens gate -> Elvebakken bru' : 'Elvebakken bru -> Blå/Ingens gate -> Grünerbrua',
  upperBracket: {
    identity: 'Grünerbrua',
    crossingWayId: grunerRoad.bridgeWayId,
    associatedBridgeObjectIds: [...new Set(grunerRoad.endpointContext.flatMap((endpoint) => endpoint.connectedWays.filter((way) => way.name === 'Grünerbrua').map((way) => way.id)))],
    crossingPoint: grunerRoad.crossingPoint,
    riverMeasureM: grunerRoad.riverMeasureM,
  },
  centerCrossing: {
    identity: 'Gangbro ved Blå / Ingens gate',
    crossingWayId: blaBridge.bridgeWayId,
    exactIngensWayIds: data.exactIngensWayIds,
    associatedBridgeObjectIds: [...new Set(blaBridge.endpointContext.flatMap((endpoint) => endpoint.connectedWays.filter((way) => way.tags?.man_made === 'bridge').map((way) => way.id)))],
    crossingPoint: blaBridge.crossingPoint,
    riverMeasureM: blaBridge.riverMeasureM,
    distanceToVerifiedBlaNodeM: blaBridge.distanceToBlaM,
  },
  lowerBracket: {
    identity: 'Elvebakken bru / gangbro Nedre gate–Elvebakken',
    crossingWayId: elvebakkenBridge.bridgeWayId,
    associatedBridgeObjectIds: [...new Set(elvebakkenBridge.endpointContext.flatMap((endpoint) => endpoint.connectedWays.filter((way) => way.name === 'Elvebakken bru').map((way) => way.id)))],
    crossingPoint: elvebakkenBridge.crossingPoint,
    riverMeasureM: elvebakkenBridge.riverMeasureM,
  },
  clippedRiverMeasureRangeM: [Math.min(grunerRoad.riverMeasureM, elvebakkenBridge.riverMeasureM), Math.max(grunerRoad.riverMeasureM, elvebakkenBridge.riverMeasureM)],
  clippedApproxLengthM: Number(Math.abs(elvebakkenBridge.riverMeasureM - grunerRoad.riverMeasureM).toFixed(1)),
  selectionRule: 'Production must clip fresh Akerselva way 80915045 between the exact Grünerbrua/Nordre gate and Elvebakken bru crossing points and verify that the exact Ingens gate/Blå bridge crossing lies strictly inside the clipped interval. Blå distance is scope crosscheck only.',
};
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'brackets_resolved',
  officialOrderReproduced: true,
  upperBridgeWayId: result.upperBracket.crossingWayId,
  centerBridgeWayId: result.centerCrossing.crossingWayId,
  lowerBridgeWayId: result.lowerBracket.crossingWayId,
  clippedApproxLengthM: result.clippedApproxLengthM,
  report: path.relative(ROOT, outputPath),
}, null, 2));
