# Oslo-bolk 04 – kontroll av fotokilder og lisensmetadata

**Dato:** 22. oktober 2026  
**Omfang:** 17 v1-kandidater, hovedbilder og portrettutsnitt av samme kildefotografi  
**Grunnlag:** kanoniske data, `data/runtime/place-open/*.json`, og tilgjengelige originale kilde-/lisenssider.  
**Resultat:** metadata-audit gjennomført; **ingen full visuell/lisensmessig v1-godkjenning**.

## Status

- Alle 17 har `imageMeta` og `frontImageMeta` med kilde og lisensbetegnelse i runtime-data. Portrettbilder er beskårne varianter av oppgitte originalsider.
- 16 Commons-sider ble kontrollert direkte for samsvar med den oppgitte lisensetiketten, inkludert Grønlikaia (CC BY-SA 4.0, via kategorilenke til filens lisensside). Museumsoppføringen for Fiskehallen samsvarer med **CC BY-SA**, men angir ingen versjon.
- De tekniske Chromium-testene i #6561 kontrollerer bildeinnlasting, **ikke** at kreditering, lisenslenke, endringsangivelse og eventuelle delingsvilkår vises korrekt for sluttbrukeren.
- **Korrigert i denne PR-en:** Norges Varemesse hadde den feilaktige brukerrettede teksten `Unknown authorUnknown author`. Korrekt kildebasert kreditering: «Ukjent fotograf / Nasjonalbiblioteket / Wikimedia Commons». Bildetekstens bastante fotograferingsår ble fjernet fordi kildeopplysningene ikke fastslår et sikkert opptaksår.
- **Korrigert i denne PR-en:** Gamle trikkestallen og Gamle rådhus hadde kreditering kun i `imageMeta` / `frontImageMeta`, ikke i de flate feltene. `imageCredit`, `imageLicense`, `imageSourceUrl` og `imageCaption` er nå også tilgjengelige i begge kanoniske stedsfiler og i runtime-projeksjonen.

## Sted-for-sted-oversikt

| # | Sted | Oppgitt lisens | Kreditert skaper/kilde | Original | Kildekontroll |
|---:|---|---|---|---|---|
| 1 | Den gamle Norges Bank | CC BY-SA 3.0 no | Bjoertvedt / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Nasjonalmuseet_Akritektur_gamle_norgesbank_IMG_3894_rk_87641.JPG) | Lisensetikett samsvarer med kildesiden |
| 2 | Akershuskaiene | Public domain | Narve Skarpmoen / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Oslo_Havn_-_no-nb_digifoto_20160222_00074_NB_NS_NM_06937.jpg) | Lisensetikett samsvarer med kildesiden |
| 3 | Akers mekaniske Verksted | Public domain | Hermann Christian Neupert / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Ships_at_Akers_Mekaniske_Verksted_1931_%28NTM_86_2-2039%29.jpg) | Lisensetikett samsvarer med kildesiden |
| 4 | Grensen – handelsgate | CC BY-SA 4.0 | Bahnfrend / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Grensen%2C_Oslo%2C_2019_%2801%29.jpg) | Lisensetikett samsvarer med kildesiden |
| 5 | Fiskehallen på Vippetangen | CC BY-SA | Wilhelm Råger / Oslo Museum / DigitaltMuseum | [Original](https://digitaltmuseum.no/021015456022/fiskehallen-pa-vippetangen) | Kilde samsvarer; lisensversjon ikke angitt |
| 6 | Frysja industriområde | CC BY 2.0 | Sean Hayford O'Leary / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Frysja.jpg) | Lisensetikett samsvarer med kildesiden |
| 7 | Norges Varemesse – Sjølystsenteret | Public domain | Ukjent fotograf / Nasjonalbiblioteket / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Varemessen_-_no-nb_digifoto_20150105_00001_NB_MIT_FNR_20402.jpg) | Lisensetikett samsvarer med kildesiden |
| 8 | Bryn industriområde | CC BY-SA 3.0 | Anders Beer Wilse / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Bryn_teglverk_%281933%29.jpg) | Lisensetikett samsvarer med kildesiden |
| 9 | Grønlikaia | CC BY-SA 4.0 | Anders Beer Wilse / Oslo Museum / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:OB.X0999_Gr%C3%B8nlikaia_%28cropped%29.jpg) | Lisensetikett samsvarer med kildesiden |
| 10 | Christiania Seildugsfabrik | CC0 | Leonhard Lenz / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Christiania_Seildugsfabrik_Oslo_2022-08-17_05.jpg) | Lisensetikett samsvarer med kildesiden |
| 11 | Sagene skole | CC BY-SA 4.0 | Bjoertvedt / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Sagene_skole_86163_IMG_3931.jpg) | Lisensetikett samsvarer med kildesiden |
| 12 | Stortorget | CC BY-SA 3.0 | Michal Klajban / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Oslo,_market.JPG) | Lisensetikett samsvarer med kildesiden |
| 13 | Norges Bank – Bankplassen 4 | CC BY 2.0 | Tomoyoshi NOGUCHI / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Norges_Bank.jpg) | Lisensetikett samsvarer med kildesiden |
| 14 | Gamle trikkestallen på Torshov | CC BY-SA 4.0 | Jan-Tore Egge / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Torshovgata_33.jpg) | Lisensetikett samsvarer med kildesiden |
| 15 | Gamle rådhus | CC BY-SA 3.0 | Mahlum / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Gamle_r%C3%A5dhus_Oslo.jpg) | Lisensetikett samsvarer med kildesiden |
| 16 | Grev Wedels plass | Public domain | Helge Høifødt / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Grev_Wedels_plass1.JPG) | Lisensetikett samsvarer med kildesiden |
| 17 | Sofienbergparken | CC0 1.0 | Leonhard Lenz / Wikimedia Commons | [Original](https://commons.wikimedia.org/wiki/File:Sofienbergparken_Oslo_2022-08-17_03.jpg) | Lisensetikett samsvarer med kildesiden |

## Gjenstående akseptansepunkter før `v1`

1. **Kildestatus Grønlikaia:** CC BY-SA 4.0 og fotograf Anders Beer Wilse er bekreftet fra filens lisensside; gjennomfør fortsatt visuell krediteringskontroll av det avledede utsnittet i appen.
2. **Fiskehallen:** DigitaltMuseum oppgir `CC BY-SA` uten eksplisitt lisensversjon. Kontroller vilkårene for avledede WebP-utsnitt og avklar eksakt lisensversjon hvis relevant. Ikke finn på en versjon.
3. **Faktisk sluttbrukervisning:** inspiser kilde, fotograf, lisensbetegnelse/-lenke og beskjæringsangivelse på telefon og desktop for alle 17 steder. Et vellykket nettlesertestløp beviser ikke at juridisk relevant kreditering vises.
4. **Bilde- og fortellerpresisjon:** vurder at fotografiets motiv stemmer med stedsfortellingen. Frysja-fotoet viser Brekkefossen/vannkraftlandskap og må ikke presenteres som fabrikkbygninger; Trikkestallen er dokumentasjon fra 2016 og ikke garanti for dagens skilting.
5. **Historisk redaksjonell kontroll:** 503 spørsmål må vurderes for presisjon, gode distraktorer, repetisjon og kildebelegg ut over maskinell paritet. Fotografikontrollen godkjenner ikke disse spørsmålene.

## Frigivelsesregel

Behold de 17 som `v1_candidate` inntil kilde-/lisenskontroll, synlig bildekreditering, visuell motivkontroll og full redaksjonell sluttkontroll er gjennomført. Å slå sammen en teknisk/metadatarettende PR er ikke det samme som å godkjenne `v1`.
