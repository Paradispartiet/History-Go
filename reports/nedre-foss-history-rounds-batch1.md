# Nedre Foss – history rounds batch 1

Dato: 2026-07-19

## Avgrensning

Batchen materialiserer de ni kanoniske historierundingene for `nedre_foss` uten å endre koordinat, radius eller coordinate-source metadata. Koordinatkontroll tilhører den separate Oslo-koordinat-workstreamen.

## Kildegrunnlag

- Oslo kommune, **Nedre Foss park**.
- Oslo byleksikon, **Foss gård**.
- Oslo byleksikon, **Nedre Foss park**.
- Industrimuseum, **Akerselva Digitalt**.
- Store norske leksikon, **Friedrich Grüner**.
- Lokalhistoriewiki, **Nedre Foss mølle**.

## Databeslutninger

- `year` settes til `1220`, som første dokumenterte omtale av kvernstedet. Årstallet beskriver ikke fossens alder.
- En kvern under Hovedøya kloster dokumenteres som middelalderlaget; Oslo kommune beskriver etablering av møllevirksomheten mellom 1148 og 1200.
- Kongens mølle, Friedrich Grüners kjøp i 1672 og mølledrift fram til 1985 bygges inn som dokumenterte tidslag.
- Friedrich Grüner opprettes som canonical person med `nedre_foss` som konkret fysisk eierskapsanker.
- Nedre Foss gård behandles som et separat bygningslag og skal ikke forveksles med fossen.
- Vulkan behandles som et separat nabosted og transformasjonsområde.
- Nature-rundingen bruker foss, laksetrapp, regnbed og offentlig elverom. Ingen udokumenterte artslister legges til.
- Moderne virksomheter og restauranter rundt området hardkodes ikke.

## Rundinger

Canonical `historie`-profil:

1. Personer
2. Verk
3. Merker
4. Før / nå
5. Civication
6. Aktører
7. Natur
8. Fortellinger
9. Leksikon

## Akerselva split-sikkerhet

Hele Akerselva-ruten skal **ikke** splittes på nytt fra den eldre aggregate-filen. Kun disse route-elementene skal oppdateres:

- `nedre_foss.json`
- Nedre Foss-raden i route index
- Nedre Foss-radens hash i split-manifestet

Ingen andre Akerselva-place-filer skal endres.

## Koordinatgrense

Batchen beholder dagens koordinater urørt. Eventuell korrigering skal skje gjennom den dedikerte koordinatkontrollen med koordinatbevis og egen audit, ikke som en sideeffekt av rundingsarbeidet.
