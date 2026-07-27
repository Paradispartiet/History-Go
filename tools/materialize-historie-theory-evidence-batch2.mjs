#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const registryPath = path.join(historyDir, 'theory_evidence_historie_canonical_v1.json');
const theoriesPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const claimsPath = path.join(historyDir, 'claims_historie_canonical_v1.json');
const placeEvidencePath = path.join(historyDir, 'place_evidence_historie_v1.json');
const docsPath = path.join(root, 'docs/HISTORY_THEORY_EVIDENCE.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const A = (value) => Array.isArray(value) ? value : [];
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));

const theories = readJson(theoriesPath);
const registry = readJson(registryPath);
const claimsFile = readJson(claimsPath);
const placeEvidenceFile = readJson(placeEvidencePath);

const theoryById = new Map(A(theories).map((item) => [item.theory_id, item]));
const claimById = new Map(A(claimsFile.claims).map((item) => [item.claim_id, item]));
const evidenceByClaim = new Map(A(placeEvidenceFile.evidence_links).map((item) => [item.claim_id, item]));
const existingIds = new Set(A(registry.entries).map((item) => item.theory_id));

const specs = [
  {
    theory_id: 'theory_his_1814_statsdannelse_kommunalt_selvstyre_lokal_forvaltning_og_politisk_deltakelse',
    claim_ids: [
      'claim_his_eidsvollsbygningen_constitution_1814',
      'claim_his_oslo_radhus_seat_bystyre_byrad',
      'claim_his_oslo_radhus_opened_1950_05_15',
      'claim_his_oslo_radhus_pipervika_transformation',
    ],
    rationale: 'Eidsvollsbygningen dokumenterer den konstitusjonelle rammen for representasjon i 1814, mens Oslo rådhus viser hvordan lokal folkevalgt beslutning, utøvende ledelse og administrasjon senere ble samlet og symbolisert i en kommunal institusjon. Pipervika-omformingen gjør det samtidig mulig å prøve hvordan lokal styring får materielle og sosiale konsekvenser.',
    limitations: [
      '1814-claimet gjelder nasjonal statsdannelse og dokumenterer ikke i seg selv utviklingen av kommunalt selvstyre etter formannskapslovene.',
      'Rådhusets funksjon og arkitektur dokumenterer institusjonalisering, men ikke faktisk valgdeltakelse, representativitet eller lik tilgang til kommunale beslutninger.',
    ],
    alternative_interpretations: [
      'Samlingen av politisk og administrativ virksomhet kan leses som demokratisk tilgjengelighet, men også som sentralisering, monumental makt og styring ovenfra.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom forbindelsen mellom konstitusjonell representasjon og kommunal praksis bare antas, eller dersom et institusjonsbygg behandles som bevis på reell politisk deltakelse.',
    ],
  },
  {
    theory_id: 'theory_his_1814_statsdannelse_nasjonal_identitet_og_historiske_fortellinger',
    claim_ids: [
      'claim_his_eidsvollsbygningen_constitution_1814',
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_oslo_radhus_opened_1950_05_15',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
    ],
    rationale: 'Claimene følger hvordan en konstitusjonell hendelse blir omformet til nasjonalmonument, hvordan Oslo rådhus åpnes i en jubileumsfortelling om byens kontinuitet, og hvordan 22. juli-senteret organiserer en nyere nasjonal fortelling om terror, demokrati og minne. De viser at nasjonal identitet produseres gjennom institusjoner, utvalg og gjentatt historiebruk.',
    limitations: [
      'Casene er norske stats- og minneinstitusjoner og dekker ikke hvordan nasjonale fortellinger mottas av ulike regionale, samiske, minoritets- eller diasporagrupper.',
      'At et sted får monument- eller læringssenterstatus dokumenterer institusjonell historiebruk, men ikke at publikum deler én nasjonal identitet eller fortolkning.',
    ],
    alternative_interpretations: [
      'Stedene kan forstås som samlende demokratiske symboler, men også som arenaer der bestemte aktører, konflikter og tap gis større plass enn andre.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom nasjonal identitet tilskrives publikum uten mottakskilder, eller dersom institusjonenes offisielle fortellinger behandles som sosial konsensus.',
    ],
  },
  {
    theory_id: 'theory_his_middelalder_kirke_kongemakt_kirke_og_konflikt',
    claim_ids: [
      'claim_his_akershus_festning_medieval_state_center',
      'claim_his_hovedoya_kloster_founded_1147',
      'claim_his_hovedoya_kloster_burned_1532_material_trace',
    ],
    rationale: 'Akershus festning og Hovedøya kloster dokumenterer to materielle maktsentre knyttet til kongelig og kirkelig organisering. Klostergrunnleggelsen viser religiøse og europeiske nettverk, mens plyndringen og brannen i 1532 viser at institusjonell og materiell makt ble omformet gjennom konflikt før reformasjonen.',
    limitations: [
      'Tre stedsclaims kan ikke representere hele forholdet mellom kongemakt, kirke, lokalsamfunn og eiendomsregimer i norsk middelalder.',
      'De redigerte steds- og leksikonkildene dokumenterer hovedforløp, men ikke alle aktører, jurisdiksjoner, jordegodsforhold eller konfliktfaser.',
    ],
    alternative_interpretations: [
      'Festning og kloster kan leses som institusjoner for vern og religiøst fellesskap, men også som infrastrukturer for kontroll, ressursforvaltning og sosial rang.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom kongelig og kirkelig makt framstilles som to enhetlige blokker uten dokumenterte forbindelser, forhandlinger eller konflikter i de konkrete casene.',
    ],
  },
  {
    theory_id: 'theory_his_krig_okkupasjon_okkupasjon_og_motstand',
    claim_ids: [
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_villa_grande_gimle_quisling_residence_1941',
      'claim_his_villa_grande_transformed_to_hl_center',
    ],
    rationale: 'Akershus festning dokumenterer okkupasjonsbruk, rettsoppgjør og motstandsminne, mens Villa Grande viser hvordan et bevoktet maktsted for kollaborasjonsregimet senere ble omformet til et forsknings- og læringssted. Sammen prøver casene forholdet mellom okkupasjonsmakt, samarbeid, motstand, etterkrigsoppgjør og senere minnearbeid.',
    limitations: [
      'Evidensen er institusjons- og stedsorientert og dekker ikke bredden i dagligliv, illegal organisering, militær motstand, sivile tilpasninger eller forfølgelse.',
      'Motstand er sterkest dokumentert gjennom Akershus festnings etterkrigsminne; samtidige motstandskilder og aktørperspektiver må til for mer presise forklaringer.',
    ],
    alternative_interpretations: [
      'Stedene kan inngå i en fortelling om nasjonal motstand og demokratisk gjenopprettelse, men kan også synliggjøre samarbeid, autoritær iscenesettelse og omstridte etterkrigsfortolkninger.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom senere minneinstitusjoner brukes som direkte bevis for hva samtidens aktører gjorde eller mente under okkupasjonen.',
    ],
  },
  {
    theory_id: 'theory_his_jubileum_seremoni_historiebruk',
    claim_ids: [
      'claim_his_oslo_radhus_opened_1950_05_15',
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
      'claim_his_akershus_festning_occupation_memory_layers',
    ],
    rationale: 'Oslo rådhus ble åpnet i rammen av byens 900-årsjubileum, Eidsvollsbygningen ble tidlig institusjonalisert som nasjonalmonument, og Akershus festning og 22. juli-senteret organiserer senere nasjonalt minne. Claimene viser hvordan jubileer, monumenter og offentlige institusjoner velger tidslinjer, symboler og fortolkningsrammer.',
    limitations: [
      'Claimene dokumenterer institusjonelle rammer, men gir begrenset informasjon om konkrete seremonier, deltakergrupper, publikumsreaksjoner og ritualenes endring over tid.',
      'Offisiell historiebruk må ikke behandles som representativ for alle lokale, politiske eller berørte gruppers minner.',
    ],
    alternative_interpretations: [
      'Jubileer og minnesteder kan skape demokratisk fellesskap og kunnskap, men også forenkle konflikter og gi staten eller institusjonen kontroll over fortellingens start- og sluttpunkt.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom jubileums- eller minnestedstatus ikke kan knyttes til konkrete valg av fortelling, symbol eller offentlig praksis.',
    ],
  },
  {
    theory_id: 'theory_his_museum_samling_kanon',
    claim_ids: [
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_22_juli_center_documents_attacks_and_democracy',
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_gamle_deichman_main_library_1933_2019',
    ],
    rationale: 'HL-senteret, 22. juli-senteret, museene ved Akershus, Eidsvollsbygningen og Deichmans tidligere hovedbibliotek viser ulike institusjoner som samler, bevarer og formidler materiale og fortellinger. Sammen gjør de det mulig å prøve hvordan samlingsvalg, mandat og institusjonell status former hvilke hendelser, aktører og kunnskapsformer som blir kanoniske.',
    limitations: [
      'Claimene beskriver institusjonenes funksjon og historie, men dokumenterer ikke fullstendige samlingsprofiler, katalogiseringsregler, kassasjon eller konkrete utstillingsvalg.',
      'Bibliotek, museum, monument og læringssenter har forskjellige mandat og kan ikke behandles som én institusjonstype uten analytisk skille.',
    ],
    alternative_interpretations: [
      'Institusjonene kan forstås som demokratisk kunnskapsinfrastruktur, men også som portvoktere som prioriterer bestemte objekter, stemmer og fortellingsformer.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom påstander om kanon og utvalg ikke kan spores til dokumenterte samlings-, katalog- eller formidlingspraksiser.',
    ],
  },
  {
    theory_id: 'theory_his_kulturminneutvelgelse_verdi',
    claim_ids: [
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_22_juli_center_akersgata42_site_connection',
      'claim_his_akershus_festning_occupation_memory_layers',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_gamle_deichman_main_library_1933_2019',
    ],
    rationale: 'Eidsvollsbygningens status som nasjonalmonument, 22. juli-senterets åstedstilknytning, Akershus festnings minnelag, Villa Grandes kritiske ombruk og Deichmans offentlige kunnskapsfunksjon viser at kulturminneverdi skapes gjennom utvelgelse, institusjonalisering, bruk og fortolkning, ikke bare gjennom bygningers alder.',
    limitations: [
      'Registeret dokumenterer ikke komplette fredningsvedtak, vernekriterier, økonomiske prioriteringer eller alle konkurrerende verdivurderinger for stedene.',
      'Nasjonal, lokal, arkitektonisk, sosial og bruksbasert verdi må holdes adskilt; én offisiell status opphever ikke alternative verdisett.',
    ],
    alternative_interpretations: [
      'Utvelgelsen kan verne demokratiske og historiske ressurser, men kan også marginalisere hverdagsmiljøer, ubehagelige spor eller grupper uten sterk institusjonell representasjon.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom kulturminneverdi behandles som iboende uten dokumenterte utvelgelsesprosesser, brukere eller institusjonelle beslutninger.',
    ],
  },
  {
    theory_id: 'theory_his_monument_symbol_makt',
    claim_ids: [
      'claim_his_akershus_festning_medieval_state_center',
      'claim_his_eidsvollsbygningen_national_monument_1837',
      'claim_his_villa_grande_gimle_quisling_residence_1941',
      'claim_his_22_juli_center_akersgata42_site_connection',
    ],
    rationale: 'Akershus festning materialiserte kongelig og administrativ makt, Eidsvollsbygningen ble nasjonalmonument, Villa Grande ble iscenesatt som bevoktet residens for kollaborasjonsregimet, og 22. juli-senterets plassering knytter minnearbeidet til åstedet. Casene viser hvordan bygning, plassering og institusjonell bruk produserer symbolsk autoritet.',
    limitations: [
      'Materiell monumentalitet dokumenterer ikke automatisk hvordan symbolene ble forstått av samtidige eller senere publikum.',
      'Stedene representerer svært ulike regimer, funksjoner og perioder; sammenligningen må avgrenses til mekanismer for iscenesettelse, lokalisering og autoritet.',
    ],
    alternative_interpretations: [
      'De samme stedene kan oppfattes som vern, demokratisk minne eller offentlig læring, men også som demonstrasjoner av kontroll, nasjonal kanon og institusjonell definisjonsmakt.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom symbolsk makt bare utledes av størrelse eller alder uten dokumentert bruk, plassering, ritual eller institusjonell fortolkning.',
    ],
  },
  {
    theory_id: 'theory_his_folkedannelse_arbeideroffentlighet',
    claim_ids: [
      'claim_his_folkets_hus_first_opened_1907',
      'claim_his_folkets_hus_current_complex_1958_1962',
      'claim_his_akerselva_industrial_energy_axis',
      'claim_his_oslo_radhus_seat_bystyre_byrad',
    ],
    rationale: 'Akerselvas industrilandskap dokumenterer produksjonsgrunnlaget for et voksende arbeidsliv, mens Folkets Hus viser hvordan arbeiderbevegelsen bygde møte-, organisasjons-, arkiv- og bibliotekinfrastruktur. Oslo rådhus gir en institusjonell kontrast mellom bevegelsesoffentlighet og kommunal beslutningsmakt.',
    limitations: [
      'Claimene dokumenterer organisasjoner og steder, men ikke bredden i arbeideres lesing, læring, muntlige kultur, kjønnede erfaringer eller uformelle offentligheter.',
      'Folkets Hus kan ikke alene representere hele arbeiderbevegelsen, og kommunal institusjonalisering innebærer ikke automatisk at bevegelsens krav ble innfridd.',
    ],
    alternative_interpretations: [
      'Arbeideroffentligheten kan leses som demokratisk kapasitetsbygging nedenfra, men også som profesjonalisering, sentralisering og avstand mellom organisasjonsledelse og medlemmer.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom møtehus og bibliotek bare registreres som bygninger uten dokumenterte organisasjoner, brukere, praksiser eller forbindelser til arbeidslivet.',
    ],
  },
  {
    theory_id: 'theory_his_industriby_arbeiderliv',
    claim_ids: [
      'claim_his_akerselva_industrial_energy_axis',
      'claim_his_akerselva_environmental_reuse_from_1986',
      'claim_his_folkets_hus_first_opened_1907',
      'claim_his_folkets_hus_current_complex_1958_1962',
    ],
    rationale: 'Akerselva dokumenterer hvordan vannkraft, fabrikker og verksteder formet Christianias industriby, mens Folkets Hus dokumenterer arbeiderbevegelsens organisatoriske infrastruktur. Miljøpark og ombruk viser hvordan industrilandskapet senere ble omformet, slik at produksjon, arbeidsorganisering og etterindustriell byutvikling kan analyseres samlet.',
    limitations: [
      'Claimene har ikke direkte arbeidervitnesbyrd, lønnsdata, boligdata eller detaljerte beskrivelser av kjønn, migrasjon, familie og hverdagsliv.',
      'Akerselvas virksomheter hadde ulike teknologier og arbeidsregimer; én samlet industribyfortelling kan skjule store forskjeller mellom bransjer og perioder.',
    ],
    alternative_interpretations: [
      'Industrialiseringen kan framstilles som vekst og kollektiv organisering, men også som farlig arbeid, klassedelte boområder, forurensning og senere eiendomsdrevet omforming.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom arbeiderliv utledes fra produksjonsanlegg uten kilder til arbeidere, organisasjoner eller sosiale konsekvenser.',
    ],
  },
  {
    theory_id: 'theory_his_bevaring_ombruk_kulturmiljo',
    claim_ids: [
      'claim_his_hovedoya_kloster_burned_1532_material_trace',
      'claim_his_akerselva_environmental_reuse_from_1986',
      'claim_his_gamle_deichman_planned_fotohuset_reuse',
      'claim_his_villa_grande_transformed_to_hl_center',
      'claim_his_bispelokket_demolished_after_bjorvika_tunnel',
    ],
    rationale: 'Hovedøya-ruinen, Akerselvas miljøpark, planlagt ombruk av gamle Deichman, Villa Grandes kritiske omforming og rivningen av Bispelokket viser flere strategier for å bevare, transformere eller fjerne materielle spor. Casene gjør det mulig å analysere kulturmiljø som resultat av selektive inngrep, nye funksjoner og skiftende verneverdier.',
    limitations: [
      'Claimene dokumenterer hovedretningen i omformingen, men ikke komplette byggeprosesser, verneplaner, kostnader, eierskap eller brukerkonflikter.',
      'Bevaring, adaptiv ombruk, restaurering, ruinforvaltning og full riving er ulike inngrep og må ikke samles under én positiv forestilling om gjenbruk.',
    ],
    alternative_interpretations: [
      'Omforming kan forlenge materiell og sosial bruk, men kan også forskjønne konfliktfylte spor, legitimere eiendomsutvikling eller erstatte hverdagsmiljø med kuraterte kulturarenaer.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom nye funksjoner automatisk behandles som bevaring uten dokumentasjon av hvilke materialer, historier og brukergrupper som faktisk videreføres.',
    ],
  },
  {
    theory_id: 'theory_his_sanering_riving_fortrengning',
    claim_ids: [
      'claim_his_oslo_radhus_pipervika_transformation',
      'claim_his_bispelokket_completed_1967_traffic_machine',
      'claim_his_bispelokket_demolished_after_bjorvika_tunnel',
      'claim_his_akerselva_environmental_reuse_from_1986',
    ],
    rationale: 'Rådhusreguleringen dokumenterer sanering og tap av eldre Pipervika-miljø, Bispelokket viser både bygging av en trafikkmaskin og senere riving, og Akerselva viser miljøforbedring og funksjonsendring i tidligere industriområder. Sammen prøver casene hvordan byfornyelse omfordeler plass, tilgjengelighet, miljøgoder og sosial verdi.',
    limitations: [
      'Bare Pipervika-claimet dokumenterer eksplisitt riving av et hverdags- og næringsmiljø; direkte fortrengning ved de andre casene krever eiendoms-, befolknings- og brukerkilder.',
      'Fysiske før-og-etter-forløp dokumenterer ikke alene hvem som vant eller tapte økonomisk, sosialt eller politisk på omformingen.',
    ],
    alternative_interpretations: [
      'Prosjektene kan forstås som institusjonsbygging, trafikkløsning og miljørehabilitering, men også som tap av eksisterende miljøer, barrierer og grunnlag for ekskluderende eiendomsutvikling.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom fortrengning påstås uten dokumenterte berørte grupper, eller dersom all fysisk endring klassifiseres som sanering uavhengig av prosess og konsekvens.',
    ],
  },
];

if (!Array.isArray(registry.entries)) throw new Error('Theory evidence registry entries must be an array.');
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
    return claim;
  });
  const entry = {
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
    ],
    rationale: spec.rationale,
    limitations: spec.limitations,
    alternative_interpretations: spec.alternative_interpretations,
    disconfirmation_conditions: spec.disconfirmation_conditions,
    scope_note: 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, aktørgrupper og kildetyper.',
  };
  registry.entries.push(entry);
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

let docs = fs.readFileSync(docsPath, 'utf8');
docs = docs.replace(
  'Første batch er en `multi_case_geographic_pilot` i Oslo/Akershus. Hvert objekt står derfor samtidig med `universalization_status: provisional_not_universal`. Senere batcher må utvide periode-, geografi-, aktør- og kildetypebredden uten å senke tersklene.',
  'Batchene er `multi_case_geographic_pilot` i Oslo/Akershus. Hvert objekt står derfor samtidig med `universalization_status: provisional_not_universal`. Senere batcher må utvide periode-, geografi-, aktør- og kildetypebredden uten å senke tersklene.'
);
docs = docs.replace(
  'Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. Piloten etablerer kontrakten og de første ti objektene. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.',
  'Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. Batch 1 etablerte kontrakten med ti objekter; batch 2 tilfører tolv og bringer produksjonen til 22 av 230. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.'
);
if (!docs.includes('## Produksjonsstatus')) {
  docs += '\n## Produksjonsstatus\n\n- Batch 1: **10** kvalifiserende teoriobjekter.\n- Batch 2: **12** nye kvalifiserende teoriobjekter.\n- Totalt: **22 av 230** teoriobjekter (**9,6 %**).\n- Universell status: **INCOMPLETE**.\n';
}
fs.writeFileSync(docsPath, docs.endsWith('\n') ? docs : `${docs}\n`);

console.log(`Materialized History theory evidence batch 2: +${specs.length}; total=${qualifyingEntries}/${totalTheories}.`);
