TRACKS = {
  "regnskap_revisjon_okonomistyring": {
    "title": "Regnskap, revisjon og økonomistyring",
    "purpose": "Profesjonsrettet progresjon fra bokføring og ekstern rapportering til regnskapsanalyse, kalkulasjon, budsjettering, internkontroll, revisjon og prestasjonsstyring.",
    "concepts": ["bilag", "dobbel bokføring", "periodisering", "resultat", "balanse", "kontantstrøm", "kostnadsdriver", "budsjett", "avvik", "internkontroll", "revisjonsrisiko", "prestasjonsstyring"],
    "capabilities": ["føre og avstemme et regnskapskretsløp", "tolke finansregnskap og noter", "beregne kalkyler og budsjettavvik", "vurdere internkontroll og revisjonsbevis", "koble mål til beslutning og ansvar"],
    "bridges": ["em_naering_verdsetting_pris_regnskap", "em_naering_ledelse_kontrollsystemer", "em_naering_eierskap_styring", "em_naering_kapital_finans"]
  },
  "markedsforing_og_strategi": {
    "title": "Markedsføring og strategi",
    "purpose": "Dekker markedsinnsikt, segmentering, produkt, pris, distribusjon, kommunikasjon, kunderelasjoner, konkurransestrategi, ressursanalyse og strategisk gjennomføring.",
    "concepts": ["markedsinnsikt", "segment", "målgruppe", "posisjonering", "produkt", "pris", "distribusjon", "kommunikasjon", "kundereise", "merkevare", "konkurransefortrinn", "implementering"],
    "capabilities": ["segmentere et dokumentert marked", "utforme og teste en markedsmiks", "analysere kundeverdi og merkevare", "vurdere bransje og ressurser", "oversette strategi til prioritering og endring"],
    "bridges": ["em_naering_forbruk_marked", "em_naering_marked_konkurranse_pris", "em_naering_merkevare_og_status", "em_naering_organisasjoner_ledelse"]
  },
  "kvantitative_metoder_business_analytics": {
    "title": "Kvantitative metoder og business analytics",
    "purpose": "Bygger verktøykjeden fra matematikk og sannsynlighet via statistisk inferens, regresjon og kausal identifikasjon til programmering, prognoser, optimering og beslutningsanalyse.",
    "concepts": ["funksjon", "derivasjon", "matrise", "sannsynlighet", "fordeling", "estimat", "konfidensintervall", "regresjon", "identifikasjon", "kode", "prognose", "optimering", "simulering"],
    "capabilities": ["bruke matematikk i økonomiske modeller", "kvantifisere usikkerhet", "estimere og kritisere regresjonsmodeller", "rense og visualisere data", "bygge prognose- og optimeringsmodeller"],
    "bridges": ["em_naering_effektivitet_optimalisering", "em_naering_data_algoritmer_verdiskaping", "em_naering_produksjon_produktivitet", "em_naering_risiko_regulering"]
  },
  "forretningsjus_skatt_regulering": {
    "title": "Forretningsjus, skatt og regulering",
    "purpose": "Anvendt progresjon i rettskildelære, avtaler, kjøp, selskaper, arbeid, personvern, skatt, avgift, konkurranse, compliance og bærekraftsrapportering.",
    "concepts": ["rettskilde", "avtale", "fullmakt", "mangel", "erstatning", "selskapsform", "styreansvar", "arbeidsforhold", "personopplysning", "skatt", "merverdiavgift", "konkurranserett", "compliance"],
    "capabilities": ["anvende relevante rettskilder", "analysere avtale- og kjøpsrisiko", "skille selskapsformer og ansvar", "beregne grunnleggende skatt og MVA", "kartlegge konkurranse-, personvern- og compliancekrav"],
    "bridges": ["em_naering_eierskap_styring", "em_naering_risiko_regulering", "em_naering_arbeidsliv_organisering", "em_naering_marked_konkurranse_pris"]
  },
  "internasjonal_virksomhet_operations_prosjekt": {
    "title": "Internasjonal virksomhet, operations og prosjektledelse",
    "purpose": "Dekker internasjonal handel, valuta, markedsinngang, multinasjonale selskaper, globale verdikjeder, kapasitet, kvalitet, innkjøp, forsyningsrisiko og prosjektøkonomi.",
    "concepts": ["komparativt fortrinn", "handelshindring", "valutarisiko", "markedsinngang", "multinasjonalt selskap", "global verdikjede", "kapasitet", "kø", "kvalitet", "innkjøp", "leverandørrisiko", "kritisk linje", "opptjent verdi"],
    "capabilities": ["analysere handel og valutaeksponering", "vurdere markedsinngang og styring", "modellere kapasitet og kø", "styre innkjøp og leverandørrisiko", "planlegge og følge opp prosjektøkonomi"],
    "bridges": ["em_naering_logistikk_verdikjeder", "em_naering_havn_transport", "em_naering_teknologi_infrastruktur", "em_naering_startup_grunder_innovasjon"]
  }
}

MODULES = [
  {
    "id": "mod_naering_bokforing_regnskapskretslop", "track": "regnskap_revisjon_okonomistyring", "title": "Bokføring og regnskapskretsløp",
    "focus": "bilag, debet og kredit, hovedbok, prøvebalanse og periodisering",
    "unit": "ett avgrenset regnskapsår eller en måned med komplett bilagsserie",
    "calc": "før minst tolv bilag med dobbel bokføring, avstem bank og kunde-/leverandørsaldo og bygg prøvebalanse",
    "conflict": "mekanisk korrekt bokføring mot økonomisk korrekt periodisering og klassifisering",
    "prereq": ["em_naering_verdsetting_pris_regnskap"],
    "measures": ["avstemmingsdifferanse", "arbeidskapitalendring", "periodiseringsandel", "bilagssporbarhet"],
    "datasets": ["hovedbok og bilag", "bank-, kunde- og leverandørreskontro", "årsregnskap og noter"]
  },
  {
    "id": "mod_naering_finansregnskap_rapportering", "track": "regnskap_revisjon_okonomistyring", "title": "Finansregnskap og ekstern rapportering",
    "focus": "innregning, måling, klassifisering, resultat, balanse, kontantstrøm og noter",
    "unit": "ett årsregnskap med sammenligningstall og sentrale noter",
    "calc": "rekonstruer resultat, balanse og indirekte kontantstrøm og beregn effekten av to alternative periodiseringsvalg",
    "conflict": "sammenlignbar standardisering mot virksomhetsspesifikt skjønn og informasjonsbehov",
    "prereq": ["em_naering_verdsetting_pris_regnskap", "em_naering_eierskap_styring"],
    "measures": ["driftsmargin", "egenkapitalandel", "kontantstrøm fra drift", "periodiseringskvalitet"],
    "datasets": ["årsregnskap og noter", "hovedbok og bilag", "foretaks-, rolle- og eierskapsdata"]
  },
  {
    "id": "mod_naering_regnskapsanalyse_verdsettelse", "track": "regnskap_revisjon_okonomistyring", "title": "Regnskapsanalyse og verdsettelse",
    "focus": "normalisering, nøkkeltall, DuPont, ROIC, fri kontantstrøm, kapitalkostnad og terminalverdi",
    "unit": "én virksomhet analysert over minst tre år og mot en relevant sammenligningsgruppe",
    "calc": "normaliser resultat, dekomponer avkastning med DuPont og gjennomfør DCF med sensitivitetsmatrise",
    "conflict": "markedspris og rapportert resultat mot fundamental verdi og usikre framtidsforutsetninger",
    "prereq": ["em_naering_verdsetting_pris_regnskap", "em_naering_kapital_finans"],
    "measures": ["ROIC", "fri kontantstrøm", "netto rentebærende gjeld", "verdsettelsesintervall"],
    "datasets": ["årsregnskap og noter", "markeds-, rente- og kapitaldata", "foretaks-, rolle- og eierskapsdata"]
  },
  {
    "id": "mod_naering_kostnad_kalkulasjon_budsjett", "track": "regnskap_revisjon_okonomistyring", "title": "Kostnadsanalyse, kalkulasjon og budsjettering",
    "focus": "kostnadsatferd, relevante kostnader, kostnadsdrivere, ABC, fleksibelt budsjett og avvik",
    "unit": "ett kostnadssted eller produkt- og tjenestespekter med volum, kapasitet og indirekte kostnader",
    "calc": "bygg bidrags- og selvkostkalkyle, aktivitetsbasert kalkyle og fleksibelt budsjett med pris-, volum- og effektivitetsavvik",
    "conflict": "enkel og styrbar kalkyle mot mer presis, men datakrevende kostnadsfordeling",
    "prereq": ["em_naering_effektivitet_optimalisering", "em_naering_produksjon_produktivitet"],
    "measures": ["dekningsgrad", "kapasitetskostnad", "kostnadsdriverrate", "budsjettavvik"],
    "datasets": ["budsjett-, koststeds- og avviksdata", "produksjons- og aktivitetsdata", "årsregnskap og noter"]
  },
  {
    "id": "mod_naering_internkontroll_revisjon_prestasjon", "track": "regnskap_revisjon_okonomistyring", "title": "Internkontroll, revisjon og prestasjonsstyring",
    "focus": "kontrollmiljø, revisjonsrisiko, revisjonsbevis, KPI-er, målforskyvning og balansert styring",
    "unit": "én kritisk prosess med påstander, risikoer, kontroller, eiere og resultatmål",
    "calc": "bygg risiko-kontrollmatrise, beregn revisjonsrisiko og utform balansert målekort med ledende og etterslepende indikatorer",
    "conflict": "kontroll og etterprøvbarhet mot fleksibilitet, læring og risiko for gaming",
    "prereq": ["em_naering_ledelse_kontrollsystemer", "em_naering_risiko_regulering"],
    "measures": ["kontrolldekning", "avviksfrekvens", "revisjonsrisiko", "målbalanseindeks"],
    "datasets": ["internkontroll- og revisjonsdata", "budsjett-, koststeds- og avviksdata", "produksjons- og aktivitetsdata"]
  },

  {
    "id": "mod_naering_markedsinnsikt_segmentering", "track": "markedsforing_og_strategi", "title": "Markedsinnsikt og segmentering",
    "focus": "markedsavgrensning, behov, segmenter, målgrupper, posisjonering og personvern",
    "unit": "ett definert produktmarked med kunde- eller respondentdata og to plausible segmenteringsgrunnlag",
    "calc": "gjennomfør deskriptiv analyse, segmentering og målgruppevurdering med størrelse, vekst, respons og kostnad",
    "conflict": "statistisk tydelige segmenter mot etisk, strategisk og operativt anvendelige målgrupper",
    "prereq": ["em_naering_forbruk_marked", "em_naering_marked_konkurranse_pris"],
    "measures": ["segmentstørrelse", "segmentvekst", "responsrate", "segmentlønnsomhet"],
    "datasets": ["CRM- og transaksjonsdata", "survey- og paneldata", "markeds- og konkurrentdata"]
  },
  {
    "id": "mod_naering_markedsmiks_kanaler", "track": "markedsforing_og_strategi", "title": "Produkt, pris, distribusjon og kommunikasjon",
    "focus": "produktverdi, prisstrategi, kanaløkonomi, kommunikasjon, konvertering og attribusjon",
    "unit": "ett tilbud i én målgruppe med dokumenterte priser, kanaler, kostnader og kampanjer",
    "calc": "beregn priselastisitet, kanalbidrag, anskaffelseskostnad og inkrementell kampanjeeffekt under to scenarier",
    "conflict": "kortvarig respons og salg mot langsiktig verdi, tillit og merkevare",
    "prereq": ["em_naering_forbruk_marked", "em_naering_merkevare_og_status"],
    "measures": ["kundanskaffelseskostnad", "konverteringsrate", "kanalbidrag", "inkrementell kampanjeeffekt"],
    "datasets": ["kampanje- og kanaldata", "CRM- og transaksjonsdata", "markeds- og konkurrentdata"]
  },
  {
    "id": "mod_naering_merkevare_kunderelasjon", "track": "markedsforing_og_strategi", "title": "Merkevare og kunderelasjoner",
    "focus": "kjennskap, assosiasjoner, tillit, prispremie, kundereise, retensjon, churn og CLV",
    "unit": "ett merke med kundekohorter og et kvalitetsjustert sammenligningsalternativ",
    "calc": "bygg merketrakt, beregn prispremie, kohortretensjon og diskontert kundelivstidsverdi",
    "conflict": "symbolsk og relasjonell verdi mot måleusikkerhet, statusforskjeller og manipulerende påvirkning",
    "prereq": ["em_naering_merkevare_og_status", "em_naering_tjenesteyting_og_service"],
    "measures": ["merkevarekjennskap", "prispremie", "retensjonsrate", "kundelivstidsverdi"],
    "datasets": ["CRM- og transaksjonsdata", "survey- og paneldata", "kampanje- og kanaldata"]
  },
  {
    "id": "mod_naering_konkurransestrategi_ressurser", "track": "markedsforing_og_strategi", "title": "Konkurransestrategi og ressursanalyse",
    "focus": "bransjestruktur, fem krefter, aktivitetssystem, VRIO, kapabiliteter og trade-offs",
    "unit": "én virksomhet og minst to konkurrenter i et eksplisitt avgrenset marked",
    "calc": "bygg femkraftsanalyse, aktivitetssystem og VRIO-vurdering og knytt funn til margin, vekst og kapitalbinding",
    "conflict": "ekstern posisjonering mot interne ressurser, og varig fortrinn mot rask imitasjon og endring",
    "prereq": ["em_naering_marked_konkurranse_pris", "em_naering_organisasjoner_ledelse"],
    "measures": ["relativ markedsandel", "marginforskjell", "strategisk kapitalbinding", "imitasjonsbarriereindeks"],
    "datasets": ["markeds- og konkurrentdata", "årsregnskap og noter", "CRM- og transaksjonsdata"]
  },
  {
    "id": "mod_naering_konsernstrategi_implementering", "track": "markedsforing_og_strategi", "title": "Konsernstrategi, implementering og strategisk endring",
    "focus": "diversifisering, vertikal integrasjon, synergi, portefølje, strategikart og endringskapasitet",
    "unit": "ett strategisk initiativ eller en virksomhetsportefølje med mål, ressurser, avhengigheter og tidslinje",
    "calc": "beregn porteføljebidrag og synergiscenario, bygg strategikart og spor milepæler, ressursbruk og atferdsendring",
    "conflict": "finansiell synergi og kontroll mot kompleksitet, kulturell friksjon og tap av lokal kunnskap",
    "prereq": ["em_naering_eierskap_styring", "em_naering_omstilling_kriser_skift"],
    "measures": ["synergirealisering", "strategisk milepælgrad", "ressursreallokering", "endringsadopsjon"],
    "datasets": ["strategi- og porteføljedata", "årsregnskap og noter", "organisasjons- og prosjektdata"]
  },

  {
    "id": "mod_naering_matematikk_for_okonomi", "track": "kvantitative_metoder_business_analytics", "title": "Matematikk for økonomi",
    "focus": "funksjoner, vekst, derivasjon, elastisitet, optimering, matriser og nåverdi",
    "unit": "én eksplisitt økonomisk funksjon eller et lite ligningssystem med dokumenterte enheter",
    "calc": "analyser funksjon, elastisitet og marginaleffekt, løs optimering med begrensning og et lineært ligningssystem",
    "conflict": "matematisk presisjon og generalitet mot økonomisk realisme og tolkbarhet",
    "prereq": ["em_naering_effektivitet_optimalisering", "em_naering_kapital_finans"],
    "measures": ["marginaleffekt", "elastisitet", "optimalitetsgap", "kondisjonstall"],
    "datasets": ["analytisk datamart", "modellparametre og scenarioantakelser", "tidsserie- og paneldata"]
  },
  {
    "id": "mod_naering_sannsynlighet_inferens", "track": "kvantitative_metoder_business_analytics", "title": "Sannsynlighet og statistisk inferens",
    "focus": "tilfeldige variable, fordelinger, forventning, estimering, konfidensintervall, testing og styrke",
    "unit": "ett definert utvalg med eksplisitt populasjon, måleprosess og primærparameter",
    "calc": "beregn forventning og varians, estimer parameter og konfidensintervall og gjennomfør en forhåndsdefinert test med styrkevurdering",
    "conflict": "beslutningsbehov for klare svar mot statistisk usikkerhet og risiko for falske funn",
    "prereq": ["em_naering_forbruk_marked", "em_naering_risiko_regulering"],
    "measures": ["standardfeil", "konfidensbredde", "teststyrke", "falsk positiv risiko"],
    "datasets": ["survey- og paneldata", "eksperiment- og kvasieksperimentdata", "analytisk datamart"]
  },
  {
    "id": "mod_naering_regresjon_kausalitet", "track": "kvantitative_metoder_business_analytics", "title": "Regresjon og kausal identifikasjon",
    "focus": "regresjon, konfoundere, paneldata, faste effekter, naturlige eksperimenter og parallelle trender",
    "unit": "ett utfall, en behandling eller eksponering og en eksplisitt sammenligningsgruppe over tid eller rom",
    "calc": "estimer grunnmodell og robust standardfeil, test spesifikasjon og gjennomfør differanse-i-differanser eller tilsvarende design",
    "conflict": "høy prediksjonskraft mot troverdig kausal identifikasjon og ekstern gyldighet",
    "prereq": ["em_naering_data_algoritmer_verdiskaping", "em_naering_doxa_vekst_effektivitet"],
    "measures": ["justert forklaringsgrad", "standardisert effekt", "robusthetsbredde", "pretrendavvik"],
    "datasets": ["eksperiment- og kvasieksperimentdata", "tidsserie- og paneldata", "analytisk datamart"]
  },
  {
    "id": "mod_naering_programmering_databehandling", "track": "kvantitative_metoder_business_analytics", "title": "Programmering, databehandling og visualisering",
    "focus": "datakontrakt, typer, manglende verdier, joins, pipeline, versjonering, visualisering og reproduserbarhet",
    "unit": "ett versjonert datasett med datakontrakt, transformasjonslogg og analyseprodukt",
    "calc": "implementer import, validering, sammenkobling, variabelbygging og visualisering med automatiske tester og reproduksjonsinstruks",
    "conflict": "hurtig analyse og fleksibilitet mot datakvalitet, sporbarhet, sikkerhet og vedlikehold",
    "prereq": ["em_naering_data_algoritmer_verdiskaping", "em_naering_digitalisering_plattformokonomi"],
    "measures": ["manglendehetsgrad", "duplikatgrad", "pipeline-reproduserbarhet", "visualiseringsfeilrate"],
    "datasets": ["analytisk datamart", "datakvalitet og lineage", "tidsserie- og paneldata"]
  },
  {
    "id": "mod_naering_prognose_optimering_beslutning", "track": "kvantitative_metoder_business_analytics", "title": "Prognoser, optimering og beslutningsanalyse",
    "focus": "tidsserieprognoser, benchmark, tapfunksjon, lineærprogrammering, scenario og Monte Carlo",
    "unit": "én operativ eller strategisk beslutning med målvariabel, begrensninger og sannsynlige scenarioer",
    "calc": "bygg benchmark og tidsserieprognose, løs optimeringsproblem og gjennomfør Monte Carlo- eller scenarioanalyse",
    "conflict": "forventet optimal løsning mot robusthet, fleksibilitet, rettferdighet og modellrisiko",
    "prereq": ["em_naering_effektivitet_optimalisering", "em_naering_logistikk_verdikjeder"],
    "measures": ["prognosefeil MAPE", "prognosebias", "optimalitetsgap", "scenariotap"],
    "datasets": ["tidsserie- og paneldata", "modellparametre og scenarioantakelser", "produksjons- og aktivitetsdata"]
  },

  {
    "id": "mod_naering_avtalerett_kjopsrett", "track": "forretningsjus_skatt_regulering", "title": "Avtalerett og kjøpsrett",
    "focus": "avtaleinngåelse, fullmakt, tolkning, ugyldighet, mangel, misligholdsbeføyelser og erstatning",
    "unit": "én avtale eller kjøpstransaksjon med tilbud, aksept, fullmakt, ytelse og dokumentert avvik",
    "calc": "bygg plikt- og risikomatrise og beregn mulig prisavslag, forsinkelseskostnad eller erstatning under alternative utfall",
    "conflict": "forutberegnelighet og avtalefrihet mot rimelighet, informasjonsasymmetri og vern av svakere part",
    "prereq": ["em_naering_risiko_regulering", "em_naering_logistikk_verdikjeder"],
    "measures": ["kontraktsdekning", "misligholdseksponering", "erstatningsintervall", "tvisterisiko"],
    "datasets": ["kontrakter og transaksjonsdokumenter", "lov, forarbeider og rettspraksis", "compliance- og hendelsesdata"]
  },
  {
    "id": "mod_naering_selskapsrett_eieransvar", "track": "forretningsjus_skatt_regulering", "title": "Selskapsrett og eieransvar",
    "focus": "selskapsformer, kapital, organer, kompetanse, minoritetsvern, styreansvar og faktisk kontroll",
    "unit": "én selskapsstruktur med eiere, vedtekter, organer, kapital og en dokumentert beslutning",
    "calc": "kartlegg stemmerett og kontroll, test saksbehandlingskrav og beregn kapital- eller ansvarseksponering",
    "conflict": "begrenset ansvar og effektiv kapitalmobilisering mot kreditorvern, minoritetsvern og ansvar for faktisk kontroll",
    "prereq": ["em_naering_eierskap_styring", "em_naering_kapital_finans"],
    "measures": ["stemmemaktkonsentrasjon", "kapitalvernsmargin", "styringsavvik", "ansvarseksponering"],
    "datasets": ["foretaks-, rolle- og eierskapsdata", "vedtekter, protokoller og styredokumenter", "lov, forarbeider og rettspraksis"]
  },
  {
    "id": "mod_naering_arbeidsrett_personvern", "track": "forretningsjus_skatt_regulering", "title": "Arbeidsrett og personvern",
    "focus": "ansettelse, arbeidstid, styringsrett, diskriminering, oppsigelse, medbestemmelse og personopplysninger",
    "unit": "ett arbeidsforhold eller kontrolltiltak med formål, rettsgrunnlag, berørte data og dokumentert beslutningsprosess",
    "calc": "bygg rettslig beslutningstre, vurder nødvendighet og proporsjonalitet og beregn eksponering ved brudd eller feil prosess",
    "conflict": "effektiv ledelse og sikkerhet mot autonomi, lik behandling, privatliv og kollektiv medbestemmelse",
    "prereq": ["em_naering_arbeidsliv_organisering", "em_naering_ledelse_kontrollsystemer"],
    "measures": ["prosessetterlevelse", "arbeidstidsavvik", "personvernrisiko", "diskrimineringsgap"],
    "datasets": ["arbeidsavtaler og HR-data", "behandlingsprotokoll og personvernunderlag", "lov, forarbeider og rettspraksis"]
  },
  {
    "id": "mod_naering_skatt_avgift", "track": "forretningsjus_skatt_regulering", "title": "Skatterett og avgiftsforståelse",
    "focus": "skattegrunnlag, fradrag, periodisering, betalbar og utsatt skatt, merverdiavgift og omgåelse",
    "unit": "én virksomhetsperiode eller transaksjon med regnskapsmessig og skattemessig behandling",
    "calc": "avstem regnskapsmessig og skattemessig resultat, beregn betalbar og utsatt skatt og gjennomfør merverdiavgiftsoppgjør",
    "conflict": "nøytralitet og finansiering av fellesskap mot kompleksitet, tilpasning og fordelingsvirkninger",
    "prereq": ["em_naering_verdsetting_pris_regnskap", "em_naering_risiko_regulering"],
    "measures": ["effektiv skattesats", "betalbar skatt", "endring i utsatt skatt", "MVA-avstemmingsdifferanse"],
    "datasets": ["skatte- og avgiftsoppgaver", "årsregnskap og noter", "lov, forarbeider og rettspraksis"]
  },
  {
    "id": "mod_naering_konkurranserett_compliance_baerekraft", "track": "forretningsjus_skatt_regulering", "title": "Konkurranserett, compliance og bærekraftsrapportering",
    "focus": "markedsatferd, samarbeid, dominans, korrupsjonsrisiko, varsling, aktsomhet og dobbel vesentlighet",
    "unit": "ett produktmarked, en høyrisikoprosess eller en rapporteringspåstand med identifiserte plikter og bevis",
    "calc": "avgrens marked og konsentrasjon, bygg compliance-risikokart og spor bærekraftspåstand fra kilde til rapport",
    "conflict": "standardisert etterlevelse og omdømmevern mot reell risikoreduksjon, konkurranse og åpenhet",
    "prereq": ["em_naering_marked_konkurranse_pris", "em_naering_baerekraft_eksternaliteter"],
    "measures": ["compliance-kontrolldekning", "hendelseslukkingstid", "rapporteringssporbarhet", "konkurranserisiko"],
    "datasets": ["compliance- og hendelsesdata", "markeds- og konkurrentdata", "bærekraftsrapportering og underlagsdata"]
  },

  {
    "id": "mod_naering_internasjonal_handel_valuta", "track": "internasjonal_virksomhet_operations_prosjekt", "title": "Internasjonal handel og valuta",
    "focus": "komparative fortrinn, handelshindringer, valutakurs, prising, sikring og finansiell eksponering",
    "unit": "én vare- eller tjenestestrøm mellom to land med pris, volum, kostnad og valuta",
    "calc": "beregn handelsmargin, toll- og transporteffekt og transaksjons-, omregnings- og økonomisk valutaeksponering",
    "conflict": "gevinster fra spesialisering og markedstilgang mot sårbarhet, fordelingsvirkninger og strategisk avhengighet",
    "prereq": ["em_naering_havn_transport", "em_naering_marked_konkurranse_pris"],
    "measures": ["handelsmargin", "tollbelastning", "valutaeksponering", "sikringsgrad"],
    "datasets": ["toll- og handelsdata", "valuta- og makrodata", "leverandør- og innkjøpsdata"]
  },
  {
    "id": "mod_naering_multinasjonale_globale_verdikjeder", "track": "internasjonal_virksomhet_operations_prosjekt", "title": "Multinasjonale selskaper og globale verdikjeder",
    "focus": "markedsinngang, FDI, lisens, joint venture, CAGE, internprising, styring og global verdifordeling",
    "unit": "én global verdikjede eller markedsinngang med minst tre land- eller organisasjonsledd",
    "calc": "kartlegg aktivitet, verdi og risiko per ledd, sammenlign inngangsmodi og beregn land- og styringseksponering",
    "conflict": "global skala og spesialisering mot kontrolltap, institusjonell avstand, skatte- og arbeidslivsforskjeller",
    "prereq": ["em_naering_logistikk_verdikjeder", "em_naering_eierskap_styring"],
    "measures": ["landrisikojustert avkastning", "verdikjedeandel", "styringskompleksitet", "lokal verdiskapingsandel"],
    "datasets": ["toll- og handelsdata", "land-, institusjons- og markedsdata", "foretaks-, rolle- og eierskapsdata"]
  },
  {
    "id": "mod_naering_operations_kapasitet", "track": "internasjonal_virksomhet_operations_prosjekt", "title": "Operations og kapasitetsstyring",
    "focus": "prosessflyt, variasjon, kapasitet, kø, flaskehals, Little’s law, takt og tjenestenivå",
    "unit": "én ende-til-ende-prosess med ankomst, behandlingstid, kapasitet, kø og kvalitetsutfall",
    "calc": "bygg prosesskart, beregn utnyttelse, Little’s law, flaskehalskapasitet og scenario for etterspørselsvariasjon",
    "conflict": "høy kapasitetsutnyttelse og lav kostnad mot kort ledetid, fleksibilitet, kvalitet og robusthet",
    "prereq": ["em_naering_produksjon_produktivitet", "em_naering_tjenesteyting_og_service"],
    "measures": ["kapasitetsutnyttelse", "gjennomløpstid", "kølengde", "førstegangsutbytte"],
    "datasets": ["operations- og prosesslogg", "kvalitets- og avviksdata", "etterspørsels- og lagerdata"]
  },
  {
    "id": "mod_naering_innkjop_kvalitet_forsyningsrisiko", "track": "internasjonal_virksomhet_operations_prosjekt", "title": "Innkjøp, kvalitet og forsyningsrisiko",
    "focus": "behov, spesifikasjon, leverandørvalg, total cost of ownership, sikkerhetslager, kvalitet og resiliens",
    "unit": "én vare- eller tjenestekategori med minst tre leverandører, kvalitetsdata og forsyningsscenarioer",
    "calc": "beregn total cost of ownership, leverandørscore, sikkerhetslager og forventet avbruddstap",
    "conflict": "lav innkjøpspris og konsolidering mot kvalitet, leveringssikkerhet, makt og redundans",
    "prereq": ["em_naering_logistikk_verdikjeder", "em_naering_risiko_regulering"],
    "measures": ["total eierkostnad", "leveringspresisjon", "leverandørfeilrate", "forsyningsrisikoindeks"],
    "datasets": ["leverandør- og innkjøpsdata", "kvalitets- og avviksdata", "etterspørsels- og lagerdata"]
  },
  {
    "id": "mod_naering_prosjektledelse_prosjektokonomi", "track": "internasjonal_virksomhet_operations_prosjekt", "title": "Prosjektledelse og prosjektøkonomi",
    "focus": "omfang, WBS, kritisk linje, milepæler, opptjent verdi, risikoreserve, endringskontroll og gevinst",
    "unit": "ett prosjekt med leveransestruktur, aktiviteter, ressurser, budsjett, risiko og gevinstmål",
    "calc": "bygg WBS og nettverksplan, finn kritisk linje og beregn opptjent verdi, sluttprognose og risikoreserve",
    "conflict": "planmessig kontroll og kontrakt mot læring, endring, interessentbehov og usikker gevinst",
    "prereq": ["em_naering_startup_grunder_innovasjon", "em_naering_omstilling_kriser_skift"],
    "measures": ["schedule performance index", "cost performance index", "estimate at completion", "gevinstrealiseringsgrad"],
    "datasets": ["organisasjons- og prosjektdata", "prosjektøkonomi og risikoregister", "leverandør- og innkjøpsdata"]
  }
]
