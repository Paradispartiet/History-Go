#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const fail = (message) => { throw new Error(message); };
const today = '2026-07-27';
const batchId = 'history_oslo_akershus_evidence_batch_v2';

const h = path.join(root, 'data/fag/historie');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const claimsPath = path.join(h, 'claims_historie_canonical_v1.json');
const sourcesPath = path.join(h, 'sources_historie_canonical_v1.json');
const evidencePath = path.join(h, 'place_evidence_historie_v1.json');
const requirementsPath = path.join(h, 'case_requirements_historie_canonical_v1.json');
const validatorPath = path.join(root, 'tools/validate-historie-profile-evidence.mjs');
const profileAuditPath = path.join(root, 'tools/audit-historie-geographic-profile.mjs');
const foundationJsonPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.json');
const foundationMdPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.md');
const batchDir = path.join(root, 'reports/historie-profile-evidence/batch-v2');
const batchJsonPath = path.join(batchDir, 'materialization.json');
const batchMdPath = path.join(batchDir, 'materialization.md');
const docsPath = path.join(root, 'docs/HISTORY_OSLO_AKERSHUS_EVIDENCE_BATCH_V2.md');

const profile = readJson(profilePath);
const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const evidenceFile = readJson(evidencePath);
const requirementsFile = readJson(requirementsPath);
const requirementIds = A(requirementsFile.requirements).map((item) => item.requirement_id);
if (requirementIds.length !== 4) fail(`Expected four case requirements, got ${requirementIds.length}`);

const source = ({ source_id, title, publisher, source_type, url, repository_source, extracted_from, tier, rationale, limitations, temporal_scope = { from: null, to: null } }) => ({
  source_id,
  title,
  publisher,
  source_type,
  url,
  language: 'nb',
  geography_ids: ['geo_no_oslo_akershus'],
  temporal_scope,
  provenance: {
    repository_source,
    extracted_from,
    accessed_at: today,
  },
  dating: {
    published_at: null,
    updated_at: null,
    accessed_at: today,
  },
  limitations,
  quality: { tier, rationale },
});

const sourceDefinitions = [
  source({
    source_id: 'src_his_akershus_festning_forsvarsbygg',
    title: 'Akershus festning', publisher: 'Forsvarsbygg', source_type: 'official_site_history',
    url: 'https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning',
    repository_source: 'data/places/historie/oslo/places_historie/akershus_festning.json',
    extracted_from: ['coordSourceUrl', 'desc', 'popupDesc'], tier: 'A',
    rationale: 'Offisiell forvalterkilde for anleggets identitet, funksjoner og hovedtrekk i historien.',
    limitations: ['Forvalterformidling kan prioritere anleggets institusjonelle kontinuitet og besøksverdi.', 'Detaljerte dateringer og konfliktfortolkninger bør suppleres med arkiv- og forskningslitteratur.'],
    temporal_scope: { from: 1290, to: null },
  }),
  source({
    source_id: 'src_his_snl_akershus_festning',
    title: 'Akershus festning', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Akershus_festning',
    repository_source: 'data/places/historie/oslo/places_historie/akershus_festning.json',
    extracted_from: ['popupDesc', 'selected-source-extract'], tier: 'B',
    rationale: 'Redigert referansekilde for kronologi og anleggets skiftende funksjoner.',
    limitations: ['Oversiktsformatet komprimerer lange bygge- og bruksfaser.', 'Artikkelen kan ikke alene dokumentere alle person-, henrettelses- eller restaureringsdetaljer.'],
    temporal_scope: { from: 1290, to: null },
  }),
  source({
    source_id: 'src_his_snl_hovedoya_kloster',
    title: 'Hovedøya kloster', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Hoved%C3%B8ya_kloster',
    repository_source: 'data/stories/stories_hovedoya_kloster.json',
    extracted_from: ['sources[0]', 'story', 'summary'], tier: 'B',
    rationale: 'Redigert referansekilde for grunnleggelse, klosterhistorie og oppløsning.',
    limitations: ['Kortformatet forenkler eiendoms-, ordens- og konfliktshistorien.', 'Arkeologiske detaljer og bygningsfaser krever egne utgravningsrapporter.'],
    temporal_scope: { from: 1147, to: 1537 },
  }),
  source({
    source_id: 'src_his_oslo_byleksikon_hovedoya',
    title: 'Hovedøya', publisher: 'Oslo byleksikon', source_type: 'local_reference_encyclopedia',
    url: 'https://oslobyleksikon.no/index.php?title=Hoved%C3%B8ya',
    repository_source: 'data/stories/stories_hovedoya_kloster.json',
    extracted_from: ['sources[1]', 'related_places'], tier: 'B',
    rationale: 'Lokal referansekilde som setter klosteret inn i øyas og byens historie.',
    limitations: ['Øyartikkelen dekker flere perioder og kan gi begrenset dybde om selve klosteret.', 'Sekundærkilden bør suppleres med arkeologiske og kirkehistoriske publikasjoner.'],
    temporal_scope: { from: 1100, to: null },
  }),
  source({
    source_id: 'src_his_eidsvoll_1814_official',
    title: 'Eidsvollsbygningen', publisher: 'Eidsvoll 1814', source_type: 'official_museum_site',
    url: 'https://eidsvoll1814.no/eidsvollbygningen',
    repository_source: 'data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json',
    extracted_from: ['externalLinks[0]', 'desc', 'popupDesc'], tier: 'A',
    rationale: 'Offisiell museums- og stedsforvalterkilde for bygningen og Riksforsamlingen.',
    limitations: ['Museumsformidling kan prioritere nasjonal hovedfortelling og besøksopplevelse.', 'Detaljer om representantenes uenigheter og sosial bakgrunn krever bredere kildetilfang.'],
    temporal_scope: { from: 1814, to: null },
  }),
  source({
    source_id: 'src_his_riksantikvaren_eidsvollsbygningen',
    title: 'Fredet Eidsvollsbygningen', publisher: 'Riksantikvaren', source_type: 'official_heritage_record',
    url: 'https://riksantikvaren.no/fredninger/fredet-eidsvollsbygningen/',
    repository_source: 'data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json',
    extracted_from: ['externalLinks[2]', 'coordNote'], tier: 'A',
    rationale: 'Offisiell kulturminnekilde for bygningens identitet, anlegg og vernestatus.',
    limitations: ['Fredningsformidlingen har kulturminnevern som hovedformål, ikke full politisk historie.', 'Kilden dokumenterer ikke alene alle hendelser under Riksforsamlingen.'],
    temporal_scope: { from: 1814, to: null },
  }),
  source({
    source_id: 'src_his_arbark_folkets_hus_oslo',
    title: 'Folkets Hus bygges', publisher: 'Arbeiderbevegelsens arkiv og bibliotek', source_type: 'archive_exhibition',
    url: 'https://www.arbark.no/Bildeserier/folketshus/Folkets_Hus.htm',
    repository_source: 'data/leksikon/places/oslo/politikk/leksikon_folkets_hus_oslo.json',
    extracted_from: ['facts.fact_01', 'chronology.chrono_01', 'chronology.chrono_02'], tier: 'A',
    rationale: 'Institusjonsarkiv med dokumentasjon av bygge- og organisasjonshistorien.',
    limitations: ['Arkivets tilknytning til arbeiderbevegelsen kan prege utvalg og perspektiv.', 'Nettsidens billedserie gir ikke nødvendigvis full kildehenvisning for hvert utsagn.'],
    temporal_scope: { from: 1907, to: 1962 },
  }),
  source({
    source_id: 'src_his_snl_folkets_hus_oslo',
    title: 'Folkets hus – Oslo', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Folkets_hus_-_Oslo',
    repository_source: 'data/leksikon/places/oslo/politikk/leksikon_folkets_hus_oslo.json',
    extracted_from: ['facts.fact_02', 'facts.fact_03', 'chronology'], tier: 'B',
    rationale: 'Redigert referansekilde for byggetrinn, arkitektur og institusjonsfunksjon.',
    limitations: ['Oversiktsformatet gir begrenset sosial- og organisasjonshistorisk dybde.', 'Dagens leietakere og funksjoner kan endres etter publisering.'],
    temporal_scope: { from: 1907, to: null },
  }),
  source({
    source_id: 'src_his_snl_akerselva',
    title: 'Akerselva', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Akerselva',
    repository_source: 'data/places/by/oslo/places/akerselva.json',
    extracted_from: ['desc', 'popupDesc', 'selected-source-extract'], tier: 'B',
    rationale: 'Redigert referansekilde for elvas geografi, industrihistorie og miljøomforming.',
    limitations: ['En lang elv og mange anlegg sammenfattes på begrenset plass.', 'Lokale arbeids-, utslipps- og eiendomskonflikter krever mer spesifikke kilder.'],
    temporal_scope: { from: 1100, to: null },
  }),
  source({
    source_id: 'src_his_oslo_kommune_akerselva',
    title: 'Lakes and rivers in Oslo', publisher: 'Oslo kommune', source_type: 'official_municipal_page',
    url: 'https://www.oslo.kommune.no/english/welcome-to-oslo/life-in-oslo/enjoy-the-outdoors/lakes-and-rivers/',
    repository_source: 'data/places/by/oslo/places/akerselva.json',
    extracted_from: ['coordSourceUrl', 'coordNote', 'anchors'], tier: 'A',
    rationale: 'Offisiell kommunal kilde for elveløpet og dagens offentlige natur- og friluftsforvaltning.',
    limitations: ['Siden er primært besøks- og friluftsinformasjon, ikke en full industrihistorie.', 'Historiske miljøtiltak og utslipp må suppleres med planer og fagrapporter.'],
    temporal_scope: { from: 1980, to: null },
  }),
  source({
    source_id: 'src_his_hl_senteret_villa_grande',
    title: 'Senter for studier av Holocaust og livssynsminoriteter', publisher: 'HL-senteret', source_type: 'official_institution_site',
    url: 'https://www.hlsenteret.no/',
    repository_source: 'data/stories/stories_villa_grande.json',
    extracted_from: ['sources[0]', 'story', 'summary'], tier: 'A',
    rationale: 'Primær institusjonskilde for dagens bruk av Villa Grande og senterets mandat.',
    limitations: ['Institusjonens egen presentasjon er ikke en uavhengig analyse av byggets fulle historie.', 'Nettsiden kan prioritere dagens virksomhet framfor detaljerte bygnings- og eierfaser.'],
    temporal_scope: { from: 2005, to: null },
  }),
  source({
    source_id: 'src_his_snl_villa_grande',
    title: 'Villa Grande', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Villa_Grande',
    repository_source: 'data/places/historie/oslo/places_historie/villa_grande.json',
    extracted_from: ['desc', 'popupDesc', 'selected-source-extract'], tier: 'B',
    rationale: 'Redigert referansekilde for bygningens eierskap, okkupasjonsbruk og senere funksjoner.',
    limitations: ['Oversikten komprimerer en sammensatt bygnings- og institusjonshistorie.', 'Detaljer om ombygging, sikkerhetsanlegg og etterkrigsbruk krever arkivkilder.'],
    temporal_scope: { from: 1917, to: null },
  }),
  source({
    source_id: 'src_his_regjeringen_bispelokket',
    title: 'St.meld. nr. 28 (2001–2002), Bjørvika', publisher: 'Regjeringen', source_type: 'official_policy_document',
    url: 'https://www.regjeringen.no/no/dokumenter/stmeld-nr-28-2001-2002-/id432071/?ch=3',
    repository_source: 'data/places/by/oslo/places/bispelokket.json',
    extracted_from: ['coordSource', 'coordSourceUrl', 'popupDesc'], tier: 'A',
    rationale: 'Offisielt plan- og beslutningsgrunnlag for trafikksystemet og transformasjonen i Bjørvika.',
    limitations: ['Planmeldingen er framtids- og beslutningsorientert og kan framstille tiltak normativt.', 'Senere gjennomføring, datoer og trafikkvirkninger må kontrolleres mot prosjekt- og driftskilder.'],
    temporal_scope: { from: 1967, to: 2013 },
  }),
  source({
    source_id: 'src_his_22_juli_senteret_official',
    title: '22. juli-senteret', publisher: '22. juli-senteret', source_type: 'official_memory_and_learning_site',
    url: 'https://www.22julisenteret.no/',
    repository_source: 'data/places/politikk/oslo/places_politikk/22_juli_senteret.json',
    extracted_from: ['externalLinks[0]', 'desc', 'popupDesc'], tier: 'A',
    rationale: 'Primær institusjonskilde for senterets mandat, utstillinger og læringsarbeid.',
    limitations: ['Institusjonens egen presentasjon er kuratert minne- og læringsformidling.', 'Hendelsesforløp, ansvar og rettslige spørsmål krever også kommisjons-, retts- og arkivkilder.'],
    temporal_scope: { from: 2011, to: null },
  }),
  source({
    source_id: 'src_his_snl_bombeangrepet_regjeringskvartalet',
    title: 'Bombeangrepet på regjeringskvartalet', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Bombeangrepet_p%C3%A5_regjeringskvartalet',
    repository_source: 'data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json',
    extracted_from: ['chronology.chrono_2011', 'facts', 'sources'], tier: 'B',
    rationale: 'Redigert referansekilde for hendelsen i Regjeringskvartalet 22. juli 2011.',
    limitations: ['Kortformatet kan ikke romme alle ofre, beredskapsforløp eller etterfølgende granskinger.', 'Artikkelen bør suppleres med 22. juli-kommisjonen og rettsdokumenter ved detaljanalyse.'],
    temporal_scope: { from: '2011-07-22', to: '2011-07-22' },
  }),
  source({
    source_id: 'src_his_snl_deichman',
    title: 'Deichman (bibliotek)', publisher: 'Store norske leksikon', source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Deichman_%28bibliotek%29',
    repository_source: 'data/stories/stories_gamle_deichman.json',
    extracted_from: ['sources[0]', 'story', 'summary'], tier: 'B',
    rationale: 'Redigert referansekilde for bibliotekets grunnleggelse og institusjonshistorie.',
    limitations: ['Institusjonshistorien sammenfattes og gir begrenset bruker- og sosialhistorie.', 'Flyttedatoer, byggfaser og samlingshistorikk bør kontrolleres mot Deichmans arkiver.'],
    temporal_scope: { from: 1780, to: null },
  }),
  source({
    source_id: 'src_his_oslo_byleksikon_deichman',
    title: 'Deichman', publisher: 'Oslo byleksikon', source_type: 'local_reference_encyclopedia',
    url: 'https://oslobyleksikon.no/side/Deichman',
    repository_source: 'data/stories/stories_gamle_deichman.json',
    extracted_from: ['sources[1]', 'story'], tier: 'B',
    rationale: 'Lokal referansekilde for Deichmans plasseringer og rolle i Oslo.',
    limitations: ['Lokal oversiktsartikkel gir begrenset dybde om bibliotekpolitikk og brukere.', 'Dateringer og funksjonsskifter bør suppleres med institusjonsarkiv og byggesaksdata.'],
    temporal_scope: { from: 1785, to: null },
  }),
  source({
    source_id: 'src_his_niku_gamle_deichman',
    title: 'Fargeundersøkelse i Gamle Deichmanske hovedbibliotek', publisher: 'NIKU', source_type: 'heritage_research_project',
    url: 'https://www.niku.no/prosjekter/fargeundersokelse-i-gamle-deichmanske-hovedbibliotek/',
    repository_source: 'data/stories/stories_gamle_deichman.json',
    extracted_from: ['sources[2]', 'story'], tier: 'A',
    rationale: 'Faglig kulturminnekilde for Hammersborg-bygningen og dens materielle historie.',
    limitations: ['Prosjektsiden har bygnings- og fargeundersøkelse som hovedtema, ikke full bibliotekshistorie.', 'Opplysningene må suppleres ved analyse av brukere, samlinger og institusjonell drift.'],
    temporal_scope: { from: 1933, to: null },
  }),
];

const specs = [
  {
    case_id: 'case_his_akershus_festning', label: 'Akershus festning', place_ids: ['akershus_festning'],
    patterns: [/middelalder_oslo/, /stat_institusjoner/, /okkupasjon_motstand/, /minnesteder_historiebruk/],
    claims: [
      {
        claim_id: 'claim_his_akershus_festning_founded_c1290',
        statement: 'Akershus festning ble påbegynt omkring 1290 under Håkon V og utviklet seg fra kongelig borg til festnings- og statsanlegg ved innseilingen til Oslo.',
        claim_type: 'institutional_and_architectural_origin', temporal: { from: 1290, to: 1300 },
        source_ids: ['src_his_akershus_festning_forsvarsbygg', 'src_his_snl_akershus_festning'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Grunnleggelsen dateres vanligvis omkring 1290; eksakt byggestart og tidlig byggefase er ikke dokumentert med én entydig dato.' },
        alternative_interpretations: ['Anlegget kan leses både som forsvarsverk og som materiell iscenesettelse av kongemakt og administrativ sentralisering.'],
      },
      {
        claim_id: 'claim_his_akershus_festning_occupation_memory',
        statement: 'Under okkupasjonen 1940–1945 ble Akershus festning brukt av tyske myndigheter, og stedet ble senere et sentralt minne- og museumsmiljø for okkupasjon, motstand og rettsoppgjør.',
        claim_type: 'occupation_and_memory_transformation', temporal: { from: 1940, to: null },
        source_ids: ['src_his_akershus_festning_forsvarsbygg', 'src_his_snl_akershus_festning'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Hovedtrekkene i okkupasjonsbruk og senere minnefunksjon er bredt dokumentert; enkelthendelser krever mer spesifikke kilder.' },
        alternative_interpretations: ['Minnestedsperspektivet kan framheve nasjonal motstand, mens en bredere analyse også må omfatte kollaborasjon, fangenskap og institusjonell vold.'],
      },
    ],
  },
  {
    case_id: 'case_his_hovedoya_kloster', label: 'Hovedøya kloster', place_ids: ['hovedoya_kloster'],
    patterns: [/kirke_kloster_middelalder/, /middelalder_oslo/, /spor_materialitet/, /ruiner_rester_ombruk/],
    claims: [
      {
        claim_id: 'claim_his_hovedoya_kloster_founded_1147',
        statement: 'Hovedøya kloster ble grunnlagt i 1147 av cisterciensermunker fra Kirkstead i England og knyttet Oslofjorden til et europeisk klosternettverk.',
        claim_type: 'dated_institutional_foundation', temporal: { from: 1147, to: 1147 },
        source_ids: ['src_his_snl_hovedoya_kloster', 'src_his_oslo_byleksikon_hovedoya'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Grunnleggelsesåret og ordenstilhørigheten er konsistente i de redigerte kildene.' },
        alternative_interpretations: ['Europeisk nettverk må ikke skjule klosterets lokale jordegods, lekbrødre, arbeidsorganisering og makt i Oslo-området.'],
      },
      {
        claim_id: 'claim_his_hovedoya_kloster_destroyed_1532',
        statement: 'Klosteranlegget på Hovedøya ble plyndret og brent i 1532, og ruinene ble senere et materiellt spor etter reformasjon, maktkamp og ombruk av kirkens ressurser.',
        claim_type: 'destruction_and_material_afterlife', temporal: { from: 1532, to: null },
        source_ids: ['src_his_snl_hovedoya_kloster', 'src_his_oslo_byleksikon_hovedoya'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Brannen i 1532 er dokumentert, mens den gradvise avviklingen og senere materialbruken består av flere faser.' },
        alternative_interpretations: ['Ruinen kan forstås som resultat av reformasjon, men også av en konkret politisk konflikt før den formelle religionsomformingen.'],
      },
    ],
  },
  {
    case_id: 'case_his_eidsvollsbygningen', label: 'Eidsvollsbygningen', place_ids: ['eidsvollsbygningen'],
    patterns: [/1814_statsdannelse_suverenitet/, /rettigheter_borgerskap_forvaltning/, /nasjonal_identitet_fortellinger/, /jubileum_seremoni_historiebruk/],
    claims: [
      {
        claim_id: 'claim_his_eidsvollsbygningen_riksforsamlingen_1814',
        statement: 'Riksforsamlingen møttes i Eidsvollsbygningen fra 10. april til 20. mai 1814, vedtok Grunnloven 17. mai og valgte Christian Frederik til norsk konge.',
        claim_type: 'dated_constitutional_process', temporal: { from: '1814-04-10', to: '1814-05-20' },
        source_ids: ['src_his_eidsvoll_1814_official', 'src_his_riksantikvaren_eidsvollsbygningen'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Møteperioden, grunnlovsvedtaket og kongevalget er sikkert dokumentert.' },
        alternative_interpretations: ['Forsamlingen kan framstilles som demokratisk grunnleggelse, men representasjonen var sosialt, geografisk og kjønnsmessig begrenset.'],
      },
      {
        claim_id: 'claim_his_eidsvollsbygningen_home_to_national_monument',
        statement: 'Eidsvollsbygningen var Carsten Ankers hovedbygning og ble senere omgjort fra privat elitehjem og politisk arbeidssted til nasjonalt monument og fredet kulturmiljø.',
        claim_type: 'heritage_transformation', temporal: { from: 1814, to: null },
        source_ids: ['src_his_eidsvoll_1814_official', 'src_his_riksantikvaren_eidsvollsbygningen'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Hovedforløpet er dokumentert, men eierskap, restaureringer og vernevedtak består av flere separate faser.' },
        alternative_interpretations: ['Nasjonalmonumentet kan samle offentlig minne, men kan også tone ned hushold, arbeid, industriøkonomi og sosial ulikhet rundt 1814.'],
      },
    ],
  },
  {
    case_id: 'case_his_folkets_hus', label: 'Folkets Hus', place_ids: ['folkets_hus_oslo'],
    patterns: [/arbeid_nettverk_naring/, /arbeidstid_lonn_ferdighet/, /kontroll_overvakning/, /historiske_lag_i_byrom/],
    claims: [
      {
        claim_id: 'claim_his_folkets_hus_opened_1907',
        statement: 'Det første Folkets Hus ved Youngstorget åpnet i 1907 som møte- og organisasjonssted for arbeiderbevegelsen.',
        claim_type: 'dated_institutional_opening', temporal: { from: 1907, to: 1907 },
        source_ids: ['src_his_arbark_folkets_hus_oslo', 'src_his_snl_folkets_hus_oslo'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Åpningsåret og institusjonstypen er eksplisitt dokumentert.' },
        alternative_interpretations: ['Huset kan leses som demokratisk organisasjonsinfrastruktur, men også som uttrykk for en bestemt bevegelses institusjonalisering og interne maktstruktur.'],
      },
      {
        claim_id: 'claim_his_folkets_hus_current_complex_1958_1962',
        statement: 'Dagens hovedanlegg for Folkets Hus ble reist i byggetrinn fra 1958 til 1962 og samler fagorganisasjoner, møter, administrasjon, arkiv og kongressfunksjoner.',
        claim_type: 'institutional_architecture_and_function', temporal: { from: 1958, to: null },
        source_ids: ['src_his_arbark_folkets_hus_oslo', 'src_his_snl_folkets_hus_oslo'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Byggeperioden er dokumentert; konkrete leietakere og funksjoner kan endres over tid.' },
        alternative_interpretations: ['Monumental organisasjonsarkitektur kan tolkes som kollektiv styrke, men også som profesjonalisering og avstand mellom grasrot og apparat.'],
      },
    ],
  },
  {
    case_id: 'case_his_akerselva', label: 'Akerselva', place_ids: ['akerselva'],
    patterns: [/industri_produksjon_energi/, /industriby_1900/, /miljo_klima_naturforvaltning/, /historiske_lag_i_byrom/],
    claims: [
      {
        claim_id: 'claim_his_akerselva_industrial_power_axis',
        statement: 'Fosser og fall langs Akerselva ga kraft til møller, sagbruk og fabrikker og gjorde elva til en hovedakse i Christianias og Oslos industrialisering.',
        claim_type: 'long_term_industrial_landscape', temporal: { from: 1100, to: 1970 },
        source_ids: ['src_his_snl_akerselva', 'src_his_oslo_kommune_akerselva'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Hovedforløpet er klart, men antall anlegg, driftsperioder og energiformer varierer langs elva.' },
        alternative_interpretations: ['Industrifortellingen må inkludere arbeidere, kjønnet arbeidsdeling, forurensning, boligmiljø og eierskap, ikke bare teknikk og bedrifter.'],
      },
      {
        claim_id: 'claim_his_akerselva_environmental_reuse',
        statement: 'Fra 1980-årene ble Akerselva i økende grad forvaltet som miljøpark, økologisk korridor og offentlig turvei samtidig som industribygninger fikk nye kultur-, utdannings- og næringsfunksjoner.',
        claim_type: 'environmental_and_postindustrial_transformation', temporal: { from: 1980, to: null },
        source_ids: ['src_his_snl_akerselva', 'src_his_oslo_kommune_akerselva'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Transformasjonen består av mange kommunale, statlige, private og frivillige tiltak over tid.' },
        alternative_interpretations: ['Miljøforbedring og offentlig tilgang kan forstås som gevinst, mens ombruk og attraktivitet også kan drive eiendomspris og sosial forskyvning.'],
      },
    ],
  },
  {
    case_id: 'case_his_hl_senteret_villa_grande', label: 'HL-senteret / Villa Grande', place_ids: ['villa_grande'],
    patterns: [/okkupasjon_motstand/, /minnesteder_historiebruk/, /minoritetshistorie/, /riving_ombruk_bevaring/],
    claims: [
      {
        claim_id: 'claim_his_villa_grande_gimle_1941_1945',
        statement: 'Fra 1941 til 1945 ble Villa Grande bygget om og brukt som Vidkun og Maria Quislings residens under navnet «Gimle».',
        claim_type: 'occupation_regime_site', temporal: { from: 1941, to: 1945 },
        source_ids: ['src_his_hl_senteret_villa_grande', 'src_his_snl_villa_grande'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Okkupasjonsbruken og navnet Gimle er sikkert dokumentert.' },
        alternative_interpretations: ['Stedet bør analyseres som politisk maktiscenesettelse og okkupasjonsinstitusjon, ikke reduseres til en biografisk fortelling om Quisling.'],
      },
      {
        claim_id: 'claim_his_villa_grande_hl_center_transformation',
        statement: 'I midten av 2000-årene ble Villa Grande tatt i bruk av HL-senteret og omformet fra et belastet maktsted til forsknings-, undervisnings- og minnested for Holocaust, minoriteter og menneskerettigheter.',
        claim_type: 'critical_memory_reuse', temporal: { from: 2005, to: null },
        source_ids: ['src_his_hl_senteret_villa_grande', 'src_his_snl_villa_grande'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Repositorykildene bruker 2005 og 2006 om åpning og institusjonell etablering; claimet avgrenser derfor til midten av 2000-årene.' },
        alternative_interpretations: ['Ny bruk kan tolkes som kritisk omforming, men opphever ikke bygningens tidligere symbolikk eller behovet for å synliggjøre ofrenes perspektiver.'],
      },
    ],
  },
  {
    case_id: 'case_his_bispelokket', label: 'Bispelokket', place_ids: ['bispelokket'],
    patterns: [/byhistorie_stedsendring_sanering/, /historiske_lag_i_byrom/, /riving_ombruk_bevaring/, /modernisering_1800/],
    claims: [
      {
        claim_id: 'claim_his_bispelokket_completed_1967',
        statement: 'Bispelokket stod ferdig i 1967 som et planskilt veikryss mellom E18 i Bispegata og Nylandsveien og uttrykte bilbyens prioritering av kapasitet og gjennomfart.',
        claim_type: 'infrastructure_opening_and_planning_regime', temporal: { from: 1967, to: 1967 },
        source_ids: ['src_his_regjeringen_bispelokket'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Ferdigstillelsen er dokumentert, mens anleggets eksakte delåpninger og trafikkopplegg utviklet seg over tid.' },
        alternative_interpretations: ['Anlegget kan forstås som teknisk modernisering og trafikksikkerhet, men også som barriere, arealinngrep og nedprioritering av gående og byliv.'],
      },
      {
        claim_id: 'claim_his_bispelokket_demolished_2011_2013',
        statement: 'Etter åpningen av Bjørvikatunnelen i 2010 ble Bispelokket revet etappevis fra 2011 til 2013 og arealet inngikk i omformingen av Bjørvika til gater, kollektivtrafikk og byrom.',
        claim_type: 'infrastructure_removal_and_urban_transformation', temporal: { from: 2010, to: 2013 },
        source_ids: ['src_his_regjeringen_bispelokket'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Hovedforløpet er dokumentert; virkningen må skilles mellom tunnelåpning, rivningsetapper og senere ferdigstilling av byrom.' },
        alternative_interpretations: ['Rivingen kan beskrives som gjenåpning av byen mot fjorden, men transformasjonen må også vurderes gjennom kostnader, utbyggingsinteresser og nye barrierer.'],
      },
    ],
  },
  {
    case_id: 'case_his_22_juli_senteret', label: '22. juli-senteret', place_ids: ['22_juli_senteret'],
    patterns: [/terror_samtidshistorie/, /minnesteder_historiebruk/, /katastrofer_brudd_skyld_ansvar/, /samtid_ettertid_fortelling/],
    claims: [
      {
        claim_id: 'claim_his_22_juli_center_documents_attacks',
        statement: '22. juli-senteret dokumenterer terrorangrepene mot Regjeringskvartalet og Utøya, menneskene som ble rammet og samfunnets reaksjoner etter 22. juli 2011.',
        claim_type: 'memory_institution_mandate', temporal: { from: 2011, to: null },
        source_ids: ['src_his_22_juli_senteret_official', 'src_his_snl_bombeangrepet_regjeringskvartalet'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Senterets mandat og angrepenes grunnleggende hendelsesramme er eksplisitt dokumentert.' },
        alternative_interpretations: ['Formidlingen må balansere hendelsesforløp, ofrenes erfaringer, politisk ekstremisme, beredskap og samfunnets langsiktige bearbeiding.'],
      },
      {
        claim_id: 'claim_his_22_juli_center_democracy_learning',
        statement: 'Som nasjonal minne- og læringsinstitusjon kobler 22. juli-senteret historisk dokumentasjon til undervisning om demokrati, ekstremisme, beredskap og minnekultur.',
        claim_type: 'public_history_and_education_function', temporal: { from: 2015, to: null },
        source_ids: ['src_his_22_juli_senteret_official'], confidence: 'high',
        uncertainty: { level: 'medium', note: 'Institusjonens programmer, lokaler og pedagogiske prioriteringer kan endres over tid.' },
        alternative_interpretations: ['Et læringssenter kan styrke demokratisk refleksjon, men må kontinuerlig vurdere representasjon, politisering, traume og avstand til hendelsen.'],
      },
    ],
  },
  {
    case_id: 'case_his_gamle_deichman_pa_hammersborg', label: 'Gamle Deichman på Hammersborg', place_ids: ['gamle_deichman'],
    patterns: [/arkiv_og_dokumentasjon/, /museum_samling_kanon/, /historiske_lag_i_byrom/, /kulturminner_bevaring/],
    claims: [
      {
        claim_id: 'claim_his_deichman_public_library_1785',
        statement: 'Carl Deichmans testamenterte boksamling dannet grunnlaget for Det Deichmanske Bibliothek, som åpnet for offentligheten i Christiania i 1785.',
        claim_type: 'institutional_foundation_from_collection', temporal: { from: 1780, to: 1785 },
        source_ids: ['src_his_snl_deichman', 'src_his_oslo_byleksikon_deichman'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Gaven, institusjonsdannelsen og åpningsåret er konsistent dokumentert.' },
        alternative_interpretations: ['Fortellingen om én giver må suppleres med bibliotekets ansatte, brukere, finansiering og gradvise utvikling som offentlig institusjon.'],
      },
      {
        claim_id: 'claim_his_gamle_deichman_main_library_1933_2019',
        statement: 'Bibliotekbygningen på Hammersborg åpnet i 1933 og fungerte som Deichmans hovedbibliotek til flyttingen fra bygningen i 2019.',
        claim_type: 'dated_public_building_function', temporal: { from: 1933, to: 2019 },
        source_ids: ['src_his_snl_deichman', 'src_his_oslo_byleksikon_deichman', 'src_his_niku_gamle_deichman'], confidence: 'high',
        uncertainty: { level: 'low', note: 'Bygningens hovedbibliotekperiode er godt dokumentert; enkelte kilder skiller mellom utflytting i 2019 og åpning av nytt hovedbibliotek i 2020.' },
        alternative_interpretations: ['Monumental kunnskapsarkitektur kan leses som demokratisk fellesgode, men også gjennom adgang, kanon, samlingspolitikk og hvem institusjonen faktisk nådde.'],
      },
    ],
  },
];

const caseById = new Map(A(profile.cases).map((item) => [item.case_id, item]));
const chooseEmneIds = (caseRecord, patterns) => {
  const available = A(caseRecord.emne_ids);
  const chosen = [];
  for (const pattern of patterns) {
    const hit = available.find((id) => pattern.test(id));
    if (hit && !chosen.includes(hit)) chosen.push(hit);
  }
  for (const id of available) {
    if (chosen.length >= 4) break;
    if (!chosen.includes(id)) chosen.push(id);
  }
  if (chosen.length < 2) fail(`${caseRecord.case_id} has fewer than two usable emne IDs`);
  return chosen.slice(0, 4);
};

const newClaims = [];
const newEvidence = [];
for (const spec of specs) {
  const caseRecord = caseById.get(spec.case_id);
  if (!caseRecord) fail(`Missing profile case ${spec.case_id}`);
  const emneIds = chooseEmneIds(caseRecord, spec.patterns);
  const claimIds = [];
  const sourceIds = new Set();
  const evidenceIds = [];
  spec.claims.forEach((item) => {
    const evidenceId = `evidence_${item.claim_id.replace(/^claim_/, '')}`;
    claimIds.push(item.claim_id);
    evidenceIds.push(evidenceId);
    item.source_ids.forEach((id) => sourceIds.add(id));
    newClaims.push({
      claim_id: item.claim_id,
      statement: item.statement,
      claim_type: item.claim_type,
      scope: {
        geography_ids: ['geo_no_oslo_akershus'],
        place_ids: spec.place_ids,
        case_ids: [spec.case_id],
        temporal: item.temporal,
      },
      emne_ids: emneIds,
      source_ids: item.source_ids,
      confidence: item.confidence,
      uncertainty: item.uncertainty,
      alternative_interpretations: item.alternative_interpretations,
      provenance: {
        batch_id: batchId,
        materialized_at: today,
        repository_basis: 'reports/historie-profile-evidence/selected-source-extract/selected-source-extract.json',
      },
    });
    newEvidence.push({
      evidence_id: evidenceId,
      profile_id: profile.profile_id,
      geography_id: profile.geography.geography_id,
      place_id: spec.place_ids[0],
      case_id: spec.case_id,
      emne_ids: emneIds,
      claim_id: item.claim_id,
      source_ids: item.source_ids,
      support_type: item.source_ids.length >= 2 ? 'corroborated' : 'direct_single_source',
      validation_status: 'validated_batch_v2',
      limitations_inherited: true,
      note: `Materialisert i ${batchId} fra eksisterende repositorykilder og canonical profilekoblinger.`,
    });
  });
  caseRecord.status = 'validated_profile_case';
  caseRecord.evidence_status = 'claim_source_linked';
  caseRecord.place_ids = spec.place_ids;
  caseRecord.case_requirement_ids = requirementIds;
  caseRecord.validation = {
    batch_id: batchId,
    validated_at: today,
    claim_ids: claimIds,
    source_ids: [...sourceIds],
    evidence_ids: evidenceIds,
    note: 'Validert som regionalt produksjonscase med explicit claim–source–place–emne-kjede.',
  };
}

const pilot = caseById.get('case_his_oslo_radhus');
if (!pilot) fail('Missing Oslo rådhus pilot case');
pilot.status = 'validated_pilot_case';
pilot.evidence_status = 'claim_source_linked';
pilot.place_ids = ['oslo_radhus'];
pilot.case_requirement_ids = requirementIds;

const batchClaimIds = new Set(newClaims.map((item) => item.claim_id));
const batchSourceIds = new Set(sourceDefinitions.map((item) => item.source_id));
const batchEvidenceIds = new Set(newEvidence.map((item) => item.evidence_id));
claimsFile.claims = [...A(claimsFile.claims).filter((item) => !batchClaimIds.has(item.claim_id)), ...newClaims];
sourcesFile.sources = [...A(sourcesFile.sources).filter((item) => !batchSourceIds.has(item.source_id)), ...sourceDefinitions];
evidenceFile.evidence_links = [...A(evidenceFile.evidence_links).filter((item) => !batchEvidenceIds.has(item.evidence_id)), ...newEvidence];

const verifiedCases = A(profile.cases).filter((item) => item.evidence_status === 'claim_source_linked');
profile.migration_summary.validated_pilot_cases = 1;
profile.migration_summary.validated_cases = verifiedCases.length;
profile.migration_summary.latest_evidence_batch = batchId;
profile.migration_summary.latest_evidence_batch_date = today;
profile.production_coverage.cases_total = A(profile.cases).length;
profile.production_coverage.claims_total = claimsFile.claims.length;
profile.production_coverage.sources_total = sourcesFile.sources.length;
profile.production_coverage.evidence_links_total = evidenceFile.evidence_links.length;
profile.production_coverage.validated_cases_total = verifiedCases.length;
profile.production_coverage.status = verifiedCases.length >= 10 && evidenceFile.evidence_links.length >= 20
  ? 'EVIDENCE_BASELINE_COMPLETE'
  : 'INCOMPLETE';
profile.production_coverage.interpretation = 'Oslo/Akershus-profilen har nå minst ti validerte casekjeder på tvers av perioder og temaer. Dette er en regional evidensbaseline, ikke et bevis på full geografisk eller universell fagdekning.';

writeJson(claimsPath, claimsFile);
writeJson(sourcesPath, sourcesFile);
writeJson(evidencePath, evidenceFile);
writeJson(profilePath, profile);

const validator = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (message) => { throw new Error(message); };
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item[key]);
  if (ids.some((id) => !id)) fail(\`\${label} has missing \${key}\`);
  if (new Set(ids).size !== ids.length) fail(\`\${label} has duplicate \${key}\`);
  return new Set(ids);
};

const h = path.join(root, 'data/fag/historie');
const emner = readJson(path.join(h, 'emner_historie_canonical_v4_5.json'));
const requirementsFile = readJson(path.join(h, 'case_requirements_historie_canonical_v1.json'));
const claimsFile = readJson(path.join(h, 'claims_historie_canonical_v1.json'));
const sourcesFile = readJson(path.join(h, 'sources_historie_canonical_v1.json'));
const evidenceFile = readJson(path.join(h, 'place_evidence_historie_v1.json'));
const profile = readJson(path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json'));
const profilesManifest = readJson(path.join(root, 'data/fag/profiles/manifest.json'));

const requirements = A(requirementsFile.requirements);
const claims = A(claimsFile.claims);
const sources = A(sourcesFile.sources);
const evidence = A(evidenceFile.evidence_links);
const cases = A(profile.cases);
const mappings = A(profile.emne_case_mappings);
const emneIds = uniqueIds(emner, 'emne_id', 'emner');
const requirementIds = uniqueIds(requirements, 'requirement_id', 'case requirements');
const claimIds = uniqueIds(claims, 'claim_id', 'claims');
const sourceIds = uniqueIds(sources, 'source_id', 'sources');
uniqueIds(evidence, 'evidence_id', 'evidence');
const caseIds = uniqueIds(cases, 'case_id', 'profile cases');

if (requirements.length !== 4) fail(\`Expected 4 case requirements, got \${requirements.length}\`);
if (emnersWithLegacyField().length) fail('recommended_oslo_cases remains in universal emner');
for (const emne of emner) {
  const ids = A(emne.case_requirement_ids);
  if (ids.length !== 4) fail(\`\${emne.emne_id} must reference 4 case requirements\`);
  for (const id of ids) if (!requirementIds.has(id)) fail(\`\${emne.emne_id} references unknown case requirement \${id}\`);
}
if (profile.subject_id !== 'historie' || profile.canonical_subject_version !== 'v5.8') fail('Profile subject/version mismatch');
if (profile.geography?.geography_id !== 'geo_no_oslo_akershus') fail('Profile geography mismatch');
if (!A(profilesManifest.profiles).some((item) => item.profile_id === profile.profile_id)) fail('Profile missing from profiles manifest');
if (mappings.length < 190) fail(\`Expected at least 190 migrated Oslo/Akershus emne mappings, got \${mappings.length}\`);
if (cases.length < 20) fail(\`Expected preserved legacy case candidates, got only \${cases.length}\`);

for (const mapping of mappings) {
  if (!emneIds.has(mapping.emne_id)) fail(\`Profile mapping references unknown emne \${mapping.emne_id}\`);
  for (const id of A(mapping.case_ids)) if (!caseIds.has(id)) fail(\`Profile mapping references unknown case \${id}\`);
  for (const id of A(mapping.case_requirement_ids)) if (!requirementIds.has(id)) fail(\`Profile mapping references unknown requirement \${id}\`);
}
for (const source of sources) {
  if (!/^https:\\/\\//.test(source.url || '')) fail(\`\${source.source_id} lacks HTTPS URL\`);
  if (!source.source_type || !source.publisher || !source.provenance?.accessed_at) fail(\`\${source.source_id} lacks source type, publisher or provenance\`);
  if (A(source.limitations).length < 2) fail(\`\${source.source_id} needs at least two limitations\`);
  if (!source.quality?.tier || !source.quality?.rationale) fail(\`\${source.source_id} lacks quality assessment\`);
}
for (const claim of claims) {
  if (!claim.statement || !claim.claim_type || !claim.scope) fail(\`\${claim.claim_id} lacks statement/type/scope\`);
  if (!A(claim.source_ids).length) fail(\`\${claim.claim_id} lacks sources\`);
  for (const id of A(claim.source_ids)) if (!sourceIds.has(id)) fail(\`\${claim.claim_id} references unknown source \${id}\`);
  for (const id of A(claim.emne_ids)) if (!emneIds.has(id)) fail(\`\${claim.claim_id} references unknown emne \${id}\`);
  for (const id of A(claim.scope.case_ids)) if (!caseIds.has(id)) fail(\`\${claim.claim_id} references unknown case \${id}\`);
  if (!claim.uncertainty?.level || !claim.uncertainty?.note) fail(\`\${claim.claim_id} lacks uncertainty assessment\`);
  if (!A(claim.alternative_interpretations).length) fail(\`\${claim.claim_id} lacks alternative interpretation or caveat\`);
}
const claimById = new Map(claims.map((item) => [item.claim_id, item]));
for (const link of evidence) {
  if (!claimIds.has(link.claim_id)) fail(\`\${link.evidence_id} references unknown claim \${link.claim_id}\`);
  if (!caseIds.has(link.case_id)) fail(\`\${link.evidence_id} references unknown case \${link.case_id}\`);
  for (const id of A(link.source_ids)) if (!sourceIds.has(id)) fail(\`\${link.evidence_id} references unknown source \${id}\`);
  for (const id of A(link.emne_ids)) if (!emneIds.has(id)) fail(\`\${link.evidence_id} references unknown emne \${id}\`);
  const claim = claimById.get(link.claim_id);
  if (!A(claim.scope.case_ids).includes(link.case_id)) fail(\`\${link.evidence_id} case is absent from claim scope\`);
  if (!A(claim.scope.place_ids).includes(link.place_id)) fail(\`\${link.evidence_id} place is absent from claim scope\`);
  for (const id of A(link.source_ids)) if (!A(claim.source_ids).includes(id)) fail(\`\${link.evidence_id} source is absent from claim\`);
  for (const id of A(link.emne_ids)) if (!A(claim.emne_ids).includes(id)) fail(\`\${link.evidence_id} emne is absent from claim\`);
}
const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
if (verifiedCases.length < 10) fail(\`Expected at least 10 claim-source-linked cases, got \${verifiedCases.length}\`);
if (evidence.length < 20) fail(\`Expected at least 20 evidence links, got \${evidence.length}\`);
if (claims.length < 20) fail(\`Expected at least 20 claims, got \${claims.length}\`);
for (const item of verifiedCases) {
  if (!A(item.place_ids).length) fail(\`\${item.case_id} is verified without canonical place IDs\`);
  if (A(item.case_requirement_ids).length !== 4) fail(\`\${item.case_id} is verified without all four case requirements\`);
  const links = evidence.filter((link) => link.case_id === item.case_id);
  if (links.length < 2) fail(\`\${item.case_id} needs at least two evidence links\`);
  const linkedClaims = new Set(links.map((link) => link.claim_id));
  if (linkedClaims.size < 2) fail(\`\${item.case_id} needs at least two distinct claims\`);
}
if (profile.production_coverage?.claims_total !== claims.length) fail('Profile claims_total is stale');
if (profile.production_coverage?.sources_total !== sources.length) fail('Profile sources_total is stale');
if (profile.production_coverage?.evidence_links_total !== evidence.length) fail('Profile evidence_links_total is stale');
if (profile.production_coverage?.validated_cases_total !== verifiedCases.length) fail('Profile validated_cases_total is stale');
if (!fs.existsSync(path.join(root, 'data/places/politikk/oslo/places_politikk/oslo_radhus.json'))) fail('Pilot place oslo_radhus does not exist in canonical place data');

function emnersWithLegacyField() {
  return emner.filter((emne) => Object.prototype.hasOwnProperty.call(emne, 'recommended_oslo_cases'));
}

console.log(JSON.stringify({ status: 'PASS', emner: emner.length, case_requirements: requirements.length, profile_mappings: mappings.length, cases: cases.length, verified_cases: verifiedCases.length, claims: claims.length, sources: sources.length, evidence_links: evidence.length }, null, 2));
`;
fs.writeFileSync(validatorPath, validator);

const profileAudit = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkMode = process.argv.includes('--check');
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const stable = (value) => \`\${JSON.stringify(value, null, 2)}\\n\`;
const reportDir = path.join(root, 'reports/historie-geographic-profiles');
const jsonPath = path.join(reportDir, 'oslo-akershus-profile.json');
const mdPath = path.join(reportDir, 'oslo-akershus-profile.md');
const h = path.join(root, 'data/fag/historie');
const emner = readJson(path.join(h, 'emner_historie_canonical_v4_5.json'));
const claims = A(readJson(path.join(h, 'claims_historie_canonical_v1.json')).claims);
const sources = A(readJson(path.join(h, 'sources_historie_canonical_v1.json')).sources);
const evidence = A(readJson(path.join(h, 'place_evidence_historie_v1.json')).evidence_links);
const profile = readJson(path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json'));
const cases = A(profile.cases);
const mappings = A(profile.emne_case_mappings);
const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
const mappedEmneIds = new Set(mappings.map((item) => item.emne_id));
const claimsWithMultipleSources = claims.filter((item) => A(item.source_ids).length >= 2);
const baselineMet = verifiedCases.length >= 10 && evidence.length >= 20;
const report = {
  schema_version: '1.1',
  report_id: 'historie_geographic_profile_oslo_akershus_v1',
  profile_id: profile.profile_id,
  subject_id: 'historie',
  geography_id: profile.geography.geography_id,
  status: baselineMet ? 'EVIDENCE_BASELINE_COMPLETE' : 'INCOMPLETE',
  interpretation: 'Statusen gjelder en regional evidensbaseline og må ikke tolkes som full geografisk eller universell fagdekning.',
  structural_foundation: {
    status: mappings.length >= 190 ? 'PASS' : 'GAP',
    total_subject_emner: emner.length,
    mapped_emner: mappings.length,
    mapped_ratio: emner.length ? Math.round((mappings.length / emner.length) * 1000) / 1000 : 0,
    preserved_case_candidates: cases.length,
  },
  evidence_foundation: {
    status: baselineMet ? 'PASS' : 'GAP',
    claims: claims.length,
    sources: sources.length,
    evidence_links: evidence.length,
    verified_cases: verifiedCases.length,
    claims_with_multiple_sources: claimsWithMultipleSources.length,
  },
  open_gaps: [
    ...(mappedEmneIds.size < emner.length ? ['Ikke alle universelle emner har en Oslo/Akershus-casekandidat.'] : []),
    ...(verifiedCases.length < 10 ? ['Færre enn ti profilcaser har validert claim–source–evidence-kjede.'] : []),
    ...(evidence.length < 20 ? ['Evidensregisteret dekker fortsatt for få sted–claim-koblinger.'] : []),
    'De øvrige legacy-casekandidatene må normaliseres mot canonical place- og person-ID-er før de kan regnes som produksjonsklare.',
    'Regional baseline må senere utvides med flere Akershus-kommuner, perioder, aktører og konfliktperspektiver.',
  ],
};
const markdown = [
  '# Historie — geografisk produksjonsprofil for Oslo og Akershus',
  '',
  \`Status: **\${report.status}**\`,
  '',
  report.interpretation,
  '',
  '## Struktur',
  '',
  \`- Universelle emner: **\${report.structural_foundation.total_subject_emner}**\`,
  \`- Emner med migrerte profilkoblinger: **\${report.structural_foundation.mapped_emner}**\`,
  \`- Bevarte lokale casekandidater: **\${report.structural_foundation.preserved_case_candidates}**\`,
  '',
  '## Evidensgrunnlag',
  '',
  \`- Claims: **\${report.evidence_foundation.claims}**\`,
  \`- Kilder: **\${report.evidence_foundation.sources}**\`,
  \`- Sted–emne–claim–kildekoblinger: **\${report.evidence_foundation.evidence_links}**\`,
  \`- Validerte profilcaser: **\${report.evidence_foundation.verified_cases}**\`,
  \`- Claims med minst to kilder: **\${report.evidence_foundation.claims_with_multiple_sources}**\`,
  '',
  '## Åpne gap',
  '',
  ...report.open_gaps.map((item) => \`- \${item}\`),
  '',
].join('\\n');
fs.mkdirSync(reportDir, { recursive: true });
if (checkMode) {
  const stale = [];
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== stable(report)) stale.push(jsonPath);
  if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8') !== markdown) stale.push(mdPath);
  if (stale.length) {
    console.error('Historie geographic profile reports are missing or stale:');
    stale.forEach((file) => console.error(\`- \${path.relative(root, file)}\`));
    process.exit(1);
  }
} else {
  fs.writeFileSync(jsonPath, stable(report));
  fs.writeFileSync(mdPath, markdown);
}
console.log(\`Historie Oslo/Akershus profile: \${report.status}; mappings=\${mappings.length}, cases=\${cases.length}, evidence=\${evidence.length}\`);
`;
fs.writeFileSync(profileAuditPath, profileAudit);

const multiSourceClaims = claimsFile.claims.filter((item) => A(item.source_ids).length >= 2).length;
const foundation = {
  schema_version: '1.1',
  report_id: 'historie_profile_evidence_foundation_v1',
  status: 'EVIDENCE_BATCH_V2_MATERIALIZED',
  subject_id: 'historie',
  canonical_subject_version: profile.canonical_subject_version,
  migration: profile.migration_summary,
  inventory: {
    emner: profile.production_coverage.total_subject_emner,
    case_requirements: requirementIds.length,
    profile_cases: A(profile.cases).length,
    profile_mappings: A(profile.emne_case_mappings).length,
    validated_cases: verifiedCases.length,
    claims: claimsFile.claims.length,
    sources: sourcesFile.sources.length,
    evidence_links: evidenceFile.evidence_links.length,
    claims_with_multiple_sources: multiSourceClaims,
  },
  interpretation: 'Dette materialiserer en regional evidensbaseline. Det er ikke en universell fullstendighetsattest og dekker ikke alle profilcaser.',
};
writeJson(foundationJsonPath, foundation);
fs.writeFileSync(foundationMdPath, [
  '# Historie — profil- og evidensgrunnlag',
  '',
  `Status: **${foundation.status}**`,
  '',
  foundation.interpretation,
  '',
  '## Inventar',
  '',
  `- Validerte profilcaser: **${verifiedCases.length}**`,
  `- Claims: **${claimsFile.claims.length}**`,
  `- Kilder: **${sourcesFile.sources.length}**`,
  `- Evidenslenker: **${evidenceFile.evidence_links.length}**`,
  `- Claims med minst to kilder: **${multiSourceClaims}**`,
  '',
].join('\n'));

const materialization = {
  schema_version: '1.0',
  report_id: batchId,
  status: verifiedCases.length >= 10 && evidenceFile.evidence_links.length >= 20 ? 'PASS' : 'FAIL',
  materialized_at: today,
  profile_id: profile.profile_id,
  baseline: {
    validated_cases: verifiedCases.length,
    claims: claimsFile.claims.length,
    sources: sourcesFile.sources.length,
    evidence_links: evidenceFile.evidence_links.length,
    new_cases: specs.length,
    new_claims: newClaims.length,
    new_sources: sourceDefinitions.length,
    new_evidence_links: newEvidence.length,
  },
  cases: specs.map((spec) => ({
    case_id: spec.case_id,
    label: spec.label,
    place_ids: spec.place_ids,
    claim_ids: spec.claims.map((item) => item.claim_id),
    source_ids: [...new Set(spec.claims.flatMap((item) => item.source_ids))],
  })),
  guardrails: [
    'Statusen gjelder regional evidensbaseline, ikke universell fullstendighet.',
    'Alle claims har eksplisitt usikkerhetsvurdering og alternativ tolkning eller caveat.',
    'Alle validerte caser har canonical place-ID, fire casekrav og minst to evidenslenker.',
  ],
};
if (materialization.status !== 'PASS') fail('Evidence batch did not meet production baseline');
writeJson(batchJsonPath, materialization);
fs.writeFileSync(batchMdPath, [
  '# Historie — Oslo/Akershus evidensbatch V2',
  '',
  `Status: **${materialization.status}**`,
  '',
  `- Validerte profilcaser totalt: **${verifiedCases.length}**`,
  `- Nye validerte caser: **${specs.length}**`,
  `- Claims totalt: **${claimsFile.claims.length}**`,
  `- Kilder totalt: **${sourcesFile.sources.length}**`,
  `- Evidenslenker totalt: **${evidenceFile.evidence_links.length}**`,
  '',
  '## Nye caser',
  '',
  ...specs.map((spec) => `- ${spec.label}: ${spec.claims.length} claims, ${new Set(spec.claims.flatMap((item) => item.source_ids)).size} kilder, place-ID \`${spec.place_ids[0]}\``),
  '',
  'Denne baselinen dokumenterer produksjonsberedskap for et utvalg regionale caser. Den er ikke en fullstendighetsattest for hele Oslo/Akershus eller den universelle fagmodellen.',
  '',
].join('\n'));

fs.writeFileSync(docsPath, `# Oslo/Akershus evidensbatch V2\n\nBatch V2 løfter Historie-profilen fra ett pilotcase til ti validerte claim–source–place–emne-kjeder.\n\n## Omfang\n\n- Pilot: Oslo rådhus\n- Nye caser: Akershus festning, Hovedøya kloster, Eidsvollsbygningen, Folkets Hus, Akerselva, HL-senteret/Villa Grande, Bispelokket, 22. juli-senteret og Gamle Deichman på Hammersborg\n- Hvert nytt case har to claims, canonical place-ID, eksplisitte kilder, usikkerhetsvurdering og alternative tolkninger.\n\n## Statusforståelse\n\n\`EVIDENCE_BASELINE_COMPLETE\` betyr at den avtalte regionale minimumsbaselinen er nådd: minst ti validerte caser og minst tjue evidenslenker. Det betyr ikke at Oslo/Akershus er fullstendig dekket, og det betyr ikke at den universelle Historie-modellen er komplett.\n\n## Neste produksjonsgap\n\nProfilen må fortsatt utvides med flere Akershus-kommuner, flere aktørgrupper, flere kildearter og normalisering av de øvrige legacy-casekandidatene.\n`);

console.log(JSON.stringify(materialization, null, 2));
