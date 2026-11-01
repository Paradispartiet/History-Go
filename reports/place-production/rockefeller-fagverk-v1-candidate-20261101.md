# Rockefeller – Fagverk for v1-kandidat (1. november 2026)

Sted-ID: `rockefeller`. Kanonisk kategori: musikk. Arbeidet viderefører den historiske rettelsen i PR #6877 uten å endre Story-ID, koordinater, fotografier eller People.

## Fullført i denne PR-en

- En egen `history_go_place_fagverk_v2` med tre stedshistoriske avsnitt, tre kildebaserte undersøkelser, dokumenterte observasjoner og tydelige kildegrenser.
- To verifiserte musikkapitler med to faktiske musikkemner, uten døde referanser.
- `konsertsteder` som eksisterende undermerke; ny registrering i `data/fagverk/fagverk_registry.json`.
- Synkronisering av `data/runtime/place-open/rockefeller.json`, uten endring av annet innhold.
- Målrettet test for Fagverk-kontrakt, kildelenker, 30 fullquizspørsmål, 10 QuizCard-spørsmål og gammel Story-ID.

## Kildegrunnlag

- [Oslo byleksikon: Torggata bad](https://oslobyleksikon.no/side/Torggata_bad)
- [Oslo byleksikon: Rockefeller](https://oslobyleksikon.no/side/Rockefeller)
- [Rockefeller: Om oss](https://www.rockefeller.no/om-oss)
- [Rockefeller: Booking](https://www.rockefeller.no/booking-utleie-rockefeller)
- [Rockefeller: 40 år](https://www.rockefeller.no/rockefeller-40/rockefeller-40-aar)
- [Norske Kulturarrangører: Møt et medlem – Rockefeller](https://www.arrangor.no/nyhetsarkiv/2026/moet-et-medlem-rockefeller/)

## Resterende v1-porter

1. Fullquizkvalitet: quizens spørsmål 6, 28 og 30 inneholder abstrakt analyse-/internt `place-fil`-språk. Kapasitetsfasit i spørsmål 4 (`1 350` fra Oslo World) er i konflikt med arrangørens nåværende oppgitte kapasitet (`1300`). Spørsmålene må revideres med bevart quiz-/Knowledge-/QuizCard-paritet. Øvrige 30/10 spørsmål er bevart i denne PR-en, ikke kvalitetsgodkjent på nytt.
2. App/browsertest: åpne `fagverk-sted.html?place=rockefeller` og PlaceCard på mobil/desktop; kontroller reell framvisning av Fagverk, foto, QuizCard, fullquiz og People. Datatester alene er ikke v1.
3. Motiv og People: foto av en konsert ved Rockefeller er stedlig relevant, men ingen fasadeoversikt. Kontroller at motivet fungerer i de tre konkrete bildefeltene. Eksisterende People Mari Boine, Joachim Nielsen og Morten Harket er bevart; deres konkrete scenetilknytning bør kildekontrolleres. Aktuelle historiske kandidater for senere identitets-/bilderreview: Hans A. Lier og åpningsartister (bl.a. Jonas Fjeld); ingen ny People-profil uten full dokumentasjon.
4. Publiseringsporter: regenerer og valider Fagverk-release ved endring i registeret. Kjør målrettet test og vanlig PR-CI. Ikke marker `v1` før runtime-/browserkrav er bekreftet.

**Formell status:** `v1_candidate` til samtlige porter er lukket. Ikke `vFerdig`.
