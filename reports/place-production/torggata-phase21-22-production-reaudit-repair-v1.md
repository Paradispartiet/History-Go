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

**Reparasjon:** enkeltobjekt med `id` normaliseres til én rad; People-køen beregner prioritet på nytt for hver fil, slik at et place som åpnes etter vanlig kartstart flyttes fram og publiseres før resten av registeret; åpent PlaceCard kan oppdateres på delvis brukbare People/relations-data; loading-broen gjenoppretter lastemarkør hvis en falsk null overskriver den.

### 2. Ødelagt preview i Relaterte steder

Storgata har bildefilreferanser som ikke svarer på publisert flate. Rundingen rendret et vanlig `img` uten error-fallback og viste derfor et ødelagt bildeikon. Selve relasjonslisten var korrekt.

**Reparasjon:** alle fire previewene i Torggatas valgte profil får error-fallback til rundingens eget ikon og faktisk antall, også core-rundingene People og Brands. De fire synlige rundingene får samtidig eksplisitt `aria-label`, `role=button`, `tabindex=0` og `title`; core-popupbindingen håndterer Enter og mellomrom i tillegg til klikk.

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
- `tests/place-rounds-visual-collections.test.mjs`: tilgjengelige navn, bilde-error-fallback for alle fire Torggata-rundinger og tastaturbinding for core-rundingene.
- `tests/place-card-for-na-torggata.test.js`: korrekt høyresideangivelse og oppdatert audit.
- Deterministisk quiz-kontekst oppdateres bare med ny byte-/SHA256-identitet for canonical place-filen.

## Første produksjonsverifikasjon etter PR #4980

- Merge: `0946dbb3f65c2be9ea12cf556791f2fdb97f929d`
- Pages-run: `31814847184` = success
- Kontroll: vanlig publisert PlaceCard, cache-bustet dokument og eksplisitt reload

Relaterte steder viste korrekt ikon-/antallsfallback og de øvrige tidligere beståtte flatene var intakte, men Personer viste fortsatt `0` og «Ingen personer ennå». Første reparasjon er derfor **ikke godkjent som sluttresultat**.

Den nye loaderen publiserer de direkte Torggata-profilene, men PlaceCard kan fortsatt ende med en sen tom render: refresh-gaten ventet også på relasjonsregisteret, og en initial render med tomt People-datasett kunne fullføre etter ready-eventet og overskrive den korrekte rerenderen. Produksjonsobserveren godtok deretter den stale nullen fordi dataene allerede stod som ready.

Andre reparasjon:

1. direkte place-profiler kan trigge PlaceCard-refresh straks People-data er brukbare, uten å vente på hele relasjonsregisteret;
2. ready-observeren oppdager én sen tom render når synlige direkte profiler finnes;
3. én stedsspesifikk recovery-render kjøres etter den stale DOM-mutasjonen;
4. testen forsinker relasjonsdata, åpner place etter boot og simulerer en tom render etter ready.

## Godkjenningsgate

Denne auditen godkjenner ikke sluttflaten på forhånd. Etter merge skal den nye main-versjonen deployes, og produksjonsflaten skal manuelt bekrefte:

- Personer viser reelt antall og åpner bildeklare profiler;
- ingen av de fire rundingene viser ødelagt preview;
- alle fire rundingene kan identifiseres med tilgjengelig navn;
- Før/etter sier «høyre side» og er visuelt konsistent;
- Nyheter, Lesespor og Mer er fortsatt fylte;
- 4 + 1-geometrien er uendret.

**Sluttstatus kan først settes etter denne produksjonsverifikasjonen.**


## Andre produksjonsverifikasjon etter PR #4981

- Merge: `0f3c9418bc9cb36d25a18fe3fc1aae464b86cb79`
- Pages-run: `31818244364` = success
- Kontroll: publisert PlaceCard i ny nettleserfane etter ferdig deploy

Den nye runtimekoden var lastet, men Personer viste fortsatt `0` og tom popup. DOM-en bekreftet at ready-observeren hadde observert `torggata`, uten at den fant synlige Torggata-profiler og satte recovery-sperren. PR #4981 er derfor ikke godkjent som sluttresultat.

Canonical datakontroll viste at `data/relations.json` manglet Torggata-relasjoner. Direkte place-felt er fortsatt gyldige, men produksjonskjeden skal også ha canonical relasjoner for de faktisk valgte profilene. Manifest og profilfiler for åpent sted skal dessuten revalideres, slik at en stale nettlesercache ikke kan holde rundingen på null uten nettverksfeil.

Egen-place-regelen gjelder også People: Thorvald Meyer, Christian Morgenstierne og Arne Eides Torggata-referanser beskriver Torggata Bad. Siden badet har egen canonical History GO-place, holdes de tilbake fra parent-rundingen. Integrasjonstesten fant også tolv brede subkultur-/miljøkoblinger uten tilstrekkelig spesifikt Torggata-stedspunkt; disse holdes tilbake for å hindre generelt områdefyll. Godkjent målsett for Torggata er fire personer: Henrik Bull, Harald Olsen, Alma Fahlstrøm og Johan Fahlstrøm.

### Tredje reparasjonsgate

- fire canonical Torggata-relasjoner finnes og peker på bildeklare profiler;
- Torggata Bad-proxyene er eksplisitt holdt tilbake fra `torggata`;
- manifestet hentes uten stale cache og åpne-place-profiler revalideres;
- runtime-integrasjonstesten returnerer nøyaktig de fire godkjente profilene;
- produksjonen viser `Personer = 4` og popupen åpner de samme fire.

**Status: IKKE PRODUKSJONSGODKJENT.**
\n\n## Tredje produksjonsverifikasjon etter PR #4982\n\n- Merge-SHA: `eb7caa2ef0a7e6678fa947d13e9b8634e3e529c4`\n- Pages-run: `31825055823` — `success`\n- Kontroll: ny cache-bustet produksjonsfane, observert i mer enn 60 sekunder\n\nPersoner viste fortsatt `0`. PlaceCard var ferdig rendret uten loading-/feilmarkør, men popupgrunnlaget var tomt. De prioriterte People-filene var reparert; den gjenstående cachegrensen var `data/relations.json`, som inneholder de fire nye canonical Torggata-koblingene, men fortsatt ble hentet med `cache: "default"`. En eldre subressursrespons uten koblingene gir derfor tomt runtimeoppslag selv med ferske profiler.\n\n**Reparasjon:** begge mutable relasjonsregistrene hentes med `cache: "no-store"`. Bakgrunnslastertesten låser dette for både `data/relations.json` og `data/relations_philanthropy.json`, og produksjonssjekklisten gjør stale place→person-relasjoner til et eksplisitt blockerfunn.\n\n**Status: IKKE PRODUKSJONSGODKJENT.** Ny merge, eksakt Pages-success og manuell produksjonskontroll med `Personer = 4` er fortsatt obligatorisk.\n