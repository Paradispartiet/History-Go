# Vitenskap / Forskningsledelse — Role World rollout source-first

## Scope lock
Denne pakken materialiserer bare canonical `vitenskap/vitenskap_forskningsledelse` og bare den siste authored readiness-dimensjonen: `situated_reputation`. Forskningsleder beholder `appointment_required` + `academic_qualification_and_employment` + `employer_appointment`. Ingen ny runtime, ingen global reputation score og ingen ny karriereidentitet innføres.

## Existing foundation preserved
- eksisterende roleModel, workGrammar, People/Places, 15 canonical mails og 16-stegs plan beholdes
- persistent work object: `forskningsportefolje_prioriterings_kapasitets_integritets_ressurs_og_handoff_logg`
- portefølje, prioriteringskriterier, habilitet, kapasitet, bemanning, budsjett, arbeidsmiljø, integritet, etikk/personvern, finansieringsgrenser, effekt/usikkerhet, venting, handoff og bounded rework beholdes

## Situated reputation
Standing er avgrenset til sju audiences: forskningsmiljø/prosjektledere, ansatte/arbeidsmiljø, integritet/etikk/habilitet/kontroll, institusjonsledelse/økonomi/HR, finansieringspartnere/samarbeid, fagoffentlighet/samfunn og private relasjoner. Standing kan sprike mellom audiences og kan aldri gi appointment, evidens, budsjett, personalfullmakt, godkjenning eller myndighet. **No global reputation score.**

## Dramaturgi og provenance
- 14 days × 4 phases = 56 unike coverage beats
- alle 15 canonical mailreferanser brukes minst tre ganger
- sju primærtråder: porteføljelegitimitet, kapasitet/arbeidsmiljø/personalmakt, integritet/varsel/uavhengighet, finansiering/partner/faglig grense, effekt/rapportering/omdømme, budsjett/mandat/handoff og arbeid–hjem/lederstatus
- seks private aftermaths og åtte delayed consequences
- editorial uniqueness: hver beat er bundet til dag, fase, ledelsestema, audience og provenance

## History Go boundary
History Go brukes til historisk/stedlig kontekst og bedre spørsmål. Det kan aldri erstatte `academic_qualification_and_employment`, `employer_appointment`, delegert mandat, budsjett/personalgrunnlag, rådata, integritetsbevis, HR/etikk/personvern, faglig evidens, finansieringsvedtak, godkjenning eller myndighet.

## Cross-role
Candidate when shared work is real; materialized: false. Forskningsprotokoller og institusjonsledelsesobjekter kobles ikke til runtime før et faktisk delt arbeidsobjekt er bevist.
