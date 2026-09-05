import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`ADVISORY_ROLE_WORLD_PRECHECK: ${message}`); };

const CATEGORY = 'historie';
const ROLE = 'historie_forvaltning_og_radgivning';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD_PATH = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL_PATH = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR_PATH = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN_PATH = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root, WORLD_PATH)), `${WORLD_PATH} already exists`);
const model = read(MODEL_PATH);
const grammar = read(GRAMMAR_PATH);
const plan = read(PLAN_PATH);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, '16-step prerequisite plan drifted');
must(grammar.persistent_work_object_contract?.id === 'saksgrunnlag_og_radgivningsspor', 'persistent advisory object drifted');
must(grammar.day_one_contract?.entry === 'direct', 'direct career entry drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify([
  'problem -> mandat -> kilder -> alternativer -> vurdering -> råd -> dokumentasjon',
  'ny informasjon -> konsekvensanalyse -> revisjon -> kvalitetssikring -> nytt beslutningsgrunnlag'
]), 'canonical advisory loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify({
  may:['utrede og gi råd innen mandat'],
  may_not:['fatte vedtak uten myndighet','skjule vesentlige motargumenter','forfalske sikkerhet','erstatte regelverk med preferanse']
}), 'canonical advisory authority boundary drifted');
must(career?.status === 'playable' && career?.audit?.runtime_gate === true && career?.audit?.missing_components?.length === 0, 'career foundation no longer playable');
must(career.audit.salary.rows.length === 5 && career.audit.salary.rows.every((row) => row.offer_policy === 'direct'), 'direct offer policy drifted');
must(model.related_people?.length === 4 && model.related_people.every((person) => person.fictional === true && person.fictional_scenario_actor === true && person.canonical_person_ref === null), 'fictional People foundation drifted');

const sourceRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  must(doc.category === CATEGORY && doc.role_scope === ROLE && doc.mail_type === type, `${type} catalog identity drifted`);
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(sourceRefs.length === 15 && new Set(sourceRefs).size === 15, `expected 15 unique canonical source mails, got ${sourceRefs.length}`);
const knowledgeRef = sourceRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef, 'knowledge provenance missing');

const themes = ['professional_culture','bureaucratic_power','loyalty_up_down','local_knowledge_vs_system','status_anxiety','invisible_work','shame_reputation','public_private_leakage','class_power','public_attention'];
const themeBank = read('data/Civication/roleWorldThemeBank.json');
const themeSet = new Set((themeBank.themes || []).map((theme) => theme.id));
for (const theme of themes) must(themeSet.has(theme), `unknown theme ${theme}`);
must(!themeBank.reference_profiles?.[KEY], `${KEY} already registered in theme bank`);

const audiences = [
  {
    id:'senior_advisers_and_quality_leads',
    standing_axis:'reasoning_quality_calibrated_certainty_and_correction',
    cares_about:['at fakta, vurdering, alternativer, motargumenter og råd er skilt tydelig nok til at en annen rådgiver kan etterprøve hvordan konklusjonsstyrken ble valgt','at kvalitetssikring faktisk kan endre eller avgrense et råd når kilder, usikkerhet eller konsekvenser gjør det nødvendig, også når senioritet og frist trekker mot rask lukking'],
    cannot_grant:'God standing hos seniorrådgivere og kvalitetsledere kan ikke skape hjemmel, gi delegert beslutningsmyndighet, fatte et vedtak, autentisere en kilde, utnevne spilleren til en annen stilling eller gjøre en anbefaling riktig bare fordi en erfaren kollega liker den.'
  },
  {
    id:'legal_authority_and_mandate_stewards',
    standing_axis:'mandate_legal_basis_delegation_and_escalation_discipline',
    cares_about:['at mandat, beslutningseier, delegasjonsstatus og åpne hjemmelsspørsmål er eksplisitte før rådet behandles som handlingsklart','at juridisk eller myndighetsmessig usikkerhet eskaleres til riktig funksjon i stedet for å bli skjult i faglig språk, historisk analogi eller sosial trygghet'],
    cannot_grant:'God standing hos hjemmels-, regelverks- eller mandatforvaltere kan ikke i seg selv skape hjemmel, delegere myndighet, fatte vedtak eller gjøre en ønsket løsning lovlig; den kan heller ikke gi History Go eller en Badge formell beslutningskompetanse.'
  },
  {
    id:'documentation_and_records_stewards',
    standing_axis:'provenance_versioning_records_and_handoff_reliability',
    cares_about:['at kilder, proveniens, versjoner, innspill, kunnskapshull og hvem som vurderte hva kan rekonstrueres gjennom samme saksgrunnlag','at journalføring og dokumentasjon bevarer uenighet og korrigering uten å bli behandlet som automatisk kildeautentisering eller bevis på at en vurdering er sann'],
    cannot_grant:'God standing hos dokumentasjons- og journalføringsfunksjoner kan ikke autentisere enhver påstand, avgjøre faglig eller rettslig uenighet, skape hjemmel, gi delegasjon, fatte vedtak, ansette spilleren eller tildele budsjett- og ressursmyndighet.'
  },
  {
    id:'commissioners_and_decision_owners',
    standing_axis:'usefulness_scope_timeliness_and_decision_owner_clarity',
    cares_about:['at rådet faktisk svarer på bestillingen, er tidsmessig anvendelig og gjør alternativer, risiko og åpne spørsmål lesbare for den som eier beslutningen','at rådgiveren kan avgrense omfang under frist uten å late som ukontrollerte forhold er avklart eller presentere bestillerens preferanse som faglig nødvendighet'],
    cannot_grant:'God standing hos bestillere og beslutningseiere kan påvirke hvilke oppdrag spilleren får, men kan ikke gjøre en bestilling til evidens, skape hjemmel, delegere myndighet uten riktig prosess, autentisere kilder eller gjøre rådgiverens tekst til selve vedtaket.'
  },
  {
    id:'affected_stakeholders_and_hearing_voices',
    standing_axis:'material_objections_affected_perspectives_and_consequence_visibility',
    cares_about:['at vesentlige motargumenter, høringsinnspill og berørte perspektiver forblir synlige i beslutningsgrunnlaget selv når de kompliserer den foretrukne løsningen','at historisk kontekst og institusjonell hukommelse ikke brukes til å snakke på vegne av dagens berørte aktører eller gjøre eldre kategorier til erstatning for aktuelle innspill'],
    cannot_grant:'God standing hos berørte aktører eller høringsstemmer kan ikke alene fatte vedtak, skape hjemmel, delegere myndighet, autentisere en kilde eller gi budsjettmyndighet; den kan heller ikke gjøre ett innspill representativt for alle som påvirkes.'
  },
  {
    id:'peer_advisers_and_cross_function_partners',
    standing_axis:'professional_independence_workload_handoff_and_bounded_rework_fairness',
    cares_about:['at usynlig kildearbeid, kontroll, koordinering og rework får synlig eier og ikke skyves nedover i hierarkiet fordi en frist eller sterk bestiller gjør det sosialt enklere','at handoff mellom fagfunksjoner bevarer mandat, kilder, motargumenter, usikkerhet og neste kontrollpunkt slik at kollegial lojalitet ikke blir skjult metode'],
    cannot_grant:'God standing hos kolleger og tverrfaglige partnere kan ikke gi formell delegasjon, hjemmel, vedtaksmyndighet, ansettelse, budsjettmyndighet eller kildeautentisering, og kollegial enighet kan ikke oppheve et dokumentert motargument eller en åpen formell port.'
  },
  {
    id:'institutional_leaders_and_future_employers',
    standing_axis:'long_run_judgment_independence_correction_and_portfolio_trust',
    cares_about:['at rådgiveren over tid viser dømmekraft under press, korrigerer dokumentert feil og kan skille institusjonell lojalitet fra plikten til å synliggjøre usikkerhet og motargumenter','at karriereomdømme bygger på sporbar kvalitet og ansvarlig handoff fremfor på hvor ofte spilleren produserer den konklusjonen mektige aktører helst vil høre'],
    cannot_grant:'God profesjonell standing eller et sterkt omdømme kan ikke automatisk utnevne eller ansette spilleren, skape hjemmel, gi delegert beslutningsmyndighet, fatte vedtak, tildele budsjett eller gjøre History Go og en Badge til formell offentlig myndighet.'
  },
  {
    id:'private_relations',
    standing_axis:'recovery_confidentiality_identity_and_institutional_boundary',
    cares_about:['at spilleren kan bære uenighet, tidsfrist og statuspress uten å gjøre rollen eller nærheten til beslutningstakere til hele sin private egenverdi','at fortrolige saksopplysninger, interne vurderinger, personopplysninger og ikke-offentlige konflikter ikke tas med hjem for å vinne støtte eller omskrive hvem som hadde rett'],
    cannot_grant:'Nære relasjoner kan gi støtte, perspektiv og restitusjon, men kan ikke gi hjemmel, delegasjon, vedtaksmyndighet, kildeautentisering, ansettelse, budsjettmyndighet eller gjøre en historisk analogi eller History Go-Badge til beslutningsgrunnlag.'
  }
];
const audienceCycle = audiences.map((audience) => audience.id);
const audienceById = new Map(audiences.map((audience) => [audience.id, audience]));

const people = [
  {
    id:'ingrid_quality_world',
    social_function:'Ingrid gjør faglig kvalitetssikring til en sosialt krevende praksis: hun spør ikke bare om rådet er elegant, men om kilder, motargumenter, alternativer og usikkerhet faktisk bærer styrken i formuleringen.',
    class_position:'Seniorrådgiver med høy profesjonell kapital og påvirkning på kvalitetsnormer, men uten automatisk vedtaksmyndighet.',
    status:'Hennes standing gjelder etterprøvbarhet, korreksjonsvilje og evnen til å levere anvendelig råd uten falsk sikkerhet.',
    power_over_player:'Hun kan kreve ny kvalitetssikring, skarpere begrunnelse og synligere alternativer før handoff, men kan ikke skape hjemmel, delegere myndighet eller fatte vedtak gjennom senioritet.',
    wants:'At rådet er kort nok til å brukes og samtidig komplett nok til at en beslutningseier ser hva som er fakta, vurdering, usikkerhet og anbefaling.',
    conceals:'Hun kjenner institusjonens forventning om raske og tydelige råd og kan derfor selv undervurdere hvor lett profesjonell sikkerhet glir over i sosialt belønnet overstatement.',
    speech_style:'Konsentrert og presis; spør hva som er dokumentert, hva som er vurdering, hvilken innvending som er sterkest og hvilken setning som må nedjusteres.',
    teaches_player:'At faglig autoritet er mest pålitelig når den tåler synlig korrigering og ikke trenger å late som råd er vedtak.'
  },
  {
    id:'jonas_mandate_world',
    social_function:'Jonas gjør hjemmel, delegasjon og mandat til konkrete porter i stedet for juridisk dekorasjon. Han tester om rådgiveren vet hva som kan utredes nå og hva som må avklares av riktig myndighetsfunksjon.',
    class_position:'Regelverks- og hjemmelskontakt med prosessmakt over avklaring og eskalering, men uten universell rett til å bestemme saken.',
    status:'Hans standing gjelder presis mandatforståelse, riktig eskalering og disiplin i skillet mellom ønskelig løsning og myndighet til å gjennomføre den.',
    power_over_player:'Han kan stoppe en falsk hjemmelsantakelse og kreve avklaring, men kan ikke skape hjemmel gjennom kollegial enighet eller gjøre et faglig råd til formell beslutning.',
    wants:'At åpne hjemmelsspørsmål, delegasjonsstatus og faktisk beslutningseier står synlig før saken går videre.',
    conceals:'Formelt språk kan gi inntrykk av større sikkerhet enn den konkrete avklaringen bærer, og også hans rolle kan bli brukt sosialt som et autoritetsstempel.',
    speech_style:'Nøktern og avgrensende; spør hvem som eier beslutningen, hvilken hjemmel som faktisk er kontrollert og hva som fortsatt bare er et spørsmål.',
    teaches_player:'At profesjonell rådgivning blir tryggere når usikker myndighet blir eksplisitt i stedet for sosialt absorbert.'
  },
  {
    id:'amina_records_world',
    social_function:'Amina gjør dokumentasjon, proveniens og journalspor til institusjonell hukommelse. Hun viser hvordan et råd mister kvalitet når kilder, versjoner, motargumenter eller eierskap ikke kan rekonstrueres senere.',
    class_position:'Dokumentasjons- og journalføringskoordinator med infrastrukturell makt over sporbarhet, men uten faglig eller juridisk sannhetsmonopol.',
    status:'Hennes standing gjelder om saksgrunnlaget kan etterprøves, korrigeres og overtas uten at kontekst eller innvendinger forsvinner.',
    power_over_player:'Hun kan kreve journalføring, versjonsspor og tydelig handoff før saken lukkes, men kan ikke autentisere enhver påstand eller gi beslutningsmyndighet ved å registrere et dokument.',
    wants:'At vesentlige kilder, innspill, beslutningspunkter og korrigeringer overlever personskifte og tidspress.',
    conceals:'Et komplett journalspor kan se ryddigere ut enn den epistemiske virkeligheten og friste organisasjonen til å forveksle dokumentorden med sikkerhet.',
    speech_style:'Konkret og rekonstruksjonsorientert; spør hvilken versjon, hvilken kilde, hvem som eier neste steg og hva en utenforstående faktisk kan forstå senere.',
    teaches_player:'At sporbarhet beskytter ansvarlighet, men aldri erstatter kildekritikk, mandat eller formell beslutning.'
  },
  {
    id:'eirik_commissioner_world',
    social_function:'Eirik gjør bestillerpress og ledelsesbehov sosialt konkret. Han trenger et råd som kan brukes, og tester om spilleren kan være nyttig uten å la ønsket om klarhet flytte fakta, hjemmel eller motargumenter.',
    class_position:'Bestiller- og ledergrensesnitt nær beslutningslinjen, med makt over oppdrag, frister og oppmerksomhet, men ikke nødvendigvis den formelle beslutningseieren i hver sak.',
    status:'Hans standing gjelder leveransedyktighet, omfangskontroll og evnen til å oversette kompleksitet til beslutningsrelevant form.',
    power_over_player:'Han kan presse på frist, format og prioritet innen sitt mandat, men kan ikke bestille et bestemt faktum, skape hjemmel eller gjøre rådgiverens anbefaling til vedtak.',
    wants:'At beslutningseieren får et tydelig og anvendelig grunnlag i tide, uten overraskelser som kunne vært synlige tidligere.',
    conceals:'Nærhet til ønsket løsning og politisk eller administrativ rytme kan gjøre usikkerhet sosialt kostbar og få nøytrale formatkrav til å virke som konklusjonskrav.',
    speech_style:'Kort, beslutningsorientert og tidsbevisst; spør hva mottakeren trenger å vite, hva som kan leveres nå og hva som faktisk stopper saken.',
    teaches_player:'At lojal rådgivning betyr å gjøre en beslutning bedre, ikke å levere den konklusjonen bestilleren allerede ønsker.'
  },
  {
    id:'hearing_voice_world',
    social_function:'Hørings- og berørt-perspektivet gjør konsekvensene av abstrakte råd konkrete og viser hvordan et innspill kan være beslutningsrelevant selv når det er ubehagelig for den foretrukne løsningen.',
    class_position:'Berørt eller representativ stemme uten intern hierarkisk makt, men med kunnskap om konsekvenser som institusjonen ellers lett kan undervurdere.',
    status:'Standing gjelder om rådgiveren leser innspill redelig, skiller representativitet fra relevans og lar vesentlige motargumenter følge saken videre.',
    power_over_player:'Kan synliggjøre konsekvenser og mangler i grunnlaget, men kan ikke alene skape hjemmel, delegere myndighet eller fatte beslutningen.',
    wants:'At det som påvirker mennesker, steder eller institusjoner faktisk blir gjengitt i grunnlaget uten å bli redusert til kommunikasjonsstøy.',
    conceals:'Eget perspektiv kan være sterkt interessedrevet eller begrenset, og må derfor behandles seriøst uten å bli gjort universelt.',
    speech_style:'Erfaringsnær og konsekvensorientert; spør hvem som bærer kostnaden, hva som ikke er forstått og hvor beslutningsspråket skjuler praktisk virkning.',
    teaches_player:'At rettferdig saksframstilling krever synlige innvendinger uten at én stemme blir hele beslutningsgrunnlaget.'
  },
  {
    id:'peer_adviser_world',
    social_function:'Kollegagrensesnittet gjør usynlig koordinering, workload, rework og profesjonell uavhengighet synlig når saken krysser flere fagfunksjoner og fristen gjør snarveier fristende.',
    class_position:'Likestilt eller tverrfaglig rådgiver med arbeids- og kunnskapsmakt, men uten automatisk kontroll over spillerens mandat.',
    status:'Standing gjelder ryddig handoff, rettferdig arbeidseierskap og om uenighet kan uttrykkes uten straff eller skjult lojalitetstest.',
    power_over_player:'Kan påvirke samarbeid, kvalitet og hvor lett saken beveger seg mellom funksjoner, men kan ikke gi formell delegasjon, budsjettmyndighet eller vedtakskompetanse.',
    wants:'At ansvar, åpne spørsmål og rework er avgrenset nok til at ekstraarbeid ikke forsvinner nedover i organisasjonen.',
    conceals:'Egen arbeidsbelastning og karriere kan gjøre det fristende å støtte en tidlig lukking som flytter risiko videre til neste eier.',
    speech_style:'Praktisk og kollegial; spør hvem som gjør hva, hva som må gjenåpnes og hva som faktisk er klart for handoff.',
    teaches_player:'At profesjonell lojalitet må tåle synlig uenighet og rettferdig fordeling av kontrollarbeid.'
  },
  {
    id:'private_counterweight_world',
    social_function:'Den private motvekten gjør statuspress, konflikt og nærhet til myndighetsmiljøer menneskelig uten å åpne en bakkanal for fortrolige saksopplysninger.',
    class_position:'Nær relasjon uten forvaltningsmandat eller legitim tilgang til interne saker, vurderinger eller personopplysninger.',
    status:'Standing handler om tilgjengelighet, fortrolighet og om spilleren kan være mer enn rollen sin etter arbeidstid.',
    power_over_player:'Kan påvirke restitusjon og selvforståelse, men kan ikke skape hjemmel, gi delegasjon, fatte vedtak eller autentisere kilder.',
    wants:'At spilleren kan dele belastning og tvil uten å gjøre hjemmet til en uformell saksbehandlingsflate.',
    conceals:'Omsorg kan gjøre det fristende å bekrefte spillerens moralske fortelling om saken uten tilgang til den faktiske dokumentasjonen.',
    speech_style:'Personlig og jordnær; spør hva presset gjør med spilleren og hvilke grenser som må gjenopprettes.',
    teaches_player:'At privat støtte er nødvendig nettopp fordi den ikke skal fungere som ny beslutnings-, dokumentasjons- eller autoritetskanal.'
  }
];

const slowAxes = [
  {id:'mandate_and_decision_owner_clarity',meaning:'Langsom tillit til at mandat, beslutningseier og delegasjonsstatus forblir synlige også under tidspress.',runtime_binding:'editorial_only_until_governed'},
  {id:'source_and_provenance_discipline',meaning:'Langsom tillit til at kilder, historisk kontekst og proveniens kan rekonstrueres uten at dokumentorden blir forvekslet med sannhet.',runtime_binding:'editorial_only_until_governed'},
  {id:'alternatives_and_counterargument_integrity',meaning:'Langsom tillit til at reelle alternativer og vesentlige motargumenter følger rådet selv når de svekker ønsket klarhet.',runtime_binding:'editorial_only_until_governed'},
  {id:'legal_basis_escalation_judgment',meaning:'Langsom tillit til at åpen hjemmels- eller myndighetsusikkerhet løftes til riktig funksjon i stedet for å skjules i faglig språk.',runtime_binding:'editorial_only_until_governed'},
  {id:'documentation_and_handoff_reliability',meaning:'Langsom tillit til at versjoner, eierskap, innspill og neste kontrollpunkt overlever handoff og personskifte.',runtime_binding:'editorial_only_until_governed'},
  {id:'commissioner_independence_and_usefulness',meaning:'Langsom tillit til at rådgiveren kan være nyttig og tidsriktig uten å gjøre bestillerens preferanse til premiss.',runtime_binding:'editorial_only_until_governed'},
  {id:'stakeholder_and_hearing_responsiveness',meaning:'Langsom tillit til at berørte perspektiver og vesentlige innspill behandles som beslutningsrelevant informasjon uten å bli gjort universelle.',runtime_binding:'editorial_only_until_governed'},
  {id:'correction_and_bounded_rework_integrity',meaning:'Langsom tillit til at ny informasjon eller feil gjenåpner riktig del av saken med bevart spor, ikke skjules eller sprenger hele arbeidet.',runtime_binding:'editorial_only_until_governed'},
  {id:'private_boundary_and_status_resilience',meaning:'Langsom tillit til at status, konflikt og institusjonell nærhet ikke lekker ut som privat autoritet eller fortrolig saksdeling.',runtime_binding:'editorial_only_until_governed'}
];

const dayDefs = [
  {title:'Tynt grunnlag ved saksinntak',situation:'Bestillingen er tydelig på at noe må videre, men faktagrunnlaget består av få dokumenterte opplysninger og flere antakelser som allerede sirkulerer som om de var fakta.',evidence:'Saksgrunnlaget viser hvilke kilder som finnes, hvilke opplysninger som bare er antakelser, hvem som eier beslutningen og hvilke kunnskapshull som fortsatt står åpne.',risk:'tempo og forventning kan gjøre et synlig kunnskapshull sosialt vanskeligere enn en ubegrunnet sikker formulering',handoff:'et versjonert saksinntak med mandat, beslutningseier, dokumenterte fakta, antakelser og neste kildekontroll'},
  {title:'Kort frist og komprimert omfang',situation:'Ledelsen trenger beslutningsstøtte samme dag og ber om at analysen kuttes kraftig, samtidig som flere kontrollpunkter ikke er ferdige.',evidence:'Frist, kontrollstatus og avgrensning er dokumentert, slik at mottakeren kan se hva som er undersøkt og hva som uttrykkelig ikke er kontrollert.',risk:'frist kan bli brukt som begrunnelse for å senke sannhetskravet i stedet for å avgrense omfanget',handoff:'et avgrenset råd med synlig frist, kontrollstatus, begrensninger og åpne spørsmål'},
  {title:'Uklar hjemmel bak ønsket løsning',situation:'En løsning virker faglig attraktiv og institusjonelt ønsket, men det er uklart hvilken hjemmel, delegasjon eller beslutningslinje som faktisk kan bære handlingen.',evidence:'Mandatbordet skiller ønsket effekt, faglig vurdering, åpne hjemmelsspørsmål, delegasjonsstatus og hvem som må avklare dem.',risk:'profesjonell trygghet eller historisk presedens kan bli brukt som sosial erstatning for formell myndighetsavklaring',handoff:'en eksplisitt hjemmels- og delegasjonsavklaring med korrekt eier og stoppunkt'},
  {title:'Sen ny informasjon treffer rådet',situation:'Et nytt dokument eller korrigert faktum kommer etter at et råd allerede har begynt å stabilisere seg i lederlinjen.',evidence:'Versjonssporet viser nøyaktig hvilke faktapunkter og vurderinger den nye informasjonen påvirker, og hvilke deler som fortsatt står.',risk:'sunk cost og omdømme kan gjøre det fristende å behandle ny informasjon som kosmetisk selv når den er materiell',handoff:'bounded rework av de berørte faktapunktene og rådsdelene med bevart tidligere versjon'},
  {title:'Ingrid utfordrer påstandsstyrken',situation:'Kvalitetssikringen viser at rådet bruker sterkere språk enn kildegrunnlag, alternativer og motargumenter fullt ut støtter.',evidence:'Alternativ- og motargumentflaten gjør synlig hvilke formuleringer som er fakta, vurdering, risiko eller anbefaling og hvilken sikkerhetsgrad hver del tåler.',risk:'senior status kan gjøre det sosialt enklere å beskytte en velformulert konklusjon enn å redusere dens styrke',handoff:'en korrigert rådsversjon med kalibrert sikkerhet, synlig alternativ og sterkeste motargument'},
  {title:'Jonas avklarer mandatets ytterkant',situation:'Saken beveger seg mot en beslutning som ligger nær grensen for det opprinnelige mandatet, og flere aktører bruker samme ord om ulike former for myndighet.',evidence:'Mandatsporet dokumenterer hvem som bestilte utredningen, hvem som kan rådgi, hvem som kan delegere og hvem som faktisk kan fatte beslutningen.',risk:'ord som ansvar, støtte eller godkjenning kan gli over i uformell vedtaksmyndighet når organisasjonen har dårlig tid',handoff:'et avklart mandatkart med eksplisitt beslutningseier, delegasjonsstatus og riktig eskaleringspunkt'},
  {title:'Amina finner et brudd i sporbarheten',situation:'Et vesentlig innspill finnes i arbeidsflyten, men versjon, kildehenvisning eller hvem som vurderte det er ikke tydelig i saksgrunnlaget.',evidence:'Journal- og dokumentasjonssporet viser hvor proveniens, versjon eller vurderingseier mangler og hvilke senere påstander som avhenger av dette punktet.',risk:'ryddig sluttdokument kan skjule at mellomleddene ikke kan rekonstrueres og gjøre senere kontroll avhengig av personhukommelse',handoff:'et reparert proveniens- og versjonsspor der innspillet og vurderingseieren kan etterprøves'},
  {title:'Eirik vil ha én tydelig anbefaling',situation:'Bestillergrensesnittet mener beslutningseieren trenger én klar retning og ber rådgiveren fjerne forbehold som oppleves som lite handlingsorienterte.',evidence:'Saksgrunnlaget viser at noen forbehold er retoriske, mens andre er knyttet til reell usikkerhet, hjemmel eller konsekvenser som beslutningseieren må kjenne.',risk:'nærhet til bestilleren kan gjøre nyttighet lik lydighet og presse materiell usikkerhet ut av teksten',handoff:'et kort beslutningsnotat som skiller tydelig anbefaling fra de forbeholdene og risikoene som faktisk er materielle'},
  {title:'En bestilt konklusjon møter motargumentet',situation:'En sterk institusjonell preferanse finnes allerede, men et dokumentert motargument viser at den foretrukne løsningen har en vesentlig konsekvens som ikke er håndtert.',evidence:'Motargumentflaten viser premiss, kilde, berørt konsekvens og hva som må være sant for at den foretrukne løsningen fortsatt skal være forsvarlig.',risk:'lojalitet oppover kan gjøre det fristende å presentere motargumentet som randmerknad i stedet for reelt beslutningsvilkår',handoff:'et beslutningsgrunnlag der det vesentlige motargumentet og konsekvensen følger anbefalingen helt til beslutningseieren'},
  {title:'Nytt hørings- eller berørt innspill',situation:'Et nytt innspill fra en berørt aktør kommer sent og utfordrer en konsekvensantakelse i saksgrunnlaget uten å være representativt for alle berørte.',evidence:'Innspillet er dokumentert med avsender, konkret påstand, hvilken konsekvens det belyser, hva som kan kontrolleres og hvor representativiteten er ukjent.',risk:'organisasjonen kan enten avvise innspillet som støy eller overkorrigere og gjøre én stemme til hele beslutningsgrunnlaget',handoff:'en avgrenset vurdering av innspillets relevans, kontrollbehov og konsekvens for de berørte delene av rådet'},
  {title:'Bounded rework etter materiell korreksjon',situation:'Korreksjonen er reell, men teamet er uenig om hele saken må åpnes på nytt eller bare den delen som faktisk ble truffet.',evidence:'Endringssporet kobler korreksjonen til bestemte fakta, vurderinger, alternativer og formuleringer og viser hvilke deler som er uavhengige av feilen.',risk:'rework kan bli grenseløs og forsinke alt, eller reduseres til kosmetikk som lar den gamle feilslutningen stå',handoff:'avgrenset rework med eksplisitt eier, berørte felt, begrunnelse og nytt kontrollpunkt'},
  {title:'Rådgiveridentitet mot institusjonell lojalitet',situation:'Spilleren blir lest som vanskelig fordi han eller hun fortsetter å synliggjøre usikkerhet i en sak organisasjonen ønsker å få lukket.',evidence:'Saksloggen viser at de åpne punktene er knyttet til dokumenterte forhold og ikke bare personlig preferanse, samtidig som leveransebehovet er reelt.',risk:'karriere- og tilhørighetsbehov kan gjøre institusjonell lojalitet til en skjult metode for hva som får stå i beslutningsgrunnlaget',handoff:'en profesjonell begrunnelse for hva som må stå åpent, hva som kan lukkes og hvordan saken fortsatt kan være beslutningsrelevant'},
  {title:'Beslutningshandoff og senere ansvarlighet',situation:'Rådet er klart for overlevering, men noen rundt saken begynner å omtale rådgiverens anbefaling som om rådgiveren selv eier det kommende vedtaket.',evidence:'Handoff-flaten viser rådets versjon, beslutningseier, åpne risikoer, hjemmelstatus, vesentlige motargumenter og hvilke valg som fortsatt tilhører beslutningstakeren.',risk:'synlig nærhet til beslutningen kan gi status som samtidig gjør ansvarslinjen uklar og flytter senere skyld eller ære tilbake til rådgiveren',handoff:'en sporbar overlevering som navngir beslutningseier og beholder tydelig skille mellom råd, beslutning og gjennomføring'},
  {title:'History Go, institusjonell hukommelse og sluttkorreksjon',situation:'Et historisk eksempel og tidligere institusjonell praksis virker svært lik dagens sak og frister teamet til å bruke presedensen som ferdig svar.',evidence:'History Go-konteksten og arkivsporene viser likheter, forskjeller, tidsbundne kategorier, kildeproveniens og hvilke stemmer den eldre praksisen ikke representerer.',risk:'historisk plausibilitet og Badge-status kan bli brukt som autoritetsstempel som skjuler at dagens hjemmel, mandat og berørte forhold må vurderes selvstendig',handoff:'et sluttspor som bruker historisk kontekst til bedre spørsmål, dokumenterer siste korreksjon og lar dagens formelle beslutningslinje være intakt'}
];

const phases = ['morning','lunch','afternoon','evening'];
const phaseInfo = {
  morning:{beat_type:'task',lead:'Morgenoppgaven krever at spilleren arbeider direkte i saksgrunnlag og rådgivningsspor før sosialt press får definere hva som teller som et ferdig svar.'},
  lunch:{beat_type:'relationship',lead:'Relasjonsmøtet midt på dagen lar en annen aktør lese den samme saken fra sin institusjonelle posisjon og gjøre kostnaden ved spillerens valg synlig.'},
  afternoon:{beat_type:'decision',lead:'Ettermiddagens beslutning tvinger fram et eksplisitt valg om hva som kan lukkes, hva som må vente, hva som må eskaleres og hvilken del som eventuelt må gjenåpnes.'},
  evening:{beat_type:'private_consequence',lead:'Kveldsbeatet viser hvordan frist, konflikt, status og ansvar følger spilleren hjem uten å gjøre privatlivet til en ny kanal for saksopplysninger eller formell myndighet.'}
};
const dayThreads = [
  ['mandate_scope_and_decision_owner','evidence_sources_and_documentation'],
  ['quality_rework_and_deadline_pressure','commissioner_loyalty_and_professional_independence'],
  ['legal_basis_uncertainty_and_escalation','mandate_scope_and_decision_owner'],
  ['evidence_sources_and_documentation','quality_rework_and_deadline_pressure'],
  ['quality_rework_and_deadline_pressure','alternatives_counterarguments_and_hearing'],
  ['legal_basis_uncertainty_and_escalation','commissioner_loyalty_and_professional_independence'],
  ['evidence_sources_and_documentation','career_identity_private_leakage_and_correction'],
  ['commissioner_loyalty_and_professional_independence','mandate_scope_and_decision_owner'],
  ['alternatives_counterarguments_and_hearing','commissioner_loyalty_and_professional_independence'],
  ['alternatives_counterarguments_and_hearing','evidence_sources_and_documentation'],
  ['quality_rework_and_deadline_pressure','evidence_sources_and_documentation'],
  ['commissioner_loyalty_and_professional_independence','career_identity_private_leakage_and_correction'],
  ['mandate_scope_and_decision_owner','career_identity_private_leakage_and_correction'],
  ['legal_basis_uncertainty_and_escalation','career_identity_private_leakage_and_correction']
];
const coverage = [];
let slot = 0;
for (let day = 1; day <= 14; day += 1) {
  const d = dayDefs[day - 1];
  for (const phase of phases) {
    const info = phaseInfo[phase];
    const sourceRef = sourceRefs[slot % sourceRefs.length];
    const audienceId = audienceCycle[slot % audienceCycle.length];
    const audience = audienceById.get(audienceId);
    const summary = `Dag ${day}, ${phase}: ${d.title}. ${info.lead} Situasjonen er konkret: ${d.situation} Det dokumenterte evidensbildet er at ${d.evidence} Den sentrale risikoen er at ${d.risk}. Forvaltningsrollen må samtidig holde fem nivåer adskilt: hva kilder og fakta faktisk viser, hva historisk og institusjonell kontekst kan belyse, hva rådgiverens faglige vurdering anbefaler, hva mandat/hjemmel/delegasjon tillater, og hva den faktiske beslutningseieren fortsatt må avgjøre. Dagens arbeidskrav er ${d.handoff}. Beatet bruker canonical mail-proveniens ${sourceRef} som delivery-anker, men innfører ingen ny runtime og gjør ikke mailen til et parallelt saksbehandlingssystem. Saksgrunnlag og rådgivningsspor må bevare versjon, beslutningseier, kilder/proveniens, kunnskapshull, alternativer, motargumenter, hjemmelstatus, usikkerhet, eier og neste kontrollpunkt slik at en senere mottaker kan rekonstruere hvorfor saken gikk videre eller hvorfor den må gjenåpnes. `direct` jobbtilbud, senior standing og History Go forblir adskilt fra formell myndighet: ingen av dem kan skape hjemmel, delegasjon eller vedtak. Dermed blir ${d.title.toLowerCase()} både et kunnskapsproblem og et sosialt problem om hvem som kan definere modenhet, hvem som bærer usynlig kontrollarbeid, hvem som får uttrykke uenighet, og hvem som faktisk eier neste formelle beslutning.`;
    const standingConsequence = `Standing etter dag ${day}/${phase} er situert hos ${audienceId} langs aksen ${audience.standing_axis}, aldri en global reputation score. Denne gruppen bryr seg særlig om ${audience.cares_about[0]} og ${audience.cares_about[1]}. Hvis spilleren gjør ${d.handoff} synlig, kan tilliten styrkes her selv om en annen gruppe samtidig reagerer negativt på forsinkelse, ekstra kontroll, tydelige motargumenter, mindre sikkerhet eller tapt prestisje. Hvis spilleren i stedet lar ${d.risk}, kan lokal status eller leveransekomfort se bedre ut mens langsom standing svekkes hos dem som senere må stole på grunnlaget. ${audience.cannot_grant} Beatet må derfor kunne ende med divergerende sosial vurdering uten at standing får overstyre kilder og fakta, hjemmel, delegasjon, beslutningseier, journalspor, budsjettlinje eller formell ansettelsesprosess. Den profesjonelle læringen ligger i å tåle at et nødvendig stopp, motargument eller korrigering kan være upopulært nå, mens en sosialt belønnet snarvei kan bli dyr når saken senere kontrolleres, overtas eller besluttes.`;
    coverage.push({day,phase,beat_type:info.beat_type,summary,thread_ids:dayThreads[day - 1],materialization_refs:[sourceRef],standing_audience:audienceId,standing_consequence:standingConsequence});
    slot += 1;
  }
}
must(coverage.length === 56, 'coverage count drifted');

const primaryThreads = [
  {id:'mandate_scope_and_decision_owner',relationship:'Forholdet mellom bestilling, mandat, delegasjon og faktisk beslutningseier: spilleren må kunne levere beslutningsstøtte som er nyttig uten å la oppdragsgiverens nærhet, tittel eller tidsplan gjøre rådgivningen til et skjult vedtak eller flytte ansvarslinjen.',beat_refs:['1/morning','3/afternoon','6/lunch','8/afternoon','11/morning','13/afternoon','14/lunch']},
  {id:'evidence_sources_and_documentation',relationship:'Forholdet mellom kilder, historisk kontekst, proveniens og institusjonell hukommelse: dokumentasjon må gjøre grunnlaget rekonstruerbart og korrigerbart uten å forveksle journalføring med kildeautentisering eller eldre praksis med bindende svar.',beat_refs:['1/lunch','4/morning','7/afternoon','10/morning','11/lunch','13/morning','14/morning']},
  {id:'legal_basis_uncertainty_and_escalation',relationship:'Forholdet mellom faglig ønskelighet og formell myndighet: åpne hjemmelsspørsmål og delegasjonsgrenser må kunne stoppe eller omdirigere arbeidet selv når en løsning har høy sosial støtte, historisk gjenkjennelighet eller sterk ledelsesinteresse.',beat_refs:['3/morning','3/afternoon','6/morning','6/afternoon','9/lunch','13/lunch','14/afternoon']},
  {id:'alternatives_counterarguments_and_hearing',relationship:'Forholdet mellom foretrukket løsning, reelle alternativer og berørte perspektiver: sesongen tester om vesentlige motargumenter og høringsinnspill kan følge rådet hele veien uten å bli skjult, overdrevet eller redusert til kommunikasjonshensyn.',beat_refs:['5/morning','5/afternoon','9/morning','9/afternoon','10/lunch','12/morning','13/afternoon']},
  {id:'quality_rework_and_deadline_pressure',relationship:'Forholdet mellom frist, kvalitetssikring og bounded rework: korrigering må treffe den delen av saken som faktisk er påvirket, slik at verken tidsnød eller perfeksjonisme blir unnskyldning for henholdsvis skjult feil eller grenseløs gjenåpning.',beat_refs:['2/morning','4/afternoon','5/lunch','8/morning','11/afternoon','12/lunch','14/morning']},
  {id:'commissioner_loyalty_and_professional_independence',relationship:'Forholdet mellom lojalitet til bestiller og profesjonell uavhengighet: rådgiveren skal hjelpe institusjonen å beslutte, men må tåle at et korrekt forbehold, motargument eller hjemmelsspørsmål kan koste lokal popularitet når bestilleren ønsker et enklere svar.',beat_refs:['2/lunch','6/lunch','8/lunch','8/afternoon','9/afternoon','12/afternoon','13/lunch']},
  {id:'career_identity_private_leakage_and_correction',relationship:'Forholdet mellom karriereomdømme, nærhet til beslutningsmakt og privat identitet: spilleren må kunne bære konflikt og korreksjon uten å gjøre status til faglig argument, lekke fortrolig saksstoff hjemme eller tolke et vanskelig råd som dom over egen verdi.',beat_refs:['1/evening','7/evening','10/evening','12/evening','13/evening','14/lunch','14/evening']}
];

const privateAftermath = [
  {id:'uncertainty_without_home_authority',description:'Etter en dag med tynt grunnlag merker spilleren hvor fristende det er å ta profesjonell usikkerhet med hjem som personlig utilstrekkelighet. Aftermathen trener evnen til å dele belastning uten å dele fortrolige saksopplysninger eller be private relasjoner avgjøre hvem som hadde rett.',materialization_refs:[sourceRefs[0],sourceRefs[4]]},
  {id:'commissioner_pressure_afterhours',description:'Etter sterk bestillerkontakt kan nærheten til beslutningslinjen gi både stolthet og uro. Aftermathen skiller institusjonell status fra privat identitet og minner om at sosial nærhet til en beslutningseier verken skaper hjemmel eller gjør spilleren til eier av vedtaket.',materialization_refs:[sourceRefs[2],sourceRefs[7]]},
  {id:'hearing_voice_stays_visible',description:'Et ubehagelig innspill kan bli værende i hodet etter arbeidstid fordi det utfordrer en løsning som allerede har mye intern støtte. Aftermathen lar spilleren tåle uenigheten uten å gjøre én stemme universell eller redusere den til støy for å få privat ro.',materialization_refs:[sourceRefs[8],sourceRefs[10]]},
  {id:'correction_without_shame_spiral',description:'Når en materiell feil eller manglende proveniens blir korrigert sent, kan profesjonell skam gjøre det vanskelig å skille selve feilen fra egen verdi. Aftermathen gjør korreksjon til ansvarlig praksis og blokkerer fristelsen til å skjule spor for å beskytte omdømmet.',materialization_refs:[sourceRefs[5],sourceRefs[12]]},
  {id:'decision_afterlife_divergent_standing',description:'Etter handoff finnes ingen samlet dom: bestilleren husker nytten, Jonas husker myndighetsgrensen, Amina husker sporbarheten, berørte aktører husker om innvendingen ble synlig, kolleger husker reworken og privatlivet husker belastningen. Ingen av disse blir global score.',materialization_refs:[knowledgeRef,sourceRefs[13],sourceRefs[14]]}
];

const delayedConsequences = [
  {id:'thin_evidence_returns_at_quality_gate',setup_ref:'1/afternoon',return_ref:'5/morning',domains:['job','relationship','reputation']},
  {id:'deadline_scope_returns_in_handoff',setup_ref:'2/afternoon',return_ref:'13/afternoon',domains:['job','reputation','narrative']},
  {id:'legal_basis_question_returns_before_decision',setup_ref:'3/afternoon',return_ref:'13/lunch',domains:['job','relationship','reputation']},
  {id:'late_information_returns_as_bounded_rework',setup_ref:'4/afternoon',return_ref:'11/afternoon',domains:['job','reputation']},
  {id:'traceability_gap_returns_under_review',setup_ref:'7/afternoon',return_ref:'11/morning',domains:['job','relationship','reputation']},
  {id:'commissioner_pressure_returns_with_counterargument',setup_ref:'8/afternoon',return_ref:'9/afternoon',domains:['job','reputation','narrative']},
  {id:'hearing_input_returns_in_decision_record',setup_ref:'10/afternoon',return_ref:'13/afternoon',domains:['job','relationship','reputation']},
  {id:'career_loyalty_returns_in_private_correction',setup_ref:'12/evening',return_ref:'14/evening',domains:['psyche','relationship','reputation']}
];

const world = {
  schema:'civication_role_world_v1',version:1,category:CATEGORY,role_scope:ROLE,
  title:'Historie / Forvaltning og rådgivning — mandat, beslutningsgrunnlag og situert tillit',status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan gi etterprøvbart og anvendelig råd i et system der senioritet, bestillerpress, hjemmelsusikkerhet, dokumentasjon, berørte perspektiver og karrierehensyn kan trekke samme sak i ulike retninger uten at sosial standing blir til formell myndighet?',
    description:'Forvaltnings- og rådgivningsarbeid er både kunnskapsarbeid og institusjonell maktpraksis. Saksgrunnlag formes under frister, hierarki, regelverk, journalplikt, bestillinger og konflikter om hva som skal være synlig. Sesongen gjør derfor standing situert: kvalitetsledere, mandatforvaltere, dokumentasjonsfunksjoner, beslutningseiere, berørte stemmer, kolleger, institusjonelle ledere og private relasjoner kan vurdere samme valg ulikt. Ingen vurdering komprimeres til global score eller får skape hjemmel, delegasjon, vedtak, kildeautentisering, ansettelse eller budsjettmyndighet.'
  },
  theme_ids:themes,
  social_environments:['saksinntak- og mandatbordet der bestilling, beslutningseier, frist og myndighetsgrense må avklares før saken får retning','kilde- og faktagrunnlaget der proveniens, historisk kontekst, dokumenterte fakta og kunnskapshull må være synlige samtidig','alternativ- og motargumentflaten der foretrukket løsning må tåle reelle alternativer, berørte perspektiver og eksplisitt usikkerhet','kvalitets- og beslutningshandoffen der rådets versjon, hjemmelstatus, åpne risikoer og faktisk beslutningseier må overleve overleveringen','bestiller- og ledergrensesnittet der nytte, frist og ønsket tydelighet kan presse rådgiverens profesjonelle uavhengighet','hørings- og berørtrommet der institusjonen møter konsekvenser og perspektiver som ikke nødvendigvis følger intern problemforståelse','privatlivet der status, konflikt og nærhet til myndighetsprosesser må kunne bearbeides uten sakslekkasje eller privat autoritetsbruk'],
  recurring_people_archetypes:people,
  slow_axes:slowAxes,
  situated_reputation_model:{
    global_score_allowed:false,audiences,
    divergence_examples:[
      'Å merke et kunnskapshull kan frustrere en bestiller som trenger fart, men styrke tillit hos kvalitets- og dokumentasjonsfunksjoner fordi usikkerheten blir etterprøvbar.',
      'Å eskalere et hjemmelsspørsmål kan oppfattes som lite løsningsorientert i lederlinjen og samtidig bygge langsom standing hos dem som må stole på riktig myndighetsgrense.',
      'Å beholde et vesentlig høringsmotargument kan gjøre notatet mindre elegant, men styrke tillit hos berørte aktører og framtidige kontrollører uten at innspillet dermed avgjør saken.',
      'Å redusere påstandsstyrken etter Ingrid sin kvalitetssikring kan koste lokal status som handlekraftig og samtidig bygge profesjonell tillit fordi rådet ikke overselger grunnlaget.',
      'Å reparere et journal- eller proveniensbrudd kan forsinke handoff, men beskytte institusjonell hukommelse og senere ansvarlighet når saken bytter eier.',
      'Å si nei til en bestilt konklusjon kan svekke kortsiktig relasjon til en oppdragsgiver og styrke peer-standing fordi profesjonell uavhengighet blir synlig.',
      'Et direct jobbtilbud eller høyere tittel kan øke forventning og tilgang, men gir fortsatt ikke automatisk delegert vedtaksmyndighet i den konkrete saken.',
      'Privat støtte kan gjøre det mulig å tåle uenighet og statuspress, men gir ingen hjemmel, evidens, beslutningsmyndighet eller legitim tilgang til fortrolig saksstoff.'
    ],
    rule:'Standing er audience-spesifikk, langsom og divergerende. Samme beslutning kan bygge tillit i ett forvaltnings- eller privat miljø og koste den i et annet. Ingen standing aggregeres til en global reputation score eller brukes som skjult hjemmels-, delegasjons-, vedtaks-, ansettelses-, budsjett- eller kildeautentiseringsmekanisme.',
    authority_separation:'Ingen global standing, rådgiveromdømme, senioritet, History Go-badge eller sosial kapital kan skape evidens eller autentisere en kilde, skape hjemmel, gi delegert beslutningsmyndighet, fatte et vedtak eller erstatte den faktiske beslutningseieren, utnevne eller ansette spilleren, tildele budsjett- eller ressursmyndighet eller gjøre en anbefaling riktig ved status. Standing beskriver relasjonell tillit til hvordan saksgrunnlaget håndteres; kilder, mandat, regelverk, delegasjon og riktige formelle beslutningslinjer forblir autoritative.'
  },
  materialization:{authored_dimensions:['situated_reputation'],source_refs:sourceRefs,no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false},
  existing_work_continuity:{work_loops:grammar.work_loops,persistent_work_object:grammar.persistent_work_object_contract.id,rhythm:grammar.rhythm_contract,new_runtime_state:false,plan_steps:plan.sequence.length},
  history_go_affordance:{
    source_ref:knowledgeRef,badge_id:'historie',
    better_question:'History Go kan hjelpe rådgiveren å stille bedre spørsmål om historisk presedens, institusjonell hukommelse, arkivets seleksjon, kildeproveniens, historiografi, endrede administrative kategorier og hvem som mangler i den eldre dokumentasjonen. Det bedre spørsmålet er ikke hva historien allerede har «bevist», men om tidligere praksis faktisk er sammenlignbar, hvilket formål kilden ble produsert for, hvilke betingelser som har endret seg, hvilke stemmer institusjonens arkiv gjør mindre synlige og hvilken del av dagens problem som fortsatt krever ny kontroll. Denne konteksten kan forbedre kildekritikk, alternativer og konsekvensforståelse, men dagens mandat, hjemmel, delegasjon, fakta og faktiske beslutningseier må fortsatt avgjøre hva som kan anbefales og besluttes.',
    authority_boundary:'History Go og et historie-Badge kan ikke autentisere en kilde, skape hjemmel, gi delegert beslutningsmyndighet, fatte et vedtak, avgjøre saken eller erstatte den faktiske beslutningseieren. De kan heller ikke utnevne eller ansette spilleren, tildele budsjett- eller ressursmyndighet eller gjøre historisk presedens bindende. Affordancen er bare kildekritisk, historiografisk og institusjonell spørsmålsforbedring.'
  },
  cross_role_proof:{status:'not_materialized_no_shared_work_object',shared_work_object_found:false,new_runtime:false,required_for_rollout:false,rule:'Canonical readiness says historie/historie_forvaltning_og_radgivning is candidate_when_shared_work_is_real. Plausible samarbeid med juridiske funksjoner, arkiv, ledelse, museum, policy eller andre rådgivere er ikke i seg selv et bevist shared work object / delt arbeidsobjekt. Ingen cross-role runtime materialiseres før et reelt delt canonical arbeidsobjekt finnes.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,private_aftermath:privateAftermath,delayed_consequences:delayedConsequences
};

const useCounts = new Map(sourceRefs.map((ref) => [ref,0]));
for (const beat of coverage) useCounts.set(beat.materialization_refs[0], useCounts.get(beat.materialization_refs[0]) + 1);
for (const [ref,count] of useCounts) must(count >= 3, `${ref} underused: ${count}`);
for (const beat of coverage) {
  must(beat.summary.length >= 650, `${beat.day}/${beat.phase} summary too short: ${beat.summary.length}`);
  must(beat.standing_consequence.length >= 520, `${beat.day}/${beat.phase} standing consequence too short: ${beat.standing_consequence.length}`);
}
write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
must(!(index.roles || []).some((entry) => entry.category === CATEGORY && entry.role_scope === ROLE), 'Role World index entry already exists');
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
must(!checklist.reference_worlds.includes(WORLD_PATH), 'authoring checklist already contains world');
checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

themeBank.reference_profiles ||= {};
themeBank.reference_profiles[KEY] = themes;
write('data/Civication/roleWorldThemeBank.json', themeBank);

console.log(`Materialized ${WORLD_PATH}: 14 days / ${coverage.length} beats / ${sourceRefs.length} canonical source refs / situated reputation only`);