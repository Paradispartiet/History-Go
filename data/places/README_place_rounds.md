# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-08-03**

Denne filen er det eneste dokumentet som bestemmer **hva som er en PlaceCard-runding, hvor badge-rundingen plasseres, hvor mange øvrige rundinger et sted har og hvilke rundinger som brukes**. Andre dokumenter og schemaer skal peke hit og skal ikke vedlikeholde egne rundingslister.

> **Rundingen er en visuell inngang. Previewet er for syns skyld og skal aldri filtrere eller redefinere innholdet bak.**

## 1. Fast regel: én badge og tre rundinger

Et PlaceCard viser **alltid én badge-runding øverst til høyre ved stedsoverskriften** og **nøyaktig tre øvrige rundinger på én horisontal rad til høyre for `frontImage`**.

De åtte monokrome stedspopup-ikonene ligger rett under de tre rundingene, fortsatt til høyre for `frontImage`. Popup-ikonene er ikke rundinger.

Badge-rundingen teller ikke som en av de tre rundingene i mediefeltet. Det finnes ikke en 4-, 6-, 9- eller 12-rundersvariant i mediefeltet.

## 2. Vanlige steder

Vanlige steder bruker dette faste oppsettet:

```text
badge ved overskriften: badges
rundinger ved frontImage: people · objects · brands
```

- `badges` = Merker;
- `people` = People;
- `objects` = Gjenstander;
- `brands` = selvstendige, sosialt gjenkjennelige Brand-identiteter med dokumentert stedskobling, etter `data/brands/brand_rules_v1_1.json`.

**Vanlige steder skal aldri ha Kart-runding.** `map` er ikke del av den vanlige profilen og kan ikke introduseres gjennom legacy `rounds`, aliaser eller fallback.

## 3. Natursteder

Canonical natursteder bruker dette faste oppsettet:

```text
badge ved overskriften: badges
rundinger ved frontImage: map · flora · fauna
```

På natursteder erstatter **Flora** og **Fauna** People og Gjenstander. Natursteder bruker derfor ikke `people` eller `objects` som PlaceCard-rundinger.

### Kart på natursteder

`map` er et **eget tur-/naturkart** for naturstedet. Et vanlig detaljkart, et generisk bykart eller History GOs hovedkart med mer zoom er ikke tilstrekkelig.

For norske natursteder er canonical førsteversjon:

1. **Kartverkets `toporaster` WMTS** som turkartgrunnlag;
2. **Kartverkets Nasjonale database for turruter / Turrutebasen WMS** som eget rutelag for registrerte fotruter, sykkelruter, skiløyper og andre ruter;
3. **Miljødirektoratets Naturtyper på land (NiN)** som valgfritt naturfaglig kartlag.

Runtime-eier er `js/ui/nature-detailed-map.js` gjennom `HGNatureDetailedMap`. Kartflaten er separat fra History GOs ordinære `window.map` og skal aldri delegere til eller manipulere hovedkartet.

Kartet skal, når kildene faktisk har data, kunne vise:

- turkartets terreng, vann og topografiske detaljer;
- registrerte turruter fra Turrutebasen;
- stedets canonical koordinat som orienteringsanker;
- kartlagte NiN-naturtyper som et valgfritt faglag.

Det skal **ikke**:

- finnes på vanlige steder;
- bruke hovedkartet som fallback;
- dikte opp manglende stier, ruter, turmål, vernegrenser eller artslokaliteter;
- vise presise artsobservasjoner uten at presisjon og sensitive funn er eksplisitt håndtert.

Artsmappingen som eies av `README/nature_mapping_workflow.md` og `js/nature_place_map_bridge.js` er kilde for Flora/Fauna-koblinger. Den er **ikke** i seg selv turkartet. Artskart kan brukes som fagkilde/ekstern kartinngang, men er ikke automatisk punktlag i History GO.

Kartkilder i førsteversjonen:

- `https://cache.kartverket.no/` — Kartverkets offisielle WMTS; `toporaster` er turkartlaget;
- `https://wms.geonorge.no/skwms1/wms.friluftsruter2` — Turrutebasen WMS;
- `https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer` — Naturtyper på land (NiN).

Kildekreditering og lisenskrav skal beholdes i kartflaten.

## 4. Hele canonical rundingspoolen

```text
badges
people
objects
brands
map
flora
fauna
```

`badges` er badge-rundingen ved overskriften. `map`, `flora` og `fauna` er naturspesifikke rundinger i mediefeltet.

Følgende er uttrykkelig **ikke** rundinger:

- `nature`;
- `works` / Verk;
- `details` / Detaljer;
- `spots` / Punkter;
- Civication;
- Før/nå;
- Fortellinger/Stories;
- Leksikon;
- Lek;
- Trening;
- Oppgaver;
- Events;
- Quiz;
- Observer;
- Notat;
- Rute;
- Wonderkammer;
- de åtte monokrome stedspopup-snarveiene.

## 5. People er en inngang, ikke et filter

People-rundingen viser ett representativt portrett i sirkelen. Previewet bestemmer **ikke** hvem som finnes bak rundingen.

- alle canonical personer med gyldig stedstilknytning skal fortsatt kunne vises i People-popupen;
- ikke bruk `people_ids`, lokal kuratering eller previewvalg til å snevre inn People-popupen;
- en eventuell produktbeslutning om et redaksjonelt avgrenset People-sett må tas separat.

### Verk ligger under personen

Personens verk hører i personprofilen/People-popupen, for eksempel bibliografi, filmografi, diskografi, komposisjoner, roller eller arkitekturverk.

`works` er ikke PlaceCard-runding.

## 6. Gjenstander

`objects` er fysiske, identifiserbare ting med dokumentert stedstilknytning, blant annet artefakter, funn, maskiner, instrumenter, dokumentobjekter, museumsgjenstander, billedkunst, skulpturer, statuer og installasjoner.

Et fysisk kunstverk er **Gjenstand**, ikke Verk-runding.

Canonical felt for ny/revidert produksjon er `place.objects`. Legacy `artifacts` og fysisk kvalifiserte Civication-elementer kan leses som compatibility-kilder uten at Civication blir en runding.

## 7. Brands

**Canonical semantisk eier:** `data/brands/brand_rules_v1_1.json`.

Brands betyr **selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling**. Det omfatter mer enn forbrukermerker og butikker. Kommersielle og historiske selskaper, profesjonelle firmaer, arkitektur- og ingeniørfirmaer, serverings-/galleri-/venue-identiteter, subkulturmerker, institusjonsmerker, legacy-navn og skiltidentiteter kan kvalifisere når Brand-reglenes identitets- og gjenkjennelseskrav består.

En aktør er ikke automatisk en Brand, men aktørtypen er heller ikke et avslag i seg selv. Et arkitektkontor, entreprenørfirma, prosjektteam eller en institusjon skal vurderes etter om navnet har selvstendig offentlig/profesjonell identitet og en konkret, kildebelagt rolle ved stedet.

- les Brand-reglene før kandidater eller N/A avgjøres;
- søk canonical Brand-ID, aliaser, `brands_by_place` og eventuelle innebygde stedsposter;
- auditér også dokumenterte eiere, operatører, arkitekt-/ingeniørfirmaer, entreprenører, historiske virksomheter, venue-navn, institusjoner og skiltidentiteter ved stedet;
- gjenbruk canonical Brand når den finnes;
- bruk korrekt logo/brandbilde med kilde og rettighetskontroll;
- ikke legg personer, objekter eller generiske aktørnavn i Brands for å fylle innhold;
- null treff i dagens Brand-master eller `brands_by_place` er **ikke** alene grunnlag for N/A;
- N/A krever dokumentert kandidatsøk og kandidatspesifikk avvisning etter Brand-kontrakten.

## 8. Flora og Fauna

Flora/Fauna skal bruke eksisterende canonical naturarter og place-level naturmapping. Ikke opprett et parallelt artsregister i PlaceCard.

Sensitive arter eller lokaliteter skal ikke få presis kartplassering bare for å fylle kart- eller artsflaten.

## 9. Detaljer og Punkter er steddata, ikke rundinger

Eksisterende strukturer som `place.details`, `visual_details`, `site_details`, `place.spots`, `subplaces` eller `subPlaces` kan fortsatt være nyttige steddata. De er **ikke PlaceCard-rundinger**.

Denne kontrakten flytter dem ikke automatisk til en annen UI-flate.

## 10. Events og forestillinger

En forestilling, teateroppsetning, konsert, visning eller annen tidsbundet produksjon ved stedet er et **Event** og hører under **Events i handlingsraden**.

Historiske forestillinger kan i tillegg omtales i Historie/Stories når de er dokumenterte historiske episoder. Event-identiteten endres ikke av dette.

## 11. Legacy `rounds`

`place.rounds`, `rundinger` og `rounds_exclude` er legacy presentasjonsgjeld. Nye/reviderte steder skal ikke bruke disse feltene til å finne opp egne rundingssett.

Runtime bruker én fast badge og to faste tre-rundersprofiler:

```text
badge:  badges
vanlig: people · objects · brands
natur:  map · flora · fauna
```

Gamle round-ID-er skal ikke få gjenoppstå som canonical typer via aliaser eller fallback.

## 12. Produksjonsgate

Et sted er rundingsklart når:

1. PlaceCard viser badge-rundingen ved stedsoverskriften og nøyaktig tre rundinger ved `frontImage`;
2. tre-runderssettet er den faste profilen for vanlig sted eller natursted;
3. previewene er reelle og egnede;
4. People-preview filtrerer ikke People-popupen;
5. naturstedets Kart åpner et faktisk tur-/naturkart med turkartgrunnlag og Turrutebasen, ikke generisk hovedkart-zoom;
6. Flora/Fauna bruker canonical naturdata;
7. relevante rundings-/datagater passerer.
