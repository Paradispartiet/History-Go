# Museumsleiligheten Gråbein — stedsproduksjon, nullmåling og kontroll

Kontrolldato: 2026-10-09. Canonical Place-ID: `museumsleiligheten_grabein`. Stedsarbeidet er separat fra quizproduksjonen i [PR #6159](https://github.com/Paradispartiet/History-Go/pull/6159).

## Identitet, Badge og profil

- Stedet er den bevarte **museumsleiligheten i Tøyengata 38B**, ikke alle Gråbeingårdene eller Arbeidermuseet i Sagveien.
- Hovedbadge: `historie`. Dokumenterte underbadges: `attenhundretallet`, `nittenhundre_1900_1945`, `sosialhistorie`, `migrasjon_og_minoritetshistorie` og `kulturminner_og_bevaring`.
- Bekreftet profil: `standard` på grunnlag av boligbygging, arbeidsmigrasjon, klasse-/bolighistorie og senere restaurering/musealisering.
- Koordinat: Geonorge adressepunkt 38B, `coordRole=display_marker`. Museet ligger i en leilighet i bygget, ikke i en geometrisk utstrekning for hele Gråbeingårdene.
- Eksisterende quiz: **PASS** – 28 spørsmål i fire sett, PR #6159, browser-testet på mobil og desktop. Ikke produsert om her.

## Kilderevisjon

| ID | Kilde | Bruk | Kontroll |
|---|---|---|---|
| Museum | https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/ | Bjørklund, 1891, en rom/kjøkken, boligstandard, 1987, 1990, besøksvilkår | gjennomgått |
| By | https://oslobyleksikon.no/side/T%C3%B8yengata | Tøyengata 38B fra 1888; 7 gårder, 212 leiligheter; rehabilitert 1981–83 | gjennomgått |
| SNL | https://snl.no/Gr%C3%A5being%C3%A5rdene | byggmesternavn, arkitekt, historie/litteratur, forskjell mellom gårdsgrupper | gjennomgått |
| SNL arkitekt | https://snl.no/Rudolf_Haeselich | Haeselich og teglarkitekturen | gjennomgått |
| Commons | https://commons.wikimedia.org/wiki/File:T%C3%B8yengata_38_fra_KMS.jpg | nøyaktig Tøyengata 38 fotografert av T. Grevstad-Nordbrock i 2022; CC BY 4.0 | lisens, år og motiv kontrollert |

## Status per sjekklistemodul (før visuell closeout)

| Port | Status | Evidens eller konkret rest |
|---|---|---|
| Canonical ID, tekst og koordinat | PASS | Place-kilde og offisiell adresse |
| Hovedbadge, underbadges, produksjonsprofil | PASS | Place-kilde og denne kilderapporten |
| Fagverk sted | PASS teknisk, manuell UI-QA gjenstår | Place-eid kuratert standardartikkel, fire linser, fem spørsmål, to spor, Fire kilder, registry |
| Språkleksikon | PASS teknisk, manuell UI-QA gjenstår | Fire stedsspesifikke oppføringer og canonical språkmanifest |
| Kronologi/epoker | PASS teknisk, manuell UI-QA gjenstår | 1888, 1891, 1919, perioden 1981–83, 1987, 1990 |
| Quiz | PASS | PR #6159, ingen omproduksjon |
| Bilder (`image`, stående `frontImage`) | PASS teknisk, manuell UI-QA gjenstår | To lokale, separate WebP-varianter fra rettighetsklarert Commons-original; portrett dimensjonskontrollert og bildekontroll bestått |
| QuizCard + flip | PASS manifest, browser-QA gjenstår | Stedsspesifikk 10-spørsmåls QuizCard laget fra merget 4×7-quiz og registrert i historie-manifestet. Faktisk flip-interaksjon skal browser-testes. |
| PlaceCard-samlinger | DELVIS PASS, avsluttende visuell QA mangler | Én kildebåret historisk hendelse (oppføring 1888) har bildesikret medlem, merket 2022-foto. Andre kandidatfamilier er særskilt uferdige. |
| People | BLOCKED | Bjørklund-familien er dokumentert, men ikke tilstrekkelig individualisert til People-profil; Ole Olsen/Haeselich må auditeres mot eksisterende kanoniske personer og stedskrav |
| Objects | BLOCKED | Museets symaskin, seng m.m. er fotografert, men konkrete museumsobjekters proveniens og eierskap er ikke verifisert |
| Brands | BLOCKED | Oslo Museum/Tøyenhagen og «Gråbein» må testes mot Brand-kontrakten før N/A eller PASS |
| Historiske hendelser | BLOCKED | Byggeri 1888, innflytting 1891 og bevaring 1987 har tidsankere; særskilt hendelsesmedlem krever egen audit |
| Stories | BEGRUNNET N/A foreløpig | Ingen uavhengig narrativ utover beboerhistorikk/kronologi bekreftet |
| Før/etter | BLOCKED | Behov for stedstro historisk bildepar før det kan godkjennes |
| Nyheter | BEGRUNNET N/A foreløpig | Ikke konstruer samtidige hendelser fra tidligere museumsarrangementer |
| Lesespor | BLOCKED | «Ulvehiet» (1919) er et dokumentert stedstilknyttet lesekandidat; direkte lesbar, rettighetsmessig forsvarlig tekst må verifiseres |
| Kilder / Fagverk-lenker | PASS, UI-QA kreves | Navngitte kildehenvisninger i Place-data |
| Browser, plassering av Rundingene, bilder og mobil | PENDING | Full visuell slutt-QA og image preview på eksakt PR-head kreves |

**Sluttstatus: IKKE SLUTTFØRT.** Bilder, språk, Fagverk, kronologi og QuizCard er nå teknisk materialisert. People-, Object- og Brand-kandidater, Før/etter, lesespor og faktisk visuell Playwright-QA er fortsatt åpne porter. Dette er en bevisst delvis produksjon; `production_status=complete` må ikke settes før de reelle manglene er avklart.
