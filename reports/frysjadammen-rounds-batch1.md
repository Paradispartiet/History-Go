# Frysjadammen – fullføring av historierundinger, batch 1

Dato: 2026-07-19

## Omfang

Batchen fyller de ni dokumenterte rundingene for historieprofilen ved `frysjadammen`:

1. People
2. Verk
3. Badges
4. Før / nå
5. Civication Store
6. Brands
7. Natur
8. Fortellinger
9. Leksikon

Stedet beholder kategori `historie` med sekundær kategori `natur`. Det legges ikke inn manuell `rounds`- eller `rundinger`-override.

## Stedsavgrensning

`frysjadammen` tolkes i denne batchen som reguleringspunktet ved Maridalsoset, der Maridalsvannet går over i Akerselva. Innholdet gjelder damanlegget, vannrettighetene og den senere kommunale reguleringen av vannføringen.

Stedet blandes ikke sammen med Brekkedammen, Brekke Bruk, Brekke kraftstasjon eller Frysja 33 lenger ned langs elva. Christian Anker og Brekkesagens historie brukes derfor ikke som People- eller fortellingsanker her.

Eksisterende kartdata beholdes uendret:

- koordinat: `59.9723, 10.7819`
- radius: `150`
- `year: 1918`

Årstallet 1918 behandles som eksisterende canonical stedår. Batchen hevder ikke at dette er damanleggets opprinnelige byggeår.

## Kildegrunnlag

- Oslo byleksikon: reguleringshistorien for Akerselva, damstart i 1853, Akerselvens Brugseierforening i 1867, vannrettighetsavtalen i 1876 og kommunal overtakelse i 1952.
- Oslo kommune, Vann- og avløpsetaten: dagens helårs overvåking og regulering av 53 dammer fra et mannskap ved Maridalsvannet.
- Oslo kommune: Maridalsvannet som hoveddrikkevannskilde og restriksjonene som beskytter råvannet.
- Akerselvas Venner: manøvreringsreglementet fra 1995 og avveiningen mellom magasinfylling, drikkevann, flomdemping, minstevannføring og tiltak i elva.

## People

People-rundingen bruker `vannreguleringsmannskapet_maridalsvannet`, et kollektivt kort for det dokumenterte driftsmiljøet i Vann- og avløpsetaten. Kortet er ikke en oppdiktet enkeltperson og er heller ikke ment som en uttømmende ansattliste.

## Innholdsfelter

Stedfilen får:

- fire verifiserte eksterne kilder
- fire kanoniske historie-underbadges
- seks dokumenterte verk/milepæler fra 1853 til dagens drift
- før/nå-profil for skiftet fra industrivann til offentlig flerhensynsforvaltning
- to fysiske, stedsspesifikke Civication-objekter
- fire institusjons- og systemkoblinger i Brands
- naturprofil for det regulerte innsjøutløpet
- tre aktive nærnaturkoblinger

Fortellingen `st_frysjadammen_fra_industriregulering_til_bydrift` legges i den allerede manifestlastede Akerselva-/Nydalsdammen-filen. Den eksisterende Frysjadammen-artikkelen i Oslo-historieleksikonet gjenbrukes som Leksikon-runding.

## Redaksjonelle grenser

- Ingen gjettede personer.
- Ingen gjettede flora- eller faunalister.
- Ingen påstand om at 1918 er byggeår.
- Ingen sammenblanding med Brekke Bruk/Frysja 33.
- Ingen `tasks`, `play` eller `training` for historieprofilen.
- Ingen manuell rundingsoverstyring.
