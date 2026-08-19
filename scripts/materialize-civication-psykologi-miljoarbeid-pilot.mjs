#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeJson = (rel, value) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2) + '\n');
};
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const category = 'psykologi';
const scope = 'psykologi_miljoarbeid';
const roleId = 'psykologi_miljoarbeider';
const requiredTypes = ['job','people','conflict','event','followup','knowledge','consequence'];

const grammarPath = 'data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json';
const grammar = readJson(grammarPath);
grammar.version = Math.max(Number(grammar.version || 1), 2);
grammar.task_families = [
  'vaktstart_og_observasjon',
  'autonomi_og_hverdagsstotte',
  'relasjon_og_grensesetting',
  'deeskalering_og_sikker_eskalering',
  'dokumentasjon_og_overlevering'
];
grammar.work_loops = [
  {
    id: 'miljoarbeidsvakt',
    steps: [
      'les_overlevering_uten_diagnoseantakelser',
      'avklar_personens_egne_mal_og_dagens_rammer',
      'stott_aktivitet_uten_a_ta_over',
      'observer_og_deeskaler_konkret',
      'dokumenter_og_eskaler_til_riktig_fagperson'
    ]
  },
  {
    id: 'presisjon_og_grense',
    steps: [
      'skill_observasjon_fra_tolkning',
      'sjekk_autonomi_og_samtykke',
      'hold_profesjonell_grense',
      'vurder_sikkerhetsbehov',
      'overlever_sporbart'
    ]
  }
];
grammar.place_grammar = [
  { id: 'bofellesskap_fellesrom', label: 'Fellesrom i bofellesskap', function: 'hverdagsstotte_og_gruppeobservasjon' },
  { id: 'bofellesskap_vaktrom', label: 'Vaktrom og dokumentasjonsflate', function: 'overlevering_og_noktern_dokumentasjon' },
  { id: 'aktivitetstilbud_verksted', label: 'Kommunalt aktivitetstilbud', function: 'motivasjon_og_autonomi_i_praksis' },
  { id: 'oppfolging_samtalerom', label: 'Skjermet samtalerom', function: 'fortrolighet_grense_og_eskalering' }
];
grammar.mail_generation_contract = {
  required_mail_types: requiredTypes,
  required_axes: ['choice_axis','consequence_axis','narrative_arc']
};
writeJson(grammarPath, grammar);

const plan = {
  schema: 'civication_mail_plan_v1',
  id: 'psykologi_miljoarbeid_pilot_v1',
  category,
  role_scope: scope,
  role_id: roleId,
  title: 'Miljøarbeid – menneskearbeid',
  description: 'Menneskearbeidspilot: én vakt fra presis overlevering og autonomistøtte via grense- og sikkerhetspress til faglig eskalering og forsinket dokumentasjonskonsekvens.',
  arc: {
    from: 'Miljøarbeider som vil hjelpe raskt og være nær, men må lære at god støtte krever presis observasjon, autonomi og tydelige profesjonelle grenser.',
    to: 'Miljøarbeider som kan være varm og handlekraftig uten å diagnostisere, overta personens valg eller bære klinisk og sikkerhetsmessig ansvar alene.',
    core_questions: [
      'Hva observerte du faktisk, og hva er bare en mulig tolkning?',
      'Når blir hjelp til overtakelse av en annens autonomi?',
      'Når må tillit beskyttes ved å dele ansvar med riktig fagperson?'
    ]
  },
  outcome_rules: {
    fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 },
    promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0, allow_warning: false },
    stagnated: { autonomy_delta: -6, stability: 'STAGNATED', add_branch_flags: ['career_stagnated','psykologi_miljoarbeid_trust_stalled'] }
  },
  sequence: [
    { step: 1, type: 'job', phase: 'intro', step_goal: 'Start vakten med observerbare fakta og avklar dagens støttebehov uten diagnoseantakelser.', allowed_families: ['psykologi_miljoarbeid_vaktstart'], fallback_types: [] },
    { step: 2, type: 'people', phase: 'early', step_goal: 'Støtt et menneskes eget valg når effektivitet og autonomi peker i ulike retninger.', allowed_families: ['psykologi_miljoarbeid_autonomi'], fallback_types: [] },
    { step: 3, type: 'conflict', phase: 'mid', step_goal: 'Hold en profesjonell grense når fortrolighet glir over i ansvar du ikke kan bære alene.', allowed_families: ['psykologi_miljoarbeid_fortrolighet'], fallback_types: [] },
    { step: 4, type: 'event', phase: 'mid', step_goal: 'Deeskaler konkret og hent riktig faglig hjelp uten å late som du har klinisk myndighet.', allowed_families: ['psykologi_miljoarbeid_eskalering'], fallback_types: [] }
  ]
};
writeJson('data/Civication/mailPlans/psykologi/psykologi_miljoarbeid_plan.json', plan);

function choice(id, label, reply, effect, tags, feedback, stats) {
  return { id, label, reply, effect, tags, feedback, effects: { stats } };
}
function mail(spec) {
  return {
    id: spec.id,
    mail_type: spec.type,
    mail_family: spec.family,
    role_scope: scope,
    phase: spec.phase || 'workday',
    priority: spec.priority,
    from: spec.from,
    people_ref: spec.people,
    place_id: spec.place,
    subject: spec.subject,
    summary: spec.summary,
    situation: spec.situation,
    task_domain: spec.domain,
    competency: spec.competency,
    pressure: spec.pressure,
    choice_axis: spec.choiceAxis,
    consequence_axis: spec.consequenceAxis,
    narrative_arc: spec.arc,
    choices: spec.choices
  };
}
function catalog(type, family, purpose, focus, m) {
  writeJson(`data/Civication/mailFamilies/${category}/${type}/${scope}_${type}.json`, {
    schema: 'civication_mail_family_catalog_v1', version: 1, category, role_scope: scope, mail_type: type,
    families: [{ id: family, purpose, learning_focus: focus, mails: [m] }]
  });
}

catalog('job','psykologi_miljoarbeid_vaktstart','Starte vakten med presis overlevering uten å gjøre antakelser til kliniske fakta.', ['observasjon','overlevering','presisjon'], mail({
  id:'psykologi_miljoarbeid_job_vaktstart', type:'job', family:'psykologi_miljoarbeid_vaktstart', phase:'intro', priority:140,
  from:'Mari, teamleder', people:'mari_teamleder', place:'bofellesskap_vaktrom',
  subject:'Overleveringen sier «deprimert» — men notatet beskriver bare tre avlyste frokoster',
  summary:'Du starter vakten med et sterkt tolkningsord og få observerbare detaljer. Neste team trenger fakta de faktisk kan handle på.',
  situation:['Tre morgener med avlyst frokost er en reell endring som må tas på alvor.','Ordet «deprimert» går lenger enn det miljøarbeiderrollen kan konkludere med.','Du må gjøre overleveringen presis nok til at bekymringen verken bagatelliseres eller blir til en ubegrunnet diagnose.'],
  domain:'vaktstart_og_observasjon', competency:'konkret_observasjon', pressure:'tempo_vs_presisjon', choiceAxis:'observerbart_sprak_vs_diagnostisk_tolkning', consequenceAxis:'etterprovbar_oppfolging_vs_stempling', arc:'det_du_saa',
  choices:[
    choice('A','Skriv om overleveringen til konkrete hendelser, spør åpent ved første møte og marker hva teamet skal følge med på','Jeg beholder bekymringen, men skiller tydelig mellom det vi så og det vi ikke vet.',1,['observation','precision'],'Neste vakt får et etterprøvbart utgangspunkt uten at usikkerhet blir skjult.',{quality:2,trust:2,risk:-2,energy:-1}),
    choice('B','La «deprimert» stå fordi ordet gjør at alle skjønner alvoret raskere','Jeg beholder merkelappen så teamet reagerer med en gang.',-1,['label','authority_risk'],'Bekymringen blir synlig, men en klinisk tolkning får status som faktum uten mandat eller grunnlag.',{status:1,quality:-2,trust:-2,risk:3}),
    choice('C','Fjern tolkningsordet, men vent med videre oppfølging til du selv har sett personen','Jeg rydder språket og samler mer observasjon før jeg konkluderer om behovet.',0,['caution','observation'],'Språket blir bedre, men viktig bekymring kan bli liggende hvis du venter for lenge med å dele den.',{quality:1,trust:0,risk:0,energy:-1})
  ]
}));

catalog('people','psykologi_miljoarbeid_autonomi','Støtte mestring uten at hjelp blir overtakelse.', ['autonomi','motivasjon','relasjon'], mail({
  id:'psykologi_miljoarbeid_people_autonomi', type:'people', family:'psykologi_miljoarbeid_autonomi', priority:128,
  from:'Nora, erfaren kollega', people:'nora_erfaren_kollega', place:'aktivitetstilbud_verksted',
  subject:'Elias vil avlyse verkstedet — og bussen går om ti minutter',
  summary:'Planen sier aktivitet, men Elias sier nei. Nora foreslår at dere bare får ham av gårde før tiden renner ut.',
  situation:['Elias har tidligere ønsket aktiviteten og pleier å være fornøyd når han først kommer fram.','I dag sier han tydelig at han ikke vil dra, men forklarer lite.','Du må støtte uten å gjøre tidspress eller egen vurdering av «hva som er best» til skjult tvang.'],
  domain:'autonomi_og_hverdagsstotte', competency:'motiverende_stotte', pressure:'effektivitet_vs_autonomi', choiceAxis:'utforsk_og_tilpass_vs_press_gjennom', consequenceAxis:'mestring_og_tillit_vs_avhengighet_og_motstand', arc:'aktiviteten_ingen_vil_pa',
  choices:[
    choice('A','Spør hva som gjør dagen annerledes, tilby et mindre alternativ og la Elias velge mellom reelle muligheter','Jeg vil forstå motstanden og bevare valget hans, ikke bare få planen gjennomført.',1,['autonomy','motivation'],'Du gjør målet fleksibelt nok til at støtte fortsatt kan bygge mestring.',{quality:2,trust:2,risk:-1,energy:-1}),
    choice('B','Si at dere allerede har bestemt dette og få ham med før bussen går','Planen må gjennomføres; vi kan snakke om motstanden etterpå.',-1,['pressure','compliance'],'Dagen blir effektiv, men etterlevelse blir forvekslet med motivasjon og tilliten svekkes.',{status:1,quality:-2,trust:-3,risk:2}),
    choice('C','Avlys hele aktiviteten uten å spørre mer','Jeg tar nei-et bokstavelig og lar ham være i fred i dag.',0,['respect','underexplored'],'Du unngår press, men mister muligheten til å forstå om et lite hinder kunne vært løst på hans premisser.',{quality:0,trust:1,energy:0})
  ]
}));

catalog('conflict','psykologi_miljoarbeid_fortrolighet','Holde relasjon og sikkerhet samtidig når en fortrolig samtale krever faglig eskalering.', ['profesjonelle_grenser','fortrolighet','sikker_eskalering'], mail({
  id:'psykologi_miljoarbeid_conflict_fortrolighet', type:'conflict', family:'psykologi_miljoarbeid_fortrolighet', priority:126,
  from:'Elias', people:'elias_bruker', place:'oppfolging_samtalerom',
  subject:'«Du må love at dette blir mellom oss»',
  summary:'Elias forteller noe som gjør deg alvorlig bekymret for sikkerheten hans, men ber deg love full hemmeligholdelse før han sier mer.',
  situation:['Relasjonen er bygget på at du lytter uten å dømme.','Samtidig kan du ikke love å bære alvorlig sikkerhetsbekymring alene.','Hvordan du forklarer grensen kan avgjøre om eskalering oppleves som svik eller profesjonell omsorg.'],
  domain:'relasjon_og_grensesetting', competency:'sikker_eskalering', pressure:'tillit_vs_sikkerhetsansvar', choiceAxis:'tydelig_grense_og_delt_ansvar_vs_umandatert_hemmelighold', consequenceAxis:'langsiktig_tillit_og_sikkerhet_vs_rolleglidning', arc:'samtalen_blir_for_tung',
  choices:[
    choice('A','Si at du vil lytte, men at du ikke kan love hemmelighold dersom sikkerhet gjør at riktig fagperson må inn','Jeg blir i samtalen med deg, og jeg skal være tydelig om hva jeg eventuelt må dele og med hvem.',1,['boundary','safety'],'Du beskytter både relasjonen og ansvarslinjen ved å gjøre grensen synlig før du handler.',{quality:2,trust:1,risk:-3,integrity:2}),
    choice('B','Lov at ingenting går videre for å få hele historien','Du kan stole på meg; dette blir mellom oss.',-1,['secrecy','role_drift'],'Du får kanskje mer informasjon, men tar på deg et ansvar rollen ikke kan holde dersom risikoen er alvorlig.',{trust:1,quality:-3,risk:4,integrity:-3}),
    choice('C','Avbryt og si at slike temaer bare kan tas med psykologen','Dette er ikke mitt fagområde, så du må vente til fagkontakten er tilgjengelig.',0,['boundary','withdrawal'],'Du unngår rolleglidning, men en for brå avvisning kan gjøre det vanskeligere å få fram viktig sikkerhetsinformasjon.',{quality:0,trust:-2,risk:1,integrity:1})
  ]
}));

catalog('event','psykologi_miljoarbeid_eskalering','Deeskalere en akutt situasjon innen egen rolle og hente riktig ansvar når klinisk vurdering trengs.', ['deeskalering','sikkerhet','myndighetsgrense'], mail({
  id:'psykologi_miljoarbeid_event_eskalering', type:'event', family:'psykologi_miljoarbeid_eskalering', priority:124,
  from:'Mari, teamleder', people:'mari_teamleder', place:'bofellesskap_fellesrom',
  subject:'Stemmen stiger i fellesrommet — og flere begynner å samle seg',
  summary:'En uenighet eskalerer raskt. Du kan påvirke miljøet nå, men årsak og videre tiltak krever mer enn en rask psykologisk forklaring.',
  situation:['To personer står tett, stemmenivået stiger og resten av gruppa følger med.','Du har mandat til å roe rammen, skape avstand og hente hjelp.','Du har ikke mandat til å diagnostisere reaksjonen eller improvisere behandling midt i hendelsen.'],
  domain:'deeskalering_og_sikker_eskalering', competency:'deeskalering', pressure:'handlepress_vs_myndighetsgrense', choiceAxis:'reguler_miljo_og_eskaler_vs_forklar_og_behandle_selv', consequenceAxis:'sikkerhet_og_rollepresisjon_vs_eskalert_risiko', arc:'fellesrommet',
  choices:[
    choice('A','Senk stimuli, skap fysisk avstand, få andre ut av situasjonen og kontakt ansvarlig fagperson etter sikkerhetsrutinen','Jeg håndterer miljøet og sikkerheten nå, og lar riktig fagperson eie vurderingen videre.',1,['deescalation','escalation'],'Du bruker egen kompetanse fullt uten å overskride klinisk myndighet.',{quality:2,trust:1,risk:-4,energy:-2}),
    choice('B','Forklar at reaksjonen sannsynligvis er angst og prøv en terapeutisk samtale på stedet','Jeg tror jeg vet hva dette er; jeg roer personen ved å behandle årsaken direkte.',-1,['diagnosis','authority_breach'],'Du gjør en usikker tolkning til klinisk forklaring samtidig som situasjonen fortsatt er uavklart.',{status:1,quality:-4,trust:-2,risk:5,integrity:-3}),
    choice('C','Be teamleder ta hele situasjonen mens du trekker deg ut','Jeg vil ikke risikere å gå utenfor rollen, så jeg overlater alt til leder.',0,['escalation','underuse'],'Du beskytter myndighetsgrensen, men bruker mindre av egen deeskaleringskompetanse enn situasjonen tillater.',{quality:0,trust:0,risk:0,energy:1})
  ]
}));

catalog('knowledge','psykologi_miljoarbeid_dokumentasjon','Bruke psykologisk kunnskap til bedre observasjon uten å skrive skjulte diagnoser.', ['observasjon','stigma','dokumentasjon'], mail({
  id:'psykologi_miljoarbeid_knowledge_dokumentasjon', type:'knowledge', family:'psykologi_miljoarbeid_dokumentasjon', priority:132,
  from:'Sigrid, psykologfaglig kontakt', people:'sigrid_psykolog_fagkontakt', place:'bofellesskap_vaktrom',
  subject:'Hva er forskjellen på «aggressiv» og det du faktisk observerte?',
  summary:'Fagkontakten ber deg rydde et notat slik at neste vakt kan skille hendelse, kontekst og tolkning.',
  situation:['Ord som «aggressiv», «manipulerende» eller «deprimert» kan virke presise fordi de er korte.','Men de kan samle mange ulike hendelser under én merkelapp og forme hvordan neste vakt møter personen.','Oppgaven er å gjøre notatet mer faglig ved å beskrive atferd, situasjon og respons konkret.'],
  domain:'dokumentasjon_og_overlevering', competency:'noytral_dokumentasjon', pressure:'korthet_vs_etterprovbarhet', choiceAxis:'beskriv_hendelse_og_kontekst_vs_personmerkelapp', consequenceAxis:'felles_faglig_grunnlag_vs_stigma', arc:'notatet_som_stempler',
  choices:[
    choice('A','Skriv hva som ble sagt og gjort, hva som skjedde rett før, og hva som roet situasjonen','Jeg dokumenterer hendelsen slik at andre kan vurdere den uten å arve min tolkning.',1,['documentation','observation'],'Notatet blir lengre, men langt mer nyttig for både miljøarbeid og faglig vurdering.',{quality:3,trust:1,risk:-2}),
    choice('B','Behold «aggressiv» og legg til at dette er din vurdering','Jeg markerer at det er min vurdering, så ordet kan stå.',-1,['label','stigma'],'Forbeholdet hjelper litt, men merkelappen fortsetter å organisere hvordan andre leser hendelsen.',{quality:-2,trust:-2,risk:2}),
    choice('C','Fjern alle vurderingsord og skriv bare tidspunktet for hendelsen','Jeg unngår tolkning helt og noterer bare når det skjedde.',0,['minimalism','missing_context'],'Du unngår stigma, men gjør dokumentasjonen for tynn til å støtte læring og oppfølging.',{quality:0,trust:0,risk:1})
  ]
}));

catalog('followup','psykologi_miljoarbeid_faglig_oppfolging','Følge opp eskalering med presise observasjoner, brukerperspektiv og tydelig ansvarsdeling.', ['oppfolging','fagkontakt','ansvarsdeling'], mail({
  id:'psykologi_miljoarbeid_followup_fagkontakt', type:'followup', family:'psykologi_miljoarbeid_faglig_oppfolging', priority:112,
  from:'Sigrid, psykologfaglig kontakt', people:'sigrid_psykolog_fagkontakt', place:'oppfolging_samtalerom',
  subject:'Før jeg vurderer videre: hva så du, hva sa Elias selv, og hva endret seg etterpå?',
  summary:'Fagkontakten følger opp hendelsen og trenger førstelinjens situasjonskunnskap uten at den presenteres som klinisk konklusjon.',
  situation:['Du satt nærmest hendelsen og har detaljer fagkontakten ikke har.','Verdien din ligger i konkrete observasjoner, kontekst og hva personen selv uttrykte.','En god overlevering gjør faggrensen produktiv i stedet for å gjøre førstelinjen enten taus eller pseudo-klinisk.'],
  domain:'faglig_oppfolging', competency:'samarbeid_og_eskalering', pressure:'situasjonskunnskap_vs_klinisk_ansvar', choiceAxis:'del_konkret_evidens_vs_selg_egen_forklaring', consequenceAxis:'tverrfaglig_kvalitet_vs_rolleuklarhet', arc:'samtalen_returnerer',
  choices:[
    choice('A','Gi en kort tidslinje med observerbare hendelser, Elias sine egne ord og hva som endret seg etter deeskaleringen','Jeg gir deg det jeg faktisk vet, og markerer tydelig hva jeg ikke kan konkludere om.',1,['handover','evidence'],'Fagkontakten får et sterkt grunnlag og myndighetsgrensen blir en ressurs, ikke et hinder.',{quality:2,trust:2,risk:-2}),
    choice('B','Si at du tror dette er et tydelig angstproblem og anbefal hva behandlingen bør bli','Jeg var der og mener årsaken er ganske klar.',-1,['diagnosis','authority_breach'],'Situasjonskunnskap blir blandet med en behandlingskonklusjon du ikke eier.',{status:1,quality:-3,trust:-2,risk:3,integrity:-2}),
    choice('C','Si bare at fagkontakten får lese journalen fordi du ikke vil påvirke vurderingen','Alt står skrevet; jeg vil ikke legge føringer.',0,['distance','lost_context'],'Du unngår overtolkning, men holder tilbake nyttig kontekst som bare førstelinjen har.',{quality:0,trust:-1,risk:0})
  ]
}));

catalog('consequence','psykologi_miljoarbeid_forsinket_konsekvens','Vise hvordan språk, grenser og eskaleringsvalg former neste vakt og personens tillit senere.', ['sen_konsekvens','stigma','reparasjon'], mail({
  id:'psykologi_miljoarbeid_consequence_neste_vakt', type:'consequence', family:'psykologi_miljoarbeid_forsinket_konsekvens', priority:108,
  from:'Mari, teamleder', people:'mari_teamleder', place:'bofellesskap_vaktrom',
  subject:'Neste vakt møtte Elias som «ustabil» — nå vil han ikke snakke med teamet',
  summary:'Et tidligere tolkningsord har vandret gjennom overleveringen og påvirket relasjonen. Konsekvensen kommer etter at den opprinnelige vakten føltes ferdig.',
  situation:['Elias reagerer på at flere ansatte møter ham med ekstra kontroll og færre valg.','Ingen enkeltperson mente å stemple ham, men språket har blitt gjentatt som om det var et faktum.','Du kan reparere både dokumentasjonen og arbeidsmåten uten å late som tillit kommer tilbake med én unnskyldning.'],
  domain:'forsinket_dokumentasjonskonsekvens', competency:'reparasjon_og_overlevering', pressure:'forsvar_av_tidligere_praksis_vs_reparasjon', choiceAxis:'korriger_spor_og_praksis_vs_normaliser_merkelappen', consequenceAxis:'langsiktig_tillit_og_autonomi_vs_stigma_og_kontroll', arc:'notatet_returnerer',
  choices:[
    choice('A','Korriger overleveringen med observerbare fakta, ta opp språkpraksisen i teamet og forklar Elias hva dere endrer','Jeg reparerer både notatet og måten vi bruker slike ord på framover.',1,['repair','anti_stigma'],'Du kan ikke slette effekten, men gjør feilen sporbar og reduserer sjansen for at den gjentas.',{quality:3,trust:2,risk:-3,status:-1}),
    choice('B','Forklar at «ustabil» bare var internt fagspråk og at teamet må få bruke korte begreper','Det var ikke ment som et stempel; vi trenger et praktisk språk internt.',-1,['defensiveness','stigma'],'Du beskytter tempoet i dokumentasjonen, men gjør personens erfaring av kontroll til et kommunikasjonsproblem.',{status:1,quality:-3,trust:-4,risk:3}),
    choice('C','Fjern ordet fra det siste notatet, men la eldre overleveringer stå urørt','Jeg rydder det vi skriver nå uten å åpne hele historikken.',0,['limited_repair','documentation'],'Dagens spor blir bedre, mens eldre språk fortsatt kan påvirke hvordan teamet leser personen.',{quality:1,trust:0,risk:-1,energy:-1})
  ]
}));

const test = `#!/usr/bin/env node
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');const read=(r)=>JSON.parse(fs.readFileSync(path.join(ROOT,r),'utf8'));
function storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()};}
function makeFetch(root){return async(url)=>{const clean=String(url||'').split('?')[0].replace(/^\\/+/, '');const full=path.resolve(root,clean);if(!full.startsWith(root))return{ok:false,status:400,async json(){return null}};try{const body=await fs.promises.readFile(full,'utf8');return{ok:true,status:200,async json(){return JSON.parse(body)}}}catch{return{ok:false,status:404,async json(){return null}}}};}
function load(rel){vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),{filename:rel});}
(async()=>{const category='psykologi',scope='psykologi_miljoarbeid',roleId='psykologi_miljoarbeider';const model=read('data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json'),grammar=read('data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json'),plan=read('data/Civication/mailPlans/psykologi/psykologi_miljoarbeid_plan.json'),matrix=read('data/Civication/careerGameplayMatrix.json'),policy=read('data/Civication/careerGameplayPolicy.json');const required=grammar.mail_generation_contract.required_mail_types;
assert.deepEqual(required,['job','people','conflict','event','followup','knowledge','consequence']);assert.deepEqual(plan.sequence.map(s=>s.type),['job','people','conflict','event']);assert.ok(grammar.task_families.length>=5);assert.ok(grammar.work_loops.length>=2);assert.ok(grammar.place_grammar.length>=4);assert.ok(model.scope_boundaries.must_not_simulate_as_authority.includes('diagnostisere'));
const ids=new Set();for(const type of required){const cat=read('data/Civication/mailFamilies/'+category+'/'+type+'/'+scope+'_'+type+'.json');assert.equal(cat.mail_type,type);const mails=cat.families.flatMap(f=>f.mails||[]);assert.ok(mails.length>=1,type);for(const mail of mails){assert.ok(!ids.has(mail.id),mail.id);ids.add(mail.id);assert.ok(mail.place_id,mail.id);assert.ok(mail.choice_axis&&mail.consequence_axis&&mail.narrative_arc,mail.id);assert.ok(Array.isArray(mail.situation)&&mail.situation.length>=3,mail.id);assert.ok(Array.isArray(mail.choices)&&mail.choices.length>=2,mail.id);for(const c of mail.choices){assert.ok(c.feedback,mail.id+'/'+c.id);assert.ok(c.effects?.stats,mail.id+'/'+c.id);}}}
global.window=global;global.localStorage=storage();global.location={href:'http://localhost/Civication.html'};global.Event=class Event{constructor(type){this.type=type}};global.document={readyState:'complete',addEventListener(){}};global.addEventListener=()=>{};global.dispatchEvent=()=>{};global.fetch=makeFetch(ROOT);global.CivicationCalendar={getPhase:()=> 'morning',setPhase(){},advanceByMinutes(){}};global.HG_CapitalMaintenance={maintain:()=>null};global.HG_Lifestyle={addTags:()=>null};global.CivicationPsyche={getAutonomy:()=>50,updateIntegrity(){},updateVisibility(){},updateEconomicRoom(){},updateTrust(){},checkBurnout(){},processCollapse(){}};
for(const s of ['js/Civication/core/civicationState.js','js/Civication/core/civicationEventEngine.js','js/Civication/systems/civicationEventChannels.js','js/Civication/systems/civicationCareerRoleResolver.js','js/Civication/systems/day/dayChoiceDirector.js','js/Civication/systems/day/dayConsequences.js','js/Civication/systems/civicationMailRuntime.js','js/Civication/systems/civicationWorkdayMailBuilder.js','js/Civication/systems/civicationDailyMailBuilder.js','js/Civication/systems/civicationCareerOutcomeRuntime.js'])load(s);
for(const title of ['Miljøassistent','Sosialassistent','Aktivitetsleder (omsorgsarbeid)','Miljøarbeider']){const active={career_id:category,title};assert.equal(global.CivicationCareerRoleResolver.resolveCareerRoleScope(active),scope,title);}const active={career_id:category,role_id:roleId,title:'Miljøarbeider'};assert.equal(global.CivicationCareerRoleResolver.resolveCareerRoleId(active),roleId);assert.equal(global.CivicationMailRuntime.getPlanPath(active),'data/Civication/mailPlans/psykologi/psykologi_miljoarbeid_plan.json');const candidates=await global.CivicationMailRuntime.makeCandidateMailsForActiveRole(active,{});assert.equal(candidates[0]?.id,'psykologi_miljoarbeid_job_vaktstart');
const daily=await global.CivicationDailyMailBuilder.buildQueue(active,{date:'2026-08-19'});const roleItems=daily.items.filter(r=>['forenoon','workday'].includes(r.phase)&&r.event?.role_scope===scope&&r.event?.source_type!=='daily_generated');const types=roleItems.map(r=>r.event.mail_type);assert.deepEqual(types.slice(0,3),['job','knowledge','people']);assert.ok(['conflict','event'].includes(types[3]));assert.deepEqual(types.slice(-2),['followup','consequence']);assert.equal(roleItems.filter(r=>r.event.source_type==='planned').length,1);
const finished={role_plan_id:plan.id,step_index:plan.sequence.length,history:plan.sequence.map(s=>({id:'step_'+s.step,source_type:'planned',choice_id:'A'}))};const decide=p=>global.CivicationCareerOutcomeRuntime.decideOutcome(active,plan,finished,p).status;assert.equal(decide({score:3,strikes:0,warning_used:false,stability:'STABLE'}),'PROMOTED');assert.equal(decide({score:1,strikes:0,warning_used:false,stability:'STABLE'}),'STAGNATED');assert.equal(decide({score:-3,strikes:3,warning_used:false,stability:'STABLE'}),'FIRED');
const world=matrix.worlds.find(w=>w.key==='psykologi/psykologi_miljoarbeid');assert.ok(world);assert.equal(world.status,'playable');assert.equal(world.audit.runtime_gate,true);assert.deepEqual(world.audit.missing_components,[]);for(const c of ['day_one','workday_loop','people','places','mail','knowledge','consequences','performance','progression','exit'])assert.equal(world.audit.components[c].level,'complete',c);assert.equal(world.audit.components.practice_stories.level,'partial');assert.equal(world.audit.life_story_complete,true);
for(const pilot of policy.pilot_worlds){const w=matrix.worlds.find(x=>x.key===pilot.category+'/'+pilot.role_scope);assert.ok(w,pilot.category+'/'+pilot.role_scope);assert.equal(w.status,'playable',w.key);}for(const key of ['naeringsliv/renholder','naeringsliv/ekspeditor','by/by_radgiver_plan','naeringsliv/controller','sport/sport_utover']){const w=matrix.worlds.find(x=>x.key===key);assert.equal(w?.status,'reference_complete',key);}console.log('civication-psykologi-miljoarbeid-playability.test.js: PASS');
})().catch(e=>{console.error(e);process.exit(1)});\n`;
fs.writeFileSync(path.join(ROOT, 'tests/civication-psykologi-miljoarbeid-playability.test.js'), test);

console.log('Materialized Psykologi miljøarbeid pilot source files.');
