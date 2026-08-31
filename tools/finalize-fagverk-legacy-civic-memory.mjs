#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/politikk/oslo/places_politikk/youngstorget.json': {
    sources: [
      ['Oslo kommune – Youngstorget', 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/'],
      ['Oslo byleksikon – Youngstorget', 'https://oslobyleksikon.no/side/Youngstorget'],
      ['Arbeiderbevegelsens arkiv – Det røde torg', 'https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf'],
      ['Arbeiderbevegelsens arkiv – Åttetimersdagen del 3', 'https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Youngstorget gjør det mulig å undersøke hvordan et fysisk byrom kan gå fra marked til politisk mobiliseringsarena uten at plassen selv blir en politisk organisasjon. Historien må leses gjennom dokumenterte hendelser, organisering og synlige spor – ikke ved å gjøre en folkemengde til automatisk mål på representativitet eller effekt.',
      article: [
        'Youngstorget ble etablert som handelsplass på 1800-tallet og fikk senere en sterk tilknytning til arbeiderbevegelsens møter og demonstrasjoner. Denne dobbeltrollen er analytisk nyttig: samme plassflate kan romme handel, ferdsel, arrangementer og politiske krav, mens institusjonene rundt torget har egne oppgaver. Stedet bør derfor avgrenses til selve torget, ikke Folkets Hus, Folketeaterbygningen eller gatene som møter plassen.',
        'Den dokumenterte 1. mai-demonstrasjonen i 1890 og senere massemøter viser kollektiv handling i offentlig rom. Men et stort møte dokumenterer først og fremst at mennesker samlet seg om et krav på et bestemt tidspunkt. Om deltakerne representerte et flertall, og om markeringen endret en politisk beslutning, krever andre kilder. Slik blir Youngstorget et godt sted for å skille mobilisering, organisasjon, offentlighet og faktisk politisk virkning.',
        'Basaren, Pioneren, fredsmonumentet og den historiske fotoutstillingen gjør utvalgte historiske lag synlige i dagens plassrom. De fungerer som spor og kuratering, ikke som en fullstendig fortelling om alle som har brukt torget. Fotografier, monumenter og minnesmerker bør derfor analyseres både som kilder til fortiden og som senere valg om hva som skal vises fram i offentligheten.'
      ],
      subject_ids: ['politikk'],
      emne_ids: ['em_pol_arbeidsliv_kollektiv_kamp', 'em_pol_demonstrasjoner_protest', 'em_pol_mediert_offentlighet'],
      chapter_ids: ['konflikt-makt-sivilsamfunn', 'parlamentarisme'],
      lenses: [
        {
          id: 'youngstorget-mobilisering',
          title: 'Mobilisering i byrommet',
          prompt: 'Hvordan kan en demonstrasjon på Youngstorget dokumentere kollektiv handling uten å bevise hvor representativ bevegelsen var?',
          subject_id: 'politikk',
          emne_id: 'em_pol_demonstrasjoner_protest',
          evidence: 'Sammenhold daterte demonstrasjoner med arrangørkilder og etterfølgende politiske dokumenter før du vurderer virkning.'
        },
        {
          id: 'youngstorget-arbeidsliv',
          title: 'Arbeid og kollektiv kamp',
          prompt: 'Hvordan kobler torgets historie marked, arbeidsliv og organisert interessekamp uten at disse funksjonene blir det samme?',
          subject_id: 'politikk',
          emne_id: 'em_pol_arbeidsliv_kollektiv_kamp',
          evidence: 'Bruk den dokumenterte markeds- og arbeiderhistorien som separate tidslag og undersøk forbindelsene mellom dem.'
        },
        {
          id: 'youngstorget-mediert-offentlighet',
          title: 'Bilder former offentlighet',
          prompt: 'Hva gjør historiske fotografier og dagens mediebilder synlig om Youngstorget, og hva forblir utenfor utsnittet?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Les fotografier som avgrensede tids- og kamerautsagn og kontroller hendelsesforløp mot skriftlige kilder.'
        },
        {
          id: 'youngstorget-minnespor',
          title: 'Monumenter og utvalg',
          prompt: 'Hvordan påvirker Pioneren, fredsmonumentet og fotoutstillingen hvilke deler av torgets historie som blir lettest å se?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Beskriv først hva som faktisk står på plassen, og vurder deretter hvem som har valgt motivene og tidslagene.'
        }
      ],
      guiding_questions: [
        'Hva skiller Youngstorget som offentlig arena fra organisasjonene og institusjonene rundt plassen?',
        'Hvordan kan 1. mai 1890 brukes som kilde til mobilisering uten å overdrive demonstrasjonens politiske effekt?',
        'Hvilke historiske lag er mest synlige på torget i dag, og hvilke er mindre synlige?',
        'Hva kan en historisk folkemengde på fotografi fortelle om bruk, og hva kan den ikke fortelle om opinion?',
        'Hvordan har monumenter og fotoutstilling gjort arbeiderhistorien til en del av dagens offentlige rom?'
      ],
      concepts: ['mobilisering', 'kollektiv handling', 'arbeiderbevegelse', 'demonstrasjon', 'offentlighet', 'representativitet', 'politisk virkning', 'minnekultur', 'mediert offentlighet'],
      observable_traces: [
        {
          title: 'Basaren ved torget',
          observation: 'Basarbygningen står som et fysisk spor etter Youngstorgets historiske rolle som markedsplass.',
          interpretation_boundary: 'Bygningen viser en tidligere handelsfunksjon, men dokumenterer ikke alene omfanget eller sammensetningen av handelen i en bestemt periode.',
          source_urls: ['https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/', 'https://oslobyleksikon.no/side/Youngstorget']
        },
        {
          title: 'Historie i plassrommet',
          observation: 'Pioneren, fredsmonumentet og den permanente fotoutstillingen gjør utvalgte politiske og sosiale historier synlige på torget.',
          interpretation_boundary: 'Synlige minnespor er kuraterte valg og kan ikke behandles som en full oversikt over alle grupper, konflikter eller perioder knyttet til stedet.',
          source_urls: ['https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/',
        'https://oslobyleksikon.no/side/Youngstorget',
        'https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf',
        'https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/politikk/oslo/places_politikk/oslo_radhus.json': {
    sources: [
      ['Oslo kommune – Oslo rådhus', 'https://www.oslo.kommune.no/radhuset/'],
      ['Oslo kommune – Slik styres Oslo', 'https://www.oslo.kommune.no/politikk/slik-styres-oslo/'],
      ['Oslo kommune – Møter i bystyret', 'https://www.oslo.kommune.no/politikk/bystyret/moter-i-bystyret/'],
      ['Oslo kommune – Møter i byrådet', 'https://www.oslo.kommune.no/politikk/byradet/moter-i-byradet/'],
      ['Nobel Peace Prize – Award ceremony', 'https://www.nobelpeaceprize.org/nobel-peace-prize/about-the-nobel-peace-prize/nobel-peace-prize-celebrations/award-ceremony']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Oslo rådhus samler lokaldemokrati, administrasjon og offentlig representasjon i ett bygg. Faglig analyse krever at bystyrets vedtak, byrådets politiske ledelse og administrasjonens gjennomføring holdes fra hverandre, samtidig som åpne møter, dokumenter og seremonier undersøkes som ulike former for offentlighet.',
      article: [
        'Rådhuset er sete for både bystyret og byrådet, men organene har forskjellige roller. Bystyret er det øverste folkevalgte organet i kommunen, mens byrådet leder den politiske gjennomføringen og den kommunale administrasjonen. Derfor er det viktig å følge en sak gjennom riktig beslutningskjede: et forslag, en innstilling, et vedtak og den senere gjennomføringen er forskjellige stadier og bør ikke omtales som én handling.',
        'Lokaldemokratisk offentlighet skapes gjennom mer enn arkitektur. Bystyremøter, sakspapirer, protokoller og digitale sendinger gjør deler av beslutningsprosessen tilgjengelig for publikum. Samtidig er ikke alle arbeidsprosesser åpne på samme måte. Rådhuset er derfor et godt sted for å undersøke hvordan formell åpenhet, praktisk saksbehandling og mediert innsyn overlapper uten å være identiske.',
        'Bygningen fungerer også som seremoni- og representasjonsrom. Nobels fredspris deles ut i Rådhushallen, men prisvinneren velges av Den norske Nobelkomité, ikke av Oslo kommune eller rådhuset som institusjon. Dette skillet viser hvorfor arena, symbol og beslutningsmyndighet må analyseres separat: et sted kan gi en handling sterk offentlig synlighet uten å eie beslutningen bak den.'
      ],
      subject_ids: ['politikk'],
      emne_ids: ['em_pol_lokaldemokrati', 'em_pol_byrakrati_forvaltning', 'em_pol_mediert_offentlighet'],
      chapter_ids: ['forvaltning', 'parlamentarisme'],
      lenses: [
        {
          id: 'oslo-radhus-lokaldemokrati',
          title: 'Lokaldemokratiets beslutningskjede',
          prompt: 'Hvordan kan du følge en kommunal sak fra politisk forslag til vedtak uten å blande bystyrets og byrådets roller?',
          subject_id: 'politikk',
          emne_id: 'em_pol_lokaldemokrati',
          evidence: 'Bruk kommunens beskrivelser av styringsmodellen sammen med sakspapirer og protokoller fra de relevante organene.'
        },
        {
          id: 'oslo-radhus-forvaltning',
          title: 'Vedtak og gjennomføring',
          prompt: 'Hvorfor er et kommunalt vedtak ikke i seg selv dokumentasjon på at ønsket virkning faktisk er oppnådd?',
          subject_id: 'politikk',
          emne_id: 'em_pol_byrakrati_forvaltning',
          evidence: 'Skill politisk beslutning fra administrativ gjennomføring og fra senere evaluering av konkrete resultater.'
        },
        {
          id: 'oslo-radhus-offentlighet',
          title: 'Åpne møter og innsyn',
          prompt: 'Hva gjør åpne bystyremøter, publiserte dokumenter og digitale sendinger synlig om kommunal politikk?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Sammenlign møtet, dokumentene og medieflaten og noter hvilke deler av saksarbeidet hver kilde faktisk viser.'
        },
        {
          id: 'oslo-radhus-seremoni',
          title: 'Arena uten beslutningsmakt',
          prompt: 'Hvordan viser fredsprisseremonien forskjellen mellom et representativt offentlig rom og institusjonen som fatter selve beslutningen?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Koble Rådhushallen som seremoniarena til Nobelkomiteens separate ansvar for valg av prisvinner.'
        }
      ],
      guiding_questions: [
        'Hvilke oppgaver ligger hos bystyret, og hvilke ligger hos byrådet og administrasjonen?',
        'Hvordan kan sakspapirer og protokoller brukes til å skille forslag fra endelige kommunale vedtak?',
        'Hva blir synlig gjennom åpne møter og strømming, og hvilke deler av kommunalt arbeid må undersøkes på andre måter?',
        'Hvorfor må Rådhushallen som seremonirom skilles fra institusjonen som velger Nobels fredsprisvinner?',
        'Hvordan kan rådhusets arkitektur gjøre kommunal makt synlig uten å fortelle hele beslutningsprosessen?'
      ],
      concepts: ['lokaldemokrati', 'bystyre', 'byråd', 'forvaltning', 'implementering', 'saksbehandling', 'protokoll', 'offentlighet', 'representasjon'],
      observable_traces: [
        {
          title: 'Rådhuset som maktbygg',
          observation: 'De to tårnene og den monumentale bygningskroppen gjør kommunens politiske hovedsete svært synlig ved fjorden.',
          interpretation_boundary: 'Arkitektonisk synlighet viser representasjon og institusjonell tilstedeværelse, men sier ikke alene hvordan makt fordeles eller saker avgjøres.',
          source_urls: ['https://www.oslo.kommune.no/radhuset/']
        },
        {
          title: 'Rådhushallen som arena',
          observation: 'Rådhushallen brukes til offentlige seremonier og er blant annet arena for utdelingen av Nobels fredspris.',
          interpretation_boundary: 'At en seremoni foregår i rådhuset betyr ikke at Oslo kommune eller bygningen eier beslutningen om hvem som får prisen.',
          source_urls: ['https://www.oslo.kommune.no/radhuset/', 'https://www.nobelpeaceprize.org/nobel-peace-prize/about-the-nobel-peace-prize/nobel-peace-prize-celebrations/award-ceremony']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/radhuset/',
        'https://www.oslo.kommune.no/politikk/slik-styres-oslo/',
        'https://www.oslo.kommune.no/politikk/bystyret/moter-i-bystyret/',
        'https://www.oslo.kommune.no/politikk/byradet/moter-i-byradet/',
        'https://www.nobelpeaceprize.org/nobel-peace-prize/about-the-nobel-peace-prize/nobel-peace-prize-celebrations/award-ceremony'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie/gamle_aker_kirke.json': {
    sources: [
      ['Store norske leksikon – Gamle Aker kirke', 'https://snl.no/Gamle_Aker_kirke'],
      ['Riksantikvaren – Gamle Aker med ny energi', 'https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Gamle Aker kirke er særlig verdifull som historisk kilde fordi alder, middelaldermurverk og senere restaureringer må holdes fra hverandre. Stedet lærer oss å lese en gammel bygning som flere tidslag samtidig: noe er middelaldersk materiale, noe er senere omforming, og noe er moderne vern og fortsatt bruk.',
      article: [
        'Kirken regnes som Oslos eldste stående bygning, men den nøyaktige dateringen er usikker. Kildene plasserer oppføringen innenfor et tidsrom fra slutten av 1000-tallet til 1100-tallet. Denne usikkerheten er faglig viktig: et omtrentlig tidsrom kan være mer presist enn ett tilsynelatende eksakt år når dokumentasjonen ikke gir en sikker dato.',
        'Bygningen er heller ikke et urørt middelalderobjekt. Branner, eierskifter og restaureringer har endret tårn, vinduer, overflater og interiør, mens grunnplan og mye av steinmaterialet fører eldre lag videre. Restaureringen på 1800-tallet og senere inngrep viser at kulturminner også er resultater av ettertidens valg om hvordan fortiden skal bevares og presenteres.',
        'Dagens kirke brukes fortsatt, samtidig som den må vedlikeholdes som fredet og sårbart kulturminne. Dermed møtes funksjon og bevaring i samme bygg. En historisk analyse bør skille det som kan observeres direkte i stein, rundbuer og bygningsform fra opplysninger som bare kan dateres gjennom skriftlige kilder, restaureringshistorikk og faglige undersøkelser.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_kirke_kloster_middelalder', 'em_his_middelalder_oslo', 'em_his_spor_materialitet', 'em_his_kulturminner_bevaring'],
      chapter_ids: ['middelalder_kirke_kongemakt', 'kilder_arkiv_spor', 'minne_kulturarv_historiebruk'],
      lenses: [
        {
          id: 'gamle-aker-datering',
          title: 'Usikker datering som kunnskap',
          prompt: 'Hvorfor er et dokumentert dateringsintervall bedre enn ett eksakt byggeår når kildene ikke er entydige?',
          subject_id: 'historie',
          emne_id: 'em_his_middelalder_oslo',
          evidence: 'Sammenlign fagkildenes dateringsforslag og behold usikkerheten som en del av konklusjonen.'
        },
        {
          id: 'gamle-aker-materialspor',
          title: 'Murverk som historisk kilde',
          prompt: 'Hva kan stein, grunnplan og rundbueformer fortelle om middelalderbygget, og hva krever andre kildetyper?',
          subject_id: 'historie',
          emne_id: 'em_his_spor_materialitet',
          evidence: 'Beskriv observerbare bygningsspor først og bruk bygningshistoriske kilder til datering og endringsforløp.'
        },
        {
          id: 'gamle-aker-restaurering',
          title: 'Restaurering former fortiden',
          prompt: 'Hvordan påvirker restaureringene på 1800- og 1900-tallet det vi i dag oppfatter som kirkens middelalderske uttrykk?',
          subject_id: 'historie',
          emne_id: 'em_his_kulturminner_bevaring',
          evidence: 'Skill dokumenterte middelalderlag fra senere tårn, vinduer, overflater og bevaringsvalg.'
        },
        {
          id: 'gamle-aker-institusjon',
          title: 'Kirke og institusjonsmakt',
          prompt: 'Hva viser skiftende eierskap og kirkelig tilknytning om hvordan institusjoner har forvaltet samme bygg over tid?',
          subject_id: 'historie',
          emne_id: 'em_his_kirke_kloster_middelalder',
          evidence: 'Følg de dokumenterte overgangene mellom kirkelige, kongelige, private og kommunale eiere uten å blande periodene.'
        }
      ],
      guiding_questions: [
        'Hvilke deler av Gamle Aker kirke kan beskrives som middelalderske med høy sikkerhet, og hvilke er senere?',
        'Hvordan bør du formulere kirkens alder når fagkildene gir et intervall i stedet for ett sikkert år?',
        'Hva kan murverk og bygningsform dokumentere direkte, og hva må hentes fra restaureringshistoriske kilder?',
        'Hvordan har senere restaureringer påvirket forestillingen om et autentisk middelalderinteriør?',
        'Hvorfor skaper fortsatt bruk andre bevaringsbehov enn et kulturminne som ikke lenger har en aktiv funksjon?'
      ],
      concepts: ['dateringsusikkerhet', 'materialspor', 'middelalderkirke', 'restaurering', 'autentisitet', 'kulturminnevern', 'institusjonshistorie', 'kontinuitet', 'omforming'],
      observable_traces: [
        {
          title: 'Rundbuer og steinmur',
          observation: 'Rundbuede åpninger og det massive steinmurverket gjør den romanske bygningsformen fysisk lesbar på stedet.',
          interpretation_boundary: 'Form og materiale kan observeres direkte, men en bestemt datering eller byggeetappe kan ikke fastslås fra utseendet alene.',
          source_urls: ['https://snl.no/Gamle_Aker_kirke']
        },
        {
          title: 'Tårnet som senere lag',
          observation: 'Det markante tårnet er synlig som en sentral del av dagens silhuett, men hører til en senere restaureringsfase.',
          interpretation_boundary: 'At tårnet dominerer dagens uttrykk betyr ikke at det representerer den opprinnelige middelalderkirken.',
          source_urls: ['https://snl.no/Gamle_Aker_kirke']
        }
      ],
      source_urls: [
        'https://snl.no/Gamle_Aker_kirke',
        'https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie/var_frelsers_gravlund.json': {
    sources: [
      ['Oslo kommune – Vår Frelsers gravlund', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/var-frelsers-gravlund/'],
      ['DigitaltMuseum – Christiania fra Vor Frelsers Gravlund', 'https://digitaltmuseum.no/011014442450/christiania-fra-vor-frelsers-gravlund'],
      ['Wikimedia Commons – Vår Frelsers gravlund Oslo', 'https://commons.wikimedia.org/wiki/File:V%C3%A5r_Frelsers_gravlund_Oslo.jpg']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Vår Frelsers gravlund kan leses som et fysisk arkiv, men aldri som et nøytralt register over fortiden. Gravminner, Æreslunden, bekransninger og bevaringsvalg viser hvem og hva som er gjort synlig, mens fravær og ulik monumentstørrelse minner om at minnekultur alltid bygger på sosial ulikhet, utvalg og senere historiebruk.',
      article: [
        'Gravlunden ble etablert utenfor den tette byen tidlig på 1800-tallet og vokste sammen med Christiania. Gangveier, trær og gravminner gjør byutvikling og skiftende gravskikk fysisk lesbar, men landskapet er ikke et komplett tverrsnitt av befolkningen. Hvem som fikk varige monumenter, familiegraver og synlige plasseringer hang sammen med ressurser, status og institusjonelle ordninger.',
        'Æreslunden og markeringer ved utvalgte graver gjør stedet til en aktiv arena for historiebruk. Når senere generasjoner hedrer bestemte forfattere, kunstnere, politikere eller arbeidslivsaktører, produseres også en fortelling om hvem som skal representere nasjonal og offentlig historie. En slik kanon kan studeres som historisk fenomen uten å behandles som en objektiv rangering av betydning.',
        'Kulturminnevern og dagens gravplassdrift legger nye lag til den historiske bruken. Bevaring av monumenter, urnegravtilbud og regler for gjenbruk viser at gravlunden både er minnelandskap og aktiv samfunnsinfrastruktur. Fotografier fra ulike perioder kan dokumentere landskapskarakter og endring, men ulike kamerastandpunkt gjør dem uegnet som presis måling av bestemte gravfelt eller enkeltmonumenter.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_minnesteder_historiebruk', 'em_his_spor_materialitet', 'em_his_kulturminner_bevaring', 'em_his_nasjonal_identitet_fortellinger'],
      chapter_ids: ['minne_kulturarv_historiebruk', 'kilder_arkiv_spor', '1814_statsdannelse'],
      lenses: [
        {
          id: 'var-frelsers-minneutvalg',
          title: 'Minne er et utvalg',
          prompt: 'Hvordan viser Æreslunden og offentlige bekransninger at kollektivt minne skapes gjennom senere valg og prioriteringer?',
          subject_id: 'historie',
          emne_id: 'em_his_minnesteder_historiebruk',
          evidence: 'Undersøk hvem som markeres, når markeringene skjer og hvilke institusjoner som begrunner utvalget.'
        },
        {
          id: 'var-frelsers-materialitet',
          title: 'Gravminner som kilder',
          prompt: 'Hva kan monumentenes størrelse, materiale og plassering fortelle om historisk status uten å bli en full sosial fasit?',
          subject_id: 'historie',
          emne_id: 'em_his_spor_materialitet',
          evidence: 'Beskriv gravminnene som materielle spor og kombiner dem med dokumenter om eierskap, gravskikk og samfunnsstruktur.'
        },
        {
          id: 'var-frelsers-bevaring',
          title: 'Vern og fortsatt bruk',
          prompt: 'Hvordan påvirker kulturminnevern dagens drift når gravlunden samtidig brukes til nye urnegraver og besøk?',
          subject_id: 'historie',
          emne_id: 'em_his_kulturminner_bevaring',
          evidence: 'Bruk kommunens nåværende regler og vernearbeid til å skille historisk bevaring fra aktiv gravplassforvaltning.'
        },
        {
          id: 'var-frelsers-nasjonal-fortelling',
          title: 'Kanon og nasjonal fortelling',
          prompt: 'Hvordan kan utvalget av kjente personer på gravlunden undersøkes som nasjonsbygging uten å anta en tidløs enighet?',
          subject_id: 'historie',
          emne_id: 'em_his_nasjonal_identitet_fortellinger',
          evidence: 'Se på hvilke personer og grupper som løftes fram i ulike perioder og sammenlign med dem som forblir mindre synlige.'
        }
      ],
      guiding_questions: [
        'Hvorfor er Vår Frelsers gravlund et redigert historisk landskap og ikke et nøytralt register over byens befolkning?',
        'Hva kan gravminners størrelse og materialer antyde om sosial status, og hvilke kilder trengs for å kontrollere tolkningen?',
        'Hvordan skaper Æreslunden en offentlig kanon over personer senere generasjoner har valgt å fremheve?',
        'Hva forteller dagens vern og gravplassdrift om forholdet mellom kulturarv og fortsatt bruk?',
        'Hvordan kan historiske fotografier brukes til å studere landskapet uten å overdrive presisjonen i før-og-etter-sammenligninger?'
      ],
      concepts: ['minnekultur', 'historiebruk', 'kanon', 'nasjonsbygging', 'materialspor', 'sosial status', 'kulturminnevern', 'gravskikk', 'kildekritikk'],
      observable_traces: [
        {
          title: 'Monumenter med ulik skala',
          observation: 'Gravminnene varierer tydelig i høyde, materiale og utforming langs gravlundens gangveier.',
          interpretation_boundary: 'Forskjeller i monumenter kan undersøkes som materielle spor etter status og minnekultur, men kan ikke alene forklare en persons økonomi eller historiske betydning.',
          source_urls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/var-frelsers-gravlund/']
        },
        {
          title: 'Gangveier gjennom minnelandskapet',
          observation: 'Trær, stier og gravminner danner et sammenhengende park- og minnelandskap som også er synlig i eldre fotografier.',
          interpretation_boundary: 'Lik landskapskarakter på fotografier fra ulike tider beviser ikke at de samme trærne, gravene eller detaljene er uendret.',
          source_urls: ['https://digitaltmuseum.no/011014442450/christiania-fra-vor-frelsers-gravlund', 'https://commons.wikimedia.org/wiki/File:V%C3%A5r_Frelsers_gravlund_Oslo.jpg']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/var-frelsers-gravlund/',
        'https://digitaltmuseum.no/011014442450/christiania-fra-vor-frelsers-gravlund',
        'https://commons.wikimedia.org/wiki/File:V%C3%A5r_Frelsers_gravlund_Oslo.jpg'
      ],
      verified_at: VERIFIED_AT
    }
  }
};

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

function addExternalLink(place, label, url) {
  const field = Array.isArray(place.externalLinks)
    ? 'externalLinks'
    : Array.isArray(place.external_links)
      ? 'external_links'
      : 'externalLinks';
  place[field] ||= [];
  const existing = place[field].find((row) => row?.url === url);
  if (existing) {
    if (!String(existing.label || existing.title || existing.name || '').trim()) existing.label = label;
    return;
  }
  place[field].push({ type: 'source', label, url, verifiedAt: VERIFIED_AT });
}

const registry = read(REGISTRY_FILE);
registry.placeLinks ||= {};

for (const [relative, target] of Object.entries(targets)) {
  const place = read(relative);
  if (!place?.id) throw new Error(`${relative}: missing Place id`);
  if (place.fagverk?.status === 'curated') throw new Error(`${place.id}: already curated; refusing overwrite`);

  for (const [label, url] of target.sources) addExternalLink(place, label, url);
  place.fagverk = target.fagverk;

  registry.placeLinks[place.id] = {
    sourceFile: relative.replace(/^data\//u, ''),
    field: 'fagverk',
    schema: target.fagverk.schema,
    level: target.fagverk.level,
    status: target.fagverk.status
  };

  write(relative, place);
  console.log(`Curated Fagverk: ${place.id}`);
}

write(REGISTRY_FILE, registry);
console.log('Indexed four Place-owned Fagverk packages');
