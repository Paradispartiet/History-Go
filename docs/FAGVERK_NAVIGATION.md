# Fagverket – navigasjon og sideroller

Status: canonical navigasjonskontrakt v1
Forside: `fagverk-forside.html`
Register: `data/fagverk/fagverk_portal.json`
Produksjon og ferdigstilling: [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md)

Denne filen eier bare navigasjon, adresser og sideroller. Den generelle motoren, statusmodellen, claims, reviews og ferdigkriteriene eies av fagsidekontrakten.

## Hovedregel

Headerens **Fagverket**-valg skal aldri gå direkte til ett bestemt fag. Det åpner den felles fagverkforsiden.

Hvert fagområde presenteres med to adskilte roller:

1. **Merket** – poeng, nivåer, undermerker, quizprogresjon og steder.
2. **Faget** – pensum, fagområder, emner, metoder og sammenhengende lærestoff.

Merkesiden og fagsiden skal ha forskjellige adresser og tydelige navigasjonsnavn. En side skal ikke omtales som «fagverket» bare fordi den lenker videre til faglig innhold.

## Politikk

- Merkeside: `data/fag/politikk/merke_politikk.html`
- Fagside: `fagverk.html?subject=politikk`

Politikkmerket kan vise oversikter over fagområder og emneprogresjon, men selve lærestoffet eies av fagsiden.

## Portalregisteret

`fagverk_portal.json` følger rekkefølgen i `data/categories/category_contract.json` og eier bare navigasjonsmål og materialiseringsstatus.

- `badgePage` må alltid peke til en eksisterende merkeside.
- `subjectPage` settes bare når en egen fagside er materialisert.
- `subjectStatus: "planned"` skal vises som ikke-klikkbar status, aldri som en lenke til en feilside.

Canonical fagdata, merker, emner og kapitler eies fortsatt av sine eksisterende kilder.
