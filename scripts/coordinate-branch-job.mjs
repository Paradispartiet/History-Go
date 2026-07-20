import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RELATION_ID = 1459739;
const API = `https://api.openstreetmap.org/api/0.6/relation/${RELATION_ID}/full.json`;
const DIAGNOSTIC = 'reports/oslo-coordinate-control-batch-93/relation-member-diagnostic.json';
const connectivity = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/oslo-coordinate-control-batch-93/relation-connectivity-diagnostic.json'), 'utf8'));

const response = await fetch(API, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`OSM API failed: ${response.status}`);
const data = await response.json();
const elements = data.elements || [];
const relation = elements.find((e) => e.type === 'relation' && e.id === RELATION_ID);
if (!relation) throw new Error('Relation missing');
const wayMap = new Map(elements.filter((e) => e.type === 'way').map((way) => [way.id, way]));
const componentByWay = new Map();
for (const component of connectivity.components || []) {
  for (const wayId of component.wayIds || []) componentByWay.set(wayId, component.index);
}
const members = (relation.members || [])
  .filter((member) => member.type === 'way')
  .map((member, order) => {
    const way = wayMap.get(member.ref);
    return {
      order,
      ref: member.ref,
      role: member.role || '',
      component: componentByWay.get(member.ref) ?? null,
      tags: way?.tags || {},
      firstNode: way?.nodes?.[0] ?? null,
      lastNode: way?.nodes?.[way.nodes.length - 1] ?? null,
      nodeCount: way?.nodes?.length ?? 0
    };
  });
const result = {
  relationId: RELATION_ID,
  relationTags: relation.tags,
  members
};
fs.mkdirSync(path.dirname(path.join(ROOT, DIAGNOSTIC)), { recursive: true });
fs.writeFileSync(path.join(ROOT, DIAGNOSTIC), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
