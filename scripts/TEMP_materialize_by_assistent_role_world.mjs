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

const ROLE = 'by_assistent';
const KEY = 'by/by_assistent';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_assistent.json';
const THREAD = 'by_assistent.case.kartavvik_og_stedsbruk';
const refs = {
  job:'data/Civication/mailFamilies/by/job/by_assistent_job.json#by_assistent_job_kart_001',
  people:'data/Civication/mailFamilies/by/people/by_assistent_people.json#by_assistent_people_ingrid_001',
  conflict:'data/Civication/mailFamilies/by/conflict/by_assistent_conflict.json#by_assistent_conflict_kart_befaring_001',
  event:'data/Civication/mailFamilies/by/event/by_assistent_event.json#by_assistent_event_kveldsbefaring_001',
  micro:'data/Civication/mailFamilies/by/micro/by_assistent_micro.json#by_assistent_micro_kildespor_001',
  story:'data/Civication/mailFamilies/by/story/by_assistent_story.json#by_assistent_story_stedsnotat_001',
  knowledge:'data/Civication/mailFamilies/by/knowledge/by_assistent_knowledge.json#by_assistent_knowledge_kart_sted_001',
  followup:'data/Civication/mailFamilies/by/followup/by_assistent_followup.json#by_assistent_followup_kartavvik_001',
  consequence:'data/Civication/mailFamilies/by/consequence/by_assistent_consequence.json#by_assistent_consequence_grunnlag_001'
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'info',lunch:'conversation',afternoon:'task',evening:'private_consequence'};
const phaseThreads = {
  morning:'kartgrunnlag_og_usikkerhet',
  lunch:'faglig_overlevering_og_standing',
  afternoon:'befaring_medvirkning_og_kontroll',
  evening:'forsinket_konsekvens_og_privataftermath'
};
const dayThemes = [
  'Et ryddig kartlag viser en tydelig kant, mens bilder og faktisk bruk peker mot en mer sammensatt overgang. Assistentens verdi ligger i å bevare avviket som etterprøvbar informasjon før andre gjør det til planpremiss.',
  'Flere kart- og datakilder er nesten enige, men forskjellene er store nok til å påvirke senere analyse. Kildespor, dato og formål må følge materialet videre slik at assistenten ikke belønnes for falsk sikkerhet.',
  'Befaringen viser en snarvei og en oppholdssone som ikke samsvarer med den planlagte funksjonen. Observasjonen må beskrives presist, uten å bli løftet til endelig faglig konklusjon som assistenten ikke eier.',
  'Ingrid trenger et kort svar om kartavviket før hun avgjør om saken må undersøkes mer. Assistenten kan bygge tillit ved å skille funn, tolkning og åpen usikkerhet selv når et mer sikkert svar ville gitt raskere status.',
  'Jonas ser at kart og befaring ikke begge kan beskrive bruken riktig. Konflikten må bevares i notatet og overleveres som et kontrollbehov i stedet for å glattes bort fordi en formell datakilde ser ryddigere ut.',
  'Maria samler flere innspill om samme mørke ganglinje. Assistenten må skille enkelterfaring, gjentakende mønster og hva som faktisk er observert, slik at medvirkning blir evidens uten å bli et løfte om bestemt utfall.',
  'En kort kveldsbefaring kan teste trygghetsinnspillene på riktig tidspunkt. Rollen må vise at relevant observasjon krever riktig situasjon, samtidig som én befaring fortsatt ikke gir myndighet til å konkludere på vegne av planlegger eller arkitekt.',
  'Arbeidsfilen inneholder to nesten like kartlag med ulik dato og geometri. Noen minutters kildekontroll kan koste tempo nå, men styrke standing senere når andre trenger å forstå nøyaktig hva en vurdering bygget på.',
  'Det lille stedsnotatet begynner å knytte kartavvik, snarvei, opphold og innspill til samme konflikt mellom planlagt funksjon og faktisk bruk. Sammenstillingen må bevare usikkerhet i stedet for å gjøre den usynlig i en pen punktliste.',
  'En ny leveranse bruker den gamle kartkanten som om den var avklart. Den eksisterende dokumentasjonen avgjør om teamet kan gjøre en presis revisjon eller må rekonstruere arbeidet, og standing kan derfor endres lenge etter støtteoppgaven.',
  'Prosjektmiljøet ønsker et raskt og tydelig grunnlag, mens Ingrid trenger at tvilen er synlig. Assistenten opplever at samme handling kan gi høyere status hos dem som ønsker tempo og lavere tillit hos dem som må kunne etterprøve premisset senere.',
  'Innbyggere og brukere ser at deres erfaringer er sammenfattet i prosjektmaterialet. Assistentens standing avhenger av om stemmene er representert nøkternt og sporbarheten er bevart, ikke av om materialet støtter et ønsket prosjektutfall.',
  'Jonas oppdager at et designvalg faktisk avhenger av hva det gamle kartavviket betydde. Et godt kildespor avgrenser revisjonen; et svakt spor gjør støttearbeidets tidligere prestisje irrelevant og tvinger frem ny kontroll.',
  'Perioden avsluttes med et etterprøvbart stedsgrunnlag: kart, befaring, medvirkning og usikkerhet er holdt fra hverandre og koblet sammen. Assistenten kan få ulik standing i ulike miljøer uten at noen av dem gir formell plan- eller byggesaksmyndighet.'
];
const phaseTail = {
  morning:'Morgenen oppdaterer siste bekreftede kilde, observasjon eller åpent premiss og gjør tydelig hva støttearbeidet faktisk vet før andre aktører bygger videre på det.',
  lunch:'Lunsjflaten viser at standing er situert: Ingrid, Jonas, Maria, prosjektmiljøet, berørte brukere og private relasjoner vurderer presisjon, tempo og synlighet av usikkerhet forskjellig.',
  afternoon:'Ettermiddagen bruker eksisterende arbeidsrytme til befaring, grunnlagskontroll, medvirkning, dokumentasjon eller overlevering uten å gjøre dette til et nytt authored rhythm-system.',
  evening:'Kvelden viser forsinket sosial eller privat konsekvens når lav rang, ros, kritikk og et uferdig grunnlag følger med hjem uten at profesjonell standing blir personlig verdi.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type:phaseTypes[phase],
      summary:`Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids:[phaseThreads[phase]],
      materialization_refs:[refCycle[((day - 1) * 4 + pi) % refCycle.length]]
    });
  }
}

const theme_ids = [
  'professional_culture',
  'bureaucratic_power',
  'status_anxiety',
  'shame_reputation',
  'loyalty_up_down',
  'social_mask',
  'precarity',
  'care_vs_efficiency'
];

const existing_work_continuity = {
  runtime_binding:'existing_mail_and_work_grammar',
  thread_key:THREAD,
  new_runtime_state:false,
  work_loops:['sak_eller_prosjekt','kvalitetssikring'],
  rule:'Eksisterende work grammar og canonical kartavvik-thread beviser allerede persistent arbeid, overlevering, avvik, revisjon og sporbarhet. Denne rollouten gjenbruker dem og authorer ikke nytt rhythm- eller dokumentruntime.'
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere mellom ansvarlig byplanlegger, arkitekt-/prosjekteringsteam, medvirkningsmiljø, prosjektarbeidsmiljø, berørte brukere/innbyggere og studentens private relasjoner. Ingen global reputation-score materialiseres.',
  authority_separation:'Standing kan aldri gi assistenten plan- eller byggesaksmyndighet, bindende lovtolkning, rett til å love utbyggingsutfall eller rett til å erstatte ansvarlig fagpersons plan-, arkitekt- eller annen profesjonell konklusjon.',
  audiences:[
    {id:'responsible_city_planner',standing_axis:'planner_trust_standing',cares_about:['presis usikkerhet og kildespor','gode spørsmål som gjør ansvarlig vurdering lettere','tydelig skille mellom observasjon og konklusjon'],cannot_grant:'Tilliten hos ansvarlig byplanlegger kan ikke gi assistenten formell plan- eller byggesaksmyndighet eller rett til å fatte den ansvarliges faglige konklusjon.'},
    {id:'architect_project_team',standing_axis:'architect_team_standing',cares_about:['brukbar stedlig evidens','sporbare grensesnitt og revisjonsgrunnlag','materiale som kan kontrolleres uten rekonstruksjon'],cannot_grant:'Standing hos arkitekt- og prosjekteringsteamet kan ikke gi assistenten arkitektfaglig sluttansvar, godkjenningsmyndighet eller rett til å gjøre egne observasjoner til endelig vurdering.'},
    {id:'participation_team',standing_axis:'participation_team_standing',cares_about:['presis registrering av stemmer','skille mellom enkelthistorier og mønstre','ingen falske løfter om resultat'],cannot_grant:'Medvirkningsmiljøets tillit kan ikke gi assistenten mandat til å love utfall, velge hvilke interesser som skal vinne eller erstatte formell saks- og planvurdering.'},
    {id:'project_work_environment',standing_axis:'project_reliability_standing',cares_about:['pålitelig levering og versjonskontroll','sporbar dokumentasjon','tidlig eskalering av risiko og kildeavvik'],cannot_grant:'Prosjektmiljøets status og tidspress kan ikke gi assistenten bindende lovtolkning, planmyndighet eller rett til å skjule faglig usikkerhet for å holde fremdrift.'},
    {id:'affected_users_residents',standing_axis:'resident_representation_standing',cares_about:['at faktisk bruk og trygghet blir representert nøkternt','at innspill ikke glattes bort eller brukes som dekor','at forskjellen mellom erfaring og konklusjon er synlig'],cannot_grant:'Berørte brukeres støtte kan ikke gi assistenten vedtaksmyndighet eller rett til å framstille én erfaring som endelig faglig sannhet eller lovet prosjektutfall.'},
    {id:'student_private_relations',standing_axis:'student_private_status_mask',cares_about:['at lav yrkesrang ikke behandles som personlig mindreverd','at ros og kritikk på jobb kan legges bort privat','at læring og spørsmål ikke blir tolket som inkompetanse'],cannot_grant:'Private relasjoner eller medstudenters vurdering kan ikke gi profesjonell myndighet, endre ansvarslinjer eller gjøre personlig status til faglig godkjenning.'}
  ],
  divergence_examples:[
    'Å markere et kartavvik som uavklart kan svekke kortsiktig standing i et fremdriftspresset prosjektmiljø og samtidig styrke Ingrid sin tillit til assistentens presisjon.',
    'Et kort, glanset sammendrag kan oppfattes effektivt internt, men svekke standing hos Maria eller berørte brukere dersom forskjeller og usikkerhet forsvinner.',
    'Å be om ny befaring kan se forsiktig ut hos en aktør som vil ha rask levering, men styrke standing hos Jonas senere når revisjonen kan avgrenses med faktisk evidens.'
  ]
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'by',
  role_scope:ROLE,
  title:'By-assistent — sporbarhet, lav rang og situert faglig tillit',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å være nyttig i et lavt rangert støttearbeid uten å forveksle tempo, synlighet eller ros med faglig myndighet, og samtidig bygge situert tillit ved å gjøre usikkerhet, kilder og stedlig motstand presise nok til at andre kan ta bedre beslutninger.',
    description:'Role World-en lukker bare situated_reputation-gjelden. Den gjenbruker eksisterende work loops og kartavvik-thread for persistent arbeid, handoff, avvik og senere revisjon uten å reautorisere disse dimensjonene som nytt authored arbeid.'
  },
  theme_ids,
  social_environments:[
    'Kart- og grunnlagsbordet der små kildeforskjeller kan bli store premisser og assistentens status fristes til å følge hvor sikkert materialet ser ut.',
    'Befaringen der stedets faktiske bruk kan motsi kartet og der en lavt rangert observatør må gjøre funnet synlig uten å utrope det til endelig konklusjon.',
    'Medvirkningsbordet der Maria hjelper med å bevare forskjellen mellom stemme, mønster, tone og løfte om resultat.',
    'Prosjektgjennomgangen der Ingrid og Jonas trenger et grunnlag som kan etterprøves, og der tempo kan belønne falsk sikkerhet før kostnaden blir synlig.',
    'Senere leveranser der den gamle kartkanten kommer tilbake og gjør tidligere kildespor til en reell ressurs eller en kostbar mangel.',
    'Berørte brukeres hverdagssted der trygghet, ganglinjer og faktisk bruk har situert evidensverdi uten å gi assistenten vedtaksmyndighet.',
    'Student- og privatlivet der lav yrkesrang, læring, ros og kritikk må holdes adskilt fra personlig verdi.'
  ],
  recurring_people_archetypes:[
    {id:'assistent_planner_world',social_function:'ansvarlig byplanlegger som bestiller grunnlag og vurderer om usikkerhet er tydelig nok til å bruke materialet videre',class_position:'faglig overordnet med beslutningsansvar i planarbeidet',status:'høyere formell status og tydelig ansvar',power_over_player:'kan fordele oppgaver, be om ny kontroll og avgjøre om støttearbeidet er godt nok som grunnlag',wants:'presise kilder, synlig usikkerhet og materiale som gjør ansvarlig vurdering enklere',conceals:'at tidspress også kan gjøre et raskt sikkert svar fristende selv når det faglig burde stå åpent',speech_style:'kort og presis; spør hva du vet, hva du ikke vet og hvor kilden er',teaches_player:'at lav rang kan bygge sterk faglig tillit gjennom presis avgrensning av egen kunnskap'},
    {id:'assistent_architect_world',social_function:'arkitekt som bruker befaring og stedsnotat for å teste om tegnet funksjon stemmer med faktisk bruk',class_position:'faglig samarbeidspartner med høyere ansvar for designkonsekvens',status:'middels til høy fagstatus',power_over_player:'kan gjøre en observasjon operativ i designet eller utfordre om materialet tåler revisjonsbeslutningen',wants:'stedlig evidens som er konkret nok til å avgrense en riktig revisjon',conceals:'at prosjektet gjerne vil bruke støttearbeidet raskere enn kildene alltid tillater',speech_style:'romlig og konsekvensnær; spør hva avviket betyr for inngang, ganglinje og bruk',teaches_player:'at støttearbeid får verdi når andre fag kan bruke det uten å rekonstruere premisset'},
    {id:'assistent_participation_world',social_function:'medvirkningsansvarlig som hjelper med å skille enkelthistorier, mønstre og løfter om resultat',class_position:'faglig sidestilt spesialist med ansvar for prosess og representasjon',status:'middels formell status og høy tillit hos deltakere',power_over_player:'kan utfordre et sammendrag som gjør variasjon eller usikkerhet usynlig',wants:'sporbare stemmer, nøktern mønsterlesning og ingen falske løfter',conceals:'at et enkelt sammendrag ofte er lettere å få lest enn et mer sant materiale med motstand',speech_style:'rolig og prosessnær; spør hvem som sa hva, hva som går igjen og hva dere ikke kan love',teaches_player:'at representasjon bygger situert tillit når forskjeller bevares i stedet for å brukes strategisk'},
    {id:'assistent_project_world',social_function:'prosjektkoordinator eller arbeidsmiljø som belønner levering, versjonskontroll og lav friksjon',class_position:'organisatorisk mellomnivå med kontroll over frister og informasjonsflyt',status:'middels organisatorisk status',power_over_player:'kan gjøre rask levering synlig og forsinkelse sosialt kostbar',wants:'ryddig materiale, sporbare versjoner og få overraskelser senere',conceals:'at ønsket om lav friksjon kan presse usikkerhet ut av dokumentet før den er faglig avklart',speech_style:'leveranseorientert; spør om frist, versjon og hva som blokkerer neste steg',teaches_player:'at prosjektstanding og faglig sannhet kan trekke i ulike retninger uten at tempo endrer myndighetsgrenser'},
    {id:'assistent_resident_world',social_function:'berørt bruker eller innbygger som møter stedet i hverdagen og forventer at erfaringen blir representert nøkternt',class_position:'uten formell prosjektmakt men med legitim situert kunnskap om bruk og trygghet',status:'lav formell status og varierende offentlig synlighet',power_over_player:'kan synliggjøre at et ryddig kart eller sammendrag overser faktisk bruk',wants:'at erfaringen ikke glattes bort, overtolkes eller brukes som pynt for et allerede valgt utfall',conceals:'at én erfaring ikke alene kan bære hele saken selv når den avdekker et reelt problem',speech_style:'konkret og hverdagsnær; beskriver hvor, når og hvordan stedet faktisk fungerer',teaches_player:'at offentlig tillit bygger på presis representasjon, ikke på å gi alle løfter om å få viljen sin'},
    {id:'assistent_peer_world',social_function:'medstudent eller annen tidlig karriererelasjon som sammenligner oppgaver, læring og status',class_position:'sosial likemann uten profesjonell myndighet',status:'jevn formell status men høy sammenligningskraft',power_over_player:'kan gjøre små støtteoppgaver til tegn på fremgang eller nederlag i selvbildet',wants:'å forstå egen utvikling uten at titler og synlighet blir hele målestokken',conceals:'egen usikkerhet om hvem som får de mest synlige oppgavene og hva det sier om fremtidig karriere',speech_style:'uformell og sammenlignende; spør hva du egentlig fikk ansvar for og hva du lærte',teaches_player:'at situated professional standing ikke er det samme som personlig eller langsiktig verdi'},
    {id:'assistent_private_world',social_function:'privat nær relasjon som møter personen etter dager med små oppgaver, usikkerhet og lite synlig prestisje',class_position:'privat likemann uten prosjekt- eller fagmyndighet',status:'emosjonell nærhet uten profesjonell rang',power_over_player:'kan utfordre behovet for å lese hvert arbeidsoppdrag som dom over egen kompetanse',wants:'at arbeidet kan legges bort og at lav rang ikke blir personlig mindreverd',conceals:'at samtaler blir utmattende dersom all kritikk fra jobb tas med hjem som bevis på personlig status',speech_style:'direkte og avdramatiserende; spør om du gjorde arbeidet redelig og om noen faktisk trenger mer fra deg nå',teaches_player:'at privat identitet kan beskytte læring og dømmekraft mot statusangst i tidlig karriere'}
  ],
  slow_axes:[
    {id:'source_trace_quality',meaning:'om kartlag, dato, befaring, innspill og senere sammendrag forblir koblet på en måte andre kan etterprøve',runtime_binding:'editorial_only_until_governed'},
    {id:'uncertainty_visibility',meaning:'om åpen usikkerhet forblir synlig før den blir behandlet som avklart premiss av andre',runtime_binding:'editorial_only_until_governed'},
    {id:'planner_trust_standing',meaning:'situert tillit hos ansvarlig byplanlegger til presis usikkerhet, gode spørsmål og sporbar overlevering',runtime_binding:'editorial_only_until_governed'},
    {id:'architect_team_standing',meaning:'situert tillit hos arkitekt- og prosjekteringsteam til brukbar evidens og revisjonsgrunnlag',runtime_binding:'editorial_only_until_governed'},
    {id:'participation_team_standing',meaning:'situert tillit i medvirkningsmiljøet til presis representasjon uten falske løfter eller utglatting',runtime_binding:'editorial_only_until_governed'},
    {id:'project_reliability_standing',meaning:'situert status i arbeidsmiljøet rundt levering, versjonskontroll, sporbarhet og tidlig risikoeskalering',runtime_binding:'editorial_only_until_governed'},
    {id:'resident_representation_standing',meaning:'situert tillit hos berørte brukere til at faktisk bruk og innspill blir representert nøkternt',runtime_binding:'editorial_only_until_governed'},
    {id:'student_private_status_mask',meaning:'hvor sterkt lav yrkesrang, ros og kritikk smelter sammen med personlig verdi i student- og privatlivet',runtime_binding:'editorial_only_until_governed'}
  ],
  existing_work_continuity,
  situated_reputation_model,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'map_source_uncertainty',beat_refs:['1/morning','2/morning','4/lunch','5/afternoon','8/morning','10/afternoon','13/lunch']},
    {id:'site_observation',beat_refs:['1/afternoon','3/morning','3/afternoon','5/morning','7/afternoon','9/lunch','12/afternoon']},
    {id:'participation_representation',beat_refs:['2/lunch','6/morning','6/lunch','7/morning','9/afternoon','12/lunch','14/lunch']},
    {id:'documented_followup',beat_refs:['4/morning','8/afternoon','9/morning','10/morning','10/afternoon','11/afternoon','13/afternoon','14/afternoon']},
    {id:'situated_standing',beat_refs:['1/lunch','4/lunch','6/afternoon','8/lunch','11/morning','11/lunch','12/morning','14/morning']},
    {id:'private_low_rank_status',beat_refs:['2/evening','4/evening','6/evening','8/evening','10/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_uncertainty_answer',beat_ref:'4/evening',meaning:'Et presist men mindre sikkert svar kan kjennes som svakere prestasjon selv når Ingrid faktisk får et bedre beslutningsgrunnlag.'},
    {id:'after_participation',beat_ref:'6/evening',meaning:'Å bevare motstridende innspill kan føles som manglende konklusjon, men beskytter både representasjon og egen rollegrense.'},
    {id:'after_evening_site_visit',beat_ref:'7/evening',meaning:'En liten støtteoppgave uten høy prestisje kan gi viktig evidens og samtidig være vanskelig å forklare som karrierefremgang privat.'},
    {id:'after_followup',beat_ref:'10/evening',meaning:'At et gammelt kildespor blir viktig senere viser verdien av usynlig arbeid uten at det nødvendigvis gir synlig status i øyeblikket.'},
    {id:'after_status_divergence',beat_ref:'11/evening',meaning:'Ulik vurdering fra prosjektmiljø og faglig ansvarlige må ikke bli én samlet dom over assistentens personlige kompetanse.'},
    {id:'after_design_consequence',beat_ref:'13/evening',meaning:'En senere designkonsekvens kan gjøre tidligere støttearbeid synlig, men ansvar for selve designvedtaket forblir hos riktig fagrolle.'}
  ],
  delayed_consequences:[
    {id:'map_edge_returns',setup_ref:'1/morning',return_ref:'10/afternoon',meaning:'Det tidlige kartavviket kommer tilbake i ny leveranse og viser om usikkerheten var sporbar.'},
    {id:'source_labels_return',setup_ref:'2/morning',return_ref:'8/afternoon',meaning:'Kildemerkingens verdi blir synlig når nesten like kartlag ellers ville vært vanskelige å rekonstruere.'},
    {id:'site_use_returns',setup_ref:'3/afternoon',return_ref:'9/afternoon',meaning:'Den faktiske stedsbruken påvirker senere stedsnotat uten at den gjøres til ubegrunnet totalforklaring.'},
    {id:'planner_handover_returns',setup_ref:'4/lunch',return_ref:'11/morning',meaning:'Måten usikkerhet ble overlevert på påvirker senere standing hos både planlegger og prosjektmiljø.'},
    {id:'participation_returns',setup_ref:'6/lunch',return_ref:'12/lunch',meaning:'Tidligere medvirkningsnotater viser senere om stemmer og mønstre ble representert redelig.'},
    {id:'design_consequence_returns',setup_ref:'10/afternoon',return_ref:'14/afternoon',meaning:'Den canonicale kartavvik-tråden ender i faktisk designkonsekvens der kildespor avgrenser revisjonen.'}
  ],
  cross_role_link:{status:'candidate_when_shared_work_is_real',materialized:false,new_runtime:false,rule:'Cross-role materialiseres først når et genuint shared work-object eller delt arbeid har en bevist canonical runtime-eier; eksisterende Ingrid-, Jonas- og Maria-relasjoner alene er ikke nok.'},
  materialization:{
    authored_dimensions:['situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    existing_persistent_work_preserved:true,
    existing_rhythm_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refCycle
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.path === WORLD_PATH)) {
  index.roles.push({category:'by',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'twenty_eight_role_worlds_materialized';
index.effective_date = '2026-08-28';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds ||= [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles ||= {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

const report = `# Civication By Assistent Role World rollout\n\n- status: role_world_complete\n- authored dimension: situated_reputation only\n- coverage: 14 days / 56 beats\n- canonical source refs: 9\n- existing continuity reused: ${THREAD}\n- existing persistent work and rhythm preserved, not re-authored\n- canonical role model preserved: data/Civication/roleModels/by/studentassistent.json\n- existing 8-step mail plan and work grammar preserved\n- cross-role: candidate_when_shared_work_is_real / not materialized\n- new runtime: false\n- global reputation score: forbidden\n\nAuthority remains fail-closed: standing cannot grant plan/building-case authority, binding legal interpretation, promised development outcomes, or the right to replace the responsible professional conclusion.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_BY_ASSISTENT_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${WORLD_PATH}: ${coverage.length} beats / ${refCycle.length} canonical source refs`);
