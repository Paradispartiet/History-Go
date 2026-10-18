# Oslo – v1 bildevisning og QuizCards, kontroll 18. oktober 2026

## Omfang og dokumentert utfall

- **16 av 16** bildematerialiserte Oslo-steder bestod to faktiske Chromium-visningskontroller, ved **390 px** mobilbredde og **768 px** nettbrettbredde: **32 av 32 bestått**.
- Begge skjermbredder kjørte History Gos **ekte `index.html` og `js/app.js`**, med `window.openPlaceCard` på de kanoniske `data/runtime/place-open/<id>.json`-filene.
- Hvert steds bilde ble dekodet, riktig `frontImage` og `image` kontrollert, `imageComposition.portraitPosition` og `imageComposition.heroPosition` verifisert, og kortet snudd til en lesbar, data-renderet QuizCard-bakside.
- Egen innholdstest bekrefter nøyaktig **10 spørsmål og 10 svar per QuizCard** på alle 16 steder.
- **0 nye endelige v1-godkjenninger**, fordi det fortsatt mangler dokumentert fysisk mobil-/nettbrettkontroll og endelig redaksjonell utsnittsgodkjenning. Status forblir `v1_candidate`.

## Korrigert funksjonsfeil

PlaceCard-koden utelot manifestene for `natur`, `musikk` og `subkultur`, slik at eksisterende QuizCards ikke ble funnet ved snuing av kort. Disse manifestene er nå inkludert i `js/ui/place-card.js`. En for tidlig DataHub-opplasting caches heller ikke lenger permanent som en tom QuizCard-liste.

Første nettleserkjøring feilet fordi velkomstvinduet og en ennå ikke ferdig oppstart blokkerte de første PlaceCard-klikkene. Den endelige testen lukker velkomsten via appens egne kontroller, venter på `__HG_APP_READY__` og på den faktiske quizkort-renderingen før snuklikket. **Groruddammen bestod deretter på første testede kortåpning ved begge bredder**.

## Visuell evidens

- [Mobilvisning, 390 px](actual-placecard-390.jpg)
- [Nettbrettvisning, 768 px](actual-placecard-768.jpg)
- [Maskinlesbar kontroll med 32 sted-/bredderesultater](report.json)

Alle tre filene er bygget av faktisk appvisning i Chromium. Kontrollen er ikke gjennomført på fysisk iPhone eller Android.

## Utsnitt og redaksjonell kvalitet

Fokuspunkt og beskjæring er teknisk kontrollert, men en automatisert PASS-verdi er ikke en estetisk vurdering. Kontrollarket viser fortsatt enkelte forbedringsmuligheter før `v1`:

- **Groruddammen:** mye himmel i portrettutsnittet; finn gjerne et mer motivsterkt, lisensiert foto.
- **Alna ved Bryn:** murbygningen er relevant, men formidler elveløpet svakt.
- **Blå:** bygningens fasade er korrekt, men treverk skjuler deler av motivet. Bruk ikke tidligere forkastet drinkfoto.
- **Rockefeller:** bilde er dokumenterende, men kornete og høy-kontrast.
- **QuizCard i kompakt visning:** for lange titler og undertitler kan deler av teksten havne under nedre kant. Utvid-knappen viser fullstendig kort; dette bør inngå i siste visuelle designkontroll.

## Videre v1-port

Kontroller PlaceCard i faktisk mobilbrowser, bildekomposisjon, tittelplassering og QuizCard-utvidelse for alle 16. Endelig `v1`-status settes kun for beståtte steder. Ta vanskelige bildekilder separat; ikke blokker ferdige steder eller gjenta full katalogregresjon.
