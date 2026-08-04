# Subkultur-fagverk V1 – produksjonskontrakt

Status: `quality_review_required`

Eier: `data/fag/subkultur` og `data/fagverk/subkultur`

Definisjon låst: 2026-08-04

## Formål

Subkultur-fagverket skal forklare mennesker, miljøer og praksiser på siden av eller i friksjon med storsamfunnet. Et sted, en aktivitet eller en estetikk er ikke Subkultur alene. Faget krever et dokumentert miljø, en sosial praksis og en påviselig posisjon til regler, institusjoner, markeder eller dominerende normer.

Fagverket skal være universelt i teorikjernen og stedbundet i casene. Oslo, Norge og andre geografier kan realisere teorien, men skal ikke brukes som definisjon av faget.

## Feltgrense

Følgende kan kvalifisere når miljø, praksis og sosial posisjon er dokumentert:

- alternative bo-, kunst- og kulturmiljøer;
- okkupasjon, autonome rom og egenorganisering;
- punk-, klubb-, rave-, hiphop-, graffiti-, skate-, zine- og andre undergrunnsmiljøer;
- åpne rusmiljøer, gatefellesskap, lavterskeltiltak, gjensidig hjelp og skadereduksjon;
- digitale, translokale eller hybride miljøer med dokumenterte normer, relasjoner og praksiser;
- tapte, kommersialiserte, institusjonaliserte eller kulturarvfestede miljøer.

Følgende er ikke nok alene:

- ungdom, aktivitet, urban estetikk eller fritid;
- skatepark, pumptrack, konsertsted, butikk eller kulturhus;
- sjanger, klesstil, fandom eller kommersiell «alternativ» merkevare;
- byoriginal, kjent person eller marginalitetsmerkelapp uten dokumentert miljøkobling;
- konflikt, lovbrudd eller utenforskap uten en dokumentert sosial verden.

## Canonical arkitektur

Faget består av åtte fagområder med ti individuelt redigerte emner og teoriobjekter i hvert:

1. Subkulturteori og feltgrenser
2. Fellesskap, scener og egenorganisering
3. Stil, symboler, koder og kropp
4. Steder, territorier og okkupasjon
5. Motstand, avvik og kontroll
6. Medier, objekter og praksiser
7. Sosiale randsoner, omsorg og skadereduksjon
8. Kommersialisering, institusjonalisering og minne

Canonical mål er derfor `8 domener × 10 emner = 80 teoriobjekter`.

## Kilde- og evidenskrav

Hvert teoriobjekt skal ha:

- en presis tese eller begrepsdefinisjon;
- en dokumentert teori- eller forskningslinje;
- en forklaringsmekanisme og et avgrenset anvendelsesområde;
- begrensning, feilbruk og minst én faglig kritikk eller motposisjon;
- en operativ metodekobling;
- minst én faglig hovedkilde og én uavhengig kontroll- eller kritikkilde;
- en casekobling der caset anvender teorien uten å brukes som universelt teoribevis;
- etisk vurdering når nålevende, sårbare eller kriminaliserte miljøer berøres.

Canonicalfiler er styringslag og kan aldri være eneste bevis for eksterne faktapåstander.

## Stemme, personvern og representasjon

Miljønære kilder og uavhengige kontrollkilder skal balanseres. En aktørs egenpresentasjon kan dokumentere mål, praksis og selvforståelse, men ikke alene avgjøre virkning, representativitet eller konflikt.

Fagverket skal ikke identifisere sårbare personer fordi opplysninger er teknisk offentlige. Det skal vurdere kontekst, forventet offentlighet, risiko for skade, stempling og uønsket sammenstilling. Åpne rusmiljøer og gatefellesskap skal analyseres gjennom rettigheter, relasjoner, tjenester, risiko og rom – ikke som eksotiske eller kriminaliserte kulisser.

## Kapittelkontrakt

Hvert av de åtte fagområdene får ett fullverdig kapittel med:

- tre redigerte moduler;
- ni seksjoner og 27 sammenhengende fagavsnitt;
- minst 36 avsnittssporbare claims;
- minst 20 inspectable kildetilknytninger;
- minst to arbeidseksempler;
- minst fem eksplisitte misoppfatninger;
- minst tre anvendelsesoppgaver;
- minst åtte kontrollspørsmål;
- minst seks canonicale stedskoblinger;
- komplett avsnitt → claim → kilde-sporing.

## Metodekontrakt

Metoder skal beskrive en faktisk analyseoperasjon: hva som avgrenses, hvilke data som trengs, hvordan analysen gjennomføres og hvilke slutninger metoden ikke tillater. Synonyme eller generiske metodeposter skal konsolideres. Hver aktiv metode skal brukes av minst ett emne og hvert emne skal ha minst én operativ metode.

## Geografiske profiler og dataobjekter

Teorikjernen er geografisk nøytral. Oslo-/Norge-profiler materialiserer den gjennom dokumenterte casekjeder. Primær Subkultur, sekundærbadge `subkultur` og canonicale `em_sub_*` omfattes av samme kvalitetskrav.

Places og People skal auditeres som egne dataobjekter. Et kollektivt miljøanker kan beholdes når det er tydelig at posten representerer et miljø og ikke en oppdiktet person. Svake kategorikoblinger skal flyttes, fjernes eller settes i eksplisitt kvalitetsreview; de kan ikke skjules bak fagverkets teori.

Casekilder lagres separat fra teorikildene. En profilkandidat kan bare få `validated_case` når en `ready` Subkultur A–H-rapport dokumenterer alle fem casekravene: miljø/praksis/posisjon, miljønær og uavhengig stemme, sted/kontroll/endring, personvern/stigma/romantisering og et eksplisitt negativt case eller en alternativ forklaring. Profilen skal peke til samme caseevidens og minst to inspectable kilder. Delvis validering skal oppgi både validert antall og gjenværende kandidater og kan ikke brukes til å hevde at profilen er komplett.

## Quiz og Knowledge

Faget skal ha åtte subject pathways med fem vurderingstrinn hver: observere, forklare, vurdere evidens, diagnostisere feilslutning og begrunne valg. Alle 40 spørsmål skal ha canonical emne-, metode-, claim-, kilde- og Knowledge-kobling.

Legacyquiz uten kildegrunnlag eller med fremmede `em_by_*` kan ikke regnes som fagverkdekning.

## Statusporter

Subkultur kan bare få følgende sluttstatus når alle porter er grønne:

- `navigationStatus: materialized`
- `assessmentStatus: audited`
- `editorialStatus: complete`
- `nextGate: maintenance_and_source_refresh`

Sluttporten krever 8/8 kapitler, 80/80 evidence-ready teoriobjekter, 0 ugyldige referanser, komplett caseprofil, full Places/People-audit, 8/8 pathways, Knowledge-synkronisering og grønn generell fagverkaudit.

Før dette skal status forbli `planned`, `pending` og `not_started` eller – etter reell strukturell materialisering – den lavere dokumenterte delstatusen kontrakten tillater.
