# Teater Manu — medieinntak og profilkontroll, 12. oktober 2026

Teater Manu er fortsatt **BLOCKED**. Denne leveransen retter to People-claimfeil og gjør bilde-/forestillingsarbeidet etterprøvbart; den ferdigmelder ikke stedet.

## Verifiserte kandidater

| Forestilling | Dokumentert oppføring | Stedsgrense | Bildespor |
| --- | --- | --- | --- |
| Hjelp vi får gjester | 25.11.1999, Black Box Teater | Institusjonshistorie før dagens hjemmescene | Offisiell produksjonsside; fotograf/lisens uavklart |
| Pinocchio | 29.10.2009, Teater Manu | Hjemmescene | Offisiell produksjonsside; fotograf/lisens uavklart |
| Manu – et sant eventyr | 19.08.2011, Teater Manu | Hjemmescene | Offisiell produksjonsside; fotograf/lisens uavklart |
| Jeg var Fritz Moen | 18.10.2011, Riksteatret | Samproduksjon; hjemmescene ikke dokumentert | Offisiell produksjonsside; fotograf/lisens uavklart |
| Jack og bønnestengelen | 17.10.2012, Teater Manu | Hjemmescene; Sceneweb dokumenterer premiere | Sceneweb 48496/48495; L-P Lorentz / Teater Manu; lisens og visuell bildeinspeksjon gjenstår |

Datoene er dokumenterte oppføringer, ikke påståtte premierer, med unntak av Jack hvor Sceneweb har en særskilt premierepost. Hjelp-spilleplanen inneholder en avvikende septemberrad mellom novemberradene; den er holdt tilbake uten å gjette korrekt dato.

Mira Zuckermanns offisielle skuespillerside har et bilde kreditert Belinda Stoe. Den har også en pressebildelenke som gav feilsiden, og Lorem ipsum i profilteksten. Fotoidentitetskilden brukes derfor separat fra biografikildene. Wikidata Q30325794 har ingen P18 eller Commons-sitelink; mislykket Commons-søk er **ikke** bevis på at et lovlig portrett ikke finnes.

Alle konkrete kilde-, bilde- og evidenspekere er registrert i `data/places/scenekunst/oslo/teater_manu/forestillinger_research_v1.json`. Ingen kandidater er godkjent for publisering.

## Profilretting

- Teatrets historikk sier uttrykkelig at Zuckermann skrev den første utredningen. `study_1987` er presisert og klassifisert med `explicit` evidens.
- Validatorens substring `leder` traff `prosjektleder` i en historisk setning. Formuleringen er endret til «fikk ansvaret for prøveprosjektet i 1998», med samme fakta og claim-mapping. Det er ikke lagt til et uriktig nåtidsclaim eller endret validator.
- Bare Miras tekst er endret i de genererte People-/place-open-flatene. Portrett og ferdigstatus er ikke godkjent.

## Kontroller

```bash
node tools/audit-people-profile-canonical.mjs
node --test tests/place-open-hyperfast.test.mjs tests/people-profile-canonical.test.mjs
node scripts/build-place-open-payloads.mjs --check
```

Resultat: People audit PASS (110 claims-filer), 13/13 tester og determinismekontroll av 1534 payloads. JSON, ID-paritet, kandidatdatoer og kun-Mira-runtime-diff er kontrollert.

**Browser-QA er ikke utført:** den lokale Playwright-installasjonen feilet før launch på ugyldig nedlastingsarkiv. Cloud-browser feilet før navigasjon med transportfeil. Ingen screenshots eller visuell PASS hevdes.

## Nødvendig sluttarbeid

1. Godkjent personbilde med kilde/lisens, identitet, attribusjon og lokal fil etter `docs/PEOPLE_IMAGES.md`.
2. Rettighetsavklarte medlemsbilder for valgte Forestillinger, og inspeksjon av Jack-bildet.
3. Canonical Productions-medlemmer med korrekte spillestedsgrenser.
4. Separat stående `frontImage`; dagens `image` kopieres ikke til denne rollen.
5. Dokumentert kandidataudit og `place_card_profile` med ferdige PASS-samlinger.
6. Faktisk Chromium/WebKit- og visuell PlaceCard-kontroll av previews, popup, scroll, QuizCard-flip og quizinngang før closeout.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | Konkrete kildeplasseringer og dato-/spillestedsskille |
| Dekning av denne audit-leveransen | 5/5 | Alle fem kandidater, Mira og funne sluttmangler er gjennomgått |
| Faglig/redaksjonell kvalitet | 4/5 | Historisk presis profilretting og ærlig kildekonflikt |
| Teknisk integritet | 4/5 | 13 tester, People audit og payload-paritet; ingen visuell PASS |
| Sikkerhet og ansvarlighet | 5/5 | Uavklarte rettigheter fører til holdback; ingen ekstern kontakt |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical eiere, kilder, avgrenset diff og reproduksjonskommandoer |

**28/30 gjelder bare denne avgrensede audit-/profilrettingen. Samlet stedsproduksjon består ikke ferdigporten.**
