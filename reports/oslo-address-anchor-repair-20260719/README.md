# Oslo address anchor repair — Torggata, Storgata og Torggata Blad

## Bakgrunn

Denne reparasjonen gjenopptar den normative Geonorge-løypen fra de vellykkede adressebatchene og erstatter den senere gategeometri/status-tilnærmingen som lot feil hovedkoordinater stå.

## Valgte adresseankre

- `torggata_blad` → **Hausmanns gate 19, Oslo**. Torggata Blads eget 2008-materiale dokumenterer dette som redaksjonsadresse. Dette er et historisk redaksjonsanker, ikke en bokhandel.
- `torggata` → **Torggata 22, Oslo**. Konkret adresse på den sentrale oppgraderte Torggata-strekningen. Adressen er også dokumentert i Torggata Gateforenings gatekart. Valgt som representativt gateanker, ikke som geometrisk midtpunkt.
- `storgata` → **Storgata 26, Oslo**. Konkret adresse på den sentrale handels-/bylivsstrekningen i Storgata. Valgt som representativt gateanker, ikke som geometrisk midtpunkt.

## Gate-regel

For Torggata og Storgata dokumenterer Oslo byleksikon selve gateløpet. Geonorge-adressepunktet brukes bare som konkret hovedmarkør innenfor gateløpet. `locatorType` forblir derfor `street`, mens koordinatkilden er det offisielle adressepunktet.

## Hard gate

Ingen koordinat skrives dersom repoets `places:coords:find:address` ikke returnerer ett entydig `verified_candidate` for alle tre adresser.
