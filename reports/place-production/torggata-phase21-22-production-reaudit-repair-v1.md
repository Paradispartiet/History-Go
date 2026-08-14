# Torggata – fase 21/22 produksjons-reQA og reparasjon V1

- Dato: 2026-08-14
- Place ID: `torggata`
- Produksjonsflate: `https://paradispartiet.github.io/History-Go/#/place/torggata`
- Kontrollert main: `0415adc24dc9c9effe0adcb39961ac992564c934`
- Kontrollert deploy: GitHub Pages-run `31811272880` = success
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Status: **REPAIRS_READY_FOR_REVIEW – PRODUCTION VERIFY PENDING**

## Formål og metode

Den manuelle re-QA-en ble gjort mot faktisk publisert PlaceCard etter at 4+1-profilen og innholdsreparasjonene var merget. Hver synlig runding og hver berørt popupflate ble åpnet. Automatiske tester brukes som regresjonslås, men erstatter ikke denne visuelle kontrollen.

## Bestått på kontrollert produksjonsflate

- Badge står separat ved overskriften.
- Fire innholdsrundinger står i 2 × 2-feltet: Personer, Bilder, Brands og Relaterte steder.
- Bilder åpner fire Torggata-bilder.
- Brands åpner 13 oppføringer.
- Relaterte steder åpner Storgata, Youngstorget og Eldorado Bokhandel.
- Nyheter viser to daterte 2026-notiser.
- Lesespor viser tre åpne eksterne spor.
- Mer viser to observasjonspunkter, to hvorfor-punkter, ett motpunkt og tre språkoppføringer.
- Før/etter bruker Torggata 30–36 ca. 1965 mot samme gateakse i 2025. Torggata Bad er avvist som stedfortreder fordi badet har egen canonical History GO-place.

## Blokkerende funn

### 1. Personer viste falsk null og tom popup

Produksjonsflaten viste `0` og «Ingen personer ennå». Manifestet inneholder 17 profiler under `data/people/by/oslo/torggata/`, hvorav de bildeklare profilene skal kunne vises. Profilfilene er canonical enkeltobjekter. `js/boot-fast.js` godtok bare lister eller `{people:[...]}`, og normaliserte derfor disse profilene til tom liste. I tillegg kunne loading-broen beholde tilstanden `loading` samtidig som PlaceCard hadde skrevet et synlig nulltall.

**Reparasjon:** enkeltobjekt med `id` normaliseres til én rad; filer i mappen til åpent place prioriteres og publiseres før resten av registeret; åpent PlaceCard kan oppdateres på delvis brukbare People/relations-data; loading-broen gjenoppretter lastemarkør hvis en falsk null overskriver den.

### 2. Ødelagt preview i Relaterte steder

Storgata har bildefilreferanser som ikke svarer på publisert flate. Rundingen rendret et vanlig `img` uten error-fallback og viste derfor et ødelagt bildeikon. Selve relasjonslisten var korrekt.

**Reparasjon:** alle canonical rundings-preview får felles error-fallback til rundingens eget ikon og faktisk antall. De fire synlige rundingene får samtidig eksplisitt `aria-label`, `role=button`, `tabindex=0` og `title`.

### 3. Feil sideangivelse i Før/etter

Bildene viser den sammenhengende fasaderekken Torggata 30–36 på høyre side i begge motivene. Data og fase 7D-audit sa feilaktig «venstre side».

**Reparasjon:** `before`, `now`, `beforeImageMeta.viewpoint`, `lookFor` og fase 7D-auditen korrigeres til «høyre side». Selve bildeparet, retningen mot Hausmanns gate og kildekjedene endres ikke.

## Dokumentasjonsforbedringer

`docs/PLACE_PRODUCTION_CHECKLIST.md` krever nå at:

1. hver av de fire rundingene åpnes i produksjon og at synlig antall stemmer med popupinnholdet;
2. falsk null under lasting behandles som blocker;
3. manglende preview-bilde gir ikon-/antallsfallback, ikke ødelagt bildeikon;
4. alle fire rundinger har forståelige tilgjengelige navn;
5. Før/etter-tekstens høyre/venstre, retning og motivanker kontrolleres visuelt mot begge bilder.

Den tidligere innførte identitetsstoppen består: et delsted med egen canonical place-oppføring kan ikke brukes i stedet for parent-place i noen fane, runding, bildepar, Story eller hovedpåstand. For Torggata betyr det blant annet at Torggata Bad ikke kan bære hovedparet eller brukes som Torggatas innholdserstatning.

## Regresjonslås

- `tests/background-boot-pacing.test.js`: enkeltobjekt, prioritert place-lasting, delpublisering, retry, bounded concurrency, PlaceCard-refresh og falsk-null-bro.
- `tests/place-rounds-visual-collections.test.mjs`: tilgjengelige navn og bilde-error-fallback.
- `tests/place-card-for-na-torggata.test.js`: korrekt høyresideangivelse og oppdatert audit.
- Deterministisk quiz-kontekst oppdateres bare med ny byte-/SHA256-identitet for canonical place-filen.

## Godkjenningsgate

Denne auditen godkjenner ikke sluttflaten på forhånd. Etter merge skal den nye main-versjonen deployes, og produksjonsflaten skal manuelt bekrefte:

- Personer viser reelt antall og åpner bildeklare profiler;
- ingen av de fire rundingene viser ødelagt preview;
- alle fire rundingene kan identifiseres med tilgjengelig navn;
- Før/etter sier «høyre side» og er visuelt konsistent;
- Nyheter, Lesespor og Mer er fortsatt fylte;
- 4 + 1-geometrien er uendret.

**Sluttstatus kan først settes etter denne produksjonsverifikasjonen.**
