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
| Fagverk sted | PASS, kode-/UI-QA kreves | Place-eid kuratert standardartikkel, fire linser, fem spørsmål, to spor, Fire kilder, registry |
| Språkleksikon | PASS, runtime-QA kreves | Fire stedsspesifikke oppføringer og canonical språkmanifest |
| Kronologi/epoker | PASS, generator-/UI-QA kreves | 1888, 1891, 1919, perioden 1981–83, 1987, 1990 |
| Quiz | PASS | PR #6159, ingen omproduksjon |
| Bilder (`image`, stående `frontImage`) | BLOCKED | CC BY 4.0-original identifisert. Lokal produksjon, dimensjonstest og bilde-QA gjenstår |
| QuizCard + flip | BLOCKED | 28 spørsmål er klare, men dedikert QuizCard og faktisk PlaceCard-flip må produseres og testes |
| PlaceCard-samlinger | BLOCKED | Ingen ferdige billedsikrede canonical medlemmer; `place_card_profile` skal ikke settes før disse er avklart |
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

**Sluttstatus: IKKE SLUTTFØRT.** Ingen modul markeres ferdig bare fordi registreringen består JSON- eller CI-validering. Rester skal lukkes før steds-PR-en merges som `SLUTTFØRT`.
