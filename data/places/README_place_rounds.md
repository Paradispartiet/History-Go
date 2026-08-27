# History GO — canonical PlaceCard-samlinger

Status: **eneste autoritative PlaceCard-samlingskontrakt**  
Eier: `place_card_collections_contract_v2`  
Sist kontrollert: **2026-08-27**

Runtime: `js/ui/place-rounds-visual-collections.js`  
Adaptiv layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Schema: `data/places/regler/place_card_profile_v2.schema.json`  
Produksjonsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Produksjonsprofiler: `docs/PLACE_PRODUCTION_PROFILES.md`

## 1. Hovedregel

PlaceCard skal alltid se **kuratert, ferdig og stedseget** ut.

For nye og fullproduserte ordinære Places gjelder:

- `place_card_profile.collection_ids` inneholder **1–4 ferdige, relevante samlinger**;
- en valgt samling må ha minst ett ekte canonical medlem;
- hvert valgt preview må være et faktisk bilde av medlemmet;
- en samling uten kvalifisert innhold skal **ikke velges** og skal derfor ikke stå igjen som tomt kort;
- det er aldri lov å produsere filler for å nå et bestemt antall samlinger;
- færre samlinger skal fremstå som en bevisst komposisjon, ikke som et hull.

Micro Places følger `docs/MICRO_PLACE_CONTRACT.md` og skal ikke få ordinær `place_card_profile`.

## 2. Visuell komposisjon

`frontImage` er fortsatt den stående hovedflaten. Samlingene ligger ved siden av og tilpasses faktisk antall:

```text
1 samling  → stor, sentrert samling
2 samlinger → balansert par
3 samlinger → 2 + 1-komposisjon
4 samlinger → balansert 2 × 2
```

Formen følger semantikken:

- `people`, `flora`, `fauna` → sirkel;
- øvrige samlinger → avrundet rektangel;
- Badges står separat ved tittelen;
- Quiz står separat som handling og er aldri en samling.

Det skal ikke vises tomt «Ingen innhold ennå»-kort som ferdig PlaceCard-samling. Runtime kan ha fallback ved lastings-/datafeil, men adaptiv ferdigvisning skjuler en valgt samling uten reelt preview. Produksjonsgaten skal samtidig rapportere det manglende previewet som blocker.

## 3. `frontImage`

`frontImage` skal være en faktisk stående fil/variant (`height > width`), ikke bare et liggende bilde i en stående CSS-ramme.

Krav:

- motivet skal identifisere stedet godt;
- crop og outputdimensjoner dokumenteres;
- kilde, skaper/credit og lisens dokumenteres;
- `frontImage` kan aldri gjenbrukes som falskt preview for en samling.

## 4. Canonical profil

Eksempel med tre ferdige samlinger:

```json
{
  "place_card_profile": {
    "schema": "history_go_place_card_profile_v2",
    "collection_ids": ["people", "objects", "structures"],
    "reason": "Stedet har tre sterke, kildebelagte samlinger. Brand-kandidater ble vurdert, men ingen bestod Brand-kontrakten, så Brands vises ikke.",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Krav:

- `collection_ids` har 1–4 unike canonical IDs;
- maksimalt én kategori-eid samling kan bruke den delte kategori-plassen: `productions`, `structures`, `competitions`, `related` eller `destinations`;
- hver valgt ID må faktisk være produsert ferdig og ha lastbart bilde;
- `reason` forklarer hvorfor akkurat disse samlingene passer stedet;
- en ikke-valgt samling kan være `BEGRUNNET N/A` i arbeidskortet, men N/A skal aldri materialiseres som et tomt PlaceCard-kort;
- teknisk schema-PASS erstatter aldri redaksjonell eller visuell QA.

## 5. Kategori er kandidatstyring, ikke tvang

Kategoriens default brukes til legacy-kompatibilitet og research-ruting. Fullproduksjon velger bare samlinger som faktisk passer stedet.

Typiske kandidatsett:

| Kategori | Kandidater som normalt undersøkes |
| --- | --- |
| `naeringsliv` | People, Objects, Brands, Structures |
| `historie` | People, Objects, Related, eventuelt Structures |
| `by` | People, Objects, Brands, Structures |
| `religion` | People, Objects, Brands når reelt, Structures |
| `kunst` | People, Objects, Brands når reelt, Productions |
| `litteratur` | People, Objects, Brands når reelt, Productions |
| `musikk` | People, Objects, Brands når reelt, Productions |
| `film_tv` | People, Objects, Brands når reelt, Productions |
| `scenekunst` | People, Objects, Brands når reelt, Productions |
| `media` | People, Objects, Brands når reelt, Productions |
| `subkultur` / `popkultur` | People, Objects, Brands, Productions |
| `sport` | People, Objects, Brands, Competitions |
| `politikk` | People, Objects, Related |
| `vitenskap` / `filosofi` / `psykologi` | People, Objects når reelt, Related |
| `natur` | Flora, Fauna, Map, Destinations — bare når stedsspesifikt dokumentert |

Eksempler på korrekt fravalg:

- et historisk industristed uten selvstendig merkeidentitet viser ikke Brands;
- et sted uten en sentral canonical person viser ikke People;
- ett fysisk spor skal ikke splittes kunstig til både Object og Structure;
- et natursted uten dokumentert stedsspesifikk fauna viser ikke Fauna.

## 6. Canonical samlingspool

```text
people
objects
brands
map
flora
fauna
productions
structures
competitions
related
destinations
```

Miljø/gjenbruk har i tillegg sine egne underkategorisamlinger:

```text
reuse
materials
environment
systems
```

`badges` er separat og inngår ikke i poolen.

Følgende er **ikke** PlaceCard-samlinger:

- Bilder / `images`;
- generisk `works`, `details`, `spots` eller `nature`;
- Civication eller Wonderkammer;
- Før/etter, Fortellinger, Leksikon, Nyheter, Lesespor;
- `Spor og objekter`, `Legg merke til`, Relasjoner, Betydning, Motpunkter, Kunnskap eller Observasjoner som egne flater;
- Quiz eller Rute.

## 7. People

People viser canonical personer med dokumentert direkte stedstilknytning.

- en perifer person produseres ikke for å fylle layouten;
- en personkobling som egentlig eies av et separat canonical delsted brukes ikke som proxy;
- People-previewet bruker personens bilde og filtrerer ikke hvem som finnes i People-popupen;
- personrelasjoner kan vises inne i People-popupen, men teller ikke som en egen samling.

## 8. Objects

Objects er fysiske, identifiserbare gjenstander med dokumentert stedstilknytning.

- canonical eier er `place.objects`;
- `artifacts` eller fysiske Civication-poster kan brukes som compatibility-kilder når de faktisk består Objects-kontrakten;
- observasjonstekst eller et fysisk bygg skal ikke omdøpes til Object for å få et kort;
- `Spor og objekter` og `Legg merke til` kan være underseksjoner i Objects-popupen uten å øke Objects-antallet.

## 9. Brands

Brands følger `data/brands/brand_rules_v1_1.json`.

- virksomhetsnavn er ikke automatisk et Brand;
- stedets navn er ikke automatisk et Brand;
- en historisk aktør, entreprenør eller institusjon kvalifiserer bare når Brand-definisjonen faktisk består;
- valgt Brand må ha verifisert lokalt logo-/brandmark-asset;
- et sted uten kvalifisert Brand skal ganske enkelt ikke vise Brands-samlingen.

## 10. Productions

`productions` brukes når produksjoner er et naturlig brukerbegrep:

- Kunstverk;
- Bøker og tekster;
- Sanger og album;
- Filmer og serier;
- Forestillinger;
- Utgivelser;
- Uttrykk og utgivelser.

En fysisk gjenstand og en produksjon er forskjellige entities. Ikke dupliser samme ting mellom Objects og Productions.

## 11. Structures

`structures` betyr navngitte bygninger og anlegg som utgjør en reell samling ved stedet.

- samme fysiske element skal ikke dupliseres i Objects;
- ett enkelt spor skal ikke splittes kunstig i flere Structures;
- separate canonical Places vises som relasjoner, ikke Structures hos parent-stedet.

## 12. Related

`related` viser andre faktiske History GO Places med dokumentert relasjon.

- bare place→place-relasjoner;
- ingen løse temaord eller tekstlige «relasjoner»;
- et relaterte sted skal ikke samtidig gjøres til Object eller Structure hos parent-stedet.

## 13. Competitions

`competitions` viser dokumenterte kamper, løp, finaler, stevner eller turneringer ved sportsstedet.

Utøvere hører i People, fysiske pokaler/drakter i Objects og kvalifiserte klubb-/venue-identiteter i Brands.

## 14. Map, Flora, Fauna og Destinations

Natursteder skal være like strenge som andre steder:

- `map` må være et faktisk detaljkart for stedet;
- `flora` og `fauna` må være dokumentert stedsspesifikt;
- `destinations` må være faktiske navngitte turmål;
- generiske arter eller generelle naturomgivelser skal ikke brukes som filler.

Et natursted kan derfor ha 1–4 naturrelevante samlinger avhengig av faktisk dokumentasjon.

## 15. Bakoverkompatibilitet

Eksisterende Places migreres ikke samlet bare fordi denne kontrakten innføres.

- legacy `round_profile` leses fortsatt gjennom kompatibilitetsadapteren;
- steder uten eksplisitt ny profil kan fortsatt få den gamle firefelts-defaulten;
- når et sted fullproduseres/revideres, skal det få eksplisitt `place_card_profile` med 1–4 faktisk ferdige samlinger;
- gammelt korrekt innhold slettes ikke bare fordi den nye kuraterte profilen er mindre.

## 16. Produksjonsgate

Et ordinært PlaceCard er ferdig når:

1. `frontImage` er stående, stedstro og har full proveniens;
2. `place_card_profile` inneholder 1–4 relevante samlings-ID-er;
3. hver valgt samling har minst ett canonical medlem;
4. hvert valgt samlingskort viser et faktisk lastet bilde av et medlem;
5. ingen tom samling vises;
6. ingen filler-entity er produsert for å øke samlingsantallet;
7. riktig samlingsform brukes;
8. 1-, 2-, 3- eller 4-samlingslayouten er visuelt balansert på mobil og desktop;
9. hver samling åpner riktig popupinnhold og datakilde;
10. own-place-/entity-grenser er intakte;
11. Badges/Fagverk og Quiz-handling ligger separat etter sine egne kontrakter;
12. schema, renderer, layout og permanente tester passerer;
13. manuell slutt-QA vurderer kortet som **pent, tilsiktet og komplett for akkurat dette stedet**.

**Stoppgate:** En fullprodusert PlaceCard kan aldri lukkes med et synlig tomt samlingskort. Hvis en valgt samling mangler entity eller bilde, er produksjonen blokkert til samlingen enten ferdigstilles eller fjernes fra `collection_ids` fordi den ikke hører til stedet.

## Kort regel

**Vis bare det stedet faktisk har — men vis det ordentlig. 1–4 ferdige samlinger, ingen tomme kort, ingen filler, alltid en balansert PlaceCard-komposisjon.**
