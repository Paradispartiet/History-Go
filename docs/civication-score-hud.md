# Civication – score i headeren (v1)

## Formål
Én liten sirkulær scoreknapp i headeren, med en klikkbar oversikt over alle målte
skalerbare indikatorer. Visningen skal være enklere enn den gamle statusrekka.
«Min dag» viser den aktive fortellingen og valget fremst, mens historikk skjules
bak sammenleggbare deler. En dempet palett (turkis, rav, fiolett) gir retning uten
å gjøre en historiefortelling til et trafikklys.

## Hva 0–100 betyr
- Alle **viste indikatorer** har en 0–100-skala. Tallene avrundes i HUD.
- Life Story: psyke, energi, integritet, synlighet, handlingsrom og målte relasjoner
  følger eksisterende kanonisk clamping på 0–100.
- Skills: de seks dokumenterte egenskapene vises på eksisterende 0–100-skala.
  «Ikke målt» er ikke 0, og får ingen plass i gjennomsnittsberegningen.
- Psyke: integritet, synlighet, økonomisk handlingsrom, autonomi,
  psykologikompetanse og tillitsgjennomsnitt **når tillit er målt**.
- Kapital: syv eksisterende kapitalmål vises på 0–100. Verdier over 100
  presenteres som 100, men spillets kapital-/identitetsmotor beholdes uendret.
- Omdømme: kilden benytter −100 til +100; bare visningen omregner
  dette lineært til 0–100, der −100=0, 0=50 og +100=100.
- PC-saldo og fortellingspenger kan vokse eller bli negative og er
  **ikke** poengskalaer. De er ikke med i gjennomsnittet.
- Identitetens retningsvekter er preferanser, ikke ferdighetsnivåer.
  De inngår derfor heller ikke i den samlede prestasjonsscoren.

Den store scoren er det avrundede **aritmetiske gjennomsnittet av alle
målte, viste 0–100-indikatorer**, med én stemme per målt verdi.
Den er en oversikt over nåsituasjonen, ikke en ny lagret verdi, formell
jobbautorisasjon, nivåport eller erstatning for enkeltverdienes mekanikker.

Ulike systemer kan ha liknende navn, men ulike kanoniske lagringer.
De merkes med gruppenavn i detaljvinduet, slik at spilleren ikke forveksler
Life Story-psyke med Psyke-systemets andre dimensjoner.

## Akseptanse
1. Rolle, dag og fase forblir intakte, også etter jobbskifte.
2. Score-knappen har ett tall, kan åpnes med tastatur og er operativ på mobil.
3. Dialogen viser alle målte indikatorer, med tydelig «Ikke målt» for ukjente Skills.
4. Beregning og rerendering endrer aldri gamle saves eller progresjon.
5. Headeren og scoreknappen skal ikke hoppe ved vanlige updateProfile-hendelser.
6. 21-dagersreisen og øvrige Civication-tester skal fortsatt være grønne på
   siste commit før merge av PR #6554.
