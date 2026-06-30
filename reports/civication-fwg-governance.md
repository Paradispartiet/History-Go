# Civication FWG Governance Audit

Generert av `node scripts/audit-civication-fwg-governance.mjs`. Rapporten er report-only: den endrer ikke runtime eller UI og feiler ikke bygget. Den viser om stillingsgrammatikken (FWG) faktisk styrer mailFamilies.

Dimensjoner: `minimum_counts`, `required_axes`, `place_grammar`, `actor_grammar`, `conflict_grammar`, `solution_patterns`, `failure_patterns`. `n/a` betyr at FWG-fila ikke deklarerer den dimensjonen.

## Sammendrag

- FWG-filer auditert: 3
- Totalt antall avvik: 24

## Statusmatrise

| rolle | category | minimum_counts | required_axes | place_grammar | actor_grammar | conflict_grammar | solution_patterns | failure_patterns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| by_radgiver_plan | by | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| renholder | naeringsliv | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| barnehageassistent | sosial_laering | ✅ | ⚠️ 6 | ⚠️ 3 | ⚠️ 10 | ⚠️ 1 | ⚠️ 1 | ⚠️ 3 |

## Detaljer

### Arealplanlegger (`by/by_radgiver_plan`)

Kilde: `data/Civication/workGrammars/by/by_radgiver_plan.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Renholder (`naeringsliv/renholder`)

Kilde: `data/Civication/workGrammars/naeringsliv/renholder.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Barnehageassistent (`sosial_laering/barnehageassistent`)

Kilde: `data/Civication/workGrammars/sosial_laering/barnehageassistent.json`

- **required_axes** (6):
  - akse 'barns_behov_vs_gruppens_behov' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'foreldrekrav_vs_faglig_vurdering' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'frilek_vs_usynlig_utenforskap' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'observasjon_vs_synsing' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'omsorg_vs_tidsklemme' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'trygghet_vs_flyt' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
- **place_grammar** (3):
  - ubrukt sted i grammatikken: lesekrok (ingen mail forankret her)
  - ubrukt sted i grammatikken: måltidsbord (ingen mail forankret her)
  - ubrukt sted i grammatikken: sandkasse (ingen mail forankret her)
- **actor_grammar** (10):
  - ubrukt aktør-eksempel: pedagogisk_leder (pedagogisk leder) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: erfaren_assistent (erfaren assistent) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: ny_vikar (ny vikar) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: barn_som_strever_med_overgang (barn som strever med overgang) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: barn_som_ofte_blir_oversett (barn som ofte blir oversett) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: forelder_som_klager (forelder som klager) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: forelder_som_trenger_st_tte (forelder som trenger støtte) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: styrer (styrer) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: spesialpedagog_ppt_kontakt (spesialpedagog / PPT-kontakt) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: renholder_kj_kken_drift_som_pavirker_dagen_praktisk (renholder/kjøkken/drift som påvirker dagen praktisk) dukker ikke opp som avsender
- **conflict_grammar** (1):
  - konflikt-mail sosial_laering_barnehageassistent_conflict_007 har pressure 'dokumentasjon_vs_tilstedeværelse' uten forankring i conflict_grammar
- **solution_patterns** (1):
  - ubrukt løsningsmønster-tag: faglighet (ingen valg bruker den)
- **failure_patterns** (3):
  - ubrukt feilmønster-hook: pedagogisk_leder_spor_etter_observasjon (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: forelder_kommer_tilbake (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: barnet_trekker_seg_mer_unna (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)

