import fs from 'fs';
import path from 'path';
import { validateCoordinateSource } from './coordinate-source-contract.mjs';
const root = process.cwd();
const rel = (p: string) => path.relative(root, p).replace(/\\/g, '/');
const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const toPlaces = (payload: any) => Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : Array.isArray(payload?.items) ? payload.items : [payload];
const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const hasAddress = (p: any) => !!p?.address && typeof p.address === 'object' && ['street','number','postcode','city','country'].some((f) => hasText(p.address[f]));
const linearWords = /(kai|kaia|kaier|gate|gata|vei|veien|elv|elva|rute|park|front|havn|harbor)/i;
const historicalWords = /(histor|arkeolog|middelalder|fortid|ruin|verksted|anlegg)/i;
const special: Record<string,string> = { havnelageret:'upgrade_to_address_source', salt:'upgrade_to_osm_or_place_id', tollbukaia:'upgrade_to_geometry', akershus_kaier:'upgrade_to_geometry', oslo_mek:'upgrade_to_historical_source' };
const rows: {id:string; name:string; file:string; problem:string; action:string}[] = [];
function add(p:any,file:string,problem:string,action:string){ rows.push({ id:String(p?.id??''), name:String(p?.name??''), file, problem:problem.replace(/\|/g,'\\|'), action }); }
const manifest = readJson(path.join(root,'data/places/manifest.json'));
for (const f of manifest.files || []) {
  const file = rel(path.join(root,'data',f));
  const abs = path.join(root,file);
  if (!fs.existsSync(abs)) continue;
  for (const p of toPlaces(readJson(abs))) {
    if (!p?.id) continue;
    const verified = p.coordStatus === 'verified' || p.coordStatus === 'verified_geometry' || p.coordStatus === 'verified_historical_source';
    if (special[p.id]) {
      add(p,file,'Spesialpunkt fra batch 02: skal ikke være verified uten full v1-kontrakt; brukerrapport sier punktet fortsatt var feil. Oslo Mek-note: dagens Oslo Mek og historisk verksted må ikke blandes.',special[p.id]);
    }
    const result = validateCoordinateSource(p);
    for (const prob of result.problems) if (verified || prob.severity === 'error') add(p,file,prob.problem,prob.recommendedAction);
    if (verified && !hasText(p.locatorType)) add(p,file,'coordStatus=verified men mangler locatorType','downgrade_to_needs_source');
    if (verified && !hasText(p.sourceProvider)) add(p,file,'coordStatus=verified men mangler sourceProvider','downgrade_to_needs_source');
    if (verified && !hasText(p.sourceObjectId) && !hasAddress(p)) add(p,file,'coordStatus=verified men mangler sourceObjectId og address','upgrade_to_osm_or_place_id');
    if (verified && !hasText(p.geocodeAccuracy)) add(p,file,'coordStatus=verified men mangler geocodeAccuracy','downgrade_to_needs_manual_visual_qa');
    if (verified && !hasText(p.coordRole)) add(p,file,'coordStatus=verified men mangler coordRole','downgrade_to_needs_source');
    if (p.coordSource === 'manual_map_check' && !hasText(p.sourceProvider) && !hasText(p.sourceObjectId) && !hasAddress(p)) add(p,file,'coordSource=manual_map_check er eneste kilde','upgrade_to_osm_or_place_id');
    if (p.sourceProvider === 'legacy_unknown' && verified) add(p,file,'sourceProvider=legacy_unknown + verified','downgrade_to_needs_source');
    if (hasText(p.coordType) && !hasText(p.locatorType)) add(p,file,'coordType finnes men locatorType mangler','downgrade_to_needs_source');
    const text = `${p.id} ${p.name} ${p.coordType} ${p.coordNote}`;
    if (linearWords.test(text) && !p.geometry && !(Array.isArray(p.anchors)&&p.anchors.length) && !['line_anchor','area_anchor'].includes(p.coordRole)) add(p,file,'Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor','upgrade_to_geometry');
    if (historicalWords.test(text) && verified && !['historical_map','manual_research'].includes(p.sourceProvider)) add(p,file,'Historisk sted mangler historisk sourceProvider','upgrade_to_historical_source');
    if (verified && (String(p.lat).split('.')[1]?.length ?? 0) < 4) add(p,file,'Lavpresisjonskoordinat står som verified','downgrade_to_needs_manual_visual_qa');
    if (!verified && hasText(p.coordSource) && !hasText(p.sourceProvider)) add(p,file,'Gammelt koordinatsystem bør kasseres eller oppgraderes til v1','keep_as_legacy_unverified');
  }
}
const dedup = new Map<string, typeof rows[number]>();
for (const r of rows) dedup.set(`${r.id}|${r.file}|${r.problem}|${r.action}`, r);
const list = [...dedup.values()].sort((a,b)=>a.file.localeCompare(b.file)||a.id.localeCompare(b.id));
const report = `# Legacy coordinate system audit\n\nGenerert: ${new Date().toISOString()}\n\nDette er rapportmodus for Coordinate Source Contract v1. Stor backlog blokkerer ikke tools:check ennå.\n\n| id | name | file | legacy problem | recommended action |\n|---|---|---|---|---|\n${list.map(r=>`| ${r.id} | ${r.name.replace(/\|/g,'\\|')} | ${r.file} | ${r.problem} | ${r.action} |`).join('\n') || '| - | - | - | Ingen funn | keep_as_legacy_unverified |'}\n`;
fs.writeFileSync(path.join(root,'reports/legacy-coordinate-system-audit.md'), report);
console.log(`Legacy coordinate audit: ${list.length} findings. Rapport: reports/legacy-coordinate-system-audit.md`);
