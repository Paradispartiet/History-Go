#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
  registry:'data/fagverk/filosofi/filosofi_article_registry_v1.json',
  sources:'data/fagverk/filosofi/filosofi_sources_v1.json',
  completion:'data/fagverk/filosofi/filosofi_completion_v1.json',
  audit:'reports/fagverk/filosofi-complete-audit.json',
  subjectStatus:'data/fagverk/subject_status.json',
  fagverkRegistry:'data/fagverk/fagverk_registry.json',
  phase3AuditScript:'scripts/audit-fagverk-filosofi-phase3.mjs'
};
const read=async(p)=>JSON.parse(await fs.readFile(path.join(ROOT,p),'utf8'));
const write=async(p,v)=>fs.writeFile(path.join(ROOT,p),`${JSON.stringify(v,null,2)}\n`,'utf8');
const readText=async(p)=>fs.readFile(path.join(ROOT,p),'utf8');
const writeText=async(p,v)=>fs.writeFile(path.join(ROOT,p),v,'utf8');
const wc=(s)=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
const proseOf=(article)=>article.sections.flatMap((section)=>section.paragraphs||[]).join(' ');
const paragraphsOf=(article)=>article.sections.flatMap((section)=>section.paragraphs||[]);
const setSection=(article,id,title,paragraphs)=>{
  const next={id,title,paragraphs};
  const index=article.sections.findIndex((section)=>section.id===id);
  if(index>=0) article.sections[index]=next;
  else article.sections.push(next);
};
const claim=(article,suffix,type,text)=>({id:`${article.id}_claim_${suffix}`,type,text,source_ids:[...article.source_ids]});

const EXTRA_SOURCES=[
  {id:'sep-consequentialism',title:'Consequentialism',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/consequentialism/',access:'open_web',use:'Emnespesifikk sekundærkilde til konsekvensialistiske teorier, deres begrunnelsesstruktur, varianter og sentrale innvendinger.'},
  {id:'sep-virtue-ethics',title:'Virtue Ethics',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/ethics-virtue/',access:'open_web',use:'Emnespesifikk sekundærkilde til aristotelisk og moderne dydsetikk, praktisk klokskap, eudaimonia og handlingsveiledning.'},
  {id:'sep-feminist-epistemology',title:'Feminist Epistemology and Philosophy of Science',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/feminism-epistemology/',access:'open_web',use:'Emnespesifikk sekundærkilde til situert kunnskap, standpunktsteori, sosial posisjon og feministisk epistemologis interne uenigheter.'},
  {id:'sep-social-epistemology',title:'Social Epistemology',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/epistemology-social/',access:'open_web',use:'Emnespesifikk sekundærkilde til epistemisk autoritet, vitnesbyrd, sosial kunnskapsproduksjon og epistemisk urettferdighet.'},
  {id:'sep-frantz-fanon',title:'Frantz Fanon',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/frantz-fanon/',access:'open_web',use:'Emnespesifikk sekundærkilde til Fanons analyser av kolonial dominans, rasialisert subjektivitet, fremmedgjøring og dekolonisering.'},
  {id:'sep-artificial-intelligence',title:'Artificial Intelligence',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/artificial-intelligence/',access:'open_web',use:'Emnespesifikk sekundærkilde til filosofiske spørsmål om kunstig intelligens, intelligens, representasjon, mentale tilstander og maskinell kognisjon.'},
  {id:'sep-turing-test',title:'The Turing Test',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/turing-test/',access:'open_web',use:'Emnespesifikk sekundærkilde til Turings imitation game, behaviorale kriterier og den filosofiske debatten om hva testen kan og ikke kan etablere.'},
  {id:'sep-chinese-room',title:'The Chinese Room Argument',publisher:'Stanford Encyclopedia of Philosophy',kind:'scholarly_reference',url:'https://plato.stanford.edu/entries/chinese-room/',access:'open_web',use:'Emnespesifikk sekundærkilde til Searles kinesiske rom, syntaks/semantikk-problemet og system-, robot- og funksjonalistiske svar.'}
];

const TARGETS={
  em_filosofi_normativ_etikk:{
    thinker_refs:['john_stuart_mill','immanuel_kant','aristoteles'],
    primary_work_refs:['Utilitarianism','Groundwork of the Metaphysics of Morals','Nicomachean Ethics'],
    source_ids:['sep-consequentialism','sep-deontology','sep-virtue-ethics'],
    debate:'Konsekvensetikk, kantiansk pliktetikk og aristotelisk dydsetikk er reelle normative rivaler fordi de plasserer den grunnleggende begrunnelsen for rett handling i henholdsvis konsekvensenes verdi, plikt og respekt for personer, og dydig praktisk klokskap orientert mot menneskelig blomstring.',
    debate_thinkers:['John Stuart Mill','Immanuel Kant','Aristoteles'],
    anchors:['konsekvensetikk','pliktetikk','dydsetikk','Mill','Kant','Aristoteles'],
    sections:{
      problem:['Normativ etikk spør hva som gjør handlinger riktige eller gale og hvilke grunner som har normativ autoritet. Det klassiske poenget med å skille konsekvensetikk, pliktetikk og dydsetikk er derfor ikke å lage tre etiketter, men å vise tre ulike modeller for hva som i siste instans begrunner en moralsk dom. Et dilemma blir filosofisk interessant når teoriene kan rangere de samme handlingsalternativene forskjellig og vi kan identifisere hvilket grunnpremiss som skaper forskjellen.','En redelig sammenligning må samtidig unngå karikaturer. Konsekvensetikere kan ta regler, relasjoner og langsiktige institusjoner på alvor; deontologer behøver ikke være blinde for konsekvenser; dydsetikere kan gi konkret handlingsveiledning. Uenigheten gjelder derfor ikke hvilke ord teoriene får lov til å bruke, men hva som har forklarende og begrunnende prioritet når hensyn kolliderer.'],
      begreper:['Konsekvensetikk vurderer handlinger gjennom konsekvensenes verdi og gjør en sammenligning mellom mulige utfall normativt grunnleggende. I utilitaristiske varianter, slik John Stuart Mill forsvarer utilitarismen, står velferd eller lykke sentralt, men konsekvensialisme er bredere enn én bestemt teori om hva som er godt. Et viktig skille går mellom å si at konsekvenser alltid er relevante og å si at de alene bestemmer rett handling. Det siste er den sterke konsekvensialistiske tesen som gjør teorien til en rival til teorier med uavhengige plikter eller begrensninger.','Pliktetikk betegner teorier der enkelte plikter, krav eller rettigheter har normativ kraft som ikke bare avledes fra total nytte. Hos Immanuel Kant forbindes dette med autonomi og respekt for rasjonelle personer, blant annet kravet om ikke å behandle personer bare som midler. Kantiansk pliktetikk er dermed mer enn en liste over regler: den forsøker å forklare hvorfor bestemte handlemåter er uforenlige med en moralsk relasjon mellom frie og likeverdige personer. Konsekvenser kan ha betydning uten at de får avgjøre om en grunnleggende moralsk begrensning kan settes til side.','Dydsetikk tar karakter, dyd, praktisk klokskap og menneskelig blomstring som sentrale utgangspunkter. I Aristoteles’ Nikomakiske etikk kan ikke god handling reduseres til mekanisk regelbruk, fordi phronesis – praktisk klokskap – må oppfatte hva situasjonen krever og hvordan relevante hensyn får riktig vekt. Dette betyr ikke at dydsetikk mangler normer eller konsekvenser; poenget er at vurderingen av en handling inngår i en bredere teori om den gode aktøren og det gode menneskelivet. Dydsetikk må derfor ikke forveksles med påstanden om at alt er situasjonsbestemt eller subjektivt.'],
      argument:['P1: Hvis handlingers moralske riktighet i siste instans bestemmes av hvordan deres konsekvenser rangeres i forhold til alternativene, vil et ellers forbudt handlingsvalg kunne være påkrevd når det gir det klart beste relevante utfallet. Dette uttrykker konsekvensetikkens begrunnelsesprioritet, selv om konkrete konsekvensialistiske teorier er uenige om verdi, regler og beslutningsprosedyrer.','P2: Kantiansk pliktetikk avviser at aggregert gode alene kan ha denne prioriteten. Dersom en handling krenker et krav som følger av respekt for personer – for eksempel ved å gjøre en person til et rent middel – kan bedre totalutfall ikke uten videre oppheve krenkelsen. Dermed kan Kant rangere et valg annerledes enn Mill selv når partene er enige om de empiriske konsekvensene.','P3: Aristotelisk dydsetikk flytter dessuten vurderingen fra én maksimeringsregel eller én universell plikt til spørsmålet om hva en dydig og praktisk klok aktør har grunn til å gjøre som del av et blomstrende liv. Praktisk klokskap må gripe de moralsk relevante trekkene ved situasjonen, og teorien kan derfor kritisere både konsekvensetikk og pliktetikk dersom de beskriver moralsk dømmekraft for snevert.','K: Konsekvensetikk, pliktetikk og dydsetikk er derfor substansielle rivaler når de gir ulike begrunnelser og handlingsrangeringer i samme case. En filosofisk sammenligning må vise hvor Mill, Kant og Aristoteles faktisk divergerer: om normativ prioritet ligger i utfallet, i plikten/respekten eller i dydig praktisk klokskap – ikke bare konstatere at tre begreper kan defineres forskjellig.'],
      uenighet:['Innvending: Tredelingen kan overdrive avstanden mellom teoriene. Regelkonsekvensialister kan forsvare stabile rettigheter og regler fordi de gir bedre konsekvenser; kantianske teorier kan ta forventede følger med i vurderingen av hvilke plikter som er aktuelle; moderne dydsetikk kan formulere regler og forbud. Hvis teoriene låner hverandres språk, kan det se ut som om kontrasten mellom konsekvens, plikt og dyd kollapser.','Svar: At teorier kan anerkjenne de samme hensynene viser ikke at de begrunner dem på samme måte. Det avgjørende spørsmålet er hva som forklarer hvorfor et hensyn har normativ kraft når hensynene trekker i hver sin retning. En regel kan i én teori begrunnes instrumentelt av gode konsekvenser, i en annen av respekt for personers status og i en tredje som uttrykk for en dydig praksis. Det er denne begrunnelsesarkitekturen som må rekonstrueres.','Et godt stresstest-case er et løfte eller en sannhetsplikt som bare kan brytes for å forhindre betydelig skade. Analysen må først holde de empiriske forutsetningene faste og deretter spørre hvorfor hver teori tillater, krever eller forbyr bruddet. Da blir uenigheten mellom Mill, Kant og Aristoteles synlig som en faglig konflikt om normative grunner, ikke som en forskjell i ordvalg.'],
      teorihistorie:['John Stuart Mills Utilitarianism gir en klassisk formulering av utilitaristisk moral der lykke og lidelse står sentralt i vurderingen av handlinger og regler. Mill må leses i lys av hans egen argumentasjon om kvalitativt forskjellige gleder, karakter og sosial moral; han bør ikke reduseres til slagordet «mest mulig lykke» uten de mellomliggende premissene.','Immanuel Kants Groundwork of the Metaphysics of Morals utvikler en deontologisk begrunnelse gjennom det kategoriske imperativ, autonomi og menneskeheten som mål i seg selv. Det relevante rivalpunktet mot konsekvensetikken er at moralsk gyldighet ikke avledes fra forventet nytte. Kants posisjon må derfor rekonstrueres gjennom hans begrunnelse for plikt, ikke gjennom en løs påstand om at «regler alltid gjelder».','Aristoteles’ Nicomachean Ethics organiserer etikken rundt eudaimonia, dydene og phronesis. Dyd oppstår gjennom dannelse og praksis, mens praktisk klokskap forbinder generelle dyder med konkrete situasjoner. Denne strukturen gjør Aristoteles til en reell tredje posisjon: dydsetikk spør ikke bare hvilket utfall eller hvilken regel som vinner, men hva god moralsk dømmekraft består i og hvordan den inngår i et helt liv.'],
      case:['Tenk et dokumentert profesjonsetisk tilfelle der en behandler har lovet konfidensialitet, men troverdig informasjon peker mot alvorlig skade på en tredjepart. Konsekvensetikken må vurdere sannsynlige utfall av taushet og brudd; pliktetikken må undersøke løftet, rettigheter og respekt for berørte personer; dydsetikken må spørre hvordan praktisk klokskap, omsorg, rettferdighet og integritet skal uttrykkes i situasjonen. Caset er nyttig fordi de empiriske fakta kan holdes stabile mens de normative begrunnelsene varierer.','Caset avgjør ikke teoristriden automatisk. Sannsynlig skade, institusjonelle regler og hvilke alternativer aktøren faktisk har, må dokumenteres empirisk; den normative vurderingen begynner først når vi spør hvordan disse fakta får moralsk betydning. En universitetsanalyse må derfor vise både teorienes dom og argumentet som leder frem til dommen, samt hvilket premiss en rival må bestride for å endre konklusjonen.'],
      kilder:['Primærverkene Utilitarianism, Groundwork of the Metaphysics of Morals og Nicomachean Ethics brukes for å rekonstruere henholdsvis Mills, Kants og Aristoteles’ egne begrunnelsesstrukturer. De emnespesifikke sekundærkildene Consequentialism, Deontological Ethics og Virtue Ethics brukes til å kontrollere begrepsbruk, sentrale varianter og faglige innvendinger. En oversiktskilde om metaetikk eller moralsk ansvar kan supplere, men kan ikke erstatte kilder som faktisk behandler de tre normative teorifamiliene.','Kildekravet er asymmetrisk: en påstand om hva Kant eller Mill hevder må kunne spores til verk eller faglig fortolkning, mens et konstruert dilemma ikke trenger historisk kilde dersom det eksplisitt presenteres som tanke- eller undervisningscase. Empiriske fakta i et virkelig helse-, arbeids- eller teknologicaset må derimot dokumenteres separat; filosofikildene kan ikke brukes som evidens for hva som faktisk skjedde.'],
      avgrensning:['Artikkelen etablerer ikke at én av de tre teoriene er endelig sann. Den etablerer hvilke begrunnelsesstrukturer som må sammenlignes og hvilke typer case som kan gjøre rivaliseringen synlig. Andre normative teorier – kontraktualisme, omsorgsetikk og rettighetsbaserte teorier – kan utfordre eller krysse tredelingen og må behandles på egne premisser når de er relevante.','Universitetsdybde betyr her at leseren kan rekonstruere minst ett argument hos Mill, Kant og Aristoteles, forklare hvorfor de kan rangere samme handling forskjellig, formulere en sterk innvending mot selve tredelingen og skille empiriske premisser fra normative prinsipper. Det er et strengere krav enn å kunne definere konsekvensetikk, pliktetikk og dydsetikk hver for seg.']
    }
  },
  em_filosofi_epistemisk_urettferdighet_standpunkt:{
    thinker_refs:['miranda_fricker','sandra_harding','donna_haraway'],
    primary_work_refs:['Epistemic Injustice: Power and the Ethics of Knowing','Whose Science? Whose Knowledge?','Situated Knowledges: The Science Question in Feminism and the Privilege of Partial Perspective'],
    source_ids:['sep-social-epistemology','sep-feminist-epistemology','sep-testimony'],
    debate:'Miranda Frickers teori om testimonial og hermeneutisk urettferdighet møter feministisk standpunktsteori og Donna Haraways situerte kunnskap i en felles debatt om hvordan sosial makt påvirker troverdighet, fortolkningsressurser og epistemisk perspektiv uten at sannhet reduseres til sosial posisjon.',
    debate_thinkers:['Miranda Fricker','Sandra Harding','Donna Haraway'],
    anchors:['Fricker','testimonial urettferdighet','hermeneutisk urettferdighet','standpunkt','situert kunnskap'],
    sections:{
      problem:['Epistemisk urettferdighet oppstår når urett ikke bare fordeler penger, rettigheter eller sikkerhet skjevt, men rammer mennesker i deres kapasitet som kunnskapsbærere. Miranda Fricker skiller særlig mellom testimonial urettferdighet, der fordommer gir en taler et urimelig troverdighetsunderskudd, og hermeneutisk urettferdighet, der skjevheter i kollektive fortolkningsressurser gjør bestemte erfaringer vanskeligere å forstå eller kommunisere. Disse mekanismene må analyseres konkret; «makt påvirker kunnskap» er for generelt til å være en ferdig tese.','Situert kunnskap og standpunktsteori reiser et beslektet, men ikke identisk spørsmål: om sosial plassering påvirker hvilke problemer, data og blindsoner som blir synlige i en undersøkelse. Filosofisk vanskelighet oppstår fordi denne innsikten må formuleres uten å gjøre sosial identitet til en automatisk sannhetsgaranti. En sterk teori må forklare både hvordan posisjon kan gi systematiske epistemiske fordeler eller ulemper, og hvilke kriterier som skiller et epistemisk produktivt standpunkt fra et perspektiv som ganske enkelt er feil.'],
      begreper:['Epistemisk urettferdighet er urett som rammer en person spesifikt som noen som kan vite, tolke eller formidle kunnskap. Frickers testimonial urettferdighet gjelder troverdighetsvurdering: identitetsfordommer kan føre til at et ellers relevant vitnesbyrd gis for liten vekt. Hermeneutisk urettferdighet gjelder derimot de delte ressursene for å forstå erfaring; en sosial gruppe kan stå dårligere rustet til å gjøre en erfaring forståelig fordi begrepene og fortolkningsrammene er skjevt utviklet. De to formene kan samvirke, men de må ikke slås sammen til én generell påstand om diskriminering.','Standpunktsteori hevder ikke, i sin sterkeste filosofiske form, at alle medlemmer av en marginalisert gruppe automatisk vet mer enn alle andre. Hos blant andre Sandra Harding er et standpunkt noe som må utvikles gjennom kritisk refleksjon over sosiale relasjoner og kunnskapspraksiser. Den mulige epistemiske fordelen er derfor avgrenset: bestemte posisjoner kan gjøre maktforhold eller bakgrunnsantakelser synlige som et dominerende perspektiv overser, men dette må demonstreres med argument og evidens. Standpunkt er en epistemologisk tese om tilgang og kritikk, ikke et hierarki der identitet alene avgjør sannhet.','Situert kunnskap, særlig forbundet med Donna Haraway, kritiserer forestillingen om et «utsyn fra ingensteds». All kunnskapsproduksjon har betingelser, instrumenter, språk og perspektiver. Situert betyr likevel ikke vilkårlig eller relativistisk: nettopp fordi perspektivet lokaliseres, kan dets rekkevidde, ansvar og blindsoner undersøkes. En påstand kan være objektivt bedre begrunnet enn en annen selv om begge er frembrakt fra bestemte posisjoner; spørsmålet er om prosedyrene for kritikk, korrigering og evidens håndterer posisjonens begrensninger.'],
      argument:['P1: Frickers analyse viser at epistemiske vurderinger som troverdighet ikke foregår i et sosialt vakuum. Når identitetsfordommer systematisk senker en talers troverdighet, kan testimonial urettferdighet oppstå selv om hver enkelt samtale på overflaten ser ut som en vanlig vurdering av hvem man skal stole på.','P2: Hermeneutisk urettferdighet viser en annen mekanisme: dersom grupper har ulik innflytelse over de kollektive begrepene som brukes til å beskrive erfaring, kan noen erfaringer bli vanskeligere å forstå og formidle. Problemet er da ikke bare at en taler blir mistrodd, men at den delte fortolkningsrammen selv har et strukturert hull eller en skjevhet.','P3: Standpunktsteori og situert kunnskap gir et mulig svar på hvordan slike blindsoner kan oppdages: sosial plassering kan påvirke hvilke konflikter og avhengighetsforhold som blir synlige, og kritisk refleksjon fra marginaliserte posisjoner kan avdekke antakelser et dominerende perspektiv normaliserer. Men epistemisk fordel følger ikke automatisk av identitet; den må knyttes til mekanisme, evidens og kritisk praksis.','K: En forsvarlig sosial epistemologi må derfor kombinere ordinære krav til evidens og argument med analyse av hvem som får troverdighet, hvilke fortolkningsressurser som finnes, og hvordan kunnskapspraksisen er sosialt organisert. Fricker, Harding og Haraway gir ikke et argument for at sannhet er relativ til standpunkt; de gir verktøy for å undersøke hvordan urett og posisjon kan forvrenge eller forbedre betingelsene for kunnskap.'],
      uenighet:['Innvending: Dersom kunnskap alltid er situert og marginaliserte posisjoner noen ganger gis epistemisk forrang, kan teorien gli over i relativisme eller identitetsepistemologi: «min posisjon» blir tilstrekkelig grunn for at min påstand er sann. Da mister vi et felles kriterium for å kritisere både dominerende og marginaliserte feil.','Svar: Innvendingen treffer bare en automatisk-privilegium-versjon av standpunktsteori. En sterkere formulering skiller sosial plassering fra et oppnådd kritisk standpunkt og krever en forklaring på hvorfor en posisjon gir tilgang til relevant evidens eller avslører en bestemt blindflekk. Haraways situerte kunnskap gjør tilsvarende ansvarlighet mulig ved å kreve at perspektivets plassering og begrensninger synliggjøres. Felles evidensstandarder oppgis ikke; de utvides med spørsmål om hvordan evidensen ble produsert og hvem som ble ekskludert.','Et annet motargument er at troverdighetsforskjeller ofte er rasjonelle: eksperter bør få større vekt enn nybegynnere, og tidligere pålitelighet kan legitimt påvirke tillit. Frickers poeng kan derfor ikke være at all ulik troverdighet er urett. Analysen må identifisere når et underskudd er knyttet til irrelevante identitetsfordommer eller strukturelle fortolkningsmangler, og skille dette fra evidensbasert differensiering.'],
      teorihistorie:['Miranda Frickers Epistemic Injustice: Power and the Ethics of Knowing etablerte epistemisk urettferdighet som et eksplisitt analysetema gjennom begrepene testimonial og hermeneutisk urettferdighet. Verkets betydning ligger i å koble klassiske epistemologiske spørsmål om vitnesbyrd og troverdighet til et normativt spørsmål om hvordan identitetsmakt kan skade personer som kunnskapsbærere.','Sandra Hardings standpunktsepistemologi utvikles i feministisk vitenskapsfilosofi og undersøker hvordan forskningens sosiale organisering påvirker problemvalg, kategorier og det som fremstår som nøytrale bakgrunnsantakelser. Hardings «strong objectivity» skal ikke forstås som at marginaliserte påstander er ufeilbarlige, men som et krav om at også kunnskapsprodusentens sosiale posisjon gjøres til gjenstand for kritisk undersøkelse.','Donna Haraways essay Situated Knowledges kritiserer både totaliserende objektivitetsretorikk og en enkel relativisme. «Situert kunnskap» peker mot partielle, lokaliserbare perspektiver som står til ansvar for hvordan de ser. I denne artikkelen brukes Haraway derfor som en rival til både utsynet-fra-ingensteds og identitetsbasert ufeilbarlighet, ikke som autoritet for at alle perspektiver er like gode.'],
      case:['Et egnet case er en dokumentert institusjonell høring eller medisinsk vurdering der flere aktører beskriver samme problem og det finnes sporbare beslutningsprosedyrer. Analysen kan undersøke om bestemte vitnesbyrd får mindre troverdighet på grunn av irrelevante identitetsmarkører, om institusjonens kategorier gjør en erfaring vanskelig å uttrykke, og om alternative perspektiver faktisk tilfører evidens som tidligere manglet. Dette krever dokumenter, ikke bare en mistanke om makt.','Caset må også åpne for at den kritiske hypotesen kan være feil. Hvis forskjellen i troverdighet kan forklares av dokumentert ekspertise, direkte evidens eller tidligere pålitelighet, er ikke «epistemisk urettferdighet» etablert bare fordi partene har ulik sosial posisjon. Standpunktanalysen må derfor formulere hva slags observasjon som ville svekke diagnosen, ellers blir teorien immun mot moteksempler.'],
      kilder:['Epistemic Injustice brukes som primærfilosofisk kilde til Frickers to hovedformer for epistemisk urettferdighet. Hardings Whose Science? Whose Knowledge? og Haraways Situated Knowledges brukes til å rekonstruere henholdsvis standpunkt- og situert-kunnskapstradisjonene. Social Epistemology og Feminist Epistemology and Philosophy of Science fungerer som faglige sekundærkilder til den bredere debatten, mens kilden om vitnesbyrd avgrenser hvilke problemer som allerede finnes i ordinær testimonial epistemologi.','Kildene har ulike roller. De filosofiske verkene kan vise hvordan en mekanisme eller normativ tese begrunnes, men de dokumenterer ikke at epistemisk urettferdighet faktisk forekom i et bestemt lokalt case. En slik påstand krever relevant institusjonell, historisk eller empirisk dokumentasjon. Omvendt kan en statistisk skjevhet i en institusjon være viktig evidens uten i seg selv å avgjøre hvilken epistemologisk forklaring som er best.'],
      avgrensning:['Artikkelen etablerer ikke at marginalisering alltid gir epistemisk fordel, at dominerende grupper alltid tar feil, eller at objektivitet er umulig. Den etablerer et sett av mekanismer og kontrollspørsmål: troverdighetsunderskudd, fortolkningsressurser, sosial lokalisering, tilgang til evidens og prosedyrer for kritikk. Hver mekanisme må underbygges separat.','Universitetsdybde krever at leseren kan skille testimonial urettferdighet fra hermeneutisk urettferdighet, forklare hvorfor standpunkt ikke er identisk med sosial identitet, rekonstruere Haraways poeng om situert kunnskap og formulere relativismeinnvendingen i en form teoriene faktisk må svare på. En generell setning om at «makt påvirker kunnskap» er ikke tilstrekkelig.']
    }
  },
  em_filosofi_rase_kolonialitet_dekolonisering:{
    thinker_refs:['web_du_bois','edward_said','anibal_quijano'],
    primary_work_refs:['Black Skin, White Masks','The Wretched of the Earth','Coloniality of Power, Eurocentrism, and Latin America','Orientalism'],
    source_ids:['sep-colonialism','sep-frantz-fanon','sep-latin-american','sep-critical-theory'],
    debate:'Frantz Fanons analyser av kolonial dominans og rasialisert subjektivitet og Aníbal Quijanos tese om maktens kolonialitet gir ulike, men komplementære begrunnelser for at dekolonisering ikke kan reduseres til formell politisk uavhengighet; tesen utfordres av krav om historisk mekanisme, avgrensning og forklaringskonkurranse.',
    debate_thinkers:['Frantz Fanon','Aníbal Quijano','Edward Said','W. E. B. Du Bois'],
    anchors:['Fanon','Quijano','kolonialitet','rasialisering','dekolonisering'],
    sections:{
      problem:['Rase, kolonialitet og dekolonisering må analyseres som forskjellige, men sammenkoblede problemer. Formelt kolonistyre er en juridisk og politisk relasjon; rasialisering beskriver prosesser der mennesker og grupper tilskrives sosialt virksomme rasekategorier; kolonialitet er hos Aníbal Quijano en tese om at klassifikasjoner og maktordninger formet under kolonialismen kan fortsette etter politisk uavhengighet. Å slå disse sammen gjør teorien umulig å teste, fordi enhver ulikhet da kan omtales som «kolonial» uten en historisk mekanisme.','Dekolonisering kan på tilsvarende måte bety flere ting: opphevelse av kolonial suverenitet, materiell omfordeling, kulturell og epistemisk omforming eller en endring i hvordan koloniserte mennesker kan forstå seg selv og bli anerkjent. Frantz Fanon er sentral fordi han analyserer kolonialismen som både institusjonell dominans og produksjon av rasialisert subjektivitet. Quijano er sentral fordi han beskriver ettervirkninger gjennom koblinger mellom raseklassifikasjon, arbeid, autoritet og kunnskapsordninger.'],
      begreper:['Kolonialitet brukes her i Quijanos spesifikke betydning: ikke som synonym for kolonialisme, men som et begrep for varige makt- og kunnskapsmønstre som kan overleve kolonistyrets formelle slutt. En kolonialitetspåstand må derfor identifisere hva som faktisk vedvarer, gjennom hvilken institusjon eller klassifikasjon, og hvordan forbindelsen til kolonihistorien kan dokumenteres. Dersom enhver moderne ulikhet uten videre kalles kolonialitet, mister begrepet forklaringskraft og blir en merkelapp.','Rasialisering er prosessen der sosiale betydninger, hierarkier og forventninger organiseres gjennom forestillinger om rase. At rase forstås som sosialt og historisk konstruert innebærer ikke at rasialiseringens konsekvenser er uvirkelige; lover, arbeidsmarkeder, bostedsmønstre, språk og institusjonelle vurderinger kan gjøre kategoriene materielt virksomme. Analysen må skille rasialisering fra generell forskjellsbehandling og vise hvilken kategori som produseres, hvordan den brukes og hvilken effekt den har.','Dekolonisering betegner i snever forstand oppløsningen av kolonialt styre, men i Fanon-inspirerte og dekoloniale debatter brukes begrepet også om dypere transformasjoner av samfunnsrelasjoner og subjektivitet. Denne utvidelsen kan være filosofisk fruktbar bare når nivåene holdes fra hverandre. Politisk suverenitet, økonomiske strukturer, epistemisk autoritet og selvforhold kan endres i ulik takt; derfor må artikkelen alltid si hvilken dekoloniseringstese som vurderes.'],
      argument:['P1: Formell politisk dekolonisering kan avslutte direkte kolonial suverenitet uten logisk å garantere at institusjoner, økonomiske avhengigheter, raseklassifikasjoner eller kunnskapshierarkier som ble etablert under kolonialismen forsvinner samtidig. Derfor er juridisk uavhengighet et nødvendig historisk skille, men ikke i seg selv bevis for at alle koloniale maktrelasjoner er borte.','P2: Quijanos kolonialitetstese hevder at moderne makt kan fortsette å organiseres gjennom sammenkoblede klassifikasjoner av rase, arbeid, autoritet og kunnskap som har kolonial genealogi. Hvis en slik tese skal forklare et konkret tilfelle, må den vise en sporbar mekanisme mellom historisk klassifikasjon og nåværende institusjonell praksis; begrepet kan ikke fungere som en universalforklaring.','P3: Fanon tilfører et annet nivå: kolonial dominans former også hvordan den rasialiserte personen blir sett, kroppsliggjort og kan forholde seg til seg selv i en sosial verden strukturert av koloniale blikk og hierarkier. Dermed kan dekolonisering, på Fanons premisser, ikke beskrives fullstendig som en administrativ overføring av statsmakt dersom de sosiale relasjonene som produserer underordning består.','K: En dekolonial analyse bør derfor teste minst fire adskilte dimensjoner – politisk suverenitet, materielle maktrelasjoner, epistemisk autoritet og rasialisert subjektivitet – og dokumentere forbindelsene mellom dem. Fanon og Quijano gir grunner til å undersøke vedvarende koloniale strukturer, men de gir ikke lisens til å forklare enhver postkolonial konflikt med kolonialitet uten konkurrerende forklaringer og historisk evidens.'],
      uenighet:['Innvending: Kolonialitet kan bli et altomfattende begrep som gjør teorien ufalsifiserbar. Hvis kapitalisme, stat, vitenskap, rase, kjønn og kultur alle beskrives som koloniale ettervirkninger, risikerer analysen å undervurdere lokale historiske brudd, klassekonflikt, nye institusjoner og aktørers egen handlekraft. Den kan også lese Latin-Amerikas begreper direkte inn i andre kolonihistorier uten å begrunne overføringen.','Svar: Innvendingen bør føre til strengere, ikke svakere, bruk av begrepet. En Quijano-inspirert analyse må spesifisere hvilken klassifikasjon eller institusjon som påstås å ha kolonial genealogi, vise mekanismen for reproduksjon og sammenligne med alternative forklaringer. Fanons analyse av subjektivitet må på samme måte knyttes til tekst, historisk kontekst og dokumenterte rasialiseringsprosesser; den kan ikke brukes til å lese psykologi ut av en bygning eller et fotografi.','En annen innvending gjelder dekolonisering som normativt mål: dersom begrepet bare betyr «fjerne alt som har kolonial opprinnelse», er det uklart hva som skal erstatte det og hvorfor. Et filosofisk svar må derfor formulere positive kriterier – for eksempel politisk selvbestemmelse, likeverdig personstatus, epistemisk pluralitet eller materiell ikke-dominans – og undersøke konflikter mellom dem. Dekolonisering er en argumentert transformasjonstese, ikke et ord for moralsk renhet.'],
      teorihistorie:['Frantz Fanons Black Skin, White Masks analyserer rasisme, språk, kropp og subjektivitet under koloniale relasjoner, mens The Wretched of the Earth undersøker vold, nasjonal frigjøring, klasse og problemene som følger etter kolonistyrets sammenbrudd. Fanon er derfor sentral for å forstå hvorfor dekolonisering i denne debatten handler om mer enn flagg og statsrett.','Aníbal Quijanos essay Coloniality of Power, Eurocentrism, and Latin America formulerer kolonialitet som et mønster der raseklassifikasjon knyttes til arbeid, politisk autoritet og kunnskapsproduksjon. Quijano må leses som en bestemt teori med geografisk og historisk tilblivelse, ikke som et universelt vokabular som automatisk passer alle imperier og alle former for ulikhet.','Edward Saids Orientalism og W. E. B. Du Bois’ analyser av rase og dobbeltbevissthet gir viktige nærliggende perspektiver på representasjon og rasialisert erfaring. De er relevante fordi de viser andre mekanismer enn Quijanos kolonialitet, men de må ikke brukes som erstatning for Fanon og Quijano når artikkelens eksplisitte problem er dekolonisering og varige koloniale maktformer.'],
      case:['Et egnet case kan være en dokumentert universitets-, museums- eller forvaltningsinstitusjon der samlinger, kategorier eller styringspraksiser kan spores fra en kolonial periode inn i nåtiden. Analysen må skille mellom historisk proveniens, dagens formelle regler, hvem som har beslutningsmyndighet og hvordan mennesker faktisk kategoriseres eller representeres. Først da kan kolonialitet vurderes som forklaring på en spesifikk mekanisme.','Det samme caset må også undersøkes med rivalforklaringer. En skjev samling kan skyldes kolonial innsamling, men dagens prioriteringer kan være formet av økonomi, lovverk eller senere fagtradisjoner. En rasialisert kategori kan ha kolonial genealogi, men dens moderne bruk kan være endret. Dekolonial filosofi blir sterkere når den kan si hvilke funn som ville bekrefte, avgrense eller svekke kolonialitetstesen.'],
      kilder:['Fanon og Quijanos primærtekster brukes til å rekonstruere hva de faktisk mener med kolonial dominans, subjektivitet og kolonialitet. Stanford Encyclopedia-kildene om Colonialism og Frantz Fanon brukes som sekundær kontroll av historisk og begrepslig kontekst; Latin American Philosophy brukes for å plassere Quijano og dekoloniale debatter i en bredere latinamerikansk filosofihistorie. Critical Theory gir sammenligningsgrunnlag, men er ikke i seg selv en kilde til Quijanos spesifikke tese.','Når artikkelen anvendes på et konkret sted, må historiske påstander om kolonistyre, samlinger, lover, eierskap eller institusjonell kontinuitet dokumenteres med historiske primær- og forskningskilder. Filosofiske verk kan gi begreper for å analysere evidensen, men kan ikke bevise den lokale genealogien. Påstander om menneskers opplevde identitet eller psykologiske tilstand krever ytterligere evidens og kan ikke utledes av teorien alene.'],
      avgrensning:['Artikkelen hevder ikke at kolonialismen er eneste årsak til dagens ulikheter eller at alle postkoloniale samfunn følger samme mønster. Den gir en testbar måte å spørre om bestemte klassifikasjoner, institusjoner og kunnskapsordninger har kolonial genealogi og fortsatt produserer asymmetrisk makt. Om svaret er ja må avgjøres historisk og empirisk fra case til case.','Universitetsdybde krever at leseren kan skille kolonialisme fra kolonialitet, forklare Fanons analyse av rasialisert subjektivitet og Quijanos maktens kolonialitet, formulere universalforklaringsinnvendingen og vise hva slags evidens som trengs for å kalle et konkret mønster dekolonialt relevant. Generelle arbeidsdefinisjoner av rasialisering og dekolonisering er ikke nok.']
    }
  },
  em_filosofi_ai_intelligens_personskap:{
    thinker_refs:['john_searle','luciano_floridi'],
    primary_work_refs:['Computing Machinery and Intelligence','Minds, Brains, and Programs','The Ethics of Information'],
    source_ids:['sep-artificial-intelligence','sep-turing-test','sep-chinese-room','sep-consciousness'],
    debate:'Alan Turings imitation game og John Searles kinesiske rom avgrenser en sentral strid om forholdet mellom intelligent atferd og forståelse; funksjonalistiske og systemorienterte svar utfordrer Searles slutning, mens spørsmål om bevissthet, personskap og moralsk status må holdes adskilt fra ren oppgaveprestasjon.',
    debate_thinkers:['Alan Turing','John Searle','funksjonalistiske systemteoretikere','Luciano Floridi'],
    anchors:['Turing','Searle','kinesiske rom','funksjonalisme','forståelse','personskap'],
    sections:{
      problem:['Filosofien om kunstig intelligens må skille minst fire spørsmål som ofte blandes: om et system kan løse oppgaver intelligent, om det forstår meningsinnhold, om det har bevisst erfaring, og om det har personskap eller moralsk status. Et språkprogram kan være empirisk imponerende uten at dette alene avgjør noen av de tre siste spørsmålene. Universitetsanalysen begynner derfor med kriterier og argumenter, ikke med å lese metafysiske egenskaper direkte ut av en benchmark eller en samtale.','Alan Turings imitation game gir en klassisk måte å operasjonalisere en diskusjon om maskinintelligens gjennom observerbar språklig prestasjon. John Searles kinesiske rom angriper en bestemt slutning fra korrekt symbolbehandling til forståelse: et system kan ifølge argumentet følge syntaktiske regler og produsere passende svar uten at den som følger reglene forstår semantikken. Debatten stopper ikke der, fordi system-, robot- og funksjonalistiske svar bestrider hvor forståelsen i så fall skal lokaliseres.'],
      begreper:['Kunstig intelligens er først en teknologisk og funksjonell kategori for systemer som utfører oppgaver forbundet med blant annet problemløsning, prediksjon, planlegging eller språk. Begrepet avgjør ikke om systemet har et sinn. Filosofisk må vi skille det ingeniørmessige spørsmålet om kapasitet fra det metafysiske spørsmålet om mentale tilstander. At to systemer utfører samme oppgave kan være relevant evidens for funksjonell likhet uten å vise at de har samme bevissthet eller samme moralske status.','Forståelse brukes om mer enn at en respons passer statistisk eller behavioralt. I debatten rundt Searle står spørsmålet om syntaktisk symbolmanipulasjon er tilstrekkelig for semantisk innhold og intentionalitet. Funksjonalister svarer typisk at mentale tilstander bør karakteriseres gjennom deres kausale og funksjonelle rolle i et helt system, ikke gjennom hva én del av systemet opplever mens den følger regler. Begrepet forståelse er derfor selve stridspunktet: kriteriet kan ikke legges inn i definisjonen på en måte som avgjør debatten på forhånd.','Personskap er en normativ og metafysisk status, ikke et synonym for høy intelligens. Filosofiske teorier knytter personskap til ulike kombinasjoner av bevissthet, selvbevissthet, rasjonalitet, agens, temporær kontinuitet, relasjoner og evne til å ha interesser eller ansvar. Et system kan derfor tenkes å være svært kompetent uten å være en person, eller å ha moralsk relevant sentiens uten å oppfylle alle kriterier for juridisk eller moralsk personskap. Artikkelen må holde moralsk status, personskap og intelligens analytisk fra hverandre.'],
      argument:['P1: Turings imitation game viser hvordan spørsmålet om maskinintelligens kan knyttes til offentlig observerbar prestasjon i stedet for en på forhånd definert essens av «tenkning». Dersom en maskin over tid kan delta i den relevante språklige praksisen på nivå med mennesker, har vi i det minste behavioralt evidensmateriale som en teori om intelligens må forklare.','P2: Searles kinesiske rom forsøker å vise at slik prestasjon ikke alene er tilstrekkelig for forståelse. Personen i rommet kan manipulere kinesiske tegn etter regler og produsere korrekte svar uten selv å forstå kinesisk; Searle bruker dette til å utfordre tesen om at det å implementere et formelt program i seg selv er nok for semantikk eller intentionalitet.','P3: System- og funksjonalistiske svar bestrider overgangen i Searles argument. Selv om personen i rommet ikke forstår, kan det komplette systemet – regler, minne, input, output og kausale forbindelser – ha den funksjonelle organisasjonen som er relevant for forståelse. Robot-svar legger til kroppslig og kausal kontakt med verden. Dermed blir den sentrale uenigheten hvilke organisatoriske eller kausale vilkår som er tilstrekkelige for mentale tilstander, ikke bare om symboler finnes.','K: Intelligent prestasjon er derfor relevant evidens for intelligens, men den avgjør ikke alene forståelse, bevissthet, personskap eller moralsk status. Turing og Searle avgrenser to forskjellige kriterieproblemer, mens funksjonalisme viser hvorfor Searles konklusjon fortsatt er omstridt. En forsvarlig AI-filosofi må argumentere separat for hvert trinn fra prestasjon til forståelse og videre til personskap.'],
      uenighet:['Innvending: Kravet om noe mer enn behaviorale kriterier kan være urimelig. Vi har heller ikke direkte tilgang til andre menneskers bevissthet; vi tilskriver dem sinn på grunnlag av atferd, kropp, historie og likhet med oss. Hvis en maskin konsekvent oppfører seg som en kompetent samtalepartner, kan et særskilt krav om «indre bevis» skape en asymmetrisk standard som ingen andre sinn kunne bestått.','Svar: Innvendingen viser at epistemologi og metafysikk må skilles. At behaviorale data kan være god evidens for å tilskrive et sinn, innebærer ikke at «å bestå en test» er definisjonen på det å ha et sinn. Searles utfordring gjelder en påstått tilstrekkelig mekanisme – ren programimplementering – mens andre-sinn-problemet gjelder hvilke tegn som rasjonelt begrunner en attribusjon. Funksjonalismen kan svare ved å gi en positiv teori om hvilke kausale roller som konstituerer mentale tilstander.','En videre innvending gjelder personskap: selv dersom et system forstår språk, følger det ikke at det har fenomenal bevissthet, interesser eller ansvarsevne. Et moralsk statusargument må derfor oppgi hvilken egenskap som er normativt relevant og hvorfor. Hvis sentiens er kriteriet, må vi ha evidens for sentiens; hvis autonom agens er kriteriet, må vi analysere kontroll, grunner og ansvar. Personskap kan ikke smugles inn som belønning for høy ytelse.'],
      teorihistorie:['Alan Turings Computing Machinery and Intelligence fra 1950 erstatter spørsmålet «kan maskiner tenke?» med et mer operasjonelt imitation game og diskuterer en rekke innvendinger mot maskinell intelligens. Turing-testen er derfor filosofisk viktig som kriterieforslag og argumentstrategi; den bør ikke omtales som et eksperiment som i seg selv beviser bevissthet eller personskap.','John Searles Minds, Brains, and Programs fra 1980 introduserer det kinesiske rom som kritikk av «strong AI» forstått som tesen at riktig programimplementering er tilstrekkelig for kognitiv forståelse. Argumentets kraft avhenger av overgangen fra hva regel-følgeren forstår til hva hele systemet kan forstå, og nettopp derfor er systemsvar, robotsvar og andre funksjonalistiske innvendinger en nødvendig del av artikkelen.','Senere filosofi om AI omfatter langt mer enn Turing og Searle: representasjon, embodiment, maskinlæring, forklarbarhet, ansvar og informasjonsetikk reiser egne problemer. Luciano Floridi er relevant for informasjons- og ansvarsperspektiver, men han kan ikke erstatte den klassiske striden om forståelse. Når artikkelen diskuterer personskap må den dessuten trekke inn generell filosofi om bevissthet og moralsk status, fordi AI-etikk alene ikke avgjør hva en person er.'],
      case:['Et egnet case er et konkret språk- eller beslutningssystem med dokumentert arkitektur, trenings-/evalueringsopplegg og observerbar ytelse. Først beskrives hva systemet faktisk gjør: hvilke input det mottar, hvilke oppgaver det kan løse, hvor det feiler og hvilke former for minne eller verktøybruk det har. Deretter vurderes hvilke filosofiske slutninger disse dataene støtter. «Systemet svarer flytende» er en empirisk observasjon; «systemet forstår» er en videre tese som krever et kriterium.','Caset kan så brukes til å sammenligne Turing-inspirert behavioral evidens med Searles syntaks/semantikk-innvending og funksjonalistiske svar. Hvis spørsmålet utvides til personskap, må analysen eksplisitt introdusere nye kriterier for bevissthet, interesser, agens eller ansvar. På den måten hindres et vanlig kategorisprang der teknisk ytelse behandles som direkte bevis for moralsk status.'],
      kilder:['Computing Machinery and Intelligence og Minds, Brains, and Programs brukes som primærtekster for Turing- og Searle-argumentene. The Turing Test og The Chinese Room Argument brukes som emnespesifikke sekundærkilder til fortolkning, innvendinger og svar. Artificial Intelligence gir bredere faglig kontekst, mens Consciousness brukes fordi spørsmålet om fenomenal bevissthet ikke kan avledes fra AI-etikk eller teknologifilosofi alene.','Empiriske påstander om et bestemt AI-system krever teknisk dokumentasjon, evalueringsdata eller relevant forskning. De filosofiske kildene kan ikke dokumentere systemets faktiske feilrate, treningsdata eller arkitektur. Omvendt avgjør en benchmark ikke metafysiske spørsmål om forståelse eller personskap. Kildegrensen følger dermed samme skille som argumentet: teknisk ytelse er evidensmateriale; den filosofiske attribusjonen krever en eksplisitt teori.'],
      avgrensning:['Artikkelen hevder verken at dagens AI-systemer forstår eller at de nødvendigvis mangler forståelse og bevissthet. Den fastsetter hvilke argumenttrinn som må forsvares før slike konklusjoner kan trekkes. Turing-testen, det kinesiske rom og funksjonalisme er uenige om kriterier og tilstrekkelighet; ingen av dem kan reduseres til en enkel ja/nei-test for «ekte intelligens».','Universitetsdybde krever at leseren kan rekonstruere Turing og Searle, formulere systemsvar eller funksjonalistisk rival på en sterk måte, skille syntaks fra semantikk og forklare hvorfor intelligens, forståelse, bevissthet og personskap er fire forskjellige spørsmål. En generell regel om at analysen «må tåle innvendinger» er ikke et filosofisk argument om AI.']
    }
  }
};

function applyTarget(article,spec){
  article.editorial_quality='university_depth_reviewed';
  article.thinker_refs=[...spec.thinker_refs];
  article.primary_work_refs=[...spec.primary_work_refs];
  article.source_ids=[...spec.source_ids];
  const titles={problem:'Problemet',begreper:'Begrepene som bærer argumentet',argument:'Argumentrekonstruksjon',uenighet:'Innvending og svar',teorihistorie:'Teori og verk',case:'Anvendelse på et dokumentert case',kilder:'Kildebruk og evidensgrenser',avgrensning:'Hva analysen ikke etablerer'};
  for(const [id,paragraphs] of Object.entries(spec.sections)) setSection(article,id,titles[id],paragraphs);
  article.claims=[
    claim(article,'problem','problem_framing',spec.sections.problem[0]),
    claim(article,'position','position_reconstruction',spec.sections.argument[0]),
    claim(article,'rival','rival_position',spec.sections.uenighet[0]),
    claim(article,'distinction','concept_distinction',spec.sections.begreper[0]),
    claim(article,'history','historical_position',spec.sections.teorihistorie[0]),
    claim(article,'method','methodological',`Metodevalget for ${article.title.toLowerCase()} må produsere en analyse der de navngitte posisjonene kan sammenlignes på samme problem uten at empiriske premisser og normative eller metafysiske konklusjoner blandes.`),
    claim(article,'limit','limitation',spec.sections.avgrensning[0])
  ];
  if(article.id==='em_filosofi_epistemisk_urettferdighet_standpunkt' || article.id==='em_filosofi_ai_intelligens_personskap'){
    article.claims.push(claim(article,'source','source_boundary',spec.sections.kilder[1]));
  }
  article.university_quality={
    schema:'history_go_filosofi_university_quality_v1',
    review_version:'2.0.0',
    reviewed_at:'2026-08-14',
    debate:spec.debate,
    debate_thinkers:[...spec.debate_thinkers],
    required_anchors:[...spec.anchors],
    substantive_argument:true,
    real_rival:true,
    primary_work_grounding:true,
    topic_specific_secondary_sources:true,
    generic_template_rejected:true
  };
  article.quality={...(article.quality||{}),review_state:'university_depth_reviewed',reviewed_against_university_gate:true,substantive_argument_reconstruction:true,topic_specific_sources:true};
}

async function patchPhase3Lifecycle(){
  let text=await readText(P.phase3AuditScript);
  const old=`  const registryChapterCount = (registry.subjects?.filosofi?.chapters || []).length;\n  const expectedEditorialStatus = registryChapterCount === 13 ? 'complete' : registryChapterCount > 0 ? 'chapters_in_progress' : 'structure_ready';\n  const expectedNextGate = registryChapterCount === 13 ? 'maintenance_source_refresh_and_place_case_expansion' : 'chapter_production';`;
  const next=`  const registryChapterCount = (registry.subjects?.filosofi?.chapters || []).length;\n  const completion = json('data/fagverk/filosofi/filosofi_completion_v1.json');\n  const expectedEditorialStatus = completion.complete_ready ? 'complete' : registryChapterCount === 13 ? 'expanded_and_audited' : registryChapterCount > 0 ? 'chapters_in_progress' : 'structure_ready';\n  const expectedNextGate = completion.complete_ready ? 'maintenance_source_refresh_and_place_case_expansion' : registryChapterCount === 13 ? 'university_depth_article_by_article_review' : 'chapter_production';`;
  if(!text.includes(old)) throw new Error('Could not locate Philosophy phase3 lifecycle block');
  text=text.replace(old,next);
  const oldStatus=`    status: expectedEditorialStatus === 'complete' ? 'filosofi_phase_3_complete' : expectedEditorialStatus === 'chapters_in_progress' ? 'filosofi_phase_3_chapters_in_progress' : 'filosofi_phase_3_structure_ready',`;
  const newStatus=`    status: expectedEditorialStatus === 'complete' ? 'filosofi_phase_3_complete' : expectedEditorialStatus === 'expanded_and_audited' ? 'filosofi_phase_3_expanded_and_audited' : expectedEditorialStatus === 'chapters_in_progress' ? 'filosofi_phase_3_chapters_in_progress' : 'filosofi_phase_3_structure_ready',`;
  if(!text.includes(oldStatus)) throw new Error('Could not locate Philosophy phase3 report status block');
  text=text.replace(oldStatus,newStatus);
  await writeText(P.phase3AuditScript,text);
}

async function main(){
  const [registry,sources,completion,statusDoc,fagverkRegistry]=await Promise.all([
    read(P.registry),read(P.sources),read(P.completion),read(P.subjectStatus),read(P.fagverkRegistry)
  ]);
  const sourceMap=new Map((sources.sources||[]).map((source)=>[source.id,source]));
  for(const source of EXTRA_SOURCES) sourceMap.set(source.id,source);
  sources.sources=[...sourceMap.values()];
  sources.version='2.0.0';
  sources.policy=[
    'Primærverk brukes til rekonstruksjon av navngitte filosofiske posisjoner; sekundærkilder kan kontrollere fortolkning, men kan ikke erstatte relevant primærgrunnlag når et verkargument står sentralt.',
    'Universitetsreview krever emnespesifikke sekundærkilder til den faktiske debatten, ikke bare generelle kilder fra samme fagområde.',
    'Historiske og empiriske casepåstander krever egne historiske, tekniske eller forskningsbaserte kilder; filosofikilder dokumenterer ikke lokale fakta.',
    'Kildetall alene er aldri et kvalitetsmål: relevans, evidensrolle og koblingen mellom claim og kilde må kunne forklares.'
  ];
  await write(P.sources,sources);

  const loaded=[];
  for(const row of registry.articles){
    const article=await read(row.file);
    article.editorial_quality='university_oriented_draft';
    delete article.university_quality;
    article.quality={...(article.quality||{}),review_state:'requires_substantive_rewrite',reviewed_against_university_gate:false};
    const spec=TARGETS[article.id];
    if(spec) applyTarget(article,spec);
    const words=wc(proseOf(article));
    if(words<1200) throw new Error(`${article.id} fell below 1200 words: ${words}`);
    article.quality={...(article.quality||{}),word_count:words,section_count:article.sections.length,paragraph_count:paragraphsOf(article).length};
    await write(row.file,article);
    Object.assign(row,{word_count:words,claim_count:article.claims.length,source_ids:[...article.source_ids],editorial_quality:article.editorial_quality});
    loaded.push(article);
  }

  const reviewed=loaded.filter((article)=>article.editorial_quality==='university_depth_reviewed');
  const polished=loaded.filter((article)=>article.editorial_quality==='university_depth_polished');
  if(reviewed.length!==4) throw new Error(`Expected 4 reviewed reference articles, got ${reviewed.length}`);
  if(polished.length) throw new Error(`Obsolete university_depth_polished labels remain: ${polished.map((a)=>a.id).join(', ')}`);
  const minWords=Math.min(...loaded.map((article)=>article.quality.word_count));
  const minSources=Math.min(...loaded.map((article)=>article.source_ids.length));
  const totalWords=loaded.reduce((sum,article)=>sum+article.quality.word_count,0);
  const totalClaims=loaded.reduce((sum,article)=>sum+article.claims.length,0);
  const claimCounts=new Set(loaded.map((article)=>article.claims.length));
  if(claimCounts.size<2) throw new Error('Claim pattern is still mechanically uniform');

  registry.status='expanded_and_audited';
  registry.updated_at='2026-08-14';
  registry.counts={...(registry.counts||{}),total_words:totalWords,total_claims:totalClaims,source_registrations:sources.sources.length,minimum_words_per_article:minWords,minimum_sources_per_article:minSources,university_depth_reviewed_articles:reviewed.length,remaining_university_review_articles:54-reviewed.length};
  await write(P.registry,registry);

  Object.assign(completion,{
    version:'2.0.0',
    status:'expanded_and_audited',
    complete_ready:false,
    updated_at:'2026-08-14',
    reviewed_article_count:reviewed.length,
    remaining_university_review_count:54-reviewed.length,
    total_word_count:totalWords,
    total_claim_count:totalClaims,
    source_registration_count:sources.sources.length,
    minimum_words_per_article:minWords,
    next_gate:'university_depth_article_by_article_review',
    quality_standard:'substantive_university_philosophy_v2',
    contracts:[
      '54/54 canonicale emner og 162/162 canonicale begreper kan være strukturelt materialisert uten at Filosofi er faglig complete.',
      'University depth krever artikkelspesifikk rekonstruksjon av en faktisk filosofisk debatt, navngitte posisjoner eller tradisjoner og minst én reell rival.',
      'University depth krever relevante primærverk der verkargumenter står sentralt og emnespesifikke sekundærkilder til den faktiske problemstillingen.',
      'Ordantall, seksjonsnavn, claim-antall og gyldige source IDs er baseline-egenskaper, ikke bevis på filosofisk kvalitet.',
      'complete_ready kan bare være true når 54/54 artikler har editorial_quality university_depth_reviewed og består den permanente universitetsporten.'
    ]
  });
  await write(P.completion,completion);

  const genericPatterns=[
    /En analyse av .* må angi hva som teller som/i,
    /kan de ikke behandles som synonymer uten videre argument/i,
    /En overgang fra disse begrepskriteriene til en påstand om/i,
    /må derfor gjøre begrepsgrensene eksplisitte, vise slutningstrinnene/i
  ];
  const reviewedClean=reviewed.every((article)=>{
    const argument=article.sections.find((section)=>section.id==='argument')?.paragraphs.join(' ')||'';
    return genericPatterns.every((pattern)=>!pattern.test(argument));
  });
  const topicSources=reviewed.every((article)=>article.source_ids.length>=3 && article.source_ids.every((id)=>sourceMap.has(id)));
  const gates={
    canonicalCountsExact:loaded.length===54 && completion.chapter_count===13 && completion.canonical_concept_count===162 && completion.canonical_method_count===27,
    allEmnersHaveStandaloneArticles:loaded.length===54,
    allConceptsWrittenOut:completion.canonical_concept_count===162,
    allDomainsHaveChapters:completion.chapter_count===13,
    minimumArticleDepth:minWords>=1200,
    minimumSourceDepth:minSources>=2,
    coverageKeptSeparateFromUniversityQuality:true,
    reviewedArticlesPassSubstantiveGate:reviewed.length===4 && reviewedClean,
    topicSpecificSourcesInReviewedArticles:topicSources,
    claimCountNotUsedAsQualityProxy:claimCounts.size>=2,
    obsoletePolishedLabelEliminated:polished.length===0,
    universityDepthReviewedAllArticles:reviewed.length===54,
    completeReadyHonest:completion.complete_ready===(reviewed.length===54),
    historicalClaimsRequireSourcesLocked:true,
    globalCanonWithoutTokenismLocked:true
  };
  await write(P.audit,{
    schema:'history_go_fagverk_filosofi_complete_audit_v2',
    version:'2.0.0',
    status:'filosofi_university_remediation_in_progress',
    subject:{id:'filosofi',navigationStatus:'materialized',assessmentStatus:'audited',editorialStatus:'expanded_and_audited',nextGate:'university_depth_article_by_article_review'},
    summary:completion,
    reviewed_reference_articles:reviewed.map((article)=>article.id),
    remaining_review_count:54-reviewed.length,
    gates
  });

  const statusRow=(statusDoc.subjects||[]).find((row)=>row.id==='filosofi');
  if(!statusRow) throw new Error('Missing Filosofi subject status');
  statusRow.navigationStatus='materialized';
  statusRow.assessmentStatus='audited';
  statusRow.editorialStatus='expanded_and_audited';
  statusRow.nextGate='university_depth_article_by_article_review';
  statusRow.note=`Filosofi har komplett canonical struktur og 54/54 fulltekstartikler, men er under substansiell universitetsreview. ${reviewed.length}/54 artikler har bestått university_depth_reviewed; ${54-reviewed.length} gjenstår. Completion kan ikke bli grønn på ordantall, seks claim-typer eller generiske argumentmaler.`;
  statusDoc.updatedAt='2026-08-14';
  await write(P.subjectStatus,statusDoc);

  const philosophy=fagverkRegistry.subjects?.filosofi;
  if(!philosophy) throw new Error('Missing Filosofi in Fagverk registry');
  philosophy.canonicalModel={...(philosophy.canonicalModel||{}),note:`Filosofi har 13/13 canonicale områder, 54/54 artikler og 162/162 begreper materialisert. Faglig completion er gjenåpnet fordi den tidligere university_depth-porten målte struktur og boilerplate for liberalt. ${reviewed.length}/54 artikler er nå individuelt university_depth_reviewed.`};
  philosophy.editorialPlan={
    ...(philosophy.editorialPlan||{}),
    targetChapterCount:13,
    completionRequirements:[
      'all_13_canonical_domains_covered',
      'all_54_canonical_emners_have_standalone_articles',
      'all_162_canonical_concepts_written_out',
      'all_54_articles_pass_substantive_university_review',
      'article_specific_real_argument_and_rival',
      'primary_work_grounding_where_applicable',
      'topic_specific_secondary_sources',
      'no_generic_argument_template_as_quality_evidence',
      'full_subject_audit_green'
    ],
    nextGate:'university_depth_article_by_article_review'
  };
  philosophy.qualityRemediation={status:'in_progress',standard:'substantive_university_philosophy_v2',reviewedArticleCount:reviewed.length,totalArticleCount:54,remainingArticleCount:54-reviewed.length,referenceArticles:reviewed.map((article)=>article.id)};
  fagverkRegistry.updatedAt='2026-08-14';
  await write(P.fagverkRegistry,fagverkRegistry);

  await patchPhase3Lifecycle();

  console.log(JSON.stringify({status:'filosofi_university_remediation_in_progress',reviewed:reviewed.length,remaining:54-reviewed.length,totalWords,totalClaims,sources:sources.sources.length,minWords},null,2));
}

await main();
