# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-08-04**

Denne filen bestemmer hva som er en PlaceCard-runding, hvor rundingene plasseres og hvordan kategoriens fjerde runding velges.

> **Rundinger er visuelle samlinger. De er ikke en ekstra meny for kunnskap, handlinger eller Civication.**

## 1. Fast geometri

Et PlaceCard viser alltid:

1. én Badges-runding øverst til høyre ved stedsoverskriften;
2. nøyaktig fire innholdsrundinger i et 2 × 2-felt ved `frontImage`;
3. sju små stedspopup-SVG-er i et eget felt til høyre for rundingene.

Badges teller ikke som en av de fire rundingene i mediefeltet. PlaceCard har dermed fem synlige rundinger totalt.

## 2. De tre eksisterende rundingene

Vanlige steder beholder:

```text
people · objects · brands
```

Natursteder beholder:

```text
map · flora · fauna
```

Den fjerde rundingen skal **ikke** være en fast global runding. Den velges fra kategoriens visuelle prioritet.

## 3. Kategoriavhengig fjerde runding

Matrisen bygger på den canonicale kategori → rundingmatrisen. Første kandidat er normalvalget. Dersom stedet faktisk har relevant innhold i en senere kandidat, mens første kandidat er tom, brukes neste dokumenterte kandidat.

| Kategori | Prioritet for fjerde runding |
| --- | --- |
| `by` | Works → Spots → Details |
| `historie` | Spots → Details → Works |
| `kunst` | Works → Details → Spots |
| `litteratur` | Works → Spots → Details |
| `media` | Works → Spots → Details |
| `musikk` | Works → Spots → Details |
| `naeringsliv` | Spots → Details → Works |
| `natur` | Spots → Details → Works |
| `politikk` | Spots → Details → Works |
| `psykologi` | Works → Spots → Details |
| `religion` | Works → Spots → Details |
| `scenekunst` | Works → Spots → Details |
| `sport` | Spots → Details → Works |
| `subkultur` | Works → Details → Spots |
| `vitenskap` | Spots → Details → Works |
| `filosofi` | Works → Spots → Details |
| `film_tv` | Works → Spots → Details |

Canonical aliaser normaliseres gjennom `data/categories/category_contract.json`.

### Eksempler

```text
Historie:   people · objects · brands · spots
Musikk:     people · objects · brands · works
Subkultur:  people · objects · brands · works
Politikk:   people · objects · brands · spots
Natur:      map · flora · fauna · spots
```

Hvis første kandidat mangler innhold, går runtime til neste kandidat i samme kategorirekke. Det skal ikke innføres en generell reserve som gjør alle kategorier like.

## 4. Canonical rundingspool

```text
badges
people
works
objects
details
spots
brands
map
flora
fauna
```

- `badges` står ved overskriften;
- `map`, `flora` og `fauna` er naturstedets spesialiserte samlinger;
- `works`, `details` og `spots` brukes gjennom kategoriens fjerde-rundingsprioritet;
- `people`, `objects` og `brands` er de tre eksisterende samlingene på vanlige steder.

## 5. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands betyr selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling. Profesjonelle firmaer, arkitektur- og ingeniørfirmaer, historiske virksomheter, venue-identiteter og institusjonsbrands kan kvalifisere når Brand-reglene består; aktørtypen er heller ikke et avslag i seg selv.

Brands er ikke en generell restkategori. Null treff i dagens Brand-register er ikke alene grunnlag for N/A. Kandidater skal vurderes etter identitets-, gjenkjennelses- og stedstilknytningskravene.

## 6. Works

Works er identifiserbare verk og produksjoner: bøker, sanger, album, film, billedkunst, forestillinger, arkitekturverk og andre dokumenterte verk.

Kamper, rekorder, mesterskap og generelle historiske hendelser er ikke Works. De hører i stedspopupens Historie-flate.

## 7. Objects

Objects er fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Canonical felt er `place.objects`.

En fysisk Civication-post kan leses som compatibility-kilde for Objects når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en runding.

## 8. Details

Details er små, konkrete og visuelt oppdagbare detaljer ved stedet, blant annet inskripsjoner, ornamenter, symboler, materialskifter og dokumenterte spor.

Canonical/kompatible felt er `details`, `visual_details` og `site_details`.

## 9. Spots

Spots er konkrete fysiske delpunkter eller delsteder innenfor et større sted, blant annet port, tårn, scene, tribune, rom, utsiktspunkt eller fysisk delområde.

Canonical/kompatible felt er `spots`, `subplaces` og `subPlaces`.

## 10. Civication er ikke en runding

Civication Store / Thingstore er ikke canonical PlaceCard-runding.

Store-data, kjøp og eierskap består i Civication. En virkelig stedsspesifikk fysisk ting kan samtidig presenteres gjennom Objects.

## 11. Ikke rundinger

Følgende er ikke PlaceCard-rundinger:

- Civication;
- Før/etter;
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
- de sju stedspopup-SVG-ene.

Disse hører i stedspopupen, På stedet eller egne handlingsflows.

## 12. Badges

Badges-rundingen står separat ved stedsoverskriften og åpner:

```text
fagverk-sted.html?place=<place_id>
```

Badges skal aldri dupliseres i 2 × 2-feltet.

## 13. Produksjonsgate

Et sted er rundingsklart når:

1. Badges vises ved stedsoverskriften;
2. fire rundinger vises i et 2 × 2-felt;
3. de tre eksisterende rundingene er bevart for vanlig sted eller natursted;
4. den fjerde rundingen følger kategoriens prioritet;
5. Civication ikke vises som runding;
6. Details/Spots/Works bygger på reelt stedsspesifikt innhold;
7. People-previewet ikke filtrerer People-popupen;
8. naturstedets Kart åpner et faktisk tur-/naturkart;
9. de sju popup-SVG-ene står separat til høyre;
10. relevante rundings-, popup- og datagater passerer.
