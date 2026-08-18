#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const write = (rel, value) => { fs.mkdirSync(path.dirname(abs(rel)), { recursive: true }); fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`); };
const writeText = (rel, value) => { fs.mkdirSync(path.dirname(abs(rel)), { recursive: true }); fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`); };
const run = (args) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });

const CATEGORY = 'religion';
const SCOPE = 'religion_forskning';
const ROLE_ID = 'religion_forskning';
const MODEL = 'data/Civication/roleModels/religion/religion_forskning.json';
const GRAMMAR = 'data/Civication/workGrammars/religion/religion_forskning.json';
const PLAN = 'data/Civication/mailPlans/religion/religion_forskning_plan.json';
const TEST = 'tests/civication-religion-forskning-playability.test.js';

const model = read(MODEL);
model.related_people = [
  { id: 'mina_prosjektleder', name: 'Mina', role: 'Prosjektleder', function: 'Holder problemstilling, leveranse og metodekrav sammen uten å eie forskerens konklusjon.' },
  { id: 'oskar_forskningsetikk', name: 'Oskar', role: 'Forskningsetisk kontakt', function: 'Vurderer samtykke, konfidensialitet og identifiseringsrisiko når datagrunnlaget involverer mennesker.' },
  { id: 'lea_arkivar', name: 'Lea', role: 'Arkivar', function: 'Gjør proveniens, bevaringslogikk og arkivets blindsoner synlige før fravær blir tolket som historisk fravær.' },
  { id: 'sara_metodekollega', name: 'Sara', role: 'Metodekollega', function: 'Motleser operasjonalisering, alternative forklaringer og påstandsrekkevidde før analysen låses.' }
];
model.related_places = [
  { id: 'religionsforskningskontoret', reason: 'Arbeidsflate for problemstilling, kodebok, analyse, skriving og prosjektbeslutninger.' },
  { id: 'religionsfeltet_lite_miljo', reason: 'Feltarbeidsflate der samtykke, relasjon og indirekte identifisering må vurderes konkret.' },
  { id: 'religionshistorisk_arkiv', reason: 'Kildeflate der proveniens, arkivstillhet og negativ evidens må behandles metodisk.' },
  { id: 'religion_metodeverksted', reason: 'Kollegial arbeidsflate for motlesning, metodekritikk og alternative forklaringer.' }
];
model.required_knowledge.concepts = [
  'operasjonalisering og påstandsrekkevidde',
  'proveniens og arkivstillhet',
  'samtykke, konfidensialitet og indirekte identifisering',
  'posisjonalitet og alternative forklaringer'
];
write(MODEL, model);

const grammar = read(GRAMMAR);
grammar.mail_generation_contract = {
  required_mail_types: ['job', 'people', 'conflict', 'event', 'followup', 'knowledge', 'consequence'],
  required_axes: ['choice_axis', 'consequence_axis', 'narrative_arc']
};
write(GRAMMAR, grammar);

const plan = {
  schema: 'civication_mail_plan_v1',
  id: 'religion_forskning_pilot_v1',
  category: CATEGORY,
  role_scope: SCOPE,
  role_id: ROLE_ID,
  title: 'Religion – forskning',
  description: 'Kunnskapsarbeidspilot: én forskningsdag fra avgrenset spørsmål via metode- og etikkmotstand til dokumentert oppfølging og forsinket faglig konsekvens.',
  arc: {
    from: 'Forsker som har en plausibel hypotese og tidspress, men ennå ikke har gjort alle premissene etterprøvbare.',
    to: 'Forsker som kan levere framdrift uten å gjøre data, informanter eller arkivstillhet sikrere enn metoden tillater.',
    core_questions: [
      'Hva kan datagrunnlaget faktisk bære av påstander?',
      'Når er metodisk tvil et hinder, og når er den selve kvalitetsarbeidet?',
      'Hvordan repareres en tidlig forenkling når konsekvensen viser seg senere?'
    ]
  },
  outcome_rules: {
    fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 },
    promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0, allow_warning: false },
    stagnated: { autonomy_delta: -6, stability: 'STAGNATED', add_branch_flags: ['career_stagnated', 'religion_forskning_method_stalled'] }
  },
  sequence: [
    { step: 1, type: 'job', phase: 'intro', step_goal: 'Avgrens forskningsspørsmålet før prosjektets første analyse låses.', allowed_families: ['religion_forskning_problemstilling'], fallback_types: [] },
    { step: 2, type: 'people', phase: 'early', step_goal: 'Bruk kollegial motlesning til å teste en forklaring du selv liker.', allowed_families: ['religion_forskning_metodekollega'], fallback_types: [] },
    { step: 3, type: 'conflict', phase: 'mid', step_goal: 'Beskytt deltaker og påstandsrekkevidde når formidling skaper press.', allowed_families: ['religion_forskning_etisk_press'], fallback_types: [] },
    { step: 4, type: 'event', phase: 'mid', step_goal: 'Håndter et nytt kildefunn uten å omskrive hele konklusjonen på impuls.', allowed_families: ['religion_forskning_kildehendelse'], fallback_types: [] }
  ]
};
write(PLAN, plan);

function choice(id, label, reply, effect, tags, feedback, stats) {
  return { id, label, reply, effect, tags, feedback, effects: { stats } };
}
function mail(type, family, id, from, peopleRef, placeId, subject, summary, situation, taskDomain, competency, pressure, choiceAxis, consequenceAxis, narrativeArc, choices, phase = 'workday', priority = 115) {
  return { id, mail_type: type, mail_family: family, role_scope: SCOPE, phase, priority, from, people_ref: peopleRef, place_id: placeId, subject, summary, situation, task_domain: taskDomain, competency, pressure, choice_axis: choiceAxis, consequence_axis: consequenceAxis, narrative_arc: narrativeArc, choices };
}
function catalog(type, family, purpose, focus, mails) {
  return { schema: 'civication_mail_family_catalog_v1', version: 1, category: CATEGORY, role_scope: SCOPE, mail_type: type, families: [{ id: family, purpose, learning_focus: focus, mails }] };
}

const jobFamily = 'religion_forskning_problemstilling';
write('data/Civication/mailFamilies/religion/job/religion_forskning_job.json', catalog('job', jobFamily,
  'Gjøre forskningsspørsmål og hypotese til en avgrenset arbeidsoppgave før data tolkes.', ['problemstilling', 'avgrensning', 'sporbarhet'], [
    mail('job', jobFamily, 'religion_forskning_job_problemstilling', 'Mina, prosjektleder', 'mina_prosjektleder', 'religionsforskningskontoret',
      'Hypotesen passer allerede for godt',
      'De første notatene støtter prosjektets forventning, men spørsmålet er formulert så bredt at nesten alle funn kan telles som støtte.',
      ['Mina ber om et første analyseutkast før lunsj.', 'Du ser at hypotesen blander identitet, praksis og institusjon i samme påstand.', 'Du må levere framdrift uten å gjøre et uklart spørsmål til et sikkert funn.'],
      'problemstilling_og_avgrensning', 'analytisk_presisjon', 'frist_vs_testbarhet', 'avgrense_hypotese_vs_telle_alt_som_stotte', 'etterprovbar_analyse_vs_bekreftelsesbias', 'hypotese_som_ma_kunne_feile', [
        choice('A', 'Skriv om spørsmålet slik at hypotesen faktisk kan motbevises', 'Jeg avgrenser påstanden og skriver ned hvilken observasjon som ville tale imot den.', 1, ['method', 'traceability'], 'Du mister litt tempo og får et spørsmål som kan testes i stedet for bekreftes automatisk.', { quality: 2, trust: 1, risk: -2, energy: -1 }),
        choice('B', 'Lever den brede hypotesen og la nyansene komme i diskusjonsdelen', 'Jeg beholder spørsmålet som det er og bruker de første funnene som støtte.', -1, ['confirmation_bias', 'tempo'], 'Framdriften ser god ut, men analysen får ingen tydelig grense for hva som ville motsagt den.', { status: 1, quality: -2, risk: 3, trust: -1 }),
        choice('C', 'Be Mina godkjenne én smal delpåstand som kan testes først', 'Jeg foreslår en mindre delanalyse med eksplisitt datagrunnlag før vi generaliserer.', 0, ['scope', 'coordination'], 'Du beholder leveransen og gjør usikkerheten synlig for prosjektlederen.', { quality: 1, trust: 1, energy: -1 })
      ], 'intro', 130)
  ]));

const peopleFamily = 'religion_forskning_metodekollega';
write('data/Civication/mailFamilies/religion/people/religion_forskning_people.json', catalog('people', peopleFamily,
  'Bruke kolleger som metodisk motstand, ikke bare som bekreftelse.', ['motlesning', 'alternative forklaringer', 'samarbeid'], [
    mail('people', peopleFamily, 'religion_forskning_people_motlesning', 'Sara, metodekollega', 'sara_metodekollega', 'religion_metodeverksted',
      'Sara finner en alternativ forklaring du ikke har kodet',
      'Sara peker på at mønsteret du kaller religiøs praksis også kan følge alder, organisasjonstype eller intervjusituasjon.',
      ['Hun ber ikke om at hypotesen forkastes.', 'Hun ber deg vise hvilke data som skiller forklaringene.', 'Fristen gjør det fristende å omtale innvendingen som en senere begrensning.'],
      'metodekritikk', 'refleksivitet', 'egen_forklaring_vs_rival', 'teste_rival_vs_parkere_innvending', 'robusthet_vs_selvbekreftelse', 'kollegial_motstand', [
        choice('A', 'Legg Saras rivalforklaring inn i analysen og test hva dataene faktisk skiller', 'Jeg gjør rivalforklaringen eksplisitt og undersøker hvilke observasjoner som skiller den fra min.', 1, ['method', 'rival'], 'Analysen blir mer krevende og mer robust fordi den må overleve et reelt alternativ.', { quality: 2, trust: 2, risk: -2, energy: -1 }),
        choice('B', 'Noter innvendingen som begrensning uten å endre analysen', 'Jeg nevner alternativet i sluttteksten, men lar hovedanalysen stå.', -1, ['shortcut', 'bias'], 'Du har teknisk sett nevnt usikkerheten uten å la den få påvirke konklusjonen.', { status: 1, quality: -2, trust: -1, risk: 2 }),
        choice('C', 'Be Sara velge ett avgjørende kontrollspørsmål dere kan teste i dag', 'Vi velger én konkret rivaltest som er mulig innen dagens tidsramme.', 0, ['help', 'scope'], 'Du bruker kollegial kritikk aktivt uten å late som hele analysen kan gjøres på nytt på én dag.', { quality: 1, trust: 1, energy: -1 })
      ], 'early', 122)
  ]));

const conflictFamily = 'religion_forskning_etisk_press';
write('data/Civication/mailFamilies/religion/conflict/religion_forskning_conflict.json', catalog('conflict', conflictFamily,
  'Gjøre forskningsetikk til en konkret konflikt mellom forklaringskraft, formidling og deltakerbeskyttelse.', ['samtykke', 'representasjon', 'identifiseringsrisiko'], [
    mail('conflict', conflictFamily, 'religion_forskning_conflict_formidling', 'Oskar, forskningsetisk kontakt', 'oskar_forskningsetikk', 'religionsfeltet_lite_miljo',
      'Formidleren vil beholde detaljene som gjør sitatet gjenkjennelig',
      'En ekstern formidler mener analysen mister kraft dersom rolle, sted og hendelse tones ned, selv om kombinasjonen kan peke ut deltakeren.',
      ['Navnet er fjernet, men miljøet er lite.', 'Deltakeren samtykket til intervju, ikke til denne eksponeringsgraden.', 'Du må velge mellom en sterkere historie og en mer forsvarlig evidensbruk.'],
      'forskningsetikk_og_formidling', 'forskningsetikk', 'forklaringskraft_vs_beskyttelse', 'minimere_identifisering_vs_beholde_dramatisk_detalj', 'tillit_vs_eksponering', 'sitatets_etiske_grense', [
        choice('A', 'Fjern de identifiserende detaljene og avgrens hva sitatet kan representere', 'Jeg beholder evidensen, men reduserer konteksten og skriver eksplisitt at dette er én situert erfaring.', 1, ['ethics', 'privacy'], 'Du gir avkall på dramatisk detalj og beskytter både deltakeren og påstandsrekkevidden.', { quality: 2, trust: 2, risk: -3, energy: -1 }),
        choice('B', 'Behold detaljene fordi navnet ikke står i teksten', 'Jeg lar sitatet stå; formelt er det anonymisert.', -1, ['privacy_risk', 'status'], 'Formell navnefjerning skjuler ikke indirekte identifisering i et lite miljø.', { status: 1, quality: -2, trust: -3, risk: 4 }),
        choice('C', 'Pause sitatet og be om ny samtykkeavklaring før publisering', 'Jeg stopper denne delen til vi vet om deltakeren kan og vil godkjenne den konkrete bruken.', 0, ['help', 'consent'], 'Du aksepterer forsinkelse for å få en faktisk etisk avklaring.', { trust: 2, risk: -2, status: -1, energy: -1 })
      ], 'mid', 120)
  ]));

const eventFamily = 'religion_forskning_kildehendelse';
write('data/Civication/mailFamilies/religion/event/religion_forskning_event.json', catalog('event', eventFamily,
  'La nye kilder endre graden av sikkerhet uten at én oppdagelse får overskrive hele analysen.', ['arkiv', 'negativ evidens', 'revisjon'], [
    mail('event', eventFamily, 'religion_forskning_event_motkilde', 'Lea, arkivar', 'lea_arkivar', 'religionshistorisk_arkiv',
      'Lea finner en mappe som motsier arkivstillheten',
      'En ny katalogisert mappe inneholder spor etter praksisen prosjektet nettopp vurderte som fraværende.',
      ['Funnet er lite, men direkte relevant.', 'Det beviser ikke hvor utbredt praksisen var.', 'Du må korrigere en for sterk konklusjon uten å gjøre ett nytt dokument til hele historien.'],
      'historisk_kildekritikk', 'kildekritikk', 'ny_kilde_vs_tidlig_konklusjon', 'revidere_rekkevidde_vs_forsvare_tidlig_tekst', 'sporbar_korrigering_vs_falsk_konsistens', 'arkivstillhet_brytes', [
        choice('A', 'Revider konklusjonen fra fravær til dokumentert usikkerhet og legg mappen inn som motkilde', 'Jeg korrigerer teksten og viser både det gamle kildefraværet og det nye sporet.', 1, ['source_criticism', 'repair'], 'Du gjør endringen sporbar uten å overdrive hva den nye kilden alene beviser.', { quality: 2, trust: 2, risk: -2, status: -1 }),
        choice('B', 'Behold hovedkonklusjonen og omtale mappen som et enkelt avvik', 'Jeg lar den opprinnelige konklusjonen stå og nevner funnet i en fotnote.', -1, ['defensiveness', 'bias'], 'Konsistensen i teksten bevares ved å gjøre motkilden mindre enn den er.', { status: 1, quality: -2, trust: -2, risk: 3 }),
        choice('C', 'Stans konklusjonen og be Lea kartlegge om mappen inngår i en større, oversett samling', 'Jeg utsetter rekkevidden av konklusjonen til vi vet om dette er ett spor eller en systematisk blindsone.', 0, ['archive', 'help'], 'Du kjøper mer sikkerhet med tid og gjør arkivets struktur til en del av spørsmålet.', { quality: 1, trust: 1, energy: -2, risk: -1 })
      ], 'mid', 118)
  ]));

const followupFamily = 'religion_forskning_metodeoppfolging';
write('data/Civication/mailFamilies/religion/followup/religion_forskning_followup.json', catalog('followup', followupFamily,
  'Følge opp tidligere metodevalg før arbeidsdagen avsluttes.', ['oppfolging', 'kodebok', 'sporbarhet'], [
    mail('followup', followupFamily, 'religion_forskning_followup_kodebok', 'Mina, prosjektleder', 'mina_prosjektleder', 'religionsforskningskontoret',
      'Kodeboken er revidert — én variabel er fortsatt for bred',
      'Etter morgenens avgrensning er kodeboken bedre, men feltet for religiøs deltakelse blander egenrapportert praksis med organisasjonsmedlemskap.',
      ['Teamet kan rette feltet nå uten å kode alt på nytt.', 'Lar dere det stå, følger tvetydigheten inn i analysen.', 'Oppfølgingen tester om den tidlige metodekritikken faktisk endret arbeidsmåten.'],
      'begrepsoperasjonalisering', 'analytisk_presisjon', 'liten_reparasjon_vs_ny_tvetydighet', 'rette_felt_na_vs_skyve_feilen_videre', 'sporbarhet_vs_omarbeiding', 'kodebok_repareres', [
        choice('A', 'Splitt feltet nå og dokumenter migreringen i kodeboken', 'Jeg skiller praksis fra medlemskap og noterer hvordan de eksisterende radene håndteres.', 1, ['followup', 'traceability'], 'Den lille reparasjonen hindrer at samme kategorifeil blir dyrere senere.', { quality: 2, trust: 1, risk: -2, energy: -1 }),
        choice('B', 'La feltet stå fordi forskjellen kan forklares i rapporten', 'Jeg beholder variabelen og skriver en forklarende note til senere.', -1, ['delay', 'category_risk'], 'Rapporten får arve en tvetydighet som datamodellen fortsatt ikke kan skille.', { status: 1, quality: -2, risk: 2 }),
        choice('C', 'Frys nye registreringer og la Sara motlese feltdefinisjonen før dere endrer eksisterende data', 'Jeg stopper ny koding kort og får definisjonen kvalitetssikret før migreringen.', 0, ['help', 'method'], 'Du reduserer risikoen for en ny feil, men betaler med litt framdrift.', { quality: 1, trust: 1, status: -1, energy: -1 })
      ], 'workday', 112)
  ]));

const consequenceFamily = 'religion_forskning_forsinket_konsekvens';
write('data/Civication/mailFamilies/religion/consequence/religion_forskning_consequence.json', catalog('consequence', consequenceFamily,
  'Vise at tidlige metodevalg får en senere kostnad i fagfellevurdering, tillit og omarbeiding.', ['sen_konsekvens', 'fagfellevurdering', 'reparasjon'], [
    mail('consequence', consequenceFamily, 'religion_forskning_consequence_fagfelle', 'Sara, metodekollega', 'sara_metodekollega', 'religion_metodeverksted',
      'Fagfellen spør hvor den alternative forklaringen ble testet',
      'Et utkast kommer tilbake med ett presist spørsmål: analysen nevner rivalforklaringen, men viser ikke hva som faktisk skiller den fra hovedforklaringen.',
      ['Konsekvensen kommer etter at den første leveransen føltes ferdig.', 'Du kan reparere analysen åpent eller forsøke å skrive deg rundt hullet.', 'Valget påvirker både tidsbruk og hvordan kolleger vurderer forskningsarbeidets sporbarhet.'],
      'fagfellevurdering_og_reparasjon', 'refleksivitet', 'kritikk_er_synlig', 'apen_metodereparasjon_vs_retori_sk_skjuling', 'langsiktig_tillit_vs_kortsiktig_fasade', 'rivalforklaring_returnerer', [
        choice('A', 'Legg inn den manglende rivaltesten og skriv eksplisitt hva resultatet endrer', 'Jeg reparerer analysen med den testen vi burde ha dokumentert tidligere.', 1, ['repair', 'peer_review'], 'Omarbeidingen koster tid og gjør argumentet sterkere fordi leseren kan se hvor det kunne ha feilet.', { quality: 2, trust: 2, status: -1, risk: -2, energy: -2 }),
        choice('B', 'Omskriv diskusjonen slik at rivalforklaringen framstår mindre relevant uten ny test', 'Jeg strammer argumentasjonen i teksten i stedet for å åpne analysen igjen.', -1, ['deflection', 'risk'], 'Du beskytter tempoet og gjør sporbarheten svakere akkurat der fagfellen ba om bevis.', { status: 1, quality: -2, trust: -2, risk: 3 }),
        choice('C', 'Svar fagfellen at testen mangler og avgrens konklusjonen til det dataene faktisk bærer', 'Jeg gjør mangelen eksplisitt og reduserer påstandsrekkevidden dersom testen ikke kan gjennomføres nå.', 0, ['transparency', 'scope'], 'Du reduserer ambisjonen i teksten uten å late som evidensen er sterkere enn den er.', { quality: 1, trust: 2, status: -1, risk: -1 })
      ], 'workday', 106)
  ]));

const test = `#!/usr/bin/env node\nconst assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');\nconst ROOT=path.resolve(__dirname,'..');const read=(r)=>JSON.parse(fs.readFileSync(path.join(ROOT,r),'utf8'));\nfunction storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()};}\nfunction makeFetch(root){return async(url)=>{const clean=String(url||'').split('?')[0].replace(/^\\/+/, '');const full=path.resolve(root,clean);if(!full.startsWith(root))return{ok:false,status:400,async json(){return null}};try{const body=await fs.promises.readFile(full,'utf8');return{ok:true,status:200,async json(){return JSON.parse(body)}}}catch{return{ok:false,status:404,async json(){return null}}}};}\nfunction load(rel){vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),{filename:rel});}\n(async()=>{const category='religion',scope='religion_forskning',roleId='religion_forskning';const model=read('${MODEL}'),grammar=read('${GRAMMAR}'),plan=read('${PLAN}'),matrix=read('data/Civication/careerGameplayMatrix.json');const required=grammar.mail_generation_contract.required_mail_types;\nassert.deepEqual(required,['job','people','conflict','event','followup','knowledge','consequence']);assert.deepEqual(plan.sequence.map(s=>s.type),['job','people','conflict','event']);assert.equal(model.related_people.length,4);assert.equal(model.related_places.length,4);assert.ok(model.required_knowledge.concepts.length>=4);\nconst ids=new Set();for(const type of required){const cat=read('data/Civication/mailFamilies/'+category+'/'+type+'/'+scope+'_'+type+'.json');assert.equal(cat.mail_type,type);const mails=cat.families.flatMap(f=>f.mails||[]);assert.ok(mails.length>=1,type);for(const mail of mails){assert.ok(!ids.has(mail.id),mail.id);ids.add(mail.id);assert.ok(mail.place_id,mail.id);assert.ok(mail.choice_axis&&mail.consequence_axis&&mail.narrative_arc,mail.id);assert.ok(Array.isArray(mail.situation)&&mail.situation.length>=3,mail.id);assert.ok(Array.isArray(mail.choices)&&mail.choices.length>=2,mail.id);for(const c of mail.choices){assert.ok(c.feedback,mail.id+'/'+c.id);assert.ok(c.effects?.stats,mail.id+'/'+c.id);}}}\nglobal.window=global;global.localStorage=storage();global.location={href:'http://localhost/Civication.html'};global.Event=class Event{constructor(type){this.type=type}};global.document={readyState:'complete',addEventListener(){}};global.addEventListener=()=>{};global.dispatchEvent=()=>{};global.fetch=makeFetch(ROOT);global.CivicationCalendar={getPhase:()=> 'morning',setPhase(){},advanceByMinutes(){}};global.HG_CapitalMaintenance={maintain:()=>null};global.HG_Lifestyle={addTags:()=>null};global.CivicationPsyche={getAutonomy:()=>50,updateIntegrity(){},updateVisibility(){},updateEconomicRoom(){},updateTrust(){},checkBurnout(){},processCollapse(){}};\nfor(const s of ['js/Civication/core/civicationState.js','js/Civication/core/civicationEventEngine.js','js/Civication/systems/civicationEventChannels.js','js/Civication/systems/civicationCareerRoleResolver.js','js/Civication/systems/day/dayChoiceDirector.js','js/Civication/systems/day/dayConsequences.js','js/Civication/systems/civicationMailRuntime.js','js/Civication/systems/civicationWorkdayMailBuilder.js','js/Civication/systems/civicationDailyMailBuilder.js','js/Civication/systems/civicationCareerOutcomeRuntime.js'])load(s);\nconst active={career_id:category,role_id:roleId,title:'Forsker'};assert.equal(global.CivicationCareerRoleResolver.resolveCareerRoleScope(active),scope);assert.equal(global.CivicationCareerRoleResolver.resolveCareerRoleId(active),roleId);assert.equal(global.CivicationMailRuntime.getPlanPath(active),'data/Civication/mailPlans/religion/religion_forskning_plan.json');const candidates=await global.CivicationMailRuntime.makeCandidateMailsForActiveRole(active,{});assert.equal(candidates[0]?.id,'religion_forskning_job_problemstilling');\nconst daily=await global.CivicationDailyMailBuilder.buildQueue(active,{date:'2026-08-18'});const roleItems=daily.items.filter(r=>['forenoon','workday'].includes(r.phase)&&r.event?.role_scope===scope&&r.event?.source_type!=='daily_generated');const types=roleItems.map(r=>r.event.mail_type);assert.deepEqual(types.slice(0,3),['job','knowledge','people']);assert.ok(['conflict','event'].includes(types[3]));assert.deepEqual(types.slice(-2),['followup','consequence']);assert.equal(roleItems.filter(r=>r.event.source_type==='planned').length,1);\nconst finished={role_plan_id:plan.id,step_index:plan.sequence.length,history:plan.sequence.map(s=>({id:'step_'+s.step,source_type:'planned',choice_id:'A'}))};const decide=p=>global.CivicationCareerOutcomeRuntime.decideOutcome(active,plan,finished,p).status;assert.equal(decide({score:3,strikes:0,warning_used:false,stability:'STABLE'}),'PROMOTED');assert.equal(decide({score:1,strikes:0,warning_used:false,stability:'STABLE'}),'STAGNATED');assert.equal(decide({score:-3,strikes:3,warning_used:false,stability:'STABLE'}),'FIRED');\nconst world=matrix.worlds.find(w=>w.key==='religion/religion_forskning');assert.ok(world);assert.equal(world.status,'playable');assert.equal(world.audit.runtime_gate,true);assert.deepEqual(world.audit.missing_components,[]);for(const c of ['day_one','workday_loop','people','places','mail','knowledge','consequences','performance','progression','exit'])assert.equal(world.audit.components[c].level,'complete',c);assert.equal(world.audit.components.practice_stories.level,'partial');assert.equal(world.audit.life_story_complete,false);console.log('civication-religion-forskning-playability.test.js: PASS');\n})().catch(e=>{console.error(e);process.exit(1)});\n`;
writeText(TEST, test);

run(['scripts/build-civication-scene-registry.mjs', '--write']);
run(['scripts/audit-civication-career-gameplay.mjs', '--write']);
run([TEST]);
run(['tests/civication-mail-choice-uniqueness.test.js']);
run(['scripts/build-civication-scene-registry.mjs', '--check']);
run(['scripts/audit-civication-career-gameplay.mjs', '--check']);
const matrix = read('data/Civication/careerGameplayMatrix.json');
const world = matrix.worlds.find((row) => row.key === 'religion/religion_forskning');
if (!world || world.status !== 'playable' || !world.audit.runtime_gate || world.audit.missing_components.length) throw new Error('Religion forskning pilot did not reach playable');
console.log('Religion forskning pilot materialization: PASS');
