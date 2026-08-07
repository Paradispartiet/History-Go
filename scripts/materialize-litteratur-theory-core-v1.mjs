#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

const area = {
  id: 'formalisme_nykritikk_strukturalisme_semiotikk',
  title: 'Formalisme, nykritikk, strukturalisme og semiotikk',
  status: 'chapter_and_overview_text_materialized',
  topics: [
    'russisk_formalisme_fremmedgjoring_grep',
    'nykritikk_spenning_paradoks_organisk_enhet',
    'strukturalisme_system_relasjon_forskjell',
    'semiotikk_tegn_kode_konvensjon',
    'prag_skolen_funksjon_norm_dominant',
    'formanalyse_historisering_inferensgrense'
  ]
};

const areaFoundation = {
  id: area.id,
  title: area.title,
  synthesis: 'Formorienterte teorier flytter oppmerksomheten fra referat og forfatterbiografi til hvordan litterære virkninger blir produsert gjennom grep, relasjoner, tegn og konvensjoner. Kapittelet skiller russisk formalisme, nykritikk, strukturalisme, semiotikk og Praha-skolen historisk og metodisk, og viser hvordan formanalysen må avgrense hva den faktisk kan slutte om tekst, lesning og samfunn.',
  topics: [
    {
      id: 'russisk_formalisme_fremmedgjoring_grep',
      text: 'Russisk formalisme undersøker litteraritet som virkningen av organiserte grep, ikke som en tidløs egenskap ved skjønnlitteratur. Fremmedgjøring betegner måter et verk kan bremse eller omforme vaneseendet på. En analyse må identifisere det konkrete grepet, vise hvordan det avviker fra en relevant norm, og unngå å gjøre enhver uvanlig formulering til fremmedgjøring.',
      concepts: ['litteraritet', 'grep', 'fremmedgjoring', 'automatisering'],
      example: 'Viktor Sjklovskijs lesning av perspektivbrudd i Lev Tolstojs «Kholstomer» sammenholdt med novellens konkrete fortellerordning.'
    },
    {
      id: 'nykritikk_spenning_paradoks_organisk_enhet',
      text: 'Nykritikken behandler diktet som en språklig organisasjon der paradoks, ironi, tvetydighet og spenning kan virke sammen. Den historiske skolen må ikke forveksles med all nærlesning. Analysen prøver en hypotese om enhet mot tekstens motstemmer og restledd, og skiller verkets språklige funksjon fra påstander om forfatterens hensikt eller leserens følelse.',
      concepts: ['nykritikk', 'paradoks', 'spenning', 'organisk_enhet'],
      example: 'John Donnes «The Canonization» som analysegjenstand for Cleanth Brooks’ drøfting av paradoks og poetisk enhet.'
    },
    {
      id: 'strukturalisme_system_relasjon_forskjell',
      text: 'Strukturalismen forklarer enkeltelementer gjennom relasjonene og forskjellene som gjør dem betydningsbærende i et system. I litteraturstudiet kan en undersøke narrative funksjoner, sjangerkoder eller opposisjoner på tvers av et korpus. En struktur er en analytisk modell, ikke et usynlig objekt som automatisk beviser universelle lover eller opphever historisk forandring.',
      concepts: ['struktur', 'relasjon', 'forskjell', 'synkroni_diakroni'],
      example: 'Vladimir Propps funksjonsanalyse av hundre russiske undereventyr i «Morphology of the Folktale».'
    },
    {
      id: 'semiotikk_tegn_kode_konvensjon',
      text: 'Semiotikk undersøker hvordan tegn får funksjon gjennom kode, konvensjon, bruk og fortolkning. Saussures relasjonelle tegnmodell og Peirces tredelte tegnprosess åpner ulike spørsmål og bør ikke blandes uten forklaring. I en litterær analyse må en angi hva som fungerer som tegn, for hvem, i hvilken situasjon og gjennom hvilke mulige fortolkningsledd.',
      concepts: ['tegn', 'signifikant_signifikat', 'kode', 'semiose'],
      example: 'Den grønne lykten i F. Scott Fitzgeralds «The Great Gatsby» analysert som gjentatt tegn i fortellingens skiftende kontekster.'
    },
    {
      id: 'prag_skolen_funksjon_norm_dominant',
      text: 'Praha-skolen videreutvikler formalismen ved å se estetisk funksjon, norm og verdi som historisk bevegelige. Begrepet dominant viser til den komponenten som organiserer andre komponenter i et verk eller en periode, uten at de andre forsvinner. En analyse må derfor dokumentere både den aktuelle normen og relasjonen mellom det dominerende og det underordnede.',
      concepts: ['estetisk_funksjon', 'norm', 'dominant', 'forgrunning'],
      example: 'Roman Jakobsons analyse av grammatisk parallellisme i Charles Baudelaires «Les Chats» som modell for funksjonell formbeskrivelse.'
    },
    {
      id: 'formanalyse_historisering_inferensgrense',
      text: 'Formanalyse blir sterkest når den skiller tre nivåer: et observerbart mønster, en hypotese om mønsterets funksjon og en begrunnet påstand om historisk eller sosial betydning. Formen er ikke upolitisk, men tekststrukturen alene dokumenterer sjelden produksjonsforhold eller mottakelse. Slike slutninger trenger sammenligningsmateriale, arkivkilder eller resepsjonsdata i tillegg til nærlesningen.',
      concepts: ['formanalyse', 'funksjon', 'historisering', 'inferensgrense'],
      example: 'Virginia Woolfs «Mrs Dalloway» undersøkt gjennom fri indirekte diskurs før mønsteret kobles til dokumentert modernistisk praksis.'
    }
  ]
};

const formalismConcepts = [
  ['litteraritet', 'Litteraritet', 'De organiserte språklige og formelle virkningene som gjør at en ytring blir erfart og behandlet som litterær i en bestemt sammenheng.', 'En fast essens som alle skjønnlitterære tekster deler uavhengig av tid og bruk.'],
  ['grep', 'Grep', 'En identifiserbar teknikk som organiserer materiale og styrer tekstens forløp, oppmerksomhet eller virkning.', 'Et motiv eller tema uten beskrivelse av hvordan det er formet.'],
  ['fremmedgjoring', 'Fremmedgjøring', 'Et grep som forstyrrer automatisert persepsjon ved å gjøre et kjent objekt eller uttrykk merkbart på nytt.', 'All vanskelighet, originalitet eller politisk fremmedgjøring i marxistisk forstand.'],
  ['automatisering', 'Automatisering', 'Tilvenningen som gjør at språklige og perceptuelle mønstre kan passere uten aktiv oppmerksomhet.', 'Maskinell produksjon eller automatisert tekstanalyse.'],
  ['fabula_sjuzjet', 'Fabula og sjuzjet', 'Skillet mellom hendelsesmaterialets rekonstruerte kronologi og den konkrete ordningen som presenterer hendelsene i teksten.', 'Et absolutt skille mellom innhold og form eller mellom sann og falsk historie.'],
  ['motivering', 'Motivering', 'Den begrunnelsen et verk eller en tradisjon gir for at et formgrep framstår som nødvendig, sannsynlig eller passende.', 'Forfatterens private grunn til å skrive verket.'],
  ['nykritikk', 'Nykritikk', 'En historisk angloamerikansk kritikktradisjon som analyserer verkets språklige organisasjon og motsetter seg bestemte biografiske og affektive forkortelser.', 'Et synonym for all nærlesning eller for nyere litteraturkritikk.'],
  ['paradoks', 'Paradoks', 'En tilsynelatende selvmotsigelse som i den litterære sammenhengen kan organisere en mer kompleks påstand eller erfaring.', 'Enhver motsetning eller logisk feil i teksten.'],
  ['tvetydighet', 'Tvetydighet', 'Samtidig aktualisering av flere betydningsmuligheter som påvirker hvordan en passasje eller helhet kan forstås.', 'Utydelig språk som alltid bør løses til én mening.'],
  ['spenning', 'Spenning', 'En produktiv relasjon mellom betydninger, bilder, holdninger eller formnivåer som verket holder sammen uten nødvendigvis å oppheve forskjellen.', 'Bare narrativ suspense eller konflikt mellom figurer.'],
  ['organisk_enhet', 'Organisk enhet', 'En hypotese om at verkets deler får funksjon gjennom et gjensidig avhengig hele som analysen må demonstrere.', 'En garanti for at alle verk er harmoniske og uten restledd.'],
  ['intensjonal_fallgruve', 'Den intensjonale fallgruven', 'Nykritikkens navn på å bruke antatt forfatterintensjon som direkte målestokk for verkets betydning eller verdi.', 'Påstanden om at historiske forfatterdokumenter aldri kan være relevante kilder.'],
  ['affektiv_fallgruve', 'Den affektive fallgruven', 'Advarselen mot å gjøre en ukontrollert rapport om leserens virkning til selve kriteriet for verkets struktur eller verdi.', 'En avvisning av all empirisk forskning på lesere og følelser.'],
  ['struktur', 'Struktur', 'En modell av relasjoner og transformasjoner som forklarer hvordan elementer får posisjon og funksjon innenfor et avgrenset system.', 'En synlig liste over deler eller en uforanderlig essens.'],
  ['relasjonell_forskjell', 'Relasjonell forskjell', 'Prinsippet om at et element får verdi gjennom avgrensning og kontrast mot andre elementer i samme system.', 'At ord bare betyr det motsatte av ett annet ord.'],
  ['synkroni_diakroni', 'Synkroni og diakroni', 'Skillet mellom analyse av et system på et valgt tidspunkt og analyse av forandringer gjennom tid.', 'Et forbud mot å kombinere systemanalyse og historie.'],
  ['binar_opposisjon', 'Binær opposisjon', 'Et analytisk par av kontrasterende posisjoner som kan organisere klassifikasjon eller fortelling og som selv må historiseres.', 'En påstand om at alle kulturer tenker i de samme to motsetningene.'],
  ['tegn', 'Tegn', 'Noe som i en bestemt praksis står for eller leder fortolkningen mot noe annet for en mulig fortolker.', 'Et fast symbol med én universell betydning.'],
  ['signifikant_signifikat', 'Signifikant og signifikat', 'Saussures skille mellom tegnets uttrykksside og begrepsside innenfor en sosialt virksom tegnordning.', 'Skillet mellom et fysisk objekt og den virkelige tingen ordet navngir.'],
  ['semiose', 'Semiose', 'Prosessen der et tegn, dets objekt og en fortolkende virkning forbindes og kan gi opphav til videre tegn.', 'Fri assosiasjon uten konvensjoner eller kontrollmuligheter.'],
  ['kode', 'Kode', 'Et lært sett av forskjeller og forbindelsesregler som gjør bestemte tegnoperasjoner gjenkjennelige i en praksis.', 'En hemmelig fasit som kritikeren kan dekryptere én gang for alle.'],
  ['estetisk_funksjon', 'Estetisk funksjon', 'Måten oppmerksomhet mot tegnets egen organisasjon kan dominere uten at andre kommunikative eller sosiale funksjoner opphører.', 'En egenskap som finnes isolert inne i kunstobjektet.'],
  ['dominant', 'Dominant', 'Den komponenten som i en gitt struktur organiserer, omformer og hierarkiserer de øvrige komponentene.', 'Det hyppigste ordet eller et permanent trekk ved en sjanger.'],
  ['forgrunning', 'Forgrunning', 'Et funksjonelt avvik eller en parallellisme som gjør et språklig trekk særlig merkbart mot en relevant bakgrunnsnorm.', 'Ethvert iøynefallende uttrykk uten dokumentert norm eller funksjon.']
].map(([id, term, definition, distinguish_from]) => ({ id, term, definition, distinguish_from }));

const hermeneuticConcepts = [
  ['hermeneutikk', 'Hermeneutikk', 'Teori og praksis for forståelse og fortolkning av meningsbærende uttrykk under historiske, språklige og situerte vilkår.', 'En oppskrift som automatisk leverer tekstens eneste mening.'],
  ['forhandsforstaelse', 'Forhåndsforståelse', 'De begrepene, erfaringene og forventningene som gjør lesning mulig og samtidig må kunne korrigeres i møtet med teksten.', 'En privat fordom som bare kan fjernes før analysen begynner.'],
  ['hermeneutisk_sirkel', 'Hermeneutisk sirkel', 'Den reviderende bevegelsen mellom del og helhet, spørsmål og svar, forventning og ny observasjon.', 'Et sirkulært bevis som antar det som skulle begrunnes.'],
  ['horisont', 'Horisont', 'Den historisk situerte rekkevidden av spørsmål og betydningsmuligheter som er tilgjengelige fra en bestemt posisjon.', 'En lukket tidsånd som bestemmer alle lesninger mekanisk.'],
  ['horisontsammensmelting', 'Horisontsammensmelting', 'En hendelse der tekstens historiske krav og fortolkerens spørsmål omformes gjennom møtet uten at forskjellen utslettes.', 'Full enighet eller innlevelse i fortidens opprinnelige bevissthet.'],
  ['applikasjon', 'Applikasjon', 'Momentet der forståelsen av en tekst får betydning for fortolkerens aktuelle spørsmål og situasjon.', 'En løs overføring av teksten til et hvilket som helst moderne tema.'],
  ['forfatterintensjon', 'Forfatterintensjon', 'En historisk hypotese om hva en aktør forsøkte å gjøre med en bestemt ytring i en dokumenterbar situasjon.', 'Tekstens samlede betydning eller senere virkningshistorie.'],
  ['verkbetydning', 'Verkbetydning', 'De meningsmulighetene som kan begrunnes gjennom verkets ordning, språk, sjanger, historie og bruk.', 'Et skjult budskap som eksisterer uavhengig av tekstversjon og lesning.'],
  ['implisitt_leser', 'Implisitt leser', 'En tekstlig modell av posisjoner, kunnskaper og operasjoner som verket inviterer en leser til å innta.', 'En faktisk historisk leser eller forfatterens ønskede målgruppe.'],
  ['resepsjon', 'Resepsjon', 'Dokumenterbare møter der lesere, kritikere, institusjoner eller medier aktualiserer og omformer verk over tid.', 'Den meningen alle lesere får direkte fra teksten.'],
  ['mistankens_hermeneutikk', 'Mistankens hermeneutikk', 'Fortolkning som undersøker hvordan uttrykt mening kan være formet av fortrengning, ideologi eller maktforhold den ikke selv behersker.', 'En generell regel om at teksten alltid lyver.'],
  ['symptomatisk_lesning', 'Symptomatisk lesning', 'En lesemåte som behandler brudd, fravær eller motsigelser som spor av strukturer teksten ikke fullt ut artikulerer.', 'Å erstatte tekstobservasjon med en forhåndsbestemt teori.'],
  ['overflatelesning', 'Overflatelesning', 'Et knippe praksiser som prioriterer det teksten åpent organiserer, beskriver eller gjør tilgjengelig framfor automatisk avsløring av skjult dybde.', 'Naiv bokstavelighet eller et forbud mot inferens.'],
  ['postkritikk', 'Postkritikk', 'Forsøk på å utvide kritikkens repertoar med beskrivelser av tilknytning, gjenkjennelse, bruk og mediering uten å avskaffe kritisk prøving.', 'En ukritisk feiring av litteratur eller et endelig historisk stadium etter kritikken.'],
  ['fortolkningspluralisme', 'Fortolkningspluralisme', 'Synet at flere uforenlige eller delvis overlappende fortolkninger kan være faglig forsvarlige når de svarer på ulike spørsmål.', 'At alle lesninger er like godt begrunnet.'],
  ['overfortolkning', 'Overfortolkning', 'En lesning som tilskriver detaljer en bestemt funksjon uten tilstrekkelig mønster, kontekst eller motstandsprøving.', 'Enhver overraskende eller teoretisk ambisiøs fortolkning.'],
  ['tekstlig_motstand', 'Tekstlig motstand', 'Trekk som ikke lar seg innordne uten rest i en hypotese og derfor krever avgrensning, revisjon eller en alternativ forklaring.', 'At teksten har én selvstendig vilje som nekter leseren adgang.'],
  ['fortolkningsfellesskap', 'Fortolkningsfellesskap', 'Sosiale og institusjonelle praksiser som lærer deltakere hva som teller som relevante trekk, spørsmål og begrunnelser.', 'En gruppe der alle faktisk tolker identisk.'],
  ['anakronisme', 'Anakronisme', 'En uhistorisert overføring av senere kategorier, forventninger eller verdier til et tidligere materiale.', 'Alle nåtidige spørsmål til historiske tekster.'],
  ['historisk_avstand', 'Historisk avstand', 'Forskjellen mellom tekstens tilblivelses- og brukssituasjoner og fortolkerens situasjon, som både begrenser og muliggjør nye spørsmål.', 'Bare antallet år mellom utgivelse og lesning.'],
  ['virkningshistorie', 'Virkningshistorie', 'Historien om hvordan tidligere fortolkninger, institusjoner og bruksmåter allerede former den aktuelle forståelsessituasjonen.', 'En kronologisk liste over verkets popularitet.'],
  ['sporsmalsapparat', 'Spørsmålsapparat', 'Et eksplisitt sett av begreper og distinksjoner som gjør noen egenskaper ved et materiale undersøkbare og lar andre ligge.', 'En universell teori som kan brukes likt på alle tekster.'],
  ['fortolkningshypotese', 'Fortolkningshypotese', 'En reviderbar påstand om hvordan identifiserte trekk henger sammen og hva forbindelsen betyr innenfor en avgrenset analyse.', 'Et temaord, en første reaksjon eller en uangripelig fasit.'],
  ['inferensgrense', 'Inferensgrense', 'Grensen for hva en bestemt kombinasjon av tekststeder, kontekstkilder og metode med rimelighet kan støtte.', 'En høflig reservasjon som lar en ubegrenset konklusjon stå urørt.']
].map(([id, term, definition, distinguish_from]) => ({ id, term, definition, distinguish_from }));

const makeSection = (id, title, coverageTopic, paragraphs, paragraphClaimIds, keyPoints) => ({
  id, title, coverageTopic, paragraphs, paragraphClaimIds, keyPoints
});

const formalismSections = [
  makeSection('russisk-formalisme', '1. Russisk formalisme: grep og fremmedgjøring', area.topics[0], [
    'Russisk formalisme var ikke én lukket lære, men flere miljøer som omkring 1910- og 1920-årene forsøkte å gjøre litteraturstudiet mer presist ved å undersøke hva litterære teknikker faktisk gjør. Analysens første oppgave ble å beskrive organiseringsmåter som rytme, gjentakelse, forsinkelse, perspektiv og fortellingsrekkefølge. Biografi og idéhistorie ble ikke erklært verdiløse, men de kunne ikke erstatte forklaringen av verkets konkrete konstruksjon.',
    'Sjklovskijs begrep om fremmedgjøring retter oppmerksomheten mot forskjellen mellom å gjenkjenne noe raskt og å sanse det på nytt. I Tolstojs «Kholstomer» blir eierskap og menneskelig rang blant annet sett gjennom en hests perspektiv. Poenget er ikke bare at perspektivet er uvanlig; analysen må vise hvordan omveien bryter vanlige klassifikasjoner, forlenger oppmerksomheten og endrer relasjonen mellom ting, språk og sosial orden.',
    'Et grep virker aldri i et tomrom. Det blir merkbart mot språklige, sjangermessige eller kulturelle normer som selv forandrer seg. Derfor kan fremmedgjøring ikke registreres ved å telle sjeldne ord alene. Kritikeren må dokumentere den relevante bakgrunnen, beskrive grepet på tekstnivå og avgrense virkningen. Påstanden om at lesere faktisk opplever fornyet persepsjon, krever resepsjonsdata i tillegg til formanalysen.'
  ], [['form-01','form-02'], ['form-03','form-04'], ['form-05']], ['Beskriv grepet før virkningen forklares.', 'Dokumenter normen som gjør avviket merkbart.']),
  makeSection('nykritikk', '2. Nykritikk: paradoks, spenning og enhet', area.topics[1], [
    'Den angloamerikanske nykritikken vokste fram i en annen institusjonell og historisk sammenheng enn russisk formalisme. Den gjorde diktets ordning av ironi, paradoks, tvetydighet og spenning til et hovedobjekt og bidro til å etablere detaljert tekstanalyse som undervisningspraksis. Betegnelsen bør brukes om denne historiske tradisjonen, ikke som et løst navn på enhver analyse som leser et dikt langsomt.',
    'Cleanth Brooks bruker John Donnes «The Canonization» til å vise hvordan et dikt kan organisere motstridende språkfelter uten å redusere dem til én prosaisk beskjed. En ansvarlig nykritisk lesning identifiserer hvilke ord, figurer og kompositoriske vendinger som bærer spenningen, og prøver hypotesen om enhet mot detaljer som ikke passer. Organisk enhet er dermed en tolkbar påstand, ikke en egenskap kritikeren kan forutsette.',
    'Wimsatt og Beardsleys intensjonale og affektive fallgruver avgrenser bestemte typer begrunnelse: antatt forfatterhensikt eller en ukontrollert følelsesrapport kan ikke alene avgjøre verkets betydning og verdi. Distinksjonene forbyr ikke arkivstudier av intensjon eller empiriske studier av lesere. De krever at slike kilder behandles som egne data og at forbindelsen fra dokument, teksttrekk eller leserrespons til konklusjon gjøres eksplisitt.'
  ], [['form-06'], ['form-07','form-08'], ['form-09','form-10']], ['Nykritikk er en historisk skole, ikke all nærlesning.', 'Enhet skal prøves mot restledd og motstemmer.']),
  makeSection('strukturalisme', '3. Strukturalisme: system, forskjell og modell', area.topics[2], [
    'Strukturalismen tar utgangspunkt i at elementer ikke bærer hele sin verdi isolert, men får funksjon gjennom forskjeller og relasjoner i et system. Saussures språkmodell ga et sentralt vokabular for denne vendingen, mens litteraturforskere utviklet modeller for fortelling, sjanger og kulturelle koder. Analysen spør derfor mindre hva ett motiv betyr alene, og mer hvilken posisjon og transformasjonsmulighet motivet får i et avgrenset mønster.',
    'Vladimir Propps analyse av russiske undereventyr er et instruktivt eksempel fordi den skiller skiftende figurnavn og motiver fra tilbakevendende handlingsfunksjoner. Modellen beskriver et bestemt korpus og en bestemt sjangertradisjon; den beviser ikke at alle fortellinger følger samme rekkefølge. Når modellen anvendes på et nytt materiale, må forskeren angi utvalg, kodingsregel, tvilstilfeller og hvilke funksjoner som ikke lar seg overføre.',
    'Strukturalistiske modeller kan sammenligne mange tekster, men abstraksjonen har en kostnad. Språk, makt, medium og historisk forskjell kan forsvinne dersom kategoriene blir tatt som universelle i stedet for analytisk konstruerte. En god studie lar derfor modellen møte avvik, konkurrerende inndelinger og diakron forandring. Struktur forklarer da et mønster innenfor en angitt skala, ikke hele årsaken til at litteraturen oppstod eller fikk virkning.'
  ], [['form-11','form-12'], ['form-13','form-14'], ['form-15']], ['Relasjoner, ikke isolerte elementer, er analysens kjerne.', 'En modell må ha dokumentert korpus og gyldighetsområde.']),
  makeSection('semiotikk', '4. Semiotikk: tegn, kode og fortolkningskjede', area.topics[3], [
    'Semiotikken gjør tegnprosesser til forskningsobjekt. I en saussureansk modell blir tegnverdien til gjennom forskjeller innenfor et sosialt system; i en peirceansk modell inngår tegn, objekt og interpretant i en fortløpende prosess. Modellene kan belyse hverandre, men begrepene er ikke utskiftbare. Analysen må oppgi hvilken tegnforståelse den bruker og hvilke tekstlige eller kulturelle relasjoner som gjør tolkningen kontrollerbar.',
    'Den grønne lykten i «The Great Gatsby» er ikke et tegn med én betydning som kan slås opp i en symbolordbok. Den står i forskjellige narrative situasjoner, knyttes til avstand, synsretning, begjær, eiendom og gjentakelse, og blir fortolket gjennom leserens kjennskap til verkets forløp. En semiotisk analyse kartlegger disse relasjonene og skiller tekstens interne kodning fra senere kulturell bruk av bildet.',
    'Ubegrenset semiose betyr ikke at enhver assosiasjon er like faglig sterk. Tekstversjon, syntaks, sjanger, intertekst, historiske konvensjoner og faktisk bruk begrenser hvilke forbindelser som kan dokumenteres. En alternativ tolkning bør kunne vise hvilket ledd i tegnkjeden den organiserer annerledes. Dersom analysen hevder hva et symbol betydde for samtidige lesere, trenger den resepsjonskilder og kan ikke nøye seg med nåtidig nærlesning.'
  ], [['form-16','form-17'], ['form-18'], ['form-19']], ['Oppgi hvilken tegnmodell analysen bruker.', 'Skille intern tekstkodning fra dokumentert historisk bruk.']),
  makeSection('prag-skolen', '5. Praha-skolen: funksjon, norm og dominant', area.topics[4], [
    'Praha-skolen videreførte formanalysen, men understreket at estetisk funksjon, norm og verdi er historisk og sosialt bevegelige. Et språktrekk blir ikke poetisk bare på grunn av sin form; funksjonen avhenger av hvordan trekket organiseres og oppfattes i en kommunikativ sammenheng. Dette gjør det mulig å analysere både verkets interne relasjoner og skiftende grenser mellom kunstspråk, dagligspråk og andre kulturelle praksiser.',
    'Jakobsons begrep om den poetiske funksjonen beskriver en orientering mot meldingens egen organisasjon, ikke en isolert kategori tekster uten andre formål. I et politisk slagord, en reklame eller et dikt kan parallellisme, rytme og lydlikhet gjøre uttrykksformen virksom. Analysen må likevel vise hvilken funksjon som dominerer i den konkrete ytringen og hvordan referensiell, appellativ eller sosial funksjon fortsatt deltar.',
    'Dominanten betegner komponenten som organiserer de øvrige komponentenes plass og virkning. I én modernistisk tekst kan perspektivbrudd dominere, mens rytmisk komposisjon eller sjangerblanding gjør det i en annen. Å utpeke en dominant krever sammenligning av flere strukturelle nivåer; den er ikke automatisk det hyppigste trekket. Historiske påstander om skiftende dominanter krever dessuten et representativt korpus og daterte normkilder.'
  ], [['form-20'], ['form-21','form-22'], ['form-23']], ['Estetisk funksjon er relasjonell og historisk.', 'Dominanten organiserer andre trekk; den er ikke bare hyppigst.']),
  makeSection('historisert-formanalyse', '6. Historisert formanalyse og inferensgrenser', area.topics[5], [
    'En robust formanalyse begynner med et lokaliserbart mønster og beveger seg trinnvis mot funksjon og kontekst. I «Mrs Dalloway» kan forskeren først registrere skift mellom direkte tanke, fortellerdiskurs og fri indirekte diskurs. Deretter kan en undersøke hvordan skiftene fordeler tilgang til bevissthet og binder figurer sammen i byrommet. Først når denne forbindelsen er dokumentert, kan større påstander om modernistisk erfaring prøves.',
    'Historisering betyr ikke å legge en epokebeskrivelse utenpå en ferdig formtolkning. Den krever kilder som viser hvilke normer, sjangre, publiseringsvilkår eller språklige praksiser formen grep inn i. Sammenligning med samtidige tekster kan vise om et trekk var vanlig, marginalt eller nyskapende. Arkiv- og resepsjonsmateriale kan dokumentere produksjon og virkning, men må holdes fra hverandre dersom kildene svarer på ulike spørsmål.',
    'Inferensgrensen skal formuleres som en del av konklusjonen. Tekstanalysen kan vise at et mønster tilbyr bestemte posisjoner eller organiserer en konflikt, men ikke alene at alle lesere inntok posisjonene eller at formen forårsaket en samfunnsendring. Når kritikeren navngir dette skillet, blir formanalyse ikke smalere. Den blir kombinerbar med bokhistorie, resepsjonsstudier, ideologikritikk og empiriske metoder uten at evidenstypene blandes.'
  ], [['form-24'], ['form-25','form-26'], ['form-27']], ['Gå fra mønster via funksjon til historisk påstand.', 'Formuler eksplisitt hva tekstanalysen ikke kan bevise alene.'])
];

const hermeneuticSections = [
  makeSection('sirkel-og-forstaelse', '1. Hermeneutisk sirkel og reviderbar forståelse', 'hermeneutisk_sirkel', [
    'Hermeneutikk undersøker hvordan forståelse blir mulig når leseren alltid møter teksten med språk, erfaring og forventninger. Forhåndsforståelsen er ikke bare en feil som kan fjernes; uten den finnes heller ikke et spørsmål. Det faglige kravet er at forventningene gjøres synlige og kan korrigeres. Den hermeneutiske sirkelen betegner derfor en reviderende bevegelse mellom detalj og helhet, ikke et bevis som gjentar sin egen konklusjon.',
    'I første akt av «Et dukkehjem» kan kjælenavnene først se ut som entydige tegn på dominans. Resten av dialogen viser samtidig lek, hemmelighold, økonomisk avhengighet og strategisk rolleframføring. En hermeneutisk lesning lar disse detaljene endre den foreløpige helheten og går deretter tilbake til åpningsscenen. Resultatet kan fortsatt være en maktanalyse, men den må forklare samspillet og avvikene i stedet for å omskrive alt som bekreftelse.',
    'Sirkelen har en metodisk stoppregel: fortolkningen bør angi hvilke nye observasjoner som fikk hypotesen til å endre seg, hvilke tekststeder som fortsatt yter motstand, og hvilken tekstversjon helheten gjelder for. Uten slike spor blir «del og helhet» en høflig formel. Med dem blir prosessen etterprøvbar, selv om to lesere kan vekte mønsteret ulikt og ende med konkurrerende, men begrunnede helheter.'
  ], [['herm-01','herm-02'], ['herm-03'], ['herm-04']], ['Forhåndsforståelse skal prøves, ikke fornektes.', 'Dokumenter hva som faktisk reviderte hypotesen.']),
  makeSection('intensjon-verk-leser', '2. Intensjon, verk og leser', 'intensjon_verk_leser', [
    'Spørsmålet om mening blir uklart når forfatterintensjon, tekstlig organisasjon og leseraktualisering behandles som samme størrelse. En historisk intensjonsstudie rekonstruerer hva en aktør forsøkte å gjøre i en bestemt situasjon og trenger daterte dokumenter, språklige konvensjoner og tekstvitner. En verkanalyse undersøker mønstre og muligheter i en identifisert tekst. En resepsjonsstudie dokumenterer hvordan faktiske lesere eller institusjoner tok verket i bruk.',
    'Den implisitte leseren er en tekstlig modell, ikke en biografisk person. Tomrom, forsinket informasjon, sjangerforventning og direkte tiltale kan invitere til bestemte operasjoner uten å sikre at alle faktiske lesere utfører dem. I Kafkas «Prosessen» kan mangelfull tilgang til lovens orden strukturere leserens usikkerhet. Påstanden gjelder da verkets tilbudte posisjon; påstander om historiske reaksjoner krever anmeldelser, brev eller andre resepsjonskilder.',
    'Intensjonsdokumenter kan avgrense en analyse uten å avslutte den. Et brev kan vise hvilket prosjekt forfatteren beskrev, men teksten kan realisere prosjektet ufullstendig, motsigende eller på måter som får andre virkninger senere. Kritikeren bør derfor oppgi kilderollen: brukes dokumentet til å identifisere handling, tilblivelse eller en autorisert tolkning? Ingen av disse rollene gjør automatisk dokumentet til fasit for verkets samlede betydningshistorie.'
  ], [['herm-05','herm-06'], ['herm-07','herm-08'], ['herm-09']], ['Skille intensjons-, verk- og resepsjonsspørsmål.', 'En implisitt leser er en tekstmodell, ikke et publikumstall.']),
  makeSection('mistanke-og-overflate', '3. Mistanke, symptom og overflate', 'mistanke_symptom_overflate', [
    'Mistankens hermeneutikk samler lesemåter som ikke tar tekstens uttalte selvforståelse som siste ord, men undersøker fortrengning, ideologi og makt. En symptomatisk lesning kan behandle brudd, tausheter eller uløste motsetninger som spor av betingelser teksten ikke fullt ut artikulerer. Metoden er sterk når den viser den tekstlige forstyrrelsen og forbindelsen til dokumentert teori; den er svak når teorien bestemmer funnet før lesningen.',
    'Overflatelesning oppstod som kritikk av at avsløring av skjult dybde var blitt en automatisk profesjonell gest. «Overflate» kan bety det teksten eksplisitt sier, dens materielle utbredelse, mønstre som kan beskrives uten symptommodell, eller en oppmerksomhet mot affekt og tilknytning. Disse praksisene er ikke teoriløse. De flytter spørsmålet fra hva teksten skjuler til hva den organiserer, sirkulerer eller gjør tilgjengelig.',
    'Postkritikk utvider repertoaret med gjenkjennelse, bruk, tilknytning og mediering, men opphever ikke behovet for kritisk prøving. I en analyse av en populær roman kan forskeren både undersøke ideologiske begrensninger og forklare hvorfor lesere knytter seg til figurer eller verdener. Evidensen må fordeles: tekstlige virkemidler støtter én del, mens intervjuer, omtaler eller bruksspor trengs for påstander om faktiske tilknytninger.'
  ], [['herm-10','herm-11'], ['herm-12'], ['herm-13','herm-14']], ['Mistanke må vise tekstlig symptom og teoretisk mellomledd.', 'Postkritikk supplerer metoder; den avskaffer ikke begrunnelse.']),
  makeSection('pluralisme-og-grenser', '4. Fortolkningspluralisme og grenser', 'fortolkningspluralisme_grenser', [
    'Fortolkningspluralisme følger av at tekster kan undersøkes med ulike spørsmål, på ulike skalaer og i ulike historiske situasjoner. Det betyr ikke at alle lesninger er like gode. En fortolkning må identifisere tekstgrunnlag, forklare sammenhengen mellom observasjoner og påstand, håndtere relevant motstand og avgrense rekkevidden. To tolkninger kan være forenlige, konkurrerende eller gjelde ulike objekter; denne relasjonen bør sies uttrykkelig.',
    'Overfortolkning kan ikke avgjøres bare ved at en lesning er ny eller overraskende. Problemet oppstår når et detaljfunn får bære en spesifikk påstand uten mønster, når en kode forutsettes uten historisk dokumentasjon, eller når moteksempler forklares bort ad hoc. I Poes «The Purloined Letter» kan brevets plassering støtte flere teoretiske modeller, men hver modell må vise hvilke tekstledd den forklarer bedre enn alternativet.',
    'Fortolkningsfellesskap minner om at standarder for relevans og bevis læres i praksiser som seminarer, tidsskrifter, skoler og lesekulturer. Dette gjør ikke tekstlig evidens vilkårlig. Fellesskap kan kritiseres ved å vise inkonsistente regler, oversette tekststeder, ekskluderte kilder eller svake prediksjoner. En faglig uenighet blir mer produktiv når partene klargjør om de strides om objekt, spørsmål, evidensregel eller selve slutningen.'
  ], [['herm-15'], ['herm-16'], ['herm-17']], ['Pluralisme er forenlig med kvalitetskriterier.', 'Lokaliser uenigheten: objekt, spørsmål, evidens eller slutning.']),
  makeSection('historisk-avstand', '5. Anakronisme, historisk avstand og virkningshistorie', 'anakronisme_historisk_avstand', [
    'Historisk avstand er ikke bare et hinder. Forskjellen mellom tekstens og leserens situasjon gjør det mulig å stille spørsmål som tidligere lesere ikke stilte, samtidig som den skaper risiko for anakronisme. En moderne analyse av kjønn i en middelaldertekst kan være legitim, men må skille sitt analytiske vokabular fra aktørenes kategorier og undersøke hvilke tekstlige og historiske forbindelser som gjør sammenstillingen fruktbar.',
    'Virkningshistorie betegner at fortolkeren ikke står utenfor tradisjonen. Utgaver, oversettelser, kanonisering, undervisning og tidligere lesninger former allerede hva som er tilgjengelig og synlig. En analyse av «Antigone» bør derfor angi om den arbeider med gresk tekst, en bestemt oversettelse eller en sceneversjon, og hvordan etablerte konfliktrammer påvirker spørsmålet. Å erkjenne virkningen erstatter ikke kildekritikk; det skjerper den.',
    'En kontrollert historisering bruker minst to sett kilder: tekstvitnet som analyseres og kilder til den konteksten påstanden gjelder. Nåtidig relevans formuleres som applikasjon, ikke som bevis for opprinnelig mening. Dermed kan en tekst belyse et aktuelt spørsmål uten at moderne kategorier legges i munnen på historiske aktører. Konklusjonen bør angi både den historiske forskjellen og hvorfor møtet likevel produserer kunnskap.'
  ], [['herm-18'], ['herm-19','herm-20'], ['herm-21']], ['Historiser både tekstens og analytikerens kategorier.', 'Nåtidig applikasjon er ikke bevis for opprinnelig mening.']),
  makeSection('teori-som-sporsmal', '6. Teori som spørsmålsapparat', 'teori_som_sporsmalsapparat', [
    'En teori er mest faglig fruktbar når den brukes som et eksplisitt spørsmålsapparat. Begrepene gjør bestemte relasjoner synlige, angir hvilke observasjoner som er relevante og foreslår mulige forklaringer. De er ikke etiketter som skal festes på verket etter et referat. Før analysen bør forskeren derfor skrive hva teorien lar en spørre om, hvilken analyseenhet den forutsetter og hvilke fenomener den risikerer å overse.',
    'Metodisk triangulering betyr ikke å nevne mange teoretikere, men å la ulike evidenstyper eller modeller prøve samme avgrensede påstand. En formanalyse kan identifisere en fortellerposisjon, en bokhistorisk kilde kan vise publiseringsvilkår, og resepsjonsmateriale kan dokumentere bruk. Dersom resultatene peker ulikt, skal forskjellen bevares som kunnskap om skala eller kilde, ikke glattes ut til en kunstig samlet fortolkning.',
    'Den ferdige analysen bør inneholde en revisjonslogikk: Hva ville svekke hypotesen? Hvilken alternativ modell forklarer samme trekk? Hvor går inferensgrensen? Disse spørsmålene gjør ikke fortolkning til et mekanisk eksperiment. De gjør det mulig å skille oppfinnsomhet fra vilkårlighet og å vise leseren nøyaktig hvor tekstobservasjon, historisk kilde og teoretisk antakelse bidrar til den faglige konklusjonen.'
  ], [['herm-22'], ['herm-23'], ['herm-24']], ['Teori skal formulere spørsmål og evidensbehov.', 'Bevar konflikt mellom kilder i stedet for å skjule den.'])
];

const sourcesFormalism = [
  ['sf01','Russian Formalism','https://www.cambridge.org/core/books/cambridge-history-of-literary-criticism/russian-formalism/AC3A76821D9FFCD37FF95D877B7DCB41','Cambridge University Press','faghistorisk_oversiktsverk'],
  ['sf02','Structuralism of the Prague School','https://www.cambridge.org/core/books/cambridge-history-of-literary-criticism/structuralism-of-the-prague-school/C7B6313FE1074E0D9FAC2A05CF63A971','Cambridge University Press','faghistorisk_oversiktsverk'],
  ['sf03','The Cambridge History of Literary Criticism, Volume 8','https://www.cambridge.org/core/books/cambridge-history-of-literary-criticism/9932CAF4FD6509CBDA15CD8537456320','Cambridge University Press','faghistorisk_oversiktsverk'],
  ['sf04','Theory of Prose','https://dalkeyarchive.store/products/theory-of-prose','Dalkey Archive Press','primarteoretisk_verk'],
  ['sf05','Morphology of the Folktale','https://utpress.utexas.edu/9780292783768/','University of Texas Press','primarteoretisk_verk'],
  ['sf06','Course in General Linguistics','https://cup.columbia.edu/book/course-in-general-linguistics/9780231157278','Columbia University Press','primarteoretisk_verk'],
  ['sf07','The Well Wrought Urn','https://www.hmhbooks.com/shop/books/The-Well-Wrought-Urn/9780156957052','Harcourt / Houghton Mifflin Harcourt','primarteoretisk_verk'],
  ['sf08','The Intentional Fallacy','https://www.jstor.org/stable/27537676','JSTOR / The Sewanee Review','fagfellevurdert_artikkel'],
  ['sf09','Linguistics and Poetics','https://monoskop.org/images/8/84/Jakobson_Roman_1960_Closing_statement_Linguistics_and_Poetics.pdf','MIT Press','primarteoretisk_kapittel'],
  ['sf10','Semiotics and the Philosophy of Language','https://iupress.org/9780253203984/semiotics-and-the-philosophy-of-language/','Indiana University Press','primarteoretisk_verk'],
  ['sf11','The Great Gatsby','https://www.simonandschuster.com/books/The-Great-Gatsby/F-Scott-Fitzgerald/9781982147709','Scribner','primartekst'],
  ['sf12','Mrs. Dalloway','https://www.penguin.co.uk/books/60322/mrs-dalloway-by-woolf-virginia/9780241371947','Penguin','primartekst']
].map(([id,label,url,publisher,type]) => ({id,label,url,publisher,type,source_location:'Verkpresentasjon, bibliografiske opplysninger og relevant hovedargument'}));

const sourcesHermeneutics = [
  ['sh01','Truth and Method','https://www.bloomsbury.com/uk/truth-and-method-9781780936002/','Bloomsbury Academic','primarteoretisk_verk'],
  ['sh02','Hermeneutics and Criticism','https://www.cambridge.org/core/books/hermeneutics-and-criticism/9D28A96D2B1631D3C85347E132CD995E','Cambridge University Press','primarteoretisk_verk'],
  ['sh03','Validity in Interpretation','https://yalebooks.yale.edu/book/9780300016925/validity-in-interpretation/','Yale University Press','primarteoretisk_verk'],
  ['sh04','The Act of Reading','https://www.press.jhu.edu/books/title/1034/act-reading','Johns Hopkins University Press','primarteoretisk_verk'],
  ['sh05','Toward an Aesthetic of Reception','https://www.upress.umn.edu/9780816610372/toward-an-aesthetic-of-reception/','University of Minnesota Press','primarteoretisk_verk'],
  ['sh06','Is There a Text in This Class?','https://www.hup.harvard.edu/books/9780674467262','Harvard University Press','primarteoretisk_verk'],
  ['sh07','The Limits of Interpretation','https://iupress.org/9780253208699/the-limits-of-interpretation/','Indiana University Press','primarteoretisk_verk'],
  ['sh08','The Limits of Critique','https://press.uchicago.edu/ucp/books/book/chicago/L/bo21386290.html','University of Chicago Press','primarteoretisk_verk'],
  ['sh09','Touching Feeling','https://www.dukeupress.edu/touching-feeling','Duke University Press','primarteoretisk_verk'],
  ['sh10','Et dukkehjem – hovedtekst etter førsteutgaven 1879','https://www.ibsen.uio.no/DRVIT_Du%7CDuht.pdf','Henrik Ibsens skrifter, Universitetet i Oslo','vitenskapelig_hovedtekst'],
  ['sh11','The Trial','https://www.penguin.co.uk/books/56546/the-trial-by-franz-kafka-trans-idris-parry-intro-gabriel-josipovici/9780241678916','Penguin','primartekst'],
  ['sh12','The Purloined Letter','https://www.eapoe.org/works/tales/plttrc.htm','Edgar Allan Poe Society of Baltimore','vitenskapelig_tekstutgave']
].map(([id,label,url,publisher,type]) => ({id,label,url,publisher,type,source_location:'Verkpresentasjon, bibliografiske opplysninger og relevant hovedargument'}));

const claimsFormalism = [
  ['form-01','Russisk formalisme betegner flere beslektede miljøer og kan ikke reduseres til én enhetlig doktrine.',['sf01']],
  ['form-02','Formalistene gjorde litterære teknikker og verkets konstruksjon til selvstendige analyseobjekter.',['sf01','sf04']],
  ['form-03','Fremmedgjøring beskriver hvordan kunstneriske grep kan forstyrre automatisert gjenkjennelse og fornye oppmerksomheten.',['sf04']],
  ['form-04','Sjklovskij bruker Tolstojs framstilling gjennom et ikke-menneskelig perspektiv som et hovedeksempel i drøftingen av fremmedgjøring.',['sf04']],
  ['form-05','Påstander om faktisk leservirkning krever andre data enn en analyse av tekstlig teknikk alene.',['sf03']],
  ['form-06','Nykritikken er en historisk angloamerikansk tradisjon og er ikke identisk med all nærlesning.',['sf03','sf07']],
  ['form-07','Brooks analyserer paradoks som en organiserende poetisk funksjon, blant annet i Donnes «The Canonization».',['sf07']],
  ['form-08','Organisk enhet fungerer som en analytisk hypotese om relasjonen mellom verkets deler.',['sf07']],
  ['form-09','Den intensjonale fallgruven avviser antatt forfatterhensikt som direkte standard for verkets betydning og verdi.',['sf08']],
  ['form-10','Den affektive fallgruven avgrenser ukontrollert leserreaksjon som verdikriterium, ikke empirisk resepsjonsforskning generelt.',['sf08','sf03']],
  ['form-11','Strukturalistisk analyse forklarer elementer gjennom relasjoner og forskjeller innenfor modellerte systemer.',['sf03','sf06']],
  ['form-12','Saussures skille mellom synkron og diakron analyse har vært grunnleggende for strukturalistisk metode.',['sf06']],
  ['form-13','Propp utviklet en funksjonsanalyse på grunnlag av et avgrenset korpus av russiske undereventyr.',['sf05']],
  ['form-14','Propps modell skiller handlingsfunksjoner fra skiftende figurnavn og lokale motiver.',['sf05']],
  ['form-15','Overføring av en strukturell modell til nye korpus krever eksplisitte kodingsregler og gyldighetsgrenser.',['sf03','sf05']],
  ['form-16','Saussureansk og peirceansk semiotikk bruker ulike tegnmodeller som ikke er terminologisk utskiftbare.',['sf06','sf10']],
  ['form-17','Semiose forbinder tegn, objekt og fortolkende virkning i en videre tegnprosess.',['sf10']],
  ['form-18','Den grønne lykten i «The Great Gatsby» opptrer i skiftende narrative sammenhenger og må analyseres gjennom disse relasjonene.',['sf11']],
  ['form-19','Historiske påstander om tegnbruk krever kilder til historisk konvensjon eller resepsjon i tillegg til nærlesning.',['sf03','sf10']],
  ['form-20','Praha-skolen utviklet formalistiske problemstillinger til en funksjonell og strukturell poetikk.',['sf02']],
  ['form-21','Jakobsons poetiske funksjon retter oppmerksomheten mot organiseringen av selve meldingen.',['sf09']],
  ['form-22','Den poetiske funksjonen kan samvirke med andre kommunikative funksjoner i samme ytring.',['sf09']],
  ['form-23','Dominanten betegner en komponent som organiserer andre komponenter, ikke bare det statistisk hyppigste trekket.',['sf02','sf09']],
  ['form-24','«Mrs Dalloway» organiserer skift mellom figurenes bevisstheter og fortellerdiskurs gjennom romanens komposisjon.',['sf12']],
  ['form-25','Historisert formanalyse må dokumentere den normen eller praksisen et formtrekk sammenlignes med.',['sf02','sf03']],
  ['form-26','Arkiv-, resepsjons- og tekstanalyse svarer på ulike spørsmål og bør ikke behandles som samme evidenstype.',['sf03']],
  ['form-27','Tekststruktur alene kan ikke dokumentere hvordan alle faktiske lesere reagerte eller om et verk forårsaket samfunnsendring.',['sf03']]
].map(([id,claim,source_ids]) => ({id,claim,source_ids,classification:'teori_og_metode',status:'verified'}));

const claimsHermeneutics = [
  ['herm-01','Hermeneutisk forståelse begynner fra historisk og språklig situerte forutsetninger.',['sh01','sh02']],
  ['herm-02','Den hermeneutiske sirkelen beskriver en reviderende relasjon mellom del og helhet.',['sh01','sh02']],
  ['herm-03','Åpningen av «Et dukkehjem» organiserer kjælenavn, økonomi, hemmelighold og rolleframføring i samme scene.',['sh10']],
  ['herm-04','En etterprøvbar fortolkning må vise hvilke tekststeder som støtter og utfordrer helhetshypotesen.',['sh02','sh03']],
  ['herm-05','Forfatterintensjon, tekstlig betydning og faktisk resepsjon er ulike forskningsobjekter med ulike kildebehov.',['sh03','sh04','sh05']],
  ['herm-06','Historiske intensjonspåstander krever dokumenter og konvensjoner knyttet til ytringens situasjon.',['sh03']],
  ['herm-07','Den implisitte leseren er en tekstlig struktur eller rolle og ikke identisk med en faktisk leser.',['sh04']],
  ['herm-08','«Prosessen» begrenser tilgangen til lovens orden og organiserer usikkerhet gjennom fortellingens informasjonsfordeling.',['sh11']],
  ['herm-09','Et intensjonsdokument kan være relevant uten å avgjøre hele verkets senere betydningshistorie.',['sh03','sh05']],
  ['herm-10','Mistankens hermeneutikk undersøker uttrykt mening i lys av fortrengning, ideologi eller makt.',['sh08','sh09']],
  ['herm-11','Symptomatisk lesning trenger lokaliserbare brudd eller fravær og et eksplisitt teoretisk mellomledd.',['sh08']],
  ['herm-12','Overflatelesning betegner flere beskrivende praksiser og er ikke identisk med naiv bokstavelighet.',['sh09']],
  ['herm-13','Postkritikk undersøker blant annet tilknytning, bruk og gjenkjennelse som supplement til mistankebasert kritikk.',['sh08']],
  ['herm-14','Påstander om faktiske leseres tilknytning krever resepsjons- eller bruksdata i tillegg til tekstlige trekk.',['sh04','sh05']],
  ['herm-15','Fortolkningspluralisme utelukker ikke krav om tekstgrunnlag, sammenheng og inferensgrense.',['sh03','sh07']],
  ['herm-16','Overfortolkning gjelder svake forbindelser mellom detaljer og påstander, ikke bare fortolkningens originalitet.',['sh07']],
  ['herm-17','Fortolkningsfellesskap former standarder for relevante trekk og begrunnelser.',['sh06']],
  ['herm-18','Et nåtidig spørsmål til en historisk tekst er ikke i seg selv anakronistisk dersom kategoriforskjellen historiseres.',['sh01']],
  ['herm-19','Virkningshistorie innebærer at tidligere fortolkninger og overleveringsformer allerede preger den aktuelle forståelsen.',['sh01','sh05']],
  ['herm-20','Tekstutgave eller oversettelse må identifiseres når ordlyd og historisk avstand inngår i argumentet.',['sh01']],
  ['herm-21','Aktuell anvendelse av et verk er et annet påstandsnivå enn rekonstruksjon av opprinnelig mening.',['sh01','sh03']],
  ['herm-22','Teori fungerer som et spørsmålsapparat som gjør noen trekk synlige og avgrenser relevante evidenstyper.',['sh02','sh03']],
  ['herm-23','Triangulering krever at ulike evidenstyper beholder sine ulike kilderoller.',['sh04','sh05']],
  ['herm-24','En fortolkningshypotese styrkes ved å angi moteksempler, alternativer og inferensgrense.',['sh03','sh07']]
].map(([id,claim,source_ids]) => ({id,claim,source_ids,classification:'hermeneutikk_og_metode',status:'verified'}));

function writeChapter({id,title,subtitle,lead,coverageTopics,sections,concepts,sources,claims,prefix,examples}) {
  const dir = `${PACKAGE}/foundation_texts/${id}`;
  const moduleFiles = [0,1,2].map((index) => `${dir}/0${index + 1}-${prefix[index]}.json`);
  const grouped = [sections.slice(0,2), sections.slice(2,4), sections.slice(4,6)];
  grouped.forEach((moduleSections, index) => write(moduleFiles[index], {
    schema: 'history_go_literature_foundation_module_v1',
    qualityProfile: 'full_depth_v2',
    id: `${id}-${index + 1}`,
    title: prefix[index].split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' '),
    sections: moduleSections,
    workedExamples: moduleSections.map((section) => ({
      title: `Prøv modellen: ${section.title.replace(/^\d+\.\s*/, '')}`,
      object: examples[section.coverageTopic],
      steps: ['Avgrens tekstversjon og analyseenhet.', 'Registrer tre relevante teksttrekk før teoriord brukes.', 'Formuler en hovedhypotese og en konkurrerende hypotese.', 'Angi hvilken kilde som trengs for å gå utover tekstanalysen.'],
      claimIds: section.paragraphClaimIds.flat().slice(0,3)
    })),
    commonMisconceptions: [{
      claim: 'Teorinavnet er i seg selv en analyse.',
      correction: 'Teorien må operasjonaliseres som spørsmål, tekstobservasjoner, mellomledd og en avgrenset slutning.'
    }, {
      claim: 'Én overbevisende detalj beviser en påstand om hele verket eller perioden.',
      correction: 'Påstandens rekkevidde må svare til analyseenheten, korpuset og kildetypen.'
    }]
  }));
  const conceptFile = `${dir}/concepts.json`;
  const claimsFile = `${dir}/claims.json`;
  write(conceptFile, {schema:'history_go_literature_concept_registry_v1',version:'1.0.0',subject_id:'litteratur',coverage_area_id:id,status:'canonical_full_depth_concepts',concepts});
  write(claimsFile, {schema:'history_go_fagverk_claims_v1',version:'1.0.0',subject_id:'litteratur',chapter_id:id,verified_at:'2026-08-07',verification_status:'verified',sources,claims});
  const wrapper = `${PACKAGE}/foundation_texts/${id}.json`;
  write(wrapper, {
    schema:'history_go_literature_foundation_chapter_v1',version:'1.0.0',qualityProfile:'full_depth_v2',subject:'litteratur',id,title,subtitle,lead,
    coverage_topics:coverageTopics,
    learningObjectives:['skille teoritradisjonene historisk og begrepslig','operasjonalisere teori i kontrollerbare tekstobservasjoner','analysere et navngitt verk med konkurrerende hypoteser','koble faglige påstander til presise kilder','formulere alternativ fortolkning og inferensgrense','kombinere tekst-, kontekst- og resepsjonskilder uten å blande kilderollene'],
    moduleFiles,conceptRegistry:conceptFile,claimsFile,editorial_status:'foundation_text_ready',completion_note:'Alle seks dekningsområder er materialisert som full-dybde-emneartikler med begreper, eksempler og påstandsspor.'
  });
  return wrapper;
}

const formalismWrapper = writeChapter({
  id:area.id,title:area.title,subtitle:'Fra litterært grep til historisert formmodell',
  lead:'Kapittelet følger formorientert litteraturteori fra russisk formalisme og nykritikk til strukturalisme, semiotikk og Praha-skolen. Hver tradisjon skilles fra nabotradisjonene, prøves på navngitte verk og avsluttes med en eksplisitt grense mellom det tekststrukturen kan vise og det som krever historiske eller empiriske kilder.',
  coverageTopics:area.topics,sections:formalismSections,concepts:formalismConcepts,sources:sourcesFormalism,claims:claimsFormalism,
  prefix:['formalisme-og-nykritikk','struktur-og-tegn','funksjon-og-historisering'],
  examples:Object.fromEntries(areaFoundation.topics.map((topic) => [topic.id,topic.example]))
});

const hermeneuticWrapper = writeChapter({
  id:'hermeneutikk_fortolkning_teori',title:'Hermeneutikk, fortolkning og teori',subtitle:'Mening, historisk avstand og begrunnede lesninger',
  lead:'Kapittelet behandler fortolkning som et reviderbart faglig arbeid. Det skiller forfatterintensjon, verkbetydning og resepsjon, sammenligner mistanke-, overflate- og postkritiske lesemåter, og viser hvordan pluralisme kan forenes med krav til tekstgrunnlag, kildespor, moteksempler og tydelige inferensgrenser.',
  coverageTopics:['hermeneutisk_sirkel','intensjon_verk_leser','mistanke_symptom_overflate','fortolkningspluralisme_grenser','anakronisme_historisk_avstand','teori_som_sporsmalsapparat'],
  sections:hermeneuticSections,concepts:hermeneuticConcepts,sources:sourcesHermeneutics,claims:claimsHermeneutics,
  prefix:['forstaelse-og-posisjoner','kritikk-og-grenser','historie-og-sporsmal'],
  examples:{
    hermeneutisk_sirkel:'Henrik Ibsens «Et dukkehjem», første akt i hovedteksten etter førsteutgaven fra 1879.',
    intensjon_verk_leser:'Franz Kafkas «Prosessen», sammenholdt med verkets informasjonsfordeling og dokumenterte resepsjonskilder.',
    mistanke_symptom_overflate:'Charlotte Brontës «Jane Eyre» lest med separate protokoller for symptomatisk lesning og overflatelesning.',
    fortolkningspluralisme_grenser:'Edgar Allan Poes «The Purloined Letter» og de konkurrerende fortolkningsmodellene teksten har utløst.',
    anakronisme_historisk_avstand:'Sofokles’ «Antigone» i identifisert gresk tekst, oversettelse og moderne sceneversjon.',
    teori_som_sporsmalsapparat:'Virginia Woolfs «Mrs Dalloway» undersøkt med form-, bokhistoriske og resepsjonsorienterte evidenstyper.'
  }
});

const coverageFile = `${PACKAGE}/coverage_contract_v1.json`;
const coverage = read(coverageFile);
coverage.completion_definition.required_area_count = 25;
coverage.completion_definition.required_topic_count = 150;
coverage.coverage_areas = coverage.coverage_areas.filter((row) => row.id !== area.id);
const hermeneuticIndex = coverage.coverage_areas.findIndex((row) => row.id === 'hermeneutikk_fortolkning_teori');
coverage.coverage_areas.splice(hermeneuticIndex, 0, area);
const completeIds = new Set(['faggrunnlag_metode_forskningspraksis', area.id, 'hermeneutikk_fortolkning_teori']);
coverage.coverage_areas = coverage.coverage_areas.map((row) => completeIds.has(row.id) ? {...row,status:'chapter_and_overview_text_materialized'} : row);
coverage.progress = {
  areas_total:25,areas_with_foundation_text:25,areas_complete:3,topics_total:150,topics_with_foundation_text:150,topics_complete:18,
  honest_status:'Alle 25 områder og 150 temaer har særskrevet oversiktstekst. Tre områder og 18 temaer har nå full kapitteldybde, definert begrepsapparat, navngitte analyseobjekter og påstandsspor; 22 områder og 132 temaer trenger fortsatt tilsvarende full-dybde-materialisering.'
};
write(coverageFile, coverage);

const topicsFile = `${PACKAGE}/topic_foundations_v1.json`;
const topics = read(topicsFile);
topics.areas = topics.areas.filter((row) => row.id !== area.id);
topics.areas.push(areaFoundation);
const topicById = new Map(topics.areas.map((row) => [row.id,row]));
topics.areas = coverage.coverage_areas.map((row) => topicById.get(row.id));
write(topicsFile, topics);

const indexFile = `${PACKAGE}/index.json`;
const index = read(indexFile);
index.files.foundation_chapters = [...new Set([...(index.files.foundation_chapters || []), formalismWrapper, hermeneuticWrapper].map((file) => file.replace(`${PACKAGE}/`,'')))];
index.summary = {
  coverage_area_count:25,required_topic_count:150,area_synthesis_count:25,topic_foundation_text_count:150,
  materialized_foundation_chapter_count:3,materialized_module_count:9,defined_concept_count:72,
  verified_source_count:34,verified_claim_count:69,completion_status:'theory_core_expanded_22_areas_pending_full_depth'
};
index.release_rule = 'Pakken kan ikke merkes complete før alle 25 dekningsområder har fullverdige emneartikler, definerte begreper, navngitte verk eller objekter, påstandsspor og syntesekapittel. Nye dokumenterte fagfelt skal legges til kontrakten i stedet for å presses inn i overlastede områder.';
write(indexFile, index);

console.log('Materialiserte to full-dybde-kapitler og utvidet Litteratur til 25 områder / 150 temaer.');
