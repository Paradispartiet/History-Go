# Teknologi V2.2 – fagontologi og begrepsdybde

## Formål

V2.2 løser to svakheter i V2.1:

1. Alle fagområder hadde nøyaktig to teoriobjekter, selv om områdenes kompleksitet er ulik.
2. `theory_objects` blandet teori, modell, prinsipp, rammeverk og arkitekturmønster uten eksplisitt objekttype.

Laget bevarer alle eksisterende ID-er, men gir dem korrekt epistemisk klassifisering og supplerer de mest sammensatte områdene med større dybde.

## Kunnskapsobjekter

V2.2 skiller mellom:

- teori
- modell
- prinsipp
- rammeverk
- lov
- teorem
- arkitekturmønster

De 24 eksisterende objektene klassifiseres uten ID-brudd. I tillegg innføres 24 nye objekter. Det gir 48 operative kunnskapsobjekter totalt.

Dybden er med vilje ulik:

- Algoritmer, data og AI: 6 objekter
- Nettverk, cybersikkerhet og infrastruktur: 6 objekter
- Programvareteknikk: 5 objekter
- Systemer, robotikk, HCI og STS: 4 objekter
- Øvrige områder: 3 objekter

Nye tyngdepunkter omfatter blant annet kausalmodeller, distribusjonsskift, Bayesiansk beslutningsteori, konsensus, CAP-teoremet, nulltillit, Design by Contract, observabilitet, bruddmekanikk, samplingsteoremet, situert handling og flernivåperspektiv på omstilling.

## Begrepsontologi

De 72 eksisterende begrepene får eksplisitt begrepstype. Det legges til 64 nye begreper, slik at ontologien inneholder 136 begreper totalt.

Hvert nytt begrep har:

- presis definisjon
- avgrensning mot nærliggende begrep
- konkret eksempel
- moteksempel
- fagområde og begrepstype

Begrepsgrafen inneholder 172 typede relasjoner. Alle 136 begrepene deltar i grafen. Relasjonene uttrykker blant annet:

- `part_of`
- `constrains`
- `depends_on`
- `measured_by`
- `mitigates`
- `degrades`
- `implemented_by`
- `contrasts_with`
- `governed_by`

Dermed er ikke `related_ids` lenger den eneste relasjonsformen.

## Ulik faglig dybde

Begrepsmengden følger områdets kompleksitet:

- AI og cybersikkerhet: 14 begreper hver
- systemer, programvare, HCI og STS: 12 begreper hver
- øvrige områder: 10 begreper hver

Dette erstatter den kunstige symmetrien på seks begreper per område.

## Produksjonsregel

Et avansert Teknologi-spørsmål eller en analyse skal:

1. angi om fagobjektet er teori, modell, prinsipp, rammeverk, lov, teorem eller arkitekturmønster
2. bruke objektets antakelser og gyldighetsområde
3. anvende minst én eksplisitt, typet begrepsrelasjon
4. koble påstanden til evidens, usikkerhet og en konkret teknologisk kontekst
5. unngå å bruke et teorinavn som dekorasjon

## Validering

`tools/validate-teknologi-ontology-v2_2.mjs` kontrollerer:

- at alle 24 eksisterende objekt-ID-er er bevart og klassifisert
- at 24 nye kunnskapsobjekter er komplette og refererer til gyldige begreper
- at alle sju objekttyper er i bruk
- at 72 eksisterende og 64 nye begreper gir totalt 136
- at alle begreper deltar i den typede grafen
- at avanserte områder faktisk har større dybde
- at quizprofilen bruker V2.2-ontologien
