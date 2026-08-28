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

const ROLE = 'by_arkitekt';
const KEY = 'by/by_arkitekt';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_arkitekt.json';
const refs = {
  job:'data/Civication/mailFamilies/by/job/by_arkitekt_job.json#by_arkitekt_job_forste_001',
  people:'data/Civication/mailFamilies/by/people/by_arkitekt_people.json#by_arkitekt_people_sara_001',
  conflict:'data/Civication/mailFamilies/by/conflict/by_arkitekt_conflict.json#by_arkitekt_conflict_nora_001',
  event:'data/Civication/mailFamilies/by/event/by_arkitekt_event.json#by_arkitekt_event_modell_001',
  micro:'data/Civication/mailFamilies/by/micro/by_arkitekt_micro.json#by_arkitekt_micro_dor_001',
  story:'data/Civication/mailFamilies/by/story/by_arkitekt_story.json#by_arkitekt_story_mikkel_001',
  knowledge:'data/Civication/mailFamilies/by/knowledge/by_arkitekt_knowledge.json#by_arkitekt_knowledge_gateplan_001',
  followup:'data/Civication/mailFamilies/by/followup/by_arkitekt_followup.json#by_arkitekt_followup_inngang_001',
  consequence:'data/Civication/mailFamilies/by/consequence/by_arkitekt_consequence.json#by_arkitekt_consequence_gateplan_001'
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'info',lunch:'conversation',afternoon:'task',evening:'private_consequence'};
const phaseThread = {
  morning:'gateplan_og_stedlig_evidens',
  lunch:'tverrfaglig_handoff_og_standing',
  afternoon:'revisjon_grensesnitt_og_rework',
  evening:'senere_konsekvens_og_privataftermath'
};
const dayThemes = [
  'Prosjektets førsteetasje ser ryddig ut på tegning, men Sara viser at inngang, ganglinje og et passivt hjørne ikke følger den faktiske bevegelsen i gaten. Arkitekten må gjøre observasjonen sporbar før fasaden låses videre.',
  'Modellgjennomgangen viser at inngang, varelevering og oppholdsareal konkurrerer om samme hjørne. Et lokalt grep kan ikke lukkes før de relevante fagene har levert nok evidens til at grensesnittet kan prioriteres uten å skjule rest-risiko.',
  'Nora vil bevare prosjektets signatur, mens tilgjengelighet og intern logistikk presser inngangsgrepet. Arkitekten må tåle legitim venting på fagavklaring og skille prosjektidentitet fra én detaljløsning før revisjonen sendes videre.',
  'En liten dørendring griper inn i hovedganglinjen. Detaljen kan reworkes raskt, men korreksjonen må dokumenteres slik at neste tegningsrunde forstår premisset og ikke reverserer den av hensyn til et renere bilde.',
  'Befaringen viser diagonal bevegelse gjennom hjørnet og opphold der fasaden er mest lukket. Stedlig evidens må handoffes til riktig prosjekteringsnivå med siste bekreftede observasjon, faglig forbehold og hva som fortsatt må testes.',
  'Materialprøven får slag, smuss og fukt på utsatte flater. Arkitekten må skille mellom materialideen og detaljen som svikter, og la fysisk test utløse avgrenset rework i stedet for å beskytte presentasjonens prestisje.',
  'En leveransefrist gjør det fristende å fryse modellen før alle grensesnitt er avklart. Fremdrift kan endre rekkefølgen, men kan ikke skape godkjenningsmyndighet eller gjøre sikkerhet, tilgjengelighet og tydelige forbehold valgfrie.',
  'Den reviderte inngangen virker bedre, men Sara viser at hjørnet fortsatt oppleves som en bakside. Etterkontrollen må skille det som faktisk er løst fra det som fortsatt krever revisjon, risikoaksept eller ny beslutningseier.',
  'Prosjektledelsen ønsker ro rundt en løsning som allerede har kostet tid. Arkitekten må vise rest-risiko, konsekvens og neste kontroll uten at standing hos fremdriftspressede aktører blir et argument for å skjule et uløst byromsproblem.',
  'Atelieret vurderer om en ny revisjon svekker prosjektets tydelige formspråk. Faglig standing kan divergere: et mer korrigerbart prosjekt kan se mindre sikkert ut på kort sikt, men styrke tilliten hos dem som møter bruk, sted og grensesnitt.',
  'Den prosjekterende partneren viser at én inngangsendring flytter føringer inn i en annen detalj. Handoff og rework må holde tidligere premiss, siste tegning og faktisk eier synlig slik at problemet ikke bare vandrer mellom fagene.',
  'Et tilgjengelighets- eller sikkerhetsspørsmål bryter den planlagte arbeidsrytmen. Arkitekten kan formulere og koordinere spørsmålet, men må eskalere til riktig fag- eller myndighetseier når godkjenning ligger utenfor eget mandat.',
  'Gjennomgangen av prosjektets beslutningsspor viser hvilke revisjoner som bygde kvalitet og hvilke som bare flyttet friksjon. Arkitekten må kunne eie en sen korreksjon uten å omskrive tidligere valg eller bruke prestisje som erstatning for evidens.',
  'Den senere gateplanskonsekvensen gjør det synlig om inngang, hjørne, materialitet og sted faktisk fungerer sammen. Perioden avsluttes med en sporbar revisjonslinje: hva er løst, hva står igjen, hvem eier neste steg og hvilke myndighetsgrenser standing aldri kan oppheve.'
];
const phaseTail = {
  morning:'Morgenen oppdaterer siste bekreftede tegnings-, befaring- eller modellstatus og gjør eksplisitt hva som venter, hvem som eier neste avklaring og hvilke premisser som ikke kan skjules av fremdrift.',
  lunch:'Lunsjflaten gjør audience-spesifikk standing synlig mellom atelier, bylivsfag, prosjekterende team, prosjektledelse, brukere og private relasjoner uten at tillit blir formell godkjenning.',
  afternoon:'Ettermiddagen krever konkret arbeid i eksisterende Scene Pipeline: modellkritikk, befaring, detaljtest, handoff eller avgrenset rework der sikkerhet, tilgjengelighet og mandat fortsatt er eksplisitte.',
  evening:'Kvelden viser forsinket konsekvens, prestisjepress og privat ettervirkning uten å la arkitektrollen bli hele identiteten eller omskrive faglige forbehold for å beskytte standing.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type:phaseTypes[phase],
      summary:`Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids:[phaseThread[phase]],
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

const work_rhythm_model = {
  runtime_binding:'editorial_only_existing_pipeline',
  continuity_anchor:'by_arkitekt_people_sara_001',
  new_runtime_state:false,
  rule:'Waiting, handoff og rework er eksplisitte arbeidsfaser i den eksisterende Scene Pipeline. Fremdrift, prestisje eller standing kan aldri skape godkjenningsmyndighet, endre mandat eller gi arkitekten rett til å sette sikkerhet eller tilgjengelighet til side.',
  states:[
    {id:'waiting',meaning:'Arbeidet står legitimt i venteposisjon mens modellgjennomgang, tilgjengelighets- eller sikkerhetsavklaring, fysisk materialtest, befaring eller senere etterkontroll mangler.',guardrails:['venting skal ha tydelig grunn, eier og hva som må bli sant før neste steg','venting kan ikke fylles med antakelser som behandles som godkjenning eller dokumentert brukskvalitet']},
    {id:'handoff',meaning:'En arkitektfaglig sak overleveres med siste bekreftede tegning eller observasjon, eksplisitt forbehold og hva mottakeren faktisk eier i prosjekt-, fag- eller myndighetslinjen.',guardrails:['handoff skal bevare premiss, usikkerhet og faktisk beslutningseier','mottakerens myndighet følger rolle og mandat, ikke arkitektens standing eller prosjektets hastverk']},
    {id:'rework',meaning:'Inngang, gateplan, detalj, materialitet eller tverrfaglig grensesnitt returneres for avgrenset ny prosjektering når test, befaring eller koordinering viser at premisset ikke holder.',guardrails:['rework skal bevare tidligere test og beslutningsspor i stedet for å omskrive historien','rework skal ikke skjules som kosmetisk justering når sikkerhet, tilgjengelighet eller brukbarhet faktisk er berørt']},
    {id:'interruption',meaning:'Leveransefrist, ny stedlig evidens, sikkerhets- eller tilgjengelighetsspørsmål eller uventet grensesnittkonflikt kan endre arbeidsrekkefølgen uten å endre formelle myndighetsgrenser.',guardrails:['hastegrad kan gjøre eskalering raskere men ikke skape godkjenningsrett','kritiske krav handoffes til riktig fag- eller myndighetseier når de ligger utenfor arkitektens mandat']},
    {id:'delayed_consequence',meaning:'Effekten av gateplan, inngang, materialitet og grensesnitt vurderes når senere befaring, etterkontroll eller prosjektgjennomgang faktisk viser hvordan tidligere valg virker i bruk.',guardrails:['et formalt vellykket grep kan fortsatt ha en dokumentert brukskostnad','senere standing kan ikke retroaktivt gjøre skjulte forbehold eller manglende mandat legitimt']}
  ],
  transitions:[
    {from:'waiting',to:'handoff',trigger:'nødvendig fag-, prosjekt- eller myndighetseier må ta over neste avklaring'},
    {from:'handoff',to:'rework',trigger:'avklaring eller ny evidens viser at løsningen må bygges om før den kan låses'},
    {from:'rework',to:'waiting',trigger:'revidert løsning trenger ny modelltest, befaring eller fagkontroll'},
    {from:'rework',to:'delayed_consequence',trigger:'løsningen får et faktisk etterkontrollpunkt senere i prosjektet'},
    {from:'interruption',to:'handoff',trigger:'kritisk spørsmål ligger hos annen fag- eller myndighetseier'},
    {from:'waiting',to:'delayed_consequence',trigger:'tiden eller etterkontrollen gir evidensen som manglet i første beslutning'},
    {from:'delayed_consequence',to:'rework',trigger:'senere bruk eller stedlig effekt viser et fortsatt uløst problem'}
  ]
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere mellom atelier, bylivsfag, prosjekterende team, prosjektledelse, brukere/offentlighet og private relasjoner. Ingen samlet eller global reputation-score materialiseres.',
  authority_separation:'Audience-standing kan aldri gi godkjenningsmyndighet, rett til å love plan- eller byggesaksutfall, dispensere fra sikkerhet eller tilgjengelighet eller overta en myndighets- eller fagrolle som arkitekten ikke faktisk har.',
  audiences:[
    {id:'atelier_leadership',standing_axis:'atelier_leadership_standing',cares_about:['arkitektonisk sammenheng','faglig kvalitet og korrigerbarhet','tydelig prioritering av hovedgrep'],cannot_grant:'Atelierstanding kan ikke gi formell godkjenningsmyndighet, dispensasjon eller rett til å tilsidesette dokumenterte krav.'},
    {id:'city_life_specialists',standing_axis:'city_life_standing',cares_about:['ganglinjer og førsteetasje','stedlig evidens','opphold og overgang mellom bygg og gate'],cannot_grant:'Bylivsfaglig tillit kan ikke gi myndighetsfullmakt eller gjøre observasjon alene til formell plan- eller byggesaksgodkjenning.'},
    {id:'projecting_team',standing_axis:'projecting_team_standing',cares_about:['sporbare revisjoner','avklarte grensesnitt','detaljkvalitet og realistiske handoffs'],cannot_grant:'Tverrfaglig standing kan ikke gi arkitekten myndighet over andre fagområder eller rett til å godkjenne deres ansvar uten delegasjon.'},
    {id:'project_or_client_leadership',standing_axis:'project_leadership_standing',cares_about:['fremdrift og beslutningsklarhet','synlig risiko','kostnaden ved sene endringer'],cannot_grant:'Prosjekt- eller oppdragsledelsens tillit kan ikke oppheve sikkerhet, tilgjengelighet, habilitet eller offentlig myndighetsbehandling.'},
    {id:'users_and_public',standing_axis:'users_public_standing',cares_about:['brukbarhet og tilgjengelighet','byliv og lesbarhet','faktisk stedskvalitet'],cannot_grant:'Popularitet eller offentlig støtte kan ikke gi arkitekten godkjenningsrett, dispensasjon eller rett til å love et bestemt plan- eller byggesaksutfall.'},
    {id:'private_relationships',standing_axis:'private_prestige_mask',cares_about:['at arbeid kan legges bort når andre eier neste steg','at prestisje og kritikk ikke blir hele personlig verdi'],cannot_grant:'Privat støtte eller kritikk kan ikke gi profesjonell myndighet, godkjenning eller rett til å overta faglige beslutninger som eies av andre.'}
  ],
  divergence_examples:[
    'En sen, ærlig gateplansrevisjon kan svekke kortsiktig standing hos et fremdriftspresset prosjektmiljø og samtidig styrke tilliten hos atelier og bylivsfag.',
    'Å beskytte et signaturgrep kan styrke prestisje i ett miljø og samtidig svekke standing hos brukere eller fagpersoner som møter tilgjengelighets- og brukskonsekvensen.',
    'Å stoppe for ny fagavklaring kan se mindre handlekraftig ut for prosjektledelsen, men styrke standing hos prosjekterende som trenger tydelige grensesnitt og mandat.'
  ]
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'by',
  role_scope:ROLE,
  title:'Arkitekt — revisjon, stedlig evidens og korrigerbar faglig standing',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å holde arkitektonisk integritet og sosial troverdighet gjennom reell revisjon når prosjektpress, signatur og prestisje gjør det fristende å lukke et problem før bruk, sted og faggrenser faktisk er avklart.',
    description:'Role World-en lukker readiness-gjelden rhythm_waiting_handoff_rework og situated_reputation ved å følge den eksisterende gateplans-, inngangs-, material- og grensesnittkjeden gjennom venting, handoff, rework og senere etterkontroll uten å endre mailplan, work grammar eller Scene Pipeline.'
  },
  theme_ids,
  social_environments:[
    'Atelieret der Nora holder prosjektets hovedgrep mot kritikk og der en sterk arkitektonisk idé må kunne skilles fra én detaljløsning.',
    'Gateplanet der Sara gjør bevegelse, inngang, opphold og hjørne til stedlig evidens som kan tvinge tegningen til revisjon.',
    'Modell- og koordineringsrommet der flere gode delvalg kan kollidere og kreve eksplisitt grensesnitt, venting eller handoff.',
    'Material- og detaljrommet der fysisk test gjør slitasje, overgang og vedlikehold til kunnskap om bygget fremfor kosmetikk.',
    'Prosjektledelsens fremdriftsflate der kostnaden ved rework er synlig, men ikke kan brukes til å skjule sikkerhet, tilgjengelighet eller faglige forbehold.',
    'Den senere etterkontrollen der tidligere valg kommer tilbake som konkret bruk, rest-risiko og spørsmål om faglig ansvar.',
    'Privatlivet der signatur, prestisje og kritikk må kunne skilles fra personlig verdi når arbeidet fortsatt er uferdig.'
  ],
  recurring_people_archetypes:[
    {id:'arkitekt_atelierleder_world',social_function:'atelierleder som holder prosjektets arkitektoniske retning og krever tydelig begrunnelse for store revisjoner',class_position:'senior faglig leder i prosjektmiljøet',status:'høy intern fagstatus',power_over_player:'kan prioritere designarbeid og utfordre om revisjonen faktisk styrker prosjektets idé',wants:'et tydelig prosjekt som tåler kritikk, bruk og senere endring',conceals:'at prestisjen i et markant grep kan gjøre sen revisjon sosialt kostbar også for ledelsen',speech_style:'presis og formorientert; spør hva som bærer ideen og hva som bare er vane',teaches_player:'at faglig ledelse må gjøre korrigerbarhet mulig uten å gjøre prosjektet retningløst'},
    {id:'arkitekt_byliv_world',social_function:'bylivs- og stedsfaglig kollega som tester førsteetasje, ganglinjer og overgang mot faktisk bruk',class_position:'faglig sidestilt spesialist med sterk situert kunnskap om gate og bruk',status:'middels formell status, høy stedlig evidensmakt',power_over_player:'kan gjøre en svakhet i gateplanet målbar og tvinge prosjektet til å skille form fra bruk',wants:'lesbart gateplan, reell aktivitet og beslutninger som følger observasjonene',conceals:'frustrasjon over at stedlig evidens ofte får mindre prestisje enn visualisering og hovedgrep',speech_style:'konkret og observasjonsnær; peker på bevegelse, inngang, hjørne og opphold',teaches_player:'at stedlig evidens må kunne endre tegningen, ikke bare illustrere den'},
    {id:'arkitekt_prosjekterende_world',social_function:'prosjekterende samarbeidspartner som gjør detalj, materialitet og følgevirkning av revisjoner konkret',class_position:'tverrfaglig prosjektarbeider med situert kontroll over gjennomførbarhet',status:'middels prosjektstatus og høy grensesnittkunnskap',power_over_player:'kan vise at en lokal arkitektendring flytter konflikt til annen detalj eller fagdisiplin',wants:'sporbare revisjoner, klare premisser og løsninger som kan bygges og koordineres',conceals:'at små uklare endringer ofte skyves videre fordi ingen ønsker å åpne helheten igjen',speech_style:'praktisk og presis; spør hvilken tegning, detalj og avklaring som nå er gjeldende',teaches_player:'at handoff er del av designkvaliteten når flere fag eier samme grensesnitt'},
    {id:'arkitekt_projectlead_world',social_function:'prosjekt- eller oppdragsleder som holder fremdrift, risiko og beslutningsbehov synlig',class_position:'organisatorisk leder med makt over tid og prioritering, men ikke over offentlig godkjenning',status:'høy organisatorisk status',power_over_player:'kan prioritere leveranse og kreve tydelig risiko, men kan ikke gjøre et faglig problem løst ved frist',wants:'beslutningsklarhet, kontrollert rework og synlige rest-risikoer før kostbare låsninger',conceals:'at en rolig statusrapport ofte er lettere å forsvare enn et ærlig uløst grensesnitt',speech_style:'beslutningsorientert; spør hva som venter, hva det koster og hvem som eier neste steg',teaches_player:'at fremdrift er reell makt, men ikke godkjenningsmyndighet'},
    {id:'arkitekt_authority_world',social_function:'fag- eller myndighetsansvarlig som eier krav eller godkjenning arkitekten selv ikke kan overta',class_position:'ekstern eller sidestilt formell rolle med avgrenset myndighet',status:'høy situert myndighetsstatus',power_over_player:'kan kreve avklaring eller stoppe et premiss som ikke møter relevante krav',wants:'sporbar dokumentasjon, korrekt rollegrense og tydelig spørsmål før formell vurdering',conceals:'at prosjektets tidspress kan gjøre uklare forhåndssignaler fristende også for mottakeren',speech_style:'regel- og evidensnær; skiller anbefaling, dokumentasjon og formell avgjørelse',teaches_player:'at arkitektfaglig standing aldri kan erstatte faktisk godkjenningsmandat'},
    {id:'arkitekt_user_world',social_function:'bruker- eller offentlighetsperspektiv som møter inngang, tilgjengelighet og gateplan som hverdagslig erfaring',class_position:'person uten prosjektmyndighet men med legitim erfaringskunnskap om bruk',status:'lav formell status, høy situert innsikt i faktisk bruk',power_over_player:'kan gjøre et formalt ryddig grep sosialt og praktisk svakt når det møter kroppen og gaten',wants:'forståelig inngang, robust tilgjengelighet og et sted som fungerer uten prosjektets forklaringer',conceals:'at én erfaring ikke alene kan avgjøre hele prosjektet selv om den avdekker en reell svakhet',speech_style:'erfaringsnær og konkret; beskriver hva som er vanskelig å finne, bruke eller forstå',teaches_player:'at brukererfaring er evidensbidrag uten å være global popularitet eller formell godkjenning'},
    {id:'arkitekt_private_world',social_function:'privat nær relasjon som møter personen når prestisje, kritikk og uferdig rework følger med hjem',class_position:'privat likemann uten prosjekt- eller fagmyndighet',status:'emosjonell nærhet uten profesjonell rang',power_over_player:'kan utfordre behovet for å forsvare signatur eller status når andre faktisk eier neste steg',wants:'at personen kan legge bort rollen og tåle at et prosjekt er uferdig uten at personlig verdi følger statusen',conceals:'at samtaler blir utmattende når hver kritikk behandles som en faglig bedømmelse av personen',speech_style:'direkte og uformell; spør om problemet faktisk trenger arkitekten akkurat nå',teaches_player:'at faglig standing er situert og ikke identisk med personlig verdi'}
  ],
  slow_axes:[
    {id:'revision_trace_quality',meaning:'om tidligere premiss, test og revisjon forblir synlig gjennom nye tegninger og senere etterkontroll',runtime_binding:'editorial_only_until_governed'},
    {id:'handoff_clarity',meaning:'om siste bekreftede status, forbehold og faktisk beslutningseier overlever tverrfaglig og organisatorisk handoff',runtime_binding:'editorial_only_until_governed'},
    {id:'rework_integrity',meaning:'om rework forbedrer prosjektet uten å omskrive tidligere problemer for å beskytte prestisje eller fremdrift',runtime_binding:'editorial_only_until_governed'},
    {id:'atelier_leadership_standing',meaning:'situert tillit hos atelierledelsen til arkitektonisk sammenheng, korrigerbarhet og faglig integritet',runtime_binding:'editorial_only_until_governed'},
    {id:'city_life_standing',meaning:'situert tillit i bylivs- og stedsfaglig miljø til at observasjon og gatebruk faktisk påvirker prosjektet',runtime_binding:'editorial_only_until_governed'},
    {id:'projecting_team_standing',meaning:'situert tillit hos prosjekterende til sporbare revisjoner, grensesnitt og realistiske handoffs',runtime_binding:'editorial_only_until_governed'},
    {id:'project_leadership_standing',meaning:'situert tillit hos prosjekt- og oppdragsledelse til beslutningsklarhet, risiko og ærlige forbehold',runtime_binding:'editorial_only_until_governed'},
    {id:'users_public_standing',meaning:'situert tillit hos brukere og offentlighet til brukbarhet, tilgjengelighet og faktisk stedskvalitet',runtime_binding:'editorial_only_until_governed'},
    {id:'private_prestige_mask',meaning:'hvor mye arkitektprestisje, kritikk og signatur bæres inn i privat identitet når prosjektet fortsatt er uferdig',runtime_binding:'editorial_only_until_governed'}
  ],
  work_rhythm_model,
  situated_reputation_model,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'gateplan_revision',beat_refs:['1/morning','1/afternoon','3/lunch','5/morning','8/afternoon','10/lunch','14/afternoon']},
    {id:'model_interface',beat_refs:['2/morning','2/afternoon','4/lunch','7/afternoon','9/morning','11/afternoon','13/lunch']},
    {id:'signature_accessibility',beat_refs:['3/morning','3/afternoon','6/lunch','7/morning','10/afternoon','12/morning','14/lunch']},
    {id:'material_detail',beat_refs:['4/morning','4/afternoon','6/morning','6/afternoon','9/lunch','11/morning','13/afternoon']},
    {id:'standing_and_handoff',beat_refs:['1/lunch','2/lunch','5/lunch','7/lunch','9/afternoon','11/lunch','13/morning','14/morning']},
    {id:'private_prestige',beat_refs:['2/evening','4/evening','6/evening','8/evening','10/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_signature_critique',beat_ref:'3/evening',meaning:'Kritikk av hovedgrepet følger med hjem som prestisjefriksjon, men privatlivet kan ikke avgjøre fagspørsmålet.'},
    {id:'after_material_test',beat_ref:'6/evening',meaning:'En fysisk test som svekker presentasjonsideen blir personlig skuffelse uten at det gjør evidensen mindre relevant.'},
    {id:'after_deadline',beat_ref:'7/evening',meaning:'Leveransepresset gjør uferdig arbeid vanskelig å legge bort selv når andre eier neste avklaring.'},
    {id:'after_followup',beat_ref:'8/evening',meaning:'At første revisjon bare løste deler av gateplanet kan oppleves som nederlag eller som normal faglig læring.'},
    {id:'after_standing_divergence',beat_ref:'10/evening',meaning:'Ulik standing i atelier og prosjektledelse må ikke bli en privat jakt på én samlet dom over egen verdi.'},
    {id:'after_late_correction',beat_ref:'13/evening',meaning:'En sen korreksjon kan koste prestisje uten at personen trenger å forsvare den gamle løsningen hjemme.'}
  ],
  delayed_consequences:[
    {id:'entry_returns',setup_ref:'1/morning',return_ref:'8/afternoon',meaning:'Den første gateplansinnvendingen kommer tilbake etter revisjon og viser hva som faktisk ble løst.'},
    {id:'model_interface_returns',setup_ref:'2/afternoon',return_ref:'9/morning',meaning:'Grensesnittet fra modellgjennomgangen viser senere om den valgte prioriteringen bare flyttet konflikten.'},
    {id:'signature_returns',setup_ref:'3/afternoon',return_ref:'10/afternoon',meaning:'Signaturgrepet vurderes senere mot både bruk, tilgjengelighet og sosial standing i prosjektmiljøet.'},
    {id:'door_detail_returns',setup_ref:'4/afternoon',return_ref:'11/afternoon',meaning:'Den lille dørkorreksjonen viser om et dokumentert premiss overlevde neste tverrfaglige tegningsrunde.'},
    {id:'material_returns',setup_ref:'6/afternoon',return_ref:'13/afternoon',meaning:'Materialtesten kommer tilbake som spørsmål om varighet, detalj og beslutningshistorikk før prosjektet låses.'},
    {id:'street_consequence_returns',setup_ref:'8/afternoon',return_ref:'14/afternoon',meaning:'Etterkontrollen av inngang og hjørne blir sluttpunktet for en synlig, korrigerbar gateplansrevisjon.'}
  ],
  cross_role_link:{status:'not_required_for_rollout',materialized:false,new_runtime:false,rule:'Ingen cross-role-link materialiseres uten et genuint shared work-object eller delt arbeid som allerede har canonical runtime-eierskap.'},
  materialization:{
    authored_dimensions:['rhythm_waiting_handoff_rework','situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    compatibility_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refCycle
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.path === WORLD_PATH)) {
  index.roles.push({category:'by',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'twenty_seven_role_worlds_materialized';
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

const report = `# Civication By Arkitekt Role World rollout\n\n- status: role_world_complete\n- authored dimensions: rhythm_waiting_handoff_rework + situated_reputation\n- coverage: 14 days / 56 beats\n- canonical source refs: 9\n- continuity anchor: by_arkitekt_people_sara_001 (editorial only)\n- canonical career role model preserved: data/Civication/roleModels/by/arkitekt.json\n- compatibility/shared role model preserved: data/Civication/roleModels/by/by_arkitekt.json\n- existing 8-step mail plan and work grammar preserved\n- cross-role link: not_required_for_rollout / not materialized\n- new runtime: false\n- global reputation score: forbidden\n\nAuthority remains fail-closed: Role World standing or urgency cannot grant public approval authority, promise plan/building-case outcomes, waive safety/accessibility, or hide material conflicts and reservations.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_BY_ARKITEKT_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${WORLD_PATH}: ${coverage.length} beats / ${refCycle.length} canonical source refs`);
