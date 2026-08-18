#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'data/Civication/mailFamilies/sport/job/sport_utover_job.json',
  'data/Civication/mailFamilies/sport/people/sport_utover_people.json'
];

const choices = {
  sport_utover_week1_job_1: [
    ['Følg Majas tekniske øktplan og logg kvaliteten uten å skru opp intensiteten.', 'Jeg følger den tekniske planen og bruker kvaliteten i repetisjonene som dagens mål.'],
    ['Skru opp intensiteten for å bevise at du er klar for mer enn planen sier.', 'Jeg øker intensiteten for å vise nivået mitt, selv om økta egentlig ber om noe annet.'],
    ['Be Maja om én avgrenset testrepetisjon innenfor planen og gå deretter tilbake til øktmålet.', 'Jeg ber om én kontrollert test og holder resten av økta innenfor den avtalte belastningen.']
  ],
  sport_utover_week1_job_2: [
    ['Rapporter småplagen til Elias før den harde delen av økta og la vurderingen styre belastningen.', 'Jeg sier fra før intensiteten øker, slik at Elias kan vurdere belastningen med riktige opplysninger.'],
    ['Skjul plagen og gjennomfør full belastning for å unngå å framstå som usikker.', 'Jeg sier ingenting og prøver å gjennomføre hele økta som planlagt.'],
    ['Avtal redusert belastning og et konkret nytt sjekkpunkt etter oppvarmingen.', 'Jeg går inn i økta med lavere belastning og avtaler med Elias når vi vurderer situasjonen på nytt.']
  ],
  sport_utover_week1_job_3: [
    ['Eie den smale rollen fullt og spør Maja hvilke konkrete kriterier som kan gi større ansvar senere.', 'Jeg gjør den tildelte rollen ordentlig og ber om tydelige kriterier for neste steg.'],
    ['Bruke økta til å demonstrere at rollefordelingen er feil, selv om det bryter med oppgaven du fikk.', 'Jeg prøver å vise at jeg burde hatt en større rolle, også når det trekker meg bort fra lagoppgaven.'],
    ['Aksepter rollen i dag, men avtal en egen samtale om ansvar og utvikling etter økta.', 'Jeg følger rollen nå og ber om en separat vurdering av veien mot mer ansvar.']
  ],
  sport_utover_week1_job_4: [
    ['Skill resultatet fra utførelsen og gå gjennom de konkrete prestasjonsvalgene før du dømmer hele konkurransen.', 'Jeg analyserer hva jeg faktisk gjorde, ikke bare sluttresultatet.'],
    ['La det svake resultatet bli beviset på at hele prestasjonen og formen din har sviktet.', 'Jeg behandler resultatet som tegn på at alt må endres med en gang.'],
    ['Velg to kontrollerbare prestasjonsvalg som skal justeres før du trekker en større konklusjon.', 'Jeg plukker ut to konkrete ting jeg kan teste neste gang før jeg vurderer resten.']
  ],
  sport_utover_week1_job_5: [
    ['Juster neste økt for tapt søvn og måltidsrytme i stedet for å late som reisen ikke kostet noe.', 'Jeg legger den faktiske reisen inn i belastningsvurderingen og justerer neste økt.'],
    ['Behold opprinnelig belastning for å vise at profesjonelle utøvere ikke lar reise påvirke planen.', 'Jeg følger planen uendret og prøver å presse meg gjennom reisebelastningen.'],
    ['Reduser én belastningsblokk og vurder resten av økta på nytt etter konkrete restitusjonssignaler.', 'Jeg kutter én del av belastningen og bruker responsen til å avgjøre resten.']
  ],
  sport_utover_week2_job_1: [
    ['Be sportslig leder om uttakskriteriene samtidig som du holder kontrakten og uttaket tydelig adskilt.', 'Jeg ber om konkrete sportslige kriterier uten å behandle arbeidskontrakten som krav på plass.'],
    ['Bruk kontrakten som argument for at du har krav på sportslig uttak.', 'Jeg viser til kontrakten som om den også burde sikre meg plass i troppen.'],
    ['Ta kontraktsspørsmålet med ledelsen og uttaksvurderingen med trenerlinjen som to separate samtaler.', 'Jeg skiller arbeidsforholdet fra den sportslige vurderingen og tar dem i riktig kanal.']
  ],
  sport_utover_week2_job_2: [
    ['Si tydelig at tidlig rapportering av smerte beskytter laget, og ikke la garderobehumoren gjøre taushet til norm.', 'Jeg støtter den som sier fra og markerer at kroppen må kunne rapporteres uten sosial straff.'],
    ['Le med og oppretthold normen om at tilgjengelighet teller mer enn å si fra tidlig.', 'Jeg lar humoren stå uimotsagt og bidrar til at det fortsatt er dyrt å vise usikkerhet.'],
    ['Ta Samir til side og avtal en lavterskel måte laget kan melde belastning på uten å gjøre alt offentlig.', 'Jeg ber Samir hjelpe med en praktisk kanal der spillere kan si fra før problemet vokser.']
  ],
  sport_utover_week2_job_3: [
    ['Sjekk avtalen med Henrik og flytt eller avslå sponsoraktiviteten hvis den kolliderer med lagforpliktelsen.', 'Jeg avklarer hva avtalen faktisk tillater før jeg lover sponsor noe.'],
    ['Aksepter sponsoraktiviteten først og forvent at laget tilpasser seg den nye muligheten.', 'Jeg tar den kommersielle gevinsten nå og lar lagplanen bli problemet som må løses etterpå.'],
    ['Forhandle fram en mindre sponsoraktivitet utenfor lagets kritiske tidsrom og få begge parter til å bekrefte rammen.', 'Jeg prøver en avgrenset løsning som er eksplisitt godkjent av både avtale- og laglinjen.']
  ],
  sport_utover_week2_job_4: [
    ['Følg belastningsdataene og foreslå begrensede minutter eller å stå over før kampen gjør valget for deg.', 'Jeg bruker den reduserte kroppsmarginen som grunnlag for en mindre rolle eller å stå over.'],
    ['Spill full belastning selv om kroppen og dataene viser mindre margin enn vanlig.', 'Jeg tar full rolle fordi laget trenger meg nå, selv om risikoen er tydeligere.'],
    ['Avtal med Elias på forhånd hvilke tegn under oppvarmingen som betyr at du stopper eller går ned i rolle.', 'Jeg går inn i oppvarmingen med konkrete stoppkriterier i stedet for å improvisere under press.']
  ],
  sport_utover_week2_job_5: [
    ['Definer suksess som konkrete oppgaver i konkurransen og beskytt søvn og restitusjon uansett resultat.', 'Jeg går inn i konkurransen med oppgavekriterier som ikke gjør resultatet til dom over hele meg.'],
    ['La resultatet avgjøre egen verdi og planlegg ekstra arbeid dersom du ikke leverer som håpet.', 'Jeg gjør resultatet til mål på om jeg er god nok og svarer med mer kontroll hvis det går dårlig.'],
    ['Sett ett tydelig prestasjonsmål og en fast grense for når og hvordan resultatet skal evalueres etterpå.', 'Jeg avgrenser både målet før konkurransen og analysen etterpå, så vurderingen ikke tar hele døgnet.']
  ],
  sport_utover_week1_private_1: [
    ['Legg bort måltidsanalysen under middagen og gå tilbake til restitusjonsplanen etter at du og Jonas faktisk har vært sammen.', 'Jeg lar middagen være et måltid og en samtale først, og tar treningsplanen etterpå.'],
    ['Gjør middagen til en ny korrigeringsøkt der porsjoner, timing og restitusjon får styre samtalen.', 'Jeg fortsetter å optimalisere måltidet selv om Jonas prøver å snakke om noe annet.'],
    ['Fortell Jonas om én reell ernæringsgrense, og la resten av middagen være fri for prestasjonsanalyse.', 'Jeg forklarer det ene hensynet jeg faktisk må ta og legger deretter bort analysemodus.']
  ],
  sport_utover_week1_private_2: [
    ['Svar søsteren din med hvordan kroppen faktisk kjennes før du nevner tallene du følger.', 'Jeg beskriver først hvordan jeg har det i kroppen, og bruker tallene som støtte i stedet for som hele svaret.'],
    ['Forsvar konstant måling som den eneste seriøse måten å forholde seg til kropp og prestasjon på.', 'Jeg holder fast ved at tallene er det viktigste, også når hun spør hvordan jeg faktisk har det.'],
    ['Forklar én måling i kontekst og sett deretter ord på hva den ikke kan fortelle om kroppen din.', 'Jeg viser hva ett mål betyr, men sier også tydelig hva det ikke sier om opplevelsen min.']
  ],
  sport_utover_week1_private_3: [
    ['La skuffelsen etter benken roe seg uten å endre morgendagens treningsplan for å bevise noe.', 'Jeg lar kvelden være skuffende uten å gjøre neste økt til en hevnaksjon.'],
    ['Legg inn ekstra arbeid for å bevise allerede i morgen at benkingen var feil.', 'Jeg svarer på statusfallet med mer trening enn planen ba om.'],
    ['Skriv ned ett konkret spørsmål til Maja om rollen, og la resten av kvelden være fri for uttaksstrategi.', 'Jeg tar vare på spørsmålet jeg trenger å stille og utsetter resten til riktig samtale.']
  ],
  sport_utover_week1_private_4: [
    ['Si nei til den sene spontane planen uten å avvise Jonas, og foreslå et konkret tidspunkt dere faktisk kan møtes.', 'Jeg beskytter søvnen og gjør samtidig vennskapet konkret ved å foreslå et nytt tidspunkt.'],
    ['Avlys sosial kontakt fordi alt som ikke hjelper restitusjonen direkte blir behandlet som forstyrrelse.', 'Jeg gjør prestasjonsplanen så dominerende at vennskapet bare får plass når det er optimalt.'],
    ['Bli med en kort stund og avtal på forhånd når du går, slik at både vennskap og søvn får en reell ramme.', 'Jeg velger en kort, tydelig avgrenset løsning i stedet for enten alt eller ingenting.']
  ],
  sport_utover_week1_private_5: [
    ['Logg av statistikk, klipp og kommentarer i et fast restitusjonsvindu etter konkurransen.', 'Jeg bestemmer et tidsrom der resultatdata ikke får følge meg videre inn i helgen.'],
    ['Fortsett å sjekke tall og klipp til du finner en forklaring som gir følelsen av kontroll tilbake.', 'Jeg holder meg i analysen fordi det føles tryggere enn å la resultatet ligge.'],
    ['Gå gjennom den planlagte evalueringen én gang og legg deretter telefonen bort resten av kvelden.', 'Jeg gjør den avtalte analysen og stopper når den er ferdig, i stedet for å fortsette på impuls.']
  ],
  sport_utover_week2_private_1: [
    ['Korriger familien vennlig: kontrakten betyr profesjonell jobb, ikke automatisk uttak, landslag eller stjernestatus.', 'Jeg lar dem feire kontrakten, men rydder opp i hva den faktisk innebærer.'],
    ['La familiens feiring blåse opp kontrakten til en status du ennå ikke har fått.', 'Jeg lar dem tro at kontrakten også betyr sportslig rang og framtidig stjernestatus.'],
    ['Nyt milepælen sammen med dem, og forklar etterpå hvilke deler av framtiden kontrakten ikke kan love.', 'Jeg tar imot stoltheten uten å gjøre den til en uriktig påstand om uttak eller status.']
  ],
  sport_utover_week2_private_2: [
    ['Flytt oppmerksomheten fra Noras kropp til din egen funksjon og de treningsmålene som faktisk er dine.', 'Jeg går tilbake til hva kroppen min skal kunne gjøre, ikke hvordan den rangeres visuelt mot Nora.'],
    ['Bruk sammenligningen med Nora som grunn til å stramme inn kontrollen over egen kropp.', 'Jeg lar bildet bli en rangering og svarer med mer kontroll over mat, kropp og trening.'],
    ['Sett ord på at sammenligningen traff deg, og velg ett funksjonelt mål du kan følge i stedet.', 'Jeg erkjenner sammenligningen og bytter den ut med ett konkret mål knyttet til funksjon.']
  ],
  sport_utover_week2_private_3: [
    ['Behandle hviledagen som en planlagt del av jobben og la kroppen få full restitusjon.', 'Jeg følger hvileplanen like disiplinert som en treningsplan.'],
    ['Legg inn en skjult ekstraøkt for å kjenne at du fortsatt er seriøs når kalenderen sier fri.', 'Jeg trener likevel fordi hvile føles for mye som å gjøre ingenting.'],
    ['Gjør bare lett restitusjonsaktivitet dersom den allerede er avklart, og hold den fri for prestasjonsmål.', 'Jeg velger aktivitet kun som restitusjon, ikke som en forkledd ekstraøkt.']
  ],
  sport_utover_week2_private_4: [
    ['Lukk kommentarfeltet og beskytt søvnen før neste arbeidsdag begynner.', 'Jeg stopper lesingen nå, fordi morgendagens prestasjon ikke blir bedre av at natta brukes på omdømme.'],
    ['Les videre og formuler svar i hodet til kritikken føles mindre truende.', 'Jeg blir i kommentarfeltet og lar offentlig vurdering følge meg helt til sengs.'],
    ['Lagre én konkret kritikk til den planlagte evalueringen og demp resten av strømmen.', 'Jeg tar vare på det ene punktet som kan være nyttig og stenger resten ute til riktig tidspunkt.']
  ],
  sport_utover_week2_private_5: [
    ['Sett av en tydelig del av helgen til mennesker og aktiviteter som ikke har noen prestasjonsfunksjon.', 'Jeg lager et privat rom der jeg ikke trenger å være utøver eller restitusjonsprosjekt.'],
    ['Optimaliser hele helgen rundt trening, mat, søvn og neste resultat slik at idretten får eie all tid.', 'Jeg lar prestasjonsplanen bestemme også den tiden som egentlig skulle vært min egen.'],
    ['Behold én viktig restitusjonsblokk og én avtale som er helt utenfor idretten, og verne begge.', 'Jeg gir både kroppen og privatlivet en konkret plass i helgen uten å gjøre dem til motsetninger.']
  ]
};

let patched = 0;
const signaturesByType = new Map();
for (const rel of files) {
  const full = path.join(ROOT, rel);
  const catalog = JSON.parse(fs.readFileSync(full, 'utf8'));
  for (const family of catalog.families || []) {
    for (const mail of family.mails || []) {
      const spec = choices[mail.id];
      if (!spec) continue;
      if (!Array.isArray(mail.choices) || mail.choices.length !== 3) throw new Error(`${mail.id}: expected exactly 3 choices`);
      mail.choices.forEach((choice, index) => {
        choice.label = spec[index][0];
        choice.reply = spec[index][1];
      });
      const signature = mail.choices.map((choice) => choice.label.trim().toLowerCase()).sort().join(' || ');
      const key = mail.mail_type;
      const seen = signaturesByType.get(key) || new Set();
      if (seen.has(signature)) throw new Error(`${mail.id}: duplicate repaired choice signature in ${key}`);
      seen.add(signature);
      signaturesByType.set(key, seen);
      patched += 1;
    }
  }
  fs.writeFileSync(full, `${JSON.stringify(catalog, null, 2)}\n`);
}

if (patched !== Object.keys(choices).length || patched !== 20) {
  throw new Error(`Expected to patch 20 Sport-utøver practice mails, patched ${patched}`);
}
if ((signaturesByType.get('job')?.size || 0) !== 10 || (signaturesByType.get('people')?.size || 0) !== 10) {
  throw new Error('Expected 10 unique job and 10 unique people practice-mail signatures');
}
console.log('Sport-utøver practice choice uniqueness repair: PASS (20/20 mails, 20 unique signatures)');
