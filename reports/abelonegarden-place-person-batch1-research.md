# Research — Abelonegården + Abelone Kristensen

Dato: 2026-07-18

## Konklusjon

Abelone Kristensen skal ikke forankres til et generisk Vaterland-område eller et moderne, uvedkommende sted.

Det finnes et konkret historisk sted:

- **Abelonegården**
- adresse: **Karl XIIs gate 15**
- hjørnet av Karl XIIs gate og Sukkerhusgaten
- dagens situasjon: tomta ligger under **Oslo Spektrum**
- koordinat brukt i migreringen: **59.912902, 10.754734**

Dette er et navngitt, historisk byggested og tilfredsstiller kravet om konkret place-anker.

## Person

### Abelone Kristensen

Forslag til canonical id:

`abelone_kristensen`

Primær people-category:

`subkultur`

Begrunnelse:

Abelone Kristensen er dokumentert som en sentral og senere mytologisert skikkelse i det marginale og kriminelle Vaterlandsmiljøet. Hun ble kjent som «Vaterlands dronning», drev virksomhet i Abelonegården og ble gjennom Abelonesaken en av de mest kjente figurene fra Kristianias underverden.

Hun behandles i History Go som gate-/kultfigur og sosialhistorisk subkulturperson, ikke som romantisert kriminalitet.

## Kilder

### Store norske leksikon — Abelonesaken

SNL oppgir at Abelonegården lå i bakgården til Karl XIIs gate 15, på hjørnet av Karl XIIs gate og Sukkerhusgaten, der Oslo Spektrum ligger i dag. SNL knytter også Abelone Kristensen direkte til stedet og til Abelonesaken i 1893.

### Nasjonalbiblioteket — «Abelone, dronningen av Kristianias underverden»

Nasjonalbiblioteket beskriver Abelone som en sentral skikkelse i Vaterlands kriminelle miljø og dokumenterer vertshuset/bordellet som basen for virksomheten hennes.

### Lokalhistoriewiki — Abelonegården

Oppgir:

- Karl XIIs gate 15
- hjørnet av Karl XIIs gate og Sukkerhusgaten
- dagens tomt under Oslo Spektrum
- koordinater 59.912902, 10.754734

### Lokalhistoriewiki — Abelone Constance Kristensen

Dokumenterer hennes langvarige drift i Abelonegården og rollen som «Vaterlands dronning».

## Ikke brukt som anker

- `vaterland_bar_scene` — moderne og historisk uvedkommende
- `vaterland_historisk_elvelop` — for generelt og tematisk feil som primær personforankring
- `nybrua_vaterlandsparken` — annet konkret sted i Vaterland, men ikke Abelones dokumenterte gård
- `storgata` — har biografisk forbindelse gjennom tukthuset, men er ikke hovedstedet for underverdenshistorien hennes

## Implementeringsregel

Migreringen skal opprette:

- `data/places/historie/oslo/places_historie/abelonegarden.json`
- `data/people/subkultur/oslo/abelonegarden/abelone_kristensen.json`

og registrere begge i sine respektive manifests.
