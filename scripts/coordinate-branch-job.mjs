#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_katastrofer_brudd_ulykker';
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, {recursive: true});

const C = (label, definition, conceptType, related, distinguish, misuse, indicators, sources) => ({
  label,
  definition,
  concept_type: conceptType,
  broader_concepts: [],
  narrower_concepts: [],
  related_concepts: related,
  distinguish_from: distinguish,
  common_misuse: [misuse],
  indicators,
  source_requirements: sources,
  status: 'canonical_v5_5_curated'
});

const conceptSpecs = {
  con_his_beredskap: C(
    'beredskap',
    'Beredskap er forhåndsorganiserte ressurser, fullmakter, øvelser og varslingsordninger som skal redusere skade og opprettholde kritiske funksjoner når en definert fare blir virkelig.',
    'preparedness_concept',
    ['con_his_kriseledelse', 'con_his_sikkerhet', 'con_his_institusjonell_laering'],
    ['con_his_resiliens'],
    'Å slutte fra en vedtatt plan til faktisk beredskap uten å dokumentere bemanning, materiell, øvelser, responstid og gjennomføring under hendelsen.',
    ['datert beredskapsplan og ansvarsdeling', 'tilgjengelige ressurser og øvelser', 'varsling og faktisk respons'],
    ['planverk, øvingsrapport, vaktjournal og hendelseslogg', 'kontrollkilde som viser forskjellen mellom formell plan og operativ kapasitet']
  ),
  con_his_branner: C(
    'brannkatastrofer',
    'Brannkatastrofer er historiske brannforløp der antennelse, bygningsmateriale, tetthet, vær, slokkeberedskap og sosial eksponering sammen gir omfattende tap eller varig stedsendring.',
    'fire_disaster_concept',
    ['con_his_fare', 'con_his_sarbarhet', 'con_his_gjenoppbygging'],
    ['con_his_ulykker'],
    'Å forklare en storbrann bare med antennelsesårsaken og overse byform, materialer, vind, varsling, slokking og ulik evne til å evakuere og gjenoppbygge.',
    ['brannens utbredelse og varighet', 'tap av liv, bygg og funksjoner', 'endret regulering eller bebyggelse etterpå'],
    ['brannprotokoll, kart, foto, forsikrings- og avisdata', 'kontrollkilde for skadeomfang, berørte grupper og etterfølgende tiltak']
  ),
  con_his_bygges: C(
    'gjenoppbyggingspolitikk',
    'Gjenoppbyggingspolitikk er prioriteringer om hva, hvor og for hvem som skal bygges etter ødeleggelse, og omfatter finansiering, regulering, standarder, eiendom og symbolsk nasjons- eller stedsbygging.',
    'reconstruction_policy_concept',
    ['con_his_gjenoppbygging', 'con_his_fellesskap', 'con_his_minne'],
    ['con_his_igjen'],
    'Å omtale gjenoppbygging som teknisk nødvendighet uten å undersøke hvilke alternativer, grupper, steder og fortellinger som ble prioritert eller utelatt.',
    ['plan- og budsjettvedtak', 'fordeling av bolig, infrastruktur og erstatning', 'symbolske og identitetsbyggende valg'],
    ['gjenoppbyggingsplan, budsjett, byggesak og politisk debatt', 'kilde fra berørte eiere, beboere eller virksomheter']
  ),
  con_his_demokratisk: C(
    'demokratisk motstandskraft',
    'Demokratisk motstandskraft er institusjoners og borgeres evne til å opprettholde rettigheter, åpenhet, representasjon og fredelig konfliktbehandling under og etter terror, krise eller unntakstilstand.',
    'democratic_resilience_concept',
    ['con_his_terror', 'con_his_sikkerhet', 'con_his_fellesskap'],
    ['con_his_beredskap'],
    'Å bruke samlende retorikk eller høy valgdeltakelse som tilstrekkelig bevis på demokratisk motstandskraft uten å undersøke rettigheter, beslutningsprosesser og varige kontrolltiltak.',
    ['videreførte demokratiske prosedyrer', 'offentlig debatt og rettighetsvern', 'begrensning eller reversering av unntakstiltak'],
    ['lov- og vedtaksdata, parlamentsdebatt og domstolskontroll', 'kilde om sivilsamfunnets og berørte gruppers deltakelse']
  ),
  con_his_eksponering: C(
    'eksponering',
    'Eksponering er graden og varigheten mennesker, bygg, økosystemer eller funksjoner befinner seg i kontakt med en konkret fare før, under eller etter en hendelse.',
    'hazard_exposure_concept',
    ['con_his_fare', 'con_his_sarbarhet', 'con_his_ulik'],
    ['con_his_sarbarhet'],
    'Å bruke eksponering som synonym for sårbarhet; to grupper kan være like utsatt for en fare, men ha svært ulik evne til å tåle og håndtere den.',
    ['geografisk eller tidsmessig nærhet til fare', 'antall personer, bygg eller funksjoner i faresonen', 'varighet og intensitet'],
    ['hendelseskart, befolknings- og bygningsdata, målinger eller rutejournaler', 'kontrollkilde for faktisk tilstedeværelse på hendelsestidspunktet']
  ),
  con_his_endrer: C(
    'endringsvirkning',
    'Endringsvirkning er den dokumenterbare forskjellen en katastrofe eller krise skaper i institusjoner, praksiser, bebyggelse, rettigheter eller forventninger sammenlignet med situasjonen før hendelsen.',
    'historical_effect_concept',
    ['con_his_brudd', 'con_his_etter', 'con_his_institusjonell_laering'],
    ['con_his_katastrofe'],
    'Å anta at en dramatisk hendelse automatisk skapte varig endring uten før- og etterkilder som viser hva som faktisk ble videreført, reversert eller omformet.',
    ['målbar forskjell før og etter', 'identifiserbar mekanisme fra hendelse til endring', 'varighet utover akuttfasen'],
    ['sammenlignbare regler, budsjetter, kart eller praksiskilder', 'kontrollkilde som tester konkurrerende forklaringer']
  ),
  con_his_etter: C(
    'etterkriseperiode',
    'Etterkriseperiode er et analytisk avgrenset tidsrom etter akuttfasen der skade, ansvar, gjenoppbygging, minne og institusjonelle endringer fortsatt forhandles og får varig form.',
    'post_crisis_period_concept',
    ['con_his_gjenoppbygging', 'con_his_gransking', 'con_his_minne'],
    ['con_his_ettertid'],
    'Å sette etterkrisens start og slutt etter kalenderen alene uten å vise når akutt innsats opphørte og ordinære eller nye institusjoner faktisk tok over.',
    ['overgang fra akutt respons til langsiktig tiltak', 'gransking, erstatning og gjenoppbygging', 'nye regler eller minnepraksiser'],
    ['hendelseslogg, vedtak, budsjett og tidslinje', 'kilde som dokumenterer ulike gruppers overgang ut av krisen']
  ),
  con_his_fare: C(
    'fare',
    'Fare er en prosess, tilstand eller hendelsestype med potensial til å påføre skade, analysert uavhengig av hvor mange som er eksponert og hvor sårbare de er.',
    'hazard_concept',
    ['con_his_eksponering', 'con_his_sarbarhet', 'con_his_sikkerhet'],
    ['con_his_katastrofe'],
    'Å kalle en naturprosess eller teknisk tilstand en katastrofe før skade, eksponering og samfunnsmessige konsekvenser er dokumentert.',
    ['identifisert skadeprosess', 'sannsynlig intensitet og geografisk rekkevidde', 'historiske varsler eller kjente mekanismer'],
    ['måling, teknisk rapport, naturhistorisk kilde eller hendelsesregister', 'kilde som skiller potensial fra faktisk skade']
  ),
  con_his_fellesskap: C(
    'krisefellesskap',
    'Krisefellesskap er midlertidige eller varige former for samarbeid, omsorg, mobilisering og identitet som oppstår eller omformes når mennesker møter felles fare, tap og gjenoppbygging.',
    'crisis_community_concept',
    ['con_his_gjenoppbygging', 'con_his_minne', 'con_his_demokratisk'],
    ['con_his_institusjoner'],
    'Å romantisere solidaritet etter katastrofer og overse konflikt, ulik tilgang til hjelp, ekskludering og at fellesskapet kan oppløses når akuttfasen er over.',
    ['frivillig mobilisering og gjensidig hjelp', 'felles ritualer eller organisasjoner', 'konflikt om representasjon og ressurser'],
    ['organisasjonsarkiv, dagbok, intervju, avis og møteprotokoll', 'kilde fra grupper som stod innenfor og utenfor det dominerende fellesskapet']
  ),
  con_his_fordypning: C(
    'statsborgerskap',
    'Statsborgerskap er en historisk regulert juridisk medlemsstatus som fordeler rettigheter, plikter, beskyttelse og politisk adgang, og som kan få særskilt betydning under krise, evakuering og gjenoppbygging.',
    'legal_membership_concept',
    ['con_his_demokratisk', 'con_his_regler', 'con_his_fellesskap'],
    ['con_his_minne'],
    'Å bruke statsborgerskap som synonym for kulturell tilhørighet eller anta at formell status ga lik faktisk tilgang til sikkerhet, hjelp og erstatning.',
    ['lovfestet medlemsstatus', 'rettigheter og plikter i den undersøkte perioden', 'dokumentert betydning for adgang til hjelp eller deltakelse'],
    ['statsborgerlov, register, vedtak og rettspraksis', 'kilde om faktisk behandling av personer med ulik status']
  ),
  con_his_gjenoppbygging: C(
    'gjenoppbygging',
    'Gjenoppbygging er den materielle, institusjonelle, økonomiske og sosiale reorganiseringen etter ødeleggelse, og omfatter både tilbakeføring, nybygging og bevisst brudd med førtilstanden.',
    'reconstruction_process_concept',
    ['con_his_bygges', 'con_his_igjen', 'con_his_minne'],
    ['con_his_resiliens'],
    'Å måle gjenoppbygging bare i ferdige bygg eller produksjonstall uten å undersøke bosetting, rettigheter, gjeld, sosialt tap og hvem som ikke kunne vende tilbake.',
    ['fysisk reparasjon eller nybygging', 'reorganiserte tjenester og institusjoner', 'tilbakeflytting, erstatning og nye fordelingsmønstre'],
    ['plan, byggeregnskap, eiendoms- og befolkningsdata', 'kilde om berørte hushold og virksomheters faktiske situasjon']
  ),
  con_his_gransking: C(
    'gransking',
    'Gransking er en formalisert undersøkelse som rekonstruerer hendelsesforløp, årsaker, ansvar og forbedringsbehov gjennom mandat, bevisinnsamling og offentlig eller intern rapportering.',
    'inquiry_concept',
    ['con_his_skyld', 'con_his_ansvar', 'con_his_institusjonell_laering'],
    ['con_his_laering'],
    'Å behandle en granskningsrapport som nøytral fasit uten å analysere mandat, bevisutvalg, taushetsregler, partsinteresser og hva rapporten ikke kunne undersøke.',
    ['formelt mandat og sammensetning', 'dokumentert bevisgrunnlag', 'funn, anbefalinger og oppfølging'],
    ['mandat, høringer, vedlegg og sluttrapport', 'kontrollkilde fra berørte parter eller senere evaluering av oppfølgingen']
  ),
  con_his_igjen: C(
    'gjenetablering',
    'Gjenetablering er prosessen der hushold, virksomheter, tjenester eller institusjoner kommer tilbake eller finner en ny varig plass etter evakuering, ødeleggelse eller langvarig avbrudd.',
    'reestablishment_concept',
    ['con_his_gjenoppbygging', 'con_his_resiliens', 'con_his_fellesskap'],
    ['con_his_bygges'],
    'Å likestille fysisk nybygg med gjenetablering uten å dokumentere om mennesker, arbeid, nettverk og tjenester faktisk kom tilbake på bærekraftige vilkår.',
    ['retur eller varig relokalisering', 'gjenopptatt tjeneste eller virksomhet', 'stabile bolig- og inntektsvilkår'],
    ['adresse-, virksomhets- og tjenestedata over tid', 'intervju eller sakskilde om hvorfor retur lyktes eller mislyktes']
  ),
  con_his_institusjonell: C(
    'institusjonell kapasitet',
    'Institusjonell kapasitet er en organisasjons faktiske evne til å oppdage fare, fatte beslutninger, koordinere ressurser og følge opp læring under gitte juridiske, økonomiske og kompetansemessige vilkår.',
    'institutional_capacity_concept',
    ['con_his_beredskap', 'con_his_kriseledelse', 'con_his_institusjonell_laering'],
    ['con_his_institusjoner'],
    'Å slutte fra formelt ansvar eller organisasjonskart til faktisk kapasitet uten å dokumentere personell, kompetanse, informasjon, materiell og samarbeid.',
    ['bemanning og kompetanse', 'tilgang til informasjon og ressurser', 'koordinering og beslutningshastighet'],
    ['organisasjonsplan, budsjett, vaktjournal og hendelseslogg', 'evaluering som sammenligner mandat med faktisk ytelse']
  ),
  con_his_institusjonell_laering: C(
    'institusjonell læring',
    'Institusjonell læring er varig endring i regler, organisering, kompetanse eller praksis som kan spores til erfaringer, granskinger eller øvelser etter en hendelse.',
    'institutional_learning_concept',
    ['con_his_gransking', 'con_his_laering', 'con_his_beredskap'],
    ['con_his_resiliens'],
    'Å telle anbefalinger eller nye dokumenter som læring uten å vise implementering, øvelse, ressursendring og om den nye praksisen faktisk holdt over tid.',
    ['endret regel eller organisasjon', 'implementert opplæring og ressursbruk', 'testet praksis i senere øvelse eller hendelse'],
    ['oppfølgingsplan, budsjett, instruks og øvingsrapport', 'senere evaluering som dokumenterer faktisk atferdsendring']
  ),
  con_his_katastrofe: C(
    'katastrofe',
    'Katastrofe er et historisk forløp der fare møter eksponering og sårbarhet slik at tap og funksjonsbrudd overstiger berørte samfunns eller institusjoners ordinære håndteringsevne.',
    'disaster_concept',
    ['con_his_fare', 'con_his_eksponering', 'con_his_sarbarhet'],
    ['con_his_ulykker'],
    'Å definere katastrofen utelukkende fra natur- eller teknologihendelsen og dermed skjule hvordan bosetting, ulikhet, politikk og institusjoner produserte skadeomfanget.',
    ['omfattende tap eller funksjonsbrudd', 'behov for ekstraordinær respons', 'dokumentert samspill mellom fare, eksponering og sårbarhet'],
    ['hendelses- og skaderegister, befolkningsdata og institusjonsarkiv', 'kilde fra berørte grupper som viser levd konsekvens']
  ),
  con_his_katastrofer: C(
    'katastrofemønstre',
    'Katastrofemønstre er sammenlignbare historiske regulariteter i hvordan ulike farer, samfunnsstrukturer og institusjoner produserer tap, respons og ettervirkninger på tvers av hendelser.',
    'comparative_disaster_concept',
    ['con_his_katastrofe', 'con_his_ulik', 'con_his_institusjonell_laering'],
    ['con_his_branner'],
    'Å samle svært forskjellige katastrofer i én kategori uten felles mål for fare, skala, eksponering, tidsforløp og kildedekning.',
    ['gjentatte mekanismer i flere hendelser', 'sammenlignbare tap- og responsmål', 'dokumenterte forskjeller mellom steder og grupper'],
    ['standardisert hendelsesoversikt og casekilder', 'metodebeskrivelse som begrunner sammenlignbarhet og avvik']
  ),
  con_his_kriseledelse: C(
    'kriseledelse',
    'Kriseledelse er tidskritisk organisering av informasjon, prioriteringer, fullmakter, kommunikasjon og ressurser under en hendelse som truer liv eller kritiske funksjoner.',
    'crisis_management_concept',
    ['con_his_beredskap', 'con_his_institusjonell', 'con_his_sikkerhet'],
    ['con_his_gjenoppbygging'],
    'Å vurdere kriseledelse bare ut fra utfallet uten å rekonstruere informasjonen, usikkerheten, ressursene og valgalternativene aktørene faktisk hadde på beslutningstidspunktet.',
    ['situasjonsforståelse og beslutningslogg', 'ressursprioritering og samvirke', 'kommunikasjon til berørte og offentlighet'],
    ['operativ logg, møtereferat, sambandsdata og pressebrief', 'uavhengig tidslinje som kontrollerer ettertidens forklaringer']
  ),
  con_his_laering: C(
    'kriselæring',
    'Kriselæring er utvikling av kunnskap og handlingsmåter gjennom erfaring, øvelse, gransking og offentlig debatt etter fare, feil eller katastrofe.',
    'crisis_learning_concept',
    ['con_his_gransking', 'con_his_institusjonell_laering', 'con_his_regler'],
    ['con_his_minne'],
    'Å kalle økt oppmerksomhet eller publisert rapport læring uten å vise hvem som lærte, hva som ble endret og hvordan ny kunnskap ble testet.',
    ['identifisert erfaring eller feil', 'ny kunnskap eller praksis', 'dokumentert anvendelse eller test'],
    ['rapport, undervisnings- og øvingsmateriale, instruks og evaluering', 'kilde som følger læringen over tid']
  ),
  con_his_langsom_vold: C(
    'langsom vold',
    'Langsom vold er kumulativ skade som utvikler seg gradvis og ofte uten ett tydelig hendelsespunkt, men som over tid rammer helse, livsgrunnlag og miljø sosialt skjevt.',
    'slow_violence_concept',
    ['con_his_langsomme', 'con_his_miljoskade', 'con_his_ulik'],
    ['con_his_katastrofe'],
    'Å bruke langsom vold som moralsk merkelapp uten å dokumentere skadebane, tidsforsinkelse, ansvarlige prosesser og hvilke grupper som bar kostnadene.',
    ['kumulativ eller forsinket skade', 'spredt ansvar og lav synlighet', 'ulik sosial eller geografisk belastning'],
    ['langtidsmålinger, helse- og miljødata, arbeids- eller forvaltningsarkiv', 'lokale vitnesbyrd og kontrollkilde for årsakskjeden']
  ),
  con_his_langsomme: C(
    'gradvise katastrofeforløp',
    'Gradvise katastrofeforløp er skadeprosesser som bygges opp gjennom gjentatt eller langvarig eksponering, institusjonell forsømmelse og terskler som først senere gjør tapene tydelige.',
    'gradual_disaster_process_concept',
    ['con_his_langsom_vold', 'con_his_miljoskade', 'con_his_eksponering'],
    ['con_his_ulykker'],
    'Å lete etter ett starttidspunkt og én utløsende årsak når skadeutviklingen består av mange små beslutninger, utslipp eller forsømmelser over lang tid.',
    ['lang tidsserie med økende belastning', 'forsinket erkjennelse eller respons', 'flere bidragende aktører og mekanismer'],
    ['måleserie, tilsyn, helse- eller produksjonsdata over tid', 'kilde som dokumenterer varsler og beslutninger underveis']
  ),
  con_his_miljoskade: C(
    'miljøskade',
    'Miljøskade er dokumentert forringelse av økosystemer, jord, vann, luft eller ressursgrunnlag med målbare økologiske og menneskelige konsekvenser over et angitt tidsrom.',
    'environmental_damage_concept',
    ['con_his_langsom_vold', 'con_his_langsomme', 'con_his_sarbarhet'],
    ['con_his_fare'],
    'Å slutte fra forurensning eller naturinngrep til skade uten førtilstand, eksponeringsvei, målbar effekt og vurdering av alternative årsaker.',
    ['endret miljøtilstand', 'identifisert påvirkningskilde og eksponeringsvei', 'økologisk, helsemessig eller økonomisk konsekvens'],
    ['miljømåling, arts- eller helsedata og utslippsarkiv', 'uavhengig kontrollkilde og eksplisitt usikkerhetsvurdering']
  ),
  con_his_minne: C(
    'historisk minne',
    'Historisk minne er sosial og institusjonell bearbeiding av fortid gjennom fortellinger, ritualer, monumenter, arkiv, undervisning og taushet, med skiftende aktører og formål.',
    'memory_concept',
    ['con_his_gjenoppbygging', 'con_his_fellesskap', 'con_his_ettertid'],
    ['con_his_gransking'],
    'Å bruke minne som synonym for hva som faktisk hendte eller anta at én offisiell markering representerer alle berørtes erfaringer.',
    ['ritual, monument, arkiv eller offentlig fortelling', 'endring i representasjon over tid', 'konflikt om synlighet, ansvar eller offerstatus'],
    ['minnesmerke-, medie-, undervisnings- og organisasjonskilder', 'samtidskilder som kan kontrollere minnefortellingens historiske påstander']
  ),
  con_his_normalulykker: C(
    'normalulykker',
    'Normalulykker er alvorlige hendelser som kan oppstå i tett koblede og komplekse tekniske systemer fordi flere uventede feil samvirker raskere enn operatører kan forstå og isolere dem.',
    'normal_accident_theory_concept',
    ['con_his_systemulykke', 'con_his_teknologi', 'con_his_sikkerhet'],
    ['con_his_ulykker'],
    'Å bruke normalulykke som påstand om at ulykker er akseptable eller uunngåelige uten å dokumentere systemets kompleksitet, kobling og konkrete feilinteraksjoner.',
    ['interaktive og uforutsette feil', 'tett kobling mellom delsystemer', 'begrenset tid og oversikt for inngrep'],
    ['teknisk systembeskrivelse, hendelseslogg og gransking', 'kontrollanalyse av alternative organisatoriske og tekniske forklaringer']
  ),
  con_his_regler: C(
    'sikkerhetsregler',
    'Sikkerhetsregler er formaliserte krav til konstruksjon, drift, kontroll og handling som skal begrense fare, eksponering eller konsekvens, og som må analyseres sammen med håndheving og praksis.',
    'safety_rule_concept',
    ['con_his_sikkerhet', 'con_his_beredskap', 'con_his_gransking'],
    ['con_his_institusjonell_laering'],
    'Å bruke regelens eksistens som bevis på sikker praksis uten å undersøke virkeområde, unntak, tilsyn, etterlevelse og sanksjoner.',
    ['datert norm eller forskrift', 'definert ansvar og kontroll', 'dokumentert etterlevelse eller brudd'],
    ['regelverk, standard, tilsynsrapport og avvikslogg', 'hendelses- eller praksiskilde som viser faktisk virkning']
  ),
  con_his_resiliens: C(
    'resiliens',
    'Resiliens er evnen et samfunn, system eller fellesskap har til å opprettholde kritiske funksjoner, tilpasse seg og reorganisere etter belastning uten at tap og kostnader skjules.',
    'resilience_concept',
    ['con_his_beredskap', 'con_his_gjenoppbygging', 'con_his_fellesskap'],
    ['con_his_institusjonell_laering'],
    'Å kalle rask normalisering resiliens uten å undersøke hvem som utførte ekstraarbeidet, hvilke tap som ble varige og om systemet bare gjenopprettet tidligere sårbarhet.',
    ['opprettholdt eller raskt gjenopprettet funksjon', 'tilpasning og reorganisering', 'fordeling av kostnader og langsiktige følger'],
    ['drifts- og tjenestedata før, under og etter krisen', 'kilde fra grupper som bar gjenopprettingsarbeid og resttap']
  ),
  con_his_sarbarhet: C(
    'sårbarhet',
    'Sårbarhet er sosialt, materielt og institusjonelt betinget tilbøyelighet til å bli skadet ved en gitt eksponering, samt begrenset evne til å beskytte seg og komme seg etterpå.',
    'vulnerability_concept',
    ['con_his_fare', 'con_his_eksponering', 'con_his_ulik'],
    ['con_his_eksponering'],
    'Å forklare sårbarhet som personlig svakhet eller naturgitt egenskap og dermed overse bolig, inntekt, rettigheter, helse, infrastruktur og institusjonell behandling.',
    ['materielle og helsemessige forutsetninger', 'tilgang til varsling, evakuering og hjelp', 'evne til økonomisk og sosial gjenoppretting'],
    ['befolknings-, bolig-, helse- og inntektsdata', 'kilde om faktisk tilgang til beskyttelse og støtte']
  ),
  con_his_sikkerhet: C(
    'sikkerhet',
    'Sikkerhet er en historisk produsert tilstand og styringsambisjon der risiko for tap begrenses gjennom teknologi, regler, kompetanse og organisering, uten at full risikofrihet kan forutsettes.',
    'safety_governance_concept',
    ['con_his_regler', 'con_his_beredskap', 'con_his_teknologi'],
    ['con_his_fare'],
    'Å bruke sikkerhet som absolutt egenskap eller resultat av ett tiltak uten å angi hvilken fare, hvilken gruppe, hvilket tidsrom og hvilke rest- eller overførte risikoer som gjelder.',
    ['mål og akseptkriterier', 'tekniske og organisatoriske barrierer', 'målt hendelses- og avviksutvikling'],
    ['regelverk, risikoanalyse, drifts- og ulykkesdata', 'kilde som dokumenterer restfare og fordelingsvirkning']
  ),
  con_his_skyld: C(
    'skyld',
    'Skyld er en normativ eller rettslig tilskrivning av klanderverdig handling eller unnlatelse til en aktør, og må skilles fra kausal medvirkning, institusjonelt ansvar og moralsk fordømmelse.',
    'culpability_concept',
    ['con_his_ansvar', 'con_his_gransking', 'con_his_ulik'],
    ['con_his_systemulykke'],
    'Å velge en synlig enkeltaktør som syndebukk før systembetingelser, kunnskapsnivå, fullmakter og andre bidragende årsaker er undersøkt.',
    ['identifisert plikt eller norm', 'dokumentert handling eller unnlatelse', 'vurdering av kunnskap, kontroll og konsekvens'],
    ['rettsavgjørelse, gransking, instruks og hendelseslogg', 'kilde som skiller strafferettslig, administrativt og politisk ansvar']
  ),
  con_his_systemulykke: C(
    'systemulykke',
    'Systemulykke er en hendelse der skade oppstår gjennom samvirke mellom tekniske komponenter, organisering, informasjon og beslutninger, slik at én enkelt feil ikke forklarer forløpet.',
    'system_accident_concept',
    ['con_his_normalulykker', 'con_his_teknologi', 'con_his_institusjonell'],
    ['con_his_skyld'],
    'Å bruke systemulykke for å oppløse alt individuelt ansvar eller som generell merkelapp uten rekonstruert årsaksnettverk og avhengigheter.',
    ['flere bidragende feil og barrieresvikt', 'koblinger mellom teknologi og organisasjon', 'ikke-lineært eller eskalerende hendelsesforløp'],
    ['teknisk logg, organisasjonsdata og ulykkesgransking', 'kontrollkilde som tester både system- og aktørforklaringer']
  ),
  con_his_systemulykker: C(
    'systemulykkesmønstre',
    'Systemulykkesmønstre er gjentakende kombinasjoner av tekniske avhengigheter, organisatoriske svakheter og informasjonsbrudd som kan sammenlignes på tvers av flere ulykker.',
    'comparative_system_accident_concept',
    ['con_his_systemulykke', 'con_his_normalulykker', 'con_his_institusjonell_laering'],
    ['con_his_katastrofer'],
    'Å generalisere fra én spektakulær ulykke eller samle hendelser med ulike systemgrenser, datakvalitet og årsaksnivå i samme mønster.',
    ['samme barrieresvikt i flere case', 'sammenlignbare systemgrenser og tidslinjer', 'gjentatte organisatoriske eller tekniske koblinger'],
    ['flere granskningsrapporter og standardisert hendelsesdata', 'metode som redegjør for caseutvalg og avvik']
  ),
  con_his_teknologi: C(
    'teknologi',
    'Teknologi er sammenvevde redskaper, infrastrukturer, standarder, kunnskaper og organisasjoner som muliggjør handling og samtidig fordeler kapasitet, avhengighet og risiko.',
    'sociotechnical_concept',
    ['con_his_systemulykke', 'con_his_sikkerhet', 'con_his_institusjonell'],
    ['con_his_regler'],
    'Å forklare teknologi som et isolert redskap eller autonom drivkraft uten å undersøke brukere, vedlikehold, standarder, finansiering og institusjonell organisering.',
    ['materielle komponenter og infrastruktur', 'kompetanse, drift og standarder', 'sosiale virkninger og avhengigheter'],
    ['teknisk dokumentasjon, driftsarkiv, standard og brukerdata', 'kilde om faktisk praksis og svikt, ikke bare designintensjon']
  ),
  con_his_terror: C(
    'terror',
    'Terror er planlagt vold eller trussel om vold rettet mot sivile eller offentligheten for å skape frykt og påvirke politiske eller sosiale beslutninger utover de direkte ofrene.',
    'terrorism_concept',
    ['con_his_demokratisk', 'con_his_sikkerhet', 'con_his_minne'],
    ['con_his_katastrofe'],
    'Å bruke terror som rent moralsk skjellsord eller la gjerningsaktørens propaganda alene definere motiv, målgruppe og politisk virkning.',
    ['planlagt vold og kommunikativ hensikt', 'mål om bredere frykt eller politisk påvirkning', 'virkning på institusjoner og offentlighet'],
    ['retts- og etterforskningskilder, samtidige kommunikasjoner og mediedata', 'kilde fra ofre og berørte miljøer samt kontroll av aktørpåstander']
  ),
  con_his_ulik: C(
    'ulik eksponering',
    'Ulik eksponering er systematiske forskjeller mellom grupper eller steder i hvor mye og hvor lenge de utsettes for fare, som følge av bosted, arbeid, rettigheter, mobilitet og politiske prioriteringer.',
    'unequal_exposure_concept',
    ['con_his_eksponering', 'con_his_sarbarhet', 'con_his_langsom_vold'],
    ['con_his_skyld'],
    'Å slutte fra ulikt skadeutfall til ulik eksponering uten å skille eksponering fra sårbarhet, respons og tilfeldige variasjoner.',
    ['gruppe- eller stedsfordelt farekontakt', 'varighet og intensitet', 'sosial eller institusjonell mekanisme bak forskjellen'],
    ['geokodet befolknings-, arbeids- og miljødata', 'kilde som dokumenterer mobilitet, adgang og beslutninger']
  ),
  con_his_ulykker: C(
    'ulykkeshistorie',
    'Ulykkeshistorie er komparativ analyse av utilsiktede skadehendelser, deres tekniske og organisatoriske forløp, samfunnsmessige konsekvenser og etterfølgende regulering.',
    'accident_history_concept',
    ['con_his_systemulykke', 'con_his_gransking', 'con_his_regler'],
    ['con_his_katastrofer'],
    'Å behandle ulykker som tilfeldige enkelthendelser uten å undersøke gjentatte barrieresvikt, arbeidsforhold, regulering og læring over tid.',
    ['rekonstruert hendelsesforløp', 'skade- og årsaksmønster', 'endring eller fravær av endring etterpå'],
    ['ulykkesregister, gransking, arbeids- og driftsarkiv', 'sammenlignbare case og kilde om oppfølging']
  )
};

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
for (const [id, spec] of Object.entries(conceptSpecs)) {
  const current = conceptById.get(id);
  if (!current) throw new Error(`Missing concept ${id}`);
  Object.assign(current, spec);
}
writeJson(conceptPath, concepts);

const theorySpecs = {
  theory_his_krise_gjenoppbygging: {
    definition: 'Forklarer hvordan akutt funksjonsbrudd går over i gjenoppbygging gjennom prioriteringer om ressurser, institusjoner, bolig, minne og normalitet, og sammenligner hvem som får vende tilbake, hvem som bærer resttap og hva som faktisk endres.',
    limitations: [
      'Modellen kan overvurdere et tydelig skille mellom krise og etterkrise når tap, evakuering og midlertidige ordninger varer i mange år.',
      'Gjenoppbyggingstall må skilles fra sosial gjenetablering; nye bygg dokumenterer ikke retur, trygghet eller økonomisk bærekraft.',
      'Offisielle planer og minnemarkeringer må kontrolleres mot berørte grupper som ikke fikk eiendom, erstatning eller representasjon.'
    ]
  },
  theory_his_katastrofer_brudd_gjenoppbygging_og_minne_etter_krise: {
    definition: 'Analyserer hvordan materielle reparasjoner, erstatning, rettslige oppgjør og minnepraksiser former hverandre etter krise, og hvordan valg om hva som bygges og minnes fordeler anerkjennelse og framtidsmuligheter.',
    limitations: [
      'Monumenter og jubileer viser institusjonalisert minne, men ikke nødvendigvis private eller konkurrerende erfaringer.',
      'Før-og-etter-sammenligning krever samme geografiske og sosiale enhet; ellers kan flytting og utskifting skjules som framgang.',
      'Minnepolitikk kan endres lenge etter den materielle gjenoppbyggingen og må dateres som eget forløp.'
    ]
  },
  theory_his_katastrofer_brudd_terror_og_samtidshistorie: {
    definition: 'Forklarer terror som voldshendelse, kommunikativ strategi og demokratisk prøvelse, med analyse av gjerningsforløp, ofre, sikkerhetsrespons, offentlighet, rettsoppgjør og senere minne.',
    limitations: [
      'Gjerningspersonens manifest og selvframstilling kan ikke brukes som tilstrekkelig forklaring på motiv eller samfunnsvirkning.',
      'Sikkerhetstiltak etter terror må vurderes både for risikoreduksjon og for virkninger på rettigheter, minoriteter og offentlig rom.',
      'Samtidige mediekilder er rike, men preget av usikkerhet, gjentakelse og strategisk kommunikasjon i akuttfasen.'
    ]
  },
  theory_his_katastrofer_brudd_teknologi_systemulykker_og_normalulykker: {
    definition: 'Analyserer ulykker i komplekse teknologiske systemer som samvirke mellom komponentfeil, tett kobling, organisasjon, vedlikehold, informasjon og beslutninger, og tester når normalulykkesteori gir bedre forklaring enn enkeltfeil.',
    limitations: [
      'Kompleksitet og tett kobling må dokumenteres konkret; teorien kan ikke brukes som generell forklaring på alle tekniske ulykker.',
      'Systemforklaringer må ikke utslette beslutninger, forsømmelser eller rettslig ansvar hos aktører som faktisk hadde kontroll.',
      'Granskningsdata er ofte produsert etter at systemgrenser og årsakskategorier allerede er definert av oppdragsgiver.'
    ]
  },
  theory_his_katastrofer_brudd_beredskap_kriseledelse_og_institusjonell_laering: {
    definition: 'Forklarer forskjellen mellom planlagt og faktisk beredskap gjennom ressurser, øving, situasjonsforståelse, fullmakter og samvirke, og undersøker om erfaringer etterpå ble omsatt til varig institusjonell endring.',
    limitations: [
      'Et dårlig utfall beviser ikke alene dårlig kriseledelse; analysen må rekonstruere informasjon og handlingsrom på beslutningstidspunktet.',
      'Nye planer og anbefalinger er svake læringsmål uten dokumentert implementering, finansiering og senere testing.',
      'Organisasjonsarkiver kan nedtone improvisasjon, frivillighet og konflikter mellom etater og berørte grupper.'
    ]
  },
  theory_his_katastrofer_brudd_skyld_ansvar_gransking_og_rett: {
    definition: 'Skiller kausal medvirkning, moralsk skyld, administrativt ansvar, politisk ansvar og rettslig skyld, og analyserer hvordan granskinger og rettsprosesser velger årsaksnivå, bevis og ansvarsbærere.',
    limitations: [
      'Rettens skyldkrav og granskingens læringsformål bruker ulike bevisstandarder og kan ikke sammenfattes til én autoritativ konklusjon.',
      'Fokus på en synlig operatør kan skjule design, økonomiske rammer og langsiktig institusjonell forsømmelse.',
      'Et fravær av strafferettslig dom betyr ikke at organisatorisk, politisk eller erstatningsrettslig ansvar er avklart.'
    ]
  },
  theory_his_katastrofer_brudd_gjenoppbygging_resiliens_og_minne: {
    definition: 'Analyserer resiliens som fordeling av gjenopprettingsarbeid, tilpasning og resttap, og kobler materiell gjenoppbygging til sosial retur, institusjonell omforming og konkurrerende minner om hendelsen.',
    limitations: [
      'Rask funksjonsgjenoppretting kan bygge på ubetalt omsorg, overarbeid eller varig tap hos svake grupper og er derfor ikke alene et mål på resiliens.',
      'Tilbakeføring til førtilstanden kan gjenopprette den samme sårbarheten som produserte katastrofen.',
      'Aggregert økonomisk vekst etter krisen kan skjule permanent utflytting, gjeld og uerstattelige kulturelle eller miljømessige tap.'
    ]
  },
  theory_his_katastrofer_brudd_langsomme_katastrofer_og_miljoskade: {
    definition: 'Forklarer miljøkatastrofer uten klart hendelsespunkt gjennom kumulativ eksponering, langsom vold, tidsforsinket skade, spredt ansvar og institusjonell normalisering av tap.',
    limitations: [
      'Lang tidsavstand mellom utslipp og skade gjør årsakskjeder usikre og krever måleserier samt alternative forklaringer.',
      'Begrepet katastrofe kan skjule gradvise forskjeller i skade dersom terskel, tidsrom og berørt område ikke defineres.',
      'Arkiver fra produsenter og myndigheter må balanseres mot helse-, miljø- og lokalkunnskap som kan ha blitt marginalisert.'
    ]
  },
  theory_his_katastrofer_brudd_langsomme_katastrofer_miljoskade_og_ulik_eksponering: {
    definition: 'Analyserer hvordan bolig, arbeid, rettigheter og politiske prioriteringer fordeler langvarig miljøfare ulikt, og hvordan eksponering, sårbarhet og dokumentasjonsevne påvirker hvem som blir anerkjent som skadelidt.',
    limitations: [
      'Ulikt skadeutfall kan skyldes både eksponering og sårbarhet; variablene må måles separat før fordelingspåstander trekkes.',
      'Manglende registerdata for marginaliserte grupper kan gi falskt inntrykk av lav eksponering eller liten skade.',
      'Geografisk nærhet til en kilde er ikke tilstrekkelig uten kunnskap om varighet, spredningsvei, mobilitet og faktisk kontakt.'
    ]
  },
  theory_his_katastrofer_brudd_katastrofer_branner_ulykker_og_historiske_brudd_fordypning_10: {
    definition: 'Sammenfatter katastrofehistorisk analyse i en eksplisitt kjede fra fare, eksponering og sårbarhet via hendelsesforløp, systemsvikt og respons til ansvar, gjenoppbygging, minne og varig historisk brudd.',
    limitations: [
      'En syntesemodell kan bli for bred; hvert case må avgrense sted, periode, aktører og den konkrete mekanismen som undersøkes.',
      'Ikke alle katastrofer skaper historiske brudd, og ikke alle brudd skyldes katastrofer; varig endring må dokumenteres separat.',
      'Sammenligning på tvers av brann, terror, epidemi, naturfare og systemulykke krever eksplisitte felles mål og respekt for ulike kildebegrensninger.'
    ]
  }
};

const theories = readJson(theoryPath);
const theoryById = new Map(theories.map((item) => [item.theory_id, item]));
for (const [id, spec] of Object.entries(theorySpecs)) {
  const current = theoryById.get(id);
  if (!current) throw new Error(`Missing theory ${id}`);
  Object.assign(current, spec, {status: 'canonical_v5_5_curated', evidence_ready: false});
}
writeJson(theoryPath, theories);

const run = (name, command, args) => {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8'});
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('katastrofer-brudd-ulykker-domain-validation.log', process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run('katastrofer-brudd-ulykker-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('katastrofer-brudd-ulykker-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('katastrofer-brudd-ulykker-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('katastrofer-brudd-ulykker-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('katastrofer-brudd-ulykker-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('katastrofer-brudd-ulykker-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('katastrofer-brudd-ulykker-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readiness = JSON.parse(fs.readFileSync(path.join(reportDir, 'historie-v5-5-readiness.json'), 'utf8'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
const summary = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concept_ids: Object.keys(conceptSpecs),
  curated_theory_ids: Object.keys(theorySpecs),
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  next_gate: 'Continue individual curation of the remaining V5.5 domains before global freeze and V6 activation.'
};
writeJson(path.join(reportDir, 'katastrofer-brudd-ulykker-curation-readiness.json'), summary);
console.log(JSON.stringify(summary, null, 2));
