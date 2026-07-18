# Atlas Obscura Oslo Wonderkammer batch 9

## Representation

Two Atlas Obscura entries are modeled as `actual_site_treasure` Wonderkammer chambers rather than new canonical map places:

- Edvard Munch's grave → `var_frelsers_gravlund`
- The Scream View → `ekebergparken`

## Edvard Munch's grave

Oslo kommune describes Vår Frelsers gravlund as a major cultural-historical monument and explicitly states that Munch, Henrik Ibsen and Bjørnstjerne Bjørnson are buried only a few metres apart. VisitOSLO identifies Munch among the well-known people buried in Æreslunden.

The Wonderkammer entry treats the grave as a real grave and cultural-historical memorial, not as a celebrity attraction.

## The Scream viewpoint

Ekebergparken documents the permanent steel frame at the viewpoint used for Marina Abramović's 2013 participatory work `The Scream`. The park also makes the historical uncertainty explicit: we cannot know exactly where Munch stood or whether the painting directly reproduces the Oslofjord view, although the Ekeberg landscape has a strong documented association with the motif.

The Wonderkammer entry preserves this uncertainty instead of presenting the viewpoint as Munch's proven exact location.

## Runtime rule

The batch is registered as a separate Wonderkammer source. The existing boot merger appends chambers sharing a parent `place_id`, so the new entries extend rather than replace the current Vår Frelsers gravlund and Ekebergparken Wonderkammer content.
