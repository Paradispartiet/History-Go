# Film & TV — heldekningsaudit og arkitekturport v1

Status: **bindende refaktorport før videre kapittelproduksjon**
Eier: `film_tv_curriculum_completeness`
Sist kontrollert: **2026-08-11**

Dette dokumentet anvender heldekningsregelen i [`FAGVERK.md`](./FAGVERK.md) på Film & TV. Det erstatter ikke de canonicale fagfilene. Det fastslår hvorfor dagens inventar må refaktoreres før et tredje kapittel produseres, og hva refaktoren må dokumentere.

## Konklusjon

Dagens Film & TV-inventar er teknisk konsistent, men ikke et gyldig bevis på faglig fullstendighet. Strukturen er fullstendig symmetrisk:

- seks områder har nøyaktig 20 emner hver;
- hvert område har nøyaktig ti hooks;
- hvert hook har nøyaktig to emner;
- de 120 emnene reduseres til én felles definisjonsmal når det innskutte emnenavnet normaliseres;
- `why_it_matters` består av seks områdemaler, og samtlige emner bruker samme overlappsregel.

Mønsteret `6 × 10 × 2 = 120` viser at en teknisk kvote har formet inventaret. Flere par er reelle underperspektiver, men andre er duplikater eller uklare splittelser. Dette må avgjøres faglig, par for par og på tvers av dagens områdegrenser.

## Ekstern baseline

Refaktoren bruker følgende autoritative og universitetsnære kontrollgrunnlag:

- [QAA Subject Benchmark Statement: Communication, Media, Film and Cultural Studies (2024)](https://www.qaa.ac.uk/docs/qaa/sbs/sbs-communication-media-film-and-cultural-studies-24.pdf) krever at utdanning kan kontekstualisere audiovisuelle former historisk, politisk, globalt, sosialt, økonomisk, kulturelt, miljømessig og teknologisk. Den fremhever analyse, representasjon, makt, ikke-vestlige perspektiver, produksjon, metoder, bærekraft og nye teknologier.
- [NTNU Filmvitenskap — studieplan 2026](https://www.ntnu.no/studier/bfv/studiets-oppbygning) har film og fortelling, filmens historie, filmen i samfunnet, nordisk film og TV, dokumentar, film-/TV-/spillbransjen og filmopplevelsen som faglig kjerne.
- [NTNU Filmvitenskap — læringsbeskrivelse](https://www.ntnu.no/studier/bfv) krever filmatiske grunnelementer, narratologi, norsk og internasjonal historie, produksjonsforhold, kunstneriske utviklingslinjer og samfunnsmessig betydning.
- [UiO MEVIT1110 Audiovisual Aesthetics](https://www.uio.no/studier/emner/hf/imk/MEVIT1110/) behandler fortelling, stil og sjanger på tvers av film og TV-serier.

Kildene er rammer for completeness-audit, ikke en kvote eller en læreplan som skal kopieres ordrett.

## Dokumenterte hull i dagens arkitektur

Følgende kan ikke auditeres som heldekkende i dagens seksområdemodell:

1. Film- og TV-historie og historiografi er ikke et selvstendig kunnskapsområde. Kulturarv og minne kan ikke erstatte historisk utvikling, periodisering, kildekritikk og internasjonale/nasjonale forløp.
2. Audiovisuell form og estetisk analyse er delvis plassert under produksjonsarbeid. Et bilde, en lyd eller en klippestruktur må kunne analyseres som form uten å reduseres til utstyr eller yrkesrolle.
3. TV-faglighet finnes spredt, men mangler en eksplisitt tverrgående kontroll av TV-historie, kringkasting, serialitet, direkteformat, produksjon, publikum, offentlighet og strømmeovergang.
4. Norsk, nordisk, global og ikke-vestlig dekning kan ikke måles. «Nasjonal fortelling» er ikke tilstrekkelig.
5. Representasjon og makt er ett emnepar, ikke et kontrollert felt for blant annet klasse, kjønn, rasisering, seksualitet, funksjonsvariasjon, urfolksperspektiver og ulik synlighet.
6. Nye produksjons- og distribusjonsteknologier, kunstig intelligens, virtuell produksjon, tilgjengelighet og bærekraft mangler en tydelig eierstruktur.
7. Dokumentar er splittet mellom sted, sjanger og sannhet uten samlet behandling av dokumentarformer, evidenspåstander, iscenesettelse, deltakere og etikk.

## Kandidatarkitektur

Auditen foreslår følgende faglig begrunnede kandidatområder. De er ikke nummerlåste, og kan splittes eller slås sammen når emneklassifiseringen viser at stoffet krever det:

1. Audiovisuell form, stil og analyse
2. Fortelling, sjanger, serialitet og format
3. Film- og TV-historie og historiografi
4. Dokumentar, virkelighetsformer og etikk
5. Samfunn, representasjon, identitet og makt
6. Produksjon, arbeid, teknologi og praksis
7. Industri, institusjoner, politikk og distribusjon
8. Visning, publikum, resepsjon og deltakelse
9. Sted, location og skjermgeografi
10. Arkiv, kulturarv, minne og stjerner

Antallet ti er resultatet av denne første faglige grupperingstesten, ikke et ferdigkrav. Den maskinlesbare auditen lagrer begrunnelsen for hvert kandidatområde.

## Migrasjonskrav

Før nytt kapittelarbeid skal:

1. hvert av de 120 legacy-emnene klassifiseres som `keep`, `merge`, `move`, `split` eller `retire`;
2. hvert valg begrunnes mot en selvstendig faglig problemstilling og nabofag;
3. manglende relevante emner legges til uten å kompensere med et bestemt antall slettinger;
4. aliases og historiske referanser bevares gjennom en eksplisitt migrasjon;
5. methods, hooks, mappings, quizregler, pensum og runtime-projeksjon regenereres fra samme inventar;
6. de to eksisterende kapitlene reauditeres uten `20/20` eller `3/9/27` som ferdigbevis;
7. kapittelproduksjon gjenopptas i en faglig læringsrekkefølge;
8. `complete` blokkeres til en siste gap-, overlapps-, fyllstoff- og utelatelsesaudit er grønn.

De to materialiserte kapitlene slettes ikke. Tekst, claims, kilder og cases bevares, men kapittelinndeling og emnekoblinger kan senere justeres når ny canonical arkitektur er vedtatt.

## Fremdrift i refaktoren

Første migreringskrav er nå gjennomført i `reports/fagverk/film-tv-legacy-emne-classification-v1.json`: alle 120 legacy-emner har nøyaktig én eksplisitt beslutning, ett eller flere kandidatområder, etterfølgerbegrep, begrunnelse, faglig grense og alias-krav. Fordelingen mellom `keep`, `merge`, `move`, `split` og `retire` er en konsekvens av vurderingene, ikke et måltall.

Klassifikasjonen er migreringsinput, ikke det nye canonicale inventaret. Gapdesignen er nå gjennomført i [`film_tv_variable_inventory_v1.json`](../data/fag/TV_og_Film/film_tv_variable_inventory_v1.json):

- alle 120 legacy-ID-er har minst ett aliasmål, og bare eksplisitte `split`-beslutninger kan vifte ut til flere;
- andreordensoverlapp som først ble synlige etter klassifikasjonen er slått sammen;
- brede paraplyemner er merket som integrerende grunnlag, ikke parallelle spesialemner;
- 82 manglende emner er lagt til med selvstendig problemstilling, faglig grense og evidensreferanse;
- de ti faglig begrunnede områdene har nå variable inventarstørrelser fra 15 til 25;
- dagens 192 foreslåtte emner er en integritetstelling, ikke et sluttmål eller tak.

De største reelle tilleggene ligger i film- og TV-historie/historiografi, global og dekolonial skjermhistorie, eksplisitte TV-forløp og -formater, animasjon og adaptasjon, dokumentartradisjoner, representasjons- og maktakser, produksjonspraksis, KI, tilgjengelighet, bærekraft, skjermgeografi og digital bevaring. Et senere funn kan fortsatt legge til, slå sammen, flytte eller avgrense emner når det begrunnes faglig.

Porten `canonical_inventory_migration` er nå gjennomført samlet og deterministisk. Fagkart, emner, metoder, hooks, mappings, quizregler, pensum og runtime-projeksjon bruker ti variabelt store områder, 192 canonicale emner, 119 metoder og 192 eksplisitte hooks/mappinger. Tallene er integritetskontroller, ikke målkvoter. De 120 gamle ID-ene finnes bare som sporbare aliases i inventaret, og runtime-stedene peker til canonicale etterfølgere.

Reauditeringsporten er også gjennomført. Kapitlet om kinoer, visningssteder og publikum projiserer 20 legacy-ID-er til 18 canonicale emner; kapitlet om produksjon, studio og filmarbeid projiserer 20 til 20. Kapittelfiler, briefer og registry/runtime bruker nå de samme canonicale ID-ene. All fulltekst, 54 verifiserte claims, 44 kilder og 8 stedscase er bevart.

Læringsrekkefølgeporten er nå gjennomført i [`film_tv_learning_order_plan_v1.json`](../data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json). De to reauditerte kapitlene eier 38 canonicale emner. Alle 154 udekkede emner har nøyaktig én redaksjonell eier i seks progresjonsfaser og 15 variabelt store planenheter med eksplisitte forkunnskaper, overlappsgrenser og kildekrav. De 15 enhetene er resultatet av dagens faglige problemgrenser, ikke en kvote eller et tak; ny evidens kan fortsatt legge til, slå sammen, flytte eller dele.

Kilde- og claimbriefen for første produksjonskandidat er gjennomført i [`film_tv_audiovisual_form_source_claim_brief_v1.json`](../data/fag/TV_og_Film/film_tv_audiovisual_form_source_claim_brief_v1.json). Den dekket alle enhetens 10 emner med 8 inspectable universitets- og institusjonskilder, 7 dokumenterte verkcase og 20 eksplisitte claimplaner. Etter fulltekstporten er briefen markert konsumert, og alle 20 planene peker til en verifisert sluttclaim; to ble eksplisitt innsnevret under kildekontrollen.

«Audiovisuell form og sansing» er nå fulltekstprodusert og runtime-registrert. Kapittelet eier 10/10 canonicale emner gjennom tre ulikt store moduler med 4–4–2 emneeide seksjoner. De 23 fagavsnittene har avsnittsnivå claimtrace til 20 verifiserte claims; alle åtte kilder brukes, og de sju verkcasene holdes atskilt fra de to canonicale anvendelsesstedene. Modul-, seksjons- og avsnittstallene beskriver denne redaksjonelle løsningen og er ikke kvoter for senere kapitler.

Kilde- og claimbriefen for «Fortelling, synsvinkel og sjanger» er nå gjennomført. Den dekker enhetens 5/5 canonicale emner med 12 inspectable universitets- og filminstitusjonskilder, fem filmcase og ett TV-case. De 13 claimplanene varierer 3–2–3–2–3 etter de selvstendige problemene; dette er et eksplisitt vern mot å videreføre to claims per emne som produksjonskvote. Realisme skilles fra ukonstruert sannhet, fokalisering fra kameravinkel, rollefigurfunksjon fra skuespiller/stjernepersona og sjangerkontrakt fra statisk ingrediensliste. Serialitet, episode, sesong og format tilhører fortsatt neste planenhet.

Aktiv port er `narrative_viewpoint_genre_source_brief_complete_full_chapter_production`. «Fortelling, synsvinkel og sjanger» er ikke runtime-registrert og kan ikke registreres før fulltekst, kildekontroll, avsnittsnivå claimtrace og ny audit er grønne.

## Maskinell kontroll

Auditen kjøres med:

```bash
node scripts/audit-film-tv-curriculum-completeness-v1.mjs
node scripts/audit-film-tv-legacy-emne-classification-v1.mjs
node scripts/audit-film-tv-variable-inventory-v1.mjs
node scripts/materialize-film-tv-canonical-migration-v1.mjs
node scripts/reaudit-film-tv-existing-chapters-v1.mjs
node scripts/plan-film-tv-learning-order-v1.mjs
node scripts/brief-film-tv-audiovisual-form-sources-v1.mjs
node scripts/materialize-film-tv-audiovisual-form-fulltext-v1.mjs
node scripts/audit-film-tv-audiovisual-form-fulltext-v1.mjs
node scripts/brief-film-tv-narrative-viewpoint-genre-sources-v1.mjs
node --test tests/film-tv-curriculum-completeness-v1.test.mjs
node --test tests/film-tv-legacy-emne-classification-v1.test.mjs
node --test tests/film-tv-variable-inventory-v1.test.mjs
node --test tests/film-tv-canonical-migration-v1.test.mjs
node --test tests/film-tv-existing-chapter-reaudit-v1.test.mjs
node --test tests/film-tv-learning-order-plan-v1.test.mjs
node --test tests/film-tv-audiovisual-form-source-brief-v1.test.mjs
node --test tests/film-tv-audiovisual-form-fulltext-v1.test.mjs
node --test tests/film-tv-narrative-viewpoint-genre-source-brief-v1.test.mjs
```

Canonicale rapporter:

- `reports/fagverk/film-tv-curriculum-completeness-v1.json`
- `reports/fagverk/film-tv-legacy-emne-classification-v1.json`
- `reports/fagverk/film-tv-variable-inventory-v1-audit.json`
- `reports/fagverk/film-tv-canonical-migration-v1-audit.json`
- `reports/fagverk/film-tv-existing-chapter-reaudit-v1-audit.json`
- `reports/fagverk/film-tv-learning-order-plan-v1-audit.json`
- `reports/fagverk/film-tv-audiovisual-form-source-brief-v1-audit.json`
- `reports/fagverk/film-tv-audiovisual-form-fulltext-v1-audit.json`
- `reports/fagverk/film-tv-narrative-viewpoint-genre-source-brief-v1-audit.json`
