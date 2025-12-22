# History GO — TEAM WORKFLOW

Standard arbeidsflyt for all utvikling i History GO.

---

## SYSTEM_REGISTRY.md
Når:
- Før du rører noe som helst.

Bruk:
- Hvor ligger dette?
- Hvem eier dette?

Regel:
- Hvis endringen ikke passer inn her → oppdater SYSTEM_REGISTRY først.

Eksempel:
- Endre ruter
- SYSTEM_REGISTRY → js/routes.js
- Jobb kun der.

---

## SYSTEM_MAP.md
Når:
- Når du endrer flyt eller oppførsel.

Bruk:
- Hva skjer når brukeren gjør X?
- Hvor i kjeden må vi endre?

Regel:
- Endres event, storage eller API → oppdater SYSTEM_MAP.

Eksempel:
- Riktig svar gir ny effekt
- QuizEngine → HGInsights → knowledge/trivia → updateProfile → AHA

---

## README_DEV.md
Når:
- Teamarbeid
- PR
- Feilsøking
- Testing

Før merge:
DomainHealthReport.run({ toast: true });
QuizAudit.run();

Minimum test:
- Start quiz
- Riktig svar
- Knowledge/trivia lagres
- Profil oppdateres

---

## README.md
Når:
- Onboarding
- Demo
- Overordnet forståelse

Bruk:
- Forklarer hva systemet er, ikke hvordan hver linje fungerer.

---

## Arbeidsflyt

A) Pek på dokument
- Ref: SYSTEM_REGISTRY §2 – routes → js/routes.js
- Ref: SYSTEM_MAP §3.2–3.4

B) Gjør endringen
- Endre kun fil som eier ansvaret
- Ikke hopp mellom moduler
- Ikke bypass QuizEngine / HGInsights / knowledge-hooks

C) Valider
- DomainHealthReport
- QuizAudit
- Manuell test

D) Oppdater dokumentasjon kun hvis kontrakt endres
- localStorage-key
- event
- public API
- entrypoint
- modul eller ansvar

---

## HUSKEREGEL
Hvor? → SYSTEM_REGISTRY  
Hva skjer? → SYSTEM_MAP  
Trygt å merge? → README_DEV  
Hva er appen? → README

---

## GULLREGEL
IKKE GJET  
SLÅ OPP
