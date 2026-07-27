#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-theory-evidence');
const registryPath = path.join(historyDir, 'theory_evidence_historie_canonical_v1.json');
const theoriesPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const claimsPath = path.join(historyDir, 'claims_historie_canonical_v1.json');
const sourcesPath = path.join(historyDir, 'sources_historie_canonical_v1.json');
const placeEvidencePath = path.join(historyDir, 'place_evidence_historie_v1.json');
const docsPath = path.join(root, 'docs/HISTORY_THEORY_EVIDENCE.md');
const gapJsonPath = path.join(reportDir, 'history-theory-evidence-gap-inventory-v1.json');
const gapMarkdownPath = path.join(reportDir, 'history-theory-evidence-gap-inventory-v1.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const A = (value) => Array.isArray(value) ? value : [];
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const theories = readJson(theoriesPath);
const registry = readJson(registryPath);
const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const placeEvidenceFile = readJson(placeEvidencePath);

const theoryById = new Map(A(theories).map((item) => [item.theory_id, item]));
const claimById = new Map(A(claimsFile.claims).map((item) => [item.claim_id, item]));
const sourceById = new Map(A(sourcesFile.sources).map((item) => [item.source_id, item]));
const evidenceByClaim = new Map(A(placeEvidenceFile.evidence_links).map((item) => [item.claim_id, item]));
const existingIds = new Set(A(registry.entries).map((item) => item.theory_id));

const specs = [
  {
    theory_id: 'theory_his_krig_okkupasjon_rettsoppgjor_og_etterkrig',
    claim_ids: [
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_villa_grande_gimle_quisling_residence_1941',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_oslo_radhus_opened_1950_05_15',
      'claim_his_oslo_radhus_seat_bystyre_byrad',
    ],
    rationale: 'Akershus festning dokumenterer okkupasjonsbruk, henrettelser, rettsoppgjør og senere minnelag, mens Villa Grande viser overgangen fra kollaborasjonsregimets residens til forsknings- og læringssenter. Oslo rådhus tilfører en etterkrigskontekst for offentlig institusjon, demokratisk styring og symbolsk gjenetablering av sivilt fellesskap.',
    limitations: [
      'Claimene dokumenterer steder og institusjoner, men ikke det samlede juridiske forløpet, domspraksisen eller alle gruppene som ble berørt av rettsoppgjøret.',
      'Rådhusets åpning og funksjon viser etterkrigstidens offentlige ramme, men er ikke direkte dokumentasjon av rettsoppgjørets beslutninger eller legitimitetsdebatter.',
    ],
    alternative_interpretations: [
      'Etterkrigsinstitusjonene kan leses som demokratisk gjenopprettelse og kritisk bearbeiding, men også som selektiv nasjonal fortelling der samarbeid, gråsoner og uenighet får ulik plass.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom senere minnesteder og offentlige bygg brukes som direkte bevis for rettsoppgjørets faktiske prosess uten samtidige juridiske kilder.',
    ],
  },
  {
    theory_id: 'theory_his_fravaer_taushet_motminne',
    claim_ids: [
      'claim_his_villa_grande_gimle_quisling_residence_1941',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
      'claim_his_22_juli_center_akersgata42_site_connection',
      'claim_his_hovedoya_kloster_burned_1532_material_trace',
    ],
    rationale: 'Villa Grandes skifte fra bevoktet maktsted til kritisk læringsinstitusjon, 22. juli-senterets dokumentasjon og åstedstilknytning og Hovedøya-ruinens senere synlighet viser hvordan fravær, ødeleggelse og tidligere maktbruk kan gjøres lesbare gjennom motminne, kuratering og materielle spor.',
    limitations: [
      'Claimene dokumenterer institusjonell formidling og materiell ettertid, men ikke systematisk hvilke stemmer, ofre eller erfaringer som fortsatt er fraværende.',
      'Taushet kan skyldes tapte kilder, bevisst utelatelse, skiftende mandat eller manglende dokumentasjon; casene skiller ikke alltid mellom disse mekanismene.',
    ],
    alternative_interpretations: [
      'Omformingen av belastede steder kan forstås som motminne og kritisk offentlighet, men også som ny institusjonell kontroll over hvilke fortellinger som blir synlige.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom fravær eller taushet påstås uten at det kan identifiseres hva som mangler, sammenlignet med hvilke kilder eller aktørperspektiver.',
    ],
  },
  {
    theory_id: 'theory_his_rettsoppgjor_legitimitet_minne',
    claim_ids: [
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_oslo_radhus_seat_bystyre_byrad',
    ],
    rationale: 'Akershus festning kobler okkupasjon, rettsoppgjør og senere minne, mens HL-senteret og 22. juli-senteret viser institusjonalisert bearbeiding av antidemokratisk vold. Eidsvollsbygningen og Oslo rådhus tilfører etablerte symboler og institusjoner for konstitusjonell og lokal demokratisk legitimitet.',
    limitations: [
      'Eidsvollsbygningen og rådhuset representerer demokratiske institusjoner, men dokumenterer ikke i seg selv hvordan konkrete rettsoppgjør ble legitimert eller bestridt.',
      'Registeret mangler dommer, lovforarbeider, forsvarerperspektiver, offerstemmer og samtidige debatter som kreves for en full rettshistorisk analyse.',
    ],
    alternative_interpretations: [
      'Minnestedene kan styrke rettsstatlig og demokratisk legitimitet, men kan også stabilisere ettertidens fortelling og redusere synligheten av juridisk eller politisk uenighet.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom legitimitet utledes fra monument- eller institusjonsstatus uten kilder til rettslige begrunnelser, konflikt eller offentlig mottakelse.',
    ],
  },
  {
    theory_id: 'theory_his_kontrovers_fjerning_omtolking',
    claim_ids: [
      'claim_his_bispelokket_completed_1967_traffic_machine',
      'claim_his_bispelokket_demolished_after_bjorvika_tunnel',
      'claim_his_gamle_deichman_main_library_1933_2019',
      'claim_his_gamle_deichman_planned_fotohuset_reuse',
      'claim_his_villa_grande_transformed_to_hl_center',
    ],
    rationale: 'Bispelokket viser hvordan et stort infrastrukturobjekt først ble etablert og senere fjernet, mens gamle Deichman og Villa Grande viser nye funksjoner og kritisk omtolking av eksisterende bygg. Casene dokumenterer at materiell kulturarv kan rives, ombrukes eller gis et nytt mandat når by-, kunnskaps- og minnepolitiske prioriteringer endres.',
    limitations: [
      'Claimene dokumenterer fjerning og omtolking, men ikke nødvendigvis at prosessene var offentlige kontroverser; dette krever debatt-, vedtaks- og mottakskilder.',
      'Infrastruktur, bibliotek og tidligere regimebolig har ulike rettslige, materielle og symbolske forutsetninger og må ikke behandles som samme type kulturminne.',
    ],
    alternative_interpretations: [
      'Endringene kan forstås som nødvendig byfornyelse og produktiv ombruk, men også som tap av historiske lag eller institusjonell omskriving av stedets betydning.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom kontrovers tilskrives casene uten dokumenterte motposisjoner, eller dersom all funksjonsendring automatisk klassifiseres som omtolking.',
    ],
  },
  {
    theory_id: 'theory_his_arkiv_makt_orden',
    claim_ids: [
      'claim_his_gamle_deichman_main_library_1933_2019',
      'claim_his_folkets_hus_current_complex_1958_1962',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_akershus_festning_occupation_memory_layers',
    ],
    rationale: 'Gamle Deichman, Arbeiderbevegelsens arkiv og bibliotek i Folkets Hus, 22. juli-senterets dokumentasjonsmandat, HL-senterets forskningsfunksjon og Akershus festnings museale minnelag viser institusjoner som ordner, bevarer og formidler kunnskap. Sammen gjør de det mulig å prøve hvordan mandat og klassifikasjon påvirker hva som blir tilgjengelig og autoritativt.',
    limitations: [
      'Claimene dokumenterer institusjonenes funksjon, men ikke katalogsystemer, aksesjonsregler, kassasjon, metadata eller konkrete klassifikasjonsbeslutninger.',
      'Bibliotek, arkiv, museum, forskningssenter og læringssenter har ulike profesjonsnormer og kan ikke slås sammen til én kunnskapsinstitusjon uten analytiske skiller.',
    ],
    alternative_interpretations: [
      'Institusjonene kan forstås som demokratisk kunnskapsinfrastruktur, men også som portvoktere som etablerer hierarkier mellom dokumenter, aktører og fortellinger.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom klassifikasjonsmakt bare antas fra institusjonens eksistens uten dokumentasjon av ordnings-, utvalgs- eller tilgangspraksis.',
    ],
  },
  {
    theory_id: 'theory_his_grunnlov_rom_tekst',
    claim_ids: [
      'claim_his_eidsvollsbygningen_constitution_1814',
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_oslo_radhus_seat_bystyre_byrad',
      'claim_his_oslo_radhus_opened_1950_05_15',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
    ],
    rationale: 'Eidsvollsbygningen knytter grunnlovsteksten til et konkret rom og en avgrenset forsamling, mens den senere monumentaliseringen viser hvordan rommet ble institusjonalisert som nasjonalt minne. Oslo rådhus og 22. juli-senteret viser senere offentlige rom der demokratisk styring og fortellinger om demokrati gis materiell og pedagogisk form.',
    limitations: [
      'Bare Eidsvoll-claimet dokumenterer selve grunnlovsprosessen; de øvrige casene viser senere institusjoner og historiebruk, ikke direkte tekstproduksjon eller juridisk fortolkning.',
      'Romlig symbolikk sier ikke automatisk noe om hvem som hadde politisk tilgang, hvordan teksten ble lest eller hvordan rettigheter faktisk ble praktisert.',
    ],
    alternative_interpretations: [
      'Rommet kan forstås som demokratisk materialisering av tekst og representasjon, men også som en monumental fortelling som skjuler eksklusjon og senere konflikter om demokratiets innhold.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom forbindelsen mellom tekst, institusjon og rom ikke kan dokumenteres, eller dersom senere demokratisymboler behandles som direkte uttrykk for 1814-aktørenes intensjoner.',
    ],
  },
  {
    theory_id: 'theory_his_miljo_klima_landskap_som_historisk_prosess',
    claim_ids: [
      'claim_his_akerselva_industrial_energy_axis',
      'claim_his_akerselva_environmental_reuse_from_1986',
      'claim_his_bispelokket_completed_1967_traffic_machine',
      'claim_his_bispelokket_demolished_after_bjorvika_tunnel',
      'claim_his_oslo_radhus_pipervika_transformation',
      'claim_his_hovedoya_kloster_burned_1532_material_trace',
    ],
    rationale: 'Akerselva viser landskap som energiressurs, industrimiljø og senere miljøpark, Bispelokket viser transportinfrastrukturens etablering og fjerning, Pipervika viser omfattende byomforming, og Hovedøya viser hvordan ødeleggelse og senere forvaltning former synlige spor. Landskap framstår dermed som historisk produsert gjennom arbeid, teknologi, politikk og vern.',
    limitations: [
      'Claimene dokumenterer materielle og institusjonelle endringer, men har begrensede data om økologi, utslipp, klima, artsmangfold, helse eller fordelingsvirkninger.',
      'Bylandskap, elvelandskap og ruinmiljø følger ulike tidsskalaer og prosesser; sammenligningen må ikke gjøre all endring til én lineær moderniseringshistorie.',
    ],
    alternative_interpretations: [
      'Omformingene kan leses som teknologisk framgang og miljørehabilitering, men også som forurensning, barrierebygging, tap av hverdagsmiljø og selektiv grønn byutvikling.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom landskapsendring forklares uten dokumenterte aktører og inngrep, eller dersom miljøvirkninger påstås uten miljøhistoriske data.',
    ],
  },
  {
    theory_id: 'theory_his_institusjonsbygging_funksjon',
    claim_ids: [
      'claim_his_eidsvollsbygningen_constitution_1814',
      'claim_his_folkets_hus_first_opened_1907',
      'claim_his_folkets_hus_current_complex_1958_1962',
      'claim_his_gamle_deichman_main_library_1933_2019',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
      'claim_his_oslo_radhus_seat_bystyre_byrad',
    ],
    rationale: 'Eidsvollsbygningen, Folkets Hus, Deichman, 22. juli-senteret og Oslo rådhus dokumenterer hvordan politiske, organisatoriske, kunnskaps- og minnefunksjoner får varige rom, mandat og infrastruktur. Casene viser både etablering, utvidelse og skiftende institusjonell funksjon på tvers av to århundrer.',
    limitations: [
      'Bygninger og formelle funksjoner dokumenterer ikke alene organisasjonenes interne regler, budsjetter, brukergrupper, profesjoner eller faktiske måloppnåelse.',
      'En grunnlovsforsamling, et møtehus, et bibliotek, et læringssenter og et rådhus er forskjellige institusjonstyper med ulike autoritetsformer.',
    ],
    alternative_interpretations: [
      'Institusjonsbygging kan forstås som stabil demokratisk kapasitet og offentlig kunnskap, men også som sentralisering, profesjonalisering og avgrensning av hvem som får definere mandatet.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom institusjonell funksjon bare avledes fra bygningens navn eller arkitektur uten dokumentert mandat, bruk eller organisatorisk kontinuitet.',
    ],
  },
  {
    theory_id: 'theory_his_offentlig_rom_tilgang_konflikt',
    claim_ids: [
      'claim_his_oslo_radhus_pipervika_transformation',
      'claim_his_bispelokket_completed_1967_traffic_machine',
      'claim_his_bispelokket_demolished_after_bjorvika_tunnel',
      'claim_his_akerselva_environmental_reuse_from_1986',
      'claim_his_gamle_deichman_planned_fotohuset_reuse',
      'claim_his_folkets_hus_current_complex_1958_1962',
    ],
    rationale: 'Pipervika-saneringen, Bispelokkets etablering og fjerning, Akerselvas miljøpark, planlagt ombruk av gamle Deichman og Folkets Hus som organisasjonsinfrastruktur viser at offentlig rom formes gjennom regulering, transport, miljøtiltak og institusjonell bruk. Endringene påvirker hvilke aktiviteter, forbindelser og brukergrupper rommene prioriterer.',
    limitations: [
      'Claimene dokumenterer fysiske og institusjonelle endringer, men har begrensede data om faktisk tilgjengelighet, universell utforming, brukerkonflikt og hvem som ble ekskludert.',
      'Offentlig eierskap, offentlig funksjon og reell offentlig tilgang er forskjellige forhold som må dokumenteres separat.',
    ],
    alternative_interpretations: [
      'Tiltakene kan forstås som bedre mobilitet, miljø og kulturtilgang, men også som barrierer, sanering, selektiv ombruk og omfordeling av attraktivt byrom.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom tilgang eller konflikt påstås uten bruker-, plan- eller beslutningskilder som viser hvem som kunne bruke rommet og på hvilke vilkår.',
    ],
  },
  {
    theory_id: 'theory_his_okkupasjon_byrom_kontroll',
    claim_ids: [
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_villa_grande_gimle_quisling_residence_1941',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_oslo_radhus_opened_1950_05_15',
      'claim_his_22_juli_center_akersgata42_site_connection',
    ],
    rationale: 'Akershus festning og Villa Grande dokumenterer okkupasjonsregimets bruk av bevoktede og symbolske steder, mens Villa Grandes senere omforming viser kritisk gjenbruk av et maktrom. Rådhusets etterkrigsåpning og 22. juli-senterets åstedstilknytning tilfører senere offentlige rom for demokratisk institusjon og bearbeiding av politisk vold.',
    limitations: [
      'Claimene dekker sentrale makt- og minnested, men ikke kontrollposter, beslag, boligrekvirering, gatebruk, transport, overvåkning eller befolkningens hverdagslige romerfaringer.',
      'Rådhuset og 22. juli-senteret er etterkrigs- og samtidscaser og kan bare brukes til å analysere ettertidens romlige svar, ikke okkupasjonens kontrollmekanismer direkte.',
    ],
    alternative_interpretations: [
      'Stedene kan leses som rom for autoritær kontroll og senere demokratisk gjenerobring, men også som institusjonelt kuraterte symboler som ikke dekker hele byens okkupasjonserfaring.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom byromskontroll generaliseres fra to elite- og statssteder uten flere samtidige kilder til bevegelse, adgang og dagligliv.',
    ],
  },
];

if (!Array.isArray(registry.entries)) throw new Error('Theory evidence registry entries must be an array.');
if (registry.completion?.qualifying_entries !== 22) {
  throw new Error(`Batch 3 requires a 22-entry baseline; found ${registry.completion?.qualifying_entries}.`);
}

for (const spec of specs) {
  if (!theoryById.has(spec.theory_id)) throw new Error(`Unknown theory_id: ${spec.theory_id}`);
  if (existingIds.has(spec.theory_id)) throw new Error(`Theory already exists in evidence registry: ${spec.theory_id}`);
  const claims = spec.claim_ids.map((id) => {
    const claim = claimById.get(id);
    if (!claim) throw new Error(`Unknown claim_id for ${spec.theory_id}: ${id}`);
    const evidence = evidenceByClaim.get(id);
    if (!evidence || !['validated_case', 'validated_pilot'].includes(evidence.validation_status)) {
      throw new Error(`Claim lacks validating place evidence for ${spec.theory_id}: ${id}`);
    }
    for (const sourceId of A(claim.source_ids)) {
      if (!sourceById.has(sourceId)) throw new Error(`Unknown source ${sourceId} for claim ${id}.`);
    }
    return claim;
  });
  registry.entries.push({
    theory_id: spec.theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids: [...spec.claim_ids],
    source_ids: sorted(claims.flatMap((claim) => A(claim.source_ids))),
    case_ids: sorted(claims.flatMap((claim) => A(claim.scope?.case_ids))),
    place_ids: sorted(claims.flatMap((claim) => A(claim.scope?.place_ids))),
    emne_ids: sorted(claims.flatMap((claim) => A(claim.emne_ids))),
    evidence_link_ids: sorted(claims.map((claim) => evidenceByClaim.get(claim.claim_id)?.evidence_id).filter(Boolean)),
    evidence_dimensions: [
      'documented_application',
      'limitation_test',
      'alternative_interpretation',
      'multi_case_comparison',
      'distinct_claim_profile',
    ],
    rationale: spec.rationale,
    limitations: spec.limitations,
    alternative_interpretations: spec.alternative_interpretations,
    disconfirmation_conditions: spec.disconfirmation_conditions,
    scope_note: 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, aktørgrupper og kildetyper.',
  });
  existingIds.add(spec.theory_id);
}

const totalTheories = theoryById.size;
const qualifyingEntries = registry.entries.length;
registry.completion = {
  total_theories: totalTheories,
  qualifying_entries: qualifyingEntries,
  ratio: Math.round((qualifyingEntries / totalTheories) * 1000) / 1000,
  pilot_target: 10,
  universal_target_ratio: 1,
  universal_status: qualifyingEntries === totalTheories ? 'COMPLETE' : 'INCOMPLETE',
};
writeJson(registryPath, registry);

const gapCategories = [
  {
    category_id: 'national_political_chronology',
    status: 'requires_new_claims_and_sources',
    theory_ids: [
      'theory_his_1814_statsdannelse_stemmerett_partier_og_parlamentarisme',
      'theory_his_1814_statsdannelse_union_selvstendighet_og_1905',
      'theory_his_1814_statsdannelse_1905_unionsopplosning_og_ny_utenrikspolitisk_orientering',
    ],
    requirement: 'Nye claims om stemmerettsutvidelser, partidannelse, parlamentarisme, unionskonflikt og 1905 med samtidige politiske og juridiske kilder.',
    reason: 'Eidsvollsbygningen og Oslo rådhus dokumenterer 1814 og kommunal institusjon, men kan ikke erstatte hendelses- og aktørkilder for 1800-tallets demokratisering og 1905.',
  },
  {
    category_id: 'samisk_minority_and_citizenship',
    status: 'requires_new_geographies_claims_and_actor_perspectives',
    theory_ids: [
      'theory_his_1814_statsdannelse_eksklusjon_fornorskning_og_statsborgerskap',
      'theory_his_middelalder_kirke_samiske_kontaktsoner_handel_og_statsgrenser_i_middelalderen',
    ],
    requirement: 'Cases utenfor dagens Oslo/Akershus-pilot, samiske og minoritetsforankrede kilder, statsborgerskaps- og fornorskningsclaims og tydelig aktørproveniens.',
    reason: 'Dagens stedsevidens inneholder ingen kvalifiserende claims om samiske kontaktsoner, fornorskning eller minoriteters statsborgerskap.',
  },
  {
    category_id: 'digital_media_and_surveillance',
    status: 'requires_new_claims_source_types_and_recent_cases',
    theory_ids: [
      'theory_his_digitale_kilder',
      'theory_his_offentlighet_mobilisering_digitale_offentligheter_nettverk_og_nye_mobiliseringsformer',
      'theory_his_offentlighet_mobilisering_digital_mobilisering_overvakning_og_motmakt',
      'theory_his_register_overvakning_disiplin',
    ],
    requirement: 'Digitale arkiver, plattformdata, metadata, nettverks- og overvåkningsclaims med dokumentert innsamling, personvern og kildebegrensning.',
    reason: 'Fysiske institusjons- og stedclaims kan ikke dokumentere digitale mobiliseringsformer, metadata eller overvåkning.',
  },
  {
    category_id: 'cold_war_and_global_history',
    status: 'requires_new_period_cases_and_geographic_breadth',
    theory_ids: [
      'theory_his_kald_krig_supermakter_allianser',
      'theory_his_atomvapen_avskrekking_opprustning',
      'theory_his_avkolonisering_alliansefrihet_utvikling',
      'theory_his_krig_okkupasjon_kald_krig_beredskap_og_sikkerhetsstat',
    ],
    requirement: 'Kaldkrigs-, allianse-, atomvåpen-, avkoloniserings- og beredskapscaser med internasjonale og norske primær- og sekundærkilder.',
    reason: 'Den nåværende piloten har ingen kvalifiserende claims om blokkpolitikk, atomavskrekking, avkolonisering eller sikkerhetsstat.',
  },
  {
    category_id: 'movement_specific_publics',
    status: 'requires_new_actor_and_movement_claims',
    theory_ids: [
      'theory_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
      'theory_his_offentlighet_mobilisering_borgerrettighetskamp_antirasisme_og_solidaritetsbevegelser',
      'theory_his_offentlighet_mobilisering_miljobevegelse_og_nye_sosiale_bevegelser',
      'theory_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
    ],
    requirement: 'Bevegelsesspesifikke claims om organisasjoner, aksjoner, deltakere, krav, repertoarer og motstand, ikke bare generelle møte- eller institusjonsbygg.',
    reason: 'Folkets Hus dokumenterer arbeiderbevegelsens infrastruktur, men kvalifiserer ikke kvinne-, avholds-, antirasistiske, miljø- eller protestbevegelser alene.',
  },
  {
    category_id: 'medieval_social_economic_and_legal_history',
    status: 'requires_new_medieval_claims_and_source_types',
    theory_ids: [
      'theory_his_middelalder_kirke_bondehushold_demografi_og_dagligliv',
      'theory_his_middelalder_kirke_jord_eiendom_og_patronasje',
      'theory_his_middelalder_kirke_lov_ting_og_jurisdiksjon',
      'theory_his_middelalder_kirke_skriftkultur_diplom_og_muntlig_rett',
      'theory_his_middelalder_kirke_svartedauden_og_senmiddelalderens_omforming',
      'theory_his_middelalder_kirke_handel_handverk_og_bydannelse',
    ],
    requirement: 'Arkeologiske, diplomatiske, rettslige, demografiske og økonomiske claims som går utover grunnleggelse, statsborg og ruinens etterliv.',
    reason: 'Akershus og Hovedøya kvalifiserer kongemakt, kirke og konflikt, men ikke hushold, patronasje, jurisdiksjon, skriftkultur, pest eller handel.',
  },
  {
    category_id: 'source_method_families',
    status: 'requires_new_source_specific_evidence',
    theory_ids: [
      'theory_his_visuelle_kilder',
      'theory_his_muntlige_kilder',
      'theory_his_serielle_kilder',
      'theory_his_dokument_autentisitet',
      'theory_his_arkeologisk_kontekst_formation',
    ],
    requirement: 'Evidens som dokumenterer fotografi og bildeanalyse, intervjuer og erindring, serielle datasett, dokumentautentisitet og arkeologisk kontekst med metode- og proveniensnotater.',
    reason: 'At en institusjon planlegger fotofunksjon eller forvalter dokumentasjon er ikke bevis for at de enkelte kildeformene er metodisk prøvd.',
  },
  {
    category_id: 'ritual_reception_and_experience',
    status: 'requires_new_reception_and_participant_claims',
    theory_ids: [
      'theory_his_minnested_ritual_offentlig_sorg',
      'theory_his_krig_okkupasjon_krigsminne_veteraner_og_ettervirkninger',
      'theory_his_taushet_fravaer',
    ],
    requirement: 'Claims om seremonier, sorgpraksis, veteraner, publikum, bruk, mottakelse og dokumenterte fravær i tillegg til institusjonenes offisielle mandat.',
    reason: 'Minnestedsstatus og læringsmandat dokumenterer ikke alene ritual, offentlig sorg, veteranerfaring eller publikums fortolkning.',
  },
];

const gapReport = {
  schema_version: '1.0',
  report_id: 'history_theory_evidence_gap_inventory_v1',
  subject_id: 'historie',
  status: 'ACTIVE_PRODUCTION_DEPENDENCY_MAP',
  authority_note: 'Rapporten identifiserer dokumenterte produksjonsavhengigheter. Den kvalifiserer ingen teori og skal ikke brukes til å omgå teori-evidenskontrakten.',
  baseline: {
    total_theories: totalTheories,
    qualifying_after_batch_3: qualifyingEntries,
    remaining_theories: totalTheories - qualifyingEntries,
    ratio: registry.completion.ratio,
    universal_status: registry.completion.universal_status,
  },
  source_fingerprints: {
    [path.relative(root, theoriesPath).replaceAll('\\', '/')]: sha256(theoriesPath),
    [path.relative(root, registryPath).replaceAll('\\', '/')]: sha256(registryPath),
    [path.relative(root, claimsPath).replaceAll('\\', '/')]: sha256(claimsPath),
    [path.relative(root, sourcesPath).replaceAll('\\', '/')]: sha256(sourcesPath),
    [path.relative(root, placeEvidencePath).replaceAll('\\', '/')]: sha256(placeEvidencePath),
  },
  categories: gapCategories,
  production_rule: 'Neste batch skal enten bruke et tydelig eget claim-sett som består gjeldende kontrakt, eller først produsere de nye claims, kildene, casene og geografiene som denne rapporten krever.',
};

const gapLines = [
  '# Historie — teori-evidens gap-inventar V1',
  '',
  `Status: **${gapReport.status}**`,
  '',
  gapReport.authority_note,
  '',
  '## Produksjonsstatus etter batch 3',
  '',
  `- Kvalifiserende teoriobjekter: **${qualifyingEntries} av ${totalTheories}**`,
  `- Gjenstående teoriobjekter: **${totalTheories - qualifyingEntries}**`,
  `- Andel: **${Math.round(registry.completion.ratio * 1000) / 10} %**`,
  `- Universell status: **${registry.completion.universal_status}**`,
  '',
  '## Dokumenterte avhengigheter',
  '',
  '| Familie | Status | Eksempelobjekter | Krav før produksjon |',
  '|---|---|---:|---|',
  ...gapCategories.map((category) => `| ${category.category_id} | ${category.status} | ${category.theory_ids.length} | ${category.requirement} |`),
  '',
  '## Produksjonsregel',
  '',
  gapReport.production_rule,
  '',
];
fs.mkdirSync(reportDir, { recursive: true });
writeJson(gapJsonPath, gapReport);
fs.writeFileSync(gapMarkdownPath, `${gapLines.join('\n')}\n`);

let docs = fs.readFileSync(docsPath, 'utf8');
docs = docs.replace(
  'Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. Batch 1 etablerte kontrakten med ti objekter; batch 2 tilfører tolv og bringer produksjonen til 22 av 230. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.',
  'Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. Batch 1 etablerte kontrakten med ti objekter, batch 2 tilføyde tolv, og batch 3 tilfører ti med egne claim-profiler. Produksjonen står dermed på 32 av 230. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.'
);
docs = docs.replace(
  '- Batch 1: **10** kvalifiserende teoriobjekter.\n- Batch 2: **12** nye kvalifiserende teoriobjekter.\n- Totalt: **22 av 230** teoriobjekter (**9,6 %**).\n- Universell status: **INCOMPLETE**.',
  '- Batch 1: **10** kvalifiserende teoriobjekter.\n- Batch 2: **12** nye kvalifiserende teoriobjekter.\n- Batch 3: **10** nye kvalifiserende teoriobjekter med egne claim-profiler.\n- Totalt: **32 av 230** teoriobjekter (**13,9 %**).\n- Universell status: **INCOMPLETE**.\n- Produksjonsavhengigheter: `reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v1.md`.'
);
fs.writeFileSync(docsPath, docs.endsWith('\n') ? docs : `${docs}\n`);

console.log(`Materialized History theory evidence batch 3: +${specs.length}; total=${qualifyingEntries}/${totalTheories}.`);
console.log(`Gap inventory categories: ${gapCategories.length}.`);
