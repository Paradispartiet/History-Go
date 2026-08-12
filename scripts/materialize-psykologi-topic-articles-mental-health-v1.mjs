#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'data/fagverk/psykologi/emneartikler');
const EMNER = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json'), 'utf8'));
const CLAIMS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fagverk/psykologi/psykisk-helse-institusjoner-og-behandling/claims.json'), 'utf8'));
const CLAIM_BY_ID = new Map(CLAIMS.claims.map((claim) => [claim.id, claim]));
const EMNE_BY_ID = new Map(EMNER.map((emne) => [emne.emne_id, emne]));
const DOMAIN_ID = 'psykisk_helse_institusjoner_behandling';
const DOMAIN_IDS = EMNER.filter((emne) => emne.domain === DOMAIN_ID).map((emne) => emne.emne_id).sort();
const EDITORIAL_REVIEW = Object.freeze({
  status: 'approved_non_clinical_educational_use',
  reviewed_at: '2026-08-12',
  reviewer_role: 'psychology_editorial_audit',
  review_standard: 'history_go_psykologi_clinical_safety_v1',
  checks: Object.freeze({
    no_individual_diagnosis: true,
    no_individual_treatment_directive: true,
    no_coercion_recommendation: true,
    no_place_or_group_diagnosis: true,
    educational_scope_explicit: true
  })
});

const method = (methodId, label, application, limitations) => ({ method_id: methodId, label, application, limitations });
const theory = (title, content, sourceIds) => ({ title, content, source_ids: sourceIds });
const boundary = (question, positions, evidenceNeeded) => ({ question, positions, evidence_needed: evidenceNeeded });
const example = (title, analysis, sourceIds, caseStatus = 'documented_teaching_case') => ({ title, analysis, source_ids: sourceIds, case_status: caseStatus });
const model = (name, role, useLimit, sourceIds) => ({ name, role, use_limit: useLimit, source_ids: sourceIds });

const articles = [
  {
    emne_id: 'em_psy_psykisk_helse',
    definition: 'Psykisk helse viser til hvordan mennesker opplever seg selv og andre, fungerer i hverdagen og håndterer belastninger, relasjoner og endring. Feltet omfatter velvære, vansker og kliniske lidelser, men disse nivåene er ikke synonymer. En universitetsfaglig analyse skiller derfor dagliglivets variasjon fra symptomer, funksjonstap og diagnostisk utredning.',
    background: [
      'Begrepet har beveget seg fra et snevert sykdoms- og institusjonsfokus mot et bredere perspektiv på funksjon, deltakelse, livsbetingelser og rettigheter. Denne utvidelsen gjør det mulig å studere psykisk helse uten å gjøre alle negative følelser til sykdom. Samtidig må breddebegrepet ikke bli så uklart at kliniske tilstander, sosial belastning og alminnelige livsreaksjoner blandes sammen.',
      'I Norge finnes hjelpen på flere nivåer. Kommune og fastlege kan være første inngang, mens DPS og sykehus tilbyr mer spesialisert utredning og behandling. Organiseringen viser at psykisk helse både er et individuelt erfaringsfelt og et tjenesteområde. Hvem som møter brukeren, hvor hjelpen gis og hvordan overganger håndteres, er derfor en del av den psykologiske og institusjonelle analysen.',
      'Psykisk helse påvirkes ikke av én enkelt faktor. Biologisk sårbarhet, læringshistorie, relasjoner, materielle vilkår, kultur og aktuelle hendelser kan virke sammen. Faglig arbeid undersøker slike sammenhenger probabilistisk og på flere forklaringsnivåer. Det gir ikke grunnlag for å lese en diagnose ut av et sted, en livshendelse eller en kort observasjon av en person.'
    ],
    theories_and_findings: [
      theory('Kontinuum, kategorier og funksjon', 'Et kontinuumperspektiv beskriver grader av trivsel, belastning og funksjon, mens diagnostiske systemer bruker avgrensede kriterier for bestemte formål. Perspektivene svarer på ulike spørsmål: et kontinuum kan synliggjøre variasjon og forebygging, mens kategorier kan strukturere kommunikasjon og behandling. Ingen av dem gjør en enkelt observasjon til en klinisk konklusjon.', ['src-helsenorge-hva-er','src-helsenorge-voksne']),
      theory('Person- og rettighetsorientert systemperspektiv', 'WHO knytter psykisk helse til personorienterte og menneskerettslige tjenester, sosial inkludering og forbindelser til bolig, utdanning, arbeid og sosial beskyttelse. Det flytter oppmerksomheten fra symptom alene til handlingsrom og deltakelse. Modellen er normativ veiledning for systemutvikling, ikke bevis for at én tjenesteform passer alle personer eller lokale sammenhenger.', ['src-who-guidance','src-who-centres'])
    ],
    methods: [
      method('met_psy_klinisk_analyse','Klinisk begrepsanalyse','Skiller beskrivelse av plager, varighet, funksjon og kontekst fra diagnostisk vurdering og undersøker hvordan kliniske begreper brukes i kilder.','Kan ikke erstatte undersøkelse av et individ og skal ikke brukes til selvdiagnose eller diagnostisering av andre.'),
      method('met_psy_velferdspsykologisk_analyse','Velferdspsykologisk analyse','Kartlegger forbindelser mellom psykisk helse, levekår, deltakelse og tilgang til støtte på tvers av tjenester.','Sammenheng på gruppenivå viser ikke hva som har forårsaket en enkelt persons situasjon.'),
      method('met_psy_normkritisk_analyse','Normkritisk analyse','Undersøker hvilke forestillinger om normalitet, funksjon og ansvar som ligger i språk, tiltak og institusjoner.','Kritikk av normer betyr ikke at lidelse, funksjonstap eller behov for faglig hjelp er uvirkelig.')
    ],
    boundaries_and_disagreements: [
      boundary('Hvor går grensen mellom livsreaksjon og lidelse?',['Et kontinuumperspektiv vektlegger grad og endring.','Et diagnostisk perspektiv vektlegger kriterier, varighet og funksjon.'],'Longitudinell informasjon, funksjon, kontekst og klinisk utredning – ikke ett symptom alene.'),
      boundary('Er psykisk helse primært individuelt eller sosialt?',['Individmodeller undersøker erfaring og regulering.','Systemmodeller undersøker levekår, rettigheter og tjenester.'],'Studier som kobler nivåene uten å redusere det ene til det andre.'),
      boundary('Er fravær av diagnose det samme som god psykisk helse?',['En sykdomsmodell kan bruke fravær av lidelse som minimum.','Et positivt helseperspektiv inkluderer mening, deltakelse og fungering.'],'Tydelige mål på både symptomer, funksjon og positive helseutfall.')
    ],
    examples: [
      example('Fra uro til faglig avgrensning','Helsenorge understreker at angst, uro og nedstemthet kan forekomme som normale livsreaksjoner. Et undervisningscase skal derfor først beskrive varighet, intensitet, funksjon og kontekst, og deretter forklare hvorfor bare klinisk utredning kan avgjøre om en lidelse foreligger.',['src-helsenorge-voksne']),
      example('Community-tjenester som systemcase','Et lokalt tilbud kan analyseres etter nærhet, brukermedvirkning, kobling til bolig og arbeid og hvordan det støtter sosial deltakelse. Analysen vurderer tjenestestruktur opp mot WHO-veiledningen; den klassifiserer ikke brukerne eller påstår at organisasjonsformen alene gir bestemte utfall.',['src-who-guidance','src-who-centres'])
    ],
    learning_outcomes: ['Skille psykisk helse, psykiske vansker og psykisk lidelse.','Analysere individuelle og systemiske forklaringsnivåer sammen.','Vurdere hva observasjon og tjenestedata kan og ikke kan vise.'],
    key_questions: ['Hvilket nivå av psykisk helse beskriver kilden?','Hvordan inngår funksjon, kontekst og varighet i påstanden?','Hvilke alternative forklaringer og tjenester må undersøkes?'],
    models_or_researchers: [model('Kontinuummodellen','Beskriver gradert variasjon i helse og belastning.','Er ikke et diagnostisk instrument.',['src-helsenorge-hva-er','src-helsenorge-voksne']),model('WHO community mental health framework','Knytter personorientering, rettigheter og sosial deltakelse til tjenesteutvikling.','Er normativ systemveiledning, ikke individuell behandlingsanbefaling.',['src-who-guidance','src-who-centres'])],
    claim_ids: ['phi-01','phi-02','phi-03'],
    misuse_guard: 'Artikkelen skal ikke brukes til selvdiagnose, fjernvurdering av andre eller til å slutte fra sted, atferd eller én livshendelse til psykisk lidelse. Den beskriver faglige skiller og tjenestesystemer, ikke individuell helsehjelp.'
  },
  {
    emne_id: 'em_psy_behandling_omsorg',
    definition: 'Behandling og omsorg omfatter planlagte tiltak, relasjonelt arbeid og praktisk støtte som skal redusere vansker, fremme funksjon eller sikre trygghet og verdighet. Begrepene overlapper, men er ikke identiske: behandling har ofte eksplisitte mål og faglige metoder, mens omsorg også gjelder kontinuitet, hverdagsstøtte og ivaretakelse. Begge foregår innen rettslige og institusjonelle rammer.',
    background: [
      'Historisk har psykisk helsehjelp vært organisert gjennom familie, fattigomsorg, asyl, sykehus, poliklinikk og community-baserte tjenester. Endringene handler ikke bare om nye teknikker, men om hvem som regnes som pasient, hvor hjelpen gis, hvilke rettigheter som gjelder og hvordan ansvar fordeles. Derfor må behandlingens historie leses sammen med institusjons- og velferdshistorie.',
      'Dagens norske system skiller mellom kommunale tjenester, fastlege og spesialisthelsetjeneste. Behandling kan inngå i et avgrenset forløp, mens omsorg og oppfølging ofte krysser organisatoriske grenser. Et godt forløp krever derfor koordinering, informasjon og overgangsarbeid, ikke bare korrekt utførelse av én metode i ett møte.',
      'Omsorg kan innebære asymmetri fordi fagpersoner og institusjoner forvalter kunnskap, ressurser og beslutningsmakt. Rettslig regulering og kontrollordninger skal begrense vilkårlighet, særlig ved tvang. Faglig analyse må likevel unngå to forenklinger: at all makt er overgrep, og at et omsorgsformål automatisk gjør enhver praksis legitim.'
    ],
    theories_and_findings: [
      theory('Omsorg som relasjon og system', 'Et relasjonelt perspektiv undersøker tillit, respons og samarbeid, mens systemperspektivet følger ansvar, henvisning og kontinuitet mellom tjenestenivåer. Behandlingsutfall kan ikke forstås bare som en metodeeffekt hvis tilgang, oppfølging eller overganger svikter. Samtidig må organisatorisk kvalitet og individuell effekt måles med forskjellige datakilder.', ['src-helsenorge-voksne','src-helsenorge-forlop','src-helsedir-forlop']),
      theory('Rettigheter, makt og kontroll', 'Psykisk helsevernloven setter menneskerettigheter, rettssikkerhet og begrensning av tvang inn i formålet for vernet. Kontrollkommisjonen og klageordninger viser at behandlingsorganisasjonen ikke kontrollerer seg selv alene. Rettslig gyldighet, faglig forsvarlighet og personens opplevelse er tre ulike vurderinger som kan undersøkes sammen uten å blandes.', ['src-phvl-2026','src-phvf-2026','src-helsedir-kontroll','src-helsedir-parorende'])
    ],
    methods: [
      method('met_psy_systemanalyse','Systemanalyse','Følger ansvar, beslutninger og overganger mellom kommune, fastlege, DPS, sykehus og kontrollinstanser.','Et organisasjonskart sier ikke alene hvordan hjelpen faktisk oppleves eller virker.'),
      method('met_psy_makt_og_omsorgsanalyse','Makt- og omsorgsanalyse','Skiller omsorgsmål, faglig myndighet, rettslig hjemmel og kontroll og undersøker hvem som kan påvirke beslutninger.','Skal ikke avgjøre lovlighet eller behandlingsbehov i en individuell sak.'),
      method('met_psy_praksisanalyse','Praksisanalyse','Undersøker hvordan planer, møter og oppfølging gjennomføres i dokumentert praksis.','Retningslinjer viser forventet praksis, ikke automatisk hva som skjedde i hvert møte.')
    ],
    boundaries_and_disagreements: [
      boundary('Når er støtte behandling?',['Behandling har definerte mål og faglig begrunnelse.','Omsorg kan være vedvarende støtte uten avgrenset behandlingsprotokoll.'],'Dokumentasjon av mål, ansvar, metode og evalueringsform.'),
      boundary('Kan omsorg være kontroll?',['Kontroll kan begrunnes med sikkerhet og ansvar.','Asymmetri kan begrense autonomi og medvirkning.'],'Rettsgrunnlag, proporsjonalitet, personens erfaring og uavhengig kontroll.'),
      boundary('Hva teller som et godt forløp?',['Tjenesteperspektivet kan vektlegge koordinering.','Pasientperspektivet kan vektlegge relevans, kontinuitet og medvirkning.'],'Kombinasjon av prosessmål, utfall, erfaringer og frafall.')
    ],
    examples: [
      example('Overgang fra DPS til kommune','Et undervisningscase følger hvem som planlegger utskrivning, hvordan informasjon deles, hva kommunen overtar og hvordan pasientens mål inngår. Caset viser at kontinuitet er et selvstendig kvalitetsproblem, uten å evaluere en bestemt persons behandling.',['src-helsedir-forlop','src-helsenorge-forlop']),
      example('Kontrollkommisjonen som institusjonelt korrektiv','Tvangsvern analyseres gjennom skille mellom behandlingsstedets vedtak, lovens vilkår, klage og kontrollkommisjonens rettssikkerhetsoppgave. Eksemplet brukes til å forstå institusjonell maktfordeling, ikke til å lære lekfolk å vurdere tvangsvilkår.',['src-phvl-2026','src-phvf-2026','src-helsedir-kontroll'])
    ],
    learning_outcomes: ['Skille behandling, omsorg og oppfølging.','Analysere makt og rettigheter uten å redusere all omsorg til kontroll.','Kartlegge kontinuitet og ansvar mellom tjenester.'],
    key_questions: ['Hva er tiltakets mål og hvem har ansvar?','Hvordan sikres medvirkning og uavhengig kontroll?','Hvilke data viser prosess, erfaring og utfall?'],
    models_or_researchers: [model('Nasjonalt pasientforløp','Strukturerer utredning, behandling, evaluering og overgang.','Beskriver forventet forløp, ikke garantert individuell erfaring.',['src-helsedir-forlop']),model('Rettighetsbasert omsorgsmodell','Knytter støtte til autonomi, verdighet og kontroll med makt.','Avgjør ikke kliniske eller rettslige spørsmål i enkeltsaker.',['src-phvl-2026','src-who-guidance'])],
    claim_ids: ['phi-04','phi-05','phi-06','phi-16','phi-17','phi-18'],
    misuse_guard: 'Artikkelen gir ikke råd om individuell behandling og kan ikke brukes til å vurdere om en person trenger innleggelse eller oppfyller vilkår for tvang. Historiske, rettslige og organisatoriske beskrivelser må dateres og holdes fra hverandre.'
  },
  {
    emne_id: 'em_psy_behandlingsformer',
    definition: 'Behandlingsformer er systematiske måter å organisere psykologisk, sosial, medikamentell, biologisk eller sammensatt hjelp på. De skiller seg i teori, mål, målgruppe, intensitet, setting og hvordan endring vurderes. Universitetsfaglig sammenligning spør derfor ikke bare «virker det?», men for hvem, mot hva, sammenlignet med hva, under hvilke betingelser og med hvilke uønskede virkninger.',
    background: [
      'Psykisk helsefeltet rommer psykoterapi, medikamentell behandling, miljøterapi, rehabilitering, familie- og nettverkstiltak, digitale programmer og kombinasjoner. Kategoriene er brede, og samme navn kan dekke ulike prosedyrer. En behandlingsform må derfor beskrives gjennom konkrete komponenter, kompetansekrav og gjennomføringsramme.',
      'Historiske institusjoner viser at behandlingsformer endres med kunnskap, teknologi, lovverk og syn på pasientrollen. En metode som finnes i et museum eller arkiv er dokumentasjon på fortidig praksis, ikke på dagens anbefaling. Omvendt bør nåtidens praksis heller ikke fremstilles som historiens uunngåelige sluttpunkt.',
      'Evidensgrunnlag bygges av flere typer studier: kontrollerte forsøk kan anslå gjennomsnittlig effekt, naturalistiske data kan vise praksisnær gjennomføring, kvalitative studier kan undersøke erfaring, og skade-/frafallsdata kan synliggjøre kostnader. Ingen enkelt studiedesign svarer på alle spørsmål om behandling.'
    ],
    theories_and_findings: [
      theory('Spesifikke mekanismer og fellesfaktorer', 'Behandlingsmodeller beskriver ofte spesifikke endringsmekanismer, som eksponering, kognitiv omstrukturering eller endring i relasjonelle mønstre. Fellesfaktorperspektiver fremhever blant annet samarbeidsramme, forventning og terapeutisk relasjon. Perspektivene er ikke nødvendigvis gjensidig utelukkende, men krever studier som kan skille metodekomponent, kontekst og seleksjon.', ['src-helsenorge-ebehandling','src-helsedir-psykiatri','src-helsedir-forlop']),
      theory('Tilpasning, medvirkning og evaluering', 'Nasjonale pasientforløp legger opp til at behandling planlegges og evalueres sammen med pasienten. Dette innebærer at manualetterlevelse ikke alene definerer kvalitet; mål, respons, bivirkninger, preferanser og endret behov må også følges. Medvirkning betyr ikke at alle metoder er like dokumenterte, men at fagkunnskap brukes i en åpen beslutningsprosess.', ['src-helsedir-forlop','src-helsedir-medvirkning'])
    ],
    methods: [
      method('met_psy_klinisk_analyse','Komparativ klinisk analyse','Sammenligner målgruppe, komponenter, dose, setting, kontrollbetingelse og målte utfall på tvers av behandlinger.','Gjennomsnittseffekt for en definert gruppe forutsier ikke sikkert effekt for et individ.'),
      method('met_psy_praksisanalyse','Implementerings- og praksisanalyse','Undersøker kompetanse, tilgang, gjennomføring, frafall og hvordan tiltaket tilpasses i ordinære tjenester.','Praksisdata har ofte seleksjon og mangler den kontrollen som trengs for sterke kausale konklusjoner.'),
      method('met_psy_behandlingshistorisk_analyse','Behandlingshistorisk analyse','Daterer metode, begrunnelse, institusjon og rettslig ramme og sammenligner endring over tid.','Historisk forekomst er verken bevis for effekt eller tilstrekkelig grunnlag for moralsk dom uten kontekst.')
    ],
    boundaries_and_disagreements: [
      boundary('Er én behandlingsform best?',['Modellspesifikke perspektiver forventer ulik effekt gjennom ulike mekanismer.','Fellesfaktorperspektiver forventer betydelig overlapp.'],'Direkte sammenligninger, mekanismemål, moderatorer, frafall og skadeutfall.'),
      boundary('Hvor mye skal behandling individualiseres?',['Standardisering beskytter etterprøvbarhet og opplæring.','Tilpasning kan møte komorbiditet, preferanser og kontekst.'],'Forhåndsdefinerte tilpasningsregler og data på både integritet og resultat.'),
      boundary('Hva teller som effekt?',['Symptomreduksjon er et vanlig endepunkt.','Funksjon, livskvalitet, måloppnåelse og uønskede virkninger kan være like viktige.'],'Flere utfall, relevante tidspunkter og åpen rapportering av frafall og skade.')
    ],
    examples: [
      example('Veiledet eBehandling','Helsenorge beskriver eBehandling som et digitalt program med behandleroppfølging for bestemte tilstander. Caset kan sammenligne tilgjengelighet, struktur og kontaktform med fysisk behandling, men skal ikke omtales som selvhjelp eller universell løsning.',['src-helsenorge-ebehandling']),
      example('Historiske behandlingsrom ved Dikemark','Museets fremstilling kan brukes til å identifisere redskaper, rom og skiftende praksiser. En separat nåtidskilde er nødvendig før noe beskrives som gjeldende behandling; museet dokumenterer historie, ikke klinisk anbefaling.',['src-ous-dikemark','src-helsedir-forlop'])
    ],
    learning_outcomes: ['Sammenligne behandlingsformer etter målgruppe, mekanisme og evidens.','Skille gjennomsnittlig effekt fra individuell anbefaling.','Datere historiske praksiser og vurdere flere typer utfall.'],
    key_questions: ['Hva består behandlingen faktisk av?','Hvilken sammenligning og hvilke utfall støtter påstanden?','Hvordan håndteres preferanser, frafall og uønskede virkninger?'],
    models_or_researchers: [model('Kognitiv atferdsterapi','Knytter strukturert arbeid med tanker og atferd til spesifikke problemer.','Navnet dekker flere protokoller og er ingen individuell anbefaling.',['src-helsenorge-ebehandling','src-helsedir-psykiatri']),model('Fellesfaktorperspektivet','Undersøker endringsbetingelser som går på tvers av terapiretninger.','Må ikke brukes til å hevde at metode og kompetanse er irrelevante.',['src-helsedir-forlop','src-helsedir-medvirkning'])],
    claim_ids: ['phi-07','phi-08','phi-09'],
    misuse_guard: 'Artikkelen skal ikke rangere behandlinger uten definert målgruppe, sammenligning og utfall, og den gir ingen individuell behandlingsanbefaling. Historisk praksis må aldri presenteres som dagens standard uten en separat aktuell kilde.'
  },
  {
    emne_id: 'em_psy_byrom_psykisk_helse',
    definition: 'Byrom og psykisk helse undersøker hvordan fysiske omgivelser, transport, møteplasser, bolig, tjenester og sosial deltakelse inngår i menneskers handlingsrom og belastninger. Feltet handler om sannsynlige sammenhenger på flere nivåer, ikke om at et område har én «psykisk profil». Stedsdata kan beskrive eksponering og tilgang, men diagnostiserer verken individer eller nabolag.',
    background: [
      'Urbanisering har gjort spørsmål om tetthet, støy, grøntområder, mobilitet, trygghet, sosial isolasjon og ulikhet sentrale. Slike forhold samvarierer ofte, og mennesker velger eller tildeles bosted gjennom prosesser som også henger sammen med helse. En robust analyse må derfor håndtere seleksjon, konfundering og forskjellen mellom objektive målinger og opplevd miljø.',
      'Psykiske helsetjenester har også en geografi. Kommune, fastlege, DPS, sykehus, oppsøkende team og digitale tilbud stiller ulike krav til reise, henvisning, åpningstid og privat rom. Tilgang er dermed mer enn kilometeravstand: økonomi, språk, funksjon, digital kompetanse og tillit kan endre den reelle terskelen.',
      'Community-perspektivet flytter støtte nærmere hverdagslivet og knytter helse til bolig, utdanning, arbeid og sosial deltakelse. Dette kan motvirke institusjonell isolasjon, men desentralisering garanterer ikke kapasitet, kontinuitet eller kvalitet. Lokale tjenester må undersøkes empirisk i sin konkrete organisasjon.'
    ],
    theories_and_findings: [
      theory('Miljøbelastning, restitusjon og handlingsrom', 'Miljøpsykologiske modeller undersøker hvordan krav som støy, trengsel eller uforutsigbarhet kan belaste oppmerksomhet og regulering, og hvordan grøntområder, orienterbarhet og trygge møteplasser kan støtte restitusjon. Sammenhenger varierer med person, tid, bruk og sosial kontekst; fysisk design er derfor ikke en enkel behandling.', ['src-who-guidance','src-who-centres']),
      theory('Tjenestegeografi og community-støtte', 'WHO beskriver community-baserte og oppsøkende tjenester som støtte nær hjem og offentlige miljøer. I Norge finnes innganger via kommune og fastlege samt mer spesialiserte tilbud. Analysen følger terskler, ansvar og overganger og skiller dokumentert tilgang fra antatt eller ønsket tilgjengelighet.', ['src-helsenorge-voksne','src-helsenorge-forlop','src-who-outreach'])
    ],
    methods: [
      method('met_psy_steds_og_institusjonsanalyse','Steds- og institusjonsanalyse','Kobler romlige data om tjenester, transport og møteplasser til dokumentert organisering og bruk.','Kartnærhet er ikke det samme som faktisk tilgang, kvalitet eller helseutfall.'),
      method('met_psy_velferdspsykologisk_analyse','Velferdspsykologisk analyse','Undersøker hvordan bolig, arbeid, utdanning og sosial beskyttelse inngår i handlingsrommet rundt psykisk helse.','Gruppemønstre kan ikke brukes til å karakterisere den enkelte beboer.'),
      method('met_psy_offentlighetsanalyse','Offentlighetsanalyse','Studerer hvem som kan bruke møteplasser, hvilke normer som gjelder og hvordan synlighet, trygghet og stigma virker.','Observasjon i offentlig rom gir ikke tilgang til menneskers diagnose, motiv eller private erfaring.')
    ],
    boundaries_and_disagreements: [
      boundary('Har bymiljøet en kausal effekt?',['Eksponeringsmodeller vektlegger støy, trengsel og ressurser.','Seleksjonsmodeller vektlegger hvem som flytter eller blir boende hvor.'],'Longitudinelle eller naturlige eksperimenter med gode mål på seleksjon og samtidige forhold.'),
      boundary('Er nærhet det samme som tilgang?',['Geografisk analyse måler avstand og reisetid.','Tjenesteperspektivet inkluderer kapasitet, henvisning, språk og tillit.'],'Kombinerte kart-, tjeneste- og brukerdata.'),
      boundary('Er community-tjenester alltid bedre?',['Nærhet og deltakelse kan redusere institusjonell isolasjon.','Desentralisering kan gi fragmentering eller ulik kapasitet.'],'Sammenlign kontinuitet, erfaring, rettigheter og utfall i konkrete systemer.')
    ],
    examples: [
      example('Oppsøkende team i nærmiljøet','Helsenorge beskriver hjelp i hjem eller nærmiljø for personer som ikke kan møte opp selv. Et stedsstudium kan kartlegge dekningsområde og samarbeidslinjer, men ikke anta hvem som bruker tilbudet eller hvorfor.',['src-helsenorge-voksne','src-who-outreach']),
      example('Psykologisk institutt som fagmiljøcase','UiO-stedet kan brukes til å undersøke utdanning og forskning i byen. Det skal ikke omtales som generelt behandlingssted eller brukes som proxy for psykisk helse i området rundt.',['src-hg-uio-place'], 'materialized_history_go_place')
    ],
    learning_outcomes: ['Analysere bymiljø og tjenester uten økologisk feilslutning.','Skille geografisk nærhet fra reell tilgang.','Vurdere seleksjon, konfundering og flernivåforklaringer.'],
    key_questions: ['Hvilken eksponering eller tilgang er faktisk målt?','Gjelder funnet individ, gruppe, sted eller system?','Hvilke seleksjonsprosesser og alternative forklaringer finnes?'],
    models_or_researchers: [model('Miljøbelastningsmodellen','Knytter vedvarende miljøkrav til belastning og reguleringsbehov.','Gir ikke en diagnose av sted eller beboere.',['src-who-guidance']),model('WHO community mental health framework','Knytter tjenester til hverdagsliv, rettigheter og sosial deltakelse.','Må undersøkes mot lokal kapasitet og praksis.',['src-who-guidance','src-who-outreach'])],
    claim_ids: ['phi-04','phi-05','phi-06','phi-25','phi-26','phi-27'],
    misuse_guard: 'Artikkelen skal ikke rangere nabolag etter psykisk helse, diagnostisere beboere eller framstille én miljøfaktor som tilstrekkelig årsak. Bare materialiserte History Go-steder kan omtales som runtime-steder; øvrige institusjoner er dokumenterte fagcase.'
  },
  {
    emne_id: 'em_psy_institusjoner_psykiatri',
    definition: 'Institusjoner og psykiatri studerer hvordan bygninger, profesjoner, lovverk, klassifikasjon og behandlingspraksis organiserer psykisk helsevern over tid. Institusjonen er både et fysisk anlegg og et system av roller, rutiner og beslutninger. Historisk analyse må datere hvert lag og skille arkitektur, organisasjon, pasienterfaring og behandlingsform.',
    background: [
      'Før moderne spesialisthelsetjeneste ble mennesker med alvorlige vansker ivaretatt gjennom hushold, fattigvesen og ulike former for forvaring og pleie. 1800-tallets asyler samlet behandling, kontroll og dagligliv i formålsbygde anlegg. Denne institusjonaliseringen skapte nye profesjonelle og administrative kategorier, men erfaringene varierte med tid, sted, klasse, kjønn og rettslig status.',
      'Gaustad, Dikemark og Vinderen viser ulike institusjonelle faser i Oslo-området. Gaustad åpnet som formålsbygd psykiatrisk sykehus i 1855, Dikemark utviklet et omfattende anlegg fra 1905, og Vinderen åpnet som universitetsklinikk i 1926. De kan sammenlignes, men utgjør ikke en enkel rekke fra «dårlig» til «god» psykiatri.',
      'Avinstitusjonalisering flyttet mer behandling og støtte til polikliniske og community-baserte tjenester. Store institusjoner forsvant ikke bare; funksjoner ble omorganisert og nye terskler og fragmenteringer kunne oppstå. Institusjonskritikk må derfor følge hva som faktisk skjedde med ansvar, bolig, støtte, akuttkapasitet og rettigheter.'
    ],
    theories_and_findings: [
      theory('Institusjon som behandlingsmiljø og maktstruktur', 'Institusjoner gjør hjelp mulig gjennom ressurser, kompetanse og kontinuitet, men produserer også asymmetri, kategorier og kontroll. En maktanalyse undersøker hvem som definerer behov, fordeler rom og tid og kan fatte vedtak. Den må kombineres med kilder om pasienterfaring og praksis for ikke å redusere hele institusjonen til ett abstrakt maktbegrep.', ['src-phvl-2026','src-helsedir-kontroll','src-ous-dikemark']),
      theory('Fra asyl til differensiert tjenestenettverk', 'Historien kan leses som differensiering av undervisning, forskning, døgnbehandling, poliklinikk og kommunal støtte. Gaustad, Dikemark og Vinderen viser at funksjoner har flyttet og blitt omorganisert. En slik modell er mer presis enn en fremskrittsfortelling, fordi rettigheter, kapasitet og erfaring må dokumenteres separat for hver periode.', ['src-oslobyleksikon-gaustad','src-ous-dikemark','src-oslobyleksikon-vinderen'])
    ],
    methods: [
      method('met_psy_institusjonshistorisk_analyse','Institusjonshistorisk analyse','Daterer bygg, organisatorisk mandat, profesjoner, pasientgrupper og rettslige rammer ved hjelp av flere kildetyper.','Institusjonens egen historieskriving kan utelate konflikt og pasientperspektiv.'),
      method('met_psy_steds_og_institusjonsanalyse','Steds- og institusjonsanalyse','Leser plan, avstand, romfunksjon og forbindelser til byen sammen med dokumentert praksis.','Arkitektur alene viser ikke hva mennesker opplevde eller hvilken behandling som foregikk.'),
      method('met_psy_behandlingshistorisk_analyse','Behandlingshistorisk analyse','Skiller historiske metoder, begrunnelser og materiell praksis fra dagens standard.','Retrospektiv diagnose og moralsk vurdering uten tidskontekst skal unngås.')
    ],
    boundaries_and_disagreements: [
      boundary('Var asylet behandling eller kontroll?',['Reformhistorier fremhever pleie og orden sammenlignet med tidligere vilkår.','Kritiske historier fremhever isolasjon, makt og rettighetstap.'],'Samtidige regler, journaler, materiell kultur og pasientstemmer fra samme tid og sted.'),
      boundary('Er avinstitusjonalisering frigjøring?',['Community-perspektivet fremhever deltakelse og nærhet.','Systemkritikk peker på fragmentering, boligproblemer og utilstrekkelig støtte.'],'Data om faktiske tjenester, kontinuitet, rettigheter, levekår og erfaring.'),
      boundary('Hva kan en bygning fortelle?',['Rom og lokalisering materialiserer institusjonelle idealer.','Praksis kan avvike fra arkitektonisk program.'],'Koble bygningsanalyse til daterte praksis- og erfaringskilder.')
    ],
    examples: [
      example('Gaustad sykehus','Gaustads åpning i 1855 og formålsbygde anlegg brukes til å undersøke hvordan institusjonsidé ble materialisert. Caset krever separate kilder for senere organisasjon og dagens bruk.',['src-oslobyleksikon-gaustad']),
      example('Dikemark museum og hverdagspraksis','Museet dokumenterer pasientarbeid, isolat, kjøkken, vaktrom og behandlingshistorie fra 1905. Utstillingen analyseres som kuratert kilde og sammenholdes med andre perspektiver; den er ikke dagens kliniske fasit.',['src-ous-dikemark']),
      example('Vinderen som universitetsklinikk','Åpningen i 1926 og overtakelsen av undervisningsoppgaver fra Gaustad viser hvordan klinikk, utdanning og forskning ble omorganisert. Det er et institusjonshistorisk skifte, ikke bevis for en total faglig revolusjon.',['src-oslobyleksikon-vinderen'])
    ],
    learning_outcomes: ['Datere institusjonelle lag og praksiser.','Sammenligne Gaustad, Dikemark og Vinderen uten lineær fremskrittsmyte.','Kombinere arkitektur-, organisasjons- og erfaringskilder.'],
    key_questions: ['Hvilken funksjon hadde institusjonen i den aktuelle perioden?','Hvem produserte kilden, og hvilket perspektiv mangler?','Hvordan hang rom, lovverk og praksis sammen?'],
    models_or_researchers: [model('Asylmodellen','Samler bolig, behandling, arbeid og kontroll i ett institusjonelt anlegg.','Varierte historisk og kan ikke beskrives som én uforandret praksis.',['src-oslobyleksikon-gaustad','src-ous-dikemark']),model('Community-modellen','Flytter støtte mot hverdagsliv og differensierte tjenester.','Nærhet garanterer ikke kapasitet eller kontinuitet.',['src-who-guidance','src-who-centres'])],
    claim_ids: ['phi-19','phi-20','phi-21'],
    misuse_guard: 'Artikkelen skal ikke retrospektivt diagnostisere historiske personer, presentere institusjonshistorien som én lineær fremskrittsstige eller lese behandling og erfaring direkte ut av arkitektur. Historisk og nåværende praksis krever separate kilder.'
  },
  {
    emne_id: 'em_psy_krise_intervensjon',
    definition: 'Kriseintervensjon er tidsavgrenset støtte og organisert respons når belastning, risiko eller funksjon krever rask vurdering og hjelp. Fagfeltet skiller akutte kontaktveier, psykososial støtte, klinisk vurdering og videre oppfølging. Et undervisningsverk kan beskrive systemet og forskningsprinsipper, men skal ikke utføre individuell triage.',
    background: [
      'Krise er ikke én diagnose. Begrepet kan vise til akutt overbelastning, fare, tap av funksjon eller en situasjon der vanlige mestringsressurser ikke strekker til. Reaksjoner varierer, og mange stabiliseres med tid og støtte. Intervensjon må derfor tilpasses situasjon, sikkerhet, ønsker og behov og ikke bygge på at alle reagerer likt.',
      'Hjelpesystemet fordeler ansvar etter hastegrad og behov. Helsenorge skiller kritiske situasjoner fra mindre akutte behov og beskriver 113, legevakt, fastlege, kommune og spesialisthelsetjeneste som ulike kontaktveier. Slike opplysninger er tidsavhengige og deskriptive; de gjør ikke et læringssystem til helsetjeneste.',
      'Etter den akutte fasen blir kontinuitet sentral. Overgang til fastlege, kommune, DPS, nettverk eller annen støtte må planlegges slik at ansvar ikke forsvinner. Kriseintervensjon bør derfor studeres som forløp før, under og etter den akutte kontakten, med oppmerksomhet på rettigheter og personens egen forståelse.'
    ],
    theories_and_findings: [
      theory('Stabilisering, behov og minst mulig inngripen', 'Krisemodeller prioriterer sikkerhet, orientering, praktisk støtte og kobling til relevante tjenester framfor omfattende fortolkning i det akutte øyeblikket. WHO fremhever person- og rettighetsorienterte tjenester. Prinsippene må anvendes av kompetente tjenester og kan ikke oversettes til en universell oppskrift for lekpersoner.', ['src-who-crisis','src-helsenorge-voksne']),
      theory('Krise som forløp og systemovergang', 'En akutt kontakt løser ikke nødvendigvis behovet som utløste krisen. Nasjonale pasientforløp legger vekt på samhandling og videre oppfølging. Systemperspektivet undersøker derfor hvem som overtar ansvar, hvordan informasjon og mål følger personen og hvor brudd kan oppstå.', ['src-helsedir-forlop','src-helsenorge-forlop'])
    ],
    methods: [
      method('met_psy_krisepsykologisk_analyse','Krisepsykologisk analyse','Skiller hendelse, akutt reaksjon, risikovurdering, støttebehov og videre forløp i daterte kilder.','Kan ikke brukes av artikkelen til å vurdere en faktisk persons sikkerhet eller behandlingsbehov.'),
      method('met_psy_systemanalyse','Forløps- og systemanalyse','Kartlegger kontaktveier, ansvar og overganger mellom akuttjenester og videre støtte.','Formelle prosedyrer viser ikke automatisk faktisk kapasitet eller erfaring.'),
      method('met_psy_risiko_og_resiliensanalyse','Risiko- og resiliensanalyse','Undersøker risiko- og beskyttelsesfaktorer som sannsynlighetsforhold over tid.','En risikofaktor er ikke en dom over individet, og resiliens betyr ikke fravær av støttebehov.')
    ],
    boundaries_and_disagreements: [
      boundary('Hvor mye skal gjøres umiddelbart?',['Tidlig støtte kan møte praktiske og emosjonelle behov.','For standardisert eller påtrengende bearbeiding kan overse variasjon og ønsker.'],'Studier av tidspunkt, målgruppe, frivillighet, skade og langtidsutfall.'),
      boundary('Når slutter krisen?',['Akuttjenesten avgrenser etter umiddelbar fare og stabilisering.','Forløpsperspektivet følger funksjon og støttebehov videre.'],'Longitudinelle data og tydelig ansvar ved overganger.'),
      boundary('Er krisereaksjon sykdom?',['Reaksjoner kan være forventelige etter ekstrem belastning.','Noen utvikler vedvarende vansker som krever utredning.'],'Varighet, funksjon, utvikling og klinisk vurdering – ikke hendelsen alene.')
    ],
    examples: [
      example('Kontaktveier ved ulik hastegrad','Helsenorge beskriver 113 ved kritisk fare og legevakt ved mindre akutte situasjoner. I artikkelen brukes dette bare til å vise systemdifferensiering; den foretar ikke triage og bør alltid peke til den aktuelle offisielle siden.',['src-helsenorge-voksne']),
      example('Overgang etter akutt kontakt','Et case følger hvordan ansvar kan flyttes fra akuttjeneste til fastlege, kommune eller spesialisthelsetjeneste. Kvaliteten undersøkes gjennom avtalt ansvar, informasjon og pasientmedvirkning, ikke bare om en henvisning ble sendt.',['src-helsedir-forlop'])
    ],
    learning_outcomes: ['Skille krise, akutt fare og diagnose.','Analysere kontaktveier uten å gi individuell triage.','Følge ansvar og kontinuitet etter akuttfasen.'],
    key_questions: ['Hvilken tidsfase og hvilket ansvar beskrives?','Er påstanden normativ veiledning eller faktisk tjenestepraksis?','Hvordan ivaretas frivillighet, rettigheter og videre oppfølging?'],
    models_or_researchers: [model('Person- og rettighetsorientert krisemodell','Prioriterer verdighet, støtte og menneskerettigheter i krisetjenester.','Er systemveiledning, ikke en lekpersonprotokoll.',['src-who-crisis']),model('Forløpsmodellen','Ser akutt hjelp og videre oppfølging som sammenhengende ansvarskjede.','Et formelt forløp garanterer ikke kontinuitet i praksis.',['src-helsedir-forlop'])],
    claim_ids: ['phi-22','phi-23','phi-24'],
    misuse_guard: 'Artikkelen skal aldri brukes til individuell triage, risikovurdering eller råd i en aktuell krise. Kontaktopplysninger og lovverk må hentes fra oppdatert offisiell kilde. En krise eller traumatisk hendelse er ikke i seg selv en diagnose.'
  },
  {
    emne_id: 'em_psy_makt_omsorg',
    definition: 'Makt og omsorg undersøker hvordan hjelp alltid foregår innen relasjoner der kunnskap, ressurser og beslutningsrett er ulikt fordelt. Makt kan gjøre beskyttelse og koordinering mulig, men kan også begrense autonomi eller skjule tvang. Omsorgens legitimitet må derfor vurderes gjennom formål, medvirkning, rettsgrunnlag, proporsjonalitet, erfaring og uavhengig kontroll.',
    background: [
      'Psykisk helsefeltet har historisk koblet behandling, forvaring, sosial orden og velferd. Institusjoner kunne tilby beskyttelse og ressurser samtidig som de kontrollerte rom, tid, kommunikasjon og bevegelse. Denne dobbeltheten gjør det utilstrekkelig å beskrive praksis bare fra institusjonens formål eller bare fra en abstrakt kritikk av all autoritet.',
      'Moderne rettighetsrammer begrenser hva tjenester kan gjøre og etablerer prosedyrer for vedtak, klage og kontroll. Psykisk helsevernloven framhever menneskerettigheter, rettssikkerhet og begrensning av tvang. Kontrollkommisjoner og pårørenderettigheter viser at beslutningsmakt skal kunne etterprøves utenfor behandlingsrelasjonen.',
      'Makt finnes også i frivillig behandling gjennom journalspråk, tidsrammer, tilgang, profesjonelle kategorier og hvem som definerer mål. Medvirkning kan redusere asymmetri, men opphever ikke fagpersonens ansvar eller systemets prioriteringer. Analyse må undersøke faktisk beslutningsprosess og ikke nøye seg med at ordet «medvirkning» står i et dokument.'
    ],
    theories_and_findings: [
      theory('Institusjonell og relasjonell makt', 'Institusjonell makt ligger i regler, adgang, kategorier og vedtaksmyndighet, mens relasjonell makt oppstår i møtet mellom mennesker. Nivåene virker sammen, men må undersøkes med ulike kilder. En vennlig relasjon kan inngå i et tvangssystem, og et rettighetsorientert system kan likevel oppleves dårlig i et konkret møte.', ['src-phvl-2026','src-phvf-2026','src-helsedir-kontroll']),
      theory('Autonomi, omsorgsplikt og rettssikkerhet', 'Etikk og rett balanserer personens autonomi mot tjenestens ansvar for forsvarlig hjelp og sikkerhet. Loven setter vilkår, men artikkelen avgjør ikke hvordan de slår ut i en enkeltsak. Faglig analyse skiller moralsk begrunnelse, juridisk hjemmel, klinisk vurdering og personens erfaring.', ['src-phvl-2026','src-helsenorge-tvang','src-helsedir-parorende'])
    ],
    methods: [
      method('met_psy_makt_og_omsorgsanalyse','Makt- og omsorgsanalyse','Kartlegger hvem som definerer problemer, fordeler ressurser, kan fatte vedtak og kontrollerer beslutningen.','Skal ikke brukes til å erklære en individuell avgjørelse lovlig, ulovlig eller klinisk riktig.'),
      method('met_psy_normkritisk_analyse','Normkritisk analyse','Undersøker hvordan normalitet, risiko, samarbeid og ansvar framstilles i språk og praksis.','Normkritikk betyr ikke at alle vurderinger er vilkårlige eller at skade og lidelse bare er sosiale konstruksjoner.'),
      method('met_psy_systemanalyse','Rettssikkerhetsanalyse','Følger vedtak, dokumentasjon, klage, kontroll og pårørenderoller som institusjonell kjede.','Formell prosedyre sier ikke alene om personen ble hørt eller hvordan inngrepet virket.')
    ],
    boundaries_and_disagreements: [
      boundary('Kan tvang være omsorg?',['Omsorgsplikt kan begrunne inngrep under strenge vilkår.','Tvang innebærer tap av autonomi og risiko for skade.'],'Rettsgrunnlag, alternativer, proporsjonalitet, erfaring, utfall og uavhengig kontroll.'),
      boundary('Er profesjonell kunnskap i seg selv maktmisbruk?',['Ekspertise er nødvendig for faglig vurdering.','Ekspertise kan lukke beslutninger og marginalisere erfaringskunnskap.'],'Åpen begrunnelse, medvirkning, klageadgang og sammenstilling av kunnskapsformer.'),
      boundary('Hvordan måles god omsorg?',['Tjenesten kan måle forsvarlighet og prosess.','Brukeren kan vektlegge verdighet, relevans og kontroll.'],'Kombiner rettslige, kliniske, prosessuelle og erfaringsbaserte data.')
    ],
    examples: [
      example('Kontrollkommisjonens rolle','Et institusjonscase følger forskjellen mellom behandlingsansvar og kontrollkommisjonens oppgaver. Det viser hvorfor makt skal etterprøves, uten å konkludere om en bestemt klage eller persons rettsstilling.',['src-helsedir-kontroll','src-phvl-2026']),
      example('Pårørende og informasjonsgrenser','Pårørende kan ha rettigheter og viktige omsorgsroller, samtidig som pasientens personvern og selvbestemmelse gjelder. Caset undersøker rolle- og informasjonsgrenser framfor å anta at familieinvolvering alltid er riktig eller galt.',['src-helsedir-parorende','src-helsenorge-hjelp'])
    ],
    learning_outcomes: ['Skille relasjonell, institusjonell og rettslig makt.','Analysere omsorg uten å anta at formål legitimerer alle virkemidler.','Identifisere kontroll- og klageordninger.'],
    key_questions: ['Hvem har beslutningsrett, og på hvilket grunnlag?','Hvilke alternativer og kontrollmekanismer finnes?','Hvordan inngår personens og pårørendes perspektiv?'],
    models_or_researchers: [model('Rettssikkerhetsmodellen','Fordeler vedtak, klage og kontroll mellom roller og institusjoner.','Er ikke en metode for lekfolk til å vurdere enkeltsaker.',['src-phvl-2026','src-helsedir-kontroll']),model('Rettighetsbasert omsorg','Knytter hjelp til autonomi, verdighet og minst mulig inngrep.','Fjerner ikke tjenestens faglige eller juridiske ansvar.',['src-who-guidance','src-helsenorge-tvang'])],
    claim_ids: ['phi-16','phi-17','phi-18'],
    misuse_guard: 'Artikkelen skal ikke brukes til å vurdere lovlighet, samtykkekompetanse, fare eller behandlingsbehov hos en konkret person. Kritikk av makt må være kildebasert og skille rettslige vilkår, klinisk vurdering, institusjonell praksis og erfaring.'
  },
  {
    emne_id: 'em_psy_omsorg_system',
    definition: 'Omsorgssystemet er nettverket av kommunale tjenester, fastlege, spesialisthelsetjeneste, pårørende, bolig, arbeid og andre støtteordninger som sammen kan bære et psykisk helseforløp. Systemet analyseres gjennom ansvar, tilgjengelighet, koordinering og kontinuitet. Det er ikke én organisasjon, og et formelt tilbud er ikke det samme som faktisk mottatt støtte.',
    background: [
      'Psykiske helsebehov krysser ofte sektorgrenser. En person kan samtidig forholde seg til fastlege, kommunal oppfølging, arbeid, bolig og spesialistbehandling. Når tjenester bruker ulike kriterier og dokumentasjonssystemer, kan overgangene bli sårbare. Systemkvalitet handler derfor om forbindelsene mellom enheter, ikke bare kvaliteten innen hver enhet.',
      'Nasjonale pasientforløp skal støtte mer helhetlige og forutsigbare prosesser. De beskriver henvisning, utredning, behandling, evaluering og videre oppfølging. Forløpet er en norm for organisering og kan brukes til audit, men dokumenterer ikke automatisk ventetid, kapasitet, medvirkning eller faktisk kontinuitet lokalt.',
      'Krise viser systemet under tidspress. Akutt kontakt må kunne kobles til videre hjelp, og ansvaret må være tydelig når personen går mellom nivåer. Oppsøkende og community-baserte tjenester kan redusere terskler, men kan også skape nye koordineringsbehov. Systemanalyse følger derfor både tilgang og overleveringer.'
    ],
    theories_and_findings: [
      theory('Forløp og kontinuitet', 'Forløpsmodellen ser hjelpen som en sekvens av kontakt, utredning, behandling, evaluering og overgang. Kontinuitet kan være relasjonell, informasjonsmessig og organisatorisk. En person kan oppleve brudd selv om alle formelle henvisninger er sendt, og systemet kan ha god koordinering uten at én behandler følger hele forløpet.', ['src-helsenorge-forlop','src-helsedir-forlop']),
      theory('Trappetrinn og nettverk', 'Et trappetrinnsperspektiv fordeler tilbud etter antatt behov og intensitet, mens nettverksperspektivet ser samtidige forbindelser mellom helse, bolig, arbeid og sosial støtte. Helsenorge beskriver flere nivåer, og WHO knytter community-tjenester til bredere sosiale systemer. Modellene må vurderes mot lokal kapasitet og individuelle behov.', ['src-helsenorge-voksne','src-who-guidance','src-who-centres'])
    ],
    methods: [
      method('met_psy_systemanalyse','Systemkartlegging','Kartlegger aktører, ansvar, henvisninger, informasjonsflyt og beslutningspunkter i et forløp.','Et korrekt kart viser struktur, ikke nødvendigvis kvalitet, kapasitet eller brukeropplevelse.'),
      method('met_psy_praksisanalyse','Forløpsaudit','Sammenligner dokumentert praksis med avtalte milepæler, evaluering og overgangskrav.','Måloppnåelse på prosessindikatorer må ikke forveksles med helseutfall.'),
      method('met_psy_steds_og_institusjonsanalyse','Tilgangsanalyse','Undersøker geografi, terskler, åpningstid, henvisning og oppsøkende kapasitet.','Tilgjengelighet på papiret er ikke det samme som at en person kan eller ønsker å bruke tilbudet.')
    ],
    boundaries_and_disagreements: [
      boundary('Bør hjelpen organiseres trinnvis?',['Trinnvis hjelp kan bruke ressurser proporsjonalt.','Komplekse behov kan kreve samtidige og fleksible tilbud.'],'Data om behovsvurdering, overgang, frafall og resultat på tvers av kompleksitet.'),
      boundary('Hvem eier kontinuiteten?',['Én koordinator kan gi tydelig ansvar.','Delt ansvar kan samle relevant kompetanse.'],'Tydelige avtaler, informasjonsflyt og personens erfaring av sammenheng.'),
      boundary('Hva er et systemutfall?',['Ventetid og gjennomføring måler prosess.','Funksjon, livskvalitet og erfaring måler andre sider.'],'Et balansert sett av prosess-, erfarings- og utfallsmål.')
    ],
    examples: [
      example('Kommune–fastlege–DPS','Et forløpskart viser inngang gjennom kommune eller fastlege og eventuell henvisning til DPS eller sykehus. Analysen undersøker ansvar og overgang og antar ikke at alle personer følger samme vei.',['src-helsenorge-voksne']),
      example('Videre oppfølging etter krise','Et akutt møte vurderes sammen med plan for videre oppfølging og samhandling før utskrivning. Eksemplet viser hvorfor avsluttet akuttsak ikke nødvendigvis betyr avsluttet støttebehov.',['src-helsedir-forlop','src-who-crisis'])
    ],
    learning_outcomes: ['Kartlegge et omsorgssystem som ansvarskjede og nettverk.','Skille prosessindikator, erfaring og helseutfall.','Analysere overgang og tilgang uten å anta ett standardforløp.'],
    key_questions: ['Hvem har ansvar i hvert beslutningspunkt?','Hvor kan informasjon eller oppfølging brytes?','Hvordan måles reell tilgang og kontinuitet?'],
    models_or_researchers: [model('Nasjonalt pasientforløp','Strukturerer faser og overganger i spesialisthelsetjenesten.','Er en organisatorisk norm, ikke dokumentasjon på hvert faktisk forløp.',['src-helsedir-forlop']),model('Community-tjenestenettverk','Kobler helsehjelp til nærmiljø og sosiale støttesystemer.','Kan bli fragmentert uten tydelig ansvar og kapasitet.',['src-who-guidance','src-who-centres'])],
    claim_ids: ['phi-04','phi-05','phi-06','phi-22','phi-23','phi-24'],
    misuse_guard: 'Artikkelen beskriver tjenestestruktur og kan ikke brukes til å velge behandlingsnivå eller kontaktvei for en konkret person. Aktuelle krisesituasjoner må håndteres gjennom oppdaterte offisielle tjenester, ikke gjennom History Go.'
  },
  {
    emne_id: 'em_psy_pasientrolle_erfaring',
    definition: 'Pasientrolle og erfaring undersøker hvordan mennesker møter helsetjenesten som rettighetshavere, kunnskapsbærere og deltakere i beslutninger – ikke bare som mottakere av behandling. Rollen formes av lovverk, institusjon, språk og relasjon, mens erfaring viser hvordan tilbudet faktisk oppleves og virker i hverdagen. Erfaringskunnskap og fagkunnskap svarer på ulike, komplementære spørsmål.',
    background: [
      'Den tradisjonelle pasientrollen ble ofte beskrevet gjennom plikt, tillit og overføring av beslutninger til profesjonen. Senere rettighets- og brukerbevegelser har styrket informasjon, medvirkning og kontroll over eget forløp. Endringen er verken fullført eller ensartet; alvorlighetsgrad, tjenestetype og rettslig status kan påvirke handlingsrommet.',
      'Helsenorge beskriver brukermedvirkning som rett til tilpasset informasjon og deltakelse i utformingen av tjenestetilbudet. Nasjonale pasientforløp legger opp til at behov, mål og ønsker avklares. Medvirkning er dermed både prinsipp og konkret praksis som kan undersøkes i samtaler, planer, valg og evaluering.',
      'Pasienterfaring kan samles gjennom intervju, spørreskjema, klager, råd og brukerorganisasjoner. Kildene gir tilgang til opplevd relevans, verdighet og sammenheng, men én fortelling representerer ikke alle. Institusjonelle data kan på sin side vise prosess, men ikke erstatte personens perspektiv.'
    ],
    theories_and_findings: [
      theory('Fra paternalistisk til delt beslutning', 'En paternalistisk modell lar profesjonen definere mål og valg ut fra faglig vurdering. Delt beslutning kombinerer kunnskap om alternativer med personens mål, preferanser og situasjon. Modellen opphever ikke faglig ansvar og forutsetter reell informasjon, tid og valgmulighet; ellers kan medvirkning bli et ritual.', ['src-helsenorge-hjelp','src-helsedir-utredning','src-helsedir-medvirkning']),
      theory('Erfaringskunnskap som egen evidenstype', 'Erfaringsdata kan vise hvordan tilgang, kommunikasjon, bivirkninger og hverdagsliv oppleves, forhold som ikke alltid fanges av symptomskalaer. Samtidig må metode, utvalg og kontekst være tydelig. Målet er triangulering, ikke å rangere erfaring som enten mindreverdig anekdote eller ufeilbarlig sannhet.', ['src-helsedir-medvirkning','src-helsenorge-hjelp'])
    ],
    methods: [
      method('met_psy_erfaringsanalyse','Erfaringsanalyse','Analyserer intervjuer, brukerundersøkelser, klager og fortellinger etter perspektiv, kontekst og variasjon.','En enkelt erfaring kan ikke generaliseres til alle pasienter eller fastslå kausal effekt.'),
      method('met_psy_praksisanalyse','Beslutningsanalyse','Følger hvordan mål, informasjon, alternativer og evaluering dokumenteres i et behandlingsforløp.','Dokumentert plan er ikke bevis for at medvirkningen ble opplevd som reell.'),
      method('met_psy_relational_analyse','Relasjonell analyse','Undersøker rolleforventning, kommunikasjon og asymmetri uten å tolke personens indre liv.','Uten deltakernes egne data kan analysen bare beskrive rammer, ikke relasjonens kvalitet.')
    ],
    boundaries_and_disagreements: [
      boundary('Hvor mye skal pasienten bestemme?',['Autonomiperspektivet vektlegger valg og selvbestemmelse.','Omsorgsperspektivet vektlegger faglig ansvar og behov for støtte.'],'Klar informasjon, valgmuligheter, rettslig ramme og personens egne mål.'),
      boundary('Er erfaring evidens?',['Erfaring gir kunnskap om mening, relevans og praksis.','Generaliserbare effektpåstander krever andre design.'],'Metodisk transparente kvalitative og kvantitative erfaringsdata sammen med utfallsdata.'),
      boundary('Kan medvirkning måles?',['Plan- og prosessmål viser om bestemte trinn er dokumentert.','Opplevelsesmål viser om deltakelsen ble meningsfull.'],'Kombiner dokumentgjennomgang, observasjon og pasientrapport.')
    ],
    examples: [
      example('Første samtale','Et case undersøker om behov, mål og ønsker faktisk blir etterspurt og dokumentert i første samtale. Det vurderer prosessen, ikke om pasientens mål er klinisk riktige eller hvilken behandling personen bør få.',['src-helsedir-utredning']),
      example('Behandlingsplan i samarbeid','Helsedirektoratets indikator brukes til å skille mellom at en plan finnes og at den er utarbeidet sammen med pasienten. Caset viser behovet for både dokumentasjon og erfaringsdata.',['src-helsedir-medvirkning'])
    ],
    learning_outcomes: ['Forklare pasientrollen som rettighets- og kunnskapsrolle.','Skille dokumentert medvirkning fra opplevd medvirkning.','Vurdere erfaringskilder uten å avvise eller overgeneralisere dem.'],
    key_questions: ['Hvilken informasjon og hvilke valg var reelt tilgjengelige?','Hvordan ble personens mål innarbeidet og evaluert?','Hvilken erfaringskilde mangler i institusjonens framstilling?'],
    models_or_researchers: [model('Delt beslutning','Kombinerer faglig evidens med personens mål og preferanser.','Forutsetter forståelig informasjon og reelle alternativer.',['src-helsenorge-hjelp','src-helsedir-medvirkning']),model('Erfaringskunnskap','Behandler levd erfaring som selvstendig kunnskapskilde om praksis og hverdagsvirkning.','Én fortelling representerer ikke automatisk en gruppe.',['src-helsedir-medvirkning'])],
    claim_ids: ['phi-10','phi-11','phi-12'],
    misuse_guard: 'Artikkelen skal ikke tolke en persons diagnose, samtykkekompetanse eller behandlingsbehov fra en fortelling. Erfaringskunnskap må gjengis med kontekst og variasjon, og institusjonens dokumentasjon skal ikke brukes som erstatning for pasientperspektivet.'
  },
  {
    emne_id: 'em_psy_terapi_praksis',
    definition: 'Terapi som praksis er den organiserte anvendelsen av psykologiske metoder i en profesjonell relasjon med mål, rammer og evaluering. Praksisen omfatter mer enn teori: kompetanse, allianse, etikk, journalføring, setting, kulturell forståelse og tilpasning påvirker hva som faktisk skjer. En terapiretning er derfor ikke identisk med én teknikk eller et garantert utfall.',
    background: [
      'Psykoterapi har utviklet seg gjennom psykodynamiske, atferdsorienterte, kognitive, humanistiske, systemiske og integrative tradisjoner. Tradisjonene har ulike begreper om problem, endring og terapeutrolle. I praksis kan behandlere kombinere komponenter, men integrasjon krever faglig begrunnelse og kan ikke reduseres til tilfeldig metodeblanding.',
      'Terapi foregår i offentlige og private tjenester, individuelt, i gruppe, med familie eller digitalt. Settingen påvirker tilgang, taushet, tidsramme og hva slags arbeid som er mulig. Veiledet eBehandling viser at strukturert egenaktivitet og behandlerkontakt kan fordeles annerledes enn i ukentlige fysiske samtaler.',
      'Kvalitet vurderes gjennom kompetanse, metodeintegritet, samarbeid, mål, respons, sikkerhet og utfall. Nasjonale pasientforløp legger opp til planlegging og evaluering med pasienten. Dette gjør terapi til en løpende beslutningsprosess, ikke bare levering av en ferdig teknikk.'
    ],
    theories_and_findings: [
      theory('Psykodynamisk, kognitiv og humanistisk praksis', 'Psykodynamiske modeller undersøker mønstre, affekt og relasjon; kognitive modeller arbeider med sammenhenger mellom fortolkning, følelse og handling; humanistiske modeller vektlegger klientens perspektiv, empati og vekst. Tradisjonene er historisk og teoretisk forskjellige. Deres navn sier ikke alene hvilke konkrete prosedyrer eller evidens som gjelder i et bestemt forløp.', ['src-freud-legacy','src-helsenorge-ebehandling','src-helsedir-psykiatri']),
      theory('Allianse, respons og tilbakemelding', 'Terapeutisk samarbeid handler om mål, oppgaver og relasjonell ramme. Det kan være en betingelse for gjennomføring, men korrelasjon med utfall viser ikke alene hvilken vei påvirkningen går. Praksis bør derfor følge både samarbeid, symptom og funksjon over tid og bruke tilbakemelding som informasjon, ikke som automatisk dom over terapeut eller klient.', ['src-helsedir-utredning','src-helsedir-medvirkning','src-helsedir-forlop'])
    ],
    methods: [
      method('met_psy_praksisanalyse','Terapiprosessanalyse','Undersøker mål, intervensjoner, sekvenser, tilpasning og evaluering i et dokumentert forløp.','Uten samtykke og relevante data skal en utenforstående ikke tolke en konkret terapitime.'),
      method('met_psy_relational_analyse','Allianseanalyse','Skiller mål, oppgaver og relasjon og sammenholder behandler- og pasientperspektiv.','Allianseskår er ikke tankelesing og beviser ikke alene årsaken til et utfall.'),
      method('met_psy_behandlingshistorisk_analyse','Tradisjonsanalyse','Plasserer teorier og teknikker i historisk kontekst og undersøker kontinuitet og brudd.','Historisk innflytelse eller popularitet dokumenterer ikke effekt.')
    ],
    boundaries_and_disagreements: [
      boundary('Hvor viktig er terapiretningen?',['Modellperspektivet vektlegger spesifikke mekanismer.','Fellesfaktorperspektivet vektlegger samarbeid og kontekst.'],'Komponentstudier, direkte sammenligninger, prosessmål og moderatorer.'),
      boundary('Hvor fleksibel bør terapeuten være?',['Manualintegritet gjør praksis etterprøvbar.','Responsiv tilpasning møter person og situasjon.'],'Dokumenterte tilpasninger og data på både prosess og resultat.'),
      boundary('Kan terapi foregå digitalt?',['Digitale formater kan øke struktur og tilgang.','De endrer kontakt, personvern og krav til egenaktivitet.'],'Studier av målgruppe, gjennomføring, sikkerhet, frafall og sammenlignbare utfall.')
    ],
    examples: [
      example('Veiledet digital terapi','eBehandling brukes som case for hvordan programinnhold, egenaktivitet og behandleroppfølging fordeles. Det er en spesifikk behandlingsform for definerte tilstander, ikke en generell erstatning for terapeutisk praksis.',['src-helsenorge-ebehandling']),
      example('Mål og evaluering i pasientforløpet','Et terapiforløp analyseres etter hvordan mål avtales, respons evalueres og videre oppfølging besluttes. Caset viser praksisens beslutningspunkter uten å anbefale metode for en bestemt person.',['src-helsedir-forlop','src-helsedir-medvirkning'])
    ],
    learning_outcomes: ['Skille terapitradisjon, teknikk og faktisk praksis.','Analysere samarbeid og evaluering uten tankelesing.','Vurdere fleksibilitet, integritet og setting som faglige spørsmål.'],
    key_questions: ['Hvilke konkrete komponenter og mål har praksisen?','Hvordan følges respons, frafall og uønskede virkninger?','Hva skyldes teori, setting, relasjon eller seleksjon?'],
    models_or_researchers: [model('Sigmund Freud og psykodynamisk tradisjon','Historisk utgangspunkt for teori om ubevisste dynamikker og terapeutisk fortolkning.','Historisk innflytelse beviser ikke alle teoripåstander eller effekt.',['src-freud-legacy']),model('Aaron T. Beck og kognitiv terapi','Knytter strukturert arbeid med fortolkning og atferd til definerte problemer.','Må beskrives gjennom konkret protokoll og målgruppe.',['src-helsenorge-ebehandling','src-helsedir-psykiatri']),model('Carl Rogers og klientsentrert tradisjon','Vektlegger klientperspektiv, empati og terapeutisk holdning.','En anerkjennende holdning er ikke alene dokumentasjon på behandlingsutfall.',['src-helsedir-medvirkning'])],
    claim_ids: ['phi-07','phi-08','phi-09','phi-10','phi-11','phi-12','phi-13','phi-14','phi-15'],
    extra_source_ids: ['src-freud-legacy'],
    misuse_guard: 'Artikkelen gir ingen individuell terapianbefaling og skal ikke brukes til å tolke hva en klient eller terapeut «egentlig» tenker. Tradisjonsnavn må ikke erstatte beskrivelse av konkrete metoder, målgruppe, kompetanse, evidens og begrensninger.'
  },
  {
    emne_id: 'em_psy_terapirom_relasyon',
    definition: 'Terapirom og relasjon studerer de fysiske, digitale og institusjonelle rammene rundt møtet mellom klient og behandler. Relasjonen formes av roller, mål, tid, taushet, dokumentasjon, teknologi og asymmetrisk ansvar. Et rom eller en observasjon gir ikke tilgang til deltakernes indre liv; kvalitet må undersøkes gjennom deres perspektiver og prosessdata.',
    background: [
      'Det klassiske terapirommet organiserer samtalen gjennom avskjerming, faste tider og en profesjonell rollefordeling. Rommet kan støtte konsentrasjon og konfidensialitet, men også markere avstand og institusjonell autoritet. Utforming bør derfor analyseres sammen med praksis, ikke som om møbler eller arkitektur automatisk skaper en bestemt relasjon.',
      'Digital behandling, video og tekstbasert kontakt gjør terapirommet distribuert. Klienten kan arbeide hjemme, mens tjenesten forvalter plattform, data og oppfølging. Dette endrer terskler, privatliv, synkronitet og hvilke signaler partene har tilgang til. Digitalt format er verken grenseløst rom eller bare en kopi av fysisk samtale.',
      'Terapeutisk relasjon omfatter samarbeid om mål og oppgaver samt den emosjonelle kvaliteten i møtet. Relasjon kan måles fra klientens, terapeutens eller observatørens perspektiv, som ikke alltid samsvarer. Uenighet er ikke bare målefeil; den kan vise at partene opplever samme prosess forskjellig.'
    ],
    theories_and_findings: [
      theory('Allianse som mål, oppgave og bånd', 'Alliansemodeller deler samarbeidet i enighet om mål, enighet om arbeidsmåter og relasjonelt bånd. Inndelingen hjelper analysen å unngå at «god kjemi» blir en vag totalforklaring. Sammenhengen mellom allianse og utfall må fortsatt tolkes med tidsrekkefølge, gjensidig påvirkning og måleperspektiv.', ['src-helsedir-utredning','src-helsedir-medvirkning']),
      theory('Rom, teknologi og institusjonell ramme', 'Praksisrammen bestemmer varighet, personvern, dokumentasjon og kontaktform. Helsenorge beskriver veiledet eBehandling som program kombinert med behandleroppfølging, noe som fordeler terapeutisk arbeid mellom digital egenaktivitet og kontakt. Rammen påvirker muligheter, men bestemmer ikke relasjonens kvalitet alene.', ['src-helsenorge-ebehandling','src-helsedir-forlop'])
    ],
    methods: [
      method('met_psy_rom_og_praksisanalyse','Rom- og praksisanalyse','Dokumenterer setting, tidsstruktur, personvern, teknologi og rollefordeling og kobler dem til faktisk arbeidsform.','Skal ikke slutte fra interiør eller skjermformat til klientens opplevelse.'),
      method('met_psy_relational_analyse','Flerperspektivisk relasjonsanalyse','Sammenholder klient-, terapeut- og eventuelt observatørdata om mål, oppgaver og samarbeid.','Uten deltakernes data kan man ikke fastslå kvaliteten i en konkret relasjon.'),
      method('met_psy_diskursanalyse','Samtale- og rolleanalyse','Undersøker hvordan spørsmål, respons og profesjonelle kategorier fordeler talerett og ansvar.','Språkmønstre alene avslører ikke skjult motiv, diagnose eller effekt.')
    ],
    boundaries_and_disagreements: [
      boundary('Er allianse en årsak til bedring?',['Allianse kan støtte deltakelse og endringsarbeid.','Tidlig bedring kan også styrke alliansen.'],'Gjentatte målinger, tidsrekkefølge og kontroll for tidlig symptomendring.'),
      boundary('Er fysisk rom nødvendig?',['Fysisk samvær gir bestemte kroppslige og romlige signaler.','Digitale formater kan gi tilgang og struktur.'],'Sammenlign målgruppe, preferanser, sikkerhet, frafall og utfall.'),
      boundary('Hvem definerer en god relasjon?',['Profesjonelle mål kan vektlegge samarbeid om behandling.','Klienter kan vektlegge trygghet, respekt og relevans.'],'Flere perspektiver og åpne mål framfor én observatørdom.')
    ],
    examples: [
      example('Første samtale som institusjonell situasjon','Helsedirektoratet beskriver avklaring av behov, mål og ønsker. Caset analyserer hvem som setter agenda, hvordan valg forklares og hvordan målene dokumenteres, uten å tolke klientens personlighet.',['src-helsedir-utredning']),
      example('Det distribuerte digitale terapirommet','eBehandling viser at program, hjemmemiljø og behandlerkontakt sammen utgjør rammen. Analysen undersøker tilgang, personvern og arbeidsdeling uten å anta at digitalt alltid er svakere eller bedre.',['src-helsenorge-ebehandling'])
    ],
    learning_outcomes: ['Analysere terapirom som fysisk, digital og institusjonell ramme.','Skille alliansens komponenter og måleperspektiver.','Unngå å slutte fra observerbar setting til indre liv.'],
    key_questions: ['Hvordan fordeles mål, taletid og ansvar?','Hvilke deler av relasjonen måles, av hvem og når?','Hvordan endrer teknologi tilgang, privatliv og samarbeid?'],
    models_or_researchers: [model('Alliansemodellen','Skiller mål, oppgaver og relasjonelt bånd.','Allianseskår beviser ikke alene årsak eller kvalitet.',['src-helsedir-medvirkning','src-helsedir-utredning']),model('Distribuert terapirom','Ser digitalt program, hjemmemiljø og behandlerkontakt som samlet praksisramme.','Formatet sier ikke alene hvem behandlingen passer for.',['src-helsenorge-ebehandling'])],
    claim_ids: ['phi-13','phi-14','phi-15'],
    misuse_guard: 'Artikkelen skal ikke brukes til å bedømme en konkret terapeutisk relasjon uten deltakernes data eller til å tolke diagnose, motiv eller personlighet fra rom, kroppsspråk eller samtaleutdrag. Digitalt og fysisk format må vurderes empirisk.'
  },
  {
    emne_id: 'em_psy_velferd_psykisk_helse',
    definition: 'Velferd og psykisk helse undersøker hvordan bolig, inntekt, arbeid, utdanning, sosial beskyttelse og tilgang til tjenester former belastning og handlingsrom. Perspektivet utvider analysen uten å redusere psykisk helse til økonomi eller politikk. Sosiale mønstre er probabilistiske og må kobles til individuelle erfaringer, biologiske forhold og konkrete tjenestesystemer.',
    background: [
      'Velferdsstaten fordeler ressurser og risiko gjennom tjenester, rettigheter og institusjoner. Psykisk helse påvirker muligheten til å delta i arbeid og utdanning, samtidig som ustabil bolig, økonomisk usikkerhet og eksklusjon kan øke belastning. Retningen kan gå begge veier, og de samme faktorene kan ha ulik betydning gjennom livsløpet.',
      'Psykisk helsehjelp tilbys i kommune, fastlegeordning og spesialisthelsetjeneste, men støttebehov stopper ikke ved sektorgrensen. WHO framhever forbindelser til bolig, arbeid, utdanning og sosial beskyttelse. Et velferdsperspektiv spør derfor om systemet kan koordinere helsehjelp med betingelsene for hverdagsliv.',
      'Ulikhet kan undersøkes gjennom tilgang, ventetid, bruk, frafall og utfall. Slike data påvirkes av behov, henvisning, språk, tillit og registreringspraksis. En lav bruksrate kan bety lavt behov, barrierer eller alternative støttekilder; den må ikke uten videre tolkes som god helse.'
    ],
    theories_and_findings: [
      theory('Sosiale determinanter og gjensidig påvirkning', 'Sosial årsak-modeller undersøker hvordan levekår påvirker psykisk helse, mens sosial seleksjon undersøker hvordan helse påvirker utdanning, arbeid, inntekt og bosted. Begge prosesser kan virke samtidig. Longitudinelle data og naturlige eksperimenter er derfor særlig viktige for å skille tidsrekkefølge og alternative forklaringer.', ['src-who-guidance','src-who-centres']),
      theory('Velferdstjenester som handlingsrom', 'Community- og velferdsperspektiver vurderer om tjenester støtter deltakelse, bolig, arbeid og selvbestemmelse. Hjelpen er ikke bare symptomrettet; den kan endre praktiske muligheter og sosial tilhørighet. Normative anbefalinger må likevel skilles fra dokumentasjon på hva et lokalt system faktisk leverer.', ['src-who-guidance','src-who-outreach','src-helsenorge-voksne'])
    ],
    methods: [
      method('met_psy_velferdspsykologisk_analyse','Velferdspsykologisk analyse','Kobler data om levekår, tjenestebruk, deltakelse og psykisk helse på relevante nivåer og tidspunkter.','Register- og gruppedata kan ikke brukes til å forklare eller karakterisere enkeltpersoner.'),
      method('met_psy_systemanalyse','Tverrsektoriell systemanalyse','Følger ansvar og overganger mellom helse, bolig, arbeid og andre støtteordninger.','Formell samordning viser ikke nødvendigvis faktisk tilgjengelighet eller opplevd sammenheng.'),
      method('met_psy_normkritisk_analyse','Rettighets- og normanalyse','Undersøker hvordan selvhjulpenhet, arbeidsevne, risiko og verdighet defineres i ordninger og språk.','Kritikk av normer skal ikke benekte reelle støttebehov eller forskjeller i funksjon.')
    ],
    boundaries_and_disagreements: [
      boundary('Skyldes ulikhet levekår eller seleksjon?',['Sosial årsak vektlegger belastning og ressurser.','Sosial seleksjon vektlegger helsens påvirkning på sosial posisjon.'],'Longitudinelle data, søsken-/familiedesign eller policyendringer med gode sammenligninger.'),
      boundary('Er velferdstiltak psykisk helsebehandling?',['Tiltak kan redusere belastning og styrke deltakelse.','De har andre mål, kompetanser og evidenskrav enn klinisk behandling.'],'Tydelig intervensjonsbeskrivelse og separate helse-, funksjons- og velferdsmål.'),
      boundary('Hva betyr lik tilgang?',['Lik formell rett kan være utgangspunkt.','Reell tilgang avhenger av terskler, kapasitet og tilpasning.'],'Data om behov, henvisning, ventetid, bruk, frafall og erfaring på tvers av grupper.')
    ],
    examples: [
      example('Bolig og community-støtte','WHO-veiledningen brukes til å undersøke hvordan psykisk helsetjeneste kobles til bolig og sosial deltakelse. Caset beskriver systemdesign og skal ikke antyde at boligstatus alene forklarer en persons psykiske helse.',['src-who-guidance','src-who-centres']),
      example('Oppsøkende støtte i hverdagsmiljø','Oppsøkende tjenester kan bringe støtte til hjem og nærmiljø. Analysen vurderer terskel, samhandling og rettigheter, men må undersøke lokal kapasitet før den sier at tilbudet faktisk er tilgjengelig.',['src-who-outreach','src-helsenorge-voksne'])
    ],
    learning_outcomes: ['Forklare sosial årsak og sosial seleksjon.','Analysere tverrsektorielle systemer uten å redusere individet til levekår.','Skille formell rett, tjenestebruk og reell tilgang.'],
    key_questions: ['Hvilken retning og tidshorisont har sammenhengen?','Hvilket nivå gjelder dataene?','Hvordan måles behov, tilgang, deltakelse og utfall separat?'],
    models_or_researchers: [model('Modellen for sosiale determinanter','Undersøker hvordan materielle og sosiale vilkår former risiko og handlingsrom.','Er probabilistisk og ikke en full forklaring på individet.',['src-who-guidance']),model('Community-velferdsmodellen','Kobler psykisk helsehjelp til bolig, arbeid, utdanning og sosial deltakelse.','Normativ integrasjon må skilles fra lokal implementering.',['src-who-guidance','src-who-centres'])],
    claim_ids: ['phi-01','phi-02','phi-03','phi-25','phi-26','phi-27'],
    misuse_guard: 'Artikkelen skal ikke diagnostisere sosiale grupper, anta at lav tjenestebruk betyr god helse eller gjøre levekår til en tilstrekkelig forklaring på enkeltpersoner. Velferdstiltak og klinisk behandling må holdes begrepsmessig adskilt.'
  }
];

function materialize(raw) {
  const emne = EMNE_BY_ID.get(raw.emne_id);
  if (!emne) throw new Error(`Ukjent canonicalt emne: ${raw.emne_id}`);
  const sourceIds = new Set(raw.extra_source_ids || []);
  for (const claimId of raw.claim_ids) {
    const claim = CLAIM_BY_ID.get(claimId);
    if (!claim) throw new Error(`Ukjent mental-health claim ${claimId} i ${raw.emne_id}`);
    for (const sourceId of claim.source_ids) sourceIds.add(sourceId);
  }
  for (const section of [...raw.theories_and_findings, ...raw.examples, ...raw.models_or_researchers]) {
    for (const sourceId of section.source_ids || []) sourceIds.add(sourceId);
  }
  return {
    schema: 'history_go_psykologi_topic_article_v1',
    version: '1.1.0',
    updated_at: '2026-08-12',
    subject_id: 'psykologi',
    domain_id: DOMAIN_ID,
    emne_id: raw.emne_id,
    title: emne.title,
    article_status: 'complete',
    definition: raw.definition,
    background: raw.background,
    theories_and_findings: raw.theories_and_findings,
    methods: raw.methods,
    boundaries_and_disagreements: raw.boundaries_and_disagreements,
    examples: raw.examples,
    learning_outcomes: raw.learning_outcomes,
    key_questions: raw.key_questions,
    models_or_researchers: raw.models_or_researchers,
    related_emne_ids: [...new Set(emne.related_emne || emne.related_emners || [])],
    claim_ids: raw.claim_ids,
    source_ids: [...sourceIds].sort(),
    misuse_guard: raw.misuse_guard,
    editorial_review: { ...EDITORIAL_REVIEW, checks: { ...EDITORIAL_REVIEW.checks } }
  };
}

const materialized = articles.map(materialize).sort((a, b) => a.emne_id.localeCompare(b.emne_id));
if (JSON.stringify(materialized.map((article) => article.emne_id)) !== JSON.stringify(DOMAIN_IDS)) {
  throw new Error(`Artikkelsettet dekker ikke eksakt ${DOMAIN_IDS.length} canonicale emner i ${DOMAIN_ID}`);
}
fs.mkdirSync(OUTPUT, { recursive: true });
for (const article of materialized) {
  fs.writeFileSync(path.join(OUTPUT, `${article.emne_id}.json`), `${JSON.stringify(article, null, 2)}\n`);
}
console.log(`Materialiserte ${materialized.length}/${DOMAIN_IDS.length} selvstendige Psykologi-emneartikler for ${DOMAIN_ID}.`);
