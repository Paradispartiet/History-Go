import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(value, null, 2) + '\n');
};
const writeText = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, value.endsWith('\n') ? value : value + '\n');
};

const CATEGORY = 'vitenskap';
const ROLE = 'vitenskap_undervisning_og_forskning';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_VITENSKAP_UNDERVISNING_OG_FORSKNING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TEST = 'tests/civication-vitenskap-undervisning-og-forskning-role-world-rollout.test.js';
const PERSISTENT = 'undervisnings_forsknings_veilednings_vurderings_habilitets_evidens_og_handoff_logg';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const refs = TYPES.flatMap((type) => {
  const catalog = readJson(catalogPath(type));
  return (catalog.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
if (refs.length !== 15 || new Set(refs).size !== 15) throw new Error(`Expected 15 canonical mail refs, got ${refs.length}/${new Set(refs).size}`);

const model = readJson(MODEL);
const grammar = readJson(GRAMMAR);
const plan = readJson(PLAN);
if (model.persistent_work_product?.id !== PERSISTENT) throw new Error('Persistent work object mismatch');
if ((model.related_people || []).length !== 4) throw new Error('Expected four canonical related_people');
if ((plan.sequence || []).length !== 16) throw new Error('Expected 16-step mail plan');
if (!(grammar.knowledge_dependencies || []).some((row) => row.badge_id === 'vitenskap')) throw new Error('Missing Vitenskap knowledge dependency');

const authorityBoundary = 'Førsteamanuensis og Professor er qualification_required og krever academic_qualification_and_employment. Vitenskap-badge, XP, professortittel, publikasjonsstatus, nettverk, popularitet, sosial standing eller History Go-kunnskap kan aldri etablere ansettelsen, gjøre veilederrollen til sensurmyndighet, love karakter eller klageutfall, gi tilgang til student- eller forskningsdata, opprette etikk- eller personverngodkjenning eller utvide annen formell myndighet. Faktisk emneansvar, veiledningsrolle, sensoroppnevning, prosjektmandat, dataadgang, habilitet og institusjonelle prosesser må dokumenteres på sine egne premisser.';
const historyBoundary = 'History Go kan gi historisk og stedlig kontekst om universiteter, fagtradisjoner, vitenskapshistorie, studentbevegelser, utdanningsreformer, kunnskapskonflikter og hvordan institusjoner har organisert undervisning og forskning. Den konteksten er bare en better-question-affordance. Den er aldri dagens academic_qualification_and_employment, vurderingsgrunnlag, sensoroppnevning, habilitetsvurdering, klagegrunnlag, studentdata, forskningsdata, metodeevidens, samtykke, krediteringsgrunnlag, etikkgodkjenning, personvernbehandlingsgrunnlag, sikkerhetsgodkjenning eller institusjonell myndighet.';
const continuity = 'Det vedvarende arbeidsobjektet skal beholde tidligere versjoner av læringsmål, pensumvalg, undervisningsforpliktelser, forskningsspørsmål, data- og metodebeslutninger, veiledningsgrenser, studentens selvstendighet, vurderingskriterier, habilitet, kreditering, etikk, usikkerhet, ventestatus, beslutningseier og handoff. Når ny evidens eller en prosessfeil krever omarbeiding, gjenåpnes bare de berørte leddene. Tidligere begrunnelser beholdes slik at bounded rework kan skilles fra etterrasjonalisering, og slik at en kollega faktisk kan overta arbeidet uten å gjette hva som ble gjort eller hvorfor.';
const socialTension = 'Den sosiale kostnaden skal være synlig. Studenter kan belønne tilgjengelighet som gjør forskningsarbeidet uholdbart; forskerkolleger kan belønne publiseringsfart som skyver undervisning eller dokumentasjon nedover; en veiledningsrelasjon kan oppleve en metodisk korrigering som støtte eller kontroll; en habilitetsavklaring kan svekke kortsiktig status hos nære kolleger samtidig som den styrker tillit til vurderingsprosessen. Rollen skal bevare slike motstridende vurderinger i separate audiences og aldri komprimere dem til én global reputation score.';
const professionalRule = 'Et sterkt akademisk valg skiller faglig skjønn fra formell myndighet, beskriver evidensstyrke og usikkerhet, gjør den svakere partens rettigheter synlige, viser hvem som eier neste beslutning og sier hva som må vente. Senioritet kan gi erfaring, men er ikke et unntak fra habilitet, studentrettigheter, kreditering, forskningsetikk, personvern, reproduserbarhet eller klageordning. Profesjonell venting og eksplisitt handoff er bedre enn en rask løsning når nødvendig oppnevning, samtykke, dataadgang, kvalitetssikring eller uavhengig prosess mangler.';

const themes = ['professional_culture','status_anxiety','shame_reputation','precarity','public_attention','public_private_leakage','local_knowledge_vs_system','care_vs_efficiency','invisible_work','loyalty_up_down'];
const environments = [
  'Emneplan- og undervisningsflaten der læringsmål, pensum, forskningsfront, studentforutsetninger og faktisk undervisningskapasitet må holdes sammen uten at nyhet eller professortittel blir kvalitetsbevis.',
  'Forskningsflaten der spørsmål, data, metode, kode, analyse, negative funn, reproduserbarhet og usikkerhet må tåle at en kollega forsøker å forstå eller gjenskape arbeidet.',
  'Veiledningsrommet der støtte, faglig retning og prosjektbehov møter studentens selvstendighet, avhengighetsforhold, kreditering, samtykke og rett til å eie sitt arbeid.',
  'Vurderings- og sensurflaten der kriterier, oppnevning, habilitet, konfidensialitet, begrunnelse og klagevei må stå sterkere enn status, tidspress eller personlig kjennskap.',
  'Seminar- og kollegaflaten der faglig uenighet, pensumendring, metodekritikk og ulike karrierestatusser blir sosialt synlige og kan påvirke lokal standing uten å avgjøre hva som er sant.',
  'Publiserings- og krediteringsflaten der forfatterskap, bidrag, studentmateriale, rettigheter, data- og etikkgrenser må avklares før prestisje eller frist gjør bidrag usynlige.',
  'Administrativ kvalitets- og studentrettighetsflate der emneevaluering, tilrettelegging, klage, frister, kapasitet og dokumentasjonskrav må oversettes til faktisk akademisk arbeid.',
  'Offentlig formidlingsflate der forskning og undervisning blir synlig uten at forenkling, medietrykk eller omdømme gjør en usikker konklusjon sikrere enn evidensen tillater.',
  'Privatlivet etter arbeidstid der ansvar for studenter, forskningsfrister og profesjonell status kan lekke hjem, men fortrolige student- og forskningsopplysninger og formelle beslutninger må bli på riktig arbeidsflate.'
];

const audiences = [
  ['studenter_og_laringsmiljo',['forutsigbar undervisning og reell faglig støtte','rettferdig vurdering, selvstendighet og tydelige klageveier']],
  ['veiledningsrelasjoner_og_kandidater',['støtte uten overtakelse av arbeidet','kreditering, samtykke og tydelige prosjektgrenser']],
  ['fagkolleger_og_forskningsmiljo',['metodisk etterprøvbarhet og ærlig usikkerhet','kollegial kritikk uten statusstraff']],
  ['sensorer_programledelse_og_kvalitetsfunksjoner',['kriterier, habilitet og sporbar vurderingsprosess','sammenheng mellom læringsmål, undervisning og vurdering']],
  ['etikk_personvern_og_integritetsfunksjoner',['uavhengig behandling av risiko og avvik','at data, rettigheter og godkjenninger ikke omgås for fremdrift']],
  ['institusjonsadministrasjon_og_ressursmiljo',['realistisk prioritering mellom undervisning og forskning','overførbar dokumentasjon, venting og handoff']],
  ['offentlighet_partnere_og_faglig_omverden',['presis formidling av kunnskap og usikkerhet','klart skille mellom samarbeid, interesse og faglig konklusjon']],
  ['private_relations_og_rollegrenser',['bærekraftig arbeid–hjem-grense','at fortrolige saker og akademisk myndighet ikke flyttes hjem']]
].map(([id, cares_about]) => ({
  id,
  cares_about,
  cannot_grant: `Denne standing-audiencen kan påvirke lokal tillit, framtidig samarbeidsvilje og hvordan tidligere valg fortolkes, men kan ikke gjøre sosial støtte til kvalifikasjon, oppnevning, evidens eller formell myndighet. ${authorityBoundary} ${historyBoundary}`
}));

const people = [
  ['ida_emnekvalitet_world','Gjør læringsmål, pensumvalg, studentforutsetninger og forskningskobling konkrete før emnearbeid reduseres til kalender eller forelesningsmengde.','Emne-/programkollega med faglig og koordinerende innflytelse, men uten generell myndighet over spillerens forskning eller studentenes formelle rettigheter.','Høy lokal status når undervisning skal henge sammen over semesteret.','Kan kreve begrunnelse og koordinering, men kan ikke gjøre emneplan til forskningsbevis eller overstyre habilitet og klageprosess.','At studentene møter et sammenhengende emne der oppdatert evidens faktisk endrer undervisningen.','At kapasitetsproblemer ofte skjules som individuelle planleggingsfeil.','Konkret og studentnær; spør hva studenten faktisk skal lære, gjøre og få tilbakemelding på.','At forskningsledet undervisning krever mer enn å sette egne artikler på pensum.'],
  ['amir_metode_world','Gjør data, metode, kode, analyse, negative funn og reproduserbarhet synlige når publiserings- og undervisningsfrister kolliderer.','Forskerkollega med metodekompetanse og epistemisk innflytelse, ikke formell kontroll over sannhet eller ansettelse.','Høy faglig standing når resultater må kunne etterprøves.','Kan utfordre analyse og returnere utilstrekkelig dokumentasjon, men kan ikke bruke egen senioritet som fasit.','At en kollega kan forstå hva som ble gjort og hvorfor, også når resultatet er mindre attraktivt.','At sosial prestisje gjør det vanskeligere å innrømme at et etablert analysegrep må gjøres om.','Nøktern og testende; spør hva som ville falsifisere påstanden og hva som mangler for reproduksjon.','At korrigerbarhet er en sosial praksis, ikke bare et teknisk vedlegg.'],
  ['nora_studentrettigheter_world','Gjør vurderingskriterier, klagevei, tilrettelegging, konfidensialitet og prosessuelle rettigheter synlige i den akademiske hverdagen.','Studie-/kvalitetskontakt med prosesskompetanse, ikke faglig sensurmyndighet uten oppnevning.','Høy prosessstatus når en uformell løsning kan få formelle konsekvenser for studenten.','Kan kreve korrekt prosess og dokumentasjon, men kan ikke bestemme faglig resultat på spillerens vegne.','At studentens rettigheter er forståelige før en konflikt oppstår.','At fagmiljøet noen ganger omtaler prosesskrav som administrativt støy når de egentlig beskytter asymmetrisk makt.','Rolig og presis; spør hvilken rolle du faktisk har, hvilke kriterier som gjelder og hvor studenten kan klage.','At rettferdighet må være designet inn før utfallet er kjent.'],
  ['ragnhild_habilitet_og_etikk_world','Gjør habilitet, samtykke, personvern, forskningsetikk og uavhengig vurdering til harde grenser når relasjoner eller prestisje trekker motsatt vei.','Etikk-/integritetskontakt med uavhengig prosessrolle utenfor spillerens frie skjønn.','Høy prosessstatus i saker der spiller, veileder eller forskningsgruppe selv har interesse.','Kan kreve stans, dokumentbevaring og eskalering, men kan ikke instrueres til ønsket konklusjon av en professor.','At avhengighetsforhold og interessekonflikter blir synlige tidlig nok til å håndteres.','At ønsket om å beskytte en student, kollega eller publikasjon kan kamuflere en prosess som ikke er uavhengig.','Grensesterk og konkret; spør hvem som er habil, hvilket grunnlag som finnes og hvem som må overta.','At ansvarlighet ofte krever å gi fra seg kontroll over saken.'],
  ['maja_veiledning_world','Gjør studentens eller kandidatens selvstendighet, prosjektgrenser, fremdrift og kreditering konkret når veilederens forskning også har noe å vinne.','Veiledningsrelasjon med svakere institusjonell posisjon og høy avhengighet av tydelige grenser.','Høy moralsk og pedagogisk betydning, men begrenset formell makt.','Kan trekke samtykke innen gjeldende rammer, be om avklaring og utfordre kreditering, men kan ikke gi veilederen sensor- eller datafullmakt.','Å få reell støtte uten å miste eierskap til eget arbeid.','At studenten kan si ja av avhengighet lenge før det faktisk oppleves frivillig.','Forsiktig, konkret og observant; spør hvem som eier ideen, dataene og beslutningen.','At god veiledning må tåle et nei uten at relasjonen straffer studenten.'],
  ['jonas_publisering_world','Gjør forfatterskap, bidrag, datarettigheter, review, negative funn og fristpress til synlige samarbeidsproblemer.','Publiserings-/prosjektkollega med tilgang til nettverk og prestisje, men ikke rett til å fordele kreditering etter status.','Høy uformell status i publiseringsløpet.','Kan forsinke manus og kreve avklaringer, men kan ikke gjøre prosjektleder- eller professortittel til automatisk forfatterskap.','At bidrag og ansvar kan forsvares også etter publisering.','At frist og karrierepress gjør diffuse bidragsgrenser sosialt bekvemme.','Direkte og deadline-orientert; spør hvem som gjorde hva, hvem som kan stå for innholdet og hva som må avklares før innsending.','At kreditering er arbeidsdeling og ansvar, ikke høflighetsrangering.'],
  ['lea_offentlighet_world','Gjør samfunnsoppdrag, formidling, partnerforventninger og offentlig oppmerksomhet synlige uten å gjøre respons til evidens.','Formidlings-/samfunnskontakt med tilgang til publikum og samarbeid, ikke faglig godkjenningsmyndighet.','Høy ekstern synlighet når forskning eller undervisning blir offentlig kontroversiell.','Kan be om tydelig språk og koordinering, men kan ikke kreve sikrere konklusjoner enn evidensen tillater.','At komplisert kunnskap kan kommuniseres uten falsk sikkerhet eller unødig eksklusjon.','At et tydelig budskap ofte belønnes mer enn en korrekt beskrivelse av usikkerhet.','Klar og publikumsorientert; spør hva vi vet, hva vi ikke vet og hva publikum faktisk trenger for å forstå forskjellen.','At offentlig standing kan øke samtidig som faglig integritet svekkes, og omvendt.'],
  ['privat_naer_relasjon_world','Gjør arbeidstid, statuspress, studentansvar og forskningsfrister synlige etter arbeidstid uten å flytte fortrolige saker hjem.','Nær privat relasjon uten akademisk, sensorisk, data- eller institusjonell myndighet.','Høy emosjonell betydning, ingen formell fullmakt.','Kan støtte, utfordre grenseløs tilgjengelighet og speile stress, men kan ikke være uregistrert saksbehandler eller datamottaker.','At arbeid kan være viktig uten å eie hele døgnet.','At skam etter konflikt eller feil kan gjøre det fristende å dele mer om studenten eller forskningen enn rollen tillater.','Hverdagslig og direkte; spør hva som faktisk må gjøres nå og hva som kan vente til riktig arbeidsflate.','At bærekraftig akademisk arbeid også krever en fungerende privat grense.']
].map(([id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player]) => ({id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player}));

const slowAxes = [
  ['studenttillit','Hvor konsekvent undervisning, veiledning og vurdering beskytter studentens selvstendighet, forståelige kriterier og rettigheter.'],
  ['faglig_korrigerbarhet','Hvor lett data, metode, analyse og pensum kan utfordres og revideres uten statustap som skjuler feil.'],
  ['vurderingsintegritet','Hvor tydelig oppnevning, habilitet, kriterier, konfidensialitet og klage holdes adskilt fra relasjoner og senioritet.'],
  ['veiledningsgrense','Hvor godt støtte og faglig retning gis uten at veilederen overtar studentens problem, data, tekst eller konklusjon.'],
  ['krediteringsrettferdighet','Hvor synlig bidrag, samtykke, forfatterskap og rettigheter håndteres når status og avhengighet er ulikt fordelt.'],
  ['undervisning_forskning_balanse','Hvor eksplisitt tids- og kapasitetskollisjoner prioriteres uten at studentoppfølging eller reproduserbarhet blir skjulte salderingsposter.'],
  ['offentlig_faglig_tillit','Hvor presist faglig uenighet, usikkerhet og begrensninger kommuniseres når offentlighet og samarbeid belønner tydelighet.'],
  ['kollegial_trygghet','Hvor mulig det er å gi metodekritikk, si fra om feil og be om rework uten at lokal status blir sanksjonsmiddel.'],
  ['arbeid_hjem_grense','Hvor bærekraftig akademisk ansvar holdes adskilt fra privatliv, fortrolige studentforhold og uregistrert forskningsarbeid.']
].map(([id,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const topics = [
  ['forskningsledet undervisning og emneplan','Ny evidens utfordrer et etablert undervisningsopplegg. Spilleren må skille hva som bør oppdateres nå, hva studentene må få forklart om uenighet og usikkerhet, og hva som fortsatt trenger faglig kvalitetssikring før pensum eller læringsmål endres.'],
  ['undervisningsuke mot forskningsfrist','En analyse- eller manusfrist kolliderer med undervisning, tilbakemelding og studentoppfølging. Prioriteringen må synliggjøre hva som utsettes, hvem som berøres og hvilken handoff som faktisk gjør løftet realistisk.'],
  ['veiledning og studentens selvstendighet','Et prosjekt trenger fremdrift, men veilederens forslag begynner å definere studentens problem, metode eller konklusjon. Spilleren må støtte uten å overta og gjøre avhengighetsforholdet eksplisitt.'],
  ['studentarbeid, data og kreditering','Studentens tekst, data eller idé kan styrke en publikasjon. Samtykke, rettigheter, bidrag og kreditering er ikke ferdig avklart, og tidspress gjør en uformell løsning fristende.'],
  ['vurdering, sensur og habilitet','Spilleren blir bedt om å vurdere arbeid fra en person eller et miljø med nær faglig relasjon. Faglig kjennskap kan være relevant, men oppnevning og habilitet må avklares før vurderingen fortsetter.'],
  ['klage, begrunnelse og studentrettigheter','En student utfordrer et vurderingsutfall og mener kriteriene ble brukt inkonsistent. Spilleren må bevare konfidensialitet, skille egen forklaring fra formell klagebehandling og sikre at riktig prosess eier neste steg.'],
  ['reproduserbarhet under tidspress','Analysen ser lovende ut, men kode, dataflyt eller metodebeskrivelse er ikke god nok til at en kollega kan gjenskape resultatet. Publisering og undervisningsstart presser i motsatt retning.'],
  ['negative funn og publiseringsstatus','Et forventet resultat uteblir. Prosjektets fortelling, samarbeid og karrierestatus gjør det sosialt enklere å tone ned usikkerheten enn å undersøke hva null- eller negativt funn faktisk betyr.'],
  ['forfatterskap og bidragsgrenser','Et manus nærmer seg innsending mens bidragene er ujevnt dokumentert. Senioritet og relasjoner trekker mot en rask forfatterliste; ansvar og faktisk arbeid trekker mot en ny avklaring.'],
  ['forskningsetikk, personvern og datatilgang','Nytt analysetilfelle eller undervisningsbruk frister til å gjenbruke data uten at formål, samtykke, tilgang eller rettighetsgrunnlag er tydelig nok.'],
  ['faglig uenighet i seminar og pensum','Kollegaer er uenige om evidensstyrke og hva studentene skal lære som etablert kunnskap. Spilleren må kunne presentere uenigheten uten å gjøre egen senioritet til sluttargument.'],
  ['offentlig formidling og usikkerhet','Et offentlig spørsmål krever et kort svar på en komplisert forskningssak. Synlighet og institusjonelt omdømme belønner sikkerhet, mens evidensen krever forbehold og tydelig skille mellom funn, tolkning og spekulasjon.'],
  ['kollegial kritikk, feil og bounded rework','En kollega finner en svakhet i metode, undervisningsmateriale eller vurderingsopplegg. Spilleren må avgjøre hva som faktisk må gjøres om, hva som kan stå, og hvordan læring dokumenteres uten å skjule den opprinnelige feilen.'],
  ['avslutning, handoff og arbeid–hjem-grense','Sesongens åpne undervisnings-, forsknings-, veilednings- og vurderingssaker skal kunne overtas. Spilleren må lukke, vente eller overlevere eksplisitt og tåle at ikke all sosial standing kan repareres før arbeidsdagen slutter.']
];
const phaseText = {
  morning: 'Morgenen er konkret faglig produksjon. Spilleren må oppdatere arbeidsloggen før nye løfter gis, skille det som allerede er besluttet fra det som fortsatt er et faglig forslag, og vise hvilke student-, data-, metode- eller vurderingsavhengigheter som må være på plass før arbeidet kan fortsette.',
  lunch: 'Lunsjen er en relasjonell kontrollflate. En person med annen posisjon husker tidligere valg og tester om spilleren kan forklare gevinst, tap, usikkerhet og prosess uten å bruke professortittel eller tilgjengelighet som sosialt press. Det som ble sagt i en tidligere dag kan derfor komme tilbake som tillit eller skepsis.',
  afternoon: 'Ettermiddagen tvinger fram en avgrenset beslutning. Spilleren må si hva som kan avgjøres innen den konkrete rollen, hva som krever sensor-, klage-, etikk-, personvern- eller annen institusjonell prosess, og hva som må vente. Beslutningen skal være mulig å revidere når nytt grunnlag kommer.',
  evening: 'Kvelden viser privat konsekvens og langsom sosial hukommelse. Arbeidets status, skyld og frister kan følge spilleren hjem, men studentopplysninger, forskningsdata og formelle vurderingssaker kan ikke gjøre det. Spilleren må bevare en profesjonell grense selv når det ville vært følelsesmessig enklere å forklare seg med fortrolige detaljer.'
};
const phaseTypes = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const [topic, detail] = topics[day - 1];
  for (let p = 0; p < 4; p += 1) {
    const phase = ['morning','lunch','afternoon','evening'][p];
    const i = (day - 1) * 4 + p;
    const audience = audiences[i % audiences.length];
    const mailRef = refs[i % refs.length];
    const summary = `Dag ${day}, ${phase}, handler om ${topic}. ${detail} ${phaseText[phase]} ${continuity} ${socialTension} ${professionalRule} ${authorityBoundary} ${historyBoundary} Beatet er unikt for dag ${day}/${phase}: tidligere valg i denne saken skal kunne påvirke hvem som stoler på forklaringen, hvem som krever mer dokumentasjon, og hvor mye relasjonell friksjon spilleren møter, men aldri hva som teller som kvalifikasjon, evidens eller formell myndighet.`;
    const standing = `For ${audience.id} endres lokal standing av hvordan ${topic} håndteres over tid. Standing styrkes når spilleren gjør kriterier, usikkerhet, rolle, habilitet, studentens selvstendighet, kreditering, data- og metodegrunnlag, venting og handoff synlig før utfallet låses. Standing svekkes når senioritet, publiseringspress, nær relasjon, tilgjengelighet eller offentlig omdømme brukes som erstatning for sporbar begrunnelse, eller når kostnaden skyves til en student eller kollega med mindre makt. Denne audience-vurderingen kan samtidig stå i konflikt med andre audiences, og det finnes ingen global reputation score. ${authorityBoundary} Standing kan heller aldri gjøre History Go-kontekst til dagens vurderingsgrunnlag, evidens, samtykke eller institusjonelle myndighet.`;
    if (summary.length < 1200) throw new Error(`Summary too short ${day}/${phase}/${summary.length}`);
    if (standing.length < 650) throw new Error(`Standing too short ${day}/${phase}/${standing.length}`);
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary,
      thread_ids: [],
      materialization_refs: [mailRef],
      standing_audience: audience.id,
      standing_consequence: standing
    });
  }
}
if (coverage.length !== 56 || new Set(coverage.map((b) => `${b.day}/${b.phase}`)).size !== 56 || new Set(coverage.map((b) => b.summary)).size !== 56) throw new Error('Coverage uniqueness failed');
const usage = new Map(refs.map((ref) => [ref, 0]));
for (const beat of coverage) usage.set(beat.materialization_refs[0], usage.get(beat.materialization_refs[0]) + 1);
for (const [ref, count] of usage) if (count < 3) throw new Error(`Mail ref underused ${ref}/${count}`);

const refAt = (day, phase) => `${day}/${phase}`;
const threadSpecs = [
  ['undervisning_forskning_tidskonflikt','Forholdet mellom undervisningsansvar, forskningstid og institusjonell kapasitet utvikler seg gjennom flere dager. Spilleren må tåle at god undervisning og etterprøvbar forskning begge er reelle forpliktelser, og at den sosiale løsningen ofte er å skjule hvilken gruppe som betaler for overbelastningen. Tråden belønner synlig prioritering, tidlig handoff, realistiske løfter og evnen til å gjenåpne bare berørte deler av planen når kapasiteten endres. Den straffer ikke lav prestisje, men gjør skjult saldering og statusbasert unntak sosialt kostbart. Ingen lokal standing kan gjøre en overbelastet kalender til ny myndighet eller fjerne studentrettigheter, metodekrav eller forskningsintegritet.',[refAt(1,'morning'),refAt(2,'morning'),refAt(2,'afternoon'),refAt(6,'lunch'),refAt(8,'morning'),refAt(13,'afternoon'),refAt(14,'evening')]],
  ['veiledning_selvstendighet_og_avhengighet','Veiledningstråden følger hvordan faglig støtte kan bli styring når studenten eller kandidaten er avhengig av spillerens tid, nettverk eller anerkjennelse. Små valg om problemformulering, data, analyse, kreditering og frister bygger en relasjonell hukommelse som senere påvirker om et råd oppleves som hjelp eller press. Spilleren må vise prosjektgrenser, tåle uenighet, skille veiledning fra sensur og beskytte et reelt nei. Standing kan bli høy hos prosjektet og lav hos studenten samtidig; verden skal bevare dette spriket. Senioritet eller god relasjon kan aldri bli samtykke, sensoroppnevning eller eierskap til studentens arbeid.',[refAt(3,'morning'),refAt(3,'lunch'),refAt(4,'afternoon'),refAt(6,'evening'),refAt(9,'lunch'),refAt(10,'afternoon'),refAt(14,'morning')]],
  ['vurdering_habilitet_og_klage','Vurderingstråden gjør kriterier, sensoroppnevning, habilitet, begrunnelse og klage til et sosialt system, ikke bare skjemaer. Spilleren møter press fra kjennskap, tid, faglig autoritet og ønsket om å være hjelpsom. Det avgjørende er om rettferdig prosess ble etablert før karakter eller konflikt gjorde utfallet personlig. En habilitetsavklaring kan irritere kolleger og samtidig styrke studenttillit; en rask uformell løsning kan gjøre det motsatte. Tråden holder derfor local standing separert og lar ingen audience gjøre popularitet, professortittel eller tidligere gode vurderinger til formell sensur- eller klagemyndighet.',[refAt(5,'morning'),refAt(5,'lunch'),refAt(5,'afternoon'),refAt(6,'morning'),refAt(6,'afternoon'),refAt(11,'lunch'),refAt(14,'afternoon')]],
  ['metode_reproduserbarhet_og_negative_funn','Forskningssporet følger et resultat fra første lovende analyse til kritikk, reproduksjon, mulig negativt funn og senere formidling. Spilleren må bevare data- og metodespor, beskrive hva som faktisk ble gjort, og kunne endre konklusjon uten å skrive om historien. Lokal status kan falle når et spennende resultat blir svakere, men faglig tillit kan øke når usikkerheten synliggjøres. Tråden gjør dette spriket spillbart uten å gi en global score. Publiseringspress, samarbeid eller History Go-kontekst kan aldri erstatte data, metodeevidens, nødvendig godkjenning eller den konkrete forskningsrollen.',[refAt(7,'morning'),refAt(7,'afternoon'),refAt(8,'lunch'),refAt(8,'afternoon'),refAt(10,'morning'),refAt(12,'afternoon'),refAt(13,'morning')]],
  ['kreditering_forfatterskap_og_rettigheter','Krediteringstråden følger hvem som bidrar med idé, data, tekst, analyse og ansvar, særlig når student og senior forsker står ulikt. Frister og sosial høflighet kan gjøre en uklar forfatterliste enklere enn en eksplisitt bidragsavklaring, men senere konflikt gjør den tidlige vagheten synlig. Spilleren må beskytte samtykke, rettigheter og reell bidragsvurdering og tåle at en sosialt sterk kollega blir misfornøyd. Standing hos én gruppe kan derfor falle mens tillit hos en annen styrkes. Ingen audience kan gi eierskap til studentarbeid eller gjøre professortittel til automatisk forfatterskap.',[refAt(4,'morning'),refAt(4,'lunch'),refAt(9,'morning'),refAt(9,'afternoon'),refAt(10,'lunch'),refAt(13,'lunch'),refAt(14,'lunch')]],
  ['faglig_uenighet_pensum_og_offentlighet','Denne tråden følger hvordan faglig uenighet beveger seg mellom seminar, pensum, undervisning og offentlig formidling. Spilleren må skille hva feltet vet, hva det diskuterer, og hva som bare er egen preferanse. Senioritet kan gi stemme og ansvar, men kan ikke gjøre uenighet ulovlig eller evidensen sikrere. Studenter, kolleger og offentlighet kan belønne ulike grader av tydelighet, og en korrekt usikker formulering kan gi lavere kortsiktig synlighet enn en skarp påstand. Role World-en skal huske disse lokale konsekvensene uten å gjøre medierespons, studentpopularitet eller faglig rang til sannhetsmål eller formell myndighet.',[refAt(1,'afternoon'),refAt(1,'evening'),refAt(11,'morning'),refAt(11,'afternoon'),refAt(12,'morning'),refAt(12,'lunch'),refAt(12,'evening')]],
  ['feil_rework_handoff_og_privat_grense','Avslutningstråden følger hva som skjer når feil, restarbeid og relasjonell kostnad ikke kan løses i samme øyeblikk. Spilleren må gjøre bounded rework, navngi ventestatus og beslutningseier, og lage en handoff som lar en annen overta uten å miste historikken. Samtidig presses privatlivet av skam, status og følelsen av å skylde studenter eller kolleger mer tid. Den profesjonelle løsningen er ikke å flytte fortrolige saker hjem, men å skille det som må sikres nå fra det som kan vente. Lokal standing kan forbli uavklart ved sesongslutt; det er ikke en feil og gir aldri ekstra akademisk myndighet.',[refAt(7,'evening'),refAt(8,'evening'),refAt(9,'evening'),refAt(10,'evening'),refAt(11,'evening'),refAt(13,'evening'),refAt(14,'evening')]]
];
for (const [id,,beatRefs] of threadSpecs) for (const beatRef of beatRefs) {
  const beat = coverage.find((b) => `${b.day}/${b.phase}` === beatRef);
  if (!beat) throw new Error(`Missing beat for thread ${id}/${beatRef}`);
  beat.thread_ids.push(id);
}
const primaryThreads = threadSpecs.map(([id,relationship,beat_refs]) => ({id,relationship,beat_refs}));
for (const thread of primaryThreads) if (thread.relationship.length < 500) throw new Error(`Thread relationship too short ${thread.id}/${thread.relationship.length}`);

const privateAftermath = [
  ['etter_en_vanskelig_vurderingsdag','Etter en vurderingskonflikt merker spilleren hvor lett profesjonell begrunnelse blir til privat grubling. Rollen skal la ubehaget være reelt uten at studenten, karakteren eller klagesaken flyttes inn i privat samtale.',refs[5]],
  ['etter_metodekritikk','Metodekritikk kan treffe både faglig identitet og karrierestatus. Spilleren kan søke støtte privat, men data, kode og fortrolige prosjektopplysninger må bli i korrekt kanal.',refs[7]],
  ['etter_veiledningsgrense','Et tydelig nei eller en grense i veiledning kan oppleves som relasjonelt tap. Aftermathen gjør det mulig å kjenne på skyld uten å kompensere med uklare løfter eller favorisering neste dag.',refs[1]],
  ['etter_krediteringskonflikt','Uenighet om forfatterskap kan gjøre kollegiale relasjoner kalde lenge etter at arbeidsdagen er slutt. Privat støtte skal ikke bli en alternativ arena for å avgjøre bidrag eller dele upublisert materiale.',refs[8]],
  ['etter_offentlig_oppmerksomhet','Synlighet kan gi både stolthet og frykt for å bli korrigert. Aftermathen tester om spilleren tåler at en forsiktig faglig formulering får mindre applaus enn en overdrevet sikker påstand.',refs[10]],
  ['sesongslutt_og_uferdig_arbeid','Ikke alle saker er løst på dag 14. Spilleren må kunne avslutte arbeidsdagen med eksplisitt venting og handoff i stedet for å behandle tilgjengelighet som et moralsk krav om å løse alt privat.',refs[14]]
].map(([id,description,ref]) => ({id,description:`${description} ${authorityBoundary}`,materialization_refs:[ref]}));

const delayedConsequences = [
  ['pensumvalg_blir_studentreaksjon',refAt(1,'morning'),refAt(11,'lunch'),['relationship','reputation','narrative']],
  ['skjult_tidskutt_blir_kapasitetsgjeld',refAt(2,'morning'),refAt(13,'afternoon'),['job','psyche','reputation']],
  ['veiledningspress_blir_selvstendighetskonflikt',refAt(3,'lunch'),refAt(9,'lunch'),['relationship','reputation','narrative']],
  ['uklar_kreditering_blir_forfatterskapsstrid',refAt(4,'afternoon'),refAt(9,'afternoon'),['job','relationship','reputation']],
  ['habilitetsvalg_blir_klagespor',refAt(5,'morning'),refAt(6,'afternoon'),['job','reputation','narrative']],
  ['svak_reproduserbarhet_blir_rework',refAt(7,'morning'),refAt(13,'morning'),['job','reputation','narrative']],
  ['negative_funn_blir_formidlingsvalg',refAt(8,'afternoon'),refAt(12,'afternoon'),['job','reputation','narrative']],
  ['arbeidslekkasje_blir_privat_grense',refAt(10,'evening'),refAt(14,'evening'),['relationship','psyche','reputation']]
].map(([id,setup_ref,return_ref,domains]) => ({id,setup_ref,return_ref,domains}));

const historyAffordance = {
  badge_id: 'vitenskap',
  source_ref: refs.find((ref) => ref.includes('/knowledge/')),
  better_question: `History Go kan brukes til å undersøke hvordan universiteter, fagtradisjoner, studentrettigheter, vitenskapelige kontroverser, utdanningsreformer og tidligere metodiske brudd har formet dagens akademiske praksis. I denne Role World-en skal slik historisk og stedlig kontekst gjøre spilleren bedre til å spørre hvorfor et læringsmål finnes, hvilke interesser et pensumvalg privilegerer, hvordan en vurderingsform ble legitimert, hvorfor en metode ble standard, hvem som tidligere manglet stemme, og hva slags feil et system forsøker å forhindre. Den kan også gi sammenligningsgrunnlag for å se at professorstatus, publiseringsprestisje og institusjonelle vaner endrer seg historisk og derfor ikke er det samme som evidens. ${historyBoundary} ${authorityBoundary}`,
  authority_boundary: `${historyBoundary} ${authorityBoundary} History Go kan derfor aldri være dagens sensurmyndighet, klageavgjørelse, habilitetsbevis, dataadgang eller vitenskapelige evidens.`
};
if (historyAffordance.better_question.length < 650) throw new Error('History Go better question too short');

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: CATEGORY,
  role_scope: ROLE,
  title: 'Vitenskap / Undervisning og forskning — faglig skjønn, studentmakt og situert akademisk standing',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Hvordan opprettholder en Førsteamanuensis eller Professor faglig og relasjonell tillit når undervisning, veiledning, vurdering, forskning, publiseringspress, studentavhengighet og offentlig status trekker i ulike retninger?',
    description: 'Role World-en lukker situated_reputation rundt en rollout-ready kombinert akademisk foundation. Standing er audience-spesifikk og kan sprike mellom studenter, veiledningsrelasjoner, forskerkolleger, sensur- og kvalitetsfunksjoner, etikk/integritet, administrasjon, offentlighet og privatliv. Den kan aldri erstatte academic_qualification_and_employment, konkret oppnevning, evidens, habilitet, samtykke, studentrettigheter eller annen formell myndighet.'
  },
  theme_ids: themes,
  social_environments: environments,
  recurring_people_archetypes: people,
  slow_axes: slowAxes,
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: `Ingen global reputation score er tillatt. Situert standing kan påvirke relasjonell friksjon, tillit, samarbeidsvilje og hvordan tidligere valg tolkes, men kan aldri endre qualification_required, opprette academic_qualification_and_employment eller skape ny akademisk myndighet. ${authorityBoundary}`
  },
  history_go_affordance: historyAffordance,
  cross_role_link: {
    status: 'candidate_when_shared_work_is_real',
    materialized: false,
    companion_keys: ['vitenskap/vitenskap_forskning','vitenskap/vitenskap_doktorlop_og_postdoktor','vitenskap/vitenskap_forskningsledelse'],
    rationale: 'Delte forsknings-, veilednings- eller undervisningsobjekter kan senere begrunne eksplisitt cross-role materialisering, men denne rollout-en trenger ingen ny kobling for å være komplett.'
  },
  cross_role_proof: {
    shared_work_object_found: false,
    reason: 'Ingen ny cross-role kobling materialiseres i denne pakken; eksisterende persistent work, People, Places, mail og authority er tilstrekkelig for selvstendig rollout.'
  },
  existing_work_continuity: {
    new_runtime_state: false,
    persistent_work_object: PERSISTENT,
    existing_plan: PLAN,
    existing_role_model: MODEL,
    existing_work_grammar: GRAMMAR
  },
  season: {days:14,day_phases:['morning','lunch','afternoon','evening'],coverage},
  primary_threads: primaryThreads,
  private_aftermath: privateAftermath,
  delayed_consequences: delayedConsequences,
  materialization: {
    no_new_runtime: true,
    authored_dimensions: ['situated_reputation'],
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    career_title_gates_preserved: true,
    cross_role_link_materialized: false,
    source_refs: refs
  }
};
writeJson(WORLD, world);

const index = readJson('data/Civication/roleWorlds/index.json');
if ((index.roles || []).some((row) => row.category === CATEGORY && row.role_scope === ROLE)) throw new Error('Role World already registered');
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
index.status = `${index.roles.length}_role_worlds_materialized`;
index.effective_date = '2026-09-08';
writeJson('data/Civication/roleWorlds/index.json', index);

const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
if ((checklist.reference_worlds || []).includes(WORLD)) throw new Error('Role World already in checklist');
checklist.reference_worlds.push(WORLD);
writeJson('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const bank = readJson('data/Civication/roleWorldThemeBank.json');
if (bank.reference_profiles?.[KEY]) throw new Error('Theme profile already exists');
bank.reference_profiles[KEY] = themes;
writeJson('data/Civication/roleWorldThemeBank.json', bank);

const source = `# Civication — Vitenskap / Undervisning og forskning Role World rollout — source first\n\n## Scope lock\n\n- Canonical key: \`${KEY}\`.\n- This PR authors only the remaining Role World dimension: \`situated_reputation\`.\n- Førsteamanuensis and Professor remain \`qualification_required\` with \`academic_qualification_and_employment\`.\n- Badge, XP, professor title, publication prestige, local standing and History Go never create employment, sensor authority, data rights, ethics approval, evidence or other institutional authority.\n- No global reputation score. Standing is audience-specific and contradictory by design.\n- No new runtime. Existing plan, role model, four People, four Places, work grammar, persistent work object, waiting/handoff/rework and career gates are preserved.\n\n## Editorial world\n\nThe 14-day season uses 4 phases per day = 56 unique beats. It follows research-led teaching, the conflict between teaching time and research deadlines, supervision and student independence, assessment and habilitet, complaints and student rights, reproducibility, negative findings, authorship and credit, ethics/privacy/data access, disciplinary disagreement, public communication, bounded rework, handoff and the work-home boundary.\n\nEight situated audiences remember different things: students/learning environment; supervision relations/candidates; research colleagues; examiners/program/quality functions; ethics/privacy/integrity functions; administration/resources; public/partners/disciplinary environment; and private relations. High standing with one audience may coexist with low standing with another. No audience can convert trust into formal authority.\n\nAll 15 canonical mail refs are reused at least three times across the 56 beats. The existing \`${PERSISTENT}\` remains the persistent work object. There is no parallel scene format and no raw-mail runtime fallback.\n\n## Cross-role boundary\n\nCross-role status is candidate when shared work is real. Materialized: false. Future shared research, teaching or supervision objects may justify a governed link, but rollout completion does not depend on one.\n\n## History Go\n\nHistory Go is a better-question affordance for historical and place context around universities, disciplines, student rights, research controversies and education reform. It is never current qualification, appointment, assessment basis, habilitet decision, complaint decision, data access, consent, ethics/privacy approval, scientific evidence or authority.\n\n## Closure gate\n\nThe permanent package must pass the dedicated rollout test, the global Role World contract, Career Gameplay Matrix, Role World readiness, full Civication suite, job-learning and job-knowledge audits, fresh-main ancestry, exact 9-file permanent scope, exact-head PR CI, SHA-locked merge, Main integrity and Pages build/artifact/status/deploy.\n`;
writeText(SOURCE, source);

const test = `const assert=require('node:assert/strict');\nconst fs=require('node:fs'),path=require('node:path'); const ROOT=path.resolve(__dirname,'..');\nconst read=rel=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8')); const text=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8');\nconst CATEGORY='vitenskap',ROLE='vitenskap_undervisning_og_forskning',KEY=CATEGORY+'/'+ROLE;\nconst WORLD='${WORLD}',MODEL='${MODEL}',GRAMMAR='${GRAMMAR}',PLAN='${PLAN}',SOURCE='${SOURCE}',PERSISTENT='${PERSISTENT}';\nconst TYPES=${JSON.stringify(TYPES)},TITLES=['Førsteamanuensis','Professor'],QUALS=['academic_qualification_and_employment'];\nconst catalogPath=t=>'data/Civication/mailFamilies/'+CATEGORY+'/'+t+'/'+ROLE+'_'+t+'.json'; const refs=TYPES.flatMap(t=>{const d=read(catalogPath(t));return (d.families||[]).flatMap(f=>(f.mails||[]).map(m=>catalogPath(t)+'#'+m.id));});\nconst world=read(WORLD),model=read(MODEL),grammar=read(GRAMMAR),plan=read(PLAN); assert.equal(world.schema,'civication_role_world_v1'); assert.equal(world.status,'role_world_complete'); assert.equal(world.category,CATEGORY); assert.equal(world.role_scope,ROLE); assert.equal(plan.sequence.length,16); assert.equal(model.related_people.length,4); assert.equal(model.persistent_work_product.id,PERSISTENT); assert.equal(refs.length,15); assert.equal(new Set(refs).size,15); assert.ok(grammar.knowledge_dependencies.some(k=>k.badge_id==='vitenskap'));\nassert.deepEqual(world.materialization.authored_dimensions,['situated_reputation']); for(const k of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved','career_title_gates_preserved']) assert.equal(world.materialization[k],true,k); assert.equal(world.materialization.cross_role_link_materialized,false); assert.deepEqual(world.materialization.source_refs,refs); assert.equal(world.existing_work_continuity.new_runtime_state,false); assert.equal(world.existing_work_continuity.persistent_work_object,PERSISTENT);\nassert.equal(world.situated_reputation_model.global_score_allowed,false); assert.equal(world.situated_reputation_model.audiences.length,8); for(const a of world.situated_reputation_model.audiences){assert.equal(a.cares_about.length,2); for(const re of [/qualification_required/i,/academic_qualification_and_employment/i,/History Go/i,/myndighet/i]) assert.match(a.cannot_grant,re);} for(const re of [/global/i,/qualification_required/i,/academic_qualification_and_employment/i,/myndighet/i]) assert.match(world.situated_reputation_model.authority_separation,re); assert.equal(world.slow_axes.length,9); for(const a of world.slow_axes) assert.equal(a.runtime_binding,'editorial_only_until_governed'); assert.equal(world.recurring_people_archetypes.length,8); assert.ok(world.social_environments.length>=8);\nassert.equal(world.history_go_affordance.badge_id,'vitenskap'); assert.ok(refs.includes(world.history_go_affordance.source_ref)); assert.ok(world.history_go_affordance.better_question.length>=650); for(const re of [/academic_qualification_and_employment/i,/vurderingsgrunnlag/i,/habilitet/i,/data/i,/evidens/i,/myndighet/i]) assert.match(world.history_go_affordance.authority_boundary,re); assert.equal(world.cross_role_link.status,'candidate_when_shared_work_is_real'); assert.equal(world.cross_role_link.materialized,false); assert.equal(world.cross_role_proof.shared_work_object_found,false);\nassert.equal(world.season.days,14); assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']); assert.equal(world.season.coverage.length,56); const keys=new Set(world.season.coverage.map(b=>b.day+'/'+b.phase)); assert.equal(keys.size,56); assert.equal(new Set(world.season.coverage.map(b=>b.summary)).size,56); const phaseTypes={morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'},use=new Map(refs.map(r=>[r,0])); for(const b of world.season.coverage){assert.equal(b.beat_type,phaseTypes[b.phase]); assert.ok(b.summary.length>=1200,b.day+'/'+b.phase+'/'+b.summary.length); assert.ok(b.standing_consequence.length>=650,b.day+'/'+b.phase+'/'+b.standing_consequence.length); assert.equal(b.materialization_refs.length,1); const r=b.materialization_refs[0]; assert.ok(refs.includes(r)); use.set(r,use.get(r)+1); for(const re of [/qualification_required/i,/academic_qualification_and_employment/i,/History Go/i,/myndighet/i]) assert.match(b.summary,re);} for(const [r,c] of use) assert.ok(c>=3,r+'/'+c);\nassert.equal(world.primary_threads.length,7); for(const th of world.primary_threads){assert.ok(th.relationship.length>=500,th.id+'/'+th.relationship.length); assert.ok(th.beat_refs.length>=5&&th.beat_refs.length<=10); for(const r of th.beat_refs) assert.ok(keys.has(r));} assert.equal(world.private_aftermath.length,6); assert.equal(world.delayed_consequences.length,8);\nconst index=read('data/Civication/roleWorlds/index.json'); const rows=index.roles.filter(r=>r.category===CATEGORY&&r.role_scope===ROLE); assert.equal(rows.length,1); assert.deepEqual(rows[0],{category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD}); const checklist=read('data/Civication/roleWorldAuthoringChecklist.json'); assert.equal(checklist.reference_worlds.filter(x=>x===WORLD).length,1); const bank=read('data/Civication/roleWorldThemeBank.json'); assert.deepEqual(bank.reference_profiles[KEY],world.theme_ids);\nconst readiness=read('data/Civication/roleWorldRolloutReadiness.json'),ready=readiness.roles.find(r=>r.key===KEY); assert.ok(ready); assert.equal(ready.classification,'rollout_ready'); assert.equal(ready.role_world_status,'role_world_complete'); assert.equal(ready.already_reference_or_pilot,true); assert.deepEqual(ready.authored_work_required,[]); assert.ok(!(readiness.rollout_queue||[]).some(r=>r.key===KEY)); const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(r=>r.key===KEY); assert.equal(career.status,'playable'); assert.equal(career.audit.runtime_gate,true); assert.deepEqual(career.audit.missing_components,[]); const policies=Object.fromEntries(career.audit.salary.rows.map(r=>[r.title,r])); const badge=read('data/badges/vitenskap.json'); const badgeByLabel=Object.fromEntries(badge.tiers.map(t=>[t.label,t])); for(const title of TITLES){assert.equal(policies[title].offer_policy,'qualification_required'); assert.equal(badgeByLabel[title].career_offer.policy,'qualification_required'); assert.deepEqual(badgeByLabel[title].career_offer.qualification_ids,QUALS); assert.equal(badgeByLabel[title].career_offer.role_scope,ROLE);}\nconst source=text(SOURCE); for(const re of [/Scope lock/i,/qualification_required/i,/academic_qualification_and_employment/i,/situated_reputation/i,/No global reputation score/i,/candidate when shared work is real/i,/Materialized: false/i,/History Go/i,/No new runtime/i,/15 canonical/i,/14-day season.*4 phases.*56/i]) assert.match(source,re); console.log('Civication Vitenskap Undervisning og forskning Role World rollout: OK');\n`;
writeText(TEST, test);

console.log(JSON.stringify({role:KEY,world:WORLD,beats:coverage.length,audiences:audiences.length,threads:primaryThreads.length,mail_refs:refs.length,index_roles:index.roles.length},null,2));
