# Birkelunden – fase 7B Historie audit v1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline: `main` etter fase 7A / PR #5257 / `2f43748cb4c07f31abfb07200f740121084d7ef5`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase 6 materialiserte fire history_layers og temporal_profile; fase 7A undertrykte untitled legacy Leksikon i popupen
LEGACY-STATUS: canonical Birkelunden Leksikon-owner er navngitt, har suppress_untitled_legacy_articles=true og chronology=[]
BESLUTNING: BEHOLD history_layers SOM ENESTE BRUKERRETTEDE HISTORIEEIER; kompletter ett konkret hull i eksisterende lag, ikke bygg parallell chronology
```

## Historieflaten før 7B

Birkelunden hadde fire canonical `history_layers`:

1. **Parken blir til** – 1860-årene–1882;
2. **Parken legges om** – 1916–1928;
3. **Møter, organisering og minnespor** – tidlig 1900-tall–1989;
4. **Parken blir del av et fredet kulturmiljø** – 1996–2006.

Lagene dekket anlegg/kommunal overdragelse, omlegging/paviljong, organisering/minnespor og fredningsprosessen. Det tredje laget manglet imidlertid ett verifisert og stedsspesifikt tidslag som allerede lå i `temporal_profile` og den kildegodkjente v4.2-artikkelen: navneformen **Bjerkelunden fra 1926 til 1955**.

## 7B-endringen

Det tredje laget beholdes som samme canonical ID og samme sorteringsposisjon, men tittelen presiseres til:

> **Navn, organisering og minnespor**

Sammendraget inkluderer nå, i tillegg til de allerede verifiserte organisasjons- og minnesporene:

- Bjerkelunden som offisiell navneform fra 1926;
- Birkelunden tilbake som navn i 1955.

Dette er ikke nye claims. Begge punktene er allerede kildebåret i fase-5-pakken og `popupDesc`.

## Temporal profile og chronology-eierskap

`temporal_profile` registrerer:

- anlegg i 1860-årene;
- kommunal overdragelse i 1882;
- omlegging 1916–1920;
- dagens musikkpaviljong i 1926;
- navneperioden Bjerkelunden 1926–1955;
- kulturmiljøfredning i 2006.

Etter 7B er disse hovedmarkørene representert i de fire synlige `history_layers`.

Det bygges **ikke** en Leksikon-chronology for å speile samme stoff. Fase 7A etablerte en canonical Birkelunden Leksikon-owner med `chronology: []` og `suppress_untitled_legacy_articles: true`. Den løsningen beholdes.

Birkelunden følger dermed samme én-visuell-eier-prinsipp som nyere Youngstorget-produksjon: `temporal_profile` er canonical struktur; `history_layers` er den brukerrettede Historie-flaten; en ekstra chronology skal bare materialiseres dersom den tilfører en egen dokumentert redaksjonell verdi.

## Runtimebevis

`js/ui/place-popup-v2.js`:

1. leser `place.history_layers` i `renderHistoryTimeline(place)`;
2. sorterer på `sort_order`;
3. renderer periode, tittel og sammendrag;
4. merker output som `.hg-place-history-section`.

`js/ui/place-popup-tabs.js` flytter denne seksjonen til Historie-fanen.

Leksikon-chronology har en separat runtimevei, men Birkelundens canonical Leksikon-owner har tom chronology. Den gamle untitled legacy-posten filtreres ut av popupens synlige artikkelsett gjennom 7A-suppressionen.

Ingen generell `temporal_profile`-renderer opprettes.

## Kilde- og placegrense

7B introduserer ingen nye kilder eller nye historiske påstander. Den bruker den allerede godkjente Birkelunden-claimbasen og bevarer skillet mellom:

- selve parken på 16,3 dekar;
- det fredede Birkelunden kulturmiljøet på ca. 116 dekar;
- separate nabosteder som Paulus kirke, Paulus' plass og Grünerløkka skole.

Produksjonsmodell/API-kreditter i 7B: **0**. Eksisterende verifisert evidence var tilstrekkelig; dette er ikke en reduksjon i innhold eller kvalitetskrav.

## Bevisst ikke endret

- `desc` eller `popupDesc`;
- production-pakken eller fase-5-hashene;
- koordinater, areal eller `spatial_profile`;
- `temporal_profile`;
- `nature_profile`;
- Leksikon-ownerens `wikiText`, `facts` eller `chronology`;
- popup-runtime;
- Stories, Før/etter, Nyheter, Lesespor, Kilder eller Språk;
- People, Objects, Brands, Quiz eller øvrige rundinger.

## Permanent regresjonslås

`tests/birkelunden-phase7b-history.test.mjs` låser at:

1. Birkelunden beholder fire canonical `history_layers` i sorteringsrekkefølgen 10/20/30/40;
2. hvert lag har periode, tittel og substansielt sammendrag;
3. historielagene dekker 1860-årene, 1882, 1916, 1926, 1955, 1996 og 2006;
4. tredje lag eksplisitt eier navneendringen Bjerkelunden → Birkelunden;
5. canonical Birkelunden Leksikon-owner fortsatt har `chronology: []` og suppression flagg;
6. legacy chronology ikke blir popup-synlig ved siden av history_layers;
7. popup-v2 fortsatt renderer `history_layers` og tabs-runtime flytter seksjonen til Historie;
8. ingen `renderTemporalSection()` introduseres.

Testen kjøres permanent fra `scripts/check-places.sh`.

## Kvalitetsvurdering før CI

1. Korrekthet/evidens: **5/5** – bare allerede verifiserte claims brukes.
2. Dekning: **5/5** – navnehistoriehullet i synlig Historie er lukket.
3. Redaksjonell kvalitet: **5/5** – ingen chronology-filler eller dobbeltpresentasjon.
4. Teknisk integritet: **4/5** – permanent gate er materialisert; endelig score krever grønn CI.
5. Sikkerhet/ansvarlighet: **5/5**.
6. Vedlikeholdbarhet/etterprøvbarhet: **5/5** – eiergrensen er eksplisitt testet.

Foreløpig: **29/30**. Fase 7B kan klassifiseres ferdig først etter grønn CI, merge og kontroll på fersk `main`.

Neste delsteg: **7C – Fortellinger**.
