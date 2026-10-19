# Oslo – stedstekst og bildestatus for 20 QuizCard-steder

19. oktober 2026. PR #6380 har allerede publisert 20 QuizCards med 200 spørsmål. Denne bolken kartlegger bildebehovet for alle 20 steder, og legger frem **10 nye utkast til stedstekster** i `revised-place-texts-draft.json`. Originale canonicale `desc`/`popupDesc` er **ikke** endret, fordi produksjonskontrakten krever separate v4.2-pakker med kontrollert påstandsregister og oppdatert runtime før slik publisering. Quiz/QuizCard, bildepeker og produksjonsstatus er uendret. Intern spill- og produksjonsprosa er identifisert i eksisterende tekster og utbedret i utkastene, men de er ennå ikke publisert.

## Faktisk bildetilstand

- **13 av 20** har ikke utfylt `image` i canonical stedspost.
- **2 av 20** har `image`, men ikke eget `frontImage`.
- **5 av 20** har begge referanser, men er ennå ikke visuelt revurdert som del av denne bolken.
- Separate `cardImage` og faktisk riktig utsnitt i app må også kontrolleres. En bildeadresse alene er ikke bevis for kvalitet, lisens eller publikasjon.
- Nye **v1: 0**, nye **vFerdig: 0**. Ingen nye bildefiler eller app-/mobilkontroller er levert her.

## Kildebelagte bildekandidater

| Sted | Lisensiert kilde | Merknad |
| --- | --- | --- |
| havnelageret | [Leonhard Lenz – CC0 1.0](https://commons.wikimedia.org/wiki/File:Havnelageret_Oslo_2022-08-17_02.jpg) | Eget bredt og stående utsnitt må bevare fasade/tårn. |
| sagene_skole | [Bjoertvedt – CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Sagene_skole_86163_IMG_3931.jpg) | Vis skolebygningen fremfor uvedkommende gatemotiv. |
| grev_wedels_plass | [Helge Høifødt – Public domain (author release)](https://commons.wikimedia.org/wiki/File:Grev_Wedels_plass1.JPG) | Plass/parkrom må være leselig etter beskjæring. |

Kildesidene dokumenterer fotograf og lisens, men filene er **ikke** generert i tre WebP-varianter eller godkjent i PlaceCard. For øvrige steder må motiv og rettigheter fremskaffes. Ikke bruk bilder av feil bygning, nabolag eller hendelse som erstatning.

## Kilder som skal ettergås for ti tekstutkast

- **havnelageret:** [kilde](https://oslobyleksikon.no/side/Oslo_Havnelager), [kilde](https://lokalhistoriewiki.no/wiki/Oslo_havnelager)
- **frysja_industriomrade:** [kilde](https://oslobyleksikon.no/side/Frysja), [kilde](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-kunstnersenter/)
- **norges_varemesse:** [kilde](https://oslobyleksikon.no/side/Norges_Varemesse), [kilde](https://novaspektrum.no/rapport/2024/stiftelsen-nova-spektrum-i-mer-enn-100-ar/)
- **bryn_industriomrade:** [kilde](https://oslobyleksikon.no/side/Bryn_Teglverk), [kilde](https://lokalhistoriewiki.no/wiki/Bryn_%28Oslo%29)
- **gronlikaia:** [kilde](https://oslobyleksikon.no/side/Gr%C3%B8nlia_%28havna%29), [kilde](https://oslobyleksikon.no/side/Gr%C3%B8nlikaia)
- **christiania_seildugsfabrik:** [kilde](https://oslobyleksikon.no/side/Christiania_Seildugsfabrik)
- **grensen_kjopesenter:** [kilde](https://oslobyleksikon.no/side/Grensen)
- **akershus_kaier:** [kilde](https://oslobyleksikon.no/side/Akershuskaiene)
- **vippetangen_fisketorg:** [kilde](https://oslobyleksikon.no/side/Fiskehallen)
- **tollbukaia:** [kilde](https://oslobyleksikon.no/side/Tollbukaia), [kilde](https://oslobyleksikon.no/index.php/Tollboden)

## Neste godkjenningsport

For hvert uferdige sted: velg identitetskontrollert motiv, dokumenter opphav/lisens, produser egne WebP-utgaver på 1400×900 (bredt), 900×1350 (stående) og 900×600 (kort); juster fokuspunkter, og kontroller bredt og smalt utsnitt i appen. Historisk tekst må kildevalideres mot riktig bygg eller område. Først etter begge deler kan `v1_candidate` vurderes oppgradert. Fullproduserte eksisterende stedspakker er ikke nedgradert.

Selve tekstutkastene er lagret i `reports/oslo-place-media-text-batch04-20261019/revised-place-texts-draft.json` og krever eget kilde-/v4.2-løp før oppdatering av canonical Place og generert runtime.

Detaljert 20-steds kø: `data/places/production-tiers/v1-oslo-place-media-text-review-20261019-batch04.json`.
