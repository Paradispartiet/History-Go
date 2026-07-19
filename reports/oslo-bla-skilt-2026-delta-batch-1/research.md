# Blå skilt i Oslo — 2026 delta batch 1

Dato: 2026-07-19

## Formål

Dette er første delta-audit av nye Blå skilt i Oslo etter de lukkede Oslo-source-passene for Atlas Obscura, Oppdag Kvadraturen og Oslo kommunes kultureiendommer.

Kilden er Oslo Byes Vels løpende oversikt over Blå skilt. Oversikten oppgir per juli 2026 omtrent 500 skilt og lister fem nye Oslo-skilt fra april og mai 2026.

Kilde:

- https://www.oslobyesvel.no/blaa-skilt-i-oslo

## Kandidater

### Mai 2026

1. Aud Schønemann — Vetlandsveien 69D
2. Stein Mehren — Ullevålsveien 60
3. Christopher Hornsrud — Mogens Thorsens gate 5

### April 2026

4. Helverschous løkke — Munkedamsveien 35
5. Enerhaugen Samfund — skilt ved Smedgata 34

## Representasjonsregel for Blå skilt

Et Blått skilt er ikke automatisk et nytt canonical History Go-sted.

For hver kandidat skal auditen skille mellom:

1. et allerede eksisterende canonical sted som kan berikes;
2. et fysisk eller historisk selvstendig sted som faktisk mangler;
3. et minneskilt / bosted / tidslag som bør ligge som underordnet stedlig innhold dersom en korrekt parent finnes;
4. en historisk lokalitet der dagens skiltadresse ikke må feilpresenteres som den gamle bygningens eksakte adresse eller fotavtrykk.

Målgruppe eller skiltstatus alene skal ikke brukes til å skape parallelle kartmarkører.

## Foreløpig kildegrunnlag

### Aud Schønemann — Vetlandsveien 69D

Oslo Byes Vel oppgir det nye skiltet på Vetlandsveien 69D. Oslo byleksikon beskriver nr. 69 som en boligblokk på Oppsal og oppgir at oppgang D har Blått skilt til minne om Aud Schønemann, som bodde her 1958–1981.

History Go har allerede Aud Schønemann som person i popkulturdata, men første repo-søk fant ingen canonical place-record for denne adressen eller bostedet.

Kilder:

- https://www.oslobyesvel.no/blaa-skilt-i-oslo
- https://oslobyleksikon.no/side/Vetlandsveien
- https://snl.no/Aud_Schønemann

Foreløpig beslutning: **audit nødvendig**. Et privat boligbygg skal ikke bli ny canonical markør bare fordi det har fått et skilt. Vi må først kontrollere eksisterende område-/stedspersonmodell og om bostedet tilfører en selvstendig fysisk spilldestinasjon.

### Stein Mehren — Ullevålsveien 60

Oslo Byes Vel oppgir det nye skiltet på Ullevålsveien 60. Oslo byleksikon beskriver bygningen som en frittliggende leiegård fra 1902 og oppgir at Stein Mehren bodde her 1939–2017. Store norske leksikon beskriver Mehren som en av nyere norsk litteraturs fremste lyrikere.

Første repo-søk fant ingen eksisterende Stein Mehren-record eller canonical place-record identifisert med denne adressen.

Kilder:

- https://www.oslobyesvel.no/blaa-skilt-i-oslo
- https://oslobyleksikon.no/side/Ullevålsveien
- https://snl.no/Stein_Mehren

Foreløpig beslutning: **sterk kandidat til litterært bosted eller stedlig minnespor**, men canonical status avgjøres først etter adresse-/duplikataudit og sammenligning med repoets behandling av andre forfatterhjem.

### Christopher Hornsrud — Mogens Thorsens gate 5

Oslo Byes Vel oppgir skiltet som «Mogen Thorsens gate 5». Den offisielle gaten heter Mogens Thorsens gate. Lokalhistoriewiki oppgir at Christopher Hornsrud bodde i mange år i nr. 5. Store norske leksikon dokumenterer Hornsrud som Arbeiderpartiets første statsminister, fra 28. januar til 15. februar 1928.

Første repo-søk fant ingen existing Christopher Hornsrud-record eller canonical place-record identifisert med adressen.

Kilder:

- https://www.oslobyesvel.no/blaa-skilt-i-oslo
- https://lokalhistoriewiki.no/wiki/Mogen_Thorsens_gate_(Oslo)
- https://snl.no/Christopher_Hornsrud

Foreløpig beslutning: **audit nødvendig**. Historisk personbetydning er sterk, men et privat bosted skal ikke automatisk bli et nytt kartsted uten en eksplisitt stedlig modell.

### Helverschous løkke — Munkedamsveien 35

Helverschous løkke, opprinnelig Sommerfryd, var en historisk byløkke ved Munkedamsveien 35. Oslo byleksikon oppgir at løkkehuset ble revet i 1896. Dagens bygning på adressen er Grøndahlgården fra 1935, og et Blått skilt er satt opp til minne om den tidligere løkken.

Løkken hadde blant annet traktørvirksomhet, og Skydeselskabet Christian Augusts Venner brukte stedet til skytekonkurranser fram til 1869.

Kilder:

- https://www.oslobyesvel.no/blaa-skilt-i-oslo
- https://oslobyleksikon.no/side/Helverschous_løkke
- https://oslobyleksikon.no/side/Munkedamsveien

Foreløpig beslutning: **sterk historisk-site-kandidat**, men dagens adressepunkt skal i så fall beskrives som minne-/historisk anker for en revet løkke, ikke som punkt for et bevart løkkehus.

### Enerhaugen Samfund — skilt ved Smedgata 34

Oslo Byes Vel oppgir det nye skiltet ved Smedgata 34. Enerhaugen, Grønland og Tøyen historielag dokumenterer at skiltet ble avduket der 14. april 2026 og at det er montert omtrent der Enerhaugens Samfund sto ferdig 175 år tidligere.

Her finnes en viktig adressehistorisk fallgruve: Oslo byleksikon og Lokalhistoriewiki omtaler det historiske bedehuset under eldre Smedgata 38, mens dagens skilt er montert ved nr. 34 etter at Enerhaugen ble sanert og gaten/bebyggelsen ble omformet.

Enerhaugen Samfund ble stiftet i 1850 av Honoratus Halling, og bedehuset var knyttet til den tidlige arbeiderforeningen og kirkelig sosial virksomhet på Enerhaugen.

Kilder:

- https://www.oslobyesvel.no/blaa-skilt-i-oslo
- https://egt-historielag.no/informasjon/nyheter/vis/?ID=60485&T=Referat+arrangementer+14%2F4+2026+&af=1
- https://oslobyleksikon.no/side/Smedgata
- https://oslobyleksikon.no/side/Enerhaugen

Foreløpig beslutning: **sterk historisk-site-kandidat**, men dagens Smedgata 34 må behandles som skilt-/minneanker og ikke ukritisk som den historiske bygningens gamle adresse.

## Audit som skal kjøres

1. Kjør repoets normative address-first-coordinate-finder for alle fem nåværende skiltadresser.
2. Lagre hvert resultat med `tee` under `reports/oslo-bla-skilt-2026-delta-batch-1/coordinates/`.
3. Søk dagens runtime place index etter navn, navnevarianter og eksakt adresse.
4. Søk people-data etter de tre personene.
5. Søk Wonderkammer-data etter eksisterende minnespor.
6. Ikke opprett canonical data før auditresultatene er inspisert.

## Viktig

Koordinatfunn for en nåværende skiltadresse dokumenterer hvor skiltet/adressen er i dag. For Helverschous løkke og Enerhaugen Samfund er dette ikke i seg selv bevis for det eksakte historiske bygningsfotavtrykket.
