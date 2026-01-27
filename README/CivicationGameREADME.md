
Bra. Da gjør vi dette ordentlig, rolig og uten snarveier.

Nedenfor er en full spesifikasjon av det vi faktisk bygger nå.
Dette er ikke kode. Ikke pseudokode.
Dette er kontrakten motoren skal implementere – én gang, riktig.

⸻

📐 Civication Event Engine

Spesifikasjon v0.1

⸻

1. Formål

Civication Event Engine er ansvarlig for å:
	•	forvalte hendelser (jobbmail / NAV-mail)
	•	håndtere konsekvenser av brukerens valg
	•	oppdatere jobbstabilitet og jobbstatus
	•	avgjøre tap av jobb og overgang til arbeidsledig

Motoren er:
	•	deterministisk
	•	hendelsesbasert
	•	ikke tidsstyrt
	•	uavhengig av UI
	•	uavhengig av innholdstekst

⸻

2. Avgrensning (hva motoren er – og ikke er)

Motoren GJØR:
	•	velger passende hendelse basert på tilstand
	•	håndterer valg → konsekvens
	•	oppdaterer jobbstatus
	•	sørger for at advarsel kun gis én gang
	•	avgjør når jobben tapes

Motoren GJØR IKKE:
	•	renderer UI
	•	viser tekst visuelt
	•	bestemmer når appen åpnes
	•	teller tid / dager / uker
	•	styrer quiz-systemet direkte
	•	inneholder innholdstekst

⸻

3. Grunnleggende begreper

3.1 Rolle

En bruker kan ha:
	•	én aktiv rolle (jobb)
	•	eller være arbeidsledig

Rollen er knyttet til:
	•	et badge / kategori
	•	et sett hendelser (jobbmailer)

⸻

3.2 Hendelse (Event)

En hendelse er:
	•	én mail
	•	med situasjon
	•	med 0–3 valg
	•	med konsekvens per valg

Hendelser er definert i rene datafiler (JSON).

⸻

3.3 Jobbstabilitet

Jobbstabilitet er en intern tilstand, ikke et synlig tall.

Motoren opererer med tre eksplisitte nivåer:
	•	STABLE
	•	WARNING
	•	FIRED

Det finnes ingen numerisk meter i UI.

⸻

4. Tilstander og overganger

4.1 Starttilstand

Når en jobb aksepteres:
	•	stabilitet = STABLE
	•	advarsel_brukt = false

⸻

4.2 STABLE
	•	normale jobbmailer kan forekomme
	•	små negative valg kan akkumuleres
	•	positive valg kan nøytralisere tidligere feil

Overgang:
	•	hvis negativ terskel passeres → WARNING

⸻

4.3 WARNING
	•	én eksplisitt advarselsmail sendes
	•	denne kan kun skje én gang per jobb
	•	etter advarsel er spiller på siste sjanse

Overgang:
	•	nytt alvorlig negativt valg → FIRED
	•	positiv stabilisering → tilbake til STABLE (valgfritt, men tillatt)

⸻

4.4 FIRED
	•	jobben avsluttes umiddelbart
	•	aktiv rolle fjernes
	•	jobbmailer stoppes
	•	NAV-mailer aktiveres

Dette er ikke game over.

⸻

5. Arbeidsledig tilstand

Når bruker er arbeidsledig:
	•	motoren velger kun hendelser med stage = unemployed
	•	disse er informerende / konsekvensbaserte
	•	ingen valg er påkrevd

Comeback:
	•	skjer utelukkende via eksisterende quiz/threshold-system
	•	motoren har ingen rolle i jobbsøknad

⸻

6. Hendelsesvalg (Event Selection)

Motoren velger hendelse basert på:
	1.	Har brukeren aktiv jobb?
	2.	Hvilken rolle?
	3.	Hvilken stabilitet (STABLE, WARNING)
	4.	Hvilke hendelser er allerede brukt?

Regler:
	•	samme hendelse skal ikke gjentas i samme jobbperiode
	•	advarselsmail (is_warning_mail) kan kun velges én gang
	•	FIRED-hendelsen er terminal

⸻

7. Brukerinteraksjon

Når brukeren:
	•	åpner appen
	•	og motoren har en tilgjengelig hendelse

→ motoren leverer maks én hendelse per åpning

Motoren bryr seg ikke om:
	•	klokkeslett
	•	hvor ofte appen åpnes

⸻

8. Konsekvensmodell

Hvert valg har en effekt:
	•	+1 stabiliserende
	•	0 nøytral
	•	-1 destabiliserende

Motoren:
	•	anvender effekten
	•	evaluerer overgang
	•	oppdaterer tilstand
	•	returnerer feedback-tekst

⸻

9. Persistens (hva må lagres)

Motoren forventer at følgende lagres mellom sesjoner:
	•	aktiv rolle (eller arbeidsledig)
	•	stabilitet
	•	om advarsel er brukt
	•	hvilke hendelser som er konsumert
	•	historikk over jobbperioder (valgfritt, men støttet)

⸻

10. Utvidbarhet (uten omskriving)

Denne spesifikasjonen tillater senere:
	•	flere roller
	•	flere hendelsestyper
	•	situasjoner fra samtiden
	•	ranking / sammenligning
	•	mer komplekse konsekvenser

Uten å endre:
	•	grunnleggende tilstander
	•	overgangslogikk
	•	datamodell

⸻

11. Status

📌 Denne spesifikasjonen er komplett for v0.1
📌 Den matcher eksisterende system (quiz, thresholds, offers)
📌 Den krever ingen tidsmekanismer
📌 Den er implementerbar direkte i JS

⸻

Neste steg (når du vil)

Neste steg er implementasjon, men på riktig måte:
	•	enten:
	•	en domene-klasse / modul som følger denne spesifikasjonen punkt for punkt
	•	eller:
	•	først et tilstandsdiagram i kodekommentarer, deretter kode

Si hva du vil gjøre videre.
Eller si “stopp” – dette er et helt legitimt stoppunkt.








.......






La meg destillere det du sier til en enkel, morsom, spillbar kjerne – uten scope creep.

⸻

Hva du egentlig beskriver (og som funker)

Ikke “quiz”.
Ikke “nyheter”.
Men:

Jobbhverdagen som et lett rollespill med konsekvenser.

Tone:
	•	litt humor
	•	litt stress
	•	litt “å nei…”
	•	litt mestring

Veldig bra.

⸻

Systemet i én setning

Aktiv jobb genererer små hendelser i “jobbmailen”.
Du tar raske valg.
Valgene akkumuleres.
Over tid får det konsekvenser.

Det er det. Ferdig.

⸻

1) Jobbmail = inngang til spillet

Ikke popups. Ikke mas.
En enkel liste:

📬 Jobbinnboks
	•	1–3 meldinger i uka
	•	korte
	•	lesbare på 10 sek

Eksempler:
	•	“En kollega har tatt en snarvei i arbeidet. Hva gjør du?”
	•	“Du blir bedt om å prioritere X over Y. Hvor står du?”
	•	“Noen klager på arbeidet ditt. Ignorer, svar, eskaler?”

Dette er:
	•	rolle-spesifikt
	•	lett
	•	morsomt
	•	ikke faktatungt

⸻

2) Game-quizzer ≠ faktakunnskap

Viktig skille (du har helt rett):

Disse oppgavene er:
	•	logiske
	•	etiske
	•	prioriteringer
	•	vurderinger

Ikke:
	•	“hva skjedde i 1814”
	•	“hvem var statsminister”

Det er leder-/rolleintelligens, ikke skole.

⸻

3) Eget, skjult system: “jobbstabilitet”

Ikke vis masse tall.
Bare følelse.

I bakgrunnen:
	•	gode valg → stabilitet ↑
	•	dårlige valg → stabilitet ↓

Bruk 3 tilstander:
	•	🟢 Stabil
	•	🟡 På prøve
	•	🔴 I trøbbel

Det er nok.

⸻

4) Feedback = humor + drama

Dette er gull.

Gode valg:
	•	“Ledelsen er fornøyd.”
	•	“Dette styrker tilliten til deg.”
	•	“Du håndterte situasjonen klokt.”

Dårlige valg:
	•	“Dette ble lagt merke til.”
	•	“Du får en litt kjøligere mail.”
	•	“Det murres i gangene.”

Ikke moraliser.
Bare konsekvens.

⸻

5) Hva som skjer hvis du “kommer i problemer”

Ikke game over. Aldri.

Men:
	•	du kan få flere mails (stress)
	•	du kan miste aktiv rolle midlertidig
	•	du må “rydde opp” (ta 1–2 ekstra oppgaver)
	•	eller du får et nytt jobbtilbud (omplassering 👀)

Dette er veldig Civication.

⸻

6) Hvorfor dette er perfekt NÅ

Dette:
	•	bruker aktiv jobb (som du allerede har)
	•	krever ingen nyhetsintegrasjon
	•	kan startes med 10–15 ferdige scenarioer
	•	skalerer ekstremt godt

Og viktigst:

Spilleren føler at noe skjer, uten at de må jobbe.

⸻

Minimal implementering (så vi ikke ødelegger flyt)

Hvis vi skulle gjort dette i MVP-form:

v0.2 – Jobbmail (light)
	•	1 tilfeldig mail per uke per aktiv jobb
	•	2–3 svaralternativer
	•	lagres i hg_job_events_v1
	•	påvirker job_stability (intern)

Ingen UI utover:
	•	liten “📬 1 ny melding” på profilsiden
	•	enkel les + svar

⸻

Ærlig vurdering

Dette er:
	•	mye bedre enn nyhetsidéen
	•	morsommere enn bare vedlikehold
	•	lettere enn full Civ/Sims
	•	veldig deg i tone

Du har helt rett:
Spillet må være lett, litt rampete og litt dramatisk.

Hvis du vil, kan neste steg være:
	•	å definere formatet på én jobbmail (JSON, 10 linjer)
	•	eller å lage 5 eksempelscenarioer for én rolle

Si hva du vil gjøre først – så holder vi det enkelt.
