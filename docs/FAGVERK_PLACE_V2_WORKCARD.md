# Fagverk-sted v2 – arbeidskort

Status: aktivt produksjonsprogram  
Canonical siderolle: `docs/FAGVERK.md` og `docs/FAGVERK_NAVIGATION.md`  
Audit: `scripts/audit-fagverk-place-pages.mjs`  
Baseline: `reports/fagverk/fagverk-place-page-coverage-v2.json`

## Mål

Alle canonicale steder skal ha en stedsspesifikk fagverkside. En fungerende rute eller en kategoribasert standardtekst er ikke tilstrekkelig ferdigbevis.

Stedssiden skal alltid bruke samme manifest-resolverte fagmodell som `fagverk.html`. Den skal aldri opprette egne emner, kapitler, begrepsdefinisjoner, progresjonsdata eller kategori-fallbacktekster.

## Produksjonsnivåer

- **Fullt sted:** redigert stedsartikkel, eksplisitte canonicale emnebindinger, stedsspesifikke linser med presise klikkmål, stedsspesifikke undersøkelsesspørsmål, relevante fagområder/kapitler, begreper og inspectable kilder.
- **Fokusert sted:** redigert stedsartikkel, minst én presis canonical emnebinding og source-eide spørsmål/linser fra den bindingen. Siden skal være unik, men kan være kortere enn et fullt sted.
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

Auditen måler 1 532 steder:

- 1 ferdig kuratert referanseside: Regjeringskvartalet;
- 776 source-linkede sider som kan materialiseres unikt fra redigert stedstekst og eksisterende emnebindinger;
- 748 sider med redigert artikkel, men uten eksplisitt emnekuratering;
- 7 steder med emnebinding, men uten redigert artikkel;
- 0 steder uten både artikkel og binding.

Tallene er baseline og produksjonskø, ikke ferdigpåstand. Rapporten skal regenereres ved hver batch.

## Batchregel

1. Prioriter fulle steder før fokuserte steder, og fokuserte steder før mikrosteder med samme faglige betydning.
2. Produser ett faglig sammenhengende stedskull per PR.
3. Kurer emnebindinger og linser mot canonical fagpakke; ikke kopier emneinnhold inn i Place.
4. Kjør coverage-audit, lenketest og reell browserklikk-QA.
5. Merge først etter grønn full CI og låst head-SHA.

Programmet er ferdig når `article_only`, `binding_only` og `missing` er null, alle fulle steder har stedsspesifikke linser og spørsmål, og hoved- og browserportene er grønne på `main`.
