# Oslo sentrum – Politikk, seks eksisterende steder: kontrollert v1-inntak

**Dato:** 23. oktober 2026  
**Status:** Foreløpig kilde-/katalogkartlegging, **ikke** v1-godkjenning eller ferdig stedsproduksjon.  
**Egen arbeidsgren:** `research/oslo-sentrum-politikk-six-v1-20261023`; utgangspunkt `main` ved `54e79212694a68bd49b1bb1035d75d96b245a545`.

## Streng avgrensning

Denne bolken gjelder **bare** de seks eksisterende stedene under, alle med canonical kategori `politikk`. Dette er et separat spor fra:
- Oslo-bolk 04 (#6553; 17 steder, annen ChatGPT-konto);
- den andre kontoens andre stedsarbeid, inkludert #6563 og #6567;
- Kvadraturen-seksstedsinntaket i utkast-PR #6578;
- Hovedpostkontoret/Telegrafbygningen (#6571, merget) og Oslo tinghus (#6573, merget).

Ingen andre Place-, quiz-, Fagverk- eller bildefiler endres av denne kartleggingen. Ingen fullføringsstatus eller produksjonsmanifest settes.

## Repo-baseline – lest direkte fra canonical `main`

| Prioritet | Sted (`place_id`) | Canonical fil | Registrert `fagverk` | `image` / `frontImage` / `cardImage` |
| --- | --- | --- | --- | --- |
| 1 | Høyesteretts hus (`hoyesteretts_hus`) | `data/places/politikk/oslo/places_politikk/hoyesteretts_hus.json` | Nei | Alle tre mangler |
| 2 | Folkets Hus i Oslo (`folkets_hus_oslo`) | `data/places/politikk/oslo/places_politikk/folkets_hus_oslo.json` | Nei | Alle tre mangler |
| 3 | Høyres Hus (`hoyres_hus`) | `data/places/politikk/oslo/places_politikk/hoyres_hus.json` | Nei | Alle tre mangler |
| 4 | Høyblokka (`hoyblokka`) | `data/places/politikk/oslo/places_politikk/hoyblokka.json` | Nei | Alle tre mangler |
| 5 | Victoria terrasse (`victoria_terrasse`) | `data/places/politikk/oslo/places_politikk/victoria_terrasse.json` | Nei | Alle tre mangler |
| 6 | Y-blokka – historisk sted (`y_blokka`) | `data/places/politikk/oslo/places_politikk/y_blokka.json` | Nei | Alle tre mangler |

Alle seks har koordinater, egne `desc`/`popupDesc` og `quiz_profile`. Dette beviser **ikke** at fullquiz/QuizCard, kilde-/claimpakker, bilder eller Fagverk-registreringer er publiseringsklare. Fravær av bildefelter i canonical Place er ikke bevis for at ingen lisensierte bildefiler finnes andre steder.

### Quizstatus – viktig unntak

Repository-treet på `main` inneholder én direkte navngitt quizsett-fil for disse kandidatene:
`data/quiz/politikk/folkets_hus_oslo_sets.json` – **ett sett med fem spørsmål**. Det er en nyttig start, **ikke** v1-komplett fullquiz (minimum for `narrow` er 3×7; for `normal` 4×7) og heller ikke ti godkjente QuizCard-spørsmål. Ingen quizsett-filer med de andre fem place-ID-ene ble funnet i treets filnavn. Før negative konklusjoner om quizer må fellesquiz, manifest, runtime og QuizCard-indeks undersøkes på innholdsnivå.

### Eksisterende tekst – redaksjonell vurderingsretning, ikke godkjenning

- **Høyesteretts hus:** fortell bygningens skifte fra tre rettsinstanser til Høyesterett alene. Skill Høyesterett fra Oslo tinghus og fra lovgivende/utøvende makt.
- **Folkets Hus:** bevare stoff om den kollektive byggingen og fagorganiseringens langsiktige arbeid; forskjell på organisasjonsbygningen og Youngstorgets offentlige mobilisering.
- **Høyres Hus:** konkrete, etterprøvbare partiorganisasjonsfunksjoner uten partipolitisk reklame eller ubegrunnede påstander om alt partiet gjør.
- **Høyblokka:** den bevarte bygningen fra 1958, 22. juli 2011, rehabilitering og offisiell åpning av første byggetrinn 13. april 2026; ikke bland med revne Y-blokka.
- **Victoria terrasse:** hold diplomati, UD-historie og okkupasjonstidens overgrep i tydelig dokumenterte tidslag. Siden UD flyttet i 2026, må alle nåtidsformuleringer kontrolleres.
- **Y-blokka:** historisk stedsanker for et revet bygg; kunstverk og plassering må kildekontrolleres uten å framstille stedet som eksisterende bygning. Eget rettighetsløp for kunstfotografi og Picasso/Nesjar.

Les og vurder **begge** `desc` og `popupDesc` for hver kandidat ved redaksjonell produksjon; ingen ukontrollert omskriving uten 4.2-kilde-/claim-/setnings-/hash-paritet.

## Første etterprøvbare kilder (research, ikke ferdige claim-ID-er)

| Sted | Kilde | Hva kilden kan verifisere |
| --- | --- | --- |
| Høyesteretts hus | [Oslo byleksikon](https://oslobyleksikon.no/side/H%C3%B8yesteretts_hus) | 1903, Hans Jacob Sparre, opprinnelig Justisbygningen |
| Folkets Hus | [Arbeiderbevegelsens arkiv og bibliotek – Folkets Hus bygges](https://www.arbark.no/Bildeserier/folketshus/Folkets_Hus.htm) | 1907, byggetrinn 1954–1962, kollektiv finansiering og arkivfotografier (ikke automatisk fri bildelisens) |
| Høyres Hus | [Oslo Høyres årsmøte 2025](https://hoyre.no/oslo/arrangementer/arsmote-i-oslo-hoyre-2/) | Stortingsgata 20 og dokumentert møte-/årsmøtefunksjon; flere kilder trengs for historien |
| Høyblokka | [Regjeringen: åpning 13. april 2026](https://www.regjeringen.no/no/aktuelt/det-nye-regjeringskvartalet-offisielt-apnet/id3155987/) | Rehabilitert Høyblokk i første byggetrinn og faktisk innflytting |
| Victoria terrasse | [Riksantikvaren: fredning](https://riksantikvaren.no/fredninger/victoria-terrasse-blir-fredet/) og [Norsk digitalt fangearkiv](https://fanger.no/prisoncamps/673) | Frednings- og okkupasjonshistorie; særskilt kontroller flyttingen i 2026 |
| Y-blokka | [Regjeringen: kunst og bygninger](https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/bygninger/id712727/) og [Fakta: Y-blokken og kunsten](https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/fakta-y-blokken-ma-rives/id2721904/) | Rivingsåret 2020, integrert kunst og avgrensning til A-blokka; sjekk endelig plassering i oppdatert 2026-kilde |

At en historisk kilde har bilder betyr **ikke** at History GO kan bruke dem. Fotokreditering, opprinnelig objektidentitet, gjenbruksrettigheter og egne stående/bredformatutsnitt må gjennomgås per bilde. Særlig Y-blokkas kunst krever rettighetskontroll.

## Kanoniske regler som er lest før inntaket

- `AGENTS.md`;
- `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`, `docs/PLACE_PRODUCTION_PROFILES.md`;
- `data/places/README_place_rounds.md`, `data/badges/index.json`, `data/badges/place_production_routing_v1.json`, `data/badges/politikk.json`;
- `docs/PLACE_OBJECTS_CANONICAL.md`, `data/brands/brand_rules_v1_1.json`;
- `docs/PLACE_PRODUCTION_MINIMUM_V1.md` og `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`.

Hovedbadge er `politikk` på alle seks. Underbadges finnes i Place-filene, men **bekreftet produksjonsprofil og samlingsplan er ennå ikke låst**: full kilde-/underbadge-gate, Rule-Preflight og workcards gjenstår før større Place-endringer. Canonical prioritet: hovedbadge → underbadges → kilder → bekreftet profil → innholdsplan.

## Fortsettelsesplan – én samlet bolk med kontrollerte delporter

1. Per sted: READ-FIRST/workcard og eksplisitt overlap, koordinat, identitet, underbadge og godkjent kilde-/claim-gjennomgang.
2. Redaksjonell kvalitetssikring av eksisterende tekster. Revider bare svake eller feilaktige deler, med full 4.2-kontrakt.
3. Kartlegg faktisk fullquiz, QuizCard, manifest og Knowledge. Reparer spørsmål og distraktorer, skap minst ti dokumenterte kortspørsmål og bevar eksisterende riktig innhold.
4. Produser særskilte, kildebelagte `history_go_place_fagverk_v2`-blokker, registrer dem og kontroller navigasjon i eksisterende Fagverk-system.
5. Finn og rettighetsklar stedsbilder, separat stående `frontImage`, `cardImage`, kilde/lisens/fotograf og verifiserte filkontrollsummer.
6. Regenerer avledede registre/manifest og kontroller fullquiz, QuizCard, PlaceCard, Fagverk på smal mobil og desktop. Behold `v1_candidate` inntil hele porten faktisk består.

## Kvalitetsport per 23. oktober (kun baseline, ikke ferdigleveranse)

| Dimensjon | Foreløpig score / 5 | Begrunnelse |
| --- | --- | --- |
| Korrekthet og evidens | 3 | Canonical filer og enkelte eksterne kilder kontrollert; full claim-review gjenstår |
| Dekning og ferdigstillelse | 1 | Ingen Fagverk-/bilde-/quiz-/browserproduksjon utført |
| Faglig/redaksjonell kvalitet | 2 | Eksisterende stedstekster lest, men ikke samlet redaksjonelt godkjent |
| Teknisk integritet | 2 | Repo-/filstatuser kontrollert, ikke kjørt målrettede runtime-/CI-tester |
| Sikkerhet og ansvarlighet | 3 | Vern om steds-/kildegrenser; bildelisens og kunstrettigheter uavklart |
| Vedlikeholdbarhet | 4 | Én isolert dokumentasjonsfil, ingen shared/canonical writes |

**15/30 – blokkert som v1.** Dette utkastet er kun en etterprøvbar start. Ingen fremtidig PR må hevde v1 eller «ferdig» før hver dimensjon når minst 4/5, samlet minst 27/30 og faktiske porter består.
