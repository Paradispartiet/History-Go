# README — FAGSTRUKTUR I HISTORY GO

Denne README-en beskriver **hvordan fag, kunnskap og læring er strukturert i History GO**, og hvorfor systemet er bygget slik.  
Den er **epistemisk og normativ**: den forklarer hva som er riktig bruk av strukturene, ikke bare hva som finnes.

---

## Grunntanke

History GO modellerer kunnskap i **lag**, ikke i flate lister.

Mennesker lærer i praksis i denne rekkefølgen:

1. **Orientering** – hva skal jeg se etter?
2. **Forståelse** – hvordan henger dette sammen?
3. **Fordypning** – konkrete emner og begreper
4. **Handling** – quiz, observasjon, steder

Systemet speiler denne læringsprosessen direkte i datastrukturen.

---

## Oversikt over fag-lagene (øverst → nederst)

GLOBALT FAGKART
↓
FAGKART (dypt, forklarende)
↓
FAGPLAN (kort, observerbar)
↓
EMNEKART
↓
EMNER
↓
QUIZ / STEDER / OBSERVASJON

Hvert lag har **én tydelig rolle** og skal ikke overta funksjonen til et annet lag.

---

## 1. Globalt fagkart (universets kart)

**Fil:** `emner/fagkart.json`

Dette er det **øverste, tverrfaglige kartet** i systemet.

Det definerer:
- fagfamilier
- vitenskapelige grener (subfields)
- hvordan fagområder forholder seg til hverandre

Eksempel (konseptuelt):

Naturvitenskap
├─ Biologi
│   ├─ Botanikk
│   ├─ Zoologi
│   ├─ Økologi
│   ├─ Evolusjonsbiologi
│   └─ Mikrobiologi
├─ Geologi
└─ Miljø og bærekraft

Kjennetegn:
- endres sjelden
- er ikke UI-rettet
- er faglig autoritativt
- brukes som referanse for presis fagkobling

---

## 2. FAGKART (dypt, strukturerende)

**Eksempler:**  
`fagkart_by_oslo.json`  
`fagkart_natur_oslo.json`

Dette er **det dype fagkartet** for et fagområde innen et bestemt scope (f.eks. Oslo).

Fagkartet:
- forklarer *hvordan faget henger sammen*
- definerer begreper, konflikter og sentrale spørsmål
- gir rammer for videre utvikling

Kjennetegn:
- `principles`
- `categories`
- `topic_hooks`
- `canon`
- `scope` / stedlig kontekst (f.eks. Oslo)
- konflikter, aktører og spørsmål

Dette laget er:
- epistemisk
- strukturerende
- normativt

👉 **Dette er selve fagkartet.**

---

## 3. FAGPLAN (kort, observerbar)

**Eksempler:**  
`fagkart_by.json`  
`fagkart_natur.json` (kommende)

Fagplanen er **operativ og lavterskel**.

Den svarer på:
- Hva er dette faget i praksis?
- Hva skal jeg se etter?
- Hva er kjernen?

Kjennetegn:
- `what`
- `core`
- `observable_signs`
- korte beskrivelser
- ingen kanon
- ingen utviklingsregler

Dette laget brukes:
- i UI
- i onboarding
- i felt (by / natur)
- som praktisk læreplan

👉 **Fagplan = det brukeren møter først.**

---

## 4. FAGKART_MAP (koblingslaget)

**Fil:** `emner/fagkart_map.json`

Dette er et **rent koblingslag** mellom lokale fagstrukturer og det globale fagkartet.

Det:
- mapper lokale nøkler (BY, NATUR)
- til globale `family_id` og `subfield_id`

Eksempel:

```json
"natur": {
  "bio_okologi": { "family_id": "biologi", "subfield_id": "okologi" }
}



Dette sikrer at:
	•	emner havner riktig faglig
	•	samme faglogikk kan brukes på tvers av UI, quiz og dekning
	•	faglig presisjon opprettholdes uten duplisering

⸻

5. EMNEKART (oversikt / kanon)

Eksempler:
emnekart_by.json
emnekart_natur_okologi.json

Emnekartet er:
	•	en kanonisk oversikt
	•	en plan / backlog
	•	et progresjonskart

Det:
	•	grupperer emner
	•	angir status (planlagt / aktiv / ferdig)
	•	gir oversikt over dekning

Emnekartet er ikke kunnskap, men kartet over kunnskapen.

⸻

6. EMNER (mikro-kunnskap)

Eksempel: emner/emner_natur.json

Emner er:
	•	konkrete faglige enheter
	•	knyttet til fag via gren_key → fagkart_map
	•	bærer:
	•	core_concepts
	•	key_terms
	•	dimensions
	•	related_emner

Emner er:
	•	det quiz tester
	•	det dekning måler
	•	det brukeren faktisk lærer

⸻

7. QUIZ / STEDER / OBSERVASJON

Dette er handling og erfaring.
	•	Quiz tester emner
	•	Quiz gir unlocks (HGUnlocks / HGNatureUnlocks)
	•	Steder konkretiserer fagkartet
	•	Observasjon gjør kunnskapen kroppslig og situert

Dette laget:
	•	skal aldri eie faglogikk
	•	skal kun bruke strukturene over

⸻

Låste prinsipper
	•	Fagkart er dype og forklarende
	•	Fagplan er kort og observerbar
	•	Emner er mikro-kunnskap
	•	Quiz er operativ læring
	•	Globalt fagkart er faglig sannhet, ikke UI

Hvis noe føles uklart, betyr det at to lag blander roller –
ikke at systemet mangler et nytt lag.

⸻

Status
	•	Begreper er ryddet
	•	Lagene er identifisert
	•	BY-systemet er referanseimplementasjon
	•	NATUR kan bygges konsekvent fra start

Dette dokumentet er referansen for videre faglig utvikling i History GO.



