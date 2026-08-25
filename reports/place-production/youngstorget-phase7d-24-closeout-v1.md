# Youngstorget fase 7D–24 – closeout

Dette closeout-dokumentet supplerer de tidligere mergede leveransene gjennom fase 7C og følger de to autoritative produksjonschecklistene i HG Data/Kilder.

## Levert innhold

- reelt før/etter-par fra 1939 og 2025 med sammenlignbar hovedakse, rettighetsinformasjon og tydelige slutningsgrenser;
- hovedleksikon med ti kronologipunkter, fakta, kilder og tre tolkningsflater;
- tre aktuelle 2026-notiser og tre åpne lesespor;
- tre stedsspesifikke Språkleksikon-oppføringer;
- fast PlaceCard-profil med People, Objects, Brands og Related;
- fire direkte People, fire fysiske Objects og fem canonicale relaterte steder;
- ærlig Brands-tomtilstand etter konkret kandidat- og logoaudit;
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

Endelig fase-24-status settes først når preview er kontrollert på mobil og desktop, PR-CI er grønn og GitHub viser merge til `main`.
