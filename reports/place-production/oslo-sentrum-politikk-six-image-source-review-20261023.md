# Oslo sentrum Politikk — billedkilde og rettighetskontroll 23. oktober 2026

> **Oppdatert arbeidsregel 23. oktober:** Ved motstrid følger vi hovedsjekklisten `docs/PLACE_PRODUCTION_CHECKLIST.md` v2.6. Den tillater **`image` og en selvstendig stående `frontImage`**, men sier at `cardImage` er legacy og **ikke skal opprettes eller gjeninnføres** i ny/revidert produksjon. Eldre formuleringer om tre nye bildefiler nedenfor er kun historisk researchkontekst, ikke gjeldende importinstruks. En eksisterende CI-feilmelding kan fremdeles navngi legacy-felt; ikke omgå sjekklisten for å oppnå grønn test.\n\n**Status:** to verifiserte originale foto-lisenser, men **ingen fil eller bildeformat er ennå integrert i Place**. Dette er **ikke** bildegodkjenning for v1.

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

## Andre billedkilder — etterkontroll 23. oktober 2026

Ny research etter første lisensgjennomgang. **Følgende er identifiserte Commons-originaler og lisenser, ikke materialiserte eller visuelt godkjente History GO-bilder.** Originalmålene er filsidens metadata; ingen nye lokale bildefiler, SHA-256, kanoniske bildevarianter eller `image`-felter er opprettet.

| Place | Ny hovedkandidat på Commons | Fotograf | Lisens oppgitt på Commons | Originalformat | Redaksjonell vurdering |
| --- | --- | --- | --- | --- | --- |
| `hoyesteretts_hus` | [Norges Høyesterett Supreme Court of Norway.jpg](https://commons.wikimedia.org/wiki/File:Norges_H%C3%B8yesterett_Supreme_Court_of_Norway.jpg) | Helge Høifødt | CC BY-SA 4.0 | 3557 × 2276 (liggende) | Høyoppløselig alternativ til Tore Sætres 900×600. Bred fasade; stående utsnitt må komposisjonskontrolleres. |
| `folkets_hus_oslo` | [Folkets Hus Youngstorget.JPG](https://commons.wikimedia.org/wiki/File:Folkets_Hus_Youngstorget.JPG) | Kjetil Ree | CC BY-SA 2.5 (og 2.0/1.0) | 3072 × 2304 (liggende) | Betydelig større original enn tidligere 1256×669. Stående utsnitt kan prøves, men motiv og LO-merke må beholdes lesbart. |
| `hoyres_hus` | [Høyres Hus Oslo.jpg](https://commons.wikimedia.org/wiki/File:H%C3%B8yres_Hus_Oslo.jpg) | Kjetil Ree | CC BY-SA 2.5 (og 2.0/1.0) | 2304 × 3072 (stående) | Prioritert frontImage-kandidat: selvstendig høydeformat og dokumentert adresse Stortingsgata 20. Historisk foto fra 2007. |
| `hoyblokka` | [Regjeringskvartalet H-blokk Johan Nygaardsvolds plass Oslo Norway (2008.07.01).jpg](https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_H-blokk_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg) | Geir Hval | CC BY-SA 4.0 | 3008 × 2000 (liggende) | Historisk foto før angrepet i 2011: må merkes som eldre tidslag; ikke som 2026-status. For ny fasade finnes [2026-foto av Wolfmann](https://commons.wikimedia.org/wiki/File:OSLO_Norway_2026-10-12_AKERSGATA_Deich_bibliotek_byggegrop_heisekran_Regjeringskvartalet_A-blokka_H%C3%B8yblokka_Johan_Nygaardsvolds_plass_Lindeall%C3%A9en_22_juli-minnesmerke_(Mathias_Faldbakken)_Gamle_regjeringsbygning_etc_IMG_3393.jpg), 6048×8064, CC BY-SA 4.0, men utsnitt/kunst- og minnesmerkerettigheter må vurderes særskilt. |
| `victoria_terrasse` | [Victoria Terrasse in Oslo Norway.jpg](https://commons.wikimedia.org/wiki/File:Victoria_Terrasse_in_Oslo_Norway.jpg) | Leif Knutsen / Leifern | CC BY-SA 3.0 (og GFDL) | 2000 × 3008 (stående) | God frontImage-kandidat fra 2008; kontroller at fasadens sentrale arkitektur bevares i utsnitt. |
| `y_blokka` | [Regjeringskvartalet Y-blokk R5 Johan Nygaardsvolds plass Oslo Norway (2008.07.01).jpg](https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_Y-blokk_R5_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg) | Geir Hval | CC BY-SA 4.0 for foto | 3008 × 2000 (liggende) | Historisk før rivingen i 2020. **Ikke kunst-rettighetsklarert**: undersøk om beskyttet Picasso/Nesjar-verk er synlig/hovedmotiv, og dokumenter rettighetsgrunnlag før bruk. |

### Brukstillatelse er ikke ferdig bildelevaranse

- Commons-opphaverens fotolisens er dokumentert i tabellen; nødvendig navngivelse, lenke til konkret lisensversjon og synlig beskjærings-/bearbeidingsmerknad må følge hvert brukt bilde. Ved bearbeidede CC BY-SA-bilder må delingen skje i samsvar med samme eller kompatibel lisens.
- Gjeldende importmål er bredt hovedbilde (`image`, mål 1400×900) og en separat, faktisk stående PlaceCard-fil (`frontImage`, mål 900×1350). **Ikke produser ny `cardImage`**; den er legacy etter hovedsjekklisten v2.6. Begge rollene må lages fra reelle lisensierte originalbytes og inspiseres separat. Ingen oppskalering for å skjule manglende oppløsning, og ingen falske hashverdier.
- Bruk historisk datert bildetekst for `hoyblokka` og `y_blokka`. For Y-blokka må stedsmarkøren vise tidligere bygning og eventuelle kunstverk vurderes juridisk separat fra fotografiets lisens. Også det nyere 2026-fotoet med minnesmerke for `hoyblokka` kan inneholde tredjepartskunst.
- Neste tekniske port krever tilgang til originale bildefiler, validert WebP-konvertering, SHA-256, synlig korrekt kreditering i appen samt telefon-/desktopkontroll. GitHub-connectorens tekstfiloppdatering er ikke en erstatning for import av faktiske bildefiler. **Alle seks Place-bilder forblir BLOCKED** til dette er gjort.


## Verktøy lagt til for sikker import – ikke kjørt i publiseringsløpet

Kilde: `scripts/place-production/stage_oslo_sentrum_politikk_photos.py` på PR #6579. Det er et avgrenset, manuelt kjørbart klargjøringsverktøy som følger den **nyere** bildekontrakten. Det skriver kun til `reports/place-production/media-staging/oslo-sentrum-politikk/<place_id>/`, ikke til `data/places` eller `bilder/places`.

Eksempel på en maskin med nettverk og Pillow:

```bash
python -m pip install Pillow
python scripts/place-production/stage_oslo_sentrum_politikk_photos.py --place hoyres_hus --place victoria_terrasse
python scripts/place-production/stage_oslo_sentrum_politikk_photos.py --place hoyesteretts_hus --place folkets_hus_oslo
python scripts/place-production/stage_oslo_sentrum_politikk_photos.py --place hoyblokka --allow-historical-hoyblokka
```

Det kontrollerer faktisk JPEG-dekoding, EXIF-rotasjon, forventede originaldimensjoner, at bildene ikke oppskaleres, begge WebP-dimensjonene, stående `frontImage`, og SHA-256 for original- og utdata. Det skriver en `staging-metadata.json` per sted med fotograf, Commons-kildeside, lisens og *pending human QA*.

**Begrensning i denne gjennomføringen:** Originalbildene kunne ikke lastes ned fra Wikimedia til arbeidsmiljøet. Derfor finnes fremdeles ingen materialiserte, inspiserte WebP-assetfiler på arbeidsgrenen, og ingen kanoniske stedsbilder er koblet. Skriptet er ikke en erstatning for å kjøre importen i et nettverkstilgjengelig miljø og kontrollere resultatene visuelt. Det oppretter med hensikt **ikke** Y-blokka: det må komme egen klarering for Picasso/Nesjar-verk før aktuell fotografering brukes. Historisk foto av Høyblokka krever eksplisitt valg og datert bildetekst. CI-, rettighets- og browser-port er fortsatt blokkert.
