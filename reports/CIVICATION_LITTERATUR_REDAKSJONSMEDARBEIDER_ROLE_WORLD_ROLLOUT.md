# Civication Role World rollout — Litteratur Redaksjonsmedarbeider

Status: kontrollert rollout under fail-closed verifikasjon. Completion gjelder først etter streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.

## Scope

- Canonical readiness krever bare `persistent_work_object`.
- Eksisterende ni mailtyper beholdes uten nye mails.
- Eksisterende åtte-trinns mailplan beholdes uendret; consequence-scenen er fortsatt en eksisterende konsekvenshale utenfor plansekvensen.
- Samme manuspakke føres gjennom versjonslås, forfatterstatus, sen endring, rettighetsavklaring, produksjonsavvik, metadata, tilbakekalling og etterkontroll over 14 dager.
- Ingen ny runtime, parallell scenemotor eller ny autoritetsmodell introduseres.

## Persistent objekt

`manuspakke_versjonsspor_001` skal gjøre redaksjonelt arbeid kumulativt. Objektet bevarer canonical versjon, beslutningseier, åpne avklaringer, rettighetsstatus, avhengigheter, mottakere, avledede produksjonsfiler og korreksjonshistorikk slik at senere scener ikke kan late som tidligere valg aldri skjedde.

## Kvalitetsgrense

Rollouten skal feile lukket hvis persistent-object-kontinuitet, provenance, åtte-trinns planintegritet, authority boundaries, 14×4 Role World-dekning, compiled registry, Career Gameplay Matrix, readiness eller full Civication-suite ikke kan bevises samlet.
