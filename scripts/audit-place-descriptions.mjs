import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const writeReport = args.has('--report');
const strict = args.has('--strict');

const templatePath = path.join(root, 'data/places/regler/place_description_templates_v1.json');
const reportJsonPath = path.join(root, 'reports/place-description-audit.json');
const reportMdPath = path.join(root, 'reports/place-description-audit.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.places)) return value.places;
  return [];
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('nb-NO')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ').length : 0;
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function collectPlaceFiles() {
  const files = new Set();
  const errors = [];

  const legacyManifestPath = path.join(root, 'data/places/manifest.json');
  if (fs.existsSync(legacyManifestPath)) {
    try {
      const manifest = readJson(legacyManifestPath);
      for (const entry of Array.isArray(manifest.files) ? manifest.files : []) {
        files.add(path.join(root, 'data', String(entry)));
      }
    } catch (error) {
      errors.push({ file: rel(legacyManifestPath), error: String(error) });
    }
  }

  const cityRegistryPath = path.join(root, 'data/cities/manifest.json');
  if (fs.existsSync(cityRegistryPath)) {
    try {
      const registry = readJson(cityRegistryPath);
      for (const city of Array.isArray(registry.cities) ? registry.cities : []) {
        const manifestRef = String(city?.manifest ?? '').trim();
        if (!manifestRef) continue;
        const cityManifestPath = path.join(root, 'data/cities', manifestRef);
        try {
          const cityManifest = readJson(cityManifestPath);
          for (const entry of Array.isArray(cityManifest?.places?.files) ? cityManifest.places.files : []) {
            files.add(path.join(root, String(entry)));
          }
        } catch (error) {
          errors.push({ file: rel(cityManifestPath), error: String(error) });
        }
      }
    } catch (error) {
      errors.push({ file: rel(cityRegistryPath), error: String(error) });
    }
  }

  return { files: [...files].sort(), errors };
}

const templates = readJson(templatePath);
const aliases = templates.categoryAliases ?? {};
const categoryTemplates = templates.categories ?? {};
const descRange = templates.global?.desc?.targetWords ?? [28, 58];
const popupRange = templates.global?.popupDesc?.targetWords ?? [75, 155];
const watchWords = templates.global?.antiFormula?.watchWords ?? [];

const genericPatterns = [
  { id: 'viser_hvordan', label: 'viser hvordan', regex: /\bviser hvordan\b/giu },
  { id: 'viktig_spor', label: 'viktig spor', regex: /\bviktig(?:e)? spor\b/giu },
  { id: 'gjor_lesbart', label: 'gjør … lesbart', regex: /\bgjør\b[^.!?]{0,80}\blesbar(?:t|e|het)?\b/giu },
  { id: 'representerer_overgangen', label: 'representerer overgangen', regex: /\brepresenterer (?:en|den )?overgang(?:en)?\b/giu },
  { id: 'mote_mellom', label: 'møte mellom', regex: /\bmøte mellom\b/giu },
  { id: 'institusjonelt_tyngdepunkt', label: 'institusjonelt tyngdepunkt', regex: /\binstitusjonelt tyngdepunkt\b/giu },
  { id: 'samlede_byfortelling', label: 'samlede byfortelling', regex: /\bsamlede byfortelling\b/giu },
  { id: 'coordinate_validation_copy', label: 'intern koordinatvalidering i popupDesc', regex: /\b(?:koordinat(?:en|er|status)?|bygningsgeometri|source object|foundation-punkt|verifiseres|godkjennes)\b/giu }
];

const { files: placeFiles, errors: discoveryErrors } = collectPlaceFiles();
const findings = [];
const fileErrors = [...discoveryErrors];
const phraseCounts = new Map();
const watchWordCounts = new Map();
const categoryCounts = new Map();

for (const filePath of placeFiles) {
  if (!fs.existsSync(filePath)) {
    fileErrors.push({ file: rel(filePath), error: 'Filen finnes ikke' });
    continue;
  }

  let places;
  try {
    places = asArray(readJson(filePath));
  } catch (error) {
    fileErrors.push({ file: rel(filePath), error: String(error) });
    continue;
  }

  for (const place of places) {
    const desc = String(place?.desc ?? '').trim();
    const popupDesc = String(place?.popupDesc ?? '').trim();
    const rawCategory = String(place?.category ?? '').trim();
    const category = aliases[rawCategory] ?? rawCategory;
    const descWords = wordCount(desc);
    const popupWords = wordCount(popupDesc);
    const normalizedDesc = normalizeText(desc);
    const normalizedPopup = normalizeText(popupDesc);
    const combined = `${desc}\n${popupDesc}`;
    const issues = [];
    const formulaHits = [];
    const wordHits = [];

    categoryCounts.set(category || '(mangler)', (categoryCounts.get(category || '(mangler)') ?? 0) + 1);

    if (!desc) issues.push('missing_desc');
    if (!popupDesc) issues.push('missing_popupDesc');
    if (desc && popupDesc && normalizedDesc === normalizedPopup) issues.push('identical_desc_popupDesc');
    if (desc && descWords < descRange[0]) issues.push('desc_too_short');
    if (desc && descWords > descRange[1]) issues.push('desc_too_long');
    if (popupDesc && popupWords < popupRange[0]) issues.push('popupDesc_too_short');
    if (popupDesc && popupWords > popupRange[1]) issues.push('popupDesc_too_long');
    if (desc && popupDesc && popupWords <= descWords + 8) issues.push('popupDesc_adds_too_little');
    if (!categoryTemplates[category]) issues.push('missing_category_template');

    for (const pattern of genericPatterns) {
      const matches = [...combined.matchAll(pattern.regex)];
      if (matches.length) {
        formulaHits.push({ id: pattern.id, label: pattern.label, count: matches.length });
        phraseCounts.set(pattern.id, (phraseCounts.get(pattern.id) ?? 0) + matches.length);
      }
    }

    const normalizedCombined = normalizeText(combined);
    for (const watchWord of watchWords) {
      const needle = normalizeText(watchWord);
      if (!needle) continue;
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`, 'gu');
      const matches = normalizedCombined.match(regex) ?? [];
      if (matches.length) {
        wordHits.push({ word: watchWord, count: matches.length });
        watchWordCounts.set(watchWord, (watchWordCounts.get(watchWord) ?? 0) + matches.length);
      }
    }

    findings.push({
      id: String(place?.id ?? '(mangler id)'),
      name: String(place?.name ?? '(mangler navn)'),
      category,
      rawCategory,
      file: rel(filePath),
      descWords,
      popupWords,
      issues,
      formulaHits,
      watchWordHits: wordHits
    });
  }
}

const issueCounts = new Map();
for (const finding of findings) {
  for (const issue of finding.issues) issueCounts.set(issue, (issueCounts.get(issue) ?? 0) + 1);
}

const criticalIssueIds = new Set(['missing_desc', 'missing_popupDesc', 'identical_desc_popupDesc', 'missing_category_template']);
const criticalFindings = findings.filter((finding) => finding.issues.some((issue) => criticalIssueIds.has(issue)));
const revisionCandidates = findings
  .filter((finding) => finding.issues.length || finding.formulaHits.length || finding.watchWordHits.length)
  .sort((a, b) => {
    const aCritical = a.issues.some((issue) => criticalIssueIds.has(issue)) ? 1 : 0;
    const bCritical = b.issues.some((issue) => criticalIssueIds.has(issue)) ? 1 : 0;
    if (aCritical !== bCritical) return bCritical - aCritical;
    if (a.issues.length !== b.issues.length) return b.issues.length - a.issues.length;
    return a.id.localeCompare(b.id, 'nb');
  });

const report = {
  schema: 'history_go_place_description_audit_v1',
  generatedAt: new Date().toISOString(),
  template: rel(templatePath),
  scannedFiles: placeFiles.length,
  scannedPlaces: findings.length,
  fileErrors,
  totals: {
    criticalPlaces: criticalFindings.length,
    revisionCandidates: revisionCandidates.length,
    issues: Object.fromEntries([...issueCounts.entries()].sort()),
    formulaHits: Object.fromEntries([...phraseCounts.entries()].sort()),
    watchWords: Object.fromEntries([...watchWordCounts.entries()].sort()),
    categories: Object.fromEntries([...categoryCounts.entries()].sort())
  },
  candidates: revisionCandidates
};

function renderMarkdown(data) {
  const lines = [];
  lines.push('# Place Description Audit', '');
  lines.push(`Generert: ${data.generatedAt}`, '');
  lines.push('## Sammendrag', '');
  lines.push(`- Skannede place-filer: **${data.scannedFiles}**`);
  lines.push(`- Skannede steder: **${data.scannedPlaces}**`);
  lines.push(`- Kritiske steder: **${data.totals.criticalPlaces}**`);
  lines.push(`- Revisjonskandidater: **${data.totals.revisionCandidates}**`);
  lines.push(`- Filfeil: **${data.fileErrors.length}**`, '');
  lines.push('## Funn etter type', '');
  lines.push('| Funn | Antall |', '|---|---:|');
  for (const [key, count] of Object.entries(data.totals.issues)) lines.push(`| \`${key}\` | ${count} |`);
  lines.push('', '## Gjentatte formler', '');
  lines.push('| Formel | Treff |', '|---|---:|');
  for (const [key, count] of Object.entries(data.totals.formulaHits)) lines.push(`| \`${key}\` | ${count} |`);
  lines.push('', '## Overbrukte observasjonsord', '');
  lines.push('| Ord | Treff |', '|---|---:|');
  for (const [key, count] of Object.entries(data.totals.watchWords)) lines.push(`| ${key} | ${count} |`);
  lines.push('', '## Første revisjonskandidater', '');
  lines.push('| Sted | Kategori | desc | popupDesc | Funn | Fil |', '|---|---|---:|---:|---|---|');
  for (const item of data.candidates.slice(0, 250)) {
    const flags = [...item.issues, ...item.formulaHits.map((hit) => `formel:${hit.id}`)].join(', ');
    lines.push(`| ${item.name} (\`${item.id}\`) | ${item.category} | ${item.descWords} | ${item.popupWords} | ${flags || 'ordvariasjon'} | \`${item.file}\` |`);
  }
  lines.push('', 'Auditresultatet er en arbeidsliste. Lengdeavvik er signaler, ikke automatiske sannhetsdommer. Faktisk revisjon skal følge kildene og den kategorispesifikke malen.', '');
  return lines.join('\n');
}

if (writeReport) {
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, renderMarkdown(report));
  console.log(`Skrev ${rel(reportJsonPath)} og ${rel(reportMdPath)}`);
}

console.log(`Place descriptions: ${report.scannedPlaces} steder i ${report.scannedFiles} filer`);
console.log(`Kritiske: ${report.totals.criticalPlaces}; revisjonskandidater: ${report.totals.revisionCandidates}; filfeil: ${report.fileErrors.length}`);

if (strict && (criticalFindings.length > 0 || fileErrors.length > 0)) process.exitCode = 1;
