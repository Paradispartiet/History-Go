# Oslo Prosjektrom — kildevurdering og gjenværende v1-porter

Dato: 2026-11-03

Sted: `oslo_prosjektrom` · Kunst · Platous gate 18 (nåværende publikumsinngang)

## Identitet og historisk avgrensning

Kunstnerstyrt visningsrom/atelierfellesskap, med første galleriutstilling ifølge virksomheten i 2006. Oslo Art Guide oppgir dagens inngang i Platous gate 18 og omkring 150 kunstnere i atelierfellesskapet. Dagens adresse er ikke dokumentasjon for at nøyaktig samme lokale ble brukt ved oppstarten. Kilde for første utstilling: <https://www.osloartguide.no/steder/oslo-prosjektrom>. Geonorge-markør og eksisterende ID videreføres uendret.

## Historisk bygningskontekst

Et dokumentert atelier i prosjektromfellesskapet har adresse Schweigaards gate 34A, i Landbrukskvartalet. Her lå Kristiania Melkeforsynings administrasjonsbygning fra 1913 med butikk ved hjørnet av Platous gate. Etter flyttingen av meieridriften fra området i 1976 ble de tidligere bygningene brukt til andre virksomheter. Dette beskriver kvartalets historie; ingen kilde dokumenterer at galleriet har brukt alle anleggets tidligere produksjonsrom. Kilder: <https://osloopen.no/en/kunstnere/6505>, <https://lokalhistoriewiki.no/wiki/Schweigaards_gate_(Oslo)> og <https://www.landbrukskvartalet.no/produksjonshistorie>.

## Kildeprøvde hendelser og aktører

- Galleriet oppgir tolv utstillinger årlig, og at både eksterne og interne kunstnere kan søke om utstillingsplass. <https://osloprosjektrom.blogspot.com/>
- VisitOSLO beskriver non-profit-drift ved en rullerende kunstnergruppe samt to fellesutstillinger årlig. <https://www.visitoslo.com/no/attraksjon/oslo-prosjektrom>
- Eva Fagerli Sæthren er identifisert som ansvarlig for galleriet og atelierfellesskapet i virksomhetens egen omtale og intervju (2026). <https://www.oslonytt.com/gir-kunstnere-en-scene-i-gamle-oslo/142247>
- Bjørka – verksted for fotografi annonserte kollektivutstilling ved Oslo Prosjektrom i september 2014. <https://osloprosjektrom.blogspot.com/2014/09/bjrka-verksted-for-fotografi-18.html>
- Maria Norrman er identifisert med atelier i fellesskapet og et dokumentert videoprosjekt ved Oslo Prosjektrom fra 2025. <https://osloopen.no/en/kunstnere/6505>
- 2026: Wenche Kvalstad Eckhoff (mars), Marte Dahl (august), Kebreab Demeke (september), Petter Solberg (oktober). <https://osloprosjektrom.blogspot.com/> og <https://osloartguide.no/steder/oslo-prosjektrom/utstillinger/med-handen-pa-verket>
- Terje Lerberg og Eli Katrine Kjønsberg er annonsert til åpning i november 2026; ikke behandle planlagt utstilling som allerede gjennomført per 3. november. <https://www.osloartguide.no/steder/oslo-prosjektrom>

## Candidate review for PlaceCard

| Kandidatsamling | Status | Kildebundet vurdering |
| --- | --- | --- |
| People | BLOCKED | Eva Fagerli Sæthren har en direkte driftsrelasjon. Flere navngitte utstillere har dokumentert stedstilknytning. Canonical People-ID-er, bildelisenser og preview mangler fortsatt; ingen personer opprettes fra navn alene. |
| Objects | SOURCE-BOUNDED HOLDBACK | Ingen individuelt identifiserte, kildebelagte og bildeklare gjenstander i tilgjengelig materiale. Generiske pensler, bøker eller atelierutstyr er ikke stedsspesifikke Objects. |
| Brands | BEGRUNNET N/A per nå | Oslo Prosjektrom er allerede kanonisk Place; ingen egen, selvstendig Brand identifisert og dokumentert med autentisk logo og direkte stedskobling. Ikke lag et selvrefererende Brand. |
| Productions (Kunstverk) | BLOCKED | Navngitte utstillinger og kunstnere er dokumentert, men utstillingstitler er ikke automatisk konkrete enkeltkunstverk. Egnede verk må identifiseres med tittel, kunstner, stedstilknytning, kilde og lovlig bilde. |

## Bildestatus

To dokumentariske originalfotografier fra samme historiske kvartal er rettighetsklarert og integrert som **to forskjellige lokale WebP-filer**:

- Bredt headerfoto: Schweigaards gate 34A, fotograf Ssu (25. mai 2023), [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Schweigaards_gate_34A,_Oslo.jpg), CC BY-SA 4.0. Fil: `assets/places/oslo_prosjektrom/atelier_schweigaards_34a_header.webp` (1200 × 675).
- Stående QuizCard-foto: Schweigaards gate 34C, fotograf Ssu (25. mai 2023), [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Schweigaards_gate_34C,_Oslo.jpg), CC BY-SA 4.0. Fil: `assets/places/oslo_prosjektrom/atelier_schweigaards_34c_portrait.webp` (800 × 1200).

Begge er beskjærte til webformat; originalens lisens og bearbeidelsesopplysning ligger i `imageMeta` / `frontImageMeta`. Bildene dokumenterer bebyggelsen i atelier-/Landbrukskvartalet, **ikke** galleriets registrerte publikumsinngang i Platous gate 18. En dokumentert atelieradresse er Schweigaards gate 34A. 34C vises bare som tilgrensende bygg, ikke som dokumentasjon på eget gallerirom.

Lokalhistoriewikis mulige foto fra Platous gate 18 er fortsatt ikke brukt: filens konkrete lisens og originalmotiv lot seg ikke bekrefte. Ingen verkfotografier eller kunstnerportretter uten klarert bruk er lagt inn.

## Test og publiseringsavgrensning

Fullquiz 3 × 7 = 21 spørsmål og QuizCard med de første 10 identiske spørsmålene er manifestregistrert. Canonical Knowledge er generert i 21/21 og 10/10 spørsmål, og målrettet GitHub Actions-test er grønn. To lokale WebP-filer er nå integrert med kilde-, lisens- og krediteringsdata. Den faktiske Playwright-PlaceCard-/QuizCard-testen og full gjennomspilling på mobil og desktop er siste port før merge.

Kvalitetsprofil (foreløpig): Korrekthet 4/5 · Dekning 2/5 · Redaksjon 4/5 · Teknikk 2/5 · Ansvarlighet 5/5 · Etterprøvbarhet 4/5 = **21/30**.
