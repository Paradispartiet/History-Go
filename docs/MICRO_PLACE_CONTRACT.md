# History GO — Micro Place Contract v1

Status: **canonical**  
Eier: `micro_place_contract`  
Sist kontrollert: **2026-08-25**

Denne kontrakten definerer en lettvektsvariant av et canonical History GO-Place for små, konkrete og selvstendig oppdagbare punkter som fortjener **egen kartprikk**, men som ikke trenger hele produksjonsbredden til et ordinært sted.

Kontrakten svekker aldri faktisitet, koordinatkrav eller identitetskontroll. Den reduserer bare hvilke innholdsflater som er obligatoriske når objektets dokumenterte omfang er lite.

## 1. Når `placeTier: "micro"` skal brukes

Et Micro Place skal brukes når alle disse er sanne:

1. objektet er et reelt, fysisk eller offentlig lesbart punkt;
2. objektet har en egen identitet som kan kildebelegges;
3. brukeren har nytte av å finne objektet direkte på kartet;
4. punktet skal beholde sin egen fagkategori og kartfarge selv om det står ved eller inni et større History GO-sted;
5. det ville være kunstig å fylle People, Brands, Stories, fire PlaceCard-samlinger, full quiz og alle ordinære popupflater bare for å tilfredsstille standardstedets fullness-regler.

Typiske eksempler:

- Lesekiosker, bokskap og bokbyttepunkter;
- miljøstasjoner og små retur-/innsamlingspunkter;
- dokumenterte gratis ombruks-/gi-bort-punkter;
- blå skilt og andre små offentlige minneplaketter;
- snublesteiner og små minnesteiner;
- andre små, varige eller tydelig forvaltede kultur-, kunnskaps- eller servicepunkter.

Et objekt skal **ikke** gjøres til Micro Place bare for å slippe ordinær produksjon. Hvis objektet egentlig er en park, bygning, institusjon, virksomhet, arena, gate, historisk område eller annet rikt sted, brukes ordinær Place-produksjon.

## 2. Eget Place, ikke skjult subplace

Når et Micro Place trenger egen kartprikk, skal det være et selvstendig canonical Place.

Eksempel:

- `Bislett stadion` kan være et ordinært Sport-Place;
- en Lesekiosk ved stadion kan samtidig være et eget `litteratur`-Place med `placeTier: "micro"`;
- kiosken kan ha `parent_place_id` eller `related_place_ids` som peker til Bislett stadion;
- kiosken arver **ikke** Sport-kategori fra parent og mister ikke Litteratur-prikken.

Et lite element som ikke trenger egen oppdagbar kartidentitet skal fortsatt være `subplace`, `detail`, `object`, `spot` eller annen eksisterende understruktur hos riktig eier.

## 3. Canonical datafelt

Et aktivt Micro Place skal minst ha:

```json
{
  "id": "...",
  "name": "...",
  "lat": 59.0,
  "lon": 10.0,
  "category": "litteratur",
  "subcategory_id": "lesekiosker",
  "placeTier": "micro",
  "desc": "Kort, kildebåret forklaring på hva punktet er og hvorfor det er relevant.",
  "micro_place_profile": {
    "schema": "history_go_micro_place_profile_v1",
    "kind": "lesekiosk",
    "currentStatus": "active",
    "sourceUrl": "https://...",
    "sourceLocation": "Konkret side/avsnitt/oppføring som identifiserer punktet",
    "verifiedAt": "2026-08-25",
    "quizMode": "none"
  }
}
```

I tillegg er hele den relevante koordinatkontrakten obligatorisk: `locatorType`, `sourceProvider`, stabil `sourceObjectId` eller strukturert `address`, `geocodeAccuracy`, `coordRole`, `coordType`, `coordStatus` og `coordNote`.

### `subcategory_id`

`subcategory_id` skal finnes som aktiv underkategori under stedets `category` i `data/categories/category_contract.json`.

Underkategori bestemmer **ikke** kartfargen. Kartprikken bruker fortsatt toppkategorien. En Lesekiosk med `category: "litteratur"` og `subcategory_id: "lesekiosker"` skal derfor vises som en vanlig Litteratur-prikk.

### `micro_place_profile.kind`

`kind` beskriver fysisk/funksjonell mikrotype. Første canonicale typer er:

- `lesekiosk`;
- `bokskap`;
- `miljostasjon`;
- `ombruk_gratis`;
- `minneskilt`;
- `snublestein`;
- `annet_dokumentert_mikrosted`.

### `currentStatus`

Tillatte statuser:

- `active` — punktet er ferskverifisert som tilgjengelig/eksisterende;
- `temporary_unavailable` — punktet er midlertidig fjernet, stengt eller under flytting;
- `historic` — objektet er historisk og skal bare beholdes dersom den historiske kartidentiteten er meningsfull og kildebelagt.

Nåtidsstatus skal ha fersk kontroll. Et gammelt kartpunkt kan aldri automatisk stå som aktivt.

## 4. Minimumskrav for produksjonsklar Micro Place

Følgende er harde PASS-krav:

- canonical identitet og duplikatsøk;
- egen `id` og manifest-loadet source-fil;
- korrekt `category` og aktiv `subcategory_id`;
- full koordinatkontrakt og korrekt fysisk anker;
- minst én inspectable HTTPS-kilde som direkte dokumenterer identitet/funksjon;
- fersk statuskontroll når stedet er aktivt eller midlertidig utilgjengelig;
- kort, source-led `desc` uten gjetning eller filler;
- `micro_place_profile` etter schema;
- kartindeksen bevarer `placeTier` og `subcategory_id`;
- punktet får egen kartprikk i toppkategoriens farge;
- PlaceCard åpner i micro-modus uten kunstig 2 × 2-samlingsgrid;
- kilde eller kildelenke kan inspiseres fra brukerrettet informasjon når runtimeflaten støtter dette;
- hovedbilde brukes når et identitetskontrollert og tillatt bilde finnes; ellers brukes ærlig ikon-/mediefallback i stedet for feil eller generisk bilde.

## 5. Hva som ikke er obligatorisk for Micro Place

Følgende er **ikke obligatorisk** bare fordi objektet er et Place:

- fire PlaceCard-samlinger;
- People;
- Objects/Works/Brands som egne samlingsflater;
- egen Fagverk-sted-side;
- Story;
- Før/etter;
- Nyheter;
- Lesespor;
- Språkleksikon eller dialekt;
- rute;
- Knowledge/Aha-pakke;
- full `popupDesc`-artikkel;
- Quiz.

Dette er en kontraktsbestemt avgrensning, ikke en glemt kontroll. Et Micro Place skal ikke fylles med svakt innhold for å etterligne et ordinært sted.

Dersom en konkret kiosk, plakett eller mikroarena faktisk har rikt dokumentert stoff, kan relevante subsystemer legges til. Da gjelder subsystemets vanlige kontrakt fullt ut for den flaten som aktiveres.

## 6. Quiz

`micro_place_profile.quizMode` styrer om Micro Place har egen quiz:

- `none` — standard. Quiz-knappen skal ikke vises og manglende quiz er ikke et produksjonsgap;
- `place` — stedet har egen quiz. Da gjelder `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` fullt ut.

En samling av mange like mikro-steder kan senere få en felles kategori-/rutequiz uten at hvert enkelt punkt trenger egen quiz.

## 7. PlaceCard og popup

Micro Place bruker en kompakt presentasjon:

- navn;
- toppkategori og eventuell synlig mikrotype;
- hovedbilde eller robust fallback;
- `desc`;
- relevant nåtidsstatus;
- fysisk besøk/favoritt der eksisterende runtime støtter det;
- Mer info/kilder;
- relasjon til parent/nabosted når den faktisk hjelper brukeren.

Det ordinære 2 × 2-feltet med fire samlinger skjules. Badge/Fagverk-handlingen er ikke obligatorisk. Quiz skjules når `quizMode: "none"`.

Micro Place skal ikke vise tomme standardflater bare for å se ut som et fullprodusert sted.

## 8. Faktisitet og koordinater svekkes aldri

Følgende kontrakter gjelder uten reduksjon:

- `docs/FACTUALITY_CONTRACT.md`;
- `docs/coordinates/coordinate-source-contract-v1.md`;
- `docs/DATA_PRODUCTION_CONTRACT.md` for canonical source/manifest/index;
- bildeidentitet, lisens og attribusjon for alle publiserte bilder.

Det er uttrykkelig forbudt å bruke Micro Place som snarvei rundt kildekrav.

## 9. Forholdet til ordinær Place Production Checklist

`docs/PLACE_PRODUCTION_CHECKLIST.md` og `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` gjelder fortsatt fullt ut for ordinære steder.

Når `placeTier: "micro"` er validert etter denne kontrakten, erstatter denne filens **Micro Place completion** de ordinære fullness-kravene som eksplisitt er listet som ikke obligatoriske i §5. Alle felles krav til identitet, faktisitet, koordinat, canonical source, bilder og faktisk UI-QA består.

Et Micro Place som mangler en obligatorisk micro-gate kan ikke godkjennes ved å vise til at objektet er lite.

## 10. Første canonicale underkategorier

Første aktive micro-underkategorier er:

- `litteratur / lesekiosker` — røde telefonkiosker og tilsvarende organiserte bokkiosker;
- `natur / miljostasjoner` — små miljøstasjoner/innsamlingspunkter med egen fysisk destinasjon;
- `natur / ombruk_og_gratis` — dokumenterte steder der privatpersoner kan hente gjenstander gratis til ombruk.

En stor gjenvinningsstasjon, butikk, organisasjon eller institusjon skal ikke automatisk være Micro Place. `placeTier` avgjøres av selve History GO-objektets omfang, ikke av temaet.

## Kort regel

> **Egen oppdagbar prikk + liten fysisk identitet = vurder Micro Place. Behold full faktisitet og koordinatkontroll, men ikke tving små punkter gjennom et kunstig fullsted.**
