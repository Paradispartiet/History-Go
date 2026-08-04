# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-08-04**

Denne filen bestemmer hva som er en PlaceCard-runding, hvor rundingene plasseres og hvordan kategori avgjør rundingssettet.

> **Rundinger er visuelle samlingsinnganger. De er ikke en ekstra meny for all kunnskap eller alle handlinger ved et sted.**

## 1. Fast geometri

Et PlaceCard viser alltid:

1. én Badges-runding øverst til høyre ved stedsnavnet;
2. nøyaktig fire innholdsrundinger i et 2 × 2-felt ved `frontImage`;
3. sju små stedspopup-SVG-er i et separat felt til høyre for rundingene.

Badges teller ikke som en av de fire innholdsrundingene. PlaceCard har dermed fem synlige rundinger totalt.

## 2. Canonical rundingspool

```text
badges
people
works
objects
details
spots
nature
brands
```

- `badges` = faglig hovedkategori, underbadges og inngang til fagverksiden;
- `people` = navngitte personer med dokumentert stedstilknytning;
- `works` = identifiserbare verk og produksjoner;
- `objects` = fysiske, identifiserbare gjenstander;
- `details` = små, konkrete og visuelt oppdagbare detaljer;
- `spots` = fysiske delpunkter eller delsteder innenfor stedet;
- `nature` = konkrete naturentiteter eller naturfenomener;
- `brands` = bedrifter og kjente merker med dokumentert stedskobling.

Følgende er uttrykkelig ikke rundinger:

- Civication Store;
- kart som bare er navigasjon eller kunnskapsmateriale;
- Flora og Fauna som separate PlaceCard-rundinger;
- Før/etter;
- Fortellinger;
- Leksikon;
- Quiz;
- Oppgaver;
- Lek;
- Trening;
- Events;
- Rute;
- Wonderkammer.

Civication-data kan være compatibility-kilde for et fysisk `object`, men Civication er aldri selve rundingen.

## 3. Kategori avgjør de fire innholdsrundingene

Kategori-matrisen er produksjonsprioritet. Badges står separat; de fire radene nedenfor er derfor de fire rundingene i mediefeltet.

| Canonical kategori | Fire innholdsrundinger ved `frontImage` |
| --- | --- |
| `by` — By & arkitektur | Works · Spots · Details · People |
| `historie` | People · Objects · Spots · Details |
| `kunst` | Works · People · Details · Spots |
| `litteratur` | People · Works · Objects · Spots |
| `media` | People · Works · Objects · Spots |
| `musikk` | People · Works · Objects · Spots |
| `naeringsliv` — Økonomi og næringsliv | Brands · People · Objects · Spots |
| `natur` — Natur & miljø | Nature · Spots · Details · People |
| `politikk` — Politikk & samfunn | People · Spots · Details · Objects |
| `psykologi` | People · Works · Objects · Spots |
| `religion` | People · Works · Objects · Spots |
| `scenekunst` | People · Works · Spots · Objects |
| `sport` — Sport & lek | People · Objects · Spots · Details |
| `subkultur` | People · Works · Details · Spots |
| `vitenskap` — Vitenskap & teknologi | People · Objects · Spots · Details |
| `filosofi` | People · Works · Spots · Objects |
| `film_tv` — Film & TV | People · Works · Spots · Objects |

Den fjerde innholdsrundingen er altså ikke en universell Civication-runding. Den følger kategoriens prioriterte visuelle samling.

### Legacy kategori-ID-er

- `historisk` bruker Historie-profilen;
- `teknologi` bruker en teknologi-kompatibilitetsprofil under Vitenskap & teknologi;
- `transport`, `lekeplass` og `trening` beholdes bare som compatibility-profiler.

## 4. Eksplisitt kuratering

`place.rounds` kan kuratere rekkefølgen med IDs fra canonical pool. Badges ligger fortsatt separat.

- fire eksplisitte innholds-ID-er brukes direkte;
- færre enn fire fylles ut fra kategoriens profil;
- ukjente IDs ignoreres;
- `rundinger` er legacy alias;
- filler skal ikke produseres bare for å få en sirkel.

## 5. People er en inngang, ikke et filter

People-previewet bestemmer ikke hvem som finnes bak rundingen.

- alle canonical personer med gyldig stedstilknytning skal kunne vises;
- ikke bruk `people_ids` eller previewvalg til å snevre inn People-popupen;
- personens verk hører i personprofilen, men selvstendige stedskoblede verk kan ligge i Works.

## 6. Objects, Details og Spots

### Objects

Bruk `place.objects` for nye eller reviderte fysiske ting. Legacy `artifacts` og fysisk kvalifiserte Civication-poster kan leses som compatibility-kilder.

### Details

Bruk `place.details`. Compatibility-felter er `visual_details` og `site_details`.

### Spots

Bruk `place.spots`. Compatibility-felter er `subplaces` og `subPlaces`.

Praktisk skille:

- Object = en ting;
- Detail = noe lite du ser på;
- Spot = et fysisk delpunkt du går bort til.

## 7. Nature

Nature brukes bare når naturen er en reell, stedsspesifikk del av stedet. `nature_profile` i Om-fanen er ikke automatisk grunnlag for Nature-runding.

Naturkart, artskart og detaljkart kan fortsatt finnes i egne kunnskaps- eller handlingsflater, men er ikke egne PlaceCard-rundinger i denne kontrakten.

## 8. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands betyr selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling. Kommersielle og historiske selskaper, profesjonelle firmaer, arkitektur- og ingeniørfirmaer, serveringssteder, gallerier, venue-identiteter, institusjoner, legacy-navn og skiltidentiteter kan kvalifisere når Brand-reglene består; aktørtypen er heller ikke et avslag i seg selv.

Null treff i dagens Brand-register er ikke alene grunnlag for N/A. Kandidater skal vurderes etter identitets-, gjenkjennelses- og stedstilknytningskravene.

## 9. Badges

Badges-rundingen står ved stedsnavnet og åpner:

```text
fagverk-sted.html?place=<place_id>
```

Badges skal ikke dupliseres i 2 × 2-feltet.

## 10. Stedspopup-snarveier

De sju SVG-snarveiene er ikke rundinger. Om-fanen åpnes fra stedsnavnet eller infoteksten i PlaceCard.

Snarveikontrakten eies av `docs/PLACE_CARD_SHORTCUTS.md`.

## 11. Produksjonsgate

Et sted er rundingsklart når:

1. Badges vises separat ved stedsnavnet;
2. fire innholdsrundinger vises i 2 × 2;
3. rundingssettet følger riktig kategori eller dokumentert eksplisitt kuratering;
4. Civication ikke brukes som runding;
5. hvert preview viser riktig visuell samling;
6. People-previewet ikke filtrerer innholdet;
7. Objects, Details og Spots bruker riktig dataeier;
8. relevante rundings-, popup- og datagater passerer.
