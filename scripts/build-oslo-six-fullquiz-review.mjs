#!/usr/bin/env node
// Three source-bounded *candidate* 3x7 fullquizzes; never writes runtime manifests.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixCardReview } from './build-oslo-six-card-review.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GATE = JSON.parse(readFileSync(resolve(ROOT, 'reports/place-production/oslo-six-places-integration-gates-20261022.json'), 'utf8'));
const SOURCE_URLS = Object.freeze({
  ekebergrestauranten: 'https://oslobyleksikon.no/side/Ekebergrestauranten',
  frognerseteren: 'https://oslobyleksikon.no/side/Frognerseteren',
  sarabraten: 'https://oslobyleksikon.no/side/Sarabr%C3%A5ten',
  saeterhytten_bygdoy: 'https://oslobyleksikon.no/side/S%C3%A6terhytten',
  kristiania_teglverk_bryn: 'https://teglverk.no/kristiania-teglverk/'
});

// Each fact below was checked against the named Oslo byleksikon place article.
// Retain explicit review status: article-level review is not source->claim audit or canonical preflight.
// Format: question, correct answer, three distinct distractors, explanation.
const EXTRAS = Object.freeze({
  ekebergrestauranten: [
    ['Hvilken fabrikk eide paviljongen som ble Ekebergs første restaurant?', 'Tiedemanns Tobaksfabrik', ['Freia', 'Frydenlund Bryggeri', 'Christiania Spigerverk'], 'Den første restaurantbygningen var opprinnelig Tiedemanns Tobaksfabriks paviljong ved Jubileumsutstillingen i 1914.'],
    ['Hvem var arkitekt for den første paviljongen som ble restaurant i 1916?', 'Erik Glosimodt', ['Lars Backer', 'Holm Munthe', 'Arnstein Arneberg'], 'Erik Glosimodt tegnet utstillingspaviljongen. Lars Backer tegnet det senere funksjonalistiske nybygget.'],
    ['Hvilken arkitekturstil hadde den første trebygningen på Ekeberg?', 'Nasjonal nybarokk', ['Funksjonalisme', 'Dragestil', 'Brutalisme'], 'Paviljongen fra Jubileumsutstillingen var en trebygning i nasjonal nybarokkstil, mens nybygget fra 1929 var funksjonalistisk.'],
    ['Hvem bestemte i 1926 at Ekebergrestauranten skulle få et nytt bygg?', 'Kommunen', ['Fortidsminneforeningen', 'Jernbaneverket', 'Norsk Folkemuseum'], 'Kommunen besluttet i 1926 å bygge nytt. Finansiering og konsesjonsvilkår satte også preg på den nye restaurantdriften.'],
    ['Hvilket bryggeri ga lån til nybygget som sto ferdig i 1929?', 'Schous Bryggeri', ['Ringnes Bryggeri', 'Frydenlund Bryggeri', 'Hansa Bryggeri'], 'Schous Bryggeri ga lån til nybygget, mot vilkår om hvilke drikkevarer som kunne serveres.'],
    ['Hvilke drikkevarer var omfattet av salgsvilkåret knyttet til bryggerilånet?', 'Øl fra Schou og mineralvann fra Nora', ['Øl fra Ringnes og mineralvann fra Farris', 'Øl fra Frydenlund og mineralvann fra Solo', 'Øl fra Hansa og mineralvann fra Oscar Sylte'], 'Lånet fra Schous Bryggeri var betinget av at restauranten bare solgte øl fra Schou og mineralvann fra Nora.'],
    ['Hvilken farge hadde Ekebergrestauranten opprinnelig etter oppføringen?', 'Varm brunfarge', ['Helhvit', 'Mørkegrønn', 'Mursteinsrød'], 'Lars Backers bygg var opprinnelig malt i en varm brunfarge, selv om senere fotografier kan vise et annet uttrykk.'],
    ['Hvilke trær skulle bygningens opprinnelige brunfarge harmonere med?', 'Furutrær', ['Bjørketrær', 'Kastanjetrær', 'Lindetrær'], 'Den varme brunfargen var valgt for å passe til furustammene i skråningen rundt utsiktsrestauranten.'],
    ['Hva var kommandopostens militære oppgave under okkupasjonen knyttet til?', 'Luftvernartilleriet på Ekebergsletta', ['Ubåtforsvaret i Oslofjorden', 'Militært veiarbeid på Bygdøy', 'Jernbanesikring på Grorud'], 'Under krigen var restauranten kommandopost med peilestasjon for luftvernet på Ekebergsletta.'],
    ['Hvem foreslo fredning av Ekebergrestaurantens anlegg i 1997?', 'Fortidsminneforeningen', ['Oslo Sporveier', 'Norsk Folkemuseum', 'Schous Bryggeri'], 'Fortidsminneforeningen tok i 1997 til orde for fredning av eksteriør, terrasseanlegg og deler av interiøret.'],
    ['Hvilken restauratør kjøpte anlegget i 2002 sammen med Christian Ringnes og Eiendomsspar?', 'Bjørn Tore Furset', ['Jens P. Heyerdahl', 'Olav Selvaag', 'Arne Garborg'], 'Restauratør Bjørn Tore Furset gikk inn i kjøpet av anlegget i 2002. Gjenåpningen kom tre år senere.']
  ],
  frognerseteren: [
    ['Hva het skogområdet som Frognerseteren opprinnelig var del av?', 'Trevollskogen', ['Lillomarka', 'Svartdalen', 'Frognerseterskogen som eget gods'], 'Frognerseteren var seter i Trevollskogen, skog som lå under Frogner hovedgård.'],
    ['Hvem tegnet Heftyevillaen fra 1867 i det historiske miljøet ved Frognerseteren?', 'Herman Major Schirmer', ['Holm Munthe', 'Lars Backer', 'Christian Heinrich Grosch'], 'Heftyevillaen ble tegnet av Herman Major Schirmer og må ikke forveksles med restaurantbygningen tegnet av Holm Munthe.'],
    ['Hva flyttet Thomas Heftye til Frognerseteren i 1880-årene?', 'Gamle bondestuer', ['En jernbanestasjon', 'En teglverksovn', 'Et gammelt fyrtårn'], 'Heftye flyttet eldre bondestuer til tunet og ga stedet en tydelig forbindelse til et idealisert norsk bygdemiljø.'],
    ['Hvilke to regenter var til stede da den nye veien til Frognerseteren åpnet i 1890?', 'Oscar II og Wilhelm II', ['Oscar I og Karl XV', 'Haakon VII og Christian X', 'Harald V og Carl XVI Gustaf'], 'Den nye veien ble åpnet i 1890 i nærvær av Oscar II og den tyske keiser Wilhelm II.'],
    ['Hva het veistrekningen mot Frognerseteren før navneendringen etter andre verdenskrig?', 'Keiser Wilhelms vei', ['Kong Olavs vei', 'Heftyes allé', 'Frognerseterbakken'], 'Veien fikk først navn etter keiser Wilhelm II og ble omdøpt etter andre verdenskrig.'],
    ['Hvilket annet utfartsbygg ved Frognerseteren ble tegnet av Holm Munthe?', 'Frognerseteren Sportshall', ['Skimuseet fra 1923', 'Heftyevillaen', 'Frognerseteren T-banestasjon'], 'Holm Munthe tegnet både hovedrestauranten og Sportshallen i dragestil, mens Heftyevillaen hadde en annen arkitekt.'],
    ['Hvilket år ble Frognerseteren Sportshall oppført?', '1896', ['1867', '1891', '1916'], 'Sportshallen ble oppført i 1896, noen år etter hovedrestauranten. Dette er separate bygninger i samme utfartsmiljø.'],
    ['Hvilket museum åpnet mellom restauranten og Sportshallen i 1923?', 'Skimuseet', ['Norsk Folkemuseum', 'Teknisk Museum', 'Frammuseet'], 'Skimuseet åpnet her i 1923 og ble flyttet til Holmenkollbakken i 1951. Det er del av nærmiljøets historie, ikke selve restauranten.'],
    ['Hva ble sletta nedenfor Skimuseet brukt til i perioden 1922–1951?', 'Start og innkomst for langrenn i Holmenkollrennene', ['Oppstilling for en flyplass', 'Produksjon av teglstein', 'Endestasjon for en hestetrikk'], 'Sletta var start- og innkomstområde for langrennsøvelsene i Holmenkollrennene mellom 1922 og 1951.'],
    ['Når fikk Frognerseteren endestasjon på Holmenkollbanen?', '1916', ['1890', '1891', '1936'], 'Holmenkollbanen nådde Frognerseteren i 1916. Stasjonen ligger høyere oppe enn hovedrestauranten og er ikke samme bygning.'],
    ['Hva skjedde med den gamle Skimuseumsbygningen ved Frognerseteren i 1968?', 'Den brant ned', ['Den ble flyttet til Bygdøy', 'Den ble gjort om til rådhus', 'Den ble bygget om til en teglverksovn'], 'Det gamle Skimuseets bygg, senere brukt til garderober og treningslokaler, brant i 1968. Det må ikke forveksles med restaurantens historie.']
  ],
  sarabraten: [
    ['Hva slags gods ble Sarabråten omtalt som i lensregnskapet fra 1578?', 'Oslo stiftsgods', ['Kongelig lystgård', 'Kommunal allmenning', 'Statlig teglverk'], 'Jørgensrud, senere Sarabråten, er omtalt som Oslo stiftsgods i Akershus lensregnskap i 1578.'],
    ['Hvilken gård ble Sarabråten lagt under i 1663?', 'Rustad', ['Bogstad', 'Linderud', 'Frogner'], 'Sarabråten ble lagt under Rustad i 1663 og senere skilt ut igjen sammen med Bremsrud.'],
    ['Hvilket år ble Sarabråten skilt ut igjen sammen med Bremsrud?', '1723', ['1578', '1663', '1852'], 'Etter å ha ligget under Rustad ble eiendommen skilt ut igjen sammen med Bremsrud i 1723.'],
    ['Hvilket handelshus kjøpte eiendommen omkring 1840?', 'Tho. Joh. Heftye & Søn', ['Schous Bryggeri', 'Ringnes & Co.', 'Christiania Spigerverk'], 'Handelshuset Tho. Joh. Heftye & Søn kjøpte Sarabråten omkring 1840, før Thomas Joh. Heftye overtok fra farens firma i 1852.'],
    ['Hvilke to arkitekter tegnet sperrestua som ble oppført i 1856?', 'H. E. Schirmer og Wilhelm von Hanno', ['Holm Munthe og Lars Backer', 'Erik Glosimodt og Arnstein Arneberg', 'Christian Heinrich Grosch og Henrik Bull'], 'Sperrestua fra 1856 var tegnet av H. E. Schirmer og Wilhelm von Hanno. Bygningen ble senere kalt Kuskeboligen.'],
    ['Hvilken bruk av Nøklevann knyttes til utfartsstedet Sarabråten?', 'Lystfart med hjulbåten Sara', ['Organisert havnefart for lasteskip', 'Kongelig marinehavn', 'Jernbanefrakt av tømmer'], 'Hjulbåten Sara fraktet besøkende på Nøklevann som del av Heftyes tilrettelegging for utfart.'],
    ['Hvem fikk oppført den nye dragestilsvillaen i 1897?', 'Thomas Thomassen Heftye', ['Thomas Joh. Heftye', 'Holm Munthe', 'Oscar II'], 'Det var Thomas Thomassen Heftye som fikk oppført dragestilsvillaen i 1897, en annen generasjon enn Thomas Joh. Heftye fra 1852.'],
    ['Hvem kjøpte Sarabråten i 1911?', 'Aker kommune', ['Kristiania kommune', 'Staten', 'Norsk Folkemuseum'], 'Aker kommune kjøpte Sarabråten i 1911. De historiske bygningene ble senere borte.'],
    ['Hva ble sperrestua kalt etter en senere ombygging?', 'Kuskeboligen', ['Heftyevillaen', 'Skistua', 'Sæterhytten'], 'Sperrestua fra 1856 ble senere bygd om til Kuskeboligen, som var det siste huset som sto igjen.'],
    ['Til hvilket år var det serveringssted i Kuskeboligen?', '1943', ['1897', '1911', '1971'], 'Kuskeboligen hadde serveringssted fram til 1943. Selve bygningen brant først i 1971.'],
    ['I hvilket tidsrom ble Sarabråtrennet holdt?', '1902–1928', ['1891–1909', '1911–1945', '1946–1971'], 'Skirennet Sarabråtrennet ble arrangert fra 1902 til 1928 og fikk tilnavnet Østkantens Holmenkollrenn.']

  ],
  saeterhytten_bygdoy: [
    ['Hvilken stil ble Sæterhytten ifølge Oslo byleksikon reist i?', 'Nasjonal stil', ['Funksjonalisme', 'Jugendstil', 'Brutalisme'], 'Oslo byleksikon omtaler Sæterhytten som oppført i nasjonal stil. Stilbetegnelsen må skilles fra bygningens tidligere badehusfunksjon.'],
    ['Hvilken fjordarm ligger Sæterhytten høyt over på Dronningberget?', 'Frognerkilen', ['Bunnefjorden', 'Bestumkilen', 'Hvervenbukta'], 'Sæterhytten ligger høyt på Dronningberget vest for den innerste delen av Frognerkilen.'],
    ['Hvem var moren til dronning Louise som deltok ved innvielsen?', 'Prinsesse Louise av Nederlandene', ['Dronning Maud', 'Prinsesse Märtha av Sverige', 'Dronning Desideria'], 'Dronning Louises mor, prinsesse Louise av Nederlandene, var til stede da paviljongen ble innviet i 1862.'],
    ['Hva ble dronning Louises datter Louise senere?', 'Dronning av Danmark', ['Dronning av Storbritannia', 'Dronning av Belgia', 'Dronning av Portugal'], 'Datteren Louise, som deltok på innvielsen sammen med sin mor og mormor, ble senere dronning av Danmark.'],
    ['Hva het diktet Henrik Ibsen skrev til Sæterhyttens åpning?', 'Reist er Hytten paa Norges Fjeld', ['Ja, vi elsker dette landet', 'Terje Vigen', 'Til Ungdommen'], 'Henrik Ibsens dikt til innvielsen begynte med ordene «Reist er Hytten paa Norges Fjeld».'],
    ['Hvilken ny paviljong ble satt opp ved Sæterhytten i 1866?', 'En musikkpaviljong', ['En glasspaviljong for botanikk', 'En kongelig jaktstue', 'En teglverksbygning'], 'En musikkpaviljong ble satt opp i 1866, samme år som det begynte servering i Sæterhytten.'],
    ['Hva ble bygd til ved Sæterhyttens nordende i 1881?', 'Kjeller og kjøkken', ['Et kirketårn', 'En skibakke', 'En stor ballsal'], 'Ombyggingen med kjeller og kjøkken i 1881 gjorde det mulig å drive mer omfattende restaurantvirksomhet.'],
    ['I hvilken retning vendte Sæterhyttens uteservering med utsikt?', 'Mot sør', ['Mot nord', 'Mot øst', 'Mot nordvest'], 'Uteserveringen vendte mot sør, der utsikten var en viktig del av stedets tiltrekningskraft.'],
    ['Hva fungerte som spisesal ute før Sæterhytten fikk glassveranda?', 'Et seildukstelt', ['Et gammelt båtskur', 'En tømmerlåve', 'En steinkjeller'], 'Et seildukstelt fungerte som utendørs spisesal før glassverandaen ble en del av serveringsmiljøet.'],
    ['I hvilket tiår kom glassverandaen trolig til Sæterhytten?', '1890-årene', ['1860-årene', '1930-årene', '1970-årene'], 'Oslo byleksikon daterer glassverandaen forsiktig til antakelig 1890-årene. Det er ikke et sikkert eksakt byggeår.'],
    ['Hvilken historisk parkstil skulle landskapet på Dronningberget tilbakeføres til?', 'Landskapspark i 1800-tallsstil', ['Renessansens geometriske parterrehage', 'En moderne skulpturpark', 'En middelaldersk urtehage'], 'Restaureringsgaven ved kongeparets 70-årsjubileum omfattet også tilbakeføring av Dronningberget til landskapspark i 1800-tallsstil.']
  ],
  kristiania_teglverk_bryn: [
    ['Hvem ledet gjenstarten av Kristiania Teglverk i 1912?', 'Disponent Helge Nielsen', ['Elling Jonassen', 'Thomas Joh. Heftye', 'Mogens Lauritssøn'], 'Disponent Helge Nielsen sto bak gjenstarten i 1912 etter at teglverket hadde stanset produksjonen etter byggekrakket.'],
    ['Hvilket selskap overtok Kristiania Teglverk i 1918?', 'A/S Einar Stange', ['Schous Bryggeri', 'Christiania Spigerverk', 'Norsk Hydro'], 'A/S Einar Stange overtok verket i 1918 og var også knyttet til den senere driftsavviklingen.'],
    ['Hvilken maskin fikk verket omkring 1920 for å forme murstein?', 'Strengpresse', ['Dampvevstol', 'Papirmaskin', 'Vannhjulsdrevet sag'], 'Omkring 1920 kom en strengpresse for murstein som del av den teknologiske utviklingen i produksjonslinjen.'],
    ['Hvilket utstyr ble brukt til oppredning og bearbeiding av leira?', 'Liggende forelter og valseverk', ['Spinnebenk og vevstol', 'Smiebelg og esse', 'Dreiebenk for metallrør'], 'Verket fikk liggende forelter og valseverk for oppredning av leira, ved siden av utstyr for forming og kutting.'],
    ['Hva slags halvautomatisk maskin ble installert for å kutte murstein?', 'Kappebord', ['Glasskjærer', 'Sirkelsag for tømmer', 'Stansepresse for metall'], 'Et halvautomatisk kappebord inngikk i maskinutviklingen for å kutte murstein til produksjonen.'],
    ['Hvor stor ble den oppgitte årlige produksjonskapasiteten?', 'Omkring fire millioner enheter', ['Omkring førti tusen enheter', 'Omkring hundre tusen enheter', 'Omkring førti millioner enheter'], 'Kilden oppgir en kapasitet på rundt fire millioner teglproduktenheter årlig etter maskinutbyggingen.'],
    ['Hva ble installert i leirfeltet etter gjenoppbyggingen i 1936?', 'Kjedegravemaskin og kabelbane', ['Lokomotivfabrikk og smie', 'Gassverk og vannkraftverk', 'Kran for skip og kaikraner'], 'Etter brannen ble leirfeltet utstyrt med kjedegravemaskin og kabelbane for transport av leire til verket.'],
    ['Hvilket hovedmateriale ble brukt i teglverksbygningens bærekonstruksjon?', 'Trebindingsverk', ['Armert betong', 'Helstøpt jern', 'Massiv granitt'], 'Verksbygningen ble oppført i trebindingsverk, mens den karakteristiske gavlveggen mot nordøst er av tegl.'],
    ['Hvor i bygningen ligger den bevarte ringovnen?', 'På grunnplanet', ['I tredje etasje', 'På taket', 'I en separat bygning ved elva'], 'Ringovnen ligger på grunnplanet i den treetasjes teglverksbygningen, med tørkerom over seg.'],
    ['Hvilke etasjer rommet tørkerom for teglstein?', 'Andre og tredje etasje', ['Bare kjelleren', 'Bare første etasje', 'Et loft i et nabohus'], 'Tørkerommene lå i andre og tredje etasje, slik at varmen fra ovnen nedenfor kunne utnyttes.'],
    ['Hva skjedde med den gamle teglverkspipen etter driftsstansen?', 'Den ble revet noen år senere', ['Den ble flyttet til Bygdøy', 'Den ble omgjort til fyrtårn', 'Den står fortsatt helt uendret'], 'Den tidligere utvendige pipen ble revet noen år etter at teglproduksjonen tok slutt sent i 1960-årene.']

});
const normalize = s => String(s).normalize('NFKC').trim().toLowerCase();
const error = msg => { throw new Error('Oslo-six fullquiz staging: ' + msg); };

export function buildOsloSixFullquizReview() {
  const cards = buildOsloSixCardReview();
  return {
    schema: 'history_go_oslo_six_fullquiz_review_v1',
    publication_status: 'NOT_REGISTERED_NOT_PLAYABLE',
    places: Object.entries(EXTRAS).map(([id, extras], index) => {
      const card = cards.places.find(p => p.place_id === id);
      const hold = GATE.places.find(p => p.place_id === id);
      if (!card || !hold || hold.release_status !== 'BLOCKED' || hold.geographical_anchor.status !== 'HOLD')
        error(id + ': publication gates must remain blocked');
      if (extras.length !== 11 || card.draft_cards.length !== 10) error(id + ': need 10+11 facts');
      const questions = card.draft_cards.map((q, i) => ({
        id: id + '_review_quiz_' + String(i + 1).padStart(2, '0'),
        targetId: id, categoryId: q.categoryId, question: q.question,
        options: q.options, answer: q.answer, answerIndex: q.answerIndex,
        knowledge: q.knowledge, source_trace: q.source_trace,
        source_url: SOURCE_URLS[id], external_claim_review: 'editorial_candidate_pending_line_by_line',
        quizcard_candidate_id: q.id, runtime_registered: false
      })).concat(extras.map(([question, answer, incorrect, knowledge], i) => {
        if (incorrect.length !== 3 || new Set([answer, ...incorrect].map(normalize)).size !== 4)
          error(id + ': invalid additional question ' + (i + 1));
        const answerIndex = (i + index + 1) % 4;
        const options = incorrect.slice();
        options.splice(answerIndex, 0, answer);
        return {
          id: id + '_review_quiz_' + String(i + 11).padStart(2, '0'),
          targetId: id, categoryId: card.draft_cards[0].categoryId, question, options, answer, answerIndex, knowledge,
          source_trace: 'Oslo byleksikon – ' + card.name, source_url: SOURCE_URLS[id],
          external_claim_review: 'source_article_read_editorial_claim_signoff_pending',
          quizcard_candidate_id: null, runtime_registered: false
        };
      }));
      const sets = [0, 1, 2].map(n => ({
        set_id: card.draft_cards[0].categoryId + '_' + id + '_review_set_' + (n + 1),
        order: n + 1, level: n + 1,
        questions: questions.slice(n * 7, (n + 1) * 7)
      }));
      return {
        place_id: id, name: card.name, status: 'SOURCE_REVIEW_CANDIDATE_ONLY',
        proposed_quiz_profile: 'narrow_3x7_not_confirmed', sets,
        quizcard_question_ids: questions.slice(0, 10).map(q => q.id),
        learning_scope_notice: id === 'frognerseteren' ?
          'Some contextual questions concern adjacent historic buildings; require scope audit so the Place stays the restaurant at Holmenkollveien 200.' : null,
        source_url: SOURCE_URLS[id], canonical_place_created: false,
        quiz_manifest_registered: false, knowledge_synced: false, browser_qa_passed: false
      };
    })
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const pack = buildOsloSixFullquizReview();
    if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(pack, null, 2) + '\n');
    else console.log('Oslo six: 5 staged narrow 3x7 fullquiz candidates (105 questions), no runtime activation');
  } catch (err) { console.error(err); process.exitCode = 1; }
}
