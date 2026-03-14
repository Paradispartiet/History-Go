(function () {
  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function normalize(text) {
    return asString(text).replace(/\s+/g, " ").trim();
  }

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`Kunne ikke laste ${path}`);
    }
    return res.json();
  }

  async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Kunne ikke hente ${url}`);
    }
    return res.text();
  }

  function splitParagraphs(text) {
    return normalize(text)
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 80);
  }

  function limitBlocks(blocks, max = 20) {
    return blocks.slice(0, max);
  }

  async function collectLocalArchives(entity) {
    const blocks = [];
    const safeLabel = (entity.label || "").toLowerCase().replaceAll(" ", "_");

    const archivePaths = [
      `/data/stories_archives/${entity.id}.json`,
      `/data/stories_archives/${safeLabel}.json`
    ];

    for (const path of archivePaths) {
      try {
        const data = await fetchJson(path);
        const items = ensureArray(data);

        for (const item of items) {
          const text = normalize(item.text);
          if (!text) continue;

          blocks.push({
            source: item.source || "lokal arkivfil",
            text
          });
        }
      } catch (err) {
        // valgfri lokal fil
      }
    }

    return blocks;
  }

  async function collectWikipedia(entity) {
    const blocks = [];
    const title = encodeURIComponent(entity.label);
    const url = `https://no.wikipedia.org/api/rest_v1/page/summary/${title}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data.extract) return [];

      blocks.push({
        source: "Wikipedia",
        text: data.extract
      });
    } catch (err) {
      // nett- / CORS-feil håndteres stille
    }

    return blocks;
  }

  async function collectLocalWiki(entity) {
    const blocks = [];
    const title = encodeURIComponent(entity.label);
    const url = `https://lokalhistoriewiki.no/api.php?action=query&prop=extracts&explaintext=true&format=json&titles=${title}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) return [];

      for (const id in pages) {
        const text = pages[id]?.extract;
        if (!text) continue;

        const paragraphs = splitParagraphs(text);
        for (const paragraph of paragraphs) {
          blocks.push({
            source: "Lokalhistoriewiki",
            text: paragraph
          });
        }
      }
    } catch (err) {
      // nett- / CORS-feil håndteres stille
    }

    return blocks;
  }

  async function collectSNL(entity) {
    const blocks = [];
    const title = encodeURIComponent(entity.label);
    const url = `https://snl.no/api/v1/articles?q=${title}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const items = ensureArray(data?.results);

      for (const item of items) {
        const text = normalize(item?.excerpt);
        if (!text) continue;

        blocks.push({
          source: "Store Norske Leksikon",
          text
        });
      }
    } catch (err) {
      // nett- / CORS-feil håndteres stille
    }

    return blocks;
  }

  async function collectNews(entity) {
    const blocks = [];
    const keywords = [entity.label, ...(entity.aliases || [])];

    for (const keyword of keywords) {
      const query = encodeURIComponent(keyword);
      const url = `https://news.google.com/rss/search?q=${query}`;

      try {
        const xml = await fetchText(url);
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
        const items = doc.querySelectorAll("item");

        items.forEach(item => {
          const title = item.querySelector("title")?.textContent || "";
          const desc = item.querySelector("description")?.textContent || "";
          const text = normalize(`${title}. ${desc}`);

          if (!text) return;

          blocks.push({
            source: "Nyhetsarkiv",
            text
          });
        });
      } catch (err) {
        // nett- / CORS-feil håndteres stille
      }
    }

    return blocks;
  }

  window.HGStorySourceCollector = {
    async collectForEntity(entity, queries = []) {
      let blocks = [];

      blocks = blocks.concat(await collectLocalArchives(entity));
      blocks = blocks.concat(await collectWikipedia(entity));
      blocks = blocks.concat(await collectLocalWiki(entity));
      blocks = blocks.concat(await collectSNL(entity));
      blocks = blocks.concat(await collectNews(entity));

      const clean = blocks
        .map(block => ({
          source: asString(block.source),
          text: normalize(block.text),
          queries
        }))
        .filter(block => block.text.length > 60);

      const unique = [];
      const seen = new Set();

      for (const block of clean) {
        const key = block.text.slice(0, 120);
        if (seen.has(key)) continue;

        seen.add(key);
        unique.push(block);
      }

      return limitBlocks(unique, 40);
    }
  };
})();
