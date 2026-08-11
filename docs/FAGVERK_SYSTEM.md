# History Go – fagverk og stedskoblinger

Status: canonical pilot  
Runtime: `js/fagverk.js`, `js/ui/place-learning-surface.js`  
Data: `data/fagverk/fagverk_registry.json`, `data/fagverk/<fag>/<kapittel>.json`  
Side: `fagverk.html`

## Rolle

Fagverket er et eget leselag mellom steder, emner, begreper og progresjon.

- Stedspopupen gir en konkret inngang fra sted til fag.
- `fagverk.html` gir sammenhengende lærestoff.
- `emner.html` beholder rollen som brukerens progresjonsoversikt.
- Quiz og læringslogg kan senere kobles til kapitlene uten at fagteksten gjøres avhengig av fullført quiz.

Fagverket skal ikke opprette parallelle fag-ID-er. Det bruker canonical kategori- og emne-ID-er og registrerer bare presentasjonskapitler, begrepsinnganger og stedskoblinger.

Redaksjonell heldekning og ferdigstatus eies av `docs/FAGVERK.md`: alle relevante emner skal behandles, mens antall emner, kapitler, seksjoner, claims, kilder og oppgaver kan variere med faget og aldri alene bevise at innholdet er komplett.

## Informasjonsmodell

`fagverk_registry.json` eier:

- fag og kapitler;
- filsti til hvert kapittel;
- lesbare navn for relevante canonical emne-ID-er;
- hvilke kapitler og begreper et sted skal kobles til.

Et kapittel skal minst ha:

- tittel, undertittel og ingress;
- læringsmål;
- sammenhengende seksjoner;
- hovedpoenger;
- begrepsregister;
- kontrollspørsmål med svar;
- relevante steder;
- inspectable kilder.

Listen angir nødvendige innholdstyper, ikke faste mengder. Kapitlene skal ha det omfanget stoffet krever, uten kunstig oppsplitting eller fyllstoff.

## Stedspopup

`place-learning-surface.js` venter til canonical `place-popup-v2.js` er installert og wrapper deretter `showPlacePopup`.

Seksjonen **Fag og begreper** settes inn rett etter `popupDesc` og viser:

- relevante begreper;
- relevante emner;
- relevante fagkapitler;
- dypkobling til fagverket med `place`, `chapter`, `concept` og `emne` som søkeparametre.

Seksjonen vises uavhengig av quizstatus.

## Tilknytning

Det samme runtime-laget erstatter bare presentasjonen fra `renderRelationRow`:

- hele hovedflaten i relasjonskortet åpner canonical person eller sted;
- kildelenken er en separat, ekte ekstern lenke;
- kildeklikk skal ikke samtidig åpne relasjonsmålet;
- relasjoner uten canonical mål vises uten falsk interaktivitet.

Relations-data og runtime-index endres ikke.

## Pilot

Regjeringskvartalet er første stedskobling. Det peker til:

- Offentlig forvaltning;
- Parlamentarisme;
- relevante canonical emner;
- begreper som utøvende makt, departement, embetsverk, byråkrati, etatsstyring, mistillit og opplysningsplikt.

## QA

Kjør:

```bash
node --check js/fagverk.js
node --check js/ui/place-learning-surface.js
node --check js/ui/place-card-status-surface.js
node --test tests/fagverk-content.test.mjs
node --test tests/place-learning-surface.test.js
```
