#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const claimsPath = path.join(historyDir, 'claims_historie_canonical_v1.json');
const sourcesPath = path.join(historyDir, 'sources_historie_canonical_v1.json');
const evidencePath = path.join(historyDir, 'place_evidence_historie_v1.json');
const theoryRegistryPath = path.join(historyDir, 'theory_evidence_historie_canonical_v1.json');
const theoriesPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const dossierPath = path.join(historyDir, 'source_dossiers/ritual_reception_v1.json');
const gapV3Path = path.join(root, 'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v3.json');
const gapV4Path = path.join(root, 'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v4.json');
const gapV4MdPath = path.join(root, 'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v4.md');
const profileReportPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.json');
const profileReportMdPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.md');
const theoryDocsPath = path.join(root, 'docs/HISTORY_THEORY_EVIDENCE.md');
const phaseDocsPath = path.join(root, 'docs/HISTORY_RITUAL_RECEPTION_EVIDENCE_V1.md');

const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); };
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pct = (ratio) => `${(ratio * 100).toFixed(1).replace('.', ',')} %`;

const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const evidenceFile = readJson(evidencePath);
const profile = readJson(profilePath);
const registry = readJson(theoryRegistryPath);
const theories = readJson(theoriesPath);
const gapV3 = readJson(gapV3Path);
const profileReport = readJson(profileReportPath);

if (registry.completion?.qualifying_entries !== 39) throw new Error(`Expected 39 qualifying theories, found ${registry.completion?.qualifying_entries}.`);
if (A(claimsFile.claims).length !== 48) throw new Error(`Expected 48 claims, found ${A(claimsFile.claims).length}.`);
if (A(sourcesFile.sources).length !== 44) throw new Error(`Expected 44 sources, found ${A(sourcesFile.sources).length}.`);
if (A(evidenceFile.evidence_links).length !== 48) throw new Error(`Expected 48 evidence links, found ${A(evidenceFile.evidence_links).length}.`);

const caseRequirements = [
  'case_req_his_temporal_sequence',
  'case_req_his_actor_conflict',
  'case_req_his_source_comparison',
  'case_req_his_comparative_scale',
];
const memorialEmnes = [
  'em_his_jubileum_seremoni_historiebruk',
  'em_his_minnesteder_historiebruk',
  'em_his_samtid_ettertid_fortelling',
  'em_his_terror_samtidshistorie',
];
const veteranEmnes = [
  'em_his_jubileum_seremoni_historiebruk',
  'em_his_minnesteder_historiebruk',
  'em_his_okkupasjon_motstand',
  'em_his_samtid_ettertid_fortelling',
];

const sourceSpecs = [
  {
    source_id: 'src_his_22juli_center_social_media_grief_rituals',
    title: 'Sosiale medier og kjærlighetsfortellingen om 22. juli',
    publisher: '22. juli-senteret',
    source_type: 'memory_center_scholarly_article',
    url: 'https://www.22julisenteret.no/no/fordyp-deg/fagartikler/sosiale-medier-og-kjaerlighetsfortellingen-om-22-juli',
    temporal_scope: { from: 2011, to: 2011 },
    supported_dimensions: 'Fagartikkel om hvordan Facebook og Twitter organiserte rosetog og gjorde deling av bilder, sorg og fellesskap til en del av sorgritualet etter 22. juli.',
    limitations: [
      'Artikkelen analyserer særlig positive fellesskapsfortellinger i sosiale medier og kan underrepresentere ambivalens, konflikt, fravær og personer som ikke deltok digitalt.',
      'Eksemplene er kuratert av minne- og læringssenteret og erstatter ikke en komplett plattformdatabase eller representative intervjuer med alle deltakergrupper.',
    ],
  },
  {
    source_id: 'src_his_22juli_center_stoltenberg_radhusplassen_2011',
    title: 'Statsminister Jens Stoltenbergs tale på Rådhusplassen 25. juli 2011',
    publisher: '22. juli-senteret',
    source_type: 'archived_public_speech',
    url: 'https://www.22julisenteret.no/aktuelt/artikler/statsminister-Jens-Stoltenberg-tale-pa-radshusplassen-i-oslo-25-juli-2011',
    temporal_scope: { from: '2011-07-25', to: '2011-07-25' },
    supported_dimensions: 'Samtidig offentlig tale og bilde som stedfester rosemarkeringen på Rådhusplassen og dokumenterer roser, fakler, folkemengde og demokratisk fortolkning.',
    limitations: [
      'Talen er en politisk og performativ aktørkilde som søker å samle fellesskapet og kan ikke brukes som representativ beskrivelse av alle deltakernes følelser eller politiske reaksjoner.',
      'Formuleringen om tusener og folkevilje er retorisk og gir ikke et kontrollert deltakertall eller sosial sammensetning av forsamlingen.',
    ],
  },
  {
    source_id: 'src_his_regjeringen_22july_memorials_2015',
    title: 'Minnemarkeringar 22. juli',
    publisher: 'Regjeringen.no',
    source_type: 'official_memorial_program',
    url: 'https://www.regjeringen.no/no/sub/etter-22-juli/nyheter-om-22.-juli/minnemarkeringar-22.-juli/id2427598/',
    temporal_scope: { from: '2015-07-22', to: '2015-07-22' },
    supported_dimensions: 'Offisielt program for fireårsmarkeringen i Regjeringskvartalet med taler, kransenedleggelse, gudstjeneste og markering på Utøya.',
    limitations: [
      'Programmet dokumenterer planlagt institusjonell iscenesettelse, men ikke faktisk deltakelse, publikumsopplevelse eller hvordan ritualene ble mottatt.',
      'Regjeringens program prioriterer offisielle aktører og kan underrepresentere spontane, alternative eller kritiske minnepraksiser.',
    ],
  },
  {
    source_id: 'src_his_regjeringen_22july_program_2026',
    title: 'Program 15-års minnemarkeringer 22. juli 2026',
    publisher: 'Regjeringen.no',
    source_type: 'official_memorial_program',
    url: 'https://www.regjeringen.no/no/sub/etter-22-juli/nyheter-om-22.-juli/program-15-ars-minnemarkeringer-22.-juli-2026/id3167581/',
    temporal_scope: { from: '2026-07-22', to: '2026-07-22' },
    supported_dimensions: 'Detaljert offisielt program for Regjeringskvartalet og Utøya med støttegruppe, AUF, taler, musikk, navneopplesning, stillhet, blomster og kranser.',
    limitations: [
      'Programmet viser planlagt sekvens og navngitte roller, men dokumenterer ikke alle deltakeres erfaringer eller om hele programmet ble gjennomført nøyaktig som planlagt.',
      'Offisiell programtekst synliggjør inviterte organisasjoner og myndigheter sterkere enn uformelle deltakere, fraværende grupper og kritiske reaksjoner.',
    ],
  },
  {
    source_id: 'src_his_regjeringen_22july_store_speech_2026',
    title: 'Statsministerens tale ved minnemarkeringen i Regjeringskvartalet',
    publisher: 'Regjeringen.no',
    source_type: 'official_public_speech',
    url: 'https://www.regjeringen.no/no/aktuelt/statsministerens-tale-ved-minnemarkeringen-i-regjeringskvartalet/id3169237/',
    temporal_scope: { from: '2026-07-22', to: '2026-07-22' },
    supported_dimensions: 'Tale som henvender seg direkte til overlevende, etterlatte og venner og knytter minnestedet og det nye senteret til å se, lære, spørre og forstå.',
    limitations: [
      'Talen er en normativ politisk fortolkning og kan ikke brukes som direkte uttrykk for alle overlevendes, etterlattes eller publikums opplevelser.',
      'Kilden dokumenterer én offentlig stemme og må sammenholdes med støttegruppens, AUFs og andre berørtes egne utsagn ved resepsjonsanalyse.',
    ],
  },
  {
    source_id: 'src_his_forsvaret_veterandagen_2026_program',
    title: 'Frigjørings- og veterandagen',
    publisher: 'Forsvaret',
    source_type: 'official_ceremony_program',
    url: 'https://www.forsvaret.no/veteraner/veterandagen',
    temporal_scope: { from: '2026-05-08', to: '2026-05-08' },
    supported_dimensions: 'Offisielt program for hovedarrangementet på Akershus festning med flaggheis, kranser, gudstjeneste, salutt, soldatenes tale og medaljeseremoni.',
    limitations: [
      'Programmet dokumenterer planlagt seremoni og institusjonell anerkjennelse, men ikke hvordan veteraner, familier eller publikum opplevde dagen.',
      'Hovedarrangementet i Oslo representerer ikke nødvendigvis lokale markeringer eller veteraners forskjellige erfaringer på tvers av operasjoner og generasjoner.',
    ],
  },
  {
    source_id: 'src_his_forsvaret_8may_2026_recap',
    title: 'Noreg feira veteranane og 81 år med fridom',
    publisher: 'Forsvaret',
    source_type: 'official_event_report',
    url: 'https://www.forsvaret.no/aktuelt-og-presse/aktuelt/8mai26',
    temporal_scope: { from: '2026-05-08', to: '2026-05-08' },
    supported_dimensions: 'Etterrapport som kobler frigjøringen i 1945 til anerkjennelsen av veteraner og dokumenterer hovedseremonien og de institusjonelle deltakerne på Akershus.',
    limitations: [
      'Forsvarets egen etterrapport har et anerkjennende formål og gir begrenset plass til kritikk av veteranpolitikk, manglende støtte eller grupper som opplever svak anerkjennelse.',
      'Oppsummeringen dokumenterer den offisielle hendelsen, men ikke et representativt utvalg av veteraners helse, hjemkomst eller familieerfaringer.',
    ],
  },
  {
    source_id: 'src_his_forsvaret_8may_2018_honored_veterans',
    title: 'Hedret veteraner',
    publisher: 'Forsvaret',
    source_type: 'official_veteran_recognition_report',
    url: 'https://www.forsvaret.no/aktuelt-og-presse/arkiv/aktuelt/hedret-veteraner',
    temporal_scope: { from: '2018-05-08', to: '2018-05-08' },
    supported_dimensions: 'Offisiell reportasje fra medaljeseremonien på Akershus som knytter offentlig anerkjennelse til navngitte innsatsfortellinger fra internasjonale operasjoner.',
    limitations: [
      'Medaljemottakerne er selektert for ekstraordinær innsats og kan ikke brukes som representative for alle veteraners tjeneste- eller hjemkomsterfaringer.',
      'Reportasjen er produsert av Forsvaret og framhever mot og anerkjennelse sterkere enn belastninger, uenighet eller utilstrekkelig oppfølging.',
    ],
  },
  {
    source_id: 'src_his_forsvaret_8may_2025_program',
    title: '8. mai markerer vi 80 år med frihet',
    publisher: 'Forsvaret',
    source_type: 'official_ceremony_program',
    url: 'https://www.forsvaret.no/aktuelt-og-presse/presse/pressemeldinger/presseinvitasjon-8.mai-markerer-vi-80-ar-med-frihet',
    temporal_scope: { from: '2025-05-08', to: '2025-05-08' },
    supported_dimensions: 'Offisielt program som dokumenterer kransenedleggelser ved Normandiemonumentet, Retterstedet og Nasjonalt veteranmonument på Akershus.',
    limitations: [
      'Presseinvitasjonen dokumenterer planlagt program, ikke faktisk gjennomføring, deltakertall eller mottakelse.',
      'Kilden gir institusjonenes seremonielle perspektiv og inneholder ikke veteraners eller etterlattes egne vurderinger av ritualets betydning.',
    ],
  },
];

const dossier = {
  schema_version: '1.0',
  dossier_id: 'history_ritual_reception_evidence_v1',
  subject_id: 'historie',
  geography_id: 'geo_no_oslo_akershus',
  status: 'canonical_source_provenance',
  scope: 'public_grief_memorial_ritual_war_memory_veteran_recognition_and_aftereffects',
  accessed_at: '2026-07-27',
  sources: Object.fromEntries(sourceSpecs.map((item) => [item.source_id, {
    title: item.title,
    publisher: item.publisher,
    url: item.url,
    source_type: item.source_type,
    supported_dimensions: item.supported_dimensions,
    limitations: item.limitations,
  }])),
};
writeJson(dossierPath, dossier);

const existingSourceIds = new Set(A(sourcesFile.sources).map((item) => item.source_id));
for (const spec of sourceSpecs) {
  if (existingSourceIds.has(spec.source_id)) throw new Error(`Duplicate source_id ${spec.source_id}.`);
  sourcesFile.sources.push({
    source_id: spec.source_id,
    title: spec.title,
    publisher: spec.publisher,
    source_type: spec.source_type,
    url: spec.url,
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: spec.temporal_scope,
    provenance: {
      repository_source: 'data/fag/historie/source_dossiers/ritual_reception_v1.json',
      extracted_from: [`sources.${spec.source_id}`],
      accessed_at: '2026-07-27',
    },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: spec.limitations,
    quality: { tier: 'A', rationale: 'Offisiell eller institusjonsforvaltet kilde med eksplisitt sted-, dato- og aktørforankring for ritual, minne eller veteranmarkering.' },
  });
  existingSourceIds.add(spec.source_id);
}

const claimSpecs = [
  {
    claim_id: 'claim_his_radhusplassen_rose_march_2011_public_grief',
    statement: 'På Rådhusplassen 25. juli 2011 samlet tusener seg med roser og fakler i en offentlig sorg- og demokratimarkering etter terrorangrepene 22. juli.',
    claim_type: 'public_grief_mass_ritual', place_id: 'radhusplassen', case_id: 'case_his_oslo_radhus', temporal: { from: '2011-07-25', to: '2011-07-25' }, emne_ids: memorialEmnes,
    source_ids: ['src_his_22juli_center_stoltenberg_radhusplassen_2011'],
    uncertainty: 'Talen dokumenterer sted, symboler og en stor folkemengde, men gir ikke et kontrollert deltakertall eller representative deltakerintervjuer.',
    alternative: 'Markeringen kan leses som kollektiv sorg og demokratisk samling, men den politiske talen kan også ha stabilisert en samlende fortelling som ikke rommet alle reaksjoner.',
  },
  {
    claim_id: 'claim_his_radhusplassen_social_media_organized_rituals_2011',
    statement: 'Facebook og Twitter ble brukt til å organisere rosetog og dele bilder og erfaringer fra rosetog og spontane minnesteder, slik at digital deltakelse ble vevd sammen med sorg, fellesskap og fysisk offentlig ritual.',
    claim_type: 'digitally_coordinated_grief_ritual', place_id: 'radhusplassen', case_id: 'case_his_oslo_radhus', temporal: { from: '2011-07-22', to: '2011-07-31' }, emne_ids: memorialEmnes,
    source_ids: ['src_his_22juli_center_social_media_grief_rituals'],
    uncertainty: 'Kilden viser dokumenterte digitale praksiser og eksempler, men ikke et komplett eller representativt datasett over alle innlegg og deltakere.',
    alternative: 'Digital deling kan forstås som utvidet offentlig deltakelse, men også som selektiv synliggjøring der positive fellesskapsuttrykk ble mer fremtredende enn konflikt og fravær.',
  },
  {
    claim_id: 'claim_his_regjeringskvartalet_22july_memorial_2015_wreath_speeches',
    statement: 'Fireårsmarkeringen i Regjeringskvartalet 22. juli 2015 besto av taler fra støttegruppen, statsministeren, AUF og Europarådet samt kransenedleggelse før 22. juli-senteret åpnet for publikum samme dag.',
    claim_type: 'official_memorial_program', place_id: 'regjeringskvartalet', case_id: 'case_his_regjeringskvartalet', temporal: { from: '2015-07-22', to: '2015-07-22' }, emne_ids: memorialEmnes,
    source_ids: ['src_his_regjeringen_22july_memorials_2015'],
    uncertainty: 'Programmet dokumenterer den planlagte offisielle sekvensen, men ikke alle faktiske deltakere eller deres mottakelse.',
    alternative: 'Programmet kan leses som institusjonalisering av minnet, men også som en offentlig ramme der myndigheter og organiserte berørte fikk ulik taletid og autoritet.',
  },
  {
    claim_id: 'claim_his_regjeringskvartalet_22july_memorial_2026_name_reading',
    statement: 'Femtenårsmarkeringen i Regjeringskvartalet 22. juli 2026 samlet støttegruppen, AUF og regjeringen i et program med taler, musikk og opplesning av navnene på de åtte drepte i Regjeringskvartalet og de 69 drepte på Utøya.',
    claim_type: 'participant_led_name_ritual', place_id: 'regjeringskvartalet', case_id: 'case_his_regjeringskvartalet', temporal: { from: '2026-07-22', to: '2026-07-22' }, emne_ids: memorialEmnes,
    source_ids: ['src_his_regjeringen_22july_program_2026', 'src_his_regjeringen_22july_store_speech_2026'],
    uncertainty: 'Kildene dokumenterer program og offentlig tale, men ikke hele publikums sammensetning eller individuelle sorgopplevelser.',
    alternative: 'Navneopplesningen kan forstås som individualisering av tapet, men rekkefølge, taleroller og institusjonell ramme former samtidig hvordan fellesskapet fortolkes.',
  },
  {
    claim_id: 'claim_his_regjeringskvartalet_22july_memorial_repetition_2015_2026',
    statement: 'De offisielle programmene fra 2015 og 2026 viser at 22. juli-markeringen i Regjeringskvartalet ble gjentatt over tid, samtidig som ritualet ble utvidet fra taler og krans til et mer detaljert program med navneopplesning, flere berørte aktører og et nytt permanent senter.',
    claim_type: 'ritual_repetition_and_change', place_id: 'regjeringskvartalet', case_id: 'case_his_regjeringskvartalet', temporal: { from: 2015, to: 2026 }, emne_ids: memorialEmnes,
    source_ids: ['src_his_regjeringen_22july_memorials_2015', 'src_his_regjeringen_22july_program_2026'],
    uncertainty: 'Sammenligningen dokumenterer programendring mellom to år, men ikke kontinuerlig utvikling for hvert mellomliggende år.',
    alternative: 'Endringene kan tolkes som modning av minnepraksisen, men kan også skyldes jubileumsformat, byggeprosesser og skiftende arrangører.',
  },
  {
    claim_id: 'claim_his_akershus_8may_2026_multi_site_ritual_sequence',
    statement: 'Hovedarrangementet på Akershus festning 8. mai 2026 fulgte en flerleddet seremoni med flaggheis, kransenedleggelser, gudstjeneste, salutt, soldatenes tale, hovedseremoni og medaljeutdeling.',
    claim_type: 'multi_site_commemorative_sequence', place_id: 'akershus_festning', case_id: 'case_his_akershus_festning', temporal: { from: '2026-05-08', to: '2026-05-08' }, emne_ids: veteranEmnes,
    source_ids: ['src_his_forsvaret_veterandagen_2026_program', 'src_his_forsvaret_8may_2026_recap'],
    uncertainty: 'Program og etterrapport dokumenterer den offisielle sekvensen, men ikke alle lokale variasjoner eller publikumsopplevelser.',
    alternative: 'Sekvensen kan leses som kobling mellom krigsminne og nåtidig veteranstatus, men også som en statlig seremoni der institusjonell orden dominerer over individuelle erfaringer.',
  },
  {
    claim_id: 'claim_his_akershus_8may_2026_liberation_veteran_link',
    statement: 'Frigjørings- og veterandagen 8. mai 2026 koblet minnet om frigjøringen i 1945 til offentlig anerkjennelse av veteraner som har tjenestegjort for Norge hjemme og ute, med nasjonal hovedseremoni på Akershus festning.',
    claim_type: 'official_memory_veteran_link', place_id: 'akershus_festning', case_id: 'case_his_akershus_festning', temporal: { from: 1945, to: 2026 }, emne_ids: veteranEmnes,
    source_ids: ['src_his_forsvaret_8may_2026_recap'],
    uncertainty: 'Den offisielle koblingen dokumenterer anerkjennelsespolitikk, men ikke at alle veteraner identifiserer seg med samme historiske fortelling.',
    alternative: 'Sammenkoblingen kan styrke kontinuitet og anerkjennelse, men kan også overskygge forskjeller mellom okkupasjonserfaring, internasjonale operasjoner og hjemkomst.',
  },
  {
    claim_id: 'claim_his_akershus_2018_medal_recipient_experiences',
    statement: 'Under frigjørings- og veterandagen på Akershus festning i 2018 fikk ti personer medalje for innsats i internasjonale operasjoner, og Forsvarets reportasje knyttet anerkjennelsen til erfaringer med frykt, ansvar, adrenalin og risikofylte beslutninger.',
    claim_type: 'veteran_experience_public_recognition', place_id: 'akershus_festning', case_id: 'case_his_akershus_festning', temporal: { from: '2018-05-08', to: '2018-05-08' }, emne_ids: veteranEmnes,
    source_ids: ['src_his_forsvaret_8may_2018_honored_veterans'],
    uncertainty: 'Medaljemottakernes historier er selekterte ekstraordinære eksempler og representerer ikke alle veteraners erfaringer.',
    alternative: 'Medaljene kan forstås som offentlig anerkjennelse av erfaring, men seleksjonen kan også etablere et ideal om heroisk innsats som gjør andre ettervirkninger mindre synlige.',
  },
  {
    claim_id: 'claim_his_akershus_rettersted_wreath_recurrence_2025_2026',
    statement: 'Programmene for 8. mai i 2025 og 2026 viser gjentatt kransenedleggelse på Retterstedet på Akershus festning til minne om norske patrioter som ble henrettet der under okkupasjonen.',
    claim_type: 'recurring_war_dead_commemoration', place_id: 'akershus_festning', case_id: 'case_his_akershus_festning', temporal: { from: 2025, to: 2026 }, emne_ids: veteranEmnes,
    source_ids: ['src_his_forsvaret_8may_2025_program', 'src_his_forsvaret_veterandagen_2026_program'],
    uncertainty: 'Kildene dokumenterer to påfølgende programmer, men ikke hele ritualets historikk eller alle tidligere års gjennomføring.',
    alternative: 'Gjentakelsen kan leses som stabil nasjonal minnepraksis, men hvem som omtales som patrioter og hvilke krigserfaringer som inngår, er også resultat av minnepolitisk utvalg.',
  },
];

const existingClaimIds = new Set(A(claimsFile.claims).map((item) => item.claim_id));
for (const spec of claimSpecs) {
  if (existingClaimIds.has(spec.claim_id)) throw new Error(`Duplicate claim_id ${spec.claim_id}.`);
  for (const sourceId of spec.source_ids) if (!existingSourceIds.has(sourceId)) throw new Error(`Unknown source ${sourceId}.`);
  claimsFile.claims.push({
    claim_id: spec.claim_id,
    statement: spec.statement,
    claim_type: spec.claim_type,
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: [spec.place_id], case_ids: [spec.case_id], temporal: spec.temporal },
    emne_ids: spec.emne_ids,
    source_ids: spec.source_ids,
    confidence: 'high',
    uncertainty: { level: 'medium', note: spec.uncertainty },
    alternative_interpretations: [spec.alternative],
  });
  existingClaimIds.add(spec.claim_id);
}

const caseById = new Map(A(profile.cases).map((item) => [item.case_id, item]));
const osloRadhusCase = caseById.get('case_his_oslo_radhus');
const regjeringsCase = caseById.get('case_his_regjeringskvartalet');
const akershusCase = caseById.get('case_his_akershus_festning');
if (!osloRadhusCase || !regjeringsCase || !akershusCase) throw new Error('Required profile cases are missing.');
osloRadhusCase.place_ids = sorted([...A(osloRadhusCase.place_ids), 'radhusplassen']);
osloRadhusCase.emne_ids = sorted([...A(osloRadhusCase.emne_ids), ...memorialEmnes]);
osloRadhusCase.validation = { ...osloRadhusCase.validation, additional_batch_ids: sorted([...A(osloRadhusCase.validation?.additional_batch_ids), 'history_ritual_reception_evidence_v1']), scope_expanded_at: '2026-07-27' };
regjeringsCase.status = 'pilot_validated';
regjeringsCase.evidence_status = 'claim_source_linked';
regjeringsCase.place_ids = ['regjeringskvartalet'];
regjeringsCase.emne_ids = sorted([...A(regjeringsCase.emne_ids), ...memorialEmnes]);
regjeringsCase.case_requirement_ids = caseRequirements;
regjeringsCase.validation = { status: 'validated_case', batch_id: 'history_ritual_reception_evidence_v1', validated_at: '2026-07-27', minimum_evidence_links: 2, source_policy: 'canonical_registry_with_explicit_limitations' };
akershusCase.emne_ids = sorted([...A(akershusCase.emne_ids), ...veteranEmnes]);
akershusCase.validation = { ...akershusCase.validation, additional_batch_ids: sorted([...A(akershusCase.validation?.additional_batch_ids), 'history_ritual_reception_evidence_v1']), scope_expanded_at: '2026-07-27' };

function linkCaseToEmne(caseId, emneId) {
  let mapping = A(profile.emne_case_mappings).find((item) => item.emne_id === emneId);
  if (!mapping) {
    mapping = { emne_id: emneId, case_ids: [], case_requirement_ids: caseRequirements };
    profile.emne_case_mappings.push(mapping);
  }
  mapping.case_ids = sorted([...A(mapping.case_ids), caseId]);
  mapping.case_requirement_ids = sorted([...A(mapping.case_requirement_ids), ...caseRequirements]);
}
for (const emneId of memorialEmnes) {
  linkCaseToEmne('case_his_oslo_radhus', emneId);
  linkCaseToEmne('case_his_regjeringskvartalet', emneId);
}
for (const emneId of veteranEmnes) linkCaseToEmne('case_his_akershus_festning', emneId);
profile.emne_case_mappings.sort((a, b) => a.emne_id.localeCompare(b.emne_id, 'nb'));

const existingEvidenceIds = new Set(A(evidenceFile.evidence_links).map((item) => item.evidence_id));
const evidenceIdsByCase = {
  case_his_oslo_radhus: ['evidence_his_oslo_radhus_05', 'evidence_his_oslo_radhus_06'],
  case_his_regjeringskvartalet: ['evidence_his_regjeringskvartalet_01', 'evidence_his_regjeringskvartalet_02', 'evidence_his_regjeringskvartalet_03'],
  case_his_akershus_festning: ['evidence_his_akershus_festning_03', 'evidence_his_akershus_festning_04', 'evidence_his_akershus_festning_05', 'evidence_his_akershus_festning_06'],
};
const evidenceCursor = new Map(Object.entries(evidenceIdsByCase).map(([key, values]) => [key, [...values]]));
for (const spec of claimSpecs) {
  const evidenceId = evidenceCursor.get(spec.case_id)?.shift();
  if (!evidenceId) throw new Error(`No evidence ID allocated for ${spec.claim_id}.`);
  if (existingEvidenceIds.has(evidenceId)) throw new Error(`Duplicate evidence_id ${evidenceId}.`);
  evidenceFile.evidence_links.push({
    evidence_id: evidenceId,
    profile_id: 'profile_historie_no_oslo_akershus',
    geography_id: 'geo_no_oslo_akershus',
    place_id: spec.place_id,
    case_id: spec.case_id,
    emne_ids: spec.emne_ids,
    claim_id: spec.claim_id,
    source_ids: spec.source_ids,
    support_type: spec.source_ids.length > 1 ? 'corroborated' : 'direct_single_source',
    validation_status: 'validated_case',
    limitations_inherited: true,
    note: 'Ritual- og resepsjonsevidens V1 med eksplisitt skille mellom offisielt program, deltakerrolle, offentlig sorg, veteranerfaring og dokumentert resepsjonsbegrensning.',
  });
  existingEvidenceIds.add(evidenceId);
}

profile.cases.sort((a, b) => a.case_id.localeCompare(b.case_id, 'nb'));
const verifiedCases = A(profile.cases).filter((item) => item.evidence_status === 'claim_source_linked').length;
const unverifiedCases = A(profile.cases).length - verifiedCases;
profile.migration_summary.validated_cases = verifiedCases;
profile.migration_summary.unverified_case_candidates = unverifiedCases;
profile.production_coverage.cases_total = A(profile.cases).length;
profile.production_coverage.claims_total = A(claimsFile.claims).length;
profile.production_coverage.sources_total = A(sourcesFile.sources).length;
profile.production_coverage.evidence_links_total = A(evidenceFile.evidence_links).length;
profile.production_coverage.verified_cases_total = verifiedCases;
profile.production_coverage.interpretation = 'Profilen har et representativt minimumsgrunnlag og er utvidet med ritual-, sorg- og veteranbaner for Rådhusplassen, Regjeringskvartalet og Akershus festning. Fullført profilstatus gjelder minimumsgrunnlaget; dokumentert arkivtaushet og universell teori-evidens er fortsatt eksplisitt produksjonskø.';

writeJson(claimsPath, claimsFile);
writeJson(sourcesPath, sourcesFile);
writeJson(evidencePath, evidenceFile);
writeJson(profilePath, profile);

const claimById = new Map(A(claimsFile.claims).map((item) => [item.claim_id, item]));
const evidenceByClaim = new Map(A(evidenceFile.evidence_links).map((item) => [item.claim_id, item]));
const theoryIds = new Set(A(theories).map((item) => item.theory_id));
const registryTheoryIds = new Set(A(registry.entries).map((item) => item.theory_id));
const theorySpecs = [
  {
    theory_id: 'theory_his_minnested_ritual_offentlig_sorg',
    claim_ids: [
      'claim_his_radhusplassen_rose_march_2011_public_grief',
      'claim_his_radhusplassen_social_media_organized_rituals_2011',
      'claim_his_regjeringskvartalet_22july_memorial_2015_wreath_speeches',
      'claim_his_regjeringskvartalet_22july_memorial_2026_name_reading',
      'claim_his_regjeringskvartalet_22july_memorial_repetition_2015_2026',
      'claim_his_akershus_8may_2026_multi_site_ritual_sequence',
    ],
    rationale: 'Rådhusplassen dokumenterer spontan og digitalt koordinert offentlig sorg, Regjeringskvartalet viser hvordan 22. juli-markeringen gjentas og endres med navneopplesning og berørte aktører, og Akershus viser en statlig flerleddet minneseremoni. Samlet prøves samspillet mellom tap, sted, gjentakelse, offentlig deltakelse og institusjonell ramme.',
    limitations: [
      'Kildene dokumenterer taler, programmer og kuraterte digitale uttrykk bedre enn representative publikumsintervjuer, kroppslige erfaringer og personer som valgte å ikke delta.',
      'Rosemarkeringen, 22. juli-jubileet og frigjørings- og veterandagen har ulike tapshistorier og politiske formål og kan ikke behandles som ett enhetlig sorgritual.',
    ],
    alternative: 'Casene kan leses som kollektiv bearbeiding og demokratisk fellesskap, men også som ritualer der myndigheter, arrangører og synlige symboler former hvem som får tale og hvilke reaksjoner som blir offentlige.',
    disconfirmation: 'Anvendelsen svekkes dersom planlagt program brukes som bevis for faktisk mottakelse, eller dersom høy synlighet ved én markering generaliseres til et varig og enhetlig kollektivt minne.',
  },
  {
    theory_id: 'theory_his_krig_okkupasjon_krigsminne_veteraner_og_ettervirkninger',
    claim_ids: [
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_villa_grande_gimle_quisling_residence_1941',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_akershus_8may_2026_multi_site_ritual_sequence',
      'claim_his_akershus_8may_2026_liberation_veteran_link',
      'claim_his_akershus_2018_medal_recipient_experiences',
      'claim_his_akershus_rettersted_wreath_recurrence_2025_2026',
    ],
    rationale: 'Akershus festning kobler okkupasjon, henrettelsesminne, frigjøringsdag, veteranstatus, medaljer og konkrete innsatsfortellinger, mens Villa Grande viser etterkrigstidens kritiske omforming av et kollaborasjonsregimes maktsted. Casene gjør det mulig å sammenligne offisiell anerkjennelse, krigsminne og institusjonell bearbeiding av ettervirkninger.',
    limitations: [
      'Medaljemottakere og hovedseremonier overrepresenterer institusjonelt anerkjente veteraner og dokumenterer ikke bredden i helse, familiebelastning, erstatning, hjemkomst eller manglende støtte.',
      'Villa Grande dokumenterer kollaborasjon og kritisk minnearbeid, men ikke veteraners egne erfaringer; Akershus-materialet må derfor ikke gjøres til en samlet historie om alle krigens ettervirkninger.',
    ],
    alternative: 'Offentlige ritualer og institusjoner kan forstås som anerkjennelse og demokratisk bearbeiding, men også som selektiv minnepolitikk der heroiske og nasjonale fortellinger får større plass enn konflikt, skade og ekskluderte grupper.',
    disconfirmation: 'Anvendelsen svekkes dersom offisiell veteranstatus, medalje eller monument brukes som representativt mål på faktisk tjenesteerfaring og ettervirkning uten supplerende helse-, familie-, organisasjons- og erfaringskilder.',
  },
];

for (const spec of theorySpecs) {
  if (!theoryIds.has(spec.theory_id)) throw new Error(`Unknown theory ${spec.theory_id}.`);
  if (registryTheoryIds.has(spec.theory_id)) throw new Error(`Theory already qualified ${spec.theory_id}.`);
  const bundle = spec.claim_ids.map((id) => {
    const claim = claimById.get(id); if (!claim) throw new Error(`Unknown claim ${id}.`);
    const evidence = evidenceByClaim.get(id); if (!evidence || !['validated_case', 'validated_pilot'].includes(evidence.validation_status)) throw new Error(`Claim lacks evidence ${id}.`);
    return { claim, evidence };
  });
  registry.entries.push({
    theory_id: spec.theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids: spec.claim_ids,
    source_ids: sorted(bundle.flatMap(({ claim }) => A(claim.source_ids))),
    case_ids: sorted(bundle.flatMap(({ claim }) => A(claim.scope?.case_ids))),
    place_ids: sorted(bundle.flatMap(({ claim }) => A(claim.scope?.place_ids))),
    emne_ids: sorted(bundle.flatMap(({ claim }) => A(claim.emne_ids))),
    evidence_link_ids: sorted(bundle.map(({ evidence }) => evidence.evidence_id)),
    evidence_dimensions: ['documented_application', 'limitation_test', 'alternative_interpretation', 'multi_case_comparison', 'participant_and_ritual_evidence'],
    rationale: spec.rationale,
    limitations: spec.limitations,
    alternative_interpretations: [spec.alternative],
    disconfirmation_conditions: [spec.disconfirmation],
    scope_note: 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, aktørgrupper og kildetyper.',
  });
  registryTheoryIds.add(spec.theory_id);
}
registry.entries.sort((a, b) => a.theory_id.localeCompare(b.theory_id, 'nb'));
registry.completion = { total_theories: 230, qualifying_entries: registry.entries.length, ratio: Math.round((registry.entries.length / 230) * 1000) / 1000, pilot_target: 10, universal_target_ratio: 1, universal_status: registry.entries.length === 230 ? 'COMPLETE' : 'INCOMPLETE' };
writeJson(theoryRegistryPath, registry);

const ritualCategory = A(gapV3.categories).find((item) => item.category_id === 'ritual_reception_and_experience');
if (!ritualCategory) throw new Error('Missing ritual_reception_and_experience gap category.');
const gapV4 = {
  schema_version: '4.0',
  report_id: 'history_theory_evidence_gap_inventory_v4',
  subject_id: 'historie',
  status: 'ACTIVE_PRODUCTION_DEPENDENCY_MAP',
  authority_note: gapV3.authority_note,
  baseline: { total_theories: 230, qualifying_after_ritual_reception_v1: registry.entries.length, remaining_theories: 230 - registry.entries.length, ratio: registry.completion.ratio, universal_status: registry.completion.universal_status },
  resolved_categories: A(gapV3.resolved_categories),
  partially_resolved_categories: [{
    category_id: 'ritual_reception_and_experience',
    status: 'partially_resolved_v1_two_of_three_theories_qualified',
    qualified_theory_ids: theorySpecs.map((item) => item.theory_id),
    remaining_theory_ids: ['theory_his_taushet_fravaer'],
    resolution: {
      phase_id: 'history_ritual_reception_evidence_v1',
      new_claim_ids: claimSpecs.map((item) => item.claim_id),
      new_source_ids: sourceSpecs.map((item) => item.source_id),
      newly_verified_case_ids: ['case_his_regjeringskvartalet'],
      expanded_case_ids: ['case_his_oslo_radhus', 'case_his_akershus_festning'],
      note: 'Minnested/ritual og krigsminne/veteraner er kvalifisert med deltaker-, program-, repetisjons- og erfaringsclaims. Arkivtaushet holdes tilbake til et konkret forventet, men manglende eller tapt spor er dokumentert.',
    },
  }],
  categories: [
    ...A(gapV3.categories).filter((item) => item.category_id !== 'ritual_reception_and_experience'),
    {
      category_id: 'ritual_reception_and_experience',
      status: 'partially_resolved_requires_documented_archival_absence',
      theory_ids: ['theory_his_taushet_fravaer'],
      requirement: 'Et konkret case der det finnes en begrunnet forventning om at bestemte kilder burde ha blitt produsert, bevart og funnet, men der fraværet eller tapet kan dokumenteres med proveniens og alternative forklaringer.',
      reason: 'Minnestedsprogrammer og institusjonelle utvalg kan synliggjøre seleksjon, men dokumenterer ikke alene arkivtaushet i teoriens strenge betydning.',
    },
  ],
  source_fingerprints: {},
  production_rule: gapV3.production_rule,
};
writeJson(gapV4Path, gapV4);
gapV4.source_fingerprints = Object.fromEntries([
  theoriesPath, theoryRegistryPath, claimsPath, sourcesPath, evidencePath, profilePath, dossierPath,
].map((file) => [path.relative(root, file).split(path.sep).join('/'), sha256(file)]));
writeJson(gapV4Path, gapV4);
const gapMd = [
  '# Historie — teori-evidens gap-inventar V4', '',
  'Status: **ACTIVE_PRODUCTION_DEPENDENCY_MAP**', '',
  '- Teoriobjekter totalt: **230**',
  `- Kvalifiserende etter ritual og resepsjon V1: **${registry.entries.length}**`,
  `- Gjenstående: **${230 - registry.entries.length}**`,
  `- Andel: **${(registry.completion.ratio * 100).toFixed(1)} %**`,
  '- Universell status: **INCOMPLETE**', '',
  '## Løst i V1', '',
  ...A(gapV4.resolved_categories).map((item) => `- \`${item.category_id}\``), '',
  '## Delvis løst i V1', '',
  '- `ritual_reception_and_experience`: to av tre teoriobjekter kvalifisert; `theory_his_taushet_fravaer` krever dokumentert arkivfravær.', '',
  '## Aktive produksjonsavhengigheter', '',
  ...A(gapV4.categories).map((item) => `- \`${item.category_id}\`: ${item.status}`), '',
  'Rapporten kvalifiserer ingen teori og kan ikke brukes til å omgå evidenskontrakten.', '',
].join('\n');
fs.writeFileSync(gapV4MdPath, `${gapMd}\n`);

const totalCases = A(profile.cases).length;
const totalClaims = A(claimsFile.claims).length;
const totalSources = A(sourcesFile.sources).length;
const totalEvidence = A(evidenceFile.evidence_links).length;
profileReport.schema_version = '5.0';
profileReport.report_id = 'historie_profile_evidence_foundation_v5';
profileReport.migration.validated_cases = verifiedCases;
profileReport.migration.unverified_case_candidates = unverifiedCases;
profileReport.inventory = { ...profileReport.inventory, profile_cases: totalCases, profile_mappings: A(profile.emne_case_mappings).length, claims: totalClaims, sources: totalSources, evidence_links: totalEvidence, verified_cases: verifiedCases };
profileReport.theory_evidence = { qualifying_entries: registry.entries.length, total_theories: 230, ratio: registry.completion.ratio, universal_status: registry.completion.universal_status };
profileReport.ritual_reception_v1 = {
  phase_id: 'history_ritual_reception_evidence_v1',
  newly_validated_cases: 1,
  expanded_cases: 2,
  produced_claims: claimSpecs.length,
  produced_sources: sourceSpecs.length,
  produced_evidence_links: claimSpecs.length,
  qualified_theories: theorySpecs.length,
  cases: [
    { case_id: 'case_his_oslo_radhus', place_ids: ['oslo_radhus', 'radhusplassen'], role: 'expanded' },
    { case_id: 'case_his_regjeringskvartalet', place_ids: ['regjeringskvartalet'], role: 'newly_validated' },
    { case_id: 'case_his_akershus_festning', place_ids: ['akershus_festning'], role: 'expanded' },
    { case_id: 'case_his_hl_senteret_villa_grande', place_ids: ['villa_grande'], role: 'reused_validated' },
  ],
  theory_ids: theorySpecs.map((item) => item.theory_id),
  held_back_theory_ids: ['theory_his_taushet_fravaer'],
};
writeJson(profileReportPath, profileReport);
const profileMd = [
  '# Historie profil- og evidensgrunnlag V5', '',
  '- Status: **COMPLETE**',
  '- Fullføringsomfang: **minimum_representative_evidence_foundation**',
  `- Profilcaser: **${totalCases}**`,
  `- Validerte caser: **${verifiedCases}**`,
  `- Claims: **${totalClaims}**`,
  `- Kilder: **${totalSources}**`,
  `- Evidenskoblinger: **${totalEvidence}**`,
  '- Politisk kronologi V1: **2 cases / 13 claims**',
  '- Bevegelsesoffentligheter V1: **3 cases / 13 claims / 4 teoriobjekter**',
  `- Ritual og resepsjon V1: **1 nyvalidert case / 2 utvidede cases / ${claimSpecs.length} claims / ${theorySpecs.length} teoriobjekter**`,
  '- Gjenværende universelt produksjonsgap: **theory_evidence_readiness**', '',
].join('\n');
fs.writeFileSync(profileReportMdPath, `${profileMd}\n`);

let theoryDocs = fs.readFileSync(theoryDocsPath, 'utf8');
theoryDocs = theoryDocs.replace(
  'Politisk kronologi evidens V1 tilfører tre objekter, og bevegelsesoffentligheter evidens V1 tilfører fire objekter på grunnlag av 13 nye claims, 11 nye kildeposter og tre nyvaliderte cases. Produksjonen står dermed på 39 av 230.',
  'Politisk kronologi evidens V1 tilfører tre objekter, bevegelsesoffentligheter evidens V1 tilfører fire, og ritual og resepsjon evidens V1 tilfører to objekter på grunnlag av ni nye claims, ni kilder og én nyvalidert case. Produksjonen står dermed på 41 av 230.'
);
theoryDocs = theoryDocs.replace(
  '- Bevegelsesoffentligheter evidens V1: **4** nye kvalifiserende teoriobjekter, **13** nye claims og **3** nyvaliderte cases.\n- Totalt: **39 av 230** teoriobjekter (**17,0 %**).',
  '- Bevegelsesoffentligheter evidens V1: **4** nye kvalifiserende teoriobjekter, **13** nye claims og **3** nyvaliderte cases.\n- Ritual og resepsjon evidens V1: **2** nye kvalifiserende teoriobjekter, **9** nye claims og **1** nyvalidert case; arkivtaushet holdes tilbake.\n- Totalt: **41 av 230** teoriobjekter (**17,8 %**).'
);
theoryDocs = theoryDocs.replace('history-theory-evidence-gap-inventory-v3.md', 'history-theory-evidence-gap-inventory-v4.md');
fs.writeFileSync(theoryDocsPath, theoryDocs.endsWith('\n') ? theoryDocs : `${theoryDocs}\n`);

const phaseDocs = `# Historie — ritual og resepsjon evidens V1\n\n## Resultat\n\nFasen kvalifiserer to teoriobjekter med ni nye claims og ni avgrensede kilder:\n\n- \`theory_his_minnested_ritual_offentlig_sorg\`\n- \`theory_his_krig_okkupasjon_krigsminne_veteraner_og_ettervirkninger\`\n\n## Evidensbaner\n\n- Rådhusplassen: roser, fakler, massemarkering og digital organisering av sorg etter 22. juli 2011.\n- Regjeringskvartalet: gjentatte minnemarkeringer i 2015 og 2026 med taler, krans, navneopplesning og berørte organisasjoner.\n- Akershus festning: frigjørings- og veterandag, Retterstedet, kranser, salutt, soldatenes tale og medaljeutdeling.\n- Villa Grande: eksisterende validert bane fra kollaborasjonsregimets maktsted til kritisk etterkrigsinstitusjon.\n\n## Avgrensning\n\nOffisielle programmer dokumenterer ritualets plan og institusjonelle roller, men ikke automatisk publikums mottakelse. \`theory_his_taushet_fravaer\` er derfor ikke kvalifisert: den krever et konkret forventet arkivspor som dokumenterbart mangler eller er tapt, med proveniens og alternative forklaringer.\n\n## Produksjonsstatus\n\n- Teori-evidens: **41 av 230**\n- Universell status: **INCOMPLETE**\n- Aktiv rest i kategorien: **dokumentert arkivtaushet**\n`;
fs.writeFileSync(phaseDocsPath, phaseDocs);

console.log(JSON.stringify({
  status: 'MATERIALIZED',
  new_claims: claimSpecs.length,
  new_sources: sourceSpecs.length,
  new_evidence_links: claimSpecs.length,
  newly_verified_cases: 1,
  expanded_cases: 2,
  qualifying_theories: registry.entries.length,
  ratio: registry.completion.ratio,
  remaining_theories: 230 - registry.entries.length,
  profile: { cases: totalCases, verified_cases: verifiedCases, claims: totalClaims, sources: totalSources, evidence_links: totalEvidence },
  held_back_theory: 'theory_his_taushet_fravaer',
}, null, 2));
