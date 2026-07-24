import { readFileSync, writeFileSync } from 'node:fs';

const REPORT='reports/akershus-coordinate-tjernsmyr-wetland-research-post-192/summary.json';
const README='reports/akershus-coordinate-tjernsmyr-wetland-research-post-192/README.md';
const report=JSON.parse(readFileSync(REPORT,'utf8'));
if(report.placeId!=='tjernsmyr_salamanderlokalitet'||report.maxBatch!==192)throw new Error('Unexpected Tjernsmyr research state');

const named=Array.isArray(report.named)?report.named:[];
const exactNamedWetlands=named.filter(o=>o.tags?.name==='Tjernsmyr'&&o.tags?.natural==='wetland'&&o.geometryPointCount>=3);
const namedTransportObjects=named.filter(o=>o.tags?.highway||o.tags?.public_transport||o.tags?.bridge==='yes');
const namedWaterBodies=named.filter(o=>(o.tags?.natural==='water'||o.tags?.water)&&o.geometryPointCount>=3);
if(exactNamedWetlands.length!==1)throw new Error(`Expected one exact named Tjernsmyr wetland, got ${exactNamedWetlands.length}`);
const wetland=exactNamedWetlands[0];
if(wetland.sourceObjectId!=='osm-way:150926471'||wetland.approxAreaM2!==2277||wetland.containsLegacy!==true)throw new Error(`Exact wetland no longer matches locked research result: ${JSON.stringify({id:wetland.sourceObjectId,area:wetland.approxAreaM2,containsLegacy:wetland.containsLegacy})}`);

report.classificationCorrection={
  exactNamedWetlands,
  namedTransportObjects,
  namedWaterBodies,
  explanation:'The first classifier treated every named way with geometry as an area candidate, including Tjernsmyr bridge and bus platforms. Physical semantics must be filtered before deciding. There is exactly one public object with name=Tjernsmyr and natural=wetland: osm-way:150926471.'
};
report.decision='candidate_exact_public_named_wetland:osm-way:150926471';
report.privacyModel='Canonical locator may use the public named wetland polygon only. The nearby public pond Lysakertjern/Tjernsmyrtjern may be retained as habitat context, but no precise salamander capture, trap or individual-observation locations are collected or published.';
writeFileSync(REPORT,`${JSON.stringify(report,null,2)}\n`);
writeFileSync(README,`# Tjernsmyr public wetland geometry research\n\nDate: 2026-07-24\n\n- public OSM objects containing Tjernsmyr in the name: ${named.length}\n- exact public \`name=Tjernsmyr\` + \`natural=wetland\` polygons: ${exactNamedWetlands.length}\n- named transport objects excluded from area classification: ${namedTransportObjects.length}\n- named water-body objects: ${namedWaterBodies.length}\n- exact wetland source: \`${wetland.sourceObjectId}\`\n- exact wetland area: ${wetland.approxAreaM2} m²\n- legacy public area anchor lies inside polygon: ${wetland.containsLegacy}\n\nDecision: **${report.decision}**\n\nThe record belongs in Bærum/Akershus. Production may use the public named wetland polygon as the canonical habitat-area locator. Exact biological observation locations remain out of scope.\n`);
console.log(JSON.stringify({placeId:report.placeId,exactNamedWetland:{sourceObjectId:wetland.sourceObjectId,tags:wetland.tags,center:wetland.center,areaM2:wetland.approxAreaM2,containsLegacy:wetland.containsLegacy},excludedNamedTransportCount:namedTransportObjects.length,namedWaterBodyCount:namedWaterBodies.length,decision:report.decision},null,2));
