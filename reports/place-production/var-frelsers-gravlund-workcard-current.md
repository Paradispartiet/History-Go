# Vår Frelsers gravlund – produksjonskort

Dato: 2026-08-22
Canonical place-ID: `var_frelsers_gravlund`  
Status: **PRODUKSJONSKLAR – fase 5 PASS**

## Stedsidentitet

Stedet er hele gravlundsarealet Vår Frelsers gravlund, etablert i 1807 og tatt i bruk i 1808. Det omfatter Æreslunden som et internt delområde, men oppretter ikke enkeltgraver, det tidligere kapellet eller Gamle Aker kirkegård som parallelle versjoner av samme sted.

Koordinaten beholdes uendret som en verifisert arealmarkør. Offisiell besøksadresse er Akersbakken 32, men koordinatfasen åpnes ikke på nytt i denne produksjonen.

## Nullmåling mot stedschecklisten

| Område | Utgangspunkt | Beslutning |
| --- | --- | --- |
| Identitet og koordinat | Canonical ID og `verified_geometry` finnes | Behold |
| `desc` / `popupDesc` | Lang, navnetung tekst med udokumenterte eller utdaterte formuleringer | Omskrevet i fase 1 |
| Historieproduksjon | Ingen v1-rapport | Ny canonical rapport i fase 1 |
| Popupkronologi | Kort legacy-artikkel | 13 kildebelagte punkter fra 1805 til 2026 |
| Story | Én svak «historical»-oppføring uten episodekontrakt | Episode om fem bekransninger 17. mai 2026 |
| Før/etter | Manglet | To lokale, rettighetsklare bilder med eksplisitt kamerabegrensning |
| Nyheter | Manglet | Vedtektsendring og krigshistorisk vandring i 2026 |
| Lesespor | Manglet | Tre åpne, direkte og kuraterte leselenker |
| Språk | Manglet | Fire lokale språkspor; ingen udokumentert dialekt |
| People | Minst 15 koblinger, ujevn kvalitet og ingen kuratert stedsrunde | 16 kildeklare profiler; 13 lokale bilder og tre eksplisitte designkode-fallbacker |
| Objects | Mangler canonical stedsobjekter | Tre fysiske, stedsspesifikke objekter med lokale og rettighetsklarerte bilder |
| Brands | Mangler | Gravplassetaten og ASCE/European Cemeteries Route med dokumentert stedskobling og logo |
| Related | Finnes bare som frø i profiler | Fire canonicale nabosteder og én firestopps nabolagsrute |
| Quiz | Ett sett, fem spørsmål | Fire sett à sju: sted, kronologi, historiebruk og faglig sluttsett |
| Knowledge / Fagverk | Quizgenerert minimum; ingen målmanifest | Canonical Knowledge-synk og mål i Historie-manifestet |
| Natur | Generisk `nature_profile`, ingen artsdokumentasjon | Behold natur som stedsopplevelse; ingen rå artsliste |
| Legacy-felter | `safe_facts`, Wonderkammer- og People-seeds | Fjernet etter migrasjon til claims, Story, quiz/Knowledge, Språk og canonicale People |
| QA | Eldre strukturkontroll med manuelle hull | Permanent statisk og Chromium-basert sluttgate på desktop og mobil |

## Kildegrunnlag låst i fase 1

- Oslo kommune / Gravplassetaten: nåværende bruk, gravtyper, gjenbruksstans og offisielle kart.
- Store norske leksikon: areal, utvidelser, fredning, urnegraver, kapell og Æreslunden.
- Oslo Byleksikon: gravplassreformen etter 1805, klassekontrasten til Ankerløkken, kapellet og Æreslunden.
- Oslo kommunes 17. mai-program: navngitte, daterte bekransninger og aktiv historiebruk.

## Holdes tilbake

- Eksakte felt-, rad- og gravnummer i brukerrettet tekst.
- Ubelagte tall for vernede gravminner.
- Første begravelse og andre persondetaljer som ikke er kontrollert i sterkere kilder.
- Påstander om at alle kjente personer ligger i Æreslunden.
- Artskoblinger basert bare på nærhet eller generisk parkhabitat.

## Faseplan

1. **PASS** – identitet, kilder, v4.2-beskrivelse og Historie-case.
2. **PASS** – popup: kronologi, Story, Før/etter, Kilder, Nyheter, Lesespor og Språk.
3. **PASS** – quiz 4 × 7, produksjonsbrief, kontekst, Knowledge og Fagverk.
4. **PASS** – People, Objects, Brands og Related med bilder, samt firestoppsruten «Akersryggen – trehus, stein, minne og park». Standardrundene brukes uten lokal runtime-override.
5. **PASS** – onsite, progresjon, desktop/mobil, tilgjengelighet, legacy-opprydding og endelig 6-dimensjonal kvalitetsscore.

## Kvalitetsstatus fase 5

Ingen kritiske blokkere. Standardkontrakten gir rundingene `people`, `objects`, `brands` og `related`, mens merket ligger separat. People-runden har 16 kildeklare profiler uten brutte bildebaner; 13 har lokale bilder og tre bruker eksisterende designkode-fallback. Objects har tre fysiske stopp med 100 prosent lokal bilde- og kildekning. Brands har to reelle aktører med 100 prosent logodekning. Fire nabosteder resolver, og ruten binder Damstredet/Telthusbakken, Gamle Aker kirke, Vår Frelsers og St. Hanshaugen sammen gjennom eksisterende rutesystem.

Sluttfasen fjerner tre parallelle legacy-eiere og den utdaterte 1952-formuleringen. Onsite-opplevelsen bruker områdeanker, ordinære gangveier og eksplisitt gravlundsetikk; eksakte gravfelt holdes tilbake. Eksisterende eiere for fysisk besøk, favoritt, quiz og Next Action gjenbrukes uten ny lagring. Chromium-gaten verifiserer elleve popupfaner, tastaturnavigasjon, alle fire rundinger og Fagverk på 1440 × 1000 og 390 × 844.

Endelig score: korrekthet og evidens 5/5, dekning og ferdigstillelse 5/5, redaksjonell kvalitet 5/5, teknisk integritet 5/5, sikkerhet og ansvarlighet 5/5, vedlikeholdbarhet og etterprøvbarhet 5/5. Totalt 30/30; 0 kritiske funn.
