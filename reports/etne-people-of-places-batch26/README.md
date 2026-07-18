# Etne People of Places batch 26 — Øyvind Gvein ved Stordalsvatnet

## Resultat

Batchen legg til éin namngjeven geolog med ei eksplisitt stadfesta feltundersøking ved `stordalsvatnet_etne`:

- `oyvind_gvein`

## Kjeldegrunnlag

NGU fører Øyvind Gvein som forfattar av rapporten `Geologisk undersøkelse av gabbro, Etne, Hordaland fylke` frå 1965.

Rapportsamandraget beskriv oppdraget som ei befaring og seier eksplisitt at gabbrobergartar ved Ramsvik i vestenden av Stordalsvatnet vart undersøkte, saman med fleire andre lokalitetar i Etne. Undersøkinga vurderte om berggrunnen kunne eigne seg til bygningsstein.

NVE stadfestar Stordalsvatnet som den største innsjøen i det verna Etnevassdraget.

Kjelder:
- https://www.ngu.no/publikasjon/geologisk-undersokelse-av-gabbro-etne-hordaland-fylke
- https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/041-1-etnevassdraget/

## Fysisk people-port

Koplinga byggjer på den konkrete geologiske feltbefaringa ved Ramsvik i vestenden av innsjøen, ikkje berre på at Gvein skreiv generelt om geologi i Etne.

Kortet er avgrensa:

- Gvein blir ikkje framstilt som limnolog eller fiskeforskar.
- Han blir ikkje kreditert for kartlegging av heile Stordalsvatnet.
- Rapporten undersøkte fleire gabbrolokalitetar i Etne, og people-koplinga er avgrensa til den eksplisitt nemnde Stordalsvatnet-lokaliteten.
- `year: 1965` følgjer utgivingsåret for den dokumenterte geologiske undersøkinga.

## Duplikatport

Før skriving vart fersk repo-state søkt etter:

- `oyvind_gvein`
- `Øyvind Gvein`

Ingen eksisterande canonical people-identitet vart funnen, og ingen parallell Etne People of Places batch 26 vart funnen.

## Kategori

`category: natur` følgjer det canonical place-et `stordalsvatnet_etne`. People-koplinga viser eit geologisk naturfagleg feltarbeid ved innsjøen.

## Dekning

Etter batch 25 er Etne-dekninga 66 av 81 aktive stader, med 15 udekte. `stordalsvatnet_etne` står framleis på restlista.

Batch 26 skal dekkje eitt nytt fysisk place og gi 67/81 dersom hovudlinja ikkje endrar seg før merge.

## Integrasjonskontrakt

- `people/natur/vestland/etne/people_stordalsvatnet_batch1.json` skal stå nøyaktig éin gong i people-manifestet.
- `oyvind_gvein` skal vere globalt unik ved normalisert ID-, namn- og variantkontroll.
- Personen skal berre peike på `stordalsvatnet_etne`.
- `tests/etne-people-of-places-batch26.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata.
