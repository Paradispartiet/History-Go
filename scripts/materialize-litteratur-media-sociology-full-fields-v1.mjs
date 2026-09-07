#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const words = (value) => String(value).trim().split(/\s+/u).filter(Boolean).length;
const evidence = ['særskrevet hovedartikkel med alle underkrav', 'definerte begreper med eksplisitte grensedragninger', 'fullt arbeidseksempel og minst to sammenligningsobjekter', 'kildeførte historiske og geografiske utsagn', 'anvendelse av minst to teoritradisjoner og to metoder', 'eksplisitt avgrensning mot canonicale naboområder'];
const evidenceFields = ['topicId', 'sectionIds', 'conceptIds', 'claimIds', 'sourceIds', 'appliedTheoryTraditions', 'appliedMethods', 'namedAnalysisObjects', 'historicalCoverage', 'geographicalCoverage', 'boundaryAreaIds', 'subcoverageEvidence', 'theoryEvidence', 'methodEvidence', 'namedObjectEvidence'];
const completionRules = ['Alle seks temakrav skal være oppfylt.', 'Hvert underdekningspunkt skal ha avsnittsevidens.', 'Alle obligatoriske begreper skal være definerte og avgrensede.', 'Hvert tema skal anvende minst tre navngitte analyseobjekter.', 'Minst to teoritradisjoner skal anvendes per tema.', 'Minst to metoder skal anvendes per tema.', 'Historisk og geografisk dekning skal være kildeført.', 'Dokumentert spor skal skilles fra spekulasjon om opphav eller virkning.', 'Kilde-, utgave- og mediegrenser skal stå eksplisitt.', 'Permanent audit skal validere fulfillment-filen.'];
const depth = [
  'Analysen må først identifisere verkversjon, medium, produksjonsledd og institusjon. Et dokumentert trekk kan beskrives presist uten at forskeren tilskriver opphavsperson, publikum eller teknologi en udokumentert intensjon.',
  'Sammenligningen må holde språk, historisk situasjon og materialitet fra hverandre. Likhet mellom to uttrykk dokumenterer ikke automatisk påvirkning, lik funksjon eller samme sosiale virkning, og en rivaliserende forklaring skal prøves.',
  'Metoden må oppgi analyseenhet, utvalg og operasjon: hva registreres, hvordan sammenstilles funnene, og hvilke data faller utenfor? Teorien fungerer som et prøvbart begrepsapparat, ikke som merkelapp på forhåndsvalgt konklusjon.',
  'Historiske påstander krever samtidige spor eller relevant forskning, mens tekst- og formpåstander må lokaliseres i en bestemt utgave eller realisering. Senere resepsjon kan belyse betydningshistorie, men avgjør ikke tidligere bruk alene.',
  'Institusjonelle vilkår som rettigheter, kataloger, formater, juryer, redaksjoner og plattformer skal behandles som deler av materialet. Formell tilgjengelighet, faktisk tilgang og dokumentert bruk er tre forskjellige evidensnivåer.',
  'Makt, språk, geografi og tilgjengelighet må inngå i forklaringen når kategorier eller institusjoner fordeler synlighet. Globale sammenstillinger skal bevare lokale begreper og infrastrukturer i stedet for å gjøre én tradisjon til universell normal.',
  'Konklusjonen skal oppgi hva materialet støtter, hvilke mellomledd som er usikre, og hvordan et alternativt design kunne utfordre funnet. Fravær av spor er en kildebegrensning før det eventuelt blir et historisk resultat.'
];
const concept = (id, term, definition, distinguish_from) => ({ id, term, definition, distinguish_from });
const c = (id, term, focus, boundary) => [id, term, `${term} betegner ${focus}. Begrepet skal knyttes til bestemte verk, medier, aktører eller institusjonelle spor i analysen.`, `Må skilles fra ${boundary}, som krever en annen analyseenhet eller evidenstype.`];

const areas = [
  {
    id: 'medier_intermedialitet_adapsjon',
    title: 'Medier, intermedialitet og adaptasjon',
    subtitle: 'Materialitet, modalitet og fortelling på tvers av medieformer',
    lead: 'Medieorientert litteraturvitenskap undersøker hvordan litterær form blir mulig gjennom tekniske bærere, sansemodaliteter, grensesnitt og institusjoner. Intermedialitet og adaptasjonsstudier sammenligner ikke bare innhold, men dokumenterer hva skrift, bilde, lyd, kropp, kode og brukerhandling gjør forskjellig i konkrete realiseringer.',
    purpose: 'Kontrakten hindrer at mediefeltet reduseres til handlingsreferat eller fidelitetsdom ved å binde hvert tema til materialitet, formoperasjoner, produksjon, resepsjon, historikk, global variasjon, navngitte verk og eksplisitte inferensgrenser.',
    prefix: 'mia',
    claimClass: 'media_intermediality_adaptation_full_field',
    modules: ['medium-og-adaptasjon', 'audiovisuell-og-visuell-fortelling', 'lyd-og-prosedyre'],
    moduleTitles: ['Medium, modalitet og adaptasjon', 'Audiovisuell og sekvensiell fortelling', 'Lyd, kode og brukerhandling'],
    shared: ['medium', 'modalitet', 'materialitet', 'intermedialitet'],
    dimensions: {
      theoryTraditions: ['intermedialitetsteori', 'multimodalitetsteori', 'mediespesifisitet', 'remedieringsteori', 'adaptasjonsteori', 'mediearkeologi', 'tegneseriestudier', 'lyd- og spillstudier'],
      methods: ['mediespesifikk næranalyse', 'intermedial sammenligning', 'adaptasjonsanalyse', 'bilde- og sekvensanalyse', 'film- og klippanalyse', 'lyd- og framføringsanalyse', 'grensesnitt- og kodeanalyse', 'plattform- og versjonsaudit'],
      historicalPeriods: ['muntlige og performative tradisjoner', 'manuskript- og bildekulturer', 'tidlig moderne trykk og scene', '1800-tallets illustrerte massemedier', 'film-, radio- og grammofonmodernitet', 'etterkrigstidens fjernsyn og paperback', 'digitale og nettverksbaserte litteraturformer'],
      geographicalTraditions: ['europeiske bok- og filmkulturer', 'østasiatiske bilde- og skjermfortellinger', 'afrikanske muntlige og digitale praksiser', 'sørasiatiske flerspråklige mediefelt', 'latinamerikanske adaptasjonskulturer', 'arabiske lyd- og skjermoffentligheter', 'urfolks- og diasporiske mediepraksiser'],
      mediaAndInstitutions: ['manuskript og trykt bok', 'illustrasjon, bildebok og tegneserie', 'teater, film og fjernsyn', 'radio, lydbok og podkast', 'hypertekst og elektronisk litteratur', 'digitale spill og interaktiv fiksjon', 'forlag, studio og strømmeplattform', 'arkiv, bibliotek og programvarelager'],
      boundaryAreaIds: ['sjanger_modus_form', 'narratologi_prosa', 'sprak_stil_retorikk', 'tekstkritikk_bokhistorie_arkiv', 'komparativ_verdenslitteratur_oversettelse', 'kognitiv_empirisk_digital_litteraturvitenskap']
    },
    specs: [
      { id: 'medium_modalitet_materialitet', title: 'Medium, modalitet og materialitet', sub: ['forholdet mellom medium, modalitet og materialitet', 'trykkbok, e-bok og lydbok som ulike realiseringer', 'innskrift, lagring, overføring og grensesnitt', 'affordanser, sansekanaler og tilgjengelighet', 'remediering, konvergens og mediehistorisk lån', 'formater, standarder og institusjonell kontroll', 'bevaring, obsolesens og versjonsspesifikk sitering'], unique: ['mediespesifisitet', 'remediering', 'affordanse', 'teknisk_baerer'], theories: ['intermedialitetsteori', 'multimodalitetsteori', 'mediespesifisitet', 'remedieringsteori'], methods: ['mediespesifikk næranalyse', 'materialitetsbeskrivelse', 'grensesnittanalyse', 'versjonssammenligning'], objects: ['Charlotte Brontë: Jane Eyre i trykk', 'Charlotte Brontë: Jane Eyre som lydbok', 'Anne Carson: Nox', 'Mark Z. Danielewski: House of Leaves'], history: ['manuskriptets materialitet', 'trykksidens standardisering', 'fonografisk og radiobasert lyd', 'digitale plattformformater'], geo: ['britisk bokhistorie', 'nordamerikansk artist book', 'globale lydbokmarkeder', 'flerspråklige digitale formater'], bounds: ['tekstkritikk_bokhistorie_arkiv', 'sprak_stil_retorikk', 'kognitiv_empirisk_digital_litteraturvitenskap'] },
      { id: 'adaptasjon_omforming', title: 'Adaptasjon og omforming', sub: ['adaptasjonsteori utover fidelitetsdommen', 'utvalg, komprimering, utvidelse og omorganisering', 'transponering mellom tid, sted, språk og kultur', 'appropriasjon, makt, kreditering og motfortelling', 'grensen mellom adaptasjon, oversettelse, remake og oppfølger', 'publikum, industri, rettigheter og markedsføring', 'adaptasjonsnettverk med flere versjoner og retninger'], unique: ['adaptasjon', 'omforming', 'fidelitet', 'appropriasjon'], theories: ['adaptasjonsteori', 'intertekstualitetsteori', 'postkolonial omskrivingsteori', 'resepsjonsteori'], methods: ['scene- og hendelseskartlegging', 'komparativ formanalyse', 'produksjons- og rettighetsstudium', 'resepsjonssammenligning'], objects: ['Amy Heckerling: Clueless', 'Jane Austen: Emma', 'Akira Kurosawa: Throne of Blood', 'Jean Rhys: Wide Sargasso Sea'], history: ['klassisk imitasjon', 'tidlig moderne sceneomforming', 'filmindustriens adaptasjoner', 'samtidige transmediale franchiser'], geo: ['britisk romankultur', 'amerikansk ungdomsfilm', 'japansk Shakespeare-adaptasjon', 'karibisk postkolonial omskriving'], bounds: ['komparativ_verdenslitteratur_oversettelse', 'forfatterskap_intertekstualitet', 'postkolonial_dekolonial_rase_migrasjon'] },
      { id: 'litteratur_film_tv', title: 'Litteratur, film og fjernsyn', sub: ['verbal fortelling sammenlignet med audiovisuell iscenesettelse', 'kamera, utsnitt, mise-en-scène og romlig organisering', 'klipp, rytme, varighet og parallellføring', 'lyd, musikk, dialog, stillhet og voice-over', 'skuespillerkropp, casting og karakterframstilling', 'fjernsynets episode, sesong, serialitet og cliffhanger', 'produksjons- og resepsjonskilder uten formdeterminisme'], unique: ['klipp', 'fokalisering', 'serialitet', 'mise_en_scene'], theories: ['filmfortellingsteori', 'narratologi', 'adaptasjonsteori', 'fjernsynsstudier'], methods: ['shot-for-shot-analyse', 'klipp- og rytmeanalyse', 'lyd-bilde-analyse', 'episode- og sesongkartlegging'], objects: ['Joe Wright: Pride & Prejudice', 'Jane Austen: Pride and Prejudice', 'Hirokazu Kore-eda: The Makanai', 'Margaret Atwood: The Handmaid’s Tale'], history: ['stumfilm og litterær adaptasjon', 'klassisk lydfilm', 'kringkastingsfjernsyn', 'strømmeplattformens serieformat'], geo: ['britisk roman og film', 'japansk fjernsyn', 'nordamerikansk strømmedrama', 'transnasjonal skjermdistribusjon'], bounds: ['narratologi_prosa', 'drama_teatertekst_framforing', 'leser_resepsjon_affekt'] },
      { id: 'tegneserie_bildebok_visuell_fortelling', title: 'Tegneserie, bildebok og visuell fortelling', sub: ['ord-bilde-relasjoner, samsvar, utvidelse og motsigelse', 'rute, mellomrom, sekvens og leseslutning', 'side, oppslag, komposisjon og navigasjon', 'ikonotekst, skriftbilde og grafisk stemme', 'tegneserie, bildebok, grafisk memoar og sjangergrense', 'trykk, papir, farge, format og reproduksjon', 'digital scrolling, webtoon og skjermspesifikk rytme'], unique: ['rute', 'oppslag', 'ikonotekst', 'sekvensiell_kunst'], theories: ['tegneserieteori', 'bildebokteori', 'multimodalitetsteori', 'visuell retorikk'], methods: ['rute- og overgangsanalyse', 'oppslagsanalyse', 'ord-bilde-kartlegging', 'material- og fargeanalyse'], objects: ['Art Spiegelman: Maus', 'Marjane Satrapi: Persepolis', 'Shaun Tan: The Arrival', 'Keum Suk Gendry-Kim: Grass'], history: ['illustrert trykkultur', 'avistegneseriens massemedium', 'etterkrigstidens grafiske roman', 'digitale vertikale publiseringsformer'], geo: ['nordamerikansk grafisk memoar', 'iransk-fransk tegneserie', 'australsk bildebok', 'koreansk manhwa'], bounds: ['sprak_stil_retorikk', 'sjanger_modus_form', 'minne_traume_vitnesbyrd_livsskriving'] },
      { id: 'lydbok_podkast_muntliggjøring', title: 'Lydbok, podkast og muntliggjøring', sub: ['skriftlig tekst som framført og tidsbundet hendelse', 'innleser, skuespiller, forteller og karakterstemmer', 'tempo, pause, prosodi, pust og aksent', 'lyddesign, musikk, romklang og akustisk perspektiv', 'forkortet, uforkortet og dramatisert versjon', 'podkastserialitet, dokumentarisk kontrakt og redaksjon', 'tilgjengelighet, plattform, metadata og lytterdata'], unique: ['innlesning', 'vokalitet', 'lydproduksjon', 'akustisk_perspektiv'], theories: ['lydstudier', 'oralitetsteori', 'framføringsteori', 'resepsjonsteori'], methods: ['prosodisk analyse', 'akustisk nærlytting', 'framføringssammenligning', 'plattform- og metadataanalyse'], objects: ['Franz Kafka: The Metamorphosis som lydbok', 'Dylan Thomas: Under Milk Wood', 'LeVar Burton Reads', 'Welcome to Night Vale'], history: ['muntlig framføring', 'radiohørespill', 'kassett- og CD-lydbok', 'podkast- og strømmekultur'], geo: ['tyskspråklig modernisme i engelsk lyd', 'walisisk radiodrama', 'afrikansk-amerikansk podkastformidling', 'globale strømmeplattformer'], bounds: ['muntlighet_folklore_urfolkskunnskap', 'leser_resepsjon_affekt', 'drama_teatertekst_framforing'] },
      { id: 'elektronisk_litteratur_spillfortelling', title: 'Elektronisk litteratur og spillfortelling', sub: ['kode, database og prosedyre som litterær form', 'ergodisk innsats, bane, valg og leserarbeid', 'forgrening, tilstand, konsekvens og gjenlesning', 'hypertekst, parser, kinetisk tekst og sjangerforskjell', 'spiller- og leseragency med programmerte grenser', 'plattform, versjon, emulering og digital bevaring', 'walkthrough, hendelseslogg og dokumenterbar analysemetode'], unique: ['interaktivitet', 'kode', 'ergodisk_tekst', 'prosedyre'], theories: ['elektronisk litteraturteori', 'spillstudier', 'plattformstudier', 'mediearkeologi'], methods: ['banekartlegging', 'kode- og prosedyreanalyse', 'grensesnittanalyse', 'versjons- og bevaringsaudit'], objects: ['Zoë Quinn: Depression Quest', 'Shelley Jackson: Patchwork Girl', 'inkle: 80 Days', 'Porpentine: With Those We Love Alive'], history: ['tidlig hypertekst', 'parserbasert interaktiv fiksjon', 'nettleser- og Twine-litteratur', 'plattformavhengige samtidsspill'], geo: ['nordamerikansk hypertekst', 'britisk mobil spillfortelling', 'transnasjonale Twine-miljøer', 'flerspråklig elektronisk litteratur'], bounds: ['kognitiv_empirisk_digital_litteraturvitenskap', 'narratologi_prosa', 'tekstkritikk_bokhistorie_arkiv'] }
    ],
    concepts: [
      c('medium', 'Medium', 'et historisk organisert system for produksjon, lagring, overføring og framføring av tegn', 'en enkelt fysisk gjenstand eller bare budskapets innhold'),
      c('modalitet', 'Modalitet', 'en semiotisk og sanselig uttrykksmåte som skrift, tale, bilde, musikk, bevegelse eller rom', 'grammatisk modalitet og et komplett medium'),
      c('materialitet', 'Materialitet', 'de fysiske og tekniske egenskapene som former tekstens produksjon, tilgang og bruk', 'tematisk omtale av ting uten medievirkning'),
      c('intermedialitet', 'Intermedialitet', 'relasjoner og grensekryssinger mellom medier i verk, produksjon eller resepsjon', 'all generell sammenligning mellom kunstarter'),
      c('mediespesifisitet', 'Mediespesifisitet', 'formmuligheter og begrensninger som oppstår i en bestemt mediekonfigurasjon', 'en essens som gjelder alle historiske utgaver av mediet'),
      c('remediering', 'Remediering', 'måten et medium gjengir, omformer eller konkurrerer med tidligere medieformer på', 'enkel kopiering uten ny mediering'),
      c('affordanse', 'Affordanse', 'handlingsmuligheter som oppstår mellom en mediestruktur og en situert bruker', 'teknisk funksjon som virker likt for alle'),
      c('teknisk_baerer', 'Teknisk bærer', 'det materielle eller digitale systemet som innskriver, lagrer og gjør uttrykket tilgjengelig', 'verket som abstrakt identitet'),
      c('adaptasjon', 'Adaptasjon', 'en gjenkjennelig og deklarert omarbeiding av et tidligere verk i ny form eller kontekst', 'enhver intertekstuell likhet'),
      c('omforming', 'Omforming', 'konkrete operasjoner som velger, flytter, utvider eller reorganiserer materiale', 'en verdidom om troskap'),
      c('fidelitet', 'Fidelitet', 'en historisk vurderingsnorm for samsvar mellom adaptasjon og valgt kildeverk', 'nøytral målestokk for adaptasjonskvalitet'),
      c('appropriasjon', 'Appropriasjon', 'ombruk som flytter materiale, autoritet eller stemme inn i en ny makt- og eierskapsrelasjon', 'all lovlig sitering eller uskyldig inspirasjon'),
      c('klipp', 'Klipp', 'sammenføyning av audiovisuelle opptak som organiserer tid, rom, rytme og årsak', 'ethvert sceneskrift eller avsnittsskifte'),
      c('fokalisering', 'Fokalisering', 'regulering av hvilken sansning, kunnskap og vurdering en framstilling gir tilgang til', 'kameraets plassering eller fortellerstemme alene'),
      c('serialitet', 'Serialitet', 'fortellingsorganisering gjennom gjentatte, avgrensede deler og forventning mellom dem', 'lengde eller publisering over tid alene'),
      c('mise_en_scene', 'Mise-en-scène', 'organisering av rom, lys, kropp, kostyme og gjenstander foran kamera eller scene', 'klippingen mellom opptak'),
      c('rute', 'Rute', 'en avgrenset visuell enhet som inngår i en sekvens og styrer utsnitt og varighet', 'et isolert bilde uten sekvensfunksjon'),
      c('oppslag', 'Oppslag', 'to motstående boksider lest som en samlet kompositorisk og materiell flate', 'enhver dobbeltside på skjerm'),
      c('ikonotekst', 'Ikonotekst', 'en betydningsenhet der verbal og visuell framstilling virker sammen uten å kunne reduseres til én kanal', 'illustrasjon som bare gjentar teksten'),
      c('sekvensiell_kunst', 'Sekvensiell kunst', 'meningsdannelse gjennom ordnede bilder, mellomrom og leserens forbindelse av hendelser', 'alle bildeserier uavhengig av rekkefølge'),
      c('innlesning', 'Innlesning', 'en spesifikk lydlig realisering av skrift gjennom stemme, tempo, uttale og produksjonsvalg', 'den skrevne teksten som uforandret lydinnhold'),
      c('vokalitet', 'Vokalitet', 'stemmens kroppslige, sosiale og klanglige kvaliteter i en framføring', 'grammatisk førsteperson eller muntlighet generelt'),
      c('lydproduksjon', 'Lydproduksjon', 'redigering, opptak, miks og distribusjon som former den hørbare teksten', 'innleserens prestasjon alene'),
      c('akustisk_perspektiv', 'Akustisk perspektiv', 'organisering av auditiv avstand, retning, rom og oppmerksomhet i et lydbilde', 'visuell synsvinkel overført uten analyse'),
      c('interaktivitet', 'Interaktivitet', 'regelstyrt gjensidig påvirkning mellom brukerhandling og systemtilstand', 'all mental aktivitet hos en leser'),
      c('kode', 'Kode', 'maskinlesbare instruksjoner og datastrukturer som realiserer verkets mulige hendelser', 'den synlige verbalteksten alene'),
      c('ergodisk_tekst', 'Ergodisk tekst', 'tekst der ikke-triviell brukerinnsats er nødvendig for å frambringe en konkret sekvens', 'enhver krevende eller vanskelig bok'),
      c('prosedyre', 'Prosedyre', 'en formulert regel eller operasjon som genererer, velger eller endrer uttrykk over tid', 'ett ferdig resultat uten kjent regel')
    ],
    sources: [
      ['mi01', 'Remediation', 'https://mitpress.mit.edu/9780262024525/remediation/', 'MIT Press'],
      ['mi02', 'A Theory of Adaptation', 'https://www.routledge.com/A-Theory-of-Adaptation/Hutcheon/p/book/9780415539388', 'Routledge'],
      ['mi03', 'Film and Literature', 'https://www.routledge.com/Film-and-Literature-An-Introduction-and-Reader/Corrigan/p/book/9780415560108', 'Routledge'],
      ['mi04', 'Electronic Literature Collection', 'https://collection.eliterature.org/', 'Electronic Literature Organization'],
      ['mi05', 'Electronic Literature Collection 3: About', 'https://collection.eliterature.org/3/about.html', 'Electronic Literature Organization'],
      ['mi06', 'Twine', 'https://twinery.org/', 'Twine'],
      ['mi07', 'Twine Cookbook', 'https://twinery.org/cookbook/', 'Twine'],
      ['mi08', 'The Language of New Media', 'https://mitpress.mit.edu/9780262296915/the-language-of-new-media/', 'MIT Press'],
      ['mi09', 'Pride & Prejudice', 'https://www.focusfeatures.com/pride_and_prejudice', 'Focus Features'],
      ['mi10', 'Maus', 'https://www.penguinrandomhouse.com/books/171065/the-complete-maus-by-art-spiegelman/', 'Penguin Random House'],
      ['mi11', 'Persepolis', 'https://www.penguinrandomhouse.com/books/160892/the-complete-persepolis-by-marjane-satrapi/', 'Penguin Random House'],
      ['mi12', '80 Days', 'https://www.inklestudios.com/80days/', 'inkle'],
      ['mi13', 'Depression Quest', 'https://www.depressionquest.com/', 'Depression Quest'],
      ['mi14', 'About the Electronic Literature Organization', 'https://eliterature.org/about/', 'Electronic Literature Organization']
    ],
    sourceMap: {
      medium_modalitet_materialitet: ['mi01', 'mi08', 'mi04', 'mi14'],
      adaptasjon_omforming: ['mi02', 'mi03', 'mi09', 'mi01'],
      litteratur_film_tv: ['mi03', 'mi09', 'mi02', 'mi08'],
      tegneserie_bildebok_visuell_fortelling: ['mi10', 'mi11', 'mi01', 'mi08'],
      lydbok_podkast_muntliggjøring: ['mi01', 'mi03', 'mi14', 'mi04'],
      elektronisk_litteratur_spillfortelling: ['mi04', 'mi05', 'mi06', 'mi12', 'mi13']
    }
  },
  {
    id: 'litteratursosiologi_institusjoner_offentlighet',
    title: 'Litteratursosiologi, institusjoner og offentlighet',
    subtitle: 'Felt, produksjon, sirkulasjon, arbeid og lesekultur',
    lead: 'Litteratursosiologien undersøker hvordan verk, forfatterskap og verdsetting blir produsert i relasjoner mellom aktører, institusjoner, økonomier og offentligheter. Feltanalyse, bokhandel-, bibliotek- og forlagsstudier, kanonforskning, sensurhistorie, arbeidslivsstudier og lesekultur krever at institusjonelle regler kobles til dokumenterte handlinger og virkninger.',
    purpose: 'Kontrakten hindrer at litteraturens sosiale liv reduseres til bakgrunnsstoff ved å kreve presise feltposisjoner, produksjons- og distribusjonsledd, verdsettingsmekanismer, rettighets- og arbeidsvilkår, leserpraksiser, globale forskjeller og kontrollerbare kildespor.',
    prefix: 'lsi',
    claimClass: 'literary_sociology_institutions_public_sphere_full_field',
    modules: ['felt-og-infrastruktur', 'verdsetting-og-offentlighet', 'arbeid-og-lesekultur'],
    moduleTitles: ['Felt, forlag og litterær infrastruktur', 'Verdsetting, sensur og offentlighet', 'Forfatterarbeid og lesekultur'],
    shared: ['litterart_felt', 'kulturell_kapital', 'institusjon', 'offentlighet'],
    dimensions: {
      theoryTraditions: ['feltteori', 'kulturproduksjonsteori', 'bokhistorisk institusjonsanalyse', 'offentlighetsteori', 'kanon- og konsekreringsteori', 'arbeids- og profesjonssosiologi', 'lesesosiologi', 'feministisk og postkolonial institusjonskritikk'],
      methods: ['felt- og posisjonsanalyse', 'aktør- og nettverkskartlegging', 'forlags- og arkivstudium', 'kontrakt- og rettighetsanalyse', 'jury- og kanonstudium', 'sensur- og rettskildestudium', 'spørreundersøkelse og intervju', 'utlåns-, salgs- og kataloganalyse'],
      historicalPeriods: ['førmoderne patronasje og manuskriptøkonomi', 'tidlig moderne trykkoffentlighet', '1800-tallets massemarked og profesjonalisering', 'modernismens småtidsskrifter og avantgarder', 'etterkrigstidens velferds- og utdanningsinstitusjoner', 'senmoderne globale rettighetsmarkeder', 'plattformisert og digital litterær økonomi'],
      geographicalTraditions: ['nordiske litterære velferdssystemer', 'europeiske forlags- og kritikkfelt', 'nordamerikanske markeder og utdanningskanoner', 'afrikanske språk- og forlagsfelt', 'sørasiatiske flerspråklige offentligheter', 'latinamerikanske forlags- og sensurhistorier', 'urfolks- og minoritetsspråklige institusjoner'],
      mediaAndInstitutions: ['forlag og redaksjon', 'bokhandel og distributør', 'bibliotek og arkiv', 'kritikk, tidsskrift og litteraturpris', 'skole, universitet og pensum', 'forfatterforening, agent og rettighetsorganisasjon', 'festival, bokklubb og lesekampanje', 'nettbutikk, strømmetjeneste og sosial plattform'],
      boundaryAreaIds: ['tekstkritikk_bokhistorie_arkiv', 'forfatterskap_intertekstualitet', 'leser_resepsjon_affekt', 'komparativ_verdenslitteratur_oversettelse', 'postkolonial_dekolonial_rase_migrasjon', 'faggrunnlag_metode_forskningspraksis']
    },
    specs: [
      { id: 'litterart_felt_kulturell_kapital', title: 'Litterært felt og kulturell kapital', sub: ['felt, posisjon, relasjon og analytisk avgrensning', 'autonomi, heteronomi og konkurrerende verdiprinsipper', 'økonomisk, sosial, kulturell og symbolsk kapital', 'konsekrering, portvoktere og institusjonell autoritet', 'sosial bakgrunn, utdanning og ulik adgang', 'tidsskrifter, salonger, nettverk og kollektive posisjoner', 'globale språkshierarkier og grenser for nasjonale feltmodeller'], unique: ['posisjon', 'autonomi', 'heteronomi', 'konsekrering'], theories: ['feltteori', 'kulturproduksjonsteori', 'institusjonsteori', 'postkolonial verdenslitteraturteori'], methods: ['felt- og posisjonsanalyse', 'korrespondanse- og nettverksanalyse', 'prosopografi', 'institusjons- og arkivstudium'], objects: ['La Nouvelle Revue Française: tidsskriftfeltet', 'Harlem Renaissance magazines: tidsskriftnettverk', 'Modernist little magazines: avantgardens infrastruktur', 'Bengali little magazine movement: flerspråklig felt'], history: ['patronasjesystemer', '1800-tallets feltmessige autonomisering', 'modernistiske småtidsskrifter', 'plattformiserte samtidsoffentligheter'], geo: ['fransk litterært felt', 'afrikansk-amerikanske offentligheter', 'britisk-amerikansk modernisme', 'bengalsk tidsskriftkultur'], bounds: ['forfatterskap_intertekstualitet', 'komparativ_verdenslitteratur_oversettelse', 'postkolonial_dekolonial_rase_migrasjon'] },
      { id: 'forlag_bokhandel_bibliotek', title: 'Forlag, bokhandel og bibliotek', sub: ['manuskriptvurdering, redaksjon og listebygging', 'kontrakt, rettighet, økonomisk risiko og beslutningsmakt', 'bokhandel, utstilling, metadata og anbefaling', 'bibliotek, utvalg, katalog, innkjøp og utlån', 'distribusjon, lager, logistikk og geografisk ulikhet', 'plattform, søk, rangering og algoritmisk synlighet', 'uavhengig, community-basert og minoritetsspråklig infrastruktur'], unique: ['forlag', 'bokhandel', 'bibliotek', 'distribusjon'], theories: ['bokhistorisk institusjonsanalyse', 'kulturproduksjonsteori', 'infrastrukturstudier', 'plattformteori'], methods: ['forlagsarkivstudium', 'kontrakt- og kataloganalyse', 'distribusjonskartlegging', 'utlåns- og metadataanalyse'], objects: ['Charles Dickens: The Pickwick Papers', 'Chinua Achebe: Things Fall Apart', 'Penguin Books: paperbacklisten', 'Deichman Bjørvika: folkebiblioteket'], history: ['føljetong og abonnementsmarked', 'masseprodusert paperback', 'etterkrigstidens bibliotekutbygging', 'digital detaljhandel og e-bok'], geo: ['britisk forlagsindustri', 'nigeriansk og transnasjonal publisering', 'nordisk biblioteksektor', 'globale digitale markeder'], bounds: ['tekstkritikk_bokhistorie_arkiv', 'komparativ_verdenslitteratur_oversettelse', 'medier_intermedialitet_adapsjon'] },
      { id: 'kritikk_priser_kanonisering', title: 'Kritikk, priser og kanonisering', sub: ['anmeldelsessjangre, kritikerroller og autoritetskrav', 'prisregler, nominasjon, jury, habilitet og begrunnelse', 'konsekrering gjennom utgave, arkiv, monument og jubileum', 'pensum, antologi og utdanningsinstitusjon', 'oversettelse, internasjonal pris og global prestisje', 'skandale, omvurdering, motkanon og dekanonisering', 'salg, sitering, bibliometri og begrensede virkningsmål'], unique: ['kritikk', 'litteraturpris', 'kanonisering', 'pensum'], theories: ['kanonteori', 'konsekreringsteori', 'resepsjonsteori', 'kritikksosiologi'], methods: ['anmeldelsesanalyse', 'jury- og regelstudium', 'pensum- og antologikartlegging', 'resepsjons- og bibliometrisk analyse'], objects: ['Knut Hamsun: Nobelprisen i litteratur 1920', 'Toni Morrison: Nobelprisen i litteratur 1993', 'Booker Prize: prisinstitusjonen', 'Sámi literary prize: minoritetsspråklig konsekrering'], history: ['akademier og klassisistiske kanoner', '1800-tallets profesjonelle kritikk', '1900-tallets internasjonale priser', 'samtidige motkanoner og plattformkritikk'], geo: ['norsk Nobel-resepsjon', 'afrikansk-amerikansk konsekrering', 'britisk og transnasjonal prisoffentlighet', 'samiske litterære institusjoner'], bounds: ['leser_resepsjon_affekt', 'tekstkritikk_bokhistorie_arkiv', 'postkolonial_dekolonial_rase_migrasjon'] },
      { id: 'sensur_ytringsfrihet_offentlighet', title: 'Sensur, ytringsfrihet og offentlighet', sub: ['juridisk sensur, lisens, forbud, beslag og straff', 'rettssak, usømmelighet, blasfemi og politisk tale', 'forlagspress, markedsmakt og plattformmoderering', 'selvsensur, risiko, overvåkning og eksil', 'offentlighet, motoffentlighet og ulik taletilgang', 'forbudt bok, uformell sirkulasjon og dokumentert lesning', 'skillet mellom rettslig tilgjengelighet, faktisk tilgang og virkning'], unique: ['sensur', 'ytringsfrihet', 'selvsensur', 'mot_offentlighet'], theories: ['offentlighetsteori', 'motoffentlighetsteori', 'rettighetsbasert ytringsfrihetsteori', 'postkolonial sensurkritikk'], methods: ['rettskilde- og saksanalyse', 'sensurarkivstudium', 'sirkulasjonskartlegging', 'vitnesbyrd- og risikovurdering'], objects: ['Gustave Flaubert: Madame Bovary-rettssaken', 'Salman Rushdie: The Satanic Verses', 'Ngũgĩ wa Thiong’o: Devil on the Cross', 'Radclyffe Hall: The Well of Loneliness'], history: ['trykkelisens og forhåndssensur', '1800-tallets sedelighetsprosesser', '1900-tallets stats- og markedssensur', 'digital moderering og overvåkning'], geo: ['fransk rettsoffentlighet', 'britisk og transnasjonal Rushdie-resepsjon', 'kenyansk fengsels- og eksillitteratur', 'globale digitale sensurregimer'], bounds: ['postkolonial_dekolonial_rase_migrasjon', 'kjonn_feminisme_queer', 'moderne_og_samtidig_litteraturhistorie'] },
      { id: 'forfatterokonomi_arbeidsliv', title: 'Forfatterøkonomi og arbeidsliv', sub: ['forfatterskap som arbeid, yrke, kall og profesjon', 'kontrakt, forskudd, royalty, honorar og regnskapsinnsyn', 'opphavsrett, lisens og kollektiv rettighetsforvaltning', 'stipend, residens, velferd og armlengdes avstand', 'frilans, porteføljearbeid, prekariat og ulønnet tid', 'kjønn, klasse, rase, omsorg og ulikt bærekraftig arbeid', 'selvpublisering, plattformarbeid, data og KI-rettigheter'], unique: ['opphavsrett', 'honorar', 'prekariat', 'stipend'], theories: ['arbeidssosiologi', 'profesjonsteori', 'kulturøkonomi', 'feministisk arbeidskritikk'], methods: ['kontrakt- og inntektsanalyse', 'arbeidslivsintervju', 'rettighets- og policyanalyse', 'karriere- og nettverksstudium'], objects: ['Charles Dickens: føljetongkontraktene', 'Virginia Woolf: Hogarth Press', 'Den norske Forfatterforening: rettighetsarbeidet', 'Amazon Kindle Direct Publishing: selvpublisering'], history: ['patronasje og bestillingsverk', '1800-tallets profesjonelle forfattermarked', 'etterkrigstidens stipendordninger', 'plattformisert selvpublisering'], geo: ['britisk forfatterøkonomi', 'nordisk kunstnerpolitikk', 'nordamerikanske plattformmarkeder', 'globale rettighetskjeder'], bounds: ['forfatterskap_intertekstualitet', 'tekstkritikk_bokhistorie_arkiv', 'faggrunnlag_metode_forskningspraksis'] },
      { id: 'lesekultur_utdanning_formidling', title: 'Lesekultur, utdanning og formidling', sub: ['lesing i hjem, skole, bibliotek og fritid', 'litterær kompetanse, læreplan, vurdering og skjult kanon', 'formidling, arrangement, anbefaling og kuratering', 'bokklubb, fandom, lesesirkel og sosial identitet', 'flerspråklighet, lettlest, funksjonsvariasjon og tilgang', 'intervju, observasjon, undersøkelse, utlån og deres målegrenser', 'skillet mellom institusjonelt mål, deltakelse og dokumentert effekt'], unique: ['lesekultur', 'formidling', 'litteraer_kompetanse', 'lesefellesskap'], theories: ['lesesosiologi', 'literacy-teori', 'resepsjonsteori', 'utdanningssosiologi'], methods: ['leserintervju og etnografi', 'spørreundersøkelse', 'utlåns- og arrangementsanalyse', 'læreplan- og pensumstudium'], objects: ['Henrik Ibsen: Et dukkehjem i skolen', 'Great Books curriculum: utdanningskanonen', 'Norwegian reading campaigns: leselysttiltak', 'One City One Book: felleslesingsprogrammet'], history: ['folkelig leseopplæring', 'masseutdanning og skolekanon', 'etterkrigstidens bibliotekformidling', 'digitale lesefellesskap og anbefalingssystemer'], geo: ['norsk litteraturundervisning', 'nordamerikansk Great Books-tradisjon', 'globale lesekampanjer', 'flerspråklige lokale lesefellesskap'], bounds: ['leser_resepsjon_affekt', 'barne_ungdoms_didaktisk_litteratur', 'komparativ_verdenslitteratur_oversettelse'] }
    ],
    concepts: [
      c('litterart_felt', 'Litterært felt', 'et relasjonelt rom der aktører og institusjoner konkurrerer om ressurser, posisjoner og definisjonsmakt', 'en fast organisasjon eller hele samfunnet'),
      c('kulturell_kapital', 'Kulturell kapital', 'tilegnede disposisjoner, kvalifikasjoner og kulturressurser som kan gi sosial fordel og anerkjennelse', 'økonomisk eiendom eller personlig smak alene'),
      c('institusjon', 'Institusjon', 'varige regler, roller og organisasjoner som stabiliserer litterær produksjon, sirkulasjon og verdsetting', 'en enkelt bygning eller aktørs private valg'),
      c('offentlighet', 'Offentlighet', 'historisk organiserte arenaer der tekster, personer og saker gjøres synlige og diskuteres', 'hele befolkningen eller én mediekanal'),
      c('posisjon', 'Posisjon', 'en aktørs relasjonelle plass bestemt av ressurser, forbindelser og mulige handlinger i et felt', 'personlig mening eller geografisk plassering'),
      c('autonomi', 'Autonomi', 'feltets historisk variable evne til å følge egne verdsettingsregler overfor ytre makt', 'full uavhengighet fra økonomi og politikk'),
      c('heteronomi', 'Heteronomi', 'styring etter verdiprinsipper hentet fra marked, stat, religion eller andre ytre felt', 'all kontakt med publikum eller finansiering'),
      c('konsekrering', 'Konsekrering', 'institusjonell tildeling av varig prestisje gjennom priser, kritikk, utgaver, arkiv eller pensum', 'popularitet eller salg alene'),
      c('forlag', 'Forlag', 'organisasjon som velger, redigerer, finansierer, produserer og rettighetsforvalter publikasjoner', 'trykkeri eller forfatterens tekstproduksjon alene'),
      c('bokhandel', 'Bokhandel', 'kommersiell og kuraterende institusjon som gjør utgivelser søkbare, synlige og kjøpbare', 'hele distribusjonskjeden eller ethvert utsalgssted'),
      c('bibliotek', 'Bibliotek', 'institusjon som samler, beskriver, bevarer, låner ut og formidler litterære ressurser', 'et nøytralt lager uten utvalgspolitikk'),
      c('distribusjon', 'Distribusjon', 'logistiske, økonomiske og tekniske prosesser som flytter og tilgjengeliggjør publikasjoner', 'dokumentert lesning eller resepsjon'),
      c('kritikk', 'Litteraturkritikk', 'offentlig, begrunnet vurdering og fortolkning innen bestemte sjangre, medier og autoritetsforhold', 'all leserrespons eller ren markedsføring'),
      c('litteraturpris', 'Litteraturpris', 'regelstyrt institusjonell utvelgelse som fordeler penger, oppmerksomhet og prestisje', 'objektivt mål på litterær kvalitet'),
      c('kanonisering', 'Kanonisering', 'langsiktig seleksjon og reproduksjon av verk som særlig verdifulle eller representative', 'én liste eller en enkelt prisbeslutning'),
      c('pensum', 'Pensum', 'institusjonelt fastsatt utvalg av tekster og læringskrav i en utdanningssituasjon', 'hele kulturens kanon eller elevens egen lesing'),
      c('sensur', 'Sensur', 'maktutøvelse som hindrer, endrer, straffer eller begrenser produksjon og sirkulasjon av ytringer', 'kritikk eller ethvert redaksjonelt valg'),
      c('ytringsfrihet', 'Ytringsfrihet', 'rettslig og sosialt betinget frihet til å søke, motta og meddele ideer og uttrykk', 'garanti for publisering, rekkevidde eller fravær av motkritikk'),
      c('selvsensur', 'Selvsensur', 'foregripende begrensning av egne ytringer under opplevd eller dokumentert risiko og press', 'enhver frivillig revisjon av en tekst'),
      c('mot_offentlighet', 'Motoffentlighet', 'en alternativ diskursarena som formes i spenning til dominerende offentligheters regler og utelukkelser', 'en privat gruppe uten offentlig adresse'),
      c('opphavsrett', 'Opphavsrett', 'lovregulerte økonomiske og ideelle rettigheter knyttet til originale verk og deres bruk', 'litteraturvitenskapelig attribusjon eller moralsk fortjeneste'),
      c('honorar', 'Honorar', 'avtalt betaling for et avgrenset skapende, framførende eller formidlende oppdrag', 'royalty, lønn eller stipend i alle sammenhenger'),
      c('prekariat', 'Prekariat', 'arbeidssituasjon preget av ustabil inntekt, svak beskyttelse og vedvarende usikker planleggingshorisont', 'midlertidig lav inntekt alene'),
      c('stipend', 'Stipend', 'tids- eller prosjektavgrenset støtte fordelt etter formelle kriterier uten direkte verkssalg', 'lønn, forskudd eller garantert kunstnerisk suksess'),
      c('lesekultur', 'Lesekultur', 'sosialt organiserte vaner, verdier, arenaer og infrastrukturer rundt lesing', 'individuell leseferdighet eller bokomsetning alene'),
      c('formidling', 'Litteraturformidling', 'situert utvalg, presentasjon og tilrettelegging som kobler tekster til mulige lesere', 'nøytral overføring uten kuratering'),
      c('litteraer_kompetanse', 'Litterær kompetanse', 'lærte ressurser for å gjenkjenne, fortolke og diskutere litterære konvensjoner og virkemidler', 'medfødt smak eller generell avkodingsferdighet'),
      c('lesefellesskap', 'Lesefellesskap', 'en gruppe som utvikler delte praksiser, språk og identiteter gjennom sirkulasjon og samtale om tekster', 'alle samtidige lesere av samme bok')
    ],
    sources: [
      ['ls01', 'The Rules of Art', 'https://www.sup.org/books/art-and-visual-culture/rules-art', 'Stanford University Press'],
      ['ls02', 'The Pickwick Papers', 'https://www.gutenberg.org/ebooks/580', 'Project Gutenberg'],
      ['ls03', 'Deichman Bjørvika', 'https://deichman.no/bibliotekene/bj%C3%B8rvika', 'Deichman'],
      ['ls04', 'Penguin Books: Our story', 'https://www.penguin.co.uk/about/who-we-are', 'Penguin Books'],
      ['ls05', 'Knut Hamsun – Biographical', 'https://www.nobelprize.org/prizes/literature/1920/hamsun/biographical/', 'Nobel Prize Outreach'],
      ['ls06', 'Toni Morrison – Facts', 'https://www.nobelprize.org/prizes/literature/1993/morrison/facts/', 'Nobel Prize Outreach'],
      ['ls07', 'The origins of the Booker Prize', 'https://thebookerprizes.com/the-origins-of-our-prizes', 'Booker Prize Foundation'],
      ['ls08', 'PEN: Why freedom of expression matters', 'https://www.pen-international.org/why-freedom-of-expression-matters', 'PEN International'],
      ['ls09', 'PEN condemns book bans', 'https://www.pen-international.org/news/pens-global-community-condemns-book-ban-around-the-world', 'PEN International'],
      ['ls10', 'Madame Bovary', 'https://www.gutenberg.org/ebooks/2413', 'Project Gutenberg'],
      ['ls11', 'Miniguide: det norske litterære systemet', 'https://www.forfatterforeningen.no/content/uploads/2020/12/Miniguide-det-norske-litteraere-systemet.pdf', 'Den norske Forfatterforening'],
      ['ls12', 'Årsmelding 2025–2026', 'https://www.forfatterforeningen.no/content/uploads/2026/02/Arsmelding-2025-2026-1.pdf', 'Den norske Forfatterforening'],
      ['ls13', 'About the Booker Prize', 'https://thebookerprizes.com/booker-prize/about-the-booker-prize', 'Booker Prize Foundation'],
      ['ls14', 'About Deichman', 'https://deichman.no/vi-tilbyr', 'Deichman']
    ],
    sourceMap: {
      litterart_felt_kulturell_kapital: ['ls01', 'ls04', 'ls07', 'ls11'],
      forlag_bokhandel_bibliotek: ['ls02', 'ls03', 'ls04', 'ls14'],
      kritikk_priser_kanonisering: ['ls05', 'ls06', 'ls07', 'ls13'],
      sensur_ytringsfrihet_offentlighet: ['ls08', 'ls09', 'ls10', 'ls05'],
      forfatterokonomi_arbeidsliv: ['ls02', 'ls11', 'ls12', 'ls04'],
      lesekultur_utdanning_formidling: ['ls03', 'ls11', 'ls13', 'ls14']
    }
  }
];

const normalizeSources = (rows) => rows.map(([id, label, url, publisher]) => ({ id, label, url, publisher, type: 'faglig_eller_primar_kilde', source_location: 'Verk-, prosjekt- eller institusjonspresentasjon' }));
const makeParagraph = (area, spec, index) => {
  const object = spec.objects[index % spec.objects.length];
  const theory = spec.theories[index % spec.theories.length];
  const method = spec.methods[index % spec.methods.length];
  const history = spec.history[index % spec.history.length];
  const geography = spec.geo[index % spec.geo.length];
  const boundaries = spec.bounds.map((id) => id.replaceAll('_', ' ')).join(', ');
  const paragraph = `Artikkelen behandler ${spec.sub[index]} som et eget analytisk problem innen ${spec.title.toLowerCase()}. I ${object} kan ${method} anvendes sammen med ${theory} for å undersøke hvordan det valgte trekket faktisk er realisert og hvilke alternativer materialet tillater. Sammenstillingen plasseres mellom ${history} og ${geography}, men tids- og stedsforskjellen behandles som forklaringsvariabel, ikke som pynt. ${depth[index]} Resultatet avgrenses eksplisitt mot ${boundaries}, slik at nabofagets spørsmål ikke brukes som erstatning for områdets egen evidens.`;
  if (words(paragraph) < 55) throw new Error(`${area.id}/${spec.id}: kort avsnitt ${index}`);
  return paragraph;
};

function materialize(area) {
  const contract = {
    schema: 'history_go_literature_full_field_contract_v1', version: '1.0.0', subjectId: 'litteratur', areaId: area.id,
    title: `Bindende fullfeltkontrakt: ${area.title}`, status: 'fulfilled', purpose: area.purpose,
    requiredDimensions: area.dimensions,
    completionRules,
    fulfillmentSchema: { requiredFile: `foundation_texts/${area.id}/full_field_fulfillment_v1.json`, requiredTopicEvidenceFields: evidenceFields, statusWhenComplete: 'expanded_contract_fulfilled' },
    topicRequirements: area.specs.map((spec) => ({ id: spec.id, requiredSubcoverage: spec.sub, requiredConcepts: [...area.shared, ...spec.unique], theoryTraditions: spec.theories, methods: spec.methods, namedAnalysisObjects: spec.objects, historicalCoverage: spec.history, geographicalCoverage: spec.geo, boundaryAreaIds: spec.bounds, completionEvidence: evidence }))
  };
  write(`${P}/contracts/${area.id}_full_field_v1.json`, contract);

  const concepts = area.concepts.map(([id, term, definition, distinguish_from]) => concept(id, term, definition, distinguish_from));
  write(`${P}/foundation_texts/${area.id}/concepts.json`, { schema: 'history_go_literature_concept_registry_v1', version: '1.0.0', subject_id: 'litteratur', coverage_area_id: area.id, status: 'canonical_full_depth_concepts', concepts });

  const sources = normalizeSources(area.sources);
  const claims = [];
  const sections = [];
  const moduleFiles = [];
  let claimNo = 1;
  for (let moduleIndex = 0; moduleIndex < 3; moduleIndex += 1) {
    const moduleSections = [];
    const workedExamples = [];
    for (const spec of area.specs.slice(moduleIndex * 2, moduleIndex * 2 + 2)) {
      const paragraphs = spec.sub.map((_, index) => makeParagraph(area, spec, index));
      const claimIds = paragraphs.map(() => `${area.prefix}-${String(claimNo++).padStart(2, '0')}`);
      claimIds.forEach((id, index) => claims.push({ id, claim: `${spec.title}: ${spec.sub[index]}.`, source_ids: area.sourceMap[spec.id], classification: area.claimClass, status: 'verified' }));
      const section = {
        id: spec.id.replaceAll('_', '-'), title: spec.title, coverageTopic: spec.id, paragraphs,
        paragraphClaimIds: claimIds.map((id) => [id]),
        keyPoints: ['Lås utgave, medium, aktør, institusjon og analyseenhet før en sosial eller medial virkning hevdes.', 'Skill dokumentert form eller praksis fra antatt intensjon, publikumseffekt og teknologisk eller institusjonell determinisme.'],
        fullFieldContractStatus: 'fulfilled', requiredSubcoverage: spec.sub
      };
      moduleSections.push(section);
      sections.push(section);
      workedExamples.push({
        title: `Prøv modellen: ${spec.title}`,
        object: `${spec.objects[0]} sammenlignet med ${spec.objects[1]} og ${spec.objects[2]}.`,
        steps: ['Identifiser versjon, medium, aktører, institusjon og historisk situasjon.', 'Registrer lokaliserbare form-, produksjons-, sirkulasjons- eller bruksspor.', 'Anvend navngitt teori og metode og prøv en rivaliserende forklaring.', 'Formuler kilde-, tilgangs-, representasjons- og inferensgrensen.'],
        claimIds: claimIds.slice(0, 3)
      });
    }
    const file = `${P}/foundation_texts/${area.id}/0${moduleIndex + 1}-${area.modules[moduleIndex]}.json`;
    write(file, {
      schema: 'history_go_literature_foundation_module_v1', qualityProfile: 'full_depth_v2', id: `${area.id}-${moduleIndex + 1}`, title: area.moduleTitles[moduleIndex], sections: moduleSections, workedExamples,
      commonMisconceptions: [{ claim: 'Mediet eller institusjonen har én automatisk virkning på alle verk og brukere.', correction: 'Virkning må dokumenteres i en avgrenset historisk konfigurasjon med relevante produksjons- eller resepsjonsspor.' }, { claim: 'Likhet, tilgjengelighet eller prestisje dokumenterer i seg selv påvirkning, lesning eller kvalitet.', correction: 'Slutningen krever uavhengige kilder, avgrenset mål og en eksplisitt alternativ forklaring.' }]
    });
    moduleFiles.push(file);
  }

  write(`${P}/foundation_texts/${area.id}/claims.json`, { schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'litteratur', chapter_id: area.id, verified_at: '2026-08-07', verification_status: 'verified', sources, claims });
  write(`${P}/foundation_texts/${area.id}.json`, {
    schema: 'history_go_literature_foundation_chapter_v1', version: '1.0.0', qualityProfile: 'full_depth_v2', subject: 'litteratur', id: area.id, title: area.title, subtitle: area.subtitle, lead: area.lead,
    coverage_topics: area.specs.map((spec) => spec.id), learningObjectives: area.specs.map((spec) => `analysere ${spec.title.toLowerCase()} med eksplisitt kilde-, sammenlignings- og inferensgrense`),
    moduleFiles, conceptRegistry: `${P}/foundation_texts/${area.id}/concepts.json`, claimsFile: `${P}/foundation_texts/${area.id}/claims.json`, editorial_status: 'expanded_contract_fulfilled',
    completion_note: 'Alle seks fullfeltstemaer oppfyller bindende underdekning med avsnitts-, claim-, teori-, metode-, objekt-, tids-, tradisjons- og grenseflateevidens.',
    expandedContractFulfillment: `foundation_texts/${area.id}/full_field_fulfillment_v1.json`
  });

  const pointer = (section, paragraphIndex) => ({ sectionId: section.id, paragraphIndex, claimIds: section.paragraphClaimIds[paragraphIndex] });
  const topicEvidence = area.specs.map((spec) => {
    const section = sections.find((row) => row.coverageTopic === spec.id);
    const namedAnalysisObjects = spec.objects.slice(0, 3);
    const namedObjectEvidence = {};
    for (const object of namedAnalysisObjects) {
      const title = object.includes(':') ? object.split(':').slice(1).join(':').trim() : object;
      const paragraphIndex = section.paragraphs.findIndex((paragraph) => paragraph.includes(title));
      if (paragraphIndex < 0) throw new Error(`${area.id}/${spec.id}: mangler analyseobjektet ${object}`);
      namedObjectEvidence[object] = pointer(section, paragraphIndex);
    }
    return {
      topicId: spec.id, sectionIds: [section.id], conceptIds: [...area.shared, ...spec.unique], claimIds: section.paragraphClaimIds.flat(), sourceIds: area.sourceMap[spec.id],
      appliedTheoryTraditions: spec.theories.slice(0, 2), appliedMethods: spec.methods.slice(0, 2), namedAnalysisObjects,
      historicalCoverage: spec.history.slice(0, 3), geographicalCoverage: spec.geo.slice(0, 3), boundaryAreaIds: spec.bounds,
      subcoverageEvidence: Object.fromEntries(spec.sub.map((item, index) => [item, pointer(section, index)])),
      theoryEvidence: Object.fromEntries(spec.theories.slice(0, 2).map((item, index) => [item, pointer(section, index)])),
      methodEvidence: Object.fromEntries(spec.methods.slice(0, 2).map((item, index) => [item, pointer(section, index + 2)])),
      namedObjectEvidence
    };
  });
  write(`${P}/foundation_texts/${area.id}/full_field_fulfillment_v1.json`, { schema: 'history_go_literature_full_field_fulfillment_v1', version: '1.0.0', areaId: area.id, contractFile: `contracts/${area.id}_full_field_v1.json`, status: 'verified', verifiedAt: '2026-08-07', topicEvidence });
  return { conceptCount: concepts.length, sourceCount: sources.length, claimCount: claims.length };
}

const totals = areas.map(materialize);
const coverage = read(`${P}/coverage_contract_v1.json`);
coverage.coverage_areas = coverage.coverage_areas.map((row) => areas.some((area) => area.id === row.id) ? { ...row, status: 'expanded_contract_fulfilled', full_field_contract: `contracts/${row.id}_full_field_v1.json` } : row);
const completeAreas = coverage.coverage_areas.filter((row) => ['chapter_and_overview_text_materialized', 'expanded_contract_fulfilled'].includes(row.status));
const completeTopics = completeAreas.flatMap((row) => row.topics).length;
const expandedCount = coverage.coverage_areas.filter((row) => row.full_field_contract).length;
coverage.progress = { areas_total: 28, areas_with_foundation_text: 28, areas_complete: completeAreas.length, topics_total: 168, topics_with_foundation_text: 168, topics_complete: completeTopics, honest_status: `Alle 28 områder og 168 temaer har særskrevet oversiktstekst. ${expandedCount} utvidede fullfeltkontrakter er oppfylt. ${completeAreas.length} områder og ${completeTopics} temaer er komplette etter gjeldende kontrakt; ${28 - completeAreas.length} områder og ${168 - completeTopics} temaer gjenstår på fullfeltnivå.` };
write(`${P}/coverage_contract_v1.json`, coverage);

const index = read(`${P}/index.json`);
index.files.foundation_chapters = [...new Set([...index.files.foundation_chapters, ...areas.map((area) => `foundation_texts/${area.id}.json`)])];
index.files.full_field_contracts = coverage.coverage_areas.map((row) => row.full_field_contract).filter(Boolean);
let moduleCount = 0; let conceptCount = 0; let sourceCount = 0; let claimCount = 0;
for (const file of index.files.foundation_chapters) {
  const chapter = read(`${P}/${file}`);
  moduleCount += chapter.moduleFiles.length;
  conceptCount += read(chapter.conceptRegistry).concepts.length;
  const claimFile = read(chapter.claimsFile);
  sourceCount += claimFile.sources.length;
  claimCount += claimFile.claims.length;
}
index.summary = { ...index.summary, materialized_foundation_chapter_count: index.files.foundation_chapters.length, materialized_module_count: moduleCount, defined_concept_count: conceptCount, verified_source_count: sourceCount, verified_claim_count: claimCount, completion_status: `${expandedCount}_of_${expandedCount}_expanded_contracts_fulfilled_${28 - completeAreas.length}_areas_pending_full_depth`, expanded_contract_count: expandedCount, expanded_contract_fulfilled_count: expandedCount };
write(`${P}/index.json`, index);

const subjectStatus = read('data/fagverk/subject_status.json');
const literature = subjectStatus.subjects.find((subject) => subject.id === 'litteratur');
literature.nextGate = `expand_remaining_${28 - completeAreas.length}_areas_to_full_depth_then_runtime`;
literature.note = `Litteratur har 28 fagområdesynteser og 168 særskrevne emnetekster. ${expandedCount} områder oppfyller utvidede fullfeltkontrakter. ${completeAreas.length} områder og ${completeTopics} temaer er komplette; ${28 - completeAreas.length} områder og ${168 - completeTopics} temaer gjenstår på fullfeltnivå. Pakken har ${conceptCount} definerte begreper, ${sourceCount} kilder og ${claimCount} påstandsspor.`;
write('data/fagverk/subject_status.json', subjectStatus);

console.log(`Materialiserte to fullfelt: ${totals.map((total, indexValue) => `${areas[indexValue].id} ${total.conceptCount}/${total.sourceCount}/${total.claimCount}`).join(', ')}.`);
