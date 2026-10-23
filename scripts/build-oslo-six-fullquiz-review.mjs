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
  sarabraten: 'https://oslobyleksikon.no/side/Sarabr%C3%A5ten'
});

// Ekebergrestauranten and Sarabråten extras trace to Oslo byleksikon; Frognerseteren extras
// trace to the restaurant operator's own published building history.
// Article-level reading is not independent claim-level sign-off or canonical preflight.
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
    ['Hvilket selskap hadde konsesjon til å drive Ekebergrestauranten frem til 1959?', 'Oslo Folkerestauranter', ['Schous Bryggeri', 'Norsk Folkemuseum', 'NSB Restauranter'], 'Oslo Folkerestauranter fikk konsesjon for restaurantdriften frem til 1959. Selskapet må skilles fra Schous Bryggeri, som ga lån til nybygget.'],
    ['Hva var kommandopostens militære oppgave under okkupasjonen knyttet til?', 'Luftvernartilleriet på Ekebergsletta', ['Ubåtforsvaret i Oslofjorden', 'Militært veiarbeid på Bygdøy', 'Jernbanesikring på Grorud'], 'Under krigen var restauranten kommandopost med peilestasjon for luftvernet på Ekebergsletta.'],
    ['Hvem foreslo fredning av Ekebergrestaurantens anlegg i 1997?', 'Fortidsminneforeningen', ['Oslo Sporveier', 'Norsk Folkemuseum', 'Schous Bryggeri'], 'Fortidsminneforeningen tok i 1997 til orde for fredning av eksteriør, terrasseanlegg og deler av interiøret.'],
    ['Hvilken restauratør kjøpte anlegget i 2002 sammen med Christian Ringnes og Eiendomsspar?', 'Bjørn Tore Furset', ['Jens P. Heyerdahl', 'Olav Selvaag', 'Arne Garborg'], 'Restauratør Bjørn Tore Furset gikk inn i kjøpet av anlegget i 2002. Gjenåpningen kom tre år senere.']
  ],
  frognerseteren: [
    ["Hvilken inntektskilde var med på å finansiere byggingen av Frognerseterens hovedrestaurant?", "Overskudd fra Christiania Brændevinssamlag", ["Billettinntekter fra Holmenkollbanen","Inntekter fra Skimuseet","En bevilgning fra Riksantikvaren"], "Restaurantens egen historikk forteller at overskudd fra Christiania Brændevinssamlag bidro til oppføringen av hovedrestauranten i 1891."],
    ["Hva kostet første byggetrinn av Frognerseterens hovedrestaurant ifølge restaurantens egen historikk?", "85 000 kroner", ["8 500 kroner","850 000 kroner","1,5 millioner kroner"], "Restaurantens egen historikk oppgir byggekostnaden til 85 000 kroner da hovedrestauranten sto ferdig i 1891."],
    ["Hvorfor ble en separat sportskafé planlagt kort etter at hovedrestauranten åpnet?", "Hovedrestauranten ble fylt av velstående gjester, mens sportsfolk manglet plass", ["Hovedrestauranten ble stengt etter brann","Jernbanestasjonen krevde en ventesal","Kommunen forbød servering i hovedrestauranten"], "Restaurantens historikk forteller at hovedhuset straks ble fylt av byens velstående herrer, slik at sportsfolket ikke fikk plass; dermed ble en egen sportskafé planlagt."],
    ["Hva het utvidelsen av hovedrestauranten som sto ferdig rundt 1910?", "Storstua", ["Heftyevillaen","Skimuseet","Sportshallen"], "Storstua hører til selve hovedrestauranten og sto ifølge restaurantens historikk ferdig i 1910; Sportshallen fra 1896 var et eget bygg."],
    ["Hva skjedde med verandaen foran hovedrestauranten under ombyggingene tidlig på 1900-tallet?", "Den ble bygget inn for mer innendørs plass", ["Den ble revet for en ringovn","Den ble flyttet til Holmenkollbanen","Den ble omgjort til et frittstående stabbur"], "Restaurantens historikk beskriver at verandaen ble lukket inn slik at huset fikk mer serveringsareal."],
    ["Hvem dekorerte Styrerommet i Frognerseterens hovedrestaurant?", "Ulrik Hendriksen", ["Holm Munthe","Lars Backer","Herman Major Schirmer"], "Ulrik Hendriksen malte Styrerommet. Holm Munthe var arkitekten for hovedrestaurantens opprinnelige bygg, ikke kunstneren bak denne romdekorasjonen."],
    ["Hvilken dekorasjonsstil fikk Styrerommet i hovedrestauranten?", "Norsk bonderokokko", ["Funksjonalisme","Brutalisme","Art deco"], "Styrerommet fikk ifølge restaurantens historikk dekorasjon i norsk bonderokokko, med malte visdomsord og ornamenter. Dette er en interiørstil, ikke husets ytre dragestil."],
    ["Hvilket rom i restaurantens andre etasje omtales med romansk ornamentikk?", "Peisestua", ["Sportshallen","Heftyevillaen","Stasjonsbygningen"], "Peisestua i andre etasje er beskrevet som dekorert med romansk ornamentikk og viser et annet estetisk lag enn eksteriørets dragestil."],
    ["Hva ble det lille møterommet Kvisten brukt til tidligere?", "Herretoalett", ["T-banekontrollrom","Badstue for skiløpere","Kjølerom for kjøtt"], "Kvisten ble ifølge restaurantens egen historikk omgjort fra herretoalett til møterom i 1994. Det viser hvordan romfunksjoner har endret seg i huset."],
    ["Hva slags rom var Finstua før utvidelsen med Storstua i 1909–1910?", "Veranda", ["Bibliotek","Stall","Skolestue"], "Finstua var opprinnelig veranda og ble del av den videreutviklede hovedrestauranten. Det er ikke et separat historisk bygg på området."],
    ["Hva ble koksovnen i Skjenkestua erstattet med i 1932?", "En vedovn", ["Et industrikjøleanlegg","En teglverksovn","En åpen kullgruve"], "Restaurantens historikk oppgir at Skjenkestuas koksovn ble byttet med en vedovn i 1932, som et konkret spor av endringer i rommets bruk og interiør."]
  ],
  sarabraten: [
    ['Hva slags gods ble Sarabråten omtalt som i lensregnskapet fra 1578?', 'Oslo stiftsgods', ['Kongelig lystgård', 'Kommunal allmenning', 'Statlig teglverk'], 'Jørgensrud, senere Sarabråten, er omtalt som Oslo stiftsgods i Akershus lensregnskap i 1578.'],
    ['Hvilken gård ble Sarabråten lagt under i 1663?', 'Rustad', ['Bogstad', 'Linderud', 'Frogner'], 'Sarabråten ble lagt under Rustad i 1663 og senere skilt ut igjen sammen med Bremsrud.'],
    ['Hvilket år ble Sarabråten skilt ut igjen sammen med Bremsrud?', '1723', ['1578', '1663', '1852'], 'Etter å ha ligget under Rustad ble eiendommen skilt ut igjen sammen med Bremsrud i 1723.'],
    ['Hvilket handelshus kjøpte eiendommen omkring 1840?', 'Tho. Joh. Heftye & Søn', ['Schous Bryggeri', 'Ringnes & Co.', 'Christiania Spigerverk'], 'Handelshuset Tho. Joh. Heftye & Søn kjøpte Sarabråten omkring 1840, før Thomas Joh. Heftye overtok fra farens firma i 1852.'],
    ['Hvilke to arkitekter tegnet sperrestua som ble oppført i 1856?', 'H. E. Schirmer og Wilhelm von Hanno', ['Holm Munthe og Lars Backer', 'Erik Glosimodt og Arnstein Arneberg', 'Christian Heinrich Grosch og Henrik Bull'], 'Sperrestua fra 1856 var tegnet av H. E. Schirmer og Wilhelm von Hanno. Bygningen ble senere kalt Kuskeboligen.'],
    ['Hvilken transportforbindelse gjorde Sarabråten lettere tilgjengelig for byfolk på 1800-tallet?', 'Jernbanen til Bryn', ['Dampskipsruta over Bunnefjorden', 'Sporveien til Skullerud', 'T-banen til Østensjø'], 'Da jernbanen kom til Bryn, ble turen videre inn til Sarabråten lettere. Det bidro til at stedet ble et av hovedstadens mest brukte utfartssteder.', 'https://www.skiforeningen.no/utimarka/omrader/ostmarka/steder/sarabraten/'],
    ['Hvem fikk oppført den nye dragestilsvillaen i 1897?', 'Thomas Thomassen Heftye', ['Thomas Joh. Heftye', 'Holm Munthe', 'Oscar II'], 'Det var Thomas Thomassen Heftye som fikk oppført dragestilsvillaen i 1897, en annen generasjon enn Thomas Joh. Heftye fra 1852.'],
    ['Hvem kjøpte Sarabråten i 1911?', 'Aker kommune', ['Kristiania kommune', 'Staten', 'Norsk Folkemuseum'], 'Aker kommune kjøpte Sarabråten i 1911. De historiske bygningene ble senere borte.'],
    ['Hva ble sperrestua kalt etter en senere ombygging?', 'Kuskeboligen', ['Heftyevillaen', 'Skistua', 'Sæterhytten'], 'Sperrestua fra 1856 ble senere bygd om til Kuskeboligen, som var det siste huset som sto igjen.'],
    ['Til hvilket år var det serveringssted i Kuskeboligen?', '1943', ['1897', '1911', '1971'], 'Kuskeboligen hadde serveringssted fram til 1943. Selve bygningen brant først i 1971.'],
    ['Hvorfor ble bygningene på Sarabråten etter hvert revet eller forlatt?', 'Nøklevann ble drikkevannskilde', ['Det ble anlagt en flyplass ved Nøklevann', 'En ny jernbanelinje gikk over ruinene', 'Hele området ble brukt til teglproduksjon'], 'Da Nøklevann ble brukt til kommunal drikkevannsforsyning, ble det innført restriksjoner. Bebyggelsen på Sarabråten forsvant gradvis. Det siste huset brant i 1971.', 'https://oslobyleksikon.no/side/N%C3%B8klevann']

  ],
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
        source_url: q.source_url || SOURCE_URLS[id], external_claim_review: 'editorial_candidate_pending_line_by_line',
        quizcard_candidate_id: q.id, runtime_registered: false
      })).concat(extras.map(([question, answer, incorrect, knowledge, independentSourceUrl], i) => {
        if (incorrect.length !== 3 || new Set([answer, ...incorrect].map(normalize)).size !== 4)
          error(id + ': invalid additional question ' + (i + 1));
        const answerIndex = (i + index + 1) % 4;
        const options = incorrect.slice();
        options.splice(answerIndex, 0, answer);
        return {
          id: id + '_review_quiz_' + String(i + 11).padStart(2, '0'),
          targetId: id, categoryId: card.draft_cards[0].categoryId, question, options, answer, answerIndex, knowledge,
          source_trace: independentSourceUrl ? 'Egen institusjonskilde for særskilt stedspåstand' : id === 'frognerseteren' ? 'Restaurantens publiserte bygningshistorie' : 'Oslo byleksikon – ' + card.name,
          source_url: independentSourceUrl || (id === 'frognerseteren' ? 'https://www.frognerseteren.no/mer-historie-' : SOURCE_URLS[id]),
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
          'The 11 additional questions now concern the restaurant itself. All 21 question candidates now target the main restaurant; independent source-to-claim sign-off remains required. This Place remains the main restaurant at Holmenkollveien 200.' : null,
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
    else console.log('Oslo six: 3 staged narrow 3x7 fullquiz candidates (63 questions), no runtime activation');
  } catch (err) { console.error(err); process.exitCode = 1; }
}
