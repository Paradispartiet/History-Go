import { id, sourceDefs } from "./peststotten-krist-kirkegard-content.mjs";

export const phases = ["opening", "middle", "bridge", "final"];
export const phaseTitles = ["Peståret og monumentet", "Kirkegårdens senere lag", "Minne, kunst og kildegrenser", "Sporlesning og tidslag"];

const defs = [
  ["Hvilket år ble Peststøtten reist?", "1654", ["1624", "1835"], "byleksikon_pest", "em_his_minnesteder_historiebruk"],
  ["Hvor står Peststøtten?", "Ved inngangen til Krist kirkegård", ["På Vår Frelsers gravlund", "Ved Akershus slottskirke"], "byleksikon_pest", "em_his_spor_materialitet"],
  ["Hvilket materiale er Peststøtten laget av?", "Kalkstein", ["Granitt", "Tre"], "byleksikon_pest", "em_his_spor_materialitet"],
  ["Hva står øverst på monumentet?", "Et kors", ["En krone", "En løve"], "byleksikon_pest", "em_his_spor_materialitet"],
  ["Hvorfor ble Krist kirkegård tatt i bruk i 1654?", "Pesten skapte behov for flere gravsteder", ["Byen skulle få park", "Et nytt slott skulle bygges"], "oslo_krist", "em_his_sosialhistorie_hverdagsliv"],
  ["Hvem oppgir innskriften som den første gravlagte?", "Arne Sigvardsøn fra Vang", ["Edvard Munch", "Christian IV"], "byleksikon_pest", "em_his_minnesteder_historiebruk"],
  ["Hva gjør innskriften historisk nyttig?", "Den knytter navn og år til monumentet", ["Den viser alle dødsårsaker", "Den gir et fullstendig folketall"], "byleksikon_pest", "em_his_spor_materialitet"],
  ["Hvilken senere epidemi førte til en utvidelse i 1835?", "Kolera", ["Spanskesyken", "Kopper"], "byleksikon_krist", "em_his_sosialhistorie_hverdagsliv"],
  ["Hvilket år ble kirkegården utvidet under koleraen?", "1835", ["1814", "1905"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Hvilke år fulgte nye dokumenterte utvidelser?", "1840 og 1856", ["1700 og 1716", "1918 og 1945"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Når ble Krist kirkegård stengt for nye begravelser?", "1924", ["1856", "1999"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Når ble smijernsgjerdet montert?", "1971", ["1654", "1835"], "byleksikon_krist", "em_his_minnesteder_historiebruk"],
  ["Hvor ble smijernsgjerdet laget?", "Ved Christiania Spigerverk", ["Ved Kongsberg Sølvverk", "Ved Akers mekaniske verksted"], "byleksikon_krist", "em_his_minnesteder_historiebruk"],
  ["Hva dokumenterer Oslo kommune for 1999?", "Rehabilitering og åpning som minnepark", ["Ny massegrav", "Riving av Peststøtten"], "oslo_krist", "em_his_minnesteder_historiebruk"],
  ["Hvilken tilknytning har Edvard Munch til Krist kirkegård?", "Flere nære familiemedlemmer er gravlagt der", ["Han tegnet Peststøtten", "Han grunnla kirkegården"], "lokal_krist", "em_his_minnesteder_historiebruk"],
  ["Hvilket motiv knytter Munchs kunst til stedet?", "Moren Lauras grav", ["Akershus festning", "Karl Johans gate"], "lokal_krist", "em_his_minnesteder_historiebruk"],
  ["Hva er den sikreste måten å bruke Peststøtten som kilde på?", "Skille innskriftens opplysninger fra det den ikke forteller", ["Anta at den beskriver alle ofre", "Bruke den uten andre kilder"], "byleksikon_pest", "em_his_spor_materialitet"],
  ["Hvorfor behandles et eksakt samlet dødstall forsiktig?", "Åpne kilder gir ulike eller usikre anslag", ["Årstallet 1654 er ukjent", "Peststøtten mangler innskrift"], "lokal_pest", "em_his_sosialhistorie_hverdagsliv"],
  ["Hva er forskjellen mellom monumentet og gravplassen?", "Monumentet er ett minnespor inne i et større historisk gravplassmiljø", ["De er to navn på samme stein", "Gravplassen ble laget i 1999"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Hva viser kolerautvidelsen i 1835?", "At gravplassens historie fortsatte etter peståret", ["At støtten ble reist på nytt", "At kirkegården ble flyttet"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Hva tilfører minneparken fra 1900-tallet til stedet?", "Et nytt lag av bevaring og offentlig historiebruk", ["Et nytt pestutbrudd", "Et nytt middelalderlag"], "oslo_krist", "em_his_minnesteder_historiebruk"],
  ["Hva bør du sammenligne når du gjør sporlesning her?", "Materiale, innskrift, plassering og skriftlige kilder", ["Bare monumentets størrelse", "Bare moderne gatenavn"], "byleksikon_pest", "em_his_spor_materialitet"],
  ["Hva er et kildekritisk spørsmål til innskriften?", "Hvem valgte hva som skulle stå der?", ["Hvor mange trær finnes i parken?", "Hvilken buss går nærmest?"], "byleksikon_pest", "em_his_minnesteder_historiebruk"],
  ["Hvorfor sammenligne Oslo kommune og Oslo byleksikon?", "De dekker ulike deler av bruk, kronologi og bevaring", ["De er samme dokument", "Bare én av dem har årstall"], "oslo_krist", "em_his_historiske_lag_i_byrom"],
  ["Hva betyr et historisk brudd i dette stedet?", "At funksjon eller bruk endres selv om eldre spor blir stående", ["At all historie forsvinner", "At alle gravminner er samtidige"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Hva kan kildenes taushet minne oss om?", "At mange berørtes egne erfaringer ikke er direkte bevart", ["At pesten aldri fant sted", "At monumentet er nytt"], "lokal_pest", "em_his_sosialhistorie_hverdagsliv"],
  ["Hva er en god periodisering av stedet?", "Pestgravplass, senere gravplassutvidelser og minnepark", ["Bare 1654", "Bare tiden etter 1999"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"],
  ["Hva hjelper begrepet historiske tidslag oss å forstå her?", "At spor fra ulike perioder står sammen uten å være samtidige", ["At alle spor er fra 1654", "At fysiske spor ikke trenger kilder"], "byleksikon_krist", "em_his_historiske_lag_i_byrom"]
];

export const quizQuestions = defs.map(([question, answer, distractors, sourceId, emneId], index) => {
  const n = String(index + 1).padStart(2, "0");
  const item = {
    id: `${id}_quiz_${n}`,
    quiz_id: `historie_${id}_set_${Math.floor(index / 7) + 1}_q${index % 7 + 1}`,
    categoryId: "historie", placeId: id, targetId: id, personId: "", natureId: "", question_scope: "place",
    question, options: [answer, ...distractors], answer, answerIndex: 0,
    dimension: index < 14 ? "grunnlag" : index < 21 ? "sammenheng" : "metode",
    topic: `${id}_${n}`, knowledge: answer, trivia: [], difficulty: Math.floor(index / 7) + 1,
    question_type: index < 14 ? "fact" : index < 21 ? "context" : "concept",
    year: null, epoke_id: null, epoke_domain: "historie", emne_id: emneId, related_emner: [], core_concepts: [], concept_focus: [], learning_paths: [],
    tags: [id, "oslo", "historie"], required_tags: [], source: [sourceId], method_id: null,
    primary_knowledge_unit_id: `ku_his_${id}_${n}`, knowledge_unit_ids: [`ku_his_${id}_${n}`], concept_ids: index >= 21 ? ["co_his_kildekritikk"] : [], term_ids: [],
    knowledge_contract_version: 1, knowledge_link_status: "linked", source_origin: "external", claim_basis: answer, claim_id: `claim_${id}_quiz_${n}`,
    concepts: index >= 21 ? ["kildekritikk", "historiske lag"] : ["historisk endring"]
  };
  if (index >= 21) Object.assign(item, { method_id: index % 2 === 0 ? "met_sporlesning" : "met_kildekritikk", guidance_basis: ["data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/methods_historie_canonical_v4_5.json"] });
  if (index === 27) Object.assign(item, { topic_hook_id: "his_tidslag_samtidighet", thinker_id: "fernand_braudel", theory_ref: { topic_hook_id: "his_tidslag_samtidighet", thinker_id: "fernand_braudel", work: "The Mediterranean and the Mediterranean World", why_it_helps: "Braudels skille mellom hendelser og lang varighet hjelper til å holde peståret, senere gravplassbruk og minneparken fra hverandre uten å erstatte de stedsspesifikke kildene." } });
  return item;
});

export const selectedCurriculum = {
  module_ids: ["his_tid_periodisering", "his_kilder_arkiv_spor", "his_byhistorie_stedsendring"],
  emne_ids: ["em_his_sosialhistorie_hverdagsliv", "em_his_minnesteder_historiebruk", "em_his_spor_materialitet", "em_his_historiske_lag_i_byrom"],
  topic_hook_ids: ["his_tidslag_samtidighet", "his_spor_materialitet", "his_kildekritikk"],
  method_ids: ["met_sporlesning", "met_kildekritikk"], thinker_ids: ["fernand_braudel"], works: ["The Mediterranean and the Mediterranean World"]
};
export const existingQuizAudit = { searched_paths: ["data/quiz/manifest.json", `data/quiz/historie/${id}_sets.json`], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen aktiv target-quiz var registrert." }, decisions: ["Produser ny source-led normal 4x7-progresjon."], knowledge_migration: "Ikke relevant; ingen eldre target-spørsmål er aktive." };
export const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire tydelige læringsjobber dekker 1654, senere gravplasslag, minnebruk og kildekritisk metode." };
export const heldBackCandidates = ["Ett eksakt samlet dødstall for Christiania i 1654.", "Sensasjonelle pestdetaljer uten stedlig kildeverdi.", "Påstand om at Edvard Munch selv er gravlagt på Krist kirkegård."];
export const quizSources = Object.fromEntries(Object.entries(sourceDefs).map(([key, source]) => [key, source.url]));
