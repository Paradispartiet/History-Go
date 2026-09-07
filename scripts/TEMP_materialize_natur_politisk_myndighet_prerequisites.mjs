import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, execSync} from 'node:child_process';

const root = process.cwd();
const ROLE = 'natur_politisk_myndighet';
const CATEGORY = 'natur';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_POLITISK_MYNDIGHET_PREREQUISITES_SOURCE_FIRST.md';
const TEST = 'tests/civication-natur-politisk-myndighet-prerequisites.test.js';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'utnevnelse_mandat_faggrunnlag_avveiing_hjemmel_beslutning_ansvar_og_oppfolgingslogg';
const BASE_COMMIT = 'e6906a56dd78d899f98e6bfdeee1b45648cd0e67';
const BASE_SCRIPT = 'scripts/TEMP_materialize_natur_miljoledelse_prerequisites.mjs';

const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

// Reuse the already CI-proven prerequisite shape from Miljøledelse, then replace
// every role-authored semantic surface below. This avoids hand-maintaining the
// generator contract while keeping Politisk myndighet content independent.
let base = execSync(`git show ${BASE_COMMIT}:${BASE_SCRIPT}`, {encoding:'utf8'});
base = base
  .replaceAll('CIVICATION_NATUR_MILJOLEDELSE', 'CIVICATION_NATUR_POLITISK_MYNDIGHET')
  .replaceAll('natur_miljoledelse', ROLE)
  .replaceAll('miljoledelse_', 'politisk_myndighet_');
const stagedBase = path.join('/tmp','TEMP_materialize_natur_politisk_myndighet_base.mjs');
fs.writeFileSync(stagedBase, base);
execFileSync(process.execPath, [stagedBase], {cwd:root, stdio:'inherit'});

const ACTORS = [
  {id:'ingrid_departementsrad_natur_politisk_myndighet',name:'Ingrid',role:'departementsråd',workplace_ids:['departementalt_beslutningsrom_natur']},
  {id:'yusuf_ekspedisjonssjef_faggrunnlag_natur_politisk_myndighet',name:'Yusuf',role:'ekspedisjonssjef for faggrunnlag',workplace_ids:['faggrunnlag_og_usikkerhetsbord_natur']},
  {id:'maria_regjeringsradgiver_natur_politisk_myndighet',name:'Maria',role:'regjeringsrådgiver og samordner',workplace_ids:['regjeringssamordning_og_avveiingsrom_natur']},
  {id:'henrik_juridisk_og_stortingskontakt_natur_politisk_myndighet',name:'Henrik',role:'juridisk rådgiver og stortingskontakt',workplace_ids:['hjemmel_storting_og_oppfolgingsrom_natur']}
];
const PLACES = [
  {id:'departementalt_beslutningsrom_natur',name:'Departementalt beslutningsrom',function:'Her skilles offentlig utnevnelse, konstitusjonelt og delegert mandat, regjeringsplattform, politiske mål, beslutningseier og forvaltningsfaglige premisser før statsråden gir styringssignal. Rommet gjør eksplisitt hvilke beslutninger som ligger hos statsråden, regjeringen, Stortinget, forvaltningen eller andre myndigheter, og hindrer at politisk vilje behandles som hjemmel.'},
  {id:'faggrunnlag_og_usikkerhetsbord_natur',name:'Faggrunnlag- og usikkerhetsbord',function:'Her versjoneres natur- og klimafaglige råd, datagrunnlag, usikkerhet, metodebegrensninger, alternative tolkninger og faglig dissens. Statsråden kan velge politisk mellom lovlige alternativer, men kan ikke omskrive faggrunnlaget, skjule vesentlig usikkerhet eller gjøre History Go-kunnskap til saksbehandlet evidens.'},
  {id:'regjeringssamordning_og_avveiingsrom_natur',name:'Regjeringssamordnings- og avveiingsrom',function:'Her synliggjøres konflikter mellom klima, natur, økonomi, energi, transport, distrikt, arbeidsliv og fordelingsvirkninger før et politisk kompromiss utformes. Hver avveiing beholder naturkostnad, vinnere, tapere, premisser, alternativ og hvilken institusjon som faktisk eier neste beslutning.'},
  {id:'hjemmel_storting_og_oppfolgingsrom_natur',name:'Hjemmel-, stortings- og oppfølgingsrom',function:'Her kobles rettslig grunnlag, budsjettvedtak, stortingsforpliktelser, spørsmål og svar, instruksjonslinjer, implementeringsansvar, frister, indikatorer og etterkontroll. Politisk hastverk, popularitet eller flertallsønske kan ikke registreres som juridisk hjemmel, og nye fakta eller rettslige avklaringer kan gjenåpne berørte deler med bevart beslutningsspor.'}
];
const POLICY = {'Statsråd (klima og miljø)':{policy:'appointment_required',qualification_ids:['public_office_appointment']}};
const AUTHORITY = {
  may:['utøve politisk myndighet når public_office_appointment og faktisk mandat er dokumentert','prioritere mellom lovlige politiske alternativer og begrunne avveiingen','gi styringssignaler innen gjeldende konstitusjonelle, lovlige og delegerte rammer','representere politiske valg offentlig med tydelig skille mellom fakta, usikkerhet og normativ prioritering','eskalere saker til regjering eller Storting når beslutningen ligger utenfor eget mandat'],
  may_not:['materialisere statsrådsmyndighet uten public_office_appointment','fabrikere hjemmel, budsjettmyndighet eller regjeringsbeslutning','fremstille politisk preferanse som naturvitenskapelig fakta eller faglig nødvendighet','redigere bort vesentlige faglige råd, usikkerhet eller naturkostnader for å beskytte et ønsket politisk utfall','bruke History Go, Natur-badge, XP, omdømme eller popularitet som offentlig utnevnelse, saksbehandlet evidens eller rettslig hjemmel']
};
const LOOPS = [
  'faggrunnlag -> politiske alternativer -> avveiing -> hjemmel og mandat -> beslutning -> begrunnelse -> ansvar -> oppfølging',
  'krise -> fakta og usikkerhet -> juridisk og faglig ramme -> politisk handling -> offentlighet -> implementering -> etterkontroll'
];
const WAITING = ['oppdatert_faggrunnlag','juridisk_hjemmelsavklaring','budsjett_eller_finansavklaring','regjeringssamordning','stortingsbehandling','forvaltningsmessig_implementering','etterkontroll_eller_nye_data'];

const actorFunctions = [
  'Ingrid bærer embetsverkets helhetlige saksforberedelse, forvaltningslinjer og skillet mellom statsrådens politiske ansvar og administrasjonens faglige og rettslige plikter. Hun krever at beslutningseier, delegasjon, habilitet, dokumentasjonsbehov og implementeringsansvar er eksplisitt før politiske signaler behandles som beslutninger, og hun gjør det synlig når en sak må løftes til regjeringen eller Stortinget.',
  'Yusuf bærer det versjonerte klima- og naturfaglige grunnlaget, usikkerhet, metodebegrensninger, alternativer og faglig dissens. Han sørger for at statsråden får et beslutningsrelevant kunnskapsgrunnlag uten at politisk ønsket resultat påvirker hva fagmiljøet får lov til å konkludere, og han markerer hva som fortsatt krever ekstern måling, utredning eller kvalitetssikring.',
  'Maria bærer regjeringssamordning, målkonflikter og fordelingsvirkninger på tvers av departementer og sektorer. Hun gjør kompromisskostnader, vinnere, tapere, naturkonsekvenser, økonomiske premisser og alternative virkemidler sammenlignbare, men kan ikke gjøre forhandlingsutfall til faglig sannhet eller skape myndighet som ikke følger av den faktiske regjerings- og beslutningsprosessen.',
  'Henrik bærer rettslig ramme, stortingskontakt, offentlig ansvarlighet og oppfølging av vedtak. Han skiller juridisk hjemmel fra politisk ønske, holder spørsmål, svar, forutsetninger og rettelser sporbare og sørger for at implementering og etterkontroll peker til korrekt ansvarlig organ i stedet for at statsrådens tittel brukes som universell beslutningskompetanse.'
];
const actorAuthority = [
  'Ingrid kan kreve forsvarlig saksforberedelse, tydelig delegasjon og korrekt forvaltningsspor og kan advare mot beslutninger som mangler nødvendig grunnlag, men kan ikke gi eller simulere public_office_appointment, overta statsrådens politiske ansvar, skape lovhjemmel eller endre faglige konklusjoner for å passe politisk kommunikasjon.',
  'Yusuf kan dokumentere faglige funn, usikkerhet, alternativer og behov for mer kunnskap og kan nekte å omtale et politisk kompromiss som faglig optimalt, men kan ikke gjøre fagrollen til politisk beslutningsmyndighet, utnevne statsråden, gi juridisk hjemmel eller velge mellom lovlige politiske verdiprioriteringer på statsrådens vegne.',
  'Maria kan samordne departementer, kartlegge politisk handlingsrom og synliggjøre konsekvenser av kompromisser, men kan ikke fabrikere en regjeringsbeslutning, skjule dokumentert naturkostnad, gjøre partipolitisk støtte til faglig evidens eller gi statsråden kompetanse som ligger hos Stortinget, Kongen i statsråd eller annet organ.',
  'Henrik kan avklare rettslig grunnlag, prosess, stortingsforpliktelser og behov for korrigering og kan stoppe formuleringer som påstår mer hjemmel eller sikkerhet enn saken bærer, men kan ikke gjøre juridisk rådgivning til public_office_appointment, velge politisk prioritering eller bruke kommunikasjon som erstatning for formell beslutning.'
];

const model = read(MODEL);
Object.assign(model, {
  core_narrative:[
    'Utøve klima- og miljøpolitisk ansvar bare etter dokumentert offentlig utnevnelse, med et lesbart skille mellom naturfaglig kunnskap, rettslig ramme, politisk avveiing og den institusjonen som faktisk eier beslutningen.',
    'Rollen gjør statsrådsarbeidet spillbart som et vedvarende beslutningsspor der faggrunnlag, usikkerhet, målkonflikter, hjemmel, kompromisskostnader, offentlig begrunnelse, implementering og etterkontroll kan endres uten at politisk makt får omskrive fakta.'
  ],
  work_life:{
    daily_work:['motta og avgrense beslutningssaker mot faktisk offentlig mandat','lese faggrunnlag og usikkerhet før politisk avveiing','samordne målkonflikter på tvers av regjering og forvaltning','avklare hjemmel, budsjett og korrekt beslutningsnivå','begrunne politiske valg offentlig og følge implementering, spørsmål og nye fakta'],
    responsibilities:['demokratisk ansvarlighet','fag-politikk-skille','rettslig og konstitusjonelt mandat','klima- og naturpolitisk prioritering','regjeringssamordning','stortingsansvar','åpenhet om usikkerhet og naturkostnad','implementering og etterkontroll'],
    work_environment:['Departement, regjering, Storting og offentlighet, i samspill med embetsverk og underliggende organer der politiske valg må bygge på forsvarlig saksgrunnlag og holdes innen riktig beslutningskompetanse.'],
    status_position:['Statsråd (klima og miljø) materialiseres bare etter public_office_appointment. History Go og Natur-badge er læringsstøtte og kan aldri gi offentlig embete, konstitusjonell kompetanse, hjemmel, budsjettvedtak eller saksbehandlet evidens.'],
    workplaces:PLACES.map(p=>p.id)
  },
  authority_boundaries:{can:AUTHORITY.may,cannot:AUTHORITY.may_not},
  authority_boundary:AUTHORITY,
  career_path:{
    entry_from:['Statsråd (klima og miljø) bare etter dokumentert public_office_appointment; spillprogresjon, Natur-badge, ekspertise, omdømme eller popularitet kan ikke oppfylle denne gaten.'],
    progression_to:['Utvidet politisk ansvar bare gjennom reell offentlig beslutnings- eller utnevnelsesprosess; høyere spillstatus utvider ikke mandat, delegasjon eller konstitusjonell kompetanse.'],
    possible_promotions:['Annet eller bredere offentlig politisk ansvar bare etter separat reell utnevnelse og korrekt konstitusjonell prosess.','Parti- eller regjeringsledelse når de faktiske demokratiske og organisatoriske prosessene er oppfylt; Civication kan bare trene ferdigheter.'],
    possible_exits:['Tilbake til folkevalgt, politisk eller organisatorisk arbeid uten å beholde statsrådsmyndighet etter at utnevnelsen opphører.','Rådgivning, forvaltning eller fagarbeid der ny rolle, habilitet, ansettelse og eventuelle kvalifikasjonskrav vurderes separat.'],
    career_risks:['Tidspress og regjeringslojalitet kan belønne utydelig skille mellom faggrunnlag og politisk valg.','Medietrykk og politisk kapital kan friste til å skjule usikkerhet, naturkostnad eller hvilken institusjon som faktisk har myndighet.']
  },
  required_knowledge:{
    education_basis:['Rollen følger offentlig utnevnelse, ikke en automatisk utdanningsstige. Relevant klima-, natur-, forvaltnings-, retts- og samfunnsforståelse styrker beslutningskvalitet, men public_office_appointment er den ufravikelige adgangsporten.'],
    skills:['politisk ledelse','klima- og miljøpolitikk','forvaltningsforståelse','fag-politikk-skille','evidenssyntese','usikkerhetskommunikasjon','politisk avveiing','rettslig og konstitusjonell rolleforståelse','regjeringssamordning','stortingsansvar','krisehåndtering','offentlig begrunnelse','implementeringsstyring','etterkontroll og korrigering'],
    category_knowledge:['Natur- og klimafaglig kontekst, virkemidler, styringssystem, demokratisk ansvar, rettslig mandat, fordelingsvirkninger, faglig uavhengighet og skillet mellom offentlig myndighet, politisk valg og vitenskapelig kunnskap.'],
    history_go_badges:['natur'],
    place_connections:PLACES.map(p=>p.id),
    people_connections:ACTORS.map(a=>a.id),
    boundary:'History Go kan gi naturhistorisk, økologisk og stedlig kontekst som forbedrer statsrådens spørsmål, men er ikke public_office_appointment, saksutredning, feltdata, juridisk vurdering, budsjettvedtak, regjeringsbeslutning eller stortingsfullmakt.'
  },
  challenges:[{id:'faggrunnlag_vs_politisk_prioritering_og_mandat',title:'Faggrunnlag, politisk prioritering og mandat',description:'Statsråden må kunne velge et lovlig politisk alternativ som avviker fra faglig anbefaling, men bare ved å bevare rådet, usikkerheten, naturkostnaden, hjemmelen og hvem som faktisk eier beslutningen.',pressure:'faglige_rad_vs_regjeringsprioritet_vs_rettslig_handlingsrom',affects:['quality','trust','risk']}],
  dilemmas:[{id:'politisk_onske_blir_presentert_som_faglig_nodvendighet',title:'Politisk ønske blir presentert som faglig nødvendighet',setup:'Et ønsket kompromiss er politisk mulig, men faggrunnlaget viser en tydelig naturkostnad og betydelig usikkerhet.',choice_axis:'apen_politisk_avveiing_vs_faglig_omskriving',consequence_axis:'demokratisk_etterprovbarhet_vs_mandatglidning_og_tillitstap',mail_hooks:TYPES}],
  related_people:ACTORS.map((a,index)=>({...a,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null,function:actorFunctions[index],authority_relation:actorAuthority[index]})),
  related_places:PLACES
});
write(MODEL, model);

const grammar = read(GRAMMAR);
Object.assign(grammar, {
  work_loops:LOOPS,
  authority_boundary:AUTHORITY,
  actor_grammar:ACTORS,
  place_grammar:PLACES,
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert statsråds- og beslutningsspor som holder public_office_appointment, faktisk mandat, beslutningseier, faggrunnlag, usikkerhet, politiske alternativer, fordelings- og naturkonsekvenser, hjemmel, budsjettpremiss, regjeringssamordning, beslutning, offentlig begrunnelse, implementeringsansvar, ventepunkt, stortingsoppfølging, indikatorer og rework som separate felt.',
    states:['utnevnelse_bekreftet','mandat_avgrenset','beslutningseier_registrert','faggrunnlag_innhentet','usikkerhet_markert','alternativer_utredet','naturkostnad_synlig','fordelingsvirkning_synlig','hjemmel_vurderes','budsjettpremiss_avklart','regjeringssamordning','politisk_avveiing','venter_pa_avklaring','beslutningsklar','besluttet','offentlig_begrunnelse','implementering','stortingsoppfolging','etterkontroll','rework','gjenapnet','lukket_med_rest_usikkerhet'],
    handoff_rule:'Neste aktør overtar synlig utnevnelse og mandat, beslutningseier, faggrunnlag og usikkerhet, politisk avveiing, hjemmel, natur- og fordelingskostnad, implementeringsansvar, ventepunkt og neste kontroll. Handoff kan aldri skape public_office_appointment, ny hjemmel eller skjule et faglig råd.'
  },
  rhythm_contract:{
    loop:'faggrunnlag -> alternativer -> waiting/venting på hjemmel, budsjett, regjeringssamordning, Storting eller nye data -> politisk avveiing -> beslutning -> handoff -> implementering -> offentlig og parlamentarisk oppfølging -> etterkontroll -> revisjon/rework',
    waiting_states:WAITING,
    rework_rule:'Nye fagdata, endret usikkerhet, rettslig avklaring, budsjettvedtak, regjeringsbeslutning, stortingsvedtak eller implementeringsfunn gjenåpner bare berørte premisser og beslutningsledd med bevart tidligere begrunnelse.'
  },
  knowledge_dependencies:[{id:'history_go_natur_politisk_myndighet_sted_og_okologikontekst',badge_id:'natur',use:'History Go kan forbedre spørsmål om arter, steder, økologi og naturhistorie, men Natur-badge er ikke public_office_appointment, kan ikke erstatte utredning eller feltdata, skape hjemmel eller gi regjeringen eller Stortingets myndighet.'}],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Bekreft public_office_appointment og faktisk mandat. Registrer beslutningseier, faggrunnlag, vesentlig usikkerhet, minst to politiske alternativer, natur- og fordelingskostnad, hjemmelsbehov, hvilket organ som eier neste beslutning og hva History Go ikke beviser eller gir myndighet til før første styringssignal sendes.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
});
write(GRAMMAR, grammar);

const plan = read(PLAN);
plan.id = 'natur_politisk_myndighet_foundation_v1';
plan.title = 'Klima- og miljøpolitisk myndighet';
plan.description = 'Seksten steg fra kontroll av offentlig utnevnelse og mandat til faggrunnlag, politisk avveiing, hjemmel, samordning, beslutning, stortingsansvar og etterkontroll.';
plan.arc = {
  from:'Nyutnevnt statsråd som må lære at public_office_appointment gir et avgrenset offentlig mandat, ikke rett til å omskrive fag, hoppe over hjemmel eller behandle popularitet som myndighet.',
  to:'En demokratisk ansvarlig statsråd som kan holde fakta, usikkerhet, politisk avveiing, rettslig ramme, institusjonell beslutningseier og implementering adskilt og sporbare.',
  core_questions:['Hva er dokumentert faggrunnlag og hva er den politiske prioriteringen?','Hvilken hjemmel og hvilken institusjon eier faktisk beslutningen?','Hvilke natur- og fordelingskostnader følger valget, og hvilket nytt premiss skal gjenåpne saken?']
};
for (const step of plan.sequence) step.step_goal = `Før ${PERSISTENT} gjennom ${step.type} med synlig public_office_appointment, mandat, faggrunnlag, usikkerhet, politisk avveiing, hjemmel, beslutningseier, handoff og etterkontroll.`;
write(PLAN, plan);

const subjects = {
  job:['Prioriter mellom lovlige tiltak med synlig naturkostnad','Avklar hjemmel før et hastegrep kommuniseres som besluttet','Svar Stortinget med tydelig skille mellom fakta og politikk','Samordne en departementskonflikt uten å gjemme kostnaden'],
  people:['Embetsverket nekter å omskrive faggrunnlaget','Samordneren gjør et kostbart kompromiss eksplisitt','Juridisk rådgiver avgrenser statsrådens mandat','Fagavdelingen markerer ny og vesentlig usikkerhet'],
  conflict:['Regjeringspress møter et ubehagelig naturfaglig råd'],story:['Statsråden må eie kompromisset offentlig'],event:['Nye fakta endrer premisset etter politisk beslutning'],micro:['Avklar hvilket organ som faktisk kan beslutte'],followup:['Implementeringen virker svakere enn forutsatt'],knowledge:['History Go utløser et spørsmål, ikke et myndighetsgrunnlag'],consequence:['Skjult naturkostnad kommer tilbake som tillits- og styringsproblem']
};
const goodReply = 'Jeg skiller først dokumentert faggrunnlag, vesentlig usikkerhet og rettslig ramme fra den politiske avveiingen. Deretter registrerer jeg hvilket organ som faktisk eier beslutningen, hvilke alternativer som er lovlige, hvilke natur- og fordelingskostnader hvert alternativ har og hva som må vente på budsjett, regjering eller Storting. Hvis jeg velger et alternativ som avviker fra faglig anbefaling, bevarer jeg anbefalingen uendret og begrunner verdiprioriteringen som politisk. Nye fakta, ny hjemmelsvurdering eller svak implementering gjenåpner bare berørte ledd med tidligere begrunnelse intakt.';
const badReply = 'Jeg bruker statsrådstittelen og den politiske tidsplanen som tilstrekkelig grunnlag for å presse saken gjennom. Faglige innvendinger tones ned til de passer kommunikasjonen, og jeg lar det være uklart om beslutningen egentlig ligger hos departementet, regjeringen eller Stortinget. Naturkostnad og usikkerhet beskrives som om de var løst av det politiske valget, og implementeringen lukkes når budskapet er levert i stedet for når premissene faktisk er kontrollert.';
const goodFeedback = 'Grepet bevarer demokratisk og faglig etterprøvbarhet fordi embetsverk, regjering, Storting, berørte grupper og senere kontroll kan se hva som var fakta, hva som var usikkert, hvilken politisk verdiavveiing som ble gjort, hvilken hjemmel som bar tiltaket, hvem som eide beslutningen og hva implementeringen skulle måles mot. Statsråden bruker dermed reelt offentlig mandat uten å gjøre politisk makt til vitenskapelig evidens, og saken kan korrigeres når nye data eller rettslige premisser endres.';
const badFeedback = 'Løsningen kan gi kortsiktig politisk tempo, men den blander offentlig mandat, faglig evidens og kommunikasjon på en måte som gjør både ansvar og korrigering vanskelig. Når faglige råd tones ned, beslutningseier blir uklar eller hjemmel tas for gitt, kan verken Stortinget, forvaltningen eller offentligheten se hvilken del som var kunnskap og hvilken del som var politisk valg. Nye fakta blir da en omdømmekrise i stedet for et normalt grunnlag for rework.';
const longSummary = (subject,type) => `${subject}. Dette ${type}-steget føres i ${PERSISTENT}. Public_office_appointment, faktisk mandat, beslutningseier, faggrunnlag, usikkerhet, politiske alternativer, natur- og fordelingskostnader, rettslig hjemmel, budsjettpremiss, regjeringssamordning, stortingsrolle, offentlig begrunnelse, implementeringsansvar, ventepunkt og etterkontroll skal være separate og versjonerte felt. Statsråd (klima og miljø) kan bare materialiseres etter dokumentert public_office_appointment. Natur-badge, XP, ekspertise, omdømme eller popularitet kan aldri oppfylle denne gaten. Statsråden kan velge mellom lovlige politiske alternativer og stå ansvarlig for avveiingen, men kan ikke fabrikere hjemmel, gjøre regjeringsønske til naturvitenskapelig fakta, skjule vesentlig faglig usikkerhet eller opptre som om eget mandat erstatter regjeringen, Stortinget eller annen kompetent myndighet. History Go kan skjerpe spørsmål om natur, steder og økologi, men er ikke saksutredning, feltdata, juridisk vurdering eller beslutningshjemmel. En god løsning gjør derfor eksplisitt hva som er kunnskap, hva som er politikk, hvem som faktisk kan beslutte, hvilken kostnad som aksepteres, hva man venter på og hvilket nytt premiss som skal gjenåpne saken.`;
let mailIndex = 0;
for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
  const catalog = read(rel);
  const mails = catalog.families.flatMap(f=>f.mails||[]);
  for (let i=0;i<mails.length;i++) {
    const mail = mails[i];
    const actor = ACTORS[mailIndex % ACTORS.length];
    const place = PLACES[mailIndex % PLACES.length];
    const subject = (subjects[type] || [type])[i % (subjects[type] || [type]).length];
    mail.id = `politisk_myndighet_${type}_${String(i+1).padStart(3,'0')}`;
    mail.people_ref = actor.id;
    mail.place_id = place.id;
    mail.from = actor.name;
    mail.subject = subject;
    mail.summary = longSummary(subject,type);
    mail.situation = ['Beslutningssporet viser offentlig utnevnelse og mandat, faggrunnlag og usikkerhet, rettslig ramme, politiske alternativer, beslutningseier, åpne ventepunkter og hva implementeringen skal måles mot.','Presset er reelt: politisk tid, medielogikk, regjeringsforhandling eller krise kan gjøre det fristende å behandle ønsket utfall som om både fag og hjemmel allerede var avklart.','Du må velge et grep som bevarer skille mellom kunnskap, politikk og myndighet og som lar saken håndteres med handoff og avgrenset rework når premissene endres.'];
    mail.task_domain = 'klima_og_miljopolitisk_myndighet';
    mail.competency = 'fag_politikk_skille_mandat_hjemmel_avveiing_og_demokratisk_oppfolging';
    mail.pressure = 'faglige_rad_rettslig_handlingsrom_regjeringspress_storting_offentlighet_og_naturkostnad';
    mail.choice_axis = 'etterprovbar_politisk_avveiing_vs_mandatglidning_og_faglig_omskriving';
    mail.consequence_axis = 'demokratisk_tillit_og_korrigerbarhet_vs_skjult_kostnad_og_ansvarsuklarhet';
    mail.choices = [
      {id:'A',label:`Før ${subject.toLowerCase()} gjennom mandat- og beslutningssporet`,reply:goodReply,effect:1,tags:['mandat','fag_politikk_skille','sporbarhet'],feedback:goodFeedback,effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
      {id:'B',label:`Lukk ${subject.toLowerCase()} gjennom tittel og politisk tempo`,reply:badReply,effect:-1,tags:['tempo','mandatglidning','faglig_omskriving'],feedback:badFeedback,effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
    ];
    mailIndex++;
  }
  catalog.families[0].purpose = `Trene ${type} gjennom ett versjonert offentlig beslutningsspor uten å blande faggrunnlag, politisk avveiing, rettslig hjemmel og institusjonell myndighet.`;
  catalog.families[0].learning_focus = ['demokratisk_ansvar','fag_politikk_skille','mandat_og_hjemmel','naturkostnad','oppfolging'];
  write(rel,catalog);
}

fs.writeFileSync(path.join(root,SOURCE), `# Natur / Politisk myndighet — prerequisites source-first\n\n## Scope\n\nCanonical role: \`natur/natur_politisk_myndighet\`. This package materializes the playable Career/work foundation and is **not Role World completion**. The audience-bound realism layer remains reserved for the dedicated one-role rollout PR.\n\n## Real-world gate\n\n- **Statsråd (klima og miljø)** — \`appointment_required\` via \`public_office_appointment\`.\n- History Go, Natur-badge, XP, expertise, reputation and popularity are learning or game signals, never public appointment, legal authority or constitutional competence.\n\n## Source and decision discipline\n\nThe pre-existing canonical role model already requires explicit public appointment and a visible distinction between scientific advice and political choice. This package extends that rule into day-one play: four bounded work actors, four decision surfaces, one persistent decision trace, seven waiting states, handoff/rework, a 16-step plan and **15 source mails** across all nine canonical mail types. Scientific advice, uncertainty, political alternatives, nature and distributional costs, legal basis, budget premise, decision owner, public reasoning, implementation and later correction remain separately traceable.\n\n## Authority\n\nThe player may exercise political authority only after real public appointment and only inside the mandate actually held. The role may choose and justify lawful political alternatives, coordinate government work and follow implementation. It may not fabricate legal basis or government decisions, suppress material scientific uncertainty, present policy preference as scientific fact or borrow authority from History Go.\n\n## Cross-role\n\nThis prerequisite package does not invent a shared-work relationship. Any later cross-role object must be supported by actual shared work, explicit ownership and the relevant role boundaries.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. Existing Career gates, Scene Pipeline, mail machinery and audits remain canonical.\n`);

const test = `const assert = require('node:assert/strict');\nconst fs = require('node:fs');\nconst path = require('node:path');\nconst ROOT = path.resolve(__dirname, '..');\nconst read = rel => JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));\nconst exists = rel => fs.existsSync(path.join(ROOT,rel));\nconst KEY='natur/natur_politisk_myndighet';\nconst ROLE='natur_politisk_myndighet';\nconst MODEL='data/Civication/roleModels/natur/natur_politisk_myndighet.json';\nconst GRAMMAR='data/Civication/workGrammars/natur/natur_politisk_myndighet.json';\nconst PLAN='data/Civication/mailPlans/natur/natur_politisk_myndighet_plan.json';\nconst WORLD='data/Civication/roleWorlds/natur/natur_politisk_myndighet.json';\nconst TYPES=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];\nconst ACTORS=${JSON.stringify(ACTORS.map(a=>a.id))};\nconst PLACES=${JSON.stringify(PLACES.map(p=>p.id))};\nconst PERSISTENT='${PERSISTENT}';\nassert.ok(exists(MODEL)&&exists(GRAMMAR)&&exists(PLAN));\nconst model=read(MODEL), grammar=read(GRAMMAR), plan=read(PLAN);\nassert.equal(model.schema,'civication_role_model_v2'); assert.equal(model.role_scope,ROLE);\nassert.deepEqual(model.work_life.workplaces,PLACES); assert.deepEqual(model.related_people.map(p=>p.id),ACTORS);\nassert.ok(model.required_knowledge.skills.length>=12); assert.deepEqual(model.required_knowledge.history_go_badges,['natur']);\nfor(const p of model.related_people){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);assert.ok(p.function.length>=220);assert.ok(p.authority_relation.length>=250);}\nfor(const p of model.related_places) assert.ok(p.function.length>=220);\nassert.deepEqual(grammar.actor_grammar.map(a=>a.id),ACTORS); assert.deepEqual(grammar.place_grammar.map(p=>p.id),PLACES);\nassert.equal(grammar.persistent_work_object_contract.id,PERSISTENT); assert.ok(grammar.persistent_work_object_contract.states.length>=20);\nassert.match(grammar.rhythm_contract.loop,/waiting|venting/i); assert.equal(grammar.rhythm_contract.waiting_states.length,7);\nassert.equal(grammar.day_one_contract.entry_policy_by_title['Statsråd (klima og miljø)'].policy,'appointment_required');\nassert.deepEqual(grammar.day_one_contract.entry_policy_by_title['Statsråd (klima og miljø)'].qualification_ids,['public_office_appointment']);\nassert.deepEqual(grammar.mail_generation_contract.required_mail_types,TYPES); assert.equal(grammar.mail_generation_contract.no_generic_fallback,true);\nconst overlay=read('data/Civication/badgeCareerContracts/natur.json'); const offer=overlay.tiers.find(t=>t.career_offer?.role_scope===ROLE).career_offer;\nassert.equal(offer.policy,'appointment_required'); assert.deepEqual(offer.qualification_ids,['public_office_appointment']);\nassert.equal(plan.id,'natur_politisk_myndighet_foundation_v1'); assert.equal(plan.sequence.length,16);\nlet total=0; for(const type of TYPES){const cat=read(\`data/Civication/mailFamilies/natur/\${type}/\${ROLE}_\${type}.json\`); const mails=cat.families.flatMap(f=>f.mails||[]); total+=mails.length; for(const m of mails){assert.equal(m.role_scope,ROLE);assert.ok(ACTORS.includes(m.people_ref));assert.ok(PLACES.includes(m.place_id));assert.ok(m.summary.length>=700);assert.equal(m.choices.length,2);for(const c of m.choices){assert.ok(c.reply.length>=380);assert.ok(c.feedback.length>=430);}}} assert.equal(total,15);\nconst pack=read('data/Civication/rolePackIndex.json').roles.find(r=>r.category==='natur'&&r.role_scope===ROLE); assert.ok(pack); assert.equal(pack.status,'complete_reference_v2');\nconst career=read('data/Civication/careerGameplayMatrix.json').worlds.find(r=>r.key===KEY); assert.ok(career); assert.equal(career.status,'playable'); assert.equal(career.audit.runtime_gate,true); assert.deepEqual(career.audit.missing_components,[]);\nconst readiness=read('data/Civication/roleWorldRolloutReadiness.json'); const ready=readiness.roles.find(r=>r.key===KEY); assert.ok(ready); assert.equal(ready.classification,'rollout_ready');\nfor(const dim of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance']) assert.equal(ready.dimensions[dim].status,'foundation_ready');\nassert.equal(readiness.rollout_queue.some(r=>r.key===KEY&&r.classification==='rollout_ready'),!exists(WORLD));\nconst scenarioPeople=read('data/Civication/scenarioPeople/generated/natur.json'); const factual=new Set(Object.values(scenarioPeople.people_pool||{}).flat().map(p=>p.person_id)); for(const id of ACTORS) assert.ok(!factual.has(id));\nconst boundary=JSON.stringify({model,grammar}).toLowerCase(); for(const term of ['public_office_appointment','history go','natur-badge','hjemmel','storting','regjering','faggrunnlag','usikkerhet']) assert.ok(boundary.includes(term),term);\nconsole.log('PASS: Natur Politisk myndighet foundation is playable and rollout-ready while public appointment and authority remain external.');\n`;
fs.writeFileSync(path.join(root,TEST),test);

for (const person of model.related_people) {
  if (person.function.length < 220) throw new Error(`${person.id}: function depth ${person.function.length}`);
  if (person.authority_relation.length < 250) throw new Error(`${person.id}: authority depth ${person.authority_relation.length}`);
}
for (const place of model.related_places) if (place.function.length < 220) throw new Error(`${place.id}: place depth ${place.function.length}`);
for (const type of TYPES) {
  const catalog = read(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`);
  for (const mail of catalog.families.flatMap(f=>f.mails||[])) {
    if (mail.summary.length < 700) throw new Error(`${mail.id}: summary ${mail.summary.length}`);
    for (const choice of mail.choices) {
      if (choice.reply.length < 380) throw new Error(`${mail.id}/${choice.id}: reply ${choice.reply.length}`);
      if (choice.feedback.length < 430) throw new Error(`${mail.id}/${choice.id}: feedback ${choice.feedback.length}`);
    }
  }
}
console.log(JSON.stringify({role:ROLE,actors:ACTORS.length,places:PLACES.length,mail_types:TYPES.length,total_mails:15,persistent:PERSISTENT},null,2));
