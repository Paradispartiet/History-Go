# Civication Thread Standard

Dette dokumentet definerer standarden for thread-mails i Civication.

Hovedmailen er scenen. Threaden er etterklangen.

En thread skal ikke bare være en ekstra mail. Den skal vise at spillerens svar faktisk ble lest av noen, og at relasjonen, tilliten eller situasjonen endret seg litt.

Standarden bygger på `docs/CIVICATION_MAIL_STANDARD.md` og V2-blueprinten i `data/Civication/mailFamilies/BLUEPRINT_README.md`.

## 1. Hva en thread er

En Civication-thread er en Re:-oppfølger som trigges av et valg i en hovedmail.

Den skal normalt gjøre én av disse tingene:

1. Vise en sosial reaksjon på spillerens valg.
2. Forsterke avsenderens stemme.
3. Endre tillit, avstand, respekt, irritasjon eller allianse.
4. Gjøre konsekvensen av valget konkret.
5. Åpne en relasjon eller lukke en relasjon litt.
6. Peke mot en senere konflikt uten å starte en helt ny stor scene.

Hvis hovedmailen spør: «Hva gjør du?», skal threaden svare: «Slik ble det oppfattet.»

## 2. Forskjellen på hovedmail og thread

### Hovedmail

```text
Noe skjer.
Du må velge.
Valget peker i en retning.
```

### Thread

```text
Noen reagerer.
Relasjonen flytter seg litt.
Konsekvensen blir synlig.
```

Threaden skal derfor være kortere, skarpere og mer relasjonell enn hovedmailen.

## 3. Grunnform

Alle nye threads bør følge denne formen:

```json
{
  "id": "inger_thread_tall_a",
  "from": "inger_avdelingsleder",
  "place_id": "lilleborg_fabrikker",
  "subject": "Re: Tall for september — vi må snakke",
  "phase": "intro",
  "priority": 70,
  "cooldown": 0,
  "purpose": "Vise at Inger belønner realistisk ansvar og gir spilleren en konkret frist.",
  "stakes": "Spilleren får tillit, men også en plass i Ingers tidsplan.",
  "situation": [
    "Kort reaksjon.",
    "Hva avsenderen sier.",
    "Hva dette betyr sosialt."
  ],
  "choices": [
    {
      "id": "A",
      "label": "Kort svar.",
      "reply": "Kort svar.",
      "tags": ["legitimacy"],
      "effect": 0,
      "feedback": "Kort etterklang."
    }
  ]
}
```

`purpose` og `stakes` skal beskrive threadens funksjon, ikke gjenta hovedmailens formål.

## 4. Lengde

En thread skal være kort.

Normal lengde:

- `subject`: helst `Re: <opprinnelig emne>`
- `situation`: 2–3 linjer
- samlet situasjonstekst: ca. 35–80 ord
- `choices`: normalt 1 valg
- `feedback`: 1 setning

Threaden kan ha 2 valg bare hvis svaret faktisk åpner et nytt sosialt valg. Ellers skal den være enkel.

## 5. Hva threaden skal gjøre dramaturgisk

En thread kan ha ulike funksjoner.

### Bekreftelse

Viser at spilleren gjorde noe som ble oppfattet positivt.

Eksempel:

```text
Egil sier ikke mye, men han gir deg neste oppgave.
```

### Korrigering

Viser at svaret var forståelig, men ikke helt riktig sosialt.

Eksempel:

```text
Marit svarer høflig, men markerer at systemet fortsatt trenger din egen bekreftelse.
```

### Åpning

Åpner en relasjon eller fremtidig linje.

Eksempel:

```text
Roger sier at du kan komme til ham hvis ledelsen presser pauser eller overtid.
```

### Lukking

Viser at en person trekker seg litt unna.

Eksempel:

```text
Liv svarer kort. Hun fikk en regel, men ikke den kunnskapen hun spurte etter.
```

### Forpliktelse

Gir spilleren en frist, avtale eller forventning.

Eksempel:

```text
Inger gir deg fredag 16:00. Tillit blir til deadline.
```

### Posisjonering

Viser at svaret ditt plasserer deg i en allianse eller utenfor en allianse.

Eksempel:

```text
Stein går videre med forslaget alene. Du er høflig ute av rommet.
```

## 6. Threadens valg

Thread-valg skal være korte og konkrete.

Gode thread-valg:

```text
«Greit. Jeg er der.»
«OK. Jeg leser og bekrefter.»
«På vei.»
«Vi ses 09:30.»
```

Dårlige thread-valg:

```text
Bygg tillit
Vær strategisk
Svar positivt
Ta ansvar
```

En thread bør ikke skape store, nye beslutningstrær med mindre den bevisst starter en ny relasjonell bue.

## 7. Threadens feedback

Feedback i threads skal vise den lille ettervirkningen.

God feedback:

```text
Avtalen står. Tor noterer.
Roger registrerer deg som en allierbar.
Du holder døra på gløtt, men du har lukket et lite vindu.
```

Dårlig feedback:

```text
Du får +1 tillit.
Dette var et godt valg.
Relasjonen forbedres.
```

Systemet kan lese tags og effect. Teksten skal vise menneskelig reaksjon.

## 8. Tags i threads

Thread-tags skal være få og presise.

Typiske tags:

```text
legitimacy
visibility
relations
alliance
isolation
mentor
process
humility
loyalty_to_workers
loyalty_to_leader
avoidance
risk
```

Thread-tags bør helst forsterke retningen fra hovedvalget, ikke introdusere helt ny tematikk.

## 9. Når man skal bruke threads

Bruk thread når:

- valget er sosialt viktig
- en NPC bør reagere direkte
- relasjonen bør flytte seg litt
- svaret kan åpne en senere konflikt
- spilleren bør føle at valget faktisk ble sendt til noen

Ikke bruk thread når:

- valget bare avslutter en enkel oppgave
- feedbacken allerede gjør jobben
- threaden bare gjentar hovedmailen
- du ikke har en tydelig avsenderreaksjon

## 10. Kvalitetssjekk før en thread legges inn

Før en thread legges inn, sjekk:

1. Er threaden direkte knyttet til et valg?
2. Reagerer avsenderen på det spilleren faktisk valgte?
3. Har threaden et eget `purpose`?
4. Har threaden egne `stakes`?
5. Er den kortere enn hovedmailen?
6. Endrer den relasjonen eller situasjonen litt?
7. Har den en tydelig stemme?
8. Unngår den å starte en helt ny stor sak uten grunn?
9. Har den konkrete valg/replikk?
10. Gir feedbacken sosial etterklang?

## 11. Standard arbeidsflyt for å skrive threads

For hver hovedmail:

1. Les hovedmailens `purpose` og `stakes`.
2. Les hvert valg.
3. Spør: Hvordan ville avsenderen reagert på akkurat dette svaret?
4. Skriv én kort Re:-mail per viktig valg.
5. Gi threaden eget `purpose` og `stakes`.
6. Hold situasjonen kort.
7. Gi normalt bare ett svarvalg.
8. La feedbacken vise sosial etterklang.

## 12. Retning

Threads skal gjøre Civication levende.

De skal skape følelsen av at arbeidslivet ikke bare består av oppgaver, men av mennesker som husker hvordan du svarte.

Hver thread skal derfor spørre:

```text
Hvordan ble svaret ditt oppfattet?
Hva åpnet det?
Hva lukket det?
Hvem ser deg litt annerledes nå?
```

Dette er standarden for threads fremover.
