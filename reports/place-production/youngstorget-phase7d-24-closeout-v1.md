# Youngstorget fase 7D–24 – closeout

Dette closeout-dokumentet supplerer de tidligere mergede leveransene gjennom fase 7C og følger de to autoritative produksjonschecklistene i HG Data/Kilder.

## Levert innhold

- reelt før/etter-par fra 1939 og 2025 med sammenlignbar hovedakse, rettighetsinformasjon og tydelige slutningsgrenser;
- hovedleksikon med ti kronologipunkter, fakta, kilder og tre tolkningsflater;
- tre aktuelle 2026-notiser og tre åpne lesespor;
- tre stedsspesifikke Språkleksikon-oppføringer;
- fast PlaceCard-profil med People, Objects, Brands og Related;
- fire direkte People, fire fysiske Objects og fem canonicale relaterte steder;
- ærlig Brands-tomtilstand etter konkret kandidat- og logoaudit, også i legacy `actors_by_place`-flaten;
- rich Quiz med fem sett à sju spørsmål, 35 eksternt kildebårne claims og canonical Knowledge/Aha-lenker;
- full engelsk, spansk og portugisisk oversettelse av `desc` og hele `popupDesc`;
- synkroniserte place index- og place-open-pakker.

## Ikke oppdiktet

- Ingen bilder brukes som collection eller reserve.
- Ingen nabovirksomhet brukes som Brand.
- Ingen person kobles synlig på generell sentrumstilknytning eller politisk nærhet.
- Ingen historisk rute opprettes med uløste stopp.
- Ingen synlig nullverdi erstatter manglende canonicalt innhold.
- Ingen ny dialektoppføring lages for et enkelt torg.

## Verifisering før PR

- schema-/fagverk-/People-/Stories-/Leksikon-/indeksporter: bestått;
- quiz manifest, produksjonskontekst, progresjon og theory binding: bestått;
- Knowledge canonical audit: 0 feil og 0 Youngstorget-advarsler;
- relevant Node-testpakke: 61 bestått, 0 feil, 1 browser-skip;
- PlaceHealth: 0 repo-feil; eksisterende warnings utenfor Youngstorget-scope;
- den eksisterende repo-baseline-testen `historical-routes` feiler uavhengig av leveransen fordi `main` har et uløst `middelalder_oslo`-stopp; Youngstorget-rutedata er ikke endret;
- PlaceCard-guardtesten er reparert uten å svekke porten: samme loaderkrav valideres whitespace-tolerant mot minifisert runtime.

## Slutt-QA og kvalitetsport

- desktop-preview 1363×936: eksakt fire samlingsflater, separat Badge-felt, tydelig Quiz, rik popup og ingen horisontal overflow;
- registrert Chrome-regresjon: 1100×760 og 390×844 bestått, inkludert fire samlingsflater, separat Badge, prominent Quiz og overflow-kontroll; `skipped 0` i CI;
- PR #5316: 62 av 62 workflow-kjøringer grønne på head `6ae5dcd0f`, inkludert Data checks og Repository hygiene;
- seksdimensjonal kvalitetsvurdering: korrekthet/evidens 5, dekning/ferdigstillelse 5, faglig/redaksjonell kvalitet 5, teknisk integritet 5, sikkerhet/ansvarlighet 4 og vedlikeholdbarhet/etterprøvbarhet 5; **29/30**, 0 kritiske avvik og 0 uløste blokkere.

Leveransen er klar for merge. Endelig fase-24-verifisering fullføres ved å lese tilbake PR-status og `main`-ref etter GitHub-mergen.
