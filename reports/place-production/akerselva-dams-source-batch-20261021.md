# Brekkedammen og Nydalsdammen — historiske beskrivelser, 21. oktober 2026

## Leveranse og grense

To eksisterende natursteder får selvstendige historiske artikler, korte beskrivelser, v4.2-kildepakker og engelsk, spansk og portugisisk tekst. Brekkedammen har 11 verifiserte claims og Nydalsdammen 10. Hver pakke har ti direkte spørsmålskandidater med fasit og claimkobling; ingen nye quizer aktiveres.

Dette er en beskrivelses-/kildeleveranse med to dokumentarfoto, ikke full stedsproduksjon, v1, vFerdig eller en V3-statuspromotering. QuizCards, samlinger, koordinater, geometri, oppgaver og trening er utenfor endringen. Stående samleobjektbilder og full bildepakke er ikke produsert. Ingen fullført PlaceCard-opplevelse hevdes.

Canonical eiere:

- `data/places/natur/oslo/brekkedammen.json`
- `data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalsdammen.json`
- Tilsvarende ID-er i `data/places/production/` og `data/i18n/content/places/{en,es,pt}.json`.

## Preflight og kildegjennomgang

Gjeldende READ-FIRST-filer var lest i den foregående produksjonsrunden og sammenlignet med opprinnelig base (`1206b40b1cbb9fd2f828739d5d24838af57285b9`) og ny base (`42ad9b8d999bdc6b1c1953e59b854e6477f414f9`): ingen regelendringer. `data/badges/natur.json` ble i tillegg lest i sin helhet før denne innholdsplanen. Begge steder beholder hovedkategori `natur`. Underbadge-grunnlaget er dam/vassdrag, bading og friluftsliv; Nydalsdammens eksisterende underbadges beholdes. Ingen nye økologiske arts-, vannkvalitets- eller vernepåstander produseres fra badge-listen.

Kilder ble åpnet før claims og prosa ble skrevet. Hver claim angir kontrollert avsnitt og dato. Ingen annen stedsartikkel er brukt som semantisk mal.

| Sted / kilde | Inspisert del | Bruk og avgrensning |
| --- | --- | --- |
| [Oslo kommune: Brekkedammen ved Frysja](https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja/) | Innledning, fasiliteter | Identitet, badebruk og turvei. Markedsformuleringen om renest badevann gjentas ikke som stabil egenskap. |
| [Oslo kommune: Frysja 33](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/) | Om kultureiendommen, avsnitt 2–4 | Anker, rundt 1740, tørking av trelast, jernbane fra 1900, 90 ansatte i 1930-årene, nedleggelse 1965 og senere arealbruk. |
| [Norsk Teknisk Museum / Oslo Museum: Akerselva](https://explore.guidetogo.com/no/p/Norsk%2BTeknisk%2BMuseum/route/2232) | Stoppene Brekkesaga og Kvernsagn | Fløting via Maridalsvannet, kjerrat og litterær skildring. Kommunens og museenes lignende tekster regnes ikke som uavhengig dobbelbelegg for superlativer. |
| [Oslo byleksikon: Nydalsdammen](https://oslobyleksikon.no/side/Nydalsdammen) | Hele artikkelen | Vanninntak, Nygaards sag, bruk av vannkraft fra 1845, opprensing 1991 og plener/beplantning 1992. |
| [Nordberg Tåsen Ullevål historielag: Dalstuen og jordraset](https://ntu-historielag.no/for-og-na/dalstuen-og-jordraset-i-nydalen/) | Innledning, Industrien langs Akerselva utvider og Raset | Erik Hagfors' artikkel fra Før og nå 2017: eiendomsovergang, dam/fabrikk, fargeriarbeidere og raset 12. desember 1934. Antakelser om husets alder og tidlige beboere utelates. |
| [Oslo kommune: Nydalsdammen](https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/nydalsdammen/) | Sidetittel, Badevannskvalitet og temperatur | Kommunal badeplassoppføring, uttrykkelig fravær av kvalitets-/temperaturmåling og råd etter regn. Ingen fersk prøveverdi eller badegaranti oppgis. |

Brekkedammen omfatter den eksisterende vannflaten ved Frysja; den forveksles ikke med Oset-dammen eller Nydalsdammen. Nydalsdammen knyttes til det eksisterende vanninntaket i Nydalen. Alle geografifelt er bevart.

## Factuality og redaksjonell kontroll

Begge artiklene er gjennomgått i sin helhet mot kildeavsnittene. Setningsdekningen kobler hver beskrivelsessetning til registeret; SHA-256 binder registeret til publisert tekst. Ankers oppstart er fortsatt **rundt 1740**, og arbeidsstyrken gjelder **1930-årene**. «Kvernsagn» presenteres som litterær fortelling, ikke som datert stedshendelse. Ingen superlativ eller udokumentert årsaksforklaring er lagt til.

`nydalsdammen.year: 1860` er satt til null: kildene dokumenterer ikke dammens oppføring i dette året. 1845 er bruk av vannkraft ved stedet, ikke påstått byggeår. Dokumenterte stedshendelser i kildepakkene gir tidslinjespor for 1845, 1934, 1965, 1991 og 1992. Åpningen av Gjøvikbanen i 1900 er merket `institution_context` og blir ikke en hendelse ved dammen. Omtrentlig 1740 gis ikke eksakt tidslinjeår.

Artiklene har tre avsnitt hver, henholdsvis 159 og 167 ord. Den kortere lengden følger det dokumenterte, avgrensede stoffet. Tekstene har ulike forløp: Brekkedammen følger tømmerets vei og sagbruksarbeidet, mens Nydalsdammen følger vanninntaket, Dalstuen og parkopparbeidelsen. Ingen generell naturtekst er lagt inn for å fylle et ordmål.

Alle seks oversettelser følger hele den norske teksten og er gjennomgått for årstall, navn, avsnitt, usikkerhetsord og kommuneopplysningene. `_status: machine_translated` beholdes. Ingen ekstern morsmåls- eller fagfellevurdering hevdes.

## Dokumentarfoto etter bildeporten

Første PR-head bestod tekst- og tidslinjeportene, men CI krevde et stedsbilde også ved beskrivelsesendringer. Begge steder har derfor fått et fotografi med kilde-, fotograf-, dato- og lisensmetadata samt kilde-/lisenslenker:

- [Brekkedammen, Bjoertvedt, 5. oktober 2013](https://commons.wikimedia.org/wiki/File:Kjelsaas_Stilla_Brekkedammen.JPG), CC BY-SA 4.0. Original 6986 × 2574; Commons-størrelsesvariant på 1280 piksler brukes. Motivet er gjennomgått visuelt: vannflaten, breddene og tilgrensende bygning ved Brekkedammen. Kamerakoordinatene stemmer med vannflaten.
- [Nydalsdammen, Tore Sætre, 4. oktober 2015](https://commons.wikimedia.org/wiki/File:Nydalsdammen_foilage_Akersleva_(161215).jpg), CC BY-SA 4.0. Original 900 × 625, uten bearbeiding. Motivet er gjennomgått visuelt: vannflaten, parkbreddene og damanlegget i høstfarger. Kamerakoordinatene ligger ved dammens nedre del.

Lisenssidene er åpnet og lest, og originalfilene er lastet og visuelt kontrollert. Fotografiene er datert i bildetekstene. Ingen illustrasjon, ny beskjæring, fotomanipulasjon, portrettfil eller QuizCard genereres. Dette er en avgrenset bildereparasjon, ikke full bilde-/PlaceCard-closeout.

## Kjørbare kontroller

- Beskrivelsesvalidatoren er kjørt med `--all` og etter oppdatering mot ny main med `--changed --base origin/main --head HEAD`: 223 pakker, 212 ready, null blokkerende feil. Ordtall behandles som veiledning etter canonical policy.
- JSDOM med faktisk `js/i18n.js`: begge steder følger en → es → pt → nb; norsk original gjenopprettes, seks kildehash stemmer og alle andre oversettelsesoppføringer er uendret.
- Samme kontroll sammenligner kilde og place-open for begge steder og bekrefter uendret geometri, kategori og øvrige profiler. De fem stedshendelsene finnes i epokeindeksen, mens Gjøvikbanens institusjonsår utelates.
- Etter bildereparasjonen er begge bildepekere, krediteringsfelt og lisensfelter kontrollert i source og place-open; `node scripts/audit-place-images.mjs --mode=changed` består for de endrede stedene. Den bredere bildebacklogen er ikke del av leveransen.
- Den materialiserte bildeoversikten er synkronisert mot CI-auditens eksakte totaler: 153 lokale, 59 eksterne, 79 valgfrie Micro-bilder, 1234 manglende og 9 ugyldige stier. Endringen er to nye eksterne naturfoto og to færre manglende bilder; øvrig backlog beholdes.
- Place-indeksen er bygget fra kildefilene med repoets TypeScript-builder; place-open og epokeindeks er generert med sine eierskript.
- Ved oppdatering mot ny `main` ble Smalvolls nylig publiserte beskrivelse/bilde også synkronisert til place-indeksen av generatoren. Smalvolls kildefil og innhold er ikke endret i denne bolken.
- `node scripts/build-place-open-payloads.mjs --check` og `node scripts/build-epoke-place-index.mjs --check`: synkronisert.
- `node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs`: 39 bestått. Den eksisterende dekningstestens faste forventning er oppdatert fra 264 til 265 daterte Oslo-steder, og fra 321 til 320 ventende. Brekkedammen er det nye stedet; Nydalsdammen hadde allerede et Story-spor.
- `git diff --check`: bestått.

PR-CI og eventuell main-integrity vurderes på faktisk GitHub-head. Ingen runtimekode eller quizfasit er endret, og ingen bred nettleserregresjon hevdes.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens / grense |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | 21 claims kontrollert mot seks åpnete kilder; eksakte avsnitt, setningsdekning og tidsavgrensning. |
| Dekning og ferdigstillelse | 5/5 | Begge beskrivelser, to pakker, 20 kandidater, seks språkvarianter, to dokumentarfoto og genererte flater kontrollert. Full bildepakke og aktive quizer er utenfor leveransen. |
| Faglig/redaksjonell kvalitet | 4/5 | Selvstendige, konkrete forløp; alle norske tekster og oversettelser gjennomgått. Ingen ekstern morsmåls- eller fagfellevurdering. |
| Teknisk integritet | 4/5 | Kjørbar språkflyt, hash-/runtimeparitet, generatorchecks og 39 epoketester. Ingen full PlaceCard-UI-godkjenning hevdes. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen badevannsgaranti; kommunens manglende målinger oppgis, udokumentert år fjernes og omtrentlige år beholdes. Fotokilder og fri lisens er kontrollert og registrert. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical eiere, stabile claim-ID-er, kildeavsnitt, hashes og generatorer; ingen ny parallell struktur eller runtimekode. |

**28/30**, alle dimensjoner minst 4/5. Ingen kjente blokkere innen beskrivelses-/kildescopet etter lokal kontroll. Full stedsproduksjon er ikke sluttført av denne vurderingen.
