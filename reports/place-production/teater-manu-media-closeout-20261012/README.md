# Teater Manu: bilder, Forestillinger og visuell kontroll

Det gjenstående medie-/samlingsløpet er ferdig. Mira Zuckermann har en transparent, kontrollert redaksjonell illustrasjon. Forestillinger inneholder to dokumenterte hjemmeoppføringer: Pinocchio (2009) og Jack og bønnestengelen (2012). Begge har egne verkillustrasjoner og synlig tekst som skiller illustrasjon fra produksjonsfoto. Dette er et kuratert utvalg, ikke et komplett repertoararkiv.

Place.image bruker det eksisterende sceneinngangsfotoet som lokal, uendret fil. En annen Commons-original viser Grünerløkkas hus og brukes som separat stående frontImage. Fotograf, lisens, dato, originaldimensjoner og avgrensning mellom pubfasade og teaterinngang er registrert. Scenekunst-merket peker nå til det eksisterende SVG-merket, fremfor en PNG-fil som ikke finnes.

## Medier og grenser

- Mira: History Go / OpenAI imagegen, innebygd imagegen-verktøy; nytegnet gouache-/blekkpreget byste, mørke briller, sølvhvitt hår, svart overdel, transparent bakgrunn. Navngitt identitetsreferanse: Teater Manus Mira-side, første foto kreditert Belinda Stoe. Referansefotografiet publiseres ikke. Komposisjon og alfakanal er bevart ved formatnormalisering til WebP.
- Jack: samme innebygde imagegen-verktøy; redaksjonell eventyrillustrasjon av en grønn bønnestengel fra jord og bønner opp mot skyer. Ingen utøvere, scenografi eller påstått produksjonsrekonstruksjon. Komposisjonen er bevart ved formatnormalisering til WebP.
- Pinocchio: Enrico Mazzantis bokillustrasjon fra 1892, dokumentert Public domain-scan fra Commons, brukt uendret. Illustrasjonen viser bokmotivet; den dokumenterer ikke Hagerup-/Zuckermann-produksjonens utseende.
- Front og sceneinngang: Mortesle / Wikimedia Commons, CC BY-SA 3.0, fotografert 1. august 2011. Separate originalfiler, ingen kopiering av image til frontImage.

Den spesifikke `docs/PEOPLE_IMAGES.md` tillater kontrollerte, tydelig merkede redaksjonelle illustrasjoner. Mira vises som «Illustrasjon» i People-listen og personpopupen. Institusjonens og Scenewebs foto-kandidater har fortsatt uavklarte gjenbruksrettigheter og er ikke publisert. Hjelp (1999) og Fritz Moen (2011) behandles ikke som dokumenterte oppføringer ved dagens hjemmescene. Manu – et sant eventyr (2011) beholdes som en kandidat utenfor dette utvalget.

## Kontroll og reproduksjon

`reports/visual-qa/teater-manu/20261012/browser-audit.mjs` kjører den faktiske appen gjennom router, People-listen, personpopupen, begge forestillinger, bildekoding, QuizCard-flip, forstørret quizkort og scrolling. Chromium 149 og Playwright WebKit 2311 består ved 320, 390, 768 og 1440 piksler. Alle nye medier er inspisert, og skjermbilder av begge nettleserne er gjennomgått manuelt. Forestillinger-flisen fikk en avgrenset CSS-retting: hele bokmotivet vises, og tittel/antall har et mørkt tekstfelt.

Eksterne MapLibre-/Supabase-scripts ble hentet som originale bytes og levert via en lokal CDN-cache fordi nettlesernes direkte nettverk feilet. Ingen appdata, loader, samling eller quiz ble erstattet med testdata. Kartfliser og native iPad er ikke godkjent av denne kontrollen. Router-kontrollen skjer etter app-ready. Globale eksisterende 404-er og nettverksfeil er beholdt i `browser-results.json`; ingen ufangede JavaScript-feil eller manglende Teater Manu-medier ble registrert. Den valgfrie, manglende `teater_manu_manifest.json` gir eksisterende fallback og er ikke et publisert medie.

Kontroller: 47 relevante Place/People/Epoke-tester; 9 popup-/samlingskontrakttester; People image-test; 20 factuality-tester; People claims-audit (110 filer); editorial image-audit (20 illustrasjoner, 0 metadata-/filfeil); READ-FIRST; places-index/koordinatparitet; 1534 place-open-payloads; Civication historyPeople; quiz-kontekst; Fagverk-release; Knowledge (0 error questions). Både `build:web:check` og `git diff --check` består.

Den gamle popup-kontrakttesten feilet også på uendret main: den krevde en pensjonert 820px-overlay. Testen kontrollerer nå den eksisterende aktive rammen og klaring til header/footer; popupens implementasjon er ikke endret. Automatisk readiness-rapport var allerede foreldet på main (1430 mot 1434 canonical People) og er regenerert. Det er ingen endring av andre canonical People-profiler. Attribusjonsbyggeren henter dessuten Martin Tranmæls allerede eksisterende lisens-URL fra canonical fil til den foreldede genererte oversikten. People-all-shardgrensen flytter én uendret person mellom del 006 og 007; bare Mira får innholdsendring.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens |
|---|---:|---|
| Korrekthet og evidens | 5 | Dato/spillested og billedtype er kildebundet; fotoreferanse og publisert illustrasjon skilles. |
| Dekning og ferdigstillelse | 4 | Mira, separat frontImage, to kuraterte hjemmeforestillinger og alle aktuelle UI-flater er ferdige; utvalget påstår ikke fullstendig repertoar. |
| Faglig/redaksjonell kvalitet | 4 | Konkrete produksjonsroller, stedstilknytning og synlig illustrasjonsmerking; motivbilder er begrenset som dokumentasjon. |
| Teknisk integritet | 4 | Relevante tester, åtte nettleserprofiler og deterministiske registre består; eksternt kartnettverk er utenfor godkjenningen. |
| Sikkerhet og ansvarlighet | 5 | Uavklarte foto publiseres ikke; kontrollert identitet, lisens, kilde og merking følger hvert publisert medium. |
| Vedlikeholdbarhet og etterprøvbarhet | 5 | Canonical eiere, arbeidskort, kildebank, metadata, filhashes, QA-script og skjermbilder følger endringen. |

**27/30.** Det avgrensede medie-/samlingsløpet består kvalitetsporten. Tidligere intake-rapport beskriver tilstanden før dette løpet og erstattes som gjeldende status av denne rapporten.
