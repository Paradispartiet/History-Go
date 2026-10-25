#!/usr/bin/env node
// Review-only QuizCard proposals. Derive question and answer exclusively from the editorial handoff.
// No active quiz sets, registry or map data may be written from this script.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixStaging } from './build-oslo-six-quiz-handoff.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EDITORIAL = readFileSync(resolve(ROOT, 'reports/place-production/oslo-six-places-editorial-20261022.md'), 'utf8');
const fail = (msg) => { throw new Error('Oslo-six QuizCard review: ' + msg); };

const DETAILS = Object.freeze({
  ekebergrestauranten: {
    distractors: [
      ['En tidligere skysstasjon', 'Et nedlagt hotell', 'En tidligere badepaviljong'],
      ['Holm Munthe', 'Erik Glosimodt', 'Arnstein Arneberg'],
      ['1916', '1939', '2005'],
      ['Dragestil', 'Nasjonal nybarokk', 'Jugendstil'],
      ['Utskårne tømmerfasader og små vinduer', 'Teglvegger og spissbuer', 'Søyler og glasskuppel'],
      ['Som feltsykehus', 'Som jernbanedepot', 'Som militær matstasjon'],
      ['Brann i restaurantkjøkkenet', 'Ras i adkomstveien', 'Skader etter en eksplosjon i hagen'],
      ['1987', '2001', '2005'],
      ['1997', '2005', '2011'],
      ['1997', '2001', '2015']
    ],
    knowledge: [
      'Den første restauranten fra 1916 tok i bruk Tiedemanns tidligere paviljong fra Jubileumsutstillingen i 1914. Den er ikke samme bygning som dagens restaurant.',
      'Lars Backer tegnet nybygget som sto ferdig i 1929. Erik Glosimodt hadde tegnet den eldre paviljongen.',
      'Den nåværende restaurantbygningen ble oppført i 1927–1929, og må ikke forveksles med den første restauranten som sto klar i 1916.',
      'Lars Backers betongbygg er et tidlig hovedverk innen norsk funksjonalisme, i tydelig kontrast til den første trepaviljongens nasjonale nybarokk.',
      'Glatte betongflater og store vinduer gjorde bygningen til en funksjonalistisk utsiktsrestaurant i skråningen.',
      'Under okkupasjonen ble restauranten rekvirert som kommandopost og offiserskvarter knyttet til Luftwaffe og luftvernet på Ekebergsletta.',
      'I mai 1953 raste gulv og masser fra bygningen ned i en tunnel under huset. Skaden fikk store følger for restaurantdriften.',
      'Driften stanset i 1997, og etter flere år med forfall og ombyggingsforsøk ble bygningen fredet.',
      'Fredningen i 2001 kom etter debatt om hvordan den tidlige funksjonalistiske bygningen skulle bevares.',
      'Etter flere år med forfall og omfattende istandsetting åpnet Ekebergrestauranten igjen i 2005, med den fredede funksjonalistiske bygningen bevart.'
    ]
  },
  frognerseteren: {
    distractors: [
      ['Bogstad gård', 'Vestre Holmen gård', 'Sogn hovedgård'],
      ['Axel Heiberg', 'Christian Ringnes', 'Thorvald Meyer'],
      ['Importert svensk tømmer', 'Tømmer fra Bygdøy', 'Gjenbrukte skipsplanker'],
      ['Aker kommune', 'Den norske stat', 'Et privat utbyggingsselskap'],
      ['Holm Munthe', 'Herman Major Schirmer', 'Christian Heinrich Grosch'],
      ['1867', '1909', '1916'],
      ['Lars Backer', 'Herman Major Schirmer', 'Henrik Bull'],
      ['Funksjonalisme', 'Jugendstil', 'Nyklassisisme'],
      ['1889', '1891', '1916'],
      ['Holmenkollveien 201', 'Holmenkollveien 202', 'Holmenkollveien 204']
    ],
    knowledge: [
      'Frognerseteren var opprinnelig seter i Trevollskogen, som hørte til Frogner hovedgård.',
      'Thomas Heftye kjøpte skogeiendommen på 1860-tallet. Oslo byleksikon sier 1864, mens restaurantens egen historikk sier 1865. Kommunen overtok i 1889.',
      'Hovedrestaurantens byggetømmer kom fra kommunens egen skog ifølge restauratørens publiserte bygningshistorie.',
      'Kristiania kommune kjøpte eiendommen i 1889, noe som la grunnlag for videre offentlig utfartstilrettelegging.',
      'Byarkitekt Christian Heiberg innredet Styrerommet. Rommets dekorative malerier ble utført av Ulrik Hendriksen.',
      'Hovedrestauranten ble oppført i 1891 og senere utvidet. Heftyevillaen fra 1867 er en annen bygning.',
      'Holm Munthe tegnet både hovedrestauranten og Sportshallen i dragestil. Han var ikke arkitekt for Heftyevillaen.',
      'Dragestilen viste romantiske forbilder fra norsk trearkitektur, blant annet gjennom takformer og utskjæringer.',
      'Hovedrestauranten ble om- og tilbygd i 1909. Det er ikke bygningens opprinnelige oppføringsår.',
      'Restaurantens stedsidentitet knyttes til Holmenkollveien 200, ikke Heftyevillaen i nummer 201 eller T-banestasjonen.'
    ]
  },
  sarabraten: {
    distractors: [
      ['Rustad', 'Skullerud', 'Bremsrud'],
      ['1663', '1723', '1852'],
      ['Thomas Thomassen Heftye', 'Holm Munthe', 'Herman Major Schirmer'],
      ['Dragestilsvillaen', 'Heftyevillaen', 'Kuskeboligen'],
      ['Victoria', 'Oscar', 'Frøya'],
      ['Den var forbeholdt hoffets gjester', 'Bare forpakterne kunne bruke skogen', 'Besøk krevde eierskap til landstedet'],
      ['Sveitserstil', 'Nyklassisisme', 'Funksjonalisme'],
      ['Holmenkollrennet', 'Markastafetten', 'Nøklevannsregattaen'],
      ['Det ble flyttet til Norsk Folkemuseum', 'Det ble innredet som museum', 'Det ble revet for å bygge vei'],
      ['Ni falne soldater fra 1814', 'Ni tidligere gårdbrukere', 'Ni vinnere av Sarabråtrennet']
    ],
    knowledge: [
      'Sarabråten het tidligere Jørgensrud. Navnet viser til et eldre stedslag før Heftye-familiens sommersted.',
      'Stedet er nevnt i Akershus lensregnskap i 1578, lenge før sommerstedsbebyggelsen fra 1800-tallet.',
      'Bankier og konsul Thomas Joh. Heftye overtok eiendommen fra farens firma i 1852.',
      'Heftye oppførte sperrestua i 1856. Den senere dragestilsvillaen ble reist i 1897.',
      'Hjulbåten Sara gikk på Nøklevann og var del av tilretteleggingen for besøkende i skogeiendommen.',
      'Thomas Joh. Heftye åpnet skogeiendommen også for allmennheten, ikke bare for private gjester.',
      'En ny hovedbygning i dragestil ble bygd i 1897, men den står ikke på Sarabråten i dag.',
      'Sarabråtrennet ble arrangert fram til 1928 og fikk tilnavnet Østkantens Holmenkollrenn. Kildene er uenige om startåret (1900 eller 1902).',
      'Det siste huset på Sarabråten, den tidligere sperrestua som ble kalt Kuskeboligen, brant i 1971.',
      'Minnesteinen reist i 1946 hedrer ni falne fra hjemmefronten. Den skal ikke forveksles med minnene etter skirennene.'
    ]
  },
  saeterhytten_bygdoy: {
    distractors: [
      ['En kongelig jaktpaviljong', 'En vaktstue for Oscarshall', 'En tidligere utstillingspaviljong'],
      ['På en flåte i Frognerkilen', 'Ved Hovedøya', 'Ved Huk'],
      ['Oscar II', 'Karl XV', 'Haakon VII'],
      ['Det hadde brent', 'Det var skadet av isgang', 'Det var blitt ødelagt av storm'],
      ['1852', '1866', '2011'],
      ['Dronning Maud', 'Dronning Sofia', 'Dronning Sonja'],
      ['De markerte tre gamle stier', 'De var initialene til tre byggherrer', 'De var en markering av tre kongelige badehus'],
      ['Bjørnstjerne Bjørnson', 'Henrik Wergeland', 'Alexander Kielland'],
      ['1862', '1897', '2011'],
      ['2007', '2009', '2015']
    ],
    knowledge: [
      'Før den sto på Dronningberget, var Sæterhytten et flytende badehus for kongefamilien ved Oscarshall.',
      'Badehuset lå på en pram utenfor Oscarshall før det ble tatt ned og flyttet til Dronningberget.',
      'Badehuset ved Oscarshall ble laget for kong Oscar I og lå flytende på en pram. Kildene bruker både 1851 og 1852 om byggeåret; derfor brukes ikke ett sikkert år her.',
      'Tømmeret var skadet av mark. Bygningen ble demontert, flyttet og tatt i bruk på ny måte.',
      'Sæterhytten ble innviet på Dronningberget i 1862, etter ombyggingen fra badehus til paviljong.',
      'Innvielsen fant sted 25. august 1862 på dronning Louises navnedag, etter at det tidligere badehuset var flyttet til Dronningberget.',
      'De tre L-ene viste til dronning Louise og to andre kvinnelige gjester i kongefamilien som også het Louise.',
      'Henrik Ibsen skrev et dikt til innvielsen. Det hører til bygningens rolle i 1800-tallets hoffkultur.',
      'Kafédriften ved Sæterhytten startet i 1866, fire år etter innvielsen. Samme år ble det også reist en musikkpaviljong på Dronningberget.',
      'Restaureringen av Sæterhytten ble avsluttet i 2011. Den er ikke identisk med de eldre flytte- og ombyggingsfasene.'
    ]
  },
  kristiania_teglverk_bryn: {
    distractors: [
      ['1887', '1912', '1936'],
      ['En langvarig streik', 'En fabrikkbrann', 'En jernbaneomlegging'],
      ['1905', '1918', '1936'],
      ['Kalkstein', 'Jernmalm', 'Kvartsitt'],
      ['En kalkovn', 'En smelteovn', 'En kullmile'],
      ['Et jordras', 'En flom', 'En streik'],
      ['Oppvarming av drivhus', 'Smelting av jern', 'Kjøling av maskiner'],
      ['Glassflasker', 'Stålbjelker', 'Pappemballasje'],
      ['Rett etter etableringen i 1897', 'Ved gjenstarten i 1912', 'Før andre verdenskrig'],
      ['Høyenhall Teglverk', 'Nygaard Teglverk', 'Bryn Cellulosefabrik']
    ],
    knowledge: [
      'Kristiania Teglverk ble anlagt ved Bryn i 1897 under byens sterke byggevekst.',
      'Byggekrakket svekket etterspørselen, og verket stanset produksjonen allerede i 1898.',
      'Virksomheten kom i gang igjen i 1912 etter den første langvarige driftsstansen.',
      'Råstoffet var leire, som ble bearbeidet i teglverkets produksjonslinje før den ble formet, tørket og brent til ulike teglprodukter.',
      'Ringovnen brente teglstein og er et sentralt bevart industrispor i verksbygningen.',
      'Fabrikken ble rammet av en omfattende brann i 1936 og måtte bygges opp igjen. Gjenoppbyggingen ble brukt til å modernisere maskiner og tørking.',
      'Spillvarme fra ringovnen ble brukt til tørking av tegl, et viktig samspill mellom ovn og tørkerom.',
      'Verket framstilte blant annet drensrør i tillegg til mur- og takstein.',
      'Driften ble avviklet mot slutten av 1960-årene etter svake avsetningsforhold.',
      'Bryn Teglverk og Kristiania Teglverk var to forskjellige teglverk ved Bryn. Kristiania-anleggets bevarte ringovn ligger i den historiske teglverksbygningen.'
    ]
  }
});

function sourceBundle(name, id) {
  const heading = '## ' + name + ' (' + String.fromCharCode(96) + id + String.fromCharCode(96) + ')';
  const main = EDITORIAL.split('\n## Supplerende Fagverk-plan')[0];
  const start = main.indexOf(heading);
  if (start < 0) fail(id + ': missing source heading');
  const rest = main.slice(start + heading.length);
  const body = rest.split('\n## ')[0];
  const sources = [...body.matchAll(/^- \[K\d+\] (https?:\/\/\S+)/gm)].map(x => x[1]);
  if (!sources.length) fail(id + ': source list absent');
  return sources;
}

export function buildOsloSixCardReview() {
  const intake = buildOsloSixStaging();
  if (intake.publication_status !== 'NOT_PUBLISHED') fail('staging must remain unpublished');
  const places = intake.places.filter(p => p.id !== 'linderud_gard').map(place => {
    const details = DETAILS[place.id];
    if (!details || details.distractors.length !== 10 || details.knowledge.length !== 10) fail(place.id + ': detail count');
    const source_bundle_urls = sourceBundle(place.name, place.id);
    const cards = place.fact_candidates.map((core, index) => {
      const others = details.distractors[index];
      const answer = core.answer_core;
      const options = others.slice();
      if (others.length !== 3 || new Set([answer, ...others].map(s => s.normalize('NFKC').trim().toLowerCase())).size !== 4)
        fail(place.id + ': repeated/missing option on row ' + (index + 1));
      const insertAt = (index + placesOrdinal(place.id)) % 4;
      options.splice(insertAt, 0, answer);
      return {
        id: place.id + '_card_review_' + String(index + 1).padStart(2, '0'),
        categoryId: place.id === 'kristiania_teglverk_bryn' ? 'naeringsliv' : (place.id === 'ekebergrestauranten' ? 'by' : 'historie'),
        targetId: place.id,
        question: core.question,
        answer,
        options,
        answerIndex: insertAt,
        knowledge: details.knowledge[index],
        source_trace: core.source_trace,
        source_url: place.id === 'frognerseteren' && [2, 4].includes(index)
          ? 'https://www.frognerseteren.no/mer-historie-' : null,
        source_bundle_urls,
        source_claim_review: 'pending_per_question_original_source_review',
        fullquiz_question_id: null,
        card_runtime_registered: false,
        editor_status: 'candidate_not_approved'
      };
    });
    return {
      place_id: place.id,
      name: place.name,
      review_only: true,
      card_question_count: 10,
      draft_cards: cards,
      minimum_additional_distinct_questions_for_narrow_3x7: 11,
      fullquiz_profile_decision: 'not_confirmed',
      geographical_anchor: place.pin_status,
      public_release: false
    };
  });
  return {
    schema: 'history_go_oslo_six_card_review_v1',
    status: 'NON_PUBLISHING_EDITORIAL_REVIEW',
    places,
    total_card_candidates: places.reduce((n, p) => n + p.draft_cards.length, 0),
    note: '50 source-traced QuizCard candidates, not five complete fullquizzes. Per-question source verification, minimum 11 further distinct questions per narrow profile, canonical Place, geolocation, image, Fagverk, Knowledge and browser QA remain mandatory.'
  };
}
function placesOrdinal(id) {
  return ['ekebergrestauranten', 'frognerseteren', 'sarabraten', 'saeterhytten_bygdoy', 'kristiania_teglverk_bryn'].indexOf(id);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const pack = buildOsloSixCardReview();
    if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(pack, null, 2) + '\n');
    else console.log('Oslo-six card review OK: 5 places, 50 unpublished source-traced candidates');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
