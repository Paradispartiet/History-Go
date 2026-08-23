# Birkelunden – fase 7F Lesespor audit V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Canonical eier: `data/lesespor/oslo/lesespor_oslo_by.json`
- Runtime: `js/ui/place-popup-tabs.js`
- Status: **KLAR FOR REVIEW / CI**

## Problem og mål

Nullmålingen og fase-7-auditen fant ingen manifest-lastet Birkelunden-oppføring i Lesespor. Dette er et reelt researchhull, ikke en grunn til å godkjenne en tom fane.

Målet er et lite, åpent og direkte lesbart fordypningsspor om selve Birkelunden. Sporene skal tilføre forskjellige perspektiver og ikke bare gjenta Kilder-fanen som en uannotert lenkeliste.

## Repo-søk og canonical eier

`data/lesespor/manifest.json` og de aktive Oslo-filene ble kontrollert for `birkelunden`, `Birkelunden` og `Bjerkelunden`. Ingen eksisterende manifest-lastet Lesespor-post eide Birkelunden før denne fasen.

Første implementasjonsforsøk brukte en separat Birkelunden-fil. Lesespor-validatoren avviste dette korrekt: aktive filer må følge `<scope>/lesespor_<scope>_<category>.json`, og dokumentets `city` og `category` må samsvare med henholdsvis scope og filnavn. Et eget Birkelunden-scope ville derfor feilrepresentert Oslo som by.

Løsningen følger Torggata-precedens og den eksisterende kontrakten: de tre Birkelunden-postene legges i den canonical Oslo By-filen `data/lesespor/oslo/lesespor_oslo_by.json`. `place_ids: ["birkelunden"]` er den stedsspesifikke koblingen. Manifestet forblir uendret og det opprettes ingen parallell sannhetskilde.

## Eksternt søk og utvalg

| Kildeeier | Åpen/direkte | Birkelunden-kobling | Beslutning |
| --- | --- | --- | --- |
| Oslo byleksikon – Birkelunden | Ja, full åpen artikkel | Selve parken, historiske anlegg og endringer; kulturmiljø som kontekst | **Publisert** |
| Riksantikvaren – «Birkelunden – Murbyens hjerte» | Ja, full fagartikkel | Parken i forhold til murby, offentlig rom og større fredet kulturmiljø | **Publisert** |
| Pensjonistforbundet – «Vår historie» | Ja, åpen nettside | Jack Johnsen, benken i Birkelunden og organiseringen i 1937 | **Publisert** |
| Store norske leksikon – Birkelunden | Ja | God parkoversikt, men overlapper i stor grad Oslo byleksikon | **Holdt tilbake** for å bevare perspektivbredde |
| Wikipedia / generelle parkoversikter | Åpne | Varierende | **Holdt tilbake**; de tre valgte sporene har sterkere redaksjonell og institusjonell eierskap |
| Artikler om Paulus kirke, Grünerløkka skole og andre naboplaces | Flere åpne | Nær Birkelunden, men egne steder | **Avvist som place-proxy** |

## Publiserte Lesespor

### 1. Oslo byleksikon – «Birkelunden»

- ID: `lesespor_birkelunden_byleksikon_001`
- Type: leksikonartikkel
- Tilgang: `open`
- Rettighetshåndtering: `link_only`
- `source_quality`: `recognized`
- Direkte URL: `https://oslobyleksikon.no/side/Birkelunden`
- Kontrollert: 2026-08-23

Sporet gir en sammenhengende parkhistorie: anleggelsen i 1860-årene, overdragelsen i 1882, omleggingen i 1916–20, paviljong og senere oppgradering. Kulturmiljøstoffet beskrives i Lesespor-metadataen som kontekst, ikke som parkens fysiske omfang.

### 2. Riksantikvaren – «Birkelunden – Murbyens hjerte»

- ID: `lesespor_birkelunden_riksantikvaren_001`
- Forfatter: Synne Vik Torsdottir
- Type: fagartikkel
- Tilgang: `open`
- Rettighetshåndtering: `link_only`
- `source_quality`: `recognized`
- Direkte URL: `https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/`
- Kontrollert: 2026-08-23

Sporet forklarer parken som offentlig rom i Grünerløkkas kvartalsstruktur og gir en faglig inngang til kulturmiljøfredningen. Den eksisterende park/kulturmiljø-grensen beholdes eksplisitt.

### 3. Pensjonistforbundet – «Vår historie»

- ID: `lesespor_birkelunden_pensjonistforbundet_001`
- Type: organisasjonshistorie
- Tilgang: `open`
- Rettighetshåndtering: `link_only`
- `source_quality`: `recognized`
- Direkte URL: `https://www.pensjonistforbundet.no/om-oss/var-historie`
- Kontrollert: 2026-08-23

Sporet gir et sosialhistorisk perspektiv på Birkelunden som faktisk møteplass: Jack Johnsen, 10–12 pensjonister på en benk, senere hvilebrakke og organiseringen av `Venner i Bjerkelunden` i 1937. Dette utdyper den aktive Storyen uten å kopiere eller erstatte den.

## Identitet, balanse og rettigheter

- Alle tre oppføringer har eksakt `place_ids: ["birkelunden"]`.
- Validatorens tillatte `source_quality: "recognized"` brukes for alle tre; institusjonell rolle dokumenteres i `publication` og denne auditen, ikke gjennom nye enum-verdier.
- Ingen oppføring bruker Paulus kirke, Paulus' plass, Grünerløkka skole, Olaf Ryes plass eller andre nabosteder som stedfortreder.
- Oslo byleksikon gir parkhistorie, Riksantikvaren gir by-/verneperspektiv, og Pensjonistforbundet gir sosial organisasjonshistorie.
- Tre spor er proporsjonalt: nok til en reell fordypningsfane, men ikke en generell lenkekatalog.
- Bare metadata, egen relevansbeskrivelse og ekstern lenke lagres. Artikkeltekst kopieres ikke.
- `access: open` ble kontrollert 2026-08-23; senere tilgangsendring krever ny review.

## Runtime-QA

Eksisterende `renderLesespor()`:

1. krever at `place_ids` inneholder aktiv place-ID;
2. filtrerer ut betalingsmur-/abonnementsmarkører;
3. viser tittel, forfatter/publikasjon, type, relevans og ekstern lenke;
4. leser den allerede manifestregistrerte Oslo By-filen uten nytt runtime-system.

Automatiske tester kan låse data, manifest, tilgang, URL-er og runtimefilter, men beviser ikke alene at ferdig Lesespor-fane er visuelt eller redaksjonelt god. Full popup-QA inngår i sluttporten.

## Permanent regresjonslås

`tests/birkelunden-phase7f-reading-trail.test.mjs` filtrerer den canonical Oslo By-filen på `place_ids` og krever:

1. nøyaktig tre Birkelunden-spor;
2. eksakte IDs og direkte HTTPS-URL-er;
3. `access: open`, `rights: link_only`, `source_quality: recognized` og `verifiedAt: 2026-08-23`;
4. kun canonical `oslo/lesespor_oslo_by.json` i manifestet – ingen Birkelunden-sidefil;
5. eksisterende place-ID- og betalingsmurfilter i runtime;
6. uendrede Birkelunden description-hasher og `area_m2=16300`.

## Beslutning

**Lesespor-blokkeren er løst av fase 7F** når den canonical Oslo By-filen, audit, workcard og regresjonstest er merget med grønn CI.

Neste canonical delsteg: **7G – Kilder**. Birkelunden har sikre source-labels og et godt source/claim-grunnlag; neste jobb er å gjøre den brukerrettede kildeflaten inspectable med dedupliserte HTTPS-lenker uten å blande inn tekniske IDs eller irrelevante kontrollkilder.
