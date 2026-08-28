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

const ROLE = 'fagansvarlig';
const KEY = 'psykologi/fagansvarlig';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/fagansvarlig.json';
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/fagansvarlig_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#psykologi_fagansvarlig_job_avvik_001`,
  people: `${catalogPath('people')}#psykologi_fagansvarlig_people_skjonn_001`,
  conflict: `${catalogPath('conflict')}#psykologi_fagansvarlig_conflict_veiledning_001`,
  knowledge: `${catalogPath('knowledge')}#psykologi_fagansvarlig_knowledge_myndighet_001`,
  event: `${catalogPath('event')}#psykologi_fagansvarlig_event_implementering_001`,
  micro: `${catalogPath('micro')}#psykologi_fagansvarlig_micro_indikator_001`,
  followup: `${catalogPath('followup')}#psykologi_fagansvarlig_followup_avvik_001`,
  story: `${catalogPath('story')}#psykologi_fagansvarlig_story_retning_001`,
  consequence: `${catalogPath('consequence')}#psykologi_fagansvarlig_consequence_avvik_001`
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'avvik_fra_signal_til_neste_test',
  lunch:'veiledning_som_laringsrom',
  afternoon:'implementering_venting_og_rework',
  evening:'privat_fagrolle_mask'
};
const dayThemes = [
  'Det gjentatte avviket åpnes uten pasientidentifiserbare detaljer. To arbeidsledd har tidligere antatt at den andre parten eier kontrollpunktet, og fagansvarlig må holde saken åpen lenge nok til å skille individhandling fra arbeidsflyt.',
  'Kartleggingen gir et første handoff til klinikere og kvalitetsrådgiver. Det finnes et mønster, men ennå ikke et årsaksbevis, og den fagansvarlige må tåle at en god overlevering inneholder både det kjente og det som fortsatt mangler.',
  'En lokal prosedyre møter begrunnet klinisk skjønn. Rework betyr her å avgrense standarden og læringsspørsmålet på nytt, ikke å bruke faglig status til å overstyre individuell profesjonsmyndighet.',
  'Veiledningsrommet utsettes for kontrollpress samtidig som nye kvalitetsdata ventes inn. Fagansvarlig må beskytte læring, etablere separat lederkanal og la venting være synlig i stedet for å fylle tomrommet med personrangering.',
  'En sak sendes feilaktig til fagansvarlig for endelig klinisk godkjenning. Arbeidsrytmen avbrytes av en myndighetsgrense, og riktig handling er et presist handoff til kvalifisert og formelt utpekt beslutningseier.',
  'En ny faglig anbefaling skal innføres raskt, men opplæring og kapasitet er ujevnt fordelt. Implementeringen kan ikke gå videre bare fordi kalenderen sier mandag; ressurseier må først beslutte støtte og tid.',
  'Den grønne indikatoren viser fullføring, mens tidsstempler viser forsinkelse. Måledefinisjonen sendes tilbake til rework slik at rettidighet, fullføring og arbeidsflyt kan vurderes hver for seg.',
  'Kartleggingen peker mot et uklart kontrollpunkt og et avgrenset forsøk designes. Fagansvarlig overleverer ett eksplisitt ansvarspunkt, målekriterier og vurderingsdato uten å hevde at hele årsaken allerede er funnet.',
  'Forsøket er i ventefase. Teamet trenger støtte, og fagansvarlig kan ikke produsere et resultat før observasjonsvinduet er langt nok; presset ligger i å ikke forveksle aktivitet, kvitteringer eller sosial trygghet med effekt.',
  'En ny hendelse avbryter forsøket og gjør reservekapasitet synlig som mulig flaskehals. Rework innebærer å oppdatere hypotesen uten å slette det tiltaket som fortsatt kan ha verdi.',
  'Klinikere, ledelse og kvalitetsarbeid leser samme foreløpige resultat ulikt. Situert standing kan derfor bevege seg i forskjellige retninger mens formell myndighet, målegrunnlag og profesjonsansvar forblir uendret.',
  'Forbedringsrådet ber om én retning før hele datagrunnlaget er modent. Fagansvarlig må levere en beslutningsklar anbefaling med synlig usikkerhet, ressursbehov og hvem som faktisk eier neste beslutning.',
  'Konsekvensmålingen viser færre forsinkelser, men en ny kø når kontrolløren er opptatt. Resultatet går tilbake til handoff og rework: lovende effekt beholdes, bivirkningen åpnes og reservekapasitet blir neste avgrensede spørsmål.',
  'Rollouten lukkes uten seiersscore. Fagansvarlig kan beskrive hva som er lært, hva som fortsatt venter, hvem som eier neste beslutning og hvordan standing varierer mellom fagmiljø, ledelse og private relasjoner uten å bli myndighet.'
];
const phaseTail = {
  morning:'Morgenen etablerer siste bekreftede status, hva som faktisk venter, hvem som eier neste handoff og hvilke antakelser som ikke skal smyges inn som fakta.',
  lunch:'Lunsjflaten gjør relasjonene lesbare: hvem tåler usikkerhet, hvem opplever rework som støtte eller kontroll, og hvilken standing som endres uten at den formelle rollegrensen flyttes.',
  afternoon:'Ettermiddagen krever konkret arbeid i eksisterende Scene Pipeline: et avgrenset handoff, en ventebeslutning, et rework-spørsmål eller en eskalering som ikke overtar klinisk eller juridisk myndighet.',
  evening:'Kvelden viser ettervirkning, skam, lojalitet eller lettelse uten å gjøre faglig standing til identitet; uferdig arbeid kan forbli uferdig til neste dag når det er faglig riktig.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids: [phaseThread[phase]],
      materialization_refs: [refCycle[((day - 1) * 4 + pi) % refCycle.length]]
    });
  }
}

const theme_ids = [
  'professional_culture',
  'bureaucratic_power',
  'care_vs_efficiency',
  'status_anxiety',
  'shame_reputation',
  'loyalty_up_down',
  'social_mask',
  'precarity'
];

const work_rhythm_model = {
  runtime_binding:'editorial_only_existing_pipeline',
  continuity_thread_key:'psykologi_fagansvarlig_avvik_001',
  new_runtime_state:false,
  rule:'Waiting, handoff og rework er eksplisitte arbeidsfaser i den eksisterende Scene Pipeline. Venting er ikke automatisk suksess eller feil; en overlevering må bevare eier og åpent spørsmål, og rework skal avgrense arbeidet uten å gi fagansvarlig ny klinisk eller lovregulert myndighet.',
  states:[
    {id:'waiting',meaning:'Arbeidet står legitimt i venteposisjon mens målevindu, kapasitet, mandat, opplæring eller ny evidens mangler; fagansvarlig kan ikke fylle fraværet med antakelser.',guardrails:['venting skal være synlig og begrunnet','ingen ventetid gir automatisk rett til å overta en annens beslutning']},
    {id:'handoff',meaning:'Saken overleveres med siste bekreftede status, eksplisitt eier, åpent spørsmål og hva mottakeren faktisk må beslutte eller levere tilbake.',guardrails:['handoff skal ikke skjule usikkerhet','mottakerens myndighet må være reell og ikke utledes av sosial standing']},
    {id:'rework',meaning:'Et funn, en prosedyre, en måledefinisjon eller anbefaling returneres for ny avgrensning når premissene er for brede eller en bivirkning blir synlig.',guardrails:['rework er faglig revisjon og ikke straff','tidligere arbeid og kreditt slettes ikke for å gjøre ny versjon penere']},
    {id:'interruption',meaning:'Nytt avvik, myndighetsspørsmål eller ressursbeslutning kan avbryte planlagt forbedringsarbeid og endre rekkefølgen uten å endre rollegrensene.',guardrails:['avbrudd må få synlig årsak og eier','hastegrad kan ikke skape klinisk eller juridisk fullmakt']},
    {id:'delayed_consequence',meaning:'Effekt og bivirkning vurderes først når avtalt observasjonsvindu gir data om rettidighet, arbeidsbelastning og ny flaskehals.',guardrails:['ingen kausal seierserklæring før datagrunnlaget finnes','blandede resultater beholdes som blandede resultater']}
  ],
  transitions:[
    {from:'waiting',to:'handoff',trigger:'nødvendig status eller eier blir tilgjengelig'},
    {from:'handoff',to:'rework',trigger:'mottaker eller nye data viser at avgrensningen ikke holder'},
    {from:'rework',to:'waiting',trigger:'ny versjon trenger kapasitet, mandat eller observasjonstid'},
    {from:'waiting',to:'interruption',trigger:'ny risiko eller feilplassert myndighetsforespørsel krever prioritering'},
    {from:'interruption',to:'handoff',trigger:'saken sendes til riktig klinisk, juridisk eller organisatorisk eier'},
    {from:'rework',to:'delayed_consequence',trigger:'avgrenset tiltak er satt ut og observasjonsvinduet starter'},
    {from:'delayed_consequence',to:'rework',trigger:'resultatet viser bivirkning, usikkerhet eller ny flaskehals'}
  ]
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere. Ingen global reputation-score kan brukes som faglig evidens, klinisk kompetanse, lovregulert myndighet, ressursvedtak eller erstatning for individuelt profesjonsansvar.',
  audiences:[
    {id:'clinicians',standing_axis:'clinician_professional_standing',cares_about:['faglig rom innen tydelig minimumsstandard','rettferdig rework og begrunnet avvik','respekt for individuelt profesjonsansvar'],cannot_grant:'diagnose- eller behandlingsmyndighet, lovregulert vedtakskompetanse eller rett til å overstyre klinikerens individuelle ansvar'},
    {id:'organizational_leadership',standing_axis:'leadership_governance_standing',cares_about:['styrbar risiko og sporbar framdrift','synlig ressurs- og kapasitetsbehov','presis eskalering til riktig eier'],cannot_grant:'klinisk kompetanse eller myndighet som arbeidsgiverens mandat og lovgivning ikke allerede gir'},
    {id:'quality_improvement_partners',standing_axis:'quality_method_standing',cares_about:['målevaliditet og årsaksnøkternhet','tolkbare små tester','synlig eierskap og læringssløyfe'],cannot_grant:'sannhetsstatus til en indikator eller rett til å erklære årsak bevist uten tilstrekkelig grunnlag'},
    {id:'supervision_environment',standing_axis:'supervision_trust_standing',cares_about:['at faglig usikkerhet kan sies høyt','at veiledning ikke blir skjult prestasjonsrangering','at alvorlige forhold fortsatt har separate legitime kanaler'],cannot_grant:'fritak fra plikter, skjult taushetsløfte utenfor avtalte rammer eller ledelsesmyndighet'},
    {id:'implementation_teams',standing_axis:'implementation_support_standing',cares_about:['realistisk opplæring og støtte','forutsigbar venting og handoff','at kalenderfrist ikke later som kompetanse er implementert'],cannot_grant:'ressursbeslutningsmyndighet eller rett til å definere klinisk kompetanse gjennom popularitet eller lydighet'},
    {id:'private_relationships',standing_axis:'private_role_boundary_standing',cares_about:['at fagrolle og privat identitet kan skilles','at uferdig arbeid kan legges bort når andre eier neste steg','at offentlig eller intern kritikk ikke blir total egenverdidom'],cannot_grant:'arbeidsmyndighet, klinisk rang eller profesjonell sannhetsstatus'}
  ],
  divergence_examples:[
    'Å returnere en prosedyre til rework kan svekke kortsiktig standing hos en leder som ønsker rask lukking, men øke klinikernes og kvalitetsrådgiverens tillit når begrunnelsen og eieren er tydelig.',
    'Å beskytte veiledningsrommet kan oppleves som mindre styrbart for organisatorisk ledelse samtidig som veiledningsmiljøets tillit øker fordi profesjonell usikkerhet ikke blir skjult rangering.',
    'Å utsette full implementering til opplæring og kapasitet er avklart kan senke kortsiktig leveransestatus, men øke standing hos implementeringsteam som ellers ville arvet en urealistisk frist.'
  ],
  authority_separation:'Standing kan påvirke hvem som stoler på fagansvarlig i kvalitetsarbeidet, men kan aldri gi diagnose- eller behandlingsmyndighet, lovregulert vedtakskompetanse, ressursvedtak eller rett til å overstyre individuell profesjonsmyndighet.'
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'psykologi',
  role_scope:ROLE,
  title:'Fagansvarlig — lærende kvalitet, venting og tydelige myndighetsgrenser',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å holde kvalitetsarbeid lærende når organisasjonen belønner rask lukking, grønn status og autoritative svar, uten å gjøre lokal fagledelse til klinisk eller lovregulert myndighet.',
    description:'Role World-en lukker readiness-gjelden rhythm_waiting_handoff_rework og situated_reputation. Den følger den eksisterende anonymiserte avvikstråden gjennom venting, overlevering, rework, implementeringskapasitet, måleforsinkelse og blandet konsekvens. Eksisterende åtte-trinns mailplan, ni mailtyper, roleModel, work grammar og Scene Pipeline beholdes uendret.'
  },
  theme_ids,
  social_environments:[
    'Det fiktive kvalitetsrommet der anonymiserte avvik, arbeidsflyt, måledefinisjon og åpne årsaksspørsmål legges ved siden av hverandre uten pasientidentifiserbare opplysninger.',
    'Det fiktive veiledningsrommet der klinikere trenger et beskyttet læringsrom samtidig som alvorlige sikkerhets- og pliktspørsmål fortsatt har separate legitime kanaler.',
    'Det fiktive forbedringsrådet der fagansvarlig gir anbefaling mens organisatorisk ledelse beholder ressurs-, bemannings- og styringsbeslutninger.',
    'Arbeidsflyten mellom to funksjoner der et uklart kontrollpunkt skaper venting, handoff og ny risiko uten at én person automatisk blir hele forklaringen.',
    'Implementeringsperioden der en publisert anbefaling må bli til faktisk opplæring, støtte, kapasitet og tilbakemelding før status kan kalles robust praksis.',
    'Måleflaten der en grønn fullføringsindikator må leses sammen med rettidighet, liten datamengde og bivirkning før den får styre videre arbeid.',
    'Privatlivet etter faglig konflikt der rollen må kunne legges ned selv om et kvalitetsproblem fortsatt venter på neste eier eller målevindu.'
  ],
  recurring_people_archetypes:[
    {id:'psykologi_fagansvarlig_kliniker_world',social_function:'kliniker som bærer individuelt profesjonsansvar og må kunne vise begrunnet skjønn uten at faglig uenighet blir lest som illojalitet',class_position:'autorisert eller profesjonskvalifisert fagperson i tjenesten med eget individuelt ansvar',status:'høy situert fagstatus i egen profesjonsutøvelse',power_over_player:'kan synliggjøre at en lokal standard ikke passer situasjonen og gjøre svak fagledelse vanskelig å skjule, men gir ikke spilleren klinisk myndighet',wants:'minimumsstandarder som er tydelige nok til å lære av og åpne nok til begrunnet profesjonelt skjønn',conceals:'at rework lett kan oppleves som personlig kritikk når organisasjonen er presset',speech_style:'konkret og faglig; spør hva standarden krever, hva som kan begrunnes og hvem som faktisk eier beslutningen',teaches_player:'at klinikerstanding bygges ved å respektere individuelt ansvar og gjøre unntak lærbare'},
    {id:'psykologi_fagansvarlig_leder_world',social_function:'organisatorisk leder som eier kapasitet, bemanning og styringsbeslutninger uten å bli klinisk beslutningseier av den grunn',class_position:'formell linjeleder med ressurs- og arbeidsgivermakt',status:'høy formell organisatorisk status',power_over_player:'kan prioritere kapasitet, kreve rapportering og avgjøre ressursrammer, men kan ikke gjøre fagansvarlig til lovregulert klinisk myndighet gjennom forventning',wants:'styrbar risiko, synlig framdrift og forbedring som kan forklares oppover',conceals:'at presset for grønn status kan gjøre tidlig lukking mer attraktiv enn langsom læring',speech_style:'kort og beslutningsorientert; spør hva som venter, hva som krever ressurser og når ny status foreligger',teaches_player:'at upward standing ikke skal kjøpes med falsk sikkerhet eller skjult myndighetsglidning'},
    {id:'psykologi_fagansvarlig_kvalitetsradgiver_world',social_function:'forbedringspartner som holder avviksdata, måledefinisjon, metode og læringsspor etterprøvbart',class_position:'faglig støttefunksjon med høy metodemakt og begrenset linjemyndighet',status:'høy situert status på kvalitetsmetode',power_over_player:'kan vise at en pen indikator ikke måler det rådet tror og kan returnere et for bredt tiltak til rework',wants:'små tolkbare tester, synlige antakelser og et beslutningsspor som tåler blandede resultater',conceals:'frustrasjon over hvor ofte metodisk forsiktighet blir omtalt som treghet',speech_style:'nøktern og måleorientert; skiller observert, tolket, ventende og ubesvart',teaches_player:'at kvalitetsstanding kommer fra proporsjonal slutning, ikke fra flest grønne ruter'},
    {id:'psykologi_fagansvarlig_veileder_world',social_function:'veileder som beskytter et profesjonelt læringsrom der usikkerhet kan undersøkes uten skjult prestasjonsrangering',class_position:'erfaren fagperson med situert læringsautoritet og avgrenset organisatorisk mandat',status:'høy situert tillit i veiledningsmiljøet',power_over_player:'kan trekke seg fra en veiledningsstruktur som blir kontrollarena og gjøre tap av faglig åpenhet synlig',wants:'tydelig grense mellom refleksjon, aggregert læring og legitim separat oppfølging av alvorlige forhold',conceals:'at hun selv kan bli for beskyttende dersom enhver organisatorisk oppfølging oppleves som trussel',speech_style:'rolig og avgrensende; spør hvilken kanal et problem faktisk tilhører',teaches_player:'at tillit ikke er fravær av ansvar, men forutsigbarhet om hvordan informasjon brukes'},
    {id:'psykologi_fagansvarlig_implementeringskontakt_world',social_function:'teamkontakt som skal gjøre ny anbefaling til praktisk kompetanse under reelle tids- og kapasitetsgrenser',class_position:'operativ fagarbeider mellom anbefaling og hverdagspraksis',status:'middels formell status og høy situert kunnskap om implementeringsfriksjon',power_over_player:'kan vise at dokumentdistribusjon ikke er det samme som opplæring og at venting skyldes reell kapasitet',wants:'realistiske faser, støtte ved vanskelige tilfeller og tydelig handoff når teamet ikke kan løse neste steg selv',conceals:'at hun kan love for rask gjennomføring for å beskytte teamets omdømme',speech_style:'praktisk og tidsnær; sier hva teamet har forstått, hva de fortsatt venter på og hvor arbeidsflyten stopper',teaches_player:'at implementeringsstanding bygges ved å gjøre venting og støttebehov synlig tidlig'},
    {id:'psykologi_fagansvarlig_forbedringsrad_world',social_function:'kollektiv beslutningsflate som mottar fagansvarliges anbefaling uten å gjøre anbefalingen til automatisk vedtak',class_position:'tverrfaglig organisatorisk forum med fordelt makt',status:'høy kollektiv beslutningsstatus på avgrensede styringsspørsmål',power_over_player:'kan be om rework, prioritere eller avvise anbefaling innen faktisk mandat, men kan ikke delegere ulovlig klinisk myndighet gjennom konsensus',wants:'en anbefaling med evidens, usikkerhet, ressursbehov og eksplisitte eiere',conceals:'at rådet kan foretrekke én enkel historie framfor et blandet resultat',speech_style:'spørrende og protokollnær; ber om grunnlag, konsekvens, eier og neste vurderingspunkt',teaches_player:'at beslutningsklarhet ikke krever at usikkerhet skjules'},
    {id:'psykologi_fagansvarlig_privathjem_world',social_function:'privat nær relasjon som møter personen etter kvalitetskonflikt uten å være publikum for fagrollen',class_position:'privat likemann uten arbeidsmyndighet',status:'emosjonell nærhet uten profesjonell rang',power_over_player:'kan utfordre behovet for å løse alle åpne tråder hjemme og gjøre rollemaske og skam synlig',wants:'at spilleren kan si hva som faktisk venter, hvem som eier neste steg og når fagrollen kan legges bort',conceals:'at hun blir sliten når hvert privat spørsmål behandles som en kvalitetsaudit',speech_style:'uformell og direkte; spør om saken faktisk er din å løse i kveld',teaches_player:'at faglig standing er situert og ikke identisk med personlig verdi'}
  ],
  slow_axes:[
    {id:'system_learning_depth',meaning:'om avvik følges fra hendelse via arbeidsflyt og test til proporsjonal læring uten for tidlig lukking',runtime_binding:'existing'},
    {id:'handoff_clarity',meaning:'om siste bekreftede status, eier, åpent spørsmål og neste handling overlever mellom arbeidsflater',runtime_binding:'editorial_only_until_governed'},
    {id:'rework_tolerance',meaning:'om prosedyrer, målinger og anbefalinger kan returneres for revisjon uten at rework blir skjult straff',runtime_binding:'editorial_only_until_governed'},
    {id:'waiting_visibility',meaning:'om venting på data, kapasitet, opplæring eller myndighet er synlig som arbeidstilstand i stedet for tomrom som fylles med antakelser',runtime_binding:'editorial_only_until_governed'},
    {id:'clinician_professional_standing',meaning:'klinikeres situerte tillit til at fagansvarlig respekterer profesjonsansvar, faglig skjønn og rettferdig rework',runtime_binding:'editorial_only_until_governed'},
    {id:'leadership_governance_standing',meaning:'organisatorisk ledelses situerte tillit til styrbar risiko, ressursklarhet og etterprøvbar framdrift',runtime_binding:'editorial_only_until_governed'},
    {id:'quality_method_standing',meaning:'kvalitetsmiljøets situerte tillit til målevaliditet, årsaksnøkternhet og læringssløyfer',runtime_binding:'editorial_only_until_governed'},
    {id:'private_role_boundary_mask',meaning:'om spilleren kan skille åpen faglig gjeld og situert profesjonell standing fra privat identitet',runtime_binding:'editorial_only_until_governed'}
  ],
  work_rhythm_model,
  situated_reputation_model,
  cross_role_link:{
    status:'not_required_for_rollout',
    materialized:false,
    new_runtime:false,
    rule:'Cross-role-kobling materialiseres bare når genuinely shared work / genuint delt arbeid finnes som canonical persistent object. Fagansvarlig trenger ikke en slik kobling for denne rollouten, så ingen kunstig companion eller privilege opprettes.'
  },
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'avvik_fra_signal_til_neste_test',relationship:'det anonymiserte avviksmønsteret fra første gjentakelse via avgrenset tiltak til blandet konsekvens og neste test',beat_refs:['1/morning','2/morning','7/morning','8/morning','10/morning','13/morning','14/morning']},
    {id:'veiledning_som_laringsrom',relationship:'kliniker- og veiledningsstanding når faglig usikkerhet, lokal standard og separat lederoppfølging må eksistere samtidig',beat_refs:['3/lunch','4/lunch','6/lunch','9/lunch','11/lunch','13/lunch','14/lunch']},
    {id:'myndighetsgrense_og_eskalering',relationship:'skille mellom faglig innflytelse og klinisk, lovregulert eller organisatorisk beslutningsmyndighet',beat_refs:['2/afternoon','5/afternoon','6/afternoon','10/afternoon','12/afternoon','14/afternoon']},
    {id:'implementering_venting_og_rework',relationship:'hvordan anbefaling, opplæring, kapasitet, måling og bivirkning beveger seg gjennom venting, handoff og rework',beat_refs:['6/afternoon','7/afternoon','8/afternoon','9/afternoon','10/afternoon','12/afternoon','13/afternoon']},
    {id:'privat_fagrolle_mask',relationship:'skille mellom situert profesjonell standing, uferdig kvalitetsarbeid og privat egenverdi',beat_refs:['1/evening','4/evening','7/evening','10/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_first_recurrence',beat_ref:'1/evening',summary:'Spilleren kjenner presset om å ha et raskt svar, men må tåle at saken fortsatt er åpen og at det ikke er en identitetsdom å ikke vite årsaken ennå.'},
    {id:'after_supervision_conflict',beat_ref:'4/evening',summary:'Konflikten om veiledningsdata følger hjem som tvil om egen legitimitet; privat refleksjon skiller lederens misnøye fra total faglig verdi.'},
    {id:'after_green_metric',beat_ref:'7/evening',summary:'Det er fristende å beholde den grønne statusen som sosial beskyttelse, men spilleren må tåle at rework kan se mindre kompetent ut før det blir mer presist.'},
    {id:'after_interruption',beat_ref:'10/evening',summary:'En ny hendelse gjør at forsøket må revideres; spilleren øver på å la avbruddet være arbeid og ikke et personlig nederlag.'},
    {id:'after_mixed_result',beat_ref:'14/evening',summary:'Rollouten avsluttes med et blandet resultat og et tydelig neste spørsmål, slik at profesjonell standing kan være ujevn uten å bli en samlet score eller privat dom.'}
  ],
  delayed_consequences:[
    {id:'recurrence_returns',setup_ref:'1/morning',return_ref:'8/morning',summary:'Det første avviksmønsteret kommer tilbake som et eksplisitt kontrollpunkt i det avgrensede forsøket.'},
    {id:'procedure_judgment_returns',setup_ref:'3/lunch',return_ref:'11/lunch',summary:'Måten prosedyre og skjønn ble avklart på former senere klinikerstanding når en ny anbefaling skal revideres.'},
    {id:'supervision_channel_returns',setup_ref:'4/lunch',return_ref:'12/lunch',summary:'Grensen mellom veiledning og ledelsesoppfølging testes igjen når rådet ber om styringsinformasjon før anbefalingen er ferdig.'},
    {id:'authority_handoff_returns',setup_ref:'5/afternoon',return_ref:'12/afternoon',summary:'Den tidlige myndighetsavklaringen bestemmer om den avsluttende anbefalingen har eksplisitt beslutningseier eller skjult mandatglidning.'},
    {id:'implementation_wait_returns',setup_ref:'6/afternoon',return_ref:'13/afternoon',summary:'Ventingen på opplæring og kapasitet blir senere synlig som mulig forklaring på både forbedring og ny flaskehals.'},
    {id:'metric_rework_returns',setup_ref:'7/afternoon',return_ref:'13/morning',summary:'Rework av den grønne indikatoren gjør det mulig å oppdage at rettidigheten bedres samtidig som reservekapasitet blir et nytt problem.'}
  ],
  materialization:{
    no_new_runtime:true,
    source_refs:refCycle,
    authored_dimensions:['rhythm_waiting_handoff_rework','situated_reputation'],
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    cross_role_link_materialized:false,
    privacy_boundary:'Kun anonymiserte kvalitets- og arbeidsflytsignaler. Ingen pasientidentifiserbare opplysninger eller behandlingsråd materialiseres.',
    note:'Role World-en er editorial materialization over eksisterende Scene Pipeline. Waiting, handoff, rework og situated standing gir ingen ny runtime authority.'
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE)) {
  index.roles.push({category:'psykologi',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'twenty_role_worlds_materialized';
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Psykologi Fagansvarlig er materialisert som kontrollert Role World-rollout med eksplisitt waiting/handoff/rework og audience-spesifikk standing; klinisk, lovregulert og organisatorisk myndighet forblir separate kontrakter.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_PSYKOLOGI_FAGANSVARLIG_ROLE_WORLD_ROLLOUT.md'), `# Civication Psykologi Fagansvarlig Role World rollout\n\nDato: **2026-08-28**\n\n- Rolle: \`${KEY}\`\n- Status: \`role_world_complete\`\n- Readiness-gjeld lukket: \`rhythm_waiting_handoff_rework\` + \`situated_reputation\`\n- Season: 14 dager × 4 faser = 56 beats\n- Rhythm: waiting, handoff, rework, interruption og delayed consequence er eksplisitte editorial-faser over eksisterende Scene Pipeline\n- Standing: separate audiences for klinikere, organisatorisk ledelse, kvalitetsarbeid, veiledningsmiljø, implementeringsteam og privat rollegrense\n- Global reputation-score: forbudt\n- Cross-role: ikke nødvendig for rollout; ingen kunstig shared work-kobling materialisert\n- Authority: standing, tempo eller faglig status kan ikke gi diagnose-/behandlingsmyndighet, lovregulert vedtakskompetanse eller ressursvedtak\n- Personvern: kun anonymiserte kvalitets- og arbeidsflytsignaler; ingen pasientidentifiserbare opplysninger\n- Runtime: ingen ny runtime; eksisterende Scene Pipeline beholdes\n- Plan: eksisterende 8-trinns plan uendret\n- Provenance: de eksisterende ni Fagansvarlig-mailtypene\n\nEndelig merge-status og CI-resultat skal bare fastslås fra GitHub på PR-ens eksakte final head.\n`);

console.log('Materialized Psykologi Fagansvarlig Role World with rhythm + situated reputation only.');
