# Redaksjonell artikkelkontrakt for litteratur v1

Denne kontrakten skiller strukturell fullfeltdekning fra redaksjonelt ferdige fagartikler. En dekningsrad, et kapittelskall, et begrepsregister eller en grønn schema-audit er ikke i seg selv en ferdig artikkel.

## Ferdigenheten som kontrakten måler

Et område kan få status `editorial_ready_v1` bare når alle relevante canonicale emner i området har fullverdig, sammenhengende artikkelbehandling. Ett stort emne kan kreve flere artikler, mens nært sammenhengende emner kan behandles i én tydelig strukturert artikkel når hvert emne fortsatt er eksplisitt og substansielt dekket. Artiklene skal kunne leses som selvstendige innføringer, ikke som utfylte kontrollskjemaer.

Det tidligere mønsteret med seks emner per område er dagens compatibility-inventar, ikke en redaksjonell kvote. Litteraturvitenskapelige områder kan ha ulik bredde. Nye relevante emner skal legges til, overlapp skal konsolideres, og artikkelomfang skal følge stoffet uten å bevare symmetri for symmetriens skyld.

Hver artikkel skal:

1. definere emnet og avgrense det mot nærliggende fagspørsmål;
2. forklare sentrale begreper i løpende, emnespesifikk prosa;
3. vise historisk, geografisk, medial eller institusjonell variasjon der den er relevant;
4. analysere minst to navngitte verk, dokumenter, framføringer eller institusjonelle praksiser med konkrete trekk;
5. presentere minst én reell faglig spenning, alternativ forklaring eller metodebegrensning;
6. skille observerbart kildespor fra fortolkning og større virkningspåstand;
7. ha minst 430 ord fordelt på minst fem substansielle avsnitt, med påstandsspor i hvert avsnitt.

Ordtallet er en nedre sperre, ikke et kvalitetsmål. En lang tekst kan fortsatt avvises hvis den bare gjentar metodeformler, objektnavn eller kontraktsord.

## Språk og artikkelform

Følgende er ikke tillatt i et redaksjonelt godkjent område:

- serieprodusert åpning som «Artikkelen behandler …»;
- rå canonical-ID-er med understreker brukt som leserrettet prosa;
- samme hele setning gjentatt i tre eller flere artikler;
- avsnitt som starter med liten bokstav;
- oppramsing av teorier, metoder eller verk uten at minst ett konkret trekk forklares;
- generelle formaninger om hva «analysen må» gjøre brukt som erstatning for faglig forklaring.

## Påstander og kilder

En claim skal være en etterprøvbar proposisjon, ikke en etikett av typen «Emnetittel: underpunkt». Hver claim skal peke til minst én kilde som direkte støtter den. Kildens `source_location` skal angi del, kapittel, side, scene, akt, avsnitt, katalogfelt eller navngitt nettsideseksjon; «verkpresentasjon» eller en generell landingsside uten lokator er ikke tilstrekkelig.

Artikkelavsnitt kan inneholde fortolkning som går lenger enn den registrerte claimen, men teksten skal da gjøre inferensgrensen synlig. Kilder som dokumenterer utgivelse, institusjon eller verkmetadata kan ikke alene brukes som belegg for publikumsvirkning, forfatterintensjon eller en generell historisk årsak.

## Status og revisjon

`editorial_quality_v1.json` er eneste register for denne kvalitetsporten. Bare områder som består den kjørbare redaksjonelle auditen, kan stå som `editorial_ready_v1`. Resten beholder sin strukturelle dekning, men står eksplisitt som `rewrite_pending`.

De nåværende 28 områdene og 168 artiklene er den eksisterende auditens denominator og må alle være behandlet så lenge de er aktive. `28/28` og `168/168` er likevel ikke alene bevis på at litteraturfeltet er komplett. Sluttstatus krever også kandidat-, gap-, overlapps- og utelatelsesaudit etter `docs/FAGVERK.md`; finner den nye relevante områder eller emner, skal registeret og denominator utvides før `complete` kan brukes.
