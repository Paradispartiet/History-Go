# Oslo Lesekiosker — litteraturkartlegging 2026-08-25

## Status

Denne mappen er **kartleggings- og intakegrunnlag**, ikke en snarvei rundt History GO sin stedsproduksjon.

Kartleggingen låser **21 nåværende Oslo-kandidater** til mål-kategorien `litteratur`. Kandidatene kommer fra den nåværende Lesekiosk-oversikten og er kontrollert 25. august 2026. Repo-preflight med søkeordet `Lesekiosk` fant ingen eksisterende canonical Lesekiosk-oppføringer.

Det opprettes **ingen halvferdige canonical Place-objekter** i denne leveransen. De bindende produksjonschecklistene krever at hvert nytt sted ferdigstilles sted for sted med identitetsport, kildeclaims, koordinatkontrakt, full tekst, quiz, fagverk, bilder, CI og manuell QA før det kan legges i canonical manifest.

Maskinlesbar fasit: `lesekiosker-oslo-litteratur-inventory.json`.

## Inklusjonsregel

Kildelisten for denne kartleggingen er:

- `https://lesekiosk.no/finn-en-kiosk/`
- de individuelle Lesekiosk-sidene og deres «åpne i kart»-lenker der de lot seg entydig knytte til riktig kiosk.

Bare Oslo-kiosker som står i den **nåværende Lesekiosk-listen** er med. Eldre oversikter over fredede telefonkiosker brukes som historisk kontroll, men får ikke overstyre dagens Lesekiosk-status.

## Kartlagte kandidater

| Nr. | Kandidat | Nåværende listelabel | Kartanker | Kategori |
| ---: | --- | --- | --- | --- |
| 11 | Gamle Telemuseet | Kjelsåsveien 141 | 59.9661015, 10.7833146 | Litteratur |
| 22 | Vigelandsparken | Vigelandsparken | 59.9262575, 10.7031905 | Litteratur |
| 79 | Inkognitogata | Inkognitogata | 59.9182108, 10.7226299 | Litteratur |
| 42 | Munkedamsveien | Munkedamsveien | 59.9122394, 10.7272333 | Litteratur |
| 10 | Bjerke | Refstadsvingen 1 | 59.9428406, 10.8140023 | Litteratur |
| 76 | Hjemmets kolonihager | Hjemmets kolonihager | 59.9410481, 10.7552854 | Litteratur |
| 13 | Fagerborg/Majorstua | Jacob Aalls gate 58 | 59.9318962, 10.7258071 | Litteratur |
| 74 | Huk | Huk Aveny 35 | 59.9045930, 10.6849079 | Litteratur |
| 56 | John Colletts plass | Vestgrensa 2 | 59.9411528, 10.7296172 | Litteratur |
| 51 | Kampen | Skedsmogata 20 | 59.9132515, 10.7822487 | Litteratur |
| 9 | Rådhuskaia | Akershusstranda 3 | 59.9095155, 10.7345678 | Litteratur |
| 70 | Sagene kirke | Sagene kirke | 59.9377174, 10.7528534 | Litteratur |
| 71 | Sagene kirke | Sagene kirke | 59.9377174, 10.7528534 | Litteratur |
| 0 | Sentralen | Sentralen | 59.9111250, 10.7403170 | Litteratur |
| 23 | Skøyen stasjon | Drammensveien 127 | 59.9218151, 10.6882814 | Litteratur |
| 1 | Solli plass | Sommerrogata 17 | 59.9150102, 10.7179623 | Litteratur |
| 50 | Bislett stadion | Bislett Stadion | 59.9250158, 10.7333583 | Litteratur |
| 78 | Olav Kyrres plass | Olav Kyrres plass | 59.9192766, 10.6945543 | Litteratur |
| 80 | Majorstukrysset | Kirkeveien 64 | 59.9292023, 10.7152563 | Litteratur |
| 8 | Rådhusgata 28 | Rådhusgata 28 | 59.9097098, 10.7404937 | Litteratur |
| 48 | Vålerenga kirke | Opplandgata 5 | 59.9073411, 10.7850058 | Litteratur |

## Avvik som må bevares til canonical produksjon

- **Sagene 70 og 71:** to separate nåværende kiosker. De beholdes med hver sin stabile kandidat-ID selv om den offisielle kartlenken bruker samme anker ved Sagene kirke.
- **Sagene 70:** den individuelle siden lot seg ikke knytte entydig uten risiko for å forveksle den med Bislett-siden. Kandidaten er derfor bekreftet fra nåværende hovedliste, men side-URL skal re-verifiseres i stedets egen produksjonsrunde.
- **Skøyen:** dagens Lesekiosk-kilde bruker `Drammensveien 127`; eldre vernekilder har brukt `Drammensveien 157`. Dagens kilde styrer intake, mens konflikten skal løses på objektnivå før `coordStatus: verified`.
- **Bjerke:** dagens Lesekiosk-kilde bruker `Refstadsvingen 1`; eldre vernekilder har brukt `Refstadsvingen 2`. Samme regel gjelder.
- **Vålerenga:** dagens kartlenke peker på `Opplandsgata 5`, mens eldre vernekilder beskriver krysset Danmarksgata/Opplandsgata. Ikke konstruer et mer presist kioskpunkt uten ny kildekontroll.
- **Norsk Folkemuseum og Dyvekes bro:** finnes i eldre telefonkiosk-/Lesekiosk-materiale, men er ikke med i den nåværende Oslo-listen som brukes som fasit her. De aktiveres derfor ikke som nåværende bokkiosker på grunnlag av gammel dokumentasjon.

## Identitet og duplikater

En Lesekiosk er et **eget fysisk objekt**, selv når den står ved et allerede eksisterende History GO-sted som Bislett stadion, Vigelandsparken, Sagene kirke, Sentralen eller Vålerenga kirke. Nærhet er derfor ikke i seg selv en duplikatkonflikt.

Canonical identitet skal ved aktivering formuleres omtrent som: «Denne oppføringen representerer den røde, vernede telefonkiosken på [sted] i dens nåværende funksjon som Lesekiosk, ikke området, kirken, stadionet eller institusjonen ved siden av.»

## Bindende aktiveringsrekkefølge

Hver kandidat skal produseres **én om gangen** under de nyeste `PLACE_PRODUCTION_CHECKLIST`-dokumentene. Minimum før manifest-innføring:

1. identitet og kollisjon/duplikat-gate,
2. inspectable kilder og production packet v4.2 med claim–setningsparitet,
3. objektkorrekt koordinatbevis under Coordinate Source Contract v1,
4. full `desc`/`popupDesc`, quiz-readiness og øvrig obligatorisk stedsinnhold,
5. fungerende fagverk-side og PlaceCard-kontrakt,
6. bildebehandling uten å gjette lisens/identitet,
7. relevant CI + manuell QA,
8. først deretter canonical place-fil og manifest/synkronisering.

Mål-kategorien er bindende: **`litteratur` for alle 21.**
