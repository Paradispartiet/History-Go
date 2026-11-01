# Akerselva – navigasjon og modulrevisjon, 1. november 2026

## Avgrensning og nullmåling

Base: `1e7d886fe90a4d5e192c667b73ebe4ccee244d8f` (PR #6859 merget).
Artikkelen har allerede 41 verifiserte claims, 36 setningskoblinger og materialiserte epoker. Samlingen People har Knud Graah og Halvor Schou. Før denne revisjonen manglet Akerselva `related_place_ids`, Lesespor var tomt, ingen nyere notis var materialisert, og arbeidskortet viste flere løste blokkeringer som åpne.

`data/runtime/place-open/akerselva.json.relations` er person-/aktørrelasjoner fra `data/relations*.json`; den tomme listen er ikke i seg selv feil. Canonical sted→sted-koblinger hører i Place-kildens `related_place_ids`. Den eksisterende samlingsadapteren kunne lese slike ID-er, men den nye ordinære PlaceCard-komposisjonen hadde ingen selvstendig navigasjonsflate for dem. Den felles Om-rendereren får derfor en navigasjonsseksjon. ID-er løses mot canonical PLACES; ukjente, skjulte, stubber, egen-ID og duplikater utelates. Navn HTML-escapes, og hash-lenker bruker den eksisterende ruteren. Relasjoner legges ikke inn som en PlaceCard-samling eller som People.

## Badge, profil og eierskap

Hovedbadge: By (`data/badges/by.json`). Den tidligere underbadgen `industri` finnes ikke i denne badgefamilien; `infrastruktur` er den dokumenterte By-underbadgen for vannkraft-, vann- og elvekorridoren. De eksisterende Historie-/Næringsliv-emnene og den aktive quizen beholdes. Standard-profilen er bekreftet mot stoffbredde og kildegrunnlag. Samlingsvalget er fortsatt bare People; separate fabrikker, fosser og broer opprettes ikke som dupliserte Structures/Objects/Brands. `cardImage` er fjernet fra denne Place-kilden og indeksen etter gjeldende bildefeltkontrakt; de autentiske `image` og `frontImage` er bevart.

## Fem stedskoblinger

| Canonical mål | Stedlig forbindelse | Inspectable kilde |
| --- | --- | --- |
| `nydalen` | Elveløp og tidligere industrimiljø | Oslo byleksikon, Akerselva: innledning/industrioversikt; museumsguidens Nydalen-stopp |
| `voienfossen` | Vøyenfallene som vannkraft- og tekstilindustristed | Museumsguiden: «Vøyen – hjertet midt i Akerselva»; Oslo byleksikons industrioversikt |
| `ovre_foss` | Øvre Foss og Seilduksfabrikken ved elva | Museumsguiden: «Øvre Foss»; Oslo byleksikons industrioversikt |
| `beierbrua` | Bro og historisk fabrikkmiljø over elva | Museumsguiden: «Beierbrua»; Oslo byleksikons brooversikt |
| `ankerbrua` | Elvekryssing i nedre bystrekning | Oslo byleksikons brooversikt og miljøparkartikkel |

- https://oslobyleksikon.no/side/Akerselva
- https://oslobyleksikon.no/side/Akerselva_Milj%C3%B8park
- https://von-landing-page.vercel.app/p/Norsk%2BTeknisk%2BMuseum/route/2232

Koblingene er navigasjon til egne Places, ikke en påstand om at hele elva består av bare disse fem anleggene.

## Lesespor: to åpne tekster

Manifest-loadet eier: `data/lesespor/oslo/lesespor_oslo_by.json`. Begge har eksplisitt `place_ids: ["akerselva"]`, `access: open`, `rights: link_only` og kontroll 1.11.2026. Ingen artikkelfulltekst kopieres.

1. **Akerselva - et museum gjennom byen**, Norsk Teknisk Museum og Oslo Museum – Arbeidermuseet. Nettsiden er direkte lesbar og går utover hovedartikkelen med vannkonflikter, arbeidermiljøer og lokale stopp. Guiden oppgir relansering i 2020; lyd/app-tilbudet er separat fra den åpne netteksten. https://von-landing-page.vercel.app/p/Norsk%2BTeknisk%2BMuseum/route/2232
2. **Vann og avløp i 150 år**, Vann- og avløpsetaten / Oslo kommune, 2026. Kontrollert seksjonene om vannressursenes rolle for næringslivet og om avløpsarbeid og elvemiljø. https://www.oslo.kommune.no/etater-foretak-og-ombud/vann-og-avlopsetaten/vann-og-avlop-i-150-ar/

## Nyheter: datert, avsluttet høring

Den eksisterende manifest-loadede Leksikon-filen `data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json` har fått en egen `news_note` for Akerselva. Datoen 10.04.2026 er eksplisitt **høringsfrist**, ikke antatt publiseringsdato. `status: archived` og teksten gjør det klart at fristen er utløpt og at kunngjøringen ikke beviser en ferdig vedtatt forvaltningsplan.

Kilde: https://www.oslo.kommune.no/kunngjoringer/horing-av-arbeid-med-forvaltningsplan-for-akerselva-miljopark/ — «Hovedtema», «Tidsplan/framdrift», fristfelt og ansvarlig etat. Lest 1.11.2026.

Et separat fersksøk fant også kommunens oppgradering av Axel Maurers vei (ferdig august 2025). Den er ikke blandet inn som en udokumentert ny hendelse i 2026: https://www.oslo.kommune.no/slik-bygger-vi-oslo/opprusting-gang-og-sykkelvei-langs-axel-maurers-vei/

## Før/etter: reell, åpen blocker

Arkivsøket omfattet Oslo Museum/Oslobilder, DigitaltMuseum, museenes elveguide og Akerselva Friluftsmuseums Inger Munch-presentasjon. Kandidater:

- **OMu.F26517**, Ruth Raabe: «Akerselva fra Nybrua mot Ankerbrua», datert 18.10.1931 i søkeresultatet. Kandidaten gjelder selve elverommet, ikke Ankerbrua som eget Place. https://www.oslobilder.no/OMU/OMu.F26517
- **OB.Z00960 / OB.Z01063**, Inger Munch, antatt 1929: mulige elveutsnitt ved Ankerbrua. https://www.oslobilder.no/OMU/OB.Z00960 ; https://www.oslobilder.no/OMU/OB.Z01063
- **OB.K0243**, Truls Teigen: «Ankerbrua sett fra Nybrua», 1961. Senere supplement, svakere historisk dybde enn 1931-kandidaten. https://oslobilder.no/OMU/OB.K0243
- Akerselva Friluftsmuseum viser Inger Munchs fotospor, men dette alene dokumenterer ikke den konkrete gjenbrukslisensen: https://www.akerselva.no/inger-munch

Detaljoppslagene for OMu.F26517 returnerte **403 Forbidden** ved kontroll; OB.Z00960 og OB.Z01063 kunne heller ikke åpnes. Søket ga generisk «Creative Commons 3.0», men ingen inspisert, entydig lisensvariant og ingen verifisert bildefil. DigitaltMuseum-søket kunne ikke åpnes. Et fullt bildepar kan derfor ikke godkjennes fra søkeresultater alene.

Dagens hero av Reem78 er fra **19.08.2015**, ikke et nåfoto fra 2026. Metadata plasserer kameraet ved 59.919455, 10.756134, men standpunkt/retning og utsnitt er ikke visuelt sammenholdt med 1931-fotoet. Bildet brukes ikke som automatisk «nå»-erstatning. Kilde: https://commons.wikimedia.org/wiki/File:The_Akerselva_river_in_Oslo.jpg

Ingen falsk Før/etter-flate er publisert. Gate: **BLOCKED** til konkret lisens, bildefil og sammenlignbart etterbilde er inspisert. Dette stopper full vFerdig.

## Øvrige moduler og bevaring

- **Fortellinger:** Den tidligere fyrstikk-Storyen forblir på Bryn (#6862). De gjennomgåtte utslippene ligger i chronology; de er ikke blåst opp til en oppdiktet scene-Story. Broer og fabrikker med egne Places beholder sine historier. Ingen ny selvstendig Story er godkjent i denne avgrensede fasen.
- **Språk:** de fem eksisterende, kildebelagte navnesporene beholdes. Dialekt er ikke lagt til på dette elve-Place-et uten area-eierskap.
- **Fagverk:** eksisterende Place-eid, kuratert fagverk beholdes og kontrolleres i den virkelige appen.
- **Quiz:** 30 aktive fullquizspørsmål og 10 avledede QuizCard-spørsmål beholdes med stabile ID-er; de fem legacy-spørsmålene er ikke fem ekstra aktive spørsmål. Ingen quizomlegging i denne fasen.
- **Personer, besøk og progresjon:** verifiserte portretter og person-ID-er beholdes. Navigasjon og lesing skal ikke skrive fysisk besøk; den utvidede browser-testen kontrollerer dette.
- **Kilder:** Stortingets samtidige saltsyre-kilde, museumsguiden og SNL/Bentse Brug er lagt til som brukerrettede referanser. Produksjonspakkens metadata-snapshot er synkronisert uten endring av godkjent ingress/artikkel eller teksthash.

## Validering og kvalitet

Utført lokalt: ni relevante About-/Akerselva-kontrakter bestod; Lesespor-validering består for 28 aktive filer (kun eksisterende alias-/duplikatvarsler); web-TypeScript-kontroll består etter eksplisitt typet ID-katalog; READ-FIRST-preflight er registrert på nytt. Runtime, Places-indeks og web-bundle er bygget med canonicale byggere. Epokeindeksen og Fagverk-release er uendret etter ny deterministisk bygging.

Lokal Chromium-nedlasting feilet (arkivet var ufullstendig). Akerselvas eksisterende GitHub-browserløp er derfor utvidet med fem faktiske navigasjonsklikk, begge lesespor, høringsnotisen og kontroll av uendret besøksstatus på mobil og desktop. Endelig head må bestå dette før merge; eksisterende grønn test fra #6859 brukes ikke som bevis for denne endringen.

| Dimensjon | Denne navigasjons-/modulrettelsen | Evidens |
| --- | ---:| --- |
| Korrekthet og evidens | 5/5 | Fem kildebelagte mål, åpne tekster, høringsfrist merket korrekt, ingen antatt planvedtak. |
| Dekning av rettelsen | 5/5 | Data, navigasjonsrenderer, generert runtime, synlige kilder og regressionsdekning er med. |
| Redaksjonell kvalitet | 4/5 | Korte stedsspesifikke lesebegrunnelser og avgrenset nyhetsnotis. |
| Teknisk integritet | 4/5 | Lokale kontrakter, typer og bygg består; endelig GitHub-browser/CI er egen mergeport. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen brukerstatusmutasjon; HTML-escaping og gyldige mål; uklar bildelisens holdes tilbake. |
| Etterprøvbarhet | 5/5 | Canonicale eiere, kildeplasseringer, uendret teksthash og eksplisitt blokkert bildepar. |

**28/30 for rettelsen**, betinget av grønn final CI og visuell kontroll av browserartefaktene før merge. Dette er ikke full vFerdig: Før/etter har fortsatt en reell kilde-/bildeblocker.
