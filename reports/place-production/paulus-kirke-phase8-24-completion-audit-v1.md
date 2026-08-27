# Paulus kirke – fase 8–24

Status: komplett og kildekontrollert 2026-08-26.

- Tidligere Paulus-arbeid i PR #5367 er gjenbrukt; Arbeidermuseet-scope er ikke med i leveransen.
- PlaceCard har nøyaktig People, Objects, Brands og Related i fast 2 × 2-komposisjon. Henrik Bull, inngangstårnet, Paulus og Sofienberg menighet og den lokale nabografen har hvert sitt canonicale, bildeklare medlem.
- `frontImage` er en fysisk stående 900 × 1200-variant. Hoved- og kortbilde er redaksjonelle ImageGen-illustrasjoner med eksplisitt proveniens; de framstilles ikke som fotografier.
- Brand-logoen er den offisielle Paulus og Sofienberg-menighetslogoen fra menighetens egen nettside, proporsjonalt normalisert til en nøytral 900 × 520-flate.
- Leksikon, tre språkoppføringer, tre åpne lesespor og én episode_v1-Story materialiseres i place-open.
- Quiz og Fagverk er klare som rich 5 × 7: 18 fakta-, 10 kontekst- og 7 teori-/metodespørsmål. De første 14 er normale kunnskapsspørsmål.
- Før/etter er vurdert, men ikke materialisert som et optisk par fordi det historiske museumsbildet ikke har dokumentert identisk kamerastandpunkt. Bildet ligger som åpent lesespor.
- Events og særskilt rute er vurdert uten å opprette tidsfølsomt eller svakt kildebelagt innhold. Nabografen dekker den lokale navigasjonen.
- Koordinater og adresseanker er uendret.

## Seksdelt kvalitetsvurdering

1. **Korrekthet og evidens — 5/5.** Alle stedspåstander er kilde-/claimsporet til offisiell institusjonskilde, Oslo byleksikon eller museumsrecord; illustrasjonen brukes ikke som historisk evidens.
2. **Dekning og ferdigstillelse — 5/5.** Hele fase 8–24 er materialisert, inkludert stående frontImage, fire bildeklare samlinger, Språk, Story, lesespor, Quiz og Fagverk.
3. **Faglig/redaksjonell kvalitet — 5/5.** Tekst, Story, objekt, Brand og nabograf er spesifikke for Paulus kirke og skiller kirken fra Birkelunden, Sofienberg kirke og menighetens øvrige lokaler.
4. **Teknisk integritet — 5/5.** 5×7-quiz, deterministisk produksjonskontekst, maskinell Story-score, place-open, indekser, schemaer og fokuserte regresjoner er kontrollert.
5. **Sikkerhet og ansvarlighet — 5/5.** Aktiv religionsutøvelse omtales respektfullt; nåbruk avgrenses tidslig, og generert bilde samt offisiell logo har eksplisitt proveniens og ingen endorsement-påstand.
6. **Vedlikeholdbarhet og etterprøvbarhet — 5/5.** Én deterministisk builder, permanente tester, canonical Brand-mapping, source URLs og oppdaterte runtime-/indeksartefakter gjør leveransen reproduserbar.

**Totalt: 30/30 — høy kvalitet, null kritiske funn og null uløste blokkere.**
