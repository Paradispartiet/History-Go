# Fagverk-sted v2 – arbeidskort

Status: aktivt legacy-migrerings- og produksjonsprogram
Canonical siderolle: `docs/FAGVERK.md` og `docs/FAGVERK_NAVIGATION.md`  
Audit: `scripts/audit-fagverk-place-pages.mjs`  
Baseline: `reports/fagverk/fagverk-place-page-coverage-v2.json`

Den ordinære stedsproduksjonen eies av `docs/PLACE_PRODUCTION_CHECKLIST.md`. Nye steder og steder som fullproduseres eller vesentlig revideres får Fagverk-siden i samme source review, Place-fil, PR og closeout; dette arbeidskortet er ikke en tillatelse til å utsette Fagverk til en senere batch. Separate batcher brukes til å lukke den eksisterende legacy-backloggen for steder som ikke samtidig er i ordinær stedsproduksjon.

## Mål

Alle canonicale steder skal ha en stedsspesifikk fagverkside. En fungerende rute eller en kategoribasert standardtekst er ikke tilstrekkelig ferdigbevis.

Stedssiden skal alltid bruke samme manifest-resolverte fagmodell som `fagverk.html`. Stedlig læringsinnhold eies av Place-kildens `fagverk`-blokk; registryet inneholder bare sourcefil, felt, schema, nivå og status. Siden skal aldri opprette egne emner, kapitler, begrepsdefinisjoner, progresjonsdata eller kategori-fallbacktekster.

## Produksjonsnivåer

- **Fullt sted:** redigert stedsartikkel, eksplisitte canonicale emnebindinger, stedsspesifikke linser med presise klikkmål, stedsspesifikke undersøkelsesspørsmål, relevante fagområder/kapitler, begreper og inspectable kilder.
- **Standardsted:** kort redigert fagartikkel, relevante canonicale emne- og kapittelbindinger, minst tre stedsspesifikke linser, fire undersøkelsesspørsmål, begreper, observerbart spor og kontrollerte kilder.
- **Mikrosted:** kort source-eid stedstekst og den smaleste dokumenterte fag- eller emnebindingen. Mikrostedet bruker samme datatype og renderer; det får ikke en parallell mikrosidemotor.

Renderer-genererte standardspørsmål og generiske kategori-linser er forbudt. Når source mangler, skal siden vise ærlig status og produksjonskø – ikke plausibelt fyllstoff.

## Operative lenker

Alle synlige handlingsflater skal være faktiske lenker:

- fagkort → `fagverk.html?subject=<subject>&place=<place>`;
- fagområde → validert `subject + domain + place`;
- emne/linse → validert `subject + domain + emne + place`;
- kapittel → validert `subject + chapter + place`;
- begrep → eieremnet når det finnes, ellers subject-roten med kontekst;
- undermerke → fagets integrerte Progresjon;
- kart → canonical place-rute;
- ekstern kilde → HTTPS/HTTP med `noopener noreferrer`.

Ikke-klikkbare chips, kort som ser interaktive ut uten `href`, og lenker til `fagverk-forside.html?subject=…` er blocker.

## Baseline 31. august 2026

Auditen måler 1 532 steder mot `data/places/regler/place_fagverk_v2.schema.json`:

- 1 ferdig kuratert referanseside: Regjeringskvartalet;
- 595 uferdige sider med minst én løst, dokumentert emnekobling;
- 936 uferdige sider med bare kategoriens operative canonicale faginngang;
- 0 øvrige sider som kan regnes som ferdige bare fordi de har stedsbeskrivelse, URL eller emnebinding.

Tallene er baseline og produksjonskø, ikke ferdigpåstand. Rapporten skal regenereres ved hver batch.

## Batchregel

1. Ta aldri et sted ut av en aktiv ordinær stedsproduksjon for å behandle Fagverk senere; følg den integrerte gaten i `docs/PLACE_PRODUCTION_CHECKLIST.md`.
2. Prioriter ellers fulle legacy-steder før fokuserte steder, og fokuserte steder før mikrosteder med samme faglige betydning.
3. Produser ett faglig sammenhengende legacy-stedskull per PR.
4. Kurer emnebindinger og linser mot canonical fagpakke; ikke kopier emneinnhold inn i Place.
5. Kjør coverage-audit, lenketest og reell browserklikk-QA.
6. Merge først etter grønn full CI og låst head-SHA.

Programmet er ferdig når `in_production` og `missing` er null, alle nivåer består sin substansport, og hoved- og browserportene er grønne på `main`.
