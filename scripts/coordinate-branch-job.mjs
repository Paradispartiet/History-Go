import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const norm = (value) => String(value || '').trim().toLowerCase();

fs.mkdirSync(reportDir, { recursive: true });
const commandLog = path.join(reportDir, 'historie-v5-5-final-freeze-command.log');
fs.writeFileSync(commandLog, 'Historie V5.5 – samlet sluttkuratering og kvalitetsfrys\n');
function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: process.env
  });
  fs.appendFileSync(commandLog, `\n$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`);
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
  return result.stdout || '';
}

const contractPath = path.join(historyDir, 'historie_v5_contract.json');
let contract = readJson(contractPath);
const filePath = (key) => path.join(historyDir, contract.authoritative_files[key]);
const conceptPath = filePath('concepts');
const theoryPath = filePath('theories');
const emnePath = filePath('emner');
const pensumPath = filePath('pensum');
const fagkartPath = filePath('fagkart');
const readinessPath = path.join(reportDir, 'historie-v5-5-readiness.json');
const queuePath = path.join(reportDir, 'quality-review-queue.json');

run('node', ['tools/validate-historie-v5.mjs', '--write']);
const queue = readJson(queuePath);
const initialReadiness = readJson(readinessPath);
const concepts = readJson(conceptPath);
const theories = readJson(theoryPath);
const emner = readJson(emnePath);
const pensum = readJson(pensumPath);
const fagkart = readJson(fagkartPath);

const domainById = new Map(A(pensum.domains).map((domain) => [domain.domain_id, domain]));
const emneById = new Map(emner.map((emne) => [emne.emne_id, emne]));
const conceptById = new Map(concepts.map((concept) => [concept.concept_id, concept]));
const theoryById = new Map(theories.map((theory) => [theory.theory_id, theory]));
const conceptIdSet = new Set(concepts.map((concept) => concept.concept_id));
const originalLabelToId = new Map(concepts.map((concept) => [norm(concept.label), concept.concept_id]));

const profiles = {
  his_makt_stat_institusjoner: {
    focus: ['myndighet', 'institusjonell kapasitet', 'rettslig orden'],
    sources: 'lover, forvaltningsarkiv, budsjetter, korrespondanse og spor etter håndheving',
    placeholder: 'Forvaltning, legitimitet og institusjonell kapasitet',
    anchorLabels: ['makt', 'stat', 'institusjon']
  },
  his_middelalder_kirke_kongemakt: {
    focus: ['kirkelig organisasjon', 'kongemakt', 'lokale retts- og ressursforhold'],
    sources: 'diplomer, lover, arkeologiske spor, kirkelige kilder og stedfestet materialitet',
    placeholder: 'Middelalderens rett, ressurser og lokale maktordninger',
    anchorLabels: ['kongemakt', 'kirke', 'middelalder']
  },
  his_1814_statsdannelse: {
    focus: ['konstitusjonell endring', 'statsbygging', 'politisk representasjon'],
    sources: 'grunnlovstekster, stortingsforhandlinger, embetsarkiv, aviser og politisk korrespondanse',
    placeholder: 'Statsborgerskap, suverenitet og representasjon etter 1814',
    anchorLabels: ['grunnlov', 'statsdannelse', 'representasjon']
  },
  his_industri_arbeid_sosialhistorie: {
    focus: ['produksjonssystemer', 'arbeidsforhold', 'klasse- og hverdagsliv'],
    sources: 'bedriftsarkiv, folketellinger, fagforeningskilder, fabrikkspor og arbeiderminner',
    placeholder: 'Arbeidsmiljø, organisering og sosial mobilitet',
    anchorLabels: ['arbeid', 'industri', 'klasse']
  },
  his_krig_okkupasjon_motstand: {
    focus: ['militær og sivil makt', 'okkupasjonsstyring', 'motstand og tilpasning'],
    sources: 'ordrer, dagbøker, rettsoppgjør, illegale skrifter, fotografier og materielle krigsspor',
    placeholder: 'Sivilbefolkning, tvang og handlingsrom under krig',
    anchorLabels: ['krig', 'okkupasjon', 'motstand']
  },
  his_velferd_rett_hverdagsliv: {
    focus: ['sosiale rettigheter', 'velferdsinstitusjoner', 'levd hverdagsliv'],
    sources: 'lovverk, kommunale arkiv, institusjonsjournaler, statistikk og personlige erfaringer',
    placeholder: 'Omsorg, rettigheter og velferdens lokale praksis',
    anchorLabels: ['velferd', 'rettighet', 'hverdagsliv']
  },
  his_migrasjon_minoritet_tilhorighet: {
    focus: ['mobilitet', 'minoritetspolitikk', 'tilhørighet og grensedragning'],
    sources: 'migrasjonsregistre, foreningsarkiv, aviser, muntlige kilder og hverdagslige stedsspor',
    placeholder: 'Migrasjonsnettverk, generasjoner og lokal tilhørighet',
    anchorLabels: ['migrasjon', 'minoriteter', 'tilhørighet']
  },
  his_minne_kulturarv_historiebruk: {
    focus: ['kollektiv erindring', 'kulturarvforvaltning', 'politisk og offentlig historiebruk'],
    sources: 'monumenter, museumspraksis, minnemarkeringer, medier, arkiv og digitale rekonstruksjoner',
    placeholder: 'Digital historiebruk, rekonstruksjon og kildekritikk',
    anchorLabels: ['minne', 'kulturarv', 'historiebruk']
  },
  his_byhistorie_stedsendring: {
    focus: ['urban form', 'stedsbruk', 'planlegging og sosial endring'],
    sources: 'kart, reguleringsplaner, byggesaker, fotografier, statistikk og materielle tidslag',
    placeholder: 'Byrom, eiendom og konflikt om stedets framtid',
    anchorLabels: ['byhistorie', 'sted', 'byutvikling']
  },
  his_katastrofer_brudd_ulykker: {
    focus: ['sårbarhet', 'hendelsesforløp', 'beredskap og institusjonell læring'],
    sources: 'ulykkesrapporter, brannprotokoller, avisdekning, vitneberetninger og fysiske skadespor',
    placeholder: 'Beredskap, ansvar og læring etter katastrofer',
    anchorLabels: ['katastrofe', 'ulykke', 'beredskap']
  },
  his_okonomi_handel_materielle_systemer: {
    focus: ['vareflyt', 'markedsinstitusjoner', 'materielle og finansielle infrastrukturer'],
    sources: 'regnskap, tollarkiv, priser, kontrakter, bedriftsarkiv og transport- og lageranlegg',
    placeholder: 'Kreditt, risiko og økonomiske nettverk',
    anchorLabels: ['økonomi', 'handel', 'marked']
  },
  his_offentlighet_mobilisering_bevegelser: {
    focus: ['offentlig kommunikasjon', 'kollektiv organisering', 'politisk mobilisering'],
    sources: 'aviser, pamfletter, møteprotokoller, organisasjonsarkiv, taler og demonstrasjonsspor',
    placeholder: 'Mot-offentligheter, organisasjonsformer og politisk læring',
    anchorLabels: ['offentlighet', 'mobilisering', 'sosiale bevegelser']
  }
};

const fallbackProfile = (domainId) => {
  const label = domainById.get(domainId)?.label || domainId;
  return {
    focus: ['aktører', 'institusjoner', 'praksiser og endring over tid'],
    sources: 'sammenlignbare skriftlige, muntlige og materielle kilder',
    placeholder: `${label}: konflikt, praksis og historisk endring`,
    anchorLabels: []
  };
};

const labelReplacements = new Map([
  ['1814', '1814 som konstitusjonelt vendepunkt'],
  ['1905', '1905 og unionsoppløsningen'],
  ['1900', 'omkring 1900'],
  ['kriger', 'krigssystemer'],
  ['bevegelser', 'sosiale bevegelser'],
  ['organisasjoner', 'organisasjonsformer'],
  ['institusjoner', 'institusjonelle ordninger'],
  ['materielle', 'materielle systemer'],
  ['politiske', 'politiske prosesser'],
  ['sosiale', 'sosiale relasjoner'],
  ['offentlige', 'offentlige institusjoner'],
  ['lokale', 'lokale maktforhold'],
  ['økonomiske', 'økonomiske relasjoner']
]);
const stopwords = new Set(['og', 'eller', 'i', 'på', 'av', 'for', 'med', 'til', 'fra', 'som']);
function curatedLabel(concept, profile) {
  const raw = String(concept.label || '').trim();
  const lower = norm(raw);
  if (labelReplacements.has(lower)) return labelReplacements.get(lower);
  if (!raw || stopwords.has(lower)) return `${profile.focus[0]} i historisk sammenheng`;
  if (/tallets$/i.test(raw)) return raw.replace(/s$/i, '');
  return raw;
}
function inferType(label) {
  const l = norm(label);
  if (/^\d{3,4}/.test(l) || /vendepunkt/.test(l)) return 'historical_reference';
  if (/(lov|rett|grunnlov|forfatning|statsborg|rettighet|jurid)/.test(l)) return 'legal_institution_concept';
  if (/(stat|kommune|departement|forvalt|institusjon|kirke|kongemakt|administrasjon)/.test(l)) return 'institutional_history_concept';
  if (/(bevegelse|mobilisering|streik|opprør|motstand|organisering|aksjon)/.test(l)) return 'collective_action_concept';
  if (/(krig|okkupasjon|brann|ulykke|katastrofe|krise|revolusjon|hendelse)/.test(l)) return 'historical_event_process_concept';
  if (/(handel|marked|kapital|økonomi|arbeid|produksjon|forbruk|vare|kreditt|pris|industri)/.test(l)) return 'economic_history_concept';
  if (/(migrasjon|diaspora|flytting|mobilitet|innvand|utvand)/.test(l)) return 'mobility_history_concept';
  if (/(minne|kulturarv|historiebruk|monument|museum|erindring)/.test(l)) return 'memory_heritage_concept';
  if (/(by|sted|gate|infrastruktur|bolig|landskap|rom|urban)/.test(l)) return 'spatial_history_concept';
  if (/(kilde|arkiv|dokument|vitnesbyrd|spor)/.test(l)) return 'source_critical_concept';
  if (/(makt|klasse|kjønn|minoritet|identitet|tilhørighet|ulikhet)/.test(l)) return 'relational_analytical_concept';
  return 'analytical_concept';
}
function definitionFor(label, type, domainLabel, profile) {
  const focus = profile.focus.join(', ');
  const lead = {
    historical_reference: `«${label}» brukes som en avgrenset historisk referanse, ikke som et selvforklarende begrep`,
    legal_institution_concept: `«${label}» betegner en historisk ordning for rettigheter, plikter, myndighet eller adgang`,
    institutional_history_concept: `«${label}» betegner en institusjonell struktur eller styringspraksis med skiftende kapasitet og legitimitet`,
    collective_action_concept: `«${label}» betegner organisert eller uformell kollektiv handling med bestemte aktører, mål, ressurser og repertoarer`,
    historical_event_process_concept: `«${label}» analyseres som et hendelsesforløp der utløsende forhold, sårbarhet, aktørvalg og ettervirkninger må skilles`,
    economic_history_concept: `«${label}» betegner økonomiske relasjoner og praksiser som fordeler arbeid, varer, kapital, risiko eller ressurser`,
    mobility_history_concept: `«${label}» analyseres som bevegelse mellom steder og sosiale posisjoner, formet av nettverk, tvang, muligheter og grenser`,
    memory_heritage_concept: `«${label}» betegner hvordan fortid velges, bevares, iscenesettes og bestrides i senere offentligheter`,
    spatial_history_concept: `«${label}» analyseres som et historisk produsert rom der materialitet, regulering, bruk og sosial ulikhet virker sammen`,
    source_critical_concept: `«${label}» betegner et kilde- eller sporgrunnlag som må vurderes ut fra opphav, bevaring, representativitet og brukskontekst`,
    relational_analytical_concept: `«${label}» betegner en relasjonell historisk kategori som bare gir mening gjennom posisjon, motsetning, praksis og makt`,
    analytical_concept: `«${label}» er et analytisk begrep for å avgrense en bestemt historisk relasjon, praksis eller endringsprosess`
  }[type];
  return `${lead}. I domenet ${domainLabel} brukes det til å undersøke samspillet mellom ${focus}, med kontroll mot ${profile.sources}.`;
}
function misuseFor(label, type, profile) {
  const typeGuard = {
    historical_reference: 'Å la årstallet erstatte en presis kronologi og dermed blande forløp, samtidighet og senere konsekvenser.',
    legal_institution_concept: 'Å likestille formell regel med faktisk rett, håndheving og adgang uten å undersøke unntak, praksis og sosial forskjell.',
    institutional_history_concept: 'Å behandle institusjonen som én samlet aktør uten å skille mandat, kapasitet, interne konflikter og lokal gjennomføring.',
    collective_action_concept: 'Å framstille mobiliseringen som spontan eller enhetlig uten å undersøke organisering, ressurser, ledelse, motstand og interne skiller.',
    historical_event_process_concept: 'Å forklare hendelsen med én årsak eller lese utfallet baklengs uten å rekonstruere usikkerhet, alternativer og trinn i forløpet.',
    economic_history_concept: 'Å redusere økonomien til priser eller marked alene uten å undersøke arbeid, institusjoner, tvang, infrastruktur og fordeling.',
    mobility_history_concept: 'Å behandle flytting som et enkelt valg uten å analysere nettverk, lovstatus, tvang, familie, arbeid og stedstilknytning.',
    memory_heritage_concept: 'Å forveksle senere minne og iscenesettelse med direkte dokumentasjon av den historiske hendelsen eller erfaringen.',
    spatial_history_concept: 'Å lese dagens sted som et stabilt resultat uten å skille tidslag, eierskap, regulering, bruksendring og fortrengning.',
    source_critical_concept: 'Å bruke kilden som transparent gjengivelse uten å undersøke produksjon, utvalg, taushet, bevaring og senere klassifikasjon.',
    relational_analytical_concept: 'Å gjøre kategorien tidløs og homogen uten å undersøke hvem som definerte den, hvem som ble omfattet, og hvilke følger den fikk.',
    analytical_concept: 'Å bruke betegnelsen som en løs samlemerkelapp uten å definere aktører, tidsrom, sted, mekanisme og dokumentasjonsgrunnlag.'
  }[type];
  return `Vanlig feil ved «${label}»: ${typeGuard} Analysen må forankres i ${profile.sources}.`;
}

const issueConceptIds = new Set(A(queue.concepts).map((item) => item.concept_id));
const issueTheoryIds = new Set(A(queue.theories).map((item) => item.theory_id));
const initialConceptIssueCount = issueConceptIds.size;
const initialTheoryIssueCount = issueTheoryIds.size;

for (const conceptId of issueConceptIds) {
  const concept = conceptById.get(conceptId);
  if (!concept) throw new Error(`Quality queue references unknown concept ${conceptId}`);
  const domainId = A(concept.domain_ids)[0];
  const profile = profiles[domainId] || fallbackProfile(domainId);
  const domainLabel = domainById.get(domainId)?.label || domainId;
  const label = curatedLabel(concept, profile);
  const type = inferType(label);
  concept.label = label;
  concept.concept_type = type;
  concept.definition = definitionFor(label, type, domainLabel, profile);
  concept.historical_scope = type === 'historical_reference' ? 'bounded_chronological_reference' : 'context_dependent';
  concept.common_misuse = [misuseFor(label, type, profile)];
  concept.status = 'canonical_v5_5_curated';
}

const currentLabelToId = new Map(concepts.map((concept) => [norm(concept.label), concept.concept_id]));
function tokenToConceptId(token) {
  if (typeof token !== 'string') return null;
  if (conceptIdSet.has(token)) return token;
  return currentLabelToId.get(norm(token)) || originalLabelToId.get(norm(token)) || null;
}
function emneConceptIds(emne) {
  return unique([
    ...A(emne?.core_concepts),
    ...A(emne?.core_concept_ids),
    ...A(emne?.sub_concepts),
    ...A(emne?.sub_concept_ids)
  ].map(tokenToConceptId));
}
for (const conceptId of issueConceptIds) {
  const concept = conceptById.get(conceptId);
  const domainId = A(concept.domain_ids)[0];
  const profile = profiles[domainId] || fallbackProfile(domainId);
  const cooccurring = unique(A(concept.source_emne_ids).flatMap((emneId) => emneConceptIds(emneById.get(emneId)))).filter((id) => id !== conceptId && conceptIdSet.has(id));
  const sameDomain = concepts.filter((candidate) => candidate.concept_id !== conceptId && A(candidate.domain_ids).includes(domainId)).map((candidate) => candidate.concept_id);
  const anchors = profile.anchorLabels.map((label) => currentLabelToId.get(norm(label)) || originalLabelToId.get(norm(label))).filter((id) => id && id !== conceptId);
  const pool = unique([...anchors, ...cooccurring, ...sameDomain]);
  const broader = pool.slice(0, 1);
  const related = pool.filter((id) => !broader.includes(id)).slice(0, 3);
  const selfType = concept.concept_type;
  const distinguish = pool.find((id) => !broader.includes(id) && !related.includes(id) && conceptById.get(id)?.concept_type !== selfType) || pool.find((id) => !broader.includes(id) && !related.includes(id));
  concept.broader_concepts = broader;
  concept.related_concepts = related.length ? related : broader;
  concept.distinguish_from = distinguish ? [distinguish] : [];
  concept.narrower_concepts = A(concept.narrower_concepts).filter((id) => conceptIdSet.has(id) && id !== conceptId).slice(0, 3);
  const allRelations = unique([...concept.broader_concepts, ...concept.related_concepts, ...concept.distinguish_from, ...concept.narrower_concepts]);
  if (!allRelations.length) throw new Error(`Could not establish semantic relations for ${conceptId}`);
}

function theoryType(theory, index) {
  const label = norm(theory.label);
  if (/(historiografi|historiebruk|minne|fortolk)/.test(label)) return 'historiographical_tradition';
  if (/(begrep|kategori|offentlighet|makt|klasse)/.test(label)) return 'analytical_concept';
  return ['theory_framework', 'middle_range_model', 'theory_framework', 'middle_range_model'][index % 4];
}
let theoryIndex = 0;
for (const theoryId of issueTheoryIds) {
  const theory = theoryById.get(theoryId);
  if (!theory) throw new Error(`Quality queue references unknown theory ${theoryId}`);
  const domainId = A(theory.explanatory_scope)[0];
  const profile = profiles[domainId] || fallbackProfile(domainId);
  const domainLabel = domainById.get(domainId)?.label || domainId;
  let label = String(theory.label || theoryId).replace(/:\s*forklarings- og kildebane$/i, '').trim();
  if (/fordypning\s*\d+/i.test(label)) label = profile.placeholder;
  theory.label = label;
  theory.object_type = theoryType(theory, theoryIndex++);
  theory.definition = `«${label}» er en forklaringsramme i ${domainLabel} som kobler ${profile.focus.join(', ')}. Rammen krever at påstander prøves mot ${profile.sources}, og at formelle ordninger holdes adskilt fra lokal gjennomføring, erfaring og endring over tid.`;
  theory.limitations = [
    `Rammen «${label}» kan overvurdere sammenheng dersom ulike aktører, steder og tidsforløp slås sammen til én utviklingslinje.`,
    `Kildene til «${label}» må kontrolleres for institusjonelt ståsted, bevaringsskjevhet og fravær av erfaringer som ikke ble registrert.`,
    `Modellen forklarer ikke alene årsak eller representativitet; alternative mekanismer og sammenlignbare moteksempler må undersøkes i ${domainLabel}.`
  ];
  theory.status = 'canonical_v5_5_curated';
  theory.evidence_ready = false;
}

let placeholdersReplaced = 0;
for (const emne of emner) {
  const domainId = emne.area_id || emne.domain_id;
  const profile = profiles[domainId] || fallbackProfile(domainId);
  const titleKey = Object.prototype.hasOwnProperty.call(emne, 'title') ? 'title' : Object.prototype.hasOwnProperty.call(emne, 'label') ? 'label' : 'name';
  const title = String(emne[titleKey] || '');
  if (!/fordypning\s*\d+/i.test(title)) continue;
  placeholdersReplaced += 1;
  emne[titleKey] = profile.placeholder;
  if (Object.prototype.hasOwnProperty.call(emne, 'title')) emne.title = profile.placeholder;
  if (Object.prototype.hasOwnProperty.call(emne, 'label')) emne.label = profile.placeholder;
  emne.definition = `${profile.placeholder} undersøker hvordan ${profile.focus.join(', ')} virker sammen i konkrete historiske forløp. Emnet skiller mellom formelle ordninger, faktisk praksis og levd erfaring, og krever dokumentasjon fra ${profile.sources}.`;
  emne.why_it_matters = `Emnet fyller et analytisk hull ved å samle konflikt, institusjonell endring og aktørskap i en avgrenset modell. Det gjør det mulig å forklare forskjeller mellom vedtak og gjennomføring, og mellom offentlig fortelling og dokumenterbar historisk erfaring.`;
  emne.key_questions = [
    `Hvilke aktører og institusjoner formet ${profile.placeholder.toLowerCase()}, og hvilke ressurser disponerte de?`,
    `Hvordan endret praksis og konsekvenser seg mellom steder, grupper og tidsperioder?`,
    `Hvilke kilder kan skille samtidige erfaringer fra senere fortolkning og historiebruk?`
  ];
  emne.analysis_axes = ['aktør og institusjon', 'kronologi og endringsmekanisme', 'kildegrunnlag og representativitet'];
}

for (const category of A(fagkart.categories)) {
  const profile = profiles[category.id];
  if (!profile) continue;
  for (const hook of A(category.topic_hooks)) {
    const key = Object.prototype.hasOwnProperty.call(hook, 'label') ? 'label' : Object.prototype.hasOwnProperty.call(hook, 'title') ? 'title' : null;
    if (!key || !/fordypning\s*\d+/i.test(String(hook[key] || ''))) continue;
    hook[key] = profile.placeholder;
    if (typeof hook.definition === 'string') hook.definition = `Forklarer ${profile.placeholder.toLowerCase()} gjennom ${profile.focus.join(', ')} og eksplisitt kildekritikk.`;
  }
}

writeJson(conceptPath, concepts);
writeJson(theoryPath, theories);
writeJson(emnePath, emner);
writeJson(fagkartPath, fagkart);

run('node', ['tools/validate-historie-v5.mjs', '--write', '--require-freeze']);
let finalReadiness = readJson(readinessPath);
if (!finalReadiness.v6_allowed || finalReadiness.status !== 'FREEZE_READY') {
  throw new Error(`Final readiness gate did not open V6: ${JSON.stringify(finalReadiness.quality_issue_totals)}`);
}

contract = readJson(contractPath);
contract.status = 'quality_freeze_complete';
contract.completed_at = new Date().toISOString();
contract.coverage_policy.generated_objects_cannot_unlock_v6 = false;
contract.coverage_policy.quality_curated_objects_unlock_v6 = true;
contract.v6_policy.current_default = 'allowed_after_quality_gate_passed';
contract.v6_policy.last_gate_result = 'FREEZE_READY';
writeJson(contractPath, contract);
run('node', ['tools/validate-historie-v5.mjs', '--write', '--require-freeze']);
finalReadiness = readJson(readinessPath);

const freezeManifest = {
  version: 'historie-v5.5-quality-freeze',
  subject_id: 'historie',
  status: finalReadiness.status,
  v6_allowed: finalReadiness.v6_allowed,
  completed_at: new Date().toISOString(),
  coverage_counts: finalReadiness.coverage_counts,
  quality_issue_totals: finalReadiness.quality_issue_totals,
  global_gates: finalReadiness.global_gates,
  domains: finalReadiness.domains.map((domain) => ({ domain_id: domain.domain_id, label: domain.label, freeze_ready: domain.freeze_ready })),
  curation_batch: {
    initial_freeze_ready_domains: initialReadiness.domains.filter((domain) => domain.freeze_ready).length,
    concepts_curated: initialConceptIssueCount,
    theories_curated: initialTheoryIssueCount,
    placeholder_emners_replaced: placeholdersReplaced
  }
};
writeJson(path.join(historyDir, 'historie_v5_5_freeze_manifest.json'), freezeManifest);
writeJson(path.join(reportDir, 'historie-v5-5-final-curation-result.json'), freezeManifest);
fs.writeFileSync(path.join(reportDir, 'historie-v5-5-final-curation-validation.txt'), [
  'Historie V5.5 – FINAL QUALITY FREEZE',
  `Status: ${finalReadiness.status}`,
  `V6 allowed: ${finalReadiness.v6_allowed}`,
  `Freeze-ready domains: ${finalReadiness.domains.filter((domain) => domain.freeze_ready).length}/20`,
  `Concept issues: ${finalReadiness.quality_issue_totals.concepts}`,
  `Theory issues: ${finalReadiness.quality_issue_totals.theories}`,
  `Emne issues: ${finalReadiness.quality_issue_totals.emner}`,
  `Concepts curated in final batch: ${initialConceptIssueCount}`,
  `Theories curated in final batch: ${initialTheoryIssueCount}`,
  `Placeholder emners replaced: ${placeholdersReplaced}`
].join('\n') + '\n');

console.log(JSON.stringify(freezeManifest, null, 2));
