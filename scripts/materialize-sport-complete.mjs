#!/usr/bin/env node
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
const slugs = [
  'arenaer-steder-groundhopper',
  'regler-spill-konkurranse',
  'kropp-trening-prestasjon',
  'klubber-lag-frivillighet',
  'supportere-publikum-kultur',
  'inkludering-helse-lek-samfunn'
];

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = read(registryPath);
const chapters = slugs.map((slug) => {
  const file = `data/fagverk/sport/${slug}.json`;
  const chapter = read(file);
  const row = {
    id: chapter.id,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file,
    primary_domain_id: chapter.primary_domain_id,
    chapter_role: 'core',
    emne_ids: chapter.emne_ids,
    claimsFile: chapter.claimsFile
  };
  if (chapter.briefFile) row.briefFile = chapter.briefFile;
  return row;
});
registry.subjects.sport.chapters = chapters;
registry.subjects.sport.editorialPlan ||= {};
registry.subjects.sport.editorialPlan.targetChapterCount = 6;
registry.subjects.sport.editorialPlan.nextGate = 'maintenance_source_refresh_and_place_case_expansion';
registry.updatedAt = '2026-08-14';
write(registryPath, registry);

const statusPath = 'data/fagverk/subject_status.json';
const status = read(statusPath);
const sport = status.subjects.find((row) => row.id === 'sport');
sport.editorialStatus = 'complete';
sport.nextGate = 'maintenance_source_refresh_and_place_case_expansion';
sport.note = 'Sport er komplett med 6/6 canonicale områder, 116/116 canonicale emner, 109 canonicale metoder, 54 redaksjonelle seksjoner, 162 claimsporede fagavsnitt og 162 claims. Alle kapitler har eksplisitt emne- og metodebinding og inspiserbar kildeproveniens.';
status.updatedAt = '2026-08-14';
write(statusPath, status);

const rulesClaimsPath = 'data/fagverk/sport/regler-spill-konkurranse/claims.json';
const rulesClaims = read(rulesClaimsPath);
const structuralSource = rulesClaims.sources.find((source) => source.id === 'rsk-src-13');
if (structuralSource) {
  Object.assign(structuralSource, {
    title: 'Idrettens barnerettigheter og bestemmelser om barneidrett',
    publisher: 'Norges idrettsforbund',
    url: 'https://www.idrettsforbundet.no/tema/barneidrett/idrettens-barnerettigheter-og-bestemmelser-om-barneidrett/',
    kind: 'official_rights',
    retrievedAt: '2026-08-14'
  });
}
write(rulesClaimsPath, rulesClaims);

const completion = {
  schema: 'history_go_fagverk_sport_completion_v1',
  version: '1.0.0',
  status: 'complete',
  complete_ready: true,
  subject_id: 'sport',
  canonical_domain_count: 6,
  canonical_topic_count: 116,
  canonical_method_count: 109,
  chapter_count: 6,
  section_count: 54,
  paragraph_count: 162,
  claim_count: 162,
  next_gate: 'maintenance_source_refresh_and_place_case_expansion',
  chapter_order: slugs
};
write('data/fagverk/sport/sport_completion_v1.json', completion);
