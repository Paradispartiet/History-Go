import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
const start = source.indexOf('<div id="placeCard" aria-hidden="true">');
const end = source.indexOf('<footer class="site-footer', start);
assert.ok(start >= 0 && end > start, "PlaceCard DOM exists in index.html");
const placeCard = source.slice(start, end).replace('aria-hidden="true"', 'aria-hidden="false"');
const fixture = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css">
<style>body{margin:0;background:#000;color:white;font-family:system-ui}</style>
</head><body class="hg-app hg-phone">
${placeCard}
<script>
  document.getElementById("placeCard").classList.add("is-open");
  document.getElementById("pcTitle").textContent = "Teststed";
  document.getElementById("pcDesc").textContent = "Historisk beskrivelse";
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="#678"/></svg>';
  document.getElementById("pcHeaderImage").src = "data:image/svg+xml," + encodeURIComponent(svg);
  document.getElementById("pcHeaderHero").classList.add("has-photo-source", "has-image");
  for (const [index, round] of [...document.querySelectorAll(".pc-icons-quad .pc-round")].entries()) {
    round.hidden = false;
    round.textContent = String(index + 1);
  }
</script></body></html>`;

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/__audit__/placecard.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture);
    return;
  }
  if (pathname !== "/css/placeCard.css") {
    response.writeHead(404); response.end("not found"); return;
  }
  response.writeHead(200, { "content-type": "text/css; charset=utf-8" });
  response.end(fs.readFileSync(path.join(root, "css/placeCard.css")));
});

const rect = element => {
  const { x, y, width, height, right, bottom } = element.getBoundingClientRect();
  return { x, y, width, height, right, bottom };
};

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  for (const width of [320, 390, 900]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`http://127.0.0.1:${port}/__audit__/placecard.html`, { waitUntil: "load" });
    if (width > 600) {
      await page.locator("body").evaluate(body => body.classList.remove("hg-phone"));
    }
    const result = await page.evaluate(() => {
      const get = selector => {
        const { x, y, width, height, right, bottom } = document.querySelector(selector).getBoundingClientRect();
        return { x, y, width, height, right, bottom };
      };
      const rounds = [...document.querySelectorAll(".pc-icons-quad .pc-round")].map(node => {
        const { x, y, width, height, right, bottom } = node.getBoundingClientRect();
        return { x, y, width, height, right, bottom };
      });
      return {
        card: get(".pc-frontcard"),
        grid: get(".pc-grid"),
        side: get(".pc-icons-quad"),
        events: get(".pc-events-quad"),
        heading: get("#pcHeaderHero"),
        headingImage: get("#pcHeaderImage"),
        title: get("#pcTitle"),
        rounds,
        objectFit: getComputedStyle(document.getElementById("pcHeaderImage")).objectFit
      };
    });
    const { card, grid, side, events, heading, headingImage, title, rounds } = result;
    assert.equal(rounds.length, 12);
    assert.ok(Math.abs(card.width / card.height - 0.75) < 0.02, `portrait frontImage at ${width}`);
    assert.ok(Math.abs(side.width / side.height - 0.75) < 0.02, `portrait round grid at ${width}`);
    assert.ok(Math.abs(card.y - side.y) < 2 && Math.abs(card.height - side.height) < 2, `aligned media at ${width}`);
    assert.ok(side.x >= card.right && side.right <= grid.right + 2, `circles next to image at ${width}`);
    assert.ok(events.y >= Math.max(card.bottom, side.bottom) - 1, `events below media at ${width}`);
    assert.ok(rounds.every(round => round.x >= side.x - 1 && round.right <= side.right + 1
      && round.y >= side.y - 1 && round.bottom <= side.bottom + 1), `no round overflow at ${width}`);
    assert.ok(rounds.every(round => Math.abs(round.width - round.height) < 2), `round aspect at ${width}`);
    assert.equal(new Set(rounds.map(round => Math.round(round.y))).size, 4, `four round rows at ${width}`);
    assert.ok(headingImage.width >= title.width && title.y >= heading.y, `heading over landscape image at ${width}`);
    assert.equal(result.objectFit, "cover");
    await page.locator("#pcHeaderHero").evaluate(hero => hero.classList.remove("has-photo-source", "has-image"));
    const noPhotoHeight = await page.locator("#pcHeaderHero").evaluate(hero => hero.getBoundingClientRect().height);
    assert.ok(noPhotoHeight < heading.height, `missing image leaves no blank hero at ${width}`);
  }
  console.log("PlaceCard portrait grid and landscape heading browser audit OK");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
