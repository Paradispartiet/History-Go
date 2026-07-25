#!/usr/bin/env node
import fs from "node:fs";

const file = "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const emner = JSON.parse(fs.readFileSync(file, "utf8"));

const patches = {
  em_naering_bank_bors_forsikring: {
    definition: "Emnet undersøker hvordan banker formidler innskudd og kreditt, børser organiserer handel i verdipapirer, og forsikringsselskaper samler og fordeler økonomisk risiko mellom mange aktører.",
    why_it_matters: "Bank, børs og forsikring gjør investering, betaling og risikodeling mulig, men institusjonene bygger på tillit, informasjon, sikkerhet og regler som avgjør hvem som får tilgang og hvem som bærer tap.",
    keywords: ["innskudd", "kreditt", "rente", "sikkerhet", "aksje", "obligasjon", "likviditet", "forsikringspremie", "erstatning", "soliditet"],
    key_concepts: ["innskudd", "kreditt", "rente", "sikkerhet", "verdipapir", "likviditet", "risikopool", "forsikringspremie"],
    core_concepts: ["kreditt", "rente", "sikkerhet", "verdipapir", "likviditet", "forsikring"],
    sub_concepts: ["innskudd", "aksje", "obligasjon", "emisjon", "premie", "erstatning", "soliditet", "betalingsformidling"],
    key_questions: [
      "Hvilken konkret transaksjon eller risiko håndterer institusjonen, og hvem er partene?",
      "Hvor kommer pengene fra, hvilke vilkår gjelder, og hvilken sikkerhet eller pris kreves?",
      "Hvem bærer tapet dersom lånet misligholdes, verdipapiret faller eller skaden oppstår?",
      "Hvilke regler, reserver og informasjonskrav skal sikre tillit og stabilitet?"
    ],
    conflicts: ["kredittilgang vs tapsrisiko", "likviditet vs soliditet", "privat avkastning vs finansiell stabilitet", "risikodeling vs utestenging", "markedsinformasjon vs finansiell kompleksitet"],
    ideological_dimensions: ["finansiell innovasjon vs samfunnskontroll", "markedsprising vs offentlig stabilisering", "individuelt ansvar vs kollektiv risikodeling", "fri kapitalflyt vs kapitalkrav og tilsyn"],
    analysis_axes: ["innskyter vs låntaker", "kreditor vs debitor", "egenkapital vs gjeld", "likviditet vs soliditet", "risikopremie vs faktisk tap", "privat institusjon vs systemansvar"],
    quiz_angles: ["identify_financial_transaction_parties", "trace_funds_terms_and_collateral", "locate_risk_bearer", "connect_institution_to_regulation_and_trust"],
    blindspots: ["Bankinnskudd, verdipapirer og forsikringer er ulike kontrakter og skal ikke behandles som samme finansprodukt.", "Risiko forsvinner ikke når den forsikres eller selges; den flyttes og fordeles.", "Tilgang til kreditt avhenger av inntekt, sikkerhet og institusjonelle vurderinger, ikke bare av etterspørsel.", "En institusjon kan være solvent, men likevel få likviditetsproblemer dersom mange krever betaling samtidig."],
    question_surface_mode: "institution-transaction-risk-first",
    generator_use_note: "Start med en dokumentert transaksjon: innskudd, lån, emisjon, handel eller forsikring. Spør hvem som betaler, mottar, priser og bærer risiko før institusjons- eller markedsteori introduseres.",
    overlap_resolution_note: "Bruk emnet når den konkrete finansinstitusjonen og kontrakten er hovedsaken. Bruk kapital og finans for virksomhetens samlede finansiering, og risiko og regulering når fare, tilsyn og forebygging står i sentrum.",
    anti_patterns: ["Ikke omtale bank, børs og forsikring som om de utfører samme funksjon.", "Ikke kalle all pengeflyt investering; skill mellom betaling, lån, egenkapital og forsikring.", "Ikke påstå at risiko er fjernet når den bare er overført til en annen aktør."]
  },
  em_naering_eiendom_kapital_byutvikling: {
    definition: "Emnet undersøker hvordan tomter og bygninger både er brukssteder og finansielle eiendeler, og hvordan kjøp, lån, leie, regulering, utbygging og forventet verdi former byens næringsstruktur.",
    why_it_matters: "Eiendomsverdi skapes ikke bare av bygningen. Infrastruktur, reguleringsvedtak, nabolag, leietakere og framtidsforventninger påvirker avkastningen og hvem som kan bruke stedet.",
    keywords: ["tomteverdi", "grunnrente", "leieinntekt", "avkastningskrav", "belåning", "regulering", "utviklingsgevinst", "ledighet", "transformasjon", "bruksendring"],
    key_concepts: ["bruksverdi", "bytteverdi", "tomteverdi", "grunnrente", "leieinntekt", "avkastningskrav", "utviklingsgevinst", "regulering"],
    core_concepts: ["tomteverdi", "grunnrente", "leieinntekt", "avkastningskrav", "regulering", "utviklingsgevinst"],
    sub_concepts: ["belåning", "ledighet", "opsjonsverdi", "bruksendring", "transformasjon", "seksjonering", "infrastrukturgevinst", "fortrengning"],
    key_questions: [
      "Hvem eier tomten og bygningen, og hvordan er kjøpet eller prosjektet finansiert?",
      "Hvilken nåværende og forventet bruk ligger bak prisen, leien eller investeringsbeslutningen?",
      "Hvilke offentlige vedtak eller investeringer øker eller reduserer eiendommens verdi?",
      "Hvem får utviklingsgevinsten, og hvem mister tilgang, arbeid eller lokaler når området endres?"
    ],
    conflicts: ["bruksverdi vs bytteverdi", "bevaring vs utviklingsgevinst", "langsiktig drift vs spekulativ tomteholding", "offentlig investering vs privat verdiøkning", "nye arbeidsplasser vs fortrengning"],
    ideological_dimensions: ["eiendomsrett vs planmyndighet", "markedsleie vs sosial og næringsmessig tilgjengelighet", "privat utvikling vs offentlig verdifangst", "fortetting vs vern og lokal kontinuitet"],
    analysis_axes: ["tomt vs bygning", "nåværende bruk vs forventet bruk", "leieinntekt vs salgsverdi", "privat investering vs offentlig infrastruktur", "bevaring vs transformasjon", "eiergevinst vs brukerbelastning"],
    quiz_angles: ["identify_parcel_owner_financing_and_use", "trace_public_decision_to_value_change", "compare_use_value_and_exchange_value", "map_development_gain_and_displacement"],
    blindspots: ["Prisøkning kan skyldes regulering og offentlig infrastruktur, ikke bare privat forbedring.", "En tom bygning kan ha høy finansverdi dersom eieren forventer framtidig bruksendring.", "Eiendomsutvikling kan bevare fasader samtidig som arbeidsmiljø og virksomhetsstruktur forsvinner.", "Byggeprosjektets lønnsomhet sier ikke alene om området blir mer tilgjengelig eller funksjonelt for byen."],
    question_surface_mode: "parcel-owner-financing-use-first",
    generator_use_note: "Start med en bestemt tomt, bygning, eier, finansiering og dokumentert bruksendring. Spør hvilke beslutninger som endret inntektsstrøm og verdi før byutviklingsteori løftes inn.",
    overlap_resolution_note: "Bruk emnet når eiendommen som kapitalobjekt og utviklingsprosjekt står i sentrum. Bruk finansdistrikt og kontorby for romlig konsentrasjon av virksomheter, og omstilling for den tidligere virksomhetens overgang eller nedleggelse.",
    anti_patterns: ["Ikke framstill all verdiøkning som resultat av eierens investering.", "Ikke anta at ny bruk automatisk erstatter tidligere arbeidsplasser eller funksjoner.", "Ikke bruk arkitektur eller områdeprofil som eneste bevis på en eiendomsøkonomisk prosess."]
  },
  em_naering_eierskap_styring: {
    definition: "Emnet undersøker hvem som har rett til avkastning, stemmer, styrevalg og strategiske beslutninger i en virksomhet, og hvordan eierskap utøves gjennom aksjer, stiftelser, familie, stat, samvirke og kontrollkjeder.",
    why_it_matters: "Den formelle eieren og den reelle kontrolløren er ikke alltid den samme. Eierform, stemmerett, styre og finansiering påvirker virksomhetens tidshorisont, ansvar og forhold til ansatte og samfunn.",
    keywords: ["eierform", "stemmerett", "kontroll", "styre", "generalforsamling", "minoritetsvern", "reell rettighetshaver", "agentproblem", "samvirke", "statlig eierskap"],
    key_concepts: ["eierskap", "kontrollrett", "kontantstrømrett", "styre", "generalforsamling", "agentproblem", "minoritetsvern", "reell rettighetshaver"],
    core_concepts: ["eierskap", "kontrollrett", "styre", "generalforsamling", "agentproblem", "minoritetsvern"],
    sub_concepts: ["stemmerett", "aksjeklasse", "eierkjede", "familieeierskap", "statlig eierskap", "stiftelse", "samvirke", "oppkjøpsvern"],
    key_questions: [
      "Hvem er de formelle og reelle eierne, og hvilke stemme- og avkastningsrettigheter har de?",
      "Hvem utpeker styret og ledelsen, og hvilke beslutninger krever eiernes godkjenning?",
      "Hvordan påvirker lån, aksjeklasser, avtaler eller eierkjeder den faktiske kontrollen?",
      "Hvilke mekanismer beskytter minoritetseiere, ansatte, kreditorer og samfunnsinteresser?"
    ],
    conflicts: ["eierskap vs ledelse", "majoritet vs minoritet", "kortsiktig avkastning vs langsiktig formål", "eierkontroll vs styreuavhengighet", "åpenhet vs komplekse kontrollkjeder"],
    ideological_dimensions: ["aksjonærdemokrati vs konsentrert kontroll", "privat eierskap vs statlig eller kollektivt eierskap", "aksjonærverdi vs interessentstyring", "eierrettigheter vs virksomhetens samfunnsansvar"],
    analysis_axes: ["formell eier vs reell kontroll", "eier vs styre", "styre vs ledelse", "majoritet vs minoritet", "avkastningsrett vs kontrollrett", "kort vs lang tidshorisont"],
    quiz_angles: ["identify_owner_control_and_voting_rights", "trace_board_appointment_and_decision_power", "distinguish_formal_and_beneficial_owner", "connect_ownership_form_to_strategy_and_accountability"],
    blindspots: ["Den største kapitalandelen gir ikke alltid størst stemmemakt dersom aksjeklassene er ulike.", "Kreditorer og avtaler kan begrense ledelsen selv om de ikke er eiere.", "Et spredt eierskap kan gi ledelsen større faktisk handlingsrom.", "Navnet på morselskapet viser ikke nødvendigvis den endelige reelle rettighetshaveren."],
    question_surface_mode: "owner-control-decision-first",
    generator_use_note: "Start med dokumenterte eiere, aksjer, stemmer, styrevalg eller oppkjøp. Spør hvem som faktisk kunne beslutte hva før styrings- og maktbegreper introduseres.",
    overlap_resolution_note: "Bruk emnet for kontrollrettigheter mellom eiere, styre og ledelse. Bruk organisasjoner og ledelse for intern koordinering, og kapital og finans for kildene og vilkårene for finansieringen.",
    anti_patterns: ["Ikke bruke eier og leder som synonymer.", "Ikke anta at selskapets navn avslører den reelle kontrolløren.", "Ikke kalle enhver investor en aktiv eier uten dokumentasjon på stemmer, styreplass eller påvirkning."]
  },
  em_naering_finansdistrikt_kontorby: {
    definition: "Emnet undersøker hvorfor banker, hovedkontorer, advokater, revisorer, konsulenter og andre produsenttjenester samler seg i bestemte bydeler, og hvordan kontorbygg, transport, data og eiendomsmarked holder klyngen sammen.",
    why_it_matters: "Et finansdistrikt er både arbeidssted, eiendomsmarked og infrastruktursystem. Konsentrasjonen kan gjøre informasjonsutveksling og spesialisering lettere, men også presse leier, pendling og byfunksjoner.",
    keywords: ["finansdistrikt", "kontorby", "næringsklynge", "produsenttjenester", "hovedkontor", "kontormarked", "agglomerasjon", "pendling", "nettverkseffekt", "fjernarbeid"],
    key_concepts: ["agglomerasjon", "finansdistrikt", "hovedkontorøkonomi", "produsenttjenester", "kontormarked", "næringsklynge", "nettverkseffekt", "pendlingssystem"],
    core_concepts: ["agglomerasjon", "finansdistrikt", "produsenttjenester", "kontormarked", "næringsklynge", "hovedkontor"],
    sub_concepts: ["sentral forretningsby", "kontorleie", "pendling", "telekommunikasjon", "dataforbindelse", "støttetjenester", "fjernarbeid", "monofunksjon"],
    key_questions: [
      "Hvilke virksomheter og spesialiserte tjenester er samlet i området, og når oppstod konsentrasjonen?",
      "Hvilke transport-, kommunikasjons- og datainfrastrukturer gjør klyngen mulig?",
      "Hvordan påvirker konsentrasjonen kontorleier, pendling, støttetjenester og annen bruk av byområdet?",
      "Hva skjer med området når virksomheter flytter, digitaliserer eller reduserer kontorbehovet?"
    ],
    conflicts: ["konsentrasjonsfordeler vs regional ulikhet", "prestisjekontor vs blandet by", "tilgjengelighet vs høye leier", "hovedkontorvekst vs lokalt næringsmangfold", "kontortetthet vs liv utenfor arbeidstid"],
    ideological_dimensions: ["global konkurransekraft vs lokal tilgjengelighet", "sentralisering vs geografisk spredning", "kontorbasert kontroll vs fleksibelt arbeid", "eiendomsavkastning vs bymessig flerbruk"],
    analysis_axes: ["klynge vs spredning", "hovedkontor vs støttearbeid", "dagbefolkning vs fastboende", "kontorleie vs annen bruk", "fysisk nærhet vs digital samhandling", "lokal bydel vs globale nettverk"],
    quiz_angles: ["identify_clustered_institutions_and_services", "connect_office_concentration_to_infrastructure", "trace_rent_commuting_and_support_work", "compare_office_city_before_and_after_relocation"],
    blindspots: ["Prestisjefylte hovedkontorer er avhengige av renhold, drift, servering, transport og andre mindre synlige tjenester.", "Nærhet kan være viktig selv i digitalt arbeid, men effekten må dokumenteres og ikke antas.", "Mange kontorbygg betyr ikke automatisk at området er et finansdistrikt.", "Høy dagaktivitet kan skjule svak blanding av boliger, handel og kultur utenfor arbeidstid."],
    question_surface_mode: "cluster-institution-infrastructure-first",
    generator_use_note: "Start med navngitte institusjoner, kontorarbeidsplasser og infrastruktur i et avgrenset område. Dokumenter klyngen og dens funksjoner før agglomerasjon eller global-by-teori brukes.",
    overlap_resolution_note: "Bruk emnet for romlig konsentrasjon av finans- og produsenttjenester. Bruk eiendom, kapital og byutvikling når tomteverdier og prosjektfinansiering står i sentrum, og tjenesteyting når selve tjenestearbeidet er hovedsaken.",
    anti_patterns: ["Ikke kalle et område finansdistrikt bare fordi det har nye kontorbygg.", "Ikke redusere kontorbyen til arkitektur uten å dokumentere virksomhetene og arbeidsplassene.", "Ikke anta at fjernarbeid automatisk opphever geografiske klynger."]
  },
  em_naering_kapital_finans: {
    definition: "Emnet undersøker hvordan virksomheter skaffer og binder penger og andre økonomiske ressurser over tid gjennom egenkapital, gjeld, kontantstrøm og reinvestering, og hvilke krav finansieringen stiller til avkastning og kontroll.",
    why_it_matters: "Finansieringsformen påvirker hvilke investeringer som kan gjennomføres, hvor sårbar virksomheten er, hvem som får innflytelse, og når pengene må betales tilbake.",
    keywords: ["egenkapital", "gjeld", "arbeidskapital", "kontantstrøm", "rente", "avkastningskrav", "belåning", "likviditet", "løpetid", "reinvestering"],
    key_concepts: ["kapital", "egenkapital", "gjeld", "arbeidskapital", "kontantstrøm", "avkastningskrav", "belåning", "likviditet"],
    core_concepts: ["egenkapital", "gjeld", "arbeidskapital", "kontantstrøm", "avkastningskrav", "likviditet"],
    sub_concepts: ["rente", "løpetid", "sikkerhet", "emisjon", "reinvestering", "kapitalkostnad", "utbytte", "finansieringsgap"],
    key_questions: [
      "Hva skal finansieres, hvor mye kapital kreves, og hvor lenge bindes pengene?",
      "Kommer finansieringen fra drift, eiere, långivere, offentlige ordninger eller andre kilder?",
      "Hvilke krav til rente, avkastning, sikkerhet, kontroll eller tilbakebetaling følger med?",
      "Hvordan påvirker finansieringen likviditet, investeringsrom og sårbarhet ved inntektsfall?"
    ],
    conflicts: ["gjeld vs egenkapital", "likviditet vs langsiktig investering", "utbytte vs reinvestering", "høy belåning vs finansiell robusthet", "ekstern kapital vs eierkontroll"],
    ideological_dimensions: ["finansiell disiplin vs strategisk langsiktighet", "aksjonæravkastning vs reinvestering", "privat kapital vs offentlig finansiering", "vekst gjennom belåning vs forsiktig egenfinansiering"],
    analysis_axes: ["kilde vs bruk av kapital", "egenkapital vs gjeld", "kontantstrøm vs regnskapsresultat", "kort vs lang løpetid", "avkastning vs risiko", "finansiering vs kontroll"],
    quiz_angles: ["identify_funding_source_use_and_term", "compare_debt_equity_and_internal_cash", "trace_financing_conditions_to_control", "test_liquidity_and_leverage_consequence"],
    blindspots: ["Lønnsomhet betyr ikke at virksomheten har kontanter tilgjengelig når regningene forfaller.", "Billig gjeld kan øke avkastningen i gode tider og tapene i dårlige tider.", "Kapital er ikke bare penger; maskiner, lager, rettigheter og kompetanse kan binde ressurser over tid.", "Offentlig støtte og garantier kan redusere privat risiko uten å være synlige som direkte eierskap."],
    question_surface_mode: "funding-source-use-term-first",
    generator_use_note: "Start med et dokumentert finansieringsbehov, en kilde og vilkår. Spør hva pengene finansierte og hvordan tilbakebetaling, avkastning eller kontroll ble fordelt.",
    overlap_resolution_note: "Bruk emnet som grunnramme for virksomhetens finansiering. Bruk bank, børs og forsikring når institusjonen eller finansproduktet er hovedsaken, og eierskap og styring når kontrollrettighetene står i sentrum.",
    anti_patterns: ["Ikke bruk kapital, kontanter, inntekt og overskudd som synonymer.", "Ikke framstill egenkapital som gratis finansiering; den har krav til avkastning og kontroll.", "Ikke vurdere finansiering uten å angi tidshorisont, vilkår og tilbakebetalingsrisiko."]
  },
  em_naering_kriser_boomer_omstilling: {
    definition: "Emnet undersøker hvordan kredittvekst, stigende formuespriser, overinvestering og optimisme kan bygge opp en boom, og hvordan sjokk, renteendringer, tap og gjeldsnedbygging kan utløse krise og økonomisk omstilling.",
    why_it_matters: "Boomer og kriser fordeler gevinster og tap ulikt. Finansieringen som driver oppgangen påvirker hvor kraftig nedturen blir, hvilke virksomheter som overlever, og om myndighetene redder, stimulerer eller lar aktører gå konkurs.",
    keywords: ["konjunktur", "boom", "boble", "resesjon", "belåning", "smitte", "kredittørke", "konkurs", "redningspakke", "motkonjunkturpolitikk"],
    key_concepts: ["boom", "resesjon", "boble", "belåning", "kredittsyklus", "smitte", "kredittørke", "konkurs"],
    core_concepts: ["kredittsyklus", "boom", "resesjon", "belåning", "smitte", "konkurs"],
    sub_concepts: ["aktivaboble", "mislighold", "gjeldsnedbygging", "redningspakke", "moral hazard", "stimulus", "innstramming", "automatisk stabilisator"],
    key_questions: [
      "Hva vokste under oppgangen, og hvordan ble veksten finansiert?",
      "Hvilket dokumentert sjokk eller vendepunkt snudde forventninger, priser, kreditt eller etterspørsel?",
      "Hvordan spredte tap og likviditetsproblemer seg mellom virksomheter, banker, husholdninger og myndigheter?",
      "Hvem fikk gevinstene i oppgangen, hvem bar tapene, og hvilke tiltak endret fordelingen?"
    ],
    conflicts: ["redning vs moral hazard", "stimulus vs innstramming", "kreditor vs debitor", "rask avvikling vs sysselsetting og stabilitet", "prisoppgang vs realøkonomisk bærekraft"],
    ideological_dimensions: ["selvkorrigerende markeder vs aktiv stabiliseringspolitikk", "privat ansvar vs kollektiv redning", "kreditorvern vs gjeldslette", "finansiell stabilitet vs budsjettbalanse"],
    analysis_axes: ["oppgang vs nedgang", "kredittvekst vs inntektsvekst", "aktivapris vs kontantstrøm", "likviditet vs soliditet", "privat tap vs offentlig kostnad", "akutt krise vs langsiktig strukturendring"],
    quiz_angles: ["reconstruct_credit_and_asset_cycle", "identify_trigger_transmission_and_policy_response", "trace_winners_and_loss_bearers", "distinguish_liquidity_crisis_from_solvency_failure"],
    blindspots: ["Prisvekst alene beviser ikke at en boble forelå; finansiering, forventninger og fundamentale forhold må undersøkes.", "En krise har ofte flere utløsere og forsterkende mekanismer.", "Redningspakker kan stabilisere systemet samtidig som de flytter tap til fellesskapet.", "Makrotall kan skjule at bransjer, steder og grupper rammes svært ulikt."],
    question_surface_mode: "cycle-credit-trigger-distribution-first",
    generator_use_note: "Krev en dokumentert oppgang, finansieringsmekanisme, vending og konsekvens. Bygg en tidslinje før krise-, boble- eller konjunkturbegreper brukes.",
    overlap_resolution_note: "Bruk emnet for kreditt-, pris- og konjunktursyklusen. Bruk omstilling, kriser og skift i arbeidsdomenet når én virksomhets organisatoriske overgang er hovedsaken, og risiko og regulering for forebyggende regler og tilsyn.",
    anti_patterns: ["Ikke kalle enhver prisoppgang en boble eller enhver nedgang en finanskrise.", "Ikke tilskrive krisen én hendelse uten å dokumentere oppbygging og smittemekanismer.", "Ikke beskrive redning eller innstramming uten å vise hvem som mottok støtte og hvem som bar kostnaden."]
  },
  em_naering_organisasjoner_ledelse: {
    definition: "Emnet undersøker hvordan virksomheter setter mål, fordeler beslutningsmyndighet, bygger strukturer, bruker budsjetter og informasjon, og koordinerer styre, toppledelse, mellomledere og operative enheter.",
    why_it_matters: "Ledelse handler ikke bare om enkeltpersoner. Strategi, rapportering, insentiver, kultur og informasjonsflyt former hvilke problemer organisasjonen ser, hvem som kan handle, og hvordan konflikter håndteres.",
    keywords: ["organisasjonsstruktur", "ledelse", "strategi", "delegering", "koordinering", "budsjett", "insentiv", "organisasjonskultur", "rapportering", "ansvar"],
    key_concepts: ["organisasjon", "ledelse", "strategi", "delegering", "koordinering", "budsjettstyring", "insentiv", "organisasjonskultur"],
    core_concepts: ["organisasjon", "ledelse", "strategi", "delegering", "koordinering", "ansvar"],
    sub_concepts: ["linjeorganisasjon", "matrisestruktur", "mellomledelse", "budsjett", "resultatansvar", "insentiv", "kultur", "internkontroll"],
    key_questions: [
      "Hvilke mål og prioriteringer er dokumentert, og hvem har myndighet til å endre dem?",
      "Hvordan fordeles beslutninger, ressurser og ansvar mellom styre, ledelse og operative enheter?",
      "Hvilken informasjon rapporteres oppover, og hvordan kontrolleres resultatene?",
      "Hvordan reagerer organisasjonen når fagkunnskap, insentiver og strategiske mål peker i ulike retninger?"
    ],
    conflicts: ["sentralisering vs desentralisering", "kontroll vs tillit", "strategi vs operativ kunnskap", "målt resultat vs langsiktig læring", "individuelle insentiver vs kollektivt samarbeid"],
    ideological_dimensions: ["lederstyring vs medarbeiderdeltakelse", "hierarki vs selvorganisering", "eiermål vs faglig formål", "økonomiske insentiver vs profesjonell motivasjon"],
    analysis_axes: ["styre vs ledelse", "toppledelse vs mellomledelse", "sentral vs lokal beslutning", "formell strategi vs faktisk praksis", "rapportert informasjon vs taus kunnskap", "kontroll vs læring"],
    quiz_angles: ["identify_decision_right_and_reporting_line", "trace_strategy_to_budget_and_action", "compare_formal_structure_and_actual_coordination", "explain_incentive_or_information_failure"],
    blindspots: ["Lederens uttalte strategi beskriver ikke nødvendigvis hvordan arbeidet faktisk organiseres.", "Mellomledere og støttefunksjoner kan ha stor innflytelse uten å være synlige i toppledelsens fortelling.", "Resultatmål kan endre atferd og gjøre uregistrerte oppgaver mindre attraktive.", "Organisasjonskultur skal dokumenteres gjennom praksis og kilder, ikke brukes som en løs forklaring."],
    question_surface_mode: "decision-structure-information-first",
    generator_use_note: "Start med en dokumentert beslutning, struktur, rapporteringslinje, budsjett eller organisasjonsendring. Spør hvem som visste, besluttet og gjennomførte hva før ledelsesteori brukes.",
    overlap_resolution_note: "Bruk emnet for intern beslutningsstruktur og koordinering. Bruk arbeidsliv og organisering for arbeidstid, kontrakter og oppgavefordeling, og eierskap og styring for eiernes og styrets kontrollrettigheter.",
    anti_patterns: ["Ikke gjøre virksomhetens direktør til forklaring på alle resultater.", "Ikke bruke organisasjonskultur som årsak uten konkrete praksiser eller kilder.", "Ikke blande intern ledelse med eierkontroll eller arbeidsrettslig organisering."]
  },
  em_naering_risiko_regulering: {
    definition: "Emnet undersøker hvilke hendelser som kan gi tap, hvem som er eksponert, hvordan sannsynlighet og konsekvens vurderes, og hvilke regler, tilsyn og beredskapstiltak som skal forebygge private, systemiske og samfunnsmessige skader.",
    why_it_matters: "Virksomheter kan ta risiko som rammer ansatte, kunder, kreditorer, miljø og hele markeder. Regulering avgjør hvilke farer som må dokumenteres, hvilke buffere som kreves, og hvem som har ansvar når noe svikter.",
    keywords: ["risiko", "usikkerhet", "eksponering", "sannsynlighet", "konsekvens", "etterlevelse", "tilsyn", "kapitalkrav", "føre-var", "moral hazard"],
    key_concepts: ["risiko", "usikkerhet", "eksponering", "sannsynlighet", "konsekvens", "etterlevelse", "tilsyn", "føre-var-prinsipp"],
    core_concepts: ["risiko", "eksponering", "sannsynlighet", "konsekvens", "regulering", "tilsyn"],
    sub_concepts: ["kapitalkrav", "internkontroll", "beredskap", "moral hazard", "systemrisiko", "compliance", "stresstest", "sanksjon"],
    key_questions: [
      "Hva kan gå galt, og hvilke personer, verdier eller systemer er eksponert?",
      "Hvilke data, hendelser eller modeller brukes til å anslå sannsynlighet og konsekvens?",
      "Hvem bærer tapet dersom risikoen materialiserer seg, og kan kostnaden flyttes til andre?",
      "Hvilken regel, kontroll, buffer eller beredskap reduserer risikoen, og hvem fører tilsyn med etterlevelsen?"
    ],
    conflicts: ["innovasjon vs føre-var", "etterlevelseskostnad vs beskyttelse", "privat risiko vs systemrisiko", "selvregulering vs offentlig tilsyn", "konfidensialitet vs åpenhet"],
    ideological_dimensions: ["markedsdisiplin vs forhåndsregulering", "individuelt ansvar vs systemansvar", "kostnadseffektivitet vs sikkerhetsmargin", "nasjonal kontroll vs grensekryssende virksomhet"],
    analysis_axes: ["fare vs eksponering", "sannsynlighet vs konsekvens", "privat tap vs samfunnstap", "forebygging vs beredskap", "regel vs faktisk etterlevelse", "virksomhet vs tilsynsmyndighet"],
    quiz_angles: ["identify_hazard_exposure_and_loss_bearer", "trace_rule_supervisor_and_enforcement", "compare_private_and_systemic_risk", "evaluate_prevention_buffer_and_contingency"],
    blindspots: ["Lav sannsynlighet kan kombineres med svært stor konsekvens.", "Et utfylt kontrollskjema beviser ikke at risikoen faktisk er redusert.", "Virksomheten kan tjene på en aktivitet mens deler av risikoen bæres av kunder, ansatte eller fellesskapet.", "Historiske data kan undervurdere nye, sjeldne eller sammenkoblede risikoer."],
    question_surface_mode: "hazard-exposure-bearer-rule-first",
    generator_use_note: "Start med en konkret fare, eksponert aktør, mulig konsekvens og gjeldende regel eller kontroll. Ikke bruk risiko som løst synonym for usikkerhet eller problemer.",
    overlap_resolution_note: "Bruk emnet for vurdering, forebygging, regler og tilsyn. Bruk bank, børs og forsikring for den konkrete finansielle kontrakten, og kriser, boomer og omstilling for den realiserte sykliske krisen.",
    anti_patterns: ["Ikke omtale alt usikkert som kvantifisert risiko.", "Ikke anta at regulering virker bare fordi en regel finnes.", "Ikke begrense analysen til virksomhetens eget tap når risikoen kan flyttes til andre."]
  },
  em_naering_verdsetting_pris_regnskap: {
    definition: "Emnet undersøker hvordan varer, tjenester, eiendeler, gjeld, inntekter og kostnader klassifiseres og måles, og hvordan markedspris, regnskapsverdi og kontantstrøm kan gi ulike bilder av samme virksomhet.",
    why_it_matters: "Tallene i pris, budsjett og regnskap er ikke rå virkelighet. De bygger på definisjoner, tidsperioder, fordelingsnøkler og estimater som påvirker resultat, skatt, investering og sammenligning.",
    keywords: ["pris", "verdsetting", "balanse", "resultatregnskap", "kontantstrøm", "avskrivning", "bokført verdi", "markedsverdi", "kostnadsfordeling", "regnskapsestimat"],
    key_concepts: ["pris", "verdsetting", "regnskap", "balanse", "resultat", "kontantstrøm", "avskrivning", "bokført verdi"],
    core_concepts: ["pris", "verdsetting", "balanse", "resultatregnskap", "kontantstrøm", "avskrivning"],
    sub_concepts: ["markedsverdi", "bokført verdi", "anskaffelseskost", "inntektsføring", "kostnadsfordeling", "nedskrivning", "estimat", "immateriell eiendel"],
    key_questions: [
      "Hva måles eller prises, på hvilket tidspunkt og for hvilket formål?",
      "Hvilken regnskapsregel, modell, markedsobservasjon eller antakelse ligger bak tallet?",
      "Hvordan skiller kontantbetaling, inntekt, kostnad, resultat og verdiendring seg i det konkrete tilfellet?",
      "Hvilke ikke-markedsomsatte verdier, framtidige forpliktelser eller usikre estimater faller utenfor eller skjules?"
    ],
    conflicts: ["bokført verdi vs markedsverdi", "forsiktighet vs optimistiske estimater", "åpenhet vs regnskapsmessig skjønn", "kortsiktig resultat vs langsiktig vedlikehold", "markedspris vs sosial verdi"],
    ideological_dimensions: ["historisk kost vs løpende markedsverdi", "standardisering vs virksomhetsspesifikt skjønn", "investorinformasjon vs bred samfunnsrapportering", "pris som signal vs pris som maktutfall"],
    analysis_axes: ["pris vs verdi", "bokført vs markedsverdi", "resultat vs kontantstrøm", "inntekt vs betaling", "kostnad vs investering", "målt verdi vs utelatt verdi"],
    quiz_angles: ["identify_measurement_object_rule_and_date", "distinguish_price_book_value_and_cash_flow", "trace_estimate_to_reported_result", "detect_omitted_or_nonmarket_value"],
    blindspots: ["Overskudd er ikke det samme som positiv kontantstrøm.", "Markedspris er én observasjon og ikke automatisk et mål på samfunnsverdi.", "Avskrivninger og verdsetting bygger på antakelser om levetid, framtid og risiko.", "Sammenligning mellom perioder kan bli misvisende dersom regler, organisering eller definisjoner er endret."],
    question_surface_mode: "measurement-rule-price-evidence-first",
    generator_use_note: "Start med et konkret tall, en transaksjon eller en regnskapspost. Spør hva tallet måler, hvilken regel som skapte det og hvordan det skiller seg fra kontantstrøm eller markedspris.",
    overlap_resolution_note: "Bruk emnet for måling, klassifisering og pris. Bruk marked, konkurranse og pris for markedsdannelsen mellom kjøpere og selgere, og effektivitet og optimalisering for ytelsesmål og prosessforbedring.",
    anti_patterns: ["Ikke bruke pris, verdi, inntekt, overskudd og kontantstrøm som synonymer.", "Ikke presentere et regnskapstall uten periode og målegrunnlag.", "Ikke anta at bokført eller markedsført verdi er objektiv og fullstendig."]
  }
};

const genericPhrases = [
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
    curation_batch: "naeringsliv_kapital_finans_v1",
    curation_date: "2026-07-25"
  });
}

const fields = ["definition", "why_it_matters", "key_questions", "conflicts", "ideological_dimensions", "analysis_axes", "blindspots", "generator_use_note", "overlap_resolution_note", "anti_patterns"];
for (const field of fields) {
  const values = Object.keys(patches).map(id => JSON.stringify(emner.find(item => item.emne_id === id)[field]));
  if (new Set(values).size !== values.length) throw new Error(`Feltet ${field} er ikke individuelt for alle ni emner`);
}

for (const id of Object.keys(patches)) {
  const text = JSON.stringify(emner.find(item => item.emne_id === id));
  for (const phrase of genericPhrases) {
    if (text.includes(phrase)) throw new Error(`${id} beholder generisk standardtekst: ${phrase}`);
  }
}

fs.writeFileSync(file, `${JSON.stringify(emner, null, 2)}\n`);
console.log(`Kuraterte ${Object.keys(patches).length} kapital- og finansemner individuelt.`);
