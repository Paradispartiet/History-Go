# Birkelunden – fase 7D Før/etter audit v1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline: fersk `main` `fe97609bb188f2170845bce22c6dcb93b0732f16`
- Canonical place: `data/places/by/oslo/places/birkelunden.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Presedens: Torggata fase 7D
- Status: **KLAR FOR REVIEW / CI**

## Tidligere-arbeid-gate

```text
CANONICAL for_na FØR 7D: ingen
BIRKELUNDEN FØR/ETTER-TEST: ingen
EGET CANONICAL DELSTED SOM PROXY: ikke tillatt
BESLUTNING: materialiser ett park-eid, rettighetsklart og datert bildepar
```

## Valgt bildepar

### Før – Birkelunden, ca. 1930

Oslo Museum / Oslobilder:

- objekt: `OB.Z02741`;
- tittel: `Oslo - Birkelunden`;
- datering: ca. 1930;
- fotograf: Mittet & Co;
- avbildet sted: Birkelunden, Grünerløkka, Oslo;
- katalogisert motiv: park, musikkpaviljong, lekeplass, lekeapparater, benker, barn og kvinner;
- kilde: `https://oslobilder.no/OMU/OB.Z02741`;
- medie-URL: `https://ems.dimu.org/image/012sB3HjP2a4?dimension=1200x1200`;
- korrekt kreditering etter Oslobilder: `Mittet & Co / Oslo Museum (OB.Z02741)`;
- lisensopplysning på Oslobilder: `Creative Commons 3.0`.

Kilden spesifiserer ikke en mer detaljert CC-undertype i den verifiserte katalogteksten. Canonical data lagrer derfor **Creative Commons 3.0** og gjetter ikke `BY`, `BY-SA` eller en annen undertype.

Bildet er stedseid: katalogen identifiserer Birkelunden som avbildet sted og selve parken som motiv. Det er ikke et bilde av Paulus kirke, Grünerløkka skole eller det større kulturmiljøet brukt som stedfortreder.

### Etter / moderne sammenligningslag – 13. oktober 2013

Wikimedia Commons:

- fil: `Birkelunden fountain and music pavilion.jpg`;
- dato: 2013-10-13;
- fotograf: Carsten R D;
- motivbeskrivelse: fontenen og musikkpaviljongen i Birkelunden;
- kilde: `https://commons.wikimedia.org/wiki/File:Birkelunden_fountain_and_music_pavilion.jpg`;
- original medie-URL: `https://upload.wikimedia.org/wikipedia/commons/c/ca/Birkelunden_fountain_and_music_pavilion.jpg`;
- lisens: `CC BY-SA 4.0`;
- kamera-posisjon: `59.926374, 10.760091`.

Commons oppgir eksplisitt dato, egenprodusert fotografi, fotograf og CC BY-SA 4.0.

## Hvorfor 2013 kan brukes – og hva det ikke er

`for_na`-kontrakten krever en meningsfull før/etter-sammenligning; feltet heter teknisk `nowImage`, men eksisterende production-data bruker daterte moderne bilder og gjør ikke inneværende kalenderår til et schema-krav.

Birkelunden-paret kalles derfor eksplisitt:

> **Birkelunden ca. 1930 og 2013**

2013-bildet omtales som et **moderne sammenligningslag**, ikke som dokumentasjon av parkens eksakte tilstand i 2026. Denne begrensningen står også i brukerrettet `now`-tekst og er låst i testen.

Et nyere bilde ville vært foretrukket dersom det hadde samme motivkvalitet og en fullstendig verifisert rettighetskjede. Aktualitet får imidlertid ikke overstyre bildeidentitet, sammenlignbarhet eller gjenbruksrettigheter.

## Visuell sammenlignbarhet

Paret er valgt fordi begge bildene viser det sentrale parkrommet og har to sterke, stedseide ankre:

1. **musikkpaviljongen fra 1926**;
2. **vann-/fonteneområdet**, etablert som basseng i 1927–28.

Det historiske motivet er fra kort tid etter at disse elementene kom på plass. Det moderne bildet viser de samme sentrale elementene i et senere parklandskap.

Kameraposisjonen og utsnittet er ikke identiske. 7D hevder derfor ikke fotografisk re-fotografering fra samme koordinat. Sammenligningsverdien ligger i at de samme fysiske parkankrene gjør tidsspranget lesbart uten å bytte til et annet sted.

## Hva teksten får si

`before`, `now` og `change` er avgrenset til:

- museumskatalogens identifikasjon av 1930-motivet;
- den dokumenterte paviljongen fra 1926;
- vannbassenget fra 1927–28;
- synlig kontinuitet i parkrommets fysiske ankre;
- at vegetasjon, møblering, lekeutstyr og brukssituasjon ikke er identiske.

Bildene brukes **ikke** som selvstendig bevis for:

- dagens aktivitetsnivå;
- sosial sammensetning;
- årsaker til bruksendringer;
- parkens eksakte tilstand etter 2013;
- forhold i kulturmiljøets bygårder eller nabosteder.

## Avviste kandidater

| Kandidat | Resultat | Begrunnelse |
| --- | --- | --- |
| Oslo Museum ca. 1930 + Commons 2013 paviljong/fontene | **Valgt** | Selve parken, sterke felles ankre, lang tidsdybde og verifiserte rettighetskjeder. |
| Riksantikvaren ca. 1905 | Avvist som primærpar | Sterkt historisk parkmotiv, men rettighetskjeden for akkurat den viste nettsidefilen ble ikke fullstendig verifisert i denne produksjonsrunden. |
| Riksantikvaren/Kulturminnebilder 1900–1930 via Commons | Reserve | Lovende og public-domain-indikert, men valgt Oslo Museum-motiv ga sterkere dokumentert motivmetadata mot paviljong/vann-paret. |
| Birkelunden Commons 2022-filer | Avvist foreløpig | Filene ble identifisert i Commons-kategorien, men full filside/forfatter/lisens lot seg ikke stabilt hente i denne kjøringen. Ingen metadata gjettes. |
| Journalen/OsloMet 2025 | Avvist | Nyere bilde av paviljongen, men ingen fri gjenbrukslisens ble etablert. |
| Thorvald Meyers gate nedenfor Birkelunden 2024 | Avvist | Viser gaten nedenfor parken og kan ikke erstatte selve Birkelunden som primærmotiv. |
| Canonical Birkelunden-hovedbilde 2015 | Avvist som 7D-par | Rettighetsklart, men svakere motivmessig samsvar med ca. 1930-bildets paviljong/vann-akse. |

## Place-grense

Fase 6 låste Birkelunden til selve parken på 16,3 dekar. 7D følger samme grense.

Ikke tillatte stedfortredere som hovedpar:

- Paulus kirke;
- Paulus' plass;
- Grünerløkka skole;
- omkringliggende bygårder;
- Thorvald Meyers gate;
- det ca. 116 dekar store kulturmiljøet som helhet.

De kan finnes i bakgrunnen, men må ikke bære identiteten til hovedparet.

## Canonical `for_na`

Materialisert med:

- eksplisitt datert tittel;
- to eksterne HTTPS-mediefiler;
- separate bildeetiketter;
- separate `beforeImageMeta` / `nowImageMeta` med kilde, fotograf, kreditering, lisens og dato;
- tre substansielle tekstfelt `before`, `now`, `change`;
- tre konkrete `lookFor`-observasjoner;
- fire inspectable user-facing kilder.

`desc` og `popupDesc` er urørt og skal beholde fase-5-hashene.

## Permanent regresjonslås

`tests/birkelunden-phase7d-before-after.test.mjs` låser:

1. tittelen `Birkelunden ca. 1930 og 2013`;
2. Oslobilder-objekt `OB.Z02741`, Mittet & Co og kildens faktiske `Creative Commons 3.0`-formulering;
3. Carsten R D, Commons-fil, dato, kamera-posisjon og `CC BY-SA 4.0`;
4. substansielle og kildeavgrensede `before`, `now`, `change`;
5. eksplisitt 2013/2026-begrensning;
6. paviljong og vannområde som felles observasjonsankre;
7. fire inspectable HTTPS-kilder;
8. at canonical `desc` / `popupDesc`-hashene og `area_m2=16300` forblir urørt;
9. at eksisterende `for_na`-runtime og bildeattribusjonsruntime fortsatt finnes.

Testen kjøres permanent fra `scripts/check-places.sh` etter 7A og 7B.

## Økonomi

Produksjonsmodell/API-kreditter i 7D: **0 eksterne modellkall**. Arbeidet brukte repo-evidence, offentlige kataloger, Commons-metadata og bilde-QA. Ingen innholdsmengde eller kvalitetskrav ble redusert.

## Kvalitetsvurdering før CI

1. Korrekthet/evidens: **5/5**
2. Visuell stedseierskap/sammenlignbarhet: **5/5**
3. Redaksjonell ærlighet om datoer og inferens: **5/5**
4. Teknisk integritet: **4/5** – endelig 5 krever grønn CI
5. Rettigheter/proveniens: **5/5**
6. Vedlikeholdbarhet: **5/5**

Foreløpig **29/30**. Fase 7D er ferdig først etter grønn CI og merge.

Neste delsteg: **7E – Nyheter**.
