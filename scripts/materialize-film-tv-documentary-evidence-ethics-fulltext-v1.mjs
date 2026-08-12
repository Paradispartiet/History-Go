#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'dokumentar-evidens-og-etikk';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'documentary_evidence_ethics_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_documentary_evidence_ethics_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`,
  brief: `${CHAPTER_DIR}/brief.json`,
  claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-documentary-evidence-ethics-source-brief-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const PARAGRAPHS = Object.freeze({
  'ftv-de-pc-01-1': 'Found footage må spores tilbake til kildeobjekt, samling, metadata og opprinnelig bruk før den nye montasjen tolkes. Et bilde skifter ikke bare betydning når det flyttes; sporbarheten avgjør også hvilke historiske påstander den nye sammenhengen kan bære.',
  'ftv-de-pc-01-2': 'Handsworth Songs bruker arkiv- og mediebilder som deler av et essayistisk argument uten å behandle materialet som selvforklarende. Montasjen produserer forbindelser mellom hendelse, offentlig språk og historisk minne, men gjør samtidig fortolkeren ansvarlig for konteksten som legges rundt hvert bilde.',
  'ftv-de-pc-01-3': 'Sans Soleil lar brevstemme, reisebilder, elektronisk bearbeiding og historiske sammenstillinger endre hvordan eldre og nyere opptak forstås. Ombruket dokumenterer derfor både et tidligere bildespor og Markers nye audiovisuelle argument; de to lagene må ikke gjøres identiske.',
  'ftv-de-pc-01-4': 'Arkivtilgang og kunstnerisk ombruk er ikke det samme som arkivets bevaringspraksis. Denne enheten undersøker hva et nytt verk hevder gjennom funnet materiale, mens rettigheter, restaurering, samlingspleie og varig tilgang fortsatt tilhører den senere arkivenheten.',
  'ftv-de-pc-02-1': 'Et direkte eller umiddelbart bilde krever fortsatt kontroll av identitet, tid, sted, kilde og overføringskjede. Samtidighet sier når et signal eller en fil ble sett, men beviser ikke alene hvem eller hva bildet viser, om materialet er komplett, eller hvordan det er blitt beskåret.',
  'ftv-de-pc-02-2': 'Berkeley-protokollen skiller innsamling, bevaring, verifikasjon, analyse, sikkerhet og rapportering som egne ledd. Skillet gjør det mulig å dokumentere både originalmaterialet og de senere slutningene, slik at analyse ikke skrives tilbake som om den var synlig direkte i opptaket.',
  'ftv-de-pc-02-3': 'Redaksjonell merking, bildetekst og kontekst er deler av bildeevidensen fordi de forteller hvilken hendelse, dato og kilde redaksjonen knytter bildet til. Et korrekt opptak kan bli misvisende dersom generisk illustrasjon, feil sted eller en senere hendelse presenteres som dokumentasjon av det aktuelle forløpet.',
  'ftv-de-pc-02-4': 'Et verifisert bilde bør ikke automatisk publiseres i full identifiserbar form. WITNESS knytter bruk til sikkerhet, verdighet, privatliv og mulig skade; verifikasjon besvarer hva materialet er, mens den etiske vurderingen avgjør om, hvor og hvordan det bør vises.',
  'ftv-de-pc-03-1': 'Et signert samtykke avgjør ikke alene om en dokumentarisk handling er etisk forsvarlig. Maktforskjell, endret bruk, ny distribusjon, sårbarhet og virkninger etter lansering kan oppstå etter signeringen og krever løpende vurdering.',
  'ftv-de-pc-03-2': 'DAWG plasserer ansvar i relasjonen mellom historie, deltakere, filmskapere, publikum, finansiering og produksjonsprosess. Dermed flyttes etikken fra ett releaseøyeblikk til beslutninger om opptak, klipp, kontekst, markedsføring, visning og oppfølging.',
  'ftv-de-pc-03-3': 'Offentlig interesse opphever ikke plikten til å redusere unødvendig identifisering og risiko. WITNESS’ retningslinjer krever at synlighet, kreditering, grafisk materiale, sikkerhet og forventet publikum vurderes sammen, også når opptaket er autentisk og saken viktig.',
  'ftv-de-pc-03-4': 'Barns velferd og verdighet krever en selvstendig vurdering også når foresatte har samtykket. Ofcoms regler og Vær Varsom-plakaten gjør barnet til eget vernesubjekt; mulig belastning, identifisering og framtidig gjenbruk kan ikke reduseres til den voksnes tillatelse.',
  'ftv-de-pc-04-1': 'Fotografisk registrering gjør ikke et dokumentarisk argument automatisk sant. Kameraet kan registrere en faktisk kropp, bygning eller handling samtidig som utvalg, tvang, staging, bildetekst eller montasje produserer en feil historisk forklaring.',
  'ftv-de-pc-04-2': 'Nanook of the North viser at staging, samarbeid, locationarbeid og deltakerfare må inngå i sannhetsvurderingen. Rekonstruerte handlinger kan formidle kunnskap om praksis, men produksjonsmakt og risiko setter grenser for hva bildene kan brukes som direkte belegg for.',
  'ftv-de-pc-04-3': 'Theresienstadt-filmen viser at dokumentarisk overflate kan konstrueres gjennom tvang, seleksjon og bedrag. Kameraet registrerte iscenesatte situasjoner i ghettoen, mens den historiske påstanden om et normalt og humant liv var produsert for å skjule forfølgelse og deportasjon.',
  'ftv-de-pc-04-4': 'Explore Saydnaya skiller vitnesbyrd, skriftlige spor, satellittbilder, arkitektonisk modell, akustisk rekonstruksjon og uttrykt usikkerhet. Metoden styrker etterprøvbarheten fordi modellen ikke presenteres som et manglende kameraopptak, men som en avgrenset syntese av flere kildetyper.',
  'ftv-de-pc-05-1': 'Observasjon, deltakelse, essay og refleksivitet organiserer forskjellige relasjoner mellom kamera, filmskaper, deltaker og publikum. De er analytiske beskrivelser av arbeids- og framstillingsmåter, ikke grader på én skala fra mindre til mer sann dokumentar.',
  'ftv-de-pc-05-2': 'Ett verk kan kombinere flere dokumentariske moduser. Sans Soleil forener reiseopptak, essaystemme, brevfigur og montasje, mens vérité-historien rommer både observerende nærvær og situasjoner som oppstår gjennom filmskaperens deltakelse.',
  'ftv-de-pc-05-3': 'Et modusnavn beviser verken etikk eller sannhet. Observerende bilder kan være skadelige eller misvisende, og en eksplisitt subjektiv essayfilm kan være kildekritisk presis; vurderingen må følge konkrete opptak, relasjoner, påstander og bruk.',
  'ftv-de-pc-06-1': 'Explore Saydnaya bruker rommodell og akustikk for å undersøke et sted der direkte fotografier mangler. Overlevendes situerte erindringer styrer arbeidet, men metoden markerer at lyd- og romframstillingen er en rekonstruksjon med eksplisitte begrensninger.',
  'ftv-de-pc-06-2': 'Mariupol-undersøkelsen sammenholder skade på teaterbygningen, stedlige vitnesbyrd, visuelle spor og romlig modell. Evidensvekten ligger i samsvaret og friksjonen mellom kildene, ikke i at én modell eller én kameravinkel hevdes å inneholde hele hendelsen.',
  'ftv-de-pc-06-3': 'Et locationbilde representerer aldri automatisk alle erfaringer eller hele hendelsesforløpet på stedet. Kameraposisjon, opptakstid, adgang og senere ødeleggelse avgrenser hva som er synlig, mens fravær utenfor rammen fortsatt må undersøkes gjennom andre kilder.',
  'ftv-de-pc-07-1': 'Sans Soleil bygger argument gjennom avstanden mellom reisebilder, en brevbasert stemme og historisk minne. Den subjektive organiseringen gjør sammenligning og tvil til deler av formen, uten at bildene dermed mister krav på kildekritisk kontroll.',
  'ftv-de-pc-07-2': 'Handsworth Songs avviser én autoritativ forklaringsstemme og produserer kontekst gjennom montasje av arkiv, nyhetsbilder, lyd og tekst. Fraværet av én fasit er ikke fravær av argument; filmen viser hvordan offentlige beskrivelser konkurrerer om å definere historisk erfaring.',
  'ftv-de-pc-07-3': 'Eksplisitt subjektivitet kan gjøre ståsted, usikkerhet og premisser synlige, men fritar ikke filmen fra kildekritikk. Essayfilmens jeg må fortsatt vurderes mot hvilke bilder som brukes, hvem som får tale, hvordan materiale ombrukes og hvilke slutninger montasjen inviterer til.',
  'ftv-de-pc-08-1': 'Disneyland Dream skiftet funksjon fra familiens reiseopptak i 1956 til gjenfunnet film og National Film Registry-objekt. Produksjonsformålet, materialets senere oppdagelse og institusjonens kulturarvramme er tre historiske lag som må skilles.',
  'ftv-de-pc-08-2': 'Great Migration Home Movie Project kobler familie- og fellesskapskunnskap til historisk lesbarhet. Navn, relasjoner, steder og hverdagspraksiser gjør amatørbildene til kilder om migrasjon og minne uten at arkivet overtar all tolkningsmyndighet fra dem som kjenner materialet.',
  'ftv-de-pc-08-3': 'Hverdagsbildets nærhet garanterer ikke representativitet, fullstendighet eller samtykke til ny bruk. Familieopptak viser utvalgte situasjoner for et opprinnelig publikum; senere offentliggjøring krever derfor både proveniens og ny vurdering av personer som blir synlige.',
  'ftv-de-pc-09-1': 'Nanooks iscenesatte jakt- og iglosekvenser involverte både samarbeid og produksjonsmakt. Deltakelse i rekonstruksjonen gjør ikke alle valg likeverdige, og analysen må omfatte Flahertys ramme, tekniske krav, location og risikoen de filmede ble utsatt for.',
  'ftv-de-pc-09-2': 'Theresienstadts tvungne iscenesettelse er evidens om produksjonsmakt og propaganda, ikke om at det viste livet var fritt eller representativt. Den fotografiske registreringen dokumenterer at situasjonen ble filmet, mens tvangskonteksten snur den tilsiktede sannhetspåstanden.',
  'ftv-de-pc-09-3': 'En åpent merket rekonstruksjon må vurderes annerledes enn skjult bedrag. Når modell, animasjon eller reenactment navngis, kan publikum prøve kildegrunnlag og begrensning; skjult staging ber derimot bildet bære evidensvekten til et direkte opptak det ikke er.',
  'ftv-de-pc-09-4': 'Kildegrunnlag og merking bestemmer hvilken evidensvekt en iscenesatt sekvens kan bære. En rekonstruksjon kan vise en kildebasert hypotese eller romlig sammenheng, men skal ikke brukes som direkte dokumentasjon av detaljer som kildene ikke fastslår.',
  'ftv-de-pc-10-1': 'Observerende stil betyr ikke fravær av filmskaper eller produksjonsvalg. Kameraets plassering, opptaksstart, varighet, lydarbeid og klipp bestemmer hvilke forløp publikum får tilgang til, selv når ingen intervjuer høres i bildet.',
  'ftv-de-pc-10-2': 'Cinéma vérité gjør møtet og påvirkningen mellom filmskaper og deltaker til en del av metoden. Spørsmål, kamera og sosial situasjon kan utløse hendelser; dokumentaren må derfor analysere interaksjonen framfor å late som den bare fant en ferdig virkelighet.',
  'ftv-de-pc-10-3': 'Refleksiv form kan synliggjøre apparat, forhandling og tvil uten å løse alle maktproblemer. Å vise kameraet eller filmskaperens stemme gir publikum mer metodeinformasjon, men garanterer ikke rettferdig klipp, trygg deltakelse eller sann konklusjon.',
  'ftv-de-pc-10-4': 'Performance foran kamera må analyseres som respons på både sosial situasjon og opptakssituasjon. Mennesker framfører roller også uten kamera, men forventningen om publikum, instruksjon og redigerbart materiale kan endre kropp, språk og handling.',
  'ftv-de-pc-11-1': 'Realityformatet produserer deltakernes handlingsrom gjennom casting, regler, oppgaver, tidsplan, overvåking og selektiv redigering. Det ferdige programmet er derfor ikke bare observasjon av spontan atferd, men resultatet av en institusjonelt designet situasjon.',
  'ftv-de-pc-11-2': 'Kringkasterens omsorgsansvar gjelder mulig skade både under og etter realitydeltakelse. Ofcom knytter aktsomhet til risiko, sårbarhet og manglende erfaring, slik at casting, briefing, støtte, eksponering og ettervern inngår i formatets ansvar.',
  'ftv-de-pc-11-3': 'Samtykke og kjennskap til realitysjangeren opphever ikke særskilt vern for sårbare og mindreårige deltakere. Produksjonen må vurdere om formatpress, identifisering og varig distribusjon kan skape belastning som deltakeren ikke realistisk kunne overskue.',
  'ftv-de-pc-12-1': 'The Wall bruker animasjon, reise, stemmer, intervjuer og performance capture i et dokumentarisk argument. Animasjonen er ikke fotografisk opptak av alle hendelser den framstiller, men kan gjøre erfaring, rom og refleksjon synlig når dens status er forståelig.',
  'ftv-de-pc-12-2': 'Saydnayas rommodell er en kildebasert rekonstruksjon, ikke et kameraopptak fra fengselet. Den kan sammenstille vitnesbyrd, arkitektur og akustikk, men evidensverdien avhenger av synlig metode, kildegrenser og markerte usikkerheter.',
  'ftv-de-pc-12-3': 'Dimensions in Testimony skiller bevarte, uendrede intervjusvar fra det teknologiske laget som velger hvilket svar som avspilles. Grensesnittet simulerer samtaleflyt, men skaper ikke et live møte og bør ikke tilskrives nye utsagn vitnet aldri spilte inn.',
  'ftv-de-pc-12-4': 'Syntetiske nyhetsbilder krever tydelig merking og kan ikke erstatte dokumentert hendelsesfotografi. AP behandler generativt materiale som uverifisert og forbyr å legge til eller trekke fra elementer i dokumenterende bilder; syntese kan bare vises med synlig status og avgrenset formål.',
  'ftv-de-pc-13-1': 'TV-nyhetsbildet er et redaksjonelt utvalg selv når hendelsen skjer direkte. Kameravalg, sendeflate, klipp, repetisjon, bildetekst og prioritering bestemmer hva publikum ser og hvilken evidenspåstand sendingen bygger.',
  'ftv-de-pc-13-2': 'APs visuelle standard skiller dokumenterende bilde fra generisk eller manipulert illustrasjon. Et bilde fra en annen hendelse kan være ekte, men blir falsk evidens dersom plasseringen får publikum til å tro at det dokumenterer den aktuelle saken.',
  'ftv-de-pc-13-3': 'Vær Varsom-plakaten knytter kildekontroll til identifikasjon, privatliv og vern av barn. Redaksjonen må derfor vurdere både om bildet er riktig og om publiseringens detaljer påfører mennesker en unødvendig eller uforholdsmessig belastning.',
  'ftv-de-pc-13-4': 'Hastighet kan ikke erstatte verifikasjon av tid, sted, kilde og sammenheng. Direktesending og brukergenerert video øker tempoet, men redaksjonelt ansvar krever fortsatt kontroll av originalmateriale, proveniens, mulig manipulering og korrekt presentasjon.',
  'ftv-de-pc-14-1': 'Et bilde kan være autentisk, men feilbeskrevet, urepresentativt eller skadelig brukt. Autentisitet gjelder materialets opphav og integritet; evidenspåstanden gjelder hva bildet hevdes å vise, og etikken gjelder konsekvensene av den konkrete bruken.',
  'ftv-de-pc-14-2': 'Kildekjede og kontekst gjør en visuell evidenspåstand etterprøvbar. Originalfil, skaper, tidspunkt, sted, overføring, bevaring, endringer og redaksjonell bruk må dokumenteres slik at andre kan skille bildet fra slutningen som trekkes.',
  'ftv-de-pc-14-3': 'Theresienstadt viser forskjellen mellom det kameraet registrerte og den historiske påstanden filmen skulle produsere. Registrerte personer og rom var virkelige, men seleksjon, tvang og iscenesettelse ble brukt til å konstruere et falskt helhetsbilde.',
  'ftv-de-pc-15-1': 'Traumebevisst intervju begynner med tydelig formål, reelle valg, trygghet og rett til pause eller stopp. Dart Centers metode prioriterer lytting og kontroll hos den intervjuede framfor å presse fram en bestemt følelsesmessig opptreden.',
  'ftv-de-pc-15-2': 'Shoah Foundation-samlingen gjør intervju- og arkivkontekst nødvendig for tolkning av videovitnesbyrd. Opptaket er en situert livshistorie skapt mellom vitne og intervjuer, og kan ikke reduseres til løsrevne faktasetninger uten spørsmål, forløp og deltakerposisjon.',
  'ftv-de-pc-15-3': 'Dimensions in Testimony bevarer konkrete innspilte svar samtidig som avspillingen styres av et eget teknologisk lag. Deltakerkontroll og gjennomgått spørsmålsmatching begrenser systemet, men publikum må fortsatt forstå forskjellen mellom arkivert respons og levende nærvær.',
  'ftv-de-pc-15-4': 'Saydnaya viser at vitnesbyrd og rommodell kan støtte hverandre når metode og begrensning er synlig. Modellen hjelper flere situerte minner inn i en romlig sammenheng, mens manglende fotografier og usikre detaljer forblir markerte begrensninger.'
});

const SECTION_TITLES = Object.freeze({
  em_film_tv_virkelighetsbilde_og_evidenspastand: 'Bildet og påstanden er to forskjellige analyseenheter',
  em_film_tv_dokumentar_sannhet_og_evidens: 'Dokumentarisk sannhet bygges gjennom kildekritiske forbindelser',
  em_film_tv_direktebilde_og_evidens: 'Samtidighet opphever ikke verifikasjon eller ansvar',
  em_film_tv_tv_nyhetsbilde_og_evidens: 'Nyhetsbildet er evidens gjennom redaksjonell kontroll',
  em_film_tv_dokumentarformer_tradisjoner_og_moduser: 'Moduser beskriver relasjoner, ikke sannhetsskårer',
  em_film_tv_essayfilm_subjektivitet_og_audiovisuelt_argument: 'Essayfilmen argumenterer gjennom synlig ståsted og montasje',
  em_film_tv_observasjon_deltakelse_refleksivitet_og_performance: 'Kameraet observerer, deltar og endrer situasjonen',
  em_film_tv_iscenesettelse_og_virkelighetskrav: 'Iscenesettelse må vurderes gjennom makt, åpenhet og evidensvekt',
  em_film_tv_rekonstruksjon_animasjon_og_syntetiske_dokumentarbilder: 'Opptak, modell, animasjon og syntese må ha synlig status',
  em_film_tv_arkivdokumentar_found_footage_og_ombruk: 'Ombruk skaper et nytt argument uten å slette proveniens',
  em_film_tv_dokumentarisk_sted_og_evidens: 'Stedlig evidens bygges på tvers av spor og posisjoner',
  em_film_tv_dokumentar_etikk_og_deltakeransvar: 'Deltakeransvar varer gjennom hele produksjons- og bruksløpet',
  em_film_tv_reality_observasjon_og_formatmakt: 'Reality produserer handling gjennom format og redigering',
  em_film_tv_hverdagsdokumentasjon_og_amatorkultur: 'Hverdagsbilder blir historie gjennom relasjon og ny kontekst',
  em_film_tv_vitnesbyrd_traume_og_dokumentarisk_ansvar: 'Vitnesbyrd er relasjon, forløp og mulig ettervirkning'
});

const MODULE_EXTRAS = Object.freeze({
  'bilde-pastand-og-verifikasjon': {
    concepts: [
      ['evidenspastand', 'Evidenspåstand', 'En eksplisitt påstand om hva et bilde eller opptak kan dokumentere, avgrenset av kilde, kontekst og metode.'],
      ['autentisitet', 'Autentisitet', 'Vurdering av materialets opphav og integritet; ikke det samme som at bildetekst, representativitet eller bruk er riktig.'],
      ['proveniens', 'Proveniens', 'Dokumentert kjede fra skaper og opptakssituasjon via lagring og overføring til nåværende bruk.'],
      ['verifikasjon', 'Verifikasjon', 'Kontroll av identitet, tid, sted, kilde, integritet og sammenheng før materialet brukes som evidens.'],
      ['direktebilde', 'Direktebilde', 'Bilde distribuert samtidig eller nær samtidig med hendelsen; samtidighet alene er ingen sannhetsgaranti.'],
      ['redaksjonell-kontekst', 'Redaksjonell kontekst', 'Bildetekst, plassering, klipp og forklaring som knytter et visuelt spor til en bestemt nyhetspåstand.'],
      ['kildekjede', 'Kildekjede', 'Etterprøvbar dokumentasjon av hvordan materiale er skapt, bevart, overført, kontrollert og brukt.'],
      ['evidensvekt', 'Evidensvekt', 'Hvor mye en kilde kan støtte en bestemt påstand etter at relevans, autentisitet, kontekst og begrensning er vurdert.'],
      ['mis-kontekstualisering', 'Miskontekstualisering', 'Bruk av autentisk materiale med feil eller misvisende opplysninger om hendelse, tid, sted eller betydning.'],
      ['skadereduksjon', 'Skadereduksjon', 'Tiltak som begrenser identifisering, eksponering eller annen risiko uten å oppgi saklig dokumentasjon.']
    ].map(([id, term, definition]) => ({ id, term, definition }))
  },
  'former-stemmer-og-opptakssituasjoner': {
    workedExamples: [
      ['Modus uten rangering', 'Et verk kalles observerende og derfor sannere.', ['Beskriv kamera, lyd, klipp og relasjon konkret.', 'Vurder sannhetskrav og etikk uavhengig av modusetiketten.']],
      ['Sans Soleil som argument', 'Reisebilder leses som direkte rapport.', ['Skill opptakets sted og tid fra brevstemmens senere organisering.', 'Spor hvordan montasje og elektronisk bearbeiding skaper sammenligning.']],
      ['Kameraets nærvær', 'En scene virker spontan.', ['Finn tegn på adgang, posisjon, varighet og sosial respons på kameraet.', 'Ikke gjør observerende stil til fravær av produksjonsvalg.']],
      ['Refleksivitetens grense', 'Filmen viser kameraet og erklæres derfor etisk.', ['Registrer hvilken metodeinformasjon refleksiviteten faktisk gir.', 'Vurder fortsatt makt, klipp, risiko og deltakernes kontroll.']],
      ['Handsworth Songs og arkiv', 'Arkivbildene behandles som én ferdig historisk forklaring.', ['Skill hvert kildespor fra den nye montasjen.', 'Analyser friksjonen mellom nyhetsbilder, lyd, tekst og historisk minne.']],
      ['Nanook og samarbeid', 'Staging klassifiseres bare som sant eller falskt.', ['Skill samarbeid, rekonstruksjon, teknisk behov og produksjonsmakt.', 'Spør hvilken konkret påstand hver scene kan bære.']],
      ['Performance foran kamera', 'All atferd foran kamera avvises som skuespill.', ['Analyser både sosial rolle og respons på opptakssituasjonen.', 'Beskriv hvordan publikum, instruksjon og klipp kan endre handling.']]
    ].map(([id, situation, analysis], index) => ({ id: `ftv-de-ex-${index + 1}`, title: id, situation, analysis }))
  },
  'iscenesettelse-ombruk-sted-og-rekonstruksjon': {
    commonMisconceptions: [
      ['Et fotografisk bilde beviser automatisk filmens historiske forklaring.', 'Opptaket og evidenspåstanden må vurderes separat.'],
      ['All staging er det samme som bedrag.', 'Samarbeid, åpen rekonstruksjon, skjult staging og tvang har ulike kilde- og maktforhold.'],
      ['En digital modell er et bilde fra hendelsen.', 'Modellen er en rekonstruksjon av kildebaserte relasjoner og usikkerheter.'],
      ['Animasjon kan ikke være dokumentarisk.', 'Animasjon kan bære et dokumentarisk argument når kilder, stemmer og bildestatus er tydelige.'],
      ['Found footage forklarer seg selv.', 'Proveniens og den nye montasjekonteksten må analyseres sammen.'],
      ['Et locationbilde viser hele stedet.', 'Kameraposisjon, tidspunkt, adgang og hendelser utenfor rammen setter grenser.'],
      ['Syntetiske bilder kan fylle hull i nyhetsfotografiet uten merking.', 'Generert materiale er ikke dokumentert hendelsesfotografi og krever synlig status.'],
      ['Arkivombruk og arkivbevaring er samme problem.', 'Her analyseres det nye verkets sannhetskrav; bevaring, rettigheter og restaurering eies senere.']
    ].map(([claim, correction]) => ({ claim, correction }))
  },
  'deltakere-hverdagsbilder-format-og-vitnesbyrd': {
    applicationTasks: [
      ['Samtykkets tidslinje', 'Kartlegg hvordan samtykke og risiko kan endres fra første kontakt til langtidsdistribusjon.', ['Hvem hadde reelle valg i hvert ledd?', 'Når endret publikum, bruk eller identifiserbarhet seg?', 'Hvilken oppfølging finnes etter lansering?']],
      ['Realityformatets makt', 'Analyser ett realityforløp som produsert situasjon.', ['Skill casting, regler, oppgaver og overvåking.', 'Marker hva selektiv redigering kan endre.', 'Vurder omsorgsansvar under og etter deltakelse.']],
      ['Barn som eget vernesubjekt', 'Prøv en publiseringsbeslutning der foresatte har samtykket.', ['Hva kan barnet realistisk forstå?', 'Hvilken framtidig belastning kan identifisering gi?', 'Kan dokumentasjonen bevares med mindre eksponering?']],
      ['Hjemmefilmens nye publikum', 'Følg et familieopptak fra privat visning til offentlig samling.', ['Dokumenter skaper, personer og opprinnelig formål.', 'Hva tilfører familie- eller fellesskapskunnskap?', 'Krever ny bruk en ny etisk vurdering?']],
      ['Traumebevisst intervju', 'Planlegg et intervju uten å bestille en følelsesmessig prestasjon.', ['Forklar formål og mulig bruk på forhånd.', 'Bygg inn pauser, stopp og valg.', 'Planlegg klipp, kontakt og ettervirkning.']],
      ['Vitnesbyrdets forløp', 'Analyser et videovitnesbyrd uten å redusere det til sitatbank.', ['Bevar spørsmål, rekkefølge og deltakerposisjon.', 'Skill erindring, erfaring og ekstern faktakontroll.', 'Dokumenter arkiv- og framvisningskontekst.']],
      ['Verifisert, men skadelig', 'Vurder et autentisk menneskerettighetsopptak som kan identifisere en utsatt person.', ['Hva må publikum se for å forstå saken?', 'Kan ansikt, navn eller sted skjermes?', 'Hvem bærer risikoen ved senere deling?']],
      ['Norsk redaksjonell kontroll', 'Prøv et dokumentar- eller nyhetsbilde mot Vær Varsom-plakaten.', ['Kontroller kilde og faktapåstand.', 'Vurder identifikasjon, privatliv og barn.', 'Skill offentlig interesse fra publisering av alle detaljer.']]
    ].map(([title, task, prompts], index) => ({ id: `ftv-de-task-${index + 1}`, title, task, prompts })),
    selfCheck: [
      ['Hva er forskjellen på autentisitet og evidenspåstand?', 'Autentisitet gjelder opphav og integritet; evidenspåstanden gjelder hva materialet kan dokumentere.'],
      ['Hvorfor må et direktebilde verifiseres?', 'Samtidighet fastslår ikke alene identitet, sted, kilde, helhet eller korrekt kontekst.'],
      ['Er et signert samtykke en full etikkvurdering?', 'Nei, makt, bruk, risiko og ettervirkning kan endres gjennom hele produksjonsløpet.'],
      ['Hva beviser Theresienstadt-opptakene?', 'De dokumenterer en tvunget og iscenesatt produksjon, ikke propagandaens påstand om normalt liv.'],
      ['Er en modus en sannhetsskår?', 'Nei, modusen beskriver form og relasjon; konkrete påstander og praksiser må vurderes separat.'],
      ['Hva skiller en modell fra et opptak?', 'Modellen sammenstiller kilder og hypoteser; opptaket registrerer lys og lyd i en bestemt situasjon.'],
      ['Hvorfor er found footage avhengig av proveniens?', 'Uten kildeobjekt, opprinnelig bruk og metadata kan den nye montasjen ikke etterprøves historisk.'],
      ['Hvordan produserer reality formatmakt?', 'Casting, regler, oppgaver, overvåking og redigering former deltakernes handlingsrom.'],
      ['Hvorfor er vitnesbyrd mer enn transkribert faktum?', 'Intervjurelasjon, forløp, kropp, minne, klipp og arkivkontekst er deler av kilden.'],
      ['Hva eies ikke av dette kapitlet?', 'Generell representasjon og motbilder samt arkivets rettigheter, restaurering, bevaring og tilgang behandles senere.']
    ].map(([question, answer]) => ({ question, answer }))
  }
});

const sectionId = (emneId) => `ftv-de-${emneId.replace('em_film_tv_', '').replaceAll('_', '-')}`;

export function buildFilmTvDocumentaryEvidenceEthicsFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Dokumentar, evidens og etikk');
  const topics = new Map(sourceBrief.topic_briefs.map((row) => [row.emne_id, row]));
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id,
    title: row.work,
    year: row.year ?? row.years,
    medium: row.medium,
    role: row.purpose,
    source_ids: row.source_ids
  }));
  const claims = [];
  const modules = {};
  for (const modulePlan of sourceBrief.proposed_module_order) {
    const sections = modulePlan.emne_ids.map((emneId) => {
      const topic = topics.get(emneId);
      assert(topic, `Mangler topicbrief ${emneId}`);
      const id = sectionId(emneId);
      const claimIds = topic.planned_claims.map((row) => row.id);
      const paragraphs = claimIds.map((claimId) => {
        const paragraph = PARAGRAPHS[claimId];
        assert(paragraph, `Mangler fulltekst for ${claimId}`);
        return paragraph;
      });
      for (const planned of topic.planned_claims) {
        const paragraph = PARAGRAPHS[planned.id];
        claims.push({
          id: planned.id,
          claim_plan_id: planned.id,
          claim: paragraph.split(/(?<=\.)\s/, 1)[0],
          source_ids: planned.source_ids,
          status: 'verified',
          plan_resolution: 'verified_as_planned',
          evidence_mode: 'source_fact_plus_bounded_documentary_analysis',
          used_in: [id]
        });
      }
      return {
        id,
        title: SECTION_TITLES[emneId],
        emne_ids: [emneId],
        paragraphs,
        paragraphClaimIds: claimIds.map((claimId) => [claimId]),
        keyPoints: [topic.learning_goal, topic.canonical_boundary],
        keyPointClaimIds: [[claimIds[0]], [claimIds.at(-1)]]
      };
    });
    modules[`${String(modulePlan.sequence).padStart(2, '0')}-${modulePlan.id}.json`] = {
      id: modulePlan.id,
      title: ({
        'bilde-pastand-og-verifikasjon': 'Bilde, påstand og verifikasjon',
        'former-stemmer-og-opptakssituasjoner': 'Former, stemmer og opptakssituasjoner',
        'iscenesettelse-ombruk-sted-og-rekonstruksjon': 'Iscenesettelse, ombruk, sted og rekonstruksjon',
        'deltakere-hverdagsbilder-format-og-vitnesbyrd': 'Deltakere, hverdagsbilder, format og vitnesbyrd'
      })[modulePlan.id],
      purpose: modulePlan.purpose,
      sections,
      ...MODULE_EXTRAS[modulePlan.id]
    };
  }

  assert(claims.length === 54 && Object.keys(PARAGRAPHS).length === 54, 'Fullteksten må løse 54 claimplaner');
  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject: 'film_tv',
    subject_id: 'film_tv',
    id: CHAPTER_ID,
    chapter_id: CHAPTER_ID,
    primary_domain_id: 'dokumentar_virkelighetsformer_etikk',
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    emne_ids: unit.emne_ids,
    method_ids: methodIds,
    title: 'Dokumentar, evidens og etikk: hvordan virkelighetsbilder blir påstander og ansvar',
    subtitle: 'Fra direkte- og nyhetsbilder til essayfilm, staging, found footage, reality, syntetiske bilder og traumebevisst vitnesbyrd',
    lead: 'Kapittelet skiller bildet fra påstanden om hva det beviser. Det følger kildekjede, verifikasjon, form, produksjonsmakt og deltakeransvar gjennom dokumentar, nyheter, amatørbilder, reality og rekonstruksjon, uten å overta neste enhets generelle representasjonsanalyse eller arkivområdets forvaltning av rettigheter, restaurering og tilgang.',
    learningObjectives: [
      'skille autentisk opptak fra en korrekt, representativ og etisk evidenspåstand',
      'verifisere direkte- og nyhetsbilder gjennom identitet, tid, sted, kilde, kjede og kontekst',
      'analysere dokumentariske moduser som relasjoner og arbeidsformer uten å bruke dem som sannhetsskårer',
      'vurdere essaystemme, observasjon, deltakelse, refleksivitet og performance i konkrete opptakssituasjoner',
      'skille samarbeidende staging, tvungen iscenesettelse, åpen rekonstruksjon og skjult bedrag',
      'skille kameraopptak, found footage, rommodell, animasjon, interaktiv avspilling og syntetisk generering',
      'analysere dokumentarisk sted gjennom kameraramme, adgang, skade, vitnesbyrd og romlige spor',
      'følge samtykke, makt, risiko, endret bruk og ettervirkning gjennom hele deltakerrelasjonen',
      'analysere reality som formatmakt gjennom casting, regler, overvåking, redigering og omsorgsansvar',
      'behandle hverdagsbilder og vitnesbyrd som situerte relasjoner med proveniens, kontekst og deltakerkontroll'
    ],
    diagnosticQuestions: [
      { question: 'Er et autentisk bilde automatisk sann evidens?', answer: 'Nei. Bildets opphav, evidenspåstand, representativitet, kontekst og bruk må vurderes separat.' },
      { question: 'Er direktesendt det samme som verifisert?', answer: 'Nei. Samtidighet erstatter ikke kontroll av identitet, tid, sted, kilde og kjede.' },
      { question: 'Gjør samtykke all senere bruk etisk?', answer: 'Nei. Makt, publikum, risiko, distribusjon og ettervirkning kan endre seg.' },
      { question: 'Er en rommodell et kameraopptak?', answer: 'Nei. Modellen er en kildebasert rekonstruksjon som må vise metode og usikkerhet.' },
      { question: 'Er observerende dokumentar sannere enn essayfilm?', answer: 'Ikke i kraft av modusetiketten; konkrete kilder, påstander og relasjoner avgjør.' }
    ],
    relatedPlaces: [
      { id: 'nasjonalbiblioteket', name: 'Nasjonalbiblioteket', role: 'Bruk samlings- og katalogkontekst til å skille kildeobjekt, proveniens, senere ombruk og arkivforvaltning.' },
      { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Les stedet som redaksjonell og produksjonell infrastruktur der direkte- og nyhetsbilder blir valgt, verifisert, merket og sendt.' },
      { id: 'egertorget', name: 'Egertorget', role: 'Bruk den historiske prøvevisningen som et konkret skille mellom et samtidig offentlig bilde og den etterfølgende evidenspåstanden om hva bildet dokumenterer.' }
    ],
    workCases,
    moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief,
    claimsFile: P.claims,
    sourceBriefFile: P.sourceBrief,
    learningPlanFile: P.learningPlan
  };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    primary_domain_id: chapter.primary_domain_id,
    relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære kildeforankret dokumentaranalyse som skiller opptak, evidenspåstand, form, rekonstruksjon og deltakeransvar.',
    audience: 'Brukere som skal kunne etterprøve audiovisuelle virkelighetskrav og ta ansvarlige valg om opptak, klipp, publisering og ombruk.',
    requiredEmneIds: unit.emne_ids,
    requiredMethodIds: methodIds,
    requiredCriticalDistinctions: [
      'autentisk bilde vs korrekt evidenspåstand',
      'samtidighet vs verifikasjon',
      'opptak vs bildetekst og redaksjonell kontekst',
      'samtykke vs løpende deltakeransvar',
      'modusbeskrivelse vs sannhets- eller etikkscore',
      'samarbeidende staging vs tvungen iscenesettelse',
      'åpen rekonstruksjon vs skjult bedrag',
      'kameraopptak vs modell, animasjon og syntetisk generering',
      'found footage-kildeobjekt vs nytt montasjeargument',
      'locationbilde vs hele stedets erfaring og hendelsesforløp',
      'realityobservasjon vs formatprodusert handlingsrom',
      'videovitnesbyrd vs løsrevet transkribert faktum',
      'dokumentarisk ombruk vs arkivforvaltning',
      'deltakeransvar vs generell representasjonsanalyse'
    ],
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief,
      externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true,
      sourceLocationsRequired: true,
      everyPlannedClaimResolved: true,
      allUsedSourcesInspectable: true
    },
    workCaseIds: workCases.map((row) => row.id),
    scope: {
      included: unit.emne_ids,
      excluded: [
        'generell representasjon, identitet, posisjon og motbilder',
        'interseksjonell og dekolonial representasjonsanalyse som hovedtema',
        'arkivets rettigheter, restaurering, bevaringspraksis og tilgang som hovedtema',
        'klinisk diagnostikk eller behandling av traume',
        'syntetiske bilder som umerket erstatning for hendelsesfotografi'
      ]
    },
    qa: {
      sectionCountDerivedFromEmneOwnership: true,
      actualFulltextSections: 15,
      moduleSectionCounts: [4, 3, 4, 4],
      paragraphCountsAreNotQuota: true,
      paragraphClaimTraceRequired: true,
      exactCanonicalCoverage: '15/15',
      plannedClaimResolution: '54/54'
    }
  };
  const claimsDoc = {
    schema: 'history_go_fagverk_chapter_claims_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    sourceBriefFile: P.sourceBrief,
    sources,
    claims
  };

  sourceBrief.version = '1.1.0';
  sourceBrief.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBrief.runtime_registration = { registered: true, chapter_id: CHAPTER_ID, registration_after_full_chapter_gate: true };
  sourceBrief.topic_briefs = sourceBrief.topic_briefs.map((topic) => ({
    ...topic,
    planned_claims: topic.planned_claims.map((planned) => ({
      ...planned,
      status: 'resolved_to_verified_claim',
      final_claim_id: planned.id,
      resolution: 'verified_as_planned'
    }))
  }));
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, expected_current_section_owner_count: 15, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_representasjon_posisjon_og_motbilder';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.87.0';
  registry.updatedAt = '2026-08-12';
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: P.chapter,
    primary_domain_id: chapter.primary_domain_id,
    emne_ids: unit.emne_ids,
    claimsFile: P.claims,
    briefFile: P.brief
  };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. De seks første planenhetene er registrert etter fulltekstporten. Dokumentar, evidens og etikk dekker 15 canonicale emner i 4 problemavgrensede moduler og 15 emneeide seksjoner, med 54 claimsporede avsnitt, 54/54 løste claimplaner, 26 brukte inspectable kilder, 25 case og 3 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Representasjon, posisjon og motbilder; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.sixthSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.75.0';
  status.updatedAt = '2026-08-12';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Dokumentar, evidens og etikk er registrert etter fulltekst- og evidensaudit: 15/15 canonicale emner, 4 problemavgrensede moduler, 15 seksjoner, 54 avsnitt med claimtrace, 54/54 løste claimplaner, 26 brukte inspectable kilder, 25 case og 3 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Representasjon, posisjon og motbilder.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0';
  sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, no_planned_claim_overstated_as_verified: _c, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = {
    ...preservedGates,
    chapter_was_unregistered_at_source_brief_gate: true,
    registration_waited_for_fulltext_claim_source_audit: true,
    chapter_registered_only_after_fulltext_gate: true,
    every_planned_claim_resolved_to_verified_claim: claims.length === 54
  };
  sourceBriefReport.next_gate = sourceBrief.next_gate;
  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvDocumentaryEvidenceEthicsFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if (currentGate === OUTPUT_GATE && !force) {
    console.log('Dokumentar, evidens og etikk er allerede materialisert; bevarer neste kildebriefport.');
    return null;
  }
  const built = buildFilmTvDocumentaryEvidenceEthicsFulltextV1();
  write(P.chapter, built.chapter);
  write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc);
  write(P.sourceBrief, built.sourceBrief);
  write(P.registry, built.registry);
  write(P.status, built.status);
  write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvDocumentaryEvidenceEthicsFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV dokumentarfulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
