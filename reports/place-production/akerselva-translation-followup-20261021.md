# Akerselva — oversettelser og dateringspresisjon, 21. oktober 2026

## Avgrensning

PR #6430 har allerede publisert norsk tekst og kildepakker for Glads mølle og Vaterlands historiske elveløp. Denne oppfølgingen beholder disse artiklene, deres claims, QuizCards, quizer, bilder, emner og koordinater. Den tidligere upubliserte produksjonsgrenen gjeninnføres ikke.

Seks eksisterende oversettelser (en/es/pt × to steder) hadde fremdeles generisk gammel tekst, interne History Go-formuleringer og foreldede kildehash. Glads mølle ble dessuten omtalt gjennom matforsyning i stedet for den publiserte papirhistorien. Oversettelsene følger nå den norske teksten i tre avsnitt, uten nye faktapåstander. `_status: machine_translated` beholdes; språkene er redaksjonelt gjennomgått, men ikke kontrollert av en ekstern morsmålsredaktør.

Glads mølles `works` hadde eksakt `year: 1875` for opphør av papirdrift og `year: 1950` for grammofonplateproduksjon. Oslo byleksikons åpnete Glads mølle-artikkel støtter bare henholdsvis «1870-årene» og «før 1958». Begge enkeltår er satt til null med tekstlig `period`. Navn, beskrivelser og alle faktisk dokumenterte årstall beholdes. Den genererte place-open-payloaden er synkronisert fra source.

Kilde: https://oslobyleksikon.no/side/Glads_m%C3%B8lle (avsnitt 2–3; inspisert i foregående produksjonsrunde 20. oktober). De publiserte norske tekstene og v4.2-kildepakkene fra #6430 er oversettelsesgrunnlag. Ingen ny historisk research eller v1-/vFerdig-promotering hevdes.

## Kontroll

- Kjørbar JSDOM-kontroll av faktisk `js/i18n.js`: begge stedene følger språkbyttene en → es → pt → nb; norsk original kommer tilbake, geografiske felt og kategori beholdes.
- Alle seks `_sourceHash`-verdier er kontrollert mot canonical `sourcePayload`-normalisering, med avsnittsskift bevart.
- Alle andre oversettelsesoppføringer er sammenlignet med basen og er uendret.
- Begge korrigerte periodefelter og null-år er kontrollert i source og generert runtime.
- Begge norske artikler, emner, år, bilder og koordinater er sammenlignet med basen og er uendret.
- `node scripts/build-place-open-payloads.mjs --check`: synkronisert.
- `node scripts/build-epoke-place-index.mjs --check`: synkronisert; ingen epokeindeksendring nødvendig.
- `node scripts/validate-place-description-production-v4_2_policy.mjs --all`: ingen blokkerende feil.
- `git diff --check`: bestått. Ordinær PR-CI gjenstår ved opprettelse av PR.

Ingen runtimekode er endret. Ingen ny bred nettleser-, katalog- eller quizregresjon er kjørt for denne avgrensede dataendringen.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens og grense |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | Alle seks tekster følger publisert norsk innhold; de to årskorreksjonene følger eksplisitt kildepresisjon. |
| Dekning og ferdigstillelse | 5/5 | Begge steder i alle tre berørte språk samt begge årsfeltene og runtime er kontrollert. |
| Faglig/redaksjonell kvalitet | 4/5 | Konkret stedshistorie og samme avsnitt som originalen; ingen ekstern morsmålsvurdering hevdes. |
| Teknisk integritet | 4/5 | Kjørbar språkbytteflyt, kildehash, dataparitet og generatorvalidatorer; bred UI-regresjon ikke nødvendig for uendret kode. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen ny adgangs-, drifts- eller personpåstand innføres; dateringsusikkerhet beholdes. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical hashmetode, source→runtime og avgrenset diff uten konkurrerende pakke eller system. |

Totalt **28/30**. Ingen kjente blokkere innen denne oppfølgingens scope. Vurderingen gjelder oversettelser og dateringspresisjon, ikke full stedsproduksjon.
