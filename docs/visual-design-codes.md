# History GO — Visual Design Codes

Status: **operational usage and runtime guide**
Sist kontrollert: **2026-07-26**

Visual Design Codes er et metadata- og resolverlag for visuell identitet på tvers av places, people, artikler, stories, leksikon og lesespor. Systemet beskriver hva en entitet skal oppfattes som visuelt; rendererne bestemmer hvordan den faktisk tegnes.

Den tidligere kombinerte arkitekturteksten og batchjournalen er bevart som et innholdsbevarende pre-consolidation-snapshot i `reports/archive/2026-07/visual-design-codes/VISUAL_DESIGN_CODES_PRE_CONSOLIDATION_2026-07-26.md`. Arkivet er historisk og eier ingen aktiv regel.

## Autoritetsrekkefølge

1. `data/visualDesignCodes.json` er canonical register for gyldige designCodes og `renderHints`.
2. `js/visualDesignCodes.js` eier resolverrekkefølge, heuristikker, defaults og `window.HGVisualDesignCodes`.
3. Hver renderer eier sin konkrete Three.js-, Canvas-, card- eller icon-presentasjon.
4. `tools/audit-visual-design-codes.mts` eier auditlogikken.
5. `reports/visual-design-codes-audit.json` og `.md` er genererte snapshots, ikke parallelle registre.

Ved konflikt gjelder registeret, resolveren og den aktuelle rendererens kode.

## Hva en designCode er

En designCode er en stabil, navngitt visuell identitet, for eksempel:

```text
stadium_miniature
museum_miniature
person_writer_miniature
article_history_miniature
```

En kode er ikke geometri, SVG, tekstur eller bilde. Entitetsdata skal derfor ikke inneholde renderer-spesifikke primitiver.

Registeroppføringer inneholder blant annet:

| Felt | Betydning |
| --- | --- |
| `id` | Stabil kode og registernøkkel |
| `entityTypes` | Tillatte entitetstyper |
| `family` | Tematisk familie |
| `label` / `description` | Menneskelesbar forklaring |
| `renderHints` | `threeType`, `canvasType`, `cardType`, `iconType` |
| `visualTraits` | Abstrakte form-, materiale- og detaljtrekk |
| `tags` | Søkbare audit- og vedlikeholdstagger |

## DesignCode og renderer

```text
designCode = visuell identitet og intensjon
renderer   = konkret tegning i én flate
```

Samme kode kan derfor bli en 3D-miniatyr i kartet, et Canvas-symbol, et kortmotiv og et ikon uten at source-data endres.

En renderer skal lese relevant `renderHints`-felt og bruke sin dokumenterte fallback når hintet eller registeret ikke er tilgjengelig. Den skal ikke kreve at alle entiteter har eksplisitt kode.

## Resolver-API

`js/visualDesignCodes.js` publiserer:

```js
HGVisualDesignCodes.init();
HGVisualDesignCodes.get(code);
HGVisualDesignCodes.all();
HGVisualDesignCodes.resolveForPlace(place);
HGVisualDesignCodes.resolveForPerson(person);
HGVisualDesignCodes.resolveForArticle(article);
HGVisualDesignCodes.normalizeDesignCode(value);
HGVisualDesignCodes.getRenderHint(code, key);
HGVisualDesignCodes.isValidCode(code);
```

Resolveren muterer ikke entitetsdata og skal ikke kaste feil inn i appen dersom registeret ikke er lastet. Før init er ferdig kan den returnere en designCode fra innebygde heuristikker med `entry: null`.

## Oppslagsrekkefølge

Eksplisitt `visual.designCode` vinner alltid når verdien er gyldig for entiteten.

Deretter bruker resolveren entitetsspesifikke signaler:

- **place:** asset-/map-type, nøkkelord, kategori, place-default;
- **person:** rolle, profesjon, sport, tags, nøkkelord, kategori, person-default;
- **article/story/leksikon/lesespor:** type, topic, tags, themes, tittel/id etter regelens avgrensning, kategori, article-default.

Noen presise artikkelregler er topical-only og leser bare strukturert metadata. De skal ikke reklassifisere en artikkel fordi et ord tilfeldigvis finnes i tittel eller ID.

## Eksplisitt kode i data

Eksempel:

```json
{
  "id": "nasjonalmuseet",
  "category": "kunst",
  "visual": {
    "designCode": "museum_miniature"
  }
}
```

Eksplisitt kode brukes når:

- heuristikken er tvetydig eller feil;
- stabil rendereridentitet er viktig;
- audit har et tydelig, manuelt verifisert forslag;
- koden allerede finnes i registeret og tillater entitetstypen.

Ikke legg eksplisitte koder på i bulk bare for å redusere default-tall. Bred eller blandet entitet kan med vilje beholde default.

## Ny designCode

En ny kode krever samlet endring av:

1. `data/visualDesignCodes.json`;
2. nødvendige resolverregler i `js/visualDesignCodes.js`;
3. auditens speilregel;
4. renderer-hint og fallbackvurdering;
5. relevante tester og regenerert audit.

Nye koder skal ikke opprettes for ett enkelt tvilstilfelle dersom en eksisterende bred kode eller bevisst default er faglig riktig.

## Audit

```bash
npm run test:visual-design-codes
```

Auditen kontrollerer blant annet:

- registerets struktur og entitetstyper;
- eksplisitte gyldige og ugyldige koder;
- manglende `renderHints`;
- oppløsningskilde: explicit, assetType, category, heuristic eller default;
- default- og heuristikkandidater;
- ubrukte koder og manuelle review-kandidater.

JSON-rapporten er fullstendig. Markdown-rapporten er en lesbar, avkortet visning. Kontroller alltid rapportens genereringstidspunkt; commit-bundet rapport er ikke automatisk dagens datahelse.

## Arbeidsflyt for en data-batch

1. Kjør auditen på fersk `main`.
2. Velg kandidater fra rapporten, ikke fra løs tekstsøk alene.
3. Kontroller entitetens faktiske rolle, kategori og innhold.
4. Bruk bare eksisterende kode med tillatt `entityType`, med mindre en separat registerbeslutning er nødvendig.
5. Endre kun `visual.designCode` i en ren merkebatch.
6. Regenerer audit og kontroller defaults, ugyldige koder, renderHints og review-kandidater.
7. Test minst én aktiv renderer eller fallbackflate.

## Avgrensninger

Visual Design Codes eier ikke bilder, koordinater, place-kategorier, people-roller, artikkelinnhold eller rendererens geometri. Registeret er metadata; resolveren er tolkning; rendererne er presentasjon.
