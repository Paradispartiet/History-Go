# Gamle Aker kirke — v1-oppgradering (21.10.2026)

## Gjenbruk, ikke ny stedskatalog
- Kanonisk sted: `gamle_aker_kirke`, kategori Historie, koordinat og Fagverk bevart.
- Eksisterende historisk fase 11-gate og 21 fullquizspørsmål videreføres.
- Fullquiz: 3 sett à 7 spørsmål, med kilde-/claim-/Knowledge-koblinger. Ingen spørsmål fjernet eller nye tvilsomme byggetider innført.
- Eldre QuizCard i `data/quizcards/historie/topp10_historie_sted_kort_batch1.json` var allerede manifestlastet, men hadde flere generiske produksjons- og metaspørsmål. Ti spørsmål er nå hentet fra eksisterende kildebelagt fullquiz, med identisk spørsmål, fasit, forklaring, kilde-URL og claim-ID. Ingen dobbelt QuizCard.
- Oppdatert hovedfortelling fremhever kalksteinsfossiler, Midgardsormen, den usikre byggedateringen og beslutningene som hindret riving i 1852. Nye kildepåstander er bundet til Den norske kirkes egen stedsinformasjon og v4.2 setningsdekning og SHA256; place-open er synkronisert.

## Bildekontroll
- Bevarer eksisterende, stedsspesifikke fotofiler `bilder/places/auto/gamle_aker_kirke__sorsiden.jpg` og `bilder/places/auto/gamle_aker_kirke__sorsiden_card.jpg`; canonical proveniens er Mahlum/Wikimedia Commons, public domain.
- Før/etter-fotoet (Ole Tobias Olsen/Oslo Museum, CC BY-SA 4.0) beholdes med egen kreditering.
- Bildene er eksisterende lokale filer med dokumentert lisens og ble tidligere kontrollert i fase 11. Dette er ikke et nytt fotografi eller en påstand om at 2008-fotoet viser rehabiliteringen i 2024.
- Eget stående `frontImage`-bilde mangler i canonical plassering. Hvis aktuell PlaceCard fortsatt krever dette i v1, er formell v1-closeout blokkert til et ekte stående, rettighetsklarert bilde er lagt inn og visuelt kontrollert.

## Permanent kvalitetssikring
- `tests/gamle-aker-v1-quizcard.test.mjs`: 21 Knowledge-linkede spørsmål, kildeparitet for 10 av dem, unik manifest-kobling, korrekt fasit, gyldige bildepaths og usikker datering.
- `tests/gamle-aker-v1-real-browser.mjs`: ekte History Go-app i 390 og 1440 px, lokal fotodekoding, QuizCard-flipp etter animasjon, quiz-navigasjon og Fagverk.
- `.github/workflows/gamle-aker-v1-browser.yml`: kjører begge testene og full 21/21-quiz på mobil og desktop, med skjermbildebevis.
- GitHub CI-status og eventuelle rendering-feil skal inn her etter faktisk kjøring. Inntil da: **v1-kandidat, ikke sluttgodkjent**.

## Kilder
- https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/sthans/forsideoppslag/gamle-aker/
- https://snl.no/Gamle_Aker_kirke
- https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/
- https://oslobyleksikon.no/side/Gamle_Aker_kirke
