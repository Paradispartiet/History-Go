# History GO — Språkleksikon

Status: **canonical kontrakt for stedbundet språk**  
Dataeier: `data/leksikon/sprak/`  
Presentasjon: `js/ui/place-language-layer.js`  
Samling: `HGKnowledgeV2` / `hg_knowledge_entries_v2`

Språkleksikonet er History GOs system for språk som faktisk er knyttet til steder. Det bygger videre på det eksisterende Leksikon-laget; det er **ikke** en ny dialektmotor, en ny PlaceCard-runding eller en separat samlingsdatabase.

## 1. Hovedregel

> **Språkdata eies av Språkleksikonet. Stedspopupen eier presentasjonen. Knowledge V2 eier brukerens samlede kunnskap.**

Et språkspor kan være lite eller omfattende. Et sted uten dokumentert relevant språkstoff skal ikke få kunstig innhold for å fylle en flate.

## 2. Canonical datakilde

Manifest:

`data/leksikon/sprak/manifest.json`

Schema:

`data/leksikon/sprak/schema_v2.json`

Stedsspesifikke filer ligger under:

`data/leksikon/sprak/places/`

Manifestets `place_files` kobler canonical `place.id` til riktig språkfil. Runtime skal ikke kopiere Språkleksikonet inn i place-filen.

## 3. Innholdstyper

Runtime normaliserer eksisterende og nye typer til disse brukerrettede familiene:

| Canonical familie | Eksempler på datatyper | Bruk |
| --- | --- | --- |
| `word` | `ord`, `fagord`, `objektord`, `personord` | Lokale eller stedsspesifikke ord |
| `expression` | `uttrykk`, `lokal_vending`, `slang` | Uttrykk og talemåter |
| `dialect_feature` | `dialekttrekk` | Uttale-, bøynings-, syntaks- eller andre dialekttrekk |
| `pronunciation` | `uttale` | Uttale som selvstendig språkspor |
| `place_name` | `stedsnavn`, `historisk_navn`, `kallenavn` | Navn, navneformer og navnehistorie |
| `language_history` | `sprakhistorie` | Dokumenterte historiske språkspor |
| `term` | øvrige begrepstyper | Fallback for relevante språkbegreper |

Eksisterende typer trenger ikke masseomskrives. Normaliseringen er en presentasjons- og samlingsadapter, ikke en ny sannhetskilde.

## 4. Oppføringsmodell

Minimum:

```json
{
  "id": "stabil_id",
  "term": "ord eller uttrykk",
  "type": "ord",
  "meaning": "presis betydning"
}
```

Når materialet gir dekning, kan oppføringen også ha:

- `example`
- `pronunciation`
- `audio`
- `dialect_area`
- `status`
- `usage`
- `etymology`
- `historical_period`
- `language_family`
- `context`
- `notes`
- `emne_ids`
- `related_entries`
- `related_places`
- `linked_to`
- `tags`
- `sources`

Ikke fyll felter ved gjetning. Fravær er bedre enn falsk presisjon.

## 5. Status

Når tidsstatus er dokumenterbar, brukes:

- `current` — i bruk;
- `common` — vanlig;
- `older` — eldre form/bruk;
- `rare` — sjeldent;
- `historical` — historisk;
- `uncertain` — usikkert dokumentert.

Et eldre ord skal ikke presenteres som nålevende lokal tale uten belegg.

## 6. Kvalitetskrav

En språkoppføring skal vurderes for:

1. **Stedsrelevans** — hvorfor er dette spesielt relevant for akkurat stedet eller området?
2. **Betydning** — er definisjonen presis og kildebelagt?
3. **Geografi** — er utbredelsen kjent, og er den bredere enn dette ene stedet?
4. **Tid** — er formen historisk, eldre, sjelden eller fortsatt i bruk?
5. **Kategori** — er dette faktisk språk, eller burde materialet ligge i Historie, Om eller en annen kilde?
6. **Kilder** — brukerrettede kildelenker skal være HTTPS.
7. **Deduplisering** — samme språkfenomen skal kunne relateres på tvers av steder i stedet for å få motstridende kopier.
8. **Ingen completeness-fyll** — et sted kan ha null språkoppføringer.

Vanlige norske ord skal ikke merkes som lokale bare fordi de forekommer i en lokal kilde. Lokalt særpreg må dokumenteres.

## 7. Presentasjon i stedspopupen

De åtte grunnfanene i stedspopupen består. Når stedet har minst én gyldig språkoppføring, legger `place-language-layer.js` til en valgfri **Språk**-fane før **Mer**.

Språkfanen viser:

- antall oppføringer;
- typefordeling;
- filtrering etter språkfamilie/type;
- betydning og eksempel;
- uttale, dialektområde, bruk, periode og opphav når data finnes;
- relaterte steder og språkspor;
- kilder;
- samlingsstatus.

Når språkdata finnes, vises også en kompakt **Språk på stedet**-forhåndsvisning i Om. Den peker til språkfanen.

Når språkdata ikke finnes, vises verken tom språkfane eller teaser.

Språk er fortsatt **ikke** en PlaceCard-runding.

## 8. Samling

Brukeren kan eksplisitt samle en språkoppføring med **Samle kunnskapen**.

Oppføringen lagres i den canonicale Knowledge V2-butikken:

`hg_knowledge_entries_v2`

med blant annet:

- `subject_id: "sprak"`;
- `kind: "language"`;
- en stabil `knowledge_unit_id`;
- `source.type: "language_lexicon"`;
- `source.place_id`;
- `source.source_file`;
- term, tags, språkfamilie/type og eventuelle `emne_ids`.

Det opprettes **ingen** `language_collection`, `dialect_collection` eller annen parallell localStorage-kilde.

Å åpne et sted samler ikke språk automatisk. Samling er en eksplisitt brukerhandling.

## 9. Relasjoner på tvers av steder

`related_places` og `related_entries` gjør modellen klar for språkgeografi uten å innføre et eget atlaslager.

Et ord som finnes i flere områder skal kunne kobles til flere relevante places. Senere kartvisning skal lese disse relasjonene; den skal ikke bygge en konkurrerende sannhetskilde.

## 10. AHA

AHA skal senere kunne analysere brukerens faktisk samlede språkoppføringer via Knowledge V2, for eksempel:

- mønstre mellom besøkte dialektområder;
- felles ordhistorie;
- endringer mellom historiske og moderne former;
- forbindelser mellom språk, handel, migrasjon, arbeid eller stedshistorie.

AHA skal ikke finne på lokale språkformer for å fylle slike analyser. Kildebundne språkoppføringer er grunnlaget.

## 11. Lyd

Schemaet reserverer `audio`, men lyd er ikke et krav i v2. Når lyd innføres, må uttaleopptak ha avklart kilde, rettigheter, geografisk representativitet og metadata. Tekstlig `pronunciation` kan brukes uten lyd når kilden støtter det.

## 12. Ikke gjør dette

- Ikke lag en separat dialektdatabase ved siden av Språkleksikonet.
- Ikke gjeninnfør Språkleksikon som PlaceCard-runding.
- Ikke legg språkinnhold i place-filer bare fordi popupen viser det.
- Ikke merk generelt norsk som lokalt uten belegg.
- Ikke presenter historiske former som moderne uten dokumentasjon.
- Ikke samle språkoppføringer automatisk ved åpning.
- Ikke bruk AHA-generert tekst som kilde for nye språkoppføringer.

## 13. Produksjonsklar oppføring

En oppføring er klar når:

1. `id`, `term`, `type` og `meaning` er eksplisitte;
2. `place_id` i filen matcher manifestkoblingen;
3. stedsrelevansen er reell;
4. tids-/geografipåstander er avgrenset;
5. kildene er inspiserbare og brukerrettede URL-er er HTTPS;
6. den ikke dupliserer en eksisterende canonical oppføring uten relasjonsgrunn;
7. språk-auditen passerer.
