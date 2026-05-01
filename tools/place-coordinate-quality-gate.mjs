import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/place-coordinate-quality-gate.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const isArchivePath = (p) => /(^|\/)arkiv(\/|$)/i.test(p);

function toPlaces(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function isLinearPlace(text) {
  return /(gate|vei|veien|rute|route|ring\s*\d|elv|elva|trase|sti)/i.test(text);
}

function isLargeAreaPlace(text, radius) {
  return radius >= 250 && /(park|parken|skog|marka|område|fjord|elva|vann|øy|dal)/i.test(text);
}

const hardErrors = [];
const warnings = [];
const activeFiles = [];
let placesValidated = 0;

const manifest = readJson(manifestPath);
const files = Array.isArray(manifest.files) ? manifest.files : [];
const activeManifestFiles = files
  .map((f) => path.join(root, 'data', f))
  .filter((f) => !isArchivePath(rel(f)));

for (const absFile of activeManifestFiles) {
  const file = rel(absFile);
  if (!fs.existsSync(absFile)) {
    hardErrors.push(`${file}: mangler fil referert i manifest`);
    continue;
  }

  let payload;
  try {
    payload = readJson(absFile);
  } catch (err) {
    hardErrors.push(`${file}: ugyldig JSON (${String(err)})`);
    continue;
  }

  activeFiles.push(file);
  for (const p of toPlaces(payload)) {
    placesValidated += 1;
    const id = p?.id;
    const name = p?.name;
    const category = p?.category;
    const lat = p?.lat;
    const lon = p?.lon;
    const r = p?.r;
    const anchors = Array.isArray(p?.anchors) ? p.anchors : null;
    const hasCoordMeta = typeof p?.coordNote === 'string' || typeof p?.coordStatus === 'string';

    const missingCore = [];
    if (!id) missingCore.push('id');
    if (!name) missingCore.push('name');
    if (!category) missingCore.push('category');

    const hasValidPoint = isNum(lat) && isNum(lon) && isNum(r);
    const hasAnchors = anchors && anchors.length > 0;

    if (!hasValidPoint && !hasAnchors) {
      missingCore.push('lat/lon/r eller gyldige anchors');
    }

    if (missingCore.length > 0) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: mangler ${missingCore.join(', ')}`);
    }

    if (lat != null && (!isNum(lat) || lat < -90 || lat > 90)) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: ugyldig lat (${lat})`);
    }
    if (lon != null && (!isNum(lon) || lon < -180 || lon > 180)) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: ugyldig lon (${lon})`);
    }

    if (r == null || !isNum(r) || r <= 0 || r > 10000) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: ugyldig r (${r})`);
    }

    if (anchors) {
      for (const [idx, a] of anchors.entries()) {
        const prefix = `${file}#${id ?? '(mangler-id)'}: anchor[${idx}]`;
        if (!a?.id) hardErrors.push(`${prefix} mangler id`);
        if (!a?.name) hardErrors.push(`${prefix} mangler name`);
        if (!isNum(a?.lat) || a.lat < -90 || a.lat > 90) hardErrors.push(`${prefix} mangler/ugyldig lat (${a?.lat})`);
        if (!isNum(a?.lon) || a.lon < -180 || a.lon > 180) hardErrors.push(`${prefix} mangler/ugyldig lon (${a?.lon})`);
        if (!isNum(a?.r) || a.r <= 0 || a.r > 10000) hardErrors.push(`${prefix} mangler/ugyldig r (${a?.r})`);
        if (!a?.type) hardErrors.push(`${prefix} mangler type`);
      }
    }

    const text = `${name ?? ''} ${category ?? ''}`;
    if (isLinearPlace(text) && !hasAnchors) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: lineært sted uten anchors`);
    }
    if (isLargeAreaPlace(text, isNum(r) ? r : -1) && !hasCoordMeta) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: stort område uten coordNote/coordStatus`);
    }
  }
}

const generatedAt = new Date().toISOString();
let md = `# Place coordinate quality gate\n\n`;
md += `Generert: ${generatedAt}\n\n`;
md += `## Oppsummering\n`;
md += `- Aktive filer validert: **${activeFiles.length}**\n`;
md += `- Antall steder validert: **${placesValidated}**\n`;
md += `- Harde feil: **${hardErrors.length}**\n`;
md += `- Varsler: **${warnings.length}**\n\n`;
md += `## Aktive filer validert\n`;
md += `${activeFiles.map((f) => `- ${f}`).join('\n') || '- Ingen'}\n\n`;
md += `## Harde feil\n`;
md += `${hardErrors.map((e) => `- ${e}`).join('\n') || '- Ingen'}\n\n`;
md += `## Varsler\n`;
md += `${warnings.map((w) => `- ${w}`).join('\n') || '- Ingen'}\n\n`;
md += `## Anbefalt kommando\n`;
md += `- \`node tools/place-coordinate-quality-gate.mjs\`\n`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, md);

if (hardErrors.length > 0) {
  console.error(`Quality gate feilet: ${hardErrors.length} hard(e) feil, ${warnings.length} varsel.`);
  process.exit(1);
}

console.log(`Quality gate ok: ${activeFiles.length} filer, ${placesValidated} steder, ${warnings.length} varsel.`);
