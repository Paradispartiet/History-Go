import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ROLE = 'natur_biologi_og_forskning';
const CATEGORY = 'natur';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_BIOLOGI_OG_FORSKNING_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'forskningssporsmal_metode_prove_data_analyse_og_replikasjonslogg';
const ACTORS = [
  {id:'ingrid_seniorforsker_natur_biologi_og_forskning',name:'Ingrid',role:'seniorforsker og metodeansvarlig',workplace_ids:['metodemote_og_faglig_kvalitetssikring']},
  {id:'marius_feltkoordinator_natur_biologi_og_forskning',name:'Marius',role:'feltkoordinator',workplace_ids:['feltstasjon_og_provetakingspunkt']},
  {id:'leila_laboratorieansvarlig_natur_biologi_og_forskning',name:'Leila',role:'laboratorieansvarlig',workplace_ids:['provemottak_og_laboratorieflate']},
  {id:'noah_statistiker_dataforvalter_natur_biologi_og_forskning',name:'Noah',role:'statistiker og dataforvalter',workplace_ids:['analyse_reproduserbarhet_og_databord']}
];
const PLACES = [
  {id:'feltstasjon_og_provetakingspunkt',name:'Feltstasjon og prøvetakingspunkt',function:'Her registreres prøvetakingsdesign, lokalitet, tidspunkt, vær- og habitatkontekst, feltavvik, kjede av ansvar og hvilke observasjoner som er rådata versus foreløpig tolkning.'},
  {id:'provemottak_og_laboratorieflate',name:'Prøvemottak og laboratorieflate',function:'Her føres prøve-ID, mottak, lagring, preparering, kalibrering, kontroller, mulig kontaminasjon, avvik og hvem som eier neste laboratoriekontroll.'},
  {id:'analyse_reproduserbarhet_og_databord',name:'Analyse-, reproduserbarhets- og databord',function:'Her kobles rådata, datasettversjon, kode- eller analysevalg, statistiske antakelser, manglende data, sensitivitetsanalyse og replikasjonsstatus til eksplisitte konklusjoner og usikkerhet.'},
  {id:'metodemote_og_faglig_kvalitetssikring',name:'Metodemøte og faglig kvalitetssikring',function:'Her prøves hypotese, metode, alternative forklaringer, etikk, habilitet, bestillerpress, review-kommentarer og konklusjonsstyrke før rapportering eller publisering.'}
];
const POLICY = {
  'Biolog':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Økolog':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Forsker (miljø/natur)':{policy:'qualification_required',qualification_ids:['academic_qualification_and_employment']},
  'Seniorforsker (miljø/natur)':{policy:'qualification_required',qualification_ids:['academic_qualification_and_employment']}
};
const AUTHORITY = {
  may:['analysere data','utforme faglige konklusjoner innen kompetanse og mandat','rapportere usikkerhet og metodebegrensninger'],
  may_not:['forfalske kvalifikasjon eller data','fatte politiske vedtak','bruke forskerrolle som automatisk forvaltningsmyndighet','skjule negative eller usikre funn']
};
const LOOPS = [
  'spørsmål -> hypotese -> metode -> data -> analyse -> tolkning -> kontroll -> publisering',
  'avvik -> feilsøk -> metodevurdering -> ny analyse -> dokumentert konklusjon'
];
const FAMILY = {
  job:'biologi_forskning_job',
  people:'biologi_forskning_profesjonelle_relations',
  conflict:'biologi_forskning_evidens_og_bestillerpress',
  story:'biologi_forskning_forskeridentitet_og_integritet',
  event:'biologi_forskning_avvik_og_ny_evidens',
  micro:'biologi_forskning_rask_metodeavklaring',
  followup:'biologi_forskning_replikasjon_og_etterkontroll',
  knowledge:'biologi_forskning_history_go_naturkontekst',
  consequence:'biologi_forskning_konklusjon_og_etterspill'
};

const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const longSummary = (subject, detail) => `${subject}. ${detail} Saken skal føres i ${PERSISTENT}, der forskningsspørsmål, hypotese, metodeversjon, prøvetakings- eller laboratoriegrunnlag, rådata, datakvalitet, analysevalg, alternative forklaringer, usikkerhet, etikkstatus, avvik, replikasjonsstatus, ventepunkt, handoff og neste eier holdes som separate felt. Rollen kan analysere data, utforme faglige konklusjoner innen kompetanse og mandat og rapportere usikkerhet og metodebegrensninger, men kan ikke forfalske kvalifikasjon eller data, skjule negative eller usikre funn, bruke forskerrollen som automatisk forvaltningsmyndighet eller fatte politiske vedtak. History Go og Natur-badge kan gi kontekst, begreper og bedre spørsmål, men er verken grad, forskeransettelse, laboratoriebevis, etikkgodkjenning eller evidens for at hypotesen er sann. En faglig god løsning må derfor bevare sporbarhet og gjøre det mulig å gjenåpne berørt metode, prøve eller analyse uten å omskrive tidligere observasjoner.`;
const goodReply = `Jeg beholder siste dokumenterte versjon, markerer hvilket ledd som faktisk er kontrollert og hvilket som fortsatt venter, skiller rådata fra analyse og tolkning, og avgrenser konklusjonen til det metoden og datakvaliteten tåler. Jeg registrerer avvik, usikkerhet og alternativ forklaring, sender bare det uavklarte spørsmålet til riktig faglig eier og lar replikasjon eller ny kontroll gjenåpne den berørte delen uten å slette tidligere spor.`;
const badReply = `Jeg prioriterer en rask og tydelig konklusjon, fyller inn det uavklarte selv, behandler frist eller forventning som viktigere enn eksplisitt venting og lar den mest plausible forklaringen stå som om den var kontrollert. Jeg unngår ekstra replikasjon eller metodegjennomgang dersom den kan forsinke leveransen, og lar neste aktør overta uten full oversikt over avvik, usikkerhet, datasettversjon eller hvem som faktisk eier den faglige avklaringen.`;
const goodFeedback = `Grepet gjør forskningen litt langsommere, men holder metode, data og konklusjon etterprøvbare. Neste felt-, laboratorie-, data- eller metodeaktør kan se hva som er observert, hva som er analysert, hva som er usikkert, hvilke kontroller som mangler og hvilket mandat som gjelder. Dermed kan negative funn, avvik eller replikasjonsproblemer faktisk endre konklusjonen i stedet for å bli sosialt eller administrativt presset ut av sporet.`;
const badFeedback = `Leveransen kan se mer beslutningsklar ut på kort sikt, men forskningssporet mister skillet mellom observasjon, analyse, tolkning og mandat. Et senere avvik eller replikasjonsforsøk blir vanskeligere å forstå, og bestiller-, status- eller tidspress får funksjon som skjult evidens. Resultatet kan derfor bli mindre reproduserbart, mindre etisk robust og mer sårbart for at en for sterk konklusjon må trekkes tilbake.`;

const seeds = {
  job:[
    ['Design før første feltuttak','Et feltprosjekt skal starte, men hypotesen må kunne falle og prøvetakingsdesignet må beskrive kontroller, eksklusjonskriterier og forventede feilkilder før første prøve tas.',ACTORS[0],PLACES[3]],
    ['Prøvespor gjennom feltarbeidet','Feltteamet får skiftende forhold og må beholde lokalitet, tidspunkt, habitat, målemetode og avvik som et lesbart spor i stedet for å glatte ut variasjon i ettertid.',ACTORS[1],PLACES[0]],
    ['Laboratoriekontroll før analyse','Prøver er mottatt, men en kontrollserie viser mulig avvik og krever at berørte prøver skilles fra resten før analysen fortsetter.',ACTORS[2],PLACES[1]],
    ['Analyse med eksplisitt usikkerhet','Datasettet er komplett nok til analyse, men effektstørrelse, manglende data og alternative modeller gjør at konklusjonsstyrken må begrenses eksplisitt.',ACTORS[3],PLACES[2]]
  ],
  people:[
    ['Metodekollega utfordrer hypotesen','Ingrid ber om et design som faktisk kan svekke hovedhypotesen og om at alternative forklaringer dokumenteres før resultattolkningen låses.',ACTORS[0],PLACES[3]],
    ['Feltkoordinator melder systematisk avvik','Marius ser at et feltforhold kan påvirke flere prøver og krever at avviket blir del av datasettet, ikke bare en muntlig merknad.',ACTORS[1],PLACES[0]],
    ['Laboratorieansvarlig stopper prøveflyten','Leila finner et kalibrerings- eller kontaminasjonssignal og må kunne stoppe berørte prøver uten at fremdriftspress gjør avviket usynlig.',ACTORS[2],PLACES[1]],
    ['Dataforvalter krever reproduserbart analysegrunnlag','Noah finner uklare transformasjoner og manglende versjonskobling mellom rådata og analyse, og krever at sporet repareres før rapportering.',ACTORS[3],PLACES[2]]
  ],
  conflict:[['Bestiller ønsker sterkere konklusjon','En oppdragsgiver ønsker at en usikker sammenheng omtales som sikker effekt fordi beslutningsbehovet er stort, mens data og design bare støtter en avgrenset konklusjon.',ACTORS[0],PLACES[3]]],
  story:[['Hypotesen faller uten at prosjektet mister verdi','Data støtter ikke hypotesen prosjektet var bygget rundt, og spilleren må bevare negative funn, undersøke alternative forklaringer og skille faglig læring fra personlig status.',ACTORS[0],PLACES[3]]],
  event:[['Kalibreringsdrift oppdages sent','En instrumentkontroll viser at en del av laboratorieperioden kan være påvirket av kalibreringsdrift, og berørte prøver må spores, avgrenses og eventuelt analyseres på nytt.',ACTORS[2],PLACES[1]]],
  micro:[['Enhetsmismatch før modellkjøring','Et datasett blander to enheter i samme variabel og krever en liten, men eksplisitt korreksjon før analysen kan kjøres på nytt.',ACTORS[3],PLACES[2]]],
  followup:[['Replikasjon gir svakere effekt','Et nytt uttak eller en uavhengig analyse gir svakere effekt enn første runde og må kobles til samme forskningslogg som kontroll, ikke behandles som et separat problem.',ACTORS[3],PLACES[2]]],
  knowledge:[['History Go-kontekst blir forskningsspørsmål, ikke evidens','Natur-kunnskap fra History Go peker mot en relevant art, lokalitet eller økologisk sammenheng, men må brukes til å formulere bedre spørsmål og kontrollpunkter uten å bli behandlet som feltdata eller forskningskvalifikasjon.',ACTORS[1],PLACES[0]]],
  consequence:[['Rapporten må tåle etterprøving','Prosjektet skal levere rapport eller manus, og siste beslutning er om konklusjonen faktisk er avgrenset av metode, datakvalitet, replikasjon og usikkerhet eller om press har gjort språket sterkere enn evidensen.',ACTORS[0],PLACES[3]]]
};

const makeMail = (type, seed, index) => {
  const [subject, detail, actor, place] = seed;
  return {
    id:`biologi_forskning_${type}_${String(index+1).padStart(3,'0')}`,
    mail_type:type,
    mail_family:FAMILY[type],
    role_scope:ROLE,
    phase:index % 2 ? 'afternoon' : 'forenoon',
    priority:120 + index,
    from:actor.name,
    people_ref:actor.id,
    place_id:place.id,
    subject,
    summary:longSummary(subject,detail),
    situation:[
      `Forskningsloggen viser siste metode- og dataversjon, åpne avvik, usikkerhet, replikasjonsstatus og hvem som eier neste kontrollpunkt.`,
      `En raskere løsning kan holde felt-, lab- eller leveranseflyten oppe, men kan samtidig skjule svak datakvalitet, manglende kontroll eller en konklusjon som er sterkere enn grunnlaget.`,
      `Du må velge et grep som gjør handoff og mulig rework lesbart uten å omskrive hvilke observasjoner, prøver, analyser eller mandatgrenser som faktisk gjaldt.`
    ],
    task_domain:'biologi_okologi_og_forskning',
    competency:'metodisk_sporbar_og_reproduserbar_kunnskapsproduksjon',
    pressure:'evidens_usikkerhet_frist_og_bestillerbehov',
    choice_axis:'sporbar_avgrensning_vs_improvisert_sikkerhet',
    consequence_axis:'reproduserbar_tillit_vs_skjult_usikkerhet',
    narrative_arc:type,
    choices:[
      {id:'A',label:`Avklar ${subject.toLowerCase()} i forskningsloggen`,reply:goodReply,effect:1,tags:['sporbarhet','reproduserbarhet','usikkerhet'],feedback:goodFeedback,effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
      {id:'B',label:`Lukk ${subject.toLowerCase()} gjennom tempo og antatt sikkerhet`,reply:badReply,effect:-1,tags:['tempo','skjult_usikkerhet','overkonklusjon'],feedback:badFeedback,effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
    ]
  };
};

const oldModel = read(MODEL);
const model = {
  ...oldModel,
  core_narrative:[
    'Undersøke naturen systematisk med metode, data, kildekritikk, reproduserbarhet og eksplisitt usikkerhet.',
    'Rollen gjør naturfaglig kunnskapsproduksjon spillbar gjennom ett vedvarende forskningsspor der spørsmål, hypotese, felt- og laboratoriemetode, prøver, rådata, analyse, alternative forklaringer, avvik, replikasjon, etikk og usikkerhet kan endre konklusjonen uten at status eller bestillerpress blir evidens.'
  ],
  work_life:{
    daily_work:[
      'Versjonerer forskningsspørsmål, hypotese, metode og kriterier for hva som kan styrke eller svekke konklusjonen før datainnsamling.',
      'Fører felt- og prøvespor med lokalitet, tidspunkt, habitat, metode, kontroll og avvik gjennom samme forskningslogg.',
      'Kobler laboratoriekontroller, rådata, datasettversjon og analysevalg til eksplisitt usikkerhet og reproduserbarhet.',
      'Håndterer replikasjon, review, korrigering og rapportering uten å skjule negative eller usikre funn.'
    ],
    responsibilities:['metodekvalitet','dataintegritet','prøvesporbarhet','reproduserbarhet','forskningsetikk','eksplisitt usikkerhet'],
    work_environment:['Universitet, forskningsinstitutt, feltstasjon, laboratorium og analyse-/metodemøter der samme prosjekt beveger seg mellom innsamling, kontroll, analyse og rapportering.'],
    status_position:['Biolog og Økolog krever relevant_education_or_employer_qualification. Forsker og Seniorforsker krever academic_qualification_and_employment. History Go eller Natur-badge er læringsstøtte og kan aldri oppfylle disse kvalifikasjonsportene eller gi offentlig myndighet.'],
    workplaces:PLACES.map(p=>p.id)
  },
  career_path:{
    entry_from:['Biolog og Økolog etter dokumentert relevant_education_or_employer_qualification; Forsker og Seniorforsker etter academic_qualification_and_employment.'],
    progression_to:['Mer selvstendig metode-, prosjekt- og forskningsansvar gjennom reell kvalifikasjon, dokumentert praksis, arbeidsgiverprosess og institusjonelt mandat.'],
    possible_promotions:['Seniorforsker eller metodeansvarlig når dokumentert kompetanse og arbeidsgiver-/akademisk prosess støtter det.','Prosjekt- eller fagledelse når arbeidsgiver uttrykkelig tildeler ansvar; dette gir ikke automatisk forvaltnings- eller politisk myndighet.'],
    possible_exits:['Naturforvaltning, rådgivning eller formidling når ny rolle og nødvendige kvalifikasjoner er oppfylt.','Laboratorie-, data-, undervisnings- eller forskningsadministrativt arbeid uten at forskerstatus automatisk følger med.'],
    career_risks:['Publiserings-, finansierings- eller bestillerpress kan belønne tidlig lukking og for sterke konklusjoner.','Sunk-cost, status og eierskap til en hypotese kan gjøre negative funn eller replikasjon sosialt dyrt selv når korreksjon er faglig riktig.']
  },
  required_knowledge:{
    education_basis:['Relevant biologisk, økologisk, metodisk eller forskningsfaglig kvalifikasjon etter den faktiske stillingens krav; History Go er læringsstøtte, ikke grad, laboratoriekompetanse eller ansettelse.'],
    skills:['forskningsdesign','biologi og økologi','feltmetode','laboratoriemetode','statistikk og dataanalyse','dataintegritet','reproduserbarhet','kildekritikk','forskningsetikk','usikkerhetskommunikasjon'],
    category_knowledge:['Naturfaglig kontekst, arts- og økologikunnskap, prøvetakingslogikk, målefeil, datakvalitet, statistiske antakelser, alternative forklaringer, replikasjon og skillet mellom observasjon, analyse og konklusjon.'],
    history_go_badges:['natur'],
    place_connections:PLACES.map(p=>p.id),
    people_connections:ACTORS.map(a=>a.id),
    boundary:'History Go kan gi begreper, steder, arter og spørsmål, men kan ikke fungere som feltdata, laboratoriebevis, forskningsetisk godkjenning, grad, forskeransettelse eller bevis for en hypotese.'
  },
  authority_boundary:AUTHORITY,
  challenges:[{id:'evidens_vs_press',title:'Evidens, replikasjon og press',description:'Forskeren må la metode, data, avvik og replikasjon begrense konklusjonen selv når frist, finansiering, bestillerbehov eller personlig investering peker mot et sterkere svar.',pressure:'evidens_vs_status_frist_og_bestillerpress',affects:['quality','trust','risk']}],
  dilemmas:[{id:'hypotese_svekkes_av_data',title:'Data svekker hovedhypotesen',setup:'Nye data eller en replikasjon svekker et sentralt premiss mens prosjekt, rapport og forventninger allerede er modne.',choice_axis:'reviderbar_hypotese_vs_sunk_cost_og_status',consequence_axis:'langsiktig_faglig_tillit_vs_kortsiktig_leveransegevinst',mail_hooks:TYPES}],
  related_people:ACTORS.map((a,index)=>({
    ...a,
    fictional:true,
    fictional_scenario_actor:true,
    canonical_person_ref:null,
    function:[
      'Ingrid gjør forskningsdesign, hypoteseprøving, alternative forklaringer, usikkerhet og review konkret og krever at prosjektet kan produsere et faglig meningsfullt negativt resultat.',
      'Marius bærer feltmetode, lokalitets- og prøvespor, praktiske avvik og skiftende naturforhold og sørger for at variasjon i felt ikke blir slettet i ettertid.',
      'Leila bærer laboratoriekvalitet, prøve-ID, kontrollserier, kalibrering, mulig kontaminasjon og retten til å stoppe en prøveflyt når kvaliteten ikke er tilstrekkelig dokumentert.',
      'Noah bærer datasettversjoner, transformasjoner, manglende data, statistiske antakelser, kode-/analysevalg og reproduserbarhet mellom rådata og rapportert resultat.'
    ][index],
    authority_relation:[
      'Ingrid kan kreve tydeligere metode, motprøving og avgrensning og kan anbefale rework innen sitt mandat, men kan ikke bestille et bestemt funn, gjøre status til evidens, tildele offentlig myndighet eller la et presset prosjekt skjule negative resultater.',
      'Marius kan stoppe eller merke feltinnsamling når design, sikkerhet eller prøvespor ikke holder, men kan ikke omskrive observasjoner, erklære et økologisk funn sikkert uten analyse eller bruke feltansvar som forsknings- eller forvaltningsmyndighet uten mandat.',
      'Leila kan avvise eller holde tilbake prøver og resultater når kontroll, kalibrering eller kontaminasjon er uavklart, men kan ikke få et ønsket resultat til å bli gyldig, skjule avvik eller gjøre laboratorieansvar til myndighet over prosjektets endelige faglige konklusjon.',
      'Noah kan kreve reproduserbart dataspor, forklare statistiske begrensninger og stoppe en analyse som ikke kan spores til rådata, men kan ikke velge konklusjon for å tilfredsstille bestiller, gi forskningsetisk godkjenning eller gjøre modellprestasjon til offentlig vedtak.'
    ][index]
  })),
  related_places:PLACES
};
write(MODEL, model);

const oldGrammar = read(GRAMMAR);
const grammar = {
  ...oldGrammar,
  work_loops:LOOPS,
  authority_boundary:AUTHORITY,
  actor_grammar:ACTORS,
  place_grammar:PLACES,
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert forskningsobjekt som beholder spørsmål, hypotese, metode, felt- og prøvespor, laboratoriekontroll, rådata, datasettversjon, analysevalg, alternative forklaringer, usikkerhet, etikkstatus, avvik, replikasjon, review, ventepunkt, handoff og avgrenset rework gjennom samme kunnskapsproduksjon.',
    states:['sporsmal_definert','hypotese_registrert','metode_utkast','etikk_avklart','provetaking_planlagt','feltinnsamling','prove_mottatt','lab_kontroll','datakvalitet_kontrollert','analyse','tolkning_utkast','venter_pa_replikasjon','replikasjon','avvik_apent','rework','konklusjon_avgrenset','rapportering','publisert_eller_arkivert','gjenapnet'],
    handoff_rule:'Neste aktør overtar synlig metode- og dataversjon, prøvespor, kontroller, avvik, usikkerhet, replikasjonsstatus, ventepunkt og neste eier; en handoff kan aldri slette negative funn eller gjøre venting til godkjenning.'
  },
  rhythm_contract:{
    loop:'sporsmal -> hypotese -> metode -> felt/lab -> data -> analyse -> waiting/venting på prøve, kontroll, etikk, datavalidering eller replikasjon -> handoff -> tolkning -> review -> revisjon/rework -> rapportering -> læring',
    waiting_states:['feltvindu','proveprosessering','laboratoriekontroll','datavalidering','metodekollega','replikasjon','etikk_eller_habilitet'],
    rework_rule:'Nytt avvik, korrigert felt- eller laboratorieinformasjon, svak datakvalitet, alternativ modell, replikasjonsproblem eller review-kommentar gjenåpner bare berørt metode, prøve, datasett eller konklusjon med ny versjon og bevart endringsspor.'
  },
  knowledge_dependencies:[{id:'history_go_natur_biologi_okologi_og_stedskontekst',badge_id:'natur',use:'History Go kan forbedre forskningsspørsmål gjennom arter, steder, økologi, naturhistorie og observasjonskontekst. Natur-badge er ikke grad eller forskningskvalifikasjon, kan ikke erstatte feltdata eller laboratoriekontroll, kan ikke gi etikkgodkjenning og kan ikke gjøre en hypotese sann.'}],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Registrer spørsmål, hypotese, metode, prøvetakings- eller datagrunnlag, kontroller, alternative forklaringer, usikkerhet, etikkstatus og neste kontrollpunkt før første sterke konklusjon; marker eksplisitt hva History Go ikke beviser eller kvalifiserer deg til.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
};
write(GRAMMAR, grammar);

const manifestPath = 'data/Civication/roleModels/manifest.json';
const manifest = read(manifestPath);
if (!manifest.files.includes(MODEL)) manifest.files.push(MODEL);
manifest.files = [...new Set(manifest.files)];
write(manifestPath, manifest);

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const plan = {
  schema:'civication_mail_plan_v1',version:1,id:'natur_biologi_og_forskning_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Biologi, økologi og forskning',
  description:'Seksten steg fra første forskningsspørsmål til etterprøvbar replikasjon, avgrenset konklusjon og læring gjennom samme metode-, prøve-, data- og analysespor.',
  arc:{from:'Ny biolog, økolog eller forsker som må lære at hypotese, status og beslutningsbehov aldri er evidens.',to:'En faglig trygg naturforsker som kan holde felt, lab, data, usikkerhet, replikasjon og riktig myndighetsgrense sammen uten å skjule negative funn.',core_questions:['Hva er faktisk observert eller målt, og hva er analyse eller tolkning?','Hvilken kontroll, feilkilde eller alternativ forklaring kan endre konklusjonen?','Hva må vente, replikeres eller eskaleres før språket kan bli sterkere?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','biologi_forskning_integritetssvikt']}},
  sequence:sequenceTypes.map((type,i)=>({step:i+1,type,phase:i<3?'intro':i<10?'advanced':'mastery',step_goal:`Før ${PERSISTENT} gjennom ${type} med synlig metode, data, kontroll, usikkerhet, ventepunkt, handoff og neste eier.`,allowed_families:[FAMILY[type]],fallback_types:[]}))
};
write(PLAN, plan);

for (const type of TYPES) {
  const mails = seeds[type].map((seed,i)=>makeMail(type,seed,i));
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`,{
    schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,
    families:[{id:FAMILY[type],purpose:`Trene ${type} gjennom det versjonerte forskningssporet uten å blande metode, data, tolkning, kvalifikasjon og myndighet.`,learning_focus:['metode','dataintegritet','reproduserbarhet','usikkerhet'],mails}]
  });
}

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,SOURCE),`# Natur / Biologi og forskning — prerequisites source-first\n\n## Scope\n\nCanonical role: \`natur/natur_biologi_og_forskning\`. This package materializes the playable Career/work foundation and is **not Role World completion**. The remaining realism dimension must stay \`situated_reputation\` until a dedicated Role World PR.\n\n## Career gates\n\n- **Biolog** — \`qualification_required\` via \`relevant_education_or_employer_qualification\`.\n- **Økolog** — \`qualification_required\` via \`relevant_education_or_employer_qualification\`.\n- **Forsker (miljø/natur)** — \`qualification_required\` via \`academic_qualification_and_employment\`.\n- **Seniorforsker (miljø/natur)** — \`qualification_required\` via \`academic_qualification_and_employment\`.\n\nHistory Go and the Natur badge are learning support, not a degree, employment, laboratory proof, ethics approval or evidence that a hypothesis is true.\n\n## Playable foundation\n\nThe package keeps the existing research loops and authority boundary, then adds four bounded work actors, four work surfaces, a persistent editorial object (\`${PERSISTENT}\`), waiting/handoff/rework, a 16-step plan and **15 source mails** across all nine canonical mail types. Field and laboratory observations, dataset versions, statistical choices, negative findings, uncertainty and replication remain separately traceable.\n\n## Authority\n\nThe role may analyse data, draw scientific conclusions within competence and mandate, and report uncertainty and methodological limitations. It may not fabricate qualifications or data, hide negative or uncertain results, convert researcher status into administrative/public authority, or make political decisions.\n\n## Cross-role\n\nReadiness says \`not_required_for_rollout\`; this prerequisite package does not invent a cross-role link. Real shared work may be handed through the existing Scene Pipeline without a new shared runtime object.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. Existing Career gates, Scene Pipeline, mail machinery and audits remain canonical.\n`);

console.log(JSON.stringify({role:ROLE,actors:ACTORS.length,places:PLACES.length,mail_types:TYPES.length,total_mails:Object.values(seeds).flat().length,persistent:PERSISTENT},null,2));
