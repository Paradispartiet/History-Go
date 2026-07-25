#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sportDir = "data/fag/sport";
const paths = {
  emner: `${sportDir}/emner_sport_canonical_v4_5.json`,
  hooks: `${sportDir}/theory_hooks_sport_canonical_v5.json`,
  thinkers: `${sportDir}/teoretikere_sport_canonical_v5.json`,
  concepts: `${sportDir}/begreper_sport_canonical_v5.json`,
  claims: `${sportDir}/claims_sport_canonical_v1.json`,
  qualityManifest: `${sportDir}/sport_quality_manifest_v5.json`,
  evidenceManifest: `${sportDir}/sport_scientific_evidence_manifest_v1.json`,
  profile: `${sportDir}/supersetQUIZMAL_sport.json`,
  units: `${sportDir}/theory_units_sport_canonical_v6.json`,
  matrix: `${sportDir}/emne_theory_coverage_sport_v6.json`,
  manifest: `${sportDir}/sport_theory_depth_manifest_v6.json`,
  reportJson: "reports/sport-theory-depth-validation.json",
  reportMd: "reports/sport-theory-depth-lift.md"
};

const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const writeJson = async (relativePath, value) => {
  await mkdir(path.dirname(path.resolve(root, relativePath)), { recursive: true });
  await writeFile(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, " ")
  .trim();
const tokenSet = (value) => new Set(normalize(Array.isArray(value) ? value.join(" ") : value)
  .split(/\s+/)
  .filter((token) => token.length >= 3));
const overlapScore = (left, right) => {
  const a = tokenSet(left);
  const b = tokenSet(right);
  let score = 0;
  for (const token of a) if (b.has(token)) score += token.length >= 7 ? 3 : 1;
  return score;
};
const unique = (values) => [...new Set(values.filter(Boolean))];

const hookBlueprints = {
  hook_sport_lek_spill_sport: { main: "praksis- og lekperspektivet", rival: "institusjonell definisjon av sport", mechanism: "frivillighet, regelbinding og institusjonalisering endrer aktivitetens mening", critique: "skillet mellom lek, spill og sport kan være historisk og kulturelt flytende", boundary: "brukes ikke uten å angi hvilken praksis, regelorden og organisasjonsgrad som analyseres", test: "sammenlign samme aktivitet før og etter formalisering av regler og konkurranse" },
  hook_sport_konstitutive_regler: { main: "konstitutiv regelteori", rival: "regler som ytre regulering", mechanism: "noen regler skaper selve spillet, mens andre bare regulerer en allerede gjenkjennelig praksis", critique: "regelendringer kan gradvis endre spillets identitet uten en klar grense", boundary: "skillet må forankres i konkret regeltekst og faktisk spillpraksis", test: "fjern eller endre regelen og vurder om aktiviteten fortsatt er samme spill" },
  hook_sport_konkurranse_usikkerhet: { main: "usikkerhets- og konkurransebalanseperspektivet", rival: "maksimal prestasjonsdominans", mechanism: "spenning oppstår når utfall er tilstrekkelig åpne samtidig som prestasjon kan skilles", critique: "tilskuerspenning, rettferdighet og sportslig kvalitet er ikke identiske størrelser", boundary: "måles på definert nivå, tidsrom og konkurranseformat", test: "undersøk om endret ressurs- eller regelbalanse påvirker resultatspredning og interesse" },
  hook_sport_indre_goder_praksis: { main: "praksisteori om indre goder", rival: "instrumentell resultat- og markedslogikk", mechanism: "dyktighet og normer utvikles gjennom praksisens interne standarder, mens ytre goder kan fortrenge dem", critique: "indre goder kan romantisere tradisjoner og skjule eksklusjon", boundary: "må angi hvem som definerer praksisens standarder og hvem som ekskluderes", test: "sammenlign beslutninger begrunnet i sportslig kvalitet med beslutninger begrunnet i penger eller status" },
  hook_sport_sportivisering_standardisering: { main: "sportivisering og rasjonalisering", rival: "lokal kontinuitet og mangfold", mechanism: "standardiserte regler, byråkrati og måling gjør lokale aktiviteter sammenlignbare og styrbare", critique: "moderniseringsfortellingen kan bli lineær og eurosentrisk", boundary: "må dokumentere lokale forløp og alternative moderniteter", test: "spor når regler, organisasjoner og målesystemer faktisk ble standardisert" },
  hook_sport_amatorisme_profesjonalisering: { main: "profesjonalisering som arbeids- og institusjonsendring", rival: "amatøridealet", mechanism: "lønn, kontrakter, ekspertroller og markeder endrer hvem som kan delta og hvordan prestasjon organiseres", critique: "amatørisme har ofte skjult klasseprivilegier og ubetalt arbeid", boundary: "skille mellom betaling, heltidsarbeid, kommersialisering og formell profesjonsstatus", test: "sammenlign deltakermønstre og arbeidsvilkår før og etter profesjonalisering" },
  hook_sport_rekord_kvantifisering: { main: "kvantifisering og rekordlogikk", rival: "kvalitativ og situert prestasjonsforståelse", mechanism: "standardiserte målinger gjør prestasjoner sammenlignbare på tvers av tid og sted", critique: "tall kan skjule regel-, teknologi- og miljøforskjeller", boundary: "rekorder krever sammenlignbare vilkår, enheter og kontrollregimer", test: "revider sammenligningen når utstyr, bane, regler eller måleprotokoll endres" },
  hook_sport_olympisme_nasjonalisme: { main: "olympisme som internasjonalistisk dannelsesprosjekt", rival: "mesterskapet som nasjonal rangering og geopolitikk", mechanism: "symboler, delegasjoner og medaljetabeller kobler universalisme til nasjonal representasjon", critique: "universalisme kan dekke over koloniale, kjønnede og økonomiske maktforhold", boundary: "må skille normativ olympisme fra faktisk institusjonspraksis", test: "sammenlign offisiell retorikk med deltakelse, boykotter, vertskap og ressursfordeling" },
  hook_sport_stadion_sosialt_rom: { main: "produksjon av sosialt rom", rival: "stadion som nøytral beholder", mechanism: "arkitektur, adgang, overvåking og ritual organiserer kropp, klasse og tilhørighet", critique: "romteori kan undervurdere kampens sportslige dynamikk og individuell erfaring", boundary: "må kobles til observerbar utforming, praksis og adgangsregime", test: "kartlegg hvordan ulike grupper beveger seg, plasseres og kontrolleres på samme arena" },
  hook_sport_groundhopping_stedsidentitet: { main: "stedsidentitet og mobil supporterpraksis", rival: "arenaen som utskiftbar underholdningsflate", mechanism: "reise, samling og feltobservasjon knytter arenaer til lokale fortellinger og personlig minne", critique: "besøkspraksis kan romantisere autentisitet og overse lokale konflikter", boundary: "feltinntrykk kan ikke alene bevise historiske eller sosiale påstander", test: "trianguler feltlogg med arkiv, lokale kilder og endringer i arenaens bruk" },
  hook_sport_anlegg_byutvikling: { main: "romlig rettferdighet og urban politisk økonomi", rival: "anlegg som entydig lokal vekstmotor", mechanism: "investering, tomtebruk og transport fordeler tilgang, verdi og fortrengning ulikt", critique: "lokale effekter varierer og kan ikke leses direkte fra investeringssum", boundary: "krever geografisk avgrensning, kontrafaktisk sammenligning og fordelingsanalyse", test: "undersøk hvem som får tilgang, hvem som betaler og hva som fortrenges" },
  hook_sport_idrettsminne_kulturarv: { main: "kollektiv hukommelse og kulturarv", rival: "historie som nøytral bevaring av fortiden", mechanism: "utvalg, ritualer og steder gjør enkelte idrettsfortellinger varige og andre usynlige", critique: "minnebegrepet kan bli så bredt at all nostalgi blir kulturarv", boundary: "må dokumentere aktører, medier og institusjoner som produserer minnet", test: "sammenlign offisiell minnepraksis med utelatte grupper og alternative arkiver" },
  hook_sport_rom_tid_overtall: { main: "relasjonell rom- og tidskontroll", rival: "isolert individuell teknikk", mechanism: "posisjonering og timing skaper lokale overtall, pasningslinjer og beslutningsmuligheter", critique: "romlige mønstre kan overtolkes uten ball-, motstander- og kampkontekst", boundary: "analyseenhet, fase og referanseramme må angis", test: "kod situasjoner før og etter posisjonsendring og mål endrede handlingsmuligheter" },
  hook_sport_faser_overganger: { main: "fase- og overgangsmodell", rival: "kontinuerlig spill uten klare faser", mechanism: "balltap, ballvinning og reorganisering endrer risiko og rollekrav raskt", critique: "faseetiketter kan skjule glidende og samtidige prosesser", boundary: "operasjonaliser start og slutt på hver fase", test: "sammenlign beslutninger og romstruktur i sekvensene rundt definerte overgangshendelser" },
  hook_sport_press_kompakthet: { main: "kollektiv press- og kompakthetsmodell", rival: "individuelt duellpress", mechanism: "koordinerte avstander og pressignaler reduserer motstanderens tid og rom", critique: "kompakthet er ikke automatisk effektivitet og kan åpne andre rom", boundary: "må angi presshøyde, ballside, lagavstander og motstanderstruktur", test: "mål hvilke pasnings- og progresjonsmuligheter som forsvinner eller oppstår" },
  hook_sport_spillmodell_beslutning: { main: "spillmodell som delt beslutningsramme", rival: "spontan tilpasning uten eksplisitt modell", mechanism: "felles prinsipper reduserer beslutningsusikkerhet og koordinerer handling", critique: "for rigid modell kan hemme lokal problemløsning og kreativitet", boundary: "skille uttalt modell fra faktisk observert atferd", test: "sammenlign trenerdokumenter, treningsdesign og kamphandlinger i samme situasjonstype" },
  hook_sport_persepsjon_handling: { main: "økologisk persepsjon–handling-kobling", rival: "intern informasjonsprosessering før handling", mechanism: "utøveren oppfatter handlingsmuligheter direkte i relasjon til kropp, oppgave og miljø", critique: "direkte persepsjon kan undervurdere hukommelse, forventning og representasjon", boundary: "må identifisere hvilke informasjonsvariabler som faktisk er tilgjengelige", test: "manipuler informasjonskilder og observer om handlingen endres systematisk" },
  hook_sport_begrensningsstyrt_laring: { main: "constraints-led approach", rival: "preskriptiv teknikkmodell", mechanism: "oppgave-, miljø- og individbegrensninger former selvorganiserte løsninger", critique: "svak oppgavedesign kan bli tilfeldig variasjon uten læringsmål", boundary: "begrensningene må være representative og koblet til ønsket atferd", test: "endre én begrensning om gangen og undersøk om løsningen endres som forventet" },
  hook_sport_variabilitet_tilpasning: { main: "funksjonell variabilitet og dynamiske systemer", rival: "én stabil idealteknikk", mechanism: "variasjon kan støtte tilpasning når den utforsker relevante løsningsrom", critique: "mer variasjon er ikke alltid bedre og kan øke støy eller belastning", boundary: "må skille funksjonell variasjon fra ukontrollert feil", test: "mål robusthet når oppgave- eller miljøbetingelser endres" },
  hook_sport_feedback_oppmerksomhet: { main: "eksternt fokus og selvregulert feedback", rival: "hyppig intern og trenerstyrt korreksjon", mechanism: "oppmerksomhetsretning og feedbackfrekvens påvirker automatikk, problemløsning og avhengighet", critique: "effekter varierer med ferdighetsnivå, oppgave og sikkerhetskrav", boundary: "feedbacktype, timing og læringsmål må beskrives", test: "sammenlign læring og retensjon, ikke bare umiddelbar prestasjon" },
  hook_sport_belastning_tilpasning: { main: "dose–respons og fitness–fatigue", rival: "fast periodiseringsoppskrift", mechanism: "belastning skaper både tilpasningssignal og kortvarig tretthet med individuell tidsdynamikk", critique: "enkle belastningsindekser kan gi falsk presisjon og skjule kontekst", boundary: "dose, respons, tidsvindu og målpopulasjon må angis", test: "følg flere responsmål over tid og vurder alternativ forklaring som søvn, sykdom og livsbelastning" },
  hook_sport_utholdenhet_energisystemer: { main: "integrert aerob–anaerob energiforsyning", rival: "isolerte energisystemsoner", mechanism: "energiomsetning, oksygentransport, terskler og arbeidsøkonomi samvirker kontinuerlig", critique: "sonemodeller kan bli kategoriske og protokollavhengige", boundary: "test, idrett, varighet og miljø må spesifiseres", test: "sammenlign fysiologiske og prestasjonsmessige responser ved standardisert intensitet" },
  hook_sport_styrke_hurtighet_kraft: { main: "kraft–hastighets- og nevromuskulær modell", rival: "én generell styrkeegenskap", mechanism: "prestasjon avhenger av kraftutvikling, hastighet, koordinasjon og oppgavespesifisitet", critique: "laboratoriemål overføres ikke automatisk til idrettsprestasjon", boundary: "bevegelse, belastning, måleutstyr og teknikk må angis", test: "undersøk både mekanisk profil og faktisk oppgaveprestasjon etter intervensjon" },
  hook_sport_restitusjon_overtrening: { main: "allostatisk belastning og restitusjonsbalanse", rival: "enkeltmarkør for readiness", mechanism: "søvn, energi, vev, psykososial belastning og trening påvirker samlet restitusjon", critique: "overtrening er vanskelig å diagnostisere og mange markører er uspesifikke", boundary: "ingen enkeltmåling kan avgjøre klinisk status", test: "bruk longitudinelle mønstre og flere datakilder med medisinsk grense ved symptomer" },
  hook_sport_bevegelsesmekanikk: { main: "inverse dynamics og mekanisk oppgaveanalyse", rival: "visuell teknikkvurdering uten kraftdata", mechanism: "krefter, moment, impuls og segmentbevegelse skaper observerbar bevegelse", critique: "modellantakelser og målefeil kan gi presise, men misvisende estimater", boundary: "koordinatsystem, filtrering, modell og instrument må dokumenteres", test: "repliker beregningen med kalibrering og sensitivitetsanalyse" },
  hook_sport_prestasjonsdata_validitet: { main: "måleteori og konstruktvaliditet", rival: "tallet som direkte fasit", mechanism: "målinger representerer et konstrukt gjennom protokoll, instrument og beregningsregel", critique: "høy reliabilitet betyr ikke at riktig konstrukt måles", boundary: "validitet er formåls-, populasjons- og kontekstavhengig", test: "undersøk reliabilitet, målefeil, kriterievaliditet og praktisk beslutningsverdi" },
  hook_sport_teknologi_tracking: { main: "sosioteknisk målesystem", rival: "sensoren som nøytral observatør", mechanism: "hardware, algoritmer, leverandørvalg og arbeidspraksis former dataene", critique: "teknologikritikk kan overse reell nytte når systemet er validert", boundary: "modellversjon, firmware, plassering og databehandling må angis", test: "sammenlign mot referansemetode og mellom enheter, versjoner og settinger" },
  hook_sport_skade_risiko_epidemiologi: { main: "multifaktoriell skadeepidemiologi", rival: "én risikofaktor som individuell prediktor", mechanism: "eksponering, tidligere skade, belastning, kontekst og tilfeldighet påvirker hendelsesrisiko", critique: "gruppemodeller har ofte svak individuell kalibrering", boundary: "krever klar skade- og eksponeringsdefinisjon og ingen individuell diagnose", test: "vurder kalibrering, diskriminering, ekstern validering og beslutningskonsekvens" },
  hook_sport_motivasjon_selvbestemmelse: { main: "selvbestemmelsesteori", rival: "ytre kontroll og belønning som hovedmotor", mechanism: "autonomi, kompetanse og tilhørighet påvirker motivasjonskvalitet og vedvarende deltakelse", critique: "behovsuttrykk og måleinstrumenter kan variere kulturelt og situasjonelt", boundary: "motivasjon må måles i konkret miljø og over tid", test: "undersøk om endret trenerklima påvirker behovsstøtte, motivasjon og atferd" },
  hook_sport_mestring_self_efficacy: { main: "sosialkognitiv teori om mestringstro", rival: "fast egenskap eller ren viljestyrke", mechanism: "mestringserfaring, modellæring, verbal støtte og fysiologisk fortolkning påvirker forventet handleevne", critique: "selvrapport kan overlappe med faktisk ferdighet og optimisme", boundary: "mestringstro er oppgave- og situasjonsspesifikk", test: "mål forventning før oppgave og kontroller for tidligere prestasjon og ferdighet" },
  hook_sport_stress_arousal_oppmerksomhet: { main: "transaksjonell stress- og oppmerksomhetsmodell", rival: "én optimal aktiveringssone for alle", mechanism: "krav, vurdering, mestringsressurser og oppmerksomhetskontroll former prestasjon under press", critique: "aktivering, angst og stress blandes ofte i måling og språk", boundary: "situasjon, timing, individ og oppgavetype må spesifiseres", test: "kombiner selvrapport, atferd og prestasjonsmål i standardiserte pressbetingelser" },
  hook_sport_flyt_lagkohesjon_ledelse: { main: "dynamisk koordinasjon mellom flyt, kohesjon og ledelse", rival: "sterk leder eller lagånd som enkel årsak", mechanism: "felles mål, rolleforståelse, tillit og situasjonstilpasset ledelse kan koordinere kollektiv handling", critique: "kohesjon kan være resultat av seier snarere enn årsak", boundary: "skille oppgavekohesjon, sosial kohesjon og prestasjonsnivå", test: "bruk longitudinelle data og nettverks- eller observasjonsmål før og etter endring" },
  hook_sport_deliberate_play_sampling: { main: "deliberate play og sampling", rival: "tidlig målrettet spesialisering", mechanism: "variert, lekpreget deltakelse kan bygge motivasjon, motorisk repertoar og overførbare ferdigheter", critique: "utviklingsveier varierer mellom idretter og retrospektive data har seleksjonsbias", boundary: "alder, idrett, nivå og definisjon av lek og trening må angis", test: "sammenlign prospektive utviklingsforløp, frafall, helse og prestasjon" },
  hook_sport_tidlig_spesialisering_frafall: { main: "utviklingsøkologisk talentmodell", rival: "lineær tidlig seleksjon", mechanism: "samspill mellom modning, miljø, muligheter, belastning og motivasjon former utvikling og frafall", critique: "generelle anbefalinger kan passe dårlig i tidlig-toppsidretter", boundary: "ingen universell alder eller treningsdose gjelder alle", test: "følg hele kohorter og inkluder de som slutter, ikke bare eliteutøvere" },
  hook_sport_tgfu_sport_education: { main: "Teaching Games for Understanding og Sport Education", rival: "isolert teknikkdrill før spillforståelse", mechanism: "spillproblemer, roller og refleksjon kobler taktisk forståelse til ferdighetsutvikling", critique: "modeller kan implementeres overflatisk og krever lærerkompetanse", boundary: "oppgaven må bevare idrettens sentrale beslutningsproblem", test: "mål beslutningskvalitet, deltakelse og læring over tid, ikke bare teknisk test" },
  hook_sport_safeguarding_barnets_rettigheter: { main: "rettighetsbasert safeguarding", rival: "prestasjon og organisasjonslojalitet foran barnets interesser", mechanism: "tydelige roller, rapporteringsveier, medvirkning og maktkontroll reduserer risiko og styrker trygghet", critique: "formelle regler uten kultur og håndheving kan bli symbolpolitikk", boundary: "sikkerhet kan ikke avgjøres av quiz eller selvrapport alene", test: "audit av praksis, varsling, respons, opplæring og barns erfaringer" },
  hook_sport_klubb_forbund_frivillighet: { main: "foreningsdemokrati og institusjonell kollektiv handling", rival: "klubben som ren tjenesteleverandør", mechanism: "medlemskap, frivillighet, vedtekter og representasjon fordeler ansvar og beslutningsmakt", critique: "formelt demokrati kan skjule lav deltakelse og uformelle eliter", boundary: "må skille juridisk struktur fra faktisk styringspraksis", test: "sammenlign vedtekter, møteprotokoller, deltakelse og beslutningsutfall" },
  hook_sport_profesjonalisering_arbeid: { main: "arbeidsprosess- og profesjonsteori", rival: "sport som fritidsaktivitet uten arbeidsforhold", mechanism: "kontrakter, ekspertise, kontroll og karriererisiko organiserer idrett som arbeid", critique: "elitearbeid kan ikke uten videre generaliseres til bredde og frivillighet", boundary: "angi yrkesstatus, kontraktsform, kjønn, nivå og rettighetsregime", test: "kartlegg arbeidstid, kontroll, lønn, rettigheter og overgang etter karriere" },
  hook_sport_konkurransebalanse_finans: { main: "konkurransebalanse og ligaøkonomi", rival: "fri kapitalakkumulasjon som kvalitetsmotor", mechanism: "inntektsfordeling, lønn, eierskap og turneringsdesign påvirker sportslig usikkerhet og investering", critique: "balanseindikatorer kan overse kvalitet, mobilitet og langsiktig dominans", boundary: "må spesifisere liga, tidsrom, mål og institusjonelle regler", test: "vurder flere balanse- og mobilitetsmål før og etter regelendring" },
  hook_sport_megaevents_governance: { main: "megaarrangement som styrings- og koalisjonsprosjekt", rival: "automatisk økonomisk og sosial arv", mechanism: "vertskoalisjoner, kontrakter, sikkerhet og infrastruktur fordeler kostnader, risiko og gevinst", critique: "etteranalyse lider ofte av optimistiske kontrafaktiske antakelser", boundary: "må skille kortsiktig aktivitet, langsiktig arv og fordelingsvirkning", test: "sammenlign bud, reviderte kostnader, alternativ bruk og faktiske ettervirkninger" },
  hook_sport_supporter_ritual_fellesskap: { main: "ritual- og fellesskapsteori", rival: "supporteren som individuell forbruker", mechanism: "gjentakelse, symboler, kroppslig samvær og emosjonell synkronisering skaper tilhørighet", critique: "fellesskap kan også produsere eksklusjon, kontroll og konflikt", boundary: "må undersøke konkrete ritualer og gruppers ulike erfaringer", test: "kombiner observasjon, intervju og historiske kilder om ritualets endring og grenser" },
  hook_sport_derby_lokal_identitet: { main: "relasjonell lokal identitet", rival: "rivalisering som tidløs essens", mechanism: "historie, geografi, klasse, migrasjon og sportslige hendelser produserer skiftende vi–de-grenser", critique: "fortellinger om lokal autentisitet kan være retrospektive konstruksjoner", boundary: "må dokumentere periode, aktører og medie- eller supporterpraksis", test: "spor når og hvordan rivaliseringsmarkører oppstår, endres og brukes" },
  hook_sport_medialisering_kommersialisering: { main: "medialisering og plattformøkonomi", rival: "medier som passiv formidler av sport", mechanism: "sendeskjema, format, rettigheter, algoritmer og sponsorlogikk endrer selve produktet og publikumspraksisen", critique: "mediepåvirkning varierer mellom idretter, markeder og nivåer", boundary: "plattform, periode, rettighetsregime og målgruppe må angis", test: "sammenlign regler, tidsplan, inntekter og publikumsatferd før og etter medieendring" },
  hook_sport_nasjonalisme_globale_fandoms: { main: "transnasjonal fandom og forestilte fellesskap", rival: "entydig lokal eller nasjonal lojalitet", mechanism: "medier, migrasjon, merkevarer og mesterskap kobler flere skalaer av identitet", critique: "globalisering betyr ikke at lokale bånd forsvinner", boundary: "må skille identifikasjon, forbruk, deltakelse og politisk symbolbruk", test: "kartlegg supporterpraksis på tvers av lokalitet, plattform og hendelse" },
  hook_sport_kjonnede_kropper_ulikhet: { main: "kjønnet institusjons- og kroppsteori", rival: "biologisk eller meritokratisk forklaring alene", mechanism: "regler, ressurser, normer og medierepresentasjon former muligheter og kroppslige idealer", critique: "kjønn kan ikke analyseres isolert fra klasse, rase og funksjonsevne", boundary: "biologiske påstander krever presist utfall, populasjon og metode", test: "sammenlign ressursfordeling, regler, deltakelse og representasjon over tid" },
  hook_sport_rasisering_koloniale_arv: { main: "kritisk rase- og postkolonial teori", rival: "sport som automatisk fargeblind meritokrati", mechanism: "historiske institusjoner, stereotyper og tilgangsstrukturer påvirker posisjon, ledelse og representasjon", critique: "brede kategorier kan skjule lokale historiske forskjeller", boundary: "må dokumentere konkret institusjon, periode og mekanisme", test: "kombiner historiske kilder, representasjonsdata og erfaringer med alternative forklaringer" },
  hook_sport_paraidrett_tilgjengelighet: { main: "sosial og relasjonell funksjonshemmingsmodell", rival: "individuell medisinsk mangelmodell", mechanism: "barrierer oppstår i møtet mellom kropp, klassifisering, teknologi, miljø og institusjon", critique: "sosial modell må ikke ignorere smerte, helse og individuelle behov", boundary: "må skille klassifisering, tilgjengelighet, støttebehov og sportslig rettferdighet", test: "audit fysiske, kommunikative og organisatoriske barrierer sammen med utøvererfaring" },
  hook_sport_interseksjonalitet_representasjon: { main: "interseksjonell maktanalyse", rival: "én kategori om gangen", mechanism: "kryssende institusjonelle posisjoner skaper erfaringer som ikke kan summeres enkelt", critique: "begrepet kan bli deskriptivt uten tydelig mekanisme og sammenligningsgrunnlag", boundary: "må angi hvilke institusjoner, kategorier og utfall som analyseres", test: "undersøk fordelinger og erfaringer i kryssede grupper med tilstrekkelig datagrunnlag" },
  hook_sport_fair_play_gamesmanship: { main: "fair play som normativ praksis", rival: "regelminimalisme og gamesmanship", mechanism: "legitimitet avhenger av både formelle regler og praksisens normer om respekt og like vilkår", critique: "fair play-retorikk kan brukes selektivt av mektige aktører", boundary: "må skille regelbrudd, strategisk regelbruk og moralsk kritikk", test: "analyser samme handling juridisk, sportslig og normativt med åpne kriterier" },
  hook_sport_doping_enhancement: { main: "rettferdighet, helse og meningsbærende begrensninger", rival: "liberal prestasjonsfremming under kontroll", mechanism: "forbud og tillatelser balanserer risiko, autonomi, likhet og sportens definerte utfordring", critique: "grensen mellom behandling, teknologi og forbedring er historisk og inkonsistent", boundary: "gjeldende regelverk og virkningsdato må alltid angis", test: "sammenlign normative begrunnelser med faktisk regeltekst, risiko og håndheving" },
  hook_sport_dataovervakning_personvern: { main: "informasjonsmakt og kontekstuell integritet", rival: "mer data som automatisk bedre prestasjon", mechanism: "innsamling, tilgang og beslutningsbruk flytter makt mellom utøver, klubb, arbeidsgiver og leverandør", critique: "personvernkrav må balanseres mot legitim sikkerhet og analyse", boundary: "formål, samtykke, arbeidsforhold, dataminimering og tilgang må spesifiseres", test: "kartlegg dataflyt, beslutningskonsekvens, lagring og reell mulighet til å si nei" },
  hook_sport_dommerteknologi_rettferdighet: { main: "prosedyrell rettferdighet og menneske–maskin-beslutning", rival: "teknologi som objektiv fasit", mechanism: "sensor, terskel, kameravinkel og protokoll fordeler feil og autoritet", critique: "mer presisjon kan redusere flyt og flytte kontrovers til systemdesign", boundary: "må angi hvilke feil teknologien kan og ikke kan korrigere", test: "mål feiltype, konsistens, tidsbruk og opplevd legitimitet før og etter innføring" },
  hook_sport_fysisk_aktivitet_folkehelse: { main: "befolkningsbasert dose–respons og økologisk folkehelse", rival: "individuell viljestyrke som hovedforklaring", mechanism: "miljø, politikk, sosial ulikhet og vane påvirker aktivitetsmulighet og helseeffekt", critique: "selvrapport og seleksjon kan overvurdere eller skjevfordele sammenhenger", boundary: "retningslinjer er ikke individuell behandling", test: "kombiner objektive og selvrapporterte mål med naturlige eller kontrollerte intervensjoner" },
  hook_sport_sosial_inkludering_tilgang: { main: "kapabilitets- og tilgangsperspektivet", rival: "lik formell adgang er tilstrekkelig", mechanism: "ressurser, tid, trygghet, kostnad, transport og sosial støtte former faktisk mulighet til å delta", critique: "inkludering kan bli et mål uten å undersøke kvalitet, makt og tilhørighet", boundary: "må måle faktisk bruk og erfaring, ikke bare tilbud", test: "sammenlign formell tilgang med deltakelse, frafall og opplevde barrierer" },
  hook_sport_natur_klima_baerekraft: { main: "livsløps- og klimasystemperspektiv", rival: "enkeltstående grønt tiltak som tilstrekkelig", mechanism: "reise, bygg, energi, utstyr og naturinngrep skaper direkte og indirekte belastning", critique: "fotavtrykkstall er sensitive for systemgrense og datakvalitet", boundary: "funksjonell enhet, systemgrense og alternativ må angis", test: "gjør sensitivitetsanalyse av transport, levetid, energi og bruksmønster" },
  hook_sport_lek_byrom_aktive_liv: { main: "affordance- og aktivt byrom-perspektiv", rival: "formelt idrettsanlegg som eneste aktivitetsarena", mechanism: "utforming, nærhet, trygghet og sosial bruk skaper eller begrenser handlingsmuligheter", critique: "bygget miljø alene forklarer ikke deltakelse og kan ha seleksjonseffekter", boundary: "må skille tilgjengelighet, faktisk bruk og langsiktig aktivitet", test: "observer bruk før og etter endring og sammenlign med relevante kontrollområder" }
};

const areaFallbackWorks = {
  sport_grunnbegreper_lek: { title: "Homo Ludens", year: 1938, author: "Johan Huizinga" },
  sport_historie_modernisering: { title: "From Ritual to Record", year: 1978, author: "Allen Guttmann" },
  sport_arena_geografi_minner: { title: "The Production of Space", year: 1974, author: "Henri Lefebvre" },
  sport_taktikk_spillanalyse: { title: "The Foundations of Tactics and Strategy in Team Sports", year: 1999, author: "Gréhaigne, Godbout og Bouthier" },
  sport_ferdighetslaring_motorikk: { title: "Constraints on the Development of Coordination", year: 1986, author: "Karl Newell" },
  sport_trening_fysiologi: { title: "Textbook of Work Physiology", year: 1970, author: "Åstrand og Rodahl" },
  sport_biomekanikk_data: { title: "Biomechanics and Motor Control of Human Movement", year: 1990, author: "David A. Winter" },
  sport_psykologi_coaching: { title: "Self-Efficacy: The Exercise of Control", year: 1997, author: "Albert Bandura" },
  sport_pedagogikk_barn: { title: "Sport Education", year: 1994, author: "Daryl Siedentop" },
  sport_organisasjon_okonomi: { title: "Winners and Losers: The Business Strategy of Football", year: 1999, author: "Szymanski og Kuypers" },
  sport_supportere_media: { title: "Football: A Sociology of the Global Game", year: 1999, author: "Richard Giulianotti" },
  sport_ulikhet_inkludering: { title: "Sporting Females", year: 1994, author: "Jennifer Hargreaves" },
  sport_etikk_teknologi: { title: "Fair Play in Sport", year: 2002, author: "Sigmund Loland" },
  sport_helse_samfunn_miljo: { title: "WHO Guidelines on Physical Activity and Sedentary Behaviour", year: 2020, author: "World Health Organization" }
};

const [emners, hookFile, thinkerFile, conceptFile, claimFile, qualityManifest, evidenceManifest, profile] = await Promise.all([
  readJson(paths.emner), readJson(paths.hooks), readJson(paths.thinkers), readJson(paths.concepts),
  readJson(paths.claims), readJson(paths.qualityManifest), readJson(paths.evidenceManifest), readJson(paths.profile)
]);

const hooks = hookFile.hooks || [];
const thinkers = thinkerFile.thinkers || [];
const concepts = conceptFile.concepts || [];
const claims = claimFile.claims || [];
const thinkerMap = new Map(thinkers.map((item) => [item.thinker_id, item]));
const conceptMap = new Map(concepts.map((item) => [item.concept_id, item]));

const missingBlueprints = hooks.filter((hook) => !hookBlueprints[hook.hook_id]).map((hook) => hook.hook_id);
if (missingBlueprints.length) throw new Error(`Mangler V6-blueprint for hooks: ${missingBlueprints.join(", ")}`);

const claimText = (claim) => [claim.statement, ...(claim.contexts || []), claim.quiz_use].join(" ");
const hookText = (hook) => [hook.hook_id, hook.title, hook.problem, ...(hook.concept_ids || []).map((id) => conceptMap.get(id)?.label || id)].join(" ");

const theoryUnits = hooks.map((hook) => {
  const blueprint = hookBlueprints[hook.hook_id];
  const linkedThinkers = (hook.thinker_ids || []).map((id) => thinkerMap.get(id)).filter(Boolean);
  const linkedWorks = linkedThinkers.flatMap((thinker) => (thinker.selected_works || []).map((work) => ({
    thinker_id: thinker.thinker_id,
    author: thinker.name,
    title: work.title,
    year: work.year ?? null,
    source_role: "linked_thinker_registry"
  })));
  const fallback = areaFallbackWorks[hook.area_id];
  const primaryWorks = linkedWorks.length ? linkedWorks.slice(0, 8) : [{ ...fallback, source_role: "area_canonical_fallback" }];
  const scoredClaims = claims.map((claim) => ({ claim, score: overlapScore(hookText(hook), claimText(claim)) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.claim.claim_id.localeCompare(b.claim.claim_id));
  const evidenceClaimIds = scoredClaims.slice(0, 3).map((entry) => entry.claim.claim_id);
  const pairs = hook.comparison_pairs || [];
  const mainThinkers = unique([pairs[0]?.[0], ...(hook.thinker_ids || []).slice(0, 2)]).slice(0, 3);
  const rivalThinkers = unique([pairs[0]?.[1], pairs[1]?.[1], ...(hook.thinker_ids || []).slice(2, 5)]).slice(0, 3);
  return {
    theory_unit_id: hook.hook_id.replace("hook_sport_", "theory_sport_"),
    hook_id: hook.hook_id,
    area_id: hook.area_id,
    title: hook.title,
    central_problem: hook.problem,
    main_theory: blueprint.main,
    rival_or_alternative: blueprint.rival,
    mechanism: blueprint.mechanism,
    main_thinker_ids: mainThinkers,
    rival_thinker_ids: rivalThinkers,
    concept_ids: hook.concept_ids || [],
    method_ids: hook.method_ids || [],
    primary_works: primaryWorks,
    core_assumptions: [
      `${blueprint.main} må kunne knyttes til et konkret sportscase og en eksplisitt analyseenhet.`,
      `Forklaringen står eller faller med mekanismen: ${blueprint.mechanism}.`,
      `Alternativet ${blueprint.rival} skal vurderes på samme evidensgrunnlag.`
    ],
    rival_assumptions: [
      `${blueprint.rival} tilbyr en reell alternativ forklaring og skal ikke brukes som stråmann.`,
      "Teorier sammenlignes på samme utfall, tidsnivå og datagrunnlag."
    ],
    criticism: [blueprint.critique, "Teoretikernavn eller begrepsetikett er ikke i seg selv evidens for mekanismen."],
    boundary_conditions: [blueprint.boundary, "Generalisering krever eksplisitt populasjon, idrett, nivå, periode og kontekst."],
    discriminating_evidence: [blueprint.test, "Oppgi hvilken observasjon som ville svekke hovedforklaringen relativt til alternativet."],
    evidence_claim_ids: evidenceClaimIds,
    evidence_coverage: evidenceClaimIds.length ? "linked_partial" : "pending_claim_materialization",
    source_basis_status: linkedWorks.length ? "linked_primary_works" : "canonical_area_fallback",
    question_operations: [
      `Start i problemet «${hook.problem}» og identifiser mekanismen som ${blueprint.main} forventer.`,
      `Sammenlign ${blueprint.main} med ${blueprint.rival} på samme case og analyseenhet.`,
      `Test forklaringen ved å bruke følgende skilleevidens: ${blueprint.test}.`,
      `Angi minst én kritikk og denne bruksgrensen før konklusjon: ${blueprint.boundary}.`
    ],
    status: "canonical_theory_depth_v6"
  };
});

const unitMap = new Map(theoryUnits.map((unit) => [unit.hook_id, unit]));
for (const hook of hooks) {
  const unit = unitMap.get(hook.hook_id);
  hook.theory_unit_id = unit.theory_unit_id;
  hook.theory_depth_version = "6.0";
  hook.question_moves = unit.question_operations;
  hook.theory_comparison_required = true;
  hook.primary_work_required = true;
  hook.boundary_condition_required = true;
  hook.evidence_status = unit.evidence_coverage;
}
hookFile.version = "6.0";
hookFile.updated_at = "2026-07-25";
hookFile.purpose = `${hookFile.purpose} V6 krever nå eksplisitt hovedteori, rival, mekanisme, primærverk, kritikk, bruksgrense og skilleevidens for hver hook.`;

for (const thinker of thinkers) {
  const workCount = (thinker.selected_works || []).length;
  const isPractice = thinker.figure_type && thinker.figure_type !== "scholar";
  thinker.theory_readiness = workCount > 0 ? "primary_source_ready" : (isPractice ? "practice_context_only" : "contextual_until_work_documented");
  thinker.direct_theory_use_allowed = workCount > 0 && !isPractice;
  thinker.source_role = workCount > 0 ? "documented_theory_or_method_source" : "contextual_or_practice_source";
  thinker.work_documentation_count = workCount;
  thinker.use_rule = workCount > 0
    ? "Bruk personen gjennom dokumentert verk, teori, metode eller eksplisitt praksiskilde; navnet alene er ikke en kunnskapstest."
    : "Bruk personen kun som kontekst eller praksisfigur til et verk eller en kilde er dokumentert; navnet alene er ikke en kunnskapstest.";
}
thinkerFile.version = "6.0";
thinkerFile.updated_at = "2026-07-25";
thinkerFile.selection_principles = unique([
  ...(thinkerFile.selection_principles || []),
  "Aktive personer uten dokumentert verk er kontekstuelle inntil verkgrunnlaget er materialisert.",
  "Direkte teoribruk krever minst ett dokumentert verk og en presis problemkobling."
]);

const candidateHooksForEmne = (emne) => {
  const domain = emne.domain || emne.area_id || emne.logic_family;
  const sameDomain = hooks.filter((hook) => hook.legacy_integration?.legacy_domain_id === domain);
  return sameDomain.length ? sameDomain : hooks;
};
const emneText = (emne) => [
  emne.emne_id, emne.title, emne.definition, emne.why_it_matters,
  ...(emne.keywords || []), ...(emne.key_concepts || []), ...(emne.core_concepts || []),
  ...(emne.primary_theory_hooks || []), ...(emne.conflicts || [])
].join(" ");

const activeEmners = emners.filter((emne) => emne.status === "active" || emne.canonical_status === "canonical");
const matrixEntries = activeEmners.map((emne) => {
  const candidates = candidateHooksForEmne(emne).map((hook) => {
    let score = overlapScore(emneText(emne), hookText(hook));
    if ((emne.primary_theory_hooks || []).some((value) => normalize(hook.hook_id).includes(normalize(value)))) score += 8;
    if (hook.legacy_integration?.legacy_domain_id === (emne.domain || emne.area_id)) score += 4;
    return { hook, score };
  }).sort((a, b) => b.score - a.score || a.hook.hook_id.localeCompare(b.hook.hook_id));
  const primaryHooks = candidates.slice(0, 2).map((entry) => entry.hook.hook_id);
  const secondaryHooks = candidates.slice(2, 4).map((entry) => entry.hook.hook_id);
  const units = primaryHooks.map((id) => unitMap.get(id));
  const evidenceClaims = unique(units.flatMap((unit) => unit?.evidence_claim_ids || []));
  const workRefs = unique(units.flatMap((unit) => (unit?.primary_works || []).map((work) => `${work.author}: ${work.title} (${work.year ?? "u.å."})`)));
  const coverageStatus = primaryHooks.length >= 2 && units.every((unit) => unit?.main_theory && unit?.rival_or_alternative && unit?.mechanism) && workRefs.length
    ? (evidenceClaims.length ? "theory_and_partial_evidence_ready" : "theory_ready_evidence_pending")
    : "insufficient_theory_coverage";
  return {
    emne_id: emne.emne_id,
    title: emne.title,
    domain: emne.domain || emne.area_id || null,
    emne_role: emne.emne_role || null,
    primary_hook_ids: primaryHooks,
    secondary_hook_ids: secondaryHooks,
    theory_unit_ids: primaryHooks.map((id) => unitMap.get(id)?.theory_unit_id).filter(Boolean),
    main_theories: units.map((unit) => unit?.main_theory).filter(Boolean),
    rival_theories: units.map((unit) => unit?.rival_or_alternative).filter(Boolean),
    primary_work_refs: workRefs,
    evidence_claim_ids: evidenceClaims,
    theory_coverage_status: coverageStatus,
    evidence_coverage_status: evidenceClaims.length ? "partial_linked" : "pending",
    mapping_basis: "legacy_domain_plus_semantic_overlap",
    top_scores: candidates.slice(0, 4).map((entry) => ({ hook_id: entry.hook.hook_id, score: entry.score })),
    production_rule: "Quizproduksjon skal velge minst én primær teorienhet og forklare mekanisme, rival, kritikk og bruksgrense før evidenspåstand brukes."
  };
});

const hookIds = new Set(hooks.map((hook) => hook.hook_id));
for (const claim of claims) {
  const scored = hooks.map((hook) => ({ hook, score: overlapScore(claimText(claim), hookText(hook)) }))
    .sort((a, b) => b.score - a.score || a.hook.hook_id.localeCompare(b.hook.hook_id));
  const selected = scored.filter((entry) => entry.score > 0).slice(0, 3);
  const chosen = selected.length ? selected : scored.slice(0, 1);
  claim.theory_hook_ids = chosen.map((entry) => entry.hook.hook_id).filter((id) => hookIds.has(id));
  claim.theory_unit_ids = claim.theory_hook_ids.map((id) => unitMap.get(id)?.theory_unit_id).filter(Boolean);
  claim.theory_coverage_status = "mapped_v6";
}
claimFile.version = "1.1";
claimFile.updated_at = "2026-07-25";

const coverageCounts = matrixEntries.reduce((acc, entry) => {
  acc[entry.theory_coverage_status] = (acc[entry.theory_coverage_status] || 0) + 1;
  return acc;
}, {});
const linkedWorkThinkers = thinkers.filter((item) => item.work_documentation_count > 0).length;
const contextualThinkers = thinkers.length - linkedWorkThinkers;
const hooksWithEvidence = theoryUnits.filter((unit) => unit.evidence_claim_ids.length).length;

const depthManifest = {
  version: "6.0",
  subject_id: "sport",
  type: "theory_depth_and_coverage_manifest",
  status: "canonical_theory_depth_layer",
  updated_at: "2026-07-25",
  files: {
    theory_units: "theory_units_sport_canonical_v6.json",
    emne_coverage_matrix: "emne_theory_coverage_sport_v6.json",
    enriched_hooks: "theory_hooks_sport_canonical_v5.json",
    enriched_thinkers: "teoretikere_sport_canonical_v5.json",
    claims_with_theory_mapping: "claims_sport_canonical_v1.json",
    builder: "../../../tools/build-sport-theory-depth-v6.mjs",
    validator: "../../../tools/validate-sport-theory-depth-v6.mjs",
    report: "../../../reports/sport-theory-depth-validation.json",
    readme: "../../../reports/sport-theory-depth-lift.md"
  },
  counts: {
    active_emners: activeEmners.length,
    theory_hooks: hooks.length,
    theory_units: theoryUnits.length,
    mapped_emners: matrixEntries.length,
    hooks_with_evidence_claims: hooksWithEvidence,
    documented_work_thinkers: linkedWorkThinkers,
    contextual_or_practice_thinkers: contextualThinkers
  },
  coverage_counts: coverageCounts,
  invariants: [
    "Hvert aktivt emne skal ha minst to primære hooks og tilhørende teorienheter.",
    "Hver hook skal ha eksplisitt hovedteori, rival, mekanisme, primærverk, kritikk, bruksgrense og skilleevidens.",
    "Aktive personer uten dokumentert verk kan ikke brukes som direkte teori-autoritet.",
    "Evidenspåstander skal være koblet til teorihooks og teorienheter.",
    "Evidenslaget forblir delvis dekket til alle hooks har materialiserte claim-kjeder."
  ]
};

qualityManifest.version = "6.0";
qualityManifest.updated_at = "2026-07-25";
qualityManifest.theory_depth_layer = {
  manifest: "sport_theory_depth_manifest_v6.json",
  theory_units: "theory_units_sport_canonical_v6.json",
  emne_coverage_matrix: "emne_theory_coverage_sport_v6.json",
  validator: "../../../tools/validate-sport-theory-depth-v6.mjs",
  report: "../../../reports/sport-theory-depth-validation.json"
};
qualityManifest.counts.active_emners = activeEmners.length;
qualityManifest.counts.theory_units = theoryUnits.length;
qualityManifest.counts.emners_theory_mapped = matrixEntries.length;
qualityManifest.counts.hooks_with_evidence_claims = hooksWithEvidence;
qualityManifest.production_invariants = unique([
  ...(qualityManifest.production_invariants || []),
  "Hvert emne må bruke en validert V6-teorienhet; prefikskontroll alene er ikke teoridekning.",
  "Hver teoribruk skal angi rival, kritikk og bruksgrense, ikke bare teoretikernavn.",
  "Evidenslaget er delvis til alle teorihooks har sporbare claim-kjeder."
]);

evidenceManifest.version = "1.1";
evidenceManifest.status = "canonical_scientific_evidence_layer_partial_coverage";
evidenceManifest.updated_at = "2026-07-25";
evidenceManifest.integration.theory_depth_manifest = "sport_theory_depth_manifest_v6.json";
evidenceManifest.coverage_status = {
  state: "partial",
  theory_prerequisite: "validated_v6",
  hooks_total: hooks.length,
  hooks_with_claim_links: hooksWithEvidence,
  rule: "Ingen påstand om full evidensdekning før alle teorihooks har minst én kontrollert claim-kjede."
};
evidenceManifest.invariants = unique([
  ...(evidenceManifest.invariants || []),
  "Alle claims skal være koblet til minst én V6-teorienhet.",
  "Evidensdekning og teoridekning rapporteres separat."
]);

profile.theory_depth_layer = {
  version: "6.0",
  manifest: `${sportDir}/sport_theory_depth_manifest_v6.json`,
  theory_units: `${sportDir}/theory_units_sport_canonical_v6.json`,
  emne_coverage_matrix: `${sportDir}/emne_theory_coverage_sport_v6.json`,
  required_for_all_sport_questions: true,
  rule: "Velg validert emne, primær teorienhet og eksplisitt mekanisme. Ved teorispørsmål kreves rival, kritikk og bruksgrense."
};
profile.evidence_layer.coverage_status = "partial_until_all_theory_hooks_have_claim_chains";
profile.question_quality.required = unique([
  ...(profile.question_quality?.required || []),
  "gyldig V6 theory_unit_id fra emne–teori-matrisen",
  "hovedteori, rival, mekanisme og bruksgrense ved teoribruk"
]);
profile.category_rules = unique([
  ...(profile.category_rules || []),
  "Prefikset em_sport_ beviser ikke teoridekning; emnet må finnes i V6-matrisen.",
  "Bruk evidenspåstand først etter at teorienheten og dens alternative forklaring er etablert."
]);

const unitsFile = {
  version: "6.0",
  subject_id: "sport",
  type: "canonical_theory_units",
  status: "canonical_theory_depth_layer",
  updated_at: "2026-07-25",
  theory_units: theoryUnits
};
const matrixFile = {
  version: "6.0",
  subject_id: "sport",
  type: "emne_theory_coverage_matrix",
  status: "canonical_theory_depth_layer",
  updated_at: "2026-07-25",
  mapping_method: "legacy domain match followed by semantic overlap; each active emne receives two primary and up to two secondary hooks",
  emners: matrixEntries
};

const insufficient = matrixEntries.filter((entry) => entry.theory_coverage_status === "insufficient_theory_coverage");
const report = {
  status: insufficient.length ? "failed" : "passed",
  version: "6.0",
  subject_id: "sport",
  counts: depthManifest.counts,
  coverage_counts: coverageCounts,
  gates: {
    every_active_emne_mapped: matrixEntries.length === activeEmners.length,
    every_emne_has_two_primary_hooks: matrixEntries.every((entry) => entry.primary_hook_ids.length >= 2),
    every_hook_has_theory_unit: theoryUnits.length === hooks.length,
    every_unit_has_main_rival_mechanism: theoryUnits.every((unit) => unit.main_theory && unit.rival_or_alternative && unit.mechanism),
    every_unit_has_primary_work: theoryUnits.every((unit) => unit.primary_works.length >= 1),
    every_unit_has_criticism_and_boundary: theoryUnits.every((unit) => unit.criticism.length && unit.boundary_conditions.length),
    generic_question_moves_replaced: hooks.every((hook) => hook.question_moves?.some((move) => move.includes(unitMap.get(hook.hook_id).main_theory))),
    thinkers_without_works_not_direct_authority: thinkers.filter((item) => item.work_documentation_count === 0).every((item) => item.direct_theory_use_allowed === false),
    all_claims_mapped_to_theory_units: claims.every((claim) => claim.theory_unit_ids?.length >= 1),
    evidence_layer_explicitly_partial: evidenceManifest.coverage_status?.state === "partial"
  },
  failures: insufficient.map((entry) => ({ emne_id: entry.emne_id, reason: entry.theory_coverage_status }))
};

const reportMd = `# Sport & lek – teoridybde og emnedekning V6\n\nStatus: **${report.status === "passed" ? "validert" : "feilet"}**\n\n## Omfang\n\n- ${activeEmners.length} aktive emner kontrollert\n- ${hooks.length} teorihooks\n- ${theoryUnits.length} eksplisitte teorienheter\n- ${linkedWorkThinkers} personer med dokumenterte verk\n- ${contextualThinkers} personer begrenset til kontekst eller praksiskilde\n- ${hooksWithEvidence} av ${hooks.length} hooks har kobling til eksisterende evidensclaims\n\n## Hva V6 endrer\n\nHver hook har nå hovedteori, rival eller alternativ, forklaringsmekanisme, primærverk, kritikk, bruksgrense og skilleevidens. De generiske spørsmålsinstruksjonene er erstattet med hook-spesifikke analytiske operasjoner.\n\nAlle aktive emner er materialisert i en egen emne–teori-matrise med minst to primære hooks. ID-prefikset \`em_sport_\` regnes ikke lenger som bevis på teoridekning.\n\nPersoner uten dokumentert verk er ikke fjernet, men de er eksplisitt begrenset til kontekst- eller praksisbruk og kan ikke brukes som direkte teori-autoritet.\n\n## Evidensstatus\n\nEvidenslaget er nå korrekt markert som **delvis**. Det kan håndheve kilde-, metode- og sikkerhetskrav, men full dekning kan ikke hevdes før alle ${hooks.length} teorihooks har minst én kontrollert claim-kjede.\n\n## Valideringsporter\n\n${Object.entries(report.gates).map(([key, value]) => `- ${value ? "PASS" : "FAIL"}: ${key}`).join("\n")}\n`;

await Promise.all([
  writeJson(paths.hooks, hookFile),
  writeJson(paths.thinkers, thinkerFile),
  writeJson(paths.claims, claimFile),
  writeJson(paths.units, unitsFile),
  writeJson(paths.matrix, matrixFile),
  writeJson(paths.manifest, depthManifest),
  writeJson(paths.qualityManifest, qualityManifest),
  writeJson(paths.evidenceManifest, evidenceManifest),
  writeJson(paths.profile, profile),
  writeJson(paths.reportJson, report)
]);
await mkdir(path.dirname(path.resolve(root, paths.reportMd)), { recursive: true });
await writeFile(path.resolve(root, paths.reportMd), reportMd, "utf8");

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.status === "passed" ? 0 : 1;
