import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`RESEARCH_ROLE_WORLD_PRECHECK: ${message}`); };

const CATEGORY = 'historie';
const ROLE = 'historie_forskning_og_akademia';
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
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, '16-step prerequisite plan drifted');
must(grammar.persistent_work_object_contract?.id === 'forskningslogg_og_manusspor', 'persistent research object drifted');
must(grammar.day_one_contract?.entry === 'qualification_required', 'qualification_required gate drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify([
  'sporsmal -> kilder -> kontekst -> metode -> analyse -> argument -> motproving -> publisering',
  'ny_kilde -> kildekritikk -> konsekvens_for_tese -> revisjon -> dokumentert_fortolkning'
]), 'canonical research loops drifted');

const sourceRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  must(doc.category === CATEGORY && doc.role_scope === ROLE && doc.mail_type === type, `${type} catalog identity drifted`);
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(sourceRefs.length === 15 && new Set(sourceRefs).size === 15, `expected 15 unique canonical source mails, got ${sourceRefs.length}`);
const knowledgeRef = sourceRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef, 'knowledge provenance missing');

const themes = ['professional_culture','class_power','status_anxiety','ambition_stagnation','invisible_work','bureaucratic_power','shame_reputation','precarity','loyalty_up_down','public_private_leakage'];
const themeBank = read('data/Civication/roleWorldThemeBank.json');
const themeSet = new Set((themeBank.themes || []).map((theme) => theme.id));
for (const theme of themes) must(themeSet.has(theme), `unknown theme ${theme}`);
must(!themeBank.reference_profiles?.[KEY], `${KEY} already registered in theme bank`);

const audiences = [
  {
    id:'supervisors_and_research_leads',
    standing_axis:'question_scope_method_and_intellectual_independence',
    cares_about:['at forskningsspørsmål, avgrensning og metode kan endres når kilder og motbevis krever det, også når prosjektet allerede har investert tid og status','at veiledning brukes som begrunnet motlesning og ikke som en sosial ordre om hvilket historisk funn kandidaten bør ende med'],
    cannot_grant:'God standing hos veiledere og forskningsledere kan ikke gi en grad, oppfylle qualification_required, gi ansettelse eller akademisk rang, autentisere en kilde, gjøre et historisk funn sant eller erstatte formelle vurderings- og institusjonsprosesser.'
  },
  {
    id:'archive_and_source_stewards',
    standing_axis:'provenance_access_context_and_source_respect',
    cares_about:['at proveniens, arkivstruktur, tilgang, representasjon og fravær blir bevart som kildekritiske vilkår i forskningsloggen','at forskeren ikke gjør tilgang til en kilde om til automatisk autentisering eller bruker arkivets stillhet som enkelt bevis på historisk fravær'],
    cannot_grant:'God standing hos arkivarer og kildeforvaltere kan ikke gi forskeren sannhetsmyndighet, etikkgodkjenning, ansettelse, finansiering eller publiseringsaksept, og kan ikke gjøre én bevart kilde representativ for mer enn den konkrete proveniensen og konteksten bærer.'
  },
  {
    id:'peer_reviewers_and_method_peers',
    standing_axis:'argument_falsifiability_counterevidence_and_review_trust',
    cares_about:['at rivalforklaringer, motbevis og historiografisk uenighet prøves mot de samme påstandene før manus låses','at reviewkritikk besvares etter faglig relevans med sporbar revisjon, ikke etter prestisjen til den som kritiserer eller forskerens behov for å vinne'],
    cannot_grant:'God standing hos fagfeller og metodekolleger kan ikke i seg selv bestemme konklusjonen, gi grad eller kvalifikasjon, ansette forskeren, godkjenne forskningsetikk eller garantere publisering; argument og evidens må fortsatt kunne etterprøves uavhengig.'
  },
  {
    id:'project_admin_ethics_and_funders',
    standing_axis:'scope_reporting_ethics_and_resource_integrity',
    cares_about:['at prosjektstatus, ressursbehov, leveranser, etikk- og personvernporter beskrives sant også når en avklaring forsinker forskningen','at finansiering, styringsmål eller rapporteringsbehov ikke blir skrevet inn i forskningsloggen som om de var historisk evidens eller metodisk begrunnelse'],
    cannot_grant:'God standing hos prosjektadministrasjon, finansieringsgrensesnitt eller etikkrelaterte funksjoner kan ikke gi spilleren en grad, forskeransettelse eller et historisk funn, og ingen uformell relasjon kan erstatte korrekt etikk-, personvern-, budsjett- eller finansieringsvedtak.'
  },
  {
    id:'coauthors_and_research_collaborators',
    standing_axis:'credit_handoff_invisible_work_and_revision_fairness',
    cares_about:['at kildearbeid, analyse, metodeinnspill, siteringskontroll og revisjonsarbeid får synlig eier og rimelig kreditering','at handoff mellom forskere bevarer manusversjon, åpne spørsmål og motbevis slik at usynlig arbeid ikke blir absorbert av den med minst status eller mest pliktfølelse'],
    cannot_grant:'God standing hos medforfattere og samarbeidspartnere kan ikke gi ansettelse, opprykk, finansiering, grad, etikkgodkjenning eller publiseringsmyndighet, og kollegial lojalitet kan ikke gjøre skjult arbeid, usynlig kreditering eller svak evidens legitim.'
  },
  {
    id:'editors_publishers_and_academic_gatekeepers',
    standing_axis:'claim_strength_revision_transparency_and_publication_reliability',
    cares_about:['at påstandsstyrke, begrensninger, siteringer og revisjoner er tydelige nok til at en redaksjonell beslutning ikke bygger på skjult usikkerhet','at publiseringstempo, prestisje eller ønsket skarphet aldri løfter sikkerhetsnivået høyere enn kildene og metoden tåler'],
    cannot_grant:'God standing hos redaktører, forlag, tidsskrifter eller andre akademiske portvakter kan ikke gi historisk sannhetsmyndighet, grad, ansettelse, etikkgodkjenning eller finansiering; publiseringsaksept er heller ikke bevis på at alle påstander er sanne.'
  },
  {
    id:'disciplinary_peers_and_future_employers',
    standing_axis:'professional_judgment_correction_and_portfolio_trust',
    cares_about:['at forskeren over tid viser dømmekraft som tåler motbevis, avslag, korreksjon og reell avgrensning fremfor å beskytte et glatt karrierebilde','at dokumentert læring og faglig integritet følger arbeidet videre uten at omdømme blir en snarvei til kvalifikasjon eller formell stilling'],
    cannot_grant:'God profesjonell standing eller et sterkt akademisk omdømme kan ikke alene gi qualification_required, grad, forskeransettelse, senioritet, finansiering eller formell myndighet; slike rettigheter må fortsatt følge reelle kvalifikasjoner og riktige institusjonelle prosesser.'
  },
  {
    id:'private_relations',
    standing_axis:'recovery_confidentiality_identity_and_status_boundary',
    cares_about:['at forskeren kan tåle review, avslag, midlertidighet og statususikkerhet uten å gjøre arbeidsresultatet til hele sin private egenverdi','at fortrolige kilder, reviewinnhold, personopplysninger, kollegainformasjon og interne prosesser ikke brukes privat for å få støtte eller vinne en statusfortelling'],
    cannot_grant:'Nære relasjoner kan gi støtte, perspektiv og restitusjon, men kan ikke gi History Go-badge som grad, kvalifikasjon, ansettelse, finansiering, etikk- eller personverngodkjenning, historisk evidens, publiseringsaksept eller akademisk myndighet.'
  }
];
const audienceById = new Map(audiences.map((audience) => [audience.id, audience]));
const audienceCycle = audiences.map((audience) => audience.id);

const people = [
  { id:'elin_supervisor_world', social_function:'Elin gjør veiledning og forskningsledelse sosialt konkret og tester om forskeren klarer å skille kompetent motlesning fra lydighet når spørsmålet, metoden eller hovedtesen må endres.', class_position:'Hovedveileder og seniorforsker med høy faglig og institusjonell kapital, men uten evne til å produsere sannhet gjennom rang.', status:'Hennes standing gjelder forskerens dømmekraft, transparens og evne til å bruke veiledning uten å outsource konklusjonen.', power_over_player:'Hun kan påvirke veiledning, vurderingsgrunnlag og institusjonelle anbefalinger innen mandat, men kan ikke gjøre kildene enige med henne eller automatisk gi grad og ansettelse.', wants:'At spørsmål, metode, motbevis og usikkerhet er tydelige nok til at faglig utvikling kan skje før sunk cost og status låser prosjektet.', conceals:'Hun har selv investert faglig prestisje i prosjektets retning og kan derfor undervurdere hvor vanskelig det er for en junior forsker å motsi hennes foretrukne ramme.', speech_style:'Presis og sokratisk; spør hva som ville svekke argumentet, hva som faktisk følger av kildene og hva som bare er prosjektets vane.', teaches_player:'At god veiledning styrker begrunnelse og uavhengighet, mens dårlig veiledningsbruk gjør autoritet til en skjult metode.' },
  { id:'joakim_archive_world', social_function:'Joakim gjør arkivets materialitet, proveniens, tilgang og stillhet til aktive betingelser for hva som kan hevdes, og utfordrer forskerens tendens til å se bare materialet som faktisk er tilgjengelig.', class_position:'Arkivar og kildeforvalter med infrastrukturell makt over metadata og tilgang, men uten tolkningsmonopol.', status:'Hans standing gjelder kildepresisjon, respekt for arkivkontekst og ærlighet om hva som mangler.', power_over_player:'Han kan avklare proveniens, metadata og tilgang og stoppe en feilaktig identifikasjon, men kan ikke bestemme den historiske forklaringen eller gi forskeren etikkgodkjenning.', wants:'At materialets opprinnelse, seleksjon, hull og representasjon blir stående synlig hele veien til manus.', conceals:'Arkivets egne ordningsprinsipper og institusjonelle historie kan gjøre noen spor lettere å se enn andre, og også hans praksis må kunne undersøkes kildekritisk.', speech_style:'Nøktern, katalog- og proveniensorientert; spør etter serie, signatur, versjon, tilgang og hva som ikke finnes.', teaches_player:'At arkivets struktur er en del av kunnskapsbetingelsen, men aldri en automatisk historisk konklusjon.' },
  { id:'sara_peer_world', social_function:'Sara gjør fagfellekritikk til en reell sosial risiko og faglig ressurs: hun tvinger rivalforklaringer, motbevis og begrepsbruk inn i samme argumentasjonsrom som forskerens foretrukne tese.', class_position:'Fagfelle og metodekollega med disiplinær status og innflytelse på review, men uten egen sannhetsmyndighet.', status:'Hennes standing handler om falsifiserbarhet, svar på kritikk og om revisjon faktisk følger argumentet som ble utfordret.', power_over_player:'Hun kan påvirke review og kollegial vurdering, men kan ikke gi grad, ansettelse, etikkgodkjenning eller automatisk publiseringsaksept.', wants:'At kritikk klassifiseres etter faglig betydning og fører til avgrenset revisjon når den faktisk treffer argumentet.', conceals:'Hun har egne historiografiske preferanser og kan også overvurdere hvor universell hennes metodeposisjon er.', speech_style:'Analytisk og konfronterende på premisser; spør hvilken rivalforklaring som er sterkest og hvilken observasjon som ville endret konklusjonen.', teaches_player:'At review er nyttig når prestisje oversettes tilbake til eksplisitte argumenter som kan prøves.' },
  { id:'malin_admin_world', social_function:'Malin gjør prosjektstyring, finansiering, etikk/personvern og leveransekrav til synlige rammer uten å tillate at styringsbehov blir historisk evidens.', class_position:'Forskningsadministrator med prosessmakt over rapportering og prosjektgrensesnitt, men uten mandat til å fastsette faglig konklusjon.', status:'Hennes standing gjelder om prosjektet er styrbart, ærlig om risiko og faktisk følger nødvendige porter.', power_over_player:'Hun kan kreve korrekt status og dokumentasjon og løfte etikk-, ressurs- eller finansieringsspørsmål, men kan ikke på egen hånd gi godkjenning eller kjøpe et bestemt funn.', wants:'At forskeren skiller klart mellom faglig usikkerhet, prosjektstatus, ressursbehov og beslutninger som krever andre mandat.', conceals:'Rapporteringssystemet belønner klare milepæler og kan gjøre legitim forskningstvil vanskelig å uttrykke uten at prosjektet ser svakere ut.', speech_style:'Strukturert og beslutningsorientert; spør etter status, avvik, eier, frist og hvilken formell port som fortsatt er åpen.', teaches_player:'At administrativ etterprøvbarhet kan beskytte forskning, men bare dersom den ikke forveksles med epistemisk sikkerhet.' },
  { id:'coauthor_world', social_function:'Medforfattergrensesnittet gjør kreditering, data- og kildearbeid, skrivearbeid og revisjonsbyrde sosialt synlig når prosjektets prestisje fordeles ulikt.', class_position:'Samarbeidspartner med faglig bidrag og forhandlingsmakt over manus og kreditering, men uten automatisk kontroll over andres arbeid.', status:'Standing gjelder rettferdig kreditering, tydelig handoff og om usynlig arbeid faktisk teller i prosjektets beslutninger.', power_over_player:'Kan forhandle forfatterskap og arbeidsdeling, men kan ikke gi formell ansettelse, finansiering eller sannhetsstatus til en påstand.', wants:'At versjoner, bidrag, åpne oppgaver og faglige innvendinger har synlig eier før manus sendes videre.', conceals:'Egen karriereusikkerhet kan gjøre kreditering og rekkefølge mer statusladet enn den eksplisitte samarbeidsretorikken tilsier.', speech_style:'Kollegial, konkret og tidvis forsiktig; peker på bidrag, ansvar og hva som faktisk ble gjort mellom to manusversjoner.', teaches_player:'At samarbeidets rettferdighet påvirker kunnskapskvalitet fordi usynlig arbeid også bærer kildekontroll, revisjon og institusjonell hukommelse.' },
  { id:'editor_gatekeeper_world', social_function:'Redaksjons- og publiseringsgrensesnittet gjør aksept, avslag, revisjonskrav, plassbegrensning og prestisje til konkrete krefter som kan presse påstandsstyrken.', class_position:'Redaktør eller akademisk portvakt med makt over én publiseringskanal, men uten universell akademisk eller historisk myndighet.', status:'Standing gjelder manusets pålitelighet, tydelige begrensninger og om revisjonsdialogen er faglig sporbar.', power_over_player:'Kan akseptere, avslå eller be om revisjon innen en kanal, men kan ikke gjøre aksept til sannhetsbevis eller gi forskeren grad og stilling.', wants:'At manusets påstander, begrensninger og endringer er presise nok til en reell redaksjonell beslutning.', conceals:'Tidsskriftets profil, konkurranse og ønsket om tydelige bidrag kan belønne skarpere konklusjoner enn et komplekst kildegrunnlag naturlig inviterer til.', speech_style:'Konsentrert og tekstnær; spør hva bidraget er, hva som faktisk dokumenteres og hvilke reviewpunkter som gjenstår.', teaches_player:'At publisering er en institusjonell port, ikke en epistemisk sluttstrek.' },
  { id:'private_counterweight_world', social_function:'Den private motvekten gjør midlertidighet, reviewskam, avslag og prestisje til menneskelige erfaringer uten å åpne en bakkanal for fortrolig forskningsmateriale.', class_position:'Nær relasjon uten akademisk mandat eller legitim tilgang til konfidensielle kilder, review eller personalopplysninger.', status:'Standing handler om tilgjengelighet, fortrolighet og om forskeren klarer å være mer enn prosjektets status.', power_over_player:'Kan påvirke restitusjon og selvforståelse, men kan ikke gi kvalifikasjon, evidens, etikkgodkjenning, finansiering eller publiseringsaksept.', wants:'At spilleren kan dele belastning uten å gjøre private relasjoner til jury over kolleger, fagfeller eller fortrolig materiale.', conceals:'Omsorg kan gjøre det fristende å bekrefte forskerens statusfortelling fremfor å utfordre hvordan prosjektet har overtatt identiteten.', speech_style:'Personlig og jordnær; spør hva arbeidet gjør med spilleren, ikke bare hvordan neste faglige kamp skal vinnes.', teaches_player:'At faglig uavhengighet også krever privat restitusjon og en grense mellom konfidensielt arbeid og behovet for støtte.' }
];

const slowAxes = [
  ['intellectual_independence_trust','Langsom tillit til at spørsmål og tese kan endres når evidens, motbevis og metode krever det.'],
  ['provenance_discipline_trust','Langsom tillit til at kildeproveniens, arkivhull og representasjon følger argumentet helt til publisering.'],
  ['review_responsiveness_trust','Langsom tillit til at review og rivalforklaringer behandles etter faglig relevans og ikke sosial rang.'],
  ['ethics_scope_integrity','Langsom tillit til at etikk, personvern, prosjektomfang og ressursgrenser beskrives sant før arbeid går videre.'],
  ['credit_and_invisible_work_fairness','Langsom tillit til at kreditering, handoff og usynlig forskningsarbeid fordeles og dokumenteres rettferdig.'],
  ['publication_maturity_trust','Langsom tillit til at publiseringstempo og prestisje ikke øker påstandsstyrken utover evidensen.'],
  ['correction_and_rework_trust','Langsom tillit til at feil, siteringskorreksjon og ny evidens faktisk kan gjenåpne berørte deler uten å slette historikken.'],
  ['professional_precarity_boundary','Langsom profesjonell standing som ikke komprimerer grad, ansettelse, finansiering og karriereusikkerhet til én omdømmemekanisme.'],
  ['private_identity_recovery','Langsom evne til å holde akademisk status, skam, konfidensialitet og privat egenverdi fra å flyte sammen.']
].map(([id, meaning]) => ({id, meaning, runtime_binding:'editorial_only_until_governed'}));

const days = [
  {title:'Forskningsspørsmålet er for bredt', tension:'Veiledningen viser at prosjektets brede spørsmål blander flere forklaringsnivåer og lover mer enn kildeplanen realistisk kan bære.', evidence:'forskningsloggen viser ulikheter mellom spørsmål, avgrensning, kildeplan og hva som faktisk kan falsifisere hovedargumentet', risk:'status og sunk cost kan gjøre avgrensning til et personlig nederlag fremfor metodisk forbedring', handoff:'en versjonert problemstilling med eksplisitt avgrensning, kontrollkriterium og neste kildeoppgave'},
  {title:'Arkivet er rikt, men skjevt', tension:'Det best bevarte materialet representerer én aktørgruppe langt bedre enn andre, og fraværet er i ferd med å forsvinne i den sterke dokumentasjonsmengden.', evidence:'proveniens- og tilgangssporet viser hvilke serier som er bevart, hvem som produserte dem og hvilke stemmer som mangler', risk:'mengden tilgjengelig materiale kan forveksles med representativitet og gjøre arkivets stillhet usynlig', handoff:'kildekritisk avgrensning med eksplisitt representasjonsproblem og søk etter alternative spor'},
  {title:'En ny kilde svekker hovedtesen', tension:'Et nytt funn undergraver et sentralt premiss etter at argumentet allerede er investert med tid, identitet og forventet publisering.', evidence:'den nye kilden er koblet til den konkrete påstanden den utfordrer, med proveniens og konsekvens for argumentrekken', risk:'forskeren kan tone ned motbeviset for å beskytte manus, veilederforventning eller egen status', handoff:'revidert argument med motbeviset synlig og bare berørte deler gjenåpnet'},
  {title:'Historiografisk rivalisering blir personlig', tension:'To etablerte fagtradisjoner leser samme materiale ulikt, og prosjektet risikerer å behandle metodisk uenighet som sosial tilhørighet.', evidence:'forskningsloggen skiller premisser, kilder, begreper og forklaringsnivå mellom rivalene', risk:'disciplinær lojalitet eller veilederrelasjon kan få større vekt enn eksplisitt argumentasjon', handoff:'sammenligning av rivalforklaringer med kriterier for hva som faktisk taler for hver posisjon'},
  {title:'Prosjektrapporten ønsker et tydeligere resultat', tension:'Finansierings- og prosjektgrensesnittet trenger en klar status mens analysen fortsatt har reell usikkerhet og åpne kilder.', evidence:'statussporet viser ferdige aktiviteter, åpne forskningsspørsmål, ressursbruk og hvilke resultater som ennå ikke er metodisk modne', risk:'rapporteringsbehov kan oversettes til falsk faglig sikkerhet eller et løfte om funn som ikke finnes', handoff:'styrbar prosjektstatus som skiller fremdrift fra historisk konklusjon og viser åpen risiko'},
  {title:'Usynlig kildearbeid blir krediteringsspørsmål', tension:'En samarbeidspartner har båret store deler av kildekontroll, metadata og revisjon, men manusets prestisje fordeles på en enklere måte.', evidence:'versjonshistorikken viser konkrete bidrag, handoffs og hvem som har gjort kontroll- og reworkarbeidet', risk:'statushierarki kan gjøre kritisk, men mindre synlig arbeid til gratis bakgrunnsinnsats og svekke både relasjon og kvalitet', handoff:'eksplisitt kreditering, oppgaveeierskap og dokumentert arbeidsdeling før neste manusversjon'},
  {title:'Konferanseprestisje presser påstandsstyrken', tension:'Et faglig arrangement belønner et tydelig bidrag, mens kildene fortsatt peker mot en mer betinget og mindre spektakulær konklusjon.', evidence:'argumentkartet viser hvilke ledd som er robuste, hvilke som er inferens og hvor usikkerheten fortsatt er materiell', risk:'offentlig akademisk status kan belønne en skarpere tese enn forskningsloggen tåler', handoff:'presenterbar påstand med eksplisitte begrensninger og spørsmål som fortsatt står åpne'},
  {title:'Publiseringsfristen kommer før kildekontrollen', tension:'Manuset kan sendes nå, men en sentral kildegruppe og siteringsrekke er ikke ferdig kontrollert.', evidence:'arbeidsobjektet viser nøyaktig hvilken påstand som avhenger av den uferdige kontrollen og hva en feil ville påvirke', risk:'frist og karrierepress kan bli behandlet som evidens for at analysen er moden', handoff:'enten fullført kontroll eller avgrenset påstand før manus får status som innsendingsklart'},
  {title:'Fagfellevurderingen utfordrer rivalforklaringen', tension:'Review kommer tilbake med en plausibel alternativ forklaring som treffer flere av manusets sentrale ledd.', evidence:'kommentaren kan kobles til konkrete påstander, kilder og antakelser i forskningsloggen', risk:'avslagsskam eller forsvar av sunk cost kan gjøre fagfellen til fiende i stedet for en test av argumentet', handoff:'klassifisert review med avgrenset rework og eksplisitt svar på rivalforklaringen'},
  {title:'Revisjon kan bli endeløs eller for kosmetisk', tension:'Etter review må forskeren avgjøre hvilke seksjoner som faktisk må gjenåpnes uten å skrive om hele prosjektet eller bare pynte språket.', evidence:'endringssporet viser hvilke påstander reviewen treffer, hvilke kilder som må prøves og hvilke deler som står uendret', risk:'enten kan prosjektet kollapse i grenseløs rework eller kritikken kan reduseres til kosmetiske tekstendringer', handoff:'bounded revisjon med eksplisitt eier, begrunnelse og nytt kontrollpunkt per berørt seksjon'},
  {title:'Etikk og personvern stopper en attraktiv kildebruk', tension:'Nytt materiale er analytisk fristende, men bruken krever en etikk- eller personvernavklaring som ikke er på plass.', evidence:'loggen skiller materialets forskningsverdi fra tilgangsgrunnlag, personvernstatus og hvilken godkjenning som faktisk mangler', risk:'faglig nysgjerrighet og frist kan gjøre en administrativ eller relasjonell snarvei attraktiv', handoff:'legitim ventestatus med riktig godkjenningslinje og alternativ analyse dersom avklaringen uteblir'},
  {title:'Karriereusikkerhet møter et nødvendig avslag', tension:'En midlertidig forsker vet at publikasjonen betyr mye for videre jobbmuligheter, samtidig som manusets sterkeste påstand fortsatt er for svak.', evidence:'forskningsloggen viser forskjellen mellom karrierebehovet og den konkrete evidensstyrken i påstanden', risk:'prekaritet kan gjøre overstatement rasjonelt på kort sikt selv om det svekker faglig integritet', handoff:'faglig avgrensning som bevarer sann status og gjør karrierekostnaden synlig uten å skrive den inn som evidens'},
  {title:'Redaksjonell aksept krever fortsatt siteringskontroll', tension:'Manuset nærmer seg aksept, men en siteringsfeil og et representasjonsproblem oppdages sent i prosessen.', evidence:'versjons- og kildesporet viser berørte avsnitt, hvilke lesere som kan bli villedet og hvordan korrigeringen påvirker argumentet', risk:'aksept og prestisje kan gjøre en stille retting fristende selv når lærings- og reviewsporet bør oppdateres', handoff:'sporbar korreksjon, revidert begrensning og tydelig melding til riktig redaksjonelt nivå'},
  {title:'Publisering er ikke slutten på forskningsansvaret', tension:'Etter publisering kommer en ny kilde og offentlig kritikk som gjør det nødvendig å vurdere hva som bør korrigeres, nyanseres eller forskes videre på.', evidence:'det publiserte argumentet kan kobles tilbake til kilde-, metode- og revisjonshistorikken og til det nye materialet', risk:'omdømmeforsvar kan gjøre korreksjon til trussel mot identitet eller presse frem en defensiv offentlig respons', handoff:'etterprøvbar vurdering av korreksjon, ny forskning og hvilke deler av den publiserte konklusjonen som fortsatt står'}
];

const phaseInfo = {
  morning:{beat_type:'task', lead:'Morgenoppgaven krever at spilleren arbeider direkte i forskningslogg og manusspor før sosialt eller institusjonelt press får definere problemet.'},
  lunch:{beat_type:'relationship', lead:'Relasjonsmøtet midt på dagen lar en annen aktør lese den samme forskningssituasjonen fra sin posisjon og gjøre den sosiale kostnaden ved valget synlig.'},
  afternoon:{beat_type:'decision', lead:'Ettermiddagens beslutning tvinger fram et eksplisitt valg om hva som kan lukkes, hva som må vente og hvilken del av argumentet eller prosessen som må gjenåpnes.'},
  evening:{beat_type:'private_consequence', lead:'Kveldsbeatet viser hvordan prestisje, review, usikkerhet og karrierepress følger forskeren hjem uten at privat støtte får bli evidens eller bakkanal for fortrolig materiale.'}
};

const threadIds = ['question_scope_and_advising','provenance_archive_and_silence','thesis_counterevidence_and_revision','peer_review_and_publication','funding_ethics_and_institutional_pressure','credit_invisible_work_and_academic_status','career_precarity_private_identity_and_correction'];
const dayThreads = [
  ['question_scope_and_advising','career_precarity_private_identity_and_correction'],
  ['provenance_archive_and_silence','question_scope_and_advising'],
  ['thesis_counterevidence_and_revision','question_scope_and_advising'],
  ['thesis_counterevidence_and_revision','peer_review_and_publication'],
  ['funding_ethics_and_institutional_pressure','career_precarity_private_identity_and_correction'],
  ['credit_invisible_work_and_academic_status','peer_review_and_publication'],
  ['peer_review_and_publication','career_precarity_private_identity_and_correction'],
  ['peer_review_and_publication','provenance_archive_and_silence'],
  ['peer_review_and_publication','thesis_counterevidence_and_revision'],
  ['thesis_counterevidence_and_revision','credit_invisible_work_and_academic_status'],
  ['funding_ethics_and_institutional_pressure','provenance_archive_and_silence'],
  ['career_precarity_private_identity_and_correction','peer_review_and_publication'],
  ['peer_review_and_publication','provenance_archive_and_silence'],
  ['career_precarity_private_identity_and_correction','thesis_counterevidence_and_revision']
];

const coverage = [];
const phases = ['morning','lunch','afternoon','evening'];
let slot = 0;
for (let day = 1; day <= 14; day += 1) {
  const d = days[day - 1];
  for (const phase of phases) {
    const info = phaseInfo[phase];
    const sourceRef = sourceRefs[slot % sourceRefs.length];
    const audienceId = audienceCycle[slot % audienceCycle.length];
    const audience = audienceById.get(audienceId);
    const summary = `Dag ${day}, ${phase}: ${d.title}. ${info.lead} Situasjonen er konkret: ${d.tension} Det dokumenterte evidensbildet er at ${d.evidence}. Den sentrale risikoen er at ${d.risk}. Forskningsrollen må samtidig holde fire nivåer adskilt: hva kildene faktisk viser, hva metode og historiografi tillater som tolkning, hva institusjonelle rammer eller kvalifikasjonskrav bestemmer, og hva mennesker rundt prosjektet ønsker eller frykter. Dagens arbeidskrav er ${d.handoff}. Beatet bruker canonical mail-proveniens ${sourceRef} som delivery-anker, men innfører ingen ny runtime og gjør ikke mailen til et parallelt forskningssystem. Forskningslogg og manusspor må bevare versjon, proveniens, metodevalg, motbevis, usikkerhet, etikkstatus, reviewpunkt, eier og neste kontroll slik at en senere mottaker kan rekonstruere hvorfor arbeidet gikk videre eller hvorfor det må gjenåpnes. Qualification_required, grad, ansettelse, finansiering, etikkgodkjenning og publiseringsaksept ligger fortsatt utenfor standing og History Go. Dermed blir ${d.title.toLowerCase()} både et kunnskapsproblem og et sosialt problem om hvem som kan definere modenhet, hvem som bærer usynlig arbeid, hvem som får kritisere, og hvem som faktisk har myndighet til neste institusjonelle beslutning.`;
    const standingConsequence = `Standing etter dag ${day}/${phase} er situert hos ${audienceId} langs aksen ${audience.standing_axis}, aldri en global reputation score. Denne gruppen bryr seg særlig om ${audience.cares_about[0]} og ${audience.cares_about[1]}. Hvis spilleren gjør ${d.handoff} synlig, kan tilliten styrkes her selv om en annen gruppe samtidig reagerer negativt på forsinkelse, avgrensning, ekstraarbeid, kritikk eller tapt prestisje. Hvis spilleren i stedet lar ${d.risk}, kan lokal status se bedre ut mens langsom standing svekkes hos dem som senere må stole på kilde-, review- eller arbeidsdelingen. ${audience.cannot_grant} Beatet må derfor kunne ende med divergerende sosial vurdering uten at standing får overstyre kilder, metode, qualification_required, etikk/personvern, finansieringsbeslutning, ansettelse eller publiseringslinje. Den profesjonelle læringen ligger i å tåle at en faglig nødvendig begrensning kan være upopulær nå, mens en sosialt belønnet snarvei kan bli dyr når motbevis, review, korreksjon eller krediteringsspørsmål kommer tilbake senere.`;
    coverage.push({day, phase, beat_type:info.beat_type, summary, thread_ids:dayThreads[day - 1], materialization_refs:[sourceRef], standing_audience:audienceId, standing_consequence:standingConsequence});
    slot += 1;
  }
}
must(coverage.length === 56, 'coverage count drifted');

const primaryThreads = [
  {id:'question_scope_and_advising',relationship:'Forholdet mellom veiledning, faglig autoritet og intellektuell uavhengighet: forskeren må kunne bruke senior kompetanse til å skjerpe spørsmål og metode uten å gjøre veilederens status til sannhetskriterium eller automatisk karriereport.',beat_refs:['1/morning','1/lunch','3/afternoon','4/lunch','7/morning','12/lunch','14/afternoon']},
  {id:'provenance_archive_and_silence',relationship:'Forholdet mellom arkivinfrastruktur, kildeproveniens og historisk fravær: sesongen viser hvordan bevaring, tilgang og metadata former hva som kan sees, samtidig som arkivets struktur må forbli et kildekritisk vilkår og ikke en ferdig tolkning.',beat_refs:['2/morning','2/afternoon','4/morning','8/lunch','11/morning','13/lunch','14/morning']},
  {id:'thesis_counterevidence_and_revision',relationship:'Forholdet mellom tese, sunk cost og motbevis: forskeren må kunne la ny evidens eller rivalforklaring endre argumentet uten å gjøre hele prosjektet verdiløst eller beskytte en attraktiv hovedtese bare fordi den allerede har fått sosial og personlig investering.',beat_refs:['3/morning','3/afternoon','4/afternoon','9/afternoon','10/morning','13/afternoon','14/afternoon']},
  {id:'peer_review_and_publication',relationship:'Forholdet mellom fagfellekontroll, redaksjonell makt og publiseringsprestisje: review og redaksjonelle porter kan forbedre et manus, men aksept, avslag og status må alltid oversettes tilbake til eksplisitte argumenter og ikke behandles som sannhetsbevis.',beat_refs:['7/lunch','8/afternoon','9/morning','9/afternoon','10/afternoon','13/morning','14/lunch']},
  {id:'funding_ethics_and_institutional_pressure',relationship:'Forholdet mellom finansiering, rapportering, etikk/personvern og epistemisk modenhet: institusjonelle krav er reelle og kan stoppe eller forme arbeidsflyten, men de kan verken kjøpe et historisk funn eller erstattes av uformell sosial tillit.',beat_refs:['5/morning','5/afternoon','8/morning','11/morning','11/afternoon','12/morning','14/morning']},
  {id:'credit_invisible_work_and_academic_status',relationship:'Forholdet mellom forfatterskap, usynlig kilde- og kontrollarbeid og akademisk status: kreditering og oppgaveeierskap påvirker både rettferdighet og kvalitet fordi arbeidet som lett forsvinner også bærer proveniens, revisjon og institusjonell hukommelse.',beat_refs:['2/lunch','6/morning','6/afternoon','8/lunch','10/lunch','12/afternoon','13/lunch']},
  {id:'career_precarity_private_identity_and_correction',relationship:'Forholdet mellom midlertidighet, framtidig ansettelse, reviewskam og privat identitet: karrierepress kan gjøre overstatement rasjonelt på kort sikt, og kveldsbeatene trener evnen til å tåle statuskostnad uten å lekke fortrolig materiale eller gjøre omdømme til kvalifikasjon.',beat_refs:['1/evening','5/evening','7/evening','9/evening','12/evening','13/evening','14/evening']}
];
for (const thread of primaryThreads) must(threadIds.includes(thread.id), `unknown thread ${thread.id}`);

const privateAftermath = [
  {id:'scope_and_identity_afterhours',description:'Etter at forskningsspørsmålet er avgrenset må spilleren tåle at mindre omfang kan føles som mindre ambisjon. Aftermathen skiller faglig forbedring fra privat status og hindrer at veilederens reaksjon blir dom over egen verdi eller skjult begrunnelse for neste metodevalg.',materialization_refs:[sourceRefs[0],sourceRefs[4]]},
  {id:'archive_silence_and_responsibility',description:'Etter møtet med et skjevt arkiv blir fraværet vanskelig å løse med mer arbeid alene. Aftermathen lar forskeren erkjenne begrensningen uten å fylle den privat med spekulasjon, skyld eller behov for en penere fortelling enn materialet tillater.',materialization_refs:[sourceRefs[1],sourceRefs[5]]},
  {id:'review_shame_and_recovery',description:'Et hardt review kan oppleves som offentlig avsløring av svakhet selv når kritikken er nyttig. Aftermathen trener restitusjon og gjør det mulig å gå tilbake til argumentet uten hevn, prestisjeforsvar eller privat deling av fortrolig reviewmateriale.',materialization_refs:[sourceRefs[8],sourceRefs[12]]},
  {id:'precarity_without_overstatement',description:'Når publikasjonen får karrierebetydning, blir skillet mellom behovet for jobb og evidensstyrken i manus personlig smertefullt. Aftermathen beskytter forskeren mot å gjøre prekaritet til faglig argument og mot å skjule kostnaden ved å avgrense en attraktiv påstand.',materialization_refs:[sourceRefs[2],knowledgeRef]},
  {id:'publication_afterlife_divergent_standing',description:'Ved sesongslutt finnes ingen samlet dom: noen fagfeller verdsetter revisjonen, en redaksjon husker forsinkelsen, en arkivar husker presis kildebruk, en samarbeidspartner husker krediteringen og privatlivet husker belastningen. Disse vurderingene får stå uten global score.',materialization_refs:[sourceRefs[9],sourceRefs[13],sourceRefs[14]]}
];

const delayedConsequences = [
  {id:'broad_question_returns_as_unmanageable_claim',setup_ref:'1/afternoon',return_ref:'4/morning',domains:['job','relationship','reputation']},
  {id:'archive_silence_returns_in_limitations',setup_ref:'2/morning',return_ref:'13/afternoon',domains:['job','reputation','narrative']},
  {id:'counterevidence_returns_in_peer_review',setup_ref:'3/afternoon',return_ref:'9/morning',domains:['job','relationship','reputation']},
  {id:'reporting_pressure_returns_at_publication',setup_ref:'5/afternoon',return_ref:'8/afternoon',domains:['job','reputation']},
  {id:'credit_decision_returns_in_collaboration',setup_ref:'6/afternoon',return_ref:'10/lunch',domains:['relationship','reputation','job']},
  {id:'conference_overstatement_returns_in_review',setup_ref:'7/afternoon',return_ref:'9/afternoon',domains:['job','reputation','narrative']},
  {id:'ethics_wait_returns_as_clean_boundary',setup_ref:'11/morning',return_ref:'13/morning',domains:['job','relationship','reputation']},
  {id:'precarity_status_returns_in_private_correction',setup_ref:'12/evening',return_ref:'14/evening',domains:['psyche','relationship','reputation']}
];

const world = {
  schema:'civication_role_world_v1',version:1,category:CATEGORY,role_scope:ROLE,
  title:'Historie / Forskning og akademia — kilder, review, status og situert tillit',status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan produsere historisk kunnskap i et akademisk system av veiledning, arkivtilgang, fagfellekontroll, finansiering, kreditering, publiseringsprestisje og midlertidighet uten at sosial rang eller karrierebehov blir erstatning for kilder og metode?',
    description:'Historisk forskning er både kunnskapsarbeid og en sosial praksis. Spørsmål og tolkninger formes i miljøer med senioritet, portvakter, prosjektfrister, usynlig arbeid, review og karriereusikkerhet. Sesongen gjør derfor standing situert: veiledere, arkivarer, fagfeller, administrasjon, samarbeidspartnere, redaksjoner, disiplinære miljøer og private relasjoner kan vurdere samme valg ulikt. Ingen av vurderingene komprimeres til global score eller får gi grad, kvalifikasjon, ansettelse, etikkgodkjenning, finansiering, publisering eller historisk sannhet.'
  },
  theme_ids:themes,
  social_environments:['forskningsdesign- og spørsmålsbordet der ambisjon må oversettes til et etterprøvbart spørsmål','arkiv- og kildesporet der proveniens, tilgang, representasjon og stillhet setter grenser for argumentet','analyse- og motprøvingsflaten der tese, rivalforklaring og motbevis må eksistere samtidig','fagfelle- og publiseringsflaten der review, revisjon, siteringskontroll og redaksjonell beslutning møtes','prosjekt- og finansieringsgrensen der fremdrift, etikk/personvern og ressurskrav må skilles fra historisk funn','samarbeids- og krediteringsrommet der usynlig arbeid, forfatterskap og handoff får sosial kostnad','privatlivet der midlertidighet, avslag og prestisje må kunne bearbeides uten å lekke fortrolig materiale'],
  recurring_people_archetypes:people,
  slow_axes:slowAxes,
  situated_reputation_model:{
    global_score_allowed:false,audiences,
    divergence_examples:[
      'Å avgrense et forskningsspørsmål kan koste status som ambisiøs hos én veileder eller finansieringspartner, men styrke metodekollegers tillit fordi prosjektet blir reelt etterprøvbart.',
      'Å beholde arkivets fravær synlig kan gjøre fortellingen mindre elegant for en redaksjon, men styrke standing hos kildeforvaltere og fagfeller som senere skal kontrollere representasjonen.',
      'Å la motbevis svekke hovedtesen kan koste kortsiktig konferanse- eller publiseringsprestisje og samtidig bygge langsom profesjonell tillit fordi argumentet faktisk kan revideres.',
      'En legitim etikk- eller personvernventing kan frustrere prosjektadministrasjon og samarbeidspartnere på frist, men beskytte institusjonell og profesjonell standing fordi grensen ble holdt riktig.',
      'Tydelig kreditering av usynlig kilde- og revisjonsarbeid kan skape forhandling om forfatterskap, men styrke samarbeidstillit og senere kvalitet ved at ansvar blir synlig.',
      'Et avslag eller stort review kan svekke forskerens private statusfølelse, men en presis og avgrenset revisjon kan styrke standing hos fagfeller uten å gi noen garanti om publisering.',
      'Å korrigere en siteringsfeil sent kan forsinke aksept og koste redaksjonell bekvemmelighet, men beskytte arkiv-, fagfelle- og framtidig arbeidsgivertillit.',
      'Privat støtte kan gjøre det mulig å tåle midlertidighet og kritikk, men gir ingen evidens, grad, qualification_required, finansiering eller rett til å dele konfidensielt materiale.'
    ],
    rule:'Standing er audience-spesifikk, langsom og divergerende. Samme beslutning kan bygge tillit i ett akademisk eller privat miljø og koste den i et annet. Ingen standing aggregeres til en global reputation score eller brukes som skjult kvalifikasjons-, ansettelses-, evidens-, etikk-, finansierings- eller publiseringsmekanisme.',
    authority_separation:'Ingen global standing, akademisk omdømme, History Go-badge eller sosial kapital kan skape evidens eller kildeautoritet, avgjøre et historisk funn eller diktere en konklusjon, gi grad eller oppfylle qualification_required, tildele ansettelse eller akademisk rang, gi etikk- eller personverngodkjenning, tildele finansiering eller budsjett, eller gi publiseringsaksept og publiseringsmyndighet. Standing beskriver relasjonell tillit til hvordan forskningen håndteres; kilder, metode og riktige formelle beslutningslinjer forblir autoritative.'
  },
  materialization:{authored_dimensions:['situated_reputation'],source_refs:sourceRefs,no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false},
  existing_work_continuity:{work_loops:grammar.work_loops,persistent_work_object:grammar.persistent_work_object_contract.id,rhythm:grammar.rhythm_contract,new_runtime_state:false,plan_steps:plan.sequence.length},
  history_go_affordance:{
    source_ref:knowledgeRef,badge_id:'historie',
    better_question:'History Go kan hjelpe forskeren å stille bedre spørsmål om periodisering, historiografi, arkivets stillhet, kildeutvalg, representasjon, anakronistiske kategorier og rivalforklaringer. Det bedre spørsmålet er ikke hva spillet allerede har «bevist», men hvilke kilder som mangler, hvem som produserte materialet, hvilke forklaringer som konkurrerer, hva som ville svekke hovedtesen, hvilke stemmer arkivet gjør usynlige og hvilket sikkerhetsnivå den konkrete påstanden tåler. Denne konteksten kan forbedre kildekritikk og motprøving, men selve forskningsloggen, de konkrete kildene, metodevalget og kvalifisert faglig arbeid må fortsatt avgjøre hva som kan hevdes.',
    authority_boundary:'History Go og et historie-Badge kan ikke autentisere en kilde, avgjøre et historisk funn eller diktere konklusjonen, gi grad eller kvalifikasjon, oppfylle qualification_required, gi forskeransettelse eller akademisk rang, gi etikk- eller personverngodkjenning, tildele finansiering eller garantere publiseringsaksept. Affordancen er bare kildekritisk, historiografisk og kontekstuell spørsmålsforbedring.'
  },
  cross_role_proof:{status:'not_materialized_not_required_for_rollout',shared_work_object_found:false,new_runtime:false,required_for_rollout:false,rule:'Canonical readiness says cross-role is not_required_for_rollout for Historie/Forskning og akademia. Plausible samarbeid, arkivhandoff, review eller redaksjonelle grensesnitt er ikke i seg selv et bevist shared work object / delt arbeidsobjekt og materialiseres derfor ikke som ny runtime.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,private_aftermath:privateAftermath,delayed_consequences:delayedConsequences
};

const useCounts = new Map(sourceRefs.map((ref) => [ref,0]));
for (const beat of coverage) useCounts.set(beat.materialization_refs[0], useCounts.get(beat.materialization_refs[0]) + 1);
for (const [ref,count] of useCounts) must(count >= 3, `${ref} underused: ${count}`);
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
