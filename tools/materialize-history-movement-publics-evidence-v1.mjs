#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const h = path.join(root, 'data/fag/historie');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const claimsPath = path.join(h, 'claims_historie_canonical_v1.json');
const sourcesPath = path.join(h, 'sources_historie_canonical_v1.json');
const evidencePath = path.join(h, 'place_evidence_historie_v1.json');
const theoryRegistryPath = path.join(h, 'theory_evidence_historie_canonical_v1.json');
const dossierPath = path.join(h, 'source_dossiers/movement_publics_v1.json');
const gapV2Path = path.join(root, 'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v2.json');
const gapV3JsonPath = path.join(root, 'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v3.json');
const gapV3MdPath = path.join(root, 'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v3.md');
const profileFoundationJsonPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.json');
const profileFoundationMdPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.md');
const theoryDocPath = path.join(root, 'docs/HISTORY_THEORY_EVIDENCE.md');
const phaseDocPath = path.join(root, 'docs/HISTORY_MOVEMENT_PUBLICS_EVIDENCE_V1.md');

const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel = (file) => path.relative(root, file).split(path.sep).join('/');
const G = 'geo_no_oslo_akershus';
const PROFILE = 'profile_historie_no_oslo_akershus';
const CASE_REQS = [
  'case_req_his_temporal_sequence',
  'case_req_his_actor_conflict',
  'case_req_his_source_comparison',
  'case_req_his_comparative_scale',
];
const EM = {
  press: 'em_his_offentlighet_mobilisering_presse_offentlighet_og_politisk_kommunikasjon',
  org: 'em_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn',
  protest: 'em_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
  worker: 'em_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
  solidarity: 'em_his_offentlighet_mobilisering_borgerrettigheter_solidaritet_og_internasjonalisme',
  environment: 'em_his_offentlighet_mobilisering_miljobevegelse_og_nye_sosiale_bevegelser',
  antiracism: 'em_his_offentlighet_mobilisering_borgerrettighetskamp_antirasisme_og_solidaritetsbevegelser',
};

const newSources = [
  {
    source_id: 'src_his_arbark_mayday_history',
    title: '1. mai – arbeiderbevegelsens internasjonale kampdag',
    publisher: 'Arbeiderbevegelsens arkiv og bibliotek',
    source_type: 'archive_curated_history',
    url: 'https://www.arbark.no/Utstilling/1mai/1mai01.htm',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1890, to: null },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_arbark_mayday_history'], accessed_at: '2026-07-27' },
    dating: { published_at: '2026-04-22', updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Arkivets temapresentasjon gir en kuratert nasjonal historie om 1. mai og prioriterer arbeiderbevegelsens egne samlinger og fortolkningsrammer.',
      'Framstillingen dokumenterer sentrale krav, ritualer og bilder, men erstatter ikke samtidspresse, politirapporter eller lokale organisasjonsarkiver for hver enkelt markering.'
    ],
    quality: { tier: 'A', rationale: 'Faglig kuratert arkivkilde med eksplisitt dokumentasjon av 1. mai som kamp-, fest- og mobiliseringsrepertoar.' }
  },
  {
    source_id: 'src_his_arbark_eight_hour_day_1890',
    title: 'Åttetimersdagen – 1. mai og kampen for åttetimers arbeidsdag',
    publisher: 'Arbeiderbevegelsens arkiv og bibliotek',
    source_type: 'archive_curated_history',
    url: 'https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1890, to: 1919 },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_arbark_eight_hour_day_1890'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Kilden er en tematisk nettutstilling og komprimerer organisatoriske uenigheter og variasjon mellom fag, byer og politiske retninger.',
      'Deltakertallet og rutebeskrivelsen bygger på arkivets sammenstilling og bør kontrolleres mot samtidige aviser ved finmasket hendelsesanalyse.'
    ],
    quality: { tier: 'A', rationale: 'Arkivforankret kilde til den første 1. mai-demonstrasjonen i Kristiania og åttetimerskravet.' }
  },
  {
    source_id: 'src_his_arbark_youngstorget',
    title: 'Youngstorget',
    publisher: 'Arbeiderbevegelsens arkiv og bibliotek',
    source_type: 'archive_image_series',
    url: 'https://www.arbark.no/Bildeserier/Youngstorget/Youngstorget.htm',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1890, to: null },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_arbark_youngstorget'], accessed_at: '2026-07-27' },
    dating: { published_at: '2021-01-12', updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Bildeserien er selektiv og viser særlig arbeiderbevegelsens bruk av torget; andre brukere, konflikter og hverdagsfunksjoner er mindre synlige.',
      'Korte bildetekster gir sikker datering av utvalgte hendelser, men begrenset informasjon om deltakernes sammensetning og opplevelser.'
    ],
    quality: { tier: 'A', rationale: 'Arkivkilde som dokumenterer Youngstorget som oppstillingsplass fra 1890 og hovedarena fra 1956.' }
  },
  {
    source_id: 'src_his_norsk_folkemuseum_enebakkveien16',
    title: 'Sagene og Vålerenga – Enebakkveien 16',
    publisher: 'Norsk Folkemuseum',
    source_type: 'museum_object_history',
    url: 'https://norskfolkemuseum.no/sagene-og-valerenga',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1870, to: 1985 },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_norsk_folkemuseum_enebakkveien16'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Museets objekthistorie beskriver bygningens bruk og flytting, men gir ikke medlemslister, møteprotokoller eller interne konflikter i arbeider- og avholdsforeningene.',
      'Formuleringen om at foreningene skal ha hatt tilhold angir en dokumentert, men ikke fullt kildeutlagt brukshistorie på nettsiden.'
    ],
    quality: { tier: 'A', rationale: 'Primær institusjonskilde for den bevarte bygningen, oppføringen på museet og dens dokumenterte foreningsbruk.' }
  },
  {
    source_id: 'src_his_oslo_byleksikon_valerenga_baptistkirke',
    title: 'Vålerenga Baptistkirke',
    publisher: 'Oslo byleksikon',
    source_type: 'local_reference_encyclopedia',
    url: 'https://oslobyleksikon.no/side/V%C3%A5lerenga_Baptistkirke',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1850, to: 1985 },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_oslo_byleksikon_valerenga_baptistkirke'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Leksikonartikkelen sammenfatter en lang bygnings- og menighetshistorie og viser ikke de underliggende protokollene for arbeidersamfunn og avholdsforening.',
      'Artikkelen knytter den gamle bygningen til dagens kirketomt og museet, men skiller ikke detaljert mellom alle organisasjonenes bruk gjennom perioden.'
    ],
    quality: { tier: 'B', rationale: 'Redigert lokalhistorisk kilde som uavhengig støtter foreningsbruken, rivningen og gjenoppføringen.' }
  },
  {
    source_id: 'src_his_snl_blitz',
    title: 'Blitz',
    publisher: 'Store norske leksikon',
    source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Blitz',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1981, to: null },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_snl_blitz'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: '2024-11-25', accessed_at: '2026-07-27' },
    limitations: [
      'Leksikonartikkelen sammenfatter et konfliktfylt miljø og kan ikke erstatte kommunale saksdokumenter, politiarkiv eller deltakernes egne arkiver.',
      'Betegnelser som radikal og voldsom er fortolkende og må leses sammen med aktørenes egenorganisering, mål og erfaringer med motstand.'
    ],
    quality: { tier: 'B', rationale: 'Fagredigert oversiktskilde for husokkupasjonen, etableringen, rivningskonfliktene og antirasistiske markeringer.' }
  },
  {
    source_id: 'src_his_oslo_byleksikon_blitz',
    title: 'Blitz',
    publisher: 'Oslo byleksikon',
    source_type: 'local_reference_encyclopedia',
    url: 'https://oslobyleksikon.no/side/Blitz',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1981, to: null },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_oslo_byleksikon_blitz'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Byhistorien beskriver kommunale vedtak og offentlig konflikt i kortformat og dokumenterer ikke alle forhandlingsledd eller interne beslutninger i Blitz-miljøet.',
      'Artikkelen presenterer både kritikk og institusjonell utvikling, men gir begrenset plass til kjønn, subkultur og konkrete aksjonsgruppers egne perspektiver.'
    ],
    quality: { tier: 'B', rationale: 'Redigert lokalhistorisk kilde til okkupasjonsbakgrunnen, kommuneavtalen, rivningsprotestene og fredningen.' }
  },
  {
    source_id: 'src_his_blitz_about',
    title: 'About Blitz',
    publisher: 'Blitz',
    source_type: 'movement_self_description',
    url: 'https://blitz.no/about.html',
    language: 'en', geography_ids: [G], temporal_scope: { from: 1982, to: null },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_blitz_about'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Selvpresentasjonen er en aktørkilde som uttrykker Blitz’ nåværende identitet og verdier og kan ikke alene dokumentere hele husets historiske utvikling.',
      'Nettsiden oppgir ikke systematisk publiserings- eller revisjonshistorikk og må sammenholdes med arkiv- og sekundærkilder for daterte påstander.'
    ],
    quality: { tier: 'A', rationale: 'Direkte aktørkilde til husets selvforståelse, organisasjonsform og uttalte antifascistiske og antirasistiske orientering.' }
  },
  {
    source_id: 'src_his_snl_antifascism',
    title: 'antifascisme',
    publisher: 'Store norske leksikon',
    source_type: 'scholarly_reference_encyclopedia',
    url: 'https://snl.no/antifascisme',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1932, to: null },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_snl_antifascism'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Oversiktsartikkelen setter Blitz inn i en transnasjonal antifascistisk historie og kan ikke dokumentere alle lokale grupper, hendelser eller interne strategidebatter.',
      'Fokuset på militant antifascisme kan underrepresentere bredere ikke-voldelige, juridiske og pedagogiske former for antirasistisk arbeid.'
    ],
    quality: { tier: 'B', rationale: 'Fagredigert kilde som identifiserer Blitz som sentral infrastruktur for moderne norsk antifascisme og AFA-miljøet.' }
  },
  {
    source_id: 'src_his_oslo_museum_vietnam_demo_1968',
    title: 'Vietnamdemonstrasjon foran Stortinget',
    publisher: 'Oslo Museum / Oslobilder',
    source_type: 'museum_catalog_record',
    url: 'https://www.oslobilder.no/OMU/OB.A11178',
    language: 'nb', geography_ids: [G], temporal_scope: { from: '1968-04', to: '1968-04' },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_oslo_museum_vietnam_demo_1968'], accessed_at: '2026-07-27' },
    dating: { published_at: '1968-04', updated_at: null, accessed_at: '2026-07-27' },
    limitations: [
      'Katalogposten dokumenterer tid, sted og motiv, men identifiserer ikke alle organisasjoner, deltakere, paroler eller hendelsesforløpet før og etter fotografiet.',
      'Et enkelt fotografi viser et utsnitt av demonstrasjonen og må ikke brukes som mål på samlet deltakelse, representativitet eller politisk virkning.'
    ],
    quality: { tier: 'A', rationale: 'Museumsforvaltet samtidig fotografisk kilde med eksplisitt datering og stedfesting på Eidsvolls plass.' }
  },
  {
    source_id: 'src_his_storting_protest_activism',
    title: 'Protest og politisk aktivisme',
    publisher: 'Stortinget',
    source_type: 'official_archive_presentation',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/historisk-dokumentasjon/Protest',
    language: 'nb', geography_ids: [G], temporal_scope: { from: 1948, to: 2022 },
    provenance: { repository_source: rel(dossierPath), extracted_from: ['sources.src_his_storting_protest_activism'], accessed_at: '2026-07-27' },
    dating: { published_at: null, updated_at: '2022-12-21', accessed_at: '2026-07-27' },
    limitations: [
      'Stortingsarkivets presentasjon synliggjør materiale som er sendt til nasjonalforsamlingen og underrepresenterer aksjoner som ikke etterlot dokumenter i dette arkivet.',
      'Eksemplene er pedagogisk utvalgt og komprimerer organisasjonenes interne arbeid, lokale forløp og myndighetsrespons utenfor Stortinget.'
    ],
    quality: { tier: 'A', rationale: 'Offisiell arkivkilde til underskriftskampanjer, opprop, internasjonal solidaritet, miljøaksjoner og nye protestrepertoarer.' }
  }
];

const newClaims = [
  {
    claim_id: 'claim_his_youngstorget_mayday_1890_eight_hour_demand',
    statement: 'Den første norske 1. mai-markeringen i 1890 samlet om lag 4 000 arbeidere i et demonstrasjonstog fra Youngstorget til Tullinløkka med kravet om åtte timers normalarbeidsdag.',
    claim_type: 'mass_demonstration',
    scope: { geography_ids: [G], place_ids: ['youngstorget'], case_ids: ['case_his_youngstorget'], temporal: { from: '1890-05-01', to: '1890-05-01' } },
    emne_ids: [EM.org, EM.protest, EM.worker],
    source_ids: ['src_his_arbark_mayday_history', 'src_his_arbark_eight_hour_day_1890'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Rute, krav og omtrentlig deltakelse er dokumentert av arkivet; eksakt antall og deltakernes sammensetning bør kontrolleres mot samtidspresse.' },
    alternative_interpretations: ['Markeringen kan leses både som et konkret arbeidstidskrav og som et ritual som bygget kollektiv identitet, internasjonalisme og organisatorisk disiplin.']
  },
  {
    claim_id: 'claim_his_youngstorget_mayday_assembly_and_main_arena',
    statement: 'Youngstorget har vært oppstillingsplass for 1. mai-tog siden 1890, og fra 1956 ble hovedarrangementet for Oslos markering lagt til torget.',
    claim_type: 'ritualized_mobilization_arena',
    scope: { geography_ids: [G], place_ids: ['youngstorget'], case_ids: ['case_his_youngstorget'], temporal: { from: 1890, to: null } },
    emne_ids: [EM.org, EM.protest, EM.worker],
    source_ids: ['src_his_arbark_youngstorget'],
    confidence: 'high', uncertainty: { level: 'low', note: 'Arkivets bildeserie daterer både oppstillingsbruken og flyttingen av hovedarrangementet; intensitet og politisk innhold har variert mellom år.' },
    alternative_interpretations: ['Kontinuiteten kan forstås som bevegelsestradisjon, men torgets mening er blitt reforhandlet gjennom skiftende paroler, splittelser og deltakermønstre.']
  },
  {
    claim_id: 'claim_his_norsk_folkemuseum_enebakkveien16_workers_temperance',
    statement: 'Forsamlingslokalet i annen etasje i Enebakkveien 16 ble brukt av Østre Aker Arbeidersamfund i 1870-årene og av Vaalerengen Totalafholdsforening omkring 1900, før baptistmenigheten overtok i 1912.',
    claim_type: 'movement_infrastructure_overlap',
    scope: { geography_ids: [G], place_ids: ['norsk_folkemuseum'], case_ids: ['case_his_norsk_folkemuseum'], temporal: { from: 1870, to: 1912 } },
    emne_ids: [EM.org, EM.worker],
    source_ids: ['src_his_norsk_folkemuseum_enebakkveien16', 'src_his_oslo_byleksikon_valerenga_baptistkirke'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Institusjonene og periodene er støttet av museum og byleksikon; nettsidene gjengir ikke medlemslister eller alle år med aktivitet.' },
    alternative_interpretations: ['Den samme salen viser organisatorisk overlapp og lokal knapphet på møteplasser, men dokumenterer ikke at arbeider- og avholdsbevegelsen hadde identiske medlemmer eller mål.']
  },
  {
    claim_id: 'claim_his_norsk_folkemuseum_enebakkveien16_relocated_1985',
    statement: 'Bygningen fra Enebakkveien 16 ble revet på Vålerenga i 1981 og gjenoppført på Norsk Folkemuseum i 1985, der den bevarer et materiell spor etter boliger og foreningsliv i arbeiderbyen.',
    claim_type: 'material_trace_relocation',
    scope: { geography_ids: [G], place_ids: ['norsk_folkemuseum'], case_ids: ['case_his_norsk_folkemuseum'], temporal: { from: 1981, to: 1985 } },
    emne_ids: [EM.org, EM.worker],
    source_ids: ['src_his_norsk_folkemuseum_enebakkveien16', 'src_his_oslo_byleksikon_valerenga_baptistkirke'],
    confidence: 'high', uncertainty: { level: 'low', note: 'Rivning og gjenoppføring er konsistent dokumentert; museumsplasseringen endrer den opprinnelige gate- og nabolagskonteksten.' },
    alternative_interpretations: ['Flyttingen kan forstås som bevaring av et sjeldent sosialhistorisk spor, men også som en musealisering som løsriver bygningen fra Vålerengas levende stedshistorie.']
  },
  {
    claim_id: 'claim_his_blitz_origin_house_occupation_1981_1982',
    statement: 'Blitz-miljøet sprang ut av okkupasjonen av Skippergata 6 i 1981–1982; etter tømmingen inngikk ungdommene en avtale med Oslo kommune om aktivitetshus i Pilestredet 30C.',
    claim_type: 'occupation_to_institution',
    scope: { geography_ids: [G], place_ids: ['blitzhuset'], case_ids: ['case_his_blitz'], temporal: { from: 1981, to: 1982 } },
    emne_ids: [EM.org, EM.protest],
    source_ids: ['src_his_snl_blitz', 'src_his_oslo_byleksikon_blitz'],
    confidence: 'high', uncertainty: { level: 'low', note: 'Hovedforløpet er konsistent i to redigerte kilder; detaljene i forhandlingene og deltakernes interne beslutninger krever kommunale og bevegelsesarkiver.' },
    alternative_interpretations: ['Forløpet kan leses som institusjonalisering av husokkupasjon, men også som et kompromiss der kommunen avgrenset og samtidig muliggjorde autonom organisering.']
  },
  {
    claim_id: 'claim_his_blitz_demolition_protests_1990_2004',
    statement: 'Rivningsforslag mot Blitzhuset i 1990- og 2000-årene utløste aksjoner fra Blitz og støttespillere, og etter en lang konflikt ble det i 2004 avklart at huset skulle bestå og rehabiliteres.',
    claim_type: 'contentious_politics_outcome',
    scope: { geography_ids: [G], place_ids: ['blitzhuset'], case_ids: ['case_his_blitz'], temporal: { from: 1990, to: 2004 } },
    emne_ids: [EM.org, EM.protest],
    source_ids: ['src_his_snl_blitz', 'src_his_oslo_byleksikon_blitz'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Kildene dokumenterer protest og sluttutfall, men isolerer ikke protestenes effekt fra fredning, bypolitikk, eierskap og samarbeid med andre institusjoner.' },
    alternative_interpretations: ['Utfallet kan tolkes som bevegelsesseier, kommunal konfliktregulering eller kulturminnepolitikk; årsakene må ikke reduseres til én aksjonsform.']
  },
  {
    claim_id: 'claim_his_blitz_antifascist_network_center_1982_1994',
    statement: 'Blitzhuset ble et sentralt samlingspunkt for den moderne antifascistiske bevegelsen i Norge, og den norske Antifascistisk Aksjon ble etablert i Blitz-miljøet i 1994.',
    claim_type: 'movement_network_infrastructure',
    scope: { geography_ids: [G], place_ids: ['blitzhuset'], case_ids: ['case_his_blitz'], temporal: { from: 1982, to: 1994 } },
    emne_ids: [EM.org, EM.protest, EM.antiracism],
    source_ids: ['src_his_blitz_about', 'src_his_snl_antifascism'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Kildene identifiserer huset og nettverket, men dokumenterer ikke full medlemsstruktur, aktivitet eller representativitet for all norsk antifascisme.' },
    alternative_interpretations: ['Blitz kan forstås som avgjørende infrastruktur for militant antifascisme uten at huset dermed representerer hele bredden av antirasistisk og antifascistisk arbeid.']
  },
  {
    claim_id: 'claim_his_blitz_antiracism_street_party_1999',
    statement: 'I 1999 ble det arrangert gatefest mot rasisme utenfor Blitzhuset, et eksempel på hvordan musikk-, gate- og festrepertoarer ble brukt som antirasistisk offentlig handling.',
    claim_type: 'antiracist_public_action',
    scope: { geography_ids: [G], place_ids: ['blitzhuset'], case_ids: ['case_his_blitz'], temporal: { from: 1999, to: 1999 } },
    emne_ids: [EM.press, EM.protest, EM.antiracism],
    source_ids: ['src_his_snl_blitz'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Fototeksten dokumenterer arrangementets sted og formål, men gir ikke full informasjon om arrangører, deltakelse, program eller ettervirkning.' },
    alternative_interpretations: ['Gatefesten kan analyseres som lavterskel mobilisering og kulturell motmakt, men ett arrangement dokumenterer ikke bevegelsens varighet eller politiske effekt.']
  },
  {
    claim_id: 'claim_his_eidsvolls_plass_vietnam_demonstration_1968',
    statement: 'I april 1968 fant en Vietnamdemonstrasjon sted på Eidsvolls plass foran Stortinget; samtidige museumsfotografier viser demonstranter, politi og blokkering av trafikk i den parlamentariske offentligheten.',
    claim_type: 'solidarity_demonstration',
    scope: { geography_ids: [G], place_ids: ['eidsvolls_plass'], case_ids: ['case_his_eidsvolls_plass'], temporal: { from: '1968-04', to: '1968-04' } },
    emne_ids: [EM.press, EM.protest, EM.solidarity, EM.antiracism],
    source_ids: ['src_his_oslo_museum_vietnam_demo_1968', 'src_his_storting_eidsvolls_plass'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Tid og sted er sikkert dokumentert, mens fotografiet og oversiktsteksten ikke identifiserer alle organisasjoner, paroler eller konfliktledd.' },
    alternative_interpretations: ['Aksjonen kan forstås som internasjonal solidaritet, generasjonsopprør eller NATO-kritikk; disse motivene kan ha overlappet uten å være identiske.']
  },
  {
    claim_id: 'claim_his_storting_protest_archive_petition_repertoires',
    statement: 'Stortingsarkivet bevarer postkort, brev, opprop og underskriftslister fra landsdekkende og lokale aksjoner, og dokumenterer hvordan direkte henvendelser til nasjonalforsamlingen er blitt et varig protestrepertoar.',
    claim_type: 'petition_repertoire_archive',
    scope: { geography_ids: [G], place_ids: ['stortinget'], case_ids: ['case_his_stortinget'], temporal: { from: 1948, to: 2022 } },
    emne_ids: [EM.press, EM.org, EM.protest],
    source_ids: ['src_his_storting_protest_activism'],
    confidence: 'high', uncertainty: { level: 'low', note: 'Arkivets materialtyper er eksplisitt oppgitt; bevaringspraksis og utvalg påvirker hvilke bevegelser og aksjoner som er synlige.' },
    alternative_interpretations: ['Materialet viser institusjonalisert protest og deltakelse, men arkivmengde kan ikke uten videre brukes som mål på en bevegelses størrelse eller gjennomslag.']
  },
  {
    claim_id: 'claim_his_storting_hardangervidda_petition_1978_1979',
    statement: 'I striden om vassdragsutbygging på Hardangervidda mottok Stortinget i 1978–1979 11 384 underskrifter til støtte for vern, et eksempel på miljøbevegelsens bruk av organiserte petisjoner.',
    claim_type: 'environmental_petition',
    scope: { geography_ids: [G], place_ids: ['stortinget'], case_ids: ['case_his_stortinget'], temporal: { from: 1978, to: 1979 } },
    emne_ids: [EM.org, EM.protest, EM.environment],
    source_ids: ['src_his_storting_protest_activism'],
    confidence: 'high', uncertainty: { level: 'low', note: 'Antallet og mottaket er oppgitt av Stortingsarkivet; materialet alene viser ikke hvem som signerte eller hvordan underskriftene påvirket vedtaket.' },
    alternative_interpretations: ['Petisjonen kan leses som bred naturvernmobilisering, men også som én del av et større forløp med ekspertkunnskap, lokale interesser og parlamentarisk saksbehandling.']
  },
  {
    claim_id: 'claim_his_storting_nuclear_free_nordic_zone_petition_1982',
    statement: 'Nei til Atomvåpen overleverte i juni 1982 en henstilling med 540 268 underskrifter om forbud mot atomvåpen på norsk område og en traktatfestet atomvåpenfri nordisk sone.',
    claim_type: 'peace_movement_petition',
    scope: { geography_ids: [G], place_ids: ['stortinget'], case_ids: ['case_his_stortinget'], temporal: { from: '1982-06', to: '1982-06' } },
    emne_ids: [EM.org, EM.protest, EM.solidarity, EM.environment],
    source_ids: ['src_his_storting_protest_activism'],
    confidence: 'high', uncertainty: { level: 'low', note: 'Stortingets presentasjon siterer henstillingen og underskriftstallet; registeret dokumenterer ikke kontrollen av hver signatur eller kampanjens fulle organisasjonsnettverk.' },
    alternative_interpretations: ['Aksjonen kan analyseres som fredsbevegelse, sikkerhetspolitisk motmakt og ny sosial bevegelse, men den er ikke i seg selv en miljøaksjon i snever forstand.']
  },
  {
    claim_id: 'claim_his_eidsvolls_plass_alta_demonstration_1979',
    statement: 'Eidsvolls plass var arena for demonstrasjoner knyttet til Alta-konflikten i 1979, der miljøvern, urfolksrettigheter og direkte press mot nasjonale myndigheter ble koblet i samme offentlige rom.',
    claim_type: 'environmental_demonstration',
    scope: { geography_ids: [G], place_ids: ['eidsvolls_plass'], case_ids: ['case_his_eidsvolls_plass'], temporal: { from: 1979, to: 1979 } },
    emne_ids: [EM.protest, EM.solidarity, EM.environment],
    source_ids: ['src_his_storting_eidsvolls_plass', 'src_his_storting_protest_activism'],
    confidence: 'high', uncertainty: { level: 'medium', note: 'Kildene dokumenterer plassen og konfliktens plass i protesthistorien, men gir ikke samiske deltakeres egne forklaringer eller hele Alta-forløpet.' },
    alternative_interpretations: ['Demonstrasjonen kan forstås som miljøkamp, urfolkskamp og konflikt om statlig utbyggingsmakt; ingen av perspektivene bør alene absorbere de andre.']
  }
];

const evidenceSpecs = [
  ['evidence_his_youngstorget_01', 'youngstorget', 'case_his_youngstorget', 'claim_his_youngstorget_mayday_1890_eight_hour_demand'],
  ['evidence_his_youngstorget_02', 'youngstorget', 'case_his_youngstorget', 'claim_his_youngstorget_mayday_assembly_and_main_arena'],
  ['evidence_his_norsk_folkemuseum_01', 'norsk_folkemuseum', 'case_his_norsk_folkemuseum', 'claim_his_norsk_folkemuseum_enebakkveien16_workers_temperance'],
  ['evidence_his_norsk_folkemuseum_02', 'norsk_folkemuseum', 'case_his_norsk_folkemuseum', 'claim_his_norsk_folkemuseum_enebakkveien16_relocated_1985'],
  ['evidence_his_blitz_01', 'blitzhuset', 'case_his_blitz', 'claim_his_blitz_origin_house_occupation_1981_1982'],
  ['evidence_his_blitz_02', 'blitzhuset', 'case_his_blitz', 'claim_his_blitz_demolition_protests_1990_2004'],
  ['evidence_his_blitz_03', 'blitzhuset', 'case_his_blitz', 'claim_his_blitz_antifascist_network_center_1982_1994'],
  ['evidence_his_blitz_04', 'blitzhuset', 'case_his_blitz', 'claim_his_blitz_antiracism_street_party_1999'],
  ['evidence_his_eidsvolls_plass_03', 'eidsvolls_plass', 'case_his_eidsvolls_plass', 'claim_his_eidsvolls_plass_vietnam_demonstration_1968'],
  ['evidence_his_stortinget_11', 'stortinget', 'case_his_stortinget', 'claim_his_storting_protest_archive_petition_repertoires'],
  ['evidence_his_stortinget_12', 'stortinget', 'case_his_stortinget', 'claim_his_storting_hardangervidda_petition_1978_1979'],
  ['evidence_his_stortinget_13', 'stortinget', 'case_his_stortinget', 'claim_his_storting_nuclear_free_nordic_zone_petition_1982'],
  ['evidence_his_eidsvolls_plass_04', 'eidsvolls_plass', 'case_his_eidsvolls_plass', 'claim_his_eidsvolls_plass_alta_demonstration_1979'],
];

const theorySpecs = [
  {
    theory_id: 'theory_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
    claim_ids: [
      'claim_his_youngstorget_mayday_1890_eight_hour_demand',
      'claim_his_blitz_origin_house_occupation_1981_1982',
      'claim_his_blitz_demolition_protests_1990_2004',
      'claim_his_eidsvolls_plass_vietnam_demonstration_1968',
      'claim_his_storting_protest_archive_petition_repertoires',
      'claim_his_eidsvolls_plass_alta_demonstration_1979'
    ],
    rationale: 'Youngstorget dokumenterer massemarkering og et varig ritualisert mønster, Blitz viser okkupasjon, forhandling og aksjoner mot riving, mens Eidsvolls plass og Stortinget viser solidaritetsdemonstrasjon, miljøprotest og petisjoner. Samlet prøver materialet hvordan repertoarer læres, kombineres og flyttes mellom gate, møteplass og institusjon.',
    limitations: [
      'Piloten er hovedstads- og institusjonsorientert og dokumenterer ikke lokale streiker, rurale aksjoner eller den fulle geografiske spredningen av norske protestformer.',
      'Synlige demonstrasjoner og bevarte petisjoner overrepresenteres; uformelt organisasjonsarbeid, omsorgsarbeid, finansiering og deltakere som ikke etterlot arkivspor er svakere belyst.'
    ],
    alternatives: ['Forløpene kan tolkes som bevegelseslæring og repertoarutvidelse, men også som separate konflikter der lik aksjonsform hadde ulik mening, risiko og myndighetsrespons.'],
    disconfirmation: ['Anvendelsen svekkes dersom aksjonsformen alene brukes som forklaring uten organisasjon, krav, arena, motaktører, tidsforløp og alternative årsaker til utfallet.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
    claim_ids: [
      'claim_his_folkets_hus_first_opened_1907',
      'claim_his_stortinget_womens_petition_1905',
      'claim_his_youngstorget_mayday_1890_eight_hour_demand',
      'claim_his_youngstorget_mayday_assembly_and_main_arena',
      'claim_his_norsk_folkemuseum_enebakkveien16_workers_temperance',
      'claim_his_norsk_folkemuseum_enebakkveien16_relocated_1985'
    ],
    rationale: 'Folkets Hus og Youngstorget dokumenterer arbeiderbevegelsens organisasjons- og mobiliseringsinfrastruktur, Stortingets kvinneunderskriftsaksjon dokumenterer rettighetskamp uten formell stemmerett, og Enebakkveien 16 viser at arbeider- og avholdsforeninger kunne bruke samme lokale over tid. Den bevarte bygningen gjør også lokal organisasjon materiell og etterprøvbar.',
    limitations: [
      'Materialet gir én tydelig lokal avholdscase og kan ikke representere avholdsbevegelsens nasjonale organisasjoner, kjønnede arbeidsdeling, religiøse nettverk eller politiske innflytelse fullt ut.',
      'Arbeider-, kvinne- og avholdsbevegelser kobles gjennom møteplasser og samtid, men kildene dokumenterer ikke at medlemskap, klasseposisjon, mål eller reformstrategier var de samme.'
    ],
    alternatives: ['Casene kan leses som et sammenvevd organisasjonssamfunn, men også som konkurrerende bevegelser som delte lokaler og repertoarer uten felles politisk prosjekt.'],
    disconfirmation: ['Anvendelsen svekkes dersom felles sted eller organisasjonsform behandles som bevis på identiske medlemsnettverk, krav, maktressurser eller resultater.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_borgerrettighetskamp_antirasisme_og_solidaritetsbevegelser',
    claim_ids: [
      'claim_his_stortinget_womens_petition_1905',
      'claim_his_blitz_origin_house_occupation_1981_1982',
      'claim_his_blitz_antifascist_network_center_1982_1994',
      'claim_his_blitz_antiracism_street_party_1999',
      'claim_his_eidsvolls_plass_vietnam_demonstration_1968'
    ],
    rationale: 'Kvinnenes underskriftsaksjon viser rettighetskrav fra en formelt ekskludert gruppe, Vietnamdemonstrasjonen viser internasjonal solidaritet i parlamentarisk offentlighet, og Blitz viser autonom infrastruktur, antifascistisk nettverk og antirasistisk gatekultur. Kildene kombinerer institusjonelt arkiv, museumsfotografi, fagredigert historie og bevegelsens egen stemme.',
    limitations: [
      'Casene dekker ikke bredden av minoriteters egenorganisering, samiske og nasjonale minoriteters rettighetskamper, organisert antirasisme utenfor Blitz eller solidaritetsarbeid utenfor Oslo.',
      'Blitz-kildene belyser radikal og antifascistisk aktivisme sterkere enn juridiske strategier, hverdagsantirasisme, institusjonsendring og langsiktig håndheving av rettigheter.'
    ],
    alternatives: ['Materialet kan forstås som ulike former for solidaritet og borgerrettighetsmobilisering, men kvinnestemmerett, Vietnamprotest og antifascisme hadde forskjellige berørte grupper, allianser og forhold til staten.'],
    disconfirmation: ['Anvendelsen svekkes dersom allierte eller institusjonelle kilder får erstatte berørte gruppers egne stemmer, eller dersom symbolsk markering behandles som varig rettighetsendring.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_miljobevegelse_og_nye_sosiale_bevegelser',
    claim_ids: [
      'claim_his_storting_protest_archive_petition_repertoires',
      'claim_his_storting_hardangervidda_petition_1978_1979',
      'claim_his_storting_nuclear_free_nordic_zone_petition_1982',
      'claim_his_eidsvolls_plass_alta_demonstration_1979'
    ],
    rationale: 'Stortingsarkivet dokumenterer at miljø- og fredsbevegelser brukte omfattende underskriftskampanjer for vern og atomvåpenfri sikkerhet, mens Eidsvolls plass dokumenterer direkte offentlig mobilisering under Alta-konflikten. Samlet viser casene nettverk, petisjon, stedstilknytning, kunnskapskonflikt og press mot representative institusjoner.',
    limitations: [
      'Piloten mangler lokale Mardøla-, Hardangervidda- og Alta-steder og gir derfor begrenset tilgang til berørte lokalsamfunn, samiske aktører, naturinngrep og feltbasert ekspertkunnskap.',
      'Stortingets mottak av underskrifter dokumenterer mobilisering og institusjonell henvendelse, men ikke automatisk representativitet, beslutningspåvirkning eller varig organisasjonsstyrke.'
    ],
    alternatives: ['Aksjonene kan analyseres som nye sosiale bevegelser, men de kan også forstås i kontinuitet med eldre naturvern, fredsarbeid, lokale interessekonflikter og organiserte petisjoner.'],
    disconfirmation: ['Anvendelsen svekkes dersom petisjonstall eller demonstrasjonssted brukes som eneste mål på bevegelsens bredde, kunnskapsgrunnlag, lokale forankring eller politiske resultat.']
  }
];

for (const file of [claimsPath, sourcesPath, evidencePath, theoryRegistryPath, profilePath, gapV2Path, profileFoundationJsonPath, theoryDocPath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${rel(file)}`);
}

const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const evidenceFile = readJson(evidencePath);
const theoryRegistry = readJson(theoryRegistryPath);
const profile = readJson(profilePath);

const assertNoId = (items, key, ids, label) => {
  const existing = new Set(A(items).map((item) => item[key]));
  const duplicates = ids.filter((id) => existing.has(id));
  if (duplicates.length) throw new Error(`${label} already exist: ${duplicates.join(', ')}`);
};
assertNoId(claimsFile.claims, 'claim_id', newClaims.map((item) => item.claim_id), 'Claims');
assertNoId(sourcesFile.sources, 'source_id', newSources.map((item) => item.source_id), 'Sources');
assertNoId(evidenceFile.evidence_links, 'evidence_id', evidenceSpecs.map((item) => item[0]), 'Evidence links');
assertNoId(theoryRegistry.entries, 'theory_id', theorySpecs.map((item) => item.theory_id), 'Theory entries');

const dossier = {
  schema_version: '1.0',
  dossier_id: 'history_movement_publics_evidence_v1',
  subject_id: 'historie',
  geography_id: G,
  status: 'canonical_source_provenance',
  scope: 'worker_women_temperance_protest_antifascism_solidarity_environmental_mobilization',
  accessed_at: '2026-07-27',
  sources: Object.fromEntries(newSources.map((source) => [source.source_id, {
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    source_type: source.source_type,
    supported_dimensions: source.quality.rationale,
    limitations: source.limitations,
  }]))
};
writeJson(dossierPath, dossier);

sourcesFile.sources.push(...newSources);
claimsFile.claims.push(...newClaims);
const claimById = new Map(claimsFile.claims.map((item) => [item.claim_id, item]));

const newEvidence = evidenceSpecs.map(([evidence_id, place_id, case_id, claim_id]) => {
  const claim = claimById.get(claim_id);
  if (!claim) throw new Error(`Unknown claim for evidence: ${claim_id}`);
  return {
    evidence_id,
    profile_id: PROFILE,
    geography_id: G,
    place_id,
    case_id,
    emne_ids: claim.emne_ids,
    claim_id,
    source_ids: claim.source_ids,
    support_type: claim.source_ids.length >= 2 ? 'corroborated' : 'direct_single_source',
    validation_status: 'validated_case',
    limitations_inherited: true,
    note: 'Movement publics V1-kobling materialisert fra avgrensede arkiv-, museum-, leksikon- og aktørkilder med eksplisitte kildebegrensninger.'
  };
});
evidenceFile.evidence_links.push(...newEvidence);

function validateProfileCase(caseId, placeId) {
  const item = A(profile.cases).find((candidate) => candidate.case_id === caseId);
  if (!item) throw new Error(`Missing profile case: ${caseId}`);
  item.status = 'pilot_validated';
  item.evidence_status = 'claim_source_linked';
  item.place_ids = [placeId];
  item.case_requirement_ids = CASE_REQS;
  item.validation = {
    status: 'validated_case',
    batch_id: 'history_movement_publics_evidence_v1',
    validated_at: '2026-07-27',
    minimum_evidence_links: 2,
    source_policy: 'canonical_registry_with_explicit_limitations'
  };
}
validateProfileCase('case_his_youngstorget', 'youngstorget');
validateProfileCase('case_his_blitz', 'blitzhuset');
validateProfileCase('case_his_norsk_folkemuseum', 'norsk_folkemuseum');

const verifiedCases = A(profile.cases).filter((item) => item.evidence_status === 'claim_source_linked');
profile.migration_summary.validated_cases = verifiedCases.length;
profile.migration_summary.unverified_case_candidates = profile.cases.length - verifiedCases.length;
profile.production_coverage.cases_total = profile.cases.length;
profile.production_coverage.verified_cases_total = verifiedCases.length;
profile.production_coverage.claims_total = claimsFile.claims.length;
profile.production_coverage.sources_total = sourcesFile.sources.length;
profile.production_coverage.evidence_links_total = evidenceFile.evidence_links.length;
profile.production_coverage.status = 'COMPLETE';
profile.production_coverage.interpretation = 'Profilen har et representativt minimumsgrunnlag og er utvidet med bevegelsesspesifikke claim–source–place-baner for Youngstorget, Blitz og Norsk Folkemuseum. Fullført profilstatus gjelder minimumsgrunnlaget; resterende casekandidater og universell teori-evidens er fortsatt eksplisitt produksjonskø.';

const evidenceByClaim = new Map(evidenceFile.evidence_links.map((item) => [item.claim_id, item]));
for (const spec of theorySpecs) {
  const selected = spec.claim_ids.map((id) => claimById.get(id));
  if (selected.some((item) => !item)) throw new Error(`Missing claim in theory ${spec.theory_id}`);
  theoryRegistry.entries.push({
    theory_id: spec.theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids: spec.claim_ids,
    source_ids: sorted(selected.flatMap((item) => A(item.source_ids))),
    case_ids: sorted(selected.flatMap((item) => A(item.scope?.case_ids))),
    place_ids: sorted(selected.flatMap((item) => A(item.scope?.place_ids))),
    emne_ids: sorted(selected.flatMap((item) => A(item.emne_ids))),
    evidence_link_ids: sorted(selected.map((item) => evidenceByClaim.get(item.claim_id)?.evidence_id).filter(Boolean)),
    evidence_dimensions: ['documented_application', 'limitation_test', 'alternative_interpretation', 'multi_case_comparison', 'new_claim_source_case_foundation'],
    rationale: spec.rationale,
    limitations: spec.limitations,
    alternative_interpretations: spec.alternatives,
    disconfirmation_conditions: spec.disconfirmation,
    scope_note: 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, aktørgrupper og kildetyper.'
  });
}
theoryRegistry.completion.qualifying_entries = theoryRegistry.entries.length;
theoryRegistry.completion.ratio = Math.round((theoryRegistry.entries.length / theoryRegistry.completion.total_theories) * 1000) / 1000;

writeJson(sourcesPath, sourcesFile);
writeJson(claimsPath, claimsFile);
writeJson(evidencePath, evidenceFile);
writeJson(profilePath, profile);
writeJson(theoryRegistryPath, theoryRegistry);

const currentFoundation = readJson(profileFoundationJsonPath);
currentFoundation.schema_version = '4.0';
currentFoundation.report_id = 'historie_profile_evidence_foundation_v4';
currentFoundation.migration = { ...currentFoundation.migration, validated_cases: verifiedCases.length, unverified_case_candidates: profile.cases.length - verifiedCases.length };
currentFoundation.inventory = {
  ...currentFoundation.inventory,
  claims: claimsFile.claims.length,
  sources: sourcesFile.sources.length,
  evidence_links: evidenceFile.evidence_links.length,
  verified_cases: verifiedCases.length,
};
currentFoundation.movement_publics_v1 = {
  phase_id: 'history_movement_publics_evidence_v1',
  produced_cases: 3,
  produced_claims: newClaims.length,
  produced_sources: newSources.length,
  produced_evidence_links: newEvidence.length,
  qualified_theories: theorySpecs.length,
  cases: [
    { case_id: 'case_his_youngstorget', place_id: 'youngstorget' },
    { case_id: 'case_his_blitz', place_id: 'blitzhuset' },
    { case_id: 'case_his_norsk_folkemuseum', place_id: 'norsk_folkemuseum' },
  ],
  theory_ids: theorySpecs.map((item) => item.theory_id),
};
writeJson(profileFoundationJsonPath, currentFoundation);
fs.writeFileSync(profileFoundationMdPath, `# Historie profil- og evidensgrunnlag V4\n\n- Status: **COMPLETE**\n- Fullføringsomfang: **minimum_representative_evidence_foundation**\n- Profilcaser: **${profile.cases.length}**\n- Validerte caser: **${verifiedCases.length}**\n- Claims: **${claimsFile.claims.length}**\n- Kilder: **${sourcesFile.sources.length}**\n- Evidenskoblinger: **${evidenceFile.evidence_links.length}**\n- Politisk kronologi V1: **2 cases / 13 claims**\n- Bevegelsesoffentligheter V1: **3 cases / ${newClaims.length} claims / ${theorySpecs.length} teoriobjekter**\n- Gjenværende universelt produksjonsgap: **theory_evidence_readiness**\n`);

let theoryDoc = fs.readFileSync(theoryDocPath, 'utf8');
theoryDoc = theoryDoc.replace(
  'De tre første batchene etablerte 32 objekter. Politisk kronologi evidens V1 tilfører tre objekter på grunnlag av 13 nye claims, 11 nye kildeposter og to nyvaliderte cases. Produksjonen står dermed på 35 av 230.',
  'De tre første batchene etablerte 32 objekter. Politisk kronologi evidens V1 tilfører tre objekter, og bevegelsesoffentligheter evidens V1 tilfører fire objekter på grunnlag av 13 nye claims, 11 nye kildeposter og tre nyvaliderte cases. Produksjonen står dermed på 39 av 230.'
);
theoryDoc = theoryDoc.replace(
  '- Politisk kronologi evidens V1: **3** nye kvalifiserende teoriobjekter, **13** nye claims og **2** nyvaliderte cases.\n- Totalt: **35 av 230** teoriobjekter (**15,2 %**).',
  '- Politisk kronologi evidens V1: **3** nye kvalifiserende teoriobjekter, **13** nye claims og **2** nyvaliderte cases.\n- Bevegelsesoffentligheter evidens V1: **4** nye kvalifiserende teoriobjekter, **13** nye claims og **3** nyvaliderte cases.\n- Totalt: **39 av 230** teoriobjekter (**17,0 %**).'
);
theoryDoc = theoryDoc.replace('history-theory-evidence-gap-inventory-v2.md', 'history-theory-evidence-gap-inventory-v3.md');
fs.writeFileSync(theoryDocPath, theoryDoc);

fs.writeFileSync(phaseDocPath, `# Historie — bevegelsesoffentligheter evidens V1\n\n## Scope\n\nFasen etablerer nye claim–source–case-baner for arbeider-, kvinne- og avholdsbevegelser, protestrepertoarer, antifascisme, antirasisme, internasjonal solidaritet, miljøbevegelse og fredsbevegelse.\n\n## Produksjon\n\n- Nye canonical claims: **${newClaims.length}**\n- Nye canonical kilder: **${newSources.length}**\n- Nyvaliderte cases: **Youngstorget**, **Blitz** og **Norsk Folkemuseum**\n- Kvalifiserte teoriobjekter: **${theorySpecs.length}**\n- Samlet teori-evidensstatus: **${theoryRegistry.entries.length} av 230**\n\n## Kontraktsgrense\n\n- Youngstorget og Folkets Hus dokumenterer arbeiderbevegelsens mobiliseringsinfrastruktur, men ikke hele arbeiderbevegelsen.\n- Enebakkveien 16 dokumenterer lokal bruk av samme forsamlingslokale av arbeider- og avholdsforeninger, ikke identisk medlemskap eller mål.\n- Blitz dokumenterer autonom, antifascistisk og antirasistisk infrastruktur, men representerer ikke all antirasisme.\n- Vietnam-, Alta-, Hardangervidda- og atomvåpencasene dokumenterer protestrepertoarer ved Stortinget og Eidsvolls plass; lokale og berørte aktørperspektiver må utvides senere.\n- Fasen er ikke universelt bevis for teoriobjektene.\n\n## Proveniens\n\nCanonical source dossier: \`${rel(dossierPath)}\`.\n`);

const gapV2 = readJson(gapV2Path);
const movementCategory = A(gapV2.categories).find((item) => item.category_id === 'movement_specific_publics');
if (!movementCategory) throw new Error('movement_specific_publics category missing from V2 gap inventory');
const gapV3 = {
  ...gapV2,
  schema_version: '3.0',
  report_id: 'history_theory_evidence_gap_inventory_v3',
  baseline: {
    total_theories: theoryRegistry.completion.total_theories,
    qualifying_after_movement_publics_v1: theoryRegistry.entries.length,
    remaining_theories: theoryRegistry.completion.total_theories - theoryRegistry.entries.length,
    ratio: theoryRegistry.completion.ratio,
    universal_status: theoryRegistry.completion.universal_status,
  },
  resolved_categories: [
    ...A(gapV2.resolved_categories),
    {
      ...movementCategory,
      status: 'resolved_v1_with_new_claim_source_case_foundation',
      resolution: {
        phase_id: 'history_movement_publics_evidence_v1',
        qualified_theory_ids: theorySpecs.map((item) => item.theory_id),
        new_claim_ids: newClaims.map((item) => item.claim_id),
        new_source_ids: newSources.map((item) => item.source_id),
        newly_verified_case_ids: ['case_his_youngstorget', 'case_his_blitz', 'case_his_norsk_folkemuseum'],
        note: 'Kategorien er løst på V1-nivå med separate arbeider-, kvinne-, avholds-, protest-, antifascisme-, solidaritets- og miljøbaner. Videre geografisk og berørt-aktørbredde er fortsatt nødvendig før universalisering.'
      }
    }
  ],
  categories: A(gapV2.categories).filter((item) => item.category_id !== 'movement_specific_publics'),
};
gapV3.source_fingerprints = Object.fromEntries([
  path.join(h, 'theory_objects_historie_canonical_v5_5.json'), theoryRegistryPath, claimsPath, sourcesPath, evidencePath, profilePath, dossierPath
].map((file) => [rel(file), sha256(file)]));
writeJson(gapV3JsonPath, gapV3);
fs.writeFileSync(gapV3MdPath, `# Historie — teori-evidens gap-inventar V3\n\nStatus: **ACTIVE_PRODUCTION_DEPENDENCY_MAP**\n\n- Teoriobjekter totalt: **230**\n- Kvalifiserende etter bevegelsesoffentligheter V1: **${theoryRegistry.entries.length}**\n- Gjenstående: **${230 - theoryRegistry.entries.length}**\n- Andel: **${(theoryRegistry.completion.ratio * 100).toFixed(1)} %**\n- Universell status: **INCOMPLETE**\n\n## Løst i V1\n\n- \`national_political_chronology\`\n- \`movement_specific_publics\`\n\n## Aktive produksjonsavhengigheter\n\n${gapV3.categories.map((item) => `- \`${item.category_id}\`: ${item.status}`).join('\n')}\n\nRapporten kvalifiserer ingen teori og kan ikke brukes til å omgå evidenskontrakten.\n`);

console.log(JSON.stringify({
  status: 'MATERIALIZED',
  new_claims: newClaims.length,
  new_sources: newSources.length,
  new_evidence_links: newEvidence.length,
  newly_verified_cases: 3,
  qualifying_theories: theoryRegistry.entries.length,
  ratio: theoryRegistry.completion.ratio,
  remaining_theories: theoryRegistry.completion.total_theories - theoryRegistry.entries.length,
  profile: { cases: profile.cases.length, verified_cases: verifiedCases.length, claims: claimsFile.claims.length, sources: sourcesFile.sources.length, evidence_links: evidenceFile.evidence_links.length }
}, null, 2));
