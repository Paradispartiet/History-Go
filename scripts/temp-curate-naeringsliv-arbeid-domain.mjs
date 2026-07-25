#!/usr/bin/env node
import fs from "node:fs";

const file = "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const emner = JSON.parse(fs.readFileSync(file, "utf8"));

const patches = {
  em_naering_arbeid_verdiskaping: {
    definition: "Emnet undersøker hvordan menneskelig arbeid, kunnskap, tid, redskaper og ressurser blir omsatt til varer og tjenester, og hvordan den skapte verdien måles og fordeles mellom arbeidstakere, eiere, kunder og fellesskap.",
    why_it_matters: "Verdiskaping blir konkret når spilleren kan følge hvem som gjør arbeidet, hva arbeidet frambringer, hvilke innsatsfaktorer som kreves, og hvem som mottar lønn, overskudd, skatt eller andre gevinster.",
    keywords: ["arbeid", "verdiskaping", "bruksverdi", "bytteverdi", "lønn", "profitt", "arbeidsdeling", "verdifordeling", "innsatsfaktorer"],
    key_concepts: ["arbeid", "verdiskaping", "bruksverdi", "bytteverdi", "lønn", "profitt", "arbeidsdeling", "verdifordeling"],
    core_concepts: ["arbeid", "verdiskaping", "lønn", "profitt", "verdifordeling"],
    sub_concepts: ["bruksverdi", "bytteverdi", "innsatsfaktorer", "tjenestearbeid", "produktivt arbeid", "overskudd", "skatt"],
    key_questions: [
      "Hvilket arbeid utføres her, av hvem, og hvilken vare eller tjeneste kommer ut av det?",
      "Hvor i arbeids- eller produksjonsprosessen øker verdien, og hvordan blir økningen dokumentert eller målt?",
      "Hvordan fordeles inntektene mellom lønn, overskudd, skatt, renter og betaling til leverandører?",
      "Hvilke nødvendige bidrag blir ikke synlige i pris, regnskap eller offentlig fortelling?"
    ],
    conflicts: ["verdiskaping vs verdikapring", "lønn vs overskudd", "bruksverdi vs markedsverdi", "lokalt arbeid vs global verdikjede", "synlig produksjon vs nødvendig vedlikehold"],
    ideological_dimensions: ["arbeidsverditeori vs markedsbasert verdsetting", "aksjonærverdi vs interessentverdi", "privat avkastning vs offentlig verdiskaping", "økonomisk vekst vs omfordeling"],
    analysis_axes: ["innsatsfaktorer vs resultat", "arbeid vs eierskap", "lønn vs profitt", "bruksverdi vs bytteverdi", "lokal verdiskaping vs global verdifordeling", "betalt arbeid vs ubetalt bidrag"],
    quiz_angles: ["identify_who_does_what_work", "trace_value_creation_step", "separate_revenue_wages_profit_and_tax", "connect_visible_output_to_hidden_inputs"],
    blindspots: ["Omsetning og profitt er ikke det samme som samlet verdiskaping.", "Ubetalt arbeid, vedlikehold og offentlig infrastruktur kan være nødvendige uten å stå i virksomhetens regnskap.", "Produktivitetsgevinster tilfaller ikke automatisk dem som utfører arbeidet.", "En høy markedspris sier ikke alene hvor stor bruksverdi varen eller tjenesten har."],
    question_surface_mode: "work-value-distribution-first",
    generator_use_note: "Start med en dokumentert vare, tjeneste eller arbeidsprosess. Spør først hvem som gjør hva og hva resultatet blir; løft deretter inn måling og fordeling av verdi.",
    overlap_resolution_note: "Bruk dette som grunnemne når hovedspørsmålet er hvordan arbeid skaper og fordeler verdi. Bruk produksjon og produktivitet når prosess og ytelse er hovedsaken, og profesjoner og kompetanse når kunnskapsgrunnlaget står i sentrum.",
    anti_patterns: ["Ikke bruk omsetning, lønnsomhet og verdiskaping som synonymer.", "Ikke spør abstrakt hvem som skaper verdi uten en dokumentert arbeidsprosess eller tjeneste.", "Ikke framstill verdifordelingen som naturgitt når lønn, pris, skatt og overskudd er institusjonelt bestemt."]
  },
  em_naering_arbeidsliv_organisering: {
    definition: "Emnet undersøker hvordan oppgaver, arbeidstid, ansvar, ledelse, kontrakter og samarbeid organiseres i og mellom virksomheter, fra skiftlag og verkstedgulv til kontor, franchise, bemanning og underleverandører.",
    why_it_matters: "Den samme varen eller tjenesten kan produseres gjennom svært ulike organisasjonsformer. Organiseringen avgjør hvem som har beslutningsmakt, hvor trygg jobben er, hvordan kunnskap deles, og hvilke muligheter arbeidstakerne har til å påvirke.",
    keywords: ["arbeidsorganisering", "arbeidstid", "skiftarbeid", "arbeidsdeling", "ledelse", "medbestemmelse", "tariffavtale", "underleverandør", "bemanning"],
    key_concepts: ["arbeidsorganisering", "hierarki", "arbeidsdeling", "arbeidstid", "medbestemmelse", "tariffavtale", "underleverandør", "styringsrett"],
    core_concepts: ["arbeidsorganisering", "hierarki", "arbeidsdeling", "arbeidstid", "medbestemmelse", "styringsrett"],
    sub_concepts: ["skiftarbeid", "bemanningsforetak", "underleverandør", "tariffavtale", "arbeidskollektiv", "linjeorganisasjon", "teamorganisering"],
    key_questions: [
      "Hvem fordeler oppgavene, setter tempoet og kontrollerer kvaliteten på arbeidet?",
      "Hvordan er arbeidstid, skift, bemanning og ansvar organisert i den dokumenterte perioden?",
      "Er arbeidet utført av fast ansatte, midlertidige, innleide, selvstendige eller underleverandører?",
      "Hvilke formelle og uformelle kanaler har de ansatte for medbestemmelse, motstand og samarbeid?"
    ],
    conflicts: ["styringsrett vs medbestemmelse", "fleksibilitet vs forutsigbarhet", "hierarki vs faglig autonomi", "fast ansettelse vs innleie og outsourcing", "standardisering vs lokalt skjønn"],
    ideological_dimensions: ["arbeidsgivers styringsrett vs demokrati i arbeidslivet", "individuell kontrakt vs kollektiv forhandling", "fleksibel bemanning vs sosial trygghet", "ledelseskontroll vs selvorganisering"],
    analysis_axes: ["ledelse vs utførelse", "fast ansatt vs innleid", "formell organisasjon vs faktisk praksis", "sentral kontroll vs lokalt skjønn", "individuell ytelse vs kollektivt arbeid", "stabil arbeidstid vs variabel tilgjengelighet"],
    quiz_angles: ["identify_role_and_reporting_line", "compare_employment_forms", "trace_shift_or_task_coordination", "connect_rules_to_worker_influence"],
    blindspots: ["Organisasjonskart viser ikke nødvendigvis hvem som faktisk løser problemer eller har uformell makt.", "Innleide, renholdere, sjåfører og andre underleverandører kan være avgjørende uten å regnes som del av virksomheten.", "Fleksibilitet for kunden eller arbeidsgiveren kan bety uforutsigbarhet for arbeidstakeren.", "Arbeidskollektiver utvikler egne normer som ikke kan leses direkte ut av kontrakter og instrukser."],
    question_surface_mode: "workplace-organization-first",
    generator_use_note: "Bruk dokumenterte roller, skiftordninger, kontraktsformer, organisasjonsendringer eller konflikter. Spør hvordan arbeidet faktisk ble koordinert før ledelsesteori introduseres.",
    overlap_resolution_note: "Avgrens emnet til fordeling av oppgaver, tid, autoritet og ansettelsesforhold. Bruk produksjon og produktivitet når ytelsen i selve prosessen er hovedsaken, og fagforeninger og interesser når kollektiv representasjon er hovedsaken.",
    anti_patterns: ["Ikke anta at et formelt organisasjonskart beskriver den faktiske arbeidsdelingen.", "Ikke bruk kontorbygget som bevis på arbeidsorganisering uten kilder om virksomhetene og arbeidet der.", "Ikke framstill innleie, teamarbeid eller hjemmekontor som entydig positivt eller negativt uten dokumenterte konsekvenser."]
  },
  em_naering_automatisering_og_arbeid: {
    definition: "Emnet undersøker hvordan maskiner, programvare, sensorer og algoritmer overtar, deler eller omformer konkrete arbeidsoppgaver, og hvordan dette endrer kompetanse, tempo, kontroll, ansvar og bemanning.",
    why_it_matters: "Automatisering fjerner sjelden bare et helt yrke. Den flytter oppgaver mellom mennesker og tekniske systemer, skaper nytt vedlikeholds- og kontrollarbeid og fordeler gevinster og risiko ulikt.",
    keywords: ["automatisering", "robotisering", "programvare", "algoritmisk styring", "oppgavesubstitusjon", "teknologisk støtte", "omskolering", "data", "vedlikehold"],
    key_concepts: ["automatisering", "oppgavesubstitusjon", "teknologisk støtte", "algoritmisk styring", "avkvalifisering", "oppkvalifisering", "produktivitet", "teknologisk arbeidsdeling"],
    core_concepts: ["automatisering", "oppgavesubstitusjon", "teknologisk støtte", "algoritmisk styring", "oppkvalifisering", "avkvalifisering"],
    sub_concepts: ["robotisering", "sensorikk", "programvare", "fjernstyring", "dataarbeid", "vedlikehold", "menneskelig kontrollsløyfe", "omskolering"],
    key_questions: [
      "Hvilke konkrete oppgaver ble utført av mennesker før teknologien ble innført, og hvem eller hva utfører dem etterpå?",
      "Hvilke nye oppgaver innen overvåking, feilhåndtering, vedlikehold og dataarbeid oppstod?",
      "Hvordan endret teknologien kravene til kompetanse, tempo, bemanning og ansvar?",
      "Hvem mottok produktivitetsgevinsten, og hvem bar kostnadene ved overgang, feil eller bortfall av arbeid?"
    ],
    conflicts: ["oppgavesubstitusjon vs teknologisk støtte", "produktivitetsgevinst vs jobbkvalitet", "standardisering vs faglig skjønn", "datasporing vs personvern", "kapitalinvestering vs sysselsetting"],
    ideological_dimensions: ["teknologisk determinisme vs sosial utforming av teknologi", "innovasjonsfrihet vs arbeidstakervern", "eiergevinst vs delte produktivitetsgevinster", "algoritmisk kontroll vs profesjonell autonomi"],
    analysis_axes: ["menneske vs maskin", "oppgave bortfalt vs oppgave omformet", "oppkvalifisering vs avkvalifisering", "autonomi vs algoritmisk kontroll", "synlig grensesnitt vs skjult menneskearbeid", "effektivitet vs robusthet"],
    quiz_angles: ["compare_task_before_and_after_automation", "identify_new_control_or_maintenance_work", "trace_skill_change", "separate_technical_capability_from_organizational_choice"],
    blindspots: ["Automatiserte systemer er ofte avhengige av skjult menneskelig kontroll, datamerking, rengjøring og vedlikehold.", "At en oppgave kan automatiseres betyr ikke at teknologien ble tatt i bruk eller fungerte som planlagt.", "Stillingskutt kan skyldes organisering, etterspørsel eller outsourcing, ikke bare teknologien.", "Feil og unntak blir ofte håndtert av ansatte selv om normaldriften framstår som helautomatisk."],
    question_surface_mode: "before-after-task-first",
    generator_use_note: "Krev en dokumentert teknologi og en konkret før–etter-endring i oppgaver, bemanning eller kompetanse. Spør om arbeidsdelingen før teorier om automatisering og kontroll.",
    overlap_resolution_note: "Bruk emnet når hovedsaken er hvordan teknologi flytter oppgaver mellom mennesker og systemer. Bruk industri og mekanisering for det historiske fabrikksystemet, og omstilling for den bredere virksomhetsendringen.",
    anti_patterns: ["Ikke skriv at teknologien erstattet mennesker når kilden bare dokumenterer modernisering eller nytt utstyr.", "Ikke bruk automatisering som synonym for digitalisering.", "Ikke framstill teknologisk endring som årsak alene når ledelsesvalg, etterspørsel og regulering også påvirket utfallet."]
  },
  em_naering_effektivitet_optimalisering: {
    definition: "Emnet undersøker forholdet mellom ressursinnsats og resultat, og hvordan virksomheter velger mål, målemetoder og begrensninger når de forsøker å redusere tid, kostnad, svinn eller ledig kapasitet.",
    why_it_matters: "Effektivitetstall virker nøytrale, men resultatet avhenger av hva som teller som innsats, kvalitet og ønsket utfall. En lokal forbedring kan samtidig flytte kostnader til ansatte, kunder, leverandører eller miljø.",
    keywords: ["effektivitet", "optimalisering", "kapasitetsutnyttelse", "flaskehals", "gjennomstrømning", "nøkkeltall", "ledetid", "kvalitet", "robusthet"],
    key_concepts: ["effektivitet", "produktivitet", "kapasitetsutnyttelse", "flaskehals", "gjennomstrømning", "nøkkeltall", "ledetid", "robusthet"],
    core_concepts: ["effektivitet", "kapasitetsutnyttelse", "flaskehals", "gjennomstrømning", "nøkkeltall", "ledetid"],
    sub_concepts: ["kvalitet", "enhetskostnad", "buffer", "slakk", "robusthet", "svinn", "reparasjon", "eksternalisert kostnad"],
    key_questions: [
      "Hvilket resultat forsøker virksomheten å forbedre, og hvilket nøkkeltall brukes som bevis?",
      "Hva regnes som innsats, tidsbruk, kvalitet og kostnad i målingen?",
      "Hvor ligger den dokumenterte flaskehalsen, og flyttes problemet når ett ledd optimaliseres?",
      "Hvilke kvalitets-, arbeidsmiljø-, beredskaps- eller miljøkostnader faller utenfor regnestykket?"
    ],
    conflicts: ["hastighet vs kvalitet", "høy kapasitetsutnyttelse vs beredskap", "kortsiktig kostnadskutt vs langsiktig vedlikehold", "målbar ytelse vs faglig kvalitet", "lokal optimalisering vs helhetlig flyt"],
    ideological_dimensions: ["aksjonærmål vs bred samfunnsverdi", "lean drift vs sikkerhetsmarginer", "målekultur vs profesjonelt skjønn", "kostnadsreduksjon vs tjeneste- og arbeidskvalitet"],
    analysis_axes: ["innsats vs resultat", "hastighet vs kvalitet", "kapasitet vs faktisk utnyttelse", "effektivitet vs robusthet", "målt ytelse vs utelatt arbeid", "privat kostnad vs sosial kostnad"],
    quiz_angles: ["identify_metric_and_denominator", "locate_process_bottleneck", "compare_speed_cost_quality_tradeoff", "detect_shifted_or_excluded_cost"],
    blindspots: ["Et forbedret nøkkeltall kan skyldes endret definisjon eller sammenligningsgrunnlag, ikke bedre drift.", "Full kapasitetsutnyttelse kan gjøre systemet mer sårbart for feil og etterspørselstopper.", "Raskere gjennomløp kan skjule kvalitetsfall, merarbeid eller kostnader hos andre ledd.", "Ubetalt venting, reparasjoner og vedlikehold kan falle utenfor produktivitetsmålet."],
    question_surface_mode: "metric-and-tradeoff-first",
    generator_use_note: "Bruk et konkret nøkkeltall, en flaskehals eller en dokumentert prosessendring. Forklar hva som måles og hva som holdes utenfor før begrepet optimalisering brukes.",
    overlap_resolution_note: "Avgrens emnet til målene, målemetodene og avveiingene i forbedringsarbeidet. Bruk produksjon og produktivitet når selve produksjonsflyten og output per innsats står i sentrum.",
    anti_patterns: ["Ikke bruk raskere, billigere og mer effektivt som synonymer.", "Ikke presenter en prosentvis forbedring uten å angi hva som er målt og sammenlignet.", "Ikke konstruer et optimaliseringsspørsmål når kilden bare beskriver modernisering uten resultatdata."]
  },
  em_naering_industri_og_mekanisering: {
    definition: "Emnet undersøker overgangen fra håndverks- og verkstedsproduksjon til maskinbasert, energikrevende og standardisert produksjon i fabrikker, med tilhørende arbeidsdeling, kapitalbehov og fysisk infrastruktur.",
    why_it_matters: "Maskiner, kraftkilder, fabrikkbygninger, transportspor og arbeiderboliger gjør industrialiseringens økonomi synlig i landskapet og viser hvordan produksjonen omformet både arbeid og by.",
    keywords: ["industri", "mekanisering", "fabrikksystem", "kraftkilde", "maskinpark", "standardisering", "masseproduksjon", "kapitalintensitet", "industrilandskap"],
    key_concepts: ["industrialisering", "mekanisering", "fabrikksystem", "kraftkilde", "standardisering", "masseproduksjon", "kapitalintensitet", "industriell arbeidsdeling"],
    core_concepts: ["industrialisering", "mekanisering", "fabrikksystem", "kraftkilde", "standardisering", "kapitalintensitet"],
    sub_concepts: ["maskinpark", "verksted", "masseproduksjon", "råvare", "industriell disiplin", "vedlikehold", "industrilandskap", "produksjonslinje"],
    key_questions: [
      "Hva ble produsert, med hvilke råvarer, maskiner og kraftkilder?",
      "Hvordan endret mekaniseringen arbeidsdelingen, tempoet, ferdighetskravene og bemanningen?",
      "Hvilken transport-, energi- og lagerinfrastruktur bandt fabrikken til leverandører og markeder?",
      "Hvilke spor etter produksjon, forurensning, arbeid og ombygging kan dokumenteres i området?"
    ],
    conflicts: ["håndverk vs masseproduksjon", "økt produksjon vs maskinsikkerhet", "kapitalintensitet vs sysselsetting", "industrivekst vs forurensning", "bevaring av industrimiljø vs ny eiendomsutvikling"],
    ideological_dimensions: ["industrielt framskritt vs sosiale og miljømessige kostnader", "privat fabrikkapital vs offentlig infrastruktur", "arbeidsdisiplin vs håndverksautonomi", "kulturminnevern vs tomteverdi"],
    analysis_axes: ["håndkraft vs maskinkraft", "håndverk vs standardisering", "arbeidsintensiv vs kapitalintensiv produksjon", "fabrikk vs omkringliggende by", "produksjonsvekst vs miljøbelastning", "opprinnelig drift vs etterbruk"],
    quiz_angles: ["identify_product_machine_and_power_source", "trace_factory_input_and_output_flow", "compare_craft_and_mechanized_task", "connect_industry_to_city_infrastructure"],
    blindspots: ["Kvinners, barns, migranters og sesongarbeideres innsats kan være svakere dokumentert enn eiernes og ingeniørenes.", "Reparasjon, smøring, rengjøring og annen maskinpleie var nødvendig arbeid, ikke et teknisk tillegg.", "Råvarer og miljøkostnader kunne ligge langt utenfor selve fabrikkområdet.", "Industrien var avhengig av offentlig regulering, kraft, vei, havn og jernbane selv når historien fortelles som privat gründervirksomhet."],
    question_surface_mode: "machine-power-process-first",
    generator_use_note: "Start med et dokumentert produkt, en maskin, en kraftkilde eller et produksjonstrinn. Koble deretter mekaniseringen til arbeidsdeling, kapitalbehov og byens infrastruktur.",
    overlap_resolution_note: "Bruk emnet for den historiske og materielle overgangen til maskinbasert fabrikkproduksjon. Bruk automatisering når styring flyttes til programvare og algoritmer, og produksjon og produktivitet når prosessytelsen er hovedsaken.",
    anti_patterns: ["Ikke la arkitekturstil erstatte kunnskap om hva fabrikken produserte og hvordan.", "Ikke bruk industrialisering som merkelapp på ethvert gammelt verksted uten dokumentert mekanisering eller fabrikkorganisering.", "Ikke framstill maskinen som eneste årsak til endringer i arbeid, byvekst eller produksjon."]
  },
  em_naering_omstilling_kriser_skift: {
    definition: "Emnet undersøker hvordan virksomheter, bransjer og arbeidssteder reagerer på etterspørselsfall, teknologiske skift, eierskifte, regulering, ressursmangel og finansielle sjokk gjennom nedleggelse, flytting, restrukturering, investering eller ny bruk.",
    why_it_matters: "Omstilling fordeler tid, risiko og tap ulikt. En bygning kan få nytt liv samtidig som arbeidsplasser og kompetansemiljø forsvinner, mens en krise kan åpne for både innovasjon, oppkjøp og offentlig inngrep.",
    keywords: ["omstilling", "strukturendring", "krise", "restrukturering", "konkurs", "nedleggelse", "flytting", "stiavhengighet", "kompetanseomstilling", "etterbruk"],
    key_concepts: ["omstilling", "strukturendring", "krise", "restrukturering", "konkurs", "stiavhengighet", "kreativ destruksjon", "rettferdig omstilling"],
    core_concepts: ["omstilling", "strukturendring", "krise", "restrukturering", "konkurs", "stiavhengighet"],
    sub_concepts: ["nedleggelse", "flytting", "oppkjøp", "omskolering", "etterbruk", "statsstøtte", "innlåsing", "rettferdig omstilling"],
    key_questions: [
      "Hvilket dokumentert sjokk eller langsiktig skift utløste endringen?",
      "Hvilke beslutninger tok eiere, ledelse, ansatte, kreditorer og myndigheter, og i hvilken rekkefølge?",
      "Hva ble videreført, flyttet, avviklet eller gitt ny bruk etter omstillingen?",
      "Hvem bar kostnadene i form av tapte jobber, kapital, kompetanse, tjenester eller lokalmiljø?"
    ],
    conflicts: ["fornyelse vs kontinuitet", "rask restrukturering vs trygg overgang", "avvikling vs reinvestering", "global konkurranse vs lokalt næringsmiljø", "etterbruk vs fortrengning"],
    ideological_dimensions: ["markedstilpasning vs offentlig inngrep", "kreativ destruksjon vs sosial beskyttelse", "eierfleksibilitet vs arbeidstakerrettigheter", "grønn vekst vs rettferdig omstilling"],
    analysis_axes: ["før vs etter", "akutt sjokk vs langsiktig trend", "virksomhet vs region", "eier vs arbeidstaker", "kontinuitet vs brudd", "redning vs avvikling"],
    quiz_angles: ["build_change_chronology", "identify_trigger_decision_and_consequence", "compare_what_survived_and_disappeared", "trace_costs_across_actors"],
    blindspots: ["Omstillingshistorier framhever ofte vinnerne og sluttresultatet, men skjuler overgangstiden og dem som falt ut.", "Nedleggelse kan skyldes flere samtidige forhold; én ny teknologi eller én krise er sjelden hele forklaringen.", "Ny eiendomsverdi kan erstatte produksjon uten å erstatte arbeidsplasser eller kompetanse.", "Offentlig støtte, infrastruktur og regulering kan være avgjørende selv når omstillingen beskrives som et rent markedsutfall."],
    question_surface_mode: "chronology-shock-response-first",
    generator_use_note: "Krev en dokumentert tidslinje med utløsende forhold, beslutning og konsekvens. Skill mellom akutt krise, langsiktig strukturendring og planlagt virksomhetsutvikling.",
    overlap_resolution_note: "Bruk emnet når hovedsaken er virksomhetens eller stedets overgang gjennom et brudd. Bruk automatisering for oppgaveendring, innovasjon for utvikling av nye løsninger og eiendomskapital for omforming drevet av tomte- og investeringslogikk.",
    anti_patterns: ["Ikke kall enhver oppussing, flytting eller navneendring en omstilling.", "Ikke utled årsaken til en nedleggelse bare fra at driften opphørte.", "Ikke framstill etterbruk av bygningen som bevis på at den økonomiske omstillingen lyktes for de tidligere ansatte."]
  },
  em_naering_produksjon_produktivitet: {
    definition: "Emnet undersøker hvordan råvarer, arbeid, kapital, energi, informasjon og tid organiseres i en produksjons- eller tjenesteprosess, og hvordan produktivitet måles som resultat i forhold til en bestemt innsatsfaktor.",
    why_it_matters: "Produktivitet forklarer ikke bare hvor mye som produseres. Spilleren må kunne skille økt output fra høyere arbeidsintensitet, bedre teknologi, større skala, færre feil og endret kvalitet.",
    keywords: ["produksjonsprosess", "innsatsfaktor", "output", "arbeidsproduktivitet", "kapitalproduktivitet", "gjennomstrømning", "kapasitet", "flaskehals", "kvalitet", "utbytte"],
    key_concepts: ["produksjonsprosess", "innsatsfaktor", "output", "arbeidsproduktivitet", "kapitalproduktivitet", "gjennomstrømning", "kapasitet", "flaskehals"],
    core_concepts: ["produksjonsprosess", "innsatsfaktor", "output", "arbeidsproduktivitet", "gjennomstrømning", "flaskehals"],
    sub_concepts: ["kapitalproduktivitet", "kapasitet", "utbytte", "svinn", "nedetid", "lagerbinding", "kvalitet", "enhetskostnad"],
    key_questions: [
      "Hvilke innsatsfaktorer og produksjonstrinn leder fram til den dokumenterte varen eller tjenesten?",
      "Hvor i prosessen oppstår venting, feil, svinn eller en flaskehals?",
      "Hvilket mål brukes for produktivitet, og er resultat og innsats sammenlignbare over tid?",
      "Skyldes endringen teknologi, organisering, skala, arbeidsintensitet, kvalitet eller en kombinasjon?"
    ],
    conflicts: ["produksjonsmengde vs kvalitet", "produktivitet vs arbeidsintensitet", "stordrift vs fleksibilitet", "gjennomstrømning vs sikkerhet", "lagerberedskap vs kapitalbinding"],
    ideological_dimensions: ["produktivitetsvekst vs fordeling av gevinsten", "arbeidsbesparende investering vs sysselsetting", "lean produksjon vs robust forsyning", "standardisert output vs variert kvalitet"],
    analysis_axes: ["innsats vs output", "arbeid vs kapital", "mengde vs kvalitet", "flyt vs flaskehals", "skala vs fleksibilitet", "produktivitet vs lønnsomhet"],
    quiz_angles: ["reconstruct_production_steps", "identify_input_output_and_bottleneck", "distinguish_productivity_from_profit", "explain_documented_output_change"],
    blindspots: ["Produkter eller tjenester med ulik kvalitet kan ikke sammenlignes som om outputen var identisk.", "Økt arbeidsintensitet kan gi høyere produksjon uten at prosessen er teknisk bedre.", "Vedlikehold, nedetid og opplæring er nødvendige deler av produksjonen selv om de reduserer kortsiktig output.", "Produktivitet sier ikke alene om virksomheten er lønnsom eller om gevinsten fordeles bredt."],
    question_surface_mode: "process-input-output-first",
    generator_use_note: "Start med den konkrete prosessen: innsats, trinn, output og flaskehals. Bruk produktivitetsbegrepet bare når kilden gir et sammenlignbart mål eller en tydelig dokumentert prosessendring.",
    overlap_resolution_note: "Bruk emnet når selve produksjonsflyten og output per innsats er hovedsaken. Bruk effektivitet og optimalisering for valg av mål og avveiinger, og industri og mekanisering for den historiske maskin- og fabrikkovergangen.",
    anti_patterns: ["Ikke bruk produktivitet, effektivitet og lønnsomhet som synonymer.", "Ikke påstå produktivitetsvekst bare fordi produksjonsvolumet økte.", "Ikke skjul kvalitetsfall, lengre arbeidstid eller høyere arbeidsintensitet bak et samlet outputtall."]
  },
  em_naering_profesjoner_kompetanse: {
    definition: "Emnet undersøker hvordan spesialisert kunnskap, fagbrev, autorisasjon, utdanning, praksis og yrkesmessig skjønn fordeler oppgaver, ansvar, status og adgang til arbeid i konkrete virksomheter.",
    why_it_matters: "Kompetanse er både en produktiv ressurs og en kilde til makt. Den kan sikre kvalitet og sikkerhet, men også stenge andre ute, og den forandres når teknologi, organisering og markeder endres.",
    keywords: ["profesjon", "kompetanse", "fagkunnskap", "taus kunnskap", "sertifisering", "fagbrev", "lærling", "yrkesjurisdiksjon", "etterutdanning"],
    key_concepts: ["profesjon", "kompetanse", "taus kunnskap", "sertifisering", "lærlingordning", "profesjonelt skjønn", "yrkesjurisdiksjon", "kompetanseomstilling"],
    core_concepts: ["profesjon", "kompetanse", "taus kunnskap", "sertifisering", "lærlingordning", "profesjonelt skjønn"],
    sub_concepts: ["yrkesjurisdiksjon", "fagbrev", "autorisasjon", "spesialisering", "etterutdanning", "credentialisme", "oppkvalifisering", "avkvalifisering"],
    key_questions: [
      "Hvilken kunnskap og hvilket skjønn krever den konkrete arbeidsoppgaven?",
      "Hvordan læres, prøves og dokumenteres kompetansen gjennom praksis, utdanning, fagbrev eller autorisasjon?",
      "Hvem har rett til å utføre eller godkjenne arbeidet, og hvem holdes utenfor?",
      "Hvordan endret teknologi, standarder eller organisering forholdet mellom erfaring, sertifikat og faglig autonomi?"
    ],
    conflicts: ["faglig skjønn vs standardiserte prosedyrer", "formell utdanning vs erfaringskunnskap", "kvalitetssikring vs sosial lukking", "spesialisering vs fleksibilitet", "profesjonell autonomi vs ledelseskontroll"],
    ideological_dimensions: ["profesjonell selvregulering vs ekstern kontroll", "utdanning som meritokrati vs credentialisme", "fagarbeid vs akademisering", "spesialistkompetanse vs generalistfleksibilitet"],
    analysis_axes: ["formell vs taus kunnskap", "sertifisert vs erfaringsbasert kompetanse", "autonomi vs kontroll", "spesialist vs generalist", "læring vs rutinisering", "kompetanse vs yrkesstatus"],
    quiz_angles: ["identify_skill_credential_and_task", "trace_training_or_apprenticeship", "compare_judgment_and_procedure", "explain_skill_change_over_time"],
    blindspots: ["Støttepersonell og samarbeid kan være avgjørende selv når én profesjon får æren.", "Kompetanse sitter også i rutiner, verktøy og arbeidsfellesskap, ikke bare i enkeltpersoner.", "Formelle krav kan sikre kvalitet, men kan også gjøre inngangen til yrket dyr eller sosialt skjev.", "Ny teknologi kan både redusere enkelte ferdigheter og skape behov for nye kombinasjoner av kunnskap."],
    question_surface_mode: "occupation-skill-practice-first",
    generator_use_note: "Krev en dokumentert yrkesrolle, arbeidsoppgave og lærings- eller godkjenningsform. Spør hva personen måtte kunne og gjøre før profesjonsbegreper introduseres.",
    overlap_resolution_note: "Bruk emnet når kunnskap, sertifisering og faglig skjønn er hovedsaken. Bruk arbeidsliv og organisering for autoritet og kontrakter, og automatisering når oppgaver flyttes mellom ansatte og tekniske systemer.",
    anti_patterns: ["Ikke behandle enhver stillingstittel som en profesjon.", "Ikke anta kompetanse ut fra bygning, status eller tittel uten kilder om arbeidsoppgaver og kvalifikasjoner.", "Ikke reduser kompetanse til utdanningslengde når praksis, lærlingtid og taus kunnskap er dokumentert."]
  },
  em_naering_usynlig_arbeid: {
    definition: "Emnet undersøker nødvendig arbeid som skjules for kunder, statistikk, regnskap eller offentlig fortelling, blant annet renhold, omsorg, vedlikehold, koordinering, logistikk, emosjonelt arbeid, digital moderering og ubetalt husholdsarbeid.",
    why_it_matters: "Synlige produkter og tjenester er ofte avhengige av arbeid som er lavt lønnet, ubetalt, outsourcet eller utført utenfor åpningstid. Når dette arbeidet forsvinner, stopper også den synlige virksomheten.",
    keywords: ["usynlig arbeid", "ubetalt arbeid", "omsorgsarbeid", "vedlikehold", "emosjonelt arbeid", "skyggearbeid", "underleverandør", "digitalt arbeid", "sosial reproduksjon"],
    key_concepts: ["usynlig arbeid", "ubetalt arbeid", "omsorgsarbeid", "vedlikehold", "emosjonelt arbeid", "skyggearbeid", "sosial reproduksjon", "outsourcing"],
    core_concepts: ["usynlig arbeid", "ubetalt arbeid", "omsorgsarbeid", "vedlikehold", "emosjonelt arbeid", "sosial reproduksjon"],
    sub_concepts: ["renhold", "koordinering", "skyggearbeid", "outsourcing", "digital moderering", "datamerking", "husholdsarbeid", "kundeinnsats"],
    key_questions: [
      "Hvilke oppgaver må utføres før, under og etter den synlige varen eller tjenesten?",
      "Hvem utfører arbeidet, under hvilket navn eller kontraktsforhold, og hvordan blir det betalt eller ikke betalt?",
      "Hva ville stoppet eller forfalt dersom dette arbeidet ikke ble gjort?",
      "Hvilke organisatoriske, kjønnede, tekniske eller regnskapsmessige grep gjør arbeidet mindre synlig?"
    ],
    conflicts: ["synlig resultat vs skjult støttearbeid", "betalt vs ubetalt arbeid", "kundebekvemmelighet vs arbeidstakerbelastning", "outsourcing vs ansvar", "innovasjon vs vedlikehold"],
    ideological_dimensions: ["markedsverdi vs sosial verdi", "produktivt arbeid vs reproduktivt arbeid", "privat hushold vs offentlig infrastruktur", "plattformbekvemmelighet vs arbeidsrettigheter"],
    analysis_axes: ["synlig vs skjult", "betalt vs ubetalt", "kjernevirksomhet vs outsourcet arbeid", "produksjon vs vedlikehold", "formell vs uformell økonomi", "kunde- vs arbeidstakerperspektiv"],
    quiz_angles: ["identify_hidden_prerequisite_task", "trace_who_performs_and_pays", "test_what_stops_without_maintenance", "connect_convenience_to_shifted_labor"],
    blindspots: ["Automatiserte og digitale tjenester kan flytte arbeid til kunder, moderatorer, datamerkere og støttepersonell i stedet for å fjerne det.", "Outsourcing gjør ikke arbeidet mindre nødvendig, men kan gjøre ansvar og arbeidsvilkår mindre synlige.", "Kjønn, klasse og migrasjonsstatus påvirker hvem som utfører mye av det skjulte arbeidet.", "Timer alene fanger ikke alltid emosjonell belastning, tilgjengelighet og koordinering."],
    question_surface_mode: "hidden-dependency-first",
    generator_use_note: "Identifiser en konkret skjult oppgave og dokumenter hvem som utfører den og hva den synlige virksomheten er avhengig av. Begrepet usynlig arbeid skal forklare en faktisk avhengighet, ikke bare lav status.",
    overlap_resolution_note: "Bruk emnet når hovedsaken er at nødvendig arbeid er skjult, ubetalt eller organisatorisk flyttet ut. Bruk makt og ulikhet når forskjeller i lønn og posisjon er hovedsaken, og bærekraft når miljøkostnader står i sentrum.",
    anti_patterns: ["Ikke kall alt lavtlønnet arbeid usynlig; dokumenter hvordan arbeidet skjules eller tas for gitt.", "Ikke påstå at arbeid er ubetalt eller outsourcet uten kildegrunnlag.", "Ikke gjør emnet til en moralsk merkelapp uten å vise den konkrete avhengighetskjeden."]
  }
};

const forbiddenGeneric = [
  "Hvilken konkret virksomhet, arbeidsplass, kapitalstrøm, marked, teknologi eller infrastruktur gjør emnet relevant?",
  "Hvordan skapes, organiseres, måles, fordeles eller skjules økonomisk verdi her?",
  "Hvilke eiere, arbeidere, kunder, reguleringer, risikoforhold, miljøkostnader eller maktstrukturer blir synlige?",
  "Hold emnet avgrenset ved å starte i konkret virksomhet, arbeid, kapitalstrøm, marked, teknologi, logistikk, byrom eller kilde."
];

for (const [emneId, patch] of Object.entries(patches)) {
  const item = emner.find(entry => entry.emne_id === emneId);
  if (!item) throw new Error(`Mangler ${emneId}`);
  Object.assign(item, patch, {
    curation_status: "individually_curated",
    curation_batch: "naeringsliv_arbeid_produksjon_v1",
    curation_date: "2026-07-25"
  });
}

for (const field of ["definition", "why_it_matters", "key_questions", "conflicts", "ideological_dimensions", "analysis_axes", "blindspots", "generator_use_note", "overlap_resolution_note", "anti_patterns"]) {
  const values = Object.keys(patches).map(id => JSON.stringify(emner.find(item => item.emne_id === id)[field]));
  if (new Set(values).size !== values.length) throw new Error(`Feltet ${field} er ikke individuelt for alle ni emner`);
}

for (const id of Object.keys(patches)) {
  const text = JSON.stringify(emner.find(item => item.emne_id === id));
  for (const phrase of forbiddenGeneric) {
    if (text.includes(phrase)) throw new Error(`${id} beholder generisk standardtekst: ${phrase}`);
  }
}

fs.writeFileSync(file, `${JSON.stringify(emner, null, 2)}\n`);
console.log(`Kuraterte ${Object.keys(patches).length} emner individuelt.`);
