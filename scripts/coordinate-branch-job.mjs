import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '1199cf801cb02b4a2e8a412254f67a06f3ebe0a6';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/korketrekkeren-relation-graph-v2.mjs';

const source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });

const oldGraphBlock = `const endpointToWays = new Map();
for (const way of memberWays) {
  for (const nodeId of [way.nodes[0], way.nodes[way.nodes.length - 1]]) {
    if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
    endpointToWays.get(nodeId).push(way.id);
  }
}

const visited = new Set();
const stack = [memberWays[0].id];
while (stack.length) {
  const wayId = stack.pop();
  if (visited.has(wayId)) continue;
  visited.add(wayId);
  const way = wayMap.get(wayId);
  for (const nodeId of [way.nodes[0], way.nodes[way.nodes.length - 1]]) {
    for (const neighbor of endpointToWays.get(nodeId) || []) if (!visited.has(neighbor)) stack.push(neighbor);
  }
}
if (visited.size !== memberWays.length) {
  throw new Error(\`Relation \${RELATION_ID} member ways are not one connected route graph (\${visited.size}/\${memberWays.length} connected)\`);
}

const routeEndpointIds = [...endpointToWays.entries()].filter(([, ways]) => ways.length === 1).map(([nodeId]) => nodeId);`;

const newGraphBlock = `const nodeToWays = new Map();
const routeNodeDegree = new Map();
const uniqueRouteEdges = new Map();
for (const way of memberWays) {
  for (const nodeId of new Set(way.nodes)) {
    if (!nodeToWays.has(nodeId)) nodeToWays.set(nodeId, []);
    nodeToWays.get(nodeId).push(way.id);
  }
  for (let i = 1; i < way.nodes.length; i += 1) {
    const aId = way.nodes[i - 1];
    const bId = way.nodes[i];
    const edgeKey = aId < bId ? \`\${aId}:\${bId}\` : \`\${bId}:\${aId}\`;
    if (uniqueRouteEdges.has(edgeKey)) continue;
    const a = nodeMap.get(aId);
    const b = nodeMap.get(bId);
    if (!a || !b) throw new Error(\`Missing node geometry for route edge \${edgeKey}\`);
    uniqueRouteEdges.set(edgeKey, haversineMeters(a, b));
    routeNodeDegree.set(aId, (routeNodeDegree.get(aId) || 0) + 1);
    routeNodeDegree.set(bId, (routeNodeDegree.get(bId) || 0) + 1);
  }
}

const visited = new Set();
const stack = [memberWays[0].id];
while (stack.length) {
  const wayId = stack.pop();
  if (visited.has(wayId)) continue;
  visited.add(wayId);
  const way = wayMap.get(wayId);
  for (const nodeId of new Set(way.nodes)) {
    for (const neighbor of nodeToWays.get(nodeId) || []) if (!visited.has(neighbor)) stack.push(neighbor);
  }
}
if (visited.size !== memberWays.length) {
  throw new Error(\`Relation \${RELATION_ID} member ways are not one connected route graph (\${visited.size}/\${memberWays.length} connected via shared nodes)\`);
}

const routeEndpointIds = [...routeNodeDegree.entries()].filter(([, degree]) => degree === 1).map(([nodeId]) => nodeId);`;

if (!source.includes(oldGraphBlock)) throw new Error('Could not locate the v1 relation graph block');
let patched = source.replace(oldGraphBlock, newGraphBlock);
const oldLengthLine = `const totalLengthMeters = memberWays.reduce((sum, way) => sum + wayLength(way, nodeMap), 0);`;
const newLengthLine = `const totalLengthMeters = [...uniqueRouteEdges.values()].reduce((sum, length) => sum + length, 0);`;
if (!patched.includes(oldLengthLine)) throw new Error('Could not locate the v1 relation length calculation');
patched = patched.replace(oldLengthLine, newLengthLine);
fs.writeFileSync(TEMP_SCRIPT, patched);
await import(pathToFileURL(TEMP_SCRIPT).href);
