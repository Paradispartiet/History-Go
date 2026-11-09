# Oslo havnefront — bolk 06: kanonisk nullmåling og første tekstleveranse

Status: **tekstfase / draft**, 9. november 2026. **IKKE v1, ikke vFerdig, ikke klar for merge som ferdige stedsdata.**

Base ved oppstart: `main` `3af5abe12d27536aa572e92d8b718ca3c948dbfb`. Denne leveransen endrer **ingen** eksisterende Place-, quiz-, bilde-, Knowledge-, Fagverk- eller runtimefiler. Den skal ikke overta den andre kontoens Oslo-bolk 04, Å–V-spor eller Kvadraturen. Dette er denne kontoens forberedende A-sted-arbeid, jf. [A-sted-audit #6762](https://github.com/Paradispartiet/History-Go/issues/6762).

## READ-FIRST og omfang

Gjennomlest på `main` før endelig stedsspesifikk innholdsplan: `AGENTS.md`, `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`, `docs/PLACE_PRODUCTION_PROFILES.md`, `docs/PLACE_PRODUCTION_MINIMUM_V1.md`, `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`, `data/places/README_place_rounds.md`, `data/badges/index.json`, `data/badges/place_production_routing_v1.json`, `data/badges/by.json`, `data/badges/kunst.json`, `data/badges/naeringsliv.json`, `data/badges/natur.json`, `docs/PLACE_OBJECTS_CANONICAL.md`, `data/brands/brand_rules_v1_1.json`, samt alle seks canonical Place-filer. Hovedbadge bevares i alle seks tilfeller. Badge- og kildeporten gir grunnlag for research, **ikke** automatisk godkjent produksjonsprofil eller samlingsmedlemskap.

De seks eksisterende canonical stedene er:

| Place-ID | Canonical fil relativt til `data/` | Hovedbadge | Konstatert på oppstarts-SHA | Målrettet rest |
| --- | --- | --- | --- | --- |
| `aker_brygge` | `places/by/oslo/places/aker_brygge.json` | by | Omfattende stedshistorie, `fagverk full/curated`, ekstern hero, ingen `frontImage` i Place, direkte quizmanifestoppføring | Behold gode tekster og Fagverk; verifiser fullquiz/QuizCard, lokalt separat bildepar, runtime og app |
| `astrup_fearnley` | `places/kunst/oslo/places_kunst/astrup_fearnley.json` | kunst | Svak generell ingress; `popupDesc` inneholder spillintern instruks; ingen `fagverk`, `image` eller `frontImage`; ingen direkte måloppføring i quizmanifestet | Kildebundet historietekst først, deretter fagmodell/quiz/bilder |
| `akershus_kaier` | `places/naeringsliv/oslo/places_naeringsliv/akershus_kaier.json` | naeringsliv | Særskilt historisk tekst, lokalt hero/portrett, `fagverk standard/curated`, fem quizsettoppføringer | Behold eksisterende; kontroll av hele quizen, QuizCard, bildekreditering og nettleser |
| `akrobaten_gangbro` | `places/by/oslo/places/akrobaten_gangbro.json` | by | Stedsspesifikk tekst og `fagverk standard/curated`; ekstern hero, ingen `frontImage`, direkte quizsett | Fjern spillintern avslutning; kontroller quiz og etabler separat stående bildeflate |
| `akerselva_utlop_bjorvika` | `places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json` | natur | Stedsspesifikt utløpsanker og naturprofil, men `popupDesc` inneholder spillintern natur-runding, uten `fagverk` eller stedbilde; ingen direkte quizsett | Sikker fysisk identitet og naturspesialprofil, historisk tekst, Fagverk og riktig quiz/bildemodell |
| `amerikalinjen` | `places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json` | naeringsliv | Kort bygningstekst og én registrert ekstern kilde, ingen `fagverk`, `image`, `frontImage` eller direkte quizsett | Kildeutvidelse, korrekt skille rederi/hovedkontor/passasjertrafikk, tekst, Fagverk, quiz og bildepar |

**Viktig:** «ingen direkte quizsett i manifestet» betyr ikke at legacy-/omnibusquiz er fullstendig utelukket. Før quizproduksjon må også slike kilder og eksisterende QuizCards kontrolleres. `cardImage` i legacy-Places er ikke ny canonical bildeflate og skal ikke videreføres ved en vesentlig fullproduksjonsrevisjon; checklisten har forrang framfor eldre v1-tekster.

## Astrup Fearnley Museet — identitet og kildegrunnlag

**Identitetsavgrensning:** Denne oppføringen representerer **museumsinstitusjonen slik den besøkes i museumsanlegget på Strandpromenaden 2, Tjuvholmen**. Museumsetableringen i Kvadraturen 1993 er en nødvendig historisk bakgrunn, men Grev Wedels plass 9 er **ikke** dagens museumskartpunkt. Tjuvholmen som byområde og den tilstøtende skulpturparken er heller ikke identiske med museumsoppføringen. Behold `category: kunst` og eksisterende steds-ID.

Kildene ble åpnet og lest 9. november 2026:

- **S1 – Museets egen bygningshistorie:** https://www.afmuseet.no/museumsbygget/ (flytting i 2012, den gamle adressen Dronningens gate, Renzo Piano Building Workshop og Narud-Stokke-Wiig, to bygg, glasstak, sjø- og seilbåtinspirasjon, permanent/skiftende utstilling; offentlig åpning oppgitt til 29.09.2012).
- **S2 – Museets egen institusjons- og samlingspresentasjon:** https://www.afmuseet.no/en/about-the-astrup-fearnley-museet/ (grunnlagt 1993; samling med røtter i 1960-årene; navngitte kunstnere; adresse Strandpromenaden 2).
- **S3 – Oslo byleksikon:** https://oslobyleksikon.no/side/Astrup_Fearnley_Museet_for_Moderne_Kunst (åpnet 09.10.1993 i Grev Wedels plass 9 / Dronningens gate 4; private fond og institusjoner; flytting 2012; to utstillingsdeler; skulpturpark).
- **S4 – Kongehuset, åpningsseremoni:** https://www.kongehuset.no/nyheter/astrup-fearnley-museet-apnet (dronning Sonjas åpningsseremoni datert 27.09.2012).

**Datokonflikt håndtert:** Museet oppgir publikumsåpning 29.09.2012, mens Oslo byleksikon/Kongehuset omtaler seremonien 27.09.2012. Begge knyttes til 2012 i brukerrettet tekst. Ikke skriv en ukvalifisert eksakt dato.

### Faktapunkter for redaksjonell setningsparitet

| Claim | Dokumentert forhold | Kilde |
| --- | --- | --- |
| AF-01 | Museumsetablering i 1993 | S2, S3 |
| AF-02 | Første museumssted ved Grev Wedels plass 9, med inngang Dronningens gate 4 | S3 |
| AF-03 | Private fond og institusjoner knyttet til Astrup/Fearnley støttet etableringen | S3 |
| AF-04 | Samlingens bakgrunn går tilbake til 1960-årene; internasjonal samtidskunst | S2 |
| AF-05 | Museet flyttet til Strandpromenaden 2, Tjuvholmen, i 2012 | S1, S2, S3 |
| AF-06 | Renzo Piano Building Workshop i samarbeid med Narud-Stokke-Wiig tegnet anlegget | S1 |
| AF-07 | To separate museumsbygg, en for samlingsverk og en for skiftende utstillinger | S1, S3 |
| AF-08 | Bøyd glassoverbygg, sjøutsyn og maritim inspirasjon; kanal og gangbro i anlegget | S1, S2 |
| AF-09 | Tilgrensende skulpturpark og strand mot fjorden | S1, S3 |
| AF-10 | Samlingspresentasjonen nevner blant andre Cindy Sherman, Jeff Koons, Damien Hirst og Ida Ekblad | S2 |

### Ny `desc` — redaksjonell kandidat

Astrup Fearnley Museet åpnet i Kvadraturen i 1993 og flyttet i 2012 til et museumsanlegg ytterst på Tjuvholmen. Renzo Piano og Narud-Stokke-Wiig tegnet de to bygningene under det buede glasstaket: den ene for verk fra museets samling, den andre for skiftende utstillinger.

**Setningsspor:** 1 = AF-01/02/05 (S1–S3); 2 = AF-06/07/08 (S1/S3).

### Ny `popupDesc` — redaksjonell kandidat

Astrup Fearnley Museet åpnet i 1993 i Grev Wedels plass 9, med inngang fra Dronningens gate. Opprettelsen bygde på private fond og bidrag knyttet til familiene Astrup og Fearnley. I nesten tjue år ble kunsten vist i den eldre bygningen i Kvadraturen, før museet flyttet ut mot fjorden.

Museets samling har røtter tilbake til 1960-årene og omfatter internasjonal samtidskunst. Blant kunstnerne som er representert, er Cindy Sherman, Jeff Koons, Damien Hirst og Ida Ekblad. Samlingen er ikke ordnet rundt én stilretning: Verkene vises i skiftende sammenstillinger, samtidig som museet lager egne midlertidige utstillinger.

Flyttingen til Tjuvholmen i 2012 ga museet to nye bygninger på hver sin side av en kanal. Renzo Piano Building Workshop samarbeidet med det norske arkitektkontoret Narud-Stokke-Wiig om anlegget. Det store, buede glasstaket og de slanke bærekonstruksjonene henter form fra seilbåter og havnen utenfor. Innvendig leder trapper, passasjer og en gangbro publikum mellom salene.

Bygningen nærmest sjøen gir plass til verk fra samlingen, mens den andre brukes til skiftende utstillinger. Utenfor ligger Tjuvholmen skulpturpark og bystranden. Museet ble dermed både en ny adresse for en kunstinstitusjon som hadde eksistert siden 1993, og en del av den nye offentlige sjøfronten ved Oslofjorden.

**Setningsspor per avsnitt:**
1. AF-01/02/03/05 (S1–S3).
2. AF-04/10 og museets eksplisitte beskrivelse av utstillingspraksis (S2).
3. AF-05/06/08 og bygningsforløp (S1/S2).
4. AF-07/09/01/05 (S1/S3).

**Tekstreview:** Ingen spillintern «History Go bør ...»-prosa. Ingen oppdiktede hendelser, dialoger, mønstre for publikumsbruk eller påstander om økonomisk effekt av museet. Foreløpig kildebundet redaksjonell kandidat, **ikke** v4.2-`ready`; egen claim-pakke, teksthash, separat faktareview, språk-/fagreview og generatorer er ikke utført. Ikke kopier innholdet inn i live Place før disse portene er løst.

## Arbeidsrekkefølge videre

1. Fullfør Astrup-tekstpakken: `data/places/production/astrup_fearnley.json` etter canonical v4.2-schema med kontrollerte claim-lokasjoner, hasher og to uavhengige reviews. Eksisterende `desc` og `popupDesc` revideres deretter med nødvendig materialisering.
2. Kjør Badge-/underbadge-preflight for kunststedet og ta konkret kildebasert valg av `major|standard|focused`; produser unik Fagverk-side og bare kvalifiserte People/Objects/Brands/kategoriuttrykk. Ingen filler.
3. Fullfør tekstfase for `amerikalinjen` og `akerselva_utlop_bjorvika` etter egen kildekontroll; reparer kun den dokumenterte spillinterne setningen i `akrobaten_gangbro`; bevar eksisterende god Aker Brygge- og Akershuskaiene-tekst.
4. **Etter ferdig tekst:** velg kilde- og rettighetsklarert motiv per Place, egne liggende `image`- og faktiske stående `frontImage`-filer; originalillustrasjoner kan brukes, men skal være eksplisitt merket som illustrasjon og aldri utgis for arkivfoto.
5. Auditér eksisterende fullquiz og QuizCards, deretter målrettede nye spørsmål der de mangler, Knowledge- og manifestparitet og riktig dedikert QuizCard/flip.
6. Materialiser `places_index`, Fagverk, Place-open, quiz/Knowledge, språk og epoker; kjør målrettet CI og reell 390px/1440px browser-QA. Ingen ny fullkatalogtest per delsteg.
7. V1-vurdering krever seksdimensjonal kvalitetsport med minimum 4/5 hver, totalt minst 27/30 og ingen blokkere; nå er scope og v1-bilde/quiz/full integrasjon **ikke** fullført.

**Ingen statusendring til v1/vFerdig er autorisert eller dokumentert gjennom denne research-PR-en alene.**
