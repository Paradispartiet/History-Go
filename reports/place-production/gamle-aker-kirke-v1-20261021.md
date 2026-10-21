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
- Eget fysisk stående `frontImage` finnes nå: `bilder/places/gamle_aker_kirke_front_portrait.webp`, **600 × 800 piksler**, laget som et beskjært WebP-raster fra den eksisterende lisensavklarte fotografien av Mahlum (10.02.2008, public domain). Bildet er ikke generert og er ikke en CSS-beskjæring.
- Reproduserbar generator: `scripts/build-gamle-aker-portrait.mjs`; bildeutsnitt, filhash og full proveniens er dokumentert i `reports/place-production/gamle-aker-kirke-v1-portrait-photo.json` og `frontImageMeta`. Originalbilde og historisk før/etter-foto er uendret.
- Den fysiske portrettfilen må nå bestå faktisk appvisning i 390 og 1440 px med korrekt `naturalWidth=600` og `naturalHeight=800` før v1-sluttporten lukkes.

## Permanent kvalitetssikring
- `tests/gamle-aker-v1-quizcard.test.mjs`: 21 Knowledge-linkede spørsmål, kildeparitet for 10 av dem, unik manifest-kobling, korrekt fasit, gyldige bildepaths og usikker datering.
- `tests/gamle-aker-v1-real-browser.mjs`: ekte History Go-app i 390 og 1440 px, lokal fotodekoding, QuizCard-flipp etter animasjon, quiz-navigasjon og Fagverk.
- `.github/workflows/gamle-aker-v1-browser.yml`: kjører begge testene og full 21/21-quiz på mobil og desktop, med skjermbildebevis.
- PR #6549 (fortelling, kildebelagt QuizCard og 21/21 fullquiz) er merget til `main`, merge SHA `4d7686514a8311777b752e1bd1a7fe6289f202b6`; 13/13 arbeidsflyter bestått.
- Bilderunden er en separat oppfølging som ikke endrer fullquiz, tekst, Fagverk, stedets identitet eller koordinater. Sluttvurdering av 600 × 800 portrettet: **faktisk browser-QA PASS** i History Go på 390 og 1440 px (GitHub Actions #39679504749); korrekt dekodet bilde, QuizCard-flipp, Fagverk og alle 21 fullquizspørsmål på begge skjermstørrelser. **Endelig merge krever grønn CI på siste dokumentasjons-/metadatacommit.**

## Kilder
- https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/sthans/forsideoppslag/gamle-aker/
- https://snl.no/Gamle_Aker_kirke
- https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/
- https://oslobyleksikon.no/side/Gamle_Aker_kirke
