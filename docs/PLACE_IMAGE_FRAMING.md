# History Go – bildeutsnitt og korrekt zoom for steder

Gjelder alle eksisterende og nye stedsbilder, på mobil og desktop. Felles teknisk basis er
`css/place-image-framing.css`; selve bildeoriginalene vurderes redaksjonelt for hvert sted.

## Retningslinje

1. `place.image` er et lesbart **oversiktsbilde** av stedet og vises i den horisontale
   overskriften. Bruk en original som viser mest mulig av stedets arkitektur, omgivelser
   og relevante detaljer. Hovedmotivet skal ikke klippes for å fylle et bredt banner.
2. `place.frontImage` er et **stående stedsbilde** i PlaceCard. Hele
   kildefotografiet skal være synlig i den skarpe bildeflaten. Målet er god
   komposisjon, ikke maksimal zoom.
3. I CSS brukes `object-fit: contain` for begge bildene, også i den eldre
   stedspopupen. Ledig plass får en nøytral mørk bakgrunn.
4. Når en redaksjonell WebP-original produseres, bruk **ImageOps.contain**
   (eller en ekvivalent proporsjonal nedskalering) for det skarpe motivet,
   **ikke ImageOps.fit / automatisk sentrumscrop**. Eventuelt ledig plass i
   16:9- eller 3:4-rammen kan fylles med en diskret, uskarp bakgrunn fra samme
   kildefoto. Dette må ikke forveksles med å forstørre og beskjære selve motivet.
5. Ved opplasting lagres kilde, lisens, fotograf/kreditering, kildehash og
   utgangsdimensjoner. To bildeflater kan bruke separate originaler, men ikke
   kamuflere samme kildefotografi som to selvstendige bilder.
6. Ta vare på bildeoriginaler fra tidligere leveranser. Eksisterende,
   allerede hardt beskårne WebP-filer **må regenereres individuelt fra
   originalkilden** for å få tilbake de delene som faktisk ble beskåret.
   En CSS-endring kan forhindre ny beskjæring i visningen, men ikke
   rekonstruere manglende billedinnhold.
7. Ikke gjør tilsvarende endringer på QuizCard-kunst, Flora-bilder,
   People-portretter, merker eller Brands-logoer. De har egne
   beskjærings- og skaleringskontrakter.

## Aksept

Kontroller 320/390 px mobil, 900 px nettbrett og 1440 px desktop. Det skarpe
motivet skal være synlig helt ut til kildefotografiets kanter. Ingen
`object-fit:cover` eller ytterligere CSS-transform-zoom må klippe hovedmotiv.
Bevar PlaceCard-vending, trykkflater, stedsoverskrift og kategori-/epokevisning.

Global CSS-beskyttelse er én leveranse. Reproduksjon av historiske originaler
med for mye faktisk bildeskjæring er en **egen kildebasert bildegjennomgang**
sted for sted; den skal ikke feilaktig regnes som utført ved CSS-merge.
