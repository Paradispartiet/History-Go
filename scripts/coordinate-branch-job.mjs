import { readFileSync, writeFileSync } from 'node:fs';

const REPORT='reports/oslo-coordinate-regjeringskvartalet-area-research-post-192/summary.json';
const README='reports/oslo-coordinate-regjeringskvartalet-area-research-post-192/README.md';
const STATS='https://www.statsbygg.no/byggeprosjekter/nytt-regjeringskvartal/';
const report=JSON.parse(readFileSync(REPORT,'utf8'));
if(report.placeId!=='regjeringskvartalet'||report.maxBatch!==192)throw new Error('Unexpected Regjeringskvartalet research state');
const candidate=(report.exactNamedAreas||[]).find(x=>x.sourceObjectId==='osm-way:125480528');
if(!candidate)throw new Error('Expected named OSM construction-area candidate missing');
if(candidate.tags?.landuse!=='construction'||candidate.tags?.check_date!=='2021-05-28')throw new Error(`Candidate semantics changed; re-evaluate instead of applying stale guard: ${JSON.stringify(candidate.tags)}`);

const response=await fetch(STATS,{headers:{'user-agent':'History-Go coordinate research/1.0'}});
const html=await response.text();
if(!response.ok)throw new Error(`Statsbygg page HTTP ${response.status}`);
const anchors=[];
const re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
for(const match of html.matchAll(re)){
  const text=match[2].replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  if(/reguleringsplan|plankart|nivå\s*2|niva\s*2/i.test(text)){
    let href=match[1];
    if(href.startsWith('/'))href=new URL(href,STATS).href;
    anchors.push({text,href});
  }
}
const unique=[...new Map(anchors.map(x=>[`${x.text}|${x.href}`,x])).values()];
writeFileSync('reports/oslo-coordinate-regjeringskvartalet-area-research-post-192/statsbygg-plan-links.json',`${JSON.stringify({version:'2026-07-24',source:STATS,links:unique},null,2)}\n`);

const currentPlanLinks=unique.filter(x=>/nivå\s*2|niva\s*2/i.test(x.text));
report.currentPlanCrosscheck={
  source:STATS,
  statsbyggPlanLinkCount:unique.length,
  level2PlanLinks:currentPlanLinks,
  osmCandidate:{sourceObjectId:candidate.sourceObjectId,tags:candidate.tags,approxAreaM2:candidate.approxAreaM2,center:candidate.center},
  conclusion:'The exact named OSM polygon is not production-ready as the canonical institutional area because it remains tagged landuse=construction with check_date=2021-05-28, while Statsbygg documents later plan changes. Crosscheck against the current adopted level-2 plan boundary before any coordinate promotion.'
};
report.decision='candidate_geometry_requires_current_plan_crosscheck:osm-way:125480528';
report.notes=[...(report.notes||[]),'The earlier automatic candidate decision is superseded: exact name alone is insufficient because the OSM area is explicitly stale construction semantics.'];
writeFileSync(REPORT,`${JSON.stringify(report,null,2)}\n`);
writeFileSync(README,`# Regjeringskvartalet combined-area research\n\nDate: 2026-07-24\n\n- exact named OSM objects: ${report.exactNamed?.length||0}\n- exact named OSM areas: ${report.exactNamedAreas?.length||0}\n- government-area candidates: ${report.governmentAreas?.length||0}\n- named Nominatim hits: ${report.namedNominatim?.length||0}\n- named Nominatim polygons: ${report.polygonNominatim?.length||0}\n- current Statsbygg plan-related links found: ${unique.length}\n- level-2 plan links found: ${currentPlanLinks.length}\n\nThe only exact named OSM area is \`osm-way:125480528\`, but it is still tagged \`landuse=construction\` with \`check_date=2021-05-28\`. It is therefore **not** accepted as current institutional-area geometry.\n\nDecision: **${report.decision}**\n\nNo canonical coordinate changed. The next pass must reconcile the candidate geometry with the current adopted Statsbygg level-2 regulation-plan boundary.\n`);
console.log(JSON.stringify({placeId:report.placeId,osmCandidate:{sourceObjectId:candidate.sourceObjectId,tags:candidate.tags,area:candidate.approxAreaM2},statsbyggPlanLinkCount:unique.length,level2PlanLinks:currentPlanLinks,decision:report.decision},null,2));
