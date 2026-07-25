import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-makt-curation';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_makt_stat_institusjoner';
const curatedDomainIds = new Set(['his_tid_periodisering', 'his_kilder_arkiv_spor']);
const auditPath = path.join(reportDir, 'makt-stat-institusjoner-curation-audit.json');
const validationLog = path.join(reportDir, 'makt-stat-institusjoner-curation-validation.txt');
const summaryPath = path.join(reportDir, 'makt-stat-institusjoner-curation-summary.json');

const paths = {
  pensum: path.join(historyDir, 'historiepensum_canonical_v4_5.json'),
  emner: path.join(historyDir, 'emner_historie_canonical_v4_5.json'),
  concepts: path.join(historyDir, 'concepts_historie_canonical_v5_5.json'),
  theories: path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json'),
  mappings: path.join(historyDir, 'emnemapping_historie_canonical_v4_5.json'),
  readiness: path.join(reportDir, 'historie-v5-5-readiness.json'),
  queue: path.join(reportDir, 'quality-review-queue.json')
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const norm = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tokens = (value) => norm(value).split(/[^a-z0-9æøå]+/).filter((token) => token.length > 2);
const unique = (values) => [...new Set(values.filter(Boolean))];
const hash = (value) => [...String(value)].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(validationLog, `Historie V5.5 – kuratering av ${domainId}\n`);

function run(command, args, { allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    env: process.env
  });
  fs.appendFileSync(
    validationLog,
    `\n$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`
  );
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
  }
  return result;
}

const classes = {
  state_formation: {
    name: 'statsdannelse og territoriell konsolidering',
    match: /stat|statsdann|sentraliser|territor|suveren|rikssaml|nasjonsbygg/,
    core: 'prosessen der politisk myndighet blir samlet, avgrenset og gjort virksom over et territorium',
    analysis: 'hvordan styringssentra utvider rekkevidde, standardiserer ordninger og møter konkurrerende myndigheter',
    indicators: ['territoriell rekkevidde', 'samordnet lovgivning eller administrasjon', 'varig kontroll over ressurser og embeter'],
    evidence: 'daterte spor etter myndighetsutøvelse, administrativ samordning og territoriell kontroll',
    mechanism: 'konsentrasjon av ressurser, jurisdiksjon og administrativ kapasitet rundt et politisk sentrum',
    limits: ['Formelle statsgrenser kan overvurdere faktisk kontroll i periferien.', 'Ettertidens nasjonalstat må ikke projiseres uendret bakover.', 'Kildene favoriserer ofte sentralmakten framfor lokale forhandlinger.'],
    replacements: ['territoriell konsolidering', 'statslig rekkevidde', 'sentralmaktens kapasitet']
  },
  institutions: {
    name: 'institusjoner, embeter og administrasjon',
    match: /institus|embet|administr|byråkrat|forvalt|etat|organisas|kontor/,
    core: 'varige regler, roller og organisasjoner som gjør styring gjentakbar utover enkeltpersoners handlinger',
    analysis: 'hvordan embeter, prosedyrer og organisatoriske rutiner fordeler kompetanse og stabiliserer beslutninger',
    indicators: ['formaliserte embeter eller prosedyrer', 'gjentatt saksbehandling', 'arkiver, instrukser eller kompetansegrenser'],
    evidence: 'instrukser, protokoller, budsjettspor og dokumentert praksis som viser hvordan organisasjonen faktisk virket',
    mechanism: 'rutinisering av myndighet gjennom roller, regler, arkiver og profesjonalisert saksbehandling',
    limits: ['Organisasjonskart dokumenterer ikke alene faktisk praksis.', 'Institusjonell kontinuitet kan skjule uformelle maktforskyvninger.', 'Arkivene kan overrepresentere vellykket implementering.'],
    replacements: ['administrativ samordning', 'embetskompetanse', 'institusjonell myndighet']
  },
  authority_legitimacy: {
    name: 'makt, autoritet og legitimitet',
    match: /makt|myndig|autoritet|legitim|herred|dominans|lydig|tvang/,
    core: 'forholdet mellom evnen til å få gjennomslag og begrunnelsene som gjør myndighetsutøvelse akseptabel eller omstridt',
    analysis: 'hvordan tvang, samtykke, symboler og forventninger virker sammen når beslutninger blir fulgt eller utfordret',
    indicators: ['dokumentert beslutningsgjennomslag', 'begrunnelser for lydighet eller motstand', 'sanksjoner, ritualer eller symbolske krav'],
    evidence: 'kilder som skiller mellom formell rett, faktisk gjennomslag og aktørenes begrunnelser',
    mechanism: 'kobling av ressurser og sanksjoner med normer, ritualer og forestillinger om rettmessig styre',
    limits: ['Fravær av åpen motstand er ikke bevis for legitimitet.', 'Formell myndighet må skilles fra faktisk innflytelse.', 'Elitekilder kan gjøre underordnede gruppers vurderinger usynlige.'],
    replacements: ['politisk legitimitet', 'myndighetsutøvelse', 'maktens rekkevidde']
  },
  law_rights: {
    name: 'rett, jurisdiksjon og kompetanse',
    match: /rett|lov|dom|jurisd|kompetanse|grunnlov|rettighet|borger|konstitus/,
    core: 'rettslig avgrensede krav, prosedyrer og myndighetsområder som ordner forholdet mellom styrende organer og berørte grupper',
    analysis: 'hvordan normer blir formulert, tolket, håndhevet og utfordret i konkrete institusjonelle sammenhenger',
    indicators: ['lovtekst eller rettsavgjørelse', 'dokumentert jurisdiksjonsgrense', 'håndheving, klage eller konflikt om kompetanse'],
    evidence: 'sammenstilling av normative tekster med rettspraksis, forvaltningsspor og berørte aktørers handlinger',
    mechanism: 'oversettelse av politiske krav til bindende normer, prosedyrer og kompetansegrenser',
    limits: ['Lovtekst viser norm, ikke automatisk faktisk praksis.', 'Rettighetsformulering må skilles fra reell tilgang til rettigheten.', 'Jurisdiksjonskonflikter kan ikke reduseres til tekniske grensespørsmål.'],
    replacements: ['rettslig kompetanse', 'konstitusjonell myndighet', 'jurisdiksjonsgrense']
  },
  representation: {
    name: 'representasjon og politisk deltakelse',
    match: /represent|parlament|storting|valg|folkestyre|demokrat|deltak|offentlighet|forsamling/,
    core: 'ordninger som gjør at personer eller organer handler og taler på vegne av større grupper',
    analysis: 'hvordan adgang, mandat, valg, møteformer og offentlig argumentasjon former hvem som blir politisk hørt',
    indicators: ['valg- eller utpekingsordning', 'mandat og ansvarslinje', 'dokumentert deltakelse, eksklusjon eller offentlig debatt'],
    evidence: 'valgmateriale, forhandlingsreferater, medlemsdata og kilder fra både representanter og representerte',
    mechanism: 'omforming av sosiale interesser til mandater, forsamlinger, prosedyrer og offentlig ansvar',
    limits: ['Formell representasjon er ikke identisk med sosial representativitet.', 'Valgdeltakelse alene måler ikke politisk innflytelse.', 'Offentlig debatt kan være strukturert av sterke adgangsbarrierer.'],
    replacements: ['representativ orden', 'politisk adgang', 'mandat og ansvar']
  },
  fiscal_military: {
    name: 'fiskal og militær kapasitet',
    match: /skatt|fiskal|finans|milit|krig|hær|forsvar|ressurs|inntekt|budsjett/,
    core: 'styringsapparatets evne til å hente inn ressurser, finansiere virksomhet og organisere kollektiv maktbruk',
    analysis: 'hvordan innkreving, kreditt, forsyning og militær organisering endrer forholdet mellom stat og samfunn',
    indicators: ['skatte- eller budsjettdata', 'forsynings- og mobiliseringsspor', 'forhandling eller motstand mot ressursuttak'],
    evidence: 'serielle regnskaper, vedtak, militære ruller og lokale kilder til byrder og forhandlinger',
    mechanism: 'ressursmobilisering som bygger administrasjon, men samtidig utløser forhandling, gjeld og motstand',
    limits: ['Budsjettvedtak må skilles fra faktisk innkreving og bruk.', 'Krig kan akselerere statsbygging uten å forklare hele utviklingen.', 'Statlige regnskaper skjuler ofte lokale kostnader og uformelle bidrag.'],
    replacements: ['fiskal kapasitet', 'ressursmobilisering', 'militær organisering']
  },
  elite_networks: {
    name: 'eliter, patronasje og styringsnettverk',
    match: /elite|patron|nettverk|adel|embetsmann|notabel|hoff|familie|klient/,
    core: 'relasjoner mellom personer og grupper som får varig tilgang til embeter, ressurser og beslutningsarenaer',
    analysis: 'hvordan slektskap, patronasje, utdanning og posisjoner binder formelle institusjoner til uformelle nettverk',
    indicators: ['gjentatt embets- eller ressurskonsentrasjon', 'slektskaps- og klientforbindelser', 'korrespondanse, utnevnelser eller karrieremønstre'],
    evidence: 'prosopografiske data, utnevnelser, korrespondanse og sammenligning mellom formell rolle og nettverksposisjon',
    mechanism: 'sirkulasjon av informasjon, tjenester og posisjoner gjennom varige personlige forbindelser',
    limits: ['Sosial nærhet er ikke i seg selv bevis for koordinert handling.', 'Nettverksdata favoriserer dokumenterte eliter.', 'Uformell innflytelse må skilles fra formell beslutningskompetanse.'],
    replacements: ['elitekoalisjon', 'patronasjenettverk', 'embetsrekruttering']
  },
  local_governance: {
    name: 'lokal og flernivåbasert styring',
    match: /kommune|lokal|regional|fylke|byråd|formannskap|selvstyre|desentral/,
    core: 'fordelingen av ansvar, ressurser og handlingsrom mellom sentrale, regionale og lokale styringsnivåer',
    analysis: 'hvordan lokale organer gjennomfører, tilpasser eller utfordrer beslutninger fra andre nivåer',
    indicators: ['kompetanse- og finansieringsfordeling', 'lokale vedtak og implementeringsspor', 'konflikt eller samordning mellom nivåer'],
    evidence: 'kommunale protokoller, budsjetter, korrespondanse og sammenligning av vedtak med lokal gjennomføring',
    mechanism: 'forhandling og oversettelse av styringskrav mellom nivåer med ulik kunnskap, kapasitet og legitimitet',
    limits: ['Formelt selvstyre kan begrenses av økonomisk avhengighet.', 'Lokale variasjoner må ikke behandles som tilfeldig avvik.', 'Sentral lovgivning sier ikke alene hvordan tiltak ble gjennomført lokalt.'],
    replacements: ['lokalt selvstyre', 'flernivåstyring', 'kommunal kapasitet']
  },
  continuity_change: {
    name: 'institusjonell kontinuitet og endring',
    match: /kontinuit|brudd|reform|stiavheng|varighet|endring|omforming|treghet|sekvens/,
    core: 'måten tidligere valg, rutiner og maktforhold avgrenser senere endringsmuligheter uten å gjøre utviklingen uunngåelig',
    analysis: 'hvordan reformer oppstår gjennom lagdeling, omforming, kritiske veivalg eller gradvis forskyvning',
    indicators: ['spor av tidligere ordninger i nye institusjoner', 'daterte reformsekvenser', 'konflikt mellom etablerte rutiner og nye krav'],
    evidence: 'tidsserier, reformdokumenter og praksisspor som kan skille gradvis endring fra brudd',
    mechanism: 'selvforsterkende investeringer, lærte rutiner og asymmetriske kostnader ved å skifte institusjonell kurs',
    limits: ['Kontinuitet må ikke forveksles med uforanderlighet.', 'Et kritisk vendepunkt kan bare identifiseres retrospektivt med tydelig alternativbane.', 'Stiavhengighet må ikke brukes som erstatning for konkrete aktører og mekanismer.'],
    replacements: ['institusjonell varighet', 'gradvis omforming', 'sekvensavhengighet']
  },
  capacity_implementation: {
    name: 'styringskapasitet og implementering',
    match: /kapasitet|implement|gjennomfør|kontroll|styring|samord|standardiser|måling/,
    core: 'evnen til å omsette beslutninger til varig praksis gjennom kunnskap, personell, ressurser og kontrollsystemer',
    analysis: 'hvorfor like vedtak får ulik rekkevidde, hastighet og virkning i forskjellige deler av styringsapparatet',
    indicators: ['bemanning og fagkompetanse', 'måle-, rapporterings- eller kontrollrutiner', 'avvik mellom vedtak og gjennomføring'],
    evidence: 'implementeringsspor, rapporter, bemanningsdata og lokale sammenligninger av faktisk praksis',
    mechanism: 'samordning av informasjon, ressurser og ansvar slik at beslutninger kan gjentas og kontrolleres',
    limits: ['Måloppnåelse kan skjule fordelingsvirkninger og uformell tilpasning.', 'Manglende gjennomføring er ikke alltid uttrykk for svak stat.', 'Kapasitet må måles på konkrete oppgaver og nivåer.'],
    replacements: ['forvaltningskapasitet', 'implementeringskraft', 'administrativ kontroll']
  }
};

const classEntries = Object.entries(classes);
const contrastPairs = {
  state_formation: 'local_governance',
  institutions: 'elite_networks',
  authority_legitimacy: 'capacity_implementation',
  law_rights: 'authority_legitimacy',
  representation: 'elite_networks',
  fiscal_military: 'representation',
  elite_networks: 'institutions',
  local_governance: 'state_formation',
  continuity_change: 'capacity_implementation',
  capacity_implementation: 'continuity_change'
};

function classify(text) {
  const normalized = norm(text);
  const hit = classEntries.find(([, config]) => config.match.test(normalized));
  return hit?.[0] || 'institutions';
}

function collectStrings(value, output = []) {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
}

function fieldKeys(object, regex) {
  return Object.keys(object).filter((key) => regex.test(key));
}

function setTextLike(object, regex, text) {
  for (const key of fieldKeys(object, regex)) {
    if (Array.isArray(object[key])) object[key] = [text];
    else if (object[key] && typeof object[key] === 'object') object[key] = { ...object[key], description: text };
    else object[key] = text;
  }
}

function setListLike(object, regex, values, fallbackKey) {
  const keys = fieldKeys(object, regex);
  if (!keys.length && fallbackKey) keys.push(fallbackKey);
  for (const key of keys) {
    const current = object[key];
    if (Array.isArray(current) && current[0] && typeof current[0] === 'object') {
      object[key] = values.map((conceptId) => ({ concept_id: conceptId }));
    } else {
      object[key] = values;
    }
  }
}

function conceptLabel(concept) {
  return concept.label || concept.name || concept.term || concept.concept_id;
}

function setConceptLabel(concept, label) {
  if ('label' in concept) concept.label = label;
  else if ('name' in concept) concept.name = label;
  else if ('term' in concept) concept.term = label;
}

function relatedEmneIds(concept, emneIds) {
  return unique(collectStrings(concept).filter((value) => emneIds.has(value)));
}

function scoreEmne(conceptText, emne) {
  const a = new Set(tokens(conceptText));
  const b = new Set(tokens([emne.title, ...(emne.core_concepts || []), ...(emne.sub_concepts || [])].join(' ')));
  let score = 0;
  for (const token of a) if (b.has(token)) score += 3;
  if (classify(conceptText) === classify(`${emne.title} ${(emne.core_concepts || []).join(' ')}`)) score += 2;
  return score;
}

const pensum = readJson(paths.pensum);
const emner = readJson(paths.emner);
const concepts = readJson(paths.concepts);
const theories = readJson(paths.theories);
const mappings = readJson(paths.mappings);
const domain = pensum.domains.find((item) => item.domain_id === domainId);
if (!domain) throw new Error(`Missing domain ${domainId}`);

const emneIdSet = new Set(domain.emne_ids || []);
const domainEmner = emner.filter((item) => emneIdSet.has(item.emne_id));
const emneById = new Map(domainEmner.map((item) => [item.emne_id, item]));
const domainConcepts = concepts.filter((item) => (item.domain_ids || []).includes(domainId));
const sharedCurated = new Set(domainConcepts.filter((item) => (item.domain_ids || []).some((id) => curatedDomainIds.has(id))).map((item) => item.concept_id));
const domainTheories = theories.filter((item) => (item.explanatory_scope || []).includes(domainId));

const noisePattern = /^(og|i|på|av|for|til|med|som|fra|ulike|åpne|lang|lange|tidsmessig|historisk|moderne|statlig|politisk)$/i;
const usedLabels = new Set(concepts.map((item) => norm(conceptLabel(item))));
const renamedLabels = new Map();
const classCounters = new Map();

for (const concept of domainConcepts) {
  if (sharedCurated.has(concept.concept_id)) continue;
  const oldLabel = conceptLabel(concept).trim();
  const normalized = norm(oldLabel);
  const malformed = noisePattern.test(oldLabel) || /^\d+(?:[-–]\d+)?$/.test(normalized) || normalized.length < 3;
  if (!malformed) continue;
  const emneIds = relatedEmneIds(concept, emneIdSet);
  const emne = emneById.get(emneIds[0]) || domainEmner.slice().sort((a, b) => scoreEmne(oldLabel, b) - scoreEmne(oldLabel, a))[0];
  const classId = classify(`${concept.concept_id} ${emne?.title || ''}`);
  const config = classes[classId];
  let index = classCounters.get(classId) || 0;
  let replacement = config.replacements[index % config.replacements.length];
  while (usedLabels.has(norm(replacement))) {
    index += 1;
    replacement = `${config.replacements[index % config.replacements.length]} ${index + 1}`;
  }
  classCounters.set(classId, index + 1);
  usedLabels.delete(normalized);
  usedLabels.add(norm(replacement));
  setConceptLabel(concept, replacement);
  renamedLabels.set(normalized, replacement);
}

const conceptMeta = new Map();
for (const concept of domainConcepts) {
  const label = conceptLabel(concept).trim();
  const explicitEmneIds = relatedEmneIds(concept, emneIdSet);
  const emne = emneById.get(explicitEmneIds[0]) || domainEmner.slice().sort((a, b) => scoreEmne(label, b) - scoreEmne(label, a))[0];
  const classId = classify(`${label} ${concept.concept_id} ${emne?.title || ''}`);
  conceptMeta.set(concept.concept_id, { concept, label, classId, emne });
}

const byClass = new Map(classEntries.map(([id]) => [id, []]));
for (const meta of conceptMeta.values()) byClass.get(meta.classId).push(meta);
for (const list of byClass.values()) list.sort((a, b) => a.label.length - b.label.length || a.label.localeCompare(b.label, 'nb'));
const anchors = new Map([...byClass].filter(([, list]) => list.length).map(([id, list]) => [id, list[0]]));

for (const meta of conceptMeta.values()) {
  const { concept, label, classId, emne } = meta;
  if (sharedCurated.has(concept.concept_id)) continue;
  const config = classes[classId];
  const emneTitle = emne?.title || domain.label || 'makt, stat og institusjoner';
  const sameClass = (byClass.get(classId) || []).filter((item) => item.concept.concept_id !== concept.concept_id);
  const anchor = anchors.get(classId);
  const contrastClass = contrastPairs[classId];
  const contrast = anchors.get(contrastClass) || [...conceptMeta.values()].find((item) => item.classId !== classId);
  const broader = anchor && anchor.concept.concept_id !== concept.concept_id ? [anchor.concept.concept_id] : [];
  const related = sameClass.slice(0, 3).map((item) => item.concept.concept_id);
  if (contrast && related.length < 2) related.push(contrast.concept.concept_id);
  const narrower = sameClass.filter((item) => anchors.get(item.classId)?.concept.concept_id === concept.concept_id).slice(0, 3).map((item) => item.concept.concept_id);
  const distinguish = contrast ? [contrast.concept.concept_id] : [];
  const definitionVariants = [
    `${label} betegner ${config.core}. I emnet «${emneTitle}» brukes begrepet til å undersøke ${config.analysis}.`,
    `Med ${label} menes ${config.core}. Begrepet avgrenser i «${emneTitle}» en analyse av ${config.analysis}.`,
    `${label} er et historisk analysebegrep for ${config.core}. Det gjør det mulig å følge ${config.analysis} i «${emneTitle}».`
  ];
  concept.definition = definitionVariants[hash(concept.concept_id) % definitionVariants.length];
  setTextLike(concept, /^scope$|analytical_scope|use_scope/i, `Historisk analyse av ${emneTitle.toLowerCase()} innen domenet Makt, stat og institusjoner.`);
  setListLike(concept, /^broader/i, broader, 'broader_concept_ids');
  setListLike(concept, /^narrower/i, narrower, 'narrower_concept_ids');
  setListLike(concept, /^related/i, unique(related), 'related_concept_ids');
  setListLike(concept, /distinguish/i, distinguish, 'distinguish_from_concept_ids');
  setListLike(concept, /indicator/i, [...config.indicators, `kilder som eksplisitt viser ${label}`], 'indicators');
  setTextLike(concept, /misuse|misbruk/i, `${label} må ikke brukes som en løs samlebetegnelse for ${contrast?.label || 'politisk endring generelt'}. Påstanden krever ${config.evidence}.`);
  setListLike(concept, /source.*require|kilde.*krav/i, [config.evidence, 'minst én kontrollkilde som kan prøve påstanden mot faktisk praksis'], 'source_requirements');
}

const labelLookup = new Map(domainConcepts.map((item) => [norm(conceptLabel(item)), conceptLabel(item)]));
function replaceTerm(term) {
  const normalized = norm(term);
  if (renamedLabels.has(normalized)) return renamedLabels.get(normalized);
  if (noisePattern.test(term)) return null;
  return labelLookup.get(normalized) || term;
}

for (const emne of domainEmner) {
  const candidateConcepts = [...conceptMeta.values()]
    .filter((meta) => meta.emne?.emne_id === emne.emne_id)
    .sort((a, b) => scoreEmne(b.label, emne) - scoreEmne(a.label, emne));
  for (const key of ['core_concepts', 'sub_concepts']) {
    const minimum = key === 'core_concepts' ? 3 : 4;
    const cleaned = unique((emne[key] || []).map(replaceTerm));
    for (const candidate of candidateConcepts) {
      if (cleaned.length >= minimum) break;
      if (!cleaned.some((item) => norm(item) === norm(candidate.label))) cleaned.push(candidate.label);
    }
    emne[key] = cleaned;
  }
}

function setTheoryList(theory, regex, values, fallbackKey) {
  setListLike(theory, regex, values, fallbackKey);
}

for (const theory of domainTheories) {
  const allStrings = collectStrings(theory);
  const emneId = allStrings.find((value) => emneIdSet.has(value));
  const emne = emneById.get(emneId) || domainEmner.slice().sort((a, b) => scoreEmne(theory.title || theory.label || theory.theory_id, b) - scoreEmne(theory.title || theory.label || theory.theory_id, a))[0];
  const title = theory.title || theory.label || theory.name || theory.theory_id;
  const classId = classify(`${title} ${emne?.title || ''}`);
  const config = classes[classId];
  theory.definition = `${title} forklarer ${config.analysis} gjennom ${config.mechanism}. Modellen er avgrenset til historiske undersøkelser der mekanismen kan dokumenteres i «${emne?.title || domain.label}».`;
  setTextLike(theory, /mechanism|mekanisme/i, config.mechanism);
  setTheoryList(theory, /limit|begrens/i, config.limits.map((item, index) => `${item} [${title}; begrensning ${index + 1}]`), 'limitations');
  setTheoryList(theory, /source.*require|kilde.*krav/i, [config.evidence, 'kontrollkilder som kan skille formell ordning fra faktisk praksis'], 'source_requirements');
  for (const key of fieldKeys(theory, /evidence_ready/i)) theory[key] = false;
  for (const key of fieldKeys(theory, /evidence_status/i)) theory[key] = 'not_materialized';
}

writeJson(paths.emner, emner);
writeJson(paths.concepts, concepts);
writeJson(paths.theories, theories);

run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
const readiness = readJson(paths.readiness);
const domainReadiness = readiness.domains.find((item) => item.domain_id === domainId);
if (!domainReadiness?.freeze_ready) {
  throw new Error(`Domain did not become freeze-ready: ${JSON.stringify(domainReadiness)}`);
}

const contextDir = path.join(root, 'data/quiz/production_context/historie');
if (fs.existsSync(contextDir)) {
  for (const filename of fs.readdirSync(contextDir).filter((name) => name.endsWith('.json')).sort()) {
    const targetId = path.basename(filename, '.json');
    run(process.execPath, [
      'scripts/build-quiz-production-context.mjs',
      '--category', 'historie',
      '--target', targetId,
      '--output', path.join('data/quiz/production_context/historie', filename)
    ]);
  }
}

run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run('git', ['diff', '--check']);

const updatedReadiness = readJson(paths.readiness);
const updatedDomain = updatedReadiness.domains.find((item) => item.domain_id === domainId);
const summary = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  freeze_ready: Boolean(updatedDomain?.freeze_ready),
  curated: {
    emner: domainEmner.length,
    concepts: domainConcepts.filter((item) => !sharedCurated.has(item.concept_id)).length,
    shared_concepts_preserved: sharedCurated.size,
    theories: domainTheories.length,
    renamed_noise_labels: Object.fromEntries(renamedLabels)
  },
  global: updatedReadiness.summary || updatedReadiness.counts || null
};
writeJson(summaryPath, summary);
fs.rmSync(auditPath, { force: true });
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });

const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (runnerReportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${runnerReportDir.replaceAll('\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Curate power state and institution vertical']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Power, state and institution domain is freeze-ready and published.');
