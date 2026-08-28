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

const ROLE = 'filosofi_forskning_og_formidling';
const KEY = 'filosofi/filosofi_forskning_og_formidling';
const WORLD_PATH = 'data/Civication/roleWorlds/filosofi/filosofi_forskning_og_formidling.json';
const FREEDOM_THREAD = 'filosofi_frihet_teknologi_001';
const QUOTE_THREAD = 'filosofi_usikkert_sitat_001';
const refs = {
  job:'data/Civication/mailFamilies/filosofi/job/filosofi_forskning_og_formidling_job.json#filosofi_forskning_job_frihet_001',
  people:'data/Civication/mailFamilies/filosofi/people/filosofi_forskning_og_formidling_people.json#filosofi_forskning_people_motargument_001',
  conflict:'data/Civication/mailFamilies/filosofi/conflict/filosofi_forskning_og_formidling_conflict.json#filosofi_forskning_conflict_fasit_001',
  story:'data/Civication/mailFamilies/filosofi/story/filosofi_forskning_og_formidling_story.json#filosofi_forskning_story_sitat_001',
  event:'data/Civication/mailFamilies/filosofi/event/filosofi_forskning_og_formidling_event.json#filosofi_forskning_event_kildetilgang_001',
  micro:'data/Civication/mailFamilies/filosofi/micro/filosofi_forskning_og_formidling_micro.json#filosofi_forskning_micro_frihet_001',
  knowledge:'data/Civication/mailFamilies/filosofi/knowledge/filosofi_forskning_og_formidling_knowledge.json#filosofi_forskning_knowledge_naess_001',
  followup:'data/Civication/mailFamilies/filosofi/followup/filosofi_forskning_og_formidling_followup.json#filosofi_forskning_followup_sitat_001',
  consequence:'data/Civication/mailFamilies/filosofi/consequence/filosofi_forskning_og_formidling_consequence.json#filosofi_forskning_consequence_publikum_001'
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'info',lunch:'conversation',afternoon:'task',evening:'private_consequence'};
const phaseThreads = {
  morning:'premiss_kilde_og_sporsmal',
  lunch:'handoff_uenighet_og_standing',
  afternoon:'rework_formidling_og_korreksjon',
  evening:'delayed_consequence_og_privataftermath'
};
const dayThemes = [
  'Bestillingen ber om å bevise at teknologi gjør oss mindre frie, men materialet bruker frihet på flere måter. Arbeidet må starte med et faktisk spørsmål og eksplisitte begreper før ønsket konklusjon får påvirke kildevalg eller inferens.',
  'Marius viser at motargumentet er blitt for lett å slå fordi faktisk handlingskapasitet og avhengighet er redusert til en enkel teknologipositiv tese. Argumentkartet må overleveres tilbake til analyse og bygges om før kritikken kan kalles redelig.',
  'Liv møter bestillerpress om å fjerne alle betingelser fra konklusjonen. Leveransen kan være tydelig, men resultatet må fortsatt vise hvilket frihetsideal som gjør den normative slutningen mulig og hva dataene alene ikke avgjør.',
  'Noor finner det attraktive historiske sitatet i flere antologier, men ingen av dem peker til primærteksten. Sitatet blir derfor et åpent proveniensspor som må vente i stedet for å bli behandlet som sikkert bare fordi sekundærkjeden er populær.',
  'Primærutgaven kan ikke inspiseres før etter publiseringsfristen. Teamet må håndtere reell venting ved å begrense påstandens styrke, dokumentere hva sekundærkilden faktisk viser og la den direkte attribusjonen stå åpen.',
  'To kilder bruker ordet autonomi, men med ulike kriterier. Den språklige likheten tvinger rework i argumentkartet fordi en felles node ellers gjør forskjellige standarder til falsk enighet eller en konstruert selvmotsigelse.',
  'History Go-oppgaven om Arne Næss gir idéhistorisk kontekst fra en canonical personprofil og Mærradalen. Kunnskapen kan skjerpe spørsmål og historisk forståelse, men personen kan aldri gjøres til nåtidig rådgiver eller normativ fasit.',
  'Noor vender tilbake med bedre proveniens: den berømte ordlyden finnes ikke i primærteksten, men i en senere kommentar. Rettelsen må nå gå fra fotnoten og inn i inferensen dersom argumentet faktisk var avhengig av den sterkere formuleringen.',
  'Redaksjonen trenger en kortere versjon til publikum. Marius og Selma eier ulike deler av form og kvalitet, så handoff må bevare rivaliserende tolkninger og avgjørende forbehold i stedet for å gjøre kortformatet til ny faglig autoritet.',
  'Et avbrudd i leveranseplanen gjør at kildearbeid og formidlingsbrief må bytte rekkefølge. Arbeidet kan reorganiseres, men access-grenser, sitatstatus og normative premisser kan ikke oppgraderes bare fordi tidslinjen endres.',
  'Bestilleren liker den klare selvbestemmelseslinjen, mens fagfeller spør hva kapasitetsforståelsen fortsatt forklarer. Situated standing divergerer mellom oppdragsgiver, forskningsmiljø og redaksjon uten at noen av gruppene får definere sannheten alene.',
  'Publikum møter en versjon som må være forståelig uten å late som tre frihetsbegreper ga samme konklusjon. Formidlingsproduksjonen tester om arbeidet kan komprimeres uten at forskjellen mellom empirisk funn, normativt premiss og tolkning forsvinner.',
  'Etter arrangementet peker publikum på at rivaliserende frihetsforståelse ble borte fra sluttreplikken. Den forsinkede konsekvensen krever offentlig presisering og viser hvordan en liten redaksjonell utelatelse kan bli et reelt tillitsproblem senere.',
  'Perioden avsluttes med to spor som faktisk har returnert: frihet/teknologi-analysen er revidert gjennom handoff og offentlig reaksjon, og sitatsporet er korrigert gjennom venting og ny proveniens. Arbeidet er mer robust fordi revisjon er synlig, ikke skjult.'
];
const phaseTail = {
  morning:'Morgenen gjør siste bekreftede begrep, kilde, attribusjon eller uavklart premiss synlig før teamet bygger videre, slik at waiting aldri blir omdøpt til sikker kunnskap bare for å holde tempo.',
  lunch:'Lunsjflaten viser audience-spesifikk standing mellom forskningsledelse, kilde/proveniens, redaksjon, formidlingsproduksjon, bestiller, fagfeller, publikum og private relasjoner uten en global score.',
  afternoon:'Ettermiddagen bruker de eksisterende forsknings- og formidlingssløyfene til handoff, rework, kildekontroll, argumentrevisjon eller publiseringsforberedelse uten å skape et nytt persistent work-object eller ny runtime.',
  evening:'Kvelden viser forsinket faglig og privat aftermath når frist, status, korrigering eller offentlig uenighet følger med hjem, samtidig som profesjonell standing holdes atskilt fra personlig verdi og formell publiseringsmyndighet.'
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

const theme_ids = ['professional_culture','bureaucratic_power','status_anxiety','shame_reputation','loyalty_up_down','social_mask','precarity','care_vs_efficiency'];

const existing_work_continuity = {
  runtime_binding:'existing_mail_and_work_grammar',
  new_runtime_state:false,
  work_loops:['forskning_og_argumentanalyse','formidling_og_korrigering'],
  thread_keys:[FREEDOM_THREAD, QUOTE_THREAD],
  rule:'Eksisterende mailer og work grammar beviser allerede kontinuitet fra spørsmål og argumentkart gjennom redaksjonell handoff, kildeventing, begrepsrevisjon, publisering og korrigering. Rollouten authorer rhythm over disse faktiske sporene og oppretter ikke et nytt persistent work-object eller ny runtime.'
};

const work_rhythm_model = {
  runtime_binding:'editorial_only_until_governed',
  new_runtime_state:false,
  rule:'Rhythm beskriver hvordan eksisterende arbeid venter, skifter eier, avbrytes, må gjøres om og kommer tilbake som senere konsekvens. Det er editorial Role World-struktur, ikke ny scene- eller task-state.',
  states:[
    {id:'waiting',meaning:'Arbeidet må noen ganger stå åpent mens primærkilde, katalogspor, tilgang eller nødvendig faglig avklaring faktisk mangler.',boundary:'Waiting kan aldri behandles som tillatelse til å oppgradere sekundære spor, usikre sitater eller omstridte premisser til sikre fakta for å holde fristen.'},
    {id:'handoff',meaning:'Argumentkart, kildegrunnlag og formidlingsbrief går mellom forskningsleder, kildebibliotekar, fagredaktør og produsent med åpne spørsmål synlige.',boundary:'Handoff flytter arbeidsansvar og formatansvar, men overfører ikke retten til å diktere forskningsresultat, attribusjon eller normative premisser uten faglig grunn.'},
    {id:'rework',meaning:'Ny kilde, begrepsforskjell, rivaliserende tolkning eller offentlig reaksjon kan kreve at analyse, inferens, attribusjon eller formidling bygges om.',boundary:'Rework er reell revisjon av arbeidets begrunnelse når evidensen krever det; det er ikke kosmetisk omskriving som skjuler at grunnlaget eller konklusjonen har endret seg.'},
    {id:'interruption',meaning:'Bestillerpress, publiseringsfrist, manglende tilgang eller formatkrav kan bryte planlagt rekkefølge og tvinge teamet til å omprioritere.',boundary:'Avbrudd kan endre sekvens og oppmerksomhet, men kan ikke svekke kildegrense, rettigheter, personvern, publiseringsmyndighet eller skillet mellom normativt og empirisk.'},
    {id:'delayed_consequence',meaning:'En stråmann, sitatglidning eller utelatt premiss kan komme tilbake senere som faglig rettelse, publikumsinnvending eller tapt tillit.',boundary:'Forsinket konsekvens kan påvirke situert standing og kreve korrigering, men skaper ingen ny myndighet og må ikke omskrives til en global moralsk eller profesjonell score.'}
  ],
  continuity:[
    {thread_key:FREEDOM_THREAD,setup_ref:refs.job,handoff_ref:refs.people,interruption_ref:refs.conflict,rework_ref:refs.micro,return_ref:refs.consequence,meaning:'Frihet/teknologi-sporet går fra problemavgrensning via argument-handoff og bestilleravbrudd til begrepsrework og en senere offentlig konsekvens.'},
    {thread_key:QUOTE_THREAD,setup_ref:refs.story,waiting_ref:refs.event,return_ref:refs.followup,meaning:'Sitatsporet må vente på bedre proveniens og returnerer senere med evidens som krever både attribusjons- og argumentreparasjon.'}
  ]
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere mellom forskningsledelse, kilde/proveniens, redaksjon, formidlingsproduksjon, bestiller, fagfeller, publikum og private relasjoner. Ingen global reputation-score materialiseres.',
  authority_separation:'Standing kan aldri autorisere skjult normativitet, ubegrunnet attribusjon, stråmann, brudd på rettigheter, tilgang eller personvern, forskuttert forskningsresultat, overstyring av formell publiseringsmyndighet eller bruk av en historisk filosof som nåtidig normativ fasit.',
  audiences:[
    {id:'research_leadership',standing_axis:'research_leadership_standing',cares_about:['presis problemavgrensning og metode','at leveranser kan revideres når evidens eller begreper endres','at faglig usikkerhet er håndterbar og synlig'],cannot_grant:'Forskningsledelsens tillit kan ikke gjøre en ønsket konklusjon til forskningsresultat, oppheve kildekrav eller gi rett til å skjule normative premisser for å møte bestillingen.'},
    {id:'source_provenance',standing_axis:'source_provenance_standing',cares_about:['sporbare sitater og attribusjoner','klart skille mellom primær- og sekundærkilde','synlig status for uavklart kildegrunnlag'],cannot_grant:'Høy provenance-standing kan ikke gjøre et utilgjengelig primærmateriale kontrollert, oppgradere en parafrase til direkte sitat eller gi tilgangsrettigheter som faktisk mangler.'},
    {id:'editorial_team',standing_axis:'editorial_team_standing',cares_about:['redelig argumentrekonstruksjon','begrepspresisjon som overlever redigering','rettelser som når argumentet når kilden endrer premisset'],cannot_grant:'Redaksjonell tillit eller formatmakt kan ikke autorisere stråmann, begrepsglidning, feil attribusjon eller fjerning av et avgjørende faglig forbehold som endrer meningsinnholdet.'},
    {id:'dissemination_production',standing_axis:'dissemination_production_standing',cares_about:['forståelig og gjennomførbar form','tidsramme og publikumsoppmerksomhet','at tydelighet ikke produserer falsk faglig sikkerhet'],cannot_grant:'Formidlingsproduksjonens tillit kan styre scene, format og tidsramme, men kan ikke gjøre dramaturgisk enkelhet til faglig fasit eller overta forsknings- og kildeansvaret.'},
    {id:'commissioner_client',standing_axis:'commissioner_client_standing',cares_about:['et tydelig svar på bestillingen','leveranse til avtalt tid og format','anbefalinger som kan brukes offentlig'],cannot_grant:'Bestillerens tilfredshet, status eller betaling kan ikke love et bestemt forskningsresultat, gjøre verdipremisset empirisk eller gi rett til å utelate relevant uenighet for å beskytte tesen.'},
    {id:'scholarly_peers',standing_axis:'scholarly_peer_standing',cares_about:['sterkest rimelige motargument','etterprøvbar kilde- og inferenskjede','åpen konkurranse mellom tolkninger og eksplisitte premisser'],cannot_grant:'Fagfellers anerkjennelse kan ikke gjøre konsensus til bevis, gi rett til unsupported attribution eller erstatte den konkrete argumentasjonen og kildekontrollen som analysen faktisk krever.'},
    {id:'public_audience',standing_axis:'public_audience_trust',cares_about:['at hovedpåstanden ikke skjuler avgjørende betingelser','at feil og overforenklinger korrigeres synlig','at historiske personer brukes som kontekst og ikke lånt autoritet'],cannot_grant:'Publikums støtte, kritikk eller popularitet kan ikke avgjøre forskningens sannhetsverdi, overføre publiseringsmyndighet eller gjøre Arne Næss til nåtidig beslutningseier for analysens normvalg.'},
    {id:'private_relations',standing_axis:'private_scholarship_mask',cares_about:['at faglig kritikk ikke blir personlig verdi','at frist og rettelser kan legges bort etter arbeidsdagen','at offentlig standing ikke blir hele identiteten'],cannot_grant:'Private relasjoner kan ikke gi faglig, kilde- eller publiseringsmyndighet og kan ikke gjøre personlig støtte til dokumentasjon for et argument, sitat eller normativt premiss.'}
  ],
  divergence_examples:[
    'Å holde et sitat ute mens primærsporet mangler kan svekke kortsiktig standing hos bestiller og produksjon, men styrke tilliten hos provenance-miljø, redaksjon og fagfeller.',
    'Å synliggjøre et normativt premiss kan gjøre leveransen mindre slagkraftig for bestilleren samtidig som forskningsledelse og publikum får et mer redelig bilde av hva konklusjonen faktisk avhenger av.',
    'Å gjøre om argumentkartet etter en begrepsforskjell kan se ut som treghet eller usikkerhet i produksjonen, men styrker standing hos redaksjon og fagfeller fordi rework følger evidensen.',
    'En offentlig rettelse etter arrangementet kan koste status på kort sikt hos produksjon eller bestiller, men styrke publikums- og fagfellestillit fordi feilen faktisk repareres i meningsinnholdet.'
  ]
};

const world = {
  schema:'civication_role_world_v1',version:1,category:'filosofi',role_scope:ROLE,
  title:'Filosofisk forskning og formidling — rytme, kildeansvar og situert tillit',status:'role_world_complete',
  sociological_core:{
    main_problem:'Å holde argument, kilde, normativt premiss og offentlig formidling etterprøvbare gjennom venting, handoff, tidspress og korrigering uten at status hos bestiller, redaksjon eller publikum blir en snarvei til faglig autoritet.',
    description:'Role World-en lukker rhythm_waiting_handoff_rework og situated_reputation. Den gjenbruker eksisterende forsknings- og formidlingssløyfer og de canonicale frihet/teknologi- og sitatproveniens-trådene uten å reauthorere persistent work.'
  },
  theme_ids,
  social_environments:[
    'Arbeidsrommet der Liv trenger en brukbar leveranse, men må holde forskjellen mellom mandat og forskningsresultat synlig.',
    'Argumentkartet der Marius tester om motposisjonen er sterk nok og om like ord faktisk betegner samme begrep.',
    'Kildelaben der Noor skiller primærspor, sekundærkjede, parafrase, utilgjengelig materiale og dokumentert usikkerhet.',
    'Redaksjonsmøtet der format, bestillerbehov og faglig premissåpenhet kan trekke i ulike retninger.',
    'Formidlingsscenen der Selma eier publikum og tidsramme uten å få rett til å gjøre slagkraft til faglig fasit.',
    'History Go-ankeret Mærradalen der Arne Næss leses som canonical filosofihistorisk kontekst og aldri som fiktiv kollega.',
    'Fagfelleflaten der argumentets sterke rival, sitatstatus og inferenskjede må kunne etterprøves av andre.',
    'Bestillerrelasjonen der ønsket om ett tydelig svar kan øke sosialt press mot betingelser og rivaliserende perspektiver.',
    'Privatlivet der offentlig kritikk, rettelser og status må kunne legges bort uten at fagrollen blir hele identiteten.'
  ],
  recurring_people_archetypes:[
    {id:'philosophy_research_lead_world',social_function:'forskningsleder som eier problemavgrensning, leveranse og metodekrav uten å eie konklusjonen',class_position:'faglig leder med organisatorisk makt over prioritering og leveranse',status:'høy intern status og tydelig mandatansvar',power_over_player:'kan avgrense oppdrag, kreve metodeklarhet og sende arbeid tilbake når premisser eller evidens er uklare',wants:'etterprøvbar analyse som kan leveres og forklares uten skjult normativitet',conceals:'at bestillerpress og frist kan gjøre en for tydelig fasit sosialt attraktiv selv når evidensen er betinget',speech_style:'kort og analytisk; spør hva som faktisk er spørsmålet, premisset og leveransen',teaches_player:'at ledelse kan kreve kvalitet og tydelighet uten å få definere forskningsresultatet'},
    {id:'philosophy_provenance_world',social_function:'kildebibliotekar som holder sitat, katalogspor, tilgang og attribusjonsstatus etterprøvbar',class_position:'spesialist med høy situert autoritet over provenance og tilgangsgrenser',status:'høy faglig tillit på kildeområdet uten å eie analysens konklusjon',power_over_player:'kan stoppe sikker attribusjon, gjøre usikkerhet synlig og kreve at et kildeproblem forblir åpent',wants:'sporbare kilder, ærlig venting og rettelser som følger ny evidens',conceals:'at god kildekontroll ofte er usynlig når den bare hindrer en feil som ellers ville vært retorisk effektiv',speech_style:'presis og dokumentarisk; spør hvor ordlyden først finnes og hva materialet faktisk viser',teaches_player:'at provenance-standing følger evnen til å la usikkerhet være åpen til sporet er godt nok'},
    {id:'philosophy_editor_world',social_function:'fagredaktør som tester argumentkart, begrepspresisjon, rivaliserende tolkninger og korrigerbar tekst',class_position:'faglig redaksjonell mellomposisjon med stor innflytelse over kvalitet og form',status:'middels til høy fagstatus med sterk portfunksjon før publisering',power_over_player:'kan sende argumentet tilbake for rework når en stråmann, begrepsglidning eller kosmetisk rettelse skjuler faglig gjeld',wants:'tekst som er kort nok til bruk men sterk nok til faglig kontroll',conceals:'at redaksjonell klarhet kan friste til å kutte det forbeholdet som faktisk bærer hele konklusjonen',speech_style:'kontrastorientert; spør hva motparten egentlig hevder og hvilke ord som skifter betydning',teaches_player:'at god redigering ikke er komprimering for enhver pris, men kontrollert bevaring av meningsbærende premisser'},
    {id:'philosophy_producer_world',social_function:'formidlingsprodusent som eier scene, publikum, dramaturgi og tidsramme uten å eie faglig sannhet',class_position:'produksjonsrolle med praktisk makt over format og synlighet',status:'høy situert status i publiseringsøyeblikket',power_over_player:'kan presse på for kortere budskap, endret rekkefølge og tydeligere hovedpoeng',wants:'en forståelig opplevelse som faktisk fungerer for publikum',conceals:'at tidsrammen kan få et betinget resonnement til å se svakere ut enn en universell påstand',speech_style:'publikums- og tidsnær; spør hva som må stå igjen når alt ikke får plass',teaches_player:'at formatmakt er reell uten å være forskningsmyndighet'},
    {id:'philosophy_commissioner_world',social_function:'bestiller som trenger et anvendelig svar og kan belønne tydelighet, tempo og teselojalitet',class_position:'ekstern ressurs- og oppdragsmakt uten faglig eierskap til resultatet',status:'potensielt høy institusjonell status og sterk presskraft',power_over_player:'kan påvirke mandat, fremtidige oppdrag og hvor fornøyd leveransen vurderes',wants:'et klart budskap som møter arrangementets eller organisasjonens behov',conceals:'at et eksplisitt normativt premiss kan gjøre resultatet mindre brukbart som ferdig retorisk budskap',speech_style:'resultatnær; spør hva analysen konkluderer med og om setningen kan stå uten forbehold',teaches_player:'at bestillerstanding og faglig redelighet kan divergere uten at betaling eller status skaper sannhet'},
    {id:'philosophy_peer_world',social_function:'fagfelle som prøver argumentets sterkeste rival, kildesporet og inferensen mellom premiss og konklusjon',class_position:'faglig likemann uten organisatorisk myndighet over oppdraget',status:'høy epistemisk innflytelse gjennom kritikk og anerkjennelse',power_over_player:'kan gjøre svak argumentrekonstruksjon, skjult normativitet eller kildeoverdrivelse offentlig faglig synlig',wants:'en analyse som tåler uenighet og kan kontrolleres uten å stole på forfatterens status',conceals:'at fagmiljøet også har prestisje, skoler og forventninger som kan gjøre konsensus sosialt attraktiv',speech_style:'spørrende og presis; ber om premiss, kilde, rival og hva som faktisk følger',teaches_player:'at faglig standing bygges av etterprøvbar uenighet mer enn av sikker tone'},
    {id:'philosophy_public_world',social_function:'publikum som møter den komprimerte versjonen og kan oppdage når rivaler eller betingelser forsvinner',class_position:'mottakere uten formell fagmyndighet men med legitim forventning om redelig representasjon',status:'lav formell makt enkeltvis og mulig høy kollektiv synlighet',power_over_player:'kan gjøre overforenkling og manglende rettelse til et offentlig tillitsproblem',wants:'forståelige påstander som ikke skjuler hva som er tolkning, premiss eller usikker kilde',conceals:'at tydelige universelle konklusjoner ofte er lettere å huske og belønne enn betingede resonnementer',speech_style:'konkret og reaksjonsnær; spør hvorfor noe som var nyansert i starten ble sikkert i slutten',teaches_player:'at offentlig standing ikke krever full kompleksitet, men krever at avgjørende meningsgrenser overlever'},
    {id:'philosophy_private_world',social_function:'privat nær relasjon som møter personen etter kritikk, frist, rettelser og usikker faglig status',class_position:'privat likemann uten faglig eller publiseringsmessig myndighet',status:'emosjonell nærhet uten profesjonell rang',power_over_player:'kan utfordre behovet for å gjøre enhver innvending eller korreksjon til dom over egen personlige verdi',wants:'at arbeidet kan legges bort og at revisjon kan forstås som del av yrket fremfor personlig nederlag',conceals:'at privatlivet slites når all offentlig eller faglig standing følger med hjem',speech_style:'direkte og avdramatiserende; spør om noe faktisk må løses nå eller om arbeidet ligger hos neste eier',teaches_player:'at situated professional standing aldri er identisk med personlig verdi'}
  ],
  slow_axes:[
    {id:'premise_visibility',meaning:'om normative og empiriske premisser forblir adskilt og synlige gjennom analyse og formidling',runtime_binding:'editorial_only_until_governed'},
    {id:'source_trace_quality',meaning:'om sitat, attribusjon, primærspor og sekundærspor forblir rekonstruerbare når materialet går mellom personer',runtime_binding:'editorial_only_until_governed'},
    {id:'research_leadership_standing',meaning:'situert tillit hos forskningsledelse til metode, leveranse og synlig usikkerhet uten forhåndsresultat',runtime_binding:'editorial_only_until_governed'},
    {id:'provenance_standing',meaning:'situert tillit hos kilde- og provenance-miljø til sporbarhet, venting og reell korrigering',runtime_binding:'editorial_only_until_governed'},
    {id:'editorial_standing',meaning:'situert tillit hos redaksjon til sterke motargumenter, begrepspresisjon og rework som faktisk reparerer analyse',runtime_binding:'editorial_only_until_governed'},
    {id:'commissioner_standing',meaning:'situert tilfredshet hos bestiller rundt tydelighet, tempo og anvendelighet uten rett til å bestemme resultatet',runtime_binding:'editorial_only_until_governed'},
    {id:'public_trust_standing',meaning:'situert offentlig tillit til at betingelser, rivaler og rettelser overlever komprimering',runtime_binding:'editorial_only_until_governed'},
    {id:'private_status_mask',meaning:'hvor sterkt faglig kritikk, publiseringsstatus og rettelser smelter sammen med personlig verdi privat',runtime_binding:'editorial_only_until_governed'}
  ],
  existing_work_continuity,
  work_rhythm_model,
  situated_reputation_model,
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'freedom_problem_and_argument',beat_refs:['1/morning','2/lunch','3/afternoon','6/afternoon','9/lunch','11/morning','13/afternoon']},
    {id:'quote_provenance_waiting',beat_refs:['4/morning','4/afternoon','5/morning','5/afternoon','8/morning','8/afternoon','10/lunch']},
    {id:'handoff_and_rework',beat_refs:['2/afternoon','3/lunch','6/lunch','9/afternoon','10/afternoon','12/lunch','14/afternoon']},
    {id:'situated_standing',beat_refs:['1/lunch','3/lunch','7/lunch','9/lunch','11/lunch','12/lunch','13/lunch','14/lunch']},
    {id:'public_dissemination',beat_refs:['7/afternoon','9/afternoon','10/morning','11/afternoon','12/afternoon','13/morning','13/afternoon','14/morning']},
    {id:'private_aftermath_thread',beat_refs:['2/evening','4/evening','6/evening','8/evening','10/evening','12/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_scope_pushback',beat_ref:'3/evening',meaning:'Å holde normativt premiss synlig kan kjennes som svakere leveranse når bestilleren ønsker én setning, selv når analysen blir mer redelig.'},
    {id:'after_quote_waiting',beat_ref:'5/evening',meaning:'Å vente på eller avgrense en kilde kan føles som manglende fremdrift, men beskytter arbeidet mot en attribusjon som senere er vanskelig å reparere.'},
    {id:'after_concept_rework',beat_ref:'6/evening',meaning:'Å bygge om argumentkartet etter begrepsglidning kan oppleves som tilbakeskritt selv når rework er selve tegnet på at evidensen får konsekvens.'},
    {id:'after_naess_boundary',beat_ref:'7/evening',meaning:'Historisk autoritet kan være sosialt fristende å låne, men kildeforankret kontekst er faglig sterkere enn å bruke en kjent filosof som personlig fasit.'},
    {id:'after_source_correction',beat_ref:'8/evening',meaning:'En reell sitatkorreksjon kan koste status fordi tidligere tekst må endres, men arbeidets troverdighet avhenger av at inferensen følger ny evidens.'},
    {id:'after_public_challenge',beat_ref:'13/evening',meaning:'Publikumsinnvending mot overforenkling kan kjennes personlig selv når den konkret gjelder en redaksjonell utelatelse som faktisk kan repareres.'}
  ],
  delayed_consequences:[
    {id:'freedom_scope_returns',setup_ref:'1/morning',return_ref:'6/afternoon',meaning:'Den tidlige definisjonen av frihet kommer tilbake når autonomi viser seg å ha to ulike betydninger og argumentkartet må revideres.'},
    {id:'steelman_returns',setup_ref:'2/lunch',return_ref:'11/morning',meaning:'Måten motargumentet ble rekonstruert på avgjør senere om fagfeller ser reell uenighet eller en enkel stråmann.'},
    {id:'commissioner_pressure_returns',setup_ref:'3/afternoon',return_ref:'13/afternoon',meaning:'Presset om en ubetinget konklusjon kommer tilbake når publikum oppdager at sluttpoenget mistet det avgjørende normative premisset.'},
    {id:'quote_uncertainty_returns',setup_ref:'4/morning',return_ref:'8/afternoon',meaning:'Det åpne sitatsporet returnerer med bedre proveniens og tvinger både attribusjons- og argumentreparasjon.'},
    {id:'source_access_returns',setup_ref:'5/morning',return_ref:'10/lunch',meaning:'Begrensningen som ble valgt mens primærmaterialet var utilgjengelig viser senere om teamet faktisk holdt påstandens styrke innenfor tilgjengelig evidens.'},
    {id:'dissemination_compression_returns',setup_ref:'9/afternoon',return_ref:'13/afternoon',meaning:'Kompresjonen for publikum kommer tilbake som offentlig spørsmål når rivaliserende frihetsforståelse har falt ut av oppsummeringen.'}
  ],
  cross_role_link:{status:'not_required_for_rollout',materialized:false,new_runtime:false,rule:'Cross-role er ikke nødvendig for denne rollouten. Eksisterende research-, kilde-, redaksjons- og formidlingsaktører gir nok canonical continuity, og nye delte runtime-objekter opprettes ikke.'},
  materialization:{
    authored_dimensions:['rhythm_waiting_handoff_rework','situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    existing_persistent_work_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refCycle
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.path === WORLD_PATH)) {
  index.roles.push({category:'filosofi',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'thirty_one_role_worlds_materialized';
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

const report = `# Civication Filosofi forskning og formidling Role World rollout\n\n- status: role_world_complete\n- authored dimensions: rhythm_waiting_handoff_rework + situated_reputation\n- coverage: 14 days / 56 beats\n- canonical source refs: 9\n- existing continuity reused: ${FREEDOM_THREAD} + ${QUOTE_THREAD}\n- existing persistent work preserved, not re-authored\n- existing work loops preserved: forskning_og_argumentanalyse + formidling_og_korrigering\n- canonical 9-step mail plan preserved\n- canonical role model and work grammar preserved\n- Arne Næss remains a source-bounded History Go factual target only\n- cross-role: not_required_for_rollout / not materialized\n- new runtime: false\n- global reputation score: forbidden\n\nAuthority remains fail-closed: standing, deadline or commissioner pressure cannot create unsupported attribution, hide normative premises, authorize a strawman, override rights/access/privacy/formal publishing authority, promise a predetermined research result or turn a historical philosopher into a present-day normative authority.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_FILOSOFI_FORSKNING_FORMIDLING_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${WORLD_PATH}: ${coverage.length} beats / ${refCycle.length} canonical source refs`);
