#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => { fs.mkdirSync(path.dirname(abs(rel)), { recursive: true }); fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`); };
const readText = (rel) => fs.readFileSync(abs(rel), 'utf8');
const writeText = (rel, value) => fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`);
const run = (args) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });

const SCOPE = 'sport_utover';
const MODEL = 'data/Civication/roleModels/sport/profesjonell_utover.json';
const GRAMMAR = 'data/Civication/workGrammars/sport/sport_utover.json';
const PLAN = 'data/Civication/mailPlans/sport/sport_utover_plan.json';
const JOB = 'data/Civication/mailFamilies/sport/job/sport_utover_job.json';
const PEOPLE = 'data/Civication/mailFamilies/sport/people/sport_utover_people.json';
const CONFLICT = 'data/Civication/mailFamilies/sport/conflict/sport_utover_conflict.json';
const STORY = 'data/Civication/mailFamilies/sport/story/sport_utover_story.json';
const EVENT = 'data/Civication/mailFamilies/sport/event/sport_utover_event.json';
const KNOWLEDGE = 'data/Civication/mailFamilies/sport/knowledge/sport_utover_knowledge.json';
const LIFE_ROLE = 'data/Civication/lifestory/roles/sport_utover/role.json';
const LIFE_THREADS = 'data/Civication/lifestory/roles/sport_utover/threads.json';
const LIFE_SCENES = 'data/Civication/lifestory/roles/sport_utover/scenes.json';
const WORLD = 'data/Civication/roleWorlds/sport/sport_utover.json';
const SPORT_TEST = 'tests/civication-sport-utover-role-world.test.js';

const model = readJson(MODEL);
model.related_people = [
  { id: 'trener_maja', name: 'Maja', role: 'Trener', function: 'Planlegger belastning, konkurranseforberedelse og rollebruk uten å eie utøverens kropp eller selvbilde.' },
  { id: 'fysio_elias', name: 'Elias', role: 'Fysioterapeut', function: 'Gjør smerte, restitusjon og risiko til faglige signaler før de blir prestasjonsstopp.' },
  { id: 'lagkontakt_samir', name: 'Samir', role: 'Lagkontakt', function: 'Bærer garderobens normer og oversetter hva laget faktisk tåler sosialt.' },
  { id: 'lagkamerat_nora', name: 'Nora', role: 'Lagkamerat', function: 'Er både samarbeidspartner og sammenligningsflate for status, spilletid og utvikling.' },
  { id: 'sportslig_leder', name: 'Ragnhild', role: 'Sportslig leder', function: 'Eier kontrakts- og troppsrammer, men kan ikke love prestasjon eller uttak.' },
  { id: 'kontraktansvarlig', name: 'Henrik', role: 'Kontraktansvarlig', function: 'Skiller profesjonell avtale, kommersielle muligheter og sportslig status fra hverandre.' },
  { id: 'venn', name: 'Jonas', role: 'Venn', function: 'Merker når trening, mat, søvn og resultat gjør hele privatlivet til prestasjonsforberedelse.' },
  { id: 'familie', name: 'Søsteren din', role: 'Familie', function: 'Ser både stoltheten og kostnaden ved å gjøre kroppen og resultatene til sosial identitet.' }
];
model.related_places = [
  { id: 'sport_treningsfelt', reason: 'Daglig treningsflate der rytme, rolle og belastning blir synlig i praksis.' },
  { id: 'sport_styrkerom', reason: 'Kontrollert belastningsflate der progresjon må skilles fra ego og sammenligning.' },
  { id: 'sport_fysiorom', reason: 'Faglig rom for skade, smerte, restitusjon og return-to-play-vurdering.' },
  { id: 'sport_garderobe', reason: 'Sosialt rom der lagkultur, status, humor og normer kan påvirke hva utøveren tør å si.' },
  { id: 'sport_konkurransearena', reason: 'Arena der resultat, offentlig blikk og oppgavefokus kolliderer.' },
  { id: 'sport_reise', reason: 'Arbeidsflate der søvn, mat, logistikk og restitusjon blir del av profesjonell prestasjon.' }
];
model.mail_integration.recommended_mail_families = [
  'trening_rytme_og_disiplin','kropp_belastning_og_skade','lagmiljo_rolle_og_normer','konkurranse_press_og_resultat',
  'first_week_praksisfortellinger_sport_utover_job','first_week_praksisfortellinger_sport_utover_private',
  'second_week_praksisfortellinger_sport_utover_job','second_week_praksisfortellinger_sport_utover_private',
  'uttak_kontrakt_og_mandat','prestasjon_og_selvbilde','konkurransedag_og_reise','belastningsforstaelse'
];
writeJson(MODEL, model);

const jobSpecs = [
  ['Øktplanen som føles for lett','Maja ber deg holde igjen i en teknisk økt selv om du føler deg sterk.','Du kan vinne dagens blikk ved å skru opp, eller følge belastningsplanen som er laget for uka.','trener_maja','sport_treningsfelt'],
  ['Småplagen før den viktige økta','Elias ser et mønster i belastningen som ikke er skade ennå.','Å rapportere tidlig kan koste intensitet i dag, men gjør kroppen til informasjon i stedet for motstander.','fysio_elias','sport_fysiorom'],
  ['Rollen du ikke ønsket deg','Maja gir deg en smalere rolle enn ambisjonen din tilsier.','Lagets behov og egen status trekker i hver sin retning mens treningen fortsatt krever fullt nærvær.','trener_maja','sport_treningsfelt'],
  ['Resultatet som spiser analysen','En svak konkurranse gjør at alt kjennes mislykket selv om enkelte prestasjonsvalg var bedre.','Du må analysere uten å bortforklare tapet og uten å gjøre tavla til hele selvbildet.','lagkamerat_nora','sport_konkurransearena'],
  ['Reisa som stjal restitusjonen','Sen ankomst og endret måltidsrytme gjør at kroppen møter neste økt med mindre margin.','Profesjonell disiplin betyr nå å justere planen, ikke late som kalenderen ikke påvirker kroppen.','trener_maja','sport_reise'],
  ['Uttaket som kontrakten ikke lover','Sportslig leder offentliggjør troppen uten navnet ditt selv om arbeidsforholdet er uendret.','Du må skille retten til jobb fra ønsket om sportslig uttak og be om kriterier uten å kreve status.','sportslig_leder','sport_garderobe'],
  ['Garderoben ler av den som sier fra','En lagkamerat toner ned smerte fordi kulturen belønner å være tilgjengelig uansett.','Lojalitet kan bety å beskytte stemningen eller å gjøre det tryggere å rapportere problemer tidlig.','lagkontakt_samir','sport_garderobe'],
  ['Sponsorforespørselen kolliderer med laget','Henrik sender en kommersiell mulighet som overlapper med lagets avtalte opplegg.','Synlighet og inntekt kan være legitime, men de må holdes innen faktisk avtale og lagforpliktelse.','kontraktansvarlig','sport_treningsfelt'],
  ['Kampen der kroppen har mindre margin','Belastningsdata og egen følelse peker mot at full kamp er en dårlig idé.','Laget trenger deg, men kortsiktig lojalitet kan gjøre deg utilgjengelig når neste kamp kommer.','fysio_elias','sport_konkurransearena'],
  ['Prestasjonen som har blitt identitet','En viktig konkurranse nærmer seg og du merker at resultatet begynner å avgjøre hvordan du vurderer deg selv.','Oppgaven er å prestere fullt uten å gjøre resultatet til dom over hele mennesket.','trener_maja','sport_konkurransearena']
];
const privateSpecs = [
  ['Middagen som ble restitusjonsprosjekt','Du analyserer måltidet mens Jonas prøver å snakke om noe helt annet.','Profesjonell struktur har fulgt deg hjem og gjør vanlig nærhet til en del av treningsplanen.','venn'],
  ['Søsteren spør om kroppen alltid må vurderes','Hun merker at du beskriver søvn, vekt og energi som tall før du beskriver hvordan du faktisk har det.','Idretten gir språk for kroppen, men språket kan også gjøre kroppen til et evig prosjekt.','familie'],
  ['Kvelden etter benken','Du fikk mindre rolle enn håpet og kjenner behovet for å bevise verdi i morgen.','Privatlivet blir stedet der statusangst enten får roe seg eller fortsetter å styre neste økt.','venn'],
  ['Vennen som ikke vil konkurrere med kalenderen','Jonas foreslår noe spontant, men du ser først risikoen for søvn og restitusjon.','Du må sette en grense uten å gjøre vennskapet til et forstyrrende element i prestasjonsplanen.','venn'],
  ['Helgen uten resultatmåling','Telefonen ligger full av statistikk, klipp og kommentarer etter konkurransen.','Å logge av kan være restitusjon, men det kan også føles som å miste kontroll på egen utvikling.','venn'],
  ['Familien gratulerer kontrakten som om den var uttak','De rundt bordet blander profesjonell kontrakt, landslagsstatus og framtidig stjernestatus.','Du kan nyte stoltheten uten å bekrefte en status du ikke faktisk har fått.','familie'],
  ['Du sammenligner kroppen med Nora','Et bilde fra treningen gjør at du begynner å lese egen kropp som rangering.','Sammenligning kan gi retning, men også flytte oppmerksomheten fra funksjon til skam og kontroll.','venn'],
  ['Hviledagen som føles som latskap','Planen sier fri, men kroppen og hodet vil gjøre noe for å kjenne at du fortsatt er seriøs.','Restitusjon blir vanskeligst når arbeidets disiplin må uttrykkes gjennom å la være.','familie'],
  ['Kommentarfeltet følger deg til sengs','En svak prestasjon har blitt offentlig vurdering og du leser én kommentar for mye.','Omdømme og resultat kan være reelle, men de trenger ikke få eie natta eller neste dags selvbilde.','venn'],
  ['Helgen der idretten ikke får hele deg','To uker med trening, uttak og kropp har gjort det uklart hva som er jobb og hva som er identitet.','Du må finne et privat rom som ikke undergraver ambisjonen, men gjør at ambisjonen fortsatt tilhører deg.','familie']
];

function practiceMail({ week, kind, index, spec, family }) {
  const [title, setup, tension, person, place] = spec;
  const id = kind === 'job' ? `sport_utover_week${week}_job_${index + 1}` : `sport_utover_week${week}_private_${index + 1}`;
  const threadId = `${id}_consequence`;
  const channel = kind === 'job' ? 'job' : 'private';
  const mailType = kind === 'job' ? 'job' : 'people';
  const positiveEffects = kind === 'job'
    ? { training_quality: 2, body_strain: -1, team_trust: 1, coach_trust: 2, future_risk: -1, recovery: 1, contract_trust: 1, self_worth: 1 }
    : { relationship_private: 3, self_worth: 2, energy: 1, recovery: 2, future_risk: -1 };
  const negativeEffects = kind === 'job'
    ? { training_quality: -1, body_strain: 2, team_trust: -1, coach_trust: -1, future_risk: 2, recovery: -2, contract_trust: -1, self_worth: -1 }
    : { relationship_private: -3, self_worth: -2, energy: -2, recovery: -1, future_risk: 1 };
  const balancedEffects = kind === 'job'
    ? { training_quality: 1, body_strain: 0, team_trust: 1, coach_trust: 1, future_risk: 0, recovery: 1, contract_trust: 1, self_worth: 1 }
    : { relationship_private: 1, self_worth: 1, energy: 0, recovery: 1, future_risk: 0 };
  return {
    id, mail_type: mailType, mail_family: family, role_scope: SCOPE, channel, messageChannel: channel,
    mail_class: kind === 'job' ? 'job_message' : 'private_message', planned_only: true,
    from: person || null, place_id: place || null, subject: title,
    summary: `${setup} ${tension}`,
    situation: kind === 'job'
      ? [setup, tension, `Uke ${week} gjør dette til mer enn en enkelt situasjon: valget påvirker hvordan støtteapparat, lag og kropp leser deg videre.`]
      : [setup, tension, `Det private valget endrer ikke kampresultatet direkte, men former energi, selvbilde og relasjonen som møter deg etter arbeidstid.`],
    choices: [
      { id: 'A', label: 'Gjør det langsiktige og etterprøvbare valget, og si tydelig hvorfor.', reply: 'Jeg velger en løsning som beskytter utvikling, kropp og tillit over tid.', effects: positiveEffects, next_bias: { set_flags: [`${id}_sustainable`] }, triggers_on_choice: threadId, feedback: 'Du gjør prestasjon til en prosess som andre kan samarbeide med.' },
      { id: 'B', label: 'Prioriter kortsiktig status, tilgjengelighet eller kontroll selv om kostnaden skyves framover.', reply: 'Jeg prioriterer det som gir mest effekt eller ro akkurat nå.', effects: negativeEffects, next_bias: { set_flags: [`${id}_short_term`] }, triggers_on_choice: threadId, feedback: 'Du får en tydeligere gevinst nå, men øker kostnaden som senere valg må bære.' },
      { id: 'C', label: 'Avklar rammen med den andre personen og velg en begrenset mellomløsning.', reply: 'Jeg avklarer mandat, belastning og forventning før vi låser løsningen.', effects: balancedEffects, next_bias: { set_flags: [`${id}_bounded`] }, triggers_on_choice: threadId, feedback: 'Du beholder handlingsrom uten å late som kompromisset fjerner usikkerheten.' }
    ]
  };
}
function consequenceThread(mail, family, kind) {
  const channel = kind === 'job' ? 'job' : 'private';
  return { id: `${mail.id}_consequence`, mail_family: family, role_scope: SCOPE, mail_type: kind === 'job' ? 'job' : 'people', channel, messageChannel: channel, mail_class: kind === 'job' ? 'job_message' : 'private_message' };
}
function practiceFamily(id, week, kind, specs) {
  const mails = specs.map((spec, index) => practiceMail({ week, kind, index, spec, family: id }));
  return { id, description: `${week}. praksisuke for profesjonell Sport-utøver: ${kind === 'job' ? 'arbeid, kropp, lag og kontrakt' : 'privat etterklang, identitet og relasjoner'}.`, mails, threads: mails.map((mail) => consequenceThread(mail, id, kind)) };
}
const w1Job = practiceFamily('first_week_praksisfortellinger_sport_utover_job', 1, 'job', jobSpecs.slice(0, 5));
const w2Job = practiceFamily('second_week_praksisfortellinger_sport_utover_job', 2, 'job', jobSpecs.slice(5));
const w1Private = practiceFamily('first_week_praksisfortellinger_sport_utover_private', 1, 'private', privateSpecs.slice(0, 5));
const w2Private = practiceFamily('second_week_praksisfortellinger_sport_utover_private', 2, 'private', privateSpecs.slice(5));

const jobCatalog = readJson(JOB);
const practiceIds = new Set([w1Job.id, w2Job.id]);
jobCatalog.families = (jobCatalog.families || []).filter((f) => !practiceIds.has(f.id));
jobCatalog.families.push(w1Job, w2Job);
writeJson(JOB, jobCatalog);
writeJson(PEOPLE, { schema: 'civication_mail_family_catalog_v1', version: 1, category: 'sport', role_scope: SCOPE, mail_type: 'people', families: [w1Private, w2Private] });

function depthMail(id, type, family, subject, situation, positive, negative, from, place) {
  return { id, mail_type: type, mail_family: family, role_scope: SCOPE, planned_only: true, from, place_id: place, subject, summary: situation.join(' '), situation,
    choices: [
      { id: 'A', label: positive, reply: positive, effects: { training_quality: 2, team_trust: 1, future_risk: -1, self_worth: 1 }, next_bias: { set_flags: [`${id}_responsible`] }, feedback: 'Valget gjør ansvar, usikkerhet og rollegrense tydeligere for de andre.' },
      { id: 'B', label: negative, reply: negative, effects: { training_quality: -1, team_trust: -1, future_risk: 2, self_worth: -1 }, next_bias: { set_flags: [`${id}_risk`] }, feedback: 'Valget løser presset raskere, men gjør den senere kostnaden mindre synlig.' }
    ] };
}
const conflictMails = [
  depthMail('sport_utover_conflict_001','conflict','uttak_kontrakt_og_mandat','Kontrakt er ikke sportslig uttak',[ 'Ragnhild forklarer at kontrakten består selv om du ikke er i troppen.', 'Du opplever fraværet som statusfall, men uttak ligger i et annet mandat enn arbeidsavtalen.', 'Du må be om prestasjonskriterier uten å gjøre jobben til rett på spilletid.' ],'Be om konkrete sportslige kriterier og hold kontrakt og uttak adskilt.','Bruk kontrakten som argument for at du bør ha plass.','sportslig_leder','sport_garderobe'),
  depthMail('sport_utover_conflict_002','conflict','uttak_kontrakt_og_mandat','Når medisinsk vurdering og lagbehov kolliderer',[ 'Elias anbefaler redusert belastning mens laget mangler folk.', 'Treneren spør hva du selv tror du tåler, men medisinsk fagmyndighet kan ikke stemmes bort av lojalitet.', 'Konflikten handler om tilgjengelighet nå mot faktisk arbeidsevne senere.' ],'Følg den faglige rammen og avklar en trygg rolle.','Press for full deltakelse fordi laget trenger deg.','fysio_elias','sport_fysiorom')
];
const storyMails = [
  depthMail('sport_utover_story_001','story','prestasjon_og_selvbilde','Når resultatet blir biografi',[ 'Et dårlig resultat blir raskt omtalt som tegn på hvem du er som utøver.', 'Du merker at analysen av prestasjonen glir over i dom over karakter, talent og framtid.', 'Rollen krever at du tar resultatet alvorlig uten å gjøre det til hele identiteten.' ],'Skill prestasjonsanalyse fra menneskeverd og velg ett konkret læringspunkt.','Bruk skuffelsen som bevis på at du må endre alt.','lagkamerat_nora','sport_konkurransearena'),
  depthMail('sport_utover_story_002','story','prestasjon_og_selvbilde','Profesjonell uten å være stjerne',[ 'Du lever av idretten, men er verken landslagsutøver eller offentlig stjerne.', 'Det profesjonelle arbeidet er fullt reelt også når den symbolske statusen er lavere enn drømmen.', 'Du må bestemme om karrieren skal måles i faktisk arbeid eller i rang du ikke kontrollerer.' ],'Bygg stolthet i det profesjonelle arbeidet du faktisk utfører.','La manglende status gjøre alt annet til mellomstasjon.','trener_maja','sport_treningsfelt')
];
const eventMails = [
  depthMail('sport_utover_event_001','event','konkurransedag_og_reise','Forsinket reise før konkurranse',[ 'Reisen blir forsinket og dere ankommer senere enn restitusjonsplanen forutsatte.', 'Mat, søvn og oppvarming må nå prioriteres på nytt i stedet for å gjennomføres som om logistikken var normal.', 'Profesjonalitet testes i justering, ikke i å late som planen fortsatt er intakt.' ],'Juster belastning og forberedelse sammen med støtteapparatet.','Hold opprinnelig plan for å vise at ingenting påvirker deg.','lagkontakt_samir','sport_reise'),
  depthMail('sport_utover_event_002','event','konkurransedag_og_reise','Uventet plass i startoppstillingen',[ 'En lagkamerat blir utilgjengelig og du får større rolle med kort varsel.', 'Muligheten du ønsket deg kommer uten den perfekte forberedelsen du hadde forestilt deg.', 'Du må bruke ambisjonen uten å gjøre den nye statusen til krav om å overprestere.' ],'Forankre deg i oppgaver, kropp og lagplan før start.','Bruk sjansen til å bevise alt på én gang.','trener_maja','sport_konkurransearena')
];
const knowledgeMails = [
  depthMail('sport_utover_knowledge_001','knowledge','belastningsforstaelse','Belastning er mer enn hvor hard økta føles',[ 'Elias viser sammenhengen mellom treningsbelastning, søvn, reise og tidligere arbeid.', 'Ett enkelt tall kan ikke avgjøre om du er klar; vurderingen må kombinere kroppssignal, historikk og faglig oppfølging.', 'Kunnskapen skal brukes til å stille bedre spørsmål, ikke til å diagnostisere deg selv.' ],'Bruk loggen som samtalegrunnlag med trener og fysio.','Bruk ett tall som fasit for at du kan trene fullt.','fysio_elias','sport_fysiorom'),
  depthMail('sport_utover_knowledge_002','knowledge','belastningsforstaelse','Prestasjon, resultat og uttak er tre forskjellige signaler',[ 'Maja ber deg skille hva du faktisk gjorde, hva tavla viste og hva trenerteamet senere velger.', 'Prestasjon kan forbedres i et tap, resultat kan være godt med svak prosess, og uttak inkluderer forhold du ikke eier.', 'Å skille signalene gjør læring mer presis og status mindre forvirrende.' ],'Skriv tre separate vurderinger: prestasjon, resultat og uttak.','Slå dem sammen til én konklusjon om hvor god du er.','trener_maja','sport_treningsfelt')
];
writeJson(CONFLICT, { schema:'civication_mail_family_catalog_v1',version:1,category:'sport',role_scope:SCOPE,mail_type:'conflict',families:[{id:'uttak_kontrakt_og_mandat',description:'Konflikter om mandat, uttak, helse og kontrakt.',mails:conflictMails}] });
writeJson(STORY, { schema:'civication_mail_family_catalog_v1',version:1,category:'sport',role_scope:SCOPE,mail_type:'story',families:[{id:'prestasjon_og_selvbilde',description:'Fortellinger om resultat, identitet og profesjonell status.',mails:storyMails}] });
writeJson(EVENT, { schema:'civication_mail_family_catalog_v1',version:1,category:'sport',role_scope:SCOPE,mail_type:'event',families:[{id:'konkurransedag_og_reise',description:'Hendelser der logistikk og konkurranse endrer arbeidsdagen.',mails:eventMails}] });
writeJson(KNOWLEDGE, { schema:'civication_mail_family_catalog_v1',version:1,category:'sport',role_scope:SCOPE,mail_type:'knowledge',families:[{id:'belastningsforstaelse',description:'Kunnskapsmailer som gjør belastning, prestasjon og uttak handlingsrelevant.',mails:knowledgeMails}] });

const plan = readJson(PLAN);
plan.sequence = (plan.sequence || []).filter((s) => Number(s.step) <= 8);
function practiceSteps(start, jobFamily, privateFamily, week) {
  return Array.from({length:10},(_,i)=>({ step:start+i, type:i%2===0?'job':'people', phase:week===1?'practice_week_1':'practice_week_2', step_goal:`Praksisuke ${week}, ${i%2===0?'arbeid':'privat'}: bygg kontinuitet mellom kropp, prestasjon, lag og identitet.`, allowed_families:[i%2===0?jobFamily:privateFamily], fallback_types:[] }));
}
plan.sequence.push(...practiceSteps(9,w1Job.id,w1Private.id,1),...practiceSteps(19,w2Job.id,w2Private.id,2));
plan.sequence.push(
  {step:29,type:'conflict',phase:'deepening',step_goal:'Skille profesjonell kontrakt, sportslig uttak og medisinsk mandat under press.',allowed_families:['uttak_kontrakt_og_mandat'],fallback_types:[]},
  {step:30,type:'story',phase:'deepening',step_goal:'La prestasjonsidentiteten møte et liv der jobb er reell uten at stjernestatus er garantert.',allowed_families:['prestasjon_og_selvbilde'],fallback_types:[]},
  {step:31,type:'event',phase:'deepening',step_goal:'Teste profesjonell tilpasning når reise eller rolle endrer konkurransedagen.',allowed_families:['konkurransedag_og_reise'],fallback_types:[]},
  {step:32,type:'knowledge',phase:'mastery',step_goal:'Bruke belastnings- og prestasjonskunnskap uten å gjøre ett signal til fasit.',allowed_families:['belastningsforstaelse'],fallback_types:[]}
);
writeJson(PLAN, plan);

const registry = readJson('data/Civication/praksisfortellinger_registry.json');
registry.roles = (registry.roles || []).filter((r) => !(r.domain === 'sport' && r.role_id === SCOPE));
registry.roles.push({
  role_id:SCOPE, domain:'sport', plan_path:PLAN, job_family_path:JOB, private_family_path:PEOPLE,
  expected_signals:['training_quality','body_strain','team_trust','coach_trust','future_risk','recovery','contract_trust','self_worth','relationship_private','energy'],
  packages:[
    {package_id:'sport_utover_week_1',week:1,step_start:9,step_end:18,job_family:w1Job.id,private_family:w1Private.id,expected_job_threads:5,expected_private_threads:5,test_file:SPORT_TEST},
    {package_id:'sport_utover_week_2',week:2,step_start:19,step_end:28,job_family:w2Job.id,private_family:w2Private.id,expected_job_threads:5,expected_private_threads:5,test_file:SPORT_TEST}
  ],
  flow_tests:[SPORT_TEST]
});
writeJson('data/Civication/praksisfortellinger_registry.json', registry);

const lifeRole = {
  version:1,id:'sport_utover',navn:'Profesjonell utøver',
  kjernefantasi:'Du lever av å prestere med kroppen uten å la kontrakt, uttak og resultat bli samme ting — eller la idretten spise hele livet rundt arbeidet.',
  arbeidsoppgaver:['følge trenings- og konkurranseplan','rapportere belastning og skade tidlig','samarbeide med trener og støtteapparat','ivareta kontraktsforpliktelser','bygge restitusjon som del av arbeidet'],
  personer:model.related_people.map((p)=>({id:p.id,navn:p.name,beskrivelse:p.function})),
  hovedkonflikter:['prestasjon vs forsvarlig belastning','lagrolle vs statusambisjon','kontrakt vs sportslig uttak','resultat vs selvbilde','profesjonell disiplin vs privat liv'],
  endings:[
    {id:'baerekraftig_profesjonell',navn:'Bærekraftig profesjonell',tekst:'Du lærte å prestere med kroppen som informasjonskilde, laget som samarbeid og kontrakten som ramme. Ambisjonen ble ikke mindre; den ble mulig å bære lenger.',kriterier:{meters:{integritet:{min:60}},flagg:{sport_rapporterte_belastning:true}},standard:true},
    {id:'presset_for_langt',navn:'Presset for langt',tekst:'Du var tilgjengelig, synlig og villig til å presse. Til slutt ble kroppen stedet der alle de utsatte kostnadene samlet seg, og prestasjonen fikk mindre rom enn viljen.',kriterier:{meters:{energi:{max:55}},flagg:{sport_presset_videre:true}}},
    {id:'lagrolle_med_tillit',navn:'Lagrolle med tillit',tekst:'Du sluttet å måle verdi bare i uttak og spilletid. Laget visste hva du kunne bidra med, og du visste når en liten rolle fortsatt var profesjonelt viktig.',kriterier:{meters:{integritet:{min:56}},flagg:{sport_eide_lagrollen:true}}},
    {id:'statusjageren',navn:'Statusjageren',tekst:'Kontrakt, uttak og offentlig blikk gled sammen. Du trente ikke bare for å prestere, men for å bevise at du fortjente en rang ingen økt kunne garantere.',kriterier:{meters:{synlighet:{min:55}},flagg:{sport_jaget_status:true}}}
  ],
  startState:{meters:{penger:390,psyke:63,energi:68,integritet:54,synlighet:45,handlingsrom:50},relasjoner:{trener_maja:54,fysio_elias:50,lagkontakt_samir:52,lagkamerat_nora:52,sportslig_leder:46,kontraktansvarlig:45,venn:61,familie:57}},
  dagsplan:{'1':[{klokke:'08:00',tekst:'Treningsøkt og belastningsstatus'},{klokke:'15:00',tekst:'Lagrolle og oppfølging'},{klokke:'20:00',tekst:'Restitusjon hjemme'}],'2':[{klokke:'09:00',tekst:'Fysio og treningsplan'},{klokke:'17:00',tekst:'Konkurranseforberedelse'}],'3':[{klokke:'08:30',tekst:'Uttak og rolle'},{klokke:'19:00',tekst:'Privat etterklang'}]}
};
const lifeThreads = {version:1,rolle:SCOPE,threads:[
  {id:'sport_ls_body',type:'arbeidsliv',tittel:'Kroppen som arbeidsredskap',tema:'belastning',konflikt:'kortsiktig tilgjengelighet vs kroppens langsiktige arbeidsevne',personer:['fysio_elias','trener_maja'],startDag:1,muligeRetninger:['rapportere','presse','justere']},
  {id:'sport_ls_coach',type:'arbeidsliv',tittel:'Trenerens plan og din ambisjon',tema:'myndighet',konflikt:'egen ambisjon vs trenerens rolle- og belastningsmandat',personer:['trener_maja'],startDag:1,muligeRetninger:['avklare','bevise','samarbeide']},
  {id:'sport_ls_team',type:'arbeidsliv',tittel:'Laget som sosialt system',tema:'tilhørighet',konflikt:'laglojalitet vs status og usunne normer',personer:['lagkontakt_samir','lagkamerat_nora'],startDag:2,muligeRetninger:['eie rolle','utfordre norm','jage rang']},
  {id:'sport_ls_status',type:'arbeidsliv',tittel:'Kontrakt uten garantert status',tema:'status',konflikt:'reelt profesjonelt arbeid vs uttak og rang som andre avgjør',personer:['sportslig_leder','kontraktansvarlig'],startDag:2,muligeRetninger:['skille mandat','kreve status','bygge arbeid']},
  {id:'sport_ls_private',type:'privatliv',tittel:'Idretten følger hjem',tema:'identitet',konflikt:'profesjonell disiplin vs vennskap, familie og et selv som ikke alltid skal prestere',personer:['venn','familie'],startDag:1,muligeRetninger:['legge fra seg rollen','optimalisere alt','reparere nærhet']}
]};
function lifeChoice(id,text,thread,meters,flag,rel,delta,next,completed){const effekter={meters,flagg:{[flag]:true},threads:{[thread]:completed?{status:'completed'}:{stepDelta:1}}};if(rel)effekter.relasjoner={[rel]:delta};const out={id,tekst:text,effekter,konsekvensTekst:'Måten du håndterer dette på blir husket av både kroppen og menneskene rundt deg.'};if(next)out.laaserOpp=[next];return out;}
function lifeScene({id,threadId,fase,dag,type,sender,title,text,next,rel,posFlag,negFlag,completed=false}){return{id,threadId,fase,dag,visningstype:type,avsender:sender,tilgjengelighet:next||id.endsWith('_01')?'start':'laast',prioritet:8,tittel:title,tekst:text,valg:[lifeChoice('A','Si det som faktisk skjer og velg en løsning som tåler at kroppen eller relasjonen har grenser.',threadId,{integritet:3,energi:1,psyke:2},posFlag,rel,4,next,completed),lifeChoice('B','Press videre eller gjør situasjonen til et spørsmål om status og vilje.',threadId,{integritet:-2,energi:-4,synlighet:2},negFlag,rel,-3,next,completed)]};}
const lifeScenes={version:1,rolle:SCOPE,scenes:[
  lifeScene({id:'sport_ls_body_01',threadId:'sport_ls_body',fase:'morgen',dag:1,type:'intern vurdering',sender:'fysio_elias',title:'Elias spør om plagen før økta',text:'Plagen er liten nok til at du kan skjule den og stor nok til at Elias spør. Nå avgjør du om støtteapparatet får riktig informasjon før belastningen øker.',next:'sport_ls_body_02',rel:'fysio_elias',posFlag:'sport_rapporterte_belastning',negFlag:'sport_presset_videre'}),
  lifeScene({id:'sport_ls_body_02',threadId:'sport_ls_body',fase:'ettermiddag',dag:4,type:'samtale',sender:'fysio_elias',title:'Kroppen husker første valget',text:'Belastningen har utviklet seg. Elias viser deg hvordan den første rapporteringen — eller mangelen på den — påvirket hvor mye handlingsrom dere har nå.',rel:'fysio_elias',posFlag:'sport_bygde_kroppstillit',negFlag:'sport_skjulte_belastning',completed:true}),
  lifeScene({id:'sport_ls_coach_01',threadId:'sport_ls_coach',fase:'formiddag',dag:1,type:'møte',sender:'trener_maja',title:'Maja gir deg en mindre rolle enn du vil ha',text:'Du har ambisjon om mer ansvar. Maja ber deg eie en smal oppgave i stedet for å bruke økta til å bevise at vurderingen er feil.',next:'sport_ls_coach_02',rel:'trener_maja',posFlag:'sport_eide_lagrollen',negFlag:'sport_jaget_status'}),
  lifeScene({id:'sport_ls_coach_02',threadId:'sport_ls_coach',fase:'ettermiddag',dag:5,type:'samtale',sender:'trener_maja',title:'Rollen blir vurdert på nytt',text:'Maja kommer tilbake til hvordan du bar den lille rollen. Samtalen handler nå om tillit og timing, ikke bare om ønsket om mer.',rel:'trener_maja',posFlag:'sport_bygde_trenertillit',negFlag:'sport_gjorde_alt_til_uttak',completed:true}),
  lifeScene({id:'sport_ls_team_01',threadId:'sport_ls_team',fase:'ettermiddag',dag:2,type:'samtale',sender:'lagkontakt_samir',title:'Samir ler av smerten som alle andre',text:'Garderoben bruker humor til å gjøre belastning mindre farlig sosialt. Du merker samtidig at noen blir stillere om det de faktisk kjenner.',next:'sport_ls_team_02',rel:'lagkontakt_samir',posFlag:'sport_utfordret_usunn_norm',negFlag:'sport_lojal_til_taushet'}),
  lifeScene({id:'sport_ls_team_02',threadId:'sport_ls_team',fase:'formiddag',dag:6,type:'samtale',sender:'lagkamerat_nora',title:'Nora forteller hva kulturen kostet',text:'Nora sier hun ventet for lenge med å si fra fordi hun ikke ville være den forsiktige. Det gjør den gamle garderobespøken til en faktisk konsekvens.',rel:'lagkamerat_nora',posFlag:'sport_bygde_teamtillit',negFlag:'sport_forsvarte_normen',completed:true}),
  lifeScene({id:'sport_ls_status_01',threadId:'sport_ls_status',fase:'formiddag',dag:2,type:'melding',sender:'sportslig_leder',title:'Troppen er ute — kontrakten består',text:'Navnet ditt mangler i uttaket. Ragnhild minner om at arbeidsforhold og sportslig uttak er to forskjellige beslutninger, selv om de kjennes som samme statusfall.',next:'sport_ls_status_02',rel:'sportslig_leder',posFlag:'sport_skilt_kontrakt_uttak',negFlag:'sport_krevde_uttak'}),
  lifeScene({id:'sport_ls_status_02',threadId:'sport_ls_status',fase:'ettermiddag',dag:6,type:'møte',sender:'kontraktansvarlig',title:'Henrik skiller jobb, profil og prestisje',text:'En profilmulighet kommer samtidig som nytt uttak diskuteres. Henrik ber deg holde avtale, sportslig status og kommersiell synlighet som tre forskjellige spor.',rel:'kontraktansvarlig',posFlag:'sport_holdt_mandatgrenser',negFlag:'sport_blandet_status_og_avtale',completed:true}),
  lifeScene({id:'sport_ls_private_01',threadId:'sport_ls_private',fase:'kveld',dag:1,type:'privat hendelse',sender:'venn',title:'Jonas vil spise middag uten restitusjonsanalyse',text:'Du begynner å vurdere måltidet, tidspunktet og morgendagens økt mens Jonas prøver å fortelle om sin egen dag. Han spør om dere kan være venner før dere er optimaliseringsprosjekt.',next:'sport_ls_private_02',rel:'venn',posFlag:'sport_lot_privatliv_vaere_privat',negFlag:'sport_optimaliserte_alt'}),
  lifeScene({id:'sport_ls_private_02',threadId:'sport_ls_private',fase:'kveld',dag:6,type:'samtale',sender:'familie',title:'Søsteren spør hvem du er på en hviledag',text:'Etter to uker med kropp, uttak og resultat spør søsteren din hva som er igjen når dagens plan sier fri. Spørsmålet handler ikke om å gi opp ambisjonen, men om hvem som eier den.',rel:'familie',posFlag:'sport_beholdt_eget_liv',negFlag:'sport_ble_bare_resultat',completed:true})
]};
writeJson(LIFE_ROLE,lifeRole);writeJson(LIFE_THREADS,lifeThreads);writeJson(LIFE_SCENES,lifeScenes);
const manifest=readJson('data/Civication/lifestory/manifest.json');manifest.roles.sport_utover={role:LIFE_ROLE,threads:LIFE_THREADS,scenes:LIFE_SCENES,role_scope:SCOPE,badge_id:'sport',badge_titles:['Profesjonell utøver']};writeJson('data/Civication/lifestory/manifest.json',manifest);

const refs=[
  ...w1Job.mails.map(m=>`${JOB}#${m.id}`),...w1Private.mails.map(m=>`${PEOPLE}#${m.id}`),...w2Job.mails.map(m=>`${JOB}#${m.id}`),...w2Private.mails.map(m=>`${PEOPLE}#${m.id}`),
  `${JOB}#sport_utover_job_trening_001`,`${JOB}#sport_utover_job_trening_002`,`${JOB}#sport_utover_job_kropp_001`,`${JOB}#sport_utover_job_kropp_002`,`${JOB}#sport_utover_job_lag_001`,`${JOB}#sport_utover_job_lag_002`,`${JOB}#sport_utover_job_konk_001`,`${JOB}#sport_utover_job_konk_002`,
  ...lifeScenes.scenes.map(s=>`${LIFE_SCENES}#${s.id}`),...conflictMails.map(m=>`${CONFLICT}#${m.id}`),...storyMails.map(m=>`${STORY}#${m.id}`),...eventMails.map(m=>`${EVENT}#${m.id}`),...knowledgeMails.map(m=>`${KNOWLEDGE}#${m.id}`),
  `${GRAMMAR}#uttak_utenfor_kontrakt`,`${GRAMMAR}#belastning_for_kamp`,`${GRAMMAR}#reise_og_restitusjon`,`${GRAMMAR}#kommersiell_kollisjon`,`${GRAMMAR}#resultatpress`,
  `${MODEL}#belastning_vs_kamp`,`${MODEL}#kontrakt_vs_uttak`,`${MODEL}#spille_med_plage`,`${MODEL}#personlig_merkevare_vs_lag`,`${MODEL}#overbelastning`
];
if(refs.length!==56)throw new Error(`Expected exactly 56 unique provenance refs, got ${refs.length}`);
const dayNarratives=[
  'Første dagen etablerer at profesjonalitet betyr å følge rytme og rapportere kroppen før behovet for å imponere får styre økta.',
  'Lagrollen blir mindre enn ambisjonen samtidig som kontrakt, uttak og sosial rang begynner å gli sammen i spillerens eget blikk.',
  'Et svakt resultat utfordrer selvbildet, mens analyse og privat etterklang viser at tavla bare beskriver én del av prestasjonen.',
  'En liten belastning kommer tilbake og gjør det tydelig at tidlige signaler enten skapte handlingsrom eller ble gjeld i kroppen.',
  'Trenerens tillit og spillerens statusbehov møtes når mer ansvar faktisk blir mulig, men bare dersom den tidligere rollen ble båret godt.',
  'Garderobekultur, medisinsk informasjon og vennskap viser at taushet kan se ut som lojalitet helt til noen andre betaler kostnaden.',
  'Reise og restitusjon bryter idealplanen, og utøveren må vise om disiplin betyr rigid gjennomføring eller presis tilpasning.',
  'En kommersiell mulighet gjør synlighet og kontraktsgrenser konkrete samtidig som privatlivet merker hvor mye idretten allerede eier.',
  'Kampen der kroppen har mindre margin tvinger fram et valg mellom kortsiktig tilgjengelighet og muligheten til å være tilgjengelig senere.',
  'Prestasjon, resultat og uttak skilles fra hverandre, slik at læring kan fortsette uten at statusangst blir skjult som treningsanalyse.',
  'En uventet konkurranserolle gir spilleren mer synlighet og tester om oppgavefokus overlever når muligheten til å bevise alt plutselig kommer.',
  'Offentlig vurdering og sammenligning gjør omdømme til en kroppslig belastning som må håndteres uten å late som kommentarer er irrelevante.',
  'Støtteapparatet samler to ukers signaler og viser hvilke valg som bygde tillit, hvilke som økte risiko og hvilke som bare så profesjonelle ut.',
  'Siste dag spør hva slags profesjonell utøver spilleren har blitt: en som kan bære ambisjon, kropp, lag og eget liv samtidig, eller en som blir spist av resultatet.'
];
const phaseAdds={morning:'Morgenen setter den profesjonelle rammen gjennom plan, kropp eller kontrakt før dagens statuskamp begynner.',lunch:'Midt på dagen lar en relasjon eller sosial norm tolke det som skjedde, slik at prestasjon aldri bare blir individuell.',afternoon:'Ettermiddagen gjør konflikten handlingsnær gjennom trening, uttak, konkurranse eller støtteapparatets konkrete vurdering.',evening:'Kvelden lar arbeidet lekke hjem i selvbilde, vennskap, familie eller restitusjon, og gjør neste dag avhengig av mer enn resultatet.'};
const beatTypes=[['info','relationship','decision','private_consequence'],['task','conversation','decision','relationship'],['consequence','social','task','private_consequence'],['info','relationship','consequence','private_consequence'],['task','conversation','decision','private_consequence'],['consequence','relationship','social','private_consequence'],['task','conversation','decision','private_consequence'],['info','social','decision','relationship'],['task','relationship','decision','private_consequence'],['info','conversation','task','private_consequence'],['task','relationship','decision','private_consequence'],['consequence','social','decision','private_consequence'],['info','conversation','consequence','relationship'],['task','relationship','consequence','private_consequence']];
const phases=['morning','lunch','afternoon','evening'];
const coverage=[];let ri=0;for(let day=1;day<=14;day++){for(let p=0;p<4;p++){const phase=phases[p];coverage.push({day,phase,beat_type:beatTypes[day-1][p],summary:`Dag ${day}, ${phase}: ${dayNarratives[day-1]} ${phaseAdds[phase]}`,materialization_refs:[refs[ri++]]});}}
const npc=(id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player)=>({id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player});
const world={schema:'civication_role_world_v1',version:1,category:'sport',role_scope:SCOPE,title:'Sport-utøver — kroppen som arbeid, status og grense',status:'role_world_complete',
  sociological_core:{main_problem:'Å leve av prestasjon uten å gjøre kroppen, uttaket og resultatet til én samlet dom over egen verdi.',description:'Den profesjonelle utøveren arbeider i et system der kroppen både er arbeidsredskap og sårbarhet, treneren fordeler sportslig handlingsrom, laget skaper normer og tilhørighet, og resultater blir offentlig status. Rollesesongen undersøker hvordan ambisjon kan være sterk uten å spise restitusjon, relasjoner eller evnen til å skille kontrakt fra uttak og menneskeverd fra prestasjon.'},
  theme_ids:['body_discipline','shame_reputation','precarity','ambition_stagnation'],
  social_environments:['treningsfeltet der repetisjon, trenerblikk og sammenligning gjør utvikling sosialt synlig','fysio- og styrkerommet der smerte, belastning og retur til full deltakelse må oversettes til faglige valg','garderoben der humor, status og laglojalitet kan avgjøre hva utøvere tør å si om kropp og usikkerhet','konkurransearenaen der prestasjon blir resultat, publikum og omdømme samtidig','reise- og kontraktsflaten der logistikk, profesjonelle avtaler og sportslig uttak må holdes fra hverandre','hjem og vennskap der mat, søvn, kropp og status kan gjøre hele livet til prestasjonsforberedelse'],
  recurring_people_archetypes:[
    npc('trener_maja','sportslig leder i den daglige prestasjonsprosessen','profesjonell fagperson med formell makt over treningsplan og rollebruk','høy sportslig status','fordeler oppgaver, belastning og konkurranserolle innen sitt mandat','at spilleren utvikler seg stabilt og kan brukes i laget over tid','hvor ofte hun må velge lagets kortsiktige behov mot enkeltutøverens langsiktige utvikling','kort, konkret og oppgaveorientert; spør hva kroppen og prestasjonen faktisk viser','at ambisjon trenger rammer og at trenerens vurdering ikke er en dom over menneskeverd'),
    npc('fysio_elias','medisinsk/fysisk støtte som gjør kroppssignaler handlingsrelevante','spesialist med faglig autoritet over helseoppfølging, men ikke sportslig status','høy faglig status','kan begrense eller anbefale belastning og gjøre skjulte signaler vanskelige å ignorere','at skader forebygges og at spilleren rapporterer nok til forsvarlig oppfølging','frustrasjonen over at helseinfo ofte blir forhandlet som om den bare var motivasjon','rolig, presis og kroppsnær; skiller smerte, funksjon, risiko og usikkerhet','at tøffhet ikke gir myndighet til å overstyre kropp eller faglig risiko'),
    npc('lagkontakt_samir','bærer av garderobekultur og uformelle normer','lagmedlem med sosial kapital mer enn formell myndighet','høy uformell status','kan gjøre en norm trygg å utfordre eller kostbar å bryte','at laget holder sammen og at problemer ikke eksploderer midt i konkurranseperioden','hvor mye han selv bruker humor for å slippe å vise usikkerhet','uformell, lojal og ironisk; tester grenser gjennom små kommentarer','at lagkultur kan beskytte mennesker eller lære dem å skjule det laget trenger å vite'),
    npc('lagkamerat_nora','nær sammenligningsflate, samarbeidspartner og konkurrent om rolle','profesjonell likemann med lignende kontraktsstatus','sideordnet status med skiftende sportslig rang','kan støtte, utfordre eller forsterke sammenligning og skam','å få rettferdig rolle og et lagmiljø der hun kan utvikle seg uten å skjule svakhet','egen frykt for å miste plass hvis hun viser for mye belastning eller tvil','direkte og erfaringsnær; snakker om hva som faktisk skjedde i økta','at samarbeid og konkurranse kan eksistere samtidig uten at alt må bli rangering'),
    npc('sportslig_leder','eier kontrakts- og troppsrammer over trenerens daglige arbeid','leder med organisatorisk og økonomisk myndighet','høy formell status','kan påvirke kontrakt, framtidig arbeid og sportslig ramme, men ikke garantere prestasjon','at klubben får pålitelig prestasjon og profesjonell atferd innen avtalene','hvor ofte sportslige og økonomiske hensyn trekker i ulike retninger','formell, avklarende og knapp; skiller hva som er avtalt fra hva som ønskes','at ansettelse, uttak og prestisje er forskjellige institusjonelle beslutninger'),
    npc('kontraktansvarlig','skiller arbeidsavtale, profilaktivitet og kommersiell mulighet fra Badge-status','administrativ/kommersiell spesialist med tilgang til avtaleinformasjon','middels formell status, høy avtalemakt','kan si hva en avtale faktisk tillater og stoppe selvoppfunnet inntekt eller forpliktelse','at utøverens eksterne aktiviteter er avklart og etterprøvbare','hvor mye kommersiell verdi som også avhenger av offentlig status spilleren ikke kontrollerer','ordnær og konkret; spør alltid hvilken avtale og hvilken part som faktisk har lovet noe','at profesjonell frihet bygges av reelle avtaler, ikke av forestilt stjernestatus'),
    npc('venn','privat relasjon som nekter å bli støtteapparat','likemann uten sportslig myndighet','høy emosjonell betydning','kan trekke seg unna når alt sosialt må optimaliseres for prestasjon','å beholde et vennskap der idretten er viktig, men ikke eneste tema','bekymringen for at spilleren bare er tilgjengelig når kalenderen tillater det','uformell og direkte; gjør narr av overoptimalisering når den tar over samtalen','at restitusjon også kan bety et liv som ikke hele tiden handler om å restituere'),
    npc('familie','nær relasjon som speiler status, stolthet og kropp uten profesjonelt filter','familierelasjon uten institusjonell sportsmakt','emosjonell og biografisk status','kan gjøre offentlig prestasjon personlig og minne spilleren på identitet før kontrakten','at spilleren lykkes uten å forsvinne inn i rollen','at stolthet over status kan bidra til akkurat det presset hun samtidig er redd for','konkret, varm og tidvis grenseløs; blander minner, kropp og framtidsdrømmer','at statusangst også produseres av kjærlighet, forventning og andres stolthet')],
  slow_axes:[{id:'body_strain',meaning:'akkumulert kroppslig kostnad når belastning og restitusjon ikke holdes sammen',runtime_binding:'existing'},{id:'coach_trust',meaning:'trenerens tillit til at spilleren kan rapportere ærlig og bære rolle uten å gjøre alt til statuskamp',runtime_binding:'existing'},{id:'team_trust',meaning:'lagets tillit til at spilleren kan være både ambisiøs og trygg å dele usikkerhet med',runtime_binding:'existing'},{id:'self_worth',meaning:'hvor sterkt eget menneskeverd blir koblet til resultat, uttak og offentlig rang',runtime_binding:'existing'},{id:'relationship_private',meaning:'om vennskap og familie får et rom som ikke bare er støttefunksjon for prestasjon',runtime_binding:'existing'},{id:'public_reputation',meaning:'den redaksjonelle utviklingen i hvordan offentlig vurdering og status former spilleren uten å late som et nytt runtimefelt finnes',runtime_binding:'editorial_only_until_governed'}],
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'body_as_work',relationship:'Elias og spilleren: kroppssignal, belastning og langsiktig arbeidsevne',beat_refs:['1/morning','2/afternoon','4/morning','6/afternoon','9/morning','12/afternoon','14/morning']},
    {id:'coach_ambition',relationship:'Maja og spilleren: ambisjon, rolle og tillit gjennom to uker',beat_refs:['1/lunch','2/morning','5/morning','7/afternoon','10/morning','11/afternoon','14/afternoon']},
    {id:'team_norms',relationship:'Samir/Nora og spilleren: tilhørighet, sammenligning og hva laget tør å si',beat_refs:['2/lunch','3/lunch','6/lunch','8/lunch','10/lunch','12/lunch','13/lunch']},
    {id:'contract_status',relationship:'Sportslig ledelse og spilleren: kontrakt, uttak og prestisje som separate spor',beat_refs:['2/evening','5/afternoon','8/afternoon','10/afternoon','11/morning','13/morning','14/lunch']},
    {id:'private_identity',relationship:'Venn/familie og spilleren: når prestasjonslogikken følger hjem',beat_refs:['1/evening','3/evening','4/evening','6/evening','8/evening','12/evening','14/evening']},
    {id:'result_reputation',relationship:'Spilleren og det offentlige resultatblikket: læring, skam og selvbilde',beat_refs:['3/morning','3/afternoon','7/morning','9/afternoon','10/evening','12/morning','13/afternoon','14/afternoon']}],
  private_aftermath:[
    {id:'meal_not_metric',description:'Mat og restitusjon kan bli så profesjonalisert at en middag med en venn oppleves som et avvik fra planen.',materialization_refs:[`${PEOPLE}#sport_utover_week1_private_1`,`${LIFE_SCENES}#sport_ls_private_01`]},
    {id:'bench_status_home',description:'Mindre rolle eller manglende uttak følger hjem som statusangst og kan gjøre neste treningsdag til et bevisprosjekt.',materialization_refs:[`${PEOPLE}#sport_utover_week1_private_3`,`${LIFE_SCENES}#sport_ls_status_01`]},
    {id:'body_comparison',description:'Sammenligning med lagkamerater kan flytte oppmerksomhet fra kroppens funksjon til skam og sosial rang.',materialization_refs:[`${PEOPLE}#sport_utover_week2_private_2`,`${LIFE_SCENES}#sport_ls_team_02`]},
    {id:'public_comments_night',description:'Offentlig vurdering kan bli en nattlig belastning som påvirker søvn, selvbilde og neste dags prestasjonsrom.',materialization_refs:[`${PEOPLE}#sport_utover_week2_private_4`,`${STORY}#sport_utover_story_001`]},
    {id:'life_beyond_result',description:'Et privat rom uten prestasjonskrav blir ikke motsetning til ambisjon, men en måte å bevare hvem som faktisk eier den.',materialization_refs:[`${PEOPLE}#sport_utover_week2_private_5`,`${LIFE_SCENES}#sport_ls_private_02`]}],
  delayed_consequences:[
    {id:'small_pain_returns',setup_ref:'1/morning',return_ref:'4/morning',domains:['job','psyche','narrative']},
    {id:'role_becomes_trust',setup_ref:'1/lunch',return_ref:'5/morning',domains:['job','relationship','reputation']},
    {id:'silence_costs_team',setup_ref:'2/lunch',return_ref:'6/lunch',domains:['job','relationship','narrative']},
    {id:'contract_not_selection',setup_ref:'2/evening',return_ref:'10/afternoon',domains:['job','reputation','narrative']},
    {id:'result_enters_home',setup_ref:'3/morning',return_ref:'12/evening',domains:['relationship','psyche','reputation']},
    {id:'identity_after_season',setup_ref:'8/evening',return_ref:'14/evening',domains:['relationship','psyche','narrative']}],
  materialization:{no_new_runtime:true,source_refs:[MODEL,GRAMMAR,PLAN,JOB,PEOPLE,CONFLICT,STORY,EVENT,KNOWLEDGE,LIFE_ROLE,LIFE_THREADS,LIFE_SCENES]}}
writeJson(WORLD,world);

const index=readJson('data/Civication/roleWorlds/index.json');index.roles=(index.roles||[]).filter(e=>!(e.category==='sport'&&e.role_scope===SCOPE));index.roles.push({category:'sport',role_scope:SCOPE,status:'role_world_complete',path:WORLD});index.status='five_reference_worlds_materialized';index.fifth_reference_world={category:'sport',role_scope:SCOPE,status:'role_world_complete'};index.note='Role World-completion er strengere enn Career Gameplay Matrix-status. Ekspeditør, Renholder, By-rådgiver, Controller og Sport-utøver fullfører reference-bølgen og må hver beholde 14-dagers dekning, sosiale relasjoner, privat etterklang, forsinkede konsekvenser og reell materialiseringsprovenance.';writeJson('data/Civication/roleWorlds/index.json',index);
const policy=readJson('data/Civication/roleWorldPolicy.json');policy.fifth_reference_world={category:'sport',role_scope:SCOPE,status:'role_world_complete'};policy.reference_wave_complete=true;policy.next_reference_world=null;policy.later_reference_candidates=[];writeJson('data/Civication/roleWorldPolicy.json',policy);
const checklist=readJson('data/Civication/roleWorldAuthoringChecklist.json');if(!checklist.reference_worlds.includes(WORLD))checklist.reference_worlds.push(WORLD);checklist.reference_wave_complete=true;checklist.next_reference_world=null;writeJson('data/Civication/roleWorldAuthoringChecklist.json',checklist);
const careerPolicy=readJson('data/Civication/careerGameplayPolicy.json');if(!(careerPolicy.reference_roles||[]).some(r=>r.category==='sport'&&r.role_scope===SCOPE))careerPolicy.reference_roles.push({category:'sport',role_scope:SCOPE,why:'Profesjonell prestasjonshverdag med kropp, støtteapparat, kontraktsgrense, to praksisuker og Life Story.'});writeJson('data/Civication/careerGameplayPolicy.json',careerPolicy);

let std=readText('docs/CIVICATION_ROLE_WORLD_STANDARD.md');std=std.replace('De fire første reference Role Worlds er nå materialisert og permanent testet:','De fem reference Role Worlds i proof-bølgen er nå materialisert og permanent testet:').replace('naeringsliv/controller  → role_world_complete\n```','naeringsliv/controller  → role_world_complete\nsport/sport_utover       → role_world_complete\n```').replace(/Ekspeditør, Renholder, By-rådgiver og Controller[\s\S]*?Målet er å bevise standarden på tvers av servicearbeid, usynlig arbeid, forvaltning, tall\/kontroll og kropp\/prestasjon før bred masseproduksjon\./,'Ekspeditør, Renholder, By-rådgiver, Controller og Sport-utøver er strukturreferanser for metoden, ikke innholdsmaler. Sport-utøver beviser at standarden også fungerer i en kropp-/prestasjonshverdag der helse, lag, kontrakt, uttak, omdømme og privat identitet må holdes sammen uten å bli samme statusmål.\n\n**Reference wave complete.** Proof-bølgen dekker nå servicearbeid, usynlig arbeid, forvaltning, tall/kontroll og kropp/prestasjon. Neste bredere produksjonsrolle skal velges eksplisitt i en ny rollout-policy, ikke arves som en skjult `next_reference_world`.');writeText('docs/CIVICATION_ROLE_WORLD_STANDARD.md',std);
let guide=readText('docs/CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md');guide=guide.replace('De fire første reference worlds er materialisert:','De fem reference worlds i proof-bølgen er materialisert:').replace('naeringsliv/controller  → role_world_complete\n```','naeringsliv/controller  → role_world_complete\nsport/sport_utover       → role_world_complete\n```').replace(/De viser at samme produksjonsmetode[\s\S]*?sport\/sport_utover\n```/,'De viser at samme produksjonsmetode kan bære servicearbeid, usynlig fysisk arbeid, kommunal kunnskaps-/forvaltningsmakt, økonomisk tall-/kontrollarbeid og kropp-/prestasjonsarbeid uten å kopiere innhold, NPC-er eller konfliktakser.\n\n**Reference wave complete.** Videre breddeproduksjon skal velges eksplisitt gjennom rollout-prioritering; checklisten har derfor ingen implicit neste rolle.');writeText('docs/CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md',guide);

let contract=readText('tests/civication-role-world-contract.test.js');
contract=contract.replace("assert.ok(String(policy.next_reference_world.category || '').trim());\nassert.ok(String(policy.next_reference_world.role_scope || '').trim());\nassert.notEqual(policy.next_reference_world.role_scope, policy.third_reference_world.role_scope);","assert.deepEqual(policy.fifth_reference_world, index.fifth_reference_world);\nassert.equal(policy.fifth_reference_world.category, 'sport');\nassert.equal(policy.fifth_reference_world.role_scope, 'sport_utover');\nassert.equal(policy.fifth_reference_world.status, 'role_world_complete');\nassert.equal(policy.reference_wave_complete, true);\nassert.equal(policy.next_reference_world, null);");
contract=contract.replace("assert.ok(roleWorldDoc.includes(policy.next_reference_world.role_scope));","assert.match(roleWorldDoc, /Reference wave complete/i);").replace("assert.ok(authoringGuide.includes(policy.next_reference_world.role_scope));","assert.match(authoringGuide, /Reference wave complete/i);");
contract=contract.replace("assert.equal(completeWorlds.length, 4, 'The fourth Role World production wave must expose exactly four completed reference worlds');","assert.equal(completeWorlds.length, 5, 'The reference proof wave must expose exactly five completed reference worlds');");
if(!contract.includes('Sport-utøver must be the fifth completed Role World'))contract=contract.replace("assert.deepEqual(referenceIdentity(completeWorlds[3]), index.fourth_reference_world);","assert.deepEqual(referenceIdentity(completeWorlds[3]), index.fourth_reference_world);\nassert.deepEqual(referenceIdentity(completeWorlds[4]), {\n  category: 'sport',\n  role_scope: 'sport_utover',\n  status: 'role_world_complete'\n}, 'Sport-utøver must be the fifth completed Role World');\nassert.deepEqual(referenceIdentity(completeWorlds[4]), index.fifth_reference_world);");
writeText('tests/civication-role-world-contract.test.js',contract);

let endings=readText('tests/civication-lifestory-endings.test.js');if(!endings.includes('sport_utover:'))endings=endings.replace('  controller: { foerste: "sporbar_styring", siste: "hard_kontroll" },','  controller: { foerste: "sporbar_styring", siste: "hard_kontroll" },\n  sport_utover: { foerste: "baerekraftig_profesjonell", siste: "presset_for_langt" },');writeText('tests/civication-lifestory-endings.test.js',endings);

const sportTest=`#!/usr/bin/env node\nconst assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {execFileSync}=require('node:child_process');\nconst ROOT=path.resolve(__dirname,'..');const rel=p=>path.join(ROOT,p);const read=p=>JSON.parse(fs.readFileSync(rel(p),'utf8'));\nconst world=read('${WORLD}');const matrix=read('data/Civication/careerGameplayMatrix.json');const bank=read('data/Civication/roleWorldThemeBank.json');const registry=read('data/Civication/praksisfortellinger_registry.json');const plan=read('${PLAN}');const model=read('${MODEL}');\nassert.equal(world.schema,'civication_role_world_v1');assert.equal(world.category,'sport');assert.equal(world.role_scope,'sport_utover');assert.equal(world.status,'role_world_complete');assert.equal(world.season.coverage.length,56);assert.deepEqual(world.theme_ids,bank.reference_profiles['sport/sport_utover']);\nconst coverage=new Map(),summaries=new Set();for(const beat of world.season.coverage){const k=beat.day+'/'+beat.phase;assert.ok(!coverage.has(k));coverage.set(k,beat);assert.ok(beat.summary.length>=70,k+' summary too thin');assert.ok(!summaries.has(beat.summary));summaries.add(beat.summary);}for(let d=1;d<=14;d++)for(const p of ['morning','lunch','afternoon','evening'])assert.ok(coverage.has(d+'/'+p));\nconst fields=new Set(['id','mail_id','scene_id','scenario_id','story_id','thread_id','event_id','key']);function ids(v,out=new Set()){if(Array.isArray(v)){for(const x of v)ids(x,out);return out;}if(!v||typeof v!=='object')return out;for(const [k,x] of Object.entries(v)){if(fields.has(k)&&(typeof x==='string'||typeof x==='number'))out.add(String(x));ids(x,out);}return out;}const cache=new Map(),uses=new Map();function verify(r){const i=r.indexOf('#');assert.ok(i>0);const f=r.slice(0,i),id=r.slice(i+1);assert.ok(fs.existsSync(rel(f)),f);let set=cache.get(f);if(!set){set=ids(read(f));cache.set(f,set);}assert.ok(set.has(id),'missing '+id+' in '+f);uses.set(r,(uses.get(r)||0)+1);}for(const b of world.season.coverage)b.materialization_refs.forEach(verify);for(const a of world.private_aftermath)a.materialization_refs.forEach(verify);assert.ok(uses.size>=50,'broad provenance required');\nassert.ok(world.recurring_people_archetypes.length>=8);for(const id of ['trener_maja','fysio_elias','lagkontakt_samir','lagkamerat_nora','sportslig_leder','kontraktansvarlig','venn','familie'])assert.ok(world.recurring_people_archetypes.some(n=>n.id===id));for(const t of world.primary_threads){assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10);const days=new Set(t.beat_refs.map(r=>Number(r.split('/')[0])));assert.ok(days.size>=3,t.id);for(const r of t.beat_refs)assert.ok(coverage.has(r));}\nconst order=new Map([['morning',0],['lunch',1],['afternoon',2],['evening',3]]);const n=r=>{const[d,p]=r.split('/');return Number(d)*10+order.get(p)};assert.ok(world.delayed_consequences.length>=6);for(const c of world.delayed_consequences)assert.ok(n(c.return_ref)>n(c.setup_ref));assert.equal(world.materialization.no_new_runtime,true);\nassert.equal(model.role_scope,'sport_utover');assert.equal(model.role_id,'sport_profesjonell_utover');assert.ok(model.related_people.length>=8);assert.ok(model.related_places.length>=6);\nconst resolver=require('../js/Civication/systems/civicationCareerRoleResolver.js');assert.equal(resolver.resolveCareerRoleScope({career_id:'sport',title:'Profesjonell utøver'}),'sport_utover');assert.equal(resolver.resolveCareerRoleScope({career_id:'sport',role_id:'sport_profesjonell_utover'}),'sport_utover');\nconst role=registry.roles.find(r=>r.role_id==='sport_utover'&&r.domain==='sport');assert.ok(role);assert.deepEqual(role.packages.map(p=>p.week),[1,2]);assert.deepEqual(role.packages.map(p=>[p.step_start,p.step_end]),[[9,18],[19,28]]);assert.equal(plan.sequence.length,32);const originalFamilies=['trening_rytme_og_disiplin','kropp_belastning_og_skade','lagmiljo_rolle_og_normer','konkurranse_press_og_resultat'];for(let i=0;i<8;i++)assert.ok(plan.sequence[i].allowed_families.some(f=>originalFamilies.includes(f)),'original sport step '+(i+1));for(const pkg of role.packages){const steps=plan.sequence.slice(pkg.step_start-1,pkg.step_end);assert.equal(steps.length,10);steps.forEach((s,i)=>{assert.equal(s.type,i%2===0?'job':'people');assert.deepEqual(s.fallback_types,[]);});}\nfor(const [type,pathName] of [['people','${PEOPLE}'],['conflict','${CONFLICT}'],['story','${STORY}'],['event','${EVENT}'],['knowledge','${KNOWLEDGE}']]){const cat=read(pathName);assert.equal(cat.mail_type,type);assert.ok(cat.families.flatMap(f=>f.mails||[]).length>0,type);}\nconst manifest=read('data/Civication/lifestory/manifest.json');assert.equal(manifest.roles.sport_utover.role_scope,'sport_utover');const life=require('../js/Civication/lifestory/lifestoryContent.js');life.buildContent({role:read(manifest.roles.sport_utover.role),phaseDefinitions:read('data/Civication/lifestory/shared/phaseDefinitions.json'),roleThreads:read(manifest.roles.sport_utover.threads),roleScenes:read(manifest.roles.sport_utover.scenes),lifeThreads:read('data/Civication/lifestory/life/threads.json'),lifeScenes:read('data/Civication/lifestory/life/scenes.json')});\nexecFileSync(process.execPath,['tests/civication-sport-life-career-split.test.js'],{cwd:ROOT,stdio:'pipe'});execFileSync(process.execPath,['tests/civication-praksisfortellinger-registry-audit.test.js'],{cwd:ROOT,stdio:'pipe'});execFileSync(process.execPath,['tests/civication-lifestory-endings.test.js'],{cwd:ROOT,stdio:'pipe'});execFileSync(process.execPath,['scripts/audit-civication-career-gameplay.mjs','--check'],{cwd:ROOT,stdio:'pipe'});\nconst career=matrix.worlds.find(w=>w.key==='sport/sport_utover');assert.ok(career);assert.equal(career.status,'reference_complete');assert.equal(career.audit.complete_components.length,15);assert.deepEqual(career.audit.missing_components,[]);assert.equal(career.audit.life_story_complete,true);assert.deepEqual(career.audit.practice_weeks,['1','2']);console.log('civication-sport-utover-role-world.test.js: PASS');\n`;
writeText(SPORT_TEST,sportTest);

run(['scripts/build-civication-scene-registry.mjs','--write']);
run(['scripts/audit-civication-career-gameplay.mjs','--write']);
run(['tests/civication-sport-utover-role-world.test.js']);
run(['tests/civication-role-world-contract.test.js']);
run(['tests/civication-praksisfortellinger-cross-role.test.js']);
run(['scripts/build-civication-scene-registry.mjs','--check']);
run(['scripts/audit-civication-career-gameplay.mjs','--check']);
const matrix=readJson('data/Civication/careerGameplayMatrix.json');const career=matrix.worlds.find(w=>w.key==='sport/sport_utover');if(!career||career.status!=='reference_complete'||career.audit.complete_components.length!==15||career.audit.missing_components.length||!career.audit.life_story_complete)throw new Error('Sport-utøver failed final reference_complete gate');
console.log('Sport-utøver Role World materialization: PASS');
