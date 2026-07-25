import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const domainId = 'his_makt_stat_institusjoner';
const sourceRef = 'origin/agent/oslo-coordinate-historie-v5-5-makt-curation';
const conceptsPath = 'data/fag/historie/concepts_historie_canonical_v5_5.json';
const emnerPath = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const theoriesPath = 'data/fag/historie/theory_objects_historie_canonical_v5_5.json';
const reportDir = path.join(root, 'reports', 'historie-v5');
const commandLogPath = path.join(reportDir, 'makt-stat-institusjoner-curation-command-v2.log');
const resultPath = path.join(reportDir, 'makt-stat-institusjoner-curation-result-v2.json');
const validationPath = path.join(reportDir, 'makt-stat-institusjoner-curation-validation-v2.txt');

fs.mkdirSync(reportDir, { recursive: true });
const commandLog = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function gitShowJson(ref, relativePath) {
  const result = spawnSync('git', ['show', `${ref}:${relativePath}`], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Could not read ${relativePath} from ${ref}\n${result.stderr || ''}`);
  }
  return JSON.parse(result.stdout);
}

function run(command, args) {
  const label = `$ ${command} ${args.join(' ')}`;
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: process.env,
  });
  commandLog.push(label, result.stdout || '', result.stderr || '');
  fs.writeFileSync(commandLogPath, `${commandLog.join('\n')}\n`);
  if (result.error || result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}\n${result.stderr || result.stdout || ''}`);
  }
}

function union(left = [], right = []) {
  return [...new Set([...(left || []), ...(right || [])])];
}

function isCurated(object) {
  return String(object?.status || '').includes('curated') &&
    !String(object?.definition || '').includes('betegner «');
}

function belongsToDomain(object) {
  return object?.domain_id === domainId ||
    object?.domain_ids?.includes(domainId) ||
    object?.explanatory_scope?.includes(domainId);
}

const currentConcepts = readJson(conceptsPath);
const currentEmner = readJson(emnerPath);
const currentTheories = readJson(theoriesPath);
const sourceConcepts = gitShowJson(sourceRef, conceptsPath);
const sourceEmner = gitShowJson(sourceRef, emnerPath);
const sourceTheories = gitShowJson(sourceRef, theoriesPath);

const sourceTargetConcepts = sourceConcepts.filter(belongsToDomain);
const sourceTargetEmner = sourceEmner.filter((item) =>
  belongsToDomain(item) || String(item?.emne_id || '').startsWith('em_his_makt_'));
const sourceTargetTheories = sourceTheories.filter(belongsToDomain);

if (sourceTargetEmner.length !== 10) {
  throw new Error(`Expected 10 power-domain emner in source branch, found ${sourceTargetEmner.length}`);
}
if (sourceTargetTheories.length !== 10) {
  throw new Error(`Expected 10 power-domain theories in source branch, found ${sourceTargetTheories.length}`);
}

const currentConceptIndex = new Map(currentConcepts.map((item, index) => [item.concept_id, index]));
let conceptsImported = 0;
let curatedSharedConceptsPreserved = 0;
for (const sourceConcept of sourceTargetConcepts) {
  const index = currentConceptIndex.get(sourceConcept.concept_id);
  if (index === undefined) {
    throw new Error(`Missing current concept ${sourceConcept.concept_id}`);
  }
  const currentConcept = currentConcepts[index];
  if (isCurated(currentConcept)) {
    curatedSharedConceptsPreserved += 1;
    continue;
  }
  currentConcepts[index] = {
    ...sourceConcept,
    domain_ids: union(currentConcept.domain_ids, sourceConcept.domain_ids),
    source_emne_ids: union(currentConcept.source_emne_ids, sourceConcept.source_emne_ids),
    status: 'canonical_v5_5_curated',
  };
  conceptsImported += 1;
}

const currentEmneIndex = new Map(currentEmner.map((item, index) => [item.emne_id, index]));
for (const sourceEmne of sourceTargetEmner) {
  const index = currentEmneIndex.get(sourceEmne.emne_id);
  if (index === undefined) {
    throw new Error(`Missing current emne ${sourceEmne.emne_id}`);
  }
  currentEmner[index] = sourceEmne;
}

const theoryContent = {
  theory_his_institusjonsbygging_funksjon: {
    definition: 'Forklarer hvordan et politisk vedtak eller et nytt mandat blir gjort varig gjennom embeter, budsjetter, personell, prosedyrer, arkiver, bygg og gjentatte arbeidsrutiner. Modellen skiller mellom formell opprettelse, faktisk gjennomføringsevne og institusjonens senere funksjonsendringer.',
    limitations: [
      'Et opprettelsesvedtak eller organisasjonskart dokumenterer ikke at institusjonen fikk ressurser, lokal rekkevidde eller faktisk virkning.',
      'Stabile navn og formelle strukturer kan skjule store endringer i oppgaver, personell, praksis og uformell makt.',
      'Institusjonens egne arkiver kan overrepresentere planlagt og vellykket virksomhet og må kontrolleres mot brukere, underordnede ledd og økonomiske spor.'
    ],
    source_requirements: [
      'opprettelsesvedtak, instrukser, budsjetter, bemanning, saksrutiner og materielle spor som viser overgangen fra mandat til drift',
      'kontrollkilder fra brukere, lokale ledd eller berørte grupper som kan vise avvik mellom formell funksjon og faktisk praksis'
    ]
  },
  theory_his_embetsverk_byrakrati: {
    definition: 'Analyserer hvordan rekruttering, utdanning, ekspertise, hierarki, kontorrutiner og skriftlig saksbehandling former embetsverkets beslutninger og forholdet mellom politisk ledelse og administrasjon. Byråkrati behandles som en historisk praksis, ikke bare som en organisasjonsform.',
    limitations: [
      'Webers idealtype kan brukes analytisk, men må ikke forveksles med en direkte beskrivelse av ethvert historisk embetsverk.',
      'Stillingslister og reglementer viser hvem som formelt var ansatt, men ikke nødvendigvis hvem som påvirket sakene eller hvordan arbeidet faktisk ble utført.',
      'Påstander om upartiskhet og faglighet kan skjule klassebakgrunn, kjønn, patronasje, lokale nettverk og politiske lojaliteter.'
    ],
    source_requirements: [
      'personalmapper, utnevnelser, korrespondanse, journaler, saksmapper og interne instrukser som viser rekruttering og arbeidsdeling',
      'spor etter konkrete avgjørelser som gjør det mulig å sammenligne formell saksorden med faktisk administrativ praksis'
    ]
  },
  theory_his_beslutningskjede_kompetanse: {
    definition: 'Rekonstruerer hvem som kunne foreslå, utrede, gi råd, treffe vedtak, iverksette, kontrollere og behandle klage i en offentlig beslutning. Analysen lokaliserer både formell kompetanse og punktene der ansvar, informasjon eller innflytelse ble flyttet, delt eller gjort uklart.',
    limitations: [
      'Formell kompetanse er ikke det samme som faktisk innflytelse; rådgivere, sekretariater og uformelle nettverk kan ha styrt utfallet.',
      'Saksmapper kan være ufullstendige, etterredigerte eller ordnet slik at beslutningen framstår mer sammenhengende enn den var.',
      'Kjennskap til sluttresultatet kan føre til at tapte alternativer, forsinkelser og samtidens usikkerhet forsvinner fra rekonstruksjonen.'
    ],
    source_requirements: [
      'daterte forslag, utredninger, referater, fullmakter, vedtak, ekspedisjoner, kontrollspor og klager som kan ordnes i en beslutningskjede',
      'kilder fra flere ledd i prosessen, slik at formelt ansvar kan sammenlignes med faktisk initiativ og gjennomføring'
    ]
  },
  theory_his_statlig_kapasitet_ressurser: {
    definition: 'Undersøker statens evne til å innhente skatt, informasjon, personell og materiell, samordne logistikk og gjennomføre beslutninger over territorium og tid. Kapasitet måles gjennom konkrete oppgaver og resultater, ikke bare gjennom statens størrelse eller formelle myndighet.',
    limitations: [
      'Store budsjetter eller mange ansatte dokumenterer ikke automatisk lokal rekkevidde, koordinering eller gjennomføringsevne.',
      'Tvang, overvåkning og militær styrke er bare enkelte former for kapasitet og må ikke erstatte analyse av legitimitet, kunnskap og administrativ infrastruktur.',
      'Formelle grenser og landsdekkende regler kan overvurdere kontrollen i periferier, kontaktsoner og områder med konkurrerende myndigheter.'
    ],
    source_requirements: [
      'skatte- og budsjettdata, bemanning, forsyningsspor, statistikk, infrastruktur og lokale gjennomføringsrapporter knyttet til en avgrenset oppgave',
      'sammenligning mellom sentrale mål og dokumenterte resultater i ulike geografiske og sosiale deler av staten'
    ]
  },
  theory_his_rettigheter_borgerskap_forvaltning: {
    definition: 'Analyserer hvordan rettslig status, plikter, politisk deltakelse, offentlig hjelp og adgang til institusjoner ble definert og administrert. Modellen skiller mellom formelle rettigheter, forvaltningens kategorier og menneskers faktiske mulighet til å gjøre rettighetene gjeldende.',
    limitations: [
      'En lovfestet rettighet dokumenterer ikke at den var kjent, tilgjengelig, økonomisk mulig eller likt håndhevet.',
      'Medborgerskap og rettighetsadgang kan ha vært ulikt fordelt etter kjønn, klasse, bosted, etnisitet, funksjonsevne og familierettslig status.',
      'Forvaltningsarkiver synliggjør oftest dem som søkte eller ble registrert, mens avviste, uformelle og potensielle brukere lettere forsvinner.'
    ],
    source_requirements: [
      'lovtekster, forskrifter, søknader, vedtak, klager, praksisnotater og statistikk som viser både rettighetsformulering og administrasjon',
      'erfaringskilder fra personer og grupper som forsøkte å få tilgang til rettighetene eller ble holdt utenfor'
    ]
  },
  theory_his_lov_domstol_rettsstat: {
    definition: 'Undersøker forholdet mellom lovtekst, jurisdiksjon, prosedyre, bevis, dom, klage og håndheving, og hvordan disse ordningene kunne begrense eller legitimere myndighetsutøvelse. Rettsstat analyseres som historisk praksis med varierende adgang og gjennomslag.',
    limitations: [
      'Publiserte dommer og prinsipielle saker kan ikke uten videre representere den daglige rettspraksisen eller sakene som aldri nådde domstolen.',
      'Prosessuelle idealer må skilles fra faktisk tilgang til advokat, domstol, bevisføring, klage og håndheving.',
      'Juridiske kategorier og jurisdiksjonsgrenser endrer betydning over tid og må ikke leses som stabile moderne begreper.'
    ],
    source_requirements: [
      'lovforarbeider, lovtekst, rettsbøker, saksdokumenter, dommer, klager og håndhevingsspor fra samme avgrensede rettsområde',
      'kilder som belyser hvem som fikk adgang til rettssystemet, hvilke kostnader de møtte og om avgjørelsene faktisk ble gjennomført'
    ]
  },
  theory_his_politi_fengsel_straff: {
    definition: 'Analyserer hvordan politi, straff, fengsling og institusjonell disiplin klassifiserte handlinger og personer, organiserte kontroll og formet hverdagen til ansatte, innsatte og berørte lokalsamfunn. Strafferegimet omfatter både lov, institusjon og levd erfaring.',
    limitations: [
      'Politi- og fengselsarkiver er produsert av kontrollinstitusjonene og kan gjøre de kontrollerte personenes erfaringer og motstand usynlig.',
      'Den formelle straffen beskriver ikke nødvendigvis faktisk soning, institusjonsvilkår, uformelle sanksjoner eller virkninger etter løslatelse.',
      'Endringer i registrert kriminalitet kan skyldes nye lover, kontrollprioriteringer og registreringsmåter, ikke bare endret atferd.'
    ],
    source_requirements: [
      'lovverk, politijournaler, arrest- og fangeprotokoller, institusjonsregler, inspeksjoner og konkrete saksforløp',
      'brev, vitnesbyrd, presse, helseopplysninger eller andre kilder som kan belyse institusjonshverdagen utenfra og nedenfra'
    ]
  },
  theory_his_register_overvakning_disiplin: {
    definition: 'Forklarer hvordan registre, identifikatorer, mapper, statistikk og observasjonspraksiser gjør mennesker og aktiviteter lesbare for myndighetene. Analysen undersøker samtidig hvordan kategoriene forenkler virkeligheten, skaper blindsoner og påvirker dem som blir registrert.',
    limitations: [
      'Registerdata kan ha skjev geografisk og sosial dekning og må ikke behandles som et fullstendig bilde av befolkningen eller aktiviteten.',
      'Endringer i kategorier, skjemaer, registreringsplikt og tekniske systemer kan bryte tidsserier og skape kunstige historiske endringer.',
      'Å være registrert eller observert dokumenterer ikke at myndighetene forstod opplysningene, koblet dem sammen eller kunne kontrollere handlingene.'
    ],
    source_requirements: [
      'registerinstrukser, skjemaer, klassifikasjoner, tilgangsregler, tekniske systembeskrivelser og konkrete bruksspor',
      'kontroll av datadekning, kategoriskift, feil, sletting, omgåelse og de registrertes reaksjoner på overvåkningen'
    ]
  },
  theory_his_krise_unntak_kontinuitet: {
    definition: 'Undersøker hvordan institusjoner under krig, epidemi, økonomisk sammenbrudd eller annen erklært krise omfordeler kompetanse, fraviker regler, improviserer og samtidig viderefører rutiner. Modellen følger også hvordan midlertidige tiltak kan bli varige etter krisen.',
    limitations: [
      'Krise er en historisk aktørkategori og må dokumenteres; betegnelsen kan brukes strategisk for å utvide myndighet eller avpolitisere konflikt.',
      'Unntaksvedtak viser formelle fullmakter, men ikke hvor raskt, likt eller fullstendig de ble satt ut i livet.',
      'Institusjonell kontinuitet kan være opprettholdt gjennom utskiftet personell, nye uformelle praksiser eller store byrder for bestemte grupper.'
    ],
    source_requirements: [
      'krisevedtak, fullmakter, møtereferater, beredskapsplaner, ressursdisponering og dokumentasjon av faktisk gjennomføring',
      'før-, under- og etterkilder som viser hvilke unntak som ble avsluttet, normalisert eller videreført'
    ]
  },
  theory_his_rettsoppgjor_legitimitet_minne: {
    definition: 'Analyserer hvordan rettsoppgjør etter krig, okkupasjon eller regimeskifte forsøker å forene straff, rettssikkerhet, politisk legitimitet og samfunnets senere minne. Modellen følger hvordan skyldkategorier, prosessregler og fortellinger om oppgjøret endres over tid.',
    limitations: [
      'Et juridisk avsluttet oppgjør dokumenterer ikke sosial enighet om skyld, straff, rettferdighet eller forsoning.',
      'Seierherrenes institusjoner og arkiver kan skape asymmetri i hvilke handlinger som etterforskes, navngis og bevares.',
      'Senere minnekultur, politiske behov og nye kilder kan endre tolkningen av oppgjøret uten at samtidens juridiske rammer dermed forsvinner.'
    ],
    source_requirements: [
      'lovgrunnlag, tiltaler, dommer, benådning, administrative reaksjoner og samtidige offentlige begrunnelser for oppgjøret',
      'senere debatt, minnearbeid, forskning og berørte aktørers erfaringer som viser endringer i oppgjørets legitimitet og etterliv'
    ]
  }
};

const sourceTheoryById = new Map(sourceTargetTheories.map((item) => [item.theory_id, item]));
const currentTheoryIndex = new Map(currentTheories.map((item, index) => [item.theory_id, index]));
const expectedTheoryIds = Object.keys(theoryContent);
if (expectedTheoryIds.length !== 10) {
  throw new Error(`Expected 10 authored theory configurations, found ${expectedTheoryIds.length}`);
}
for (const theoryId of expectedTheoryIds) {
  const sourceTheory = sourceTheoryById.get(theoryId);
  const index = currentTheoryIndex.get(theoryId);
  if (!sourceTheory || index === undefined) {
    throw new Error(`Missing theory ${theoryId} in source or current registry`);
  }
  const authored = theoryContent[theoryId];
  currentTheories[index] = {
    ...sourceTheory,
    definition: authored.definition,
    limitations: authored.limitations,
    source_requirements: authored.source_requirements,
    status: 'canonical_v5_5_curated',
  };
}

const targetDefinitions = expectedTheoryIds.map((id) => theoryContent[id].definition);
const targetLimitationProfiles = expectedTheoryIds.map((id) => JSON.stringify(theoryContent[id].limitations));
if (new Set(targetDefinitions).size !== expectedTheoryIds.length ||
    new Set(targetLimitationProfiles).size !== expectedTheoryIds.length) {
  throw new Error('Power-domain theories must have unique definitions and limitation profiles');
}

writeJson(conceptsPath, currentConcepts);
writeJson(emnerPath, currentEmner);
writeJson(theoriesPath, currentTheories);

run('node', ['tools/validate-historie-v5.mjs', '--write']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'quiz:context']);
run('node', ['tools/validate-historie-v5.mjs', '--write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('git', ['diff', '--check']);

const readiness = readJson('reports/historie-v5/historie-v5-5-readiness.json');
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain || !domain.coverage_complete || !domain.freeze_ready ||
    domain.issue_counts?.emner !== 0 || domain.issue_counts?.concepts !== 0 || domain.issue_counts?.theories !== 0) {
  throw new Error(`Power domain did not reach freeze readiness: ${JSON.stringify(domain, null, 2)}`);
}

const previouslyFrozen = [
  'his_tid_periodisering',
  'his_kilder_arkiv_spor',
  'his_kjonn_familie_livslop',
  'his_religion_reformasjon_livssyn',
  'his_samisk_urfolkshistorie',
  'his_miljo_klima_landskap',
  'his_vitenskap_teknologi_kunnskap',
  'his_global_kolonial_transnasjonal'
];
for (const frozenDomainId of previouslyFrozen) {
  const frozenDomain = readiness.domains.find((item) => item.domain_id === frozenDomainId);
  if (!frozenDomain?.freeze_ready) {
    throw new Error(`Previously frozen domain regressed: ${frozenDomainId}`);
  }
}

const finalConcepts = readJson(conceptsPath).filter(belongsToDomain);
const finalTheories = readJson(theoriesPath).filter(belongsToDomain);
const finalEmner = readJson(emnerPath).filter((item) =>
  belongsToDomain(item) || String(item?.emne_id || '').startsWith('em_his_makt_'));
const remainingSyntheticConcepts = finalConcepts.filter((item) =>
  String(item.definition || '').includes('betegner «') || !item.broader_concepts || !item.related_concepts || !item.common_misuse?.length);
if (remainingSyntheticConcepts.length > 0) {
  throw new Error(`Power domain still has synthetic/incomplete concepts: ${remainingSyntheticConcepts.map((item) => item.concept_id).join(', ')}`);
}

const result = {
  version: 'historie-v5.5-makt-stat-institusjoner-curation-2',
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  status: 'CURATED_FREEZE_READY',
  concepts_in_domain: finalConcepts.length,
  concepts_imported: conceptsImported,
  curated_shared_concepts_preserved: curatedSharedConceptsPreserved,
  theories_curated: finalTheories.length,
  emner_corrected: finalEmner.length,
  renamed_noise_labels: {
    statlig: 'territoriell konsolidering'
  },
  domain_readiness: domain,
  freeze_ready_domains: readiness.domains.filter((item) => item.freeze_ready).length,
  global_quality_issue_totals: readiness.quality_issue_totals,
  global_v6_allowed: readiness.v6_allowed
};
writeJson(path.relative(root, resultPath), result);

const validationText = [
  'Historie V5.5 – Makt, stat og institusjoner',
  'Status: CURATED_FREEZE_READY',
  `Begreper i domenet: ${finalConcepts.length}`,
  `Begreper importert/kuratert i denne batchen: ${conceptsImported}`,
  `Allerede kuraterte fellesbegreper bevart: ${curatedSharedConceptsPreserved}`,
  `Teoriobjekter individuelt kuratert: ${finalTheories.length}`,
  `Emner korrigert: ${finalEmner.length}`,
  'Domene freeze_ready: true',
  'Domene kvalitetsfeil: emner=0, begreper=0, teorier=0',
  `Fryseklare domener totalt: ${result.freeze_ready_domains}/20`,
  `Resterende kvalitetsfeil: begreper=${readiness.quality_issue_totals.concepts}, teorier=${readiness.quality_issue_totals.theories}, emner=${readiness.quality_issue_totals.emner}`,
  `Global V6 tillatt: ${readiness.v6_allowed}`
].join('\n');
fs.writeFileSync(validationPath, `${validationText}\n`);
console.log(validationText);
