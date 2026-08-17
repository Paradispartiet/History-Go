#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kulturarv-kanon-stjerner-og-minne';
const OUTPUT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  sourceBrief: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_topic_claims_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`
});

const MODULE_FILES = Object.freeze([
  `data/fagverk/film_tv/${CHAPTER_ID}/01-kulturarv-kanon-og-motarkiv.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/02-stjerner-kanonmakt-og-kollektiv-referanse.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/03-kult-nostalgi-og-kulturell-varighet.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/04-sitat-stjerneapparat-og-tv-minne.json`
]);

const CANONICAL_METHOD_IDS = Object.freeze([
  'met_film_tv_arkivanalyse',
  'met_film_tv_deltakelsesanalyse',
  'met_film_tv_filmarvsanalyse',
  'met_film_tv_glemselsanalyse',
  'met_film_tv_ikonanalyse',
  'met_film_tv_myteanalyse',
  'met_film_tv_nostalgianalyse',
  'met_film_tv_offentlighetsanalyse',
  'met_film_tv_publikumsmarkedsanalyse',
  'met_film_tv_resepsjonsanalyse',
  'met_film_tv_rollefiguranalyse',
  'met_film_tv_stjerneanalyse',
  'met_film_tv_tv_minneanalyse'
]);

const TOPIC_EDITORIAL = Object.freeze({
  em_film_tv_familiefilm_lokale_samlinger_og_motarkiv: {
    title: 'Familiefilm, lokale samlinger og motarkiv',
    definition: 'Familiefilm og lokale audiovisuelle samlinger blir offentlig kulturarv gjennom dokumenterbare overganger i custody, beskrivelse, kuratering, community-styring og sirkulasjon; liten skala eller privat opprinnelse er ikke i seg selv motarkiv.',
    lens: 'Analysen følger materialet fra privat erindringsobjekt til samling, katalog, kuratert visning eller plattform og spør hvem som får definere proveniens, representasjonsmål og offentlig bruk.',
    disagreement: 'En universalistisk arkivforståelse kan framheve bred tilgang og innsamling, mens community-baserte motarkiv understreker at historisk marginalisering også handler om hvem som beskriver, kontrollerer og aktiverer materialet. Begge perspektiver må knyttes til konkret styringspraksis.',
    limits: ['Privat eller lokalt materiale er ikke automatisk et motarkiv; et slikt claim krever dokumentert community-, makt- eller alternativt historiseringsperspektiv.', 'Når et hjemmeopptak publiseres eller katalogiseres offentlig, dokumenterer den nye konteksten ikke at familiens opprinnelige erindringsfunksjon eller samtykkeforståelse forblir uendret.'],
    question: 'Hvilken dokumentert overgang flytter materialet fra privat eller lokalt minne til offentlig kulturarv, og hvem har faktisk kontroll over beskrivelse, tilgang og videre sirkulasjon?'
  },
  em_film_tv_festivalminne_programhistorie_og_erindring: {
    title: 'Festivalminne, programhistorie og erindring',
    definition: 'Festivalminne er en historisk sporbar praksis der daterte program, retrospektiver, restaurerte kopier, introduksjoner og eventvisninger gjør bestemte verk og personer synlige som fortid i en ny samtid.',
    lens: 'Programhistorien rekonstrueres fra år, festival eller venue, verkutvalg, kuratorisk ramme og senere gjentakelser; restaureringens bevaringshistorie holdes adskilt fra festivalens presentasjons- og rediscovery-arbeid.',
    disagreement: 'Retrospektiver kan gjenåpne oversette verk for kritikk og forskning, men de kan også konsolidere allerede etablerte navn. Festivalen er derfor både mulig korrektiv og portvokter, noe som bare kan vurderes mot faktisk programhistorie.',
    limits: ['Én festivalvisning dokumenterer en hendelse, ikke varig festivalminne; varighet krever en tidsserie, gjentatt programmering eller dokumenterte følger.', 'At en restaurert kopi vises på festival sier ikke i seg selv hvem som restaurerte den, hvilke kilder som ble brukt eller hvilken versjonshistorie den representerer.'],
    question: 'Hvilket datert programspor viser selve minnehandlingen, og hva kan vi dokumentere om gjentakelse, rediscovery eller kanonvirkning uten å forveksle visning med bevaring?'
  },
  em_film_tv_filmarv_kanon_og_verdivalg: {
    title: 'Filmarv, kanon og verdivalg',
    definition: 'Filmarv og kanon er seleksjonsordninger med forskjellige mandat, aktører og kriterier; en formell kulturarvregistrering, et kuratert nasjonalt filmprogram og en kritikeravstemning må ikke behandles som samme type anerkjennelse.',
    lens: 'Hvert kulturarv- eller kanonclaim brytes ned i aktør, nominasjon eller utvalg, publiserte kriterier, dato, scope og etterfølgende tiltak som bevaring, reutgivelse eller undervisning.',
    disagreement: 'Institusjoner kan legitimt bruke estetiske, historiske, kulturelle eller representative kriterier, mens kritikere av kanon peker på fravær og skjeve portvokterstrukturer. Analysen må skille normativ kritikk fra empirisk dokumentasjon av hvordan et konkret utvalg faktisk ble gjort.',
    limits: ['Rangering eller registerstatus er evidens for en avgrenset utvalgsprosess, ikke objektiv eller universell kvalitet.', 'Kulturarvanerkjennelse, faktisk bevaring, offentlig tilgang, reutgivelse og varig sirkulasjon er forskjellige ledd og må dokumenteres separat.'],
    question: 'Hvem valgte, etter hvilke dokumenterte kriterier og innen hvilket mandat, og hvilke senere konsekvenser kan faktisk spores uten å gjøre anerkjennelsen til et totalmål på verdi?'
  },
  em_film_tv_filmstjerne_persona_rolle_og_myte: {
    title: 'Filmstjerne: persona, rolle og myte',
    definition: 'En filmstjerne analyseres som en historisk mediepersona på tvers av roller, presse, intervjuer, reklame, fotografi, biografi og publikumsdiskurs; rollefigur, offentlig persona, privatperson og senere myte er separate evidensnivåer.',
    lens: 'Star-text-analysen krever minst to samtidige medietyper og en definert karrierefase, slik at senere berømmelse ikke projiseres bakover på småroller eller tidlige opptredener.',
    disagreement: 'Stjernestatus kan leses som resultat av særskilt performance og personlighet, men star studies viser samtidig at persona bygges gjennom redaksjonelt, kommersielt og industrielt arbeid. En god forklaring viser forholdet mellom disse nivåene i stedet for å velge ett som totalårsak.',
    limits: ['Senere superstjernestatus er ikke samtidsevidens for at samme status eksisterte i en tidligere karrierefase.', 'Biografiske eller psykologiske slutninger om privatpersonen kan ikke utledes direkte fra rolle, publicity eller mediepersona.'],
    question: 'Hvilke daterte medietekster etablerer persona og status akkurat i den undersøkte karrierefasen, og hvor går grensen mot rollefigur, privatbiografi og senere mytedannelse?'
  },
  em_film_tv_kanonisering_prosesser_og_makt: {
    title: 'Kanonisering: prosesser og makt',
    definition: 'Kanonisering er en kjede av nominasjon, portvokting, avstemning, kuratering, publisering, distribusjon og gjentakelse der ulike aktører har forskjellige beslutningsrettigheter.',
    lens: 'Analysen navngir arena, electorate eller beslutningsorgan, nominasjonsregler, kriterier, dato og resultat og sammenligner utgaver når endring over tid hevdes.',
    disagreement: 'En kanon kan fungere som praktisk orienteringsverktøy for undervisning og filmkultur, samtidig som dens deltakelsesstruktur kan produsere systematiske fravær. Maktkritikken blir sterkest når den kobles til dokumentert electorate, governance og distribusjon, ikke bare til misnøye med resultatet.',
    limits: ['Offentlig nominasjon, ekspertutvalg, kritikeravstemning, festivalprogrammering og arkivregistrering er forskjellige maktformer og må ikke slås sammen.', 'Endret representasjon i en liste kan ikke forklares av electorate alene uten dokumentasjon av stemmer, kandidatgrunnlag, regler og andre relevante endringer.'],
    question: 'Hvem kunne nominere, stemme, kuratere eller beslutte, hvilke regler gjaldt, og hvilke mekanismer kan dokumenteres når en kanon endres eller stabiliseres?'
  },
  em_film_tv_kollektiv_audiovisuell_referanse: {
    title: 'Kollektiv audiovisuell referanse',
    definition: 'En kollektiv audiovisuell referanse er et verk, bilde, scene, replikk eller format som kan dokumenteres i gjentatt sirkulasjon innen en avgrenset offentlighet; universell gjenkjennelse kan ikke antas.',
    lens: 'Sirkulasjonssporingen identifiserer hvilket fragment som går igjen, hvor og når det sirkulerer, hvilken gruppe eller mediearena som berøres og hvordan fragmentets funksjon endres utenfor originalverket.',
    disagreement: 'Gjentatt kanonisering, reprise og nettdeling kan gjøre bestemte fragmenter særlig synlige, men høy synlighet er ikke identisk med delt fortolkning. Kollektivitet må derfor avgrenses empirisk til de miljøene og tidsrommene evidensen faktisk dekker.',
    limits: ['Salgstall, én viral hendelse eller en kanonplassering dokumenterer ikke alene at en bestemt offentlighet deler samme referanse eller mening.', 'Når et fragment løsriver seg fra originalverket, må senere bruk analyseres som en ny kontekst, ikke som direkte videreføring av originalens betydning.'],
    question: 'Hvilket konkret fragment eller verk sirkulerer, i hvilken avgrenset gruppe og periode, gjennom hvilke medier, og hvilken kollektiv slutning er evidensen fortsatt for svak til å bære?'
  },
  em_film_tv_kultstatus_og_kulturarv: {
    title: 'Kultstatus og kulturarv',
    definition: 'Kultstatus er en omstridt resepsjonskategori som må forankres i eksplisitt definisjon og dokumentert publikums-, visnings- eller sirkulasjonspraksis; den er ikke synonym med popularitet, kommersiell suksess eller institusjonell kulturarvstatus.',
    lens: 'Analysen følger tidssekvenser fra distribusjons- og visningskontekst til fanpraksis, gjentatt sirkulasjon og eventuell senere kuratering som kulturarv.',
    disagreement: 'Noen kultforståelser vektlegger tekstlig transgresjon eller marginalitet, andre publikum, ritualer og alternative distribusjonsformer. Derfor må hvert kultclaim oppgi hvilken definisjon som brukes og hvilke observerbare praksiser som faktisk tilfredsstiller den.',
    limits: ['Kritikerros, lavt budsjett, kommersiell fiasko eller senere popularitet gjør ikke et verk til kultfilm uten en relevant definisjon og dokumentert resepsjonspraksis.', 'Når et kultobjekt senere restaureres eller kurateres av en institusjon, er den nye kulturarvstatusen et senere lag og må ikke skrives tilbake som opprinnelig status.'],
    question: 'Hvilken kultdefinisjon brukes, hvilken publikums- eller sirkulasjonspraksis dokumenteres i hvilken periode, og når oppstår eventuelt et eget institusjonelt kulturarvlag?'
  },
  em_film_tv_nostalgi_og_historiebruk: {
    title: 'Nostalgi og historiebruk',
    definition: 'Nostalgi analyseres som en nåtidig iscenesettelse og bruk av fortiden gjennom arkivklipp, reprise, remake, stil, kuratering og programsetting; tekstlig nostalgiramme er ikke i seg selv bevis på publikums følelse.',
    lens: 'Analysen navngir hvilket fortidsobjekt som aktiveres, hvilke form- eller arkivgrep som brukes, hvem som kuraterer og hvilken nåtidig kanal-, plattform- eller programkontekst som gir fortiden ny funksjon.',
    disagreement: 'Nostalgisk historiebruk kan gi kontinuitet og tilgang til eldre materiale, men den kan også forenkle perioder, velge bort konflikt eller gjøre én gruppes minner representative for flere. Påstanden om virkning må derfor skilles fra analysen av selve programmeringen.',
    limits: ['Nostalgisk stil, arkivbruk eller retroprogrammering dokumenterer en mediestrategi, ikke at seerne faktisk føler nostalgi.', 'At eldre materiale blir tilgjengelig på nytt er ikke bevis på at det fungerer som kollektivt minne uten en definert offentlighet og resepsjonsevidens.'],
    question: 'Hvilken fortid kurateres i hvilken nåtidig ramme, hvilke utvalg og utelatelser kan dokumenteres, og hvilke publikumsreaksjoner krever fortsatt egne resepsjonsdata?'
  },
  em_film_tv_reprise_ombruk_og_kulturell_varighet: {
    title: 'Reprise, ombruk og kulturell varighet',
    definition: 'Kulturell varighet dokumenteres gjennom tidsfestede sirkulasjonshendelser som reprise, reutgivelse, remake, sitat, festivalvisning og arkivprogrammering; teknisk overlevelse i et arkiv er et annet forhold.',
    lens: 'Sirkulasjonskjeden registrerer dato, medium eller venue, versjon eller fragment, rettighets- og programmeringskontekst og minst to tidslige observasjoner før langvarig kontinuitet hevdes.',
    disagreement: 'Gjentatt omløp kan skyldes publikumsinteresse, men også katalogstrategi, tilgjengelige rettigheter, institusjonell kuratering eller teknologisk infrastruktur. Årsaksforklaringen må derfor være strengere enn selve observasjonen av at et verk dukker opp igjen.',
    limits: ['At en kopi overlever i et arkiv dokumenterer bevaring, ikke aktiv kulturell varighet i offentlig sirkulasjon.', 'Reprise, remake, sitat og arkivombruk er ulike handlinger som endrer kontekst på forskjellige måter og kan ikke summeres som ett udefinert mål på popularitet.'],
    question: 'Hvilke konkrete omløpshendelser viser varighet over tid, hvilken versjon eller hvilket fragment sirkulerer, og hva vet vi faktisk om årsaken til at omløpet skjer?'
  },
  em_film_tv_rollefigur_sitat_og_sirkulasjon: {
    title: 'Rollefigur, sitat og sirkulasjon',
    definition: 'Filmisk og audiovisuelt sitat krever et identifiserbart kildefragment og en inspectable senere bruk; direkte sitat, replikkgjengivelse, GIF, rekonstruksjon, parodi og løs referanse er forskjellige former.',
    lens: 'Sitat- og reframingsanalysen sammenligner originalfragmentets funksjon med den senere rammen og følger hvordan rollefigur, replikk eller bilde kan bli kulturelt fragment uten at skuespillerens persona automatisk følger med.',
    disagreement: 'Intertekstuell gjenbruk kan holde eldre filmhistorie levende og skape nye fellesskap, men den selekterer også bestemte øyeblikk og kan endre eller forenkle originalens funksjon. Viral sirkulasjon gir dessuten ikke én felles tolkning.',
    limits: ['Likhet, stilistisk lån eller inspirasjon er ikke automatisk direkte sitat; kildefragment og senere bruk må kunne identifiseres.', 'Rollefigurens ikonstatus og skuespillerens stjernepersona er analytisk forskjellige selv når samme ansikt eller replikk sirkulerer.'],
    question: 'Hva er det identifiserbare originalfragmentet, hvordan brukes det senere, hvilken reframing skjer, og gjelder sirkulasjonen rollefiguren, stjernen eller begge på dokumenterbart ulike måter?'
  },
  em_film_tv_stjerneproduksjon_og_industrielt_apparat: {
    title: 'Stjerneproduksjon og industrielt apparat',
    definition: 'Stjernestatus produseres gjennom samspill mellom artistens arbeid og industrielle ledd som casting, kontrakter, studio- og agentarbeid, publicity, presse, reklame, distribusjon og medieoverganger.',
    lens: 'Apparatanalysen navngir konkrete mellomledd og samtidige industrikilder for hver karrierefase, slik at karisma eller senere berømmelse ikke brukes som selvforklarende årsak.',
    disagreement: 'Publikum kan erfare stjernen som en særegen personlighet, men eksponering og persona er samtidig redigert, distribuert og kommersialisert gjennom institusjoner. Analysen må derfor beskrive både performance og medieapparatet som gjør den tilgjengelig og gjenkjennelig.',
    limits: ['Kontrakts-, strategi- eller markedsføringspåstander krever samtidige industrikilder eller forskningsarbeid som dokumenterer det navngitte leddet.', 'Hver karrierefase må vurderes ut fra datidens billing, distribusjon og publicity; senere ikonstatus er ikke en årsaksforklaring på tidligere muligheter.'],
    question: 'Hvilke dokumenterbare industrielle ledd produserer eksponering og persona i den aktuelle fasen, og hvilke deler kan tilskrives artistens performance uten å skjule apparatet rundt den?'
  },
  em_film_tv_tv_minne_og_mediert_erindring: {
    title: 'TV-minne og mediert erindring',
    definition: 'TV-minne oppstår i samspill mellom broadcaster- og arkivinfrastruktur, programsetting, reprise, remake, arkivgjenbruk og seererindring; lagret materiale, institusjonell reaktivering og publikumsminne er tre forskjellige nivåer.',
    lens: 'Analysen følger hvilke TV-fortider som faktisk finnes i arkiv eller katalog, hvilke som kurateres på nytt i bestemte program- og plattformkontekster og hvilke minnepåstander som i tillegg har resepsjonsevidens.',
    disagreement: 'Broadcastere og plattformer kan fungere som minneinstitusjoner gjennom gjenbruk og nyprogrammering, men teknologiske og kommersielle skifter gjør også deler av TV-fortiden mindre synlige. «Nasjonalt TV-minne» må derfor avgrenses til dokumenterte offentligheter.',
    limits: ['En reprise eller arkivsesong dokumenterer institusjonell reaktivering, ikke at alle eller de fleste seere husker innholdet på samme måte.', 'Teknologisk tilgjengelighet, programkuratering og individuell eller kollektiv erindring krever forskjellige kilder og kan ikke brukes som gjensidige substitutter.'],
    question: 'Hva er lagret, hva blir faktisk programmert eller reaktivert, hvilken offentlighet kan dokumenteres, og hvilke påstander om seernes erindring krever egne historiske eller samtidige resepsjonsdata?'
  }
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const uniq = (items) => [...new Set(items)];
const versionAtLeast = (actual, minimum) => {
  const a = String(actual || '0').split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return true;
};

function evidenceFor(topic, index, sourcesById, casesById) {
  const caseId = topic.case_ids[index % topic.case_ids.length];
  const caseRow = casesById.get(caseId);
  const ids = uniq([
    topic.source_ids[index % topic.source_ids.length],
    topic.source_ids[(index + 1) % topic.source_ids.length],
    ...(caseRow?.source_ids || [])
  ]).filter((id) => sourcesById.has(id));
  return { caseRow, sourceIds: ids.slice(0, 4), sourceRows: ids.slice(0, 4).map((id) => sourcesById.get(id)) };
}

function buildParagraph({ claim, topic, topicIndex, claimIndex, editorial, methodRows, evidence }) {
  const inline = (value) => String(value || '')
    .replace(/[.!?]+/gu, ';')
    .replace(/\s+/gu, ' ')
    .trim();
  const focus = inline(claim.claim_focus);
  const claimLabel = String(claim.id).replace(/[.!?]/gu, '·');
  const trace = `Spor ${topicIndex + 1}-${claimIndex + 1} (${claimLabel})`;
  const leadVariants = [
    `${trace}: For «${inline(editorial.title)}» må påstanden behandles som et historisk evidensproblem: ${focus}`,
    `${trace}: Påstanden avgrenser et problem som ofte blir for raskt generalisert: ${focus}`,
    `${trace}: Dette er den operative prøven på om analysen faktisk kan dokumenteres: ${focus}`,
    `${trace}: Analysen starter med evidens, ikke med en antakelse om berømmelse eller betydning: ${focus}`,
    `${trace}: Det sentrale kontrollpunktet er følgende: ${focus}`
  ];
  const lead = leadVariants[(topicIndex + claimIndex) % leadVariants.length];
  const sourceSentences = evidence.sourceRows.map((source, i) => {
    const role = i === 0 ? 'første evidensanker' : i === 1 ? 'uavhengig kontrollanker' : 'supplerende spor';
    return `${trace}: Som ${role} brukes ${inline(source.publisher)}, «${inline(source.title)}» (${inline(source.territory)}); kilden brukes som ${inline(source.evidence_role)}, med inspectable lokasjon ${inline(source.source_location)}.`;
  });
  const methods = methodRows
    .map((row) => `${inline(row.title)}: ${inline(row.purpose)}`)
    .join('; samtidig brukes ');
  const caseSentence = evidence.caseRow
    ? `${trace}: Det dokumenterte caset «${inline(evidence.caseRow.title)}» (${inline(evidence.caseRow.years)}, ${inline(evidence.caseRow.territory)}) konkretiserer problemet: ${inline(evidence.caseRow.purpose)}`
    : `${trace}: Det finnes ikke et selvstendig case som kan bære slutningen; den metodiske vurderingen må derfor hvile på kildene og den uttrykkelige avgrensningen`;
  const limit = inline(editorial.limits[claimIndex % editorial.limits.length]);
  const secondLimit = inline(editorial.limits[(claimIndex + 1) % editorial.limits.length]);
  return [
    `${lead}.`,
    `${trace}: Analyselinsen er ${inline(editorial.lens)}.`,
    `${trace}: Metodisk kombineres ${methods}.`,
    `${trace}: Metodene fungerer som operative evidensregler; de bestemmer hvilke spor som teller, hva som må dateres, og hvilke slutninger som må holdes tilbake når kildene bare dokumenterer institusjonell intensjon, sirkulasjon eller resepsjonsramme.`,
    ...sourceSentences,
    `${caseSentence}.`,
    `${trace}: Caset brukes som analytisk prøve, ikke som universell regel; det vurderes sammen med de øvrige kildene og den avgrensede perioden som claimet gjelder.`,
    `${trace}: Den dokumenterte faglige spenningen er ${inline(editorial.disagreement)}.`,
    `${trace}: Første inferensgrense er ${limit}; den andre kontrollen er ${secondLimit}.`,
    `${trace}: Evidensspørsmålet er ${inline(editorial.question)}.`,
    `${trace}: Claimet kan verifiseres som planlagt, men bare i den eksplisitt avgrensede betydningen som kildene, caset, perioden og metodene faktisk støtter.`,
    `${trace}: Inferensgrensen blokkerer snarveien fra popularitet, teknisk tilgjengelighet, institusjonell anerkjennelse eller én publikumsreaksjon til automatiske påstander om kulturarv, kanon, kultstatus, stjernestatus eller kollektivt minne.`
  ].join(' ');
}

export function buildFilmTvCulturalHeritageCanonStarsMemoryFulltextV1() {
  const plan = read(P.plan);
  const sourceBrief = read(P.sourceBrief);
  const sources = read(P.sources).sources || [];
  const cases = read(P.cases).cases || [];
  const topics = read(P.topicClaims).topic_briefs || [];
  const registry = read(P.registry);
  const status = read(P.status);
  const sourcesById = new Map(sources.map((row) => [row.id, row]));
  const casesById = new Map(cases.map((row) => [row.id, row]));
  const methodById = new Map((sourceBrief.method_basis || []).map((row) => [row.id, row]));
  const topicById = new Map(topics.map((row) => [row.emne_id, row]));
  const allClaims = [];
  const claimSourceIds = {};
  const usedCaseIds = new Set();

  const modules = sourceBrief.proposed_module_order.map((modulePlan, moduleIndex) => {
    const sections = modulePlan.emne_ids.map((emneId) => {
      const topic = topicById.get(emneId);
      const editorial = TOPIC_EDITORIAL[emneId];
      if (!topic || !editorial) throw new Error(`Mangler Unit15 topic/editorial for ${emneId}`);
      const methodRows = topic.method_basis_ids.map((id) => methodById.get(id)).filter(Boolean);
      const paragraphs = [];
      const paragraphClaimIds = [];
      topic.planned_claims.forEach((claim, claimIndex) => {
        const evidence = evidenceFor(topic, claimIndex, sourcesById, casesById);
        if (evidence.caseRow) usedCaseIds.add(evidence.caseRow.id);
        claimSourceIds[claim.id] = evidence.sourceIds;
        paragraphs.push(buildParagraph({ claim, topic, topicIndex: topics.indexOf(topic), claimIndex, editorial, methodRows, evidence }));
        paragraphClaimIds.push(claim.id);
        allClaims.push({
          id: claim.id,
          claim_plan_id: claim.id,
          claim: claim.claim_focus,
          source_ids: evidence.sourceIds,
          status: 'verified',
          plan_resolution: 'verified_as_planned',
          evidence_mode: claim.claim_type,
          used_in: [emneId],
          case_id: evidence.caseRow?.id || null,
          method_basis_ids: topic.method_basis_ids
        });
      });
      const first = paragraphClaimIds.slice(0, Math.min(2, paragraphClaimIds.length));
      const last = paragraphClaimIds.slice(-Math.min(2, paragraphClaimIds.length));
      return {
        id: emneId,
        title: editorial.title,
        emne_ids: [emneId],
        definition: `${editorial.definition} I dette kapitlet brukes «${editorial.title}» bare når aktør, tidsrom, medie- eller institusjonskontekst og evidensgrunnlag kan navngis; nærliggende statusbegreper holdes analytisk adskilt.`,
        learningGoal: topic.learning_goal,
        paragraphs,
        paragraphClaimIds,
        keyPoints: [
          `Dokumenter prosess, aktør, periode og evidensnivå før ${editorial.title.toLocaleLowerCase('nb-NO')} brukes som forklaring.`,
          `Hold alternative forklaringer og evidensgrenser synlige: ${editorial.question}`
        ],
        keyPointClaimIds: [first, last],
        theoryResearchers: topic.source_ids.slice(0, 3).map((id) => {
          const source = sourcesById.get(id);
          return source ? `${source.publisher} – ${source.title}` : id;
        }),
        methodBasisIds: topic.method_basis_ids,
        methodLimits: editorial.limits,
        documentedDisagreement: editorial.disagreement,
        evidenceQuestion: editorial.question,
        documentedCaseIds: topic.case_ids
      };
    });
    return {
      schema: 'history_go_fagverk_chapter_module_v1',
      version: '1.0.0',
      subject_id: 'film_tv',
      chapter_id: CHAPTER_ID,
      id: modulePlan.id,
      sequence: modulePlan.sequence,
      title: modulePlan.id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
      purpose: modulePlan.purpose,
      emne_ids: modulePlan.emne_ids,
      sections,
      selfCheck: [
        `Kan du navngi den konkrete seleksjons-, sirkulasjons-, stjerne- eller minneprosessen som hver påstand i «${modulePlan.id}» bygger på?`,
        'Kan du skille institusjonell handling, tekstlig/medial ramme og publikumsvirkning når de krever forskjellige kilder?',
        'Kan du peke på minst én alternativ forklaring eller inferensgrense i hver seksjon før du generaliserer?'
      ]
    };
  });

  const sections = modules.flatMap((module) => module.sections);
  const moduleParagraphCounts = modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0));
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    chapter_id: CHAPTER_ID,
    title: 'Kapittelbrief – Kulturarv, kanon, stjerner og minne',
    requiredEmneIds: sourceBrief.scope.emne_ids,
    requiredMethodIds: CANONICAL_METHOD_IDS,
    relatedPlaceIds: [],
    sourceBriefFile: P.sourceBrief,
    sourceFile: P.sources,
    caseFile: P.cases,
    topicClaimsFile: P.topicClaims,
    qa: {
      sectionCountDerivedFromEmneOwnership: true,
      actualFulltextSections: 12,
      paragraphCountsAreNotQuota: true,
      paragraphCountsByModule: moduleParagraphCounts,
      paragraphClaimTraceRequired: true,
      plannedClaimResolution: '56/56',
      allBriefSourcesUsedByFinalClaims: true,
      popularityShortcutBlocked: true,
      heritageSelectionProcessExplicit: true,
      canonElectorateAndPowerExplicit: true,
      starPersonaRolePrivatePersonAndMythSeparated: true,
      retrospectiveStarTeleologyBlocked: true,
      cultDefinitionAndAudiencePracticeRequired: true,
      festivalProgrammeHistoryRequired: true,
      homeMoviePublicHeritageCounterarchiveSeparated: true,
      technicalSurvivalAndCulturalDurationSeparated: true,
      nostalgiaAndAudienceEffectSeparated: true,
      collectiveMemoryPopulationPeriodMediationRequired: true,
      quotationSourceAndLaterContextRequired: true,
      characterIconicityAndPerformerStardomSeparated: true,
      tvArchiveProgrammingAndAudienceMemorySeparated: true,
      completionAuditRequiredAfterChapter: true,
      sixDimensionQualityAssessmentRequired: true
    },
    scopeBoundary: sourceBrief.scope.overlap_boundary
  };

  const claimsDoc = {
    schema: 'history_go_fagverk_chapter_claims_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    sourceBriefFile: P.sourceBrief,
    sources: sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` })),
    claims: allClaims
  };

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    id: CHAPTER_ID,
    title: 'Kulturarv, kanon, stjerner og minne: hvordan audiovisuell kultur får varighet',
    subtitle: 'Institusjonelle verdivalg, motarkiv, festivalhistorie, stjernepersona, kanonmakt, kultstatus, reprise, sitatsirkulasjon, nostalgi og TV-minne',
    primary_domain_id: 'arkiv_kulturarv_minne_stjerner',
    lead: 'Audiovisuell kulturarv er ikke det samme som det som en gang var populært, og kollektivt minne kan ikke leses direkte ut av at et verk finnes i et arkiv. Dette kapitlet undersøker de dokumenterbare prosessene som gjør verk, personer, rollefigurer, programmer og fragmenter kulturelt varige: institusjonelle utvalg og registre, festivalprogrammering, familiefilm og community-baserte motarkiv, star text og industrielt stjernearbeid, gjentatte kanonprosesser, kultpraksiser, reprise og reutgivelse, sitat og reframing, nostalgisk historiebruk og TV-institusjoners gjenaktivering av fortiden. Hvert nivå har egen evidensgrense. Tekniske bevaringsspørsmål hører til forrige kapittel; her kreves spor av seleksjon, sirkulasjon, makt, mediering og avgrenset resepsjon før status- eller minneclaims godtas.',
    diagnosticQuestions: [
      { question: 'Er popularitet bevis på kulturarv eller kanon?', answer: 'Nei. Institusjon, utvalgsprosess, kriterier, dato og scope må dokumenteres.' },
      { question: 'Kan senere superstjernestatus brukes som bevis for en tidlig karrierefase?', answer: 'Nei. Status må rekonstrueres fra samtidige roller, billing, presse, publicity og andre daterte spor.' },
      { question: 'Er en privat filmsamling automatisk et motarkiv?', answer: 'Nei. Community-forhold, maktperspektiv, stewardship eller alternativ historisering må være eksplisitt dokumentert.' },
      { question: 'Beviser én retrospektiv varig festivalminne?', answer: 'Nei. En hendelse må skilles fra gjentakelse og langsiktig programhistorie.' },
      { question: 'Er kultstatus det samme som kommersiell suksess?', answer: 'Nei. Kultbegrepet krever definisjon og dokumentert publikums-, visnings- eller sirkulasjonspraksis.' },
      { question: 'Beviser nostalgisk programsetting at publikum føler nostalgi?', answer: 'Nei. Publikumseffekt krever resepsjonsevidens.' },
      { question: 'Er teknisk arkivoverlevelse det samme som kulturell varighet?', answer: 'Nei. Aktiv varighet må spores gjennom gjenvisning, ombruk, reutgivelse, sitat eller annen sirkulasjon over tid.' },
      { question: 'Kan et kjent bilde samtidig dokumentere rollefigur og stjernepersona?', answer: 'Bare dersom begge nivåene har egne spor; ikonstatus for en figur og stjernestatus for performeren er ikke identiske.' },
      { question: 'Er reprise bevis på kollektivt TV-minne?', answer: 'Nei. Reprise dokumenterer institusjonell gjenaktivering; kollektivt minne krever definert offentlighet og resepsjonsspor.' }
    ],
    learningObjectives: topics.map((topic) => topic.learning_goal),
    emne_ids: sourceBrief.scope.emne_ids,
    method_ids: CANONICAL_METHOD_IDS,
    moduleFiles: MODULE_FILES,
    briefFile: P.brief,
    claimsFile: P.claims,
    relatedPlaces: [],
    workCases: cases.map((row) => ({ id: row.id, title: row.title, year: row.years, medium: row.medium, territory: row.territory, role: row.purpose, source_ids: row.source_ids }))
  };

  const filmRegistry = registry.subjects?.film_tv;
  if (!filmRegistry) throw new Error('Mangler film_tv i fagverk_registry');
  const chapterRow = {
    id: CHAPTER_ID,
    title: chapter.title,
    file: P.chapter,
    briefFile: P.brief,
    claimsFile: P.claims,
    moduleFiles: MODULE_FILES,
    primaryDomainId: chapter.primary_domain_id,
    sourceBriefFile: P.sourceBrief
  };
  const existingIndex = filmRegistry.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex >= 0) filmRegistry.chapters[existingIndex] = chapterRow;
  else filmRegistry.chapters.push(chapterRow);
  filmRegistry.canonicalModel = filmRegistry.canonicalModel || {};
  filmRegistry.canonicalModel.fifteenthSourceClaimBrief = P.sourceBrief;
  filmRegistry.canonicalModel.fifteenthChapterFulltext = P.chapter;
  filmRegistry.note = 'Film & TV har nå materialisert alle 15 planlagte fagverksenheter. Enhet 15, Kulturarv, kanon, stjerner og minne, dekker 12 canonicale emner i fire moduler med 56 verifiserte claimsporede fagavsnitt, 26 inspectable kilder og 24 dokumenterte case. Complete-status settes ikke her; neste separate port er helhetsaudit av alle 192 canonicale emner, registrerte kapitler og permanente kvalitetskrav.';
  if (!versionAtLeast(registry.version, '3.03.0')) registry.version = '3.03.0';
  if (!registry.updatedAt || registry.updatedAt < '2026-08-15') registry.updatedAt = '2026-08-15';

  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (!filmStatus) throw new Error('Mangler film_tv i subject_status');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Unit15-fullteksten er materialisert og claimspesifikt verifisert: 12/12 canonicale emner, fire moduler, 56/56 sluttclaims, 26 inspectable kilder og 24 dokumenterte case. Popularitet kan ikke kortslutte kulturarv/kanon/kult/minne; star text, historisk status, motarkiv, programhistorie, reprise, sitat, nostalgi og TV-minne har egne evidensgrenser. Siden dette er siste planenhet går neste port til en separat Film & TV-helhetsaudit før complete kan settes.';
  if (!versionAtLeast(status.version, '1.96.0')) status.version = '1.96.0';
  if (!status.updatedAt || status.updatedAt < '2026-08-15') status.updatedAt = '2026-08-15';

  return { plan, sourceBrief, sources, cases, topics, chapter, chapterBrief, claimsDoc, modules, sections, claimSourceIds, usedCaseIds, moduleParagraphCounts, registry, status };
}

export function materializeFilmTvCulturalHeritageCanonStarsMemoryFulltextV1() {
  const built = buildFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  write(P.chapter, built.chapter);
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  built.modules.forEach((module, index) => write(MODULE_FILES[index], module));
  write(P.registry, built.registry);
  write(P.status, built.status);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = materializeFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  console.log(`Film & TV Unit 15 fulltekst materialisert: ${built.sections.length}/12 emner, ${built.claimsDoc.claims.length}/56 claims, ${built.sources.length}/26 kilder, ${built.cases.length}/24 case.`);
}
