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

const ROLE = 'subkultur_arrangementsdrift';
const KEY = 'subkultur/subkultur_arrangementsdrift';
const WORLD_PATH = 'data/Civication/roleWorlds/subkultur/subkultur_arrangementsdrift.json';
const catalogPath = type => `data/Civication/mailFamilies/subkultur/${type}/subkultur_arrangementsdrift_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#subkultur_arrangementsdrift_job_apning`,
  people: `${catalogPath('people')}#subkultur_arrangementsdrift_people_vaktfordeling`,
  conflict: `${catalogPath('conflict')}#subkultur_arrangementsdrift_conflict_backstage`,
  event: `${catalogPath('event')}#subkultur_arrangementsdrift_event_rigg`,
  followup: `${catalogPath('followup')}#subkultur_arrangementsdrift_followup_overlevering`,
  knowledge: `${catalogPath('knowledge')}#subkultur_arrangementsdrift_knowledge_tilgjengelighet`,
  consequence: `${catalogPath('consequence')}#subkultur_arrangementsdrift_consequence_neste_vakt`
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'shift_lead_operational_standing',
  lunch:'crew_reciprocity_standing',
  afternoon:'public_safety_and_access_standing',
  evening:'subculture_private_boundary'
};
const dayThemes = [
  'Før første vakt åpner arenaen, må spilleren gjøre inngangsregler og tilgjengelig rute synlige. Arrangementsansvarlig vurderer om åpningen er styrbar, publikum vurderer om huset faktisk er lesbart, og venner i miljøet kan samtidig mene at formelle regler gjør stedet mindre uformelt.',
  'Crewplanen viser at de samme erfarne frivillige igjen har fått de tyngste postene. Maja vurderer om erfaring brukes til mentorarbeid eller skjult ekstrabelastning, mens nye frivillige vurderer om det finnes reell adgang til kompetanse og ansvar.',
  'En kjent profil forventer backstage fordi alle kjenner vedkommende. Miljøstanding kan falle når spilleren holder akkrediteringsregelen, mens Ida og neste vakt kan få høyere tillit fordi unntak må ha en synlig beslutningseier.',
  'En teknisk rigg står feil kort før åpning, og en erfaren frivillig mener kontrollen er enkel. Thomas vurderer om kompetansegrensen respekteres, crewet vurderer om spilleren bidrar under press, og publikum merker bare om området blir trygt eller kaotisk.',
  'Den trinnfrie ruten finnes fysisk, men er ikke synlig fra hovedkøen. Publikum med tilgjengelighetsbehov vurderer faktisk brukbarhet, mens skiftledelsen vurderer ressursbruk og crewet vurderer hvor mye ekstra arbeid en midlertidig løsning skaper.',
  'Etter flere vakter blir det tydelig at sosialt populære crewmedlemmer får flere muntlige unntak og mer uformell innflytelse. Rollouten skiller derfor kulturell anerkjennelse fra arbeidsgivermandat, akkreditering og retten til å fordele andres arbeid.',
  'En venn mener spilleren er blitt rigid etter å ha håndhevet samme adgangsregel for alle. Privat standing og miljøstanding kan svekkes samtidig som publikums- og skiftlederstanding styrkes, uten at noen av vurderingene kan summeres til ett omdømmetall.',
  'Tre små avvik ligger bare i muntlige beskjeder ved vaktskifte. Neste crew vurderer spilleren etter kvaliteten på overleveringen, mens det avgående crewet kan oppleve skriftlig logg som unødvendig kontroll eller som beskyttelse mot å arve skyld senere.',
  'En ny arrangementsdag starter med press om å åpne raskt fordi køen er lang. Tidligere valg rundt skilting, tilgjengelighet og sikker rigg kommer tilbake, og standing avhenger av om læring faktisk brukes når tempo igjen føles viktigere enn kontroll.',
  'En artistkontakt ber om en rask backstage-endring for en bekjent. Artisten vurderer service og fleksibilitet, Ida vurderer sporbarhet og mandat, og crewet vurderer om regler gjelder likt når forespørselen kommer fra noen med høy kulturell status.',
  'En frivillig som tidligere tok ekstra ansvar sier nei til enda en tungpost. Crewstanding viser om spilleren har brukt lojalitet som kapasitet eller som skjult plikt, mens skiftledelsen ser om bemanningsrisiko ble varslet før den ble et akutt hull.',
  'Et tilgjengelighetsavvik blir påpekt offentlig etter arrangementet. Publikum vurderer synlig reparasjon, crewet vurderer om kritikken fordeles rettferdig, og privatmiljøet kan lese offentlig kritikk som et statusfall selv når den gir nyttig kunnskap.',
  'Neste vakt møter et gammelt backstage-unntak som ingen kan dokumentere. Spilleren må velge mellom miljøhukommelse og en ny synlig beslutning, og den langsiktige tilliten avgjøres av om tidligere uklarhet blir reparert eller gjort til presedens.',
  'Rollouten avsluttes med at spilleren kan navngi hvem som stoler mer eller mindre på arbeidsmåten og hvorfor. Formell authority følger fortsatt vakt, opplæring og delegasjon; standing hos venner, crew, publikum eller artister kan aldri gi skjult adgang eller teknisk kompetanse.'
];
const phaseTail = {
  morning:'Morgenen gjør skiftlederens situerte vurdering konkret: om kjøreplan, status, ansvar, avvik og åpne blokkeringer er synlige nok til at vakten kan styres uten gjetting.',
  lunch:'Lunsjen gjør crew- og frivilligstanding konkret: om belastning, pauser, opplæring, kreditt og støtte fordeles slik at lojalitet ikke blir en usynlig arbeidsplikt.',
  afternoon:'Ettermiddagen setter spilleren mot publikum, teknisk ansvar eller akkrediterte deltakere og viser at sikkerhet, tilgjengelighet og synlige adgangsregler kan vurderes annerledes enn sosial smidighet og tempo.',
  evening:'Kvelden skiller arbeid, miljø og privat identitet: svekket standing hos venner eller crew er ikke en total dom over spilleren og gir aldri mer eller mindre formell authority neste vakt.'
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

const theme_ids = [
  'professional_culture',
  'status_anxiety',
  'shame_reputation',
  'loyalty_up_down',
  'social_mask',
  'bureaucratic_power',
  'precarity',
  'public_private_leakage'
];

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere. Ingen samlet reputation-score kan bli adgang, teknisk kompetanse, arbeidsgivermyndighet, sikkerhetsunntak eller erstatning for den eksisterende authority-kontrakten.',
  audiences:[
    {id:'arrangementsansvarlig_and_shift_leads',standing_axis:'shift_lead_operational_standing',cares_about:['presis status og kjøreplan','sporbar avvikslogg','riktig eskalering','forutsigbar åpning og overlevering'],cannot_grant:'ekstra arbeidsgivermandat, adgangsunntak eller rett til å overstyre sikkerhetsplan'},
    {id:'crew_and_volunteers',standing_axis:'crew_reciprocity_standing',cares_about:['rettferdig belastning','reelle pauser','opplæring og mentorarbeid','kreditt og støtte under press'],cannot_grant:'formell skiftmyndighet eller rett til å gjøre lojalitet til gratis arbeidsplikt'},
    {id:'technical_safety_staff',standing_axis:'technical_safety_standing',cares_about:['respekt for kompetansegrenser','sikker rigg','tidlig varsling','at ukjent utstyr ikke improviseres'],cannot_grant:'teknisk sertifisering, opplæring eller authority til å bruke utstyr uten faktisk kompetanse'},
    {id:'artists_and_accredited',standing_axis:'artist_accreditation_standing',cares_about:['tydelig kommunikasjon','forutsigbar backstage-flyt','respektfull service','at avtalte akkrediteringer faktisk fungerer'],cannot_grant:'skjult backstage-adgang, gjestelisteendring eller avtaler uten ansvarlig beslutning'},
    {id:'public_and_accessibility',standing_axis:'public_access_standing',cares_about:['synlige regler','faktisk brukbar tilgjengelighet','rolig køflyt','likebehandling uten innsidekunnskap'],cannot_grant:'arbeidsmyndighet eller rett til å bryte sikkerhetsplan selv når publikum er utålmodig'},
    {id:'friends_and_subculture_peers',standing_axis:'subculture_peer_standing',cares_about:['sosial lojalitet','miljøtilhørighet','fleksibilitet','om spilleren fortsatt oppleves som en del av miljøet'],cannot_grant:'akkreditering, teknisk kompetanse, lønnet rolle eller skjult særtilgang'}
  ],
  divergence_examples:[
    'Å nekte en venn backstage uten akkreditering kan svekke subculture-peer standing og samtidig øke skiftleder- og publikumsstanding fordi regelen blir synlig og lik.',
    'Å stoppe en ukjent riggoppgave kan koste kortsiktig standing hos et utålmodig crew, men bygge technical-safety standing og redusere risiko uten å endre spillerens formelle rolle.',
    'Å loggføre tre små avvik kan oppleves som byråkratisk av noen kolleger og samtidig bygge tillit hos neste vakt fordi ansvar, tiltak og kontrollpunkt faktisk overlever vaktskiftet.'
  ],
  authority_separation:'Standing påvirker bare editorial forståelse av relasjoner. Den kan aldri overstyre sikkerhetsplan, gi skjult adgang, skape teknisk kompetanse, inngå avtaler eller endre eksisterende authority-grenser.'
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'subkultur',
  role_scope:ROLE,
  title:'Arrangementsdrift — situert tillit mellom miljø, crew og publikum',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å levere sikker, tilgjengelig og sosialt krevende arrangementsdrift i et miljø der vennskap, kulturell status og praktisk arbeidsmakt lett kan blandes sammen, uten å gjøre omdømme til skjult adgang, kompetanse eller arbeidsgivermyndighet.',
    description:'Role World-en lukker bare readiness-gjelden situated_reputation. Eksisterende role model, work grammar, fire-trinns plan og sju authored mailtyper beholdes uendret. Flere audiences kan vurdere samme valg ulikt, mens sikkerhetsplan, akkreditering, opplæring og formelt mandat fortsatt styres av eksisterende kontrakter.'
  },
  theme_ids,
  social_environments:[
    'kulturarena_hovedinngang der kø, gjesteliste, ledsagerbehov og synlige adgangsregler møtes under åpningstidspress',
    'kulturarena_foaje der publikumsinformasjon, tilgjengelighet, frivilligbelastning og tidlig konfliktdemping blir konkret arbeid',
    'kulturarena_scene_rigg der tempo aldri kan erstatte opplæring, teknisk ansvar og sikkerhetsplan',
    'kulturarena_backstage_checkpoint der miljøstatus, vennskap og artistrelasjoner møter faktisk akkreditering og dokumentert beslutning',
    'crewbriefen før og etter vakt der belastning, pauser, mentoransvar og avvik enten blir synlige eller forsvinner i muntlig kultur',
    'neste vaktskifte der tidligere unntak og små avvik kommer tilbake som presedens dersom de ikke ble loggført',
    'subkulturelle vennskap utenfor arbeidstiden der profesjonelle grenser kan leses som personlig illojalitet selv når de beskytter like regler',
    'publikumsflaten etter arrangementet der konkrete erfaringer med tilgjengelighet og adgang kan gi ny kunnskap uten å gi publikum arbeidsmyndighet'
  ],
  recurring_people_archetypes:[
    {id:'ida_arrangementsansvarlig_world',social_function:'arrangementsansvarlig som holder kjøreplan, adgangsregler og sikkerhetsavklaringer samlet og trenger presis status fra vakten',class_position:'operativ leder med delegert arrangementsansvar',status:'høy formell og situasjonell status i den aktuelle vakten',power_over_player:'kan avklare gjesteliste, prioritere arbeid og avgjøre spørsmål utenfor vertens mandat, men kan ikke gjøre sosial status til kompetanse',wants:'forutsigbar åpning, synlige avvik og tidlig eskalering før små problemer blir sikkerhets- eller publikumsfeil',conceals:'at hun selv blir målt på flyt og kan bli fristet til å belønne raske uformelle løsninger',speech_style:'kort, konkret og ansvarssøkende; spør hva som er klart, hva som er blokkert og hvem som eier beslutningen',teaches_player:'at standing oppover bygges av styrbarhet og redelig status, ikke av å si ja til alt'},
    {id:'thomas_teknisk_ansvarlig_world',social_function:'teknisk ansvarlig som eier sikker bruk av scene- og riggutstyr og avklarer reell kompetansegrense',class_position:'fagspesialist med direkte safety-authority på teknisk utstyr',status:'høy faglig og formell status i tekniske sikkerhetsspørsmål',power_over_player:'kan stoppe eller godkjenne tekniske oppgaver og gjøre falsk kompetanse synlig, men kan ikke dele opplæring gjennom sosial tillit alene',wants:'tidlig varsling, sperrede risikosoner og crew som heller spør enn improviserer på ukjent utstyr',conceals:'at tidspress også treffer ham og kan gjøre ham irritert når andre stopper framdrift på riktig grunnlag',speech_style:'kort, teknisk og tydelig på hva som er opplæring, hva som er observasjon og hva som er tillatt handling',teaches_player:'at technical standing ikke er det samme som teknisk kompetanse eller sertifisering'},
    {id:'maja_frivilligkoordinator_world',social_function:'frivilligkoordinator som ser hvem som alltid sier ja og om erfaring blir brukt til mentorarbeid eller skjult ekstrabelastning',class_position:'koordinerende mellomposisjon mellom arrangementsansvarlig og frivillig crew',status:'høy situert tillit i bemanning og frivilligrelasjoner',power_over_player:'kan omfordele vakter, synliggjøre slitasje og påvirke om crew ønsker å komme tilbake',wants:'rettferdig belastning, reelle pauser og flere personer som lærer de krevende postene',conceals:'at hun kan lene seg for tungt på dem som aldri klager fordi det gjør bemanningen enklere på kort sikt',speech_style:'praktisk og relasjonell; spør hvem som har tatt hva, hvem som trenger støtte og hva neste vakt arver',teaches_player:'at crewstanding bygges av gjensidighet og rettferdig arbeid, ikke bare av at kvelden blir gjennomført'},
    {id:'leonora_publikumsvert_world',social_function:'publikums- og tilgjengelighetsansvarlig som ser om arenaens løsninger faktisk kan brukes uten at gjesten kjenner huset',class_position:'publikumsnær fagrolle uten overordnet arbeidsgivermyndighet',status:'høy situert kunnskapsstatus om publikumsflyt og tilgjengelighet',power_over_player:'kan gjøre skjulte barrierer og ulik service synlig og påvirke hvordan neste vakt organiserer inngangen',wants:'selvforklarende ruter, lik informasjon og rolig håndtering før et behov blir gjort til et offentlig problem',conceals:'at midlertidige personbaserte løsninger kan føles gode i øyeblikket selv om de ikke forbedrer systemet',speech_style:'rolig, presis og publikumsorientert; beskriver hva en gjest faktisk ser og må vite',teaches_player:'at public standing bør bygges av faktisk brukbarhet og likebehandling, ikke av gode intensjoner'},
    {id:'samira_crewkollega_world',social_function:'erfaren crewkollega som kjenner huset og miljøet, hjelper nye frivillige og merker når lojalitet blir tatt for gitt',class_position:'sideordnet arbeidstaker eller frivillig med høy lokal erfaring og liten formell myndighet',status:'høy uformell crewstatus',power_over_player:'kan dele eller holde tilbake praktisk kunnskap, støtte spillerens grensesetting og påvirke hvordan crew snakker om arbeidsmåten',wants:'et crew der erfaring gir innflytelse og mentorrom uten å bli permanent ekstravakt',conceals:'at hun også liker å være den alle trenger og derfor noen ganger sier ja før belastningen er forsvarlig',speech_style:'uformell, rask og løsningsorientert; bruker konkrete eksempler fra tidligere vakter',teaches_player:'at peer standing kan være verdifullt uten å være formell authority'},
    {id:'noah_artistkontakt_world',social_function:'artistkontakt eller akkreditert deltaker som trenger forutsigbar backstage-flyt og kan be om raske endringer på vegne av sitt miljø',class_position:'ekstern profesjonell relasjon med høy situert betydning, men uten arbeidsgivermyndighet over arenaens crew',status:'kan ha høy kulturell status og høy arrangementsverdi',power_over_player:'kan rose eller kritisere service og presse på for fleksibilitet, men kan ikke gjøre muntlig bekjentskap til akkreditering',wants:'smidig kontakt, tydelige svar og at reelle endringer håndteres raskt av riktig ansvarlig',conceals:'at egen tid og artistens status kan gjøre et vanlig ønske om service om til et press for særbehandling',speech_style:'vennlig, direkte og tidsorientert; ber ofte om en praktisk løsning nå',teaches_player:'at artiststanding og servicepress må holdes adskilt fra gjestelisteauthority'},
    {id:'emil_subkulturvenn_world',social_function:'privat venn og miljøperson som kjenner spilleren fra før jobbrollen og tolker nye grenser gjennom sosial lojalitet',class_position:'privat likemann uten arbeids- eller akkrediteringsmyndighet',status:'høy emosjonell og subkulturell nærhet',power_over_player:'kan gjøre profesjonelle grenser personlig kostbare og påvirke følelsen av tilhørighet etter vakten',wants:'at miljøet fortsatt føles gjensidig og uformelt selv når spilleren har ansvar i døren',conceals:'at ønsket om nærhet også kan innebære forventning om fordeler som andre publikummere ikke får',speech_style:'uformell, ertende og direkte; spør om spilleren har blitt «en av vaktene» nå',teaches_player:'at privat og subkulturell standing ikke må lekke inn i adgang, kompetanse eller arbeidsmandat'}
  ],
  slow_axes:[
    {id:'shift_lead_operational_standing',meaning:'arrangementsansvarlig og skiftledelsens situerte tillit til presis status, kjøreplan, avvikslogg og riktig eskalering',runtime_binding:'editorial_only_until_governed'},
    {id:'crew_reciprocity_standing',meaning:'crew og frivilliges situerte tillit til rettferdig belastning, pauser, støtte, mentorarbeid og kreditt',runtime_binding:'editorial_only_until_governed'},
    {id:'technical_safety_standing',meaning:'teknisk ansvarliges situerte vurdering av om kompetansegrenser og sikkerhetsplan respekteres under tidspress',runtime_binding:'editorial_only_until_governed'},
    {id:'artist_accreditation_standing',meaning:'artister og akkrediterte deltakeres situerte erfaring av tydelig, respektfull og forutsigbar backstage-service',runtime_binding:'editorial_only_until_governed'},
    {id:'public_access_standing',meaning:'publikums situerte tillit til synlige regler, faktisk tilgjengelighet, rolig flyt og likebehandling',runtime_binding:'editorial_only_until_governed'},
    {id:'subculture_peer_standing',meaning:'venner og miljøets situerte vurdering av sosial lojalitet og fleksibilitet uten at dette blir arbeidsgivermakt',runtime_binding:'editorial_only_until_governed'},
    {id:'authority_boundary_clarity',meaning:'om sosial status holdes adskilt fra akkreditering, teknisk kompetanse, sikkerhetsplan og avtaleauthority',runtime_binding:'editorial_only_until_governed'},
    {id:'private_work_identity_boundary',meaning:'om spilleren klarer å skille arbeidsmessig standing, miljøtilhørighet og privat egenverdi etter krevende vakter',runtime_binding:'editorial_only_until_governed'}
  ],
  situated_reputation_model,
  cross_role_proof:{
    status:'not_materialized_no_shared_work_object',
    shared_work_object_found:false,
    new_runtime:false,
    rule:'Readiness sier candidate_when_shared_work_is_real. Repoet har ikke et eksisterende delt work object for denne rollen, så rollouten lager ikke et kunstig shared arbeidsobjekt eller cross-role-privilege.'
  },
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'shift_lead_operational_standing',relationship:'status, kjøreplan, avvik og eskalering som må være lesbare for den som leder vakten',beat_refs:['1/morning','2/morning','4/morning','8/morning','9/morning','11/morning','14/morning']},
    {id:'crew_reciprocity_standing',relationship:'belastning, pauser, opplæring, mentoransvar og gjensidighet i crewet',beat_refs:['2/lunch','5/lunch','6/lunch','8/lunch','11/lunch','13/lunch']},
    {id:'public_safety_and_access_standing',relationship:'tilgjengelighet, sikkerhet og synlige regler sett av publikum, teknisk ansvar og akkrediterte deltakere',beat_refs:['1/afternoon','4/afternoon','5/afternoon','9/afternoon','10/afternoon','12/afternoon','13/afternoon']},
    {id:'social_status_without_privilege',relationship:'miljøstatus og vennskap som kan påvirke relasjoner, men aldri bli adgang, kompetanse eller authority',beat_refs:['3/lunch','3/afternoon','6/afternoon','7/lunch','10/lunch','13/afternoon']},
    {id:'subculture_private_boundary',relationship:'skillet mellom arbeidsmessig standing, miljøtilhørighet og privat identitet',beat_refs:['1/evening','3/evening','7/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_first_door',beat_ref:'1/evening',summary:'Spilleren merker at en synlig adgangsregel kan gjøre noen venner mindre varme selv om publikum opplever inngangen som mer rettferdig og lesbar.'},
    {id:'after_backstage_friend',beat_ref:'3/evening',summary:'Å nekte skjult særtilgang kjennes personlig når miljøet er lite, men privat ubehag kan ikke endre hvem som faktisk var akkreditert.'},
    {id:'after_safety_stop',beat_ref:'4/evening',summary:'En forsinkelse etter sikker stopp kan gi skam over å ha bremset crewet samtidig som teknisk tillit øker fordi kompetansegrensen holdt.'},
    {id:'after_public_access_critique',beat_ref:'12/evening',summary:'Offentlig kritikk av tilgjengeligheten kan redusere kortsiktig omdømme og samtidig gi kunnskap som gjør neste arrangement mer brukbart.'},
    {id:'after_rollout_close',beat_ref:'14/evening',summary:'Spilleren kan navngi ulike standings uten å slå dem sammen til én identitetsdom eller bruke dem som skjult mandat neste gang.'}
  ],
  delayed_consequences:[
    {id:'opening_rule_returns',setup_ref:'1/morning',return_ref:'9/morning',summary:'Den første inngangsregelen kommer tilbake når køpresset øker igjen; skiftleder- og publikumsstanding viser om læringen overlevde.'},
    {id:'crew_load_returns',setup_ref:'2/lunch',return_ref:'11/lunch',summary:'Måten tungvaktene ble fordelt på kommer tilbake når en erfaren frivillig sier nei og bemanningsrisikoen blir synlig.'},
    {id:'backstage_exception_returns',setup_ref:'3/afternoon',return_ref:'13/afternoon',summary:'Et gammelt muntlig unntak kommer tilbake som påstått presedens og tester om sosial hukommelse fortsatt holdes adskilt fra dokumentert authority.'},
    {id:'rig_safety_returns',setup_ref:'4/afternoon',return_ref:'9/afternoon',summary:'Den tekniske kompetansegrensen kommer tilbake under ny åpningstid og viser om sikkerhetsstanding faktisk påvirket arbeidskulturen.'},
    {id:'accessibility_route_returns',setup_ref:'5/afternoon',return_ref:'12/afternoon',summary:'Den skjulte trinnfrie ruten blir senere offentlig kritisert og tester om midlertidig service ble omsatt til varig, synlig publikumsflyt.'},
    {id:'handover_memory_returns',setup_ref:'8/morning',return_ref:'13/morning',summary:'Vaktoverleveringen kommer tilbake når neste team møter et gammelt unntak og trenger ansvar, tidspunkt og beslutningsspor fremfor rykter.'}
  ],
  materialization:{
    no_new_runtime:true,
    source_refs:refCycle,
    authored_dimensions:['situated_reputation'],
    existing_plan_preserved:true,
    cross_role_link_materialized:false,
    note:'Standing er editorial-only og audience-spesifikk. Eksisterende Scene Pipeline, authority-grenser og sju authored mailtyper forblir autoritative.'
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'subkultur' && row.role_scope === ROLE)) {
  index.roles.push({category:'subkultur',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'nineteen_role_worlds_materialized';
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Subkultur Arrangementsdrift er materialisert som kontrollert Role World-rollout med audience-spesifikk standing; miljøstatus, adgang, sikkerhet, kompetanse og formell authority forblir separate kontrakter.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_SUBKULTUR_ARRANGEMENTSDRIFT_ROLE_WORLD_ROLLOUT.md'), `# Civication Subkultur Arrangementsdrift Role World rollout\n\nDato: **2026-08-28**\n\n- Rolle: \`${KEY}\`\n- Status: \`role_world_complete\`\n- Readiness-gjeld lukket: \`situated_reputation\`\n- Season: 14 dager × 4 faser = 56 beats\n- Audience-spesifikke standing-akser: arrangementsansvarlig/skiftledelse, crew/frivillige, teknisk safety, artister/akkrediterte, publikum/tilgjengelighet og venner/subkulturmiljø\n- Global reputation-score: forbudt i denne modellen\n- Cross-role: ikke materialisert; repoet har ikke et eksisterende shared work-object for rollen\n- Authority: standing kan ikke bli adgang, teknisk kompetanse, sikkerhetsunntak eller avtale-/arbeidsgivermandat\n- Runtime: ingen ny runtime; eksisterende Scene Pipeline beholdes\n- Plan: eksisterende 4-trinns plan uendret\n- Provenance: de eksisterende sju authored mailtypene\n\nEndelig merge-status og CI-resultat skal bare fastslås fra GitHub på PR-ens eksakte final head.\n`);

console.log('Materialized Subkultur Arrangementsdrift Role World with situated reputation only.');
