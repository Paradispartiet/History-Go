# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-08-04**

Denne filen bestemmer hva som er en PlaceCard-runding, hvor rundingene plasseres og hvordan kategoriens fjerde runding velges.

> **Rundinger er tydelige, visuelle samlinger. De skal aldri opprettes bare for å fylle et tomt felt.**

## 1. Fast geometri

Et PlaceCard viser alltid:

1. én Badges-runding øverst til høyre ved stedsoverskriften;
2. nøyaktig fire innholdsrundinger i et 2 × 2-felt ved `frontImage`;
3. sju små stedspopup-SVG-er i et eget felt til høyre for rundingene.

Badges teller ikke som en av de fire rundingene i mediefeltet. PlaceCard har dermed fem synlige rundinger totalt.

## 2. De tre faste rundingene

Vanlige steder bruker:

```text
people · objects · brands · [kategoriens fjerde]
```

Natursteder bruker:

```text
map · flora · fauna · [kategoriens fjerde]
```

De tre faste rundingene skal ikke erstattes av tilfeldige kategori- eller fallbackvalg.

## 3. Den fjerde rundingen

Den fjerde rundingen er kategoriavhengig, men velges bare når samlingen har reelt innhold. Dersom normalvalget er tomt, brukes `Bilder` som eneste generelle reserve.

| Kategori | Normal fjerde runding | Brukerrettet navn |
| --- | --- | --- |
| `kunst` | `productions` | Kunstverk |
| `litteratur` | `productions` | Bøker og tekster |
| `musikk` | `productions` | Sanger og album |
| `film_tv` | `productions` | Filmer og serier |
| `scenekunst` | `productions` | Forestillinger |
| `media` | `productions` | Utgivelser |
| `subkultur` | `productions` | Uttrykk og utgivelser |
| `sport` | `competitions` | Kamper og konkurranser |
| `natur` | `destinations` | Turmål |
| `by` | `structures` | Bygg og anlegg |
| `religion` | `structures` | Bygg og anlegg |
| `naeringsliv` | `structures` | Bygg og anlegg |
| `historie` | `related` | Relaterte steder |
| `politikk` | `related` | Relaterte steder |
| `vitenskap` | `related` | Relaterte steder |
| `filosofi` | `related` | Relaterte steder |
| `psykologi` | `related` | Relaterte steder |

Canonical aliaser normaliseres gjennom `data/categories/category_contract.json`.

### Eksempler

```text
Kunst:      people · objects · brands · Kunstverk
Sport:      people · objects · brands · Kamper og konkurranser
Historie:   people · objects · brands · Relaterte steder
By:         people · objects · brands · Bygg og anlegg
Natur:      map · flora · fauna · Turmål
```

Hvis kategoriens normale samling mangler reelt innhold:

```text
people · objects · brands · Bilder
```

For natursteder:

```text
map · flora · fauna · Bilder
```

`Bilder` er ikke konstruert fyll. Rundingen bruker dokumenterte bilder som allerede tilhører stedet: hovedbilder, galleri, historiske bilder og før-/nå-bilder.

## 4. Canonical rundingspool

```text
badges
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
images
```

- `badges` står ved overskriften;
- `people`, `objects` og `brands` er de tre faste samlingene på vanlige steder;
- `map`, `flora` og `fauna` er naturstedets tre faste samlinger;
- de seks siste ID-ene er tillatte fjerde-rundinger;
- `productions` får alltid et kategoriens konkret brukerrettet navn;
- `images` er eneste generelle reserve.

## 5. People

People viser canonical personer med dokumentert stedstilknytning. Previewet skal aldri filtrere hvem som finnes i People-popupen.

## 6. Objects

Objects er fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Canonical felt er `place.objects`.

En fysisk Civication-post kan leses som compatibility-kilde for Objects når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en runding.

## 7. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands betyr selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling. Det er ikke en generell restkategori.

## 8. Productions

`productions` brukes bare i kategorier der en produksjonssamling er et naturlig og forståelig produktbegrep. Rundingen heter derfor aldri generelt «Verk» i grensesnittet.

Tillatte brukerrettede samlinger er:

- Kunstverk;
- Bøker og tekster;
- Sanger og album;
- Filmer og serier;
- Forestillinger;
- Utgivelser;
- Uttrykk og utgivelser.

En produksjon er ikke det samme som en fysisk gjenstand. En sang kan være innhold i `Sanger og album`; instrumentet er et Object. En bok kan være innhold i `Bøker og tekster`; originalmanuskriptet er et Object.

## 9. Structures

`structures` betyr navngitte bygninger og anlegg som utgjør en reell samling ved stedet, blant annet haller, tårn, tribuner, broer, verksteder og andre identifiserbare konstruksjoner.

Gamle `subplaces`- eller `spots`-data kan bare brukes som compatibility-kilde når posten uttrykkelig beskriver en bygning eller et anlegg. Et tilfeldig delpunkt kvalifiserer ikke.

## 10. Competitions

`competitions` betyr dokumenterte kamper, løp, finaler, stevner og turneringer knyttet til et sportssted.

Det finnes ingen generell «Sport»-runding. Utøvere hører i People, drakter og pokaler i Objects, klubber og arenaidentiteter i Brands.

## 11. Related

`related` viser faktiske andre History GO-steder med dokumentert relasjon til stedet. Den skal ikke inneholde tekstlige temaer, løse nøkkelord eller oppdiktede «punkter».

## 12. Destinations

`destinations` viser navngitte turmål ved eller omkring et natursted, for eksempel topper, utsiktspunkter, strender, hytter og badeplasser.

Et naturfenomen, en løs observasjon eller en detalj i terrenget er ikke automatisk et Turmål.

## 13. Images

`images` viser dokumenterte bilder som allerede tilhører stedet. Runtime kan lese blant annet:

- `images`, `gallery`, `photos` og `imageGallery`;
- hoved-, popup- og stedsbilder;
- dokumenterte før-/nå-bilder.

Bilder skal dedupliseres. Et bilde skal ikke kopieres eller gis ny identitet bare for å fylle rundingen.

## 14. Fjernet som rundingsalternativer

Følgende er ikke canonical PlaceCard-rundinger:

- `works` / generisk Verk;
- `details` / Detaljer;
- `spots` / Punkter;
- `nature` som generisk samlerunding;
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

`details`, `visual_details`, `site_details`, `spots`, `subplaces` og `subPlaces` kan fortsatt være steddata. De gir ikke automatisk en runding.

## 15. Badges

Badges-rundingen står separat ved stedsoverskriften og åpner:

```text
fagverk-sted.html?place=<place_id>
```

Badges skal aldri dupliseres i 2 × 2-feltet.

## 16. Produksjonsgate

Et sted er rundingsklart når:

1. Badges vises ved stedsoverskriften;
2. fire rundinger vises i et 2 × 2-felt;
3. de tre faste rundingene er bevart for vanlig sted eller natursted;
4. den fjerde rundingen følger kategorimatrisen;
5. normalvalget har reelt stedsspesifikt innhold, ellers brukes Bilder;
6. generisk Works, Details, Spots og Civication ikke vises som rundinger;
7. People-previewet ikke filtrerer People-popupen;
8. naturstedets Kart åpner et faktisk tur-/naturkart;
9. de sju popup-SVG-ene står separat til høyre;
10. relevante rundings-, popup- og datagater passerer.
