# Det Norske Teatret — People og samlingskandidater, kildekontroll C1

Dato: 13. oktober 2026. Kontrollgrunnlag: manifestløst snapshot `baseline.json`, hver av de 87 oppførte canonical People-kildefilene på `main` og navngitte primær-/sekundærkilder. Dette er **fil- og kildefelt-audit**, ikke full historisk faktagodkjenning av 87 biografier.

## Måleresultat før retting

- **87/87** People-oppføringer fra manifestets stedsutvalg inspisert i sin faktiske kildefil (inkludert enkeltobjekt-formatet for Jon Eikemo).
- **0/87** har utfylt `image`-felt i den eksisterende basislisten. Ikke fyll med generiske eller urettighetsavklarte portretter.
- **11/87** har ett eller flere eksplisitte `externalLinks` eller `source_urls` i People-kildefilen. **76/87** mangler begge kildefeltene ved kontrollstart. At en profil har lenker, er ikke bevis for at de dekker akkurat Det Norske Teatret-tilknytningen.
- **66/87** har gjenkjennelig intern begrunnelsesprosa etter maskinell søking etter blant annet «presist … anker», «profilanker», «kildeanker» og «Entryen»; enkelte andre formuleringer kan ha samme problem.
- Personens `year` og `placeId` alene er **ikke** verifikasjon av at vedkommende virket i dagens teaterhus. Flere årstall gjelder tiden før 1985.

## Rettet og kontrollert i denne avgrensede endringen

| Person | Tilknytning og dato | Kilde | Stedlig presisering |
|---|---|---|---|
| Arne Garborg | Pådriver for nynorsk teater, foredrag 1898, stiftelse 1912 | [SNL: Det Norske Teatret](https://snl.no/Det_Norske_Teatret), [SNL: Arne Garborg](https://snl.no/Arne_Garborg) | Institusjonstilknytning før dagens hus. |
| Hulda Garborg | Medstifter og første styreleder, åpningsprogrammet 1913 | [SNL: Hulda Garborg](https://snl.no/Hulda_Garborg), [teatrets draktartikkel](https://www.detnorsketeatret.no/bakgrunnsartiklar/fra-hulda-og-halldis-til-herborg) | Hun virket før 1985; hennes egen bunad er dokumentert utstilt i nåværende foajé. |
| Arne Lygre | Dramatiker, *Tid for glede*, faktisk premiere 29. januar 2022 | [Sceneweb, produksjon 122927](https://sceneweb.no/nb/production/122927/Tid_for%20glede) | Oppsetning i dagens hus; 22. januar var planlagt og utsatt. |
| Egil Monn-Iversen | Musikalsk ledelse, *Cats*, 9. november 1985 | [Sceneweb, produksjon 52871](https://sceneweb.no/nb/production/52871/Cats) | Dokumentert produksjon ved Hovudscenen i det nye huset. |
| Svein Tindberg | Elev 1972–1974, ansatt fra 1976; Romeo ved åpningen 19. september 1985 og rolle igjen 2023 | [SNL: Svein Tindberg](https://snl.no/Svein_Tindberg), [Sceneweb, produksjon 136295](https://sceneweb.no/nb/production/136295/Romeo_og%20Julie), [Sceneweb, artist 9464](https://sceneweb.no/nb/artist/9464/Svein_Tindberg) | Tidlig karriere ved institusjonens eldre scene, Romeo 1985 i dagens hus. |

Disse fem canonical profilene har nå naturlig biografisk popuptekst, oppgitte operative kildelenker og eksplisitt tids-/husavgrensning. `image` og `cardImage` beholdes tomme inntil portrettfilen er kontrollert. Andre People-profiler er **ikke** merket faktagodkjent, og ingen stedsrelasjon er fjernet uten kildekontroll.

## Kilde- og eierskapsavgrensning for Forestillinger

Tre konkrete forestillinger kan undersøkes som produksjonsmedlemmer for dette huset:

1. *Romeo og Julie*, åpningsforestillingen **19. september 1985**, er eksplisitt identifisert i [teatrets produksjonsarkiv FOREST](https://forest.detnorsketeatret.no/produksjon/romeo-og-julie-1985): **arkivnummer M732 F648 P629**, Hovudscenen, Pål Løkkeberg som regissør, Svein Tindberg som Romeo og Liv Bernhoft Osa som Julie. Arkivet oppgir også 31 forestillinger og siste spillekveld 19. oktober 1985. Dette er det riktige produksjonsobjektet for dagens hus; ikke den eldre versjonen fra 1975.
2. *Cats*, norgespremiere på Hovudscenen **9. november 1985**, produksjon **52871**. [Sceneweb](https://sceneweb.no/nb/production/52871/Cats).
3. *Tid for glede*, urpremiere **29. januar 2022**, produksjon **122927**. [Sceneweb](https://sceneweb.no/nb/production/122927/Tid_for%20glede).

**Kritisk kollisjonsfare:** *Romeo og Julie* fra **1975**, produksjon **40927**, tilhører hovedscenen i **Stortingsgata**. Den kan ikke tilordnes bygningen som åpnet i 1985. [Sceneweb 1975](https://sceneweb.no/nb/production/40927/Romeo_og%20Julie).

Hvert forestillingsmedlem krever senere dokumentert produksjonsidentitet og bilde med klarert gjenbruksrett før det vises i PlaceCard. Denne PR-en oppretter ikke illustrerte plassholdermedlemmer.

## Fysiske kostymer — Objects-kandidater, ikke publiserte gjenstander

- **Hulda Garborgs egen bunad:** Teatret skriver uttrykkelig at den er **utstilt i foajeen**. Det er en identifiserbar fysisk gjenstand med dagens stedstilknytning, men objekt-/fotorettigheter og nødvendig bildedokumentasjon er ikke godkjent for spillet. [Institusjonens artikkel](https://www.detnorsketeatret.no/bakgrunnsartiklar/fra-hulda-og-halldis-til-herborg).
- **Juleroser-kjolen:** Samme artikkel dokumenterer at Unni Walstad og teatrets kostymeavdeling bearbeidet eldre broderier og sydde ny kjole for Herborg Kråkevik. Det dokumenterer en sceneprodusert kostymegjenstand, **ikke** museumskatalog-ID, dagens bevaringsstatus eller bildelisens.
- **Sceneteppet:** Jan Groths *Strekkomposisjon i broderi* er allerede behandlet som eget kunstverk og fysisk spor i Fagverket. Det skal ikke automatisk dupliseres som et løsrevet Object.

Urelaterte eller rettighetsbegrensede DigitaltMuseum-funn gir ikke rett til å importere teaterkostymer til dette stedet. Status for Objects og Forestillinger forblir **BLOCKED** til identitet, korrekt stedseier og bildefiler består porten.

## Oppfølgingsporter

1. Fortsett redaksjonell/kildebasert kontroll av de øvrige 82 personkoblingene: faktisk institusjonsrolle, riktig tidsrom, produksjonskreditering, selvstendige kilder og naturlig tekst. Sett `externalLinks` bare når den konkrete påstanden kan belegges.
2. Hent et faktisk lisensiert personportrett per person. Tomme felt kan fortsatt ha initialfallback og er ikke lov til å fylles med generert gjenkjennelig portrett.
3. Lag Forestillinger-medlemmer først når datakontrakt, produksjons-ID, mediaproveniens og stedseier er verifisert; integrasjon og browser-test etterpå.
4. Klarer separat `frontImage`, Story-eierskap, quiz/QuizCard og slutt-QA i egne checkpoints.

## Valideringsgrense

Alle fem reviderte JSON-kildefiler er parsede og sjekket mot riktig ID før commit. Endringsscope er fem People-kildefiler, dette kontrollnotatet og maskinelt avledede runtime-data: berørte `people-all`-shards, `place-open`-payloadene for Det Norske Teatret og Chat Noir (delt personprofil), samt Civications avledede `historyPeople_index.json` fordi to korte `desc`-felt ble endret. Scenario People-generatorens kategori `musikk.json` er dessuten synkronisert med de nye beskrivelsene: fem automatiske sceneordtreff byttet sterke personforslag fra Svein Tindberg til Arne Lygre; antall sterke/kontekstuelle rollekoblinger er uendret. Dette er generatorens eksisterende tekstbaserte vurdering, ikke selvstendig faglig godkjenning av disse rolleforslagene. Chunk-grenser er beregnet med generatorens stabile sortering og 240 000 UTF-8-bytegrense. Full People-suite, eventuelle andre genererte beredskapsindekser, browserregresjon og PR-CI må fortsatt kontrolleres på siste eksakte commit; **ikke hevdet bestått her**. Det eksisterende `baseline.json` er et historisk snapshot og skal ikke omskrives til å gi inntrykk av at feilene aldri fantes.
