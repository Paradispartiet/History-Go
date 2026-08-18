#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  'data/Civication/mailFamilies/sport/job/sport_utover_job.json',
  'data/Civication/mailFamilies/sport/people/sport_utover_people.json'
];

const CHOICES = {
  sport_utover_week1_job_1: [
    ['Følg den tekniske øktplanen og spar overskuddet til resten av treningsuka.', 'Jeg holder intensiteten der planen sier og bruker overskuddet til å gjennomføre uka godt.'],
    ['Skru opp økta for å vise treneren at du tåler mer enn planen forutsetter.', 'Jeg øker intensiteten for å vise at jeg er klar for mer, selv om det bryter dagens belastningsmål.'],
    ['Be Maja avtale én kontrollert hardere blokk og behold resten av økta som planlagt.', 'Jeg ber om en tydelig avgrenset testblokk, men lar resten av økta følge belastningsplanen.']
  ],
  sport_utover_week1_job_2: [
    ['Rapporter plagen til Elias før hovedbelastningen og la funnene styre dagens økt.', 'Jeg sier fra før belastningen øker og lar den faglige vurderingen påvirke planen.'],
    ['Skjul plagen og gjennomfør full intensitet for å unngå å miste treningstid.', 'Jeg holder plagen for meg selv og trener fullt for å beskytte dagens status og kontinuitet.'],
    ['Avtal en kort testbelastning med Elias og stopp dersom signalet forverres.', 'Jeg tester kroppen innen en avtalt grense og lar responsen avgjøre om økta fortsetter.']
  ],
  sport_utover_week1_job_3: [
    ['Eie den smalere lagrollen fullt og be om konkrete kriterier for å utvikle den videre.', 'Jeg tar rollen på alvor og ber om tydelige kriterier for hva som skal til for mer ansvar.'],
    ['Bruke økta til å bevise at trenerens rollevalg er for defensivt for deg.', 'Jeg spiller større enn oppgaven for å vise at jeg burde hatt mer ansvar allerede.'],
    ['Akseptere rollen i dag, men avtale et eget tidspunkt for samtale om ambisjonen din.', 'Jeg følger dagens rolle og skiller den fra en senere, tydelig samtale om utvikling og ansvar.']
  ],
  sport_utover_week1_job_4: [
    ['Analysere den svake konkurransen i konkrete valg og ferdigheter før du vurderer resultatet samlet.', 'Jeg skiller prestasjonsvalg fra sluttresultatet og finner det som faktisk kan trenes videre.'],
    ['La nederlaget definere hele prestasjonen og endre flere ting samtidig før neste konkurranse.', 'Jeg behandler resultatet som bevis på at hele opplegget må endres med en gang.'],
    ['Velge ett tydelig forbedringspunkt fra konkurransen og la resten av evalueringen vente til i morgen.', 'Jeg tar med ett konkret læringspunkt nå og utsetter den brede dommen til jeg har mer avstand.']
  ],
  sport_utover_week1_job_5: [
    ['Juster neste økt for tapt søvn og reisetid, og registrer reisen som reell belastning.', 'Jeg gjør reisebelastningen synlig og justerer treningen sammen med støtteapparatet.'],
    ['Gjennomfør opprinnelig økt uendret for å vise at reise ikke skal bli en unnskyldning.', 'Jeg følger den gamle planen fullt selv om søvn og logistikk ga kroppen mindre margin.'],
    ['Behold hovedmålet for økta, men kutt volumet og legg inn ekstra restitusjon etterpå.', 'Jeg beskytter øktas viktigste kvalitet samtidig som totalbelastningen reduseres.']
  ],
  sport_utover_week2_job_1: [
    ['Be sportslig leder forklare uttakskriteriene og skill dem tydelig fra selve kontrakten.', 'Jeg ber om kriteriene for uttaket uten å behandle arbeidsavtalen som rett til plass i troppen.'],
    ['Bruk kontrakten som argument for at du bør være med i troppen denne gangen.', 'Jeg viser til arbeidsforholdet som grunn til at jeg forventer sportslig uttak.'],
    ['Aksepter uttaket nå og avtal en konkret utviklingssamtale før neste troppsvalg.', 'Jeg lar dagens beslutning stå og avtaler når prestasjon og framtidig rolle skal vurderes.']
  ],
  sport_utover_week2_job_2: [
    ['Si tydelig i garderoben at tidlig smerterapportering beskytter både spilleren og laget.', 'Jeg utfordrer normen og gjør det legitimt å melde fra før en plage blir et fravær.'],
    ['Le med og la hver spiller selv avgjøre hvor mye smerte som er verdt å nevne.', 'Jeg beskytter garderobestemningen og lar taushetsnormen stå uimotsagt.'],
    ['Ta Samir til side etterpå og be ham hjelpe med en lagregel for tidlig rapportering.', 'Jeg unngår en offentlig maktkamp, men prøver å endre normen sammen med den som har sosial kapital.']
  ],
  sport_utover_week2_job_3: [
    ['Avklar sponsorforespørselen mot lagets faktiske avtaler før du lover tid eller eksponering.', 'Jeg sjekker kontrakten og lagforpliktelsene før jeg svarer den kommersielle parten.'],
    ['Si ja til sponsoraktiviteten først og forsøk å flytte lagforpliktelsen etterpå.', 'Jeg sikrer muligheten mens den finnes og prøver å løse kollisjonen med laget senere.'],
    ['Be Henrik forhandle et kortere opplegg som ikke overlapper den avtalte lagaktiviteten.', 'Jeg prøver å bevare den kommersielle muligheten innen en ramme laget faktisk kan godta.']
  ],
  sport_utover_week2_job_4: [
    ['Følg belastningsvurderingen og tilby en redusert konkurranserolle som kroppen tåler.', 'Jeg lar kroppens margin styre og tilbyr bare den belastningen som er faglig forsvarlig.'],
    ['Spill fullt fordi laget trenger deg og håndter kroppskostnaden etter konkurransen.', 'Jeg prioriterer dagens behov og skyver konsekvensen for belastningen framover.'],
    ['Avtal en tydelig tids- eller belastningsgrense med trener og fysio før konkurransestart.', 'Jeg kan bidra, men bare innen en på forhånd avtalt grense som støtteapparatet kan følge.']
  ],
  sport_utover_week2_job_5: [
    ['Definer tre konkrete arbeidsmål for konkurransen som ikke avhenger av sluttresultatet.', 'Jeg går inn i konkurransen med oppgaver jeg kan eie selv om resultatet fortsatt betyr mye.'],
    ['Bruk resultatet som den avgjørende testen på om du faktisk holder profesjonelt nivå.', 'Jeg lar plassering eller resultat avgjøre hvordan jeg vurderer min egen verdi som utøver.'],
    ['Velg ett resultatmål og ett prosessmål, og avtal evaluering først etter restitusjon.', 'Jeg beholder ambisjonen, men binder ikke hele vurderingen av meg selv til én resultatlinje.']
  ],
  sport_utover_week1_private_1: [
    ['Legg bort matinntaksanalysen under middagen og vær venn før du igjen er utøver.', 'Jeg lar måltidet være et sosialt rom og tar eventuelle restitusjonsvalg uten å gjøre Jonas til støtteapparat.'],
    ['Fortsett å optimalisere middagen selv om samtalen med Jonas blir sekundær.', 'Jeg bruker kvelden til å sikre restitusjonen, selv om vennskapet må tilpasse seg planen.'],
    ['Avtal med Jonas at du gjør ett nødvendig måltidsvalg og deretter slipper treningspraten resten av middagen.', 'Jeg beholder én praktisk ramme, men setter en tydelig slutt på optimaliseringen for kvelden.']
  ],
  sport_utover_week1_private_2: [
    ['Svar søsteren med hvordan kroppen faktisk føles før du nevner tallene du følger.', 'Jeg beskriver kroppen som levd erfaring først og bruker data som støtte, ikke som hele språket.'],
    ['Forsvar målingene som eneste seriøse måte å forstå kroppen på.', 'Jeg holder fast ved at tallene er det mest pålitelige, selv om samtalen blir mer distansert.'],
    ['Vis henne hvilke få målinger som faktisk styrer trening, og la resten av kroppssamtalen være uten tall.', 'Jeg skiller relevante arbeidsdata fra behovet for å evaluere kroppen hele tiden.']
  ],
  sport_utover_week1_private_3: [
    ['La benkeopplevelsen roe seg i kveld og møt neste økt med den rollen treneren faktisk har gitt.', 'Jeg lar statusuroen bli hjemme og går inn i neste økt for å løse oppgaven min.'],
    ['Planlegg en ekstra hard egenøkt i morgen for å bevise at benken var feil vurdering.', 'Jeg gjør neste dag til en demonstrasjon av verdi og lar benken styre belastningen.'],
    ['Skriv ned spørsmålet du vil stille treneren, men vent til planlagt samtaletid før du tar det opp.', 'Jeg tar ambisjonen på alvor uten å la kveldens frustrasjon bestemme neste økt.']
  ],
  sport_utover_week1_private_4: [
    ['Si nei til den sene delen av planen, men foreslå noe med Jonas som faktisk passer før leggetid.', 'Jeg setter en søvngrense uten å behandle vennskapet som et problem som må fjernes.'],
    ['Avlys hele møtet fordi spontanitet ikke passer inn i konkurranseforberedelsen.', 'Jeg beskytter planen fullt og lar Jonas forstå at prestasjonen kommer først denne perioden.'],
    ['Bli med en kort stund og avtal på forhånd når du går hjem, uansett hvor hyggelig det blir.', 'Jeg lager en sosial ramme som både gir vennskapet plass og beskytter søvnen.']
  ],
  sport_utover_week1_private_5: [
    ['Legg bort statistikk og klipp resten av kvelden slik at kroppen faktisk får en resultatfri pause.', 'Jeg gjør hvilen reell og lar konkurransen være ferdig for i dag.'],
    ['Fortsett å se klipp og tall til du har funnet en forklaring som gir kontroll.', 'Jeg bruker kvelden på å analysere videre fordi uvissheten føles verre enn manglende hvile.'],
    ['Se gjennom én avtalt sekvens med et konkret spørsmål og lukk deretter alle resultatflater.', 'Jeg tillater en avgrenset analyse, men setter et faktisk sluttpunkt før kvelden forsvinner.']
  ],
  sport_utover_week2_private_1: [
    ['Forklar familien at kontrakten er en jobb, mens uttak og framtidig stjernestatus fortsatt må fortjenes og besluttes andre steder.', 'Jeg deler stoltheten, men korrigerer forventningen om at kontrakten automatisk betyr høyere sportslig status.'],
    ['La familien fortelle historien som om kontrakten allerede betyr fast uttak og gjennombrudd.', 'Jeg lar den større statusfortellingen stå fordi den føles god og gir anerkjennelse nå.'],
    ['Feir kontrakten fullt i kveld, men avtal at dere ikke spekulerer i uttak før en faktisk beslutning finnes.', 'Jeg beskytter feiringen samtidig som framtidig status får vente på reelle hendelser.']
  ],
  sport_utover_week2_private_2: [
    ['Flytt oppmerksomheten fra Noras kropp til hva din egen kropp skal kunne gjøre i neste arbeidsoppgave.', 'Jeg bruker funksjon og egen oppgave som målestokk i stedet for å gjøre kroppen til rangering.'],
    ['Studer bildet videre og bruk forskjellene mot Nora som motivasjon for å kontrollere kroppen hardere.', 'Jeg lar sammenligningen bli drivstoff og strammer inn fordi jeg vil ligne mer på det jeg ser.'],
    ['Snakk med støtteapparatet om ett relevant funksjonsmål og slett bildet fra egen evalueringsrutine.', 'Jeg tar et faglig spørsmål videre, men lar ikke et sosialt bilde bli måleinstrumentet.']
  ],
  sport_utover_week2_private_3: [
    ['Følg hviledagen som planlagt og behandle fravær av trening som en del av profesjonelt arbeid.', 'Jeg lar kroppen hente seg inn og regner restitusjonen som utført arbeid, ikke som latskap.'],
    ['Legg inn en ekstra økt for å kjenne at du fortsatt gjør nok på fridagen.', 'Jeg trener likevel fordi passivitet føles som tap av seriøsitet og kontroll.'],
    ['Ta en rolig aktivitet uten prestasjonsmål og avtal at den ikke registreres som en treningsøkt.', 'Jeg beveger meg fordi det føles godt, men nekter å gjøre hviledagen til skjult trening.']
  ],
  sport_utover_week2_private_4: [
    ['Steng kommentarfeltet for natta og vurder prestasjonen sammen med fagfolk i arbeidstida i stedet.', 'Jeg lar offentlig vurdering bli liggende og beskytter søvn og neste dags arbeidsrom.'],
    ['Les videre for å vite nøyaktig hva publikum mener før du legger deg.', 'Jeg søker kontroll gjennom flere kommentarer selv om omdømmet følger meg inn i natta.'],
    ['Velg én tidsavgrenset sjekk av egne kanaler, slå av varsler og avslutt uten å svare.', 'Jeg holder et minimum av oversikt, men setter en fast grense før kommentarfeltet tar kvelden.']
  ],
  sport_utover_week2_private_5: [
    ['Planlegg en hel privat halvdag der trening, kropp, uttak og resultater ikke får være prosjektet.', 'Jeg lager et rom der jeg kan være noe annet enn profesjonell utøver uten å skamme meg over pausen.'],
    ['Bruk helgen til å optimalisere alt rundt neste prestasjon fordi idretten trenger full prioritet akkurat nå.', 'Jeg lar jobbrollen organisere også fritida fordi enhver margin kan bli sportslig fordel.'],
    ['Behold én nødvendig restitusjonsrutine, men la resten av halvdagens valg styres av vennskap og lyst.', 'Jeg beskytter det kroppen faktisk trenger uten å gjøre hele privatlivet til en prestasjonsplan.']
  ]
};

function allMails(catalog) {
  return (catalog.families || []).flatMap((family) => family.mails || []);
}

const seen = new Set();
for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  const catalog = JSON.parse(fs.readFileSync(abs, 'utf8'));
  for (const mail of allMails(catalog)) {
    const spec = CHOICES[mail.id];
    if (!spec) continue;
    if (!Array.isArray(mail.choices) || mail.choices.length !== 3) {
      throw new Error(`${mail.id}: expected exactly 3 choices`);
    }
    spec.forEach(([label, reply], index) => {
      mail.choices[index].label = label;
      mail.choices[index].reply = reply;
    });
    seen.add(mail.id);
  }
  fs.writeFileSync(abs, `${JSON.stringify(catalog, null, 2)}\n`);
}

const expected = Object.keys(CHOICES);
const missing = expected.filter((id) => !seen.has(id));
if (missing.length) throw new Error(`Missing Sport practice mails: ${missing.join(', ')}`);
if (seen.size !== 20) throw new Error(`Expected 20 patched Sport practice mails, got ${seen.size}`);

const signatures = new Map();
for (const rel of FILES) {
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  for (const mail of allMails(catalog)) {
    if (!CHOICES[mail.id]) continue;
    const signature = mail.choices.map((choice) => choice.label.trim().toLowerCase()).sort().join(' || ');
    if (signatures.has(signature)) throw new Error(`Duplicate patched signature: ${signatures.get(signature)} <-> ${mail.id}`);
    signatures.set(signature, mail.id);
  }
}

console.log(`Sport-utøver choice uniqueness fixer: PASS (${seen.size} mails, ${signatures.size} unique signatures)`);
