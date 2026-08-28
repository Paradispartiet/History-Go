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

const ROLE = 'by_prosjektleder';
const KEY = 'by/by_prosjektleder';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_prosjektleder.json';
const THREAD = 'by_prosjektleder.case.kostnadsrisiko_og_kvalitet';
const refs = {
  job:'data/Civication/mailFamilies/by/job/by_prosjektleder_job.json#by_prosjekt_job_risiko_001',
  people:'data/Civication/mailFamilies/by/people/by_prosjektleder_people.json#by_prosjektleder_people_lena_001',
  conflict:'data/Civication/mailFamilies/by/conflict/by_prosjektleder_conflict.json#by_prosjektleder_conflict_ansvar_001',
  event:'data/Civication/mailFamilies/by/event/by_prosjektleder_event.json#by_prosjektleder_event_avhengighetsmote_001',
  micro:'data/Civication/mailFamilies/by/micro/by_prosjektleder_micro.json#by_prosjektleder_micro_beslutningslogg_001',
  story:'data/Civication/mailFamilies/by/story/by_prosjektleder_story.json#by_prosjektleder_story_styringssak_001',
  knowledge:'data/Civication/mailFamilies/by/knowledge/by_prosjektleder_knowledge.json#by_prosjektleder_knowledge_risiko_001',
  followup:'data/Civication/mailFamilies/by/followup/by_prosjektleder_followup.json#by_prosjektleder_followup_kostnad_001',
  consequence:'data/Civication/mailFamilies/by/consequence/by_prosjektleder_consequence.json#by_prosjektleder_consequence_kostnad_001'
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'info',lunch:'conversation',afternoon:'task',evening:'private_consequence'};
const phaseThreads = {
  morning:'mandat_risiko_og_beslutningsspor',
  lunch:'styringsdialog_og_situert_standing',
  afternoon:'avhengigheter_medvirkning_og_replanlegging',
  evening:'forsinket_styringskonsekvens_og_privataftermath'
};
const dayThemes = [
  'Den politiske bestillingen samler grønnere byrom, bolig, mobilitet og gjennomføring i én attraktiv ambisjon, men prosjektet kan ikke styres redelig før målkonfliktene oversettes til tydelige premisser, åpne avveiinger og reelle beslutningseiere.',
  'Kommunalsjef Lena trenger én dato til videre styringsdialog mens to eksterne avhengigheter og kostnadsbildet fortsatt beveger seg. Prosjektlederen må levere nyttig styringsinformasjon uten å gjøre et scenario til et løfte prosjektet ikke kontrollerer.',
  'Sigrid ser en usikker kostnadsrisiko i grunnarbeidet som ennå ikke er sikker nok til å stoppe prosjektet, men stor nok til å true grøntdrag, medvirkning og gatekvalitet senere. Tidlig varsling må bevare handlingsrom uten å late som risikoen allerede er et faktum.',
  'Amin oppdager at en kritisk trafikkavklaring mangler navngitt beslutningseier, og prosjektgruppen fristes til å velge en midlertidig løsning selv for å holde milepælen. Framdrift kan ikke fylle et tomt mandat med myndighet prosjektet ikke har.',
  'Transport, VA, miljø og prosjektet møter med gode statusnotater, men den kritiske avhengigheten mangler fortsatt en eier som faktisk kan beslutte. Prosjektlederen må gjøre møtet til et beslutningspunkt med mandat, grunnlag og frist i stedet for bare mer aktivitet.',
  'Maria varsler at medvirkning og utbyggerdialog begynner å gli sammen fordi ett felles møte virker effektivt. Prosjektlederen må beskytte forskjellen mellom å bli hørt, å bli faglig vurdert og å forhandle om et prosjektutfall som ingen kan love på forhånd.',
  'Beslutningsloggen viser hva som ble valgt, men ikke kostnadsforutsetningen og avhengigheten som gjorde valget forsvarlig. En liten dokumentasjonsrevisjon nå avgjør om senere endring kan forstås som legitim respons på nytt grunnlag eller som uforklarlig avvik.',
  'Det oppdaterte kostnadsestimatet gjør den tidlige risikoen mer sannsynlig, og kvalitetene som var lettest å kalle fleksible står først i kuttlisten. Prosjektlederen må bruke det eksisterende risikosporet til å replanlegge åpent i stedet for å skjule kvalitetsprioritering som teknisk nødvendighet.',
  'Styringssaken må nå vise hva ledelsen faktisk eier: alternativer for tid, omfang, ressurs og bykvalitet, deres forutsetninger og risiko. En enkel anbefaling kan være lettere å kommunisere, men kan også skjule avveiingen som beslutningseier må stå ansvarlig for.',
  'En ekstern prosjektaktør ber om en forutsigbar milepæl for å kunne planlegge egen leveranse. Prosjektlederen må være tydelig nok til å koordinere uten å love kommunal framdrift, planutfall eller avhengigheter som fortsatt eies av andre.',
  'Et formelt beslutningsnivå trenger et avklart spørsmål, relevant evidens og tydelig mandat før det kan ta over. Handoff må bevare både usikkerhet og tidligere premisser slik at riktig eier faktisk beslutter saken i stedet for bare å legitimere prosjektets foretrukne løsning.',
  'Berørte innbyggere og brukere ser at budsjett- og tidsvalgene påvirker grøntdrag, trygghet, opphold og medvirkning. Prosjektets standing kan ikke reduseres til én popularitetsmåling; ulike grupper vurderer redelighet, kvalitet og gjennomføring fra forskjellige posisjoner.',
  'Den tidligere kostnadsrisikoen er nå konkret nok til å kreve ny styringssak, og presset for å beskytte datoen er sterkt. Prosjektlederen må tåle at åpen replanlegging kan svekke kortsiktig status hos noen samtidig som beslutningsspor og langsiktig tillit styrkes andre steder.',
  'Perioden avsluttes når den opprinnelige risikoen, endrede forutsetninger og beslutningsloggen gjør en vanskelig revisjon styrbar. Prosjektlederen skal kunne vise hva som endret seg, hvem som eier neste beslutning og hvorfor standing aldri kan erstatte lov, mandat eller fullmakt.'
];
const phaseTail = {
  morning:'Morgenen oppdaterer siste bekreftede mandat, forutsetning, risiko og beslutningsspor før nye signaler får påvirke styringsbildet, slik at prosjektet skiller det som er kjent fra det som fortsatt trenger riktig eier eller evidens.',
  lunch:'Lunsjflaten gjør situated standing synlig mellom ledelse, prosjektteam, økonomi, medvirkning, beslutningseiere, eksterne aktører, innbyggere og private relasjoner uten å redusere disse ulike vurderingene til én global score.',
  afternoon:'Ettermiddagen bruker de eksisterende styrings- og kvalitetssløyfene til avhengighetsavklaring, risikoarbeid, medvirkning, beslutningslogg eller replanlegging uten å reautorisere rhythm eller persistent work som ny authored state.',
  evening:'Kvelden viser forsinkede styrings- og privatkonsekvenser når ansvar, rapportpress og prestisje følger med hjem, samtidig som profesjonell standing holdes adskilt fra personlig verdi og fra formell beslutningsmyndighet.'
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
  work_loops:['styring','kvalitetssikring'],
  rule:'Eksisterende work grammar og canonical kostnadsrisiko-thread beviser allerede mandatavklaring, handoff, risikoeskalering, replanlegging og beslutningsspor. Denne rollouten gjenbruker disse strukturene og authorer ikke nytt persistent- eller rhythm-runtime.'
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere mellom overordnet ledelse, prosjektkoordinering, økonomi og risiko, medvirkning, formelle beslutningseiere, eksterne prosjektaktører, berørte innbyggere og private relasjoner. Ingen global reputation-score materialiseres.',
  authority_separation:'Standing kan aldri gi prosjektlederen rett til å overstyre lov, planmyndighet eller formelle vedtaksorgan, binde kommunen økonomisk eller politisk uten fullmakt, love plan- eller utbyggingsutfall, eller skjule vesentlig risiko og faglig uenighet.',
  audiences:[
    {id:'executive_leadership',standing_axis:'executive_leadership_standing',cares_about:['realistiske scenarioer og styringsklarhet','tidlig risikosynlighet og tydelig beslutningsbehov','skille mellom prosjektanbefaling og ledelsens faktiske beslutning'],cannot_grant:'Ledelsens tillit kan ikke gi prosjektlederen lov-, plan- eller vedtaksmyndighet eller økonomisk og politisk fullmakt som ikke allerede er delegert.'},
    {id:'project_coordination_team',standing_axis:'project_team_standing',cares_about:['navngitte eiere og klare handoffs','prioriterte avhengigheter og sporbar rework','møter som ender i faktiske beslutningspunkter'],cannot_grant:'Prosjektteamets støtte eller tempo kan ikke gi gruppen rett til å fatte beslutninger uten riktig mandat eller gjøre en midlertidig løsning bindende for andre eiere.'},
    {id:'economy_risk_team',standing_axis:'economy_risk_standing',cares_about:['synlige forutsetninger, sannsynlighet og konsekvens','sporbar alternativkostnad mellom tid, omfang, ressurs og kvalitet','risiko varslet før handlingsrommet forsvinner'],cannot_grant:'Økonomi- og risikomiljøets standing kan ikke gi prosjektlederen budsjettfullmakt, politisk beslutningsrett eller tillatelse til å skjule kvalitetstap som teknisk nødvendighet.'},
    {id:'participation_team',standing_axis:'participation_standing',cares_about:['tydelig skille mellom innbyggerdialog og utbyggerforhandling','at innspill ikke brukes til å legitimere ferdige svar','synlige konsekvenser for medvirkning og bykvalitet'],cannot_grant:'Medvirkningsmiljøets tillit kan ikke gi prosjektlederen vedtaksmyndighet, rett til å love innbyggerne et bestemt utfall eller rett til å bruke deltakelse som dekning for et forhåndsbestemt resultat.'},
    {id:'formal_decision_owners',standing_axis:'formal_owner_standing',cares_about:['korrekt mandat og avgrenset beslutningsspørsmål','preservasjon av evidens og usikkerhet gjennom eskalering','at prosjektet ikke forskutterer vedtak eller myndighetsutfall'],cannot_grant:'God standing hos formelle beslutningseiere overfører ikke deres myndighet til prosjektlederen; plan-, vedtaks- og annen offentlig myndighet forblir hos den faktiske eieren.'},
    {id:'external_project_actors',standing_axis:'external_actor_standing',cares_about:['forutsigbare avklaringer og realistiske milepæler','tydelige avhengigheter og hvem som eier dem','tidlig varsel når prosjektets forutsetninger endres'],cannot_grant:'Eksterne aktørers tillit kan ikke binde kommunen, skape planutfall, flytte offentlig myndighet eller gjøre en koordinasjonsdato til et bindende kommunalt løfte.'},
    {id:'affected_residents_users',standing_axis:'resident_trust_standing',cares_about:['synlige konsekvenser for bykvalitet, trygghet og bruk','redelig representasjon av medvirkning og prioriteringer','at kvalitetskutt ikke skjules når budsjett og tid presses'],cannot_grant:'Støtte eller motstand fra berørte innbyggere gir ikke prosjektlederen formell vedtaksmyndighet og kan ikke erstatte lovlig prosess, faglig vurdering eller korrekt beslutningseier.'},
    {id:'private_relations',standing_axis:'private_leadership_mask',cares_about:['at rapportpress og ansvar kan legges bort privat','at profesjonell kritikk ikke blir personlig verdi','at prestisje og styringsuro ikke gjør hele identiteten til prosjektlederrollen'],cannot_grant:'Private relasjoner kan ikke gi profesjonell fullmakt, endre ansvarslinjer eller gjøre personlig bekreftelse til faglig eller offentlig godkjenning.'}
  ],
  divergence_examples:[
    'Å varsle en usikker kostnadsrisiko tidlig kan svekke kortsiktig standing hos dem som ønsker ro og én dato, samtidig som Sigrid og senere ledelse får større tillit til prosjektets styrbarhet.',
    'Å stoppe mandatglidning kan irritere et fremdriftspresset prosjektteam eller en ekstern aktør, men styrke standing hos formelle beslutningseiere som må kunne stole på at prosjektet ikke forskutterer deres vedtak.',
    'Å beskytte medvirkning og gatekvalitet mot et stille budsjettkutt kan gjøre replanlegging mer krevende for ledelsen, men styrke standing hos Maria, berørte brukere og fagmiljø som senere skal forklare prosjektets prioriteringer.',
    'En kort styringssak med én anbefaling kan gi høy kommunikasjonsstanding hos noen, mens et mer komplett alternativbilde gir høyere tillit hos de som faktisk skal eie risikoen og beslutningen.'
  ]
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'by',
  role_scope:ROLE,
  title:'By-prosjektleder — mandat, risiko og situert styringstillit',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å gjøre komplekse byutviklingsprosjekter styrbare under tid, budsjett og statuspress uten å forveksle rapportro med kontroll, og uten å la situert tillit bli en snarvei rundt mandat, lov eller formelle beslutningseiere.',
    description:'Role World-en lukker bare situated_reputation-gjelden. Den gjenbruker eksisterende styrings- og kvalitetssløyfer og den canonicale kostnadsrisiko-tråden for handoff, replanlegging og forsinket konsekvens uten å reautorisere persistent work eller rhythm som nytt authored arbeid.'
  },
  theme_ids,
  social_environments:[
    'Mandat- og programbordet der brede politiske mål må oversettes til styrbare avveiinger uten at prosjektlederen overtar politisk eller myndighetsmessig beslutningsrett.',
    'Kommunalsjefens styringsdialog der én dato og enkel rapportering kan gi kortsiktig ro, mens scenario, forutsetninger og risiko gir bedre langsiktig styrbarhet.',
    'Koordineringsrommet der Amin gjør det synlig om flere fag faktisk har en beslutningseier eller bare har produsert mer møteaktivitet rundt samme avhengighet.',
    'Risiko-, budsjett- og beslutningsloggen der Sigrids usikre kostnadsestimat kan bevare handlingsrom hvis det varsles før kvalitet blir en stille reserve.',
    'Medvirkningsflaten der Maria beskytter forskjellen mellom å høre innbyggere, faglig vurdere innspill og forhandle med en ekstern prosjektaktør.',
    'Det formelle beslutningsnivået der prosjektets anbefaling først blir legitimt beslutningsgrunnlag når mandat, evidens, usikkerhet og faktisk eier er synlige.',
    'Møtet med eksterne prosjektaktører som trenger forutsigbarhet, men som ikke kan gjøre en usikker milepæl eller et ønsket utfall til kommunalt løfte.',
    'Innbyggernes og brukernes byrom der budsjett- og tidsvalg får faktiske konsekvenser for trygghet, opphold, grønt og tillit.',
    'Privatlivet der styringsansvar, rapportpress og prestisje må kunne legges bort uten at prosjektets status blir hele personens verdi.'
  ],
  recurring_people_archetypes:[
    {id:'project_leader_lena_world',social_function:'kommunalsjef og overordnet leder som trenger styringsklarhet uten falsk sikkerhet',class_position:'formell leder med organisatorisk beslutnings- og ressursmakt',status:'høy organisatorisk status',power_over_player:'kan kreve styringsgrunnlag, prioritere kapasitet og eie beslutninger som ligger over prosjektmandatet',wants:'realistiske scenarioer, tidlig risiko og tydelige beslutningsspørsmål som kan kommuniseres videre',conceals:'at enkel rapportro og én dato ofte er lettere å forsvare oppover enn et sant bilde med flere forutsetninger',speech_style:'kort og beslutningsorientert; spør hva som er sikkert, hva som kan endre datoen og hva ledelsen faktisk må velge',teaches_player:'at tillit oppover bygges ved å gjøre usikkerhet styrbar, ikke ved å late som den er borte'},
    {id:'project_leader_amin_world',social_function:'prosjektkoordinator som holder avhengigheter, eiere, frister og beslutningspunkter synlige',class_position:'operativ mellomrolle med høy situert kunnskap om prosjektets grensesnitt',status:'middels organisatorisk status',power_over_player:'kan avdekke at koordinering bare flytter oppgaver rundt eller at prosjektet glir inn i andres mandat',wants:'navngitte eiere, realistiske frister og handoffs som overlever neste møte',conceals:'at teamets ønske om å holde tempo kan gjøre en midlertidig løsning mer fristende enn korrekt eskalering',speech_style:'konkret og prosessnær; spør hvem som eier neste steg, hvilket grunnlag som mangler og hva som faktisk blokkerer',teaches_player:'at prosjektstanding ikke kan fylle en avhengighet med myndighet som mangler'},
    {id:'project_leader_sigrid_world',social_function:'økonomi- og risikopartner som gjør kostnadsusikkerhet og alternativkostnad styringsrelevant før den blir akutt',class_position:'faglig spesialist med sterk situert innflytelse over budsjett- og risikobildet',status:'middels til høy fagstatus',power_over_player:'kan endre styringsbildet ved å vise at en liten usikkerhet kan få stor konsekvens for tid, omfang eller kvalitet',wants:'synlige forutsetninger, scenarioer og beslutningsspor som bevarer handlingsrom',conceals:'at det er sosialt lettere å rapportere ett tall enn en sannsynlighetsfordeling med ubehagelige kvalitetskonsekvenser',speech_style:'nøktern og tallnær; skiller sannsynlighet, konsekvens, forutsetning og mulig tiltak',teaches_player:'at risiko trenger ikke være sikker for å være relevant, men standing kan aldri gjøre et estimat til beslutningsfullmakt'},
    {id:'project_leader_maria_world',social_function:'medvirkningsansvarlig som beskytter integriteten i innbyggerdialog og forskjellen mellom deltakelse og forhandling',class_position:'faglig spesialist med ansvar for prosesskvalitet og representasjon',status:'middels formell status og høy tillit hos deltakere',power_over_player:'kan synliggjøre når effektivisering gjør innspill til pynt eller forhandlingsstoff før de er faglig vurdert',wants:'tydelige roller, redelig representasjon og synlige konsekvenser for bykvalitet',conceals:'at separate prosesser krever mer tid og derfor kan bli oppfattet som mindre handlekraftige',speech_style:'rolig og presis; spør hvem som blir hørt, hva som er lovet og hvem som faktisk kan beslutte',teaches_player:'at tillit i medvirkning bygges gjennom rollegrenser og åpen prioritering, ikke gjennom løfter om å få viljen sin'},
    {id:'project_leader_formal_owner_world',social_function:'formell beslutningseier eller myndighetsrolle som mottar et avgrenset spørsmål med evidens og mandat',class_position:'institusjonell eier av beslutning som prosjektet ikke selv kan fatte',status:'høy formell myndighetsstatus innen sitt område',power_over_player:'kan godkjenne, avvise eller sende saken tilbake når mandat, grunnlag eller prosess ikke er tilstrekkelig',wants:'et korrekt avgrenset beslutningsbehov, bevart usikkerhet og dokumenterte premisser',conceals:'at press fra prosjekt og ledelse kan gjøre et ryddig anbefalingsspor sosialt enklere å akseptere enn en reell åpen avveiing',speech_style:'formell og avgrensende; spør hva som ligger i mandatet, hva som er vurdert og hva prosjektet faktisk ber om beslutning på',teaches_player:'at riktig handoff beskytter både prosjektet og den som faktisk eier vedtaket'},
    {id:'project_leader_external_actor_world',social_function:'utbygger, leverandør eller ekstern prosjektaktør som trenger forutsigbarhet og koordinerbare milepæler',class_position:'ekstern aktør med økonomisk og operativ makt men uten kommunal vedtaksmyndighet',status:'varierende ekstern status og forhandlingskraft',power_over_player:'kan øke tids- og leveransepress og gjøre usikre datoer sosialt kostbare å holde åpne',wants:'tidlig varsling, tydelig grensesnitt og realistisk plan for det prosjektet faktisk kontrollerer',conceals:'at egen planleggingslogikk kan gjøre et kommunalt scenario ønskelig å lese som løfte',speech_style:'leveranseorientert og konkret; spør når beslutningen kommer, hva som kan flytte datoen og hvem de skal koordinere med',teaches_player:'at god ekstern standing kommer fra forutsigbar ærlighet, ikke fra å love mer enn kommunen kan binde seg til'},
    {id:'project_leader_resident_world',social_function:'berørt innbygger eller bruker som møter de faktiske konsekvensene av tid-, budsjett- og kvalitetsprioriteringer',class_position:'uten formell prosjektmyndighet men med legitim situert kunnskap om sted og bruk',status:'lav formell status og varierende offentlig synlighet',power_over_player:'kan gjøre skjulte kvalitetskutt og svak medvirkning synlig som konkrete konsekvenser i hverdagen',wants:'at trygghet, grønt, opphold og innspill behandles som reelle prosjektverdier og ikke bare kommunikasjon',conceals:'at én erfaring ikke alene kan avgjøre hele byutviklingsvalget selv når den avdekker en reell kostnad',speech_style:'hverdagsnær og konsekvensorientert; beskriver hva prosjektvalget faktisk gjør med stedet',teaches_player:'at offentlig standing er mangfoldig og aldri kan erstatte lovlig beslutning, men kan avsløre hva styringsspråket gjør usynlig'},
    {id:'project_leader_private_world',social_function:'privat nær relasjon som møter personen når prosjektansvar, kritikk og uferdige beslutninger følger med hjem',class_position:'privat likemann uten organisatorisk eller offentlig myndighet',status:'emosjonell nærhet uten profesjonell rang',power_over_player:'kan utfordre behovet for å gjøre all prosjekturo til personlig ansvar eller prestisjekamp',wants:'at personen kan legge bort rollen når andre faktisk eier neste beslutning',conceals:'at privatlivet blir slitent når hvert usikkert prosjektpunkt bæres som personlig dom over lederkompetansen',speech_style:'direkte og avdramatiserende; spør om problemet faktisk trenger deg nå eller om det ligger hos en annen eier',teaches_player:'at situert profesjonell standing ikke er identisk med personlig verdi eller total kontroll'}
  ],
  slow_axes:[
    {id:'mandate_clarity',meaning:'om prosjektets mål, åpne avveiinger og faktiske beslutningseiere forblir eksplisitte når fremdriftspresset øker',runtime_binding:'existing'},
    {id:'risk_visibility',meaning:'om usikre kostnader og konsekvenser blir styringsrelevante før handlingsrommet forsvinner',runtime_binding:'existing'},
    {id:'decision_trace_quality',meaning:'om beslutninger beholder premiss, forutsetning og eier slik at senere revisjon kan etterprøves',runtime_binding:'existing'},
    {id:'executive_leadership_standing',meaning:'situert tillit hos overordnet ledelse til realistisk styringsinformasjon, scenarioer og beslutningsklarhet',runtime_binding:'editorial_only_until_governed'},
    {id:'project_team_standing',meaning:'situert tillit i prosjektteamet til avhengighetsstyring, handoffs og rework som faktisk løser blokkeringer',runtime_binding:'editorial_only_until_governed'},
    {id:'economy_risk_standing',meaning:'situert tillit i økonomi- og risikomiljøet til synlige forutsetninger, alternativkostnad og tidlig varsling',runtime_binding:'editorial_only_until_governed'},
    {id:'participation_standing',meaning:'situert tillit i medvirkningsmiljøet til rolleklarhet, representasjon og synlige kvalitetskonsekvenser',runtime_binding:'editorial_only_until_governed'},
    {id:'formal_owner_standing',meaning:'situert tillit hos formelle beslutningseiere til korrekt eskalering, mandat og bevart evidens',runtime_binding:'editorial_only_until_governed'},
    {id:'external_actor_standing',meaning:'situert tillit hos eksterne prosjektaktører til realistisk koordinering og tidlig varsel uten falske løfter',runtime_binding:'editorial_only_until_governed'},
    {id:'resident_trust_standing',meaning:'situert tillit hos berørte brukere og innbyggere til at bykvalitet og medvirkning behandles redelig',runtime_binding:'editorial_only_until_governed'},
    {id:'private_leadership_mask',meaning:'hvor sterkt prosjektets rapportpress, prestisje og ansvar smelter sammen med personlig verdi privat',runtime_binding:'editorial_only_until_governed'}
  ],
  existing_work_continuity,
  situated_reputation_model,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'mandate_and_report_truth',beat_refs:['1/morning','2/lunch','4/morning','9/lunch','14/morning']},
    {id:'cost_risk_and_quality',beat_refs:['3/morning','7/afternoon','8/afternoon','13/afternoon','14/afternoon']},
    {id:'dependencies_and_formal_ownership',beat_refs:['4/afternoon','5/afternoon','7/morning','11/afternoon','14/lunch']},
    {id:'participation_and_external_trust',beat_refs:['6/lunch','6/afternoon','10/lunch','12/lunch','13/lunch']},
    {id:'situated_governance_standing',beat_refs:['2/lunch','3/lunch','5/lunch','8/lunch','11/lunch','12/lunch','14/lunch']},
    {id:'private_pressure_and_identity',beat_refs:['2/evening','6/evening','9/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_single_date_pressure',beat_ref:'2/evening',meaning:'Å nekte å gjøre et scenario til et løfte kan kjennes som svakere lederkontroll selv når styringsinformasjonen blir sannere.'},
    {id:'after_mandate_stop',beat_ref:'4/evening',meaning:'Å stoppe et fremdriftsvennlig prosjektvalg fordi riktig eier mangler kan gi sosial friksjon uten at det betyr at prosjektlederen har mislyktes.'},
    {id:'after_participation_boundary',beat_ref:'6/evening',meaning:'Å bruke mer tid på å holde medvirkning og utbyggerdialog adskilt kan se ineffektivt ut, men beskytter tillit og rolleintegritet.'},
    {id:'after_steering_case',beat_ref:'9/evening',meaning:'En styringssak med reelle alternativer gjør konflikt mer synlig og kan derfor oppleves mer personlig belastende enn en enkel anbefaling.'},
    {id:'after_resident_consequence',beat_ref:'12/evening',meaning:'Når kvalitetsprioriteringer får konkret betydning for innbyggere må prosjektlederen tåle kritikk uten å gjøre all offentlig standing til personlig verdi.'},
    {id:'after_replanning',beat_ref:'13/evening',meaning:'Åpen replanlegging kan oppleves som tap av kontroll i øyeblikket, selv når den tidligere risikosynligheten viser at prosjektet faktisk bruker styring som planlagt.'}
  ],
  delayed_consequences:[
    {id:'risk_warning_returns',setup_ref:'3/morning',return_ref:'8/afternoon',meaning:'Den tidlige kostnadsrisikoen kommer tilbake når kvalitetene står på kuttlisten og viser om varslingen faktisk bevarte handlingsrom.'},
    {id:'owner_gap_returns',setup_ref:'4/afternoon',return_ref:'11/afternoon',meaning:'Den tidlige mandatglidningen kommer tilbake i handoff til formell beslutningseier og viser om ansvar ble avklart før prosjektet bandt andre.'},
    {id:'participation_role_returns',setup_ref:'6/lunch',return_ref:'12/lunch',meaning:'Tidlig rolleklarhet i medvirkningen blir senere synlig i innbyggernes tillit til hvordan deres innspill og kvalitetskonsekvenser er representert.'},
    {id:'decision_log_returns',setup_ref:'7/afternoon',return_ref:'14/morning',meaning:'Den reparerte beslutningsloggen gjør det senere mulig å skille legitim revisjon ved endret grunnlag fra uforklarlig kontrolltap.'},
    {id:'steering_case_returns',setup_ref:'9/lunch',return_ref:'14/afternoon',meaning:'Alternativene i styringssaken kommer tilbake som faktisk beslutningsgrunnlag når perioden ender i replanlegging.'},
    {id:'external_milestone_returns',setup_ref:'10/lunch',return_ref:'13/afternoon',meaning:'En realistisk ekstern milepæl viser sin verdi når forutsetningene endres uten at tidligere koordinering må forsvares som et bindende løfte.'}
  ],
  cross_role_link:{status:'candidate_when_shared_work_is_real',materialized:false,new_runtime:false,rule:'Cross-role materialiseres først når et genuint shared canonical work-object har en bevist runtime-eier; tverrfaglige møter, Lena-, Amin-, Maria- og Sigrid-relasjoner alene er ikke nok.'},
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
index.status = 'twenty_nine_role_worlds_materialized';
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

const report = `# Civication By Prosjektleder Role World rollout\n\n- status: role_world_complete\n- authored dimension: situated_reputation only\n- coverage: 14 days / 56 beats\n- canonical source refs: 9\n- existing continuity reused: ${THREAD}\n- existing persistent work and rhythm preserved, not re-authored\n- canonical role model preserved: data/Civication/roleModels/by/prosjektleder_byutvikling.json\n- compatibility/shared model preserved: data/Civication/roleModels/by/by_prosjektleder.json\n- existing 8-step mail plan and work grammar preserved\n- cross-role: candidate_when_shared_work_is_real / not materialized\n- new runtime: false\n- global reputation score: forbidden\n\nAuthority remains fail-closed: standing cannot overrule law or formal decision bodies, bind the municipality without delegated authority, promise plan/development outcomes, or hide material risk and professional disagreement.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_BY_PROSJEKTLEDER_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${WORLD_PATH}: ${coverage.length} beats / ${refCycle.length} canonical source refs`);
