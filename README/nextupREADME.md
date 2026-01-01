# PlaceCard · NextUp · TriNext  
**History GO – kunnskapsnavigasjon i byrom**

---

## Hva dette er

Dette arbeidet utvider **PlaceCard** i History GO med et rolig, men kraftig
navigasjonssystem for **mening**, ikke bare handling.

Vi har:
- beholdt eksisterende **NextUp** (handling)
- lagt til **TriNext** (kunnskapsretninger)

Uten å lage et nytt subsystem. Alt er påbygg.

---

## Grunntanke

“Neste” er ikke én ting.

History GO skiller nå mellom tre **uavhengige dimensjoner**:

1. 🧭 **Romlig neste**  
   → hvor kan jeg gå videre fysisk?

2. 📖 **Narrativ neste**  
   → hva er neste kapittel i historien jeg er inne i?

3. 🧠 **Begrepsmessig neste**  
   → hvilket begrep/perspektiv utdyper det jeg nettopp møtte?

Disse:
- konkurrerer ikke
- erstatter ikke hverandre
- vurderes separat
- vises bare når de faktisk gir mening

---

## UI-oppsett

### 1) NextUp (eksisterende)
NextUp er **handlingslaget** i PlaceCard.

Den viser:
- **Nå** – status (avstand, radius)
- **Neste** – én konkret handling (quiz / unlock / rute / observasjon / info)
- **Fordi** – forklaring på status

Dette laget er:
- praktisk
- kroppslig
- alltid trygt å vise

---

### 2) TriNext (nytt)
TriNext er **kunnskapsnavigasjonen**.

Den består av tre diskrete linjer:

- 🧭 **Gå videre** – romlig forslag (sted)
- 📖 **Fortsett historien** – narrativ progresjon
- 🧠 **Forstå mer** – faglig/begrepsmessig fordypning

Viktig:
- Hver linje vurderes uavhengig
- Hvis det ikke finnes grunnlag → vises `—`
- Ingen fallback mellom dimensjonene

TriNext er en **invitasjon**, ikke en handling.

---

## Når vises de ulike dimensjonene?

### 🧭 Gå videre
- Kan vises ofte
- Fallback tillatt (f.eks. nærmeste sted)
- Ender alltid i et **sted**

### 📖 Fortsett historien
Vises **kun hvis**:
- stedet/personen er del av en eksplisitt definert story
- det finnes et faktisk “neste kapittel”

Ingen story → ingen visning.

### 🧠 Forstå mer
Vises **kun hvis**:
- stedet/personen bærer et begrep
- begrepet går igjen flere steder
- det finnes et emne i fagkartet som faktisk utdyper forståelsen

Ingen begrep → ingen visning.

---

## Datagrunnlag (ingen gjetting)

TriNext bygger kun på **kurert data** som allerede finnes:

- `quiz_by.json`
  - `core_concepts`
  - `emne_id`
- `emner_by.json`
  - `core_concepts`
- `emnekart_by.json`
- `fagkart_by_oslo.json`
- (valgfritt) `stories_by.json`

Det brukes:
- ingen tekstmatching
- ingen “wow-ord”
- ingen prediksjon

Alt er eksplisitt definert i data.

---

## Teknisk arkitektur (kort)

### `openPlaceCard`
- Er nå `async`
- Rekkefølgen er viktig:

1. Sett basisinnhold (tittel, bilde, tekst)
2. Bygg `persons`
3. Render **NextUp HTML**
4. Fyll **TriNext** (nå finnes DOM + data)
5. Bind klikk

---

## NextUp-klikk (robust)

NextUp bruker nå `querySelectorAll` slik at flere knapper kan fungere samtidig:

```js
nextUpMount.querySelectorAll("[data-nextup]").forEach(btn => {
  btn.onclick = () => {
    const a = btn.dataset.nextup;
    if (a === "quiz")    return btnQuiz?.onclick?.();
    if (a === "unlock")  return btnUnlock?.onclick?.();
    if (a === "observe") return btnObs?.onclick?.();
    if (a === "route")   return btnRoute?.onclick?.();
    if (a === "info")    return btnInfo?.onclick?.();
    return btnInfo?.onclick?.();
  };
});

TriNext-klikk (data-tri)

TriNext bruker data-tri og kolliderer ikke med NextUp.

Tre handlinger:
	•	goto → åpner nytt sted i placeCard
	•	story → åpner neste beat (sted) i story
	•	emne → åpner emneside: knowledge_by.html#<emne_id>

⸻

Hvorfor dette er bygget slik
	•	Unngår “enda et system”
	•	Unngår AI-gjetting
	•	Unngår overforklaring i UI
	•	Skiller tydelig mellom:
	•	handling (🧭)
	•	fortelling (📖)
	•	forståelse (🧠)

Systemet vet også når det skal tie.

⸻

Hva dette muliggjør videre

Uten å endre strukturen kan man senere legge til:
	•	kontrast-navigasjon (samme begrep, annet uttrykk)
	•	personlige spor (rom / historie / begrep)
	•	fagkart-visualisering basert på faktisk bruk
	•	redaksjonell kuratering uten nye UI-flater

⸻

Kort oppsummert

PlaceCard er nå:
	•	et sted å handle
	•	et sted å forstå
	•	et sted å fortsette

Uten å bli:
	•	masete
	•	prediktivt
	•	sosialt støy

Dette er et epistemisk grensesnitt mellom by, historie og teori.
