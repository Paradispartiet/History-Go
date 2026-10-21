# Maridalsvannet – v1 nullmåling og kildekontroll, 21. oktober 2026

## Funn før produksjon
- Canonical place: `data/places/natur/oslo/places_oslo_natur_hovedsteder/maridalsvannet.json`, `id: maridalsvannet`, natur, dokumentert OSM-polygon (relation 1438314). Koordinater, identitetsgrense, category og underbadges beholdes.
- Eksisterende `popupDesc` inneholdt interne spillinstruksjoner («I History Go bør ...»), og `desc` var generisk. Begge er nå omskrevet til historisk fortelling med tydelige vendepunkter og aktører.
- Ingen aktiv `maridalsvannet` i quizmanifestet eller natur-QuizCard-samlinger ved nullmålingen. Ingen kuratert Fagverk-side før endringen.
- **V1-profil:** natur, innsjø/drikkevannskilde, med `innsjo`, `vann_og_vassdrag`, `vannkvalitet`, `skog`. Verken besøksstedets naturprofil eller gamle koordinater er endret.

## Kontrollerte kilder og faktagrense
- Oslo byleksikon – Maridalsvannet (https://oslobyleksikon.no/index.php?title=Maridalsvannet): avsnitt om inn- og utløp, 1867, 1888, 1920 og Oset 1971.
- Oslo byleksikon – Vannforsyningen (https://oslobyleksikon.no/index.php/Vannforsyningen): historikk 1850–1900, Oset 1971 og nytt anlegg 2008.
- Oslo kommune – Vann og avløp i 150 år (https://www.oslo.kommune.no/etater-foretak-og-ombud/vann-og-avlopsetaten/vann-og-avlop-i-150-ar/): forurensning og Maridalssyken, over 30 000 syke i 1888, bakgrunn for vannverksutbygging.
- Oslo kommune – ferdselsregler (https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/marka/ferdsel-ved-maridalsvannet-og-andre-drikkevannskilder): restriksjonsområder, ingen bading/fiske/båt og ikke rasting nærmere enn 50 meter i merkede områder.

Årstallene 1867, 1888, 1971 og 2008 brukes fordi de er historiske vendepunkter, ikke for å fylle en kronologi. Menneskene som ble syke omtales uten dramatiserende enkelthistorier som kildene ikke dokumenterer. Vannbehandling og kildebeskyttelse skilles fra påstander om dagens kvalitet.

## Bildeleveranse og faktisk app-QA

- Stående WebP: `bilder/places/maridalsvannet_front_portrait.webp`, **600 × 800**. Dokumentarfoto av Grzegorz Wysocki (2007), CC BY 3.0, https://commons.wikimedia.org/wiki/File:Maridalsvannet,_Oslo.jpg.
- Bred WebP: `bilder/places/maridalsvannet_landscape.webp`, **1400 × 900**. Dokumentarfoto av Geir Hval (2022), CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Maridalsvannet_i_Maridalen,_Oslo,_Norway_(2022.11.12).jpg.
- Fotografier, kilde-URL, lisens, bearbeiding, bildehash og separat `image`/`frontImage` er registrert i canonical place og i `maridalsvannet-v1-image-qa-20261021.json`. Begge utsnitt er visuelt gjennomgått.
- **Reell appkontroll bestått 390 og 1440 px.** PlaceCard viste lokalt bilde med faktisk størrelse 600 × 800, QuizCard flippet med innhold, quizknappen åpnet riktig mål og Fagverk-siden lastet flere tusen tegn. Begge bredder hadde 0 px horisontal overflyt og 0 JavaScript-feil.
- Dokumentasjon: `maridalsvannet-v1-browser-qa-20261021.json` er versjonert. Seks fullstørrelse-skjermbilder fra den opprinnelige mobil-/desktop-kontrollen ligger i tilhørende GitHub Actions-artifakt, ikke som store PNG-filer i repoet. Den vedvarende `Maridalsvannet v1 real browser acceptance`-testen tar nye skjermbilder som Actions-artifakt, og kontrollerer også oversatt historisk tekst og synlig QuizCard etter flip-animasjon.

## Quiz, Knowledge og språk

- Fullquiz: **3 sett × 7 = 21** kildebelagte spørsmål, bevart i `data/quiz/natur/maridalsvannet_sets.json`, med korrekte fasiter og Knowledge-ID-er som er generert gjennom den kanoniske kunnskapsgeneratoren.
- QuizCard: 10 av de samme spørsmålene, med identisk fasit og kildekobling; både fullquiz og QuizCard er registrert i manifestene.
- Oversettelser til engelsk, spansk og portugisisk er oppdatert i de eksisterende i18n-filene med ny `_sourceHash`. De er fortsatt merket `machine_translated`, da ekstern morsmålsvurdering ikke er utført. Den første skjermbildefangsten kom før språkoppdateringen; den påfølgende automatiserte nettlesertesten kontrollerer også den nye engelske fortellingen.

## V1-avslutning og gjenstående port

Kanonisk stedstekst, kilde-/claim-pakke v4.2, Fagverk-side, fullquiz, QuizCard, Knowledge, to lisensierte WebP-bilder, place-index, Fagverk-release og place-open er integrert i den samme produksjonsgrenen. Ferdselsreglene og drikkevannshensynene er kontrollert mot Oslo kommune, uten badevannsgaranti eller foreslått bading ved vannkilden.

**Siste gjenstående beslutning:** ordinær GitHub CI må være grønn på seneste PR-head, deretter merge #6519 til `main`. Ingen V3/`vFerdig`-status settes: natur-samlinger, videre objekter og den fulle stedssjekklisten hører til en senere produksjonsfase. Nøklevann starter først etter fullført merge.
