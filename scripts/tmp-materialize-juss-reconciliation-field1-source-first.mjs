#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const writeJson = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith('\n') ? value : `${value}\n`);
};
const readText = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const replaceOnce = (file, needle, replacement) => {
  const current = readText(file);
  if (!current.includes(needle)) throw new Error(`Expected anchor missing in ${file}: ${needle}`);
  writeText(file, current.replace(needle, replacement));
};

const BRIEF = 'data/fag/politikk/juss_rettsvitenskap/legal_method_sources_interpretation_argumentation_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-source-brief-v1-audit.json';
const sources = [
  { id:'jmet01-grunnloven', title:'Kongeriket Norges Grunnlov', publisher:'Lovdata', url:'https://lovdata.no/dokument/NL/lov/1814-05-17', retrieval_status:'verified_2026-08-31' },
  { id:'jmet02-lovteknikk', title:'Veiledning om lov- og forskriftsarbeid', publisher:'Justis- og beredskapsdepartementet', url:'https://www.regjeringen.no/no/dokumenter/veiledning-om-lov--og-forskriftsarbeid/id87536/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet03-utredningsinstruksen', title:'Utredningsinstruksen', publisher:'Finansdepartementet', url:'https://www.regjeringen.no/no/dokumenter/utredningsinstruksen/id3060944/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet04-stortinget-lovvedtak', title:'Om lovvedtak', publisher:'Stortinget', url:'https://www.stortinget.no/no/Stortinget-og-demokratiet/Arbeidet/Om-publikasjonene/Beslutning/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet05-hoyesterett-prejudikat-2025', title:'Innledning til Advokatforum 2025', publisher:'Norges Høyesterett', url:'https://www.domstol.no/no/hoyesterett/om/publikasjoner/artikler/oie/innledning-til-advokatforum-2025/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet06-bardsen-prejudikat', title:'Høyesterett som prejudikatdomstol', publisher:'Norges Høyesterett', url:'https://www.domstol.no/globalassets/upload/hret/artikler-og-foredrag/bardsen---hoyesterett-som-prejudikatdomstol---15032017.pdf', retrieval_status:'verified_2026-08-31' },
  { id:'jmet07-lovdata-avgjorelser', title:'Rettsavgjørelser', publisher:'Lovdata', url:'https://lovdata.no/register/avgj%C3%B8relser', retrieval_status:'verified_2026-08-31' },
  { id:'jmet08-lovdata-rettskilder', title:'Et bredt utvalg av rettskilder', publisher:'Lovdata', url:'https://pro.lovdata.no/rettskilder/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet09-nou2020-rettskilder', title:'NOU 2020: 9 – rettskilder, juridisk metode og subsumsjon', publisher:'Regjeringen.no', url:'https://www.regjeringen.no/no/dokumenter/nou-2020-9/id2723776/?ch=4', retrieval_status:'verified_2026-08-31' },
  { id:'jmet10-nou2019-forvaltningslov', title:'NOU 2019: 5 Ny forvaltningslov', publisher:'Justis- og beredskapsdepartementet', url:'https://www.regjeringen.no/no/dokumenter/nou-2019-5/id2632006/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet11-sivilombudet', title:'God forvaltningsskikk', publisher:'Sivilombudet', url:'https://www.sivilombudet.no/uttalelser-og-rapporter/temasider/god-forvaltningsskikk/', retrieval_status:'verified_2026-08-31' },
  { id:'jmet12-hudoc', title:'HUDOC database', publisher:'European Court of Human Rights', url:'https://www.echr.coe.int/en/hudoc-database', retrieval_status:'verified_2026-08-31' },
  { id:'jmet13-eurlex-case-law', title:'EU case-law', publisher:'EUR-Lex / Publications Office of the European Union', url:'https://eur-lex.europa.eu/collection/eu-law/eu-case-law.html?locale=en', retrieval_status:'verified_2026-08-31' }
];

const topic = (id, title, boundary, source_ids, claims) => ({
  id, title, method_ids:[`met_juss_${id}_a`,`met_juss_${id}_b`], boundary, source_ids,
  planned_claims: claims.map(([claimId,text,claimSources]) => ({ id:claimId, text, source_ids:claimSources, status:'planned_requires_fulltext_verification' }))
});
const topic_briefs = [
  topic('rettskildetyper_og_autoritet','Rettskildetyper, autoritet og rettslig relevans','Rettskilde må skilles fra rettsregel: lovtekst, forarbeider, rettspraksis, forvaltningspraksis, internasjonale kilder og juridisk litteratur kan ha ulik relevans og vekt. Autoritet må begrunnes for rettsspørsmål, jurisdiksjon og tidspunkt; en søketreffliste er ikke en rettskildelære.',['jmet01-grunnloven','jmet07-lovdata-avgjorelser','jmet08-lovdata-rettskilder','jmet12-hudoc','jmet13-eurlex-case-law'],[
    ['jm-01','En juridisk analyse må identifisere hvilken type rettskilde et dokument er før dokumentets betydning for rettsspørsmålet vurderes; lovtekst, dom, forarbeid og veiledning har ikke automatisk samme autoritet.',['jmet08-lovdata-rettskilder','jmet02-lovteknikk']],
    ['jm-02','En rettskilde er ikke identisk med den ferdig formulerte rettsregelen: rettsregelen må utledes gjennom en etterprøvbar vurdering av relevante kilder og deres innbyrdes betydning.',['jmet09-nou2020-rettskilder','jmet08-lovdata-rettskilder']],
    ['jm-03','En rettskildes vekt kan ikke angis løsrevet fra rettsspørsmål og rettssystem; analysen må forklare hvorfor kilden er relevant og hvilken autoritet den har i den aktuelle jurisdiksjonen.',['jmet06-bardsen-prejudikat','jmet12-hudoc','jmet13-eurlex-case-law']],
    ['jm-04','Tilgang til mange dokumenttyper forbedrer etterprøvbarheten, men søkbarhet eller publisering alene gjør ikke et dokument bindende; dokumenttype, avsender, status og versjon må kontrolleres.',['jmet07-lovdata-avgjorelser','jmet08-lovdata-rettskilder']]
  ]),
  topic('rettssporsmal_regelformulering_og_argument','Rettsspørsmål, regelformulering og juridisk argumentasjon','Juridisk argumentasjon skal skille rettsspørsmål, rettsregel, kildestøtte og konklusjon. Analysen må angi jurisdiksjon og tidsversjon og må ikke presentere politisk ønskelighet, moralsk argument eller partsinteresse som om det alene avgjør gjeldende rett.',['jmet01-grunnloven','jmet09-nou2020-rettskilder','jmet05-hoyesterett-prejudikat-2025'],[
    ['jm-05','Et rettsspørsmål bør formuleres slik at det kan kobles til en bestemt rettslig norm, kompetanse, rettighet eller plikt, og analysen bør angi hvilket tidspunkt og hvilken jurisdiksjon vurderingen gjelder.',['jmet01-grunnloven','jmet08-lovdata-rettskilder']],
    ['jm-06','Regelformulering og subsumsjon er forskjellige analytiske operasjoner: først må det rettslige innholdet identifiseres, deretter vurderes om de relevante fakta faller innenfor regelen.',['jmet09-nou2020-rettskilder','jmet10-nou2019-forvaltningslov']],
    ['jm-07','Når offentlig myndighet hevdes å kunne gripe inn eller pålegge plikter, må analysen identifisere rettslig kompetanse eller hjemmel og ikke nøye seg med et politisk formål eller en administrativ praksis.',['jmet01-grunnloven','jmet10-nou2019-forvaltningslov']],
    ['jm-08','En juridisk konklusjon bør vise hvilke kilder og tolkningssteg som bærer resultatet, slik at uenighet kan lokaliseres til rettskildevalg, tolkning, faktum eller subsumsjon.',['jmet09-nou2020-rettskilder','jmet05-hoyesterett-prejudikat-2025']]
  ]),
  topic('lovtolkning_ordlyd_kontekst_formal_forarbeider','Lovtolkning: ordlyd, kontekst, formål og forarbeider','Ordlyd er et nødvendig tolkningspunkt, men tekst må leses i rettslig kontekst. Formål og forarbeider kan belyse tolkningen, men forarbeider er ikke vedtatt lovtekst og må knyttes til den bestemmelsen og lovversjonen som faktisk ble vedtatt.',['jmet02-lovteknikk','jmet03-utredningsinstruksen','jmet04-stortinget-lovvedtak','jmet10-nou2019-forvaltningslov'],[
    ['jm-09','Lovtolkning starter med den relevante ordlyden og dens rettslige kontekst, men meningsinnholdet kan kreve vurdering av struktur, formål og andre rettskilder når teksten ikke alene løser spørsmålet.',['jmet02-lovteknikk','jmet10-nou2019-forvaltningslov']],
    ['jm-10','Forarbeider kan forklare bakgrunn, formål og lovgivers overveielser, men må ikke presenteres som om de selv var den vedtatte lovteksten.',['jmet02-lovteknikk','jmet04-stortinget-lovvedtak']],
    ['jm-11','Et forarbeidsutsagn må kobles til riktig lovforslag og den teksten Stortinget faktisk vedtok, fordi proposisjon, komitéinnstilling og lovvedtak er ulike dokumentstadier.',['jmet04-stortinget-lovvedtak','jmet03-utredningsinstruksen']],
    ['jm-12','Uklar ordlyd gir ikke fri adgang til å velge ønsket politikk som rettsregel; analysen må synliggjøre hvilke rettskilder som trekker i hvilke retninger og hvorfor ett tolkningsresultat foretrekkes.',['jmet02-lovteknikk','jmet09-nou2020-rettskilder']]
  ]),
  topic('prejudikat_rettspraksis_og_overforingsverdi','Prejudikat, rettspraksis og overføringsverdi','En dom må analyseres gjennom rettsspørsmål, premisser og overføringsverdi, ikke bare resultatet. Høyesteretts prejudikatfunksjon må skilles fra konkret bevisvurdering, og senere rettsutvikling kan påvirke rekkevidden av eldre prejudikater.',['jmet05-hoyesterett-prejudikat-2025','jmet06-bardsen-prejudikat','jmet07-lovdata-avgjorelser'],[
    ['jm-13','Høyesterett beskriver seg som en prejudikatdomstol med en sentral oppgave i rettsavklaring og rettsutvikling, noe som gjør prinsipielle rettsspørsmål og overføringsverdi sentrale i vurderingen av avgjørelsers betydning.',['jmet05-hoyesterett-prejudikat-2025','jmet06-bardsen-prejudikat']],
    ['jm-14','Et domsresultat alene er utilstrekkelig som prejudikatanalyse; den juridiske argumentasjonen må identifisere hvilket rettsspørsmål retten avgjorde og hvilke premisser som bar løsningen.',['jmet06-bardsen-prejudikat','jmet07-lovdata-avgjorelser']],
    ['jm-15','Konkrete bevis- og faktavurderinger må skilles fra generelle rettslige premisser når man vurderer om en avgjørelse har overføringsverdi til andre saker.',['jmet05-hoyesterett-prejudikat-2025','jmet09-nou2020-rettskilder']],
    ['jm-16','Prejudikater kan utvikles eller i særtilfeller fravikes, men analysen må forklare senere rettskilder og hensyn til forutberegnelighet og likebehandling fremfor å behandle gammel praksis som enten evig bindende eller fritt ignorerbar.',['jmet06-bardsen-prejudikat','jmet01-grunnloven']]
  ]),
  topic('lovgivningsprosess_og_forarbeidsstatus','Lovgivningsprosess og forarbeidsstatus','Forslag, høring, proposisjon, komitéinnstilling, lovvedtak, sanksjon og ikrafttredelse er forskjellige steg. Analysen må skille dokumentenes funksjon og tidspunkt og aldri omtale et forslag som gjeldende lov før nødvendig vedtak og ikrafttredelse.',['jmet02-lovteknikk','jmet03-utredningsinstruksen','jmet04-stortinget-lovvedtak'],[
    ['jm-17','Norske lovsaker går gjennom flere dokumenterte stadier, og et lovvedtak er teksten Stortinget har vedtatt etter behandlingen; et tidligere forslag må derfor ikke forveksles med den endelige loven.',['jmet04-stortinget-lovvedtak','jmet02-lovteknikk']],
    ['jm-18','Utrednings- og lovforberedelsesdokumenter skal belyse behov, virkninger og prinsipielle spørsmål, men deres rolle som beslutningsgrunnlag må skilles fra den senere rettslige statusen til vedtatte regler.',['jmet03-utredningsinstruksen','jmet02-lovteknikk']],
    ['jm-19','Komitéinnstilling, lovvedtak og senere kunngjort lov er dokumenter med ulike funksjoner; juridisk kildebruk må angi hvilket stadium som siteres og hva dokumentet kan støtte.',['jmet04-stortinget-lovvedtak','jmet08-lovdata-rettskilder']],
    ['jm-20','Når lovgivningen endres, må argumentasjonen kontrollere ikrafttredelse og overgang mellom gammel og ny regel før kilder fra reformprosessen brukes til å beskrive gjeldende rett.',['jmet03-utredningsinstruksen','jmet10-nou2019-forvaltningslov']]
  ]),
  topic('faktum_bevis_og_subsumsjon','Faktum, bevis og subsumsjon','Faktum, bevisvurdering og rettslig norm skal holdes analytisk atskilt. Subsumsjon anvender en utledet rettsregel på et faktisk grunnlag; usikkerhet om fakta må ikke skjules som tolkningsuenighet, og rettslig uenighet må ikke fremstilles som et rent bevisspørsmål.',['jmet05-hoyesterett-prejudikat-2025','jmet09-nou2020-rettskilder','jmet10-nou2019-forvaltningslov'],[
    ['jm-21','Juridisk analyse må skille mellom hva som har skjedd, hvilke bevis som støtter faktum, hvilken rettsregel som gjelder og hvordan regelen anvendes på faktum.',['jmet09-nou2020-rettskilder','jmet05-hoyesterett-prejudikat-2025']],
    ['jm-22','Subsumsjon er den konkrete anvendelsen av rettsregelen på faktum og må ikke forveksles med selve tolkningen eller formuleringen av den generelle regelen.',['jmet09-nou2020-rettskilder','jmet10-nou2019-forvaltningslov']],
    ['jm-23','Usikkerhet i bevisbildet bør synliggjøres som faktisk usikkerhet når den er det, fremfor å flyttes inn i en påstått rettskildekonflikt.',['jmet05-hoyesterett-prejudikat-2025','jmet07-lovdata-avgjorelser']],
    ['jm-24','En etterprøvbar subsumsjon bør vise hvilke rettslig relevante faktiske trekk som er lagt til grunn og hvorfor de oppfyller eller ikke oppfyller vilkårene i regelen.',['jmet09-nou2020-rettskilder','jmet10-nou2019-forvaltningslov']]
  ]),
  topic('hierarki_kollisjon_og_flerniva_rett','Hierarki, kollisjon og flernivårett','Lex superior, lex specialis og lex posterior er ikke mekaniske fasitsvar. Før kollisjonsprinsipper brukes må normenes virkeområde, rang, tid, jurisdiksjon og forhold til konstitusjonelle, menneskerettslige og europeiske kilder avklares.',['jmet01-grunnloven','jmet12-hudoc','jmet13-eurlex-case-law','jmet06-bardsen-prejudikat'],[
    ['jm-25','Grunnloven er overordnet ordinær lov i norsk rett, men en konkret grunnlovsanalyse krever fortsatt identifikasjon og tolkning av den relevante grunnlovsbestemmelsen og dens rettslige kontekst.',['jmet01-grunnloven','jmet06-bardsen-prejudikat']],
    ['jm-26','EMD- og EU-domstolspraksis må hentes fra de respektive rettssystemenes autoritative databaser og brukes med eksplisitt forklaring av hvilket rettslig bindeledd som gjør kilden relevant for det norske spørsmålet.',['jmet12-hudoc','jmet13-eurlex-case-law']],
    ['jm-27','Kollisjonsprinsipper som lex superior, lex specialis og lex posterior forutsetter først at normene faktisk gjelder samme spørsmål og at deres rang, spesialitet og tidsforhold er avklart.',['jmet01-grunnloven','jmet09-nou2020-rettskilder']],
    ['jm-28','En avgjørelse eller regel fra en annen jurisdiksjon er ikke automatisk norsk autoritet; komparativ bruk må skilles fra rettslig bindende eller inkorporert internasjonal og europeisk rett.',['jmet12-hudoc','jmet13-eurlex-case-law','jmet08-lovdata-rettskilder']]
  ]),
  topic('versjonering_sporbarhet_og_ansvarlig_formidling','Versjonering, sporbarhet og ansvarlig juridisk formidling','Juridiske påstander må være tids- og jurisdiksjonsfestet, kildesporbare og versjonsbevisste. Offisiell tekst må skilles fra sammendrag og uoffisiell oversettelse, og undervisningsmateriale skal forklare usikkerhet uten å bli personlig rettsrådgivning.',['jmet01-grunnloven','jmet07-lovdata-avgjorelser','jmet08-lovdata-rettskilder','jmet12-hudoc'],[
    ['jm-29','En påstand om gjeldende rett må kontrolleres mot riktig tidsversjon av lov eller praksis, fordi senere endringer kan gjøre en ellers korrekt kilde historisk i stedet for aktuell.',['jmet01-grunnloven','jmet08-lovdata-rettskilder']],
    ['jm-30','Juridisk kildehenvisning bør gjøre originalkilden inspiserbar og skille originaltekst fra sammendrag eller uoffisiell oversettelse, særlig ved internasjonal rettspraksis.',['jmet12-hudoc','jmet07-lovdata-avgjorelser']],
    ['jm-31','Claim-level sporbarhet gjør det mulig å kontrollere om en konkret juridisk påstand faktisk støttes av de oppgitte kildene og om argumentasjonen har hoppet over et nødvendig tolknings- eller subsumsjonssteg.',['jmet08-lovdata-rettskilder','jmet09-nou2020-rettskilder']],
    ['jm-32','Et juridisk læreverk bør markere rettslig usikkerhet, endringsdato og avgrensning og skal ikke gjøre generell undervisning om kilder og metode om til individuell juridisk rådgivning.',['jmet03-utredningsinstruksen','jmet11-sivilombudet']]
  ])
];

const sourceBrief = {
  schema:'history_go_juss_rettsvitenskap_legal_method_sources_interpretation_argumentation_source_claim_brief_v1',
  version:'1.0.0', updated_at:'2026-08-31', status:'source_first_ready_not_materialized',
  subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap',
  domain:{ ordinal:1, id:'juridisk_metode_rettskilder_tolkning_argumentasjon', title:'Juridisk metode, rettskilder, tolkning og rettslig argumentasjon', production_mode:'new_production_required' },
  source_strategy:{ source_first:true, inspectable_urls_required:true, claim_level_trace_required:true, minimum_sources_per_claim:2, fulltext_materialization_required_before_counting:true, primary_or_institutional_sources_preferred:true, jurisdiction_and_time_scope_required:true, legal_source_is_not_legal_rule:true, interpretation_is_not_subsumption:true, precedent_reasoning_not_outcome_only:true, preparatory_works_are_not_enacted_law:true, conflict_maxims_are_not_automatic:true, source_version_required:true, legal_education_is_not_personal_legal_advice:true },
  sources, topic_briefs,
  planned_assessments: [
    {id:'assess-jm-01',title:'Klassifiser rettskilden før du vekter den',claim_ids:['jm-01','jm-02','jm-03','jm-04']},
    {id:'assess-jm-02',title:'Formuler rettsspørsmål og regel separat',claim_ids:['jm-05','jm-06','jm-07','jm-08']},
    {id:'assess-jm-03',title:'Tolk lovtekst uten å gjøre forarbeid til lov',claim_ids:['jm-09','jm-10','jm-11','jm-12']},
    {id:'assess-jm-04',title:'Finn prejudikatets rettslige premiss',claim_ids:['jm-13','jm-14','jm-15','jm-16']},
    {id:'assess-jm-05',title:'Skille lovforslag fra gjeldende lov',claim_ids:['jm-17','jm-18','jm-19','jm-20']},
    {id:'assess-jm-06',title:'Skill faktum, bevis, regel og subsumsjon',claim_ids:['jm-21','jm-22','jm-23','jm-24']},
    {id:'assess-jm-07',title:'Løs en normkollisjon uten mekaniske maksimer',claim_ids:['jm-25','jm-26','jm-27','jm-28']},
    {id:'assess-jm-08',title:'Versjoner og spor en juridisk påstand',claim_ids:['jm-29','jm-30','jm-31','jm-32']}
  ],
  decision_scenarios: [
    {id:'case-jm-01',title:'Proposisjon eller vedtatt lov?',source_ids:['jmet02-lovteknikk','jmet04-stortinget-lovvedtak'],prompt:'En tekst i en proposisjon avviker fra lovvedtaket. Hvilken tekst beskriver vedtatt regel, og hvordan kan proposisjonen fortsatt brukes?'},
    {id:'case-jm-02',title:'Domsslutning eller prejudikatpremiss?',source_ids:['jmet05-hoyesterett-prejudikat-2025','jmet06-bardsen-prejudikat'],prompt:'To saker har likt resultat, men ulike rettslige premisser. Hva må sammenlignes før den første dommen brukes som prejudikat?'},
    {id:'case-jm-03',title:'Tolkning eller subsumsjon?',source_ids:['jmet09-nou2020-rettskilder','jmet10-nou2019-forvaltningslov'],prompt:'Partene er enige om regelen, men uenige om faktum faller inn under vilkåret. Hvilken analytisk operasjon er omstridt?'},
    {id:'case-jm-04',title:'Gammel lovversjon i nytt spørsmål',source_ids:['jmet01-grunnloven','jmet08-lovdata-rettskilder'],prompt:'En kilde er autentisk, men bestemmelsen er senere endret. Hvordan skal påstanden tidsfestes og reverifiseres?'},
    {id:'case-jm-05',title:'HUDOC-treff som norsk rettskilde',source_ids:['jmet12-hudoc','jmet01-grunnloven'],prompt:'En EMD-dom ser relevant ut. Hvilke steg kreves før den brukes i en norsk juridisk argumentasjon?'},
    {id:'case-jm-06',title:'God forvaltningsskikk og lovtekst',source_ids:['jmet11-sivilombudet','jmet10-nou2019-forvaltningslov'],prompt:'En handling bryter en ulovfestet norm for god forvaltningsskikk, men ingen uttrykkelig lovbestemmelse er identifisert. Hvordan må normtype og rettslig betydning beskrives?'}
  ]
};
writeJson(BRIEF, sourceBrief);

const domains = [
  ['juridisk_metode_rettskilder_tolkning_argumentasjon','legal-method-sources-interpretation-argumentation'],
  ['statsrett_grunnlov_maktfordeling_konstitusjonell_kontroll','constitutional-law-separation-powers-constitutional-review'],
  ['forvaltningsrett_myndighetsutovelse_saksbehandling_klage','administrative-law-public-authority-procedure-appeal'],
  ['menneskerettigheter_emk_rettighetsvern','human-rights-echr-rights-protection'],
  ['eu_eos_folkerett_internasjonale_rettskilder','eu-eea-public-international-law-international-sources'],
  ['strafferett_ansvar_skyld_straffebud_reaksjoner','criminal-law-liability-culpability-offences-sanctions'],
  ['rettergang_bevis_sivilprosess_straffeprosess','procedure-evidence-civil-criminal-process'],
  ['avtaler_obligasjoner_kontraktsrett','contracts-obligations-contract-law'],
  ['erstatning_tingsrett_formuesrett_rettsvern','tort-property-private-law-priority-protection'],
  ['familie_barn_arv_personrett','family-child-inheritance-person-law'],
  ['arbeids_selskaps_naerings_skatt_markedsrett','labour-company-business-tax-market-law'],
  ['rettssystem_rettstilgang_profesjonsetikk_digital_rett','legal-system-access-justice-professional-ethics-digital-law']
].map(([domainId,slug],index) => {
  const prefix = slug.replaceAll('-','_');
  return {
    ordinal:index+1, domainId, slug,
    sourceBrief:`data/fag/politikk/juss_rettsvitenskap/${prefix}_source_claim_brief_v1.json`,
    sourceBriefScript:`scripts/brief-juss-rettsvitenskap-${slug}-sources-v1.mjs`,
    sourceBriefTest:`tests/juss-rettsvitenskap-${slug}-source-brief-v1.test.mjs`,
    fulltextMaterializer:`scripts/materialize-juss-rettsvitenskap-${slug}-fulltext-v1.mjs`,
    fulltextAudit:`scripts/audit-juss-rettsvitenskap-${slug}-fulltext-v1.mjs`,
    fulltextTest:`tests/juss-rettsvitenskap-${slug}-fulltext-v1.test.mjs`
  };
});
domains[0].sourceBrief = BRIEF;

writeJson('.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json', {
  version:1, subject:'juss_rettsvitenskap', ownerSubject:'politikk', canonicalSubcategoryId:'juss_rettsvitenskap', totalDomains:12,
  ci:{ changeTokens:['/juss_rettsvitenskap/','juss-rettsvitenskap-','juss_rettsvitenskap'], progress:{kind:'registered_chapter_count',source:'data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json',pointer:['progress','materializedDomains']}, cumulativeAudits:['scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs'], cumulativeTests:['tests/juss-rettsvitenskap-reconciliation-v1.test.mjs'], deterministicPaths:['data/fag/politikk/juss_rettsvitenskap','reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json',REPORT] },
  strictCompletion:{ bindings:'data/fag/politikk/juss_rettsvitenskap/legal_system_access_justice_professional_ethics_digital_law_source_claim_brief_v1.json', audit:'scripts/audit-juss-rettsvitenskap-legal-system-access-justice-professional-ethics-digital-law-fulltext-v1.mjs', auditTest:'tests/juss-rettsvitenskap-legal-system-access-justice-professional-ethics-digital-law-fulltext-v1.test.mjs', materializer:'scripts/materialize-juss-rettsvitenskap-legal-system-access-justice-professional-ethics-digital-law-fulltext-v1.mjs', completionTest:'tests/juss-rettsvitenskap-legal-system-access-justice-professional-ethics-digital-law-fulltext-v1.test.mjs', auditReport:'reports/fagverk/juss-rettsvitenskap-legal-system-access-justice-professional-ethics-digital-law-fulltext-v1-audit.json', completionReport:'reports/fagverk/juss-rettsvitenskap-legal-system-access-justice-professional-ethics-digital-law-fulltext-v1-audit.json' },
  domains
});

writeJson('data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json', {
  schema:'history_go_canonical_subcategory_production_registry_v1', version:'1.0.0', updated_at:'2026-08-31', owner_subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', status:'domain_1_source_first_ready',
  progress:{materializedDomains:0,totalDomains:12,strictCompletionProven:false},
  rules:{subcategory_is_not_top_level_subject:true,existing_owner_content_is_not_moved_or_deleted:true,reuse_requires_explicit_strict_upgrade:true,secondary_links_do_not_count_as_materialized:true,source_brief_does_not_count_as_materialized:true,complete_requires_all_domains_and_strict_proof:true,legal_claims_require_jurisdiction_and_time_scope:true,legal_sources_must_be_distinguished_by_authority:true,interpretation_and_subsumption_must_be_distinguished:true,legal_education_is_not_personal_legal_advice:true},
  next_gate:'legal_method_sources_interpretation_argumentation_fulltext', materialized:[]
});

const reconciliation = {
  schema:'history_go_juss_rettsvitenskap_reconciliation_v1', version:'1.0.0', updated_at:'2026-08-31', owner_subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', status:'reconciliation_complete_domain_1_source_first_ready',
  production_plan:{materialized:0,source_first_ready:1,next_domain:'juridisk_metode_rettskilder_tolkning_argumentasjon',strict_completion_proven:false},
  classification_summary:{reuse_with_expansion:1,new_production_required:11,move:0},
  domains: domains.map((row,index) => ({ordinal:row.ordinal,domain_id:row.domainId,label:[
    'Juridisk metode, rettskilder, tolkning og rettslig argumentasjon','Statsrett, Grunnloven, maktfordeling og konstitusjonell kontroll','Forvaltningsrett, myndighetsutøvelse, saksbehandling og klage','Menneskerettigheter, EMK og rettighetsvern','EU/EØS-rett, folkerett og internasjonale rettskilder','Strafferett: ansvar, skyld, straffebud og reaksjoner','Rettergang, bevis, sivilprosess og straffeprosess','Avtaler, obligasjoner og kontraktsrett','Erstatning, tingsrett, formuesrett og rettsvern','Familie-, barne-, arve- og personrett','Arbeids-, selskaps-, nærings-, skatte- og markedsrett','Rettssystem, rettstilgang, profesjonsetikk og digital rett'
  ][index],classification:index===1 ? 'reuse_with_expansion' : 'new_production_required'})),
  findings:[
    {path:'data/fag/politikk/fagkart_politikk_canonical_v4_5.json#rett_lov_rettssikkerhet',classification:'reuse_with_expansion',decision:'Det eksisterende Politikk-domenet for rett, lov og rettssikkerhet bevares og kan støtte statsrett/rettsstat, men teller ikke som Juss-fulltekst før juridisk metode, primærkilder og claim-spor er strengt oppgradert.'},
    {path:'data/fag/politikk/emner_politikk_canonical_v4_5.json',classification:'secondary_link',decision:'Eksisterende emner om rettsstat, domstoler, rettigheter, politi, forvaltningsvedtak og lovendringer forblir Politikk-eide støtteemner.'},
    {path:'data/fag/politikk/methods_politikk_canonical_v4_5.json',classification:'secondary_link',decision:'Eksisterende rettslig analyse, rettighetsanalyse og forvaltningsanalyse kan sekundærbindes, men erstatter ikke en selvstendig juridisk metode- og rettskildelære.'},
    {path:'data/fag/politikk/politikkpensum_canonical_v4_5.json#rett_lov_rettssikkerhet',classification:'secondary_link',decision:'Politikkpensumets complete_revised-status dokumenterer politisk-institusjonell kvalitet, ikke ferdigstilt rettsvitenskap.'},
    {path:'reports/politikk-canonical-migration/rett-lov-vertical-chain.md',classification:'reuse',decision:'Den eksisterende kvalitetsrekkefølgen ekstern rettskilde → claim_basis → hjemmel/prosess → kritisk distinksjon bevares som støtteprinsipp.'},
    {path:'tools/validate-politikk-rett-vertical.mjs',classification:'reuse',decision:'Eksisterende vertikal validator bevares uendret som Politikk-gate og flyttes ikke inn i Juss.'},
    {path:'data/categories/category_contract.json#canonicalSubcategories.politikk.juss_rettsvitenskap',classification:'reuse',decision:'Canonical underkategori-ID og owner subject Politikk beholdes; status forblir expansion_planned til alle Juss-felt og strict proof er materialisert.'},
    {path:'data/fag/politikk/concepts_politikk_canonical_v1.json',classification:'secondary_link',decision:'Rettstatlige og institusjonelle begreper kan støtte juridisk kontekst, men juridiske rettsregler må spores til eksterne rettskilder.'},
    {path:'data/fag/politikk/curriculum_architecture_politikk_v1.json',classification:'secondary_link',decision:'Politikkens curriculum-arkitektur kan støtte progresjon, men oppretter ikke Juss-eierskap eller materialiserte rettsområder.'},
    {path:'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',classification:'secondary_link',decision:'Eksisterende mappings beholdes og kan brukes som secondary bindings uten å telle som Juss-domener.'}
  ],
  move_decision:{move_existing_files:[]},
  prohibited_actions:[
    'Ikke slette eller flytte eksisterende Politikk-filer for å bygge Juss & rettsvitenskap.',
    'Ikke telle Politikk-hooks, secondary links, source briefs eller juridiske nøkkelord som materialisert rettsvitenskap.',
    'Ikke bruke politiske mål, moralske vurderinger eller teoretikernavn som erstatning for rettskilder og juridisk argumentasjon.',
    'Ikke presentere lovforslag, høringsnotat eller forarbeid som om det var vedtatt og ikraftsatt lov.',
    'Ikke blande tolkning, bevisvurdering og subsumsjon uten å vise hvilket analytisk steg som gjøres.',
    'Ikke gi individuell juridisk rådgivning eller late som et undervisningscase avgjør en konkret brukers rettsstilling.'
  ]
};
writeJson('reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json', reconciliation);

const sourceAuditReport = {
  schema:'history_go_juss_rettsvitenskap_legal_method_sources_interpretation_argumentation_source_brief_audit_v1', version:'1.0.0', updated_at:'2026-08-31', status:'pass', conclusion:'legal_method_sources_interpretation_argumentation_source_first_ready_not_materialized', subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', domain_id:'juridisk_metode_rettskilder_tolkning_argumentasjon',
  counts:{sources:13,topics:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6,materializedDomains:0,targetDomains:12},
  gates:{ownership:true,sourceFirst:true,allSourcesInspectable:true,allSourcesVerified:true,eightTopics:true,thirtyTwoMultiSourceClaims:true,allSourcesUsed:true,eightAssessments:true,sixScenarios:true,legalSourceVsRuleBoundary:true,interpretationVsSubsumptionBoundary:true,precedentReasoningBoundary:true,preparatoryWorksBoundary:true,hierarchyConflictBoundary:true,versionJurisdictionBoundary:true,noPersonalLegalAdvice:true,notMaterialized:true},
  six_part_quality_review:{correctness_and_evidence:5,coverage_and_completion:4,disciplinary_editorial_quality:5,technical_integrity:5,safety_and_responsibility:5,maintainability_and_auditability:5,total:29,maximum:30,note:'Source-first-feltet etablerer juridisk metode med 32 fler-kildeclaims og eksplisitte grenser mellom rettskilde, rettsregel, tolkning, subsumsjon, prejudikat, lovforarbeid og flernivårett. Feltet teller ikke som materialisert før fulltekst og claimtrace er strengt verifisert.'}
};
writeJson(REPORT, sourceAuditReport);

writeText('scripts/brief-juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-sources-v1.mjs', `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const B='${BRIEF}', R='${REPORT}';
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const assert=(c,m)=>{if(!c)throw new Error(m)};
export function audit(){
 const b=read(B), r=read(R); const claims=b.topic_briefs.flatMap(t=>t.planned_claims||[]); const ids=new Set(b.sources.map(s=>s.id)); const used=new Set(claims.flatMap(c=>c.source_ids||[]));
 assert(b.status==='source_first_ready_not_materialized','Source-first status mangler');
 assert(b.subject_id==='politikk'&&b.canonical_subcategory_id==='juss_rettsvitenskap'&&b.domain?.ordinal===1&&b.domain?.id==='juridisk_metode_rettskilder_tolkning_argumentasjon','Canonicalt Juss-eierskap er feil');
 assert(b.sources.length===13&&ids.size===13&&b.sources.every(s=>s.url.startsWith('https://')&&s.retrieval_status==='verified_2026-08-31'),'13 verifiserte inspectable kilder kreves');
 assert(b.topic_briefs.length===8&&claims.length===32&&new Set(claims.map(c=>c.id)).size===32,'8 emner og 32 unike claims kreves');
 assert(claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids?.length>=2&&c.source_ids.every(id=>ids.has(id))),'Alle claims må ha minst to gyldige kilder');
 assert([...ids].every(id=>used.has(id)),'Alle 13 kilder må brukes i claimsettet');
 assert(b.planned_assessments?.length===8&&b.decision_scenarios?.length===6,'8 vurderinger og 6 case kreves');
 const st=b.source_strategy||{}; for(const key of ['source_first','inspectable_urls_required','claim_level_trace_required','fulltext_materialization_required_before_counting','jurisdiction_and_time_scope_required','legal_source_is_not_legal_rule','interpretation_is_not_subsumption','precedent_reasoning_not_outcome_only','preparatory_works_are_not_enacted_law','conflict_maxims_are_not_automatic','source_version_required','legal_education_is_not_personal_legal_advice']) assert(st[key]===true,'Strict source-strategi mangler: '+key);
 const boundaries=b.topic_briefs.map(t=>t.boundary).join(' ');
 assert(/Rettskilde.*rettsregel/u.test(boundaries)&&/Subsumsjon|subsumsjon/u.test(boundaries)&&/prejudikat/u.test(boundaries)&&/forarbeid/u.test(boundaries)&&/Lex superior/u.test(boundaries)&&/versjon/u.test(boundaries),'Juridiske metodegrenser er ufullstendige');
 assert(r.status==='pass'&&r.counts?.sources===13&&r.counts?.plannedClaims===32&&r.counts?.materializedDomains===0&&r.gates?.notMaterialized===true,'Auditrapport har feil source-first state');
 assert(r.six_part_quality_review?.total>=27,'Kvalitetsport feiler');
 return r;
}
try{const r=audit();console.log('Juss felt 1 source-first OK: '+r.counts.sources+' kilder, '+r.counts.topics+' emner, '+r.counts.plannedClaims+' claims, 0/12 materialisert.')}catch(e){console.error('Juss felt 1 source-first FEIL: '+e.message);process.exitCode=1;}
`);

writeText('tests/juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-source-brief-v1.test.mjs', `import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { audit } from '../scripts/brief-juss-rettsvitenskap-legal-method-sources-interpretation-argumentation-sources-v1.mjs';\ntest('Juss felt 1 source-first er strengt kilde- og metodebundet uten materialisering',()=>{const r=audit();assert.equal(r.status,'pass');assert.deepEqual(r.counts,{sources:13,topics:8,plannedClaims:32,plannedAssessments:8,decisionScenarios:6,materializedDomains:0,targetDomains:12});assert.equal(r.gates.notMaterialized,true);assert.equal(r.six_part_quality_review.total,29);});\n`);

writeText('scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs', `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'); const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')); const assert=(c,m)=>{if(!c)throw new Error(m)};
export function audit(){
 const category=read('data/categories/category_contract.json'), registry=read('data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json'), ci=read('.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json'), report=read('reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json'), brief=read('${BRIEF}');
 const sub=category.canonicalSubcategories?.politikk?.find(r=>r.id==='juss_rettsvitenskap');
 assert(sub?.status==='expansion_planned','Juss skal forbli expansion_planned før strict completion');
 assert(registry.owner_subject_id==='politikk'&&registry.canonical_subcategory_id==='juss_rettsvitenskap','Registry-eierskap er feil');
 assert(registry.progress.materializedDomains===0&&registry.progress.totalDomains===12&&registry.progress.strictCompletionProven===false&&registry.materialized.length===0,'Juss skal starte 0/12 uten materialiserte felt');
 assert(registry.next_gate==='legal_method_sources_interpretation_argumentation_fulltext','Neste gate må være Felt 1 fulltekst');
 assert(ci.subject==='juss_rettsvitenskap'&&ci.ownerSubject==='politikk'&&ci.domains.length===12&&ci.domains.every((r,i)=>r.ordinal===i+1)&&new Set(ci.domains.map(r=>r.domainId)).size===12,'CI-register må dekke 12 unike Juss-felt');
 assert(report.production_plan.materialized===0&&report.production_plan.source_first_ready===1&&report.production_plan.next_domain===ci.domains[0].domainId&&report.production_plan.strict_completion_proven===false,'Reconciliation-fremdrift er feil');
 assert(report.domains.length===12&&report.domains.every((r,i)=>r.ordinal===i+1&&r.domain_id===ci.domains[i].domainId),'Reconciliation og CI-rekkefølge avviker');
 assert(report.domains.filter(r=>r.classification==='reuse_with_expansion').length===1&&report.domains.filter(r=>r.classification==='new_production_required').length===11,'Juss reconciliation skal ha 1 reuse_with_expansion + 11 nyproduksjon');
 assert(report.move_decision?.move_existing_files?.length===0,'Eksisterende Politikk-eierfiler skal ikke flyttes');
 assert(report.findings.some(r=>r.path.includes('rett_lov_rettssikkerhet')&&r.classification==='reuse_with_expansion'),'Eksisterende rett/lov/rettssikkerhet-spor må være eksplisitt gjenbruksbro');
 assert(report.findings.some(r=>r.path.includes('methods_politikk')&&r.classification==='secondary_link'),'Politikk-metoder må være secondary support');
 assert(report.prohibited_actions.some(s=>/lovforslag/u.test(s))&&report.prohibited_actions.some(s=>/juridisk rådgivning/u.test(s)),'Juridiske sikkerhets- og kildegrenser mangler');
 assert(brief.status==='source_first_ready_not_materialized'&&brief.domain.ordinal===1&&brief.domain.id===ci.domains[0].domainId,'Felt 1 source-first-binding er feil');
 return {status:'pass',domains:12,materialized:0,sourceFirstReady:1,strictCompletionProven:false,reuseWithExpansion:1,newProductionRequired:11,moveExisting:0,nextDomain:ci.domains[0].domainId};
}
try{const r=audit();console.log('Juss & rettsvitenskap reconciliation OK: '+r.materialized+'/'+r.domains+' materialisert, '+r.sourceFirstReady+' source-first klar.')}catch(e){console.error('Juss & rettsvitenskap reconciliation FEIL: '+e.message);process.exitCode=1;}
`);

writeText('tests/juss-rettsvitenskap-reconciliation-v1.test.mjs', `import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';\ntest('Juss reconciliation starter 0/12 og Felt 1 source-first uten å flytte Politikk-eierinnhold',()=>{assert.deepEqual(audit(),{status:'pass',domains:12,materialized:0,sourceFirstReady:1,strictCompletionProven:false,reuseWithExpansion:1,newProductionRequired:11,moveExisting:0,nextDomain:'juridisk_metode_rettskilder_tolkning_argumentasjon'});});\n`);

replaceOnce('scripts/run-fagverk-domain-ci-v1.mjs', '  sprak_lingvistikk: ".github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json",\n});', '  sprak_lingvistikk: ".github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json",\n  juss_rettsvitenskap: ".github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json",\n});');

replaceOnce('tests/fagverk-domain-ci-registry.test.mjs', 'test("Helse, Utdanning, Sosiologi/antropologi, Geografi and Språk/lingvistikk use one domain CI registry contract", () => {\n  assert.deepEqual(Object.keys(registries), ["helse", "utdanning", "sosiologi_antropologi", "geografi", "sprak_lingvistikk"]);', 'test("Helse, Utdanning, Sosiologi/antropologi, Geografi, Språk/lingvistikk and Juss/rettsvitenskap use one domain CI registry contract", () => {\n  assert.deepEqual(Object.keys(registries), ["helse", "utdanning", "sosiologi_antropologi", "geografi", "sprak_lingvistikk", "juss_rettsvitenskap"]);');
replaceOnce('tests/fagverk-domain-ci-registry.test.mjs', '  assert.deepEqual(selectSubjects({\n    registries,\n    changedFiles: ["data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json"],\n  }), ["sprak_lingvistikk"]);\n  assert.deepEqual(selectSubjects({', '  assert.deepEqual(selectSubjects({\n    registries,\n    changedFiles: ["data/fag/litteratur/sprak_lingvistikk/production_registry_v1.json"],\n  }), ["sprak_lingvistikk"]);\n  assert.deepEqual(selectSubjects({\n    registries,\n    changedFiles: ["data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json"],\n  }), ["juss_rettsvitenskap"]);\n  assert.deepEqual(selectSubjects({');
replaceOnce('tests/fagverk-domain-ci-registry.test.mjs', '  }), ["helse", "utdanning", "sosiologi_antropologi", "geografi", "sprak_lingvistikk"]);\n});', '  }), ["helse", "utdanning", "sosiologi_antropologi", "geografi", "sprak_lingvistikk", "juss_rettsvitenskap"]);\n});');
writeText('tests/fagverk-domain-ci-registry.test.mjs', readText('tests/fagverk-domain-ci-registry.test.mjs') + `\ntest("shared domain workflow triggers on every Juss & rettsvitenskap surface routed by the registry", () => {\n  const workflow = readFileSync(".github/workflows/fagverk-domain-registry.yml", "utf8");\n  for (const pathPattern of [\n    "data/fag/politikk/juss_rettsvitenskap/**",\n    "data/fagverk/politikk/juss_rettsvitenskap/**",\n    "reports/fagverk/juss-rettsvitenskap-*.json",\n    "scripts/*juss-rettsvitenskap*",\n    "tests/juss-rettsvitenskap-*.test.mjs",\n    ".github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json",\n  ]) {\n    assert.match(workflow, new RegExp(pathPattern.replace(/[.*+?^\\${}()|[\\]\\\\]/g, "\\\\$&")), \`workflow mangler Juss-trigger \${pathPattern}\`);\n  }\n});\n`);

replaceOnce('.github/workflows/fagverk-domain-registry.yml', "      - 'data/fag/litteratur/sprak_lingvistikk/**'\n", "      - 'data/fag/litteratur/sprak_lingvistikk/**'\n      - 'data/fag/politikk/juss_rettsvitenskap/**'\n");
replaceOnce('.github/workflows/fagverk-domain-registry.yml', "      - 'data/fagverk/litteratur/sprak_lingvistikk/**'\n", "      - 'data/fagverk/litteratur/sprak_lingvistikk/**'\n      - 'data/fagverk/politikk/juss_rettsvitenskap/**'\n");
replaceOnce('.github/workflows/fagverk-domain-registry.yml', "      - 'reports/fagverk/sprak-lingvistikk-*.json'\n", "      - 'reports/fagverk/sprak-lingvistikk-*.json'\n      - 'reports/fagverk/juss-rettsvitenskap-*.json'\n");
replaceOnce('.github/workflows/fagverk-domain-registry.yml', "      - 'scripts/*sprak-lingvistikk*'\n", "      - 'scripts/*sprak-lingvistikk*'\n      - 'scripts/*juss-rettsvitenskap*'\n");
replaceOnce('.github/workflows/fagverk-domain-registry.yml', "      - 'tests/sprak-lingvistikk-*.test.mjs'\n", "      - 'tests/sprak-lingvistikk-*.test.mjs'\n      - 'tests/juss-rettsvitenskap-*.test.mjs'\n");
replaceOnce('.github/workflows/fagverk-domain-registry.yml', "      - '.github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json'\n", "      - '.github/ci/fagverk-sprak-lingvistikk-domain-registry-v1.json'\n      - '.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json'\n");

console.log('TEMP Juss reconciliation + Felt 1 source-first candidate generated.');
