# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-08-14**

Denne filen bestemmer hva som er en PlaceCard-runding, hvor rundingene plasseres, hvordan kategoriens standardprofil velges og når en stedsspesifikk koherensprofil er påkrevd.

> **Rundinger er tydelige, visuelle samlinger. De skal aldri opprettes bare for å fylle et tomt felt.**

## 1. Fast geometri

Et PlaceCard viser alltid:

1. én Badges-runding øverst til høyre ved stedsoverskriften;
2. nøyaktig fire innholdsrundinger i et 2 × 2-felt ved `frontImage`;
3. sju små stedspopup-SVG-er i et eget felt til høyre for rundingene.

Badges teller ikke som en av de fire rundingene i mediefeltet. PlaceCard har dermed fem synlige rundinger totalt.

## 2. Standardprofil og kontrollert stedsoverstyring

Vanlige steder bruker:

```text
people · objects · brands · [kategoriens fjerde]
```

Natursteder bruker:

```text
map · flora · fauna · [kategoriens fjerde]
```

Dette er standardprofiler, ikke en kvote som kan overstyre redaksjonell kvalitet. Når standarden gir en tynn, kunstig eller overlappende samling, skal stedet bruke en auditert `round_profile.content_round_ids` med nøyaktig fire IDs.

For vanlige steder støtter runtime en avgrenset koherensoverstyring:

```json
{
  "round_profile": {
    "content_round_ids": ["people", "images", "brands", "related"],
    "reason": "konkret redaksjonell begrunnelse",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Krav:

- `people` og `brands` beholdes i henholdsvis første og tredje posisjon;
- andre posisjon er `objects` eller `images`;
- fjerde posisjon velges fra den canonical fjerde-rundingspoolen;
- andre og fjerde posisjon kan ikke være samme runding;
- begge overstyrte samlinger må ha reelt innhold;
- `reason` skal dokumentere hvilket konkret relevans-, substans- eller overlappsproblem standarden løste;
- overstyringen skal testes i faktisk 2 × 2-layout.

Overstyringen er ikke en fri legacy-`rounds`-liste. Den er en begrenset kvalitetsventil for å hindre filler.

## 3. Den fjerde standardrundingen

Uten en godkjent stedsoverstyring er den fjerde rundingen kategoriavhengig og velges bare når samlingen har reelt innhold. Dersom normalvalget er tomt, brukes `Bilder` som generell reserve.

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
- `people`, `objects` og `brands` er standardbasen på vanlige steder; `objects` kan erstattes av `images` gjennom den avgrensede koherensprofilen;
- `map`, `flora` og `fauna` er naturstedets tre faste samlinger;
- de seks siste ID-ene er tillatte fjerde-rundinger og kan velges eksplisitt i en gyldig koherensprofil;
- `productions` får alltid et kategoriens konkret brukerrettet navn;
- `images` er eneste generelle reserve.

## 5. People

People viser canonical personer med dokumentert stedstilknytning. Previewet skal aldri filtrere hvem som finnes i People-popupen.

## 6. Objects

Objects er fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Canonical felt er `place.objects`.

En fysisk Civication-post kan leses som compatibility-kilde for Objects når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en runding.

## 7. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands betyr selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling. Profesjonelle firmaer, arkitektur- og ingeniørfirmaer, historiske virksomheter, venue-identiteter og institusjonsbrands kan kvalifisere når Brand-reglene består; aktørtypen er heller ikke et avslag i seg selv.

Brands er ikke en generell restkategori. Null treff i dagens Brand-register er ikke alene grunnlag for N/A. Kandidater skal vurderes etter identitets-, gjenkjennelses- og stedstilknytningskravene.

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
3. standardprofilen brukes når den er substansiell og koherent; ellers finnes en gyldig, begrunnet `round_profile.content_round_ids`;
4. den fjerde standardrundingen følger kategorimatrisen, eller er eksplisitt valgt i den kontrollerte koherensprofilen;
5. alle valgte samlinger har reelt stedsspesifikt innhold; `images` brukes bare når bildene faktisk dokumenterer stedet;
6. generisk Works, Details, Spots og Civication ikke vises som rundinger;
7. People-previewet ikke filtrerer People-popupen;
8. naturstedets Kart åpner et faktisk tur-/naturkart;
9. de sju popup-SVG-ene står separat til høyre;
10. Objects og Structures er ikke separate rundinger når skillet er kunstig eller samlingene i praksis beskriver de samme fysiske stedselementene;
11. et place med egen canonical oppføring vises bare som eksplisitt `related`, aldri som parent-place-objekt eller -struktur;
12. relevante rundings-, popup- og datagater passerer.
