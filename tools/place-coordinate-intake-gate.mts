import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { validateCoordinateSource } from './coordinate-source-contract.mjs';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/place-coordinate-intake-gate.md');
const args = new Set(process.argv.slice(2));
const strictNew = args.has('--strict-new');
const reportAll = args.has('--report-all');

if (!strictNew && !reportAll) {
  console.error('Bruk enten --strict-new eller --report-all');
  process.exit(2);
}

const anchorTypes = new Set([
  'area_center',
  'semantic_anchor',
  'street_midpoint',
  'route_anchor',
  'historic_site_anchor',
  'historical_site',
  'kai_anchor',
  'harbor_anchor',
]);
const uncertaintyStatuses = new Set([
  'needs_manual_visual_qa',
  'needs_review',
  'manual_review',
  'unverified',
  'low_precision',
  'approximate',
  'estimated',
  'semantic_anchor',
]);
const genericNotes = new Set(['ok', 'verified', 'checked', 'sjekket', 'kontrollert', 'verifisert', 'reviewed', 'todo', 'tbd', 'n/a', 'na']);

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (p: string) => path.relative(root, p).replace(/\\/g, '/');
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const isArchivePath = (p: string) => /(^|\/)arkiv(\/|$)/i.test(p);
const toPlaces = (payload: any): any[] => Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : Array.isArray(payload?.items) ? payload.items : [];
const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const decimals = (v: number) => {
  const s = String(v);
  if (/e-/i.test(s)) return Number(s.split(/e-/i)[1]);
  return s.split('.')[1]?.length ?? 0;
};
const isMeaningfulNote = (note: unknown) => {
  if (!hasText(note)) return false;
  const normalized = String(note).trim().toLowerCase().replace(/[.!?]+$/g, '');
  if (genericNotes.has(normalized)) return false;
  if (/^(ok|verified|checked|sjekket|kontrollert|verifisert)(\s|$)/i.test(normalized) && normalized.length < 24) return false;
  return normalized.length >= 18 && /[a-zæøå]{4,}/i.test(normalized);
};
const explainsAnchor = (note: unknown) => hasText(note) && /(byggpunkt|inngang|semantisk\s+midtpunkt|midtpunkt|historisk\s+anker|kaianker|rute[-/\s]*anker|linje[-/\s]*anker|områdeanker|area\s+anchor|route\s+anchor|street\s+midpoint|semantic\s+anchor|historic\s+anchor|harbor\s+anchor|kai\s+anchor)/i.test(String(note));

function git(args: string[]) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

type BaseInfo = { ref: string; method: string } | null;

function isHeadRef(ref: string) {
  return ref.trim().toUpperCase() === 'HEAD';
}

function commitExists(ref: string) {
  try {
    git(['rev-parse', '--verify', `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function mergeBaseWithOriginMain() {
  if (!commitExists('origin/main')) return null;
  try {
    const ref = git(['merge-base', 'HEAD', 'origin/main']);
    return ref && commitExists(ref) ? ref : null;
  } catch {
    return null;
  }
}

function baseRef(): BaseInfo {
  const envBase = process.env.COORD_INTAKE_BASE?.trim();
  if (envBase && !isHeadRef(envBase) && commitExists(envBase)) return { ref: envBase, method: 'COORD_INTAKE_BASE' };

  const githubBaseRef = process.env.GITHUB_BASE_REF?.trim();
  if (githubBaseRef) {
    const ref = `origin/${githubBaseRef}`;
    if (commitExists(ref)) return { ref, method: 'origin/${GITHUB_BASE_REF}' };
  }

  const mergeBase = mergeBaseWithOriginMain();
  if (mergeBase) return { ref: mergeBase, method: 'git merge-base HEAD origin/main' };

  for (const [ref, method] of [['origin/main', 'origin/main'], ['main', 'main']] as const) {
    if (commitExists(ref)) return { ref, method };
  }

  return null;
}
const baseInfo = baseRef();
const base = baseInfo?.ref ?? null;
const baseMethod = baseInfo?.method ?? '(ingen trygg git-base funnet)';

if (strictNew && !base) {
  console.error('No safe git base found for coordinate intake strict-new');
  process.exit(2);
}

function readBasePlacesById(file: string): Map<string, any> {
  if (!base) return new Map();
  try {
    const raw = git(['show', `${base}:${file}`]);
    return new Map(toPlaces(JSON.parse(raw)).filter((p) => p?.id).map((p) => [String(p.id), p]));
  } catch {
    return new Map();
  }
}
function changedAgainstBase(place: any, previous: any) {
  if (!previous) return true;
  const fields = ['lat', 'lon', 'r', 'coordType', 'coordStatus', 'coordSource', 'coordVerifiedAt', 'coordNote', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address', 'geocodeAccuracy', 'coordRole', 'geometry', 'anchors'];
  return fields.some((f) => JSON.stringify(place?.[f]) !== JSON.stringify(previous?.[f]));
}

type Finding = { level: 'error' | 'warning' | 'backlog'; id: string; name: string; file: string; field: string; problem: string; fix: string; changed: boolean };
const findings: Finding[] = [];
const technicalErrors: Finding[] = [];
let placesValidated = 0;
let changedPlaces = 0;
const filesRead: string[] = [];

function add(place: any, file: string, changed: boolean, field: string, problem: string, fix: string, hard = true) {
  const level: Finding['level'] = strictNew ? (changed && hard ? 'error' : 'backlog') : (hard ? 'backlog' : 'warning');
  findings.push({ level, id: place?.id ?? '(mangler-id)', name: place?.name ?? '(mangler-name)', file, field, problem, fix, changed });
}

const manifest = readJson(manifestPath);
const activeFiles = (Array.isArray(manifest.files) ? manifest.files : [])
  .map((f: string) => rel(path.join(root, 'data', f)))
  .filter((f: string) => !isArchivePath(f));

for (const file of activeFiles) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    technicalErrors.push({ level: 'error', id: '(manifest)', name: '(manifest)', file, field: 'file', problem: 'Manifest peker på manglende aktiv place-fil.', fix: 'Legg tilbake filen eller fjern manifest-referansen.', changed: true });
    continue;
  }
  let payload: any;
  try { payload = readJson(abs); } catch (err) {
    technicalErrors.push({ level: 'error', id: '(json)', name: '(json)', file, field: 'json', problem: `Ugyldig JSON: ${String(err)}`, fix: 'Rett JSON-syntaksen i source-filen.', changed: true });
    continue;
  }
  filesRead.push(file);
  const previousById = readBasePlacesById(file);
  for (const place of toPlaces(payload)) {
    placesValidated += 1;
    const previous = place?.id ? previousById.get(String(place.id)) : undefined;
    const changed = base ? changedAgainstBase(place, previous) : false;
    if (changed) changedPlaces += 1;
    const lat = place?.lat; const lon = place?.lon; const r = place?.r;

    if (lat == null) add(place, file, changed, 'lat', 'Mangler lat.', 'Sett en eksplisitt latitude eller hold stedet ute av aktiv manifest til koordinat-QA er gjort.');
    if (lon == null) add(place, file, changed, 'lon', 'Mangler lon.', 'Sett en eksplisitt longitude eller hold stedet ute av aktiv manifest til koordinat-QA er gjort.');
    if (r == null) add(place, file, changed, 'r', 'Mangler radius r.', 'Sett positiv radius i meter som matcher kartankeret.');
    if (lat != null && (!isNum(lat) || lat < -90 || lat > 90)) add(place, file, changed, 'lat', `Ugyldig lat (${lat}).`, 'Bruk et gyldig tall mellom -90 og 90.');
    if (lon != null && (!isNum(lon) || lon < -180 || lon > 180)) add(place, file, changed, 'lon', `Ugyldig lon (${lon}).`, 'Bruk et gyldig tall mellom -180 og 180.');
    if (r != null && (!isNum(r) || r <= 0)) add(place, file, changed, 'r', `Ugyldig r (${r}).`, 'Bruk et positivt radius-tall i meter.');

    if (lat != null || lon != null) {
      for (const field of ['coordType', 'coordStatus', 'coordNote']) {
        if (!hasText(place?.[field])) add(place, file, changed, field, `Mangler ${field} for sted med lat/lon.`, `Legg inn ${field} før stedet aktiveres som kartpunkt.`);
      }
    }
    if (place?.coordStatus === 'verified') {
      const contract = validateCoordinateSource(place);
      for (const problem of contract.problems.filter((p) => p.severity === 'error')) {
        add(place, file, changed, problem.field, `Coordinate source contract v1: ${problem.problem}`, problem.recommendedAction);
      }
      for (const field of ['coordSource', 'coordVerifiedAt', 'coordNote', 'coordType']) {
        if (!hasText(place?.[field])) add(place, file, changed, field, `coordStatus=verified mangler ${field}.`, `Legg inn konkret ${field}, eller senk coordStatus til needs_manual_visual_qa/unverified.`);
      }
      if (hasText(place?.coordSource) && String(place.coordSource).trim().length < 4) add(place, file, changed, 'coordSource', 'coordSource er for kort/tom for verified.', 'Oppgi konkret kilde, kartgrunnlag eller QA-metode.');
      if (!isMeaningfulNote(place?.coordNote)) add(place, file, changed, 'coordNote', 'coordNote er for generisk for verified.', 'Forklar hva punktet markerer og hvordan det er kontrollert.');
      if (hasText(place?.coordVerifiedAt) && !/^\d{4}-\d{2}-\d{2}$/.test(String(place.coordVerifiedAt).trim())) add(place, file, changed, 'coordVerifiedAt', 'coordVerifiedAt må være ISO-dato YYYY-MM-DD.', 'Bruk for eksempel 2026-07-09.');
    }
    if (isNum(lat) && isNum(lon) && (decimals(lat) < 4 || decimals(lon) < 4)) {
      if (place?.coordStatus === 'verified') add(place, file, changed, 'coordStatus', 'Lavpresisjonskoordinat (<4 desimaler) kan ikke være verified.', 'Bruk mer presise koordinater eller sett coordStatus til needs_manual_visual_qa.');
      if (!uncertaintyStatuses.has(String(place?.coordStatus ?? ''))) add(place, file, changed, 'coordStatus', 'Lavpresisjonskoordinat må markeres som usikker.', 'Sett coordStatus=needs_manual_visual_qa eller tilsvarende usikker status.', false);
    }
    if (anchorTypes.has(String(place?.coordType ?? '')) && !explainsAnchor(place?.coordNote)) {
      add(place, file, changed, 'coordNote', `coordType=${place?.coordType} krever tydelig ankerforklaring.`, 'Forklar om punktet er byggpunkt, inngang, semantisk midtpunkt, historisk anker, kaianker eller rute-/linjeanker.');
    }
    if (isNum(r) && r >= 300) {
      if (!hasText(place?.coordNote)) add(place, file, changed, 'coordNote', `Stor radius r=${r} mangler coordNote.`, 'Forklar hvorfor punktet er et stort områdeanker.');
      if (place?.coordType === 'site_center' && !explainsAnchor(place?.coordNote)) add(place, file, changed, 'coordType', `Stor radius r=${r} bruker vanlig site_center uten områdeankerforklaring.`, 'Bruk en mer presis coordType eller forklar områdeankeret tydelig i coordNote.');
    }
  }
}

const hardErrors = [...technicalErrors, ...findings.filter((f) => f.level === 'error')];
const backlog = findings.filter((f) => f.level === 'backlog');
const warnings = findings.filter((f) => f.level === 'warning');

function row(f: Finding) { return `| ${f.level} | ${f.changed ? 'ja' : 'nei'} | ${f.id} | ${String(f.name).replace(/\|/g, '\\|')} | ${f.file} | ${f.field} | ${String(f.problem).replace(/\|/g, '\\|')} | ${String(f.fix).replace(/\|/g, '\\|')} |`; }
const report = `# Place coordinate intake gate\n\nGenerert: ${new Date().toISOString()}\n\n## Hvorfor denne gaten finnes\n\nKoordinatfeil oppstår fordi aktive place-filer kan få lat/lon uten nok metadata til å vite om punktet er et byggpunkt, et områdeanker, et linjepunkt eller et historisk/semantisk kompromiss. Eksisterende teknisk quality gate fanger ugyldige tall og ødelagte anchors, men den kan ikke alene bevise at et kartpunkt faktisk er kontrollert. Index-parity er heller ikke nok: parity beviser bare at generert runtime-index speiler source, ikke at source-koordinaten er riktig.\n\n\`verified\` må derfor være strengere enn vanlig koordinatmetadata. En verified-koordinat skal ha kilde, dato, type og en meningsfull note som forklarer hva punktet markerer. Lavpresisjon, store radiusverdier og område-/linje-/historiske ankre må ikke kunne passere som stille kartpunkter.\n\n## Modus og scope\n\n- Modus: **${strictNew ? '--strict-new' : '--report-all'}**\n- Strict-new: **${strictNew ? 'true' : 'false'}**\n- Base for nye/endrede place-objekter: **${base ?? '(ingen git-base funnet)'}**\n- Base method: **${baseMethod}**\n- Aktive manifest-filer lest: **${filesRead.length}**\n- Place-objekter validert: **${placesValidated}**\n- Nye/endrede koordinatobjekter mot base: **${changedPlaces}**\n- Blokkerende feil i denne kjøringen: **${hardErrors.length}**\n- Backlog-funn: **${backlog.length}**\n- Rapport-warnings: **${warnings.length}**\n\n## Regler som håndheves\n\n1. Grunnfelt: aktive steder må ha \`lat\`, \`lon\`, \`r\`; lat/lon må være gyldige tall og \`r\` må være positiv.\n2. Koordinatmetadata: steder med lat/lon må ha \`coordType\`, \`coordStatus\` og \`coordNote\`.\n3. Verified: \`coordStatus=verified\` krever \`coordSource\`, \`coordVerifiedAt\`, \`coordNote\` og \`coordType\`; note må være meningsfull og dato må være \`YYYY-MM-DD\`.\n4. Lavpresisjon: koordinater med færre enn fire desimaler kan ikke være \`verified\` og må markeres med usikker status.\n5. Område-/linje-/historiske typer: område-, gate-, rute-, kai- og historiske ankre må forklare hva punktet markerer.\n6. Stor radius: \`r >= 300\` krever note, og vanlig \`site_center\` må ikke skjule et stort områdeanker uten forklaring.\n7. Coordinate Source Contract v1: nye/endrede \`verified\`-steder må ha locatorType, sourceProvider, sourceObjectId eller address, geocodeAccuracy, coordRole, coordType og coordNote. \`manual_map_check\` er kun QA-lag; \`legacy_unknown\` og lineære steder uten geometry/anchors/line_anchor kan ikke passere som verified.
8. CI/intake: \`--strict-new\` gjør funn harde bare for nye eller endrede koordinatobjekter, slik at gammel backlog kan ryddes manuelt uten å stoppe alle PR-er.
9. Basevalg: \`--strict-new\` bruker aldri \`HEAD\` som base. Basen velges eksplisitt i prioritert rekkefølge fra \`COORD_INTAKE_BASE\`, \`origin/\${GITHUB_BASE_REF}\`, \`git merge-base HEAD origin/main\`, \`origin/main\`, og til slutt \`main\`. Hvis ingen trygg base finnes, feiler strict-new tydelig i stedet for å behandle hele manifestet som endret.\n\n## Hva som fortsatt må løses manuelt for gamle steder\n\nGamle steder med manglende koordinatmetadata, avrundede koordinater, store områdeankre og historiske/semantiske punkter må gjennom manuell kart-QA. Backlog rapporteres fortsatt, men blokkerer ikke i \`--strict-new\` når place-objektet ikke er nytt eller endret mot valgt base. Denne PR-en flytter ingen koordinater og setter ingen gamle steder automatisk til verified.\n\n## Funn\n\n| nivå | endret | place id | name | fil | felt | problem | forslag til fix |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${[...technicalErrors, ...hardErrors.filter((f) => !technicalErrors.includes(f)), ...warnings, ...backlog].slice(0, 500).map(row).join('\n') || '| ok | - | - | - | - | - | Ingen funn i denne modusen. | - |'}\n\n${findings.length > 500 ? `\n_Listen er avkortet til 500 av ${findings.length} funn. Kjør lokalt for full stdout/rapportutvidelse ved behov._\n` : ''}`;
fs.writeFileSync(reportPath, report);

for (const f of hardErrors) console.error(`[${f.level}] ${f.file}#${f.id} (${f.name}) ${f.field}: ${f.problem} Fix: ${f.fix}`);
for (const f of warnings.slice(0, 100)) console.warn(`[${f.level}] ${f.file}#${f.id} (${f.name}) ${f.field}: ${f.problem} Fix: ${f.fix}`);
console.log(`Place coordinate intake gate: ${hardErrors.length} blocking, ${backlog.length} backlog, ${warnings.length} warnings. Rapport: ${rel(reportPath)}`);
if (hardErrors.length > 0) process.exit(1);
