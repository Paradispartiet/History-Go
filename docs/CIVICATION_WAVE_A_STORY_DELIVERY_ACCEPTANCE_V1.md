# Civication – innfasing av åtte historier: overgangskontrakt og akseptanse

**18. oktober 2026.** Dette er en produkt- og testkontrakt for C01, C02, C03, C05, C06, C07, C17 og C23. Den skiller **publisert baseline** fra en nyere, ennå ikke innlest produksjonsbolk. På `main` er `waveAChapterBindingsV1.json` og `waveASecondInstallmentsV1.json` grunnlaget for **74 scener / 148 valg**. Rapporten om **89 scener / 178 valg**, åtte inngangskontrakter, 73 tilpassede scener og visning i «Min dag» skal ikke betegnes som implementert, testet eller publisert på `main` før de konkrete runtime-filene og endringene kan leses fra en commit/PR.

## Sannhetskilder og eiergrenser

1. **Hendelser:** eksisterende `CivicationNarrativeSceneSource` / `SceneCatalog` velger kvalifiserte scener, og `CivicationDailyMailBuilder` plasserer dem i faktisk dag/fase. Gjenbruk fremfor en ny inngangs- eller hendelsesgenerator.
2. **Svar:** den kanoniske innboksen og `DayChoiceDirector` / eksisterende narrative state skriver svar, oppfølging og tidsstempler **bare etter vellykket svar**. Mislykket svar skal beholde meldingen åpen og la tilstanden være identisk med før forsøket.
3. **Tid:** `CivicationCalendar` eier spilldag og relativ oppfølging; jobbøkter eies av arbeidsdagløpet. Verklig dato, kapitteldag og arbeidsdag er ikke utbyttbare. Manglende historisk tidsstempel kan ikke utledes fra en gammel lagring.
4. **Min dag:** viser samme lagrede hendelser, avtaler og tidligere valg som innboksen; er en projeksjon, ikke en ny lagringseier. En handlingsknapp må bruke eksisterende svar-/pause-/avslutningsflyt og reflektere kanonisk resultat.
5. **Person og rolle:** privat historikk og relasjoner skal kunne følge spilleren på tvers av arbeidsgiver, arbeidssted og yrkesrolle. En arbeidsgivers oppgave eller en stillingsfullmakt følger **ikke** automatisk med. Ved retur må gammel historikk og åpne private oppfølginger beholdes uten retroaktive aktiviteter.
6. **Avtaleutfall:** `foreslått`, `avtalt`, `utført`, `avlyst`, `utløpt/ikke avklart` er forskjellige tilstander. Passert dato eller en ulest meldingskvittering beviser aldri oppmøte, levering, beslutning eller utført jobb.

## Åtte innganger – hva må faktisk være sant?

| Historie | Første kvalifiserende situasjon | Avslags-/gammel-lagring-regel | Ansvar og fortsettelse |
| --- | --- | --- | --- |
| C01 – Jobbtap og verdighet | Dokumentert aktuell jobb-/økonomisituasjon, ikke en generell antakelse om jobbtap | Ved aktiv jobb må jobbtapsvarianten ikke sendes; et ubekreftet besøk er fortsatt ubekreftet | Jonas velger eget svar, privat relasjon bevares |
| C02 – Muligheten uten garanti | Faktisk kontakt om musikkaktivitet | Uten bekreftet booking kan en frist passere uten konsert eller lønn | Mira velger selv om hun svarer arrangøren |
| C03 – Drømmen og regningene | Faktisk invitasjon til avgrenset prototypetest | Pause/avslag åpner ikke automatisk en ny prøve | Lea eier sitt prosjekt; ingen automatisk bedrift |
| C05 – Byråkratiet og personen | Konkrete dokumentasjonsbehov, med kjent status | Et utkast, sendt brev og mottatt kvittering må skilles | Verken kvittering eller samtale gir automatisk NAV-vedtak |
| C06 – Faglig integritet | Kvalifiserende plan-/arbeidsansvar og ufullstendig måling | Byttet jobb må ikke skape et ferdig vedlegg | Arbeidsgiver/politisk organ bestemmer selv |
| C07 – Tilhørighet mot frihet | Reell privat kontakt med Arvid, separat fra jobb | En vakt er ikke gjennomført bare fordi den er avtalt | Gjest, frivillig og avstand er distinkte valg; privat tråd følger jobbbytte |
| C17 – Å arbeide seg tom | Faktiske renholdsoppgaver og konkret tilkomstproblem | Verken statusmelding eller tidsforløp beviser ryddet lager | Leder og drift eier bemanning og tilkomst |
| C23 – Feilen som ikke forsvinner | Registrerte mottakere og en faktisk misforståelse | Ingen bekreftet forståelse uten svar fra aktuell mottaker | Separate mottakere, separate forståelsesbekreftelser |

Dette er akseptansekrav, ikke påstander om at alle inngangene er ferdig koblet i produksjon.

## Tverrgående gjennomspillingsport

Test de samme **fire kritiske overgangene** med den faktiske nye fortellingskilden, kalenderen, meldingskøen, den eksisterende innboksen og «Min dag», mot *samme* spillerlagring:

| Scenario | Handling | Bestått når |
| --- | --- | --- |
| Passert avtaletid | Avtal, gå videre i spillkalenderen uten å registrere utførelse, åpne på nytt | Avtalen står som utløpt/uavklart; ingen påstått deltakelse, gjennomført oppgave eller oppdiktet tilbakedatert valg |
| Jobb/arbeidssted endres | Begynn privat og jobbrelatert historie; bytt jobb/arbeidssted, last på nytt og gå tilbake | Privat relasjon og historikk består; jobbrelaterte fullmakter/oppgaver følger ikke automatisk; riktig oppfølging kvalifiserer |
| Svar to ganger | Lever ett gyldig valg, deretter send identisk eller motstridende valg-ID på nytt, også etter reload | Bare én besvart hendelse, arkivpost og effekt; ingen duplikatmail |
| Avvist svar | Prøv ugyldig eller avslått svar; deretter prøv gyldig svar | Intet valg, klokkeslett, penger, bekreftet møte eller NPC-beslutning skrives ved avvisning; meldingen forblir besvarbar |

I tillegg kontrolleres **pause/avslutning**, **køkvote**, **gammel lagring uten tidsstempler**, **fravær av aktiv jobb**, **to historier som kvalifiserer samtidig**, og at `Min dag` og innboksen viser identiske status- og historikkdata. Minst ett fullstendig forløp per C-historie må testes i den faktiske DOM-flaten; en ren runner-test er ikke en browser-akseptanse.

## Publisert regresjon og åpen grense

`tests/civication-wave-a-transition-safety.test.js` er en **avgrenset regresjon for eksisterende Life Story-baseline**. Den sjekker at fremtidig scene ikke kan besvares for tidlig, at ugyldig og gjentatt valg ikke muterer tilstanden, at rollebytter bevarer den lagrede rollens arkiv ved retur, og at en eldre avtale uten utførelsesbevis ikke fylles ut av `reconcileContent`. Den er ikke en gjennomspilling av nye situasjonsstyrte narrativstrømmer, og beviser ikke at private relasjoner kan leses mens spilleren er i *en annen* aktiv rolle.

Når den nye bolken med 89 scener er committed, føyes **én målrettet innboks/kalender/Min dag-integrasjonstest** til for alle åtte inngangene. Først når den passerer for 178 valg, sammen med ordinær PR-CI, kan den bolken merkes teknisk klar. Ikke regenerer hele katalogen eller kjør unrelated regresjon bare for denne porten.

### Kilde- og redaksjonsgrense

De tre inspirasjonssporene – kuratert Goodreads, IMDb og HG Film Producer – beholdes fra første bolks dokumenterte bindingsfiler. En sceneovergang validerer ikke nærlesning av bok/film, kanonisering av innhold eller litterær sluttgodkjenning. Ingen ny personbiografi, rettighetsfullmakt eller økonomisk handling skapes implisitt.

## Teknisk implementasjon i denne PR-en

- `js/Civication/lifestory/civicationWaveAInboxBridge.js` oppretter en *projeksjon* av den nåværende, faktisk kvalifiserte Life Story-scenen i den kanoniske Civication-innboksen. Hendelsen har stabil scene-/rolle-ID og sendes kun når runneren tilbyr scenen. Den er **ikke** en ny fortellingsmotor eller et alternativt kildearkiv.
- `CivicationMailEngine.answerMail` sender disse spesifikt merkede meldingene til `CivicationLifestoryUI.answerWaveAChoice`. Bare den eksisterende `LifestoryRunner.applyChoice` og `LifestoryState.save` oppdaterer spillerens fortelling. Et svar fra «Min dag» løser også innbokskopien; et svar fra innboksen dukker umiddelbart opp i den samme «Min dag»-historikken.
- `ChoiceDirector` får en avgrenset middleware for eldre direkte EventEngine-svarflater; den hindrer at ordinær EventEngine-poengberegning brukes som en ny valgeffekt på Life Story-valg.
- Ved jobb-/rollebytte eller pause arkiveres en foreløpig utilgjengelig Wave-A-melding uten å bli markert som besvart. Retur til **samme kvalifiserte scene** åpner den identiske ubesvarte meldingen. En eksplisitt avslutning bruker den etablerte `threadState`, ikke en ny statusdatabase.
- «Min dag» viser åtte C-spor samlet på tvers av aktuell rolle og inaktive rollesnapshots og merker tidligere rolle som historikk. Særlig avtalt tur, prøve og vakt vises som **uavklart gjennomføring** til et eksplisitt utfall finnes.
- `tests/civication-wave-a-inbox-integration.test.js` kontrollerer faktisk DOM, kanonisk innboks og valgrunner for C01/C06, avviste/doble svar, pause/retur samt kildebindningene til alle åtte. `tests/civication-wave-a-transition-safety.test.js` dekker overgangsreglene i Life Story.

**Gjenstående avgrensning:** Dette er en adapter for publiserte Life Story-scener (**74 / 148**), ikke en utgivelse av den nevnte upubliserte **89 / 178**-bolken. Privat historikk vises etter rollebytte og kan gjenopptas når scenen igjen er kvalifisert, men kontinuerlig levering av *alle* private kapitler mens spilleren er i en annen aktiv jobbrolle krever fortsatt en situasjonsstyrt sceneinstallasjon i den ordinære narrativkilden. Den er ikke implementert eller testet av denne adapteren. Likeledes er full browserakseptanse for hvert C-spor ikke dokumentert før reelle nettleserforløp er kjørt. Ikke merk hele integrasjonen som godkjent på grunnlag av bare denne PR-en.
