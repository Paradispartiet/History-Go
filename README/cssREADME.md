# History GO — lokal CSS-guide

Status: **local**
Omfang: `index.html` og `css/`
Sist kontrollert: **2026-07-26**

Dette dokumentet er en praktisk orientering for hovedappen. Det er ikke en canonical UI-kontrakt. Den faktiske lastrekkefølgen eies av `<link rel="stylesheet">`-elementene i [`../index.html`](../index.html), og faktisk selector-eierskap avgjøres av kildekoden.

## Aktiv lastrekkefølge i `index.html`

På kontrolltidspunktet lastes appens CSS i denne rekkefølgen:

```text
css/theme.css
css/base.css
css/layout.css
css/components.css
css/search.css
css/nearby.css
css/miniProfile.css
css/profile.css
css/merits.css
css/civi.css
css/quiz.css
css/overlay.css
css/effects.css
css/map.css
css/placeCard.css
css/wonderkammer.css
css/footer.css
css/sheets.css
css/historical-routes.css
css/caravan.css
css/nature.css
css/people.css
css/onboarding.css
css/popups.css
css/popup-polish.css
js/console/console.css
```

Ikke kopier denne listen inn i andre dokumenter. Kontroller alltid `index.html` før lastrekkefølge endres.

## Cascade-regler som gjelder

- Høyere spesifisitet vinner.
- Ved lik spesifisitet vinner regelen som lastes sist.
- Inline styles og JavaScript-styrte class-/style-endringer kan overstyre filbaserte regler.
- `body.hg-app` brukes som sentral scope for hovedappen, men ikke alle sider eller filer følger samme scope.

## Praktisk ansvarskart

Dette er en arbeidsregel, ikke en absolutt maskinkontrakt:

- `theme.css`: tokens, hovedappens visuelle grunnlag og brede `body.hg-app`-regler.
- `base.css`: reset og grunnleggende typografi.
- `layout.css`: overordnet struktur, plassering og layouttilstander.
- `components.css`: generelle, gjenbrukbare UI-komponenter.
- `search.css`: søkeflaten.
- `nearby.css`: Utforsk-/Nearby-presentasjon.
- `placeCard.css`: PlaceCard-presentasjon.
- `sheets.css`: generelle sheet-/bottom-sheet-mønstre.
- øvrige featurefiler: presentasjon for den navngitte modulen eller flaten.

Når faktisk kode avviker fra dette kartet, skal enten koden konsolideres eller guiden korrigeres. Ikke anta at filnavnet alene beviser fullstendig eierskap.

## Endringsregler

1. Finn først eksisterende selector og alle forekomster av den.
2. Endre den mest avgrensede eierfila som allerede styrer komponenten.
3. Unngå å legge samme selector i flere brede filer for å «vinne» cascade-kampen.
4. Bruk feature-scope eller komponentklasse fremfor nye globale elementselektorer.
5. Kontroller desktop, mobil, safe-area, åpne/lukkede paneltilstander og relevante overlays.
6. Dersom lastrekkefølgen endres, oppdater denne guiden i samme PR.

## Feilsøking

Ved «mystiske» stilfeil, kontroller i denne rekkefølgen:

1. hvilken CSS-fil og linje DevTools faktisk bruker;
2. selector-spesifisitet;
3. lastrekkefølge i `index.html`;
4. aktiv `body`-/komponentklasse;
5. inline style eller JavaScript som endrer class/style;
6. media queries, containerbredde og safe-area-regler.

> Rett eierskapet i kilden. Ikke bruk stadig mer spesifikke overstyringer som permanent arkitektur.
