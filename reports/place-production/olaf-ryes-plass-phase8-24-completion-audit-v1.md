# Olaf Ryes plass — fullføring fase 8–24

Oppdatert: 2026-08-26

Olaf Ryes plass er gjort produksjonsklar som ett avgrenset park- og plassrom. Pakken bygger videre på den mergede fase 0–7-leveransen og endrer ikke koordinatene `[59.9231, 10.7589, 170]`.

PlaceCard bruker People, Objects, Brands og Related; Badge ligger separat og Quiz er obligatorisk. People er eksakt Olaf Rye og Eilert Sundt. Objects er Eilert Sundt-bysten og fontenen. Brands viser Parkteatrets kildebelagte venue-identitet ved Olaf Ryes plass 11 med logo hentet fra virksomhetens offisielle nettsted. Related peker til fire egne canonicale steder. Alle fire rundinger har bilde av et canonical medlem, og frontImage er en faktisk stående 900×1200-variant med dokumentert crop, kilde og lisens.

Quiz er rich 5×7 med 19 fakta-, 9 kontekst- og 7 konsept-/teorispørsmål. De første 14 er normale stedsspørsmål; metode og teori begynner i finalefasen. Place-open viser 3 Stories, 3 språkoppføringer, 3 lesespor, 2 daterte 2026-arrangementer og 3 trygge onsite-oppgaver. EN, ES og PT er synkronisert mot gjeldende kildehash.

Olaf Ryes død er satt til 1849 etter Store norske leksikon. 1903/2009-bildene brukes som kildebelagte tidslag, ikke som identisk optisk før/etter-par. Daterte arrangementer beskrives som planlagt bruk. Parkteatret forblir nabokontekst og eies ikke av parkflaten.

Produksjonspakken ble merget i PR #5342 og Pages-deployet fra `127e4058c84feebc172e546c1ef20fb9f15d07d3`. Live-QA avdekket at quizkort-runtime bare lastet litteraturmanifestet selv om Olaf-kortet allerede lå i By-katalogen. Den generelle katalogkoblingen ble rettet, testet og merget i PR #5346, med vellykket Pages-deploy fra `9f9acad849b23ffeda12148d1bd9c48a650a56c0`.

Den tidligere live-QA-en på 1363×936 bekreftet funksjonene, men avdekket ikke at Brands sto tom, at rundingene manglet medlemsbilder og at frontImage-kilden var liggende. Dette er rettet og merget i PR #5353 (`b9373e0bcc2b1c20e6c9f2cbdf66e2f98401403d`), med 18 av 18 CI-workflows grønne og vellykket Pages-run `32958019219`.

Første re-QA fant deretter en hydreringsrace: en senere full-place-respons kunne overskrive den canonicale place-open-payloaden, og Rundingene oppdaterte ikke People når payloaden var klar. PR #5357 rettet begge forhold, gikk grønt i 2 av 2 workflows og ble deployet fra `982348819218e7f19dcc5b4e6b6065b3face242d` i Pages-run `32959030440`.

Andre re-QA fant at kombinasjonen `force-cache` og stale-while-revalidate kunne holde tidligere besøkende på gammel place-open-JSON etter deploy. PR #5358 gjorde canonical place-open network-first med avgrenset 4,5-sekunders timeout og cache som offline-fallback, bumpet service worker-versjonen, gikk grønt i 2 av 2 workflows og ble deployet fra `ee19135ea46e40aac62009e5670f58dbecc5b4af` i Pages-run `32959957239`.

Endelig manuell live-QA på 1363×936 bekreftet frontImage `900×1200` og `height > width`. Alle fire Rundinger hadde status `member-image`: Olaf Rye `496×800`, Eilert Sundt-bysten `899×520`, Parkteatret `900×520` og Sofienbergparken `3992×2242`. Åpning av Rundingene viste eksakt to People, to Objects, én Brand og fire relaterte canonicale steder. Ingen applikasjonsfeil ble registrert; browser-extension-metadata og manglende WebGL i skybrowseren er miljøstøy uten betydning for stedskortet.

Fase 8–24 er dermed lukket som merget, deployet og live-verifisert. Den bindende produksjonschecklisten krever heretter faktisk medlemsbilde i alle fire Rundinger og en faktisk stående frontImage-kilde; ikon, navn og antall er bare tillatt som midlertidig loading-/error-fallback og blokkerer produksjonscloseout.
