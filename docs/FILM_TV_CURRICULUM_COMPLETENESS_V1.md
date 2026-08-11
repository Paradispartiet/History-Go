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

Neste port er `canonical_inventory_migration`: fagkart, emner, metoder, hooks, mappings, quizregler, pensum og runtime-projeksjon skal regenereres samlet fra migrasjonsspesifikasjonen. Videre kapittelproduksjon er blokkert til denne migrasjonen og reauditen av de to eksisterende kapitlene er grønn.

## Maskinell kontroll

Auditen kjøres med:

```bash
node scripts/audit-film-tv-curriculum-completeness-v1.mjs
node scripts/audit-film-tv-legacy-emne-classification-v1.mjs
node scripts/audit-film-tv-variable-inventory-v1.mjs
node --test tests/film-tv-curriculum-completeness-v1.test.mjs
node --test tests/film-tv-legacy-emne-classification-v1.test.mjs
node --test tests/film-tv-variable-inventory-v1.test.mjs
```

Canonicale rapporter:

- `reports/fagverk/film-tv-curriculum-completeness-v1.json`
- `reports/fagverk/film-tv-legacy-emne-classification-v1.json`
- `reports/fagverk/film-tv-variable-inventory-v1-audit.json`
