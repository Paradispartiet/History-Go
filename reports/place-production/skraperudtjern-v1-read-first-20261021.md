# Skraperudtjern – stedshistorisk v1-kildepakke (21.10.2026)

## Korrekt sted og produksjonsavgrensning
Place-ID `skraperudtjern` i `data/places/natur/oslo/places_oslo_natur_ljanselva_rute/skraperudtjern.json`; OSM way 23761672. Geometrien, kategori, lokasjonsankeret, eksisterende naturprofil og underbadges er bevart. Dette er **tjernet mellom Rustadsaga og Skullerudstua**, ikke selve sagbruksbygningen eller Nøklevann. Kildene beskriver sagflis i nordenden, bekken fra Nøklevann og Ljanselva som avløp.

## Kildematrise
- Oslo byleksikon: https://oslobyleksikon.no/side/Skraperudtjern – identitet, plassnavnet, tilløp/avløp, sagflis, nordvestlig badeplass og 1983.
- Oslo Elveforum: https://www.osloelveforum.org/wp-content/uploads/2023/05/LJA-foss.pdf – saga, vannfall, privilegium fra 1688, overgang til dampkraft i 1914 og steinfundamenter.
- Østensjø historielag: https://www.ostensjo-hist.no/kultur.html og https://www.ostensjo-hist.no/rundt_vannet/RV-artikler-pdf/rv10_a3.html – middelaldergården Skraperud, Cudrios kjøp av engstykke fra Oslo Hospital i 1737 og sagbrukhistorie.
- Skiforeningen: https://www.skiforeningen.no/utimarka/omrader/ostmarka/steder/skraperudtjern/ – tjernets beliggenhet mellom Rustadsaga og Skullerudstua og friluftsliv.
- Østensjø lokalhistoriske bildebase: https://ostensjo-hist.no/omeka/items/show/58668 – **bare tekstmetadata** om foreningshytte fra 1982. Bildet deres kan ikke gjenbrukes uten tillatelse, så det brukes ikke.
- Commons Kjetil Ree: https://commons.wikimedia.org/wiki/File:Skraperudtjern.jpg (Skraperudtjern 2008, CC BY-SA 3.0); https://commons.wikimedia.org/wiki/File:Rustadsaga,_Skullerud_skole_(10._mars_2018).jpg (luftfoto 2018 med islagt tjern, CC BY-SA 3.0), **foreløpige kildekandidater**.

## Produsert på grenen
- Ny norsk `desc` og `popupDesc` som forteller om den forsvunne gården, sagbruket, sagflislagene og overgangen til friluftsliv, uten generisk History Go-tekst.
- Kuratert `fagverk` på standardnivå med fire kildebaserte avsnitt, tre egne undersøkelsesspor, fire spørsmål, seks begreper og to observerbare spor.
- 21 fullquiz-spørsmål fordelt på tre sett à sju, og ett QuizCard med ti identiske spørsmål/fasiter fra fullquizen. Begge manifestene registrert.

## V1-port – ennå ikke bestått
Før v1-merge gjenstår reell v4.2 beskrivelsespakke med nøyaktig setningsclaim-dekning, kanoniske Knowledge-ID-er, oppdaterte en/es/pt-oversettelser, to **lokalt lagrede** og lisensierte WebP-bilder, genererte Fagverk-/place-open-/epokeindekser og ekte browser-kontroll ved 390 og 1440 px inkl. flip, Fagverk og full quiz. **Ikke** rapporter at dette er ferdig, ikke godkjenn bilde på ekstern URL, og ikke merge før CI på nyeste PR-head er grønn.

Neste i produksjon skal velges først etter sluttføring av denne ene grenen.
