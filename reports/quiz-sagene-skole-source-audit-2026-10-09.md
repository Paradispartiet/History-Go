# Sagene skole — kildegrunnlag for neste historiequiz

**Dato:** 9. oktober 2026  
**Mål-ID:** `sagene_skole`  
**Sted:** Biermanns gate 2, Oslo  
**Kategori:** `historie`  
**Status:** kilde- og eksisterende-quiz-audit; quizpakke ikke produsert.

## Eksisterende quiz

Kontrollert mot `data/quiz/manifest.json` på `35d08069d867975b3c3eb3448b674a185d6c8659`: ingen `sets[].targetId === "sagene_skole"`. Steds-ID og beskrivelsesgrunnlag er bekreftet i `data/places/manifest.json` og `data/places/historie/oslo/places_historie/sagene_skole.json`.

Dette fastslår fravær av **aktiv stedsspesifikk manifestkobling**. Det alene dokumenterer ikke at ingen uregistrerte spørsmål ligger i legacy- eller arkivfiler. Full quiz-audit må derfor inkludere disse før produksjonsprofil låses.

## Gjennomgåtte eksterne kilder

- **S1 – Sagene skole, «Skolens historie»:** https://sagene.osloskolen.no/om-skolen/om-oss/skolens-historie/  
  Offisiell institusjonshistorikk; primær kilde for skolens egen formidling av 1741/1861, industrimiljø, Sethne, krigstid, leirskole og inkluderingshistorie. Har enkelte nåtidsopplysninger som må kontrolleres mot dato.
- **S2 – Oslo byleksikon, «Sagene skole»:** https://oslobyleksikon.no/side/Sagene_skole  
  Historisk lokaloppslagsverk med detaljert bygnings-, skole- og krigshistorie. Skiller tydelig mellom allmueskolens opprinnelse og bygningene fra 1861/1922–26.
- **S3 – Norsk biografisk leksikon, «Anna Sethne»:** https://nbl.snl.no/Anna_Sethne  
  Faghistorisk biografi som beskriver Sethnes lærerrolle, faglige påvirkning, skoleforsøk og politiske/pedagogiske uenighet. Biografiens hovedtekst er eldre enn senere oppdateringer.
- **S4 – Sagene skole, «Vesle-Sagene leirskole»:** https://sagene.osloskolen.no/for-elever-og-foresatte/andre-tilbud-til-elevene/vesle-sagene-leirskole/  
  Institusjonens spesifikke historikk om leirskolen: innkjøp av bygninger i 1948 og åpning i 1951.

Alle fire nettsidene er åpnet og kontrollert 9. oktober 2026. Referanser til skolens egen formidling skal ikke blandes sammen med uavhengig primærkildebelegg.

## Kildebelagte kandidater til påstandsbank

| Nr. | Historisk påstand / konkret spor | Støtte | Foreslått læringsjobb |
| ---: | --- | --- | --- |
| 1 | Den første faste allmueskolen i Aker på Sagene ble opprettet i 1741. | S1, S2 | Grunnleggelse |
| 2 | Skoleordningen ble delt i Østre og Vestre Sagene i 1796. | S2 | Skoleorganisering |
| 3 | Byutvidelsen i 1859 endret hvilken kommune Sageneskolene lå innenfor. | S2 | Byhistorisk ramme |
| 4 | Jacob Wilhelm Nordans eldste nåværende skolebygg åpnet i 1861. | S1, S2 | Bygning og arkitekt |
| 5 | Bygningen fra 1861 ble forlenget og påbygd i 1880; Jacob Wilhelm og Victor Nordan oppgis som arkitekter. | S2 | Bygningsendring |
| 6 | Et nytt større skolebygg ble oppført mellom 1922 og 1926 som del av det voksende anlegget. | S1, S2 | Arkitektur og vekst |
| 7 | Skolen lå i et industrielt nærmiljø ved Akerselva, med fabrikker og arbeiderboliger. | S1 | Arbeiderbydelen |
| 8 | Skoleoppgavene omfattet også mat, klær og hygiene for barn fra familier med små ressurser. | S1 | Sosialhistorie |
| 9 | Oskar Braaten var elev ved skolen og skildret senere arbeiderlivet ved Akerselva. | S1 | Samfunn og litteratur |
| 10 | I 1882 var elevtallet ved skolen rundt 1 710, ifølge Oslo byleksikon. | S2 | Befolknings- og skolepress |
| 11 | Anna Sethne var overlærer ved Sagene skole fra 1919 til 1938. | S2, S3 | Historisk aktør |
| 12 | Sethne fikk gjennomføre Sagene-forsøkene fra 1930. | S1 | Pedagogisk forsøksvirksomhet |
| 13 | Sethne var inspirert av Montessori og senere Dewey/Kilpatrick; arbeidsskole og elevaktivitet fikk større betydning. | S3 | Reformpedagogisk endring |
| 14 | Sethne hadde også et kritisk syn på fellesklasser for gutter og jenter; «reformpedagog» er ikke et bevis på støtte til alle reformer. | S3 | Historisk nyansering |
| 15 | Tyske styrker rekvirerte skolen 29. april 1940 og brukte den som kaserne. | S2 | Krigsår |
| 16 | Skoleundervisningen fortsatte under okkupasjonen i midlertidige lokaler andre steder i området. | S1, S2 | Hverdagsliv under krigen |
| 17 | Vesle Sagene på Hadeland åpnet som leirskole i 1951, etter innkjøp av bygninger i 1948. | S1, S4 | Etterkrigstidens skole |
| 18 | Skolen opprettet en tidlig tospråklig klasse i 1982. | S1 | Mangfold og språk |
| 19 | Trusler mot skolens 17. mai-deltakelse i 1983 ble møtt med mobilisering for inkluderende feiring. | S1 | Antirasisme og samfunn |
| 20 | Året etter brukte elever slagordet «17. mai for alle» i flaggborgen. | S1 | Ettervirkning og offentlig minne |
| 21 | Oslo byleksikon beskriver en nynorsk hovedmålsklasse opprettet ved skolen i 1993. | S2 | Språkhistorie |
| 22 | Skolekomplekset er fredet som kulturminne, ifølge skolens institusjonshistorikk. | S1 | Bevaring og skolehistorie |

**Viktig distinksjon:** `1741` gjelder skoleinstitusjonens røtter, `1861` den eldste eksisterende skolebygningen, og `1926` ferdigstillelsen av den store mellomkrigsbygningen. De må ikke slås sammen i ett byggår.

## Kandidatstruktur for neste produksjonstrinn

Denne fordelingen er et redaksjonelt utgangspunkt, **ikke** låst profil eller produserte quizspørsmål:

1. **Opphav og bygninger:** 1741, kommunal tilknytning, 1861, arkitektur og utvidelser.
2. **Barn i industribydelen:** fabrikker, elevvekst, sosialhjelp, hverdag og Braaten.
3. **Anna Sethne og Sagene-forsøkene:** ledelse, aktivitetspedagogikk, faglig påvirkning og historiske begrensninger.
4. **Krig, leirskole og et nytt samfunn:** okkupasjon, Vesle Sagene, språkundervisning, 17. mai og bevaring.

Før profil bestemmes, må den kanoniske historie-fagpakken og hele eksisterende quiz-/Knowledge-sporet auditeres i tråd med `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`. De første to settene skal ha sju direkte, historiske spørsmål hver; metode og teori kan først brukes senere. Ingen quizfil, Knowledge-generering eller stedlig besøksregistrering inngår i denne kilderunden.

## Punkter som krever ekstra kildekontroll

- Skolens nåværende klassetrinn er ulikt beskrevet i noen kilder; historiske årstall kan brukes uten å hevde et nåværende elevtilbud.
- Skolens omtale av den første leirskolen bør gjengis som institusjonens historiske påstand, eventuelt kontrolleres mot andre leirskolekilder.
- Kulturminnefredningen bør kryssjekkes mot gjeldende Riksantikvarregister dersom juridisk fredningsomfang skal være eget quizspørsmål.
- Uenigheten om fellesklasser er historisk relevant, men må formuleres presist og uten å legge dagens begrepsbruk i kildene.
