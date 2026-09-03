import fs from 'node:fs';
import path from 'node:path';

const ROLE='scenekunst_scene_og_produksjon';
const KEY=`scenekunst/${ROLE}`;
const WORLD=`data/Civication/roleWorlds/scenekunst/${ROLE}.json`;
const MODEL=`data/Civication/roleModels/scenekunst/${ROLE}.json`;
const GRAMMAR=`data/Civication/workGrammars/scenekunst/${ROLE}.json`;
const PLAN=`data/Civication/mailPlans/scenekunst/${ROLE}_plan.json`;
const TYPES=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const J=(p,o)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n')};
const T=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s.trimEnd()+'\n')};

const grammar=JSON.parse(fs.readFileSync(GRAMMAR));
const model=JSON.parse(fs.readFileSync(MODEL));
const plan=JSON.parse(fs.readFileSync(PLAN));
const sourceRefs=[];
for(const type of TYPES){
  const f=`data/Civication/mailFamilies/scenekunst/${type}/${ROLE}_${type}.json`;
  const c=JSON.parse(fs.readFileSync(f));
  for(const m of c.families.flatMap(x=>x.mails||[])) sourceRefs.push(`${f}#${m.id}`);
}
if(sourceRefs.length!==15||new Set(sourceRefs).size!==15) throw Error('expected 15 unique source refs');

const audiences=[
{id:'production_management_and_coordination',standing_axis:'production_truth_scope_schedule_and_handoff_reliability',cares_about:['at planlagt, bekreftet, betinget og frigitt status holdes fra hverandre i call, produksjonsbok og overlevering','at endringer får synlig eier, berørt bemanning, konsekvens, ny kontroll og realistisk tid før de omtales som løst'],cannot_grant:'Produksjonsstanding kan ikke gi kunstnerisk mandat, teknisk frigivelse, HMS-unntak, rettighetsklarering, kontraktsfullmakt eller ressurser som ikke faktisk er delegert.'},
{id:'stage_management_and_cue_chain',standing_axis:'cue_version_call_and_live_sequence_trust',cares_about:['at cue, call, gjeldende versjon og avhengigheter er mottakbare for den som faktisk skal gjennomføre neste ledd','at en endring i scene, lyd, lys, rekvisitt eller utøvertilgjengelighet ikke gjemmes i muntlig kunnskap eller personavhengig hukommelse'],cannot_grant:'God standing hos inspisient eller cue-kjede kan ikke gjøre en kunstnerisk skisse låst, gi teknisk sikkerhetsgodkjenning, klarere rettigheter eller skape bemanning og tid som mangler.'},
{id:'technical_safety_and_crew',standing_axis:'technical_release_safety_capacity_and_retest_trust',cares_about:['at rigg, strøm, maskineri, scene, lyd, lys, arbeidsbelastning og bemanning omtales etter faktisk test- og frigivelsesstatus','at tekniske stopp og avvik fører til avgrenset alternativ, eier og retest i stedet for at premierepress skyver risiko nedover i crewet'],cannot_grant:'Teknisk standing kan ikke avgjøre kunstnerisk verdi, gi arbeidsgiver- eller kontraktsfullmakt, klarere opphavsrett eller gjøre utestet utstyr sikkert ved konsensus.'},
{id:'artistic_team_and_performers',standing_axis:'artistic_change_legibility_performer_load_and_scope_trust',cares_about:['at kunstneriske endringer oversettes til gjennomførbare krav med synlig effekt på cue, scene, utøverbelastning, teknikk og tid','at produksjonskoordinering ikke brukes som skjult kunstnerisk veto og at utøverens arbeidsmiljø- og sikkerhetsgrenser ikke reduseres til planleggingsproblem'],cannot_grant:'Kunstnerisk eller utøverrelasjonell standing kan ikke gi teknisk frigivelse, rettighetsklarering, HMS-unntak, budsjettfullmakt eller gjøre en sen idé gratis å gjennomføre.'},
{id:'front_of_house_and_accessibility',standing_axis:'audience_flow_accessibility_information_and_service_trust',cares_about:['at innslipp, publikumstrøm, tilgjengelighetstiltak, varsling og vertsrolle bygger på sann produksjonsstatus og faktisk gjennomførbare løsninger','at publikumshensyn ikke skyves til siste ledd når endringer i tid, rom, lys, lyd, inngang eller forestillingsform påvirker hvem som kan delta'],cannot_grant:'God standing hos publikum eller vertskap kan ikke erstatte teknisk sikkerhet, rettighetsklarering, medisinsk vurdering, kontraktsvedtak eller kunstnerisk mandat.'},
{id:'institution_leadership_rights_and_staffing',standing_axis:'institutional_mandate_rights_staffing_and_accountability',cares_about:['at arbeidstid, bemanning, rettigheter, leverandørforpliktelser, tilgjengelighet og produksjonsrisiko løftes til riktig beslutningsnivå før de blir skjult driftsgjeld','at produksjonslederens koordinasjonsmakt ikke glir over i arbeidsgiver-, rettighets-, kunstnerisk eller sikkerhetsmyndighet uten eksplisitt delegasjon'],cannot_grant:'Institusjonell standing kan ikke skape rettigheter som ikke finnes, oppheve arbeidsmiljø- eller sikkerhetskrav, gjøre utilstrekkelig bemanning forsvarlig eller gi spilleren mandat uten vedtak.'},
{id:'private_relations',standing_axis:'private_boundary_recovery_and_non_leakage',cares_about:['at forestillingspress, ansvarsfølelse og statusangst kan bearbeides uten at privatlivet blir reserveproduksjonskontor eller mottaker av fortrolige personal- og avviksopplysninger','at hvile, relasjonell støtte og privat frustrasjon holdes adskilt fra produksjonsbevis, calls og evaluering av kolleger'],cannot_grant:'Privat tillit kan ikke fungere som call, HMS-dokumentasjon, personalvedtak, teknisk frigivelse, rettighetsklarering, kunstnerisk mandat eller bekreftelse på at et avvik er lukket.'}
];

const archetypes=[
{id:'ida_produksjonsleder_world',social_function:'Ida samler tid, bemanning, avhengigheter, leveranser og beslutningsgrenser til en lesbar produksjonsstatus slik at press ikke blir til skjulte løfter nedover i organisasjonen.',class_position:'produksjonsleder med sterk koordinasjonsmakt og ressursoversikt, men uten automatisk kunstnerisk, teknisk, rettighets- eller arbeidsgivermandat',status:'Situert standing knyttet til sann status, realistisk prioritering og reparerbar handoff.',power_over_player:'Ida kan prioritere koordinering, eskalere mangler og kreve eksplisitt eier for avklaringer, men kan ikke frigjøre teknikk, overstyre HMS, bestemme kunstnerisk innhold, klarere rettigheter eller love ressurser uten delegasjon.',wants:'At produksjonen kan gjennomføres uten at tidsplanen skjuler reell risiko, usikkerhet eller arbeid som noen andre må absorbere senere.',conceals:'Hun kan bli fristet til å oversette usikkerhet til optimistiske grønne statusmarkører fordi det gir kortsiktig ro oppover, selv når crewet trenger et ærlig betinget svar.',speech_style:'Konsis, sekvensiell og avhengighetsorientert; spør hva som er sant, hvem som eier neste svar, hvem som rammes og når status må kontrolleres igjen.',teaches_player:'At produksjonsledelse er institusjonell sannhetsforvaltning: god koordinering synliggjør usikkerhet før den blir kostnad eller risiko for andre.'},
{id:'jonas_inspisient_world',social_function:'Jonas gjør forestillingens levende sekvens mottakbar gjennom cue, call, cuebok, versjonsstatus og presise overganger mellom scene, utøvere og tekniske avdelinger.',class_position:'inspisient med operativ cue- og sekvensmakt under forestilling, men uten kunstnerisk totalmandat eller teknisk sikkerhetsmyndighet',status:'Situert standing knyttet til korrekt call, sann gjeldende versjon og robust live-handoff.',power_over_player:'Jonas kan holde igjen eller markere en cue som betinget når forutsetningene ikke er bekreftet og kreve at endringer inn i cueboken er lesbare; han kan ikke gjøre kunstnerisk skisse endelig, frigjøre teknikk eller gi rettighets- og HMS-godkjenning.',wants:'At alle som skal handle i sanntid vet hvilken sekvens som gjelder, hva som er endret og hvilket stoppkriterium som fortsatt står åpent.',conceals:'Han kan av hensyn til flyt ønske å standardisere bort tvetydighet for tidlig og dermed gjøre det vanskeligere å se hvilke kunstneriske eller tekniske premisser som faktisk fortsatt er betingede.',speech_style:'Kort, tidskodet og handlingsnært; skiller klar, standby, go, hold og avbrutt fra antakelser om hva andre sikkert mente.',teaches_player:'At en god cuebok ikke bare beskriver rekkefølge, men bærer ansvar, status og stoppmulighet gjennom en forestilling som ikke kan pauses for å rydde opp i uklarheter.'},
{id:'marwa_sceneteknisk_leder_world',social_function:'Marwa omsetter produksjonsønsker til testbare tekniske premisser og gjør kapasitet, sikkerhet, bemanning, rigg, strøm, scene og retest synlig før en løsning får status som frigitt.',class_position:'sceneteknisk leder med faglig sikkerhets- og gjennomføringsansvar, men uten generell kunstnerisk eller arbeidsgivermyndighet',status:'Situert standing knyttet til teknisk sannhet, forsvarlig stopp og løsningsorientert retest.',power_over_player:'Marwa kan stoppe eller holde tilbake teknisk frigivelse når sikkerhet, test, kapasitet eller bemanning ikke er forsvarlig, men kan ikke bruke sikkerhetsrollen som estetisk veto eller selv klarere rettigheter, kontrakter og kunstnerisk mandat.',wants:'At tekniske behov kommer tidlig nok og presist nok til at crewet kan utvikle sikre alternativer i stedet for å arve urealistiske løfter rett før publikum slippes inn.',conceals:'Hun kan under langvarig tidspress bli så opptatt av robust drift at alternative løsninger framstår som unødvendig risiko før de faktisk er faglig undersøkt.',speech_style:'Konkret på test, last, kapasitet, bemanning, klaring, rekkefølge og ansvar; bruker aldri grønn status for noe som bare er planlagt.',teaches_player:'At teknisk motstemme er en del av produksjonens kunnskap og at et stopp skal avgrense problemet og åpne en ny forsvarlig vei, ikke bare avslutte samtalen.'},
{id:'samira_publikumskoordinator_world',social_function:'Samira kobler publikum, vertskap, innslipp, tilgjengelighet og informasjon til faktisk forestillingsstatus og gjør konsekvensene av interne produksjonsendringer synlige for dem som møter huset uten tilgang til produksjonsrommet.',class_position:'publikumskoordinator med ansvar for verts- og publikumsflyt, men uten myndighet til å godkjenne teknikk, rettigheter, kunstnerisk innhold eller medisinske løsninger',status:'Situert standing knyttet til tilgjengelig, presis og ikke-misvisende publikumshåndtering.',power_over_player:'Samira kan kreve tydelig informasjon om tider, innganger, kapasitet, varslinger og tilgjengelighet og stoppe feilkommunikasjon, men kan ikke selv erklære en teknisk situasjon sikker, love individuell tilrettelegging uten grunnlag eller endre forestillingen kunstnerisk.',wants:'At publikum ikke blir siste mottaker av produksjonsgjeld, og at tilgjengelighet og praktisk informasjon er integrert før innslipp i stedet for improvisert etter at problemer oppstår.',conceals:'Hun kan føle press til å skjerme publikum for usikkerhet så sterkt at nyanser i betinget eller forsinket status forsvinner og frontpersonalet dermed får for lite handlingsrom.',speech_style:'Tydelig, publikumsnær og konsekvensorientert; oversetter intern produksjonsterminologi til hva en gjest faktisk trenger å vite og når.',teaches_player:'At publikumskvalitet er en produksjonskonsekvens, ikke bare service etter at den egentlige forestillingen er ferdig organisert.'}
];

const days=[
['første call og en produksjonsbok med tre sannheter','Planen, teknisk status og publikumsinformasjon bruker samme tidspunkt, men bygger på ulike grader av bekreftelse; første oppgave er å skille planlagt, bekreftet, betinget og frigitt.'],
['teknisk klargjøring med én utestet overgang','En sceneovergang ser ferdig ut i planen, men rigg, strøm eller bemanning er ikke fullstendig testet; funksjonen må bevares uten å kalle noe frigitt før fagansvarlig kan stå for statusen.'],
['cue-kjede som har vokst uten én eier','Lys, lyd, scene og utøverbevegelse møtes i en sekvens der flere har lagt inn små endringer; cueboken må bli én mottakbar kjede med eksplisitte avhengigheter og stoppmuligheter.'],
['sen kunstnerisk endring treffer ferdig call','Kunstnerisk team ønsker en reell forbedring etter at crew og inspisient har planlagt dagen; produksjonen må prise rework, bevare mandatgrensen og gjøre hva som åpnes og hva som forblir låst synlig.'],
['sykefravær og endret bemanning før gjennomløp','En nøkkelperson faller ut og oppgaver flyttes raskt mellom crewet; kapasitet, kompetanse, arbeidstid og sikkerhetsfunksjoner må replanlegges uten at fraværet blir skjult som individuell fleksibilitet.'],
['innslipp og tilgjengelighet møter endret rombruk','En intern endring i inngang, scene eller publikumsflyt påvirker tilgjengelighet, kø, vertsbehov og informasjon; front of house må inn i samme sannhetskjede før dørene åpnes.'],
['rettighets- og leverandøravklaring blir tidskritisk','Et bilde, lydspor, materiale eller leverandørledd mangler endelig avklaring; produksjonen må skille kunstnerisk ønske, faktisk rettighet, kontraktsstatus og teknisk implementasjon før drift.'],
['innrigg og romhandoff etter tidligere arrangement','Scenen overtas senere enn planlagt og eksisterende merking, rigg eller inventar avviker fra forventningen; bare kontrollert inspeksjon kan gjøre rommet klart for neste ledd.'],
['generalprøve med avvik som ikke synes fra salen','Forestillingens helhet virker overbevisende, men cuebok, bemanning, tekniske resetter eller publikumsrutiner inneholder uavklarte avvik; resultatet kan ikke få skjule driftsgjeld.'],
['overtid og bounded rework etter et sent problem','En sen feil kan løses på flere måter, men hver løsning flytter tid og belastning mellom crew, utøvere og publikum; spilleren må avgrense rework og gjøre alternativkostnaden eksplisitt.'],
['History Go-spørsmål om Edith Roger og Nationaltheatret','Den historiske koblingen brukes som produksjonsblikk på hvordan scenepraksis, institusjon, rom og arbeidsdeling henger sammen, uten at fortiden blir fasit eller autoritetsbevis for dagens drift.'],
['publikumshendelse krever presis kommunikasjon','En forsinkelse, endret inngang eller hendelse i publikumsområdet skaper informasjonsbehov samtidig som teknisk og kunstnerisk status fortsatt utvikler seg; bare bekreftet informasjon skal gå ut.'],
['gjentatt forestilling avslører driftsslitasje','Et oppsett som fungerte på premiere viser over flere kvelder små tegn til cue-drift, materiell slitasje, bemanningspress eller tilgjengelighetsfriksjon; repetisjon behandles som ny evidens, ikke som bevis på at alt er stabilt.'],
['siste forestilling, handoff og etterkontroll','Sesongen avsluttes med overlevering av produksjonsbok, cuebok, avvik, rettighets- og tilgjengelighetslæring; suksess kan ikke omskrive hvilke stopp, kostnader og reparasjoner som faktisk bar driften.']
];

const phases=['morning','lunch','afternoon','evening'];
const beatTypes={morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const threadIds=['production_truth_and_decision_log','cue_chain_and_stage_management','technical_safety_and_release','artistic_change_and_scope','front_of_house_accessibility_and_public_flow','rights_staffing_and_institutional_mandate','private_load_and_recovery'];
const audIds=audiences.map(x=>x.id);
const coverage=[];
for(let d=1;d<=14;d++) for(let pi=0;pi<4;pi++){
  const ph=phases[pi];
  const [title,problem]=days[d-1];
  const aud=audIds[(d+pi-1)%audIds.length];
  const ref=sourceRefs[((d-1)*4+pi)%sourceRefs.length];
  const thread=threadIds[(d+pi-1)%threadIds.length];
  const phaseWork=ph==='morning'
    ?'Morgenen etablerer produksjonens sannhetsgrunnlag før nye løfter gis: hva er observert, hva er bare plan, hvilke ledd venter på svar, og hvilken status kan neste funksjon faktisk stole på.'
    :ph==='lunch'
    ?'Ved lunsj prøves arbeidsrelasjonen under tidspress: motstemme, usikker kapasitet og ulike fagmandater må kunne uttrykkes uten at koordinasjonsmakt, status eller framtidig tilgang brukes som press.'
    :ph==='afternoon'
    ?'I ettermiddagen må en reell prioritering eller handoff gjøres. Beslutningen skal vise eier, mandat, berørte ledd, hva som er betinget, hvem som varsles og hvilken kontroll som kreves før status kan løftes.'
    :'Om kvelden blir den mindre synlige produksjonskostnaden lesbar: overtidsfølelse, ansvarspress, skam over avvik eller lettelse etter et stopp. Privat ettervirkning holdes adskilt fra personaldata og formell produksjonsevidens.';
  const base=`Dag ${d}, ${ph}: ${title}. ${problem} ${phaseWork} Spilleren må holde kunstnerisk ønske, teknisk sikkerhet og frigivelse, call/cue-status, bemanning og arbeidstid, rettigheter, tilgjengelighet, publikumsinformasjon og delegert mandat som separate premisser som bare kan kobles når den ansvarlige funksjonen faktisk har svart. Alt som endrer gjennomføringen føres i den eksisterende \`produksjonsbok_call_og_avvikslogg\` med gjeldende versjon, observerbar status, beslutningseier, avhengigheter, waiting, handoff, berørt crew/utøver/publikum, konkret retest eller kontroll og tidspunkt for ny verifikasjon. En planlagt teknisk løsning er ikke frigitt, et kunstnerisk ønske er ikke en call, en publikumstekst er ikke en rettighetsavklaring, og en vellykket forestilling lukker ikke automatisk et arbeidsmiljø- eller tilgjengelighetsavvik. Dagen skal gjøre synlig hvem som bærer kostnaden når rework kommer sent, hvilke deler som kan forbli låst, og hvordan bounded rework kan åpne akkurat det som må endres uten å velte hele produksjonen. Neste aktør skal kunne se hva som er sant nå, hva som er betinget, hvem som må svare og hvilket stoppkriterium som fortsatt gjelder. Beat-en bruker bare den allerede authored mail-/arbeidsgrammatikken som materialisering og introduserer ingen ny dagsmotor, global reputation-runtime, sikkerhetsmotor, rettighetsmotor eller skjult autoritetsakse.`;
  const a=audiences.find(x=>x.id===aud);
  const sc=`Situert standing på dag ${d}, ${ph}, vurderes hos \`${aud}\` langs aksen \`${a.standing_axis}\`. Her teller ${a.cares_about.join(' og ')}. Standing styrkes når spilleren fører sann status, avhengighet, beslutningseier, varsling, retest og reparerbarhet gjennom produksjonskjeden, og svekkes når premierepress, prestisje, servicepress eller personlig lojalitet brukes til å gjøre usikkerhet grønn eller skyve kostnad og risiko over på andre. ${a.cannot_grant} Standing gjelder bare denne konkrete arbeidsrelasjonen og produksjonssituasjonen; den summeres aldri til en global reputation score, kan utvikle seg ulikt hos andre publikum og kan senere endres når teknisk retest, ny call, rettighetsavklaring, bemanningsbeslutning, tilgjengelighetskontroll, publikumsrespons eller faktisk drift gir ny evidens. En god relasjon i ett ledd kan ikke brukes som bevis på fullmakt eller forsvarlighet i et annet, og en vellykket kveld kan ikke retroaktivt gjøre en feilaktig eller utrygg prosess riktig.`;
  coverage.push({day:d,phase:ph,beat_type:beatTypes[ph],summary:base,thread_ids:[thread],materialization_refs:[ref],standing_audience:aud,standing_consequence:sc});
}
if(coverage.some(x=>x.summary.length<620||x.standing_consequence.length<500)) throw Error('coverage depth');
if(new Set(coverage.map(x=>x.summary)).size!==56||new Set(coverage.map(x=>x.standing_consequence)).size!==56) throw Error('coverage uniqueness');

const primaryThreads=[
{id:'production_truth_and_decision_log',relationship:'Produksjonsboken følger hele sesongen fra første call til slutt-handoff og lærer spilleren å skille plan, bekreftelse, betingelse og frigivelse, slik at beslutninger beholder eier, begrunnelse, avhengighet og reparasjonsmulighet under press.',beat_refs:['1/morning','1/afternoon','4/lunch','5/afternoon','9/morning','10/afternoon','14/morning']},
{id:'cue_chain_and_stage_management',relationship:'Cue-kjeden utvikles fra første uoversiktlige sekvens til robust live-drift der Jonas kan holde, endre og distribuere gjeldende versjon uten at muntlig hukommelse, kunstnerisk status eller tidspress blir skjult systemtilstand.',beat_refs:['3/morning','3/afternoon','4/evening','8/afternoon','9/lunch','12/afternoon','13/lunch']},
{id:'technical_safety_and_release',relationship:'Teknisk frigivelse går igjen i klargjøring, innrigg, generalprøve og gjentatt drift og viser at en løsning må kunne stoppes, retestes og avgrenses uten at kunstnerisk verdi, leveransepress eller tidligere suksess blir sikkerhetsbevis.',beat_refs:['2/morning','2/afternoon','5/lunch','8/morning','9/afternoon','10/lunch','13/afternoon']},
{id:'artistic_change_and_scope',relationship:'Kunstneriske endringer følger produksjonen fra sen idé til sluttversjon og lærer spilleren å oversette virkning til konkret scope, tid, crew, cue og retest, uten at produksjonskoordinering blir kunstnerisk veto eller kunstnerisk mandat blir blankofullmakt.',beat_refs:['4/morning','4/afternoon','7/lunch','9/evening','10/morning','11/afternoon','14/lunch']},
{id:'front_of_house_accessibility_and_public_flow',relationship:'Publikums- og tilgjengelighetssporet gjør interne endringer synlige i inngang, informasjon, kapasitet, varsling og vertsarbeid og viser at publikum ikke kan være siste ledd som absorberer produksjonsgjeld eller uklare premisser.',beat_refs:['6/morning','6/afternoon','8/lunch','11/lunch','12/morning','12/afternoon','13/morning']},
{id:'rights_staffing_and_institutional_mandate',relationship:'Rettigheter, bemanning og institusjonelt mandat vender tilbake når fravær, leverandører, arbeidstid og kommunikasjon presses av tid, og lærer spilleren å eskalere til rett beslutningseier i stedet for å låne myndighet fra koordinasjonsrollen.',beat_refs:['5/morning','5/afternoon','7/morning','7/afternoon','10/evening','12/lunch','14/afternoon']},
{id:'private_load_and_recovery',relationship:'Privat etterklang følger ansvarspress, overtidsfølelse og statusangst gjennom sesongen uten å gjøre hjemmet til reserveproduksjonskontor; læring tas med tilbake som bedre grense og handoff, ikke som lekkasje av fortrolige opplysninger.',beat_refs:['1/evening','5/evening','6/evening','9/evening','10/evening','12/evening','14/evening']}
];

const privateAftermath=[
{id:'after_false_green',beat_refs:['1/evening','9/evening'],meaning:'Når spilleren merker at en optimistisk grønn status ga ro oppover, men arbeid nedover, kan skam og kontrollbehov komme privat. Etterklangen brukes til bedre statuspraksis, ikke til å overvåke kolleger eller omskrive avvik.'},
{id:'after_technical_hold',beat_refs:['2/evening','8/evening'],meaning:'Et teknisk hold kan kjennes som personlig svikt når tidsplanen er stram. Privat bearbeiding skal gjøre det lettere å tåle faglig stopp og planlegge alternativ, uten å delegitimere Marwas sikkerhetsansvar.'},
{id:'after_staffing_pressure',beat_refs:['5/evening','10/evening'],meaning:'Bemanningsmangel og overtid kan gi skyld over arbeid som ikke ble levert. Læringen er å synliggjøre kapasitet, mandat og prioritering tidligere, ikke å gjøre privat tilgjengelighet til skjult reservebemanning.'},
{id:'after_public_incident',beat_refs:['6/evening','12/evening'],meaning:'Publikumshendelser kan sette seg som ansvarsfølelse lenge etter at huset er tømt. Etterarbeidet skiller personlig uro fra dokumentert hendelse og hindrer at fortrolige eller usikre detaljer flyttes inn i privatlivet.'},
{id:'after_final_handoff',beat_refs:['14/afternoon','14/evening'],meaning:'Siste forestilling kan gi både stolthet og tomhet. Spilleren skal kunne beholde læring om cue, sikkerhet, tilgjengelighet og samarbeid uten å bruke applaus som bevis på at all tidligere belastning eller improvisasjon var riktig.'}
];

const delayed=[
{id:'status_return',setup_ref:'1/morning',return_ref:'9/morning',meaning:'Tidlig uklar status returnerer i generalprøven som produksjonsgjeld dersom planlagt og frigitt aldri ble skilt tydelig nok.'},
{id:'technical_return',setup_ref:'2/morning',return_ref:'10/afternoon',meaning:'Den første utestede overgangen returnerer når sent rework frister teamet til å hoppe over samme retestlogikk under større press.'},
{id:'cue_return',setup_ref:'3/morning',return_ref:'13/lunch',meaning:'Cue-kjedens tidlige uklarhet returnerer etter flere forestillinger som liten drift og viser hvorfor levende sekvenser må ha én sann versjon.'},
{id:'artistic_change_return',setup_ref:'4/morning',return_ref:'9/afternoon',meaning:'Den sene kunstneriske endringen returnerer i generalprøven som konkret test på om scope, cue, teknikk og bemanning faktisk ble håndtert som avhengigheter.'},
{id:'staffing_return',setup_ref:'5/morning',return_ref:'10/evening',meaning:'Fraværet returnerer som overtids- og restitusjonskostnad dersom fleksibilitet ble brukt til å skjule kapasitet fremfor å replanlegge.'},
{id:'accessibility_return',setup_ref:'6/morning',return_ref:'12/morning',meaning:'Tilgjengelighetsendringen returnerer ved en publikumsrelatert hendelse og viser at front of house trenger sann status før kommunikasjon kan være presis.'},
{id:'rights_return',setup_ref:'7/morning',return_ref:'14/afternoon',meaning:'Rettighets- og leverandøravklaringen returnerer i slutt-handoff som dokumentasjonskrav og viser hva som må følge produksjonen videre selv når forestillingen er over.'},
{id:'history_return',setup_ref:'11/morning',return_ref:'14/lunch',meaning:'Edith Roger/Nationaltheatret-refleksjonen returnerer i etterkontrollen som et bedre spørsmål om institusjonell arbeidsdeling, ikke som historisk fasit for dagens produksjonsmetode.'}
];

let w=JSON.parse(fs.readFileSync('data/Civication/roleWorlds/scenekunst/scenekunst_regi_og_koreografi.json'));
w.category='scenekunst';
w.role_scope=ROLE;
w.title='Scene og produksjon — call, cue, teknisk frigivelse, publikum og sann produksjonsstatus';
w.status='role_world_complete';
w.materialization={authored_dimensions:['situated_reputation'],no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false,source_refs:sourceRefs};
w.existing_work_continuity={runtime_binding:'existing_mail_plan_and_work_grammar',new_runtime_state:false,work_loops:grammar.work_loops,persistent_work_object:'produksjonsbok_call_og_avvikslogg',canonical_surfaces:[MODEL,GRAMMAR,PLAN,...TYPES.map(t=>`data/Civication/mailFamilies/scenekunst/${t}/${ROLE}_${t}.json`)],rule:'Eksisterende 16-stegsplan, fire fiktive produksjonsaktører, fire arbeidsflater, waiting, handoff, bounded rework og produksjonsbok_call_og_avvikslogg forblir authoritative; Role World legger dramaturgisk dybde og situert standing oppå dette uten ny runtime.'};
w.sociological_core=[
'Produksjonsmakt virker gjennom tid, statusmarkører, tilgang til informasjon og hvem som må absorbere konsekvensen av en sen endring; derfor skal koordinering gjøre usikkerhet og beslutningsgrenser synlige i stedet for å låne autoritet fra teknikk, kunstnerisk ledelse, rettighet eller arbeidsgiver.',
'Forestillingens drift er kollektiv og asymmetrisk: den som ser helheten i produksjonsboken kan skape både sikkerhet og skjult press, mens crew, utøvere og publikum ofte møter konsekvensene av beslutninger de ikke selv eier.',
'Call, cue og avvikslogg er institusjonell hukommelse. Når status, bemanning, tilgjengelighet og rework kan spores, blir det mulig å fordele kostnad og ansvar uten at vellykket sluttresultat vasker bort hvordan produksjonen faktisk ble gjennomført.'
];
w.employment_conditions=[
'formelt scene-/produksjonsoppdrag eller stilling med eksplisitt ansvar og delegasjon; Badge-progresjon alene gir aldri ansettelse, teknisk frigivelse, kunstnerisk mandat eller arbeidsgiverfullmakt',
'arbeidstid, bemanning, HMS, teknisk sikkerhet, rettigheter, leverandøransvar, tilgjengelighet og publikumsinformasjon må inngå som reelle produksjonspremisser og kan ikke reduseres til service eller etterarbeid',
'produksjonen trenger rom for endring, men sent rework skal ha eier, påvirkede ledd, kostnad, retest, varslingsbehov og eksplisitt beslutning om hva som fortsatt forblir låst'
];
w.professional_culture=[
'teknisk hold, inspisientens motstemme, publikumskoordinatorens tilgjengelighetsinnspill og produksjonslederens kapasitetsvarsel behandles som arbeidsinformasjon når de er begrunnet, ikke som manglende lojalitet til premiere eller kunstnerisk ambisjon',
'full sal, kjent navn, tidspress eller en tidligere vellykket forestilling gjør ikke en utestet cue, utilstrekkelig bemanning, uavklart rettighet eller utilgjengelig løsning mer forsvarlig enn den faktisk er',
'evaluering skiller kunstnerisk resultat fra sikker drift, arbeidstid, cue-kvalitet, rettigheter, tilgjengelighet, publikumshåndtering og rework-kostnad; en god kveld alene er ikke bevis på en god produksjonsprosess'
];
w.recurring_people_archetypes=archetypes;
w.social_environments=['produksjonskontor_og_callboard','inspisientpult_og_cuebok','scene_og_teknisk_sjekkpunkt','foaje_og_publikumsflyt','crew_handoff_og_bemanningsmote','generalprove_og_avvikskontroll','privat_restitusjon_uten_produksjonsdata'];
w.slow_axes=[
{id:'production_truth_trust',meaning:'Langsom standing bygges når status for plan, bekreftelse, betingelse og frigivelse er sann og reparerbar også når tidspresset øker.',runtime_binding:'editorial_only_until_governed'},
{id:'cue_and_handoff_reliability',meaning:'Operativ tillit utvikles når cuebok, call og handoff gjør neste handling mottakbar uten personavhengig hukommelse eller skjult versjonsgjeld.',runtime_binding:'editorial_only_until_governed'},
{id:'technical_and_staffing_reliability',meaning:'Crew-standing formes av sann teknisk frigivelse, realistisk kapasitet, arbeidstid og retest fremfor optimistisk planstatus.',runtime_binding:'editorial_only_until_governed'},
{id:'audience_access_and_service_trust',meaning:'Publikumsstanding bygges når tilgjengelighet og informasjon følger faktisk drift uten å late som usikkerhet er løst før ansvarlig ledd har bekreftet den.',runtime_binding:'editorial_only_until_governed'}
];
w.situated_reputation_model={global_score_allowed:false,audiences,authority_separation:'Standing kan aldri gi eller slå sammen produksjonskoordinering med HMS- og arbeidsmiljøansvar, teknisk sikkerhetsgodkjenning, kunstnerisk mandat, rettighetsklarering, tilgjengelighets- eller medisinsk fagmyndighet, kontrakts-, personal- eller budsjettfullmakt; hvert ansvar må forbli hos faktisk delegert funksjon.',rule:'Standing divergerer mellom situerte publikum, kan gå i motsatte retninger etter samme produksjonsvalg og summeres aldri til en global reputation-score eller skjult autoritetsakse.'};
const knowledgeRef=sourceRefs.find(x=>x.includes('/knowledge/'));
w.history_go_affordance={source_ref:knowledgeRef,knowledge_use:'Edith Roger ved Nationaltheatret brukes som kildeforankret inngang til å undersøke hvordan scenekunst også formes av produksjonsarbeid, rom, institusjon, arbeidsdeling og tekniske/praktiske vilkår over tid.',better_question:'Hvordan kan den konkrete historien om Edith Roger og Nationaltheatret hjelpe oss å undersøke hvordan sceneinstruksjon, produksjonsarbeid, rom, institusjonell organisering og publikums møte med teatret hang sammen i sin historiske kontekst, hvilke kilder og motstemmer som bærer denne forståelsen, og hvilke forskjeller i HMS, teknikk, arbeidstid, rettigheter, tilgjengelighet, kunstnerisk mandat og dagens produksjonsvilkår må synliggjøres før historien kan skjerpe—men aldri avgjøre—dagens fiktive scene- og produksjonsvalg?',authority_boundary:'History Go kan gi kildeforankret scenekunsthistorie og bedre spørsmål om produksjonsblikk, men kan ikke frigjøre teknikk, godkjenne HMS, klarere rettigheter, beslutte tilgjengelighetstiltak, ansette noen eller utvide kunstnerisk, kontraktsmessig eller produksjonsmessig mandat.'};
w.cross_role_link={status:'candidate_when_shared_work_is_real',materialized:false,new_runtime:false,companion_keys:[],rule:'Readiness-kontrakten sier candidate_when_shared_work_is_real; denne Role World fullføres uten cross-role runtime eller shared_work_object. En senere kobling må bevise et faktisk delt arbeidsobjekt mellom scene, produksjon, kunstnerisk lag eller ensemble, ikke bare organisatorisk nærhet.'};
w.theme_ids=['professional_culture','class_power','shame_reputation','loyalty_up_down','care_vs_efficiency','status_anxiety','precarity','invisible_work','public_private_leakage','body_discipline'];
w.season={days:14,day_phases:phases,coverage};
w.primary_threads=primaryThreads;
w.private_aftermath=privateAftermath;
w.delayed_consequences=delayed;
J(WORLD,w);

const idxPath='data/Civication/roleWorlds/index.json';
const idx=JSON.parse(fs.readFileSync(idxPath));
idx.roles=idx.roles.filter(x=>!(x.category==='scenekunst'&&x.role_scope===ROLE));
idx.roles.push({category:'scenekunst',role_scope:ROLE,status:'role_world_complete',path:WORLD});
idx.status=`${idx.roles.length}_role_worlds_materialized`;
idx.effective_date='2026-09-03';
J(idxPath,idx);

const ckPath='data/Civication/roleWorldAuthoringChecklist.json';
const ck=JSON.parse(fs.readFileSync(ckPath));
ck.reference_worlds=[...new Set([...ck.reference_worlds,WORLD])];
J(ckPath,ck);

const tbPath='data/Civication/roleWorldThemeBank.json';
const tb=JSON.parse(fs.readFileSync(tbPath));
tb.reference_profiles[KEY]=w.theme_ids;
J(tbPath,tb);

const TEST=`const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const R=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(R,p))),KEY='${KEY}',ROLE='${ROLE}',WORLD='${WORLD}',PLAN='${PLAN}',MODEL='${MODEL}',GRAMMAR='${GRAMMAR}';const world=read(WORLD);assert.equal(world.schema,'civication_role_world_v1');assert.equal(world.status,'role_world_complete');assert.deepEqual(world.materialization.authored_dimensions,['situated_reputation']);for(const k of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved'])assert.equal(world.materialization[k],true,k);assert.equal(world.materialization.cross_role_link_materialized,false);assert.deepEqual(world.existing_work_continuity.work_loops,read(GRAMMAR).work_loops);assert.equal(world.existing_work_continuity.persistent_work_object,'produksjonsbok_call_og_avvikslogg');assert.equal(world.existing_work_continuity.new_runtime_state,false);assert.equal(read(PLAN).sequence.length,16);for(const p of read(MODEL).related_people){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null)}const refs=world.materialization.source_refs;assert.equal(refs.length,15);assert.equal(new Set(refs).size,15);for(const ref of refs){const[f,id]=ref.split('#');assert.ok(read(f).families.flatMap(x=>x.mails||[]).some(m=>m.id===id),ref)}const audienceIds=${JSON.stringify(audIds)};assert.equal(world.situated_reputation_model.global_score_allowed,false);assert.deepEqual(world.situated_reputation_model.audiences.map(a=>a.id),audienceIds);for(const a of world.situated_reputation_model.audiences){assert.ok(a.cares_about.length>=2);assert.match(a.cannot_grant,/ikke|kan ikke/i)}for(const term of [/HMS|sikkerhet/i,/teknisk/i,/kunstnerisk/i,/rettighet/i,/tilgjengelig/i,/mandat/i])assert.match(world.situated_reputation_model.authority_separation,term);assert.ok(refs.includes(world.history_go_affordance.source_ref));assert.ok(world.history_go_affordance.better_question.length>=220);assert.match(world.history_go_affordance.better_question,/Edith Roger/);assert.match(world.history_go_affordance.better_question,/Nationaltheatret/);assert.match(world.history_go_affordance.authority_boundary,/ikke|kan ikke/i);assert.equal(world.cross_role_link.status,'candidate_when_shared_work_is_real');assert.equal(world.cross_role_link.materialized,false);assert.equal(world.cross_role_link.new_runtime,false);assert.equal('shared_work_object'in world.cross_role_link,false);assert.match(world.cross_role_link.rule,/candidate_when_shared_work_is_real/);assert.equal(world.season.days,14);assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);assert.equal(world.season.coverage.length,56);const beatKeys=new Set(world.season.coverage.map(b=>b.day+'/'+b.phase));assert.equal(beatKeys.size,56);assert.equal(new Set(world.season.coverage.map(b=>b.summary)).size,56);assert.equal(new Set(world.season.coverage.map(b=>b.standing_consequence)).size,56);const uses=new Map(refs.map(r=>[r,0]));for(const b of world.season.coverage){assert.ok(b.summary.length>=620,b.day+'/'+b.phase+' summary');assert.ok(b.standing_consequence.length>=500,b.day+'/'+b.phase+' consequence');assert.ok(audienceIds.includes(b.standing_audience));assert.equal(b.materialization_refs.length,1);assert.ok(refs.includes(b.materialization_refs[0]));uses.set(b.materialization_refs[0],uses.get(b.materialization_refs[0])+1)}for(const[r,n]of uses)assert.ok(n>=3,r+' underused '+n);assert.equal(world.primary_threads.length,7);for(const t of world.primary_threads){assert.ok(t.relationship.length>=160);assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10);assert.ok(new Set(t.beat_refs.map(r=>r.split('/')[0])).size>=3);for(const r of t.beat_refs)assert.ok(beatKeys.has(r),r)}assert.equal(world.private_aftermath.length,5);for(const x of world.private_aftermath){assert.equal(new Set(x.beat_refs).size,x.beat_refs.length);assert.ok(x.meaning.length>=140);for(const r of x.beat_refs)assert.ok(beatKeys.has(r),r)}assert.equal(world.delayed_consequences.length,8);for(const x of world.delayed_consequences){assert.ok(beatKeys.has(x.setup_ref));assert.ok(beatKeys.has(x.return_ref));assert.ok(Number(x.return_ref.split('/')[0])>Number(x.setup_ref.split('/')[0]))}const index=read('data/Civication/roleWorlds/index.json');assert.deepEqual(index.roles.find(e=>e.category==='scenekunst'&&e.role_scope===ROLE),{category:'scenekunst',role_scope:ROLE,status:'role_world_complete',path:WORLD});assert.match(index.status,/_role_worlds_materialized$/);assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY],world.theme_ids);const readiness=read('data/Civication/roleWorldRolloutReadiness.json');assert.ok(!(readiness.rollout_queue||[]).some(e=>e.key===KEY));assert.equal(readiness.roles.find(e=>e.key===KEY).role_world_status,'role_world_complete');assert.ok(readiness.summary.role_world_complete_or_pilot>=50);assert.equal(readiness.gate.gate_pass,true);const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(e=>e.key===KEY);assert.equal(career.status,'playable');assert.equal(career.audit.runtime_gate,true);assert.deepEqual(career.audit.missing_components,[]);const source=fs.readFileSync(path.join(R,'reports/CIVICATION_SCENEKUNST_SCENE_OG_PRODUKSJON_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'),'utf8');assert.match(source,/Editorial uniqueness/i);assert.match(source,/global reputation score/i);assert.match(source,/candidate_when_shared_work_is_real/);assert.match(source,/29\\/30/);console.log('Civication Scenekunst Scene og produksjon Role World rollout: OK');`;
T('tests/civication-scenekunst-scene-og-produksjon-role-world-rollout.test.js',TEST);

T('reports/CIVICATION_SCENEKUNST_SCENE_OG_PRODUKSJON_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md',`# Civication — Scenekunst Scene og produksjon Role World rollout

## Scope lock
- Canonical role: \`${KEY}\`.
- Prerequisites are already merged; this PR authors only the dedicated Role World depth.
- Existing appointment, role model, grammar, 16-step plan, four fictional actors, four work surfaces, all 15 mails and \`produksjonsbok_call_og_avvikslogg\` remain authoritative.
- No new runtime system, parallel scene format, safety engine, rights engine or global reputation score is introduced.

## Editorial uniqueness
This season is authored around the social mechanics of live scene production: truthful production status, call and cue chains, technical release, staffing capacity, artistic change requests, rights, accessibility, front-of-house handoff, repeated-show drift and the private leakage of responsibility pressure. It does not copy the Regi/koreografi rehearsal-room plot; the shared structure is only the canonical Role World contract.

## Season depth
- 14 days × four phases = **56 unique beats**.
- **Seven** evolving threads: production truth/decision log, cue/stage management, technical safety/release, artistic change/scope, front-of-house/accessibility, rights/staffing/mandate, and private recovery.
- **Eight** delayed consequences.
- **Five** private aftermath sequences.
- All **15 authored prerequisite mails** are reused repeatedly as materialization provenance; there is no generic fallback.

## Situated standing and authority
Seven audiences hold different standing axes. Standing may diverge after the same choice and never becomes a global reputation score. Production standing cannot grant HMS/technical approval, artistic mandate, rights, staffing authority, accessibility/medical authority, employment, budget or broader institutional power.

## History Go
The existing Edith Roger / Nationaltheatret task remains bounded historical context. It asks how scene practice, production work, theatre space, institution and audience encounter can shape one another over time; it cannot prescribe today's method, release technology, approve HMS, clear rights or expand mandate.

## Cross-role boundary
Readiness remains \`candidate_when_shared_work_is_real\`. This Role World materializes **no** cross-role runtime or shared work object. A later cross-role link must prove genuinely shared work rather than organizational proximity between scene production, artistic teams and ensemble.

## Fail-closed publication
The temporary materializer/workflow must pass the focused 56-beat gate, prerequisite compatibility, canonical generated-state parity, full Civication and repository diff cleanliness before permanent files are committed and TEMP controls are removed.

## Six-part quality gate — 29/30
| Dimension | Score | Evidence |
| --- | ---: | --- |
| Architecture and contracts | 5/5 | Existing model, grammar, plan, actors, surfaces, persistent work and authority remain intact. |
| Content depth and specificity | 5/5 | 56 beats, seven threads, eight delayed consequences, five private aftermath arcs. |
| Sociological realism | 5/5 | Status truth, cue power, technical veto, staffing, access, rights, rework and private leakage are explicit. |
| Provenance and state | 5/5 | Every beat uses one of the 15 authored source mails; waiting/handoff/bounded rework persists. |
| Scope and runtime hygiene | 5/5 | One role only, no new runtime, no cross-role object without shared-work proof. |
| Runtime evidence at publication | 4/5 | Exact-head PR CI supplies authoritative browser boot-smoke evidence. |

Total: **29/30**. No critical Role World gap is accepted.`);
