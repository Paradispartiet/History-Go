# Civication FWG Governance Audit

Generert av `node scripts/audit-civication-fwg-governance.mjs`. Rapporten er report-only: den endrer ikke runtime eller UI og feiler ikke bygget. Den viser om stillingsgrammatikken (FWG) faktisk styrer mailFamilies.

Dimensjoner: `minimum_counts`, `required_axes`, `place_grammar`, `actor_grammar`, `conflict_grammar`, `solution_patterns`, `failure_patterns`. `n/a` betyr at FWG-fila ikke deklarerer den dimensjonen.

## Sammendrag

- FWG-filer auditert: 3
- Totalt antall avvik: 84

## Statusmatrise

| rolle | category | minimum_counts | required_axes | place_grammar | actor_grammar | conflict_grammar | solution_patterns | failure_patterns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| by_radgiver_plan | by | ⚠️ 4 | ⚠️ 1 | ⚠️ 3 | ⚠️ 4 | ⚠️ 4 | ⚠️ 1 | ✅ |
| renholder | naeringsliv | ✅ | ⚠️ 8 | ⚠️ 14 | ⚠️ 4 | ⚠️ 8 | ⚠️ 3 | ⚠️ 6 |
| barnehageassistent | sosial_laering | ✅ | ⚠️ 6 | ⚠️ 3 | ⚠️ 10 | ⚠️ 1 | ⚠️ 1 | ⚠️ 3 |

## Detaljer

### Arealplanlegger (`by/by_radgiver_plan`)

Kilde: `data/Civication/workGrammars/by/by_radgiver_plan.json`

- **minimum_counts** (4):
  - conflict: 2/8 mailer (mangler 6)
  - event: 3/4 mailer (mangler 1)
  - people: 8/10 mailer (mangler 2)
  - story: 2/6 mailer (mangler 4)
- **required_axes** (1):
  - learning_focus: mangler i 4 av 67 mail(er)
- **place_grammar** (3):
  - udeklarert sted i mail: kollektivknutepunkt_bryn (ikke i place_grammar)
  - udeklarert sted i mail: oslo_planomrade_indre_by (ikke i place_grammar)
  - udeklarert sted i mail: radhuset_planavdeling (ikke i place_grammar)
- **actor_grammar** (4):
  - aktør elin_plansjef sender mailtyper utenfor can_send_mail_types: consequence, followup, job, knowledge, story (tillatt: people, event, micro)
  - aktør signe_byokolog sender mailtyper utenfor can_send_mail_types: consequence, followup, micro (tillatt: people, conflict, knowledge)
  - aktør hanne_beboer sender mailtyper utenfor can_send_mail_types: consequence, knowledge, micro (tillatt: people, conflict, followup)
  - aktør ivar_utbygger sender mailtyper utenfor can_send_mail_types: consequence, followup, knowledge, micro (tillatt: people, conflict, event)
- **conflict_grammar** (4):
  - konfliktfamilie mangler: utbyggerpress (nevnt i utbyggerpress_vs_juridisk_presisjon)
  - konfliktfamilie mangler: planjuridisk_presisjon (nevnt i utbyggerpress_vs_juridisk_presisjon)
  - konfliktfamilie mangler: konsekvens_av_kartlinje (nevnt i utbyggerpress_vs_juridisk_presisjon)
  - konflikt-mail by_areal_conflict_stoy_001 har pressure 'teknisk_losning_vs_hverdagsrisiko' uten forankring i conflict_grammar
- **solution_patterns** (1):
  - ubrukt løsningsmønster-tag: political_readability (ingen valg bruker den)

### Renholder (`naeringsliv/renholder`)

Kilde: `data/Civication/workGrammars/naeringsliv/renholder.json`

- **required_axes** (8):
  - akse 'avvik' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'ergonomi' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'hygiene' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'servicepress' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'smittevern' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'tidspress' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'usynlig_arbeid' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
  - akse 'verdighet' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)
- **place_grammar** (14):
  - ubrukt sted i grammatikken: kontor_moterom_og_korridor (ingen mail forankret her)
  - ubrukt sted i grammatikken: renholdsrom_vogn_og_kjemi (ingen mail forankret her)
  - ubrukt sted i grammatikken: rygg_skuldre_hender (ingen mail forankret her)
  - ubrukt sted i grammatikken: toalett_og_beroringssoner (ingen mail forankret her)
  - udeklarert sted i mail: avfallsrom (ikke i place_grammar)
  - udeklarert sted i mail: driftskontor (ikke i place_grammar)
  - udeklarert sted i mail: fellesareal (ikke i place_grammar)
  - udeklarert sted i mail: garderobe (ikke i place_grammar)
  - udeklarert sted i mail: hjemme (ikke i place_grammar)
  - udeklarert sted i mail: inngangsparti (ikke i place_grammar)
  - udeklarert sted i mail: lilleborg_fabrikker (ikke i place_grammar)
  - udeklarert sted i mail: møterom (ikke i place_grammar)
  - udeklarert sted i mail: renholdsrom (ikke i place_grammar)
  - udeklarert sted i mail: toalett_sone (ikke i place_grammar)
- **actor_grammar** (4):
  - ubrukt aktør-eksempel: driftsleder_mona (leder) dukker ikke opp som avsender
  - aktør amina_erfaren_renholder sender mailtyper utenfor can_send_mail_types: conflict, consequence, event, job, micro, story (tillatt: knowledge, people, followup)
  - ubrukt aktør-eksempel: kontorbruker_jon (bruker) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: verneombud_sara (hms_kontrollpunkt) dukker ikke opp som avsender
- **conflict_grammar** (8):
  - konflikt-mail renholder_conflict_001 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_002 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_003 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_004 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_005 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_006 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_007 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
  - konflikt-mail renholder_conflict_008 har pressure 'tidspress, lav status, fysisk belastning og forventning om at rommet bare skal være klart' uten forankring i conflict_grammar
- **solution_patterns** (3):
  - ubrukt løsningsmønster-tag: integrity (ingen valg bruker den)
  - ubrukt løsningsmønster-tag: precision (ingen valg bruker den)
  - ubrukt løsningsmønster-tag: service (ingen valg bruker den)
- **failure_patterns** (6):
  - ubrukt feilmønster-hook: touch_point_complaint (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: infection_trace (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: leader_asks_why_no_deviation (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: hms_followup (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: colleague_warns (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)
  - ubrukt feilmønster-hook: shift_after_pain (ingen family/mail/trigger peker hit — bind den til en faktisk followup/consequence-mail)

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

