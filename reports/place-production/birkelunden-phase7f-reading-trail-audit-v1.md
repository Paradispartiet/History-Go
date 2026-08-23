# Birkelunden – fase 7F Lesespor audit v1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline: `main` etter fase 7E / PR #5276 / `1cdb905970aa900ebfede38e9b5a9ae851820461`
- Canonical Lesespor-owner: `data/lesespor/oslo/lesespor_oslo_by.json`
- Manifest: `data/lesespor/manifest.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Status: **KLAR FOR REVIEW / CI**

## Tidligere-arbeid-gate

```text
BIRKELUNDEN-ITEMS FØR 7F: 0
OSLO BY-FIL: aktiv og canonical
OSLO HISTORIE-FIL: ingen Birkelunden-item
OSLO NATUR-FIL: ingen Birkelunden-item
EKSISTERENDE PLACE-SPESIALFIL: ingen
BESLUTNING: REELT PRODUKSJONSHULL – publiser åpne, direkte og stedsspesifikke lesespor hos eksisterende Oslo/By-eier
```

7F lager ikke en ny `lesespor_oslo_birkelunden.json`. Den aktive validatoren krever navneformen `<scope>/lesespor_<scope>_<category>.json`, og Birkelunden er canonical `category: by`. De nye itemene legges derfor i samme Oslo/By-fil som de eksisterende Torggata-sporene.

## Research- og tilgangsgate

Tilgang ble kontrollert 23. august 2026. Alle tre publiserte spor kunne åpnes direkte uten abonnement eller innlogging.

Canonical felter:

```text
access: open
rights: link_only
verifiedAt: 2026-08-23
```

`link_only` er viktig: History Go viser metadata, en egen kort relevans-/innholdsbeskrivelse og ekstern lenke. Artikkel- eller PDF-fulltekst kopieres ikke inn i repoet.

## Publisert Lesespor 1 – Riksantikvaren

**Birkelunden – Murbyens hjerte**

- forfatter: Synne Vik Torsdottir;
- publikasjon: Riksantikvaren;
- publisert: 8. april 2022;
- type: fagartikkel;
- URL: `https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/`;
- source quality: `institutional`;
- tilgang: åpen.

Artikkelen gir en substansiell lesning av Birkelunden som park og som sentrum i det større fredede kulturmiljøet. Den dekker Thorvald Meyers planlegging og parkgave, 1800-tallets rutenettby, murgårdsstrukturen, fredningshistorien og samspillet mellom fellesrom og bebyggelse.

### Strong-claim-grense

Riksantikvaren bruker en sterk «første»-formulering om kulturmiljøfredningen. Fase 2 hadde allerede holdt tilsvarende superlativ tilbake som egen History Go-claim inntil særskilt review. 7F opphever ikke denne grensen. Vår `popupDesc` for Lesesporet beskriver hva artikkelen handler om, men restempler ikke «første»-påstanden som canonical History Go-fakta.

## Publisert Lesespor 2 – Oslo Byarkiv / TOBIAS

**Birkelunden – «distancerer Studenterlunden i Trivsel!»**

- forfatter: Ellen Røsjø;
- publikasjon: Oslo Byarkiv – TOBIAS 2–3/2006;
- år: 2006;
- type: tidsskriftartikkel;
- trykksider: 42–45;
- URL: `https://www.oslo.kommune.no/OBA/tobias/tobiasartikler/pdf_arkiv/Tobias_2_3_2006.pdf`;
- source quality: `institutional`;
- tilgang: åpen PDF.

TOBIAS-nummerets innholdsfortegnelse identifiserer artikkelen og Ellen Røsjø som forfatter. Artikkelen følger Birkelunden gjennom parkhistorie, fysisk omlegging, paviljong og vannbasseng, sosial og politisk bruk og senere kunst-/minnespor. Den er derfor et reelt lesespor, ikke bare et teknisk kildebevis.

PDF-en ble åpnet og tekstlaget ble kontrollert. Screenshot-funksjonen ble også forsøkt som PDF-QA, men returnerte intern/cache-feil i denne kjøringen. 7F gjør derfor ingen nye visuelt avhengige påstander om layout eller fotografier; metadataene over er bundet til PDF-ens indeks-/tekstlag. Brukeren sendes til original-PDF-en og History Go kopierer ikke fulltekst.

## Publisert Lesespor 3 – Oslo byleksikon

**Birkelunden**

- publikasjon: Oslo byleksikon;
- type: leksikonartikkel;
- URL: `https://oslobyleksikon.no/side/Birkelunden`;
- source quality: `recognized`;
- tilgang: åpen.

Dette er det korteste av de tre sporene og fungerer som direkte stedsoppslag. Det gir en kompakt inngang til anlegg, overdragelse, omlegging, paviljong og senere parkhistorie, og kompletterer de to lengre institusjonelle lesningene uten å kreve betalingsmur.

## Hvorfor tre spor

De tre er ikke valgt bare for å fylle fanen. De har ulike lesejobber:

1. **Riksantikvaren** – byplan, murby og kulturmiljø;
2. **Oslo Byarkiv / TOBIAS** – arkivbasert park- og sosialhistorie over tid;
3. **Oslo byleksikon** – kort, direkte stedsreferanse.

Alle tre har `place_ids: ["birkelunden"]`. Ingen oppføring bruker Paulus' plass, Paulus kirke, Grünerløkka skole, Olaf Ryes plass, Sofienbergparken eller det større Grünerløkka-området som proxy for selve parken.

## Kandidater som ikke ble valgt

### Oslohistorie – «Da Rolf Stranger reddet Birkelunden»

**Ikke valgt i 7F.** Artikkelen er åpen og stedsspesifikk og kan være interessant i en senere språk-/navnehistorisk vurdering, men tre sterkere institusjonelle/etablerte Lesespor dekker allerede 7F med høyere kildeeierskap og mindre behov for kildekritisk mellomlagring. Den blir ikke degradert eller erklært feil; den er bare ikke nødvendig for å lukke denne fanen.

### Oslohistorie – «Ny musikpaviljong i Birkelunden»

**Ikke valgt i 7F.** Den er tematisk relevant, men Byarkiv-artikkelen gir en bredere og mer direkte arkivbasert lesning av samme parkhistoriske akse.

### Brede Grünerløkka-artikler

**Avvist som primære Birkelunden-spor** når Birkelunden bare er ett av mange områdeelementer. 7F skal være place-eid, ikke områdeutfylling.

## Runtime

`js/ui/place-popup-tabs.js` laster aktive Lesespor, filtrerer på `place_ids`, fjerner betalingslåste/subscription-items og renderer åpne treff i Lesespor-fanen med ekstern lenke.

7F endrer ikke runtime. Den fyller bare den eksisterende kontrakten med tre godkjente åpne Birkelunden-items.

## Permanent regresjonslås

`tests/birkelunden-phase7f-reading-trail.test.mjs` låser:

1. nøyaktig tre Birkelunden-items og stabile ID-er;
2. bare `place_ids: ["birkelunden"]`;
3. `access: open`, `rights: link_only` og `verifiedAt: 2026-08-23`;
4. direkte HTTPS-URL-er og source quality;
5. Riksantikvaren-forfatter/dato og strong-claim-grensen;
6. Ellen Røsjø, TOBIAS 2006 og trykksidene 42–45;
7. Oslo byleksikon som kortere referansespor;
8. ingen place-spesialfil i Lesespor-manifestet;
9. eksisterende runtime-filter for place/access;
10. uendrede fase-5 `desc`/`popupDesc`-hashes og `area_m2=16300`.

Testen kjøres permanent fra `scripts/check-places.sh` etter fase 7E-testen.

## Bevisst ikke endret

- canonical Birkelunden Place JSON;
- `desc`, `popupDesc`, profiler eller `for_na`;
- Story;
- Leksikon/News;
- People/Objects;
- popup-runtime;
- Lesespor-manifestets filsett.

Kun eksisterende Oslo/By-Lesespor-owner får tre nye itemer og oppdatert `generated_at`.

## Økonomi

Produksjonsmodell/API-kreditter i 7F: **0 eksterne modellkall**. Arbeidet brukte eksisterende repo-evidence og direkte tilgangskontroll mot åpne kilder. Dette er en arbeidsmåling og ikke en reduksjon i research-, tekst- eller kvalitetskrav.

## Kvalitetsvurdering før CI

1. Korrekthet/evidens: **5/5**
2. Lesekvalitet og variasjon: **5/5**
3. Open-access/rights-integritet: **5/5**
4. Teknisk integritet: **4/5** – endelig 5 krever grønn CI
5. Place-eierskap: **5/5**
6. Vedlikeholdbarhet: **5/5**

Foreløpig **29/30**. Fase 7F er først ferdig etter grønn CI og merge.

Neste delsteg: **7G – Kilder**.
