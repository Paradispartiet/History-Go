# Psykoteori – kildegjennomgang, batch 03

**Dato:** 2026-10-09  
**Kort:** `stressvurdering`, `tilknytning`, `sosial_laring`  
**Status:** Delvis historisk/metodisk kildekontroll; ingen full `source_verified`.

## Stress og kognitiv vurdering (`em_psy_stress_belastning`)

- [Folkman, Lazarus mfl. (1986)](https://pubmed.ncbi.nlm.nih.gov/3712234/) rapporterer en innad-i-individ-studie av primær og sekundær vurdering, coping og utfall ved stressende hendelser. Fagverksclaim `kfa-26` er tilknyttet nettopp `src-stress-appraisal`; dette støtter studie- og modellbeskrivelsen, men garanterer ikke at én vurderingsmekanisme er universell.
- [WHO: Stress](https://www.who.int/news-room/questions-and-answers/item/stress) er faglig veiledning om kroppslige og psykiske reaksjoner (`kfa-25` / `src-who-stress`). Den er ikke primærbelegg for transaksjonsmodellen.
- **Utestående:** Nyere metaanalyser, forskjellen mellom appraisal, allostase og kronisk stress, samt feltene `method` og `contrast`.

## Tilknytningsteori (`em_psy_tilknytning_relasjon`)

- [Metaanalyse av tilknytningsstabilitet i tidlig barndom (2020)](https://pubmed.ncbi.nlm.nih.gov/32772822/) finner bare moderat stabilitet og dokumenterer publiseringsskjevhet (`uol-04`, `uol-05`, `uol-06` / `src-attachment-early-meta`).
- [Pinquart, Feussner og Ahnert (2013)](https://pubmed.ncbi.nlm.nih.gov/23210665/): 127 studier, 21 072 tilknytningsmålinger, sammenlagt korrelasjon cirka `r=0,39`; ingen pålitelig stabilitet ved de lengste tidsintervallene i den analysen (`uol-05`, `uol-26` / `src-attachment-lifespan-meta`).
- **Viktig grense:** Dette er ikke en individuell prognose, diagnose eller grunnlag for å bedømme et barns tilknytning ut fra en kort observasjon. Historisk primærverk og nyansering av Ainsworth/Bowlby må fortsatt dokumenteres separat.

## Sosial læring og mestringstro (`em_psy_sosial_utvikling`)

- [Bandura, Ross og Ross (1961)](https://pubmed.ncbi.nlm.nih.gov/13864605/) er en dokumentert primærstudie om modellæring/imitasjon i eksperimentelle betingelser; den gjelder ikke alle former for sosial læring.
- [Bandura (1977), *Self-efficacy: Toward a Unifying Theory of Behavioral Change*](https://pubmed.ncbi.nlm.nih.gov/847061/) er et primærverk for mestringstro-modellen. Hypoteser om at mestringstro endrer handling og utholdenhet må vurderes mot videre forskning, ikke bare bibliografien.
- **Eierskapsavvik:** Fagverksartiklene for `em_psy_sosial_utvikling` har claimregistreringer om sosial reorientering og jevnaldrende, **ikke** direkte Bandura-claims. Det er derfor *bevisst ingen* `canonical_claim_ids` eller `canonical_source_ids` på de to Bandura-referansene. Kildene skal ikke feilaktig kobles til andre påstander bare fordi de tilhører samme emne.

## Registrering

- Psykoteori v1: 14 kort / 58 emner.
- Batch 01–03: **9 av 14 kort** har delvis dokumenterte litteraturhenvisninger; **22 referanselenker**.
- 58-register: **14** direkte teori–emne-koblinger, **44** uten direkte teorikort, **0** kildegodkjente, **0** redaksjonelt godkjente.
- Test: auditen krever korrekte canonical kilde-/claim-ID-er, samsvar mellom dekningsregister og teorikort og opprettholdt `not_reviewed` for alle delkontroller.

Neste batch: sosial identitet, konformitet, resiliens, kognitiv terapi og biopsykososial modell. Etter den følger feltvis kvalitetsrevisjon av alle 14 før noen teori settes til `verified`.
