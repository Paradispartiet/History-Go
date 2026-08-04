# Politikk: pensumarkitektur og redaksjonell kvalitetsutvidelse v1

Status: operativ arkitektur for den materialiserte Politikk-fagsiden. Dokumentet beskriver presentasjons- og læringslaget; canonicale id-er, quizkontrakter og eksisterende lærekapitler beholder sitt eierskap i de etablerte filene.

## Formål

Politikk skal leses som et statsvitenskapelig studieløp, ikke som et flatt register av likeverdige databokser. Arkitekturen legger derfor en pedagogisk overbygning over de 13 canonicale fagområdene. Overbygningen avgjør hva brukeren møter først, hva som bygger på hva, hvilke spørsmål som binder stoffet sammen, og hvor metoder og begreper hører hjemme.

Strukturen er universitetsnær: politisk teori, komparativ politikk, politisk atferd, offentlig administrasjon, offentlig politikk, internasjonal politikk og politisk økonomi presenteres som hovedfelt. Metode, styringsnivåer, politikkprosessen og anvendte problemområder er egne dimensjoner. Politisk standpunkt er ikke i seg selv politisk analyse; normative argumenter skal identifiseres og skilles fra empiriske påstander.

## Studieløpet

Den aktive arkitekturen ligger i `data/fag/politikk/curriculum_architecture_politikk_v1.json` og består av 41 redigerte deler:

- 5 progresjonstrinn fra begrepsforståelse til selvstendig utredning
- 5 grunnspørsmål om makt, stat, demokrati, rettferdighet og legitimitet
- 7 statsvitenskapelige hovedfelt
- 6 ledd i politikkprosessen
- 6 metodemoduler
- 5 styringsnivåer fra lokalt til globalt
- 7 anvendte problemspor

Hver del har en faglig introduksjon, en lengre oversikt, tre læringsmål, tre nøkkelspørsmål og koblinger til canonicale fagområder, emner, metoder eller kapitler. Ingen del krever et kunstig fast antall emner.

## Bevarte canonicale lag

Det eksisterende registeret er et sekundært kompatibilitetslag:

- 13 fagområder
- 123 emner
- 71 metoder
- 152 teorihooks
- 13 fullverdige lærekapitler

Alle canonicale fagområder, emner og metoder er plassert i den nye arkitekturen uten å endre id-ene. Den flate registervisningen er fortsatt tilgjengelig for oppslag, testing og eksisterende dyplenker, men er ikke lenger fagets hovedfortelling.

## Begrepsverket

`data/fag/politikk/concepts_politikk_canonical_v1.json` materialiserer de 962 unike begrepene som finnes i canonicale emnefelt. Hvert oppslag har definisjon, avgrensning, betydning, eieremne, fagområde, forbindelser, vanlige feilbruk, indikatorer, kildekrav, relevante metoder og nøkkelspørsmål.

Begrepsverket skiller definisjonskilden eksplisitt:

- 143 oppslag har en direkte redigert eller canonical definisjon.
- 819 oppslag har nå en selvstendig statsvitenskapelig definisjon. 273 av disse er egne redaksjonelle definisjonsfrø for termer som krever særskilt presisjon, mens 546 følger fagspesifikke semantiske regler for blant annet institusjoner, makt, rett, metode, prosess, fordeling og utfall.

Definisjon og emnebruk er ikke lenger samme tekst. Feltet `definition` forklarer selve begrepet uten å lene seg på en emnetittel. Feltet `contextual_use` viser deretter hvordan begrepet inngår i ett av de 123 emnene. Avgrensning, feilbruk, indikatorer, kildekrav og forbindelser ligger fortsatt i egne felt. Den tidligere statusen `contextual_from_canonical_emne` er fjernet; ingen av de 962 oppslagene bruker en generell domenefallback.

## Redaksjonell kvalitetsport

`tools/validate-politikk-curriculum-architecture.mjs` stopper regressjoner dersom:

- en av de 41 studieløpsdelene mangler dybde, læringsmål eller nøkkelspørsmål
- et canonicalt fagområde, emne eller en metode faller ut av arkitekturen
- et av de 962 begrepene mangler forklaring, avgrensning eller eierkobling
- en definisjon inneholder den gamle emnemalen, dupliserer en annen definisjon eller bruker generell domenefallback
- definisjon og kontekstuell emnebruk ikke er skilt i egne felt
- begrepsverket ikke dekker alle 123 emner og alle 13 fagområder
- et emne mangler lærekapittel
- lærekapitlene ikke lenger utgjør et reelt fulltekstverk
- statusregisteret ikke viser den faktiske, utvidede og auditerte redaksjonelle tilstanden

Materialiseringsskriptet `tools/materialize-politikk-curriculum.mjs` bygger de to nye datafilene deterministisk fra canonicale Politikk-kilder og det redigerte arkitekturgrunnlaget. Validatoren er den bindende porten; generering alene er ikke dokumentasjon på faglig kvalitet.

## Visning

Den generelle fagsiden viser studieløpet først, et søkbart og filtrerbart begrepsverk, og det gamle domeneregisteret som sammenfoldet sekundærlag. Politikk-merkesiden bruker de samme kildene, slik at de to inngangene ikke utvikler parallelle faglige sannheter. På emnesider vises alle relevante begreper som forklarte oppslag, ikke bare som etiketter.
