import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Read-only inventory of the production starting point. No factual or UI approval.
const placeId = 'det_norske_teatret';
const source = 'data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json';
const output = 'reports/place-production/det-norske-teatret/20261013/baseline.json';
const inputs = new Map();
const read = file => {
  const text = fs.readFileSync(file, 'utf8');
  inputs.set(file, crypto.createHash('sha256').update(text).digest('hex'));
  return JSON.parse(text);
};
const resolve = file => file.startsWith('data/') ? file : `data/${file}`;
const rows = value => Array.isArray(value) ? value : value.people || value.items || [value];
const place = read(source);
const placesManifest = read('data/places/manifest.json');
const peopleManifest = read('data/people/manifest.json');
const people = [];
for (const file of peopleManifest.files) {
  const resolved = resolve(file);
  const raw = fs.readFileSync(resolved, 'utf8');
  if (!raw.includes(placeId)) continue;
  for (const person of rows(read(resolved))) {
    if (person.placeId !== placeId && !(person.places || []).includes(placeId) && !(person.place_ids || []).includes(placeId)) continue;
    people.push({ id: person.id, name: person.name, source: resolved, category: person.category,
      image: person.image || '', relationship_review: 'NOT_FACTUALLY_REVIEWED',
      image_review: person.image ? 'NOT_VISUALLY_REVIEWED' : 'MISSING_IMAGE_FIELD' });
  }
}
people.sort((a,b) => a.id.localeCompare(b.id, 'en'));
const quizFile = 'data/quiz/musikk/det_norske_teatret_sets_merged.json';
const quiz = read(quizFile);
const quizManifest = read('data/quiz/manifest.json');
const questions = quiz.sets.flatMap(set => set.questions);
const metaQuestions = new Set([6,24,29,30].map(n => `${placeId}_quiz_${n}`));
const index = read('data/places/places_index.json');
const indexedPlace = rows(index).find(p => p.id === placeId);
const epokes = read('data/epoker/epoke-place-index.json');
const epokeText = JSON.stringify(epokes);
const storyFile = 'data/stories/stories_det_norske_teatret.json';
const stories = read(storyFile);
const trackedAssets = execFileSync('git',['ls-tree','-r','--name-only','HEAD','bilder'],{encoding:'utf8'}).trim().split('\n');
const portraitCount = people.filter(p => p.image).length;
const ids = people.map(p => p.id);
const report = {
  schema: 'history_go_place_baseline_audit_v1', place_id: placeId,
  reference_commit: 'd7eb68ab50d4e3e1cc5390149d64cba433cd096b',
  scope: 'Static inventory only; relationships, image identity, runtime and UI are not approved by this audit.',
  identity: { source, manifest_loaded: placesManifest.files.some(f => resolve(f) === source),
    category: place.category, year: place.year, underbadge_ids: place.underbadge_ids || [],
    emne_ids: place.emne_ids || [], address: place.address, coordRole: place.coordRole,
    coordinate_status: 'PRESERVE_EXISTING_METADATA_PENDING_MAP_REVIEW',
    source_index_category_match: indexedPlace?.category === place.category },
  missing_source_fields: ['fagverk','image','frontImage','place_card_profile','externalLinks'].filter(k => !place[k]),
  people: { manifest_loaded_record_count: people.length, unique_id_count: new Set(ids).size,
    duplicate_ids: [...new Set(ids.filter((id,i) => ids.indexOf(id) !== i))],
    records_with_nonempty_image: portraitCount, records_without_image: people.length - portraitCount,
    priority_files_by_place: peopleManifest.priorityFilesByPlace?.[placeId] || [], records: people },
  quiz: { source: quizFile, category: quiz.categoryId, place_category: place.category,
    set_count: quiz.sets.length, question_count: questions.length,
    question_counts_per_set: quiz.sets.map(s => s.questions.length),
    answer_index_counts: Object.fromEntries([...new Set(questions.map(q => q.answerIndex))].map(i => [i, questions.filter(q => q.answerIndex === i).length])),
    question_ids_unique: new Set(questions.map(q => q.id)).size === questions.length,
    manifest_set_entries: quizManifest.sets.filter(s => s.targetId === placeId),
    questions: questions.map(q => ({ id: q.id, question: q.question,
      answerIndex: q.answerIndex, primary_knowledge_unit_id: q.primary_knowledge_unit_id || null,
      knowledge_unit_ids: q.knowledge_unit_ids || [],
      disposition: metaQuestions.has(q.id) ? 'REWRITE_METAFRAMING_AFTER_SOURCE_REVIEW' : 'REVIEW_AND_PRESERVE_DOCUMENTED_FACTS',
      sources: q.source || [] })),
    migration: 'Separate source-led Scenekunst quiz revision; preserve IDs and Knowledge links where valid. Exact future set count is not selected.' },
  stories: rows(stories).map(s => ({ id: s.id, year: s.year, place_id: s.place_id,
    disposition: 'REVIEW_PHYSICAL_OWNER_1913_BONDERNES_HUS_NOT_1985_BUILDING' })),
  epoke: { existing_story_id_present: epokeText.includes('st_det_norske_teatret_teaterstriden_1913'),
    disposition: 'REVIEW_1913_INSTITUTION_CONTEXT_AND_MATERIALIZE_VERIFIED_BUILDING_DATES' },
  translations: ['en','es','pt'].map(lang => {
    const value = read(`data/i18n/content/places/${lang}.json`)[placeId];
    return { language:lang, exists:Boolean(value), source_hash:value?._sourceHash || null,
      disposition:'REFRESH_WITH_NEW_CANONICAL_TEXT_AND_REAL_SOURCE_HASH' };
  }),
  tracked_place_named_assets: trackedAssets.filter(f => /det.?norske.?teatr/i.test(f)),
  image_candidate: 'data/places/place_image_candidates.json: needs_review, legacy Musikk/source/coordinate metadata; not approved',
  ui: { status:'NOT_VERIFIED_BY_STATIC_AUDIT', required:['PlaceCard','Fagverk','People popup','QuizCard flip','visit/quiz separation','mobile and desktop layout'] },
  input_hashes: Object.fromEntries([...inputs].sort(([a],[b]) => a.localeCompare(b,'en')))
};
const text = `${JSON.stringify(report,null,2)}\n`;
if (process.argv.includes('--check')) {
  if (fs.readFileSync(output,'utf8') !== text) throw new Error('Baseline differs from current source inputs; inspect changes rather than silently updating the dated snapshot.');
} else {
  fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,text);
}
console.log(JSON.stringify({ people:people.length, portraits:portraitCount, quiz_sets:quiz.sets.length,
  questions:questions.length, counts:quiz.sets.map(s=>s.questions.length), output, check:process.argv.includes('--check') }));
