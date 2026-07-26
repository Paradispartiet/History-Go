# History GO — Stories data governance

Status: **operational production and integrity guide**
Sist kontrollert: **2026-07-26**

Denne guiden avklarer hvilke filer som eier aktive Stories-data, hvordan nye stories produseres, og hvordan tidsbundne research- og dekningsrapporter skal behandles.

## Autoritetsrekkefølge

1. `data/stories/stories_manifest.json` er canonical runtime-manifest for aktive story-filer.
2. Manifest-loadede filer under `data/stories/` eier selve story-objektene.
3. `data/places/manifest.json` og manifest-loadede place-filer eier gyldige `place_id`-er.
4. `data/people/manifest.json` og manifest-loadede people-filer eier gyldige `person_id`-er når en story bruker personanker.
5. `tools/check_stories_integrity.mts` og `npm run check:stories` håndhever struktur, required fields, unike story-ID-er og referanseintegritet.
6. Researchnotater og coverage-rapporter er tidsbundne snapshots. De kan støtte en batch, men eier aldri aktiv status.

Ved konflikt gjelder manifestene, source-dataene og integritetskontrollen. En Markdown-rapport kan ikke aktivere en story eller overstyre en ID.

## Aktiv story

En story teller som aktiv når:

- story-filen finnes på manifestets `path`;
- manifest-entryen har riktig kategori og peker til den tiltenkte filen;
- story-objektet har required fields;
- `story.id` er unikt;
- storyen har gyldig `place_id` eller `person_id`;
- `sources` er en ikke-tom array;
- alle `related_places` og `next_scenes[].place_id` finnes i aktive place-data;
- `npm run check:stories` passerer.

En story-fil som ligger i repoet, men ikke er manifestregistrert, er ikke aktiv runtime-data.

## Produksjonsflyt

1. Start fra fersk `main`.
2. Kontroller om place/person og story allerede finnes, inkludert navne- og ID-varianter.
3. Verifiser fysisk eller biografisk ankertilknytning og bygg storyen på eksplisitte kilder.
4. Opprett eller oppdater den avgrensede story-filen under `data/stories/`.
5. Registrer filen i `data/stories/stories_manifest.json` med korrekt `entity_id`, kategori og path.
6. Kontroller `related_places`, `next_scenes`, personreferanser, kilder og eventuell scorestruktur.
7. Kjør:

```bash
npm run check:stories
```

8. Sammenlign slutt-diffen mot fersk `main`; en story-batch skal ikke inneholde tilfeldige place-, people-, UI- eller dokumentendringer.

## Researchnotater

Researchnotater kan inneholde:

- kandidat og foreslått vinkel;
- place-/personanker;
- kilder og hva de faktisk støtter;
- overlapps- og duplikatvurdering;
- status som klar, trenger mer research eller skal vente.

De skal ikke presenteres som ferdige stories eller som varig dekningsstatus. Når batchen er gjennomført eller forlatt, flyttes notatet til et datert arkiv under `reports/archive/` og registreres som historisk.

## Coverage og statusrapporter

Story-dekning er et beregnet øyeblikksbilde. En gyldig rapport må minst oppgi:

- input-commit eller tydelig `main`-tidspunkt;
- antall aktive places fra det aktuelle place-manifestet;
- antall manifest-loadede story-filer og story-objekter;
- metode for duplikater og flere stories per place;
- kontrollresultat fra `npm run check:stories`;
- genereringstidspunkt.

Gamle prosent- og totaltall skal ikke kopieres videre som fasit. En rapport legges under `reports/`, og blir historisk når inputgrunnlaget flytter seg. Det finnes ingen Markdown-baseline som kan erstatte en ny beregning fra aktive manifests.

## Historiske snapshots

Følgende tidligere dokumenter er arkivert fordi de blandet tidsbundet status med aktiv dokumentasjon:

- `reports/archive/2026-07/stories/STORIES_BATCH_4_RESEARCH_NOTES_2026-07-26.md`
- `reports/archive/2026-07/stories/STORIES_COVERAGE_REPORT_PRE_CONSOLIDATION_2026-07-26.md`

De bevarer research- og coveragehistorikk, men skal ikke brukes som produksjonskø, nåstatus eller kontrakt.

## Avgrensninger

Stories-governance eier ikke place-kategorier, people-profiler, koordinater, quiz, leksikon, bilder eller UI-rendering. Den eier manifestaktivering, story-sourcefiler, produksjonsflyt og integritetskrav for Stories-laget.
