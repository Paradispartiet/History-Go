import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const writeReport = args.has('--report');
const strict = args.has('--strict');
const enforcePopupMinimum = args.has('--enforce-popup-minimum');

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

function paragraphCount(value) {
  const text = String(value ?? '').trim();
  if (!text) return 0;
  return text.split(/\n\s*\n/u).filter((part) => part.trim()).length;
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
const descRange = templates.global?.desc?.targetWords ?? [40, 80];
const popupMinimumWords = templates.global?.popupDesc?.minimumWords ?? 300;
const popupRecommendedWords = templates.global?.popupDesc?.recommendedWords ?? [300, 600];
const popupMinimumParagraphs = templates.global?.popupDesc?.minimumParagraphs ?? 3;
const watchWords = templates.global?.antiFormula?.watchWords ?? [];

const genericPatterns = [
  { id: 'viser_hvordan', label: 'viser hvordan', regex: /\bviser hvordan\b/giu },
  { id: 'forteller_historien_om', label: 'forteller historien om', regex: /\bforteller historien om\b/giu },
  { id: 'gjor_mulig_a_forsta', label: 'gjør det mulig å forstå', regex: /\bgjør det mulig å forstå\b/giu },
  { id: 'viktig_spor', label: 'viktig spor', regex: /\bviktig(?:e)? spor\b/giu },
  { id: 'gjor_lesbart', label: 'gjør … lesbart', regex: /\bgjør\b[^.!?]{0,80}\blesbar(?:t|e|het)?\b/giu },
  { id: 'representerer_overgangen', label: 'representerer overgangen', regex: /\brepresenterer (?:en|den )?overgang(?:en)?\b/giu },
  { id: 'mote_mellom', label: 'møte mellom', regex: /\bmøte mellom\b/giu },
  { id: 'institusjonelt_tyngdepunkt', label: 'institusjonelt tyngdepunkt', regex: /\binstitusjonelt tyngdepunkt\b/giu },
  { id: 'samlede_byfortelling', label: 'samlede byfortelling', regex: /\bsamlede byfortelling\b/giu },
  { id: 'history_go_meta', label: 'redaksjonelt History Go-språk', regex: /\bi history go\b/giu },
  { id: 'coordinate_validation_copy', label: 'intern koordinatvalidering i brukertekst', regex: /\b(?:koordinat(?:en|er|status)?|bygningsgeometri|source object|foundation-punkt|verifiseres|godkjennes)\b/giu }
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
    const popupParagraphs = paragraphCount(popupDesc);
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
    if (desc && descWords < descRange[0]) issues.push('desc_below_normal_range');
    if (desc && descWords > descRange[1]) issues.push('desc_above_normal_range');
    if (popupDesc && popupWords < popupMinimumWords) issues.push('popupDesc_below_hard_minimum');
    if (popupDesc && popupWords > popupRecommendedWords[1]) issues.push('popupDesc_above_recommended_range_allowed');
    if (popupDesc && popupParagraphs < popupMinimumParagraphs) issues.push('popupDesc_too_few_paragraphs');
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
      popupParagraphs,
      issues,
      formulaHits,
      watchWordHits: wordHits
    });
  }
}

const baseCriticalIssueIds = new Set([
  'missing_desc',
  'missing_popupDesc',
  'identical_desc_popupDesc',
  'missing_category_template'
]);
const migrationRuleIssueIds = new Set([
  'popupDesc_below_hard_minimum',
  'popupDesc_too_few_paragraphs'
]);
const criticalIssueIds = new Set(baseCriticalIssueIds);
if (enforcePopupMinimum) {
  for (const issue of migrationRuleIssueIds) criticalIssueIds.add(issue);
}

const issueCounts = new Map();
for (const finding of findings) {
  for (const issue of finding.issues) issueCounts.set(issue, (issueCounts.get(issue) ?? 0) + 1);
}

const criticalFindings = findings.filter((finding) => finding.issues.some((issue) => criticalIssueIds.has(issue)));
const hardMinimumViolations = findings.filter((finding) => finding.issues.some((issue) => migrationRuleIssueIds.has(issue)));
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
  schema: 'history_go_place_description_audit_v3',
  generatedAt: new Date().toISOString(),
  template: rel(templatePath),
  enforcement: {
    popupMinimumIsCanonical: true,
    popupMinimumEnforcedAsExitFailure: enforcePopupMinimum
  },
  ranges: {
    desc: descRange,
    popupDescMinimum: popupMinimumWords,
    popupDescRecommended: popupRecommendedWords,
    popupDescMinimumParagraphs: popupMinimumParagraphs
  },
  scannedFiles: placeFiles.length,
  scannedPlaces: findings.length,
  fileErrors,
  totals: {
    criticalPlaces: criticalFindings.length,
    hardMinimumViolations: hardMinimumViolations.length,
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
  lines.push(`- Kritiske steder i denne kjøringen: **${data.totals.criticalPlaces}**`);
  lines.push(`- Brudd på bindende popupDesc-minimum/avsnittsregel: **${data.totals.hardMinimumViolations}**`);
  lines.push(`- Revisjonskandidater: **${data.totals.revisionCandidates}**`);
  lines.push(`- Filfeil: **${data.fileErrors.length}**`, '');
  lines.push('## Lengderegler', '');
  lines.push(`- desc normalramme: **${data.ranges.desc[0]}–${data.ranges.desc[1]} ord**`);
  lines.push(`- popupDesc bindende minimum: **${data.ranges.popupDescMinimum} ord**`);
  lines.push(`- popupDesc anbefalt arbeidsramme: **${data.ranges.popupDescRecommended[0]}–${data.ranges.popupDescRecommended[1]} ord**`);
  lines.push(`- popupDesc minimum avsnitt: **${data.ranges.popupDescMinimumParagraphs}**`);
  lines.push('- Det finnes ingen automatisk hard maksimumsgrense for popupDesc.', '');
  lines.push('## Funn etter type', '');
  lines.push('| Funn | Antall |', '|---|---:|');
  for (const [key, count] of Object.entries(data.totals.issues)) lines.push(`| \`${key}\` | ${count} |`);
  lines.push('', '## Gjentatte formler', '');
  lines.push('| Formel | Treff |', '|---|---:|');
  for (const [key, count] of Object.entries(data.totals.formulaHits)) lines.push(`| \`${key}\` | ${count} |`);
  lines.push('', '## Overbrukte abstraksjonsord', '');
  lines.push('| Ord | Treff |', '|---|---:|');
  for (const [key, count] of Object.entries(data.totals.watchWords)) lines.push(`| ${key} | ${count} |`);
  lines.push('', '## Første revisjonskandidater', '');
  lines.push('| Sted | Kategori | desc | popupDesc | Avsnitt | Funn | Fil |', '|---|---|---:|---:|---:|---|---|');
  for (const item of data.candidates.slice(0, 250)) {
    const flags = [...item.issues, ...item.formulaHits.map((hit) => `formel:${hit.id}`)].join(', ');
    lines.push(`| ${item.name} (\`${item.id}\`) | ${item.category} | ${item.descWords} | ${item.popupWords} | ${item.popupParagraphs} | ${flags || 'ordvariasjon'} | \`${item.file}\` |`);
  }
  lines.push('', '300 ord er et bindende redaksjonelt minimum. Under migreringen flagges bruddene alltid i rapporten. Bruk `--enforce-popup-minimum` sammen med `--strict` når hele det kontrollerte materialet skal blokkeres ved slike brudd.', '');
  return lines.join('\n');
}

if (writeReport) {
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, renderMarkdown(report));
  console.log(`Skrev ${rel(reportJsonPath)} og ${rel(reportMdPath)}`);
}

console.log(`Place descriptions: ${report.scannedPlaces} steder i ${report.scannedFiles} filer`);
console.log(`Kritiske: ${report.totals.criticalPlaces}; minimumsbrudd: ${report.totals.hardMinimumViolations}; revisjonskandidater: ${report.totals.revisionCandidates}; filfeil: ${report.fileErrors.length}`);

if (strict && (criticalFindings.length > 0 || fileErrors.length > 0)) process.exitCode = 1;
