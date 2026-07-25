# History GO — Knowledge-arkitektur

Status: **canonical**  
Sist kontrollert: **2026-07-25**

Dette dokumentet er den menneskelesbare inngangen til Knowledge-systemet. Det eier ansvarsdeling, autoritetsrekkefølge og skillet mellom canonical produksjon, aktiv overgangsruntime og historiske modeller.

## 1. Autoritetsrekkefølge

Ved konflikt gjelder denne rekkefølgen:

1. [`../data/knowledge/knowledge_system_policy_v1.json`](../data/knowledge/knowledge_system_policy_v1.json) — maskinlesbar systempolicy
2. [`../data/knowledge/knowledge_unit_schema_v1.json`](../data/knowledge/knowledge_unit_schema_v1.json) — schema for canonical knowledge units
3. [`../data/quiz/quiz_knowledge_delivery_contract_v1.json`](../data/quiz/quiz_knowledge_delivery_contract_v1.json) — quiz som kunnskaps-, vurderings- og evidensflate
4. [`../js/knowledgeV2.ts`](../js/knowledgeV2.ts) — canonical TypeScript read-model og legacy-migrering
5. [`../js/knowledgeQuizMemory.ts`](../js/knowledgeQuizMemory.ts) — quiz-bundles, lesestatus, repetisjon og synkronisering til V2
6. tester som håndhever storage-, integrasjons- og browserkontraktene

Dette dokumentet skal korrigeres dersom maskinpolicy, schema, runtime og tester viser noe annet. Gamle README-er, ontology-notater og generatorutkast kan ikke overstyre denne rekkefølgen.

## 2. Formål

Knowledge er brukerens personlige, systematiserte forhold til fagkunnskap brukeren har møtt, lest, blitt vurdert i og arbeidet med i History GO.

Knowledge er ikke:

- en flat liste over fullførte quizspørsmål
- en kopi av places, people eller emner
- et fritekst-tagregister
- et nytt fagkart
- et parallelt lager for den samme faglige påstanden

Kunnskapen kan formidles fra steder, personer, emner, historier, Wonderkammer, quiz, Knowledge-siden og kontrollerte eksterne kilder. Samme faglige innhold skal bruke samme stabile kunnskapskobling på tvers av flatene.

## 3. Canonical faglig kjede

```text
fagkart og pensum
  → emne
  → begrep og terminologi
  → knowledge unit og historie
  → formidlingsflate
  → lesing og vurdering
  → læringsevidens og mestring
  → personlig Knowledge-minnekammer
```

Ingen ny produksjon skal hoppe direkte fra en løs tag eller UI-etikett til en påstått canonical kunnskapsenhet.

## 4. Canonical objekter

### Subject

Faglig hovedområde og runtime-kategori. Subject skal løses gjennom eksisterende domene-/kategori-kontrakter.

### Emne

Faglig beholder for beslektede knowledge units, begreper, termer, metoder og historier. Et emne er ikke et enkelt faktum og ikke en quiz.

### Concept

En faglig idé, prosess, sammenheng, motsetning eller analytisk kategori med stabil `concept_id`.

### Term

En presis fagterm med stabil `term_id`, foretrukket navn, definisjon og eksplisitte synonymer.

### Knowledge unit

Det minste selvstendige faglige innholdet som kan formidles, kobles, testes og repeteres. Schemaet krever blant annet:

- `knowledge_unit_id`
- `subject_id`
- `emne_ids`
- `unit_type`
- `title`
- `summary`
- `canonical_claim`
- `concept_ids`
- `term_ids`
- `delivery_surfaces`
- `sources`

Tillatte hovedtyper defineres av `knowledge_unit_schema_v1.json`, blant annet `definition`, `fact`, `process`, `cause_effect`, `relation`, `comparison`, `method`, `event`, `biography`, `place_reading`, `story_fragment` og `interpretation`.

### Story

Et eksplisitt narrativt eller kronologisk forløp på tvers av hendelser, steder, personer og knowledge units. Flere spørsmål om samme sted er ikke automatisk en historie.

### Learning evidence

Dokumentasjon på at brukeren har møtt, lest eller blitt vurdert i kunnskapen. Lesing og mestring er forskjellige påstander og skal lagres separat.

### Personal memory node

Brukerens lese-, mestrings- og repetisjonstilstand for en canonical knowledge unit, med proveniens tilbake til flaten der kunnskapen ble møtt.

## 5. Quizens rolle

Quiz er samtidig:

- kunnskapsinnsamling
- kunnskapsformidling
- vurdering
- læringsevidens
- proveniens

For ny produksjon skal quiz kobles til stabile faglige objekter. Maskinkontrakten krever blant annet:

- `emne_id` eller `emne_ids`
- `primary_knowledge_unit_id`
- `knowledge_unit_ids`
- `concept_ids`
- `term_ids`
- `learning_objective_id`
- `evidence_type`
- `knowledge` eller `knowledge_payload`
- `feedback_basis`
- `source` eller `claim_basis`

Et spørsmål alene beviser ikke at kunnskapen er lest. Kunnskapsforklaringen må vises, og aktiv videreføring etter feedback er signalet for `read`-evidens. Feil svar kan gi `encountered`, `read` og repetisjonsbehov, men ikke mestring. Riktig svar gir vurderingsevidens i tråd med `evidence_type`.

## 6. Aktiv storage- og runtime-modell

### `hg_knowledge_entries_v2`

Dette er den varige, søkbare personlige read-modellen. Entry-schemaet er `history_go_knowledge_entry_v2`.

`knowledgeV2.ts` eier:

- innlesing og lagring av V2-entries
- sammenslåing av evidens og proveniens
- subject-, emne-, concept-, term- og story-koblinger
- legacy-import
- projeksjoner som eldre UI fortsatt kan lese

### `hg_knowledge_memory_v1`

Dette er quizens bundle- og evidenslager. `knowledgeQuizMemory.ts` bygger ett bundle per target/sett, lagrer kunnskapsenheter og tilleggsmateriale, holder indekser for fag, target, emne, begrep, mestret og repetisjon, og synkroniserer bundle-innhold til `hg_knowledge_entries_v2`.

Dette lageret er ikke en konkurrerende faglig sannhet. Det er quizproveniens, vurdering og lesestatus som mates inn i den personlige read-modellen.

### `knowledge_universe`

Dette er legacy-importkilde, ikke et permanent parallelt lager. `knowledge-canonical-storage-contract.test.js` krever at legacy-data migreres til V2 og at `knowledge_universe` fjernes etter import. Eldre konsumenter kan få en avledet legacy-projeksjon fra V2 uten at den gamle storage-nøkkelen gjeninnføres.

### `hg_learning_log_v1`

Learning log er supplerende hendelses-/evidenshistorikk. Den erstatter ikke canonical knowledge units eller den personlige V2-read-modellen.

## 7. Produksjonskrav versus runtime-fallback

Canonical nyproduksjon skal bruke eksplisitte, stabile ID-er og skal ikke skape concepts eller terms fra tags, target-ID-er eller generiske UI-ord.

Aktiv TypeScript-runtime håndterer legacy-data som mangler eksplisitte ID-er. Den kan generere deterministiske fallback-ID-er fra fag og innhold, splitte sammensatte quiztekster i presise claims og merke koblinger med `link_status` som for eksempel `quiz_memory_unresolved`.

Dette er overgangskompatibilitet, ikke tillatelse til å produsere nye quizzer uten canonical koblinger. Runtime-fallback skal aldri omtales som kildeverifisert semantisk fasit.

## 8. Reading- og mastery-semantikk

Maskinpolicyen skiller mellom:

- `encountered`
- `read`
- vurderingsevidens
- mestringsnivå
- repetisjon

Quiz-memory-runtime bruker i tillegg operative bundle-/assessment-statuser som:

- `collected`
- `presented`
- `read`
- `mastered`
- `needs_review`

Disse runtime-statusene skal oversettes til evidens og read-model uten å late som de er hele den faglige mestringsmodellen. En bundle-status alene kan ikke overstyre `evidence_type`, svarresultat og canonical policy.

## 9. Kilde og proveniens

En canonical knowledge unit skal ha eksplisitte kilder og `canonical_claim`. Quizens `knowledge` eller `knowledge_payload` skal kunne spores til de refererte knowledge units og deres kilder.

Places og people er kontekst og formidlingsflater. De blir ikke automatisk faglige claims bare fordi en ID finnes. People-of-Places-metoden og place-standarden eier kravene til fysiske og historiske koblinger; Knowledge eier brukerens faglige minne og evidens.

## 10. Historiske modeller

Følgende modeller er ikke aktive kontrakter:

- den tidligere seksnivå-ontologien fra 2025
- det gamle knaggeregisterrammeverket som krevde knagger i places/routes og avsluttet med den utgåtte `badge_refs`-regelen
- den filosofiske People/Places/Relations-teksten som beskrev Knowledge som et historisk reisverk
- parallelle minnekammer-README-er
- den gamle quiz-kompatibilitetsfilen som pekte til `js/quizKnowledgeMemory.js` i stedet for dagens TypeScript-runtime

Originalene er bevart i `reports/archive/2026-07/knowledge/` og i Git-historikken. De kan brukes som idéhistorikk, men ikke som produksjons- eller runtimefasit.

## 11. Kontroller

Relevante kontrakttester inkluderer:

```bash
node --test tests/quiz-knowledge-memory.test.js
node --test tests/knowledge-canonical-storage-contract.test.js
node --test tests/knowledge-profile-memory-integration.test.js
node --test tests/knowledge-browser-e2e.test.mjs
```

Ved endring av Knowledge skal minst berørte tester, TypeScript guard og dokumentasjonsgaten kjøres.

## 12. Låste regler

- Én canonical Knowledge-arkitektur.
- Maskinpolicy og schemas eier produksjonskontrakten.
- `hg_knowledge_entries_v2` er den varige personlige read-modellen.
- `hg_knowledge_memory_v1` er quizens bundle- og evidenslager og synkroniseres til V2.
- `knowledge_universe` er legacy-import, ikke parallell storage.
- Reading og mastery er forskjellige påstander.
- Feil svar gir ikke mestring.
- Tags er metadata, ikke concepts.
- Nye data skal ha eksplisitte stabile ID-er; genererte fallback-ID-er er overgangskompatibilitet.
- Samme faglige claim skal gjenbruke samme knowledge unit på tvers av flater.
- Historiske ontology-/knagge-/README-modeller kan ikke overstyre canonical policy, schema, runtime eller tester.
