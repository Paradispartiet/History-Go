# Arbeiderbladet / Dagsavisen – Youngstorget: sluttgjennomgang

Dato: 2026-10-11. Sluttbranch: `production/arbeiderbladet-closeout-20261011`. Core PR [#6212](https://github.com/Paradispartiet/History-Go/pull/6212) og separat quiz PR [#6213](https://github.com/Paradispartiet/History-Go/pull/6213) er merged. Denne rapporten erstatter åpne sluttporter i de tidligere checkpoint-rapportene; deres kildeavgrensninger gjelder fortsatt.

## Historisk og redaksjonell avgrensning

Canonical ID er `arbeiderbladet_youngstorget`. Stedet er Arbeiderbladets redaksjon i Folketeaterbygningen i 1934–1988, med opphold under okkupasjonen 1940–1945. Dagsavisen Arbeiderbladet (1997–1998) og Dagsavisen (fra 1998) er senere avisnavn, ikke påstand om at dagens Dagsavisen-redaksjon ligger her. Innflytting høsten 1934 og innvielse i april 1935 skilles fra hverandre. Dagens adressepunkt Youngstorget 2 er dokumentert med Geonorge; `stedfestingverifisert=false` beholdes som kildens råstatus. Det er ikke en kontrollmålt inngang eller et identifisert kontorrom.

Alle 31 sted-claims, beskrivelsens setninger, åtte Fagverk-avsnitt, fem linser og nøkkelspørsmål, åtte begreper, to observerbare spor, begge leksikonartikler, fem språkoppføringer, begge personprofiler og stedskoblinger, Brand, publikasjonsmedlem, kronologi, Story, fire Lesespor, 28 quizoppgaver med alternativer/fasit/forklaringer og ti QuizCard-spørsmål er gjennomgått. Reviewen gjelder hele leveransen, ikke et utvalg.

Hallin og Mancinis politiske parallellitet er navngitt teori med eksplisitt begrensning: institusjonelle partibånd beviser ikke innholdet i hver enkelt artikkel. De dokumenterte case-ene er Hirsti/redaktørvalget i 1974–1975 og Hasle-flyttingen i 1988. Arbeiderpartiets samtidige beretning (PDF-side 101 / trykt side 98) og Røberg-Larsens navngitte senere intervju gir ulike perspektiver. Ingen oppdiktet dialog, kollektiv medarbeideroppfatning eller stridsmotiv brukes som historisk fasit.

Tranmæl og Stanghelle har direkte arbeidsperioder ved stedet; deres eksisterende primærankre ved gravlunden og Aftenposten er bevart. Stanghelles journalistperiode 1982–1991 avgrenses til Youngstorget til 1988. Den synlige People-teaseren er rettet med de samme kildebelagte periodene og oppdatert claim-/runtime-dekning.

Papiravisen er et abstrakt publikasjonsverk med redaksjonstilknytning 1934–1988. Den autentiske hele faksimilen fra mai 1884 viser forløperen Vort Arbeide femti år før innflyttingen; både synlig tekst og metadata skiller disse tidene. Originalen er Public domain, 1345×1805, uten generert forside eller portrettbeskjæring. Det autentiske offisielle negative ordmerket fra 2026 identifiserer den senere Brand-identiteten og hevdes ikke å være et historisk skilt.

People, Brands og Utgivelser er PASS. Objects, før/etter og News er begrunnet N/A etter særskilt kildeavgrenset audit. Ingen identifisert kvalifisert gjenstand holdes tilbake bare fordi bilde mangler. Historiske fasadebilder fra ulike standpunkt konstrueres ikke som før/etter-par.

## Faktisk nettleser-QA og rettinger

Full quizavspilling: [Actions 38164723339](https://github.com/Paradispartiet/History-Go/actions/runs/38164723339), kildehead `4d7a852c26c962f4f3d2b722d9d12f38824d5bc0`, evidenscommit `1edba58ae336172d0161137f5d8143a2477f8c98`. Alle 28 spørsmål i fire sett fullføres på både desktop og mobil. Fire læringshendelser og én stedsbelønning; fysisk besøksstatus forblir false. Begge resultatbilder er manuelt åpnet. De påfølgende endringene gjelder språkets type, logoavstand og visuell audit; quizinnholdet er uendret.

Siste visuelle kjøring: [Actions 38165340451](https://github.com/Paradispartiet/History-Go/actions/runs/38165340451), kildehead `95b9e1098bcd42bba59da09b5c6d0d833fd5238e`, evidenscommit `69b064b18bbba711b374adb0ddd232a81a7bc50f`. Alle 21 JPG-filer fra denne kjøringen og de to quizresultatbildene er åpnet og gjennomgått. JSON-rapportene og 23 bilder ligger i `reports/visual-qa/arbeiderbladet-youngstorget/20261011-final/`.

| Kontroll | Belegg |
| --- | --- |
| 320×844, 390×844, 768×1024, 1440×1000 | PlaceCard-topp, nedre innhold, publikasjonspopup og faktisk Fagverk-side er manuelt sett på hver bredde. Ingen avkuttede tittelord eller horisontal PlaceCard-overflow. |
| People og Brand | Alle popuper åpner på alle bredder; iPad-bildene er manuelt sett. Stanghelles Arbeiderbladet-rolle og perioder er synlige. Hele ordmerket er synlig på mørk flate i både forhåndsvisning og popup. |
| Publikasjon | Alle fire popuper viser hele det rektangulære avisarket med contain, synlig 1884-datering, uttrykkelig forskjell fra husperioden og Public domain-kreditering. |
| QuizCard | Flip, utvidelse og lukking utført på alle fire bredder. iPad-bilder av fasit og utvidelse er åpnet; ti spørsmål er redaksjonelt kontrollert. |
| Språkleksikon | Alle fem canonical oppføringer rendres på hver bredde, inkludert hovedorgan. Begrepet var først feiltypet og filtrert bort; canonical type fagord løser det uten å endre global filterkontrakt. |
| Fagverk | Den virkelige artikkellenken følges på hver bredde; curated-status og skjult unfinished-melding. Hvert tittelord måles mot den faktiske tekstkolonnen og vises helt. |
| Story og drift | Én canonical, én indeksert og én synlig fortelling etter global init. Alle fire profiler har null registrerte auditavvik og JavaScript-sidefeil. |

Første manuelle kontroll fant hvitt ordmerke på hvit forhåndsvisning, en People-teaser uten Arbeiderbladet-perioden og klippet Fagverk-tittel. Logoen får mørk bakgrunn gjennom en smal selector med korrekt spesifisitet. Mobilens tekstetikett har reservert plass under ordmerket; alle nye bilder bekrefter at de ikke overlapper. Fagverk-rendereren setter canonical place-ID; stedets lange tittel skaleres mot tekstkolonnen, ikke hele viewports bredde, og har ikke den tidligere 12ch-grensen. Auditens ordgeometri oppdaget også den første utilstrekkelige CSS-rettingen; kontrollen er skjerpet, ikke svekket. TypeScript-kildens CSS-cacheversjon, generert bundle og HTML-/renderer-cacheversjon er oppdatert sammen.

Kjøringene bruker Linux Chromium med emulerte mobil-/nettbrettprofiler, ikke native Safari eller fysisk iPad. Automatiske målinger alene var ikke visuell godkjenning; alle lagrede bilder er sett. Engangsworkflowen fjernes fra sluttdiffet.

## Verifikasjon og kvalitetsport

`npm run place:build -- arbeiderbladet_youngstorget` bygger canonical avledede data og V3-projeksjoner. `npm run place:verify -- arbeiderbladet_youngstorget` kontrollerer determinisme, kildekontekst, manifest og stedets regresjoner. 29 lokale tester består for Fagverk-rendering/-sider, egen stedsproduksjon og Unified Place. People Profile-audit består for 109 profiler. Quizkontekst, manifest, progresjon, teoribinding, wiring, QuizCard og Knowledge-check består i separat quiz-PR. De ti READ-FIRST-filene har bevart SHA-256-bevis i canonical kilde-/workflowreferanser; generatorens V3-projeksjon håndredigeres ikke.

| Dimensjon | Score | Evidens og grense |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | 31 sted-claims, setningsdekning, egne quizclaims og personclaims. Samtidig primærkilde og navngitt tilbakeblikk skilles; bilde-, avisnavn- og stedsdatoer avgrenses. |
| Dekning og ferdigstillelse | 5/5 | Hele avtalte sjekklisten, separat 28-spørsmålsquiz, dedikert QuizCard og fem operative språkoppføringer. Alle innholdsenheter og 23 sluttbilder er gjennomgått. |
| Faglig/redaksjonell kvalitet | 5/5 | Stedsspesifikk analyse av partipresse, redaktørvalg, teknologi og flyttestrid; navngitt teori og to dokumenterte case med begrensninger. Quizens første 14 oppgaver er konkret kunnskap. |
| Teknisk integritet | 4/5 | Deterministisk Place-build/verify, 29 regresjoner og faktisk app på fire bredder; full quiz på to profiler. Native Safari er ikke kontrollert; exact-head CI og post-merge integrity kreves separat. |
| Sikkerhet og ansvarlighet | 5/5 | Verifisert originalproveniens, synlige dateringer/lisenser, bevart adresseusikkerhet, ingen oppdiktede biografier og ingen besøksregistrering fra quiz. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Canonical eiere, claimspor, READ-FIRST-hashbevis, kjørbar audit og bounded skjermbilder med kildehead. Store genererte Knowledge-/runtimefiler er fortsatt en reviewkostnad. |

**28/30; alle dimensjoner minst 4, ingen åpne stedsspesifikke blockere. Innholds- og visuell kvalitetsport består.** Workflow settes complete og final_ui PASS etter denne gjennomgangen. Merge utføres først etter bestått CI på den faktiske final PR-head, uendret forventet SHA og kontroll av review/base. Post-merge Main integrity kontrolleres på mergecommit-en. Ingen globale eksisterende bilde-, Knowledge- eller Lesespor-avvik utenfor eget scope hevdes løst.
