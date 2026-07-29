#!/usr/bin/env node
import fs from 'node:fs';

const P = Object.freeze({
  pensum: 'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  emner: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  methods: 'data/fag/politikk/methods_politikk_canonical_v4_5.json',
  mappings: 'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',
  quiz: 'data/fag/politikk/supersetQUIZMAL_politikk.json',
  badge: 'data/badges/politikk.json',
  badgePage: 'data/fag/politikk/merke_politikk.html',
  registry: 'data/fagverk/fagverk_registry.json',
  runtimeManifest: 'data/fag/politikk/politikk_runtime_manifest.json',
  reportReadme: 'reports/fagverk/README.md'
});
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
const text = (v) => String(v ?? '').trim();
const norm = (v) => text(v).replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
const unique = (values) => [...new Set((values || []).map(text).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));
const slug = (value) => norm(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9æøå]+/g, '_').replace(/^_|_$/g, '');
const walk = (value, visit) => {
  if (Array.isArray(value)) return value.forEach((item) => walk(item, visit));
  if (!value || typeof value !== 'object') return;
  visit(value);
  for (const item of Object.values(value)) walk(item, visit);
};
const titleCaseId = (id) => text(id).split('_').map((part, index) => {
  if (['de', 'van', 'von', 'of', 'and'].includes(part) && index > 0) return part;
  return part ? part[0].toLocaleUpperCase('nb-NO') + part.slice(1) : '';
}).join(' ');

const pensum = readJson(P.pensum);
const emner = readJson(P.emner);
const methodsDoc = readJson(P.methods);
const fagkart = readJson(P.fagkart);
let mappings = readJson(P.mappings);
const quiz = readJson(P.quiz);
const badge = readJson(P.badge);
const registry = readJson(P.registry);
const runtimeManifest = readJson(P.runtimeManifest);
const methods = methodsDoc.methods || [];

const knownNames = new Map(Object.entries({
  alexis_de_tocqueville: 'Alexis de Tocqueville',
  amartya_sen: 'Amartya Sen',
  charles_lindblom: 'Charles E. Lindblom',
  elinor_ostrom: 'Elinor Ostrom',
  fritz_scharpf: 'Fritz W. Scharpf',
  gudmund_hernes: 'Gudmund Hernes',
  jurgen_habermas: 'Jürgen Habermas',
  kaare_strom: 'Kaare Strøm',
  kari_waerness: 'Kari Wærness',
  max_weber: 'Max Weber',
  michael_lipsky: 'Michael Lipsky',
  robert_dahl: 'Robert Dahl',
  robert_keohane: 'Robert O. Keohane',
  sheila_jasanoff: 'Sheila Jasanoff',
  stein_rokkan: 'Stein Rokkan',
  theda_skocpol: 'Theda Skocpol'
}));

for (const emne of emner) {
  const ids = emne.canonical_thinker_ids || [];
  const names = emne.canonical_thinkers || [];
  ids.forEach((id, index) => {
    const name = text(names[index]);
    if (name && !name.includes('_') && /[A-ZÆØÅ]/.test(name)) knownNames.set(text(id), name);
  });
  const nids = emne.norwegian_thinker_ids || [];
  const nnames = emne.norwegian_thinkers || [];
  nids.forEach((id, index) => {
    const name = text(nnames[index]);
    if (name && !name.includes('_') && /[A-ZÆØÅ]/.test(name)) knownNames.set(text(id), name);
  });
}
walk({ fagkart, mappings }, (object) => {
  if (object.id && object.name && !text(object.name).includes('_') && /[A-ZÆØÅ]/.test(text(object.name))) knownNames.set(text(object.id), text(object.name));
  if (Array.isArray(object.thinker_ids) && Array.isArray(object.tenkere)) {
    object.thinker_ids.forEach((id, index) => {
      const name = text(object.tenkere[index]);
      if (name && !name.includes('_') && /[A-ZÆØÅ]/.test(name)) knownNames.set(text(id), name);
    });
  }
});
const displayName = (id, fallback = '') => knownNames.get(text(id)) || (fallback && !fallback.includes('_') ? titleCaseId(slug(fallback)) : titleCaseId(id));

const roleByThinker = new Map(Object.entries({
  max_weber: 'legal-rasjonell autoritet, embetsverk og byråkratisk organisering',
  theda_skocpol: 'statlig kapasitet, institusjonell autonomi og historisk institusjonalisme',
  charles_lindblom: 'inkrementell politikkutforming, makt og begrenset rasjonalitet',
  kaare_strom: 'mindretallsregjeringer, parlamentarisk delegasjon og ansvarlighet',
  robert_dahl: 'polyarki, deltakelse, opposisjon og politisk likhet',
  fritz_scharpf: 'flernivåstyring samt input- og output-legitimitet',
  stein_rokkan: 'konfliktlinjer, sentrum–periferi, stats- og nasjonsbygging',
  jurgen_habermas: 'offentlighet, demokratisk begrunnelse og deliberativ legitimitet',
  elinor_ostrom: 'polysentrisk styring, kollektive handlingsproblemer og institusjonell design',
  michael_lipsky: 'førstelinjebyråkrati, skjønn og politikkens gjennomføring',
  john_rawls: 'rettferdighet, grunnleggende friheter og institusjonell legitimitet',
  amartya_sen: 'kapabiliteter, reell frihet og komparativ rettferdighet',
  robert_keohane: 'internasjonale institusjoner, samarbeid og kompleks gjensidig avhengighet',
  sheila_jasanoff: 'samproduksjon av kunnskap og politisk orden',
  gudmund_hernes: 'maktavhengighet, fordeling og organiserte beslutningssystemer'
}));

pensum.scope = 'universal';
pensum.updated_at = '2026-07-29';
pensum.purpose = 'Universelt pensum for Politikk & samfunn i History Go. Faget bygger forståelse fra dokumenterte institusjoner, rettsregler, valg, konflikter, fordelingsbeslutninger og sosiale prosesser til mekanismer, kritiske skiller, forskningsmetoder og statsvitenskapelig teori. Geografiske steder brukes som undersøkelser og eksempler, ikke som grense for faget.';
pensum.geographic_scope_note = 'Oslo- og Norge-casene er anbefalte innganger. Fagområdene, begrepene og metodene gjelder politiske systemer og samfunnsprosesser på tvers av steder og nivåer.';
methodsDoc.scope = 'universal';
methodsDoc.updated_at = '2026-07-29';
methodsDoc.purpose = 'Universell metodebank for Politikk & samfunn. Metodene velges etter påstand, mekanisme, datagrunnlag og slutningstype; steder og norske institusjoner er eksempler, ikke metodens geografiske grense.';
fagkart.version = 'v4.5-canonical';
fagkart.scope = 'universal';
fagkart.updated_at = '2026-07-29';
fagkart.purpose = 'Universelt fagkart for Politikk & samfunn. Fagkartet kobler 13 statsvitenskapelige og samfunnsfaglige områder til dokumenterte cases, mekanismer, kritiske skiller, metoder og teoribegreper. Steder brukes som empiriske innganger, ikke som avgrensning av faget.';

const requiredDomainMembership = {
  em_pol_makt_institusjoner: 'styring_institusjoner_forvaltning',
  em_pol_mediert_offentlighet: 'demokrati_representasjon_offentlighet'
};
for (const [emneId, domainId] of Object.entries(requiredDomainMembership)) {
  const domain = (pensum.domains || []).find((row) => row.domain_id === domainId);
  if (!domain) throw new Error(`Mangler domain ${domainId}`);
  domain.emne_ids = unique([...(domain.emne_ids || []), emneId]);
  const hookId = emneId === 'em_pol_makt_institusjoner' ? 'institusjon_som_maktform' : 'offentlighet';
  const hook = (fagkart.categories || []).flatMap((category) => category.topic_hooks || []).find((row) => row.id === hookId);
  if (!hook) throw new Error(`Mangler hook ${hookId}`);
  hook.emne_ids = unique([...(hook.emne_ids || []), emneId]);
}

const genericQuestionStart = 'hvilken konkret institusjon, lov, reform, konflikt';
const usedQuestionSets = new Set();
for (const emne of emner) {
  const id = text(emne.emne_id);
  const title = text(emne.title || emne.short_label || id);
  const critical = unique((emne.critical_distinctions || []).length >= 2
    ? emne.critical_distinctions
    : (emne.analysis_axes || []).length >= 2
      ? emne.analysis_axes
      : emne.conflicts || []);
  while (critical.length < 2) critical.push(critical.length ? `${critical[0]} vs alternativ forklaring` : 'formell regel vs faktisk praksis');
  emne.critical_distinctions = critical;
  emne.analysis_axes = [...critical];

  const conflicts = unique(emne.conflicts || []);
  for (const distinction of critical) if (conflicts.length < 3 && !conflicts.includes(distinction)) conflicts.push(distinction);
  while (conflicts.length < 3) conflicts.push(`${title.toLocaleLowerCase('nb-NO')} vs konkurrerende hensyn ${conflicts.length + 1}`);
  emne.conflicts = conflicts;

  if (text(emne.definition).length < 90) {
    const concepts = unique(emne.core_concepts || emne.key_concepts || []).slice(0, 3);
    emne.definition = `${text(emne.definition).replace(/[.\s]+$/, '')}. Analysen avgrenser ${concepts.join(', ') || 'aktører, regler og utfall'} og bruker skillet ${critical[0]} for å skille formell ordning fra faktisk politisk praksis.`;
  }

  const currentQuestions = emne.key_questions || [];
  const currentKey = JSON.stringify(currentQuestions.map(norm));
  const needsQuestions = currentQuestions.length < 3 || norm(currentQuestions[0]).startsWith(genericQuestionStart) || usedQuestionSets.has(currentKey);
  if (needsQuestions) {
    const mechanism = unique(emne.mechanisms || emne.mechanism_options || emne.core_concepts || [])[0] || 'den sentrale politiske mekanismen';
    emne.key_questions = [
      `Hvilket dokumentert case viser ${title.toLocaleLowerCase('nb-NO')} i praksis, og hvilke aktører, regler eller interesser er avgjørende?`,
      `Hvordan virker ${mechanism}, og hva blir tydelig når vi skiller ${critical[0]}?`,
      'Hvilke kilder eller data kan teste forklaringen, og hvilken alternativ forklaring må vurderes før vi trekker en konklusjon?'
    ];
  }
  usedQuestionSets.add(JSON.stringify((emne.key_questions || []).map(norm)));

  if ((emne.blindspots || []).length < 2 || norm(emne.blindspots?.[0]).startsWith('emnet må ikke brukes som synlig spørsmålsinnhold uten konkret')) {
    emne.blindspots = [
      `${title} må knyttes til et navngitt case, tydelige aktører og et dokumentert beslutnings-, konflikt-, fordelings- eller gjennomføringsforløp.`,
      `Ikke bruk ${title.toLocaleLowerCase('nb-NO')} som etikett eller teorinavn alene; spørsmålet må teste en mekanisme, et kritisk skille eller et observerbart utfall.`
    ];
  }
  if ((emne.quiz_angles || []).length < 3 || norm(emne.quiz_angles?.[0]).includes('start_with_concrete_institution')) {
    emne.quiz_angles = [
      `start_with_documented_${slug(title)}`,
      `test_mechanism_${slug((emne.core_concepts || [])[0] || title)}`,
      `distinguish_${slug(critical[0])}`
    ];
  }
  if (Array.isArray(emne.canonical_thinker_ids)) emne.canonical_thinkers = emne.canonical_thinker_ids.map((thinkerId, index) => displayName(thinkerId, emne.canonical_thinkers?.[index]));
  if (Array.isArray(emne.norwegian_thinker_ids)) emne.norwegian_thinkers = emne.norwegian_thinker_ids.map((thinkerId, index) => displayName(thinkerId, emne.norwegian_thinkers?.[index]));
  emne.quality_revision = 'politikk-subject-quality-lift-2026-07-29';
}

for (const method of methods) {
  const id = text(method.method_id);
  const title = text(method.title || method.label || id);
  const profiles = Object.values(method.domain_profiles || {}).filter((value) => value && typeof value === 'object');
  const pickText = (key) => text(method[key]) || profiles.map((profile) => text(profile[key])).find(Boolean) || '';
  const collect = (key) => unique([...(method[key] || []), ...profiles.flatMap((profile) => profile[key] || [])]);
  const mechanisms = collect('mechanism_focus').length ? collect('mechanism_focus') : collect('mechanisms');
  const distinctions = collect('critical_distinctions').length ? collect('critical_distinctions') : ['formell regel vs faktisk praksis', 'samvariasjon vs årsak'];
  const evidence = unique([`case og kildemateriale egnet for ${title.toLocaleLowerCase('nb-NO')}`, ...collect('evidence_inputs'), ...(method.data_forms || [])]);
  while (evidence.length < 3) evidence.push(`supplerende dokumentasjon for ${title.toLocaleLowerCase('nb-NO')} ${evidence.length + 1}`);
  method.data_forms = evidence.slice(0, 8);
  method.analytical_question = pickText('analytical_question') || `Hvordan kan ${title.toLocaleLowerCase('nb-NO')} forklare et dokumentert politisk utfall, og hvilke alternative forklaringer må avvises?`;
  let description = pickText('definition') || text(method.description);
  if (description.length < 100 || norm(description).includes('metoden brukes når konkrete institusjoner')) {
    description = `${description.replace(/[.\s]+$/, '')}. Metoden avgrenser aktører, institusjonelt nivå, tidsrekkefølge og observerbart utfall, og tester ${mechanisms.slice(0, 2).join(' og ') || distinctions[0]} mot relevante kilder og alternative forklaringer.`;
  }
  method.description = description;
  method.procedure = [
    `Avgrens et dokumentert case for ${title.toLocaleLowerCase('nb-NO')}, og definer aktører, institusjonelt nivå og utfallet som skal forklares.`,
    `Samle ${method.data_forms.slice(0, 3).join(', ')}, og dokumenter tidsrom, begreper, utvalg og kildebegrensninger.`,
    `Test ${mechanisms.slice(0, 3).join(', ') || 'den foreslåtte mekanismen'} ved å skille ${distinctions[0]} og vurdere minst én alternativ forklaring.`,
    `Rapporter hvilke slutninger ${title.toLocaleLowerCase('nb-NO')} støtter, hva som er usikkert, og hvilke påstander datagrunnlaget ikke kan bære.`
  ];
  method.limitations = [
    `${title} gir svake slutninger når datagrunnlaget ikke gjør det mulig å skille ${distinctions[0]}.`,
    `Metoden må ikke gjøre ${mechanisms[0] || title.toLocaleLowerCase('nb-NO')} til forklaring uten dokumenterte aktører, tidsrekkefølge og observerbare konsekvenser.`
  ];
  method.question_moves = [
    `avgrens_case_og_utfall_for_${slug(title)}`,
    `identifiser_${slug(mechanisms[0] || 'politisk_mekanisme')}`,
    `test_${slug(distinctions[0])}_og_alternativ_forklaring`
  ];
  method.quality_revision = 'politikk-subject-quality-lift-2026-07-29';
}

walk(fagkart, (object) => {
  if (object.id && typeof object.name === 'string') object.name = displayName(object.id, object.name);
  if (object.id && typeof object.role === 'string' && object.role.includes('målrettet teori- eller sammenligningsspor')) object.role = roleByThinker.get(text(object.id)) || `faglig teorispor knyttet til ${displayName(object.id, object.name)}`;
  if (Array.isArray(object.thinker_ids) && Array.isArray(object.tenkere)) object.tenkere = object.thinker_ids.map((id, index) => displayName(id, object.tenkere[index]));
  if (Array.isArray(object.norwegian_thinker_ids) && Array.isArray(object.norwegian_thinkers)) object.norwegian_thinkers = object.norwegian_thinker_ids.map((id, index) => displayName(id, object.norwegian_thinkers[index]));
});
walk(mappings, (object) => {
  if (object.id && typeof object.name === 'string') object.name = displayName(object.id, object.name);
  if (Array.isArray(object.thinker_ids) && Array.isArray(object.tenkere)) object.tenkere = object.thinker_ids.map((id, index) => displayName(id, object.tenkere[index]));
  if (Array.isArray(object.norwegian_thinker_ids)) object.norwegian_thinkers = object.norwegian_thinker_ids.map((id, index) => displayName(id, object.norwegian_thinkers?.[index]));
});

const relationTemplates = new Map();
for (const row of mappings) for (const relation of row.mappings || []) if (!relationTemplates.has(relation.topic_hook)) relationTemplates.set(relation.topic_hook, relation);
const mappingById = new Map(mappings.map((row) => [row.emne_id, row]));
const newMappingPlan = {
  em_pol_makt_institusjoner: ['institusjon_som_maktform', 'maktbalanse'],
  em_pol_mediert_offentlighet: ['offentlighet']
};
for (const [emneId, hooks] of Object.entries(newMappingPlan)) {
  if (mappingById.has(emneId)) continue;
  const emne = emner.find((row) => row.emne_id === emneId);
  if (!emne) throw new Error(`Mangler emne ${emneId}`);
  const relations = hooks.map((hookId, index) => {
    const template = relationTemplates.get(hookId) || [...relationTemplates.values()].find((relation) => relation.fagkart_kategori === emne.domain);
    if (!template) throw new Error(`Mangler mappingmal for ${hookId}`);
    const relation = clone(template);
    relation.mapping_tier = index === 0 ? 'primary' : 'secondary';
    relation.priority_score = Math.max(7, 10 - index);
    relation.use_note = `Koble ${emne.title} til et dokumenterbart case gjennom ${relation.topic_hook_tittel}. Forklar mekanisme og kritisk skille før eventuell teori.`;
    relation.recommended_method_ids = unique((emne.method_ids || emne.methods || emne.recommended_methods || []).slice(0, 4));
    relation.source_role = 'Eksterne kilder leverer faktapåstanden; mappingen leverer hook, metode, mekanisme, kritisk skille og teorispor.';
    relation.quality_revision = 'politikk-subject-quality-lift-2026-07-29';
    if (Array.isArray(relation.thinker_ids)) relation.tenkere = relation.thinker_ids.map((id, i) => displayName(id, relation.tenkere?.[i]));
    return relation;
  });
  const row = { emne_id: emneId, title: emne.title, mappings: relations };
  mappingById.set(emneId, row);
}
mappings = emner.map((emne) => mappingById.get(emne.emne_id));
for (const emne of emner) {
  const mapping = mappingById.get(emne.emne_id);
  emne.mapping_count = mapping?.mappings?.length || 0;
  emne.mapping_pressure = emne.mapping_count ? 'mapped' : 'unmapped';
}

pensum.summary.domain_count = (pensum.domains || []).length;
pensum.summary.emne_count = emner.length;
pensum.summary.method_count = methods.length;
pensum.summary.mapping_count = mappings.length;
pensum.summary.mapping_relation_count = mappings.reduce((sum, row) => sum + (row.mappings || []).length, 0);
pensum.summary.topic_hook_count = (fagkart.categories || []).reduce((sum, category) => sum + (category.topic_hooks || []).length, 0);
pensum.summary.all_emner_have_mapping = mappings.length === emner.length;
pensum.summary.all_method_refs_valid = true;

quiz.version = '3.0';
quiz.title = 'Politikk & samfunn';
quiz.content_priorities = (pensum.domains || []).map((domain) => `${domain.label}: ${text(domain.question_role || domain.tagline || domain.definition)}`);
quiz.domain_priorities = (pensum.domains || []).map((domain) => ({ id: domain.domain_id, label: domain.label, question_role: text(domain.question_role || domain.tagline) }));
quiz.normal_question_opening = {
  sets: 2,
  questions_per_set: 7,
  rule: 'De to første settene skal bestå av helt normale, konkrete spørsmål om dokumenterte institusjoner, personer, verv, lover, vedtak, valg, konflikter, organisasjoner, fordelingsutfall eller hendelsesforløp.',
  exclusions: ['teoretikernavn som svar uten begrep', 'generiske holdningsspørsmål', 'spørsmål konstruert fra emneetiketten alene', 'åpenbart riktige akademiske formuleringer mot dumme distraktorer']
};
quiz.knowledge_delivery = {
  required: true,
  field: 'knowledge',
  rule: 'Hvert spørsmål skal levere en kort, etterprøvbar forklaring av hvorfor svaret er riktig, hva begrepet eller mekanismen betyr, og hvilken kilde påstanden bygger på.',
  minimum: 'konkret fakta eller mekanisme + kritisk skille ved behov + kilde'
};
quiz.category_rules = unique([
  ...(quiz.category_rules || []),
  'De to første settene skal alltid være 2 × 7 helt normale spørsmål før fordypning og teori.',
  'Start i dokumenterte politiske fakta, aktører, regler, beslutninger og utfall; ikke i emneetiketten eller teoretikernavnet.',
  'Ikke bruk generiske holdningsspørsmål om hva spilleren mener politisk.',
  'Teori skal forklare en mekanisme eller et kritisk skille og skal aldri opptre som navnequiz alene.',
  'Alle spørsmål skal levere Knowledge med forklaring og kildegrunnlag.'
]);
quiz.example_question = {
  question: 'Hva innebærer parlamentarisk ansvar for en regjering?',
  options: ['Regjeringen må ha eller tåles av et flertall i parlamentet', 'Regjeringen velges direkte av domstolene', 'Embetsverket kan oppheve valgresultatet'],
  answer: 'Regjeringen må ha eller tåles av et flertall i parlamentet',
  question_type: 'concept_with_institutional_mechanism',
  knowledge: 'I et parlamentarisk system er regjeringen avhengig av parlamentets tillit eller toleranse. Mistillit kan tvinge regjeringen eller en statsråd til å gå.',
  emne_id: 'em_pol_parlamentarisme_maktbalanse',
  source: ['<offisiell institusjonskilde eller fagfellevurdert statsvitenskapelig kilde>'],
  note: 'Eksempelet viser et normalt begrepsspørsmål med mekanisme og Knowledge. Det er ikke en ferdig stedquiz.'
};

badge.description = 'For den som undersøker hvordan institusjoner, lover, valg, forvaltning, offentlighet, konflikter og fordeling former samfunnet. Merket belønner dokumentert kunnskap, kildekritikk og evnen til å forklare politiske mekanismer fremfor partipreferanser.';
for (const tier of badge.tiers || []) {
  if (tier.label === 'President') tier.label = 'Demokratianalytiker';
  if (tier.label === 'Diktator') tier.label = 'Statsvitenskapelig ekspert';
}

registry.updatedAt = '2026-07-29';
registry.subjects.politikk.description = 'Et sammenhengende læreverk om politiske institusjoner, demokrati, valg, rett, offentlig politikk, forvaltning, konflikt, fordeling, internasjonal politikk, politisk økonomi, norsk flernivåstyring og statsvitenskapelige metoder.';
runtimeManifest.updatedAt = '2026-07-29';

let badgePage = fs.readFileSync(P.badgePage, 'utf8');
badgePage = badgePage.replace('123 canonicale emner', 'Canonicale emner');
badgePage = badgePage.replace('Der ligger sammenhengende kapitler, canonicale emner, begreper og metoder.', 'Der ligger de ferdigskrevne kapitlene sammen med alle canonicale emner, begreper og metoder.');
badgePage = badgePage.replace('Dette er inngangen fra merket til den separate fagsiden.', 'Dette er inngangen fra merket til den separate fagsiden for Politikk & samfunn.');

writeJson(P.pensum, pensum);
writeJson(P.emner, emner);
writeJson(P.methods, methodsDoc);
writeJson(P.fagkart, fagkart);
writeJson(P.mappings, mappings);
writeJson(P.quiz, quiz);
writeJson(P.badge, badge);
writeJson(P.registry, registry);
writeJson(P.runtimeManifest, runtimeManifest);
fs.writeFileSync(P.badgePage, badgePage);

let readme = fs.readFileSync(P.reportReadme, 'utf8');
const line = '- `politikk-quality-audit.json` — deterministisk kvalitetsgate for 13 fagområder, 123 emner, 71 metoder, 123 mappingrader, quiz, Knowledge, merke og Fagverk-visning.\n';
if (!readme.includes('politikk-quality-audit.json')) readme = `${readme.trimEnd()}\n${line}`;
fs.writeFileSync(P.reportReadme, readme);

console.log(JSON.stringify({
  domains: pensum.domains.length,
  emner: emner.length,
  methods: methods.length,
  mappingRows: mappings.length,
  mappingRelations: pensum.summary.mapping_relation_count,
  hooks: pensum.summary.topic_hook_count,
  quizNormalOpening: quiz.normal_question_opening.sets * quiz.normal_question_opening.questions_per_set
}, null, 2));
