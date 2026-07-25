#!/usr/bin/env node
import fs from "node:fs";

const file = "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const emner = JSON.parse(fs.readFileSync(file, "utf8"));

const patches = {
  em_naering_forbruk_marked: {
    definition: "Emnet undersøker hvordan husholdninger og andre kunder velger, kjøper, bruker og avstår fra varer og tjenester under begrensninger i inntekt, tid, informasjon, tilgjengelighet og sosiale forventninger.",
    why_it_matters: "Et marked består ikke bare av tilbud og pris. Etterspørselen formes av behov, vaner, reklame, kreditt, status, fysisk tilgang og ulik kjøpekraft, og forbruket får konsekvenser for arbeid, ressursbruk og avfall.",
    keywords: ["forbruk", "etterspørsel", "kjøpekraft", "budsjett", "preferanse", "valgarkitektur", "informasjon", "kreditt", "forbruksvane", "etterbruk"],
    key_concepts: ["forbruk", "etterspørsel", "kjøpekraft", "budsjettbegrensning", "preferanse", "informasjon", "valgarkitektur", "forbruksvane"],
    core_concepts: ["forbruk", "etterspørsel", "kjøpekraft", "budsjettbegrensning", "preferanse", "informasjon"],
    sub_concepts: ["impulskjøp", "abonnement", "kredittkjøp", "substitutt", "komplement", "gjenbruk", "reklamepåvirkning", "forbrukerrettighet"],
    key_questions: [
      "Hvem kjøper eller bruker varen eller tjenesten, og hvilket behov forsøker den å dekke?",
      "Hvordan påvirker pris, inntekt, tid, tilgjengelighet og informasjon den konkrete beslutningen?",
      "Hvilke vaner, sosiale signaler, reklamegrep eller kontraktsvilkår gjør valget mindre fritt eller oversiktlig?",
      "Hva skjer med varen, kostnaden og miljøbelastningen etter kjøpet eller bruken?"
    ],
    conflicts: ["behov vs skapt etterspørsel", "valgfrihet vs påvirkning", "lav pris vs skjulte kostnader", "kredittilgang vs gjeldsbelastning", "bekvemmelighet vs ressursbruk"],
    ideological_dimensions: ["forbrukersuverenitet vs markedsføring og makt", "individuelt ansvar vs produsentansvar", "vekst gjennom forbruk vs redusert ressursbruk", "fri kontrakt vs forbrukerbeskyttelse"],
    analysis_axes: ["behov vs ønske", "pris vs total kostnad", "informert valg vs påvirket valg", "kjøp vs bruk", "individuelt forbruk vs kollektiv konsekvens", "tilgang vs kjøpekraft"],
    quiz_angles: ["identify_customer_need_and_constraint", "trace_price_income_information_and_access", "compare_purchase_use_and_afterlife", "detect_marketing_credit_or_contract_influence"],
    blindspots: ["Registrert salg viser hva som ble kjøpt, ikke nødvendigvis hvorfor eller hvor nyttig kjøpet var.", "Kunden kan gjøre ubetalt arbeid gjennom selvbetjening, søk, montering og administrasjon.", "Lav utsalgspris kan bygge på kostnader som bæres av arbeidere, leverandører, miljø eller framtidige betalinger.", "Preferanser utvikles sosialt og kommersielt og skal ikke behandles som helt faste og private."],
    question_surface_mode: "consumer-need-choice-constraint-first",
    generator_use_note: "Start med en konkret kundegruppe, vare eller tjeneste og dokumentert kjøps- eller brukssituasjon. Spør om behov, pris, kjøpekraft, informasjon og tilgang før forbrukerteori introduseres.",
    overlap_resolution_note: "Bruk emnet når kundens beslutning og bruk står i sentrum. Bruk marked, konkurranse og pris for samspillet mellom tilbydere, og merkevare og status når symbolsk betydning driver valget.",
    anti_patterns: ["Ikke forklare salg utelukkende med at kundene ønsket produktet.", "Ikke bruke forbruker og kunde som om alle har samme kjøpekraft og informasjon.", "Ikke gjøre moralske påstander om overforbruk uten dokumenterte varer, praksiser og konsekvenser."]
  },
  em_naering_handel_butikk_byrom: {
    definition: "Emnet undersøker hvordan butikker, markeder, handelsgater og kjøpesentre kobler vareflyt, lokaler, åpningstider, kundestrømmer og servicearbeid til bestemte deler av byen.",
    why_it_matters: "Handel former gatebruk, transport, husleier og møteplasser. Beliggenhet, synlighet, varelevering og fottrafikk påvirker hvem som kan drive, hva som selges, og om byrommet blir mangfoldig eller ensrettet.",
    keywords: ["butikk", "handelsgate", "marked", "kjøpesenter", "fottrafikk", "butikkmiks", "åpningstid", "varelevering", "lokalleie", "fasade"],
    key_concepts: ["handelssted", "fottrafikk", "butikkmiks", "lokalleie", "tilgjengelighet", "varelevering", "åpningstid", "handelsomland"],
    core_concepts: ["handelssted", "fottrafikk", "butikkmiks", "lokalleie", "tilgjengelighet", "varelevering"],
    sub_concepts: ["ankervirksomhet", "utstillingsvindu", "handelsomland", "gateplan", "parkering", "kollektivtilgang", "sesonghandel", "markedshall"],
    key_questions: [
      "Hvorfor ligger handelsstedet akkurat her, og hvilke kunder, transportlinjer og nabofunksjoner støtter det?",
      "Hvordan kommer varer inn, kunder inn og avfall ut gjennom døgnet og uken?",
      "Hvordan påvirker lokalleie, eierskap, åpningstider og kjededrift hvilke butikker som overlever?",
      "Hva gjør handelen med gatebruk, møteplasser, tilgjengelighet og annen virksomhet i området?"
    ],
    conflicts: ["lokalhandel vs kjedekonsentrasjon", "fotgjengerliv vs bilbasert handel", "høy omsetning vs høye lokalleier", "handel som møteplass vs privatisert opphold", "varelevering vs byromskvalitet"],
    ideological_dimensions: ["fri etablering vs sentrums- og arealstyring", "privat kjøpesenter vs offentlig gate", "effektiv kjededrift vs lokalt mangfold", "forbrukstilgang vs transport- og miljøbelastning"],
    analysis_axes: ["gate vs kjøpesenter", "lokal aktør vs kjede", "kundeinngang vs vareinngang", "daghandel vs kveldsbruk", "lokalleie vs driftsmargin", "kommersielt rom vs offentlig rom"],
    quiz_angles: ["explain_store_location_and_customer_flow", "trace_goods_delivery_and_waste_route", "compare_street_market_and_mall", "connect_rent_ownership_and_shop_mix"],
    blindspots: ["Synlig kundeliv kan skjule nattarbeid, lager, logistikk og renhold.", "Et travelt handelssted er ikke nødvendigvis lønnsomt for alle butikkene dersom leien og kostnadene er høye.", "Kjøpesentre og handelsgater har ulike regler for opphold, åpning og ytring selv om begge virker offentlige.", "Netthandel fjerner ikke fysisk handelens infrastruktur, men flytter deler av den til lager, terminal og hjemlevering."],
    question_surface_mode: "location-flow-rent-public-space-first",
    generator_use_note: "Start med et konkret handelssted, dets beliggenhet, varer, kunder og leveringssystem. Spør hvordan handelens rom fungerer før generelle begreper om byliv eller marked brukes.",
    overlap_resolution_note: "Bruk emnet for handelens fysiske organisering i byen. Bruk forbruk og marked for kundens beslutning, tjenesteyting og service for arbeidsmøtet, og eiendom for lokalets verdi og finansiering.",
    anti_patterns: ["Ikke gjøre en gate til handelsgate bare fordi det finnes enkelte butikker.", "Ikke bruke høy fottrafikk som automatisk bevis på lønnsomhet.", "Ikke beskrive butikkfasaden uten å undersøke vareflyt, arbeid, leie og kundetilgang."]
  },
  em_naering_marked_konkurranse_pris: {
    definition: "Emnet undersøker hvordan kjøpere og selgere møtes, hvordan priser dannes, og hvordan antall aktører, markedsmakt, kostnader, kapasitet, informasjon og etableringshindre påvirker konkurransen.",
    why_it_matters: "Pris er et resultat av konkrete institusjoner og maktforhold, ikke bare et nøytralt signal. Konkurransen kan presses av konsentrasjon, nettverkseffekter, kontroll over distribusjon og ulik tilgang til informasjon og kapital.",
    keywords: ["marked", "konkurranse", "pris", "tilbud", "etterspørsel", "markedsmakt", "etableringshinder", "konsentrasjon", "prisdiskriminering", "nettverkseffekt"],
    key_concepts: ["pris", "tilbud", "etterspørsel", "markedsmakt", "konkurranseform", "etableringshinder", "markedskonsentrasjon", "prisdiskriminering"],
    core_concepts: ["pris", "tilbud", "etterspørsel", "markedsmakt", "etableringshinder", "markedskonsentrasjon"],
    sub_concepts: ["monopol", "oligopol", "priselastisitet", "byttekostnad", "nettverkseffekt", "anbud", "rabatt", "dynamisk prising"],
    key_questions: [
      "Hvilke varer eller tjenester konkurrerer faktisk om de samme kundene, og hvor stort er markedet?",
      "Hvor mange tilbydere finnes, og hvilke etableringshindre, kostnadsfordeler eller nettverkseffekter beskytter dem?",
      "Hvordan fastsettes den konkrete prisen, og varierer den mellom kunder, tidspunkter eller salgskanaler?",
      "Hvilken dokumentasjon viser konkurranse, samarbeid, markedsmakt eller myndighetsinngrep?"
    ],
    conflicts: ["lav pris vs bærekraftig drift", "konkurranse vs konsentrasjon", "prisfrihet vs forbrukervern", "stordriftsfordel vs etableringsmulighet", "personalisert pris vs likebehandling"],
    ideological_dimensions: ["fri konkurranse vs konkurranseregulering", "effektiv konsentrasjon vs markedsmakt", "pris som markedssignal vs pris som strategisk kontroll", "nasjonalt marked vs lokal tilgjengelighet"],
    analysis_axes: ["tilbud vs etterspørsel", "mange aktører vs konsentrasjon", "pris vs kostnad", "inngang vs etableringshinder", "standardpris vs prisdiskriminering", "konkurranse vs koordinering"],
    quiz_angles: ["define_actual_market_and_substitutes", "identify_price_setting_actor_and_method", "map_entry_barrier_and_market_power", "compare_price_cost_quality_and_capacity"],
    blindspots: ["Mange merkenavn kan tilhøre få eiere og gi mindre konkurranse enn butikkhyllen antyder.", "Lik pris betyr ikke nødvendigvis aktiv konkurranse, og ulik pris betyr ikke nødvendigvis bedre konkurranse.", "Markedsavgrensningen avgjør om en aktør framstår liten eller dominerende.", "Kostnader hos leverandører, arbeidere eller miljø kan være utelatt fra den synlige markedsprisen."],
    question_surface_mode: "market-actors-price-setting-barriers-first",
    generator_use_note: "Start med et avgrenset produktmarked, dokumenterte tilbydere og en konkret pris eller konkurransehendelse. Forklar hvem som setter prisen og hvilke alternativer kundene faktisk har.",
    overlap_resolution_note: "Bruk emnet for prisdannelse og konkurransestruktur. Bruk verdsetting, pris og regnskap for måleregler og bokførte verdier, og forbruk og marked for kundens valg under begrensninger.",
    anti_patterns: ["Ikke anta at en pris er markedsbestemt uten å identifisere aktører og prisprosess.", "Ikke kalle en virksomhet monopol bare fordi den er eneste aktør på ett sted.", "Ikke bruke konkurrentenes antall uten å vurdere eierskap, substitutter og etableringshindre."]
  },
  em_naering_merkevare_og_status: {
    definition: "Emnet undersøker hvordan navn, symboler, design, historier, omdømme og sosial bruk gjør en vare eller virksomhet gjenkjennelig og gir den betydning utover den praktiske funksjonen.",
    why_it_matters: "Merkevarer kan redusere usikkerhet og bygge tillit, men også skape prisforskjeller, statusmarkører og lojalitet som gjør konkurransen mindre gjennomsiktig. Verdien er avhengig av både markedsarbeid og publikums bruk.",
    keywords: ["merkevare", "identitet", "posisjonering", "omdømme", "statussignal", "logo", "design", "lojalitet", "autentisitet", "merkevarekapital"],
    key_concepts: ["merkevare", "posisjonering", "omdømme", "statussignal", "merkevarekapital", "lojalitet", "autentisitet", "differensiering"],
    core_concepts: ["merkevare", "posisjonering", "omdømme", "statussignal", "lojalitet", "differensiering"],
    sub_concepts: ["logo", "slagord", "design", "sponsorat", "opprinnelsesfortelling", "merkeutvidelse", "motmerkevare", "omdømmekrise"],
    key_questions: [
      "Hvilke navn, symboler, produkter og fortellinger gjør merkevaren gjenkjennelig?",
      "Hvilken kundegruppe og hvilken forskjell fra konkurrentene forsøker virksomheten å etablere?",
      "Hvordan brukes merkevaren som signal om kvalitet, tilhørighet, smak eller status?",
      "Hvilke hendelser, praksiser eller motfortellinger styrker eller svekker omdømmet?"
    ],
    conflicts: ["produktkvalitet vs symbolverdi", "autentisitet vs iscenesettelse", "lojalitet vs byttekostnad", "statusgevinst vs sosial ekskludering", "merkevareløfte vs dokumentert praksis"],
    ideological_dimensions: ["forbrukeruttrykk vs kommersiell påvirkning", "kulturell betydning vs privat eierskap", "global merkevare vs lokal identitet", "omdømmestyring vs offentlig kritikk"],
    analysis_axes: ["funksjon vs symbol", "produkt vs fortelling", "selvbilde vs andres vurdering", "kvalitet vs status", "bedriftens budskap vs publikums bruk", "omdømme vs praksis"],
    quiz_angles: ["identify_brand_symbol_story_and_audience", "compare_functional_and_symbolic_value", "trace_reputation_event_and_response", "explain_price_or_loyalty_through_positioning"],
    blindspots: ["En logo eller reklamekampanje er ikke alene en sterk merkevare; gjenkjennelse og sosial bruk må dokumenteres.", "Omdømme kan avvike fra arbeidsforhold, produktkvalitet og miljøvirkning.", "Publikum kan omtolke, parodiere eller avvise merkevarens planlagte betydning.", "Høy pris kan være både kvalitetsindikator og statusstrategi og må ikke forklares automatisk av produksjonskostnad."],
    question_surface_mode: "brand-symbol-audience-reputation-first",
    generator_use_note: "Start med et konkret produkt, symbol, kampanje eller omdømmehendelse. Spør hva virksomheten forsøkte å signalisere og hvordan kundene faktisk brukte eller tolket merkevaren.",
    overlap_resolution_note: "Bruk emnet når symbolsk identitet, omdømme og status er hovedsaken. Bruk forbruk og marked for beslutningsbegrensninger, og marked, konkurranse og pris for prisdannelse og markedsstruktur.",
    anti_patterns: ["Ikke bruke merkevare som synonym for selskap eller produktnavn.", "Ikke påstå statusverdi uten dokumentasjon på målgruppe, pris, bruk eller kulturell betydning.", "Ikke gjengi virksomhetens egen merkevarefortelling som nøytral fakta."]
  },
  em_naering_tjenesteyting_og_service: {
    definition: "Emnet undersøker hvordan tjenester produseres i møtet mellom ansatte, kunder, lokaler, teknologi og tidsplaner, og hvordan kvalitet, kapasitet og ansvar håndteres når resultatet ofte ikke kan lagres eller kontrolleres på forhånd.",
    why_it_matters: "Servicearbeid kombinerer faglige oppgaver, koordinering og følelsesarbeid. Kundens opplevelse avhenger både av synlige ansatte og av skjulte systemer for booking, betaling, renhold, logistikk og oppfølging.",
    keywords: ["tjeneste", "service", "kundemøte", "tjenestekvalitet", "kø", "kapasitet", "booking", "emosjonelt arbeid", "selvbetjening", "service recovery"],
    key_concepts: ["tjenesteproduksjon", "kundemøte", "tjenestekvalitet", "kapasitet", "kø", "emosjonelt arbeid", "selvbetjening", "tjenestefeil"],
    core_concepts: ["tjenesteproduksjon", "kundemøte", "tjenestekvalitet", "kapasitet", "kø", "emosjonelt arbeid"],
    sub_concepts: ["booking", "ventetid", "frontstage", "backstage", "service recovery", "standardisering", "kundearbeid", "tilgjengelighet"],
    key_questions: [
      "Hvilken konkret tjeneste leveres, og hvilke synlige og skjulte arbeidsoppgaver kreves?",
      "Hvordan fordeles kapasitet, tid og kø når etterspørselen varierer?",
      "Hvilke deler utfører kunden selv, og hvilke tekniske eller menneskelige systemer støtter møtet?",
      "Hvordan oppdages og rettes feil, og hvem bærer kostnaden når tjenesten svikter?"
    ],
    conflicts: ["standardisering vs personlig tilpasning", "kundehastighet vs arbeidskvalitet", "tilgjengelighet vs bemanningskostnad", "selvbetjening vs overført kundearbeid", "vennlighet som krav vs emosjonell belastning"],
    ideological_dimensions: ["kunden som suveren vs arbeidstakerens grenser", "effektiv service vs profesjonelt skjønn", "digital selvbetjening vs universell tilgjengelighet", "privat tjeneste vs offentlig behov"],
    analysis_axes: ["frontstage vs backstage", "kunde vs ansatt", "standard vs tilpasning", "kapasitet vs etterspørsel", "ventetid vs bemanning", "tjenesteløfte vs faktisk levering"],
    quiz_angles: ["map_visible_and_hidden_service_tasks", "trace_capacity_queue_and_booking", "identify_customer_self_service_work", "explain_failure_recovery_and_cost_bearer"],
    blindspots: ["Kundens møte med én ansatt kan være avhengig av mange støttefunksjoner og datasystemer.", "Selvbetjening reduserer ikke alltid samlet arbeid, men flytter oppgaver til kunden.", "Målt kundetilfredshet fanger ikke nødvendigvis faglig kvalitet, arbeidsbelastning eller utilgjengelige brukere.", "Servicekrav kan gjøre følelsesuttrykk og tilgjengelighet til en del av det betalte arbeidet."],
    question_surface_mode: "service-task-customer-capacity-first",
    generator_use_note: "Start med en konkret tjeneste, arbeidsoppgave og kundesituasjon. Kartlegg frontstage, backstage, kapasitet og feilretting før service- eller opplevelsesbegreper brukes.",
    overlap_resolution_note: "Bruk emnet for hvordan tjenesten produseres og leveres. Bruk arbeidsliv og organisering for kontrakter og myndighet, usynlig arbeid for skjulte støtteoppgaver, og forbruk og marked for kundens kjøpsbeslutning.",
    anti_patterns: ["Ikke redusere service til høflighet eller kundetilfredshet.", "Ikke kalle en virksomhet tjenesteyter uten å identifisere hva kunden faktisk mottar.", "Ikke framstille selvbetjening som automatisering uten å vise hvilke oppgaver som flyttes til kunden."]
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
    curation_batch: "naeringsliv_handel_forbruk_v1",
    curation_date: "2026-07-25"
  });
}

const fields = ["definition", "why_it_matters", "key_questions", "conflicts", "ideological_dimensions", "analysis_axes", "blindspots", "generator_use_note", "overlap_resolution_note", "anti_patterns"];
for (const field of fields) {
  const values = Object.keys(patches).map(id => JSON.stringify(emner.find(item => item.emne_id === id)[field]));
  if (new Set(values).size !== values.length) throw new Error(`Feltet ${field} er ikke individuelt for alle fem emner`);
}

for (const id of Object.keys(patches)) {
  const text = JSON.stringify(emner.find(item => item.emne_id === id));
  for (const phrase of genericPhrases) {
    if (text.includes(phrase)) throw new Error(`${id} beholder generisk standardtekst: ${phrase}`);
  }
}

fs.writeFileSync(file, `${JSON.stringify(emner, null, 2)}\n`);
console.log(`Kuraterte ${Object.keys(patches).length} handels- og forbruksemner individuelt.`);
