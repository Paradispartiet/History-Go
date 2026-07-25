# Sport & lek – teoridybde og emnedekning V6

Status: **validert**

## Omfang

- 116 aktive emner kontrollert
- 56 teorihooks
- 56 eksplisitte teorienheter
- 122 personer med dokumenterte verk
- 61 personer begrenset til kontekst eller praksiskilde
- 56 av 56 hooks har kobling til eksisterende evidensclaims

## Hva V6 endrer

Hver hook har nå hovedteori, rival eller alternativ, forklaringsmekanisme, primærverk, kritikk, bruksgrense og skilleevidens. De generiske spørsmålsinstruksjonene er erstattet med hook-spesifikke analytiske operasjoner.

Alle aktive emner er materialisert i en egen emne–teori-matrise med minst to primære hooks. ID-prefikset `em_sport_` regnes ikke lenger som bevis på teoridekning.

Personer uten dokumentert verk er ikke fjernet, men de er eksplisitt begrenset til kontekst- eller praksisbruk og kan ikke brukes som direkte teori-autoritet.

## Evidensstatus

Evidenslaget er nå korrekt markert som **delvis**. Det kan håndheve kilde-, metode- og sikkerhetskrav, men full dekning kan ikke hevdes før alle 56 teorihooks har minst én kontrollert claim-kjede.

## Valideringsporter

- PASS: every_active_emne_mapped
- PASS: every_emne_has_two_primary_hooks
- PASS: every_hook_has_theory_unit
- PASS: every_unit_has_main_rival_mechanism
- PASS: every_unit_has_primary_work
- PASS: every_unit_has_criticism_and_boundary
- PASS: generic_question_moves_replaced
- PASS: thinkers_without_works_not_direct_authority
- PASS: all_claims_mapped_to_theory_units
- PASS: evidence_layer_explicitly_partial
