# Minneparken – dokumentert fotokilde og historisk bruksavgrensning (2026-11-03)

**Status: dokumentert public-domain-foto fra 2007 integrert. Kilde, datomerkning, runtime-indeks, bildevisning og ikke-overlappende bildetekst er bekreftet i ekte Playwright på mobil og desktop. Dette verifiserer ikke parkens tilstand i 2026, så Historie-gate F forblir N/A.**

## Kontrollert kilde

- Verk: [Ruinparken1.JPG – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ruinparken1.JPG)
- Direkte original: https://upload.wikimedia.org/wikipedia/commons/8/82/Ruinparken1.JPG
- Fotograf og opphav: **Helge Høifødt**, egenproduksjon.
- Fotograferingsdato oppgitt på Commons: **15. juli 2007**.
- Wikimedia-kategori: `Minneparken, Oslo`; beskrivelsen sier «Ruinparken med ruiner av Hallvardskirken».
- Oppgitt filstørrelse/format: JPEG, **3 072 × 2 304 px**, **1,42 MB**.
- Lisens/oppgitt status: **Public domain / PD-self**, dedikert av opphavspersonen; ved rettslige reservasjoner har opphavspersonen gitt tillatelse til bruk for ethvert formål uten vilkår, med mindre loven krever noe annet. Kontrollert på Commons-filens **Summary** og **Licensing** 3. november 2026.
- Lisens-/krediteringskilde: https://commons.wikimedia.org/wiki/File:Ruinparken1.JPG#Licensing
- Kilden er en filside med fotografens publisering, **ikke** bare et upålitelig Google-bildesøk.

## Faglig og produktmessig avgrensning

Bildet er fra **2007**, og viser Minneparken **før** avdekkingene og apsiderekonstruksjonen i 2024. Det kan derfor kun brukes som et historisk dokumentasjonsfoto, aldri som umerket bildebevis for parkens tilstand i november 2026.

Korrekt bruk i PlaceCard krever både datert og synlig bildetekst:

> «Historisk fotografi av Minneparken 15. juli 2007, før avdekkingsarbeidene i 2024. Foto: Helge Høifødt (public domain, PD-self).»

`js/ui/place-card.js` støtter `imageMeta.historicalOnly: true` og `imageMeta.historicalCaption`, som viser bildeteksten i fotovisningen. Vurder eventuell egen datert bildetekst på minikortet dersom bildet også brukes som `frontImage` eller `cardImage`.

## Sjekkpunkter før bildesporet omtales som fullført

1. Last ned **originalt** bilde fra den oppgitte Commons-originaladressen. Bekreft JPEG-signatur, faktiske dimensjoner og lesbarhet; kontroller at lokal fil er versjonert i PR-grenen.
2. Bruk bare en lokal filsti som faktisk finnes, med kilde-/fotografkreditering og historisk bildetekst. Ikke endre validatorgrensene.
3. Test faktisk PlaceCard på mobil og desktop (bilde lastes, riktig tekst, ingen ødelagt bildeikon), og dokumenter skjermbilder og bildets opprinnelse.
4. Ikke sett Historie-gate F til `PASS`: historisk fotografi fra 2007 kan **ikke** bevise fysisk tilstand eller fullført tilrettelegging i 2026.
5. For full visuell ferdigstillelse gjenstår fortsatt separat kontroll av produktfoto, frontkort-format, historisk/nyere visuell dekning, responsiv beskjæring og eventuelle flere motiv.

**Merk:** Et generisk «HISTORY GO»-motiv eller en bildefeil i kortet er ikke et reelt fotografi. En offentlig domene-/fri lisens er nødvendig, men ikke alene tilstrekkelig for bildeporten.

## Verifisert integrasjon i PR (3. november 2026)

- [Actions #41589236323](https://github.com/Paradispartiet/History-Go/actions/runs/41589236323) bestod original-JPEG, 3 072 × 2 304 px, visuell proveniensmetadata og historisk datering, og committet **kun** `bilder/places/minneparken_gamlebyen_2007.jpg` (1 491 694 byte) og stedfilens `image`, `cardImage`, `imageMeta`, `imageCredit`, `imageLicense`, `imageSourceUrl`.
- [Actions #41590135371](https://github.com/Paradispartiet/History-Go/actions/runs/41590135371) kjørte den **offisielle** `places:index:build` og `places:index:check` med strikt bestått resultat; indeksen ble bygget over 1 538 steder. `tools/build_places_index.mts` og `tools/check_places_index_sync.mts` fører nå gjennom `imageMeta` som kanonisk lettfelt, slik at historisk datering kan vises av appen.
- Før synkronisering feilet den ekte browserkontrollen: kildefilen var korrekt, men appens runtime-indeks manglet `image` og `imageMeta`. Denne feilen ble reparert ved å endre **indeksflyten**, ikke ved å forbigå testene.
- **Visuell browserkontroll:** [Actions #41589585887](https://github.com/Paradispartiet/History-Go/actions/runs/41589585887), forsøk 2, bestod faktisk foto, caption, fullquiz og QuizCard på mobil og desktop. [Artefakt #13210245690](https://github.com/Paradispartiet/History-Go/actions/runs/41589585887/artifacts/13210245690) inneholder frontfoto, flipp/forstørrelse og quizskjermbilder. JSON-oppsummeringen viser `naturalWidth: 3072`, `hasFrontImage: true`, 0 browserfeil og nøyaktig datert historisk bildetekst i begge viewporter. Manuell skjermbildevurdering avdekket at bildeteksten lå for tett på `TAKE QUIZ`, selv om funksjonstesten bestod. CSS ble justert for desktop og mobil; en ny test krever minst 5 px faktisk geometriavstand mellom tekst og knapp. [Retest #41591420607](https://github.com/Paradispartiet/History-Go/actions/runs/41591420607) **bestod** alle kontroller på begge skjermstørrelser, inkludert den målte avstanden, faktisk fotolasting, kildeår, QuizCard-flipp og 21-spørsmåls fullquiz. [Endelige skjermbilder/QA-artefakt #13210506406](https://github.com/Paradispartiet/History-Go/actions/runs/41591420607/artifacts/13210506406). Manuell gjennomgang bekrefter at bildetekst og knapp er separert. Gate F forblir `N/A` uansett bildets tekniske status.

