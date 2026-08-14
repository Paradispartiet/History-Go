# Torggata – fase 7D Før/etter audit V2

- Dato: 2026-08-14
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Kvalitetsbacklog: `reports/place-production/torggata-quality-improvement-backlog-v1.json`
- Baseline: manuell kvalitetskritikk merget i PR #4972, merge `64530b81e86e52909b893495dc8f093bd8a341f2`
- Status: **KLAR FOR REVIEW – NYTT GAMMEL–NÅ-PRIMÆRPAR**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE 7D-PAR: 2009 fra Youngstorget + 2017 fra et annet Torggata-utsnitt
MANUELT AVVIK: ulike gateutsnitt, kort tidsdybde og et «etter»-bilde som ikke lenger er et faktisk nåbilde
BESLUTNING: ERSTATT PRIMÆRPARET – behold bare kildebårne fakta om gateombyggingen
```

## Ny global identitetsport

Før motivvalg skal canonical place-register/manifester kontrolleres. Et bygg, en virksomhet, en park, en plass eller et annet delsted med egen History GO-place kan ikke fungere som primært Før/etter-stedfortreder for et overordnet place.

Denne regelen er lagt inn i:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`;
- `docs/PLACE_POPUP_SYSTEM.md`;
- Torggatas kvalitetsbacklog og workcard;
- `tests/place-card-for-na-torggata.test.js`.

### Eksplisitt avvist kandidat: Torggata Bad

Torggata Bad kunne gitt et visuelt tettere arkiv-/nå-par, men badet er et eget History GO-place. Det ble derfor avvist som hovedpar for `torggata`. Et par for Torggata skal vise selve gaten; badet kan eventuelt lenkes som eget sted eller brukes som tydelig merket supplement i en annen sammenheng.

Dette er en identitetsstoppgate, ikke en vurdering av hvor gode bad-bildene isolert sett er.

## Valgt primærpar

### Før – Torggata 30–36 mot Hausmanns gate, ca. 1965

- objekt: Oslo Museum `OB.A11305`;
- tittel: «Torggata mot Hausmanns gate»;
- datering: ca. 1965;
- fotograf: Henrik Ørsted;
- motiv: Torggata 30–36, gateprofilen og retningen mot Hausmanns gate/Ankertorget;
- kilde: https://www.oslobilder.no/OMU/OB.A11305;
- lisens: CC BY-NC-ND 3.0 NO;
- mediaversjon: Oslo Museums uendrede `decoimage` med innebygd kreditering.

Bildet viser fasaderekken på venstre side, den asfalterte kjørebanen, bilbruk og gateaksen fram mot trærne ved Ankertorget.

### Nå – samme gateakse, 27. mars 2025

- KartaView sequence: `10723145`;
- frame/sequence index: `5`;
- photo ID: `2551570473`;
- dato: 2025-03-27;
- koordinat: 59.917304 / 10.754085;
- heading: 41.02°;
- kilde: https://kartaview.org/details/10723145/5/track-info;
- lisens: CC BY-SA 4.0;
- påkrevd kreditering: © Grab and KartaView Contributors;
- lisens-/attribusjonskontroll: https://kartaview.org/terms.

KartaView har sladdet identifiserbare ansikter. Den viste mediefilen er den behandlede, uendrede `proc`-versjonen.

## Visuell sammenlignbarhet

Paret er valgt fordi brukeren kan finne de samme faste orienteringspunktene umiddelbart:

1. den sammenhengende fasaderekken Torggata 30–36 på venstre side;
2. samme retning nordøst mot Hausmanns gate;
3. trærne og åpningen ved Ankertorget i enden av gateaksen;
4. sammenlignbar gatehøyde og målestokk.

Kameraposisjonene er ikke matematisk identiske, men begge fotografiene står i samme korte gatesegment, peker samme vei og viser den samme fasaderekken som hovedanker. Dette er et reelt re-fotograferingsnært gatepar, ikke to løsrevne bilder fra ulike deler av Torggata.

## Hva bildene bærer

`before`, `now` og `change` er avgrenset til synlige og kildebårne forhold:

- asfaltlagt, bilpreget kjørebane omkring 1965;
- steindekke og tydeligere gang-/sykkelprioritering i 2025;
- mer rom for ferdsel og opphold etter ombyggingen i 2013–2014;
- den samme fasaderekken som stabilt orienteringspunkt.

Bildene brukes ikke som selvstendig bevis for husleie, fortrengning eller automatisk sosial effekt.

## Avviste spor

| Kandidat | Resultat | Begrunnelse |
| --- | --- | --- |
| 2009 fra Youngstorget + 2017 fra annet utsnitt | Avvist som primærpar | Ulike kamerastandpunkter, liten historisk dybde og intet faktisk nåbilde. |
| Youngstorget ca. 1875 + nyere oversiktsbilder | Avvist | Torggata-innløpet var ikke tydelig nok gjentatt fra sammenlignbar retning og målestokk. |
| Torggata fra Stortorvet 1863–1870 + nyere enkeltbygg | Avvist | Nybildet viste bygning, ikke samme gateakse. |
| Torggata Bad historisk + nå | Avvist for `torggata` | Badet har egen place-oppføring og kan ikke erstatte parent-place Torggata. |
| Torggata 30–36 ca. 1965 + KartaView 2025 | Valgt | Samme gatesegment, retning, fasaderekke og faktisk nåbilde. |

## Rettighets- og driftsgrense

Det historiske fotografiet har den restriktive lisensen CC BY-NC-ND 3.0 NO. Det vises uendret fra Oslo Museums medietjeneste med kreditering og skal ikke bearbeides eller brukes utenfor ikke-kommersiell visning uten ny rettighetsavklaring. KartaView-bildet er CC BY-SA 4.0 og krediteres nøyaktig slik KartaView krever.

Hvis produktets distribusjon blir kommersiell, er det historiske bildet en eksplisitt rettighetsblokkering som må erstattes eller klareres før videre bruk.

## Manuell bilde-QA

Begge mediefilene ble åpnet i original/tilstrekkelig høy oppløsning 2026-08-14.

- identitet: Torggata 30–36 og retningen mot Hausmanns gate er bekreftet;
- sammenlignbarhet: samme fasaderekke og samme gateakse er synlig i begge;
- historisk dybde: ca. 60 år;
- faktisk nålag: 2025;
- personvern: KartaView-versjonen har sladdede ansikter;
- Torggata Bad: ikke brukt.

Automatiske tester kan låse URL-er, datoer og tekstankre, men de beviser ikke alene at paret fungerer visuelt. Den manuelle bilde-QA-en er derfor separat evidens.

## Regresjonslås

`tests/place-card-for-na-torggata.test.js` låser:

1. ca. 1965 mot 2025;
2. Torggata 30–36 og Hausmanns gate i begge tekster;
3. to forskjellige, korrekte rettighetskjeder;
4. KartaView-koordinat, heading og photo ID;
5. samme gateakse som observerbar sammenligningsinstruks;
6. fravær av gammel tekst om ulike kamerastandpunkter;
7. global regel mot å bruke own-place-dellokasjoner som parent-place-stedfortreder;
8. eksplisitt avvisning av Torggata Bad i dokumentasjonen.

**Fase 7D kan godkjennes etter grønn CI, PR-review og squash-merge.**
