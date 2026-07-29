#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  pensum: 'data/fag/natur/naturpensum_canonical_v4_5.json',
  contract: 'data/fag/natur/natur_universal_coverage_contract_v1.json',
  emner: 'data/fag/natur/emner_natur_canonical_v4_5.json',
  methods: 'data/fag/natur/methods_natur_canonical_v4_5.json',
  fagkart: 'data/fag/natur/fagkart_natur_canonical_v4_5.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
};
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const TODAY = '2026-07-29';

const DOMAIN_SPECS = [
  {
    id: 'artskunnskap_systematikk',
    label: 'Artskunnskap og systematikk',
    shortLabel: 'Artskunnskap',
    definition: 'Domenet gjør arter og organismegrupper til et selvstendig kunnskapsfelt gjennom klassifikasjon, nomenklatur, artsbegreper, fylogeni, morfologisk identifikasjon, DNA-strekkoding og eksplisitt dokumentasjon av usikkerhet.',
    focus: ['taksonomi', 'nomenklatur', 'artsbegrep', 'fylogeni', 'bestemmelsesnøkkel', 'DNA-strekkoding'],
    questionRole: 'Start med et dokumentert eksemplar eller en observasjon; skill deretter identifikasjon, navn, klassifikasjon, slektskap og sikkerhetsgrad.',
    tagline: 'Hvordan organismer identifiseres, navngis, klassifiseres og plasseres i evolusjonære slektskap.',
    methods: ['met_natur_taksonomisk_kildekontroll', 'met_natur_morfologisk_artsbestemmelse', 'met_natur_dna_strekkodingsanalyse'],
    emners: [
      {
        id: 'em_natur_taksonomi_nomenklatur',
        title: 'Taksonomi og biologisk nomenklatur',
        short: 'Taksonomi',
        level: 1,
        definition: 'Emnet undersøker hvordan organismer ordnes i taksonomiske nivåer, hvordan vitenskapelige navn dannes og forvaltes, og hvorfor navn, takson og organisme ikke er det samme.',
        why: 'Presise og oppdaterte navn gjør funn sammenlignbare på tvers av steder og tider, mens synonymi og taksonomiske revisjoner ellers kan skape falske endringer i artsdata.',
        concepts: ['takson', 'domene', 'rike', 'rekke', 'klasse', 'orden', 'familie', 'slekt', 'art', 'binomial nomenklatur', 'synonym'],
        questions: [
          'Hvilket taksonomisk nivå beskriver gruppen, og hvilke nivåer ligger over og under?',
          'Hvilket vitenskapelig navn er akseptert i den valgte autoritative navnekilden?',
          'Skyldes navneforskjellen ulike organismer, synonymi eller en taksonomisk revisjon?'
        ],
        conflicts: ['navn vs takson', 'rangsystem vs fylogenetisk slektskap', 'akseptert navn vs historisk synonym'],
        distinctions: ['organisme vs takson', 'nomenklatur vs klassifikasjon', 'navneendring vs biologisk endring'],
        hooks: ['taksonomiske_nivaer', 'vitenskapelige_navn', 'referansesamlinger'],
        methods: ['met_natur_taksonomisk_kildekontroll', 'met_natur_morfologisk_artsbestemmelse'],
        places: ['naturhistorisk museum', 'herbarium', 'zoologisk samling', 'naturreservat']
      },
      {
        id: 'em_natur_artsbegreper_avgrensning',
        title: 'Artsbegreper og artsavgrensning',
        short: 'Artsbegreper',
        level: 2,
        definition: 'Emnet sammenligner biologiske, morfologiske, fylogenetiske og økologiske artsbegreper og undersøker hvordan reproduksjon, variasjon og slektskap brukes til å avgrense arter.',
        why: 'Hva som telles som én art påvirker kartlegging, rødlister og forvaltning, men ulike organismegrupper og datatyper gjør at én artsdefinisjon ikke løser alle tilfeller.',
        concepts: ['biologisk artsbegrep', 'morfologisk artsbegrep', 'fylogenetisk artsbegrep', 'reproduktiv isolasjon', 'artsavgrensning', 'arts-kompleks'],
        questions: [
          'Hvilket artsbegrep brukes, og hvilke datatyper gjør det anvendelig i dette tilfellet?',
          'Er variasjonen innenfor arten større enn forskjellen mellom de foreslåtte artene?',
          'Hvilken ny evidens ville kunne endre den foreløpige artsavgrensningen?'
        ],
        conflicts: ['reproduktiv isolasjon vs morfologisk likhet', 'kontinuerlig variasjon vs skarpe artsgrenser', 'praktisk bestemmelse vs evolusjonær avgrensning'],
        distinctions: ['art vs underart', 'variasjon innen art vs forskjell mellom arter', 'artsbegrep vs artsbestemmelse'],
        hooks: ['artsbegreper', 'artsbestemmelse_usikkerhet', 'dna_strekkoding'],
        methods: ['met_natur_taksonomisk_kildekontroll', 'met_natur_morfologisk_artsbestemmelse', 'met_natur_dna_strekkodingsanalyse'],
        places: ['museumssamling', 'naturreservat', 'kyst', 'skog']
      },
      {
        id: 'em_natur_fylogeni_slektskap',
        title: 'Fylogeni og evolusjonære slektskap',
        short: 'Fylogeni',
        level: 2,
        definition: 'Emnet lærer å lese fylogenetiske trær som hypoteser om felles avstamning og å skille knutepunkter, søstergrupper, klader, greinklengde og taksonomisk rang.',
        why: 'Et fylogenetisk tre viser forgreningsmønster, ikke en stige fra enkle til avanserte organismer, og korrekt lesning hindrer at nærhet på siden forveksles med nært slektskap.',
        concepts: ['fylogenetisk tre', 'klade', 'felles stamform', 'søstergruppe', 'knutepunkt', 'monofyli', 'utgruppe'],
        questions: [
          'Hvilke grupper deler den nærmeste dokumenterte felles stamformen i treet?',
          'Hvilke trekk eller sekvenser støtter den foreslåtte forgreningen?',
          'Hvilke deler av treet er robuste, og hvor finnes alternative hypoteser eller svak støtte?'
        ],
        conflicts: ['visuell nærhet vs felles avstamning', 'taksonomisk rang vs alder på klade', 'ett tre vs alternative fylogenier'],
        distinctions: ['knutepunkt vs nålevende art', 'søstergruppe vs direkte stamform', 'klade vs grad'],
        hooks: ['fylogenetiske_traer', 'homologi_analogi', 'dna_strekkoding'],
        methods: ['met_natur_taksonomisk_kildekontroll', 'met_natur_dna_strekkodingsanalyse'],
        places: ['naturhistorisk museum', 'museumssamling', 'fossillokalitet', 'forskningslaboratorium']
      },
      {
        id: 'em_natur_homologi_analogi_karakterer',
        title: 'Homologi, analogi og karakteranalyse',
        short: 'Karakteranalyse',
        level: 2,
        definition: 'Emnet undersøker hvordan arvelige karakterer, homologe strukturer og konvergent utviklede analogier brukes og feiltolkes når organismegrupper sammenlignes.',
        why: 'Like funksjoner kan ha utviklet seg uavhengig, mens svært ulike former kan bygge på samme grunnstruktur; dette er avgjørende for både bestemmelse og slektskapsanalyse.',
        concepts: ['karakter', 'karaktertilstand', 'homologi', 'analogi', 'konvergens', 'plesiomorfi', 'apomorfi'],
        questions: [
          'Er likheten best forklart som felles avstamning eller uavhengig tilpasning?',
          'Hvilke karaktertilstander kan sammenlignes uten å blande funksjon og opphav?',
          'Hvordan påvirker valg og koding av karakterer den resulterende klassifikasjonen?'
        ],
        conflicts: ['formlikhet vs felles opphav', 'funksjonell analogi vs strukturell homologi', 'enkeltkarakter vs samlet evidens'],
        distinctions: ['homologi vs analogi', 'karakter vs karaktertilstand', 'konvergens vs nært slektskap'],
        hooks: ['homologi_analogi', 'diagnostiske_kjennetegn', 'fylogenetiske_traer'],
        methods: ['met_natur_morfologisk_artsbestemmelse', 'met_natur_taksonomisk_kildekontroll'],
        places: ['naturhistorisk museum', 'zoologisk samling', 'herbarium']
      },
      {
        id: 'em_natur_bestemmelsesnokler_morfologi',
        title: 'Bestemmelsesnøkler og morfologiske kjennetegn',
        short: 'Bestemmelsesnøkler',
        level: 1,
        definition: 'Emnet trener trinnvis artsbestemmelse med dikotome og flerinngangsnøkler, målbare morfologiske trekk, relevant livsstadium og dokumenterte sammenligningsarter.',
        why: 'En bestemmelsesnøkkel gjør identifikasjonen etterprøvbar, men resultatet er bare så sikkert som eksemplaret, karakterene, geografien, årstiden og nøkkelens dekningsområde.',
        concepts: ['bestemmelsesnøkkel', 'karakterpar', 'diagnostisk trekk', 'målekarakter', 'livsstadium', 'referanseeksemplar'],
        questions: [
          'Hvilke observerbare kjennetegn leder fra hovedgruppe til den foreslåtte arten?',
          'Passer eksemplarets livsstadium, kjønn og geografiske område til nøkkelen?',
          'Hvilke nærstående arter må utelukkes, og hvilke trekk skiller dem?'
        ],
        conflicts: ['feltkjennetegn vs sikker diagnose', 'variabelt trekk vs diagnostisk trekk', 'ufullstendig eksemplar vs artsnivå'],
        distinctions: ['gjenkjennelse vs nøkkelbestemmelse', 'gruppebestemmelse vs artsbestemmelse', 'sannsynlig vs bekreftet identifikasjon'],
        hooks: ['bestemmelsesnokler', 'diagnostiske_kjennetegn', 'artsbestemmelse_usikkerhet'],
        methods: ['met_natur_morfologisk_artsbestemmelse', 'met_natur_taksonomisk_kildekontroll'],
        places: ['skog', 'våtmark', 'strand', 'park', 'museumssamling']
      },
      {
        id: 'em_natur_dna_strekkoding_integrativ_taksonomi',
        title: 'DNA-strekkoding og integrativ taksonomi',
        short: 'DNA-strekkoding',
        level: 3,
        definition: 'Emnet undersøker hvordan standardiserte DNA-regioner sammenlignes med referansesekvenser og hvordan genetiske, morfologiske, geografiske og økologiske data kombineres i integrativ taksonomi.',
        why: 'DNA-strekkoding kan avsløre kryptiske arter og kontrollere vanskelige identifikasjoner, men en sekvensmatch er avhengig av prøvekvalitet, markørvalg og korrekt bestemte referanser.',
        concepts: ['DNA-strekkode', 'referansebibliotek', 'sekvenslikhet', 'markør', 'kryptisk art', 'integrativ taksonomi', 'kontaminasjon'],
        questions: [
          'Hvilken genetisk markør, prøve og referansedatabase ligger bak identifikasjonen?',
          'Hvor godt skiller sekvensen den foreslåtte arten fra nærstående arter?',
          'Samsvarer genetisk resultat med morfologi, geografi og økologi, eller finnes en konflikt?'
        ],
        conflicts: ['sekvensmatch vs artsdiagnose', 'referansedatabase vs feilbestemt belegg', 'én markør vs samlet taksonomisk evidens'],
        distinctions: ['DNA-strekkoding vs helgenomdata', 'genetisk avstand vs artsgrense', 'prøve vs referansesekvens'],
        hooks: ['dna_strekkoding', 'referansesamlinger', 'artsbestemmelse_usikkerhet'],
        methods: ['met_natur_dna_strekkodingsanalyse', 'met_natur_taksonomisk_kildekontroll', 'met_natur_morfologisk_artsbestemmelse'],
        places: ['forskningslaboratorium', 'museumssamling', 'naturreservat', 'ferskvann']
      }
    ],
    hooks: [
      ['taksonomiske_nivaer', 'Taksonomiske nivåer', 'Hvordan plasseres organismen fra større gruppe til art uten å forveksle rang med evolusjonær betydning?', ['akseptert taksonomisk hierarki', 'navnekilde og revisjonsdato', 'gruppekjennetegn på flere nivåer']],
      ['vitenskapelige_navn', 'Vitenskapelige navn', 'Hvilket vitenskapelig navn er gyldig i navnekilden, og hvordan dokumenteres autor, synonymi og navneendring?', ['akseptert navn og autor', 'synonymhistorikk', 'navnekilde med versjon eller dato']],
      ['artsbegreper', 'Artsbegreper', 'Hvilket artsbegrep brukes i den konkrete avgrensningen, og hvilke organismer eller datatyper passer det dårlig for?', ['reproduksjons- eller populasjonsdata', 'morfologisk variasjon', 'fylogenetisk eller økologisk evidens']],
      ['fylogenetiske_traer', 'Fylogenetiske trær', 'Hvilken felles stamform og hvilke søstergrupper viser treet, og hvilken støtte finnes for forgreningene?', ['tre med oppgitt datagrunnlag', 'støtteverdier eller alternative trær', 'karakter- eller sekvensmatrise']],
      ['homologi_analogi', 'Homologi og analogi', 'Er det sammenlignede trekket arvet fra en felles stamform eller utviklet uavhengig under lignende funksjonspress?', ['anatomisk posisjon og utvikling', 'sammenligning på tvers av grupper', 'fylogenetisk fordeling av trekket']],
      ['bestemmelsesnokler', 'Bestemmelsesnøkler', 'Hvilke karaktervalg fører gjennom nøkkelen, og hvor kan et ufullstendig eller atypisk eksemplar gi feil vei?', ['nøkkel og dekningsområde', 'observerte karaktervalg', 'livsstadium, kjønn og lokalitet']],
      ['diagnostiske_kjennetegn', 'Diagnostiske kjennetegn', 'Hvilke målbare eller avbildbare trekk skiller taksonet fra de nærmeste forvekslingsartene?', ['mål eller detaljfoto', 'referansebeskrivelse', 'sammenligningsarter og skillekarakterer']],
      ['dna_strekkoding', 'DNA-strekkoding', 'Hvor entydig knytter markørsekvensen prøven til kvalitetssikrede referanser, og hvilke alternative treff finnes?', ['prøve- og markørmetadata', 'sekvenskvalitet og treff', 'verifiserte referansebelegg']],
      ['artsbestemmelse_usikkerhet', 'Usikker artsbestemmelse', 'Hvilket taksonomisk nivå støttes sikkert, og hva må undersøkes før identifikasjonen kan snevres inn?', ['observerte og manglende trekk', 'alternative bestemmelser', 'ekspertkontroll eller supplerende prøve']],
      ['referansesamlinger', 'Referansesamlinger', 'Hvordan kan et fysisk belegg, herbariumark eller sekvensvouchere gjøre identifikasjonen etterprøvbar senere?', ['unik samlingsidentifikator', 'proveniens og innsamlingsmetadata', 'kobling mellom belegg, bilde og sekvens']]
    ]
  },
  {
    id: 'botanikk_vegetasjon',
    label: 'Botanikk og vegetasjon',
    shortLabel: 'Botanikk',
    definition: 'Domenet dekker planteceller, vev og organer, fotosyntese, respirasjon, transport, vekstsignaler, formering, generasjonsveksling, plantegrupper, artsbestemmelse og vegetasjon langs miljøgradienter.',
    focus: ['planteanatomi', 'fotosyntese', 'transport', 'vekst', 'formering', 'vegetasjon'],
    questionRole: 'Undersøk plantens struktur, prosess eller livssyklus før arten og vegetasjonen kobles til voksested, årstid, gradient og forvaltning.',
    tagline: 'Hvordan planter bygger kropp, fanger energi, formerer seg og danner vegetasjon i ulike miljøer.',
    methods: ['met_natur_planteanatomisk_undersokelse', 'met_natur_plantebestemmelse_herbariebelegg', 'met_natur_vegetasjonsrute_gradientanalyse'],
    emners: [
      {
        id: 'em_natur_plantecelle_vev_organer',
        title: 'Planteceller, vev og organer',
        short: 'Plantekroppen',
        level: 1,
        definition: 'Emnet forklarer hvordan cellevegg, vakuole og kloroplaster inngår i plantecellen, og hvordan vekstvev, ledningsvev og grunnvev bygger røtter, stengler og blader.',
        why: 'Planteorganenes funksjon kan ikke forklares bare fra ytre form; celle- og vevsnivået viser hvordan støtte, vekst, lagring, fotosyntese og transport faktisk organiseres.',
        concepts: ['cellevegg', 'vakuole', 'kloroplast', 'meristem', 'grunnvev', 'xylem', 'floem', 'rot', 'stengel', 'blad'],
        questions: [
          'Hvilke celler og vev kan identifiseres i preparatet eller organet?',
          'Hvordan henger vevets plassering og struktur sammen med funksjonen?',
          'Hvordan varierer den samme organfunksjonen mellom ulike plantegrupper eller voksesteder?'
        ],
        conflicts: ['ytre form vs indre struktur', 'cellefunksjon vs organfunksjon', 'grunnplan vs miljøtilpasset variasjon'],
        distinctions: ['celle vs vev', 'vev vs organ', 'vekstvev vs ferdig differensiert vev'],
        hooks: ['plantecelle_vev', 'rot_opptak', 'stengel_transport'],
        methods: ['met_natur_planteanatomisk_undersokelse', 'met_natur_plantebestemmelse_herbariebelegg'],
        places: ['botanisk hage', 'herbarium', 'skog', 'eng']
      },
      {
        id: 'em_natur_rot_stengel_blad_transport',
        title: 'Rot, stengel, blad og transport',
        short: 'Plantetransport',
        level: 2,
        definition: 'Emnet undersøker opptak av vann og mineralnæring i røtter, transport i xylem og floem, gassutveksling gjennom spalteåpninger og sammenhengen mellom bladstruktur og vanntap.',
        why: 'Planter må flytte vann, næringsstoffer og sukker uten pumpeorgan; transportvev, vannpotensial og regulerte åpninger kobler jord, atmosfære og hele plantekroppen.',
        concepts: ['rothår', 'vannpotensial', 'xylem', 'floem', 'transpirasjon', 'spalteåpning', 'kilde', 'sluk'],
        questions: [
          'Hvor tas vann og mineraler opp, og hvilken gradient driver transporten?',
          'Hva transporteres i xylem og floem, og i hvilken retning under de aktuelle forholdene?',
          'Hvordan påvirker lys, vind, temperatur og jordfuktighet gassutveksling og vanntap?'
        ],
        conflicts: ['vannopptak vs vanntap', 'xylemtransport vs floemtransport', 'åpne spalteåpninger vs tørkerisiko'],
        distinctions: ['mineralnæring vs organisk næring', 'transpirasjon vs fordamping fra jord', 'kildevev vs slukvev'],
        hooks: ['rot_opptak', 'stengel_transport', 'blad_gassutveksling'],
        methods: ['met_natur_planteanatomisk_undersokelse', 'met_natur_vegetasjonsrute_gradientanalyse'],
        places: ['skog', 'våtmark', 'tørreng', 'bytre', 'strand']
      },
      {
        id: 'em_natur_fotosyntese_respirasjon',
        title: 'Fotosyntese og respirasjon hos planter',
        short: 'Fotosyntese',
        level: 2,
        definition: 'Emnet forklarer hvordan lysreaksjoner og karbonfiksering lagrer energi i organisk stoff, og hvordan celleånding frigjør brukbar energi i plantens levende celler.',
        why: 'Planter både fotosyntetiserer og respirerer; å skille brutto produksjon, netto produksjon og energibruk er nødvendig for å forstå vekst, karbonbalanse og miljørespons.',
        concepts: ['klorofyll', 'lysreaksjon', 'karbonfiksering', 'glukose', 'celleånding', 'bruttoproduksjon', 'nettoproduksjon', 'begrensende faktor'],
        questions: [
          'Hvilke råstoffer, produkter og energioverganger inngår i fotosyntese og celleånding?',
          'Hvilken miljøfaktor begrenser prosessen i den aktuelle målingen eller situasjonen?',
          'Hvordan skiller plantens brutto karbonopptak seg fra netto lagring etter respirasjon?'
        ],
        conflicts: ['fotosyntese vs celleånding', 'bruttoproduksjon vs nettoproduksjon', 'lysmetning vs lysmangel'],
        distinctions: ['energilagring vs energifrigjøring', 'gassutveksling vs fotosyntesehastighet', 'karbonopptak vs karbonlagring'],
        hooks: ['fotosyntese_respirasjon', 'blad_gassutveksling', 'plantecelle_vev'],
        methods: ['met_natur_planteanatomisk_undersokelse', 'met_natur_feltmaling_og_overvaking'],
        places: ['veksthus', 'skog', 'eng', 'våtmark', 'park']
      },
      {
        id: 'em_natur_vekst_hormoner_responser',
        title: 'Plantevekst, hormoner og miljøresponser',
        short: 'Plantevekst',
        level: 2,
        definition: 'Emnet undersøker celledeling og strekningsvekst i meristemer, hormonell regulering og plantens retningsbestemte eller sesongmessige respons på lys, tyngdekraft, berøring og temperatur.',
        why: 'Planter kan ikke flytte seg fra miljøet, men regulerer vekst, hvile og utvikling gjennom signaler; dette forklarer alt fra skuddretning til knoppsprett og frøhvile.',
        concepts: ['meristem', 'auxin', 'cytokinin', 'gibberellin', 'abscisinsyre', 'tropisme', 'fotoperiodisme', 'hvile'],
        questions: [
          'Hvor skjer veksten, og skyldes endringen celledeling, cellestrekning eller differensiering?',
          'Hvilket signal og hvilken hormonell respons kan forklare vekstretningen eller utviklingsfasen?',
          'Hvordan kan responsen testes uten å forveksle korrelasjon med hormonell årsak?'
        ],
        conflicts: ['vekstsignal vs faktisk vekstrespons', 'hormonmengde vs vevets følsomhet', 'sesongsignal vs kortvarig værhendelse'],
        distinctions: ['tropisme vs nastisk bevegelse', 'vekst vs utvikling', 'frøhvile vs ikke-levedyktig frø'],
        hooks: ['plantevekst_hormoner', 'rot_opptak', 'blad_gassutveksling'],
        methods: ['met_natur_planteanatomisk_undersokelse', 'met_natur_endrings_og_tidsserieanalyse'],
        places: ['botanisk hage', 'veksthus', 'skogkant', 'bytre']
      },
      {
        id: 'em_natur_livssykluser_formering_spredning',
        title: 'Plantelivssykluser, formering og spredning',
        short: 'Plantelivssykluser',
        level: 2,
        definition: 'Emnet følger generasjonsveksling fra gametofytt og sporofytt til sporer, pollen, frø og frukt, og sammenligner bestøvning, befruktning, vegetativ formering og spredning.',
        why: 'Moser, karsporeplanter og frøplanter løser formering ulikt; livssyklusen forklarer hvilke stadier som krever vann, pollinatorer, vind eller bestemte etableringssteder.',
        concepts: ['generasjonsveksling', 'gametofytt', 'sporofytt', 'spore', 'pollen', 'bestøvning', 'befruktning', 'frø', 'frukt', 'vegetativ formering'],
        questions: [
          'Hvilket stadium i livssyklusen observeres, og er det haploid eller diploid generasjon?',
          'Hvordan flyttes kjønnsceller, pollen, sporer eller frø i denne plantegruppen?',
          'Hvilke flaskehalser begrenser befruktning, spredning og etablering på stedet?'
        ],
        conflicts: ['bestøvning vs befruktning', 'spredning vs vellykket etablering', 'seksuell vs vegetativ formering'],
        distinctions: ['gametofytt vs sporofytt', 'spore vs frø', 'pollinatorbesøk vs pollinering'],
        hooks: ['generasjonsveksling', 'pollinering_frospredning', 'plantehovedgrupper'],
        methods: ['met_natur_plantebestemmelse_herbariebelegg', 'met_natur_artsovervaking'],
        places: ['blomstereng', 'myr', 'skog', 'strandeng', 'botanisk hage']
      },
      {
        id: 'em_natur_plantegrupper_vegetasjonstyper_bestemmelse',
        title: 'Plantegrupper, vegetasjonstyper og plantebestemmelse',
        short: 'Vegetasjon',
        level: 2,
        definition: 'Emnet sammenligner moser, karsporeplanter, nakenfrøete og blomsterplanter og undersøker hvordan arter bestemmes og danner vegetasjon langs fuktighets-, nærings-, lys- og høydegradienter.',
        why: 'Vegetasjon er ikke bare en artsliste, men et mønster av plantegrupper, sjikt og dekning formet av miljø, forstyrrelse og historie; presis bestemmelse er grunnlaget for å tolke mønsteret.',
        concepts: ['mose', 'karsporeplante', 'nakenfrøet', 'blomsterplante', 'vegetasjonstype', 'sjikt', 'dekning', 'miljøgradient', 'indikatorart'],
        questions: [
          'Hvilke trekk plasserer planten i riktig hovedgruppe og videre til familie, slekt eller art?',
          'Hvordan endres artssammensetning og dekning langs den målte miljøgradienten?',
          'Skyldes vegetasjonsmønsteret dagens miljø, forstyrrelse, skjøtsel eller historisk arealbruk?'
        ],
        conflicts: ['enkeltart vs vegetasjonstype', 'indikatorart vs full miljømåling', 'dagens mønster vs historisk påvirkning'],
        distinctions: ['flora vs vegetasjon', 'forekomst vs dekning', 'plantegruppe vs vekstform'],
        hooks: ['plantehovedgrupper', 'vegetasjon_gradienter', 'pollinering_frospredning'],
        methods: ['met_natur_plantebestemmelse_herbariebelegg', 'met_natur_vegetasjonsrute_gradientanalyse', 'met_natur_vegetasjonsanalyse'],
        places: ['skog', 'eng', 'myr', 'strandeng', 'fjell', 'park']
      }
    ],
    hooks: [
      ['plantecelle_vev', 'Planteceller og vev', 'Hvordan bygger spesialiserte planteceller og vev støtte, lagring, fotosyntese, vekst og transport i organet?', ['mikroskopisk preparat eller snitt', 'vevets plassering og celleform', 'kobling mellom struktur og funksjon']],
      ['rot_opptak', 'Rot og opptak', 'Hvordan påvirker rotstruktur, jordfuktighet og mineraltilgang plantens opptak og fordeling av ressurser?', ['rotanatomi og rothår', 'jordfuktighet og kjemi', 'vekst- eller næringsrespons']],
      ['stengel_transport', 'Stengel og transportvev', 'Hvordan er xylem og floem organisert, og hva viser målingene om vann-, mineral- og sukkertransport?', ['stengelsnitt og ledningsvev', 'transportforsøk eller vannstatus', 'kilde- og slukvev']],
      ['blad_gassutveksling', 'Blad og gassutveksling', 'Hvordan balanserer bladets oppbygning og spalteåpninger opptak av karbondioksid mot tap av vann?', ['bladtykkelse og overflate', 'spalteåpninger eller konduktans', 'lys, temperatur, vind og fuktighet']],
      ['fotosyntese_respirasjon', 'Fotosyntese og respirasjon', 'Hvordan endres plantens brutto fotosyntese, respirasjon og netto karbonbalanse med miljøforholdene?', ['lys- eller gassmåling', 'temperatur og karbondioksid', 'brutto- og nettoestimat']],
      ['plantevekst_hormoner', 'Vekst og plantehormoner', 'Hvilket miljøsignal, vekstvev og regulatorisk system forklarer den observerte vekstretningen eller utviklingsfasen?', ['vekstpunkt og tidsserie', 'kontrollert signalbehandling', 'respons i rot, skudd, blad eller frø']],
      ['generasjonsveksling', 'Generasjonsveksling', 'Hvilke haploide og diploide stadier finnes i livssyklusen, og hvor skjer sporedannelse, gametdannelse og befruktning?', ['livssyklusstadier', 'reproduktive strukturer', 'krav til vann, vind eller dyr']],
      ['plantehovedgrupper', 'Plantenes hovedgrupper', 'Hvilke reproduktive og anatomiske trekk skiller moser, karsporeplanter, nakenfrøete og blomsterplanter?', ['karvev eller fravær av karvev', 'sporer, pollen, frø eller frukt', 'representative bestemte eksemplarer']],
      ['pollinering_frospredning', 'Pollinering og frøspredning', 'Hvilken vektor flytter pollen eller frø, og hvilke trekk og tidsforløp støtter den foreslåtte spredningsmåten?', ['blomster- eller fruktmorfologi', 'besøks- eller fangstdata', 'spredningsavstand og etableringssteder']],
      ['vegetasjon_gradienter', 'Vegetasjon langs gradienter', 'Hvordan varierer arter, sjikt og dekning langs en målt gradient i fuktighet, næring, lys, høyde eller forstyrrelse?', ['standardiserte ruter eller transekt', 'artsbestemmelse og dekning', 'miljøvariabler og påvirkningshistorie']]
    ]
  },
  {
    id: 'zoologi_dyreliv',
    label: 'Zoologi og dyreliv',
    shortLabel: 'Zoologi',
    definition: 'Domenet gir en sammenhengende innføring i dyrerikets kroppsplaner, virvelløse og virveldyr, livssykluser, formering, atferd og funksjonelle tilpasninger.',
    focus: ['kroppsplan', 'virvelløse dyr', 'leddyr', 'virveldyr', 'livssyklus', 'atferd'],
    questionRole: 'Koble observerbare anatomiske og atferdsmessige trekk til dyregruppe, livsstadium, funksjon, habitat og observasjonsbetingelser.',
    tagline: 'Hvordan dyrerikets kroppsplaner, livssykluser og atferd skaper et mangfold av funksjonelle løsninger.',
    methods: ['met_natur_zoologisk_morfologi', 'met_natur_standardisert_faunaobservasjon', 'met_natur_atferdsanalyse_felt'],
    emners: [
      {
        id: 'em_natur_dyrerikets_kroppsplaner',
        title: 'Dyrerikets kroppsplaner og hovedgrupper',
        short: 'Kroppsplaner',
        level: 1,
        definition: 'Emnet sammenligner symmetri, vevslag, kroppshule, segmentering, embryonal utvikling og organsystemer som grunnlag for å forstå dyrerikets viktigste utviklingslinjer.',
        why: 'Dyr kan ikke ordnes som en stige fra enkle til avanserte former; kroppsplaner er ulike evolusjonære løsninger som må tolkes sammen med utvikling og slektskap.',
        concepts: ['kroppsplan', 'symmetri', 'vevslag', 'kroppshule', 'segmentering', 'protostom', 'deuterostom', 'organisering'],
        questions: [
          'Hvilke trekk ved symmetri, vev og kroppshule kjennetegner den undersøkte gruppen?',
          'Hvordan henger kroppsplanen sammen med bevegelse, ernæring og sanser?',
          'Hvilke utviklings- og slektskapsdata støtter plasseringen i dyreriket?'
        ],
        conflicts: ['kroppsplan vs livsform', 'morfologisk enkelhet vs evolusjonær alder', 'tradisjonell gruppe vs fylogenetisk klade'],
        distinctions: ['symmetri vs segmentering', 'kroppshule vs fordøyelseshule', 'kroppsplan vs enkeltorgan'],
        hooks: ['dyrerikets_kroppsplaner', 'virvellose_hovedgrupper', 'dyreatferd_observasjon'],
        methods: ['met_natur_zoologisk_morfologi', 'met_natur_taksonomisk_kildekontroll'],
        places: ['naturhistorisk museum', 'fjæresone', 'ferskvann', 'skogbunn']
      },
      {
        id: 'em_natur_virvellose_dyr_mangfold',
        title: 'Virvelløse dyr: svamper, nesledyr, ormer og bløtdyr',
        short: 'Virvelløse dyr',
        level: 2,
        definition: 'Emnet undersøker sentrale virvelløse dyregrupper gjennom kroppsbygning, ernæring, bevegelse, gassutveksling, formering og larvestadier i marine, limniske og terrestriske miljøer.',
        why: 'Virvelløse dyr utgjør mange svært ulike utviklingslinjer; samlebetegnelsen må ikke skjule forskjellen mellom for eksempel nesledyr, flatormer, leddormer og bløtdyr.',
        concepts: ['svamp', 'nesledyr', 'flatorm', 'rundorm', 'leddorm', 'bløtdyr', 'mantel', 'radula', 'larvestadium'],
        questions: [
          'Hvilke kropps- og organstrekk plasserer dyret i riktig hovedgruppe?',
          'Hvordan løser gruppen ernæring, bevegelse og gassutveksling i sitt miljø?',
          'Hvilke livsstadier kan observeres, og hvordan skiller de seg i habitat og funksjon?'
        ],
        conflicts: ['samlegruppen virvelløse vs reelle slektskapsgrupper', 'voksenform vs larveform', 'ytre skall vs bløt anatomi'],
        distinctions: ['leddorm vs rundorm', 'mantel vs skall', 'koloni vs individ'],
        hooks: ['virvellose_hovedgrupper', 'blotdyr_leddormer', 'dyrerikets_kroppsplaner'],
        methods: ['met_natur_zoologisk_morfologi', 'met_natur_standardisert_faunaobservasjon'],
        places: ['strand', 'fjæresone', 'innsjø', 'elv', 'skogbunn']
      },
      {
        id: 'em_natur_leddyr_insekter_livssykluser',
        title: 'Leddyr, insekter og metamorfose',
        short: 'Leddyr',
        level: 2,
        definition: 'Emnet sammenligner leddyrgrupper gjennom leddelte bein, kroppsavsnitt, ytre skjelett og hamskifte og følger insekters ufullstendige og fullstendige metamorfose.',
        why: 'Et voksent insekt og larven kan bruke helt ulike habitater og ressurser; artskunnskap og økologi krever derfor at kroppsgruppe og livsstadium bestemmes samtidig.',
        concepts: ['leddelt bein', 'eksoskjelett', 'hamskifte', 'insekt', 'edderkoppdyr', 'krepsdyr', 'nymfe', 'larve', 'puppe', 'metamorfose'],
        questions: [
          'Hvilke kroppsavsnitt, bein, antenner og munndeler viser hvilken leddyrgruppe dette er?',
          'Er utviklingen direkte, ufullstendig eller fullstendig metamorfose?',
          'Hvordan endres næring, habitat og risiko mellom livsstadiene?'
        ],
        conflicts: ['larvekjennetegn vs voksenkjennetegn', 'hamskifte vs metamorfose', 'insekt vs annet leddyr'],
        distinctions: ['nymfe vs larve', 'ufullstendig vs fullstendig metamorfose', 'edderkoppdyr vs insekt'],
        hooks: ['leddyr_insekter', 'dyreatferd_observasjon', 'virvellose_hovedgrupper'],
        methods: ['met_natur_zoologisk_morfologi', 'met_natur_standardisert_faunaobservasjon', 'met_natur_artsovervaking'],
        places: ['blomstereng', 'skog', 'dam', 'strand', 'park']
      },
      {
        id: 'em_natur_fisk_amfibier_reptiler',
        title: 'Fisk, amfibier og reptiler',
        short: 'Fisk og landvirveldyr',
        level: 2,
        definition: 'Emnet sammenligner fisk, amfibier og reptiler gjennom gassutveksling, bevegelse, hud, temperaturregulering, formering og overgangen mellom vann- og landmiljø.',
        why: 'Gjeller, lunger, fuktig hud og fosterhinner representerer ulike funksjonelle løsninger; livssyklus og reproduksjon forklarer hvorfor gruppene har forskjellige krav til vann.',
        concepts: ['fisk', 'gjelle', 'svømmeblære', 'amfibium', 'metamorfose', 'reptil', 'amniotegg', 'vekselvarme'],
        questions: [
          'Hvilke kjennetegn plasserer dyret blant fisk, amfibier eller reptiler?',
          'Hvordan skjer gassutveksling, bevegelse og temperaturregulering i det aktuelle livsstadiet?',
          'Hvilke deler av formeringen binder arten til vann eller gjør den mer uavhengig av vann?'
        ],
        conflicts: ['akvatisk liv vs akvatisk formering', 'larvestadium vs voksenstadium', 'vekselvarme vs passiv kroppstemperatur'],
        distinctions: ['gjelleånding vs hudånding', 'amfibieegg vs amniotegg', 'fisk som samlebetegnelse vs fylogenetiske grupper'],
        hooks: ['fisk_tilpasninger', 'amfibier_livssyklus', 'reptiler_amnioter'],
        methods: ['met_natur_zoologisk_morfologi', 'met_natur_standardisert_faunaobservasjon', 'met_natur_artsovervaking'],
        places: ['elv', 'innsjø', 'dam', 'våtmark', 'strand']
      },
      {
        id: 'em_natur_fugler_pattedyr',
        title: 'Fugler og pattedyr',
        short: 'Fugler og pattedyr',
        level: 2,
        definition: 'Emnet sammenligner fuglers fjær, nebb, luftssekker og egg med pattedyrenes hår, melkekjertler, tenner og reproduksjonsmåter og kobler trekkene til aktivitet og miljø.',
        why: 'Begge gruppene regulerer kroppstemperaturen gjennom høy energiomsetning, men har ulike anatomiske og reproduktive løsninger som former bevegelse, fødesøk og ungeomsorg.',
        concepts: ['fjær', 'nebb', 'luftsekk', 'amniotegg', 'hår', 'melkekjertel', 'tannsett', 'endotermi', 'ungeomsorg'],
        questions: [
          'Hvilke fjær-, nebb-, hår-, tann- eller skjeletttrekk støtter gruppe- og artsbestemmelsen?',
          'Hvordan henger kroppsbygning og energiomsetning sammen med bevegelse og næringssøk?',
          'Hvilken formeringsstrategi og ungeomsorg viser observasjonene uten å forstyrre dyret?'
        ],
        conflicts: ['funksjonell likhet vs ulik anatomi', 'enkeltobservasjon vs fast atferd', 'nærvær vs dokumentert hekking eller yngling'],
        distinctions: ['fjærdrakt vs pels', 'hekkeområde vs næringsområde', 'sporobservasjon vs individobservasjon'],
        hooks: ['fugler_funksjon', 'pattedyr_funksjon', 'dyreatferd_observasjon'],
        methods: ['met_natur_standardisert_faunaobservasjon', 'met_natur_atferdsanalyse_felt', 'met_natur_artsovervaking'],
        places: ['våtmark', 'skog', 'kyst', 'park', 'fjell']
      },
      {
        id: 'em_natur_dyreatferd_formering_tilpasning',
        title: 'Dyreatferd, formering og funksjonelle tilpasninger',
        short: 'Dyreatferd',
        level: 3,
        definition: 'Emnet undersøker hvordan sanser, signaler, læring, fødesøk, territoriell atferd, partnervalg og foreldreomsorg observeres og forklares med både umiddelbare mekanismer og evolusjonær funksjon.',
        why: 'Den samme handlingen kan kreve både en mekanistisk forklaring på hvordan den utløses og en evolusjonær forklaring på hvorfor den er bevart; korte observasjoner gir ikke automatisk motiv eller funksjon.',
        concepts: ['atferd', 'stimulus', 'signal', 'læring', 'fødesøk', 'territorium', 'partnervalg', 'foreldreomsorg', 'proximal forklaring', 'ultimat forklaring'],
        questions: [
          'Hvilken atferdsenhet kan beskrives uten å tillegge dyret menneskelige hensikter?',
          'Hvilke sanser, signaler og miljøbetingelser utløser eller endrer atferden?',
          'Hvilke data kreves for å teste at atferden påvirker overlevelse eller reproduksjon?'
        ],
        conflicts: ['observasjon vs tolkning', 'umiddelbar mekanisme vs evolusjonær funksjon', 'individuell variasjon vs artsmønster'],
        distinctions: ['atferdsbeskrivelse vs motivtolkning', 'proximal vs ultimat forklaring', 'korrelasjon vs adaptiv funksjon'],
        hooks: ['dyreatferd_observasjon', 'fugler_funksjon', 'pattedyr_funksjon'],
        methods: ['met_natur_atferdsanalyse_felt', 'met_natur_standardisert_faunaobservasjon'],
        places: ['fugletårn', 'våtmark', 'skog', 'park', 'kyst']
      }
    ],
    hooks: [
      ['dyrerikets_kroppsplaner', 'Dyrerikets kroppsplaner', 'Hvordan viser symmetri, vevslag, kroppshule og utvikling hvilken hovedlinje dyret tilhører?', ['anatomisk preparat eller dokumentert bilde', 'utviklings- og vevstrekk', 'fylogenetisk referanse']],
      ['virvellose_hovedgrupper', 'Virvelløse hovedgrupper', 'Hvilke kropps- og organstrekk skiller de undersøkte virvelløse gruppene uten å gjøre virvelløse til én slektskapsgruppe?', ['kroppsplan og organstruktur', 'livsstadium og habitat', 'bestemmelseslitteratur']],
      ['leddyr_insekter', 'Leddyr og insekter', 'Hvilke kroppsavsnitt, vedheng, munndeler og utviklingsstadier bestemmer leddyrgruppe og funksjon?', ['antall bein, antenner og kroppsavsnitt', 'munndeler og bevegelsesorganer', 'egg, nymfe, larve, puppe eller voksen']],
      ['blotdyr_leddormer', 'Bløtdyr og leddormer', 'Hvordan skiller mantel, fot, segmentering og organsystemer bløtdyr fra leddormer og andre ormelignende dyr?', ['ytre og indre anatomi', 'segmentering eller mantelstruktur', 'bevegelse, ernæring og habitat']],
      ['fisk_tilpasninger', 'Fisk og akvatiske tilpasninger', 'Hvordan støtter gjeller, finner, kroppsform og sanser bevegelse og liv i det aktuelle vannmiljøet?', ['morfologi og artsbestemmelse', 'vannhastighet, dybde og temperatur', 'fødesøk, gyting eller vandring']],
      ['amfibier_livssyklus', 'Amfibiers livssyklus', 'Hvordan kobler egg, larve, metamorfose og voksenstadium arten til både vann- og landhabitat?', ['egg- eller larvekjennetegn', 'vannkvalitet og hydroperiode', 'voksenhabitat og vandringsvei']],
      ['reptiler_amnioter', 'Reptiler og amnioter', 'Hvordan reduserer fosterhinner, hud og atferd avhengigheten av vann, og hvilke miljøkrav står fortsatt igjen?', ['egg- og hudtrekk', 'temperatur og soleplasser', 'yngle- og overvintringshabitat']],
      ['fugler_funksjon', 'Fuglers funksjonelle trekk', 'Hvordan henger fjær, nebb, vinge, fot og sanser sammen med flukt, næringssøk og habitatbruk?', ['fjærdrakt og kroppsproporsjoner', 'nebb, fot og føde', 'lyd, trekk, hekking eller habitatbruk']],
      ['pattedyr_funksjon', 'Pattedyrs funksjonelle trekk', 'Hvordan henger hår, tenner, lemmer og sanser sammen med temperaturregulering, føde og aktivitet?', ['spor, hår eller dokumentert individ', 'tannsett og bevegelsesform', 'døgnaktivitet, yngling og habitat']],
      ['dyreatferd_observasjon', 'Systematisk atferdsobservasjon', 'Hvilke klart definerte handlinger forekommer, når skjer de, og hvordan varierer de med individ og miljø?', ['etogram og tidsbudsjett', 'individ, tidspunkt og observasjonsinnsats', 'stimuli, avstand og miljøbetingelser']]
    ]
  }
];

const METHOD_SPECS = [
  ['met_natur_taksonomisk_kildekontroll', 'Taksonomisk kildekontroll', 'Sammenstiller akseptert navn, rang, synonymi og revisjonshistorikk fra autoritative navnebaser og original eller revidert taksonomisk litteratur før artsdata sammenlignes.', 'artskunnskap_systematikk',
    ['takson-ID, akseptert navn og autor', 'synonymer og navnebruk over tid', 'taksonomisk kilde, versjon og kontrolldato', 'revisjonsnotat eller originalbeskrivelse'],
    ['avgrens hvilket navne- eller taksonproblem som skal løses', 'slå opp samme organisme i minst én autoritativ taksonomisk kilde', 'spor synonymi, rangendringer og takson-ID-er', 'dokumenter valgt navn, kildeversjon og uløst konflikt'],
    ['autoritative databaser kan følge ulike taksonomiske vurderinger', 'navneendring betyr ikke nødvendigvis at artsforekomsten har endret seg']],
  ['met_natur_morfologisk_artsbestemmelse', 'Morfologisk artsbestemmelse', 'Identifiserer organisme eller organismegruppe gjennom en eksplisitt bestemmelsesnøkkel, dokumenterte morfologiske karakterer og sammenligning med relevante forvekslingsarter.', 'artskunnskap_systematikk',
    ['foto, mål eller preparat av diagnostiske trekk', 'bestemmelsesnøkkel med geografisk og taksonomisk omfang', 'metadata om livsstadium, kjønn, sted og dato', 'referansebeskrivelser eller bestemte belegg'],
    ['avklar organismegruppe, livsstadium og egnet nøkkel', 'følg hvert karaktervalg og dokumenter hva som faktisk observeres', 'sammenlign med nærstående arter og noter manglende trekk', 'angi laveste sikre taksonomiske nivå og sikkerhetsgrad'],
    ['variasjon, skade eller feil livsstadium kan skjule diagnostiske trekk', 'en nøkkel dekker bare gruppene, området og kunnskapen den ble laget for']],
  ['met_natur_dna_strekkodingsanalyse', 'DNA-strekkodingsanalyse', 'Vurderer artsidentifikasjon fra en standardisert genetisk markør ved å kontrollere prøvens proveniens, sekvenskvalitet, referansebibliotek, alternative treff og samsvar med morfologi.', 'artskunnskap_systematikk',
    ['prøve-ID, vouchere og innsamlingsmetadata', 'rå eller kvalitetssikret markørsekvens', 'referansetreff med likhet og dekning', 'morfologisk og geografisk kontroll'],
    ['koble prøven entydig til fysisk materiale og metadata', 'kontroller sekvenskvalitet, markør og mulige kontaminasjoner', 'sammenlign flere referansetreff og deres bestemmelser', 'rapporter resultat som bekreftet, foreløpig eller konfliktfylt'],
    ['referansebibliotek kan være ufullstendig eller inneholde feilbestemte belegg', 'én markør kan mangle oppløsning mellom nylig skilte eller hybridiserende arter']],
  ['met_natur_planteanatomisk_undersokelse', 'Planteanatomisk undersøkelse', 'Undersøker planteceller, vev og organer med snitt, mikroskopi, mål og strukturfarge for å koble observerbar anatomi til transport, fotosyntese, støtte og vekst.', 'botanikk_vegetasjon',
    ['planteorgan med dokumentert art og utviklingsstadium', 'tverr- eller lengdesnitt med målestokk', 'mikroskopibilder av celler og vev', 'observasjonsark med struktur og funksjon'],
    ['velg organ, art og snittplan ut fra spørsmålet', 'lag eller finn et dokumentert preparat og kalibrer målestokk', 'identifiser vev etter plassering og cellekarakterer', 'sammenlign strukturen med forventet funksjon og alternative arter eller miljøer'],
    ['preparering og farging kan deformere eller skjule vev', 'struktur alene dokumenterer ikke prosesshastighet eller fysiologisk årsak']],
  ['met_natur_plantebestemmelse_herbariebelegg', 'Plantebestemmelse med herbariebelegg', 'Bestemmer planter gjennom reproduktive og vegetative kjennetegn og dokumenterer resultatet med innsamling eller foto, etikettdata, nøkkelspor og kontroll mot herbarium eller artsbeskrivelse.', 'botanikk_vegetasjon',
    ['hele planten eller nødvendige diagnostiske deler', 'detaljfoto og mål av blomster, frukt, blad og hår', 'lokalitet, dato, habitat og innsamler', 'bestemmelsesnøkkel og referansebelegg'],
    ['vurder om arten kan dokumenteres uten innsamling og følg verne- og etikettregler', 'registrer karakterer før materialet tørker eller endrer form', 'følg nøkkelen og utelukk forvekslingsarter', 'arkiver belegg eller bildeserie med identifikator og sikkerhetsgrad'],
    ['sterilt materiale kan ofte ikke bestemmes sikkert til art', 'innsamling kan være uetisk eller ulovlig for truede arter og små bestander']],
  ['met_natur_vegetasjonsrute_gradientanalyse', 'Vegetasjonsrute og gradientanalyse', 'Måler artssammensetning, frekvens, dekning og vegetasjonssjikt i standardiserte ruter eller transekter og sammenholder mønsteret med målte miljøgradienter.', 'botanikk_vegetasjon',
    ['artsbestemte rute- eller transektdata', 'dekning, frekvens og sjikthøyde', 'jordfuktighet, lys, pH, høyde eller forstyrrelse', 'kart, prøvedesign og gjentaksmetadata'],
    ['formuler gradienthypotese og velg representativt prøvedesign', 'registrer arter og dekning med samme skala i alle ruter', 'mål miljøvariabler og dokumenter påvirkningshistorie', 'analyser samvariasjon og skill gradient fra romlig eller metodisk skjevhet'],
    ['små ruter kan overse sjeldne eller flekkvis fordelte arter', 'korrelasjon langs en gradient beviser ikke hvilken miljøfaktor som er årsak']],
  ['met_natur_zoologisk_morfologi', 'Zoologisk morfologianalyse', 'Sammenligner kroppsplan, organer og diagnostiske strukturer hos dyr med mål, illustrasjoner, preparater eller bilder for å bestemme gruppe og tolke funksjon uten å forveksle analogi med slektskap.', 'zoologi_dyreliv',
    ['dokumentert individ, preparat eller bildeserie', 'mål av kroppsavsnitt og diagnostiske strukturer', 'livsstadium, kjønn, lokalitet og dato', 'sammenligningsmateriale og bestemmelseslitteratur'],
    ['avklar hvilke strukturer som svarer på bestemmelses- eller funksjonsspørsmålet', 'registrer trekk med målestokk og standardisert orientering', 'sammenlign homologe strukturer og relevante forvekslingsgrupper', 'rapporter gruppe, funksjonstolkning og gjenværende usikkerhet'],
    ['fiksering, vinkel og livsstadium kan endre synlige kjennetegn', 'funksjon kan ikke alltid utledes sikkert fra form alene']],
  ['met_natur_standardisert_faunaobservasjon', 'Standardisert faunaobservasjon', 'Registrerer dyr med fast areal, tidsrom, innsats og observasjonsmåte slik at funn, fravær, aktivitet og livsstadium kan sammenlignes mellom steder eller tidspunkt.', 'zoologi_dyreliv',
    ['arts- eller grupperegistreringer med tid og posisjon', 'innsats, observatør, vær og utstyr', 'livsstadium, antall og aktivitet', 'fraværsdata og oppdagbarhetsnotat'],
    ['definer målgruppe, sesong og egnet observasjonsvindu', 'fastsett transekt, punkt, felle eller søketid før registrering', 'registrer både funn og standardisert innsats uten å forstyrre dyrene', 'vurder oppdagbarhet og sammenlign bare metodisk like datasett'],
    ['manglende observasjon dokumenterer ikke sikkert fravær', 'vær, lyd, vegetasjon og observatører påvirker oppdagbarheten ulikt mellom dyregrupper']],
  ['met_natur_atferdsanalyse_felt', 'Atferdsanalyse i felt', 'Beskriver dyreatferd med et forhåndsdefinert etogram, individ- eller gruppeutvalg og tidsregistrering for å skille observerte handlinger fra antatt motiv og teste sammenheng med miljøbetingelser.', 'zoologi_dyreliv',
    ['etogram med gjensidig avgrensede atferdskategorier', 'fokal-, skann- eller hendelsesregistrering', 'individ, gruppe, tid og miljøbetingelser', 'observatøravstand og mulig forstyrrelse'],
    ['definer atferdskategorier med synlige start- og stoppkriterier', 'velg observasjonsutvalg og tidsplan før feltøkten', 'registrer handling, kontekst og innsats uten motivtolkning', 'analyser tidsbudsjett eller hendelsesrate og test alternative forklaringer'],
    ['observatøren kan endre atferden eller feilklassifisere korte handlinger', 'en lokal tidsserie kan ikke uten videre generaliseres til arten eller en adaptiv funksjon']]
];

const THINKERS = [
  { id: 'charles_darwin', name: 'Charles Darwin', role: 'felles avstamning og variasjon', tier: 'core' },
  { id: 'carl_linnaeus', name: 'Carl von Linné', role: 'biologisk nomenklatur og klassifikasjon', tier: 'core' },
  { id: 'willi_hennig', name: 'Willi Hennig', role: 'fylogenetisk systematikk', tier: 'core' },
  { id: 'ernst_mayr', name: 'Ernst Mayr', role: 'artsbegrep og systematikk', tier: 'core' },
  { id: 'barbara_mcclintock', name: 'Barbara McClintock', role: 'organisme, utvikling og genetisk evidens', tier: 'core' }
];

function buildMethod(spec) {
  const [method_id, title, description, domain, data_forms, procedure, limitations] = spec;
  return {
    method_id,
    title,
    short_label: title,
    description,
    best_for_emne_kinds: [domain],
    data_forms,
    course_level_fit: ['grunnkurs', 'mellomnivå', 'avansert'],
    coverage_domains: [domain],
    progression_stage: 'full_ladder',
    good_for_place_types: DOMAIN_SPECS.find((entry) => entry.id === domain).emners.flatMap((entry) => entry.places).filter((value, index, all) => all.indexOf(value) === index),
    question_moves: [
      `avgrens hvilket ${title.toLocaleLowerCase('nb-NO')}-spørsmål materialet faktisk kan besvare`,
      'dokumenter prøve, observasjon, sammenligningsgrunnlag og arbeidssteg',
      'rapporter resultat, alternative tolkninger og metodisk usikkerhet'
    ],
    method_use_note: `Bruk ${title.toLocaleLowerCase('nb-NO')} når datagrunnlaget og spørsmålet hører til ${domain.replaceAll('_', ' ')}, ikke som en generell etikett for naturfaglig arbeid.`,
    rotation_note: `Roter organismegruppe, materiale, livsstadium og sted før ${title.toLocaleLowerCase('nb-NO')} brukes på nytt, og kombiner metoden med en uavhengig kontroll når konklusjonen er arts- eller funksjonsspesifikk.`,
    hook_affinities: [],
    emne_affinities: DOMAIN_SPECS.find((entry) => entry.id === domain).emners.map((entry) => entry.id),
    canonical_status: 'canonical',
    registry_version: 'naturpensum_v5_1',
    canonical_file_role: 'active',
    case_gate_required: true,
    method_gate_required: true,
    external_claim_basis_required: true,
    ecosystem_water_climate_or_place_anchor_required: true,
    generator_constraints: {
      require_concrete_ecosystem_water_climate_geology_or_management_case: true,
      require_external_claim_basis: true,
      do_not_generate_from_method_label_only: true,
      require_emne_prefix: 'em_natur_'
    },
    procedure,
    limitations
  };
}

function buildEmne(domain, spec) {
  const concepts = [...spec.concepts];
  const quizAngles = [
    `Start i dokumentert materiale som kan besvare: ${spec.questions[0]}`,
    `Koble observasjonen til struktur, prosess eller slektskap gjennom: ${spec.questions[1]}`,
    `Avslutt med evidens, kontroll og usikkerhet: ${spec.questions[2]}`
  ];
  return {
    emne_id: spec.id,
    subject_id: 'natur',
    domain: domain.id,
    area_id: domain.id,
    area_label: domain.label,
    level: spec.level,
    title: spec.title,
    short_label: spec.short,
    status: 'active',
    definition: spec.definition,
    why_it_matters: spec.why,
    keywords: concepts,
    dimensions: domain.focus,
    akse: domain.focus,
    key_concepts: concepts,
    core_concepts: concepts,
    sub_concepts: concepts,
    key_questions: spec.questions,
    conflicts: spec.conflicts,
    ideological_dimensions: [],
    methods: spec.methods,
    analysis_axes: spec.distinctions,
    canonical_thinkers: THINKERS.map((entry) => entry.name),
    canonical_thinker_ids: THINKERS.map((entry) => entry.id),
    norwegian_thinker_ids: [],
    norwegian_thinkers: [],
    related_emners: domain.emners.filter((entry) => entry.id !== spec.id).map((entry) => entry.id),
    related_emner: domain.emners.filter((entry) => entry.id !== spec.id).map((entry) => entry.id),
    good_for_places: spec.places,
    quiz_angles: quizAngles,
    blindspots: [
      `Ikke forveksle ${spec.distinctions[0]}.`,
      `Ikke bruk ${spec.title} uten dokumentert organisme, materiale, metode og kilde.`
    ],
    logic_family: domain.id,
    emne_role: spec.level === 1 ? 'grunnemne' : spec.level === 3 ? 'fordypningsemne' : 'broemne',
    parent_emne_id: null,
    quiz_priority: 'high',
    direct_quiz_ok: true,
    nature_weight: 5,
    theory_weight: 3,
    broadness: 'bounded',
    place_type_fit: spec.places,
    opening_use_ok: true,
    bridge_use_ok: true,
    late_use_ok: true,
    recommended_set_phases: ['facts', 'bridge_facts_theory', 'late_theory'],
    requires_nature_anchor: true,
    requires_ecosystem_water_climate_or_place_anchor: true,
    requires_external_claim_basis: true,
    requires_documented_ecological_context: true,
    question_surface_mode: 'organism-and-evidence-first',
    avoid_surface_forms: ['Hvilken teoretiker passer best', 'Hva betyr natur generelt', 'Påstand hentet bare fra emnenavn eller teori'],
    scope_guard: `Brukes når et dokumentert eksemplar, en organismegruppe, biologisk struktur, prosess eller observasjon gir en konkret inngang til ${domain.label}.`,
    mapping_count: spec.hooks.length,
    mapping_pressure: 'mapped',
    generator_use_note: `Bruk ${spec.title} først når produksjonsmaterialet kan besvare minst ett kjernespørsmål og oppgi relevant metode, objekt og inspectable kilde.`,
    primary_theory_hooks: spec.hooks,
    secondary_theory_hooks: [],
    reserve_theory_hooks: [],
    theory_diversity_score: THINKERS.length,
    has_norwegian_theory_path: false,
    theory_surface_priority: 'organism-evidence-first_then_explanation',
    theory_progression_note: 'Introduser forklaringsmodellen etter at organisme, struktur, prosess og usikkerhet er etablert.',
    theory_overreach_risk: 'medium',
    method_ids: spec.methods,
    recommended_oslo_cases: spec.places,
    overlap_risk: 'medium',
    distinguish_from_emners: domain.emners.filter((entry) => entry.id !== spec.id).map((entry) => entry.id),
    overlap_resolution_note: `Hold emnet avgrenset gjennom skillet ${spec.distinctions.join('; ')}.`,
    progression_stage: 'full_ladder',
    pedagogical_track: 'fra_observasjon_og_kjennetegn_til_prosess_slektskap_og_usikkerhet',
    case_spread_score: 5,
    overused_thinker_ids: [],
    underused_thinker_ids: THINKERS.map((entry) => entry.id),
    theory_spread_priority: 'spread_more',
    canonical_status: 'canonical',
    registry_version: 'naturpensum_v5_1',
    min_recommended_oslo_cases: 2,
    case_gate_required: true,
    method_gate_required: true,
    recommended_max_primary_hooks: 3,
    generator_risk_mode: 'guarded',
    theory_rotation_required: true,
    case_rotation_required: true,
    canonical_file_role: 'active',
    generator_constraints: {
      min_case_count: 2,
      min_method_count: 1,
      max_primary_hooks: 3,
      risk_mode: 'guarded',
      require_case_anchor_before_theory: true,
      require_external_claim_basis: true,
      require_ecosystem_water_climate_or_place_anchor: true,
      do_not_generate_from_emne_label_only: true
    },
    anti_patterns: [
      'Ikke bruk emnet uten dokumentert organisme, struktur, prosess, observasjon eller prøve.',
      'Ikke trekk arts-, funksjons- eller slektskapskonklusjoner fra ett uklart trekk alene.',
      'Ikke skjul usikker artsbestemmelse eller metodiske begrensninger bak generell naturtekst.'
    ],
    recommended_methods: spec.methods,
    critical_distinctions: spec.distinctions
  };
}

function buildCategory(domain) {
  const allPlaces = domain.emners.flatMap((entry) => entry.places).filter((value, index, all) => all.indexOf(value) === index);
  const hookToEmners = new Map();
  for (const emne of domain.emners) for (const hook of emne.hooks) {
    if (!hookToEmners.has(hook)) hookToEmners.set(hook, []);
    hookToEmners.get(hook).push(emne.id);
  }
  return {
    id: domain.id,
    title: domain.label,
    definition: domain.definition,
    focus: domain.focus,
    question_role: domain.questionRole,
    tagline: domain.tagline,
    best_place_types: allPlaces,
    oslo: { core_cases: allPlaces.slice(0, 7), place_logic: `Bruk steder bare når organismen, materialet, livsstadiet, metoden og kilden gir dokumenterbar inngang til ${domain.label}.` },
    source_priority: [
      'bestemt organisme, dokumentert eksemplar, biologisk struktur, prosess eller standardisert observasjon',
      'autoritativ navnebase, museumssamling, herbarium, faglig artsbeskrivelse, genetisk referanse eller universitetsfaglig kilde',
      'felt- eller laboratoriedata med prøve-ID, sted, dato, metode og usikkerhet',
      'sammenligningsmateriale som kan utelukke alternative bestemmelser eller forklaringer',
      'fagkart, emner og metoder som styring – aldri som faktakilde'
    ],
    anti_patterns: [
      'Ikke bygg spørsmål fra organismegruppen eller emnenavnet alene.',
      'Ikke presenter sannsynlig artsbestemmelse som sikker uten diagnostisk belegg.',
      'Ikke la et generelt stedseksempel erstatte dokumentert biologisk objekt og metode.'
    ],
    canon: { thinkers: THINKERS },
    topic_hooks: domain.hooks.map(([id, title, focus_question, evidence_focus]) => {
      const emne_ids = hookToEmners.get(id) || [];
      const recommended_method_ids = domain.methods.slice(0, 2);
      return {
        id,
        title,
        canon: { thinkers: THINKERS },
        emne_ids,
        best_place_types: allPlaces,
        avoid_place_types: ['sted_uten_dokumentert_biologisk_objekt', 'ren_rekreasjonsarena_uten_faglig_materiale', 'generisk_gront_sted'],
        set_phase_fit: ['facts', 'bridge_facts_theory', 'late_theory'],
        question_surface_mode: 'organism-and-evidence-first',
        fact_anchor_required: true,
        nature_anchor_required: true,
        ecosystem_water_climate_or_place_anchor_required: true,
        external_claim_basis_required: true,
        avoid_surface_forms: ['Hvilken teoretiker passer best', 'Hva betyr natur generelt', 'Påstand hentet bare fra hooknavnet'],
        preferred_question_moves: [
          `Start med ${evidence_focus[0]} i et konkret og datert materiale.`,
          focus_question,
          `Kontroller forklaringen mot ${evidence_focus[1]} og ${evidence_focus[2]}.`
        ],
        comparison_pairs: [['charles_darwin', 'carl_linnaeus'], ['willi_hennig', 'ernst_mayr']],
        norwegian_thinker_ids: [],
        recommended_oslo_cases: allPlaces.slice(0, 7),
        recommended_method_ids,
        overused_thinker_ids: [],
        underused_thinker_ids: THINKERS.map((entry) => entry.id),
        case_spread_score: 5,
        theory_spread_priority: 'spread_more',
        canonical_status: 'canonical',
        registry_version: 'naturpensum_v5_1',
        min_recommended_oslo_cases: 2,
        min_recommended_methods: 1,
        case_gate_required: true,
        method_gate_required: true,
        theory_rotation_required: true,
        case_rotation_required: true,
        canonical_file_role: 'active',
        rotation_note: `For ${title}: roter organismegruppe, livsstadium, materiale og datakilde; gjenta ikke samme case før et annet bestemmelses- eller forklaringsproblem er prøvd.`,
        generator_constraints: {
          min_case_count: 2,
          min_method_count: 1,
          require_ecosystem_water_climate_or_place_anchor: true,
          require_external_claim_basis: true,
          rotate_theorists: true,
          do_not_generate_from_hook_label_only: true
        },
        focus_question,
        evidence_focus
      };
    })
  };
}

function buildMapping(domain, emne, hookIndex) {
  return {
    emne_id: emne.id,
    title: emne.title,
    mappings: emne.hooks.map((hookId, index) => {
      const hook = hookIndex.get(hookId);
      assert(hook, `Ukjent ny hook ${hookId}`);
      return {
        fagkart_kategori: domain.id,
        fagkart_kategori_tittel: domain.label,
        topic_hook: hook.id,
        topic_hook_tittel: hook.title,
        mapping_tier: index === 0 ? 'primary' : 'secondary',
        priority_score: 10 - index,
        set_phase_fit: hook.set_phase_fit,
        question_surface_mode: hook.question_surface_mode,
        nature_anchor_required: true,
        fact_anchor_required: true,
        source_anchor_required: true,
        external_claim_basis_required: true,
        ecosystem_water_climate_or_place_anchor_required: true,
        documented_ecological_context_required: true,
        use_note: `Bruk ${hook.title} til å undersøke ${emne.title.toLocaleLowerCase('nb-NO')}: ${emne.questions[index] || emne.questions[0]} Dokumenter objekt, metode og sikkerhetsgrad før fasit låses.`,
        tenkere: THINKERS.map((entry) => entry.name),
        thinker_ids: THINKERS.map((entry) => entry.id),
        norwegian_thinker_ids: [],
        norwegian_thinkers: [],
        comparison_pairs: hook.comparison_pairs,
        preferred_question_moves: hook.preferred_question_moves,
        best_place_types: hook.best_place_types,
        avoid_place_types: hook.avoid_place_types,
        anti_patterns: ['Ikke generer fra emne- eller hooknavnet alene.', 'Ikke utelat usikkerhet eller alternative bestemmelser.'],
        theory_depth: 'medium',
        recommended_oslo_cases: hook.recommended_oslo_cases,
        recommended_method_ids: emne.methods.slice(0, 2),
        generator_constraints: {
          require_concrete_ecosystem_water_climate_geology_or_management_case: true,
          require_external_claim_basis: true,
          do_not_generate_from_hook_label_only: true,
          do_not_generate_from_emne_label_only: true,
          required_emne_prefix: 'em_natur_'
        },
        evidence_focus: hook.evidence_focus
      };
    })
  };
}

const CHAPTERS = [
  {
    id: 'artskunnskap_systematikk',
    title: 'Artskunnskap og systematikk',
    subtitle: 'Fra observerbart kjennetegn til etterprøvbar klassifikasjon',
    lead: 'Å kjenne en art er mer enn å gjenkjenne et bilde. Organismen må beskrives, sammenlignes og plasseres i et navne- og slektskapssystem som andre kan kontrollere. Dette kapittelet skiller identifikasjon fra klassifikasjon, viser hvordan bestemmelsesnøkler og DNA-strekkoding brukes sammen, og gjør usikkerhet til en synlig del av kunnskapen.',
    learningObjectives: ['skille organisme, art, takson, navn og taksonomisk rang', 'sammenligne flere artsbegreper og deres bruksområder', 'lese et fylogenetisk tre som en hypotese om felles avstamning', 'skille homologe trekk fra analoge likheter', 'gjennomføre og dokumentere en morfologisk nøkkelbestemmelse', 'vurdere DNA-strekkoding mot referansebelegg og alternative treff'],
    sections: [
      ['navn-og-klassifikasjon', '1. Navn, taksoner og klassifikasjon', [
        'Et individ er en konkret organisme. Et takson er en navngitt gruppe i klassifikasjonen, mens et vitenskapelig navn følger et regelverk for nomenklatur. Art, slekt, familie og orden er rangnivåer; de sier hvordan systemet er ordnet, men rang alene måler ikke alder, mangfold eller evolusjonær avstand.',
        'Ett takson kan ha hatt flere navn, og ett navn kan ha vært brukt forskjellig gjennom historien. Derfor må artsdata knyttes til akseptert navn, takson-ID, navnekilde og kontrolldato. En taksonomisk revisjon kan splitte, slå sammen eller flytte grupper uten at organismene på stedet har endret seg.',
        'Navnebaser gjør data søkbare og sammenlignbare, men de er ikke nøytrale fasitlister uten versjon. Når kilder er uenige, må den valgte taksonomiske behandlingen og den alternative vurderingen dokumenteres.'
      ]],
      ['artsbegreper', '2. Hva er en art?', [
        'Det biologiske artsbegrepet vektlegger reproduksjon og reproduktiv isolasjon. Det er nyttig for mange seksuelt formerende organismer, men vanskelig å bruke på fossiler, ukjønnet formering, hybridiserende grupper og bestander som aldri møtes.',
        'Morfologiske artsbegreper avgrenser arter etter form, mens fylogenetiske artsbegreper søker den minste klart avgrensede utviklingslinjen. Økologiske data kan vise at grupper bruker ulike nisjer. Ingen enkelt datakilde avgjør alle artsgrenser.',
        'Artsavgrensning er derfor en argumentert konklusjon. Variasjon innen foreslåtte arter må sammenlignes med forskjeller mellom dem, og konflikter mellom morfologi, genetikk, geografi og økologi skal beholdes synlige.'
      ]],
      ['fylogeni-og-karakterer', '3. Fylogeni, homologi og analogi', [
        'Et fylogenetisk tre viser en hypotese om forgrening fra felles stamformer. Knutepunkter representerer felles avstamning, og grupper som deler nærmeste knutepunkt er søstergrupper. Nålevende arter ved greinspissene er vanligvis ikke stamformer til hverandre.',
        'Homologe trekk har felles evolusjonært opphav selv om funksjonen kan være ulik. Analoge trekk har lik funksjon eller form, men har utviklet seg uavhengig. Konvergens kan derfor skape overbevisende likheter som ikke betyr nært slektskap.',
        'Fylogenier bygges fra karakterer eller sekvenser og er avhengige av utvalg, koding og modell. Greinenes plassering, støtteverdier og alternative trær må leses før en sikker slektskapskonklusjon trekkes.'
      ]],
      ['bestemmelsesarbeid', '4. Nøkler, kjennetegn og belegg', [
        'En bestemmelsesnøkkel deler mulighetene trinnvis ved hjelp av karaktervalg. Før start må organismegruppe, geografisk område, livsstadium og nøkkelens alder kontrolleres. Hvert valg bør kunne vises med foto, mål eller preparat.',
        'Diagnostiske kjennetegn må skille den foreslåtte arten fra relevante forvekslingsarter. Farge eller helhetsinntrykk kan være nyttig i felt, men variable trekk må ikke bære en sikker identifikasjon alene.',
        'Et fysisk belegg, herbariumark eller en dokumentert bildeserie gjør bestemmelsen kontrollerbar senere. Proveniens, dato, samler, lokalitet og kobling til eventuelle genetiske data er en del av resultatet, ikke administrativt tillegg.'
      ]],
      ['dna-og-usikkerhet', '5. DNA-strekkoding og integrativ bestemmelse', [
        'DNA-strekkoding sammenligner en standardisert genetisk region fra prøven med et referansebibliotek. Metoden kan støtte identifikasjon, koble ulike livsstadier og avdekke kryptiske linjer, men resultatet avhenger av markøren og kvaliteten på referansene.',
        'Et høyt sekvenslikhetstreff er ikke automatisk en artsdiagnose. Nærstående arter kan dele strekkode, referansen kan være feilbestemt, og kontaminasjon kan gi et teknisk godt, men biologisk galt treff.',
        'Integrativ taksonomi sammenholder genetikk med morfologi, geografi, økologi og belegg. Resultatet bør oppgi laveste sikre nivå og om bestemmelsen er bekreftet, sannsynlig eller uløst.'
      ]]
    ],
    concepts: [['takson', 'Takson', 'En navngitt biologisk gruppe på et hvilket som helst klassifikasjonsnivå.'], ['nomenklatur', 'Nomenklatur', 'Regelverket for hvordan vitenskapelige navn opprettes og brukes.'], ['artsbegrep', 'Artsbegrep', 'Kriterier for hva som avgrenser én art fra andre.'], ['fylogeni', 'Fylogeni', 'Hypotese om organismers evolusjonære slektskap.'], ['klade', 'Klade', 'En stamform og alle dens etterkommere.'], ['homologi', 'Homologi', 'Likhet som skyldes felles evolusjonært opphav.'], ['analogi', 'Analogi', 'Funksjonell eller formmessig likhet utviklet uavhengig.'], ['bestemmelsesnokkel', 'Bestemmelsesnøkkel', 'Trinnvis system for å identifisere en organisme fra karaktervalg.'], ['dna_strekkode', 'DNA-strekkode', 'Standardisert genetisk region brukt til sammenligning med referansesekvenser.'], ['referansebelegg', 'Referansebelegg', 'Arkivert eksemplar som dokumenterer og muliggjør kontroll av en bestemmelse.']],
    sources: [
      ['Artsdatabanken – Artsnavn og Nortaxa', 'https://artsdatabanken.no/aktuelt-og-innsikt/artsnavn'],
      ['NCBI – Taxonomy Database', 'https://www.ncbi.nlm.nih.gov/taxonomy'],
      ['OpenStax Biology 2e – Organizing Life on Earth', 'https://openstax.org/books/biology-2e/pages/20-1-organizing-life-on-earth'],
      ['Artsdatabanken – DNA-strekkoding i Artsprosjektet', 'https://artsdatabanken.no/aktuelt-og-innsikt/artsprosjektet']
    ],
    examples: [['En vanskelig torvmose', 'En mose varierer i farge og vekstform mellom våte og tørre partier.', ['Dokumenter skudd, blad og voksested.', 'Følg relevant nøkkel til laveste sikre nivå.', 'Sammenlign med herbariemateriale og alternative arter.', 'Rapporter usikkerhet dersom mikroskopiske trekk mangler.']], ['Et genetisk treff', 'En insektlarve gir høyt DNA-strekkodetreff mot én art.', ['Kontroller prøve-ID og sekvenskvalitet.', 'Undersøk om nærstående arter deler markøren.', 'Sjekk at referansene har vouchere og riktig geografi.', 'Sammenhold med larvemorfologi og funnsted.']]],
    places: [['naturhistorisk_museum', 'Naturhistorisk museum', 'Samlinger og referansebelegg viser hvordan bestemmelser kan kontrolleres og revideres.'], ['ostensjovannet', 'Østensjøvannet', 'Artsobservasjoner gir case for å skille funn, navn, bestemmelser og sikre bestander.']]
  },
  {
    id: 'botanikk_vegetasjon',
    title: 'Botanikk og vegetasjon',
    subtitle: 'Fra plantecellen til vegetasjonens mønstre',
    lead: 'Planter er ikke passive flater i landskapet. De bygger organer, flytter vann og sukker, fanger lysenergi, regulerer vekst og veksler mellom generasjoner. Dette kapittelet følger planten fra celler og vev til formering, hovedgrupper, artsbestemmelse og vegetasjon langs miljøgradienter.',
    learningObjectives: ['identifisere sentrale planteceller, vev og organer', 'forklare opptak, transpirasjon og transport i xylem og floem', 'skille fotosyntese, celleånding, brutto- og nettoproduksjon', 'forklare hvordan hormoner og miljøsignaler styrer vekst', 'sammenligne generasjonsveksling hos moser, karsporeplanter og frøplanter', 'bestemme planter og analysere vegetasjon med ruter og miljøgradienter'],
    sections: [
      ['plantekroppen', '1. Celler, vev og organer', [
        'Plantecellen deler mange trekk med andre eukaryote celler, men cellevegg, stor vakuole og kloroplaster gir særlige muligheter for støtte, lagring, vannbalanse og fotosyntese. Ikke alle planteceller har kloroplaster; rotceller og ledningsvev er spesialisert for andre oppgaver.',
        'Meristemer produserer nye celler. Grunnvev utfører blant annet fotosyntese, lagring og støtte, mens hudvev beskytter og regulerer utveksling. Xylem og floem danner sammenhengende transportsystemer gjennom rot, stengel og blad.',
        'Roten forankrer og tar opp vann og mineraler. Stengelen bærer blader og reproduktive strukturer og forbinder transportvevet. Bladet gir stor overflate for lys og gassutveksling, men må samtidig begrense vanntap.'
      ]],
      ['transport-og-gassutveksling', '2. Vann, mineraler og sukker gjennom planten', [
        'Rothår øker kontaktflaten mot jorden. Vann beveger seg etter gradienter i vannpotensial, mens ioner kan kreve aktiv transport. Mykorrhiza kan endre opptaksflaten, men hører også til samspillet mellom planter og sopp.',
        'I xylemet trekkes vann oppover når fordamping fra bladene skaper spenning i en sammenhengende vannsøyle. Floemet fordeler sukker og andre forbindelser fra kildevev, ofte modne blader, til slukvev som røtter, frukt og vekstpunkter.',
        'Spalteåpninger slipper karbondioksid inn og vanndamp ut. Åpningene reguleres etter lys, vannstatus og signaler. Derfor kan høy temperatur, vind og tørke redusere karbonopptaket selv når lys er tilgjengelig.'
      ]],
      ['energi-og-vekst', '3. Fotosyntese, respirasjon og regulert vekst', [
        'Fotosyntesens lysreaksjoner fanger energi, mens karbonfikseringen bygger organiske forbindelser fra karbondioksid. Celleånding bryter ned energirike forbindelser og produserer ATP til vekst, vedlikehold og transport.',
        'Brutto fotosyntese er samlet karbonopptak. Når plantens egen respirasjon trekkes fra, får vi netto produksjon. En plante respirerer hele døgnet, mens fotosyntesen krever lys.',
        'Auxin, cytokinin, gibberellin, abscisinsyre og andre signalstoffer virker sammen med vevets følsomhet. Tropismer, frøhvile, knoppsprett og blomstring må derfor forstås som regulerte responser, ikke som én enkelt hormons virkning.'
      ]],
      ['livssykluser', '4. Generasjonsveksling, bestøvning og spredning', [
        'Alle landplanter har generasjonsveksling mellom en haploid gametofytt og en diploid sporofytt. Hos moser er gametofytten fremtredende, mens sporofytten dominerer hos karplanter.',
        'Moser og mange karsporeplanter trenger fritt vann for at bevegelige sædceller skal nå eggcellen. Pollen gjør frøplanter mindre avhengige av vann under befruktning, og frø beskytter embryoet og kan utsette spiring.',
        'Bestøvning flytter pollen; befruktning er sammensmeltingen av kjønnsceller. Frukt og frø kan spres med vind, vann eller dyr, men spredning er ikke det samme som vellykket etablering.'
      ]],
      ['grupper-og-vegetasjon', '5. Plantegrupper, bestemmelse og vegetasjon', [
        'Moser mangler det samme utviklede ledningsvevet som karplanter. Karsporeplanter har karvev og sporer, nakenfrøete har frø som ikke er omsluttet av frukt, og blomsterplanter produserer blomster og frukt.',
        'Plantebestemmelse bruker både vegetative og reproduktive trekk. Blomster, frukt, sporer og hår kan være mer diagnostiske enn farge og helhetsinntrykk. Et herbariumbelegg eller en grundig bildeserie gjør resultatet etterprøvbart.',
        'Flora er artene i et område; vegetasjon er mønsteret de danner. Ruter og transekter kan vise hvordan sammensetning, sjikt og dekning endres med fuktighet, næring, lys, høyde, forstyrrelse og arealhistorie.'
      ]]
    ],
    concepts: [['meristem', 'Meristem', 'Vekstvev med celler som deler seg og danner nye planteorganer.'], ['xylem', 'Xylem', 'Ledningsvev som hovedsakelig transporterer vann og mineraler.'], ['floem', 'Floem', 'Ledningsvev som fordeler sukker og andre organiske forbindelser.'], ['transpirasjon', 'Transpirasjon', 'Tap av vanndamp fra planten, særlig gjennom spalteåpninger.'], ['fotosyntese', 'Fotosyntese', 'Prosesser som bruker lysenergi til å bygge organisk stoff fra karbondioksid og vann.'], ['generasjonsveksling', 'Generasjonsveksling', 'Veksling mellom haploid gametofytt og diploid sporofytt.'], ['bestovning', 'Bestøvning', 'Overføring av pollen til den strukturen der det kan spire.'], ['vegetasjon', 'Vegetasjon', 'Plantedekket og mønsteret arter og sjikt danner i et område.'], ['miljogradient', 'Miljøgradient', 'Trinnvis endring i en miljøfaktor gjennom rommet.'], ['herbariebelegg', 'Herbariebelegg', 'Presset og etikettert planteeksemplar bevart for dokumentasjon og kontroll.']],
    sources: [
      ['OpenStax Biology 2e – The Plant Body', 'https://openstax.org/books/biology-2e/pages/30-1-the-plant-body'],
      ['OpenStax Biology 2e – Transport of Water and Solutes in Plants', 'https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants'],
      ['OpenStax Biology 2e – Evolution of Seed Plants', 'https://openstax.org/books/biology-2e/pages/26-1-evolution-of-seed-plants'],
      ['Artsdatabanken – Natur i Norge og artssammensetning', 'https://artsdatabanken.no/Pages/179953/']
    ],
    examples: [['Et blad i tørke', 'Et bytre lukker spalteåpningene på en varm og tørr ettermiddag.', ['Mål lys, temperatur, luftfuktighet og jordfuktighet.', 'Skill redusert gassutveksling fra varig skade.', 'Koble spalteåpninger til både karbondioksidopptak og vanntap.', 'Sammenlign med morgen eller vannet kontroll.']], ['Fra rute til vegetasjonsmønster', 'Planter registreres fra våt til tørr del av en eng.', ['Legg et transekt før artsregistreringen starter.', 'Bruk like ruter og samme dekningsskala.', 'Mål minst én relevant miljøvariabel.', 'Test om mønsteret også kan skyldes skjøtsel eller historie.']]],
    places: [['botanisk_hage', 'Botanisk hage', 'Levende samlinger gjør det mulig å sammenligne organer, livssykluser og plantegrupper.'], ['bygdoy_dronningberget', 'Bygdøy Dronningberget', 'Vegetasjon og gradienter kan undersøkes i et dokumentert landskap med tydelige voksestedsforskjeller.']]
  },
  {
    id: 'zoologi_dyreliv',
    title: 'Zoologi og dyreliv',
    subtitle: 'Fra kroppsplan og livsstadium til funksjon og atferd',
    lead: 'Dyreriket rommer langt mer enn de mest synlige fuglene og pattedyrene. Kroppsplan, utvikling, gassutveksling, bevegelse og formering er organisert på svært ulike måter hos svamper, leddormer, bløtdyr, leddyr og virveldyr. Dette kapittelet bygger zoologisk forståelse fra hovedgrupper og livssykluser til funksjonell anatomi og etterprøvbar atferdsobservasjon.',
    learningObjectives: ['sammenligne dyrerikets hovedgrupper med kroppsplan og utvikling', 'identifisere sentrale trekk hos virvelløse dyr og leddyr', 'forklare metamorfose og skifte mellom livsstadier', 'sammenligne fisk, amfibier og reptilers miljøtilpasninger', 'koble fuglers og pattedyrs anatomi til funksjon og habitat', 'skille atferdsbeskrivelse, umiddelbar mekanisme og evolusjonær funksjon'],
    sections: [
      ['kroppsplaner', '1. Kroppsplaner og dyrerikets mangfold', [
        'Dyr er flercellede heterotrofe organismer med utviklingsprosesser som etablerer en kroppsplan. Symmetri, vevslag, kroppshule, segmentering og embryonal utvikling brukes til å sammenligne hovedlinjer.',
        'Radiærsymmetri fungerer godt når omgivelsene møtes fra flere retninger, mens bilateral symmetri henger sammen med tydelig framende og konsentrerte sanseorganer hos mange aktivt bevegelige dyr. Dette er funksjonelle mønstre, ikke en rangering av verdi eller kompleksitet.',
        'Fylogenetiske data viser at tradisjonelle likheter ikke alltid følger slektskap. Kroppsplanen må derfor leses sammen med utvikling, fossiler og genetiske data.'
      ]],
      ['virvellose', '2. Virvelløse dyr og leddyrenes løsninger', [
        'Virvelløse dyr er en praktisk samlebetegnelse, ikke én naturlig slektskapsgruppe. Svamper, nesledyr, flatormer, rundormer, leddormer, bløtdyr, leddyr og pigghuder har svært ulike kroppsplaner og organsystemer.',
        'Bløtdyr deler en grunnplan med mantel og muskuløs fot, men gruppen omfatter blant annet snegler, muslinger og blekkspruter. Leddormer har segmentert kropp, mens rundormer mangler denne segmenteringen.',
        'Leddyr har ytre skjelett, leddelte vedheng og må skifte ham for å vokse. Kroppsavsnitt, bein, antenner og munndeler skiller krepsdyr, edderkoppdyr, mangefotinger og insekter.'
      ]],
      ['livssykluser', '3. Metamorfose, formering og skiftende habitater', [
        'Ved ufullstendig metamorfose ligner nymfen ofte den voksne, men mangler fullt utviklede vinger og kjønnsorganer. Ved fullstendig metamorfose skiller larve, puppe og voksen seg tydelig i kropp og funksjon.',
        'Livsstadier kan bruke ulike ressurser og leveområder. En vannlevende insektlarve og et flygende voksent individ må derfor registreres med livsstadium; ellers blandes økologisk svært ulike observasjoner.',
        'Ytre og indre befruktning, egglegging, levendefødsel og foreldreomsorg fordeler risiko og investering ulikt. Antall avkom alene sier lite uten kunnskap om overlevelse og omsorg.'
      ]],
      ['virveldyr', '4. Fisk, amfibier, reptiler, fugler og pattedyr', [
        'Fisk bruker gjeller og finner, men betegnelsen rommer flere evolusjonære linjer. Amfibier har ofte vannlevende egg og larver og landlevende voksne, mens gassutveksling kan skje gjennom både hud og lunger.',
        'Amniotenes fosterhinner gir embryoet et beskyttet væskemiljø og reduserer avhengigheten av fritt vann under utviklingen. Reptiler, fugler og pattedyr tilhører amniotene, selv om formeringen senere har fått mange former.',
        'Fjær, nebb og luftssekker preger fuglenes funksjonelle anatomi. Hår, melkekjertler og særtrekk i kjeve og tenner kjennetegner pattedyr. Begge grupper har høy energiomsetning og aktiv temperaturregulering.'
      ]],
      ['atferd', '5. Atferd som observerbart og testbart fenomen', [
        'Et etogram definerer handlinger gjennom synlige kriterier. Fødesøk, hvile, varsling og aggresjon må beskrives før årsak eller hensikt tolkes. Antropomorfe ord kan skjule hva som faktisk skjedde.',
        'Umiddelbare forklaringer spør hvilke sanser, signaler, hormoner, erfaringer og miljøforhold som utløser atferden. Ultimate forklaringer spør hvordan atferden har utviklet seg og påvirker reproduktiv suksess.',
        'Fokalobservasjon følger ett individ, skannregistrering gir øyeblikksbilder av en gruppe, og hendelsesregistrering teller bestemte handlinger. Valget avgjør hvilke konklusjoner tidsbudsjett og hendelsesrater kan støtte.'
      ]]
    ],
    concepts: [['kroppsplan', 'Kroppsplan', 'Grunnleggende organisering av kroppens akser, vev, hulrom og organer.'], ['bilateral_symmetri', 'Bilateral symmetri', 'Kropp som kan deles i speilvendte høyre og venstre sider langs ett plan.'], ['virvellose', 'Virvelløse dyr', 'Praktisk samlebetegnelse for dyr uten virvelsøyle, ikke én klade.'], ['eksoskjelett', 'Eksoskjelett', 'Ytre støttestruktur som blant annet finnes hos leddyr.'], ['metamorfose', 'Metamorfose', 'Utviklingsskifte mellom tydelig ulike kropps- og livsstadier.'], ['amniot', 'Amniot', 'Virveldyrgruppe der embryoet utvikles med fosterhinner.'], ['endotermi', 'Endotermi', 'Produksjon og regulering av kroppsvarme gjennom stoffskifte.'], ['etogram', 'Etogram', 'Operasjonell liste over atferdskategorier i en studie.'], ['proximal_forklaring', 'Proximal forklaring', 'Forklaring på mekanismene og signalene som utløser en egenskap eller atferd.'], ['ultimat_forklaring', 'Ultimat forklaring', 'Forklaring på evolusjonær historie eller funksjon.']],
    sources: [
      ['OpenStax Biology 2e – Features Used to Classify Animals', 'https://openstax.org/books/biology-2e/pages/27-2-features-used-to-classify-animals'],
      ['OpenStax Biology 2e – Invertebrates', 'https://openstax.org/books/biology-2e/pages/28-introduction'],
      ['OpenStax Biology 2e – Chordates and Vertebrates', 'https://openstax.org/books/biology-2e/pages/29-1-chordates'],
      ['Artsdatabanken – Amfibier', 'https://artsdatabanken.no/arter/takson/243/beskrivelse']
    ],
    examples: [['En salamanderdam', 'Egg, larver og voksne salamandere registreres gjennom sesongen.', ['Bestem livsstadium og dokumenter kjennetegn.', 'Registrer vannstand, temperatur og vegetasjon med dato.', 'Skill reproduksjonslokalitet fra voksen landhabitat.', 'Unngå bestandskonklusjon uten standardisert gjentakelse.']], ['Atferd ved et fugletårn', 'Vannfugler ser ut til å endre aktivitet når mennesker kommer nær.', ['Definer hvile, næringssøk, forflytning og varsling i et etogram.', 'Registrer avstand, gruppestørrelse og tidspunkt.', 'Sammenlign like tidsvinduer med og uten nærgående ferdsel.', 'Beskriv mønsteret uten å tillegge fuglene motiv.']]],
    places: [['ostensjovannet_fugletarn', 'Østensjøvannet fugletårn', 'Standardisert observasjon kan koble fuglers morfologi, aktivitet og habitatbruk.'], ['blindern_forskningsparken_salamanderdam', 'Salamanderdammen ved Forskningsparken', 'Amfibienes egg, larver, metamorfose og todelte habitatkrav kan undersøkes som livssyklus.']]
  }
];

function chapterDocument(spec, emneIds) {
  const diagnosticQuestions = [
    { question: `Kan ${spec.title.toLocaleLowerCase('nb-NO')} bygges på gjenkjennelse alene?`, answer: 'Nei. Objekt, kjennetegn, metode, sammenligningsgrunnlag og usikkerhet må dokumenteres.' },
    { question: 'Er ett observert trekk nok for en sikker biologisk konklusjon?', answer: 'Vanligvis ikke. Relevante alternative bestemmelser eller forklaringer må kontrolleres mot flere uavhengige trekk eller data.' },
    { question: 'Kan en fagmodell erstatte kilden til et konkret funn?', answer: 'Nei. Modellen organiserer analysen, mens eksemplaret, observasjonen, målingen og den inspectable kilden bærer faktapåstanden.' }
  ];
  return {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject: 'natur',
    id: spec.id,
    title: spec.title,
    subtitle: spec.subtitle,
    lead: spec.lead,
    learningObjectives: spec.learningObjectives,
    diagnosticQuestions,
    sections: spec.sections.map(([id, title, paragraphs]) => ({ id, title, paragraphs, keyPoints: paragraphs.map((paragraph) => paragraph.split('.')[0] + '.') })),
    workedExamples: spec.examples.map(([title, situation, analysis]) => ({ title, situation, analysis })),
    commonMisconceptions: [
      { claim: 'Et tydelig helhetsinntrykk er det samme som en sikker bestemmelse.', correction: 'Sikkerhet krever diagnostiske trekk, egnet metode og kontroll mot relevante alternativer.' },
      { claim: 'En biologisk gruppe kan ordnes som en stige fra enkel til avansert.', correction: 'Grupper er forgreinede utviklingslinjer med ulike funksjonelle løsninger, ikke trinn på én skala.' },
      { claim: 'Når et resultat virker plausibelt, er metodeusikkerhet bare en detalj.', correction: 'Prøve, innsats, oppdagbarhet, referanser og avgrensning bestemmer hva resultatet faktisk kan støtte.' }
    ],
    concepts: spec.concepts.map(([id, term, definition]) => ({ id, term, definition })),
    applicationTasks: [
      { task: `Dokumenter et objekt innen ${spec.title}`, prompts: ['Velg organisme, materiale eller observasjon og gi det en entydig identitet.', 'Registrer sted, dato, metode og relevante kjennetegn.', 'Oppgi laveste sikre konklusjon og minst én usikkerhet.'] },
      { task: 'Sammenlign to forklaringer', prompts: ['Formuler to mulige bestemmelser eller mekanismer.', 'Angi hvilken evidens hver forklaring forutsier.', 'Vurder hvilken forklaring materialet støtter og hva som fortsatt mangler.'] },
      { task: 'Bygg et normalt kunnskapsspørsmål', prompts: ['Start i et konkret faktum fra kapittelet.', 'Lag ett entydig riktig svar og troverdige alternativer av samme type.', 'Kontroller at fasiten følger av kilden, ikke bare av emnenavnet.'] }
    ],
    selfCheck: [
      { question: `Hva er første krav i en analyse av ${spec.title.toLocaleLowerCase('nb-NO')}?`, answer: 'Et entydig biologisk objekt eller fenomen med dokumentert materiale, sted eller observasjon.' },
      { question: 'Hvorfor må sammenligningsgrunnlaget oppgis?', answer: 'Fordi en bestemmelse eller funksjonstolkning bare er så sterk som alternativene den faktisk har skilt ut.' },
      { question: 'Hva betyr laveste sikre nivå?', answer: 'Det mest presise taksonomiske eller forklaringsmessige nivået som materialet faktisk støtter.' },
      { question: 'Hva skal skje når kilder eller datatyper peker i ulike retninger?', answer: 'Konflikten skal dokumenteres og undersøkes, ikke skjules i en sterkere konklusjon.' },
      { question: 'Hvorfor må metode og usikkerhet følge faktapåstanden?', answer: 'Fordi de avgrenser hvilke slutninger observasjonen, prøven eller målingen kan bære.' }
    ],
    relatedPlaces: spec.places.map(([id, name, role]) => ({ id, name, role })),
    sources: spec.sources.map(([label, url]) => ({ label, url })),
    emne_ids: emneIds
  };
}

function updateDomainRecord(record, domain, coverageStatus) {
  const category = buildCategory(domain);
  record.coverage_status = coverageStatus;
  record.status = 'strong';
  record.emne_ids = domain.emners.map((entry) => entry.id);
  record.chapter_status = 'complete_for_current_biology_layer';
  record.emne_count = record.emne_ids.length;
  if (Object.hasOwn(record, 'current_emne_count')) record.current_emne_count = record.emne_count;
  record.method_ids = domain.methods;
  record.hook_ids = category.topic_hooks.map((entry) => entry.id);
  record.hook_count = record.hook_ids.length;
  record.method_count = record.method_ids.length;
}

function main() {
  const pensum = readJson(P.pensum);
  const contract = readJson(P.contract);
  const emner = readJson(P.emner);
  const methodsDoc = readJson(P.methods);
  const fagkart = readJson(P.fagkart);
  const mappings = readJson(P.mappings);
  const registry = readJson(P.registry);
  const status = readJson(P.status);

  const newEmneIds = new Set(DOMAIN_SPECS.flatMap((domain) => domain.emners.map((entry) => entry.id)));
  const newMethodIds = new Set(METHOD_SPECS.map((entry) => entry[0]));
  const newDomainIds = new Set(DOMAIN_SPECS.map((entry) => entry.id));
  const baseEmners = emner.filter((entry) => !newEmneIds.has(entry.emne_id));
  const baseMethods = methodsDoc.methods.filter((entry) => !newMethodIds.has(entry.method_id));
  const baseMappings = mappings.filter((entry) => !newEmneIds.has(entry.emne_id));
  const baseCategories = fagkart.categories.filter((entry) => !newDomainIds.has(entry.id));
  assert(baseEmners.length === 35, `Forventet bevart miljølag med 35 emner, fikk ${baseEmners.length}`);
  assert(baseMethods.length === 30, `Forventet bevart miljølag med 30 metoder, fikk ${baseMethods.length}`);
  assert(baseMappings.length === 35, `Forventet bevart miljølag med 35 mappingrader, fikk ${baseMappings.length}`);
  assert(baseCategories.length === 6, `Forventet bevart miljølag med 6 fagkartkategorier, fikk ${baseCategories.length}`);

  const newCategories = DOMAIN_SPECS.map(buildCategory);
  const hookIndex = new Map(newCategories.flatMap((category) => category.topic_hooks.map((hook) => [hook.id, hook])));
  const newEmners = DOMAIN_SPECS.flatMap((domain) => domain.emners.map((entry) => buildEmne(domain, entry)));
  const newMethods = METHOD_SPECS.map(buildMethod);
  const newMappings = DOMAIN_SPECS.flatMap((domain) => domain.emners.map((entry) => buildMapping(domain, entry, hookIndex)));

  emner.splice(0, emner.length, ...baseEmners, ...newEmners);
  methodsDoc.methods = [...baseMethods, ...newMethods];
  mappings.splice(0, mappings.length, ...baseMappings, ...newMappings);
  const domainOrder = new Map(pensum.domain_order.map((domainId, index) => [domainId, index]));
  fagkart.categories = [...baseCategories, ...newCategories]
    .sort((left, right) => domainOrder.get(left.id) - domainOrder.get(right.id));
  fagkart.meta.category_count = fagkart.categories.length;
  fagkart.meta.hook_count = fagkart.categories.reduce((sum, category) => sum + category.topic_hooks.length, 0);
  fagkart.meta.canonical_round = 'v5.1';
  fagkart.version = 'v5.1-canonical-biology-phase-1';
  fagkart.canonical_registry_version = 'naturpensum_v5_1';
  fagkart.updated_at = TODAY;
  methodsDoc.version = 'v5.1-canonical-biology-phase-1';
  methodsDoc.updated_at = TODAY;

  for (const domain of DOMAIN_SPECS) {
    const pensumDomain = pensum.domains.find((entry) => entry.domain_id === domain.id);
    const contractDomain = contract.required_domains.find((entry) => entry.domain_id === domain.id);
    assert(pensumDomain && contractDomain, `Mangler domenepost ${domain.id}`);
    updateDomainRecord(pensumDomain, domain, 'materialized_biology_layer');
    updateDomainRecord(contractDomain, domain, 'materialized_biology_layer');
  }

  const remainingGaps = ['evolusjon_biologisk_mangfold', 'sopp_lav_mikroorganismer', 'organismebiologi_fysiologi'];
  pensum.version = 'v5.1-canonical-biology-phase-1';
  pensum.canonical_registry_version = 'naturpensum_v5_1';
  pensum.updated_at = TODAY;
  pensum.summary = {
    ...pensum.summary,
    materialized_domain_count: 8,
    partial_domain_count: 1,
    required_gap_domain_count: 3,
    current_emne_count: emner.length,
    current_method_count: methodsDoc.methods.length,
    current_mapping_count: mappings.length,
    current_topic_hook_count: fagkart.categories.reduce((sum, category) => sum + category.topic_hooks.length, 0),
    all_current_emners_have_mapping: true,
    all_current_method_refs_valid: true,
    editorial_complete: false
  };
  pensum.coverage_statement = 'De seks eksisterende kapitlene bevarer det sterke økologi- og miljølaget. Artskunnskap og systematikk, botanikk og zoologi er nå materialisert som selvstendige biologiske fagområder. Natur er fortsatt ikke heldekkende før evolusjon, sopp/lav/mikroorganismer, organismefysiologi og geologiens indre prosesser er fullført.';

  contract.version = '1.1.0';
  contract.updated_at = TODAY;
  contract.current_state = {
    materialized_environment_domains: ['okosystem_mangfold_habitat', 'vann_hydrologi_kretslop', 'klima_energi_resiliens', 'urban_okologi_gronnstruktur', 'miljopavirkning_forvaltning_regenerasjon'],
    materialized_biology_domains: DOMAIN_SPECS.map((entry) => entry.id),
    partial_domains: ['geologi_landskap_tid'],
    required_gap_domains: remainingGaps,
    preserved_environment_layer_counts: { emner: 35, methods: 30, mappings: 35, hooks: 60, chapters: 6 },
    current_emne_count: emner.length,
    current_method_count: methodsDoc.methods.length,
    current_mapping_count: mappings.length,
    current_hook_count: fagkart.categories.reduce((sum, category) => sum + category.topic_hooks.length, 0),
    current_chapter_count: 9,
    editorial_status: 'chapters_in_progress'
  };

  const naturRegistry = registry.subjects.natur;
  naturRegistry.description = 'Et sammenhengende læreverk om økologi, artskunnskap, botanikk, zoologi, vann, klima, geologi, urban natur, miljøpåvirkning og forvaltning.';
  naturRegistry.canonicalModel.note = 'Emnetitler, definisjoner, fagområder og metodekoblinger leses fra canonical Natur v5.1 gjennom de eksisterende kompatibilitetsfilene. Registryet eier ni redigerte lærekapitler.';
  naturRegistry.chapters = naturRegistry.chapters.filter((entry) => !newDomainIds.has(entry.id));
  for (const domain of DOMAIN_SPECS) {
    const chapterSpec = CHAPTERS.find((entry) => entry.id === domain.id);
    const chapter = chapterDocument(chapterSpec, domain.emners.map((entry) => entry.id));
    const file = `data/fagverk/natur/${domain.id}.json`;
    writeJson(file, chapter);
    naturRegistry.chapters.push({
      id: domain.id,
      title: chapter.title,
      subtitle: chapter.subtitle,
      file,
      primary_domain_id: domain.id,
      emne_ids: domain.emners.map((entry) => entry.id)
    });
  }
  const order = new Map(pensum.domain_order.map((id, index) => [id, index]));
  naturRegistry.chapters.sort((a, b) => (order.get(a.primary_domain_id) ?? 99) - (order.get(b.primary_domain_id) ?? 99));

  const naturStatus = status.subjects.find((entry) => entry.id === 'natur');
  naturStatus.nextGate = 'materialize_evolution_microbiology_fysiology_and_inner_geology';
  naturStatus.note = 'Natur har nå ni redigerte kapitler: det bevarte seksdelte økologi- og miljølaget samt materialiserte fagområder for artskunnskap og systematikk, botanikk og zoologi. Den universelle tolvdelsmodellen mangler fortsatt evolusjon og biologisk mangfold, sopp/lav/mikroorganismer, organismebiologi/fysiologi og full geologi med indre prosesser og naturhistorie. Natur er derfor ikke complete.';

  writeJson(P.emner, emner);
  writeJson(P.methods, methodsDoc);
  writeJson(P.mappings, mappings);
  writeJson(P.fagkart, fagkart);
  writeJson(P.pensum, pensum);
  writeJson(P.contract, contract);
  writeJson(P.registry, registry);
  writeJson(P.status, status);
  console.log(`Materialisert Natur biologi fase 1: ${emner.length} emner, ${methodsDoc.methods.length} metoder, ${mappings.length} mappingrader, ${fagkart.meta.hook_count} hooks og ${naturRegistry.chapters.length} kapitler.`);
}

main();
