# VG-huset: kildeledet quizrevisjon (10.10.2026)

**Mål:** `media/vg_huset`. **PR:** #6190, separat fra steds-PR #6187. **Status:** Canonical faglige tester bestått; avventer ordinær exact-head PR-CI og integrert PlaceCard-quizkontroll.

## Eksisterende quiz og vedtak
- Legacy: 6 × 3 = 18 aktive spørsmål, samtlige lagrede fasitposisjoner i slot 0 og flere story-/produksjonsorienterte spørsmål.
- Produksjonskontrakten krever første 2 × 7 normalt oppbygde spørsmål før fagmetode/teori; revisjonen er 4 × 7 = 28. De første 14 er direkte sted-/pressehistorie.
- 12 dokumenterte, gjennomgåtte kilder i `data/quiz/production_briefs/media/vg_huset.json`; hvert nytt spørsmål peker til egen `claim_id` og faktisk ekstern kilde. Den kildeførende briefen ble bygget før pakken og har eksplisitte gamle spørsmål- og Knowledge-migreringsbeslutninger.
- Historiske tidslag holdes fra hverandre: VG som avis etablert 1945 i Akersgata 34; sabotasje av tidligere bygning på tomten i 1944; VG-huset ferdig 1994; VG Nett 1995; monterens 2011-eksemplar vs. fotografiet fra 2013; Aftenpostens innflytting 2014.
- `data/fag/fag_manifest.json` eier route, `data/quiz/production_context/media/vg_huset.json` er deterministisk generert, `data/quiz/media/vg_huset_sets.json` eier det spillbare innholdet.
- Eksisterende Theory/Method-binding i siste sett er kontrollert uten å gjøre innholdet teori-først. Fasit-posisjonene fordeles over tre alternativer; runtime shuffler separat.

## Regenerering og validering
- Canonical Knowledge og Fagverk-release er generert og sammenlignet byte-for-byte med generatorene. Ingen håndredigering av avledede artefakter.
- `VG-huset quiz synchronized derived artifacts one-shot` – [kjøring #38029517086](https://github.com/Paradispartiet/History-Go/actions/runs/38029517086) har bestått kontekstkontroll, Knowledge canonical check, Fagverk-release check, quiz production context, quiz progression, theory-binding, content, templates, quiz-production og quiz-content-audit. Engangsworkflow fjernet i samme commit.
- Neste gate: ordinær PR-CI på nåværende quiz-head; deretter merge av denne quiz-PR-en og integrasjonstest av `vg_huset` med stedets PlaceCard/QuizCard før stedets fullstendige closeout.

Ingen av de to PR-ene skal omtales som merget eller fullprodusert før eksakt sluttkontroll bekrefter det.
