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


## Faktisk importstatus etter de to første plasseringene (23. oktober)

**Dette avsnittet oppdaterer eldre, fortsatt bevarte research-notater ovenfor.** Fire kanoniske WebP-filer er nå kontrollert mot originale SHA-256-summer og lagt på PR-grenen for **Høyres Hus** og **Victoria terrasse**. Begge stedsfilene har egne `image`- og `frontImage`-stier med `imageMeta` og `frontImageMeta` (Commons-side, fotograf, konkret CC BY-SA-lisens og opplysning om beskjæring). Ingen ny `cardImage` er lagt inn. Begge er fortsatt **ikke v1-ferdige** før app-/browserkontroll.

**Etter denne importen:** `hoyesteretts_hus`, `folkets_hus_oslo`, `hoyblokka` og `y_blokka` mangler fortsatt kanoniske bildefiler. Den første forsøkte tresteds-stagingen feilet ved Wikimedia HTTP 429; skriptet er deretter utvidet med direkte kontrollert original-URL og høflig Retry-After/pause, men dette er ingen garanti for nedlasting. Staging-jobs må være bekreftet `success`, bildene må åpnes og kontrolleres i både bredt/portrettformat før eventuell promotion. Høyblokka-fotoet viser **2008**, ikke nåværende situasjon; Y-blokka ligger fremdeles utenfor kjøringen i påvente av separat kunstvurdering.

Kontrollerte historiske kildefiler: [Høyesteretts hus (Helge Høifødt)](https://commons.wikimedia.org/wiki/File:Norges_H%C3%B8yesterett_Supreme_Court_of_Norway.jpg), [Folkets Hus (Kjetil Ree, 16. august 2006)](https://commons.wikimedia.org/wiki/File:Folkets_Hus_Youngstorget.JPG), [Høyblokka (Geir Hval, 1. juli 2008)](https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_H-blokk_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg).

**Krav som består:** Avledede place-open-/indeksfiler må være regenerert etter bildekobling, billedmetadata må vises korrekt med lisens i UI, faktisk smal-mobil-/desktop-test skal dokumenteres, og PR forblir `draft` inntil alle kritiske porter består. Ingen endringer i Oslo-bolk 04 eller andre stedsarbeid.

## Sluttstatus for bildefiler i PR-grenen – 23. oktober 2026

**Oppdatert status: 6 av 6 steder har nå faktiske binære WebP-par i PR #6579.** De to kildevariantene for hvert sted er `bilder/places/<place_id>.webp` (1400×900, `image`) og `bilder/places/<place_id>_front_portrait.webp` (900×1350, `frontImage`). Alle seks canonical Place-filene viser til egne filer med fotografkreditering, Commons-URL, CC BY-SA-lisens og dokumenterte transformasjoner; ingen av dem er tilført ny `cardImage`.

| Place | Bildeproveniens | Faktisk status i PR |
| --- | --- | --- |
| `hoyesteretts_hus` | Helge Høifødt, 3. august 2008, CC BY-SA 4.0 | To WebP-filer lagt inn; stående 0,5-utsnitt inspisert |
| `folkets_hus_oslo` | Kjetil Ree, 16. august 2006, CC BY-SA 2.5 | To WebP-filer; stående utsnitt fokus x=0,92 for synlig LO-merke |
| `hoyres_hus` | Kjetil Ree, 18. juni 2007, CC BY-SA 2.5 | To WebP-filer lagt inn |
| `hoyblokka` | Geir Hval, 1. juli 2008, CC BY-SA 4.0 | To WebP-filer; stående x=0,93; `historicalOnly` og datert bildetekst |
| `victoria_terrasse` | Leif Knutsen/Leifern, 22. august 2008, CC BY-SA 3.0 | To WebP-filer lagt inn |
| `y_blokka` | Geir Hval, 1. juli 2008, CC BY-SA 4.0 | To WebP-filer fra fasadefoto uten Picasso/Nesjar-motiver; `historicalOnly` og datert bildetekst før rivingen 2020 |

### Særskilt Y-blokka-vurdering (foto uten kunstverk)

[Dette fotografiet av Y-blokkas fasade](https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_Y-blokk_R5_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg) viser bygningens kurvede fasade og plassrom fra 2008, **ikke** Picasso/Nesjars integrerte kunstmotiver. Opphavspersonens fotolisens er CC BY-SA 4.0. I tillegg sier [åndsverkloven §31](https://lovdata.no/nav/lov/2018-06-15-40/kapI/%C2%A726) at byggverk kan avbildes fritt. Vurderingen gjelder dette konkrete arkitekturfotografiet, **ikke** en generell rett til å publisere kunstmotiver separat. Når stedet vises i appen må årstall og at bygningen ble revet i 2020 være synlig; bildeversjonen fra 2008 er ikke nåtidsillustrasjon.

### SHA-256 – binær proveniens og skifte til flere motiver

- Høyesteretts hus: original `99555b4c0b347e497e34c7fbddebde8464a2d62bd5dc9728bdbaa8f3ee6d3148`; bilde `96993f4ee9bc4b7f7d1dfc7c4c7bc06b08cb741a6acd48b392220723dc03eead`; front `6c04698951ba73922df71268a56dbdbe044c54fdd380f8d043a47530b8acab3c`.
- Folkets Hus: original `a70ae0bea39d6142c94c2bc2ae3c1a91ed3d2c7a86bba836c4897f05993ab6d3`; bilde `dc4ca30e43da41bf359102cf5e870e61ea0c74f4be9f03902c61183e008eb579`; front `cb18ed97fe216fbbdf142bd5a104a36b21456c38623f5a82c735f84c1ffe8dcd`.
- Høyblokka: original `1212b976563568ddc1198686e3dfb3d5d53a1a3a00436bdcc416b7f46e5d7eb9`; bilde `74b263e3b1a791c380cf607b049319de45ec2b03e19c983332f84484fcd40a6b`; front `4084f1d70442072e6e1634bb2f6a5e60c09430c0f207d532bad1b7df3277c957`.
- Y-blokka: original `9ac9cec706e816053950c7cb66214f9414a702d7279f0d081dc3fb1b55d9a0b7`; bilde `0470ae18f9971dfe15b2f97cc0c87c8cd2b5a6ff28ef5570137a40a9bdfcfdad`; front `91f5534b30b0bab866d435ef386897a24d1012fd2bb816978916752d82ad99b4`.
- Høyres Hus og Victoria terrasse har også SHA-256 fra første fotografiimport, dokumentert i promotion-commit-historikken.

Spesialiserte engangs-arbeidsflyter for staging og promotion ble fjernet fra slutt-diffen etter fullførte kjøringer for å unngå vedlikehold av PR-spesifikke CI-systemer; deres kjøringslogger består i GitHub Actions.

### Hva dette ikke beviser

**Bildeportens filgrunnlag er komplett, men dette er ikke v1-ferdig.** Endelig GitHub-CI må kontrolleres på **den nye head-commit**, ikke gamle 10/11-referanser. Test at alle 12 WebP-filer finnes og at metadata er bundet i runtime. Ingen påstand om bestått mobil-/desktop- eller faktisk PlaceCard-/Fagverk-/QuizCard-appvisning før dokumentert browser-QA. Fullquiz, alle 60 kandidaters påstand–kilde–distraktor-review og Knowledge/QuizCard-paritet gjenstår, og PR-en forblir draft.
