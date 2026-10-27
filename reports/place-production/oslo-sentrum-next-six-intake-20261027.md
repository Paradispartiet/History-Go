# Oslo sentrum – neste seks v1-steder (27. oktober 2026)

## Avgrensning
Dette er **eget arbeidsspor** etter merget Oslo Kvadraturen #6578 og #6620. Ingen endring av de 17 stedene i Oslo-bolk 04 (#6553), eksisterende seks Politikk-steder (#6579), eller de seks kultur- og institusjonsstedene (#6586). De seks kanoniske Place-ID-ene gjenbrukes; ingen nye dubletter eller parallell quizmotor.

## Steder og faglig vinkling

| Kanonisk sted | Hovedspørsmål | Kilde | Bilde-/stedskrav |
| --- | --- | --- | --- |
| `kontraskjaeret` | Hvordan skiller vi bolighusruiner fra festningsverk, og hva gir arkeologien oss? | [Oppdag Kvadraturen](https://www.oppdagkvadraturen.no/stoppesteder/kontraskjaeret) | Marker boligtuftene korrekt; ikke bruk festningen som stedets egen hovedidentitet |
| `palehaven_paleet` | Hvordan ble et privat palé og en åpen hage til en kongelig og offentlig arena? | [Oppdag Kvadraturen](https://www.oppdagkvadraturen.no/stoppesteder/palehaven-og-paleet) | Paleet er revet; dokumentert områdeanker eller tydelig merket historisk illustrasjon, ikke bilde av et stående palé |
| `avisen_tiden_radhusgata_10` | Hvordan påvirket trykking, sensur og nyhetsutvalg offentligheten i 1814? | [Oppdag Kvadraturen](https://www.oppdagkvadraturen.no/en/sights/radhusgata-10-avisen-tiden) | Rådhusgata 10 er trykksted, ikke Stortinget; 1808 er avisstart, ikke byggets oppføringsår |
| `egertorget` | Hva skjedde med ferdsel og handel da den gamle byen ble koblet til slottsaksen? | [Oppdag Kvadraturen](https://www.oppdagkvadraturen.no/stoppesteder/egertorget) | Siktlinjen og torget som plass, ikke generell Karl Johans gate |
| `mustadgarden_kongens_gate_3` | Hvordan leses en gammel konstruksjon, yngre fasade og samtidskunst i samme bygg? | [Oppdag Kvadraturen](https://www.oppdagkvadraturen.no/stoppesteder/den-rode-prikk-otto-kunzli) | Usikkert oppføringsår beholdes ukjent; «Den røde prikk» er Otto Künzlis verk fra 1996 |
| `wessels_plass` | Hvordan ble Bukkebjerget og privat hage til en park og trafikkplass ved nasjonale institusjoner? | [Oppdag Kvadraturen](https://www.oppdagkvadraturen.no/stoppesteder/wessels-plass) | Plassen skilles fra Stortinget, Frimurerlogen og nabobygningene |

## Status i denne PR-en
- **6/6 faglige Fagverk-sider** i eksisterende kanoniske stedfiler med fire artikeldeler, fire perspektiver, fem undersøkelsesspørsmål, begreper, observerbare spor, uttrykkelige kildegrenser og kildehenvisninger.
- **6/6 registrert** i det eksisterende Fagverk-registeret. Ingen eget eller parallelt register.
- **Ikke ferdig v1**: stedsspesifikke fullquizer, QuizCards, sikre bildefiler/lisenser, runtime- og release-regenerering, visuell mobil/desktop-QA samt full kilde- og innholdsrevisjon gjenstår.
- De seks har per inventering ingen egne `data/quiz/<kategori>/<place_id>_sets.json`-filer. Ikke kopier andres quiz ukritisk. Mål etter kildekontroll: 21 fullquiz og 10 QuizCard per sted, med eksakt én fasit og kanoniske Knowledge-koblinger.

## Redaksjonelle regler
- **Ingen årstallspugging som bærende quizform.** Maks ett datoorientert spørsmål per sted, og bare hvis en historisk rekkefølge er selve læringspoenget. Prioriter kontekst, kildegrense, årsak, motiv, synlig spor, motsetning og sammenligning.
- Bruk kun stedets egen identitet. Ingen sammenblanding med Slottet, Stortinget, Akershus festning, Karl Johans gate eller dagens kjøpesenter Paleet.
- Skille **dokumentert observasjon**, **tolkning** og **usikkerhet**. Særlig viktig for Mustadgårdens tidlige datering, Paléets forsvunne bygning og avisens ufullstendige Kiel-fredsmelding.
- Produksjonsrekkefølge: 1) kildebelagt tekst og fagverk, 2) lisensiert stedbilde/asset, 3) fullquiz + QuizCard og ferdig sted.
- CI: bevar eksisterende tester og manifest-/release-generering; ikke slå av kontroller for å få en grønn PR.

## Neste leveranse
Regenerer Fagverk-release med repoets byggeskript og kjør kontrollene. Produser deretter quizpakker og lisensierte bilder mot de seks kanoniske place-ID-ene; ingen `v1Approved` før nettlesergjennomspill, kilderevisjon og merge/publisering.
