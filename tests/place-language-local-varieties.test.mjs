import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));
const text = value => String(value == null ? "" : value).trim();

const data = json("data/leksikon/sprak/norge_local_varieties_v1.json");
const schema = json("data/leksikon/sprak/local_varieties_schema_v1.json");
const manifest = json("data/leksikon/sprak/manifest.json");

test("makroområdene er eksplisitt orientering og ikke fire enkeltstående dialekter", () => {
  assert.equal(data.schema, "history_go_language_local_varieties_v1");
  assert.match(data.notes, /hovedområdene[^.]*bare[^.]*orienteringsområder/i);
  assert.match(data.notes, /aldri[^.]*én dialekt/i);

  assert.deepEqual(Object.keys(data.macro_labels).sort(), ["austlandsk", "nordnorsk", "trondersk", "vestlandsk"]);
  for (const label of Object.values(data.macro_labels)) {
    assert.match(label, /dialektområder$/i, `${label}: makronivået skal stå i flertall som dialektområder`);
  }
});

test("de første lokale talemålsprofilene er separate canonical profiler", () => {
  const byName = new Map((data.profiles || []).map(profile => [profile.name, profile]));
  const required = ["Oslo", "Fredrikstad", "Lillehammer", "Arendal", "Kristiansand", "Stavanger", "Haugesund", "Bergen"];

  for (const name of required) {
    const profile = byName.get(name);
    assert.ok(profile, `mangler lokal talemålsprofil for ${name}`);
    assert.equal(profile.kind, "local_speech", `${name}: feil profiltype`);
    assert.ok(text(profile.variation_note), `${name}: intern variasjon må være eksplisitt`);
  }

  assert.notEqual(byName.get("Arendal").id, byName.get("Kristiansand").id);
  assert.notEqual(byName.get("Stavanger").id, byName.get("Haugesund").id);
  assert.notEqual(byName.get("Haugesund").id, byName.get("Bergen").id);
  assert.notEqual(byName.get("Oslo").id, byName.get("Fredrikstad").id);
  assert.notEqual(byName.get("Fredrikstad").id, byName.get("Lillehammer").id);
});

test("research-gjenstående profiler får ikke konstruerte lokale kjennetegn", () => {
  const unresolved = (data.profiles || []).filter(profile => profile.profile_status === "local_research_required");
  assert.ok(unresolved.length >= 1, "testen trenger minst én research-gjenstående profil");

  for (const profile of unresolved) {
    assert.deepEqual(profile.feature_labels, [], `${profile.name}: lokale trekk må holdes tilbake til kildearbeidet er gjort`);
    assert.ok(Array.isArray(profile.research_leads) && profile.research_leads.length >= 1, `${profile.name}: research-sporet må være eksplisitt`);
    for (const source of profile.research_leads) {
      assert.match(String(source?.url || ""), /^https:\/\//, `${profile.name}: researchkilde må være HTTPS`);
    }
  }
});

test("lokalt talemålslag er registrert og har eget schema", () => {
  assert.equal(manifest.local_varieties, "data/leksikon/sprak/norge_local_varieties_v1.json");
  assert.equal(manifest.local_varieties_schema, "data/leksikon/sprak/local_varieties_schema_v1.json");
  assert.equal(schema.properties.profiles.minItems, 8);
  assert.deepEqual(schema.properties.profiles.items.properties.profile_status.enum, ["documented_seed", "local_research_required"]);
});

test("runtimeutvidelsen relabeler makronivået og viser lokale profiler", () => {
  const runtime = read("js/ui/place-language-local-varieties.js");
  const index = read("index.html");
  const css = read("css/place-language-local-varieties.css");

  assert.match(runtime, /norge_local_varieties_v1\.json/);
  assert.match(runtime, /Lokale talemål/);
  assert.match(runtime, /grove dialektologiske orienteringsområder/);
  assert.match(runtime, /De er ikke én dialekt hver/);
  assert.match(runtime, /data-hg-local-variety/);
  assert.match(runtime, /Regionale orienteringssoner/);
  assert.match(index, /js\/ui\/place-language-local-varieties\.js/);
  assert.match(css, /hg-language-local-variety/);
});
