# Oslo – geografisk avgrenset By-merke

Det godkjente bildet er et Oslo-merke, **ikke** et generisk By & arkitektur-merke.
Bildefil: `bilder/merker/by/oslo-brodert-v1.webp`.

Kartets By-merke velges etter `sourceFile` i stedsdata: bare kategori `by` og stier under `places/by/oslo/` får Oslo-bildet. By-steder utenfor Oslo beholder kategoribildet fra `data/badges/by.json`. Oslo-bildet kan ikke velges bare på grunnlag av kartkoordinater eller stedets navn.

Kategorifarge `#808080` og sekundærfarge `#404040` er bevart. Det globale `by-brodert-v6.webp` og de eksisterende undermerkene endres ikke.

Test: `node --test tests/oslo-city-badge-routing.test.mjs`.
