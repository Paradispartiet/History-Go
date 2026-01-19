OPPGAVER OG IDEER

OPPGAVER

A) Produkt og opplevelse (UX / gamefeel)
	•	Nearby skal føles som “oppdrag”: unlockede steder forsvinner fra nærmeste (egen “alle”-liste).
	•	Bedre CTA-ord (“gå/fortsett” → presis handling).
	•	Profil skal føles som “jeg lever et eventyr” (reise/logg).

B) Visuell design (UI/grafikk)
	•	Stabil nearby horisontal strip (row2): høyde/align/overflow/snap.
	•	PlaceCard: én kompakt ikonrad nederst (mindre ikoner).
	•	Badge i øvre høyre hjørne på bilde.
	•	Face-bilder opp fra under miniprofil → tydelig plass i UI.
	•	Sort/neon: konsistente aksentfarger og komponent-states.

C) Funksjonell app-struktur (state / moduler)
	•	Fikse placeCard “to versjoner” ved klikk (dobbel-render).
	•	Nearby tabs: Places / Flora / Fauna / Brands med stabil view-switch.
	•	Fjerne duplisert relasjonsvisning (tilknytning vs samme navn via bilder).

D) Datastruktur og innholdssystem (content-pipeline)
	•	RuntimeIndex (epoker/domener) + rask lookup.
	•	Emnepakker (fauna/insekter): validering + konsistens i felt.
	•	Brands/logoer/bilmerker: domeneplassering + underkategorier + samlesystem.

E) Infrastruktur og ytelse (offline/caching)
	•	Service worker cache-strategi for JSON + assets (kontrollert invalidasjon).
	•	Preload/stream store filer (unngå tung start).
	•	Bilde-cache og fallback-håndtering.

F) Kvalitet og vedlikehold (QA/opprydding)
	•	CSS-overstyringer: theme/base/layout/components ryddes for forutsigbarhet.
	•	“Alt ble sort”-typen feil: guards + enkel diagnose.
	•	Missing images: robust rapport (hva mangler + filnavn), ikke divergerende lister.

G) Sikkerhet og tilgang (testmode/betaling/låsing)
	•	TEST_MODE må ikke lekke inn i normal bruk.
	•	Betalingsmodus: definere hva som er låst, preview, og hva som trigges når.
	•	Unngå “unlock alt”-state på retur til forside.

H) Metastruktur (arkitektur/visjon)
	•	Wonderkammer/relasjoner/epoker: modulgrenser og rolle.
	•	Profilens “Reise/Logg/Min dag”-lag: konkret datamodell + visning.








Forstått. Her er **kun History Go**, og **alle pågående oppgaver**, strukturert **dypt**, teknisk og praktisk – slik systemet faktisk er bygget og brukes nå.
Ingen strategi-prat, ingen EchoNet, ingen fremtidssnakk. Bare arbeid.

---

# HISTORY GO – FULL OPPGAVEOVERSIKT (DYPT)

---

## A. **Datagrunnlag (kritisk ryggrad)**

### A1. Steder (`places.json` + relaterte filer)

**Status:** Delvis komplett, voksende

**Oppgaver**

* Fullføre alle bydeler med:

  * konsekvent `id`
  * korrekt `category` (kun gyldige HG-kategorier)
  * riktige koordinater og radius
* Rydde:

  * gamle kategorier / feil navn
  * duplikater
* Sikre:

  * at steder kan ha **flere merker samtidig**
  * at dette gjenspeiles i UI (flerfarget kant)

**Åpne problemer**

* Ulik struktur på eldre vs nye steder
* Noen steder mangler kortbilde eller har feil filnavn

---

### A2. Personer (`people.json`)

**Status:** Stabil struktur, men ufullstendig innhold

**Oppgaver**

* Fullføre:

  * `imageCard` og `cardImage` (konsekvent bruk)
  * relasjoner (steder ↔ personer)
* Koble personer tydelig til:

  * bydel
  * fag / emne
* Kontrollere:

  * årstall
  * skrivefeil (absolutt nulltoleranse)

---

### A3. Natur / fauna / flora (nye datasett)

**Status:** Aktiv utvidelse

**Oppgaver**

* Ferdigstille samlegrupper:

  * insekter
  * planter
  * trær
* Sikre:

  * lik struktur i alle emner
  * riktig `habitat`, `fenologi`, `økologi`
* Avklare:

  * hva som gir quiz
  * hva som kun er kunnskapskort

---

## B. **Kort-systemet (visuelt og semantisk)**

### B1. Kortmal (standard)

**Status:** Definert, men må håndheves konsekvent

**Krav (fast)**

* 2:1-format
* Ingen beskjæring
* Hvit innside
* Transparent / mørk bakgrunn utenfor
* Riktig merke øverst venstre
* History Go-logo nederst høyre
* PNG, korrekt filnavn (`.PNG`)

**Oppgaver**

* Ettergå ALLE eksisterende kort:

  * finne avvik
  * erstatte feil
* Lage én intern “fasit” for kort (mentalt allerede gjort – må følges slavisk)

---

### B2. Forside/bakside-logikk

**Oppgaver**

* Forside = bilde + identitet
* Bakside =:

  * tekst
  * relasjoner
  * merker
* Sikre at:

  * relasjoner kan vises via bildeklikk
  * samme relasjon ikke vises dobbelt

---

## C. **Merke- og progresjonssystem**

### C1. Merker (øverste nivå)

**Status:** Aktiv, men uferdig kobling

**Oppgaver**

* Sikre at:

  * alle merker er definert
  * alle har farge
  * alle brukes faktisk
* Merker skal:

  * knyttes til steder
  * knyttes til personer
  * vises på kort
  * vises på profilsiden

---

### C2. Nivåer

**Fast struktur**

* Bronse
* Sølv
* Gull
* Pokal

**Oppgaver**

* Tydeliggjøre:

  * når man går fra nivå til nivå
  * hva som utløser pokal
* Implementere:

  * tydelig visuell forskjell
  * popup / feedback (uten støy)

---

## D. **Quiz-systemet**

### D1. Quiz-data

**Status:** Fungerende, men ujevnt

**Oppgaver**

* Rydde quizfiler:

  * én struktur
  * én standard
* Sikre:

  * at alle quizzer gir progresjon
  * at riktige svar lagres korrekt
* Avklare:

  * når quiz låses opp
  * når quiz repeteres

---

### D2. Quiz → profil

**Oppgaver**

* Sikre at:

  * `saveQuizHistory()` alltid trigges korrekt
  * `window.dispatchEvent("updateProfile")` alltid fyres
* Ettergå:

  * hvor progresjon ikke oppdateres live

---

## E. **Profilside (brukerens sentrum)**

### E1. Samlet oversikt

**Status:** Fungerer, men blir for tung

**Oppgaver**

* Legge scroll der det mangler
* Skille tydelig:

  * steder
  * personer
  * merker
  * kunnskap
* Rydde:

  * for lange lister
  * overlappende elementer

---

### E2. Live-oppdatering

**Oppgaver**

* Sikre at:

  * alle endringer i progresjon oppdaterer profilen umiddelbart
  * ingen skjulte cache-feil

---

## F. **PlaceCard (bottom sheet)**

### F1. Struktur

**Status:** Nær ferdig

**Oppgaver**

* Finjustere:

  * høyde
  * spacing
* Sikre:

  * at relasjoner vises riktig
  * at bilder er primær inngang til utforskning

---

### F2. Relasjoner via bilde

**Oppgaver**

* Implementere:

  * klikk på bilde → relaterte personer/steder
* Unngå:

  * teksttunge løsninger

---

## G. **Navigasjon og flyt**

### G1. Kart ↔ kort ↔ profil

**Oppgaver**

* Sikre intuitiv flyt:

  * kart → kort
  * kort → relasjoner
  * relasjoner → profil
* Ingen døde klikk
* Ingen “hva gjør jeg nå”-øyeblikk

---

## H. **Feilsikring og disiplin**

### H1. Konsistensregler (må håndheves)

* Ingen nye kategorier uten definisjon
* Ingen nye kort uten korrekt mal
* Ingen nye data uten å rette kilden
* Ingen quick-fixes

---

## I. **Rydding (teknisk gjeld)**

**Oppgaver**

* Fjerne:

  * gammel kode
  * ubrukt struktur
  * halvt implementerte ideer
* Ettergå:

  * app.js (lukkede klammer, kommentarer)
  * CSS-duplikater

---











//________________//


IDEER

1) Kjerneopplevelse
	•	Bykartet som “spillbrett”: prikkene/stedene på kartet er ting du kan oppdage, besøke, låse opp.
	•	Unlock-motor: låser opp steder/objekter når du er nær nok (radius), appen er i bruk, og du gjør en handling (åpne, lese, quiz, osv).
	•	Progresjonsfølelse: unlockede steder skal kunne forsvinne fra “Nærmeste” (og heller ligge i en “Alle”-liste), så du alltid får “nytt å gå etter”.

2) Places (steder)
	•	Place-popup / placeCard med:
	•	Mer info
	•	Ta quiz
	•	Lås opp
	•	Rute
	•	Observasjon + Notat
	•	Lukk
	•	“Nærmeste places”-panel under topplinja, full bredde, horisontal scroll (row2/strip).
	•	Steder kan være alt fra klassisk historie til “natur i byen” (sweetspots, utsikt, parker, offentlige steder).

3) People (personer)
	•	People knyttet til steder via relasjoner (person ↔ sted).
	•	People/face-bilder som samleelement/visuelt lag (og de må ha riktig plass i UI – ikke skjult).
	•	Popup kan få linker videre til merker/fagkart/emner når relevant.

4) Routes (ruter)
	•	“Rute”-knappen i placeCard.
	•	Ruter som del av progresjon (gå ruter, få oppsummering “denne uka…”).
	•	Ruter som egen innholdstype i historieloggen (tid, sted, rute).

5) Quiz og læring
	•	QuizEngine integrert i appflyten:
	•	quizresultater lagres og vises på profilsiden
	•	“nylig lært” / fakta / emner
	•	Skille mellom:
	•	Knowledge-siden (kunnskap/oversikt)
	•	Profil (hva du faktisk har gjort og lært, som historikk)

6) Badges / merker / samling
	•	Badges som progresjonsmotor på tvers av moduler (steder, ruter, flora/fauna, brands).
	•	

7) Profil som “Facebookside for kunnskap”
	•	Profilen skal reflektere:
	•	interesser
	•	kunnskap
	•	hva du har gjort
	•	Sosialt lag som idé: venner / lister / deling (nevnt som retning).
	•	Reise / Logg / Min dag-laget (limet i systemet):
	•	besøkshistorikk (tid, sted, rute)
	•	nylig låst opp
	•	nylig lært
	•	minner/observasjoner/notater knyttet til turer
	•	ukesoppsummering (“3 ruter, 5 steder, 2 emner”)

8) Observasjoner og “mapping”
	•	Egen “mapping”-idé: folk kan melde posisjoner til personer, blomster, brands, ting.
	•	Kobling til eksisterende “observasjoner”-system: observasjon → objekt dukker opp i egen boks / kan deles med venner.
	•	Observasjon som bro mellom “jeg ser noe” og “jeg samler/lærer”.

9) Flora / Fauna i byen
	•	Flora og fauna som fullverdig Nearby-modus (tabs):
	•	“Flora”
	•	“Fauna”
	•	Emnepakker/arter med:
	•	habitat, fenologi, kjennetegn, bykontekst, osv.
	•	Kort/collectibles for arter (du har hatt en tydelig arbeidsflyt: tekst → bilde → ferdig kort).

10) Brand GO: logoer, bilmerker, næringsliv
	•	Brands/logoer som samlesystem (analogt med flora/fauna).
	•	“Næringsliv”-kategori med underkategorier:
	•	kanoniserte bedrifters logoer
	•	bilmerker
	•	evt. “teknologi” som underdomene (diskutert)
	•	Kartvisning som små logo-ikoner, puls ved nærhet, filter on/off.
	•	Samlelogikk: grå (låst) vs farge (låst opp), badges per tema.

11) Wonderkammer (digitalt “kabinettskap”)
	•	Wonderkammer som modul for:
	•	samlinger
	•	artefakter
	•	pivots/moments/story-typer
	•	“kuriose ting”
	•	Wonderkammer som opplevelse (utstilling/rom), ikke bare liste.

12) NextUp (neste anbefalte ting)
	•	NextUp som motor for:
	•	nærmeste “neste sted”
	•	narrativ “fortsett historien”
	•	konsept/emne “lær dette neste”
	•	Språk/CTA viktig (“gå” vs “fortsett” vs noe mer presist).

13) Relasjoner som bærer læring
	•	Sted ↔ person ↔ hendelse ↔ epoke ↔ artefakt.
	•	Ønske om å unngå dobbeltvisning i UI (relasjonsliste + bildeliste med samme navn).
	•	Idé: relasjonskobling kan gå “gjennom bilder” og vises smart i popup.

14) Epoker / tidslag
	•	Epoker som:
	•	filter
	•	indeks
	•	læringsdimensjon
	•	kobling i relasjoner
	•	RuntimeIndex for epoker diskutert (for ytelse og “fremtidsrett”).

15) Kunnskapskart / fagkart / domener / tags / knagger
	•	Egen “Domain registry” / referansesystem:
	•	tags
	•	knagger
	•	entry_types
	•	Fagkart/merker/emner som navigasjonsstruktur.
	•	“System Registry (LOCKED v1)” og disiplin/field/emne-konsept som ramme.

16) AHA / meta-lag (utvidelse)
	•	Et “AHA”-lag for:
	•	konseptkart
	•	heuristikk/analytisk motor
	•	meta-insights og livsløp (new/growing/mature/integrated)
	•	Flere moduser: refleksjon/fag/kreativ (som retning).

17) Kort / collectibles / visuelle assets
	•	History GO Cards som “samleobjekter” (digitalt kort per sted/person/artefakt/art/logo).
	•	Workflow du foretrekker:
	1.	tekst/korrigering
	2.	bilde/asset
	3.	ferdig kort
	•	“Låst/funnet”-visual (grå vs farge) som gjennomgående mønster.

18) Spotify / kulturkobling
	•	Idé: bruk din Spotify-samling:
	•	legge artister “i byen”
	•	sang i wonderkammer-place
	•	lenke til Spotify

19) Barn og familie (senere)
	•	Flat illustrasjonsstil som “barneversjon”.
	•	Egen kategori “Barn og familie” vurdert, men utsatt (plan senere).

20) Offline-first / PWA / caching
	•	Offline-first arkitektur.
	•	Service worker caching av:
	•	JSON
	•	bilder
	•	assets/kort
	•	Stabil lasting av store filer (preload/streaming) som retning.

21) Drift, vedlikehold og verktøy
	•	Missing images-verktøy: “hvilke steder/personer mangler hvilke bilder” (og det må være enkelt og pålitelig).
	•	CSS-struktur: unngå “lapp nederst”-kaos; samle riktig sted, unngå theme-overstyring som gjør at ting “ikke skjer”.
	•	Stabil state: unngå at testmodus/quiz gjør at alt blir “unlocka” ved retur til forsiden.

22) Monetisering / forretningsretning (som vi har nevnt)
	•	Abonnement/årlig pris (eksempel: 99/år) og også månedlig (30 kr/mnd ble nevnt).
	•	Skalerbarhet til flere byer (London/Lisboa/Paris/Istanbul/NY ble nevnt som retning).
	•	Partnerskap-tanke (museer, lokale aktører) som langsiktig mulighet.
	•	“Drit i investorer” som holdning – fokus på å få betalende brukere først (som strategi du nevnte).

⸻

Åpne “idé-hull” (ting vi har pekt på men ikke spesifisert ferdig)
	•	Presis betalingsmodell (hva er gratis vs låst, preview, osv).
	•	Moderasjon/kuratering (særlig for brand- og mapping-data).
	•	Sosial deling (hva deles, hvem ser hva, feed-format).
