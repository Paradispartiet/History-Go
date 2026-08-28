#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
};

const ROLE = 'psykolog';
const KEY = 'psykologi/psykolog';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/psykolog.json';
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/psykolog_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#psykolog_job_formulering_001`,
  people: `${catalogPath('people')}#psykolog_people_prioritet_001`,
  conflict: `${catalogPath('conflict')}#psykolog_conflict_informasjon_001`,
  event: `${catalogPath('event')}#psykolog_event_risiko_001`,
  micro: `${catalogPath('micro')}#psykolog_micro_verifisering_001`,
  story: `${catalogPath('story')}#psykolog_story_journal_001`,
  knowledge: `${catalogPath('knowledge')}#psykolog_knowledge_schjelderup_001`,
  followup: `${catalogPath('followup')}#psykolog_followup_plan_001`,
  consequence: `${catalogPath('consequence')}#psykolog_consequence_formulering_001`
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'formulering_som_reviderbart_arbeidsobjekt',
  lunch:'pasient_eierskap_og_teamgrenser',
  afternoon:'risiko_handoff_og_rework',
  evening:'journal_ettervirkning_og_profesjonsmaske'
};
const dayThemes = [
  'En foreløpig klinisk formulering ser ryddig ut, men nye opplysninger passer ikke. Arbeidet behandles som et vedvarende objekt: hva som er observert, hva som er hypotese, hva pasienten selv prioriterer og hvilket neste spørsmål som faktisk kan redusere usikkerheten.',
  'Lea kan forklare behandlingsplanen, men hverdagsmålet hennes står et annet sted enn teamets første prioritet. Planen må tilbake til felles avgrensning slik at medvirkning endrer handlingen og ikke bare dokumenteres som gjennomført.',
  'Teamet trenger nok informasjon til å handle forsvarlig, men ikke hele den private historien. Psykologen må holde oppgave, gyldig grunnlag, taushet og ansvar synlige samtidig som nødvendig samhandling faktisk skjer.',
  'Et nytt signal endrer risikobildet og gjør den gamle sikkerhetsplanen utilstrekkelig. Arbeidsrytmen brytes, saken går til ny vurdering og handoff, og det dokumenteres hvem som overtar hvilket ansvar uten å love et bestemt klinisk utfall.',
  'Tidsklemmen gjør det fristende å ferdigstille journalflaten i stedet for å kontrollere den ene opplysningen som kan endre neste kliniske spørsmål. Kvalitet må prioriteres der beslutningsgrunnlaget faktisk er sårbart.',
  'Journalutkastet høres sikrere ut enn samtalen var. Rework betyr å gradere sikkerhet, bevare alternative hypoteser og gjøre neste skillekriterium synlig slik at neste fagperson ikke arver en falsk konklusjon.',
  'Plantråden venter på pasientens erfaring med det reforhandlede første steget. Venting er legitimt når den har tydelig grunn, neste observasjonsvindu og eier; klinisk status kan ikke brukes til å fylle tomrommet med antakelser.',
  'Lea kommer tilbake med blandet erfaring: noe fungerte, men hindringen var en annen enn antatt. Avviket brukes som data for planen og sender både mål, formulering og neste test til avgrenset rework i stedet for å bli merkelapp om motivasjon.',
  'Den kliniske formuleringen forklarer mindre samtidig som gjennomføringen bedres. Utfallet brukes proporsjonalt: én antakelse nedgraderes, årsak overdrives ikke, og et nytt avgrenset spørsmål blir neste arbeidsobjekt.',
  'Amir og psykologen må avklare hva teamet faktisk skal følge med på etter planendringen. Handoff beholder nødvendige observasjoner, kontaktvei og rollegrense uten å gjøre tverrfaglighet til grenseløs informasjonsdeling.',
  'Driftsledelsen ønsker framdrift mens flere spørsmål fortsatt er åpne. Psykologen må gjøre kapasitet, risiko, venting og beslutningseier synlige uten å la driftsansvar eller profesjonstittel produsere en klinisk konklusjon.',
  'Profesjonshistorien ved Psykologisk institutt og Harald Schjelderup brukes som kildeforankret kontekst for hvordan faget er blitt institusjonalisert. History Go er fortsatt kun kunnskapsflate og kan ikke bli klinisk fasit for en nålevende pasient.',
  'Et nytt observasjonsvindu viser at den justerte planen både har styrker og nye friksjoner. Arbeidet går gjennom ny rework og eventuelt handoff til annen kompetanse når saken overskrider psykologens egen kompetanse eller formelle myndighet.',
  'Rollouten avsluttes uten global prestisjescore. Psykologen beskriver hva som er endret, hva som fortsatt venter, hvem som eier neste kliniske steg og hvordan tillit kan være forskjellig hos pasient, team, veileder, ledelse, neste kliniker og privat nærmiljø.'
];
const phaseTail = {
  morning:'Morgenen låser siste bekreftede status og skiller observasjon, pasientens egen beskrivelse og faglig fortolkning slik at profesjonstittel aldri blir snarvei over usikkerhet.',
  lunch:'Lunsjflaten gjør relasjon og standing lesbar hos den konkrete mottakeren, men tillit kan aldri skape autorisasjon, spesialiststatus, taushetsgrunnlag eller lovregulert vedtakskompetanse.',
  afternoon:'Ettermiddagen krever handling i eksisterende Scene Pipeline: avgrenset rework, nødvendig informasjonsdeling, risikovurdering, eskalering eller verifisering med eksplisitt eier og klinisk begrunnelse.',
  evening:'Kvelden viser journalmessig og privat ettervirkning uten å gjøre arbeidets uferdighet til personlig verdi; åpne spørsmål kan bli liggende til pasient, data, veileder eller riktig myndighet faktisk kan svare.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids: [phaseThread[phase]],
      materialization_refs: [refCycle[((day - 1) * 4 + pi) % refCycle.length]]
    });
  }
}

const theme_ids = ['professional_culture','bureaucratic_power','status_anxiety','shame_reputation','loyalty_up_down','social_mask','precarity','care_vs_efficiency'];

const work_rhythm_model = {
  runtime_binding:'editorial_only_existing_pipeline',
  continuity_thread_key:'psykolog_plan_001',
  new_runtime_state:false,
  rule:'Waiting, handoff og rework er eksplisitte arbeidsfaser i eksisterende Scene Pipeline. Psykologens autorisasjon kan ikke fylle venting med sikkerhet, oppheve taushet, erstatte pasientens medvirkning eller overta risiko-, kompetanse- eller myndighetsbeslutninger som krever en annen eier.',
  states:[
    {id:'waiting',meaning:'Arbeidet står legitimt i venteposisjon mens pasientrespons, ny informasjon, veiledning eller et senere vurderingsvindu er nødvendig før neste kliniske konklusjon kan avgrenses.',guardrails:['venting skal ha synlig grunn, neste forventede observasjon og eier','manglende data skal ikke fylles med profesjonstittel, tidskrav eller motivasjonsantakelser']},
    {id:'handoff',meaning:'Et klinisk spørsmål overleveres med siste bekreftede status, nødvendig informasjon, eksplisitt ansvar og hvorfor mottakerens kompetanse eller myndighet faktisk trengs.',guardrails:['handoff skal følge taushetsgrunnlag og oppgaverelevans','mottakerens myndighet kommer fra rolle, kompetanse eller formell utpeking, ikke standing']},
    {id:'rework',meaning:'Formulering, behandlingsplan, journal eller oppfølgingspunkt returneres for ny avgrensning når pasienterfaring, risiko eller andre data endrer premissene.',guardrails:['rework skal gradere usikkerhet og bevare hva som faktisk er observert','ny plan skal ikke gjøre blandet utfall til sikkert årsaksbevis']},
    {id:'interruption',meaning:'Endret risiko, ny informasjon eller driftsmessig press kan avbryte planlagt arbeid og endre rekkefølgen uten å oppheve autorisasjons-, kompetanse- eller taushetsgrensene.',guardrails:['hastegrad kan ikke gjøre gammel plan til gyldig svar på et nytt risikobilde','driftsledelse kan endre kapasitet men ikke bestemme klinisk konklusjon']},
    {id:'delayed_consequence',meaning:'Virkning av reforhandlet plan, ny formulering, informasjonsavgrensning og dokumentasjon vurderes først når senere pasientrespons eller relevant observasjonsvindu faktisk finnes.',guardrails:['senere tillit eller gjennomføring er data, ikke automatisk kausalbevis','blandede resultater og uavklarte følger skal forbli synlige']}
  ],
  transitions:[
    {from:'waiting',to:'handoff',trigger:'ny informasjon, veiledningsbehov eller riktig beslutningseier blir tilgjengelig'},
    {from:'handoff',to:'rework',trigger:'mottaker eller nye data viser at formulering, plan, deling eller ansvar må avgrenses på nytt'},
    {from:'rework',to:'waiting',trigger:'ny versjon trenger pasientrespons, nytt datavindu eller supplerende kompetanse før neste vurdering'},
    {from:'waiting',to:'interruption',trigger:'endret risiko eller annen ny informasjon krever raskere rekkefølge'},
    {from:'interruption',to:'handoff',trigger:'saken sendes gjennom etablert klinisk eskaleringsvei eller til annen kompetanse'},
    {from:'rework',to:'delayed_consequence',trigger:'justert plan eller formulering er satt ut og et reelt observasjonsvindu starter'},
    {from:'delayed_consequence',to:'rework',trigger:'senere erfaring svekker antakelsen, viser ny barriere eller krever nytt avgrenset spørsmål'}
  ]
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere. Ingen global reputation-score kan brukes som klinisk evidens, autorisasjon, spesialiststatus, taushetsgrunnlag, pasientmedvirkning eller formell beslutningsmyndighet.',
  audiences:[
    {id:'patients',standing_axis:'patient_standing',cares_about:['at egne mål faktisk endrer planen','at usikkerhet, risiko og begrunnelse forklares uten overstyring','at fortrolighet og grenser respekteres'],cannot_grant:'autorisasjon, spesialistgodkjenning, klinisk sannhet eller rett til å behandle utenfor psykologens dokumenterte kompetanse'},
    {id:'interdisciplinary_team',standing_axis:'team_standing',cares_about:['oppgaverelevant informasjon som kan brukes til trygg handling','tydelig kontaktvei ved endring','rolleavklaring uten over- eller underdeling'],cannot_grant:'rett til full pasienthistorie, spesialiststatus eller vedtakskompetanse bare fordi samarbeidet fungerer godt'},
    {id:'psychologist_supervision',standing_axis:'supervision_standing',cares_about:['reviderbar formulering og presis dokumentasjon','at veiledning brukes før kompetansegrensen overskrides','at kliniske begrunnelser tåler spørsmål'],cannot_grant:'autorisasjon som ikke finnes, automatisk spesialistgodkjenning eller myndighet utenfor veilederens faktiske rolle'},
    {id:'section_leadership',standing_axis:'leadership_standing',cares_about:['forsvarlig framdrift og tydelig kapasitetsbehov','presis eskalering av risiko og kompetansegap','etterprøvbar dokumentasjon'],cannot_grant:'klinisk evidens, spesialiststatus, taushetsfritak eller rett til å bestemme pasientens kliniske formulering'},
    {id:'future_clinicians',standing_axis:'continuity_standing',cares_about:['journal som graderer sikkerhet og viser alternative hypoteser','synlig begrunnelse for plan og risiko','klart neste spørsmål og ansvar'],cannot_grant:'at tidligere journaltekst blir sann bare fordi den er skrevet av en autorisert psykolog eller har høy intern status'},
    {id:'private_relationships',standing_axis:'private_relationship_standing',cares_about:['at klinisk ansvar kan legges bort når andre eier neste steg','at profesjonstittel og personlig verdi kan skilles','at uferdig arbeid ikke behandles som privat svikt'],cannot_grant:'arbeidsmyndighet, autorisasjon, klinisk evidens eller rett til pasientinformasjon'}
  ],
  divergence_examples:[
    'Å holde en formulering åpen kan senke kortsiktig standing hos drift som ønsker rask konklusjon, men øke tillit hos pasient og veileder fordi usikkerheten håndteres eksplisitt.',
    'Å avgrense informasjonsdeling kan oppleves mindre smidig i teamet, men øke pasientens standing når fortrolighet og oppgaverelevans faktisk respekteres.',
    'Å eskalere endret risiko kan redusere bildet av psykologen som selvtilstrekkelig problemløser, men øke standing hos team og ledelse fordi kompetanse- og myndighetsgrenser blir tydelige.'
  ],
  authority_separation:'Standing kan påvirke hvem som stoler på psykologen i behandling, samarbeid og kontinuitet, men kan aldri skape autorisasjon eller spesialiststatus, erstatte klinisk evidens, oppheve taushet eller gi formell myndighet rollen ikke allerede har.'
};

const recurring_people_archetypes = [
  {id:'psykolog_patient_world',social_function:'pasient som eier egne mål, erfaringer og grenser i et asymmetrisk klinisk møte',class_position:'tjenestemottaker med lav formell institusjonsmakt og høy situert kunnskap om eget liv',status:'høy situert relevans uten profesjonell rang',power_over_player:'kan vise om planen faktisk er felles og om klinisk språk oppleves som hjelp eller overtakelse',wants:'hjelp som gir mening, reell medvirkning og tydelige grenser',conceals:'at tidligere erfaringer kan gjøre det risikabelt å motsi en autorisert fagperson',speech_style:'konkret og erfaringsnær; beskriver hva som faktisk skjer i hverdagen',teaches_player:'at medvirkning må kunne endre handling, ikke bare journaltekst'},
  {id:'psykolog_nurse_world',social_function:'sykepleier som trenger nok informasjon til trygg oppfølging uten grenseløs tilgang',class_position:'tverrfaglig kollega med eget ansvar og annen profesjonskompetanse',status:'middels formell status, høy situert oppfølgingskunnskap',power_over_player:'kan oppdage endringer mellom samtaler og gjøre behovet for handoff eller ny risikovurdering synlig',wants:'handlingsbar informasjon, tydelig ansvar og kontaktvei',conceals:'at tidspress kan gjøre mer informasjon fristende enn bedre avgrensning',speech_style:'praktisk og observasjonsnær; spør hva som skal følges med på og hvem som kontaktes',teaches_player:'at tverrfaglighet trenger relevans og taushetsgrunnlag samtidig'},
  {id:'psykolog_specialist_world',social_function:'psykologspesialist eller veileder som utfordrer for sikre formuleringer og kompetanseglidning',class_position:'mer erfaren profesjonsutøver med situert veiledningsmakt',status:'høy faglig status men ikke eier av psykologens alle beslutninger',power_over_player:'kan kreve bedre begrunnelse, peke på kompetansegrense og anbefale eskalering',wants:'reviderbar klinisk tenkning og etterprøvbar dokumentasjon',conceals:'at ekspertstatus også kan skape ny forankring hvis rådet behandles som fasit',speech_style:'presis og spørsmålsdrevet; skiller evidens, hypotese og mandat',teaches_player:'at veiledning skal bedre dømmekraft, ikke erstatte den'},
  {id:'psykolog_section_leader_world',social_function:'seksjonsleder som eier kapasitet og drift uten å eie klinisk sannhet',class_position:'formell driftsleder med organisatorisk makt',status:'høy lokal organisasjonsstatus',power_over_player:'kan omprioritere tid og kapasitet og kreve sporbar framdrift',wants:'forsvarlig flyt, tydelige flaskehalser og riktig eskalering',conceals:'at produksjonspress kan belønne ferdigflate foran beslutningskritisk kvalitet',speech_style:'kort og prioriterende; spør hva som blokkerer og hva som kan vente',teaches_player:'at driftsmakt og klinisk myndighet er forskjellige maktformer'},
  {id:'psykolog_next_clinician_world',social_function:'senere kliniker som arver journal, plan og grad av sikkerhet',class_position:'profesjonell etterfølger med eget klinisk ansvar',status:'faglig likemann i en annen fase av forløpet',power_over_player:'kan synliggjøre om dokumentasjonen gjør korreksjon mulig eller låser neste vurdering',wants:'klar evidensstatus, alternative hypoteser og synlig neste spørsmål',conceals:'at tidspress kan gjøre tidligere journaltekst mer autoritativ enn den bør være',speech_style:'etterprøvbar og kronologisk; spør hva som var kjent da beslutningen ble tatt',teaches_player:'at god journalføring er handoff til et fremtidig klinisk ansvar'},
  {id:'psykolog_private_world',social_function:'privat nær relasjon som møter personen når ansvar, usikkerhet og status følger med hjem',class_position:'privat likemann uten klinisk eller organisatorisk myndighet',status:'emosjonell nærhet uten profesjonsrang',power_over_player:'kan gjøre sosial maske og behovet for å legge bort rollen synlig',wants:'at personen kan være til stede uten å behandle privatlivet som en klinisk oppgave',conceals:'at stadig profesjonelt språk kan skape avstand også når det er velment',speech_style:'direkte og hverdagslig; spør om saken faktisk trenger psykologrollen nå',teaches_player:'at profesjonell standing ikke er personlig verdi'}
];

const slow_axes = [
  {id:'formulation_calibration',meaning:'om kliniske hypoteser forblir gradert og reviderbare når nye data ikke passer',runtime_binding:'existing'},
  {id:'patient_plan_ownership',meaning:'om pasientens prioritet faktisk endrer plan og senere oppfølging',runtime_binding:'existing'},
  {id:'handoff_clarity',meaning:'om risiko, kompetanse og informasjonsdeling beholder eksplisitt eier og nødvendig grunnlag',runtime_binding:'editorial_only_until_governed'},
  {id:'rework_quality',meaning:'om formulering, plan og journal kan revideres uten å skjule tidligere usikkerhet eller bidrag',runtime_binding:'editorial_only_until_governed'},
  {id:'patient_standing',meaning:'situert tillit hos pasienter til medvirkning, fortrolighet og begrunnelse',runtime_binding:'editorial_only_until_governed'},
  {id:'team_standing',meaning:'situert tillit i tverrfaglig team til avgrenset samhandling og sikker eskalering',runtime_binding:'editorial_only_until_governed'},
  {id:'supervision_standing',meaning:'situert tillit i veiledningsmiljø til korrigerbarhet og kompetansebevissthet',runtime_binding:'editorial_only_until_governed'},
  {id:'leadership_standing',meaning:'situert tillit hos ledelse til forsvarlig prioritering og tydelig kapasitetsbehov',runtime_binding:'editorial_only_until_governed'},
  {id:'continuity_standing',meaning:'situert tillit hos neste kliniker til journalens sikkerhetsgrad og handoff',runtime_binding:'editorial_only_until_governed'},
  {id:'private_clinical_mask',meaning:'hvor mye klinisk ansvar og profesjonstittel bæres inn i privat identitet etter arbeidstid',runtime_binding:'editorial_only_until_governed'}
];

const primary_threads = [
  {id:'formulering_som_reviderbart_arbeidsobjekt',beat_refs:['1/morning','1/afternoon','6/morning','6/afternoon','8/afternoon','9/morning','9/afternoon','14/morning']},
  {id:'pasient_eierskap_og_teamgrenser',beat_refs:['2/lunch','3/lunch','7/lunch','8/lunch','10/lunch','13/lunch','14/lunch']},
  {id:'risiko_handoff_og_rework',beat_refs:['4/morning','4/afternoon','5/afternoon','10/afternoon','11/afternoon','13/afternoon','14/afternoon']},
  {id:'profesjonshistorie_og_kildegrense',beat_refs:['5/lunch','7/morning','9/lunch','11/lunch','12/morning','12/afternoon','14/morning']},
  {id:'journal_ettervirkning_og_profesjonsmaske',beat_refs:['1/evening','4/evening','6/evening','8/evening','11/evening','12/evening','14/evening']}
];

const private_aftermath = [
  {id:'uncertainty_aftertaste',beat_ref:'1/evening',text:'Etter å ha åpnet formuleringen på nytt merker psykologen hvor sterkt en ryddig forklaring kan føles som personlig mestring. Kvelden skiller følelsen av kontroll fra det kliniske kravet om korrigerbarhet.'},
  {id:'risk_residue',beat_ref:'4/evening',text:'Et endret risikobilde følger med hjem som uro selv etter riktig eskalering. Etterspillet viser at ansvar kan være reelt uten at én psykolog skal bære alle beslutninger alene.'},
  {id:'journal_doubt',beat_ref:'6/evening',text:'Rework av journalen synliggjør hvor lett sikker tone kan bli statusmarkør. Uferdig tekst får være faglig ansvarlig når den faktisk gjengir usikkerheten bedre.'},
  {id:'patient_feedback_relief',beat_ref:'8/evening',text:'Leas blandede tilbakemelding gir både lettelse og ny tvil. Ingen av følelsene får bli årsaksbevis; de holdes adskilt fra hva forløpet faktisk viser.'},
  {id:'role_can_end',beat_ref:'14/evening',text:'Psykologen avslutter perioden med åpne spørsmål hos pasient, team og neste datavindu. Å legge bort rollen privat er forenlig med kontinuitet fordi ansvar og neste eier allerede er dokumentert.'}
];

const delayed_consequences = [
  {id:'shared_priority_returns',setup_ref:'2/lunch',return_ref:'8/lunch',description:'Pasientens reforhandlede prioritet kommer tilbake som faktisk erfaring med planen og kan endre neste kliniske test.'},
  {id:'risk_handoff_returns',setup_ref:'4/afternoon',return_ref:'10/afternoon',description:'Den akutte handoffen kommer senere tilbake som tydeligere oppfølgingspunkt, kontaktvei og rollefordeling i teamet.'},
  {id:'critical_verification_returns',setup_ref:'5/afternoon',return_ref:'9/morning',description:'Opplysningen som ble kontrollert under tidsklemme kommer tilbake som bedre avgrensning av formuleringen og hindrer at et svakt premiss blir journalført som sikkert.'},
  {id:'journal_calibration_returns',setup_ref:'6/afternoon',return_ref:'11/afternoon',description:'Den graderte journalen fungerer senere som handoff når ledelse og neste kliniker trenger å se hva som var kjent, antatt og fortsatt åpent.'},
  {id:'history_source_boundary_returns',setup_ref:'7/morning',return_ref:'12/afternoon',description:'Profesjonshistorien kommer tilbake som kildekontekst i faglig refleksjon uten å bli klinisk autoritet for den nålevende pasienten.'},
  {id:'formulation_outcome_returns',setup_ref:'8/afternoon',return_ref:'13/afternoon',description:'Planoppfølgingens blandede utfall kommer senere tilbake som proporsjonal reformulering og eventuelt nytt behov for kompetanse eller handoff.'}
];

const foundation_dimensions_bound = ['persistent_work_object','institution_authority','rhythm_waiting_handoff_rework','history_go_affordance','situated_reputation','people_places_integrity','provenance'];

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'psykologi',
  role_scope:ROLE,
  title:'Psykolog — reviderbar formulering, felles plan og avgrenset klinisk myndighet',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å bruke beskyttet profesjonskompetanse til å holde kliniske beslutninger presise, korrigerbare og relasjonelt forsvarlige når tidspress, risiko og forventninger gjør sikkerhet og overstyring fristende.',
    description:'Role World-en materialiserer den allerede rollout-ready Psykolog-pakken uten ny authored debt. Den binder eksisterende formulering, pasientmedvirkning, informasjonsdeling, risiko, dokumentasjon og History Go-kildegrense til en vedvarende 14-dagers arbeidsverden i eksisterende Scene Pipeline.'
  },
  theme_ids,
  social_environments:[
    'Det fiktive samtalerommet der pasientens mål, klinisk formulering og grad av sikkerhet må kunne endres uten at profesjonstittelen blir fasit.',
    'Det fiktive tverrfaglige teamet der nødvendig informasjonsdeling, taushet og oppgaveansvar må avgrenses før samhandling kan kalles trygg.',
    'Den kliniske oppfølgingsflaten der endret risiko kan avbryte planen og kreve ny vurdering, eskalering og handoff til riktig kompetanse eller myndighet.',
    'Journal- og dokumentasjonsarbeidet der neste kliniker må kunne skille observasjon, pasientbeskrivelse, hypotese og konklusjon.',
    'Driftsflaten der kapasitet og framdrift er reelle hensyn, men seksjonslederens mandat ikke kan produsere klinisk sannhet eller oppheve kompetansegrenser.',
    'History Go-flaten knyttet til Psykologisk institutt og profesjonshistorie, der canonicale personer og steder brukes som kildekontekst og aldri som fiktive kliniske aktører.',
    'Privatlivet der klinisk ansvar, usikkerhet og beskyttet profesjonstittel må kunne skilles fra personlig verdi og fra saker andre faktisk eier.'
  ],
  recurring_people_archetypes,
  slow_axes,
  work_rhythm_model,
  situated_reputation_model,
  primary_threads,
  private_aftermath,
  delayed_consequences,
  cross_role_link:{status:'not_required_for_rollout',materialized:false,new_runtime:false,rule:'Cross-role skal bare materialiseres når shared work faktisk er genuint delt mellom canonicale roller. Psykolog-readiness krever ingen slik kobling, og den eksisterende tverrfaglige samhandlingen bevises uten nytt delt runtime-objekt.'},
  season:{days:14,day_phases:phases,coverage},
  materialization:{authored_dimensions:[],foundation_dimensions_bound,no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_work_grammar_preserved:true,cross_role_link_materialized:false,source_refs:refCycle}
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE)) index.roles.push({category:'psykologi',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Psykologi Psykolog er materialisert som kontrollert Role World-rollout fra en allerede rollout-ready klinisk pakke; autorisasjon, kompetanse, taushet, risikoeskalering og History Go-kildegrense er bevart uten ny runtime eller cross-role-kobling.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

const report = `# Civication Psykologi Psykolog Role World rollout\n\nDato: **2026-08-28**\n\n## Resultat\n\nPsykolog er materialisert som en komplett 14-dagers Role World med 56 beats. Readiness hadde **ingen authored work debt**, så \`materialization.authored_dimensions\` forblir tom; rollouten binder i stedet de sju allerede dokumenterte foundation-dimensjonene til en vedvarende arbeidsverden.\n\n## Bevarte canonicale kontrakter\n\n- eksisterende ni-trinns mailplan er uendret\n- alle ni eksisterende mailtyper gjenbrukes som provenance\n- protected-title-gaten for norsk autorisasjon/lisens beholdes\n- autorisasjon er fortsatt ikke spesialistgodkjenning\n- behandling utenfor egen kompetanse er fortsatt forbudt\n- taushetsbelagt informasjon deles ikke bare fordi team eller leder ønsker den\n- endret risiko følger etablert klinisk eskaleringsvei og riktig ansvarseier\n- History Go-personer og -steder er kun kildeforankret profesjonshistorie, ikke klinisk autoritet\n- ingen ny runtime eller cross-role-kobling er introdusert\n\n## Vedvarende klinisk arbeid\n\n\`psykolog_plan_001\` er continuity anchor mellom pasientens prioritet, planoppfølging og senere reformulering. Formulering, plan, risikobilde, nødvendig informasjonsdeling og journaltekst går gjennom eksplisitt waiting, handoff, rework, interruption og delayed consequence i eksisterende Scene Pipeline.\n\n## Situert standing\n\nStanding er separat for pasienter, tverrfaglig team, psykologveiledning, seksjonsledelse, framtidige klinikere og private relasjoner. Ingen global score finnes, og standing kan aldri erstatte autorisasjon, spesialiststatus, evidens, taushetsgrunnlag, medvirkning eller formell myndighet.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_PSYKOLOGI_PSYKOLOG_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${KEY}: ${coverage.length} beats, ${refCycle.length} source refs, zero authored debt`);
