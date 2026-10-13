# Det Norske Teatret – C9 avsluttande scenehistorisk kildepass

Dato: 13. oktober 2026. Den siste C9-runden gjeld **28** av dei opphavlege **87** personkoplingane og er utført i éin samla arbeidsgren.

## C9-kategoriar

- **12** eksisterande DNT-/Edderkoppen-profilar med fullstendig ny konkret `popupDesc`, eigne claims-dokument og historiske FOREST-/SNL-kjelder: Harald Sæverud, Ragnhild Hald, Gudrun Waadeland, Sverre Solberg, Monna Tandberg, Tordis Maurstad, Bjarne Andersen, Elsa Lystad, Rolf Just Nilsen, Merete Skavlan, Ola B. Johannessen og Jon Eikemo.
- **12** profiler med primærforankring i Nationaltheatret, men eigen kopling til Det Norske Teatret, får dokumentert DNT-kjelderelasjon og eige `dnt-claims`-dokument: Tore Segelcke, Agnes Mowinckel, Alfred Maurstad, Anne Marit Jacobsen, Nils Ole Oftebro, Lise Fjeldstad, Arild Brinchmann, Ole-Jørgen Nilsen, Anneke von der Lippe, Jan Grønli, Anne Marie Ottersen og Per Sunderland. For fem med generisk ankerprosa er popupen omskriven med konkrete roller. Lengre, verdifulle eksisterande biografiar er bevart i dei andre profilane.
- **4** Nationaltheatret-profilar var allereie `ready_people_v1` og har gyldig, eksplisitt claim-mapping for `places[det_norske_teatret]`: Carl Fredrik Engelstad (dramatisering av Den fjerde nattevakt, 1956), Andrea Bræin Hovig (1998–2002), Bjørn Skagestad (1969–1987) og Bab Christensen (1970–1999). Desse blir **ikkje** omskrivne eller nedgraderte.

C1–C8 omfatta 59 dedikerte DNT-kildepass. C9 gjev 24 nye og fire allereie separate, verifiserte DNT-kjeldekoplingar. Dermed er **87/87** personkoplingar dekte av gjennomgått historisk DNT-relasjon i dette arbeidsløpet. Dette er ikkje 87 ferdige portrettkort, ikkje 87 godkjende fulle People-v1-profilar og ikkje fullført Place.

## Kildekritiske avklaringar

- FORESTs primærregistrering daterer **Peer Gynt** med Harald Sæveruds musikk til **2. mars 1948**, på Hovudscenen i **Stortingsgata 16**, med Sæverud som orkesterleiar. SNL omtalar òg datoen 2. mai 1948. C9 følgjer den produksjonsspesifikke arkivregistreringa i `popupDesc`, men dokumenterer datoforskjellen og gjer ikkje produksjonen til ei førestilling i bygget frå 1985.
- Ragnhild Hald var både Mor Åse og regiassistent i den same oppsetjinga. Stjerne i FORESTs rollelister betyr alternering/overtaking, ikkje eineutøvar, mellom anna for Monna Tandberg, Rolf Just Nilsen og Jon Eikemo.
- Lise Fjeldstad og Ola B. Johannessen har både skodespelar- og regioppgåver. Merete Skavlans oppføringar gjeld regi, ikkje dokumenterte skodespelarroller.
- Anne Marie Ottersens DNT-relasjon er forankra i **Klaar.... en... to.... kjøøøør!!** 28. november 1989, med rolla Liv, og må ikkje forvekslast med Nationaltheatrets samtidige repertoire.
- Det eldre 1920-talsvirket til Tore Segelcke, Agnes Mowinckel og Alfred Maurstad er knytt til institusjonens tidlegare scener, ikkje huset i Kristian IVs gate.
- Dei 12 delte litteratur-/Nationaltheatret-profilane har halde på eksisterande `id`, `year`, `desc`, `category`, `placeId`, `places`, `image` og `cardImage`. Claims gjelder den **separate DNT-relasjonen**. Dei blir ikkje heva til `ready_people_v1` på grunnlag av eit slikt avgrensa pass.

## Runtime og avgrensing

- People-runtime er regenerert med **eksakt byteparitet før endringar** mot repos eksisterande stabile objektordning og 240 000 UTF-8-byte shardgrense. I alt **1 434 unike People-ID-ar** er bevart, utan nye identitetar eller endra rekkjefølgje.
- Avleidde place-open er synkroniserte for dei sju stadene som lastar desse 24 profilane: Det Norske Teatret, Edderkoppen, Nationaltheatret, Folketeateret, Centralteatret, Oslo Nye Teater Hovudscenen og NRK Marienlyst. Det Norske Teatret har framleis **87** personar, Nationaltheatret **122**.
- Ingen bilde, portrett, Forestillinger-/Objects-medlemmer, quiz, Civication-motor, historiske spelmekanikkar eller brukarstatus er endra.
- Fullprofilen si faktakontroll står `pending` der `profileStatus` er `needs_research`. Historiske ankerår og bildefelt får ikkje oppdikta verifikasjonsstatus.
- Den globale `people-popup-readiness`-rapporten vert ikkje nyskriven manuelt; han treng køyring av original generator mot komplett manifest og alle 779 manifestførte kildefiler. Dette skal gjerast samla framfor etter kvar person. Rapporten kan difor vere ute av synk etter C8/C9 inntil han er regenerert.
- Ein PR-CI-runde ved slutten av C9 skal verifisere parse, canonical claims, People-ID-paritet og plasspayloads. Ingen nettlesar-closeout vert kravd for denne reine kildepassen.

## Avsluttingsgrense for stadspakka

Personenes **DNT-tilknyting** har no eit dedikert historisk kildepass. Full `ready_people_v1`-status, lisensierte portrett, produksjonsbilete, Forestillinger, Objects, Brands, separat frontImage, quiz/QuizCard og endeleg visuell godkjenning står framleis att.
