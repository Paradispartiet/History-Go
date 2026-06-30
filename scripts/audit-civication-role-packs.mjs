#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const roleTypes = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const aliases = new Map([
  // Resolver-owned runtime role scopes used by shared/legacy mail packs.
  ['by/arealplanlegger', 'by_radgiver_plan'],
  ['by/arkitekt', 'by_arkitekt'],
  ['by/prosjektleder_byutvikling', 'by_prosjektleder'],
  ['by/saksbehandler_plan_bygg', 'by_saksbehandler'],
  ['by/studentassistent', 'by_assistent'],
  ['naeringsliv/ekspeditor_butikkmedarbeider', 'ekspeditor'],
  ['naeringsliv/fagarbeider', 'arbeider'],
  ['naeringsliv/formann_arbeidsleder', 'formann'],
  ['naeringsliv/kapitalforvalter', 'mellomleder'],
  ['naeringsliv/okonomi_og_administrasjonsmedarbeider', 'administrasjonsmedarbeider'],
  ['sport/aktiv_utover', 'sport_utover'],
  ['sport/idrettslegende', 'sport_legende'],
  ['sport/kaptein', 'sport_kaptein'],
  ['sport/sportssjef', 'sport_sportsledelse'],
  ['sport/trener', 'sport_trener']
]);


const mailPlanAliases = new Map([
  // Legacy/group mail plan scope names that resolve to the same role identity.
  ['naeringsliv/kapital_og_eierskap', 'mellomleder']
]);

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}
function exists(rel) { return fs.existsSync(path.join(repoRoot, rel)); }
function walk(dir) {
  const full = path.join(repoRoot, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
function bool(v) { return v ? 'ja' : 'nei'; }
function baseName(rel) { return path.basename(rel, '.json'); }
function hasContent(rel) {
  if (!exists(rel)) return false;
  const json = readJson(rel);
  const families = Array.isArray(json.families) ? json.families : [];
  return families.some(f => (Array.isArray(f.mails) && f.mails.length) || (Array.isArray(f.threads) && f.threads.length));
}
function statusFor(row) {
  const mailTypeCount = roleTypes.filter(t => row[`${t}Mails`]).length;
  if (row.key === 'by/arealplanlegger') return row.workGrammar ? 'complete_reference_v2' : 'complete_reference';
  if (row.key === 'sosial_laering/barnehageassistent') return row.test ? (row.workGrammar ? 'complete_reference_v2' : 'complete_reference') : 'playable_v1';
  if (!row.roleModel && !row.mailPlan && mailTypeCount === 0) return 'missing';
  if (row.roleModel && !row.mailPlan && mailTypeCount === 0) return row.generated ? 'generated_stub' : 'role_model_only';
  if (row.roleModel && row.mailPlan && mailTypeCount === roleTypes.length && row.test) {
    return row.workGrammar ? 'complete_reference_v2' : 'playable_v1';
  }
  if (row.mailPlan && !row.roleModel) return 'broken_mapping';
  if (row.mailPlan || mailTypeCount > 0) return 'partial_pack';
  return 'missing';
}

const manifest = readJson('data/Civication/roleModels/manifest.json');
const testFiles = walk('tests').filter(f => /civication-.*\.test\.js$/.test(f));
const mailPlanFiles = walk('data/Civication/mailPlans').filter(f => f.endsWith('.json'));
const mailFamilyFiles = walk('data/Civication/mailFamilies').filter(f => f.endsWith('.json'));
const workGrammarFiles = walk('data/Civication/workGrammars').filter(f => f.endsWith('.json'));

const rows = new Map();
for (const rel of manifest.files) {
  const model = readJson(rel);
  const category = model.category || rel.split('/').at(-2);
  const slug = baseName(rel);
  const key = `${category}/${slug}`;
  const runtimeScope = aliases.get(key) || model.role_scope || slug;
  rows.set(key, {
    key, category, slug,
    role_scope: runtimeScope,
    role_id: model.role_id || '',
    title: model.title || slug,
    roleModel: true,
    generated: JSON.stringify(model).toLowerCase().includes('generated') || model?.notes?.some?.(n => String(n).toLowerCase().includes('generert')),
  });
}

for (const rel of workGrammarFiles) {
  const json = readJson(rel);
  const category = json.category || rel.split('/').at(-2);
  const scope = json.role_scope || baseName(rel);
  let key = [...rows.values()].find(r => r.category === category && r.role_scope === scope)?.key;
  if (!key) key = `${category}/${scope}`;
  if (!rows.has(key)) rows.set(key, { key, category, slug: scope, role_scope: scope, role_id: json.role_id || '', title: json.title || scope, roleModel: false });
  Object.assign(rows.get(key), { workGrammar: true, workGrammarPath: rel });
}

for (const rel of mailPlanFiles) {
  const json = readJson(rel);
  const category = json.category || rel.split('/').at(-2);
  const planScope = json.role_scope || baseName(rel).replace(/_plan$/, '');
  const scope = mailPlanAliases.get(`${category}/${planScope}`) || planScope;
  let key = [...rows.values()].find(r => r.category === category && r.role_scope === scope)?.key;
  if (!key) key = `${category}/${scope}`;
  if (!rows.has(key)) rows.set(key, { key, category, slug: scope, role_scope: scope, role_id: json.role_id || '', title: scope, roleModel: false });
  Object.assign(rows.get(key), { mailPlan: true, mailPlanPath: rel });
}

for (const row of rows.values()) {
  row.workGrammar ||= exists(`data/Civication/workGrammars/${row.category}/${row.role_scope}.json`);
  row.mailPlan ||= exists(`data/Civication/mailPlans/${row.category}/${row.role_scope}_plan.json`);
  for (const type of roleTypes) {
    const rel = `data/Civication/mailFamilies/${row.category}/${type}/${row.role_scope}_${type}.json`;
    row[`${type}Mails`] = hasContent(rel);
  }
  row.test = testFiles.some(f => {
    const s = fs.readFileSync(path.join(repoRoot, f), 'utf8').toLowerCase();
    return f.toLowerCase().includes(row.slug.toLowerCase()) || s.includes(row.role_scope.toLowerCase()) || s.includes(row.slug.toLowerCase());
  });
  row.status = statusFor(row);
}

const sorted = [...rows.values()].sort((a,b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title, 'nb'));
const statusCounts = sorted.reduce((acc, r) => (acc[r.status] = (acc[r.status] || 0) + 1, acc), {});
const header = ['category','role_scope','role_id','title','roleModel finnes','workGrammar finnes','mailPlan finnes',...roleTypes.map(t => `${t}-mails finnes`),'test finnes','status'];
const lines = [];
lines.push('# Civication Role Pack Index v1');
lines.push('');
lines.push('Generert av `node scripts/audit-civication-role-packs.mjs`. Rapporten er en audit/statusoversikt og endrer ikke runtime eller UI.');
lines.push('');
lines.push('## Statusdefinisjoner');
lines.push('');
lines.push('- `complete_reference_v2`: referansepakke med roleModel, workGrammar/FWG, mailPlan, alle mailFamilies og test.');
lines.push('- `complete_reference`: legacy referansepakke etter rollepakke-standarden, men uten FWG.');
lines.push('- `playable_v1`: spillbar pakke med roleModel, mailPlan, mailFamilies og test, men ikke markert som referanse.');
lines.push('- `partial_pack`: noe produksjonsdata finnes, men pakken er ikke komplett.');
lines.push('- `role_model_only`: kun roleModel finnes.');
lines.push('- `generated_stub`: roleModel finnes, men virker som generert startpunkt uten produksjonspakke.');
lines.push('- `broken_mapping`: mailPlan finnes uten matchende roleModel i manifestet.');
lines.push('- `missing`: ingen synlig pakke i auditgrunnlaget.');
lines.push('');
lines.push('## Sammendrag');
lines.push('');
for (const status of ['complete_reference_v2','complete_reference','playable_v1','partial_pack','role_model_only','generated_stub','broken_mapping','missing']) lines.push(`- ${status}: ${statusCounts[status] || 0}`);
lines.push('');
lines.push('## Rolleindeks');
lines.push('');
lines.push(`| ${header.join(' | ')} |`);
lines.push(`| ${header.map(() => '---').join(' | ')} |`);
for (const r of sorted) {
  const cells = [r.category, r.role_scope, r.role_id, r.title, bool(r.roleModel), bool(r.workGrammar), bool(r.mailPlan), ...roleTypes.map(t => bool(r[`${t}Mails`])), bool(r.test), r.status];
  lines.push(`| ${cells.map(c => String(c).replaceAll('|', '\\|')).join(' | ')} |`);
}
lines.push('');

const markdown = `${lines.join('\n')}\n`;
fs.mkdirSync(path.join(repoRoot, 'reports'), { recursive: true });
fs.writeFileSync(path.join(repoRoot, 'reports/civication-role-pack-index.md'), markdown);
fs.writeFileSync(path.join(repoRoot, 'docs/CIVICATION_ROLE_PACK_INDEX.md'), markdown);
console.log(`Wrote ${sorted.length} role rows to docs/CIVICATION_ROLE_PACK_INDEX.md and reports/civication-role-pack-index.md`);
