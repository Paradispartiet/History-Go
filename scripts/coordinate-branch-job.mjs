import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23", BATCH = 187, PLACE_ID = "akershus_energi";
const LEGACY_FILE = "data/places/naeringsliv/oslo/places_naeringsliv.json";
const SPLIT_MANIFEST = "data/places/naeringsliv/oslo/places_naeringsliv_manifest.json";
const SPLIT_INDEX = "data/places/naeringsliv/oslo/places_naeringsliv_index.json";
const SPLIT_FILE = "data/places/naeringsliv/oslo/places_naeringsliv/akershus_energi.json";
const PLACE_FILE = "data/places/naeringsliv/akershus/akershus_energipark.json";
const OLD_EVIDENCE_FILE = "data/coordinate-evidence/oslo/naeringsliv/akershus_energi.json";
const OLD_EVIDENCE_MANIFEST_ENTRY = "oslo/naeringsliv/akershus_energi.json";
const EVIDENCE_FILE = "data/coordinate-evidence/akershus/naeringsliv/akershus_energi.json";
const EVIDENCE_MANIFEST_ENTRY = "akershus/naeringsliv/akershus_energi.json";
const EVIDENCE_MANIFEST = "data/coordinate-evidence/manifest.json";
const REPORT_DIR = "reports/oslo-coordinate-control-batch-187-akershus-energipark-relocation";
const OFFICIAL_URL = "https://akershusenergi.no/varmesentraler/lillestrom/";
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const writeJson = (p, v) => { mkdirSync(p.split("/").slice(0, -1).join("/"), { recursive: true }); writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`, "utf8"); };
const sha256 = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const parseJsonOutput = (s) => { const t = String(s ?? "").trim(), i = t.indexOf("{"); if (i < 0) return null; try { return JSON.parse(t.slice(i)); } catch { return null; } };
const distanceMeters = (a,b,c,d) => { const rad=(x)=>x*Math.PI/180,R=6371000,dl=rad(c-a),dn=rad(d-b),q=Math.sin(dl/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dn/2)**2; return 2*R*Math.asin(Math.sqrt(q)); };
const extractPlaces = (root) => { const out=[],seen=new Set(); const visit=(v,d=0)=>{ if(d>7||v==null)return; if(Array.isArray(v)){for(const x of v)visit(x,d+1);return;} if(typeof v!=="object")return; if(typeof v.id==="string"&&typeof v.name==="string"&&Number.isFinite(v.lat)&&Number.isFinite(v.lon)){if(!seen.has(v.id)){seen.add(v.id);out.push(v);}return;} for(const x of Object.values(v))visit(x,d+1);}; visit(root); return out; };
const appendManifest = (p,item) => { const m=readJson(p); if(!Array.isArray(m.files))throw new Error(`${p} missing files[]`); if(!m.files.includes(item))m.files.push(item); writeJson(p,m); };

if (existsSync(PLACE_FILE) || existsSync(EVIDENCE_FILE)) throw new Error("Dedicated EnergiPark place/evidence already exists");
if (!existsSync(OLD_EVIDENCE_FILE)) throw new Error(`Expected stale Oslo evidence ${OLD_EVIDENCE_FILE}`);
const oldEvidence = readJson(OLD_EVIDENCE_FILE);
if (oldEvidence.placeId !== PLACE_ID || oldEvidence.coordinateDecision !== "needs_identity_split") {
  throw new Error("Unexpected stale Oslo evidence state");
}
let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m)=>Number(m[1])));
if (maxBatch !== 186) throw new Error(`Expected previous batch 186, got ${maxBatch}`);

const legacy = readJson(LEGACY_FILE);
if (!Array.isArray(legacy)) throw new Error("Legacy Oslo business source is not an array");
const matches = legacy.filter((p)=>p?.id===PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one legacy ${PLACE_ID}, got ${matches.length}`);
const oldPlace = matches[0];
if (oldPlace.coordStatus || oldPlace.sourceObjectId || oldPlace.locatorType) throw new Error("Legacy record unexpectedly already contracted");

const build = spawnSync("npm", ["run","build:tools"], { encoding:"utf8" });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout??""}${build.stderr??""}`, "utf8");
if (build.status !== 0) throw new Error(`build failed ${build.status}`);
const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs","--address","Rolf Olsens vei 50 2007 Kjeller"], { encoding:"utf8" });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout??""}${finder.stderr??""}`, "utf8");
const found = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || found?.status !== "verified_candidate") throw new Error(`address-first ${found?.status??"parse_error"}`);
if (found.sourceObjectId !== "geonorge-adresser-v1:3205:11500:50") throw new Error(`Unexpected source ${found.sourceObjectId}`);
const lat=Number(found.coordinate?.lat), lon=Number(found.coordinate?.lon);
if (Math.abs(lat-59.97151165737936)>1e-10 || Math.abs(lon-11.072630258843615)>1e-10) throw new Error(`Coordinate changed ${lat},${lon}`);

const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
const nearby = currentPlaces.filter((p)=>p.id!==PLACE_ID).map((p)=>({id:p.id,name:p.name,distanceMeters:Number(distanceMeters(lat,lon,p.lat,p.lon).toFixed(2))})).sort((a,b)=>a.distanceMeters-b.distanceMeters).slice(0,10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Collision ${nearby[0].id} ${nearby[0].distanceMeters}m`);

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Rolf Olsens vei 50, 2007 Kjeller. Akershus Energis egen omtale dokumenterer Akershus EnergiPark som det fysiske fjernvarmeanlegget som åpnet i 2011. Punktet brukes som canonical display-marker for energiparken; det er ikke konsernets kontoradresse i Brogata og ikke den tidligere udokumenterte Oslo-markøren.";
const place = {
  ...oldPlace, name:"Akershus EnergiPark", lat, lon, r:100, year:2011,
  desc:"Fjernvarmeanlegg på Kjeller som produserer lokal fornybar varme til Lillestrøm-området.",
  popupDesc:"Akershus EnergiPark på Kjeller åpnet i 2011 og er et fysisk produksjonsanlegg for fjernvarme. Anlegget inngår i energiforsyningen til Lillestrøm-området og bruker lokale fornybare energikilder i varmeproduksjonen.\n\nI History Go er stedet et konkret eksempel på den moderne byens energiinfrastruktur: produksjon, distribusjon og tekniske systemer som arbeider kontinuerlig i bakgrunnen for å holde bygninger og bydeler varme. Canonical-stedet representerer selve energiparken på Rolf Olsens vei 50, ikke Akershus Energis administrative hovedkontor.",
  locatorType:"building", sourceProvider:"official_address", sourceObjectId:found.sourceObjectId,
  address:{street:"Rolf Olsens vei",number:"50",postcode:"2007",city:"Kjeller",country:"NO"}, geocodeAccuracy:"rooftop", coordRole:"display_marker",
  coordType:"address_point", coordStatus:"verified", coordSource:"geonorge_adresser_v1", coordSourceId:found.sourceObjectId, coordSourceUrl:found.sourceUrl, coordVerifiedAt:DATE, coordNote,
  externalLinks:[{type:"official",label:"Akershus Energi – Akershus EnergiPark",url:OFFICIAL_URL,lang:"nb",verifiedAt:DATE}]
};
const evidence = {
  schemaVersion:"1.0", placeId:PLACE_ID, placeFile:PLACE_FILE, evidenceStatus:"applied_to_place", coordinateDecision:"do_not_change_coordinates_yet",
  currentCoordinate:{lat,lon,r:100,coordStatus:"verified",coordSource:"geonorge_adresser_v1",coordType:"address_point",coordNote},
  identity:{currentName:place.name,resolvedIdentity:"Akershus EnergiPark, det fysiske fjernvarmeanlegget på Rolf Olsens vei 50 på Kjeller",identityStatus:"resolved",identityProblem:"Legacy-recorden het Akershus Energi Varme og var plassert på en udokumentert Oslo-koordinat som ikke representerte det identifiserte fysiske anlegget.",locatorTypeCandidate:"building",requiresSplit:false,splitReason:""},
  requiredEvidence:["eksakt fysisk anleggsidentitet","offisiell adressekoordinat","geografisk korrigering fra Oslo til Lillestrøm"],
  evidence:[
    {sourceProvider:"official_address",sourceName:"Geonorge Adresser API v1 – Rolf Olsens vei 50",sourceUrl:found.sourceUrl,sourceObjectId:found.sourceObjectId,sourceQuality:"official_address",finding:"Ett tydelig offisielt adressepunkt for Rolf Olsens vei 50, 2007 Kjeller i Lillestrøm kommune.",canVerifyCoordinate:true,reason:coordNote},
    {sourceProvider:"manual_research",sourceName:"Akershus Energi – Akershus EnergiPark",sourceUrl:OFFICIAL_URL,sourceObjectId:"akershus-energi:energipark-lillestrom-current",sourceQuality:"official_institution_identity",finding:"Akershus Energis egen anleggsside identifiserer Akershus EnergiPark som fjernvarmeanlegget som åpnet i Lillestrøm i 2011 og beskriver anleggets funksjon i fjernvarmenettet.",canVerifyCoordinate:false,reason:"Dokumenterer fysisk institusjonsidentitet og anleggets funksjon; Geonorge brukes som koordinatkilde."}
  ],
  addressCandidates:[{address:"Rolf Olsens vei 50, 2007 Kjeller",sourceProvider:"official_address",sourceObjectId:found.sourceObjectId,canApplyToPlace:true}],
  sourceObjectCandidates:[{sourceProvider:"official_address",sourceObjectId:found.sourceObjectId,canApplyToPlace:true},{sourceProvider:"manual_research",sourceObjectId:"akershus-energi:energipark-lillestrom-current",canApplyToPlace:false}],
  geometryCandidates:[], coordinateCandidates:[{lat,lon,coordRole:"display_marker",sourceObjectId:found.sourceObjectId,canApplyToPlace:true}],
  decision:{canBecomeVerified:true,blockedReason:"",nextAction:"Canonical-recorden er flyttet til Akershus og forankret på det eksakte offisielle adressepunktet for energiparken."},
  notes:[coordNote,`Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id??"ingen"} på ${nearby[0]?.distanceMeters??"n/a"} meter; ingen markør lå innen 3 meter.`,`Legacy-koordinaten ${oldPlace.lat}, ${oldPlace.lon} er pensjonert som udokumentert og geografisk feil for den løste identiteten.`]
};

const remaining = legacy.filter((p)=>p?.id!==PLACE_ID);
writeJson(LEGACY_FILE, remaining);
const splitManifest = readJson(SPLIT_MANIFEST);
const beforeSplit = splitManifest.places?.length ?? 0;
splitManifest.places = (splitManifest.places ?? []).filter((p)=>p?.id!==PLACE_ID).map((row)=>({...row,order:remaining.findIndex((p)=>p.id===row.id)}));
if (beforeSplit - splitManifest.places.length !== 1 || splitManifest.places.some((p)=>p.order<0)) throw new Error("Could not remove/reorder old Oslo split manifest row");
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(LEGACY_FILE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);
const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex) || splitIndex.filter((p)=>p?.id===PLACE_ID).length !== 1) throw new Error("Unexpected old Oslo split index state");
writeJson(SPLIT_INDEX, splitIndex.filter((p)=>p?.id!==PLACE_ID));
if (!existsSync(SPLIT_FILE)) throw new Error(`Expected old split file ${SPLIT_FILE}`);
rmSync(SPLIT_FILE);

writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);
rmSync(OLD_EVIDENCE_FILE);
appendManifest("data/places/manifest.json","places/naeringsliv/akershus/akershus_energipark.json");
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files)) throw new Error(`${EVIDENCE_MANIFEST} missing files[]`);
if (!evidenceManifest.files.includes(OLD_EVIDENCE_MANIFEST_ENTRY)) throw new Error("Stale Oslo evidence manifest entry missing");
evidenceManifest.files = evidenceManifest.files.filter((entry)=>entry!==OLD_EVIDENCE_MANIFEST_ENTRY && entry!==EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
writeJson(EVIDENCE_MANIFEST,evidenceManifest);

const lines = protocol.split("\n");
const oldRows = lines.map((line,i)=>line.includes("`akershus_energi`")?i:-1).filter((i)=>i>=0);
if (oldRows.length !== 1) throw new Error(`Expected one protocol row for ${PLACE_ID}, got ${oldRows.length}`);
protocol = lines.filter((_,i)=>!oldRows.includes(i)).join("\n");
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Akershus EnergiPark | verified; moved to Akershus | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved geografisk identitetskorreksjon. Legacy-recorden «Akershus Energi Varme» hadde en udokumentert Oslo-markør, mens source-first-kontrollen identifiserer det konkrete fysiske stedet som Akershus EnergiPark på Kjeller. Geonorge gir ett eksakt adresseobjekt for Rolf Olsens vei 50 i Lillestrøm kommune. Canonical placeId beholdes av kompatibilitetshensyn, men recorden flyttes fra Oslo-aggregatet og tilhørende Oslo-splitfiler til egen Akershus-kildefil. Den gamle Oslo-evidensfilen med \`needs_identity_split\` pensjoneres samtidig og erstattes av den anvendte Akershus-evidensen. Oslo-totalen for aktive current \`verified*\`-steder økes ikke, fordi dette er en utflytting av en tidligere uverifisert Oslo-køpost.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md",protocol,"utf8");
writeJson(`${REPORT_DIR}/batch-187-result.json`,{version:DATE,batch:BATCH,placeId:PLACE_ID,status:"produced_by_geographic_relocation",old:{file:LEGACY_FILE,name:oldPlace.name,coordinate:{lat:oldPlace.lat,lon:oldPlace.lon},evidenceFile:OLD_EVIDENCE_FILE},current:{file:PLACE_FILE,name:place.name,coordinate:{lat,lon},sourceObjectId:found.sourceObjectId,coordStatus:place.coordStatus,evidenceFile:EVIDENCE_FILE},nearestCanonicalBeforeWrite:nearby[0]??null,checks:{expectedPreviousBatch:186,legacyRecordRemoved:true,oldSplitRecordRemoved:true,dedicatedAkershusFileCreated:true,noOtherCanonicalWithin3m:true,oldOsloEvidenceRetired:true,evidenceManifestMoved:true,unresolvedProtocolRowRemoved:true}});
console.log(JSON.stringify({batch:BATCH,placeId:PLACE_ID,sourceObjectId:found.sourceObjectId,coordinate:{lat,lon},movedFrom:"oslo",movedTo:"akershus",nearestCanonicalBeforeWrite:nearby[0]??null,oldEvidenceRetired:true},null,2));
