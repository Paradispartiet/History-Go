# Batch 17 — verifikasjon og opprydding av gjenværende `em_vit_*` emne_ids

**Dato:** 2026-05-31
**Type:** Ren analyse og rapport. Ingen kodepatch, ingen quiz-/popupDesc-endring, ingen appkode, ingen fallback-logikk.

## Fasit (canonical)
- Gyldige `em_vit_*` emne_ids er hentet fra `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json`.
- Antall canonical `em_vit_*` emne_id-objekter: **93**.

## Omfang søkt
- `data/places/**`, `data/people.json` + `data/people/**`, `data/quiz/**`, samt `data/stories`, `data/leksikon`, `data/wonderkammer`, `data/lesespor`.
- Alle `em_vit_*`-treff på tvers av `data/`.

## Hovedfunn
1. **Personer:** Ingen person-objekter bruker `em_vit_*`. (0 treff i `data/people.json` / `data/people/`.)
2. **Quizobjekter:** Ingen quizobjekter tildeler `em_vit_*` som emne_id. I ikke-vitenskap-fag opptrer strengen `"em_vit_"` kun som *bar prefiks* i `generator_guardrails.blocked_emne_prefixes` (en sperreliste), f.eks. `data/fag/kunst/supersetQUIZMAL_kunst.json`. Dette er korrekt og tilsiktet, ikke en feiltildeling.
3. **Steder:** `em_vit_*` brukes som emne_id kun i de tre vitenskap-place-filene. Totalt **28 place-objekter**, **58 emne_id-forekomster**, **16 unike** `em_vit_*`-ids.
4. **Validitet:** Alle 16 unike ids er gyldige canonical `em_vit_*` (0 ukjente, 0 dangling, 0 feil prefiks i objektene).
5. **Kategori:** Alle 28 stedene har `category: "vitenskap"` i selve objektet, og hver enhet er en reell vitenskaps-/kunnskapsinstitusjon. Ingen objekt tilhører en annen kategori og bruker `em_vit_*` ved en feil.

**Konklusjon:** `em_vit_*`-bruken er allerede ryddig. Ingen forekomst skal flyttes til en annen kategoris canonical emne_id.

## Tabell — alle forekomster

| fil | objekt-id | navn | gammel emne_id | foreslått ny emne_id | begrunnelse | sikkerhet |
| --- | --- | --- | --- | --- | --- | --- |
| places_vitenskap.json | universitetets_gamle_hovedbygning | Universitetets gamle hovedbygning | em_vit_byens_vitenskapssteder, em_vit_kunnskapsgeografi | (ingen endring) | Universitetsbygning, kjernevitenskap; ids canonical, category=vitenskap | HØY |
| places_vitenskap.json | universitetets_gamle_kjemi | Universitetets gamle kjemibygning | em_vit_kjemi_laboratorium, em_vit_eksperiment_maling | (ingen endring) | Kjemilaboratorium/eksperiment; ids canonical, riktig kategori | HØY |
| places_vitenskap.json | tvergastein | Tvergastein | em_vit_feltarbeid_observasjon, em_vit_miljo_okologi_system | (ingen endring) | Arne Næss' hytte; vitenskap/filosofi (dypøkologi, feltobservasjon) | HØY |
| places_vitenskap.json | gamlebyen_skole | Gamlebyen skole | em_vit_kunnskap_formidling_utdanning, em_vit_byens_vitenskapssteder | (ingen endring) | Undervisningsinstitusjon; kunnskapsformidling, riktig kategori | HØY |
| places_vitenskap.json | abelhaugen | Abelhaugen | em_vit_matematikk_modellering, em_vit_vitenskapshistorie_personer | (ingen endring) | Minnested for matematikeren Abel; vitenskapshistorie | HØY |
| places_vitenskap.json | universitetet_i_oslo_blindern | Universitetet i Oslo, Blindern | em_vit_byens_vitenskapssteder, em_vit_kunnskapsgeografi | (ingen endring) | Universitetscampus; kjernevitenskap | HØY |
| places_vitenskap.json | naturhistorisk_museum | Naturhistorisk museum | em_vit_miljo_okologi_system, em_vit_kunnskap_formidling_utdanning | (ingen endring) | Vitenskapsmuseum (geologi/zoologi); ids canonical, category=vitenskap | HØY |
| places_vitenskap.json | botanisk_hage | Botanisk hage | em_vit_miljo_okologi_system, em_vit_feltarbeid_observasjon | (ingen endring) | Forsknings-/undervisningssamling; riktig kategori | HØY |
| places_vitenskap.json | teknisk_museum | Norsk Teknisk Museum | em_vit_hist_teknologi, em_vit_kunnskap_formidling_utdanning | (ingen endring) | Teknologi-/vitenskapsmuseum; riktig kategori | HØY |
| places_vitenskap.json | forskningsparken | Forskningsparken | em_vit_teknologi_innovasjon, em_vit_kunnskapsgeografi | (ingen endring) | Forsknings-/innovasjonsklynge; riktig kategori | HØY |
| places_vitenskap.json | rikshospitalet | Rikshospitalet | em_vit_medisin_helse, em_vit_kunnskap_formidling_utdanning | (ingen endring) | Universitetssykehus/medisinsk forskning; riktig kategori | HØY |
| places_vitenskap.json | radiumhospitalet | Radiumhospitalet | em_vit_medisin_helse, em_vit_sannhet_maling_modeller | (ingen endring) | Onkologisk forskning/behandling; riktig kategori | HØY |
| places_vitenskap.json | meteorologisk_institutt | Meteorologisk institutt | em_vit_feltarbeid_observasjon, em_vit_sannhet_maling_modeller | (ingen endring) | Vær-/klimadata, observasjon/modeller; riktig kategori | HØY |
| places_vitenskap.json | oslo_met_pilestredet | OsloMet, Pilestredet | em_vit_kunnskap_formidling_utdanning, em_vit_samfunnsrolle | (ingen endring) | Profesjonsutdanning/anvendt forskning; riktig kategori | HØY |
| places_vitenskap.json | arkitektur_og_designhogskolen | Arkitektur- og designhøgskolen i Oslo | em_vit_teknologi_innovasjon, em_vit_kunnskap_formidling_utdanning | (ingen endring) | Forsknings-/utdanningsinstitusjon, category=vitenskap; design-dimensjon noteres under USIKKER | MIDDELS |
| places_vitenskap.json | bi_nydalen | BI i Nydalen | em_vit_kunnskapsgeografi, em_vit_samfunnsrolle | (ingen endring) | Kunnskapsinstitusjon i Oslos kunnskapsgeografi, category=vitenskap; næringsliv-dimensjon noteres under USIKKER | MIDDELS |
| places_vitenskap_historiske_institusjoner.json | nobelinstituttet | Nobelinstituttet | em_vit_samfunnsrolle, em_vit_byen_som_kunnskapskart, em_vit_hist_teknologi | (ingen endring) | Vitenskaps-/samfunnsinstitusjon; ids canonical, riktig kategori | HØY |
| places_vitenskap_historiske_institusjoner.json | observatoriet | Observatoriet | em_vit_hist_teknologi, em_vit_sannhet_maling_modeller, em_vit_byen_som_kunnskapskart | (ingen endring) | Astronomisk observatorium; vitenskapshistorie | HØY |
| places_lisbon_vitenskap.json | lisbon_museu_nacional_de_historia_natural_e_da_ciencia | Museu Nacional de História Natural e da Ciência | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Universitets-/vitenskapsmuseum; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_observatorio_astronomico | Observatório Astronómico de Lisboa | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Astronomisk observatorium; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_instituto_superior_tecnico | Instituto Superior Técnico | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Ingeniørhøyskole; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_faculdade_de_ciencias | Faculdade de Ciências da Universidade de Lisboa | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Naturvitenskapelig fakultet; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_pavilhao_do_conhecimento | Pavilhão do Conhecimento | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Vitenskapssenter; riktig kategori (se kvalitetsnotat) | HØY |
| places_lisbon_vitenskap.json | lisbon_jardim_botanico_tropical | Jardim Botânico Tropical | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Botanisk hage tilknyttet universitet; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_instituto_higiene_medicina_tropical | Instituto de Higiene e Medicina Tropical | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Medisinsk forsknings-/utdanningsinstitutt; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_laboratorio_nacional_engenharia_civil | Laboratório Nacional de Engenharia Civil | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Statlig forskningslaboratorium; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_instituto_ricardo_jorge | Instituto Nacional de Saúde Doutor Ricardo Jorge | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Statlig folkehelseinstitutt; riktig kategori | HØY |
| places_lisbon_vitenskap.json | lisbon_torre_do_tombo | Arquivo Nacional da Torre do Tombo | em_vit_byens_vitenskapssteder, em_vit_universitet_kunnskapsproduksjon | (ingen endring) | Nasjonalarkiv; category=vitenskap. Arkiv-/historie-dimensjon noteres under USIKKER | MIDDELS |

## USIKKER — punkter som bør verifiseres redaksjonelt (ingen endring foretatt)

Disse er ikke `em_vit_*`-feil. Hvert objekt har eksplisitt `category: "vitenskap"` og er reelt en kunnskaps-/forskningsinstitusjon, så `em_vit_*` er forsvarlig. Det som er usikkert er en eventuell *redaksjonell kategori-vurdering*, som ligger utenfor denne batchens mandat (emne_id-opprydding) og krever egen avgjørelse:

| objekt-id | observasjon | hva som må sjekkes | sikkerhet |
| --- | --- | --- | --- |
| bi_nydalen | Handelshøyskole; kunne også sees som næringsliv. | Avklar om stedet skal beholdes som vitenskaps-place eller flyttes til næringsliv. Først *da* blir en næringsliv-canonical emne_id aktuell. Foreslås ingen ny id nå (ingen gjetting). | USIKKER |
| arkitektur_og_designhogskolen | Arkitektur/design kan ha kunst-dimensjon. | Avklar om AHO skal beholdes i vitenskap (som forsknings-/utdanningsinstitusjon) eller få kunst-tilknytning. Ingen ny id foreslås nå. | USIKKER |
| lisbon_torre_do_tombo | Nasjonalarkiv; arkiv-/historie-dimensjon. | Innenfor vitenskap finnes canonical `em_vit_arkiv_data_lagring` som ville passet arkiv bedre enn `em_vit_universitet_kunnskapsproduksjon`. Dette er en *quiz-/emne-innholdsforbedring innen samme kategori*, eksplisitt utenfor denne batchen (skal ikke endre quizinnhold). Alternativt en kategori-vurdering mot historie. | USIKKER |

## Kvalitetsnotater (ikke emne_id-feil, ingen endring)
- **Lisbon templating:** Alle 10 Lisbon-place har identisk emne_id-par (`em_vit_byens_vitenskapssteder` + `em_vit_universitet_kunnskapsproduksjon`). Begge er gyldige canonical og kategorien er riktig, men paret virker malbasert. For rene museer/sentre/laboratorier/arkiv (f.eks. Pavilhão do Conhecimento, LNEC, Torre do Tombo) ville mer presise canonical `em_vit_*` (f.eks. `em_vit_vitenskapsformidling`, `em_vit_laboratorium_praksis`, `em_vit_arkiv_data_lagring`) passet bedre. Dette er en innholds-/presisjonsforbedring innen vitenskap, ikke en kategorifeil, og berører quiz-vinkling → utenfor mandatet her.
- **Dangling referanse i canonical-fil:** I `emner_vitenskap_canonical_v4_5.json` refererer `related_emner`/`related_emners` til `em_vit_observasjon`, som ikke finnes som et deklarert canonical `emne_id` (den deklarerte er `em_vit_observasjon_maling`). Dette gjelder en emne-kildefil, ikke et place-/person-/quizobjekt, men bør ryddes senere.
- **Legacy emnefil:** `data/fag/emner_vitenskap.json` (ikke canonical v4_5) inneholder ids som ikke finnes i canonical: `em_vit_epistemologi`, `em_vit_forskningspraksis`, `em_vit_teknologi_systemer`, `em_vit_biovitenskap_liv`, `em_vit_samfunnsvitenskap`. Ingen place/person/quiz bruker disse. Bør fases ut/avstemmes mot canonical senere.

## Oppsummering
- **Antall funn (objekter med `em_vit_*`):** 28 place-objekter (58 emne_id-forekomster, 16 unike ids). 0 personer, 0 quizobjekter.
- **Antall trygge endringer:** **0.** Alle `em_vit_*`-tildelinger er allerede korrekte (gyldig canonical id + riktig kategori). Ingenting skal flyttes ut av vitenskap.
- **Antall usikre:** **3** redaksjonelle kategori-/presisjons-vurderinger (bi_nydalen, arkitektur_og_designhogskolen, lisbon_torre_do_tombo) — ikke emne_id-feil, krever egen redaksjonell avgjørelse.

## Filer som eventuelt bør endres senere (Codex/GitHub)
Ingen filer trenger `em_vit_*`-rettelse for denne batchen. Følgende er valgfrie oppryddinger utenfor mandatet, oppført for sporbarhet:
- `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json` — rydd dangling `related_emner`-referanse `em_vit_observasjon` → `em_vit_observasjon_maling`.
- `data/fag/emner_vitenskap.json` — avstem/fase ut legacy ids som ikke finnes i canonical v4_5.
- `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` — vurder mer presise canonical `em_vit_*` for malbaserte Lisbon-oppføringer (innholdsforbedring innen vitenskap; berører quiz-vinkling, så egen batch).
