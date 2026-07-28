# Fagverkets stedssider – kategoridesign og bildekontrakt

Status: canonical v1.1
Data: `data/fagverk/category_place_design.json`
Runtime: `js/fagverk-place-theme.js`
Design: `css/fagverk-place-category-themes.css`
Audit: `scripts/audit-place-images.mjs`
Materialisert status: `data/places/place_image_backlog_summary.json`
Overordnet fagsideproduksjon: [`FAGVERK_SUBJECT_PAGE_CONTRACT.md`](./FAGVERK_SUBJECT_PAGE_CONTRACT.md)

Denne kontrakten gjelder stedets fagverksider. Den eier ikke den generelle fagsiden for et helt fag.

## Grunnregel

Alle fagverksider for steder bruker den samme semantiske grunnstrukturen. Kategori eller badge skal ikke opprette parallelle HTML-maler. Kategorien leverer i stedet en kontrollert designinstruks som endrer:

- hovedfarge og sekundærfarge;
- overflate og bakgrunnsglød;
- tittelkarakter;
- dokumentarisk bildebehandling;
- hvilke innholdsblokker som prioriteres;
- hvilken type bilde som faktisk representerer stedet.

Dette gir særpreg uten å bryte navigasjon, tilgjengelighet, lenker eller datamodell.

## Designprofiler og aliaser

Kontrakten har egne profiler for:

`by`, `historie`, `kunst`, `scenekunst`, `litteratur`, `musikk`, `naeringsliv`, `natur`, `politikk`, `popkultur`, `psykologi`, `religion`, `sport`, `subkultur` og `vitenskap`.

Legacy-ID-ene `media`, `film_tv`, `film` og `populaerkultur` bruker den eksplisitte profilen `popkultur`. Nye aliaser skal aldri opprettes implisitt i runtime.

## Eksempler på forskjeller

- **Historie** bruker redaksjonell serif, kjølig indigo og bronse, dokumentarisk nåtidsbilde og prioriterer kronologi, brudd, aktører og spor.
- **Natur** bruker grønt og jordtoner, sann fargegjengivelse og prioriterer naturtype, arter, sesong og forvaltning.
- **Politikk** bruker fiolett og gull, institusjonell typografi og prioriterer makt, beslutning, offentlighet og rett.
- **Musikk** bruker sceneorientert displaytypografi, rosa/blå aksent og prioriterer scene, lyd, produksjon og publikum.
- **Scenekunst** prioriterer scene, rom, framføring, institusjon og publikum.
- **Religion og livssyn** prioriterer sted, ritual, fellesskap, arkitektur og mangfold.
- **Næringsliv** bruker industriell typografi, oransje/stål og prioriterer produksjon, arbeid, eierskap og infrastruktur.
- **Subkultur** bruker gateorientert displaytypografi og dokumentariske nærbilder av reelle møtesteder, skilt og rom.

Instruksene er redaksjonelle rammer. De skal ikke gjøre alle steder i samme kategori visuelt identiske.

## Obligatorisk stedsbilde

Alle aktive canonicale steder skal ha minst ett gyldig bilde gjennom denne prioriteten:

1. `popupImage`
2. `cardImage`
3. `image`

Et bilde teller bare når det:

- viser det canonicale stedet eller den faktiske stedskonteksten;
- er en eksisterende lokal fil eller en gyldig inspectable `http`/`https`-ressurs;
- ikke er en data-URL, blob, gradient, kategoriillustrasjon eller logo brukt som erstatning;
- følger kategoriens `imageDirection`.

Logo, bokomslag, filmplakat, artistportrett, politikerportrett, artsportrett eller produktfoto kan være supplerende materiale, men teller ikke alene som stedsbilde.

Mål for nye bilder er landskapsformat, helst 16:9 eller 4:3 og omtrent 1200 piksler eller mer i bredde. Dette er et kvalitetsmål, ikke en grunn til å avvise et ellers viktig og lovlig dokumentasjonsbilde.

## Målt utgangspunkt 28. juli 2026

Full-repo-auditen fant:

- 1431 aktive steder;
- 51 gyldige lokale bildepekere;
- 0 eksterne bildepekere;
- 1343 steder uten bildefelt;
- 37 steder med lokal bildepeker til en fil som ikke finnes;
- 1380 steder som gjenstår før full bildeport kan slås på.

Dette er materialisert i `data/places/place_image_backlog_summary.json`. Summaryen verifiseres mot en ny full audit i CI og kan derfor ikke bli stående med gamle tall når bildebatcher merges.

## Audit og overgang

Full audit og rapport:

```bash
node scripts/audit-place-images.mjs \
  --mode=all \
  --report=reports/place-image-audit.json \
  --verify-summary=data/places/place_image_backlog_summary.json
```

Den rapporterer:

- lokale gyldige bilder;
- eksterne gyldige bildepekere;
- steder uten bilde;
- ugyldige eller manglende lokale filer;
- status per kategori;
- alle place-ID-er som inngår i produksjonskøen.

Hard kontroll for nye og endrede steder:

```bash
node scripts/audit-place-images.mjs --mode=changed
```

Et nytt eller endret sted kan ikke merges uten gyldig bilde. Hele eksisterende etterslep skal fylles i kontrollerte produksjonsbatcher. Når rapporten når null mangler og null ugyldige, skal full-repo-kontrollen kjøres med `--strict`.

Prioritert produksjonsrekkefølge:

1. reparer de 37 ugyldige lokale bildepekerne;
2. fyll politikksteder og steder som allerede har egne fagverksider;
3. fyll steder med ferdig `popupDesc` men uten bilde;
4. ta natur og scenekunst som egne kategoribatcher;
5. fullfør resten etter kilde- og rettighetsgrunnlag.

## Runtime ved manglende bilde

Manglende bilde skal aldri skjules bak en dekorativ placeholder. I overgangsperioden:

- den tomme høyrekolonnen fjernes;
- heroen blir én kolonne;
- siden merkes internt med `data-place-has-image="0"`;
- designet viser at bilde er et produksjonskrav.

Dette er bare en ærlig visningsfallback. Stedet regnes fortsatt som uferdig inntil et reelt bilde er lagt inn.
