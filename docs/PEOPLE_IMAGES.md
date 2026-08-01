# People-bilder

Status: **canonical bilde-, rettighets- og attribusjonskontrakt for people-data**  
Implementasjon: [`../tools/people-image-pipeline.mts`](../tools/people-image-pipeline.mts)  
Tester: [`../tests/people-images.test.mjs`](../tests/people-images.test.mjs)  
Datainngang: [`../data/people/manifest.json`](../data/people/manifest.json)  
Sist kontrollert: **2026-08-01**

Dette dokumentet eier tillatte bildekilder, lisensporten, redaksjonell godkjenning, lokal lagring og attribusjonskrav for people-bilder. Verktøyet eier implementasjonen, og canonical people-filer eier de faktiske `image`, `cardImage` og `imageMeta`-verdiene.

Dokumentariske portretter hentes fra Wikidata og Wikimedia Commons. Når ingen lovlig og identitetsmessig forsvarlig portrettkandidat finnes, kan History GO produsere en tydelig stilisert **redaksjonell illustrasjon** etter den separate porten nedenfor. Google Images brukes ikke som bilde- eller lisenskilde: søkeresultater gir ofte kopier fra tilfeldige nettsteder og kan ikke gi stabil attribusjon.

## Flyt

1. `npm run people:images:candidates -- --limit=25` leser `data/people/manifest.json`, støtter både `{ "people": [] }`, vanlige arrays og enkeltpersonfiler, søker Wikidata og prioriterer P18-bildet.
2. Commons-metadata hentes for bildet og bare kandidater med godkjent lisens skrives til `data/people/people_image_candidates.json` med `approved: false`.
3. Redaktør kontrollerer Commons-siden manuelt og setter `approved: true` for valgte kandidater.
4. `npm run people:images:apply` er dry-run og skriver ingenting.
5. `npm run people:images:apply:write` validerer kandidaten på nytt, laster ned bildet fra Wikimedia Commons og lagrer lokalt under `bilder/kort/people/`.
6. `data/people/people_image_attributions.json` regenereres deterministisk fra people-data.

Markdown-filen, kandidatfila og attribusjonsfila er ikke runtime people source of truth. Personens canonical manifest-loadede JSON-fil må inneholde de lokale bildepathene og metadataene som runtime skal lese.

## Lisensport

Tillatt: Public Domain, CC0, CC BY og CC BY-SA.

Avvist:

- CC BY-NC
- CC BY-ND
- CC BY-NC-SA
- CC BY-NC-ND
- redaksjonell bruk
- all rights reserved
- tom eller ukjent lisens
- uklare betingelser

Porten kjøres både ved kandidatinnhenting og apply. En visuell kvalitetsvurdering kan aldri oppheve lisens- eller identitetskravene.

## Sikkerhet og attribusjon

Manifeststier må være `people/...` og løses kun under `data/people/`. Apply krever:

- `approved: true`;
- entydig personmatch;
- eksplisitt kandidat-ID når flere kandidater finnes;
- Wikimedia Commons-URL;
- godkjent lisens;
- creator, credit, license og licenseUrl.

`image` og `cardImage` får aldri ekstern URL, bare lokal fil. Eksisterende lokale bilder overskrives ikke.

Attribusjon lagres i `imageMeta` med Commons-side, creator, credit, license og licenseUrl. Kunstneriske fremstillinger skal merkes tydelig i eksisterende personfelt/tekst før godkjenning dersom bildet ikke er et fotografisk portrett.

Personer uten bilde skal bruke eksisterende initialer/placeholder i UI. Nye bildeleverandører kan bare legges til ved å normalisere metadata til samme kandidatformat og kjøre samme lisensport ved både kandidat- og apply-steg.

## Redaksjonell illustrasjon når portrett mangler

En redaksjonell illustrasjon er en eksplisitt fallback, ikke et dokumentarfoto og ikke en snarvei rundt identitetskontrollen. Den kan brukes når Commons-flyten ikke gir et egnet portrett og alle disse kravene er oppfylt:

- personen har en direkte, kildebelagt canonical identitet og stedskobling;
- minst én offentlig, autoritativ institusjonsside gir en kontrollert identitetsreferanse;
- illustrasjonen er tydelig tegnet/stilisert og kopierer ikke referansebildets bakgrunn eller fotografiske komposisjon;
- ansikt, alderstrekk og andre identitetsbærende kjennetegn er manuelt kontrollert mot referansen;
- bildet inneholder ikke oppdiktede handlinger, symboler, uniformer, verv, sitater eller kontekster;
- `imageMeta.source` er `history_go_editorial_illustration` og `mediaType` er `editorial_illustration`;
- `sourcePage`, `referenceImage`, `identityReference`, `creator`, `credit`, `license`, `licenseUrl`, `generatedAt`, `reviewStatus` og `disclosure` er fylt ut;
- `reviewStatus` er `identity_and_editorial_review_passed`;
- `disclosure` sier uttrykkelig at bildet er en illustrasjon og ikke et fotografi;
- outputfilen er lokal, rettighetsavklart og publisert med en tillatt lisens.

People-popupen og andre tekstbærende personflater skal vise «Illustrasjon». Alt-tekst for bildepreview skal også skille illustrasjon fra fotografi. En generert fotorealistisk person, et tilfeldig ansikt eller en illustrasjon uten kontrollert identitetsreferanse er fortsatt forbudt.

`npm run people:images:audit` validerer metadataene for denne fallbacken. Illustrasjoner registreres i den deterministiske attribusjonsfila sammen med Commons-portretter.

## GitHub Actions-kandidatkjøring

GitHub-hosted Actions-runneren er den autoritative nettverkskjøringen for people-image-kandidatinnhenting. Lokale/Codex-miljøer kan ha DNS- eller proxybegrensninger mot Wikidata og Wikimedia Commons og skal ikke tolke nettverksfeil som «ingen lovlig kandidat finnes».

1. Åpne GitHub-repoet.
2. Gå til Actions.
3. Velg **Build people image candidates**.
4. Trykk **Run workflow**.
5. Angi people-ID-er og `limit`.
6. La `open_draft_pr` være av ved ren test.
7. Last ned artifactet `people-image-candidates-<run_id>` og kontroller rapportene.
8. Bruk draft-PR bare etter en vellykket og ikke-tom kandidatbatch.
9. Ingen kandidater skal godkjennes i selve workflowen; alle kandidater skal fortsatt ha `approved: false` og må gjennom manuell identitets- og lisenskontroll før apply.

Workflowen kjører DNS-/HTTP-sjekker mot npm, Wikidata og Wikimedia Commons før verktøykjeden installeres og kandidatinnhentingen starter. Ved feil stopper workflowen uten å endre kandidatfila eller opprette branch/PR, men rapport-artifactet lastes fortsatt opp for feilsøking. Når `open_draft_pr` er aktivert etter en grønn kjøring, committes bare kandidatfila og korte verifikasjonsrapporter til en `automation/people-image-candidates-<run_id>`-branch. Workflowen pusher aldri direkte til `main`, merger aldri og kjører ikke apply eller bildenedlasting.

## Kommandoer

```bash
npm run people:images:candidates -- --limit=25 [--ids=id1,id2] [--include-existing]
npm run people:images:apply
npm run people:images:apply:write
npm run people:images:audit
npm run test:people-images
```

## Flere kandidater, rangering og «beste tilgjengelige bilde»

People-image-flyten skiller mellom absolutte krav og visuell kvalitet.

Juridiske og identitetsmessige krav er absolutte: riktig og forsvarlig identifisert person, lovlig Commons/Wikimedia-kilde, gyldig lisens, Commons-kildeside, attribusjon og en fil som kan lastes og dekodes. Kandidater med ukjent eller ulovlig lisens, manglende attribusjon, ikke-Wikimedia-kilde eller `identity.status: "insufficient"` kan ikke brukes i apply.

Visuelle svakheter er rangering og advarsler, ikke automatisk ekskludering. Lav oppløsning, mørkt eller lyst bilde, lav kontrast, mulig uskarphet, gruppebilder, historisk korn, skannekanter eller krevende utsnitt skal normalt gjøre kandidaten lavere rangert og tydelig merket i review-siden. Dette hindrer at historiske personer står uten bilde bare fordi den beste lovlige kilden er teknisk svak.

Kandidatmodellen har én stabil `candidateId` per Commons-fil per person, deterministisk basert på people-ID og normalisert Commons-filnavn. Flere kandidater kan dele `personId`, men apply må velge nøyaktig `candidateId` når det finnes alternativer. Hver kandidat har også `identity`, `quality`, `faceDetection`, `rank`, `recommendedForReview` og `bestAvailable`.

Kandidatinnhenting kan hente opptil fem alternativer per person som standard (`--max-candidates-per-person=5`, tillatt 1–8). Kildene prioriteres slik:

1. Wikidata P18
2. eksplisitte Commons-/Wikidata-koblinger
3. Commons-kategori fra Wikidata
4. konservativt Commons-navnesøk

Rene navnetreff får lavere identitetssikkerhet (`identity.status: "review"`) og krever eksplisitt manuell bekreftelse.

«Beste tilgjengelige bilde» brukes når ingen lovlige og identitetsmessig forsvarlige kandidater når `recommended` eller `usable`. Da vises den beste lovlige kandidaten fortsatt på review-siden med tydelige advarsler og er ikke automatisk godkjent. Redaktøren må bruke «Godkjenn som beste tilgjengelige» og skrive en begrunnelse på minst 20 tegn. Dette gir revisjonsspor i review-payloaden.

Review-siden eksporterer versjonert payload:

```json
{
  "version": 2,
  "selections": [
    {
      "personId": "rolv_wesenlund",
      "candidateId": "rolv_wesenlund__57196_rolv_wesenlund_jpg",
      "approvalMode": "best_available",
      "bestAvailableReason": "Eneste lovlige og identifiserbare bilde."
    }
  ]
}
```

Apply validerer kandidat-ID, avviser to kandidater for samme person, avviser utilstrekkelig identitet og ulovlige lisenser, krever begrunnelse for `best_available`, validerer Commons-/lisensdata på nytt og lar visuelle advarsler passere. Apply skal ikke endre kandidatfila, ikke overskrive eksisterende bilde og første write-batch er begrenset til fem personer.

## Endringsregel

Endringer i tillatte kilder, lisensmatrise, kandidatformat, review-payload, write-grense, lokal bildepath eller attribusjonsformat skal oppdatere i samme PR:

1. `tools/people-image-pipeline.mts` og relevante hjelpefiler;
2. `tests/people-images.test.mjs`;
3. dette dokumentet;
4. relevante Actions-workflows;
5. people schema/audit dersom canonical personfelter endres.
