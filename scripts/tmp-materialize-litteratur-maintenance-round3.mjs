#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const BASELINE = 'fd4d36f72044aec588c87cee6ec25001d574e223';
const AREA = 'sprak_stil_retorikk';
const P = Object.freeze({
  claims: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/sprak_stil_retorikk/claims.json',
  pathway: 'data/quiz/litteratur/litteratur_subject_pathways_v1.json',
  materializer: 'scripts/materialize-litteratur-poetics-style-v1.mjs',
  knowledge: 'data/knowledge/subjects/litteratur/knowledge_units.generated.json',
  evidence: 'data/fagverk/litteratur/maintenance/source-refresh-round3-2026-09-05.json',
  audit: 'scripts/audit-litteratur-maintenance-source-refresh-round3.mjs',
  test: 'tests/litteratur-maintenance-source-refresh-round3.test.mjs',
  workflow: '.github/workflows/litteratur-maintenance-integrity.yml',
});

const REPLACEMENTS = Object.freeze({
  sst05: {
    old: 'https://www.cambridge.org/core/books/cambridge-introduction-to-mikhail-bakhtin/A560AC799386659DEA4566526E97C7CC',
    current: 'https://www.cambridge.org/core/books/cambridge-introduction-to-mikhail-bakhtin/3B0C60AF0F735E34E5B5853E2FE02456',
  },
  sst07: {
    old: 'https://www.pearson.com/en-gb/subject-catalog/p/style-in-fiction/P200000004424',
    current: 'https://www.routledge.com/Style-in-Fiction-A-Linguistic-Introduction-to-English-Fictional-Prose/Leech-Short/p/book/9780582784093',
  },
});

const RETAINED = Object.freeze({
  sst01: 'https://www.hup.harvard.edu/books/9780674992125',
  sst02: 'https://press.uchicago.edu/ucp/books/book/chicago/E/bo3770832.html',
  sst03: 'https://press.uchicago.edu/ucp/books/book/chicago/M/bo3637992.html',
  sst04: 'https://press.uchicago.edu/ucp/books/book/chicago/M/bo3774967.html',
  sst06: 'https://utpress.utexas.edu/9780292715349/',
  sst08: 'https://monoskop.org/images/8/84/Jakobson_Roman_1960_Closing_statement_Linguistics_and_Poetics.pdf',
  sst09: 'https://www.gutenberg.org/ebooks/158',
  sst10: 'https://www.gutenberg.org/ebooks/1080',
  sst11: 'https://www.gutenberg.org/ebooks/23',
  sst12: 'https://www.penguinrandomhouse.com/books/117649/jazz-by-toni-morrison/',
});

const abs = (f) => path.join(ROOT, f);
const readJson = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const writeJson = (f, v) => fs.writeFileSync(abs(f), `${JSON.stringify(v, null, 2)}\n`);
const readText = (f) => fs.readFileSync(abs(f), 'utf8');
const writeText = (f, v) => fs.writeFileSync(abs(f), v);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const count = (text, needle) => text.split(needle).length - 1;

function ensureTextReplacement(file, oldUrl, newUrl) {
  let text = readText(file);
  const oldCount = count(text, oldUrl);
  if (oldCount > 0) {
    text = text.split(oldUrl).join(newUrl);
    writeText(file, text);
  }
  const current = readText(file);
  assert(!current.includes(oldUrl), `${file}: stale URL remains: ${oldUrl}`);
  assert(current.includes(newUrl), `${file}: current URL missing: ${newUrl}`);
  return oldCount;
}

function updateClaims() {
  const claims = readJson(P.claims);
  assert(claims.chapter_id === AREA, 'Round 3 claims chapter mismatch');
  assert(Array.isArray(claims.sources) && claims.sources.length === 12, 'Round 3 claims must retain 12 sources');
  const byId = new Map(claims.sources.map((source) => [source.id, source]));
  for (const [id, urls] of Object.entries(REPLACEMENTS)) {
    const source = byId.get(id);
    assert(source, `Missing ${id} in claims`);
    assert(source.url === urls.old || source.url === urls.current, `${id}: unexpected pre-materialization URL`);
    source.url = urls.current;
  }
  for (const [id, url] of Object.entries(RETAINED)) {
    assert(byId.get(id)?.url === url, `${id}: retained URL drifted before round 3`);
  }
  writeJson(P.claims, claims);
}

function updatePathway() {
  const before = readText(P.pathway);
  const changedCounts = {};
  for (const [id, urls] of Object.entries(REPLACEMENTS)) {
    changedCounts[id] = ensureTextReplacement(P.pathway, urls.old, urls.current);
  }
  const pathway = readJson(P.pathway);
  assert(pathway.schema === 'history_go_subject_pathway_package_v1' && pathway.subject_id === 'litteratur', 'Pathway identity drift');
  assert(pathway.sources.length === 384 && new Set(pathway.sources.map((x) => x.source_id)).size === 384, 'Pathway 384-source invariant drifted');
  assert(pathway.sets.length === 28, 'Pathway 28-area invariant drifted');
  const articleIds = pathway.sets.flatMap((set) => set.article_ids || []);
  assert(articleIds.length === 168 && new Set(articleIds).size === 168, 'Pathway 168-article invariant drifted');
  for (const [id, urls] of Object.entries(REPLACEMENTS)) {
    const sourceId = `src_lit_${AREA}_${id}`;
    assert(pathway.sources.find((x) => x.source_id === sourceId)?.url === urls.current, `${id}: root pathway source not updated`);
  }
  return { changedCounts, changed: before !== readText(P.pathway) };
}

function writeEvidence(pathwayCounts) {
  const sourceChecks = [
    { claims_source_id: 'sst01', title: 'The Art of Rhetoric', publisher: 'Harvard University Press / Loeb Classical Library', verification_state: 'retained_fail_closed_no_authoritative_replacement', canonical_url: RETAINED.sst01, evidence: 'The existing canonical publisher URL is retained because this maintenance pass did not verify an exact authoritative successor for the same source identity.', action: 'retain_until_authoritative_replacement_is_verified' },
    { claims_source_id: 'sst02', title: 'The Essential Wayne Booth', publisher: 'University of Chicago Press', verification_state: 'verified_live', canonical_url: RETAINED.sst02, evidence: 'The canonical University of Chicago Press source remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst03', title: 'Metaphors We Live By', publisher: 'University of Chicago Press', verification_state: 'verified_live', canonical_url: RETAINED.sst03, evidence: 'The canonical University of Chicago Press source remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst04', title: 'More than Cool Reason', publisher: 'University of Chicago Press', verification_state: 'verified_live', canonical_url: RETAINED.sst04, evidence: 'The canonical University of Chicago Press source remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst05', title: 'The Cambridge Introduction to Mikhail Bakhtin', publisher: 'Cambridge University Press', verification_state: 'verified_authoritative_replacement', old_url: REPLACEMENTS.sst05.old, canonical_url: REPLACEMENTS.sst05.current, evidence: 'Cambridge Core currently identifies the replacement page as Ken Hirschkop’s The Cambridge Introduction to Mikhail Bakhtin and exposes DOI 10.1017/9781108164641.', action: 'replace_canonical_url' },
    { claims_source_id: 'sst06', title: 'The Dialogic Imagination', publisher: 'University of Texas Press', verification_state: 'verified_live', canonical_url: RETAINED.sst06, evidence: 'The canonical University of Texas Press source remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst07', title: 'Style in Fiction', publisher: 'Routledge', verification_state: 'verified_authoritative_replacement', old_url: REPLACEMENTS.sst07.old, canonical_url: REPLACEMENTS.sst07.current, evidence: 'Routledge currently identifies the replacement product page as Style in Fiction, second edition, by Geoffrey Leech and Mick Short, ISBN 9780582784093.', action: 'replace_canonical_url' },
    { claims_source_id: 'sst08', title: 'Linguistics and Poetics', publisher: 'MIT Press / archived full-text host', verification_state: 'retained_fail_closed_no_authoritative_replacement', canonical_url: RETAINED.sst08, evidence: 'The existing canonical full-text endpoint is retained because this maintenance pass did not verify an exact authoritative replacement for the same text.', action: 'retain_until_authoritative_replacement_is_verified' },
    { claims_source_id: 'sst09', title: 'Emma', publisher: 'Project Gutenberg', verification_state: 'verified_live', canonical_url: RETAINED.sst09, evidence: 'Project Gutenberg ebook 158 remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst10', title: 'A Modest Proposal', publisher: 'Project Gutenberg', verification_state: 'verified_live', canonical_url: RETAINED.sst10, evidence: 'Project Gutenberg ebook 1080 remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst11', title: 'Narrative of the Life of Frederick Douglass', publisher: 'Project Gutenberg', verification_state: 'verified_live', canonical_url: RETAINED.sst11, evidence: 'Project Gutenberg ebook 23 remained live during the round-3 source check.', action: 'retain_canonical_url' },
    { claims_source_id: 'sst12', title: 'Jazz', publisher: 'Penguin Random House', verification_state: 'verified_live_redirect_same_resource', canonical_url: RETAINED.sst12, evidence: 'The canonical Penguin Random House URL remained resolvable to the same Toni Morrison Jazz resource during the round-3 source check.', action: 'retain_canonical_url' },
  ];
  const evidence = {
    schema: 'history_go_litteratur_maintenance_source_refresh_v1', version: '1.0.0', subject_id: 'litteratur',
    round_id: 'source_refresh_round3_2026_09_05', baseline_main_sha: BASELINE, checked_at: '2026-09-05', status: 'verified',
    scope: { area_id: AREA, canonical_source_mutation: true, new_strict_subcategory: false, place_production: false, maintenance_evidence_only: false, replacement_policy: 'replace_only_when_same-resource_or_authoritative_successor_url_is_verified' },
    source_checks: sourceChecks,
    materialization: { pathway_old_url_occurrences_replaced: pathwayCounts },
    summary: { canonical_sources_checked: 12, verified_live: 7, verified_live_redirected_same_resource: 1, verified_authoritative_replacement: 2, retained_fail_closed_no_authoritative_replacement: 2, canonical_url_replacements: 2 },
    quality_gates: { all_12_area_sources_accounted_for: true, two_authoritative_replacements_materialized: true, replacement_identity_preserved: true, uncertain_endpoints_not_auto_replaced: true, canonical_source_ids_preserved: true, pathway_source_count_preserved: true, claim_provenance_scope_unchanged: true, theory_integrity_scope_unchanged: true, canonical_subject_architecture_unchanged: true, completion_status_preserved: true, knowledge_provenance_checked_source_id_aware: true },
  };
  fs.mkdirSync(path.dirname(abs(P.evidence)), { recursive: true });
  writeJson(P.evidence, evidence);
}

const auditText = `#!/usr/bin/env node\nimport fs from 'node:fs';\nimport path from 'node:path';\nimport { fileURLToPath } from 'node:url';\n\nconst ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');\nconst P={evidence:'data/fagverk/litteratur/maintenance/source-refresh-round3-2026-09-05.json',round1:'data/fagverk/litteratur/maintenance/source-refresh-round1-2026-09-04.json',round2:'data/fagverk/litteratur/maintenance/source-refresh-round2-2026-09-05.json',claims:'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/sprak_stil_retorikk/claims.json',materializer:'scripts/materialize-litteratur-poetics-style-v1.mjs',pathway:'data/quiz/litteratur/litteratur_subject_pathways_v1.json',knowledge:'data/knowledge/subjects/litteratur/knowledge_units.generated.json',coverage:'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',status:'data/fagverk/subject_status.json'};\nconst BASELINE='${BASELINE}'; const AREA='${AREA}';\nconst REPL=${JSON.stringify(REPLACEMENTS)};\nconst RET=${JSON.stringify(RETAINED)};\nconst read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')); const text=f=>fs.readFileSync(path.join(ROOT,f),'utf8'); const assert=(c,m)=>{if(!c)throw new Error(m)}; const countBy=(xs,k)=>xs.filter(x=>x.verification_state===k).length; const sid=id=>\`src_lit_\${AREA}_\${id}\`;\nexport function auditLitteraturMaintenanceSourceRefreshRound3(){\n const evidence=read(P.evidence),r1=read(P.round1),r2=read(P.round2),claims=read(P.claims),pathway=read(P.pathway),knowledge=read(P.knowledge),coverage=read(P.coverage),materializer=text(P.materializer),status=read(P.status).subjects.find(x=>x.id==='litteratur');\n assert(evidence.schema==='history_go_litteratur_maintenance_source_refresh_v1'&&evidence.round_id==='source_refresh_round3_2026_09_05','Feil round-3 identitet'); assert(evidence.baseline_main_sha===BASELINE,'Round 3 baseline mismatch'); assert(evidence.checked_at==='2026-09-05'&&evidence.status==='verified','Round 3 mangler verifisert datostatus'); assert(evidence.scope?.area_id===AREA&&evidence.scope?.canonical_source_mutation===true,'Round 3 scope mismatch'); assert(evidence.scope?.new_strict_subcategory===false&&evidence.scope?.place_production===false,'Round 3 har utvidet scope');\n assert(r1.scope?.area_id==='faggrunnlag_metode_forskningspraksis'&&r2.scope?.area_id==='poetikk_estetikk_litteraritet','Tidligere maintenance-runder mangler');\n assert(Array.isArray(evidence.source_checks)&&evidence.source_checks.length===12&&new Set(evidence.source_checks.map(x=>x.claims_source_id)).size===12,'Round 3 må ha 12 unike kildekontroller'); assert(claims.chapter_id===AREA&&claims.sources.length===12&&new Set(claims.sources.map(x=>x.id)).size===12,'Språk/stil-claims må ha 12 unike kilder');\n const expected=[...Object.keys(REPL),...Object.keys(RET)].sort(); assert(JSON.stringify(claims.sources.map(x=>x.id).sort())===JSON.stringify(expected),'Canonical source-ID-settet er endret'); assert(JSON.stringify(evidence.source_checks.map(x=>x.claims_source_id).sort())===JSON.stringify(expected),'Evidensen dekker ikke eksakt source-ID-sett');\n assert(pathway.schema==='history_go_subject_pathway_package_v1'&&pathway.subject_id==='litteratur','Pathway-identitet feil'); assert(pathway.sources.length===384&&new Set(pathway.sources.map(x=>x.source_id)).size===384,'Pathway må ha 384 unike kilder'); assert(pathway.sets.length===28,'Pathway må ha 28 områder'); const articleIds=pathway.sets.flatMap(s=>s.article_ids||[]); assert(articleIds.length===168&&new Set(articleIds).size===168,'Pathway må dekke 168 artikler eksakt én gang'); assert(coverage.completion_definition?.required_area_count===28&&coverage.completion_definition?.required_topic_count===168,'Coverage 28/168-baseline flyttet');\n assert(knowledge.schema==='history_go_knowledge_unit_registry_v1'&&knowledge.subject_id==='litteratur'&&Array.isArray(knowledge.units)&&knowledge.units.length>0,'Generert Litteratur-Knowledge identitet feil');\n const cb=new Map(claims.sources.map(x=>[x.id,x])),eb=new Map(evidence.source_checks.map(x=>[x.claims_source_id,x])),pb=new Map(pathway.sources.map(x=>[x.source_id,x])); const ks=knowledge.units.flatMap(u=>Array.isArray(u.sources)?u.sources:[]); const canonicalCorpus=JSON.stringify(claims)+'\\n'+JSON.stringify(pathway)+'\\n'+materializer; const knowledgeCorpus=JSON.stringify(knowledge);\n for(const [id,urls] of Object.entries(REPL)){const c=cb.get(id),e=eb.get(id),p=pb.get(sid(id)); assert(c?.url===urls.current,\`\${id}: claims mangler current URL\`); assert(e?.verification_state==='verified_authoritative_replacement'&&e?.old_url===urls.old&&e?.canonical_url===urls.current&&e?.action==='replace_canonical_url',\`\${id}: replacement-evidens feil\`); assert(p?.url===urls.current,\`\${id}: pathway root source mangler current URL\`); assert(materializer.includes(urls.current),\`\${id}: materializer mangler current URL\`); assert(!canonicalCorpus.includes(urls.old),\`\${id}: gammel URL finnes i canonical/materialized flater\`); assert(!knowledgeCorpus.includes(urls.old),\`\${id}: gammel URL finnes i Knowledge\`); const materialized=ks.filter(s=>s?.source_id===sid(id)); assert(materialized.every(s=>s?.url===urls.current),\`\${id}: Knowledge-materialisering bruker ikke current URL\`);}\n for(const [id,url] of Object.entries(RET)){const c=cb.get(id),e=eb.get(id),p=pb.get(sid(id)); assert(c?.url===url&&e?.canonical_url===url&&p?.url===url,\`\${id}: retained URL drift\`); assert(e?.action==='retain_canonical_url'||e?.action==='retain_until_authoritative_replacement_is_verified',\`\${id}: ugyldig retain-action\`);}\n assert(countBy(evidence.source_checks,'verified_authoritative_replacement')===2,'Round 3 skal ha to replacements'); assert(countBy(evidence.source_checks,'verified_live')===7,'Round 3 skal ha sju direkte live-retentions'); assert(countBy(evidence.source_checks,'verified_live_redirect_same_resource')===1,'Round 3 skal ha én redirect-retention'); assert(countBy(evidence.source_checks,'retained_fail_closed_no_authoritative_replacement')===2,'Round 3 skal ha to fail-closed retentions'); assert(evidence.summary?.canonical_sources_checked===12&&evidence.summary?.canonical_url_replacements===2,'Round 3 summary feil'); assert(Object.values(evidence.quality_gates||{}).length===11&&Object.values(evidence.quality_gates).every(Boolean),'Alle elleve round-3 quality gates må være sanne');\n assert(status?.navigationStatus==='materialized'&&status?.assessmentStatus==='audited'&&status?.editorialStatus==='complete'&&status?.nextGate==='maintenance_and_source_refresh','Litteratur completion-status driftet');\n return {status:'passed',round:3,area_id:AREA,sources_checked:12,authoritative_replacements:2,retained_without_guessing:2,pathway_sources:pathway.sources.length,knowledge_units:knowledge.units.length,canonical_areas:pathway.sets.length,assessed_articles:new Set(articleIds).size,maintained_areas_total:new Set([r1.scope.area_id,r2.scope.area_id,evidence.scope.area_id]).size,next_gate:status.nextGate};}\nif(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const r=auditLitteraturMaintenanceSourceRefreshRound3();console.log(\`Litteratur maintenance round 3 OK: \${r.sources_checked}/12 kilder, \${r.authoritative_replacements} autoritative URL-erstatninger, \${r.retained_without_guessing} fail-closed retentions, \${r.pathway_sources} pathway-kilder, \${r.knowledge_units} Knowledge units og \${r.maintained_areas_total}/28 områder vedlikeholdt.\`)}catch(error){console.error(\`Litteratur maintenance round 3 FEIL: \${error.message}\`);process.exitCode=1;}}\n`;

const testText = `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { auditLitteraturMaintenanceSourceRefreshRound3 } from '../scripts/audit-litteratur-maintenance-source-refresh-round3.mjs';\n\ntest('Litteratur maintenance round 3 refreshes language style rhetoric sources without widening scope',()=>{const r=auditLitteraturMaintenanceSourceRefreshRound3();assert.equal(r.status,'passed');assert.equal(r.round,3);assert.equal(r.area_id,'sprak_stil_retorikk');assert.equal(r.sources_checked,12);assert.equal(r.authoritative_replacements,2);assert.equal(r.retained_without_guessing,2);assert.equal(r.pathway_sources,384);assert.equal(r.canonical_areas,28);assert.equal(r.assessed_articles,168);assert.equal(r.maintained_areas_total,3);assert.equal(r.next_gate,'maintenance_and_source_refresh');});\n`;

function updatePermanentWorkflow() {
  let w = readText(P.workflow);
  const additions = [
    ["      - 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/poetikk_estetikk_litteraritet/claims.json'", "      - 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/poetikk_estetikk_litteraritet/claims.json'\n      - 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/sprak_stil_retorikk/claims.json'"],
    ["      - 'scripts/audit-litteratur-maintenance-source-refresh-round2.mjs'", "      - 'scripts/audit-litteratur-maintenance-source-refresh-round2.mjs'\n      - 'scripts/audit-litteratur-maintenance-source-refresh-round3.mjs'"],
    ["      - 'tests/litteratur-maintenance-source-refresh-round2.test.mjs'", "      - 'tests/litteratur-maintenance-source-refresh-round2.test.mjs'\n      - 'tests/litteratur-maintenance-source-refresh-round3.test.mjs'"],
  ];
  for (const [needle, replacement] of additions) if (!w.includes(replacement.split('\n').at(-1))) { assert(w.includes(needle), `Workflow insertion point missing: ${needle}`); w = w.replace(needle, replacement); }
  const step = `      - name: Audit Litteratur source refresh round 3\n        run: |\n          node --check scripts/audit-litteratur-maintenance-source-refresh-round3.mjs\n          node scripts/audit-litteratur-maintenance-source-refresh-round3.mjs\n          node --test tests/litteratur-maintenance-source-refresh-round3.test.mjs\n`;
  if (!w.includes('Audit Litteratur source refresh round 3')) {
    const marker = '      - name: Preserve Litteratur assessment and theory integrity\n';
    assert(w.includes(marker), 'Workflow preserve marker missing');
    w = w.replace(marker, `${step}${marker}`);
  }
  writeText(P.workflow, w);
}

updateClaims();
for (const urls of Object.values(REPLACEMENTS)) ensureTextReplacement(P.materializer, urls.old, urls.current);
const pathwayResult = updatePathway();
writeEvidence(pathwayResult.changedCounts);
writeText(P.audit, auditText);
writeText(P.test, testText);
updatePermanentWorkflow();

execFileSync('npm', ['run', 'knowledge:canonical:write'], { cwd: ROOT, stdio: 'inherit' });
execFileSync('npm', ['run', 'knowledge:canonical:check'], { cwd: ROOT, stdio: 'inherit' });
execFileSync('node', ['scripts/build-fagverk-release-manifest.mjs'], { cwd: ROOT, stdio: 'inherit' });
execFileSync('node', ['scripts/build-fagverk-release-manifest.mjs', '--check'], { cwd: ROOT, stdio: 'inherit' });
execFileSync('node', ['--check', P.audit], { cwd: ROOT, stdio: 'inherit' });
execFileSync('node', [P.audit], { cwd: ROOT, stdio: 'inherit' });
execFileSync('node', ['--test', P.test], { cwd: ROOT, stdio: 'inherit' });

const allowed = new Set([
  P.claims, P.pathway, P.materializer, P.knowledge, P.evidence, P.audit, P.test, P.workflow,
  'data/fagverk/fagverk_release.json',
  'scripts/tmp-materialize-litteratur-maintenance-round3.mjs',
  '.github/workflows/tmp-litteratur-round3-materialize.yml',
]);
const status = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
for (const line of status) {
  const file = line.slice(3).trim().replace(/^"|"$/g, '');
  if (!allowed.has(file)) throw new Error(`Unexpected generator drift: ${file}`);
}
console.log('Round 3 controlled materialization complete.');
