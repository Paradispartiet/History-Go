#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const H = path.join(ROOT, 'data/fag/historie');
const PROFILE_PATH = path.join(ROOT, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const DOSSIER_REL = 'data/fag/historie/source_dossiers/byhistory_urban_change_v1.json';
const DOSSIER_PATH = path.join(ROOT, DOSSIER_REL);
const SOURCES_PATH = path.join(H, 'sources_historie_canonical_v1.json');
const CLAIMS_PATH = path.join(H, 'claims_historie_canonical_v1.json');
const EVIDENCE_PATH = path.join(H, 'place_evidence_historie_v1.json');
const THEORY_PATH = path.join(H, 'theory_evidence_historie_canonical_v1.json');
const TEST_PATH = path.join(ROOT, 'tests/fagverk-historie.test.mjs');
const DOC_PATH = path.join(ROOT, 'docs/HISTORY_THEORY_EVIDENCE.md');
const TEMP_AUDIT_PATH = path.join(ROOT, 'tests/history-byhistory-audit.test.mjs');
const SELF_PATH = path.join(ROOT, 'tools/materialize-history-byhistory-v1.mjs');
const WORKFLOW_PATH = path.join(ROOT, '.github/workflows/fagverk-historie.yml');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const A = (value) => Array.isArray(value) ? value : [];
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const upsert = (items, key, value) => {
  const index = items.findIndex((item) => item[key] === value[key]);
  if (index === -1) items.push(value);
  else items[index] = value;
};

const byExpansionEmner = [
  'em_his_byhistorie_stedsendring_sentrum_periferi_og_byutvidelse',
  'em_his_byutvidelse_gentrifisering'
];
const gentrificationEmner = [
  'em_his_byhistorie_stedsendring_eiendom_boligregimer_og_tomtemarkeder',
  'em_his_byhistorie_stedsendring_gentrifisering_ombruk_og_bevaring',
  'em_his_byhistorie_stedsendring_klasse_segregasjon_og_offentlige_rom',
  'em_his_byutvidelse_gentrifisering'
];

const dossier = {
  schema_version: '1.0',
  dossier_id: 'history_byhistory_urban_change_evidence_v1',
  subject_id: 'historie',
  geography_id: 'geo_no_oslo_akershus',
  status: 'reviewed_source_dossier',
  accessed_at: '2026-07-30',
  scope: {
    qualified_theory_ids: [
      'theory_his_byutvidelse_grense_innlemmelse',
      'theory_his_byfornyelse_bolig_standard',
      'theory_his_gentrifisering_verdi_befolkning'
    ],
    case_ids: [
      'case_his_aker_brygge',
      'case_his_gamle_aker_kirke',
      'case_his_nydalen',
      'case_his_oslo_radhus'
    ],
    method_rule: 'Byutvidelse skilles fra umiddelbar fysisk urbanisering: administrative grenseendringer og arealhopp dokumenteres som jurisdiksjonsendring. Gentrifisering skilles fra ren ombruk: kildene må vise et eksplisitt sosialt eller eiendomsmarkedsmessig endringsmønster, og manglende individdata om fortrengning skal stå som begrensning.'
  },
  spatial_anchoring: {
    oslo_aker_boundary: {
      place_ids: ['gamle_aker_kirke', 'oslo_radhus'],
      status: 'existing_validated_institutional_and_historical_anchors',
      assessment: 'Gamle Aker kirke brukes som historisk Aker-anker og Oslo rådhus som kommunalt institusjonsanker. Ingen av punktene behandles som koordinat for hele den historiske kommunegrensen; claimene gjelder dokumentert jurisdiksjonsendring mellom Aker og Oslo.'
    },
    aker_brygge_nydalen: {
      place_ids: ['aker_brygge', 'nydalen'],
      status: 'existing_validated_redevelopment_anchors',
      assessment: 'Aker Brygge og Nydalen er allerede validerte områdeankre. De brukes til dokumentert omdisponering, eiendomsdrevet funksjonsskifte og bymessig intensivering, men ikke som direkte bevis på individuelle flyttebaner eller tvungen fortrengning.'
    }
  },
  source_anchoring: {
    new_source_ids: [
      'src_his_snl_aker_former_municipality',
      'src_his_oslo_statbank_population_boundaries',
      'src_his_snl_oslo_city_description_gentrification',
      'src_his_oslo_byplan_nydalen_transformation'
    ],
    assessment: 'SNL Aker og Oslo kommunes statistikkbank dokumenterer grenseendringer, sammenslåing, areal og demografisk skala. SNLs bybeskrivelse dokumenterer gentrifisering som sosialt endringsmønster og peker ut Aker Brygge/Nydalen som omdisponerings- og opprustingseksempler; Oslo kommunes Nydalen-historikk dokumenterer eiendomsmarked, boligavkastning, planlegging, T-bane og den postindustrielle funksjonsendringen.'
  },
  source_snapshots: [
    {
      source_id: 'src_his_snl_aker_former_municipality',
      title: 'Aker',
      publisher: 'Store norske leksikon',
      url: 'https://snl.no/Aker',
      supported_dimensions: ['municipal_boundary_changes', '1948_merger', 'area', 'population'],
      source_locations: [
        'Historikk-avsnittet om Aker herred fra 1837, grenseoverføringene i 1859, 1878, 1938, 1946 og 1947 og sammenslåingen med Oslo i 1948',
        'Avsnittet om herredets fire sognekommuner, 437 km² og 143 163 innbyggere ved sammenslåingen'
      ],
      limitations: [
        'Leksikonartikkelen sammenfatter kommunalhistorien og erstatter ikke primære grensevedtak, matrikkelkart eller saksdokumenter for hver overføring.',
        'Areal- og folketall beskriver administrativ skala ved sammenslåingen og viser ikke i seg selv hvor raskt bebyggelse, tjenester eller sosial integrasjon fulgte den nye bygrensen.'
      ]
    },
    {
      source_id: 'src_his_oslo_statbank_population_boundaries',
      title: 'BEF008: Folkemengden i Oslo/Kristiania, antall personer og årlig endring, 1801–2026',
      publisher: 'Oslo kommune',
      url: 'https://statistikkbanken.oslo.kommune.no/statbank/pxweb/no/db1/db1__Befolkning__Folkemengde/OK-BEF008.px/',
      supported_dimensions: ['historical_population_series', '1948_merger', 'municipal_area_change', 'boundary_methodology'],
      source_locations: [
        'Tabellbeskrivelsen om at Oslo ble slått sammen med Aker i 1948 og at arealet gikk fra 16 878,9 til 453 442 dekar',
        'Metode- og feilkildeavsnittene om skiftende grenser, eldre folketellinger og datakvalitet'
      ],
      limitations: [
        'Statistikkserien er konstruert på tvers av historiske grenseendringer og dokumenterer nivåer og metodikk, men ikke den politiske beslutningsprosessen bak sammenslåingen.',
        'Oslo kommune opplyser at kvaliteten på eldre tall varierer med kildene; tallene bør derfor ikke brukes som presise mikrodata for enkeltområder eller hushold.'
      ]
    },
    {
      source_id: 'src_his_snl_oslo_city_description_gentrification',
      title: 'Oslo – bybeskrivelse',
      publisher: 'Store norske leksikon',
      url: 'https://snl.no/Oslo_-_bybeskrivelse',
      supported_dimensions: ['gentrification', 'industrial_area_redevelopment', 'inner_city_population_change', 'socioeconomic_composition'],
      source_locations: [
        'Avsnittet Gentrifisering om omdisponering og opprusting av eldre industri-, samferdsels- og boligstrøk, med Aker Brygge og Nydalen som Oslo-eksempler',
        'Samme avsnitt om høyere sosiale lag i tidligere lavstatusområder og om befolkningsvekst og endret sosioøkonomisk sammensetning i indre Oslo fra 1990-årene'
      ],
      limitations: [
        'Leksikonframstillingen er en syntese av brede bymønstre og gir ikke et individ- eller husholdspanel som måler hvem som flyttet, hvem som ble værende eller hvem som eventuelt ble fortrengt.',
        'Aker Brygge og Nydalen nevnes som eksempler på omdisponering og opprusting; kilden må ikke leses som om graden av gentrifisering, prisvekst eller sosial utskifting er identisk i de to områdene.'
      ]
    },
    {
      source_id: 'src_his_oslo_byplan_nydalen_transformation',
      title: 'Nydalens omforming',
      publisher: 'Oslo kommune',
      url: 'https://magasin.oslo.kommune.no/byplan/nydalens-omforming',
      supported_dimensions: ['property_market_change', 'planning', 'housing_return_shift', 'transit_intensification', 'postindustrial_mixed_use'],
      source_locations: [
        'Avsnittene om eiendomshandelen fra 1992, Avantor, kommunedelplanen fra 1990 og senere reguleringsplaner',
        'Avsnittet Boliger kommer til Nydalen om at boliger ga større avkastning enn næringseiendom og at T-banen muliggjorde høyere utnytting',
        'Avsnittet Intens transformasjon om om lag 2 200 ansatte ved Christiania Spigerverk mot 20 000 arbeidsplasser og 4 000 boliger etter omformingen'
      ],
      limitations: [
        'Kommunens retrospektive byplanartikkel beskriver hovedgrep og aktører og gjengir delvis utviklerperspektiver; den er ikke en full saksmappe for hver regulerings- eller investeringsbeslutning.',
        'Opplysningene om arbeidsplasser, boliger og avkastningsskifte dokumenterer funksjonell og økonomisk omforming, men ikke boligprisserier, leienivå, husholdsinntekter eller direkte fortrengning av bestemte beboere.'
      ]
    }
  ],
  production_decisions: [
    'Byutvidelse/grense/innlemmelse får tre nye claims som skiller den flertrinnsvise grensehistorien fra selve 1948-sammenslåingen og fra demografisk/arealmessig skala.',
    'Gentrifisering/verdi/befolkning kvalifiseres bare fordi SNL dokumenterer et eksplisitt gentrifiserings- og sosialt endringsmønster og Nydalen-kilden dokumenterer eiendomsmarked og avkastningsdrevet funksjonsskifte; adaptiv ombruk alene ville ikke vært tilstrekkelig.',
    'Ingen claim hevder at administrative grenseendringer automatisk er fysisk urbanisering, eller at dokumentert ombygging automatisk beviser fortrengning.',
    'Regulering/plan/ekspropriasjon kvalifiseres på plan- og gjennomføringsdimensjonen; batchen dokumenterer ikke ekspropriasjonsvedtak, erstatningsnivå eller klagebehandling og sier dette eksplisitt i teoriens begrensninger.'
  ]
};

fs.mkdirSync(path.dirname(DOSSIER_PATH), { recursive: true });
writeJson(DOSSIER_PATH, dossier);

const sourcesFile = readJson(SOURCES_PATH);
const newSources = [
  {
    source_id: 'src_his_snl_aker_former_municipality',
    title: 'Aker',
    publisher: 'Store norske leksikon',
    source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Aker',
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: { from: 1837, to: 1948 },
    provenance: { repository_source: DOSSIER_REL, extracted_from: ['source_snapshots.src_his_snl_aker_former_municipality'], accessed_at: '2026-07-30' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-30' },
    limitations: dossier.source_snapshots[0].limitations,
    quality: { tier: 'B', rationale: 'Redigert referansekilde med eksplisitt kronologi, areal og folketall for Aker og sammenslåingen med Oslo.' }
  },
  {
    source_id: 'src_his_oslo_statbank_population_boundaries',
    title: 'BEF008: Folkemengden i Oslo/Kristiania, antall personer og årlig endring, 1801–2026',
    publisher: 'Oslo kommune',
    source_type: 'official_statistical_table',
    url: 'https://statistikkbanken.oslo.kommune.no/statbank/pxweb/no/db1/db1__Befolkning__Folkemengde/OK-BEF008.px/',
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: { from: 1801, to: 2026 },
    provenance: { repository_source: DOSSIER_REL, extracted_from: ['source_snapshots.src_his_oslo_statbank_population_boundaries'], accessed_at: '2026-07-30' },
    dating: { published_at: null, updated_at: '2026-04-17', accessed_at: '2026-07-30' },
    limitations: dossier.source_snapshots[1].limitations,
    quality: { tier: 'A', rationale: 'Offisiell kommunal statistikk med eksplisitt metodeforklaring for 1948-sammenslåingen, areal og historiske befolkningsserier.' }
  },
  {
    source_id: 'src_his_snl_oslo_city_description_gentrification',
    title: 'Oslo – bybeskrivelse',
    publisher: 'Store norske leksikon',
    source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Oslo_-_bybeskrivelse',
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: { from: 1990, to: null },
    provenance: { repository_source: DOSSIER_REL, extracted_from: ['source_snapshots.src_his_snl_oslo_city_description_gentrification'], accessed_at: '2026-07-30' },
    dating: { published_at: null, updated_at: null, accessed_at: '2026-07-30' },
    limitations: dossier.source_snapshots[2].limitations,
    quality: { tier: 'B', rationale: 'Redigert byhistorisk syntese som eksplisitt behandler gentrifisering, omdisponering og endret sosial sammensetning i Oslo.' }
  },
  {
    source_id: 'src_his_oslo_byplan_nydalen_transformation',
    title: 'Nydalens omforming',
    publisher: 'Oslo kommune',
    source_type: 'official_city_planning_history',
    url: 'https://magasin.oslo.kommune.no/byplan/nydalens-omforming',
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: { from: 1990, to: 2015 },
    provenance: { repository_source: DOSSIER_REL, extracted_from: ['source_snapshots.src_his_oslo_byplan_nydalen_transformation'], accessed_at: '2026-07-30' },
    dating: { published_at: '2015-05-06', updated_at: null, accessed_at: '2026-07-30' },
    limitations: dossier.source_snapshots[3].limitations,
    quality: { tier: 'A', rationale: 'Oslo kommunes dokumenterte planhistorie for eierskap, regulering, boligavkastning, kollektivutbygging og funksjonell transformasjon i Nydalen.' }
  }
];
for (const source of newSources) upsert(sourcesFile.sources, 'source_id', source);
writeJson(SOURCES_PATH, sourcesFile);

const claimsFile = readJson(CLAIMS_PATH);
const newClaims = [
  {
    claim_id: 'claim_his_aker_oslo_boundary_changes_1837_1947',
    statement: 'Aker herred omsluttet Oslo fra opprettelsen i 1837. Før sammenslåingen i 1948 ble grensene endret flere ganger, med store overføringer til Oslo i 1859 og 1878, mindre overføringer i 1938 og 1946 og en overføring til Oppegård i 1947.',
    claim_type: 'municipal_boundary_change_sequence',
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: ['gamle_aker_kirke', 'oslo_radhus'], case_ids: ['case_his_gamle_aker_kirke', 'case_his_oslo_radhus'], temporal: { from: 1837, to: 1947 } },
    emne_ids: byExpansionEmner,
    source_ids: ['src_his_snl_aker_former_municipality'],
    confidence: 'high',
    uncertainty: { level: 'medium', note: 'Kilden dokumenterer rekkefølgen av administrative grenseendringer, men batchen inneholder ikke matrikkelkart eller primærvedtak som rekonstruerer hver grense geometrisk. Stedsankrene representerer Aker- og Oslo-siden institusjonelt, ikke hele grenselinjen.' },
    alternative_interpretations: ['Grenseoverføringene kan leses som del av Oslos territorielle vekst, men administrativ innlemmelse er ikke det samme som at de overførte områdene allerede var fullt urbanisert eller sosialt integrert i samme tempo.']
  },
  {
    claim_id: 'claim_his_oslo_aker_merger_area_jump_1948',
    statement: 'Da Oslo og Aker ble slått sammen i 1948, økte Oslo kommunes areal fra 16 878,9 til 453 442 dekar, et dokumentert administrativt sprang i byens territorielle ramme.',
    claim_type: 'municipal_merger_area_expansion',
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: ['gamle_aker_kirke', 'oslo_radhus'], case_ids: ['case_his_gamle_aker_kirke', 'case_his_oslo_radhus'], temporal: { from: 1948, to: 1948 } },
    emne_ids: byExpansionEmner,
    source_ids: ['src_his_oslo_statbank_population_boundaries', 'src_his_snl_aker_former_municipality'],
    confidence: 'high',
    uncertainty: { level: 'low', note: 'Sammenslåingsåret og arealendringen er eksplisitt oppgitt, men arealhoppet må ikke tolkes som en tilsvarende umiddelbar økning i tettbebyggelse eller funksjonell bymessighet.' },
    alternative_interpretations: ['1948 kan analyseres som et juridisk-administrativt brudd samtidig som mange lokale landskap, bosettingsmønstre og sentrum–periferi-relasjoner fortsatte gradvis og ujevnt etter den nye kommunegrensen.']
  },
  {
    claim_id: 'claim_his_aker_population_area_scale_at_merger_1948',
    statement: 'Ved sammenslåingen i 1948 bestod Aker av Ullern, Vestre Aker, Østre Aker og Nordstrand, med 437 km² og 143 163 innbyggere; herredet var arealmessig om lag 27 ganger større enn Oslo før sammenslåingen.',
    claim_type: 'municipal_scale_population_at_merger',
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: ['gamle_aker_kirke', 'oslo_radhus'], case_ids: ['case_his_gamle_aker_kirke', 'case_his_oslo_radhus'], temporal: { from: 1948, to: 1948 } },
    emne_ids: byExpansionEmner,
    source_ids: ['src_his_snl_aker_former_municipality', 'src_his_oslo_statbank_population_boundaries'],
    confidence: 'high',
    uncertainty: { level: 'medium', note: 'Tallene beskriver administrativ areal- og befolkningsskala rundt sammenslåingen. De gir ikke alene befolkningstetthet, sosial sammensetning eller utbyggingsgrad i hver av de tidligere sognekommunene.' },
    alternative_interpretations: ['Den store arealforskjellen viser hvor omfattende den administrative innlemmelsen var, men kan også skjule betydelig intern variasjon mellom tettbygde forsteder, industriområder og mer rurale deler av Aker.']
  },
  {
    claim_id: 'claim_his_oslo_gentrification_redevelopment_social_change_pattern',
    statement: 'SNL beskriver omdisponering og opprusting av eldre industri-, samferdsels- og boligstrøk som et nyere bymønster og nevner Aker Brygge og Nydalen som Oslo-eksempler. I samme framstilling knyttes gentrifisering til innflytting av høyere sosiale lag i tidligere lavstatusområder og til befolkningsvekst og endret sosioøkonomisk sammensetning i indre Oslo fra 1990-årene.',
    claim_type: 'gentrification_redevelopment_social_change_pattern',
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: ['aker_brygge', 'nydalen'], case_ids: ['case_his_aker_brygge', 'case_his_nydalen'], temporal: { from: 1990, to: null } },
    emne_ids: gentrificationEmner,
    source_ids: ['src_his_snl_oslo_city_description_gentrification'],
    confidence: 'medium',
    uncertainty: { level: 'high', note: 'Kilden dokumenterer et byomfattende sosialt endringsmønster og bruker Aker Brygge/Nydalen som omdisponerings- og opprustingseksempler, men gir ikke et residentpanel som viser at den samme graden av sosial utskifting eller fortrengning fant sted i hvert område.' },
    alternative_interpretations: ['Omdisponering og opprusting kan gi gentrifiseringsdynamikk, men kan også produsere funksjonell fortetting eller nye boliger uten at alle mekanismer for klasseskifte og fortrengning er til stede i samme styrke.']
  },
  {
    claim_id: 'claim_his_nydalen_property_market_housing_returns_shift',
    statement: 'I Nydalen ble nye boligprosjekter satt i gang da eiendomsmarkedet endret seg og boliger ga større avkastning enn næringseiendommer. Samtidig gjorde T-baneutbyggingen det mulig å planlegge høyere utnytting fordi området kunne behandles som kollektivknutepunkt.',
    claim_type: 'property_market_use_shift_and_transit_intensification',
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: ['nydalen'], case_ids: ['case_his_nydalen'], temporal: { from: 1990, to: 2015 } },
    emne_ids: gentrificationEmner,
    source_ids: ['src_his_oslo_byplan_nydalen_transformation'],
    confidence: 'high',
    uncertainty: { level: 'medium', note: 'Kommunens historikk dokumenterer avkastnings- og planlogikken, men inneholder ikke en komplett serie for tomtepriser, boligpriser, avkastningskrav eller husholdsinntekter gjennom hele perioden.' },
    alternative_interpretations: ['Skiftet mot bolig kan tolkes som markedsdrevet verdioptimalisering, men også som respons på kollektivinvestering, planrammer og etterspørsel etter en mer blandet bydel; én mekanisme bør ikke isoleres som eneste årsak.']
  },
  {
    claim_id: 'claim_his_nydalen_postindustrial_mixed_use_scale',
    statement: 'Nydalen gikk fra et tungt industrimiljø der Christiania Spigerverk på det meste hadde rundt 2 200 ansatte til et område som etter omformingen rommet omtrent 20 000 arbeidsplasser og 4 000 boliger, et stort funksjonelt og bebyggelsesmessig skifte over om lag tre tiår.',
    claim_type: 'postindustrial_mixed_use_scale_change',
    scope: { geography_ids: ['geo_no_oslo_akershus'], place_ids: ['nydalen'], case_ids: ['case_his_nydalen'], temporal: { from: 1990, to: 2015 } },
    emne_ids: gentrificationEmner,
    source_ids: ['src_his_oslo_byplan_nydalen_transformation'],
    confidence: 'high',
    uncertainty: { level: 'medium', note: 'Tallene viser skalaen i funksjonell transformasjon, men sammenligner ulike størrelser – historisk industrisysselsetting mot senere samlede arbeidsplasser og boliger – og er ikke en direkte serie for befolkning eller sosial klasse.' },
    alternative_interpretations: ['Veksten kan leses som postindustriell bymessig intensivering; uten mer finmaskede befolknings-, pris- og flyttedata kan den ikke alene brukes som mål på gentrifisering eller fortrengning.']
  }
];
for (const claim of newClaims) upsert(claimsFile.claims, 'claim_id', claim);
writeJson(CLAIMS_PATH, claimsFile);

const evidenceFile = readJson(EVIDENCE_PATH);
const evidence = [
  ['evidence_his_byhistory_aker_boundary_gamle_aker_01', 'gamle_aker_kirke', 'case_his_gamle_aker_kirke', 'claim_his_aker_oslo_boundary_changes_1837_1947', ['src_his_snl_aker_former_municipality'], byExpansionEmner, 'historical_administrative_boundary_sequence', 'Gamle Aker kirke er historisk Aker-anker, ikke et punkt som representerer hele herredsgrensen.'],
  ['evidence_his_byhistory_aker_boundary_radhus_01', 'oslo_radhus', 'case_his_oslo_radhus', 'claim_his_aker_oslo_boundary_changes_1837_1947', ['src_his_snl_aker_former_municipality'], byExpansionEmner, 'historical_administrative_boundary_sequence', 'Oslo rådhus brukes som kommunalt institusjonsanker; dagens bygg var ikke oppført ved de tidligste grenseendringene.'],
  ['evidence_his_byhistory_aker_merger_area_gamle_aker_01', 'gamle_aker_kirke', 'case_his_gamle_aker_kirke', 'claim_his_oslo_aker_merger_area_jump_1948', ['src_his_oslo_statbank_population_boundaries', 'src_his_snl_aker_former_municipality'], byExpansionEmner, 'corroborated_municipal_merger_scale', 'Stedet forankrer Aker-siden historisk; arealtallet gjelder hele kommunen og ikke kirkestedets nærområde.'],
  ['evidence_his_byhistory_aker_merger_area_radhus_01', 'oslo_radhus', 'case_his_oslo_radhus', 'claim_his_oslo_aker_merger_area_jump_1948', ['src_his_oslo_statbank_population_boundaries', 'src_his_snl_aker_former_municipality'], byExpansionEmner, 'corroborated_municipal_merger_scale', 'Rådhuset forankrer den sammenslåtte kommunale institusjonen; arealhoppet er administrativt og ikke et mål på umiddelbar urban bebyggelse.'],
  ['evidence_his_byhistory_aker_merger_population_gamle_aker_01', 'gamle_aker_kirke', 'case_his_gamle_aker_kirke', 'claim_his_aker_population_area_scale_at_merger_1948', ['src_his_snl_aker_former_municipality', 'src_his_oslo_statbank_population_boundaries'], byExpansionEmner, 'corroborated_population_area_scale', 'Gamle Aker er et navne- og historieanker; folke- og arealtallene gjelder hele Aker ved sammenslåingen.'],
  ['evidence_his_byhistory_aker_merger_population_radhus_01', 'oslo_radhus', 'case_his_oslo_radhus', 'claim_his_aker_population_area_scale_at_merger_1948', ['src_his_snl_aker_former_municipality', 'src_his_oslo_statbank_population_boundaries'], byExpansionEmner, 'corroborated_population_area_scale', 'Rådhuset brukes som Oslo-anker; evidensen dokumenterer kommuneskala, ikke sosial integrasjon i hvert tidligere Aker-område.'],
  ['evidence_his_byhistory_gentrification_aker_brygge_01', 'aker_brygge', 'case_his_aker_brygge', 'claim_his_oslo_gentrification_redevelopment_social_change_pattern', ['src_his_snl_oslo_city_description_gentrification'], gentrificationEmner, 'urban_redevelopment_gentrification_context', 'Aker Brygge er eksplisitt omdisponerings-/opprustingseksempel; lenken gjør ikke et selvstendig krav om individuell fortrengning.'],
  ['evidence_his_byhistory_gentrification_nydalen_01', 'nydalen', 'case_his_nydalen', 'claim_his_oslo_gentrification_redevelopment_social_change_pattern', ['src_his_snl_oslo_city_description_gentrification'], gentrificationEmner, 'urban_redevelopment_gentrification_context', 'Nydalen er eksplisitt omdisponerings-/opprustingseksempel; sosial utskifting må skilles fra funksjonell transformasjon.'],
  ['evidence_his_byhistory_nydalen_market_shift_01', 'nydalen', 'case_his_nydalen', 'claim_his_nydalen_property_market_housing_returns_shift', ['src_his_oslo_byplan_nydalen_transformation'], gentrificationEmner, 'official_planning_property_market_history', 'Koblingen dokumenterer avkastnings- og planlogikk i Nydalen, ikke komplett prisserie eller husholdsfortrengning.'],
  ['evidence_his_byhistory_nydalen_scale_change_01', 'nydalen', 'case_his_nydalen', 'claim_his_nydalen_postindustrial_mixed_use_scale', ['src_his_oslo_byplan_nydalen_transformation'], gentrificationEmner, 'official_postindustrial_scale_history', 'Arbeidsplass- og boligtallene viser funksjonell intensivering, men er ikke direkte befolknings- eller klasseindikatorer.']
].map(([evidence_id, place_id, case_id, claim_id, source_ids, emne_ids, support_type, note]) => ({
  evidence_id,
  profile_id: 'profile_historie_no_oslo_akershus',
  geography_id: 'geo_no_oslo_akershus',
  place_id,
  case_id,
  emne_ids,
  claim_id,
  source_ids,
  support_type,
  validation_status: 'validated_case',
  limitations_inherited: true,
  note
}));
for (const link of evidence) upsert(evidenceFile.evidence_links, 'evidence_id', link);
writeJson(EVIDENCE_PATH, evidenceFile);

const theoryFile = readJson(THEORY_PATH);
const claimById = new Map(claimsFile.claims.map((claim) => [claim.claim_id, claim]));
const evidenceByClaim = new Map();
for (const link of evidenceFile.evidence_links) {
  const list = evidenceByClaim.get(link.claim_id) || [];
  list.push(link);
  evidenceByClaim.set(link.claim_id, list);
}

function makeEntry(theory_id, claim_ids, rationale, limitations, alternative, disconfirmation, scopeNote) {
  const claims = claim_ids.map((id) => {
    const claim = claimById.get(id);
    if (!claim) throw new Error(`${theory_id}: missing claim ${id}`);
    return claim;
  });
  return {
    theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids,
    source_ids: sorted(claims.flatMap((claim) => A(claim.source_ids))),
    case_ids: sorted(claims.flatMap((claim) => A(claim.scope?.case_ids))),
    place_ids: sorted(claims.flatMap((claim) => A(claim.scope?.place_ids))),
    emne_ids: sorted(claims.flatMap((claim) => A(claim.emne_ids))),
    evidence_link_ids: sorted(claims.flatMap((claim) => A(evidenceByClaim.get(claim.claim_id)).map((link) => link.evidence_id))),
    evidence_dimensions: ['documented_application', 'limitation_test', 'alternative_interpretation', 'multi_case_comparison'],
    rationale,
    limitations,
    alternative_interpretations: [alternative],
    disconfirmation_conditions: [disconfirmation],
    scope_note: scopeNote
  };
}

const entries = [
  makeEntry(
    'theory_his_byutvidelse_grense_innlemmelse',
    ['claim_his_aker_oslo_boundary_changes_1837_1947', 'claim_his_oslo_aker_merger_area_jump_1948', 'claim_his_aker_population_area_scale_at_merger_1948'],
    'Akers flertrinns grensehistorie og sammenslåingen med Oslo i 1948 dokumenterer hvordan en bys territorielle ramme kan endres både gradvis og gjennom et stort administrativt brudd. Areal- og folketallene gjør det mulig å skille jurisdiksjonsutvidelse fra senere fysisk urbanisering og å analysere sentrum–periferi som historisk foranderlig.',
    ['Stedsankrene Gamle Aker kirke og Oslo rådhus representerer historiske og institusjonelle sider av relasjonen; de rekonstruerer ikke den skiftende kommunegrensen geometrisk.', 'Areal- og folketall dokumenterer administrativ skala, men ikke hvor raskt bebyggelse, transport, tjenester eller sosial integrasjon fulgte hver grenseendring.'],
    'Sammenslåingen kan tolkes som et avgjørende administrativt brudd, mens den faktiske bymessiggjøringen samtidig kan forstås som en lengre prosess som både foregikk før og fortsatte etter 1948.',
    'Anvendelsen svekkes dersom primære grensevedtak eller historiske kart viser en annen kronologi eller arealramme, eller dersom administrativ innlemmelse brukes som direkte mål på fysisk urbanisering uten separat dokumentasjon.',
    'Dette er et fler-case evidensgrunnlag for Oslo–Aker og er ikke universelt bevis for hvordan byutvidelse, kommunegrenser eller innlemmelser foregår i andre byer, perioder eller statsrettslige systemer.'
  ),
  makeEntry(
    'theory_his_gatenett_tomtestruktur_infrastruktur',
    ['claim_his_bispelokket_demolished_after_bjorvika_tunnel', 'claim_his_middelalder_oslo_buildings_wells_cultivation_daily_life', 'claim_his_middelalder_oslo_stratigraphy_links_structures_objects', 'claim_his_middelalder_oslo_streets_infrastructure_permanent_urban_settlement'],
    'Middelalderbyens gateløp, eiendomsgrenser, brønner og vannrør viser hvordan urban struktur kan leses gjennom arkeologisk kontekst, mens Bispelokkets avvikling etter Bjørvikatunnelen viser moderne infrastrukturskifte som omtegner trafikk, gatenett og offentlig rom. Sammen gir casene et langt tidsspenn for å analysere fysisk bystruktur som både spor og aktivt inngrep.',
    ['Middelaldermaterialet rekonstruerer dokumenterte strukturer lokalt og kan ikke uten videre oversettes til et komplett kart over hele byens gatenett eller eiendomsregime.', 'Bispelokket dokumenterer én stor transportomlegging; batchen inneholder ikke en full serie for trafikkvolum, tomteverdier eller alle reguleringsgrep rundt Bjørvika.'],
    'Gater og teknisk infrastruktur kan leses som varige strukturer som organiserer byen, men også som lag som stadig brytes, flyttes og omtolkes når transportteknologi og planidealer endres.',
    'Anvendelsen svekkes dersom arkeologiske kontekster ikke støtter de oppgitte strukturene, eller dersom Bispelokkets riving ikke kan knyttes dokumentarisk til tunnel- og gatenettsomleggingen.',
    'Dette er et fler-case evidensgrunnlag fra middelalderbyen og Bjørvika i Oslo og er ikke universelt bevis for gatenett, tomtestruktur eller infrastruktur på tvers av alle byer og perioder.'
  ),
  makeEntry(
    'theory_his_regulering_plan_ekspropriasjon',
    ['claim_his_oslo_radhus_pipervika_transformation', 'claim_his_oslo_radhus_architects_arneberg_poulsson', 'claim_his_bispelokket_completed_1967_traffic_machine', 'claim_his_bispelokket_demolished_after_bjorvika_tunnel'],
    'Rådhusreguleringen og arkitektkonkurransen viser planlagt byomforming over flere tiår, mens Bispelokkets bygging og senere riving viser hvordan infrastrukturbeslutninger materialiseres og senere erstattes av nye planprioriteringer. Casene dokumenterer forholdet mellom plan, institusjonell beslutning og fysisk gjennomføring uten å forutsette at planens intensjon alene forklarer utfallet.',
    ['Batchen dokumenterer planlegging, arkitektvalg, riving og fysisk gjennomføring, men inneholder ikke de konkrete ekspropriasjonsvedtakene, erstatningsnivåene, klagesakene eller full eiendomshistorikk.', 'Rådhuset og Bispelokket er store offentlige prosjekter og kan ikke alene representere hverdagsregulering, private reguleringsforslag eller planpraksis i andre deler av byen.'],
    'Prosjektene kan forstås som målrettet offentlig modernisering, men også som langvarige forhandlings- og saneringsprosesser der tidligere bymiljøer og infrastrukturer ble gjort disponible for nye formål.',
    'Anvendelsen svekkes dersom plan- og prosjektarkiver viser at de dokumenterte fysiske endringene ikke fulgte de oppgitte plan- og beslutningsforløpene; ekspropriasjonsdimensjonen må fortsatt holdes åpen uten egne primærkilder.',
    'Dette er et fler-case evidensgrunnlag for plan og gjennomføring i Oslo og er ikke universelt bevis for regulering, planlegging eller ekspropriasjon, og det kvalifiserer ikke ekspropriasjonsprosedyren som dokumentert i alle delene av teorietiketten.'
  ),
  makeEntry(
    'theory_his_byfornyelse_bolig_standard',
    ['claim_his_oslo_radhus_pipervika_transformation', 'claim_his_aker_brygge_adaptive_reuse_industrial_heritage_1982_1986', 'claim_his_nydalen_property_market_housing_returns_shift', 'claim_his_nydalen_postindustrial_mixed_use_scale'],
    'Pipervikas sanering, Aker Brygges ombruk og Nydalens skifte mot boliger og høyere arealutnytting viser tre ulike baner for byfornyelse: erstatning av eldre bebyggelse, adaptiv transformasjon og markeds-/kollektivdrevet fortetting. Nydalens 4 000 boliger gir en målbar boligdimensjon som kan sammenholdes med de øvrige fysiske omformingene.',
    ['Kildene dokumenterer nye boliger, ombygging, riving og arealbruk, men måler ikke systematisk innvendig boligstandard, sanitærforhold, trangboddhet, husleie eller vedlikeholdskvalitet før og etter fornyelsen.', 'De tre områdene har ulike eiendoms- og planhistorier; byfornyelse må derfor ikke reduseres til én lineær moderniseringsmodell eller antas å ha samme fordelingsvirkning.'],
    'Byfornyelsen kan forstås som kvalitets- og funksjonsforbedring, men også som selektiv kapitalisering av sentrale arealer der materielle forbedringer ikke automatisk betyr bedre tilgang eller boforhold for de samme beboerne.',
    'Anvendelsen svekkes dersom bolig- og bygningsdata viser at omformingen ikke ga den påståtte funksjonsendringen; påstander om forbedret boligstandard må avvises dersom de ikke støttes av egne kvalitetsmål.',
    'Dette er et fler-case evidensgrunnlag for byfornyelse og boligproduksjon i Oslo og er ikke universelt bevis for boligstandard, levekår eller fordelingsvirkninger på tvers av byer, perioder og befolkningsgrupper.'
  ),
  makeEntry(
    'theory_his_naring_funksjonsskifte',
    ['claim_his_aker_brygge_adaptive_reuse_industrial_heritage_1982_1986', 'claim_his_gamle_deichman_main_library_1933_2019', 'claim_his_gamle_deichman_planned_fotohuset_reuse', 'claim_his_akerselva_environmental_reuse_from_1986'],
    'Aker Brygge viser overgang fra verftsproduksjon til kontor, handel, restaurant og bolig, gamle Deichman viser et institusjonsbygg som går fra hovedbibliotek til planlagt fotohus, og Akerselva viser industrielt landskap som får nye miljø- og rekreasjonsfunksjoner. Sammen dokumenterer casene at funksjonsskifte kan gjelde både næring, institusjon og offentlig bruk.',
    ['Claimene dokumenterer hovedfunksjoner og ombruk, men ikke komplette næringsregistre, omsetning, sysselsetting eller alle parallelle virksomheter i områdene.', 'Planlagt framtidig bruk av gamle Deichman må skilles fra gjennomført bruk; endelig funksjon kan endres før eller etter planlagt åpning.'],
    'Funksjonsskifte kan leses som økonomisk omstilling og adaptiv gjenbruk, men også som tap av tidligere arbeids- og hverdagsfunksjoner selv når deler av den materielle strukturen bevares.',
    'Anvendelsen svekkes dersom virksomhets- eller bruksdata viser at de oppgitte funksjonene ikke faktisk erstattet eller supplerte de tidligere funksjonene i de aktuelle periodene.',
    'Dette er et fler-case evidensgrunnlag fra Oslo og er ikke universelt bevis for nærings- eller funksjonsskifte på tvers av sektorer, eiendomsregimer, perioder eller geografier.'
  ),
  makeEntry(
    'theory_his_industrihavn_transformasjon',
    ['claim_his_aker_brygge_shipyard_contraction_closure_1978_1982', 'claim_his_aker_brygge_adaptive_reuse_industrial_heritage_1982_1986', 'claim_his_bjorvika_medieval_harbor_piers_shipwrecks', 'claim_his_bispelokket_demolished_after_bjorvika_tunnel'],
    'Aker Brygge dokumenterer en direkte industri- og havnefronttransformasjon fra verftsnedtrapping og nedleggelse til ny bydel med ombrukte industrispor. Bjørvikas havnestrukturer og den senere tunnel-/Bispelokket-omleggingen gir et separat waterfront-case der havne- og transportfunksjoner kan leses som historiske lag og moderniseres gjennom ny infrastruktur og offentlig byrom.',
    ['Bjørvika-claimet om brygger og skipsfunn gjelder middelalderhavn og er et historisk havnelag, ikke dokumentasjon av moderne industriarbeid eller samme transformasjonsmekanisme som ved Aker Brygge.', 'Batchen har ikke komplette serier for havnegods, arbeidsstyrke, eiendomsverdi eller miljøopprydding og kan derfor ikke kvantifisere hele overgangen fra produksjonshavn til postindustriell byfront.'],
    'Waterfrontendring kan leses som overgang fra produksjon og transport til bolig, service og offentlig rom, men de eldre havnelagene minner samtidig om at havnefunksjon og byutvikling har skiftet form flere ganger og ikke følger én lineær postindustriell modell.',
    'Anvendelsen svekkes dersom verftsdata motsier nedleggelsesforløpet, eller dersom Bjørvikas arkeologiske og infrastrukturelle lag ikke kan knyttes til de dokumenterte havne- og transportfunksjonene.',
    'Dette er et fler-case evidensgrunnlag fra Oslos sjøfront og er ikke universelt bevis for industrihavntransformasjon i andre havner, sektorer eller perioder.'
  ),
  makeEntry(
    'theory_his_gentrifisering_verdi_befolkning',
    ['claim_his_oslo_gentrification_redevelopment_social_change_pattern', 'claim_his_nydalen_property_market_housing_returns_shift', 'claim_his_nydalen_postindustrial_mixed_use_scale', 'claim_his_aker_brygge_adaptive_reuse_industrial_heritage_1982_1986'],
    'SNLs eksplisitte gentrifiseringsramme kobler opprusting og omdisponering til sosialt endringsmønster i Oslo, mens Nydalen dokumenterer at bolig ble mer lønnsomt enn næring og at kollektivutbygging muliggjorde høyere utnytting. Sammen med Aker Brygges overgang fra verft til bolig, kontor, handel og restaurant gir dette et fler-case grunnlag for å analysere forholdet mellom verdi, funksjon og befolkningsendring uten å anta automatisk fortrengning.',
    ['Kildene inneholder ikke individ- eller husholdspaneler som kan identifisere hvilke beboere som flyttet frivillig, ble presset ut eller fikk gevinst av verdiøkningen; direkte fortrengning er derfor ikke bevist.', 'Nydalen-tallene måler arbeidsplasser og boliger, mens SNL beskriver bredere indre-by-mønstre; de kan ikke uten videre slås sammen til én presis lokal sosial klasse- eller prisserie.'],
    'Omformingen kan tolkes som gentrifiseringsdrevet verdi- og klasseskifte, men deler av utviklingen kan også forklares av ny boligproduksjon, kollektivtilgang, funksjonsblanding og generell byvekst uten samme grad av fortrengning.',
    'Anvendelsen svekkes dersom pris-, inntekts-, flytte- eller befolkningsdata viser stabil eller motsatt sosial utvikling i de aktuelle områdene, eller dersom omdisponering feilaktig brukes som synonym for gentrifisering uten sosial evidens.',
    'Dette er et fler-case evidensgrunnlag fra Aker Brygge og Nydalen i Oslo og er ikke universelt bevis for gentrifisering, verdiendring, befolkningsskifte eller fortrengning på tvers av byer og perioder.'
  )
];
for (const entry of entries) upsert(theoryFile.entries, 'theory_id', entry);
theoryFile.completion.qualifying_entries = theoryFile.entries.length;
theoryFile.completion.ratio = Math.round((theoryFile.entries.length / theoryFile.completion.total_theories) * 1000) / 1000;
theoryFile.completion.universal_status = theoryFile.entries.length === theoryFile.completion.total_theories ? 'COMPLETE' : 'INCOMPLETE';
writeJson(THEORY_PATH, theoryFile);

const profile = readJson(PROFILE_PATH);
const profileEvidence = evidenceFile.evidence_links.filter((link) => link.profile_id === profile.profile_id);
const verifiedCases = A(profile.cases).filter((item) => item.evidence_status === 'claim_source_linked');
profile.production_coverage.cases_total = A(profile.cases).length;
profile.production_coverage.verified_cases_total = verifiedCases.length;
profile.production_coverage.claims_total = new Set(profileEvidence.map((link) => link.claim_id)).size;
profile.production_coverage.sources_total = new Set(profileEvidence.flatMap((link) => A(link.source_ids))).size;
profile.production_coverage.evidence_links_total = profileEvidence.length;
writeJson(PROFILE_PATH, profile);

let testText = fs.readFileSync(TEST_PATH, 'utf8');
testText = testText.replace("assert.equal(report.universalCoverage.theoryEvidenceQualifying, 87);", "assert.equal(report.universalCoverage.theoryEvidenceQualifying, 94);");
fs.writeFileSync(TEST_PATH, testText);

let doc = fs.readFileSync(DOC_PATH, 'utf8');
doc = doc.replace('Produksjonen står på 87 av 230 etter at offentlighet, mobilisering og bevegelser er fullført til 10/10 ved ren claim-gjenbruk.', 'Produksjonen står på 94 av 230 etter at Byhistorie og stedsendring er fullført til 10/10 med en kombinasjon av eksisterende validerte claims og målrettet ny evidens for bygrense og gentrifisering.');
doc = doc.replace('- Offentlighet, mobilisering og bevegelser V1: **6** nye kvalifiserende teoriobjekter ved ren claim-gjenbruk; **0** nye claims, kilder, cases eller place-evidence-lenker.\n', '- Offentlighet, mobilisering og bevegelser V1: **6** nye kvalifiserende teoriobjekter ved ren claim-gjenbruk; **0** nye claims, kilder, cases eller place-evidence-lenker.\n- Byhistorie og stedsendring V1: **7** nye kvalifiserende teoriobjekter, **6** nye claims, **4** nye kilder, **10** nye place-evidence-lenker og **0** nye cases; grense/innlemmelse og gentrifisering får målrettet ny evidens, mens de øvrige fem objektene kombinerer gjenbruk med de nye Nydalen-claimene der det styrker anvendelsen.\n');
doc = doc.replace('- Totalt: **87 av 230** teoriobjekter (**37.8 %**).', '- Totalt: **94 av 230** teoriobjekter (**40.9 %**).');
doc = doc.replace('- Gjenstående teoriobjekter: **143**.', '- Gjenstående teoriobjekter: **136**.');
fs.writeFileSync(DOC_PATH, doc);

const cleanWorkflow = `name: Fagverk Historie\n\non:\n  pull_request:\n    paths:\n      - 'fagverk.html'\n      - 'fagverk-forside.html'\n      - 'data/categories/category_contract.json'\n      - 'data/fag/fag_manifest.json'\n      - 'data/fag/historie/**'\n      - 'data/fag/profiles/**'\n      - 'data/badges/historie.json'\n      - 'data/fagverk/**'\n      - 'js/fagverk-subject-core.js'\n      - 'js/fagverk-subject-model.js'\n      - 'js/fagverk.js'\n      - 'scripts/audit-fagverk-subject-inventory.mjs'\n      - 'scripts/audit-fagverk-general-engine.mjs'\n      - 'scripts/audit-fagverk-historie.mjs'\n      - 'tools/audit-historie-universal-coverage.mjs'\n      - 'tests/fagverk-subject-inventory.test.mjs'\n      - 'tests/fagverk-general-engine.test.mjs'\n      - 'tests/fagverk-historie.test.mjs'\n      - 'reports/fagverk/**'\n      - 'reports/historie-universal-coverage/**'\n      - '.github/workflows/fagverk-historie.yml'\n  workflow_dispatch:\n\npermissions:\n  contents: read\n\njobs:\n  validate:\n    name: Validate materialized Historie subject\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n      - name: Validate syntax and deterministic reports\n        run: |\n          node --check scripts/audit-fagverk-historie.mjs\n          node scripts/audit-fagverk-subject-inventory.mjs\n          node scripts/audit-fagverk-general-engine.mjs\n          node scripts/audit-fagverk-historie.mjs\n          node tools/audit-historie-universal-coverage.mjs\n      - name: Validate Fagverk and Historie contracts\n        run: |\n          node --test tests/fagverk-subject-inventory.test.mjs\n          node --test tests/fagverk-general-engine.test.mjs\n          node --test tests/fagverk-historie.test.mjs\n`;
fs.writeFileSync(WORKFLOW_PATH, cleanWorkflow);
if (fs.existsSync(TEMP_AUDIT_PATH)) fs.unlinkSync(TEMP_AUDIT_PATH);

console.log(JSON.stringify({
  status: 'MATERIALIZED',
  theory_entries: theoryFile.entries.length,
  new_sources: newSources.length,
  new_claims: newClaims.length,
  new_evidence_links: evidence.length,
  oslo_profile_counts: profile.production_coverage
}, null, 2));

process.on('exit', () => {
  try { if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH); } catch {}
});
