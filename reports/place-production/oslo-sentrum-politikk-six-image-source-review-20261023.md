# Oslo sentrum Politikk — billedkilde og rettighetskontroll 23. oktober 2026

**Status:** to verifiserte originale foto-lisenser, men **ingen fil eller bildeformat er ennå integrert i Place**. Dette er **ikke** bildegodkjenning for v1.

| Place | Wikimedia Commons original | Fotokreditering | Rettighetsstatus | Originalstørrelse | Forbehold |
| --- | --- | --- | --- | --- | --- |
| `hoyesteretts_hus` | [Høyesteretts hus (150327).jpg](https://commons.wikimedia.org/wiki/File:H%C3%B8yesteretts_hus_(150327).jpg) | **Photo: Tore Sætre / Wikimedia** i umiddelbar nærhet av bildet | **CC BY-SA 4.0**, lenk lisens, oppgi eventuelle bearbeidinger; ShareAlike ved avledede verk | 900 × 600, liggende | Opphavspersonen ber om å unngå endringer utover nødvendige formater; søk heller etter egnet, selvstendig stående foto før en kvalitetsmessig svak oppskalert beskjæring |
| `folkets_hus_oslo` | [Folkets hus Oslo.jpg](https://commons.wikimedia.org/wiki/File:Folkets_hus_Oslo.jpg) | **Photo: Mahlum / Wikimedia Commons** (anbefalt kreditering) | Opphaverens **public-domain-dedikasjon** på Commons | 1256 × 669, liggende | Motivet dokumenterer Youngs gate 11, men har ikke nok oppløsning til et naturlig stående 900×1200-bilde uten betydelig nykomposisjon eller oppskalering |

Kildesidene er sjekket for fototittel, sted, kilde, navngitt opphaver, lisens og original oppløsning. **Ingen bildedata er importert**; lokale SHA-256-er, korrekt form og reell PlaceCard-visning mangler. Ikke sett `image`, `frontImage`, `cardImage` eller `popupImage` til nettadresser uten å materialisere og kontrollere bildefilene.

**Resten av gruppen:** `hoyres_hus`, `hoyblokka`, `victoria_terrasse`, `y_blokka` mangler bildebevis, motivgjennomgang og lisensklart kildevalg. For Y-blokka krever motiver med Picasso/Nesjars kunst selvstendig opphavsrettslig kontroll; fritt lisensiert fotografi innebærer ikke automatisk fri lisens på avbildet beskyttet kunst. Ingen av de fire er klarert.

## Bekreftet CI-blokkering

På siste kontrollert ferdige PR-head `dd108cc7` bestod 10 av 11 testarbeidsflyter. **Fagverk and place learning** feilet ved steget `Require valid images on new and changed places`, fordi **alle seks Place-filer mangler `popupImage`, `cardImage` eller `image`**. Dette er ikke feil ved Fagverk-strukturen. Ingen test skal omgås, og PR #6579 skal forbli et utkast inntil reelle billedfiler er ferdig kontrollert.

## Neste bilderunde

1. Finn fotografier med tilstrekkelig oppløsning og komposisjon for Høyesteretts hus og Folkets Hus, inkludert *selvstendig stående original* når PlaceCard krever dette.
2. Bekreft fotograf, lisenstype, kreditering, endringstillatelse, stedsidentitet og full kilde-URL per motiv.
3. Materialiser lokale original-/avledede filer med verifisert SHA-256, ikke strekkt oppskalering for å fylle kvoter.
4. Utfør visuell redaksjonell kontroll av frontbilde, kortbilde og bredt toppbilde på mobil og PC.
5. Gjennomfør tilsvarende kilde- og motivaudit for resten av de seks; ikke bruk kunstfotografi uten klarert tilstrekkelig rettighet.
