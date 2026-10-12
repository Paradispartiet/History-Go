'use strict';
// Editorial-only integrity checks for Civication role-first Story Symposia.
// No runtime or content mutation. Included automatically by run-civication-tests.mjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const exists = p => fs.existsSync(path.join(root, p));
const prefix = 'data/Civication/lifestory/editorial/symposia/';
const index = load(prefix + 'indexV1.json');
const cast = load(prefix + 'charactersV1.json');
const formal = load(prefix + 'formalRolesV1.json');
const positions = [
 ...load(prefix + 'lifePositions01V1.json').positions,
 ...load(prefix + 'lifePositions02V1.json').positions
];
const chapters = [
 ...load(prefix + 'chapters01V1.json').chapters,
 ...load(prefix + 'chapters02V1.json').chapters,
 ...load(prefix + 'chapters03V1.json').chapters
];
const architecture = load('data/Civication/lifestory/editorial/roleFirstStoryArchitectureV1.json');
const manifest = load('data/Civication/lifestory/manifest.json');
const unemployed = load('data/Civication/lifestory/roles/arbeidsledig/role.json');
const literary = load('data/Civication/lifestory/editorial/narrativeCrosswalkV1.json');
const byId = rows => new Map(rows.map(row => [row.id || row.role_id || row.chapter_id, row]));
const indexChapters = byId(index.chapters);
const roleDocs = byId(formal.roles);
const positionDocs = byId(positions);
const chapterDocs = byId(chapters);
const unique = (rows, field) => assert.equal(new Set(rows.map(x => x[field])).size, rows.length, 'duplicate ' + field);
function sameSet(a, b, label) { assert.deepEqual([...new Set(a)].sort(), [...new Set(b)].sort(), label); }

assert.equal(index.schema, 'civication_symposium_catalog_v1');
assert.equal(index.counts.formal_roles, 15);
assert.equal(index.counts.life_positions, 21);
assert.equal(index.counts.continuation_chapters, 45);
assert.equal(index.counts.literary_tracks, 24);
assert.equal(index.counts.basic_plot_lenses, 7);
assert.equal(index.counts.contemporary_story_types, 24);
assert.equal(index.noGameplayEffects, undefined, 'an editorial index must not masquerade as an executable manifest');
sameSet(index.formal_roles.map(r => r.id), architecture.formalRoles.map(r => r.id), 'formal role coverage');
sameSet(index.life_positions.map(r => r.id), architecture.lifePositions.map(r => r.id), 'life position coverage');
sameSet(index.chapters.map(r => r.id), unemployed.symposium.fortsettelser.map(r => r.id), 'chapter coverage');
sameSet(formal.roles.map(r => r.role_id), index.formal_roles.map(r => r.id), 'formal symposia coverage');
sameSet(positions.map(r => r.role_id), index.life_positions.map(r => r.id), 'life symposia coverage');
sameSet(chapters.map(r => r.chapter_id), index.chapters.map(r => r.id), 'chapter symposia coverage');
unique(formal.roles, 'role_id');
unique(positions, 'role_id');
unique(chapters, 'chapter_id');
for (const p of Object.values(index.parts)) {
 if (typeof p === 'string' && p.startsWith('data/')) assert.ok(exists(p), 'missing index source ' + p);
 if (Array.isArray(p)) for (const f of p) assert.ok(exists(f), 'missing indexed part ' + f);
}
const validPlot = new Set(literary.sevenPlotModels.map(x => x.id));
const validLiterary = new Set(literary.literaryTracks.map(x => x.id));
const validContemporary = new Set(literary.contemporaryTypes.map(x => x.id));
for (const record of [...index.formal_roles, ...index.life_positions]) {
 assert.ok(validPlot.has(record.plot) && validLiterary.has(record.literary) && validContemporary.has(record.contemporary), 'unregistered literary reference ' + record.id);
}
for (const record of index.formal_roles) {
 const source = manifest.roles[record.id];
 const doc = roleDocs.get(record.id);
 assert.ok(source && doc, 'missing formal role ' + record.id);
 assert.equal(record.source, source.role);
 assert.equal(record.scene_source, source.scenes);
 assert.ok(exists(source.scenes) && exists(source.threads));
 const role = load(source.role);
 assert.equal(doc.authority.role_file, source.role);
 assert.equal(role.id, record.id);
 sameSet(doc.civication_cast.map(x => x.local_id), (role.personer || []).map(x => x.id), 'cast for ' + record.id);
 assert.ok(doc.symposium.protagonist && doc.symposium.central_question);
}
for (const position of index.life_positions) {
 const doc = positionDocs.get(position.id);
 assert.ok(doc, 'missing symposium for ' + position.id);
 assert.equal(doc.authority.role_world, position.world);
 assert.ok(exists(position.world), 'missing role world ' + position.id);
 assert.ok(exists(position.stream), 'missing narrative stream ' + position.id);
 assert.equal(doc.symposium.plot.id, position.plot);
 assert.equal(doc.symposium.literary_track.id, position.literary);
 assert.equal(doc.symposium.contemporary_type.id, position.contemporary);
 assert.equal(doc.symposium.season.days, 14);
 assert.equal(doc.symposium.season.beats.length, 56, '14 days × 4 phases must remain documented ' + position.id);
 sameSet(doc.symposium.chapters.map(x => x.id), position.chapter_ids, 'position-to-chapter links for ' + position.id);
 assert.ok(doc.symposium.protagonist.includes('Spilleren'), 'NPC must not become protagonist ' + position.id);
 assert.deepEqual(doc.historical_people.refs, [], 'unreviewed historical associations must not be asserted ' + position.id);
}
const descriptorById = byId(unemployed.symposium.fortsettelser);
const crossRole = [];
let authoredScenes = 0;
for (const chapter of chapters) {
 const id = chapter.chapter_id, indexRecord = indexChapters.get(id), descriptor = descriptorById.get(id);
 assert.ok(indexRecord && descriptor, 'chapter missing canonical descriptor ' + id);
 assert.equal(chapter.role_scope, descriptor.role_scope);
 assert.equal(chapter.source, descriptor.path);
 assert.equal(chapter.after_day, descriptor.etterDag);
 sameSet(chapter.depends_on_chapters, descriptor.etterFortsettelser || [], 'predecessor mismatch ' + id);
 const source = load(descriptor.path);
 assert.equal(source.id, id);
 assert.equal(source.role_scope, descriptor.role_scope);
 const grouped = chapter.symposium.scenes_by_day;
 const synopsis = grouped.flatMap(day => day.scenes);
 assert.equal(chapter.symposium.start_day, descriptor.etterDag + 1, 'incorrect start day ' + id);
 assert.equal(chapter.symposium.end_day, source.sisteDag, 'incorrect end day ' + id);
 sameSet(synopsis.map(s => s.id), source.scenes.map(s => s.id), 'all scene IDs represented ' + id);
 for (const item of synopsis) {
  const authored = source.scenes.find(s => s.id === item.id);
  assert.ok(authored);
  assert.equal(item.phase, authored.fase, 'incorrect phase ' + item.id);
  sameSet(item.choices.map(c => c.id), authored.valg.map(c => c.id), 'all choice IDs represented ' + item.id);
 }
 assert.ok(chapter.symposium.protagonist.startsWith('Spilleren'), 'NPC must not become protagonist ' + id);
 const crossed = chapter.depends_on_chapters.some(previous => descriptorById.get(previous)?.role_scope !== chapter.role_scope);
 assert.equal(chapter.cross_role_predecessor, crossed, 'wrong cross-role flag ' + id);
 if(crossed) crossRole.push(id);
 assert.equal(chapter.quality_gates.roles_do_not_change_on_npc_encounter, true);
 assert.equal(chapter.historical_people.must_not_substitute_for_fictional_cast, true);
 authoredScenes += source.scenes.length;
}
assert.equal(crossRole.length, 21, 'cross-role predecessor cases must be reviewed explicitly');
assert.equal(index.life_positions.filter(x => x.chapter_count > 0).length, 5);
assert.equal(index.life_positions.filter(x => x.chapter_count === 0).length, 16);
const peoplePlan = load(prefix + 'historicalPeoplePlanV1.json');
assert.equal(peoplePlan.schema, 'civication_role_history_people_curation_plan_v1');
assert.equal(peoplePlan.counts.roles, 36);
assert.equal(peoplePlan.counts.verified_links, 0);
assert.equal(peoplePlan.records.length, 36);
sameSet(peoplePlan.records.map(x => x.role_id), [...index.formal_roles, ...index.life_positions].map(x => x.id), 'People planning coverage');
for (const record of peoplePlan.records) {
 assert.deepEqual(record.people_links, [], 'unverified People reference must not be approved');
 assert.ok(exists(record.canonical_role_source));
 sameSet(record.story_chapter_ids, index.life_positions.find(x => x.id === record.role_id)?.chapter_ids || [], 'People planning/story crosswalk');
}
assert.equal(cast.schema, 'civication_story_character_identity_v1');
assert.equal(cast.counts.role_local_cast, 110);
assert.equal(cast.role_local_cast.length, 110);
unique(cast.role_local_cast, 'qualified_id');
for (const actor of cast.role_local_cast) {
 assert.equal(actor.qualified_id, actor.role_id + ':' + actor.local_id, 'missing actor namespace');
 assert.equal(actor.fictional, true);
 assert.equal(actor.role_source, manifest.roles[actor.role_id].role);
}
assert.equal(cast.policy.history_people_never_inherit_fictional_actions, true);
assert.equal(cast.policy.role_changes_from_active_canonical_position_only, true);
const aliases = Object.fromEntries(cast.named_cross_chapter_characters.map(x => [x.narrative_key, x]));
for (const [name, local] of [['mira','mira'],['lea','lea'],['arvid','amir']]) {
 assert.equal(aliases[name].role_person_id, local, 'legacy state key must remain stable');
 assert.equal(aliases[name].role_local_qualified_id, 'arbeidsledig:' + local);
}
assert.equal(aliases.joakim.role_person_id, null);
const pids = new Set(Object.values(load('data/Civication/historyPeople_index.json').categories).flat().map(p => p.id));
for (const c of cast.history_people_legacy_representatives.candidates) assert.ok(pids.has(c.person_id), 'noncanonical History Go People ' + c.person_id);
const localLea = cast.role_local_cast.find(p => p.qualified_id === 'psykolog:pasient');
assert.ok(localLea && localLea.name === 'Lea');
assert.notEqual(localLea.qualified_id, aliases.lea.role_local_qualified_id, 'name collision cannot imply same NPC');
console.log('Civication Symposium index: 15 formal, 21 life, 45 chapters, 110 local actors, '+authoredScenes+' authored scenes indexed, 21 cross-role transitions flagged.');
