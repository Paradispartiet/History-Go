import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const CENTER={lat:59.9156,lon:10.7451};
const OUT='reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193';
const ENDPOINT='https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const TYPE='ms:Omraadeplan';
const FORMAT='application/json; subtype=geojson; charset=ISO-8859-1';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'History-Go coordinate research/1.0'}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}: ${t.slice(0,800)}`);return{url,contentType:r.headers.get('content-type'),text:t};}
function flattenCoords(geometry){const out=[];const visit=v=>{if(!Array.isArray(v))return;if(v.length>=2&&typeof v[0]==='number'&&typeof v[1]==='number'){out.push(v);return;}v.forEach(visit);};visit(geometry?.coordinates);return out;}
function bboxOf(geometry){const p=flattenCoords(geometry);if(!p.length)return null;return{minX:Math.min(...p.map(x=>x[0])),minY:Math.min(...p.map(x=>x[1])),maxX:Math.max(...p.map(x=>x[0])),maxY:Math.max(...p.map(x=>x[1]))};}
function bboxContains(b,x,y){return !!b&&x>=b.minX&&x<=b.maxX&&y>=b.minY&&y<=b.maxY;}
function pointInRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];const hit=((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/((yj-yi)||1e-12)+xi);if(hit)inside=!inside;}return inside;}
function pointInGeometry(x,y,geometry){if(!geometry)return false;if(geometry.type==='Polygon'){const [outer,...holes]=geometry.coordinates||[];return !!outer&&pointInRing(x,y,outer)&&!holes.some(r=>pointInRing(x,y,r));}if(geometry.type==='MultiPolygon')return (geometry.coordinates||[]).some(poly=>{const [outer,...holes]=poly;return !!outer&&pointInRing(x,y,outer)&&!holes.some(r=>pointInRing(x,y,r));});return false;}
function wgs84ToUtm32(lat,lon){
  const a=6378137.0,eccSquared=0.00669437999014,k0=0.9996,lonOrigin=9;
  const latRad=lat*Math.PI/180,lonRad=lon*Math.PI/180,lonOriginRad=lonOrigin*Math.PI/180;
  const eccPrimeSquared=eccSquared/(1-eccSquared);
  const N=a/Math.sqrt(1-eccSquared*Math.sin(latRad)**2);
  const T=Math.tan(latRad)**2;
  const C=eccPrimeSquared*Math.cos(latRad)**2;
  const A=Math.cos(latRad)*(lonRad-lonOriginRad);
  const M=a*((1-eccSquared/4-3*eccSquared**2/64-5*eccSquared**3/256)*latRad-(3*eccSquared/8+3*eccSquared**2/32+45*eccSquared**3/1024)*Math.sin(2*latRad)+(15*eccSquared**2/256+45*eccSquared**3/1024)*Math.sin(4*latRad)-(35*eccSquared**3/3072)*Math.sin(6*latRad));
  const easting=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T**2+72*C-58*eccPrimeSquared)*A**5/120)+500000;
  let northing=k0*(M+N*Math.tan(latRad)*(A**2/2+(5-T+9*C+4*C**2)*A**4/24+(61-58*T+T**2+600*C-330*eccPrimeSquared)*A**6/720));
  if(lat<0)northing+=10000000;
  return{x:easting,y:northing};
}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source'||place.locatorType!=='institutional_area')throw new Error('Unexpected Regjeringskvartalet unresolved state');
const evidence=readJson('data/coordinate-evidence/oslo/politikk/regjeringskvartalet.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected Regjeringskvartalet evidence state');

const capabilitiesUrl=`${ENDPOINT}?`+new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetCapabilities',version:'2.0.0');
const caps=await fetchText(capabilitiesUrl);
if(!caps.text.includes('<Name>ms:Omraadeplan</Name>')||!caps.text.includes('<DefaultCRS>urn:ogc:def:crs:EPSG::32632</DefaultCRS>'))throw new Error('Oslo Planinnsyn REGTILLEGG no longer exposes Omraadeplan in EPSG:32632');
writeFileSync(`${OUT}/capabilities.xml`,caps.text,'utf8');

const queryUrl=`${ENDPOINT}?`+new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetFeature',version:'2.0.0',typeNames:TYPE,outputFormat:FORMAT,count:'10000'});
const response=await fetchText(queryUrl);
writeFileSync(`${OUT}/omraadeplan-native.geojson`,response.text,'utf8');
if(!/^\s*\{/.test(response.text))throw new Error(`Omraadeplan response is not GeoJSON: ${response.text.slice(0,800)}`);
const data=JSON.parse(response.text);
const features=data.features||[];
const point=wgs84ToUtm32(CENTER.lat,CENTER.lon);
const analyzed=features.map(feature=>{
  const properties=feature.properties||{};
  const bbox=bboxOf(feature.geometry);
  const text=JSON.stringify(properties);
  return{featureId:feature.id||null,properties,geometryType:feature.geometry?.type||null,bbox,bboxContainsCenter:bboxContains(bbox,point.x,point.y),geometryContainsCenter:pointInGeometry(point.x,point.y,feature.geometry),textMatch:/regjeringskvartalet|regjeringskvartal|government quarter/i.test(text)};
});
const propertyKeys=[...new Set(analyzed.flatMap(x=>Object.keys(x.properties)))].sort();
const directMatches=analyzed.filter(x=>x.textMatch);
const contains=analyzed.filter(x=>x.geometryContainsCenter);
const bboxContainsMatches=analyzed.filter(x=>x.bboxContainsCenter);
const planNumberLike=analyzed.filter(x=>/S-?\d{3,5}|2017|2020|2025|statlig|regjer/i.test(JSON.stringify(x.properties)));

const summary={
  version:DATE,
  placeId:PLACE_ID,
  coordinateMaxBatch:maxBatch,
  source:{provider:'Oslo kommune Plan- og bygningsetaten',endpoint:ENDPOINT,map:'REGTILLEGG',featureType:TYPE,crs:'EPSG:32632'},
  canonicalCenterWgs84:CENTER,
  canonicalCenterUtm32:point,
  featureCount:features.length,
  propertyKeys,
  directTextMatches:directMatches,
  geometryContainsCenter:contains,
  bboxContainsCenter:bboxContainsMatches,
  planNumberLikeFeatures:planNumberLike,
  allFeatureSummaries:analyzed,
  decision:directMatches.length===1?'candidate_named_plan_feature_requires_current_plan_version_crosscheck':contains.length===1?'candidate_covering_plan_feature_requires_identity_crosscheck':contains.length>1?'multiple_plan_features_cover_center_require_plan_number_filter':'no_plan_feature_covers_center_in_REGTILLEGG',
  nextAction:'Use the returned plan feature properties/identifier to crosscheck the current adopted Regjeringskvartalet plan version before any canonical coordinate promotion.'
};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet Oslo Planinnsyn WFS area research\n\nDate: ${DATE}\n\n- WFS map: REGTILLEGG\n- feature type: ms:Omraadeplan\n- native CRS: EPSG:32632\n- returned plan features: ${features.length}\n- direct Regjeringskvartalet text matches: ${directMatches.length}\n- features whose geometry contains the canonical center: ${contains.length}\n- features whose bbox contains the canonical center: ${bboxContainsMatches.length}\n\nDecision: **${summary.decision}**\n\nNo canonical coordinate changed.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,featureCount:features.length,propertyKeys,directTextMatchCount:directMatches.length,directMatches,geometryContainsCenterCount:contains.length,geometryContainsCenter:contains,bboxContainsCenterCount:bboxContainsMatches.length,bboxContainsCenter:bboxContainsMatches,decision:summary.decision},null,2));
