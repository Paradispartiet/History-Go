const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function createHarness({ hasQuiz = true } = {}) {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "js", "ui", "person-popup-v2.js"),
    "utf8"
  );

  const captured = { html: "", extraClass: "", quizTarget: "" };
  const mediaClasses = new Set(["is-missing"]);
  const imageListeners = {};
  const image = {
    hidden: true,
    src: "",
    addEventListener(name, fn) { imageListeners[name] = fn; },
    removeAttribute(name) { if (name === "src") this.src = ""; }
  };
  const media = {
    classList: {
      add(...names) { names.forEach(name => mediaClasses.add(name)); },
      remove(...names) { names.forEach(name => mediaClasses.delete(name)); }
    }
  };
  const quizButton = {
    hidden: true,
    isConnected: true,
    removed: false,
    remove() { this.removed = true; }
  };
  const popup = {
    querySelector(selector) {
      if (selector === "[data-person-hero-media]") return media;
      if (selector === "[data-person-hero-image]") return image;
      if (selector === "[data-person-quiz]") return quizButton;
      return null;
    }
  };

  const document = {
    querySelector(selector) {
      return selector === ".hg-popup.person-popup-v2" ? popup : null;
    }
  };

  const window = {
    showPersonPopup() {},
    makePopup(html, extraClass) {
      captured.html = html;
      captured.extraClass = extraClass;
    },
    enhanceQuizButton(button, targetId) {
      assert.equal(button, quizButton);
      captured.quizTarget = targetId;
    },
    getPlacesForPerson() {
      return [{
        id: "stensparken",
        name: "Stensparken",
        category: "by",
        locatorType: "park",
        desc: "En høydepark i Oslo."
      }];
    },
    getRelationsForPerson() { return []; },
    filterCuratedRels(value) { return value; },
    getObservationsForTarget() { return []; },
    hasCompletedQuiz() { return false; },
    HGStories: { getByPerson() { return []; } },
    HGReads: { recordPerson() {}, recordStory() {} },
    QuizEngine: {
      async getTargetSummary() { return { hasAny: hasQuiz }; }
    },
    setInterval(fn) { fn(); return 1; },
    clearInterval() {}
  };

  vm.runInNewContext(source, { window, document, Intl, URL, console });
  return { window, captured, quizButton, mediaClasses, image };
}

test("renders all structured profile sections when the person has rich data", async () => {
  const { window, captured, quizButton } = createHarness({ hasQuiz: true });

  window.showPersonPopup({
    id: "rich_person",
    name: "Rik Person",
    initials: "RP",
    category: "kunst",
    kindLabel: "Billedhugger / offentlig kunst",
    desc: "Kort ingress om personen.",
    popupDesc: "Første biografiske avsnitt.\n\nAndre biografiske avsnitt.",
    birth_date: "1945-12-15",
    birth_place: "Oslo",
    active_place: "Nittedal",
    year: 1991,
    education: ["Statens håndverks- og kunstindustriskole"],
    materials: ["stein", "bronse"],
    themes: ["offentlig kunst", "minnekultur"],
    works: [
      { title: "Et offentlig verk", year: 1991, material: "granitt", summary: "Et konkret bidrag i byrommet." }
    ],
    externalLinks: [
      { label: "Store norske leksikon", url: "https://snl.no/eksempel" }
    ]
  });
  await new Promise(resolve => setImmediate(resolve));

  assert.match(captured.html, /Rik Person/);
  assert.match(captured.html, /Om personen/);
  assert.match(captured.html, /Verk og bidrag/);
  assert.match(captured.html, /Statens håndverks- og kunstindustriskole/);
  assert.match(captured.html, /Stein/);
  assert.match(captured.html, /Stensparken/);
  assert.match(captured.html, /Kilder og videre lesning/);
  assert.match(captured.html, /Portrett ikke registrert/);
  assert.match(captured.html, /hg-person-quiz-btn/);
  assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  assert.equal(captured.extraClass, "person-popup person-popup-v2");
  assert.equal(captured.quizTarget, "rich_person");
  assert.equal(quizButton.hidden, false);
});

test("renders the enriched Kjersti profile without requiring a portrait", async () => {
  const { window, captured } = createHarness({ hasQuiz: true });
  const people = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "data", "people", "kunst", "oslo", "people_kunst_oslo.json"),
    "utf8"
  ));
  const person = people.find(item => item.id === "kjersti_wexelsen_goksoyr");
  assert.ok(person);

  window.showPersonPopup(person);
  await new Promise(resolve => setImmediate(resolve));

  assert.match(captured.html, /Kjersti Wexelsen Goksøyr/);
  assert.match(captured.html, /Billedhugger \/ offentlig kunst/);
  assert.match(captured.html, /15\. desember 1945/);
  assert.match(captured.html, /Nittedal/);
  assert.match(captured.html, /Om personen/);
  assert.match(captured.html, /Verk og bidrag/);
  assert.match(captured.html, /Sigrid Undset-monumentet/);
  assert.match(captured.html, /Utdanning/);
  assert.match(captured.html, /Materialer/);
  assert.match(captured.html, /Stensparken/);
  assert.match(captured.html, /Kilder og videre lesning/);
  assert.match(captured.html, /Portrett ikke registrert/);
  assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
});

test("renders the four Stensparken people as rich profiles", async () => {
  const targets = [
    ["data/people/litteratur/oslo/people_litteratur_oslo.json", "sigrid_undset"],
    ["data/people/by/oslo/people_by_oslo.json", "harald_aars"],
    ["data/people/by/oslo/people_by_oslo.json", "hagbarth_schytte_berg"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "per_barclay"]
  ];

  for (const [relativePath, personId] of targets) {
    const { window, captured } = createHarness({ hasQuiz: true });
    const people = JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
    const person = people.find(item => item.id === personId);
    assert.ok(person, personId);

    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));

    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, /Stensparken/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

test("renders the second Stensparken batch as rich people profiles", async () => {
  const targets = [
    ["data/people/kunst/oslo/people_kunst_oslo.json", "jo_visdal"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "lars_utne"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "miksa_roth"],
    ["data/people/historie/oslo/people_historie_oslo.json", "jens_bjelke"]
  ];

  for (const [relativePath, personId] of targets) {
    const { window, captured } = createHarness({ hasQuiz: true });
    const people = JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
    const person = people.find(item => item.id === personId);
    assert.ok(person, personId);

    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));

    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, /Stensparken/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

test("renders the Oslo rådhus core people as rich profiles", async () => {
  const targets = [
    ["data/people/by/oslo/people_by_oslo.json", "arnstein_arneberg"],
    ["data/people/by/oslo/people_by_oslo.json", "magnus_poulsson"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "alf_rolfsen"],
    ["data/people/kunst/oslo/people_kunst_oslo.json", "henrik_sorensen"]
  ];
  for (const [relativePath, personId] of targets) {
    const { window, captured } = createHarness({ hasQuiz: true });
    const people = JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
    const person = people.find(item => item.id === personId);
    assert.ok(person, personId);
    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, /Oslo rådhus/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

test("renders the Rådhus political batch and the corrected Kirsten Sand profile", async () => {
  const targets = [
    ["data/people/by/oslo/people_by_oslo.json", "albert_nordengen", /Oslo rådhus|Rådhusplassen/],
    ["data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", "rolf_stranger", /Oslo rådhus/],
    ["data/people/politikk/oslo/people_politikk_oslo.json", "haakon_vii", /Oslo rådhus/],
    ["data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", "halvdan_eyvind_stokke", /Oslo rådhus/],
    ["data/people/by/oslo/people_by_oslo.json", "kirsten_sand", /Gjenreisingen av Nord-Troms/]
  ];
  for (const [relativePath, personId, expected] of targets) {
    const { window, captured } = createHarness({ hasQuiz: true });
    const people = JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
    const person = people.find(item => item.id === personId);
    assert.ok(person, personId);
    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, expected);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});

test("renders the Rådhus political and municipal profiles with contributions and sources", async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/people/manifest.json"), "utf8"));
  const all = [];
  for (const relative of manifest.files) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", relative), "utf8"));
    all.push(...(Array.isArray(data) ? data : [data]));
  }
  const people = [
    all.find(item => item.id === "albert_nordengen"),
    all.find(item => item.id === "rolf_stranger"),
    all.find(item => item.name === "Halvdan Eyvind Stokke"),
    all.find(item => item.id === "haakon_vii"),
    all.find(item => item.id === "kirsten_sand")
  ];
  for (const person of people) {
    assert.ok(person, "missing profile");
    const { window, captured } = createHarness({ hasQuiz: true });
    window.showPersonPopup(person);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(captured.html, new RegExp(person.name));
    assert.match(captured.html, /Verk og bidrag/);
    assert.match(captured.html, /Kilder og videre lesning/);
    assert.doesNotMatch(captured.html, /Ingen registrerte verk/);
  }
});


test("deduplicates source URLs and keeps the named external-link label", async () => {
  const { window, captured } = createHarness({ hasQuiz: false });
  window.showPersonPopup({
    id: "source_person",
    name: "Kildeperson",
    popupDesc: "Biografi.",
    externalLinks: [
      { label: "Sceneweb – Kildeperson", url: "https://sceneweb.no/nb/artist/1/Kildeperson" }
    ],
    source_urls: [
      "https://sceneweb.no/nb/artist/1/Kildeperson",
      "https://snl.no/Kildeperson"
    ]
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((captured.html.match(/https:\/\/sceneweb\.no\/nb\/artist\/1\/Kildeperson/g) || []).length, 1);
  assert.match(captured.html, />Sceneweb – Kildeperson</);
  assert.doesNotMatch(captured.html, />sceneweb\.no</);
  assert.match(captured.html, />snl\.no</);
});

test("removes quiz action and empty sections when data is absent", async () => {
  const { window, captured, quizButton } = createHarness({ hasQuiz: false });

  window.showPersonPopup({
    id: "plain_person",
    name: "Plain Person",
    desc: "Kort tekst.",
    popupDesc: "Lang tekst."
  });
  await new Promise(resolve => setImmediate(resolve));

  assert.match(captured.html, /Om personen/);
  assert.doesNotMatch(captured.html, /Verk og bidrag/);
  assert.doesNotMatch(captured.html, /Utdanning/);
  assert.doesNotMatch(captured.html, /Materialer/);
  assert.doesNotMatch(captured.html, /Kilder og videre lesning/);
  assert.doesNotMatch(captured.html, /Observasjoner/);
  assert.equal(quizButton.removed, true);
});

test("dedicated CSS keeps the popup inset and the quiz compact", () => {
  const css = fs.readFileSync(
    path.join(__dirname, "..", "css", "person-popup-v2.css"),
    "utf8"
  );

  assert.match(css, /padding:\s*clamp\(18px, 4vw, 48px\)/);
  assert.match(css, /width:\s*min\(820px, calc\(100vw - 64px\)\)/);
  assert.match(css, /hg-person-quiz-btn\.hg-quiz-btn\{[\s\S]*?width:\s*auto/);
  assert.doesNotMatch(css, /hg-person-quiz-btn\.hg-quiz-btn\{[\s\S]*?background:\s*#FFD600/);
});
