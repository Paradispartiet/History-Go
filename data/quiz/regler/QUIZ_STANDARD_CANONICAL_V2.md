# History Go – kanonisk quizstandard v2

**Status: eneste bindende produksjonsstandard for nye og reviderte quizer.**

Alle andre README-filer, generatorpatcher, pseudokodefiler og eldre set-maler er enten kategoriinformasjon eller historisk dokumentasjon. Ved konflikt gjelder alltid denne filen.

## 1. Produksjonsrekkefølge

Quizproduksjonen skal gå denne veien:

> **kilde eller verifiserbar observasjon → konkret påstand → interessant spørsmål → faglig kobling og metadata**

Følgende arbeidsmåte er ikke tillatt:

> emneetikett → sted → konstruert spørsmål som demonstrerer emnet

Fagkart, emner, metoder og teori skal hjelpe oss å velge, ordne og forklare stoff. De skal ikke være hovedkilden til synlige påstander.

## 2. Innholdsbalanse

For en quizpakke med minst ti spørsmål er normalområdet:

- **50–60 % konkrete fakta**
- **20–30 % årsak, utvikling og sammenheng**
- **15–25 % emne-, fag- og begrepsspørsmål**

Dette er et normalområde, ikke en matematisk tvangstrøye. En liten eller svært konkret quiz kan ha mer fakta. En faglig rik quiz kan ha opptil 25 % tydelige emnespørsmål dersom de er nødvendige, stedbundne og bygger på reelt stoff.

En quiz skal aldri fylles ut for å treffe en prosent. Hvis kildematerialet er svakt, skal quizen kortes ned.

## 3. Hva de tre lagene betyr

### Konkrete fakta

Spør om blant annet:

- personer, arter, grupper eller institusjoner
- år, perioder og rekkefølge
- verk, bygninger, tekster, produkter eller hendelser
- tidligere og nåværende funksjon
- materiale, teknikk, konstruksjon eller synlige spor
- bruk, praksis, resultater og dokumenterte detaljer

### Årsak, utvikling og sammenheng

Spør om blant annet:

- hvorfor noe ble bygd, flyttet, endret, forbudt, bevart eller revet
- hva en hendelse, beslutning eller teknisk løsning førte til
- hvordan funksjon, konflikt, miljø eller samfunnsendring påvirket stedet
- hvordan flere konkrete fakta henger sammen

### Emne-, fag- og begrepsspørsmål

Disse skal lære spilleren et faktisk faglig redskap. De må:

1. være knyttet til en konkret påstand, observasjon, hendelse, gjenstand eller praksis
2. bruke et faguttrykk som tilfører presisjon
3. ha plausible alternativer på samme faglige nivå
4. forklare begrepet videre i `knowledge`

God form:

> Hva betyr «sosial infrastruktur» i et gratis bibliotek som Deichman?

Dårlig form:

> Hvorfor passer Deichman til emnet sosial infrastruktur?

## 4. Faglig bevaringsregel

Ved omskriving skal vi ikke gjøre quizen faglig flatere.

Essensielle uttrykk, metoder og poenger skal beholdes når de er relevante. De kan ligge i:

- et godt, konkret begrepsspørsmål
- `knowledge`
- `emne_id`
- `related_emner`
- `core_concepts`
- `concept_focus`
- `method_id`
- kunnskapspopup eller annet fordypningslag

Før en quiz forkortes eller omskrives skal faglige poenger kartlegges. Det som fjernes fra selve spørsmålet, skal enten være overflødig eller bevares i et egnet kunnskapslag.

## 5. Språk

Klare faktaspørsmål er ønsket. Variasjon skal komme fra stoffet, ikke fra kunstige formuleringer.

Bruk naturlige åpninger som:

- Hvem …?
- Når …?
- Hva …?
- Hvilket verk, bygg, dyr, produkt eller vedtak …?
- Hva lå eller skjedde her før …?
- Hvorfor ble …?
- Hva førte til …?
- Hvordan virker denne konkrete løsningen …?
- Hvilket synlig spor viser …?
- Hva betyr faguttrykket i akkurat dette tilfellet …?

## 6. Blokkerte standardmaler

Disse formuleringene skal flagges og normalt omskrives:

- «Hvorfor passer stedet til emnet …?»
- «Hva gjør stedet relevant for emnet …?»
- «Hvordan kan stedet leses som …?»
- «Hva er den mest presise faglige lesningen …?»
- «Hvilket begrep beskriver best stedet …?» uten en konkret faglig situasjon
- «Hvilken teori eller teoretiker passer best …?» uten et dokumentert problem
- spørsmål som omtaler fagplan, fagkart, mapping, hook eller quizgenerator
- spørsmål om hvorfor noe er et godt History Go-spørsmål

## 7. Svaralternativer

Alternativene skal være plausible, sammenlignbare og omtrent like presise.

Ikke bruk:

- ett langt, nyansert fasitsvar mot to korte tullesvar
- distraktorer fra helt andre tidsperioder eller fagfelt uten grunn
- «aldri», «alltid», «bare» eller åpenbare umuligheter som enkel avsløring
- alternativer som gjør at spilleren kan velge riktig uten kunnskap

## 8. Kilder

Synlige faktapåstander skal primært bygge på:

1. primærkilder, offisielle institusjons- eller forvaltningskilder
2. lokale og historiske kilder
3. oppslagsverk, museer, arkiver og faglitteratur
4. verifiserbare observasjoner ved stedet
5. kvalitetssikret forskning og dokumentasjon

Interne fagfiler er styring og metadata, ikke faktakilde.

## 9. Kategorifiler

Hver kategori har én profil i `data/fag/<kategori>/supersetQUIZMAL_*.json`.

Kategori-profilen kan bare definere:

- kategoriens faglige prioriteringer
- gyldig `emne_id`-prefiks
- sentrale begreper som ikke bør mistes
- relevante kildetyper
- ett eksempel på god, konkret bruk av faget

Kategori-profilen kan ikke overstyre denne standardens produksjonsrekkefølge, balanse, språk- eller kilderegler.

## 10. Teknisk skjema og register

- Spørsmålsfelter: `data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json`
- Autoritetsregister: `data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`
- Fagmanifest: `data/fag/fag_manifest.json`

## 11. Kontroll

Kjør:

```bash
npm run audit:quiz-content
npm run audit:quiz-content:report
npm run audit:quiz-templates
npm run test:quiz-content-audit
```

Auditen skal finne dårlig malbruk, ubalanse og uklare autoritetspekere. Den skal ikke straffe relevante fagbegreper bare fordi de er faglige.
