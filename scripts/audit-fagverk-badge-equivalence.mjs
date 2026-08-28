import fs from 'node:fs';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('data/categories/category_contract.json', 'utf8'));

const text = (value) => String(value == null ? '' : value).trim();
const list = (value) => Array.isArray(value) ? value : [];

function classifyPage(item) {
  const badgePage = text(item.badgePage);
  if (/^fagverk\.html\?subject=[^#]+#fagverkIaProgresjon$/.test(badgePage)) {
    return { family: 'progress_route', equivalence: 'complete', action: 'already_migrated' };
  }
  if (!badgePage || badgePage.includes('?')) {
    return { family: 'unknown', equivalence: 'blocked', action: 'manual_review' };
  }
  if (!fs.existsSync(badgePage)) {
    return { family: 'missing', equivalence: 'blocked', action: 'restore_or_repoint' };
  }
  const html = fs.readFileSync(badgePage, 'utf8');
  const lower = html.toLocaleLowerCase('nb-NO');
  const sectionCount = (html.match(/class=["'][^"']*merke-blokk/g) || []).length;
  const hasRichRuntime = /politikk-fagportal\.js|politikkEmneProgress|politikkQuizHistory|politikkConcepts/.test(html);
  const hasTheorySignature = /full teori|full teoretisk beskrivelse/.test(lower) || sectionCount >= 5;
  if (hasRichRuntime) return { family: 'rich_runtime', equivalence: 'pending_runtime_migration', action: 'migrate_features_before_redirect' };
  if (hasTheorySignature) return { family: 'legacy_static_theory', equivalence: 'pending_content_audit', action: 'compare_content_before_redirect' };
  return { family: 'legacy_stub', equivalence: 'pending_redirect_review', action: 'verify_no_unique_content' };
}

const canonical = list(categories.fagSubjects).map(text);
const byId = new Map(list(portal.categories).map((item) => [text(item.id), item]));
const missingPortal = canonical.filter((id) => !byId.has(id));
if (missingPortal.length) throw new Error(`Portalregisteret mangler canonicale fag: ${missingPortal.join(', ')}`);

const rows = canonical.map((id) => {
  const item = byId.get(id);
  const badgeFile = `data/badges/${id}.json`;
  if (!fs.existsSync(badgeFile)) throw new Error(`${id}: mangler ${badgeFile}`);
  const badge = JSON.parse(fs.readFileSync(badgeFile, 'utf8'));
  const classification = classifyPage(item);
  return {
    id,
    badgePage: text(item.badgePage),
    subjectPage: text(item.subjectPage),
    badgeName: text(badge.name || badge.title),
    tierCount: list(badge.tiers).length,
    underbadgeCount: list(badge.sub).length,
    ...classification
  };
});

const unknown = rows.filter((row) => ['unknown', 'missing'].includes(row.family));
if (unknown.length) throw new Error(`Uavklarte badgePage-mål: ${unknown.map((row) => `${row.id}:${row.family}`).join(', ')}`);

const counts = rows.reduce((acc, row) => {
  acc[row.family] = (acc[row.family] || 0) + 1;
  return acc;
}, {});

process.stdout.write(`${JSON.stringify({
  schema: 'history_go_fagverk_badge_equivalence_audit_v1',
  canonicalSubjectCount: canonical.length,
  counts,
  rows
}, null, 2)}\n`);
