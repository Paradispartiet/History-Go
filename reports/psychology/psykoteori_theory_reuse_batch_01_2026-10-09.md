# Psykoteori – gjenbruk av teori mot flere emner, batch 01

**Dato:** 2026-10-09  
**Forutsetninger:** Psykoteori #6168 → dekningsaudit og kilder #6173 → denne avgrensede utvidelsen  
**Status:** Strukturelt produsert og kilde-ID-kontrollert; fremdeles ikke full redaksjonell kildegodkjenning.

## Hvorfor dette gjøres

Fagverket har allerede **58** canonicale emneartikler, men Psykoteori-katalogen starter med **14** kort knyttet direkte til 14 emner. En faglig teori kan forklare ulike *aspekter* ved mer enn ett emne. Vi lager ikke duplikatkort eller fyller kunstig alle 58 med «teori»; vi gjenbruker eksisterende kort der dokumentasjonen gjør det faglig forsvarlig.

| Teorikort | Eksisterende hovedemne | Ny tilknytning | Canonical påstand og kilde | Avgrensning |
| --- | --- | --- | --- | --- |
| Behaviorisme og operant læring | `em_psy_betinging_vaner` | `em_psy_atferd_laring` | `fti-10` / `src-apa-behaviorism`; `fti-11` / `src-harvard-skinner` | Målebar læring forklarer ikke automatisk subjektiv mening |
| Heuristikker | `em_psy_kognitive_bias` | `em_psy_beslutning_valg` | `kfa-13` / `src-judgment-uncertainty` | En heuristikk er ikke per definisjon en feil; framing og økologisk rasjonalitet er egne perspektiver |
| Konformitet | `em_psy_sosial_pavirkning` | `em_psy_sosial_kontroll` | `sns-04` / `src-norm-psychology` | Uformelle gruppenormer er bare én del av sosial kontroll; formelle regler og institusjonsmakt behandles separat |
| Resiliens | `em_psy_resiliens_mestring` | `em_psy_risiko_beskyttelse` | `tkr-20` / `src-social-support-meta` | Metaanalytisk gruppesammenheng mellom støtte og PTSD-symptomer er ikke individuell prognose eller kausal årsaksbevis |

Hver ny relasjon har `emne_id`, canonical emnetittel, eksplisitt begrunnet rekkevidde, claim-ID-er og kilde-ID-er. Relasjonene opptrer som «Også relevant for» på de eksisterende teorikortene, med deep-link til canonical fagverksemne.

## Kontroll og avgrensning

- Dekningsregistret inneholder fortsatt 58 unike emne-ID-er. Antall **direkte tilknyttede** emner øker fra **14 til 18**; uten direkte teorikobling synker fra **44 til 40**.
- Antall **teorikort forblir 14**. Kortene har fortsatt 32 litteraturhenvisninger med avgrenset evidensstatus; 0 fullt kildegodkjente.
- Maskinell audit avviser feil chapter-ID, feil canonical artikkeltittel, for kort eller manglende faglig begrunnelse, claim-ID som ikke tilhører målartikkelen, source-ID uten reell kilde–claim-binding, manglende toveisregisterføring og urettmessig `verified`-status.
- UI bevarer den gamle primærkoblingen til `theory.emne_id` og viser de nye relasjonene som ytterligere fagverk-lenker. Dette skal ikke endre screening, selvhjelpsøvelser, lagring, poeng eller quiz.
- Disse fire relasjonene **bekrefter ikke** at alle faktafelt og scenarier i de tilknyttede teorikortene er redaksjonelt gjennomgått. `source_review_status` og `editorial_review_status` forblir `not_reviewed`.

**Neste faglige arbeid:** Feltvis gjennomgang av de 14 kortene og vurdering av resterende 40 emner. Nye teorikort produseres bare der et passende kort eller faglig rammeverk ikke allerede finnes.
