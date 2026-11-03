# Minneparken – dokumentert fotokilde og historisk bruksavgrensning (2026-11-03)

**Status: etterprøvd lisenskandidat; filen skal ikke regnes som integrert uten lokal binary-/browserkontroll.**

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
