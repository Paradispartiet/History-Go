#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => { fs.mkdirSync(p.split('/').slice(0,-1).join('/'), {recursive:true}); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const A = (v) => Array.isArray(v) ? v : [];
const uniq = (v) => [...new Set(v)];
const sorted = (v) => uniq(v).sort((a,b)=>String(a).localeCompare(String(b),'nb'));
const addUnique = (arr, item, key) => { if (arr.some(x => x[key] === item[key])) throw new Error('Duplicate ' + key + ': ' + item[key]); arr.push(item); };
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const date = '2026-07-30';

const paths = {
  claims: 'data/fag/historie/claims_historie_canonical_v1.json',
  sources: 'data/fag/historie/sources_historie_canonical_v1.json',
  evidence: 'data/fag/historie/place_evidence_historie_v1.json',
  theories: 'data/fag/historie/theory_evidence_historie_canonical_v1.json',
  profile: 'data/fag/profiles/historie/oslo_akershus/profile.json',
  freeze: 'data/fag/historie/historie_v5_8_freeze_manifest.json',
  dossier: 'data/fag/historie/source_dossiers/welfare_rights_everyday_life_v2.json',
  docs: 'docs/HISTORY_THEORY_EVIDENCE.md',
  test: 'tests/fagverk-historie.test.mjs'
};

const claimsFile = read(paths.claims);
const sourcesFile = read(paths.sources);
const evidenceFile = read(paths.evidence);
const theoryFile = read(paths.theories);
const profile = read(paths.profile);

if (theoryFile.completion?.qualifying_entries !== 125 || A(theoryFile.entries).length !== 125) {
  throw new Error('Expected V1 baseline at 125 qualifying entries.');
}

const newSources = [
  {
    source_id: 'src_his_snl_folketrygden',
    title: 'folketrygden',
    publisher: 'Store norske leksikon',
    source_type: 'scholarly_reference_social_policy_history',
    url: 'https://snl.no/folketrygden',
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: {from: 1894, to: 1971},
    provenance: {
      repository_source: paths.dossier,
      extracted_from: ['sources.src_his_snl_folketrygden', 'claims.social_insurance_sequence'],
      accessed_at: date
    },
    dating: {published_at: null, updated_at: null, accessed_at: date},
    limitations: [
      'Artikkelen er en fagredigert nasjonal syntese og erstatter ikke de enkelte lovtekstene, stortingsforhandlingene, trygdekassenes medlemsregistre eller lokale vedtaksarkiver.',
      'Lovår og formell målgruppe dokumenterer ordningenes institusjonelle rekkevidde, men ikke full faktisk innmelding, utbetaling, kjennskap, administrativ praksis eller fordelingsvirkning.'
    ],
    quality: {
      tier: 'A',
      rationale: 'Fagredigert sosialpolitisk oversiktskilde med eksplisitt kronologi for yrkesavgrenset ulykkes- og syketrygd, allmennere grunntrygder og folketrygdens felles regelverk.'
    }
  },
  {
    source_id: 'src_his_snl_alderspensjon',
    title: 'alderspensjon',
    publisher: 'Store norske leksikon',
    source_type: 'scholarly_reference_pension_history',
    url: 'https://snl.no/alderspensjon',
    language: 'nb',
    geography_ids: ['geo_no_oslo_akershus'],
    temporal_scope: {from: 1936, to: 1967},
    provenance: {
      repository_source: paths.dossier,
      extracted_from: ['sources.src_his_snl_alderspensjon', 'claims.old_age_pension_universalization'],
      accessed_at: date
    },
    dating: {published_at: null, updated_at: '2026-02-05', accessed_at: date},
    limitations: [
      'Artikkelen dokumenterer hovedtrekk i pensjonslovgivningen, men gir ikke mottakerserier, realverdiberegninger, husholdsøkonomi eller lokal saksbehandling for hvert trinn.',
      'Opphevet behovsprøving og lik grunnpensjon betyr ikke lik samlet pensjon, siden opptjening, tidligere inntekt, botid, sivilstand og andre vilkår fortsatt påvirket ytelsen.'
    ],
    quality: {
      tier: 'A',
      rationale: 'Fagredigert pensjonshistorisk artikkel som skiller behovsprøvd alderstrygd, universell grunnpensjon og inntektsgradert tilleggspensjon.'
    }
  }
];

const newClaims = [
  {
    claim_id: 'claim_his_stortinget_social_insurance_expansion_1894_1911',
    statement: 'Stortinget vedtok ulykkesforsikring for fabrikkarbeidere i 1894, og obligatorisk syketrygd for lavtlønte arbeidere ble gjennomført fra 1911. Ordningene ga lovbaserte ytelser til avgrensede yrkes- og inntektsgrupper og viser en trinnvis overgang fra lokalt fattigskjønn til sosialforsikring, uten full befolkningsdekning.',
    claim_type: 'occupation_income_bounded_social_insurance_expansion',
    scope: {
      geography_ids: ['geo_no_oslo_akershus'],
      place_ids: ['stortinget'],
      case_ids: ['case_his_stortinget'],
      temporal: {from: 1894, to: 1911}
    },
    emne_ids: ['em_his_sosialforsikring_pensjon_universalisme', 'em_his_velferd_hverdagsliv'],
    source_ids: ['src_his_snl_folketrygden'],
    confidence: 'high',
    uncertainty: {
      level: 'medium',
      note: 'Kilden dokumenterer lovrekkefølgen og avgrensede målgrupper, men ikke komplett medlemskap, lokale vedtak, faktisk utbetaling eller husholdningenes økonomiske virkning.'
    },
    alternative_interpretations: [
      'Reformene kan leses som rettighetsutvidelse bort fra fattighjelp, men også som et forsikringssystem som fortsatt sorterte etter yrke, lønn og medlemskap.'
    ]
  },
  {
    claim_id: 'claim_his_stortinget_old_age_pension_universalization_1936_1967',
    statement: 'Alderstrygden fra 1936 var behovsprøvd; behovsprøvingen ble opphevet med virkning fra 1959, og folketrygden fra 1967 kombinerte en generell grunnpensjon med inntektsgradert tilleggspensjon. Forløpet utvidet dekningen, men beholdt forskjellige medlemskaps-, opptjenings- og fordelingsmekanismer.',
    claim_type: 'means_test_to_universal_basic_and_earnings_pension',
    scope: {
      geography_ids: ['geo_no_oslo_akershus'],
      place_ids: ['stortinget'],
      case_ids: ['case_his_stortinget'],
      temporal: {from: 1936, to: 1967}
    },
    emne_ids: ['em_his_sosialforsikring_pensjon_universalisme', 'em_his_velferd_hverdagsliv'],
    source_ids: ['src_his_snl_alderspensjon', 'src_his_snl_folketrygden'],
    confidence: 'high',
    uncertainty: {
      level: 'medium',
      note: 'Kildene dokumenterer lov- og systemendringene, men ikke ytelsenes realverdi, full faktisk dekning eller fordelingsvirkning for ulike kjønn, hushold, yrkesløp og botid.'
    },
    alternative_interpretations: [
      'Folketrygden kan forstås som universell grunnsikring og institusjonell samling, samtidig som tilleggspensjonen videreførte inntekts- og arbeidsmarkedsforskjeller.'
    ]
  }
];

const newEvidence = [
  {
    evidence_id: 'evidence_his_welfare_rights_everyday_life_v2_01',
    profile_id: 'profile_historie_no_oslo_akershus',
    geography_id: 'geo_no_oslo_akershus',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    emne_ids: ['em_his_sosialforsikring_pensjon_universalisme', 'em_his_velferd_hverdagsliv'],
    claim_id: 'claim_his_stortinget_social_insurance_expansion_1894_1911',
    source_ids: ['src_his_snl_folketrygden'],
    support_type: 'legislative_social_insurance_sequence',
    validation_status: 'validated_case',
    limitations_inherited: true,
    note: 'Stortinget brukes som institusjonelt lovgivningsanker. Evidensen dokumenterer reformrekkefølge og målgrupper, ikke at dagens stortingsbygning i seg selv var tjenestested eller at lovvedtak ga full faktisk dekning.'
  },
  {
    evidence_id: 'evidence_his_welfare_rights_everyday_life_v2_02',
    profile_id: 'profile_historie_no_oslo_akershus',
    geography_id: 'geo_no_oslo_akershus',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    emne_ids: ['em_his_sosialforsikring_pensjon_universalisme', 'em_his_velferd_hverdagsliv'],
    claim_id: 'claim_his_stortinget_old_age_pension_universalization_1936_1967',
    source_ids: ['src_his_snl_alderspensjon', 'src_his_snl_folketrygden'],
    support_type: 'pension_universalization_and_earnings_boundary',
    validation_status: 'validated_case',
    limitations_inherited: true,
    note: 'Stortinget er lovgivningsanker for systemendringene. Stedskoblingen er ikke et mottaker- eller forvaltningskontor, og universalitet i grunnpensjonen brukes ikke som bevis på lik samlet ytelse eller tilgang.'
  }
];

for (const source of newSources) addUnique(sourcesFile.sources, source, 'source_id');
for (const claim of newClaims) addUnique(claimsFile.claims, claim, 'claim_id');
for (const link of newEvidence) addUnique(evidenceFile.evidence_links, link, 'evidence_id');
claimsFile.last_updated = date;
sourcesFile.last_updated = date;
evidenceFile.last_updated = date;

const stortinget = profile.cases.find(x => x.case_id === 'case_his_stortinget');
if (!stortinget) throw new Error('Missing Stortinget profile case.');
stortinget.emne_ids = sorted([...stortinget.emne_ids, 'em_his_sosialforsikring_pensjon_universalisme', 'em_his_velferd_hverdagsliv']);
stortinget.validation.additional_batch_ids = sorted([...(stortinget.validation.additional_batch_ids || []), 'history_welfare_rights_everyday_life_evidence_v2']);
stortinget.validation.scope_expanded_at = date;
const socialMapping = profile.emne_case_mappings.find(x => x.emne_id === 'em_his_sosialforsikring_pensjon_universalisme');
if (!socialMapping) throw new Error('Missing social insurance profile mapping.');
socialMapping.case_ids = sorted([...socialMapping.case_ids, 'case_his_stortinget']);
profile.production_coverage.claims_total += 2;
profile.production_coverage.sources_total += 2;
profile.production_coverage.evidence_links_total += 2;
profile.last_updated = date;

const claimById = new Map(claimsFile.claims.map(x => [x.claim_id, x]));
const evidenceByClaim = new Map();
for (const link of evidenceFile.evidence_links) {
  const list = evidenceByClaim.get(link.claim_id) || [];
  list.push(link);
  evidenceByClaim.set(link.claim_id, list);
}
const makeEntry = (theory_id, claim_ids, rationale, limitations, alternative, disconfirmation, scope_note) => {
  const selected = claim_ids.map(id => claimById.get(id));
  if (selected.some(x => !x)) throw new Error('Unknown claim in ' + theory_id);
  return {
    theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids,
    source_ids: sorted(selected.flatMap(x => A(x.source_ids))),
    case_ids: sorted(selected.flatMap(x => A(x.scope?.case_ids))),
    place_ids: sorted(selected.flatMap(x => A(x.scope?.place_ids))),
    emne_ids: sorted(selected.flatMap(x => A(x.emne_ids))),
    evidence_link_ids: sorted(selected.flatMap(x => A(evidenceByClaim.get(x.claim_id)).map(y => y.evidence_id))),
    evidence_dimensions: ['documented_application', 'limitation_test', 'alternative_interpretation', 'multi_case_comparison', 'institution_rule_access_experience_outcome_separation'],
    rationale,
    limitations,
    alternative_interpretations: [alternative],
    disconfirmation_conditions: [disconfirmation],
    scope_note
  };
};

const scope = 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus med nasjonale reformer knyttet til et institusjonelt sted; det er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, ordninger og mottakergrupper.';
const entries = [
  makeEntry(
    'theory_his_sosialforsikring_pensjon_universalisme',
    ['claim_his_prinds_charity_workhouse_coercion_1809_1915','claim_his_stortinget_social_insurance_expansion_1894_1911','claim_his_stortinget_old_age_pension_universalization_1936_1967'],
    'Prinds dokumenterer et lokalt fattig- og arbeidsregime der hjelp og tvang kunne kombineres, mens Stortinget-casene følger yrkes- og inntektsavgrenset sosialforsikring, behovsprøvd alderstrygd, universell grunnpensjon og inntektsgradert tilleggspensjon. Sammen tester claimene overgang, medlemskap og dekningsgrenser uten å likestille lov med faktisk ytelse.',
    ['Stortinget er et institusjonelt lovgivningsanker og dokumenterer ikke lokal saksbehandling, mottakererfaring eller alle reformenes fysiske møtesteder.','Nasjonale lovmilepæler og et eldre Oslo-fattigcase gir ikke mottakerserier, realverdier eller representativ husholdsøkonomi.'],
    'Forløpet kan leses som avstigmatiserende rettighetsutvidelse, men også som nye administrative skiller etter yrke, medlemskap, behov, inntekt og opptjening.',
    'Anvendelsen må revideres dersom behovsprøvd hjelp, bidragsforsikring, skattefinansiert grunnsikring og inntektsgradert tilleggspensjon behandles som én uendret eller fullt dekkende ordning.',
    scope
  ),
  makeEntry(
    'theory_his_boligpolitikk_materiell_velferd',
    ['claim_his_gronvold_labour_shortage_relocation_housing_1875_1895','claim_his_nydalen_worker_housing_near_factory_1850_1900','claim_his_sagene_school_meals_hygiene_material_support'],
    'Grønvold og Nydalen dokumenterer arbeidskraftbehov, nærhet til fabrikk og konkrete arbeiderboliger, mens Sagene skole dokumenterer klær, måltider og hygiene som materiell støtte i et industristrøk. Claimene gjør det mulig å analysere bolig og forsyning som velferdsmekanismer uten å slutte kommunal tildeling, varig botrygghet eller lik levestandard fra bygninger og tilbud alene.',
    ['Grønvold og Nydalen dokumenterer arbeidsgiver- og industrinær bolig, ikke en full kommunal boligpolitikk eller representative husholdsbudsjetter.','Sagene skoles tiltak viser tilbud, men ikke omfang, mottakervilkår, faktisk bruk eller varige fordelingsvirkninger.'],
    'Bolig og materielle tiltak kan forstås som velferd og tilgangsstøtte, men også som ordninger som bandt hushold til arbeidsplass, skole og institusjonelle normalitetskrav.',
    'Modellen svekkes dersom boligproduksjon, nærhet eller hjelpetiltak brukes som bevis på rimelighet, kvalitet, sikker kontrakt, lik tilgang eller at hushold faktisk ble boende.',
    scope
  ),
  makeEntry(
    'theory_his_omsorgsarbeid_kjonn_sosial_reproduksjon',
    ['claim_his_gronvold_karoline_homework_factory_childcare_1885_1947','claim_his_sagene_school_meals_hygiene_material_support','claim_his_oslo_hospital_reformation_poor_sick_1538'],
    'Karoline Kristiansens livsløp kobler hjemmearbeid, fabrikkarbeid og levering av små barn i barnekrybbe, Sagene skole viser at måltider, klær og hygiene ble lagt til skoleoppgaven, og Oslo Hospital viser varig institusjonell pleie for fattige og syke. Sammen synliggjør claimene hvordan omsorg ble fordelt mellom familie, arbeid, skole og institusjon uten å naturalisere kjønn eller gjøre tilbud til dokumentert utfall.',
    ['Én erindring kan dokumentere et konkret kvinnelig livsløp, men er ikke en tidsbruksserie eller representativ for alle hushold og arbeidere.','Institusjonskilder dokumenterer funksjoner og tiltak bedre enn uformell omsorg, relasjoner, følelsesarbeid og mottakernes erfaringer.'],
    'Institusjonalisert omsorg kan avlaste familiearbeid, men også organisere nye krav til mødre, barn, elever og pasienter og dermed flytte snarere enn fjerne ulønnet arbeid.',
    'Anvendelsen må revideres dersom omsorg behandles som en naturlig kvinnelig egenskap, eller dersom offentlig institusjon og tilbud automatisk tolkes som avlastning, lik tilgang eller bedre hverdagsutfall.',
    scope
  ),
  makeEntry(
    'theory_his_rettighet_vilkar_tilgang',
    ['claim_his_prinds_children_schooling_confinement_pre1845','claim_his_sagene_school_meals_hygiene_material_support','claim_his_rikshospitalet_state_teaching_hospital_1826'],
    'Prinds viser at barn kunne plasseres gjennom fattig- og disiplinforvaltning, Sagene skole dokumenterer konkrete materielle tilbud uten mottaker- eller virkningsmål, og Rikshospitalet dokumenterer statlig sykehus- og undervisningskapasitet uten lik behandlingstilgang. Sammen tester claimene skillet mellom institusjon, adgang, vilkår, faktisk bruk og utfall selv der et moderne rettighetsspråk ikke kan projiseres bakover.',
    ['De tre institusjonscasene dekker forskjellige ordninger og perioder og dokumenterer ikke én sammenhengende juridisk velferdsrett.','Kildene gir få personforløp, søknader, avslag, klager eller ventetider og kan derfor ikke måle faktisk tilgang representativt.'],
    'Ordningene kan tolkes som utvidet omsorg og kapasitet, men også som adgang regulert gjennom alder, fattigstatus, disiplin, profesjonell vurdering og institusjonelle prioriteringer.',
    'Teorianvendelsen må forkastes dersom institusjonens eksistens eller tilbud likestilles med kjent, rettslig håndhevbar, tilgjengelig og effektiv hjelp for alle.',
    scope
  ),
  makeEntry(
    'theory_his_bruker_tjeneste_forvaltning',
    ['claim_his_prinds_poor_hospital_asylum_1828_1905','claim_his_oslo_hospital_closure_reuse_2018','claim_his_rikshospitalet_gaustad_specialized_university_hospital'],
    'Prinds dokumenterer gradvis sortering av fattigsykerom, sykehus og asyl, Oslo Hospital dokumenterer et institusjonsbrudd uten kunnskap om videre tjenesteforløp, og Rikshospitalet dokumenterer samlokalisering og organisatorisk konsentrasjon uten kontinuitets- eller tilgangsmål. Claimene gjør forvaltningens kategorier og tjenestestruktur synlige samtidig som brukerens erfaring holdes som et eksplisitt kunnskapsgap.',
    ['Institusjonskronologi og organisasjonsendring dokumenterer ikke innholdet i hver vurdering, journal, tildeling, klage eller tjenestekontakt.','Kildene er hovedsakelig institusjons- og leksikonhistorier og gir begrenset adgang til pasientenes og mottakernes egne perspektiver.'],
    'Spesialisering, flytting og sammenslåing kan forstås som økt kapasitet og ekspertise, men også som sterkere kategorisering, sentralisering og brudd i relasjoner og tjenester.',
    'Anvendelsen må revideres dersom administrative betegnelser gjøres til hele personidentiteter, eller dersom kapasitet, samlokalisering og bygningsombruk brukes som mål på kontinuitet, medvirkning eller faktisk tjenestekvalitet.',
    scope
  )
];
for (const entry of entries) addUnique(theoryFile.entries, entry, 'theory_id');
theoryFile.completion.qualifying_entries = 130;
theoryFile.completion.ratio = 0.565;
theoryFile.completion.universal_status = 'INCOMPLETE';

profile.evidence_batches.push({
  batch_id: 'history_welfare_rights_everyday_life_evidence_v2',
  status: 'validated',
  validated_at: date,
  newly_verified_case_ids: [],
  expanded_case_ids: ['case_his_stortinget'],
  claim_ids: newClaims.map(x => x.claim_id),
  source_ids: newSources.map(x => x.source_id),
  evidence_ids: newEvidence.map(x => x.evidence_id),
  qualified_theory_ids: entries.map(x => x.theory_id)
});

const dossier = {
  schema_version: '1.0',
  dossier_id: 'history_welfare_rights_everyday_life_evidence_v2',
  subject_id: 'historie',
  domain_id: 'his_velferd_rett_hverdagsliv',
  status: 'materialized',
  created_at: date,
  purpose: 'Fullføre de fem gjenværende velferds- og hverdagslivsteoriene med to nye Stortinget-claims og streng gjenbruk av eksisterende validerte Oslo-caser.',
  theory_ids: entries.map(x => x.theory_id),
  new_source_ids: newSources.map(x => x.source_id),
  new_claim_ids: newClaims.map(x => x.claim_id),
  new_evidence_ids: newEvidence.map(x => x.evidence_id),
  reused_claim_ids: sorted(entries.flatMap(x => x.claim_ids).filter(id => !newClaims.some(c => c.claim_id === id))),
  case_ids_used: sorted(entries.flatMap(x => x.case_ids)),
  place_ids_used: sorted(entries.flatMap(x => x.place_ids)),
  source_notes: {
    src_his_snl_folketrygden: {
      url: 'https://snl.no/folketrygden',
      inspected_at: date,
      supports: ['1894 ulykkesforsikring for fabrikkarbeidere','1911 obligatorisk syketrygd for avgrensede arbeidstakere','1936 behovsprøvde grunntrygder','1966 vedtak og 1967 ikrafttredelse av folketrygden'],
      boundary: 'Nasjonal lov- og systemkronologi dokumenterer ikke full faktisk dekning eller lokale vedtaksforløp.'
    },
    src_his_snl_alderspensjon: {
      url: 'https://snl.no/alderspensjon',
      inspected_at: date,
      supports: ['1936 behovsprøvd alderstrygd','opphevet behovsprøving med virkning fra 1959','1967 grunnpensjon og inntektsgradert tilleggspensjon'],
      boundary: 'Formell universalisme i grunnpensjonen dokumenterer ikke lik samlet ytelse, realverdi eller mottakererfaring.'
    }
  },
  spatial_boundary: 'Stortinget brukes som institusjonelt lovgivningsanker, ikke som trygdekontor, mottakersted eller bevis på at alle historiske reformledd kan stedfestes til dagens bygning.',
  production_boundary: 'Ingen nye place- eller people-objekter. Fire teorier kvalifiseres ved eksisterende claims; bare sosialforsikring/pensjon får nye claims, kilder og evidenslenker.'
};

write(paths.claims, claimsFile);
write(paths.sources, sourcesFile);
write(paths.evidence, evidenceFile);
write(paths.theories, theoryFile);
write(paths.profile, profile);
write(paths.dossier, dossier);

let docs = fs.readFileSync(paths.docs, 'utf8');
docs = docs.replace('Produksjonen står på 125 av 230 etter at Velferd, rett og hverdagsliv V1 kvalifiserer fattigvesen og sosial kontroll, helse og profesjonalisering, skole og folkedannelse, barndom og livsløp samt institusjonalisering og avinstitusjonalisering med eksisterende Oslo-caser og eksplisitte grenser mellom institusjon, regel, tilgang, erfaring og utfall.', 'Produksjonen står på 130 av 230 etter at Velferd, rett og hverdagsliv V2 fullfører domenet med sosialforsikring og pensjon, bolig og materiell velferd, omsorgsarbeid og sosial reproduksjon, velferdsrett og tilgang samt bruker–tjeneste–forvaltning. V2 bruker to nye Stortinget-claims og streng gjenbruk av eksisterende validerte Oslo-caser.');
docs = docs.replace('- Totalt: **125 av 230** teoriobjekter (**54.3 %**).', '- Velferd, rett og hverdagsliv V2: **5** nye kvalifiserende teoriobjekter, **2** nye claims, **2** nye kilder og **2** nye place-evidence-lenker; null nye place- eller people-objekter. Sosialforsikring og pensjon får målrettet ny Stortinget-evidens, mens bolig, omsorg, tilgang og bruker–tjeneste–forvaltning kvalifiseres ved streng claim-gjenbruk.\n- Totalt: **130 av 230** teoriobjekter (**56.5 %**).');
docs = docs.replace('- Gjenstående teoriobjekter: **105**.', '- Gjenstående teoriobjekter: **100**.');
fs.writeFileSync(paths.docs, docs);

let test = fs.readFileSync(paths.test, 'utf8');
if (!test.includes('theoryEvidenceQualifying, 125')) throw new Error('Expected 125 assertion in Fagverk test.');
test = test.replace('theoryEvidenceQualifying, 125', 'theoryEvidenceQualifying, 130');
fs.writeFileSync(paths.test, test);

const freeze = read(paths.freeze);
freeze.frozen_at = new Date().toISOString();
freeze.reason = 'V5.8 freeze refreshed after Velferd, rett og hverdagsliv V2 completed the domain at 10/10; two Stortinget claims, two sources, two place-evidence links and five qualifying theory entries were added while frozen V5.8 theory definitions remain unchanged.';
for (const p of Object.keys(freeze.files)) freeze.files[p] = sha(p);
write(paths.freeze, freeze);

console.log(JSON.stringify({
  qualifying_entries: theoryFile.entries.length,
  claims_total: claimsFile.claims.length,
  sources_total: sourcesFile.sources.length,
  evidence_links_total: evidenceFile.evidence_links.length,
  profile_claims_total: profile.production_coverage.claims_total,
  profile_sources_total: profile.production_coverage.sources_total,
  profile_evidence_links_total: profile.production_coverage.evidence_links_total
}, null, 2));
