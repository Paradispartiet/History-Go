# Oslo sentrum spor A – Kvadraturen, neste seksstedsbolk (23. oktober 2026)

**Status: kilder og eksisterende katalog kartlagt; ingen av stedene er v1-godkjent gjennom dette dokumentet.**
Dette er denne ChatGPT-kontoens selvstendige Oslo sentrum-spor. **Oslo-bolk 04 / PR #6553 og den andre kontoens aktive Oslo-bolk / PR #6563 og Linderud / #6567 er uttrykkelig utenfor omfang.** Ingen av de nevnte PR-ene eller deres stedsfiler skal redigeres her.

## Prioriterte eksisterende canonical Places

Kontroll mot `main` 23.10.2026: alle seks finnes allerede med fysisk koordinat, `desc` og `popupDesc`, men ingen har canonical `fagverk`, `image`, `frontImage` eller `cardImage` registrert. Dette er **mangler i stedsfeltene**, ikke en påstand om at lisensierte bildefiler ikke finnes et annet sted i repositoriet. Alle har derfor v1-restarbeid.

| Prioritet | Place ID | Gateadresse | Canonical Place-fil | Historisk læringsjobb |
| --- | --- | --- | --- | --- |
| 1 | `den_gamle_krigsskolen` | Tollbugata 10 | `data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/den_gamle_krigsskolen.json` | Bypalé, militær utdanning, 1802 og tidlig Christiania |
| 2 | `garmanngarden` | Rådhusgata 7 | `data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/garmanngarden.json` | Kjøpmannsby, handel og senere rådhusfunksjon |
| 3 | `stattholdergarden` | Rådhusgata 11 | `data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/stattholdergarden.json` | Stattholderembete, dansk-norsk styring og byhus |
| 4 | `hotel_du_nord` | Dronningens gate 13 | `data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/hotel_du_nord.json` | Hotell, havneby og gjenbruk av eldre bygningsdeler |
| 5 | `cafe_engebret` | Bankplassen 1 | `data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/cafe_engebret.json` | Teatermiljø, politiske nettverk og offentlig møtekultur |
| 6 | `treschowgarden` | Fred Olsens gate 2 | `data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/treschowgarden.json` | Barokk, kjøpmannsvirksomhet og moderne rederihistorie |

### Kontrollert katalogstatus (ingen endring)
- `den_gamle_krigsskolen`: `desc` 310 tegn; `popupDesc` 2198 tegn.
- `garmanngarden`: `desc` 364 tegn; `popupDesc` 2144 tegn.
- `stattholdergarden`: `desc` 334 tegn; `popupDesc` 2141 tegn.
- `hotel_du_nord`: `desc` 127 tegn; `popupDesc` 691 tegn.
- `cafe_engebret`: `desc` 116 tegn; `popupDesc` 710 tegn.
- `treschowgarden`: `desc` 114 tegn; `popupDesc` 561 tegn.

Tekstlengde er kun inventar, ikke kvalitetsgodkjenning. Særlig de tre siste krever redaksjonell tekstvurdering. Nye/endrede tekster skal følge canonical §9A og gyldig 4.2-pakke, ikke oppdateres uten claim–setning–hash-paritet.

## Kildegrunnlag for første redaksjonelle kontroll
- Oslo kommunes områdeguide: https://www.oppdagkvadraturen.no/stoppesteder – omtaler alle seks med adresser og historiske innganger.
- Gamle Krigsskolen: https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen og https://www.forsvarsbygg.no/no/verneplaner/landsverneplan-for-forsvaret/ostlandet/tollbodgaten-10/
- Garmanngården: https://www.oppdagkvadraturen.no/stoppesteder/radhusgata-7-barnas-kvadratur-1600-tallet
- Stattholdergården: https://www.oppdagkvadraturen.no/stoppesteder/stattholdergarden
- Café Engebret: https://www.oppdagkvadraturen.no/stoppesteder/bankplassen-1-cafe-engebret
- Hotel du Nord og Treschowgården: Oslo kommunes lenkede oppføringer på siden «Stoppesteder»; finn stedsspesifikke originalkilder før spørsmål blir godkjent.

Dette er **innledende kildespor**, ikke verifiserte source-ID-er for en ferdig quiz. Historiske påstander skal kontrolleres separat; fotokreditering og brukslisens kan ikke utledes fra at nettsiden viser et fotografi.

## Felles v1-produksjonsløp (én bolk, ikke én PR per sted)
1. Kjør full READ-FIRST, overlap-/identitets-/koordinatkontroll og regelpreflight per `place_id`. Bekreft at ingen nyere, parallelle PR-er har overtatt noen av de seks.
2. Revider eksisterende `desc` og `popupDesc` kun ved dokumentert historisk/faglig behov; ved endring opprett 4.2-kilde- og claim-pakke med korrekt teksthash og redaksjonell review.
3. Kvalitetssikre fysisk identifiserte, rettighetsklarerte historiske/nåværende fotografier. Lag separate `image`, stående `frontImage` og `cardImage` med målrettet komposisjon, kilde, lisens, fotograf og eksakte filkontrollsummer. Ikke gjenbruk nettfoto uten klarert lisens.
4. Kartlegg **faktisk eksisterende** fullquiz, QuizCard og quizmanifest for hver kandidat (ikke kontrollert av dette inntaket). Gjenbruk gyldig fullquiz; ellers produser kildebelagt profil med minst ti kvalitetskontrollerte QuizCard-valg og korrekt fasit-, Knowledge- og fullquiz-paritet.
5. Integrer én egen stedsspesifikk `history_go_place_fagverk_v2` per sted i canonical fil med kildebelegg, korrekt registry og release.
6. Regenerer runtime/place-open, quiz-kontekster, registre og Fagverk-release. Kjør app-/browserkontroll på smal mobil og desktop av PlaceCard, frontfoto, alle ti quizkort, fullquiz og stedsspesifikk Fagverk-side. Dokumenter feil og status før eventuell merge.
7. Behold `v1_candidate` til hele kvalitetsporten er oppfylt. Ikke sett `production_status: complete` eller `vFerdig` uten separat full V3-godkjenning.

### Bevisst utenfor scope
Ingen endringer i `main` fra denne rapporten, ingen canonical stedsfiler, quiz, QuizCard eller bildemetadata er oppdatert. Ingen av Oslo-bolk 04 sine 17 steder, Norges Bank på Bankplassen 4, Gamle rådhus, Stortorget eller den andre kontoens Linderud-/Ekeberg-/Frognerseteren-/Sarabråten-/Sæterhytten-/Kristiania Teglverk-løp skal overtas. Tilstandsrapporten alene er **ikke** produksjon og skal ikke merges som bevis på v1.
