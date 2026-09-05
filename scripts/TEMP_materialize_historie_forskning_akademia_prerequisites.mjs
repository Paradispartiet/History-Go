import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const CATEGORY = 'historie';
const ROLE = 'historie_forskning_og_akademia';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const EXPECTED_LOOPS = [
  'sporsmal -> kilder -> kontekst -> metode -> analyse -> argument -> motproving -> publisering',
  'ny_kilde -> kildekritikk -> konsekvens_for_tese -> revisjon -> dokumentert_fortolkning'
];
const EXPECTED_MAY = ['produsere og vurdere historisk kunnskap'];
const EXPECTED_MAY_NOT = ['oppfinne kilder','skjule motbevis','late som tolkning er ubestridt fakta','utøve offentlig myndighet uten mandat'];

must(fs.existsSync(path.join(root, MODEL)), `${MODEL} missing`);
must(fs.existsSync(path.join(root, GRAMMAR)), `${GRAMMAR} missing`);
must(!fs.existsSync(path.join(root, PLAN)), `${PLAN} already exists`);
for (const type of TYPES) must(!fs.existsSync(path.join(root, `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`)), `${type} catalog already exists`);

const model = read(MODEL);
const grammar = read(GRAMMAR);
const manifest = read(MANIFEST);
must(model.schema === 'civication_role_model_v2' && model.category === CATEGORY && model.role_scope === ROLE && model.role_id === ROLE, 'wrong role model identity');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.category === CATEGORY && grammar.role_scope === ROLE && grammar.role_id === ROLE, 'wrong work grammar identity');
must(JSON.stringify(grammar.work_loops) === JSON.stringify(EXPECTED_LOOPS), 'work loops drifted');
must(JSON.stringify(grammar.authority_boundary?.may) === JSON.stringify(EXPECTED_MAY), 'authority may drifted');
must(JSON.stringify(grammar.authority_boundary?.may_not) === JSON.stringify(EXPECTED_MAY_NOT), 'authority may_not drifted');
must(grammar.practice_stories?.length === 5 && grammar.task_families?.length === 6 && grammar.quality_axes?.length === 6, 'research editorial grammar changed');
must(!grammar.actor_grammar && !grammar.place_grammar && !grammar.persistent_work_object_contract, 'research grammar already deepened');
must(!manifest.files.includes(MODEL), 'aggregate research role model already registered');

const actors = [
  {
    id: 'elin_hovedveileder_historie_forskning_og_akademia', name: 'Elin', role: 'hovedveileder og seniorforsker', fictional: true, fictional_scenario_actor: true, canonical_person_ref: null,
    function: 'Elin gjør veiledningens faglige og institusjonelle ramme konkret. Hun utfordrer forskningsspørsmål, avgrensning, metode, historiografisk posisjon og argumentstyrke, og hun kan kreve at motbevis og usikkerhet behandles før manus går videre. Hun representerer kompetent motlesning, ikke en maskin som produserer et bestemt funn.',
    authority_relation: 'Elin kan gi veiledningsråd, kreve tydeligere begrunnelse og innen sitt mandat anbefale at et arbeid avgrenses eller revideres. Hun kan ikke diktere hva kildene skal vise, gjøre History Go til grad eller kvalifikasjon, tildele ansettelse eller akademisk rang, eller bruke veilederstatus til å skjule motbevis.',
    workplace_ids: ['forskningsdesign_og_sporsmalsbord']
  },
  {
    id: 'joakim_arkivar_historie_forskning_og_akademia', name: 'Joakim', role: 'arkivar og kildeforvalter', fictional: true, fictional_scenario_actor: true, canonical_person_ref: null,
    function: 'Joakim bærer kildeproveniens, arkivstruktur, tilgangsbegrensninger og kunnskap om hva materialet faktisk representerer. Han gjør det synlig når et arkiv er fragmentert, når en aktørgruppe dominerer bevaringen, eller når fravær i materialet må behandles som et kildekritisk problem i stedet for som bevis på fravær i fortiden.',
    authority_relation: 'Joakim kan avklare proveniens, tilgang, metadata og kildekontekst og kan stoppe en ubegrunnet påstand om hva et dokument er. Han kan ikke avgjøre den historiske tolkningen, gi etikkgodkjenning, ansette forskeren eller gjøre arkivtilgang til automatisk autentisering av enhver påstand som bygges på materialet.',
    workplace_ids: ['arkiv_og_kildespor']
  },
  {
    id: 'sara_fagfelle_historie_forskning_og_akademia', name: 'Sara', role: 'fagfelle og metodekollega', fictional: true, fictional_scenario_actor: true, canonical_person_ref: null,
    function: 'Sara fungerer som en selvstendig fagfelle som prøver argumentet mot rivalforklaringer, motbevis, historiografi og presis bruk av begreper. Hun gjør review til en konkret arbeidsprosess der kritikk må klassifiseres, besvares og eventuelt føre til avgrenset rework, uten at fagfelleprestisje i seg selv blir sannhetskriterium.',
    authority_relation: 'Sara kan kreve at svakheter, alternative forklaringer og uavklarte premisser adresseres i et review- eller kollegialt kontrollpunkt. Hun kan ikke gi ansettelse, offentlig vedtaksmyndighet, forskningsetisk godkjenning eller automatisk publiseringsaksept, og hun kan heller ikke bestemme konklusjonen uten faglig begrunnelse.',
    workplace_ids: ['analyse_og_motprovingsflate','fagfelle_og_publiseringsflate']
  },
  {
    id: 'malin_forskningsadministrator_historie_forskning_og_akademia', name: 'Malin', role: 'forskningsadministrator og prosjektgrensesnitt', fictional: true, fictional_scenario_actor: true, canonical_person_ref: null,
    function: 'Malin gjør finansiering, prosjektfrister, dokumentasjonskrav, etikk- og personvernporter og institusjonelle leveranser synlige som reelle rammer rundt forskning. Hun hjelper forskeren å skille mellom hva prosjektet må dokumentere for å være styrbart, og hva som fortsatt bare kan avgjøres gjennom kilder, metode og faglig vurdering.',
    authority_relation: 'Malin kan kreve korrekt prosjektstatus, budsjett- og leveransedokumentasjon og at nødvendige etikk- eller personvernporter faktisk er avklart før arbeid går videre. Hun kan ikke kjøpe eller bestille en historisk konklusjon, gi forskningsetisk godkjenning på egen hånd, utnevne forskeren eller gjøre finansieringsbehov til evidens.',
    workplace_ids: ['forskningsdesign_og_sporsmalsbord','fagfelle_og_publiseringsflate']
  }
];

const places = [
  { id:'forskningsdesign_og_sporsmalsbord', name:'Forskningsdesign- og spørsmålsbordet', function:'Her versjoneres forskningsspørsmål, avgrensning, hypotese, kildeplan, metode, etikkstatus, kompetansebehov og eksplisitte kriterier for hva som kan styrke eller svekke argumentet før analysen lukkes.' },
  { id:'arkiv_og_kildespor', name:'Arkiv- og kildesporet', function:'Her registreres proveniens, arkivstruktur, tilgang, representasjon, fravær, kildekritiske merknader og hvilke deler av materialet som fortsatt venter på kontroll eller ikke kan nås.' },
  { id:'analyse_og_motprovingsflate', name:'Analyse- og motprøvingsflaten', function:'Her kobles kildeutdrag, metodevalg, historiografi, rivalforklaringer, motbevis og usikkerhet til konkrete påstander slik at en tese kan revideres uten at tidligere spor forsvinner.' },
  { id:'fagfelle_og_publiseringsflate', name:'Fagfelle- og publiseringsflaten', function:'Her følger manusversjon, review-kommentarer, svar, revisjon, siteringskontroll, etikk- og rettighetsstatus og publiseringsbeslutning den samme arbeidskjeden fram til aksept, avslag eller gjenåpning.' }
];

Object.assign(grammar, {
  actor_grammar: actors.map(({id,name,role,workplace_ids}) => ({id,name,role,workplace_ids})),
  place_grammar: places,
  persistent_work_object_contract: {
    id: 'forskningslogg_og_manusspor',
    description: 'Et vedvarende, versjonert forskningsobjekt som beholder spørsmål, hypotese, kildeliste og proveniens, arkivhull, metode, historiografi, motbevis, usikkerhet, etikkstatus, veilednings- og fagfellekommentarer, ventepunkt, handoff, manusversjon og avgrenset rework gjennom samme kunnskapsproduksjon.',
    states: ['sporsmal_definert','kildesok','kildegrunnlag_avgrenset','under_analyse','venter_pa_kilde_eller_avklaring','under_motproving','manusutkast','under_fagfellevurdering','revisjon','publiseringsklart','publisert','gjenapnet'],
    handoff_rule: 'Neste aktør overtar synlig manus- og loggversjon, kildeproveniens, metodevalg, motbevis, usikkerhet, etikkstatus, uløste review-kommentarer og neste eier; en handoff kan aldri slette tidligere kildespor eller gjøre venting til godkjenning.'
  },
  rhythm_contract: {
    loop: 'sporsmal -> kildesok -> kildekritikk -> analyse -> motproving -> waiting/venting på kilde, tilgang, veiledning, etikk eller review -> handoff -> skriving -> fagfellevurdering -> revisjon/rework -> publisering -> læring',
    waiting_states: ['kildetilgang','veiledningsavklaring','etikk_eller_personvern','fagfellevurdering','finansiering_eller_ressursavklaring'],
    rework_rule: 'Ny kilde, motbevis, fagfellekritikk, etikkproblem eller korrigert sitering gjenåpner bare berørt påstand eller seksjon med ny versjon, eksplisitt eier og bevart endringsspor.'
  },
  knowledge_dependencies: [{
    id: 'history_go_historie_kildekritikk_historiografi_og_kontekst', badge_id: 'historie',
    use: 'History Go kan forbedre spørsmål gjennom kildekritikk, historiografi, kontekst, arkivets stillhet og rivalforklaringer. Et Badge er ikke en grad og er ikke kvalifikasjon for `qualification_required`; det kan ikke autentisere en kilde, kan ikke gi etikk- eller personverngodkjenning, kan ikke avgjøre et historisk funn, tildele finansiering, ansettelse, akademisk rang eller publiseringsaksept.'
  }],
  day_one_contract: {
    entry: 'qualification_required', first_object: 'forskningslogg_og_manusspor',
    first_task: 'Registrer forskningsspørsmål, avgrensning, foreløpig kildekart og proveniens, metode, historiografisk posisjon, motbevis/alternativ forklaring, usikkerhet, etikkstatus og neste kontrollpunkt; marker eksplisitt hva History Go ikke beviser eller kvalifiserer deg til.'
  },
  mail_generation_contract: { required_mail_types: TYPES, role_scope: ROLE, no_generic_fallback: true }
});
write(GRAMMAR, grammar);

Object.assign(model, {
  core_narrative: [
    model.core_narrative[0],
    'Rollen bygger én etterprøvbar forskningslogg og manuslinje der kildeproveniens, metode, historiografi, motbevis, usikkerhet, veiledning, fagfellekritikk og revisjon kan følges uten at akademisk status, finansieringspress eller publiseringstempo blir erstatning for evidens.'
  ],
  work_life: {
    daily_work: ['Formulerer og versjonerer forskningsspørsmål før kildesøk og analyse.','Fører kildespor, proveniens, arkivhull og kildekritiske merknader gjennom samme forskningslogg.','Prøver tese og argument mot motbevis, rivalforklaringer og historiografiske posisjoner før manus låses.','Håndterer veiledning, fagfellekritikk, revisjon og publisering med eksplisitt usikkerhet og korrigerbart endringsspor.'],
    responsibilities: ['historisk metode og kildekritikk','kildeproveniens og dokumenterbar argumentasjon','forskningsetikk og korrekt usikkerhet','fagfelleprosess, revisjon og korrigering'],
    work_environment: ['Arbeidet veksler mellom universitet/forskningsinstitutt, arkiv/bibliotek, analyseflate og fagfelle-/publiseringsgrensesnitt.'],
    status_position: ['Akademisk standing kan gi oppmerksomhet og ansvar, men gir aldri ekstra evidens, grad, ansettelse, etikkgodkjenning eller offentlig vedtaksmyndighet.'],
    workplaces: places.map((place) => place.id)
  },
  career_path: {
    entry_from: ['Relevant formell kvalifikasjon, opptak eller arbeidsgiveransettelse etter gjeldende `qualification_required`-kontrakt; History Go-badge alene er verken grad, forskerkompetanse eller ansettelse.'],
    progression_to: ['Fra doktorgradsarbeid til forsker- og seniorforskeransvar gjennom reell kvalifikasjon, dokumentert forskningsarbeid og arbeidsgiver-/akademiske prosesser; progresjon skaper ikke automatisk linje- eller offentlig myndighet.'],
    possible_promotions: ['Forskerstilling når kvalifikasjon, arbeidsgiverprosess og relevant forskningspraksis er oppfylt.','Seniorforsker eller tilsvarende faglig ansvar når dokumentert kompetanse og institusjonell prosess støtter det.'],
    possible_exits: ['Arkiv-, museum-, kulturarv- eller dokumentasjonsarbeid der historisk metode brukes uten forskerstilling.','Forskningsadministrasjon, utredning, rådgivning, undervisning eller formidling uten at forskerstatus automatisk følger med.'],
    career_risks: ['Publiserings- og finansieringspress kan belønne tidlig lukking, tese-lojalitet eller selektiv kildebruk.','Midlertidighet, statusangst og sunk-cost i et prosjekt kan gjøre korreksjon og avgrensning sosialt dyrt selv når det er faglig riktig.']
  },
  required_knowledge: {
    education_basis: ['Relevant historiefaglig og metodisk kvalifikasjon som tilfredsstiller den faktiske stillingens eller doktorgradsløpets krav; History Go er læringsstøtte, ikke en grad eller erstatning for kvalifikasjon.'],
    skills: ['historisk metode','kildekritikk','historiografi','akademisk argumentasjon','forskningsetikk','akademisk skriving','fagfellehåndtering','proveniens- og siteringskontroll'],
    category_knowledge: ['Historisk kontekst, kildeproveniens, arkivets seleksjon og fravær, metodiske rivaler, historiografiske tradisjoner, eksplisitt usikkerhet og forskjellen mellom analytisk tolkning og dokumentert fakta.'],
    history_go_badges: ['historie'],
    place_connections: places.map((place) => place.id),
    people_connections: actors.map((actor) => actor.id),
    boundary: 'History Go er ikke en grad og er ikke kvalifikasjon. Det kan ikke autentisere kilder, kan ikke gi etikkgodkjenning eller forskeransettelse, og kan ikke avgjøre et historisk funn eller sikre publisering.'
  },
  authority_boundary: { may: EXPECTED_MAY, may_not: EXPECTED_MAY_NOT },
  challenges: [{
    id:'tese_kilder_og_publiseringspress', title:'Tese, kilder og publiseringspress',
    description:'Forskeren må holde spørsmål, metode, motbevis og usikkerhet åpne lenge nok til at argumentet faktisk kan prøves, også når veileder-, finansierings- eller publiseringspress gjør en skarpere fortelling sosialt attraktiv.',
    pressure:'tese_og_publisering_vs_sporbart_kildegrunnlag', affects:['quality','trust','risk']
  }],
  dilemmas: [{
    id:'ny_kilde_svekker_hovedtese', title:'Ny kilde svekker hovedtesen', setup:'En ny kildegruppe undergraver et sentralt premiss mens manus og frist allerede er modne.',
    choice_axis:'reviderbar_tese_vs_sunk_cost_og_status', consequence_axis:'langsiktig_faglig_tillit_vs_kortsiktig_publiseringsgevinst', mail_hooks:TYPES
  }],
  related_people: actors,
  related_places: places,
  mail_integration: { role_scope:ROLE, mail_profile:ROLE, can_feed_mail_types:TYPES, recommended_mail_families:TYPES.map((type) => `${ROLE}_${type}`) }
});
write(MODEL, model);

manifest.files.push(MODEL);
write(MANIFEST, manifest);

const familyIds = {
  job: `${ROLE}_forskningsarbeid`,
  people: `${ROLE}_profesjonelle_relasjoner`,
  conflict: `${ROLE}_konklusjons_og_finansieringspress`,
  story: `${ROLE}_forskeridentitet`,
  event: `${ROLE}_ny_kilde`,
  micro: `${ROLE}_rask_provenienssjekk`,
  followup: `${ROLE}_fagfelle_revisjon`,
  knowledge: `${ROLE}_history_go_kildekritikk`,
  consequence: `${ROLE}_publiseringsetterspill`
};

const stepTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const plan = {
  schema:'civication_mail_plan_v1', version:1, id:`${ROLE}_foundation_v1`, category:CATEGORY, role_scope:ROLE, title:'Historisk forskning og akademia',
  description:'Seksten steg fra forskningsspørsmål og kildekart til motprøving, fagfellevurdering, revisjon, publisering og korrigerbart etterspill i samme forskningslogg og manusspor.',
  arc:{
    from:'Kvalifisert forsker eller doktorgradsstudent som arver et spørsmål, et ujevnt kildelandskap og press om å gjøre en foreløpig tese publiserbar.',
    to:'Forsker som kan føre spørsmål, kilder, metode, motbevis, review, revisjon og publisering sporbar uten å gjøre status, finansiering eller History Go til evidens eller kvalifikasjon.',
    core_questions:['Hva støtter kildene faktisk, og hva er fortsatt tolkning eller usikkerhet?','Hvilke motbevis, arkivhull og rivalforklaringer må bli stående gjennom manus og review?','Når skal en ny kilde, fagfellekritikk eller etikkfeil gjenåpne bare den berørte delen av arbeidet?']
  },
  outcome_rules:{
    promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},
    fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},
    stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated',`${ROLE}_metode_og_publiseringssvikt`]}
  },
  sequence: stepTypes.map((type,index) => ({
    step:index+1, type, phase:index<3?'intro':index<10?'advanced':'mastery',
    step_goal:`Føre forskningslogg og manusspor gjennom ${type} med synlig kildegrunnlag, metode, usikkerhet, ventepunkt, review-status og neste eier.`,
    allowed_families:[familyIds[type]], fallback_types:[]
  }))
};
write(PLAN, plan);

const mailSpecs = {
  job: [
    ['motbevis_001','Elin',actors[0].id,places[2].id,'En ny kilde svekker hovedtesen','En ny kildegruppe motsier premisset som bærer manusets hovedargument.'],
    ['fragmentert_arkiv_002','Joakim',actors[1].id,places[1].id,'Arkivet overrepresenterer én aktørgruppe','Kildelandskapet er rikt for institusjonens ledelse, men fragmentert for menneskene som ble berørt av beslutningene.'],
    ['publiseringsfrist_003','Malin',actors[3].id,places[3].id,'Manusfristen kommer før den sentrale kildegruppen er kontrollert','Prosjektplanen forventer innsending før en kildegruppe som kan endre argumentstyrken er ferdig kontrollert.'],
    ['review_rework_004','Sara',actors[2].id,places[3].id,'Fagfellen krever en avgrenset revisjon av hovedargumentet','Reviewet peker på en rivalforklaring som ikke krever at alt starter på nytt, men som treffer to sentrale avsnitt og deres kildebruk.']
  ],
  people: [
    ['veiledning_001','Elin',actors[0].id,places[0].id,'Veilederen utfordrer om forskningsspørsmålet er for bredt','Elin ber deg skille mellom et interessant tema og et forskbart spørsmål med kilde- og metodekrav som faktisk kan prøves.'],
    ['arkivar_002','Joakim',actors[1].id,places[1].id,'Arkivaren varsler et proveniens- og tilgangshull','Joakim viser at materialet kommer fra ulike arkivserier med ulik bevaringslogikk og at ett sentralt hull ikke kan fylles med antakelse.'],
    ['fagfelle_003','Sara',actors[2].id,places[2].id,'En fagfelle løfter en rivalforklaring du ikke har behandlet','Sara mener argumentet kan stå, men bare dersom en plausibel alternativ forklaring testes eksplisitt mot de samme kildene.'],
    ['administrasjon_004','Malin',actors[3].id,places[0].id,'Prosjektgrensesnittet trenger et ærlig bilde av etikk og leveranse','Malin trenger dokumenterbar status på frist, etikk/personvern og ressursbehov, men skal ikke få en pyntet faglig konklusjon som styringsrapport.']
  ],
  conflict:[['press_001','Malin',actors[3].id,places[3].id,'Finansierings- og publiseringspress trekker konklusjonen lenger enn evidensen','En institusjonell leveranse ønsker en tydeligere konklusjon enn kildene tåler, og den skarpere formuleringen vil gjøre både rapportering og publisering enklere.']],
  story:[['identitet_001','Elin',actors[0].id,places[0].id,'Du har investert så mye i tesen at revisjon kjennes som nederlag','Arbeidet har blitt en del av forskeridentiteten, og en nødvendig avgrensning oppleves sosialt som tap av status selv om den styrker metode og argument.']],
  event:[['nytt_arkiv_001','Joakim',actors[1].id,places[1].id,'Et nyåpnet arkiv endrer premisset midt i analysen','Nytt materiale blir tilgjengelig etter at flere kapitler allerede er skrevet og berører en konkret årsaksforklaring i stedet for hele prosjektet.']],
  micro:[['proveniens_001','Joakim',actors[1].id,places[1].id,'En sitert kilde har uklar proveniens før neste handoff','En fotnote ser korrekt ut, men loggen viser at dokumentets serie, versjon og kontekst ikke er verifisert før teksten sendes videre.']],
  followup:[['revisjon_001','Sara',actors[2].id,places[3].id,'Fagfellekommentarene må bli sporbar, bounded rework','Reviewrunden er tilbake med én alvorlig metodeinnvending, to mindre kildepunkter og flere forslag som ikke trenger å aksepteres dersom svaret dokumenteres.']],
  knowledge:[['history_go_001','Elin',actors[0].id,places[0].id,'Bruk History Go til bedre kildekritiske spørsmål, ikke som forskerkvalifikasjon','Historie-kunnskap kan skjerpe spørsmål om kontekst, historiografi, arkivets stillhet og rivalforklaringer, men den kan ikke erstatte grad, kvalifikasjon, kildeautentisering eller fagfelleprosess.']],
  consequence:[['publisering_001','Sara',actors[2].id,places[3].id,'Publiseringsetterspillet viser hva som faktisk ble bevart','Manusets skjebne avhenger ikke bare av tempo, men av om motbevis, usikkerhet, review og korrigering er dokumentert slik at resultatet kan forsvares eller gjenåpnes.']]
};

function makeMail(type, spec, priority) {
  const [slug, from, peopleRef, placeId, subject, trigger] = spec;
  const isKnowledge = type === 'knowledge';
  const summary = `Forskningsloggen og manussporet står i et konkret ${type}-punkt: ${trigger} Du må oppdatere det vedvarende arbeidsobjektet slik at forskningsspørsmål, kildespor/proveniens, metode, historiografisk posisjon, motbevis, eksplisitt usikkerhet, etikkstatus, venting, review og neste eier fortsatt kan rekonstrueres. En rask eller prestisjevennlig lukking er ikke nok: akademisk status, finansieringsbehov, publiseringstempo og History Go kan ikke produsere evidens eller erstatte kvalifikasjon. ${isKnowledge ? 'History Go kan brukes til å formulere bedre kildekritiske og historiografiske spørsmål, men `qualification_required` består uendret og ingen kilde, etikkport, ansettelse eller publisering blir godkjent av et badge.' : 'Valget må derfor skille det kildene støtter fra institusjonelle ønsker og bare gjenåpne den delen av argumentet som det nye premisset faktisk berører.'}`;
  return {
    id:`${ROLE}_${type}_${slug}`, mail_type:type, mail_family:familyIds[type], role_scope:ROLE,
    phase:type==='job'?'workday':type==='people'?'workday':type==='knowledge'?'forenoon':'advanced', priority, from, people_ref:peopleRef, place_id:placeId, subject, summary,
    situation:[
      'Forskningsloggen viser gjeldende spørsmål/manusversjon, kildegrunnlag, metode, motbevis, usikkerhet og hva som fortsatt venter på kilde, review, etikk eller avklaring.',
      'En sosialt enkel løsning kan gi raskere fremdrift, men vil gjøre det vanskeligere å se om konklusjonen faktisk følger kildene eller bare prosjektets forventninger.',
      'Du må velge et grep som bevarer proveniens, kvalifikasjons- og myndighetsgrenser og en tydelig handoff/rework-regel for neste aktør.'
    ],
    task_domain:'historisk_forskning_og_akademia', competency:'sporbar_kildekritikk_metode_og_revisjon', pressure:'tese_publisering_og_status_vs_kilder_metode_og_usikkerhet',
    choice_axis:'sporbar_revisjon_vs_prestisjevennlig_lukking', consequence_axis:'faglig_tillit_og_korrigerbarhet_vs_skjult_metode_og_kilderisiko', narrative_arc:slug.replace(/_\d+$/,''),
    choices:[
      { id:'A', label:'Bevar kildespor og revider avgrenset', reply:'Jeg holder motbevis, usikkerhet og nåværende versjon synlig, avklarer hva som faktisk må endres, og sender bare den berørte delen videre med kildegrunnlag, begrunnelse og nytt kontrollpunkt.', effect:1, tags:['kildekritikk','sporbarhet','motbevis','revisjon'], feedback:'Arbeidet kan ta mer tid eller få en svakere overskrift, men neste aktør kan se hvorfor argumentstyrken er valgt, hvilke kilder som bærer den og hva som fortsatt er åpent. Det beskytter både forskningsetikken og muligheten for senere korreksjon.', effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}} },
      { id:'B', label:'Lukk punktet for å beskytte tese og frist', reply:'Jeg lar den eksisterende tesen og leveransefristen styre, toner ned motbevis eller usikkerhet og sender teksten videre uten å dokumentere hele grunnlaget for hvorfor punktet egentlig burde vært gjenåpnet.', effect:-1, tags:['tese_lasing','skjult_motbevis','publiseringspress','risiko'], feedback:'Manuset ser mer ferdig ut lokalt, men forskningsloggen mister skillet mellom evidens og prosjektbehov. Review, senere kilder eller en etikk-/siteringskontroll kan da gjøre både argumentet og arbeidsprosessen vanskeligere å forsvare.', effects:{stats:{status:1,quality:-2,trust:-2,risk:3}} }
    ]
  };
}

let priority = 140;
for (const type of TYPES) {
  const mails = mailSpecs[type].map((spec) => makeMail(type, spec, priority--));
  const catalog = {
    schema:'civication_mail_family_catalog_v1', version:1, category:CATEGORY, role_scope:ROLE, mail_type:type,
    families:[{ id:familyIds[type], purpose:`Trene ${type} gjennom forskningsloggen og manussporet med kilde-, metode-, kvalifikasjons- og revisjonsgrenser.`, learning_focus:['kildekritikk','metode','sporbarhet','forskningsetikk'], mails }]
  };
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`, catalog);
}

console.log(`Materialized ${ROLE} prerequisites: 4 actors / 4 places / 16-step plan / 15 mails / qualification_required preserved`);
